<template>
  <div class="cosmic-wallet-container">
    <div class="cosmic-wallet">
      <!-- Account Header - combines account selection, network selection, and currency preferences -->
      <AccountHeader 
        :defaultCurrency="preferredCurrency"
        @action="handleWalletAction"
        @currency-changed="handleCurrencyChange"
        @network-changed="handleNetworkChange"
        @account-changed="handleAccountChange"
        @copy-success="handleCopy"
      />
      
      <!-- Your Assets Section with Tabs -->
      <div class="assets-container">
        <!-- Assets Header with Tabs -->
        <div class="assets-header">
          <h3>Your Assets</h3>
          <div class="asset-tabs">
            <button 
              class="asset-tab-button" 
              :class="{'active': activeAssetTab === 'tokens'}"
              @click="activeAssetTab = 'tokens'"
            >
              <span class="tab-icon"><i class="fas fa-coins"></i></span>
              <span class="tab-text">Tokens</span>
            </button>
            <button 
              class="asset-tab-button" 
              :class="{'active': activeAssetTab === 'nfts'}"
              @click="activeAssetTab = 'nfts'"
            >
              <span class="tab-icon"><i class="fas fa-image"></i></span>
              <span class="tab-text">NFTs</span>
            </button>
          </div>
        </div>
        
        <!-- Token List Tab -->
        <div v-if="activeAssetTab === 'tokens'" class="asset-tab-content">
          <div class="token-list-container">
            <!-- Loading state -->
            <div v-if="loading" class="token-list-loading">
              <div v-for="n in 4" :key="n" class="skeleton-item">
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-title"></div>
                  <div class="skeleton-line skeleton-subtitle"></div>
                </div>
                <div class="skeleton-amount">
                  <div class="skeleton-line skeleton-balance"></div>
                  <div class="skeleton-line skeleton-value"></div>
                </div>
              </div>
            </div>
            
            <!-- Token list when loaded -->
            <div v-else class="token-list">
              <!-- Token list header with actions -->
              <div class="token-list-header">
                <div class="token-list-actions">
                  <button 
                    class="icon-button"
                    @click="toggleShowZeroBalances"
                  >
                    <span class="icon">
                      <i class="fas fa-eye"></i>
                    </span>
                    <span class="text">{{ showZeroBalances ? 'Hide Zero' : 'Show All' }}</span>
                  </button>
                  
                  <button class="icon-button" @click="showAddTokenForm">
                    <span class="icon">
                      <i class="fas fa-plus"></i>
                    </span>
                    <span class="text">Add Token</span>
                  </button>
                  
                  <button class="icon-button" @click="showManageTokensForm">
                    <span class="icon">
                      <i class="fas fa-sliders-h"></i>
                    </span>
                    <span class="text">Manage</span>
                  </button>
                </div>
              </div>
              
              <!-- Token items -->
              <div class="tokens-wrapper">
                <div v-for="token in filteredTokens" :key="token.symbol" 
                     class="token-item" 
                     :class="{'selected': token.symbol === currentTokenSymbol}"
                     @click="handleTokenSelection(token)"
                >
                  <div class="token-icon">
                    <img :src="getTokenIcon(token.symbol)" :alt="token.name" />
                  </div>
                  
                  <div class="token-info">
                    <div class="token-name-row">
                      <span class="token-symbol">{{ token.symbol }}</span>
                      <span class="token-name">{{ token.name }}</span>
                    </div>
                    
                    <div class="token-standard">
                      <span class="token-network">{{ token.standard }}</span>
                    </div>
                  </div>
                  
                  <div class="token-balance">
                    <div class="token-amount">
                      {{ formatTokenAmount(getTokenBalance(token.symbol), token.decimals) }} {{ token.symbol }}
                    </div>
                    
                    <div class="token-value">
                      {{ formatFiatValue(token.valueUsd, preferredCurrency) }}
                    </div>
                  </div>
                  
                  <div class="token-actions">
                    <button class="action-button" @click.stop="() => handleWalletAction('send')">
                      <i class="fas fa-arrow-up"></i>
                    </button>
                    
                    <button class="action-button" @click.stop="() => handleWalletAction('receive')">
                      <i class="fas fa-arrow-down"></i>
                    </button>
                    
                    <button class="action-button" @click.stop="() => handleWalletAction('swap')">
                      <i class="fas fa-exchange-alt"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Empty state -->
                <div v-if="filteredTokens.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <i class="fas fa-coins"></i>
                  </div>
                  <p>No tokens found</p>
                  <button 
                    class="button-secondary"
                    @click="showAddTokenForm"
                  >
                    Add Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- NFT Tab -->
        <div v-if="activeAssetTab === 'nfts'" class="asset-tab-content">
          <NFTCollection
            :categories="nftCategories"
            v-model="activeCollection"
            @open-chest="openChest"
          />
        </div>
      </div>
      
      <!-- Keep the existing forms -->
      <SendTokenForm 
        v-if="activeForm === 'send'"
        :token-symbol="currentTokenSymbol"
        :principal-id="principalId"
        :token-balance="getTokenBalance(currentTokenSymbol)"
        @close="activeForm = null"
        @transfer-complete="handleTransferComplete"
      />
      
      <ReceiveTokenInfo
        v-if="activeForm === 'receive'"
        :principal-id="principalId"
        :account-id="accountId"
        v-model="principalMode"
        @close="activeForm = null"
        @copy="handleCopy"
      />
      
      <AddTokenForm
        v-if="activeForm === 'add-token'"
        @close="activeForm = null"
        @token-added="handleTokenAdded"
      />
      
      <SwapTokenForm
        v-if="activeForm === 'swap'"
        @close="activeForm = null"
        @swap-complete="handleSwapComplete"
      />
      
      <BuyTokenForm
        v-if="activeForm === 'buy'"
        @close="activeForm = null"
        @purchase-complete="handlePurchaseComplete"
      />
      
      <!-- Chest Opening Modal (moved chest logic to its own component) -->
      <ChestOpeningModal
        :is-visible="isOpeningChest"
        :chest="selectedChest"
        :rewards="chestRewards"
        :stage="openingStage"
        :error="openingError"
        @close="closeChestDialog"
        @reveal-reward="revealReward"
      />
      
      <!-- Loading Indicator -->
      <LoadingIndicator v-if="loading" :message="loadingMessage" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { useTokenStore } from '../stores/token.js';
