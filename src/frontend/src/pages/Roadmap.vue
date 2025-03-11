<template>
  <div class="roadmap-page">
    <div class="roadmap-container cosmic-page-bg">
      <!-- Hero Section -->
      <RoadmapHero />
      
      <!-- Search and Filter Section -->
      <SearchFilters 
        :availableYears="availableYears"
        :availableMilestones="availableMilestones"
        :availableTags="availableTags"
        @filter-changed="handleFilterChanges"
      />

      <!-- Roadmap Stats Summary -->
      <RoadmapStats 
        :totalMilestones="totalMilestones"
        :totalTasks="totalTasks"
        :completedPercentage="completedPercentage"
      />

      <!-- Roadmap Display -->
      <RoadmapDisplay 
        :quarters="filteredQuarters"
        @update:quarters="quarters = $event"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import roadmapData from '@/data/roadmap.json';
import RoadmapHero from '@/components/roadmap/RoadmapHero.vue';
import SearchFilters from '@/components/roadmap/SearchFilters.vue';
import RoadmapStats from '@/components/roadmap/RoadmapStats.vue';
import RoadmapDisplay from '@/components/roadmap/RoadmapDisplay.vue';

export default {
  name: 'RoadmapPage',
  components: {
    RoadmapHero,
    SearchFilters,
    RoadmapStats,
    RoadmapDisplay
  },
  setup() {
    const quarters = ref([]);
    const searchQuery = ref('');
    const selectedYear = ref('');
    const selectedMilestone = ref('');
    const selectedTags = ref([]);

    const loadRoadmap = () => {
      const data = Object.keys(roadmapData).map(key => {
        const quarter = roadmapData[key];
        return {
          ...quarter,
          open: false,
          milestones: quarter.milestones.map(milestone => ({
            ...milestone,
            open: false,
            tasks: milestone.tasks.map(task => ({
              ...task,
              open: false
            }))
          }))
        };
      });
      quarters.value = data;
    };

    const handleFilterChanges = (filters) => {
      searchQuery.value = filters.searchQuery;
      selectedYear.value = filters.selectedYear;
      selectedMilestone.value = filters.selectedMilestone;
      selectedTags.value = filters.selectedTags;
    };

    // Calculate available filter options
    const availableYears = computed(() => {
      return [...new Set(quarters.value.map(q => q.period.split('-')[0]))];
    });

    const availableMilestones = computed(() => {
      const milestones = [];
      quarters.value.forEach(q => {
        q.milestones.forEach(m => {
          if (!milestones.includes(m.title)) {
            milestones.push(m.title);
          }
        });
      });
      return milestones;
    });

    // Tag related functions
    const availableTags = computed(() => {
      const tags = new Set();
      quarters.value.forEach(quarter => {
        quarter.milestones.forEach(milestone => {
          if (milestone.tags) {
            milestone.tags.forEach(tag => tags.add(tag));
          }
          milestone.tasks.forEach(task => {
            if (task.tags) {
              task.tags.forEach(tag => tags.add(tag));
            }
          });
        });
      });
      return Array.from(tags).sort();
    });

    // Roadmap stats
    const totalMilestones = computed(() => {
      return quarters.value.reduce((sum, quarter) => sum + quarter.milestones.length, 0);
    });

    const totalTasks = computed(() => {
      return quarters.value.reduce((sum, quarter) => {
        return sum + quarter.milestones.reduce((mSum, milestone) => {
          return mSum + milestone.tasks.length;
        }, 0);
      }, 0);
    });

    const completedTasks = computed(() => {
      return quarters.value.reduce((sum, quarter) => {
        return sum + quarter.milestones.reduce((mSum, milestone) => {
          return mSum + milestone.tasks.filter(task => task.status === 'Completed').length;
        }, 0);
      }, 0);
    });

    const completedPercentage = computed(() => {
      if (totalTasks.value === 0) return 0;
      return Math.round((completedTasks.value / totalTasks.value) * 100);
    });

    // Filtered quarters based on search and filters
    const filteredQuarters = computed(() => {
      return quarters.value.filter(q => {
        const matchesYear = selectedYear.value ? q.period.includes(selectedYear.value) : true;
        const matchesMilestone = selectedMilestone.value ? q.milestones.some(m => m.title.includes(selectedMilestone.value)) : true;
        
        let matchesTags = true;
        if (selectedTags.value.length > 0) {
          matchesTags = q.milestones.some(m => {
            // Check if milestone has any of the selected tags
            const milestoneTags = m.tags || [];
            const milestoneHasTags = milestoneTags.some(tag => selectedTags.value.includes(tag));
            
            // Check if any tasks have the selected tags
            const tasksHaveTags = m.tasks.some(t => {
              const taskTags = t.tags || [];
              return taskTags.some(tag => selectedTags.value.includes(tag));
            });
            
            return milestoneHasTags || tasksHaveTags;
          });
        }
        
        const matchesSearch = searchQuery.value ? q.milestones.some(m => 
          m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
          m.tasks.some(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
        ) : true;
        
        return matchesYear && matchesMilestone && matchesSearch && matchesTags;
      });
    });

    onMounted(() => {
      loadRoadmap();
    });

    return {
      quarters,
      filteredQuarters,
      availableYears,
      availableMilestones,
      availableTags,
      totalMilestones,
      totalTasks,
      completedPercentage,
      handleFilterChanges
    };
  }
};
</script>

<style scoped>
/* Base Styling */
.roadmap-page {
  min-height: 100vh;
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  padding-top: 4rem;
  background: linear-gradient(135deg, #0c1016f0, #141b2af0, #0c1016f0), url('@/assets/webp/login.webp') no-repeat center center;
  background-size: cover;
}

/* Main Container */
.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .roadmap-container {
    padding: 1rem;
  }
}
</style>