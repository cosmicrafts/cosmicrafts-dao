<template>
  <div class="ethereum-wallet">
    <div class="wallet-header">
      <h2 class="wallet-title">Ethereum Wallet</h2>
      <div class="wallet-network">
        <span class="network-label">Network:</span>
        <select v-model="selectedNetwork" @change="changeNetwork" class="network-selector">
          <option v-for="(network, id) in networks" :key="id" :value="id">
            {{ network.name }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="wallet-content">
      <!-- Account Information -->
      <div class="account-card">
        <div class="account-header">
          <div class="account-icon">
            <img src="/assets/networks/eth-logo.svg" alt="ETH" class="eth-icon" />
          </div>
          <div class="account-info">
            <h3 class="account-name">{{ currentAccount?.name || 'Ethereum Account' }}</h3>
            <div class="account-address">
              <span class="address-text">{{ formattedAddress }}</span>
              <button class="copy-btn" @click="copyAddress" title="Copy address">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="account-balance">
          <div class="balance-amount">
            <span class="balance-value">{{ ethBalance }}</span>
            <span class="balance-symbol">ETH</span>
          </div>
          <button class="refresh-btn" @click="refreshBalance" title="Refresh balance">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      
      <!-- Send Transaction Form -->
      <div class="transaction-card">
        <h3 class="section-title">Send ETH</h3>
        
        <div class="form-group">
          <label for="recipient" class="form-label">Recipient Address</label>
          <input 
            id="recipient" 
            v-model="recipientAddress" 
            type="text" 
            class="form-input"
            placeholder="0x..."
          />
        </div>
        
        <div class="form-group">
          <label for="amount" class="form-label">Amount (ETH)</label>
          <div class="amount-input-container">
            <input 
              id="amount" 
              v-model="sendAmount" 
              type="number" 
              class="form-input amount-input"
              placeholder="0.0"
              step="0.001"
              min="0"
            />
            <button class="max-btn" @click="setMaxAmount">MAX</button>
          </div>
          <div class="balance-info">
            Balance: {{ ethBalance }} ETH
          </div>
        </div>
        
        <div class="gas-settings">
          <div class="gas-info">
            <span class="gas-label">Gas Price:</span>
            <span class="gas-value">{{ gasPrice }} Gwei</span>
          </div>
          <button class="refresh-btn small" @click="refreshGasPrice" title="Refresh gas price">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
        
        <button 
          class="send-btn" 
          :disabled="!canSend" 
          @click="sendTransaction"
        >
          <span v-if="!sending">Send Transaction</span>
          <span v-else class="loading-text">
            <i class="fas fa-circle-notch fa-spin"></i> 
            Sending...
          </span>
        </button>
      </div>
      
      <!-- Transaction Status -->
      <div v-if="transactionStatus" class="transaction-status" :class="transactionStatus.type">
        <div class="status-icon">
          <i :class="transactionStatus.icon"></i>
        </div>
        <div class="status-content">
          <div class="status-title">{{ transactionStatus.title }}</div>
          <div class="status-message">{{ transactionStatus.message }}</div>
          <a 
            v-if="transactionStatus.txHash && currentNetwork" 
            :href="`${currentNetwork.blockExplorer}/tx/${transactionStatus.txHash}`" 
            target="_blank" 
            class="view-tx-link"
          >
            View on Explorer <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
        <button class="close-status-btn" @click="clearTransactionStatus">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import EthereumService from '@/services/EthereumService';

const authStore = useAuthStore();

// Reactive state
const ethBalance = ref('0.0');
const selectedNetwork = ref('mainnet');
const recipientAddress = ref('');
const sendAmount = ref('');
const gasPrice = ref('0');
const sending = ref(false);
const transactionStatus = ref(null);

// Computed properties
const networks = computed(() => EthereumService.NETWORKS);
const currentNetwork = computed(() => networks.value[selectedNetwork.value]);

const currentAccount = computed(() => authStore.currentEthAccount);
const formattedAddress = computed(() => {
  const address = currentAccount.value?.address;
  if (!address) return '';
  return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
});

const canSend = computed(() => {
  // Validate inputs
  if (!recipientAddress.value || !sendAmount.value) return false;
  if (isNaN(parseFloat(sendAmount.value)) || parseFloat(sendAmount.value) <= 0) return false;
  if (!recipientAddress.value.match(/^0x[a-fA-F0-9]{40}$/)) return false;
  if (parseFloat(sendAmount.value) > parseFloat(ethBalance.value)) return false;
  return !sending.value;
});

// Methods
const refreshBalance = async () => {
  try {
    const balance = await authStore.getEthBalance();
    ethBalance.value = balance;
  } catch (error) {
    console.error('Error refreshing balance:', error);
  }
};

const refreshGasPrice = async () => {
  try {
    const price = await EthereumService.getGasPrice();
    gasPrice.value = price;
  } catch (error) {
    console.error('Error getting gas price:', error);
  }
};

const copyAddress = () => {
  const address = currentAccount.value?.address;
  if (!address) return;
  
  navigator.clipboard.writeText(address)
    .then(() => {
      console.log('Address copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy address:', err);
    });
};

const changeNetwork = async () => {
  try {
    await authStore.switchEthNetwork(selectedNetwork.value);
    await refreshBalance();
    await refreshGasPrice();
  } catch (error) {
    console.error('Error changing network:', error);
  }
};

const setMaxAmount = () => {
  sendAmount.value = ethBalance.value;
};

const sendTransaction = async () => {
  if (!canSend.value) return;
  
  sending.value = true;
  try {
    // Set transaction status to pending
    transactionStatus.value = {
      type: 'pending',
      icon: 'fas fa-circle-notch fa-spin',
      title: 'Transaction Pending',
      message: 'Your transaction is being processed...'
    };
    
    // Send transaction
    const tx = await authStore.sendEthTransaction(
      recipientAddress.value,
      sendAmount.value
    );
    
    // Update transaction status to success
    transactionStatus.value = {
      type: 'success',
      icon: 'fas fa-check-circle',
      title: 'Transaction Successful',
      message: `Successfully sent ${sendAmount.value} ETH`,
      txHash: tx.transactionHash
    };
    
    // Clear form
    recipientAddress.value = '';
    sendAmount.value = '';
    
    // Refresh balance
    await refreshBalance();
  } catch (error) {
    console.error('Transaction error:', error);
    
    // Update transaction status to error
    transactionStatus.value = {
      type: 'error',
      icon: 'fas fa-exclamation-circle',
      title: 'Transaction Failed',
      message: error.message || 'Failed to send transaction'
    };
  } finally {
    sending.value = false;
  }
};

const clearTransactionStatus = () => {
  transactionStatus.value = null;
};

// Initialize component
onMounted(async () => {
  // Initialize Ethereum provider if not already connected
  if (!EthereumService.state.connected) {
    await authStore.initializeEthereumProvider();
  }
  
  // Set the selected network from auth store
  selectedNetwork.value = authStore.currentEthNetwork;
  
  // Get initial balance and gas price
  await refreshBalance();
  await refreshGasPrice();
});

// Watch for account changes
watch(
  () => authStore.currentEthAccountIndex,
  async () => {
    await refreshBalance();
  }
);
</script>

<style scoped>
.ethereum-wallet {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wallet-title {
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
  margin: 0;
}

.wallet-network {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.network-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.network-selector {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.wallet-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.account-card {
  background: rgba(98, 126, 234, 0.1);
  border: 1px solid rgba(98, 126, 234, 0.3);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.account-icon {
  width: 48px;
  height: 48px;
  background: rgba(98, 126, 234, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eth-icon {
  width: 30px;
  height: 30px;
}

.account-info {
  flex-grow: 1;
}

.account-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
}

.account-address {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.address-text {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.copy-btn {
  background: rgba(98, 126, 234, 0.1);
  border: 1px solid rgba(98, 126, 234, 0.2);
  color: #627EEA;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.copy-btn:hover {
  background: rgba(98, 126, 234, 0.2);
  border-color: rgba(98, 126, 234, 0.4);
}

.account-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.balance-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.balance-symbol {
  font-size: 1rem;
  color: var(--cosmic-text-secondary);
}

.refresh-btn {
  background: rgba(98, 126, 234, 0.1);
  border: 1px solid rgba(98, 126, 234, 0.2);
  color: #627EEA;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.refresh-btn:hover {
  background: rgba(98, 126, 234, 0.2);
  border-color: rgba(98, 126, 234, 0.4);
}

.refresh-btn.small {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
}

.transaction-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.form-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.75rem;
  font-size: 1rem;
  width: 100%;
}

.form-input:focus {
  border-color: rgba(98, 126, 234, 0.5);
  outline: none;
}

.amount-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.amount-input {
  flex-grow: 1;
}

.max-btn {
  background: rgba(98, 126, 234, 0.2);
  border: 1px solid rgba(98, 126, 234, 0.3);
  color: #627EEA;
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.max-btn:hover {
  background: rgba(98, 126, 234, 0.3);
  border-color: rgba(98, 126, 234, 0.5);
}

.balance-info {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  text-align: right;
  margin-top: 0.25rem;
}

.gas-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--cosmic-radius-sm);
}

.gas-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.gas-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.gas-value {
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
}

.send-btn {
  background: linear-gradient(135deg, #627EEA, #8093F1);
  border: none;
  color: white;
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7289FF, #99A8FF);
  box-shadow: 0 0 10px rgba(98, 126, 234, 0.4);
}

.send-btn:disabled {
  background: rgba(98, 126, 234, 0.3);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.transaction-status {
  display: flex;
  padding: 1rem;
  border-radius: var(--cosmic-radius-md);
  margin-top: 1rem;
  gap: 1rem;
  align-items: flex-start;
}

.transaction-status.pending {
  background: rgba(247, 181, 0, 0.1);
  border: 1px solid rgba(247, 181, 0, 0.3);
}

.transaction-status.success {
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.transaction-status.error {
  background: rgba(235, 87, 87, 0.1);
  border: 1px solid rgba(235, 87, 87, 0.3);
}

.status-icon {
  font-size: 1.5rem;
}

.transaction-status.pending .status-icon {
  color: #F7B500;
}

.transaction-status.success .status-icon {
  color: #27AE60;
}

.transaction-status.error .status-icon {
  color: #EB5757;
}

.status-content {
  flex-grow: 1;
}

.status-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--cosmic-text-primary);
}

.status-message {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.5rem;
}

.view-tx-link {
  color: #627EEA;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.view-tx-link:hover {
  text-decoration: underline;
}

.close-status-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.close-status-btn:hover {
  color: var(--cosmic-text-primary);
}

@media (max-width: 768px) {
  .wallet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .balance-value {
    font-size: 1.5rem;
  }
}
</style> 