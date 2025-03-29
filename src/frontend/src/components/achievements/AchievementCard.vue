<template>
  <div 
    class="achievement-card" 
    :class="{ 
      'completed': isCompleted, 
      'claimed': achievement.claimed,
      'in-progress': !isCompleted && achievement.progress > 0
    }"
  >
    <div class="achievement-content">
      <div class="achievement-header">
        <div class="icon-wrapper" :class="achievementTypeClass">
          <i :class="achievementIcon"></i>
          <div class="completion-badge" v-if="isCompleted">
            <i class="fas fa-check"></i>
          </div>
        </div>
        <div class="header-content">
          <h3 class="achievement-title">{{ achievement.name }}</h3>
          <div class="achievement-type">{{ formatAchievementType }}</div>
        </div>
      </div>
      
      <div class="achievement-description">
        <p>{{ achievementDescription }}</p>
      </div>
      
      <div class="achievement-progress-container">
        <div class="progress-stats">
          <span class="progress-text">{{ achievement.progress }} / {{ achievement.requiredProgress }}</span>
          <span class="progress-percent">{{ completionPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"></div>
        </div>
      </div>
      
      <div class="achievement-rewards">
        <div class="reward-label">Reward:</div>
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
          class="claim-button cosmic-button cosmic-button-sm cosmic-button-primary"
          :disabled="isLoading"
        >
          <i class="fas fa-gift" v-if="!isLoading"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          <span>Claim Reward</span>
        </button>
        <div v-else-if="achievement.claimed" class="claimed-status">
          <i class="fas fa-check-circle"></i>
          <span>Reward Claimed</span>
        </div>
        <div v-else class="progress-status">
          <i class="fas fa-lock" v-if="achievement.progress === 0"></i>
          <i class="fas fa-spinner" v-else></i>
          <span>{{ achievement.progress === 0 ? 'Locked' : 'In Progress' }}</span>
        </div>
      </div>
    </div>
    
    <div class="achievement-decoration">
      <div class="particles particle-1"></div>
      <div class="particles particle-2"></div>
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
  return props.achievement.completed || 
         props.achievement.progress >= props.achievement.requiredProgress;
});

const completionPercentage = computed(() => {
  if (props.achievement.requiredProgress === 0) return 0;
  const percentage = (props.achievement.progress / props.achievement.requiredProgress) * 100;
  return Math.min(Math.round(percentage), 100);
});

const achievementTypeClass = computed(() => {
  const type = props.achievement.achievementType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof type === 'object') {
    typeName = Object.keys(type)[0];
  } else {
    typeName = type;
  }
  
  const classMap = {
    'GamesWon': 'games',
    'GamesCompleted': 'games',
    'DamageDealt': 'combat',
    'DamageTaken': 'combat',
    'Kills': 'combat',
    'XPEarned': 'xp',
    'LevelReached': 'level',
    'NFTsMinted': 'collection',
    'ChestsOpened': 'collection',
    'FriendsAdded': 'social',
    'Social': 'social',
    'Combat': 'combat',
    'Collection': 'collection',
    'default': 'default'
  };
  
  return classMap[typeName] || classMap.default;
});

const achievementIcon = computed(() => {
  const type = props.achievement.achievementType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof type === 'object') {
    typeName = Object.keys(type)[0];
  } else {
    typeName = type;
  }
  
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
  
  return iconMap[typeName] || iconMap.default;
});

const formatAchievementType = computed(() => {
  const type = props.achievement.achievementType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof type === 'object') {
    typeName = Object.keys(type)[0];
  } else {
    typeName = type || 'General';
  }
  
  return typeName.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
});

