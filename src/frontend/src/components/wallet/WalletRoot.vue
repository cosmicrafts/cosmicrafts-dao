<template>
  <div class="wallet-root">
    <!-- Data connector handles all data fetching and provides via slot props -->
    <WalletDataConnector 
      @data-ready="handleDataReady"
      @balance-updated="handleBalanceUpdate"
    >
      <template v-slot="slotProps">
        <!-- Loading state -->
        <div v-if="slotProps.loading" class="wallet-loading">
          <div class="loading-spinner"></div>
          <p>Loading wallet data...</p>
        </div>
        
        <!-- Main wallet UI -->
        <div v-else class="wallet-content">
          <!-- Account/Network header -->
          <div class="wallet-header">
            <AccountHeader />
            <NetworkSelector @network-changed="handleNetworkChange" />
          </div>
          
          <!-- Token List with Balances -->
          <TokenList 
            :tokens="slotProps.tokens"
            :currency="slotProps.preferredCurrency"
            :current-network="slotProps.currentNetwork"
            :show-zero-balances="slotProps.showZeroBalances"
            @toggle-zero-balances="slotProps.toggleZeroBalances"
            @select-token="handleTokenSelection"
            @add-token="activeForm = 'add-token'"
            @manage-tokens="activeForm = 'manage-tokens'"
            @send="handleSendAction"
            @receive="handleReceiveAction"
            @swap="handleSwapAction"
            @buy="handleBuyAction"
          />
          
          <!-- Transaction forms and modals -->
          <div class="wallet-forms">
            <!-- Receive token form -->
            <ReceiveToken
              v-if="activeForm === 'receive'"
              :token="selectedToken"
              :network="slotProps.currentNetwork"
              @close="activeForm = null"
              @copy="handleCopySuccess"
            />
            
            <!-- Send token form (placeholder) -->
            <div 
              v-if="activeForm === 'send'"
              class="wallet-form send-form"
            >
              <h3>Send {{ selectedToken?.symbol }}</h3>
              <p>Send form coming soon</p>
              <button @click="activeForm = null">Close</button>
            </div>
            
            <!-- Add token form (placeholder) -->
            <div
              v-if="activeForm === 'add-token'"
              class="wallet-form add-token-form"
            >
              <h3>Add Custom Token</h3>
              <p>Add token form coming soon</p>
              <button @click="activeForm = null">Close</button>
            </div>
            
            <!-- Other forms as needed -->
          </div>
          
          <!-- Transaction History (placeholder) -->
          <div class="transaction-history">
            <h3>Recent Transactions</h3>
            <p class="empty-history">No recent transactions</p>
          </div>
        </div>
      </template>
    </WalletDataConnector>
    
    <!-- Notifications -->
    <div v-if="notification.show" class="notification" :class="notification.type">
      <span>{{ notification.message }}</span>
      <button class="notification-close" @click="closeNotification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import WalletDataConnector from './WalletDataConnector.vue';
import AccountHeader from './AccountHeader.vue';
import NetworkSelector from './NetworkSelector.vue';
import TokenList from './tokens/TokenList.vue';
import ReceiveToken from './tokens/ReceiveToken.vue';

export default {
  name: 'WalletRoot',
  components: {
    WalletDataConnector,
    AccountHeader,
    NetworkSelector,
    TokenList,
    ReceiveToken
  },
  setup() {
    // UI state
    const activeForm = ref(null);
    const selectedToken = ref(null);
    const notification = ref({
      show: false,
      message: '',
      type: 'info',
      timeout: null
    });
    
    // Handle data ready event from connector
    const handleDataReady = (data) => {
      console.log('Wallet data ready:', data);
      // Potentially set initial selected token or other state
      if (data.currentToken) {
        selectedToken.value = data.currentToken;
      } else if (data.tokens && data.tokens.length > 0) {
        selectedToken.value = data.tokens[0];
      }
    };
    
    // Handle balance update event
    const handleBalanceUpdate = ({ symbol, balance }) => {
      console.log(`Balance updated for ${symbol}:`, balance);
      // If the updated token is the selected one, refresh the UI
      if (selectedToken.value && selectedToken.value.symbol === symbol) {
        selectedToken.value = {
          ...selectedToken.value,
          balance
        };
      }
    };
    
    // Handle network change
    const handleNetworkChange = (network) => {
      console.log('Network changed:', network);
      showNotification(`Network changed to ${network.name}`, 'info');
    };
    
    // Handle token selection
    const handleTokenSelection = (token) => {
      console.log('Token selected:', token);
      selectedToken.value = token;
    };
    
    // Transaction form handlers
    const handleSendAction = (token) => {
      selectedToken.value = token;
      activeForm.value = 'send';
    };
    
    const handleReceiveAction = (token) => {
      selectedToken.value = token;
      activeForm.value = 'receive';
    };
    
    const handleSwapAction = (token) => {
      selectedToken.value = token;
      activeForm.value = 'swap';
      showNotification('Swap feature coming soon', 'info');
    };
    
    const handleBuyAction = (token) => {
      selectedToken.value = token;
      activeForm.value = 'buy';
      showNotification('Buy feature coming soon', 'info');
    };
    
    // Handle copy success
    const handleCopySuccess = ({ success, type, value, error }) => {
      if (success) {
        showNotification(`${type === 'account' ? 'Account ID' : 'Principal ID'} copied to clipboard`, 'success');
      } else {
        showNotification(`Failed to copy: ${error}`, 'error');
      }
    };
    
    // Show notification
    const showNotification = (message, type = 'info', duration = 3000) => {
      // Clear any existing timeout
      if (notification.value.timeout) {
        clearTimeout(notification.value.timeout);
      }
      
      // Show notification
      notification.value = {
        show: true,
        message,
        type,
        timeout: setTimeout(() => {
          notification.value.show = false;
        }, duration)
      };
    };
    
    // Close notification
    const closeNotification = () => {
      if (notification.value.timeout) {
        clearTimeout(notification.value.timeout);
      }
      notification.value.show = false;
    };
    
    return {
      activeForm,
      selectedToken,
      notification,
      handleDataReady,
      handleBalanceUpdate,
      handleNetworkChange,
      handleTokenSelection,
      handleSendAction,
      handleReceiveAction,
      handleSwapAction,
      handleBuyAction,
      handleCopySuccess,
      showNotification,
      closeNotification
    };
  }
};
</script>

<style scoped>
.wallet-root {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
}

.wallet-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  border-radius: var(--cosmic-radius-lg, 12px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(15, 185, 253, 0.2);
  border-top-color: var(--cosmic-blue, #0FB9FD);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.wallet-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wallet-forms {
  margin-top: 1rem;
}

.wallet-form {
  padding: 1.5rem;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  border-radius: var(--cosmic-radius-lg, 12px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  margin-bottom: 1.5rem;
}

.wallet-form h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary, #ffffff);
}

.transaction-history {
  padding: 1.5rem;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  border-radius: var(--cosmic-radius-lg, 12px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.transaction-history h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary, #ffffff);
}

.empty-history {
  text-align: center;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
  padding: 2rem 0;
}

.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--cosmic-radius-md, 8px);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  transition: all 0.3s ease;
  z-index: 100;
}

.notification.success {
  background-color: rgba(0, 171, 85, 0.9);
}

.notification.error {
  background-color: rgba(255, 75, 75, 0.9);
}

.notification.info {
  background-color: rgba(15, 185, 253, 0.9);
}

.notification.warning {
  background-color: rgba(255, 171, 0, 0.9);
}

.notification-close {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  margin-left: auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .wallet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .notification {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style> 