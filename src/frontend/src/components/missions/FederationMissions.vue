<template>
  <div class="federation-missions">
    <!-- Section Header -->
    <div class="section-header">
      <div class="header-content">
        <h2><i class="fas fa-globe-americas"></i> Federation Command Center</h2>
        <p>Join commanders across the galaxy in vital missions for the Federation.</p>
      </div>
      <div class="header-actions">
        <button @click="refreshMissions" class="refresh-btn" :class="{ 'is-loading': isLoading }">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !missions.length" class="loading-container">
      <div class="cosmic-loader"></div>
      <p>Accessing Federation mission database...</p>
    </div>

    <!-- Mission Board -->
    <div v-else-if="missions.length" class="mission-board">
      <!-- Mission Filters -->
      <div class="mission-filters">
        <div class="filter-group">
          <label>Filter by:</label>
          <select v-model="filters.rarity" class="filter-select">
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
          
          <select v-model="filters.duration" class="filter-select">
            <option value="all">All Durations</option>
            <option value="short">Short (< 1h)</option>
            <option value="medium">Medium (1-4h)</option>
            <option value="long">Long (> 4h)</option>
          </select>
          
          <select v-model="filters.level" class="filter-select">
            <option value="all">All Levels</option>
            <option value="beginner">Beginner (1-3)</option>
            <option value="advanced">Advanced (4-7)</option>
            <option value="expert">Expert (8+)</option>
          </select>
        </div>
        
        <div class="view-toggles">
          <button 
            @click="viewMode = 'available'" 
            class="view-toggle" 
            :class="{ active: viewMode === 'available' }"
          >
            Available
          </button>
          <button 
            @click="viewMode = 'active'" 
            class="view-toggle" 
            :class="{ active: viewMode === 'active' }"
          >
            My Missions
            <span v-if="activeMissions.length" class="badge">{{ activeMissions.length }}</span>
          </button>
        </div>
      </div>

      <!-- Available Missions -->
      <div v-if="viewMode === 'available'" class="missions-list">
        <MissionEmptyState v-if="!filteredMissions.length" message="No available missions match your filters." />
        
        <federation-mission-card 
          v-for="mission in filteredMissions" 
          :key="mission.id"
          :mission="mission"
          :player-level="playerLevel"
          :player-ships="playerShips"
          :player-items="playerItems"
          @accept="acceptMission"
        />
      </div>

      <!-- Active Missions -->
      <div v-else-if="viewMode === 'active'" class="missions-list">
        <MissionEmptyState v-if="!activeMissions.length" message="You have no active missions. Join one from the Available tab!" />
        
        <federation-mission-card 
          v-for="mission in activeMissions" 
          :key="mission.id"
          :mission="getMissionById(mission.missionId)"
          :player-level="playerLevel"
          :player-ships="playerShips"
          :player-items="playerItems"
          :in-progress="true"
          :completes-at="mission.completesAt"
          @complete="completeMission"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-satellite-dish"></i>
      <h3>No Federation missions available</h3>
      <p>The Federation is currently gathering intelligence. Check back soon for new assignments.</p>
      <button @click="refreshMissions" class="cosmic-button">Check Again</button>
    </div>

    <!-- First-time User Guide -->
    <div v-if="showGuide" class="guide-overlay">
      <div class="guide-content">
        <h3>Welcome to Federation Command!</h3>
        <p>As a commander, you'll take on critical missions from Federation HQ.</p>
        
        <div class="guide-steps">
          <div class="guide-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Choose Your Mission</h4>
              <p>Browse available missions based on your rank and ships.</p>
            </div>
          </div>
          
          <div class="guide-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Deploy Your Fleet</h4>
              <p>Commit ships to the mission - they'll be unavailable until complete.</p>
            </div>
          </div>
          
          <div class="guide-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Complete Mission</h4>
              <p>Collect rewards once the mission timer completes!</p>
            </div>
          </div>
        </div>
        
        <div class="guide-actions">
          <button @click="closeGuide" class="cosmic-button">Begin!</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCanisterStore } from '@/stores/canister';
import { useAuthStore } from '@/stores/auth';
import FederationMissionCard from './FederationMissionCard.vue';

// Empty state component
const MissionEmptyState = {
  props: {
    message: {
      type: String,
      default: 'No missions available.'
    }
  },
  template: `
    <div class="empty-missions">
      <i class="fas fa-satellite"></i>
      <p>{{ message }}</p>
    </div>
  `
};

