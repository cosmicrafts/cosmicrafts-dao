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
        <!-- Fixed Header Section - simplified -->
        <div class="fixed-header-section">
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
      </div>

      <!-- Notifications container - moved outside the main-content-wrapper -->
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
  --cosmic-glass-bg: rgba(16, 20, 38, 0.6);
  --cosmic-glass-bg-darker: rgba(16, 20, 38, 0.8);
  --cosmic-glass-bg-lighter: rgba(16, 20, 38, 0.4);
  --cosmic-glass-border: 1px solid rgba(255, 255, 255, 0.1);
  --cosmic-glass-border-blue: 1px solid rgba(15, 185, 253, 0.2);
  --cosmic-glow-blue-sm: 0 0 15px rgba(15, 185, 253, 0.15);
  --cosmic-glow-blue-md: 0 0 25px rgba(15, 185, 253, 0.25);
  --cosmic-glow-blue-lg: 0 0 40px rgba(15, 185, 253, 0.3);
  --cosmic-shadow-sm: 0 4px 10px rgba(0, 0, 0, 0.1);
  --cosmic-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);
  --cosmic-shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.2);
  --cosmic-blue: rgb(15, 185, 253);
  --cosmic-blue-light: rgb(88, 198, 255);
  --cosmic-purple: rgb(103, 58, 183);
  --cosmic-purple-light: rgb(149, 117, 205);
  --cosmic-pink: rgb(201, 42, 253);
  --cosmic-text-primary: rgb(245, 245, 255);
  --cosmic-text-secondary: rgba(245, 245, 255, 0.75);
  --cosmic-text-tertiary: rgba(245, 245, 255, 0.5);
  --animation-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-bounce: cubic-bezier(0.2, 0.8, 0.2, 1.2);
  --animation-delay-base: 0.1s;
  --cosmic-bg-dark: rgb(10, 14, 28);
  --hero-accent-glow: rgba(15, 185, 253, 0.3);
  --glass-blur: 60px;

  height: 100vh;
  width: 100%;
  color: var(--cosmic-text-primary);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 2.5rem;
  box-sizing: border-box;
  background-color: var(--cosmic-bg-dark);
  font-family: 'Inter', sans-serif;
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
    radial-gradient(circle at 50% 30%, var(--hero-accent-glow) 0%, transparent 60%),
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
  margin: 1rem 0;
  transform-style: preserve-3d;
  position: relative;
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
}

.search-input-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
}

.search-input-wrapper:hover::before,
.search-input-wrapper:focus-within::before {
  opacity: 1;
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
  z-index: 1;
  transition: all 0.3s var(--animation-smooth);
  font-size: 1.25rem;
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
}

.search-input::placeholder {
  color: var(--cosmic-text-tertiary);
  opacity: 0.7;
}

.search-input:focus {
  outline: none;
}

/* Scrollable Content Area */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  background: var(--cosmic-glass-bg-lighter);
  border: var(--cosmic-glass-border-blue);
  border-radius: 0.5rem;
  backdrop-filter: blur(8px);
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--cosmic-blue) var(--cosmic-glass-bg);
  transform-style: preserve-3d;
}

/* Quarters Section */
.quarters-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
  transform-style: preserve-3d;
}

.quarter {
  background: var(--cosmic-glass-bg);
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-sm);
  transition: all 0.3s var(--animation-bounce);
  margin-bottom: 0.75rem;
  position: relative;
  transform-style: preserve-3d;
}

.quarter:hover {
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
  border-color: var(--cosmic-blue);
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
}

.quarter-header:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg) 0%,
    var(--cosmic-glass-bg-darker) 100%
  );
}

/* Milestones */
.milestones {
  padding: 0.75rem;
  background: var(--cosmic-glass-bg-lighter);
  border-top: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

.milestone {
  background: var(--cosmic-glass-bg);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  transition: all 0.25s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
}

.milestone:hover {
  background: var(--cosmic-glass-bg-darker);
  transform: translateX(4px);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
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
}

.milestone-header:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
}

/* Tasks */
.tasks {
  padding: 0.75rem;
  background: var(--cosmic-glass-bg-lighter);
  border-top: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

.task {
  background: var(--cosmic-glass-bg);
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  transition: all 0.2s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
}

.task:hover {
  background: var(--cosmic-glass-bg-darker);
  transform: translateX(8px);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
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
}

.task-header:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
}

