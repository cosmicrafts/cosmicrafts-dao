<template>
  <div class="seed-phrase-modal">
    <div class="modal-header">
      <h2>{{ title }}</h2>
      <button class="close-button" @click="closeModal">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="modal-content">
      <SeedPhraseManager 
        :seed-phrase="normalizedSeedPhrase"
        :principal-id-param="principalId"
        :public-key-hex="publicKey"
      />
      
      <div class="modal-actions">
        <button class="cosmic-button cosmic-button-outline-primary" @click="closeModal">
          <span class="button-text">{{ $t('wallet.close') || 'Close' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useModalStore } from '@/stores/modal';
import SeedPhraseManager from '@/components/user/SeedPhraseManager.vue';

const props = defineProps({
  seedPhrase: {
    type: String,
    required: true
  },
  principalId: {
    type: String,
    default: ''
  },
  publicKey: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Account Security Information'
  }
});

const modalStore = useModalStore();
const seedPhraseWarning = ref('');

// Normalize the seed phrase to ensure we're always showing 12 words
const normalizedSeedPhrase = computed(() => {
  if (!props.seedPhrase) return '';
  
  const words = props.seedPhrase.trim().split(/\s+/);
  
  // Check if seed phrase is too long
  if (words.length > 12) {
    console.warn(`Seed phrase contains ${words.length} words, expected 12`);
    seedPhraseWarning.value = `Note: Your seed phrase is ${words.length} words long. Only the first 12 words are used for account recovery.`;
    return words.slice(0, 12).join(' ');
  }
  
  // If the phrase is the right length, use it as is
  seedPhraseWarning.value = '';
  return props.seedPhrase;
});

// Methods
const closeModal = () => {
  modalStore.closeModal();
};

onMounted(() => {
  // Handle escape key to close modal
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  // Cleanup
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
});
</script>

<style scoped>
.seed-phrase-modal {
  width: 100%;
  max-width: 650px;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--cosmic-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.close-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-text-primary);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.close-button:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.4);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.modal-content {
  padding: 1.5rem;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

.warning-text {
  color: var(--cosmic-orange);
  background: rgba(255, 145, 0, 0.1);
  border: 1px solid rgba(255, 145, 0, 0.2);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .seed-phrase-modal {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .modal-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
  
  .modal-actions {
    margin-top: auto;
    padding-bottom: 1rem;
  }
}
</style> 