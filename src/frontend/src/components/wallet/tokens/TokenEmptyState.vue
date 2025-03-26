<template>
  <div class="token-empty-state">
    <div class="empty-icon">
      <i class="fas fa-coins"></i>
    </div>
    <p class="empty-message">{{ message }}</p>
    <button 
      class="button-secondary"
      @click="$emit('add-token')"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TokenEmptyState',
  props: {
    message: {
      type: String,
      default: 'No tokens found'
    },
    buttonText: {
      type: String,
      default: 'Add Token'
    }
  },
  emits: ['add-token']
};
</script>

<style scoped>
.token-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-message {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.button-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--cosmic-radius-md, 8px);
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9) 0%, rgba(77, 207, 255, 0.9) 50%, rgba(0, 157, 223, 0.9) 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.35);
}
</style> 