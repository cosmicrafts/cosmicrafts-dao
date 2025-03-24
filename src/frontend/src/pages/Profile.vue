<template>
  <div class="player-profile">
    <!-- Error Message -->
    <div class="error-message" v-if="loadingError">
      <h3>{{ $t('profilePage.profileError') }}</h3>
      <p>{{ loadingError }}</p>
      <div class="error-actions">
        <button @click="retryLoading" class="retry-btn">
          <span class="retry-icon">🔄</span>
          {{ $t('profilePage.retry') }}
        </button>
        <router-link to="/" class="home-btn">
          <span class="home-icon">🏠</span>
          {{ $t('profilePage.goHome') }}
        </router-link>
      </div>
      <p class="error-help">
        {{ $t('profilePage.errorHelp') }}
      </p>
    </div>

    <!-- Mobile Navigation -->
    <div class="mobile-nav">
      <div class="nav-item" 
           v-for="tab in ['profile', 'posts', 'stats', 'collection', 'social']" 
           :key="tab"
           :class="{ 'active': activeTab === tab }"
           @click="setActiveTab(tab)">
        <span class="nav-icon">
          {{ getTabIcon(tab) }}
        </span>
        <span class="nav-label">{{ $t(`profilePage.tabs.${tab}`) }}</span>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="avatar-container">
          <div class="avatar-frame">
            <div class="avatar-glow"></div>
            <img :src="playerAvatar" alt="Player Avatar" class="avatar" />
            <div class="level-badge">{{ player.level || '?' }}</div>
          </div>
          <div class="online-status" v-if="player.isOnline">
            <span class="status-dot"></span>
            {{ $t('profilePage.friendStatus.online') }}
          </div>
        </div>
        <div class="player-details">
          <div class="player-header">
            <h1 class="player-name">{{ player.username || $t('profilePage.unknownPlayer') }}</h1>
            <button class="edit-profile-btn" @click="startEditingProfile" v-if="showEditControls && !isEditingProfile">
              <span class="edit-icon">✏️</span>
              {{ $t('profilePage.editProfile') }}
            </button>
          </div>
          <p class="player-title">{{ translateMessage(player.title || 'Galactic Adventurer') }}</p>
          <p class="registration-date">{{ formattedRegistrationDate }}</p>
          
          <!-- Add Friend Button - Only show if not own profile -->
          <div class="friend-actions" v-if="!isOwnProfile && !loadingError">
            <CosmicButton 
              v-if="!isFriend && !friendRequestSent" 
              @click="sendFriendRequest" 
              variant="primary" 
              size="md" 
              :disabled="isProcessingFriendAction"
            >
              <span class="btn-icon">👥</span>
              {{ $t('profilePage.friendActions.addFriend') }}
              <span v-if="isProcessingFriendAction" class="loading-indicator">⟳</span>
            </CosmicButton>
            <CosmicButton 
              v-else-if="friendRequestSent" 
              @click="cancelFriendRequest" 
              variant="secondary" 
              size="md" 
              :disabled="isProcessingFriendAction"
            >
              <span class="btn-icon">⏱️</span>
              {{ $t('profilePage.friendActions.requestSent') }}
              <span v-if="isProcessingFriendAction" class="loading-indicator">⟳</span>
            </CosmicButton>
            <CosmicButton 
              v-else 
              @click="removeFriend" 
              variant="danger" 
              size="md" 
              :disabled="isProcessingFriendAction"
            >
              <span class="btn-icon">✖️</span>
              {{ $t('profilePage.friendActions.removeFriend') }}
              <span v-if="isProcessingFriendAction" class="loading-indicator">⟳</span>
            </CosmicButton>
          </div>
          
          <div class="player-description-container">
            <p class="player-description" v-if="!isEditingDescription">
              {{ translateMessage(player.description || 'No description yet') }}
              <button class="edit-description-btn" @click="startEditingDescription" v-if="showEditControls">
                <span class="edit-icon">✏️</span>
                {{ $t('profilePage.edit') }}
              </button>
            </p>
          </div>
          
          <div class="player-meta">
            <div class="meta-item">
              <span class="meta-label">{{ $t('profilePage.playerStats.elo') }}</span>
              <span class="meta-value">{{ formatElo(player.elo) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ $t('profilePage.playerStats.winRate') }}</span>
              <span class="meta-value">{{ calculateWinRate }}%</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ $t('profilePage.playerStats.games') }}</span>
              <span class="meta-value">{{ playerStats?.gamesPlayed || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Sidebar (Desktop) -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>{{ $t('profilePage.playerId') }}</h3>
          <div class="principal-display" :title="getPrincipalString">
            <span class="principal-text">{{ formatPrincipal(getPrincipalString) }}</span>
            <button class="icon-button" @click="copyPrincipal" :class="{ 'success': copySuccess }">
              <span v-if="!copySuccess">📋</span>
              <span v-else>✓</span>
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>{{ $t('profilePage.quickStats') }}</h3>
          <div class="quick-stats">
            <div class="stat-card">
              <div class="stat-icon">⚔️</div>
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(playerStats?.totalKills) }}</span>
                <span class="stat-label">{{ $t('profilePage.statsCards.totalKills') }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <span class="stat-value">{{ calculateEnergyEfficiency }}%</span>
                <span class="stat-label">{{ $t('profilePage.statsCards.energyEfficiency') }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(playerStats?.totalDamageCrit) }}</span>
                <span class="stat-label">{{ $t('profilePage.statsCards.criticalHits') }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Stats Section -->
        <section class="content-section stats-section">
          <div class="bg-surface cosmic-flex-between">
            <h2 class="title-medium text-gradient">{{ $t('profilePage.combatStatistics') }}</h2>
          </div>
          <div class="stats-grid">
            <template v-if="!playerStats">
              <div class="stat-tile skeleton" v-for="i in 4" :key="i">
                <div class="stat-header">
                  <span class="stat-icon skeleton-icon"></span>
                  <span class="stat-title skeleton-text"></span>
                </div>
                <div class="stat-body">
                  <span class="stat-value skeleton-text"></span>
                  <div class="stat-progress skeleton-progress"></div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">⚔️</span>
                  <span class="stat-title">{{ $t('profilePage.statsDetails.damageDealt') }}</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.totalDamageDealt) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('totalDamageDealt', maxStats.totalDamageDealt) + '%' }"></div>
                </div>
              </div>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">🛡️</span>
                  <span class="stat-title">{{ $t('profilePage.statsDetails.damageEvaded') }}</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.totalDamageEvaded) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('totalDamageEvaded', maxStats.totalDamageEvaded) + '%' }"></div>
                </div>
              </div>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">⚡</span>
                  <span class="stat-title">{{ $t('profilePage.statsDetails.energyGenerated') }}</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.energyGenerated) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('energyGenerated', maxStats.energyGenerated) + '%' }"></div>
                </div>
              </div>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">🔋</span>
                  <span class="stat-title">{{ $t('profilePage.statsDetails.energyUsed') }}</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.energyUsed) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('energyUsed', maxStats.energyUsed) + '%' }"></div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- Collection Section -->
        <section class="content-section collection-section">
          <h2>{{ $t('profilePage.nftCollection') }}</h2>
          <div class="collection-tabs">
            <div v-for="category in nftCategories" 
                 :key="category.type"
                 class="tab"
                 :class="{ 'active': activeCollection === category.type }"
                 @click="activeCollection = category.type">
              <span class="tab-icon">{{ getCategoryIcon(category.type) }}</span>
              {{ $t(`profilePage.nftCategories.${category.type}`) }}
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
                  <NFTCard 
                    v-for="nft in category.items" 
                    :key="nft.id"
                    :nft="nft"
                  />
                  <p v-if="category.items.length === 0" class="empty-message">
                    {{ $t('profilePage.noNfts', { category: $t(`profilePage.nftCategories.${category.type}`).toLowerCase() }) }}
                  </p>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- Achievements Section -->
        <section class="content-section achievements-section" v-if="achievements.length">
          <h2>{{ $t('profilePage.achievements') }}</h2>
          <div class="achievements-grid">
            <div class="achievement-card" 
                 v-for="achievement in achievements" 
                 :key="achievement.id"
                 @click="openAchievementDetails(achievement)">
              <div class="achievement-icon" :class="{ 'completed': achievement.completed }">
                <img :src="achievement.icon" :alt="achievement.name" />
              </div>
              <div class="achievement-details">
                <span class="achievement-name">{{ achievement.name }}</span>
                <p class="achievement-desc">{{ achievement.description }}</p>
                <div class="achievement-progress">
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: `${achievement.progress}%` }"></div>
                  </div>
                  <span class="progress-text">{{ achievement.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Friends Section -->
        <section class="content-section friends-section" v-if="friends.length">
          <h2>{{ $t('profilePage.friends') }}</h2>
          <div class="friends-grid">
            <div class="friend-card" v-for="friend in friends" :key="friend.id">
              <img :src="friend.avatar" :alt="friend.username" class="friend-avatar" />
              <div class="friend-info">
                <span class="friend-name">{{ friend.username }}</span>
                <span class="friend-status" :class="friend.status">{{ $t(`profilePage.friendStatus.${friend.status}`) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Add a new Posts Section after the Hero Section -->
        <section class="content-section posts-section" v-if="activeTab === 'posts'">
          <div class="bg-surface cosmic-flex-between">
            <h2 class="title-medium text-gradient">{{ $t('profilePage.posts') }}</h2>
          </div>
          
          <!-- Create Post (only if own profile) -->
          <div class="post-creation-box" v-if="showEditControls">
            <div class="post-avatar">
              <img :src="playerAvatar" alt="Player Avatar" class="avatar">
            </div>
            <div class="post-input-container">
              <textarea 
                class="post-input" 
                :placeholder="$t('profilePage.createPostPlaceholder')"
                v-model="newPostContent"
                rows="2"
              ></textarea>
              <div class="post-actions">
                <div class="post-attachments">
                  <button class="attachment-btn">
                    <span class="attachment-icon">🖼️</span>
                  </button>
                  <button class="attachment-btn">
                    <span class="attachment-icon">🔗</span>
                  </button>
                </div>
                <button 
                  class="post-submit-btn cosmic-button" 
                  :disabled="!newPostContent.trim()" 
                  @click="createPost"
                >
                  {{ $t('profilePage.post') }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Posts List -->
          <div class="posts-feed">
            <div v-if="userPosts.length === 0" class="empty-posts">
              <div class="empty-icon">📝</div>
              <p v-if="isOwnProfile">{{ $t('profilePage.emptyPostsSelf') }}</p>
              <p v-else>{{ $t('profilePage.emptyPostsOther', { username: player.username }) }}</p>
            </div>
            
            <div v-for="post in userPosts" :key="post.id" class="post-card">
              <div class="post-header">
                <div class="post-avatar">
                  <img :src="playerAvatar" :alt="player.username">
                </div>
                <div class="post-author-info">
                  <div class="post-author">
                    <span class="author-name">{{ player.username }}</span>
                    <span class="author-level">Lvl {{ player.level }}</span>
                  </div>
                  <div class="post-meta">
                    <span class="post-time">{{ formatPostTime(post.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-menu" v-if="showEditControls">
                  <button class="menu-btn" @click="deletePost(post.id)">
                    <span class="menu-icon">❌</span>
                  </button>
                </div>
              </div>
              <div class="post-content">
                <p class="post-text">{{ post.content }}</p>
                <div v-if="post.media" class="post-media">
                  <img :src="post.media" :alt="post.content" class="post-image">
                </div>
              </div>
              <div class="post-actions">
                <button class="action-btn" @click="likePost(post.id)">
                  <span class="action-icon" :class="{ 'active': post.liked }">❤️</span>
                  <span class="action-count">{{ post.likes }}</span>
                </button>
                <button class="action-btn" @click="commentOnPost(post.id)">
                  <span class="action-icon">💬</span>
                  <span class="action-count">{{ post.comments.length }}</span>
                </button>
                <button class="action-btn" @click="repostPost(post.id)">
                  <span class="action-icon">🔄</span>
                  <span class="action-count">{{ post.reposts }}</span>
                </button>
              </div>
              
              <!-- Comments Section (when expanded) -->
              <div v-if="post.showComments" class="comments-section">
                <div v-for="comment in post.comments" :key="comment.id" class="comment">
                  <div class="comment-avatar">
                    <img :src="getAvatarSrc(comment.authorAvatar)" :alt="comment.authorName">
                  </div>
                  <div class="comment-content">
                    <div class="comment-author">{{ comment.authorName }}</div>
                    <div class="comment-text">{{ comment.text }}</div>
                    <div class="comment-time">{{ formatPostTime(comment.createdAt) }}</div>
                  </div>
                </div>
                
                <!-- Add Comment -->
                <div class="add-comment" v-if="authStore.isAuthenticated()">
                  <div class="comment-avatar">
                    <img :src="getAvatarSrc(authStore.player?.avatar)" :alt="authStore.player?.username">
                  </div>
                  <div class="comment-input-container">
                    <textarea 
                      class="comment-input" 
                      :placeholder="$t('profilePage.writeComment')"
                      v-model="post.newComment"
                      rows="1"
                    ></textarea>
                    <button 
                      class="comment-submit" 
                      :disabled="!post.newComment?.trim()"
                      @click="addComment(post.id)"
                    >
                      {{ $t('profilePage.submit') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Profile Edit Modal -->
    <div class="modal" v-if="isEditingProfile">
      <div class="modal-content">
        <h2>{{ $t('profilePage.editProfileModal.title') }}</h2>
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label>{{ $t('profilePage.editProfileModal.username') }}</label>
            <input v-model="editForm.username" type="text" maxlength="20" />
          </div>
          <div class="form-group">
            <label>{{ $t('profilePage.editProfileModal.title') }}</label>
            <input v-model="editForm.title" type="text" maxlength="30" />
          </div>
          <div class="form-group">
            <label>{{ $t('profilePage.editProfileModal.description') }}</label>
            <textarea v-model="editForm.description" maxlength="200"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="isEditingProfile = false">{{ $t('profilePage.editProfileModal.cancel') }}</button>
            <button type="submit">{{ $t('profilePage.editProfileModal.saveChanges') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Achievement Details Modal -->
    <div class="modal achievement-modal" v-if="showAchievementDetails">
      <div class="modal-content">
        <button class="close-button" @click="closeAchievementDetails">×</button>
        <div class="achievement-details" v-if="selectedAchievement">
          <div class="achievement-icon large" :class="{ 'completed': selectedAchievement.completed }">
            <img :src="selectedAchievement.icon" :alt="selectedAchievement.name" />
          </div>
          <h2>{{ selectedAchievement.name }}</h2>
          <p class="achievement-desc">{{ selectedAchievement.description }}</p>
          <div class="achievement-progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${selectedAchievement.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ selectedAchievement.progress }}%</span>
          </div>
          <div class="achievement-stats">
            <div class="stat">
              <span class="stat-label">{{ $t('profilePage.achievementStats.completedBy') }}</span>
              <span class="stat-value">23%</span>
            </div>
            <div class="stat">
              <span class="stat-label">{{ $t('profilePage.achievementStats.points') }}</span>
              <span class="stat-value">100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useStatisticsStore } from '../stores/stats';
import { useACHStore } from '../stores/ach';
import { useCanisterStore } from '@/stores/canister';
import { useI18n } from 'vue-i18n';
import { translateProfileMessage, formatRegistrationDate as formatRegDate } from '@/utils/profileTranslator';
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
import { Principal } from '@dfinity/principal';
import { useProfileStore } from '../stores/profile';
import { useNftsStore } from '../stores/nfts';
import NFTCard from '@/components/ui/cards/NFTCard.vue';
import CosmicButton from '@/components/ui/buttons/BaseButton.vue';

const authStore = useAuthStore();
const statsStore = useStatisticsStore();
const achStore = useACHStore();
const canisterStore = useCanisterStore();
const route = useRoute();
const copySuccess = ref(false);
const profileStore = useProfileStore();
const nftsStore = useNftsStore();
const { t, locale } = useI18n();

// State
const playerStats = ref(null);
const averageStats = ref(null);
const achievements = ref([]);
const playerAchievements = ref([]);
const nftCategories = ref([
  { type: 'all', title: 'All NFTs', items: [], isLoading: false },
  { type: 'characters', title: 'Characters', items: [], isLoading: false },
  { type: 'units', title: 'Units', items: [], isLoading: false },
  { type: 'avatars', title: 'Avatars', items: [], isLoading: false },
  { type: 'trophies', title: 'Trophies', items: [], isLoading: false },
  { type: 'chests', title: 'Chests', items: [], isLoading: false }
]);
const friends = ref([]);
const activeTab = ref('profile');
const activeCollection = ref('all');
const loadingError = ref(null);
const maxStats = ref({
  totalDamageDealt: 1000000,
  totalDamageEvaded: 500000,
  energyGenerated: 100000,
  energyUsed: 100000
});
const showAchievementDetails = ref(false);
const selectedAchievement = ref(null);
const isEditingProfile = ref(false);
const editForm = ref({
  username: '',
  title: '',
  description: ''
});
const isEditingDescription = ref(false);
const descriptionForm = ref({
  description: '',
  isSubmitting: false,
  error: null
});
const playerNFTs = ref([]);
const fetchNFTs = ref(true);
const isFriend = ref(false);
const friendRequestSent = ref(false);
const isProcessingFriendAction = ref(false);
const friendActionError = ref(null);
const windowWidth = ref(window.innerWidth);

// Check if this is the current user's own profile
const isOwnProfile = computed(() => {
  // Check if we're on the /profile route
  if (route.path === '/profile') {
    return true;
  }
  
  // Check if the user is authenticated
  const identity = authStore.getIdentity();
  if (!identity) {
    return false; // Not authenticated, so can't be own profile
  }
  
  // Compare route identifier with user's principal
  try {
    const identifierFromRoute = route.params.identifier;
    const userPrincipal = identity.getPrincipal().toText();
    return identifierFromRoute === userPrincipal;
  } catch (error) {
    console.error('Error determining if profile is own:', error);
    return false;
  }
});

// Detect mobile view
const isMobileView = computed(() => {
  return windowWidth.value < 768;
});

// Update window width on resize
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

// Add and remove event listener
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

// Use either the route's playerData (for other players) or authStore.player (for own profile)
const player = computed(() => {
  if (isOwnProfile.value) {
    console.log('Using authStore.player for own profile:', authStore.player);
    return authStore.player || {};
  }
  
  // For other players, use the playerData from the route meta
  const playerData = route.meta.playerData;
  const lookupMethod = route.meta.profileLookupMethod;
  console.log(`Route meta playerData (via ${lookupMethod}):`, playerData);
  
  // If playerData is missing or incomplete, create a placeholder with the identifier
  if (!playerData || !playerData.username) {
    const identifier = route.params.identifier;
    console.log('Creating placeholder profile for identifier:', identifier);
    return {
      username: `User ${identifier.substring(0, 5)}...`,
      id: identifier,
      level: '?',
      title: 'Unknown Player',
      description: 'Profile data is unavailable.',
      elo: 1200, // Default ELO
      avatar: '0',
      registrationDate: '',
      language: '',
      friends: []
    };
  }
  
  // For username lookups, preserve the Principal object
  if (lookupMethod === 'username' && playerData.id instanceof Principal) {
    console.log('Preserving Principal object from username lookup');
    return {
      ...playerData,
      title: playerData.title || 'Galactic Adventurer',
      description: playerData.description || 'No description available.',
      elo: playerData.elo || 1200,
      avatar: playerData.avatar || '0',
      registrationDate: playerData.registrationDate || '',
      language: playerData.language || '',
      friends: playerData.friends || []
    };
  }
  
  // Format the player ID appropriately based on how we found the profile
  let formattedId;
  if (lookupMethod === 'username' && typeof playerData.id === 'object') {
    // For username lookups with object IDs, try to get the principal string
    try {
      formattedId = playerData.id.toText ? playerData.id.toText() : route.params.identifier;
    } catch (error) {
      console.error('Error formatting player ID from object:', error);
      formattedId = route.params.identifier;
    }
  } else if (lookupMethod === 'principal') {
    // For principal lookups, use the original principal ID
    formattedId = route.params.identifier;
  } else {
    // Default fallback
    formattedId = typeof playerData.id === 'string' ? playerData.id : route.params.identifier;
  }
  
  // Ensure all expected properties exist on the player object
  return {
    ...playerData,
    id: formattedId,
    title: playerData.title || 'Galactic Adventurer',
    description: playerData.description || 'No description available.',
    elo: playerData.elo || 1200,
    avatar: playerData.avatar || '0',
    registrationDate: playerData.registrationDate || '',
    language: playerData.language || '',
    friends: playerData.friends || []
  };
});

// Show edit controls only for own profile
const showEditControls = computed(() => isOwnProfile.value);

// Array of all available avatars
const avatarSrcArray = [
  avatar1, avatar2, avatar3, avatar4, avatar5, avatar6,
  avatar7, avatar8, avatar9, avatar10, avatar11, avatar12
];

// Dynamically load the player avatar based on the avatar ID
const playerAvatar = computed(() => {
  // Convert BigInt to number safely and handle undefined
  const avatarId = player.value?.avatar;
  const avatarNum = avatarId ? Number(avatarId.toString()) : 1;
  // Avatar IDs are 1-based, so we subtract 1 for array index
  const avatarIndex = (avatarNum - 1) % avatarSrcArray.length;
  return avatarSrcArray[avatarIndex] || avatar1; // Fallback to avatar1 if not found
});

// Fetch all player data on mount
onMounted(async () => {
  loadingError.value = '';
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }

    // Get the principal for the profile we're viewing
    let targetPrincipal;
    
    if (isOwnProfile.value) {
      const identity = authStore.getIdentity();
      if (!identity) {
        throw new Error('Authentication required to view your profile');
      }
      targetPrincipal = identity.getPrincipal();
      console.log('Using own principal for profile:', targetPrincipal.toString());
    } else {
      if (player.value.id instanceof Principal) {
        targetPrincipal = player.value.id;
      } else if (route.meta.playerData?.id instanceof Principal) {
        targetPrincipal = route.meta.playerData.id;
      } else if (route.meta.profileLookupMethod === 'principal') {
        targetPrincipal = Principal.fromText(route.params.identifier);
      } else {
        throw new Error(`Cannot create Principal from username: ${route.params.identifier}`);
      }
    }

    // Fetch data in parallel
    const fetchTasks = [
      // Fetch player stats
      (async () => {
        try {
          const stats = await cosmicrafts.getPlayerStats(targetPrincipal);
          playerStats.value = stats;
          
          const avgStats = await cosmicrafts.getPlayerAverageStats(targetPrincipal);
          averageStats.value = avgStats;
        } catch (error) {
          console.error('Error fetching player stats:', error);
          playerStats.value = {
            gamesPlayed: 0,
            gamesWon: 0,
            energyGenerated: 0,
            energyUsed: 0,
            resourcesCollected: 0,
            unitsBuilt: 0
          };
        }
      })(),
      
      // Fetch achievements
      (async () => {
        try {
          if (!achStore.fetched) {
            await achStore.fetchAchievements();
          }
          const userAchievements = await cosmicrafts.getUserAchievementsStructure(targetPrincipal);
          playerAchievements.value = userAchievements || [];
          if (playerAchievements.value?.length > 0) {
            achievements.value = processAchievements(playerAchievements.value);
          }
        } catch (error) {
          console.error('Error fetching achievements:', error);
        }
      })(),
      
      // Fetch NFTs for active category
      (async () => {
        if (fetchNFTs.value) {
          const category = nftCategories.value.find(c => c.type === activeCollection.value);
          if (category) {
            category.isLoading = true;
            try {
              const nfts = await cosmicrafts.getNFTs(targetPrincipal);
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
              }
            } catch (error) {
              console.error('Error fetching NFTs:', error);
            } finally {
              category.isLoading = false;
            }
          }
        }
      })()
    ];

    // Execute all fetch tasks in parallel
    await Promise.allSettled(fetchTasks);

    // Check friendship status
    await checkFriendshipStatus();

  } catch (error) {
    console.error('Error loading profile data:', error);
    if (error.message.includes('Invalid Principal ID') || 
        error.message.includes('Cannot create Principal')) {
      loadingError.value = 'Could not load profile data. This may be because the username does not exist or the Principal ID is invalid.';
    } else if (error.message.includes('Authentication required')) {
      loadingError.value = 'You need to be logged in to view your profile.';
    } else if (error.message.includes('Failed to initialize canister')) {
      loadingError.value = 'Could not connect to the server. Please try again later.';
    } else {
      loadingError.value = `Error loading profile data: ${error.message}`;
    }
  }
});

// Initialize achievements store
onBeforeMount(async () => {
  if (!achStore.fetched && !achStore.loading) {
    try {
      await achStore.fetchAchievements();
    } catch (error) {
      console.error('Failed to pre-fetch achievements:', error);
    }
  }
});

// Computed properties
const calculateWinRate = computed(() => {
  if (!playerStats.value?.gamesPlayed) return 0;
  return Math.round((playerStats.value.gamesWon / playerStats.value.gamesPlayed) * 100);
});

const calculateEnergyEfficiency = computed(() => {
  if (!playerStats.value?.energyGenerated) return 0;
  return Math.round((playerStats.value.energyUsed / playerStats.value.energyGenerated) * 100);
});

const calculateStatProgress = (stat, maxValue) => {
  if (!playerStats.value || !playerStats.value[stat]) return 0;
  return Math.min(Math.round((playerStats.value[stat] / maxValue) * 100), 100);
};

// Helper functions
const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};

// Helper functions for formatting
const formatElo = (elo) => {
  return elo ? Math.round(Number(elo)).toLocaleString() : '1000';
};

const getPrincipalString = computed(() => {
  try {
    // If viewing own profile, use identity's principal
    if (isOwnProfile.value) {
      const identity = authStore.getIdentity();
      return identity ? identity.getPrincipal().toText() : '';
    }
    
    // For other profiles, check if we have a Principal object
    if (player.value?.id instanceof Principal) {
      return player.value.id.toText();
    }
    
    // If player data has a Principal in route meta
    if (route.meta.playerData?.id instanceof Principal) {
      return route.meta.playerData.id.toText();
    }
    
    // If we have a principal ID string in the route params
    if (route.meta.profileLookupMethod === 'principal') {
      return route.params.identifier;
    }
    
    // If we can't get a principal, return empty string
    return '';
  } catch (error) {
    console.error('Error getting principal string:', error);
    return '';
  }
});

const formatPrincipal = (principal) => {
  if (!principal) return '';
  // Format to show first 5 and last 3 with ... in middle
  if (principal.length <= 8) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-3)}`;
};

const copyPrincipal = async () => {
  const principalText = getPrincipalString.value;
  if (principalText) {
    try {
      await navigator.clipboard.writeText(principalText);
      copySuccess.value = true;
      console.log('Copied principal to clipboard:', principalText);
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy principal:', err);
    }
  } else {
    console.error('No principal available to copy');
  }
};

// NFT processing functions
const fetchNFTsByCategory = async (category) => {
  const cosmicrafts = await canisterStore.get("cosmicrafts");
  if (!cosmicrafts) {
    throw new Error("Cosmicrafts canister not initialized");
  }
  
  const identity = authStore.getIdentity();
  if (!identity) {
    console.error("No identity available for fetching NFTs");
    return [];
  }
  
  const principal = identity.getPrincipal();
  if (!principal) {
    console.error("No principal available");
    return [];
  }
  
  try {
    switch (category) {
      case 'characters': return await cosmicrafts.getCharacters(principal);
      case 'units': return await cosmicrafts.getUnits(principal);
      case 'avatars': return await cosmicrafts.getAvatars(principal);
      case 'trophies': return await cosmicrafts.getTrophies(principal);
      case 'chests': return await cosmicrafts.getChests(principal);
      default: return [];
    }
  } catch (error) {
    console.error(`Error fetching ${category} NFTs:`, error);
    return [];
  }
};

const processNFTs = (nfts) => {
  console.log('Processing NFTs:', nfts);
  
  return nfts.map(nft => {
    try {
      console.log('Processing individual NFT:', nft);
      
      // Extract id and metadata from array format
      const [id, rawMetadata] = nft;
      console.log('Raw metadata:', rawMetadata);
      
      // The metadata structure is: metadata.metadata.general
      const metadata = rawMetadata.metadata || {};
      const general = metadata.general || {};
      const basic = metadata.basic || [];
      const category = metadata.category || {};
      
      console.log('Processed metadata:', {
        general,
        basic,
        category
      });

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
        console.log('Getting image path for:', { name, category });
        
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
          console.log('Resolved chest image path:', resolvedPath);
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
        console.log('Using fallback image path:', fallbackPath);
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
      
      console.log('NFT Image Resolution:', {
        name,
        category: categoryType,
        resolvedPath: imagePath
      });

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

      console.log('Processed NFT:', processedNFT);
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
};

const processFriendsList = async (friendsList) => {
  if (!friendsList || !Array.isArray(friendsList)) {
    console.log('No friends list or invalid format');
    return [];
  }
  
  const cosmicrafts = await canisterStore.get("cosmicrafts");
  if (!cosmicrafts) {
    console.error('Cosmicrafts canister not initialized');
    return [];
  }
  
  console.log('Friends list received:', friendsList);
  
  // Handle the nested array structure - take the first element if it's an array
  const actualFriendsList = Array.isArray(friendsList[0]) ? friendsList[0] : friendsList;
  
  if (!actualFriendsList.length) {
    console.log('No friends found in the list');
    return [];
  }
  
  return Promise.all(actualFriendsList.map(async (friendId) => {
    try {
      // Handle different possible formats of friendId
      let principal;
      if (typeof friendId === 'string') {
        try {
          principal = Principal.fromText(friendId);
        } catch (error) {
          console.error('Error creating Principal from string:', error);
          return null;
        }
      } else if (friendId instanceof Principal) {
        principal = friendId;
      } else if (typeof friendId === 'object' && friendId.toText) {
        principal = friendId;
      } else {
        console.error('Unexpected friend ID format:', friendId);
        return null;
      }

      // Use getProfile instead of getPlayer for consistency
      const profile = await cosmicrafts.getProfile(principal);
      if (!profile) {
        console.log('No profile found for friend:', principal.toString());
        return null;
      }
      
      // Handle array format if needed
      let playerData;
      if (Array.isArray(profile) && profile.length > 0) {
        playerData = profile[0];
      } else {
        playerData = profile;
      }
      
      if (!playerData) {
        console.log('No player data found for friend');
        return null;
      }
      
      // Use a try-catch specifically for the ID conversion
      let idString;
      try {
        idString = principal.toText();
      } catch (error) {
        console.error('Error converting principal to text:', error);
        idString = String(friendId);
      }

      return {
        id: idString,
        username: playerData?.username || 'Unknown',
        avatar: playerData?.avatar ? avatarSrcArray[(Number(playerData.avatar.toString()) - 1) % avatarSrcArray.length] : avatar1,
        status: 'offline'
      };
    } catch (error) {
      console.error('Error processing friend:', friendId);
      console.error('Error details:', error);
      return null;
    }
  })).then(friends => friends.filter(friend => friend !== null));
};

const processAchievements = (categories) => {
  const achievements = [];
  for (const category of categories) {
    for (const line of category.achievements) {
      for (const achievement of line.individualAchievements) {
        achievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          progress: Math.round((achievement.progress / achievement.requiredProgress) * 100),
          completed: achievement.completed,
          icon: achievement.icon || '' // You'll need to implement icon mapping
        });
      }
    }
  }
  return achievements;
};

const getTabIcon = (tab) => {
  const icons = {
    profile: '👤',
    posts: '📝',
    stats: '📊',
    collection: '🎮',
    social: '👥'
  };
  return icons[tab] || '📋';
};

const getCategoryIcon = (type) => {
  const icons = {
    all: '🎯',
    characters: '🦸',
    units: '⚔️',
    avatars: '🎭',
    trophies: '🏆',
    chests: '📦'
  };
  return icons[type] || '📦';
};

// Add these methods
const openAchievementDetails = (achievement) => {
  selectedAchievement.value = achievement;
  showAchievementDetails.value = true;
};

const closeAchievementDetails = () => {
  showAchievementDetails.value = false;
  selectedAchievement.value = null;
};

const startEditingProfile = () => {
  editForm.value = {
    username: player.value.username || '',
    title: player.value.title || '',
    description: player.value.description || ''
  };
  isEditingProfile.value = true;
};

const saveProfile = async () => {
  try {
    // TODO: Implement profile update logic
    isEditingProfile.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

const startEditingDescription = () => {
  descriptionForm.value = {
    description: player.value.description || '',
    isSubmitting: false,
    error: null
  };
  isEditingDescription.value = true;
};

const saveDescription = async () => {
  console.log('Starting description update...', {
    currentDescription: player.value.description,
    newDescription: descriptionForm.value.description
  });
  
  descriptionForm.value.isSubmitting = true;
  descriptionForm.value.error = null;
  
  try {
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      throw new Error("Cosmicrafts canister not initialized");
    }

    console.log('Calling updateDescription with:', descriptionForm.value.description);
    const [success, playerId, message] = await cosmicrafts.updateDescription(descriptionForm.value.description);
    
    console.log('Update description response:', { success, playerId, message });

    if (success) {
      // Update local state
      if (player.value) {
        player.value.description = descriptionForm.value.description;
      }
      isEditingDescription.value = false;
      
      // Show success notification (you'll need to implement this)
      console.log('Description updated successfully');
    } else {
      throw new Error(message || 'Failed to update description');
    }
  } catch (error) {
    console.error('Error updating description:', error);
    descriptionForm.value.error = error.message || 'Failed to update description';
  } finally {
    descriptionForm.value.isSubmitting = false;
  }
};

// Function to retry loading profile data
const retryLoading = () => {
  loadingError.value = null;
  
  // Call the onMounted function again
  onMounted().catch(error => {
    console.error('Error retrying profile load:', error);
    loadingError.value = `Failed to reload profile: ${error.message}`;
  });
};

// Format registration date
const formattedRegistrationDate = computed(() => {
  if (!player.value || !player.value.registrationDate) return '';
  return formatRegDate(player.value.registrationDate, t, locale);
});

// Function to check if the current user and profile user are friends
const checkFriendshipStatus = async () => {
  if (isOwnProfile.value) {
    return; // No need to check friendship status for own profile
  }
  
  try {
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      console.error('Cosmicrafts canister not initialized');
      return;
    }
    
    // Get the current user's friends list
    const friendsList = await cosmicrafts.getFriendsList();
    if (!friendsList) {
      console.log('No friends list available');
      return;
    }
    
    // Get the profile user's principal
    let profilePrincipal;
    if (typeof player.value.id === 'string') {
      try {
        profilePrincipal = Principal.fromText(player.value.id);
      } catch (error) {
        console.error('Error creating Principal from string:', error);
        return;
      }
    } else if (player.value.id instanceof Principal) {
      profilePrincipal = player.value.id;
    } else {
      console.error('Unexpected player ID format:', player.value.id);
      return;
    }
    
    // Check if the profile user is in the current user's friends list
    const actualFriendsList = Array.isArray(friendsList[0]) ? friendsList[0] : friendsList;
    isFriend.value = actualFriendsList.some(friendId => {
      if (friendId instanceof Principal) {
        return friendId.toText() === profilePrincipal.toText();
      } else if (typeof friendId === 'string') {
        return friendId === profilePrincipal.toText();
      }
      return false;
    });
    
    // If not friends, check if a friend request has been sent
    if (!isFriend.value) {
      // This would require a backend function to check pending friend requests
      // For now, we'll just set it to false
      friendRequestSent.value = false;
    }
    
    console.log('Friendship status:', { isFriend: isFriend.value, friendRequestSent: friendRequestSent.value });
  } catch (error) {
    console.error('Error checking friendship status:', error);
  }
};

// Function to send a friend request
const sendFriendRequest = async () => {
  if (isProcessingFriendAction.value) return;
  
  isProcessingFriendAction.value = true;
  friendActionError.value = null;
  
  try {
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      throw new Error("Cosmicrafts canister not initialized");
    }
    
    // Get the profile user's principal
    let profilePrincipal;
    if (typeof player.value.id === 'string') {
      profilePrincipal = Principal.fromText(player.value.id);
    } else if (player.value.id instanceof Principal) {
      profilePrincipal = player.value.id;
    } else {
      throw new Error('Invalid player ID format');
    }
    
    // Send the friend request
    const [success, message] = await cosmicrafts.sendFriendRequest(profilePrincipal);
    
    console.log('Send friend request response:', { success, message });
    
    if (success) {
      friendRequestSent.value = true;
      // Show success notification
      console.log('Friend request sent successfully');
    } else {
      throw new Error(message || 'Failed to send friend request');
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    friendActionError.value = error.message || 'Failed to send friend request';
  } finally {
    isProcessingFriendAction.value = false;
  }
};

// Function to cancel a friend request (this would require a backend function)
const cancelFriendRequest = async () => {
  // This would require a backend function to cancel a friend request
  // For now, we'll just show an alert
  alert('This functionality is not yet implemented');
};

// Function to remove a friend
const removeFriend = async () => {
  if (isProcessingFriendAction.value) return;
  
  // Confirm before removing friend
  if (!confirm(t('profilePage.confirmRemoveFriend', { username: player.value.username }))) {
    return;
  }
  
  isProcessingFriendAction.value = true;
  friendActionError.value = null;
  
  try {
    // This would require a backend function to remove a friend
    // For now, we'll just show an alert
    alert('This functionality is not yet implemented');
    
    // If the backend had a removeFriend function, it would look like this:
    /*
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      throw new Error("Cosmicrafts canister not initialized");
    }
    
    // Get the profile user's principal
    let profilePrincipal;
    if (typeof player.value.id === 'string') {
      profilePrincipal = Principal.fromText(player.value.id);
    } else if (player.value.id instanceof Principal) {
      profilePrincipal = player.value.id;
    } else {
      throw new Error('Invalid player ID format');
    }
    
    // Remove the friend
    const [success, message] = await cosmicrafts.removeFriend(profilePrincipal);
    
    if (success) {
      isFriend.value = false;
      // Show success notification
      console.log('Friend removed successfully');
    } else {
      throw new Error(message || 'Failed to remove friend');
    }
    */
  } catch (error) {
    console.error('Error removing friend:', error);
    friendActionError.value = error.message || 'Failed to remove friend';
  } finally {
    isProcessingFriendAction.value = false;
  }
};

// Add a method to translate messages
const translateMessage = (message) => {
  return translateProfileMessage(message, t);
};

const setActiveTab = (tab) => {
  activeTab.value = tab;
  
  // Scroll to the appropriate section
  let targetElement;
  switch(tab) {
    case 'profile':
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    case 'stats':
      targetElement = document.querySelector('.stats-section');
      break;
    case 'collection':
      targetElement = document.querySelector('.collection-section');
      break;
    case 'social':
      targetElement = document.querySelector('.achievements-section') || 
                     document.querySelector('.friends-section');
      break;
    case 'posts':
      targetElement = document.querySelector('.posts-section');
      break;
  }
  
  if (targetElement) {
    // Add a small offset to account for fixed header
    const yOffset = -20; 
    const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
};

// Add state for posts
const userPosts = ref([]);
const newPostContent = ref('');

// Add functions for posts 
const formatPostTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  
  // Convert to seconds, minutes, hours, and days
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin}m`;
  } else if (diffHrs < 24) {
    return `${diffHrs}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else {
    return date.toLocaleDateString();
  }
};

const getAvatarSrc = (avatarId) => {
  const index = (Number(avatarId || 1) - 1) % avatarSrcArray.length;
  return avatarSrcArray[index] || avatar1;
};

const createPost = async () => {
  if (!newPostContent.value.trim()) return;
  
  try {
    // TODO: Implement actual post creation on blockchain
    console.log('Creating post:', newPostContent.value);
    
    // Add post to local state for immediate feedback
    const newPost = {
      id: `local-${Date.now()}`,
      content: newPostContent.value,
      author: {
        id: authStore.getIdentity()?.getPrincipal().toString() || 'unknown',
        username: username.value,
        avatar: avatarId.value
      },
      likes: 0,
      reposts: 0,
      createdAt: new Date().toISOString(),
      liked: false,
      showComments: false,
      comments: [],
      newComment: ''
    };
    
    userPosts.value.unshift(newPost);
    newPostContent.value = '';
    
    // Toast or notification would go here
  } catch (err) {
    console.error('Error creating post:', err);
    // Show error message
  }
};

const fetchUserPosts = async () => {
  try {
    // TODO: Implement actual fetch from blockchain
    console.log('Fetching posts for user:', player.value.username);
    
    // Generate mock posts for now
    const mockPosts = [];
    const postCount = isOwnProfile.value ? 5 : Math.floor(Math.random() * 8);
    
    for (let i = 0; i < postCount; i++) {
      const hasMedia = Math.random() > 0.6;
      const post = {
        id: `post-${i}-${Date.now()}`,
        content: getMockPostContent(i),
        likes: Math.floor(Math.random() * 50),
        reposts: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - i * 86400000 * Math.random() * 5).toISOString(),
        liked: Math.random() > 0.7,
        showComments: false,
        comments: generateMockComments(Math.floor(Math.random() * 3)),
        newComment: '',
        media: hasMedia ? `https://picsum.photos/500/300?random=${i}` : null
      };
      mockPosts.push(post);
    }
    
    userPosts.value = mockPosts;
  } catch (err) {
    console.error('Error fetching user posts:', err);
  }
};

const getMockPostContent = (index) => {
  const contents = [
    'Just upgraded my cosmic ship with the latest quantum drives! #SpaceExploration',
    'Looking for alliance members for the upcoming tournament. DM if interested! #CosmicCrafts',
    'Check out this rare NFT I just acquired from the Celestial Collection 🌟',
    'The view from the Andromeda quadrant today is breathtaking...',
    'Just defeated the legendary StarWyrm boss! Who else has done it? #GameAchievement',
    'Tips for new players: Always upgrade your energy nodes first. Trust me on this one.',
    'Finally reached level 50! The grind was real but totally worth it. #LevelUp',
    'Trading some rare resources. Message me with offers. #CosmicEconomy'
  ];
  
  return contents[index % contents.length];
};

const generateMockComments = (count) => {
  const comments = [];
  const commentTexts = [
    'Great post!',
    'Totally agree with this!',
    'Can you share more details?',
    'This is amazing!',
    'I had a similar experience',
    'Looking forward to more content like this',
    'Thanks for sharing!'
  ];
  
  for (let i = 0; i < count; i++) {
    comments.push({
      id: `comment-${i}-${Date.now()}`,
      authorName: ['CosmicFan', 'GalaxyRider', 'NebulaNomad', 'StarChild', 'VoidWanderer'][Math.floor(Math.random() * 5)],
      authorAvatar: Math.floor(Math.random() * 12) + 1,
      text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
      createdAt: new Date(Date.now() - Math.random() * 3600000 * 24).toISOString()
    });
  }
  
  return comments;
};

const likePost = (postId) => {
  // TODO: Implement actual like functionality on blockchain
  const post = userPosts.value.find(p => p.id === postId);
  if (post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }
};

const commentOnPost = (postId) => {
  const post = userPosts.value.find(p => p.id === postId);
  if (post) {
    post.showComments = !post.showComments;
  }
};

const addComment = (postId) => {
  const post = userPosts.value.find(p => p.id === postId);
  if (post && post.newComment?.trim()) {
    // TODO: Implement actual comment submission on blockchain
    
    post.comments.push({
      id: `comment-new-${Date.now()}`,
      authorName: authStore.player?.username || 'You',
      authorAvatar: authStore.player?.avatar || 1,
      text: post.newComment,
      createdAt: new Date().toISOString()
    });
    
    post.newComment = '';
  }
};

const repostPost = (postId) => {
  // TODO: Implement actual repost functionality on blockchain
  const post = userPosts.value.find(p => p.id === postId);
  if (post) {
    post.reposts++;
    // Show success notification
  }
};

const deletePost = (postId) => {
  // TODO: Implement actual delete functionality on blockchain
  if (confirm('Are you sure you want to delete this post?')) {
    userPosts.value = userPosts.value.filter(p => p.id !== postId);
    // Show success notification
  }
};

// Add to onMounted
// Fetch user posts
fetchUserPosts();
</script>

<style scoped>
/* Base Styles */
.player-profile {
  min-height: 100vh;
  background: var(--gradient-hero);
  color: var(--color-text-primary);
  font-family: 'Montserrat', sans-serif;
  padding: var(--space-xl) 0;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  width: 100%;
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface-secondary);
  backdrop-filter: blur(10px);
  z-index: var(--z-fixed);
  padding: var(--space-sm);
  border-top: var(--border-thin);
  transform: translateY(0);
  transition: transform var(--transition-slow);
}

.mobile-nav.hidden {
  transform: translateY(100%);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  gap: var(--space-xs);
  transition: all var(--transition-slow);
}

.nav-item.active {
  color: var(--color-primary);
  transform: translateY(-2px);
}

.nav-item.active .nav-icon {
  text-shadow: 0 0 10px var(--color-primary);
}

.nav-icon {
  font-size: var(--text-lg);
}

.nav-label {
  font-size: var(--text-xs);
  text-transform: capitalize;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
  padding: calc(var(--space-xxl) * 2) var(--space-xl);
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-large);
  margin-bottom: var(--space-xl);
  background: radial-gradient(circle at top left, rgba(0, 217, 255, 0.1), rgba(255, 0, 195, 0.05));
  border: var(--border-thin);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 217, 255, 0.1), rgba(255, 0, 195, 0.05));
  border-radius: var(--radius-large);
  overflow: hidden;
  z-index: var(--z-background);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.avatar-container {
  position: relative;
}

