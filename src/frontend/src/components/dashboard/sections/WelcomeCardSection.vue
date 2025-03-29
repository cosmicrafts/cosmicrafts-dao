<!-- WelcomeCardSection.vue -->
<template>
  <section class="welcome-card cosmic-panel">
    <div class="cosmic-particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>
    
    <div class="welcome-content">
      <div class="welcome-user-info">
        <img :src="avatarUrl" alt="User Avatar" class="welcome-avatar" />
        <div class="welcome-text">
          <h2>Welcome back, {{ player?.username || 'Explorer' }}!</h2>
          <div class="user-details">
            <span class="user-title">{{ player?.title || 'Cosmic Recruit' }}</span>
            <div class="level-indicator">
              <div class="level-badge">{{ player?.level || 1 }}</div>
              <div class="xp-bar">
                <div class="xp-progress" :style="{ width: `${playerXpPercentage}%` }"></div>
              </div>
              <span class="xp-text">{{ player?.xp || 0 }}/{{ nextLevelXp }} XP</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stats-summary">
        <div class="stat-summary-item">
          <div class="summary-value">${{ totalTokenValue.toFixed(2) }}</div>
          <div class="summary-label">Portfolio Value</div>
        </div>
        <div class="stat-summary-item">
          <div class="summary-value">{{ totalNFTs }}</div>
          <div class="summary-label">NFT Collection</div>
        </div>
        <div class="stat-summary-item">
          <div class="summary-value">{{ activeQuests }}</div>
          <div class="summary-label">Active Quests</div>
        </div>
      </div>
      
      <div class="daily-checkin" v-if="!hasDailyCheckin">
        <button @click="claimDailyReward" class="cosmic-button cosmic-button-primary checkin-button">
          <i class="fas fa-gift"></i>
          <span>Claim Daily Reward</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import { useNftsStore } from '@/stores/nfts';

// Props with defaults
const props = defineProps({
  // Allow customizing which user info to show
  showXp: { type: Boolean, default: true },
  showStats: { type: Boolean, default: true },
  showDailyCheckin: { type: Boolean, default: true }
});

// Emits
const emit = defineEmits(['daily-reward-claimed']);

// Stores
const authStore = useAuthStore();
const tokenStore = useTokenStore();
const nftsStore = useNftsStore();

// Player info
const player = computed(() => authStore.player);

// Daily check-in state
const hasDailyCheckin = ref(false);

// Avatar URL
const avatarUrl = computed(() => {
  if (player.value?.avatar) {
    return `/assets/avatars/avatar-${player.value.avatar}.webp`;
  }
  return '/assets/avatars/avatar-default.webp';
});

// Player XP percentage for progress bar
const playerXpPercentage = computed(() => {
  const currentXp = player.value?.xp ? Number(player.value.xp) : 0;
  const currentLevel = player.value?.level ? Number(player.value.level) : 1;
  
  // Calculate XP needed for next level (example formula)
  const xpForNextLevel = currentLevel * 1000;
  
  // Calculate percentage (cap at 100%)
  return Math.min(Math.floor((currentXp / xpForNextLevel) * 100), 100);
});

// Next level XP requirement
const nextLevelXp = computed(() => {
  const currentLevel = player.value?.level ? Number(player.value.level) : 1;
  return currentLevel * 1000;
});

// Token value
const totalTokenValue = computed(() => {
  return tokenStore.tokenList.reduce((total, token) => {
    const value = token.valueUsd ? Number(token.valueUsd) : 0;
    return total + value;
  }, 0);
});

// Total NFTs
const totalNFTs = computed(() => {
  return Object.values(nftsStore.nftsByCategory).reduce((total, category) => {
    return total + (category?.length || 0);
  }, 0);
});

// Active quests
const activeQuests = computed(() => {
  return player.value?.activeMissions?.length || 3;
});

// Daily reward claim function
const claimDailyReward = () => {
  // Call API to claim reward (mock for now)
  
  // Set claimed state
  hasDailyCheckin.value = true;
  
  // Add vibration if available
  if (navigator.vibrate) {
    navigator.vibrate([50, 50, 150]);
  }
  
  // Emit event to parent
  emit('daily-reward-claimed', {
    reward: {
      tokens: 50,
      xp: 25
    }
  });
};
</script>

<style scoped>
/* Welcome Card Styles */
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
</style> 