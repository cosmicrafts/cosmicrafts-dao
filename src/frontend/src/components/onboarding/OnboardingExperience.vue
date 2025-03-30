<template>
  <div class="onboarding-container" v-if="isVisible">
    <div class="onboarding-overlay" :class="{ 'fade-in': animateOverlay }"></div>
    
    <!-- Step 1: Immediate Reward (15 seconds) -->
    <div v-if="currentStep === 1" class="reward-claim-container">
      <div class="reward-chest" :class="{ 'animate-open': chestOpened }">
        <img src="/assets/webp/chests/stellar-box.webp" alt="Welcome Chest" @click="openChest" />
        <div class="chest-glow" :class="{ 'pulse-fast': !chestOpened }"></div>
      </div>
      
      <div class="reward-prompt" v-if="!chestOpened">
        <h2>TAP TO CLAIM YOUR FREE CHEST!</h2>
        <div class="countdown-timer">
          <span>{{ countdownTime }}s</span>
          <div class="timer-bar">
            <div class="timer-progress" :style="{ width: `${countdownProgress}%` }"></div>
          </div>
        </div>
      </div>
      
      <div class="reward-details" v-if="chestOpened">
        <div class="reward-animation">
          <div class="token-burst">
            <div v-for="n in 12" :key="n" class="token-particle"></div>
          </div>
        </div>
        <div class="reward-items">
          <div class="reward-item">
            <div class="reward-icon token-icon">
              <i class="fas fa-coins"></i>
            </div>
            <div class="reward-value">+30</div>
            <div class="reward-label">TOKENS</div>
          </div>
          <div class="reward-item">
            <div class="reward-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="reward-value">+20</div>
            <div class="reward-label">XP</div>
          </div>
        </div>
        <button @click="nextStep" class="action-button pulse-button">
          CHECK WALLET <i class="fas fa-wallet"></i>
        </button>
      </div>
    </div>
    
    <!-- Step 2: Wallet & NFT Introduction (45 seconds) -->
    <div v-if="currentStep === 2" class="wallet-nft-container">
      <h2>YOUR COSMIC WALLET</h2>
      
      <div class="wallet-display">
        <div class="wallet-balance">
          <div class="balance-header">
            <i class="fas fa-wallet"></i>
            <span>BALANCE</span>
          </div>
          <div class="balance-amount">
            <span class="amount">30</span>
            <span class="token">TOKENS</span>
          </div>
        </div>
        
        <div class="wallet-actions">
          <button @click="activateFeature('wallet')" class="wallet-action-button active">
            <i class="fas fa-check-circle"></i> WALLET ACTIVATED
          </button>
        </div>
      </div>
      
      <div class="nft-preview">
        <h3>MINT YOUR FIRST SHIP</h3>
        <div class="nft-card">
          <div class="nft-image">
            <div class="nft-glow"></div>
            <img src="@/assets/webp/ships/starter-ship.webp" alt="Starter Ship" onerror="this.src='/assets/webp/chests/cosmic-cache.webp'"/>
          </div>
          <div class="nft-info">
            <div class="nft-name">Cosmic Guardian</div>
            <div class="nft-type">Starter Ship</div>
            <div class="nft-stats">
              <div class="stat">
                <i class="fas fa-shield-alt"></i>
                <span>100 HP</span>
              </div>
              <div class="stat">
                <i class="fas fa-bolt"></i>
                <span>15 POWER</span>
              </div>
            </div>
            <button 
              @click="activateFeature('ship')" 
              class="mint-button"
              :class="{ 'minted': activatedFeatures.includes('ship') }"
            >
              <span v-if="!activatedFeatures.includes('ship')">
                <i class="fas fa-fire"></i> MINT SHIP (25 TOKENS)
              </span>
              <span v-else>
                <i class="fas fa-check-circle"></i> SHIP MINTED!
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="mission-preview" v-if="activatedFeatures.includes('ship')">
        <h3>STARTER MISSION UNLOCKED!</h3>
        <div class="mission-card">
          <div class="mission-icon">
            <i class="fas fa-rocket"></i>
          </div>
          <div class="mission-details">
            <div class="mission-name">First Voyage</div>
            <div class="mission-description">Deploy your ship and complete your first mission</div>
            <div class="mission-reward">
              <i class="fas fa-coins"></i> <span>20 TOKENS</span>
              <i class="fas fa-star"></i> <span>50 XP</span>
            </div>
            <div class="mission-time">
              <i class="fas fa-clock"></i> <span>5 min</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="onboarding-footer">
        <button 
          @click="completeOnboarding" 
          class="action-button"
          :class="{ 'pulse-button': activatedFeatures.includes('ship') }"
        >
          {{ activatedFeatures.includes('ship') ? 'START EXPLORING!' : 'CONTINUE' }}
          <i class="fas fa-rocket"></i>
        </button>
      </div>
    </div>
    
    <!-- Skip confirmation modal -->
    <div class="modal-overlay" v-if="showSkipModal">
      <div class="modal-content">
        <h3>Skip Minting Ship?</h3>
        <p>Your starter ship gives you an advantage in early missions!</p>
        <div class="modal-actions">
          <button @click="showSkipModal = false" class="secondary-button">
            No, Mint Ship
          </button>
          <button @click="skipOnboarding" class="danger-button">
            Skip Anyway
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNotification } from '@/composables/useNotification';

