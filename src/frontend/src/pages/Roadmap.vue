<template>
  <div class="roadmap-page">
    <!-- Simplified background - just one element instead of many -->
    <div class="cosmic-background"></div>
    
    <div ref="roadmapRef" class="roadmap-container">
      <!-- Desktop Hero Section -->
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
      
      <!-- Main Content Wrapper -->
      <div class="main-content-wrapper">
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
  position: fixed;
  left: 2rem;
  top: calc(var(--header-height) + var(--page-padding));
  overflow: hidden;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(7, 20, 42, 0.85), rgba(25, 57, 105, 0.6));
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(15, 185, 253, 0.1),
    inset 0 0 40px rgba(15, 185, 253, 0.05);
}

@media (min-width: 1024px) {
  .desktop-hero-section {
    display: flex;
    align-items: center;
    justify-content: center;
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
  opacity: 1;
  z-index: 0;
  transition: opacity 0.5s var(--animation-smooth);
}

.desktop-hero-section::after {
  content: '';
  position: absolute;
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
  opacity: 0.3;
  z-index: 0;
}

/* Add star field to desktop hero */
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
  transform-style: preserve-3d;
  perspective: 800px;
  text-align: center;
}

/* Star animation for hero background */
.desktop-hero-content::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: -100px;
  background-image: radial-gradient(2px 2px at calc(var(--x, 10) * 1%), calc(var(--y, 10) * 1%), white, transparent),
                    radial-gradient(2px 2px at calc(var(--x, 30) * 2%), calc(var(--y, 30) * 3%), white, transparent),
                    radial-gradient(2px 2px at calc(var(--x, 50) * 3%), calc(var(--y, 50) * 5%), white, transparent),
                    radial-gradient(2px 2px at calc(var(--x, 70) * 4%), calc(var(--y, 70) * 7%), white, transparent),
                    radial-gradient(2px 2px at calc(var(--x, 90) * 5%), calc(var(--y, 90) * 9%), white, transparent);
  opacity: 0.3;
  z-index: -1;
  transform-style: preserve-3d;
  transform: translateZ(-50px);
  animation: twinkling 8s ease-in-out infinite alternate;
}

.logo-area {
  text-align: center;
  position: relative;
  margin-bottom: 1.5rem;
}

.hero-logo {
  max-width: 8rem;
  height: auto;
  filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.6));
  animation: pulseLogo 6s ease-in-out infinite alternate;

}

.desktop-hero-section .title-area {
  text-align: center;
  margin-bottom: 2rem;

}

.desktop-hero-section .cosmic-title {
  font-size: 2.5rem;
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
  animation: titleFloat 5s ease-in-out infinite alternate;
}

.desktop-hero-section .cosmic-subtitle {
  color: var(--cosmic-text-secondary);
  font-size: 1.2rem;
  margin: 0;
  line-height: 1.2;
  max-width: 90%;
  margin: 0 auto;
  animation: subtitleFloat 5s ease-in-out infinite alternate;
  animation-delay: 0.2s;
}

/* Add Current Quarter Button */
.desktop-hero-content .hero-actions {
  text-align: center;

  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
  animation-delay: 0.6s;
  transform: translateZ(10px);
}

