<template>
  <div 
    class="cosmic-roadmap" 
    ref="roadmapRef" 
    role="region" 
    aria-label="Project Roadmap Timeline"
    :class="{ 'cosmic-animated': isAnimated }"
  >
    <!-- Animated Background Elements -->
    <div class="cosmic-bg-elements" aria-hidden="true">
      <div class="cosmic-grid-lines"></div>
      <div class="cosmic-particles"></div>
      <div class="cosmic-glow-orb"></div>
    </div>
    
    <!-- Main Timeline Axis with Animated Energy Flow -->
    <div class="timeline-axis" aria-hidden="true">
      <div class="timeline-energy-flow"></div>
      <div class="timeline-markers"></div>
    </div>
    
    <!-- Quarters Container with Enhanced 3D Perspective -->
    <div 
      class="quarters-container" 
      role="list" 
      aria-label="Development Quarters"
      :style="{ '--total-quarters': quarters.length }"
    >
      <!-- Each Quarter Element -->
      <div 
        v-for="(quarter, qIndex) in quarters" 
        :key="qIndex"
        class="quarter"
        :class="{ 
          'active': quarter.open,
          'completed': isQuarterCompleted(quarter),
          'current': isCurrentQuarter(quarter),
          'future': isFutureQuarter(quarter)
        }"
        :style="{
          '--quarter-index': qIndex,
          '--completion-percentage': getProgressPercentage(quarter.completed, quarter.total)
        }"
        role="listitem"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <!-- Quarter Node with Dynamic Styling -->
        <div class="quarter-node" aria-hidden="true">
          <div class="node-pulse"></div>
          <div class="node-inner"></div>
          <span class="quarter-date">{{ quarter.period }}</span>
        </div>
        
        <!-- Quarter Panel with Glassmorphism Effect -->
        <div class="quarter-panel">
          <!-- Interactive Quarter Header -->
          <button 
            class="quarter-header"
            @click="toggleQuarter(qIndex)"
            :aria-expanded="quarter.open ? 'true' : 'false'"
            :aria-controls="`quarter-content-${qIndex}`"
          >
            <div class="header-content">
              <h2 class="quarter-title">{{ quarter.period }}</h2>
              <p class="quarter-description">{{ quarter.description }}</p>
              
              <!-- Tags for Quarter Classification -->
              <div class="quarter-tags" v-if="quarter.tags && quarter.tags.length">
                <span 
                  v-for="(tag, tagIndex) in quarter.tags" 
                  :key="tagIndex" 
                  class="tag"
                  :style="{ '--tag-color': getTagColor(tag) }"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div class="quarter-meta">
              <!-- Reactive Progress Indicator -->
              <div 
                class="progress-indicator"
                :data-percentage="`${getProgressPercentage(quarter.completed, quarter.total)}%`"
              >
                <svg class="progress-ring" width="40" height="40">
                  <circle class="progress-ring-bg" cx="20" cy="20" r="15"></circle>
                  <circle 
                    class="progress-ring-circle" 
                    cx="20" 
                    cy="20" 
                    r="15"
                    :style="{ 
                      strokeDashoffset: calculateStrokeDashoffset(quarter.completed, quarter.total) 
                    }"
                  ></circle>
                </svg>
                <span class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</span>
              </div>
              
              <!-- Animated Toggle Button -->
              <div class="cosmic-toggle" :class="{ 'is-open': quarter.open }">
                <span class="toggle-icon"></span>
              </div>
            </div>
          </button>
          
          <!-- Milestones Container with Grid Layout -->
          <div 
            v-if="quarter.open"
            class="milestones-container"
            role="list"
            aria-label="Milestones"
            :id="`quarter-content-${qIndex}`"
          >
            <!-- Milestone Cards with Hover Effects -->
            <div
              v-for="(milestone, mIndex) in quarter.milestones"
              :key="mIndex"
              class="milestone"
              :class="{ 
                'active': milestone.open,
                'completed': isMilestoneCompleted(milestone)
              }"
              :style="{
                '--milestone-index': mIndex,
                '--milestone-completion': getProgressPercentage(milestone.completed, milestone.total)
              }"
              role="listitem"
              data-scroll="true"
            >
              <!-- Milestone Header with Interactive Elements -->
              <button
                class="milestone-header"
                @click="toggleMilestone(milestone)"
                :aria-expanded="milestone.open ? 'true' : 'false'"
                :aria-controls="`milestone-content-${qIndex}-${mIndex}`"
              >
                <div class="milestone-header-content">
                  <h3 class="milestone-title">{{ milestone.title }}</h3>
                  <p class="milestone-description">{{ milestone.description }}</p>
                  
                  <!-- Milestone Tags -->
                  <div class="milestone-tags" v-if="milestone.tags && milestone.tags.length">
                    <span 
                      v-for="(tag, tagIndex) in milestone.tags" 
                      :key="tagIndex" 
                      class="tag"
                      :style="{ '--tag-color': getTagColor(tag) }"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                
                <div class="milestone-meta">
                  <!-- Circular Progress Indicator -->
                  <div class="progress-indicator">
                    <svg class="progress-ring" width="36" height="36">
                      <circle class="progress-ring-bg" cx="18" cy="18" r="14"></circle>
                      <circle 
                        class="progress-ring-circle" 
                        cx="18" 
                        cy="18" 
                        r="14"
                        :style="{ 
                          strokeDashoffset: calculateStrokeDashoffset(milestone.completed, milestone.total) 
                        }"
                      ></circle>
                    </svg>
                    <span class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</span>
                  </div>
                  
                  <!-- Toggle Button -->
                  <div class="cosmic-toggle" :class="{ 'is-open': milestone.open }">
                    <span class="toggle-icon"></span>
                  </div>
                </div>
              </button>
              
              <!-- Tasks Grid with Masonry Layout -->
              <div
                v-if="milestone.open"
                class="tasks-grid"
                role="list"
                aria-label="Tasks"
                :id="`milestone-content-${qIndex}-${mIndex}`"
              >
                <!-- Task Cards with Interactive Elements -->
                <div
                  v-for="(task, tIndex) in milestone.tasks"
                  :key="tIndex"
                  class="task-card"
                  :class="{ 
                    'important': task.isImportant,
                    'completed': isTaskCompleted(task),
                    'in-progress': isTaskInProgress(task),
                    'planned': isTaskPlanned(task)
                  }"
                  role="listitem"
                  :style="{
                    '--task-index': tIndex,
                    '--task-completion': getProgressPercentage(task.completed, task.total)
                  }"
                >
                  <!-- Task Header with Dynamic Content -->
                  <button
                    class="task-header"
                    @click="toggleTask(task)"
                    :aria-expanded="task.open ? 'true' : 'false'"
                    :aria-controls="`task-content-${qIndex}-${mIndex}-${tIndex}`"
                  >
                    <h4 class="task-title">{{ task.title }}</h4>
                    <p class="task-description">{{ task.description }}</p>
                    
                    <!-- Task Tags with Dynamic Colors -->
                    <div class="task-tags" v-if="task.tags && task.tags.length">
                      <span
                        v-for="(tag, tagIndex) in task.tags"
                        :key="tagIndex"
                        class="tag"
                        :style="{ '--tag-color': getTagColor(tag) }"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    
                    <!-- Task Footer with Progress -->
                    <div class="task-footer">
                      <!-- Progress Bar with Animation -->
                      <div class="progress-bar-container">
                        <div 
                          class="progress-bar" 
                          :style="{ width: getProgressPercentage(task.completed, task.total) + '%' }"
                        ></div>
                      </div>
                      <span class="progress-text">{{ task.completed }}/{{ task.total }}</span>
                      
                      <!-- Status Badge -->
                      <span class="task-status" :class="task.status.toLowerCase().replace(/\s+/g, '-')">
                        {{ task.status }}
                      </span>
                      
                      <!-- Toggle Button (only if has subtasks) -->
                      <div 
                        v-if="task.subtasks && task.subtasks.length" 
                        class="cosmic-toggle" 
                        :class="{ 'is-open': task.open }"
                      >
                        <span class="toggle-icon"></span>
                      </div>
                    </div>
                  </button>
                  
                  <!-- Subtasks List with Check Animation -->
                  <div
                    v-if="task.open && task.subtasks"
                    class="subtasks-list"
                    role="list"
                    aria-label="Subtasks"
                    :id="`task-content-${qIndex}-${mIndex}-${tIndex}`"
                  >
                    <div
                      v-for="(subtask, stIndex) in task.subtasks"
                      :key="stIndex"
                      class="subtask"
                      :class="{ 'completed': subtask.completed }"
                      role="listitem"
                    >
                      <div class="subtask-header">
                        <div class="subtask-checkbox">
                          <input 
                            type="checkbox" 
                            :id="`subtask-${qIndex}-${mIndex}-${tIndex}-${stIndex}`" 
                            :checked="subtask.completed" 
                            @change="toggleSubtask(quarter, milestone, task, subtask)"
                            :aria-label="`Mark subtask ${subtask.title} as ${subtask.completed ? 'incomplete' : 'complete'}`"
                          >
                          <label :for="`subtask-${qIndex}-${mIndex}-${tIndex}-${stIndex}`">
                            <span class="checkbox-custom"></span>
                            <span class="subtask-title">{{ subtask.title }}</span>
                          </label>
                        </div>
                        <div class="subtask-status" :class="{ 'completed': subtask.completed }">
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
    
    <!-- Timeline Navigation Controls -->
    <div class="timeline-controls" v-if="quarters.length > 3">
      <button 
        class="timeline-control prev" 
        @click="navigateTimeline('prev')"
        :disabled="currentTimelinePosition <= 0"
        aria-label="View previous quarters"
      >
        <span class="control-icon">←</span>
      </button>
      <div class="timeline-indicators">
        <span 
          v-for="(_, index) in Math.ceil(quarters.length / 3)" 
          :key="index"
          class="indicator"
          :class="{ 'active': currentTimelinePosition === index }"
          @click="jumpToTimelinePosition(index)"
        ></span>
      </div>
      <button 
        class="timeline-control next" 
        @click="navigateTimeline('next')"
        :disabled="currentTimelinePosition >= Math.ceil(quarters.length / 3) - 1"
        aria-label="View next quarters"
      >
        <span class="control-icon">→</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import RoadmapHarmonizer from './RoadmapHarmonizer.js';
