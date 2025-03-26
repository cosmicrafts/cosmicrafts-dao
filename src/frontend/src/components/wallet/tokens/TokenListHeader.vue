<template>
  <div class="token-list-header">
    <h3>{{ title }}</h3>
    <div class="token-list-actions">
      <button 
        class="icon-button"
        @click="$emit('toggle-zero-balances')"
        :class="{ 'active': showZeroBalances }"
      >
        <span class="icon">
          <i class="fas fa-eye"></i>
        </span>
        <span class="text">{{ showZeroBalances ? 'Hide Zero' : 'Show All' }}</span>
      </button>
      
      <button class="icon-button" @click="$emit('add-token')">
        <span class="icon">
          <i class="fas fa-plus"></i>
        </span>
        <span class="text">Add Token</span>
      </button>
      
      <button class="icon-button" @click="$emit('manage-tokens')">
        <span class="icon">
          <i class="fas fa-sliders-h"></i>
        </span>
        <span class="text">Manage</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenListHeader',
  props: {
    title: {
      type: String,
      default: 'Your Assets'
    },
    showZeroBalances: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle-zero-balances', 'add-token', 'manage-tokens']
};
</script>

<style scoped>
.token-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
}

.token-list-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--cosmic-text-primary, #ffffff);
  margin: 0;
}

.token-list-actions {
  display: flex;
  gap: 0.75rem;
}

.icon-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--cosmic-radius-sm, 6px);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-primary, #ffffff);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  transform: translateY(-1px);
}

.icon-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
}

.icon-button .icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 600px) {
  .token-list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .token-list-actions {
    width: 100%;
  }
  
  .icon-button {
    flex: 1;
    justify-content: center;
  }
  
  .icon-button .text {
    display: none;
  }
}
</style> 