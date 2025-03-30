<template>
  <div class="progressive-guide" v-if="isVisible">
    <div 
      class="guide-tooltip"
      :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }"
      :class="{ 'arrow-top': tooltipArrowPosition === 'top', 'arrow-bottom': tooltipArrowPosition === 'bottom', 'arrow-left': tooltipArrowPosition === 'left', 'arrow-right': tooltipArrowPosition === 'right' }"
    >
      <div class="tooltip-header">
        <div class="tooltip-title">{{ currentTip.title }}</div>
        <button @click="closeTip" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="tooltip-content">
        <p>{{ currentTip.description }}</p>
        <div class="tooltip-actions">
          <button v-if="showSkip" @click="skipTip" class="skip-button">
            Skip
          </button>
          <button @click="handleAction" class="action-button">
            {{ currentTip.actionText }} <i :class="currentTip.actionIcon"></i>
          </button>
        </div>
      </div>
      <div class="progress-indicator">
        <div class="progress-dots">
          <div 
            v-for="(tip, index) in tips" 
            :key="index" 
            class="progress-dot"
            :class="{ 'active': currentTipIndex === index, 'completed': completedTips.includes(index) }"
          ></div>
        </div>
        <span class="progress-text">{{ currentTipIndex + 1 }}/{{ tips.length }}</span>
      </div>
    </div>
    
    <div 
      v-if="currentTip && currentTip.highlightSelector" 
      class="highlight-overlay"
      :style="highlightStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';

// Router and notification setup
const router = useRouter();
const notify = useNotification();

// Define props and emits
const props = defineProps({
  dashboardRef: Object
});

const emit = defineEmits(['tip-completed', 'guide-completed']);

// State
const isVisible = ref(false);
const currentTipIndex = ref(0);
const completedTips = ref([]);
const tooltipPosition = ref({ top: 0, left: 0 });
const tooltipArrowPosition = ref('bottom');
const highlightStyle = ref({});
const showSkip = ref(true);

// Tips configuration
const tips = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard',
    description: 'This is your command center. Check in daily for rewards and track your progress.',
    actionText: 'Got it',
    actionIcon: 'fas fa-check',
    highlightSelector: '.welcome-card',
    action: () => completeTip()
  },
  {
    id: 'daily-streak',
    title: 'Daily Streak Rewards',
    description: 'Check in every day to build your streak and multiply your rewards.',
    actionText: 'Claim Daily Reward',
    actionIcon: 'fas fa-calendar-check',
    highlightSelector: '.streak-card',
    action: () => {
      // Trigger daily claim and complete tip
      emit('daily-claim');
      completeTip();
    }
  },
  {
    id: 'wallet',
    title: 'Your Cosmic Wallet',
    description: 'Track your tokens and see your balance grow as you play.',
    actionText: 'View Wallet',
    actionIcon: 'fas fa-wallet',
    highlightSelector: '.wallet-section',
    action: () => {
      router.push('/wallet');
      completeTip();
    }
  },
  {
    id: 'missions',
    title: 'Complete Missions',
    description: 'Missions are a great way to earn rewards. Activate and complete them daily.',
    actionText: 'View Missions',
    actionIcon: 'fas fa-tasks',
    highlightSelector: '.fab-container',
    action: () => {
      // In the actual implementation, navigate to missions tab
      emit('select-tab', 'missions');
      completeTip();
    }
  },
  {
    id: 'collection',
    title: 'Your NFT Collection',
    description: 'View and manage your NFTs. The more you play, the more you collect!',
    actionText: 'View Collection',
    actionIcon: 'fas fa-cubes',
    highlightSelector: '.nft-collection-section',
    action: () => {
      emit('select-tab', 'collection');
      completeTip();
    }
  }
];

// Computed
const currentTip = computed(() => {
  return tips[currentTipIndex.value] || null;
});

