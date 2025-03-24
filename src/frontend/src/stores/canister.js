import { defineStore } from 'pinia';
import { HttpAgent, Actor } from '@dfinity/agent';
import { createActor as createActorBackend, canisterId as backendCanisterId } from '../../../declarations/backend';
import { createActor as createActorRoadmap, canisterId as roadmapCanisterId } from '../../../declarations/backend';
import { createActor as createActorMarketplace, canisterId as marketplaceCanisterId } from '../../../declarations/marketplace';
// Import the ledger-specific libraries
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import useAuthStore from './auth.js';

// ICP ledger interface definition
const icpLedgerIDL = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Duration = IDL.Record({ 'secs': IDL.Nat64, 'nanos': IDL.Nat32 });
  const Timestamp = IDL.Record({ 'timestamp_nanos': IDL.Nat64 });
  const Tokens = IDL.Record({ 'e8s': IDL.Nat64 });
  const TransferArgs = IDL.Record({
    'to': AccountIdentifier,
    'fee': Tokens,
    'memo': IDL.Nat64,
    'from_subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time': IDL.Opt(Timestamp),
    'amount': Tokens,
  });
  const TransferError = IDL.Variant({
    'TxTooOld': IDL.Record({ 'allowed_window_nanos': IDL.Nat64 }),
    'BadFee': IDL.Record({ 'expected_fee': Tokens }),
    'TxDuplicate': IDL.Record({ 'duplicate_of': IDL.Nat64 }),
    'TxCreatedInFuture': IDL.Null,
    'InsufficientFunds': IDL.Record({ 'balance': Tokens }),
  });
  const TransferResult = IDL.Variant({
    'Ok': IDL.Nat64,
    'Err': TransferError,
  });
  return IDL.Service({
    'account_balance': IDL.Func([IDL.Record({ 'account': AccountIdentifier })], [Tokens], ['query']),
    'transfer': IDL.Func([TransferArgs], [TransferResult], []),
  });
};

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

