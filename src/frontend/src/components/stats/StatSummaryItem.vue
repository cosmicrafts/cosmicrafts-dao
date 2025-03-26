<template>
  <div 
    class="stat-summary-item" 
    :class="{ 
      'dark': dark,
      'animated': animated && hasAnimated 
    }"
  >
    <div class="stat-icon">
      <i :class="icon"></i>
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ formattedValue }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  dark: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  }
});

const hasAnimated = ref(false);

// Format value as needed
const formattedValue = computed(() => {
  // If value is already a string (like "45%"), return as is
  if (typeof props.value === 'string') {
    return props.value;
  }
  
  // Format large numbers
  const num = Number(props.value);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
});

onMounted(() => {
  // Delay animation to ensure it happens after component is rendered
  setTimeout(() => {
    hasAnimated.value = true;
  }, 100);
});
</script>

<style scoped>
.stat-summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all var(--cosmic-transition-fast);
}

.stat-summary-item:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.stat-summary-item.dark {
  background: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.15);
}

.stat-summary-item.dark:hover {
  background: rgba(15, 185, 253, 0.12);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-md);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all var(--cosmic-transition-medium);
}

.stat-summary-item:hover .stat-icon {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.5);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  transition: all var(--cosmic-transition-medium);
}

.stat-summary-item:hover .stat-value {
  color: var(--cosmic-blue);
  text-shadow: 0 0 5px rgba(15, 185, 253, 0.3);
}

/* Animation for value counting up */
.stat-summary-item.animated .stat-value {
  animation: countUp 1.5s ease-out forwards;
}

@keyframes countUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stat-summary-item {
    padding: 0.75rem;
  }
  
  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 1rem;
  }
}
</style> 