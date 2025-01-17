<template>
      <div class="p-6 bg-gray-700 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Galaxy Map</h2>
        <div class="grid grid-cols-3 gap-4">
          <div 
            v-for="(location, index) in galaxyMap" 
            :key="index" 
            @click="exploreLocation(location)"
            class="p-4 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500 transition-colors">
            <h3 class="font-bold">{{ location.name }}</h3>
            <p>{{ location.description }}</p>
          </div>
        </div>
      </div>
    </template>
    
    <script setup>
    import { ref } from 'vue';
    import { useGameStore } from '@/stores/game';
    
    const gameStore = useGameStore();
    
    const galaxyMap = ref([
      { name: 'Planet Alpha', description: 'Rich in Energy', type: 'planet' },
      { name: 'Asteroid Belt', description: 'Mine for Credits', type: 'asteroid' },
      { name: 'Space Anomaly', description: 'Unknown', type: 'anomaly' },
    ]);
    
    const exploreLocation = (location) => {
      if (gameStore.fleet.length > 0) {
        gameStore.explore(location);
      } else {
        alert('You need at least 1 ship to explore!');
      }
    };
    </script>
    