<!-- DashboardHeader.vue -->
<template>
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

    <!-- Desktop Dashboard Tabs -->
    <div class="dashboard-tabs desktop-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="selectTab(tab.id)"
        class="tab-button" 
        :class="{ active: activeTab === tab.id }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu">
      <i class="fas fa-bars"></i>
      <span class="menu-label">{{ getCurrentTabLabel }}</span>
    </button>
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNftsStore } from '@/stores/nfts';
import DashboardMobileMenu from './DashboardMobileMenu.vue';
import AvatarService from '@/utils/AvatarService';

// Props
const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:activeTab']);

// Stores
const authStore = useAuthStore();
const nftsStore = useNftsStore();

// State
const player = computed(() => authStore.player);
const copySuccess = ref(false);
const isMobileMenuOpen = ref(false);
const playerAvatar = ref(null);

// Load player avatar
watch(() => player.value?.avatar, async (newAvatarId) => {
  if (newAvatarId !== undefined && newAvatarId !== null) {
    try {
      // Use AvatarService to load the avatar asynchronously
      playerAvatar.value = await AvatarService.loadAvatarAsync(newAvatarId);
    } catch (error) {
      console.error('Failed to load avatar:', error);
      playerAvatar.value = null; // Fallback to no avatar
    }
  } else {
    playerAvatar.value = null;
  }
}, { immediate: true });

// Tab options - split into main and additional tabs
const mainTabs = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-columns' },
  { id: 'wallet', label: 'Wallet', icon: 'fas fa-wallet' },
  { id: 'collection', label: 'Collection', icon: 'fas fa-cubes' },
  { id: 'marketplace', label: 'Marketplace', icon: 'fas fa-store' }
];

const additionalTabs = [
  { id: 'referrals', label: 'Referrals', icon: 'fas fa-users' },
  { id: 'missions', label: 'Missions', icon: 'fas fa-tasks' },
  { id: 'achievements', label: 'Achievements', icon: 'fas fa-trophy' },
  { id: 'stats', label: 'Stats', icon: 'fas fa-chart-bar' }
];

// Combined tabs for desktop view
const tabs = computed(() => [...mainTabs, ...additionalTabs]);

// Get current tab label for mobile menu button
const getCurrentTabLabel = computed(() => {
  const currentTab = tabs.value.find(tab => tab.id === props.activeTab);
  return currentTab?.label || 'Menu';
});

// Avatar URL for template binding
const avatarUrl = computed(() => {
  // If we already loaded it asynchronously, use that
  if (playerAvatar.value) {
    return playerAvatar.value;
  }
  // Otherwise use the synchronous method (might be needed before async loading completes)
  return AvatarService.getPlayerAvatar(player.value);
});

// Principal ID
const truncatedPrincipal = computed(() => {
  const principal = authStore.getIdentity()?.getPrincipal().toString() || '';
  if (principal.length > 12) {
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  }
  return principal;
});

// Total NFTs
const totalNFTs = computed(() => {
  return Object.values(nftsStore.nftsByCategory).reduce((total, category) => {
    return total + (category?.length || 0);
  }, 0);
});

// Methods
const copyPrincipal = () => {
  const principal = authStore.getIdentity()?.getPrincipal().toString() || '';
  navigator.clipboard.writeText(principal);
  copySuccess.value = true;
  setTimeout(() => {
    copySuccess.value = false;
  }, 2000);
};

// Selection handler
const selectTab = (tabId) => {
  emit('update:activeTab', tabId);
};

// Mobile menu handlers
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<style scoped>
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

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
}

.mobile-menu-btn i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
}

.menu-label {
  font-weight: 500;
  font-size: 1rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .desktop-tabs {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .dashboard-header {
    padding: 1rem;
  }

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
    max-width: 140px;
  }

  .user-stats {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
    justify-content: space-around;
  }
}

@media (max-width: 480px) {
  .principal-value {
    max-width: 100px;
  }
  
  .user-stats {
    justify-content: center;
    gap: 2rem;
  }
}
</style> 