import gsap from 'gsap';
import * as d3 from 'd3';

export default {
  name: 'RoadmapDisplay',
  props: {
    quarters: {
      type: Array,
      required: true
    },
    // Optional current date for highlighting current quarter
    currentDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    // Enable/disable animations
    animated: {
      type: Boolean,
      default: true
    },
    // Tag color mapping
    tagColorMap: {
      type: Object,
      default: () => ({
        'Frontend': 'var(--cosmic-blue)',
        'Backend': 'var(--cosmic-purple)',
        'DevOps': 'var(--cosmic-magenta)',
        'Design': 'var(--cosmic-red)',
        'Research': 'var(--cosmic-green)',
        'Testing': 'var(--cosmic-yellow)',
        'Documentation': 'var(--cosmic-teal)',
        'Infrastructure': '#607D8B',
        'Security': '#FF3D00',
        'UX': '#009688',
        'API': '#3F51B5',
        'Database': '#795548',
        'Performance': '#FF9800',
        'Accessibility': '#8BC34A',
        'Mobile': '#E91E63'
      })
    }
  },
  
  emits: ['update:quarters', 'task-click', 'milestone-click', 'quarter-click'],
  
  setup(props, { emit }) {
    // Refs
    const roadmapRef = ref(null);
    const isAnimated = ref(props.animated);
    const currentTimelinePosition = ref(0);
    const expandedQuarters = ref(new Set());
    const focusedElement = ref(null);
    
    // Reactive state for tracking independently opened elements
    const interactionState = reactive({
      hoveredQuarter: null,
      hoveredMilestone: null,
      hoveredTask: null,
      lastInteractionTime: Date.now(),
      activeElements: new Set() // Track active/expanded elements by their unique ID
    });
    
    // Timeline particle system (for decoration)
    const particles = ref([]);
    
    // Computed properties
    const currentQuarterIndex = computed(() => {
      const currentYear = new Date(props.currentDate).getFullYear();
      const currentMonth = new Date(props.currentDate).getMonth();
      const currentQuarter = Math.floor(currentMonth / 3) + 1;
      
      return props.quarters.findIndex(q => {
        const [year, quarter] = q.period.split('-Q');
        return parseInt(year) === currentYear && parseInt(quarter) === currentQuarter;
      });
    });
    
    // Animation timeline - using GSAP
    const timeline = ref(null);
    
    // =======================================
    // Helper Methods
    // =======================================
    
    // Status check methods
    const isQuarterCompleted = (quarter) => {
      return quarter.completed === quarter.total && quarter.total > 0;
    };
    
    const isCurrentQuarter = (quarter) => {
      if (currentQuarterIndex.value === -1) return false;
      return props.quarters.indexOf(quarter) === currentQuarterIndex.value;
    };
    
    const isFutureQuarter = (quarter) => {
      if (currentQuarterIndex.value === -1) return false;
      return props.quarters.indexOf(quarter) > currentQuarterIndex.value;
    };
    
    const isMilestoneCompleted = (milestone) => {
      return milestone.completed === milestone.total && milestone.total > 0;
    };
    
    const isTaskCompleted = (task) => {
      return task.status === 'Completed' || (task.completed === task.total && task.total > 0);
    };
    
    const isTaskInProgress = (task) => {
      return task.status === 'In Progress' || (task.completed > 0 && task.completed < task.total);
    };
    
    const isTaskPlanned = (task) => {
      return task.status === 'Planned' || task.status === 'To Do' || task.completed === 0;
    };
    
    // Get progress percentage for progress bars
    const getProgressPercentage = (completed, total) => {
      if (!total) return 0;
      return Math.round((completed / total) * 100);
    };
    
    // Calculate SVG circle stroke dashoffset for circular progress
    const calculateStrokeDashoffset = (completed, total) => {
      const percentage = getProgressPercentage(completed, total);
      // For a circle with radius 15, circumference is 2 * PI * 15
      const circumference = 2 * Math.PI * 15;
      return circumference - (percentage / 100) * circumference;
    };
    
    // Get color for tag
    const getTagColor = (tag) => {
      return props.tagColorMap[tag] || 'var(--cosmic-blue)';
    };
    
    // Generate unique element ID for independent tracking
    const getElementId = (type, index, parentIndex = null) => {
      return `${type}-${parentIndex !== null ? parentIndex + '-' : ''}${index}`;
    };
    
    // =======================================
    // Interaction Methods
    // =======================================
    
    // Toggle quarter expansion
    const toggleQuarter = (index) => {
      const updatedQuarters = [...props.quarters];
      updatedQuarters[index].open = !updatedQuarters[index].open;
      
      // Update expanded quarters set for animation tracking
      if (updatedQuarters[index].open) {
        expandedQuarters.value.add(index);
      } else {
        expandedQuarters.value.delete(index);
      }
      
      emit('update:quarters', updatedQuarters);
      emit('quarter-click', updatedQuarters[index]);
      
      // Animate the expansion/collapse faster
      nextTick(() => {
        animateQuarterToggle(index, updatedQuarters[index].open);
      });
    };
    
    // Toggle milestone expansion with independent behavior
    const toggleMilestone = (milestone) => {
      milestone.open = !milestone.open;
      
      // Add to active elements set for independent tracking
      const elementId = milestone.id || milestone.title;
      if (milestone.open) {
        interactionState.activeElements.add(elementId);
      } else {
        interactionState.activeElements.delete(elementId);
      }
      
      emit('update:quarters', [...props.quarters]);
      emit('milestone-click', milestone);
      
      // Animate the specific milestone's expansion/collapse faster
      nextTick(() => {
        animateMilestoneToggle(milestone);
      });
    };
    
    // Toggle task expansion
    const toggleTask = (task) => {
      task.open = !task.open;
      
      // Add to active elements set for independent tracking
      const elementId = task.id || task.title;
      if (task.open) {
        interactionState.activeElements.add(elementId);
      } else {
        interactionState.activeElements.delete(elementId);
      }
      
      emit('update:quarters', [...props.quarters]);
      emit('task-click', task);
      
      // Animate subtasks faster
      if (task.open && task.subtasks) {
        nextTick(() => {
          animateSubtasksReveal(task);
        });
      }
    };
    
    // Toggle subtask completion
    const toggleSubtask = (quarter, milestone, task, subtask) => {
      subtask.completed = !subtask.completed;
      
      // Update task completion count
      task.completed = task.subtasks.filter(st => st.completed).length;
      
      // Update milestone and quarter completion counts
      updateCompletionCounts(quarter, milestone);
      
      emit('update:quarters', [...props.quarters]);
    };
    
    // Update completion counts for milestone and quarter
    const updateCompletionCounts = (quarter, milestone) => {
      // Update milestone completion
      milestone.completed = milestone.tasks.reduce((sum, t) => sum + t.completed, 0);
      milestone.total = milestone.tasks.reduce((sum, t) => sum + t.total, 0);
      
      // Update quarter completion
      quarter.completed = quarter.milestones.reduce((sum, m) => sum + m.completed, 0);
      quarter.total = quarter.milestones.reduce((sum, m) => sum + m.total, 0);
    };
    
    // Timeline navigation
    const navigateTimeline = (direction) => {
      if (direction === 'prev' && currentTimelinePosition.value > 0) {
        currentTimelinePosition.value--;
      } else if (direction === 'next' && 
                currentTimelinePosition.value < Math.ceil(props.quarters.length / 3) - 1) {
        currentTimelinePosition.value++;
      }
      
      // Animate the timeline navigation faster
      animateTimelineNavigation();
    };
    
    // Jump to specific timeline position
    const jumpToTimelinePosition = (position) => {
      if (position >= 0 && 
          position < Math.ceil(props.quarters.length / 3)) {
        currentTimelinePosition.value = position;
        animateTimelineNavigation();
      }
    };
    
    // =======================================
    // Animation Methods - Optimized for Speed
    // =======================================
    
    // Initialize animations
    const initAnimations = () => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      // Setup GSAP timeline with faster defaults
      timeline.value = gsap.timeline({ 
        paused: true,
        defaults: { 
          ease: 'power2.out',
          duration: 0.3 // Reduced from 0.5 for faster animations
        }
      });
      
      // Setup particle system
      initParticleSystem();
      
      // Animate timeline axis
      animateTimelineAxis();
    };
    
    // Animate timeline axis with energy flow - faster
    const animateTimelineAxis = () => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      const timelineAxis = roadmapRef.value.querySelector('.timeline-axis');
      const energyFlow = roadmapRef.value.querySelector('.timeline-energy-flow');
      
      if (timelineAxis && energyFlow) {
        gsap.fromTo(energyFlow, 
          { height: '0%', opacity: 0.3 },
          { 
            height: '100%', 
            opacity: 0.8, 
            duration: 1.8, // Reduced from 2.5 for faster animation
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true
          }
        );
      }
    };
    
    // Animate quarter toggle - faster with immediate milestone reveal
    const animateQuarterToggle = (index, isOpen) => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      const quarter = roadmapRef.value.querySelectorAll('.quarter')[index];
      const milestonesContainer = quarter?.querySelector('.milestones-container');
      
      if (quarter && milestonesContainer) {
        if (isOpen) {
          // Make quarters appear faster
          gsap.fromTo(milestonesContainer, 
            { height: 0, opacity: 0 },
            { 
              height: 'auto', 
              opacity: 1, 
              duration: 0.25, // Reduced from 0.4 for faster animation
              ease: 'power2.out',
              onComplete: () => {
                // Immediately reveal milestones for faster appearance
                gsap.to(milestonesContainer.querySelectorAll('.milestone'), {
                  opacity: 1,
                  y: 0,
                  stagger: 0.03, // Reduced from 0.05 for faster staggering
                  duration: 0.2 // Reduced from 0.3 for faster animation
                });
              }
            }
          );
        } else {
          // Faster closing animation
          gsap.to(milestonesContainer, { 
            height: 0, 
            opacity: 0, 
            duration: 0.2, // Reduced from 0.3 for faster animation
            ease: 'power2.in' 
          });
        }
      }
    };
    
    // Animate milestone toggle - Independent behavior
    const animateMilestoneToggle = (milestone) => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      // Find the DOM element corresponding to this milestone by title for unique identification
      const milestoneElements = roadmapRef.value.querySelectorAll('.milestone');
      const milestoneElement = Array.from(milestoneElements).find(el => {
        return el.querySelector('.milestone-title').textContent === milestone.title;
      });
      
      const tasksGrid = milestoneElement?.querySelector('.tasks-grid');
      
      if (milestoneElement && tasksGrid) {
        // Ensure this milestone animation doesn't affect others
        if (milestone.open) {
          // Add specific class to identify this milestone as independently active
          milestoneElement.classList.add('independently-active');
          
          // Animate opening faster
          gsap.fromTo(tasksGrid, 
            { height: 0, opacity: 0 },
            { 
              height: 'auto', 
              opacity: 1, 
              duration: 0.25, // Reduced from 0.4 for faster animation
              ease: 'power2.out',
              onComplete: () => {
                // Make task cards appear faster
                gsap.to(tasksGrid.querySelectorAll('.task-card'), {
                  opacity: 1,
                  scale: 1,
                  stagger: 0.02, // Reduced from 0.05 for faster staggering
                  duration: 0.2 // Reduced from 0.3 for faster animation
                });
              }
            }
          );
        } else {
          // Remove the independent active class
          milestoneElement.classList.remove('independently-active');
          
          // Animate closing faster
          gsap.to(tasksGrid, { 
            height: 0, 
            opacity: 0, 
            duration: 0.2, // Reduced from 0.3 for faster animation
            ease: 'power2.in' 
          });
        }
      }
    };
    
    // Animate subtasks reveal - faster
    const animateSubtasksReveal = (task) => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      // Find the DOM element corresponding to this task by title for unique identification
      const taskElements = roadmapRef.value.querySelectorAll('.task-card');
      const taskElement = Array.from(taskElements).find(el => {
        return el.querySelector('.task-title').textContent === task.title;
      });
      
      const subtasksList = taskElement?.querySelector('.subtasks-list');
      
      if (taskElement && subtasksList) {
        // Make subtasks appear faster
        gsap.fromTo(subtasksList.querySelectorAll('.subtask'), 
          { opacity: 0, y: 5 }, // Reduced from 10px for faster appearance
          { 
            opacity: 1, 
            y: 0, 
            stagger: 0.03, // Reduced from 0.05 for faster staggering
            duration: 0.2, // Reduced from 0.3 for faster animation
            ease: 'power2.out'
          }
        );
      }
    };
    
    // Animate timeline navigation - faster
    const animateTimelineNavigation = () => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      const quartersContainer = roadmapRef.value.querySelector('.quarters-container');
      
      if (quartersContainer) {
        // Faster timeline navigation
        gsap.to(quartersContainer, {
          y: -1 * currentTimelinePosition.value * quartersContainer.offsetHeight / 3,
          duration: 0.3, // Reduced from 0.5 for faster animation
          ease: 'power2.inOut'
        });
      }
    };
    
    // Initialize particle system for timeline - optimized
    const initParticleSystem = () => {
      if (!roadmapRef.value || !isAnimated.value) return;
      
      const particlesContainer = roadmapRef.value.querySelector('.cosmic-particles');
      
      if (!particlesContainer) return;
      
      // Create fewer particles for better performance
      const particleCount = 20; // Reduced from 30 for better performance
      const particlesArray = [];
      
      for (let i = 0; i < particleCount; i++) {
        particlesArray.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 1 + Math.random() * 3,
          velocity: 0.15 + Math.random() * 0.4, // Increased for faster movement
          opacity: 0.2 + Math.random() * 0.4,
          color: i % 3 === 0 ? 'var(--cosmic-blue)' : 
                 i % 3 === 1 ? 'var(--cosmic-purple)' : 
                               'var(--cosmic-magenta)'
        });
      }
      
      particles.value = particlesArray;
      
      // Render particles with D3
      const svg = d3.select(particlesContainer)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
      
      const particleElements = svg.selectAll('circle')
        .data(particlesArray)
        .enter()
        .append('circle')
        .attr('cx', d => `${d.x}%`)
        .attr('cy', d => `${d.y}%`)
        .attr('r', d => d.size)
        .attr('fill', d => d.color)
        .attr('opacity', d => d.opacity);
      
      // Animate particles faster
      const animateParticles = () => {
        particleElements
          .transition()
          .duration(2000) // Reduced from 3000 for faster animation
          .attr('cy', d => {
            d.y -= d.velocity;
            if (d.y < 0) d.y = 100;
            return `${d.y}%`;
          })
          .attr('opacity', d => 0.2 + Math.random() * 0.4)
          .on('end', animateParticles);
      };
      
      animateParticles();
    };
    
    // Set up intersection observer with lower threshold for faster reveal
    const setupIntersectionObserver = () => {
      const elements = roadmapRef.value?.querySelectorAll('[data-scroll="true"]');
      
      if (!elements) return;
      
      elements.forEach(el => {
        const { stop } = useIntersectionObserver(
          el,
          ([{ isIntersecting }]) => {
            if (isIntersecting) {
              el.classList.add('revealed');
              stop();
            }
          },
          { threshold: 0.05 } // Reduced from 0.1 to reveal earlier
        );
      });
    };
    
    // =======================================
    // Lifecycle Hooks
    // =======================================
    
    // On component mount
    onMounted(() => {
      if (roadmapRef.value) {
        // Initialize roadmap harmonizer
        RoadmapHarmonizer.initRoadmapAnimations(roadmapRef.value);
        
        // Initialize animations
        nextTick(() => {
          initAnimations();
          setupIntersectionObserver();
        });
        
        // Set up swipe handlers for mobile
        if (RoadmapHarmonizer.isMobile()) {
          const handleLeftSwipe = () => {
            navigateTimeline('next');
          };
          
          const handleRightSwipe = () => {
            navigateTimeline('prev');
          };
          
          RoadmapHarmonizer.initTouchEvents(roadmapRef.value, handleLeftSwipe, handleRightSwipe);
        }
      }
    });
    
    // Clean up on component unmount
    onUnmounted(() => {
      if (roadmapRef.value) {
        RoadmapHarmonizer.resetAllAnimations(roadmapRef.value);
      }
      
      // Clean up GSAP animations
      if (timeline.value) {
        timeline.value.kill();
      }
    });
    
    // Watch for changes in quarters
    watch(() => props.quarters, (newQuarters) => {
      if (roadmapRef.value) {
        nextTick(() => {
          setupIntersectionObserver();
        });
      }
    }, { deep: true });
    
    // Watch for changes in animation setting
    watch(() => props.animated, (newValue) => {
      isAnimated.value = newValue;
    });
    
    // Return the exposed properties and methods
    return {
      // Refs
      roadmapRef,
      isAnimated,
      currentTimelinePosition,
      particles,
      
      // Status methods
      isQuarterCompleted,
      isCurrentQuarter,
      isFutureQuarter,
      isMilestoneCompleted,
      isTaskCompleted,
      isTaskInProgress,
      isTaskPlanned,
      
      // Helper methods
      getProgressPercentage,
      calculateStrokeDashoffset,
      getTagColor,
      
      // Interaction methods
      toggleQuarter,
      toggleMilestone,
      toggleTask,
      toggleSubtask,
      navigateTimeline,
      jumpToTimelinePosition
    };
  }
};
</script>

