<template>
  <div class="roadmap-page">
    <!-- Enhanced Cosmic Background Elements -->
    <div class="cosmic-stars"></div>
    <div class="cosmic-particles"></div>
    <div class="cosmic-nebula"></div>
    
    <div ref="roadmapRef" class="roadmap-container cosmic-page-bg">
      <!-- Header Section -->
      <header class="roadmap-header">
        <h1 class="cosmic-title">Cosmic Roadmap</h1>
        <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history. — here's what's next.</p>
      </header>

      <!-- Search Section -->
      <div class="search-container" role="search" aria-label="Search roadmap">
        <div class="search-input-wrapper">
          <div class="search-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            class="search-input cosmic-search" 
            placeholder="Search milestones or tasks..." 
            v-model="searchQuery"
            aria-label="Search roadmap items"
          >
        </div>
      </div>

      <!-- Quarters Section with Enhanced Vertical Timeline -->
      <section class="quarters-container" role="list" aria-label="Quarters timeline">
        <div v-for="(quarter, qIndex) in filteredQuarters" :key="qIndex" class="quarter cosmic-panel" :class="{ 'active': quarter.open, 'animate-in': true }" role="listitem">
          <div 
            class="quarter-header" 
            @click="toggleQuarter(qIndex, $event)" 
            @mousemove="!preferReducedMotion && handleCardMouseMove"
            @mouseleave="handleCardMouseLeave"
            tabindex="0"
            @keydown.enter="toggleQuarter(qIndex, $event)"
            @keydown.space.prevent="toggleQuarter(qIndex, $event)"
            role="button"
            :aria-expanded="quarter.open ? 'true' : 'false'"
            :aria-controls="`quarter-content-${qIndex}`"
          >
            <div class="header-content">
              <h2 class="cosmic-text-glow">{{ quarter.period }}</h2>
              <p class="description">{{ quarter.description }}</p>
            </div>
            <div class="header-right">
              <div class="progress-wrapper" aria-hidden="true">
                <div class="progress-container">
                  <div class="progress-bar" :style="{ width: getProgressPercentage(quarter.completed, quarter.total) + '%' }"></div>
                </div>
                <div class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</div>
              </div>
              <div 
                class="toggle-icon" 
                :class="{ 'is-open': quarter.open }" 
                aria-hidden="true"
              >
                <div class="icon-line horizontal"></div>
                <div class="icon-line vertical" :class="{ 'hidden': quarter.open }"></div>
              </div>
            </div>
          </div>
          <transition 
            name="cosmic-slide" 
            @before-enter="beforeEnter" 
            @enter="enter"
            @before-leave="beforeLeave"
            @leave="leave"
          >
            <div 
              v-if="quarter.open" 
              class="milestones" 
              role="list" 
              aria-label="Milestones" 
              :id="`quarter-content-${qIndex}`"
            >
              <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone cosmic-card" :class="{ 'animate-in': true }" role="listitem">
                <div 
                  class="milestone-header" 
                  @click="toggleMilestone(quarter, milestone, mIndex, $event)" 
                  @mousemove="!preferReducedMotion && handleCardMouseMove"
                  @mouseleave="handleCardMouseLeave"
                  tabindex="0"
                  @keydown.enter="toggleMilestone(quarter, milestone, mIndex, $event)"
                  @keydown.space.prevent="toggleMilestone(quarter, milestone, mIndex, $event)"
                  role="button"
                  :aria-expanded="milestone.open ? 'true' : 'false'"
                  :aria-controls="`milestone-content-${qIndex}-${mIndex}`"
                >
                  <div class="header-content">
                    <h3>{{ milestone.title }}</h3>
                    <p class="description">{{ milestone.description }}</p>
                  </div>
                  <div class="header-right">
                    <button 
                      class="share-button" 
                      @click.stop="copyMilestoneLink(quarter, milestone, qIndex, mIndex)"
                      aria-label="Copy link to this milestone"
                      title="Copy link to this milestone"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </button>
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
                <transition 
                  name="cosmic-fade" 
                  @before-enter="beforeEnterFade" 
                  @enter="enterFade"
                  @before-leave="beforeLeaveFade"
                  @leave="leaveFade"
                >
                  <div 
                    v-if="milestone.open" 
                    class="tasks" 
                    role="list" 
                    aria-label="Tasks"
                    :id="`milestone-content-${qIndex}-${mIndex}`"
                  >
                    <div v-for="(task, tIndex) in milestone.tasks" :key="tIndex" class="task cosmic-panel-inner" :class="{ 'animate-in': true }" role="listitem">
                      <div 
                        class="task-header" 
                        @click="toggleTask(quarter, milestone, task, tIndex, $event)" 
                        @mousemove="!preferReducedMotion && handleCardMouseMove"
                        @mouseleave="handleCardMouseLeave"
                        tabindex="0"
                        @keydown.enter="toggleTask(quarter, milestone, task, tIndex, $event)"
                        @keydown.space.prevent="toggleTask(quarter, milestone, task, tIndex, $event)"
                        role="button"
                        :aria-expanded="task.open ? 'true' : 'false'"
                        :aria-controls="`task-content-${qIndex}-${mIndex}-${tIndex}`"
                      >
                        <div class="header-content">
                          <h4>{{ task.title }}</h4>
                          <p class="description">{{ task.description }}</p>
                          
                          <!-- Add task tags -->
                          <div v-if="task.tags && task.tags.length" class="task-tags">
                            <span 
                              v-for="tag in task.tags" 
                              :key="tag" 
                              class="task-tag"
                              :style="{ 'border-color': getTagColor(tag) }"
                              @click.stop="toggleTagFilter(tag)"
                            >
                              <span class="tag-dot" :style="{ background: getTagColor(tag) }"></span>
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
                      <transition 
                        name="cosmic-fade" 
                        @before-enter="beforeEnterFade" 
                        @enter="enterFade"
                        @before-leave="beforeLeaveFade"
                        @leave="leaveFade"
                      >
                        <div 
                          v-if="task.open && task.subtasks" 
                          class="subtasks"
                          role="list"
                          aria-label="Subtasks"
                          :id="`task-content-${qIndex}-${mIndex}-${tIndex}`"
                        >
                          <div v-for="(subtask, stIndex) in task.subtasks" :key="stIndex" class="subtask" :class="{ completed: subtask.completed }" role="listitem">
                            <div class="subtask-header">
                              <div class="checkbox-container">
                                <input 
                                  type="checkbox" 
                                  :id="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex" 
                                  :checked="subtask.completed" 
                                  @change="toggleSubtask(quarter, milestone, task, subtask)"
                                  :aria-label="`Mark subtask ${subtask.title} as ${subtask.completed ? 'incomplete' : 'complete'}`"
                                >
                                <label :for="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex">{{ subtask.title }}</label>
                              </div>
                              <div class="subtask-status" :class="{ completed: subtask.completed }">
                                {{ subtask.completed ? 'Completed' : 'To Do' }}
                              </div>
                            </div>
                            <p class="subtask-description">{{ subtask.description }}</p>
                          </div>
                        </div>
                      </transition>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </transition>
        </div>
      </section>

      <!-- Notifications system -->
      <transition-group name="notification-fade" tag="div" class="notifications-container">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification" 
          :class="notification.type"
          role="alert"
        >
          <div class="notification-icon" v-if="notification.type === 'success'">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="notification-content">{{ notification.message }}</div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue';
