import { defineStore } from 'pinia';
import { HttpAgent } from '@dfinity/agent';
import { createActor as createActorBackend, canisterId as backendCanisterId } from '../../../declarations/backend';
import { createActor as createActorRoadmap, canisterId as roadmapCanisterId } from '../../../declarations/backend';
import { createActor as createActorMarketplace, canisterId as marketplaceCanisterId } from '../../../declarations/marketplace';
// Import the ledger-specific libraries
import { LedgerCanister } from '@dfinity/nns';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import useAuthStore from './auth.js';

let canisters = {
  cosmicrafts: null,
  roadmap: null,
  marketplace: null,
  ledger: null,
};
let currentIdentity = null;
let initializing = false;

const MANUAL_ENV = 'ic'; // 'ic' for IC, 'local' for local development
const isLocal = MANUAL_ENV === 'local';
const host = isLocal ? 'http://127.0.0.1:8080' : 'https://ic0.app';

console.log(`Environment: ${isLocal ? 'Local Development' : 'IC Production'}`);
console.log(`Host: ${host}`);

export const useCanisterStore = defineStore('canister', {
  state: () => ({
    canisterIds: {
      cosmicrafts: 'opcce-byaaa-aaaak-qcgda-cai',
      roadmap: 'be2us-64aaa-aaaaa-qaabq-cai',
      marketplace: 'br5f7-7uaaa-aaaaa-qaaca-cai',
      ledger: 'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP ledger canister ID
    },
    agent: null,
  }),

  actions: {
    async initializeAgents() {
      const authStore = useAuthStore();
      const identity = authStore.getIdentity();

      if (identity !== currentIdentity || !canisters.cosmicrafts || !canisters.roadmap || !canisters.marketplace) {
        console.log('Initializing HttpAgent...');
        currentIdentity = identity; // Update identity
        initializing = true;

        const agent = new HttpAgent({ identity, host });
        this.agent = agent;

        // Fetch root key for local development
        if (isLocal) {
          console.log('Fetching root key for local development...');
          await agent.fetchRootKey();
        }

        // ✅ Initialize all canisters and log their creation
        canisters.cosmicrafts = createActorBackend(this.canisterIds.cosmicrafts, { agent });
        
        canisters.roadmap = createActorRoadmap(this.canisterIds.roadmap, { agent });
        
        // Initialize marketplace canister
        console.log(`Creating actor for marketplace with ID: ${this.canisterIds.marketplace}`);
        canisters.marketplace = createActorMarketplace(this.canisterIds.marketplace, { agent });
        console.log(`Marketplace actor created:`, canisters.marketplace);
        
        // Initialize ICP ledger canister using the approach from Oisy wallet
        try {
          console.log(`Creating ICP Ledger canister with ID: ${this.canisterIds.ledger}`);
          // Create the ledger canister using the @dfinity/nns library
          canisters.ledger = LedgerCanister.create({
            agent,
            canisterId: Principal.fromText(this.canisterIds.ledger)
          });
          console.log(`Ledger canister created:`, canisters.ledger);
        } catch (error) {
          console.error('Failed to initialize ledger canister:', error);
        }

        initializing = false;
      }
    },
    
    async getIcpBalance(principal) {
      try {
        const ledger = await this.get('ledger');
        if (!ledger) {
          console.error('Ledger canister not initialized');
          return { e8s: BigInt(0) };
        }
        
        // Convert principal to account identifier
        const accountIdentifier = AccountIdentifier.fromPrincipal({
          principal: Principal.fromText(principal)
        });
        
        // Get the balance using Oisy approach
        const balance = await ledger.accountBalance({
          accountIdentifier: accountIdentifier.toUint8Array(),
        });
        
        return balance;
      } catch (error) {
        console.error('Failed to get ICP balance:', error);
        return { e8s: BigInt(0) };
      }
    },
    
    async transferIcp(toAccountId, amountE8s, fromSubAccount = undefined, memo = BigInt(0)) {
      try {
        const ledger = await this.get('ledger');
        if (!ledger) {
          throw new Error('Ledger canister not initialized');
        }
        
        // Based on Oisy wallet implementation
        const result = await ledger.transfer({
          memo,
          amount: { e8s: amountE8s },
          fee: { e8s: BigInt(10000) }, // Standard ICP fee
          from_subaccount: fromSubAccount,
          to: toAccountId,
          created_at_time: undefined
        });
        
        if ('Err' in result) {
          throw new Error(`Transfer failed: ${JSON.stringify(result.Err)}`);
        }
        
        return { success: true, blockHeight: result.Ok };
      } catch (error) {
        console.error('Failed to transfer ICP:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Convert a principal to an account identifier
    principalToAccountIdentifier(principal, subaccount = undefined) {
      return AccountIdentifier.fromPrincipal({
        principal: Principal.fromText(principal),
        subaccount
      }).toHex();
    },

    async get(canisterName) {
      // Initialize if not already done
      if (!canisters[canisterName]) {
        await this.initializeAgents();
      }

      // Wait for initialization to complete
      while (initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Returning canister for: ${canisterName}`, canisters[canisterName]);
      return canisters[canisterName];
    },
  },
});

export default useCanisterStore;
