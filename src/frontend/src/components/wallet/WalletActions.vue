<template>
  <div class="wallet-actions-container cosmic-panel">
    <h2 class="section-title">Wallet Actions</h2>
    
    <div class="wallet-balance" v-if="loading">
      <div class="loading-skeleton">
        <div class="loading-circle"></div>
        <div class="loading-lines">
          <div class="loading-line loading-line-1"></div>
          <div class="loading-line loading-line-2"></div>
        </div>
      </div>
    </div>
    
    <div class="wallet-balance" v-else>
      <div class="token-icon">
        <img src="/assets/icons/stardust-token.png" alt="Stardust" />
      </div>
      <div class="balance-info">
        <div class="balance-amount">{{ formattedBalance }} <span class="token-symbol">STD</span></div>
        <div class="balance-value">${{ formattedUsdValue }}</div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="action-button send-button" @click="handleSend">
        <i class="fas fa-paper-plane"></i>
        <span>Send</span>
      </button>
      
      <button class="action-button receive-button" @click="handleReceive">
        <i class="fas fa-qrcode"></i>
        <span>Receive</span>
      </button>
      
      <button class="action-button swap-button" @click="handleSwap">
        <i class="fas fa-exchange-alt"></i>
        <span>Swap</span>
      </button>
      
      <button class="action-button history-button" @click="handleHistory">
        <i class="fas fa-history"></i>
        <span>History</span>
      </button>
    </div>
    
    <div class="recent-transactions">
      <h3>Recent Transactions</h3>
      
      <div v-if="loadingTransactions" class="loading-transactions">
        <div v-for="i in 3" :key="`loading-${i}`" class="loading-transaction-item">
          <div class="loading-tx-icon"></div>
          <div class="loading-tx-content">
            <div class="loading-tx-title"></div>
            <div class="loading-tx-subtitle"></div>
          </div>
          <div class="loading-tx-amount"></div>
        </div>
      </div>
      
      <div v-else-if="transactions.length === 0" class="empty-transactions">
        <i class="fas fa-receipt"></i>
        <p>No recent transactions</p>
      </div>
      
      <div v-else class="transaction-list">
        <div 
          v-for="transaction in transactions" 
          :key="transaction.id" 
          class="transaction-item"
          :class="transaction.type"
        >
          <div class="transaction-icon">
            <i :class="getTransactionIcon(transaction.type)"></i>
          </div>
          <div class="transaction-content">
            <div class="transaction-title">{{ transaction.title }}</div>
            <div class="transaction-date">{{ formatDate(transaction.timestamp) }}</div>
          </div>
          <div class="transaction-amount" :class="{ 'negative': transaction.type === 'send' }">
            {{ transaction.type === 'send' ? '-' : '+' }}{{ transaction.amount }} STD
          </div>
        </div>
      </div>
      
      <button v-if="transactions.length > 0" class="view-all-button" @click="handleHistory">
        View All Transactions
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { ApiService } from '@/services/apiService';
import { useTokenStore } from '@/stores/token';

// Composables
const router = useRouter();
const notify = useNotification();
const tokenStore = useTokenStore();

// State
const loading = ref(true);
const loadingTransactions = ref(true);
const balance = ref(0);
const transactions = ref([]);