import { useMediaQuery, useBreakpoints } from '@vueuse/core';

// Import all quarter files dynamically
const quarterFiles = import.meta.glob('@/data/roadmap/*.json', { eager: true });

export default {
  name: 'RoadmapGalactic',
  setup() {
    const roadmapRef = ref(null);
    const isMounted = ref(false);
    const notifications = ref([]);
    const quarters = ref([]);
    const searchQuery = ref('');
    const preferReducedMotion = ref(false);
    
    let notificationIdCounter = 0;

    // Basic responsive breakpoints
    const breakpoints = useBreakpoints({
      mobile: 640,
      tablet: 768,
      desktop: 1024,
    });
    
    const isMobile = useMediaQuery('(max-width: 640px)');

    // Card hover effects
    const handleCardMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleCardMouseLeave = (e) => {
      const card = e.currentTarget;
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    };

    // Transition effects
    const beforeEnter = (el) => {
      el.style.height = '0';
      el.style.opacity = '0';
    };

    const enter = (el) => {
      el.style.height = el.scrollHeight + 'px';
      el.style.opacity = '1';
    };

    const beforeLeave = (el) => {
      el.style.height = el.scrollHeight + 'px';
    };

    const leave = (el) => {
      el.style.height = '0';
      el.style.opacity = '0';
    };

    const beforeEnterFade = (el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
    };

    const enterFade = (el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };

    const beforeLeaveFade = (el) => {
      el.style.opacity = '1';
    };

    const leaveFade = (el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
    };

    // Load and process roadmap data from quarter files
    const loadRoadmap = () => {
      try {
        // Sort quarter files by date
        const sortedQuarters = Object.entries(quarterFiles)
          .map(([path, module]) => {
            // Extract quarter and year from filename
            const fileName = path.split('/').pop()?.replace('.json', '') || '';
            const [quarter, yearStr] = fileName.split('-');
            const year = parseInt(yearStr);
            
            // Get the data directly since each file contains a single object
            const data = module.default;
            
            return {
              year,
              quarter,
              data
            };
          })
          .sort((a, b) => {
            // Sort by year first
            if (a.year !== b.year) return b.year - a.year;
            // Then by quarter (Q4 to Q1)
            return b.quarter.localeCompare(a.quarter);
          });

        // Process each quarter's data
        quarters.value = sortedQuarters
          .map(({ data }) => {
            if (!data) return null;

            return {
              ...data,
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
          .filter(Boolean); // Remove any null values
      } catch (error) {
        console.error('Error loading roadmap data:', error);
        quarters.value = [];
      }
    };

    // Toggle handlers
    const toggleQuarter = (index, event) => {
      quarters.value[index].open = !quarters.value[index].open;
      
      if (quarters.value[index].open) {
        nextTick(() => {
          const element = event?.target.closest('.quarter');
          if (element) {
            scrollToElement(element);
          }
        });
      }
    };

    const toggleMilestone = (quarter, milestone, milestoneIndex, event) => {
      milestone.open = !milestone.open;
      
      if (milestone.open) {
        nextTick(() => {
          const element = event?.target.closest('.milestone');
          if (element) {
            scrollToElement(element);
          }
        });
      }
    };

    const toggleTask = (quarter, milestone, task, taskIndex, event) => {
      task.open = !task.open;
      
      if (task.open) {
        nextTick(() => {
          const element = event?.target.closest('.task');
          if (element) {
            scrollToElement(element);
          }
        });
      }
    };

    // Progress calculations
    const getProgressPercentage = (completed, total) => {
      if (!total) return 0;
      return (completed / total) * 100;
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

    // Filtered data
    const filteredQuarters = computed(() => {
      return quarters.value.filter(q => {
        const matchesSearch = !searchQuery.value || q.milestones.some(m => 
          m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
          m.tasks.some(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase())));
        
        return matchesSearch;
      });
    });

    // Notifications
    const showNotification = (message, type = 'info', duration = 3000) => {
      const id = notificationIdCounter++;
      notifications.value.push({ id, message, type });
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id);
      }, duration);
    };

    // Copy milestone link
    const copyMilestoneLink = (quarter, milestone, quarterIndex, milestoneIndex) => {
      const url = new URL(window.location.href);
      url.hash = `milestone-${quarterIndex}-${milestoneIndex}`;
      
      navigator.clipboard.writeText(url.toString())
        .then(() => showNotification('Link copied to clipboard!', 'success'))
        .catch(() => showNotification('Failed to copy link', 'error'));
    };

    // Scroll helper
    const scrollToElement = (element) => {
      if (!element || !isMounted.value) return;
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      preferReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Lifecycle
    onMounted(() => {
      isMounted.value = true;
      loadRoadmap();
      checkReducedMotion();
      
      // Add passive event listeners
      const passiveOptions = { passive: true };
      document.addEventListener('touchstart', () => {}, passiveOptions);
      document.addEventListener('touchmove', () => {}, passiveOptions);
      
      // Listen for reduced motion preference changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion);
    });
    
    onBeforeUnmount(() => {
      isMounted.value = false;
      // Clean up event listeners
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
      copyMilestoneLink,
      isMobile,
      preferReducedMotion,
      handleCardMouseMove,
      handleCardMouseLeave,
      beforeEnter,
      enter,
      beforeLeave,
      leave,
      beforeEnterFade,
      enterFade,
      beforeLeaveFade,
      leaveFade
    };
  }
};
</script>

<style scoped>
:root {
  --viewport-height: 100vh;
  --viewport-width: 100vw;
  --animation-speed: 1;
}

/* Base Styling */
.roadmap-page {
  min-height: 100vh;
  color: #fff;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0c1016f0, #141b2af0, #0c1016f0);
}

/* Enhanced Cosmic Background */
.cosmic-stars {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), 
    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), 
    radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
    radial-gradient(3px 3px at 80px 120px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 110px 50px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 150px 100px, #fff, rgba(0,0,0,0)),
    radial-gradient(1px 1px at 220px 20px, #fff, rgba(0,0,0,0));
  background-size: 400px 400px;
  animation: cosmic-stars 100s linear infinite;
  opacity: 0.4;
  z-index: 0;
  pointer-events: none;
  will-change: background-position;
  contain: paint;
}

@keyframes cosmic-stars {
  from { background-position: 0 0; }
  to { background-position: 400px 400px; }
}

/* New Particles System with optimizations */
.cosmic-particles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  contain: paint;
}

.particle {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  opacity: 0.7;
  box-shadow: 0 0 10px 2px rgba(15, 185, 253, 0.4);
  animation: particle-float 100s linear infinite;
  will-change: transform;
  contain: layout size style;
  transform: translateZ(0);
}

/* Particles with different colors */
.particle:nth-child(3n) {
  background: rgba(15, 185, 253, 0.8);
  box-shadow: 0 0 10px 2px rgba(15, 185, 253, 0.8);
}

.particle:nth-child(3n+1) {
  background: rgba(88, 101, 242, 0.8);
  box-shadow: 0 0 10px 2px rgba(88, 101, 242, 0.8);
}

.particle:nth-child(3n+2) {
  background: rgba(201, 42, 253, 0.8);
  box-shadow: 0 0 10px 2px rgba(201, 42, 253, 0.8);
}

.cosmic-nebula {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.15;
  background: 
    radial-gradient(circle at 10% 20%, rgba(88, 101, 242, 0.3) 0%, transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(15, 185, 253, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 40% 70%, rgba(201, 42, 253, 0.2) 0%, transparent 40%);
  filter: blur(60px);
  animation: cosmic-nebula 60s ease infinite alternate;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
  contain: paint;
}

@keyframes cosmic-nebula {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

/* Main Container */
.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

/* Header Styling */
.roadmap-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cosmic-title {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: 1rem;
}

.cosmic-subtitle {
  font-size: clamp(1rem, 3vw, 1.25rem);
  opacity: 0.8;
}

/* Search Section */
.search-container {
  width: 100%;
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(15, 185, 253, 0.6);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.2);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Quarters */
.quarters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quarter {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
}

.quarter-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.quarter-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Milestones */
.milestones {
  padding: 1rem;
}

.milestone {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.milestone-header {
  padding: 1rem;
  cursor: pointer;
}

/* Tasks */
.tasks {
  padding: 0.5rem 1rem;
}

.task {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.task-header {
  padding: 0.75rem;
  cursor: pointer;
}

/* Progress bars */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-container {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #0FB9FD;
  transition: width 0.3s ease;
}

/* Notifications */
.notifications-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 0.875rem;
  max-width: 300px;
}

.notification.success {
  background: rgba(0, 200, 83, 0.9);
}

.notification.error {
  background: rgba(244, 67, 54, 0.9);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .roadmap-page {
    padding: 1rem 0.5rem;
  }
  
  .search-container {
    padding: 0 0.5rem;
  }
  
  .search-input {
    padding: 0.875rem 1rem 0.875rem 2.75rem;
    font-size: 0.875rem;
  }
  
  .search-icon {
    left: 0.875rem;
  }
  
  .quarter-header,
  .milestone-header,
  .task-header {
    font-size: 0.875rem;
  }
  
  .description {
    font-size: 0.75rem;
  }
  
  .progress-container {
    width: 60px;
  }
  
  .progress-text {
    font-size: 0.75rem;
  }
  
  .notification {
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }
}

/* Add particle float animation */
@keyframes particle-float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  25% {
    transform: translateY(-100px) translateX(100px) rotate(90deg);
  }
  50% {
    transform: translateY(-200px) translateX(0) rotate(180deg);
  }
  75% {
    transform: translateY(-100px) translateX(-100px) rotate(270deg);
  }
  100% {
    transform: translateY(0) translateX(0) rotate(360deg);
  }
}

/* Enhanced card styling */
.quarter-header, .milestone-header {
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-left-color 0.3s ease;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transform-origin: center;
  will-change: transform;
}

.quarter-header:hover, .milestone-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(15, 185, 253, 0.2);
  border-left-color: rgba(15, 185, 253, 0.8);
}

.quarter-header::before, .milestone-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.quarter-header:hover::before, .milestone-header:hover::before {
  opacity: 1;
}

/* Glowing effect for nodes */
.quarter::before {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.8s ease;
  animation: pulse-glow 4s infinite ease-in-out;
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.1), 0 0 15px rgba(15, 185, 253, 0.5); }
  50% { box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.2), 0 0 25px rgba(15, 185, 253, 0.7); }
  100% { box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.1), 0 0 15px rgba(15, 185, 253, 0.5); }
}

