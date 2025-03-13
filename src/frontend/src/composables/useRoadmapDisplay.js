// useRoadmapDisplay.js - Composable for Roadmap Display functionality
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import RoadmapHarmonizer from '@/components/roadmap/RoadmapHarmonizer.js';
import gsap from 'gsap';
import * as d3 from 'd3';

export default function useRoadmapDisplay(props, emit) {
  // Refs
  const roadmapRef = ref(null);
  const isAnimated = ref(props.animated);
  const currentTimelinePosition = ref(0);
  const expandedQuarters = ref(new Set());
  const focusedElement = ref(null);
  
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
  // Status check methods
  // =======================================
  
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
    const circumference = 2 * Math.PI * 15;
    return circumference - (percentage / 100) * circumference;
  };
  
  // Get color for tag
  const getTagColor = (tag) => {
    return props.tagColorMap[tag] || 'var(--cosmic-blue)';
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
    
    // Animate the expansion/collapse
    nextTick(() => {
      animateQuarterToggle(index, updatedQuarters[index].open);
    });
  };
  
  // Toggle milestone expansion
  const toggleMilestone = (milestone) => {
    milestone.open = !milestone.open;
    emit('update:quarters', [...props.quarters]);
    emit('milestone-click', milestone);
    
    // Animate the milestone toggle
    nextTick(() => {
      animateMilestoneToggle(milestone);
    });
  };
  
  // Toggle task expansion
  const toggleTask = (task) => {
    task.open = !task.open;
    emit('update:quarters', [...props.quarters]);
    emit('task-click', task);
    
    // Animate subtasks
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
    
    // Animate the timeline navigation
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
  // Animation Methods
  // =======================================
  
  // Initialize animations
  const initAnimations = () => {
    if (!roadmapRef.value || !isAnimated.value) return;
    
    // Setup GSAP timeline
    timeline.value = gsap.timeline({ 
      paused: true,
      defaults: { 
        ease: 'power2.out',
        duration: 0.3
      }
    });
    
    // Setup particle system
    initParticleSystem();
    
    // Animate timeline axis
    animateTimelineAxis();
  };
  
  // Animate timeline axis with energy flow
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
          duration: 1.8,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true
        }
      );
    }
  };
  
  // Animate quarter toggle
  const animateQuarterToggle = (index, isOpen) => {
    if (!roadmapRef.value || !isAnimated.value) return;
    
    const quarter = roadmapRef.value.querySelectorAll('.quarter')[index];
    const milestonesContainer = quarter?.querySelector('.milestones-container');
    
    if (quarter && milestonesContainer) {
      if (isOpen) {
        gsap.fromTo(milestonesContainer, 
          { height: 0, opacity: 0 },
          { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.25,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(milestonesContainer.querySelectorAll('.milestone'), {
                opacity: 1,
                y: 0,
                stagger: 0.03,
                duration: 0.2
              });
            }
          }
        );
      } else {
        gsap.to(milestonesContainer, { 
          height: 0, 
          opacity: 0, 
          duration: 0.2,
          ease: 'power2.in' 
        });
      }
    }
  };
  
  // Animate milestone toggle
  const animateMilestoneToggle = (milestone) => {
    if (!roadmapRef.value || !isAnimated.value) return;
    
    // Find the DOM element for this milestone
    const milestoneElements = roadmapRef.value.querySelectorAll('.milestone');
    const milestoneElement = Array.from(milestoneElements).find(el => {
      return el.querySelector('.milestone-title').textContent === milestone.title;
    });
    
    const tasksGrid = milestoneElement?.querySelector('.tasks-grid');
    
    if (milestoneElement && tasksGrid) {
      if (milestone.open) {
        milestoneElement.classList.add('independently-active');
        
        gsap.fromTo(tasksGrid, 
          { height: 0, opacity: 0 },
          { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.25,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(tasksGrid.querySelectorAll('.task-card'), {
                opacity: 1,
                scale: 1,
                stagger: 0.02,
                duration: 0.2
              });
            }
          }
        );
      } else {
        milestoneElement.classList.remove('independently-active');
        
        gsap.to(tasksGrid, { 
          height: 0, 
          opacity: 0, 
          duration: 0.2,
          ease: 'power2.in' 
        });
      }
    }
  };
  
  // Animate subtasks reveal
  const animateSubtasksReveal = (task) => {
    if (!roadmapRef.value || !isAnimated.value) return;
    
    // Find the DOM element for this task
    const taskElements = roadmapRef.value.querySelectorAll('.task-card');
    const taskElement = Array.from(taskElements).find(el => {
      return el.querySelector('.task-title').textContent === task.title;
    });
    
    const subtasksList = taskElement?.querySelector('.subtasks-list');
    
    if (taskElement && subtasksList) {
      gsap.fromTo(subtasksList.querySelectorAll('.subtask'), 
        { opacity: 0, y: 5 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.03,
          duration: 0.2,
          ease: 'power2.out'
        }
      );
    }
  };
  
  // Animate timeline navigation
  const animateTimelineNavigation = () => {
    if (!roadmapRef.value || !isAnimated.value) return;
    
    const quartersContainer = roadmapRef.value.querySelector('.quarters-container');
    
    if (quartersContainer) {
      gsap.to(quartersContainer, {
        y: -1 * currentTimelinePosition.value * quartersContainer.offsetHeight / 3,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  };
  
  // Initialize particle system for timeline
  const initParticleSystem = () => {
    if (!roadmapRef.value || !isAnimated.value) return;
    
    const particlesContainer = roadmapRef.value.querySelector('.cosmic-particles');
    
    if (!particlesContainer) return;
    
    // Create particles
    const particleCount = 20;
    const particlesArray = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        velocity: 0.15 + Math.random() * 0.4,
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
    
    // Animate particles
    const animateParticles = () => {
      particleElements
        .transition()
        .duration(2000)
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
  
  // Set up intersection observer for scroll animations
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
        { threshold: 0.05 }
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
  watch(() => props.quarters, () => {
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