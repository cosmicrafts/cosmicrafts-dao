<template>
  <div class="roadmap-page galactic">
    <h1 class="title">Roadmap</h1>

    <div v-for="(quarter, qIndex) in quarters" :key="qIndex" class="quarter galactic-box">
      <div class="quarter-header" @click="toggleQuarter(qIndex)" @touchstart="handleTouchStart(qIndex)">
        <h2>{{ quarter.period }}</h2>
        <span class="icon" :class="{ rotated: quarter.open }">
          {{ quarter.open ? '−' : '+' }}
        </span>
      </div>
      <transition name="galactic-slide">
        <div v-if="quarter.open" class="milestones">
          <div v-for="(milestone, mIndex) in quarter.milestones" :key="mIndex" class="milestone galactic-box">
            <div class="milestone-header" @click="toggleMilestone(milestone)" @touchstart="handleTouchStart(milestone)">
              <h3>{{ milestone.title }}</h3>
              <span class="icon" :class="{ rotated: milestone.open }">
                {{ milestone.open ? '−' : '+' }}
              </span>
            </div>
            <transition name="galactic-fade">
              <div v-if="milestone.open" class="tasks">
                <ul>
                  <li v-for="(task, tIndex) in milestone.tasks" :key="tIndex">
                    <strong>{{ task.title }}</strong>: {{ task.description }} - 
                    <span class="status">{{ task.status }}</span>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
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
            open: false
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

    // Touch feedback for mobile
    const handleTouchStart = (target) => {
      if (target.open !== undefined) {
        toggleMilestone(target);
      } else {
        toggleQuarter(target);
      }
    };

    onMounted(() => {
      loadRoadmap();
    });

    return {
      quarters,
      toggleQuarter,
      toggleMilestone,
      handleTouchStart
    };
  }
};
</script>

<style scoped>
/* Galactic Theme with a pulsing starry background */
.roadmap-page.galactic {
  background: url('@/assets/webp/space.webp') repeat;
  background-size: 1024px 1024px; /* Adjust tile size as needed */
  padding: 2rem;
  min-height: 100vh;
  font-family: 'Roboto', sans-serif;
  color: #fff;
  position: relative;
  overflow: hidden;
  animation: bgPulse 3s infinite alternate;
}


@keyframes bgPulse {
  0% { filter: brightness(0.9); }
  100% { filter: brightness(1.1); }
}

/* Responsive layout */
@media (max-width: 768px) {
  .roadmap-page.galactic {
    padding: 1rem;
  }
  .title {
    font-size: 2.5rem;
  }
  .quarter-header, .milestone-header {
    padding: 0.8rem;
  }
  .icon {
    font-size: 1.5rem;
  }
}

/* Animated star overlay */
.roadmap-page.galactic::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  opacity: 0.15;
  animation: drift 40s linear infinite;
  z-index: 0;
}
@keyframes drift {
  from { transform: translate(0, 0); }
  to { transform: translate(1rem, 1rem); }
}

.title {
  text-align: center;
  font-size: 3.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
}

/* Galactic boxes with blur and hover lift */
.galactic-box {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  backdrop-filter: blur(6px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
}
.galactic-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.6);
}

/* Quarter header with subtle glow and hover effect */
.quarter-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  transition: background 0.3s ease;
}
.quarter-header:hover {
  background: rgba(255,255,255,0.1);
}

/* Milestone header with similar effects */
.milestone-header {
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  transition: background 0.3s ease;
}
.milestone-header:hover {
  background: rgba(255,255,255,0.1);
}

/* Icon rotation with a bounce effect */
.icon {
  font-size: 1.8rem;
  transition: transform 0.3s ease;
}
.rotated {
  transform: rotate(90deg);
}

/* Galactic slide transition for quarters/milestones */
.galactic-slide-enter-active, .galactic-slide-leave-active {
  transition: all 0.5s ease;
}
.galactic-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.galactic-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Galactic fade transition for tasks */
.galactic-fade-enter-active, .galactic-fade-leave-active {
  transition: opacity 0.4s ease;
}
.galactic-fade-enter-from, .galactic-fade-leave-to {
  opacity: 0;
}

/* Tasks list styling with hover */
.tasks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tasks li {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.3);
  transition: background 0.3s ease;
}
.tasks li:hover {
  background: rgba(255,255,255,0.1);
}

/* Status text style */
.status {
  font-weight: bold;
  color: #ffea00;
}
</style>