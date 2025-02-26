<template>
  <div class="player-profile">
    <!-- Loading Overlay -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>Loading profile data...</p>
    </div>

    <!-- Error Message -->
    <div class="error-message" v-if="loadingError">
      <p>{{ loadingError }}</p>
      <button @click="retryLoading">Retry</button>
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
            <div class="level-badge">{{ player.level }}</div>
          </div>
        </div>
        <div class="player-details">
          <h1 class="player-name">{{ player.username }}</h1>
          <p class="player-title">{{ player.title || 'Galactic Adventurer' }}</p>
          <p class="player-description" v-if="!isEditingDescription">
            {{ player.description || 'No description yet' }}
            <button class="edit-description-btn" @click="startEditingDescription">
              <span class="edit-icon">✏️</span>
              Edit
            </button>
          </p>
          <div class="description-form" v-else>
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
        <button class="edit-profile-btn" @click="startEditingProfile" v-if="!isEditingProfile">
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
            </div>
          </div>
          <div class="collection-grid">
            <div v-for="category in nftCategories" :key="category.type">
              <div class="nft-grid" v-if="category.items.length">
                <div class="nft-card" v-for="nft in category.items" :key="nft.id">
                  <div class="nft-image">
                    <img :src="nft.image" :alt="nft.name" />
                  </div>
                  <div class="nft-info">
                    <span class="nft-name">{{ nft.name }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="empty-message">No {{ category.title.toLowerCase() }} collected yet</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useStatisticsStore } from '@/stores/stats';
import { useACHStore } from '@/stores/ach';
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

const authStore = useAuthStore();
const statsStore = useStatisticsStore();
const achStore = useACHStore();
const canisterStore = useCanisterStore();
const route = useRoute();
const copySuccess = ref(false);

// State
const playerStats = ref(null);
const averageStats = ref(null);
const achievements = ref([]);
const nftCategories = ref([
  { type: 'characters', title: 'Characters', items: [] },
  { type: 'units', title: 'Units', items: [] },
  { type: 'avatars', title: 'Avatars', items: [] },
  { type: 'trophies', title: 'Trophies', items: [] },
  { type: 'chests', title: 'Chests', items: [] }
]);
const friends = ref([]);
const activeTab = ref('profile');
const activeCollection = ref('characters');
const isLoading = ref(true);
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

// Use the player data from the auth store
const player = computed(() => authStore.player || {});

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
  try {
    isLoading.value = true;
    loadingError.value = null;

    // Fetch player stats
    await statsStore.fetchPlayerStats();
    playerStats.value = statsStore.playerStats;
    averageStats.value = statsStore.averageStats;

    // Update max stats based on average stats
    if (averageStats.value) {
      maxStats.value = {
        totalDamageDealt: averageStats.value.totalDamageDealt * 2,
        totalDamageEvaded: averageStats.value.totalDamageEvaded * 2,
        energyGenerated: averageStats.value.energyGenerated * 2,
        energyUsed: averageStats.value.energyUsed * 2
      };
    }

    // Fetch achievements
    await achStore.fetchAchievements();
    achievements.value = processAchievements(achStore.categories);

    // Fetch NFTs for each category
    await Promise.all(nftCategories.value.map(async category => {
      const nfts = await fetchNFTsByCategory(category.type);
      category.items = processNFTs(nfts);
    }));

    // Fetch friends list
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (cosmicrafts) {
      try {
        const friendsList = await cosmicrafts.getFriendsList();
        friends.value = await processFriendsList(friendsList);
      } catch (error) {
        console.error('Error fetching friends list:', error);
        friends.value = [];
      }
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
    loadingError.value = error.message;
  } finally {
    isLoading.value = false;
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
    const identity = authStore.getIdentity();
    if (!identity) return '';
    return identity.getPrincipal().toText();
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
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy principal:', err);
    }
  }
};

// NFT processing functions
const fetchNFTsByCategory = async (category) => {
  const cosmicrafts = await canisterStore.get("cosmicrafts");
  if (!cosmicrafts) {
    throw new Error("Cosmicrafts canister not initialized");
  }
  const principal = authStore.getIdentity()?.getPrincipal();
  if (!principal) {
    throw new Error("No principal available");
  }
  switch (category) {
    case 'characters': return cosmicrafts.getCharacters(principal);
    case 'units': return cosmicrafts.getUnits(principal);
    case 'avatars': return cosmicrafts.getAvatars(principal);
    case 'trophies': return cosmicrafts.getTrophies(principal);
    case 'chests': return cosmicrafts.getChests(principal);
    default: return [];
  }
};

const processNFTs = (nfts) => {
  return nfts.map(nft => ({
    id: nft[0],
    name: nft[1].name || 'Unknown',
    image: nft[1].thumbnail || '',
    metadata: nft[1]
  }));
};

const processFriendsList = async (friendsList) => {
  if (!friendsList || !Array.isArray(friendsList)) return [];
  const cosmicrafts = await canisterStore.get("cosmicrafts");
  if (!cosmicrafts) return [];
  
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
        principal = Principal.fromText(friendId);
      } else if (friendId instanceof Principal) {
        principal = friendId;
      } else if (typeof friendId === 'object' && friendId.toText) {
        principal = friendId;
      } else {
        console.error('Unexpected friend ID format:', friendId);
        return null;
      }

      const profile = await cosmicrafts.getPlayer(principal);
      if (!profile || profile.length === 0) return null;
      const playerData = profile[0];
      
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
</script>

<style scoped>
/* Base Styles */
.player-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1729 0%, #1a1f35 100%);
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
  padding: 4rem 2rem;
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

.description-form .form-actions .save-btn {
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

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 41, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 217, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00d9ff;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error Message */
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.1);
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.error-message button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-message button:hover {
  background: rgba(255, 255, 255, 0.2);
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
  top: 1rem;
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
</style>