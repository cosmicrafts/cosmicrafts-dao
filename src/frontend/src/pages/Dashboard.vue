<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="loading" class="cosmic-loader-container">
      <div class="cosmic-loader"></div>
      <p>Wow so much data...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Mobile app-style header with back button -->
      <div class="mobile-app-header">
        <button v-if="showBackButton" @click="goBack" class="back-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h1 class="page-title">{{ getPageTitle }}</h1>
        <div class="header-avatar" @click="toggleMobileMenu">
          <img :src="avatarUrl" :alt="player?.username || 'User'" />
        </div>
      </div>

      <!-- Main Dashboard Sections -->
      <div class="dashboard-content-area" ref="contentArea" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <!-- Pull-to-refresh indicator -->
        <div class="pull-to-refresh-indicator" :class="{ 'visible': isPulling, 'refreshing': isRefreshing }">
          <div class="refresh-spinner">
            <i class="fas fa-sync-alt"></i>
          </div>
          <span>{{ isRefreshing ? 'Refreshing...' : isPulling ? 'Release to refresh' : 'Pull down to refresh' }}</span>
        </div>
        
        <!-- Tab Content with Transition -->
        <transition-group 
          name="tab-transition" 
          tag="div" 
          class="tab-container"
          @before-enter="beforeEnter"
          @enter="enter"
          @leave="leave"
        >
          <!-- Overview Section -->
          <div v-if="activeTab === 'overview'" key="overview" class="dashboard-page">
            <!-- Enhanced Welcome Card -->
            <section class="welcome-card cosmic-panel">
              <div class="cosmic-particles">
                <div class="particle"></div>
                <div class="particle"></div>
                <div class="particle"></div>
              </div>
              
              <div class="welcome-content">
                <div class="welcome-user-info">
                  <img :src="avatarUrl" alt="User Avatar" class="welcome-avatar" />
                  <div class="welcome-text">
                    <h2>Welcome back, {{ player?.username || 'Explorer' }}!</h2>
                    <div class="user-details">
                      <span class="user-title">{{ player?.title || 'Cosmic Recruit' }}</span>
                      <div class="level-indicator">
                        <div class="level-badge">{{ player?.level || 1 }}</div>
                        <div class="xp-bar">
                          <div class="xp-progress" :style="{ width: `${playerXpPercentage}%` }"></div>
                        </div>
                        <span class="xp-text">{{ player?.xp || 0 }}/{{ nextLevelXp }} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="stats-summary">
                  <div class="stat-summary-item">
                    <div class="summary-value">${{ totalTokenValue.toFixed(2) }}</div>
                    <div class="summary-label">Portfolio Value</div>
                  </div>
                  <div class="stat-summary-item">
                    <div class="summary-value">{{ totalNFTs }}</div>
                    <div class="summary-label">NFT Collection</div>
                  </div>
                  <div class="stat-summary-item">
                    <div class="summary-value">{{ activeQuests }}</div>
                    <div class="summary-label">Active Quests</div>
                  </div>
                </div>
                
                <div class="daily-checkin" v-if="!hasDailyCheckin">
                  <button @click="claimDailyReward" class="cosmic-button cosmic-button-primary checkin-button">
                    <i class="fas fa-gift"></i>
                    <span>Claim Daily Reward</span>
                  </button>
                </div>
              </div>
            </section>

            <!-- Token Wallet Section -->
            <section class="dashboard-section token-wallet cosmic-panel">
              <div class="section-header">
                <h2>Cosmic Wallet</h2>
                <div class="actions">
                  <button @click="refreshTokens" class="cosmic-button-sm cosmic-button-outline-primary">
                    <i class="fas fa-sync-alt"></i>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div class="token-list">
                <template v-if="tokenStore.loading">
                  <!-- Skeleton Token Cards -->
                  <div v-for="i in 3" :key="`skeleton-token-${i}`" class="skeleton-card token-skeleton">
                    <div class="skeleton-header">
                      <div class="skeleton-icon"></div>
                      <div class="skeleton-title"></div>
                    </div>
                    <div class="skeleton-content">
                      <div class="skeleton-amount"></div>
                      <div class="skeleton-value"></div>
                    </div>
                    <div class="skeleton-actions">
                      <div class="skeleton-button"></div>
                      <div class="skeleton-button"></div>
                    </div>
                  </div>
                </template>
                <TokenCard 
                  v-else
                  v-for="token in visibleTokens" 
                  :key="token.symbol" 
                  :symbol="token.symbol" 
                  @balance-updated="handleBalanceUpdate"
                  @action="handleTokenAction"
                />
              </div>
            </section>
            
            <!-- NFT Collection Preview -->
            <section class="dashboard-section nft-preview cosmic-panel">
              <div class="section-header">
                <h2>NFT Collection</h2>
                <button @click="navigateTo('/collection')" class="view-all-btn">
                  View All <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              <div class="nft-preview-grid">
                <div v-if="loadingNFTs" class="nft-loading-grid">
                  <!-- Skeleton NFT Cards -->
                  <div v-for="i in 4" :key="`skeleton-nft-${i}`" class="skeleton-card nft-skeleton">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-nft-details">
                      <div class="skeleton-nft-title"></div>
                      <div class="skeleton-nft-subtitle"></div>
                    </div>
                  </div>
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
            </section>

            <!-- Activity Feed -->
            <section class="dashboard-section activity-feed cosmic-panel">
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
          </div>

          <!-- Wallet Section -->
          <div v-if="activeTab === 'wallet'" key="wallet" class="dashboard-page">
            <section class="dashboard-section token-wallet cosmic-panel">
              <div class="section-header">
                <h2>Your Tokens</h2>
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
                <template v-if="tokenStore.loading">
                  <!-- Skeleton Token Cards -->
                  <div v-for="i in 3" :key="`skeleton-token-${i}`" class="skeleton-card token-skeleton">
                    <div class="skeleton-header">
                      <div class="skeleton-icon"></div>
                      <div class="skeleton-title"></div>
                    </div>
                    <div class="skeleton-content">
                      <div class="skeleton-amount"></div>
                      <div class="skeleton-value"></div>
                    </div>
                    <div class="skeleton-actions">
                      <div class="skeleton-button"></div>
                      <div class="skeleton-button"></div>
                    </div>
                  </div>
                </template>
                <TokenCard 
                  v-else
                  v-for="token in visibleTokens" 
                  :key="token.symbol" 
                  :symbol="token.symbol" 
                  @balance-updated="handleBalanceUpdate"
                  @action="handleTokenAction"
                />
              </div>

              <div class="wallet-actions">
                <button @click="navigateTo('/wallet/send')" class="wallet-action-btn">
                  <i class="fas fa-paper-plane"></i>
                  <span>Send</span>
                </button>
                <button @click="navigateTo('/wallet/receive')" class="wallet-action-btn">
                  <i class="fas fa-qrcode"></i>
                  <span>Receive</span>
                </button>
                <button @click="navigateTo('/wallet/history')" class="wallet-action-btn">
                  <i class="fas fa-history"></i>
                  <span>History</span>
                </button>
                <button @click="navigateTo('/wallet/swap')" class="wallet-action-btn">
                  <i class="fas fa-exchange-alt"></i>
                  <span>Swap</span>
                </button>
              </div>
            </section>
          </div>

          <!-- Collection Tab -->
          <div v-if="activeTab === 'collection'" key="collection" class="dashboard-page">
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
                    v-for="nft in currentCategoryNFTs" 
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
            </section>
          </div>

          <!-- Referrals Section (Tab) -->
          <div v-if="activeTab === 'referrals'" key="referrals" class="dashboard-page">
            <ReferralsSection />
          </div>

          <!-- Missions Section (Tab) -->
          <div v-if="activeTab === 'missions'" key="missions" class="dashboard-page">
            <MissionsSection />
          </div>

          <!-- Achievements Section (Tab) -->
          <div v-if="activeTab === 'achievements'" key="achievements" class="dashboard-page">
            <AchievementsSection />
          </div>
          
          <!-- Stats Section (Tab) -->
          <div v-if="activeTab === 'stats'" key="stats" class="dashboard-page">
            <StatsSection />
          </div>

          <!-- Marketplace Section (Tab) -->
          <div v-if="activeTab === 'marketplace'" key="marketplace" class="dashboard-page">
            <section class="dashboard-section marketplace-preview cosmic-panel">
              <div class="section-header">
                <h2>Marketplace</h2>
              </div>
              <div class="marketplace-content">
                <p>Marketplace section is coming soon!</p>
                <button @click="navigateTo('/marketplace')" class="cosmic-button cosmic-button-primary">
                  <span class="button-text">Browse Marketplace</span>
                </button>
              </div>
            </section>
          </div>
        </transition-group>
      </div>

      <!-- Bottom Navigation Bar for Mobile -->
      <nav class="mobile-bottom-nav">
        <button 
          v-for="tab in bottomNavTabs" 
          :key="tab.id"
          @click="selectTab(tab.id)"
          class="bottom-nav-item" 
          :class="{ active: activeTab === tab.id }"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Mobile Menu Component -->
    <DashboardMobileMenu
      v-model:is-open="isMobileMenuOpen"
      :active-tab="activeTab"
      :player="player"
      :avatar-url="avatarUrl"
      :main-tabs="mainTabs"
      :additional-tabs="additionalTabs"
      @select-tab="selectTab"
    />

    <!-- Floating Action Button (FAB) -->
    <div class="fab-container" :class="{ 'fab-expanded': isFabExpanded }">
      <div class="fab-actions" :class="{ 'fab-actions-visible': isFabExpanded }">
        <button @click="handleFabAction('wallet/send')" class="fab-action-button">
          <i class="fas fa-paper-plane"></i>
          <span class="fab-action-label">Send</span>
        </button>
        <button @click="handleFabAction('wallet/receive')" class="fab-action-button">
          <i class="fas fa-qrcode"></i>
          <span class="fab-action-label">Receive</span>
        </button>
        <button @click="handleFabAction('marketplace')" class="fab-action-button">
          <i class="fas fa-shopping-cart"></i>
          <span class="fab-action-label">Shop</span>
        </button>
        <button @click="handleFabAction('missions')" class="fab-action-button">
          <i class="fas fa-tasks"></i>
          <span class="fab-action-label">Missions</span>
        </button>
      </div>
      <button class="fab-main" @click="toggleFab">
        <i class="fas" :class="isFabExpanded ? 'fa-times' : 'fa-plus'"></i>
      </button>
    </div>

    <!-- Toast Notifications Container -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toastMessages" 
          :key="toast.id" 
          class="toast-notification"
          :class="[`toast-${toast.type}`, { 'with-progress': toast.showProgress }]"
        >
          <div class="toast-icon">
            <i :class="getToastIcon(toast.type)"></i>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
            <div v-if="toast.showProgress" class="toast-progress-bar">
              <div 
                class="toast-progress" 
                :style="{ width: `${getToastProgress(toast)}%` }"
              ></div>
            </div>
          </div>
          <button class="toast-close" @click="() => dismissToast(toast.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition-group>
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
import DashboardMobileMenu from '@/components/dashboard/DashboardMobileMenu.vue';
import { v4 as uuidv4 } from 'uuid';

