<template>
  <div class="mission-card cosmic-panel">
    <div class="mission-card-content">
      <div class="mission-header">
        <div class="icon-wrapper" :class="missionCategoryClass">
          <i :class="missionIcon"></i>
        </div>
        <div class="header-content">
          <h3 class="mission-title">{{ missionTitle }}</h3>
          <span class="mission-category">{{ formatCategory(mission.missionCategory) }}</span>
        </div>
        <div class="mission-status" :class="{ 'completed': isCompleted, 'active': !isCompleted }">
          {{ isCompleted ? 'COMPLETED' : 'ACTIVE' }}
        </div>
      </div>
      
      <div class="mission-description">
        <p>{{ missionDescription }}</p>
      </div>
      
      <div class="mission-progress-container">
        <div class="progress-stats">
          <span class="progress-text">{{ mission.progress }} / {{ mission.total }}</span>
          <span class="progress-percent">{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>
      
      <div class="mission-reward">
        <div class="reward-icon" :class="rewardTypeClass">
          <i :class="rewardIcon"></i>
        </div>
        <div class="reward-info">
          <span class="reward-amount">{{ mission.reward_amount }}</span>
          <span class="reward-type">{{ formatRewardType(mission.reward_type) }}</span>
        </div>
      </div>
      
      <div class="mission-time">
        <div class="time-info">
          <i class="far fa-clock"></i>
          <span class="time-remaining">{{ timeRemaining }}</span>
        </div>
      </div>
      
      <div class="mission-actions">
        <button 
          @click="claimReward" 
          class="cosmic-button cosmic-button-primary"
          :disabled="!isCompleted || isLoading"
        >
          <i class="fas fa-gift"></i>
          <span class="button-text">{{ isCompleted ? 'Claim Reward' : 'In Progress...' }}</span>
          <div class="button-particles"></div>
          <div class="button-glow"></div>
        </button>
      </div>
    </div>
    
    <div class="mission-decoration">
      <div class="mission-particles particle-1"></div>
      <div class="mission-particles particle-2"></div>
      <div class="mission-particles particle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCanisterStore } from '@/stores/canister';

const props = defineProps({
  mission: {
    type: Object,
    required: true
  }
});

const emits = defineEmits(['claim']);

const isLoading = ref(false);
const errorMessage = ref(null);

// Define hasProperty once at the top level
const hasProperty = (obj, prop) => {
  return obj && typeof obj === 'object' && prop in obj;
};

// Helper function to safely convert BigInt values to numbers
const safeBigIntValue = (value) => {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'object' && value !== null && typeof value.valueOf === 'function') {
    const valueOf = value.valueOf();
    if (typeof valueOf === 'bigint') {
      return Number(valueOf);
    }
  }
  return value;
};

// Computed properties
const isCompleted = computed(() => {
  const progressMet = safeBigIntValue(props.mission.progress) >= safeBigIntValue(props.mission.total);
  const explicitlyFinished = props.mission.finished === true;
  const explicitlyClaimed = props.mission.claimed === true;
  
  // Debug log for understanding mission completion state
  if (progressMet && !explicitlyFinished && !explicitlyClaimed) {
    console.log("Mission ready to claim:", props.mission.id_mission);
  }
  
  return progressMet || explicitlyFinished || explicitlyClaimed;
});

const progressPercent = computed(() => {
  const progress = safeBigIntValue(props.mission.progress);
  const total = safeBigIntValue(props.mission.total);
  
  if (total === 0) return 0;
  return Math.min(100, Math.round((progress / total) * 100));
});

const timeRemaining = computed(() => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  let expirationTime = safeBigIntValue(props.mission.expiration);
  
  // Log the raw expiration value for debugging
  console.log(`Raw expiration value for mission ${props.mission.id_mission || 'unknown'}: ${expirationTime}`);
  
  if (isCompleted.value) {
    return 'Completed';
  }
  
  // If expiration is 0 or less, it doesn't expire
  if (!expirationTime || expirationTime <= 0) {
    return 'No expiration';
  }
  
  // Convert nanoseconds to seconds if the value is extremely large
  if (expirationTime > 9999999999) {
    // It's likely nanoseconds or another very large unit - convert to seconds (approx)
    expirationTime = Math.floor(expirationTime / 1000000000);
    console.log(`Converted expiration to seconds: ${expirationTime}`);
  }
  
  // Calculate time remaining in seconds
  const diff = expirationTime - now;
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  // Set reasonable maximum times
  const days = Math.floor(diff / (24 * 3600));
  
  // Cap at 1 year display
  if (days > 365) {
    return 'Over 1 year left';
  }
  
  // Cap at 3 months display
  if (days > 90) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} left`;
  }
  
  // Display days if more than 1 day left
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} left`;
  }
  
  // Display hours and minutes for less than a day
  const hours = Math.floor((diff % (24 * 3600)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  
  return `${minutes}m left`;
});

