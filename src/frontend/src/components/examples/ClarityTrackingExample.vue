<template>
  <div class="clarity-example">
    <h3>Microsoft Clarity Tracking Examples</h3>
    
    <!-- Game Actions -->
    <div class="tracking-section">
      <h4>🎮 Game Actions</h4>
      <button @click="trackGameAction" class="btn btn-primary">
        Track Level Completed
      </button>
      <button @click="trackChestOpened" class="btn btn-secondary">
        Track Chest Opened
      </button>
    </div>

    <!-- NFT Interactions -->
    <div class="tracking-section">
      <h4>🪙 NFT Interactions</h4>
      <button @click="trackNFTInteraction" class="btn btn-primary">
        Track NFT Purchase
      </button>
      <button @click="trackStaking" class="btn btn-secondary">
        Track Staking Action
      </button>
    </div>

    <!-- DAO Governance -->
    <div class="tracking-section">
      <h4>🗳️ DAO Governance</h4>
      <button @click="trackVote" class="btn btn-primary">
        Track Proposal Vote
      </button>
      <button @click="trackProposal" class="btn btn-secondary">
        Track Proposal Created
      </button>
    </div>

    <!-- Wallet Actions -->
    <div class="tracking-section">
      <h4>💼 Wallet Actions</h4>
      <button @click="trackWalletConnection" class="btn btn-primary">
        Track Wallet Connect
      </button>
      <button @click="trackTransaction" class="btn btn-secondary">
        Track Transaction
      </button>
    </div>

    <!-- User Engagement -->
    <div class="tracking-section">
      <h4>👤 User Engagement</h4>
      <button @click="trackUserEngagement" class="btn btn-primary">
        Track Engagement
      </button>
      <button @click="trackError" class="btn btn-danger">
        Track Error (Test)
      </button>
    </div>

    <!-- Custom Tags -->
    <div class="tracking-section">
      <h4>🏷️ Custom Tags</h4>
      <button @click="setUserTag" class="btn btn-primary">
        Set User Tag
      </button>
      <button @click="upgradeSession" class="btn btn-secondary">
        Upgrade Session
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import clarityService from '@/services/clarity';

// Game Actions
const trackGameAction = () => {
  clarityService.trackGameAction('level_completed', {
    level: 5,
    score: 1500,
    time_spent: 120,
    difficulty: 'hard'
  });
  console.log('🎮 Tracked: Level completed');
};

const trackChestOpened = () => {
  clarityService.trackNFTInteraction('chest_opened', {
    chest_type: 'cosmic_cache',
    rarity: 'legendary',
    cost: 100,
    rewards: ['nft', 'tokens', 'experience']
  });
  console.log('🪙 Tracked: Chest opened');
};

// NFT Interactions
const trackNFTInteraction = () => {
  clarityService.trackNFTInteraction('nft_purchased', {
    nft_id: 'cosmic_ship_001',
    price: 50,
    currency: 'ICP',
    collection: 'Cosmicrafts Ships'
  });
  console.log('🪙 Tracked: NFT purchased');
};

const trackStaking = () => {
  clarityService.trackNFTInteraction('staking_action', {
    action: 'stake',
    amount: 1000,
    token: 'COSMIC',
    duration: '30_days'
  });
  console.log('🪙 Tracked: Staking action');
};

// DAO Governance
const trackVote = () => {
  clarityService.trackGovernanceAction('proposal_voted', {
    proposal_id: 'PROP_001',
    vote: 'yes',
    voting_power: 100,
    proposal_title: 'Add new game feature'
  });
  console.log('🗳️ Tracked: Proposal vote');
};

const trackProposal = () => {
  clarityService.trackGovernanceAction('proposal_created', {
    proposal_id: 'PROP_002',
    title: 'Community treasury allocation',
    category: 'treasury',
    requested_amount: 5000
  });
  console.log('🗳️ Tracked: Proposal created');
};

// Wallet Actions
const trackWalletConnection = () => {
  clarityService.trackWalletConnection('plug_wallet', true);
  console.log('💼 Tracked: Wallet connection');
};

const trackTransaction = () => {
  clarityService.trackEvent('transaction_completed', {
    type: 'token_transfer',
    amount: 100,
    currency: 'ICP',
    recipient: 'user123',
    success: true
  });
  console.log('💼 Tracked: Transaction completed');
};

// User Engagement
const trackUserEngagement = () => {
  clarityService.trackEngagement('feature_explored', 300);
  console.log('👤 Tracked: User engagement');
};

const trackError = () => {
  const testError = new Error('Test error for Clarity tracking');
  clarityService.trackError(testError, {
    component: 'ClarityTrackingExample',
    user_action: 'test_error_button'
  });
  console.log('❌ Tracked: Test error');
};

// Custom Tags
const setUserTag = () => {
  clarityService.setTag('user_type', 'premium');
  clarityService.setTag('game_level', 'expert');
  clarityService.setTag('preferences', ['dark_mode', 'mobile_user']);
  console.log('🏷️ Set custom tags');
};

const upgradeSession = () => {
  clarityService.upgradeSession('high_value_user_interaction');
  console.log('⭐ Upgraded session');
};

// Initialize user identification on component mount
onMounted(() => {
  // Identify user for better tracking
  clarityService.identifyUser(
    'user_123', // User ID
    'session_456', // Session ID
    'dashboard_page', // Page ID
    'Cosmic Player' // Friendly name
  );
  
  // Set initial tags
  clarityService.setTag('page_type', 'example');
  clarityService.setTag('user_segment', 'developer');
});
</script>

<style scoped>
.clarity-example {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.tracking-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  background: var(--color-surface-secondary);
}

.tracking-section h4 {
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.btn {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background: var(--color-primary);
}

.btn-secondary {
  background: var(--color-secondary);
}

.btn-danger {
  background: var(--color-error);
}
</style>