// Router
const router = useRouter();

// Stores
const authStore = useAuthStore();
const tokenStore = useTokenStore();
const nftsStore = useNftsStore();

// State
const loading = ref(true);
const loadingNFTs = ref(false);
const currentNftCategory = ref('characters');
const activities = ref([]);
const activeTab = ref('overview');
const isMobileMenuOpen = ref(false);
const navHistory = ref([]);
const contentArea = ref(null);
const isPulling = ref(false);
const isRefreshing = ref(false);
const pullStartY = ref(0);
const pullMoveY = ref(0);
const pullThreshold = 80; // Pixels to pull before refresh triggers
const isFabExpanded = ref(false);
const toastMessages = ref([]);

// Add swipe gesture tracking
const swipeStartX = ref(0);
const swipeMoveX = ref(0);
const swipeThreshold = 80; // Pixels to swipe before tab switch
const isHorizontalSwipe = ref(false);

// Tabs for bottom navigation
const bottomNavTabs = [
  { id: 'overview', label: 'Home', icon: 'fas fa-home' },
  { id: 'wallet', label: 'Wallet', icon: 'fas fa-wallet' },
  { id: 'collection', label: 'NFTs', icon: 'fas fa-cubes' },
  { id: 'marketplace', label: 'Market', icon: 'fas fa-store' },
  { id: 'missions', label: 'Missions', icon: 'fas fa-tasks' }
];

