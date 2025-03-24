<template>
  <div class="add-token-container cosmic-panel">
    <div class="form-header">
      <h3>Add ICRC-1 Token</h3>
      <button class="icon-button" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="add-token-form">
      <div class="input-group">
        <label for="tokenCanisterId">Token Canister ID:</label>
        <input 
          type="text" 
          id="tokenCanisterId" 
          v-model="canisterId" 
          placeholder="Enter token canister ID"
          class="cosmic-input"
        />
      </div>
      <button 
        class="cosmic-button cosmic-button-primary add-button" 
        @click="addToken" 
        :disabled="loading || !isValidCanisterId"
      >
        {{ loading ? 'Adding...' : 'Add Token' }}
      </button>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { Principal } from '@dfinity/principal';
import { tokenService } from '../services/TokenService.js';

export default {
  name: 'AddTokenForm',
  emits: ['close', 'token-added'],
  setup(props, { emit }) {
    const canisterId = ref('');
    const loading = ref(false);
    const error = ref('');
    
    // Validate canister ID input
    const isValidCanisterId = computed(() => {
      if (!canisterId.value) return false;
      
      try {
        Principal.fromText(canisterId.value.trim());
        return true;
      } catch (e) {
        return false;
      }
    });
    
    // Add a new token
    async function addToken() {
      if (!isValidCanisterId.value) {
        error.value = 'Invalid canister ID format';
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        const newToken = await tokenService.addToken(canisterId.value.trim());
        
        emit('token-added', {
          success: true,
          symbol: newToken.symbol
        });
      } catch (err) {
        console.error('Error adding token:', err);
        error.value = err.message || 'Failed to add token';
        
        emit('token-added', {
          success: false,
          error: error.value
        });
      } finally {
        loading.value = false;
      }
    }
    
    return {
      canisterId,
      loading,
      error,
      isValidCanisterId,
      addToken
    };
  }
}
</script>

<style scoped>
.add-token-container {
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

.add-token-form {
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

.add-button {
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

.add-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.add-button:disabled {
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