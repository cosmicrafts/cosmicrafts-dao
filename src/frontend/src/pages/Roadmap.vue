<template>
  <div class="roadmap-page">
    <!-- Enhanced Cosmic Background Elements -->
    <div class="cosmic-stars">
      <!-- Add twinkling stars -->
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <div class="twinkle"></div>
      <!-- Add bright stars -->
      <div class="bright-star"></div>
      <div class="bright-star"></div>
    </div>
    <div class="cosmic-particles"></div>
    <div class="cosmic-nebula"></div>
    
    <div ref="roadmapRef" class="roadmap-container">
      <!-- Fixed Header Section -->
      <div class="fixed-header-section">
        <!-- Hero Section -->
        <header class="hero-section cosmic-panel">
          <div class="hero-content">
            <div class="title-area">
              <h1 class="cosmic-title">Cosmic Roadmap</h1>
              <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history.</p>
            </div>
            <button 
              class="current-quarter-btn" 
              @click="scrollToCurrentQuarter"
              aria-label="View current quarter"
            >
              <span class="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>
              <span class="btn-text">Current Quarter</span>
            </button>
          </div>
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
      </div>

      <!-- Scrollable Content Area -->
      <div class="scrollable-content">
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
      </div>

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
        // Sort quarter files by date (oldest first)
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
            // Sort by year first (ascending - oldest first)
            if (a.year !== b.year) return a.year - b.year;
            // Then by quarter (Q1 to Q4 within the same year)
            const quarterNum = q => parseInt(q.replace('Q', ''));
            return quarterNum(a.quarter) - quarterNum(b.quarter);
          });

        // Process each quarter's data
        quarters.value = sortedQuarters
          .map(({ data, year, quarter }) => {
            if (!data) return null;

            return {
              ...data,
              year, // Add year explicitly for easier comparison
              quarterNum: parseInt(quarter.replace('Q', '')), // Add quarter number for easier comparison
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
          
        // After loading, find and scroll to current quarter
        nextTick(() => {
          scrollToCurrentQuarter();
        });
      } catch (error) {
        console.error('Error loading roadmap data:', error);
        quarters.value = [];
      }
    };

    // Scroll helper
    const scrollToElement = (element) => {
      if (!element || !isMounted.value) return;
      
      const scrollableContent = document.querySelector('.scrollable-content');
      if (!scrollableContent) return;
      
      const elementRect = element.getBoundingClientRect();
      const containerRect = scrollableContent.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top;
      const targetScroll = scrollableContent.scrollTop + relativeTop - (containerRect.height / 4);
      
      scrollableContent.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    };

    // Find current quarter and scroll to it
    const scrollToCurrentQuarter = () => {
      if (!quarters.value.length || !isMounted.value) return;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      
      // Calculate current quarter (1-4)
      const currentQuarter = Math.floor(currentMonth / 3) + 1;
      
      // First try to find exact current quarter
      let targetIndex = quarters.value.findIndex(q => 
        q.year === currentYear && q.quarterNum === currentQuarter
      );
      
      // If not found, find the most recent past quarter
      if (targetIndex === -1) {
        // Create a comparison value for sorting (higher = more recent)
        const getQuarterValue = (year, quarter) => year * 10 + quarter;
        const currentValue = getQuarterValue(currentYear, currentQuarter);
        
        // Find all past quarters (quarters that come before current date)
        const pastQuarters = quarters.value
          .map((q, index) => ({ 
            index, 
            value: getQuarterValue(q.year, q.quarterNum)
          }))
          .filter(q => q.value <= currentValue)
          .sort((a, b) => b.value - a.value); // Sort by most recent first
        
        // Get the most recent past quarter
        if (pastQuarters.length > 0) {
          targetIndex = pastQuarters[0].index;
        } else {
          // If no past quarters, use the oldest available quarter (last in our sorted list)
          targetIndex = quarters.value.length - 1;
        }
      }
      
      // Clear any existing 'current-quarter' classes
      document.querySelectorAll('.quarter').forEach(el => {
        el.classList.remove('current-quarter');
      });
      
      // Get the quarter element and scroll to it
      nextTick(() => {
        const quarterElements = document.querySelectorAll('.quarter');
        if (quarterElements.length > targetIndex) {
          const targetElement = quarterElements[targetIndex];
          if (targetElement) {
            // Add a visual indicator class
            targetElement.classList.add('current-quarter');
            
            // Set the appropriate label
            const quarter = quarters.value[targetIndex];
            if (quarter.year === currentYear && quarter.quarterNum === currentQuarter) {
              targetElement.setAttribute('data-label', 'Current Quarter');
            } else if (quarter.year > currentYear || (quarter.year === currentYear && quarter.quarterNum > currentQuarter)) {
              targetElement.setAttribute('data-label', 'Future Quarter');
            } else {
              targetElement.setAttribute('data-label', 'Most Recent Quarter');
            }
            
            // Scroll the element into view within the scrollable container
            setTimeout(() => {
              scrollToElement(targetElement);
            }, 300); // Small delay to ensure DOM is ready
          }
        }
      });
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

    // Get tag color (for task tags) 
    const getTagColor = (tag) => {
      // Simple hash function to generate a consistent color for each tag
      const hash = tag.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      // Generate HSL color with fixed saturation and lightness for readability
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

    // Tag filter toggle (stub - we removed the actual filter functionality)
    const toggleTagFilter = (tag) => {
      // This function is kept as a stub since we simplified the filtering
      // but kept the tag UI elements
      showNotification(`Filtering by tag "${tag}" is not available in this simplified view`, 'info');
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

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      preferReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Handle window resize
    const handleResize = () => {
      // Debounce the resize handler
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
      
      window.resizeTimeout = setTimeout(() => {
        // Re-check current quarter position after resize
        const currentQuarterElement = document.querySelector('.current-quarter');
        if (currentQuarterElement) {
          currentQuarterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
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
      
      // Add window resize handler to maintain proper scrolling
      window.addEventListener('resize', handleResize);
    });
    
    onBeforeUnmount(() => {
      isMounted.value = false;
      // Clean up event listeners
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkReducedMotion);
      window.removeEventListener('resize', handleResize);
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
      leaveFade,
      getTagColor,
      toggleTagFilter,
      scrollToCurrentQuarter
    };
  }
};
</script>

<style scoped>
:root {
  --viewport-height: 100vh;
  --viewport-width: 100vw;
  --animation-speed: 1;
  --header-height: auto;
}

/* Base Styling */
.roadmap-page {
  height: 100vh;
  width: 100%; /* Changed from 100vw to prevent horizontal overflow */
  max-width: 100%; /* Ensure it never exceeds viewport */
  color: #fff;
  position: relative;
  overflow-x: hidden; /* Prevent horizontal overflow */
  background: linear-gradient(135deg, #0c1016f0, #141b2af0, #0c1016f0);
  display: flex;
  flex-direction: column;
  padding-top: 6rem; /* Account for the header height */
  box-sizing: border-box; /* Include padding in width calculation */
}

/* Enhanced Cosmic Background */
.cosmic-stars {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  contain: paint;
}

.cosmic-stars::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 25px 5px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)), 
    radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 90px 40px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 160px 120px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2.5px 2.5px at 200px 60px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(3px 3px at 260px 170px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 300px 230px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 350px 270px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 400px 200px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(2.5px 2.5px at 450px 150px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 500px 100px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0));
  background-size: 550px 550px;
  animation: cosmic-stars-move 150s linear infinite;
  opacity: 0.6;
  will-change: background-position;
}

.cosmic-stars::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 10px 10px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 60px 30px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)), 
    radial-gradient(1px 1px at 100px 80px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 140px 130px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 180px 190px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
    radial-gradient(2.5px 2.5px at 220px 220px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 280px 270px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 320px 310px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1px 1px at 380px 350px, rgba(255, 255, 255, 0.9), rgba(0, 0, 0, 0)),
    radial-gradient(3px 3px at 420px 380px, rgba(255, 255, 255, 0.8), rgba(0, 0, 0, 0)),
    radial-gradient(1.5px 1.5px at 470px 420px, rgba(255, 255, 255, 0.7), rgba(0, 0, 0, 0));
  background-size: 500px 500px;
  animation: cosmic-stars-move 120s linear infinite reverse;
  opacity: 0.5;
  will-change: background-position;
}

