<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="loading" class="cosmic-loader-container">
      <div class="cosmic-loader"></div>
      <p>Wow so much data...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Onboarding Experience -->
      <OnboardingExperience
        ref="onboardingRef"
        @onboarding-completed="handleOnboardingCompleted"
        @onboarding-skipped="handleOnboardingSkipped"
      />
      
      <!-- Progressive Guide -->
      <ProgressiveGuide
        ref="progressiveGuideRef"
        :dashboardRef="$refs.contentArea"
        @tip-completed="handleTipCompleted"
        @guide-completed="handleGuideCompleted"
        @select-tab="selectTab"
      />
      
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
      <PullToRefreshContainer 
        class="dashboard-content-area" 
        ref="contentArea"
        @refresh="refreshDashboard"
      >
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
            <WelcomeCardSection 
              @daily-reward-claimed="handleDailyReward"
            />
            
            <!-- Token Wallet Section -->
            <TokenWalletSection 
              :limit="3"
              @token-balance-updated="handleBalanceUpdate"
              @token-action="handleTokenAction"
              @refresh="handleWalletRefresh"
            />
            
            <!-- NFT Collection Preview -->
            <NFTCollectionSection
              title="NFT Collection"
              compact
              :limit="4"
              @nft-selected="showNFTDetails"
              @category-changed="handleCategoryChange"
            />

            <!-- Activity Feed -->
            <ActivityFeedSection
              :activities="activities"
              :limit="4"
              @refresh="loadMockActivities"
            />
          </div>

          <!-- Wallet Section -->
          <div v-if="activeTab === 'wallet'" key="wallet" class="dashboard-page">
            <TokenWalletSection 
              @token-balance-updated="handleBalanceUpdate"
              @token-action="handleTokenAction"
              @refresh="handleWalletRefresh"
            />
          </div>

          <!-- Collection Tab -->
          <div v-if="activeTab === 'collection'" key="collection" class="dashboard-page">
            <NFTCollectionSection
              @nft-selected="showNFTDetails"
              @category-changed="handleCategoryChange"
            />
          </div>

          <!-- Referrals Section (Tab) -->
          <div v-if="activeTab === 'referrals'" key="referrals" class="dashboard-page">
            <ReferralsSection />
          </div>

          <!-- Friends Section (Tab) -->
          <div v-if="activeTab === 'friends'" key="friends" class="dashboard-page">
            <FriendsSection 
              ref="friendsRef" 
              dashboardMode
              @view-profile="viewUserProfile"
            />
          </div>

          <!-- User Profile Section (Tab) -->
          <div v-if="activeTab === 'profile' && viewingProfile" key="profile" class="dashboard-page">
            <div class="dashboard-section profile-preview cosmic-panel">
              <div class="section-header with-back">
                <button @click="backToFriends" class="back-button">
                  <i class="fas fa-arrow-left"></i>
                </button>
                <h2>{{ viewingProfile.username }}'s Profile</h2>
              </div>
              <ProfilePreview :profile-id="viewingProfile.playerId" embedded />
            </div>
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
      </PullToRefreshContainer>

      <!-- Bottom Navigation Bar for Mobile -->
      <BottomNavigation
        v-model="activeTab"
        :tabs="bottomNavTabs"
        @tab-selected="handleTabSelected"
      />
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
    <FloatingActionButton
      :actions="fabActions"
      @action="handleFabAction"
      :offsetBottom="80"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import { useNftsStore } from '@/stores/nfts';
import { useNotification } from '@/composables/useNotification';

// Import the new components
import WelcomeCardSection from '@/components/dashboard/sections/WelcomeCardSection.vue';
import TokenWalletSection from '@/components/dashboard/sections/TokenWalletSection.vue';
import NFTCollectionSection from '@/components/dashboard/sections/NFTCollectionSection.vue';
import ActivityFeedSection from '@/components/dashboard/sections/ActivityFeedSection.vue';
import BottomNavigation from '@/components/dashboard/ui/BottomNavigation.vue';
import FloatingActionButton from '@/components/dashboard/ui/FloatingActionButton.vue';
import PullToRefreshContainer from '@/components/dashboard/ui/PullToRefreshContainer.vue';

import DashboardMobileMenu from '@/components/dashboard/DashboardMobileMenu.vue';
import ReferralsSection from '@/components/referrals/ReferralsSection.vue';
import MissionsSection from '@/components/missions/MissionsSection.vue';
import AchievementsSection from '@/components/achievements/AchievementsSection.vue';
import StatsSection from '@/components/stats/StatsSection.vue';
import FriendsSection from '@/components/dashboard/sections/FriendsSection.vue';
import ProfilePreview from '@/components/profile/ProfilePreview.vue';
import OnboardingExperience from '@/components/onboarding/OnboardingExperience.vue';
import ProgressiveGuide from '@/components/dashboard/ui/ProgressiveGuide.vue';

