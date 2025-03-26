<template>
  <div class="achievements-section">
    <div class="section-header">
      <h2>Achievements</h2>
      <p class="section-description">
        Complete achievements to earn rewards and showcase your accomplishments!
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="cosmic-loader"></div>
      <p>Loading achievements...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="errorMessage" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ errorMessage }}</p>
      <button @click="fetchAchievements" class="cosmic-button cosmic-button-primary">
        Retry
      </button>
    </div>
    
    <!-- Content -->
    <div v-else class="achievements-content">
      <div class="achievements-explorer">
        <!-- Categories Sidebar -->
        <div class="categories-sidebar">
          <div class="search-bar">
            <div class="search-input-container">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search achievements..."
                class="search-input"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div class="categories-list">
            <div class="progress-overview">
              <div class="achievement-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ completedAchievements }}</span>
                  <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ totalAchievements }}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ completionPercentage }}%</span>
                  <span class="stat-label">Completion</span>
                </div>
              </div>
              
              <div class="global-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${completionPercentage}%` }"></div>
                </div>
              </div>
            </div>
            
            <div 
              class="category-item"
              :class="{ active: activeCategory === 'all' }"
              @click="activeCategory = 'all'"
            >
              <div class="category-icon">
                <i class="fas fa-medal"></i>
              </div>
              <div class="category-info">
                <h3>All Achievements</h3>
                <div class="category-progress">
                  <span>{{ completedAchievements }}/{{ totalAchievements }}</span>
                </div>
              </div>
            </div>
            
            <div
              v-for="category in achievementCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: activeCategory === category.id }"
              @click="activeCategory = category.id"
            >
              <div class="category-icon" :class="getCategoryClass(category.name)">
                <i :class="getCategoryIcon(category.name)"></i>
              </div>
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                <div class="category-progress">
                  <span>{{ getCategoryProgress(category) }}</span>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${getCategoryCompletionPercentage(category)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Achievements Display Area -->
        <div class="achievements-display">
          <div class="display-header">
            <h3>{{ displayTitle }}</h3>
            
            <div class="display-filter">
              <button 
                class="filter-button"
                :class="{ active: currentFilter === 'all' }"
                @click="currentFilter = 'all'"
              >
                All
              </button>
              <button 
                class="filter-button"
                :class="{ active: currentFilter === 'completed' }"
                @click="currentFilter = 'completed'"
              >
                Completed
              </button>
              <button 
                class="filter-button"
                :class="{ active: currentFilter === 'in-progress' }"
                @click="currentFilter = 'in-progress'"
              >
                In Progress
              </button>
            </div>
          </div>
          
          <div class="achievement-results">
            <div v-if="filteredAchievements.length === 0" class="empty-achievements">
              <i class="fas fa-trophy"></i>
              <p v-if="searchQuery">No achievements found for "{{ searchQuery }}"</p>
              <p v-else>No achievements in this category yet</p>
            </div>
            
            <template v-else>
              <!-- Achievement Lines (for category view) -->
              <div v-if="viewingCategory && activeCategory !== 'all'" class="achievement-lines">
                <div 
                  v-for="line in filteredAchievements" 
                  :key="'line-' + line.id"
                  class="achievement-line"
                >
                  <div class="line-header" @click="toggleLine(line.id)">
                    <h4>{{ line.name }}</h4>
                    <div class="line-progress">
                      <span>{{ getLineProgress(line) }}</span>
                    </div>
                    <div class="line-toggle">
                      <i :class="expandedLines.includes(line.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                    </div>
                  </div>
                  
                  <div v-if="expandedLines.includes(line.id)" class="line-achievements">
                    <AchievementCard 
                      v-for="achievement in line.individualAchievements"
                      :key="achievement.id"
                      :achievement="achievement"
                      @claim="claimIndividualAchievement"
                    />
                    
                    <div class="line-reward">
                      <h5>Line Completion Reward:</h5>
                      <div class="reward-items">
                        <div v-for="(reward, index) in line.reward" :key="index" class="reward-item">
                          <i :class="getRewardIcon(reward)"></i>
                          <span>{{ formatReward(reward) }}</span>
                        </div>
                      </div>
                      <button 
                        v-if="isLineCompleted(line) && !line.claimed" 
                        @click="claimLineReward(line.id)"
                        class="cosmic-button cosmic-button-primary"
                      >
                        Claim Line Reward
                      </button>
                      <div v-else-if="line.claimed" class="claimed-status">
                        <i class="fas fa-check-circle"></i>
                        <span>Reward Claimed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Individual Achievements (for search results or "all" view) -->
              <div v-else class="individual-achievements-grid">
                <AchievementCard 
                  v-for="achievement in filteredAchievements"
                  :key="'ind-' + achievement.id"
                  :achievement="achievement"
                  @claim="claimIndividualAchievement"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCanisterStore } from '@/stores/canister';
