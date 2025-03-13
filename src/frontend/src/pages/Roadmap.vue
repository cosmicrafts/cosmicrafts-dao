<template>
  <div class="roadmap-page">
    <!-- Simplified background - just one element instead of many -->
    <div class="cosmic-background"></div>
    
    <div ref="roadmapRef" class="roadmap-container">
      <!-- Desktop Hero Section (New) -->
      <div class="desktop-hero-section">
        <div class="desktop-hero-content">
          <div class="logo-area">
            <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts Logo" class="hero-logo" />
          </div>
          <div class="title-area">
            <h1 class="cosmic-title">Cosmic Roadmap</h1>
            <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history unfold.</p>
          </div>

        </div>
      </div>
      
      <!-- Main Content Wrapper -->
      <div class="main-content-wrapper">
        <!-- Roadmap Header Section - contains title and search for mobile view -->
        <div class="roadmap-header-section">
          <!-- Hero Section (Mobile) -->
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
            <div v-for="(quarter, qIndex) in filteredQuarters" :key="qIndex" class="quarter" :class="{ 'active': quarter.open, 'completed': quarter.completed, 'current-quarter': isCurrent(quarter) }">
              <div class="quarter-header" @click.stop="toggleQuarter(qIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                <div class="header-content">
                  <div class="title-with-status">
                    <div class="status-icon" :class="getQuarterStatusClass(quarter)"></div>
                    <h2>{{ quarter.period }}</h2>
                  </div>
                  <p class="description">{{ quarter.description }}</p>
                </div>
                <div class="status-indicators">
                  <div class="progress-wrapper">
                    <div class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</div>
                    <div class="progress-container">
                      <div class="progress-bar" :style="{ width: getProgressPercentage(quarter.completed, quarter.total) + '%' }"></div>
                    </div>
                  </div>
                  <div class="toggle-icon" :class="{ 'is-open': quarter.open }">
                    <div class="icon-line horizontal"></div>
                    <div class="icon-line vertical" :class="{ 'hidden': quarter.open }"></div>
                  </div>
                </div>
              </div>
              
              <!-- Milestones Section -->
              <div v-if="quarter.open" class="milestones">
                <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone" :class="{ 'completed': milestone.completed === milestone.total && milestone.total > 0 }">
                  <div class="milestone-header" @click.stop="toggleMilestone(quarter, milestone, mIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                    <div class="header-content">
                      <div class="title-with-status">
                        <div class="status-icon" :class="{ 'completed': milestone.completed, 'pending': !milestone.completed }"></div>
                        <h3>{{ milestone.title }}</h3>
                      </div>
                      <p class="description">{{ milestone.description }}</p>
                    </div>
                    <div class="status-indicators">
                      <div class="progress-wrapper">
                        <div class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</div>
                        <div class="progress-container">
                          <div class="progress-bar" :style="{ width: getProgressPercentage(milestone.completed, milestone.total) + '%' }"></div>
                        </div>
                      </div>
                      <div class="toggle-icon" :class="{ 'is-open': milestone.open }">
                        <div class="icon-line horizontal"></div>
                        <div class="icon-line vertical" :class="{ 'hidden': milestone.open }"></div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tasks Section -->
                  <div v-if="milestone.open" class="tasks">
                    <div v-for="(task, tIndex) in milestone.tasks" :key="tIndex" class="task" :class="{ 'completed': task.completed === task.total && task.total > 0 }">
                      <div class="task-header" @click.stop="toggleTask(quarter, milestone, task, tIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                        <div class="header-content">
                          <div class="title-with-status">
                            <div class="status-icon" :class="{ 'completed': task.completed, 'pending': !task.completed }"></div>
                            <h4>{{ task.title }}</h4>
                          </div>
                          <p class="description">{{ task.description }}</p>
                          
                          <!-- Task tags simplified -->
                          <div v-if="task.tags && task.tags.length" class="task-tags">
                            <span v-for="tag in task.tags" :key="tag" class="task-tag" :style="{ 'border-color': getTagColor(tag) }" @click.stop="toggleTagFilter(tag)">
                              {{ tag }}
                            </span>
                          </div>
                        </div>
                        <div class="status-indicators">
                          <div class="task-status-wrapper">
                            <span class="task-status" :class="task.status.toLowerCase().replace(/\s+/g, '-')">{{ task.status }}</span>
                          </div>
                          <div class="progress-wrapper">
                            <div class="progress-text">{{ task.completed }}/{{ task.total }}</div>
                            <div class="progress-container">
                              <div class="progress-bar" :style="{ width: getProgressPercentage(task.completed, task.total) + '%' }"></div>
                            </div>
                          </div>
                          <div class="toggle-icon small" :class="{ 'is-open': task.open }">
                            <div class="icon-line horizontal"></div>
                            <div class="icon-line vertical" :class="{ 'hidden': task.open }"></div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Subtasks Section -->
                      <div v-if="task.open && task.subtasks" class="subtasks">
                        <div v-for="(subtask, stIndex) in task.subtasks" :key="stIndex" class="subtask" :class="{ completed: subtask.completed }">
                          <div class="subtask-header">
                            <div class="checkbox-container">
                              <div class="status-icon subtask-status-icon" :class="{ 'completed': subtask.completed, 'pending': !subtask.completed }"></div>
                              <input type="checkbox" :id="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex" :checked="subtask.completed" @change="toggleSubtask(quarter, milestone, task, subtask, $event)">
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
    const quarters = ref([]);
    const searchQuery = ref('');
    const preferReducedMotion = ref(false);
    
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

    // Simplified scroll helper - Update this to be more accurate
    const scrollToElement = (element) => {
      if (!element || !isMounted.value) return;
      
      const scrollableContent = document.querySelector('.scrollable-content');
      if (!scrollableContent) return;
      
      // Add a small delay to ensure DOM has updated
      setTimeout(() => {
        scrollableContent.scrollTo({
          top: element.offsetTop - 80,
          behavior: 'smooth'
        });
      }, 50);
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

    // Update toggle functions to properly handle clicked elements
    const toggleQuarter = (index, event) => {
      // Find the quarter in the filtered list
      const quarter = filteredQuarters.value[index];
      
      // Find the actual index in the original quarters array
      const originalIndex = quarters.value.findIndex(q => 
        q.period === quarter.period && 
        q.year === quarter.year && 
        q.quarterNum === quarter.quarterNum
      );
      
      if (originalIndex !== -1) {
        quarters.value[originalIndex].open = !quarters.value[originalIndex].open;
        
        if (quarters.value[originalIndex].open) {
          nextTick(() => {
            const element = event?.target.closest('.quarter');
            if (element) scrollToElement(element);
          });
        }
      }
    };

    const toggleMilestone = (quarter, milestone, milestoneIndex, event) => {
      // Find the quarter in the original array
      const quarterIndex = quarters.value.findIndex(q => 
        q.period === quarter.period && 
        q.year === quarter.year && 
        q.quarterNum === quarter.quarterNum
      );
      
      if (quarterIndex !== -1) {
        // Find the milestone in the quarter
        const targetMilestone = quarters.value[quarterIndex].milestones[milestoneIndex];
        if (targetMilestone) {
          targetMilestone.open = !targetMilestone.open;
          
          if (targetMilestone.open) {
            nextTick(() => {
              const element = event?.target.closest('.milestone');
              if (element) scrollToElement(element);
            });
          }
        }
      }
      
      // Stop event propagation to prevent parent quarter handler from triggering
      if (event) {
        event.stopPropagation();
      }
    };

    const toggleTask = (quarter, milestone, task, taskIndex, event) => {
      // Find the quarter in the original array
      const quarterIndex = quarters.value.findIndex(q => 
        q.period === quarter.period && 
        q.year === quarter.year && 
        q.quarterNum === quarter.quarterNum
      );
      
      if (quarterIndex !== -1) {
        // Find the milestone in the quarter
        const milestoneIndex = quarters.value[quarterIndex].milestones.findIndex(m => 
          m.title === milestone.title
        );
        
        if (milestoneIndex !== -1) {
          // Find the task in the milestone
          const targetTask = quarters.value[quarterIndex].milestones[milestoneIndex].tasks[taskIndex];
          if (targetTask) {
            targetTask.open = !targetTask.open;
            
            if (targetTask.open) {
              nextTick(() => {
                const element = event?.target.closest('.task');
                if (element) scrollToElement(element);
              });
            }
          }
        }
      }
      
      // Stop event propagation to prevent parent milestone/quarter handlers from triggering
      if (event) {
        event.stopPropagation();
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

    const toggleSubtask = (quarter, milestone, task, subtask, event) => {
      subtask.completed = !subtask.completed;
      updateTaskProgress(task);
      updateMilestoneProgress(milestone);
      updateQuarterProgress(quarter);
      
      // Stop event propagation
      if (event) {
        event.stopPropagation();
      }
    };

    // Tag filter toggle
    const toggleTagFilter = (tag) => {
      // Do nothing since notifications are removed
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

    // Add a new method to determine if a quarter is the current quarter
    const isCurrent = (quarter) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3) + 1;
      
      return quarter.year === currentYear && quarter.quarterNum === currentQuarter;
    };
    
    // Add a method to get the appropriate status class for a quarter
    const getQuarterStatusClass = (quarter) => {
      if (quarter.completed) return 'completed';
      if (isCurrent(quarter)) return 'current';
      return 'future';
    };

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
      isMobile,
      preferReducedMotion,
      handleCardMouseMove,
      handleCardMouseLeave,
      getTagColor,
      toggleTagFilter,
      scrollToCurrentQuarter,
      isCurrent,
      getQuarterStatusClass
    };
  }
};
</script>

