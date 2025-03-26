<!-- StatsSection.vue -->
<template>
  <div class="stats-container cosmic-panel">
    <div class="section-header">
      <h2>Player Statistics</h2>
      <div class="actions">
        <button @click="refreshStats" class="cosmic-button-sm cosmic-button-outline-primary">
          <i class="fas fa-sync-alt"></i>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="stats-loading">
      <div class="cosmic-loader small"></div>
      <p>Loading statistics...</p>
    </div>

    <div v-else class="stats-content">
      <!-- Summary Section -->
      <div class="stats-summary">
        <div class="summary-card games-played">
          <div class="card-icon">
            <i class="fas fa-gamepad"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ formatStat(playerStats?.gamesPlayed) }}</span>
            <span class="card-label">Games Played</span>
          </div>
        </div>

        <div class="summary-card wins">
          <div class="card-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ formatStat(playerStats?.gamesWon) }}</span>
            <span class="card-label">Victories</span>
          </div>
        </div>

        <div class="summary-card win-rate">
          <div class="card-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ calculateWinRate() }}%</span>
            <span class="card-label">Win Rate</span>
          </div>
        </div>

        <div class="summary-card elo">
          <div class="card-icon">
            <i class="fas fa-medal"></i>
          </div>
          <div class="card-content">
            <span class="card-value">{{ playerElo ? playerElo.toFixed(0) : '1000' }}</span>
            <span class="card-label">ELO Rating</span>
          </div>
        </div>
      </div>

      <!-- Combat Stats Section -->
      <div class="stats-detail-section">
        <h3>Combat Performance</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-bolt"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.totalDamageDealt) }}</div>
              <div class="stat-label">Total Damage</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-crosshairs"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.totalDamageCrit) }}</div>
              <div class="stat-label">Critical Hits</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-skull"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.totalKills) }}</div>
              <div class="stat-label">Total Kills</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.totalDamageTaken) }}</div>
              <div class="stat-label">Damage Taken</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-wind"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.totalDamageEvaded) }}</div>
              <div class="stat-label">Damage Evaded</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-star"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.totalXpEarned) }}</div>
              <div class="stat-label">XP Earned</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Energy Management Section -->
      <div class="stats-detail-section">
        <h3>Energy Management</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-battery-full"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.energyGenerated) }}</div>
              <div class="stat-label">Energy Generated</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-plug"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.energyUsed) }}</div>
              <div class="stat-label">Energy Used</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-trash-alt"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(playerStats?.energyWasted) }}</div>
              <div class="stat-label">Energy Wasted</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Per-match Averages Section -->
      <div class="stats-detail-section">
        <h3>Per-match Averages</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-bolt"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(averageStats?.averageDamageDealt) }}</div>
              <div class="stat-label">Avg. Damage</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-skull"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(averageStats?.averageKills) }}</div>
              <div class="stat-label">Avg. Kills</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-battery-full"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(averageStats?.averageEnergyGenerated) }}</div>
              <div class="stat-label">Avg. Energy Generated</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-plug"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(averageStats?.averageEnergyUsed) }}</div>
              <div class="stat-label">Avg. Energy Used</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-trash-alt"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(averageStats?.averageEnergyWasted) }}</div>
              <div class="stat-label">Avg. Energy Wasted</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-star"></i></div>
            <div class="stat-info">
              <div class="stat-value">{{ formatStat(averageStats?.averageXpEarned) }}</div>
              <div class="stat-label">Avg. XP Earned</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Faction/Character Preferences -->
      <div v-if="hasFactionData || hasCharacterData" class="stats-detail-section">
        <h3>Game Preferences</h3>
        
        <div v-if="hasFactionData" class="preferences-group">
          <h4>Most Played Factions</h4>
          <div class="preferences-grid">
            <div v-for="(faction, index) in topFactions" :key="'faction-'+index" class="preference-item">
              <div class="preference-icon">
                <img :src="getFactionIcon(faction.factionID)" :alt="getFactionName(faction.factionID)" class="faction-icon">
              </div>
              <div class="preference-info">
                <div class="preference-name">{{ getFactionName(faction.factionID) }}</div>
                <div class="preference-value">{{ faction.gamesPlayed }} games</div>
                <div class="preference-winrate">{{ calculateFactionWinRate(faction) }}% win rate</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="hasCharacterData" class="preferences-group">
          <h4>Most Played Characters</h4>
          <div class="preferences-grid">
            <div v-for="(character, index) in topCharacters" :key="'character-'+index" class="preference-item">
              <div class="preference-icon">
                <img :src="getCharacterIcon(character.characterID)" :alt="getCharacterName(character.characterID)" class="character-icon">
              </div>
              <div class="preference-info">
                <div class="preference-name">{{ getCharacterName(character.characterID) }}</div>
                <div class="preference-value">{{ character.gamesPlayed }} games</div>
                <div class="preference-winrate">{{ calculateCharacterWinRate(character) }}% win rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Mode Stats Section -->
      <div v-if="hasGameModeData" class="stats-detail-section">
        <h3>Game Mode Stats</h3>
        <div class="game-modes-grid">
          <div v-for="(mode, index) in gameModeStats" :key="'mode-'+index" class="game-mode-card">
            <div class="mode-icon">
              <i :class="getGameModeIcon(mode.gameModeID)"></i>
            </div>
            <div class="mode-name">{{ getGameModeName(mode.gameModeID) }}</div>
            <div class="mode-stats">
              <div class="mode-stat">
                <span class="stat-value">{{ mode.gamesPlayed }}</span>
                <span class="stat-label">Games</span>
              </div>
              <div class="mode-stat">
                <span class="stat-value">{{ mode.gamesWon || 0 }}</span>
                <span class="stat-label">Wins</span>
              </div>
              <div class="mode-stat">
                <span class="stat-value">{{ calculateModeWinRate(mode) }}%</span>
                <span class="stat-label">Win Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for New Players -->
      <div v-if="isNewPlayer" class="new-player-message">
        <div class="message-icon">
          <i class="fas fa-rocket"></i>
        </div>
        <h3>Begin Your Cosmic Journey!</h3>
        <p>Play your first game to start collecting statistics and track your progress in the universe.</p>
        <button @click="navigateToGame" class="cosmic-button cosmic-button-primary">
          <span class="button-text">Start Playing</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCanisterStore } from '@/stores/canister';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const canisterStore = useCanisterStore();
