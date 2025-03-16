<template>
  <div class="roadmap-page">
    <!-- Enhanced Cosmic Background -->
    <div class="cosmic-background"></div>

    <!-- Main Section -->
    <div class="roadmap-page-content">
      <!-- Desktop Hero Section (Left Side) -->
      <div class="desktop-hero-section">
        <div class="desktop-hero-content">
          <div class="logo-area">
            <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts Logo" class="hero-logo" />
          </div>
          <div class="title-area">
            <h1 class="cosmic-title">Cosmic Roadmap</h1>
            <p class="cosmic-subtitle">Follow the milestones, track the progress, and watch history unfold.</p>
          </div>
          <!-- Add Current Quarter Button -->
          <div class="hero-actions">
            <button class="current-quarter-btn" @click="scrollToCurrentQuarter">
              <span class="pulse-ring"></span>
              <span class="btn-text">Current Quarter</span>
              <span class="btn-icon">→</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Right Side Content (Searchbar & Roadmap) -->
      <div class="roadmap-content">
        <!-- Roadmap Header Section with new compact hero for mobile -->
        <div class="roadmap-header-section">
          <!-- New Compact Hero Section (Mobile) -->
          <header class="compact-hero">
            <div class="compact-hero-content">
              <div class="compact-hero-left">
                <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts Logo" class="compact-hero-logo" />
              </div>
              <div class="compact-hero-center">
                <h1 class="compact-title">Cosmic Roadmap</h1>
                <p class="compact-subtitle">Follow the cosmic journey</p>
              </div>
              <div class="compact-hero-right">
                <button class="compact-quarter-btn" @click="scrollToCurrentQuarter">
                  <span class="pulse-ring"></span>
                  <span class="btn-text">Current</span>
                  <span class="btn-icon">→</span>
                </button>
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
            <div v-for="(quarter, qIndex) in filteredQuarters" :key="qIndex" class="quarter" 
              :class="{ 'active': quarter.open, 'completed': quarter.status === 'Completed', 'in-progress': quarter.status === 'In Progress', 'current-quarter': isCurrent(quarter) }">
              <div class="quarter-header" @click.stop="toggleQuarter(qIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                <div class="header-content">
                  <div class="title-with-status">
                    <div class="status-icon" :class="getItemStatusClass(quarter)" @click.stop="toggleQuarterStatus(quarter, $event)"></div>
                    <h2>{{ quarter.period }}</h2>
                  </div>
                  <p class="description">{{ quarter.description }}</p>
                </div>
                <div class="status-indicators">
                  <div class="task-status-wrapper">
                    <span class="task-status" :class="quarter.status ? quarter.status.toLowerCase().replace(/\s+/g, '-') : ''">{{ quarter.status || 'Pending' }}</span>
                    <span class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</span>
                  </div>
                  <div class="progress-wrapper">
                    <div class="progress-container">
                      <div class="progress-bar" :style="{ width: getProgressPercentage(quarter.completed, quarter.total) + '%' }"></div>
                    </div>
                    <div class="toggle-icon" :class="{ 'is-open': quarter.open }">
                      <div class="icon-line horizontal"></div>
                      <div class="icon-line vertical" :class="{ 'hidden': quarter.open }"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Milestones Section -->
              <div v-if="quarter.open" class="milestones">
                <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone" 
                  :class="{ 'completed': milestone.status === 'Completed', 'in-progress': milestone.status === 'In Progress' }">
                  <div class="milestone-header" @click.stop="toggleMilestone(quarter, milestone, mIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                    <div class="header-content">
                      <div class="title-with-status">
                        <div class="status-icon" :class="getItemStatusClass(milestone)" @click.stop="toggleMilestoneStatus(quarter, milestone, $event)"></div>
                        <h3>{{ milestone.title }}</h3>
                      </div>
                      <p class="description">{{ milestone.description }}</p>
                    </div>
                    <div class="status-indicators">
                      <div class="task-status-wrapper">
                        <span class="task-status" :class="milestone.status ? milestone.status.toLowerCase().replace(/\s+/g, '-') : ''">{{ milestone.status || 'Pending' }}</span>
                        <span class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</span>
                      </div>
                      <div class="progress-wrapper">
                        <div class="progress-container">
                          <div class="progress-bar" :style="{ width: getProgressPercentage(milestone.completed, milestone.total) + '%' }"></div>
                        </div>
                        <div class="toggle-icon" :class="{ 'is-open': milestone.open }">
                          <div class="icon-line horizontal"></div>
                          <div class="icon-line vertical" :class="{ 'hidden': milestone.open }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tasks Section -->
                  <div v-if="milestone.open" class="tasks">
                    <div v-for="(task, tIndex) in milestone.tasks" :key="tIndex" class="task" 
                      :class="{ 'completed': task.status === 'Completed', 'in-progress': task.status === 'In Progress' }">
                      <div class="task-header" @click.stop="toggleTask(quarter, milestone, task, tIndex, $event)" @mousemove="!preferReducedMotion && handleCardMouseMove" @mouseleave="handleCardMouseLeave">
                        <div class="header-content">
                          <div class="title-with-status">
                            <div class="status-icon" :class="getItemStatusClass(task)" @click.stop="toggleTaskStatus(task)"></div>
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
                            <span class="task-status" :class="task.status ? task.status.toLowerCase().replace(/\s+/g, '-') : ''">{{ task.status || 'Pending' }}</span>
                            <span class="progress-text">{{ task.completed }}/{{ task.total }}</span>
                          </div>
                          <div class="progress-wrapper">
                            <div class="progress-container">
                              <div class="progress-bar" :style="{ width: getProgressPercentage(task.completed, task.total) + '%' }"></div>
                            </div>
                            <div class="toggle-icon small" :class="{ 'is-open': task.open }">
                              <div class="icon-line horizontal"></div>
                              <div class="icon-line vertical" :class="{ 'hidden': task.open }"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Subtasks Section -->
                      <div v-if="task.open && task.subtasks" class="subtasks">
                        <div v-for="(subtask, stIndex) in task.subtasks" :key="stIndex" class="subtask" :class="{ completed: subtask.completed }">
                          <div class="subtask-header">
                            <div class="checkbox-container">
                              <div class="status-icon subtask-status-icon" :class="{ 'completed': subtask.completed, 'pending': !subtask.completed }" @click.stop="toggleSubtask(quarter, milestone, task, subtask, $event)"></div>
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
          
        // Initialize status values based on completion
        initializeStatuses();
          
        // After loading, find and scroll to current quarter
        nextTick(() => {
          scrollToCurrentQuarter();
        });
      } catch (error) {
        console.error('Error loading roadmap data:', error);
        quarters.value = [];
      }
    };
    
    // Initialize status values for all items based on their completion
    const initializeStatuses = () => {
      quarters.value.forEach(quarter => {
        // Initialize quarter status
        if (quarter.completed === quarter.total && quarter.total > 0) {
          quarter.status = 'Completed';
        } else if (quarter.completed > 0) {
          quarter.status = 'In Progress';
        } else {
          quarter.status = 'ToDo';
        }
        
        // Initialize milestone statuses
        quarter.milestones?.forEach(milestone => {
          if (milestone.completed === milestone.total && milestone.total > 0) {
            milestone.status = 'Completed';
          } else if (milestone.completed > 0) {
            milestone.status = 'In Progress';
          } else {
            milestone.status = 'ToDo';
          }
          
          // Initialize task statuses
          milestone.tasks?.forEach(task => {
            // If task has a status from JSON, keep it
            if (!task.status || task.status === '') {
              if (task.completed === task.total && task.total > 0) {
                task.status = 'Completed';
              } else if (task.completed > 0) {
                task.status = 'In Progress';
              } else {
                task.status = 'ToDo';
              }
            }
          });
        });
      });
    };

    // Simplified scroll helper - Update this to be more accurate
    const scrollToElement = (element) => {
      if (!element || !isMounted.value) return;
      
      const scrollableContent = document.querySelector('.scrollable-content');
      if (!scrollableContent) return;
      
      // Add a small delay to ensure DOM has updated
      setTimeout(() => {
        const elementTop = element.offsetTop;
        const scrollPosition = elementTop - 80; // Adjust for header offset
        
        scrollableContent.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    };

    // Find current quarter and scroll to it
    const scrollToCurrentQuarter = () => {
      if (!quarters.value.length || !isMounted.value) return;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3) + 1;
      
      console.log(`Looking for quarter ${currentQuarter} of year ${currentYear}`);
      
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
        console.log(`Current quarter not found, using index ${targetIndex} instead`);
      } else {
        console.log(`Found current quarter at index ${targetIndex}`);
      }
      
      // First mark the current quarter
      if (targetIndex >= 0 && targetIndex < quarters.value.length) {
        // Set quarter status to In Progress if it's the current quarter and not completed
        const currentQuarter = quarters.value[targetIndex];
        if (currentQuarter.status !== 'Completed') {
          currentQuarter.status = 'In Progress';
        }
        
        // Auto-expand current quarter
        currentQuarter.open = true;
      }
      
      // Wait for the DOM to update before scrolling
      setTimeout(() => {
        nextTick(() => {
          const scrollableContent = document.querySelector('.scrollable-content');
          const quarterElements = document.querySelectorAll('.quarter');
          
          if (quarterElements.length > targetIndex && scrollableContent) {
            const targetElement = quarterElements[targetIndex];
            if (targetElement) {
              console.log('Scrolling to current quarter element');
              targetElement.classList.add('current-quarter');
              
              // Calculate precise scroll position with additional offset for better visibility
              const elementTop = targetElement.offsetTop;
              const scrollPadding = 200; // Additional padding from top
              
              // Perform the scroll
              scrollableContent.scrollTo({
                top: elementTop - scrollPadding,
                behavior: 'smooth'
              });
              
              // Add a highlight flash effect to draw attention
              setTimeout(() => {
                targetElement.style.transition = 'background-color 0.5s ease';
                targetElement.style.backgroundColor = 'rgba(15, 185, 253, 0.2)';
                
                setTimeout(() => {
                  targetElement.style.backgroundColor = '';
                  // After highlight, reset the transition
                  setTimeout(() => {
                    targetElement.style.transition = '';
                  }, 500);
                }, 1000);
              }, 600);
            }
          }
        });
      }, 300); // Give more time for the DOM to update
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
      // Ensure we have valid numbers
      const completedNum = Number(completed) || 0;
      const totalNum = Number(total) || 1; // Prevent division by zero
      
      // Calculate percentage and ensure it's between 0-100
      const percentage = Math.min(100, Math.max(0, (completedNum / totalNum) * 100));
      
      // Round to nearest integer for cleaner display
      return Math.round(percentage);
    };

    const getTagColor = (tag) => {
      const hash = tag.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    };

    const updateTaskCompletion = (task) => {
      if (!task.subtasks || task.subtasks.length === 0) return;
      
      // Count completed subtasks
      const completedSubtasks = task.subtasks.filter(st => st.completed).length;
      
      // Update task completion stats
      task.completed = completedSubtasks;
      
      // Update task status based on completion
      if (completedSubtasks === 0) {
        task.status = "ToDo";
      } else if (completedSubtasks < task.subtasks.length) {
        task.status = "In Progress";
      } else {
        task.status = "Completed";
      }
    };

    const updateMilestoneCompletion = (milestone) => {
      if (!milestone.tasks || milestone.tasks.length === 0) return;
      
      // Count completed and in-progress tasks
      const completedTasks = milestone.tasks.filter(task => 
        task.status === "Completed" || 
        (task.subtasks && task.completed === task.subtasks.length) || 
        (task.completed === task.total && task.total > 0)
      ).length;
      
      const inProgressTasks = milestone.tasks.filter(task => 
        task.status === "In Progress" || 
        (task.completed > 0 && task.completed < (task.subtasks ? task.subtasks.length : task.total))
      ).length;
      
      // Update milestone completion stats
      milestone.completed = completedTasks;
      
      // Set milestone status based on task completion
      if (completedTasks === milestone.tasks.length) {
        milestone.status = "Completed";
      } else if (completedTasks > 0 || inProgressTasks > 0) {
        milestone.status = "In Progress";
      } else {
        milestone.status = "ToDo";
      }
    };

    const updateQuarterCompletion = (quarter) => {
      if (!quarter.milestones || quarter.milestones.length === 0) return;
      
      // Count completed and in-progress milestones
      const completedMilestones = quarter.milestones.filter(milestone => 
        milestone.status === "Completed" || 
        (milestone.completed === milestone.tasks.length && milestone.tasks.length > 0)
      ).length;
      
      const inProgressMilestones = quarter.milestones.filter(milestone => 
        milestone.status === "In Progress" || 
        (milestone.completed > 0 && milestone.completed < milestone.tasks.length)
      ).length;
      
      // Update quarter completion stats
      quarter.completed = completedMilestones;
      
      // Set quarter status based on milestone completion
      if (completedMilestones === quarter.milestones.length) {
        quarter.status = "Completed";
      } else if (completedMilestones > 0 || inProgressMilestones > 0) {
        quarter.status = "In Progress";
      } else {
        quarter.status = "ToDo";
      }
    };

    const toggleSubtask = (quarter, milestone, task, subtask, event) => {
      subtask.completed = !subtask.completed;
      updateTaskCompletion(task);
      updateMilestoneCompletion(milestone);
      updateQuarterCompletion(quarter);
      
      // Stop event propagation
      if (event) {
        event.stopPropagation();
      }
    };

    // Tag filter toggle
    const toggleTagFilter = (tag) => {
      // Do nothing since notifications are removed
    };

    // Status toggling functions
    const toggleQuarterStatus = (quarter) => {
      if (quarter.status === 'Completed') {
        quarter.status = 'ToDo';
        quarter.completed = 0;
        
        // Reset all milestones to incomplete
        if (quarter.milestones && quarter.milestones.length > 0) {
          quarter.milestones.forEach(milestone => {
            milestone.status = 'ToDo';
            milestone.completed = 0;
            
            // Reset all tasks
            if (milestone.tasks && milestone.tasks.length > 0) {
              milestone.tasks.forEach(task => {
                task.status = 'ToDo';
                task.completed = 0;
                
                // Reset all subtasks
                if (task.subtasks && task.subtasks.length > 0) {
                  task.subtasks.forEach(subtask => {
                    subtask.completed = false;
                  });
                }
              });
            }
          });
        }
      } else {
        quarter.status = 'Completed';
        
        // Mark all milestones as completed
        if (quarter.milestones && quarter.milestones.length > 0) {
          quarter.milestones.forEach(milestone => {
            milestone.status = 'Completed';
            
            // Mark all tasks as completed
            if (milestone.tasks && milestone.tasks.length > 0) {
              milestone.tasks.forEach(task => {
                task.status = 'Completed';
                
                // Mark all subtasks as completed
                if (task.subtasks && task.subtasks.length > 0) {
                  task.subtasks.forEach(subtask => {
                    subtask.completed = true;
                  });
                  task.completed = task.subtasks.length;
                  task.total = task.subtasks.length;
                } else {
                  task.completed = 1;
                  task.total = 1;
                }
              });
              
              milestone.completed = milestone.tasks.length;
              milestone.total = milestone.tasks.length;
            }
          });
          
          quarter.completed = quarter.milestones.length;
          quarter.total = quarter.milestones.length;
        }
      }
    };

    const toggleMilestoneStatus = (milestone) => {
      if (milestone.status === 'Completed') {
        milestone.status = 'ToDo';
        milestone.completed = 0;
        
        // Reset all tasks to incomplete
        if (milestone.tasks && milestone.tasks.length > 0) {
          milestone.tasks.forEach(task => {
            task.status = 'ToDo';
            task.completed = 0;
            
            // Reset all subtasks
            if (task.subtasks && task.subtasks.length > 0) {
              task.subtasks.forEach(subtask => {
                subtask.completed = false;
              });
            }
          });
        }
      } else {
        milestone.status = 'Completed';
        
        // Mark all tasks as completed
        if (milestone.tasks && milestone.tasks.length > 0) {
          milestone.tasks.forEach(task => {
            task.status = 'Completed';
            
            // Mark all subtasks as completed
            if (task.subtasks && task.subtasks.length > 0) {
              task.subtasks.forEach(subtask => {
                subtask.completed = true;
              });
              task.completed = task.subtasks.length;
              task.total = task.subtasks.length;
            } else {
              task.completed = 1;
              task.total = 1;
            }
          });
          
          milestone.completed = milestone.tasks.length;
          milestone.total = milestone.tasks.length;
        }
      }
      
      // Update parent quarter's progress
      const quarter = roadmapData.value.quarters
        .find(q => q.milestones && q.milestones.includes(milestone));
        
      if (quarter) {
        updateQuarterProgress(quarter);
      }
    };

    const toggleTaskStatus = (task) => {
      if (task.status === 'Completed') {
        task.status = 'ToDo';
        task.completed = 0;
        
        // Reset all subtasks to incomplete
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            subtask.completed = false;
          });
        }
      } else {
        task.status = 'Completed';
        
        // Mark all subtasks as completed
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            subtask.completed = true;
          });
          task.completed = task.subtasks.length;
          task.total = task.subtasks.length;
        } else {
          // If no subtasks, set completed to 1 and total to 1
          task.completed = 1;
          task.total = 1;
        }
      }
      
      // Update parent milestone's progress
      const milestone = roadmapData.value.quarters
        .flatMap(q => q.milestones)
        .find(m => m.tasks && m.tasks.includes(task));
        
      if (milestone) {
        updateMilestoneProgress(milestone);
      }
    };

    // Helper function to update milestone progress
    const updateMilestoneProgress = (milestone) => {
      if (!milestone.tasks) return;
      
      const completedTasks = milestone.tasks.filter(t => t.status === 'Completed').length;
      milestone.completed = completedTasks;
      milestone.total = milestone.tasks.length;
      
      // Update parent quarter's progress
      const quarter = roadmapData.value.quarters
        .find(q => q.milestones && q.milestones.includes(milestone));
        
      if (quarter) {
        updateQuarterProgress(quarter);
      }
    };

    // Helper function to update quarter progress
    const updateQuarterProgress = (quarter) => {
      if (!quarter.milestones) return;
      
      const completedMilestones = quarter.milestones.filter(m => 
        m.tasks && m.completed === m.tasks.length
      ).length;
      
      quarter.completed = completedMilestones;
      quarter.total = quarter.milestones.length;
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
      
      // Add event listener for reduced motion preference changes
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion);
      
      // Add resize event listener to handle layout changes
      window.addEventListener('resize', () => {
        if (isMounted.value) {
          // Re-scroll to current quarter when resizing
          nextTick(() => {
            scrollToCurrentQuarter();
            currentQuarterStyling();
          });
        }
      });
      
      // Call currentQuarterStyling after initial load
      setTimeout(() => {
        currentQuarterStyling();
      }, 500);
    });
    
    onBeforeUnmount(() => {
      isMounted.value = false;
      window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkReducedMotion);
    });

    // Add a new method to determine if a quarter is the current quarter
    const isCurrent = (quarter) => {
      // Skip if the item doesn't have year and quarterNum properties
      if (!quarter || !quarter.year || !quarter.quarterNum) return false;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentQuarter = Math.floor(currentMonth / 3) + 1;
      
      // Check if the period contains the current year and quarter (for string-based period format)
      if (quarter.period) {
        const periodString = quarter.period.toString();
        return periodString.includes(currentYear.toString()) && 
               periodString.includes(`Q${currentQuarter}`);
      }
      
      // For numerical properties
      return quarter.year === currentYear && quarter.quarterNum === currentQuarter;
    };
    
    // Add additional styling for current quarter indicator
    const currentQuarterStyling = () => {
      nextTick(() => {
        // Find all quarters with the current-quarter class
        const currentQuarters = document.querySelectorAll('.quarter.current-quarter');
        currentQuarters.forEach(element => {
          // Add any additional visual indicators here
          element.style.position = 'relative';
          
          // Add a pulsing dot indicator in the top right corner
          const indicator = document.createElement('div');
          indicator.classList.add('current-indicator');
          indicator.style.position = 'absolute';
          indicator.style.top = '0.75rem';
          indicator.style.right = '0.75rem';
          indicator.style.width = '0.75rem';
          indicator.style.height = '0.75rem';
          indicator.style.borderRadius = '50%';
          indicator.style.backgroundColor = 'var(--cosmic-blue)';
          indicator.style.boxShadow = '0 0 10px var(--cosmic-blue)';
          indicator.style.animation = 'pulseIndicator 2s infinite';
          
          // Add the indicator to the quarter element if it doesn't already exist
          if (!element.querySelector('.current-indicator')) {
            element.appendChild(indicator);
          }
        });
      });
    };

    // Add a method to get the appropriate status class for a quarter
    const getQuarterStatusClass = (quarter) => {
      if (quarter.completed) return 'completed';
      if (isCurrent(quarter)) return 'current';
      return 'future';
    };

    const getItemStatusClass = (item) => {
      if (item.status === 'Completed') return 'completed';
      if (item.status === 'In Progress' || item.status === 'InProgress') return 'in-progress';
      if (item.status === 'ToDo' || item.status === 'To Do' || item.status === 'todo') return 'todo';
      // If current quarter/milestone but no status is explicitly set
      if (isCurrent(item)) return 'in-progress';
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
      getQuarterStatusClass,
      getItemStatusClass,
      toggleQuarterStatus,
      toggleMilestoneStatus,
      toggleTaskStatus
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
    url('@/assets/webp/hyperspace03.webp') center/cover no-repeat,
    radial-gradient(circle at 10% 20%, var(--cosmic-blue-translucent) 0%, transparent 40%),
    radial-gradient(circle at 80% 30%, var(--cosmic-blue-translucent-faint) 0%, transparent 40%),
    radial-gradient(circle at 40% 70%, var(--cosmic-purple-translucent) 0%, transparent 40%),
    radial-gradient(circle at 60% 50%, var(--cosmic-purple-translucent-faint) 0%, transparent 50%);
  filter: blur(var(--cosmic-glass-blur));
  z-index: 0;
  pointer-events: none;
  transform-style: preserve-3d;
  opacity: .25;
}

