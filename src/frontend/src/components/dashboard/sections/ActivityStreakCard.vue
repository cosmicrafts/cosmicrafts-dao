<template>
  <div class="activity-streak-card">
    <div class="streak-header">
      <div class="streak-info">
        <h3>
          <i class="fas fa-fire streak-icon"></i>
          Daily Streak: <span class="streak-count">{{ currentStreak }}</span>
        </h3>
        <div class="streak-multiplier" v-if="streakMultiplier > 1">
          <i class="fas fa-bolt"></i> {{ streakMultiplier }}x Rewards
        </div>
      </div>
      <button 
        @click="claimDailyStreak" 
        class="streak-claim-button"
        :class="{ 'disabled': !canClaimToday, 'pulse': canClaimToday }"
        :disabled="!canClaimToday"
      >
        <i class="fas fa-calendar-check"></i>
        <span>{{ claimButtonText }}</span>
      </button>
    </div>
    
    <div class="streak-calendar">
      <div 
        v-for="n in 7" 
        :key="n" 
        class="streak-day"
        :class="{
          'completed': n <= daysSinceClaim,
          'current': n === daysSinceClaim + 1,
          'future': n > daysSinceClaim + 1,
          'milestone': [3, 7].includes(n)
        }"
      >
        <div class="day-number">Day {{ n }}</div>
        <div class="day-icon">
          <i 
            :class="[
              n <= daysSinceClaim ? 'fas fa-check-circle' : 
              n === daysSinceClaim + 1 ? 'far fa-calendar-alt' : 'far fa-circle'
            ]"
          ></i>
        </div>
        <div class="day-reward" v-if="[3, 7].includes(n)">
          <span v-if="n === 3">1.2x</span>
          <span v-if="n === 7">1.5x</span>
        </div>
      </div>
    </div>
    
    <div class="streak-message" v-if="showStreakMessage">
      <div v-if="streakBroken" class="streak-broken">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Your streak was reset! Come back tomorrow to start a new streak.</span>
      </div>
      <div v-else-if="showMilestoneMessage" class="streak-milestone">
        <i class="fas fa-trophy"></i>
        <span>{{ milestoneMessage }}</span>
      </div>
      <div v-else-if="canClaimToday" class="streak-reminder">
        <i class="fas fa-bell"></i>
        <span>Check in now to continue your streak!</span>
      </div>
      <div v-else class="streak-next">
        <i class="fas fa-calendar-day"></i>
        <span>Come back tomorrow to continue your streak!</span>
      </div>
    </div>
    
    <div class="streak-milestones" v-if="showMilestones">
      <h4>Upcoming Milestones</h4>
      <div class="milestones-list">
        <div 
          v-for="milestone in visibleMilestones" 
          :key="milestone.days"
          class="milestone-item"
          :class="{ 'completed': currentStreak >= milestone.days }"
        >
          <div class="milestone-days">
            <i class="fas fa-calendar-week"></i>
            <span>{{ milestone.days }} Days</span>
          </div>
          <div class="milestone-reward">
            <i :class="milestone.icon"></i>
            <span>{{ milestone.reward }}</span>
          </div>
          <div class="milestone-progress" v-if="currentStreak < milestone.days">
            <div class="progress-bar">
              <div class="progress-filled" :style="{ width: `${Math.min(100, (currentStreak / milestone.days) * 100)}%` }"></div>
            </div>
            <span class="progress-text">{{ currentStreak }}/{{ milestone.days }}</span>
          </div>
          <div class="milestone-completed" v-else>
            <i class="fas fa-check-circle"></i>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format, addDays, differenceInDays, isBefore, isToday } from 'date-fns';
import { useNotification } from '@/composables/useNotification';

// Props
const props = defineProps({
  showMilestones: {
    type: Boolean,
    default: true
  }
});

// Emit events
const emit = defineEmits(['streak-claimed', 'milestone-reached']);

// Notification system
const notify = useNotification();

// State
const currentStreak = ref(0);
const lastCheckIn = ref(null);
const canClaimToday = ref(false);
const daysSinceClaim = ref(0);
const streakBroken = ref(false);
const showStreakMessage = ref(true);
const showMilestoneMessage = ref(false);
const milestoneReached = ref(null);

// Milestone configuration
const milestones = [
  { days: 3, reward: '1.2x Multiplier', icon: 'fas fa-bolt' },
  { days: 7, reward: '1.5x Multiplier', icon: 'fas fa-bolt' },
  { days: 14, reward: '2.0x Multiplier', icon: 'fas fa-bolt' },
  { days: 21, reward: 'Avatar Frame', icon: 'fas fa-id-badge' },
  { days: 30, reward: '3.0x Multiplier', icon: 'fas fa-bolt' },
  { days: 60, reward: 'Exclusive Emotes', icon: 'fas fa-laugh' },
  { days: 90, reward: '"Steadfast Explorer" Title', icon: 'fas fa-crown' },
];

