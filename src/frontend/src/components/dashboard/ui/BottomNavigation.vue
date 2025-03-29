<!-- BottomNavigation.vue -->
<template>
  <nav class="mobile-bottom-nav">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      @click="selectTab(tab.id)"
      class="bottom-nav-item" 
      :class="{ 
        active: modelValue === tab.id,
        'with-badge': tab.badge && tab.badge > 0
      }"
    >
      <div class="nav-icon-container">
        <i :class="tab.icon"></i>
        <span v-if="tab.badge && tab.badge > 0" class="nav-badge">{{ formatBadge(tab.badge) }}</span>
      </div>
      <span class="nav-label">{{ tab.label }}</span>
      <div class="nav-indicator" v-if="modelValue === tab.id"></div>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'tab-selected']);

// Badge formatter to handle large numbers
const formatBadge = (value) => {
  if (value > 99) return '99+';
  return value;
};

// Tab selection handler
const selectTab = (tabId) => {
  if (tabId !== props.modelValue) {
    // Add ripple effect
    const button = document.querySelector(`.bottom-nav-item[data-tab-id="${tabId}"]`);
    if (button) addRippleEffect(button);
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Emit model value update
    emit('update:modelValue', tabId);
    
    // Also emit a separate event with tab details
    const selectedTab = props.tabs.find(tab => tab.id === tabId);
    emit('tab-selected', selectedTab);
  }
};

// Ripple effect for buttons
const addRippleEffect = (button) => {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  // Remove ripple after animation completes
  setTimeout(() => {
    ripple.remove();
  }, 600);
};
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-top: 1px solid rgba(15, 185, 253, 0.15);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
  transition: transform 0.3s ease-in-out;
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.5rem;
  color: var(--cosmic-text-tertiary);
  background: transparent;
  border: none;
  transition: all var(--cosmic-transition-fast);
  cursor: pointer;
  font-size: 0.75rem;
  gap: 0.25rem;
  overflow: hidden;
}

.nav-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  transition: transform 0.2s ease;
}

.bottom-nav-item i {
  font-size: 1.25rem;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.bottom-nav-item.active {
  color: var(--cosmic-blue);
}

.bottom-nav-item.active i {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
}

/* Indicator bar for active tab */
.nav-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 60%;
  height: 3px;
  background: var(--cosmic-blue);
  border-radius: 3px 3px 0 0;
  transform: translateX(-50%);
  box-shadow: var(--cosmic-glow-blue-sm);
  animation: indicator-appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes indicator-appear {
  from {
    transform: translateX(-50%) scaleX(0);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) scaleX(1);
    opacity: 1;
  }
}

/* Badges */
.nav-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background-color: var(--cosmic-red);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transform: scale(1);
  animation: badge-pulse 2s infinite;
}

.with-badge i {
  animation: subtle-shake 3s ease-in-out infinite;
}

@keyframes badge-pulse {
  0% { transform: scale(1); }
  10% { transform: scale(1.2); }
  20% { transform: scale(1); }
  100% { transform: scale(1); }
}

@keyframes subtle-shake {
  0% { transform: rotate(0); }
  1% { transform: rotate(5deg); }
  2% { transform: rotate(-5deg); }
  3% { transform: rotate(5deg); }
  4% { transform: rotate(-5deg); }
  5% { transform: rotate(0); }
  100% { transform: rotate(0); }
}

/* Ripple Effect */
.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.2);
  animation: ripple 0.6s linear;
  z-index: -1;
}

@keyframes ripple {
  to {
    width: 150px;
    height: 150px;
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .nav-label {
    font-size: 0.7rem;
  }
  
  .bottom-nav-item i {
    font-size: 1.1rem;
  }
}

/* Hide bottom navigation on larger screens */
@media (min-width: 1200px) {
  .mobile-bottom-nav {
    display: none;
  }
}
</style> 