<style scoped>
/* Core styles */
.roadmap-page {
  --cosmic-glass-bg: rgba(45, 68, 84, 0.6);
  --cosmic-glass-bg-darker: rgba(7, 20, 42, 0.498);
  --cosmic-glass-bg-lighter: rgba(25, 57, 105, 0.308);
  --cosmic-glass-border: 1px solid rgba(255, 255, 255, 0.1);
  --cosmic-glass-border-blue: 1px solid rgba(15, 185, 253, 0.2);
  --cosmic-glow-blue-sm: 0 0 15px rgba(15, 185, 253, 0.15);
  --cosmic-glow-blue-md: 0 0 25px rgba(15, 185, 253, 0.25);
  --cosmic-glow-blue-lg: 0 0 40px rgba(15, 185, 253, 0.3);
  --cosmic-shadow-sm: 0 4px 10px rgba(0, 0, 0, 0.1);
  --cosmic-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);
  --cosmic-shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.2);
  
  /* Enhanced color palette */
  --cosmic-blue: rgb(15, 185, 253);
  --cosmic-blue-light: rgb(88, 198, 255);
  --cosmic-purple: rgb(103, 58, 183);
  --cosmic-purple-light: rgb(149, 117, 205);
  --cosmic-pink: rgb(201, 42, 253);
  --cosmic-pink-light: rgb(232, 97, 253);
  --cosmic-teal: rgb(23, 212, 169);
  --cosmic-teal-light: rgb(108, 237, 204);
  
  /* Status colors */
  --status-completed: rgb(42, 187, 155);
  --status-completed-bg: rgba(42, 187, 155, 0.15);
  --status-completed-border: rgba(42, 187, 155, 0.3);
  --status-in-progress: rgb(56, 128, 255);
  --status-in-progress-bg: rgba(56, 128, 255, 0.15);
  --status-in-progress-border: rgba(56, 128, 255, 0.3);
  --status-to-do: rgb(255, 153, 0);
  --status-to-do-bg: rgba(255, 153, 0, 0.15);
  --status-to-do-border: rgba(255, 153, 0, 0.3);
  --status-blocked: rgb(235, 68, 90);
  --status-blocked-bg: rgba(235, 68, 90, 0.15);
  --status-blocked-border: rgba(235, 68, 90, 0.3);
  --status-review: rgb(186, 85, 211);
  --status-review-bg: rgba(186, 85, 211, 0.15);
  --status-review-border: rgba(186, 85, 211, 0.3);
  
  /* Component colors */
  --quarter-border: rgba(15, 185, 253, 0.3);
  --quarter-glow: rgba(15, 185, 253, 0.15);
  --milestone-border: rgba(103, 58, 183, 0.3);
  --milestone-glow: rgba(103, 58, 183, 0.15);
  --task-border: rgba(201, 42, 253, 0.3);
  --task-glow: rgba(201, 42, 253, 0.15);
  --subtask-border: rgba(23, 212, 169, 0.3);
  --subtask-glow: rgba(23, 212, 169, 0.15);
  
  --cosmic-text-primary: rgb(255, 255, 255);
  --cosmic-text-secondary: rgba(178, 178, 178, 0.75);
  --cosmic-text-tertiary: rgba(245, 245, 255, 0.5);
  --animation-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-bounce: cubic-bezier(0.2, 0.8, 0.2, 1.2);
  --animation-delay-base: 0.1s;
  --cosmic-bg-dark: rgb(10, 14, 28);
  --hero-accent-glow: rgba(15, 185, 253, 0.3);
  --glass-blur: 12px;
  --header-height: 80px;
  --page-padding: 2rem;

  padding: var(--page-padding);
  padding-top: calc(var(--header-height) + var(--page-padding)); /* Adjusted padding top */
  box-sizing: border-box;
  background-color: var(--cosmic-bg-dark);
  min-height: 100vh;
  position: relative; /* Added position relative */
}