.cosmic-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 50% 30%, var(--cosmic-blue-glow) 0%,
    transparent 60%),
    radial-gradient(circle at 80% 40%, var(--cosmic-purple-translucent) 0%, transparent 50%);
  z-index: 1;
  pointer-events: none;
  animation: pulseGlow 8s infinite alternate var(--cosmic-transition-smooth);
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

/* Add missing twinkling animation */
@keyframes twinkling {
  0% {
    opacity: 0.7;
    transform: translateZ(-50px) scale(1);
    background-position: 0% 0%;
  }
  50% {
    opacity: 0.9;
    background-position: 50% 25%;
  }
  100% {
    opacity: 0.7;
    transform: translateZ(-50px) scale(1.05);
    background-position: 100% 50%;
  }
}

/* Animation for titles */
@keyframes titleFloat {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-5px);
  }
}

/* Animation for subtitles */
@keyframes subtitleFloat {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-3px);
  }
}

/* Animation for logo pulse */
@keyframes pulseLogo {
  0% {
    filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.4));
  }
  100% {
    filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.8));
  }
}

/* Animation for CTA button pulse */
@keyframes pulseCTA {
  0% {
    box-shadow: 0 0 0 0 rgba(15, 185, 253, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(15, 185, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(15, 185, 253, 0);
  }
}

/* Animation for fade in elements */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Desktop Hero Section - remove background and outline */
.desktop-hero-section {
  display: none;
  height: 100%;
  width: 350px;
  min-width: 350px;
  position: relative;
  overflow: hidden;
  margin-right: 2rem; /* Keep gap between hero and roadmap content */
}

@media (min-width: 1024px) {
  .desktop-hero-section {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Update overall page layout */
  .roadmap-page-content {
    display: flex;
    flex-direction: row;
    height: calc(100vh - var(--header-height) - var(--page-padding) * 2);
    overflow: hidden;
  }
  
  .roadmap-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

/* Remove the background styles */
.desktop-hero-section::before, 
.desktop-hero-section::after {
  display: none;
}

/* Desktop Hero Content */
.desktop-hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2rem;
  position: relative;
  z-index: 1;
  text-align: center;
  background: var(--cosmic-glass-bg-faint);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-md);
}

/* Remove the background styles for desktop hero content */
.desktop-hero-content::before {
  display: none;
}

/* Add star field to desktop hero */
.desktop-hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Ensure vertical centering */
  width: 100%;
  height: 100%;
  padding: 2rem;
  position: relative;
  z-index: 1;
  text-align: center;
}

/* Star animation for hero background */
.desktop-hero-content::before {
  content: '';
  position: absolute;
  top: -300px;
  left: -300px;
  right: -300px;
  bottom: -300px;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23FFFFFF' stroke-opacity='0.7'%3E%3Ccircle r='1' cx='32' cy='52'/%3E%3Ccircle r='0.5' cx='76' cy='29'/%3E%3Ccircle r='1.2' cx='102' cy='97'/%3E%3Ccircle r='0.7' cx='143' cy='152'/%3E%3Ccircle r='1.1' cx='186' cy='61'/%3E%3Ccircle r='0.4' cx='241' cy='98'/%3E%3Ccircle r='1.5' cx='126' cy='205'/%3E%3Ccircle r='0.8' cx='220' cy='211'/%3E%3Ccircle r='1.3' cx='310' cy='40'/%3E%3Ccircle r='0.6' cx='376' cy='87'/%3E%3Ccircle r='1.2' cx='400' cy='180'/%3E%3Ccircle r='0.9' cx='466' cy='158'/%3E%3Ccircle r='1.4' cx='355' cy='220'/%3E%3Ccircle r='0.7' cx='523' cy='41'/%3E%3Ccircle r='1.2' cx='574' cy='95'/%3E%3Ccircle r='0.8' cx='629' cy='163'/%3E%3Ccircle r='1.3' cx='590' cy='219'/%3E%3Ccircle r='0.5' cx='670' cy='50'/%3E%3Ccircle r='1.1' cx='738' cy='95'/%3E%3Ccircle r='0.6' cx='777' cy='170'/%3E%3Ccircle r='1.4' cx='710' cy='210'/%3E%3Ccircle r='0.7' cx='70' cy='290'/%3E%3Ccircle r='1.3' cx='126' cy='329'/%3E%3Ccircle r='0.8' cx='195' cy='280'/%3E%3Ccircle r='1.5' cx='235' cy='340'/%3E%3Ccircle r='0.6' cx='320' cy='310'/%3E%3Ccircle r='1.2' cx='370' cy='268'/%3E%3Ccircle r='0.9' cx='420' cy='340'/%3E%3Ccircle r='1.4' cx='460' cy='290'/%3E%3Ccircle r='0.5' cx='520' cy='320'/%3E%3Ccircle r='1.1' cx='580' cy='270'/%3E%3Ccircle r='0.7' cx='610' cy='310'/%3E%3Ccircle r='1.3' cx='650' cy='340'/%3E%3Ccircle r='0.8' cx='720' cy='290'/%3E%3Ccircle r='1.2' cx='750' cy='330'/%3E%3Ccircle r='0.6' cx='50' cy='420'/%3E%3Ccircle r='1.4' cx='110' cy='370'/%3E%3Ccircle r='0.7' cx='160' cy='410'/%3E%3Ccircle r='1.2' cx='200' cy='380'/%3E%3Ccircle r='0.8' cx='240' cy='440'/%3E%3Ccircle r='1.3' cx='290' cy='380'/%3E%3Ccircle r='0.5' cx='340' cy='420'/%3E%3Ccircle r='1.1' cx='380' cy='370'/%3E%3Ccircle r='0.6' cx='430' cy='430'/%3E%3Ccircle r='1.4' cx='480' cy='380'/%3E%3Ccircle r='0.7' cx='530' cy='410'/%3E%3Ccircle r='1.3' cx='570' cy='390'/%3E%3Ccircle r='0.8' cx='630' cy='420'/%3E%3Ccircle r='1.5' cx='670' cy='380'/%3E%3Ccircle r='0.7' cx='720' cy='410'/%3E%3Ccircle r='1.1' cx='760' cy='370'/%3E%3Ccircle r='0.8' cx='50' cy='490'/%3E%3Ccircle r='1.3' cx='100' cy='460'/%3E%3Ccircle r='0.6' cx='148' cy='510'/%3E%3Ccircle r='1.2' cx='192' cy='470'/%3E%3Ccircle r='0.9' cx='246' cy='500'/%3E%3Ccircle r='1.4' cx='290' cy='460'/%3E%3Ccircle r='0.7' cx='340' cy='510'/%3E%3Ccircle r='1.3' cx='390' cy='480'/%3E%3Ccircle r='0.5' cx='420' cy='520'/%3E%3Ccircle r='1.1' cx='470' cy='470'/%3E%3Ccircle r='0.8' cx='520' cy='510'/%3E%3Ccircle r='1.2' cx='580' cy='490'/%3E%3Ccircle r='0.9' cx='610' cy='530'/%3E%3Ccircle r='1.4' cx='650' cy='490'/%3E%3Ccircle r='0.7' cx='700' cy='530'/%3E%3Ccircle r='1.2' cx='750' cy='490'/%3E%3Ccircle r='0.6' cx='70' cy='580'/%3E%3Ccircle r='1.4' cx='120' cy='550'/%3E%3Ccircle r='0.8' cx='170' cy='590'/%3E%3Ccircle r='1.3' cx='220' cy='560'/%3E%3Ccircle r='0.5' cx='270' cy='610'/%3E%3Ccircle r='1.1' cx='320' cy='580'/%3E%3Ccircle r='0.6' cx='370' cy='620'/%3E%3Ccircle r='1.2' cx='420' cy='580'/%3E%3Ccircle r='0.9' cx='470' cy='610'/%3E%3Ccircle r='1.4' cx='520' cy='570'/%3E%3Ccircle r='0.7' cx='570' cy='610'/%3E%3Ccircle r='1.3' cx='620' cy='580'/%3E%3Ccircle r='0.5' cx='670' cy='610'/%3E%3Ccircle r='1.1' cx='710' cy='570'/%3E%3Ccircle r='0.8' cx='750' cy='600'/%3E%3Ccircle r='1.3' cx='30' cy='650'/%3E%3Ccircle r='0.6' cx='90' cy='620'/%3E%3Ccircle r='1.2' cx='140' cy='670'/%3E%3Ccircle r='0.9' cx='190' cy='630'/%3E%3Ccircle r='1.4' cx='240' cy='670'/%3E%3Ccircle r='0.7' cx='290' cy='640'/%3E%3Ccircle r='1.3' cx='350' cy='670'/%3E%3Ccircle r='0.5' cx='390' cy='630'/%3E%3Ccircle r='1.1' cx='440' cy='670'/%3E%3Ccircle r='0.8' cx='490' cy='630'/%3E%3Ccircle r='1.2' cx='550' cy='670'/%3E%3Ccircle r='0.6' cx='600' cy='640'/%3E%3Ccircle r='1.3' cx='650' cy='670'/%3E%3Ccircle r='0.7' cx='700' cy='640'/%3E%3Ccircle r='1.1' cx='750' cy='670'/%3E%3Ccircle r='0.8' cx='50' cy='720'/%3E%3Ccircle r='1.2' cx='90' cy='740'/%3E%3Ccircle r='0.9' cx='140' cy='710'/%3E%3Ccircle r='1.4' cx='190' cy='750'/%3E%3Ccircle r='0.6' cx='240' cy='720'/%3E%3Ccircle r='1.2' cx='290' cy='750'/%3E%3Ccircle r='0.8' cx='350' cy='710'/%3E%3Ccircle r='1.3' cx='400' cy='750'/%3E%3Ccircle r='0.5' cx='450' cy='720'/%3E%3Ccircle r='1.1' cx='500' cy='740'/%3E%3Ccircle r='0.7' cx='550' cy='710'/%3E%3Ccircle r='1.4' cx='600' cy='750'/%3E%3Ccircle r='0.6' cx='650' cy='730'/%3E%3Ccircle r='1.2' cx='700' cy='710'/%3E%3Ccircle r='0.9' cx='750' cy='750'/%3E%3C/g%3E%3Cg fill='white' fill-opacity='0.15'%3E%3Ccircle r='2' cx='32' cy='52'/%3E%3Ccircle r='1' cx='76' cy='29'/%3E%3Ccircle r='2.4' cx='102' cy='97'/%3E%3Ccircle r='1.4' cx='143' cy='152'/%3E%3Ccircle r='2.2' cx='186' cy='61'/%3E%3Ccircle r='0.8' cx='241' cy='98'/%3E%3Ccircle r='3' cx='126' cy='205'/%3E%3Ccircle r='1.6' cx='220' cy='211'/%3E%3Ccircle r='2.6' cx='310' cy='40'/%3E%3Ccircle r='1.2' cx='376' cy='87'/%3E%3Ccircle r='2.4' cx='400' cy='180'/%3E%3Ccircle r='1.8' cx='466' cy='158'/%3E%3Ccircle r='2.8' cx='355' cy='220'/%3E%3Ccircle r='1.4' cx='523' cy='41'/%3E%3Ccircle r='2.4' cx='574' cy='95'/%3E%3Ccircle r='1.6' cx='629' cy='163'/%3E%3Ccircle r='2.6' cx='590' cy='219'/%3E%3C/g%3E%3C/svg%3E");
  background-position: 0 0;
  background-size: 100% 100%;
  opacity: 0.9;
  z-index: -1;
  transform-style: preserve-3d;
  transform: translateZ(-50px);
  animation: starfieldMove 60s linear infinite alternate;
  pointer-events: none;
}

/* Use the same simple gradient for mobile */
.compact-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(15, 185, 253, 0.15), transparent 70%),
              radial-gradient(circle at 80% 20%, rgba(103, 58, 183, 0.1), transparent 50%);
  opacity: 0.8;
  z-index: 0;
  pointer-events: none;
}