// Full list of tabs (including ones not in bottom nav)
const mainTabs = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-columns' },
  { id: 'wallet', label: 'Wallet', icon: 'fas fa-wallet' },
  { id: 'collection', label: 'Collection', icon: 'fas fa-cubes' },
  { id: 'marketplace', label: 'Marketplace', icon: 'fas fa-store' },
  { id: 'missions', label: 'Missions', icon: 'fas fa-tasks' }
];

const additionalTabs = [
  { id: 'referrals', label: 'Referrals', icon: 'fas fa-users' },
  { id: 'achievements', label: 'Achievements', icon: 'fas fa-trophy' },
  { id: 'stats', label: 'Stats', icon: 'fas fa-chart-bar' }
];

// NFT Categories
const nftCategories = ['characters', 'units', 'avatars', 'trophies', 'chests'];

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

// Avatar URL
const avatarUrl = computed(() => {
  if (authStore.player?.avatar) {
    return `/assets/avatars/avatar-${authStore.player.avatar}.webp`;
  }
  return '/assets/avatars/avatar-default.webp';
});

// Player info
const player = computed(() => authStore.player);

// Navigation state
const showBackButton = computed(() => {
  return navHistory.value.length > 0;
});

// Direction of transition (left or right)
const transitionDirection = ref('right');

