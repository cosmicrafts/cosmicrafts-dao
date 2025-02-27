<template>
  <div class="player-profile">
    <!-- Error Message -->
    <div class="error-message" v-if="loadingError">
      <h3>Profile Error</h3>
      <p>{{ loadingError }}</p>
      <div class="error-actions">
        <button @click="retryLoading" class="retry-btn">
          <span class="retry-icon">🔄</span>
          Retry
        </button>
        <router-link to="/" class="home-btn">
          <span class="home-icon">🏠</span>
          Go Home
        </router-link>
      </div>
      <p class="error-help">
        This profile might not exist or might be temporarily unavailable. 
        If you entered a username, try accessing by Principal ID instead, or vice versa.
      </p>
    </div>

    <!-- Mobile Navigation -->
    <div class="mobile-nav">
      <div class="nav-item" 
           v-for="tab in ['profile', 'stats', 'collection', 'social']" 
           :key="tab"
           :class="{ 'active': activeTab === tab }"
           @click="activeTab = tab">
        <span class="nav-icon">
          {{ getTabIcon(tab) }}
        </span>
        <span class="nav-label">{{ tab }}</span>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="avatar-container">
    <div class="avatar-frame">
      <img :src="playerAvatar" alt="Player Avatar" class="avatar" />
            <div class="level-badge">{{ player.level || '?' }}</div>
    </div>
        </div>
        <div class="player-details">
          <h1 class="player-name">{{ player.username || 'Unknown Player' }}</h1>
      <p class="player-title">{{ player.title || 'Galactic Adventurer' }}</p>
      <p class="registration-date">{{ formattedRegistrationDate }}</p>
          <p class="player-description" v-if="!isEditingDescription">
            {{ player.description || 'No description yet' }}
            <button class="edit-description-btn" @click="startEditingDescription" v-if="showEditControls">
              <span class="edit-icon">✏️</span>
              Edit
            </button>
          </p>
          <div class="description-form" v-else-if="showEditControls">
            <textarea 
              v-model="descriptionForm.description"
              :disabled="descriptionForm.isSubmitting"
              maxlength="500"
              placeholder="Tell us about yourself..."
            ></textarea>
            <div class="char-count">{{ descriptionForm.description.length }}/500</div>
            <div class="form-actions">
              <button 
                type="button" 
                @click="isEditingDescription = false"
                :disabled="descriptionForm.isSubmitting"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                @click="saveDescription"
                :disabled="descriptionForm.isSubmitting"
                class="save-btn"
              >
                {{ descriptionForm.isSubmitting ? 'Saving...' : 'Save' }}
              </button>
            </div>
            <div class="error-message" v-if="descriptionForm.error">
              {{ descriptionForm.error }}
            </div>
          </div>
          <div class="player-meta">
            <div class="meta-item">
              <span class="meta-label">ELO</span>
              <span class="meta-value">{{ formatElo(player.elo) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Win Rate</span>
              <span class="meta-value">{{ calculateWinRate }}%</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Games</span>
              <span class="meta-value">{{ playerStats?.gamesPlayed || 0 }}</span>
            </div>
          </div>
        </div>
        <button class="edit-profile-btn" @click="startEditingProfile" v-if="showEditControls && !isEditingProfile">
          <span class="edit-icon">✏️</span>
          Edit Profile
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Sidebar (Desktop) -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3>Player ID</h3>
          <div class="principal-display" :title="getPrincipalString">
            <span class="principal-text">{{ formatPrincipal(getPrincipalString) }}</span>
            <button class="icon-button" @click="copyPrincipal" :class="{ 'success': copySuccess }">
              <span v-if="!copySuccess">📋</span>
              <span v-else>✓</span>
            </button>
      </div>
        </div>

        <div class="sidebar-section">
          <h3>Quick Stats</h3>
          <div class="quick-stats">
            <div class="stat-card">
              <div class="stat-icon">⚔️</div>
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(playerStats?.totalKills) }}</span>
                <span class="stat-label">Total Kills</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <span class="stat-value">{{ calculateEnergyEfficiency }}%</span>
                <span class="stat-label">Energy Efficiency</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(playerStats?.totalDamageCrit) }}</span>
                <span class="stat-label">Critical Hits</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="content-area">
        <!-- Stats Section -->
        <section class="content-section stats-section">
          <h2>Combat Statistics</h2>
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
                  <span class="stat-title">Damage Dealt</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.totalDamageDealt) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('totalDamageDealt', maxStats.totalDamageDealt) + '%' }"></div>
                </div>
              </div>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">🛡️</span>
                  <span class="stat-title">Damage Evaded</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.totalDamageEvaded) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('totalDamageEvaded', maxStats.totalDamageEvaded) + '%' }"></div>
                </div>
              </div>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">⚡</span>
                  <span class="stat-title">Energy Generated</span>
                </div>
                <div class="stat-body">
                  <span class="stat-value">{{ formatNumber(playerStats?.energyGenerated) }}</span>
                  <div class="stat-progress" :style="{ width: calculateStatProgress('energyGenerated', maxStats.energyGenerated) + '%' }"></div>
                </div>
              </div>
              <div class="stat-tile">
                <div class="stat-header">
                  <span class="stat-icon">🔋</span>
                  <span class="stat-title">Energy Used</span>
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
          <h2>NFT Collection</h2>
          <div class="collection-tabs">
            <div v-for="category in nftCategories" 
                 :key="category.type"
                 class="tab"
                 :class="{ 'active': activeCollection === category.type }"
                 @click="activeCollection = category.type">
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
                  <NFTCard 
                    v-for="nft in category.items" 
                    :key="nft.id"
                    :nft="nft"
                  />
                  <p v-if="category.items.length === 0" class="empty-message">
                    No {{ category.title.toLowerCase() }} collected yet
                  </p>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- Achievements Section -->
        <section class="content-section achievements-section" v-if="achievements.length">
          <h2>Achievements</h2>
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
          <h2>Friends</h2>
          <div class="friends-grid">
            <div class="friend-card" v-for="friend in friends" :key="friend.id">
              <img :src="friend.avatar" :alt="friend.username" class="friend-avatar" />
              <div class="friend-info">
                <span class="friend-name">{{ friend.username }}</span>
                <span class="friend-status" :class="friend.status">{{ friend.status }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Profile Edit Modal -->
    <div class="modal" v-if="isEditingProfile">
      <div class="modal-content">
        <h2>Edit Profile</h2>
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label>Username</label>
            <input v-model="editForm.username" type="text" maxlength="20" />
          </div>
          <div class="form-group">
            <label>Title</label>
            <input v-model="editForm.title" type="text" maxlength="30" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editForm.description" maxlength="200"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="isEditingProfile = false">Cancel</button>
            <button type="submit">Save Changes</button>
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
              <span class="stat-label">Completed by</span>
              <span class="stat-value">23%</span>
      </div>
      <div class="stat">
              <span class="stat-label">Points</span>
              <span class="stat-value">100</span>
      </div>
    </div>
        </div>
      </div>
    </div>

    <!-- Add registration date display somewhere in your template -->
    <div class="registration-info">
      <span class="registration-date">{{ formattedRegistrationDate }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useStatisticsStore } from '../stores/stats';
import { useACHStore } from '../stores/ach';
import { useCanisterStore } from '@/stores/canister';
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
import NFTCard from '@/components/NFTCard.vue';

const authStore = useAuthStore();
const statsStore = useStatisticsStore();
const achStore = useACHStore();
const canisterStore = useCanisterStore();
const route = useRoute();
const copySuccess = ref(false);
const profileStore = useProfileStore();
const nftsStore = useNftsStore();

// State
const playerStats = ref(null);
const averageStats = ref(null);
const achievements = ref([]);
const playerAchievements = ref([]);
const nftCategories = ref([
  { type: 'characters', title: 'Characters', items: [], isLoading: false },
  { type: 'units', title: 'Units', items: [], isLoading: false },
  { type: 'avatars', title: 'Avatars', items: [], isLoading: false },
  { type: 'trophies', title: 'Trophies', items: [], isLoading: false },
  { type: 'chests', title: 'Chests', items: [], isLoading: false }
]);
const friends = ref([]);
const activeTab = ref('profile');
const activeCollection = ref('characters');
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
                categorizedNfts.forEach(nft => {
                  const nftCategory = nft.metadata.category?.toLowerCase() || 'characters';
                  const categoryObj = nftCategories.value.find(c => c.type === nftCategory);
                  if (categoryObj) {
                    categoryObj.items.push(nft);
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

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';

  // Convert nat64 (nanoseconds) to milliseconds by dividing by 1_000_000
  const milliseconds = Number(timestamp) / 1_000_000;

  // Create a Date object from the milliseconds
  const date = new Date(milliseconds);

  // Format the date as "Month, Year"
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
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
      // Log the raw NFT data for debugging
      console.log('Processing individual NFT:', nft);
      
      // Extract id and metadata from the array format
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

      // Construct the final NFT object
      const processedNFT = {
        id: id?.toString() || 'unknown',
        name: general.name || 'Unknown NFT',
        description: general.description || '',
        image: general.image || '/assets/webp/nft.webp',
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
    stats: '📊',
    collection: '🎮',
    social: '👥'
  };
  return icons[tab] || '📋';
};

const getCategoryIcon = (type) => {
  const icons = {
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
  if (!player.value || !player.value.registrationDate) return 'Unknown';
  return profileStore.formatRegistrationDate(player.value.registrationDate);
});
</script>

<style scoped>
/* Base Styles */
.player-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #464646 0%, #181818 100%);
  color: #ffffff;
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 41, 0.95);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.mobile-nav.hidden {
  transform: translateY(100%);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-label {
  font-size: 0.8rem;
  text-transform: capitalize;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.tab:hover {
  background: rgba(0, 217, 255, 0.1);
}

.tab.active {
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.2);
}

.tab-icon {
  font-size: 1.2rem;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)),
              url('@/assets/hero-bg.jpg') center/cover;
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-container {
  position: relative;
}

.avatar-frame {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 4px solid rgba(0, 217, 255, 0.5);
  overflow: hidden;
  position: relative;
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
  background: linear-gradient(135deg, #00d9ff, #ff00c3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
}

.player-details {
  flex: 1;
}

.player-name {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(45deg, #00d9ff, #ff00c3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.player-title {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 1.5rem;
}

.player-description {
  color: rgba(255, 255, 255, 0.8);
  margin: 1rem 0;
  font-size: 1.1rem;
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
  color: #00d9ff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.edit-description-btn:hover {
  background: rgba(0, 217, 255, 0.1);
}

.description-form {
  margin: 1rem 0;
  position: relative;
}

.description-form textarea {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
}

.description-form textarea:focus {
  outline: none;
  border-color: #00d9ff;
  box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2);
}

.description-form .char-count {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.description-form .form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.description-form .form-actions button {
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.description-form .form-actions button[type="button"] {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.description-form .form-actions button[type="submit"] {
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  color: white;
}

.description-form .form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.description-form .error-message {
  margin-top: 1rem;
  color: #ff4444;
  font-size: 0.9rem;
  padding: 0.5rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 0.25rem;
  text-align: center;
}

.player-meta {
  display: flex;
  gap: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meta-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.meta-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d9ff;
}

/* Main Content Layout */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

/* Sidebar */
.sidebar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.principal-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.principal-text {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
}

.icon-button {
  background: transparent;
  border: none;
  color: #00d9ff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.icon-button:hover {
  background: rgba(0, 217, 255, 0.1);
}

.icon-button.success {
  color: #00ff95;
}

.quick-stats {
  display: grid;
  gap: 1rem;
}

.stat-card {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

/* Content Area */
.content-area {
  display: grid;
  gap: 2rem;
}

.content-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
}

.content-section h2 {
  color: #00d9ff;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-tile {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-title {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.stat-body {
  position: relative;
}

.stat-progress {
  position: relative;
  height: 4px;
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  border-radius: 2px;
  margin-top: 0.5rem;
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
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab {
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
}

.tab.active {
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.nft-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s;
}

.nft-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.15);
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
  padding: 1rem;
}

/* Achievements Section */
.achievements-grid {
  display: grid;
  gap: 1rem;
}

.achievement-card {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  gap: 1rem;
}

.achievement-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-icon.completed {
  background: linear-gradient(45deg, #00d9ff, #ff00c3);
}

.achievement-details {
  flex: 1;
}

.achievement-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

.achievement-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  border-radius: 2px;
}

/* Friends Section */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.friend-card {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
}

.friend-name {
  display: block;
  margin-bottom: 0.25rem;
}

.friend-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
}

.friend-status.online {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff95;
}

.friend-status.offline {
  color: rgba(255, 255, 255, 0.5);
}

/* Empty States */
.empty-message {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: 2;
  }
  
  .content-area {
    order: 1;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .player-meta {
    justify-content: center;
  }
  
  .mobile-nav {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  
  .main-content {
    padding: 1rem;
    padding-bottom: 5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .collection-tabs {
    justify-content: start;
  }
  
  .nft-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .friends-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 1rem;
}

.player-name {
    font-size: 2rem;
  }
  
  .avatar-frame {
    width: 120px;
    height: 120px;
  }
  
  .content-section {
    padding: 1rem;
  }
}

/* Add smooth transitions for all interactive elements */
.content-section,
.nft-card,
.achievement-card,
.friend-card,
.stat-card {
  transition: all 0.3s ease;
}

.content-section {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced hover effects */
.nft-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 217, 255, 0.15);
}

.achievement-card:hover {
  transform: translateX(5px);
  background: rgba(0, 0, 0, 0.3);
}

.friend-card:hover {
  transform: translateX(5px);
  background: rgba(0, 0, 0, 0.3);
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(0, 0, 0, 0.3);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #00d9ff, #ff00c3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #ff00c3, #00d9ff);
}

/* Error Message */
.error-message {
  background: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  text-align: center;
  color: #fff;
}

.error-message h3 {
  color: #ff5555;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

.retry-btn, .home-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.retry-btn:hover, .home-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-help {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 10px;
}

/* Profile Edit Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 41, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
  animation: slideUp 0.3s ease;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #00d9ff;
  box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.2);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.form-actions button[type="button"] {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.form-actions button[type="submit"] {
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  color: white;
}

.form-actions button:hover {
  transform: translateY(-2px);
}

.edit-profile-btn {
  position: absolute;
  top: 8rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-icon {
  font-size: 1.2rem;
}

.achievement-modal .modal-content {
  max-width: 600px;
}

.achievement-details {
  text-align: center;
}

.achievement-icon.large {
  width: 96px;
  height: 96px;
  margin: 0 auto 1.5rem;
}

.achievement-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d9ff;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.registration-info {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #888;
  text-align: center;
}

.registration-date {
  font-size: 0.9rem;
  color: #888;
  margin-top: 5px;
  margin-bottom: 10px;
  font-style: italic;
}

/* Add skeleton loading styles */
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-text {
  height: 1em;
  width: 80%;
  background: rgba(255, 255, 255, 0.05);
  margin: 0.5em 0;
  border-radius: 4px;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-progress {
  height: 4px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  margin-top: 0.5rem;
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>