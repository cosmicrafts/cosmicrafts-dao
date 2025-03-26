<template>
  <div class="seed-manager cosmic-panel">
    <!-- Header Section -->
    <div class="seed-header">
      <div class="header-content">
        <div class="icon-container">
          <i class="fas fa-key"></i>
        </div>
        <div class="title-container">
          <h2 class="cosmic-title">{{ title }}</h2>
          <p class="description">{{ description }}</p>
        </div>
      </div>
    </div>

    <!-- Warning Section -->
    <div class="warning-box" v-if="!seedRevealed">
      <div class="warning-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="warning-content">
        <h3>{{ $t('wallet.seedWarningTitle') || 'Important Security Notice' }}</h3>
        <ul>
          <li>{{ $t('wallet.seedWarningPoint1') || 'Your seed phrase is the only way to recover your account if you lose access.' }}</li>
          <li>{{ $t('wallet.seedWarningPoint2') || 'Anyone with your seed phrase can access your account.' }}</li>
          <li>{{ $t('wallet.seedWarningPoint3') || 'Store it securely and never share it with anyone.' }}</li>
          <li>{{ $t('wallet.seedWarningPoint4') || 'CosmicDAO never stores your seed phrase.' }}</li>
        </ul>
      </div>
    </div>

    <!-- Reveal Button -->
    <div class="reveal-section" v-if="!seedRevealed">
      <button 
        class="cosmic-button cosmic-button-primary reveal-button" 
        @click="revealSeedPhrase"
      >
        <span class="button-text">{{ $t('wallet.revealSeedPhrase') || 'Reveal Seed Phrase' }}</span>
      </button>
    </div>

    <!-- Length Warning -->
    <div v-if="isInvalidLength && seedRevealed" class="warning-box special-warning">
      <div class="warning-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <div class="warning-content">
        <h3>{{ $t('wallet.seedLengthWarning') || 'Unusual Seed Phrase Length' }}</h3>
        <p>{{ $t('wallet.seedLengthWarningText') || 'Your seed phrase appears to be longer than the standard 12 words. Only the first 12 words are shown here.' }}</p>
      </div>
    </div>

    <!-- Seed Phrase Display -->
    <div class="seed-display" v-if="seedRevealed">
      <!-- Seed Phrase Grid -->
      <div class="seed-grid">
        <div v-for="(word, index) in seedWords" :key="index" class="seed-word">
          <span class="word-number">{{ index + 1 }}.</span>
          <span class="word-text">{{ word }}</span>
        </div>
      </div>

      <!-- Copy Button -->
      <div class="copy-section">
        <button 
          class="cosmic-button cosmic-button-outline-primary copy-button" 
          @click="copySeedPhrase"
        >
          <i class="fas fa-copy"></i>
          <span class="button-text">{{ copyButtonText }}</span>
        </button>
      </div>
    </div>

    <!-- Key Details Section -->
    <div class="key-details" v-if="seedRevealed && showAddressDetails">
      <div class="divider">
        <span>{{ $t('wallet.keyDetails') || 'Key Details' }}</span>
      </div>
      
      <div class="detail-item">
        <span class="detail-label">{{ $t('wallet.principal') || 'Principal ID:' }}</span>
        <div class="detail-value">
          <span class="truncated-value">{{ truncatedPrincipal }}</span>
          <button class="copy-icon" @click="copyToClipboard(principalId)">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('wallet.accountId') || 'Account ID:' }}</span>
        <div class="detail-value">
          <span class="truncated-value">{{ truncatedAccountId }}</span>
          <button class="copy-icon" @click="copyToClipboard(accountId)">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('wallet.publicKey') || 'Public Key:' }}</span>
        <div class="detail-value">
          <span class="truncated-value">{{ truncatedPublicKey }}</span>
          <button class="copy-icon" @click="copyToClipboard(publicKey)">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons" v-if="seedRevealed">
      <button 
        class="cosmic-button cosmic-button-danger"
        @click="hideSeedPhrase"
      >
        <span class="button-text">{{ $t('wallet.hideSeedPhrase') || 'Hide Seed Phrase' }}</span>
      </button>
      
      <button 
        v-if="!showAddressDetails"
        class="cosmic-button cosmic-button-secondary"
        @click="toggleAddressDetails"
      >
        <span class="button-text">{{ $t('wallet.showAdvanced') || 'Show Advanced Details' }}</span>
      </button>
      
      <button 
        v-else
        class="cosmic-button cosmic-button-secondary"
        @click="toggleAddressDetails"
      >
        <span class="button-text">{{ $t('wallet.hideAdvanced') || 'Hide Advanced Details' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Principal } from '@dfinity/principal';
import { AccountIdentifier } from '@dfinity/ledger-icp';

const props = defineProps({
  title: {
    type: String,
    default: 'Your Seed Phrase'
  },
  description: {
    type: String,
    default: 'Your secret backup phrase is the key to your wallet. Keep it safe.'
  },
  seedPhrase: {
    type: String,
    default: null
  },
  publicKeyHex: {
    type: String,
    default: null
  },
  principalIdParam: {
    type: String,
    default: null
  }
});

const authStore = useAuthStore();
const seedRevealed = ref(false);
const showAddressDetails = ref(false);
const copyButtonText = ref('Copy to Clipboard');
const copiedTimeout = ref(null);
const isInvalidLength = ref(false);

// Get seed phrase from props or auth store
const currentSeedPhrase = computed(() => {
  return props.seedPhrase || authStore.seedPhrase;
});

// Split seed phrase into array of words - enforce 12-word limit for display
const seedWords = computed(() => {
  if (!currentSeedPhrase.value) return Array(12).fill('');
  
  // Split the seed phrase into words
  const words = currentSeedPhrase.value.split(' ');
  
  // Check if we have more than 12 words (unexpected)
  if (words.length > 12) {
    console.warn('Seed phrase has more than 12 words:', words.length);
    isInvalidLength.value = true;
    // Take only the first 12 words for display
    return words.slice(0, 12);
  }
  
  isInvalidLength.value = false;
  return words;
});

// Get principal ID
const principalId = computed(() => {
  return props.principalIdParam || authStore.getIdentity()?.getPrincipal().toText() || '';
});

// Generate account ID from principal
const accountId = computed(() => {
  if (!principalId.value) return '';
  try {
    const principal = Principal.fromText(principalId.value);
    return AccountIdentifier.fromPrincipal({ principal }).toHex();
  } catch (e) {
    console.error('Error generating account ID:', e);
    return '';
  }
});

// Get public key
const publicKey = computed(() => {
  return props.publicKeyHex || '';
});

// Truncated versions for display
const truncatedPrincipal = computed(() => {
  if (!principalId.value) return '';
  return principalId.value.slice(0, 8) + '...' + principalId.value.slice(-8);
});

const truncatedAccountId = computed(() => {
  if (!accountId.value) return '';
  return accountId.value.slice(0, 8) + '...' + accountId.value.slice(-8);
});

const truncatedPublicKey = computed(() => {
  if (!publicKey.value) return '';
  return publicKey.value.slice(0, 8) + '...' + publicKey.value.slice(-8);
});

// Validate seed phrase format
const seedPhraseValid = computed(() => {
  if (!currentSeedPhrase.value) return false;
  const wordCount = currentSeedPhrase.value.trim().split(/\s+/).length;
  return wordCount === 12;
});

// Methods
const revealSeedPhrase = () => {
  seedRevealed.value = true;
};

const hideSeedPhrase = () => {
  seedRevealed.value = false;
  showAddressDetails.value = false;
};

const toggleAddressDetails = () => {
  showAddressDetails.value = !showAddressDetails.value;
};

const copySeedPhrase = () => {
  if (!currentSeedPhrase.value) return;
  
  navigator.clipboard.writeText(currentSeedPhrase.value)
    .then(() => {
      copyButtonText.value = '✓ Copied!';
      
      if (copiedTimeout.value) {
        clearTimeout(copiedTimeout.value);
      }
      
      copiedTimeout.value = setTimeout(() => {
        copyButtonText.value = 'Copy to Clipboard';
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy seed phrase:', err);
    });
};

const copyToClipboard = (text) => {
  if (!text) return;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      // Visual feedback could be implemented
    })
    .catch(err => {
      console.error('Failed to copy text:', err);
    });
};

onMounted(() => {
  // Clean up on component unmount
  return () => {
    if (copiedTimeout.value) {
      clearTimeout(copiedTimeout.value);
    }
  };
});
</script>

<style scoped>
.seed-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.seed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  font-size: 1.4rem;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.title-container h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.title-container .description {
  margin: 0.25rem 0 0 0;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

.warning-box {
  display: flex;
  background: rgba(255, 145, 0, 0.1);
  border: 1px solid rgba(255, 145, 0, 0.3);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  gap: 1rem;
}

.warning-box.special-warning {
  background: rgba(255, 75, 75, 0.1);
  border-color: rgba(255, 75, 75, 0.3);
}

.warning-box.special-warning .warning-icon {
  color: rgba(255, 75, 75, 0.9);
}

.warning-box.special-warning h3 {
  color: rgba(255, 75, 75, 0.9);
}

.warning-icon {
  color: var(--cosmic-orange);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.warning-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-orange);
  font-size: 1rem;
}

.warning-content ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
}