/* Enhanced Cosmic Background */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(88, 101, 242, 0.4) 0%, transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(15, 185, 253, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 40% 70%, rgba(201, 42, 253, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 60% 50%, rgba(103, 58, 183, 0.2) 0%, transparent 50%);
  filter: blur(var(--glass-blur));
  z-index: 0;
  pointer-events: none;
  perspective: 1200px;
  transform-style: preserve-3d;
  opacity: 0.8;
}

.cosmic-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 50% 30%, var(--hero-accent-glow) 0%,
    transparent 60%),
    radial-gradient(circle at 80% 40%, rgba(201, 42, 253, 0.2) 0%, transparent 50%);
  z-index: 1;
  pointer-events: none;
  animation: pulseGlow 8s infinite alternate var(--animation-smooth);
}

@keyframes pulseGlow {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

/* Enhanced Desktop Hero Section */
.desktop-hero-section {
  display: none;
  height: 100%;
  width: 33.333%;
  min-width: 350px;
}

@media (min-width: 1024px) {
  .desktop-hero-section {
    display: flex;
    align-items: center;
    position: sticky;
    top: 2rem;
  }

  .roadmap-page {
    padding: 2rem;
  }
}

.desktop-hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg,
      transparent 0%,
      rgba(15, 185, 253, 0.08) 100%
    ),
    radial-gradient(circle at 70% 30%, 
      rgba(201, 42, 253, 0.1) 0%, 
      transparent 70%
    );
  opacity: 0;
  z-index: 0;
  transition: opacity 0.5s var(--animation-smooth);
}

