import { HttpAgent } from '@dfinity/agent';
import { LedgerCanister as IcpLedgerCanister, AccountIdentifier } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister, mapTokenMetadata } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';

// Constants
const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
const STARDUST_TOKEN_CANISTER_ID = 'opcce-byaaa-aaaak-qcgda-cai';

// Cache keys
const TOKEN_CACHE_KEY = 'cosmicrafts-token-cache';
const TOKEN_CONFIGS_KEY = 'cosmicrafts-token-configs';
const TOKEN_BALANCES_KEY = 'cosmicrafts-token-balances';
const TOKEN_LAST_REFRESH_KEY = 'cosmicrafts-token-last-refresh';

class TokenService {
  constructor() {
    this.agent = null;
    this.icpLedger = null;
    this.tokenLedgers = new Map();
    this.tokenConfigs = new Map();
    this.supportedTokens = [];
    this.initialized = false;
    this.initializing = false;
    this.lastRefresh = 0;
    this.useCache = true;
    
    // Set up default tokens immediately to avoid UI delays
    const defaultTokens = [
      {
        symbol: 'ICP',
        name: 'Internet Computer Protocol',
        standard: 'icp',
        decimals: 8,
        canisterId: ICP_LEDGER_CANISTER_ID,
        fee: '10000' // Store as string for serialization
      },
      {
        symbol: 'STDs',
        name: 'Stardust',
        standard: 'icrc1',
        decimals: 8,
        canisterId: STARDUST_TOKEN_CANISTER_ID,
        fee: '10000' // Store as string for serialization
      }
    ];
    
    this.supportedTokens = defaultTokens;
    defaultTokens.forEach(token => {
      this.tokenConfigs.set(token.symbol, {
        ...token,
        fee: BigInt(token.fee)
      });
    });
    
    // Use queueMicrotask instead of Promise.resolve().then() for better browser compatibility
    queueMicrotask(() => this.loadCachedData());
  }

  /**
   * Load cached data immediately (synchronous)
   */
  loadCachedData() {
    try {
      // First ensure we have a default array of tokens
      if (!Array.isArray(this.supportedTokens)) {
        this.supportedTokens = [
          {
            symbol: 'ICP',
            name: 'Internet Computer Protocol',
            standard: 'icp',
            decimals: 8,
            canisterId: ICP_LEDGER_CANISTER_ID,
            fee: '10000'
          },
          {
            symbol: 'STDs',
            name: 'Stardust',
            standard: 'icrc1',
            decimals: 8,
            canisterId: STARDUST_TOKEN_CANISTER_ID,
            fee: '10000'
          }
        ];
      }
      
      // Load token configs
      const cachedConfigs = localStorage.getItem(TOKEN_CONFIGS_KEY);
      if (cachedConfigs) {
        try {
          const configs = JSON.parse(cachedConfigs);
          if (Array.isArray(configs)) {
            // Convert fee from string to BigInt
            configs.forEach(config => {
              this.tokenConfigs.set(config.symbol, {
                ...config,
                fee: BigInt(config.fee || '0')
              });
            });
          }
        } catch (e) {
          console.error('Error parsing cached configs:', e);
        }
      }
      
      // Load supported tokens
      const cachedTokens = localStorage.getItem(TOKEN_CACHE_KEY);
      if (cachedTokens) {
        try {
          const parsedTokens = JSON.parse(cachedTokens);
          if (Array.isArray(parsedTokens) && parsedTokens.length > 0) {
            this.supportedTokens = parsedTokens;
          } else {
            console.warn('Cached tokens is not a valid array, using defaults');
            // We already have defaults set above
          }
        } catch (e) {
          console.error('Error parsing cached tokens:', e);
          // We already have defaults set above
        }
      }
      
      // Load last refresh time
      const lastRefresh = localStorage.getItem(TOKEN_LAST_REFRESH_KEY);
      if (lastRefresh) {
        this.lastRefresh = parseInt(lastRefresh, 10);
      }
      
      console.log('TokenService: Loaded cached data with', 
                 Array.isArray(this.supportedTokens) ? this.supportedTokens.length : 0, 
                 'tokens');
    } catch (error) {
      console.error('Failed to load cached data:', error);
      // Ensure supportedTokens is an array with defaults
      this.supportedTokens = [
        {
          symbol: 'ICP',
          name: 'Internet Computer Protocol',
          standard: 'icp',
          decimals: 8,
          canisterId: ICP_LEDGER_CANISTER_ID,
          fee: '10000'
        },
        {
          symbol: 'STDs',
          name: 'Stardust',
          standard: 'icrc1',
          decimals: 8,
          canisterId: STARDUST_TOKEN_CANISTER_ID,
          fee: '10000'
        }
      ];
    }
  }
  
