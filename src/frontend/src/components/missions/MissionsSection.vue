<template>
  <div class="missions-section">
    <div class="section-header">
      <h2>Missions & Achievements</h2>
      <p class="section-description">
        Complete missions to earn rewards and unlock achievements!
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="cosmic-loader"></div>
      <p>Loading missions...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="errorMessage" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
      <button @click="fetchAllMissions" class="cosmic-button cosmic-button-primary">
        Retry
      </button>
    </div>
    
    <!-- Content -->
    <div v-else class="missions-content">
      <!-- Mission Categories Navigation Tabs -->
      <div class="mission-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button" 
          :class="{ active: activeTab === tab.id }"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <div v-if="getReadyToClaimCount(tab.id) > 0" class="notification-badge">
            {{ getReadyToClaimCount(tab.id) }}
          </div>
        </button>
        
        <!-- Add refresh button -->
        <button 
          @click="refreshMissions"
          class="tab-button refresh-button"
          :class="{ 'refreshing': isRefreshing }"
          :disabled="isLoading || isRefreshing"
        >
          <i class="fas fa-sync-alt"></i>
          <span>Refresh</span>
        </button>
      </div>
      
      <!-- Daily Missions Tab -->
      <div v-if="activeTab === 'daily'" class="missions-tab-content">
        <div v-if="!missions.daily.length" class="empty-missions">
          <i class="fas fa-sun"></i>
          <p>No daily missions available at the moment. Check back later!</p>
        </div>
        <template v-else>
          <MissionCard 
            v-for="mission in missions.daily" 
            :key="mission.id_mission"
            :mission="mission"
            @claim="claimReward"
          />
        </template>
      </div>
      
      <!-- Weekly Missions Tab -->
      <div v-if="activeTab === 'weekly'" class="missions-tab-content">
        <div v-if="!missions.weekly.length" class="empty-missions">
          <i class="fas fa-calendar-week"></i>
          <p>No weekly missions available at the moment. Check back later!</p>
        </div>
        <template v-else>
          <MissionCard 
            v-for="mission in missions.weekly" 
            :key="mission.id_mission"
            :mission="mission"
            @claim="claimReward"
          />
        </template>
      </div>
      
      <!-- Free Chests Tab -->
      <div v-if="activeTab === 'chests'" class="missions-tab-content chests-grid">
        <div v-if="!missions.freeChests.length" class="empty-missions">
          <i class="fas fa-box-open"></i>
          <p>No free chests available at the moment. Check back later!</p>
        </div>
        <template v-else>
          <FreeChestCard 
            v-for="chest in missions.freeChests" 
            :key="chest.id_mission"
            :nextAvailableTime="Number(chest.expiration) / 1000"
            :isClaimed="chest.finished"
            :rewardAmount="chest.reward_amount"
            @claim="() => claimChest(chest.id_mission)"
          />
        </template>
      </div>
      
      <!-- Personal Missions Tab -->
      <div v-if="activeTab === 'personal'" class="missions-tab-content">
        <div v-if="!missions.personal.length" class="empty-missions">
          <i class="fas fa-user-astronaut"></i>
          <p>No personal missions available at the moment. Check back later!</p>
        </div>
        <template v-else>
          <MissionCard 
            v-for="mission in missions.personal" 
            :key="mission.id_mission"
            :mission="mission"
            @claim="claimReward"
          />
        </template>
      </div>

      <!-- Federation Missions Tab -->
      <div v-if="activeTab === 'federation'" class="missions-tab-content">
        <FederationMissions />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCanisterStore } from '@/stores/canister';
import MissionCard from './MissionCard.vue';
import FreeChestCard from './FreeChestCard.vue';
import FederationMissions from './FederationMissions.vue';

// State
const isLoading = ref(true);
const isRefreshing = ref(false);
const errorMessage = ref('');
const activeTab = ref('federation'); // Default to federation tab to highlight the new feature
const autoRefreshInterval = ref(null);
const lastRefreshTime = ref(Date.now());

// Mission tabs
const tabs = [
  { id: 'federation', label: 'Federation', icon: 'fas fa-globe-americas' },
  { id: 'daily', label: 'Daily', icon: 'fas fa-sun' },
  { id: 'weekly', label: 'Weekly', icon: 'fas fa-calendar-week' },
  { id: 'chests', label: 'Free Chests', icon: 'fas fa-box-open' },
  { id: 'personal', label: 'Personal', icon: 'fas fa-user-astronaut' }
];

// Missions data store
const missions = ref({
  daily: [],
  weekly: [],
  freeChests: [],
  personal: []
});

// Ready to claim counters
const readyToClaimCounts = ref({
  daily: 0,
  weekly: 0,
  chests: 0,
  personal: 0,
  federation: 0
});

