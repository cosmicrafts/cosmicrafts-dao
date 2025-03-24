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
      <!-- 
        STICKY FEATURE: Personal Identity
        Avatar and welcome message create a personalized experience that
        makes users feel recognized and valued.
      -->
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
            <!-- 
              STICKY FEATURE: Web3 Identity
              Blockchain principal ID creates a bridge between social and web3 identities.
            -->
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

      <!-- 
        STICKY FEATURE: Multi-faceted Engagement
        Tabs offer diverse ways to engage with the platform,
        catering to different user motivations.
      -->
      <div class="dashboard-tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'analytics' }"
          @click="setActiveTab('analytics')"
        >
          <i class="fas fa-chart-line"></i>
          <span>{{ t('dashboard.tabs.analytics') }}</span>
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
        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'" class="tab-panel">
          <!-- 
            STICKY FEATURE: Achievement Metrics
            Stats and performance metrics quantify success and progress,
            creating a sense of accomplishment and investment.
          -->
          <div class="stats-grid">
            <!-- Engagement Analytics Card -->
            <div class="stat-card engagement-card">
              <div class="card-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.engagement.title') }}</h3>
                <div class="stat-value">{{ engagementStats.postCount }}</div>
                <p>{{ t('dashboard.cards.engagement.posts') }}</p>
                <div class="stat-detail-row">
                  <div class="stat-detail">
                    <span class="detail-icon">❤️</span>
                    <span class="detail-value">{{ engagementStats.totalLikes }}</span>
                    <span class="detail-label">{{ t('dashboard.cards.engagement.likes') }}</span>
                  </div>
                  <div class="stat-detail">
                    <span class="detail-icon">💬</span>
                    <span class="detail-value">{{ engagementStats.totalComments }}</span>
                    <span class="detail-label">{{ t('dashboard.cards.engagement.comments') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Post Reach Analytics Card -->
            <div class="stat-card reach-card">
              <div class="card-icon">
                <i class="fas fa-bullseye"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.reach.title') }}</h3>
                <div class="stat-value">{{ engagementStats.totalViews }}</div>
                <p>{{ t('dashboard.cards.reach.views') }}</p>
                <div class="chart-container">
                  <div class="chart-bar" v-for="(item, i) in reachData" :key="i">
                    <div class="bar-fill" :style="{ height: `${item.value}%` }"></div>
                    <div class="bar-label">{{ item.label }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Performance Card -->
            <div class="stat-card performance-card">
              <div class="card-icon">
                <i class="fas fa-rocket"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.performance.title') }}</h3>
                <div class="performance-metric">
                  <div class="metric-label">{{ t('dashboard.cards.performance.bestPost') }}</div>
                  <div class="metric-value">{{ topPost.likes }} {{ t('dashboard.cards.performance.likes') }}</div>
                  <div class="post-preview">
                    <p class="post-preview-text">{{ truncateText(topPost.content, 60) }}</p>
                  </div>
                </div>
                <div class="performance-metric">
                  <div class="metric-label">{{ t('dashboard.cards.performance.engagement') }}</div>
                  <div class="metric-value">{{ engagementStats.engagementRate }}%</div>
                </div>
              </div>
            </div>

            <!-- Network Growth Card -->
            <div class="stat-card network-card">
              <div class="card-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="card-content">
                <h3>{{ t('dashboard.cards.network.title') }}</h3>
                <div class="stat-value">{{ networkStats.totalFollowers }}</div>
                <p>{{ t('dashboard.cards.network.followers') }}</p>
                <div class="chart-container">
                  <div class="trend-chart">
                    <div class="trend-point" v-for="(point, i) in growthData" :key="i"
                      :style="{ bottom: `${point}%`, left: `${i * (100 / (growthData.length - 1))}%` }">
                    </div>
                    <div class="trend-line"></div>
                  </div>
                  <div class="trend-labels">
                    <span>{{ networkStats.followerGrowth >= 0 ? '+' : '' }}{{ networkStats.followerGrowth }}</span>
                    <span>{{ t('dashboard.cards.network.lastMonth') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 
            STICKY FEATURE: Activity Timeline
            Recent activity shows platform engagement, creating FOMO
            and encouraging further interactions.
          -->
          <div class="activity-section">
            <h3>{{ t('dashboard.recentActivity') }}</h3>
            <div class="activity-filter">
              <button 
                v-for="filter in ['all', 'posts', 'likes', 'comments']" 
                :key="filter"
                :class="{ active: activityFilter === filter }"
                @click="activityFilter = filter"
                class="filter-btn"
              >
                {{ t(`dashboard.activity.filter.${filter}`) }}
              </button>
            </div>
            <div class="activity-timeline">
              <div v-for="(activity, index) in filteredActivities" :key="index" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-text" v-html="formatActivityText(activity)"></div>
                  <div class="activity-time">{{ formatActivityTime(activity.timestamp) }}</div>
                </div>
                <div class="activity-action">
                  <button class="view-btn" @click="navigateToPost(activity.target.id)">
                    <i class="fas fa-external-link-alt"></i>
                  </button>
                </div>
              </div>
              <div v-if="filteredActivities.length === 0" class="empty-activity">
                <i class="fas fa-history empty-icon"></i>
                <p>{{ t('dashboard.activity.empty') }}</p>
              </div>
            </div>
            <div v-if="filteredActivities.length > 0" class="load-more-container">
              <button class="load-more-btn" @click="loadMoreActivities">
                {{ t('dashboard.loadMore') }}
              </button>
            </div>
          </div>

          <!-- 
            STICKY FEATURE: Growth Guidance
            Tips provide clear next steps for users to improve, keeping them engaged.
          -->
          <div class="tips-section">
            <h3>{{ t('dashboard.growthTips.title') }}</h3>
            <div class="tips-grid">
              <div class="tip-card" v-for="(tip, index) in growthTips" :key="index">
                <div class="tip-icon">
                  <i :class="tip.icon"></i>
                </div>
                <div class="tip-content">
                  <h4>{{ tip.title }}</h4>
                  <p>{{ tip.description }}</p>
                </div>
              </div>
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
            <!-- 
              STICKY FEATURE: Network Building (Virality)
              Referral codes create viral growth loops by incentivizing users to invite others.
            -->
            <div class="referral-code-card">
              <h3>{{ t('dashboard.yourReferralCode') }}</h3>
              <p>{{ t('dashboard.shareCodeSubtext') }}</p>
              
              <div class="referral-code-container">
                <div class="referral-code">{{ formattedReferralCode }}</div>
                <button @click="copyReferralCode" class="copy-button">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              
              <!-- 
                STICKY FEATURE: Cross-Platform Sharing
                Social share buttons make it easy to spread referrals across other platforms.
              -->
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

            <!-- 
              STICKY FEATURE: Reward Incentives
              Multiplier and referral stats create motivation to build network for rewards.
            -->
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

            <!-- 
              STICKY FEATURE: Network Visualization
              Referral tree visualization creates pride in network growth.
            -->
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

            <!-- 
              STICKY FEATURE: Community Growth
              Referral lists showcase the user's impact on platform growth.
            -->
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

        <!-- 
          STICKY FEATURE: Future Engagement Hooks
          Coming soon sections create anticipation for future features.
        -->
        <div v-if="activeTab === 'rewards'" class="tab-panel">
          <div class="coming-soon">
            <i class="fas fa-trophy"></i>
            <h3>{{ t('dashboard.rewards.comingSoon') }}</h3>
            <p>{{ t('dashboard.rewards.stayTuned') }}</p>
          </div>
        </div>

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
const activeTab = ref('analytics');
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

// Add social media engagement stats (mock data for now)
const engagementStats = ref({
  postCount: 42,
  totalLikes: 384,
  totalComments: 128,
  totalViews: 2547,
  engagementRate: 8.2
});

// Network stats
const networkStats = ref({
  totalFollowers: 156,
  followerGrowth: 23,
  following: 89
});

// Top performing post
const topPost = ref({
  id: 'post1',
  content: 'Just discovered an amazing new strategy in #CosmicCrafts that boosted my resource collection by 200%!',
  likes: 54,
  comments: 12
});

// Chart data
const reachData = ref([
  { label: 'Mon', value: 45 },
  { label: 'Tue', value: 60 },
  { label: 'Wed', value: 75 },
  { label: 'Thu', value: 65 },
  { label: 'Fri', value: 85 },
  { label: 'Sat', value: 90 },
  { label: 'Sun', value: 70 }
]);

const growthData = ref([20, 25, 30, 35, 45, 50, 65]);

// Activity data
const activityFilter = ref('all');
const userActivities = ref([
  {
    id: 'act1',
    type: 'post',
    timestamp: Date.now() - 2 * 3600000,
    actor: { id: 'self', name: 'You' },
    target: { id: 'post1', content: 'Just hit level 100 in the game! #Milestone' }
  },
  {
    id: 'act2',
    type: 'like',
    timestamp: Date.now() - 5 * 3600000,
    actor: { id: 'user1', name: 'CosmicChampion' },
    target: { id: 'post1', content: 'Just hit level 100 in the game! #Milestone' }
  },
  {
    id: 'act3',
    type: 'comment',
    timestamp: Date.now() - 8 * 3600000,
    actor: { id: 'user2', name: 'GalacticWarrior' },
    target: { id: 'post1', content: 'Just hit level 100 in the game! #Milestone' },
    data: { comment: 'Congratulations! That\'s impressive!' }
  },
  {
    id: 'act4',
    type: 'post',
    timestamp: Date.now() - 24 * 3600000,
    actor: { id: 'self', name: 'You' },
    target: { id: 'post2', content: 'Looking for team members for the upcoming tournament!' }
  },
  {
    id: 'act5',
    type: 'comment',
    timestamp: Date.now() - 30 * 3600000,
    actor: { id: 'user3', name: 'StarDestroyer' },
    target: { id: 'post2', content: 'Looking for team members for the upcoming tournament!' },
    data: { comment: 'I\'d like to join! My character is level as well.' }
  }
]);

// Growth tips
const growthTips = ref([
  {
    icon: 'fas fa-calendar-day',
    title: t('dashboard.growthTips.consistency'),
    description: t('dashboard.growthTips.consistencyDesc')
  },
  {
    icon: 'fas fa-hashtag',
    title: t('dashboard.growthTips.hashtags'),
    description: t('dashboard.growthTips.hashtagsDesc')
  },
  {
    icon: 'fas fa-comment-dots',
    title: t('dashboard.growthTips.engage'),
    description: t('dashboard.growthTips.engageDesc')
  },
  {
    icon: 'fas fa-users',
    title: t('dashboard.growthTips.collaborate'),
    description: t('dashboard.growthTips.collaborateDesc')
  }
]);

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

// Computed for filtered activities
const filteredActivities = computed(() => {
  if (activityFilter.value === 'all') {
    return userActivities.value;
  }
  return userActivities.value.filter(activity => activity.type === activityFilter.value);
});

// Helper methods
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'post': return 'fas fa-pen';
    case 'like': return 'fas fa-heart';
    case 'comment': return 'fas fa-comment';
    case 'follow': return 'fas fa-user-plus';
    default: return 'fas fa-star';
  }
};

const formatActivityText = (activity) => {
  const actorName = `<span class="actor-name">${activity.actor.name}</span>`;
  
  switch (activity.type) {
    case 'post':
      if (activity.actor.id === 'self') {
        return `${t('dashboard.activity.youPosted')} "${truncateText(activity.target.content, 40)}"`;
      }
      return `${actorName} ${t('dashboard.activity.posted')} "${truncateText(activity.target.content, 40)}"`;
    
    case 'like':
      if (activity.actor.id === 'self') {
        return `${t('dashboard.activity.youLiked')} "${truncateText(activity.target.content, 40)}"`;
      }
      return `${actorName} ${t('dashboard.activity.liked')} "${truncateText(activity.target.content, 40)}"`;
    
    case 'comment':
      if (activity.actor.id === 'self') {
        return `${t('dashboard.activity.youCommented')} "${truncateText(activity.data.comment, 40)}" ${t('dashboard.activity.on')} "${truncateText(activity.target.content, 30)}"`;
      }
      return `${actorName} ${t('dashboard.activity.commented')} "${truncateText(activity.data.comment, 40)}" ${t('dashboard.activity.on')} "${truncateText(activity.target.content, 30)}"`;
    
    default:
      return `${actorName} ${t('dashboard.activity.interacted')} "${truncateText(activity.target.content, 40)}"`;
  }
};

const formatActivityTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  
  // Convert to seconds, minutes, hours, and days
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffSec < 60) {
    return t('dashboard.time.justNow');
  } else if (diffMin < 60) {
    return `${diffMin}${t('dashboard.time.min')}`;
  } else if (diffHrs < 24) {
    return `${diffHrs}${t('dashboard.time.hr')}`;
  } else if (diffDays < 7) {
    return `${diffDays}${t('dashboard.time.day')}`;
  } else {
    return date.toLocaleDateString();
  }
};

const loadMoreActivities = () => {
  // TODO: Implement loading more activities from the backend
  // For now, just add a few more mock activities
  userActivities.value.push(
    {
      id: 'act' + (userActivities.value.length + 1),
      type: 'like',
      timestamp: Date.now() - (48 + Math.random() * 24) * 3600000,
      actor: { id: 'user4', name: 'CosmicVoyager' },
      target: { id: 'post3', content: 'Found a secret Easter egg in the game!' }
    },
    {
      id: 'act' + (userActivities.value.length + 2),
      type: 'comment',
      timestamp: Date.now() - (72 + Math.random() * 24) * 3600000,
      actor: { id: 'user5', name: 'NebulaHunter' },
      target: { id: 'post4', content: 'What\'s your favorite spaceship build?' },
      data: { comment: 'I prefer speed over defense!' }
    }
  );
};

const navigateToPost = (postId) => {
  // TODO: Implement navigation to the post
  console.log('Navigating to post:', postId);
  // For now, navigate to the feed
  router.push('/feed');
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

/* Tab Navigation */
.dashboard-tabs {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: transparent;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  border: none;
  border-radius: 0.5rem 0.5rem 0 0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--cosmic-accent, #0f9aff);
}

.tab-button.active {
  color: var(--cosmic-accent, #0f9aff);
  border-bottom: 3px solid var(--cosmic-accent, #0f9aff);
  font-weight: 600;
}

.tab-button i {
  font-size: 1.1rem;
}

/* Analytics Tab */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.07);
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(15, 154, 255, 0.15);
  border-radius: 12px;
  margin-right: 1rem;
  color: var(--cosmic-accent, #0f9aff);
  font-size: 1.3rem;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary, #ffffff);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0.3rem 0;
  background: linear-gradient(to right, #0f9aff, #9b59b6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.card-content p {
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  margin: 0.3rem 0 1rem 0;
  font-size: 0.9rem;
}

/* Post reach chart */
.chart-container {
  display: flex;
  height: 80px;
  align-items: flex-end;
  gap: 0.3rem;
  margin-top: 1rem;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(to top, rgba(15, 154, 255, 0.7), rgba(155, 89, 182, 0.7));
  border-radius: 3px;
  transition: height 0.5s ease;
}

.bar-label {
  font-size: 0.65rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.5));
  margin-top: 0.3rem;
}

/* Performance metrics */
.performance-metric {
  margin-bottom: 1rem;
}

.metric-label {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 0.3rem;
}

.metric-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--cosmic-text-primary, #ffffff);
}

.post-preview {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  padding: 0.7rem;
  margin-top: 0.5rem;
}

.post-preview-text {
  font-size: 0.85rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
}

/* Stat details row */
.stat-detail-row {
  display: flex;
  gap: 1rem;
  margin-top: 0.8rem;
}

.stat-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-icon {
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary, #ffffff);
}

.detail-label {
  font-size: 0.75rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.6));
}

