<template>
  <div class="quarters-container" role="list" aria-label="Quarters timeline">
    <div v-for="(quarter, qIndex) in quarters" :key="qIndex" class="quarter cosmic-panel" :class="{ 'active': quarter.open }" role="listitem">
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
            @click="toggleMilestone(milestone)" 
            tabindex="0"
            @keydown.enter="toggleMilestone(milestone)"
            @keydown.space.prevent="toggleMilestone(milestone)"
            role="button"
            :aria-expanded="milestone.open ? 'true' : 'false'"
            :aria-controls="`milestone-content-${qIndex}-${mIndex}`"
          >
            <div class="header-content">
              <h3>{{ milestone.title }}</h3>
              <p class="description">{{ milestone.description }}</p>
            </div>
            <div class="header-right">
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
                @click="toggleTask(task)" 
                tabindex="0"
                @keydown.enter="toggleTask(task)"
                @keydown.space.prevent="toggleTask(task)"
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
  setup(props, { emit }) {
    // Tag colors mapping
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

    const getProgressPercentage = (completed, total) => {
      if (!total) return 0;
      return (completed / total) * 100;
    };

    const toggleQuarter = (index) => {
      const updatedQuarters = [...props.quarters];
      updatedQuarters[index].open = !updatedQuarters[index].open;
      emit('update:quarters', updatedQuarters);
    };

    const toggleMilestone = (milestone) => {
      milestone.open = !milestone.open;
      emit('update:quarters', [...props.quarters]);
    };

    const toggleTask = (task) => {
      task.open = !task.open;
      emit('update:quarters', [...props.quarters]);
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
      
      emit('update:quarters', [...props.quarters]);
    };

    return {
      getProgressPercentage,
      toggleQuarter,
      toggleMilestone,
      toggleTask,
      toggleSubtask,
      getTagColor
    };
  }
};
</script>

<style scoped>
/* VERTICAL TIMELINE */
.quarters-container {
  position: relative;
  padding-left: 50px; /* Space for timeline */
  margin: 0 auto;
  max-width: 1000px;
  width: 100%;
  box-sizing: border-box;
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
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
}

.quarter-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(15, 185, 253, 0.2);
  border-left-color: rgba(15, 185, 253, 0.8);
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
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.milestone-header:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(15, 185, 253, 0.2);
  border-left-color: rgba(15, 185, 253, 0.8);
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
  transition: all 0.3s ease;
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
  transition: all 0.2s ease;
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
    rgba(88, 101, 242, 0.8));
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
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
  transition: all 0.3s ease;
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
  transition: all 0.3s ease;
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
  transition: all 0.2s ease;
}

.task-tag .tag-dot {
  width: 6px;
  height: 6px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 6px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .quarters-container {
    padding-left: 45px;
    width: 100%;
    max-width: 100%;
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
</style> 