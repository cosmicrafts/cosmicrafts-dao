<template>
  <div class="token-actions">
    <button 
      class="action-button" 
      @click.stop="$emit('send')"
      v-tooltip="'Send'"
    >
      <i class="fas fa-arrow-up"></i>
    </button>
    
    <button 
      class="action-button" 
      @click.stop="$emit('receive')"
      v-tooltip="'Receive'"
    >
      <i class="fas fa-arrow-down"></i>
    </button>
    
    <button 
      class="action-button" 
      @click.stop="$emit('swap')"
      v-tooltip="'Swap'"
    >
      <i class="fas fa-exchange-alt"></i>
    </button>
    
    <button 
      v-if="showBuy"
      class="action-button" 
      @click.stop="$emit('buy')"
      v-tooltip="'Buy'"
    >
      <i class="fas fa-shopping-cart"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'TokenItemActions',
  props: {
    showBuy: {
      type: Boolean,
      default: false
    }
  },
  emits: ['send', 'receive', 'swap', 'buy']
};
</script>

<style scoped>
.token-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

:deep(.token-item:hover) .token-actions {
  opacity: 1;
}

.action-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue, #0FB9FD);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-2px);
}
</style> 