  /**
   * Save current state to cache
   */
  saveToCache() {
    try {
      // Ensure supportedTokens is an array before saving
      if (!Array.isArray(this.supportedTokens)) {
        console.warn('supportedTokens is not an array, resetting to defaults');
        this.supportedTokens = [
          {
            symbol: 'ICP',
            name: 'Internet Computer Protocol',
            standard: 'icp',
            decimals: 8,
            canisterId: ICP_LEDGER_CANISTER_ID,
            fee: '10000'
          },
          {
            symbol: 'STDs',
            name: 'Stardust',
            standard: 'icrc1',
            decimals: 8,
            canisterId: STARDUST_TOKEN_CANISTER_ID,
            fee: '10000'
          }
        ];
      }
      
      // Save token configs (convert BigInt to string)
      const configsToSave = Array.from(this.tokenConfigs.values()).map(config => ({
        ...config,
        fee: typeof config.fee === 'bigint' ? config.fee.toString() : config.fee
      }));
      
      localStorage.setItem(TOKEN_CONFIGS_KEY, JSON.stringify(configsToSave));
      
      // Make a clean serializable copy of supportedTokens
      const tokensToSave = this.supportedTokens.map(token => ({
        ...token,
        fee: typeof token.fee === 'bigint' ? token.fee.toString() : token.fee
      }));
      
      // Save supported tokens as a clean array
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(tokensToSave));
      
      // Save last refresh time
      localStorage.setItem(TOKEN_LAST_REFRESH_KEY, this.lastRefresh.toString());
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  /**
   * Initialize the token service - NON-BLOCKING
   * @param {Identity} identity - User identity
   * @param {string} host - Host URL
   */
  async initialize(identity, host = 'https://ic0.app') {
    // Return immediately - we already have cached data
    if (this.initializing) {
      console.log('TokenService already initializing, skipping duplicate call');
      return this;
    }
    
    // Start initializing in the background
    this.initializing = true;
    
    // Mark as initialized immediately so components can use the service
    // This provides a better UX as components aren't blocked waiting for blockchain
    this.initialized = true;
    
    // Setup default tokens immediately
    this._setupDefaultTokens();
    
    // Check if we need a refresh
    const shouldRefresh = Date.now() - this.lastRefresh > 5 * 60 * 1000; // 5 minutes
    
    if (shouldRefresh) {
      // Use queueMicrotask instead of setTimeout for better performance
      queueMicrotask(() => {
        this.doInitialize(identity, host)
          .catch(e => console.warn('Background token initialization error:', e));
      });
    } else {
      console.log('TokenService: Using cached data, refresh not needed');
    }
    
    return this;
  }
  
  /**
   * Actual initialization logic - happens in background
   */
  async doInitialize(identity, host) {
    // Create an overall timeout for the initialization process
    const initTimeout = setTimeout(() => {
      console.warn('TokenService initialization timed out, using defaults');
      // Set up at least the default ICP token
      this._setupDefaultTokens();
      this.initialized = true;
      this.initializing = false;
      this.saveToCache();
    }, 45000); // 45 second overall timeout

    try {
      console.log('Initializing TokenService...');
      
      // Create agent with identity
      this.agent = new HttpAgent({ identity, host });
      
      if (host.includes('127.0.0.1') || host.includes('localhost')) {
        await this.agent.fetchRootKey();
      }
      
      // First initialize only ICP (fast path)
      await this.initializeIcpToken().then(icpConfig => {
        // Find existing ICP in supportedTokens
        const existingIcpIndex = this.supportedTokens.findIndex(t => t.symbol === 'ICP');
        if (existingIcpIndex >= 0) {
          // Update existing token
          this.supportedTokens[existingIcpIndex] = {
            ...icpConfig,
            fee: icpConfig.fee.toString()
          };
        } else {
          // Add new token
          this.supportedTokens.push({
            ...icpConfig,
            fee: icpConfig.fee.toString()
          });
        }
        
        // Mark as initialized after ICP is ready
        this.initialized = true;
        console.log('TokenService fast path initialized with ICP token');
        
        // Save cache early so UI can use it
        this.saveToCache();
      });
      
      // Then load COSMIC token asynchronously without waiting
      setTimeout(() => {
        this.initializeCosmicToken().catch(err => 
          console.warn('COSMIC token initialization error:', err)
        );
      }, 100);
      
      // Update cache
      this.lastRefresh = Date.now();
      this.saveToCache();
      
      // Already marked as initialized after ICP is ready
      this.initializing = false;

      // Clear the timeout since initialization succeeded
      clearTimeout(initTimeout);
    } catch (error) {
      console.error('Error in TokenService initialization:', error);
      
      // Set up default tokens on error
      this._setupDefaultTokens();
      
      this.initializing = false;
      
      // Even if there's an error, set initialized to true if we have at least ICP
      if (this.tokenConfigs.has('ICP')) {
        this.initialized = true;
      }

      // Clear the timeout since we've handled the error
      clearTimeout(initTimeout);
    }
  }
  
  /**
   * Setup default tokens in case of network errors or timeouts
   * @private
   */
  _setupDefaultTokens() {
    console.log('Setting up default tokens due to initialization issues');
    
    // Set up default ICP token
    const icpConfig = {
      symbol: 'ICP',
      name: 'Internet Computer Protocol',
      standard: 'icp',
      decimals: 8,
      canisterId: ICP_LEDGER_CANISTER_ID,
      fee: BigInt(10000)
    };
    
    this.tokenConfigs.set('ICP', icpConfig);
    
    // Add ICP to supported tokens if not already there
    const existingIcpIndex = this.supportedTokens.findIndex(t => t.symbol === 'ICP');
    if (existingIcpIndex >= 0) {
      this.supportedTokens[existingIcpIndex] = {
        ...icpConfig,
        fee: icpConfig.fee.toString()
      };
    } else {
      this.supportedTokens.push({
        ...icpConfig,
        fee: icpConfig.fee.toString()
      });
    }
    
    // Set up default Stardust token
    const stardustConfig = {
      symbol: 'STDs',
      name: 'Stardust',
      standard: 'icrc1',
      decimals: 8,
      canisterId: STARDUST_TOKEN_CANISTER_ID,
      fee: BigInt(10000)
    };
    
    this.tokenConfigs.set('STDs', stardustConfig);
    
    // Add Stardust to supported tokens if not already there
    const existingStardustIndex = this.supportedTokens.findIndex(t => t.symbol === 'STDs');
    if (existingStardustIndex >= 0) {
      this.supportedTokens[existingStardustIndex] = {
        ...stardustConfig,
        fee: stardustConfig.fee.toString()
      };
    } else {
      this.supportedTokens.push({
        ...stardustConfig,
        fee: stardustConfig.fee.toString()
      });
    }
  }
  
  /**
   * Initialize COSMIC token with timeout protection
   */
  async initializeCosmicToken() {
    try {
      console.log('Initializing Stardust token in background...');
      
      // Use Promise.race with a timeout to prevent hanging
      // Increased timeout from 10s to 30s
      const stardustConfig = await Promise.race([
        this.initializeIcrcToken(STARDUST_TOKEN_CANISTER_ID),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stardust token initialization timed out')), 30000)
        )
      ]);
      
      // Find existing Stardust token
      const existingIndex = this.supportedTokens.findIndex(t => t.canisterId === STARDUST_TOKEN_CANISTER_ID);
      if (existingIndex >= 0) {
        // Update existing token
        this.supportedTokens[existingIndex] = {
          ...stardustConfig,
          fee: stardustConfig.fee.toString()
        };
      } else {
        // Add new token
        this.supportedTokens.push({
          ...stardustConfig,
          fee: stardustConfig.fee.toString()
        });
      }
      
      // Save updated tokens list
      this.saveToCache();
      
      console.log('Stardust token loaded successfully');
      return stardustConfig;
    } catch (error) {
      console.error('Failed to initialize Stardust token:', error);
      
      // Use default config on failure
      const defaultConfig = {
        symbol: 'STDs',
        name: 'Stardust',
        standard: 'icrc1',
        decimals: 8,
        canisterId: STARDUST_TOKEN_CANISTER_ID,
        fee: BigInt(10000),
        logo: null
      };
      
      // Make sure default config is in token configs
      this.tokenConfigs.set('STDs', defaultConfig);
      
      // Update supported tokens with default config
      const existingIndex = this.supportedTokens.findIndex(t => t.canisterId === STARDUST_TOKEN_CANISTER_ID);
      if (existingIndex >= 0) {
        this.supportedTokens[existingIndex] = {
          ...defaultConfig,
          fee: defaultConfig.fee.toString()
        };
      } else {
        this.supportedTokens.push({
          ...defaultConfig,
          fee: defaultConfig.fee.toString()
        });
      }
      
      // Save cache with default values to avoid repeated failures
      this.saveToCache();
      
      // No need to throw - this is a background operation
      return defaultConfig;
    }
  }
  