// State
const isVisible = ref(true);
const animateOverlay = ref(false);
const currentStep = ref(1);
const chestOpened = ref(false);
const countdownTime = ref(15); // Shortened to 15 seconds for faster engagement
const countdownProgress = ref(100);
const showSkipModal = ref(false);
const activatedFeatures = ref(['wallet']); // Wallet activated by default
const tokenBalance = ref(30);
const notify = useNotification();

// Emit events
const emit = defineEmits(['onboarding-completed', 'onboarding-skipped', 'mission-activated']);

// Start countdown
const startCountdown = () => {
  const totalTime = 15; // 15 seconds for faster engagement
  countdownTime.value = totalTime;
  countdownProgress.value = 100;
  
  const interval = setInterval(() => {
    if (countdownTime.value > 0) {
      countdownTime.value--;
      countdownProgress.value = (countdownTime.value / totalTime) * 100;
    } else {
      clearInterval(interval);
      // Auto-open chest if not opened by user
      if (!chestOpened.value) {
        openChest();
      }
    }
  }, 1000);
};

// Open chest and show rewards
const openChest = () => {
  if (chestOpened.value) return;
  
  chestOpened.value = true;
  
  // Play sound effect if available
  // playSound('chest-open');
  
  // Show tokens animation
  setTimeout(() => {
    notify.reward('30 Tokens and 20 XP claimed!', {
      title: 'Free Daily Chest!',
      duration: 3000
    });
    
    // Update mission progress in analytics
    console.log('Analytics: Daily free chest claimed');
    
    // Would trigger backend update here in production
    // updateMissionProgress('dailyFreeChest', 1);
  }, 500);
};

// Go to next step
const nextStep = () => {
  currentStep.value++;
};

// Activate feature
const activateFeature = (feature) => {
  if (!activatedFeatures.value.includes(feature)) {
    activatedFeatures.value.push(feature);
    
    // Show notification
    let message = '';
    let title = '';
    
    switch (feature) {
      case 'ship':
        message = 'Cosmic Guardian ship minted and added to your collection!';
        title = 'Ship NFT Minted!';
        tokenBalance.value -= 25; // Deduct tokens for minting
        
        // Activate mission
        setTimeout(() => {
          notify.info('First Voyage mission is now available!', {
            title: 'Mission Unlocked',
            duration: 4000
          });
          
          emit('mission-activated', {
            missionId: 'firstVoyage',
            missionName: 'First Voyage'
          });
        }, 1000);
        break;
    }
    
    if (message) {
      notify.success(message, {
        title,
        duration: 3000
      });
    }
  }
};

// Complete onboarding
const completeOnboarding = () => {
  // If ship isn't minted, confirm
  if (!activatedFeatures.value.includes('ship')) {
    showSkipModal.value = true;
    return;
  }
  
  finishOnboarding();
};

// Skip onboarding
const skipOnboarding = () => {
  try {
    // Emit event to parent
    emit('onboarding-skipped');
    
    // Hide onboarding
    isVisible.value = false;
    showSkipModal.value = false;
    
    // Notify user
    notify.info('You can mint your ship later from the Collection tab.', {
      title: 'Onboarding Skipped',
      duration: 4000
    });
    
    // Save onboarding status
    localStorage.setItem('onboardingSkipped', 'true');
    console.log('Analytics: Onboarding skipped');
  } catch (error) {
    console.error('Error skipping onboarding:', error);
  }
};

// Finish onboarding with ship minted
const finishOnboarding = () => {
  // Emit completed event
  emit('onboarding-completed', {
    activatedFeatures: activatedFeatures.value,
    shipMinted: activatedFeatures.value.includes('ship')
  });
  
  // Show completion notification
  notify.reward('Welcome to Cosmicrafts! Your journey begins now.', {
    title: 'Ready to Explore!',
    duration: 4000
  });
  
  // Hide onboarding
  isVisible.value = false;
  
  // Save onboarding status
  localStorage.setItem('onboardingCompleted', 'true');
  console.log('Analytics: Onboarding completed successfully with ship minted');
};

// Initialize
onMounted(() => {
  // Check if onboarding has been completed already
  const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true';
  
  if (hasCompletedOnboarding) {
    isVisible.value = false;
    return;
  }
  
  // Animate overlay
  setTimeout(() => {
    animateOverlay.value = true;
  }, 100);
  
  // Start countdown
  startCountdown();
});
</script>

<style scoped>
.onboarding-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(16, 24, 48, 0.95) 100%);
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.onboarding-overlay.fade-in {
  opacity: 1;
}

/* Step 1: Reward Claim Styles */
.reward-claim-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  max-width: 90%;
  width: 400px;
}

.reward-chest {
  width: 200px;
  height: 200px;
  position: relative;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.reward-chest:hover {
  transform: scale(1.05);
}

.reward-chest img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.chest-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, rgba(255, 140, 0, 0.2) 50%, transparent 70%);
  filter: blur(10px);
  z-index: -1;
}

