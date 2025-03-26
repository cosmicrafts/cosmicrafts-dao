<template>
  <div class="stats-section">
    <div class="section-header">
      <h2>Statistics Dashboard</h2>
      <p class="section-description">
        Track your progress and achievements in the Cosmic universe
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="cosmic-loader"></div>
      <p>Loading statistics...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="errorMessage" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
      <button @click="fetchStats" class="cosmic-button cosmic-button-primary">
        Retry
      </button>
    </div>
    
    <!-- Stats Content -->
    <div v-else class="stats-content">
      <!-- Stats Summary Card -->
      <div class="stat-card summary-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-trophy"></i>
            Player Summary
          </h3>
          <span class="player-level">Level {{ player?.level || 1 }}</span>
        </div>
        
        <div class="summary-grid">
          <StatSummaryItem 
            icon="fas fa-gamepad" 
            label="Games Played" 
            :value="playerStats?.gamesPlayed || 0"
            animated 
          />
          <StatSummaryItem 
            icon="fas fa-award" 
            label="Games Won" 
            :value="playerStats?.gamesWon || 0"
            animated 
          />
          <StatSummaryItem 
            icon="fas fa-times" 
            label="Games Lost" 
            :value="playerStats?.gamesLost || 0"
            animated 
          />
          <StatSummaryItem 
            icon="fas fa-percentage" 
            label="Win Rate" 
            :value="`${winRate}%`"
            animated 
          />
          <StatSummaryItem 
            icon="fas fa-star" 
            label="Total XP" 
            :value="playerStats?.totalXpEarned || 0"
            animated 
          />
          <StatSummaryItem 
            icon="fas fa-bolt" 
            label="Total Damage" 
            :value="playerStats?.totalDamageDealt || 0"
            animated 
          />
        </div>
      </div>
      
      <div class="stats-grid">
        <!-- Combat Stats Card -->
        <div class="stat-card combat-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-fist-raised"></i>
              Combat Stats
            </h3>
          </div>
          
          <div class="combat-stats">
            <div class="stat-row">
              <div class="stat-label">Damage Dealt</div>
              <div class="stat-bar-container">
                <div class="stat-bar">
                  <div class="stat-bar-fill damage-dealt" :style="{ width: `${normalizeForBar(playerStats?.totalDamageDealt || 0)}%` }"></div>
                </div>
                <div class="stat-value">{{ formatLargeNumber(playerStats?.totalDamageDealt || 0) }}</div>
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Damage Taken</div>
              <div class="stat-bar-container">
                <div class="stat-bar">
                  <div class="stat-bar-fill damage-taken" :style="{ width: `${normalizeForBar(playerStats?.totalDamageTaken || 0)}%` }"></div>
                </div>
                <div class="stat-value">{{ formatLargeNumber(playerStats?.totalDamageTaken || 0) }}</div>
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Critical Damage</div>
              <div class="stat-bar-container">
                <div class="stat-bar">
                  <div class="stat-bar-fill damage-crit" :style="{ width: `${normalizeForBar(playerStats?.totalDamageCrit || 0)}%` }"></div>
                </div>
                <div class="stat-value">{{ formatLargeNumber(playerStats?.totalDamageCrit || 0) }}</div>
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Damage Evaded</div>
              <div class="stat-bar-container">
                <div class="stat-bar">
                  <div class="stat-bar-fill damage-evaded" :style="{ width: `${normalizeForBar(playerStats?.totalDamageEvaded || 0)}%` }"></div>
                </div>
                <div class="stat-value">{{ formatLargeNumber(playerStats?.totalDamageEvaded || 0) }}</div>
              </div>
            </div>
            
            <div class="stat-row">
              <div class="stat-label">Total Kills</div>
              <div class="stat-bar-container">
                <div class="stat-bar">
                  <div class="stat-bar-fill kills" :style="{ width: `${normalizeForBar(playerStats?.totalKills || 0, 500)}%` }"></div>
                </div>
                <div class="stat-value">{{ formatLargeNumber(playerStats?.totalKills || 0) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Energy Stats Card -->
        <div class="stat-card energy-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-bolt"></i>
              Energy Management
            </h3>
          </div>
          
          <div class="energy-stats">
            <div class="energy-donut-wrapper">
              <DonutChart 
                :data="energyData" 
                :colors="energyColors"
                :total="totalEnergy"
                centerLabel="Energy"
              />
            </div>
            
            <div class="energy-details">
              <div class="energy-stat-item">
                <div class="energy-stat-label">
                  <span class="color-dot generated"></span>
                  <span>Generated</span>
                </div>
                <div class="energy-stat-value">{{ formatLargeNumber(playerStats?.energyGenerated || 0) }}</div>
              </div>
              
              <div class="energy-stat-item">
                <div class="energy-stat-label">
                  <span class="color-dot used"></span>
                  <span>Used</span>
                </div>
                <div class="energy-stat-value">{{ formatLargeNumber(playerStats?.energyUsed || 0) }}</div>
              </div>
              
              <div class="energy-stat-item">
                <div class="energy-stat-label">
                  <span class="color-dot wasted"></span>
                  <span>Wasted</span>
                </div>
                <div class="energy-stat-value">{{ formatLargeNumber(playerStats?.energyWasted || 0) }}</div>
              </div>
              
              <div class="energy-stat-item usage-efficiency">
                <div class="energy-stat-label">Energy Efficiency</div>
                <div class="energy-stat-value">
                  {{ energyEfficiency }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Average Stats Card -->
        <div class="stat-card average-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-chart-line"></i>
              Performance Averages
            </h3>
          </div>
          
          <div class="average-stats">
            <div class="average-grid">
              <div class="average-item">
                <div class="average-icon">
                  <i class="fas fa-bolt"></i>
                </div>
                <div class="average-details">
                  <div class="average-label">Avg. Damage</div>
                  <div class="average-value">{{ formatLargeNumber(averageStats?.averageDamageDealt || 0) }}</div>
                </div>
              </div>
              
              <div class="average-item">
                <div class="average-icon">
                  <i class="fas fa-battery-three-quarters"></i>
                </div>
                <div class="average-details">
                  <div class="average-label">Avg. Energy Used</div>
                  <div class="average-value">{{ formatLargeNumber(averageStats?.averageEnergyUsed || 0) }}</div>
                </div>
              </div>
              
              <div class="average-item">
                <div class="average-icon">
                  <i class="fas fa-skull"></i>
                </div>
                <div class="average-details">
                  <div class="average-label">Avg. Kills</div>
                  <div class="average-value">{{ formatLargeNumber(averageStats?.averageKills || 0) }}</div>
                </div>
              </div>
              
              <div class="average-item">
                <div class="average-icon">
                  <i class="fas fa-star"></i>
                </div>
                <div class="average-details">
                  <div class="average-label">Avg. XP Earned</div>
                  <div class="average-value">{{ formatLargeNumber(averageStats?.averageXpEarned || 0) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Faction Stats Card -->
        <div class="stat-card factions-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-flag"></i>
              Faction Performance
            </h3>
          </div>
          
          <div class="factions-stats">
            <div v-if="!playerStats?.totalGamesWithFaction?.length" class="empty-stats">
              <i class="fas fa-flag"></i>
              <p>No faction data available yet</p>
            </div>
            
            <div v-else class="faction-list">
              <div v-for="(faction, index) in playerStats.totalGamesWithFaction" :key="index" class="faction-item">
                <div class="faction-icon">
                  <img :src="getFactionImage(faction.factionID)" :alt="`Faction ${faction.factionID}`">
                </div>
                <div class="faction-details">
                  <div class="faction-name">{{ getFactionName(faction.factionID) }}</div>
                  <div class="faction-stats">
                    <div class="faction-stat">
                      <span class="stat-label">Games:</span>
                      <span class="stat-value">{{ faction.gamesPlayed }}</span>
                    </div>
                    <div class="faction-stat">
                      <span class="stat-label">Wins:</span>
                      <span class="stat-value">{{ faction.gamesWon }}</span>
                    </div>
                    <div class="faction-stat">
                      <span class="stat-label">Win Rate:</span>
                      <span class="stat-value">{{ calculateWinRate(faction.gamesWon, faction.gamesPlayed) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Game Modes Stats Card -->
      <div class="stat-card game-modes-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-gamepad"></i>
            Game Modes
          </h3>
        </div>
        
        <div class="game-modes-stats">
          <div v-if="!playerStats?.totalGamesGameMode?.length" class="empty-stats">
            <i class="fas fa-gamepad"></i>
            <p>No game mode data available yet</p>
          </div>
          
          <div v-else class="game-modes-grid">
            <div v-for="(gameMode, index) in playerStats.totalGamesGameMode" :key="index" class="game-mode-item">
              <div class="game-mode-icon">
                <i :class="getGameModeIcon(gameMode.gameModeID)"></i>
              </div>
              <div class="game-mode-details">
                <div class="game-mode-name">{{ getGameModeName(gameMode.gameModeID) }}</div>
                <div class="game-mode-stats-grid">
                  <div class="game-mode-stat">
                    <div class="mode-stat-value">{{ gameMode.gamesPlayed }}</div>
                    <div class="mode-stat-label">Games</div>
                  </div>
                  <div class="game-mode-stat">
                    <div class="mode-stat-value">{{ gameMode.gamesWon }}</div>
                    <div class="mode-stat-label">Wins</div>
                  </div>
                  <div class="game-mode-stat">
                    <div class="mode-stat-value">{{ calculateWinRate(gameMode.gamesWon, gameMode.gamesPlayed) }}%</div>
                    <div class="mode-stat-label">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Global Stats Card -->
      <div class="stat-card global-stats-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-globe"></i>
            Global Statistics
          </h3>
        </div>
        
        <div class="global-stats">
          <div class="global-stats-grid">
            <StatSummaryItem 
              icon="fas fa-gamepad" 
              label="Total Games" 
              :value="globalStats?.totalGamesPlayed || 0"
              dark
              animated 
            />
            <StatSummaryItem 
              icon="fas fa-user" 
              label="Single Player" 
              :value="globalStats?.totalGamesSP || 0"
              dark
              animated 
            />
            <StatSummaryItem 
              icon="fas fa-users" 
              label="Multiplayer" 
              :value="globalStats?.totalGamesMP || 0"
              dark
              animated 
            />
            <StatSummaryItem 
              icon="fas fa-bolt" 
              label="Total Damage" 
              :value="formatLargeNumber(globalStats?.totalDamageDealt || 0)"
              dark
              animated 
            />
            <StatSummaryItem 
              icon="fas fa-skull" 
              label="Total Kills" 
              :value="formatLargeNumber(globalStats?.totalKills || 0)"
              dark
              animated 
            />
            <StatSummaryItem 
              icon="fas fa-star" 
              label="Total XP" 
              :value="formatLargeNumber(globalStats?.totalXpEarned || 0)"
              dark
              animated 
            />
          </div>
          
          <div class="compare-to-global" v-if="playerStats && globalStats && globalStats.totalGamesPlayed > 0">
            <div class="contribution-header">Your Contribution to Game Universe</div>
            <div class="contribution-bars">
              <div class="contribution-item">
                <div class="contribution-label">Games Played</div>
                <div class="contribution-bar-container">
                  <div class="contribution-bar">
                    <div 
                      class="contribution-bar-fill" 
                      :style="{ width: `${calculateContribution(playerStats.gamesPlayed, globalStats.totalGamesPlayed)}%` }"
                    ></div>
                  </div>
                  <div class="contribution-value">
                    {{ calculateContribution(playerStats.gamesPlayed, globalStats.totalGamesPlayed) }}%
                  </div>
                </div>
              </div>
              
              <div class="contribution-item">
                <div class="contribution-label">Damage Dealt</div>
                <div class="contribution-bar-container">
                  <div class="contribution-bar">
                    <div 
                      class="contribution-bar-fill" 
                      :style="{ width: `${calculateContribution(playerStats.totalDamageDealt, globalStats.totalDamageDealt)}%` }"
                    ></div>
                  </div>
                  <div class="contribution-value">
                    {{ calculateContribution(playerStats.totalDamageDealt, globalStats.totalDamageDealt) }}%
                  </div>
                </div>
              </div>
              
              <div class="contribution-item">
                <div class="contribution-label">Kills</div>
                <div class="contribution-bar-container">
                  <div class="contribution-bar">
                    <div 
                      class="contribution-bar-fill" 
                      :style="{ width: `${calculateContribution(playerStats.totalKills, globalStats.totalKills)}%` }"
                    ></div>
                  </div>
                  <div class="contribution-value">
                    {{ calculateContribution(playerStats.totalKills, globalStats.totalKills) }}%
                  </div>
                </div>
              </div>
              
              <div class="contribution-item">
                <div class="contribution-label">XP Earned</div>
                <div class="contribution-bar-container">
                  <div class="contribution-bar">
                    <div 
                      class="contribution-bar-fill" 
                      :style="{ width: `${calculateContribution(playerStats.totalXpEarned, globalStats.totalXpEarned)}%` }"
                    ></div>
                  </div>
                  <div class="contribution-value">
                    {{ calculateContribution(playerStats.totalXpEarned, globalStats.totalXpEarned) }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCanisterStore } from '@/stores/canister';
import { useAuthStore } from '@/stores/auth';
import StatSummaryItem from './StatSummaryItem.vue';
import DonutChart from './DonutChart.vue';

// State
const isLoading = ref(true);
const errorMessage = ref('');
const playerStats = ref(null);
const averageStats = ref(null);
const globalStats = ref(null);
const player = ref(null);

// Computed properties
const winRate = computed(() => {
  if (!playerStats.value || playerStats.value.gamesPlayed === 0) {
    return 0;
  }
  return Math.round((playerStats.value.gamesWon / playerStats.value.gamesPlayed) * 100);
});

const energyData = computed(() => {
  if (!playerStats.value) {
    return [0, 0, 0];
  }
  
  return [
    playerStats.value.energyUsed || 0,
    playerStats.value.energyWasted || 0,
    playerStats.value.energyGenerated - (playerStats.value.energyUsed + playerStats.value.energyWasted) || 0
  ];
});

const energyColors = ['#0FB9FD', '#FF4B4B', '#00E5A4'];

const totalEnergy = computed(() => {
  if (!playerStats.value) {
    return 0;
  }
  return playerStats.value.energyGenerated || 0;
});

const energyEfficiency = computed(() => {
  if (!playerStats.value || playerStats.value.energyGenerated === 0) {
    return 0;
  }
  return Math.round((playerStats.value.energyUsed / playerStats.value.energyGenerated) * 100);
});

// Fetch stats from the backend
const fetchStats = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      throw new Error('Backend canister not initialized');
    }
    
    const authStore = useAuthStore();
    player.value = authStore.player;
    
    // Fetch player's stats
    const myStats = await backend.getMyStats();
    console.log('Player stats:', myStats);
    
    if (myStats) {
      playerStats.value = myStats;
    }
    
    // Fetch player's average stats
    const avgStats = await backend.getPlayerAverageStats();
    console.log('Average stats:', avgStats);
    
    if (avgStats) {
      averageStats.value = avgStats;
    }
    
    // Fetch global stats
    const cosmicStats = await backend.getCosmicraftsStats();
    console.log('Global stats:', cosmicStats);
    
    if (cosmicStats) {
      globalStats.value = cosmicStats;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    errorMessage.value = error.message || 'Failed to load stats data. Please try again.';
    
    // Generate mock data in development mode
    if (import.meta.env.DEV) {
      console.log('Generating mock stats data for development');
      generateMockStats();
    }
  } finally {
    isLoading.value = false;
  }
};

// Helper functions
const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
};

const normalizeForBar = (value, maxValue = 10000) => {
  // Normalize value to be between 0 and 100 for bar chart
  return Math.min(Math.round((value / maxValue) * 100), 100);
};

const calculateWinRate = (wins, total) => {
  if (!total || total === 0) {
    return 0;
  }
  return Math.round((wins / total) * 100);
};

const calculateContribution = (playerValue, globalValue) => {
  if (!playerValue || !globalValue || globalValue === 0) {
    return 0;
  }
  return Math.min(Math.round((playerValue / globalValue) * 100), 100);
};

// Faction helper methods
const getFactionName = (factionId) => {
  const factionNames = {
    0: 'Default',
    1: 'Luminari Federation',
    2: 'Nexus Collective',
    3: 'Nova Imperium',
    4: 'Quantum Syndicate'
  };
  
  return factionNames[factionId] || `Faction ${factionId}`;
};

const getFactionImage = (factionId) => {
  return `/assets/factions/faction-${factionId}.webp`;
};

// Game mode helper methods
const getGameModeName = (gameModeId) => {
  const gameModeNames = {
    0: 'Default',
    1: 'Solo Campaign',
    2: 'Ranked Match',
    3: 'Quick Play',
    4: 'Tournament'
  };
  
  return gameModeNames[gameModeId] || `Mode ${gameModeId}`;
};

const getGameModeIcon = (gameModeId) => {
  const gameModeIcons = {
    0: 'fas fa-gamepad',
    1: 'fas fa-user',
    2: 'fas fa-trophy',
    3: 'fas fa-bolt',
    4: 'fas fa-medal'
  };
  
  return gameModeIcons[gameModeId] || 'fas fa-gamepad';
};

// Generate mock stats for development
const generateMockStats = () => {
  playerStats.value = {
    gamesPlayed: 142,
    gamesWon: 87,
    gamesLost: 55,
    energyGenerated: 45720,
    energyUsed: 38940,
    energyWasted: 6780,
    totalKills: 456,
    totalDamageDealt: 156400,
    totalDamageTaken: 89200,
    totalDamageCrit: 48300,
    totalDamageEvaded: 24800,
    totalXpEarned: 38500,
    totalGamesWithFaction: [
      { factionID: 1, gamesPlayed: 53, gamesWon: 32 },
      { factionID: 2, gamesPlayed: 48, gamesWon: 26 },
      { factionID: 3, gamesPlayed: 41, gamesWon: 29 }
    ],
    totalGamesGameMode: [
      { gameModeID: 1, gamesPlayed: 65, gamesWon: 42 },
      { gameModeID: 2, gamesPlayed: 45, gamesWon: 28 },
      { gameModeID: 3, gamesPlayed: 32, gamesWon: 17 }
    ],
    totalGamesWithCharacter: []
  };
  
  averageStats.value = {
    averageEnergyGenerated: 322,
    averageEnergyUsed: 274,
    averageEnergyWasted: 48,
    averageDamageDealt: 1101,
    averageKills: 3.2,
    averageXpEarned: 271
  };
  
  globalStats.value = {
    totalGamesPlayed: 54280,
    totalGamesSP: 38420,
    totalGamesMP: 15860,
    totalDamageDealt: 68540000,
    totalTimePlayed: 8645000,
    totalKills: 184320,
    totalEnergyGenerated: 18450000,
    totalEnergyUsed: 15240000,
    totalEnergyWasted: 3210000,
    totalXpEarned: 14850000,
    totalGamesWithFaction: [],
    totalGamesGameMode: [],
    totalGamesWithCharacter: []
  };
};

// Initialize on mount
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.stats-section {
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

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--cosmic-text-secondary);
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

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Card Styles */
.stat-card {
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  box-shadow: var(--cosmic-shadow-md);
  overflow: hidden;
  transition: all var(--cosmic-transition-medium);
}

.stat-card:hover {
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-sm);
  transform: translateY(-3px);
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--cosmic-text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header h3 i {
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.4));
}

.player-level {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary);
  background: rgba(15, 185, 253, 0.1);
  padding: 0.3rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(15, 185, 253, 0.15);
}

/* Summary Card */
.summary-card {
  margin-bottom: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

/* Combat Stats */
.combat-stats {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-label {
  width: 130px;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  flex-shrink: 0;
}

.stat-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-bar {
  flex: 1;
  height: 8px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  width: 0;
  border-radius: 4px;
  transition: width 1.5s ease-out;
}

.stat-bar-fill.damage-dealt {
  background: linear-gradient(90deg, var(--cosmic-blue), var(--cosmic-blue-light));
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.6);
}

.stat-bar-fill.damage-taken {
  background: linear-gradient(90deg, var(--cosmic-red), #ff7575);
  box-shadow: 0 0 8px rgba(255, 75, 75, 0.6);
}

.stat-bar-fill.damage-crit {
  background: linear-gradient(90deg, var(--cosmic-purple), #d17df4);
  box-shadow: 0 0 8px rgba(157, 53, 191, 0.6);
}

.stat-bar-fill.damage-evaded {
  background: linear-gradient(90deg, var(--cosmic-green), #4dffcc);
  box-shadow: 0 0 8px rgba(0, 229, 164, 0.6);
}

.stat-bar-fill.kills {
  background: linear-gradient(90deg, var(--cosmic-orange), #ffb84d);
  box-shadow: 0 0 8px rgba(255, 145, 0, 0.6);
}

.stat-value {
  min-width: 70px;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

/* Energy Stats */
.energy-stats {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.energy-donut-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.energy-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.energy-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.energy-stat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.color-dot.generated {
  background-color: #00E5A4;
  box-shadow: 0 0 5px rgba(0, 229, 164, 0.6);
}

.color-dot.used {
  background-color: #0FB9FD;
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.6);
}

.color-dot.wasted {
  background-color: #FF4B4B;
  box-shadow: 0 0 5px rgba(255, 75, 75, 0.6);
}

.energy-stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.usage-efficiency {
  grid-column: span 2;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  text-align: center;
}

.usage-efficiency .energy-stat-value {
  font-size: 1.5rem;
  color: var(--cosmic-blue);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.6);
}

/* Average Stats */
.average-stats {
  padding: 1.5rem;
}

.average-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.average-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all var(--cosmic-transition-fast);
}

.average-item:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-sm);
}

.average-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  font-size: 1.25rem;
  flex-shrink: 0;
}

.average-details {
  flex: 1;
}

.average-label {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
  margin-bottom: 0.25rem;
}

.average-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

/* Faction Stats */
.factions-stats {
  padding: 1.5rem;
  max-height: 350px;
  overflow-y: auto;
}

.faction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all var(--cosmic-transition-fast);
}

.faction-item:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateX(5px);
  box-shadow: var(--cosmic-shadow-sm);
}

