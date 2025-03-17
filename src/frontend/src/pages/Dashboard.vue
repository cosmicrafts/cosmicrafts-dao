<template>
  <div class="dashboard-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="cosmic-loader"></div>
      <p>{{ t('dashboard.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-triangle error-icon"></i>
      <p>{{ error }}</p>
      <button @click="fetchPlayerData" class="cosmic-button">
        {{ t('dashboard.retry') }}
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="welcome-container">
          <div class="welcome-avatar" :data-level="player?.level || 1">
            <img 
              :src="getAvatarUrl(avatarId)"
              :alt="username"
              @error="$event.target.src = avatar1"
            >
          </div>
          <div class="welcome-info">
            <h1>{{ username }}</h1>
            <p>{{ t('dashboard.welcome', { username }) }}</p>
            <div class="user-stats">
              <div class="user-stat">
                <span class="user-stat-label">{{ t('dashboard.stats.level') }}</span>
                <span class="user-stat-value">{{ player?.level || 1 }}</span>
              </div>
              <div class="user-stat">
                <span class="user-stat-label">{{ t('dashboard.stats.multiplier') }}</span>
                <span class="user-stat-value">{{ formatMultiplier(playerMultiplier) }}x</span>
              </div>
              <div class="user-stat">
                <span class="user-stat-label">{{ t('dashboard.stats.rank') }}</span>
                <span class="user-stat-value">{{ player?.title || 'Recruit' }}</span>
              </div>
            </div>
            <div class="principal-container">
              <span class="principal-label">{{ t('dashboard.principal') }}</span>
              <span class="principal-value">{{ formattedPrincipal }}</span>
              <button @click="copyPrincipal" class="copy-principal-btn">
                <i class="fas fa-copy"></i>
                <span v-if="copySuccess" class="copy-success">{{ t('dashboard.copied') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="dashboard-tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'overview' }"
          @click="setActiveTab('overview')"
        >
          <i class="fas fa-home"></i>
          <span>{{ t('dashboard.tabs.overview') }}</span>
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'referrals' }"
          @click="setActiveTab('referrals')"
        >
          <i class="fas fa-user-plus"></i>
          <span>{{ t('dashboard.tabs.referrals') }}</span>
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'rewards' }"
          @click="setActiveTab('rewards')"
        >
          <i class="fas fa-trophy"></i>
          <span>{{ t('dashboard.tabs.rewards') }}</span>
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'settings' }"
          @click="setActiveTab('settings')"
        >
          <i class="fas fa-cog"></i>
          <span>{{ t('dashboard.tabs.settings') }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-panel">
          <div class="stats-grid">
            <!-- Player Card -->
            <div class="stat-card player-card">
              <div class="player-avatar">
                <img 
                  :src="getAvatarUrl(avatarId)"
                  :alt="username"
                  @error="$event.target.src = avatar1"
                >
              </div>
              <div class="player-info">
                <h3>{{ username }}</h3>
                <div class="player-stats">
                  <div class="stat">
                    <span class="label">{{ t('dashboard.stats.level') }}</span>
                    <span class="value">{{ player?.level || 1 }}</span>
                  </div>
                  <div class="stat">
                    <span class="label">{{ t('dashboard.stats.multiplier') }}</span>
                    <span class="value">{{ formatMultiplier(playerMultiplier) }}x</span>
                  </div>
                  <div class="stat">
                    <span class="label">{{ t('dashboard.stats.rank') }}</span>
                    <span class="value">{{ player?.title || 'Recruit' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Referral Code Card -->
            <div class="stat-card" @click="setActiveTab('referrals')">
              <div class="card-icon">
                <i class="fas fa-link"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.referralCode.title') }}</h3>
                <div class="stat-value code-value">{{ formattedReferralCode }}</div>
                <p>{{ t('dashboard.cards.referralCode.shareToEarn') }}</p>
              </div>
            </div>

            <!-- Network Card -->
            <div class="stat-card" @click="setActiveTab('referrals')">
              <div class="card-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.network.title') }}</h3>
                <div class="stat-value">{{ totalReferralCount }}</div>
                <p>{{ t('dashboard.cards.network.totalReferrals') }}</p>
              </div>
            </div>

            <!-- Rewards Card -->
            <div class="stat-card" @click="setActiveTab('rewards')">
              <div class="card-icon">
                <i class="fas fa-gift"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.multiplierBonus.title') }}</h3>
                <div class="stat-value bonus-value">{{ calculateBonusPercentage(playerMultiplier) }}%</div>
                <p>{{ t('dashboard.cards.multiplierBonus.explanation') }}</p>
              </div>
            </div>
          </div>

          <!-- Referral Tiers Summary -->
          <div class="tiers-section">
            <h3>{{ t('dashboard.referrals.referralTiers') }}</h3>
            <div class="tiers-grid">
              <div class="tier-card direct-tier">
                <div class="tier-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="tier-content">
                  <h4>{{ t('dashboard.referrals.directReferrals') }}</h4>
                  <div class="tier-count">{{ directReferrals.length }}</div>
                  <div class="tier-info">
                    <div class="tier-bonus">{{ t(`dashboard.referrals.bonusLabels.direct.tier${getDirectTier(directReferrals.length)}`) }}</div>
                  </div>
                </div>
              </div>
              
              <div class="tier-card indirect-tier">
                <div class="tier-icon">
                  <i class="fas fa-project-diagram"></i>
                </div>
                <div class="tier-content">
                  <h4>{{ t('dashboard.referrals.indirectReferrals') }}</h4>
                  <div class="tier-count">{{ indirectReferrals.length }}</div>
                  <div class="tier-info">
                    <div class="tier-bonus">{{ t(`dashboard.referrals.bonusLabels.indirect.tier${getIndirectTier(indirectReferrals.length)}`) }}</div>
                  </div>
                </div>
              </div>
              
              <div class="tier-card beyond-tier">
                <div class="tier-icon">
                  <i class="fas fa-network-wired"></i>
                </div>
                <div class="tier-content">
                  <h4>{{ t('dashboard.referrals.beyondReferrals') }}</h4>
                  <div class="tier-count">{{ beyondReferrals.length }}</div>
                  <div class="tier-info">
                    <div class="tier-bonus">{{ t(`dashboard.referrals.bonusLabels.beyond.tier${getBeyondTier(beyondReferrals.length)}`) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Referrals -->
          <div class="activity-section">
            <h3>{{ t('dashboard.referrals.recentReferrals') }}</h3>
            <div class="activity-list" v-if="totalReferralCount > 0">
              <div class="activity-item" v-for="(referral, index) in getRecentReferrals(5)" :key="index">
                <div class="referral-avatar">
                  <img :src="getAvatarUrl(1)" :alt="referral.id">
                </div>
                <div class="activity-details">
                  <p class="activity-text">{{ formatReferralUsername(referral.id) }}</p>
                  <p class="activity-type">{{ t(`dashboard.referrals.referralTypes.${referral.type.toLowerCase()}`) }}</p>
                </div>
              </div>
            </div>
            <div class="empty-state" v-else>
              <i class="fas fa-user-plus empty-icon"></i>
              <p>{{ t('dashboard.referrals.noReferrals') }}</p>
              <p>{{ t('dashboard.referrals.shareYourCode') }}</p>
            </div>
          </div>
        </div>

        <!-- Referrals Tab -->
        <div v-if="activeTab === 'referrals'" class="tab-panel">
          <!-- Loading State -->
          <div v-if="isLoadingReferrals" class="loading-state">
            <div class="cosmic-loader"></div>
            <p>{{ t('dashboard.loadingReferrals') }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="referralError" class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>{{ referralError }}</p>
            <button @click="fetchReferralData" class="retry-button">
              {{ t('dashboard.retry') }}
            </button>
          </div>

          <!-- Referral Content -->
          <div v-else class="referral-content">
            <!-- Referral Code Card -->
            <div class="referral-code-card">
              <h3>{{ t('dashboard.yourReferralCode') }}</h3>
              <p>{{ t('dashboard.shareCodeSubtext') }}</p>
              
              <div class="referral-code-container">
                <div class="referral-code">{{ formattedReferralCode }}</div>
                <button @click="copyReferralCode" class="copy-button">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              
              <div class="social-share">
                <button class="social-button" @click="shareReferralCode('twitter')">
                  <i class="fab fa-twitter"></i>
                </button>
                <button class="social-button" @click="shareReferralCode('facebook')">
                  <i class="fab fa-facebook"></i>
                </button>
                <button class="social-button" @click="shareReferralCode('telegram')">
                  <i class="fab fa-telegram"></i>
                </button>
                <button class="social-button" @click="shareReferralCode('discord')">
                  <i class="fab fa-discord"></i>
                </button>
              </div>
            </div>

            <!-- Referral Stats -->
            <div class="referral-stats-grid">
              <!-- Multiplier Card -->
              <div class="stat-card multiplier-card">
                <div class="card-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="card-content">
                  <h3>{{ t('dashboard.multiplier') }}</h3>
                  <div class="stat-value">{{ formatMultiplier(playerMultiplier) }}x</div>
                  <p>{{ t('dashboard.multiplierSubtext') }}</p>
                </div>
              </div>

              <!-- Direct Referrals Card -->
              <div class="stat-card">
                <div class="card-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="card-content">
                  <h3>{{ t('dashboard.directReferrals') }}</h3>
                  <div class="stat-value">{{ directReferrals.length }}</div>
                  <p>{{ formatReferralCount(directReferrals.length, 'Direct') }}</p>
                </div>
              </div>

              <!-- Indirect Referrals Card -->
              <div class="stat-card">
                <div class="card-icon">
                  <i class="fas fa-project-diagram"></i>
                </div>
                <div class="card-content">
                  <h3>{{ t('dashboard.indirectReferrals') }}</h3>
                  <div class="stat-value">{{ indirectReferrals.length }}</div>
                  <p>{{ formatReferralCount(indirectReferrals.length, 'Indirect') }}</p>
                </div>
              </div>

              <!-- Beyond Referrals Card -->
              <div class="stat-card">
                <div class="card-icon">
                  <i class="fas fa-network-wired"></i>
                </div>
                <div class="card-content">
                  <h3>{{ t('dashboard.beyondReferrals') }}</h3>
                  <div class="stat-value">{{ beyondReferrals.length }}</div>
                  <p>{{ formatReferralCount(beyondReferrals.length, 'Extended') }}</p>
                </div>
              </div>
            </div>

            <!-- Referral Tree -->
            <div class="referral-tree-section">
              <h3>{{ t('dashboard.referralTree') }}</h3>
              <div class="referral-tree">
                <!-- Your Node -->
                <div class="tree-node root">
                  <div class="node-content">
                    <div class="node-avatar">
                      <img :src="getAvatarUrl(avatarId)" :alt="username">
                    </div>
                    <div class="node-info">
                      <p class="node-name">{{ username }}</p>
                      <p class="node-type">You</p>
                    </div>
                  </div>

                  <!-- Direct Referrals -->
                  <div class="tree-level" v-if="directReferrals.length">
                    <div v-for="referral in directReferrals" :key="referral" class="tree-node direct">
                      <div class="node-content">
                        <div class="node-avatar">
                          <img :src="getAvatarUrl(1)" :alt="referral">
                        </div>
                        <div class="node-info">
                          <p class="node-name">{{ referral }}</p>
                          <p class="node-type">Direct Referral</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Referral Lists -->
            <div class="referral-lists">
              <!-- Direct Referrals -->
              <div class="referral-section" v-if="directReferrals.length">
                <h3>{{ t('dashboard.directReferrals') }}</h3>
                <div class="referral-list">
                  <div v-for="referral in directReferrals" :key="referral" class="referral-item">
                    <div class="referral-avatar">
                      <img :src="getAvatarUrl(1)" :alt="referral">
                    </div>
                    <div class="referral-details">
                      <p class="referral-username">{{ referral }}</p>
                      <p class="referral-type">Direct Referral</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Indirect Referrals -->
              <div class="referral-section" v-if="indirectReferrals.length">
                <h3>{{ t('dashboard.indirectReferrals') }}</h3>
                <div class="referral-list">
                  <div v-for="referral in indirectReferrals" :key="referral" class="referral-item">
                    <div class="referral-avatar">
                      <img :src="getAvatarUrl(1)" :alt="referral">
                    </div>
                    <div class="referral-details">
                      <p class="referral-username">{{ referral }}</p>
                      <p class="referral-type">Indirect Referral</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Beyond Referrals -->
              <div class="referral-section" v-if="beyondReferrals.length">
                <h3>{{ t('dashboard.beyondReferrals') }}</h3>
                <div class="referral-list">
                  <div v-for="referral in beyondReferrals" :key="referral" class="referral-item">
                    <div class="referral-avatar">
                      <img :src="getAvatarUrl(1)" :alt="referral">
                    </div>
                    <div class="referral-details">
                      <p class="referral-username">{{ referral }}</p>
                      <p class="referral-type">Extended Referral</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!totalReferralCount" class="empty-state">
                <i class="fas fa-user-plus empty-icon"></i>
                <p>{{ t('dashboard.noReferrals') }}</p>
                <p>{{ t('dashboard.shareYourCode') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rewards Tab -->
        <div v-if="activeTab === 'rewards'" class="tab-panel">
          <div class="coming-soon">
            <i class="fas fa-trophy"></i>
            <h3>{{ t('dashboard.rewards.comingSoon') }}</h3>
            <p>{{ t('dashboard.rewards.stayTuned') }}</p>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-panel">
          <div class="coming-soon">
            <i class="fas fa-tools"></i>
            <h3>{{ t('dashboard.settings.comingSoon') }}</h3>
            <p>{{ t('dashboard.settings.checkBackLater') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';
import Login from '@/components/Login.vue';
import { useCanisterStore } from '@/stores/canister';

// Import avatars
import avatar1 from '@/assets/avatars/Avatar_01.webp';
import avatar2 from '@/assets/avatars/Avatar_02.webp';
import avatar3 from '@/assets/avatars/Avatar_03.webp';
import avatar4 from '@/assets/avatars/Avatar_04.webp';
import avatar5 from '@/assets/avatars/Avatar_05.webp';
import avatar6 from '@/assets/avatars/Avatar_06.webp';
import avatar7 from '@/assets/avatars/Avatar_07.webp';
import avatar8 from '@/assets/avatars/Avatar_08.webp';
import avatar9 from '@/assets/avatars/Avatar_09.webp';
import avatar10 from '@/assets/avatars/Avatar_10.webp';
import avatar11 from '@/assets/avatars/Avatar_11.webp';
import avatar12 from '@/assets/avatars/Avatar_12.webp';

// Avatar array
const avatarSrcArray = [
  avatar1, avatar2, avatar3, avatar4,
  avatar5, avatar6, avatar7, avatar8,
  avatar9, avatar10, avatar11, avatar12
];

// Store access
const authStore = useAuthStore();
const modalStore = useModalStore();
const router = useRouter();
const { t } = useI18n();

// User data
const player = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Dashboard state
const activeTab = ref('overview');
const activeReferralTab = ref('direct');

// Referral state
const directReferrals = ref([]);
const indirectReferrals = ref([]);
const beyondReferrals = ref([]);
const userReferralCode = ref('');
const referralNetwork = ref(null);
const isLoadingReferrals = ref(false);
const referralError = ref(null);

// Add new state for multiplier
const playerMultiplier = ref(1.0);

// Principal ID utilities
const copySuccess = ref(false);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated());
const username = computed(() => player.value?.username || 'Player');
const avatarId = computed(() => player.value?.avatar || 1);
const referrals = computed(() => player.value?.referrals || []);
const referralCount = computed(() => referrals.value.length || 0);
const totalReferralCount = computed(() => {
  return directReferrals.value.length + 
         indirectReferrals.value.length + 
         beyondReferrals.value.length;
});
const formattedReferralCode = computed(() => {
  return userReferralCode.value || t('dashboard.noReferralCode');
});
const totalPoints = computed(() => {
  // Calculate total points from player data
  return player.value?.points || 0;
});
const formattedPrincipal = computed(() => {
  try {
    const principal = authStore.getIdentity().getPrincipal().toText();
    if (principal.length <= 10) return principal;
    return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
  } catch (error) {
    console.error('Error formatting principal:', error);
    return '';
  }
});

// Add a function to get avatar URL
const getAvatarUrl = (id) => {
  const index = (Number(id) - 1) % avatarSrcArray.length;
  return avatarSrcArray[index] || avatar1;
};

// Handle authentication
const checkAuth = async () => {
  if (!isAuthenticated.value) {
    console.log('User not authenticated, opening login modal');
    modalStore.openModal(Login);
    return false;
  }
  return true;
};

// Fetch player data
const fetchPlayerData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // If player data is already in the store, use it
    if (authStore.player) {
      player.value = authStore.player;
    } else {
      // Otherwise try to fetch it
      const userData = await authStore.getPlayerByPrincipal(authStore.getIdentity().getPrincipal());
      player.value = userData;
    }
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching player data:', err);
    error.value = 'Failed to load player data';
    isLoading.value = false;
  }
};

// Format multiplier to 2 decimal places
const formatMultiplier = (value) => {
  return Number(value).toFixed(2);
};

// Update fetchReferralData to include multiplier
const fetchReferralData = async () => {
  if (!authStore.isAuthenticated()) return;
  
  isLoadingReferrals.value = true;
  referralError.value = null;
  
  try {
    const canister = useCanisterStore();
    const cosmicrafts = await canister.get('cosmicrafts');
    
    if (!cosmicrafts) {
      throw new Error('Canister not initialized');
    }

    const principal = authStore.getIdentity().getPrincipal();

    // Fetch all referral data in parallel
    const [
      referralCode,
      network,
      direct,
      indirect,
      beyond,
      multiplier
    ] = await Promise.all([
      cosmicrafts.getReferralCode(principal),
      cosmicrafts.getTotalReferralNetwork(principal),
      cosmicrafts.getDirectReferrals(principal),
      cosmicrafts.getIndirectReferrals(principal),
      cosmicrafts.getBeyondReferrals(principal),
      cosmicrafts.getMultiplier(principal)
    ]);

    // Update state with fetched data
    userReferralCode.value = referralCode?.[0] || '';
    referralNetwork.value = network;
    directReferrals.value = direct || [];
    indirectReferrals.value = indirect || [];
    beyondReferrals.value = beyond || [];
    playerMultiplier.value = multiplier;

    console.log('Referral data loaded:', {
      code: userReferralCode.value,
      network: referralNetwork.value,
      direct: directReferrals.value,
      indirect: indirectReferrals.value,
      beyond: beyondReferrals.value,
      multiplier: playerMultiplier.value
    });

  } catch (err) {
    console.error('Error fetching referral data:', err);
    referralError.value = 'Failed to load referral data';
  } finally {
    isLoadingReferrals.value = false;
  }
};

// Format referral count with tier
const formatReferralCount = (count, tier) => {
  return `${count} ${tier} ${count === 1 ? 'Referral' : 'Referrals'}`;
};

// Share referral code
const shareReferralCode = async (platform) => {
  const shareText = t('dashboard.referrals.shareMessage', { 
    code: userReferralCode.value 
  });
  const shareUrl = 'https://cosmicrafts.com';

  const shareData = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    discord: 'https://discord.com/invite/cosmicrafts-884272584491941888'
  };

  try {
    window.open(shareData[platform], '_blank');
    // Could add a success notification here
  } catch (err) {
    console.error('Failed to share:', err);
    // Could add an error notification here
  }
};

// Copy referral code to clipboard
const copyReferralCode = () => {
  if (!userReferralCode.value) return;
  
  navigator.clipboard.writeText(userReferralCode.value)
    .then(() => {
      alert(t('dashboard.notifications.referralCodeCopied'));
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
      alert(t('dashboard.notifications.error.failedToCopy'));
    });
};

// Copy principal ID to clipboard
const copyPrincipal = () => {
  try {
    const principal = authStore.getIdentity().getPrincipal().toText();
    navigator.clipboard.writeText(principal)
      .then(() => {
        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy principal ID: ', err);
        alert(t('dashboard.notifications.error.failedToCopy'));
      });
  } catch (err) {
    console.error('Error getting principal ID:', err);
  }
};

// Tab handling
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// Lifecycle hooks
onMounted(async () => {
  if (await checkAuth()) {
    await Promise.all([
      fetchPlayerData(),
      fetchReferralData()
    ]);
  }
});

// Watch for changes in auth state
watch(() => authStore.player, (newVal) => {
  if (newVal) {
    player.value = newVal;
  }
});

// Calculate bonus percentage from multiplier
const calculateBonusPercentage = (multiplier) => {
  // Multiplier of 1.0 means 0% bonus, anything above is a percentage
  return Math.round((multiplier - 1.0) * 100);
};

// Format bonus values for each tier based on the backend calculation rules
const formatDirectBonus = (count) => {
  if (count <= 3) return '100';
  if (count <= 10) return '50';
  if (count <= 25) return '25';
  return '10';
};

const formatIndirectBonus = (count) => {
  if (count <= 25) return '25';
  if (count <= 50) return '10';
  return '5';
};

const formatBeyondBonus = (count) => {
  if (count <= 25) return '10';
  if (count <= 100) return '5';
  return '1';
};

// Get a formatted display of recent referrals from all tiers
const getRecentReferrals = (limit) => {
  const all = [
    ...directReferrals.value.map(id => ({ id, type: 'Direct' })),
    ...indirectReferrals.value.map(id => ({ id, type: 'Indirect' })),
    ...beyondReferrals.value.map(id => ({ id, type: 'Extended' }))
  ];
  
  // Sort by recent first (we don't have timestamps, so this is simulated)
  return all.slice(0, limit);
};

// Format referral principal ID to a friendly username
const formatReferralUsername = (principal) => {
  // Extract a shorter version of the principal for display
  // In a real scenario, you might want to fetch the actual username
  return principal.toString().substring(0, 10) + '...';
};

// Add helper functions for tier determination
const getDirectTier = (count) => {
  if (count <= 3) return '1';
  if (count <= 10) return '2';
  if (count <= 25) return '3';
  return '4';
};

const getIndirectTier = (count) => {
  if (count <= 25) return '1';
  if (count <= 50) return '2';
  return '3';
};

const getBeyondTier = (count) => {
  if (count <= 25) return '1';
  if (count <= 100) return '2';
  return '3';
};
</script>

<style scoped>
/* Dashboard Page Layout */
.dashboard-page {
  padding-top: 7rem; /* Account for header height + some spacing */
  min-height: 100vh;
  background: var(--cosmic-bg-dark, #0a1018);
  color: var(--cosmic-text-primary, #ffffff);
  font-family: var(--cosmic-font-family, 'Inter', sans-serif);
  position: relative;
  overflow: hidden;
}

/* Cosmic Background Elements */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.cosmic-accent-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.top-left-glow {
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(15, 154, 255, 0.4) 0%, rgba(15, 154, 255, 0) 70%);
}

.bottom-right-glow {
  bottom: -10%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(155, 89, 182, 0.3) 0%, rgba(155, 89, 182, 0) 70%);
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.floating-element {
  position: absolute;
  width: 150px;
  height: 150px;
  opacity: 0.1;
  transform: translateZ(var(--depth)) rotate(var(--rotation));
  animation: float 15s infinite ease-in-out;
  animation-delay: var(--delay);
}

.element-particles {
  position: relative;
  width: 100%;
  height: 100%;
}

.element-particles span {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(15, 154, 255, 0.8), 0 0 20px rgba(15, 154, 255, 0.4);
}

.element-particles span:nth-child(1) {
  top: 20%;
  left: 20%;
  animation: twinkle 4s infinite ease-in-out;
}

.element-particles span:nth-child(2) {
  top: 60%;
  left: 80%;
  animation: twinkle 6s infinite ease-in-out;
  animation-delay: 1s;
}

.element-particles span:nth-child(3) {
  top: 80%;
  left: 40%;
  animation: twinkle 5s infinite ease-in-out;
  animation-delay: 2s;
}

.element-particles span:nth-child(4) {
  top: 30%;
  left: 60%;
  animation: twinkle 7s infinite ease-in-out;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateZ(var(--depth)) rotate(var(--rotation));
  }
  50% {
    transform: translateY(-20px) translateZ(var(--depth)) rotate(calc(var(--rotation) + 5deg));
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Dashboard Content - make sure it's above the background */
.dashboard-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
}

.cosmic-loader {
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(0, 140, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--cosmic-blue, #0f9aff);
  animation: spin 1s infinite ease-in-out;
}

.error-icon {
  font-size: 3rem;
  color: var(--cosmic-red, #ff3a5e);
  margin-bottom: 1rem;
}

/* Dashboard Header */
.dashboard-header {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--cosmic-glass-bg, rgba(25, 35, 45, 0.6));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.1));
  box-shadow: var(--cosmic-shadow-sm, 0 4px 6px rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.welcome-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.welcome-avatar {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
}

.welcome-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid var(--cosmic-blue-light, #61c8ff);
  box-shadow: var(--cosmic-glow-blue-sm, 0 0 8px rgba(15, 154, 255, 0.4));
}

.welcome-avatar::after {
  content: attr(data-level);
  position: absolute;
  bottom: -0.5rem;
  right: -0.5rem;
  background: linear-gradient(135deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.welcome-info {
  flex: 1;
}

.welcome-message h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.welcome-message p {
  color: var(--cosmic-text-secondary, #bdc3c7);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.user-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
}

.user-stat {
  display: flex;
  flex-direction: column;
}

.user-stat-label {
  font-size: 0.75rem;
  color: var(--cosmic-text-secondary, #bdc3c7);
  margin-bottom: 0.25rem;
}

.user-stat-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.multiplier-value {
  color: var(--cosmic-green, #00c853);
}

.principal-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  max-width: fit-content;
}

.principal-label {
  font-size: 0.75rem;
  color: var(--cosmic-text-secondary, #bdc3c7);
}

.principal-value {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--cosmic-blue-light, #61c8ff);
}

.copy-principal-btn {
  background: rgba(15, 154, 255, 0.1);
  border: 1px solid rgba(15, 154, 255, 0.2);
  color: var(--cosmic-blue, #0f9aff);
  border-radius: 4px;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-principal-btn:hover {
  background: rgba(15, 154, 255, 0.2);
}

.copy-success {
  position: absolute;
  background: var(--cosmic-green, #00c853);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  top: -2rem;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}

/* Tab Navigation */
.dashboard-tabs {
  display: flex;
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  background: var(--cosmic-glass-bg, rgba(25, 35, 45, 0.6));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: var(--cosmic-shadow-sm, 0 4px 6px rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dashboard-tabs::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome/Safari */
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary, #bdc3c7);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 8px;
}

.tab-button i {
  font-size: 1rem;
}

.tab-button.active {
  color: var(--cosmic-blue, #0f9aff);
  background: rgba(15, 154, 255, 0.1);
}

.tab-button:hover:not(.active) {
  color: var(--cosmic-text-primary, #ffffff);
  background: rgba(255, 255, 255, 0.05);
}

/* Tab Content */
.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
  background: var(--cosmic-glass-bg, rgba(25, 35, 45, 0.6));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--cosmic-shadow-sm, 0 4px 6px rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15), 0 0 8px rgba(15, 154, 255, 0.4);
  border-color: rgba(15, 154, 255, 0.3);
}

.stat-card:hover::before {
  opacity: 1;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--cosmic-blue-light, #61c8ff);
  box-shadow: 0 0 8px rgba(15, 154, 255, 0.4);
  flex-shrink: 0;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-info {
  flex: 1;
}

.player-info h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
  background: linear-gradient(to right, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.player-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat .label {
  font-size: 0.7rem;
  color: var(--cosmic-text-secondary, #bdc3c7);
  margin-bottom: 0.25rem;
}

.stat .value {
  font-size: 1rem;
  font-weight: 700;
}

.card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(15, 154, 255, 0.15), rgba(155, 89, 182, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--cosmic-blue, #0f9aff);
  margin-bottom: 1rem;
}

.card-content h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.code-value {
  font-family: monospace;
  letter-spacing: 1px;
}

.bonus-value {
  background: linear-gradient(135deg, #00ff87, #60efff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.card-content p {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary, #bdc3c7);
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* Activity Section */
.activity-section, 
.referral-list-section,
.tiers-section {
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.activity-section h3,
.referral-list-section h3,
.tiers-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
}

.activity-section h3::after,
.referral-list-section h3::after,
.tiers-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  border-radius: 3px;
}

.activity-list,
.referral-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item,
.referral-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.activity-item:hover,
.referral-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(15, 154, 255, 0.2);
  transform: translateX(5px);
}

.activity-icon,
.referral-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.activity-icon {
  background: linear-gradient(135deg, rgba(15, 154, 255, 0.15), rgba(155, 89, 182, 0.15));
  color: var(--cosmic-blue, #0f9aff);
  font-size: 1rem;
}

.referral-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(15, 154, 255, 0.3);
}

.activity-details,
.referral-details {
  flex: 1;
}

.activity-text,
.referral-username {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.activity-time,
.referral-date {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary, #bdc3c7);
}

.activity-type,
.referral-type {
  font-size: 0.75rem;
  color: var(--cosmic-blue, #0f9aff);
  background: rgba(15, 154, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.25rem;
}

.activity-points,
.referral-points {
  font-weight: 700;
  color: var(--cosmic-blue, #0f9aff);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(15, 154, 255, 0.1);
}

/* Tiers Grid */
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tier-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tier-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
}

.direct-tier:hover {
  border-color: rgba(0, 255, 135, 0.3);
  box-shadow: 0 5px 15px rgba(0, 255, 135, 0.1);
}

.indirect-tier:hover {
  border-color: rgba(96, 239, 255, 0.3);
  box-shadow: 0 5px 15px rgba(96, 239, 255, 0.1);
}

.beyond-tier:hover {
  border-color: rgba(155, 89, 182, 0.3);
  box-shadow: 0 5px 15px rgba(155, 89, 182, 0.1);
}

.tier-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.direct-tier .tier-icon {
  background: rgba(0, 255, 135, 0.1);
  color: #00ff87;
}

.indirect-tier .tier-icon {
  background: rgba(96, 239, 255, 0.1);
  color: #60efff;
}

.beyond-tier .tier-icon {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.tier-content h4 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.tier-count {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.direct-tier .tier-count {
  color: #00ff87;
}

.indirect-tier .tier-count {
  color: #60efff;
}

.beyond-tier .tier-count {
  color: #9b59b6;
}

.tier-bonus {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.direct-tier .tier-bonus {
  background: rgba(0, 255, 135, 0.1);
  color: #00ff87;
}

.indirect-tier .tier-bonus {
  background: rgba(96, 239, 255, 0.1);
  color: #60efff;
}

.beyond-tier .tier-bonus {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

/* Referral Code Card */
.referral-code-card {
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.referral-code-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(15, 154, 255, 0.1), transparent 70%);
  pointer-events: none;
}

.referral-code-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  background: linear-gradient(to right, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.referral-code-card p {
  color: var(--cosmic-text-secondary, #bdc3c7);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.referral-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.referral-code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 1.2rem;
  letter-spacing: 2px;
  color: var(--cosmic-blue-light, #61c8ff);
  border: 1px solid rgba(15, 154, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.referral-code::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  animation: shimmer 3s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) rotate(30deg);
  }
}

.copy-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: rgba(15, 154, 255, 0.1);
  border: 1px solid rgba(15, 154, 255, 0.2);
  color: var(--cosmic-blue, #0f9aff);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  background: rgba(15, 154, 255, 0.2);
  transform: translateY(-2px);
}

.social-share {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary, #bdc3c7);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-button:hover {
  background: rgba(15, 154, 255, 0.1);
  color: var(--cosmic-blue, #0f9aff);
  transform: translateY(-2px);
  border-color: rgba(15, 154, 255, 0.2);
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--cosmic-text-secondary, #bdc3c7);
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
  background: linear-gradient(135deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.empty-state p {
  margin-bottom: 0.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state p:last-child {
  font-weight: 500;
  color: var(--cosmic-blue-light, #61c8ff);
}

/* Coming Soon */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(25, 35, 45, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.coming-soon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(15, 154, 255, 0.05), transparent 70%);
  pointer-events: none;
}

.coming-soon i {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.8;
  animation: pulse 3s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.coming-soon h3 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
  background: linear-gradient(to right, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.coming-soon p {
  color: var(--cosmic-text-secondary, #bdc3c7);
  max-width: 500px;
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.6;
}

/* Loading and Error States */
.loading-container,
.error-container,
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
  text-align: center;
}

.loading-state,
.error-state {
  min-height: 300px;
}

.cosmic-loader {
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(0, 140, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--cosmic-blue, #0f9aff);
  animation: spin 1s infinite ease-in-out;
  position: relative;
}

.cosmic-loader::before,
.cosmic-loader::after {
  content: '';
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: rgba(155, 89, 182, 0.5);
  animation: spin 1.5s infinite ease-in-out reverse;
}

.cosmic-loader::after {
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-top-color: rgba(15, 154, 255, 0.3);
  animation: spin 2s infinite ease-in-out;
}

.error-icon {
  font-size: 3rem;
  color: var(--cosmic-red, #ff3a5e);
  margin-bottom: 1rem;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .dashboard-page {
    padding-top: 6rem;
  }

  .welcome-container {
    flex-direction: column;
    text-align: center;
  }

  .welcome-avatar {
    margin: 0 auto 1rem;
  }

  .welcome-message h1 {
    font-size: 1.5rem;
  }

  .user-stats {
    justify-content: center;
  }

  .principal-container {
    margin: 1rem auto 0;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tab-button {
    padding: 0.75rem 1rem;
  }

  .tab-button span {
    display: none;
  }

  .tab-button i {
    font-size: 1.25rem;
  }

  .referral-code {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }

  .tiers-grid {
    grid-template-columns: 1fr;
  }
  
  .tier-card {
    flex-direction: row;
    align-items: center;
  }
  
  .tier-content {
    flex: 1;
  }

  .referral-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .referral-item {
    flex-direction: column;
    text-align: center;
  }
  
  .referral-avatar {
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
  }

  .tree-level {
    gap: 1rem;
  }

  .node-content {
    min-width: 150px;
    padding: 0.75rem;
  }

  .node-avatar {
    width: 36px;
    height: 36px;
  }

  .coming-soon i {
    font-size: 2.5rem;
  }

  .coming-soon h3 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-tabs {
    justify-content: space-between;
  }

  .tab-button {
    padding: 0.75rem;
    flex: 1;
    justify-content: center;
  }

  .referral-code-container {
    flex-direction: column;
  }

  .referral-code {
    width: 100%;
  }

  .social-share {
    flex-wrap: wrap;
  }
}

/* Referral Content */
.referral-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.referral-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.referral-section {
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.referral-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
}

.referral-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, var(--cosmic-blue, #0f9aff), var(--cosmic-purple, #9b59b6));
  border-radius: 3px;
}

.referral-lists {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Referral Tree */
.referral-tree-section {
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.referral-tree {
  padding: 2rem 1rem;
  overflow-x: auto;
}

.tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.tree-level {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.node-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
  border: 1px solid rgba(15, 154, 255, 0.2);
  position: relative;
  transition: all 0.2s ease;
}

.node-content:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-3px);
}

.node-content::before {
  content: '';
  position: absolute;
  top: -1rem;
  left: 50%;
  width: 2px;
  height: 1rem;
  background: rgba(15, 154, 255, 0.2);
  transform: translateX(-50%);
}

.root > .node-content {
  background: rgba(15, 154, 255, 0.1);
  border-color: rgba(15, 154, 255, 0.4);
}

.root > .node-content::before {
  display: none;
}

.node-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--cosmic-blue-light, #61c8ff);
  box-shadow: 0 0 8px rgba(15, 154, 255, 0.4);
}

.node-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.node-info {
  flex: 1;
}

.node-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.node-type {
  font-size: 0.8rem;
  color: var(--cosmic-blue, #0f9aff);
  background: rgba(15, 154, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

/* Multiplier Card */
.multiplier-card .stat-value {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #00ff87, #60efff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style>