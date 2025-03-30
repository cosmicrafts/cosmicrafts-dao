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

// Cache keys
const CANISTER_CACHE_KEY = 'cosmicrafts-canister-cache';
const CANISTER_LAST_REFRESH_KEY = 'cosmicrafts-canister-last-refresh';

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
let lastInitialized = 0;

const MANUAL_ENV = 'ic'; // 'ic' for IC, 'local' for local development
const isLocal = MANUAL_ENV === 'local';
const host = isLocal ? 'http://127.0.0.1:8080' : 'https://ic0.app';

console.log(`Environment: ${isLocal ? 'Local Development' : 'ICP mainnet'}`);
console.log(`Host: ${host}`);

// ICP constants
const ICP_TRANSFER_FEE = BigInt(10000); // Standard ICP fee in e8s
const ICP_DECIMALS = BigInt(100_000_000); // 1 ICP = 10^8 e8s

export const useCanisterStore = defineStore('canister', {
  state: () => ({
    canisterIds: {
      cosmicrafts: 'opcce-byaaa-aaaak-qcgda-cai',
      roadmap: 'be2us-64aaa-aaaaa-qaabq-cai',
      marketplace: 'zgc5e-qiaaa-aaaan-qzyga-cai',
      ledger: 'ryjl3-tyaaa-aaaaa-aaaba-cai', // ICP ledger canister ID
    },
    agent: null,
    supportedTokens: [
      // Default ICP token info to ensure UI renders immediately
      {
        symbol: 'ICP',
        name: 'Internet Computer Protocol',
        standard: 'icp',
        decimals: 8,
        canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        fee: '10000',
      }
    ], 
    currentToken: 'ICP',
  }),

  actions: {
    /**
     * Initialize agents with non-blocking pattern
     */
    async initializeAgents() {
      try {
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        // If no identity, try to initialize from cache first
        if (!identity) {
          console.log('No identity available, attempting to initialize from cache with force=true...');
          
          // Try to initialize identity from cache with force parameter ALWAYS true (synchronous call)
          const initialized = authStore.initializeIdentityFromCache(true);
          
          if (initialized) {
            // Retry with newly initialized identity
            console.log('Successfully initialized identity from cache, retrying agent initialization');
            return this.initializeAgents();
          } else {
            console.warn('Could not initialize identity from cache, proceeding with limited functionality');
            // Instead of failing, continue with limited functionality
            // We'll create a basic agent without identity that can be used for public data
            try {
              const agent = new HttpAgent({ host });
              this.agent = agent;
              
              // Fetch root key for local development
              if (isLocal) {
                console.log('Fetching root key for local development...');
                // Handle this with a promise but don't wait for it
                agent.fetchRootKey().then(() => {
                  console.log('Root key fetched successfully');
                }).catch(err => {
                  console.warn('Error fetching root key:', err);
                });
              }
              
              return false; // Return false to indicate limited functionality
            } catch (error) {
              console.error('Failed to create anonymous agent:', error);
              return false;
            }
          }
        }
        
        // Skip if already initialized recently and identity is the same
        if (
          currentIdentity === identity && 
          Date.now() - lastInitialized < 5 * 60 * 1000 &&
          canisters.cosmicrafts
        ) {
          console.log('Agents already initialized and recent, using existing instances');
          return true;
        }
        
        // If another initialization is already in progress, wait for it to complete
        if (initializing) {
          console.log('Initialization already in progress, waiting...');
          let attempts = 0;
          while (initializing && attempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          if (initializing) {
            console.warn('Timed out waiting for initialization');
            return false;
          } else {
            return true;
          }
        }
        
        // Set identity and start initializing
        currentIdentity = identity;
        initializing = true;
        
        // Load cached data in a microtask to avoid blocking the main thread
        Promise.resolve().then(() => this.loadCachedCanisterConfig());
        
        // Start background initialization
        setTimeout(() => {
          this.backgroundInitialize(identity)
            .catch(error => console.error('Error in background initialization:', error))
            .finally(() => {
              initializing = false;
            });
        }, 0); // Reduce delay to 0ms for faster initialization
        
        return true;
      } catch (error) {
        console.error('Error initializing agents:', error);
        initializing = false;
        return false;
      }
    },
    
    /**
     * Load cached canister config
     */
    loadCachedCanisterConfig() {
      try {
        const cachedData = localStorage.getItem(CANISTER_CACHE_KEY);
        if (cachedData) {
          this.supportedTokens = JSON.parse(cachedData).tokens || [];
          console.log('Loaded cached canister config with', this.supportedTokens.length, 'tokens');
        }
        
        // Also load tokens from TokenService cache (which might be more recent)
        try {
          const tokensFromService = tokenService.getSupportedTokens();
          if (Array.isArray(tokensFromService) && tokensFromService.length > 0) {
            this.supportedTokens = tokensFromService;
          }
        } catch (tokenError) {
          console.warn('Error loading tokens from TokenService:', tokenError);
        }
      } catch (error) {
        console.error('Error loading cached canister config:', error);
        // Ensure we have a valid array
        if (!Array.isArray(this.supportedTokens)) {
          this.supportedTokens = [];
        }
      }
    },
    
    /**
     * Save canister config to cache
     */
    saveCachedCanisterConfig() {
      try {
        const cacheData = {
          tokens: this.supportedTokens,
          lastUpdated: Date.now()
        };
        
        // Also include canister existence status for better recovery
        const canisterStatus = {};
        for (const key in canisters) {
          if (typeof key === 'string' && key !== 'tokenLedgers') {
            canisterStatus[key] = !!canisters[key]; // Store boolean representing if canister exists
          }
        }
        cacheData.canisterStatus = canisterStatus;
        
        localStorage.setItem(CANISTER_CACHE_KEY, JSON.stringify(cacheData));
        localStorage.setItem(CANISTER_LAST_REFRESH_KEY, Date.now().toString());
      } catch (error) {
        console.error('Error saving canister config to cache:', error);
      }
    },
    
    /**
     * Perform background initialization
     */
    async backgroundInitialize(identity) {
      console.log('Initializing HttpAgent in background...');
      
      // Create agent with a time offset to handle clock drift
      const agent = new HttpAgent({ 
        identity, 
        host,
        // Add a time offset to handle clock synchronization issues
        fetchRootKey: isLocal,
        // Add 120 seconds to ensure we're ahead of the IC time
        timeOffset: 120000
      });
      this.agent = agent;
      
      // Fetch root key for local development is now handled via the option above
      
      // Initialize token service to ensure tokens are loaded
      // Pass our newly created agent to the token service
      try {
        await tokenService.initialize(identity, host);
      
        // Get tokens and handle potential errors
        const tokens = tokenService.getSupportedTokens();
        if (Array.isArray(tokens) && tokens.length > 0) {
          this.supportedTokens = tokens;
        }
      } catch (tokenError) {
        console.warn('Error initializing TokenService:', tokenError);
      }
      
      // Initialize all canisters with error handling for each
      try {
        canisters.cosmicrafts = createActorBackend(this.canisterIds.cosmicrafts, { agent });
      } catch (error) {
        console.error('Error creating cosmicrafts actor:', error);
      }
      
      try {
        canisters.roadmap = createActorRoadmap(this.canisterIds.roadmap, { agent });
      } catch (error) {
        console.error('Error creating roadmap actor:', error);
      }
      
      try {
        console.log(`Creating actor for marketplace with ID: ${this.canisterIds.marketplace}`);
        canisters.marketplace = createActorMarketplace(this.canisterIds.marketplace, { agent });
        console.log('Marketplace actor created:', canisters.marketplace ? 'Success' : 'Failed (null/undefined)');
      } catch (error) {
        console.error('Error creating marketplace actor:', error);
      }
      
      // Initialize ICP ledger canister using direct Actor interface
      try {
        console.log(`Creating ICP Ledger direct actor with ID: ${this.canisterIds.ledger}`);
        canisters.ledger = Actor.createActor(icpLedgerIDL, {
          agent,
          canisterId: this.canisterIds.ledger,
        });
      } catch (error) {
        console.error('Failed to initialize ledger canister:', error);
      }
      
      // Save updated data to cache
      this.saveCachedCanisterConfig();
      
      // Update initialization timestamp
      lastInitialized = Date.now();
      console.log('Background initialization completed successfully');
    },
    
    /**
     * Get balance for a token
     * @param {string} symbol - Token symbol (default: 'ICP')
     * @returns {Promise<BigInt>} - Token balance
     */
    async getTokenBalance(symbol = 'ICP') {
      try {
        // Ensure we have some agents initialized
        await this.initializeAgents();
        
        // Get user principal
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        if (!identity) {
          console.warn('No identity found, user may not be authenticated');
          return BigInt(0);
        }
        
        const principalId = identity.getPrincipal().toString();
        
        // Check if tokenService is initialized, if not, initialize it
        if (!tokenService.initialized && !tokenService.initializing) {
          try {
            await tokenService.initialize(identity, host);
          } catch (e) {
            console.warn('Error initializing tokenService:', e);
          }
        }
        
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
        // Ensure we have agent initialized
        await this.initializeAgents();
        
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

    /**
     * Get a canister actor - will initialize if needed
     * @param {string} canisterName - Name of the canister
     * @returns {Promise<Object>} - Canister actor
     */
    async get(canisterName) {
      // Log the canister request more verbosely
      console.log(`[DEBUG] Requesting canister: ${canisterName}, current state:`, 
        canisterName in canisters ? 
          (canisters[canisterName] ? 'Exists' : 'Null/Undefined') : 
          'Not initialized');
      
      // Check for the specific canister first - return immediately if available
      if (canisters[canisterName]) {
        console.log(`Using existing ${canisterName} canister`);
        return canisters[canisterName];
      }
      
      console.log(`Canister ${canisterName} not initialized, attempting initialization...`);
      
      // If we're already initializing, wait a bit for it
      if (initializing) {
        console.log(`Initialization already in progress, waiting for ${canisterName}...`);
        let attempts = 0;
        const maxAttempts = 20; // Allow more attempts (2 seconds total)
        
        while (initializing && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
          
          // If canister becomes available while waiting, return it
          if (canisters[canisterName]) {
            console.log(`${canisterName} canister became available while waiting`);
            return canisters[canisterName];
          }
        }
        
        // Check again after waiting
        if (canisters[canisterName]) {
          return canisters[canisterName];
        }
        
        // If we're still initializing after max attempts, proceed anyway
        console.warn(`Timed out waiting for initialization, proceeding with ${canisterName} canister request`);
      }
      
      // Initialize agents if needed
      try {
        console.log(`[DEBUG] Calling initializeAgents for ${canisterName}...`);
        const result = await this.initializeAgents();
        console.log(`[DEBUG] initializeAgents result: ${result}`);
        
        // Check if canister was created during initialization
        if (canisters[canisterName]) {
          console.log(`${canisterName} canister became available after initializeAgents`);
          return canisters[canisterName];
        } else {
          console.log(`[DEBUG] ${canisterName} still not available after initializeAgents`);
        }
      } catch (initError) {
        console.error(`Error initializing agents for ${canisterName}:`, initError);
        
        // If initialization failed and we still don't have the canister, try anonymous access
        if (!canisters[canisterName]) {
          console.log(`Attempting anonymous access to ${canisterName} canister...`);
          try {
            const agent = new HttpAgent({ host });
            
            if (canisterName === 'cosmicrafts') {
              canisters.cosmicrafts = createActorBackend(this.canisterIds.cosmicrafts, { agent });
            } else if (canisterName === 'roadmap') {
              canisters.roadmap = createActorRoadmap(this.canisterIds.roadmap, { agent });
            } else if (canisterName === 'marketplace') {
              console.log(`[DEBUG] Creating marketplace actor with ID ${this.canisterIds.marketplace}`);
              canisters.marketplace = createActorMarketplace(this.canisterIds.marketplace, { agent });
              console.log(`[DEBUG] Marketplace actor created: ${canisters.marketplace ? 'Success' : 'Failed'}`);
            } else if (canisterName === 'ledger') {
              canisters.ledger = Actor.createActor(icpLedgerIDL, {
                agent,
                canisterId: this.canisterIds.ledger,
              });
            }
          } catch (secondError) {
            console.error(`Anonymous access also failed for ${canisterName}:`, secondError);
          }
        }
      }

      // Final check for the canister with detailed logging
      if (canisters[canisterName]) {
        console.log(`${canisterName} canister is now available`);
        return canisters[canisterName];
      }
      
      // If still not available, try to provide a more specific reason
      console.error(`${canisterName} canister not available after initialization attempts. Current canisters state:`, 
        Object.keys(canisters).reduce((acc, key) => {
          acc[key] = key === 'tokenLedgers' ? 
            `Object with ${Object.keys(canisters.tokenLedgers || {}).length} keys` : 
            !!canisters[key];
          return acc;
        }, {}));
      return null;
    },

    /**
     * Perform an immediate identity check and initialization
     * This is used at application startup to ensure identity is ready right away
     */
    initializeImmediately() {
      try {
        const authStore = useAuthStore();
        let identity = authStore.getIdentity();
        
        console.log('Initializing canisters immediately...');
        
        // Create agent with or without identity, including time offset
        const agent = identity 
          ? new HttpAgent({ 
              identity, 
              host, 
              fetchRootKey: isLocal,
              timeOffset: 120000 // Add 120 seconds offset for clock synchronization
            })
          : new HttpAgent({ 
              host, 
              fetchRootKey: isLocal,
              timeOffset: 120000
            });
        
        this.agent = agent;
        
        // Fetch root key is now handled via the option above
        
        // Set identity and initialization flag even with anonymous agent
        currentIdentity = identity;
        initializing = true;
        
        // Initialize cosmicrafts canister immediately regardless of identity
        try {
          canisters.cosmicrafts = createActorBackend(this.canisterIds.cosmicrafts, { agent });
          console.log('Cosmicrafts canister initialized immediately');
        } catch (err) {
          console.error('Failed to initialize cosmicrafts canister:', err);
        }
        
        // Start the rest of initialization in the background
        setTimeout(() => {
          // If we have an identity, initialize all canisters
          // Otherwise initialize with limited functionality
          this.backgroundInitialize(identity)
            .catch(error => console.error('Error in background initialization:', error))
            .finally(() => {
              initializing = false;
              console.log('Background canister initialization completed');
            });
        }, 0);
        
        // Consider initialization successful even with an anonymous agent
        // Components can still use the canister for public data
        lastInitialized = Date.now();
        return true;
      } catch (error) {
        console.error('Error in immediate canister initialization:', error);
        initializing = false;
        return false;
      }
    },
  },
});

export default useCanisterStore;
