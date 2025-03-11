<template>
  <div 
    class="milestone-container"
    :class="{ 'is-expanded': isExpanded }"
    :id="`milestone-${milestoneId}`"
  >
    <div 
      class="milestone-header" 
      @click="toggleExpand"
      :tabindex="0"
      @keydown.enter="toggleExpand"
      @keydown.space.prevent="toggleExpand"
      role="button"
      :aria-expanded="isExpanded ? 'true' : 'false'"
      :aria-controls="`milestone-content-${milestoneId}`"
    >
      <div class="milestone-title-area">
        <h3 class="milestone-title">{{ milestone.title }}</h3>
        <div class="milestone-tags" v-if="milestone.tags && milestone.tags.length">
          <span 
            v-for="tag in milestone.tags" 
            :key="tag" 
            class="milestone-tag"
            :style="getTagStyle(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <div class="milestone-progress">
        <div class="progress-wrapper" aria-hidden="true">
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :style="{ width: progressPercentage + '%' }"
              :class="{ 'completed': isCompleted }"
            ></div>
          </div>
          <div class="progress-text">
            {{ milestone.completedTasks || 0 }}/{{ milestone.totalTasks || 0 }}
          </div>
        </div>
        
        <div class="milestone-controls">
          <button 
            class="milestone-action copy-link" 
            @click.stop="copyMilestoneLink"
            aria-label="Copy link to milestone"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </button>
          
          <div 
            class="expand-icon" 
            :class="{ 'is-expanded': isExpanded }" 
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <transition 
      name="milestone-expand"
      @before-enter="beforeEnter"
      @enter="enter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div 
        v-if="isExpanded" 
        class="milestone-content"
        :id="`milestone-content-${milestoneId}`"
      >
        <div class="milestone-description" v-if="milestone.description">
          <p>{{ milestone.description }}</p>
        </div>
        
        <div class="tasks-container" v-if="milestone.tasks && milestone.tasks.length">
          <h4 class="tasks-heading">Tasks</h4>
          <slot name="tasks"></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'RoadmapMilestone',
  props: {
    milestone: {
      type: Object,
      required: true
    },
    milestoneId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      isExpanded: false,
      tagColors: {
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
        'Mobile': '#E91E63'
      }
    };
  },
  computed: {
    progressPercentage() {
      if (!this.milestone.totalTasks || this.milestone.totalTasks === 0) return 0;
      return (this.milestone.completedTasks / this.milestone.totalTasks) * 100;
    },
    isCompleted() {
      return this.progressPercentage === 100;
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      
      if (this.isExpanded) {
        // Schedule scrolling after the animation completes
        setTimeout(() => {
          this.scrollToMilestone();
        }, 100);
      }
      
      this.$emit('toggle', this.milestoneId);
    },
    copyMilestoneLink() {
      this.$emit('copy-link');
    },
    getTagStyle(tag) {
      const color = this.tagColors[tag] || '#0FB9FD';
      return {
        backgroundColor: `${color}20`, // 20% opacity
        borderColor: `${color}40`,     // 40% opacity
        color: `${color}`
      };
    },
    scrollToMilestone() {
      const el = document.getElementById(`milestone-${this.milestoneId}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const isInView = (
          rect.top >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
        
        if (!isInView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    // Animation methods
    beforeEnter(el) {
      el.style.maxHeight = '0';
      el.style.opacity = '0';
      el.style.overflow = 'hidden';
    },
    enter(el, done) {
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
    beforeLeave(el) {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.overflow = 'hidden';
    },
    leave(el, done) {
      requestAnimationFrame(() => {
        el.style.maxHeight = '0';
        el.style.opacity = '0';
        
        el.addEventListener('transitionend', function listener() {
          el.removeEventListener('transitionend', listener);
          done();
        }, { once: true });
      });
    }
  }
};
</script>

<style scoped>
.milestone-container {
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  scroll-margin: 100px;
}

.milestone-container.is-expanded {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
  border: 1px solid rgba(15, 185, 253, 0.3);
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: background 0.3s ease;
  user-select: none;
}

.milestone-header:hover {
  background: rgba(15, 25, 45, 0.6);
}

.milestone-title-area {
  flex: 1;
}

.milestone-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.milestone-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.milestone-tag {
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: rgba(15, 185, 253, 0.9);
}

.milestone-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  min-width: 130px;
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
    rgba(88, 101, 242, 0.8));
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.3);
}

.progress-bar.completed {
  background: linear-gradient(90deg, 
    rgba(0, 210, 106, 0.8), 
    rgba(0, 210, 106, 0.6));
  box-shadow: 0 0 8px rgba(0, 210, 106, 0.4);
}

.progress-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  margin-left: 0.75rem;
  min-width: 32px;
  text-align: right;
}

.milestone-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.milestone-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(15, 185, 253, 0.3);
  background: rgba(15, 25, 45, 0.6);
  color: rgba(15, 185, 253, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.milestone-action:hover {
  background: rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 25, 45, 0.6);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 185, 253, 0.2);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
  background: rgba(15, 185, 253, 0.15);
  color: rgba(15, 185, 253, 0.9);
}

.milestone-content {
  padding: 0 1.5rem 1.5rem;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.milestone-description {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(15, 25, 45, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.milestone-description p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 0.95rem;
}

.tasks-heading {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.tasks-container {
  padding-top: 0.5rem;
}

/* Animation */
.milestone-expand-enter-active,
.milestone-expand-leave-active {
  transition: max-height 0.5s ease,
              opacity 0.4s ease;
  overflow: hidden;
  will-change: max-height, opacity;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }
  
  .milestone-progress {
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
    justify-content: space-between;
  }
  
  .milestone-content {
    padding: 0 1rem 1rem;
  }
}
</style> 