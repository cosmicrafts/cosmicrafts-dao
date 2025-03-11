<template>
  <div class="roadmap-page">
    <!-- Enhanced Cosmic Background Elements -->
    <div class="cosmic-stars"></div>
    <div class="cosmic-particles"></div>
    <div class="cosmic-nebula"></div>
    
    <div class="roadmap-container cosmic-page-bg">
      <!-- Header Section -->
      <div class="roadmap-header">
        <h1 class="cosmic-title">Cosmic Roadmap</h1>
        <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history. — here's what's next.</p>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-filter-container" role="search" aria-label="Search and filter roadmap">
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
        <div class="filter-wrapper">
          <select 
            class="filter-select cosmic-select" 
            v-model="selectedYear" 
            aria-label="Filter by year"
          >
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <select 
            class="filter-select cosmic-select" 
            v-model="selectedMilestone" 
            aria-label="Filter by milestone"
          >
            <option value="">All Milestones</option>
            <option v-for="milestone in availableMilestones" :key="milestone" :value="milestone">{{ milestone }}</option>
          </select>
        </div>
        
        <!-- Tags Filter Bar -->
        <div class="tags-filter-container">
          <h3 class="tags-title">Filter by Tags:</h3>
          <div class="tags-wrapper">
            <button 
              v-for="tag in availableTags" 
              :key="tag" 
              class="tag-button" 
              :class="{ active: selectedTags.includes(tag) }"
              @click="toggleTagFilter(tag)"
              :aria-pressed="selectedTags.includes(tag).toString()"
            >
              <span class="tag-dot" :style="{ background: getTagColor(tag) }"></span>
              {{ tag }}
            </button>
          </div>
          <button 
            v-if="selectedTags.length > 0" 
            class="clear-tags-button"
            @click="clearTagFilters"
            aria-label="Clear all tag filters"
          >
            <span class="clear-icon">×</span> Clear All
          </button>
        </div>
      </div>

      <!-- Roadmap Stats Summary -->
      <div class="roadmap-stats" aria-label="Roadmap statistics">
        <div class="stat-item">
          <div class="stat-value">{{ totalMilestones }}</div>
          <div class="stat-label">Milestones</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalTasks }}</div>
          <div class="stat-label">Tasks</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ completedPercentage }}%</div>
          <div class="stat-label">Complete</div>
        </div>
        <div class="stat-progress">
          <div class="stat-progress-bar" :style="{ width: completedPercentage + '%' }"></div>
        </div>
      </div>

      <!-- Quarters Section with Enhanced Vertical Timeline -->
      <div class="quarters-container" role="list" aria-label="Quarters timeline">
        <div v-for="(quarter, qIndex) in filteredQuarters" :key="qIndex" class="quarter cosmic-panel" :class="{ 'active': quarter.open }" role="listitem">
          <div 
            class="quarter-header" 
            @click="toggleQuarter(qIndex, $event)" 
            @touchstart="handleTouchStart(quarter, $event)" 
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
              <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone cosmic-card" role="listitem">
                <div 
                  class="milestone-header" 
                  @click="toggleMilestone(milestone, $event)" 
                  @touchstart="handleTouchStart(milestone, $event)"
                  tabindex="0"
                  @keydown.enter="toggleMilestone(milestone, $event)"
                  @keydown.space.prevent="toggleMilestone(milestone, $event)"
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
                    <div v-for="(task, tIndex) in milestone.tasks" :key="tIndex" class="task cosmic-panel-inner" role="listitem">
                      <div 
                        class="task-header" 
                        @click="toggleTask(task, $event)" 
                        @touchstart="handleTouchStartTask(task, $event)"
                        tabindex="0"
                        @keydown.enter="toggleTask(task, $event)"
                        @keydown.space.prevent="toggleTask(task, $event)"
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
      </div>

      <!-- Skip to content link for keyboard users -->
      <a href="#" class="skip-link">Skip to main content</a>

      <!-- Notifications system -->
      <transition-group name="notification-fade" tag="div" class="notifications-container">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification" 
          :class="notification.type"
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
import roadmapData from '@/data/roadmap.json';

