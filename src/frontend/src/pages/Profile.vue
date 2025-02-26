<template>
  <div class="player-profile cosmic-background">
    <!-- Glowing avatar frame 🖼️ -->
    <div class="avatar-frame">
      <img :src="playerAvatar" alt="Player Avatar" class="avatar" />
      <div class="glow"></div>
    </div>

    <!-- Player info 🚀 -->
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

      <!-- Additional Player Stats -->
      <div class="player-stats">
        <div class="stat-item">
          <span class="stat-label">Level</span>
          <span class="stat-value">{{ player.level }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">ELO Rating</span>
          <span class="stat-value">{{ formatElo(player.elo) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Member Since</span>
          <span class="stat-value">{{ formatDate(player.registration_date) }}</span>
        </div>
      </div>

      <!-- Player Description -->
      <div class="player-description" v-if="player.description && player.description !== ''">
        <h3>About Me</h3>
        <p>{{ player.description }}</p>
      </div>
      <div class="player-description empty" v-else>
        <p class="no-description">No description yet</p>
      </div>

      <!-- Associated Entities -->
      <div class="associated-entities" v-if="player.associated_entities?.length">
        <h3>Associated Entities</h3>
        <div class="entity-list">
          <span v-for="entity in player.associated_entities" :key="entity" class="entity-tag">
            {{ formatPrincipal(entity) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
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

const authStore = useAuthStore();
const route = useRoute();
const copySuccess = ref(false);

// Use the player data from the auth store
const player = computed(() => authStore.player || {});

// Array of all available avatars
const avatarSrcArray = [
  avatar1, avatar2, avatar3, avatar4, avatar5, avatar6,
  avatar7, avatar8, avatar9, avatar10, avatar11, avatar12
];

// Dynamically load the player avatar based on the avatar ID
const playerAvatar = computed(() => {
  // Avatar IDs are 1-based, so we subtract 1 for array index
  const avatarIndex = (player.value?.avatar || 1) - 1;
  return avatarSrcArray[avatarIndex] || avatar1; // Fallback to avatar1 if not found
});

// Helper functions for formatting
const formatElo = (elo) => {
  return elo ? Math.round(elo).toLocaleString() : '1000';
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  // Convert Nat64 nanoseconds to milliseconds (divide by 1_000_000)
  const milliseconds = Number(timestamp) / 1_000_000;
  return new Date(milliseconds).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getPrincipalString = computed(() => {
  if (!player.value?.id) return '';
  const parsed = JSON.parse(
    JSON.stringify(player.value.id, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
  // Extract just the principal string from the object
  return parsed.__principal__ || '';
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
</style>