/* Add twinkling stars */
.cosmic-stars .twinkle {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0;
  animation: twinkle 6s infinite;
  box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.3);
}

.cosmic-stars .twinkle:nth-child(1) {
  top: 10%;
  left: 20%;
  width: 2px;
  height: 2px;
  animation-delay: 0s;
}

/* Add different colors to some stars */
.cosmic-stars .twinkle:nth-child(2) {
  top: 30%;
  left: 40%;
  width: 3px;
  height: 3px;
  animation-delay: 1s;
  background: rgba(173, 216, 230, 0.9); /* Light blue */
  box-shadow: 0 0 4px 1px rgba(173, 216, 230, 0.4);
}

.cosmic-stars .twinkle:nth-child(3) {
  top: 15%;
  left: 60%;
  width: 2px;
  height: 2px;
  animation-delay: 2s;
}

.cosmic-stars .twinkle:nth-child(4) {
  top: 45%;
  left: 80%;
  width: 3px;
  height: 3px;
  animation-delay: 3s;
}

.cosmic-stars .twinkle:nth-child(5) {
  top: 60%;
  left: 15%;
  width: 2px;
  height: 2px;
  animation-delay: 4s;
  background: rgba(255, 223, 186, 0.9); /* Light orange */
  box-shadow: 0 0 4px 1px rgba(255, 223, 186, 0.4);
}