.milestone::before {
  animation: milestone-pulse 4s infinite ease-in-out;
}

@keyframes milestone-pulse {
  0% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1), 0 0 10px rgba(88, 101, 242, 0.4); }
  50% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.2), 0 0 20px rgba(88, 101, 242, 0.6); }
  100% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1), 0 0 10px rgba(88, 101, 242, 0.4); }
}

/* Progress bar animation */
.progress-bar {
  background-size: 200% 200%;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.8), 
    rgba(88, 101, 242, 0.8),
    rgba(201, 42, 253, 0.8),
    rgba(15, 185, 253, 0.8));
  animation: progress-gradient 8s infinite linear;
}

@keyframes progress-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Accessibility Improvements */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: rgba(15, 185, 253, 0.9);
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 0;
}

/* Focus styles for better keyboard navigation */
.quarter-header:focus,
.milestone-header:focus,
.task-header:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 185, 253, 0.6), 0 15px 40px rgba(0, 0, 0, 0.3);
}

input:focus,
select:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.8);
  box-shadow: 0 0 0 3px rgba(15, 185, 253, 0.3), 0 0 20px rgba(15, 185, 253, 0.3);
}

/* Improved contrast for better readability */
.description {
  color: rgba(255, 255, 255, 0.85);
}

.subtask-description {
  color: rgba(255, 255, 255, 0.85);
}

