<template>
  <div class="roadmap-page">
    <!-- Enhanced Cosmic Background Elements -->
    <div class="cosmic-stars"></div>
    <div class="cosmic-particles"></div>
    <div class="cosmic-nebula"></div>
    
    <div class="roadmap-container cosmic-panel">
      <!-- Header Section -->
      <div class="roadmap-header">
        <h1 class="cosmic-title">Cosmic Roadmap</h1>
        <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history. — here's what's next.</p>
      </div>

      <!-- Search and Filter Section -->
      <RoadmapSearch 
        v-model:searchQuery="searchQuery"
        v-model:selectedYear="selectedYear"
        v-model:selectedMilestone="selectedMilestone"
        v-model:selectedTags="selectedTags"
        :availableYears="availableYears"
        :availableMilestones="availableMilestones"
        :availableTags="availableTags"
        :getTagColor="getTagColor"
        @clearTagFilters="clearTagFilters"
        @toggleTagFilter="toggleTagFilter"
      />

      <!-- Roadmap Stats Summary -->
      <RoadmapStats 
        :totalMilestones="totalMilestones"
        :totalTasks="totalTasks"
        :completedPercentage="completedPercentage"
      />

      <!-- Quarters Section with Enhanced Vertical Timeline -->
      <div class="timeline-container">
        <div class="timeline-line"></div>
        <div class="quarters-container" role="list" aria-label="Quarters timeline">
          <RoadmapQuarter 
            v-for="(quarter, qIndex) in filteredQuarters" 
            :key="qIndex" 
            :quarter="quarter" 
            :quarterIndex="qIndex"
            :getProgressPercentage="getProgressPercentage"
            @toggleQuarter="toggleQuarter"
            @toggleMilestone="toggleMilestone"
            @toggleTask="toggleTask"
            @toggleSubtask="toggleSubtask"
            @copyMilestoneLink="copyMilestoneLink"
          />
        </div>
      </div>

      <!-- Skip to content link for keyboard users -->
      <a href="#" class="skip-link">Skip to main content</a>

      <!-- Notifications system -->
      <RoadmapNotifications :notifications="notifications" />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import roadmapData from '@/data/roadmap.json';
import RoadmapQuarter from '@/components/roadmap/RoadmapQuarter.vue';
import RoadmapMilestone from '@/components/roadmap/RoadmapMilestone.vue';
import RoadmapTask from '@/components/roadmap/RoadmapTask.vue';
import RoadmapStats from '@/components/roadmap/RoadmapStats.vue';
import RoadmapSearch from '@/components/roadmap/RoadmapSearch.vue';
import RoadmapNotifications from '@/components/roadmap/RoadmapNotifications.vue';
import * as RoadmapUtil from '@/components/roadmap/RoadmapUtil.js';

