<template>
  <div class="progressive-guide" v-if="isVisible">
    <div class="guide-tooltip" :style="tooltipStyle" :class="{'pulse-animation': isPulsing}">
      <div class="tooltip-content">
        <h3>{{ currentTip.title }}</h3>
        <p>{{ currentTip.description }}</p>
        <div class="tooltip-actions">
          <button @click="completeTip" class="action-button primary">
            {{ currentTip.actionText || $t('guide.gotIt') }}
          </button>
          <button @click="skipTip" class="action-button secondary" v-if="!currentTip.required">
            {{ $t('guide.skip') }}
          </button>
        </div>
        <div class="tooltip-progress">
          <span>{{ currentTipIndex + 1 }}/{{ tips.length }}</span>
        </div>
      </div>
      <div class="tooltip-arrow" :class="'arrow-' + currentTip.position"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';

const props = defineProps({
  targetSelector: {
    type: String,
    default: null
  },
  initialDelay: {
    type: Number,
    default: 1000
  }
});

const authStore = useAuthStore();
const notify = useNotification();
const isVisible = ref(false);
const currentTipIndex = ref(0);
const isPulsing = ref(true);
const tooltipStyle = ref({});
const completedTips = ref(JSON.parse(localStorage.getItem('completedTips') || '[]'));

// Define all available tips
const tips = [
  {
    id: 'dashboard-overview',
    title: 'Welcome to Your Dashboard',
    description: 'This is your command center for all activities. Check your daily rewards, missions, and more!',
    selector: '.dashboard-stats',
    position: 'bottom',
    actionText: 'Got it!',
    required: true
  },
  {
    id: 'daily-rewards',
    title: 'Claim Daily Rewards',
    description: 'Don\'t forget to claim your daily rewards to earn tokens and XP. The more consecutive days you log in, the bigger your rewards!',
    selector: '.daily-rewards-section',
    position: 'left',
    actionText: 'Claim now',
    required: false,
    action: () => {
      // Simulate claim daily rewards
      notify.reward('You received daily rewards!', { title: 'Daily Rewards' });
    }
  },
  {
    id: 'missions-tab',
    title: 'Complete Missions',
    description: 'Missions are a great way to earn rewards while exploring the platform. Check them out!',
    selector: '.missions-tab',
    position: 'right',
    actionText: 'See missions',
    required: false
  },
  {
    id: 'friends-section',
    title: 'Connect with Friends',
    description: 'Invite friends to join you and earn referral bonuses! Friends also boost your reward multipliers.',
    selector: '.friends-section',
    position: 'top',
    actionText: 'Invite friends',
    required: false
  }
];

// Filter out already completed tips
const availableTips = computed(() => {
  return tips.filter(tip => !completedTips.value.includes(tip.id));
});

// Get current tip
const currentTip = computed(() => {
  if (availableTips.value.length > currentTipIndex.value) {
    return availableTips.value[currentTipIndex.value];
  }
  return null;
});

// Position the tooltip relative to the target element
const positionTooltip = async () => {
  if (!currentTip.value || !currentTip.value.selector) {
    return;
  }
  
  await nextTick();
  
  const targetElement = document.querySelector(currentTip.value.selector);
  if (!targetElement) {
    console.warn(`Target element with selector "${currentTip.value.selector}" not found`);
    return;
  }
  
  const targetRect = targetElement.getBoundingClientRect();
  const tooltipElement = document.querySelector('.guide-tooltip');
  if (!tooltipElement) return;
  
  const tooltipRect = tooltipElement.getBoundingClientRect();
  
  let top, left;
  
  switch (currentTip.value.position) {
    case 'top':
      top = targetRect.top - tooltipRect.height - 15;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'bottom':
      top = targetRect.bottom + 15;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'left':
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      left = targetRect.left - tooltipRect.width - 15;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      left = targetRect.right + 15;
      break;
    default:
      top = targetRect.bottom + 15;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
  }
  
  // Make sure the tooltip stays within viewport
  if (left < 20) left = 20;
  if (left + tooltipRect.width > window.innerWidth - 20) {
    left = window.innerWidth - tooltipRect.width - 20;
  }
  
  if (top < 20) top = 20;
  if (top + tooltipRect.height > window.innerHeight - 20) {
    top = window.innerHeight - tooltipRect.height - 20;
  }
  
  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  };
};