<style>
/* Modern, unified styling for the roadmap component with CSS Grid and Custom Properties */

/* Import centralized variables for theming */
@import './styles/roadmap-variables.css';

/* ============================================
   CORE CONTAINER & BACKGROUND ELEMENTS
   ============================================ */

.cosmic-roadmap {
  --quarter-spacing: 5rem;
  --milestone-spacing: 3rem;
  --task-spacing: 1.5rem;
  --timeline-width: 4px;
  --node-size: 24px;
  --node-size-large: 40px;
  --node-offset: 12rem;
  --content-max-width: 800px;
  
  position: relative;
  width: 100%;
  max-width: var(--roadmap-container-width, 1400px);
  margin: 0 auto;
  padding: var(--space-xl) 0;
  display: grid;
  grid-template-columns: var(--node-offset) 1fr;
  font-family: 'Montserrat', 'Noto Sans Arabic', 'Roboto', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', 'Be Vietnam Pro', 'Noto Sans', Helvetica, sans-serif;
  overflow: hidden;
}

/* Animated background elements */
.cosmic-bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.cosmic-grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(15, 185, 253, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 185, 253, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: center center;
  opacity: 0.4;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: center bottom;
}

.cosmic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.cosmic-glow-orb {
  position: absolute;
  top: 25%;
  right: 10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(200, 42, 253, 0.05) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.4;
  animation: float-orb 15s ease-in-out infinite;
}

