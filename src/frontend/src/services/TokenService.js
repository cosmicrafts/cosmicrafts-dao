import { HttpAgent } from '@dfinity/agent';
import { LedgerCanister as IcpLedgerCanister, AccountIdentifier } from '@dfinity/ledger-icp';
import { IcrcLedgerCanister, mapTokenMetadata } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';

// Constants
const ICP_LEDGER_CANISTER_ID = 'ryjl3-tyaaa-aaaaa-aaaba-cai';
const COSMIC_TOKEN_CANISTER_ID = 'opcce-byaaa-aaaak-qcgda-cai'; // Replace with your token's canister ID

class TokenService {
  constructor() {
    this.agent = null;
    this.icpLedger = null;
    this.tokenLedgers = new Map();
    this.tokenConfigs = new Map();
    this.supportedTokens = [];
  }

  /**
   * Initialize the token service
   * @param {Identity} identity - User identity
   * @param {string} host - Host URL
   */
  async initialize(identity, host = 'https://ic0.app') {
    console.log('Initializing TokenService...');
    
    // Create agent with identity
    this.agent = new HttpAgent({ identity, host });
    
    if (host.includes('127.0.0.1') || host.includes('localhost')) {
      await this.agent.fetchRootKey();
    }
    
    // Initialize tokens
    await this.initializeTokens();
    
    return this;
  }
  
  /**
   * Initialize default tokens
   */
  async initializeTokens() {
    this.supportedTokens = [];
    this.tokenConfigs.clear();
    this.tokenLedgers.clear();
    
    try {
      // Initialize ICP
      console.log('Initializing ICP token...');
      const icpConfig = await this.initializeIcpToken();
      this.supportedTokens.push(icpConfig);
      
      // Initialize COSMIC token
      try {
        console.log('Initializing COSMIC token...');
        const cosmicConfig = await this.initializeIcrcToken(COSMIC_TOKEN_CANISTER_ID);
        this.supportedTokens.push(cosmicConfig);
      } catch (error) {
        console.error('Failed to initialize COSMIC token:', error);
      }
      
      console.log(`Initialized ${this.supportedTokens.length} tokens:`, this.supportedTokens);
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
      
      // Add a fallback ICP token if initialization fails
      if (this.supportedTokens.length === 0) {
        const fallbackIcp = {
          symbol: 'ICP',
          name: 'Internet Computer Protocol',
          standard: 'icp',
          decimals: 8,
          canisterId: ICP_LEDGER_CANISTER_ID,
          fee: BigInt(10000)
        };
        
        this.supportedTokens.push(fallbackIcp);
        this.tokenConfigs.set('ICP', fallbackIcp);
      }
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
      
      // Method 1: Use the official metadata method
      try {
        const metadataResponse = await icrcLedger.metadata({
          certified: true
        });
        
        // Use the official mapper function from the library
        tokenInfo = mapTokenMetadata(metadataResponse);
        
        if (!tokenInfo) {
          throw new Error('Failed to map token metadata');
        }
        
        console.log('Metadata successfully mapped:', tokenInfo);
      } catch (metadataError) {
        console.warn('Error with metadata mapping:', metadataError);
        
        // Method 2: Parse metadata manually as fallback
        try {
          const metadata = await icrcLedger.metadata({
            certified: true
          });
          
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
            symbol: findValue('icrc1:symbol'),
            name: findValue('icrc1:name'),
            decimals: Number(findValue('icrc1:decimals')),
            logo: findValue('icrc1:logo')
          };
          
          console.log('Manually parsed metadata:', tokenInfo);
        } catch (fallbackError) {
          console.error('Failed to parse metadata manually:', fallbackError);
          throw fallbackError;
        }
      }
      
      // Get fee
      try {
        fee = await icrcLedger.transactionFee({
          certified: true
        });
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
      
      // Initialize as ICRC token
      const tokenConfig = await this.initializeIcrcToken(canisterId);
      this.supportedTokens.push(tokenConfig);
      
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
    const principal = Principal.fromText(principalId);
    const tokenConfig = this.tokenConfigs.get(symbol);
    
    if (!tokenConfig) {
      throw new Error(`Token ${symbol} not supported`);
    }
    
    if (tokenConfig.standard === 'icp') {
      return this.getIcpBalance(principal);
    } else {
      return this.getIcrcBalance(principal, tokenConfig.canisterId);
    }
  }
  
  /**
   * Get ICP balance
   * @param {Principal} principal 
   */
  async getIcpBalance(principal) {
    try {
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
    return [...this.supportedTokens];
  }
}

// Create and export a singleton instance
export const tokenService = new TokenService();
export default tokenService; 