const authStore = useAuthStore();

// State variables
const loading = ref(true);
const playerStats = ref(null);
const averageStats = ref(null);
const playerElo = ref(null);
const overallStats = ref(null);

// Check if player is new with no gameplay stats
const isNewPlayer = computed(() => {
  if (!playerStats.value) return true;
  
  return playerStats.value.gamesPlayed === 0 &&
         playerStats.value.totalDamageDealt === 0 &&
         playerStats.value.totalKills === 0;
});

// Computed properties for faction/character/game mode data availability
const hasFactionData = computed(() => {
  return playerStats.value?.totalGamesWithFaction?.length > 0;
});

const hasCharacterData = computed(() => {
  return playerStats.value?.totalGamesWithCharacter?.length > 0;
});

const hasGameModeData = computed(() => {
  return playerStats.value?.totalGamesGameMode?.length > 0;
});

// Get top factions by games played
const topFactions = computed(() => {
  if (!hasFactionData.value) return [];
  
  return [...playerStats.value.totalGamesWithFaction]
    .sort((a, b) => Number(b.gamesPlayed) - Number(a.gamesPlayed))
    .slice(0, 3);
});

// Get top characters by games played
const topCharacters = computed(() => {
  if (!hasCharacterData.value) return [];
  
  return [...playerStats.value.totalGamesWithCharacter]
    .sort((a, b) => Number(b.gamesPlayed) - Number(a.gamesPlayed))
    .slice(0, 3);
});

// Get game mode stats
const gameModeStats = computed(() => {
  if (!hasGameModeData.value) return [];
  
  return [...playerStats.value.totalGamesGameMode]
    .sort((a, b) => Number(b.gamesPlayed) - Number(a.gamesPlayed));
});

// Initialize and fetch data
onMounted(async () => {
  await fetchStats();
});

// Fetch all statistics
const fetchStats = async () => {
  loading.value = true;
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Canister not initialized');
    }

    // Fetch player stats
    const stats = await cosmicrafts.getMyStats();
    console.log('Player stats:', stats);
    
    if (stats && stats.length > 0) {
      playerStats.value = stats[0];
    }

    // Get the player principal ID
    const principal = authStore.getIdentity()?.getPrincipal();
    
    // Fetch player average stats with principal parameter
    try {
      if (principal) {
        const avgStats = await cosmicrafts.getPlayerAverageStats(principal);
        if (avgStats && avgStats.length > 0) {
          averageStats.value = avgStats[0];
        }
      }
    } catch (avgStatsError) {
      console.error(' Error fetching stats:', avgStatsError);
      // Generate mock data for development
      console.log('Generating mock stats data for development');
      generateMockAverageStats();
    }

    // Fetch player ELO
    try {
      if (principal) {
        playerElo.value = await cosmicrafts.getPlayerElo(principal);
      }
    } catch (eloError) {
      console.error('Error fetching ELO:', eloError);
      playerElo.value = 1000; // Default ELO
    }

    // Fetch overall game stats
    try {
      overallStats.value = await cosmicrafts.getCosmicraftsStats();
    } catch (overallStatsError) {
      console.error('Error fetching overall stats:', overallStatsError);
    }

  } catch (error) {
    console.error('Error fetching stats data:', error);
  } finally {
    loading.value = false;
  }
};

