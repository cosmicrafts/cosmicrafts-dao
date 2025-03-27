<template>
  <div class="referrals-section">
    <div class="section-header">
      <h2>Referral Program</h2>
      <p class="section-description">
        Refer friends to increase your multiplier and earn bonus rewards!
      </p>
    </div>
    
    <div class="referrals-grid">
      <!-- Referral Code Card -->
      <div class="grid-item referral-code-item">
        <ReferralCard 
          :referral-code="referralCode"
          :direct-referrals="directReferrals"
          :indirect-referrals="indirectReferrals"
          :beyond-referrals="beyondReferrals"
          @copy="handleCopy"
          @share="handleShare"
        />
      </div>
      
      <!-- Multiplier Chart -->
      <div class="grid-item multiplier-chart-item">
        <MultiplierChart 
          :current-multiplier="playerMultiplier"
          :multiplier-history="multiplierHistory"
          :direct-referrals="directReferrals"
          :indirect-referrals="indirectReferrals"
          :beyond-referrals="beyondReferrals"
        />
      </div>
      
      <!-- Referral Network Tree -->
      <div class="grid-item referral-network-item">
        <ReferralNetwork 
          :direct-referrals="directReferrals"
          :indirect-referrals="indirectReferrals"
          :beyond-referrals="beyondReferrals"
          :player-info="playerInfo"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ReferralCard from './ReferralCard.vue';
import MultiplierChart from './MultiplierChart.vue';
import ReferralNetwork from './ReferralNetwork.vue';

// Refs
const loading = ref(true);
const referralCode = ref('');
const directReferrals = ref([]);
const indirectReferrals = ref([]);
const beyondReferrals = ref([]);
const playerMultiplier = ref(1.0);
const multiplierHistory = ref([]);

// Auth store
const authStore = useAuthStore();

// Player info
const playerInfo = computed(() => {
  return {
    username: authStore.player?.username || 'You',
    id: authStore.player?.id || '',
    avatar: authStore.player?.avatar || 1
  };
});

// Methods
const fetchReferralData = async () => {
  loading.value = true;
  
  try {
    // Get all data in parallel
    await Promise.allSettled([
      fetchReferralCode(),
      fetchDirectReferrals(),
      fetchIndirectReferrals(),
      fetchBeyondReferrals(),
      fetchPlayerMultiplier()
    ]);
    
    // Generate mock multiplier history if needed
    if (multiplierHistory.value.length === 0) {
      generateMockMultiplierHistory();
    }
  } catch (error) {
    console.error('Error fetching referral data:', error);
    // We already have mock data initialized, so no need for fallback here
  } finally {
    loading.value = false;
  }
};

const fetchReferralCode = async () => {
  try {
    const identity = authStore.getIdentity();
    if (!identity) return;
    
    const principal = identity.getPrincipal();
    
    // Get canister
    const canisterStore = await import('@/stores/canister').then(m => m.useCanisterStore());
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    if (!cosmicrafts) throw new Error('Canister not initialized');
    
    // Get referral code
    const code = await cosmicrafts.getReferralCode(principal);
    
    if (code && code.length) {
      referralCode.value = code[0];
    } else {
      // Generate a mock referral code if none exists
      referralCode.value = generateMockReferralCode();
    }
  } catch (error) {
    console.error('Error fetching referral code:', error);
    // Fallback to mock code
    referralCode.value = generateMockReferralCode();
  }
};