// Get current page title based on active tab
const getPageTitle = computed(() => {
  const allTabs = [...mainTabs, ...additionalTabs];
  const currentTab = allTabs.find(tab => tab.id === activeTab.value);
  return currentTab ? currentTab.label : 'Dashboard';
});

// Methods
const navigateTo = (path) => {
  router.push(path);
};

const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
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

// Mobile menu toggle
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Tab transition methods
const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = `translateX(${transitionDirection.value === 'right' ? '50px' : '-50px'})`;
};

const enter = (el, done) => {
  // Trigger a reflow to ensure the transition happens
  void el.offsetWidth;
  
  el.style.transition = 'all 0.3s ease-out';
  el.style.opacity = 1;
  el.style.transform = 'translateX(0)';
  
  el.addEventListener('transitionend', done, { once: true });
};

const leave = (el, done) => {
  el.style.transition = 'all 0.3s ease-out';
  el.style.opacity = 0;
  el.style.transform = `translateX(${transitionDirection.value === 'right' ? '-50px' : '50px'})`;
  
  el.addEventListener('transitionend', done, { once: true });
};

// Selection handler with history tracking and transition direction
const selectTab = (tabId) => {
  if (tabId !== activeTab.value) {
    // Determine direction based on tab index
    const allTabs = [...mainTabs, ...additionalTabs];
    const currentIndex = allTabs.findIndex(tab => tab.id === activeTab.value);
    const newIndex = allTabs.findIndex(tab => tab.id === tabId);
    
    // Set transition direction based on tab order
    if (newIndex > currentIndex) {
      transitionDirection.value = 'right';
    } else {
      transitionDirection.value = 'left';
    }
    
    navHistory.value.push(activeTab.value);
    activeTab.value = tabId;
    
    // Scroll to top when changing tabs
    if (contentArea.value) {
      setTimeout(() => {
        contentArea.value.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }
};

// Go back in navigation history
const goBack = () => {
  if (navHistory.value.length > 0) {
    transitionDirection.value = 'left'; // Always go left when going back
    activeTab.value = navHistory.value.pop();
    
    // Scroll to top when going back
    if (contentArea.value) {
      setTimeout(() => {
        contentArea.value.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }
};

// FAB handlers
const toggleFab = () => {
  isFabExpanded.value = !isFabExpanded.value;
};

// Toast Notification System
const showToast = ({ title, message = '', type = 'info', duration = 5000, showProgress = true }) => {
  const id = uuidv4();
  const timestamp = Date.now();
  const expiresAt = timestamp + duration;
  
  const toast = {
    id,
    title,
    message,
    type,
    timestamp,
    duration,
    expiresAt,
    showProgress
  };
  
  toastMessages.value.push(toast);
  
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
  
  return id;
};

const dismissToast = (id) => {
  const index = toastMessages.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toastMessages.value.splice(index, 1);
  }
};

const getToastIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    achievement: 'fas fa-trophy',
    reward: 'fas fa-gift'
  };
  
  return icons[type] || icons.info;
};

const getToastProgress = (toast) => {
  if (!toast.showProgress) return 0;
  
  const now = Date.now();
  const elapsed = now - toast.timestamp;
  const total = toast.duration;
  
  const remaining = Math.max(0, total - elapsed);
  return (remaining / total) * 100;
};

// Example: Show a demo toast when dashboard is loaded
onMounted(() => {
  // Add listener and initialize dashboard
  document.addEventListener('click', handleOutsideClick);
  initializeDashboard();
  
  // Show a welcome toast after a short delay
  setTimeout(() => {
    showToast({
      title: 'Welcome back!',
      message: 'Your cosmic journey awaits...',
      type: 'info',
      duration: 5000
    });
  }, 1000);
  
  // Simulate an achievement notification after some time
  setTimeout(() => {
    showToast({
      title: 'Achievement Unlocked!',
      message: 'Daily Login Streak: 3 Days',
      type: 'achievement',
      duration: 7000
    });
  }, 4000);
});

// Helper to simulate toast for demo purposes
const simulateAction = (action) => {
  if (action === 'wallet/send') {
    showToast({
      title: 'Transaction Initiated',
      message: 'Preparing to send tokens...',
      type: 'info'
    });
  } else if (action === 'wallet/receive') {
    showToast({
      title: 'Wallet Address Ready',
      message: 'Share your address to receive tokens',
      type: 'success'
    });
  } else if (action === 'marketplace') {
    showToast({
      title: 'Marketplace',
      message: 'Browsing latest NFTs...',
      type: 'info'
    });
  } else if (action === 'missions') {
    showToast({
      title: '2 New Missions Available!',
      message: 'Complete them to earn rewards',
      type: 'reward'
    });
  }
};

// Update FAB action handler to show toast notifications
const handleFabAction = (action) => {
  // Handle different FAB actions
  if (action.includes('/')) {
    // It's a route path
    navigateTo(`/${action}`);
  } else {
    // It's a tab
    selectTab(action);
  }
  
  // Show toast notification for the action
  simulateAction(action);
  
  // Close FAB after action
  isFabExpanded.value = false;
};

// Close FAB when clicking outside
const handleOutsideClick = (event) => {
  if (isFabExpanded.value) {
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer && !fabContainer.contains(event.target)) {
      isFabExpanded.value = false;
    }
  }
};

// Remember to clean up event listeners
watch(() => isFabExpanded.value, (newVal) => {
  if (newVal) {
    // Add backdrop when FAB is expanded
    document.body.classList.add('fab-backdrop-active');
  } else {
    // Remove backdrop when FAB is closed
    document.body.classList.remove('fab-backdrop-active');
  }
});

// Initialize dashboard
const initializeDashboard = async () => {
  loading.value = true;
  
  try {
    // Initialize token store if not already initialized
    if (!tokenStore.initialized) {
      await tokenStore.initialize();
    }
    
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

// Pull-to-refresh and swipe navigation handling
const handleTouchStart = (e) => {
  // Store both X and Y coordinates
  pullStartY.value = e.touches[0].clientY;
  swipeStartX.value = e.touches[0].clientX;
  
  // Only enable pull-to-refresh when scrolled to top
  if (contentArea.value.scrollTop === 0) {
    isPulling.value = true;
  }
  
  // Reset horizontal swipe tracking
  isHorizontalSwipe.value = false;
};

const handleTouchMove = (e) => {
  pullMoveY.value = e.touches[0].clientY;
  swipeMoveX.value = e.touches[0].clientX;
  
  // Calculate vertical and horizontal movement
  const verticalDistance = pullMoveY.value - pullStartY.value;
  const horizontalDistance = swipeMoveX.value - swipeStartX.value;
  
  // Determine if this is primarily a horizontal swipe
  if (!isHorizontalSwipe.value && Math.abs(horizontalDistance) > Math.abs(verticalDistance) && 
      Math.abs(horizontalDistance) > 20) {
    isHorizontalSwipe.value = true;
  }
  
  // Handle vertical pull (pull-to-refresh)
  if (isPulling.value && !isHorizontalSwipe.value) {
    if (verticalDistance > 0) {
      const pullIndicator = document.querySelector('.pull-to-refresh-indicator');
      if (pullIndicator) {
        const translateY = Math.min(Math.pow(verticalDistance, 0.8), pullThreshold);
        pullIndicator.style.transform = `translateY(${translateY}px)`;
        
        // Rotate spinner based on pull distance
        const spinner = pullIndicator.querySelector('.refresh-spinner i');
        if (spinner) {
          spinner.style.transform = `rotate(${verticalDistance * 2}deg)`;
        }
      }
      
      e.preventDefault(); // Prevent scrolling while pulling
    }
  }
  
  // Handle horizontal swipe (tab navigation)
  if (isHorizontalSwipe.value && Math.abs(horizontalDistance) > 30) {
    e.preventDefault(); // Prevent page scrolling during swipe
    
    // Apply subtle reactive resistance effect
    const swipeProgress = Math.min(Math.abs(horizontalDistance) / (swipeThreshold * 3), 0.3);
    const targetPage = document.querySelector(`[key="${activeTab.value}"].dashboard-page`);
    if (targetPage) {
      targetPage.style.transform = `translateX(${horizontalDistance * swipeProgress}px)`;
      targetPage.style.transition = 'none'; // Disable transition for direct manipulation
    }
  }
};

const handleTouchEnd = async (e) => {
  const verticalDistance = pullMoveY.value - pullStartY.value;
  const horizontalDistance = swipeMoveX.value - swipeStartX.value;
  
  // Handle horizontal swipe completion
  if (isHorizontalSwipe.value) {
    // Reset any transforms applied during swiping
    const targetPage = document.querySelector(`[key="${activeTab.value}"].dashboard-page`);
    if (targetPage) {
      targetPage.style.transition = 'transform 0.3s ease-out';
      targetPage.style.transform = 'translateX(0)';
    }
    
    // Check if swipe exceeds threshold to change tabs
    if (Math.abs(horizontalDistance) > swipeThreshold) {
      // Determine which direction to navigate
      const allTabs = [...mainTabs, ...additionalTabs];
      const currentIndex = allTabs.findIndex(tab => tab.id === activeTab.value);
      
      if (horizontalDistance > 0 && currentIndex > 0) {
        // Swipe right -> go to previous tab
        selectTab(allTabs[currentIndex - 1].id);
        
        // Show haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else if (horizontalDistance < 0 && currentIndex < allTabs.length - 1) {
        // Swipe left -> go to next tab
        selectTab(allTabs[currentIndex + 1].id);
        
        // Show haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }
  }
  
  // Handle vertical pull-to-refresh completion
  if (isPulling.value && !isHorizontalSwipe.value) {
    const pullIndicator = document.querySelector('.pull-to-refresh-indicator');
    
    if (verticalDistance > pullThreshold) {
      // User pulled enough to trigger refresh
      isRefreshing.value = true;
      
      if (pullIndicator) {
        pullIndicator.style.transform = 'translateY(50px)';
      }
      
      // Perform refresh actions
      await refreshDashboard();
      
      // Reset after small delay
      setTimeout(() => {
        isRefreshing.value = false;
        isPulling.value = false;
        if (pullIndicator) {
          pullIndicator.style.transform = 'translateY(0)';
        }
      }, 500);
    } else {
      // Not pulled enough, reset
      isPulling.value = false;
      if (pullIndicator) {
        pullIndicator.style.transform = 'translateY(0)';
      }
    }
  }
  
  isPulling.value = false;
  isHorizontalSwipe.value = false;
};

// Refresh dashboard data with toast notification
const refreshDashboard = async () => {
  const toastId = showToast({
    title: 'Refreshing Dashboard',
    message: 'Fetching latest data...',
    type: 'info',
    showProgress: true
  });
  
  try {
    // Refresh token data
    await tokenStore.fetchAllBalances();
    
    // Refresh NFTs
    if (nftsStore) {
      await nftsStore.fetchNFTs();
      await nftsStore.fetchNFTsByCategory(currentNftCategory.value);
    }
    
    // Refresh activities
    loadMockActivities();
    
    // Show success toast
    dismissToast(toastId);
    showToast({
      title: 'Dashboard Updated',
      message: 'All data is now up to date',
      type: 'success'
    });
    
    return true;
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    
    // Show error toast
    dismissToast(toastId);
    showToast({
      title: 'Update Failed',
      message: 'Could not refresh dashboard data',
      type: 'error'
    });
    
    return false;
  }
};

// Add these new computed properties and refs

// Sample active quests count (replace with actual data when available)
const activeQuests = computed(() => {
  return player.value?.activeMissions?.length || 3;
});

// Player XP percentage for progress bar
const playerXpPercentage = computed(() => {
  const currentXp = player.value?.xp || 0;
  const currentLevel = player.value?.level || 1;
  
  // Calculate XP needed for next level (example formula)
  const xpForNextLevel = currentLevel * 1000;
  
  // Calculate percentage (cap at 100%)
  return Math.min(Math.floor((currentXp / xpForNextLevel) * 100), 100);
});

// Next level XP requirement
const nextLevelXp = computed(() => {
  const currentLevel = player.value?.level || 1;
  return currentLevel * 1000;
});

// Daily check-in state
const hasDailyCheckin = ref(false);

// Daily reward claim function
const claimDailyReward = () => {
  // Call API to claim reward (mock for now)
  
  // Show success toast
  showToast({
    title: 'Daily Reward Claimed!',
    message: 'You received 50 STDs and 25 XP',
    type: 'reward',
    duration: 5000
  });
  
  // Set claimed state
  hasDailyCheckin.value = true;
  
  // Add vibration if available
  if (navigator.vibrate) {
    navigator.vibrate([50, 50, 150]);
  }
};
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
  padding: 0;
  overflow-x: hidden; /* Prevent horizontal overflow */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
  min-height: 100vh;
  background-color: var(--cosmic-bg-darker);
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
  flex: 1;
  height: 100%;
}

/* Mobile App Header */
.mobile-app-header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  z-index: 10;
  box-shadow: var(--cosmic-shadow-sm);
}

.back-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 50%;
  color: var(--cosmic-text-primary);
  font-size: 1rem;
  transition: all var(--cosmic-transition-fast);
  cursor: pointer;
}

.back-button:active {
  transform: scale(0.95);
  background: rgba(15, 185, 253, 0.2);
}

.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--cosmic-text-primary);
  flex: 1;
  text-align: center;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
  cursor: pointer;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Dashboard Content Area */
.dashboard-content-area {
  flex: 1;
  width: 100%;
  padding: 1rem;
  padding-bottom: 5rem; /* Add space for bottom nav */
  overflow-y: auto;
  box-sizing: border-box;
}

.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* Enhanced Welcome Card Styles */
.welcome-card {
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1), rgba(157, 53, 191, 0.15));
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(15, 185, 253, 0.2);
}

