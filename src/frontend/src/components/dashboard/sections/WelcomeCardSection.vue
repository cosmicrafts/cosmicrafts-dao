<!-- WelcomeCardSection.vue -->
<template>
  <section class="dashboard-section welcome-card cosmic-panel">
    <!-- Decorative particles -->
    <div class="cosmic-particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>
    
    <div class="welcome-content">
      <!-- User Welcome Info -->
      <div class="welcome-user-info">
        <img 
          :src="avatarUrl" 
          :alt="player?.username || 'User'" 
          class="welcome-avatar"
        />
        <div class="welcome-text">
          <h2>Welcome{{ player ? ', ' + player.username : '' }}!</h2>
          <div class="user-details">
            <p class="user-title">{{ player?.title || 'Cosmic Explorer' }}</p>
            <div class="level-indicator">
              <div class="level-badge">{{ player?.level || 1 }}</div>
              <div class="xp-bar">
                <div class="xp-progress" :style="{ width: `${xpPercentage}%` }"></div>
              </div>
              <span class="xp-text">{{ playerXp }} / {{ xpRequired }} XP</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stats Summary -->
      <div class="stats-summary">
        <div class="stat-summary-item">
          <div class="summary-value">{{ playerStats?.gamesPlayed || 0 }}</div>
          <div class="summary-label">Games Played</div>
        </div>
        <div class="stat-summary-item">
          <div class="summary-value">{{ playerStats?.gamesWon || 0 }}</div>
          <div class="summary-label">Games Won</div>
        </div>
        <div class="stat-summary-item">
          <div class="summary-value">{{ playerWinRate }}%</div>
          <div class="summary-label">Win Rate</div>
        </div>
      </div>
      
      <!-- Activity Streak Card -->
      <ActivityStreakCard
        ref="streakRef"
        @streak-claimed="handleStreakClaimed"
        @milestone-reached="handleMilestoneReached"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import { useNftsStore } from '@/stores/nfts';
import { useNotification } from '@/composables/useNotification';
import ActivityStreakCard from '@/components/dashboard/sections/ActivityStreakCard.vue';

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
const notify = useNotification();

// Refs
const streakRef = ref(null);

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

// Mock player stats (would come from API)
const playerLevel = ref(8);
const playerXP = ref('2,450');
const playerRank = ref('Explorer');
const levelProgress = ref(65); // percentage to next level

// Methods
const handleStreakClaimed = (data) => {
  console.log('Streak claimed:', data);
  
  // Emit event to parent component with reward details
  emit('daily-reward-claimed', {
    success: true,
    reward: {
      tokens: data.tokenReward,
      xp: data.xpReward
    }
  });
};

const handleMilestoneReached = (milestone) => {
  console.log('Milestone reached:', milestone);
  
  // Handle milestone rewards
  // This could trigger special rewards, avatar frames, etc.
  notify.achievement(`You've reached the ${milestone.days} day streak milestone!`, {
    title: 'Streak Milestone!',
    duration: 5000
  });
};

// For testing purposes
const simulateStreak = (streak, daysAgo = 1) => {
  if (streakRef.value) {
    streakRef.value.simulateStreak(streak, daysAgo);
  }
};

// Expose methods to parent
defineExpose({
  simulateStreak
});

// Lifecycle
onMounted(() => {
  // Any initialization needed
});
</script>

<style scoped>
/* Welcome Card Styles */
.welcome-card-section {
  background: linear-gradient(135deg, rgba(10, 20, 40, 0.7) 0%, rgba(30, 25, 80, 0.7) 100%);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  position: relative;
}

.welcome-card-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.2;
  z-index: 0;
}

.welcome-card-content {
  position: relative;
  z-index: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.welcome-message h2 {
  font-size: 1.8rem;
  color: white;
  margin: 0 0 5px 0;
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-message p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.player-stats {
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 15px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0fb9fd;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 3px;
}

.level-progress {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 6px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .welcome-message h2 {
    font-size: 1.4rem;
  }
  
  .welcome-message p {
    font-size: 0.9rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .player-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .stat-item {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-item:first-child {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .level-progress {
    width: 100%;
    margin-top: 8px;
  }
}

.welcome-content {
  position: relative;
  z-index: 1;
}
</style> 