// Get count of missions ready to claim for a specific tab
const getReadyToClaimCount = (tabId) => {
  return readyToClaimCounts.value[tabId] || 0;
};

// Claim a mission reward
const claimReward = async (missionId) => {
  console.log(`Claiming reward for mission: ${missionId}`);
  
  try {
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      throw new Error("Backend canister not initialized");
    }
    
    const result = await backend.claimUserReward(missionId);
    console.log("Claim result:", result);
    
    // Update the mission's status
    updateMissionStatus(missionId, true);
    
    // Refresh missions data after claiming
    fetchAllMissions();
    
    // Show success notification
    alert("Reward claimed successfully!");
  } catch (error) {
    console.error("Error claiming mission reward:", error);
    alert("Failed to claim reward. Please try again.");
  }
};

// Claim a chest reward
const claimChest = async (chestId) => {
  console.log(`Claiming chest: ${chestId}`);
  
  if (!chestId) {
    console.error("Missing chest ID, cannot claim");
    alert("Error: Could not identify chest to claim");
    return;
  }
  
  try {
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      throw new Error("Backend canister not initialized");
    }
    
    const result = await backend.claimUserReward(chestId);
    console.log("Chest claim result:", result);
    
    // Refresh missions data after claiming
    fetchAllMissions();
    
    // Show success notification
    alert("Chest claimed successfully!");
  } catch (error) {
    console.error("Error claiming chest:", error);
    alert("Failed to claim chest. Please try again.");
  }
};

// Update a mission's status after claiming
const updateMissionStatus = (missionId, claimed) => {
  // Update in all mission categories
  ['daily', 'weekly', 'personal'].forEach(category => {
    const missionIndex = missions.value[category].findIndex(m => m.id_mission === missionId);
    if (missionIndex !== -1) {
      missions.value[category][missionIndex].claimed = claimed;
    }
  });
  
  // Recalculate ready to claim counts
  calculateReadyToClaimCounts();
};

// Calculate how many missions are ready to claim
const calculateReadyToClaimCounts = () => {
  readyToClaimCounts.value = {
    daily: missions.value.daily.filter(m => m.progress >= m.total && !m.finished).length,
    weekly: missions.value.weekly.filter(m => m.progress >= m.total && !m.finished).length,
    chests: missions.value.freeChests.filter(chest => !chest.finished && (new Date(Number(chest.expiration))).getTime() <= Date.now()).length,
    personal: missions.value.personal.filter(m => m.progress >= m.total && !m.finished).length
  };
  
  console.log("Ready to claim counts:", readyToClaimCounts.value);
};

// Fetch all missions from the backend
const fetchAllMissions = async () => {
  console.log("Starting mission fetch process...");
  isLoading.value = true;
  errorMessage.value = '';
  
  // Reset all mission arrays at the beginning
  missions.value.daily = [];
  missions.value.weekly = [];
  missions.value.freeChests = [];
  missions.value.personal = [];
  
  try {
    const canister = useCanisterStore();
    
    console.log("Getting cosmicrafts canister...");
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      console.error("Backend canister not initialized");
      throw new Error("Could not connect to backend. Please try again later.");
    }
    
    // Start background update of user missions to ensure they're renewed
    // This runs in parallel with fetching current missions
    let missionUpdatePromise = updateUserMissions(backend);
    
    // Fetch general missions (daily, weekly, free chests)
    console.log("Fetching general missions...");
    const generalMissionsResult = await backend.getGeneralMissions();
    console.log("General missions response:", generalMissionsResult);
    
    if (!generalMissionsResult) {
      console.error("No general missions returned");
      throw new Error("Failed to load missions data");
    }
    
    // Process general missions
    processGeneralMissions(generalMissionsResult);
    
    // Fetch user-specific missions
    console.log("Fetching user missions...");
    const userMissionsResult = await backend.getUserMissions();
    console.log("User missions response:", userMissionsResult);
    
    if (userMissionsResult) {
      processUserMissions(userMissionsResult);
    }
    
    // Calculate missions ready to claim
    calculateReadyToClaimCounts();
    
    // Wait for the background mission update to complete
    try {
      const updateResult = await missionUpdatePromise;
      console.log("Background mission update result:", updateResult);
    } catch (updateError) {
      console.warn("Background mission update failed:", updateError);
      // Don't fail the main mission loading if the update fails
    }
    
    console.log("All missions data loaded successfully");
  } catch (error) {
    console.error("Error fetching missions:", error);
    errorMessage.value = error.message || "Failed to load missions data. Please try again.";
    
    // Generate mock data in development mode
    if (import.meta.env.DEV) {
      console.log("Generating mock mission data for development");
      generateMockMissions();
    }
  } finally {
    isLoading.value = false;
  }
};

