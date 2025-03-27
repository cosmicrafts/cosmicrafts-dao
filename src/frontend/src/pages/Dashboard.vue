<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="loading" class="cosmic-loader-container">
      <div class="cosmic-loader"></div>
      <p>Loading your universe...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Header Section with User Information -->
      <div class="dashboard-header cosmic-panel">
        <div class="user-profile">
          <div class="avatar-wrapper">
            <div class="avatar-container">
              <img :src="avatarUrl" :alt="player?.username || 'User'" class="user-avatar" />
              <div class="level-badge">{{ player?.level || 1 }}</div>
            </div>
          </div>
          <div class="user-info">
            <h1 class="cosmic-title">{{ player?.username || 'Cosmic Explorer' }}</h1>
            <p class="user-title">{{ player?.title || 'Recruit' }}</p>
            <div class="principal-id">
              <span class="principal-label">Principal ID:</span>
              <span class="principal-value">{{ truncatedPrincipal }}</span>
              <button @click="copyPrincipal" class="copy-btn" :class="{ 'copied': copySuccess }">
                <i class="fas" :class="copySuccess ? 'fa-check' : 'fa-copy'"></i>
              </button>
            </div>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ player?.level || 1 }}</span>
              <span class="stat-label">Level</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ player?.friends?.length || 0 }}</span>
              <span class="stat-label">Friends</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ totalNFTs }}</span>
              <span class="stat-label">NFTs</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Tabs -->
        <div class="dashboard-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button" 
            :class="{ active: activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Main Dashboard Sections -->
      <div class="dashboard-grid" :class="{ 'full-width': activeTab !== 'overview' }">
        <!-- Left column - Wallet and Activity -->
        <div class="dashboard-column">
          <!-- Wallet Section -->
          <section class="dashboard-section token-wallet cosmic-panel" v-if="activeTab === 'overview'">
            <div class="section-header">
              <h2>Cosmic Wallet</h2>
              <div class="actions">
                <button @click="refreshTokens" class="cosmic-button-sm cosmic-button-outline-primary">
                  <i class="fas fa-sync-alt"></i>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div class="token-summary">
              <div class="total-value">
                <span class="value-label">Total Value</span>
                <span class="value-amount">${{ totalTokenValue.toFixed(2) }} USD</span>
              </div>
            </div>

            <div class="token-list">
              <TokenCard 
                v-for="token in visibleTokens" 
                :key="token.symbol" 
                :symbol="token.symbol" 
                @balance-updated="handleBalanceUpdate"
                @action="handleTokenAction"
              />
            </div>

            <div class="section-footer">
              <button @click="navigateTo('/wallet')" class="cosmic-button cosmic-button-primary">
                <span class="button-text">Open Wallet</span>
              </button>
            </div>
          </section>

          <!-- Referrals Section (Tab) -->
          <section v-if="activeTab === 'referrals'" class="dashboard-section referrals-section">
            <ReferralsSection />
          </section>
          
          <!-- Activity Section -->
          <section class="dashboard-section activity-feed cosmic-panel" v-if="activeTab === 'overview'">
            <div class="section-header">
              <h2>Recent Activity</h2>
            </div>
              
            <div class="activity-list">
              <div v-if="activities.length === 0" class="empty-activity">
                <i class="fas fa-history"></i>
                <p>No recent activity to display</p>
              </div>

              <div v-else v-for="(activity, index) in activities" :key="index" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-text">{{ activity.text }}</div>
                  <div class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Missions Section (Tab) -->
          <section v-if="activeTab === 'missions'" class="dashboard-section missions-section">
            <MissionsSection />
          </section>

          <!-- Achievements Section (Tab) -->
          <section v-if="activeTab === 'achievements'" class="dashboard-section achievements-section">
            <AchievementsSection />
          </section>
          
          <!-- Stats Section (Tab) -->
          <section v-if="activeTab === 'stats'" class="dashboard-section stats-section">
            <StatsSection />
          </section>
        </div>

        <!-- Right column - NFTs and Quick Actions (only in overview) -->
        <div class="dashboard-column" v-if="activeTab === 'overview'">
          <!-- NFT Collection Section -->
          <section class="dashboard-section nft-collection cosmic-panel">
            <div class="section-header">
              <h2>NFT Collection</h2>
              <div class="actions">
                <div class="category-filter">
                  <button 
                    v-for="category in nftCategories" 
                    :key="category"
                    @click="currentNftCategory = category"
                    :class="['filter-button', { active: currentNftCategory === category }]"
                  >
                    {{ formatCategory(category) }}
                  </button>
                </div>
              </div>
            </div>

            <div class="nft-grid">
              <div v-if="loadingNFTs" class="loading-nfts">
                <div class="cosmic-loader small"></div>
                <p>Loading NFTs...</p>
              </div>

              <template v-else-if="currentCategoryNFTs.length > 0">
                <NFTCard 
                  v-for="nft in currentCategoryNFTs.slice(0, 4)" 
                  :key="nft.id" 
                  :nft="nft"
                  @click="showNFTDetails(nft)"
                />
              </template>
              
              <div v-else class="empty-collection">
                <i class="fas fa-cubes"></i>
                <p>No {{ formatCategory(currentNftCategory) }} found in your collection</p>
              </div>
            </div>

            <div class="section-footer">
              <button @click="navigateTo('/collection')" class="cosmic-button cosmic-button-primary">
                <span class="button-text">View All NFTs</span>
              </button>
            </div>
          </section>

          <!-- Quick Actions Section -->
          <section class="dashboard-section quick-actions cosmic-panel">
            <div class="section-header">
              <h2>Quick Actions</h2>
            </div>

            <div class="actions-grid">
              <button @click="navigateTo('/wallet/send')" class="action-card">
                <i class="fas fa-paper-plane"></i>
                <span>Send Tokens</span>
              </button>
              <button @click="navigateTo('/wallet/receive')" class="action-card">
                <i class="fas fa-qrcode"></i>
                <span>Receive</span>
              </button>
              <button @click="navigateTo('/marketplace')" class="action-card">
                <i class="fas fa-store"></i>
                <span>Marketplace</span>
              </button>
              <button @click="navigateTo('/games')" class="action-card">
                <i class="fas fa-gamepad"></i>
                <span>Play Games</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import { useNftsStore } from '@/stores/nfts';
