<template>
  <div class="wallet-actions cosmic-panel">
    <div class="wallet-actions-header">
      <h2>{{ $t('wallet.actions') }}</h2>
    </div>
    
    <div class="action-buttons">
      <button 
        class="action-button" 
        @click="$emit('action', 'send')"
        :title="$t('wallet.sendTooltip')"
      >
        <div class="action-icon">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div class="action-text">{{ $t('wallet.send') }}</div>
      </button>
      
      <button 
        class="action-button" 
        @click="$emit('action', 'receive')"
        :title="$t('wallet.receiveTooltip')"
      >
        <div class="action-icon">
          <i class="fas fa-qrcode"></i>
        </div>
        <div class="action-text">{{ $t('wallet.receive') }}</div>
      </button>
      
      <button 
        class="action-button" 
        @click="$emit('action', 'add-token')"
        :title="$t('wallet.addTokenTooltip')"
      >
        <div class="action-icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="action-text">{{ $t('wallet.addToken') }}</div>
      </button>
      
      <button 
        class="action-button" 
        @click="$emit('action', 'swap')"
        :title="$t('wallet.swapTooltip')"
        :disabled="!swapEnabled"
      >
        <div class="action-icon">
          <i class="fas fa-exchange-alt"></i>
        </div>
        <div class="action-text">{{ $t('wallet.swap') }}</div>
        <div v-if="!swapEnabled" class="coming-soon">{{ $t('common.comingSoon') }}</div>
      </button>
      
      <button 
        class="action-button" 
        @click="$emit('action', 'stake')"
        :title="$t('wallet.stakeTooltip')"
        :disabled="!stakeEnabled"
      >
        <div class="action-icon">
          <i class="fas fa-lock"></i>
        </div>
        <div class="action-text">{{ $t('wallet.stake') }}</div>
        <div v-if="!stakeEnabled" class="coming-soon">{{ $t('common.comingSoon') }}</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Emit the action events
const emit = defineEmits(['action']);

// Define which actions are enabled
const swapEnabled = ref(false);
const stakeEnabled = ref(false);
</script>

<style scoped>
.wallet-actions {
  border-radius: 12px;
  background: var(--color-bg-secondary, #16213e);
  padding: 20px;
  margin-bottom: 16px;
}

.wallet-actions-header {
  margin-bottom: 16px;
}

.wallet-actions-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  margin: 0;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.action-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-text-primary, #ffffff);
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--color-border-highlight, rgba(255, 255, 255, 0.2));
}

.action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-icon {
  font-size: 24px;
  color: var(--color-accent, #4169e1);
}

.action-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.coming-soon {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: var(--color-warning, #f59e0b);
  color: black;
  font-size: 0.6rem;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 