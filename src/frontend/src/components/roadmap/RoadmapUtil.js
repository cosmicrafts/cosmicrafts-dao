// Import Vue functions at the top
import { ref, nextTick } from 'vue';

/**
 * Utility functions for the Roadmap components
 */

/**
 * Calculates the completion percentage for a milestone
 * @param {Object} milestone - The milestone object
 * @returns {Number} - Percentage of completed tasks
 */
export const calculateMilestoneProgress = (milestone) => {
  if (!milestone.tasks || milestone.tasks.length === 0) return 0;
  
  const totalTasks = milestone.tasks.length;
  let completedTasks = 0;
  
  milestone.tasks.forEach(task => {
    // Check if task is directly marked as completed
    if (task.completed) {
      completedTasks++;
    } 
    // Or check if task has all subtasks completed
    else if (task.subtasks && task.subtasks.length > 0) {
      const allSubtasksCompleted = task.subtasks.every(subtask => subtask.completed);
      if (allSubtasksCompleted) {
        completedTasks++;
      }
    }
  });
  
  return Math.round((completedTasks / totalTasks) * 100);
};

/**
 * Calculates the completion percentage for a quarter
 * @param {Object} quarter - The quarter object
 * @returns {Number} - Percentage of completed tasks across all milestones
 */
export const calculateQuarterProgress = (quarter) => {
  if (!quarter.milestones || quarter.milestones.length === 0) return 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  quarter.milestones.forEach(milestone => {
    if (!milestone.tasks) return;
    
    totalTasks += milestone.tasks.length;
    
    milestone.tasks.forEach(task => {
      if (task.completed) {
        completedTasks++;
      } else if (task.subtasks && task.subtasks.length > 0) {
        const allSubtasksCompleted = task.subtasks.every(subtask => subtask.completed);
        if (allSubtasksCompleted) {
          completedTasks++;
        }
      }
    });
  });
  
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

/**
 * Gets overall roadmap statistics
 * @param {Array} quarters - Array of quarter objects
 * @returns {Object} - Object containing total milestones, total tasks, and overall completion percentage
 */
export const getRoadmapStats = (quarters) => {
  let totalMilestones = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  
  quarters.forEach(quarter => {
    if (!quarter.milestones) return;
    
    totalMilestones += quarter.milestones.length;
    
    quarter.milestones.forEach(milestone => {
      if (!milestone.tasks) return;
      
      totalTasks += milestone.tasks.length;
      
      milestone.tasks.forEach(task => {
        if (task.completed) {
          completedTasks++;
        } else if (task.subtasks && task.subtasks.length > 0) {
          const allSubtasksCompleted = task.subtasks.every(subtask => subtask.completed);
          if (allSubtasksCompleted) {
            completedTasks++;
          }
        }
      });
    });
  });
  
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    totalMilestones,
    totalTasks,
    completedTasks,
    completionPercentage
  };
};

/**
 * Filters roadmap data based on search query, selected year, milestone, and tags
 * @param {Array} quarters - Original quarters data
 * @param {Object} filters - Object containing filter criteria
 * @returns {Array} - Filtered quarters data
 */
