<template>
  <div class="roadmap-container" ref="roadmapContainer">
    <!-- Header section with title and CTA -->
    <div class="roadmap-header">
      <h1 class="roadmap-title">
        Cosmic<span class="title-accent">Crafts</span> Roadmap
      </h1>
      <div class="header-cta">
        <button 
          class="cosmic-button primary" 
          @click="scrollToLatestQuarter"
          aria-label="View latest quarter"
        >
          View Latest Quarter
        </button>
      </div>
    </div>

    <!-- Stats summary section -->
    <roadmap-stats
      :total-milestones="stats.totalMilestones"
      :total-tasks="stats.totalTasks"
      :completed-percentage="stats.completionPercentage"
    />

    <!-- Notifications section -->
    <roadmap-notifications
      :notifications="notifications"
      :has-recent-updates="true"
      @dismiss-notification="dismissNotification"
      @dismiss-all-notifications="dismissAllNotifications"
    />

    <!-- Search and filter section -->
    <roadmap-search
      v-model:search-query="searchQuery"
      v-model:selected-year="selectedYear"
      v-model:selected-milestone="selectedMilestone"
      v-model:selected-tags="selectedTags"
      :available-years="availableYears"
      :available-milestones="availableMilestones"
      :available-tags="availableTags"
    />

    <!-- Main roadmap timeline -->
    <div class="roadmap-timeline" v-if="filteredRoadmapData.length">
      <div class="timeline-line"></div>
      
      <roadmap-quarter
        v-for="(quarter, qIndex) in filteredRoadmapData"
        :key="qIndex"
        :year="getYearFromPeriod(quarter.period)"
        :quarter="getQuarterNumberFromPeriod(quarter.period)"
        :title="quarter.period"
        :badge="quarter.theme || ''"
        :id="`quarter-${qIndex}`"
      >
        <div class="milestones-wrapper">
          <roadmap-milestone
            v-for="(milestone, mIndex) in quarter.milestones"
            :key="mIndex"
            :milestone="enhanceMilestone(milestone)"
            :milestone-id="`${qIndex}-${mIndex}`"
            @copy-link="copyMilestoneLink(qIndex, mIndex)"
            @toggle="onMilestoneToggle"
          >
            <template #tasks>
              <roadmap-task
                v-for="(task, tIndex) in milestone.tasks"
                :key="tIndex"
                :task="task"
                :task-id="`${qIndex}-${mIndex}-${tIndex}`"
                @update-task="updateTask(quarter, milestone, task, $event)"
                @update-subtask="updateSubtask(quarter, milestone, task, $event)"
              />
            </template>
          </roadmap-milestone>
        </div>
      </roadmap-quarter>
    </div>

    <!-- Empty state when no results match filters -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h2>No matching results found</h2>
      <p>Try adjusting your search or filter criteria</p>
      <button class="cosmic-button secondary" @click="resetFilters">
        Reset Filters
      </button>
    </div>

    <!-- Success toast for copy link action -->
    <transition name="toast-slide">
      <div class="cosmic-toast" v-if="showCopyToast">
        <div class="toast-content">
          <div class="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span>Link copied to clipboard!</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import RoadmapQuarter from './RoadmapQuarter.vue';
import RoadmapMilestone from './RoadmapMilestone.vue';
import RoadmapTask from './RoadmapTask.vue';
import RoadmapSubtask from './RoadmapSubtask.vue';
import RoadmapStats from './RoadmapStats.vue';
import RoadmapSearch from './RoadmapSearch.vue';
import RoadmapNotifications from './RoadmapNotifications.vue';
import RoadmapUtil from './RoadmapUtil.js';

