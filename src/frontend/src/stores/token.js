import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth.js';
import { useCanisterStore } from './canister.js';
import { AccountIdentifier } from '@dfinity/ledger-icp';
// DO NOT IMPORT TOKEN SERVICE HERE

// Simple placeholder that does nothing but return defaults
const dummyService = {
  formatAmount: (amount, symbol) => "0.00",
  getSupportedTokens: () => [],
  getBalance: async () => BigInt(0),
  addToken: async () => ({ symbol: 'UNKNOWN', name: 'Unknown Token' }),
  transfer: async () => ({ success: false, error: 'Service not ready' }),
  toTokenAmount: (amount) => BigInt(0),
  initialize: async () => {},
  getPrincipalAccountId: (principal) => {
    try {
      return AccountIdentifier.fromPrincipal({ 
        principal: Principal.fromText(principal) 
      }).toHex();
    } catch (e) {
      return '';
    }
  }
};

// Cache key
const TOKEN_CACHE_KEY = 'cosmicrafts-token-cache';

export const useTokenStore = defineStore('token', {
  state: () => ({
    balances: {},
    tokens: [],
    currentToken: 'ICP',
    loading: false,
    accountId: null,
    principalId: null,
    initialized: false,
    serviceReady: false,
    service: dummyService
  }),
  
  getters: {
    /**
     * Get the formatted balance for the current token
     */
    formattedBalance: (state) => {
      const balance = state.balances[state.currentToken];
      if (!balance) return '0.00';
      
      try {
        const token = state.tokens.find(t => t.symbol === state.currentToken);
        if (!token) return '0.00';
        
        const decimals = token.decimals || 8;
        const divisor = 10 ** decimals;
        const value = Number(balance) / divisor;
        return value.toFixed(2);
      } catch (e) {
        return '0.00';
      }
    },
    
    /**
     * Get all supported tokens
     */
    supportedTokens: (state) => {
      return state.tokens;
    }
  },
  
  actions: {
    /**
     * Initialize the token store
     */
    async initialize() {
      if (this.initialized) return;
      
      console.log('TokenStore initializing - cached data only');
      
      // Set up a basic default token to prevent UI delays
      this.tokens = [{
        symbol: 'ICP',
        name: 'Internet Computer Protocol',
        standard: 'icp',
        decimals: 8,
        canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        fee: '10000'
      }];
      
      // Mark as initialized immediately - we'll load the service later
      this.initialized = true;
      this.loading = false;
      
      // Load cached data in a microtask to prevent blocking the main thread
      Promise.resolve().then(() => this.quickInitFromCache());
      
      // Load service in the background AFTER UI is rendered
      setTimeout(() => {
        this.loadServiceAndData().catch(e => 
          console.warn('Background token loading error:', e)
        );
      }, 500); // Half-second delay to ensure UI is rendered
      
      return true;
    },
    
    /**
     * Load the real token service and data in background
     */
    async loadServiceAndData() {
      try {
        console.log('Loading TokenService in background...');
        
        // Dynamically import the service
        const { tokenService } = await import('../services/TokenService.js');
        this.service = tokenService;
        
        // Now load live data
        this.loadLiveData();
        
        console.log('TokenService loaded successfully');
      } catch (error) {
        console.error('Failed to load TokenService:', error);
      }
    },
    
    /**
     * Quick initialization from cache - synchronous and fast
     */
    quickInitFromCache() {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated()) {
          console.log('TokenStore: User not authenticated');
          return false;
        }
        
        const identity = authStore.getIdentity();
        if (!identity) {
          console.log('TokenStore: Identity not available');
          return false;
        }
        
        // Get principal and account IDs immediately
        const principal = identity.getPrincipal();
        this.principalId = principal.toString();
        this.accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
        
        // Load cached data
        this.loadFromCache();
        
        // Set default tokens while waiting for real data
        if (this.tokens.length === 0) {
          this.tokens = [
            {
              symbol: 'ICP',
              name: 'Internet Computer Protocol',
              standard: 'icp',
              decimals: 8,
              canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
              fee: '10000'
            }
          ];
        }
        
        return true;
      } catch (error) {
        console.error('Failed to load cached token data:', error);
        
        // Still add default token
        this.tokens = [
          {
            symbol: 'ICP',
            name: 'Internet Computer Protocol', 
            standard: 'icp',
            decimals: 8,
            fee: '10000'
          }
        ];
        
        return false;
      }
    },
    
    /**
     * Load live data from blockchain in background
     */
    async loadLiveData() {
      try {
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        // Initialize token service
        await this.service.initialize(identity);
        this.serviceReady = true;
        
        // Load supported tokens
        const supportedTokens = this.service.getSupportedTokens();
        if (supportedTokens && supportedTokens.length > 0) {
          // Convert any BigInt to strings to avoid serialization issues
          this.tokens = supportedTokens.map(token => ({
            ...token,
            fee: token.fee ? token.fee.toString() : '0'
          }));
        }
        
        // Get balance for current token
        this.refreshBalance().catch(e => 
          console.warn(`Error refreshing balance: ${e.message}`)
        );
        
        // Save to cache
        this.saveToCache();
      } catch (error) {
        console.error('Failed to load live blockchain data:', error);
      }
    },
    
    /**
     * Load data from cache
     */
    loadFromCache() {
      try {
        const cachedData = localStorage.getItem(TOKEN_CACHE_KEY);
        if (!cachedData) return false;
        
        const data = JSON.parse(cachedData);
        
        // Restore tokens list
        if (data.tokens) {
          this.tokens = data.tokens;
        }
        
        // Restore balances (convert string to BigInt)
        if (data.balances) {
          const convertedBalances = {};
          for (const token in data.balances) {
            try {
              convertedBalances[token] = BigInt(data.balances[token]);
            } catch (e) {
              convertedBalances[token] = BigInt(0);
            }
          }
          this.balances = convertedBalances;
        }
        
        // Restore current token
        if (data.currentToken) {
          this.currentToken = data.currentToken;
        }
        
        return true;
      } catch (error) {
        console.error('Error loading from cache:', error);
        return false;
      }
    },
    
    /**
     * Save data to cache
     */
    saveToCache() {
      try {
        // Convert BigInt values to strings for storage
        const balancesToStore = {};
        for (const token in this.balances) {
          balancesToStore[token] = this.balances[token].toString();
        }
        
        // Ensure tokens have string fees, not BigInt
        const tokensToStore = this.tokens.map(token => ({
          ...token,
          fee: typeof token.fee === 'bigint' ? token.fee.toString() : (token.fee || '0')
        }));
        
        const dataToStore = {
          tokens: tokensToStore,
          balances: balancesToStore,
          currentToken: this.currentToken,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Error saving to cache:', error);
      }
    },
    
    /**
     * Change the current token
     * @param {string} symbol - Token symbol
     */
    async changeToken(symbol) {
      this.currentToken = symbol;
      
      // Save changes to cache
      this.saveToCache();
      
      // Try to refresh balance if service is ready
      if (this.serviceReady) {
        this.refreshBalance().catch(e => 
          console.warn(`Error refreshing ${symbol} balance: ${e.message}`)
        );
      }
    },
    
    /**
     * Get the balance for the current token
     */
    async refreshBalance() {
      try {
        if (!this.serviceReady) return BigInt(0);
        
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        if (!identity) return BigInt(0);
        
        const principalId = identity.getPrincipal().toString();
        const balance = await this.service.getBalance(principalId, this.currentToken);
        
        // Update balance in state
        this.balances[this.currentToken] = balance;
        
        // Save to cache
        this.saveToCache();
        
        return balance;
      } catch (error) {
        console.error(`Failed to get balance for ${this.currentToken}:`, error);
        return BigInt(0);
      }
    },
    
    /**
     * Get balance for a specific token
     * @param {string} symbol - Token symbol
     */
    async getBalance(symbol) {
      try {
        // If service not ready, return cached balance or 0
        if (!this.serviceReady) {
          return this.balances[symbol] || BigInt(0);
        }
        
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        if (!identity) return BigInt(0);
        
        const principalId = identity.getPrincipal().toString();
        const balance = await this.service.getBalance(principalId, symbol);
        
        // Update balance in state
        this.balances[symbol] = balance;
        
        // Save to cache
        this.saveToCache();
        
        return balance;
      } catch (error) {
        console.error(`Failed to get balance for ${symbol}:`, error);
        return this.balances[symbol] || BigInt(0);
      }
    },
    
    /**
     * Add a custom token by canister ID
     * @param {string} canisterId - Token canister ID
     * @returns {Object} Added token
     */
    async addToken(canisterId) {
      if (!this.serviceReady) {
        throw new Error('Token service not ready yet');
      }
      
      try {
        const newToken = await this.service.addToken(canisterId);
        
        // Create a safe version without BigInt
        const safeToken = {
          ...newToken,
          fee: newToken.fee ? newToken.fee.toString() : '0'
        };
        
        // Update tokens list with safe values
        const supportedTokens = this.service.getSupportedTokens();
        this.tokens = supportedTokens.map(token => ({
          ...token,
          fee: typeof token.fee === 'bigint' ? token.fee.toString() : (token.fee || '0')
        }));
        
        // Save to cache
        this.saveToCache();
        
        return safeToken;
      } catch (error) {
        console.error('Failed to add token:', error);
        throw error;
      }
    },
    
    /**
     * Transfer tokens to a recipient
     * @param {string} recipient - Recipient account/principal ID
     * @param {string|number} amount - Human-readable amount
     * @param {string} [symbol] - Token symbol (defaults to current token)
     * @returns {Object} Transfer result
     */
    async transferTokens(recipient, amount, symbol = null) {
      if (!this.serviceReady) {
        throw new Error('Token service not ready yet');
      }
      
      try {
        const tokenSymbol = symbol || this.currentToken;
        
        // Convert human-readable amount to token's smallest unit
        const amountInSmallestUnit = this.service.toTokenAmount(amount, tokenSymbol);
        
        // Perform transfer
        const result = await this.service.transfer(recipient, amountInSmallestUnit, tokenSymbol);
        
        // Refresh balance if transfer was successful
        if (result.success) {
          await this.refreshBalance();
        }
        
        return result;
      } catch (error) {
        console.error(`Failed to transfer ${this.currentToken}:`, error);
        throw error;
      }
    },
    
    /**
     * Convert principal to account ID
     * @param {string} principalId - Principal ID
     * @returns {string} Account ID
     */
    principalToAccountId(principalId) {
      try {
        const principal = Principal.fromText(principalId);
        return AccountIdentifier.fromPrincipal({ principal }).toHex();
      } catch (error) {
        console.error('Failed to convert principal to account ID:', error);
        throw error;
      }
    }
  }
});

export default useTokenStore;