.avatar-frame {
  width: 180px;
  height: 180px;
  border-radius: var(--radius-circle);
  border: 4px solid rgba(0, 217, 255, 0.5);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-glow-primary);
}

.avatar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-circle);
  background: radial-gradient(circle, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 195, 0.05) 100%);
  z-index: var(--z-background);
  opacity: 0.5;
  animation: glow 2s infinite alternate;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.level-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--gradient-accent);
  color: white;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-large);
  font-weight: var(--weight-bold);
  box-shadow: var(--shadow-glow-primary);
}

.player-details {
  flex: 1;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.player-name {
  font-size: var(--text-3xl);
  font-weight: var(--weight-extra-bold);
  margin: 0;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: var(--shadow-glow-primary);
}

.player-title {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  margin: var(--space-sm) 0 var(--space-lg);
}

.player-description-container {
  margin-bottom: var(--space-md);
}

.player-description {
  color: var(--color-text-secondary);
  margin: var(--space-md) 0;
  font-size: var(--text-md);
  line-height: 1.5;
  position: relative;
  padding-right: 40px;
}

.edit-description-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  transition: all var(--transition-slow);
}

.edit-description-btn:hover {
  background: rgba(0, 217, 255, 0.1);
}

.player-meta {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meta-label {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-xs);
}