import { useNftsStore } from '../stores/nfts.js';
import { useAccountsStore } from '../stores/accounts.js';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

// Import components
import AccountHeader from '../components/wallet/WalletHeader.vue';
import TokenList from '../components/wallet/TokenList.vue';
import SendTokenForm from '../components/forms/SendTokenForm.vue';
import ReceiveTokenInfo from '../components/forms/ReceiveTokenInfo.vue';
import AddTokenForm from '../components/forms/AddTokenForm.vue';
import SwapTokenForm from '../components/forms/SwapTokenForm.vue';
import BuyTokenForm from '../components/forms/BuyTokenForm.vue';
import ActivityLog from '../components/feedback/ActivityLog.vue';
import LoadingIndicator from '../components/feedback/LoadingIndicator.vue';
import NFTCollection from '../components/collections/NFTCollection.vue';
import ChestOpeningModal from '../components/modals/ChestOpeningModal.vue';
import { getAvatarIcon, getNetworkIcon, getTokenIcon } from '@/utils/IconService';

export default {
  name: 'Wallet',
  components: {
    AccountHeader,
    TokenList,
    SendTokenForm,
    ReceiveTokenInfo,
    AddTokenForm,
    SwapTokenForm,
    BuyTokenForm,
    ActivityLog,
    LoadingIndicator,
    NFTCollection,
    ChestOpeningModal
  },
  setup() {
    // Get stores
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    const nftsStore = useNftsStore();
    const accountsStore = useAccountsStore();
    
    // State variables from original implementation
    const principalId = ref('');
    const accountId = ref('');
    const currentTokenSymbol = ref('ICP');
    const principalMode = ref(false);
    const activeForm = ref(null);
    const loading = ref(false);
    const loadingMessage = ref('');
    const tokenBalances = ref({});
    const logs = ref([]);
    const currentAccountIndex = ref(0);
    const preferredCurrency = ref('USD');
    const currentNetwork = ref({
      id: 'icp',
      name: 'Internet Computer'
    });
    
    // NFT data
    const nftCategories = ref([
      { type: 'all', title: 'All NFTs', items: [], isLoading: false },
      { type: 'characters', title: 'Characters', items: [], isLoading: false },
      { type: 'units', title: 'Units', items: [], isLoading: false },
      { type: 'avatars', title: 'Avatars', items: [], isLoading: false },
      { type: 'trophies', title: 'Trophies', items: [], isLoading: false },
      { type: 'chests', title: 'Chests', items: [], isLoading: false }
    ]);
    const activeCollection = ref('all');
    const showNFTSection = ref(false);
    
    // Asset tabs state
    const activeAssetTab = ref('tokens');
    
    // Chest opening state
    const isOpeningChest = ref(false);
    const selectedChest = ref(null);
    const chestRewards = ref([]);
    const openingStage = ref(0); 
    const openingError = ref(null);

    // UI State Storage Keys
    const UI_STATE_KEY = 'cosmicrafts-wallet-ui-state';
    const WALLET_LOGS_KEY = 'cosmicrafts-wallet-logs';
    
    // New state variables for modular UI
    const showAccountsMenu = ref(false);
    const showNetworksMenu = ref(false);
    const showCurrenciesMenu = ref(false);
    const showZeroBalances = ref(true);
    
    // Computed properties for tokens
    const filteredTokens = computed(() => {
      if (showZeroBalances.value) {
        return tokenStore.tokenList;
      } else {
        return tokenStore.tokenList.filter(token => {
          return token.balance > BigInt(0);
        });
      }
    });
    
    // Initialize the wallet
    onMounted(async () => {
      // Load UI state from local storage
      loadUIState();
      
      // Load logs from local storage
      loadLogs();
      
      // Initialize accounts store
      loading.value = true;
      loadingMessage.value = 'Initializing wallet...';
      
      try {
        // Ensure authentication is initialized first
        if (!authStore.isAuthenticated()) {
          // Try to initialize identity from cache
          const initialized = authStore.initializeIdentityFromCache();
          console.log('Authentication initialized from cache:', initialized);
          
          // If not authenticated via cache, we need to prompt for login
          if (!initialized) {
            addLog('Authentication required. Please log in.', 'warning');
            // You might want to redirect to login page or show a login modal here
          }
        }
        
        // Initialize accounts store (this will create the first account if none exists)
        await accountsStore.initialize();
        
        // Initialize IDs from the current account
        await updateUserIdsFromCurrentAccount();
        
        // Initialize token store if not already done
        if (!tokenStore.initialized) {
          await tokenStore.initialize();
        }
        
        addLog('Wallet initialized successfully', 'success');
      } catch (error) {
        console.error('Wallet initialization error:', error);
        addLog(`Wallet initialization error: ${error.message}. Using cached data.`, 'error');
      } finally {
        loading.value = false;
      }
      
      // Fetch NFTs
      fetchUserNFTs().catch(e => console.error("NFT fetch error:", e));
    });
    
    // Update user IDs from the current account in the accounts store
    async function updateUserIdsFromCurrentAccount() {
      const currentAccount = accountsStore.currentAccount;
      if (currentAccount) {
        principalId.value = currentAccount.principalId;
        accountId.value = currentAccount.accountId;
        addLog('Account loaded: ' + currentAccount.name, 'success');
      } else {
        // If no account exists, try to initialize from auth identity
        const authSuccess = await initializeUserIds();
        
        // If we couldn't initialize from auth, check if we need to create an account
        if (!authSuccess && authStore.isAuthenticated()) {
          addLog('Creating account from authenticated identity...', 'info');
          // Request accounts store to create an account from the auth identity
          await accountsStore.createAccountFromIdentity(authStore.getIdentity());
          
          // Try again with the newly created account
          const retryAccount = accountsStore.currentAccount;
          if (retryAccount) {
            principalId.value = retryAccount.principalId;
            accountId.value = retryAccount.accountId;
            addLog('Account created successfully', 'success');
          }
        }
      }
    }
    
    // Initialize user IDs from auth store
    async function initializeUserIds() {
      try {
        if (!authStore.isAuthenticated()) {
          // If cache initialization didn't work, try one more time
          const initialized = authStore.initializeIdentityFromCache();
          
          if (!initialized) {
            addLog('User not authenticated', 'warning');
            return false;
          }
        }
        
        // Get identity from auth store
        const identity = authStore.getIdentity();
        if (!identity) {
          console.error('Identity not available in auth store');
          addLog('Identity not available', 'error');
          return false;
        }
        
        // Get principal and account ID
        const principal = identity.getPrincipal();
        principalId.value = principal.toString();
        
        // Calculate account ID
        const accountIdentifier = AccountIdentifier.fromPrincipal({ principal });
        accountId.value = accountIdentifier.toHex();
        
        addLog('User IDs loaded from auth store', 'success');
        return true;
      } catch (error) {
        console.error('Error initializing user IDs:', error);
        addLog(`Error loading user IDs: ${error.message}`, 'error');
        return false;
      }
    }
    
    // Toggle UI dropdowns
    function toggleAccountsMenu() {
      showAccountsMenu.value = !showAccountsMenu.value;
      showNetworksMenu.value = false;
      showCurrenciesMenu.value = false;
    }
    
    function toggleNetworksMenu() {
      showNetworksMenu.value = !showNetworksMenu.value;
      showAccountsMenu.value = false;
      showCurrenciesMenu.value = false;
    }
    
    function toggleCurrenciesMenu() {
      showCurrenciesMenu.value = !showCurrenciesMenu.value;
      showAccountsMenu.value = false;
      showNetworksMenu.value = false;
    }
    
    function toggleShowZeroBalances() {
      showZeroBalances.value = !showZeroBalances.value;
    }
    
    function toggleIdentifierType() {
      principalMode.value = !principalMode.value;
    }
    
    // Handle wallet actions (receive, send, swap, buy)
    function handleWalletAction(action, data = {}) {
      switch (action) {
        case 'send':
          activeForm.value = 'send';
          break;
          
        case 'receive':
          activeForm.value = 'receive';
          break;
          
        case 'swap':
          activeForm.value = 'swap';
          break;
          
        case 'buy':
          activeForm.value = 'buy';
          break;
          
        case 'add-token':
          activeForm.value = 'add-token';
          break;
          
        case 'create-account':
          accountCreateNewAccount();
          break;
          
        case 'import-account':
          // This would be handled by the AccountHeader component
          break;
          
        default:
          console.log('Unknown action:', action);
      }
    }
    
    // Handle token selection
    function handleTokenSelection(token) {
      currentTokenSymbol.value = token.symbol;
      addLog(`Selected ${token.name} token`, 'info');
    }
    
    // Show Add Token Form
    function showAddTokenForm() {
      activeForm.value = 'add-token';
    }
    
    // Show Manage Tokens Form
    function showManageTokensForm() {
      // This could be implemented in the future
      addLog('Token management coming soon', 'info');
    }
    
    // Fetch user NFTs
    async function fetchUserNFTs() {
      try {
        if (!authStore.isAuthenticated()) {
          console.log("User not authenticated, skipping NFT fetch");
          return;
        }
        
        loading.value = true;
        loadingMessage.value = 'Loading NFTs...';
        addLog('Fetching your NFT collection...', 'info');
        
        // Set all categories to loading state
        nftCategories.value.forEach(category => {
          category.isLoading = true;
        });
        
        // Fetch NFTs via the store
        const nfts = await nftsStore.fetchNFTs();
        
        if (nfts && nfts.length > 0) {
          // Clear existing items
          nftCategories.value.forEach(cat => {
            cat.items = [];
          });
          
          // Distribute NFTs to categories
          nfts.forEach(nft => {
            // Add to specific category
            const category = nft.metadata.category?.toLowerCase() || 'characters';
            const categoryObj = nftCategories.value.find(c => c.type === category);
            if (categoryObj) {
              categoryObj.items.push(nft);
            }
            
            // Add to "all" category
            const allCategory = nftCategories.value.find(c => c.type === 'all');
            if (allCategory) {
              allCategory.items.push(nft);
            }
          });
          
          addLog(`NFT collection loaded successfully`, 'success');
        } else {
          // Just log the message, but still show the NFT section
          addLog('No NFTs found in your collection', 'info');
        }
        
        // Always show NFT section, even when no NFTs are found
        showNFTSection.value = true;
      } catch (error) {
        console.error('Error in fetchUserNFTs:', error);
        addLog(`Error fetching NFTs: ${error.message}`, 'error');
        
        // Still show NFT section, even on error
        showNFTSection.value = true;
      } finally {
        // Set all categories to not loading
        nftCategories.value.forEach(category => {
          category.isLoading = false;
        });
        
        loading.value = false;
      }
    }
    
    // Open chest
    async function openChest(chest) {
      if (isOpeningChest.value) return;
      
      try {
        // Track chest opening start
        if (typeof window.clarity !== 'undefined') {
          window.clarity('event', 'chest_opening_started', {
            chest_id: chest.id,
            chest_name: chest.name,
            chest_type: chest.category
          });
        }
        
        // Set up state for opening
        isOpeningChest.value = true;
        selectedChest.value = chest;
        openingStage.value = 1;
        openingError.value = null;
        chestRewards.value = [];
        
        addLog(`Opening ${chest.name} chest...`, 'info');
        
        // Get rewards from NFT store
        const rewards = await nftsStore.openChest(chest.id);
        
        if (rewards && rewards.length > 0) {
          chestRewards.value = rewards;
          setTimeout(() => {
            openingStage.value = 2;
          }, 2000);
          
          // Track successful chest opening
          if (typeof window.clarity !== 'undefined') {
            window.clarity('event', 'chest_opened_successfully', {
              chest_id: chest.id,
              chest_name: chest.name,
              rewards_count: rewards.length,
              rewards: rewards.map(r => r.type || 'unknown')
            });
          }
          
          addLog(`Successfully opened ${chest.name} chest!`, 'success');
        } else {
          throw new Error("No rewards received from chest opening");
        }
      } catch (error) {
        console.error('Error opening chest:', error);
        openingError.value = error.message;
        
        // Track chest opening error
        if (typeof window.clarity !== 'undefined') {
          window.clarity('event', 'chest_opening_error', {
            chest_id: chest.id,
            chest_name: chest.name,
            error: error.message
          });
        }
        
        addLog(`Error opening chest: ${error.message}`, 'error');
      }
    }
    
    // Close chest dialog
    function closeChestDialog() {
      try {
        if (selectedChest.value) {
          // Remove the opened chest from categories
          const chestCategory = nftCategories.value.find(c => c.type === 'chests');
          if (chestCategory) {
            chestCategory.items = chestCategory.items.filter(item => item.id !== selectedChest.value.id);
          }
          
          // Also remove from 'all' category
          const allCategory = nftCategories.value.find(c => c.type === 'all');
          if (allCategory) {
            allCategory.items = allCategory.items.filter(item => item.id !== selectedChest.value.id);
          }

          // Handle Stardust rewards
          const stardustRewards = chestRewards.value.filter(r => r.name === 'Stardust');
          if (stardustRewards.length > 0) {
            // Get the total amount received
            const totalAmount = stardustRewards.reduce((sum, reward) => sum + reward.quantity, 0);
            addLog(`Received ${totalAmount} Stardust tokens!`, 'success');
            
            // Refresh token balances
            refreshTokenBalance('STDs');
            refreshTokenBalance('ICP');
          }
        }
      } catch (error) {
        console.error('Error in closeChestDialog:', error);
      } finally {
        // Reset state
        isOpeningChest.value = false;
        selectedChest.value = null;
        openingStage.value = 0;
        openingError.value = null;
        chestRewards.value = [];
      }
    }
    
    // Reveal rewards (for animation sequencing)
    function revealReward(index) {
      if (index < chestRewards.value.length) {
        chestRewards.value[index].revealed = true;
      }
    }
    
    // Format principal ID for display
    function formatPrincipalId(id) {
      if (!id) return '';
      
      // Show first 5 and last 5 characters
      return `${id.substring(0, 5)}...${id.substring(id.length - 5)}`;
    }
    
    // Format token amount for display
    function formatTokenAmount(amount, decimals) {
      // Handle BigInt and convert to display format
      if (typeof amount === 'bigint') {
        const divisor = BigInt(10) ** BigInt(decimals);
        const integerPart = amount / divisor;
        const fractionalPart = amount % divisor;
        
        let formatted = integerPart.toString();
        
        if (fractionalPart > 0) {
          // Convert fractional part to string with leading zeros
          let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
          
          // Trim trailing zeros
          while (fractionalStr.endsWith('0')) {
            fractionalStr = fractionalStr.slice(0, -1);
          }
          
          if (fractionalStr.length > 0) {
            // Only show first 4 decimal places
            formatted += '.' + fractionalStr.slice(0, 4);
          }
        }
        
        return formatted;
      }
      
      return '0';
    }
    
    // Format fiat value for display
    function formatFiatValue(value, currencyCode) {
      if (typeof value !== 'number') {
        return '—';
      }
      
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      return formatter.format(value);
    }
    
    // Copy identifier to clipboard
    async function copyIdentifier() {
      try {
        const textToCopy = principalMode.value ? principalId.value : accountId.value;
        await navigator.clipboard.writeText(textToCopy);
        addLog(`${principalMode.value ? 'Principal' : 'Account'} ID copied to clipboard`, 'success');
      } catch (error) {
        console.error('Failed to copy:', error);
        addLog(`Failed to copy: ${error.message}`, 'error');
      }
    }
    
    // Get token balance
    function getTokenBalance(symbol) {
      return tokenBalances.value[symbol] || BigInt(0);
    }
    
    // Refresh token balance (used by chest opening, etc.)
    async function refreshTokenBalance(symbol) {
      try {
        if (!tokenStore || !tokenStore.initialized) return;
        
        const balance = await tokenStore.getBalance(symbol);
        tokenBalances.value[symbol] = balance;
        
        return balance;
      } catch (e) {
        console.error(`Error refreshing ${symbol} balance:`, e);
      }
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
        refreshTokenBalance(symbol);
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
        refreshTokenBalance(symbol);
      } else {
        addLog(`Failed to add token: ${error}`, 'error');
      }
    }
    
    // Handle swap complete event
    function handleSwapComplete({ success, fromAmount, fromSymbol, toAmount, toSymbol, error }) {
      if (success) {
        addLog(`Successfully swapped ${fromAmount} ${fromSymbol} to ${toAmount} ${toSymbol}`, 'success');
        activeForm.value = null;
        refreshTokenBalance(fromSymbol);
        refreshTokenBalance(toSymbol);
      } else {
        addLog(`Swap failed: ${error}`, 'error');
      }
    }
    
    // Handle purchase complete event
    function handlePurchaseComplete({ success, amount, symbol, error }) {
      if (success) {
        addLog(`Successfully purchased ${amount} ${symbol}`, 'success');
        activeForm.value = null;
        refreshTokenBalance(symbol);
      } else {
        addLog(`Purchase failed: ${error}`, 'error');
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
          
          if (parsedUiState.currency) {
            preferredCurrency.value = parsedUiState.currency;
          }
          
          if (parsedUiState.accountIndex !== undefined) {
            currentAccountIndex.value = parsedUiState.accountIndex;
          }
          
          if (parsedUiState.networkId) {
            currentNetwork.value = { 
              id: parsedUiState.networkId,
              name: parsedUiState.networkId === 'icp' 
                ? 'Internet Computer' 
                : parsedUiState.networkId === 'eth' 
                  ? 'Ethereum' 
                  : parsedUiState.networkId === 'sol' 
                    ? 'Solana' 
                    : parsedUiState.networkId === 'icp-testnet'
                      ? 'ICP Testnet'
                      : 'Unknown Network'
            };
          }
          
          if (parsedUiState.showZeroBalances !== undefined) {
            showZeroBalances.value = parsedUiState.showZeroBalances;
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
          currentToken: currentTokenSymbol.value,
          currency: preferredCurrency.value,
          accountIndex: currentAccountIndex.value,
          networkId: currentNetwork.value.id,
          showZeroBalances: showZeroBalances.value
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
    
    // Handle currency change
    function handleCurrencyChange(newCurrency) {
      preferredCurrency.value = newCurrency.code;
      addLog(`Currency changed to ${newCurrency.name}`, 'info');
      saveUIState();
    }
    
    // Handle network change
    function handleNetworkChange(network) {
      currentNetwork.value = network;
      addLog(`Network changed to ${network.name}`, 'info');
      
      // Refresh token list and balances when network changes
      if (tokenStore.initialized) {
        refreshTokenBalances();
      }
      
      // Refresh NFTs if on ICP network
      if (network.id.startsWith('icp')) {
        fetchUserNFTs().catch(e => console.error("NFT fetch error:", e));
      } else {
        // Hide NFT section for non-ICP networks for now
        showNFTSection.value = false;
      }
      
      saveUIState();
    }
    
    // Handle account change from AccountHeader
    function handleAccountChange(data) {
      // data: { index, account }
      console.log('Account changed:', data);
      
      // Update user IDs
      updateUserIdsFromCurrentAccount();
      
      // Refresh token balances
      refreshTokenBalances();
      
      // Add log entry
      addLog(`Switched to account: ${data.account.name}`, 'info');
    }
    
    // Refresh token balances
    async function refreshTokenBalances() {
      try {
        await tokenStore.fetchAllBalances();
      } catch (error) {
        console.error('Error refreshing token balances:', error);
        addLog(`Error loading balances: ${error.message}`, 'error');
      }
    }
    
    // Create a new account
    async function accountCreateNewAccount() {
      try {
        loading.value = true;
        loadingMessage.value = 'Creating new account...';
        
        const index = await accountsStore.createAccount();
        
        // Switch to the new account
        await accountsStore.switchAccount(index);
        
        // Update user IDs
        await updateUserIdsFromCurrentAccount();
        
        addLog('New account created successfully', 'success');
      } catch (error) {
        console.error('Error creating new account:', error);
        addLog(`Error creating account: ${error.message}`, 'error');
      } finally {
        loading.value = false;
      }
    }
    
    return {
      principalId,
      accountId,
      activeForm,
      currentTokenSymbol,
      preferredCurrency,
      currentNetwork,
      activeAssetTab,
      principalMode,
      activeCollection,
      showZeroBalances,
      loading,
      loadingMessage,
      logs,
      accountsStore,
      
      // NFT data
      nftCategories,
      isOpeningChest,
      selectedChest,
      chestRewards,
      openingStage,
      openingError,
      
      // Computed properties
      filteredTokens,
      
      // Methods
      handleWalletAction,
      handleCurrencyChange,
      handleNetworkChange,
      handleAccountChange,
      refreshTokenBalances,
      
      // Helper methods
      formatTokenAmount,
      formatFiatValue,
      getTokenBalance,
      handleTokenSelection,
      showAddTokenForm,
      showManageTokensForm,
      toggleShowZeroBalances,
      handleCopy,
      
      // NFT methods
      fetchUserNFTs,
      
      // Chest methods
      addLog,
      openChest,
      closeChestDialog,
      revealReward,
      
      // Icon utilities
      getNetworkIcon,
      getTokenIcon
    };
  }
};
</script>

<style scoped>
/* Add CSS variables for z-index hierarchy */
:root {
  --z-index-base: 1;
  --z-index-token-list: 5;
  --z-index-account-header: 10;
  --z-index-dropdown-menu: 1000;
  --z-index-modal: 1500;
  --z-index-notification: 2000;
}

.cosmic-wallet-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 7rem; /* Account for the header with a bit extra */
  color: var(--color-text-primary, #ffffff);
  position: relative;
}

.cosmic-wallet {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

/* Account Header Styles */
.wallet-account-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  border-radius: var(--cosmic-radius-lg, 12px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  margin-bottom: 1rem;
  position: relative;
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
  z-index: 100; /* Higher than assets container */
}

.account-selector {
  position: relative;
}

.selected-account {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-account:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.account-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9) 0%, rgba(77, 207, 255, 0.9) 50%, rgba(0, 157, 223, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  overflow: hidden;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-avatar.small {
  width: 2rem;
  height: 2rem;
}

.account-details {
  display: flex;
  flex-direction: column;
}

.account-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-primary, #ffffff);
}

.account-id {
  font-size: 0.8rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.account-toggle {
  margin-left: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.rotate-180 {
  transform: rotate(180deg);
}

.accounts-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 280px;
  background: var(--cosmic-glass-bg-darker, rgba(23, 33, 43, 0.75));
  border-radius: var(--cosmic-radius-md, 8px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  box-shadow: var(--cosmic-shadow-md, 0 8px 16px rgba(0, 0, 0, 0.2));
  z-index: 1000; /* Very high z-index */
  overflow: hidden;
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
}

.accounts-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  font-weight: 700;
}

.accounts-list {
  max-height: 300px;
  overflow-y: auto;
}

.account-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.account-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.account-option.selected {
  background: rgba(15, 185, 253, 0.2);
}

.accounts-menu-footer {
  padding: 0.75rem 1rem;
  border-top: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.menu-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue, #0FB9FD);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-action:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.3);
}

.menu-action-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--cosmic-radius-sm, 6px);
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.2);
  color: var(--cosmic-danger, #FF4B4B);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-action-full:hover {
  background: rgba(255, 75, 75, 0.2);
  border-color: rgba(255, 75, 75, 0.3);
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--color-text-primary, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue, #0FB9FD);
}

/* Network Selector Styles */
.network-selector {
  position: relative;
}

.selected-network {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-network:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.network-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
}

.network-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.network-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
}

.network-toggle {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
  display: flex;
  align-items: center;
}

.networks-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 220px;
  background: var(--cosmic-glass-bg-darker, rgba(23, 33, 43, 0.75));
  border-radius: var(--cosmic-radius-md, 8px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  box-shadow: var(--cosmic-shadow-md, 0 8px 16px rgba(0, 0, 0, 0.2));
  z-index: 1000; /* Very high z-index */
  overflow: hidden;
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
}

.networks-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  font-weight: 600;
  font-size: 0.9rem;
}