import TokenCard from '@/components/tokens/TokenCard.vue';
import NFTCard from '@/components/ui/cards/NFTCard.vue';
import ReferralsSection from '@/components/referrals/ReferralsSection.vue';
import MissionsSection from '@/components/missions/MissionsSection.vue';
import AchievementsSection from '@/components/achievements';
import StatsSection from '@/components/stats';

// Router
const router = useRouter();

// Stores
const authStore = useAuthStore();
const tokenStore = useTokenStore();
const nftsStore = useNftsStore();

// State
const loading = ref(true);
const player = ref(null);
const loadingNFTs = ref(false);
const currentNftCategory = ref('characters');
const activities = ref([]);
const copySuccess = ref(false);
const activeTab = ref('overview');

// Tab options
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-columns' },
  { id: 'referrals', label: 'Referrals', icon: 'fas fa-users' },
  { id: 'missions', label: 'Missions', icon: 'fas fa-tasks' },
  { id: 'achievements', label: 'Achievements', icon: 'fas fa-trophy' },
  { id: 'stats', label: 'Stats', icon: 'fas fa-chart-bar' }
];

// Avatar
const avatarUrl = computed(() => {
  if (player.value?.avatar) {
    return `/assets/avatars/avatar-${player.value.avatar}.webp`;
  }
  return '/assets/avatars/avatar-default.webp';
});

// Principal ID
const truncatedPrincipal = computed(() => {
  const principal = authStore.getIdentity()?.getPrincipal().toString() || '';
  if (principal.length > 12) {
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  }
  return principal;
});

// NFT Categories
const nftCategories = ['characters', 'units', 'avatars', 'trophies', 'chests'];

// Total NFTs
const totalNFTs = computed(() => {
  return Object.values(nftsStore.nftsByCategory).reduce((total, category) => {
    return total + (category?.length || 0);
  }, 0);
});