.meta-value {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.online-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-circle);
  background: var(--color-success);
}

.edit-profile-btn {
  position: absolute;
  top: 8rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all var(--transition-slow);
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-icon {
  font-size: var(--text-lg);
}

/* Main Content Layout */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-xl);
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-xl);
}

/* Sidebar */
.sidebar {
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  padding: var(--space-lg);
  height: fit-content;
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.sidebar-section {
  margin-bottom: var(--space-xl);
}

.sidebar-section h3 {
  color: var(--color-primary);
  margin-bottom: var(--space-md);
  font-size: var(--text-lg);
}

.principal-display {
  background: var(--color-surface-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.principal-text {
  font-family: 'Roboto Mono', monospace;
  font-size: var(--text-sm);
}

.icon-button {
  background: transparent;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-small);
  transition: all var(--transition-fast);
}

.icon-button:hover {
  background: rgba(0, 217, 255, 0.1);
}

.icon-button.success {
  color: var(--color-success);
}

.quick-stats {
  display: grid;
  gap: var(--space-md);
}

.stat-card {
  background: var(--color-surface-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.stat-icon {
  font-size: var(--text-lg);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

/* Content Area */
.content-area {
  display: grid;
  gap: var(--space-xl);
}

/* Content Section */
.content-section {
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  padding: var(--space-xl);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden; /* Prevent content from overflowing */
}

.content-section h2 {
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
  font-size: var(--text-xl);
  text-shadow: var(--shadow-glow-primary);
  word-break: break-word; /* Allow long titles to wrap */
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
  width: 100%;
  box-sizing: border-box;
}

.stat-tile {
  background: var(--color-surface-tertiary);
  padding: var(--space-lg);
  border-radius: var(--radius-medium);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* Prevent content from overflowing */
}

.stat-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  flex-wrap: wrap; /* Allow wrapping for small screens */
}

.stat-title {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  word-break: break-word; /* Allow long titles to wrap */
}

.stat-body {
  position: relative;
}

.stat-progress {
  position: relative;
  height: 4px;
  background: var(--gradient-accent);
  border-radius: 2px;
  margin-top: var(--space-sm);
  transition: width 1s ease-in-out;
}

.stat-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* Collection Section */
.collection-tabs {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  overflow-x: auto;
  padding-bottom: var(--space-sm);
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -ms-overflow-style: none; /* Hide scrollbar for IE and Edge */
  width: 100%;
  box-sizing: border-box;
}

.collection-tabs::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome, Safari, and Opera */
}

.tab {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-tertiary);
  border-radius: var(--radius-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-slow);
  flex-shrink: 0; /* Prevent tabs from shrinking */
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
  font-size: var(--text-lg);
}

.collection-grid {
  width: 100%;
  box-sizing: border-box;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-lg);
  width: 100%;
  box-sizing: border-box;
}

.nft-card {
  background: var(--color-surface-tertiary);
  border-radius: var(--radius-medium);
  overflow: hidden;
  transition: transform var(--transition-fast);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.nft-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: var(--shadow-medium);
}

.nft-image {
  aspect-ratio: 1;
  overflow: hidden;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-info {
  padding: var(--space-md);
}

/* Achievements Section */
.achievements-grid {
  display: grid;
  gap: var(--space-md);
}

.achievement-card {
  background: var(--color-surface-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  display: flex;
  gap: var(--space-md);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.achievement-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-circle);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-icon.completed {
  background: var(--gradient-accent);
}

.achievement-details {
  flex: 1;
}

.achievement-name {
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-sm);
  display: block;
}

.achievement-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-accent);
  border-radius: 2px;
}

