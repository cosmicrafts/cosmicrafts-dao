<template>
  <div class="cosmic-roadmap" role="region" aria-label="Project Roadmap Timeline">
    <!-- Timeline axis -->
    <div class="timeline-axis" aria-hidden="true"></div>
    
    <!-- Quarters Container -->
    <div class="quarters-container" role="list" aria-label="Development Quarters">
      <div 
        v-for="(quarter, qIndex) in quarters" 
        :key="qIndex" 
        class="quarter" 
        :class="{ 'active': quarter.open }" 
        role="listitem"
        :data-progress="getProgressPercentage(quarter.completed, quarter.total)"
      >
        <!-- Quarter timeline node -->
        <div class="quarter-node" aria-hidden="true">
          <span class="quarter-date">{{ quarter.period }}</span>
        </div>
        
        <!-- Quarter panel with contents -->
        <div class="quarter-panel">
      <div 
        class="quarter-header" 
        @click="toggleQuarter(qIndex)" 
        tabindex="0"
        @keydown.enter="toggleQuarter(qIndex)"
        @keydown.space.prevent="toggleQuarter(qIndex)"
        role="button"
        :aria-expanded="quarter.open ? 'true' : 'false'"
        :aria-controls="`quarter-content-${qIndex}`"
      >
        <div class="header-content">
              <h2 class="quarter-title">{{ quarter.period }}</h2>
              <p class="quarter-description">{{ quarter.description }}</p>
        </div>
            
            <div class="quarter-meta">
              <div class="progress-wrapper" :data-percentage="`${getProgressPercentage(quarter.completed, quarter.total)}%`" aria-hidden="true">
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: getProgressPercentage(quarter.completed, quarter.total) + '%' }"></div>
            </div>
            <div class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</div>
          </div>
              
          <div 
                class="cosmic-toggle" 
            :class="{ 'is-open': quarter.open }" 
            aria-hidden="true"
          >
                <div class="toggle-line horizontal"></div>
                <div class="toggle-line vertical" :class="{ 'hidden': quarter.open }"></div>
          </div>
        </div>
      </div>
          
          <!-- Milestones container -->
      <div 
        v-if="quarter.open" 
            class="milestones-container" 
        role="list" 
        aria-label="Milestones" 
        :id="`quarter-content-${qIndex}`"
      >
            <div 
              v-for="(milestone, mIndex) in quarter.milestones" 
              :key="mIndex" 
              class="milestone" 
              :class="{ 'active': milestone.open }" 
              role="listitem"
              :data-progress="getProgressPercentage(milestone.completed, milestone.total)"
              :data-scroll="true"
            >
          <div 
            class="milestone-header" 
            @click="toggleMilestone(milestone)" 
            tabindex="0"
            @keydown.enter="toggleMilestone(milestone)"
            @keydown.space.prevent="toggleMilestone(milestone)"
            role="button"
            :aria-expanded="milestone.open ? 'true' : 'false'"
            :aria-controls="`milestone-content-${qIndex}-${mIndex}`"
          >
                <div class="milestone-header-content">
                  <h3 class="milestone-title">{{ milestone.title }}</h3>
                  <p class="milestone-description">{{ milestone.description }}</p>
            </div>
                
                <div class="milestone-meta">
                  <div class="progress-wrapper" :data-percentage="`${getProgressPercentage(milestone.completed, milestone.total)}%`">
                <div class="progress-container">
                  <div class="progress-bar" :style="{ width: getProgressPercentage(milestone.completed, milestone.total) + '%' }"></div>
                </div>
                <div class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</div>
              </div>
                  
                  <div 
                    class="cosmic-toggle" 
                    :class="{ 'is-open': milestone.open }"
                  >
                    <div class="toggle-line horizontal"></div>
                    <div class="toggle-line vertical" :class="{ 'hidden': milestone.open }"></div>
              </div>
            </div>
          </div>
              
              <!-- Tasks grid -->
          <div 
            v-if="milestone.open" 
                class="tasks-container" 
            role="list" 
            aria-label="Tasks"
            :id="`milestone-content-${qIndex}-${mIndex}`"
          >
                <div 
                  v-for="(task, tIndex) in milestone.tasks" 
                  :key="tIndex" 
                  class="task-card" 
                  :class="{ 'important': task.isImportant }" 
                  role="listitem"
                  :data-progress="getProgressPercentage(task.completed, task.total)"
                >
              <div 
                class="task-header" 
                @click="toggleTask(task)" 
                tabindex="0"
                @keydown.enter="toggleTask(task)"
                @keydown.space.prevent="toggleTask(task)"
                role="button"
                :aria-expanded="task.open ? 'true' : 'false'"
                :aria-controls="`task-content-${qIndex}-${mIndex}-${tIndex}`"
              >
                    <h4 class="task-title">{{ task.title }}</h4>
                    <p class="task-description">{{ task.description }}</p>
                  
                    <!-- Task tags -->
                  <div v-if="task.tags && task.tags.length" class="task-tags">
                    <span 
                      v-for="tag in task.tags" 
                      :key="tag" 
                      class="task-tag"
                      :style="{ 'border-color': getTagColor(tag) }"
                    >
                      <span class="tag-dot" :style="{ background: getTagColor(tag) }"></span>
                      {{ tag }}
                    </span>
                  </div>
                    
                    <div class="task-footer">
                      <div class="progress-wrapper" :data-percentage="`${getProgressPercentage(task.completed, task.total)}%`">
                    <div class="progress-container">
                      <div class="progress-bar" :style="{ width: getProgressPercentage(task.completed, task.total) + '%' }"></div>
                    </div>
                    <div class="progress-text">{{ task.completed }}/{{ task.total }}</div>
                  </div>
                      
                      <span class="task-status" :class="task.status.toLowerCase().replace(/\s+/g, '-')">
                        {{ task.status }}
                      </span>
                      
                      <div 
                        v-if="task.subtasks && task.subtasks.length" 
                        class="cosmic-toggle" 
                        :class="{ 'is-open': task.open }"
                      >
                        <div class="toggle-line horizontal"></div>
                        <div class="toggle-line vertical" :class="{ 'hidden': task.open }"></div>
                  </div>
                </div>
              </div>
                  
                  <!-- Subtasks -->
              <div 
                v-if="task.open && task.subtasks" 
                    class="subtasks-container"
                role="list"
                aria-label="Subtasks"
                :id="`task-content-${qIndex}-${mIndex}-${tIndex}`"
              >
                    <div 
                      v-for="(subtask, stIndex) in task.subtasks" 
                      :key="stIndex" 
                      class="subtask" 
                      :class="{ completed: subtask.completed }" 
                      role="listitem"
                    >
                  <div class="subtask-header">
                        <div class="subtask-checkbox">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapDisplay',
  props: {
    quarters: {
      type: Array,
      required: true
    }
  },
  emits: ['update:quarters'],
  mounted() {
    // Initialize intersection observer for scroll animations
    this.initScrollObserver();
    
    // Add animation enhancements
    this.$nextTick(() => {
      this.initHoverEffects();
    });
  },
  methods: {
    getProgressPercentage(completed, total) {
      if (!total) return 0;
      return Math.round((completed / total) * 100);
    },
    toggleQuarter(index) {
      // Get the quarter element
      const quarterEl = event.currentTarget.closest('.quarter');
      
      const updatedQuarters = [...this.quarters];
      const isOpening = !updatedQuarters[index].open;
      
      if (isOpening && quarterEl) {
        // Add a class when opening
        quarterEl.classList.add('quarter-opening');
        setTimeout(() => {
          quarterEl.classList.remove('quarter-opening');
        }, 600);
      }
      
      updatedQuarters[index].open = !updatedQuarters[index].open;
      this.$emit('update:quarters', updatedQuarters);
    },
    toggleMilestone(milestone) {
      // Get the milestone element
      const milestoneEl = event.currentTarget.closest('.milestone');
      
      if (!milestone.open) {
        // Add a class when opening
        if (milestoneEl) {
          milestoneEl.classList.add('opening');
          setTimeout(() => {
            milestoneEl.classList.remove('opening');
          }, 600);
        }
      }
      
      // Toggle milestone open state
      milestone.open = !milestone.open;
      this.$emit('update:quarters', [...this.quarters]);
    },
    toggleTask(task) {
      // Get the task element
      const taskEl = event.currentTarget.closest('.task-card');
      
      if (!task.open) {
        // Add a class when opening
        if (taskEl) {
          taskEl.classList.add('task-opening');
          setTimeout(() => {
            taskEl.classList.remove('task-opening');
          }, 600);
        }
      }
      
      // Toggle task open state
      task.open = !task.open;
      this.$emit('update:quarters', [...this.quarters]);
    },
    updateTaskProgress(task) {
      if (!task.subtasks) return;
      
      task.completed = task.subtasks.filter(st => st.completed).length;
      task.total = task.subtasks.length;
    },
    updateMilestoneProgress(milestone) {
      milestone.completed = milestone.tasks.reduce((sum, task) => sum + task.completed, 0);
      milestone.total = milestone.tasks.reduce((sum, task) => sum + task.total, 0);
    },
    updateQuarterProgress(quarter) {
      quarter.completed = quarter.milestones.reduce((sum, milestone) => sum + milestone.completed, 0);
      quarter.total = quarter.milestones.reduce((sum, milestone) => sum + milestone.total, 0);
    },
    toggleSubtask(quarter, milestone, task, subtask) {
      subtask.completed = !subtask.completed;
      
      // Update progress counts that cascade upward
      this.updateTaskProgress(task);
      this.updateMilestoneProgress(milestone);
      this.updateQuarterProgress(quarter);
      
      this.$emit('update:quarters', [...this.quarters]);
    },
    getTagColor(tag) {
      const tagColors = {
        'Frontend': '#0FB9FD',
        'Backend': '#5865F2',
        'DevOps': '#C92AFD',
        'Design': '#FD4D4D',
        'Research': '#00E5A4',
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
      return tagColors[tag] || '#0FB9FD';
    },
    initScrollObserver() {
      // Set up intersection observer for scroll animations if browser supports it
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all elements with data-scroll attribute
        document.querySelectorAll('[data-scroll="true"]').forEach(el => {
          observer.observe(el);
        });
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('[data-scroll="true"]').forEach(el => {
          el.classList.add('revealed');
        });
      }
    },
    initHoverEffects() {
      // Add subtle parallax effect to milestones on mouse move
      const milestones = document.querySelectorAll('.milestone');
      
      if (window.innerWidth > 768) { // Only on desktop/tablet
        milestones.forEach(milestone => {
          milestone.addEventListener('mousemove', (e) => {
            const rect = milestone.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top; // y position within the element
            
            // Calculate rotation based on mouse position
            const tiltX = (y / rect.height - 0.5) * 2; // -1 to 1
            const tiltY = (x / rect.width - 0.5) * -2; // -1 to 1
            
            // Apply subtle transform
            milestone.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
          });
          
          milestone.addEventListener('mouseleave', () => {
            milestone.style.transform = '';
          });
        });
      }
      
      // Add shimmer effect to progress bars on hover
      const progressBars = document.querySelectorAll('.progress-bar');
      progressBars.forEach(bar => {
        const parent = bar.closest('.milestone, .task-card');
        if (parent) {
          parent.addEventListener('mouseenter', () => {
            bar.classList.add('cosmic-shimmer-active');
          });
          parent.addEventListener('mouseleave', () => {
            bar.classList.remove('cosmic-shimmer-active');
          });
        }
      });
    }
  }
};
</script>

