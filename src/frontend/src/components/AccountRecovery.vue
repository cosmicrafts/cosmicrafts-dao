<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';
import * as bip39 from 'bip39';

const authStore = useAuthStore();
const modalStore = useModalStore();
const { t } = useI18n();

// State for the seed phrase input (12 words)
const seedWords = ref(Array(12).fill(''));
const loading = ref(false);
const errorMessage = ref('');

// Computed to determine if the seed phrase is valid
const isSeedPhraseValid = computed(() => {
  const seedPhrase = seedWords.value.join(' ').trim();
  return seedPhrase.split(/\s+/).length === 12 && bip39.validateMnemonic(seedPhrase);
});

// Handle paste event for the entire seed phrase
const handlePaste = (event) => {
  event.preventDefault();
  const pasteText = (event.clipboardData || window.clipboardData).getData('text').trim();
  const words = pasteText.split(/\s+/); // Split by spaces

  if (words.length === 12) {
    seedWords.value = words;
    errorMessage.value = '';
  } else {
    errorMessage.value = t('login.invalidSeedLength');
  }
};

// Handle spacebar navigation between fields
const handleKeyDown = (event, index) => {
  if (event.key === ' ') {
    event.preventDefault();
    if (index < 11) {
      document.getElementById(`word-${index + 1}`).focus();
    }
  }
};

// Handle account recovery
const handleAccountRecovery = async () => {
  if (!isSeedPhraseValid.value) {
    errorMessage.value = t('login.invalidSeedPhrase');
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.recoverAccount(seedWords.value.join(' ').trim());
  } catch (error) {
    errorMessage.value = error.message || t('login.recoveryFailed');
  } finally {
    loading.value = false;
  }
};

// Focus the first input on mount
onMounted(() => {
  document.getElementById('word-0').focus();
});
</script>

<template>
  <div class="recovery-container">
    <h2>{{ t('login.accountRecovery') }}</h2>
    <p class="instruction">{{ t('login.enterSeedPhrase') }}</p>

    <!-- Seed phrase input fields -->
    <div class="seed-grid">
      <div v-for="(word, index) in seedWords" :key="index" class="seed-input-container">
        <label :for="`word-${index}`">{{ index + 1 }}.</label>
        <input
          :id="`word-${index}`"
          v-model="seedWords[index]"
          type="text"
          @paste="handlePaste"
          @keydown="handleKeyDown($event, index)"
          :disabled="loading"
        />
      </div>
    </div>

    <!-- Error message -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- Recover button -->
    <button @click="handleAccountRecovery" :disabled="loading || !isSeedPhraseValid">
      {{ loading ? t('login.recovering') : t('login.recoverAccount') }}
    </button>
  </div>
</template>

<style scoped>
.recovery-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.instruction {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

.seed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
}

.seed-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.seed-input-container label {
  font-weight: bold;
  color: #505050;
}

.seed-input-container input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
}

.seed-input-container input:focus {
  border-color: #505050;
}

.error-message {
  color: #ff4d4f;
  font-size: 0.9rem;
  text-align: center;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #505050;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #606060;
}
</style>
