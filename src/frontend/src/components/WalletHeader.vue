<template>
  <div class="wallet-header cosmic-panel">
    <div class="account-info">
      <div class="address-label">
        <span>{{ isPrincipal ? 'Principal ID' : 'Account ID' }}</span>
        <button class="address-toggle" @click="toggleAddressType">
          <span>Show {{ isPrincipal ? 'Account ID' : 'Principal ID' }}</span>
        </button>
      </div>
      <div class="address-value">
        <span v-if="currentAddress">{{ currentAddress }}</span>
        <span v-else class="skeleton-text">••••••••••••••••••••••••••••••••</span>
        <button class="icon-button" @click="copyAddress">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'WalletHeader',
  props: {
    principalId: {
      type: String,
      default: ''
    },
    accountId: {
      type: String,
      default: ''
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'copy'],
  setup(props, { emit }) {
    // Use v-model for isPrincipal state
    const isPrincipal = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });
    
    // Determine which address to display
    const currentAddress = computed(() => {
      return isPrincipal.value ? props.principalId : props.accountId;
    });
    
    // Toggle between principal and account ID
    function toggleAddressType() {
      isPrincipal.value = !isPrincipal.value;
    }
    
    // Copy address to clipboard
    function copyAddress() {
      if (currentAddress.value) {
        navigator.clipboard.writeText(currentAddress.value)
          .then(() => {
            emit('copy', {
              success: true,
              type: isPrincipal.value ? 'principal' : 'account'
            });
          })
          .catch((err) => {
            console.error('Failed to copy address:', err);
            emit('copy', {
              success: false,
              error: err.message
            });
          });
      }
    }
    
    return {
      isPrincipal,
      currentAddress,
      toggleAddressType,
      copyAddress
    };
  }
}
</script>

<style scoped>
.wallet-header {
  padding: 16px;
  background: var(--cosmic-panel-bg, rgba(20, 20, 30, 0.5));
  border-radius: var(--radius-medium, 8px);
}

.account-info {
  margin-bottom: 8px;
}

.address-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #a0a0a0);
}

.address-toggle {
  background: none;
  border: none;
  color: var(--color-primary, #0FB9FD);
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
}

.address-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: var(--radius-medium, 8px);
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-primary, #0FB9FD);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary-light, #3DC5FD);
}

.skeleton-text {
  display: inline-block;
  width: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  height: 1em;
  opacity: 0.5;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style> 