/* Network growth trend chart */
.trend-chart {
  position: relative;
  width: 100%;
  height: 50px;
  margin-top: 1rem;
}

.trend-point {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(15, 154, 255, 0.8);
  border-radius: 50%;
  z-index: 2;
}

.trend-line {
  position: absolute;
  height: 2px;
  width: 100%;
  background: linear-gradient(to right, rgba(15, 154, 255, 0.5), rgba(155, 89, 182, 0.5));
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.trend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.6));
}

/* Activity section */
.activity-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.activity-filter {
  display: flex;
  margin-bottom: 1.2rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
  background: rgba(15, 154, 255, 0.15);
  color: var(--cosmic-accent, #0f9aff);
  border-color: rgba(15, 154, 255, 0.3);
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.8rem;
  position: relative;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
  font-size: 1rem;
}

.activity-icon.post {
  background: rgba(15, 154, 255, 0.15);
  color: #0f9aff;
}

.activity-icon.like {
  background: rgba(233, 30, 99, 0.15);
  color: #e91e63;
}

.activity-icon.comment {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.actor-name {
  font-weight: 600;
  color: var(--cosmic-text-primary, #ffffff);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.5));
  margin-top: 0.5rem;
}

.activity-action {
  margin-left: 0.5rem;
}

.view-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.5));
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.3rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.view-btn:hover {
  color: var(--cosmic-accent, #0f9aff);
  background: rgba(15, 154, 255, 0.1);
}

.empty-activity {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.5));
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.load-more-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  padding: 0.7rem 1.5rem;
  border-radius: 2rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Growth tips section */
.tips-section {
  margin-bottom: 2rem;
}

.tips-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.tip-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-3px);
}

