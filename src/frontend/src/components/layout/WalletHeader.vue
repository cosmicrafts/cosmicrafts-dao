<template>
  <div class="wallet-header cosmic-panel">
    <div class="wallet-title">
      <h1>{{ $t('wallet.title') }}</h1>
      <div class="wallet-subtitle">{{ $t('wallet.subtitle') }}</div>
    </div>

    <div class="wallet-ids">
      <div class="id-container">
        <div class="id-label">
          <span>{{ principalMode ? $t('wallet.principalId') : $t('wallet.accountId') }}</span>
          <button 
            class="mode-toggle" 
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
  border-radius: 12px;
  background: var(--color-bg-secondary, #16213e);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wallet-title {
  margin-bottom: 8px;
}

.wallet-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  margin: 0;
}

.wallet-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  margin-top: 4px;
}

.wallet-ids {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.id-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.id-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.id-value {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
}

.id-text {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--color-text-primary, #ffffff);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-toggle, .copy-button {
  background: none;
  border: none;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.mode-toggle:hover, .copy-button:hover {
  color: var(--color-text-primary, #ffffff);
}

@media (max-width: 768px) {
  .wallet-header {
    padding: 16px;
  }
  
  .wallet-title h1 {
    font-size: 1.25rem;
  }
}
</style> 