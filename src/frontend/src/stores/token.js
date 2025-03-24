import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth.js';
import { useCanisterStore } from './canister.js';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { tokenService } from '../services/TokenService.js';

export const useTokenStore = defineStore('token', {
  state: () => ({
    balances: {},
    tokens: [],
    currentToken: 'ICP',
    loading: false,
    accountId: null,
    initialized: false
  }),
  
  getters: {
    /**
     * Get the formatted balance for the current token
     */
    formattedBalance: (state) => {
      const balance = state.balances[state.currentToken];
      if (!balance) return '0.00';
      return tokenService.formatAmount(balance, state.currentToken);
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
      
      this.loading = true;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated()) {
          throw new Error('User not authenticated');
        }
        
        const identity = authStore.getIdentity();
        if (!identity) {
          throw new Error('Identity not available');
        }
        
        // Initialize token service
        await tokenService.initialize(identity);
        
        // Load supported tokens
        this.tokens = tokenService.getSupportedTokens();
        
        // Set current token to ICP
        const icpToken = this.tokens.find(t => t.symbol === 'ICP');
        this.currentToken = icpToken ? icpToken.symbol : (this.tokens[0]?.symbol || 'ICP');
        
        // Get account ID
        const principal = identity.getPrincipal();
        this.accountId = AccountIdentifier.fromPrincipal({ principal }).toHex();
        
        // Get balance for current token
        await this.refreshBalance();
        
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize token store:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Change the current token
     * @param {string} symbol - Token symbol
     */
    async changeToken(symbol) {
      this.currentToken = symbol;
      await this.refreshBalance();
    },
    
    /**
     * Get the balance for the current token
     */
    async refreshBalance() {
      try {
        const authStore = useAuthStore();
        const identity = authStore.getIdentity();
        
        if (!identity) {
          throw new Error('Identity not available');
        }
        
        const principalId = identity.getPrincipal().toString();
        const balance = await tokenService.getBalance(principalId, this.currentToken);
        
        // Update balance in state
        this.balances[this.currentToken] = balance;
        
        return balance;
      } catch (error) {
        console.error(`Failed to get balance for ${this.currentToken}:`, error);
        throw error;
      }
    },
    
    /**
     * Add a custom token by canister ID
     * @param {string} canisterId - Token canister ID
     * @returns {Object} Added token
     */
    async addToken(canisterId) {
      try {
        const newToken = await tokenService.addToken(canisterId);
        
        // Update tokens list
        this.tokens = tokenService.getSupportedTokens();
        
        return newToken;
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
      try {
        const tokenSymbol = symbol || this.currentToken;
        
        // Convert human-readable amount to token's smallest unit
        const amountInSmallestUnit = tokenService.toTokenAmount(amount, tokenSymbol);
        
        // Perform transfer
        const result = await tokenService.transfer(recipient, amountInSmallestUnit, tokenSymbol);
        
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