// State
const missions = ref([]);
const playerMissions = ref([]);
const isLoading = ref(true);
const error = ref(null);
const viewMode = ref('available');
const showGuide = ref(false);

// Player data
const playerLevel = ref(1);
const playerShips = ref([]);
const playerItems = ref([]);

// Filters
const filters = ref({
  rarity: 'all',
  duration: 'all',
  level: 'all'
});

// Fetch player data
const fetchPlayerData = async () => {
  try {
    const authStore = useAuthStore();
    const canisterStore = useCanisterStore();
    const backend = await canisterStore.get('cosmicrafts');
    
    if (!backend) {
      throw new Error("Backend canister not initialized");
    }
    
    // Get player profile
    const player = await backend.getPlayer();
    if (player[0]) {
      playerLevel.value = player[0].level;
    }
    
    // Get player ships (example - would need implementation)
    const ships = await backend.getNFTs(authStore.principal);
    if (ships && ships.length) {
      playerShips.value = ships.map(ship => ({
        id: ship[0],
        class: ship[1]?.metadata?.general?.name || 'Unknown'
      }));
    }
    
    // Here you would load items too
    
    console.log("Player data loaded:", {
      level: playerLevel.value,
      ships: playerShips.value.length
    });
  } catch (err) {
    console.error("Error fetching player data:", err);
    // In development, set mock data
    if (import.meta.env.DEV) {
      playerLevel.value = 5;
      playerShips.value = [
        { id: 1, class: "Scout" },
        { id: 2, class: "Corvette" },
        { id: 3, class: "Destroyer" }
      ];
      playerItems.value = ["Navigation Chart", "Diplomatic Seal"];
    }
  }
};

// Fetch missions from backend (or mock in development)
const fetchMissions = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // This would be your actual backend call
    // const canister = useCanisterStore();
    // const backend = await canister.get('federation_missions');
    // const result = await backend.getAvailableMissions(playerLevel.value);
    
    // For now, generate mock data
    console.log("Fetching missions for player level:", playerLevel.value);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (import.meta.env.DEV) {
      missions.value = generateMockMissions();
    } else {
      // Replace with actual API call when backend is ready
      missions.value = [];
    }
  } catch (err) {
    console.error("Error fetching missions:", err);
    error.value = err.message || "Failed to load missions";
    
    // In development, still show mock missions even if there's an error
    if (import.meta.env.DEV) {
      missions.value = generateMockMissions();
    }
  } finally {
    isLoading.value = false;
  }
};