.cosmic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.5);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
  pointer-events: none;
  opacity: 0.7;
}

.particle:nth-child(1) {
  top: 20%;
  left: 10%;
  animation: float 15s ease-in-out infinite;
}

.particle:nth-child(2) {
  top: 60%;
  left: 80%;
  width: 8px;
  height: 8px;
  animation: float 20s ease-in-out infinite reverse;
}

.particle:nth-child(3) {
  top: 10%;
  left: 60%;
  width: 5px;
  height: 5px;
  animation: float 12s ease-in-out infinite 2s;
}

@keyframes float {
  0% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(20px) translateX(10px); }
  50% { transform: translateY(0) translateX(20px); }
  75% { transform: translateY(-20px) translateX(10px); }
  100% { transform: translateY(0) translateX(0); }
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.welcome-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
  object-fit: cover;
}

.welcome-text {
  display: flex;
  flex-direction: column;
}

.welcome-text h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-title {
  color: var(--cosmic-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.level-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.level-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--cosmic-glass-bg);
  border: 1px solid var(--cosmic-blue);
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.8rem;
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.xp-bar {
  flex: 1;
  height: 6px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
  overflow: hidden;
  min-width: 100px;
}

.xp-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue), var(--cosmic-purple));
  border-radius: 3px;
}

