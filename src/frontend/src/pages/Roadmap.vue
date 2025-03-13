<template>
  <div class="roadmap-page">
    <!-- Simplified background - just one element instead of many -->
    <div class="cosmic-background"></div>
    
    <div ref="roadmapRef" class="roadmap-container">
      <!-- Fixed Header Section - simplified -->
      <div class="fixed-header-section">
        <!-- Hero Section -->
        <header class="hero-section">
          <div class="hero-content">
            <div class="title-area">
              <h1 class="cosmic-title">Cosmic Roadmap</h1>
              <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history.</p>
            </div>
          </div>
        </header>

        <!-- Search Section -->
        <div class="search-container" role="search">
          <div class="search-input-wrapper">
            <div class="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input type="text" class="search-input" placeholder="Search milestones or tasks..." v-model="searchQuery">
          </div>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="scrollable-content">
        <!-- Quarters Section -->
        <section class="quarters-container">
          <div v-for="(quarter, qIndex) in filteredQuarters" :key="qIndex" class="quarter" :class="{ 'active': quarter.open }">
            <div class="quarter-header" @click="toggleQuarter(qIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
              <div class="header-content">
                <h2>{{ quarter.period }}</h2>
                <p class="description">{{ quarter.description }}</p>
              </div>
              <div class="header-right">
                <div class="progress-wrapper">
                  <div class="progress-container">
                    <div class="progress-bar" :style="{ width: getProgressPercentage(quarter.completed, quarter.total) + '%' }"></div>
                  </div>
                  <div class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</div>
                </div>
                <div class="toggle-icon" :class="{ 'is-open': quarter.open }">
                  <div class="icon-line horizontal"></div>
                  <div class="icon-line vertical" :class="{ 'hidden': quarter.open }"></div>
                </div>
              </div>
            </div>
            
            <!-- Simplified transition -->
            <div v-if="quarter.open" class="milestones">
              <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone">
                <div class="milestone-header" @click="toggleMilestone(quarter, milestone, mIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                  <div class="header-content">
                    <h3>{{ milestone.title }}</h3>
                    <p class="description">{{ milestone.description }}</p>
                  </div>
                  <div class="header-right">
                    <div class="progress-wrapper">
                      <div class="progress-container">
                        <div class="progress-bar" :style="{ width: getProgressPercentage(milestone.completed, milestone.total) + '%' }"></div>
                      </div>
                      <div class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</div>
                    </div>
                    <div class="toggle-icon" :class="{ 'is-open': milestone.open }">
                      <div class="icon-line horizontal"></div>
                      <div class="icon-line vertical" :class="{ 'hidden': milestone.open }"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Simplified transition -->
                <div v-if="milestone.open" class="tasks">
                  <div v-for="(task, tIndex) in milestone.tasks" :key="tIndex" class="task">
                    <div class="task-header" @click="toggleTask(quarter, milestone, task, tIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                      <div class="header-content">
                        <h4>{{ task.title }}</h4>
                        <p class="description">{{ task.description }}</p>
                        
                        <!-- Task tags simplified -->
                        <div v-if="task.tags && task.tags.length" class="task-tags">
                          <span v-for="tag in task.tags" :key="tag" class="task-tag" :style="{ 'border-color': getTagColor(tag) }" @click.stop="toggleTagFilter(tag)">
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                      <div class="header-right">
                        <div class="progress-wrapper">
                          <div class="progress-container">
                            <div class="progress-bar" :style="{ width: getProgressPercentage(task.completed, task.total) + '%' }"></div>
                          </div>
                          <div class="progress-text">{{ task.completed }}/{{ task.total }}</div>
                        </div>
                        <div class="task-status-wrapper">
                          <span class="task-status" :class="task.status.toLowerCase().replace(/\s+/g, '-')">{{ task.status }}</span>
                        </div>
                        <div class="toggle-icon small" :class="{ 'is-open': task.open }">
                          <div class="icon-line horizontal"></div>
                          <div class="icon-line vertical" :class="{ 'hidden': task.open }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Subtasks simplified -->
                    <div v-if="task.open && task.subtasks" class="subtasks">
                      <div v-for="(subtask, stIndex) in task.subtasks" :key="stIndex" class="subtask" :class="{ completed: subtask.completed }">
                        <div class="subtask-header">
                          <div class="checkbox-container">
                            <input type="checkbox" :id="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex" :checked="subtask.completed" @change="toggleSubtask(quarter, milestone, task, subtask)">
                            <label :for="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex">{{ subtask.title }}</label>
                          </div>
                          <div class="subtask-status" :class="{ completed: subtask.completed }">
                            {{ subtask.completed ? 'Completed' : 'To Do' }}
                          </div>
                        </div>
                        <p class="subtask-description">{{ subtask.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Simplified notifications -->
      <div class="notifications-container">
        <div v-for="notification in notifications" :key="notification.id" class="notification" :class="notification.type">
          <div class="notification-content">{{ notification.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue';
import { useMediaQuery } from '@vueuse/core';

// Import all quarter files dynamically
const quarterFiles = import.meta.glob('@/data/roadmap/*.json', { eager: true });

export default {
  name: 'RoadmapGalactic',
  setup() {
    // Core state variables
    const roadmapRef = ref(null);
    const isMounted = ref(false);
    const notifications = ref([]);
    const quarters = ref([]);
    const searchQuery = ref('');
    const preferReducedMotion = ref(false);
    
    let notificationIdCounter = 0;
    
    // Responsive state
    const isMobile = useMediaQuery('(max-width: 640px)');

    // Card hover effects - simplified
    const handleCardMouseMove = (e) => {
      if (preferReducedMotion.value) return;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    const handleCardMouseLeave = (e) => {
      const card = e.currentTarget;
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    };

    // Load roadmap data - simplified but maintains core functionality
    const loadRoadmap = () => {
      try {
        // Sort quarter files by date (oldest first)
        const sortedQuarters = Object.entries(quarterFiles)
          .map(([path, module]) => {
            const fileName = path.split('/').pop()?.replace('.json', '') || '';
            const [quarter, yearStr] = fileName.split('-');
            const year = parseInt(yearStr);
            const data = module.default;
            
            return { year, quarter, data };
          })
          .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            const quarterNum = q => parseInt(q.replace('Q', ''));
            return quarterNum(a.quarter) - quarterNum(b.quarter);
          });

        // Process each quarter's data
        quarters.value = sortedQuarters
          .map(({ data, year, quarter }) => {
            if (!data) return null;

            return {
              ...data,
              year,
              quarterNum: parseInt(quarter.replace('Q', '')),
              open: false,
              milestones: data.milestones?.map(milestone => ({
                ...milestone,
                open: false,
                tasks: milestone.tasks?.map(task => ({
                  ...task,
                  open: false,
                  subtasks: task.subtasks || []
                })) || []
              })) || []
            };
          })
          .filter(Boolean);
          
        // After loading, find and scroll to current quarter
        nextTick(() => {
          scrollToCurrentQuarter();
        });
      } catch (error) {
        console.error('Error loading roadmap data:', error);
        quarters.value = [];
      }
    };

    // Simplified scroll helper
    const scrollToElement = (element) => {
      if (!element || !isMounted.value) return;
      
      const scrollableContent = document.querySelector('.scrollable-content');
      if (!scrollableContent) return;
      
      scrollableContent.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    };

    // Find current quarter and scroll to it - simplified
    const scrollToCurrentQuarter = () => {
      if (!quarters.value.length || !isMounted.value) return;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3) + 1;
      
      // Find current quarter index
      let targetIndex = quarters.value.findIndex(q => 
        q.year === currentYear && q.quarterNum === currentQuarter
      );
      
      // If not found, find the most recent past quarter
      if (targetIndex === -1) {
        const getQuarterValue = (year, quarter) => year * 10 + quarter;
        const currentValue = getQuarterValue(currentYear, currentQuarter);
        
        const pastQuarters = quarters.value
          .map((q, index) => ({ index, value: getQuarterValue(q.year, q.quarterNum) }))
          .filter(q => q.value <= currentValue)
          .sort((a, b) => b.value - a.value);
        
        targetIndex = pastQuarters.length > 0 ? pastQuarters[0].index : 0;
      }
      
      // Highlight current quarter
      nextTick(() => {
        const quarterElements = document.querySelectorAll('.quarter');
        if (quarterElements.length > targetIndex) {
          const targetElement = quarterElements[targetIndex];
          if (targetElement) {
            targetElement.classList.add('current-quarter');
            scrollToElement(targetElement);
          }
        }
      });
    };

    // Toggle handlers - simplified
    const toggleQuarter = (index, event) => {
      quarters.value[index].open = !quarters.value[index].open;
      
      if (quarters.value[index].open) {
        nextTick(() => {
          const element = event?.target.closest('.quarter');
          if (element) scrollToElement(element);
        });
      }
    };

    const toggleMilestone = (quarter, milestone, milestoneIndex, event) => {
      milestone.open = !milestone.open;
      
      if (milestone.open) {
        nextTick(() => {
          const element = event?.target.closest('.milestone');
          if (element) scrollToElement(element);
        });
      }
    };

    const toggleTask = (quarter, milestone, task, taskIndex, event) => {
      task.open = !task.open;
      
      if (task.open) {
        nextTick(() => {
          const element = event?.target.closest('.task');
          if (element) scrollToElement(element);
        });
      }
    };

    // Progress and task management - keeping core functionality
    const getProgressPercentage = (completed, total) => {
      if (!total) return 0;
      return (completed / total) * 100;
    };

    const getTagColor = (tag) => {
      const hash = tag.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    };

    const updateTaskProgress = (task) => {
      if (!task.subtasks) return;
      task.completed = task.subtasks.filter(st => st.completed).length;
      task.total = task.subtasks.length;
    };

    const updateMilestoneProgress = (milestone) => {
      milestone.completed = milestone.tasks.reduce((sum, task) => sum + task.completed, 0);
      milestone.total = milestone.tasks.reduce((sum, task) => sum + task.total, 0);
    };

    const updateQuarterProgress = (quarter) => {
      quarter.completed = quarter.milestones.reduce((sum, milestone) => sum + milestone.completed, 0);
      quarter.total = quarter.milestones.reduce((sum, milestone) => sum + milestone.total, 0);
    };

    const toggleSubtask = (quarter, milestone, task, subtask) => {
      subtask.completed = !subtask.completed;
      updateTaskProgress(task);
      updateMilestoneProgress(milestone);
      updateQuarterProgress(quarter);
    };

    // Tag filter toggle
    const toggleTagFilter = (tag) => {
      showNotification(`Filtering by tag "${tag}" is not available in this simplified view`, 'info');
    };

    // Filtered data
    const filteredQuarters = computed(() => {
      if (!searchQuery.value) return quarters.value;
      
      return quarters.value.filter(q => {
        return q.milestones.some(m => 
          m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
          m.tasks.some(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase())));
      });
    });

    // Notifications - simplified
    const showNotification = (message, type = 'info', duration = 3000) => {
      const id = notificationIdCounter++;
      notifications.value.push({ id, message, type });
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id);
      }, duration);
    };

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      preferReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Lifecycle - simplified but maintains core functionality
    onMounted(() => {
      isMounted.value = true;
      loadRoadmap();
      checkReducedMotion();
      
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion);
    });
    
    onBeforeUnmount(() => {
      isMounted.value = false;
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkReducedMotion);
    });

    return {
      roadmapRef,
      quarters,
      searchQuery,
      filteredQuarters,
      toggleQuarter,
      toggleMilestone,
      toggleTask,
      toggleSubtask,
      getProgressPercentage,
      notifications,
      showNotification,
      isMobile,
      preferReducedMotion,
      handleCardMouseMove,
      handleCardMouseLeave,
      getTagColor,
      toggleTagFilter,
      scrollToCurrentQuarter
    };
  }
};
</script>

