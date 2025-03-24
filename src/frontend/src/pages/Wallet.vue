<template>
  <div class="cosmic-wallet-container">
    <!-- Main Wallet UI - Guaranteed to render immediately -->
    <div class="cosmic-wallet" :class="{ 'cosmic-wallet-ready': true }">
      <!-- Wallet Header with Account Info -->
      <div class="wallet-header cosmic-panel">
        <div class="account-info">
          <div class="account-address">
            <div class="address-label">
              <span>{{ principalMode ? 'Principal ID' : 'Account ID' }}</span>
              <button class="address-toggle" @click="principalMode = !principalMode">
                <span>Show {{ principalMode ? 'Account ID' : 'Principal ID' }}</span>
              </button>
            </div>
            <div class="address-value">
              <span v-if="cachedIds.principal || tokenStore.principalId">{{ principalMode ? (tokenStore.principalId || cachedIds.principal) : (tokenStore.accountId || cachedIds.account) }}</span>
              <span v-else class="skeleton-text">••••••••••••••••••••••••••••••••</span>
              <button class="icon-button" @click="copyAddress()">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Balance Card -->
      <div class="main-balance-card cosmic-panel">
        <div class="balance-header">
          <h3>{{ currentTokenSymbol || 'Token' }} Balance</h3>
          <button class="icon-button refresh-button" @click="refreshBalance" :disabled="balanceLoading">
            <i class="fas fa-sync-alt" :class="{ 'rotating': balanceLoading }"></i>
          </button>
        </div>
        <div class="balance-amount">
          <span v-if="balanceLoading" class="loading-indicator">Loading...</span>
          <span v-else class="amount">{{ currentFormattedBalance }}</span>
          <span class="token-symbol">{{ currentTokenSymbol || 'ICP' }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="wallet-actions cosmic-panel">
        <button class="cosmic-button cosmic-button-primary action-button" @click="showSendForm = !showSendForm">
          <i class="fas fa-paper-plane"></i>
          <span>Send</span>
        </button>
        <button class="cosmic-button cosmic-button-primary action-button" @click="showReceive = !showReceive">
          <i class="fas fa-qrcode"></i>
          <span>Receive</span>
        </button>
        <button class="cosmic-button cosmic-button-primary action-button" @click="showAddToken = !showAddToken">
          <i class="fas fa-plus"></i>
          <span>Add Token</span>
        </button>
      </div>

      <!-- Token Assets List -->
      <div class="token-assets cosmic-panel">
        <div class="assets-header">
          <h3>Assets</h3>
          <span class="asset-count">{{ supportedTokens.length || cachedTokens.length || 0 }} tokens</span>
        </div>
        <div class="assets-list">
          <!-- Skeleton loading placeholders when no tokens loaded yet -->
          <div v-if="!supportedTokens.length && !cachedTokens.length" v-for="n in 2" :key="`skeleton-${n}`" class="asset-item skeleton">
            <div class="asset-icon skeleton-circle"></div>
            <div class="asset-details">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
            <div class="asset-balance skeleton-line short"></div>
          </div>
          
          <!-- Real token data once loaded -->
          <div 
            v-else
            v-for="token in (supportedTokens.length ? supportedTokens : cachedTokens)" 
            :key="token.symbol"
            :class="['asset-item', { active: currentTokenSymbol === token.symbol }]"
            @click="changeToken(token.symbol)"
          >
            <div class="asset-icon">
              <i :class="getTokenIcon(token.symbol)"></i>
            </div>
            <div class="asset-details">
              <div class="asset-name">{{ token.name }}</div>
              <div class="asset-symbol">{{ token.symbol }}</div>
            </div>
            <div class="asset-balance">
              {{ getCachedTokenBalance(token.symbol) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Receive Modal -->
      <div v-if="showReceive" class="receive-container cosmic-panel">
        <div class="form-header">
          <h3>Receive Funds</h3>
          <button class="icon-button" @click="showReceive = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="receive-content">
          <div class="qr-section">
            <div class="qr-code-container">
              <QRCodeVue3
                :value="principalMode ? (tokenStore.principalId || cachedIds.principal) : (tokenStore.accountId || cachedIds.account)"
                :size="200"
                level="H"
                class="qr-code"
              />
            </div>
          </div>
          
          <div class="address-section">
            <div class="input-group">
              <label>Your {{ principalMode ? 'Principal' : 'Account' }} ID:</label>
              <div class="address-display">
                <span>{{ principalMode ? (tokenStore.principalId || cachedIds.principal) : (tokenStore.accountId || cachedIds.account) }}</span>
                <button class="icon-button" @click="copyAddress()">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <button class="cosmic-button cosmic-button-primary toggle-address-button" @click="principalMode = !principalMode">
              Show {{ principalMode ? 'Account' : 'Principal' }} ID
            </button>
          </div>
        </div>
      </div>

      <!-- Collapsible Send Form -->
      <div v-if="showSendForm" class="send-form-container cosmic-panel">
        <div class="form-header">
          <h3>Send {{ currentTokenSymbol }}</h3>
          <button class="icon-button" @click="showSendForm = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
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
                  :disabled="currentTokenSymbol !== 'ICP'"
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
              class="cosmic-input"
            />
          </div>
          
          <div class="input-group">
            <label for="amount">Amount ({{ currentTokenSymbol }}):</label>
            <input 
              type="number" 
              id="amount" 
              v-model="amount" 
              placeholder="0.00000000"
              step="0.00000001"
              min="0"
              class="cosmic-input"
            />
          </div>
          
          <button 
            class="cosmic-button cosmic-button-primary send-button" 
            @click="sendTokens" 
            :disabled="transferLoading || !isValidTransfer"
          >
            {{ transferLoading ? 'Sending...' : `Send ${currentTokenSymbol}` }}
          </button>
        </div>
      </div>

      <!-- Collapsible Add Token Form -->
      <div v-if="showAddToken" class="add-token-container cosmic-panel">
        <div class="form-header">
          <h3>Add ICRC-1 Token</h3>
          <button class="icon-button" @click="showAddToken = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="add-token-form">
          <div class="input-group">
            <label for="tokenCanisterId">Token Canister ID:</label>
            <input 
              type="text" 
              id="tokenCanisterId" 
              v-model="newTokenCanisterId" 
              placeholder="Enter token canister ID"
              class="cosmic-input"
            />
          </div>
          <button 
            class="cosmic-button cosmic-button-primary add-button" 
            @click="addCustomToken" 
            :disabled="addTokenLoading || !isValidCanisterId"
          >
            {{ addTokenLoading ? 'Adding...' : 'Add Token' }}
          </button>
        </div>
      </div>

      <!-- Recent Activity Log -->
      <div class="activity-log cosmic-panel">
        <div class="form-header">
          <h3>Recent Activity</h3>
          <button class="icon-button" @click="showFullLog = !showFullLog">
            <i :class="showFullLog ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
        </div>
        
        <div v-if="showFullLog" class="log-entries">
          <div v-if="logs.length === 0" class="empty-log">
            <div>No recent activity</div>
          </div>
          <div v-else v-for="(log, index) in logs" :key="index" class="log-entry">
            <span class="log-time">{{ log.time }}</span>
            <span :class="['log-message', log.type]">{{ log.message }}</span>
          </div>
        </div>
      </div>
      
      <!-- Discrete loading indicator -->
      <div v-if="loadingPhases.length > 0" class="loading-status">
        <div class="loading-spinner-small"></div>
        <span>{{ loadingPhases[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script>
// Import minimal dependencies synchronously
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useTokenStore } from '../stores/token.js';
import { Principal } from '@dfinity/principal';
import QRCodeVue3 from 'qrcode-vue3';

// Define component outside setup to allow for async imports
export default {
  components: { QRCodeVue3 },
  setup() {
    // Get stores
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();

    // Cached data
    const cachedIds = ref({ principal: '', account: '' });
    const cachedTokens = ref([]);
    const tokenBalances = ref({});
    const currentTokenSymbol = ref('ICP');
    const currentFormattedBalance = ref('0.00');

    // Use computed property to access token store's supported tokens
    const supportedTokens = computed(() => tokenStore.supportedTokens || []);

    // UI state variables
    const loadingPhases = ref([]);
    const balanceLoading = ref(false);
    const addTokenLoading = ref(false);
    const transferLoading = ref(false);
    const showSendForm = ref(false);
    const showAddToken = ref(false);
    const showReceive = ref(false);
    const showFullLog = ref(false);
    const principalMode = ref(false);

    // Form inputs
    const newTokenCanisterId = ref('');
    const recipient = ref('');
    const amount = ref('');
    const recipientType = ref('accountId');
    const logs = ref([]);

    // Storage keys
    const WALLET_DATA_KEY = 'cosmicrafts-wallet-data';
    const WALLET_LAST_REFRESH_KEY = 'cosmicrafts-wallet-last-refresh';
    const WALLET_LOGS_KEY = 'cosmicrafts-wallet-logs';
    const WALLET_IDS_KEY = 'cosmicrafts-wallet-ids';
    const WALLET_TOKENS_KEY = 'cosmicrafts-wallet-tokens';
    const UI_STATE_KEY = 'cosmicrafts-wallet-ui-state';

    // Auto-refresh interval (5 minutes)
    const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

    // Initialize component - MAKE THIS TRULY NON-BLOCKING
    onMounted(() => {
      console.log("Wallet component mounted - loading with priority");
      
      // Immediately load all cached data for instant UI - this must be synchronous
      loadAllCachedData();
      
      // Log UI ready immediately
      addLog('UI ready', 'success');
      
      // DEFER all blockchain operations to after UI is rendered
      nextTick(() => {
        // Throttle initialization calls to allow UI to finish rendering
        setTimeout(() => initializeUserIds().catch(e => console.error("User ID init error:", e)), 250);
        
        // Initialize token store FIRST, before other operations
        setTimeout(() => {
          if (tokenStore) {
            tokenStore.initialize().then(() => {
              // After store is initialized, update local cache
              cachedTokens.value = tokenStore.supportedTokens || [];
              console.log("Token store initialized with", cachedTokens.value.length, "tokens");
              
              // IMPORTANT: Now trigger background blockchain data fetch
              setTimeout(() => {
                refreshAllBalancesInBackground().catch(e => console.error("Initial balance fetch error:", e));
              }, 200);
            })
            .catch(e => console.error("Token store init error:", e));
          }
        }, 500);
        
        // Set up periodic refresh in background
        setInterval(() => {
          if (shouldRefresh()) {
            refreshBalance(true).catch(e => console.error("Refresh error:", e));
          }
        }, 60000); // Check every minute
      });
    });
    
    // New method to refresh all balances in background
    async function refreshAllBalancesInBackground() {
      updateLoadingPhase('Updating balances from blockchain...');
      
      try {
        if (!authStore.isAuthenticated() || !tokenStore) {
          removeLoadingPhase('Updating balances from blockchain...');
          return;
        }
        
        // First update tokens list from token store
        cachedTokens.value = tokenStore.supportedTokens || [];
        
        // Load balances for all tokens in parallel
        addLog(`Fetching live balances for ${cachedTokens.value.length} tokens...`, 'info');
        
        // Process each token asynchronously but don't wait for all to complete
        const fetchPromises = cachedTokens.value.map(token => {
          return tokenStore.getBalance(token.symbol)
            .then(balance => {
              // Update the local cache when each balance arrives
              tokenBalances.value[token.symbol] = balance;
              
              // Update formatted balance if this is the current token
              if (token.symbol === currentTokenSymbol.value) {
                updateCurrentFormattedBalance();
              }
              
              return { symbol: token.symbol, success: true };
            })
            .catch(error => {
              console.error(`Error fetching ${token.symbol} balance:`, error);
              return { symbol: token.symbol, success: false, error: error.message };
            });
        });
        
        // Wait for all balance fetches to complete
        const results = await Promise.allSettled(fetchPromises);
        
        // Count success/failures for logging
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
        const failureCount = results.length - successCount;
        
        // Save balances to local storage
        saveWalletDataToLocalStorage();
        
        if (failureCount > 0) {
          addLog(`Updated ${successCount} token balances (${failureCount} failed)`, 'warning');
        } else {
          addLog(`All ${successCount} token balances updated from blockchain`, 'success');
        }
      } catch (error) {
        console.error('Error in refreshAllBalancesInBackground:', error);
        addLog(`Error fetching token balances: ${error.message}`, 'error');
      } finally {
        removeLoadingPhase('Updating balances from blockchain...');
      }
    }

    // Load all cached data immediately on mount - GUARANTEED non-blocking
    function loadAllCachedData() {
      try {
        // Load user IDs - this should be immediate
        const cachedIdsData = localStorage.getItem(WALLET_IDS_KEY);
        if (cachedIdsData) {
          cachedIds.value = JSON.parse(cachedIdsData);
        }
        
        // Load tokens list - no waiting
        const cachedTokensData = localStorage.getItem(WALLET_TOKENS_KEY);
        if (cachedTokensData) {
          // Parse cached tokens - all BigInt values stored as strings
          cachedTokens.value = JSON.parse(cachedTokensData);
          
          // Set current token from cache if available
          if (cachedTokens.value.length > 0) {
            const uiState = JSON.parse(localStorage.getItem(UI_STATE_KEY) || '{}');
            if (uiState.currentToken) {
              currentTokenSymbol.value = uiState.currentToken;
            }
          }
        } else {
          // Default fallback token
          cachedTokens.value = [{
            symbol: 'ICP',
            name: 'Internet Computer Protocol',
            standard: 'icp',
            decimals: 8,
            fee: '10000'
          }];
        }
        
        // Load token balances
        const cachedData = localStorage.getItem(WALLET_DATA_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          
          // Convert string amounts back to BigInt
          if (parsedData.balances) {
            const convertedBalances = {};
            for (const token in parsedData.balances) {
              try {
                // Always convert to BigInt safely
                convertedBalances[token] = BigInt(parsedData.balances[token]);
              } catch (e) {
                console.warn(`Failed to parse cached balance for ${token}, using 0`);
                convertedBalances[token] = BigInt(0);
              }
            }
            tokenBalances.value = convertedBalances;
            
            // Update formatted balance for the current token
            updateCurrentFormattedBalance();
          }
        }
        
        // Load logs
        const cachedLogs = localStorage.getItem(WALLET_LOGS_KEY);
        if (cachedLogs) {
          logs.value = JSON.parse(cachedLogs);
        }
        
        // Load UI state
        const uiState = localStorage.getItem(UI_STATE_KEY);
        if (uiState) {
          const parsedUiState = JSON.parse(uiState);
          
          // Restore UI state
          if (parsedUiState.principalMode !== undefined) principalMode.value = parsedUiState.principalMode;
          if (parsedUiState.showFullLog !== undefined) showFullLog.value = parsedUiState.showFullLog;
          if (parsedUiState.currentToken) currentTokenSymbol.value = parsedUiState.currentToken;
        }
      } catch (error) {
        console.error('Error loading wallet cache:', error);
      }
    }

    // Update current formatted balance
    function updateCurrentFormattedBalance() {
      try {
        const symbol = currentTokenSymbol.value;
        currentFormattedBalance.value = getCachedTokenBalance(symbol);
      } catch (e) {
        currentFormattedBalance.value = '0.00';
      }
    }

    // Get formatted token balance from cache 
    function getCachedTokenBalance(symbol) {
      if (!tokenBalances.value[symbol]) {
        return '0.00';
      }
      
      // Try to format ourselves
      try {
        // Find token decimals from the token list
        const token = cachedTokens.value.find(t => t.symbol === symbol);
        if (!token) return '0.00';
        
        const decimals = token.decimals || 8; // Default to 8 decimals if not specified
        const divisor = 10 ** decimals;
        
        // Handle BigInt or string safely
        let rawBalance = tokenBalances.value[symbol];
        let numericValue;
        
        if (typeof rawBalance === 'bigint') {
          // Direct BigInt
          numericValue = Number(rawBalance) / divisor;
        } else if (typeof rawBalance === 'string') {
          // String-stored BigInt
          try {
            numericValue = Number(BigInt(rawBalance)) / divisor;
          } catch (e) {
            numericValue = parseFloat(rawBalance) / divisor;
          }
        } else {
          // Fallback to direct number
          numericValue = Number(rawBalance) / divisor;
        }
        
        // Add thousands separators for better readability
        return numericValue.toLocaleString(undefined, { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 8
        });
      } catch (error) {
        console.error('Error formatting cached token amount:', error);
        return '0.00';
      }
    }

    // Asynchronously initialize user IDs
    async function initializeUserIds() {
      updateLoadingPhase('Loading user IDs...');
      
      try {
        // Skip if auth store not ready
        if (!authStore || !authStore.isAuthenticated()) {
          removeLoadingPhase('Loading user IDs...');
          return;
        }
        
        // Try to get from the token store if available
        if (tokenStore?.principalId && tokenStore?.accountId) {
          // Update cached IDs
          cachedIds.value = {
            principal: tokenStore.principalId,
            account: tokenStore.accountId
          };
          
          // Save to cache
          try {
            localStorage.setItem(WALLET_IDS_KEY, JSON.stringify(cachedIds.value));
          } catch (e) {}
          
          removeLoadingPhase('Loading user IDs...');
          return;
        }
        
        // If not available, initialize directly
        const identity = authStore.getIdentity();
        if (identity) {
          const principal = identity.getPrincipal().toString();
          
          // Calculate account ID ourselves
          let accountId;
          try {
            // Import AccountIdentifier dynamically if needed
            const { AccountIdentifier } = await import('@dfinity/ledger-icp');
            const principalObj = Principal.fromText(principal);
            accountId = AccountIdentifier.fromPrincipal({ principal: principalObj }).toHex();
          } catch (e) {
            console.error('Error calculating account ID:', e);
            accountId = 'Error calculating account ID';
          }
          
          // Update cached IDs
          cachedIds.value = {
            principal: principal,
            account: accountId
          };
          
          // Save to cache
          try {
            localStorage.setItem(WALLET_IDS_KEY, JSON.stringify(cachedIds.value));
          } catch (e) {}
          
          addLog('User IDs loaded', 'success', false);
        }
      } catch (error) {
        console.error('Error initializing user IDs:', error);
      } finally {
        removeLoadingPhase('Loading user IDs...');
      }
    }

    // Check if we should refresh balances
    function shouldRefresh() {
      try {
        const lastRefresh = parseInt(localStorage.getItem(WALLET_LAST_REFRESH_KEY) || '0', 10);
        const currentTime = Date.now();
        return currentTime - lastRefresh > AUTO_REFRESH_INTERVAL;
      } catch (e) {
        return true;
      }
    }

    // Save wallet data to localStorage
    function saveWalletDataToLocalStorage() {
      try {
        // Convert BigInt values to strings for storage
        const balancesToStore = {};
        for (const token in tokenBalances.value) {
          try {
            // Convert BigInt to string safely
            balancesToStore[token] = tokenBalances.value[token].toString();
          } catch (e) {
            balancesToStore[token] = "0";
          }
        }
        
        const dataToStore = {
          balances: balancesToStore,
          lastUpdated: Date.now()
        };
        
        localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(dataToStore));
        localStorage.setItem(WALLET_LAST_REFRESH_KEY, Date.now().toString());
        localStorage.setItem(WALLET_LOGS_KEY, JSON.stringify(logs.value));
        
        // Save user IDs
        localStorage.setItem(WALLET_IDS_KEY, JSON.stringify(cachedIds.value));
        
        // Save tokens - ensure no BigInt values are included
        const tokensToStore = cachedTokens.value.map(token => {
          // Create a clean copy without BigInt values
          return {
            ...token,
            fee: token.fee ? token.fee.toString() : '0'
          };
        });
        localStorage.setItem(WALLET_TOKENS_KEY, JSON.stringify(tokensToStore));
      } catch (error) {
        console.error('Error saving wallet data to localStorage:', error);
      }
    }

    // Fetch balance for a single token (async)
    async function fetchTokenBalance(symbol, silent = false) {
      if (!silent) balanceLoading.value = true;
      
      try {
        // Skip if token store not available
        if (!tokenStore) {
          if (!silent) balanceLoading.value = false;
          return null;
        }
        
        // Use token store to get balance from blockchain
        const balance = await tokenStore.getBalance(symbol);
        
        // Convert to BigInt if it's not already one
        if (typeof balance === 'string') {
          tokenBalances.value[symbol] = BigInt(balance);
        } else {
          tokenBalances.value[symbol] = balance;
        }
        
        // Update formatted balance if this is the current token
        if (symbol === currentTokenSymbol.value) {
          updateCurrentFormattedBalance();
        }
        
        // Save to cache
        saveWalletDataToLocalStorage();
        
        return balance;
      } catch (error) {
        console.error(`Error fetching ${symbol} balance:`, error);
        return null;
      } finally {
        if (!silent) balanceLoading.value = false;
      }
    }

    // Refresh the current token balance
    async function refreshBalance(silent = false) {
      if (!silent) balanceLoading.value = true;
      
      try {
        if (!silent) addLog(`Refreshing ${currentTokenSymbol.value} balance...`, 'info');
        await fetchTokenBalance(currentTokenSymbol.value, silent);
        
        // Update last refresh time
        try {
          localStorage.setItem(WALLET_LAST_REFRESH_KEY, Date.now().toString());
        } catch (e) {}
        
        if (!silent) addLog(`Balance updated: ${currentFormattedBalance.value} ${currentTokenSymbol.value}`, 'success');
      } catch (error) {
        if (!silent) addLog(`Error refreshing balance: ${error.message}`, 'error');
      } finally {
        if (!silent) balanceLoading.value = false;
      }
    }

    // Update loading phase - add a new phase
    function updateLoadingPhase(phase) {
      if (!loadingPhases.value.includes(phase)) {
        loadingPhases.value.push(phase);
      }
    }

    // Remove a loading phase
    function removeLoadingPhase(phase) {
      loadingPhases.value = loadingPhases.value.filter(p => p !== phase);
    }

    // Get token icon class
    function getTokenIcon(symbol) {
      const iconMap = {
        'ICP': 'fas fa-globe',
        'COSMIC': 'fas fa-star',
        'BTC': 'fab fa-bitcoin',
        'ETH': 'fab fa-ethereum',
        'STDs': 'fas fa-star' // For Stardust token
      };
      
      return iconMap[symbol] || 'fas fa-coins';
    }

    // Change active token
    function changeToken(symbol) {
      if (currentTokenSymbol.value === symbol) return;
      
      addLog(`Changing to ${symbol} token...`, 'info');
      currentTokenSymbol.value = symbol;
      
      // Update UI immediately
      updateCurrentFormattedBalance();
      
      // Try to update token store if available
      if (tokenStore) {
        setTimeout(() => {
          tokenStore.changeToken(symbol)
            .catch(e => console.error('Error changing token:', e));
        }, 0);
      }
      
      // Save UI state
      try {
        const uiState = JSON.parse(localStorage.getItem(UI_STATE_KEY) || '{}');
        uiState.currentToken = symbol;
        localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
      } catch (e) {}
      
      // Refresh balance in the background
      if (!tokenBalances.value[symbol] || shouldRefresh()) {
        setTimeout(() => {
          refreshBalance().catch(e => console.error('Refresh error:', e));
        }, 0);
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
      
      // Ensure token store is ready
      if (!tokenStore) {
        addLog('Token store not yet initialized', 'error');
        return;
      }
      
      addTokenLoading.value = true;
      
      try {
        const canisterId = newTokenCanisterId.value.trim();
        addLog(`Adding token with canister ID: ${canisterId}`, 'info');
        
        const newToken = await tokenStore.addToken(canisterId);
        
        // Update cached tokens
        if (!cachedTokens.value.find(t => t.symbol === newToken.symbol)) {
          cachedTokens.value.push(newToken);
          saveWalletDataToLocalStorage();
        }
        
        // Get the initial balance for this token
        setTimeout(() => {
          fetchTokenBalance(newToken.symbol).catch(e => console.error('Balance fetch error:', e));
        }, 0);
        
        addLog(`Successfully added ${newToken.symbol} token`, 'success');
        
        // Switch to the new token
        changeToken(newToken.symbol);
        
        // Clear the input and hide the form
        newTokenCanisterId.value = '';
        showAddToken.value = false;
      } catch (error) {
        addLog(`Failed to add token: ${error.message}`, 'error');
      } finally {
        addTokenLoading.value = false;
      }
    }
    
    // Copy address to clipboard
    function copyAddress() {
      const textToCopy = principalMode.value 
        ? (tokenStore?.principalId || cachedIds.value.principal) 
        : (tokenStore?.accountId || cachedIds.value.account);
        
      if (!textToCopy) return;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          addLog(`${principalMode.value ? 'Principal' : 'Account'} ID copied to clipboard!`, 'success');
        })
        .catch(err => {
          addLog(`Failed to copy: ${err}`, 'error');
        });
    }
    
    // Validate transfer inputs
    const isValidTransfer = computed(() => {
      if (!recipient.value || !amount.value || parseFloat(amount.value) <= 0) {
        return false;
      }
      
      // For ICP, allow both account ID and principal ID
      if (currentTokenSymbol.value === 'ICP') {
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
      
      // Ensure token store is ready
      if (!tokenStore) {
        addLog('Token store not yet initialized', 'error');
        return;
      }
      
      transferLoading.value = true;
      
      try {
        addLog(`Sending ${amount.value} ${currentTokenSymbol.value} to ${recipient.value}...`, 'info');
        
        const result = await tokenStore.transferTokens(recipient.value, amount.value);
        
        if (result.success) {
          const confirmationId = result.blockHeight || result.blockIndex;
          
          addLog(`Successfully sent ${amount.value} ${currentTokenSymbol.value} to ${recipient.value}`, 'success');
          addLog(`Transaction confirmed with ${confirmationId ? `ID: ${confirmationId}` : 'success'}`, 'success');
          
          // Refresh balance after sending - do it async
          setTimeout(() => {
            refreshBalance().catch(e => console.error('Refresh error:', e));
          }, 0);
          
          // Clear form and hide it
          recipient.value = '';
          amount.value = '';
          showSendForm.value = false;
        } else {
          addLog(`Transfer failed: ${result.error || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        addLog(`Error sending ${currentTokenSymbol.value}: ${error.message}`, 'error');
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
    function addLog(message, type = 'info', showActivity = true) {
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
      } catch (e) {}
      
      // Also show in console
      if (showActivity) {
        console.log(`[Wallet ${timeStr}] ${message}`);
      }
    }
    
    // Watch for UI state changes
    watch([principalMode, showFullLog], () => {
      // Save UI state when it changes
      try {
        const uiState = JSON.parse(localStorage.getItem(UI_STATE_KEY) || '{}');
        uiState.principalMode = principalMode.value;
        uiState.showFullLog = showFullLog.value;
        localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
      } catch (e) {}
    });
    
    // Return all the data and functions the template needs
    return {
      // UI state
      loadingPhases,
      balanceLoading,
      addTokenLoading,
      transferLoading,
      showSendForm,
      showAddToken,
      showReceive,
      showFullLog,
      principalMode,
      
      // Form inputs
      newTokenCanisterId,
      recipient,
      amount,
      recipientType,
      logs,
      
      // Cached data
      cachedIds,
      cachedTokens,
      tokenBalances,
      currentTokenSymbol,
      currentFormattedBalance,
      
      // Computed properties from token store
      supportedTokens,
      
      // Store references
      authStore,
      tokenStore,
      
      // Methods
      updateCurrentFormattedBalance,
      getCachedTokenBalance,
      initializeUserIds,
      refreshAllBalancesInBackground,
      shouldRefresh,
      saveWalletDataToLocalStorage,
      fetchTokenBalance,
      refreshBalance,
      updateLoadingPhase,
      removeLoadingPhase,
      getTokenIcon,
      changeToken,
      addCustomToken,
      copyAddress,
      sendTokens,
      isValidAccountId,
      isValidPrincipal,
      addLog,
      
      // Computed properties
      isValidCanisterId,
      isValidTransfer
    };
  }
};
</script>

<style scoped>
/* Remove v-cloak visibility style as it's now handled globally */
/* Add a new cosmic-wallet-ready class for transitions if needed */
.cosmic-wallet-ready {
  opacity: 1;
  transition: opacity 0.2s ease;
}

/* Add a new skeleton-text style for placeholders */
.skeleton-text {
  display: inline-block;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  height: 1em;
  opacity: 0.5;
}

.cosmic-wallet-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 7rem; /* Account for the 6rem header with a bit extra */
  color: var(--color-text-primary);
}

.cosmic-wallet {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Loading styles */
.cosmic-wallet-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  margin-top: 7rem; /* Account for the 6rem header with a bit extra */
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.rotating {
  animation: spin 1s linear infinite;
}

/* Wallet header */
.wallet-header {
  padding: 16px;
  background: var(--cosmic-panel-bg);
}

.account-info {
  margin-bottom: 8px;
}

.address-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.address-toggle {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
}

.address-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: var(--radius-medium);
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

/* Icon button */
.icon-button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary-light);
}

/* Main balance card */
.main-balance-card {
  padding: 24px;
  background: linear-gradient(145deg, 
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.05) 100%);
  text-align: center;
}

.balance-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.balance-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.refresh-button {
  margin-left: 8px;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 700;
}

.token-symbol {
  font-size: 1.5rem;
  margin-left: 8px;
  opacity: 0.8;
}

/* Wallet actions */
.wallet-actions {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--cosmic-panel-bg);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  flex: 1;
  margin: 0 8px;
  max-width: 120px;
  background: linear-gradient(to bottom, var(--color-primary), var(--color-primary-dark));
}

.action-button i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

/* Token assets list */
.token-assets {
  padding: 16px;
  background: var(--cosmic-panel-bg);
}

.assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assets-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.asset-count {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.assets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: var(--radius-medium);
  background: rgba(15, 185, 253, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.asset-item:hover {
  background: rgba(15, 185, 253, 0.1);
}

.asset-item.active {
  background: rgba(15, 185, 253, 0.15);
  border-left: 3px solid var(--color-primary);
}

.asset-icon {
  width: 40px;
  height: 40px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.asset-details {
  flex: 1;
}

.asset-name {
  font-weight: 600;
}

.asset-symbol {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.asset-balance {
  font-weight: 600;
  text-align: right;
}

/* Forms */
.send-form-container,
.add-token-container,
.receive-container {
  padding: 16px;
  background: var(--cosmic-panel-bg);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.send-form,
.add-token-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Receive form */
.receive-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.qr-section {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  padding: 16px;
  background: white;
  border-radius: var(--radius-medium);
}

.qr-code-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.qr-code {
  width: 100%;
  height: 100%;
}

.address-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: var(--radius-medium);
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-address-button {
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.cosmic-input {
  padding: 12px;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(15, 185, 253, 0.15);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-primary);
  font-family: inherit;
}

.cosmic-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.2);
}

.radio-options {
  display: flex;
  gap: 16px;
}

.radio-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-primary);
}

.radio-options input {
  margin: 0;
}

.send-button,
.add-button {
  margin-top: 8px;
  padding: 12px;
}

/* Activity log */
.activity-log {
  padding: 16px;
  background: var(--cosmic-panel-bg);
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.log-entry {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-small);
  font-size: 0.9rem;
}

.log-time {
  color: var(--color-text-tertiary);
  margin-right: 8px;
  white-space: nowrap;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-message.info {
  color: var(--color-primary);
}

.log-message.success {
  color: var(--color-success);
}

.log-message.warning {
  color: var(--color-warning);
}

.log-message.error {
  color: var(--color-error);
}

.empty-log {
  text-align: center;
  padding: 24px;
  color: var(--color-text-tertiary);
  font-style: italic;
}

/* Responsive styles */
@media (max-width: 768px) {
  .cosmic-wallet-container {
    margin: 10px;
    padding-top: 7rem; /* Account for the 6rem header with a bit extra */
  }
  
  .wallet-actions {
    flex-wrap: wrap;
  }
  
  .action-button {
    min-width: 100px;
    margin-bottom: 8px;
  }
  
  .balance-amount {
    font-size: 2rem;
  }
  
  .token-symbol {
    font-size: 1.2rem;
  }
  
  .receive-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .qr-section {
    width: 150px;
    height: 150px;
  }
}

/* New skeleton loading styles */
.skeleton {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.skeleton-line {
  height: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  width: 100%;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.loading-placeholder {
  opacity: 0.6;
  font-style: italic;
}

.amount.placeholder {
  opacity: 0.6;
}

/* Small loading indicator at the bottom */
.loading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-top: 16px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: var(--radius-small);
  font-size: 0.8rem;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 2px solid var(--color-primary);
  animation: spin 1s linear infinite;
}
</style> 