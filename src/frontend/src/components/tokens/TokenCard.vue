<template>
  <div 
    class="token-card"
    :class="{ 'is-selected': isSelected }"
    ref="cardElement"
  >
    <!-- Token Icon -->
    <div class="token-icon">
      <img :src="tokenIcon" :alt="tokenSymbol" />
      <div v-if="isLoading" class="loading-indicator"></div>
    </div>
    
    <!-- Token Info -->
    <div class="token-info">
      <div class="token-name">{{ tokenName }}</div>
      <div class="token-symbol">{{ tokenSymbol }}</div>
    </div>
    
    <!-- Token Balance -->
    <div class="token-balance">
      <div v-if="error" class="token-error">
        <span class="error-icon">!</span>
        <span class="error-message">{{ error }}</span>
      </div>
      <template v-else>
        <div class="token-amount" :class="{ 'balance-updated': showUpdateAnimation }">
          {{ formattedBalance }}
          <span v-if="lastUpdatedFromBlockchain" class="blockchain-indicator" title="Last refreshed from blockchain">
            <i class="fas fa-check-circle"></i>
          </span>
        </div>
        <div v-if="usdValue" class="token-value">≈ ${{ usdValue.toFixed(2) }}</div>
        <div v-if="lastUpdatedTime" class="last-updated">
          Updated: {{ lastUpdatedTime }}
        </div>
      </template>
    </div>
    
    <!-- Action Menu -->
    <div class="token-actions" v-if="menuOpen">
      <div class="actions-menu" ref="menuElement">
        <button class="action-button" @click="emitAction('send')">
          <i class="fas fa-paper-plane"></i>
          <span>{{ $t('wallet.send') || 'Send' }}</span>
        </button>
        
        <button class="action-button" @click="emitAction('receive')">
          <i class="fas fa-qrcode"></i>
          <span>{{ $t('wallet.receive') || 'Receive' }}</span>
        </button>
        
        <button class="action-button" @click="emitAction('history')">
          <i class="fas fa-history"></i>
          <span>{{ $t('wallet.history') || 'History' }}</span>
        </button>
        
        <button class="action-button" @click="refreshBalance(true)">
          <i class="fas fa-sync-alt"></i>
          <span>{{ $t('wallet.refresh') || 'Refresh' }}</span>
        </button>
      </div>
    </div>
    
    <!-- Menu Toggle -->
    <button 
      class="menu-toggle" 
      @click.stop="toggleMenu"
      :class="{ 'menu-open': menuOpen }"
    >
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTokenStore } from '@/stores/token';

