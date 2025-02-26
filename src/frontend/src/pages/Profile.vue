<template>
  <div class="player-profile cosmic-background">
    <!-- Top Section with Avatar and Basic Info -->
    <div class="profile-header">
      <div class="avatar-frame">
        <img :src="playerAvatar" alt="Player Avatar" class="avatar" />
        <div class="glow"></div>
      </div>

      <div class="player-info">
        <h1 class="player-name">{{ player.username }}</h1>
        <p class="player-title">{{ player.title || 'Galactic Adventurer' }}</p>
        
        <!-- Principal ID -->
        <div class="principal-id" :title="getPrincipalString">
          <span class="principal-label">Principal ID</span>
          <div class="principal-container">
            <span class="principal-value">{{ formatPrincipal(getPrincipalString) }}</span>
            <button class="copy-button" @click="copyPrincipal" :class="{ 'copied': copySuccess }">
              <span v-if="!copySuccess">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </span>
              <span v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="profile-content">
      <!-- Left Column: Stats -->
      <div class="profile-section stats-section">
        <h2>Player Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Level</span>
            <span class="stat-value">{{ player.level }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">ELO Rating</span>
            <span class="stat-value">{{ formatElo(player.elo) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Games Played</span>
            <span class="stat-value">{{ playerStats?.gamesPlayed || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Win Rate</span>
            <span class="stat-value">{{ calculateWinRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total XP</span>
            <span class="stat-value">{{ formatNumber(playerStats?.totalXpEarned) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Member Since</span>
            <span class="stat-value">{{ formatDate(player.registration_date) }}</span>
          </div>
        </div>

        <!-- Combat Stats -->
        <h3>Combat Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Kills</span>
            <span class="stat-value">{{ formatNumber(playerStats?.totalKills) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Damage Dealt</span>
            <span class="stat-value">{{ formatNumber(playerStats?.totalDamageDealt) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Critical Hits</span>
            <span class="stat-value">{{ formatNumber(playerStats?.totalDamageCrit) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Damage Evaded</span>
            <span class="stat-value">{{ formatNumber(playerStats?.totalDamageEvaded) }}</span>
          </div>
        </div>

        <!-- Energy Stats -->
        <h3>Energy Management</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Energy Generated</span>
            <span class="stat-value">{{ formatNumber(playerStats?.energyGenerated) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Energy Used</span>
            <span class="stat-value">{{ formatNumber(playerStats?.energyUsed) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Energy Efficiency</span>
            <span class="stat-value">{{ calculateEnergyEfficiency }}%</span>
          </div>
        </div>
      </div>

      <!-- Right Column: NFTs, Achievements, Friends -->
      <div class="profile-section collection-section">
        <!-- NFT Collections -->
        <div class="collection-grid">
          <div class="collection-category" v-for="category in nftCategories" :key="category.type">
            <h3>{{ category.title }}</h3>
            <div class="nft-grid" v-if="category.items.length">
              <div class="nft-item" v-for="nft in category.items" :key="nft.id">
                <img :src="nft.image" :alt="nft.name" />
                <span class="nft-name">{{ nft.name }}</span>
              </div>
            </div>
            <p v-else class="empty-collection">No {{ category.title.toLowerCase() }} collected yet</p>
          </div>
        </div>

        <!-- Achievements -->
        <div class="achievements-section" v-if="achievements.length">
          <h3>Achievements</h3>
          <div class="achievements-grid">
            <div class="achievement-item" v-for="achievement in achievements" :key="achievement.id">
              <div class="achievement-icon" :class="{ 'completed': achievement.completed }">
                <img :src="achievement.icon" :alt="achievement.name" />
              </div>
              <div class="achievement-info">
                <span class="achievement-name">{{ achievement.name }}</span>
                <div class="achievement-progress">
                  <div class="progress-bar" :style="{ width: `${achievement.progress}%` }"></div>
                </div>
                <span class="progress-text">{{ achievement.progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Friends List -->
        <div class="friends-section" v-if="friends.length">
          <h3>Friends</h3>
          <div class="friends-grid">
            <div class="friend-item" v-for="friend in friends" :key="friend.id">
              <img :src="friend.avatar" :alt="friend.username" class="friend-avatar" />
              <span class="friend-name">{{ friend.username }}</span>
              <span class="friend-status" :class="friend.status">{{ friend.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <div class="profile-section description-section">
      <h3>About Me</h3>
      <div class="player-description" v-if="player.description">
        <p>{{ player.description }}</p>
      </div>
      <div class="player-description empty" v-else>
        <p class="no-description">No description yet</p>
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
    // Fetch player stats
    await statsStore.fetchPlayerStats();
    playerStats.value = statsStore.playerStats;
    averageStats.value = statsStore.averageStats;

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
        // Get friends list without parameters - it should use the caller's context
        const friendsList = await cosmicrafts.getFriendsList();
        friends.value = await processFriendsList(friendsList);
      } catch (error) {
        console.error('Error fetching friends list:', error);
        friends.value = [];
      }
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
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
</script>

<style scoped>
/* Cosmic background 🌌 */
.cosmic-background {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
}

/* Glowing avatar frame 🖼️ */
.avatar-frame {
  position: relative;
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 2rem;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Player info 🚀 */
.player-info {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.player-name {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #00d9ff, #ff00c3);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.player-title {
  font-size: 1.2rem;
  color: #00d9ff;
  margin-bottom: 2rem;
}

/* Player Stats */
.player-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #00d9ff;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

/* Principal ID styles */
.principal-id {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  transition: all 0.3s ease;
}

.principal-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.principal-label {
  font-size: 0.8rem;
  color: #00d9ff;
}

.principal-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
  color: white;
  letter-spacing: 0.5px;
  margin-right: auto;
}

.copy-button {
  background: transparent;
  border: none;
  color: #00d9ff;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  margin-left: 1rem;
}

.copy-button:hover {
  background: rgba(0, 217, 255, 0.1);
}

.copy-button.copied {
  color: #00ff95;
}

/* Player Description */
.player-description {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  color: #e0e0e0;
  line-height: 1.6;
}

.player-description h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.player-description.empty {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
}

.no-description {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  font-size: 0.9rem;
}

/* Associated Entities */
.associated-entities {
  margin-top: 2rem;
}

.associated-entities h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
}

.entity-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.entity-tag {
  background: rgba(0, 217, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  color: #00d9ff;
  border: 1px solid rgba(0, 217, 255, 0.3);
}

/* Glow effect */
.glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.5),
              0 0 40px rgba(255, 0, 195, 0.3);
  pointer-events: none;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-section {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.collection-grid {
  display: grid;
  gap: 2rem;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.nft-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  transition: transform 0.2s;
}

.nft-item:hover {
  transform: scale(1.05);
}

.nft-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  font-size: 0.8rem;
  text-align: center;
}

.achievements-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-icon.completed {
  background: linear-gradient(45deg, #00d9ff, #ff00c3);
}

.achievement-info {
  flex: 1;
}

.achievement-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-status {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.friend-status.online {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.friend-status.offline {
  background: rgba(255, 255, 255, 0.1);
  color: #888;
}

h2, h3 {
  color: #00d9ff;
  margin-bottom: 1rem;
}

.empty-collection {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>