export default {
  name: 'RoadmapGalactic',
  components: {
    RoadmapQuarter,
    RoadmapMilestone,
    RoadmapTask,
    RoadmapStats,
    RoadmapSearch,
    RoadmapNotifications
  },
  setup() {
    // Core state
    const quarters = ref([]);
    const searchQuery = ref('');
    const selectedYear = ref('');
    const selectedMilestone = ref('');
    const selectedTags = ref([]);
    const isMounted = ref(false);
    
    // Create notification system using utility
    const { notifications, showNotification } = RoadmapUtil.createNotificationSystem();

    // Load roadmap data
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

    // Toggle functions
    const toggleQuarter = (index, event) => {
      if (quarters.value[index]) {
        RoadmapUtil.toggleElement(quarters.value[index], event, RoadmapUtil.scrollToElement);
      }
    };

    const toggleMilestone = (milestone, event) => {
      RoadmapUtil.toggleElement(milestone, event, RoadmapUtil.scrollToElement);
    };

    const toggleTask = (task, event) => {
      RoadmapUtil.toggleElement(task, event, RoadmapUtil.scrollToElement);
    };

    // Progress calculation
    const getProgressPercentage = (completed, total) => {
      if (!total) return 0;
      return (completed / total) * 100;
    };

    // Toggle subtask with progress updates
    const toggleSubtask = (quarter, milestone, task, subtask) => {
      RoadmapUtil.toggleSubtask(quarter, milestone, task, subtask);
    };

    // Touch handling
    const handleTouchStart = (target, event) => {
      if (target.open !== undefined) {
        toggleMilestone(target, event);
      } else {
        toggleQuarter(target, event);
      }
    };

    const handleTouchStartTask = (task, event) => {
      toggleTask(task, event);
    };

    // Computed properties using utility functions
    const availableYears = computed(() => RoadmapUtil.getAvailableYears(quarters.value));
    const availableMilestones = computed(() => RoadmapUtil.getAvailableMilestones(quarters.value));
    const availableTags = computed(() => RoadmapUtil.getAvailableTags(quarters.value));
    
    // Tag handling
    const getTagColor = RoadmapUtil.getTagColor;

    // Filter handling
    const toggleTagFilter = (tag) => {
      if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag);
      } else {
        selectedTags.value.push(tag);
      }
    };

    const clearTagFilters = () => {
      selectedTags.value = [];
    };

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

    // Filtered quarters using utility function
    const filteredQuarters = computed(() => {
      return RoadmapUtil.filterQuarters(
        quarters.value, 
        searchQuery.value, 
        selectedYear.value, 
        selectedMilestone.value, 
        selectedTags.value
      );
    });

    // Use utility functions for animations
    const {
      beforeEnter,
      enter,
      beforeLeave,
      leave,
      beforeEnterFade,
      enterFade,
      beforeLeaveFade,
      leaveFade
    } = RoadmapUtil.transitionFunctions;

    // Copy milestone link function
    const copyMilestoneLink = (quarter, milestone, quarterIndex, milestoneIndex) => {
      RoadmapUtil.copyMilestoneLink(quarter, milestone, quarterIndex, milestoneIndex, showNotification);
    };

    // URL hash handling
    const handleUrlHash = () => {
      if (!isMounted.value || !window.location.hash) return;
      
      const hash = window.location.hash.substring(1); // Remove #
      if (hash.startsWith('milestone-')) {
        const [_, quarterIndexStr, milestoneIndexStr] = hash.split('-');
        const quarterIndex = parseInt(quarterIndexStr, 10);
        const milestoneIndex = parseInt(milestoneIndexStr, 10);
        
        if (!isNaN(quarterIndex) && !isNaN(milestoneIndex) && 
            quarters.value[quarterIndex] && 
            quarters.value[quarterIndex].milestones[milestoneIndex]) {
          
          // Open the quarter if it's not already open
          if (!quarters.value[quarterIndex].open) {
            quarters.value[quarterIndex].open = true;
          }
          
          // Wait for the quarter content to render
          nextTick(() => {
            const milestone = quarters.value[quarterIndex].milestones[milestoneIndex];
            
            // Open the milestone if it's not already open
            if (!milestone.open) {
              milestone.open = true;
            }
            
            // Scroll to the milestone
            nextTick(() => {
              const selector = `#milestone-content-${quarterIndex}-${milestoneIndex}`;
              const element = document.querySelector(selector)?.closest('.milestone');
              if (element) {
                setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Add a highlight effect
                  element.classList.add('highlight-target');
                  setTimeout(() => {
                    element.classList.remove('highlight-target');
                  }, 3000);
                }, 500);
              }
            });
          });
        }
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      isMounted.value = true;
      loadRoadmap();
      
      // Handle URL hash for direct linking to milestones
      handleUrlHash();
      window.addEventListener('hashchange', handleUrlHash);
    });
    
    onBeforeUnmount(() => {
      isMounted.value = false;
      window.removeEventListener('hashchange', handleUrlHash);
    });

    return {
      quarters,
      searchQuery,
      selectedYear,
      selectedMilestone,
      selectedTags,
      availableTags,
      availableYears,
      availableMilestones,
      filteredQuarters,
      totalMilestones,
      totalTasks,
      completedPercentage,
      toggleQuarter,
      toggleMilestone,
      toggleTask,
      toggleSubtask,
      toggleTagFilter,
      clearTagFilters,
      getProgressPercentage,
      copyMilestoneLink,
      getTagColor,
      notifications,
      showNotification,
      beforeEnter,
      enter,
      beforeLeave,
      leave,
      beforeEnterFade,
      enterFade,
      beforeLeaveFade,
      leaveFade,
      handleTouchStart,
      handleTouchStartTask
    };
  }
};
</script>