  /**
   * Initialize default tokens
   */
  async initializeTokens() {
    try {
      // Ensure supportedTokens is an array
      if (!Array.isArray(this.supportedTokens)) {
        this.supportedTokens = [];
      }
      
      // Initialize ICP
      console.log('Initializing ICP token...');
      const icpConfig = await this.initializeIcpToken();
      
      // Find existing ICP in supportedTokens
      const existingIcpIndex = this.supportedTokens.findIndex(t => t.symbol === 'ICP');
      if (existingIcpIndex >= 0) {
        // Update existing token
        this.supportedTokens[existingIcpIndex] = {
          ...icpConfig,
          fee: icpConfig.fee.toString()
        };
      } else {
        // Add new token
        this.supportedTokens.push({
          ...icpConfig,
          fee: icpConfig.fee.toString()
        });
      }
      
      // Mark as initialized after ICP is ready
      this.initialized = true;
      
      // Initialize Stardust token in background
      setTimeout(() => {
        this.initializeCosmicToken().catch(err => 
          console.warn('Stardust token background initialization error:', err)
        );
      }, 100);
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
    }
  }
  
  /**
   * Initialize the ICP token
   */
  async initializeIcpToken() {
    // Create ICP ledger
    this.icpLedger = IcpLedgerCanister.create({
      agent: this.agent,
      canisterId: ICP_LEDGER_CANISTER_ID
    });
    
    // Define ICP configuration
    const icpConfig = {
      symbol: 'ICP',
      name: 'Internet Computer Protocol',
      standard: 'icp',
      decimals: 8,
      canisterId: ICP_LEDGER_CANISTER_ID,
      fee: BigInt(10000)
    };
    
    this.tokenConfigs.set('ICP', icpConfig);
    
    return icpConfig;
  }
  