.cosmic-stars .twinkle:nth-child(6) {
  top: 75%;
  left: 35%;
  width: 3px;
  height: 3px;
  animation-delay: 5s;
}

.cosmic-stars .twinkle:nth-child(7) {
  top: 80%;
  left: 70%;
  width: 2px;
  height: 2px;
  animation-delay: 0.5s;
  background: rgba(255, 182, 193, 0.9); /* Light pink */
  box-shadow: 0 0 4px 1px rgba(255, 182, 193, 0.4);
}

.cosmic-stars .twinkle:nth-child(8) {
  top: 25%;
  left: 90%;
  width: 3px;
  height: 3px;
  animation-delay: 1.5s;
}

.cosmic-stars .twinkle:nth-child(9) {
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  animation-delay: 2.5s;
  background: rgba(255, 255, 255, 0.95); /* Bright white */
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.5);
}

.cosmic-stars .twinkle:nth-child(10) {
  top: 85%;
  left: 10%;
  width: 3px;
  height: 3px;
  animation-delay: 3.5s;
}

/* Add a few bright stars with different animation */
.cosmic-stars .bright-star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: bright-star-twinkle 8s infinite;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.6);
}

.cosmic-stars .bright-star:nth-child(11) {
  top: 20%;
  left: 75%;
  width: 3px;
  height: 3px;
  animation-delay: 1s;
}

.cosmic-stars .bright-star:nth-child(12) {
  top: 65%;
  left: 25%;
  width: 4px;
  height: 4px;
  animation-delay: 3s;
}

@keyframes cosmic-stars-move {
  from { background-position: 0 0; }
  to { background-position: 550px 550px; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes bright-star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); box-shadow: 0 0 12px 4px rgba(255, 255, 255, 0.7); }
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
  width: 100%;
  height: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  padding: 0 1.5rem; /* Consistent padding for the entire container */
  box-sizing: border-box; /* Include padding in width calculation */
}

/* Fixed Header Section */
.fixed-header-section {
  width: 100%;
  flex-shrink: 0;
  padding-bottom: 1.5rem;
  box-sizing: border-box; /* Include padding in width calculation */
  max-width: 100%; /* Ensure it doesn't overflow */
}

/* Scrollable Content Area */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding-bottom: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2);
  overscroll-behavior: contain;
  width: 100%;
  max-width: 100%; /* Ensure it doesn't overflow */
  box-sizing: border-box; /* Include padding in width calculation */
}

.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

/* Header Styling - Now using hero section */
.roadmap-header {
  display: none; /* Hide the old header */
}

/* Additional styles to ensure hero section styles take precedence */
.cosmic-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, #FFFFFF, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.4);
}

.cosmic-subtitle {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  max-width: 600px;
}

/* Search Section */
.search-container {
  width: 100%;
  margin-bottom: 1.5rem;
  box-sizing: border-box; /* Include margin in width calculation */
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden; /* Prevent overflow */
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  z-index: 1; /* Ensure icon is above input */
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 0.75rem;
  background: rgba(15, 25, 40, 0.5); /* Exact match for hero section */
  border: 1px solid rgba(88, 101, 242, 0.3); /* Match hero section border */
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box; /* Include padding in width */
  max-width: 100%; /* Prevent overflow */
  backdrop-filter: blur(10px); /* Match hero section blur */
}

