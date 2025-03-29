<template>
  <div class="placeholder-component">
    <div class="placeholder-icon">
      <i class="fas fa-puzzle-piece"></i>
    </div>
    <h3 class="placeholder-title">{{ title }}</h3>
    <p class="placeholder-message">{{ message }}</p>
    <div class="placeholder-actions" v-if="showActions">
      <button class="cosmic-button cosmic-button-primary action-button" @click="$emit('action')">
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Component Coming Soon'
  },
  message: {
    type: String,
    default: 'This feature is currently under development and will be available soon.'
  },
  showActions: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: 'Go Back'
  }
});

defineEmits(['action']);
</script>

<style scoped>
.placeholder-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  min-height: 300px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-md);
}

.placeholder-icon {
  font-size: 3rem;
  color: rgba(15, 185, 253, 0.3);
  margin-bottom: 1.5rem;
}

.placeholder-title {
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
  margin: 0 0 1rem 0;
}

.placeholder-message {
  color: var(--cosmic-text-secondary);
  margin: 0 0 2rem 0;
  max-width: 500px;
}

.placeholder-actions {
  display: flex;
  justify-content: center;
}

.action-button {
  min-width: 150px;
}
</style> 