// Current Category NFTs
const currentCategoryNFTs = computed(() => {
  return nftsStore.getCategoryNFTs(currentNftCategory.value) || [];
});

// Token Data
const visibleTokens = computed(() => {
  return tokenStore.visibleTokens;
});

const totalTokenValue = computed(() => {
  return tokenStore.tokenList.reduce((total, token) => {
    return total + (token.valueUsd || 0);
  }, 0);
});

// Methods
const navigateTo = (path) => {
  router.push(path);
};

const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const copyPrincipal = () => {
  const principal = authStore.getIdentity()?.getPrincipal().toString() || '';
  navigator.clipboard.writeText(principal);
  copySuccess.value = true;
  setTimeout(() => {
    copySuccess.value = false;
  }, 2000);
};

const refreshTokens = async () => {
  await tokenStore.fetchAllBalances();
};

const handleBalanceUpdate = (data) => {
  // You can add any additional logic when a token balance is updated
  console.log(`Token ${data.symbol} balance updated: ${data.formatted}`);
};

const handleTokenAction = (data) => {
  if (data.action === 'send') {
    navigateTo(`/wallet/send?token=${data.symbol}`);
  } else if (data.action === 'receive') {
    navigateTo(`/wallet/receive?token=${data.symbol}`);
  } else if (data.action === 'history') {
    navigateTo(`/wallet/history?token=${data.symbol}`);
  }
};

const showNFTDetails = (nft) => {
  navigateTo(`/collection/${nft.id}`);
};

const getActivityIcon = (type) => {
  const icons = {
    transfer: 'fas fa-exchange-alt',
    mint: 'fas fa-plus-circle',
    purchase: 'fas fa-shopping-cart',
    sale: 'fas fa-tag',
    game: 'fas fa-gamepad',
    reward: 'fas fa-gift',
    default: 'fas fa-bell'
  };
  
  return icons[type] || icons.default;
};

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Convert to seconds
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  // Convert to minutes
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to days
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

// Initialize dashboard
const initializeDashboard = async () => {
  loading.value = true;
  
  try {
    // Initialize token store if not already initialized
    if (!tokenStore.initialized) {
      await tokenStore.initialize();
    }
    
    // Get player data - use isPlayerRegistered which loads player data
    await authStore.isPlayerRegistered();
    player.value = authStore.player;
    
    // Load NFTs
    loadingNFTs.value = true;
    await loadNFTs();
    loadingNFTs.value = false;
    
    // Load mock activities for now
    // In a real app, these would come from your backend
    loadMockActivities();
    
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  } finally {
    loading.value = false;
  }
};

const loadNFTs = async () => {
  try {
    // Load NFTs for current category
    await nftsStore.fetchNFTsByCategory(currentNftCategory.value);
    
    // Also load summary data for all categories
    await nftsStore.fetchNFTs();
  } catch (error) {
    console.error('Error loading NFTs:', error);
  }
};

// Load mock activities
const loadMockActivities = () => {
  activities.value = [
    {
      type: 'transfer',
      text: 'Transferred 5 ICP to @cosmic_user',
      timestamp: Date.now() - 1000 * 60 * 5 // 5 minutes ago
    },
    {
      type: 'mint',
      text: 'Minted a new Cosmic Guardian NFT',
      timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
    },
    {
      type: 'game',
      text: 'Won a battle in Cosmic Clash',
      timestamp: Date.now() - 1000 * 60 * 60 * 5 // 5 hours ago
    },
    {
      type: 'reward',
      text: 'Claimed 25 STDs daily reward',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    }
  ];
};

// Watch for category changes
const watchCategory = async () => {
  loadingNFTs.value = true;
  await nftsStore.fetchNFTsByCategory(currentNftCategory.value);
  loadingNFTs.value = false;
};

// Watch for category changes and reload NFTs
watch(currentNftCategory, watchCategory);

// Initialize dashboard on mount
onMounted(initializeDashboard);
</script>