// Helper function to update user missions in the background
const updateUserMissions = async (backend) => {
  try {
    console.log("Updating user missions in background...");
    
    // Get the current user's principal ID from the canister store
    const canister = useCanisterStore();
    const principal = canister.principal;
    
    if (!principal) {
      console.warn("No principal ID found, cannot update user missions");
      return { success: false, message: "No principal ID found", missionId: 0 };
    }
    
    console.log(`Updating missions for principal: ${principal}`);
    
    // Call createUserMission with the current user's principal ID
    const [success, message, missionId] = await backend.createUserMission(principal);
    
    console.log(`Mission update result: success=${success}, message=${message}, missionId=${missionId}`);
    
    return { success, message, missionId };
  } catch (error) {
    console.error("Error updating user missions:", error);
    throw error;
  }
};

// Process general missions from the response
const processGeneralMissions = (generalMissions) => {
  console.log("Processing general missions...");
  
  // Process each mission by its category
  generalMissions.forEach(mission => {
    // Convert BigInt to regular number for easier handling
    const parsedMission = {
      ...mission,
      progress: Number(mission.progress),
      total: Number(mission.total),
      expiration: Number(mission.expiration),
      id_mission: mission.id_mission // Ensure the id_mission is preserved
    };
    
    console.log("Processing mission:", mission.id_mission, "Category:", mission.missionCategory);
    
    // Check mission category using proper structure detection
    // The structure is likely different than what we expected
    if (mission.missionCategory && 'Daily' in mission.missionCategory) {
      console.log("Categorized as Daily mission");
      missions.value.daily.push(parsedMission);
    } else if (mission.missionCategory && 'Weekly' in mission.missionCategory) {
      console.log("Categorized as Weekly mission");
      missions.value.weekly.push(parsedMission);
    } else if (mission.missionCategory && 'Free' in mission.missionCategory) {
      console.log("Categorized as Free chest");
      missions.value.freeChests.push(parsedMission);
    } else {
      // If we can't determine the category, log the mission object to understand its structure
      console.log("Unknown mission category, defaulting to personal mission:", mission);
      missions.value.personal.push(parsedMission);
    }
  });
  
  console.log(`After processing general missions: ${missions.value.daily.length} daily, ${missions.value.weekly.length} weekly, ${missions.value.freeChests.length} free chests, ${missions.value.personal.length} personal`);
};

// Process user missions from the response
const processUserMissions = (userMissions) => {
  console.log("Processing user missions...");
  
  // We don't reset personal missions array since we might have added some from general missions
  
  // Process each personal mission
  userMissions.forEach(mission => {
    // Convert BigInt to regular number for easier handling
    const parsedMission = {
      ...mission,
      progress: Number(mission.progress),
      total: Number(mission.total),
      expiration: Number(mission.expiration),
      id_mission: mission.id_mission // Ensure the id_mission is preserved
    };
    
    console.log("Processing user mission:", mission.id_mission, "Category:", mission.missionCategory);
    
    // Check if this mission should be categorized based on its category
    if (mission.missionCategory && 'Daily' in mission.missionCategory) {
      console.log("User mission categorized as Daily");
      missions.value.daily.push(parsedMission);
    } else if (mission.missionCategory && 'Weekly' in mission.missionCategory) {
      console.log("User mission categorized as Weekly");
      missions.value.weekly.push(parsedMission);
    } else if (mission.missionCategory && 'Free' in mission.missionCategory) {
      console.log("User mission categorized as Free chest");
      missions.value.freeChests.push(parsedMission);
    } else {
      console.log("User mission categorized as Personal");
      missions.value.personal.push(parsedMission);
    }
  });
  
  console.log(`After processing user missions: ${missions.value.daily.length} daily, ${missions.value.weekly.length} weekly, ${missions.value.freeChests.length} free chests, ${missions.value.personal.length} personal`);
};

