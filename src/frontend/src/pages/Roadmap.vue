<template>
  <div class="roadmap-page">
    <h1>Roadmap</h1>

    <div v-for="(quarter, index) in quarters" :key="index" class="quarter">
      <div class="quarter-header" @click="toggleQuarter(index)">
        <h2>{{ quarter.period }}</h2>
        <span class="icon">{{ quarter.open ? '-' : '+' }}</span>
      </div>

      <div v-if="quarter.open" class="milestones">
        <div v-for="milestone in quarter.milestones" :key="milestone.id" class="milestone">
          <div class="milestone-header" @click="toggleMilestone(milestone)">
            <h3>{{ milestone.title }}</h3>
            <span class="icon">{{ milestone.open ? '-' : '+' }}</span>
          </div>

          <div v-if="milestone.open" class="tasks">
            <ul>
              <li v-for="task in milestone.tasks" :key="task.id">
                <strong>{{ task.title }}</strong>: {{ task.description }} - <span class="status">{{ task.status }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useCanisterStore } from '@/stores/canister';

export default {
  name: 'Roadmap',
  setup() {
    const quarters = ref([]);

    const organizeByQuarter = (milestones) => {
      const grouped = milestones.reduce((acc, milestone) => {
        if (!acc[milestone.period]) acc[milestone.period] = [];
        acc[milestone.period].push({ ...milestone, open: false });
        return acc;
      }, {});

      return Object.keys(grouped).map((period) => ({
        period,
        milestones: grouped[period],
        open: false,
      }));
    };

    const fetchRoadmap = async () => {
      try {
        const canisterStore = useCanisterStore();
        const roadmapCanister = await canisterStore.get('roadmap');
        const fetchedMilestones = await roadmapCanister.getMilestones();
        quarters.value = organizeByQuarter(fetchedMilestones);
      } catch (error) {
        console.error('Error fetching roadmap:', error);
      }
    };

    const toggleQuarter = (index) => {
      quarters.value[index].open = !quarters.value[index].open;
    };

    const toggleMilestone = (milestone) => {
      milestone.open = !milestone.open;
    };

    onMounted(fetchRoadmap);

    return {
      quarters,
      toggleQuarter,
      toggleMilestone,
    };
  },
};
</script>

<style scoped>
.roadmap-page {
  color: var(--font-color);
  background-color: var(--background-color);
  padding: 2rem;
  line-height: 1.5;
}

h1 {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #89c0ff;
  text-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5);
}

.quarter {
  border: 1px solid #007bff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.quarter-header {
  background: linear-gradient(90deg, #08090c, #1d263c);
  color: #fff;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.milestones {
  padding: 1rem;
  background: #1d263c;
}

.milestone {
  border: 1px solid #e0f7ff;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.milestone-header {
  padding: 0.8rem;
  background: #007bff;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tasks li {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e0f7ff;
}

.tasks li:last-child {
  border-bottom: none;
}

.status {
  color: #89c0ff;
}

.icon {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