// Computed
const streakMultiplier = computed(() => {
  if (currentStreak.value >= 30) return 3.0;
  if (currentStreak.value >= 14) return 2.0;
  if (currentStreak.value >= 7) return 1.5;
  if (currentStreak.value >= 3) return 1.2;
  return 1.0;
});

const claimButtonText = computed(() => {
  if (!canClaimToday.value) {
    return 'Already Claimed';
  }
  return 'Check In';
});

const milestoneMessage = computed(() => {
  if (!milestoneReached.value) return '';
  
  const milestone = milestones.find(m => m.days === milestoneReached.value);
  if (!milestone) return '';
  
  return `Milestone achieved: ${milestone.days} day streak! You've unlocked ${milestone.reward}!`;
});

const visibleMilestones = computed(() => {
  // Show the next 3 upcoming milestones
  return milestones
    .filter(m => m.days > currentStreak.value || m.days === currentStreak.value)
    .slice(0, 3);
});

// Methods
const loadStreakData = () => {
  try {
    // Load streak data from localStorage
    const storedStreak = localStorage.getItem('userStreak');
    const storedLastCheckIn = localStorage.getItem('lastCheckIn');
    
    if (storedStreak) {
      currentStreak.value = parseInt(storedStreak, 10);
    }
    
    if (storedLastCheckIn) {
      lastCheckIn.value = new Date(storedLastCheckIn);
      
      // Calculate days since last claim
      const today = new Date();
      const dayDiff = differenceInDays(today, lastCheckIn.value);
      
      if (dayDiff === 0) {
        // Already claimed today
        canClaimToday.value = false;
        daysSinceClaim.value = 1; // Show as claimed for today
      } else if (dayDiff === 1) {
        // Yesterday, can claim today
        canClaimToday.value = true;
        daysSinceClaim.value = 0; // Need to claim today
      } else {
        // More than 1 day, streak broken
        streakBroken.value = true;
        canClaimToday.value = true;
        daysSinceClaim.value = 0;
      }
    } else {
      // First time user, can claim
      canClaimToday.value = true;
      daysSinceClaim.value = 0;
    }
  } catch (error) {
    console.error('Error loading streak data:', error);
    // Default to allowing claim if there's an error
    canClaimToday.value = true;
    daysSinceClaim.value = 0;
  }
};

const claimDailyStreak = () => {
  if (!canClaimToday.value) return;
  
  // Track previous streak for milestone checking
  const prevStreak = currentStreak.value;
  
  // If streak was broken, reset to 0 before incrementing
  if (streakBroken.value) {
    currentStreak.value = 0;
    streakBroken.value = false;
  }
  
  // Increment streak
  currentStreak.value++;
  
  // Save to localStorage
  localStorage.setItem('userStreak', currentStreak.value.toString());
  
  // Update last check-in date
  const now = new Date();
  lastCheckIn.value = now;
  localStorage.setItem('lastCheckIn', now.toISOString());
  
  // Update UI
  canClaimToday.value = false;
  daysSinceClaim.value = 1;
  
  // Check for milestones
  checkMilestones(prevStreak);
  
  // Create reward based on streak
  const baseReward = 10;
  const baseXp = 25;
  
  // Apply multiplier if applicable
  const tokenReward = Math.floor(baseReward * streakMultiplier.value);
  const xpReward = Math.floor(baseXp * streakMultiplier.value);
  
  // Show notification
  notify.reward(`You received ${tokenReward} tokens and ${xpReward} XP!`, {
    title: currentStreak.value > 1 ? `${currentStreak.value} Day Streak!` : 'Daily Reward Claimed!',
    duration: 4000
  });
  
  // Emit claim event
  emit('streak-claimed', {
    streak: currentStreak.value,
    tokenReward,
    xpReward,
    multiplier: streakMultiplier.value
  });
  
  // Log for analytics
  console.log('Analytics: Daily streak claimed', {
    streak: currentStreak.value,
    tokenReward,
    xpReward,
    multiplier: streakMultiplier.value
  });
};

const checkMilestones = (prevStreak) => {
  // Find the first milestone that was reached with this claim
  for (const milestone of milestones) {
    if (prevStreak < milestone.days && currentStreak.value >= milestone.days) {
      // Found a newly reached milestone
      milestoneReached.value = milestone.days;
      showMilestoneMessage.value = true;
      
      // Show special notification
      notify.achievement(`Milestone reached: ${milestone.days} day streak!`, {
        title: 'Streak Milestone!',
        duration: 5000
      });
      
      // Emit milestone event
      emit('milestone-reached', {
        days: milestone.days,
        reward: milestone.reward
      });
      
      // Log for analytics
      console.log('Analytics: Streak milestone reached', {
        days: milestone.days,
        reward: milestone.reward
      });
      
      // We only care about the first milestone reached
      break;
    }
  }
};