const missionCategoryClass = computed(() => {
  const category = props.mission.missionCategory;
  
  if (!category) {
    console.log("Missing category in mission:", props.mission);
    return 'default';
  }
  
  if (hasProperty(category, 'Daily')) return 'daily';
  if (hasProperty(category, 'Weekly')) return 'weekly';
  if (hasProperty(category, 'Hourly')) return 'hourly';
  if (hasProperty(category, 'Free')) return 'free';
  if (hasProperty(category, 'Achievement')) return 'achievement';
  
  // For debugging
  console.log("Unknown category format:", category);
  return 'default';
});

const rewardTypeClass = computed(() => {
  const type = props.mission.reward_type;
  if (hasProperty(type, 'Stardust')) return 'stardust';
  if (hasProperty(type, 'Chest')) return 'chest';
  return 'default';
});

const missionIcon = computed(() => {
  const category = props.mission.missionCategory;
  
  if (!category) {
    return 'fas fa-tasks';
  }
  
  if (hasProperty(category, 'Daily')) return 'fas fa-sun';
  if (hasProperty(category, 'Weekly')) return 'fas fa-calendar-week';
  if (hasProperty(category, 'Hourly')) return 'fas fa-hourglass-half';
  if (hasProperty(category, 'Free')) return 'fas fa-gift';
  if (hasProperty(category, 'Achievement')) return 'fas fa-trophy';
  
  // Try to pick a good default icon based on mission type
  const type = props.mission.missionType;
  if (type) {
    if (hasProperty(type, 'GamesCompleted') || hasProperty(type, 'GamesWon')) return 'fas fa-gamepad';
    if (hasProperty(type, 'DamageDealt') || hasProperty(type, 'DamageTaken')) return 'fas fa-bolt';
    if (hasProperty(type, 'Kills')) return 'fas fa-skull';
    if (hasProperty(type, 'EnergyUsed')) return 'fas fa-battery-half';
  }
  
  return 'fas fa-tasks';
});

const rewardIcon = computed(() => {
  const type = props.mission.reward_type;
  if (hasProperty(type, 'Stardust')) return 'fas fa-star';
  if (hasProperty(type, 'Chest')) return 'fas fa-box-open';
  return 'fas fa-gift';
});

const missionTitle = computed(() => {
  // Generate a title based on mission type if none provided
  const type = props.mission.missionType;
  
  if (!type) {
    console.log("Mission with no type:", JSON.stringify(props.mission, (_, v) => 
      typeof v === 'bigint' ? v.toString() : v));
    return 'Mission';
  }
  
  // Map mission type to better titles that match MissionOptions.mo templates
  if (hasProperty(type, 'UnitsDeployed')) return 'Deploy NFTs';
  if (hasProperty(type, 'DamageDealt')) return 'Deal Damage';
  if (hasProperty(type, 'DamageTaken')) return 'Take Damage';
  if (hasProperty(type, 'XPEarned')) return 'Earn XP';
  if (hasProperty(type, 'Kills')) return 'Destroy Enemies';
  if (hasProperty(type, 'FactionPlayed')) return 'Play with Faction';
  if (hasProperty(type, 'GamesCompleted')) return 'Complete Games';
  if (hasProperty(type, 'EnergyUsed')) return 'Use Energy';
  if (hasProperty(type, 'GamesWon')) return 'Win Games';
  if (hasProperty(type, 'GameModePlayed')) return 'Play Game Mode';
  
  // For any other mission types, try to format the type name
  try {
    const typeKeys = Object.keys(type);
    if (typeKeys.length > 0) {
      // Convert camelCase to words with spaces (e.g., "GameModePlayed" -> "Game Mode Played")
      const title = typeKeys[0].replace(/([A-Z])/g, ' $1').trim();
      return title.charAt(0).toUpperCase() + title.slice(1);
    }
  } catch (error) {
    console.error("Error processing mission type:", error);
  }
  
  // If we can't determine the type, log for debugging
  console.log("Unknown mission type format:", type);
  return 'Mission';
});