export const filterRoadmapData = (quarters, filters) => {
  const { searchQuery, selectedYear, selectedMilestone, selectedTags } = filters;
  
  if (!searchQuery && !selectedYear && !selectedMilestone && (!selectedTags || selectedTags.length === 0)) {
    return quarters;
  }
  
  // Create a deep copy to avoid modifying the original data
  const filteredQuarters = JSON.parse(JSON.stringify(quarters));
  
  return filteredQuarters
    .filter(quarter => {
      // Filter by year
      if (selectedYear && !quarter.period.includes(selectedYear)) {
        return false;
      }
      
      // Filter milestones in each quarter
      if (quarter.milestones && quarter.milestones.length > 0) {
        quarter.milestones = quarter.milestones.filter(milestone => {
          // Filter by milestone title
          if (selectedMilestone && milestone.title !== selectedMilestone) {
            return false;
          }
          
          // Filter by tags
          if (selectedTags && selectedTags.length > 0) {
            if (!milestone.tags || !milestone.tags.some(tag => selectedTags.includes(tag))) {
              return false;
            }
          }
          
          // Filter by search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesMilestone = 
              milestone.title.toLowerCase().includes(query) || 
              (milestone.description && milestone.description.toLowerCase().includes(query));
            
            if (matchesMilestone) {
              return true;
            }
            
            // Filter tasks in each milestone
            if (milestone.tasks && milestone.tasks.length > 0) {
              milestone.tasks = milestone.tasks.filter(task => {
                const matchesTask = 
                  task.title.toLowerCase().includes(query) || 
                  (task.description && task.description.toLowerCase().includes(query));
                
                if (matchesTask) {
                  return true;
                }
                
                // Filter subtasks in each task
                if (task.subtasks && task.subtasks.length > 0) {
                  task.subtasks = task.subtasks.filter(subtask => 
                    subtask.title.toLowerCase().includes(query)
                  );
                  
                  return task.subtasks.length > 0;
                }
                
                return false;
              });
              
              return milestone.tasks.length > 0;
            }
            
            return false;
          }
          
          return true;
        });
        
        return quarter.milestones.length > 0;
      }
      
      return false;
    })
    // Remove empty quarters
    .filter(quarter => quarter.milestones && quarter.milestones.length > 0);
};

/**
 * Extracts all unique years from quarters data
 * @param {Array} quarters - Quarters data
 * @returns {Array} - Array of unique years
 */
export const extractYears = (quarters) => {
  const yearsSet = new Set();
  
  quarters.forEach(quarter => {
    if (quarter.period) {
      const yearMatch = quarter.period.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        yearsSet.add(yearMatch[1]);
      }
    }
  });
  
  return Array.from(yearsSet).sort();
};

/**
 * Extracts all unique milestone titles from quarters data
 * @param {Array} quarters - Quarters data
 * @returns {Array} - Array of unique milestone titles
 */
export const extractMilestoneTitles = (quarters) => {
  const titlesSet = new Set();
  
  quarters.forEach(quarter => {
    if (quarter.milestones) {
      quarter.milestones.forEach(milestone => {
        if (milestone.title) {
          titlesSet.add(milestone.title);
        }
      });
    }
  });
  
  return Array.from(titlesSet).sort();
};

/**
 * Extracts all unique tags from quarters data
 * @param {Array} quarters - Quarters data
 * @returns {Array} - Array of unique tags
 */
export const extractTags = (quarters) => {
  const tagsSet = new Set();
  
  quarters.forEach(quarter => {
    if (quarter.milestones) {
      quarter.milestones.forEach(milestone => {
        if (milestone.tags && Array.isArray(milestone.tags)) {
          milestone.tags.forEach(tag => {
            tagsSet.add(tag);
          });
        }
      });
    }
  });
  
  return Array.from(tagsSet).sort();
};

/**
 * Generates a share link for a specific milestone
 * @param {String} baseUrl - Base URL for the roadmap
 * @param {String} quarterId - Quarter ID
 * @param {String} milestoneId - Milestone ID
 * @returns {String} - Share URL
 */
export const generateShareUrl = (baseUrl, quarterId, milestoneId) => {
  return `${baseUrl}?q=${quarterId}&m=${milestoneId}`;
};

/**
 * Parses URL parameters to find targeted milestone
 * @param {String} url - Current URL
 * @returns {Object|null} - Object with quarterId and milestoneId if found
 */
export const parseShareUrl = (url) => {
  const params = new URLSearchParams(url.split('?')[1]);
  const quarterId = params.get('q');
  const milestoneId = params.get('m');
  
  if (quarterId && milestoneId) {
    return { quarterId, milestoneId };
  }
  
  return null;
};

/**
 * Tag colors mapping for consistent tag coloring
 */
