<!-- FloatingActionButton.vue -->
<template>
  <div 
    class="fab-container" 
    :class="{ 'fab-expanded': isExpanded, 'fab-hidden': hidden }"
    v-click-outside="onClickOutside"
  >
    <div class="fab-actions" :class="{ 'fab-actions-visible': isExpanded }">
      <button 
        v-for="(action, index) in actions" 
        :key="index"
        @click="handleAction(action)"
        class="fab-action-button"
        :style="actionButtonStyle(index)"
      >
        <i :class="action.icon"></i>
        <span class="fab-action-label">{{ action.label }}</span>
        <div v-if="action.showPulse" class="fab-action-pulse"></div>
      </button>
    </div>
    
    <button 
      class="fab-main" 
      :class="{ 'primary': color === 'primary', 'danger': color === 'danger', 'success': color === 'success' }"
      @click="toggleFab"
    >
      <i class="fas" :class="mainIcon"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Custom click outside directive
const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

// Props
const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  hideOnScroll: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: 'primary', // 'primary', 'danger', 'success'
    validator: value => ['primary', 'danger', 'success'].includes(value)
  },
  mainIcon: {
    type: String,
    default: "fa-plus"
  },
  expandedIcon: {
    type: String,
    default: "fa-times"
  },
  addBackdrop: {
    type: Boolean,
    default: true
  },
  position: {
    type: String,
    default: 'bottom-right', // 'bottom-right', 'bottom-left', 'bottom-center'
    validator: value => ['bottom-right', 'bottom-left', 'bottom-center'].includes(value)
  },
  offsetBottom: {
    type: Number,
    default: 80 // px from bottom
  }
});

// Emits
const emit = defineEmits(['action', 'open', 'close']);

// State
const isExpanded = ref(false);
const hidden = ref(false);
const lastScrollY = ref(0);

// Computed main icon based on expanded state
const mainIconComputed = computed(() => {
  return isExpanded.value ? props.expandedIcon : props.mainIcon;
});

// Generate style for action buttons with staggered animations
const actionButtonStyle = (index) => {
  return {
    '--delay': `${index * 0.05}s`,
    '--index': index,
  };
};

// Toggle FAB expansion
const toggleFab = () => {
  isExpanded.value = !isExpanded.value;
  
  // Add backdrop
  if (props.addBackdrop) {
    document.body.classList.toggle('fab-backdrop-active', isExpanded.value);
  }
  
  // Add haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(isExpanded.value ? 30 : 20);
  }
  
  // Emit events
  if (isExpanded.value) {
    emit('open');
  } else {
    emit('close');
  }
};

// Handle action button click
const handleAction = (action) => {
  emit('action', action);
  
  // Close FAB after action unless specified to keep open
  if (!action.keepOpen) {
    isExpanded.value = false;
    
    if (props.addBackdrop) {
      document.body.classList.remove('fab-backdrop-active');
    }
  }
};

// Click outside handler
const onClickOutside = () => {
  if (isExpanded.value) {
    isExpanded.value = false;
    
    if (props.addBackdrop) {
      document.body.classList.remove('fab-backdrop-active');
    }
    
    emit('close');
  }
};

// Scroll handler for hiding FAB when scrolling down
const handleScroll = () => {
  if (!props.hideOnScroll) return;
  
  const currentScrollY = window.scrollY;
  
  // Show/hide based on scroll direction
  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    // Scrolling down & not at top
    hidden.value = true;
  } else {
    // Scrolling up or at top
    hidden.value = false;
  }
  
  lastScrollY.value = currentScrollY;
};

// Handle visibility based on scroll
onMounted(() => {
  if (props.hideOnScroll) {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
});

onUnmounted(() => {
  // Clean up
  if (props.hideOnScroll) {
    window.removeEventListener('scroll', handleScroll);
  }
  document.body.classList.remove('fab-backdrop-active');
});

// Register click outside directive
const vClickOutside = clickOutside;
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: v-bind('`${props.offsetBottom}px`');
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  z-index: 90;
  transition: transform 0.3s ease;
}

.fab-container.fab-hidden {
  transform: translateY(150%);
}

/* Position variants */
.fab-container[class*="bottom-left"] {
  right: auto;
  left: 20px;
}

.fab-container[class*="bottom-center"] {
  right: auto;
  left: 50%;
  transform: translateX(-50%);
}

.fab-container[class*="bottom-center"].fab-hidden {
  transform: translateX(-50%) translateY(150%);
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cosmic-blue), var(--cosmic-blue-dark));
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px rgba(15, 185, 253, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  will-change: transform;
}

.fab-main:active {
  transform: scale(0.95);
}

.fab-main i {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

/* Color variants */
.fab-main.primary {
  background: linear-gradient(135deg, var(--cosmic-blue), var(--cosmic-blue-dark));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px rgba(15, 185, 253, 0.4);
}

.fab-main.danger {
  background: linear-gradient(135deg, var(--cosmic-red), var(--cosmic-red-dark));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 0, 76, 0.4);
}

.fab-main.success {
  background: linear-gradient(135deg, var(--cosmic-green), var(--cosmic-green-dark));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 229, 164, 0.4);
}

.fab-expanded .fab-main {
  transform: rotate(135deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(15, 185, 253, 0.5);
}

.fab-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: absolute;
  bottom: 70px;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: all 0.3s ease-out;
}

.fab-actions-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}

.fab-action-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: var(--cosmic-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 0 8px rgba(15, 185, 253, 0.2);
  transition: all 0.2s ease;
  transform: scale(0);
  opacity: 0;
}

.fab-actions-visible .fab-action-button {
  transform: scale(1);
  opacity: 1;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              opacity 0.3s ease;
  transition-delay: calc(0.05s * var(--index));
}

.fab-action-button:hover {
  background: rgba(15, 185, 253, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 12px rgba(15, 185, 253, 0.3);
}

.fab-action-button:active {
  transform: translateY(0) scale(0.95);
}

.fab-action-button i {
  font-size: 1.2rem;
}

.fab-action-label {
  position: absolute;
  right: 60px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.2s ease;
  pointer-events: none;
}

.fab-action-button:hover .fab-action-label {
  opacity: 1;
  transform: translateX(0);
}

/* Pulse animation for actions */
.fab-action-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.15);
  z-index: -1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Global backdrop style */
:global(body.fab-backdrop-active)::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 80;
  pointer-events: all;
}

/* Adjust for safe areas */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .fab-container {
    bottom: calc(v-bind('props.offsetBottom') + env(safe-area-inset-bottom, 0px));
  }
}
</style> 