<template>
  <div class="receive-container cosmic-panel">
    <div class="form-header">
      <h3>Receive Funds</h3>
      <button class="icon-button" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="receive-content">
      <div class="qr-section">
        <div class="qr-code-container">
          <QRCodeVue3
            :value="currentAddress"
            :size="200"
            level="H"
            class="qr-code"
          />
        </div>
      </div>
      
      <div class="address-section">
        <div class="input-group">
          <label>Your {{ isPrincipal ? 'Principal' : 'Account' }} ID:</label>
          <div class="address-display">
            <span>{{ currentAddress }}</span>
            <button class="icon-button" @click="copyAddress">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        <button class="cosmic-button cosmic-button-primary toggle-address-button" @click="toggleAddressType">
          Show {{ isPrincipal ? 'Account' : 'Principal' }} ID
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import QRCodeVue3 from 'qrcode-vue3';

export default {
  name: 'ReceiveTokenInfo',
  components: {
    QRCodeVue3
  },
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
  emits: ['update:modelValue', 'copy', 'close'],
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
.receive-container {
  padding: 16px;
  background: var(--cosmic-panel-bg, rgba(20, 20, 30, 0.5));
  border-radius: var(--radius-medium, 8px);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
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

.receive-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.qr-section {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  padding: 16px;
  background: white;
  border-radius: var(--radius-medium, 8px);
}

.qr-code-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.qr-code {
  width: 100%;
  height: 100%;
}

.address-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #a0a0a0);
}

.address-display {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: var(--radius-medium, 8px);
  font-family: monospace;
  font-size: 0.9rem;
  word-break: break-all;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-address-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-medium, 8px);
  background: linear-gradient(to bottom, 
    var(--color-primary, #0FB9FD), 
    var(--color-primary-dark, #0A8BBD));
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-address-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .qr-section {
    width: 150px;
    height: 150px;
  }
}
</style> 