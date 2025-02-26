<template>
  <div class="player-profile">
    <!-- Mobile Navigation (only visible on mobile) -->
    <div class="mobile-nav">
      <div class="nav-item active">Profile</div>
      <div class="nav-item">Stats</div>
      <div class="nav-item">Collection</div>
      <div class="nav-item">Social</div>
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
                <div class="stat-progress" :style="{ width: '75%' }"></div>
              </div>
            </div>
            <div class="stat-tile">
              <div class="stat-header">
                <span class="stat-icon">🛡️</span>
                <span class="stat-title">Damage Evaded</span>
              </div>
              <div class="stat-body">
                <span class="stat-value">{{ formatNumber(playerStats?.totalDamageEvaded) }}</span>
                <div class="stat-progress" :style="{ width: '60%' }"></div>
              </div>
            </div>
            <div class="stat-tile">
              <div class="stat-header">
                <span class="stat-icon">⚡</span>
                <span class="stat-title">Energy Generated</span>
              </div>
              <div class="stat-body">
                <span class="stat-value">{{ formatNumber(playerStats?.energyGenerated) }}</span>
                <div class="stat-progress" :style="{ width: '85%' }"></div>
              </div>
            </div>
            <div class="stat-tile">
              <div class="stat-header">
                <span class="stat-icon">🔋</span>
                <span class="stat-title">Energy Used</span>
              </div>
              <div class="stat-body">
                <span class="stat-value">{{ formatNumber(playerStats?.energyUsed) }}</span>
                <div class="stat-progress" :style="{ width: '70%' }"></div>
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
                 :class="{ 'active': category.type === 'characters' }">
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
            <div class="achievement-card" v-for="achievement in achievements" :key="achievement.id">
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
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  padding: 0.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.nav-item.active {
  color: #00d9ff;
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
  height: 4px;
  background: linear-gradient(90deg, #00d9ff, #ff00c3);
  border-radius: 2px;
  margin-top: 0.5rem;
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
  transform: translateY(-5px);
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
</style>