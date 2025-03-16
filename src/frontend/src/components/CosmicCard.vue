<template>
  <div 
    :class="[
      'cosmic-card',
      getCardVariantClass(),
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
          <h3 v-if="title" :class="getHeaderClass()">{{ title }}</h3>
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

const emit = defineEmits(['click']);

const showHeader = computed(() => {
  return props.title || props.icon || !!$slots.title || !!$slots.action;
});

const handleClick = (event) => {
  if (props.interactive) {
    emit('click', event);
  }
};

const getCardVariantClass = () => {
  switch (props.variant) {
    case 'primary':
      return 'cosmic-panel-primary';
    case 'secondary':
      return 'cosmic-panel-secondary';
    case 'flat':
      return 'cosmic-card-flat';
    default:
      return '';
  }
};

const getHeaderClass = () => {
  if (!props.gradientTitle) {
    return '';
  }
  
  return props.variant === 'secondary' ? 'cosmic-title-secondary' : 'cosmic-title';
};
</script>

<style scoped>
/* Inherit most styles from cosmic-theme.css */

.cosmic-card {
  background: var(--cosmic-gradient-panel);
  backdrop-filter: blur(8px);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  overflow: hidden;
  transition: transform var(--cosmic-transition-medium), box-shadow var(--cosmic-transition-medium);
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.cosmic-card-hover:hover {
  transform: translateY(-5px) rotateX(2deg) rotateY(2deg) translateZ(10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  background: var(--cosmic-gradient-panel-hover);
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
  padding: 1rem;
  border-bottom: var(--cosmic-glass-border-blue);
}

.cosmic-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cosmic-card-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.cosmic-card-icon {
  font-size: 1.5rem;
  color: var(--cosmic-blue);
}

.cosmic-card-body {
  padding: 1rem;
}

.cosmic-card-footer {
  padding: 1rem;
  border-top: var(--cosmic-glass-border-blue);
  background: rgba(0, 0, 0, 0.1);
}

/* Secondary variant special handling */
.cosmic-panel-secondary .cosmic-card-header {
  border-bottom: var(--cosmic-glass-border-orange);
}

.cosmic-panel-secondary .cosmic-card-footer {
  border-top: var(--cosmic-glass-border-orange);
}

.cosmic-panel-secondary .cosmic-card-icon {
  color: var(--cosmic-orange);
}

/* Flat variant */
.cosmic-card-flat {
  background: rgba(35, 50, 65, 0.4);
  border: none;
  box-shadow: none;
}

/* Media queries */
@media (max-width: 768px) {
  .cosmic-card-body {
    padding: 0.75rem;
  }
  
  .cosmic-card-header {
    padding: 0.75rem;
  }
  
  .cosmic-card-footer {
    padding: 0.75rem;
  }
}
</style> 