export default {
  name: 'TokenCard',
  props: {
    // Required: Token symbol (ICP, STDs, etc.)
    symbol: {
      type: String,
      required: true
    },
    // Optional: Principal ID - defaults to authenticated user
    principalId: {
      type: String,
      default: null
    },
    // Optional: Custom label to override the token name
    label: {
      type: String,
      default: null
    },
    // Optional: Auto-refresh interval in ms
    refreshInterval: {
      type: Number,
      default: 300000 // 5 minutes
    },
    // Optional: Whether to use cache
    useCache: {
      type: Boolean,
      default: true
    },
    // Optional: Whether this card is selected
    selected: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['balance-updated', 'action', 'error'],
  
  setup(props, { emit }) {
    // State
    const tokenStore = useTokenStore();
    const balance = ref(BigInt(0));
    const tokenMetadata = ref(null);
    const isLoading = ref(true);
    const error = ref(null);
    const menuOpen = ref(false);
    const cardElement = ref(null);
    const menuElement = ref(null);
    const refreshTimer = ref(null);
    const initialLoadComplete = ref(false);
    const showUpdateAnimation = ref(false);
    const lastUpdatedFromBlockchain = ref(false);
    const lastUpdatedTime = ref(null);
    
    // Handle outside clicks to close menu
    const handleClickOutside = (event) => {
      if (menuOpen.value && 
          cardElement.value && 
          !cardElement.value.contains(event.target)) {
        menuOpen.value = false;
      }
    };
    
    // Toggle actions menu
    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
    };
    
    // Format balance with appropriate decimal places
    const formatBalance = (balanceValue) => {
      try {
        if (typeof balanceValue === 'bigint') {
          const decimals = tokenMetadata.value?.decimals || 8;
          return (Number(balanceValue) / Math.pow(10, decimals)).toFixed(4);
        }
        return '0.0000';
      } catch (error) {
        console.error('Error formatting balance:', error);
        return '0.0000';
      }
    };
    
    // Computed values
    const formattedBalance = computed(() => {
      return formatBalance(balance.value);
    });
    
    const tokenName = computed(() => {
      return props.label || (tokenMetadata.value?.name || props.symbol);
    });
    
    const tokenSymbol = computed(() => {
      return props.symbol;
    });
    
    const tokenIcon = computed(() => {
      return tokenMetadata.value?.icon || `/assets/icons/tokens/${props.symbol.toLowerCase()}.png`;
    });
    
    const usdValue = computed(() => {
      if (!tokenMetadata.value?.price || !balance.value) return null;
      
      const decimals = tokenMetadata.value?.decimals || 8;
      const value = Number(balance.value) * tokenMetadata.value.price / Math.pow(10, decimals);
      return value;
    });
    
    const isSelected = computed(() => {
      return props.selected;
    });
    
    // Load token metadata from store
    const loadTokenMetadata = async () => {
      try {
        if (typeof tokenStore.getTokenMetadata === 'function') {
          const metadata = await tokenStore.getTokenMetadata(props.symbol);
          if (metadata) {
            tokenMetadata.value = metadata;
          } else {
            // Fallback
            tokenMetadata.value = {
              name: props.symbol === 'ICP' ? 'Internet Computer' : 
                    props.symbol === 'STDs' ? 'Stardust' : props.symbol,
              symbol: props.symbol,
              decimals: 8,
              icon: `/assets/icons/tokens/${props.symbol.toLowerCase()}.png`
            };
          }
        } else {
          // Fallback
          tokenMetadata.value = {
            name: props.symbol === 'ICP' ? 'Internet Computer' : 
                  props.symbol === 'STDs' ? 'Stardust' : props.symbol,
            symbol: props.symbol,
            decimals: 8,
            icon: `/assets/icons/tokens/${props.symbol.toLowerCase()}.png`
          };
        }
      } catch (err) {
        console.warn(`Error loading token metadata for ${props.symbol}:`, err);
        // Set fallback metadata
        tokenMetadata.value = {
          name: props.symbol === 'ICP' ? 'Internet Computer' : 
                props.symbol === 'STDs' ? 'Stardust' : props.symbol,
          symbol: props.symbol,
          decimals: 8,
          icon: `/assets/icons/tokens/${props.symbol.toLowerCase()}.png`
        };
      }
    };
    
    // Local storage cache key - uses principal ID to separate by user
    const getBalanceCacheKey = () => {
      if (!props.principalId) return null;
      return `token_balance_${props.principalId}_${props.symbol}`;
    };
    
    // Load balance from cache
    const loadCachedBalance = () => {
      if (!props.useCache) return null;
      
      try {
        console.log(`[TokenCard:${props.symbol}] Attempting to load cached balance`);
        
        // First try to load from token store
        if (tokenStore.balances && tokenStore.balances[props.symbol]) {
          const storeBalance = tokenStore.balances[props.symbol];
          console.log(`[TokenCard:${props.symbol}] Found balance in TokenStore:`, storeBalance.toString());
          
          try {
            // Ensure it's converted to BigInt
            balance.value = typeof storeBalance === 'bigint' ? storeBalance : BigInt(storeBalance.toString());
            return balance.value;
          } catch (e) {
            console.warn(`[TokenCard:${props.symbol}] Error converting TokenStore balance to BigInt:`, e);
          }
        }
        
        // Then try local storage
        const cacheKey = getBalanceCacheKey();
        if (cacheKey) {
          const cachedData = localStorage.getItem(cacheKey);
          if (cachedData) {
            console.log(`[TokenCard:${props.symbol}] Found cached data in localStorage`);
            const parsed = JSON.parse(cachedData);
            if (parsed && parsed.balance) {
              try {
                balance.value = BigInt(parsed.balance);
                console.log(`[TokenCard:${props.symbol}] Loaded balance from cache: ${balance.value.toString()}`);
                lastUpdatedTime.value = new Date(parsed.timestamp).toLocaleTimeString();
                return balance.value;
              } catch (e) {
                console.warn(`[TokenCard:${props.symbol}] Error converting cached balance to BigInt:`, e);
              }
            }
          }
        }
        
        // If we get here, we couldn't load a cached balance
        console.log(`[TokenCard:${props.symbol}] No valid cached balance found`);
        return null;
      } catch (err) {
        console.warn(`[TokenCard:${props.symbol}] Error loading cached balance:`, err);
        return null;
      }
    };
    
    // Save balance to cache
    const saveCachedBalance = () => {
      if (!props.useCache) return;
      
      try {
        const cacheKey = getBalanceCacheKey();
        if (cacheKey && balance.value) {
          const data = {
            balance: balance.value.toString(),
            timestamp: Date.now()
          };
          localStorage.setItem(cacheKey, JSON.stringify(data));
          console.log(`[TokenCard:${props.symbol}] Saved balance to cache: ${balance.value.toString()}`);
        }
      } catch (err) {
        console.warn(`[TokenCard:${props.symbol}] Error saving cached balance:`, err);
      }
    };
    
    // Refresh token balance from blockchain
    const refreshBalance = async (forceRefresh = false) => {
      try {
        console.log(`[TokenCard:${props.symbol}] Refreshing balance, forceRefresh=${forceRefresh}`);
        
        // Set animation state back to default
        showUpdateAnimation.value = false;
        lastUpdatedFromBlockchain.value = false;
        
        if (!tokenStore.initialized && !forceRefresh) {
          // If first load and token store not ready, try cache first
          console.log(`[TokenCard:${props.symbol}] TokenStore not initialized, trying cache first`);
          const cachedBalance = loadCachedBalance();
          if (cachedBalance !== null) {
            console.log(`[TokenCard:${props.symbol}] Using cached balance: ${cachedBalance.toString()}`);
            isLoading.value = false;
            error.value = null;
            
            // Emit balance updated event
            emit('balance-updated', {
              symbol: props.symbol,
              balance: balance.value,
              formatted: formattedBalance.value,
              source: 'cache'
            });
            
            return balance.value;
          }
        }
        
        // Show loading state only if this is the initial load or forced refresh
        if (!initialLoadComplete.value || forceRefresh) {
          isLoading.value = true;
          error.value = null;
        }
        
        // Fetch balance from token store
        console.log(`[TokenCard:${props.symbol}] Fetching balance from blockchain...`);
        const principalToUse = props.principalId;
        console.log(`[TokenCard:${props.symbol}] Using principalId: ${principalToUse || 'default'}`);
        
        const newBalance = await tokenStore.getBalance(props.symbol, principalToUse);
        console.log(`[TokenCard:${props.symbol}] Received balance from blockchain: ${newBalance.toString()}`);
        
        // Check if balance has changed
        const hasChanged = balance.value !== newBalance;
        if (hasChanged) {
          console.log(`[TokenCard:${props.symbol}] Balance changed from ${balance.value} to ${newBalance}`);
        } else {
          console.log(`[TokenCard:${props.symbol}] Balance unchanged: ${newBalance.toString()}`);
        }
        
        // Update balance
        balance.value = newBalance;
        
        // Save to cache
        saveCachedBalance();
        
        // Update loading state
        isLoading.value = false;
        initialLoadComplete.value = true;
        error.value = null;
        
        // Update animation and timestamp
        showUpdateAnimation.value = hasChanged;
        lastUpdatedFromBlockchain.value = true;
        lastUpdatedTime.value = new Date().toLocaleTimeString();
        
        // Trigger animation reset after 2 seconds
        if (showUpdateAnimation.value) {
          setTimeout(() => {
            showUpdateAnimation.value = false;
          }, 2000);
        }
        
        // Emit balance updated event
        emit('balance-updated', {
          symbol: props.symbol,
          balance: balance.value,
          formatted: formattedBalance.value,
          source: 'blockchain',
          changed: hasChanged
        });
        
        return newBalance;
      } catch (err) {
        console.error(`[TokenCard:${props.symbol}] Error refreshing balance:`, err);
        
        if (initialLoadComplete.value || !loadCachedBalance()) {
          // Only show error if we don't have cached data or this isn't the first load
          error.value = 'Error loading balance';
        }
        
        isLoading.value = false;
        initialLoadComplete.value = true;
        
        // Emit error event
        emit('error', {
          symbol: props.symbol,
          error: err.message
        });
        
        return balance.value;
      }
    };
    
    // Set up refresh timer
    const setupRefreshTimer = () => {
      if (props.refreshInterval > 0) {
        refreshTimer.value = setInterval(() => {
          refreshBalance(false);
        }, props.refreshInterval);
      }
    };
    
    // Clear refresh timer
    const clearRefreshTimer = () => {
      if (refreshTimer.value) {
        clearInterval(refreshTimer.value);
        refreshTimer.value = null;
      }
    };
    
    // Emit action event
    const emitAction = (action) => {
      menuOpen.value = false;
      emit('action', {
        action,
        symbol: props.symbol,
        balance: balance.value,
        formatted: formattedBalance.value
      });
    };
    
    // Component lifecycle
    onMounted(async () => {
      // Load token metadata
      await loadTokenMetadata();
      
      // Try to load from cache first
      loadCachedBalance();
      
      // Set up event listeners
      document.addEventListener('click', handleClickOutside);
      
      // Listen for balance updates from TokenService background refreshes
      window.addEventListener('token-balance-updated', handleTokenBalanceEvent);
      
      // Refresh balance
      refreshBalance();
      
      // Set up refresh timer
      setupRefreshTimer();
    });
    
    onUnmounted(() => {
      // Clean up
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('token-balance-updated', handleTokenBalanceEvent);
      clearRefreshTimer();
    });
    
    // Handler for token balance update events
    const handleTokenBalanceEvent = (event) => {
      const { symbol, balance: eventBalance, principalId } = event.detail;
      
      // Check if this event is for our token and principal
      const targetPrincipalId = props.principalId; // may be null if using current user
      
      if (symbol === props.symbol && 
          (!targetPrincipalId || principalId === targetPrincipalId)) {
        
        console.log(`[TokenCard:${props.symbol}] Received balance update event: ${eventBalance}`);
        
        try {
          // Update balance
          const newBalance = BigInt(eventBalance);
          const oldBalance = balance.value || BigInt(0);
          
          // Use toString comparison since BigInt objects won't be equal
          const hasChanged = newBalance.toString() !== oldBalance.toString();
          
          // Only update if changed
          if (hasChanged) {
            console.log(`[TokenCard:${props.symbol}] Updating balance from ${oldBalance.toString()} to ${newBalance.toString()}`);
            balance.value = newBalance;
            
            // Save to cache
            saveCachedBalance();
            
            // Show animation
            showUpdateAnimation.value = true;
            lastUpdatedFromBlockchain.value = true;
            lastUpdatedTime.value = new Date().toLocaleTimeString();
            
            // Trigger animation reset
            setTimeout(() => {
              showUpdateAnimation.value = false;
            }, 2000);
            
            // Emit balance updated event
            emit('balance-updated', {
              symbol: props.symbol,
              balance: balance.value,
              formatted: formattedBalance.value,
              source: 'event'
            });
          } else {
            console.log(`[TokenCard:${props.symbol}] Balance unchanged: ${newBalance.toString()}`);
          }
        } catch (err) {
          console.warn(`[TokenCard:${props.symbol}] Error handling balance event:`, err);
        }
      }
    };
    
    return {
      balance,
      tokenMetadata,
      isLoading,
      error,
      menuOpen,
      cardElement,
      menuElement,
      formattedBalance,
      tokenName,
      tokenSymbol,
      tokenIcon,
      usdValue,
      isSelected,
      toggleMenu,
      refreshBalance,
      emitAction,
      showUpdateAnimation,
      lastUpdatedFromBlockchain,
      lastUpdatedTime
    };
  }
};
</script>