.warning-content li {
  margin-bottom: 0.25rem;
}

.warning-content p {
  margin: 0;
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
}

.reveal-section {
  display: flex;
  justify-content: center;
}

.reveal-button {
  min-width: 200px;
}

.seed-display {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.seed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-md);
  padding: 1.5rem;
}

.seed-word {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem 0.75rem;
  transition: all var(--cosmic-transition-fast);
}

.seed-word:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.word-number {
  color: var(--cosmic-blue);
  font-weight: bold;
  font-size: 0.85rem;
  min-width: 1.5rem;
}

.word-text {
  color: var(--cosmic-text-primary);
  font-size: 0.95rem;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.copy-section {
  display: flex;
  justify-content: center;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  justify-content: center;
}

.key-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

.divider {
  display: flex;
  align-items: center;
  color: var(--cosmic-text-tertiary);
  margin: 0.5rem 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(15, 185, 253, 0.3), transparent);
  margin: 0 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.75rem;
}

.detail-label {
  color: var(--cosmic-text-tertiary);
  font-size: 0.8rem;
}

.detail-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.truncated-value {
  color: var(--cosmic-text-primary);
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  flex-grow: 1;
  word-break: break-all;
}

.copy-icon {
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.copy-icon:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .seed-manager {
    padding: 1.5rem;
  }
  
  .seed-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .action-buttons button {
    width: 100%;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .divider span {
    font-size: 0.75rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 