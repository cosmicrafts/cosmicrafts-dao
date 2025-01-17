<template>
  <div class="component">
    <h2 class="text-xl font-bold mb-4 text-center">Galaxy Map</h2>
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="(location, key) in visibleLocations"
        :key="key"
        @click="travelToLocation(location)"
        :class="[
          'p-4 rounded-lg text-center cursor-pointer transition-colors',
          location ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800',
        ]"
      >
        <h3 v-if="location" class="font-bold">{{ location.name }}</h3>
        <p v-else class="text-gray-400">Empty Space</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '@/stores/game';

const gameStore = useGameStore();

// Compute visible locations around the player
const visibleLocations = computed(() => {
  const { x, y } = gameStore.player;
  const neighbors = [
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x + 1, y: y + 1 },
    { x: x - 1, y: y - 1 },
  ];

  return neighbors.reduce((acc, loc) => {
    const key = `${loc.x},${loc.y}`;
    acc[key] = gameStore.galaxyMap[key] || null; // Include only valid locations
    return acc;
  }, {});
});

// Travel to a specific location
const travelToLocation = (location) => {
  if (location) {
    gameStore.exploreLocation(location.x, location.y);
  } else {
    alert('You cannot travel to empty space!');
  }
};
</script>

<style scoped>
.component {
  width: 100%;
  background-color: #1f2937;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
</style>