<style scoped>
/* Base cosmic theme styles for the roadmap */
.roadmap-page {
  position: relative;
  min-height: 100vh;
  padding: 2rem 1rem;
  color: var(--cosmic-text);
  overflow-x: hidden;
}

/* Enhanced cosmic background effects */
.cosmic-stars,
.cosmic-particles,
.cosmic-nebula {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.cosmic-stars {
  background-image: radial-gradient(2px 2px at calc(100% * var(--rand-1)) calc(100% * var(--rand-2)), rgba(255, 255, 255, 0.5), transparent),
                   radial-gradient(2px 2px at calc(100% * var(--rand-3)) calc(100% * var(--rand-4)), rgba(255, 255, 255, 0.5), transparent),
                   radial-gradient(2px 2px at calc(100% * var(--rand-5)) calc(100% * var(--rand-6)), rgba(255, 255, 255, 0.5), transparent),
                   radial-gradient(2px 2px at calc(100% * var(--rand-7)) calc(100% * var(--rand-8)), rgba(255, 255, 255, 0.5), transparent);
  background-size: 200% 200%;
  opacity: 0.3;
}

.cosmic-particles {
  background-image: url('/images/cosmic-particles.png');
  background-size: cover;
  opacity: 0.15;
  animation: drift 150s linear infinite;
}

.cosmic-nebula {
  background-image: url('/images/cosmic-nebula.png');
  background-size: cover;
  opacity: 0.1;
  animation: pulse 30s ease-in-out infinite;
}

@keyframes drift {
  0% { transform: translate(-50px, -50px) rotate(0deg); }
  100% { transform: translate(50px, 50px) rotate(5deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.08; }
  50% { opacity: 0.12; }
}

.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border-radius: 15px;
}

.roadmap-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 1rem;
}

.cosmic-title {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--cosmic-primary), var(--cosmic-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(var(--cosmic-primary-rgb), 0.5);
  font-family: var(--cosmic-title-font);
}

.cosmic-subtitle {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto;
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
}

/* Timeline container */
.timeline-container {
  position: relative;
  padding: 2rem 0;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 40px;
  width: 2px;
  background: linear-gradient(to bottom, transparent, var(--cosmic-accent), transparent);
  z-index: 1;
}

.quarters-container {
  position: relative;
  z-index: 2;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--cosmic-panel-bg);
  color: var(--cosmic-text);
  padding: 10px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

/* Highlight effect for direct links */
@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(15, 185, 253, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(15, 185, 253, 0); }
  100% { box-shadow: 0 0 0 0 rgba(15, 185, 253, 0); }
}

.highlight-target {
  animation: highlight-pulse 1s ease-in-out 3;
}

/* Media queries for responsive design */
@media (max-width: 768px) {
  .roadmap-header {
    padding: 1rem 0.5rem;
  }
  
  .cosmic-title {
    font-size: 2.2rem;
  }
  
  .cosmic-subtitle {
    font-size: 1rem;
  }

  .timeline-line {
    left: 20px;
  }
}

@media (max-width: 480px) {
  .roadmap-page {
    padding: 1rem 0.5rem;
  }
  
  .cosmic-title {
    font-size: 1.8rem;
  }
}
</style>