// For testing - allows simulating different streak scenarios
const simulateStreak = (streak, daysAgo = 1) => {
  // Set streak and last check-in date
  currentStreak.value = streak;
  
  // Set last check-in to n days ago
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  lastCheckIn.value = date;
  
  // Save to localStorage
  localStorage.setItem('userStreak', streak.toString());
  localStorage.setItem('lastCheckIn', date.toISOString());
  
  // Reload streak data
  loadStreakData();
};

// Initialize
onMounted(() => {
  loadStreakData();
});

// Expose test methods
defineExpose({
  simulateStreak
});
</script>

<style scoped>
.activity-streak-card {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.2);
  padding: 1.25rem;
  box-shadow: var(--cosmic-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.streak-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.streak-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.streak-info h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  color: var(--cosmic-text-primary);
}

.streak-icon {
  color: #ff6b35;
}

.streak-count {
  color: #ff6b35;
  font-weight: 700;
}

.streak-multiplier {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--cosmic-purple);
  font-weight: 600;
}

.streak-claim-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #ff6b35, #ff3c00);
  color: white;
  border: none;
  border-radius: var(--cosmic-radius-md);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 10px rgba(255, 107, 53, 0.3);
}

.streak-claim-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
}

.streak-claim-button.disabled {
  background: linear-gradient(135deg, #b8b8b8, #8a8a8a);
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
}

.streak-claim-button.pulse {
  animation: pulse-orange 2s infinite;
}

.streak-calendar {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.streak-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
  position: relative;
  width: 14%;
}

.day-number {
  font-size: 0.75rem;
  color: var(--cosmic-text-tertiary);
  font-weight: 500;
}

.streak-day.current .day-number {
  color: #ff6b35;
  font-weight: 600;
}

.streak-day.completed .day-number {
  color: var(--cosmic-text-secondary);
}

.day-icon {
  font-size: 1.1rem;
  height: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.streak-day.completed .day-icon i {
  color: var(--cosmic-green);
}

.streak-day.current .day-icon i {
  color: #ff6b35;
  animation: pulse-orange 2s infinite;
}

.streak-day.future .day-icon i {
  color: var(--cosmic-text-tertiary);
  opacity: 0.5;
}

.day-reward {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--cosmic-purple);
  margin-top: 0.35rem;
}

.streak-day.milestone::after {
  content: '';
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--cosmic-purple);
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: white;
  box-shadow: 0 0 5px rgba(157, 53, 191, 0.5);
}

.streak-day.milestone.completed::after {
  background: var(--cosmic-green);
  box-shadow: 0 0 5px rgba(0, 229, 164, 0.5);
}

.streak-message {
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.streak-broken {
  color: var(--cosmic-red);
  background: rgba(255, 0, 76, 0.1);
  border: 1px solid rgba(255, 0, 76, 0.2);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md);
}

.streak-milestone {
  color: var(--cosmic-purple);
  background: rgba(157, 53, 191, 0.1);
  border: 1px solid rgba(157, 53, 191, 0.2);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md);
}

.streak-reminder {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.2);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md);
}

.streak-next {
  color: var(--cosmic-blue);
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md);
}

.streak-milestones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.streak-milestones h4 {
  font-size: 1rem;
  margin: 0;
  color: var(--cosmic-text-primary);
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.milestone-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all 0.25s ease;
}

.milestone-item:hover {
  background: rgba(15, 185, 253, 0.08);
}

.milestone-item.completed {
  background: rgba(0, 229, 164, 0.05);
  border: 1px solid rgba(0, 229, 164, 0.2);
}

.milestone-days {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  min-width: 100px;
}

.milestone-reward {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-purple);
  min-width: 140px;
}

.milestone-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.progress-bar {
  height: 6px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
  overflow: hidden;
  flex: 1;
}

.progress-filled {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue), var(--cosmic-purple));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  min-width: 40px;
  text-align: right;
}

.milestone-completed {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-green);
  flex: 1;
  justify-content: flex-end;
}

@keyframes pulse-orange {
  0% {
    filter: drop-shadow(0 0 0px #ff6b35);
  }
  50% {
    filter: drop-shadow(0 0 3px #ff6b35);
  }
  100% {
    filter: drop-shadow(0 0 0px #ff6b35);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .streak-calendar {
    padding: 0.75rem 0.5rem;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
  
  .day-icon {
    font-size: 1rem;
  }
  
  .day-reward {
    font-size: 0.7rem;
  }
  
  .milestone-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .milestone-progress, .milestone-completed {
    width: 100%;
  }
}
</style> 