// Router
const router = useRouter();

// Stores
const authStore = useAuthStore();
const tokenStore = useTokenStore();
const nftsStore = useNftsStore();

// State
const loading = ref(true);
const loadingNFTs = ref(false);
const activities = ref([]);
const activeTab = ref('overview');
const isMobileMenuOpen = ref(false);
const navHistory = ref([]);
const contentArea = ref(null);
const friendsRef = ref(null); // Reference to friends component
const viewingProfile = ref(null);

// Direction of transition (left or right)
const transitionDirection = ref('right');

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

// Get current page title based on active tab
const getPageTitle = computed(() => {
  const allTabs = [...mainTabs, ...additionalTabs];
  const currentTab = allTabs.find(tab => tab.id === activeTab.value);
  return currentTab ? currentTab.label : 'Dashboard';
});

// Tabs for bottom navigation
const bottomNavTabs = [
  { id: 'overview', label: 'Home', icon: 'fas fa-home' },
  { id: 'wallet', label: 'Wallet', icon: 'fas fa-wallet' },
  { id: 'friends', label: 'Friends', icon: 'fas fa-user-friends' },
  { id: 'marketplace', label: 'Market', icon: 'fas fa-store' }
];

// Full list of tabs (including ones not in bottom nav)
const mainTabs = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-columns' },
  { id: 'wallet', label: 'Wallet', icon: 'fas fa-wallet' },
  { id: 'collection', label: 'Collection', icon: 'fas fa-cubes' },
  { id: 'marketplace', label: 'Marketplace', icon: 'fas fa-store' }
];

const additionalTabs = [
  { id: 'referrals', label: 'Referrals', icon: 'fas fa-users' },
  { id: 'friends', label: 'Friends', icon: 'fas fa-user-friends' },
  { id: 'missions', label: 'Missions', icon: 'fas fa-tasks' },
  { id: 'achievements', label: 'Achievements', icon: 'fas fa-trophy' },
  { id: 'stats', label: 'Stats', icon: 'fas fa-chart-bar' }
];

// FAB actions
const fabActions = [
  { icon: 'fas fa-paper-plane', label: 'Send', action: 'wallet/send' },
  { icon: 'fas fa-qrcode', label: 'Receive', action: 'wallet/receive' },
  { icon: 'fas fa-user-plus', label: 'Add Friend', action: 'friends' },
  { icon: 'fas fa-tasks', label: 'Missions', action: 'missions', showPulse: true }
];

// Replace getCurrentInstance with our composable
// Replace this:
// import { getCurrentInstance } from 'vue';
// const { proxy } = getCurrentInstance();

// With this:
const notify = useNotification();

// Methods
const navigateTo = (path) => {
  router.push(path);
};