.networks-list {
  max-height: 300px;
  overflow-y: auto;
}

.network-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.network-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.network-option.selected {
  background: rgba(15, 185, 253, 0.2);
}

.network-icon.small {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.network-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-sm, 6px);
  margin-left: auto;
  color: var(--cosmic-blue, #0FB9FD);
}

/* Currency Selector Styles */
.currency-selector {
  position: relative;
}

.selected-currency {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-currency:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.currency-code {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
}

.currency-toggle {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.currencies-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 220px;
  background: var(--cosmic-glass-bg-darker, rgba(23, 33, 43, 0.75));
  border-radius: var(--cosmic-radius-md, 8px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  box-shadow: var(--cosmic-shadow-md, 0 8px 16px rgba(0, 0, 0, 0.2));
  z-index: 1000; /* Very high z-index */
  overflow: hidden;
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
}

.currencies-menu-header {
  padding: 0.75rem 1rem;
  border-bottom: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  font-weight: 600;
  font-size: 0.9rem;
}

.currencies-list {
  max-height: 300px;
  overflow-y: auto;
}

.currency-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.currency-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.currency-option.selected {
  background: rgba(15, 185, 253, 0.2);
}

.currency-flag {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.currency-details {
  display: flex;
  flex-direction: column;
}

.currency-name {
  font-size: 0.8rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

/* Token List Styles */
.token-list-container {
  width: 100%;
  border-radius: var(--cosmic-radius-lg, 12px);
  overflow: hidden;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.token-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.token-list-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  margin: 0;
}

.token-list-actions {
  display: flex;
  gap: 0.75rem;
}

.icon-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--cosmic-radius-sm, 6px);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--color-text-primary, #ffffff);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  transform: translateY(-1px);
}

.icon-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
}

.icon-button .icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

.tokens-wrapper {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.token-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--cosmic-radius-md, 8px);
  background: rgba(30, 43, 56, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.token-item:hover {
  background: rgba(30, 43, 56, 0.6);
  border-color: rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-sm, 0 4px 8px rgba(0, 0, 0, 0.15));
}

.token-item.selected {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
}

.token-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.token-item:hover::before {
  opacity: 1;
}

.token-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  background: rgba(15, 185, 253, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--cosmic-shadow-sm, 0 4px 8px rgba(0, 0, 0, 0.15));
}