import AchievementCard from './AchievementCard.vue';

// State
const isLoading = ref(true);
const errorMessage = ref('');
const searchQuery = ref('');
const activeCategory = ref('all');
const currentFilter = ref('all');
const expandedLines = ref([]);
const categories = ref([]);
const achievements = ref([]);

// Function to toggle expanded line
const toggleLine = (lineId) => {
  if (expandedLines.value.includes(lineId)) {
    expandedLines.value = expandedLines.value.filter(id => id !== lineId);
  } else {
    expandedLines.value.push(lineId);
  }
};

// Computed properties
const achievementCategories = computed(() => {
  return categories.value;
});

const totalAchievements = computed(() => {
  let count = 0;
  categories.value.forEach(category => {
    category.achievements.forEach(line => {
      count += line.individualAchievements.length;
    });
  });
  return count;
});

const completedAchievements = computed(() => {
  let count = 0;
  categories.value.forEach(category => {
    category.achievements.forEach(line => {
      line.individualAchievements.forEach(achievement => {
        if (achievement.completed) {
          count++;
        }
      });
    });
  });
  return count;
});

const completionPercentage = computed(() => {
  if (totalAchievements.value === 0) return 0;
  return Math.round((completedAchievements.value / totalAchievements.value) * 100);
});

const viewingCategory = computed(() => {
  return activeCategory.value !== 'all' || searchQuery.value === '';
});

const displayTitle = computed(() => {
  if (searchQuery.value) {
    return `Search Results for "${searchQuery.value}"`;
  }
  
  if (activeCategory.value === 'all') {
    return "All Achievements";
  }
  
  const category = categories.value.find(c => c.id === activeCategory.value);
  return category ? category.name : "Achievements";
});