.xp-text {
  font-size: 0.75rem;
  color: var(--cosmic-text-tertiary);
  white-space: nowrap;
}

.stats-summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.stat-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--cosmic-blue);
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.daily-checkin {
  display: flex;
  justify-content: center;
}

.checkin-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.checkin-button i {
  font-size: 1.2rem;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .welcome-user-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .level-indicator {
    justify-content: center;
  }
  
  .user-details {
    align-items: center;
  }
  
  .stats-summary {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  
  .stat-summary-item {
    width: 100%;
  }
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
  margin-bottom: 1rem;
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
  font-size: 1.2rem;
  margin: 0;
  color: var(--cosmic-text-primary);
  font-weight: 700;
}

/* Token List */
.token-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

/* NFT Preview */
.nft-preview-grid, .nft-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.empty-collection, .loading-nfts {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.empty-collection i, .loading-nfts i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-blue);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-all-btn i {
  font-size: 0.8rem;
}

/* Activity Feed */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  transition: all var(--cosmic-transition-fast);
}

.activity-item:hover {
  background: rgba(15, 185, 253, 0.1);
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
}

.activity-text {
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

/* Wallet Section */
.wallet-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
}

.wallet-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  transition: all var(--cosmic-transition-medium);
  cursor: pointer;
}