const fetchDirectReferrals = async () => {
  try {
    const identity = authStore.getIdentity();
    if (!identity) return;
    
    const principal = identity.getPrincipal();
    
    // Get canister
    const canisterStore = await import('@/stores/canister').then(m => m.useCanisterStore());
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    if (!cosmicrafts) throw new Error('Canister not initialized');
    
    // Get direct referrals
    const refs = await cosmicrafts.getDirectReferrals(principal);
    
    if (refs && refs.length) {
      // Fetch each player's details
      const referralDetails = await Promise.all(
        refs.map(async (refId) => {
          try {
            const player = await cosmicrafts.getProfile(refId);
            if (player && player.length && player[0]) {
              return {
                id: refId.toString(),
                username: player[0].username || 'Unknown',
                avatar: player[0].avatar || 1,
                level: player[0].level || 1,
                referrals: 0 // Will be updated later
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching referral profile for ${refId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls
      directReferrals.value = referralDetails.filter(Boolean);
    } else {
      // Use mock data for development
      directReferrals.value = generateMockDirectReferrals();
    }
  } catch (error) {
    console.error('Error fetching direct referrals:', error);
    // Fallback to mock data
    directReferrals.value = generateMockDirectReferrals();
  }
};

const fetchIndirectReferrals = async () => {
  try {
    const identity = authStore.getIdentity();
    if (!identity) return;
    
    const principal = identity.getPrincipal();
    
    // Get canister
    const canisterStore = await import('@/stores/canister').then(m => m.useCanisterStore());
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    if (!cosmicrafts) throw new Error('Canister not initialized');
    
    // Get indirect referrals
    const refs = await cosmicrafts.getIndirectReferrals(principal);
    
    if (refs && refs.length) {
      // For each indirect referral, find their referrer from direct referrals
      const indirectDetails = await Promise.all(
        refs.map(async (refId) => {
          try {
            const player = await cosmicrafts.getProfile(refId);
            const referrer = await cosmicrafts.getReferrer(refId);
            
            if (player && player.length && player[0]) {
              return {
                id: refId.toString(),
                username: player[0].username || 'Unknown',
                avatar: player[0].avatar || 1,
                level: player[0].level || 1,
                referrerId: referrer && referrer.length ? referrer[0].toString() : null,
                referrals: 0
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching indirect referral profile for ${refId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls
      indirectReferrals.value = indirectDetails.filter(Boolean);
    } else {
      // Use mock data for development
      indirectReferrals.value = generateMockIndirectReferrals();
    }
  } catch (error) {
    console.error('Error fetching indirect referrals:', error);
    // Fallback to mock data
    indirectReferrals.value = generateMockIndirectReferrals();
  }
};

const fetchBeyondReferrals = async () => {
  try {
    const identity = authStore.getIdentity();
    if (!identity) return;
    
    const principal = identity.getPrincipal();
    
    // Get canister
    const canisterStore = await import('@/stores/canister').then(m => m.useCanisterStore());
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    if (!cosmicrafts) throw new Error('Canister not initialized');
    
    // Get beyond referrals
    const refs = await cosmicrafts.getBeyondReferrals(principal);
    
    if (refs && refs.length) {
      // For each beyond referral, find their referrer from indirect referrals
      const beyondDetails = await Promise.all(
        refs.map(async (refId) => {
          try {
            const player = await cosmicrafts.getProfile(refId);
            const referrer = await cosmicrafts.getReferrer(refId);
            
            if (player && player.length && player[0]) {
              return {
                id: refId.toString(),
                username: player[0].username || 'Unknown',
                avatar: player[0].avatar || 1,
                level: player[0].level || 1,
                referrerId: referrer && referrer.length ? referrer[0].toString() : null,
                referrals: 0
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching beyond referral profile for ${refId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out nulls
      beyondReferrals.value = beyondDetails.filter(Boolean);
    } else {
      // Use mock data for development
      beyondReferrals.value = generateMockBeyondReferrals();
    }
  } catch (error) {
    console.error('Error fetching beyond referrals:', error);
    // Fallback to mock data
    beyondReferrals.value = generateMockBeyondReferrals();
  }
};

const fetchPlayerMultiplier = async () => {
  try {
    const identity = authStore.getIdentity();
    if (!identity) return;
    
    const principal = identity.getPrincipal();
    
    // Get canister
    const canisterStore = await import('@/stores/canister').then(m => m.useCanisterStore());
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    
    if (!cosmicrafts) throw new Error('Canister not initialized');
    
    // Get player multiplier
    const multiplier = await cosmicrafts.getMultiplier(principal);
    
    if (multiplier !== undefined) {
      playerMultiplier.value = Number(multiplier);
    } else {
      // Calculate a mock multiplier based on referrals
      playerMultiplier.value = calculateMockMultiplier();
    }
  } catch (error) {
    console.error('Error fetching player multiplier:', error);
    // Fallback to calculated multiplier
    playerMultiplier.value = calculateMockMultiplier();
  }
};

// Mock data generators
const generateMockReferralCode = () => {
  // Generate a random 8-character code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateMockDirectReferrals = () => {
  // Return 2-5 mock direct referrals
  const count = 2 + Math.floor(Math.random() * 4);
  const refs = [];
  
  for (let i = 0; i < count; i++) {
    refs.push({
      id: `d${i}-${Date.now()}`,
      username: `DirectRef${i+1}`,
      avatar: Math.floor(Math.random() * 12) + 1,
      level: Math.floor(Math.random() * 10) + 1,
      referrals: Math.floor(Math.random() * 3)
    });
  }
  
  return refs;
};

const generateMockIndirectReferrals = () => {
  // Return 3-8 mock indirect referrals
  const count = 3 + Math.floor(Math.random() * 6);
  const refs = [];
  
  if (directReferrals.value.length === 0) return refs;
  
  for (let i = 0; i < count; i++) {
    // Assign a random direct referral as the referrer
    const referrerId = directReferrals.value[Math.floor(Math.random() * directReferrals.value.length)].id;
    
    refs.push({
      id: `i${i}-${Date.now()}`,
      username: `IndirectRef${i+1}`,
      avatar: Math.floor(Math.random() * 12) + 1,
      level: Math.floor(Math.random() * 8) + 1,
      referrerId,
      referrals: Math.floor(Math.random() * 2)
    });
  }
  
  return refs;
};

const generateMockBeyondReferrals = () => {
  // Return 0-5 mock beyond referrals
  const count = Math.floor(Math.random() * 6);
  const refs = [];
  
  if (indirectReferrals.value.length === 0) return refs;
  
  for (let i = 0; i < count; i++) {
    // Assign a random indirect referral as the referrer
    const referrerId = indirectReferrals.value[Math.floor(Math.random() * indirectReferrals.value.length)].id;
    
    refs.push({
      id: `b${i}-${Date.now()}`,
      username: `BeyondRef${i+1}`,
      avatar: Math.floor(Math.random() * 12) + 1,
      level: Math.floor(Math.random() * 6) + 1,
      referrerId,
      referrals: 0
    });
  }
  
  return refs;
};

const calculateMockMultiplier = () => {
  // Calculate a multiplier based on referrals
  const directCount = directReferrals.value.length;
  const indirectCount = indirectReferrals.value.length;
  const beyondCount = beyondReferrals.value.length;
  
  // Base multiplier
  let multiplier = 1.0;
  
  // Direct referrals: +0.05 each, max +1.0
  multiplier += Math.min(1.0, directCount * 0.05);
  
  // Indirect referrals: +0.02 each, max +0.5
  multiplier += Math.min(0.5, indirectCount * 0.02);
  
  // Beyond referrals: +0.01 each, max +0.25
  multiplier += Math.min(0.25, beyondCount * 0.01);
  
  // Network depth bonus: +0.1 per level
  if (beyondCount > 0) {
    multiplier += 0.3; // 3 levels
  } else if (indirectCount > 0) {
    multiplier += 0.2; // 2 levels
  } else if (directCount > 0) {
    multiplier += 0.1; // 1 level
  }
  
  // Round to 2 decimal places
  return Math.round(multiplier * 100) / 100;
};

const generateMockMultiplierHistory = () => {
  // Generate 7 days of history, starting with 1.0 and gradually increasing to current multiplier
  const history = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (let i = 6; i >= 0; i--) {
    const timestamp = now - (i * dayInMs);
    const progress = (6 - i) / 6; // 0 to 1
    const value = 1.0 + (playerMultiplier.value - 1.0) * progress;
    
    history.push({
      timestamp,
      value: Math.round(value * 100) / 100
    });
  }
  
  multiplierHistory.value = history;
};

// Event handlers
const handleCopy = (code) => {
  console.log('Copied referral code:', code);
};

const handleShare = (url) => {
  console.log('Shared referral URL:', url);
};

// Initialize on mount
onMounted(() => {
  // Initialize with mock data immediately for better UX
  directReferrals.value = generateMockDirectReferrals();
  indirectReferrals.value = generateMockIndirectReferrals();
  beyondReferrals.value = generateMockBeyondReferrals();
  playerMultiplier.value = calculateMockMultiplier();
  referralCode.value = generateMockReferralCode();
  
  // Then fetch real data
  fetchReferralData();
});
</script>

<style scoped>
.referrals-section {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 1rem;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
}

.section-description {
  color: var(--cosmic-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.referrals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.grid-item {
  height: 100%;
}

.referral-code-item {
  grid-column: 1;
  grid-row: 1;
}

.multiplier-chart-item {
  grid-column: 2;
  grid-row: 1;
}

.referral-network-item {
  grid-column: 1 / span 2;
  grid-row: 2;
}

@media (max-width: 1024px) {
  .referrals-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .referral-code-item,
  .multiplier-chart-item,
  .referral-network-item {
    grid-column: 1;
  }
  
  .referral-code-item {
    grid-row: 1;
  }
  
  .multiplier-chart-item {
    grid-row: 2;
  }
  
  .referral-network-item {
    grid-row: 3;
  }
}
</style> 