export const tagColors = {
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

/**
 * Get color for a specific tag
 * @param {String} tag - Tag name
 * @returns {String} - Color code for the tag
 */
export const getTagColor = (tag) => {
  return tagColors[tag] || '#0FB9FD';
};

/**
 * Transition functions for animations
 */
export const transitionFunctions = {
  // For quarters and milestones
  beforeEnter: (el) => {
    el.style.maxHeight = '0';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-20px)';
  },
  
  enter: (el, done) => {
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
  },
  
  beforeLeave: (el) => {
    // Set the initial max-height to the current height
    el.style.maxHeight = el.scrollHeight + 'px';
    el.style.overflow = 'hidden';
  },
  
  leave: (el, done) => {
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
  },
  
  // Simpler fade transitions for subtasks
  beforeEnterFade: (el) => {
    el.style.maxHeight = '0';
    el.style.opacity = '0';
  },
  
  enterFade: (el, done) => {
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
  },
  
  beforeLeaveFade: (el) => {
    el.style.maxHeight = el.scrollHeight + 'px';
    el.style.overflow = 'hidden';
  },
  
  leaveFade: (el, done) => {
    requestAnimationFrame(() => {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
      
      el.addEventListener('transitionend', function listener() {
        el.removeEventListener('transitionend', listener);
        done();
      }, { once: true });
    });
  }
};

/**
 * Scrolls an element into view with smooth behavior
 * @param {HTMLElement} element - The element to scroll into view
 */
export const scrollToElement = (element) => {
  if (!element) return;
  
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

/**
 * Performance optimization - throttle functions that might be called frequently
 * @param {Function} fn - The function to throttle
 * @param {Number} wait - Time to wait between function calls in ms
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, wait = 100) => {
  let time = Date.now();
  return function(...args) {
    if ((time + wait - Date.now()) < 0) {
      fn(...args);
      time = Date.now();
    }
  };
};

/**
 * Checks if the user is on a mobile device
 * @returns {Boolean} - True if on mobile device
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false; // SSR check
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
    (window.innerWidth <= 768);
};

/**
 * Creates a notification system
 * @returns {Object} - Object with notifications ref and showNotification function
 */
export const createNotificationSystem = () => {
  // Using imported ref instead of require
  const notifications = ref([]);
  let notificationIdCounter = 0;
  
  /**
   * Shows a notification
   * @param {String} message - Notification message
   * @param {String} type - Notification type (info, success, error)
   * @param {Number} duration - Duration to show notification in ms
   */
  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = notificationIdCounter++;
    notifications.value.push({ id, message, type });
    
    // Auto-remove notification after duration
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id);
    }, duration);
  };
  
  return {
    notifications,
    showNotification
  };
};

/**
 * Copy a link to the clipboard with milestone information
 * @param {Object} quarter - Quarter object
 * @param {Object} milestone - Milestone object
 * @param {Number} quarterIndex - Index of the quarter
 * @param {Number} milestoneIndex - Index of the milestone
 * @param {Function} showNotification - Function to show notifications
 */
export const copyMilestoneLink = (quarter, milestone, quarterIndex, milestoneIndex, showNotification) => {
  if (typeof window === 'undefined') return; // SSR check
  
  // Build a link with fragment identifier
  const url = new URL(window.location.href);
  url.hash = `milestone-${quarterIndex}-${milestoneIndex}`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(url.toString())
    .then(() => {
      if (showNotification) {
        showNotification('Link copied to clipboard!', 'success');
      }
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
        if (successful && showNotification) {
          showNotification('Link copied to clipboard!', 'success');
        } else if (showNotification) {
          showNotification('Failed to copy link', 'error');
        }
      } catch (err) {
        if (showNotification) {
          showNotification('Failed to copy link', 'error');
        }
      }
      
      document.body.removeChild(textarea);
    });
};

/**
 * Toggle an element's open state and scroll to it when opened
 * @param {Object} element - Element to toggle
 * @param {Event} event - DOM event that triggered the toggle
 * @param {Function} scrollFn - Function to scroll to element 
 */
export const toggleElement = (element, event, scrollFn) => {
  if (!element) return;
  element.open = !element.open;
  
  // Scroll to section when opened
  if (element.open && event && scrollFn) {
    // Using imported nextTick instead of require
    nextTick(() => {
      const domElement = event.target?.closest('.quarter, .milestone, .task');
      if (domElement) {
        scrollFn(domElement);
      }
    });
  }
};

/**
 * Update task progress based on completed subtasks
 * @param {Object} task - Task to update
 */
export const updateTaskProgress = (task) => {
  if (!task.subtasks) return;
  task.completed = task.subtasks.filter(st => st.completed).length;
  task.total = task.subtasks.length;
};

/**
 * Update milestone progress based on task progress
 * @param {Object} milestone - Milestone to update
 */
