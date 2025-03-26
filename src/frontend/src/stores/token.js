import { defineStore } from 'pinia';
import { Principal } from '@dfinity/principal';
import { useAuthStore } from './auth.js';
import { useCanisterStore } from './canister.js';
import { AccountIdentifier } from '@dfinity/ledger-icp';
// Import TokenService directly instead of using dynamic import
import { tokenService } from '../services/TokenService.js';
import { ref, computed } from 'vue';

// Cache keys
const TOKEN_CACHE_KEY = 'cosmicrafts-token-cache';
const BALANCES_CACHE_KEY = 'cosmicrafts-token-balances';

export const useTokenStore = defineStore('token', () => {
  // State
  const initialized = ref(false);
  const loading = ref(false);
  const tokens = ref({});
  const balances = ref({});
  const prices = ref({});
  const supportedTokens = ref([
    'ICP', 
    'ckBTC', 
    'ckETH', 
    'STDs', // Stardust token
    'CYCLES'
  ]);
  const currentTokenSymbol = ref('ICP');
  const showZeroBalances = ref(true);
  const customTokens = ref([]);
  
  // Getters
  const tokenList = computed(() => {
    return Object.values(tokens.value).map(token => {
      const balance = balances.value[token.symbol] || BigInt(0);
      const price = prices.value[token.symbol] || 0;
      const valueUsd = Number(balance) * price / (10 ** token.decimals);
      
      return {
        ...token,
        balance,
        valueUsd,
        visible: showZeroBalances.value || balance > BigInt(0)
      };
    }).filter(token => token.visible);
  });
  
  const visibleTokens = computed(() => {
    if (showZeroBalances.value) {
      return tokenList.value;
    }
    return tokenList.value.filter(token => token.balance > BigInt(0));
  });
  
  const currentToken = computed(() => {
    return tokens.value[currentTokenSymbol.value] || null;
  });
  
  const getSupportedTokens = computed(() => {
    return supportedTokens.value;
  });
  
  // Actions
  async function initialize() {
    if (initialized.value) return true;
    
    try {
      loading.value = true;
      
      // Initialize default tokens
      await initializeDefaultTokens();
      
      // Load custom tokens
      await loadCustomTokens();
      
      // Fetch balances for all tokens
      await fetchAllBalances();
      
      // Fetch token prices
      await fetchTokenPrices();
      
      initialized.value = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize token store:', error);
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function initializeDefaultTokens() {
    // Setup default token metadata
    tokens.value = {
      'ICP': {
        symbol: 'ICP',
        name: 'Internet Computer',
        logo: '/images/tokens/icp.svg',
        decimals: 8,
        standard: 'ICRC-1',
        canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
      },
      'ckBTC': {
        symbol: 'ckBTC',
        name: 'Chain Key Bitcoin',
        logo: '/images/tokens/ckbtc.svg',
        decimals: 8,
        standard: 'ICRC-1',
        canisterId: 'mxzaz-hqaaa-aaaar-qaada-cai'
      },
      'ckETH': {
        symbol: 'ckETH',
        name: 'Chain Key Ethereum',
        logo: '/images/tokens/cketh.svg',
        decimals: 18,
        standard: 'ICRC-1',
        canisterId: 'ss2fx-dyaaa-aaaar-qacoq-cai'
      },
      'STDs': {
        symbol: 'STDs',
        name: 'Stardust',
        logo: '/images/tokens/stardust.svg',
        decimals: 8,
        standard: 'ICRC-1',
        canisterId: 'stdst-waaaa-aaaaq-aacia-cai'
      },
      'CYCLES': {
        symbol: 'CYCLES',
        name: 'Cycles',
        logo: '/images/tokens/cycles.svg',
        decimals: 12,
        standard: 'Cycles',
        canisterId: ''
      }
    };
  }
  
  async function loadCustomTokens() {
    try {
      const saved = localStorage.getItem('customTokens');
      if (saved) {
        const parsed = JSON.parse(saved);
        customTokens.value = parsed;
        
        // Add custom tokens to tokens object
        parsed.forEach(token => {
          tokens.value[token.symbol] = token;
        });
        
        // Add custom tokens to supported tokens
        parsed.forEach(token => {
          if (!supportedTokens.value.includes(token.symbol)) {
            supportedTokens.value.push(token.symbol);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load custom tokens:', error);
    }
  }
  
  async function addCustomToken(token) {
    try {
      if (tokens.value[token.symbol]) {
        throw new Error(`Token with symbol ${token.symbol} already exists`);
      }
      
      // Add to tokens object
      tokens.value[token.symbol] = token;
      
      // Add to supported tokens
      if (!supportedTokens.value.includes(token.symbol)) {
        supportedTokens.value.push(token.symbol);
      }
      
      // Add to custom tokens
      customTokens.value.push(token);
      
      // Save to localStorage
      saveCustomTokens();
      
      // Fetch balance for the new token
      await fetchBalance(token.symbol);
      
      return true;
    } catch (error) {
      console.error('Failed to add custom token:', error);
      return false;
    }
  }
  
  function saveCustomTokens() {
    localStorage.setItem('customTokens', JSON.stringify(customTokens.value));
  }
  
  async function removeCustomToken(symbol) {
    try {
      // Remove from custom tokens
      customTokens.value = customTokens.value.filter(t => t.symbol !== symbol);
      
      // Remove from tokens object if it's a custom token
      if (tokens.value[symbol] && !supportedTokens.value.includes(symbol)) {
        delete tokens.value[symbol];
      }
      
      // Save to localStorage
      saveCustomTokens();
      
      return true;
    } catch (error) {
      console.error('Failed to remove custom token:', error);
      return false;
    }
  }
  
  async function fetchAllBalances() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated()) return;
    
    // For each token, fetch balance
    for (const symbol of supportedTokens.value) {
      await fetchBalance(symbol);
    }
  }
  
  async function fetchBalance(symbol) {
    try {
      // Mock implementation - in a real app, this would call the canister
      if (symbol === 'ICP') {
        balances.value[symbol] = BigInt(10_000_000); // 0.1 ICP
      } else if (symbol === 'ckBTC') {
        balances.value[symbol] = BigInt(500_000); // 0.005 ckBTC
      } else if (symbol === 'ckETH') {
        balances.value[symbol] = BigInt(3_000_000_000_000_000); // 0.003 ckETH
      } else if (symbol === 'STDs') {
        balances.value[symbol] = BigInt(1_000_000_000); // 10 STDs
      } else if (symbol === 'CYCLES') {
        balances.value[symbol] = BigInt(100_000_000_000); // 100T cycles
      } else {
        balances.value[symbol] = BigInt(0);
      }
      
      return balances.value[symbol];
    } catch (error) {
      console.error(`Failed to fetch balance for ${symbol}:`, error);
      return BigInt(0);
    }
  }
  
  async function fetchTokenPrices() {
    try {
      // Mock implementation - in a real app, this would call an API
      prices.value = {
        'ICP': 13.5,
        'ckBTC': 66000,
        'ckETH': 3500,
        'STDs': 0.01,
        'CYCLES': 0.00000000001
      };
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
    }
  }
  
  function setCurrentToken(symbol) {
    if (tokens.value[symbol]) {
      currentTokenSymbol.value = symbol;
      return true;
    }
    return false;
  }
  
  function toggleZeroBalances() {
    showZeroBalances.value = !showZeroBalances.value;
  }
  
  async function getBalance(symbol) {
    if (balances.value[symbol] !== undefined) {
      return balances.value[symbol];
    }
    
    return await fetchBalance(symbol);
  }
  
  return {
    // State
    initialized,
    loading,
    tokens,
    balances,
    prices,
    supportedTokens,
    currentTokenSymbol,
    showZeroBalances,
    customTokens,
    
    // Getters
    tokenList,
    visibleTokens,
    currentToken,
    getSupportedTokens,
    
    // Actions
    initialize,
    initializeDefaultTokens,
    loadCustomTokens,
    addCustomToken,
    removeCustomToken,
    fetchAllBalances,
    fetchBalance,
    fetchTokenPrices,
    setCurrentToken,
    toggleZeroBalances,
    getBalance
  };
});

export default useTokenStore;