.search-input:focus {
  background: rgba(15, 25, 40, 0.6); /* Slightly darker when focused */
  border-color: rgba(15, 185, 253, 0.6);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.2), inset 0 0 0 1px rgba(15, 185, 253, 0.1);
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
  /* Ensure placeholder text doesn't overflow */
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Mobile optimizations for hero */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .title-area {
    text-align: center;
    width: 100%;
  }
  
  .current-quarter-btn {
    width: 100%;
    justify-content: center;
  }

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

@media (max-width: 640px) {
  .roadmap-page {
    padding-top: 4rem; /* Smaller header on mobile */
  }
  
  .roadmap-container {
    padding: 0 1rem;
  }
  
  .fixed-header-section {
    padding-bottom: 1rem;
  }
  
  .scrollable-content {
    padding-bottom: 1rem;
  }
  
  .quarter-header {
    padding: 1rem;
  }
  
  .search-container {
    padding: 0;
    margin-bottom: 1rem;
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
    padding: 1rem; /* Override the 768px breakpoint for smaller screens */
  }
  
  .description {
    font-size: 0.75rem;
  }
  
  .progress-container {
    width: 50px; /* Smaller on mobile */
    max-width: 50px;
  }
  
  .header-right {
    gap: 5px; /* Reduce gap on mobile */
  }
  
  .notification {
    max-width: calc(100vw - 2rem);
    margin: 0 1rem;
  }
  
  .progress-text {
    font-size: 0.75rem;
  }
  
  .hero-section {
    padding: 1.25rem 1rem;
  }
}

/* Quarters */
.quarters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box; /* Include padding and gap in width calculation */
}

.quarter {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box; /* Include padding in width calculation */
}

.quarter-header {
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  position: relative;
  width: 100%;
  box-sizing: border-box;
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
  width: 100%;
  box-sizing: border-box;
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
  width: 100%;
  box-sizing: border-box;
}

/* Progress bars */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 1; /* Allow shrinking if needed */
  min-width: 0; /* Allow shrinking below content width */
}

.progress-container {
  width: 100px;
  max-width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 1; /* Allow shrinking */
}

.progress-bar {
  height: 100%;
  background: #0FB9FD;
  transition: width 0.3s ease;
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

/* Current quarter highlight */
.current-quarter {
  position: relative;
  border-left: 3px solid rgba(15, 185, 253, 0.8);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.3);
}

.current-quarter::before {
  content: attr(data-label);
  position: absolute;
  top: -10px;
  left: 20px;
  background: rgba(15, 185, 253, 0.8);
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.current-quarter .quarter-header {
  background: rgba(15, 185, 253, 0.1);
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

/* Hero Section */
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(15, 25, 40, 0.5);
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), inset 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box; /* Include padding in width calculation */
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, transparent 50%),
    linear-gradient(225deg, rgba(88, 101, 242, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.title-area {
  text-align: left;
}

.cosmic-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, #FFFFFF, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.4);
}

.cosmic-subtitle {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  max-width: 600px;
}

.current-quarter-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: rgba(15, 185, 253, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.4);
  border-radius: 1.5rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  white-space: nowrap;
  flex-shrink: 0;
}

.current-quarter-btn:hover {
  background: rgba(15, 185, 253, 0.3);
  border-color: rgba(15, 185, 253, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 185, 253, 0.3);
}

.current-quarter-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(15, 185, 253, 0.2);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile optimizations for hero */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .title-area {
    text-align: center;
    width: 100%;
  }
  
  .current-quarter-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 1.25rem 1rem;
  }
}

/* For long text content that might force width */
.description, 
.cosmic-subtitle, 
.milestone-header h3, 
.task-header h4, 
.subtask-description {
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.header-content {
  flex: 1;
  min-width: 0; /* Allow flex items to shrink below content size */
  overflow: hidden; /* Prevent text overflow */
  margin-right: 1rem;
}

.progress-text {
  font-size: 0.75rem;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .progress-text {
    font-size: 0.75rem;
  }
}
</style>