/* Remove the starfield animation for performance */
@keyframes starfieldMove {
  /* Animation removed for performance */
}

.logo-area {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.hero-logo {
  width: 120px;
  height: auto;
  filter: drop-shadow(0 0 15px var(--cosmic-blue-glow));
  animation: pulseLogo 3s infinite alternate var(--cosmic-transition-smooth);
}

.desktop-hero-section .title-area {
  text-align: center;
  margin-bottom: 2rem;
}

.cosmic-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-text);
  animation: titleFloat 4s ease-in-out infinite alternate;
}

.cosmic-subtitle {
  font-size: 1rem;
  color: var(--cosmic-text-secondary);
  max-width: 280px;
  margin: 0 auto;
  animation: subtitleFloat 4s ease-in-out infinite alternate;
  animation-delay: 0.5s;
}

/* Current Quarter Button */
.current-quarter-btn {
  position: relative;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-blue);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--cosmic-transition-fast);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.current-quarter-btn:hover {
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-glow-blue-md);
}

.current-quarter-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    var(--cosmic-blue-translucent-faint) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: opacity var(--cosmic-transition-fast);
}

.current-quarter-btn:hover::before {
  opacity: 1;
}

.btn-text, .btn-icon {
  position: relative;
  z-index: 1;
}

.btn-icon {
  font-size: 1.2rem;
  transition: transform var(--cosmic-transition-fast);
}

