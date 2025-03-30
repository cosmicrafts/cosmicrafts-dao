<!-- Marketplace.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMarketplaceStore } from '@/stores/marketplace';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import { useModalStore } from '@/stores/modal';
import Login from '@/components/user/LoginForm.vue';
import { storeToRefs } from 'pinia';
import CosmicButton from '@/components/ui/buttons/BaseButton.vue';
import CosmicCard from '@/components/ui/cards/BaseCard.vue';
import NFTCard from '@/components/ui/cards/NFTCard.vue';

const { t } = useI18n();
const marketplaceStore = useMarketplaceStore();
const authStore = useAuthStore();
const modalStore = useModalStore();

// State management
const activeTab = ref('explore');
const showCreateAskModal = ref(false);
const showAskDetailsModal = ref(false);
const showConnectWalletModal = ref(false);

// Form data for creating a new ask
const newAsk = ref({
  collectionId: '',
  tokenId: '',
  price: null,
  loading: false,
  error: null
});

// Add user token balance display
const userBalance = computed(() => marketplaceStore.formattedTokenBalance);

// Ask details modal data
const selectedAskId = ref(null);
const selectedAskDetails = ref(null);

// Add success notifications
const showSuccessNotification = ref(false);
const successMessage = ref('');

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated());
const activeAsks = computed(() => marketplaceStore.activeAsks || []);
const userAsks = computed(() => marketplaceStore.userAsks || []);
const marketStats = computed(() => marketplaceStore.marketStats);
const loading = computed(() => marketplaceStore.loading);
const error = computed(() => marketplaceStore.error);

// Initialize marketplace on component mount
onMounted(async () => {
  await marketplaceStore.initialize();
  if (isAuthenticated.value) {
    await marketplaceStore.getUserAsks();
  }
});

// Helper methods
const formatPrice = (price) => {
  if (!price) return '0';
  return (Number(price) / 100_000_000).toFixed(8);
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return new Date(Number(timestamp) / 1_000_000).toLocaleString();
};

const getAskStatus = (status) => {
  if (!status) return 'unknown';
  
  // Handle various status types from ICRC-8
  if (typeof status === 'object') {
    if ('open' in status) return 'open';
    if ('closed' in status) return 'closed';
    if ('encumbered' in status) return 'encumbered';
    if ('not_started' in status) return 'not started';
  }
  
  return String(status);
};

// Action handlers
const handleTabChange = (tab) => {
  activeTab.value = tab;
  
  if (tab === 'myasks' && isAuthenticated.value) {
    marketplaceStore.getUserAsks();
  }
  
  if (tab === 'mynfts' && isAuthenticated.value) {
    marketplaceStore.fetchUserNFTs();
  }
};

// Function to handle creating listing directly from an NFT
const openCreateListingForNFT = (nft) => {
  if (!isAuthenticated.value) {
    showConnectWalletModal.value = true;
    return;
  }
  
  // Pre-fill the create listing form with the NFT details
  newAsk.value = {
    collectionId: nft.collectionId,
    tokenId: nft.tokenId,
    price: null,
    loading: false,
    error: null
  };
  
  // Open the create listing modal
  showCreateAskModal.value = true;
};

const displaySuccess = (message) => {
  successMessage.value = message;
  showSuccessNotification.value = true;
  setTimeout(() => {
    showSuccessNotification.value = false;
  }, 3000); // Hide after 3 seconds
};

const handleCreateAsk = async () => {
  if (!isAuthenticated.value) {
    showConnectWalletModal.value = true;
    return;
  }
  
  if (!newAsk.value.collectionId || !newAsk.value.tokenId || !newAsk.value.price) {
    newAsk.value.error = t('marketplace.validation.all_fields_required');
    return;
  }
  
  newAsk.value.loading = true;
  newAsk.value.error = null;
  
  try {
    const price = Math.floor(parseFloat(newAsk.value.price) * 100_000_000); // Convert to ICP base units (e8s)
    const result = await marketplaceStore.createNFTAsk(
      newAsk.value.collectionId,
      parseInt(newAsk.value.tokenId),
      price
    );
    
    if (result.success) {
      showCreateAskModal.value = false;
      newAsk.value = {
        collectionId: '',
        tokenId: '',
        price: null,
        loading: false,
        error: null
      };
      
      // Show success notification
      displaySuccess(t('marketplace.success.ask_created'));
      
      // Refresh the active asks
      await marketplaceStore.initialize();
    } else {
      newAsk.value.error = result.error;
    }
  } catch (error) {
    newAsk.value.error = error.message || t('marketplace.error.create_ask_failed');
  } finally {
    newAsk.value.loading = false;
  }
};

