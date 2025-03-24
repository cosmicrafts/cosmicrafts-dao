<template>
  <div class="receive-token-backdrop" @click="$emit('close')">
    <div class="receive-token-modal cosmic-panel" @click.stop>
      <div class="modal-header">
        <h3>{{ $t('wallet.receiveTokens') }}</h3>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-content">
        <div class="info-section">
          <p class="description">{{ $t('wallet.receiveDescription') }}</p>
          
          <div class="id-selector">
            <button 
              class="id-tab"
              :class="{ active: modelValue }"
              @click="$emit('update:modelValue', true)"
            >
              {{ $t('wallet.principalId') }}
            </button>
            <button 
              class="id-tab"
              :class="{ active: !modelValue }"
              @click="$emit('update:modelValue', false)"
            >
              {{ $t('wallet.accountId') }}
            </button>
          </div>
          
          <div class="id-display">
            <div class="id-value">{{ displayId }}</div>
            <button class="copy-button" @click="copyId">
              <i class="fas fa-copy"></i>
              <span>{{ $t('wallet.copy') }}</span>
            </button>
          </div>
          
          <div class="qr-code">
            <div class="qr-header">{{ $t('wallet.scanToSend') }}</div>
            <div class="qr-container">
              <img :src="qrCodeUrl" :alt="$t('wallet.yourAddress')" />
            </div>
            <div class="qr-caption">{{ principalMode ? $t('wallet.principalId') : $t('wallet.accountId') }}</div>
          </div>
        </div>
        
        <div class="notice-section">
          <div class="notice-icon">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="notice-text">
            {{ $t('wallet.receiveTokensNotice') }}
          </div>
        </div>
        
        <div class="buttons">
          <button class="close-modal-button" @click="$emit('close')">
            {{ $t('common.close') }}
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

const emit = defineEmits(['update:modelValue', 'close', 'copy']);

// Computed properties
const principalMode = computed(() => props.modelValue);
const displayId = computed(() => principalMode.value ? props.principalId : props.accountId);

// Generate QR code URL
const qrCodeUrl = computed(() => {
  const idToEncode = principalMode.value ? props.principalId : props.accountId;
  const encodedId = encodeURIComponent(idToEncode);
  
  // Use Google's Chart API to generate QR code
  // In production, this should be generated locally to prevent sending user IDs to third parties
  return `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodedId}&choe=UTF-8`;
});

// Copy ID to clipboard
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
.receive-token-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.receive-token-modal {
  width: 90%;
  max-width: 500px;
  background: var(--color-bg-secondary, #16213e);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-border-highlight, rgba(255, 255, 255, 0.2));
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  background: rgba(0, 0, 0, 0.2);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text-primary, #ffffff);
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: var(--color-text-primary, #ffffff);
}

.modal-content {
  padding: 20px;
}

.description {
  font-size: 0.9rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  margin-bottom: 20px;
  text-align: center;
}

.id-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.id-tab {
  padding: 8px 16px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.id-tab:first-child {
  border-radius: 6px 0 0 6px;
}

.id-tab:last-child {
  border-radius: 0 6px 6px 0;
}

.id-tab.active {
  background: var(--color-accent, #4169e1);
  color: white;
  border-color: var(--color-accent, #4169e1);
}

.id-display {
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 24px;
  position: relative;
}

.id-value {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--color-text-primary, #ffffff);
  word-break: break-all;
  margin-bottom: 12px;
}

.copy-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
  background: var(--color-accent, #4169e1);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background-color: var(--color-accent-hover, #5a7ae2);
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.qr-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  margin-bottom: 16px;
}

.qr-container {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.qr-container img {
  display: block;
  max-width: 100%;
  height: auto;
}

.qr-caption {
  font-size: 0.8rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.notice-section {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 6px;
  margin-bottom: 24px;
}

.notice-icon {
  color: var(--color-warning, #f59e0b);
  font-size: 1.2rem;
  flex-shrink: 0;
  padding-top: 3px;
}

.notice-text {
  font-size: 0.85rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.buttons {
  display: flex;
  justify-content: center;
}

.close-modal-button {
  padding: 10px 24px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal-button:hover {
  background: var(--color-bg-hover, rgba(255, 255, 255, 0.1));
  color: var(--color-text-primary, #ffffff);
}

@media (max-width: 480px) {
  .receive-token-modal {
    height: 90vh;
    overflow-y: auto;
  }
}
</style> 