<style>
/* Import modular CSS files */
@import './styles/roadmap-core.css';
@import './styles/roadmap-quarters.css';
@import './styles/roadmap-milestones.css';
@import './styles/roadmap-tasks.css';
@import './styles/roadmap-utilities.css';
@import './styles/roadmap-enhancements.css';
@import './styles/roadmap-enhanced-styles.css';

/* Additional component-specific styles */
.cosmic-roadmap {
  width: 100%;
  position: relative;
}

.cosmic-toggle {
  position: relative;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--cosmic-transition-medium);
}

.toggle-line {
  position: absolute;
  background-color: var(--cosmic-blue);
  border-radius: 2px;
  transition: all var(--cosmic-transition-medium);
}

.toggle-line.horizontal {
  width: 16px;
  height: 2px;
}

.toggle-line.vertical {
  width: 2px;
  height: 16px;
}

.toggle-line.hidden {
  transform: scale(0);
  opacity: 0;
}

.cosmic-toggle:hover .toggle-line {
  background-color: var(--cosmic-blue-light);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.cosmic-toggle.is-open {
  transform: rotate(180deg);
}

/* Responsive styles */
@media (max-width: 992px) {
  .cosmic-roadmap {
    padding: var(--spacing-md) 0;
  }
}

@media (max-width: 768px) {
  .toggle-line.horizontal {
    width: 14px;
  }

  .toggle-line.vertical {
    height: 14px;
  }
  
  .cosmic-toggle {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 576px) {
  .quarter-header, 
  .milestone-header,
  .task-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style> 