<template>
  <div>
    <slot
      :tokens="visibleTokens"
      :loading="loading"
      :balances="balances"
      :selected-token="currentToken"
      :current-network="currentNetwork"
      :preferred-currency="preferredCurrency"
      :show-zero-balances="showZeroBalances"
      :toggle-zero-balances="toggleZeroBalances"
      :refresh-balances="refreshAllBalances"
      :select-token="selectToken"
    ></slot>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useTokenStore } from '@/stores/token';
import { useAuthStore } from '@/stores/auth';
import { tokenService } from '@/services/TokenService';

export default {
  name: 'WalletDataConnector',
  emits: ['data-ready', 'balance-updated'],
  
  setup(props, { emit }) {
    const tokenStore = useTokenStore();
    const authStore = useAuthStore();
    
    // State
    const loading = ref(true);
    const error = ref(null);
    const balances = ref({});
    const tokens = ref([]);
    const preferredCurrency = ref('USD');
    const showZeroBalances = ref(true);
    const currentToken = ref(null);
    const currentNetwork = ref({
      id: 'icp',
      name: 'Internet Computer'
    });
    
    // Initialize TokenService and fetch data
    onMounted(async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // Initialize token store if not already done
        if (!tokenStore.initialized) {
          await tokenStore.initialize();
        }
        
        // Get identity from authStore
        const identity = authStore.getIdentity();
        
        // Set preferred display settings from tokenStore
        showZeroBalances.value = tokenStore.showZeroBalances;
        
        // Initialize TokenService if not already done
        if (!tokenService.initialized && !tokenService.initializing) {
          // If user is authenticated, initialize with identity
          if (identity) {
            await tokenService.initialize(identity);
          } else {
            // Force a trusted initialization without identity
            tokenService.forceTrustedInitialization();
          }
        }
        
        // Load token configs
        fetchTokens();
        
        // Load balances
        await refreshAllBalances();
        
        // Set current token
        if (tokenStore.currentToken) {
          currentToken.value = tokenStore.currentToken;
        } else if (tokens.value.length > 0) {
          currentToken.value = tokens.value[0];
        }
        
        // Emit event to notify parent that data is ready
        emit('data-ready', {
          tokens: tokens.value,
          balances: balances.value,
          currentToken: currentToken.value
        });
        
        // Add event listener for token balance updates
        window.addEventListener('token-balance-updated', handleBalanceUpdate);
      } catch (err) {
        console.error('Error initializing wallet data:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    });
    
    // Clean up event listeners
    onMounted(() => {
      return () => {
        window.removeEventListener('token-balance-updated', handleBalanceUpdate);
      };
    });
    
    // Watch for token store updates
    watch(() => tokenStore.balances, (newBalances) => {
      balances.value = { ...newBalances };
    });
    
    // Watch for showZeroBalances changes in token store
    watch(() => tokenStore.showZeroBalances, (newValue) => {
      showZeroBalances.value = newValue;
    });
    
    // Process token list
    const fetchTokens = () => {
      // Get tokens from token store
      const storeTokens = tokenStore.tokenList;
      
      // Get tokens from TokenService
      const serviceTokens = tokenService.getSupportedTokens();
      
      // Combine tokens (prefer store tokens, add service tokens if not present)
      const combinedTokens = [...storeTokens];
      
      serviceTokens.forEach(serviceToken => {
        const exists = combinedTokens.some(t => t.symbol === serviceToken.symbol);
        if (!exists) {
          combinedTokens.push({
            symbol: serviceToken.symbol,
            name: serviceToken.name,
            decimals: serviceToken.decimals,
            standard: serviceToken.standard || 'ICRC-1',
            canisterId: serviceToken.canisterId,
            logo: `/images/tokens/${serviceToken.symbol.toLowerCase()}.svg`,
            balance: BigInt(0),
            valueUsd: 0
          });
        }
      });
      
      // Update tokens
      tokens.value = combinedTokens;
    };
    
    // Computed visible tokens based on token list and showZeroBalances flag
    const visibleTokens = computed(() => {
      if (!tokens.value || tokens.value.length === 0) {
        return [];
      }
      
      const filtered = tokens.value.map(token => {
        const balance = balances.value[token.symbol] || BigInt(0);
        
        return {
          ...token,
          balance,
          valueUsd: token.valueUsd || 0,
          visible: showZeroBalances.value || balance > BigInt(0)
        };
      }).filter(token => token.visible);
      
      return filtered;
    });
    
    // Handle token balance update event
    const handleBalanceUpdate = (event) => {
      const { symbol, balance } = event.detail;
      
      if (symbol && balance) {
        // Update local balances
        balances.value = {
          ...balances.value,
          [symbol]: balance
        };
        
        // Update token store balances
        tokenStore.balances[symbol] = balance;
        
        // Emit event to notify parent
        emit('balance-updated', { symbol, balance });
      }
    };
    
    // Refresh all token balances
    const refreshAllBalances = async () => {
      loading.value = true;
      
      try {
        // Get identity from authStore
        const identity = authStore.getIdentity();
        const principal = identity?.getPrincipal().toString();
        
        if (!principal) {
          throw new Error('User not authenticated');
        }
        
        // Get supported tokens
        const supportedTokens = tokenService.getSupportedTokens();
        
        // For each token, fetch balance from TokenService
        for (const token of supportedTokens) {
          try {
            const balance = await tokenService.getBalance(principal, token.symbol);
            
            // Update local balances
            balances.value = {
              ...balances.value,
              [token.symbol]: balance
            };
            
            // Update token store balances
            tokenStore.balances[token.symbol] = balance;
          } catch (err) {
            console.warn(`Error fetching balance for ${token.symbol}:`, err);
          }
        }
        
        // Also fetch balances for any additional tokens in token store
        for (const symbol of tokenStore.supportedTokens) {
          if (!balances.value[symbol]) {
            try {
              const balance = await tokenStore.fetchBalance(symbol);
              
              // Update local balances
              balances.value = {
                ...balances.value,
                [symbol]: balance
              };
            } catch (err) {
              console.warn(`Error fetching balance for ${symbol} from token store:`, err);
            }
          }
        }
      } catch (err) {
        console.error('Error refreshing balances:', err);
        error.value = err.message;
      } finally {
        loading.value = false;
      }
      
      return balances.value;
    };
    
    // Toggle show zero balances
    const toggleZeroBalances = () => {
      showZeroBalances.value = !showZeroBalances.value;
      tokenStore.toggleZeroBalances();
    };
    
    // Select a token
    const selectToken = (symbol) => {
      const token = tokens.value.find(t => t.symbol === symbol);
      if (token) {
        currentToken.value = token;
        tokenStore.setCurrentToken(symbol);
        return true;
      }
      return false;
    };
    
    return {
      loading,
      error,
      tokens,
      balances,
      visibleTokens,
      currentToken,
      currentNetwork,
      preferredCurrency,
      showZeroBalances,
      toggleZeroBalances,
      refreshAllBalances,
      selectToken
    };
  }
};
</script> 