// Mock data generator for development
const generateMockMissions = () => {
  const rarities = ['#Common', '#Uncommon', '#Rare', '#Epic', '#Legendary'];
  const missionNames = [
    "Stellar Defense", "Resource Expedition", "Deep Space Exploration",
    "Faction Diplomacy", "Dark Rift Expedition", "Pirate Patrol",
    "Supply Chain Run", "Nebula Mapping", "Rescue Operation"
  ];
  const descriptions = [
    "Deploy ships to defend a federation outpost from pirate raids.",
    "Collect rare resources from an asteroid field for Federation research.",
    "Map a newly discovered sector of space with anomalous readings.",
    "Conduct diplomatic negotiations with a neutral alien faction.",
    "Investigate spatial anomalies within the Dark Rift zone."
  ];
  
  return Array.from({ length: 10 }, (_, i) => {
    const rarityIndex = Math.floor(Math.pow(Math.random(), 2) * 5); // Bias toward common
    const rarity = rarities[rarityIndex];
    const rewardMultiplier = [1, 1.5, 2.5, 4, 10][rarityIndex];
    
    return {
      id: `mission-${Date.now()}-${i}`,
      name: missionNames[Math.floor(Math.random() * missionNames.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      rarity: rarity,
      status: 'Available',
      reward: {
        tokenAmount: Math.floor(50 * rewardMultiplier),
        xpAmount: Math.floor(100 * rewardMultiplier),
        rareLoot: rarityIndex >= 3 ? "Rare Ship Component" : null
      },
      requirements: {
        minLevel: Math.max(1, Math.min(playerLevel.value - 2 + Math.floor(Math.random() * 5), 10)),
        shipClass: Math.random() > 0.7 ? ["Scout", "Corvette", "Destroyer"][Math.floor(Math.random() * 3)] : null,
        numShips: 1 + Math.floor(Math.random() * 2),
        specialItem: Math.random() > 0.8 ? "Diplomatic Seal" : null
      },
      duration: (0.5 + Math.random() * 4.5) * 3600, // 0.5 to 5 hours in seconds
      maxParticipants: 10 + Math.floor(Math.random() * 20),
      currentParticipants: Math.floor(Math.random() * 10),
      createdAt: Date.now() - Math.floor(Math.random() * 86400000),
      expiresAt: Date.now() + 86400000 // 24 hours from now
    };
  });
};

// Fetch player missions
const fetchPlayerMissions = async () => {
  // This would be your actual backend call
  // const canister = useCanisterStore();
  // const backend = await canister.get('federation_missions');
  // const result = await backend.getPlayerMissions();
  
  // For now, generate mock data
  if (import.meta.env.DEV && Math.random() > 0.5) {
    const mockMission = missions.value[Math.floor(Math.random() * missions.value.length)];
    if (mockMission) {
      const now = Date.now();
      playerMissions.value = [{
        missionId: mockMission.id,
        acceptedAt: now - 1000000,
        completesAt: now + 300000, // 5 minutes from now
        status: "#InProgress"
      }];
    }
  } else {
    playerMissions.value = [];
  }
};

// Accept a mission
const acceptMission = async (missionId) => {
  console.log(`Accepting mission: ${missionId}`);
  
  try {
    isLoading.value = true;
    
    // This would be your actual backend call
    // const canister = useCanisterStore();
    // const backend = await canister.get('federation_missions');
    // const result = await backend.acceptMission(missionId);
    
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Add to player missions
    const mission = missions.value.find(m => m.id === missionId);
    if (mission) {
      const now = Date.now();
      const durationMs = mission.duration * 1000; // Convert seconds to ms
      
      // In dev, make it complete in 10 seconds for testing
      const completesAt = import.meta.env.DEV ? now + 10000 : now + durationMs;
      
      playerMissions.value.push({
        missionId: mission.id,
        acceptedAt: now,
        completesAt: completesAt,
        status: "#InProgress"
      });
      
      // Update mission participants count
      mission.currentParticipants++;
      
      // Show success notification
      console.log("Mission accepted!");
    }
    
    // Switch to active missions view
    viewMode.value = 'active';
  } catch (err) {
    console.error("Error accepting mission:", err);
    alert("Failed to accept mission: " + (err.message || "Unknown error"));
  } finally {
    isLoading.value = false;
  }
};

// Complete a mission
const completeMission = async (missionId) => {
  console.log(`Completing mission: ${missionId}`);
  
  try {
    isLoading.value = true;
    
    // This would be your actual backend call
    // const canister = useCanisterStore();
    // const backend = await canister.get('federation_missions');
    // const result = await backend.completeMission(missionId);
    
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find and update the mission
    const mission = playerMissions.value.find(m => m.missionId === missionId);
    if (mission) {
      // Remove from active missions
      playerMissions.value = playerMissions.value.filter(m => m.missionId !== missionId);
      
      // Get rewards
      const missionDetails = missions.value.find(m => m.id === missionId);
      if (missionDetails) {
        // Show completion notification with rewards
        console.log("Mission completed! Rewards:", missionDetails.reward);
        alert(`Mission completed! Earned ${missionDetails.reward.tokenAmount} tokens and ${missionDetails.reward.xpAmount} XP`);
      }
    }
  } catch (err) {
    console.error("Error completing mission:", err);
    alert("Failed to complete mission: " + (err.message || "Unknown error"));
  } finally {
    isLoading.value = false;
  }
};

// Get mission by ID (for active missions view)
const getMissionById = (id) => {
  return missions.value.find(m => m.id === id) || {
    name: "Unknown Mission",
    description: "Mission details unavailable",
    rarity: "#Common",
    reward: { tokenAmount: 0, xpAmount: 0 }
  };
};

// Active missions computed list
const activeMissions = computed(() => {
  return playerMissions.value.filter(mission => 
    mission.status === "#InProgress" || mission.status === "#ReadyToComplete"
  );
});

// Filter missions
const filteredMissions = computed(() => {
  return missions.value.filter(mission => {
    // Filter by rarity
    if (filters.value.rarity !== 'all') {
      const missionRarity = String(mission.rarity).replace('#', '').toLowerCase();
      if (missionRarity !== filters.value.rarity) return false;
    }
    
    // Filter by duration
    if (filters.value.duration !== 'all') {
      const durationHours = mission.duration / 3600; // Convert seconds to hours
      
      if (filters.value.duration === 'short' && durationHours >= 1) return false;
      if (filters.value.duration === 'medium' && (durationHours < 1 || durationHours > 4)) return false;
      if (filters.value.duration === 'long' && durationHours <= 4) return false;
    }
    
    // Filter by level
    if (filters.value.level !== 'all') {
      const missionLevel = mission.requirements.minLevel;
      
      if (filters.value.level === 'beginner' && (missionLevel < 1 || missionLevel > 3)) return false;
      if (filters.value.level === 'advanced' && (missionLevel < 4 || missionLevel > 7)) return false;
      if (filters.value.level === 'expert' && missionLevel < 8) return false;
    }
    
    return true;
  });
});

// Refresh missions
const refreshMissions = async () => {
  await Promise.all([
    fetchMissions(),
    fetchPlayerMissions()
  ]);
};

// Show guide for first-time users
const checkFirstTimeUser = () => {
  const hasSeenGuide = localStorage.getItem('federation_guide_shown');
  if (!hasSeenGuide) {
    showGuide.value = true;
  }
};

const closeGuide = () => {
  showGuide.value = false;
  localStorage.setItem('federation_guide_shown', 'true');
};

// Initialize
onMounted(async () => {
  await fetchPlayerData();
  await refreshMissions();
  checkFirstTimeUser();
  
  // Auto-refresh missions every 5 minutes
  setInterval(refreshMissions, 5 * 60 * 1000);
});
</script>

<style scoped>
.federation-missions {
  width: 100%;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-blue, #0fb9fd);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.4);
}

.header-content p {
  color: var(--cosmic-text-secondary, #a0a0b0);
  margin: 0;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue, #0fb9fd);
  border: 1px solid rgba(15, 185, 253, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(15, 185, 253, 0.2);
}

.refresh-btn.is-loading i {
  animation: spin 1s linear infinite;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.cosmic-loader {
  border: 3px solid rgba(15, 185, 253, 0.1);
  border-radius: 50%;
  border-top: 3px solid var(--cosmic-blue, #0fb9fd);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-container p {
  color: var(--cosmic-text-secondary, #a0a0b0);
}

.mission-board {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.mission-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-group label {
  color: var(--cosmic-text-secondary, #a0a0b0);
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  background: rgba(15, 25, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary, #ffffff);
  font-size: 0.85rem;
}

.view-toggles {
  display: flex;
  gap: 0.5rem;
}

.view-toggle {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  background: rgba(15, 25, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary, #a0a0b0);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.view-toggle.active {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  color: var(--cosmic-blue, #0fb9fd);
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--cosmic-red, #ff3b30);
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.missions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.empty-missions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background: rgba(15, 25, 40, 0.3);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.empty-missions i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-tertiary, #606070);
}

.empty-missions p {
  color: var(--cosmic-text-secondary, #a0a0b0);
  max-width: 300px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(15, 25, 40, 0.3);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-tertiary, #606070);
}

.empty-state h3 {
  color: var(--cosmic-text-primary, #ffffff);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--cosmic-text-secondary, #a0a0b0);
  margin-bottom: 1.5rem;
  max-width: 400px;
}

.cosmic-button {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue, #0fb9fd);
  border: 1px solid rgba(15, 185, 253, 0.3);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cosmic-button:hover {
  background: rgba(15, 185, 253, 0.2);
}

.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.guide-content {
  background: linear-gradient(to bottom, rgba(30, 40, 60, 0.95), rgba(15, 25, 40, 0.95));
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(15, 185, 253, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.2);
  text-align: center;
}

.guide-content h3 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--cosmic-blue, #0fb9fd);
}

.guide-content p {
  color: var(--cosmic-text-secondary, #a0a0b0);
  margin-bottom: 2rem;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.guide-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  text-align: left;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--cosmic-blue, #0fb9fd);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary, #ffffff);
}

.step-content p {
  margin: 0;
  font-size: 0.9rem;
}

.guide-actions {
  margin-top: 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .mission-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .view-toggles {
    width: 100%;
  }
  
  .view-toggle {
    flex: 1;
    text-align: center;
  }
}
</style> 