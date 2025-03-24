<template>
  <div class="add-token-backdrop" @click="$emit('close')">
    <div class="add-token-modal cosmic-panel" @click.stop>
      <div class="modal-header">
        <h3>{{ $t('wallet.addToken') }}</h3>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-content">
        <div class="token-input-section">
          <div class="input-group">
            <label for="token-id">{{ $t('wallet.tokenId') }}</label>
            <input 
              id="token-id" 
              type="text" 
              v-model="tokenId"
              :placeholder="$t('wallet.enterTokenId')"
              @input="resetError"
            />
            <div class="input-hint">{{ $t('wallet.tokenIdHint') }}</div>
          </div>
          
          <div class="input-group">
            <label for="token-standard">{{ $t('wallet.tokenStandard') }}</label>
            <select id="token-standard" v-model="tokenStandard" @change="resetError">
              <option value="ICRC-1">ICRC-1</option>
              <option value="EXT">DIP20 (EXT)</option>
              <option value="DIP20">DIP20</option>
            </select>
          </div>
          
          <div class="additional-fields" v-if="showAdvanced">
            <div class="input-group">
              <label for="token-name">{{ $t('wallet.tokenName') }}</label>
              <input 
                id="token-name" 
                type="text" 
                v-model="tokenName"
                :placeholder="$t('wallet.optional')"
              />
            </div>
            
            <div class="input-group">
              <label for="token-symbol">{{ $t('wallet.tokenSymbol') }}</label>
              <input 
                id="token-symbol" 
                type="text" 
                v-model="tokenSymbol"
                :placeholder="$t('wallet.optional')"
              />
            </div>
            
            <div class="input-group">
              <label for="token-decimals">{{ $t('wallet.tokenDecimals') }}</label>
              <input 
                id="token-decimals" 
                type="number" 
                v-model="tokenDecimals"
                :placeholder="$t('wallet.optional')"
                min="0"
                max="18"
              />
            </div>
          </div>
          
          <button class="toggle-advanced" @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? $t('wallet.hideAdvanced') : $t('wallet.showAdvanced') }}
          </button>
          
          <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>
        </div>
        
        <div class="button-section">
          <button class="cancel-button" @click="$emit('close')">
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="add-button" 
            :disabled="!tokenId || isLoading"
            @click="addToken"
          >
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            <span v-else>{{ $t('wallet.addToken') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props
const props = defineProps({
  principalId: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['close', 'add-token']);

// State
const tokenId = ref('');
const tokenStandard = ref('ICRC-1');
const tokenName = ref('');
const tokenSymbol = ref('');
const tokenDecimals = ref('');
const error = ref('');
const isLoading = ref(false);
const showAdvanced = ref(false);

// Methods
function resetError() {
  error.value = '';
}

async function addToken() {
  if (!tokenId.value) {
    error.value = 'Token ID is required';
    return;
  }
  
  isLoading.value = true;
  error.value = '';
  
  try {
    // Create token data object
    const tokenData = {
      canisterId: tokenId.value,
      standard: tokenStandard.value,
      name: tokenName.value || null,
      symbol: tokenSymbol.value || null,
      decimals: tokenDecimals.value ? parseInt(tokenDecimals.value) : null,
      principalId: props.principalId
    };
    
    // Emit token data to parent
    emit('add-token', tokenData);
    
    // Reset form
    tokenId.value = '';
    tokenName.value = '';
    tokenSymbol.value = '';
    tokenDecimals.value = '';
    
  } catch (err) {
    error.value = err.message || 'Failed to add token';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.add-token-backdrop {
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

.add-token-modal {
  width: 90%;
  max-width: 480px;
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

.token-input-section {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  margin-bottom: 8px;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--color-text-primary, #ffffff);
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: var(--color-accent, #4169e1);
}

.input-hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  margin-top: 4px;
}

.toggle-advanced {
  background: none;
  border: none;
  color: var(--color-accent, #4169e1);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 0;
  text-align: left;
  margin-bottom: 16px;
}

.toggle-advanced:hover {
  text-decoration: underline;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 16px;
}

.button-section {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-button,
.add-button {
  padding: 10px 20px;
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

.cancel-button:hover {
  background: var(--color-bg-hover, rgba(255, 255, 255, 0.1));
  color: var(--color-text-primary, #ffffff);
}

.add-button {
  background: var(--color-accent, #4169e1);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.add-button:hover:not(:disabled) {
  background-color: var(--color-accent-hover, #5a7ae2);
}

.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.additional-fields {
  border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  margin-top: 16px;
  padding-top: 16px;
}

@media (max-width: 480px) {
  .add-token-modal {
    height: 90vh;
    overflow-y: auto;
  }
  
  .button-section {
    flex-direction: column;
  }
  
  .cancel-button,
  .add-button {
    width: 100%;
  }
}
</style> 