.faction-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(15, 185, 253, 0.2);
  background: rgba(15, 185, 253, 0.1);
}

.faction-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.faction-details {
  flex: 1;
}

.faction-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.5rem;
}

.faction-stats {
  display: flex;
  gap: 1rem;
}

.faction-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.faction-stat .stat-label {
  width: auto;
  color: var(--cosmic-text-tertiary);
}

.faction-stat .stat-value {
  min-width: auto;
  text-align: left;
  color: var(--cosmic-blue);
}

/* Game Modes Stats */
.game-modes-stats {
  padding: 1.5rem;
}

.game-modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.game-mode-item {
  padding: 1.25rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all var(--cosmic-transition-fast);
}

.game-mode-item:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.game-mode-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  font-size: 1.5rem;
  margin: 0 auto 1rem;
}

.game-mode-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  text-align: center;
  margin-bottom: 1rem;
}

.game-mode-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.game-mode-stat {
  text-align: center;
}

.mode-stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cosmic-blue);
  margin-bottom: 0.25rem;
}

.mode-stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

/* Global Stats */
.global-stats {
  padding: 1.5rem;
}

.global-stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.compare-to-global {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

.contribution-header {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  text-align: center;
  margin-bottom: 1.5rem;
}

.contribution-bars {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contribution-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contribution-label {
  width: 130px;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  flex-shrink: 0;
}

.contribution-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contribution-bar {
  flex: 1;
  height: 8px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.contribution-bar-fill {
  height: 100%;
  width: 0;
  border-radius: 4px;
  background: linear-gradient(90deg, #9D35BF, #c552ed);
  box-shadow: 0 0 8px rgba(157, 53, 191, 0.6);
  transition: width 1.5s ease-out;
}

.contribution-value {
  min-width: 70px;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

/* Empty States */
.empty-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.empty-stats i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .summary-grid, .global-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-grid, .global-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .energy-stats {
    flex-direction: column;
  }
  
  .energy-details {
    grid-template-columns: 1fr;
  }
  
  .average-grid {
    grid-template-columns: 1fr;
  }
  
  .game-modes-grid {
    grid-template-columns: 1fr;
  }
  
  .contribution-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .contribution-label {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .summary-grid, .global-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .faction-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .stat-label {
    width: 100%;
  }
  
  .stat-bar-container {
    width: 100%;
  }
}
</style> 