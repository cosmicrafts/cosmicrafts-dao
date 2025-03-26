import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth.js';
import { useCanisterStore } from './canister.js';
import { AccountIdentifier } from '@dfinity/ledger-icp';
// Import TokenService directly instead of using dynamic import
import { tokenService } from '../services/TokenService.js';

// Cache keys
const TOKEN_CACHE_KEY = 'cosmicrafts-token-cache';
const BALANCES_CACHE_KEY = 'cosmicrafts-token-balances';

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
    // Use the real service directly instead of a dummy
    service: tokenService
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
      if (this.initialized) return true;
      
      console.log('TokenStore initializing - cached data only');
      
      // Set up a basic default token to prevent UI delays
      this.tokens = [{
        symbol: 'ICP',
        name: 'Internet Computer Protocol',
        standard: 'icp',
        decimals: 8,
        canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
        fee: '10000'
      },
      {
        symbol: 'STDs',
        name: 'Stardust',
        standard: 'icrc1',
        decimals: 8,
        canisterId: 'opcce-byaaa-aaaak-qcgda-cai',
        fee: '10000'
      }];
      
      // Immediately load cached data (synchronously)
      this.quickInitFromCache();
      
      // Mark as initialized immediately - we'll load the service in background
      this.initialized = true;
      this.loading = false;
      
      // Load service in the background AFTER UI is rendered
      setTimeout(() => {
        this.loadServiceAndData().catch(e => 
          console.warn('Background token loading error:', e)
        );
      }, 10); // Reduced delay to ensure faster background loading
      
      return true;
    },
    
    /**
     * Load the real token service and data in background
     */
    async loadServiceAndData() {
      try {
        console.log('Loading TokenService data in background...');
        
        // TokenService is now directly imported, not dynamically
        // We just need to ensure it's initialized
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        // Try regular initialization first
        await this.service.initialize(identity)
          .catch(e => {
            console.warn('TokenService initialization error, using trusted initialization:', e);
            // Force initialization even if blockchain connection fails
            this.service.forceTrustedInitialization(identity);
          });
        
        this.serviceReady = true;
        
        // Now load live data
        this.loadLiveData();
        
        console.log('TokenService data loaded successfully');
      } catch (error) {
        console.error('Failed to load TokenService data:', error);
        
        // Fallback: ensure service is ready by forcing initialization
        if (!this.serviceReady) {
          const authStore = useAuthStore();
          const identity = authStore.getIdentity();
          this.service.forceTrustedInitialization(identity);
          this.serviceReady = true;
        }
      }
    },
    
    /**
     * Quick initialization from cache - synchronous and fast
     */
    quickInitFromCache() {
      try {
        // Always ensure we have default tokens regardless of authentication
        const defaultTokens = [
          {
            symbol: 'ICP',
            name: 'Internet Computer Protocol',
            standard: 'icp',
            decimals: 8,
            canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            fee: '10000'
          },
          {
            symbol: 'STDs',
            name: 'Stardust',
            standard: 'icrc1',
            decimals: 8,
            canisterId: 'opcce-byaaa-aaaak-qcgda-cai',
            fee: '10000'
          }
        ];

        // Set tokens to defaults immediately - will be overridden by cache if available
        this.tokens = [...defaultTokens];
        
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated()) {
          console.log('TokenStore: User not authenticated, using defaults');
          return true; // Return true since we have default tokens
        }
        
        const identity = authStore.getIdentity();
        if (!identity) {
          console.log('TokenStore: Identity not available, using defaults');
          return true; // Return true since we have default tokens
        }
        
        // Get principal and account IDs immediately
        const principal = identity.getPrincipal();
        this.principalId = principal.toString();
        this.accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
        
        // Load cached data
        const loadedFromCache = this.loadFromCache();
        
        // Set default tokens if we couldn't load from cache or if tokens array is empty
        if (!loadedFromCache || this.tokens.length === 0) {
          this.tokens = [...defaultTokens];
        }
        
        return true;
      } catch (error) {
        console.error('Failed to load cached token data:', error);
        
        // Always ensure we have default tokens on error
        this.tokens = [
          {
            symbol: 'ICP',
            name: 'Internet Computer Protocol', 
            standard: 'icp',
            decimals: 8,
            canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            fee: '10000'
          },
          {
            symbol: 'STDs',
            name: 'Stardust',
            standard: 'icrc1',
            decimals: 8,
            canisterId: 'opcce-byaaa-aaaak-qcgda-cai',
            fee: '10000'
          }
        ];
        
        return true; // Return true since we have default tokens
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
        let hasLoaded = false;
        
        // First try to load balances from dedicated cache
        const cachedBalancesData = localStorage.getItem(BALANCES_CACHE_KEY);
        if (cachedBalancesData) {
          try {
            const balancesData = JSON.parse(cachedBalancesData);
            const authStore = useAuthStore();
            const principalId = authStore.getIdentity()?.getPrincipal().toString();
            
            if (principalId) {
              // Convert balances with principal prefix to simple token map
              const convertedBalances = {};
              Object.keys(balancesData).forEach(key => {
                if (key.startsWith(`${principalId}_`)) {
                  const token = key.split('_')[1];
                  try {
                    convertedBalances[token] = BigInt(balancesData[key]);
                    console.log(`Loaded cached balance for ${token}: ${convertedBalances[token]}`);
                  } catch (e) {
                    console.warn(`Error converting balance for ${token}:`, e);
                  }
                }
              });
              
              if (Object.keys(convertedBalances).length > 0) {
                this.balances = convertedBalances;
                hasLoaded = true;
              }
            }
          } catch (e) {
            console.error('Error parsing cached balances data:', e);
          }
        }
        
        // Then load token data from general cache
        const cachedData = localStorage.getItem(TOKEN_CACHE_KEY);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          
          // Restore tokens list
          if (data.tokens) {
            this.tokens = data.tokens;
            hasLoaded = true;
          }
          
          // Restore balances from general cache if we haven't loaded from dedicated cache
          if (!hasLoaded && data.balances) {
            const convertedBalances = {};
            for (const token in data.balances) {
              try {
                convertedBalances[token] = BigInt(data.balances[token]);
              } catch (e) {
                convertedBalances[token] = BigInt(0);
              }
            }
            this.balances = convertedBalances;
            hasLoaded = true;
          }
          
          // Restore current token
          if (data.currentToken) {
            this.currentToken = data.currentToken;
            hasLoaded = true;
          }
        }
        
        return hasLoaded;
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
        
        // Save token data
        const dataToStore = {
          tokens: tokensToStore,
          balances: balancesToStore,
          currentToken: this.currentToken,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(dataToStore));
        
        // Also save balances in the principal-prefixed format
        // This allows TokenService to use the same cached balances
        if (this.principalId) {
          const authStore = useAuthStore();
          const principalId = authStore.getIdentity()?.getPrincipal().toString();
          
          if (principalId) {
            // Get existing balances first
            const existingBalancesStr = localStorage.getItem(BALANCES_CACHE_KEY);
            let existingBalances = {};
            
            try {
              if (existingBalancesStr) {
                existingBalances = JSON.parse(existingBalancesStr);
              }
            } catch (e) {
              console.warn('Error parsing existing balances, starting fresh:', e);
            }
            
            // Update with current balances
            for (const token in this.balances) {
              existingBalances[`${principalId}_${token}`] = this.balances[token].toString();
            }
            
            // Save back to cache
            localStorage.setItem(BALANCES_CACHE_KEY, JSON.stringify(existingBalances));
          }
        }
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
     * Refresh token balance for current token
     */
    async refreshBalance() {
      if (!this.serviceReady || !this.principalId) {
        return false;
      }
      
      try {
        this.loading = true;
        
        // Start with current token
        const symbol = this.currentToken;
        
        // Non-blocking approach: get balance in background
        this.getBalance(symbol)
          .then(balance => {
            // Update balance once retrieved
            this.balances[symbol] = balance;
            this.saveToCache();
          })
          .catch(error => {
            console.error(`Error refreshing ${symbol} balance:`, error);
          })
          .finally(() => {
            this.loading = false;
          });
        
        return true;
      } catch (error) {
        console.error('Error refreshing balance:', error);
        this.loading = false;
        return false;
      }
    },
    
    /**
     * Get balance for a specific token
     * @param {string} symbol - Token symbol
     * @param {string} [principalId] - Optional specific principal ID to use (otherwise uses authenticated user)
     * @returns {BigInt} Token balance
     */
    async getBalance(symbol, principalId = null) {
      try {
        console.log(`[TokenStore] Getting balance for ${symbol}${principalId ? ` (principal: ${principalId})` : ''}`);
        
        // If service not ready, try to force initialization
        if (!this.serviceReady) {
          console.log(`[TokenStore] Service not ready, attempting force initialization`);
          const authStore = useAuthStore();
          const identity = authStore.getIdentity();
          
          if (identity) {
            this.service.forceTrustedInitialization(identity);
            this.serviceReady = true;
          } else {
            console.log(`[TokenStore] Service not ready and no identity available, returning cached balance for ${symbol}`);
            return this.balances[symbol] || BigInt(0);
          }
        }
        
        const authStore = useAuthStore();
        
        let principal = principalId;
        if (!principalId) {
          // Use authenticated user's principal
          if (!authStore.isAuthenticated()) {
            console.warn('[TokenStore] User not authenticated, returning cached balance');
            return this.balances[symbol] || BigInt(0);
          }
          
          const identity = authStore.getIdentity();
          if (!identity) {
            console.warn('[TokenStore] Identity not available, returning cached balance');
            return this.balances[symbol] || BigInt(0);
          }
          
          principal = identity.getPrincipal().toString();
        }
        
        // Retry logic with max 3 attempts
        let attempts = 0;
        const maxAttempts = 3;
        let lastError;
        let renewedAgent = false;
        
        while (attempts < maxAttempts) {
          try {
            attempts++;
            console.log(`[TokenStore] Fetching ${symbol} balance from blockchain for principal ${principal} (attempt ${attempts}/${maxAttempts})`);
            
            const balance = await this.service.getBalance(principal, symbol);
            console.log(`[TokenStore] Received ${symbol} balance from blockchain: ${balance.toString()}`);
            
            // Update balance in state
            this.balances[symbol] = balance;
            
            // Save to cache
            this.saveToCache();
            
            return balance;
          } catch (err) {
            lastError = err;
            console.warn(`[TokenStore] Balance fetch attempt ${attempts} failed:`, err);
            
            // If we've had multiple failures and haven't renewed the agent yet, try that
            if (attempts === 2 && !renewedAgent) {
              console.log(`[TokenStore] Attempting to renew agent after multiple failures`);
              const identity = authStore.getIdentity();
              if (identity) {
                renewedAgent = this.service.renewAgentConnection(identity);
                // Give a slightly longer delay after renewal
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } else if (attempts < maxAttempts) {
              // Wait briefly before retry (increasing delay with each attempt)
              await new Promise(resolve => setTimeout(resolve, attempts * 100));
            }
          }
        }
        
        // If all attempts failed, throw the last error to fallback to cache
        throw lastError;
      } catch (error) {
        console.error(`[TokenStore] Failed to get balance for ${symbol} after multiple attempts:`, error);
        
        // Log the stack trace for debugging
        console.error(`[TokenStore] Stack trace:`, error.stack);
        
        // If we have a cached balance, return it
        if (this.balances[symbol]) {
          console.log(`[TokenStore] Returning cached balance: ${this.balances[symbol].toString()}`);
          return this.balances[symbol];
        }
        
        // Otherwise return 0
        console.log(`[TokenStore] No cached balance available, returning 0`);
        return BigInt(0);
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
    },
    
    /**
     * Get list of added tokens beyond defaults
     * @returns {Array} List of token symbols
     */
    async getAddedTokens() {
      try {
        // If tokens are available, return all tokens except the default ones
        if (this.tokens && this.tokens.length > 0) {
          // Default tokens are ICP and STDs
          const defaultTokens = ['ICP', 'STDs'];
          return this.tokens
            .filter(token => !defaultTokens.includes(token.symbol))
            .map(token => token.symbol);
        }
        return [];
      } catch (error) {
        console.error('Failed to get added tokens:', error);
        return [];
      }
    },
    
    /**
     * Get token metadata for a specific symbol
     * @param {string} symbol - Token symbol
     * @returns {Object} Token metadata
     */
    async getTokenMetadata(symbol) {
      try {
        // Find token in the tokens list
        const token = this.tokens.find(t => t.symbol === symbol);
        if (token) {
          return {
            name: token.name || symbol,
            symbol: token.symbol,
            decimals: token.decimals || 8,
            canisterId: token.canisterId,
            price: token.price || null,
            icon: token.icon || `/assets/icons/tokens/${symbol.toLowerCase()}.png`
          };
        }
        
        // If not found, return basic data
        return {
          name: symbol,
          symbol: symbol,
          decimals: 8,
          price: null,
          icon: `/assets/icons/tokens/${symbol.toLowerCase()}.png`
        };
      } catch (error) {
        console.error(`Failed to get metadata for ${symbol}:`, error);
        return {
          name: symbol,
          symbol: symbol,
          decimals: 8,
          price: null,
          icon: `/assets/icons/tokens/${symbol.toLowerCase()}.png`
        };
      }
    }
  }
});

export default useTokenStore;