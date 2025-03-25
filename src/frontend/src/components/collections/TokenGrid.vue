<template>
  <div class="token-grid cosmic-panel">
    <div class="token-grid-header">
      <h2>{{ $t('wallet.tokens') }}</h2>
    </div>
    
    <div class="token-grid-content">
      <div 
        v-for="token in tokens" 
        :key="token.symbol"
        class="token-card"
        :class="{ active: token.symbol === modelValue }"
        @click="selectToken(token.symbol)"
      >
        <div class="token-icon">
          <img :src="token.icon" :alt="token.name" />
        </div>
        <div class="token-info">
          <div class="token-name">{{ token.name }}</div>
          <div class="token-symbol">{{ token.symbol }}</div>
        </div>
        <div class="token-balance">
          <div class="token-amount">{{ formatBalance(token.balance) }}</div>
          <div class="token-value" v-if="token.usdValue">≈ ${{ formatUSD(token.usdValue) }}</div>
        </div>
      </div>
      
      <div v-if="loading" class="token-loading">
        <div class="loading-spinner"></div>
        <div>{{ $t('wallet.loadingTokens') }}</div>
      </div>
      
      <div v-if="!loading && tokens.length === 0" class="token-empty">
        <div>{{ $t('wallet.noTokens') }}</div>
        <button class="add-token-button" @click="$emit('add-token')">
          <i class="fas fa-plus"></i> {{ $t('wallet.addToken') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTokenStore } from '@/stores/token';

const props = defineProps({
  principalId: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    default: 'ICP'
  }
});

const emit = defineEmits(['update:modelValue', 'balances-updated', 'add-token']);

const tokenStore = useTokenStore();
const tokens = ref([]);
const loading = ref(true);
const balancesMap = ref({});

// Format balance with appropriate decimal places
function formatBalance(balance) {
  if (typeof balance === 'bigint') {
    return (Number(balance) / 1e8).toFixed(4);
  }
  return balance.toFixed(4);
}

// Format USD value to 2 decimal places
function formatUSD(value) {
  return value.toFixed(2);
}

// Select a token
function selectToken(symbol) {
  emit('update:modelValue', symbol);
}

// Load token balances
async function loadBalances() {
  if (!props.principalId) return;
  
  try {
    loading.value = true;
    
    // Default tokens to show
    const tokenSymbols = ['ICP', 'STDs', 'COSMIC'];
    let allSymbols = [...tokenSymbols];
    
    // Try to get additional tokens from token store
    try {
      if (typeof tokenStore.getAddedTokens === 'function') {
        const additionalTokens = await tokenStore.getAddedTokens();
        allSymbols = [...new Set([...tokenSymbols, ...additionalTokens])];
      } else {
        console.log('getAddedTokens method not available, using default tokens only');
      }
    } catch (tokenError) {
      console.warn('Error getting additional tokens:', tokenError);
      // Continue with default tokens
    }
    
    // Fetch balances for each token
    const tokenData = await Promise.all(
      allSymbols.map(async (symbol) => {
        try {
          const balance = await tokenStore.getBalance(symbol);
          
          // Get token metadata if the method exists
          let tokenMetadata;
          try {
            if (typeof tokenStore.getTokenMetadata === 'function') {
              tokenMetadata = await tokenStore.getTokenMetadata(symbol);
            } else {
              // Fallback if method doesn't exist
              tokenMetadata = {
                name: symbol,
                symbol: symbol,
                decimals: 8,
                icon: `/assets/icons/tokens/${symbol.toLowerCase()}.png`
              };
            }
          } catch (metadataError) {
            console.warn(`Error getting metadata for ${symbol}:`, metadataError);
            tokenMetadata = {
              name: symbol,
              symbol: symbol,
              decimals: 8,
              icon: `/assets/icons/tokens/${symbol.toLowerCase()}.png`
            };
          }
          
          // Cache balance for later use
          balancesMap.value[symbol] = balance;
          
          // Return token data with balance
          return {
            name: tokenMetadata?.name || symbol,
            symbol: symbol,
            icon: tokenMetadata?.icon || `/assets/icons/tokens/${symbol.toLowerCase()}.png`,
            balance: balance,
            usdValue: tokenMetadata?.price ? Number(balance) * tokenMetadata.price / 1e8 : null
          };
        } catch (error) {
          console.error(`Error loading balance for ${symbol}:`, error);
          return null;
        }
      })
    );
    
    // Filter out any tokens that failed to load
    tokens.value = tokenData.filter(t => t !== null);
    
    // Emit balances updated event with the map of balances
    emit('balances-updated', balancesMap.value);
    
  } catch (error) {
    console.error('Error loading token balances:', error);
    tokens.value = [];
  } finally {
    loading.value = false;
  }
}

// Load balances on mount
onMounted(async () => {
  await loadBalances();
});

// Watch for principal ID changes to reload balances
watch(() => props.principalId, async (newValue) => {
  if (newValue) {
    await loadBalances();
  }
});
</script>

<style scoped>
.token-grid {
  border-radius: 12px;
  background: var(--color-bg-secondary, #16213e);
  padding: 20px;
  margin-bottom: 16px;
}

.token-grid-header {
  margin-bottom: 16px;
}

.token-grid-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  margin: 0;
}

.token-grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.token-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 8px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  cursor: pointer;
  transition: all 0.2s ease;
}

.token-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--color-border-highlight, rgba(255, 255, 255, 0.2));
}

.token-card.active {
  border-color: var(--color-accent, #4169e1);
  box-shadow: 0 0 0 1px var(--color-accent, #4169e1);
}

.token-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
}

.token-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.token-info {
  margin-bottom: 12px;
}

.token-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.token-symbol {
  font-size: 0.85rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.token-balance {
  margin-top: auto;
}

.token-amount {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.token-value {
  font-size: 0.85rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.token-loading, .token-empty {
  grid-column: 1 / -1;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  text-align: center;
  gap: 16px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-accent, #4169e1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.add-token-button {
  background: var(--color-accent, #4169e1);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.add-token-button:hover {
  background-color: var(--color-accent-hover, #5a7ae2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .token-grid-content {
    grid-template-columns: 1fr;
  }
}
</style> 