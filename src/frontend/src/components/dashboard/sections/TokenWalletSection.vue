<template>
  <section class="dashboard-section token-wallet cosmic-panel">
    <div class="section-header">
      <h2>Cosmic Wallet</h2>
      <div class="actions">
        <button 
          @click="refreshTokens" 
          class="cosmic-button-sm cosmic-button-outline-primary"
          :class="{ 'is-loading': isRefreshing }"
        >
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>

    <div class="token-list">
      <template v-if="isLoading">
        <!-- Skeleton Token Cards -->
        <div v-for="i in 3" :key="`skeleton-token-${i}`" class="skeleton-card token-skeleton">
          <div class="skeleton-header">
            <div class="skeleton-icon"></div>
            <div class="skeleton-title"></div>
          </div>
          <div class="skeleton-content">
            <div class="skeleton-amount"></div>
            <div class="skeleton-value"></div>
          </div>
          <div class="skeleton-actions">
            <div class="skeleton-button"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      </template>
      <slot v-else-if="tokens.length === 0" name="empty-state">
        <div class="empty-tokens">
          <i class="fas fa-coins"></i>
          <p>No tokens in your wallet</p>
          <button @click="navigateTo('/wallet/receive')" class="cosmic-button cosmic-button-sm">
            Receive Tokens
          </button>
        </div>
      </slot>
      <template v-else>
        <TokenCard 
          v-for="token in visibleTokens" 
          :key="token.symbol" 
          :symbol="token.symbol" 
          @balance-updated="handleBalanceUpdate"
          @action="handleTokenAction"
        />
      </template>
    </div>

    <div v-if="showControls && tokens.length > 0" class="wallet-actions">
      <button @click="navigateTo('/wallet/send')" class="wallet-action-btn">
        <i class="fas fa-paper-plane"></i>
        <span>Send</span>
      </button>
      <button @click="navigateTo('/wallet/receive')" class="wallet-action-btn">
        <i class="fas fa-qrcode"></i>
        <span>Receive</span>
      </button>
      <button @click="navigateTo('/wallet/history')" class="wallet-action-btn">
        <i class="fas fa-history"></i>
        <span>History</span>
      </button>
      <button @click="navigateTo('/wallet/swap')" class="wallet-action-btn">
        <i class="fas fa-exchange-alt"></i>
        <span>Swap</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import TokenCard from '@/components/tokens/TokenCard.vue';

// Router for navigation
const router = useRouter();

// Props
const props = defineProps({
  limit: {
    type: Number,
    default: 0 // 0 means no limit
  },
  showControls: {
    type: Boolean,
    default: true
  }
});

// Emits 
const emit = defineEmits(['token-balance-updated', 'token-action', 'refresh']);

// Token store
const tokenStore = useTokenStore();

// Local state
const isRefreshing = ref(false);

// Computed properties
const isLoading = computed(() => tokenStore.loading);

const tokens = computed(() => {
  return tokenStore.tokenList || [];
});

const visibleTokens = computed(() => {
  if (props.limit > 0 && tokens.value.length > props.limit) {
    return tokens.value.slice(0, props.limit);
  }
  return tokens.value;
});

// Methods
const navigateTo = (path) => {
  router.push(path);
};

const refreshTokens = async () => {
  isRefreshing.value = true;
  try {
    await tokenStore.fetchAllBalances();
    emit('refresh', true);
  } catch (error) {
    console.error('Failed to refresh tokens:', error);
    emit('refresh', false);
  } finally {
    isRefreshing.value = false;
  }
};

const handleBalanceUpdate = (data) => {
  emit('token-balance-updated', data);
};

const handleTokenAction = (data) => {
  emit('token-action', data);
  
  if (data.action === 'send') {
    navigateTo(`/wallet/send?token=${data.symbol}`);
  } else if (data.action === 'receive') {
    navigateTo(`/wallet/receive?token=${data.symbol}`);
  } else if (data.action === 'history') {
    navigateTo(`/wallet/history?token=${data.symbol}`);
  }
};

// Initialize data
onMounted(async () => {
  if (!tokenStore.initialized) {
    await tokenStore.initialize();
  }
});
</script>

<style scoped>
/* Dashboard Section Styling */
.dashboard-section {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.section-header h2 {
  font-size: 1.2rem;
  margin: 0;
  color: var(--cosmic-text-primary);
  font-weight: 700;
}

/* Token List */
.token-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* Empty state */
.empty-tokens {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  gap: 1rem;
  color: var(--cosmic-text-tertiary);
}

.empty-tokens i {
  font-size: 2.5rem;
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

/* Skeleton Loading */
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

@keyframes skeleton-shine {
  0% { left: -150px; }
  40%, 100% { left: 100%; }
}

.skeleton-card {
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  padding: 1rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  overflow: hidden;
  position: relative;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150px;
  width: 150px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  animation: skeleton-shine 2s ease-in-out infinite;
  pointer-events: none;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  flex-shrink: 0;
}

.skeleton-title {
  height: 1.2rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 60%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skeleton-amount {
  height: 1.8rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 80%;
}

.skeleton-value {
  height: 1rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 40%;
}

.skeleton-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.skeleton-button {
  height: 2.2rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  flex: 1;
}

/* Wallet Actions */
.wallet-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.wallet-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  transition: all var(--cosmic-transition-medium);
  cursor: pointer;
}

.wallet-action-btn i {
  font-size: 1.5rem;
  color: var(--cosmic-blue);
}

.wallet-action-btn span {
  font-size: 0.8rem;
}

.wallet-action-btn:hover, .wallet-action-btn:active {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
}

/* Refresh button loading state */
.is-loading {
  opacity: 0.8;
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .wallet-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-section {
    padding: 1rem;
  }
}
</style> 