const handleBalanceUpdate = (data) => {
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

const handleCategoryChange = (category) => {
  console.log(`Selected category: ${category}`);
};

const handleWalletRefresh = () => {
  console.log('Wallet refreshed');
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

// Handle tab selection from bottom navigation
const handleTabSelected = (tab) => {
  console.log('Tab selected:', tab);
  // Any additional handling specific to bottom navigation
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

// FAB action handler
const handleFabAction = (action) => {
  console.log('FAB action:', action);
  
  // Special handling for friends action
  if (action.action === 'friends') {
    selectTab('friends');
    
    // Set the friends tab to discover (for searching new friends)
    setTimeout(() => {
      if (friendsRef.value) {
        friendsRef.value.activeTab = 'discover';
      }
    }, 100);
    
    // Show toast notification using the global system
    notify.info('Find and connect with other players', {
      title: 'Add Friends'
    });
    return;
  }
  
  // Handle different FAB actions
  if (action.action.includes('/')) {
    // It's a route path
    navigateTo(`/${action.action}`);
  } else {
    // It's a tab
    selectTab(action.action);
  }
  
  // Show toast notification for the action using global system
  notify.info(`You clicked on ${action.label}`, {
    title: `${action.label} Action`
  });
};

// Daily reward claim handler
const handleDailyReward = (data) => {
  const { success, reward } = data;
  if (success) {
    notify.reward(`You received ${reward.tokens} tokens and ${reward.xp} XP`, {
      title: 'Daily Reward Claimed!',
      duration: 5000
    });
  }
};

// Refresh dashboard data
const refreshDashboard = async () => {
  console.log('Refreshing dashboard data...');
  
  try {
    // Refresh token data
    if (tokenStore) {
      await tokenStore.fetchAllBalances();
    }
    
    // Refresh NFTs
    if (nftsStore) {
      await nftsStore.fetchNFTs();
    }
    
    // Refresh activities
    loadMockActivities();
    
    return true;
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    return false;
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
    await nftsStore.fetchNFTs();
    loadingNFTs.value = false;
    
    // Load mock activities
    loadMockActivities();
    
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  } finally {
    loading.value = false;
  }
};

// On component mount
onMounted(() => {
  initializeDashboard();
});

// New methods
const viewUserProfile = (profile) => {
  viewingProfile.value = profile;
  selectTab('profile');
};

const backToFriends = () => {
  viewingProfile.value = null;
  selectTab('friends');
};

const onboardingRef = ref(null);
const progressiveGuideRef = ref(null);

// Handle onboarding events
const handleOnboardingCompleted = async (data) => {
  console.log('%c✅ Onboarding completed! Data:', 'color: #4CAF50; font-weight: bold', data);
  
  // Log potential avatar/title updates (in real app, this would be an API call)
  if (data.avatarId) console.log('Analytics: User selected avatar:', data.avatarId);
  if (data.titleId) console.log('Analytics: User selected title:', data.titleId);
  
  console.log('Attempting to refresh token balances after onboarding completion reward...');
  try {
    // The correct action is to re-fetch balances, assuming the backend granted the reward.
    if (tokenStore.fetchAllBalances && typeof tokenStore.fetchAllBalances === 'function') {
      await tokenStore.fetchAllBalances(); // Refresh all balances
      console.log('%c🔄 Balances refreshed via fetchAllBalances()', 'color: #2196F3;');
    } else {
      console.warn('tokenStore.fetchAllBalances method not found. Cannot refresh balances automatically.');
    }
  } catch (error) {
    console.error('Error refreshing token balances after onboarding completion:', error);
  }
  
  // Optionally, call the main dashboard refresh function as well if it does more
  console.log('Performing full dashboard refresh after onboarding...');
  await refreshDashboard(); // Assuming refreshDashboard is async
};

const handleOnboardingSkipped = async () => {
  console.log('%c⚠️ Onboarding skipped by user.', 'color: #FF9800; font-weight: bold');
  
  console.log('Attempting to refresh data after onboarding skip...');
  try {
    // Refresh balances (in case some minimal reward was given or state needs update)
    if (tokenStore.fetchAllBalances && typeof tokenStore.fetchAllBalances === 'function') {
      await tokenStore.fetchAllBalances();
      console.log('%c🔄 Balances refreshed via fetchAllBalances()', 'color: #2196F3;');
    } else {
      console.warn('tokenStore.fetchAllBalances not found. Cannot refresh balances.');
    }
    
    // Update any other necessary data (e.g., activities)
    loadMockActivities(); // Assuming this isn't async
    console.log('Mock activities reloaded after skip.');
    
  } catch (error) {
    console.error('Error updating data after onboarding skip:', error);
  }
  
  // You might still want to call the full dashboard refresh here if needed
  // await refreshDashboard();
};

// Method to trigger feature onboarding for specific features
const startFeatureOnboarding = (feature) => {
  if (onboardingRef.value) {
    onboardingRef.value.startFeatureOnboarding(feature);
  }
};

// Handle progressive guide events
const handleTipCompleted = (tipId) => {
  console.log('Tip completed:', tipId);
  
  // Could add a small reward for completing tips
  if (tipId === 'welcome') {
    notify.info('Keep exploring your dashboard to learn more!', {
      title: 'Great Start',
      duration: 3000
    });
  }
};

const handleGuideCompleted = () => {
  console.log('Guide completed');
  
  // Reward for completing the entire guide
  notify.reward('You earned 10 tokens for learning the dashboard!', {
    title: 'Guide Completed',
    duration: 4000
  });
  
  // If we had a token store update
  // tokenStore.updateTokenBalance('STD', 10);
};

// Method to show the guide manually (could be triggered by a help button)
const showGuide = () => {
  if (progressiveGuideRef.value) {
    progressiveGuideRef.value.showGuide();
  }
};

// Method to reset the guide (for testing or if requested by user)
const resetGuide = () => {
  if (progressiveGuideRef.value) {
    progressiveGuideRef.value.resetGuide();
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