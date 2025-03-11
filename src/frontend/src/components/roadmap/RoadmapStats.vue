<template>
  <div class="roadmap-stats cosmic-panel" aria-label="Roadmap statistics">
    <div class="stat-item">
      <div class="stat-value">{{ totalMilestones }}</div>
      <div class="stat-label">Milestones</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ totalTasks }}</div>
      <div class="stat-label">Tasks</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">{{ completedPercentage }}%</div>
      <div class="stat-label">Complete</div>
    </div>
    <div class="stat-progress">
      <div class="stat-progress-bar" :style="{ width: completedPercentage + '%' }"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapStats',
  props: {
    totalMilestones: {
      type: Number,
      required: true
    },
    totalTasks: {
      type: Number,
      required: true
    },
    completedPercentage: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
.roadmap-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  position: relative;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  min-width: 100px;
  text-align: center;
  padding: 0.5rem;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(15, 25, 45, 0.5);
  overflow: hidden;
}

.stat-progress-bar {
  height: 100%;
  background: linear-gradient(to right,
    rgba(15, 185, 253, 0.8),
    rgba(88, 101, 242, 0.8));
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
}

@media (max-width: 768px) {
  .stat-item {
    min-width: 80px;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
}
</style> 