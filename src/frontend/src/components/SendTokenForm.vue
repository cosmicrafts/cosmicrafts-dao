<template>
  <div class="send-form-container cosmic-panel">
    <div class="form-header">
      <h3>Send {{ tokenSymbol }}</h3>
      <button class="icon-button" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="send-form">
      <div class="input-group recipient-type">
        <label>Recipient Type:</label>
        <div class="radio-options">
          <label>
            <input 
              type="radio" 
              name="recipientType" 
              value="accountId" 
              v-model="recipientType"
              :disabled="tokenSymbol !== 'ICP'"
            />
            Account ID
          </label>
          <label>
            <input 
              type="radio" 
              name="recipientType" 
              value="principal" 
              v-model="recipientType"
            />
            Principal ID
          </label>
        </div>
      </div>
      
      <div class="input-group">
        <label for="recipient">{{ recipientType === 'accountId' ? 'Recipient account ID:' : 'Recipient principal ID:' }}</label>
        <input 
          type="text" 
          id="recipient" 
          v-model="recipient" 
          :placeholder="recipientType === 'accountId' ? 'Enter recipient account ID' : 'Enter recipient principal ID'"
          class="cosmic-input"
        />
      </div>
      
      <div class="form-group">
        <label for="amount">Amount</label>
        <input
          type="number"
          id="amount"
          v-model="amount"
          placeholder="Enter amount"
          class="cosmic-input"
          :disabled="loading"
          min="0"
          step="any"
        >
        <small class="info-text">{{ formattedTransactionFee }}</small>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button 
        class="cosmic-button cosmic-button-primary send-button" 
        @click="sendTokens" 
        :disabled="loading || !isValidTransfer"
      >
        {{ loading ? 'Sending...' : `Send ${tokenSymbol}` }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { Principal } from '@dfinity/principal';
import { tokenService } from '../services/TokenService.js';

export default {
  name: 'SendTokenForm',
  props: {
    tokenSymbol: {
      type: String,
      default: 'ICP'
    },
    principalId: {
      type: String,
      required: true
    },
    tokenBalance: {
      type: [BigInt, String],
      default: BigInt(0)
    }
  },
  emits: ['close', 'transfer-complete'],
  setup(props, { emit }) {
    const recipient = ref('');
    const amount = ref('');
    const loading = ref(false);
    const error = ref('');
    const recipientType = ref('principal'); // Default to principal ID
    
    // Get token metadata (fee and decimals)
    const tokenMetadata = ref({
      fee: BigInt(10000),
      decimals: 8,
      standard: 'icp'
    });
    
    // Load token metadata on mount and when token changes
    watch(() => props.tokenSymbol, async () => {
      try {
        // Default to ICP if service isn't ready
        if (props.tokenSymbol === 'ICP') {
          tokenMetadata.value = {
            fee: BigInt(10000),
            decimals: 8,
            standard: 'icp'
          };
        } 
        // Default to STDs if that's the token
        else if (props.tokenSymbol === 'STDs') {
          tokenMetadata.value = {
            fee: BigInt(10000),
            decimals: 8,
            standard: 'icrc1'
          };
        }
        
        // Try to get from token service
        if (tokenService && tokenService.tokenConfigs) {
          const config = tokenService.tokenConfigs.get(props.tokenSymbol);
          if (config) {
            tokenMetadata.value = {
              fee: config.fee || BigInt(10000),
              decimals: config.decimals || 8,
              standard: config.standard || 'icrc1'
            };
          }
        }
        
        // Set recipientType based on token standard
        if (tokenMetadata.value.standard === 'icp') {
          recipientType.value = 'accountId';
        } else {
          recipientType.value = 'principal';
        }
      } catch (e) {
        console.error('Error loading token metadata:', e);
      }
    }, { immediate: true });
    
    // Format transaction fee for display
    const formattedTransactionFee = computed(() => {
      try {
        const fee = tokenMetadata.value.fee;
        const decimals = tokenMetadata.value.decimals;
        
        if (fee && decimals) {
          const divisor = 10n ** BigInt(decimals);
          const formattedFee = Number(fee) / Number(divisor);
          return `Transfer fee: ${formattedFee.toFixed(decimals)} ${props.tokenSymbol}`;
        }
        return `Transfer fee: 0.0001 ${props.tokenSymbol}`;
      } catch (e) {
        return `Transfer fee: 0.0001 ${props.tokenSymbol}`;
      }
    });
    
    // Validate transfer inputs
    const isValidTransfer = computed(() => {
      if (!recipient.value || !amount.value || parseFloat(amount.value) <= 0) {
        return false;
      }
      
      // For ICP, allow both account ID and principal ID
      if (props.tokenSymbol === 'ICP') {
        if (recipientType.value === 'accountId') {
          return isValidAccountId(recipient.value);
        } else {
          return isValidPrincipal(recipient.value);
        }
      } 
      // For ICRC-1 tokens, only allow principal IDs
      else {
        return isValidPrincipal(recipient.value);
      }
    });
    
    // Check if a string is a valid account ID
    function isValidAccountId(address) {
      if (!address) return false;
      
      // Account IDs are 64-character hex strings
      return /^[0-9a-fA-F]{64}$/.test(address);
    }
    
    // Check if a string is a valid principal ID
    function isValidPrincipal(principal) {
      if (!principal) return false;
      
      try {
        // Try to parse it as a principal
        Principal.fromText(principal);
        return true;
      } catch (e) {
        return false;
      }
    }
    
    // Send tokens to another wallet
    async function sendTokens() {
      if (!isValidTransfer.value) {
        error.value = 'Invalid transfer details';
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        // Format amount to proper decimals based on token
        const amountToSend = parseFloat(amount.value);
        if (isNaN(amountToSend) || amountToSend <= 0) {
          error.value = 'Please enter a valid amount';
          loading.value = false;
          return;
        }
        
        // Convert from human-readable to token format with correct decimals
        const decimals = tokenMetadata.value.decimals;
        const rawAmount = BigInt(Math.floor(amountToSend * (10 ** decimals)));
        
        // Check if we have enough balance (including fee)
        const currentBalance = typeof props.tokenBalance === 'bigint' ? 
          props.tokenBalance : BigInt(props.tokenBalance);
        const fee = tokenMetadata.value.fee || BigInt(10000);
        
        if (currentBalance < (rawAmount + fee)) {
          const divisor = 10n ** BigInt(decimals);
          const neededAmount = Number(rawAmount + fee) / Number(divisor);
          
          error.value = `Not enough balance. Need ${neededAmount.toFixed(4)} ${props.tokenSymbol} (including fee)`;
          loading.value = false;
          return;
        }
        
        // Send tokens using TokenService
        const result = await tokenService.transfer(
          recipient.value.trim(), 
          rawAmount, 
          props.tokenSymbol
        );
        
        if (result && result.success) {
          emit('transfer-complete', {
            success: true,
            amount: amount.value,
            symbol: props.tokenSymbol,
            recipient: recipient.value.trim()
          });
          
          // Reset form
          amount.value = '';
          recipient.value = '';
        } else {
          error.value = result?.error || 'Transfer failed';
          
          emit('transfer-complete', {
            success: false,
            error: error.value
          });
        }
      } catch (err) {
        console.error('Error sending tokens:', err);
        error.value = err.message || 'Unknown error';
        
        emit('transfer-complete', {
          success: false,
          error: error.value
        });
      } finally {
        loading.value = false;
      }
    }
    
    return {
      recipient,
      amount,
      loading,
      error,
      recipientType,
      formattedTransactionFee,
      isValidTransfer,
      sendTokens
    };
  }
}
</script>

<style scoped>
.send-form-container {
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

.send-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group, .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label, .form-group label {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #a0a0a0);
}

.cosmic-input {
  padding: 12px;
  border-radius: var(--radius-medium, 8px);
  border: 1px solid rgba(15, 185, 253, 0.15);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-primary, #ffffff);
  font-family: inherit;
}

.cosmic-input:focus {
  outline: none;
  border-color: var(--color-primary, #0FB9FD);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.2);
}

.radio-options {
  display: flex;
  gap: 16px;
}

.radio-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-primary, #ffffff);
}

.radio-options input {
  margin: 0;
}

.info-text {
  color: var(--color-text-tertiary, #808080);
  font-size: 0.8rem;
}

.send-button {
  margin-top: 8px;
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

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: var(--color-error, #F44336);
  font-size: 0.9rem;
  padding: 8px;
  border-radius: var(--radius-small, 4px);
  background: rgba(244, 67, 54, 0.1);
}
</style> 