.current-quarter-btn:hover .btn-icon {
  transform: translateX(3px);
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background-color: var(--cosmic-blue);
  border-radius: 50%;
  box-shadow: 0 0 0 0 var(--cosmic-blue-translucent);
  animation: pulseCTA 2s infinite;
}

/* Compact Hero for Mobile */
.compact-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  margin-bottom: 1rem;
  background: var(--cosmic-glass-bg-faint);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-md);
  overflow: hidden;
}

.compact-hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 1;
}

.compact-hero-logo {
  width: 40px;
  height: auto;
  filter: drop-shadow(0 0 10px var(--cosmic-blue-glow));
}

.compact-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-text);
}

.compact-subtitle {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
}

.compact-quarter-btn {
  position: relative;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-blue);
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--cosmic-transition-fast);
  box-shadow: var(--cosmic-glow-blue-sm);
  font-size: 0.8rem;
}

.compact-quarter-btn:hover {
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-md);
}

/* Search Container */
.search-container {
  margin-bottom: 1rem;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cosmic-text-secondary);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  font-size: 0.9rem;
  transition: all var(--cosmic-transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--cosmic-blue);
  background: var(--cosmic-glass-bg-lighter);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.search-input::placeholder {
  color: var(--cosmic-text-disabled);
}

/* Quarter Styling */
.quarter {
  margin-bottom: 1rem;
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
  transition: all var(--cosmic-transition-medium);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-sm);
}