.desktop-hero-section::after {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0%,
    rgba(15, 185, 253, 0.1) 25%,
    rgba(201, 42, 253, 0.1) 50%,
    rgba(103, 58, 183, 0.1) 75%,
    transparent 100%
  );
  animation: rotateGradient 30s linear infinite;
  opacity: 0.25;
  z-index: 0;
}

@keyframes rotateGradient {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.desktop-hero-content {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  width: 100%;
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
}

.logo-area {
  text-align: center;
  position: relative;
}

.hero-logo {
  max-width: 8rem;
  height: auto;
}

.desktop-hero-section .title-area {
  text-align: center;
  margin-bottom: 2rem;
}

.desktop-hero-section .cosmic-title {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg,
    var(--cosmic-text-primary) 0%,
    var(--cosmic-blue-light) 50%,
    var(--cosmic-purple-light) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 
    0 0 30px rgba(15, 185, 253, 0.3),
    0 0 60px rgba(201, 42, 253, 0.2);
  position: relative;
  transition: all 0.4s var(--animation-smooth);
}

.desktop-hero-section .cosmic-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--cosmic-blue),
    var(--cosmic-purple),
    transparent
  );
  opacity: 0.26;
}

.desktop-hero-section .cosmic-subtitle {
  color: var(--cosmic-text-secondary);
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.25;
}

/* Enhanced Search Section */
.search-container {
  width: 100%;
  transform-style: preserve-3d;
  position: relative;
  z-index: 10;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  border-radius: 0.75rem;
  box-shadow: 
    var(--cosmic-shadow-md),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg,
    rgba(16, 20, 38, 0.8) 0%,
    rgba(16, 20, 38, 0.6) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.25);
  transition: all 0.3s var(--animation-bounce);
  overflow: hidden;
  z-index: 10;
}

.search-input-wrapper:hover,
.search-input-wrapper:focus-within {
  border-color: var(--cosmic-blue);
  box-shadow: 
    var(--cosmic-glow-blue-sm),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cosmic-text-tertiary);
  z-index: 12;
  transition: all 0.3s var(--animation-smooth);
  font-size: 1.25rem;
  pointer-events: none;
}

.search-input-wrapper:hover .search-icon,
.search-input-wrapper:focus-within .search-icon {
  color: var(--cosmic-blue);
  transform: translateY(-50%) scale(1.1);
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 0.75rem;
  background: transparent;
  border: none;
  color: var(--cosmic-text-primary);
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s var(--animation-smooth);
  letter-spacing: 0.01em;
  position: relative;
  z-index: 11;
  pointer-events: auto;
}

.search-input:focus {
  outline: none;
  background: rgba(16, 20, 38, 0.9);
}

.search-input::placeholder {
  color: var(--cosmic-text-tertiary);
  opacity: 0.7;
}

/* Scrollable Content Area */
.scrollable-content {
  flex: 1;
  margin-top: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  background: rgba(20, 24, 41, 0.316);
  border: var(--cosmic-glass-border-blue);
  border-radius: .5rem;
  scroll-behavior: smooth;
  scrollbar-color: var(--cosmic-blue) var(--cosmic-glass-bg);

}

/* Quarters Section - Blue Theme */
.quarters-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
}

.quarter {
  background: var(--cosmic-glass-bg);
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  border: 1px solid var(--quarter-border);
  box-shadow: var(--cosmic-shadow-sm);
  transition: all 0.3s var(--animation-bounce);
}