const achievementDescription = computed(() => {
  // Auto-generate description if none is provided
  if (props.achievement.description) {
    return props.achievement.description;
  }
  
  const type = props.achievement.achievementType || {};
  const name = props.achievement.name || '';
  const progress = props.achievement.requiredProgress || 0;
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof type === 'object') {
    typeName = Object.keys(type)[0];
  } else {
    typeName = type || '';
  }
  
  // Try to generate a description based on the achievement type and name
  switch(typeName) {
    case 'GamesWon':
      return `Win ${progress} games to earn this achievement.`;
    case 'GamesCompleted':
      return `Complete ${progress} games.`;
    case 'DamageDealt':
      return `Deal ${progress} damage to enemies.`;
    case 'DamageTaken':
      return `Take ${progress} damage from enemies.`;
    case 'Kills':
      return `Defeat ${progress} enemies in combat.`;
    case 'XPEarned':
      return `Earn ${progress} XP.`;
    case 'LevelReached':
      return `Reach level ${progress}.`;
    case 'NFTsMinted':
      return `Mint ${progress} NFTs.`;
    case 'FriendsAdded':
      return `Add ${progress} friends to your network.`;
    case 'ChestsOpened':
      return `Open ${progress} chests.`;
    case 'Social':
      if (name.toLowerCase().includes('connect') || name.toLowerCase().includes('follow')) {
        return `Connect your account to earn this achievement.`;
      }
      return `Complete this social task to earn the achievement.`;
    default:
      return `Complete the required task to earn this achievement.`;
  }
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
  const rewardType = reward.rewardType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof rewardType === 'object') {
    typeName = Object.keys(rewardType)[0];
  } else {
    typeName = rewardType || '';
  }
  
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
  
  return iconMap[typeName] || iconMap.default;
};

const formatReward = (reward) => {
  const amount = reward.amount || 0;
  const rewardType = reward.rewardType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof rewardType === 'object') {
    typeName = Object.keys(rewardType)[0];
  } else {
    typeName = rewardType || '';
  }
  
  switch(typeName) {
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

const claimReward = async () => {
  if (!isCompleted.value || props.achievement.claimed || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    emits('claim', props.achievement.id);
  } catch (error) {
    console.error('Error claiming achievement reward:', error);
  } finally {
    // Let parent component handle the loading state
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  }
};
</script>

<style scoped>
.achievement-card {
  position: relative;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: 1px solid rgba(15, 185, 253, 0.1);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(0);
  padding: 1.25rem;
}

.achievement-card.completed {
  background: linear-gradient(to bottom, 
    rgba(0, 229, 164, 0.08),
    rgba(0, 229, 164, 0.03));
  border: 1px solid rgba(0, 229, 164, 0.15);
}

.achievement-card.claimed {
  background: linear-gradient(to bottom, 
    rgba(0, 229, 164, 0.12),
    rgba(0, 229, 164, 0.05));
  border: 1px solid rgba(0, 229, 164, 0.25);
}

.achievement-card.in-progress {
  background: linear-gradient(to bottom, 
    rgba(15, 185, 253, 0.08),
    rgba(15, 185, 253, 0.03));
  border: 1px solid rgba(15, 185, 253, 0.15);
}

.achievement-card:hover {
  transform: translateY(-5px) translateZ(5px);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-sm);
}

.achievement-card.completed:hover {
  box-shadow: var(--cosmic-shadow-lg), 0 0 20px rgba(0, 229, 164, 0.2);
}

.achievement-card.claimed:hover {
  box-shadow: var(--cosmic-shadow-lg), 0 0 20px rgba(0, 229, 164, 0.3);
}

.achievement-content {
  position: relative;
  z-index: 2;
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  flex-shrink: 0;
  position: relative;
  box-shadow: var(--cosmic-glow-blue-sm);
  transition: all var(--cosmic-transition-medium);
}

.icon-wrapper i {
  font-size: 1.25rem;
  transition: all var(--cosmic-transition-medium);
}