const handleBuyNFT = async (askId) => {
  if (!isAuthenticated.value) {
    showConnectWalletModal.value = true;
    return;
  }
  
  try {
    const result = await marketplaceStore.buyNFT(askId);
    
    if (result.success) {
      // Show success notification
      displaySuccess(t('marketplace.success.purchase_complete'));
      
      // Close modal if open
      if (showAskDetailsModal.value) {
        showAskDetailsModal.value = false;
      }
    }
  } catch (error) {
    console.error('Purchase failed:', error);
  }
};

const handleViewAskDetails = async (askId) => {
  selectedAskId.value = askId;
  selectedAskDetails.value = null;
  
  try {
    const details = await marketplaceStore.getAskDetails(askId);
    if (details) {
      selectedAskDetails.value = details;
      showAskDetailsModal.value = true;
    }
  } catch (error) {
    console.error('Failed to fetch ask details:', error);
  }
};

const connectWallet = async () => {
  showConnectWalletModal.value = false;
  modalStore.openModal(Login);
};

// Extract ask details like price, token specs, etc.
const getAskTokenDetails = (ask) => {
  if (!ask || !ask.config) return { price: 0, collectionId: '', tokenId: '' };
  
  let price = 0;
  let collectionId = '';
  let tokenId = '';
  
  // Process the config array to extract details
  for (const feature of ask.config) {
    if (feature && typeof feature === 'object') {
      // Extract buy_now price
      if ('buy_now' in feature && feature.buy_now.length > 0) {
        const buyNowOptions = feature.buy_now[0];
        if (buyNowOptions && buyNowOptions.length > 0) {
          const firstOption = buyNowOptions[0];
          if (firstOption && 'amount' in firstOption) {
            price = firstOption.amount;
          }
        }
      }
      
      // Extract token details
      if ('ask_token' in feature && feature.ask_token.length > 0) {
        const tokenSpec = feature.ask_token[0];
        if (tokenSpec) {
          collectionId = tokenSpec.canister ? tokenSpec.canister.toString() : '';
          
          // Extract token ID from standards array
          if (tokenSpec.standards && tokenSpec.standards.length > 0) {
            for (const standard of tokenSpec.standards) {
              if (standard && 'ICRC7' in standard) {
                const icrc7Details = standard.ICRC7;
                if (icrc7Details && 'token_id' in icrc7Details) {
                  tokenId = icrc7Details.token_id;
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
  
  return { price, collectionId, tokenId };
};

// Add the refreshUserData function to the script section
const refreshUserData = async () => {
  if (!isAuthenticated.value) return;
  
  try {
    await Promise.all([
      marketplaceStore.fetchUserNFTs(),
      marketplaceStore.fetchUserTokenBalance()
    ]);
    
    // Show success message
    displaySuccess(t('marketplace.success.data_refreshed'));
  } catch (error) {
    console.error('Failed to refresh user data:', error);
  }
};
</script>

<template>
  <div class="marketplace-container">
    <div class="marketplace-header">
      <h1>{{ t('marketplace.title') }}</h1>
      <p>{{ t('marketplace.subtitle') }}</p>
    </div>
    
    <!-- Marketplace Stats -->
    <div v-if="marketStats" class="marketplace-stats">
      <div class="stat-item">
        <span class="stat-label">{{ t('marketplace.stats.active_asks') }}</span>
        <span class="stat-value">{{ marketStats.active_asks }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ t('marketplace.stats.total_asks') }}</span>
        <span class="stat-value">{{ marketStats.total_asks }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ t('marketplace.stats.fee') }}</span>
        <span class="stat-value">{{ Number(marketStats.fee_percentage) / 100 }}%</span>
      </div>
      <!-- Add user balance display -->
      <div v-if="isAuthenticated" class="stat-item user-balance">
        <span class="stat-label">{{ t('marketplace.stats.your_balance') }}</span>
        <span class="stat-value">{{ userBalance }} ICP</span>
      </div>
    </div>
    
    <!-- Navigation tabs -->
    <div class="marketplace-tabs">
      <button 
        :class="['tab-btn', activeTab === 'explore' ? 'active' : '']"
        @click="handleTabChange('explore')"
      >
        {{ t('marketplace.tabs.explore') }}
      </button>
      <button 
        :class="['tab-btn', activeTab === 'myasks' ? 'active' : '']"
        @click="handleTabChange('myasks')"
      >
        {{ t('marketplace.tabs.my_asks') }}
      </button>
      <button 
        :class="['tab-btn', activeTab === 'mynfts' ? 'active' : '']"
        @click="handleTabChange('mynfts')"
      >
        {{ t('marketplace.tabs.my_nfts') }}
      </button>
      <button 
        class="create-ask-btn"
        @click="showCreateAskModal = true"
      >
        {{ t('marketplace.create_ask') }}
      </button>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading && !error" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ t('marketplace.loading') }}</p>
    </div>
    
    <!-- Error state -->
    <div v-if="error" class="error-container">
      <p>{{ error }}</p>
      <CosmicButton @click="marketplaceStore.clearError(); marketplaceStore.initialize()">
        {{ t('marketplace.retry') }}
      </CosmicButton>
    </div>
    
    <!-- Content based on active tab -->
    <div v-if="!loading && !error" class="marketplace-content">
      <!-- Explore tab - show all active asks -->
      <div v-if="activeTab === 'explore'" class="asks-grid">
        <CosmicCard 
          v-for="ask in activeAsks" 
          :key="ask.ask_id" 
          class="ask-card"
        >
          <template #header>
            <div class="ask-header">
              <h3>NFT #{{ getAskTokenDetails(ask).tokenId }}</h3>
              <span class="ask-status" :class="getAskStatus(ask.status)">
                {{ getAskStatus(ask.status) }}
              </span>
            </div>
          </template>
          
          <div class="ask-details">
            <p class="ask-price">
              <strong>{{ t('marketplace.price') }}:</strong>
              {{ formatPrice(getAskTokenDetails(ask).price) }} ICP
            </p>
            <p>
              <strong>{{ t('marketplace.collection') }}:</strong>
              {{ getAskTokenDetails(ask).collectionId }}
            </p>
            <p>
              <strong>{{ t('marketplace.seller') }}:</strong>
              {{ ask.seller?.owner.toString().slice(0, 10) }}...
            </p>
          </div>
          
          <template #footer>
            <div class="ask-actions">
              <CosmicButton 
                v-if="getAskStatus(ask.status) === 'open'"
                @click="handleBuyNFT(ask.ask_id)"
                :loading="loading"
              >
                {{ t('marketplace.buy_now') }}
              </CosmicButton>
              <CosmicButton 
                variant="secondary"
                @click="handleViewAskDetails(ask.ask_id)"
              >
                {{ t('marketplace.view_details') }}
              </CosmicButton>
            </div>
          </template>
        </CosmicCard>
        
        <div v-if="activeAsks.length === 0" class="no-results">
          <p>{{ t('marketplace.no_asks_found') }}</p>
        </div>
      </div>
      
      <!-- My Asks tab - show user's asks -->
      <div v-if="activeTab === 'myasks'" class="asks-grid">
        <template v-if="isAuthenticated">
          <CosmicCard 
            v-for="ask in userAsks" 
            :key="ask.ask_id" 
            class="ask-card"
          >
            <template #header>
              <div class="ask-header">
                <h3>NFT #{{ getAskTokenDetails(ask).tokenId }}</h3>
                <span class="ask-status" :class="getAskStatus(ask.status)">
                  {{ getAskStatus(ask.status) }}
                </span>
              </div>
            </template>
            
            <div class="ask-details">
              <p class="ask-price">
                <strong>{{ t('marketplace.price') }}:</strong>
                {{ formatPrice(getAskTokenDetails(ask).price) }} ICP
              </p>
              <p>
                <strong>{{ t('marketplace.collection') }}:</strong>
                {{ getAskTokenDetails(ask).collectionId }}
              </p>
              <p v-if="ask.settled_at">
                <strong>{{ t('marketplace.settled_at') }}:</strong>
                {{ formatTimestamp(ask.settled_at) }}
              </p>
            </div>
            
            <template #footer>
              <div class="ask-actions">
                <CosmicButton 
                  variant="secondary"
                  @click="handleViewAskDetails(ask.ask_id)"
                >
                  {{ t('marketplace.view_details') }}
                </CosmicButton>
              </div>
            </template>
          </CosmicCard>
          
          <div v-if="userAsks.length === 0" class="no-results">
            <p>{{ t('marketplace.no_asks_found') }}</p>
            <CosmicButton @click="showCreateAskModal = true">
              {{ t('marketplace.create_first_ask') }}
            </CosmicButton>
          </div>
        </template>
        
        <div v-else class="not-authenticated">
          <p>{{ t('marketplace.login_to_view_asks') }}</p>
          <CosmicButton @click="showConnectWalletModal = true">
            {{ t('marketplace.connect_wallet') }}
          </CosmicButton>
        </div>
      </div>
      
      <!-- My NFTs tab - show user's NFTs -->
      <div v-if="activeTab === 'mynfts'" class="asks-grid">
        <template v-if="isAuthenticated">
          <div class="mynfts-header">
            <h2>{{ t('marketplace.my_nfts_title') }}</h2>
            <CosmicButton 
              variant="secondary"
              @click="refreshUserData"
              :loading="marketplaceStore.loadingNFTs"
              size="small"
            >
              {{ t('marketplace.refresh') }}
            </CosmicButton>
          </div>
          
          <div v-if="marketplaceStore.loadingNFTs" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ t('marketplace.loading_nfts') }}</p>
          </div>
          
          <CosmicCard 
            v-for="nft in marketplaceStore.userNFTs" 
            :key="`${nft.collectionId}-${nft.tokenId}`" 
            class="nft-card"
          >
            <template #header>
              <div class="nft-header">
                <h3>{{ nft.collectionSymbol }} #{{ nft.tokenId }}</h3>
              </div>
            </template>
            
            <div class="nft-details">
              <p>
                <strong>{{ t('marketplace.collection') }}:</strong>
                {{ nft.collectionName }}
              </p>
              <p>
                <strong>{{ t('marketplace.token_id') }}:</strong>
                {{ nft.tokenId }}
              </p>
              <p v-if="nft.metadata && nft.metadata.name">
                <strong>{{ t('marketplace.nft_name') }}:</strong>
                {{ nft.metadata.name }}
              </p>
            </div>
            
            <template #footer>
              <div class="nft-actions">
                <CosmicButton
                  @click="openCreateListingForNFT(nft)"
                >
                  {{ t('marketplace.list_for_sale') }}
                </CosmicButton>
              </div>
            </template>
          </CosmicCard>
          
          <div v-if="marketplaceStore.userNFTs.length === 0 && !marketplaceStore.loadingNFTs" class="no-results">
            <p>{{ t('marketplace.no_nfts_found') }}</p>
          </div>
        </template>
        
        <div v-else class="not-authenticated">
          <p>{{ t('marketplace.login_to_view_nfts') }}</p>
          <CosmicButton @click="showConnectWalletModal = true">
            {{ t('marketplace.connect_wallet') }}
          </CosmicButton>
        </div>
      </div>
    </div>
    
    <!-- Create Ask Modal -->
    <div v-if="showCreateAskModal" class="modal-overlay" @click="showCreateAskModal = false">
      <div class="modal-content" @click.stop>
        <h2>{{ t('marketplace.create_new_ask') }}</h2>
        
        <div v-if="newAsk.error" class="modal-error">
          {{ newAsk.error }}
        </div>
        
        <form @submit.prevent="handleCreateAsk" class="create-ask-form">
          <div class="form-group">
            <label for="collectionId">{{ t('marketplace.collection_id') }}</label>
            <input 
              id="collectionId"
              v-model="newAsk.collectionId"
              :placeholder="t('marketplace.enter_collection_id')"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="tokenId">{{ t('marketplace.token_id') }}</label>
            <input 
              id="tokenId"
              v-model="newAsk.tokenId"
              type="number"
              :placeholder="t('marketplace.enter_token_id')"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="price">{{ t('marketplace.price_icp') }}</label>
            <input 
              id="price"
              v-model="newAsk.price"
              type="number"
              step="0.00000001"
              min="0"
              :placeholder="t('marketplace.enter_price')"
              required
            />
          </div>
          
          <div class="modal-actions">
            <CosmicButton
              type="button"
              variant="secondary"
              @click="showCreateAskModal = false"
            >
              {{ t('common.cancel') }}
            </CosmicButton>
            
            <CosmicButton
              type="submit"
              :loading="newAsk.loading"
            >
              {{ t('marketplace.create_ask') }}
            </CosmicButton>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Ask Details Modal -->
    <div v-if="showAskDetailsModal" class="modal-overlay" @click="showAskDetailsModal = false">
      <div class="modal-content" @click.stop>
        <h2>{{ t('marketplace.ask_details') }}</h2>
        
        <div v-if="selectedAskDetails" class="ask-details-container">
          <div class="detail-row">
            <span class="detail-label">{{ t('marketplace.ask_id') }}:</span>
            <span class="detail-value">{{ selectedAskDetails.ask_id }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">{{ t('marketplace.status') }}:</span>
            <span class="detail-value">{{ getAskStatus(selectedAskDetails.status) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">{{ t('marketplace.seller') }}:</span>
            <span class="detail-value">{{ selectedAskDetails.seller?.owner.toString() }}</span>
          </div>
          
          <div v-if="selectedAskDetails.settled_at" class="detail-row">
            <span class="detail-label">{{ t('marketplace.settled_at') }}:</span>
            <span class="detail-value">{{ formatTimestamp(selectedAskDetails.settled_at) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">{{ t('marketplace.token_details') }}:</span>
            <div class="token-details">
              <p>
                <strong>{{ t('marketplace.collection') }}:</strong>
                {{ getAskTokenDetails(selectedAskDetails).collectionId }}
              </p>
              <p>
                <strong>{{ t('marketplace.token_id') }}:</strong>
                {{ String(getAskTokenDetails(selectedAskDetails).tokenId) }}
              </p>
              <p>
                <strong>{{ t('marketplace.price') }}:</strong>
                {{ formatPrice(getAskTokenDetails(selectedAskDetails).price) }} ICP
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ t('marketplace.loading_details') }}</p>
        </div>
        
        <div class="modal-actions">
          <CosmicButton
            variant="secondary"
            @click="showAskDetailsModal = false"
          >
            {{ t('common.close') }}
          </CosmicButton>
          
          <CosmicButton
            v-if="selectedAskDetails && getAskStatus(selectedAskDetails.status) === 'open'"
            @click="handleBuyNFT(selectedAskDetails.ask_id); showAskDetailsModal = false"
          >
            {{ t('marketplace.buy_now') }}
          </CosmicButton>
        </div>
      </div>
    </div>
    
    <!-- Connect Wallet Modal -->
    <div v-if="showConnectWalletModal" class="modal-overlay" @click="showConnectWalletModal = false">
      <div class="modal-content" @click.stop>
        <h2>{{ t('marketplace.connect_wallet') }}</h2>
        <p>{{ t('marketplace.login_required') }}</p>
        
        <div class="modal-actions">
          <CosmicButton
            variant="secondary"
            @click="showConnectWalletModal = false"
          >
            {{ t('common.cancel') }}
          </CosmicButton>
          
          <CosmicButton
            @click="connectWallet"
          >
            {{ t('marketplace.connect') }}
          </CosmicButton>
        </div>
      </div>
    </div>
    
    <!-- Add success notification to the template -->
    <div v-if="showSuccessNotification" class="success-notification">
      {{ successMessage }}
    </div>
  </div>
</template>

<style scoped>
.marketplace-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.marketplace-header {
  text-align: center;
  margin-bottom: 2rem;
}

.marketplace-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.marketplace-header p {
  font-size: 1.2rem;
  opacity: 0.8;
}

.marketplace-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 10px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.marketplace-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 2rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  transition: all 0.3s;
}

.tab-btn.active {
  color: white;
  border-bottom: 2px solid #05a3cc;
}

.create-ask-btn {
  margin-left: auto;
  background: #05a3cc;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-ask-btn:hover {
  background: #0481a1;
}

.loading-container, .error-container, .no-results, .not-authenticated {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #05a3cc;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.asks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ask-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ask-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.ask-status.open {
  background: #4caf50;
  color: white;
}

.ask-status.closed {
  background: #f44336;
  color: white;
}

.ask-status.encumbered {
  background: #ff9800;
  color: white;
}

.ask-details {
  flex-grow: 1;
  padding: 1rem 0;
}

.ask-price {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.ask-actions {
  display: flex;
  gap: 0.5rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-error {
  color: #f44336;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 5px;
}

.create-ask-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-size: 0.9rem;
  opacity: 0.7;
}

.form-group input {
  padding: 0.8rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.ask-details-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 40% 60%;
  align-items: start;
}

.detail-label {
  font-weight: bold;
  opacity: 0.7;
}

.token-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .marketplace-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .marketplace-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn, .create-ask-btn {
    flex: 1;
    text-align: center;
    padding: 0.8rem 0.5rem;
  }
  
  .create-ask-btn {
    order: -1;
    width: 100%;
    margin: 0 0 1rem 0;
  }
  
  .asks-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }
}

/* Add this new style */
.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

/* Add styles for the mynfts-header */
.mynfts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mynfts-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.nft-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out;
  overflow: hidden;
}

.nft-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(5, 163, 204, 0.4);
}

.nft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nft-details {
  flex-grow: 1;
  padding: 1rem 0;
}

.nft-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

.user-balance {
  background-color: rgba(76, 175, 80, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
  border-left: 3px solid #4caf50;
}
</style> 