/* Friends Section */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

.friend-card {
  background: var(--color-surface-tertiary);
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-circle);
  object-fit: cover;
}

.friend-info {
  flex: 1;
}

.friend-name {
  display: block;
  margin-bottom: var(--space-xs);
}

.friend-status {
  font-size: var(--text-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-large);
  background: rgba(255, 255, 255, 0.1);
}

.friend-status.online {
  background: rgba(0, 255, 0, 0.2);
  color: var(--color-success);
}

.friend-status.offline {
  color: var(--color-text-tertiary);
}

/* Empty States */
.empty-message {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-tertiary);
  font-style: italic;
}

/* Friend Actions */
.friend-actions {
  margin: var(--space-md) 0;
}

.friend-btn {
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-small);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  color: var(--color-text-primary);
  gap: var(--space-sm);
}

.friend-btn .btn-icon {
  font-size: var(--text-lg);
}

.friend-btn.add-friend {
  background-color: var(--color-info);
}

.friend-btn.add-friend:hover {
  background-color: #3a5cef;
}

.friend-btn.request-sent {
  background-color: var(--color-warning);
}

.friend-btn.request-sent:hover {
  background-color: #d97706;
}

.friend-btn.remove-friend {
  background-color: var(--color-error);
}

.friend-btn.remove-friend:hover {
  background-color: #dc2626;
}