.wallet-action-btn i {
  font-size: 1.5rem;
  color: var(--cosmic-blue);
}

.wallet-action-btn span {
  font-size: 0.8rem;
}

.wallet-action-btn:hover, .wallet-action-btn:active {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
}

/* Marketplace Preview */
.marketplace-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
  gap: 1rem;
}

/* Bottom Navigation Bar */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-top: 1px solid rgba(15, 185, 253, 0.15);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.5rem;
  color: var(--cosmic-text-tertiary);
  background: transparent;
  border: none;
  transition: all var(--cosmic-transition-fast);
  cursor: pointer;
  font-size: 0.75rem;
  gap: 0.25rem;
}

.bottom-nav-item i {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.bottom-nav-item.active {
  color: var(--cosmic-blue);
}

.bottom-nav-item.active i {
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
}

/* Category Filter */
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

/* Medium screens */
@media (min-width: 768px) and (max-width: 1199px) {
  .nft-preview-grid, .nft-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .dashboard-content-area {
    max-width: 800px;
    margin: 0 auto;
  }
}

/* Large screens */
@media (min-width: 1200px) {
  .nft-preview-grid, .nft-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .dashboard-content-area {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .wallet-actions {
    max-width: 600px;
    margin: 1rem auto 0;
  }
}

/* Small screens */
@media (max-width: 480px) {
  .wallet-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header h2 {
    font-size: 1.1rem;
  }
  
  .bottom-nav-item {
    font-size: 0.7rem;
  }
  
  .bottom-nav-item i {
    font-size: 1.1rem;
  }
}

/* Pull to refresh styles */
.pull-to-refresh-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transform: translateY(0);
  transition: transform 0.3s ease-out;
  pointer-events: none;
  z-index: 5;
  gap: 10px;
  color: var(--cosmic-blue);
}

.pull-to-refresh-indicator span {
  font-size: 0.9rem;
  opacity: 0.8;
}

.refresh-spinner {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pull-to-refresh-indicator.refreshing .refresh-spinner i {
  animation: cosmic-spin 1s linear infinite;
}

.pull-to-refresh-indicator.visible {
  opacity: 1;
}

/* Tab transition styles */
.tab-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.dashboard-page {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform, opacity;
}

/* Keep the active page visible */
.dashboard-page[style*="opacity: 1"] {
  position: relative;
  pointer-events: auto;
}

/* Hide any page that's transitioning out or not active */
.dashboard-page[style*="opacity: 0"] {
  pointer-events: none;
}

/* Floating Action Button */
.fab-container {
  position: fixed;
  bottom: 80px; /* Position above bottom nav */
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  z-index: 90;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cosmic-blue), var(--cosmic-blue-dark));
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px rgba(15, 185, 253, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform;
}

.fab-main i {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.fab-expanded .fab-main {
  transform: rotate(135deg);
  background: linear-gradient(135deg, var(--cosmic-blue-dark), var(--cosmic-blue));
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(15, 185, 253, 0.5);
}

.fab-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: absolute;
  bottom: 70px;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: all 0.3s ease-out;
}

.fab-actions-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.fab-action-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: var(--cosmic-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 0 8px rgba(15, 185, 253, 0.2);
  transition: all 0.2s ease;
}

.fab-action-button:hover {
  background: rgba(15, 185, 253, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 12px rgba(15, 185, 253, 0.3);
}

.fab-action-button i {
  font-size: 1.2rem;
}

.fab-action-label {
  position: absolute;
  right: 60px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
  pointer-events: none;
}

.fab-action-button:hover .fab-action-label {
  opacity: 1;
  transform: translateX(0);
}

/* Add backdrop when FAB is expanded */
:global(body.fab-backdrop-active)::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 80;
  pointer-events: all;
}

/* Adjust for safe areas */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .fab-container {
    bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  width: calc(100% - 40px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-notification {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(15, 185, 253, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.2);
  overflow: hidden;
  pointer-events: all;
  max-width: 100%;
}

.toast-notification.with-progress::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--cosmic-blue);
  border-radius: 0 0 0 8px;
  transition: width 0.1s linear;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 4px;
  font-size: 1rem;
}

.toast-message {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.toast-icon i {
  font-size: 1.2rem;
}

.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(15, 185, 253, 0.1);
  overflow: hidden;
}

.toast-progress {
  height: 100%;
  background: var(--cosmic-blue);
  transition: width 0.05s linear;
}

.toast-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
}

