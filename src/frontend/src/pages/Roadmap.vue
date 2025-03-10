<template>
  <div class="roadmap-page galactic">
    <h1 class="title">Roadmap</h1>
    <p class="paragraph">Follow the milestones, track the progress, and watch history. — here's what's next.</p>

    <div v-for="(quarter, qIndex) in quarters" :key="qIndex" class="quarter galactic-box">
      <div class="quarter-header" @click="toggleQuarter(qIndex)" @touchstart="handleTouchStart(qIndex)">
        <div class="header-content">
          <h2>{{ quarter.period }}</h2>
          <p class="description">{{ quarter.description }}</p>
        </div>
        <div class="header-right">
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: getProgressPercentage(quarter.completed, quarter.total) + '%' }"></div>
          </div>
          <div class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</div>
          <span class="icon" :class="{ rotated: quarter.open }">
            {{ quarter.open ? '−' : '+' }}
          </span>
        </div>
      </div>
      <transition name="galactic-slide">
        <div v-if="quarter.open" class="milestones">
          <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone galactic-box">
            <div class="milestone-header" @click="toggleMilestone(milestone)" @touchstart="handleTouchStart(milestone)">
              <div class="header-content">
                <h3>{{ milestone.title }}</h3>
                <p class="description">{{ milestone.description }}</p>
              </div>
              <div class="header-right">
                <div class="progress-container">
                  <div class="progress-bar" :style="{ width: getProgressPercentage(milestone.completed, milestone.total) + '%' }"></div>
                </div>
                <div class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</div>
                <span class="icon" :class="{ rotated: milestone.open }">
                  {{ milestone.open ? '−' : '+' }}
                </span>
              </div>
            </div>
            <transition name="galactic-fade">
              <div v-if="milestone.open" class="tasks">
                <div v-for="(task, tIndex) in milestone.tasks" :key="tIndex" class="task galactic-card">
                  <div class="task-header" @click="toggleTask(task)" @touchstart="handleTouchStartTask(task)">
                    <div class="header-content">
                      <h4>{{ task.title }}</h4>
                      <p class="description">{{ task.description }}</p>
                    </div>
                    <div class="header-right">
                      <div class="progress-container">
                        <div class="progress-bar" :style="{ width: getProgressPercentage(task.completed, task.total) + '%' }"></div>
                      </div>
                      <div class="progress-text">{{ task.completed }}/{{ task.total }}</div>
                      <span class="task-status" :class="task.status.toLowerCase().replace(/\s+/g, '-')">{{ task.status }}</span>
                      <span class="icon small" :class="{ rotated: task.open }">
                        {{ task.open ? '−' : '+' }}
                      </span>
                    </div>
                  </div>
                  <transition name="galactic-fade">
                    <div v-if="task.open && task.subtasks" class="subtasks">
                      <div v-for="(subtask, stIndex) in task.subtasks" :key="stIndex" class="subtask" :class="{ completed: subtask.completed }">
                        <div class="subtask-header">
                          <div class="checkbox-container">
                            <input type="checkbox" :id="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex" 
                                  :checked="subtask.completed" 
                                  @change="toggleSubtask(quarter, milestone, task, subtask)">
                            <label :for="'subtask-' + qIndex + '-' + mIndex + '-' + tIndex + '-' + stIndex">{{ subtask.title }}</label>
                          </div>
                          <span class="subtask-status" :class="{ completed: subtask.completed }">
                            {{ subtask.completed ? 'Completed' : 'To Do' }}
                          </span>
                        </div>
                        <p class="subtask-description">{{ subtask.description }}</p>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import roadmapData from '@/data/roadmap.json';

export default {
  name: 'RoadmapGalactic',
  setup() {
    const quarters = ref([]);

    const loadRoadmap = () => {
      const data = Object.keys(roadmapData).map(key => {
        const quarter = roadmapData[key];
        return {
          ...quarter,
          open: false,
          milestones: quarter.milestones.map(milestone => ({
            ...milestone,
            open: false,
            tasks: milestone.tasks.map(task => ({
              ...task,
              open: false
            }))
          }))
        };
      });
      quarters.value = data;
    };

    const toggleQuarter = (index) => {
      quarters.value[index].open = !quarters.value[index].open;
    };

    const toggleMilestone = (milestone) => {
      milestone.open = !milestone.open;
    };

    const toggleTask = (task) => {
      task.open = !task.open;
    };

    const getProgressPercentage = (completed, total) => {
      if (!total) return 0;
      return (completed / total) * 100;
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
    };

    // Touch feedback for mobile
    const handleTouchStart = (target) => {
      if (target.open !== undefined) {
        toggleMilestone(target);
      } else {
        toggleQuarter(target);
      }
    };

    const handleTouchStartTask = (task) => {
      toggleTask(task);
    };

    onMounted(() => {
      loadRoadmap();
    });

    return {
      quarters,
      toggleQuarter,
      toggleMilestone,
      toggleTask,
      toggleSubtask,
      handleTouchStart,
      handleTouchStartTask,
      getProgressPercentage
    };
  }
};
</script>