@keyframes float-orb {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-80px) scale(1.2);
    opacity: 0.6;
  }
}

/* ============================================
   TIMELINE AXIS & ENERGY FLOW
   ============================================ */

.timeline-axis {
  position: absolute;
  left: calc(var(--node-offset) - var(--timeline-width) / 2);
  top: 0;
  bottom: 0;
  width: var(--timeline-width);
  background: linear-gradient(
    to bottom,
    rgba(15, 185, 253, 0.8),
    rgba(200, 42, 253, 0.8)
  );
  border-radius: 2px;
  box-shadow: 
    0 0 10px rgba(15, 185, 253, 0.5),
    0 0 20px rgba(200, 42, 253, 0.3);
  overflow: visible;
  z-index: 2;
  transition: all 0.3s ease;
}

.timeline-energy-flow {
  position: absolute;
  top: 0;
  left: 0;
  height: 30%;
  width: 100%;
  background: linear-gradient(
    to bottom,
    rgba(15, 185, 253, 0.9),
    rgba(200, 42, 253, 0.1)
  );
  filter: blur(1px);
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.7);
  z-index: 3;
}

.timeline-markers {
  position: absolute;
  top: 0;
  left: -2px;
  right: -2px;
  height: 100%;
  z-index: 3;
}

.timeline-markers::before,
.timeline-markers::after {
  content: '';
  position: absolute;
  left: 0;
  width: 8px;
  height: 2px;
  background-color: rgba(15, 185, 253, 0.8);
}