.friend-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.friend-btn .loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-left: var(--space-sm);
}

/* Mobile Responsive Styles */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    padding: var(--space-md);
    width: 100%;
    box-sizing: border-box;
  }
  
  .sidebar {
    order: 2;
    width: 100%;
    box-sizing: border-box;
  }
  
  .content-area {
    order: 1;
    width: 100%;
    box-sizing: border-box;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .nft-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-xl) var(--space-md);
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: var(--space-md);
  }
  
  .player-header {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .player-name {
    font-size: var(--text-2xl);
  }
  
  .player-meta {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-md);
  }
  
  .meta-item {
    flex: 1 0 30%;
  }
  
  .content-section {
    padding: var(--space-lg);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  
  .nft-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
  
  .friends-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mobile-nav {
    display: flex;
    justify-content: space-around;
  }
}

@media (max-width: 480px) {
  .player-profile {
    padding: var(--space-md) 0;
  }
  
  .hero-section {
    padding: var(--space-lg) var(--space-sm);
    margin-bottom: var(--space-md);
    border-radius: var(--radius-medium);
  }
  
  .avatar-frame {
    width: 120px;
    height: 120px;
  }
  
  .level-badge {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
  }
  
  .player-name {
    font-size: var(--text-xl);
  }
  
  .player-title {
    font-size: var(--text-md);
    margin: var(--space-xs) 0 var(--space-md);
  }
  
  .player-description {
    font-size: var(--text-sm);
    padding-right: 0;
  }
  
  .edit-description-btn {
    position: static;
    transform: none;
    margin-top: var(--space-sm);
    display: inline-flex;
  }
  
  .main-content {
    padding: var(--space-sm);
    gap: var(--space-md);
  }
  
  .sidebar-section {
    margin-bottom: var(--space-md);
  }
  
  .content-section {
    padding: var(--space-md);
  }
  
  .content-section h2 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-md);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
  
  .stat-tile {
    padding: var(--space-md);
  }
  
  .collection-tabs {
    gap: var(--space-sm);
  }
  
  .tab {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
    flex-shrink: 0; /* Prevent tabs from shrinking */
  }
  
  .nft-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
  
  .achievement-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .achievement-icon {
    width: 48px;
    height: 48px;
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
  }
  
  .friend-card {
    padding: var(--space-sm);
  }
  
  .friend-avatar {
    width: 36px;
    height: 36px;
  }
  
  .nav-item {
    padding: var(--space-xs);
  }
  
  .nav-icon {
    font-size: var(--text-md);
  }
  
  .nav-label {
    font-size: 0.65rem;
  }
  
  /* Extra small screens */
  @media (max-width: 360px) {
    .nft-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}