export default {
  name: 'Roadmap',
  components: {
    RoadmapQuarter,
    RoadmapMilestone,
    RoadmapTask,
    RoadmapSubtask,
    RoadmapStats,
    RoadmapSearch,
    RoadmapNotifications
  },
  data() {
    return {
      roadmapData: [],
      searchQuery: '',
      selectedYear: '',
      selectedMilestone: '',
      selectedTags: [],
      notifications: [],
      showCopyToast: false,
      lastQuarterRef: null,
      stats: {
        totalMilestones: 0,
        totalTasks: 0,
        completionPercentage: 0
      }
    };
  },
  computed: {
    filteredRoadmapData() {
      return RoadmapUtil.filterRoadmapData(this.roadmapData, {
        searchQuery: this.searchQuery,
        selectedYear: this.selectedYear,
        selectedMilestone: this.selectedMilestone,
        selectedTags: this.selectedTags
      });
    },
    availableYears() {
      return RoadmapUtil.extractYears(this.roadmapData);
    },
    availableMilestones() {
      return RoadmapUtil.extractMilestoneTitles(this.roadmapData);
    },
    availableTags() {
      return RoadmapUtil.extractTags(this.roadmapData);
    }
  },
  created() {
    // In a real application, this would be an API call
    this.loadRoadmapData();
    this.loadNotifications();
    
    // Check for URL parameters if a specific milestone should be highlighted
    this.checkUrlForHighlightedMilestone();
  },
  mounted() {
    // Set a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      this.updateStatsDisplay();
    }, 200);
  },
  methods: {
    loadRoadmapData() {
      // Mock data loading
      this.roadmapData = [
        // This would be replaced with actual API call
        // Simplified example:
        {
          period: "Q1 2023",
          theme: "Foundation",
          milestones: [
            {
              title: "Platform Architecture",
              description: "Design and implement the core platform architecture",
              tags: ["Backend", "Infrastructure"],
              tasks: [
                {
                  title: "Database Schema Design",
                  completed: true,
                  subtasks: [
                    { title: "Define data models", completed: true },
                    { title: "Create entity relationships", completed: true }
                  ]
                },
                {
                  title: "API Structure Planning",
                  completed: true,
                  subtasks: [
                    { title: "Define endpoints", completed: true },
                    { title: "Create authentication flow", completed: true }
                  ]
                }
              ]
            }
          ]
        },
        {
          period: "Q2 2023",
          theme: "Core Features",
          milestones: [
            {
              title: "User Management",
              description: "Implement comprehensive user management system",
              tags: ["Frontend", "Backend"],
              tasks: [
                {
                  title: "User Authentication",
                  completed: true,
                  subtasks: [
                    { title: "Login/Register flows", completed: true },
                    { title: "Password reset", completed: true }
                  ]
                },
                {
                  title: "User Profiles",
                  completed: false,
                  subtasks: [
                    { title: "Profile creation", completed: true },
                    { title: "Avatar management", completed: false }
                  ]
                }
              ]
            }
          ]
        }
      ];
    },
    loadNotifications() {
      // Mock notifications loading
      this.notifications = [
        {
          id: 1,
          type: 'new',
          message: 'New milestone added: Mobile App Development',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          id: 2,
          type: 'update',
          message: 'Platform Architecture milestone updated with new tasks',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          id: 3,
          type: 'complete',
          message: 'User Authentication tasks marked as completed',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      ];
    },
    enhanceMilestone(milestone) {
      // Add computed properties to the milestone for easier rendering
      return {
        ...milestone,
        completedTasks: milestone.tasks ? milestone.tasks.filter(task => task.completed).length : 0,
        totalTasks: milestone.tasks ? milestone.tasks.length : 0
      };
    },
    updateTask(quarter, milestone, task, updatedData) {
      // Handle task updates
      task.completed = updatedData.completed;
      
      // Update milestone and quarter stats
      this.updateStatsDisplay();
    },
    updateSubtask(quarter, milestone, task, updatedData) {
      // Find the subtask
      const subtask = task.subtasks.find(s => s.title === updatedData.subtaskId);
      if (subtask) {
        subtask.completed = updatedData.completed;
        
        // Check if all subtasks are completed to mark the task as completed
        const allCompleted = task.subtasks.every(s => s.completed);
        task.completed = allCompleted;
        
        // Update milestone and quarter stats
        this.updateStatsDisplay();
      }
    },
    updateStatsDisplay() {
      // Recalculate stats based on current roadmap data
      const stats = RoadmapUtil.getRoadmapStats(this.roadmapData);
      this.stats = stats;
    },
    dismissNotification(notificationId) {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    },
    dismissAllNotifications() {
      this.notifications = [];
    },
    copyMilestoneLink(quarterId, milestoneId) {
      const shareUrl = RoadmapUtil.generateShareUrl(
        window.location.href.split('?')[0], 
        quarterId, 
        milestoneId
      );
      
      // Use Clipboard API to copy the link
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          this.showCopyToast = true;
          setTimeout(() => {
            this.showCopyToast = false;
          }, 3000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    },
    checkUrlForHighlightedMilestone() {
      const urlParams = new URLSearchParams(window.location.search);
      const quarterId = urlParams.get('q');
      const milestoneId = urlParams.get('m');
      
      if (quarterId && milestoneId) {
        // Highlight the specific milestone
        this.$nextTick(() => {
          // Add implementation to highlight and scroll to the milestone
          const milestoneEl = document.getElementById(`milestone-${quarterId}-${milestoneId}`);
          if (milestoneEl) {
            milestoneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a highlight class
            milestoneEl.classList.add('highlighted');
            setTimeout(() => {
              milestoneEl.classList.remove('highlighted');
            }, 3000);
          }
        });
      }
    },
    scrollToLatestQuarter() {
      // Find the latest quarter
      if (this.filteredRoadmapData.length > 0) {
        const latestQuarterIndex = this.filteredRoadmapData.length - 1;
        const latestQuarterId = `quarter-${latestQuarterIndex}`;
        
        const quarterEl = document.getElementById(latestQuarterId);
        if (quarterEl) {
          quarterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.selectedYear = '';
      this.selectedMilestone = '';
      this.selectedTags = [];
    },
    onMilestoneToggle(milestoneId) {
      // This can be used for analytics or additional functionality
      console.log(`Milestone toggled: ${milestoneId}`);
    },
    getYearFromPeriod(period) {
      const match = period.match(/\b(20\d{2})\b/);
      return match ? match[1] : '';
    },
    getQuarterNumberFromPeriod(period) {
      const match = period.match(/Q(\d)/);
      return match ? match[1] : '';
    }
  }
};
</script>

<style scoped>
.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.roadmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.roadmap-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(120deg, #ffffff, #0FB9FD);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 15px rgba(15, 185, 253, 0.4);
  letter-spacing: 1px;
}

.title-accent {
  color: #0FB9FD;
  background: linear-gradient(120deg, #0FB9FD, #C92AFD);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-cta {
  display: flex;
  gap: 1rem;
}

.cosmic-button {
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: none;
  outline: none;
}

.cosmic-button.primary {
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9), rgba(88, 101, 242, 0.9));
  color: white;
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.3);
}

.cosmic-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(15, 185, 253, 0.4);
}

