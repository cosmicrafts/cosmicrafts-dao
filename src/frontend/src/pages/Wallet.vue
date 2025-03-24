<template>
  <div class="cosmic-wallet-container">
    <div class="cosmic-wallet">
      <!-- Wallet Header with Account Info -->
      <WalletHeader 
        :principal-id="principalId"
        :account-id="accountId"
        v-model="principalMode"
        @copy="handleCopy"
      />

      <!-- Main Token Grid -->
      <TokenGrid 
        :principal-id="principalId"
        v-model="currentTokenSymbol"
        @balances-updated="updateBalances"
      />

      <!-- Wallet actions -->
      <WalletActions @action="handleAction" />

      <!-- Send Token Form -->
      <SendTokenForm 
        v-if="activeForm === 'send'"
        :token-symbol="currentTokenSymbol"
        :principal-id="principalId"
        :token-balance="getTokenBalance(currentTokenSymbol)"
        @close="activeForm = null"
        @transfer-complete="handleTransferComplete"
      />
      
      <!-- Receive Token -->
      <ReceiveTokenInfo
        v-if="activeForm === 'receive'"
        :principal-id="principalId"
        :account-id="accountId"
        v-model="principalMode"
        @close="activeForm = null"
        @copy="handleCopy"
      />
      
      <!-- Add Token Form -->
      <AddTokenForm
        v-if="activeForm === 'add-token'"
        @close="activeForm = null"
        @token-added="handleTokenAdded"
      />
      
      <!-- Activity Log -->
      <ActivityLog :logs="logs" />
      
      <!-- Loading Indicator -->
      <LoadingIndicator v-if="loading" :message="loadingMessage" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useTokenStore } from '../stores/token.js';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

// Import components
import WalletHeader from '../components/WalletHeader.vue';
import TokenGrid from '../components/TokenGrid.vue';
import WalletActions from '../components/WalletActions.vue';
import ActivityLog from '../components/ActivityLog.vue';
import LoadingIndicator from '../components/LoadingIndicator.vue';

// These components will be created later
import SendTokenForm from '../components/SendTokenForm.vue';
import ReceiveTokenInfo from '../components/ReceiveTokenInfo.vue';
import AddTokenForm from '../components/AddTokenForm.vue';

