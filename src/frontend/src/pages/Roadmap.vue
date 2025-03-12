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
/* Import centralized variables */
@import '@/components/roadmap/styles/roadmap-variables.css';

/* Base Styling with enhanced futuristic look */
.roadmap-page {
  min-height: 100vh;
  color: rgba(var(--text-primary-rgb), 1);
  position: relative;
  overflow: hidden;
  padding-top: 3.5rem;
  background: linear-gradient(
    145deg, 
    rgba(8, 15, 30, 0.97), 
    rgba(15, 25, 45, 0.97), 
    rgba(10, 18, 35, 0.97)
  ), 
  url('@/assets/webp/login.webp') no-repeat center center;
  background-size: cover;
  font-family: var(--font-family, 'Inter', system-ui, sans-serif);
  backdrop-filter: brightness(0.8) contrast(1.05) saturate(1.3);
}

/* Add subtle animated glow to the page background */
.roadmap-page.with-glow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 0%, 
    rgba(var(--cosmic-blue-rgb), 0.08),
    rgba(var(--cosmic-purple-rgb), 0.05),
    transparent 60%
  );
  pointer-events: none;
  animation: pulse-bg 12s infinite alternate;
}

@keyframes pulse-bg {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Section Containers - Adjusted for full-width display */
.roadmap-search-container {
  width: 100%;
  padding: var(--space-xl) 0 var(--space-md);
  position: relative;
  z-index: 2;
}

/* First container needs less padding at the bottom since display container follows */
.roadmap-search-container {
  padding-bottom: 0;
}

/* Roadmap display container with expanded width */
.roadmap-display-container {
  width: 100%;
  padding: var(--space-md) 0 var(--space-xxl);
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
}

/* Full-width container for search filters */
.cosmic-container {
  width: 100%;
  max-width: 1440px; /* Limit max width for very large screens */
  margin: 0 auto;
  padding: 0 var(--container-padding-desktop);
}

/* Media Queries for Responsive Design */
@media (max-width: 1599px) {
  .cosmic-container {
    max-width: 1280px;
    padding: 0 var(--container-padding-desktop);
  }
}

@media (max-width: 1199px) {
  .cosmic-container {
    max-width: 100%;
    padding: 0 var(--container-padding-tablet);
  }
  
  .roadmap-search-container,
  .roadmap-display-container {
    padding: var(--space-lg) 0 var(--space-md);
  }
}

@media (max-width: 768px) {
  .roadmap-page {
    padding-top: 2rem;
  }
  
  .cosmic-container {
    padding: 0 var(--container-padding-mobile);
  }
  
  .roadmap-search-container,
  .roadmap-display-container {
    padding: var(--space-md) 0 var(--space-sm);
  }
  
  .roadmap-display-container {
    overflow-x: auto;
    padding-bottom: var(--space-xl);
  }
}

@media (max-width: 576px) {
  .roadmap-page {
    padding-top: 1rem;
  }
  
  .cosmic-container {
    padding: 0 calc(var(--container-padding-mobile) * 0.75);
  }
  
  .roadmap-search-container {
    padding-bottom: 0;
  }
  
  .roadmap-page.with-glow::before {
    animation: none;
    opacity: 0.4;
  }
}

/* For print layout */
@media print {
  .roadmap-page {
    padding: 0;
    background: white;
  }
  
  .roadmap-search-container {
    display: none;
  }
  
  .cosmic-container {
    width: 100%;
    max-width: none;
    padding: 0;
  }
}
</style>