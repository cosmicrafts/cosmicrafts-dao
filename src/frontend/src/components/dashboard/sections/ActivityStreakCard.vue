<template>
  <div class="activity-streak-card cosmic-panel">
    <div class="streak-header">
      <div class="streak-title">
        <h3>{{ $t('activityStreak.title') || 'Activity Streak' }}</h3>
        <div class="streak-counter">
          <span class="streak-days">{{ currentStreak }}</span> 
          <span class="streak-label">{{ $t('activityStreak.days') || 'days' }}</span>
        </div>
      </div>
      <div class="streak-multiplier" v-if="streakMultiplier > 1">
        <div class="multiplier-badge">
          <span>{{ streakMultiplier }}x</span>
        </div>
        <span class="multiplier-label">{{ $t('activityStreak.rewardMultiplier') || 'Reward Multiplier' }}</span>
      </div>
    </div>

    <div class="streak-calendar">
      <div 
        v-for="(day, index) in streakDays" 
        :key="index"
        class="day-marker"
        :class="{
          'completed': day.status === 'completed',
          'current': day.status === 'current',
          'future': day.status === 'future',
          'missed': day.status === 'missed'
        }"
      >
        <div class="day-circle">
          <i v-if="day.status === 'completed'" class="fas fa-check"></i>
          <i v-else-if="day.status === 'current'" class="fas fa-star pulse"></i>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="day-label">{{ formatDay(day.date) }}</div>
        <div class="day-reward" v-if="day.reward">
          <img :src="day.reward.icon" :alt="day.reward.type" class="reward-icon" />
          <span class="reward-amount">{{ day.reward.amount }}</span>
        </div>
      </div>
    </div>

    <div class="streak-actions">
      <button 
        v-if="canClaimToday" 
        @click="claimDailyStreak" 
        class="claim-button cosmic-button"
        :disabled="isProcessing"
      >
        <i class="fas fa-calendar-check"></i>
        {{ $t('activityStreak.checkIn') || 'Check In' }}
      </button>
      <div v-else-if="hasClaimedToday" class="claimed-message">
        <i class="fas fa-check-circle"></i>
        {{ $t('activityStreak.alreadyClaimed') || 'Already checked in today!' }}
      </div>
      <div v-else class="next-day-message">
        <i class="fas fa-hourglass-half"></i>
        {{ $t('activityStreak.comeback') || 'Come back tomorrow to continue your streak!' }}
      </div>
    </div>

    <div class="streak-milestone" v-if="nextMilestone">
      <div class="milestone-icon">
        <i class="fas fa-trophy"></i>
      </div>
      <div class="milestone-info">
        <div class="milestone-title">{{ $t('activityStreak.nextMilestone') || 'Next Milestone' }}</div>
        <div class="milestone-description">
          {{ nextMilestone.days }} {{ $t('activityStreak.days') || 'days' }}: {{ nextMilestone.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCanisterStore } from '@/stores/canister';
import { useNotification } from '@/composables/useNotification';
import { format, addDays, isSameDay } from 'date-fns';

// Settings & Props
const STREAK_LENGTH = 7; // Number of days to display
const MILESTONE_DAYS = [3, 7, 14, 21, 30, 60, 90]; // Milestone days for special rewards

// Get stores & notifications
const authStore = useAuthStore();
const canisterStore = useCanisterStore();
const notify = useNotification();

// State
const isProcessing = ref(false);
const currentStreak = ref(0);
const lastCheckIn = ref(null);
const streakDays = ref([]);

// Computed
const streakMultiplier = computed(() => {
  // Calculate multiplier based on streak length
  if (currentStreak.value >= 30) return 3.0;
  if (currentStreak.value >= 14) return 2.0;
  if (currentStreak.value >= 7) return 1.5;
  if (currentStreak.value >= 3) return 1.2;
  return 1.0;
});

const canClaimToday = computed(() => {
  if (!lastCheckIn.value) return true;
  
  const today = new Date();
  const lastDate = new Date(lastCheckIn.value);
  
  // Check if last check-in was not today
  return !isSameDay(today, lastDate);
});

const hasClaimedToday = computed(() => {
  if (!lastCheckIn.value) return false;
  
  const today = new Date();
  const lastDate = new Date(lastCheckIn.value);
  
  // Check if last check-in was today
  return isSameDay(today, lastDate);
});

const nextMilestone = computed(() => {
  // Find the next milestone based on current streak
  const nextMilestoneDay = MILESTONE_DAYS.find(day => day > currentStreak.value);
  
  if (!nextMilestoneDay) return null;
  
  let description = '';
  let reward = 0;
  
  // Define milestone rewards
  switch (nextMilestoneDay) {
    case 3:
      description = 'Unlock 1.2x reward multiplier';
      break;
    case 7:
      description = 'Unlock 1.5x reward multiplier';
      break;
    case 14:
      description = 'Unlock 2.0x reward multiplier';
      break;
    case 21:
      description = 'Earn exclusive avatar frame';
      break;
    case 30:
      description = 'Unlock 3.0x reward multiplier';
      break;
    case 60:
      description = 'Earn exclusive emote set';
      break;
    case 90:
      description = 'Earn exclusive title: "Steadfast Explorer"';
      break;
  }
  
  return {
    days: nextMilestoneDay,
    description,
    daysLeft: nextMilestoneDay - currentStreak.value
  };
});

// Methods
const formatDay = (date) => {
  if (!date) return '';
  return format(new Date(date), 'EEE');
};

const loadStreakData = async () => {
  try {
    // In a real implementation, this would fetch from the backend
    // For now we'll use localStorage to simulate streak data
    const storedStreak = localStorage.getItem('userStreak');
    const storedLastCheckIn = localStorage.getItem('lastCheckIn');
    
    if (storedStreak) {
      currentStreak.value = parseInt(storedStreak);
    }
    
    if (storedLastCheckIn) {
      lastCheckIn.value = storedLastCheckIn;
      
      // Check if streak should be reset (missed a day)
      const today = new Date();
      const lastCheckInDate = new Date(storedLastCheckIn);
      const daysSinceLastCheckIn = Math.floor((today - lastCheckInDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastCheckIn > 1) {
        // User missed a day, reset streak
        currentStreak.value = 0;
        localStorage.setItem('userStreak', '0');
        notify.info('Your activity streak was reset. Check in today to start a new streak!', {
          title: 'Streak Reset',
          duration: 5000
        });
      }
    }
    
    generateStreakDays();
  } catch (error) {
    console.error('Error loading streak data:', error);
  }
};

const generateStreakDays = () => {
  const today = new Date();
  const days = [];
  
  for (let i = 0; i < STREAK_LENGTH; i++) {
    const date = addDays(today, i);
    let status = 'future';
    
    if (i === 0 && !hasClaimedToday.value) {
      status = 'current';
    } else if (i === 0 && hasClaimedToday.value) {
      status = 'completed';
    } else if (i < currentStreak.value) {
      status = 'completed';
    }
    
    // Determine reward for this day
    const reward = {
      icon: i % 2 === 0 ? '/assets/tokens/std-token.webp' : '/assets/icons/xp-icon.webp',
      type: i % 2 === 0 ? 'STD' : 'XP',
      amount: calculateReward(i)
    };
    
    days.push({
      date,
      status,
      reward
    });
  }
  
  streakDays.value = days;
};

const calculateReward = (dayIndex) => {
  // Base rewards that increase with streak
  const baseTokens = 10;
  const baseXP = 5;
  
  // Apply multiplier for longer streaks
  const multiplier = streakMultiplier.value;
  
  // Special rewards for milestone days
  const isMilestone = MILESTONE_DAYS.includes(currentStreak.value + dayIndex);
  const milestoneBonus = isMilestone ? 2 : 1;
  
  if (dayIndex % 2 === 0) {
    // Token days
    return Math.round((baseTokens + (dayIndex * 2)) * multiplier * milestoneBonus);
  } else {
    // XP days
    return Math.round((baseXP + dayIndex) * multiplier * milestoneBonus);
  }
};

const claimDailyStreak = async () => {
  if (isProcessing.value || !canClaimToday.value) return;
  
  isProcessing.value = true;
  
  try {
    // In a real implementation, this would call the backend
    // For now we'll use localStorage to simulate
    
    const newStreak = currentStreak.value + 1;
    currentStreak.value = newStreak;
    
    const today = new Date();
    lastCheckIn.value = today.toISOString();
    
    // Store in localStorage
    localStorage.setItem('userStreak', newStreak.toString());
    localStorage.setItem('lastCheckIn', today.toISOString());
    
    // Determine today's reward
    const todayReward = streakDays.value[0]?.reward;
    
    // Apply milestone rewards if applicable
    let milestoneReward = null;
    if (MILESTONE_DAYS.includes(newStreak)) {
      // Handle milestone rewards
      switch (newStreak) {
        case 3:
          milestoneReward = { type: 'multiplier', value: '1.2x' };
          break;
        case 7:
          milestoneReward = { type: 'multiplier', value: '1.5x' };
          break;
        case 14:
          milestoneReward = { type: 'multiplier', value: '2.0x' };
          break;
        case 21:
          milestoneReward = { type: 'avatar_frame', value: 'Cosmic Frame' };
          break;
        case 30:
          milestoneReward = { type: 'multiplier', value: '3.0x' };
          break;
        case 60:
          milestoneReward = { type: 'emotes', value: 'Cosmic Emotes Pack' };
          break;
        case 90:
          milestoneReward = { type: 'title', value: 'Steadfast Explorer' };
          break;
      }
    }
    
    // Update UI
    generateStreakDays();
    
    // Show notification for daily reward
    notify.reward(`You received ${todayReward.amount} ${todayReward.type}!`, {
      title: `Day ${newStreak} Streak Reward`,
      duration: 4000
    });
    
    // Show milestone notification if applicable
    if (milestoneReward) {
      setTimeout(() => {
        notify.success(`You unlocked: ${milestoneReward.value}`, {
          title: `${newStreak} Day Milestone Achievement!`,
          duration: 5000
        });
      }, 1500);
    }
    
    // Emit event to parent component
    emit('streak-claimed', {
      streak: newStreak,
      reward: todayReward,
      milestone: milestoneReward
    });
    
  } catch (error) {
    console.error('Error claiming streak:', error);
    notify.error('There was an issue claiming your streak reward. Please try again.', {
      duration: 3000
    });
  } finally {
    isProcessing.value = false;
  }
};

// Define emits
const emit = defineEmits(['streak-claimed']);

// Load data on mount
onMounted(() => {
  loadStreakData();
});
</script>

<style scoped>
.activity-streak-card {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(10, 15, 30, 0.7) 0%, rgba(26, 18, 72, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.streak-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.streak-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.streak-title h3 {
  font-size: 1.2rem;
  color: white;
  margin: 0;
}

.streak-counter {
  display: flex;
  align-items: baseline;
}

.streak-days {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0fb9fd;
}

.streak-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 5px;
}

.streak-multiplier {
  display: flex;
  align-items: center;
  gap: 8px;
}

.multiplier-badge {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  border-radius: 20px;
  padding: 5px 10px;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
}

.multiplier-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.streak-calendar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
}

.streak-calendar::before {
  content: '';
  position: absolute;
  top: 35px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
}

.day-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  width: calc(100% / 7);
}

.day-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border: 2px solid transparent;
}

.day-marker.completed .day-circle {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  color: white;
}

.day-marker.current .day-circle {
  background: rgba(15, 185, 253, 0.2);
  color: #0fb9fd;
  border: 2px solid #0fb9fd;
}

.day-marker.missed .day-circle {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
  border: 2px solid #ff6464;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.day-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
}

.day-reward {
  display: flex;
  align-items: center;
  gap: 2px;
}

.reward-icon {
  width: 16px;
  height: 16px;
}

.reward-amount {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.streak-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.claim-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.claim-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.3);
}

.claim-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.claimed-message, .next-day-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.claimed-message i {
  color: #4CAF50;
}

.next-day-message i {
  color: #FFC107;
}

.streak-milestone {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 15px;
}

.milestone-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFC107, #FF9800);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.milestone-info {
  flex: 1;
}

.milestone-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin-bottom: 3px;
}

.milestone-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .streak-calendar::before {
    top: 25px;
  }
  
  .day-circle {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
  
  .day-label {
    font-size: 0.7rem;
  }
  
  .reward-icon {
    width: 12px;
    height: 12px;
  }
  
  .reward-amount {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .streak-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .streak-multiplier {
    align-self: flex-end;
  }
}
</style> 