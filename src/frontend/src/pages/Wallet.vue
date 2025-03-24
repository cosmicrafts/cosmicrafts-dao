<template>
  <div class="wallet-component">
    <h3>Cosmicrafts Wallet</h3>
    
    <div v-if="tokenStore.loading" class="loading-container">
      <p class="loading-indicator">Initializing tokens... This may take a moment as we dynamically fetch token metadata from the blockchain.</p>
      <div class="loading-spinner"></div>
      <p v-if="loadingMessage" class="loading-status">{{ loadingMessage }}</p>
    </div>
    
    <div v-else>
      <!-- Token selection tabs -->
      <div class="token-tabs">
        <button 
          v-for="token in tokenStore.supportedTokens" 
          :key="token.symbol"
          :class="['token-tab', { active: tokenStore.currentToken === token.symbol }]"
          @click="changeToken(token.symbol)"
        >
          {{ token.symbol }}
        </button>
      </div>
      
      <div class="balance-display">
        <p>Your {{ tokenStore.currentToken }} balance: 
          <span v-if="balanceLoading" class="loading-indicator">Loading...</span>
          <span v-else class="balance-amount">{{ tokenStore.formattedBalance }} {{ tokenStore.currentToken }}</span>
        </p>
      </div>
      
      <div class="functions-test">
        <!-- Add Custom Token Section -->
        <div class="function-group">
          <h4>Add ICRC-1 Token</h4>
          <div class="add-token-form">
            <div class="input-group">
              <label for="tokenCanisterId">Token Canister ID:</label>
              <input 
                type="text" 
                id="tokenCanisterId" 
                v-model="newTokenCanisterId" 
                placeholder="Enter token canister ID"
              />
            </div>
            <button 
              @click="addCustomToken" 
              :disabled="addTokenLoading || !isValidCanisterId"
            >
              {{ addTokenLoading ? 'Adding...' : 'Add Token' }}
            </button>
          </div>
        </div>
        
        <div class="function-group">
          <button @click="refreshBalance" :disabled="balanceLoading">
            Refresh Balance
          </button>
          
          <div class="test-account">
            <p>Your account ID: <code>{{ tokenStore.accountId || 'Not available' }}</code></p>
            <button @click="copyAccountId" v-if="tokenStore.accountId">Copy Account ID</button>
          </div>
        </div>
        
        <div class="function-group">
          <h4>Send {{ tokenStore.currentToken }}</h4>
          <div class="send-form">
            <div class="input-group recipient-type">
              <label>Recipient Type:</label>
              <div class="radio-options">
                <label>
                  <input 
                    type="radio" 
                    name="recipientType" 
                    value="accountId" 
                    v-model="recipientType"
                    :disabled="tokenStore.currentToken !== 'ICP'"
                  />
                  Account ID
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="recipientType" 
                    value="principal" 
                    v-model="recipientType"
                  />
                  Principal ID
                </label>
              </div>
            </div>
            
            <div class="input-group">
              <label for="recipient">{{ recipientType === 'accountId' ? 'Recipient account ID:' : 'Recipient principal ID:' }}</label>
              <input 
                type="text" 
                id="recipient" 
                v-model="recipient" 
                :placeholder="recipientType === 'accountId' ? 'Enter recipient account ID' : 'Enter recipient principal ID'"
              />
            </div>
            
            <div class="input-group">
              <label for="amount">Amount ({{ tokenStore.currentToken }}):</label>
              <input 
                type="number" 
                id="amount" 
                v-model="amount" 
                placeholder="0.00000000"
                step="0.00000001"
                min="0"
              />
            </div>
            
            <button @click="sendTokens" :disabled="transferLoading || !isValidTransfer">
              {{ transferLoading ? 'Sending...' : `Send ${tokenStore.currentToken}` }}
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
import { useAuthStore } from '../stores/auth.js';
import { useTokenStore } from '../stores/token.js';
import { Principal } from '@dfinity/principal';

// Get stores
const authStore = useAuthStore();
const tokenStore = useTokenStore();

// UI state variables
const loadingMessage = ref('');
const balanceLoading = ref(false);
const addTokenLoading = ref(false);
const transferLoading = ref(false);

// Form inputs
const newTokenCanisterId = ref('');
const recipient = ref('');
const amount = ref('');
const recipientType = ref('accountId');
const principalToConvert = ref('');
const convertedAccountId = ref('');

// Logs
const logs = ref([]);

// Initialize component
onMounted(async () => {
  addLog('Initializing wallet...', 'info');
  
  try {
    if (!authStore.isAuthenticated()) {
      addLog('User not authenticated', 'warning');
      return;
    }
    
    loadingMessage.value = 'Initializing token store...';
    await tokenStore.initialize();
    
    addLog(`Tokens initialized, ${tokenStore.supportedTokens.length} tokens loaded`, 'success');
  } catch (error) {
    loadingMessage.value = `Initialization error: ${error.message}`;
    addLog(`Initialization error: ${error.message}`, 'error');
  }
});