.tip-icon {
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 154, 255, 0.1);
  border-radius: 0.8rem;
  margin-right: 1rem;
  font-size: 1.2rem;
  color: var(--cosmic-accent, #0f9aff);
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.tip-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-tabs {
    justify-content: flex-start;
    overflow-x: auto;
  }
  
  .tab-button {
    flex-shrink: 0;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
}

/* Coming soon placeholder */
.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
}

.coming-soon i {
  font-size: 4rem;
  margin-bottom: 2rem;
  opacity: 0.2;
}

.coming-soon h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.coming-soon p {
  font-size: 1.1rem;
  max-width: 400px;
}

/* 
  ENHANCEMENT OPPORTUNITY: 
  Add animations to make metrics feel more alive and engaging
*/

@keyframes stat-fill {
  from { width: 0; }
  to { width: 100%; }
}

.stat-progress {
  animation: stat-fill 1s ease-out forwards;
}

/* ENHANCEMENT OPPORTUNITY:
   Add subtle hover effects for interactive cards */
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.09);
}

/* ENHANCEMENT OPPORTUNITY:
   Add pulsing animation for the referral code to draw attention */
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(15, 154, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(15, 154, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(15, 154, 255, 0); }
}

.referral-code {
  animation: pulse-border 2s infinite;
}
</style>