const missionDescription = computed(() => {
  // Generate description based on mission type
  const type = props.mission.missionType;
  const total = safeBigIntValue(props.mission.total);
  
  if (!type) {
    return `Complete mission objective: ${total}`;
  }
  
  // These descriptions match the templates in MissionOptions.mo
  if (hasProperty(type, 'UnitsDeployed')) return `Deploy ${total} NFTs in battles`;
  if (hasProperty(type, 'DamageDealt')) return `Deal ${total} damage to enemies`;
  if (hasProperty(type, 'DamageTaken')) return `Take ${total} damage from enemies`;
  if (hasProperty(type, 'XPEarned')) return `Earn ${total} XP from battles`;
  if (hasProperty(type, 'Kills')) return `Destroy ${total} enemies in battle`;
  if (hasProperty(type, 'FactionPlayed')) return `Play ${total} games with any faction`;
  if (hasProperty(type, 'GamesCompleted')) return `Complete ${total} games`;
  if (hasProperty(type, 'EnergyUsed')) return `Use ${total} energy in battles`;
  if (hasProperty(type, 'GamesWon')) return `Win ${total} games`;
  if (hasProperty(type, 'GameModePlayed')) return `Play ${total} games in any game mode`;
  
  // For debugging, show what mission type we got
  console.log("Unknown mission type:", type);
  return `Complete mission objective: ${total}`;
});

// Helper methods
const formatCategory = (category) => {
  if (!category) {
    console.log("Missing mission category");
    return 'Mission';
  }
  
  if (hasProperty(category, 'Daily')) return 'Daily Mission';
  if (hasProperty(category, 'Weekly')) return 'Weekly Mission';
  if (hasProperty(category, 'Hourly')) return 'Hourly Mission';
  if (hasProperty(category, 'Free')) return 'Free Mission';
  if (hasProperty(category, 'Achievement')) return 'Achievement';
  
  // For debugging, log what category we got
  console.log("Unknown mission category:", category);
  
  // Try to intelligently get the category name
  try {
    const keys = Object.keys(category);
    if (keys.length > 0) {
      // Convert camelCase to words with spaces and capitalize first letter
      const formatted = keys[0].replace(/([A-Z])/g, ' $1').trim();
      return formatted.charAt(0).toUpperCase() + formatted.slice(1) + ' Mission';
    }
  } catch (error) {
    console.error("Error processing mission category:", error);
  }
  
  return 'Mission';
};