/* Completed Quarter */
.quarter.completed {
  border: 1px solid var(--status-completed-border);
  background: linear-gradient(135deg,
    rgba(42, 187, 155, 0.05) 0%,
    rgba(42, 187, 155, 0.1) 100%
  );
  box-shadow: 0 0 15px rgba(42, 187, 155, 0.15);
}

.quarter.completed .quarter-header {
  border-left: 4px solid var(--status-completed);
  background: linear-gradient(135deg,
    rgba(42, 187, 155, 0.1) 0%,
    rgba(7, 20, 42, 0.4) 100%
  );
}

.quarter.completed .quarter-header .header-content h2 {
  color: var(--status-completed);
  text-shadow: 0 0 10px rgba(42, 187, 155, 0.3);
}

.quarter.completed .progress-bar {
  background: linear-gradient(90deg,
    var(--status-completed) 0%,
    rgba(108, 237, 204, 0.8) 100%
  );
  box-shadow: 0 0 10px rgba(42, 187, 155, 0.3);
}

.quarter.completed:hover {
  transform: translateX(8px);
  box-shadow: 0 0 15px rgba(42, 187, 155, 0.25);
  border-color: var(--status-completed);
}

.quarter-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
  transition: all 0.3s var(--animation-smooth);
  border-left: 4px solid var(--cosmic-blue);
}

.quarter-header:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg) 0%,
    var(--cosmic-glass-bg-darker) 100%
  );
}

.quarter-header .header-content h2 {
  color: var(--cosmic-blue-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

/* Milestones - Purple Theme */
.milestone {
  background: var(--cosmic-glass-bg);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--milestone-border);
  overflow: hidden;
  transition: all 0.25s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
}

/* Completed Milestone */
.milestone.completed {
  border: 1px solid var(--status-completed-border);
  background: linear-gradient(135deg,
    rgba(42, 187, 155, 0.05) 0%,
    rgba(42, 187, 155, 0.1) 100%
  );
  box-shadow: 0 0 15px rgba(42, 187, 155, 0.15);
}

.milestone.completed .milestone-header {
  border-left: 3px solid var(--status-completed);
  background: linear-gradient(135deg,
    rgba(42, 187, 155, 0.1) 0%,
    rgba(7, 20, 42, 0.4) 100%
  );
}

.milestone.completed .milestone-header .header-content h3 {
  color: var(--status-completed);
  text-shadow: 0 0 10px rgba(42, 187, 155, 0.3);
}

.milestone.completed .progress-bar {
  background: linear-gradient(90deg,
    var(--status-completed) 0%,
    rgba(108, 237, 204, 0.8) 100%
  );
  box-shadow: 0 0 10px rgba(42, 187, 155, 0.3);
}

.milestone.completed:hover {
  transform: translateX(4px);
  box-shadow: 0 0 15px rgba(42, 187, 155, 0.25);
  border-color: var(--status-completed);
}

.milestone-header {
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg) 0%,
    var(--cosmic-glass-bg-darker) 100%
  );
  transition: all 0.3s var(--animation-smooth);
  border-left: 3px solid var(--cosmic-purple);
}

.milestone-header:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
}

.milestone-header .header-content h3 {
  color: var(--cosmic-purple-light);
  text-shadow: 0 0 10px rgba(103, 58, 183, 0.3);
}

/* Tasks - Pink Theme */
.task {
  background: var(--cosmic-glass-bg);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid var(--task-border);
  overflow: hidden;
  transition: all 0.2s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
}

/* Completed Task */
.task.completed {
  border: 1px solid var(--status-completed-border);
  background: linear-gradient(135deg,
    rgba(42, 187, 155, 0.05) 0%,
    rgba(42, 187, 155, 0.1) 100%
  );
  box-shadow: 0 0 15px rgba(42, 187, 155, 0.15);
}

.task.completed .task-header {
  border-left: 2px solid var(--status-completed);
  background: linear-gradient(135deg,
    rgba(42, 187, 155, 0.1) 0%,
    rgba(7, 20, 42, 0.4) 100%
  );
}

.task.completed .task-header .header-content h4 {
  color: var(--status-completed);
  text-shadow: 0 0 10px rgba(42, 187, 155, 0.3);
}

.task.completed .progress-bar {
  background: linear-gradient(90deg,
    var(--status-completed) 0%,
    rgba(108, 237, 204, 0.8) 100%
  );
  box-shadow: 0 0 10px rgba(42, 187, 155, 0.3);
}

.task.completed:hover {
  transform: translateX(8px);
  box-shadow: 0 0 15px rgba(42, 187, 155, 0.25);
  border-color: var(--status-completed);
}

.task-header {
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg) 0%,
    var(--cosmic-glass-bg-darker) 100%
  );
  transition: all 0.3s var(--animation-smooth);
  border-left: 2px solid var(--cosmic-pink);
}

