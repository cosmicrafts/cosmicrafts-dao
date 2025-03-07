<template>
  <button 
    :class="[
      'cosmic-button', 
      `cosmic-button-${variant}`,
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
    <span v-if="label" class="cosmic-button-label">{{ label }}</span>
    <slot></slot>
  </button>
</template>

<script setup>
const props = defineProps({
  // Button styling
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success', 'warning', 'info'].includes(value)
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
</script>

<style scoped>
.cosmic-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-medium);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all var(--transition-medium);
  border: none;
  color: var(--color-text-primary);
  position: relative;
  overflow: hidden;
}

/* Size variants */
.cosmic-button-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
}

.cosmic-button-md {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-md);
}

.cosmic-button-lg {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-lg);
}

/* Style variants */
.cosmic-button-primary {
  background: var(--gradient-button);
  box-shadow: var(--shadow-small);
}

.cosmic-button-primary:hover:not(:disabled) {
  background: var(--gradient-button-hover);
  box-shadow: var(--shadow-glow-primary);
  transform: translateY(-2px);
}

.cosmic-button-secondary {
  background: transparent;
  border: var(--border-thin);
}

.cosmic-button-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border: var(--border-highlight);
  transform: translateY(-2px);
}

.cosmic-button-danger {
  background-color: var(--color-error);
}

.cosmic-button-danger:hover:not(:disabled) {
  background-color: #dc2626;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-success {
  background-color: var(--color-success);
  color: #000000;
}

.cosmic-button-success:hover:not(:disabled) {
  background-color: #00cc76;
  box-shadow: 0 0 8px rgba(0, 255, 149, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-warning {
  background-color: var(--color-warning);
  color: #000000;
}

.cosmic-button-warning:hover:not(:disabled) {
  background-color: #d97706;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-info {
  background-color: var(--color-info);
}

.cosmic-button-info:hover:not(:disabled) {
  background-color: #3a5cef;
  box-shadow: 0 0 8px rgba(74, 108, 255, 0.5);
  transform: translateY(-2px);
}

/* States */
.cosmic-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cosmic-button-loading {
  cursor: wait;
}

/* Icon-only button */
.cosmic-button-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: var(--radius-circle);
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
  margin-right: var(--space-xs);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Active state */
.cosmic-button:active:not(:disabled) {
  transform: translateY(1px);
  opacity: 0.9;
}

/* Ripple effect on click */
.cosmic-button::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 0.6s linear;
  opacity: 1;
}

@keyframes ripple {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style> 