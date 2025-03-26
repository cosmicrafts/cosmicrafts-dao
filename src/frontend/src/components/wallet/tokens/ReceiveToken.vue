<template>
  <div class="receive-token-container">
    <div class="receive-header">
      <h3>Receive {{ token.symbol }}</h3>
      <p class="receive-subtitle">Share your address to receive {{ token.symbol }}</p>
    </div>
    
    <div class="address-container">
      <div class="address-type-selector">
        <button 
          class="address-type-button"
          :class="{ 'active': !showAccountId }"
          @click="showAccountId = false"
        >
          Principal ID
        </button>
        <button 
          class="address-type-button"
          :class="{ 'active': showAccountId }"
          @click="showAccountId = true"
        >
          Account ID
        </button>
      </div>
      
      <div class="address-display">
        <div class="address-value">{{ displayAddress }}</div>
        <button class="copy-button" @click="copyAddress">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      
      <div class="qr-container">
        <div v-if="loading" class="qr-loading">
          <div class="qr-skeleton"></div>
          <span>Generating QR code...</span>
        </div>
        <div v-else class="qr-code" ref="qrCode"></div>
      </div>
      
      <div class="network-notice">
        <i class="fas fa-info-circle"></i>
        <span>Only send {{ token.symbol }} on {{ network.name }} to this address</span>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="button-secondary" @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import QRCode from 'qrcode';

export default {
  name: 'ReceiveToken',
  props: {
    token: {
      type: Object,
      required: true,
      default: () => ({
        symbol: 'ICP',
        name: 'Internet Computer',
        standard: 'ICRC-1'
      })
    },
    network: {
      type: Object,
      default: () => ({
        id: 'icp',
        name: 'Internet Computer'
      })
    }
  },
  emits: ['close', 'copy'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const loading = ref(true);
    const showAccountId = ref(false);
    const qrCode = ref(null);
    
    // Get principal and account ID
    const principalId = ref('');
    const accountId = ref('');
    
    // Get user information from auth store
    onMounted(async () => {
      try {
        const identity = authStore.getIdentity();
        if (identity) {
          principalId.value = identity.getPrincipal().toString();
          
          // For ICP, we need to get the account ID
          if (props.token.standard === 'icp' || props.token.symbol === 'ICP') {
            try {
              // Use the tokenService to get account ID
              accountId.value = authStore.getPrincipalAccountId(principalId.value);
            } catch (err) {
              console.error('Error getting account ID:', err);
              accountId.value = 'Error getting account ID';
            }
          } else {
            // For ICRC-1 tokens, we use principal ID
            accountId.value = principalId.value;
          }
          
          // Default display depends on token type
          if (props.token.standard === 'icp' || props.token.symbol === 'ICP') {
            showAccountId.value = true;
          } else {
            showAccountId.value = false;
          }
          
          // Generate QR code after a small delay
          setTimeout(() => {
            generateQRCode();
          }, 100);
        } else {
          principalId.value = 'Not authenticated';
          accountId.value = 'Not authenticated';
        }
      } catch (err) {
        console.error('Error in ReceiveToken:', err);
        principalId.value = 'Error getting ID';
        accountId.value = 'Error getting ID';
      }
    });
    
    // Display address based on selection
    const displayAddress = computed(() => {
      return showAccountId.value ? accountId.value : principalId.value;
    });
    
    // Generate QR code
    const generateQRCode = async () => {
      loading.value = true;
      
      try {
        if (qrCode.value && displayAddress.value) {
          // Clear previous QR code
          qrCode.value.innerHTML = '';
          
          // Generate new QR code
          await QRCode.toCanvas(
            qrCode.value,
            displayAddress.value,
            {
              width: 200,
              margin: 1,
              color: {
                dark: '#000',
                light: '#fff'
              }
            }
          );
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // Watch for address type changes to regenerate QR code
    watch(displayAddress, () => {
      generateQRCode();
    });
    
    // Copy address to clipboard
    const copyAddress = async () => {
      try {
        await navigator.clipboard.writeText(displayAddress.value);
        emit('copy', {
          success: true,
          type: showAccountId.value ? 'account' : 'principal',
          value: displayAddress.value
        });
      } catch (err) {
        console.error('Failed to copy address:', err);
        emit('copy', {
          success: false,
          type: showAccountId.value ? 'account' : 'principal',
          error: err.message
        });
      }
    };
    
    return {
      loading,
      principalId,
      accountId,
      showAccountId,
      displayAddress,
      qrCode,
      copyAddress
    };
  }
};
</script>

<style scoped>
.receive-token-container {
  padding: 1.5rem;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  border-radius: var(--cosmic-radius-lg, 12px);
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.receive-header {
  text-align: center;
  margin-bottom: 1rem;
}

.receive-header h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-primary, #ffffff);
}

.receive-subtitle {
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
}

.address-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.address-type-selector {
  display: flex;
  background: rgba(15, 185, 253, 0.1);
  padding: 0.25rem;
  border-radius: var(--cosmic-radius-md, 8px);
  width: 100%;
  max-width: 320px;
}

.address-type-button {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  border-radius: var(--cosmic-radius-sm, 6px);
  border: none;
  background: transparent;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-type-button.active {
  background: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-text-primary, #ffffff);
}

.address-display {
  width: 100%;
  max-width: 400px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md, 8px);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.address-value {
  flex: 1;
  word-break: break-all;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary, #ffffff);
}

.copy-button {
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

.copy-button:hover {
  background: rgba(15, 185, 253, 0.2);
  transform: translateY(-2px);
}

.qr-container {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: var(--cosmic-radius-md, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
}

.qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.qr-skeleton {
  width: 180px;
  height: 180px;
  background: linear-gradient(90deg, 
    rgba(0, 0, 0, 0.05) 0%, 
    rgba(0, 0, 0, 0.1) 50%, 
    rgba(0, 0, 0, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--cosmic-radius-sm, 6px);
}

.network-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-warning, #FF9900);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
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

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style> 