.task-header:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
}

.task-header .header-content h4 {
  color: var(--cosmic-pink-light);
  text-shadow: 0 0 10px rgba(201, 42, 253, 0.3);
}

/* Subtasks - Teal Theme */
.subtask {
  padding: 0.625rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg) 0%,
    var(--cosmic-glass-bg-darker) 100%
  );
  border-radius: 0.375rem;
  transition: all 0.2s var(--animation-bounce);
  border: 1px solid var(--subtask-border);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
  border-left: 2px solid var(--cosmic-teal);
}

.subtask:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
  border-color: var(--cosmic-teal);
  transform: translateX(12px);
  box-shadow: 0 0 15px var(--subtask-glow);
}

.subtask.completed {
  opacity: 0.85;
  background: linear-gradient(180deg,
    var(--status-completed-bg) 0%,
    rgba(42, 187, 155, 0.2) 100%
  );
  border-color: var(--status-completed-border);
  border-left: 2px solid var(--status-completed);
}

.subtask-header label {
  color: var(--cosmic-teal-light);
  transition: all 0.2s var(--animation-bounce);
}

.subtask:hover .subtask-header label {
  color: var(--cosmic-text-primary);
}

/* Progress bar styling with unique colors for each level */
.quarter .progress-bar {
  background: linear-gradient(90deg,
    var(--cosmic-blue) 0%,
    var(--cosmic-blue-light) 100%
  );
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.milestone .progress-bar {
  background: linear-gradient(90deg,
    var(--cosmic-purple) 0%,
    var(--cosmic-purple-light) 100%
  );
  box-shadow: 0 0 10px rgba(103, 58, 183, 0.3);
}

.task .progress-bar {
  background: linear-gradient(90deg,
    var(--cosmic-pink) 0%,
    var(--cosmic-pink-light) 100%
  );
  box-shadow: 0 0 10px rgba(201, 42, 253, 0.3);
}

/* Enhanced status styles */
.task-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  background: var(--cosmic-glass-bg);
  white-space: nowrap;
  box-shadow: var(--cosmic-shadow-sm);
  transition: all 0.2s var(--animation-bounce);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.task-status.completed {
  background: var(--status-completed-bg);
  color: var(--status-completed);
  border: 1px solid var(--status-completed-border);
}

.task-status.in-progress {
  background: var(--status-in-progress-bg);
  color: var(--status-in-progress);
  border: 1px solid var(--status-in-progress-border);
}

.task-status.to-do {
  background: var(--status-to-do-bg);
  color: var(--status-to-do);
  border: 1px solid var(--status-to-do-border);
}

.task-status.blocked {
  background: var(--status-blocked-bg);
  color: var(--status-blocked);
  border: 1px solid var(--status-blocked-border);
}

.task-status.review {
  background: var(--status-review-bg);
  color: var(--status-review);
  border: 1px solid var(--status-review-border);
}

/* Subtask status indicators */
.subtask-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  white-space: nowrap;
  transition: all 0.2s var(--animation-bounce);
  font-weight: 600;
}

.subtask-status {
  background: var(--status-to-do-bg);
  color: var(--status-to-do);
}

.subtask-status.completed {
  background: var(--status-completed-bg);
  color: var(--status-completed);
}

/* Enhanced Checkbox styling */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.checkbox-container input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--subtask-border);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  position: relative;
  background: var(--cosmic-glass-bg);
}

.checkbox-container input[type="checkbox"]:checked {
  background-color: var(--status-completed);
  border-color: var(--status-completed);
  box-shadow: 0 0 10px var(--status-completed-bg);
}

.checkbox-container input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  color: var(--cosmic-text-primary);
  font-size: 0.75rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkbox-container input[type="checkbox"]:hover {
  border-color: var(--cosmic-teal);
  box-shadow: 0 0 8px var(--subtask-glow);
}

/* Current quarter highlight */
.quarter.current-quarter {
  border: 2px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
}