export const updateMilestoneProgress = (milestone) => {
  milestone.completed = milestone.tasks.reduce((sum, task) => sum + task.completed, 0);
  milestone.total = milestone.tasks.reduce((sum, task) => sum + task.total, 0);
};

/**
 * Update quarter progress based on milestone progress
 * @param {Object} quarter - Quarter to update
 */
export const updateQuarterProgress = (quarter) => {
  quarter.completed = quarter.milestones.reduce((sum, milestone) => sum + milestone.completed, 0);
  quarter.total = quarter.milestones.reduce((sum, milestone) => sum + milestone.total, 0);
};

/**
 * Toggle subtask completion status and update progress up the chain
 * @param {Object} quarter - Parent quarter
 * @param {Object} milestone - Parent milestone
 * @param {Object} task - Parent task
 * @param {Object} subtask - Subtask to toggle
 */
export const toggleSubtask = (quarter, milestone, task, subtask) => {
  subtask.completed = !subtask.completed;
  
  // Update progress counts that cascade upward
  updateTaskProgress(task);
  updateMilestoneProgress(milestone);
  updateQuarterProgress(quarter);
};

/**
 * Extract available years from quarters data
 * @param {Array} quarters - Quarters data
 * @returns {Array} - Array of unique years
 */
export const getAvailableYears = (quarters) => {
  return [...new Set(quarters.map(q => q.period.split('-')[0]))];
};

/**
 * Extract available milestone titles from quarters data
 * @param {Array} quarters - Quarters data
 * @returns {Array} - Array of unique milestone titles
 */
export const getAvailableMilestones = (quarters) => {
  const milestones = [];
  quarters.forEach(q => {
    q.milestones.forEach(m => {
      if (!milestones.includes(m.title)) {
        milestones.push(m.title);
      }
    });
  });
  return milestones;
};

/**
 * Extract available tags from quarters data
 * @param {Array} quarters - Quarters data
 * @returns {Array} - Array of unique tags
 */
export const getAvailableTags = (quarters) => {
  const tags = new Set();
  quarters.forEach(quarter => {
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
};

/**
 * Filter quarters based on search, year, milestone, and tags
 * @param {Array} quarters - Quarters data
 * @param {String} searchQuery - Search query
 * @param {String} selectedYear - Selected year filter
 * @param {String} selectedMilestone - Selected milestone filter
 * @param {Array} selectedTags - Selected tags filter
 * @returns {Array} - Filtered quarters
 */
export const filterQuarters = (quarters, searchQuery, selectedYear, selectedMilestone, selectedTags) => {
  return quarters.filter(q => {
    const matchesYear = selectedYear ? q.period.includes(selectedYear) : true;
    const matchesMilestone = selectedMilestone ? q.milestones.some(m => m.title.includes(selectedMilestone)) : true;
    
    let matchesTags = true;
    if (selectedTags.length > 0) {
      matchesTags = q.milestones.some(m => {
        // Check if milestone has any of the selected tags
        const milestoneTags = m.tags || [];
        const milestoneHasTags = milestoneTags.some(tag => selectedTags.includes(tag));
        
        // Check if any tasks have the selected tags
        const tasksHaveTags = m.tasks.some(t => {
          const taskTags = t.tags || [];
          return taskTags.some(tag => selectedTags.includes(tag));
        });
        
        return milestoneHasTags || tasksHaveTags;
      });
    }
    
    const matchesSearch = searchQuery ? q.milestones.some(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.tasks.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : true;
    
    return matchesYear && matchesMilestone && matchesSearch && matchesTags;
  });
};

export default {
  calculateMilestoneProgress,
  calculateQuarterProgress,
  getRoadmapStats,
  filterRoadmapData,
  extractYears,
  extractMilestoneTitles,
  extractTags,
  generateShareUrl,
  parseShareUrl,
  tagColors,
  getTagColor,
  transitionFunctions,
  scrollToElement,
  throttle,
  isMobileDevice,
  createNotificationSystem,
  copyMilestoneLink,
  toggleElement,
  updateTaskProgress,
  updateMilestoneProgress,
  updateQuarterProgress,
  toggleSubtask,
  getAvailableYears,
  getAvailableMilestones,
  getAvailableTags,
  filterQuarters
}; 