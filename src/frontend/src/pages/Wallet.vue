<template>
  <div class="cosmic-wallet-container">
    <div class="cosmic-wallet">
      <!-- New Account Header Component -->
      <AccountHeader
        :default-currency="preferredCurrency"
        @action="handleWalletAction"
        @currency-changed="handleCurrencyChange"
        @network-changed="handleNetworkChange"
        @account-changed="handleAccountChange"
        @copy-success="handleCopySuccess"
        @copy-error="handleCopyError"
      />
      
      <!-- Token List Component -->
      <TokenList 
        :currency="preferredCurrency"
        :selected-account="currentAccountIndex"
        :current-network="currentNetwork"
        @select-token="handleTokenSelection"
        @add-token="showAddTokenForm"
        @manage-tokens="showManageTokensForm"
      />
      
      <!-- Wallet UI Components - Render based on active action -->
      
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
      
      <!-- Swap Token Form -->
      <SwapTokenForm
        v-if="activeForm === 'swap'"
        @close="activeForm = null"
        @swap-complete="handleSwapComplete"
      />
      
      <!-- Buy Token Form -->
      <BuyTokenForm
        v-if="activeForm === 'buy'"
        @close="activeForm = null"
        @purchase-complete="handlePurchaseComplete"
      />
      
      <!-- NFT Collection (only show if user has NFTs) -->
      <NFTCollection
        v-if="showNFTSection"
        :categories="nftCategories"
        v-model="activeCollection"
        @open-chest="openChest"
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
import { useNftsStore } from '../stores/nfts.js';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

// Import components
import AccountHeader from '../components/wallet/AccountHeader.vue';
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
    
    // Chest opening state
    const isOpeningChest = ref(false);
    const selectedChest = ref(null);
    const chestRewards = ref([]);
    const openingStage = ref(0); 
    const openingError = ref(null);

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
          console.error('Token initialization error:', error);
          addLog(`Wallet initialization error: ${error.message}. Using cached data.`, 'error');
        } finally {
          loading.value = false;
        }
      }
      
      // Fetch NFTs
      fetchUserNFTs().catch(e => console.error("NFT fetch error:", e));
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
    
    // Handle wallet actions (receive, send, swap, buy)
    function handleWalletAction(action) {
      activeForm.value = action;
      addLog(`Opening ${action} interface`, 'info');
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
        const nfts = await nftsStore.fetchUserNFTs();
        
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
          
          showNFTSection.value = true;
          addLog(`NFT collection loaded successfully`, 'success');
        } else {
          showNFTSection.value = false;
          addLog('No NFTs found in your collection', 'info');
        }
      } catch (error) {
        console.error('Error in fetchUserNFTs:', error);
        addLog(`Error fetching NFTs: ${error.message}`, 'error');
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
          
          addLog(`Successfully opened ${chest.name} chest!`, 'success');
        } else {
          throw new Error("No rewards received from chest opening");
        }
      } catch (error) {
        console.error('Error opening chest:', error);
        openingError.value = error.message;
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
            preferredCurrency = parsedUiState.currency;
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
          currency: preferredCurrency,
          accountIndex: currentAccountIndex.value,
          networkId: currentNetwork.value.id
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
      preferredCurrency = newCurrency.code;
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
    
    // Handle account change
    function handleAccountChange({ index, account }) {
      currentAccountIndex.value = index;
      addLog(`Switched to ${account.name}`, 'info');
      saveUIState();
    }
    
    // Handle copy success/error events
    function handleCopySuccess({ type }) {
      addLog(`${type === 'principal' ? 'Principal' : 'Account'} ID copied to clipboard`, 'success');
    }
    
    function handleCopyError({ error }) {
      addLog(`Failed to copy: ${error}`, 'error');
    }
    
    // Refresh all token balances
    async function refreshTokenBalances() {
      try {
        if (!tokenStore || !tokenStore.initialized) return;
        
        loading.value = true;
        loadingMessage.value = 'Refreshing balances...';
        
        const tokens = tokenStore.getSupportedTokens();
        for (const symbol of tokens) {
          await refreshTokenBalance(symbol);
        }
        
        addLog('Token balances refreshed', 'success');
      } catch (error) {
        console.error('Error refreshing balances:', error);
        addLog(`Error refreshing balances: ${error.message}`, 'error');
      } finally {
        loading.value = false;
      }
    }
    
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
      nftCategories,
      activeCollection,
      showNFTSection,
      isOpeningChest,
      selectedChest,
      chestRewards,
      openingStage,
      openingError,
      currentAccountIndex,
      preferredCurrency,
      currentNetwork,
      
      // Methods
      handleWalletAction,
      handleTokenSelection,
      handleCopy,
      handleTransferComplete,
      handleTokenAdded,
      handleSwapComplete,
      handlePurchaseComplete,
      showAddTokenForm,
      showManageTokensForm,
      getTokenBalance,
      addLog,
      openChest,
      closeChestDialog,
      revealReward,
      handleCurrencyChange,
      handleNetworkChange,
      handleAccountChange,
      handleCopySuccess,
      handleCopyError,
      refreshTokenBalances
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