export default {
  name: 'RoadmapGalactic',
  setup() {
    const quarters = ref([]);
    const searchQuery = ref('');
    const selectedYear = ref('');
    const selectedMilestone = ref('');
    const selectedTags = ref([]);
    const resizeObserver = ref(null);
    const isMounted = ref(false);
    const notifications = ref([]);
    let notificationIdCounter = 0;

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

    const toggleQuarter = (index, event) => {
      quarters.value[index].open = !quarters.value[index].open;
      
      // Scroll to section when opened
      if (quarters.value[index].open) {
        nextTick(() => {
          const element = event?.target.closest('.quarter');
          if (element) {
            scrollToElement(element);
          }
        });
      }
    };

    const toggleMilestone = (milestone, event) => {
      milestone.open = !milestone.open;
      
      // Scroll to section when opened
      if (milestone.open) {
        nextTick(() => {
          const element = event?.target.closest('.milestone');
          if (element) {
            scrollToElement(element);
          }
        });
      }
    };

    const toggleTask = (task, event) => {
      task.open = !task.open;
      
      // Scroll to section when opened
      if (task.open) {
        nextTick(() => {
          const element = event?.target.closest('.task');
          if (element) {
            scrollToElement(element);
          }
        });
      }
    };

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
      
      // Update progress counts that cascade upward
      updateTaskProgress(task);
      updateMilestoneProgress(milestone);
      updateQuarterProgress(quarter);
    };

    // Touch feedback for mobile with event passed
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

    const tagColors = {
      'Frontend': '#0FB9FD',
      'Backend': '#5865F2',
      'DevOps': '#C92AFD',
      'Design': '#FD4D4D',
      'Research': '#00D26A',
      'Testing': '#F9A825',
      'Documentation': '#9C27B0',
      'Infrastructure': '#607D8B',
      'Security': '#FF3D00',
      'UX': '#009688',
      'API': '#3F51B5',
      'Database': '#795548',
      'Performance': '#FF9800',
      'Accessibility': '#8BC34A',
      'Mobile': '#E91E63',
    };

    const getTagColor = (tag) => {
      return tagColors[tag] || '#0FB9FD';
    };

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

    // Enhanced filtering
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
        
        const matchesSearch = searchQuery.value ? q.milestones.some(m => m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || m.tasks.some(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase()))) : true;
        
        return matchesYear && matchesMilestone && matchesSearch && matchesTags;
      });
    });

    // Enhanced transitions with physics-based animations
    const beforeEnter = (el) => {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
    };
    
    const enter = (el, done) => {
      el.style.overflow = 'hidden';
      
      // Get the actual height of the element
      const height = el.scrollHeight;
      
      // Use requestAnimationFrame to ensure the browser processes the previous style changes
      requestAnimationFrame(() => {
        el.style.maxHeight = height + 'px';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        
        // Listen for the transition to end
        el.addEventListener('transitionend', function listener() {
          el.style.maxHeight = 'none'; // Remove the max-height restriction
          el.removeEventListener('transitionend', listener);
          done();
        }, { once: true });
      });
    };
    
    const beforeLeave = (el) => {
      // Set the initial max-height to the current height
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.overflow = 'hidden';
    };
    
    const leave = (el, done) => {
      // Use requestAnimationFrame to ensure the browser processes the previous style changes
      requestAnimationFrame(() => {
        el.style.maxHeight = '0';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-20px)';
        
        // Listen for the transition to end
        el.addEventListener('transitionend', function listener() {
          el.removeEventListener('transitionend', listener);
          done();
        }, { once: true });
      });
    };
    
    // Simpler fade transitions for subtasks
    const beforeEnterFade = (el) => {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
    };
    
    const enterFade = (el, done) => {
      el.style.overflow = 'hidden';
      const height = el.scrollHeight;
      
      requestAnimationFrame(() => {
        el.style.maxHeight = height + 'px';
        el.style.opacity = '1';
        
        el.addEventListener('transitionend', function listener() {
          el.style.maxHeight = 'none';
          el.removeEventListener('transitionend', listener);
          done();
        }, { once: true });
      });
    };
    
    const beforeLeaveFade = (el) => {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.overflow = 'hidden';
    };
    
    const leaveFade = (el, done) => {
      requestAnimationFrame(() => {
        el.style.maxHeight = '0';
        el.style.opacity = '0';
        
        el.addEventListener('transitionend', function listener() {
          el.removeEventListener('transitionend', listener);
          done();
        }, { once: true });
      });
    };

    // Performance optimization - throttle functions that might be called frequently
    const throttle = (fn, wait = 100) => {
      let time = Date.now();
      return function(...args) {
        if ((time + wait - Date.now()) < 0) {
          fn(...args);
          time = Date.now();
        }
      };
    };

    // Handle card hover effects for 3D transforms with throttling
    const handleCardMouseMoveThrottled = throttle((event) => {
      if (!isMounted.value) return;
      
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      // Use CSS transforms where possible to trigger hardware acceleration
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }, 16); // ~60fps
    
    const handleCardMouseLeave = (event) => {
      if (!isMounted.value) return;
      
      const card = event.currentTarget;
      card.style.transform = '';
    };
    
    // Performance optimized particle system
    const initParticles = () => {
      if (typeof window === 'undefined' || !isMounted.value) return; // SSR check
      
      const particlesContainer = document.querySelector('.cosmic-particles');
      if (!particlesContainer) return;
      
      // Adjust particle count based on device performance
      const isHighEndDevice = window.devicePixelRatio > 1 && !isMobileDevice();
      const particleCount = isMobileDevice() ? 30 : (isHighEndDevice ? 100 : 60);
      
      // Create particles in chunks to avoid blocking the main thread
      const createParticlesInChunks = (remaining, chunkSize = 10) => {
        if (remaining <= 0 || !isMounted.value) return;
        
        const fragment = document.createDocumentFragment();
        const count = Math.min(remaining, chunkSize);
        
        for (let i = 0; i < count; i++) {
          const particle = document.createElement('div');
          particle.classList.add('particle');
          
          // Random positioning and styles
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          
          const size = Math.random() * 3 + 1;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          
          particle.style.opacity = `${Math.random() * 0.7 + 0.3}`;
          
          const duration = Math.random() * 50 + 50;
          particle.style.animationDuration = `${duration}s`;
          
          particle.style.animationDelay = `${Math.random() * 50}s`;
          
          fragment.appendChild(particle);
        }
        
        particlesContainer.appendChild(fragment);
        
        // Process next chunk in the next frame
        requestAnimationFrame(() => {
          createParticlesInChunks(remaining - count, chunkSize);
        });
      };
      
      // Start creating particles
      createParticlesInChunks(particleCount);
    };
    
    // Detect if user is on a mobile device
    const isMobileDevice = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
        (window.innerWidth <= 768);
    };
    
    // Resize observer to handle responsive updates
    const setupResizeObserver = () => {
      if (!window.ResizeObserver || !isMounted.value) return;
      
      // Clean up any existing observer
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
      }
      
      // Create a new observer
      resizeObserver.value = new ResizeObserver(throttle(() => {
        // Adjust properties based on viewport size
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
        
        // Detect low-end devices and reduce animations
        if (isMobileDevice() && window.innerWidth < 480) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
      }, 100));
      
      // Observe the viewport
      resizeObserver.value.observe(document.body);
    };
    
    // Cleanup event listeners and resources
    const cleanup = () => {
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
      }
      
      const cards = document.querySelectorAll('.quarter-header, .milestone-header');
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleCardMouseMoveThrottled);
        card.removeEventListener('mouseleave', handleCardMouseLeave);
      });
    };

    // Notification system
    const showNotification = (message, type = 'info', duration = 3000) => {
      const id = notificationIdCounter++;
      notifications.value.push({ id, message, type });
      
      // Auto-remove notification after duration
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.id !== id);
      }, duration);
    };
    
    // Copy milestone link feature
    const copyMilestoneLink = (quarter, milestone, quarterIndex, milestoneIndex) => {
      if (!isMounted.value) return;
      
      // Make sure the quarter and milestone are open
      if (!quarter.open) {
        toggleQuarter(quarterIndex);
      }
      
      if (!milestone.open) {
        toggleMilestone(milestone);
      }
      
      // Build a link with fragment identifier
      const url = new URL(window.location.href);
      url.hash = `milestone-${quarterIndex}-${milestoneIndex}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(url.toString())
        .then(() => {
          showNotification('Link copied to clipboard!', 'success');
        })
        .catch(() => {
          // Fallback if clipboard API fails
          const textarea = document.createElement('textarea');
          textarea.value = url.toString();
          textarea.style.position = 'fixed';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              showNotification('Link copied to clipboard!', 'success');
            } else {
              showNotification('Failed to copy link', 'error');
            }
          } catch (err) {
            showNotification('Failed to copy link', 'error');
          }
          
          document.body.removeChild(textarea);
        });
    };
    
    // Check for hash in URL and scroll to target
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

    onMounted(() => {
      isMounted.value = true;
      loadRoadmap();
      
      // Defer non-critical initialization
      window.requestIdleCallback ? 
        window.requestIdleCallback(() => initParticles()) : 
        setTimeout(() => initParticles(), 200);
      
      // Add event listeners for card hover effects with a delay to not block initial rendering
      setTimeout(() => {
        const cards = document.querySelectorAll('.quarter-header, .milestone-header');
        cards.forEach(card => {
          card.addEventListener('mousemove', handleCardMouseMoveThrottled);
          card.addEventListener('mouseleave', handleCardMouseLeave);
        });
        
        setupResizeObserver();
        
        // Handle URL hash for direct linking to milestones
        handleUrlHash();
        window.addEventListener('hashchange', handleUrlHash);
      }, 500);
    });
    
    onBeforeUnmount(() => {
      isMounted.value = false;
      cleanup();
      window.removeEventListener('hashchange', handleUrlHash);
    });

    // Smooth scroll to element
    const scrollToElement = (element) => {
      if (!element || !isMounted.value) return;
      
      const rect = element.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      // Only scroll if element is not fully in viewport
      if (!isInViewport) {
        // Calculate scroll position - add some padding
        const scrollPosition = window.pageYOffset + rect.top - 100;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    };

    return {
      quarters,
      searchQuery,
      selectedYear,
      selectedMilestone,
      selectedTags,
      availableYears,
      availableMilestones,
      filteredQuarters,
      toggleQuarter,
      toggleMilestone,
      toggleTask,
      toggleSubtask,
      handleTouchStart,
      handleTouchStartTask,
      getProgressPercentage,
      handleCardMouseMove: handleCardMouseMoveThrottled,
      handleCardMouseLeave,
      beforeEnter,
      enter,
      beforeLeave,
      leave,
      beforeEnterFade,
      enterFade,
      beforeLeaveFade,
      leaveFade,
      availableTags,
      getTagColor,
      toggleTagFilter,
      clearTagFilters,
      totalMilestones,
      totalTasks,
      completedTasks,
      completedPercentage,
      notifications,
      showNotification,
      copyMilestoneLink
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
  min-height: var(--viewport-height);
  color: var(--color-text);
  position: relative;
  overflow: hidden;
  padding-top: 4rem;
  background: linear-gradient(135deg, #0c1016f0, #141b2af0, #0c1016f0), url('@/assets/webp/login.webp') no-repeat center center;
  background-size: cover;
  contain: paint;
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
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Header Styling */
.roadmap-header {
  text-align: center;
  margin-bottom: 3rem;
}

.cosmic-title {
  font-size: 3.5rem;
  background: linear-gradient(135deg, #fff 0%, #0FB9FD 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
}

.cosmic-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 800px;
  margin: 0 auto;
}

/* Search & Filter Section */
.search-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(15, 185, 253, 0.7);
}

.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  background: rgba(10, 17, 35, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: rgba(15, 185, 253, 0.6);
  outline: none;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.filter-wrapper {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.85rem 1.5rem 0.85rem 1rem;
  background: rgba(10, 17, 35, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  min-width: 170px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(15, 185, 253, 0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.filter-select:focus {
  border-color: rgba(15, 185, 253, 0.6);
  outline: none;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

/* Tags Filter */
.tags-filter-container {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 25, 45, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.15);
}

.tags-title {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.tag-button {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: rgba(15, 25, 45, 0.5);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 30px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.tag-button:hover {
  background: rgba(15, 25, 45, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.tag-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.5);
  color: #fff;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.tag-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.clear-tags-button {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.3);
  border-radius: 30px;
  color: rgba(255, 150, 150, 0.9);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-tags-button:hover {
  background: rgba(255, 75, 75, 0.2);
  color: rgba(255, 200, 200, 1);
}

.clear-icon {
  font-size: 1.2rem;
  margin-right: 0.3rem;
}

/* Roadmap Stats */
.roadmap-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  position: relative;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  min-width: 100px;
  text-align: center;
  padding: 0.5rem;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(15, 25, 45, 0.5);
  overflow: hidden;
}

.stat-progress-bar {
  height: 100%;
  background: linear-gradient(to right,
    rgba(15, 185, 253, 0.8),
    rgba(88, 101, 242, 0.8));
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
}

@media (max-width: 768px) {
  .tags-filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stat-item {
    min-width: 80px;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
}

/* VERTICAL TIMELINE - COMPLETELY REIMAGINED */
.quarters-container {
  position: relative;
  padding-left: 50px; /* Space for timeline */
  margin: 0 auto;
  max-width: 900px;
}

/* Main timeline line */
.quarters-container::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 4px;
  background: linear-gradient(to bottom, 
    rgba(15, 185, 253, 0.1),
    rgba(15, 185, 253, 0.8),
    rgba(15, 185, 253, 0.1));
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.3);
  z-index: 1;
}

/* Quarter styling */
.quarter {
  position: relative;
  margin-bottom: 60px;
}

/* Quarter node */
.quarter::before {
  content: '';
  position: absolute;
  top: 28px;
  left: -36px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.15);
  border: 3px solid rgba(15, 185, 253, 0.6);
  box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.1), 0 0 15px rgba(15, 185, 253, 0.5);
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.8s ease;
  animation: pulse-glow 4s infinite ease-in-out;
}

@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.1), 0 0 15px rgba(15, 185, 253, 0.5); }
  50% { box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.2), 0 0 25px rgba(15, 185, 253, 0.7); }
  100% { box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.1), 0 0 15px rgba(15, 185, 253, 0.5); }
}

.quarter:hover::before {
  transform: scale(1.2);
  background: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 0 6px rgba(15, 185, 253, 0.15), 0 0 25px rgba(15, 185, 253, 0.7);
}

.quarter.active::before {
  background: rgba(15, 185, 253, 0.8);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 6px rgba(15, 185, 253, 0.2), 0 0 30px rgba(15, 185, 253, 0.8);
}

.quarter-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(145deg, 
    rgba(10, 17, 35, 0.8),
    rgba(15, 25, 45, 0.9));
  border-radius: 16px;
  border-left: 4px solid rgba(15, 185, 253, 0.6);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-left-color 0.3s ease;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transform-origin: center;
  will-change: transform;
}

.quarter-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(15, 185, 253, 0.2);
  border-left-color: rgba(15, 185, 253, 0.8);
}

.quarter-header::before {
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

.quarter-header:hover::before {
  opacity: 1;
}

.header-content {
  flex: 1;
}

.header-content h2 {
  font-size: 1.8rem;
  margin: 0 0 0.75rem 0;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #fff, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-left: 2rem;
}

/* Milestones container */
.milestones {
  margin-top: 1.5rem;
}

/* Milestone styling */
.milestone {
  margin: 0 0 30px 1.5rem;
  position: relative;
}

/* Milestone node */
.milestone::before {
  content: '';
  position: absolute;
  top: 28px;
  left: -64px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(88, 101, 242, 0.15);
  border: 2px solid rgba(88, 101, 242, 0.6);
  box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1), 0 0 10px rgba(88, 101, 242, 0.4);
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  animation: milestone-pulse 4s infinite ease-in-out;
}

@keyframes milestone-pulse {
  0% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1), 0 0 10px rgba(88, 101, 242, 0.4); }
  50% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.2), 0 0 20px rgba(88, 101, 242, 0.6); }
  100% { box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1), 0 0 10px rgba(88, 101, 242, 0.4); }
}

/* Line from milestone to main timeline */
.milestone::after {
  content: '';
  position: absolute;
  top: 32px;
  left: -63px;
  width: 27px;
  height: 2px;
  background: rgba(88, 101, 242, 0.5);
  z-index: 1;
  transition: all 0.3s ease;
}

.milestone:hover::before {
  transform: scale(1.3);
  background: rgba(88, 101, 242, 0.3);
  box-shadow: 0 0 0 4px rgba(88, 101, 242, 0.15), 0 0 15px rgba(88, 101, 242, 0.6);
}

.milestone:hover::after {
  background: rgba(88, 101, 242, 0.8);
  height: 3px;
  width: 30px;
}

.milestone-header {
  padding: 1.25rem 1.75rem;
  background: linear-gradient(145deg, 
    rgba(20, 30, 55, 0.7),
    rgba(30, 40, 70, 0.8));
  border-radius: 14px;
  border-left: 3px solid rgba(88, 101, 242, 0.6);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-left-color 0.3s ease;
  backdrop-filter: blur(8px);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transform-origin: center;
  will-change: transform;
}

.milestone-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(15, 185, 253, 0.2);
  border-left-color: rgba(15, 185, 253, 0.8);
}

.milestone-header::before {
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

.milestone-header:hover::before {
  opacity: 1;
}

.milestone-header h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Tasks container */
.tasks {
  margin: 1.25rem 0 0 1.25rem;
}

/* Task styling */
.task {
  margin-bottom: 1.5rem;
  background: rgba(25, 35, 55, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(40, 50, 80, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.task:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3), 0 0 10px rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.task-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.task-header:hover {
  background: rgba(15, 185, 253, 0.05);
}

.task-header h4 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  color: #fff;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.task-status-wrapper {
  margin: 0 0.75rem;
}

.task-status {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
}

.task-status.todo {
  background: rgba(255, 128, 0, 0.15);
  border: 1px solid rgba(255, 128, 0, 0.3);
  color: rgba(255, 180, 0, 0.9);
}

.task-status.in-progress {
  background: rgba(88, 101, 242, 0.15);
  border: 1px solid rgba(88, 101, 242, 0.3);
  color: rgba(120, 130, 255, 0.9);
}

.task-status.completed {
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid rgba(46, 213, 115, 0.3);
  color: rgba(80, 230, 130, 0.9);
}

/* Subtasks container */
.subtasks {
  padding: 0.75rem 1.5rem 1.5rem;
  background: rgba(20, 30, 50, 0.4);
  border-top: 1px solid rgba(40, 50, 80, 0.4);
}

.subtask {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(30, 40, 60, 0.5);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}

.subtask:hover {
  background: rgba(30, 40, 60, 0.7);
  transform: translateX(3px);
}

.subtask.completed {
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid rgba(46, 213, 115, 0.15);
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  flex: 1;
}

.checkbox-container input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(88, 101, 242, 0.4);
  border-radius: 4px;
  background: rgba(15, 25, 45, 0.3);
  margin-right: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.checkbox-container input[type="checkbox"]:checked {
  background: rgba(46, 213, 115, 0.8);
  border-color: rgba(46, 213, 115, 0.6);
}

.checkbox-container input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container label {
  font-size: 1rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
  font-weight: 500;
}

.checkbox-container input[type="checkbox"]:checked + label {
  color: rgba(46, 213, 115, 0.9);
  text-decoration: line-through;
}

.subtask-status {
  font-size: 0.8rem;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  background: rgba(255, 128, 0, 0.15);
  color: rgba(255, 180, 0, 0.9);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.subtask-status.completed {
  background: rgba(46, 213, 115, 0.15);
  color: rgba(80, 230, 130, 0.9);
}

.subtask-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.75rem 0 0 32px;
  line-height: 1.5;
}

/* Progress bar styling */
.progress-wrapper {
  display: flex;
  align-items: center;
  min-width: 150px;
}

.progress-container {
  flex: 1;
  height: 8px;
  background: rgba(15, 25, 45, 0.5);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.8), 
    rgba(88, 101, 242, 0.8),
    rgba(201, 42, 253, 0.8),
    rgba(15, 185, 253, 0.8));
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
  background-size: 200% 200%;
  animation: progress-gradient 8s infinite linear;
}

@keyframes progress-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.progress-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  margin: 0 0.75rem;
  font-weight: 500;
}

/* Toggle icon styling */
.toggle-icon {
  width: 28px;
  height: 28px;
  position: relative;
  cursor: pointer;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.toggle-icon:hover {
  background: rgba(15, 185, 253, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.4);
}

.icon-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.icon-line.horizontal {
  width: 60%;
  height: 2px;
  left: 20%;
}

.icon-line.vertical {
  width: 2px;
  height: 60%;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
}

.icon-line.hidden {
  opacity: 0;
}

.toggle-icon.small {
  width: 22px;
  height: 22px;
}

.toggle-icon.small .icon-line.horizontal {
  width: 55%;
  left: 22.5%;
}

.toggle-icon.small .icon-line.vertical {
  height: 55%;
  top: 22.5%;
}

.toggle-icon.is-open {
  background: rgba(88, 101, 242, 0.2);
  border-color: rgba(88, 101, 242, 0.4);
  transform: rotate(180deg);
}

/* Enhanced transitions */
.cosmic-slide-enter-active,
.cosmic-slide-leave-active {
  transition: max-height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
              transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top;
  overflow: hidden;
  will-change: max-height, opacity, transform;
}

.cosmic-fade-enter-active,
.cosmic-fade-leave-active {
  transition: max-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
  will-change: max-height, opacity;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .roadmap-container {
    padding: 1rem;
  }

  .cosmic-title {
    font-size: 2.5rem;
  }

  .cosmic-subtitle {
    font-size: 1rem;
  }

  .search-filter-container {
    flex-direction: column;
    padding: 1.25rem;
  }

  .quarters-container {
    padding-left: 45px;
  }

  .quarters-container::before {
    left: 18px;
  }

  .quarter::before {
    left: -32px;
    top: 20px;
    width: 20px;
    height: 20px;
  }

  .milestone::before {
    left: -58px;
    top: 20px;
    width: 14px;
    height: 14px;
  }

  .milestone::after {
    left: -57px;
    top: 24px;
    width: 24px;
  }

  .quarter-header,
  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .header-right {
    width: 100%;
    margin-top: 1rem;
    margin-left: 0;
    justify-content: space-between;
  }

  .progress-wrapper {
    min-width: 0;
    flex: 1;
  }

  .task-status-wrapper {
    margin: 0.5rem 0;
  }

  .milestone {
    margin-left: 0.75rem;
  }

  .tasks {
    margin-left: 0.5rem;
  }

  .subtask-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .subtask-status {
    margin-left: 32px;
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
       (-ms-high-contrast: active),
       (-ms-high-contrast: none) {
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