.token-icon img {
  width: 2.25rem;
  height: 2.25rem;
  object-fit: contain;
}

.token-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.token-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.token-symbol {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-primary, #ffffff);
  margin-right: 0.5rem;
}

.token-name {
  font-size: 0.9rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.token-standard {
  font-size: 0.8rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.token-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1.5rem;
}

.token-amount {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-primary, #ffffff);
  margin-bottom: 0.25rem;
}

.token-value {
  font-size: 0.9rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.token-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.token-item:hover .token-actions {
  opacity: 1;
}

/* Skeleton Loading */
.token-list-loading {
  padding: 1rem;
}

.skeleton-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: var(--cosmic-radius-md, 8px);
  background: rgba(30, 43, 56, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.skeleton-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-right: 1rem;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex: 1;
}

.skeleton-line {
  height: 0.9rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--cosmic-radius-sm, 6px);
}

.skeleton-title {
  width: 30%;
  height: 1.1rem;
}

.skeleton-subtitle {
  width: 50%;
  height: 0.8rem;
}

.skeleton-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1.5rem;
}

.skeleton-balance {
  width: 6rem;
  height: 1rem;
}

.skeleton-value {
  width: 4rem;
  height: 0.8rem;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.button-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--cosmic-radius-md, 8px);
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9) 0%, rgba(77, 207, 255, 0.9) 50%, rgba(0, 157, 223, 0.9) 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.35);
}

