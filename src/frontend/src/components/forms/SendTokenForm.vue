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
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--cosmic-z-modal);
}

.send-token-form {
  width: 100%;
  max-width: 500px;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
  animation: cosmic-float 0.5s ease-out;
  overflow: hidden;
  position: relative;
}

.send-token-form::before {
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

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(15, 185, 253, 0.15);
  position: relative;
}

.form-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.3), 
    rgba(15, 185, 253, 0.1), 
    transparent);
}

.form-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--cosmic-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.close-button {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-secondary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.close-button:hover {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-1px);
}

.form-content {
  padding: 24px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--cosmic-text-primary);
}

.token-display {
  display: flex;
  align-items: center;
  padding: 14px;
  background: var(--cosmic-glass-bg-darker);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.token-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-sm);
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
  font-weight: 600;
  color: var(--cosmic-text-primary);
  font-size: 1rem;
}

.token-symbol {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.token-balance {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  text-align: right;
  font-weight: 500;
}

.recipient-input, .amount-input {
  display: flex;
  align-items: center;
  background: var(--cosmic-glass-bg-darker);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  overflow: hidden;
  transition: all var(--cosmic-transition-fast);
}

.recipient-input:focus-within, .amount-input:focus-within {
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
}

input, textarea {
  flex: 1;
  padding: 14px;
  background: transparent;
  border: none;
  color: var(--cosmic-text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
}

input::placeholder, textarea::placeholder {
  color: var(--cosmic-text-tertiary);
}

input.has-error, textarea.has-error {
  border-color: var(--cosmic-danger);
}

.error-message {
  color: var(--cosmic-danger);
  font-size: 0.85rem;
  margin-top: 6px;
}

.paste-button, .max-button {
  padding: 0 14px;
  height: 100%;
  background: rgba(15, 185, 253, 0.05);
  border: none;
  border-left: 1px solid rgba(15, 185, 253, 0.15);
  color: var(--cosmic-text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.paste-button:hover, .max-button:hover {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
}

textarea {
  width: 100%;
  resize: vertical;
  min-height: 80px;
  background: var(--cosmic-glass-bg-darker);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  transition: all var(--cosmic-transition-fast);
}

textarea:focus {
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.optional {
  font-weight: normal;
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
  margin-left: 5px;
}

.fee-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 14px;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.fee-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  font-weight: 500;
}

.fee-value {
  font-size: 0.95rem;
  color: var(--cosmic-text-primary);
  font-weight: 600;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-button {
  padding: 12px 20px;
  background: transparent;
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
}

.cancel-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-1px);
}

.send-button {
  padding: 12px 28px;
  background: var(--cosmic-gradient-blue-alpha);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: var(--cosmic-radius-md);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  box-shadow: var(--cosmic-shadow-sm);
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(15, 185, 253, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.send-button:hover:not(:disabled)::before {
  opacity: 1;
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button i {
  margin-right: 8px;
}

@keyframes cosmic-float {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .send-token-form {
    width: calc(100% - 32px);
    margin: 0 16px;
  }
  
  .form-header {
    padding: 16px 20px;
  }
  
  .form-header h3 {
    font-size: 1.25rem;
  }
  
  .form-content {
    padding: 20px;
  }
  
  .token-display, input, textarea, .fee-info {
    padding: 12px;
  }
  
  .buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .cancel-button, .send-button {
    width: 100%;
    padding: 14px;
  }
}
</style> 