<template>
  <div class="roadmap-stats-container">
    <div class="stats-header">
      <h2 class="stats-title">Project Progress</h2>
      <p class="stats-subtitle">Tracking our journey through the blockchain gaming universe</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon milestone-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalMilestones }}</div>
          <div class="stat-label">Major Projects</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon task-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalTasks }}</div>
          <div class="stat-label">Technical Tasks</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon phase-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">4</div>
          <div class="stat-label">Development Phases</div>
        </div>
      </div>
      
      <div class="stat-card progress-card">
        <div class="stat-circular-progress">
          <svg class="progress-circle" width="80" height="80" viewBox="0 0 120 120">
            <circle class="progress-circle-bg" cx="60" cy="60" r="54" stroke-width="12"></circle>
            <circle class="progress-circle-value" cx="60" cy="60" r="54" stroke-width="12" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"></circle>
          </svg>
          <div class="progress-text">
            <div class="progress-percentage">{{ completedPercentage }}%</div>
            <div class="progress-label">Complete</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'RoadmapStats',
  props: {
    totalMilestones: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    completedPercentage: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const circumference = 2 * Math.PI * 54;
    const dashOffset = computed(() => {
      return circumference - (props.completedPercentage / 100) * circumference;
    });

    return {
      circumference,
      dashOffset
    };
  }
};
</script>

<style scoped>
.roadmap-stats-container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: rgba(15, 25, 45, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  margin-bottom: 3rem;
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
}

.roadmap-stats-container:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-4px);
}

.stats-header {
  margin-bottom: 2rem;
  text-align: center;
}

.stats-title {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #fff, rgba(15, 185, 253, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.01em;
}

.stats-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  padding: 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
}

.stat-card:hover {
  background: rgba(15, 25, 45, 0.5);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  margin-right: 1.2rem;
}

.milestone-icon {
  background: linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(88, 101, 242, 0.4));
  color: #5865F2;
  box-shadow: 0 4px 12px rgba(88, 101, 242, 0.2);
}

.task-icon {
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.2), rgba(15, 185, 253, 0.4));
  color: #0FB9FD;
  box-shadow: 0 4px 12px rgba(15, 185, 253, 0.2);
}

.phase-icon {
  background: linear-gradient(135deg, rgba(201, 42, 253, 0.2), rgba(201, 42, 253, 0.4));
  color: #C92AFD;
  box-shadow: 0 4px 12px rgba(201, 42, 253, 0.2);
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.3rem;
}

.progress-card {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
}

.stat-circular-progress {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.progress-circle {
  transform: rotate(-90deg);
}

.progress-circle-bg {
  fill: none;
  stroke: rgba(15, 185, 253, 0.1);
}

.progress-circle-value {
  fill: none;
  stroke: rgba(15, 185, 253, 0.9);
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.progress-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.2rem;
}

@media (max-width: 768px) {
  .roadmap-stats-container {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stats-title {
    font-size: 1.5rem;
  }
  
  .stats-subtitle {
    font-size: 0.95rem;
  }
}
</style> 