/* Container backgrounds */
.milestones {
  padding: 0.75rem;
  background: rgba(103, 58, 183, 0.05);
  border-top: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

.tasks {
  padding: 0.75rem;
  background: rgba(201, 42, 253, 0.05);
  border-top: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

.subtasks {
  padding: 0.75rem;
  background: rgba(23, 212, 169, 0.05);
  border-top: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

/* Task tags with color-coded borders */
.task-tag {
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.6875rem;
  background: rgba(25, 28, 41, 0.7);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
  backdrop-filter: blur(4px);
}

.task-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  background: rgba(35, 39, 56, 0.8);
}

/* Toggle icon colors */
.toggle-icon .icon-line {
  background: var(--cosmic-text-secondary);
}

.quarter-header .toggle-icon.is-open .horizontal {
  background: var(--cosmic-blue);
}

.milestone-header .toggle-icon.is-open .horizontal {
  background: var(--cosmic-purple);
}

.task-header .toggle-icon.is-open .horizontal {
  background: var(--cosmic-pink);
}

/* Notifications */
.notifications-container {
  display: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) translateZ(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

/* Media queries */
@media (max-width: 768px) {

  .cosmic-title {
    font-size: 2rem;
  }
  
  .cosmic-subtitle,
  .search-input {
    font-size: 0.75rem;
  }
  
  .progress-container {
    width: 3rem;
    height: .35rem;
  }
  
  .quarter-header,
  .milestone-header,
  .task-header {
    padding: 1rem;
  }
  
  .description {
    font-size: 0.55rem;
  }

  .hero-section {
    display: block;
    margin-top: 1rem; /* Add margin to hero section on mobile */
  }
}

/* Header content */
.header-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 4rem; /* Give space for the indicators */
  padding-right: 1rem;
  transform-style: preserve-3d;
}

.header-content h2,
.header-content h3,
.header-content h4 {
  margin: 0 0 0.25rem 0;
  color: var(--cosmic-text-primary);
  transition: color 0.3s var(--animation-smooth);
}

.description {
  font-size: 0.8125rem;
  color: var(--cosmic-text-secondary);
  margin: 0;
  transition: color 0.3s var(--animation-smooth);
}

.subtask-description {
  font-size: 0.75rem;
  color: var(--cosmic-text-secondary);
  margin: 0.375rem 0 0 0;
  transition: color 0.3s var(--animation-smooth);
}

/* Header right renamed to status-indicators */
.status-indicators {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  transform-style: preserve-3d;
}

/* Progress positioning */
.progress-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  transform-style: preserve-3d;
}

.progress-container {
  width: 60px;
  height: 4px;
  background: var(--cosmic-glass-bg-lighter);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-text {
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--cosmic-text-secondary);
  transition: color 0.3s var(--animation-smooth);
  margin-bottom: 2px;
}

/* Task status positioning */
.task-status-wrapper {
  margin-bottom: 0.5rem;
}

.task-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  background: var(--cosmic-glass-bg);
  white-space: nowrap;
  box-shadow: var(--cosmic-shadow-sm);
  transition: all 0.2s var(--animation-bounce);
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Update header content to take up more space */
.header-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 4rem; /* Give space for the indicators */
  padding-right: 1rem;
  transform-style: preserve-3d;
}

/* Subtask status positioning */
.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtask-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  white-space: nowrap;
  transition: all 0.2s var(--animation-bounce);
  font-weight: 600;
  margin-left: auto;
}

/* Update component headers to use relative positioning */
.quarter-header, .milestone-header, .task-header {
  position: relative;
  padding: 1rem;
  padding-right: 4.5rem; /* Space for status indicators */
}

/* Toggle icon positioning */
.toggle-icon {
  margin-top: 0.5rem;
  position: relative;
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
}

.toggle-icon.small {
  width: 12px;
  height: 12px;
}

.icon-line {
  position: absolute;
  background: var(--cosmic-text-secondary);
  transition: all 0.2s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
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

/* Update completion badge position to not overlap with status indicators */
.quarter.completed::after,
.milestone.completed::after,
.task.completed::after {
  right: 1.5rem;
}

/* Adjust padding for mobile view */
@media (max-width: 768px) {
  .status-indicators {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.35rem;
  }
  
  .progress-container {
    width: 40px;
    height: 3px;
  }
  
  .progress-text {
    font-size: 0.6rem;
  }
  
  .task-status {
    font-size: 0.6rem;
    padding: 0.15rem 0.3rem;
  }
  
  .quarter-header, .milestone-header, .task-header {
    padding-right: 3.5rem;
  }
  
  .header-content {
    margin-right: 3rem;
  }
}

/* Webkit scrollbar styling */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--cosmic-glass-bg);
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--cosmic-blue);
  border-radius: 4px;
  opacity: 0.7;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--cosmic-blue);
  opacity: 1;
}

.roadmap-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - var(--header-height) - var(--page-padding) * 2);
  position: relative;
  gap: 1rem;
  margin: 0 auto;
  max-width: 1400px;
}

@media (min-width: 1024px) {
  .roadmap-container {
    flex-direction: row;
    gap: 2rem;
    padding: 0 2rem;
    height: calc(100vh - var(--header-height) - var(--page-padding) * 2);
  }

  .main-content-wrapper {
    flex: 1;
    min-width: 0;
    margin-left: 8rem;
    margin-right: 2rem;
    margin-top: 4rem;
  }

  .hero-section {
    display: none;
  }
}