export default {
  name: 'Wallet',
  components: {
    WalletHeader,
    TokenGrid,
    WalletActions,
    SendTokenForm,
    ReceiveTokenInfo,
    AddTokenForm,
    ActivityLog,
    LoadingIndicator
  },
  setup() {
    // Get stores
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    
    // State variables
    const principalId = ref('');
    const accountId = ref('');
    const currentTokenSymbol = ref('ICP');
    const principalMode = ref(false);
    const activeForm = ref(null);
    const loading = ref(false);
    const loadingMessage = ref('');
    const tokenBalances = ref({});
    const logs = ref([]);
    
    // UI State Storage Keys
    const UI_STATE_KEY = 'cosmicrafts-wallet-ui-state';
    const WALLET_LOGS_KEY = 'cosmicrafts-wallet-logs';
    
    // Initialize the wallet
    onMounted(async () => {
      // Load UI state from local storage
      loadUIState();
      
      // Load logs from local storage
      loadLogs();
      
      // Initialize user IDs
      await initializeUserIds();
      
      // Initialize token store if not already done
      if (!tokenStore.initialized) {
        loading.value = true;
        loadingMessage.value = 'Initializing wallet...';
        
        try {
          await tokenStore.initialize();
          addLog('Wallet initialized successfully', 'success');
        } catch (error) {
          addLog(`Error initializing wallet: ${error.message}`, 'error');
        } finally {
          loading.value = false;
        }
      }
    });
    
    // Initialize user IDs
    async function initializeUserIds() {
      try {
        if (!authStore.isAuthenticated()) {
          addLog('User not authenticated', 'warning');
          return;
        }
        
        const identity = authStore.getIdentity();
        if (identity) {
          const principal = identity.getPrincipal();
          principalId.value = principal.toString();
          
          // Calculate account ID
          const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
          accountId.value = accountIdentifier.toHex();
          
          addLog('User IDs loaded', 'success');
        }
      } catch (error) {
        console.error('Error initializing user IDs:', error);
        addLog(`Error loading user IDs: ${error.message}`, 'error');
      }
    }
    
    // Update token balances from TokenGrid component
    function updateBalances(balances) {
      tokenBalances.value = { ...balances };
    }
    
    // Get token balance for a specific symbol
    function getTokenBalance(symbol) {
      return tokenBalances.value[symbol] || BigInt(0);
    }
    
    // Handle wallet actions
    function handleAction(action) {
      activeForm.value = action;
    }
    
    // Handle copy event
    function handleCopy({ success, type, error }) {
      if (success) {
        addLog(`${type === 'principal' ? 'Principal' : 'Account'} ID copied to clipboard`, 'success');
      } else {
        addLog(`Failed to copy: ${error}`, 'error');
      }
    }
    
    // Handle transfer complete event
    function handleTransferComplete({ success, amount, symbol, recipient, error }) {
      if (success) {
        addLog(`Successfully sent ${amount} ${symbol} to ${recipient}`, 'success');
        activeForm.value = null;
      } else {
        addLog(`Transfer failed: ${error}`, 'error');
      }
    }
    
    // Handle token added event
    function handleTokenAdded({ success, symbol, error }) {
      if (success) {
        addLog(`Successfully added ${symbol} token`, 'success');
        currentTokenSymbol.value = symbol;
        activeForm.value = null;
      } else {
        addLog(`Failed to add token: ${error}`, 'error');
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
      
      // Save logs to localStorage
      try {
        localStorage.setItem(WALLET_LOGS_KEY, JSON.stringify(logs.value));
      } catch (e) {
        console.error('Error saving logs:', e);
      }
    }
    
    // Load UI state from local storage
    function loadUIState() {
      try {
        const uiState = localStorage.getItem(UI_STATE_KEY);
        if (uiState) {
          const parsedUiState = JSON.parse(uiState);
          
          // Restore UI state
          if (parsedUiState.principalMode !== undefined) {
            principalMode.value = parsedUiState.principalMode;
          }
          
          if (parsedUiState.currentToken) {
            currentTokenSymbol.value = parsedUiState.currentToken;
          }
        }
      } catch (error) {
        console.error('Error loading UI state:', error);
      }
    }
    
    // Save UI state to local storage
    function saveUIState() {
      try {
        const uiState = {
          principalMode: principalMode.value,
          currentToken: currentTokenSymbol.value
        };
        
        localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
      } catch (error) {
        console.error('Error saving UI state:', error);
      }
    }
    
    // Load logs from local storage
    function loadLogs() {
      try {
        const cachedLogs = localStorage.getItem(WALLET_LOGS_KEY);
        if (cachedLogs) {
          logs.value = JSON.parse(cachedLogs);
        }
      } catch (error) {
        console.error('Error loading logs:', error);
      }
    }
    
    // Watch for changes to save UI state
    // (Not using watch() to keep this setup clean - we'll use the components' events instead)
    
    return {
      // State
      principalId,
      accountId,
      currentTokenSymbol,
      principalMode,
      activeForm,
      loading,
      loadingMessage,
      tokenBalances,
      logs,
      
      // Methods
      handleAction,
      handleCopy,
      handleTransferComplete,
      handleTokenAdded,
      updateBalances,
      getTokenBalance,
      addLog
    };
  }
};
</script>

<style scoped>
.cosmic-wallet-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 7rem; /* Account for the header with a bit extra */
  color: var(--color-text-primary, #ffffff);
}

.cosmic-wallet {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .cosmic-wallet-container {
    margin: 10px;
    padding-top: 7rem; /* Account for the header with a bit extra */
  }
}
</style> 