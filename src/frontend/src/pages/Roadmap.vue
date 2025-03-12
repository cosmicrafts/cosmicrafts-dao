<template>
  <div class="roadmap-page cosmic-page-bg with-glow">
    <!-- Hero Section -->
    <RoadmapHero />
    
    <!-- Search and Filter Section - Container for full width -->
    <div class="roadmap-search-container">
      <div class="cosmic-container">
        <SearchFilters 
          :availableYears="availableYears"
          :availableMilestones="availableMilestones"
          :availableTags="availableTags"
          @filter-changed="handleFilterChanges"
        />
      </div>
    </div>

    <!-- Roadmap Display - Container for full width -->
    <div class="roadmap-display-container">
      <div class="cosmic-container">
        <RoadmapDisplay 
          :quarters="filteredQuarters"
          @update:quarters="quarters = $event"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import roadmapData from '@/data/roadmap.json';
import RoadmapHero from '@/components/roadmap/RoadmapHero.vue';
import SearchFilters from '@/components/roadmap/SearchFilters.vue';
import RoadmapDisplay from '@/components/roadmap/RoadmapDisplay.vue';

export default {
  name: 'RoadmapPage',
  components: {
    RoadmapHero,
    SearchFilters,
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
      handleFilterChanges
    };
  }
};
</script>

<style scoped>
/* Base Styling */
.roadmap-page {
  min-height: 100vh;
  color: var(--cosmic-text-primary);
  position: relative;
  overflow: hidden;
  padding-top: 4rem;
  background: linear-gradient(135deg, #0c1016f0, #141b2af0, #0c1016f0), url('@/assets/webp/login.webp') no-repeat center center;
  background-size: cover;
}

/* Section Containers */
.roadmap-search-container,
.roadmap-display-container {
  width: 100%;
  padding: var(--space-lg) 0;
}

/* First container needs less padding at the bottom since display container follows */
.roadmap-search-container {
  padding-bottom: 0;
}

/* Media Queries for Responsive Design */
@media (max-width: 768px) {
  .roadmap-page {
    padding-top: 2rem;
  }
  
  .roadmap-search-container,
  .roadmap-display-container {
    padding: var(--space-md) 0;
  }
}
</style>