/* Post Section Styles */
.posts-section {
  margin-bottom: 2rem;
}

.post-creation-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.post-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: 16px;
  padding: 8px 0;
  resize: none;
  outline: none;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.post-attachments {
  display: flex;
  gap: 12px;
}

.attachment-btn {
  background: transparent;
  color: var(--color-primary);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attachment-btn:hover {
  background-color: rgba(15, 154, 255, 0.1);
}

.attachment-icon {
  font-size: 18px;
}

.post-submit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-submit-btn:hover {
  background-color: #0d86da;
}

.post-submit-btn:disabled {
  background-color: #525252;
  cursor: not-allowed;
}

/* Posts Feed */
.posts-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.post-author-info {
  flex: 1;
  margin-left: 12px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-weight: 600;
}

.author-level {
  font-size: 0.8rem;
  padding: 2px 6px;
  background: rgba(15, 154, 255, 0.1);
  color: var(--color-primary);
  border-radius: 4px;
}

.post-meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.post-menu {
  display: flex;
  align-items: center;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.menu-icon {
  font-size: 14px;
}

.post-content {
  padding: 0 16px 16px 16px;
}

.post-text {
  margin-bottom: 12px;
  line-height: 1.5;
}

.post-media {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.post-actions {
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
}

.action-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.action-icon.active {
  color: #e74c3c;
}

.action-count {
  font-size: 0.9rem;
}

/* Comments Section */
.comments-section {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
  flex-shrink: 0;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
}

.comment-author {
  font-weight: 600;
  margin-bottom: 4px;
}

.comment-text {
  margin-bottom: 8px;
  line-height: 1.4;
}

.comment-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.add-comment {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.comment-input-container {
  flex: 1;
  display: flex;
  gap: 8px;
}

.comment-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  color: var(--color-text-primary);
  padding: 8px 16px;
  font-size: 14px;
  resize: none;
  outline: none;
}

.comment-submit {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-submit:disabled {
  background-color: #525252;
  cursor: not-allowed;
}

.empty-posts {
  text-align: center;
  padding: 48px 24px;
  background: rgba(25, 35, 45, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

/* 
  ENHANCEMENT OPPORTUNITY: 
  Add micro-interactions to make the profile feel more responsive and alive
*/

@keyframes badge-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(0, 217, 255, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 10px rgba(0, 217, 255, 0.6); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(0, 217, 255, 0.4); }
}

.level-badge {
  animation: badge-pulse 3s infinite ease-in-out;
}

/* ENHANCEMENT OPPORTUNITY:
   Add hover effects for interactive elements to improve UX */
.achievement-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.achievement-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* ENHANCEMENT OPPORTUNITY:
   Add smooth transitions for tab switching */
.content-section {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.content-section.entering {
  opacity: 0;
  transform: translateY(10px);
}

.content-section.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>