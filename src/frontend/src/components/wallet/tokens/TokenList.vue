<template>
  <div class="token-list-container">
    <!-- Loading indicator -->
    <div v-if="loading" class="token-list-loading">
      <TokenListSkeleton />
    </div>
    
    <!-- Token list with tokens -->
    <div v-else class="token-list">
      <!-- List header with actions -->
      <TokenListHeader
        :title="title"
        :show-zero-balances="showZeroBalances"
        @toggle-zero-balances="handleToggleZeroBalances"
        @add-token="$emit('add-token')"
        @manage-tokens="$emit('manage-tokens')"
      />
      
      <!-- List of tokens -->
      <div class="tokens-wrapper">
        <TransitionGroup name="token-list" tag="div">
          <TokenItem
            v-for="token in visibleTokens"
            :key="token.symbol"
            :token="token"
            :selected="token.symbol === selectedToken"
            :currency="selectedCurrency"
            :show-buy-action="enableBuyTokens"
            @click="selectToken(token.symbol)"
            @send="$emit('send', $event)"
            @receive="$emit('receive', $event)"
            @swap="$emit('swap', $event)"
            @buy="$emit('buy', $event)"
          />
        </TransitionGroup>
        
        <!-- Empty state -->
        <TokenEmptyState 
          v-if="visibleTokens.length === 0"
          @add-token="$emit('add-token')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { useTokenStore } from '@/stores/token';
import TokenItem from './TokenItem.vue';
import TokenListSkeleton from './TokenListSkeleton.vue';
import TokenListHeader from './TokenListHeader.vue';
import TokenEmptyState from './TokenEmptyState.vue';

export default {
  name: 'TokenList',
  components: {
    TokenItem,
    TokenListSkeleton,
    TokenListHeader,
    TokenEmptyState
  },
  props: {
    title: {
      type: String,
      default: 'Your Assets'
    },
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
    },
    enableBuyTokens: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-token', 'add-token', 'manage-tokens', 'send', 'receive', 'swap', 'buy'],
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
  border-radius: var(--cosmic-radius-lg, 12px);
  overflow: hidden;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.tokens-wrapper {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

/* Animation for token list items */
.token-list-enter-active,
.token-list-leave-active {
  transition: all 0.3s ease;
}

.token-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.token-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
