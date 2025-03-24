<template>
  <div class="send-token-form-backdrop" @click="$emit('close')">
    <div class="send-token-form cosmic-panel" @click.stop>
      <div class="form-header">
        <h3>{{ $t('wallet.sendTokens') }}</h3>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="form-content">
        <div class="form-field">
          <label for="token">{{ $t('wallet.token') }}</label>
          <div class="token-display">
            <div class="token-icon">
              <img :src="tokenIcon" :alt="tokenSymbol" />
            </div>
            <div class="token-info">
              <div class="token-name">{{ tokenName }}</div>
              <div class="token-symbol">{{ tokenSymbol }}</div>
            </div>
            <div class="token-balance">
              {{ $t('wallet.balance') }}: {{ formatBalance(tokenBalance) }}
            </div>
          </div>
        </div>
        
        <div class="form-field">
          <label for="recipient">{{ $t('wallet.recipient') }}</label>
          <div class="recipient-input">
            <input 
              type="text" 
              id="recipient" 
              v-model="recipient" 
              :placeholder="$t('wallet.enterRecipient')"
              :class="{ 'has-error': errors.recipient }"
            />
            <button class="paste-button" @click="pasteFromClipboard">
              <i class="fas fa-paste"></i>
            </button>
          </div>
          <div v-if="errors.recipient" class="error-message">{{ errors.recipient }}</div>
        </div>
        
        <div class="form-field">
          <label for="amount">{{ $t('wallet.amount') }}</label>
          <div class="amount-input">
            <input 
              type="text" 
              id="amount" 
              v-model="amount" 
              :placeholder="$t('wallet.enterAmount')"
              :class="{ 'has-error': errors.amount }"
            />
            <button class="max-button" @click="setMaxAmount">
              {{ $t('wallet.max') }}
            </button>
          </div>
          <div v-if="errors.amount" class="error-message">{{ errors.amount }}</div>
        </div>
        
        <div class="form-field">
          <label for="memo">{{ $t('wallet.memo') }} <span class="optional">{{ $t('wallet.optional') }}</span></label>
          <textarea 
            id="memo" 
            v-model="memo" 
            :placeholder="$t('wallet.enterMemo')"
            rows="2"
          ></textarea>
        </div>
        
        <div class="fee-info">
          <div class="fee-label">{{ $t('wallet.transactionFee') }}</div>
          <div class="fee-value">{{ formatBalance(transactionFee) }} {{ tokenSymbol }}</div>
        </div>
        
        <div class="buttons">
          <button class="cancel-button" @click="$emit('close')">
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="send-button" 
            @click="sendTokens"
            :disabled="isSending || hasErrors"
          >
            <i v-if="isSending" class="fas fa-spinner fa-spin"></i>
            {{ isSending ? $t('wallet.sending') : $t('wallet.send') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTokenStore } from '@/stores/token';

const props = defineProps({
  tokenSymbol: {
    type: String,
    required: true
  },
  principalId: {
    type: String,
    required: true
  },
  tokenBalance: {
    type: [Number, BigInt],
    required: true
  }
});

const emit = defineEmits(['close', 'transfer-complete']);

// Component state
const tokenStore = useTokenStore();
const recipient = ref('');
const amount = ref('');
const memo = ref('');
const isSending = ref(false);
const errors = ref({ recipient: '', amount: '' });
const tokenMetadata = ref(null);
const transactionFee = ref(BigInt(10000)); // Default fee

// Computed properties
const tokenName = computed(() => tokenMetadata.value?.name || props.tokenSymbol);
const tokenIcon = computed(() => tokenMetadata.value?.icon || `/assets/icons/tokens/${props.tokenSymbol.toLowerCase()}.png`);

const hasErrors = computed(() => {
  return !!errors.value.recipient || !!errors.value.amount || !recipient.value || !amount.value;
});

// Load token metadata
onMounted(async () => {
  try {
    tokenMetadata.value = await tokenStore.getTokenMetadata(props.tokenSymbol);
    
    // Get transaction fee
    if (tokenMetadata.value?.fee) {
      transactionFee.value = BigInt(tokenMetadata.value.fee);
    }
  } catch (error) {
    console.error('Error loading token metadata:', error);
  }
});

// Format balance with appropriate decimal places
function formatBalance(balance) {
  if (typeof balance === 'bigint') {
    return (Number(balance) / 1e8).toFixed(4);
  }
  return Number(balance).toFixed(4);
}

// Set maximum amount (balance minus fee)
function setMaxAmount() {
  try {
    const maxAmountBigInt = props.tokenBalance > transactionFee.value ? 
      props.tokenBalance - transactionFee.value : 
      BigInt(0);
    
    amount.value = (Number(maxAmountBigInt) / 1e8).toString();
    validateAmount();
  } catch (error) {
    console.error('Error setting max amount:', error);
  }
}

// Paste recipient from clipboard
async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    recipient.value = text;
    validateRecipient();
  } catch (error) {
    console.error('Error pasting from clipboard:', error);
  }
}

