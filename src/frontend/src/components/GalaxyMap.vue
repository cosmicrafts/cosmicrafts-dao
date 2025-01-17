<template>
      <div class="component">
        <h2 class="text-xl font-bold mb-4 text-center">Galaxy Map</h2>
        <div class="grid gap-4">
          <div 
            v-for="(location, index) in galaxyMap" 
            :key="index" 
            @click="exploreLocation(location)"
            class="p-4 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500 transition-colors text-center">
            <h3 class="font-bold">{{ location.name }}</h3>
            <p class="text-sm text-gray-300">{{ location.description }}</p>
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
    
    <style scoped>
    .component {
      width: 100%; /* Full width for mobile */
      background-color: #1f2937; /* Dark gray background */
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      overflow-y: auto; /* Allow vertical scrolling */
    }
    </style>
    