const formatRewardType = (type) => {
  if (!type) {
    console.log("Missing reward type");
    return 'Reward';
  }
  
  if (hasProperty(type, 'Stardust')) return 'Stardust';
  if (hasProperty(type, 'Chest')) return 'Chest';
  if (hasProperty(type, 'XP')) return 'Experience';
  
  // Try to intelligently get the reward type name
  try {
    const keys = Object.keys(type);
    if (keys.length > 0) {
      // Convert camelCase to words with spaces and capitalize first letter
      const formatted = keys[0].replace(/([A-Z])/g, ' $1').trim();
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  } catch (error) {
    console.error("Error processing reward type:", error);
  }
  
  console.log("Unknown reward type:", type);
  return 'Reward';
};

// Event handlers
const claimReward = async () => {
  if (!isCompleted.value || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    // Emit claim event to parent component
    emits('claim', props.mission.id_mission);
  } catch (error) {
    console.error('Error claiming mission reward:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchMissions = async () => {
  console.log("Starting mission fetch...");
  isLoading.value = true;
  
  try {
    // Get canister
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      console.error("Backend canister not initialized");
      throw new Error("Canister not initialized");
    }
    
    console.log("Fetching general missions...");
    const generalMissionsResult = await backend.getGeneralMissions();
    console.log("General missions response:", generalMissionsResult);
    
    // Check response structure
    if (!generalMissionsResult || !Array.isArray(generalMissionsResult)) {
      console.error("Invalid general missions response:", generalMissionsResult);
      throw new Error("Invalid response format");
    }
    
    // Process missions...
    // Remaining code...
  } catch (error) {
    console.error("Mission fetch error:", error);
    errorMessage.value = `Error: ${error.message || "Unknown error"}`;
    
    // IMPORTANT: Generate mock data as fallback
    if (import.meta.env.DEV) {
      console.log("Generating mock mission data for development");
      generateMockMissions();
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.mission-card {
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

.mission-card:hover {
  transform: translateY(-5px) translateZ(5px);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-sm);
}

.mission-card-content {
  position: relative;
  z-index: 2;
  padding: 1.25rem;
}

.mission-header {
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
  flex-shrink: 0;
  transition: all var(--cosmic-transition-medium);
}

.icon-wrapper.daily {
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, rgba(15, 185, 253, 0.2) 100%);
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.icon-wrapper.weekly {
  background: linear-gradient(135deg, rgba(157, 53, 191, 0.1) 0%, rgba(157, 53, 191, 0.2) 100%);
  border: 1px solid rgba(157, 53, 191, 0.2);
  box-shadow: 0 0 10px rgba(157, 53, 191, 0.3);
}

.icon-wrapper.hourly {
  background: linear-gradient(135deg, rgba(0, 229, 164, 0.1) 0%, rgba(0, 229, 164, 0.2) 100%);
  border: 1px solid rgba(0, 229, 164, 0.2);
  box-shadow: 0 0 10px rgba(0, 229, 164, 0.3);
}

.icon-wrapper.free {
  background: linear-gradient(135deg, rgba(255, 145, 0, 0.1) 0%, rgba(255, 145, 0, 0.2) 100%);
  border: 1px solid rgba(255, 145, 0, 0.2);
  box-shadow: 0 0 10px rgba(255, 145, 0, 0.3);
}

.icon-wrapper.achievement {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.2) 100%);
  border: 1px solid rgba(255, 215, 0, 0.2);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.icon-wrapper i {
  font-size: 1.25rem;
  transition: transform var(--cosmic-transition-fast);
}

.icon-wrapper.daily i {
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.icon-wrapper.weekly i {
  color: var(--cosmic-purple);
  filter: drop-shadow(0 0 5px rgba(157, 53, 191, 0.5));
}

.icon-wrapper.hourly i {
  color: var(--cosmic-green);
  filter: drop-shadow(0 0 5px rgba(0, 229, 164, 0.5));
}

.icon-wrapper.free i {
  color: var(--cosmic-orange);
  filter: drop-shadow(0 0 5px rgba(255, 145, 0, 0.5));
}

.icon-wrapper.achievement i {
  color: #FFD700;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
}

.mission-card:hover .icon-wrapper i {
  transform: scale(1.1);
}

.header-content {
  flex: 1;
}

.mission-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.mission-category {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.mission-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mission-status.completed {
  background: rgba(0, 229, 164, 0.15);
  color: var(--cosmic-green);
  border: 1px solid rgba(0, 229, 164, 0.3);
}

.mission-status.active {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  border: 1px solid rgba(15, 185, 253, 0.3);
}

.mission-description {
  margin-bottom: 1.25rem;
}

.mission-description p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.4;
}

.mission-progress-container {
  margin-bottom: 1.25rem;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.progress-text {
  color: var(--cosmic-text-secondary);
}

.progress-percent {
  font-weight: 700;
  color: var(--cosmic-blue);
}

.progress-bar {
  height: 8px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue) 0%, var(--cosmic-blue-light) 100%);
  border-radius: 4px;
  width: 0%;
  transition: width 1s ease-in-out;
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
}

.mission-reward {
  display: flex;
  align-items: center;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.reward-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.reward-icon.stardust {
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, rgba(15, 185, 253, 0.2) 100%);
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.reward-icon.chest {
  background: linear-gradient(135deg, rgba(255, 145, 0, 0.1) 0%, rgba(255, 145, 0, 0.2) 100%);
  border: 1px solid rgba(255, 145, 0, 0.2);
  box-shadow: 0 0 10px rgba(255, 145, 0, 0.3);
}

.reward-icon.stardust i {
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.reward-icon.chest i {
  color: var(--cosmic-orange);
  filter: drop-shadow(0 0 5px rgba(255, 145, 0, 0.5));
}

.reward-info {
  display: flex;
  flex-direction: column;
}

.reward-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.reward-type {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.mission-time {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: flex-end;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary);
}

.time-remaining {
  font-weight: 500;
}

.mission-actions {
  display: flex;
  justify-content: center;
}

.mission-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.mission-particles {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.5);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
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

.cosmic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

@media (max-width: 600px) {
  .mission-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .mission-status {
    margin-top: 1rem;
    align-self: flex-start;
  }
  
  .icon-wrapper {
    margin-bottom: 0.75rem;
  }
}
</style> 