.quarter:hover {
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-2px);
}

.quarter.active {
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
}

.quarter-header {
  padding: 1.25rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all var(--cosmic-transition-fast);
}

.quarter-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--cosmic-blue-translucent-faint) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--cosmic-transition-fast);
  z-index: 0;
  pointer-events: none;
}

.quarter-header:hover::before {
  opacity: 1;
}

.header-content {
  position: relative;
  z-index: 1;
}

.title-with-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.title-with-status h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.quarter.current-quarter .title-with-status h2 {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-text);
}

.description {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.75rem;
}

/* Status Indicators */
.status-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.task-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  background: var(--cosmic-glass-bg-darker);
}

.task-status.completed {
  background: var(--cosmic-success-translucent);
  color: var(--cosmic-success);
}

.task-status.in-progress {
  background: var(--cosmic-blue-translucent-faint);
  color: var(--cosmic-blue);
}

.task-status.to-do {
  background: var(--cosmic-orange-translucent-faint);
  color: var(--cosmic-orange);
}

.progress-text {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-container {
  width: 100px;
  height: 6px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-pill);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--cosmic-blue);
  border-radius: var(--cosmic-radius-pill);
  transition: width var(--cosmic-transition-medium);
}

/* Toggle Icon */
.toggle-icon {
  position: relative;
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: transform var(--cosmic-transition-fast);
}

