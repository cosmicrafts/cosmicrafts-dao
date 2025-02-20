<template>
    <div class="roadmap-page">
      <h1>Roadmap</h1>
      <ul>
        <li v-for="milestone in milestones" :key="milestone.id">
          <h2>{{ milestone.title }} ({{ milestone.period }})</h2>
          <p>{{ milestone.description }}</p>
          <ul>
            <li v-for="task in milestone.tasks" :key="task.id">
              <strong>{{ task.title }}</strong>: {{ task.description }} - Status: {{ task.status }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useCanisterStore } from '@/stores/canister';
  
  export default {
    name: 'Roadmap',
    setup() {
      const milestones = ref([]);
  
      const fetchRoadmap = async () => {
        try {
            const canisterStore = useCanisterStore();
            const roadmapCanister = await canisterStore.get('roadmap');
            console.log('Roadmap Canister:', roadmapCanister);

            const fetchedMilestones = await roadmapCanister.getMilestones();
            console.log('Fetched Milestones:', fetchedMilestones);
            milestones.value = fetchedMilestones;
        } catch (error) {
            console.error('Error fetching roadmap:', error);
        }
        };

  
      onMounted(fetchRoadmap);
  
      return {
        milestones,
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

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(90deg, #08090c, #1d263c, #08090c);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

h2 {
  font-size: 1.5rem;
  color: #007bff;
  margin-bottom: 0.5rem;
}

p {
  color: #d1d9e6;
  margin-bottom: 1rem;
}

strong {
  color: #e0f7ff;
}
</style>