// Generate mock average stats if API fails
const generateMockAverageStats = () => {
  averageStats.value = {
    averageDamageDealt: playerStats.value?.gamesPlayed > 0 ? 
      Math.floor(Number(playerStats.value.totalDamageDealt) / Number(playerStats.value.gamesPlayed)) : 0,
    averageKills: playerStats.value?.gamesPlayed > 0 ? 
      Math.floor(Number(playerStats.value.totalKills) / Number(playerStats.value.gamesPlayed)) : 0,
    averageEnergyGenerated: playerStats.value?.gamesPlayed > 0 ? 
      Math.floor(Number(playerStats.value.energyGenerated) / Number(playerStats.value.gamesPlayed)) : 0,
    averageEnergyUsed: playerStats.value?.gamesPlayed > 0 ? 
      Math.floor(Number(playerStats.value.energyUsed) / Number(playerStats.value.gamesPlayed)) : 0,
    averageEnergyWasted: playerStats.value?.gamesPlayed > 0 ? 
      Math.floor(Number(playerStats.value.energyWasted) / Number(playerStats.value.gamesPlayed)) : 0,
    averageXpEarned: playerStats.value?.gamesPlayed > 0 ? 
      Math.floor(Number(playerStats.value.totalXpEarned) / Number(playerStats.value.gamesPlayed)) : 0
  };
};

// Refresh stats
const refreshStats = async () => {
  await fetchStats();
};

// Calculate win rate
const calculateWinRate = () => {
  if (!playerStats.value || Number(playerStats.value.gamesPlayed) === 0) {
    return '0.0';
  }
  
  const winRate = (Number(playerStats.value.gamesWon) / Number(playerStats.value.gamesPlayed)) * 100;
  return winRate.toFixed(1);
};

// Calculate faction win rate
const calculateFactionWinRate = (faction) => {
  if (!faction || !faction.gamesWon || !faction.gamesPlayed) {
    return '0.0';
  }
  
  const winRate = (Number(faction.gamesWon) / Number(faction.gamesPlayed)) * 100;
  return winRate.toFixed(1);
};

// Calculate character win rate
const calculateCharacterWinRate = (character) => {
  if (!character || !character.gamesWon || !character.gamesPlayed) {
    return '0.0';
  }
  
  const winRate = (Number(character.gamesWon) / Number(character.gamesPlayed)) * 100;
  return winRate.toFixed(1);
};

// Calculate game mode win rate
const calculateModeWinRate = (mode) => {
  if (!mode || !mode.gamesWon || !mode.gamesPlayed) {
    return '0.0';
  }
  
  const winRate = (Number(mode.gamesWon) / Number(mode.gamesPlayed)) * 100;
  return winRate.toFixed(1);
};

// Format stats for display (handling bigints)
const formatStat = (value) => {
  if (value === undefined || value === null) {
    return '0';
  }
  
  // Handle bigint
  let numValue = typeof value === 'bigint' ? Number(value) : Number(value);
  
  // Format based on size
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  } else if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  
  return numValue.toString();
};

// Faction-related helper functions
const getFactionName = (factionId) => {
  const factions = {
    0: 'Neutral',
    1: 'Cosmicon',
    2: 'Spirat',
    3: 'Webe',
    4: 'Spade',
    5: 'Arch',
    6: 'Celestial'
  };
  
  return factions[factionId] || `Faction ${factionId}`;
};

const getFactionIcon = (factionId) => {
  return `/assets/factions/faction-${factionId}.webp`;
};

// Character-related helper functions
const getCharacterName = (characterId) => {
  // This would ideally come from a character database
  // Placeholder for demonstration
  return `Character ${characterId}`;
};

const getCharacterIcon = (characterId) => {
  return `/assets/characters/character-${characterId}.webp`;
};

