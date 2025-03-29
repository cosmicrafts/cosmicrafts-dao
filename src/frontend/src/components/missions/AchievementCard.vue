<template>
  <div class="achievement-card cosmic-panel" :class="{ 'completed': isCompleted, 'claimed': achievement.claimed }">
    <div class="achievement-content">
      <div class="achievement-header">
        <div class="icon-wrapper">
          <i :class="achievementIcon"></i>
          <div class="completion-badge" v-if="isCompleted">
            <i class="fas fa-check"></i>
          </div>
        </div>
        <div class="header-content">
          <h3 class="achievement-title">{{ achievement.name }}</h3>
          <div class="achievement-type">{{ formatAchievementType(achievement.achievementType) }}</div>
        </div>
      </div>
      
      <div class="achievement-progress-container">
        <div class="progress-text">
          <span>Progress: {{ achievement.progress }} / {{ achievement.total }}</span>
          <span class="completion-percentage">{{ completionPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"></div>
        </div>
      </div>
      
      <div class="achievement-rewards">
        <div class="reward-label">Rewards:</div>
        <div class="reward-items">
          <div v-for="(reward, index) in getRewards()" :key="index" class="reward-item">
            <i :class="getRewardIcon(reward)"></i>
            <span>{{ formatReward(reward) }}</span>
          </div>
        </div>
      </div>
      
      <div class="achievement-actions">
        <button 
          v-if="isCompleted && !achievement.claimed" 
          @click="claimReward"
          class="claim-button cosmic-button-primary"
        >
          Claim Reward
        </button>
        <div v-else-if="achievement.claimed" class="claimed-status">
          <i class="fas fa-check-circle"></i>
          <span>Reward Claimed</span>
        </div>
        <div v-else class="locked-status">
          <i class="fas fa-lock"></i>
          <span>Complete to Unlock</span>
        </div>
      </div>
    </div>
    
    <div class="achievement-decoration">
      <div class="achievement-particles particle-1"></div>
      <div class="achievement-particles particle-2"></div>
      <div class="achievement-particles particle-3"></div>
      <div class="achievement-glow"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
});

const emits = defineEmits(['claim']);

const isLoading = ref(false);

// Computed properties
const isCompleted = computed(() => {
  return props.achievement.progress >= props.achievement.total;
});

const completionPercentage = computed(() => {
  if (props.achievement.total === 0) return 0;
  const percentage = (props.achievement.progress / props.achievement.total) * 100;
  return Math.min(Math.round(percentage), 100);
});

const achievementIcon = computed(() => {
  const type = props.achievement.achievementType;
  
  let achievementType = typeof type === 'string' ? type : Object.keys(type)[0];
  
  const iconMap = {
    'GamesWon': 'fas fa-trophy',
    'GamesCompleted': 'fas fa-gamepad',
    'DamageDealt': 'fas fa-bolt',
    'DamageTaken': 'fas fa-shield-alt',
    'Kills': 'fas fa-skull',
    'XPEarned': 'fas fa-star',
    'LevelReached': 'fas fa-level-up-alt',
    'NFTsMinted': 'fas fa-cube',
    'FriendsAdded': 'fas fa-user-friends',
    'ChestsOpened': 'fas fa-box-open',
    'Combat': 'fas fa-fist-raised',
    'Account': 'fas fa-user-circle',
    'Social': 'fas fa-users',
    'Collection': 'fas fa-layer-group',
    'default': 'fas fa-medal'
  };
  
  return iconMap[achievementType] || iconMap.default;
});

// Helper methods
const getRewards = () => {
  if (Array.isArray(props.achievement.reward)) {
    return props.achievement.reward;
  } else if (props.achievement.reward) {
    return [props.achievement.reward];
  }
  return [];
};

const getRewardIcon = (reward) => {
  const rewardType = reward.rewardType || reward.type || '';
  
  let type = typeof rewardType === 'string' ? rewardType : Object.keys(rewardType)[0];
  
  const iconMap = {
    'XP': 'fas fa-star',
    'Stardust': 'fas fa-coins',
    'NFT': 'fas fa-cube',
    'Chest': 'fas fa-box-open',
    'Title': 'fas fa-crown',
    'Avatar': 'fas fa-user-astronaut',
    'Multiplier': 'fas fa-percentage',
    'default': 'fas fa-gift'
  };
  
  return iconMap[type] || iconMap.default;
};

const formatReward = (reward) => {
  const amount = reward.amount || 0;
  const rewardType = reward.rewardType || reward.type || '';
  
  let type = typeof rewardType === 'string' ? rewardType : Object.keys(rewardType)[0];
  
  switch(type) {
    case 'XP':
      return `${amount} XP`;
    case 'Stardust':
      return `${amount} Stardust`;
    case 'NFT':
      return `${amount} NFT`;
    case 'Chest':
      return `${amount} Chest`;
    case 'Title':
      return `Special Title`;
    case 'Avatar':
      return `Avatar Unlock`;
    case 'Multiplier':
      return `${amount}% Multiplier`;
    default:
      return `${amount} Reward`;
  }
};