/* Toast types */
.toast-info .toast-icon {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
}

.toast-success .toast-icon {
  background: rgba(0, 229, 164, 0.15);
  color: var(--cosmic-green);
}

.toast-warning .toast-icon {
  background: rgba(255, 145, 0, 0.15);
  color: var(--cosmic-orange);
}

.toast-error .toast-icon {
  background: rgba(255, 0, 76, 0.15);
  color: var(--cosmic-red);
}

.toast-achievement .toast-icon {
  background: rgba(157, 53, 191, 0.15);
  color: var(--cosmic-purple);
}

.toast-reward .toast-icon {
  background: rgba(255, 215, 0, 0.15);
  color: gold;
}

/* Toast transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Skeleton Loading Styles */
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

.skeleton-card {
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  padding: 1rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  overflow: hidden;
  position: relative;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150px;
  width: 150px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  animation: skeleton-shine 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes skeleton-shine {
  0% { left: -150px; }
  40%, 100% { left: 100%; }
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  flex-shrink: 0;
}

.skeleton-title {
  height: 1.2rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 60%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skeleton-amount {
  height: 1.8rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 80%;
}

.skeleton-value {
  height: 1rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 40%;
}

.skeleton-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.skeleton-button {
  height: 2.2rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  flex: 1;
}

/* NFT Skeleton */
.nft-skeleton {
  display: flex;
  flex-direction: column;
  height: 220px;
}

.skeleton-image {
  height: 140px;
  border-radius: var(--cosmic-radius-sm);
  background: rgba(15, 185, 253, 0.1);
  margin-bottom: 0.8rem;
}

.skeleton-nft-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-nft-title {
  height: 1.2rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 70%;
}

.skeleton-nft-subtitle {
  height: 1rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 50%;
}

.nft-loading-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .nft-loading-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>