// Complete current tip
const completeTip = () => {
  if (!currentTip.value) return;
  
  // Execute action if available
  if (currentTip.value.action && typeof currentTip.value.action === 'function') {
    currentTip.value.action();
  }
  
  // Mark tip as completed
  completedTips.value.push(currentTip.value.id);
  localStorage.setItem('completedTips', JSON.stringify(completedTips.value));
  
  // Move to next tip or hide
  if (currentTipIndex.value < availableTips.value.length - 1) {
    currentTipIndex.value++;
    positionTooltip();
  } else {
    isVisible.value = false;
    notify.success('You completed all dashboard tips!', {
      title: 'Tutorial Complete',
      duration: 3000
    });
  }
};

// Skip current tip
const skipTip = () => {
  if (!currentTip.value) return;
  
  // Mark tip as skipped but don't store in completed
  if (currentTipIndex.value < availableTips.value.length - 1) {
    currentTipIndex.value++;
    positionTooltip();
  } else {
    isVisible.value = false;
  }
};

// Show the guide
const showGuide = () => {
  if (availableTips.value.length > 0) {
    isVisible.value = true;
    currentTipIndex.value = 0;
    positionTooltip();
    isPulsing.value = true;
    
    // Stop pulsing after 3 seconds
    setTimeout(() => {
      isPulsing.value = false;
    }, 3000);
  }
};

// Reset the guide to show all tips again (for testing/debugging)
const resetGuide = () => {
  localStorage.removeItem('completedTips');
  completedTips.value = [];
  showGuide();
};

// Watch for changes to reposition tooltip
watch(currentTipIndex, () => {
  positionTooltip();
});

// Start guide after delay
onMounted(() => {
  // Check if user is first-time visitor to dashboard
  const hasVisitedDashboard = localStorage.getItem('hasVisitedDashboard') === 'true';
  
  if (!hasVisitedDashboard) {
    localStorage.setItem('hasVisitedDashboard', 'true');
    
    // Show after initial delay
    setTimeout(() => {
      showGuide();
    }, props.initialDelay);
  }
  
  // Handle window resize
  window.addEventListener('resize', positionTooltip);
  
  // Clean up
  onUnmounted(() => {
    window.removeEventListener('resize', positionTooltip);
  });
});

// Expose methods
defineExpose({
  showGuide,
  resetGuide
});
</script>

<style scoped>
.progressive-guide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9997;
}

.guide-tooltip {
  position: absolute;
  width: 300px;
  background: linear-gradient(135deg, rgba(10, 15, 30, 0.95) 0%, rgba(26, 18, 72, 0.95) 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  pointer-events: auto;
  z-index: 9998;
  transition: all 0.3s ease;
}

.guide-tooltip.pulse-animation {
  animation: pulse-tooltip 2s infinite;
}

@keyframes pulse-tooltip {
  0% { box-shadow: 0 0 0 0 rgba(157, 53, 191, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(157, 53, 191, 0); }
  100% { box-shadow: 0 0 0 0 rgba(157, 53, 191, 0); }
}

.tooltip-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tooltip-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.tooltip-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.action-button {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  color: white;
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.action-button:hover {
  transform: translateY(-2px);
}

.tooltip-progress {
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 5px;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 10px solid transparent;
}

.arrow-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(26, 18, 72, 0.95);
}

.arrow-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(26, 18, 72, 0.95);
}

.arrow-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(26, 18, 72, 0.95);
}

.arrow-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: rgba(26, 18, 72, 0.95);
}
</style> 