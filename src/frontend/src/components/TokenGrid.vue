<template>
  <div class="token-grid cosmic-panel">
    <div class="token-grid-header">
      <h3>Your Assets</h3>
      <button class="icon-button refresh-button" @click="refreshAllBalances" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ 'rotating': loading }"></i>
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="!tokens.length" class="token-grid-items skeleton-grid">
      <div v-for="n in 2" :key="`skeleton-${n}`" class="token-card skeleton">
        <div class="token-icon-container skeleton-circle"></div>
        <div class="token-details">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>
    
    <!-- Token cards -->
    <div v-else class="token-grid-items">
      <TokenCard
        v-for="token in tokens" 
        :key="token.symbol"
        :token="token" 
        :is-active="currentToken === token.symbol"
        :principal-id="principalId"
        @select="selectToken(token.symbol)"
        @balance-updated="updateTokenBalance"
        ref="tokenCards"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, toRefs } from 'vue';
import TokenCard from './TokenCard.vue';
import { tokenService } from '../services/TokenService.js';

export default {
  name: 'TokenGrid',
  components: {
    TokenCard
  },
  props: {
    principalId: {
      type: String,
      default: ''
    },
    modelValue: {
      type: String,
      default: 'ICP'
    }
  },
  emits: ['update:modelValue', 'balances-updated'],
  setup(props, { emit }) {
    const { principalId } = toRefs(props);
    const tokens = ref([]);
    const loading = ref(false);
    const tokenCards = ref([]);
    const balances = ref({});
    
    // Current selected token, synced with v-model
    const currentToken = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    // Initialize component with default tokens
    onMounted(async () => {
      // Load cached tokens first
      try {
        const cachedData = localStorage.getItem('cosmicrafts-token-cache');
        if (cachedData) {
          const parsedTokens = JSON.parse(cachedData);
          if (Array.isArray(parsedTokens) && parsedTokens.length > 0) {
            tokens.value = parsedTokens;
          }
        }
      } catch (e) {
        console.warn('Error loading cached tokens:', e);
      }
      
      // If no cached tokens, set defaults
      if (!tokens.value.length) {
        tokens.value = [
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
      }
      
      // Then load live tokens from service
      loadTokensFromService();
    });
    
    // Load tokens from TokenService
    async function loadTokensFromService() {
      try {
        // Initialize token service if not already done
        if (!tokenService.initialized) {
          await tokenService.initialize();
        }
        
        // Get supported tokens
        const supportedTokens = tokenService.getSupportedTokens();
        if (supportedTokens && supportedTokens.length > 0) {
          tokens.value = supportedTokens;
        }
      } catch (e) {
        console.error('Error loading tokens from service:', e);
      }
    }
    
    // Update token balance when a child component reports it
    function updateTokenBalance({ symbol, balance }) {
      balances.value[symbol] = balance;
      
      // Emit all balances to parent
      emit('balances-updated', { ...balances.value });
    }
    
    // Select a token
    function selectToken(symbol) {
      currentToken.value = symbol;
    }
    
    // Refresh all token balances
    async function refreshAllBalances() {
      if (loading.value) return;
      
      loading.value = true;
      
      try {
        // Call refresh on all token card components
        if (tokenCards.value && tokenCards.value.length) {
          const refreshPromises = tokenCards.value.map(card => {
            if (card && typeof card.refresh === 'function') {
              return card.refresh();
            }
            return Promise.resolve();
          });
          
          await Promise.allSettled(refreshPromises);
        }
      } catch (e) {
        console.error('Error refreshing balances:', e);
      } finally {
        loading.value = false;
      }
    }
    
    return {
      tokens,
      loading,
      currentToken,
      tokenCards,
      selectToken,
      updateTokenBalance,
      refreshAllBalances
    };
  }
}
</script>

<style scoped>
.token-grid {
  padding: 24px;
  background: var(--cosmic-panel-bg, rgba(20, 20, 30, 0.5));
  border-radius: var(--radius-medium, 8px);
}

.token-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.token-grid-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-primary, #0FB9FD);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary-light, #3DC5FD);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.token-grid-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* Skeleton loading styles */
.skeleton {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.skeleton-line {
  height: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  width: 100%;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (max-width: 768px) {
  .token-grid-items {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .token-grid-items {
    grid-template-columns: 1fr;
  }
}
</style> 