// Change active token
async function changeToken(symbol) {
  addLog(`Changing to ${symbol} token...`, 'info');
  balanceLoading.value = true;
  
  try {
    await tokenStore.changeToken(symbol);
    addLog(`Now using ${symbol} token`, 'success');
  } catch (error) {
    addLog(`Error changing token: ${error.message}`, 'error');
  } finally {
    balanceLoading.value = false;
  }
}

// Validate canister ID input
const isValidCanisterId = computed(() => {
  if (!newTokenCanisterId.value) return false;
  
  try {
    Principal.fromText(newTokenCanisterId.value);
    return true;
  } catch (e) {
    return false;
  }
});

// Add a custom token by canister ID
async function addCustomToken() {
  if (!isValidCanisterId.value) {
    addLog('Invalid canister ID format', 'error');
    return;
  }
  
  addTokenLoading.value = true;
  
  try {
    const canisterId = newTokenCanisterId.value.trim();
    addLog(`Adding token with canister ID: ${canisterId}`, 'info');
    
    const newToken = await tokenStore.addToken(canisterId);
    
    addLog(`Successfully added ${newToken.symbol} token`, 'success');
    
    // Switch to the new token
    changeToken(newToken.symbol);
    
    // Clear the input
    newTokenCanisterId.value = '';
  } catch (error) {
    addLog(`Failed to add token: ${error.message}`, 'error');
  } finally {
    addTokenLoading.value = false;
  }
}

// Refresh the current token balance
async function refreshBalance() {
  balanceLoading.value = true;
  
  try {
    addLog(`Refreshing ${tokenStore.currentToken} balance...`, 'info');
    await tokenStore.refreshBalance();
    addLog(`Balance updated: ${tokenStore.formattedBalance} ${tokenStore.currentToken}`, 'success');
  } catch (error) {
    addLog(`Error refreshing balance: ${error.message}`, 'error');
  } finally {
    balanceLoading.value = false;
  }
}

// Copy account ID to clipboard
function copyAccountId() {
  if (!tokenStore.accountId) return;
  
  navigator.clipboard.writeText(tokenStore.accountId)
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
    
    convertedAccountId.value = tokenStore.principalToAccountId(principal);
    addLog(`Principal converted to account ID: ${convertedAccountId.value}`, 'success');
  } catch (error) {
    addLog(`Conversion error: ${error.message}`, 'error');
  }
}

// Validate transfer inputs
const isValidTransfer = computed(() => {
  if (!recipient.value || !amount.value || parseFloat(amount.value) <= 0) {
    return false;
  }
  
  // For ICP, allow both account ID and principal ID
  if (tokenStore.currentToken === 'ICP') {
    if (recipientType.value === 'accountId') {
      return isValidAccountId(recipient.value);
    } else {
      return isValidPrincipal(recipient.value);
    }
  } 
  // For ICRC-1 tokens, only allow principal IDs
  else {
    return isValidPrincipal(recipient.value);
  }
});

// Send tokens to another account
async function sendTokens() {
  if (!isValidTransfer.value) {
    addLog('Invalid transfer details', 'error');
    return;
  }
  
  transferLoading.value = true;
  
  try {
    addLog(`Sending ${amount.value} ${tokenStore.currentToken} to ${recipient.value}...`, 'info');
    
    const result = await tokenStore.transferTokens(recipient.value, amount.value);
    
    if (result.success) {
      const confirmationId = result.blockHeight || result.blockIndex;
      
      addLog(`Successfully sent ${amount.value} ${tokenStore.currentToken} to ${recipient.value}`, 'success');
      addLog(`Transaction confirmed with ${confirmationId ? `ID: ${confirmationId}` : 'success'}`, 'success');
      
      // Clear form
      recipient.value = '';
      amount.value = '';
    } else {
      addLog(`Transfer failed: ${result.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    addLog(`Error sending ${tokenStore.currentToken}: ${error.message}`, 'error');
  } finally {
    transferLoading.value = false;
  }
}

// Check if a string is a valid account ID
function isValidAccountId(address) {
  if (!address) return false;
  
  // Account IDs are 64-character hex strings
  return /^[0-9a-fA-F]{64}$/.test(address);
}

// Check if a string is a valid principal ID
function isValidPrincipal(principal) {
  if (!principal) return false;
  
  try {
    // Try to parse it as a principal
    Principal.fromText(principal);
    return true;
  } catch (e) {
    return false;
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
.wallet-component {
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

.token-tabs {
  display: flex;
  gap: 5px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.token-tab {
  background-color: #121212;
  color: #b8c2cc;
  border: 1px solid #333;
  padding: 8px 16px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 5px;
}

.token-tab.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
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

.send-form, .add-token-form {
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

.radio-options {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.radio-options label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.recipient-type {
  background-color: #1e1e30;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #121212;
  border-radius: 4px;
  margin: 20px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 20px 0;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  animation: spin 1s linear infinite;
}

.loading-status {
  margin-top: 10px;
  color: #b8c2cc;
  font-style: italic;
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 