/* Subtasks */
.subtasks {
  padding: 0.75rem;
  background: var(--cosmic-glass-bg-lighter);
  border-top: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

.subtask {
  padding: 0.625rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg) 0%,
    var(--cosmic-glass-bg-darker) 100%
  );
  border-radius: 0.375rem;
  transition: all 0.2s var(--animation-bounce);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
}

.subtask:hover {
  background: linear-gradient(135deg,
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
  );
  border-color: var(--cosmic-blue);
  transform: translateX(12px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.subtask.completed {
  opacity: 0.75;
  background: linear-gradient(180deg,
    rgba(42, 187, 155, 0.1) 0%,
    rgba(42, 187, 155, 0.2) 100%
  );
  border-color: rgba(42, 187, 155, 0.3);
}

/* Progress bar styling */
.progress-container {
  width: 60px;
  height: 4px;
  background: var(--cosmic-glass-bg-lighter);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg,
    var(--cosmic-blue) 0%,
    rgba(88, 101, 242, 0.9) 100%
  );
  transition: width 0.3s var(--animation-smooth);
  box-shadow: var(--cosmic-glow-blue-sm);
}

/* Task tags */
.task-tag {
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.6875rem;
  background: var(--cosmic-glass-bg);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
}

.task-tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

/* Task status */
.task-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  background: var(--cosmic-glass-bg);
  white-space: nowrap;
  box-shadow: var(--cosmic-shadow-sm);
  transition: all 0.2s var(--animation-bounce);
}

.task-status.completed {
  background: rgba(42, 187, 155, 0.15);
  color: #42bb9b;
  border: 1px solid rgba(42, 187, 155, 0.3);
}

.task-status.in-progress {
  background: rgba(56, 128, 255, 0.15);
  color: #3880ff;
  border: 1px solid rgba(56, 128, 255, 0.3);
}

.task-status.to-do {
  background: rgba(235, 68, 90, 0.15);
  color: #eb445a;
  border: 1px solid rgba(235, 68, 90, 0.3);
}

/* Toggle icon */
.toggle-icon {
  position: relative;
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
}

.icon-line {
  position: absolute;
  background: var(--cosmic-text-primary);
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
  background: var(--cosmic-blue);
}

/* Current quarter highlight */
.quarter.current-quarter {
  border: 2px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
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
  perspective: 1000px;
}

@media (min-width: 1024px) {
  .notifications-container {
    right: calc((100% - 1200px) / 2 + 20px);
  }
}

.notification {
  padding: 10px 12px;
  border-radius: 4px;
  background: var(--cosmic-glass-bg);
  color: var(--cosmic-text-primary);
  font-size: 0.8125rem;
  box-shadow: var(--cosmic-shadow-md);
  animation: fadeIn 0.3s var(--animation-bounce);
  backdrop-filter: blur(8px);
  border: var(--cosmic-glass-border);
  transform-style: preserve-3d;
}

.notification.success {
  border-left: 3px solid #2ed573;
}

.notification.error {
  border-left: 3px solid #ff4757;
}

.notification.info {
  border-left: 3px solid var(--cosmic-blue);
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
    font-size: 1.25rem;
  }
  
  .cosmic-subtitle,
  .search-input {
    font-size: 0.75rem;
  }
  
  .progress-container {
    width: 4rem;
    height: .5rem;
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
  }

  @media (min-width: 1024px) {
    .hero-section {
      display: none;
    }
  }
}

/* Header content */
.header-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 0.75rem;
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

/* Header right */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transform-style: preserve-3d;
}

/* Progress */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transform-style: preserve-3d;
}

.progress-text {
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--cosmic-text-secondary);
  transition: color 0.3s var(--animation-smooth);
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
  transform-style: preserve-3d;
}

/* Checkbox styling */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.checkbox-container input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--cosmic-glass-border-blue);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  position: relative;
  background: var(--cosmic-glass-bg);
}

.checkbox-container input[type="checkbox"]:checked {
  background-color: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.checkbox-container input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  color: var(--cosmic-text-primary);
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkbox-container input[type="checkbox"]:hover {
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
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
  height: calc(100vh - 5rem);
  position: relative;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .roadmap-container {
    flex-direction: row;
    gap: 2rem;
    padding: 0 2rem;
  }

  .main-content-wrapper {
    flex: 1;
    min-width: 0; /* Prevents flex item from overflowing */
    margin-left: 2rem;
  }

  .hero-section {
    display: none;
  }
}
.main-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--cosmic-glass-bg-lighter);
  border-radius: 1rem;
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
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
</style>