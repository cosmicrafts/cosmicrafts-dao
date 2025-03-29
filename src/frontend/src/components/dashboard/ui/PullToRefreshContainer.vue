<!-- PullToRefreshContainer.vue -->
<template>
  <div 
    class="pull-to-refresh-wrapper"
    ref="containerRef"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Pull-to-refresh indicator -->
    <div class="pull-to-refresh-indicator" ref="indicatorRef">
      <div class="refresh-spinner">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
      </div>
      <span>{{ pullMessage }}</span>
    </div>
    
    <!-- Actual content -->
    <div class="pull-to-refresh-content" :style="contentStyle">
      <slot></slot>
    </div>
    
    <!-- Optional info text when refreshing -->
    <div v-if="isRefreshing && showRefreshInfo" class="refresh-info-overlay">
      <div class="refresh-info-content">
        <i class="fas fa-sync-alt fa-spin"></i>
        <span>{{ refreshMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  threshold: {
    type: Number,
    default: 80 // Pixels to pull before refresh triggers
  },
  resistance: {
    type: Number,
    default: 2.5 // Higher value = more resistance
  },
  refreshMessage: {
    type: String,
    default: 'Refreshing data...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disableIfScrolled: {
    type: Boolean,
    default: true // Disable pull-to-refresh if content is scrolled down
  },
  showRefreshInfo: {
    type: Boolean,
    default: false // Show overlay with refresh info
  }
});

// Emits
const emit = defineEmits(['refresh']);

// Refs
const containerRef = ref(null);
const indicatorRef = ref(null);

// State
const startY = ref(0);
const currentY = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const translateY = ref(0);
const scrollTopAtStart = ref(0);

// Computed properties
const pullDistance = computed(() => {
  if (!isPulling.value) return 0;
  return currentY.value - startY.value;
});

const contentStyle = computed(() => {
  if (isRefreshing.value || !isPulling.value) return {};
  
  return {
    transform: `translateY(${translateY.value}px)`,
    transition: isPulling.value ? 'none' : 'transform 0.3s ease-out'
  };
});

const pullMessage = computed(() => {
  if (isRefreshing.value) return 'Refreshing...';
  if (pullDistance.value > props.threshold) return 'Release to refresh';
  return 'Pull down to refresh';
});

// Watch for disabled prop changes
watch(() => props.disabled, (newVal) => {
  if (newVal && isPulling.value) {
    resetPullState();
  }
});

// Touch handlers
const handleTouchStart = (e) => {
  if (props.disabled || isRefreshing.value) return;
  
  // Store initial touch position
  startY.value = e.touches[0].clientY;
  currentY.value = startY.value;
  
  // Check scroll position to determine if pull-to-refresh should be enabled
  if (props.disableIfScrolled && containerRef.value) {
    scrollTopAtStart.value = containerRef.value.scrollTop;
    isPulling.value = scrollTopAtStart.value <= 0;
  } else {
    isPulling.value = true;
  }
};

const handleTouchMove = (e) => {
  if (!isPulling.value || props.disabled || isRefreshing.value) return;
  
  // Update current position
  currentY.value = e.touches[0].clientY;
  
  // Check if element is scrolled
  if (props.disableIfScrolled && containerRef.value && containerRef.value.scrollTop > 0) {
    // User has scrolled down, disable pull-to-refresh
    isPulling.value = false;
    translateY.value = 0;
    updateIndicator(0);
    return;
  }
  
  // Calculate pull distance
  const distance = pullDistance.value;
  
  if (distance > 0) {
    // Apply resistance - the further the pull, the more resistance
    const resistedDelta = Math.pow(distance, 1/props.resistance);
    translateY.value = resistedDelta;
    
    // Update the indicator position
    updateIndicator(resistedDelta);
    
    // Prevent default scrolling behavior
    e.preventDefault();
  }
};

const handleTouchEnd = async () => {
  if (!isPulling.value || props.disabled || isRefreshing.value) return;
  
  // Check if pulled enough to trigger refresh
  if (pullDistance.value > props.threshold) {
    await triggerRefresh();
  } else {
    resetPullState(true);
  }
  
  isPulling.value = false;
};

// Helper methods
const updateIndicator = (distance) => {
  if (!indicatorRef.value) return;
  
  // Update the spinner rotation based on pull distance
  const spinner = indicatorRef.value.querySelector('.refresh-spinner i');
  if (spinner) {
    spinner.style.transform = `rotate(${distance}deg)`;
  }
  
  // Update the indicator opacity based on pull distance percentage
  const percentage = Math.min(distance / props.threshold, 1);
  indicatorRef.value.style.opacity = percentage.toFixed(2);
};

const triggerRefresh = async () => {
  isRefreshing.value = true;
  
  // Move content and indicator to "refreshing" position
  translateY.value = props.threshold / 2;
  updateIndicator(props.threshold);
  
  // Add haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  try {
    // Emit refresh event, await if it returns a promise
    await emit('refresh');
  } catch (error) {
    console.error('Error during refresh:', error);
  } finally {
    // Reset the state after refresh
    resetPullState(true);
    isRefreshing.value = false;
  }
};

const resetPullState = (animate = false) => {
  // Reset all values
  translateY.value = 0;
  
  // Add animation for smooth reset
  if (animate && containerRef.value) {
    containerRef.value.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => {
      if (containerRef.value) {
        containerRef.value.style.transition = '';
      }
    }, 300);
  }
  
  // Reset indicator
  if (indicatorRef.value) {
    indicatorRef.value.style.opacity = '0';
    
    const spinner = indicatorRef.value.querySelector('.refresh-spinner i');
    if (spinner) {
      spinner.style.transform = '';
    }
  }
};

// Clean up
onUnmounted(() => {
  // Clean up any event listeners if needed
});
</script>

<style scoped>
.pull-to-refresh-wrapper {
  position: relative;
  overflow: auto;
  width: 100%;
  height: 100%;
  -webkit-overflow-scrolling: touch; /* For iOS */
}

.pull-to-refresh-content {
  min-height: 100%;
  transform: translateY(0);
  will-change: transform;
}

.pull-to-refresh-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
  z-index: 5;
  gap: 10px;
  transition: opacity 0.2s ease;
}

.refresh-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.refresh-spinner i {
  font-size: 1.2rem;
  will-change: transform;
}

.pull-to-refresh-indicator span {
  font-size: 0.9rem;
}

/* Refresh info overlay */
.refresh-info-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.3s ease;
}

.refresh-info-content {
  background: var(--cosmic-glass-bg);
  border-radius: var(--cosmic-radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--cosmic-shadow-md);
  max-width: 250px;
  text-align: center;
}

.refresh-info-content i {
  font-size: 2rem;
  color: var(--cosmic-blue);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style> 