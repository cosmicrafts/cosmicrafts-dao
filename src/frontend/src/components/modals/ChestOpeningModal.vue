<template>
  <div v-if="isVisible" class="chest-modal-backdrop" @click.self="closeModal">
    <div class="chest-modal">
      <!-- Stage 1: Opening Animation -->
      <div v-if="stage === 1" class="chest-opening-stage">
        <div class="chest-container">
          <img :src="chest.image" alt="Chest" class="chest-image pulse-glow" />
          <div class="chest-name">{{ chest.name }}</div>
          <div class="opening-text">Opening chest...</div>
          <div class="magic-particles"></div>
        </div>
      </div>
      
      <!-- Stage 2: Rewards Display -->
      <div v-if="stage === 2" class="rewards-stage">
        <h2 class="rewards-title">Chest Rewards</h2>
        
        <div class="rewards-container">
          <div 
            v-for="(reward, index) in rewards" 
            :key="index"
            class="reward-item"
            :class="{ revealed: reward.revealed }"
            @click="revealReward(index)"
          >
            <div class="reward-card-front">
              <div class="tap-to-reveal">Tap to reveal</div>
            </div>
            <div class="reward-card-back">
              <img :src="reward.image" :alt="reward.name" class="reward-image" />
              <div class="reward-details">
                <div class="reward-name">{{ reward.name }}</div>
                <div v-if="reward.quantity" class="reward-quantity">
                  × {{ reward.quantity }}
                </div>
                <div class="reward-rarity" :class="`rarity-${reward.rarity || 1}`">
                  {{ getRarityName(reward.rarity || 1) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button class="close-button" @click="closeModal">Continue</button>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error-state">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="error-message">{{ error }}</div>
        <button class="close-button" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { watch } from 'vue';

export default {
  name: 'ChestOpeningModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    chest: {
      type: Object,
      default: () => null
    },
    rewards: {
      type: Array,
      default: () => []
    },
    stage: {
      type: Number,
      default: 0
    },
    error: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'reveal-reward'],
  setup(props, { emit }) {
    // Auto-reveal rewards after a delay
    watch(
      () => props.stage,
      (newStage) => {
        if (newStage === 2 && props.rewards.length > 0) {
          // Auto-reveal the rewards one by one with delays
          props.rewards.forEach((_, index) => {
            setTimeout(() => {
              emit('reveal-reward', index);
            }, 1000 + index * 500); // Start after 1s, then 0.5s between reveals
          });
        }
      }
    );
    
    // Get rarity name based on rarity level
    const getRarityName = (rarity) => {
      const rarityNames = {
        1: 'Common',
        2: 'Uncommon',
        3: 'Rare',
        4: 'Epic',
        5: 'Legendary',
        6: 'Mythic'
      };
      return rarityNames[rarity] || 'Common';
    };
    
    // Reveal a specific reward
    const revealReward = (index) => {
      if (props.rewards[index] && !props.rewards[index].revealed) {
        emit('reveal-reward', index);
      }
    };
    
    // Close the modal
    const closeModal = () => {
      emit('close');
    };
    
    return {
      getRarityName,
      revealReward,
      closeModal
    };
  }
};
</script>

<style scoped>
.chest-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.chest-modal {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
  max-width: 600px;
  width: 90%;
  min-height: 400px;
  padding: 2rem;
  position: relative;
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  overflow: hidden;
}

/* Opening Stage */
.chest-opening-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.chest-container {
  position: relative;
}

.chest-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.pulse-glow {
  animation: pulse-glow 2s infinite alternate;
}

@keyframes pulse-glow {
  0% {
    filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
    transform: scale(1);
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.8));
    transform: scale(1.05);
  }
}

.chest-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-primary);
}

.opening-text {
  font-size: 1rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 1rem;
  animation: fade 1s infinite alternate;
}

@keyframes fade {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.magic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: 
    radial-gradient(circle at 20% 35%, rgba(15, 185, 253, 0.4) 0%, transparent 10%),
    radial-gradient(circle at 80% 25%, rgba(255, 145, 0, 0.3) 0%, transparent 15%),
    radial-gradient(circle at 40% 80%, rgba(157, 53, 191, 0.3) 0%, transparent 12%),
    radial-gradient(circle at 65% 60%, rgba(15, 185, 253, 0.4) 0%, transparent 8%);
  filter: blur(3px);
  opacity: 0.7;
  animation: particles-float 8s infinite ease-in-out;
}

@keyframes particles-float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-10px) translateX(5px) scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(0) translateX(-8px) scale(0.95);
    opacity: 0.8;
  }
  75% {
    transform: translateY(8px) translateX(3px) scale(1.05);
    opacity: 0.9;
  }
}

/* Rewards Stage */
.rewards-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.rewards-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-primary);
}

.rewards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.reward-item {
  width: 150px;
  height: 200px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
}

.reward-item:hover {
  transform: translateY(-5px);
}

.reward-card-front,
.reward-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--cosmic-radius-md);
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
}

.reward-card-front {
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, rgba(157, 53, 191, 0.1) 100%);
  border: 2px solid rgba(15, 185, 253, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(0);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.reward-card-back {
  background: var(--cosmic-glass-bg);
  border: 2px solid rgba(15, 185, 253, 0.3);
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.reward-item.revealed .reward-card-front {
  transform: rotateY(180deg);
}

.reward-item.revealed .reward-card-back {
  transform: rotateY(0);
}

.tap-to-reveal {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cosmic-blue);
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.7; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.05); }
}

.reward-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.reward-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--cosmic-text-primary);
}

.reward-quantity {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.reward-rarity {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.rarity-1 {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.rarity-2 {
  color: #38b000;
  background-color: rgba(56, 176, 0, 0.1);
}

.rarity-3 {
  color: #3a86ff;
  background-color: rgba(58, 134, 255, 0.1);
}

.rarity-4 {
  color: #8338ec;
  background-color: rgba(131, 56, 236, 0.1);
}

.rarity-5 {
  color: #ff9e00;
  background-color: rgba(255, 158, 0, 0.1);
}

.rarity-6 {
  color: #ff006e;
  background-color: rgba(255, 0, 110, 0.1);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.error-icon {
  color: #ff4b4b;
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: var(--cosmic-text-secondary);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  max-width: 80%;
}

/* Common Button Styles */
.close-button {
  padding: 0.75rem 2rem;
  background-color: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .chest-modal {
    padding: 1.5rem;
    width: 95%;
  }
  
  .rewards-container {
    gap: 0.75rem;
  }
  
  .reward-item {
    width: 130px;
    height: 180px;
  }
  
  .reward-image {
    width: 70px;
    height: 70px;
  }
  
  .reward-name {
    font-size: 0.9rem;
  }
  
  .chest-image {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .chest-modal {
    padding: 1rem;
  }
  
  .reward-item {
    width: 110px;
    height: 160px;
  }
  
  .reward-image {
    width: 60px;
    height: 60px;
  }
  
  .reward-name {
    font-size: 0.8rem;
  }
  
  .chest-image {
    width: 100px;
    height: 100px;
  }
  
  .rewards-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}
</style> 