.toggle-icon.is-open {
  transform: rotate(180deg);
}

.icon-line {
  position: absolute;
  background-color: var(--cosmic-blue);
  transition: all var(--cosmic-transition-fast);
}

.icon-line.horizontal {
  width: 100%;
  height: 2px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.icon-line.vertical {
  width: 2px;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

.icon-line.vertical.hidden {
  height: 0;
}

/* Status Icon */
.status-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--cosmic-text-disabled);
  position: relative;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.status-icon.completed {
  border-color: var(--cosmic-success);
  background-color: var(--cosmic-success-translucent);
}

.status-icon.completed::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: var(--cosmic-success);
  border-radius: 50%;
}

.status-icon.in-progress {
  border-color: var(--cosmic-blue);
  background-color: var(--cosmic-blue-translucent-faint);
}

.status-icon.in-progress::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: var(--cosmic-blue);
  border-radius: 50%;
  opacity: 0.5;
}

.status-icon.to-do {
  border-color: var(--cosmic-orange);
  background-color: transparent;
}

/* Milestone Styling */
.milestone {
  margin: 0.5rem 1rem 1rem;
  border-radius: var(--cosmic-radius-md);
  overflow: hidden;
  transition: all var(--cosmic-transition-medium);
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border);
}

.milestone:hover {
  box-shadow: var(--cosmic-shadow-sm);
}