<style scoped>
/* Galactic Theme with a pulsing starry background */
.roadmap-page.galactic {
  background: linear-gradient(90deg, #171e30da, #1d263ce1, #171e30e3), url('@/assets/webp/login.webp') no-repeat center center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  color: #e4f1ff;
}

.title {
  text-align: left;
  font-size: 2.5rem;
  margin-top: 4rem;
  z-index: 1;
  text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
  color: #ffffff;
}

.paragraph {
  text-align: left;
  font-size: 1.25rem;
  margin-top: -1.75rem;
  text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
  margin-bottom: 3rem;
  color: #b3c9e6;
}

.galactic-box {
  background: linear-gradient(to bottom, rgba(27, 56, 85, 0.258), rgba(17, 25, 32, 0.705));
  border: 1px solid rgba(255, 255, 255, 0.068);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  backdrop-filter: blur(6px);
  transition: transform 0.6s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}

.galactic-box:hover {
  transform: translateY(-.25rem);
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.5);
}

.galactic-card {
  background: linear-gradient(to bottom, rgba(33, 65, 98, 0.3), rgba(22, 32, 41, 0.75));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.8rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.galactic-card:hover {
  transform: translateY(-0.15rem);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

/* Header Components */
.header-content {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Quarter header with subtle glow and hover effect */
.quarter-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: background 0.3s ease;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: .5rem;
}

.quarter-header:hover {
  background: rgba(255,255,255,0.1);
}

.quarter-header h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(131, 189, 255, 0.5);
}

/* Milestone header with similar effects */
.milestone-header {
  padding: 1.2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;
  border-radius: 1rem;
}

.milestone-header:hover {
  background: rgba(255,255,255,0.1);
}

.milestone-header h3 {
  font-size: 1.4rem;
  margin: 0 0 0.5rem 0;
  color: #d9ebff;
}

/* Task styling */
.task-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-radius: 0.8rem;
  transition: background 0.3s ease;
}

.task-header:hover {
  background: rgba(255,255,255,0.1);
}

.task-header h4 {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: #c4dbff;
}

/* Description styles */
.description {
  font-size: 0.95rem;
  color: #a3c2e5;
  margin: 0;
  max-width: 80%;
  line-height: 1.4;
}

/* Subtasks styles */
.subtasks {
  padding: 0.5rem 1rem 1rem 2rem;
}

.subtask {
  background: rgba(20, 41, 65, 0.4);
  border-radius: 0.6rem;
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s ease;
}

.subtask:hover {
  background: rgba(30, 58, 90, 0.4);
}

.subtask.completed {
  background: rgba(16, 40, 20, 0.4);
  border: 1px solid rgba(80, 220, 100, 0.15);
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-container label {
  font-weight: 500;
  cursor: pointer;
}

.subtask-description {
  font-size: 0.9rem;
  color: #a3c2e5;
  margin: 0.5rem 0 0 1.8rem;
  line-height: 1.4;
}

.subtask-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  background: rgba(255, 100, 100, 0.2);
  color: #ffbbbb;
}

.subtask-status.completed {
  background: rgba(80, 220, 100, 0.2);
  color: #a0ffb0;
}

/* Progress indicators */
.progress-container {
  width: 100px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4a80f0, #6cefff);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #a3c2e5;
  min-width: 40px;
  text-align: center;
}

/* Icon rotation with a bounce effect */
.icon {
  font-size: 1.8rem;
  transition: transform .1s ease;
  color: #7ba6df;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon.small {
  font-size: 1.2rem;
  width: 20px;
  height: 20px;
}

.rotated {
  transform: rotate(180deg);
}

/* Status indicators */
.task-status {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.task-status.todo {
  background: rgba(255, 196, 0, 0.2);
  color: #ffcc66;
}

.task-status.in-progress {
  background: rgba(0, 153, 255, 0.2);
  color: #66ccff;
}

.task-status.completed {
  background: rgba(80, 220, 100, 0.2);
  color: #a0ffb0;
}

/* Galactic slide transition for quarters/milestones */
.galactic-slide-enter-active, .galactic-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  overflow: hidden;
}

.galactic-slide-enter-from, .galactic-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}

.galactic-slide-enter-to, .galactic-slide-leave-from {
  max-height: 2000px; /* Arbitrary large height */
  opacity: 1;
  transform: translateY(0);
}

/* Galactic fade transition for tasks */
.galactic-fade-enter-active, .galactic-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
}

.galactic-fade-enter-from, .galactic-fade-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.galactic-fade-enter-to, .galactic-fade-leave-from {
  max-height: 1000px; /* Arbitrary large height */
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .quarter-header, .milestone-header, .task-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    margin-top: 1rem;
    justify-content: space-between;
  }

  .progress-container {
    width: 100%;
  }

  .subtasks {
    padding: 0.5rem;
  }

  .task-status, .subtask-status {
    margin-top: 0.5rem;
  }
}
</style>