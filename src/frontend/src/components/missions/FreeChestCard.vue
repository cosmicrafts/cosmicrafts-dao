<template>
  <div class="free-chest-card cosmic-panel" :class="{ 'ready': isReady, 'claimed': isClaimed }">
    <div class="chest-content">
      <div class="chest-header">
        <div class="chest-icon-wrapper">
          <i class="fas fa-box-open"></i>
        </div>
        <div class="chest-title-wrapper">
          <h3 class="chest-title">Free Chest</h3>
          <span class="chest-subtitle">{{ chestSubtitle }}</span>
        </div>
      </div>
      
      <div class="chest-animation">
        <div class="chest-image" ref="chestImage">
          <div class="chest-glow"></div>
          <div class="chest-particles"></div>
        </div>
      </div>
      
      <div class="chest-timer" v-if="!isReady && !isClaimed">
        <div class="timer-circle-container">
          <svg class="timer-circle" width="120" height="120" viewBox="0 0 120 120">
            <circle class="timer-circle-bg" cx="60" cy="60" r="54" />
            <circle 
              class="timer-circle-progress" 
              cx="60" 
              cy="60" 
              r="54" 
              :style="{ 'stroke-dashoffset': circleOffset }"
            />
          </svg>
          <div class="timer-text">
            <span class="time-value">{{ formattedTimeRemaining }}</span>
          </div>
        </div>
        <div class="timer-label">Next chest available in</div>
      </div>
      
      <div class="chest-info" v-if="isReady || isClaimed">
        <div class="chest-rewards">
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="reward-details">
              <span class="reward-amount">{{ rewardAmount }}</span>
              <span class="reward-type">Stardust</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chest-actions">
        <button 
          v-if="isReady && !isClaimed" 
          @click="claimChest" 
          class="cosmic-button cosmic-button-primary"
          :disabled="isLoading"
        >
          <i class="fas fa-hand-sparkles"></i>
          <span class="button-text">Claim Chest</span>
          <div class="button-particles"></div>
          <div class="button-glow"></div>
        </button>
        
        <button 
          v-else-if="isClaimed" 
          class="cosmic-button cosmic-button-outline-primary"
          disabled
        >
          <i class="fas fa-check-circle"></i>
          <span class="button-text">Claimed</span>
        </button>
        
        <button 
          v-else 
          class="cosmic-button cosmic-button-outline-primary"
          disabled
        >
          <i class="fas fa-hourglass-half"></i>
          <span class="button-text">Waiting...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// Chest properties and state
const props = defineProps({
  nextAvailableTime: {
    type: Number,
    default: 0 // Unix timestamp in milliseconds
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  rewardAmount: {
    type: Number,
    default: 100
  }
});

const emits = defineEmits(['claim']);

const isLoading = ref(false);
const timeRemaining = ref(0);
const chestImage = ref(null);
const timerInterval = ref(null);

// Computed properties
const isReady = computed(() => {
  return timeRemaining.value <= 0 && !props.isClaimed;
});

const chestSubtitle = computed(() => {
  if (props.isClaimed) return 'Claimed';
  if (isReady.value) return 'Ready to Claim';
  return 'Coming Soon';
});

const formattedTimeRemaining = computed(() => {
  if (timeRemaining.value <= 0) return '00:00:00';
  
  const hours = Math.floor(timeRemaining.value / 3600);
  const minutes = Math.floor((timeRemaining.value % 3600) / 60);
  const seconds = timeRemaining.value % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const circleOffset = computed(() => {
  // Calculate circular progress bar offset
  // Circle circumference is 2πr = 2 * π * 54 ≈ 339.29
  const circumference = 2 * Math.PI * 54;
  
  if (timeRemaining.value <= 0) return 0;
  
  const totalTime = props.nextAvailableTime - Date.now() / 1000;
  const progress = timeRemaining.value / totalTime;
  return circumference * (1 - progress);
});

// Methods
const updateTimeRemaining = () => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const nextAvailable = props.nextAvailableTime;
  
  if (nextAvailable <= now) {
    timeRemaining.value = 0;
  } else {
    timeRemaining.value = nextAvailable - now;
  }
};

const setupTimer = () => {
  // Clear any existing interval
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  // Update immediately
  updateTimeRemaining();
  
  // Set up interval to update every second
  timerInterval.value = setInterval(() => {
    updateTimeRemaining();
    
    // If timer reaches zero, clear the interval
    if (timeRemaining.value <= 0) {
      clearInterval(timerInterval.value);
      // Add chest reveal animation
      if (chestImage.value) {
        chestImage.value.classList.add('glow-animation');
      }
    }
  }, 1000);
};

const claimChest = async () => {
  if (!isReady.value || isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    // Trigger the claim event with no parameters - parent will handle the ID
    emits('claim');
    
    // Add animation classes
    if (chestImage.value) {
      chestImage.value.classList.add('open-animation');
    }
  } catch (error) {
    console.error('Error claiming chest:', error);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  setupTimer();
  
  // Add animation if chest is ready
  if (isReady.value && !props.isClaimed && chestImage.value) {
    chestImage.value.classList.add('glow-animation');
  }
});

onBeforeUnmount(() => {
  // Clean up interval when component is destroyed
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});
</script>

<style scoped>
.free-chest-card {
  position: relative;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(0);
  height: 100%;
}

.free-chest-card.ready {
  background: linear-gradient(to bottom, 
    rgba(255, 174, 0, 0.08),
    rgba(255, 174, 0, 0.03));
  box-shadow: var(--cosmic-shadow-md), 0 0 20px rgba(255, 174, 0, 0.2);
  border: 1px solid rgba(255, 174, 0, 0.2);
}

.free-chest-card.claimed {
  opacity: 0.8;
}

.free-chest-card:hover {
  transform: translateY(-5px) translateZ(5px);
}

.free-chest-card.ready:hover {
  box-shadow: var(--cosmic-shadow-lg), 0 0 30px rgba(255, 174, 0, 0.3);
}

.chest-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chest-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chest-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 174, 0, 0.1) 0%, rgba(255, 123, 0, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 174, 0, 0.2);
  box-shadow: 0 0 10px rgba(255, 174, 0, 0.3);
}

