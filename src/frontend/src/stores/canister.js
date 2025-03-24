import { defineStore } from 'pinia';
import { HttpAgent, Actor } from '@dfinity/agent';
import { createActor as createActorBackend, canisterId as backendCanisterId } from '../../../declarations/backend';
import { createActor as createActorRoadmap, canisterId as roadmapCanisterId } from '../../../declarations/backend';
import { createActor as createActorMarketplace, canisterId as marketplaceCanisterId } from '../../../declarations/marketplace';
// Import the ledger-specific libraries
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';
import useAuthStore from './auth.js';
// Import token service instead of token constants
import { tokenService } from '../services/TokenService.js';

// ICP ledger IDL definition - moved from tokens.js
const icpLedgerIDL = ({ IDL }) => {
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const AccountBalanceArgs = IDL.Record({ account: AccountIdentifier });
  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const Transaction = IDL.Record({
    memo: IDL.Nat64,
    created_at_time: IDL.Record({
      timestamp_nanos: IDL.Nat64,
    }),
    transfer: IDL.Variant({
      Burn: IDL.Record({
        from: AccountIdentifier,
        amount: Tokens,
      }),
      Mint: IDL.Record({
        to: AccountIdentifier,
        amount: Tokens,
      }),
      Send: IDL.Record({
        from: AccountIdentifier,
        to: AccountIdentifier,
        amount: Tokens,
      }),
    }),
  });
  const TransferArgs = IDL.Record({
    to: AccountIdentifier,
    fee: Tokens,
    memo: IDL.Nat64,
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Record({ timestamp_nanos: IDL.Nat64 })),
    amount: Tokens,
  });
  const TransferError = IDL.Variant({
    TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
    BadFee: IDL.Record({ expected_fee: Tokens }),
    TxDuplicate: IDL.Record({ duplicate_of: IDL.Nat64 }),
    TxCreatedInFuture: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: Tokens }),
  });
  const TransferResult = IDL.Variant({
    Ok: IDL.Nat64,
    Err: TransferError,
  });
  return IDL.Service({
    account_balance: IDL.Func([AccountBalanceArgs], [Tokens], ['query']),
    transfer: IDL.Func([TransferArgs], [TransferResult], []),
  });
};

// Store token canisters and state
let canisters = {
  cosmicrafts: null,
  roadmap: null,
  marketplace: null,
  ledger: null,
  // Storage for token canisters
  tokenLedgers: {},
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
    supportedTokens: [], // Will be populated dynamically after initialization
    currentToken: 'ICP',
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

        // Initialize token service to ensure tokens are loaded
        await tokenService.initialize(identity, host);
        this.supportedTokens = tokenService.getSupportedTokens();

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
        
        // Initialize token ledgers using TokenService
        // (TokenService already does this during initialize)
        
        initializing = false;
      }
    },
    
    /**
     * Get balance for a token
     * @param {string} symbol - Token symbol (default: 'ICP')
     * @returns {Promise<BigInt>} - Token balance
     */
    async getTokenBalance(symbol = 'ICP') {
      try {
        // Wait for agent and tokens to initialize if not already
        await this.initializeAgents();
        
        // Get user principal
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        if (!identity) {
          console.warn('No identity found, user may not be authenticated');
          return BigInt(0);
        }
        
        const principalId = identity.getPrincipal().toString();
        
        // Use TokenService to get the balance
        return tokenService.getBalance(principalId, symbol);
      } catch (error) {
        console.error(`Failed to get ${symbol} balance: ${error.message}`);
        return BigInt(0);
      }
    },
    
    /**
     * Sends tokens to another account (supports both ICP and ICRC-1 tokens)
     * @param {string} recipient - Recipient account ID (hex string) or principal ID
     * @param {bigint} amount - Amount to send in token's smallest unit (e8s for ICP)
     * @param {string} [tokenSymbol='ICP'] - Token symbol to send
     * @returns {Promise<{ success: boolean, blockHeight?: bigint, blockIndex?: bigint, error?: string }>}
     */
    async transferTokens(recipient, amount, tokenSymbol = 'ICP') {
      try {
        // Use TokenService for transfers
        return tokenService.transfer(recipient, amount, tokenSymbol);
      } catch (error) {
        console.error(`Failed to transfer ${tokenSymbol}:`, error);
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
     * Formats token amount for display
     * @param {bigint} amount - Amount in token's smallest unit
     * @param {string} tokenSymbol - Token symbol
     * @returns {string} Formatted token amount with correct decimal places
     */
    formatTokenAmount(amount, tokenSymbol) {
      return tokenService.formatAmount(amount, tokenSymbol);
    },
    
    /**
     * Formats ICP amount for display (converts e8s to ICP with 8 decimals)
     * @param {bigint} e8s - Amount in e8s
     * @returns {string} Formatted ICP amount with 8 decimal places
     */
    formatIcp(e8s) {
      return this.formatTokenAmount(e8s, 'ICP');
    },
    
    /**
     * Converts token amount to smallest unit
     * @param {number|string} amount - Amount in human-readable format
     * @param {string} tokenSymbol - Token symbol
     * @returns {bigint} Amount in token's smallest unit
     */
    tokenToSmallestUnit(amount, tokenSymbol) {
      return tokenService.toTokenAmount(amount, tokenSymbol);
    },
    
    /**
     * Converts ICP amount to e8s
     * @param {number|string} icp - Amount in ICP
     * @returns {bigint} Amount in e8s
     */
    icpToE8s(icp) {
      return this.tokenToSmallestUnit(icp, 'ICP');
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