<style scoped>
/* Core styles */
.roadmap-page {
  height: 100vh;
  width: 100%;
  color: #fff;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 2.5rem;
  box-sizing: border-box;
}

/* Simplified background */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(88, 101, 242, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(15, 185, 253, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 40% 70%, rgba(201, 42, 253, 0.2) 0%, transparent 40%);
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
}

/* Main Container */
.roadmap-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  padding: 0 1rem;
  box-sizing: border-box;
}

/* Fixed Header Section */
.fixed-header-section {
  width: 100%;
  flex-shrink: 0;
  padding-bottom: 0.5rem;
  box-sizing: border-box;
}

/* Scrollable Content Area */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  background: rgba(15, 25, 40, 0.4);
  border: 1px solid rgba(88, 101, 242, 0.2);
  border-radius: 0.5rem;
  backdrop-filter: blur(8px);
}

/* Title and Subtitle */
.hero-section {
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  width: 100%;
  box-sizing: border-box;
}

.hero-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.cosmic-title {
  font-size: 1.5rem;
  margin: 0;
  background: linear-gradient(90deg, #FFFFFF, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.cosmic-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.3;
}

/* Search Section */
.search-container {
  width: 100%;
  margin-bottom: 0.5rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border-radius: 0.5rem;
  background: rgba(15, 25, 40, 0.5);
  border: 1px solid rgba(88, 101, 242, 0.3);
  color: #fff;
  font-size: 0.875rem;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.6);
}