// Game mode helper functions
const getGameModeName = (modeId) => {
  const modes = {
    0: 'Standard',
    1: 'Ranked',
    2: 'Tournament',
    3: 'Practice',
    4: 'Custom',
    5: 'Campaign'
  };
  
  return modes[modeId] || `Mode ${modeId}`;
};

const getGameModeIcon = (modeId) => {
  const icons = {
    0: 'fas fa-chess-board',
    1: 'fas fa-trophy',
    2: 'fas fa-flag-checkered',
    3: 'fas fa-graduation-cap',
    4: 'fas fa-tools',
    5: 'fas fa-book'
  };
  
  return icons[modeId] || 'fas fa-gamepad';
};

// Navigation
const navigateToGame = () => {
  router.push('/games');
};
</script>

<style scoped>
.stats-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.section-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--cosmic-text-primary);
  font-weight: 700;
}

.stats-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Summary Cards */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 991px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all var(--cosmic-transition-medium);
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  background: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.2);
}

.summary-card .card-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.25rem;
  margin-right: 1rem;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  transition: all var(--cosmic-transition-medium);
}

.summary-card:hover .card-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.summary-card .card-content {
  display: flex;
  flex-direction: column;
}

.summary-card .card-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.summary-card .card-label {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

/* Color Variants for Summary Cards */
.summary-card.games-played .card-icon {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.summary-card.wins .card-icon {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
}

.summary-card.win-rate .card-icon {
  background: rgba(157, 53, 191, 0.1);
  color: var(--cosmic-purple);
}

.summary-card.elo .card-icon {
  background: rgba(255, 145, 0, 0.1);
  color: var(--cosmic-orange);
}

/* Detail Sections */
.stats-detail-section {
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 1.5rem;
  border: 1px solid rgba(15, 185, 253, 0.05);
}

.stats-detail-section h3 {
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1.25rem;
  color: var(--cosmic-text-primary);
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
}

.stats-detail-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 3rem;
  height: 2px;
  background: var(--cosmic-blue);
  border-radius: 1px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 991px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(15, 185, 253, 0.05);
  transition: all var(--cosmic-transition-medium);
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
  background: rgba(15, 185, 253, 0.05);
  border-color: rgba(15, 185, 253, 0.1);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1rem;
  margin-right: 1rem;
  background: rgba(15, 185, 253, 0.08);
  color: var(--cosmic-blue);
  transition: all var(--cosmic-transition-medium);
}

.stat-item:hover .stat-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.15);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

/* Preferences Section */
.preferences-group {
  margin-bottom: 1.5rem;
}

.preferences-group h4 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--cosmic-text-secondary);
  font-weight: 600;
}

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 991px) {
  .preferences-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .preferences-grid {
    grid-template-columns: 1fr;
  }
}

.preference-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(15, 185, 253, 0.05);
  transition: all var(--cosmic-transition-medium);
}

.preference-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
  background: rgba(15, 185, 253, 0.05);
  border-color: rgba(15, 185, 253, 0.1);
}

.preference-icon {
  width: 3rem;
  height: 3rem;
  margin-right: 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.preference-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preference-info {
  display: flex;
  flex-direction: column;
}

.preference-name {
  font-size: 1rem;
  font-weight: bold;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.preference-value {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.25rem;
}

.preference-winrate {
  font-size: 0.8rem;
  color: var(--cosmic-green);
}

/* Game Mode Cards */
.game-modes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 991px) {
  .game-modes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .game-modes-grid {
    grid-template-columns: 1fr;
  }
}

.game-mode-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.05);
  transition: all var(--cosmic-transition-medium);
}

.game-mode-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  background: rgba(15, 185, 253, 0.05);
  border-color: rgba(15, 185, 253, 0.1);
}

.mode-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  transition: all var(--cosmic-transition-medium);
}

.game-mode-card:hover .mode-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-md);
}

.mode-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--cosmic-text-primary);
  margin-bottom: 1rem;
  text-align: center;
}

.mode-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.mode-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mode-stat .stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.mode-stat .stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

/* Empty State for New Players */
.new-player-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(120deg, rgba(15, 185, 253, 0.05) 0%, rgba(157, 53, 191, 0.05) 100%);
  border-radius: var(--cosmic-radius-lg);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.message-icon {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--cosmic-blue);
  animation: cosmic-float 4s ease-in-out infinite;
}

.new-player-message h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
}

.new-player-message p {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: var(--cosmic-text-secondary);
  max-width: 30rem;
}

@keyframes cosmic-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style> 