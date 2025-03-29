<template>
  <div v-if="isVisible" class="comeback-bonus-card cosmic-panel">
    <div class="comeback-header">
      <h3>{{ $t('comebackBonus.welcome_back') || 'Welcome Back!' }}</h3>
      <div class="absence-counter">
        <span>{{ daysAbsent }} {{ $t('comebackBonus.days_away') || 'days away' }}</span>
      </div>
    </div>

    <div class="comeback-message">
      <p>{{ $t('comebackBonus.missed_you') || 'We missed you! Here\'s a special bonus to help you get back into the action:' }}</p>
    </div>

    <div class="rewards-container">
      <div v-for="(reward, index) in comebackRewards" :key="index" class="reward-item">
        <div class="reward-icon">
          <img :src="reward.icon" :alt="reward.type" />
        </div>
        <div class="reward-details">
          <span class="reward-amount">{{ reward.amount }}</span>
          <span class="reward-type">{{ reward.type }}</span>
        </div>
      </div>
    </div>

    <div class="bonus-actions">
      <button 
        @click="claimComebackBonus" 
        class="claim-button cosmic-button"
        :disabled="isProcessing"
      >
        <i class="fas fa-gift"></i>
        {{ $t('comebackBonus.claim_bonus') || 'Claim Bonus' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCanisterStore } from '@/stores/canister';
import { useNotification } from '@/composables/useNotification';

// Get stores & notifications
const authStore = useAuthStore();
const canisterStore = useCanisterStore();
const notify = useNotification();

// State
const isVisible = ref(false);
const isProcessing = ref(false);
const daysAbsent = ref(0);
const comebackRewards = ref([]);

// Minimum days away to trigger comeback bonus
const MINIMUM_ABSENCE_DAYS = 3;
// Maximum days to consider for scaling rewards
const MAX_SCALING_DAYS = 30;
// Date of last login from localStorage
const LAST_LOGIN_KEY = 'lastLoginDate';
// Record of claimed comeback bonuses
const CLAIMED_COMEBACK_KEY = 'claimedComebackBonuses';

// Calculate bonus based on days absent
const calculateBonus = (days) => {
  // Base rewards
  const baseTokens = 50;
  const baseXP = 25;
  
  // Cap the scaling factor at MAX_SCALING_DAYS
  const effectiveDays = Math.min(days, MAX_SCALING_DAYS);
  
  // Scale bonuses based on absence duration
  const scaleFactor = 1 + (effectiveDays / 15); // Increase by up to 3x for 30 days
  
  return [
    {
      type: 'STD',
      amount: Math.round(baseTokens * scaleFactor),
      icon: '/assets/tokens/std-token.webp'
    },
    {
      type: 'XP',
      amount: Math.round(baseXP * scaleFactor),
      icon: '/assets/icons/xp-icon.webp'
    },
    // Add special item for longer absences
    ...(days >= 14 ? [{
      type: 'Energy',
      amount: Math.round(5 * (days / 7)),
      icon: '/assets/icons/energy-icon.webp'
    }] : [])
  ];
};

// Load and check for comeback bonus eligibility
const checkComebackBonus = () => {
  try {
    const lastLoginStr = localStorage.getItem(LAST_LOGIN_KEY);
    const claimedStr = localStorage.getItem(CLAIMED_COMEBACK_KEY);
    const claimed = claimedStr ? JSON.parse(claimedStr) : [];
    
    // Get current date and last login date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // No previous login recorded, store current date and exit
    if (!lastLoginStr) {
      localStorage.setItem(LAST_LOGIN_KEY, today.toString());
      return;
    }
    
    // Calculate days since last login
    const lastLogin = new Date(parseInt(lastLoginStr));
    const timeDiff = today - lastLogin.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    // Check if eligible for comeback bonus
    if (daysDiff >= MINIMUM_ABSENCE_DAYS) {
      // Check if already claimed for this comeback
      const hasClaimedThisComeback = claimed.includes(today);
      
      if (!hasClaimedThisComeback) {
        daysAbsent.value = daysDiff;
        comebackRewards.value = calculateBonus(daysDiff);
        isVisible.value = true;
      }
    }
    
    // Always update the last login date
    localStorage.setItem(LAST_LOGIN_KEY, today.toString());
    
  } catch (error) {
    console.error('Error checking comeback bonus:', error);
  }
};

// Claim the comeback bonus
const claimComebackBonus = async () => {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  
  try {
    // In a real implementation, this would call the backend
    // For now we'll use localStorage to simulate
    
    // Record this claim
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const claimedStr = localStorage.getItem(CLAIMED_COMEBACK_KEY);
    const claimed = claimedStr ? JSON.parse(claimedStr) : [];
    
    claimed.push(today);
    localStorage.setItem(CLAIMED_COMEBACK_KEY, JSON.stringify(claimed));
    
    // Apply rewards (mock implementation)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Show reward notification
    for (const reward of comebackRewards.value) {
      notify.reward(`You received ${reward.amount} ${reward.type}!`, {
        title: 'Comeback Bonus',
        duration: 3000
      });
      
      // Wait a bit between notifications
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Hide the card
    isVisible.value = false;
    
    // Emit event
    emit('bonus-claimed', {
      daysAbsent: daysAbsent.value,
      rewards: comebackRewards.value
    });
    
  } catch (error) {
    console.error('Error claiming comeback bonus:', error);
    notify.error('There was an issue claiming your bonus. Please try again.', {
      duration: 3000
    });
  } finally {
    isProcessing.value = false;
  }
};

// Mock function to simulate absence for testing
const simulateAbsence = (days) => {
  const mockLastLogin = new Date();
  mockLastLogin.setDate(mockLastLogin.getDate() - days);
  localStorage.setItem(LAST_LOGIN_KEY, mockLastLogin.getTime().toString());
  
  // Clear any previously claimed bonuses
  localStorage.removeItem(CLAIMED_COMEBACK_KEY);
  
  // Check again
  checkComebackBonus();
};

// Expose methods for testing/debugging
defineExpose({
  simulateAbsence
});

// Define emits
const emit = defineEmits(['bonus-claimed']);

// Check for comeback bonus on mount
onMounted(() => {
  checkComebackBonus();
});
</script>

<style scoped>
.comeback-bonus-card {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(10, 15, 30, 0.7) 0%, rgba(86, 30, 189, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slide-up 0.5s ease-out;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.comeback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.comeback-header h3 {
  font-size: 1.4rem;
  color: white;
  margin: 0;
  background: linear-gradient(90deg, #ffac33, #ff7e33);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.absence-counter {
  background: rgba(255, 172, 51, 0.2);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.9rem;
  color: #ffac33;
  font-weight: 600;
}

.comeback-message p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  font-size: 1rem;
}

.rewards-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 15px;
  min-width: 80px;
}

.reward-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reward-icon img {
  width: 100%;
  height: auto;
}

.reward-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffac33;
}

.reward-type {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.bonus-actions {
  display: flex;
  justify-content: center;
}

.claim-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 25px;
  border-radius: 30px;
  background: linear-gradient(90deg, #ffac33, #ff7e33);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.claim-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 172, 51, 0.3);
}

.claim-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.claim-button i {
  font-size: 1.1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .comeback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .absence-counter {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .rewards-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .reward-item {
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    padding: 10px 15px;
  }
  
  .reward-icon {
    margin-bottom: 0;
  }
  
  .reward-details {
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
}
</style> 