  /**
   * Initialize an ICRC token by its canister ID
   * @param {string} canisterId 
   */
  async initializeIcrcToken(canisterId) {
    // Track retry attempts
    let attempts = 0;
    const maxAttempts = 2;
    
    const attemptInitialization = async () => {
      attempts++;
      console.log(`Initializing ICRC token ${canisterId} (attempt ${attempts}/${maxAttempts})...`);
      
      try {
        // Create ICRC ledger
        const icrcLedger = IcrcLedgerCanister.create({
          agent: this.agent,
          canisterId
        });
        
        this.tokenLedgers.set(canisterId, icrcLedger);
        
        // Query metadata to get token information
        console.log(`Fetching metadata for ${canisterId}...`);
        
        let tokenInfo;
        let fee;
        
        // Set a timeout for the metadata fetch - increased from 5s to 15s
        const metadataPromise = Promise.race([
          icrcLedger.metadata({ certified: true }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Metadata fetch timed out')), 15000)
          )
        ]);
        
        // Method 1: Use the official metadata method
        try {
          const metadataResponse = await metadataPromise;
          
          // Use the official mapper function from the library
          tokenInfo = mapTokenMetadata(metadataResponse);
          
          if (!tokenInfo) {
            throw new Error('Failed to map token metadata');
          }
        } catch (metadataError) {
          console.warn('Error with metadata mapping:', metadataError);
          
          // Method 2: Parse metadata manually as fallback
          try {
            // Set a timeout for the metadata fetch - increased from 5s to 15s
            const fallbackMetadataPromise = Promise.race([
              icrcLedger.metadata({ certified: false }), // Try with non-certified query for faster response
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fallback metadata fetch timed out')), 15000)
              )
            ]);
            
            const metadata = await fallbackMetadataPromise;
            
            // Extract values manually
            const findValue = (key) => {
              const entry = metadata.find(([k]) => k === key);
              if (!entry) return null;
              
              const [, value] = entry;
              if (typeof value === 'object') {
                if ('Text' in value) return value.Text;
                if ('Nat' in value) return BigInt(value.Nat);
                if ('Int' in value) return BigInt(value.Int);
              }
              return value;
            };
            
            tokenInfo = {
              symbol: findValue('icrc1:symbol') || 'UNKNOWN',
              name: findValue('icrc1:name') || 'Unknown Token',
              decimals: Number(findValue('icrc1:decimals')) || 8,
              logo: findValue('icrc1:logo')
            };
          } catch (fallbackError) {
            console.error('Failed to parse metadata manually, using defaults:', fallbackError);
            // Use defaults instead of failing
            tokenInfo = {
              symbol: canisterId === STARDUST_TOKEN_CANISTER_ID ? 'STDs' : 'UNKNOWN',
              name: canisterId === STARDUST_TOKEN_CANISTER_ID ? 'STARDUST' : 'Unknown Token',
              decimals: 8,
              logo: null
            };
          }
        }
        
        // Get fee with timeout - increased from 5s to 15s
        try {
          const feePromise = Promise.race([
            icrcLedger.transactionFee({ certified: false }), // Try with non-certified query for faster response
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Fee fetch timed out')), 15000)
            )
          ]);
          
          fee = await feePromise;
        } catch (feeError) {
          console.warn('Error fetching transfer fee, using default:', feeError);
          fee = BigInt(10000); // Default fee
        }
        
        // Create token config
        const tokenConfig = {
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          standard: 'icrc1',
          decimals: tokenInfo.decimals,
          canisterId,
          fee,
          logo: tokenInfo.logo
        };
        
        this.tokenConfigs.set(tokenInfo.symbol, tokenConfig);
        console.log(`Successfully initialized ${tokenInfo.symbol} token`);
        
        return tokenConfig;
      } catch (error) {
        console.error(`Failed to initialize ICRC token ${canisterId} (attempt ${attempts}):`, error);
        
        // Retry if we haven't reached max attempts
        if (attempts < maxAttempts) {
          console.log(`Retrying initialization for ${canisterId}...`);
          return attemptInitialization();
        }
        
        // For known tokens, use default values instead of failing
        if (canisterId === STARDUST_TOKEN_CANISTER_ID) {
          console.log('Using default config for Stardust token after repeated failures');
          const defaultConfig = {
            symbol: 'STDs',
            name: 'Stardust',
            standard: 'icrc1',
            decimals: 8,
            canisterId,
            fee: BigInt(10000),
            logo: null
          };
          this.tokenConfigs.set('STDs', defaultConfig);
          return defaultConfig;
        }
        throw error;
      }
    };
    
    return attemptInitialization();
  }
  
  /**
   * Add a new token by canister ID
   * @param {string} canisterId 
   */
  async addToken(canisterId) {
    try {
      // Check if this canister is already added
      const existing = this.supportedTokens.find(t => t.canisterId === canisterId);
      if (existing) {
        console.log(`Token ${existing.symbol} already added`);
        return existing;
      }
      
      // Make sure we're initialized
      if (!this.agent) {
        throw new Error('TokenService not initialized yet');
      }
      
      // Initialize as ICRC token
      const tokenConfig = await this.initializeIcrcToken(canisterId);
      
      // Add to supported tokens list (with string fee for serialization)
      this.supportedTokens.push({
        ...tokenConfig,
        fee: tokenConfig.fee.toString()
      });
      
      // Update cache
      this.saveToCache();
      
      return tokenConfig;
    } catch (error) {
      console.error(`Failed to add token ${canisterId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get balance for a principal
   * @param {string} principalId - Principal in text format
   * @param {string} symbol - Token symbol
   */
  async getBalance(principalId, symbol = 'ICP') {
    console.log(`[TokenService] getBalance called for ${symbol}, principal: ${principalId}`);
    try {
      // Verify we have a valid principal
      if (!principalId) {
        console.error('[TokenService] No principal ID provided');
        return BigInt(0);
      }

      // Check if we already have the balance cached with principal prefix
      const tokenCacheKey = `${principalId}_${symbol}`;
      const cachedBalances = localStorage.getItem(TOKEN_BALANCES_KEY);
      if (cachedBalances && this.useCache === true) {
        try {
          const balancesData = JSON.parse(cachedBalances);
          if (balancesData[tokenCacheKey]) {
            const cachedBalance = BigInt(balancesData[tokenCacheKey]);
            console.log(`[TokenService] Using cached balance for ${symbol}: ${cachedBalance.toString()}`);
            
            // Also try a fresh fetch in the background if we're initialized
            if (this.initialized) {
              this._fetchFreshBalanceAsync(principalId, symbol);
            }
            
            return cachedBalance;
          }
        } catch (e) {
          console.warn('[TokenService] Error reading cached balance:', e);
        }
      }

      // FOR TESTING: Return a test balance if service is not initialized
      if (!this.initialized) {
        console.log(`[TokenService] Service not initialized, returning TEST balance for ${symbol}`);
        
        // Use specific test values for known tokens
        if (symbol === 'ICP') {
          const testBalance = BigInt(1000000000); // 10 ICP
          this.saveBalanceToCache(principalId, symbol, testBalance);
          return testBalance;
        }
        if (symbol === 'STDs') {
          const testBalance = BigInt(5000000000); // 50 STDs
          this.saveBalanceToCache(principalId, symbol, testBalance);
          return testBalance;
        }
        
        return BigInt(100000000); // Generic 1.0 token
      }

      // Get token configuration
      const token = this.supportedTokens.find(t => t.symbol === symbol);
      if (!token) {
        console.error(`[TokenService] Token ${symbol} not found in supported tokens`);
        return BigInt(0);
      }

      // Force refresh from blockchain depending on token type
      let balance;
      console.log(`[TokenService] Fetching ${symbol} balance from blockchain...`);
      
      if (token.standard === 'icp') {
        balance = await this.getIcpBalance(principalId);
        console.log(`[TokenService] Received ICP balance from blockchain: ${balance.toString()}`);
      } else if (token.standard === 'icrc1') {
        balance = await this.getIcrcBalance(principalId, token.canisterId);
        console.log(`[TokenService] Received ICRC1 balance from blockchain: ${balance.toString()}`);
      } else {
        console.error(`[TokenService] Unsupported token standard: ${token.standard}`);
        return BigInt(0);
      }

      // Cache the balance
      this.saveBalanceToCache(principalId, symbol, balance);

      return balance;
    } catch (error) {
      console.error(`[TokenService] Error fetching ${symbol} balance:`, error);
      return BigInt(0);
    }
  }
  
  /**
   * Save a token balance to cache
   * @param {string} principalId - Principal ID
   * @param {string} symbol - Token symbol
   * @param {bigint} balance - Token balance
   */
  saveBalanceToCache(principalId, symbol, balance) {
    try {
      // Get existing balances
      const cachedBalances = localStorage.getItem(TOKEN_BALANCES_KEY);
      let balances = {};
      
      if (cachedBalances) {
        try {
          balances = JSON.parse(cachedBalances);
        } catch (e) {
          console.warn('Error parsing cached balances, resetting:', e);
        }
      }
      
      // Add or update balance
      const key = `${principalId}_${symbol}`;
      balances[key] = balance.toString();
      
      // Save updated balances
      localStorage.setItem(TOKEN_BALANCES_KEY, JSON.stringify(balances));
      
      console.log(`Saved ${symbol} balance to cache: ${balance.toString()}`);
    } catch (error) {
      console.error('Error saving balance to cache:', error);
    }
  }
  
  /**
   * Get ICP balance for a principal
   * @param {string} principalId - Principal ID
   * @returns {Promise<BigInt>} - The balance in e8s
   */
  async getIcpBalance(principalId) {
    console.log(`[TokenService] Getting ICP balance for ${principalId}`);
    try {
      // Convert principal to account ID
      const principal = Principal.fromText(principalId);
      const accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
      console.log(`[TokenService] Converted to account ID: ${accountId}`);
      
      if (!this.agent || !this.icpLedger) {
        console.error("[TokenService] Agent or Ledger ICP not initialized");
        
        // Force trusted initialization if not initialized
        if (!this.initialized) {
          console.log("[TokenService] Attempting to create ICP ledger");
          try {
            this.icpLedger = IcpLedgerCanister.create({
              agent: this.agent || new HttpAgent(),
              canisterId: ICP_LEDGER_CANISTER_ID
            });
          } catch (initError) {
            console.error("[TokenService] Failed to create ICP ledger:", initError);
            return BigInt(0);
          }
        }

        if (!this.icpLedger) {
          return BigInt(0);
        }
      }
      
      console.log(`[TokenService] Fetching ICP balance from blockchain...`);
      
      // Use accountBalance method which is the correct method according to @dfinity/ledger-icp docs
      try {
        const balance = await this.icpLedger.accountBalance({ 
          accountIdentifier: accountId,
          certified: false
        });
        console.log(`[TokenService] Received ICP balance from blockchain: ${balance.toString()}`);
        return balance;
      } catch (error) {
        console.error("[TokenService] Error calling accountBalance:", error);
        return BigInt(0);
      }
    } catch (error) {
      console.error("[TokenService] Error getting ICP balance:", error);
      return BigInt(0);
    }
  }
  
  /**
   * Get the token actor for an ICRC token
   * @param {string} canisterId - The canister ID
   * @returns {Promise<Object>} - The token actor
   * @private
   */
  async getTokenActor(canisterId) {
    try {
      // Check if we already have a ledger
      const ledger = this.tokenLedgers.get(canisterId);
      if (ledger) {
        return ledger;
      }
      
      // If agent is not initialized, return null
      if (!this.agent) {
        console.warn(`[TokenService] Agent not initialized for canister ${canisterId}`);
        return null;
      }
      
      // Create a new ledger
      console.log(`[TokenService] Creating new ICRC ledger for ${canisterId}`);
      const newLedger = IcrcLedgerCanister.create({
        agent: this.agent,
        canisterId
      });
      
      // Store for future use
      this.tokenLedgers.set(canisterId, newLedger);
      
      return newLedger;
    } catch (error) {
      console.error(`[TokenService] Error creating token actor for ${canisterId}:`, error);
      return null;
    }
  }
  
  /**
   * Get ICRC token balance for a principal ID
   * @param {string} principalId - Principal ID to check balance for
   * @param {string} canisterId - Canister ID of the token ledger
   */
  async getIcrcBalance(principalId, canisterId) {
    console.log(`[TokenService] Getting ICRC balance for ${principalId} from canister ${canisterId}`);
    try {
      if (!this.agent) {
        console.error("[TokenService] Agent not initialized");
        return BigInt(0);
      }
      
      // Use IcrcLedgerCanister from @dfinity/ledger-icrc package
      try {
        // Create IcrcLedgerCanister instance if not already in tokenLedgers
        if (!this.tokenLedgers.has(canisterId) && this.agent) {
          try {
            const ledger = IcrcLedgerCanister.create({
              agent: this.agent,
              canisterId
            });
            this.tokenLedgers.set(canisterId, ledger);
          } catch (initError) {
            console.error(`[TokenService] Failed to create ICRC ledger for ${canisterId}:`, initError);
            return BigInt(0);
          }
        }
        
        const principal = Principal.fromText(principalId);
        const ledger = this.tokenLedgers.get(canisterId);
        
        if (!ledger) {
          console.error(`[TokenService] Ledger not available for ${canisterId}`);
          return BigInt(0);
        }
        
        console.log(`[TokenService] Fetching ICRC balance from blockchain...`);
        
        // Use the IcrcLedgerCanister.balance method as shown in the documentation
        const balance = await ledger.balance({
          owner: principal
        });
        
        console.log(`[TokenService] Received ICRC balance from blockchain: ${balance.toString()}`);
        return balance;
      } catch (balanceError) {
        console.error(`[TokenService] Error getting ICRC balance for ${canisterId}:`, balanceError);
        
        // Fallback to alternative methods
        try {
          console.log(`[TokenService] Trying fallback method with raw actor...`);
          const tokenActor = await this.getTokenActor(canisterId);
          
          if (!tokenActor) {
            console.error(`[TokenService] Token actor not available for ${canisterId}`);
            return BigInt(0);
          }
          
          // Try with icrc1_balance_of
          if (typeof tokenActor.icrc1_balance_of === 'function') {
            try {
              const principal = Principal.fromText(principalId);
              const balance = await tokenActor.icrc1_balance_of({ owner: principal });
              console.log(`[TokenService] Received ICRC balance using icrc1_balance_of: ${balance.toString()}`);
              return balance;
            } catch (err) {
              console.error(`[TokenService] icrc1_balance_of fallback failed:`, err);
            }
          }
          
          // Try with balance_of
          if (typeof tokenActor.balance_of === 'function') {
            try {
              const principal = Principal.fromText(principalId);
              const balance = await tokenActor.balance_of({ owner: principal });
              console.log(`[TokenService] Received ICRC balance using balance_of: ${balance.toString()}`);
              return balance;
            } catch (err) {
              console.error(`[TokenService] balance_of fallback failed:`, err);
            }
          }
        } catch (fallbackError) {
          console.error(`[TokenService] All fallback methods failed:`, fallbackError);
        }
        
        return BigInt(0);
      }
    } catch (error) {
      console.error(`[TokenService] Error getting ICRC balance from ${canisterId}:`, error);
      return BigInt(0);
    }
  }
  
  /**
   * Transfer ICP tokens
   * @param {Principal|string} to - Recipient principal or account identifier
   * @param {bigint} amount - Amount in e8s
   */
  async transferIcp(to, amount) {
    try {
      if (!this.icpLedger) {
        throw new Error('ICP ledger not initialized');
      }
      
      let accountIdentifier;
      
      if (typeof to === 'string') {
        // Check if it's a principal or an account ID
        if (to.includes('-')) {
          // It's a principal
          const toPrincipal = Principal.fromText(to);
          accountIdentifier = AccountIdentifier.fromPrincipal({ principal: toPrincipal });
        } else {
          // It's an account identifier in hex format
          accountIdentifier = to;
        }
      } else {
        // It's a Principal object
        accountIdentifier = AccountIdentifier.fromPrincipal({ principal: to });
      }
      
      // Use the correct parameters for transfer according to @dfinity/ledger-icp docs
      const request = {
        amount: { e8s: amount },
        to: accountIdentifier,
        fee: { e8s: BigInt(10000) },
        memo: BigInt(0),
        from_subaccount: [],
        created_at_time: []
      };
      
      const result = await this.icpLedger.transfer(request);
      
      return {
        success: true,
        blockHeight: result,
        token: 'ICP'
      };
    } catch (error) {
      console.error('Error transferring ICP:', error);
      return {
        success: false,
        error: error.message,
        token: 'ICP'
      };
    }
  }
  
  /**
   * Transfer ICRC tokens
   * @param {string|Principal} to - Recipient principal
   * @param {bigint} amount - Amount in token's smallest unit
   * @param {string} symbol - Token symbol
   */
  async transferIcrc(to, amount, symbol) {
    try {
      const tokenConfig = this.tokenConfigs.get(symbol);
      
      if (!tokenConfig) {
        throw new Error(`Token ${symbol} not supported`);
      }
      
      const ledger = this.tokenLedgers.get(tokenConfig.canisterId);
      
      if (!ledger) {
        throw new Error(`Ledger for ${symbol} not initialized`);
      }
      
      const toPrincipal = typeof to === 'string' ? Principal.fromText(to) : to;
      
      const blockIndex = await ledger.transfer({
        to: { owner: toPrincipal },
        amount,
        fee: tokenConfig.fee,
      });
      
      return {
        success: true,
        blockIndex,
        token: symbol
      };
    } catch (error) {
      console.error(`Error transferring ${symbol}:`, error);
      return {
        success: false,
        error: error.message,
        token: symbol
      };
    }
  }
  
  /**
   * Transfer tokens (unified method for both ICP and ICRC tokens)
   * @param {string} to - Recipient principal or account identifier
   * @param {bigint} amount - Amount in token's smallest unit
   * @param {string} symbol - Token symbol
   */
  async transfer(to, amount, symbol = 'ICP') {
    // Make sure we're initialized
    if (!this.initialized && !this.initializing) {
      await this.initialize();
    }
    
    const tokenConfig = this.tokenConfigs.get(symbol);
    
    if (!tokenConfig) {
      return {
        success: false,
        error: `Token ${symbol} not supported`,
        token: symbol
      };
    }
    
    if (tokenConfig.standard === 'icp') {
      return this.transferIcp(to, amount);
    } else {
      return this.transferIcrc(to, amount, symbol);
    }
  }
  
  /**
   * Format token amount for display with correct decimals
   * @param {bigint} amount - Amount in token's smallest unit
   * @param {string} symbol - Token symbol
   */
  formatAmount(amount, symbol = 'ICP') {
    const tokenConfig = this.tokenConfigs.get(symbol);
    
    if (!tokenConfig) {
      console.warn(`Token ${symbol} not found for formatting`);
      return '0.00';
    }
    
    const decimals = tokenConfig.decimals;
    const divisor = 10 ** decimals;
    const value = Number(amount) / divisor;
    
    return value.toFixed(decimals).replace(/\.?0+$/, '');
  }
  
  /**
   * Convert human-readable amount to token's smallest unit
   * @param {string|number} amount - Human readable amount
   * @param {string} symbol - Token symbol
   */
  toTokenAmount(amount, symbol = 'ICP') {
    const tokenConfig = this.tokenConfigs.get(symbol);
    
    if (!tokenConfig) {
      throw new Error(`Token ${symbol} not supported`);
    }
    
    const decimals = tokenConfig.decimals;
    const multiplier = 10 ** decimals;
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return BigInt(Math.round(value * multiplier));
  }
  
  /**
   * Get list of supported tokens
   */
  getSupportedTokens() {
    // Ensure we return an array even if supportedTokens isn't initialized properly
    return Array.isArray(this.supportedTokens) ? [...this.supportedTokens] : [];
  }

  /**
   * Get account ID from a principal
   * @param {string} principalId - Principal in text format
   * @returns {string} Account ID in hex format
   */
  getPrincipalAccountId(principalId) {
    try {
      const principal = Principal.fromText(principalId);
      const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
      return accountIdentifier.toHex();
    } catch (error) {
      console.error('Error converting principal to account ID:', error);
      throw error;
    }
  }

  // Fetch balance asynchronously in background without blocking UI
  _fetchFreshBalanceAsync(principalId, symbol) {
    console.log(`[TokenService] Starting background fetch for ${symbol}`);
    
    // Don't wait for this to complete
    setTimeout(async () => {
      try {
        // Check agent state first 
        if (!this.agent) {
          console.warn(`[TokenService] Cannot fetch ${symbol} in background: agent not initialized`);
          return;
        }
        
        // Get token configuration
        const token = this.supportedTokens.find(t => t.symbol === symbol);
        if (!token) {
          console.warn(`[TokenService] Cannot fetch ${symbol} in background: token not found`);
          return;
        }
        
        // Fetch from blockchain with timeout to prevent hanging
        let balance;
        let fetchSuccess = false;
        
        console.log(`[TokenService] Background fetching ${symbol} balance for ${principalId}...`);
        
        try {
          // Set a timeout for the blockchain fetch (30 seconds)
          const fetchPromise = Promise.race([
            (async () => {
              try {
                if (token.standard === 'icp') {
                  // Make sure ICP ledger is initialized
                  if (!this.icpLedger) {
                    console.log(`[TokenService] Initializing ICP ledger for background fetch`);
                    this.icpLedger = IcpLedgerCanister.create({
                      agent: this.agent,
                      canisterId: ICP_LEDGER_CANISTER_ID
                    });
                  }
                  return await this.getIcpBalance(principalId);
                } else if (token.standard === 'icrc1') {
                  // Make sure token ledger is initialized
                  if (!this.tokenLedgers.has(token.canisterId)) {
                    console.log(`[TokenService] Initializing ${symbol} ledger for background fetch`);
                    const ledger = IcrcLedgerCanister.create({
                      agent: this.agent,
                      canisterId: token.canisterId
                    });
                    this.tokenLedgers.set(token.canisterId, ledger);
                  }
                  return await this.getIcrcBalance(principalId, token.canisterId);
                }
                throw new Error(`Unsupported token standard: ${token.standard}`);
              } catch (innerError) {
                console.error(`[TokenService] Inner fetch error: ${innerError.message}`);
                throw innerError;
              }
            })(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Background balance fetch timed out')), 30000)
            )
          ]);
          
          balance = await fetchPromise;
          fetchSuccess = true;
        } catch (fetchError) {
          console.warn(`[TokenService] Background fetch error: ${fetchError.message}`);
          // For background fetches, just log the error and continue
          fetchSuccess = false;
        }
        
        if (fetchSuccess) {
          console.log(`[TokenService] Background fetch complete for ${symbol}: ${balance.toString()}`);
          
          // Cache the balance
          this.saveBalanceToCache(principalId, symbol, balance);
          
          // Publish update event for components to listen to
          window.dispatchEvent(new CustomEvent('token-balance-updated', {
            detail: { 
              symbol, 
              balance,
              principalId,
              timestamp: Date.now()
            }
          }));
          
          console.log(`[TokenService] Dispatched token-balance-updated event for ${symbol}`);
        }
      } catch (e) {
        console.warn(`[TokenService] Background fetch error for ${symbol}:`, e);
      }
    }, 0);
  }

  /**
   * Force trusted initialization - use this when blockchain connections fail
   * but you still need the service to be considered initialized
   * @param {Identity} identity - User identity
   * @param {string} host - Host URL
   */
  forceTrustedInitialization(identity, host = 'https://ic0.app') {
    console.log('[TokenService] Using force trusted initialization');
    
    // Create agent with identity
    if (!this.agent && identity) {
      this.agent = new HttpAgent({ identity, host });
      console.log('[TokenService] Created new agent with identity');
    } else if (!this.agent) {
      this.agent = new HttpAgent({ host });
      console.log('[TokenService] Created new agent without identity');
    } else {
      console.log('[TokenService] Using existing agent');
    }
    
    // Initialize ICP ledger if needed
    if (!this.icpLedger) {
      try {
        console.log('[TokenService] Initializing ICP ledger');
        this.icpLedger = IcpLedgerCanister.create({
          agent: this.agent,
          canisterId: ICP_LEDGER_CANISTER_ID
        });
        console.log('[TokenService] ICP ledger initialized');
      } catch (error) {
        console.error('[TokenService] Failed to initialize ICP ledger:', error);
      }
    }
    
    // Initialize STDs token ledger if needed
    if (!this.tokenLedgers.has(STARDUST_TOKEN_CANISTER_ID)) {
      try {
        console.log('[TokenService] Initializing STDs token ledger');
        const ledger = IcrcLedgerCanister.create({
          agent: this.agent,
          canisterId: STARDUST_TOKEN_CANISTER_ID
        });
        this.tokenLedgers.set(STARDUST_TOKEN_CANISTER_ID, ledger);
        console.log('[TokenService] STDs token ledger initialized');
      } catch (error) {
        console.error('[TokenService] Failed to initialize STDs token ledger:', error);
      }
    }
    
    // Set up default tokens
    this._setupDefaultTokens();
    
    // Mark as initialized immediately
    this.initialized = true;
    this.initializing = false;
    
    // Save to cache
    this.saveToCache();
    
    console.log('[TokenService] Force trusted initialization complete');
    return this;
  }

  /**
   * Renew agent connection - use this when we suspect the agent might be stale
   * @param {Identity} identity - User identity
   * @param {string} host - Host URL
   */
  renewAgentConnection(identity, host = 'https://ic0.app') {
    try {
      console.log('[TokenService] Renewing agent connection');
      
      // Force create a new agent
      if (identity) {
        this.agent = new HttpAgent({ identity, host });
        console.log('[TokenService] Created new agent with identity');
      } else {
        this.agent = new HttpAgent({ host });
        console.log('[TokenService] Created new agent without identity');
      }
      
      // Recreate ICP ledger
      try {
        console.log('[TokenService] Recreating ICP ledger');
        this.icpLedger = IcpLedgerCanister.create({
          agent: this.agent,
          canisterId: ICP_LEDGER_CANISTER_ID
        });
      } catch (error) {
        console.error('[TokenService] Failed to recreate ICP ledger:', error);
      }
      
      // Clear token ledgers so they'll be recreated on next use
      this.tokenLedgers.clear();
      
      console.log('[TokenService] Agent connection renewed');
      return true;
    } catch (error) {
      console.error('[TokenService] Failed to renew agent connection:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const tokenService = new TokenService();
export default tokenService; 