const filteredAchievements = computed(() => {
  let result = [];
  
  // If we're searching, flatten all achievements and filter by search query
  if (searchQuery.value) {
    let allAchievements = [];
    categories.value.forEach(category => {
      category.achievements.forEach(line => {
        line.individualAchievements.forEach(achievement => {
          allAchievements.push({
            ...achievement,
            categoryName: category.name,
            lineName: line.name
          });
        });
      });
    });
    
    // Filter by search query
    result = allAchievements.filter(achievement => 
      achievement.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      achievement.categoryName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      achievement.lineName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } 
  // If we're viewing all achievements, show all lines
  else if (activeCategory.value === 'all') {
    categories.value.forEach(category => {
      category.achievements.forEach(line => {
        // Include the line if it has any visible achievements after filtering
        const visibleAchievements = line.individualAchievements.filter(achievement => 
          filterAchievementByStatus(achievement)
        );
        
        if (visibleAchievements.length > 0) {
          result.push({
            ...line,
            categoryName: category.name,
            individualAchievements: visibleAchievements
          });
        }
      });
    });
  } 
  // If we're viewing a specific category, show its lines
  else {
    const category = categories.value.find(c => c.id === activeCategory.value);
    if (category) {
      result = category.achievements.map(line => ({
        ...line,
        categoryName: category.name,
        individualAchievements: line.individualAchievements.filter(achievement => 
          filterAchievementByStatus(achievement)
        )
      })).filter(line => line.individualAchievements.length > 0);
    }
  }
  
  return result;
});

// Helper function to filter achievements by completion status
const filterAchievementByStatus = (achievement) => {
  if (currentFilter.value === 'all') return true;
  if (currentFilter.value === 'completed') return achievement.completed;
  if (currentFilter.value === 'in-progress') return !achievement.completed;
  return true;
};

// Helper methods
const clearSearch = () => {
  searchQuery.value = '';
};

const getCategoryClass = (categoryName) => {
  const normalizedName = categoryName.toLowerCase();
  if (normalizedName.includes('social')) return 'social';
  if (normalizedName.includes('combat')) return 'combat';
  if (normalizedName.includes('collection')) return 'collection';
  if (normalizedName.includes('exploration')) return 'exploration';
  return 'default';
};

const getCategoryIcon = (categoryName) => {
  const normalizedName = categoryName.toLowerCase();
  if (normalizedName.includes('social')) return 'fas fa-users';
  if (normalizedName.includes('combat')) return 'fas fa-fist-raised';
  if (normalizedName.includes('collection')) return 'fas fa-layer-group';
  if (normalizedName.includes('exploration')) return 'fas fa-compass';
  return 'fas fa-star';
};

const getCategoryProgress = (category) => {
  let completed = 0;
  let total = 0;
  
  category.achievements.forEach(line => {
    line.individualAchievements.forEach(achievement => {
      total++;
      if (achievement.completed) {
        completed++;
      }
    });
  });
  
  return `${completed}/${total}`;
};

const getCategoryCompletionPercentage = (category) => {
  let completed = 0;
  let total = 0;
  
  category.achievements.forEach(line => {
    line.individualAchievements.forEach(achievement => {
      total++;
      if (achievement.completed) {
        completed++;
      }
    });
  });
  
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const getLineProgress = (line) => {
  let completed = 0;
  const total = line.individualAchievements.length;
  
  line.individualAchievements.forEach(achievement => {
    if (achievement.completed) {
      completed++;
    }
  });
  
  return `${completed}/${total}`;
};

const isLineCompleted = (line) => {
  let completed = 0;
  
  line.individualAchievements.forEach(achievement => {
    if (achievement.completed) {
      completed++;
    }
  });
  
  return completed >= line.requiredProgress;
};

const getRewardIcon = (reward) => {
  const rewardType = reward.rewardType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof rewardType === 'object') {
    typeName = Object.keys(rewardType)[0];
  } else {
    typeName = rewardType;
  }
  
  const iconMap = {
    'XP': 'fas fa-star',
    'Stardust': 'fas fa-coins',
    'NFT': 'fas fa-cube',
    'Chest': 'fas fa-box-open',
    'Title': 'fas fa-crown',
    'Avatar': 'fas fa-user-astronaut',
    'Multiplier': 'fas fa-percentage',
    'default': 'fas fa-gift'
  };
  
  return iconMap[typeName] || iconMap.default;
};

const formatReward = (reward) => {
  const amount = reward.amount || 0;
  const rewardType = reward.rewardType || {};
  
  // Extract the type name from the variant object
  let typeName;
  if (typeof rewardType === 'object') {
    typeName = Object.keys(rewardType)[0];
  } else {
    typeName = rewardType;
  }
  
  switch(typeName) {
    case 'XP':
      return `${amount} XP`;
    case 'Stardust':
      return `${amount} Stardust`;
    case 'NFT':
      return `${amount} NFT`;
    case 'Chest':
      return `${amount} Chest`;
    case 'Title':
      return `Special Title`;
    case 'Avatar':
      return `Avatar Unlock`;
    case 'Multiplier':
      return `${amount}% Multiplier`;
    default:
      return `${amount} Reward`;
  }
};

// API methods
const fetchAchievements = async () => {
  console.log("Fetching achievements...");
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      throw new Error("Backend canister not initialized");
    }
    
    // Fetch user achievements
    const achievementsResult = await backend.getUserAchievementsStructureByCaller();
    console.log("Achievements response:", achievementsResult);
    
    if (!achievementsResult) {
      throw new Error("Failed to load achievements data");
    }
    
    // Process achievements
    categories.value = achievementsResult.map(category => {
      // Process each category
      return {
        ...category,
        achievements: category.achievements.map(line => {
          // Process each achievement line
          return {
            ...line,
            individualAchievements: line.individualAchievements.map(achievement => {
              // Process each individual achievement
              return {
                ...achievement,
                completed: achievement.completed || achievement.progress >= achievement.requiredProgress
              };
            })
          };
        })
      };
    });
    
    // Expand first line in each category by default
    categories.value.forEach(category => {
      if (category.achievements.length > 0) {
        expandedLines.value.push(category.achievements[0].id);
      }
    });
    
    console.log("Processed achievements:", categories.value);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    errorMessage.value = error.message || "Failed to load achievements data. Please try again.";
    
    // Generate mock data in development mode
    if (import.meta.env.DEV) {
      console.log("Generating mock achievement data for development");
      generateMockAchievements();
    }
  } finally {
    isLoading.value = false;
  }
};