// ICP constants
const ICP_TRANSFER_FEE = BigInt(10000); // Standard ICP fee in e8s
const ICP_DECIMALS = BigInt(100_000_000); // 1 ICP = 10^8 e8s

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
        
        // Initialize ICP ledger canister using direct Actor interface
        try {
          console.log(`Creating ICP Ledger direct actor with ID: ${this.canisterIds.ledger}`);
          canisters.ledger = Actor.createActor(icpLedgerIDL, {
            agent,
            canisterId: this.canisterIds.ledger,
          });
          console.log(`Direct ledger actor created successfully`);
        } catch (error) {
          console.error('Failed to initialize ledger canister:', error);
        }

        initializing = false;
      }
    },
    
    /**
     * Gets ICP balance for a principal or account identifier
     * @param {string} principal - Principal ID string or Account Identifier hex
     * @returns {Promise<{ e8s: bigint }>} Balance in e8s
     */
    async getIcpBalance(principal) {
      try {
        // Get the ledger canister
        const ledger = await this.get('ledger');
        if (!ledger) {
          console.error('Ledger canister not initialized');
          return { e8s: BigInt(0) };
        }
        
        let accountBytes;
        
        try {
          // Check if input is an account identifier (64 char hex string)
          if (/^[0-9a-fA-F]{64}$/.test(principal)) {
            // Convert hex string to bytes
            accountBytes = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
              accountBytes[i] = parseInt(principal.substring(i * 2, i * 2 + 2), 16);
            }
          } else {
            // Convert principal to account identifier
            const principalObj = Principal.fromText(principal);
            const accountIdentifier = AccountIdentifier.fromPrincipal({
              principal: principalObj,
              subaccount: undefined
            });
            accountBytes = accountIdentifier.bytes;
          }
        } catch (error) {
          console.error('Error creating account identifier:', error);
          return { e8s: BigInt(0) };
        }
        
        if (!accountBytes) {
          console.error('Failed to get account identifier bytes');
          return { e8s: BigInt(0) };
        }
        
        console.log('Using account bytes for direct ledger call:', accountBytes);
        
        // Use the direct ledger interface with account parameter
        const balance = await ledger.account_balance({
          account: Array.from(accountBytes) // Convert Uint8Array to regular array for Candid
        });
        
        console.log('Balance received:', balance);
        return balance;
      } catch (error) {
        console.error('Failed to get ICP balance:', error);
        return { e8s: BigInt(0) };
      }
    },
    
    /**
     * Sends ICP to another account
     * @param {string} recipient - Recipient account ID (hex string) or principal ID
     * @param {bigint} amountE8s - Amount to send in e8s
     * @param {Array<number>} [fromSubAccount] - Optional subaccount to send from
     * @param {bigint} [memo=0n] - Optional memo for the transaction
     * @returns {Promise<{ success: boolean, blockHeight?: bigint, error?: string }>}
     */
    async transferIcp(recipient, amountE8s, fromSubAccount = undefined, memo = BigInt(0)) {
      try {
        const ledger = await this.get('ledger');
        if (!ledger) {
          throw new Error('Ledger canister not initialized');
        }
        
        let toAccountId;
        
        // Determine if the recipient is a principal or account ID
        const isAccountId = /^[0-9a-fA-F]{64}$/.test(recipient);
        const isPrincipal = !isAccountId && recipient.includes('-');
        
        if (isAccountId) {
          // The recipient is already an account ID
          toAccountId = recipient;
          console.log('Using provided account ID for transfer:', toAccountId);
        } else if (isPrincipal) {
          // The recipient is a principal, convert to account ID
          try {
            toAccountId = this.principalToAccountIdentifier(recipient);
            console.log('Converted principal to account ID for transfer:', {
              principal: recipient,
              accountId: toAccountId
            });
          } catch (error) {
            throw new Error(`Invalid principal format: ${error.message}`);
          }
        } else {
          throw new Error('Invalid recipient format: must be a valid account ID or principal');
        }
        
        // Convert hex account ID to bytes
        const toAccountBytes = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          toAccountBytes[i] = parseInt(toAccountId.substring(i * 2, i * 2 + 2), 16);
        }
        
        // Prepare from_subaccount argument
        const fromSubaccountArg = fromSubAccount ? [Array.from(fromSubAccount)] : [];
        
        console.log('Sending ICP transfer:', {
          to: toAccountId,
          amount: amountE8s.toString(),
          fee: ICP_TRANSFER_FEE.toString()
        });
        
        // Direct transfer call using the Actor interface
        const result = await ledger.transfer({
          to: Array.from(toAccountBytes),
          fee: { e8s: ICP_TRANSFER_FEE },
          memo,
          from_subaccount: fromSubaccountArg,
          created_at_time: [],
          amount: { e8s: amountE8s }
        });
        
        // Handle the Candid variant response
        if ('Err' in result) {
          console.error('Transfer error:', result.Err);
          throw new Error(`Transfer failed: ${JSON.stringify(result.Err)}`);
        }
        
        console.log('Transfer successful:', {
          blockHeight: result.Ok.toString(),
          to: toAccountId
        });
        
        return { success: true, blockHeight: result.Ok, recipient: toAccountId };
      } catch (error) {
        console.error('Failed to transfer ICP:', error);
        return { success: false, error: error.message };
      }
    },
    
    /**
     * Converts a principal to an account identifier hex string
     * @param {string} principal - Principal ID in text format
     * @param {Array<number>} [subaccount] - Optional subaccount
     * @returns {string} Account identifier as hex string
     */
    principalToAccountIdentifier(principal, subaccount = undefined) {
      try {
        // Validate the principal first
        const principalObj = Principal.fromText(principal);
        
        // Create AccountIdentifier and get hex representation
        const accountId = AccountIdentifier.fromPrincipal({
          principal: principalObj,
          subaccount
        });
        
        return accountId.toHex();
      } catch (error) {
        console.error('Error in principalToAccountIdentifier:', error);
        throw new Error(`Failed to convert principal to account ID: ${error.message}`);
      }
    },
    
    /**
     * Formats ICP amount for display (converts e8s to ICP with 8 decimals)
     * @param {bigint} e8s - Amount in e8s
     * @returns {string} Formatted ICP amount with 8 decimal places
     */
    formatIcp(e8s) {
      try {
        const value = Number(e8s) / Number(ICP_DECIMALS);
        return value.toFixed(8);
      } catch (error) {
        console.error('Error formatting ICP:', error);
        return '0.00000000';
      }
    },
    
    /**
     * Converts ICP amount to e8s
     * @param {number|string} icp - Amount in ICP
     * @returns {bigint} Amount in e8s
     */
    icpToE8s(icp) {
      try {
        const icpValue = typeof icp === 'string' ? parseFloat(icp) : icp;
        return BigInt(Math.round(icpValue * Number(ICP_DECIMALS)));
      } catch (error) {
        console.error('Error converting ICP to e8s:', error);
        return BigInt(0);
      }
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

      return canisters[canisterName];
    },
  },
});

export default useCanisterStore;
