<template>
  <div 
    :class="[
      'cosmic-card',
      variant ? `cosmic-card-${variant}` : '',
      { 'cosmic-card-hover': hover },
      { 'cosmic-card-interactive': interactive },
      customClass
    ]"
    @click="handleClick"
  >
    <!-- Header Section with title and optional action button -->
    <div v-if="showHeader" class="cosmic-card-header">
      <div class="cosmic-card-title">
        <span v-if="icon" class="cosmic-card-icon">{{ icon }}</span>
        <slot name="title">
          <h3 v-if="title" :class="{ 'text-gradient': gradientTitle }">{{ title }}</h3>
        </slot>
      </div>
      <slot name="action"></slot>
    </div>
    
    <!-- Body Section -->
    <div class="cosmic-card-body">
      <slot></slot>
    </div>
    
    <!-- Footer Section -->
    <div v-if="$slots.footer" class="cosmic-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Card styling
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'flat'].includes(value)
  },
  // Card content
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  gradientTitle: {
    type: Boolean,
    default: false
  },
  // Card behavior
  hover: {
    type: Boolean,
    default: true
  },
  interactive: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
});

const showHeader = computed(() => {
  return props.title || props.icon || !!slots.title || !!slots.action;
});

const handleClick = (event) => {
  if (props.interactive) {
    emit('click', event);
  }
};
</script>

<style scoped>
.cosmic-card {
  background: var(--color-surface-primary);
  backdrop-filter: blur(8px);
  border: var(--border-thin);
  border-radius: var(--radius-medium);
  overflow: hidden;
  transition: transform var(--transition-medium), box-shadow var(--transition-medium);
}

.cosmic-card-hover:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
}

.cosmic-card-interactive {
  cursor: pointer;
}

.cosmic-card-interactive:active {
  transform: translateY(0);
  opacity: 0.9;
}

.cosmic-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: var(--border-thin);
}

.cosmic-card-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.cosmic-card-title h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
}

.cosmic-card-icon {
  font-size: var(--text-xl);
  color: var(--color-primary);
}

.cosmic-card-body {
  padding: var(--space-md);
}

.cosmic-card-footer {
  padding: var(--space-md);
  border-top: var(--border-thin);
  background: rgba(0, 0, 0, 0.1);
}

/* Variants */
.cosmic-card-primary {
  border: 1px solid var(--color-primary);
  box-shadow: 0 0 8px rgba(0, 195, 255, 0.2);
}

.cosmic-card-primary .cosmic-card-header {
  background: rgba(0, 195, 255, 0.1);
}

.cosmic-card-secondary {
  border: 1px solid var(--color-secondary);
  box-shadow: 0 0 8px rgba(255, 0, 195, 0.2);
}

.cosmic-card-secondary .cosmic-card-header {
  background: rgba(255, 0, 195, 0.1);
}

.cosmic-card-flat {
  background: var(--color-surface-tertiary);
  border: none;
  box-shadow: none;
}

/* Media queries */
@media (max-width: 768px) {
  .cosmic-card-body {
    padding: var(--space-sm);
  }
  
  .cosmic-card-header {
    padding: var(--space-sm);
  }
  
  .cosmic-card-footer {
    padding: var(--space-sm);
  }
}
</style> 