.milestone.active {
  background: var(--cosmic-glass-bg);
  border-color: var(--cosmic-blue-translucent);
}

.milestone-header {
  padding: 1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.milestone-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--cosmic-blue-translucent-faint) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--cosmic-transition-fast);
  z-index: 0;
  pointer-events: none;
}

.milestone-header:hover::before {
  opacity: 1;
}

.milestone .title-with-status h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Task Styling */
.task {
  margin: 0.5rem 1rem 0.75rem;
  border-radius: var(--cosmic-radius-md);
  overflow: hidden;
  transition: all var(--cosmic-transition-medium);
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border);
}

.task:hover {
  box-shadow: var(--cosmic-shadow-sm);
}

.task-header {
  padding: 0.75rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.task-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--cosmic-blue-translucent-faint) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--cosmic-transition-fast);
  z-index: 0;
  pointer-events: none;
}

.task-header:hover::before {
  opacity: 1;
}

.task .title-with-status h4 {
  font-size: 1rem;
  font-weight: 500;
}

/* Task Tags */
.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.task-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  background: var(--cosmic-glass-bg);
  border: 1px solid var(--cosmic-blue-translucent);
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.task-tag:hover {
  background: var(--cosmic-glass-bg-lighter);
  color: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
}

/* Subtask Styling */
.subtask {
  padding: 0.75rem;
  margin: 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  background: var(--cosmic-glass-bg);
  transition: all var(--cosmic-transition-fast);
}