.chest-icon-wrapper i {
  font-size: 1.25rem;
  color: var(--cosmic-orange);
  filter: drop-shadow(0 0 5px rgba(255, 174, 0, 0.5));
}

.chest-title-wrapper {
  flex: 1;
}

.chest-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.chest-subtitle {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.chest-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  min-height: 120px;
}

.chest-image {
  width: 100px;
  height: 100px;
  background: url('/assets/images/chest.png') no-repeat center center; /* Replace with actual chest image */
  background-size: contain;
  position: relative;
  transition: all 0.5s ease;
}

.chest-image.glow-animation {
  animation: chestGlow 2s infinite alternate;
}

.chest-image.open-animation {
  animation: chestOpen 1s forwards;
}

.chest-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 174, 0, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.free-chest-card.ready .chest-glow {
  opacity: 1;
  animation: pulseGlow 2s infinite alternate;
}

.chest-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.free-chest-card.ready .chest-particles::before,
.free-chest-card.ready .chest-particles::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 174, 0, 0.8);
  box-shadow: 0 0 10px rgba(255, 174, 0, 0.8);
  animation: floatParticle 4s infinite;
  opacity: 0;
}

.free-chest-card.ready .chest-particles::before {
  top: 30%;
  left: 20%;
  animation-delay: 0.5s;
}

.free-chest-card.ready .chest-particles::after {
  top: 60%;
  left: 80%;
  animation-delay: 1.5s;
}

.chest-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.timer-circle-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
}

.timer-circle {
  transform: rotate(-90deg);
}

.timer-circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 4px;
}

.timer-circle-progress {
  fill: none;
  stroke: var(--cosmic-orange);
  stroke-width: 4px;
  stroke-linecap: round;
  stroke-dasharray: 339.29; /* 2πr where r=54 */
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 1s linear;
  filter: drop-shadow(0 0 4px rgba(255, 174, 0, 0.6));
}

.timer-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.time-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  font-family: 'Courier New', monospace;
  letter-spacing: -1px;
}

.timer-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.chest-info {
  margin-bottom: 1.5rem;
}

.chest-rewards {
  background: rgba(255, 174, 0, 0.05);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  border: 1px solid rgba(255, 174, 0, 0.1);
}

.reward-item {
  display: flex;
  align-items: center;
}

.reward-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 174, 0, 0.1) 0%, rgba(255, 123, 0, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 174, 0, 0.2);
  box-shadow: 0 0 10px rgba(255, 174, 0, 0.3);
}

.reward-icon i {
  font-size: 1.25rem;
  color: var(--cosmic-orange);
  filter: drop-shadow(0 0 5px rgba(255, 174, 0, 0.5));
}

.reward-details {
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

.chest-actions {
  margin-top: auto;
  display: flex;
  justify-content: center;
}

@keyframes chestGlow {
  0% {
    filter: brightness(1) drop-shadow(0 0 5px rgba(255, 174, 0, 0.3));
    transform: scale(1);
  }
  100% {
    filter: brightness(1.2) drop-shadow(0 0 15px rgba(255, 174, 0, 0.6));
    transform: scale(1.05);
  }
}

@keyframes chestOpen {
  0% {
    transform: scale(1) translateY(0);
  }
  20% {
    transform: scale(1.1) translateY(0);
  }
  40% {
    transform: scale(0.95) translateY(0);
  }
  60% {
    transform: scale(1.05) translateY(-10px);
  }
  80% {
    transform: scale(1) translateY(-5px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

@keyframes pulseGlow {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

@keyframes floatParticle {
  0% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.5);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timer-circle-container {
    width: 100px;
    height: 100px;
  }
  
  .time-value {
    font-size: 1rem;
  }
  
  .chest-animation {
    min-height: 100px;
  }
  
  .chest-image {
    width: 80px;
    height: 80px;
  }
}
</style> 