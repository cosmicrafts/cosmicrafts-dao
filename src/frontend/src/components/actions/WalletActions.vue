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
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--cosmic-shadow-sm);
  transition: all var(--cosmic-transition-medium);
  position: relative;
  overflow: hidden;
}

.wallet-actions:hover {
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.wallet-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--cosmic-gradient-panel);
  opacity: 0.4;
  z-index: -1;
}

.wallet-actions-header {
  margin-bottom: 20px;
}

.wallet-actions-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}

.wallet-actions-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--cosmic-blue), transparent);
  border-radius: 3px;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
  gap: 20px;
}

.action-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  border-radius: var(--cosmic-radius-md);
  background: var(--cosmic-glass-bg-darker);
  border: 1px solid rgba(15, 185, 253, 0.15);
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  color: var(--cosmic-text-primary);
  transform-style: preserve-3d;
  transform: translateZ(0);
  box-shadow: var(--cosmic-shadow-sm);
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, rgba(15, 185, 253, 0.025) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-5px) translateZ(5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
}

.action-button:hover:not(:disabled)::before {
  opacity: 1;
}

.action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-icon {
  font-size: 28px;
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 6px rgba(15, 185, 253, 0.4));
  transition: all var(--cosmic-transition-medium);
  position: relative;
  z-index: 2;
}

.action-button:hover:not(:disabled) .action-icon {
  transform: scale(1.15);
  filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.6));
}

.action-text {
  font-size: 0.95rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
  transition: all var(--cosmic-transition-medium);
}

.action-button:hover:not(:disabled) .action-text {
  color: var(--cosmic-blue-light);
}

.coming-soon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: linear-gradient(135deg, var(--cosmic-orange) 0%, var(--cosmic-orange-light) 100%);
  color: #fff;
  font-size: 0.65rem;
  padding: 3px 6px;
  border-radius: var(--cosmic-radius-sm);
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-orange-sm);
  z-index: 3;
}

@media (max-width: 768px) {
  .wallet-actions {
    padding: 20px;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .action-button {
    padding: 16px;
    gap: 10px;
  }
  
  .action-icon {
    font-size: 24px;
  }
  
  .action-text {
    font-size: 0.9rem;
  }
}
</style> 