<style scoped>
/* Main container and reset */
html, body {
  overflow-x: hidden;
}

.dashboard-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 1rem;
  padding-top: 6rem; /* Add top padding for header */
  overflow-x: hidden; /* Prevent horizontal overflow */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.cosmic-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  margin: 2rem 0;
}

.cosmic-loader {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(15, 185, 253, 0.2);
  border-top: 3px solid var(--cosmic-blue);
  animation: cosmic-spin 1.2s linear infinite;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.cosmic-loader.small {
  width: 30px;
  height: 30px;
  border-width: 2px;
}

@keyframes cosmic-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dashboard Content Styling */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 1440px; /* Max width for content */
  overflow-x: visible; /* Allow content to be visible */
  box-sizing: border-box;
}

/* Header Section */
.dashboard-header {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  width: 100%;
  box-sizing: border-box;
}

.user-profile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
}

.level-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 35px;
  height: 35px;
  background: var(--cosmic-glass-bg);
  border: 2px solid var(--cosmic-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--cosmic-text-primary);
  box-shadow: var(--cosmic-glow-blue-sm);
  font-size: 0.9rem;
}

.user-info {
  flex: 1;
  min-width: 200px;
  max-width: 100%;
  box-sizing: border-box;
}

.user-info h1 {
  margin: 0 0 0.5rem 0;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 2rem);
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
  overflow-wrap: break-word; /* Prevent text overflow */
  word-break: break-word;
}

.user-title {
  font-size: 1.1rem;
  color: var(--cosmic-text-secondary);
  margin: 0 0 1rem 0;
}

.principal-id {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.principal-label {
  color: var(--cosmic-text-tertiary);
}

.principal-value {
  color: var(--cosmic-blue);
  font-family: monospace;
  padding: 0.25rem 0.5rem;
  background: rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px; /* Reduced from 200px to prevent overflow */
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  color: var(--cosmic-blue);
}

.copy-btn.copied {
  color: var(--cosmic-green);
}

.user-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-left: auto;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--cosmic-text-secondary);
  min-width: 60px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

.stat-label {
  font-size: 0.9rem;
}

/* Dashboard Tabs */
.dashboard-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  padding-top: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.dashboard-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;
  background: rgba(15, 185, 253, 0.03);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  flex-shrink: 0;
  min-width: 90px;
}

.tab-button i {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  transition: all var(--cosmic-transition-medium);
}

.tab-button span {
  font-size: 0.85rem;
  font-weight: 500;
}

.tab-button:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
  color: var(--cosmic-blue);
}

.tab-button.active {
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.tab-button.active i {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-grid.full-width {
  grid-template-columns: 1fr;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

/* Dashboard Section Styling */
.dashboard-section {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box; /* Ensure padding is included in width calculation */
}

.dashboard-section:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

/* Full-width sections */
.referrals-section,
.missions-section,
.achievements-section,
.stats-section {
  min-height: 500px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.section-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--cosmic-text-primary);
  font-weight: 700;
}

.section-footer {
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Token Wallet Section */
.token-summary {
  background: rgba(15, 185, 253, 0.05);
  padding: 1rem;
  border-radius: var(--cosmic-radius-md);
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.total-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary);
}

.value-amount {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--cosmic-green);
  margin-top: 0.25rem;
  text-shadow: 0 0 5px rgba(0, 229, 164, 0.4);
}

.token-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

/* NFT Collection Section */
.category-filter {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

.category-filter::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.filter-button {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.filter-button.active {
  background: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  min-height: 200px;
  width: 100%;
  box-sizing: border-box;
}

.loading-nfts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  height: 200px;
}

.empty-collection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  height: 200px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.empty-collection i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Activity Feed Section */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 200px;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: rgba(15, 185, 253, 0.05);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(15, 185, 253, 0.2);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 185, 253, 0.3);
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  transition: all var(--cosmic-transition-fast);
  width: 100%;
  box-sizing: border-box;
}

.activity-item:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  flex-shrink: 0;
}

