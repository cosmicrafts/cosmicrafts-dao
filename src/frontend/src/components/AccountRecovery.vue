<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';
import * as bip39 from 'bip39';

const authStore = useAuthStore();
const modalStore = useModalStore();
const { t } = useI18n();

// Validate each word individually
const validateWord = (word) => {
  return bip39.wordlists.english.includes(word.toLowerCase());
};

const isWordValid = (index) => {
  const word = seedWords.value[index];
  const result = validateWord(word);
  return result;
};


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
  // Trigger validation feedback on keydown
  isWordValid(index);
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
        <!-- Header Section -->
        <div class="header">
            <div class="icon-text-container">
            <img src="@/assets/icons/recovery.svg" alt="Recovery Icon" class="recovery-icon" />
            <h2 class="title">{{ t('login.accountRecovery') }}</h2>
            </div>
            <p class="subtitle">{{ t('login.enterSeedPhrase') }}</p>
      </div>


    
        <!-- Divider -->
        <div class="divider"></div>
    
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
            :class="{ 'valid-word': isWordValid(index), 'invalid-word': !isWordValid(index) && seedWords[index] }"
            />
            <div class="icon-container">
            <!-- Display icons based on validation -->
            <img
                  v-if="seedWords[index] && isWordValid(index)"
                  src="@/assets/icons/valid.svg"
                  alt="Valid"
                  class="valid-icon"
            />
            <img
                  v-else-if="seedWords[index] && !isWordValid(index)"
                  src="@/assets/icons/invalid.svg"
                  alt="Invalid"
                  class="invalid-icon"
            />
            </div>
      </div>


        </div>
    
        <!-- Error message -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    
        <!-- Valid seed phrase message -->
        <p v-if="isSeedPhraseValid" class="valid-message">
          {{ t('login.seedValid') }}
        </p>
    
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
  margin: 0 auto;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;

}

.icon-text-container {
  display: flex;
  align-items: center;
  gap: .5rem; /* Space between the icon and the title */
}

.recovery-icon {
  width: 36px;
  height: 36px;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.subtitle {
  font-size: 1rem;
  color: #00befd;
  margin-bottom: .25rem;
  font-weight: 500;
}

.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right,transparent, #00befd, transparent);
  margin-bottom: 1rem;
}

.instruction {
  font-size: 1rem;
  font-weight: bold;
  color: #00befd;
  text-align: center;
}

.seed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.seed-input-container {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.seed-input-container label {
  font-weight: bold;
  font-size: .75rem;
  color: #6f6f6f; /* Neutral text color */
}

.seed-input-container input {
  width: 100px; /* Set a fixed width */
  max-width: 8rem; /* Optional: limit the maximum width */
  padding: .5rem;
  font-size: 0.85rem;
  border: 1px solid #00e1ff;
  border-radius: 8px;
  outline: none;
  color: #ffffff;
  background-color: #2e2e2e;
  transition: border-color 0.4s ease, background-color 0.5s ease, color 0.6s ease;
}

.seed-input-container input:focus-within {
  border-color: #ffffff;
  box-shadow: 0 0px 8px rgba(255, 255, 255, 0.976); /* Subtle shadow */
  transform: scale(1.025) translateX(3px); /* Scale and move slightly to the right */
  background-color: #232323;
  transition: transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease; /* Smooth transition */
}


@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
}

.valid-message {
  color: #35c500; /* Green for confirmation */
  font-size: .75rem;
  font-weight: thin;
  text-align: center;
}



button {
  margin-top: 1rem;
  padding: 1rem 1rem;
  font-size: .75rem;
  font-weight: bold;
  color: #fff;
  background-color: #0080ff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

button:disabled {
  background-color: #515151;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #00aaff;
}


.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.valid-icon,
.invalid-icon {
  width: 20px;
  height: 20px;
}

</style>