.desktop-hero-content .current-quarter-btn {
  position: relative;
  padding: 1rem 2rem;
  border-radius: 1rem;
  border: none;
  background: linear-gradient(to right, #0fb9fd, #673ab7);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s var(--animation-bounce);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2), 
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  letter-spacing: 0.02em;
}

/* Container for the roadmap */
.roadmap-container {
  display: flex;
  width: 100%;
  max-width: 1400px;
  min-height: calc(100vh - var(--header-height) - var(--page-padding) * 2);
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Main Content Wrapper */
.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  min-height: calc(100vh - var(--header-height) - var(--page-padding) * 2);
  max-width: 1200px; /* Added max-width for better readability on very wide screens */
}

@media (min-width: 1024px) {
  .main-content-wrapper {
    margin-left: calc(33.333% + 2rem);
    width: calc(66.667% - 2rem); /* Set explicit width for desktop */
    max-height: calc(100vh - var(--header-height) - var(--page-padding) * 2); /* Constrain height on desktop */
    overflow: hidden; /* Hide overflow at wrapper level */
  }
  
  .hero-section {
    display: none;
  }
}

/* Roadmap Header Section */
.roadmap-header-section {
  padding-bottom: 1rem;
}

/* Mobile Hero Section */
.hero-section {
  margin-bottom: 1rem;
}

.hero-section .cosmic-title {
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
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
}

.hero-section .cosmic-subtitle {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Search Section */
.search-container {
  width: 100%;
  margin-top: 1rem;
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
  transition: all 0.3s var(--animation-smooth);
  font-size: 1rem;
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
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(20, 24, 41, 0.316);
  border: var(--cosmic-glass-border-blue);
  scroll-behavior: smooth;
  scrollbar-color: var(--cosmic-blue) var(--cosmic-glass-bg);
  box-shadow: var(--cosmic-shadow-md);
  
  /* Mobile constraints */
  max-height: calc(100vh - var(--header-height) - var(--page-padding) * 2 - 200px); /* Account for compact hero and search */
  height: calc(100vh - var(--header-height) - var(--page-padding) * 2 - 200px);
  margin-right: 0.25rem; /* Small margin for scrollbar */
}

/* Enhanced scrollbar styling for all devices */
.scrollable-content::-webkit-scrollbar {
  width: 8px; /* Slimmer on mobile, wider on desktop */
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--cosmic-glass-bg);
  border-radius: 6px;
  margin: 0.5rem 0; /* Add some margin to top and bottom */
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, var(--cosmic-blue), var(--cosmic-purple));
  border-radius: 6px;
  border: 2px solid rgba(20, 24, 41, 0.5); /* Border around the thumb */
  opacity: 0.8;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, var(--cosmic-blue-light), var(--cosmic-purple-light));
  opacity: 1;
}

/* Desktop specific overrides */
@media (min-width: 1024px) {
  .scrollable-content {
    height: calc(100vh - var(--header-height) - var(--page-padding) * 2 - 100px); /* Explicit height for desktop */
    max-height: calc(100vh - var(--header-height) - var(--page-padding) * 2 - 100px);
    margin-right: 0.5rem; /* More margin for scrollbar on desktop */
  }
  
  .scrollable-content::-webkit-scrollbar {
    width: 10px; /* Larger scrollbar on desktop */
  }
}

/* Quarters Container */
.quarters-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1rem;
}

.quarter {
  background: var(--cosmic-glass-bg);
  border-top-left-radius: 0.0rem; /* No rounding for top-left corner */
  border-top-right-radius: .5rem; /* 1.0rem rounding for top-right corner */
  border-bottom-left-radius: 0rem; /* 0.5rem rounding for bottom-left corner */
  border-bottom-right-radius: .5rem;
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
  position: relative;
  padding: 1rem;
  padding-right: 8rem; /* Increased space for status indicators */
  min-height: 4rem; /* Ensure minimum height for proper alignment */
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
    var(--cosmic-glass-bg-darker) 0%,
    var(--cosmic-glass-bg) 100%
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
  position: relative;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
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
  position: relative;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
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

/* Empty progress bar styling */
.progress-bar[style*="width: 0%"] {
  background: rgba(87, 119, 235, 0.1) !important;
  box-shadow: none !important;
}

/* Enhanced status styles */
.task-status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  flex-wrap: nowrap;
}