.subtask:hover {
  background: var(--cosmic-glass-bg-lighter);
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-container input[type="checkbox"] {
  display: none;
}

.checkbox-container label {
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: color var(--cosmic-transition-fast);
}

.subtask.completed label {
  text-decoration: line-through;
  color: var(--cosmic-text-disabled);
}

.subtask-status {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  background: var(--cosmic-orange-translucent-faint);
  color: var(--cosmic-orange);
}

.subtask-status.completed {
  background: var(--cosmic-success-translucent);
  color: var(--cosmic-success);
}

.subtask-description {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
  margin-left: 1.5rem;
}

.subtask-status-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Styles */
@media (max-width: 1023px) {
  .roadmap-page-content {
    padding: 1rem;
  }
  
  .desktop-hero-section {
    display: none;
  }
  
  .compact-hero {
    display: flex;
  }
  
  .compact-hero-content {
    flex-wrap: wrap;
  }
  
  .compact-hero-center {
    flex: 1;
    min-width: 0;
    padding: 0 0.5rem;
  }
  
  .compact-title {
    font-size: 1.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .compact-subtitle {
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 640px) {
  .roadmap-page-content {
    padding: 0.5rem;
  }
  
  .compact-hero {
    padding: 0.75rem;
  }
  
  .compact-hero-logo {
    width: 32px;
  }
  
  .compact-title {
    font-size: 1rem;
  }
  
  .compact-subtitle {
    font-size: 0.7rem;
  }
  
  .compact-quarter-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .quarter-header {
    padding: 1rem;
  }
  
  .title-with-status h2 {
    font-size: 1.1rem;
  }
  
  .description {
    font-size: 0.8rem;
  }
  
  .progress-container {
    width: 60px;
  }
  
  .milestone {
    margin: 0.5rem 0.75rem 0.75rem;
  }
  
  .task {
    margin: 0.5rem 0.75rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .roadmap-page-content {
    padding: 0.25rem;
  }
  
  .compact-hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .compact-hero-right {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  
  .search-input {
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    font-size: 0.8rem;
  }
  
  .quarter-header {
    padding: 0.75rem;
  }
  
  .status-indicators {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .progress-wrapper {
    width: 100%;
    justify-content: space-between;
  }
  
  .progress-container {
    width: calc(100% - 30px);
  }
}
</style>