// Computed properties
const formattedBalance = computed(() => {
  return balance.value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

const formattedUsdValue = computed(() => {
  const usdValue = balance.value * 0.05; // Mock conversion rate
  return usdValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

// Methods
const fetchBalance = async () => {
  try {
    loading.value = true;
    
    // Use the token store to fetch the balance
    await tokenStore.fetchBalance('STD');
    balance.value = tokenStore.getFormattedBalance('STD');
    
    // Show a success notification
    notify.success('Balance updated successfully', {
      title: 'Balance Update'
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    
    // Show an error notification
    notify.error('Failed to update balance', {
      title: 'Balance Update Failed'
    });
  } finally {
    loading.value = false;
  }
};

const fetchTransactions = async () => {
  try {
    loadingTransactions.value = true;
    
    // Mock API call - in a real scenario, you'd use the ApiService
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock transactions data
    transactions.value = [
      {
        id: 1,
        type: 'receive',
        title: 'Received from @cosmic_user',
        amount: 50,
        timestamp: Date.now() - 1000 * 60 * 30 // 30 minutes ago
      },
      {
        id: 2,
        type: 'send',
        title: 'Sent to @nftyplayer',
        amount: 25,
        timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
      },
      {
        id: 3,
        type: 'receive',
        title: 'Daily mission reward',
        amount: 15,
        timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
      }
    ];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    notify.error('Failed to load transaction history', {
      title: 'Error'
    });
  } finally {
    loadingTransactions.value = false;
  }
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'send': return 'fas fa-arrow-up';
    case 'receive': return 'fas fa-arrow-down';
    case 'swap': return 'fas fa-exchange-alt';
    default: return 'fas fa-circle';
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a day ago
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week ago
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Format as regular date
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Action handlers
const handleSend = () => {
  // Show notification with action buttons
  notify.info('Ready to send Stardust tokens', {
    title: 'Send Tokens',
    actions: [
      {
        label: 'Continue',
        onClick: () => router.push('/wallet/send')
      },
      {
        label: 'Cancel',
        closeOnClick: true
      }
    ]
  });
  
  // Navigate to send page
  router.push('/wallet/send');
};

const handleReceive = () => {
  // Example of using an API call with notification
  ApiService.call({
    method: 'getPlayer',
    args: [],
    notification: {
      showSuccess: false, // Don't show automatic notification for this call
      showError: true     // Still show errors
    }
  }).then(result => {
    if (result) {
      // Show custom notification with the result
      notify.success('Your wallet address is ready to receive tokens', {
        title: 'Receive Tokens',
        duration: 7000,
        actions: [
          {
            label: 'Copy Address',
            onClick: () => {
              // Copy address logic
              notify.info('Address copied to clipboard', {
                title: 'Copied!'
              });
            }
          }
        ]
      });
      
      // Navigate to receive page
      router.push('/wallet/receive');
    }
  });
};

const handleSwap = () => {
  // Example of a feature that's not available yet
  notify.warning('Token swap feature is coming soon!', {
    title: 'Coming Soon'
  });
};

const handleHistory = () => {
  // Navigate to history page
  router.push('/wallet/history');
};

// Lifecycle hooks
onMounted(() => {
  // Fetch data
  fetchBalance();
  fetchTransactions();
});
</script>

<style scoped>
.wallet-actions-container {
  width: 100%;
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg, 12px);
  background: var(--cosmic-glass-bg, rgba(25, 25, 35, 0.8));
  backdrop-filter: var(--cosmic-glass-blur, blur(10px));
  border: 1px solid rgba(15, 185, 253, 0.2);
}

.section-title {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: var(--cosmic-text-primary, #fff);
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
  padding-bottom: 0.75rem;
}

.wallet-balance {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  background: rgba(15, 185, 253, 0.05);
  padding: 1rem;
  border-radius: var(--cosmic-radius-md, 10px);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.token-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  flex-shrink: 0;
}

.token-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.balance-info {
  flex: 1;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cosmic-text-primary, #fff);
  margin-bottom: 0.25rem;
}

.token-symbol {
  font-size: 1.1rem;
  color: var(--cosmic-blue, #0fb9fd);
  font-weight: 700;
}

.balance-value {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md, 10px);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--cosmic-text-primary, #fff);
}

.action-button i {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.action-button:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
}

.send-button i {
  color: var(--cosmic-blue, #0fb9fd);
}

.receive-button i {
  color: var(--cosmic-green, #00e5a4);
}

.swap-button i {
  color: var(--cosmic-purple, #9d35bf);
}

.history-button i {
  color: var(--cosmic-orange, #ff9100);
}

.recent-transactions {
  margin-top: 1.5rem;
}

.recent-transactions h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary, #fff);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md, 10px);
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: rgba(15, 185, 253, 0.1);
}

.transaction-item.send .transaction-icon {
  background: rgba(255, 0, 76, 0.1);
  color: var(--cosmic-red, #ff004c);
}

.transaction-item.receive .transaction-icon {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green, #00e5a4);
}

.transaction-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.transaction-content {
  flex: 1;
  min-width: 0;
}

.transaction-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--cosmic-text-primary, #fff);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-date {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.5));
}

.transaction-amount {
  font-weight: 700;
  color: var(--cosmic-green, #00e5a4);
}

.transaction-amount.negative {
  color: var(--cosmic-red, #ff004c);
}

.view-all-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md, 10px);
  color: var(--cosmic-blue, #0fb9fd);
  transition: all 0.2s ease;
  cursor: pointer;
}

.view-all-button:hover {
  background: rgba(15, 185, 253, 0.1);
}

.empty-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.5));
  text-align: center;
}

.empty-transactions i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

/* Loading state */
.loading-skeleton {
  display: flex;
  align-items: center;
  width: 100%;
}

.loading-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  margin-right: 1rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-lines {
  flex: 1;
}

.loading-line {
  height: 12px;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-line-1 {
  width: 60%;
  margin-bottom: 0.5rem;
}

.loading-line-2 {
  width: 40%;
}

.loading-transactions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-transaction-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md, 10px);
}

.loading-tx-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  margin-right: 0.75rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-tx-content {
  flex: 1;
}

.loading-tx-title {
  height: 12px;
  width: 70%;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-tx-subtitle {
  height: 8px;
  width: 40%;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

.loading-tx-amount {
  height: 12px;
  width: 60px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

/* Responsive styles */
@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .wallet-balance {
    padding: 0.75rem;
  }
  
  .token-icon {
    width: 40px;
    height: 40px;
  }
  
  .token-icon img {
    width: 28px;
    height: 28px;
  }
  
  .balance-amount {
    font-size: 1.25rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
}
</style> 