// Methods
const initializeGuide = () => {
  // Load completed tips from localStorage
  const savedCompletedTips = localStorage.getItem('completedTips');
  if (savedCompletedTips) {
    completedTips.value = JSON.parse(savedCompletedTips);
  }
  
  // Find first incomplete tip
  currentTipIndex.value = findNextIncompleteTip();
  
  // If all tips are completed, don't show
  if (currentTipIndex.value >= tips.length) {
    isVisible.value = false;
    return;
  }
  
  // Check if this is the first dashboard visit
  const hasVisited = localStorage.getItem('hasVisitedDashboard');
  if (!hasVisited) {
    // Set a delay for the first visit
    setTimeout(() => {
      isVisible.value = true;
      updateTooltipPosition();
    }, 2000);
    localStorage.setItem('hasVisitedDashboard', 'true');
  }
};

const showGuide = () => {
  isVisible.value = true;
  nextTick(() => {
    updateTooltipPosition();
  });
};

const hideGuide = () => {
  isVisible.value = false;
};

const resetGuide = () => {
  completedTips.value = [];
  localStorage.removeItem('completedTips');
  currentTipIndex.value = 0;
  isVisible.value = true;
  updateTooltipPosition();
};

const updateTooltipPosition = () => {
  if (!currentTip.value || !currentTip.value.highlightSelector) {
    return;
  }
  
  // Find the element to highlight
  const element = document.querySelector(currentTip.value.highlightSelector);
  if (!element) {
    console.warn(`Element not found: ${currentTip.value.highlightSelector}`);
    // Position in center if element not found
    tooltipPosition.value = {
      top: window.innerHeight / 2 - 100,
      left: window.innerWidth / 2 - 150
    };
    return;
  }
  
  // Get element position
  const rect = element.getBoundingClientRect();
  
  // Create highlight overlay
  highlightStyle.value = {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  };
  
  // Position tooltip near the element
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const tooltipWidth = 300;
  const tooltipHeight = 200;
  
  // Calculate best position based on available space
  // Default: below the element
  if (rect.bottom + tooltipHeight < windowHeight) {
    // Position below
    tooltipPosition.value = {
      top: rect.bottom + 15,
      left: Math.min(windowWidth - tooltipWidth - 20, Math.max(20, rect.left + rect.width / 2 - tooltipWidth / 2))
    };
    tooltipArrowPosition.value = 'top';
  } else if (rect.top - tooltipHeight > 0) {
    // Position above
    tooltipPosition.value = {
      top: rect.top - tooltipHeight - 15,
      left: Math.min(windowWidth - tooltipWidth - 20, Math.max(20, rect.left + rect.width / 2 - tooltipWidth / 2))
    };
    tooltipArrowPosition.value = 'bottom';
  } else if (rect.right + tooltipWidth < windowWidth) {
    // Position to the right
    tooltipPosition.value = {
      top: Math.min(windowHeight - tooltipHeight - 20, Math.max(20, rect.top + rect.height / 2 - tooltipHeight / 2)),
      left: rect.right + 15
    };
    tooltipArrowPosition.value = 'left';
  } else {
    // Position to the left
    tooltipPosition.value = {
      top: Math.min(windowHeight - tooltipHeight - 20, Math.max(20, rect.top + rect.height / 2 - tooltipHeight / 2)),
      left: rect.left - tooltipWidth - 15
    };
    tooltipArrowPosition.value = 'right';
  }
};

const findNextIncompleteTip = () => {
  for (let i = 0; i < tips.length; i++) {
    if (!completedTips.value.includes(i)) {
      return i;
    }
  }
  return tips.length; // All completed
};