.task-status {
  font-size: 0.6875rem;
  padding: 0.2rem 0.6rem;
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

.task-status.to-do, .task-status.pending {
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

/* Progress text styling */
.task-status-wrapper .progress-text {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cosmic-text-secondary);
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

/* Mobile adjustments for status tags and progress text */
@media (max-width: 768px) {
  .cosmic-title {
    margin-top: -1.25rem;
    font-size: 1.75rem;
  }
  
  .cosmic-subtitle {
    font-size: 1.24rem;
  }
  
  .search-input {
    font-size: 1rem;
  }
  
  .description {
    font-size: 1rem; /* Increased from 0.55rem for better readability */
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .subtask-description {
    font-size: 0.95rem; /* Increased for better readability */
    line-height: 1.4;
  }

  .hero-section {
    display: block;
    margin-top: 1rem; /* Add margin to hero section on mobile */
  }
  
  .quarter-header,
  .milestone-header,
  .task-header {
    position: relative;
    padding: 1rem;
    padding-right: 6rem; /* Space for status tags on right */
    padding-bottom: 3.5rem; /* Space for progress bar and toggle at bottom */
    min-height: auto;
  }
  
  .header-content {
    width: 100%;
    margin-right: 0;
    padding-right: 0;
  }
  
  /* Position elements for mobile */
  .status-indicators {
    position: static; /* Reset absolute positioning */
  }
  
  /* Place tag and completion counter at top right */
  .task-status-wrapper {
    position: absolute;
    top: 1rem;
    right: 1rem;
    gap: 0.4rem;
    z-index: 10;
  }
  
  /* Place progress bar and toggle at bottom */
  .progress-wrapper {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    flex-direction: row; /* Ensure row direction on mobile too */
    justify-content: space-between;
    width: calc(100% - 2rem);
    align-items: center;
  }
  
  .progress-container {
    width: calc(100% - 2.5rem); /* Full width minus toggle icon space */
    height: 4px;
  }
  
  .task-status {
    font-size: 0.85rem; /* Increased from 0.65rem */
    padding: 0.2rem 0.45rem; /* Slightly more padding */
  }
  
  .task-status-wrapper .progress-text {
    font-size: 0.85rem; /* Increased from 0.65rem */
    font-weight: 600;
  }
  
  /* Make headers more readable on mobile */
  .header-content h2 {
    font-size: 1.5rem;
    margin-bottom: 0.35rem;
  }
  
  .header-content h3 {
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
  }
  
  .header-content h4 {
    font-size: 1.2rem;
    margin-bottom: 0.35rem;
  }
  
  .toggle-icon {
    width: 0.9rem;
    height: 0.9rem;
    padding: 0.2rem;
  }
  
  .toggle-icon.small {
    width: 0.7rem;
    height: 0.7rem;
    padding: 0.15rem;
  }
  
  .horizontal {
    height: 1.5px;
  }
  
  .vertical {
    width: 1.5px;
  }
  
  /* Adjust task tags to fit better in mobile view */
  .task-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
  }
  
  /* Add hover effects for icons */
  .quarter:hover .icon-line {
    background-color: rgb(0, 195, 255);
  }

  .milestone:hover .icon-line {
    background-color: rgb(255, 166, 0);
  }

  .task:hover .icon-line {
    background-color: rgb(0, 208, 255);
  }

  .roadmap-container {
    flex-direction: column; /* Stack elements on mobile */
  }

  .main-content-wrapper {
    width: 100%;
    min-height: unset; /* Remove min-height constraint on mobile */
  }

  .scrollable-content {
    height: calc(100vh - var(--header-height) - var(--page-padding) * 2 - 150px); /* Adjust height for mobile */
  }
}

/* Header content */
.header-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 8rem; /* Increased space for indicators */
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

/* Status indicators positioning and alignment */
.status-indicators {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  transform-style: preserve-3d;
}

/* Task status and progress text side by side */
.task-status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
  flex-wrap: nowrap;
}

/* Progress wrapper with progress bar and toggle icon */
.progress-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  transform-style: preserve-3d;
}

/* Progress bar styling */
.progress-container {
  width: 80px; /* Reduced from 100px to make it smaller */
  height: 6px;
  background: rgba(13, 20, 33, 0.5);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(87, 119, 235, 0.3);
}

.progress-bar {
  height: 100%;
  width: 0%; /* Default width, will be overridden by inline style */
  border-radius: 3px;
  position: relative;
  transition: width 0.5s cubic-bezier(0.12, 0.8, 0.32, 1);
}

/* Toggle icon styling */
.toggle-icon {
  position: relative;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  margin-left: 0.5rem;
  background: rgba(30, 40, 60, 0.5);
  border-radius: 2px;
  padding: 0.25rem;
}

.toggle-icon.small {
  width: 0.8rem;
  height: 0.8rem;
  padding: 0.2rem;
}

.icon-line {
  position: absolute;
  background-color: var(--cosmic-text-secondary);
  transition: all 0.3s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
}

.horizontal {
  top: 50%;
  left: 15%;
  right: 15%;
  height: 2px;
  transform: translateY(-50%);
}

.vertical {
  left: 50%;
  top: 15%;
  bottom: 15%;
  width: 2px;
  transform: translateX(-50%);
}

.vertical.hidden {
  transform: translateX(-50%) scaleY(0);
}

.toggle-icon:hover .icon-line {
  background-color: rgb(0, 191, 255);
}

.quarter-header .toggle-icon.is-open .horizontal,
.milestone-header .toggle-icon.is-open .horizontal,
.task-header .toggle-icon.is-open .horizontal {
  transform: translateY(-50%) rotate(180deg);
}

/* Toggle icon colors */
.toggle-icon .icon-line {
  background-color: var(--cosmic-text-secondary);
}

.quarter-header .toggle-icon.is-open .horizontal {
  background-color: var(--cosmic-blue);
}

.milestone-header .toggle-icon.is-open .horizontal {
  background-color: var(--cosmic-purple);
}