const formatAchievementType = (type) => {
  if (!type) return 'General';
  
  let achievementType = typeof type === 'string' ? type : Object.keys(type)[0];
  
  return achievementType.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const claimReward = () => {
  if (!isCompleted.value || props.achievement.claimed || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    emits('claim', props.achievement.id);
  } catch (error) {
    console.error('Error claiming achievement reward:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.achievement-card {
  position: relative;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.achievement-card.completed {
  background: linear-gradient(to bottom, 
    rgba(157, 53, 191, 0.08),
    rgba(157, 53, 191, 0.03));
  border: 1px solid rgba(157, 53, 191, 0.15);
}

.achievement-card.claimed {
  background: linear-gradient(to bottom, 
    rgba(0, 229, 164, 0.08),
    rgba(0, 229, 164, 0.03));
  border: 1px solid rgba(0, 229, 164, 0.15);
}

.achievement-card:hover {
  transform: translateY(-5px) translateZ(5px);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-sm);
}

.achievement-card.completed:hover {
  box-shadow: var(--cosmic-shadow-lg), 0 0 20px rgba(157, 53, 191, 0.2);
}

.achievement-card.claimed:hover {
  box-shadow: var(--cosmic-shadow-lg), 0 0 20px rgba(0, 229, 164, 0.2);
}

.achievement-content {
  position: relative;
  z-index: 2;
  padding: 1.25rem;
}

.achievement-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(157, 53, 191, 0.1) 0%, rgba(157, 53, 191, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  border: 1px solid rgba(157, 53, 191, 0.2);
  box-shadow: 0 0 10px rgba(157, 53, 191, 0.3);
  position: relative;
}

.icon-wrapper i {
  font-size: 1.25rem;
  color: var(--cosmic-purple);
  filter: drop-shadow(0 0 5px rgba(157, 53, 191, 0.5));
  transition: transform var(--cosmic-transition-fast);
}

.achievement-card:hover .icon-wrapper i {
  transform: scale(1.1);
}

.completion-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--cosmic-green);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 229, 164, 0.5);
  box-shadow: 0 0 8px rgba(0, 229, 164, 0.5);
}

.completion-badge i {
  font-size: 0.6rem !important;
  color: white !important;
  filter: none !important;
}

.header-content {
  flex: 1;
}

.achievement-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.achievement-type {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.achievement-progress-container {
  margin-bottom: 1.25rem;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.5rem;
}

.completion-percentage {
  font-weight: 700;
}

.progress-bar {
  height: 8px;
  background: rgba(157, 53, 191, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-purple) 0%, rgba(157, 53, 191, 0.7) 100%);
  border-radius: 4px;
  width: 0%;
  transition: width 1s ease-in-out;
  box-shadow: 0 0 8px rgba(157, 53, 191, 0.5);
}

.achievement-rewards {
  margin-bottom: 1.25rem;
}

.reward-label {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--cosmic-text-primary);
}

.reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.reward-item {
  display: flex;
  align-items: center;
  background: rgba(157, 53, 191, 0.05);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem;
  border: 1px solid rgba(157, 53, 191, 0.1);
  flex: 1;
  min-width: 120px;
}

.reward-item i {
  font-size: 1rem;
  margin-right: 0.5rem;
}

.achievement-actions {
  display: flex;
  justify-content: center;
}

.achievement-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.achievement-particles {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(157, 53, 191, 0.5);
  box-shadow: 0 0 10px rgba(157, 53, 191, 0.8);
}

.particle-1 {
  top: 20%;
  right: 15%;
  animation: floating 8s ease-in-out infinite;
}

.particle-2 {
  bottom: 25%;
  right: 30%;
  animation: floating 6s ease-in-out infinite 1s;
}

.particle-3 {
  top: 60%;
  left: 10%;
  animation: floating 7s ease-in-out infinite 2s;
}

.achievement-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 20%, rgba(157, 53, 191, 0.08) 0%, transparent 60%);
  opacity: 0;
  transition: opacity var(--cosmic-transition-medium);
}

.achievement-card:hover .achievement-glow {
  opacity: 1;
}

.achievement-card.claimed .achievement-particles {
  background: rgba(0, 229, 164, 0.5);
  box-shadow: 0 0 10px rgba(0, 229, 164, 0.8);
}

.achievement-card.claimed .achievement-glow {
  background: radial-gradient(circle at 70% 20%, rgba(0, 229, 164, 0.08) 0%, transparent 60%);
}

.cosmic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(5px) translateX(10px);
  }
  75% {
    transform: translateY(10px) translateX(-5px);
  }
}

@media (max-width: 600px) {
  .rewards-list {
    flex-direction: column;
  }
  
  .reward-item {
    min-width: auto;
  }
}
</style> 