.timeline-markers::before {
  top: 25%;
}

.timeline-markers::after {
  top: 75%;
}

/* ============================================
   QUARTERS CONTAINER & ITEMS
   ============================================ */

.quarters-container {
  position: relative;
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: column;
  gap: var(--quarter-spacing);
  width: 100%;
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.quarter {
  position: relative;
  display: grid;
  grid-template-columns: var(--node-offset) 1fr;
  width: 100%;
  --quarter-hue: calc(210 + (var(--quarter-index, 0) * 20));
  --quarter-color: hsl(var(--quarter-hue), 70%, 50%);
}

/* Quarter states */
.quarter.completed .quarter-node::before {
  background: rgba(0, 229, 164, 0.8);
  border-color: rgb(0, 229, 164);
}

.quarter.current .quarter-node {
  animation: pulse-node 1.5s ease-in-out infinite;
}

.quarter.future .quarter-panel {
  opacity: 0.7;
}

.quarter.active .quarter-panel {
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 5px 20px rgba(10, 20, 32, 0.2),
    0 0 15px rgba(15, 185, 253, 0.2);
}

/* Quarter node (timeline circle) */
.quarter-node {
  position: relative;
  justify-self: center;
  width: var(--node-size-large);
  height: var(--node-size-large);
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.quarter-node::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.6);
  border: 2px solid rgba(15, 185, 253, 0.8);
  box-shadow: 
    0 0 0 4px rgba(15, 185, 253, 0.1),
    0 0 15px rgba(15, 185, 253, 0.4);
  transition: all 0.3s ease;
}