.pulse-fast {
  animation: pulse-fast 1.2s infinite;
}

@keyframes pulse-fast {
  0% { opacity: 0.5; transform: scale(0.95); }
  50% { opacity: 0.8; transform: scale(1.05); }
  100% { opacity: 0.5; transform: scale(0.95); }
}

.reward-chest.animate-open {
  animation: chest-open 0.8s forwards;
}

@keyframes chest-open {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1.1); }
}

.reward-prompt {
  text-align: center;
  color: white;
}

.reward-prompt h2 {
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  background: linear-gradient(90deg, #FFD700, #FF8C00);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-pulse 2s infinite;
}

@keyframes text-pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.countdown-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.countdown-timer span {
  font-size: 1.2rem;
  font-weight: bold;
  color: #FF8C00;
}

.timer-bar {
  width: 200px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #FF8C00, #FFD700);
  border-radius: 3px;
  transition: width 1s linear;
}

.reward-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: fade-in 0.5s ease-out;
}

.reward-animation {
  position: relative;
  width: 100%;
  height: 60px;
}

.token-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.token-particle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #FFD700;
  border-radius: 50%;
  animation: particle-burst 1s forwards;
}

@keyframes particle-burst {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(cos(var(--angle, 0deg)) * 100px),
      calc(sin(var(--angle, 0deg)) * 100px)
    );
    opacity: 0;
  }
}

.reward-items {
  display: flex;
  gap: 2rem;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  gap: 0.5rem;
}

.reward-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #9d35bf;
}

.token-icon {
  color: #FFD700;
}

.reward-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.reward-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Step 2: Wallet & NFT Styles */
.wallet-nft-container {
  position: relative;
  background: rgba(15, 20, 40, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.3);
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  z-index: 10;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: slide-up 0.5s ease-out;
}

.wallet-nft-container h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.5rem;
}

.wallet-nft-container h3 {
  color: white;
  font-size: 1.2rem;
  margin: 1.5rem 0 1rem;
}

.wallet-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 185, 253, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  padding: 1rem;
}

.wallet-balance {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.balance-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.balance-amount {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.amount {
  font-size: 2rem;
  font-weight: bold;
  color: #FFD700;
}

.token {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.wallet-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.wallet-action-button {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green, #00e5a4);
  border: 1px solid rgba(0, 229, 164, 0.3);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nft-preview {
  margin-top: 1rem;
}

.nft-card {
  display: flex;
  background: rgba(15, 185, 253, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  overflow: hidden;
}

.nft-image {
  width: 120px;
  height: 150px;
  position: relative;
  overflow: hidden;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.2) 0%, rgba(157, 53, 191, 0.1) 100%);
  pointer-events: none;
}

.nft-info {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.nft-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25rem;
}

.nft-type {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
}

.nft-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.mint-button {
  margin-top: auto;
  background: linear-gradient(90deg, #FF6B6B, #FF8E53);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.mint-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.mint-button.minted {
  background: linear-gradient(90deg, #00e5a4, #00c497);
}

.mission-preview {
  margin-top: 1.5rem;
  animation: fade-in 0.5s ease-out;
}

.mission-card {
  display: flex;
  background: rgba(15, 185, 253, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  padding: 1rem;
  gap: 1rem;
}

.mission-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(157, 53, 191, 0.1);
  color: #9d35bf;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.mission-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mission-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
}

.mission-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.mission-reward {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.mission-reward i {
  color: #FFD700;
}

.mission-reward span {
  color: white;
  font-size: 0.9rem;
}

.mission-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.onboarding-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.action-button {
  background: linear-gradient(90deg, var(--cosmic-blue, #0fb9fd), var(--cosmic-purple, #9d35bf));
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.3);
}

.pulse-button {
  animation: pulse-button 2s infinite;
}

@keyframes pulse-button {
  0% {
    box-shadow: 0 0 0 0 rgba(15, 185, 253, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(15, 185, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(15, 185, 253, 0);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  background: rgba(15, 20, 40, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  padding: 1.5rem;
  width: 90%;
  max-width: 350px;
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: white;
}

.modal-content p {
  color: rgba(255, 255, 255, 0.7);
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.secondary-button, .danger-button {
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue, #0fb9fd);
  border: 1px solid rgba(15, 185, 253, 0.3);
}

.secondary-button:hover {
  background: rgba(15, 185, 253, 0.2);
}

.danger-button {
  background: rgba(255, 0, 76, 0.1);
  color: #ff004c;
  border: 1px solid rgba(255, 0, 76, 0.3);
}

.danger-button:hover {
  background: rgba(255, 0, 76, 0.2);
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .reward-chest {
    width: 160px;
    height: 160px;
  }
  
  .reward-prompt h2 {
    font-size: 1.4rem;
  }
  
  .reward-items {
    gap: 1rem;
  }
  
  .reward-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .wallet-nft-container {
    padding: 1rem;
  }
  
  .nft-image {
    width: 100px;
  }
  
  .nft-name {
    font-size: 1.1rem;
  }
  
  .mission-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style> 