<style scoped>
.token-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 18px;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  transition: all var(--cosmic-transition-medium);
  min-height: 170px;
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.token-card:hover {
  transform: translateY(-5px) translateZ(5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
  background: var(--cosmic-gradient-panel-hover);
}

.token-card.is-selected {
  border-color: var(--cosmic-primary);
  box-shadow: 0 0 0 1px var(--cosmic-primary), var(--cosmic-glow-blue-sm);
}

.token-icon {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 14px;
  border: 2px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.token-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.loading-indicator::after {
  content: '';
  width: 24px;
  height: 24px;
  border: 2px solid rgba(15, 185, 253, 0.2);
  border-top-color: var(--cosmic-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.token-info {
  margin-bottom: 16px;
}

.token-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.token-symbol {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.token-balance {
  margin-top: auto;
}

.token-amount {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--cosmic-transition-medium);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.token-amount.balance-updated {
  color: var(--cosmic-success);
  animation: flash 1.5s ease, cosmic-glow 2s ease-in-out;
}

.blockchain-indicator {
  display: inline-flex;
  font-size: 0.8rem;
  color: var(--cosmic-success);
  filter: drop-shadow(0 0 3px rgba(0, 229, 164, 0.4));
}

.token-value {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  margin-top: 4px;
}

.token-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--cosmic-danger);
}

.error-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--cosmic-danger);
  color: white;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(255, 75, 75, 0.4);
}

.menu-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.menu-toggle:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.menu-toggle.menu-open {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.token-actions {
  position: absolute;
  top: 46px;
  right: 12px;
  z-index: 10;
}

.actions-menu {
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  overflow: hidden;
  min-width: 160px;
  backdrop-filter: var(--cosmic-glass-blur);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--cosmic-text-primary);
  text-align: left;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.action-button:hover {
  background: var(--cosmic-gradient-panel-hover);
}

.action-button i {
  width: 18px;
  font-size: 15px;
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 3px rgba(15, 185, 253, 0.4));
}

.last-updated {
  font-size: 0.75rem;
  color: var(--cosmic-text-tertiary);
  margin-top: 6px;
}

@keyframes flash {
  0% { color: var(--cosmic-text-primary); }
  50% { color: var(--cosmic-success); }
  100% { color: var(--cosmic-text-primary); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 