/* Larger touch targets for mobile */
@media (max-width: 768px) {
  .quarter-header,
  .milestone-header,
  .task-header {
    padding: 1.5rem;
  }
  
  .toggle-icon {
    width: 32px;
    height: 32px;
  }
  
  .checkbox-container input[type="checkbox"] {
    width: 24px;
    height: 24px;
  }
}

/* Performance optimizations for animations */
@media (prefers-reduced-motion: reduce), 
       (max-width: 480px),
       (forced-colors: active) {
  .cosmic-stars,
  .cosmic-nebula,
  .particle {
    animation-duration: calc(var(--animation-speed) * 200s);
  }
  
  .progress-bar {
    animation-duration: calc(var(--animation-speed) * 16s);
  }
  
  .quarter::before,
  .milestone::before {
    animation-duration: calc(var(--animation-speed) * 8s);
  }
  
  .quarter-header::before,
  .milestone-header::before {
    transition-duration: calc(var(--animation-speed) * 0.8s);
  }
}

/* Reduced animation class for lower-end devices */
.reduce-motion {
  --animation-speed: 2;
}

.reduce-motion .cosmic-particles {
  display: none;
}

.reduce-motion .cosmic-slide-enter-active,
.reduce-motion .cosmic-slide-leave-active,
.reduce-motion .cosmic-fade-enter-active,
.reduce-motion .cosmic-fade-leave-active {
  transition-duration: 0.3s;
}

/* Hardware acceleration for smoother rendering */
.quarter-header, 
.milestone-header, 
.task-header,
.progress-bar,
.toggle-icon,
.particle {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Task tags styling */
.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.task-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  background: rgba(15, 25, 45, 0.4);
  border: 1px solid;
  border-radius: 20px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.task-tag .tag-dot {
  width: 6px;
  height: 6px;
}

/* Share Button */
.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  margin-right: 0.75rem;
}

.share-button:hover {
  background: rgba(15, 185, 253, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.4);
}

/* Notification System */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 300px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(30, 40, 60, 0.9);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 0.9rem;
  border-left: 4px solid;
}

.notification.success {
  border-color: #2ed573;
}

.notification.error {
  border-color: #ff4757;
}

.notification.info {
  border-color: #70a1ff;
}

.notification-icon {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
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
</style>