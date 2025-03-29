<template>
  <div class="referral-card cosmic-panel">
    <div class="referral-card-content">
      <div class="referral-header">
        <div class="icon-wrapper">
          <i class="fas fa-link"></i>
        </div>
        <h3>Your Referral Code</h3>
      </div>
      
      <div class="referral-code-display">
        <span class="code">{{ referralCode || 'Loading...' }}</span>
      </div>
      
      <div class="referral-stats">
        <div class="stat">
          <span class="value">{{ directReferrals.length }}</span>
          <span class="label">Direct</span>
        </div>
        <div class="stat">
          <span class="value">{{ indirectReferrals.length }}</span>
          <span class="label">Indirect</span>
        </div>
        <div class="stat">
          <span class="value">{{ totalReferrals }}</span>
          <span class="label">Total</span>
        </div>
      </div>
      
      <p class="referral-info">Share your code to earn bonus multipliers for you and your referrals.</p>
      
      <div class="referral-actions">
        <button class="cosmic-button cosmic-button-primary" @click="copyReferralCode">
          <i class="fas fa-copy"></i>
          <span class="button-text">{{ copied ? 'Copied!' : 'Copy Code' }}</span>
          <div class="button-particles"></div>
          <div class="button-glow"></div>
        </button>
        <button class="cosmic-button cosmic-button-outline-primary" @click="shareReferralCode">
          <i class="fas fa-share-alt"></i>
          <span class="button-text">Share</span>
          <div class="button-particles"></div>
          <div class="button-glow"></div>
        </button>
      </div>
    </div>
    <div class="referral-card-decoration">
      <div class="referral-particles particle-1"></div>
      <div class="referral-particles particle-2"></div>
      <div class="referral-particles particle-3"></div>
      <div class="referral-glow"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  referralCode: {
    type: String,
    default: ''
  },
  directReferrals: {
    type: Array,
    default: () => []
  },
  indirectReferrals: {
    type: Array,
    default: () => []
  },
  beyondReferrals: {
    type: Array,
    default: () => []
  }
});

const emits = defineEmits(['copy', 'share']);

const copied = ref(false);

const totalReferrals = computed(() => {
  return props.directReferrals.length + props.indirectReferrals.length + props.beyondReferrals.length;
});

const copyReferralCode = async () => {
  if (!props.referralCode) {
    console.warn('No referral code available to copy');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(props.referralCode);
    copied.value = true;
    emits('copy', props.referralCode);
    
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy referral code:', error);
    // Fallback for browsers that don't support clipboard API
    fallbackCopy(props.referralCode);
  }
};

// Fallback copy method for browsers without clipboard API
const fallbackCopy = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      copied.value = true;
      emits('copy', text);
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textArea);
};

const shareReferralCode = () => {
  if (!props.referralCode) {
    console.warn('No referral code available to share');
    return;
  }
  
  // Generate share URL
  const shareUrl = `${window.location.origin}/join?ref=${props.referralCode}`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: 'Join CosmicCrafts',
      text: 'Join me on CosmicCrafts! Use my referral code to get started.',
      url: shareUrl
    })
    .then(() => emits('share', shareUrl))
    .catch(error => {
      console.error('Error sharing:', error);
      // Fallback to copy on share error
      copyReferralCode();
    });
  } else {
    // Fallback to copy
    copyReferralCode();
  }
};

onMounted(() => {
  // Any initialization logic if needed
});
</script>

<style scoped>
.referral-card {
  position: relative;
  overflow: hidden;
  padding: 1.75rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  transition: all var(--cosmic-transition-medium);
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.referral-card:hover {
  transform: translateY(-5px) translateZ(5px);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
}

.referral-card-content {
  position: relative;
  z-index: 2;
}

.referral-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, rgba(15, 185, 253, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  box-shadow: var(--cosmic-glow-blue-sm);
  border: 1px solid rgba(15, 185, 253, 0.2);
}

.icon-wrapper i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.referral-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.referral-code-display {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: var(--cosmic-shadow-sm);
}

.referral-code-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(15, 185, 253, 0.05) 0%, 
    rgba(15, 185, 253, 0.1) 50%, 
    rgba(15, 185, 253, 0.05) 100%);
  opacity: 0;
  transition: opacity var(--cosmic-transition-medium);
  z-index: -1;
}

.referral-card:hover .referral-code-display::before {
  opacity: 1;
}

.code {
  font-family: 'Courier New', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

.referral-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.03);
  transition: all var(--cosmic-transition-fast);
}

.stat:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-3px);
}

.stat:not(:last-child) {
  margin-right: 0.75rem;
}

.stat .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cosmic-blue);
  margin-bottom: 0.25rem;
  text-shadow: var(--cosmic-glow-blue-sm);
}

.stat .label {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.referral-info {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.5;
}

.referral-actions {
  display: flex;
  gap: 1rem;
}

.referral-actions button {
  flex: 1;
}

.referral-card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.referral-particles {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.5);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
}

.particle-1 {
  top: 20%;
  right: 15%;
  animation: floating 8s ease-in-out infinite;
}

.particle-2 {
  bottom: 25%;
  right: 30%;
  animation: floating 6s ease-in-out infinite 1s;
}

.particle-3 {
  top: 60%;
  left: 10%;
  animation: floating 7s ease-in-out infinite 2s;
}

.referral-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 20%, rgba(15, 185, 253, 0.15) 0%, transparent 60%);
  opacity: 0;
  transition: opacity var(--cosmic-transition-medium);
}

.referral-card:hover .referral-glow {
  opacity: 1;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(5px) translateX(10px);
  }
  75% {
    transform: translateY(10px) translateX(-5px);
  }
}

@media (max-width: 600px) {
  .referral-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat:not(:last-child) {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .referral-actions {
    flex-direction: column;
  }
}
</style> 