.node-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  border: 2px solid rgba(15, 185, 253, 0.4);
  animation: pulse-ring 2s linear infinite;
  opacity: 0;
}

.quarter.current .node-pulse {
  opacity: 1;
}

.node-inner {
  position: absolute;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: rgba(25, 34, 46, 0.8);
  border: 2px solid rgba(15, 185, 253, 0.6);
  z-index: 1;
}

.quarter-date {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Quarter panel */
.quarter-panel {
  grid-column: 2;
  background: rgba(25, 34, 46, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  overflow: visible;
  height: auto;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  max-width: var(--content-max-width);
}

.quarter-panel:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 5px 20px rgba(10, 20, 32, 0.2),
    0 0 10px rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
}

/* Quarter header */
.quarter-header {
  position: relative;
  width: 100%;
  padding: var(--space-lg);
  background: transparent;
  border: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  transition: all 0.3s ease;
}

.quarter-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(15, 185, 253, 0.3),
    transparent
  );
  opacity: 0.5;
}

.quarter-header:hover {
  background: rgba(15, 185, 253, 0.05);
}

.quarter-header:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.3);
}

.header-content {
  flex: 1;
}

.quarter-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  margin-bottom: var(--space-sm);
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.quarter-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 40px;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0.8),
    rgba(200, 42, 253, 0.8)
  );
  border-radius: 1px;
}

.quarter-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: var(--space-sm);
  line-height: 1.5;
  max-width: 90%;
}

.quarter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: var(--space-xs);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--tag-color, #0FB9FD);
  background: rgba(25, 34, 46, 0.7);
  border: 1px solid var(--tag-color, #0FB9FD);
  border-radius: 999px;
  transition: all 0.2s ease;
}

.tag:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.quarter-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

/* Progress indicator */
.progress-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: transparent;
  stroke: rgba(25, 34, 46, 0.7);
  stroke-width: 3;
}

.progress-ring-circle {
  fill: transparent;
  stroke-width: 3;
  stroke: #0FB9FD;
  stroke-linecap: round;
  stroke-dasharray: calc(2 * 3.14159 * 15);
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* Toggle button */
.cosmic-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.toggle-icon {
  position: relative;
  width: 14px;
  height: 14px;
}

.toggle-icon::before,
.toggle-icon::after {
  content: '';
  position: absolute;
  background-color: #0FB9FD;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.toggle-icon::before {
  top: 6px;
  left: 0;
  width: 14px;
  height: 2px;
}

.toggle-icon::after {
  top: 0;
  left: 6px;
  width: 2px;
  height: 14px;
}

.cosmic-toggle.is-open {
  transform: rotate(180deg);
}

.cosmic-toggle.is-open .toggle-icon::after {
  transform: scaleY(0);
}

/* ============================================
   MILESTONES CONTAINER & ITEMS
   ============================================ */

.milestones-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
  padding: var(--space-lg);
  overflow: visible;
}

