<template>
  <div class="cosmic-wallet-container">
    <!-- Main Wallet UI - Guaranteed to render immediately -->
    <div class="cosmic-wallet" :class="{ 'cosmic-wallet-ready': true }">
      <!-- Wallet Header with Account Info -->
      <div class="wallet-header cosmic-panel">
        <div class="account-info">
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

      <!-- Main Token Grid -->
      <div class="token-grid cosmic-panel">
        <div class="token-grid-header">
          <h3>Your Assets</h3>
          <button class="icon-button refresh-button" @click="refreshAllBalancesInBackground" :disabled="balanceLoading">
            <i class="fas fa-sync-alt" :class="{ 'rotating': balanceLoading }"></i>
          </button>
        </div>
        
        <!-- Loading state -->
        <div v-if="!supportedTokens.length && !cachedTokens.length" class="token-grid-items skeleton-grid">
          <div v-for="n in 2" :key="`skeleton-${n}`" class="token-card skeleton">
            <div class="token-icon-container skeleton-circle"></div>
            <div class="token-details">
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
        
        <!-- Token cards -->
        <div v-else class="token-grid-items">
          <!-- ICP Token Card -->
          <div 
            :class="['token-card', { active: currentTokenSymbol === 'ICP' }]"
            @click="changeToken('ICP')"
          >
            <div class="token-icon-container">
              <img src="../assets/icons/icp.svg" alt="ICP" class="token-img" />
            </div>
            <div class="token-details">
              <div class="token-symbol-name">{{ getTokenMetadata('ICP').name }}</div>
              <div class="token-balance">
                {{ getTokenBalance('ICP') }}
              </div>
            </div>
          </div>
          
          <!-- Stardust Token Card -->
          <div 
            :class="['token-card', { active: currentTokenSymbol === 'STDs' }]"
            @click="changeToken('STDs')"
          >
            <div class="token-icon-container cosmic-container">
              <i class="fas fa-star cosmic-icon"></i>
            </div>
            <div class="token-details">
              <div class="token-symbol-name">{{ getTokenMetadata('STDs').name }}</div>
              <div class="token-balance">
                {{ getTokenBalance('STDs') }}
              </div>
            </div>
          </div>
          
          <!-- Other Tokens -->
          <div 
            v-for="token in (supportedTokens.length ? supportedTokens : cachedTokens).filter(t => t.symbol !== 'ICP' && t.symbol !== 'STDs')" 
            :key="token.symbol"
            :class="['token-card', { active: currentTokenSymbol === token.symbol }]"
            @click="changeToken(token.symbol)"
          >
            <div class="token-icon-container">
              <i :class="getTokenIcon(token.symbol)"></i>
            </div>
            <div class="token-details">
              <div class="token-symbol-name">{{ getTokenMetadata(token.symbol).name }}</div>
              <div class="token-balance">
                {{ getTokenBalance(token.symbol) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wallet actions -->
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

      <!-- NFT Collection Section -->
      <section v-if="showNFTSection" class="nft-collection cosmic-panel content-section collection-section">
        <h2>NFT Collection</h2>
        <div class="collection-tabs">
          <div 
            v-for="category in nftCategories" 
            :key="category.type"
            class="tab"
            :class="{ 'active': activeCollection === category.type }"
            @click="activeCollection = category.type"
          >
            <span class="tab-icon">{{ getCategoryIcon(category.type) }}</span>
            {{ category.title }}
            <span v-if="category.isLoading" class="loading-indicator">⟳</span>
          </div>
        </div>
        <div class="collection-grid">
          <div v-for="category in nftCategories" :key="category.type">
            <div class="nft-grid" v-if="activeCollection === category.type">
              <template v-if="category.isLoading">
                <div class="nft-card skeleton" v-for="i in 6" :key="i">
                  <div class="nft-image skeleton-image"></div>
                  <div class="nft-info">
                    <span class="nft-name skeleton-text"></span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div 
                  v-for="nft in category.items" 
                  :key="nft.id"
                  class="nft-card-wrapper"
                >
                  <NFTCard :nft="nft" />
                  
                  <!-- Add Open Chest button for chest-type NFTs -->
                  <div v-if="nft.metadata.category === 'chests'" class="chest-actions">
                    <button @click="openChest(nft)" class="open-chest-btn">
                      <span class="chest-icon">🔓</span>
                      Open Chest
                    </button>
                  </div>
                </div>
                <p v-if="category.items.length === 0" class="empty-message">
                  No {{ category.title.toLowerCase() }} found in your collection
                </p>
              </template>
            </div>
          </div>
        </div>
      </section>

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
          
          <div class="form-group">
            <label for="amount">Amount</label>
            <input
              type="number"
              id="amount"
              v-model="transferAmount"
              placeholder="Enter amount"
              class="cosmic-input"
              :disabled="isSending"
              min="0"
              step="any"
            >
            <small class="info-text">{{ formattedTransactionFee }}</small>
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

      <!-- Chest Opening Modal -->
      <div v-if="isOpeningChest" class="chest-modal-overlay" @click.self="closeChestDialog">
        <div class="chest-modal">
          <!-- Error state -->
          <div v-if="openingError" class="chest-error">
            <h3>Failed to Open Chest</h3>
            <p>{{ openingError }}</p>
            <button @click="closeChestDialog" class="cosmic-button cosmic-button-secondary">Close</button>
          </div>
          
          <!-- Opening Animation -->
          <div v-else-if="openingStage === 1" class="chest-opening-animation">
            <h3>Opening {{ selectedChest?.name || 'Chest' }}...</h3>
            <div class="chest-animation">
              <div class="chest-glow"></div>
              <img :src="selectedChest?.image" alt="Chest" class="chest-image pulse" />
              <div class="particles-container">
                <div class="particle" v-for="i in 20" :key="`particle-${i}`"></div>
              </div>
            </div>
          </div>
          
          <!-- Rewards Display -->
          <div v-else-if="openingStage === 2" class="chest-rewards">
            <h3>Your Rewards</h3>
            <div class="rewards-list">
              <div 
                v-for="(reward, index) in chestRewards" 
                :key="`reward-${index}`"
                class="reward-item"
                :class="{ 'revealed': reward.revealed, [getRewardRarityClass(reward.rarity)]: true }"
                @animationend="revealReward(index + 1)"
              >
                <div class="reward-icon" :class="{'stardust-icon': reward.type === 'currency' && reward.name === 'Stardust'}">
                  <span v-if="reward.type === 'currency' && reward.name === 'Stardust'" class="cosmic-star">★</span>
                  <span v-else>{{ getRewardTypeIcon(reward.type) }}</span>
                </div>
                <div class="reward-details">
                  <div class="reward-name">{{ reward.name }}</div>
                  <div class="reward-type">{{ reward.type === 'currency' ? 'COSMIC Token' : reward.type }}</div>
                </div>
                <div v-if="reward.quantity > 1" class="reward-quantity">
                  x{{ reward.quantity }}
                </div>
              </div>
              
              <div v-if="chestRewards.length === 0" class="no-rewards">
                <p>No rewards found in this chest</p>
              </div>
            </div>
            
            <button @click="closeChestDialog" class="cosmic-button cosmic-button-primary close-rewards">
              Collect Rewards
            </button>
          </div>
        </div>
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
import { useNftsStore } from '../stores/nfts.js';
import { useCanisterStore } from '../stores/canister.js';
import NFTCard from '../components/NFTCard.vue';

// Define component outside setup to allow for async imports
export default {
  components: { QRCodeVue3, NFTCard },
  setup() {
    // Get stores
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    const nftsStore = useNftsStore();
    const canisterStore = useCanisterStore();

    // Cached data
    const cachedIds = ref({ principal: '', account: '' });
    const cachedTokens = ref([]);
    const tokenBalances = ref({}); // Initialize as empty object
    const currentTokenSymbol = ref('ICP');
    const currentFormattedBalance = ref('0.00');
    const transferAmount = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const isSending = ref(false);
    const isLoggedIn = computed(() => authStore.isAuthenticated());

    // Get token metadata including decimals and fee from token configs
    function getTokenMetadata(symbol) {
      // First try to get from token store directly
      if (tokenStore?.service?.tokenConfigs) {
        const tokenConfig = tokenStore.service.tokenConfigs.get(symbol);
        if (tokenConfig) {
          return {
            decimals: tokenConfig.decimals || 8,
            fee: tokenConfig.fee || BigInt(10000),
            name: tokenConfig.name || symbol,
            standard: tokenConfig.standard || 'unknown'
          };
        }
      }
      
      // Then try the cached tokens from token store
      const tokenFromStore = supportedTokens.value.find(t => t.symbol === symbol);
      if (tokenFromStore) {
        return {
          decimals: tokenFromStore.decimals || 8,
          fee: BigInt(tokenFromStore.fee || '10000'),
          name: tokenFromStore.name || symbol,
          standard: tokenFromStore.standard || 'unknown'
        };
      }
      
      // Finally try our local cached tokens
      const tokenFromCache = cachedTokens.value.find(t => t.symbol === symbol);
      if (tokenFromCache) {
        return {
          decimals: tokenFromCache.decimals || 8,
          fee: BigInt(tokenFromCache.fee || '10000'),
          name: tokenFromCache.name || symbol,
          standard: tokenFromCache.standard || 'unknown'
        };
      }
      
      // Default fallback
      return {
        decimals: 8,
        fee: BigInt(10000),
        name: symbol,
        standard: 'unknown'
      };
    }
    
    // Format balance directly from BigInt to string with proper formatting
    function formatBalance(balanceAmount, decimals = 8) {
      try {
        if (!balanceAmount) return '0';
        
        // Get actual decimals from token metadata if not provided
        if (typeof decimals !== 'number' || decimals < 0) {
          console.warn(`Invalid decimals: ${decimals}, using default 8`);
          decimals = 8;
        }
        
        const divisor = 10n ** BigInt(decimals);
        
        // Convert to string first to avoid floating point issues
        const wholePart = balanceAmount / divisor;
        const fractionalPart = balanceAmount % divisor;
        
        // Format with padding zeros
        let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        
        // Trim trailing zeros but keep at least 2 decimal places
        const trimmedFractional = fractionalStr.replace(/0+$/, '');
        fractionalStr = trimmedFractional.length > 0 ? trimmedFractional : '00';
        
        // Ensure at least 2 decimal places
        if (fractionalStr.length < 2) {
          fractionalStr = fractionalStr.padEnd(2, '0');
        }
        
        // Format with commas for thousands
        const wholeFormatted = new Intl.NumberFormat().format(Number(wholePart));
        
        // For small amounts that round to zero, show at least the first significant digit
        if (wholePart === 0n && fractionalPart > 0n) {
          let significantDigits = '';
          for (let i = 0; i < fractionalStr.length; i++) {
            significantDigits += fractionalStr[i];
            if (fractionalStr[i] !== '0') {
              // Found first non-zero digit
              break;
            }
          }
          // Keep up to 4 more digits after the first significant digit
          const displayDigits = significantDigits.length + 4;
          return `${wholeFormatted}.${fractionalStr.substring(0, displayDigits)}`;
        }
        
        // For normal amounts, show whole part and first few decimal places
        return `${wholeFormatted}.${fractionalStr.substring(0, Math.min(fractionalStr.length, 8))}`;
      } catch (error) {
        console.error('Error formatting balance:', error);
        return '0';
      }
    }

    // Use computed property to access token store's supported tokens
    const supportedTokens = computed(() => tokenStore.supportedTokens || []);

    // Token Grid display function to directly get token balance display
    function getTokenBalance(symbol, fallbackDecimals = 8) {
      try {
        const balance = tokenBalances.value?.[symbol] || BigInt(0);
        // Get the proper decimals from metadata
        const metadata = getTokenMetadata(symbol);
        return formatBalance(balance, metadata.decimals);
      } catch (error) {
        console.error(`Error getting balance for ${symbol}:`, error);
        return '0';
      }
    }
    
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
    const fetchNFTs = ref(true);
    const selectedNft = ref(null); // Added this for NFT selection
    
    // Chest opening state
    const isOpeningChest = ref(false);
    const selectedChest = ref(null);
    const chestRewards = ref([]);
    const openingStage = ref(0); // 0: not started, 1: opening, 2: showing rewards
    const openingError = ref(null);

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
    const showTokenSelector = ref(false); // Added this for token selection UI

    // Form inputs
    const newTokenCanisterId = ref('');
    const recipient = ref('');
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
      
      // Make sure token balances object is initialized with empty values
      tokenBalances.value = tokenBalances.value || {};
      tokenBalances.value['ICP'] = tokenBalances.value['ICP'] || BigInt(0);
      tokenBalances.value['STDs'] = tokenBalances.value['STDs'] || BigInt(0);
      
      // Log UI ready immediately
      addLog('UI ready', 'success');
      
      // Wait briefly to allow the UI to render before initiating async operations
      setTimeout(() => {
        // Initialize token store
        if (tokenStore) {
          tokenStore.initialize()
            .then(() => {
              cachedTokens.value = tokenStore.supportedTokens || [];
              console.log("Token store initialized with", cachedTokens.value.length, "tokens");
              
              // Initialize user IDs
              return initializeUserIds();
            })
            .then(() => {
              // Now safely load balances in the background
              return loadTokenBalances();
            })
            .then(() => {
              // Also fetch NFTs in the background
              if (fetchNFTs.value) {
                fetchUserNFTs().catch(e => console.error("NFT fetch error:", e));
              }
            })
            .catch(e => console.error("Initialization error:", e));
        }
      }, 200);
      
      // Set up periodic refresh in background
      setInterval(() => {
        if (shouldRefresh()) {
          loadTokenBalances().catch(e => console.error("Refresh error:", e));
        }
      }, 60000); // Check every minute
    });
    
    // Load token balances safely
    async function loadTokenBalances() {
      console.log("Loading token balances...");
      
      try {
        // Fetch ICP balance first
        try {
          const icpBalance = await tokenStore.getBalance('ICP');
          console.log("ICP balance:", icpBalance.toString());
          tokenBalances.value['ICP'] = icpBalance;
        } catch (icpError) {
          console.error("Error loading ICP balance:", icpError);
        }
        
        // Then fetch Stardust balance
        try {
          const stardustBalance = await tokenStore.getBalance('STDs');
          console.log("Stardust balance:", stardustBalance.toString());
          tokenBalances.value['STDs'] = stardustBalance;
        } catch (stardustError) {
          console.error("Error loading Stardust balance:", stardustError);
        }
        
        // Save to cache regardless of individual errors
        saveWalletDataToLocalStorage();
        
        console.log("Token balances loading completed");
        return true;
      } catch (error) {
        console.error("Fatal error loading token balances:", error);
        return false;
      }
    }
    
    // Fetch NFTs for the current user
    async function fetchUserNFTs() {
      try {
        if (!authStore.isAuthenticated()) {
          console.log("User not authenticated, skipping NFT fetch");
          return;
        }
        
        updateLoadingPhase('Loading NFTs...');
        addLog('Fetching your NFT collection...', 'info');
        
        // Get the user's principal
        const identity = authStore.getIdentity();
        if (!identity) {
          throw new Error("Identity not available");
        }
        
        const principal = identity.getPrincipal();
        const principalText = principal.toString();
        
        // Get cosmicrafts canister
        const cosmicrafts = await canisterStore.get("cosmicrafts");
        if (!cosmicrafts) {
          throw new Error("Cosmicrafts canister not initialized");
        }
        
        // Mark the category as loading
        const category = nftCategories.value.find(c => c.type === activeCollection.value);
        if (category) {
          category.isLoading = true;
        }
        
        // Use the same approach as Profile.vue for fetching NFTs
        try {
          const nfts = await cosmicrafts.getNFTs(principal);
          const processedNfts = JSON.parse(
            JSON.stringify(nfts || [], (key, value) => 
              typeof value === 'bigint' ? value.toString() : value
            )
          );
          
          if (processedNfts?.length > 0) {
            const categorizedNfts = processNFTs(processedNfts);
            
            // Clear existing items for all categories
            nftCategories.value.forEach(cat => {
              cat.items = [];
            });
            
            // Distribute NFTs to their respective categories
            categorizedNfts.forEach(nft => {
              const nftCategory = nft.metadata.category?.toLowerCase() || 'characters';
              
              // Add to specific category
              const categoryObj = nftCategories.value.find(c => c.type === nftCategory);
              if (categoryObj) {
                categoryObj.items.push(nft);
              }
              
              // Add to "all" category
              const allCategory = nftCategories.value.find(c => c.type === 'all');
              if (allCategory) {
                allCategory.items.push(nft);
              }
            });
            
            // Show the section if we have NFTs
            showNFTSection.value = true;
          }
        } catch (error) {
          console.error('Error fetching NFTs:', error);
          addLog(`Error fetching NFTs: ${error.message}`, 'error');
        }
        
        addLog(`NFT collection loaded successfully`, 'success');
      } catch (error) {
        console.error('Error in fetchUserNFTs:', error);
        addLog(`Error fetching NFTs: ${error.message}`, 'error');
      } finally {
        // Mark all categories as not loading
        nftCategories.value.forEach(category => {
          category.isLoading = false;
        });
        
        removeLoadingPhase('Loading NFTs...');
      }
    }
    
    // Process NFTs - directly copied from Profile.vue
    function processNFTs(nfts) {
      console.log('Processing NFTs:', nfts);
      
      return nfts.map(nft => {
        try {
          // Extract id and metadata from array format
          const [id, rawMetadata] = nft;
          
          // The metadata structure is: metadata.metadata.general
          const metadata = rawMetadata.metadata || {};
          const general = metadata.general || {};
          const basic = metadata.basic || [];
          const category = metadata.category || {};
          
          // Determine category
          let categoryType = 'unknown';
          if (category) {
            if ('Avatar' in category) categoryType = 'avatars';
            else if ('Trophy' in category) categoryType = 'trophies';
            else if ('Chest' in category) categoryType = 'chests';
            else if ('Unit' in category) categoryType = 'units';
          }

          // Get the image path based on the NFT name for chests
          const getImagePath = (name, category) => {
            if (category === 'chests') {
              const nameToPath = {
                'Cosmic Cache': '/assets/webp/cosmic-cache.webp',
                'Stellar Box': '/assets/webp/stellar-box.webp',
                'Nebula Cube': '/assets/webp/nebula-cube.webp',
                'Galactic Crate': '/assets/webp/galactic-crate.webp',
                'Astral Vault': '/assets/webp/astral-vault.webp',
                'Celestial Locker': '/assets/webp/celestial-locker.webp',
                'Quantum Chest': '/assets/webp/quantum-chest.webp',
                'Ethereal Metacube': '/assets/webp/ethereal-metacube.webp'
              };
              const resolvedPath = nameToPath[name] || '/assets/webp/cosmic-cache.webp';
              return resolvedPath;
            }
            
            // Fallback to category-based images
            let fallbackPath;
            switch(category) {
              case 'avatars':
                fallbackPath = '/assets/webp/avatar.webp';
                break;
              case 'units':
                fallbackPath = '/assets/webp/unit.webp';
                break;
              case 'trophies':
                fallbackPath = '/assets/webp/trophy.webp';
                break;
              default:
                fallbackPath = '/assets/webp/nft.webp';
            }
            return fallbackPath;
          };

          // Process faction if it exists (it's an array with a single object)
          let faction = null;
          if (general.faction && Array.isArray(general.faction) && general.faction.length > 0) {
            const factionObj = general.faction[0];
            if ('Cosmicon' in factionObj) faction = 'cosmicon';
            else if ('Spade' in factionObj) faction = 'spade';
            else if ('Arch' in factionObj) faction = 'arch';
            else if ('Celestial' in factionObj) faction = 'celestial';
            else if ('Webe' in factionObj) faction = 'webe';
            else if ('Neutral' in factionObj) faction = 'neutral';
            else if ('Spirat' in factionObj) faction = 'spirat';
          }

          // Process rarity (it's an array with a single value)
          const rarity = general.rarity && Array.isArray(general.rarity) 
            ? general.rarity[0] 
            : 1;

          // Get basic stats
          const level = basic.length > 0 ? basic[0].level || 1 : 1;
          const damage = basic.length > 0 ? basic[0].damage || 0 : 0;
          const health = basic.length > 0 ? basic[0].health || 0 : 0;

          // Process skills
          const skills = metadata.skills || [];
          const processedSkills = skills.map(skill => {
            if ('CriticalStrike' in skill) return 'critical-strike';
            if ('Shield' in skill) return 'shield';
            if ('Evasion' in skill) return 'evasion';
            return null;
          }).filter(Boolean);

          // Process soul data if it exists
          const soulData = metadata.soul || [];
          const soul = soulData.length > 0 ? {
            gamesPlayed: soulData[0].gamesPlayed || 0,
            totalDamageDealt: soulData[0].totalDamageDealt || 0,
            birth: soulData[0].birth || Date.now(),
            totalKills: soulData[0].totalKills || 0,
            combatExperience: soulData[0].combatExperience || 0
          } : null;

          const name = general.name || 'Unknown NFT';
          const imagePath = getImagePath(name, categoryType);

          // Construct the final NFT object
          const processedNFT = {
            id: id?.toString() || 'unknown',
            name,
            description: general.description || '',
            image: imagePath,
            metadata: {
              category: categoryType,
              faction,
              rarity,
              level,
              damage,
              health,
              skills: processedSkills,
              soul
            }
          };

          return processedNFT;
        } catch (error) {
          console.error('Error processing NFT:', error, 'NFT data:', nft);
          return {
            id: 'error',
            name: 'Error Loading NFT',
            description: 'Failed to load NFT data',
            image: '/assets/webp/nft.webp',
            metadata: {
              category: 'unknown',
              rarity: 1,
              level: 1
            }
          };
        }
      });
    }
    
    // Start chest opening process
    async function openChest(chest) {
      if (isOpeningChest.value) return; // Prevent multiple simultaneous chest openings
      
      try {
        // Set up state for opening
        isOpeningChest.value = true;
        selectedChest.value = chest;
        openingStage.value = 1;
        openingError.value = null;
        chestRewards.value = [];
        
        addLog(`Opening ${chest.name} chest...`, 'info');
        
        // Get the cosmicrafts canister
        const cosmicrafts = await canisterStore.get("cosmicrafts");
        if (!cosmicrafts) {
          throw new Error("Cosmicrafts canister not initialized");
        }
        
        // Call the openChest function with the chest ID
        const chestId = chest.id;
        const result = await cosmicrafts.openChest(BigInt(chestId));
        
        console.log('Chest opening result:', result);
        
        if (!result) {
          throw new Error("Failed to open chest: No response from canister");
        }
        
        // Process the rewards
        const processedRewards = processRewards(result);
        chestRewards.value = processedRewards;
        
        // Move to rewards stage after a short delay for animation
        setTimeout(() => {
          openingStage.value = 2;
        }, 2000);
        
        addLog(`Successfully opened ${chest.name} chest!`, 'success');
        
        // Refresh NFTs in the background after opening
        setTimeout(() => {
          fetchUserNFTs().catch(e => console.error("Error refreshing NFTs after chest opening:", e));
        }, 3000);
      } catch (error) {
        console.error('Error opening chest:', error);
        openingError.value = error.message;
        addLog(`Error opening chest: ${error.message}`, 'error');
      }
    }
    
    // Process the rewards from the canister
    function processRewards(rewardsData) {
      try {
        // The result is an array where first element is success boolean and second is the reward JSON string
        if (!Array.isArray(rewardsData) || rewardsData.length !== 2) {
          return [];
        }

        const [success, rewardJson] = rewardsData;
        if (!success) return [];

        try {
          const reward = JSON.parse(rewardJson);
          
          // For Stardust token rewards
          if (reward.token === "Stardust") {
            return [{
              id: reward.transaction_id?.toString() || 'unknown',
              type: 'currency',
              name: 'Stardust',
              description: 'Stardust Token',
              image: '/assets/webp/cosmic-token.webp',
              rarity: 3, // Make it rare since it's the game currency
              quantity: reward.amount || 0,
              revealed: true,
              symbol: 'STDs' // Use STDs symbol for token reference
            }];
          }
          
          return [];
        } catch (parseError) {
          console.error('Error parsing reward JSON:', parseError);
          return [];
        }
      } catch (error) {
        console.error('Error processing rewards:', error);
        return [];
      }
    }

    // Close the chest opening dialog and handle cleanup
    async function closeChestDialog() {
      try {
        if (selectedChest.value) {
          // Remove the opened chest from memory
          const chestCategory = nftCategories.value.find(c => c.type === 'chests');
          if (chestCategory) {
            chestCategory.items = chestCategory.items.filter(item => item.id !== selectedChest.value.id);
          }
          
          // Also remove from 'all' category
          const allCategory = nftCategories.value.find(c => c.type === 'all');
          if (allCategory) {
            allCategory.items = allCategory.items.filter(item => item.id !== selectedChest.value.id);
          }

          // If we got Stardust rewards, handle them properly
          const stardustRewards = chestRewards.value.filter(r => r.name === 'Stardust');
          if (stardustRewards.length > 0) {
            // Get the total amount received
            const totalAmount = stardustRewards.reduce((sum, reward) => sum + reward.quantity, 0);
            
            // Add a log entry showing the amount received
            addLog(`Received ${totalAmount} Stardust tokens!`, 'success');
            
            // Immediately update both token balances
            await fetchTokenBalance('ICP');
            await fetchTokenBalance('STDs');
            
            // Force update UI
            currentTokenSymbol.value = 'STDs';
            updateCurrentFormattedBalance();
            
            // Save to cache after updating
            saveWalletDataToLocalStorage();
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
    
    // Reveal a reward (for animation sequencing)
    function revealReward(index) {
      if (index < chestRewards.value.length) {
        chestRewards.value[index].revealed = true;
      }
    }
    
    // Get a CSS class for reward rarity display
    function getRewardRarityClass(rarity) {
      const classes = {
        1: 'common',
        2: 'uncommon',
        3: 'rare',
        4: 'epic',
        5: 'legendary'
      };
      return classes[rarity] || 'common';
    }
    
    // Get reward type icon
    function getRewardTypeIcon(type) {
      const icons = {
        'character': '🦸',
        'unit': '⚔️',
        'avatar': '🎭',
        'trophy': '🏆',
        'currency': '💰',
        'resource': '🔹',
        'xp': '⭐'
      };
      return icons[type] || '🎁';
    }

    // Get icon for NFT category
    function getCategoryIcon(type) {
      const icons = {
        all: '🎯',
        characters: '🦸',
        units: '⚔️',
        avatars: '🎭',
        trophies: '🏆',
        chests: '📦'
      };
      return icons[type] || '📦';
    }

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
        if (!currentTokenSymbol.value) return;
        
        const balance = tokenBalances.value[currentTokenSymbol.value] || BigInt(0);
        const metadata = getTokenMetadata(currentTokenSymbol.value);
        currentFormattedBalance.value = formatBalance(balance, metadata.decimals);
      } catch (error) {
        console.error('Error updating formatted balance:', error);
        currentFormattedBalance.value = '0.00';
      }
    }

    // Get formatted token balance from cache 
    function getCachedTokenBalance(symbol) {
      // Don't trigger auto-fetching - causes infinite loops
      if (!tokenBalances.value[symbol]) {
        return '0';
      }
      
      // Try to format ourselves
      try {
        // Find token decimals from the token list
        const token = cachedTokens.value.find(t => t.symbol === symbol) || 
                     supportedTokens.value.find(t => t.symbol === symbol);
        if (!token) return '0';
        
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
          maximumFractionDigits: decimals
        });
      } catch (error) {
        console.error('Error formatting cached token amount:', error);
        return '0';
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
        
        console.log(`Fetching ${symbol} balance...`);
        
        // Use token store to get balance from blockchain
        const balance = await tokenStore.getBalance(symbol);
        console.log(`Balance fetched for ${symbol}:`, balance.toString());
        
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
        
        if (!silent) addLog(`${symbol} balance updated`, 'success', true);
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
        'STDs': 'fas fa-star', // For Stardust token
        'BTC': 'fab fa-bitcoin',
        'ETH': 'fab fa-ethereum'
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
      if (!recipient.value || !transferAmount.value || parseFloat(transferAmount.value) <= 0) {
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
    
    // Send tokens to another wallet
    async function sendTokens() {
      if (!isLoggedIn.value) {
        addLog('You must be logged in to send tokens', 'error');
        return;
      }
      
      if (!isValidTransfer.value) {
        addLog('Invalid transfer details', 'error');
        return;
      }
      
      transferLoading.value = true;
      
      try {
        // Get token metadata including fee
        const tokenMetadata = getTokenMetadata(currentTokenSymbol.value);
        
        // Format amount to proper decimals based on token
        const amountToSend = parseFloat(transferAmount.value);
        if (isNaN(amountToSend) || amountToSend <= 0) {
          addLog('Please enter a valid amount', 'error');
          transferLoading.value = false;
          return;
        }
        
        // Convert from human-readable to token format with correct decimals
        const decimals = tokenMetadata.decimals;
        const rawAmount = BigInt(Math.floor(amountToSend * (10 ** decimals)));
        
        // Check if we have enough balance (including fee)
        const currentBalance = tokenBalances.value[currentTokenSymbol.value] || BigInt(0);
        const fee = tokenMetadata.fee || BigInt(10000);
        
        if (currentBalance < (rawAmount + fee)) {
          addLog(`Not enough balance. Need ${formatBalance(rawAmount + fee, decimals)} ${currentTokenSymbol.value} (including fee)`, 'error');
          transferLoading.value = false;
          return;
        }
        
        addLog(`Sending ${transferAmount.value} ${currentTokenSymbol.value} to ${recipient.value}...`, 'info');
        
        // Send tokens using TokenStore service
        const result = await tokenStore.transferTokens(recipient.value.trim(), amountToSend, currentTokenSymbol.value);
        
        if (result && result.success) {
          addLog(`Successfully sent ${transferAmount.value} ${currentTokenSymbol.value}!`, 'success');
          
          // Update the balance after transfer
          await fetchTokenBalance(currentTokenSymbol.value);
          updateCurrentFormattedBalance();
          
          // Clear fields
          transferAmount.value = '';
          recipient.value = '';
          showSendForm.value = false;
        } else {
          addLog(`Transfer failed: ${result?.error || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        console.error('Error sending tokens:', error);
        addLog(`Error: ${error.message || 'Unknown error'}`, 'error');
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
    
    // Add log entry - make it more resilient to prevent infinite loops
    function addLog(message, type = 'info', silent = false) {
      if (silent) {
        // Just log to console but don't update UI state to prevent re-renders
        console.log(`[Wallet] ${message}`);
        return;
      }

      try {
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
        console.log(`[Wallet ${timeStr}] ${message}`);
      } catch (error) {
        // Fail silently to prevent UI errors
        console.error("Error adding log:", error);
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
    
    // Compute transfer fee for current token
    const currentTokenFee = computed(() => {
      if (!currentTokenSymbol.value) return '0';
      try {
        const metadata = getTokenMetadata(currentTokenSymbol.value);
        return formatBalance(metadata.fee, metadata.decimals);
      } catch (error) {
        console.error('Error calculating token fee:', error);
        return '0';
      }
    });
    
    // Format transaction fee for display
    const formattedTransactionFee = computed(() => {
      return `Transfer fee: ${currentTokenFee.value} ${currentTokenSymbol.value}`;
    });

    // Add a simple clearLogs function before the return statement
    function clearLogs() {
      logs.value = [];
      try {
        localStorage.setItem(WALLET_LOGS_KEY, JSON.stringify([]));
      } catch (e) {
        console.error('Error clearing logs:', e);
      }
    }

    // Return all the data and functions the template needs
    return {
      // Stores
      tokenStore,
      authStore,
      nftsStore,
      canisterStore,
      
      // State properties
      tokenBalances,
      supportedTokens,
      cachedTokens,
      currentTokenSymbol,
      currentFormattedBalance,
      recipient,
      transferAmount,
      errorMessage,
      successMessage,
      isSending,
      isLoggedIn,
      logs,
      nftCategories,
      selectedNft,
      selectedChest,
      chestRewards,
      isOpeningChest,
      openingStage,
      openingError,
      showTokenSelector,
      // UI state
      showSendForm,
      showAddToken,
      showReceive,
      showFullLog,
      principalMode,
      recipientType,
      balanceLoading,
      addTokenLoading,
      transferLoading,
      newTokenCanisterId,
      loadingPhases,
      activeCollection,
      showNFTSection,
      cachedIds,
      
      // Functions
      changeToken,
      getTokenIcon,
      getTokenMetadata,
      formatBalance,
      getTokenBalance,
      saveWalletDataToLocalStorage,
      fetchTokenBalance,
      loadTokenBalances,
      sendTokens,
      addLog,
      clearLogs,
      processRewards,
      openChest,
      closeChestDialog,
      copyAddress,
      getCategoryIcon,
      updateLoadingPhase,
      removeLoadingPhase,
      refreshAllBalancesInBackground,
      fetchUserNFTs,
      getRewardRarityClass,
      getRewardTypeIcon,
      revealReward,
      addCustomToken,
      isValidAccountId,
      isValidPrincipal,
      
      // Computed properties
      isValidCanisterId,
      isValidTransfer,
      currentTokenFee,
      formattedTransactionFee
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
  margin-bottom: 16px;
}

.token-symbol {
  font-size: 1.5rem;
  margin-left: 8px;
  opacity: 0.8;
}

/* Token selector */
.token-selector {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.token-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: var(--radius-medium);
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 80px;
  height: 80px;
}

.token-option:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
}

.token-option.active {
  background: rgba(15, 185, 253, 0.2);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  border: 1px solid rgba(15, 185, 253, 0.4);
}

.token-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.token-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.token-icon i {
  font-size: 24px;
  color: var(--color-primary);
}

.token-name {
  font-size: 0.8rem;
  text-align: center;
}

/* Wallet actions */
.wallet-actions {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--cosmic-panel-bg);
  border-radius: var(--radius-medium);
  margin-top: 16px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  flex: 1;
  margin: 0 8px;
  max-width: 120px;
  background: linear-gradient(to bottom, var(--color-primary), var(--color-primary-dark));
  border-radius: var(--radius-medium);
}

.action-button i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

/* Token overview panel */
.token-overview {
  padding: 16px;
  background: var(--cosmic-panel-bg);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.overview-header h3 {
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
  overflow: hidden;
}

.token-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
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

/* NFT Collection Styles - Copied from Profile.vue */
.content-section {
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  padding: var(--space-xl);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  margin-top: 16px;
}

.content-section h2 {
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
  font-size: var(--text-xl);
  text-shadow: var(--shadow-glow-primary);
  word-break: break-word;
}

.collection-tabs {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  box-sizing: border-box;
}

.collection-tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-tertiary);
  border-radius: var(--radius-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-slow);
  flex-shrink: 0;
}

.tab:hover {
  background: rgba(0, 217, 255, 0.1);
}

.tab.active {
  background: var(--gradient-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-primary);
}

.tab-icon {
  margin-right: 6px;
}

.loading-indicator {
  display: inline-block;
  animation: spin 2s infinite linear;
  margin-left: 6px;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-lg);
  width: 100%;
  box-sizing: border-box;
}

.empty-message {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-tertiary);
  font-style: italic;
  grid-column: 1 / -1;
}

.nft-card.skeleton {
  background: var(--color-surface-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.skeleton-image {
  aspect-ratio: 1;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-small);
  margin-bottom: var(--space-sm);
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-small);
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .nft-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .content-section {
    padding: var(--space-lg);
  }
  
  .nft-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  
  .tab {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
  }
}

@media (max-width: 480px) {
  .nft-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
  
  .content-section {
    padding: var(--space-md);
  }
}

/* NFT Card Wrapper for Open Chest Button */
.nft-card-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.chest-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-bottom-left-radius: var(--radius-medium);
  border-bottom-right-radius: var(--radius-medium);
}

.nft-card-wrapper:hover .chest-actions {
  opacity: 1;
}

.open-chest-btn {
  background: var(--gradient-accent);
  color: white;
  border: none;
  border-radius: var(--radius-medium);
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.open-chest-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.chest-icon {
  font-size: 1.2em;
}

/* Chest Opening Modal */
.chest-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chest-modal {
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30px;
  border: var(--border-thin);
  animation: modalAppear 0.4s ease forwards;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.chest-error {
  text-align: center;
  padding: 20px;
}

.chest-error h3 {
  color: var(--color-error);
  margin-bottom: 15px;
}

/* Chest Opening Animation */
.chest-opening-animation {
  text-align: center;
  padding: 20px;
}

.chest-opening-animation h3 {
  color: var(--color-primary);
  margin-bottom: 30px;
  animation: pulse 1.5s infinite alternate;
}

.chest-animation {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
}

.chest-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 217, 255, 0.5) 0%, rgba(255, 186, 0, 0.2) 50%, transparent 80%);
  animation: glow 2s infinite alternate;
  z-index: 1;
}

.chest-image {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
}

.pulse {
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
    filter: brightness(1);
  }
  to {
    transform: scale(1.05);
    filter: brightness(1.3);
  }
}

@keyframes glow {
  from {
    opacity: 0.5;
    transform: scale(0.9);
  }
  to {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  opacity: 0;
}

.particles-container .particle:nth-child(odd) {
  background: gold;
}

.particles-container .particle:nth-child(3n) {
  background: white;
}

.particles-container .particle:nth-child(1) { animation: particle1 2s infinite; }
.particles-container .particle:nth-child(2) { animation: particle2 2.2s infinite; }
.particles-container .particle:nth-child(3) { animation: particle3 1.8s infinite; }
.particles-container .particle:nth-child(4) { animation: particle4 2.5s infinite; }
.particles-container .particle:nth-child(5) { animation: particle5 1.9s infinite; }
.particles-container .particle:nth-child(6) { animation: particle6 2.3s infinite; }
.particles-container .particle:nth-child(7) { animation: particle7 2.1s infinite; }
.particles-container .particle:nth-child(8) { animation: particle8 1.7s infinite; }
.particles-container .particle:nth-child(9) { animation: particle9 2.4s infinite; }
.particles-container .particle:nth-child(10) { animation: particle10 2.6s infinite; }

@keyframes particle1 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-50px, -50px); opacity: 0; }
}

@keyframes particle2 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(50px, -60px); opacity: 0; }
}

@keyframes particle3 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(30px, 70px); opacity: 0; }
}

@keyframes particle4 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-40px, 60px); opacity: 0; }
}

@keyframes particle5 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-70px, 0px); opacity: 0; }
}

@keyframes particle6 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(70px, 10px); opacity: 0; }
}

@keyframes particle7 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(0px, -80px); opacity: 0; }
}

@keyframes particle8 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(0px, 80px); opacity: 0; }
}

@keyframes particle9 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(-60px, 30px); opacity: 0; }
}

@keyframes particle10 {
  0% { transform: translate(0, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate(60px, -30px); opacity: 0; }
}

/* Rewards Display */
.chest-rewards {
  text-align: center;
}

.chest-rewards h3 {
  color: var(--color-primary);
  margin-bottom: 20px;
  text-shadow: 0 0 10px var(--color-primary);
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.reward-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-medium);
  opacity: 0;
  transform: translateY(20px);
  border-left: 4px solid transparent;
}

.reward-item.revealed {
  animation: revealReward 0.5s forwards;
}

@keyframes revealReward {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reward-icon {
  font-size: 2em;
  margin-right: 15px;
  background: rgba(0, 0, 0, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stardust token special styling */
.stardust-icon {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(200, 150, 255, 0.3));
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.cosmic-star {
  font-size: 1.5em;
  color: gold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  animation: starPulse 2s infinite alternate;
}

@keyframes starPulse {
  from {
    transform: scale(1);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }
  to {
    transform: scale(1.2);
    text-shadow: 0 0 20px rgba(255, 215, 0, 1);
  }
}

.reward-details {
  flex: 1;
  text-align: left;
}

.reward-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.reward-type {
  font-size: 0.9em;
  color: var(--color-text-tertiary);
  text-transform: capitalize;
}

.reward-quantity {
  font-weight: 600;
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 10px;
  border-radius: var(--radius-medium);
}

.close-rewards {
  padding: 12px 30px;
  margin-top: 20px;
}

.no-rewards {
  padding: 30px;
  color: var(--color-text-tertiary);
  font-style: italic;
}

/* Reward rarity colors */
.reward-item.common {
  border-left-color: #9e9e9e;
}

.reward-item.uncommon {
  border-left-color: #4caf50;
}

.reward-item.rare {
  border-left-color: #2196f3;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
}

.reward-item.epic {
  border-left-color: #9c27b0;
  box-shadow: 0 0 15px rgba(156, 39, 176, 0.4);
}

.reward-item.legendary {
  border-left-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
  animation: legendaryGlow 2s infinite alternate !important;
}

@keyframes legendaryGlow {
  0% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
  }
  100% {
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.8);
  }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .chest-modal {
    width: 95%;
    padding: 20px;
  }
  
  .chest-animation {
    width: 150px;
    height: 150px;
  }
  
  .reward-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5em;
  }
}

@media (max-width: 480px) {
  .chest-modal {
    padding: 15px;
  }
  
  .reward-item {
    padding: 10px;
  }
  
  .reward-icon {
    width: 35px;
    height: 35px;
    font-size: 1.2em;
    margin-right: 10px;
  }
  
  .reward-name {
    font-size: 0.9em;
  }
  
  .reward-type {
    font-size: 0.8em;
  }
}

/* Main Token Grid */
.token-grid {
  padding: 24px;
  background: var(--cosmic-panel-bg);
  border-radius: var(--radius-medium);
}

.token-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.token-grid-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.token-grid-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.token-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-medium);
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.token-card:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.token-card.active {
  background: rgba(15, 185, 253, 0.15);
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.2);
}

.token-icon-container {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.cosmic-container {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(200, 150, 255, 0.2));
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.cosmic-icon {
  color: gold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
  font-size: 1.5rem;
}

.token-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

.token-details {
  flex: 1;
}

.token-symbol-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: var(--color-text-primary);
}

.token-balance {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
</style> 