/* Quarters and Items */
.quarters-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
}

.quarter {
  background: rgba(15, 25, 40, 0.6);
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  border: 1px solid rgba(88, 101, 242, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 0.75rem;
}

.quarter:hover {
  transform: translateY(-2px);
}

.quarter-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 25, 40, 0.3);
}

.quarter-header:hover {
  background: rgba(15, 25, 40, 0.5);
}

/* Milestones */
.milestones {
  padding: 0.75rem;
  background: rgba(15, 25, 40, 0.2);
}

.milestone {
  background: rgba(15, 25, 40, 0.5);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(88, 101, 242, 0.15);
  overflow: hidden;
}

.milestone-header {
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 25, 40, 0.2);
}

.milestone-header:hover {
  background: rgba(15, 25, 40, 0.4);
}

/* Tasks */
.tasks {
  padding: 0.75rem;
  background: rgba(15, 25, 40, 0.1);
}

.task {
  background: rgba(15, 25, 40, 0.4);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid rgba(88, 101, 242, 0.1);
  overflow: hidden;
}

.task-header {
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-header:hover {
  background: rgba(15, 25, 40, 0.3);
}

/* Subtasks */
.subtasks {
  padding: 0.75rem;
  background: rgba(15, 25, 40, 0.1);
}

.subtask {
  padding: 0.625rem;
  margin-bottom: 0.5rem;
  background: rgba(15, 25, 40, 0.3);
  border-radius: 0.375rem;
}

.subtask.completed {
  opacity: 0.7;
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subtask-status {
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
}

.subtask-status.completed {
  background: rgba(0, 255, 0, 0.1);
  color: #4ade80;
}

/* Header content */
.header-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 0.75rem;
}

.header-content h2,
.header-content h3,
.header-content h4 {
  margin: 0 0 0.25rem 0;
}

.description {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.subtask-description {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.375rem 0 0 0;
}

/* Header right */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Progress */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.progress-container {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, rgba(15, 185, 253, 0.8), rgba(88, 101, 242, 0.8));
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  white-space: nowrap;
}

/* Toggle Icon */
.toggle-icon {
  position: relative;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.icon-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  transition: transform 0.2s ease;
}

.horizontal {
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  transform: translateY(-50%);
}

.vertical {
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
}

.vertical.hidden {
  transform: translateX(-50%) scaleY(0);
}

.toggle-icon.is-open .horizontal {
  transform: translateY(-50%) rotate(180deg);
}

.toggle-icon.small {
  width: 12px;
  height: 12px;
}

/* Task tags */
.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.task-tag {
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.6875rem;
  background: rgba(15, 25, 45, 0.4);
  border: 1px solid;
  cursor: pointer;
}

/* Task status */
.task-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
  white-space: nowrap;
}

.task-status.completed {
  background: rgba(0, 255, 0, 0.1);
  color: #4ade80;
}

.task-status.in-progress {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.task-status.to-do {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Notifications */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 300px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification {
  padding: 10px 12px;
  border-radius: 4px;
  background: rgba(30, 40, 60, 0.9);
  color: white;
  font-size: 0.8125rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease-out;
}

.notification.success {
  border-left: 3px solid #2ed573;
}

.notification.error {
  border-left: 3px solid #ff4757;
}

.notification.info {
  border-left: 3px solid #70a1ff;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Media queries - consolidated */
@media (max-width: 768px) {
  .cosmic-title {
    font-size: 1.25rem;
  }
  
  .cosmic-subtitle,
  .search-input {
    font-size: 0.75rem;
  }
  
  .progress-container {
    width: 40px;
  }
  
  .quarter-header,
  .milestone-header,
  .task-header {
    padding: 0.625rem;
  }
  
  .description {
    font-size: 0.75rem;
  }
}
</style>