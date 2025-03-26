<template>
  <div class="wallet-header cosmic-panel">
    <div class="wallet-title">
      <h1 class="cosmic-title">{{ $t('wallet.title') }}</h1>
      <div class="wallet-subtitle">{{ $t('wallet.subtitle') }}</div>
    </div>

    <div class="wallet-ids">
      <div class="id-container">
        <div class="id-label">
          <span>{{ principalMode ? $t('wallet.principalId') : $t('wallet.accountId') }}</span>
          <button 
            class="mode-toggle cosmic-button-minimal" 
            @click="$emit('update:modelValue', !principalMode)"
            :title="principalMode ? $t('wallet.showAccountId') : $t('wallet.showPrincipalId')"
          >
            <i class="fas fa-exchange-alt"></i>
          </button>
        </div>
        <div class="id-value">
          <div class="id-text truncate">{{ displayId }}</div>
          <button class="copy-button" @click="copyId">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  principalId: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
});

// For v-model support
const emit = defineEmits(['update:modelValue', 'copy']);

// Computed property for displaying the selected ID
const displayId = computed(() => {
  return props.modelValue ? props.principalId : props.accountId;
});

// Shorthand for principalMode
const principalMode = computed(() => props.modelValue);

// Method to copy ID to clipboard
function copyId() {
  try {
    const idType = principalMode.value ? 'principal' : 'account';
    const idToCopy = principalMode.value ? props.principalId : props.accountId;
    
    navigator.clipboard.writeText(idToCopy).then(() => {
      emit('copy', { success: true, type: idType });
    }).catch(error => {
      emit('copy', { success: false, type: idType, error: error.message });
    });
  } catch (error) {
    emit('copy', { success: false, type: 'unknown', error: error.message });
  }
}
</script>

<style scoped>
.wallet-header {
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  position: relative;
  overflow: hidden;
}

.wallet-header::before {
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

.wallet-header:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.wallet-title {
  margin-bottom: 8px;
}

.wallet-title h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
  letter-spacing: -0.5px;
  position: relative;
}

.wallet-title h1::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--cosmic-blue), transparent);
  border-radius: 3px;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.wallet-subtitle {
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  margin-top: 14px;
}

.wallet-ids {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.id-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.id-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  font-weight: 500;
}

.id-value {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.15);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all var(--cosmic-transition-medium);
}

.id-value:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), var(--cosmic-glow-blue-sm);
}

.id-text {
  flex: 1;
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--cosmic-text-primary);
  text-shadow: 0 0 2px rgba(15, 185, 253, 0.2);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-toggle, .copy-button {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-sm);
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  padding: 6px 10px;
  transition: all var(--cosmic-transition-fast);
}

.mode-toggle:hover, .copy-button:hover {
  color: var(--cosmic-blue);
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-1px);
}

.copy-button:active, .mode-toggle:active {
  transform: translateY(1px);
  box-shadow: none;
}

@media (max-width: 768px) {
  .wallet-header {
    padding: 20px;
  }
  
  .wallet-title h1 {
    font-size: 1.5rem;
  }
  
  .wallet-subtitle {
    font-size: 0.9rem;
    margin-top: 10px;
  }
}
</style> 