.activity-icon.transfer {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.activity-icon.mint {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
}

.activity-icon.game {
  background: rgba(157, 53, 191, 0.1);
  color: var(--cosmic-purple);
}

.activity-icon.reward {
  background: rgba(255, 145, 0, 0.1);
  color: var(--cosmic-orange);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent text overflow */
}

.activity-text {
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  word-break: break-word; /* Handle long text without overflow */
}

.activity-time {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.empty-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.empty-activity i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Quick Actions Section */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  transition: all var(--cosmic-transition-medium);
  cursor: pointer;
  color: var(--cosmic-text-primary);
}

.action-card:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: var(--cosmic-blue);
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.action-card i {
  font-size: 1.75rem;
  color: var(--cosmic-blue);
  transition: all var(--cosmic-transition-medium);
}

.action-card:hover i {
  transform: scale(1.2);
  text-shadow: var(--cosmic-glow-blue-md);
}

.action-card span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
    justify-content: space-around;
  }
}

@media (max-width: 768px) {
  /* Container structure */
  .dashboard-container {
    padding: 0.75rem;
    padding-top: 5rem; /* Slightly reduced top padding for mobile */
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .dashboard-content {
    width: 100%;
    max-width: 100%;
    gap: 1rem;
  }
  
  /* Grid containment */
  .dashboard-grid {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  .dashboard-column {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  /* Section containment */
  .dashboard-section {
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow: hidden;
    padding: 1rem;
    margin: 0;
  }
  
  /* Main content sections */
  .token-wallet,
  .nft-collection,
  .activity-feed,
  .quick-actions {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
    border-radius: var(--cosmic-radius-md); /* Slightly reduced radius on mobile */
  }
  
  /* Content grids and lists */
  .token-list,
  .nft-grid,
  .actions-grid,
  .activity-list {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  /* Headers and footers */
  .section-header,
  .section-footer,
  .token-summary,
  .total-value {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  
  /* Profile layout fixes */
  .user-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .user-info {
    text-align: center;
    width: 100%;
  }
  
  .principal-id {
    justify-content: center;
  }
  
  .principal-value {
    max-width: 140px; /* Smaller on mobile */
  }
  
  /* Section headers */
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-header .actions {
    margin-top: 0.5rem;
    width: 100%;
  }
  
  /* Category filters */
  .category-filter {
    width: 100%;
    justify-content: flex-start;
  }
  
  /* Action cards */
  .action-card {
    padding: 1rem;
  }
  
  .action-card i {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  /* Container for tiny screens */
  .dashboard-container {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding: 0.5rem;
    padding-top: 4.5rem;
    left: 0;
    right: 0;
    margin: 0;
  }
  
  /* Dashboard sections */
  .dashboard-section {
    padding: 0.75rem;
    border-radius: var(--cosmic-radius-sm);
  }
  
  /* Grid layouts */
  .nft-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.5rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr !important;
    gap: 0.75rem;
  }
  
  .token-list {
    grid-template-columns: 1fr !important;
  }
  
  /* User stats */
  .user-stats {
    justify-content: center;
    gap: 2rem;
  }
  
  /* Principal ID */
  .principal-value {
    max-width: 100px; /* Even smaller on tiny screens */
  }
  
  /* Fix individual card elements */
  .action-card {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding: 0.85rem;
  }
  
  .activity-item {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding: 0.65rem;
    box-sizing: border-box;
  }
  
  .activity-content {
    max-width: calc(100% - 35px);
    overflow: hidden;
  }
  
  /* Fix all list elements */
  .token-list > *,
  .nft-grid > *,
  .actions-grid > *,
  .activity-list > * {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0;
  }
  
  /* Adjust content padding */
  .token-summary {
    padding: 0.75rem;
  }
  
  /* Tab buttons */
  .tab-button {
    max-width: calc(20% - 0.4rem);
    min-width: 70px;
    padding: 0.5rem 0.25rem;
    overflow: hidden;
  }
  
  .tab-button i {
    font-size: 1.1rem;
  }
  
  .tab-button span {
    font-size: 0.7rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Text content handling */
  .activity-text,
  .value-amount,
  .user-title {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
  }
}
</style>