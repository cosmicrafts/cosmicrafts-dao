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

      <!-- NFT Collection -->
      <NFTCollection
        v-if="showNFTSection"
        :categories="nftCategories"
        v-model="activeCollection"
        @open-chest="openChest"
      />
      
      <!-- Chest Opening Modal -->
      <ChestOpeningModal
        :is-visible="isOpeningChest"
        :chest="selectedChest"
        :rewards="chestRewards"
        :stage="openingStage"
        :error="openingError"
        @close="closeChestDialog"
        @reveal-reward="revealReward"
      />

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
import { useNftsStore } from '../stores/nfts.js';
import { useCanisterStore } from '../stores/canister.js';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

// Import components with updated paths
import WalletHeader from '../components/layout/WalletHeader.vue';
import TokenGrid from '../components/collections/TokenGrid.vue';
import WalletActions from '../components/actions/WalletActions.vue';
import ActivityLog from '../components/feedback/ActivityLog.vue';
import LoadingIndicator from '../components/feedback/LoadingIndicator.vue';
import NFTCollection from '../components/collections/NFTCollection.vue';
import ChestOpeningModal from '../components/modals/ChestOpeningModal.vue';
import SendTokenForm from '../components/forms/SendTokenForm.vue';
import ReceiveTokenInfo from '../components/forms/ReceiveTokenInfo.vue';
import AddTokenForm from '../components/forms/AddTokenForm.vue';

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
    LoadingIndicator,
    NFTCollection,
    ChestOpeningModal
  },
  setup() {
    // Get stores
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    const nftsStore = useNftsStore();
    const canisterStore = useCanisterStore();

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
          addLog(`Error initializing wallet: ${error.message}`, 'error');
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
    
    // Fetch NFTs for the current user
    async function fetchUserNFTs() {
      try {
        if (!authStore.isAuthenticated()) {
          console.log("User not authenticated, skipping NFT fetch");
          return;
        }
        
        loading.value = true;
        loadingMessage.value = 'Loading NFTs...';
        addLog('Fetching your NFT collection...', 'info');
        
        // Get the user's principal
        const identity = authStore.getIdentity();
        if (!identity) {
          throw new Error("Identity not available");
        }
        
        const principal = identity.getPrincipal();
        
        // Get cosmicrafts canister
        const cosmicrafts = await canisterStore.get("cosmicrafts");
        if (!cosmicrafts) {
          throw new Error("Cosmicrafts canister not initialized");
        }
        
        // Mark all categories as loading
        nftCategories.value.forEach(category => {
          category.isLoading = true;
        });
        
        // Fetch NFTs from canister
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
        
        loading.value = false;
      }
    }
    
    // Process NFTs
    function processNFTs(nfts) {
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
            
            // Refresh both token balances
            await refreshTokenBalance('STDs');
            await refreshTokenBalance('ICP');
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
      
      // Methods
      handleAction,
      handleCopy,
      handleTransferComplete,
      handleTokenAdded,
      updateBalances,
      getTokenBalance,
      addLog,
      openChest,
      closeChestDialog,
      revealReward
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