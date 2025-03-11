<template>
  <div 
    class="task-container" 
    :class="{ 'is-open': isOpen, 'is-completed': task.completed }"
    :id="`task-${taskId}`"
  >
    <div 
      class="task-header"
      @click="toggleTask"
      :tabindex="0"
      @keydown.enter="toggleTask"
      @keydown.space.prevent="toggleTask"
      role="button"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="`task-content-${taskId}`"
    >
      <div class="task-checkbox-wrapper">
        <input 
          type="checkbox" 
          class="task-checkbox"
          :id="`checkbox-${taskId}`"
          :checked="task.completed"
          @click.stop="toggleTaskCompletion"
          :aria-label="`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`"
        >
        <label 
          class="task-title"
          :for="`checkbox-${taskId}`"
        >
          {{ task.title }}
        </label>
      </div>
      
      <div class="task-progress" v-if="hasSubtasks">
        <div class="progress-bar-wrapper">
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${completionPercentage}%` }"></div>
          </div>
          <span class="progress-text">{{ completedSubtasks }}/{{ totalSubtasks }}</span>
        </div>
      </div>
      
      <div class="expand-icon" :class="{ 'is-open': isOpen }">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>
    
    <transition 
      name="task-expand"
      @before-enter="beforeEnter"
      @enter="enter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div 
        v-if="isOpen" 
        class="task-content"
        :id="`task-content-${taskId}`"
      >
        <div class="task-description" v-if="task.description">
          <p>{{ task.description }}</p>
        </div>
        
        <div class="subtasks-container" v-if="hasSubtasks">
          <h4 class="subtasks-heading">Subtasks</h4>
          <div class="subtasks-list">
            <div 
              v-for="(subtask, stIndex) in task.subtasks" 
              :key="stIndex"
              class="subtask-item"
              :class="{ 'completed': subtask.completed }"
            >
              <div class="subtask-checkbox-wrapper">
                <input 
                  type="checkbox" 
                  class="subtask-checkbox" 
                  :id="`subtask-${taskId}-${stIndex}`" 
                  :checked="subtask.completed"
                  @change="toggleSubtask(subtask, stIndex)"
                  :aria-label="`Mark subtask ${subtask.title} as ${subtask.completed ? 'incomplete' : 'complete'}`"
                >
                <label 
                  class="subtask-label"
                  :for="`subtask-${taskId}-${stIndex}`"
                >
                  {{ subtask.title }}
                </label>
              </div>
              
              <div class="subtask-status" :class="subtask.completed ? 'completed' : 'pending'">
                {{ subtask.completed ? 'Completed' : 'Pending' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'RoadmapTask',
  props: {
    task: {
      type: Object,
      required: true
    },
    taskId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      isOpen: false
    };
  },
  computed: {
    hasSubtasks() {
      return this.task.subtasks && this.task.subtasks.length > 0;
    },
    totalSubtasks() {
      return this.hasSubtasks ? this.task.subtasks.length : 0;
    },
    completedSubtasks() {
      return this.hasSubtasks ? this.task.subtasks.filter(subtask => subtask.completed).length : 0;
    },
    completionPercentage() {
      if (!this.hasSubtasks) return 0;
      return (this.completedSubtasks / this.totalSubtasks) * 100;
    }
  },
  methods: {
    toggleTask() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.$nextTick(() => {
          this.scrollToTask();
        });
      }
    },
    toggleTaskCompletion(event) {
      event.stopPropagation();
      
      // Toggle task completion
      const newCompletionState = !this.task.completed;
      
      // Emit event to parent component
      this.$emit('update-task', {
        taskId: this.taskId,
        completed: newCompletionState
      });
      
      // If task is marked as completed, also mark all subtasks as completed
      if (newCompletionState && this.hasSubtasks) {
        this.task.subtasks.forEach((subtask, index) => {
          if (!subtask.completed) {
            this.toggleSubtask(subtask, index, true);
          }
        });
      }
    },
    toggleSubtask(subtask, index, skipEmit = false) {
      // Update subtask completion status (locally)
      const newCompletionState = skipEmit ? true : !subtask.completed;
      
      if (!skipEmit) {
        // Emit event to parent component
        this.$emit('update-subtask', {
          taskId: this.taskId,
          subtaskId: subtask.title,
          completed: newCompletionState
        });
      }
    },
    scrollToTask() {
      const taskElement = document.getElementById(`task-${this.taskId}`);
      if (taskElement) {
        const rect = taskElement.getBoundingClientRect();
        const isInView = (
          rect.top >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
        
        if (!isInView) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
.task-container {
  background: rgba(15, 25, 45, 0.35);
  border-radius: 12px;
  border: 1px solid rgba(88, 101, 242, 0.15);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  margin-bottom: 1rem;
}

.task-container:hover {
  background: rgba(15, 25, 45, 0.45);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.task-container.is-open {
  border-color: rgba(88, 101, 242, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.task-container.is-completed {
  background: rgba(0, 210, 106, 0.05);
  border-color: rgba(0, 210, 106, 0.2);
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.task-header:hover {
  background: rgba(15, 25, 45, 0.2);
}

.task-checkbox-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.task-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid rgba(88, 101, 242, 0.5);
  background: rgba(15, 25, 45, 0.3);
  margin-right: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-checkbox:checked {
  background: rgba(0, 210, 106, 0.8);
  border-color: rgba(0, 210, 106, 0.4);
}

.task-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.3);
}

.task-title {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.is-completed .task-title {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.6);
}

.task-progress {
  display: flex;
  align-items: center;
  margin: 0 1.5rem;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  min-width: 120px;
}

.progress-bar-container {
  flex: 1;
  height: 6px;
  background: rgba(15, 25, 45, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(88, 101, 242, 0.8), 
    rgba(201, 42, 253, 0.8));
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.progress-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 0.75rem;
  min-width: 30px;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(88, 101, 242, 0.1);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.expand-icon.is-open {
  transform: rotate(180deg);
  background: rgba(88, 101, 242, 0.2);
}

.task-content {
  padding: 0 1rem 1rem 1rem;
}

.task-description {
  background: rgba(15, 25, 45, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.task-description p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.5;
}

.subtasks-heading {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
}

.subtask-item:hover {
  background: rgba(15, 25, 45, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.subtask-item.completed {
  background: rgba(0, 210, 106, 0.05);
  border-color: rgba(0, 210, 106, 0.2);
}

.subtask-checkbox-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.subtask-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.4);
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subtask-checkbox:checked {
  background: rgba(0, 210, 106, 0.8);
  border-color: rgba(0, 210, 106, 0.4);
}

.subtask-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.subtask-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.3);
}

.subtask-label {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: color 0.2s ease;
}

.subtask-item.completed .subtask-label {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.6);
}

.subtask-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  background: rgba(253, 199, 15, 0.1);
  color: rgba(253, 199, 15, 0.9);
  border: 1px solid rgba(253, 199, 15, 0.2);
  white-space: nowrap;
}

.subtask-status.completed {
  background: rgba(0, 210, 106, 0.1);
  color: rgba(0, 210, 106, 0.9);
  border-color: rgba(0, 210, 106, 0.2);
}

/* Animation */
.task-expand-enter-active,
.task-expand-leave-active {
  transition: max-height 0.4s ease,
              opacity 0.3s ease;
  overflow: hidden;
  will-change: max-height, opacity;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .task-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .task-progress {
    margin: 0;
    order: 3;
    width: 100%;
  }
  
  .task-checkbox-wrapper {
    flex: initial;
  }
  
  .expand-icon {
    order: 2;
  }
  
  .subtask-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem;
  }
  
  .subtask-status {
    margin-top: 0.5rem;
    margin-left: 26px;
  }
}
</style> 