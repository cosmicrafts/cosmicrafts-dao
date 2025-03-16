<template>
  <button 
    :class="[
      'cosmic-button', 
      getButtonClass(),
      { 'cosmic-button-icon': icon && !label },
      { 'cosmic-button-loading': loading },
      { 'cosmic-button-block': block },
      size ? `cosmic-button-${size}` : '',
      customClass
    ]" 
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="cosmic-loading">⟳</span>
    <span v-else-if="icon" class="cosmic-button-icon">{{ icon }}</span>
    <span v-if="label" class="button-text">{{ label }}</span>
    <slot></slot>
    <span class="button-glow"></span>
    <span class="button-particles"></span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Button styling
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline-primary', 'outline-secondary', 'danger', 'success', 'warning', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Button content
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  // Button behavior
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};

const getButtonClass = () => {
  // Map old variant names to new theme system class names
  const variantMap = {
    'primary': 'cosmic-button-primary',
    'secondary': 'cosmic-button-secondary',
    'outline-primary': 'cosmic-button-outline-primary',
    'outline-secondary': 'cosmic-button-outline-secondary',
    'danger': 'cosmic-button-danger',
    'success': 'cosmic-button-success',
    'warning': 'cosmic-button-warning',
    'info': 'cosmic-button-info'
  };
  
  return variantMap[props.variant] || 'cosmic-button-primary';
};
</script>

<style scoped>
/* Inherit base styles from cosmic-theme.css */
/* Only add button specific styles that aren't in the theme */

/* Size variants */
.cosmic-button-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.cosmic-button-md {
  padding: 0.7rem 1.6rem;
  font-size: 0.95rem;
}

.cosmic-button-lg {
  padding: 0.9rem 2rem;
  font-size: 1.1rem;
}

/* Special variants not in the theme */
.cosmic-button-danger {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.9) 0%, 
    rgba(220, 38, 38, 0.9) 100%);
  color: white;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.25),
    0 0 15px rgba(239, 68, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}

.cosmic-button-success {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.9) 0%, 
    rgba(5, 150, 105, 0.9) 100%);
  color: white;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.25),
    0 0 15px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}

.cosmic-button-warning {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.9) 0%, 
    rgba(217, 119, 6, 0.9) 100%);
  color: white;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.25),
    0 0 15px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}

.cosmic-button-info {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.9) 0%, 
    rgba(37, 99, 235, 0.9) 100%);
  color: white;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.25),
    0 0 15px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}

/* States */
.cosmic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.cosmic-button-loading {
  cursor: wait;
}

/* Icon-only button */
.cosmic-button-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
}

.cosmic-button-sm.cosmic-button-icon {
  width: 32px;
  height: 32px;
}

.cosmic-button-lg.cosmic-button-icon {
  width: 48px;
  height: 48px;
}

/* Block button */
.cosmic-button-block {
  display: flex;
  width: 100%;
}

/* Loading spinner */
.cosmic-loading {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Active state */
.cosmic-button:active:not(:disabled) {
  transform: translateY(1px) !important;
  opacity: 0.9;
}
</style> 