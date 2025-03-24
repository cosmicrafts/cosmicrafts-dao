<template>
  <div class="icp-balance-test">
    <h3>ICP Wallet</h3>
    
    <div class="balance-display">
      <p>Your ICP balance: 
        <span v-if="balanceLoading" class="loading-indicator">Loading...</span>
        <span v-else class="balance-amount">{{ formattedBalance }} ICP</span>
      </p>
    </div>
    
    <div class="functions-test">
      <div class="function-group">
        <button @click="testGetBalance" :disabled="balanceLoading">
          Refresh Balance
        </button>
        
        <div class="test-account">
          <p>Your account ID: <code>{{ accountId || 'Not available' }}</code></p>
          <button @click="copyAccountId" v-if="accountId">Copy Account ID</button>
        </div>
      </div>
      
      <div class="function-group">
        <h4>Send ICP</h4>
        <div class="send-form">
          <div class="input-group">
            <label for="recipient">Recipient account ID:</label>
            <input 
              type="text" 
              id="recipient" 
              v-model="recipient" 
              placeholder="Enter recipient account ID"
            />
          </div>
          
          <div class="input-group">
            <label for="amount">Amount (ICP):</label>
            <input 
              type="number" 
              id="amount" 
              v-model="amount" 
              placeholder="0.00000000"
              step="0.00000001"
              min="0"
            />
          </div>
          
          <button @click="sendIcp" :disabled="transferLoading || !isValidTransfer">
            {{ transferLoading ? 'Sending...' : 'Send ICP' }}
          </button>
        </div>
      </div>
      
      <div class="function-group">
        <h4>Convert Principal to Account ID</h4>
        <input 
          type="text" 
          v-model="principalToConvert" 
          placeholder="Enter a principal ID" 
        />
        <button @click="convertPrincipal" :disabled="!principalToConvert">
          Convert
        </button>
        <p v-if="convertedAccountId">Result: <code>{{ convertedAccountId }}</code></p>
      </div>
    </div>
    
    <div class="log-section">
      <h4>Operation Log</h4>
      <div class="log-entries">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span :class="['log-message', log.type]">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCanisterStore } from '../stores/canister.js';
import { useAuthStore } from '../stores/auth.js';
import { Principal } from '@dfinity/principal';

const canisterStore = useCanisterStore();
const authStore = useAuthStore();

// Balance data
const balance = ref(null);
const balanceLoading = ref(false);
const accountId = ref('');

// Principal conversion
const principalToConvert = ref('');
const convertedAccountId = ref('');

// Transaction data
const recipient = ref('');
const amount = ref('');
const transferLoading = ref(false);

// Logs
const logs = ref([]);

// Compute formatted balance with 8 decimal places
const formattedBalance = computed(() => {
  if (!balance.value) return '0.00000000';
  
  try {
    return canisterStore.formatIcp(balance.value.e8s);
  } catch (e) {
    addLog('Error formatting balance: ' + e.message, 'error');
    return '0.00000000';
  }
});

// Validate transfer inputs
const isValidTransfer = computed(() => {
  return recipient.value && 
         amount.value && 
         parseFloat(amount.value) > 0 && 
         isValidAccountId(recipient.value);
});

// Initialize component
onMounted(async () => {
  if (authStore.isAuthenticated()) {
    await testGetBalance();
    computeAccountId();
  } else {
    addLog('User not authenticated', 'warning');
  }
});

// Check if a string is a valid account ID
function isValidAccountId(address) {
  if (!address) return false;
  
  // Account IDs are 64-character hex strings
  return /^[0-9a-fA-F]{64}$/.test(address);
}

// Get ICP balance
async function testGetBalance() {
  balanceLoading.value = true;
  
  try {
    if (!authStore.isAuthenticated()) {
      addLog('Cannot get balance: User not authenticated', 'error');
      return;
    }
    
    const identity = authStore.getIdentity();
    if (!identity) {
      addLog('Cannot get balance: Identity not available', 'error');
      return;
    }
    
    const principal = identity.getPrincipal();
    const principalText = principal.toString();
    addLog(`Getting balance for principal: ${principalText}`, 'info');
    
    // Get balance using principal
    balance.value = await canisterStore.getIcpBalance(principalText);
    addLog(`Balance retrieved: ${formattedBalance.value} ICP`, 'success');
  } catch (error) {
    addLog(`Error getting balance: ${error.message}`, 'error');
  } finally {
    balanceLoading.value = false;
  }
}

