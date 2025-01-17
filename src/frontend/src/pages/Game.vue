<template>
  <div class="game">
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
      <!-- Resource Bar -->
      <div class="fixed top-0 left-0 w-full bg-gray-800 shadow-lg z-10">
        <div class="flex justify-between items-center p-4">
          <div class="flex items-center space-x-2">
            <img src="@/assets/icons/energy.svg" alt="Energy" class="w-6 h-6" />
            <span>Energy: {{ resources.energy }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <img src="@/assets/icons/matter.svg" alt="Matter" class="w-6 h-6" />
            <span>Matter: {{ resources.matter }}</span>
          </div>
        </div>
      </div>

      <!-- Galaxy Map -->
      <div class="tabs mt-16 p-4 space-y-4">
        <div class="tab">
          <h2 class="text-xl font-bold text-center mb-4">Galaxy Map</h2>
          <div class="p-6 bg-gray-700 rounded-lg">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/stores/game';
import { computed, onMounted } from 'vue';

export default {
  setup() {
    const gameStore = useGameStore();

    // Reactive state from Pinia store
    const resources = computed(() => gameStore.resources);

    // Compute visible locations dynamically
    const visibleLocations = computed(() => {
      const { x, y } = gameStore.player;
      const neighbors = [
        { x: x, y: y + 1 },
        { x: x, y: y - 1 },
        { x: x + 1, y: y },
        { x: x - 1, y: y },
      ];

      return neighbors.reduce((acc, loc) => {
        const key = `${loc.x},${loc.y}`;
        acc[key] = gameStore.galaxyMap[key] || null;
        return acc;
      }, {});
    });

    // Initialize galaxy on first mount
    onMounted(() => {
      if (!Object.keys(gameStore.galaxyMap).length) {
        gameStore.initializeGalaxy(42, 10); // Seed and range
      }
    });

    // Handle travel to a new location
    const travelToLocation = (location) => {
      if (location) {
        const [x, y] = location.name.match(/\(([^)]+)\)/)[1].split(',').map(Number); // Extract coordinates from name
        gameStore.exploreLocation(x, y);
      } else {
        alert('You cannot travel to empty space!');
      }
    };

    return {
      resources,
      visibleLocations,
      travelToLocation,
    };
  },
};
</script>
z

<style scoped>
/* General Game Container */
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Fixed Resource Bar */
.fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #000000a2;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  z-index: 100;
}

/* Tabs Container */
.tabs {
  padding-top: 5.5rem; /* Offset for the fixed header */
  display: flex;
  flex-direction: column;
  gap: .25rem;
  padding-bottom: 6rem;
  width: 100vw;
}

/* Individual Tab Section */
.tab {
  vertical-align: middle;
  padding: 2rem;
  background-color: #272e38; /* Dark background for sections */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Subtle depth */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tab:hover {
  transform: translateY(-2px); /* Lift effect on hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* Stronger shadow on hover */
}

/* Section Headings */
.tab h2 {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: #ffffff;
}

/* Buttons */
button {
  margin-top: 1rem;
  width: 100%; /* Full width for touch usability */
  padding: 12px;
  font-size: 1rem; /* Legible text size */
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 8px;
  background: #008cff; /* Default blue */
  transition: background 0.2s ease, transform 0.2s ease;
}

button:hover:enabled {
  background: rgb(69, 159, 255); /* Darker blue on hover */
  transform: scale(1.02); /* Slight scale for feedback */
}

button:disabled {
  background: #a8a8a8;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Inputs */
input {
  width: 100%; /* Full width for mobile */
  padding: 12px;
  font-size: 1rem;
  color: white;
  background: #252a33; /* Darker gray background */
  border: none;
  border-radius: 8px;
  text-align: center;
}

input::placeholder {
  color: #a0aec0; /* Light gray for placeholder text */
}

/* Icons */
img {
  display: inline-block;
  vertical-align: middle;
  width: 4rem; /* Consistent size for icons */
  height: 2rem;
  transition: transform 0.35s ease-out;
}

img:hover {
  transform: scale(2);
  transform: translateY(-8px);

}

/* Grid Items (Galaxy Map Locations) */
.grid {
  display: grid;
  grid-template-columns: 1fr; /* Single-column layout for mobile */
  gap: 16px;
}

.grid div {
  padding: 12px;
  background: #4a5568; /* Slightly lighter gray */
  border-radius: 8px;
  text-align: center;
  transition: background 0.2s ease, transform 0.2s ease;
}

.grid div:hover {
  background: #2d3748; /* Darker background on hover */
  transform: scale(1.02); /* Slight scaling for interaction */
}

.grid h3 {
  font-size: 1rem; /* Clear text for titles */
  font-weight: bold;
  color: #edf2f7; /* Light gray text */
}

.grid p {
  font-size: 0.875rem; /* Smaller text for descriptions */
  color: #a0aec0; /* Muted gray for details */
}
</style>