const claimIndividualAchievement = async (achievementId) => {
  console.log(`Claiming individual achievement: ${achievementId}`);
  
  try {
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      throw new Error("Backend canister not initialized");
    }
    
    const result = await backend.claimIndividualAchievementReward(achievementId);
    console.log("Claim result:", result);
    
    // Refresh achievements data after claiming
    await fetchAchievements();
    
    // Show success notification
    alert("Achievement reward claimed successfully!");
  } catch (error) {
    console.error("Error claiming achievement reward:", error);
    alert("Failed to claim achievement reward. Please try again.");
  }
};

const claimLineReward = async (lineId) => {
  console.log(`Claiming achievement line reward: ${lineId}`);
  
  try {
    const canister = useCanisterStore();
    const backend = await canister.get('cosmicrafts');
    
    if (!backend) {
      throw new Error("Backend canister not initialized");
    }
    
    const result = await backend.claimAchievementLineReward(lineId);
    console.log("Claim line result:", result);
    
    // Refresh achievements data after claiming
    await fetchAchievements();
    
    // Show success notification
    alert("Achievement line reward claimed successfully!");
  } catch (error) {
    console.error("Error claiming achievement line reward:", error);
    alert("Failed to claim achievement line reward. Please try again.");
  }
};

// Generate mock achievement data for development/testing
const generateMockAchievements = () => {
  console.log("Generating mock achievements data");
  
  // Mock categories
  categories.value = [
    {
      id: 1,
      name: "Social Achievements",
      achievements: [
        {
          id: 1,
          name: "Twitter",
          requiredProgress: 4,
          completed: false,
          progress: 2,
          claimed: false,
          reward: [
            { rewardType: { Title: null }, amount: 91 },
            { rewardType: { Stardust: null }, amount: 100 },
            { rewardType: { Chest: null }, amount: 1 },
            { rewardType: { XP: null }, amount: 50 }
          ],
          individualAchievements: [
            { id: 1, name: "Connect with Twitter", achievementType: { Social: null }, requiredProgress: 1, completed: true, reward: [{ rewardType: { Stardust: null }, amount: 10 }], progress: 1, claimed: true },
            { id: 2, name: "Follow us on Twitter", achievementType: { Social: null }, requiredProgress: 1, completed: true, reward: [{ rewardType: { Chest: null }, amount: 1 }], progress: 1, claimed: false },
            { id: 3, name: "Share Post on Twitter", achievementType: { Social: null }, requiredProgress: 1, completed: false, reward: [{ rewardType: { XP: null }, amount: 25 }], progress: 0, claimed: false },
            { id: 4, name: "Tag Friends on Twitter", achievementType: { Social: null }, requiredProgress: 1, completed: false, reward: [{ rewardType: { Stardust: null }, amount: 50 }], progress: 0, claimed: false }
          ]
        },
        {
          id: 2,
          name: "Discord",
          requiredProgress: 3,
          completed: false,
          progress: 1,
          claimed: false,
          reward: [
            { rewardType: { Title: null }, amount: 92 },
            { rewardType: { Stardust: null }, amount: 150 },
            { rewardType: { XP: null }, amount: 75 }
          ],
          individualAchievements: [
            { id: 5, name: "Join Discord Server", achievementType: { Social: null }, requiredProgress: 1, completed: true, reward: [{ rewardType: { Stardust: null }, amount: 15 }], progress: 1, claimed: true },
            { id: 6, name: "Reach Level 5 in Discord", achievementType: { Social: null }, requiredProgress: 5, completed: false, reward: [{ rewardType: { XP: null }, amount: 30 }], progress: 3, claimed: false },
            { id: 7, name: "Post in #general", achievementType: { Social: null }, requiredProgress: 1, completed: false, reward: [{ rewardType: { Chest: null }, amount: 1 }], progress: 0, claimed: false }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Combat Achievements",
      achievements: [
        {
          id: 3,
          name: "Novice Combatant",
          requiredProgress: 3,
          completed: false,
          progress: 1,
          claimed: false,
          reward: [
            { rewardType: { Title: null }, amount: 93 },
            { rewardType: { Stardust: null }, amount: 200 },
            { rewardType: { XP: null }, amount: 100 }
          ],
          individualAchievements: [
            { id: 8, name: "Complete First Battle", achievementType: { GamesCompleted: null }, requiredProgress: 1, completed: true, reward: [{ rewardType: { XP: null }, amount: 20 }], progress: 1, claimed: true },
            { id: 9, name: "Win 3 Battles", achievementType: { GamesWon: null }, requiredProgress: 3, completed: false, reward: [{ rewardType: { Stardust: null }, amount: 30 }], progress: 1, claimed: false },
            { id: 10, name: "Deal 1000 Damage", achievementType: { DamageDealt: null }, requiredProgress: 1000, completed: false, reward: [{ rewardType: { Chest: null }, amount: 1 }], progress: 450, claimed: false }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "Collection Achievements",
      achievements: [
        {
          id: 4,
          name: "Collector",
          requiredProgress: 2,
          completed: false,
          progress: 0,
          claimed: false,
          reward: [
            { rewardType: { Avatar: null }, amount: 94 },
            { rewardType: { Stardust: null }, amount: 250 }
          ],
          individualAchievements: [
            { id: 11, name: "Collect 5 NFTs", achievementType: { NFTsMinted: null }, requiredProgress: 5, completed: false, reward: [{ rewardType: { XP: null }, amount: 30 }], progress: 3, claimed: false },
            { id: 12, name: "Open 3 Chests", achievementType: { ChestsOpened: null }, requiredProgress: 3, completed: false, reward: [{ rewardType: { Stardust: null }, amount: 50 }], progress: 1, claimed: false }
          ]
        }
      ]
    }
  ];
  
  console.log("Mock achievements data generated:", categories.value);
};

// Initialize on mount
onMounted(() => {
  fetchAchievements();
});

// Watch for filter changes
watch([searchQuery, currentFilter], () => {
  // Reset expanded lines when filter changes
  if (searchQuery.value) {
    expandedLines.value = [];
  }
});
</script>

<style scoped>
.achievements-section {
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
  min-height: 400px;
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
  min-height: 400px;
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

.achievements-content {
  padding: 1rem 0;
}

.achievements-explorer {
  display: flex;
  min-height: 600px;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
  box-shadow: var(--cosmic-shadow-md);
}

/* Categories Sidebar */
.categories-sidebar {
  width: 300px;
  background: rgba(15, 185, 253, 0.03);
  border-right: 1px solid rgba(15, 185, 253, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container i {
  position: absolute;
  left: 0.75rem;
  color: var(--cosmic-text-tertiary);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-sm);
  color: var(--cosmic-text-primary);
}

.search-input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.2);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
}

.clear-search:hover {
  color: var(--cosmic-blue);
}

.progress-overview {
  padding: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.achievement-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--cosmic-blue);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.global-progress .progress-bar {
  height: 6px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.global-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue) 0%, var(--cosmic-blue-light) 100%);
  border-radius: 3px;
}

.categories-list {
  flex: 1;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.05);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.category-item:hover {
  background: rgba(15, 185, 253, 0.08);
}

.category-item.active {
  background: rgba(15, 185, 253, 0.12);
  border-left: 3px solid var(--cosmic-blue);
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  flex-shrink: 0;
}

.category-icon.social {
  background: rgba(157, 53, 191, 0.1);
  color: var(--cosmic-purple);
}

.category-icon.combat {
  background: rgba(255, 75, 75, 0.1);
  color: var(--cosmic-red);
}

.category-icon.collection {
  background: rgba(255, 145, 0, 0.1);
  color: var(--cosmic-orange);
}

.category-icon.exploration {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-progress {
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
  display: flex;
  flex-direction: column;
}

.category-progress .progress-bar {
  height: 4px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 2px;
  margin-top: 0.25rem;
  overflow: hidden;
}

.category-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cosmic-blue) 0%, var(--cosmic-blue-light) 100%);
  border-radius: 2px;
}

/* Achievements Display Area */
.achievements-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.display-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.display-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
}

.display-filter {
  display: flex;
  gap: 0.5rem;
}

.filter-button {
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  border-radius: var(--cosmic-radius-sm);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.filter-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.filter-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: var(--cosmic-blue);
  color: var(--cosmic-blue);
}

.achievement-results {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.empty-achievements {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.empty-achievements i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-achievements p {
  font-size: 1.1rem;
}

/* Achievement Lines */
.achievement-lines {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.achievement-line {
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
  overflow: hidden;
  background: rgba(15, 185, 253, 0.03);
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: rgba(15, 185, 253, 0.08);
  transition: background var(--cosmic-transition-fast);
}

.line-header:hover {
  background: rgba(15, 185, 253, 0.12);
}

.line-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--cosmic-text-primary);
}

.line-progress {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.line-toggle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-text-tertiary);
}

.line-achievements {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.line-reward {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: var(--cosmic-radius-sm);
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.line-reward h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

.reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  background: rgba(15, 185, 253, 0.08);
  border-radius: var(--cosmic-radius-sm);
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.reward-item i {
  color: var(--cosmic-blue);
}

.claimed-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-green);
  font-size: 0.9rem;
}

.claimed-status i {
  font-size: 1.1rem;
}

/* Individual Achievements Grid */
.individual-achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .achievements-explorer {
    flex-direction: column;
  }
  
  .categories-sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  }
  
  .categories-list {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
  }
  
  .category-item {
    flex-direction: column;
    width: 100px;
    height: 100px;
    text-align: center;
    border-radius: var(--cosmic-radius-md);
    border: 1px solid rgba(15, 185, 253, 0.1);
    padding: 0.75rem;
    margin-right: 0.5rem;
    border-left: none;
  }
  
  .category-item.active {
    border-left: 1px solid rgba(15, 185, 253, 0.3);
    border-bottom: 3px solid var(--cosmic-blue);
  }
  
  .category-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .category-info h3 {
    font-size: 0.9rem;
  }
  
  .individual-achievements-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .display-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .reward-items {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style> 