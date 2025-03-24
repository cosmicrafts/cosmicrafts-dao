<template>
  <div v-if="isVisible" class="chest-modal-backdrop" @click="$emit('close')">
    <div class="chest-modal-container" @click.stop>
      <!-- Header -->
      <div class="chest-modal-header">
        <h3>{{ chest ? chest.name : $t('wallet.openingChest') }}</h3>
        <button class="close-button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Content -->
      <div class="chest-modal-content">
        <!-- Stage 1: Opening Animation -->
        <div v-if="stage === 1" class="chest-opening-animation">
          <div class="chest-image">
            <img :src="chest?.image" :alt="chest?.name" />
          </div>
          <div class="opening-text">{{ $t('wallet.openingChest') }}</div>
          <div class="opening-spinner"></div>
        </div>
        
        <!-- Stage 2: Rewards Display -->
        <div v-else-if="stage === 2" class="chest-rewards">
          <h4>{{ $t('wallet.chestRewards') }}</h4>
          
          <div v-if="rewards.length === 0" class="no-rewards">
            {{ $t('wallet.noRewardsFound') }}
          </div>
          
          <div v-else class="rewards-grid">
            <div 
              v-for="(reward, index) in rewards" 
              :key="index"
              class="reward-card"
              :class="{ revealed: reward.revealed }"
              @click="$emit('reveal-reward', index)"
            >
              <div class="reward-front">
                <div class="reward-image">
                  <img :src="reward.image" :alt="reward.name" />
                </div>
                <div class="reward-info">
                  <div class="reward-name">{{ reward.name }}</div>
                  <div v-if="reward.quantity > 1" class="reward-quantity">x{{ reward.quantity }}</div>
                  <div v-if="reward.rarity" class="reward-rarity" :class="'rarity-' + reward.rarity">
                    {{ getRarityLabel(reward.rarity) }}
                  </div>
                </div>
              </div>
              
              <div class="reward-back">
                <div class="tap-to-reveal">
                  {{ $t('wallet.tapToReveal') }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="chest-action-buttons">
            <button class="close-chest-button" @click="$emit('close')">
              {{ $t('wallet.closeDialog') }}
            </button>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="chest-error">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="error-message">{{ error }}</div>
          <button class="close-chest-button" @click="$emit('close')">
            {{ $t('wallet.closeDialog') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  chest: {
    type: Object,
    default: null
  },
  rewards: {
    type: Array,
    default: () => []
  },
  stage: {
    type: Number,
    default: 1
  },
  error: {
    type: String,
    default: null
  }
});

// Define emits
const emit = defineEmits(['close', 'reveal-reward']);

// Get rarity label from numeric value
function getRarityLabel(rarity) {
  const rarityMap = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary',
    6: 'Mythic',
    7: 'Divine'
  };
  
  return rarityMap[rarity] || 'Common';
}
</script>

<style scoped>
.chest-modal-backdrop {
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

.chest-modal-container {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-bg-secondary, #16213e);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-border-highlight, rgba(255, 255, 255, 0.2));
  display: flex;
  flex-direction: column;
}

.chest-modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  background: rgba(0, 0, 0, 0.2);
}

.chest-modal-header h3 {
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

.chest-modal-content {
  padding: 20px;
  flex: 1;
}

/* Opening Animation */
.chest-opening-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px 0;
}

.chest-image {
  width: 150px;
  height: 150px;
  animation: pulse 2s infinite;
}

.chest-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.opening-text {
  font-size: 1.2rem;
  color: var(--color-text-primary, #ffffff);
  text-align: center;
}

.opening-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-accent, #4169e1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Rewards Display */
.chest-rewards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chest-rewards h4 {
  font-size: 1.1rem;
  margin: 0;
  color: var(--color-text-primary, #ffffff);
  text-align: center;
}

.no-rewards {
  padding: 30px 0;
  text-align: center;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.reward-card {
  position: relative;
  height: 160px;
  perspective: 1000px;
  cursor: pointer;
}

.reward-front, .reward-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transition: transform 0.6s;
  border-radius: 8px;
  overflow: hidden;
}

.reward-front {
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
}

.reward-back {
  background: linear-gradient(135deg, #4a69bd, #1e3799);
  border: 1px solid var(--color-accent, #4169e1);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(0deg);
}

.reward-card.revealed .reward-front {
  transform: rotateY(0deg);
}

.reward-card.revealed .reward-back {
  transform: rotateY(180deg);
}

.reward-image {
  height: 100px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reward-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.reward-info {
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
}

.reward-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.reward-quantity {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.reward-rarity {
  font-size: 0.7rem;
  font-weight: 600;
}

.tap-to-reveal {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  text-align: center;
  padding: 0 10px;
}

.chest-action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.close-chest-button {
  padding: 10px 20px;
  background: var(--color-accent, #4169e1);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-chest-button:hover {
  background-color: var(--color-accent-hover, #5a7ae2);
}

/* Error State */
.chest-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px 0;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-error, #ef4444);
}

.error-message {
  text-align: center;
  color: var(--color-text-primary, #ffffff);
  max-width: 300px;
}

/* Rarity Colors */
.rarity-1 {
  color: #8E8E8E; /* Common */
}

.rarity-2 {
  color: #69D32C; /* Uncommon */
}

.rarity-3 {
  color: #3689FF; /* Rare */
}

.rarity-4 {
  color: #A82CFF; /* Epic */
}

.rarity-5 {
  color: #FF9426; /* Legendary */
}

.rarity-6 {
  color: #FF4776; /* Mythic */
}

.rarity-7 {
  color: #FFD700; /* Divine */
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 480px) {
  .rewards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 