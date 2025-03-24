<template>
  <div :class="[
    'cosmic-card',
    variant ? `cosmic-panel-${variant}` : '',
    { clickable }
  ]" @click="clickable ? $emit('click', $event) : null">
    <div v-if="$slots.header" class="cosmic-card-header">
      <slot name="header"></slot>
    </div>
    <div class="cosmic-card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="cosmic-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: '',
    validator: (value) => ['primary', 'secondary', ''].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.cosmic-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.cosmic-card-body {
  flex: 1;
  padding: 1rem;
}

.cosmic-card-header {
  padding: 1rem 1rem 0.5rem;
}

.cosmic-card-footer {
  padding: 0.5rem 1rem 1rem;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(5, 163, 204, 0.4);
}
</style> 