// Generate mock mission data for development/testing
const generateMockMissions = () => {
  console.log("Generating mock missions data");
  
  // Mock daily missions
  missions.value.daily = [
    {
      id_mission: "mock-daily-1",
      missionType: { GamesCompleted: null },
      missionCategory: { Daily: null },
      progress: 1,
      total: 1,
      reward_type: { Stardust: null },
      reward_amount: 50,
      expiration: Date.now() + 86400000,
      claimed: false,
      finished: true
    },
    {
      id_mission: "mock-daily-2",
      missionType: { DamageDealt: null },
      missionCategory: { Daily: null },
      progress: 350,
      total: 1000,
      reward_type: { Stardust: null },
      reward_amount: 100,
      expiration: Date.now() + 86400000,
      claimed: false,
      finished: false
    }
  ];
  
  // Mock weekly missions
  missions.value.weekly = [
    {
      id_mission: "mock-weekly-1",
      missionType: { GamesWon: null },
      missionCategory: { Weekly: null },
      progress: 3,
      total: 5,
      reward_type: { Stardust: null },
      reward_amount: 250,
      expiration: Date.now() + 604800000,
      claimed: false,
      finished: false
    }
  ];
  
  // Mock free chests
  missions.value.freeChests = [
    {
      id: "mock-chest-1",
      type: "daily",
      ready: true,
      nextAvailable: 0,
      claimed: false,
      rewards: [
        { type: "Stardust", amount: 100 }
      ]
    },
    {
      id: "mock-chest-2",
      type: "weekly",
      ready: false,
      nextAvailable: Date.now() + 3600000,
      claimed: false,
      rewards: [
        { type: "Stardust", amount: 500 },
        { type: "Item", amount: 1, itemId: "boost-1" }
      ]
    }
  ];
  
  // Mock personal missions
  missions.value.personal = [
    {
      id_mission: "mock-personal-1",
      missionType: { XPEarned: null },
      missionCategory: { Personal: null },
      progress: 750,
      total: 1000,
      reward_type: { Stardust: null },
      reward_amount: 150,
      expiration: 0,
      claimed: false,
      finished: false
    }
  ];
  
  // Calculate missions ready to claim
  calculateReadyToClaimCounts();
  
  console.log("Mock mission data generated:", missions.value);
};

// Refresh missions with visual indicator
const refreshMissions = async () => {
  if (isRefreshing.value || isLoading.value) return;
  
  isRefreshing.value = true;
  
  try {
    await fetchAllMissions();
    lastRefreshTime.value = Date.now();
  } catch (error) {
    console.error("Error refreshing missions:", error);
  } finally {
    isRefreshing.value = false;
  }
};

// Auto-refresh missions every 5 minutes
const setupAutoRefresh = () => {
  // Clear any existing interval
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
  }
  
  // Define 5 minutes in milliseconds
  const fiveMinutes = 5 * 60 * 1000;
  
  // Set up new interval - refresh every 5 minutes
  autoRefreshInterval.value = setInterval(() => {
    // Only auto-refresh if it's been at least 5 minutes since last manual refresh
    const now = Date.now();
    
    if (now - lastRefreshTime.value >= fiveMinutes) {
      console.log("Auto-refreshing missions...");
      refreshMissions();
    }
  }, fiveMinutes);
};

// Initialize on component mount
onMounted(() => {
  console.log("MissionsSection component mounted");
  fetchAllMissions().then(() => {
    // Set up auto-refresh after initial load
    setupAutoRefresh();
  });
});

// Clean up on component unmount
onUnmounted(() => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
  }
});
</script>

<style scoped>
.missions-section {
  width: 100%;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-primary);
}

.section-description {
  color: var(--cosmic-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--cosmic-text-secondary);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 2rem;
}

.error-container i {
  font-size: 3rem;
  color: var(--cosmic-red);
  margin-bottom: 1rem;
}

.error-container p {
  color: var(--cosmic-text-primary);
  margin-bottom: 1.5rem;
  max-width: 500px;
}

.mission-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  min-width: 100px;
}

.tab-button i {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  transition: all var(--cosmic-transition-medium);
}

.tab-button span {
  font-size: 0.85rem;
  font-weight: 500;
}

.tab-button:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
  color: var(--cosmic-blue);
}

.tab-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: var(--cosmic-blue);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.tab-button.active i {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background: var(--cosmic-red);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(255, 59, 48, 0.5);
}

.missions-tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.empty-missions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.03);
  border: 1px dashed rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-lg);
  padding: 3rem 2rem;
  text-align: center;
  color: var(--cosmic-text-tertiary);
}

.empty-missions i {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.4;
}

.empty-missions p {
  font-size: 1.1rem;
  max-width: 400px;
}

@media (max-width: 768px) {
  .mission-tabs {
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .tab-button {
    min-width: 90px;
    padding: 0.5rem 0.75rem;
  }
  
  .tab-button i {
    font-size: 1.1rem;
  }
  
  .tab-button span {
    font-size: 0.8rem;
  }
  
  .chests-grid {
    grid-template-columns: 1fr;
  }
}

/* Add styles for the refresh button */
.refresh-button {
  margin-left: auto;
  min-width: auto !important;
  padding: 0.75rem 1rem !important;
}

.refresh-button i {
  transition: transform 0.5s ease;
}

.refresh-button.refreshing i {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 