.cosmic-button.secondary {
  background: rgba(15, 25, 45, 0.6);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 185, 253, 0.4);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.cosmic-button.secondary:hover {
  background: rgba(15, 25, 45, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.roadmap-timeline {
  position: relative;
  margin-top: 3rem;
  padding-left: 80px;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 32px;
  width: 4px;
  background: linear-gradient(to bottom, 
    rgba(15, 185, 253, 0.7), 
    rgba(88, 101, 242, 0.7), 
    rgba(201, 42, 253, 0.7));
  border-radius: 2px;
  z-index: 1;
}

.milestones-wrapper {
  display: grid;
  gap: 1.5rem;
}

/* Empty state styles */
.empty-state {
  margin-top: 4rem;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.empty-icon {
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
}

.empty-state h2 {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
}

/* Toast notification */
.cosmic-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 1rem;
  background: rgba(0, 210, 106, 0.2);
  border: 1px solid rgba(0, 210, 106, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(0, 210, 106, 0.9);
}

.toast-icon {
  display: flex;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Highlighted milestone style */
.highlighted {
  box-shadow: 0 0 0 3px rgba(15, 185, 253, 0.4), 0 0 30px rgba(15, 185, 253, 0.3) !important;
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 3px rgba(15, 185, 253, 0.4), 0 0 30px rgba(15, 185, 253, 0.3); }
  50% { box-shadow: 0 0 0 3px rgba(15, 185, 253, 0.6), 0 0 40px rgba(15, 185, 253, 0.5); }
  100% { box-shadow: 0 0 0 3px rgba(15, 185, 253, 0.4), 0 0 30px rgba(15, 185, 253, 0.3); }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .roadmap-container {
    padding: 1.5rem 1rem;
  }
  
  .roadmap-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .roadmap-title {
    font-size: 2rem;
  }
  
  .header-cta {
    width: 100%;
  }
  
  .cosmic-button {
    width: 100%;
    text-align: center;
  }
  
  .roadmap-timeline {
    padding-left: 60px;
  }
  
  .timeline-line {
    left: 24px;
  }
}
</style> 