.milestone {
  position: relative;
  background: var(--cosmic-panel-bg, linear-gradient(to bottom, rgba(30, 43, 56, 0.95), rgba(23, 33, 43, 0.95)));
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
  box-shadow: var(--cosmic-panel-shadow, 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(15, 185, 253, 0.1));
  display: flex;
  flex-direction: column;
  --milestone-hue: calc(210 + (var(--milestone-index, 0) * 15));
  --milestone-color: hsl(var(--milestone-hue), 60%, 55%);
  opacity: 0;
  transform: translateY(20px);
  height: auto;
  min-height: 100px;
  align-self: flex-start !important;
}

.milestone.revealed {
  opacity: 1;
  transform: translateY(0);
}

.milestone:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(15, 185, 253, 0.2);
}

.milestone.completed {
  border-color: rgba(0, 229, 164, 0.3);
}

.milestone.independently-active {
  z-index: 10;
  position: relative;
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(15, 185, 253, 0.3);
}

/* Add cosmic hover effect to milestone */
.milestone::before,
.milestone::after {
  content: '';
  position: absolute;
  height: 2px;
  width: 50%;
  background-color: var(--color-accent, #FFB800);
  transition: transform 0.45s ease, box-shadow 0.65s ease;
  box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
  transform: scaleX(0);
  z-index: 1;
  pointer-events: none;
}

.milestone::before {
  top: -2px;
  left: -4%;
  transform-origin: left;
}

.milestone::after {
  bottom: -2px;
  right: -4%;
  transform-origin: right;
}

.milestone:hover::before,
.milestone:hover::after,
.milestone.independently-active::before,
.milestone.independently-active::after {
  transform: scaleX(1.25);
  box-shadow: 0px 0px 5px rgba(255, 162, 0, 0.936);
}

/* Milestone header */
.milestone-header {
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  border: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  flex: 0 0 auto;
}

.milestone-header::after {
  content: '';
  position: absolute;
  left: var(--space-md);
  right: var(--space-md);
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(15, 185, 253, 0.2),
    transparent
  );
  opacity: 0.5;
}

.milestone-header:hover {
  background: rgba(15, 185, 253, 0.08);
}

.milestone-header:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.3);
}

.milestone-header-content {
  margin-bottom: var(--space-sm);
}

.milestone-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: var(--space-xs);
  letter-spacing: 0.3px;
  position: relative;
  display: inline-block;
}

.milestone-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: var(--space-xs);
  line-height: 1.5;
}

.milestone-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: var(--space-xs);
}

.milestone-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-sm);
}

/* ============================================
   TASKS GRID & TASK CARDS
   ============================================ */

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-md);
  padding: var(--space-md);
  overflow: visible;
  position: relative;
  z-index: 5;
  transition: height 0.25s ease, opacity 0.25s ease;
}

.task-card {
  position: relative;
  background: rgba(25, 34, 46, 0.8);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  --task-hue: calc(210 + (var(--task-index, 0) * 10));
  --task-color: hsl(var(--task-hue), 55%, 60%);
  transform: scale(0.95);
  opacity: 0;
}

.task-card.revealed {
  transform: scale(1);
  opacity: 1;
}

.task-card:hover {
  transform: translateY(-3px);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: 
    0 5px 15px rgba(0, 0, 0, 0.2),
    0 0 5px rgba(15, 185, 253, 0.15);
}

/* Add cosmic hover effect to tasks */
.task-card::before,
.task-card::after {
  content: '';
  position: absolute;
  height: 2px;
  width: 50%;
  background-color: var(--color-accent, #FFB800);
  transition: transform 0.45s ease, box-shadow 0.65s ease;
  box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
  transform: scaleX(0);
  z-index: 3;
  pointer-events: none;
}

.task-card::before {
  top: -1px;
  left: -4%;
  transform-origin: left;
}

.task-card::after {
  bottom: -1px;
  right: -4%;
  transform-origin: right;
}

.task-card:hover::before,
.task-card:hover::after {
  transform: scaleX(1.25);
  box-shadow: 0px 0px 5px rgba(255, 162, 0, 0.936);
}

.task-card.important {
  border-color: rgba(255, 75, 75, 0.3);
  box-shadow: 0 0 10px rgba(255, 75, 75, 0.1);
}

.task-card.completed {
  border-color: rgba(0, 229, 164, 0.3);
}

.task-card.in-progress {
  border-color: rgba(15, 185, 253, 0.3);
}

.task-header {
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  border: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.task-header:hover {
  background: rgba(15, 185, 253, 0.05);
}

.task-header:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.25);
}

.task-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--space-xs);
  letter-spacing: 0.3px;
}

.task-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--space-sm);
  line-height: 1.5;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: var(--space-sm);
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

/* Progress bar */
.progress-bar-container {
  position: relative;
  height: 6px;
  background: rgba(10, 20, 32, 0.8);
  border-radius: 999px;
  overflow: hidden;
  flex: 1;
  min-width: 100px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(
    to right,
    #0FB9FD,
    #4DCFFF
  );
  border-radius: 999px;
  transition: width 0.5s ease-out;
}

.task-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}

.task-status.completed {
  background: rgba(0, 229, 164, 0.15);
  color: rgb(0, 229, 164);
  border: 1px solid rgba(0, 229, 164, 0.3);
}

.task-status.in-progress {
  background: rgba(15, 185, 253, 0.15);
  color: rgb(15, 185, 253);
  border: 1px solid rgba(15, 185, 253, 0.3);
}

.task-status.to-do, .task-status.planned {
  background: rgba(255, 184, 0, 0.15);
  color: rgb(255, 184, 0);
  border: 1px solid rgba(255, 184, 0, 0.3);
}

.task-status.delayed {
  background: rgba(255, 75, 75, 0.15);
  color: rgb(255, 75, 75);
  border: 1px solid rgba(255, 75, 75, 0.3);
}