// Get account ID from principal
function computeAccountId() {
  try {
    if (!authStore.isAuthenticated()) {
      addLog('Cannot compute account ID: User not authenticated', 'error');
      return;
    }
    
    const identity = authStore.getIdentity();
    if (!identity) {
      addLog('Cannot compute account ID: Identity not available', 'error');
      return;
    }
    
    const principal = identity.getPrincipal();
    accountId.value = canisterStore.principalToAccountIdentifier(principal.toString());
    addLog(`Account ID computed: ${accountId.value}`, 'success');
  } catch (error) {
    addLog(`Error computing account ID: ${error.message}`, 'error');
  }
}

// Copy account ID to clipboard
function copyAccountId() {
  if (!accountId.value) return;
  
  navigator.clipboard.writeText(accountId.value)
    .then(() => {
      addLog('Account ID copied to clipboard!', 'success');
    })
    .catch(err => {
      addLog(`Failed to copy: ${err}`, 'error');
    });
}

// Convert principal to account ID
function convertPrincipal() {
  try {
    const principal = principalToConvert.value.trim();
    
    // Validate the principal
    try {
      Principal.fromText(principal);
    } catch (e) {
      addLog(`Invalid principal format: ${e.message}`, 'error');
      return;
    }
    
    convertedAccountId.value = canisterStore.principalToAccountIdentifier(principal);
    addLog(`Principal converted to account ID: ${convertedAccountId.value}`, 'success');
  } catch (error) {
    addLog(`Conversion error: ${error.message}`, 'error');
  }
}

// Send ICP to another account
async function sendIcp() {
  if (!isValidTransfer.value) {
    addLog('Invalid transfer details', 'error');
    return;
  }
  
  transferLoading.value = true;
  
  try {
    if (!authStore.isAuthenticated()) {
      addLog('Cannot send ICP: User not authenticated', 'error');
      return;
    }
    
    // Convert amount from ICP to e8s using the store helper function
    const amountE8s = canisterStore.icpToE8s(amount.value);
    
    // Send the transaction
    const result = await canisterStore.transferIcp(
      recipient.value,
      amountE8s
    );
    
    if (result.success) {
      addLog(`Successfully sent ${amount.value} ICP to ${recipient.value}`, 'success');
      addLog(`Transaction confirmed with block height: ${result.blockHeight}`, 'success');
      
      // Clear form and refresh balance
      recipient.value = '';
      amount.value = '';
      await testGetBalance();
    } else {
      addLog(`Transfer failed: ${result.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    addLog(`Error sending ICP: ${error.message}`, 'error');
  } finally {
    transferLoading.value = false;
  }
}

// Add log entry
function addLog(message, type = 'info') {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  
  logs.value.unshift({
    time: timeStr,
    message,
    type
  });
  
  // Keep logs limited to recent entries
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20);
  }
}
</script>

<style scoped>
.icp-balance-test {
  background-color: #1a1a2e;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #e6e6e6;
  max-width: 800px;
  margin: 20px auto;
}

h3 {
  margin-top: 0;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
  color: #4d8cf4;
}

h4 {
  margin-top: 20px;
  color: #b8c2cc;
}

.balance-display {
  background-color: #121212;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.balance-amount {
  font-weight: bold;
  color: #4caf50;
  font-size: 1.1em;
}

.loading-indicator {
  font-style: italic;
  color: #aaa;
}

.functions-test {
  margin-top: 20px;
}

.function-group {
  background-color: #121212;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.test-account {
  margin-top: 15px;
  word-break: break-all;
}

.send-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  color: #b8c2cc;
  font-size: 0.9em;
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  margin-top: 10px;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2563eb;
}

button:disabled {
  background-color: #64748b;
  cursor: not-allowed;
}

input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #1e1e30;
  color: white;
  width: 100%;
  margin-bottom: 10px;
}

code {
  background-color: #282a36;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  word-break: break-all;
}

.log-section {
  margin-top: 20px;
}

.log-entries {
  background-color: #121212;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  padding: 6px 0;
  border-bottom: 1px solid #333;
  font-family: monospace;
  font-size: 0.9em;
}

.log-time {
  color: #888;
  margin-right: 10px;
}

.log-message {
  display: inline-block;
}

.log-message.info {
  color: #4d8cf4;
}

.log-message.success {
  color: #4caf50;
}

.log-message.warning {
  color: #ff9800;
}

.log-message.error {
  color: #f44336;
}
</style> 