import { HttpAgent } from '@dfinity/agent';
import { LedgerCanister as IcpLedgerCanister, AccountIdentifier } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister, mapTokenMetadata } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';

// Constants
const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
const STARDUST_TOKEN_CANISTER_ID = 'opcce-byaaa-aaaak-qcgda-cai'; // Replace with your token's canister ID

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
      // Load token configs
      const cachedConfigs = localStorage.getItem(TOKEN_CONFIGS_KEY);
      if (cachedConfigs) {
        const configs = JSON.parse(cachedConfigs);
        
        // Convert fee from string to BigInt
        configs.forEach(config => {
          this.tokenConfigs.set(config.symbol, {
            ...config,
            fee: BigInt(config.fee || '0')
          });
        });
      }
      
      // Load supported tokens
      const cachedTokens = localStorage.getItem(TOKEN_CACHE_KEY);
      if (cachedTokens) {
        try {
          const parsedTokens = JSON.parse(cachedTokens);
          if (Array.isArray(parsedTokens)) {
            this.supportedTokens = parsedTokens;
          } else {
            console.warn('Cached tokens is not an array, resetting');
            this.supportedTokens = [];
          }
        } catch (e) {
          console.error('Error parsing cached tokens:', e);
          this.supportedTokens = [];
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
      // Ensure supportedTokens is an array
      this.supportedTokens = [];
    }
  }
  
  /**
   * Save current state to cache
   */
  saveToCache() {
    try {
      // Ensure supportedTokens is an array before saving
      if (!Array.isArray(this.supportedTokens)) {
        this.supportedTokens = [];
      }
      
      // Save token configs (convert BigInt to string)
      const configsToSave = Array.from(this.tokenConfigs.values()).map(config => ({
        ...config,
        fee: typeof config.fee === 'bigint' ? config.fee.toString() : config.fee
      }));
      
      localStorage.setItem(TOKEN_CONFIGS_KEY, JSON.stringify(configsToSave));
      
      // Save supported tokens (already should be serializable)
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(this.supportedTokens));
      
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
    } catch (error) {
      console.error('Error in TokenService initialization:', error);
      this.initializing = false;
      
      // Even if there's an error, set initialized to true if we have at least ICP
      if (this.tokenConfigs.has('ICP')) {
        this.initialized = true;
      }
    }
  }
  
  /**
   * Initialize COSMIC token with timeout protection
   */
  async initializeCosmicToken() {
    try {
      console.log('Initializing Stardust token in background...');
      
      // Use Promise.race with a timeout to prevent hanging
      const stardustConfig = await Promise.race([
        this.initializeIcrcToken(STARDUST_TOKEN_CANISTER_ID),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stardust token initialization timed out')), 10000)
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
      // No need to throw - this is a background operation
      return null;
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
      
      // Set a timeout for the metadata fetch
      const metadataPromise = Promise.race([
        icrcLedger.metadata({ certified: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Metadata fetch timed out')), 5000)
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
          // Set a timeout for the metadata fetch
          const fallbackMetadataPromise = Promise.race([
            icrcLedger.metadata({ certified: true }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Fallback metadata fetch timed out')), 5000)
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
      
      // Get fee with timeout
      try {
        const feePromise = Promise.race([
          icrcLedger.transactionFee({ certified: true }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fee fetch timed out')), 5000)
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
      
      return tokenConfig;
    } catch (error) {
      console.error(`Failed to initialize ICRC token ${canisterId}:`, error);
      // For known tokens, use default values instead of failing
      if (canisterId === STARDUST_TOKEN_CANISTER_ID) {
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
    const tokenConfig = this.tokenConfigs.get(symbol);
    
    if (!tokenConfig) {
      throw new Error(`Token ${symbol} not supported`);
    }
    
    // Try to get from cache first
    const cachedBalances = localStorage.getItem(TOKEN_BALANCES_KEY);
    let cachedBalance;
    
    if (cachedBalances) {
      try {
        const balances = JSON.parse(cachedBalances);
        const key = `${principalId}_${symbol}`;
        if (balances[key]) {
          cachedBalance = BigInt(balances[key]);
        }
      } catch (e) {
        console.warn('Error parsing cached balances:', e);
      }
    }
    
    // If agent is not initialized or initializing, return cached balance
    if (!this.agent || !this.initialized) {
      if (cachedBalance) {
        console.log(`Using cached balance for ${symbol}: ${cachedBalance}`);
        
        // Try to initialize in background if needed
        if (!this.initializing && !this.initialized) {
          console.log('Triggering background initialization from getBalance');
          setTimeout(() => {
            this.initialize()
              .catch(e => console.warn('Error in background initialization:', e));
          }, 0);
        }
        
        return cachedBalance;
      }
      
      // No cached balance, return 0 for now
      return BigInt(0);
    }
    
    // Get live balance
    try {
      const principal = Principal.fromText(principalId);
      let balance;
      
      if (tokenConfig.standard === 'icp') {
        balance = await this.getIcpBalance(principal);
      } else {
        balance = await this.getIcrcBalance(principal, tokenConfig.canisterId);
      }
      
      // Update cache
      const cachedBalances = localStorage.getItem(TOKEN_BALANCES_KEY);
      let balances = {};
      
      if (cachedBalances) {
        try {
          balances = JSON.parse(cachedBalances);
        } catch (e) {}
      }
      
      balances[`${principalId}_${symbol}`] = balance.toString();
      localStorage.setItem(TOKEN_BALANCES_KEY, JSON.stringify(balances));
      
      return balance;
    } catch (error) {
      console.error(`Error getting ${symbol} balance:`, error);
      
      // Return cached balance if available, otherwise 0
      return cachedBalance || BigInt(0);
    }
  }
  
  /**
   * Get ICP balance
   * @param {Principal} principal 
   */
  async getIcpBalance(principal) {
    try {
      if (!this.icpLedger) {
        throw new Error('ICP ledger not initialized');
      }
      
      // Create account identifier from principal
      const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
      
      const balance = await this.icpLedger.accountBalance({
        accountIdentifier
      });
      
      return balance;
    } catch (error) {
      console.error('Error getting ICP balance:', error);
      throw error;
    }
  }
  
  /**
   * Get ICRC token balance
   * @param {Principal} principal 
   * @param {string} canisterId 
   */
  async getIcrcBalance(principal, canisterId) {
    const ledger = this.tokenLedgers.get(canisterId);
    
    if (!ledger) {
      throw new Error(`Ledger for canister ${canisterId} not initialized`);
    }
    
    try {
      const balance = await ledger.balance({
        owner: principal,
        certified: true
      });
      
      return balance;
    } catch (error) {
      console.error(`Error getting balance for ${canisterId}:`, error);
      throw error;
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
      
      const result = await this.icpLedger.transfer({
        amount,
        to: accountIdentifier,
        memo: BigInt(0)
      });
      
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
}

// Create and export a singleton instance
export const tokenService = new TokenService();
export default tokenService; 