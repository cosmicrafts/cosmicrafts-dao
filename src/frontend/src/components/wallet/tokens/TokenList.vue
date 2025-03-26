<template>
  <div class="token-list-container">
    <!-- Loading indicator -->
    <div v-if="loading" class="token-list-loading">
      <TokenListSkeleton />
    </div>
    
    <!-- Token list with tokens -->
    <div v-else class="token-list">
      <!-- Manage tokens button -->
      <div class="token-list-header">
        <h3>Your Assets</h3>
        <div class="token-list-actions">
          <button 
            class="icon-button"
            @click="handleToggleZeroBalances"
            :class="{ 'active': showZeroBalances }"
          >
            <span class="icon">
              <i class="fas fa-eye"></i>
            </span>
            <span class="text">{{ showZeroBalances ? 'Hide Zero' : 'Show All' }}</span>
          </button>
          
          <button class="icon-button" @click="$emit('add-token')">
            <span class="icon">
              <i class="fas fa-plus"></i>
            </span>
            <span class="text">Add Token</span>
          </button>
          
          <button class="icon-button" @click="$emit('manage-tokens')">
            <span class="icon">
              <i class="fas fa-sliders-h"></i>
            </span>
            <span class="text">Manage</span>
          </button>
        </div>
      </div>
      
      <!-- List of tokens -->
      <div class="tokens-wrapper">
        <TransitionGroup name="token-item">
          <TokenItem
            v-for="token in visibleTokens"
            :key="token.symbol"
            :token="token"
            :selected="token.symbol === selectedToken"
            :currency="selectedCurrency"
            @click="selectToken(token.symbol)"
          />
        </TransitionGroup>
        
        <!-- Empty state -->
        <div v-if="visibleTokens.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-coins"></i>
          </div>
          <p>No tokens found</p>
          <button 
            class="button-secondary"
            @click="$emit('add-token')"
          >
            Add Token
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { useTokenStore } from '@/stores/token';
import TokenItem from './TokenItem.vue';
import TokenListSkeleton from './TokenListSkeleton.vue';

export default {
  name: 'TokenList',
  components: {
    TokenItem,
    TokenListSkeleton
  },
  props: {
    currency: {
      type: String,
      default: 'USD'
    },
    selectedAccount: {
      type: Number,
      default: 0
    },
    currentNetwork: {
      type: Object,
      default: () => ({
        id: 'icp',
        name: 'Internet Computer'
      })
    }
  },
  emits: ['select-token', 'add-token', 'manage-tokens'],
  setup(props, { emit }) {
    const tokenStore = useTokenStore();
    const loading = ref(true);
    const selectedToken = ref('');
    const selectedCurrency = ref(props.currency);
    
    // Load token data
    onMounted(async () => {
      loading.value = true;
      try {
        await tokenStore.initialize();
        selectedToken.value = tokenStore.currentTokenSymbol;
      } catch (error) {
        console.error('Failed to load token data:', error);
      } finally {
        loading.value = false;
      }
    });
    
    // Watch for network changes
    watch(() => props.currentNetwork, async (newNetwork) => {
      if (newNetwork) {
        loading.value = true;
        try {
          // In a real implementation, we would filter tokens by network
          await tokenStore.fetchAllBalances();
        } catch (error) {
          console.error('Failed to refresh token data:', error);
        } finally {
          loading.value = false;
        }
      }
    });
    
    // Watch for currency changes
    watch(() => props.currency, (newCurrency) => {
      selectedCurrency.value = newCurrency;
    });
    
    const visibleTokens = computed(() => {
      return tokenStore.visibleTokens;
    });
    
    const showZeroBalances = computed(() => {
      return tokenStore.showZeroBalances;
    });
    
    function selectToken(symbol) {
      selectedToken.value = symbol;
      tokenStore.setCurrentToken(symbol);
      emit('select-token', tokenStore.tokens[symbol]);
    }
    
    function handleToggleZeroBalances() {
      tokenStore.toggleZeroBalances();
    }
    
    return {
      loading,
      selectedToken,
      selectedCurrency,
      visibleTokens,
      showZeroBalances,
      selectToken,
      handleToggleZeroBalances
    };
  }
};
</script>

<style scoped>
.token-list-container {
  width: 100%;
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border);
}

.token-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: var(--cosmic-glass-border);
}

.token-list-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  margin: 0;
}

.token-list-actions {
  display: flex;
  gap: 0.75rem;
}

.icon-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  transform: translateY(-1px);
}

.icon-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
}

.icon-button .icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

.tokens-wrapper {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--cosmic-text-tertiary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.button-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--cosmic-radius-md);
  background: var(--cosmic-gradient-blue-alpha);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-secondary:hover {
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

/* Animation for tokens */
.token-item-enter-active,
.token-item-leave-active {
  transition: all 0.3s ease;
}

.token-item-enter-from,
.token-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.token-item-move {
  transition: transform 0.5s ease;
}

/* Loading state */
.token-list-loading {
  padding: 1rem;
}
</style>
