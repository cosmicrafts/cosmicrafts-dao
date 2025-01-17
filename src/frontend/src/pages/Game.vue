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

      <!-- Tabs -->
      <div class="tabs mt-16 p-4 space-y-4">
        <!-- Buildings Tab -->
        <div class="tab">
          <h2 class="text-xl font-bold text-center mb-4">Buildings</h2>
          <div class="p-6 bg-gray-700 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <span>Mines: {{ buildings.mine }}</span>
              <img src="@/assets/icons/mine.svg" alt="Mine" class="w-8 h-8" />
            </div>
            <button
              @click="buildMine"
              :disabled="resources.matter < 50"
              class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:bg-gray-500">
              Build Mine (50 Matter)
            </button>
          </div>
        </div>

        <!-- Fleet Tab -->
        <div class="tab">
          <h2 class="text-xl font-bold text-center mb-4">Fleet</h2>
          <div class="p-6 bg-gray-700 rounded-lg">
            <div v-for="(ship, index) in fleet" :key="index" class="flex items-center justify-between mb-2">
              <span>Ship {{ index + 1 }}: {{ ship.type }} ({{ ship.health }} HP)</span>
              <img src="@/assets/icons/ship.svg" alt="Ship" class="w-8 h-8" />
            </div>
            <button
              @click="buildShip"
              :disabled="resources.matter < 100"
              class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg disabled:bg-gray-500">
              Build Scout (100 Matter)
            </button>
          </div>
        </div>

        <!-- Galaxy Map Tab -->
        <div class="tab">
          <h2 class="text-xl font-bold text-center mb-4">Galaxy Map</h2>
          <div class="p-6 bg-gray-700 rounded-lg">
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="(location, index) in galaxyMap"
                :key="index"
                @click="explore(location)"
                class="p-4 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500 text-center">
                <h3 class="font-bold">{{ location.name }}</h3>
                <p class="text-sm text-gray-300">{{ location.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Alliances Tab -->
        <div class="tab">
          <h2 class="text-xl font-bold text-center mb-4">Alliances</h2>
          <div class="p-6 bg-gray-700 rounded-lg">
            <input
              v-model="allianceName"
              placeholder="Enter alliance name"
              class="p-2 bg-gray-600 rounded-lg w-full mb-4 text-center"
            />
            <button
              @click="createAlliance"
              class="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-bold">
              Create Alliance
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/stores/game';
import { computed, ref, onMounted } from 'vue';

export default {
  setup() {
    const gameStore = useGameStore();

    // Reactive state from Pinia store
    const resources = computed(() => gameStore.resources);
    const buildings = computed(() => gameStore.buildings);
    const fleet = computed(() => gameStore.fleet);
    const galaxyMap = computed(() => gameStore.galaxyMap);

    // Alliances
    const allianceName = ref('');

    // Actions from the store
    const buildMine = gameStore.buildMine;
    const buildShip = gameStore.buildShip;
    const explore = gameStore.explore;
    const createAlliance = () => {
      if (allianceName.value.trim()) {
        gameStore.createAlliance(allianceName.value.trim());
        allianceName.value = '';
      }
    };

    // Automate resource collection every 10 seconds
    onMounted(() => {
      if (!Object.keys(gameStore.galaxyMap).length) {
        gameStore.initializeGalaxy(42, 10); // Seed and range
      }
      setInterval(() => {
        gameStore.collectResources();
      }, 10000);
    });

    return {
      resources,
      buildings,
      fleet,
      galaxyMap,
      allianceName,
      buildMine,
      buildShip,
      explore,
      createAlliance,
    };
  },
};
</script>

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