/* Responsive styles */
@media (max-width: 768px) {
  .cosmic-wallet-container {
    margin: 10px;
    padding-top: 7rem; /* Account for the header with a bit extra */
  }
  
  .wallet-account-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .account-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .accounts-menu {
    width: 100%;
  }
}

/* Add CSS for Asset Tabs */
.assets-container {
  width: 100%;
  border-radius: var(--cosmic-radius-lg, 12px);
  overflow: hidden;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  margin-bottom: 1rem;
  position: relative;
  z-index: 1; /* Lowest z-index */
}

.assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.assets-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  margin: 0;
}

.asset-tabs {
  display: flex;
  gap: 0.5rem;
}

.asset-tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md, 8px);
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.7));
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.asset-tab-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  color: var(--color-text-primary, #ffffff);
}

.asset-tab-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
  color: var(--color-text-primary, #ffffff);
}

.tab-icon {
  font-size: 0.9rem;
}

.asset-tab-content {
  padding: 0;
}

/* Remove the border and background from the token-list-container since it's now inside the assets container */
.token-list-container {
  background: transparent;
  border: none;
  border-radius: 0;
}

/* Responsive styles for asset tabs */
@media (max-width: 768px) {
  .assets-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .asset-tabs {
    width: 100%;
  }
  
  .asset-tab-button {
    flex: 1;
    justify-content: center;
  }
}
</style> 