.main-content-wrapper {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 95%;
  position: relative;
  background: var(--cosmic-glass-bg-lighter);
  border-radius: 1rem;
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  z-index: 5;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  box-sizing: border-box;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--cosmic-blue) var(--cosmic-glass-bg);
  transform-style: preserve-3d;
}

/* Transition effects for completion */
.quarter, .milestone, .task, .subtask {
  transition: all 0.3s var(--animation-bounce), 
              background 0.5s var(--animation-smooth),
              border-color 0.5s var(--animation-smooth);
}

.quarter-header, .milestone-header, .task-header {
  transition: all 0.3s var(--animation-smooth),
              border-left-color 0.5s var(--animation-smooth),
              background 0.5s var(--animation-smooth);
}

.header-content h2, .header-content h3, .header-content h4 {
  transition: color 0.5s var(--animation-smooth),
              text-shadow 0.5s var(--animation-smooth);
}

/* Add a completion badge for extra visual cue */
.quarter.completed::after,
.milestone.completed::after,
.task.completed::after {
  content: '✓';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--status-completed);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(42, 187, 155, 0.4);
  z-index: 2;
}

.quarter.completed::after {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1rem;
}

.milestone.completed::after {
  width: 1.4rem;
  height: 1.4rem;
  font-size: 0.9rem;
}

/* Add a subtle completed animation */
@keyframes completedPulse {
  0% {
    box-shadow: 0 0 5px rgba(42, 187, 155, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(42, 187, 155, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(42, 187, 155, 0.3);
  }
}

.quarter.completed, 
.milestone.completed, 
.task.completed {
  position: relative;
  animation: completedPulse 3s infinite alternate var(--animation-smooth);
}

/* Title with status icon styling */
.title-with-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

/* Status icon styling */
.status-icon {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

/* Quarter status icons */
.status-icon.completed {
  background-color: var(--status-completed);
  box-shadow: 0 0 8px rgba(42, 187, 155, 0.4);
}

.status-icon.completed::after {
  content: '✓';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-icon.current {
  background-color: var(--status-in-progress);
  box-shadow: 0 0 8px rgba(56, 128, 255, 0.4);
}

.status-icon.current::after {
  content: '▶';
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
}

.status-icon.future {
  background-color: var(--status-to-do);
  box-shadow: 0 0 8px rgba(255, 153, 0, 0.4);
}

.status-icon.future::after {
  content: '◯';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.status-icon.pending {
  background-color: var(--status-to-do);
  opacity: 0.7;
  box-shadow: 0 0 5px rgba(255, 153, 0, 0.3);
}

.status-icon.pending::after {
  content: '◯';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Subtask status icon */
.subtask-status-icon {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}

.subtask-status-icon.completed::after,
.subtask-status-icon.pending::after {
  font-size: 0.6rem;
}

/* Quarter level adjustments */
.quarter .status-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.quarter .status-icon::after {
  font-size: 1rem;
}

/* Milestone level adjustments */
.milestone .status-icon {
  width: 1.35rem;
  height: 1.35rem;
}

.milestone .status-icon::after {
  font-size: 0.85rem;
}

/* Make header content titles align with icons */
.header-content h2,
.header-content h3,
.header-content h4 {
  margin: 0;
  line-height: 1.3;
}

/* Remove the old completion badge */
.quarter.completed::after,
.milestone.completed::after,
.task.completed::after {
  display: none;
}

/* Adjust the checkbox container to accommodate the status icon */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Hide checkbox when using status icon */
.checkbox-container input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Adjust spacing in mobile view */
@media (max-width: 768px) {
  .title-with-status {
    gap: 0.35rem;
  }
  
  .status-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .status-icon::after {
    font-size: 0.65rem;
  }
  
  .quarter .status-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .quarter .status-icon::after {
    font-size: 0.8rem;
  }
  
  .milestone .status-icon {
    width: 1.1rem;
    height: 1.1rem;
  }
  
  .milestone .status-icon::after {
    font-size: 0.7rem;
  }
  
  .subtask-status-icon {
    width: 0.8rem;
    height: 0.8rem;
  }
}

/* Animation for current quarter indicator */
@keyframes pulseCurrentIndicator {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.status-icon.current {
  animation: pulseCurrentIndicator 2s infinite ease-in-out;
}

/* Extra styles to ensure everything renders correctly */
.header-content {
  margin-right: 4rem;
  padding-right: 0; /* Remove this padding as we don't need it now with the icon layout */
}

.description {
  margin-left: 1.75rem; /* Indent description to align with title text */
}

.milestone .description,
.task .description {
  margin-left: 1.6rem;
}

.subtask-description {
  margin-left: 2.25rem;
}
</style>