<template>
  <div 
    class="subtask-item" 
    :class="{ completed: subtask.completed }"
  >
    <div class="subtask-checkbox-wrapper">
      <input 
        type="checkbox" 
        class="subtask-checkbox" 
        :id="`subtask-${subtaskId}`" 
        :checked="subtask.completed"
        @change="toggleSubtask"
        :aria-label="`Mark subtask ${subtask.title} as ${subtask.completed ? 'incomplete' : 'complete'}`"
      >
      <label 
        class="subtask-label"
        :for="`subtask-${subtaskId}`"
      >
        {{ subtask.title }}
      </label>
    </div>
    
    <div class="subtask-status" :class="subtask.completed ? 'completed' : 'pending'">
      {{ subtask.completed ? 'Completed' : 'Pending' }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapSubtask',
  props: {
    subtask: {
      type: Object,
      required: true
    },
    subtaskId: {
      type: [String, Number],
      required: true
    }
  },
  methods: {
    toggleSubtask() {
      this.$emit('toggle-subtask', {
        subtaskId: this.subtaskId,
        completed: !this.subtask.completed
      });
    }
  }
};
</script>

<style scoped>
.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  margin-bottom: 0.75rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 10px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
}

.subtask-item:hover {
  background: rgba(15, 25, 45, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  width: 18px;
  height: 18px;
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.4);
  border-radius: 4px;
  margin-right: 12px;
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
  width: 6px;
  height: 10px;
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
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  background: rgba(253, 199, 15, 0.1);
  color: rgba(253, 199, 15, 0.9);
  border: 1px solid rgba(253, 199, 15, 0.2);
}

.subtask-status.completed {
  background: rgba(0, 210, 106, 0.1);
  color: rgba(0, 210, 106, 0.9);
  border-color: rgba(0, 210, 106, 0.2);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .subtask-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem;
  }
  
  .subtask-status {
    margin-top: 0.5rem;
    align-self: flex-start;
  }
}
</style> 