.task-header .toggle-icon.is-open .horizontal {
  background-color: var(--cosmic-pink);
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

/* Toggle icon styling */
.toggle-icon {
  position: relative;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  margin-left: 0.5rem;
  background: rgba(30, 40, 60, 0.5);
  border-radius: 2px;
  padding: 0.25rem;
}

.toggle-icon.small {
  width: 0.8rem;
  height: 0.8rem;
  padding: 0.2rem;
}

.icon-line {
  position: absolute;
  background-color: var(--cosmic-text-secondary);
  transition: all 0.3s var(--animation-bounce);
  box-shadow: var(--cosmic-shadow-sm);
}

.horizontal {
  top: 50%;
  left: 15%;
  right: 15%;
  height: 2px;
  transform: translateY(-50%);
}

.vertical {
  left: 50%;
  top: 15%;
  bottom: 15%;
  width: 2px;
  transform: translateX(-50%);
}

.vertical.hidden {
  transform: translateX(-50%) scaleY(0);
}

.toggle-icon:hover .icon-line {
  background-color: rgb(0, 191, 255);
}

.quarter-header .toggle-icon.is-open .horizontal,
.milestone-header .toggle-icon.is-open .horizontal,
.task-header .toggle-icon.is-open .horizontal {
  transform: translateY(-50%) rotate(180deg);
}

/* Toggle icon colors */
.toggle-icon .icon-line {
  background-color: var(--cosmic-text-secondary);
}

.quarter-header .toggle-icon.is-open .horizontal {
  background-color: var(--cosmic-blue);
}

.milestone-header .toggle-icon.is-open .horizontal {
  background-color: var(--cosmic-purple);
}

.task-header .toggle-icon.is-open .horizontal {
  background-color: var(--cosmic-pink);
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

/* Status indicators and progress styling */
.status-indicators {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  position: absolute;
  top: 0.75rem;
  right: 1rem;
}

/* Progress wrapper with progress bar and toggle icon */
.progress-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cosmic-text-secondary);
  margin-right: 0.5rem;
}

.progress-container {
  width: 80px;
  height: 6px;
  background: rgba(13, 20, 33, 0.5);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(87, 119, 235, 0.3);
}

.progress-bar {
  height: 100%;
  width: 0%;
  border-radius: 3px;
  position: relative;
  transition: width 0.5s cubic-bezier(0.12, 0.8, 0.32, 1);
}

/* Task status wrapper */
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

/* Toggle icon styling */
.toggle-icon {
  position: relative;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  transition: all 0.2s var(--animation-bounce);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 40, 60, 0.5);
  border-radius: 3px;
  padding: 0.2rem;
  margin-left: 0.25rem;
}

.toggle-icon.small {
  width: 0.8rem;
  height: 0.8rem;
  padding: 0.15rem;
}

.icon-line {
  position: absolute;
  background: var(--cosmic-text-secondary);
  transition: all 0.3s var(--animation-bounce);
}

.horizontal {
  top: 50%;
  left: 15%;
  right: 15%;
  height: 2px;
  transform: translateY(-50%);
}

.vertical {
  left: 50%;
  top: 15%;
  bottom: 15%;
  width: 2px;
  transform: translateX(-50%);
}

.vertical.hidden {
  transform: translateX(-50%) scaleY(0);
}

.toggle-icon:hover .icon-line {
  background: var(--cosmic-blue);
}

.toggle-icon.is-open .horizontal {
  transform: translateY(-50%) rotate(180deg);
}

/* Quarter headers */
.quarter-header {
  position: relative;
  padding: 1rem;
  cursor: pointer;
  display: flex;
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

/* Header content */
.header-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-right: 8rem; /* Space for status indicators */
  transform-style: preserve-3d;
}

/* Title with status */
.title-with-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

/* Status icon */
.status-icon {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s var(--animation-bounce), box-shadow 0.3s var(--animation-smooth);
}

.status-icon:hover {
  transform: scale(1.15);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* Completed status icon */
.status-icon.completed {
  background: linear-gradient(135deg, #25a18e, #00e676);
  box-shadow: 0 0 8px rgba(37, 161, 142, 0.4);
}

.status-icon.completed::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 12 10 16 18 8'%3E%3C/polyline%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 70%;
}

/* In Progress status icon with animation */
.status-icon.in-progress {
  background: linear-gradient(135deg, #1565c0, #42a5f5);
  box-shadow: 0 0 8px rgba(21, 101, 192, 0.4);
  position: relative;
  overflow: hidden;
}

.status-icon.in-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    rgba(255, 255, 255, 0) 100%
  );
  animation: progressShimmer 2s infinite;
}