const completeTip = () => {
  if (!completedTips.value.includes(currentTipIndex.value)) {
    completedTips.value.push(currentTipIndex.value);
    
    // Save to localStorage
    localStorage.setItem('completedTips', JSON.stringify(completedTips.value));
    
    // Emit completed event
    emit('tip-completed', tips[currentTipIndex.value].id);
  }
  
  // Move to next tip
  const nextTipIndex = findNextIncompleteTip();
  
  // Check if we've completed all tips
  if (nextTipIndex >= tips.length) {
    isVisible.value = false;
    emit('guide-completed');
    
    // Show congratulations notification
    notify.success('You\'ve completed the dashboard guide!', {
      title: 'All Set!',
      duration: 4000
    });
    
    return;
  }
  
  // Move to next tip
  currentTipIndex.value = nextTipIndex;
  
  // Update position for new tip
  nextTick(() => {
    updateTooltipPosition();
  });
};

const closeTip = () => {
  hideGuide();
};

const skipTip = () => {
  // Move to next tip without marking current as complete
  currentTipIndex.value = findNextIncompleteTip();
  
  // Check if we've gone through all tips
  if (currentTipIndex.value >= tips.length) {
    isVisible.value = false;
    return;
  }
  
  // Update position for new tip
  nextTick(() => {
    updateTooltipPosition();
  });
};

const handleAction = () => {
  if (currentTip.value && currentTip.value.action) {
    currentTip.value.action();
  }
};

// Initialize
onMounted(() => {
  initializeGuide();
  
  // Listen for window resize
  window.addEventListener('resize', () => {
    if (isVisible.value) {
      updateTooltipPosition();
    }
  });
});

// Expose methods to parent component
defineExpose({
  showGuide,
  hideGuide,
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
  z-index: 1000;
}

.guide-tooltip {
  position: absolute;
  width: 300px;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-lg), 0 0 15px rgba(15, 185, 253, 0.3);
  padding: 1rem;
  pointer-events: auto;
  z-index: 1001;
  animation: tooltip-fade-in 0.4s ease-out;
}

.guide-tooltip::before {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  background: var(--cosmic-glass-bg);
  transform: rotate(45deg);
  border: 1px solid rgba(15, 185, 253, 0.3);
}

.guide-tooltip.arrow-top::before {
  top: -8px;
  left: 50%;
  margin-left: -8px;
  border-bottom: none;
  border-right: none;
}

.guide-tooltip.arrow-bottom::before {
  bottom: -8px;
  left: 50%;
  margin-left: -8px;
  border-top: none;
  border-left: none;
}

.guide-tooltip.arrow-left::before {
  left: -8px;
  top: 50%;
  margin-top: -8px;
  border-right: none;
  border-bottom: none;
}

.guide-tooltip.arrow-right::before {
  right: -8px;
  top: 50%;
  margin-top: -8px;
  border-left: none;
  border-top: none;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.tooltip-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

.close-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.2);
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-text-primary);
}

.tooltip-content {
  color: var(--cosmic-text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.tooltip-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.action-button {
  background: linear-gradient(135deg, var(--cosmic-blue), var(--cosmic-blue-dark));
  color: white;
  border: none;
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-md);
}

.skip-button {
  background: transparent;
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-text-tertiary);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skip-button:hover {
  background: rgba(15, 185, 253, 0.05);
  color: var(--cosmic-text-secondary);
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

.progress-dots {
  display: flex;
  gap: 0.5rem;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.2);
  transition: all 0.2s ease;
}

.progress-dot.active {
  background: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
  width: 10px;
  height: 10px;
  margin-top: -1px;
}

.progress-dot.completed {
  background: rgba(0, 229, 164, 0.5);
}

.progress-text {
  color: var(--cosmic-text-tertiary);
  font-size: 0.8rem;
}

.highlight-overlay {
  position: absolute;
  border-radius: var(--cosmic-radius-md);
  border: 2px solid var(--cosmic-blue);
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.4), 0 0 20px rgba(15, 185, 253, 0.5);
  pointer-events: none;
  z-index: 999;
  animation: highlight-pulse 2s infinite;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.4), 0 0 20px rgba(15, 185, 253, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.4), 0 0 20px rgba(15, 185, 253, 0.8);
  }
  100% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.4), 0 0 20px rgba(15, 185, 253, 0.5);
  }
}
</style> 