.icon-wrapper.games {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.icon-wrapper.combat {
  background: rgba(255, 75, 75, 0.1);
  color: var(--cosmic-red);
  box-shadow: 0 0 10px rgba(255, 75, 75, 0.2);
}

.icon-wrapper.collection {
  background: rgba(255, 145, 0, 0.1);
  color: var(--cosmic-orange);
  box-shadow: 0 0 10px rgba(255, 145, 0, 0.2);
}

.icon-wrapper.social {
  background: rgba(157, 53, 191, 0.1);
  color: var(--cosmic-purple);
  box-shadow: 0 0 10px rgba(157, 53, 191, 0.2);
}

.icon-wrapper.xp {
  background: rgba(255, 217, 0, 0.1);
  color: #FFD900;
  box-shadow: 0 0 10px rgba(255, 217, 0, 0.2);
}

.icon-wrapper.level {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
  box-shadow: 0 0 10px rgba(0, 229, 164, 0.2);
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
  background: var(--cosmic-green);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  box-shadow: 0 0 8px rgba(0, 229, 164, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.7);
}

.header-content {
  flex: 1;
}

.achievement-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.achievement-type {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.achievement-description {
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.4;
}

.achievement-progress-container {
  margin-bottom: 1rem;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.progress-text {
  color: var(--cosmic-text-secondary);
}

.progress-percent {
  font-weight: 700;
  color: var(--cosmic-blue);
}

.progress-bar {
  height: 6px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue) 0%, var(--cosmic-blue-light) 100%);
  border-radius: 3px;
  width: 0%;
  transition: width 1s ease-in-out;
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
}

.completed .progress-fill {
  background: linear-gradient(90deg, var(--cosmic-green) 0%, #00ffa3 100%);
  box-shadow: 0 0 8px rgba(0, 229, 164, 0.5);
}

.achievement-rewards {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.reward-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.5rem;
}

.reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  background: rgba(15, 185, 253, 0.08);
  border-radius: var(--cosmic-radius-sm);
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.reward-item i {
  color: var(--cosmic-blue);
}

.achievement-actions {
  display: flex;
  justify-content: center;
}

.claim-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.claimed-status, .progress-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: var(--cosmic-radius-sm);
}

.claimed-status {
  color: var(--cosmic-green);
  background: rgba(0, 229, 164, 0.1);
  border: 1px solid rgba(0, 229, 164, 0.2);
}

.progress-status {
  color: var(--cosmic-text-tertiary);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
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

.particles {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  opacity: 0;
}

.completed .particles {
  background: rgba(0, 229, 164, 0.7);
  box-shadow: 0 0 10px rgba(0, 229, 164, 0.8);
  animation: float 8s ease-in-out infinite;
  opacity: 0.8;
}

.in-progress .particles {
  background: rgba(15, 185, 253, 0.7);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
  animation: float 8s ease-in-out infinite;
  opacity: 0.5;
}

.particle-1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.particle-2 {
  bottom: 25%;
  right: 30%;
  animation-delay: 1s;
}

.achievement-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity var(--cosmic-transition-medium);
}

.completed .achievement-glow {
  background: radial-gradient(circle at center, rgba(0, 229, 164, 0.2) 0%, transparent 70%);
  opacity: 0.5;
  animation: pulse 4s ease-in-out infinite;
}

.claimed .achievement-glow {
  background: radial-gradient(circle at center, rgba(0, 229, 164, 0.3) 0%, transparent 70%);
  opacity: 0.8;
  animation: pulse 4s ease-in-out infinite;
}

.in-progress .achievement-glow {
  background: radial-gradient(circle at center, rgba(15, 185, 253, 0.2) 0%, transparent 70%);
  opacity: 0.3;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-10px) translateX(5px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 600px) {
  .achievement-card {
    padding: 1rem;
  }
  
  .achievement-header {
    flex-direction: row;
    align-items: center;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
    margin-right: 0.75rem;
  }
  
  .icon-wrapper i {
    font-size: 1.1rem;
  }
  
  .achievement-title {
    font-size: 1rem;
  }
  
  .reward-items {
    flex-direction: column;
  }
}
</style> 