@keyframes progressShimmer {
  0% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.status-icon.in-progress::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'%3E%3C/polyline%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 70%;
}

/* ToDo status icon */
.status-icon.future,
.status-icon.pending,
.status-icon.todo,
.status-icon.to-do {
  background: linear-gradient(135deg, #ff9800, #ffb74d);
  box-shadow: 0 0 8px rgba(255, 152, 0, 0.4);
}

.status-icon.future::after,
.status-icon.pending::after,
.status-icon.todo::after,
.status-icon.to-do::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='6' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='12' x2='16' y2='12'%3E%3C/line%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 70%;
}

@keyframes pulseIndicator {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

/* Enhanced Mobile Hero Section */
.hero-section {
  display: none; /* Hide the old hero section */
}

/* New Compact Hero Section for Mobile */
.compact-hero {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(7, 20, 42, 0.8), rgba(25, 57, 105, 0.5));
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-shadow-md);
  transform-style: preserve-3d;
  perspective: 800px;
}

/* Star animation for mobile hero background */
.compact-hero::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background-image: radial-gradient(2px 2px at calc(var(--x, 10) * 1%), calc(var(--y, 10) * 1%), white, transparent),
                    radial-gradient(2px 2px at calc(var(--x, 30) * 2%), calc(var(--y, 30) * 3%), white, transparent),
                    radial-gradient(2px 2px at calc(var(--x, 50) * 3%), calc(var(--y, 50) * 5%), white, transparent);
  opacity: 0.3;
  z-index: 0;
  transform-style: preserve-3d;
  transform: translateZ(-50px);
  animation: twinkling 8s ease-in-out infinite alternate;
}

.compact-hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.75rem;
}

.compact-hero-left {
  display: flex;
  justify-content: center;
  align-items: center;
}

.compact-hero-logo {
  width: 2.5rem;
  height: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.6));
  animation: pulseLogo 6s ease-in-out infinite alternate;
}

.compact-hero-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.compact-title {
  font-size: 1.25rem;
  margin: 0 0 0.25rem 0;
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
  animation: titleFloat 5s ease-in-out infinite alternate;
}

.compact-subtitle {
  color: var(--cosmic-text-secondary);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.2;
  animation: subtitleFloat 5s ease-in-out infinite alternate;
  animation-delay: 0.2s;
}

.compact-hero-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* Compact quarter button */
.compact-quarter-btn {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: linear-gradient(to right, #0fb9fd, #673ab7);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s var(--animation-bounce);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.compact-quarter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.compact-quarter-btn:active {
  transform: translateY(0);
}

.compact-quarter-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #673ab7, #0fb9fd);
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
}

.compact-quarter-btn:hover::before {
  opacity: 1;
}

.compact-quarter-btn .btn-icon {
  position: relative;
  z-index: 1;
  font-size: 1.2rem;
  transition: transform 0.3s var(--animation-bounce);
}

.compact-quarter-btn:hover .btn-icon {
  transform: translateX(3px);
}

.compact-quarter-btn .pulse-ring {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  animation: pulseCTA 2s infinite;
}

@media (min-width: 1024px) {
  .compact-hero {
    display: none; /* Hide in desktop view */
  }
}

/* Search Section */
.search-container {
  width: 100%;
  margin-top: 1rem;
}

@keyframes rotateGradient {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Add hover effects for the desktop button */
.desktop-hero-content .current-quarter-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.desktop-hero-content .current-quarter-btn:active {
  transform: translateY(-1px);
}

.desktop-hero-content .current-quarter-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, #673ab7, #0fb9fd);
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  z-index: 0;
}

.desktop-hero-content .current-quarter-btn:hover::before {
  opacity: 1;
}

.desktop-hero-content .btn-text,
.desktop-hero-content .btn-icon {
  position: relative;
  z-index: 1;
}

.desktop-hero-content .btn-icon {
  transition: transform 0.3s var(--animation-bounce);
}

.desktop-hero-content .current-quarter-btn:hover .btn-icon {
  transform: translateX(5px);
}

.desktop-hero-content .pulse-ring {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 4rem;
  animation: pulseCTA 2s infinite;
}

/* Restore cosmic title line */
.desktop-hero-section .cosmic-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--cosmic-blue),
    var(--cosmic-purple),
    transparent
  );
  opacity: 0.35;
}
</style>