// Validate recipient
function validateRecipient() {
  if (!recipient.value) {
    errors.value.recipient = 'Recipient is required';
    return false;
  }
  
  const recipientValue = recipient.value.trim();
  
  // Simple validation - would need more robust validation in production
  if (recipientValue.length < 5) {
    errors.value.recipient = 'Invalid recipient address';
    return false;
  }
  
  errors.value.recipient = '';
  return true;
}

// Validate amount
function validateAmount() {
  if (!amount.value) {
    errors.value.amount = 'Amount is required';
    return false;
  }
  
  const amountNumber = parseFloat(amount.value);
  
  if (isNaN(amountNumber) || amountNumber <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
    return false;
  }
  
  // Convert to token units (e.g., E8s for ICP)
  const amountInTokenUnits = BigInt(Math.floor(amountNumber * 1e8));
  const totalRequired = amountInTokenUnits + transactionFee.value;
  
  if (totalRequired > props.tokenBalance) {
    errors.value.amount = 'Insufficient balance (including fee)';
    return false;
  }
  
  errors.value.amount = '';
  return true;
}

// Send tokens
async function sendTokens() {
  // Validate inputs
  const isRecipientValid = validateRecipient();
  const isAmountValid = validateAmount();
  
  if (!isRecipientValid || !isAmountValid) {
    return;
  }
  
  try {
    isSending.value = true;
    
    // Convert amount to token units (e.g., E8s for ICP)
    const amountNumber = parseFloat(amount.value);
    const amountInTokenUnits = BigInt(Math.floor(amountNumber * 1e8));
    
    // Call transfer method from token store
    const result = await tokenStore.transfer({
      token: props.tokenSymbol,
      to: recipient.value.trim(),
      amount: amountInTokenUnits,
      memo: memo.value.trim() || undefined
    });
    
    // Handle success
    if (result.success) {
      emit('transfer-complete', {
        success: true,
        amount: amount.value,
        symbol: props.tokenSymbol,
        recipient: recipient.value
      });
    } else {
      // Handle error
      emit('transfer-complete', {
        success: false,
        error: result.error || 'Unknown error occurred'
      });
    }
  } catch (error) {
    console.error('Error sending tokens:', error);
    emit('transfer-complete', {
      success: false,
      error: error.message || 'Unknown error occurred'
    });
  } finally {
    isSending.value = false;
  }
}
</script>

<style scoped>
.send-token-form-backdrop {
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

.send-token-form {
  width: 90%;
  max-width: 500px;
  background: var(--color-bg-secondary, #16213e);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-border-highlight, rgba(255, 255, 255, 0.2));
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  background: rgba(0, 0, 0, 0.2);
}

.form-header h3 {
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

.form-content {
  padding: 20px;
}

.form-field {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--color-text-primary, #ffffff);
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--color-accent, #4169e1);
}

input.has-error, textarea.has-error {
  border-color: var(--color-error, #ef4444);
}

.error-message {
  color: var(--color-error, #ef4444);
  font-size: 0.8rem;
  margin-top: 4px;
}

.token-display {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
}

.token-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.token-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.token-info {
  flex: 1;
}

.token-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.token-symbol {
  font-size: 0.8rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.token-balance {
  font-size: 0.8rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.recipient-input, .amount-input {
  display: flex;
  align-items: center;
}

.paste-button, .max-button {
  background: var(--color-accent, #4169e1);
  color: white;
  border: none;
  padding: 0 12px;
  height: 38px;
  border-radius: 0 6px 6px 0;
  margin-left: -1px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.paste-button:hover, .max-button:hover {
  background-color: var(--color-accent-hover, #5a7ae2);
}

.recipient-input input, .amount-input input {
  border-radius: 6px 0 0 6px;
}

.optional {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, rgba(255, 255, 255, 0.5));
  font-style: italic;
}

.fee-info {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  margin-bottom: 20px;
}

.fee-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.fee-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button, .send-button {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.send-button {
  background: var(--color-accent, #4169e1);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button:hover {
  background: var(--color-bg-hover, rgba(255, 255, 255, 0.1));
}

.send-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover, #5a7ae2);
}

.send-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .buttons {
    flex-direction: column;
  }
  
  .cancel-button, .send-button {
    width: 100%;
  }
}
</style> 