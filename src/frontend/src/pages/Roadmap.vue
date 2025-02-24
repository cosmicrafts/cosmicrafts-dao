<template>
  <div class="roadmap-page galactic">
    <h1 class="title">Roadmap</h1>
    <p class="paragraph">Follow the milestones, track the progress, and watch history. — here’s what’s next.</p>

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
  background-size: 512px 512px; /* Adjust tile size as needed */
  background: linear-gradient(90deg, #171e30da, #1d263ce1, #171e30e3), url('@/assets/webp/login.webp') no-repeat center center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.title {
  text-align: left;
  font-size: 2.5rem;
  margin-top: 4rem;
  z-index: 1;
  text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
}
.paragraph {
  text-align: left;
  font-size: 1.25rem;
  margin-top: -1.75rem;
  text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
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

/* Quarter header with subtle glow and hover effect */
.quarter-header {
  
  padding: 2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: .5rem;
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
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 1s ease;
  border-radius: 1rem;
}
.milestone-header:hover {
  background: rgba(255,255,255,0.1);
  
}

/* Icon rotation with a bounce effect */
.icon {
  font-size: 2rem;
  transition: transform .1s ease;
}
.rotated {
  transform: rotate(180deg);
}

/* Galactic slide transition for quarters/milestones */
.galactic-slide-enter-active, .galactic-slide-leave-active {
  transition: all 0.1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.galactic-slide-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}
.galactic-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Galactic fade transition for tasks */
.galactic-fade-enter-active, .galactic-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.galactic-fade-enter-from, .galactic-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Tasks list styling with hover */
.tasks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tasks li {
  padding: 0.5rem 1rem;
  border-radius: .5rem;
  margin-top: .5rem;
  margin-left: 4rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;
}
.tasks li:hover {
  background: rgba(255,255,255,0.1);
}

/* Status text style */
.status {
  font-weight: bold;
  color: #5eff00;
}

@media (max-width: 768px) {

}
</style>