<template>
  <button 
    :class="[
      'cosmic-button',
      variant ? `cosmic-button-${variant}` : '',
      size ? `cosmic-button-${size}` : '',
      { 'button-ripple': hasRipple }
    ]"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span class="button-text"><slot /></span>
    <span v-if="hasGlow" class="button-glow"></span>
    <span v-if="hasParticles" class="button-particles"></span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: '',
    validator: (value) => ['primary', 'secondary', 'outline-primary', 'outline-secondary', 'minimal', 'danger', 'success', 'warning', ''].includes(value)
  },
  size: {
    type: String,
    default: '',
    validator: (value) => ['sm', 'lg', ''].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hasGlow: {
    type: Boolean,
    default: true
  },
  hasParticles: {
    type: Boolean,
    default: true
  },
  hasRipple: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
/* All styling is handled by the cosmic-theme.css */
</style> 