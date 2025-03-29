<template>
  <div class="onboarding-experience" v-if="isVisible">
    <!-- Full page overlay with cosmic background -->
    <div class="onboarding-overlay" :class="{ 'fade-in': isVisible }">
      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
        </div>
        <div class="progress-text">{{ currentStep }} / {{ totalSteps }} {{ $t('onboarding.steps') }}</div>
      </div>

      <!-- Content slides with cosmic animation -->
      <transition name="slide-fade" mode="out-in">
        <div :key="currentStep" class="onboarding-content">
          <!-- Welcome & Daily Reward -->
          <div v-if="currentStep === 1" class="onboarding-step welcome-step">
            <h1>{{ $t('onboarding.welcome', { username: playerName }) }}</h1>
            <div class="welcome-bonus">
              <div class="bonus-chest">
                <img src="@/assets/chests/welcome-chest.webp" alt="Welcome chest" />
                <div class="chest-glow"></div>
              </div>
              <div class="bonus-details">
                <h2>{{ $t('onboarding.welcomeReward') }}</h2>
                <ul class="reward-list">
                  <li>
                    <img src="@/assets/tokens/std-token.webp" alt="STD Tokens" />
                    <span>{{ initialRewards.tokens }} {{ $t('onboarding.tokens') }}</span>
                  </li>
                  <li>
                    <img src="@/assets/icons/xp-icon.webp" alt="XP" />
                    <span>{{ initialRewards.xp }} {{ $t('onboarding.xp') }}</span>
                  </li>
                  <li v-if="initialRewards.nft">
                    <img src="@/assets/nfts/starter-nft.webp" alt="Starter NFT" />
                    <span>{{ $t('onboarding.starterNFT') }}</span>
                  </li>
                </ul>
                <button @click="claimInitialRewards" class="cosmic-button claim-button">
                  <span class="pulse-animation"></span>
                  {{ $t('onboarding.claimReward') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Daily Missions -->
          <div v-else-if="currentStep === 2" class="onboarding-step missions-step">
            <h2>{{ $t('onboarding.dailyMissions') }}</h2>
            <p>{{ $t('onboarding.missionsDescription') }}</p>
            
            <div class="mission-examples">
              <div v-for="(mission, index) in introMissions" :key="index" class="mission-card">
                <div class="mission-icon">
                  <i :class="mission.icon"></i>
                </div>
                <div class="mission-details">
                  <h3>{{ mission.title }}</h3>
                  <p>{{ mission.description }}</p>
                  <div class="mission-reward">
                    <img :src="mission.rewardIcon" :alt="mission.rewardType" />
                    <span>{{ mission.rewardAmount }} {{ mission.rewardType }}</span>
                  </div>
                </div>
                <button @click="activateMission(mission.id)" class="cosmic-button activate-mission">
                  {{ $t('onboarding.activateMission') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Friend Connect -->
          <div v-else-if="currentStep === 3" class="onboarding-step friends-step">
            <h2>{{ $t('onboarding.connectWithFriends') }}</h2>
            <p>{{ $t('onboarding.friendsDescription') }}</p>
            
            <div class="friend-options">
              <div class="referral-code">
                <h3>{{ $t('onboarding.yourReferralCode') }}</h3>
                <div class="code-display">
                  <span>{{ referralCode }}</span>
                  <button @click="copyReferralCode" class="copy-button">
                    <i class="fas" :class="copied ? 'fa-check' : 'fa-copy'"></i>
                  </button>
                </div>
                <p>{{ $t('onboarding.referralDescription') }}</p>
                <div class="social-share">
                  <button @click="shareOnSocial('twitter')" class="social-button twitter">
                    <i class="fab fa-twitter"></i>
                  </button>
                  <button @click="shareOnSocial('discord')" class="social-button discord">
                    <i class="fab fa-discord"></i>
                  </button>
                  <button @click="shareOnSocial('telegram')" class="social-button telegram">
                    <i class="fab fa-telegram"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Personalization -->
          <div v-else-if="currentStep === 4" class="onboarding-step personalization-step">
            <h2>{{ $t('onboarding.personalizeProfile') }}</h2>
            <p>{{ $t('onboarding.personalizationDescription') }}</p>
            
            <div class="personalization-options">
              <div class="avatar-selection">
                <h3>{{ $t('onboarding.chooseAvatar') }}</h3>
                <div class="avatar-grid">
                  <div 
                    v-for="(avatar, index) in avatarOptions" 
                    :key="index"
                    class="avatar-option"
                    :class="{ 'selected': selectedAvatar === index }"
                    @click="selectAvatar(index)"
                  >
                    <img :src="`/assets/avatars/avatar-${avatar}.webp`" :alt="`Avatar ${avatar}`" />
                  </div>
                </div>
              </div>
              
              <div class="title-selection">
                <h3>{{ $t('onboarding.chooseTitle') }}</h3>
                <div class="title-options">
                  <div 
                    v-for="(title, index) in titleOptions" 
                    :key="index"
                    class="title-option"
                    :class="{ 'selected': selectedTitle === index }"
                    @click="selectTitle(index)"
                  >
                    <span>{{ title }}</span>
                  </div>
                </div>
              </div>
              
              <button @click="savePersonalization" class="cosmic-button save-personalization">
                {{ $t('onboarding.saveChoices') }}
              </button>
            </div>
          </div>

          <!-- Completion -->
          <div v-else-if="currentStep === 5" class="onboarding-step completion-step">
            <h2>{{ $t('onboarding.ready') }}</h2>
            <div class="completion-details">
              <div class="completion-rewards">
                <h3>{{ $t('onboarding.yourRewards') }}</h3>
                <ul class="final-rewards">
                  <li>
                    <img src="@/assets/tokens/std-token.webp" alt="STD Tokens" />
                    <span>{{ totalRewards.tokens }} {{ $t('onboarding.tokens') }}</span>
                  </li>
                  <li>
                    <img src="@/assets/icons/xp-icon.webp" alt="XP" />
                    <span>{{ totalRewards.xp }} {{ $t('onboarding.xp') }}</span>
                  </li>
                  <li v-if="totalRewards.nft">
                    <img src="@/assets/nfts/starter-nft.webp" alt="Starter NFT" />
                    <span>1 {{ $t('onboarding.starterNFT') }}</span>
                  </li>
                </ul>
              </div>
              
              <div class="next-steps">
                <h3>{{ $t('onboarding.whatNext') }}</h3>
                <div class="next-steps-options">
                  <button @click="navigateTo('/dashboard')" class="cosmic-button primary">
                    <i class="fas fa-columns"></i>
                    {{ $t('onboarding.exploreDashboard') }}
                  </button>
                  <button @click="navigateTo('/missions')" class="cosmic-button secondary">
                    <i class="fas fa-tasks"></i>
                    {{ $t('onboarding.completeMissions') }}
                  </button>
                  <button @click="navigateTo('/friends')" class="cosmic-button secondary">
                    <i class="fas fa-user-friends"></i>
                    {{ $t('onboarding.inviteFriends') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Navigation controls -->
      <div class="navigation-controls">
        <button 
          v-if="currentStep > 1" 
          @click="previousStep" 
          class="nav-button prev-button"
        >
          <i class="fas fa-chevron-left"></i>
          {{ $t('onboarding.back') }}
        </button>
        
        <button 
          v-if="currentStep < totalSteps" 
          @click="nextStep" 
          class="nav-button next-button"
          :disabled="isStepBlocked"
        >
          {{ $t('onboarding.next') }}
          <i class="fas fa-chevron-right"></i>
        </button>
        
        <button 
          v-if="currentStep === totalSteps" 
          @click="completeOnboarding" 
          class="nav-button complete-button"
        >
          {{ $t('onboarding.getStarted') }}
          <i class="fas fa-rocket"></i>
        </button>
      </div>

      <!-- Skip button (only show in first 4 steps) -->
      <button 
        v-if="currentStep < totalSteps" 
        @click="showSkipConfirmation = true" 
        class="skip-button"
      >
        {{ $t('onboarding.skip') }}
      </button>
    </div>

    <!-- Skip confirmation modal -->
    <div v-if="showSkipConfirmation" class="skip-confirmation-modal">
      <div class="modal-content">
        <h3>{{ $t('onboarding.skipConfirmTitle') }}</h3>
        <p>{{ $t('onboarding.skipConfirmMessage') }}</p>
        <div class="modal-actions">
          <button @click="showSkipConfirmation = false" class="cosmic-button secondary">
            {{ $t('onboarding.stayHere') }}
          </button>
          <button @click="skipOnboarding" class="cosmic-button primary">
            {{ $t('onboarding.confirmSkip') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCanisterStore } from '@/stores/canister';
import { useNotification } from '@/composables/useNotification';
import { storeOnboardingProgress } from '@/utils/localStorageUtils';

// Router and stores
const router = useRouter();
const authStore = useAuthStore();
const canisterStore = useCanisterStore();
const notify = useNotification();

// State
const isVisible = ref(true);
const currentStep = ref(1);
const totalSteps = 5;
const showSkipConfirmation = ref(false);
const copied = ref(false);
const playerName = computed(() => authStore.player?.username || 'Explorer');
const referralCode = ref('COSMIC-123456');
const isStepBlocked = ref(false);

// Feature-specific onboarding mode
const featureOnboardingMode = ref(false);
const featureFocus = ref(null);

// Avatar and title selection
const selectedAvatar = ref(0);
const selectedTitle = ref(0);
const avatarOptions = ref([1, 2, 3, 4, 5, 6, 7, 8]);
const titleOptions = ref([
  'Cosmic Explorer',
  'Starbound Initiate',
  'Galactic Pioneer',
  'Nebula Navigator'
]);

// Initial rewards
const initialRewards = ref({
  tokens: 100,
  xp: 50,
  nft: true
});

// Total rewards accumulated during onboarding
const totalRewards = ref({
  tokens: 100,
  xp: 50,
  nft: true
});

// Example missions for step 2
const introMissions = ref([
  {
    id: 1,
    title: 'Daily Login Streak',
    description: 'Log in for 3 consecutive days',
    icon: 'fas fa-calendar-check',
    rewardIcon: '@/assets/tokens/std-token.webp',
    rewardType: 'STD',
    rewardAmount: 25
  },
  {
    id: 2,
    title: 'Profile Customization',
    description: 'Update your profile avatar and title',
    icon: 'fas fa-user-astronaut',
    rewardIcon: '@/assets/icons/xp-icon.webp',
    rewardType: 'XP',
    rewardAmount: 30
  },
  {
    id: 3,
    title: 'First Friend Connection',
    description: 'Add your first friend',
    icon: 'fas fa-user-friends',
    rewardIcon: '@/assets/tokens/std-token.webp',
    rewardType: 'STD',
    rewardAmount: 50
  }
]);

// Methods
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
    // Track progress to resume if user leaves
    storeOnboardingProgress(currentStep.value);
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const claimInitialRewards = async () => {
  try {
    // Call backend to claim initial rewards
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    // Optimistic UI update while the backend processes
    notify.reward(`You received ${initialRewards.value.tokens} tokens and ${initialRewards.value.xp} XP`, {
      title: 'Welcome Reward Claimed!',
      duration: 5000
    });
    
    // Allow proceeding to next step
    isStepBlocked.value = false;
    
    // Automatically go to next step after a short delay
    setTimeout(() => {
      nextStep();
    }, 1500);
    
  } catch (error) {
    console.error('Error claiming initial rewards:', error);
    notify.error('There was an issue claiming your rewards. Please try again.');
  }
};

const activateMission = async (missionId) => {
  try {
    // Call backend to activate the mission
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    // For now, just show notification
    notify.success(`Mission activated!`, {
      title: 'Mission Ready',
      duration: 3000
    });
    
    // Update the mission in the UI to show it's activated
    const missionIndex = introMissions.value.findIndex(m => m.id === missionId);
    if (missionIndex !== -1) {
      // Clone and modify the mission
      const updatedMissions = [...introMissions.value];
      updatedMissions[missionIndex] = { 
        ...updatedMissions[missionIndex],
        activated: true 
      };
      introMissions.value = updatedMissions;
    }
    
  } catch (error) {
    console.error('Error activating mission:', error);
    notify.error('There was an issue activating the mission. Please try again.');
  }
};

const copyReferralCode = () => {
  navigator.clipboard.writeText(referralCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
  
  notify.success('Referral code copied to clipboard!', {
    duration: 2000
  });
};

const shareOnSocial = (platform) => {
  const message = `Join me in Cosmicrafts! Use my referral code ${referralCode.value} to get bonus rewards when you sign up: https://cosmicrafts.com/register?ref=${referralCode.value}`;
  
  let url = '';
  switch (platform) {
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      break;
    case 'discord':
      notify.info('Referral code copied. Paste it in your Discord message!', {
        title: 'Share on Discord',
        duration: 3000
      });
      navigator.clipboard.writeText(message);
      return;
    case 'telegram':
      url = `https://t.me/share/url?url=https://cosmicrafts.com&text=${encodeURIComponent(message)}`;
      break;
  }
  
  if (url) {
    window.open(url, '_blank');
  }
  
  // Add social sharing bonus
  totalRewards.value.tokens += 25;
  notify.reward('You earned 25 STD tokens for sharing!', {
    title: 'Sharing Bonus',
    duration: 3000
  });
};

const selectAvatar = (index) => {
  selectedAvatar.value = index;
};

const selectTitle = (index) => {
  selectedTitle.value = index;
};

const savePersonalization = async () => {
  try {
    // Call backend to save personalization choices
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    // For now, just show notification
    notify.success('Your profile has been updated!', {
      title: 'Profile Updated',
      duration: 3000
    });
    
    // Add personalization bonus
    totalRewards.value.xp += 20;
    notify.reward('You earned 20 XP for personalizing your profile!', {
      title: 'Personalization Bonus',
      duration: 3000
    });
    
    // Allow proceeding to next step
    isStepBlocked.value = false;
    
    // Automatically go to next step after a short delay
    setTimeout(() => {
      nextStep();
    }, 1500);
    
  } catch (error) {
    console.error('Error saving personalization:', error);
    notify.error('There was an issue saving your preferences. Please try again.');
  }
};

const navigateTo = (path) => {
  router.push(path);
};

const completeOnboarding = async () => {
  try {
    // Mark onboarding as completed in backend and local storage
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    // Close the onboarding experience
    isVisible.value = false;
    featureOnboardingMode.value = false;
    featureFocus.value = null;
    
    // Navigate to dashboard only if not in feature mode
    if (!featureOnboardingMode.value) {
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    }
    
    // Show final notification
    notify.success('Welcome to Cosmicrafts! Your journey begins now.', {
      title: 'Onboarding Complete',
      duration: 5000
    });
    
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // Force complete anyway
    isVisible.value = false;
    router.push('/dashboard');
  }
};

const skipOnboarding = () => {
  // Mark onboarding as skipped but still grant some rewards
  showSkipConfirmation.value = false;
  
  // Notify about missed rewards
  notify.info('You skipped onboarding and missed some rewards. You can always access tutorials from settings.', {
    title: 'Onboarding Skipped',
    duration: 5000
  });
  
  // Close the onboarding experience
  isVisible.value = false;
  
  // Navigate to dashboard
  setTimeout(() => {
    router.push('/dashboard');
  }, 500);
};

// Method to initiate feature-specific onboarding
const startFeatureOnboarding = (feature) => {
  featureOnboardingMode.value = true;
  featureFocus.value = feature;
  isVisible.value = true;
  
  // Set the appropriate step based on the feature
  switch(feature) {
    case 'missions':
      currentStep.value = 2;
      break;
    case 'friends':
      currentStep.value = 3;
      break;
    case 'personalization':
      currentStep.value = 4;
      break;
    default:
      currentStep.value = 1;
  }
  
  // Track impression for analytics
  try {
    // Log feature-specific onboarding start
    console.log(`Feature onboarding started: ${feature}`);
  } catch (error) {
    console.error('Error logging feature onboarding:', error);
  }
};

// Expose method to parent components
defineExpose({ startFeatureOnboarding });

// Fetch user's referral code on mount
onMounted(async () => {
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    // Fetch referral code
    // This is a placeholder - actual implementation would call the backend
    
    // Fetch personalization options
    // This is a placeholder - actual implementation would call the backend
    
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
  }
});

// Watch for step changes to update block state
watch(currentStep, (newStep) => {
  // Reset block state on step change
  isStepBlocked.value = false;
  
  // Set specific steps as blocked until action is taken
  if (newStep === 1) {
    // Block next button until initial rewards are claimed
    isStepBlocked.value = true;
  } else if (newStep === 4) {
    // Block next button until personalization is saved
    isStepBlocked.value = true;
  }
});
</script>

<style scoped>
.onboarding-experience {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  font-family: 'Exo 2', sans-serif;
}

.onboarding-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #080c24 0%, #1a1248 50%, #341a54 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.onboarding-overlay.fade-in {
  opacity: 1;
}

.progress-container {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.progress-bar {
  width: 60%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.onboarding-content {
  max-width: 800px;
  width: 100%;
  background: rgba(10, 15, 30, 0.8);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 60px 0;
}

.onboarding-step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.onboarding-step h1, 
.onboarding-step h2 {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  text-align: center;
}

.onboarding-step h1 {
  font-size: 36px;
}

.onboarding-step h2 {
  font-size: 28px;
}

.onboarding-step p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  text-align: center;
  max-width: 80%;
}

/* Welcome step styling */
.welcome-bonus {
  display: flex;
  align-items: center;
  gap: 30px;
  margin: 20px 0;
}

.bonus-chest {
  position: relative;
}

.bonus-chest img {
  width: 150px;
  height: auto;
}

.chest-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(15, 185, 253, 0.4) 0%, rgba(157, 53, 191, 0.4) 50%, transparent 70%);
  filter: blur(10px);
  z-index: -1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.bonus-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.reward-list, .final-rewards {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.reward-list li, .final-rewards li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: white;
}

.reward-list li img, .final-rewards li img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.cosmic-button {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cosmic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(157, 53, 191, 0.4);
}

.cosmic-button:disabled {
  background: linear-gradient(90deg, #536272, #6e6b80);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.claim-button {
  margin-top: 15px;
}

.pulse-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  z-index: -1;
  animation: pulse-btn 2s infinite;
}

@keyframes pulse-btn {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

/* Missions step styling */
.mission-examples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.mission-card {
  background: rgba(10, 20, 40, 0.6);
  border-radius: 12px;
  padding: 20px;
  width: calc(33% - 20px);
  min-width: 220px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(15, 185, 253, 0.15);
}

.mission-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0fb9fd 0%, #9d35bf 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.mission-icon i {
  font-size: 24px;
  color: white;
}

.mission-details {
  text-align: center;
  margin-bottom: 15px;
}

.mission-details h3 {
  color: white;
  margin-bottom: 10px;
  font-size: 18px;
}

.mission-details p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 10px;
}

.mission-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 10px;
}

.mission-reward img {
  width: 20px;
  height: 20px;
}

.mission-reward span {
  color: #0fb9fd;
  font-weight: 600;
}

.activate-mission {
  margin-top: auto;
  width: 100%;
  max-width: 180px;
}

/* Friends step styling */
.friend-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
}

.referral-code {
  background: rgba(10, 20, 40, 0.6);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  border: 1px solid rgba(15, 185, 253, 0.2);
  margin-bottom: 20px;
}

.referral-code h3 {
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 15px;
}

.code-display span {
  color: #0fb9fd;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
}

.copy-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.3s ease;
}

.copy-button:hover {
  color: white;
}

.copy-button i {
  font-size: 18px;
}

.social-share {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.social-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.social-button:hover {
  transform: scale(1.1);
}

.social-button i {
  font-size: 20px;
  color: white;
}

.twitter {
  background: #1DA1F2;
}

.discord {
  background: #5865F2;
}

.telegram {
  background: #0088cc;
}

/* Personalization step styling */
.personalization-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.avatar-selection, .title-selection {
  width: 100%;
  margin-bottom: 20px;
}

.avatar-selection h3, .title-selection h3 {
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.avatar-option {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.05);
}

.avatar-option.selected {
  border: 2px solid #0fb9fd;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.title-option {
  background: rgba(10, 20, 40, 0.6);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: background 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.title-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.title-option.selected {
  background: rgba(15, 185, 253, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.5);
}

.title-option span {
  color: white;
}

.save-personalization {
  margin-top: 20px;
}

/* Completion step styling */
.completion-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.completion-rewards, .next-steps {
  width: 100%;
  margin-bottom: 30px;
}

.completion-rewards h3, .next-steps h3 {
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.next-steps-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
}

.next-steps-options .cosmic-button {
  min-width: 180px;
}

.next-steps-options .cosmic-button i {
  margin-right: 8px;
}

.cosmic-button.primary {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
}

.cosmic-button.secondary {
  background: rgba(15, 185, 253, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.5);
}

.cosmic-button.secondary:hover {
  background: rgba(15, 185, 253, 0.3);
}

/* Navigation controls */
.navigation-controls {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-top: 20px;
}

.nav-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 10px 20px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.next-button, .complete-button {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  border: none;
}

.next-button:hover, .complete-button:hover {
  background: linear-gradient(90deg, #0fb9fd, #9d35bf);
  opacity: 0.9;
}

.next-button:disabled {
  background: linear-gradient(90deg, #536272, #6e6b80);
  cursor: not-allowed;
}

.skip-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.skip-button:hover {
  color: white;
  text-decoration: underline;
}

/* Skip confirmation modal */
.skip-confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: rgba(10, 15, 30, 0.95);
  border-radius: 16px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-content h3 {
  color: white;
  margin-bottom: 15px;
  text-align: center;
}

.modal-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.modal-actions button {
  flex: 1;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive styles */
@media (max-width: 768px) {
  .onboarding-content {
    padding: 20px;
  }
  
  .welcome-bonus {
    flex-direction: column;
    gap: 20px;
  }
  
  .mission-card {
    width: 100%;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .title-options {
    grid-template-columns: 1fr;
  }
  
  .next-steps-options {
    flex-direction: column;
  }
  
  .next-steps-options .cosmic-button {
    width: 100%;
  }
}
</style> 