/* ============================================
   SUBTASKS LIST
   ============================================ */

.subtasks-list {
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  background: rgba(var(--bg-depth-2-rgb), 0.3);
  border-top: 1px solid rgba(var(--cosmic-blue-rgb), 0.1);
}

.subtask {
  padding: var(--space-xs);
  border-radius: var(--border-radius-sm);
  transition: all 0.2s ease;
}

.subtask:hover {
  background: rgba(var(--bg-depth-3-rgb), 0.3);
}

.subtask.completed {
  opacity: 0.8;
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.subtask-checkbox {
  display: flex;
  align-items: center;
}

.subtask-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.subtask-checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-custom {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(var(--cosmic-blue-rgb), 0.5);
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border-right: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(45deg) scale(0);
  opacity: 0;
  transition: all 0.15s ease;
}

input[type="checkbox"]:checked + label .checkbox-custom {
  background: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
}

input[type="checkbox"]:checked + label .checkbox-custom::after {
  transform: rotate(45deg) scale(1);
  opacity: 1;
}

.subtask-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(var(--text-primary-rgb), 0.9);
  transition: all 0.2s ease;
}

input[type="checkbox"]:checked + label .subtask-title {
  color: rgba(var(--text-secondary-rgb), 0.7);
  text-decoration: line-through;
}

.subtask-status {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-full);
  background: rgba(var(--status-planned-rgb), 0.1);
  color: rgb(var(--status-planned-rgb));
  border: 1px solid rgba(var(--status-planned-rgb), 0.2);
}

.subtask-status.completed {
  background: rgba(var(--status-completed-rgb), 0.1);
  color: rgb(var(--status-completed-rgb));
  border-color: rgba(var(--status-completed-rgb), 0.2);
}

.subtask-description {
  font-size: 0.8rem;
  color: rgba(var(--text-secondary-rgb), 0.7);
  padding-left: 24px;
  margin-bottom: var(--space-xs);
  line-height: 1.4;
}

/* ============================================
   TIMELINE NAVIGATION CONTROLS
   ============================================ */

.timeline-controls {
  position: absolute;
  bottom: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  z-index: 10;
}

.timeline-control {
  background: rgba(25, 34, 46, 0.8);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.timeline-control:hover:not(:disabled) {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
  box-shadow: 
    0 3px 8px rgba(10, 20, 32, 0.3),
    0 0 5px rgba(15, 185, 253, 0.2);
}

.timeline-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeline-indicators {
  display: flex;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator:hover {
  background: rgba(15, 185, 253, 0.5);
}

.indicator.active {
  background: #0FB9FD;
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.7);
}

/* ============================================
   ANIMATIONS
   ============================================ */

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes pulse-node {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(var(--cosmic-blue-rgb), 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(var(--cosmic-blue-rgb), 0);
  }
}

/* Add revealed animation for scroll effects */
.revealed {
  animation: reveal 0.3s ease forwards !important;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */

@media (max-width: 1280px) {
  .cosmic-roadmap {
    --node-offset: 8rem;
    max-width: 100%;
  }
  
  .quarter-spacing {
    --quarter-spacing: 4rem;
  }
  
  .milestone-spacing {
    --milestone-spacing: 2.5rem;
  }
  
  .milestones-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 992px) {
  .cosmic-roadmap {
    --node-offset: 6rem;
    padding: var(--space-lg) 0;
  }
  
 .quarter {
    --quarter-spacing: 3rem;
  }
  
  .quarter-title {
    font-size: 1.3rem;
  }
  
  .quarter-description {
    font-size: 0.95rem;
  }
  
  .milestone-title {
    font-size: 1.1rem;
  }
  
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .cosmic-roadmap {
    --node-offset: 4.5rem;
    padding: var(--space-md) 0;
  }
  
  .quarter-node {
    width: 32px;
    height: 32px;
  }
  
  .quarter-date {
    top: -25px;
    font-size: 0.75rem;
  }
  
  .quarter-title {
    font-size: 1.2rem;
  }
  
  .quarter-description {
    font-size: 0.9rem;
    max-width: 100%;
  }
  
  .milestones-container {
    grid-template-columns: 1fr;
    padding: var(--space-md);
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
  
  .task-card {
    max-width: 100%;
  }
  
  .progress-ring {
    width: 30px;
    height: 30px;
  }
  
  .progress-ring-circle,
  .progress-ring-bg {
    cx: 15;
    cy: 15;
    r: 12;
  }
}

@media (max-width: 576px) {
  .cosmic-roadmap {
    --node-offset: 3.5rem;
  }
  
  .quarter-header,
  .milestone-header,
  .task-header {
    padding: var(--space-sm);
    flex-direction: column;
    gap: var(--space-xs);
  }
  
  .quarter-meta,
  .milestone-meta {
    width: 100%;
    justify-content: space-between;
    margin-top: var(--space-xs);
  }
  
  .quarter-title {
    font-size: 1.1rem;
  }
  
  .quarter-description {
    font-size: 0.85rem;
  }
  
  .milestone-title {
    font-size: 1rem;
  }
  
  .task-title {
    font-size: 0.95rem;
  }
  
  .cosmic-glow-orb {
    opacity: 0.3;
  }
  
  .timeline-controls {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    margin: var(--space-md) auto 0;
    justify-content: center;
  }
}

/* Animation opt-out for performance/accessibility */
@media (prefers-reduced-motion: reduce) {
  .cosmic-roadmap {
    --animation-duration: 0s;
  }
  
  .timeline-energy-flow,
  .node-pulse,
  .cosmic-glow-orb,
  .cosmic-particles,
  .quarter-panel,
  .milestone,
  .task-card {
    animation: none !important;
    transition: opacity 0.1s linear !important;
  }
}

/* Ensure each milestone maintains its own height independently */
.milestone-header + div {
  height: auto !important;
  transition: height 0.25s ease !important;
  overflow: visible !important;
}
</style> 