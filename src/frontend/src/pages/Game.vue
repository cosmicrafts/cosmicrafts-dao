<template>
  <div class="game">
    <div class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans">
      <!-- Resource Bar -->
      <div class="flex justify-between items-center p-4 bg-gray-800 shadow-lg">
        <div class="flex items-center space-x-2">
          <!-- Energy Icon -->
          <img src="@/assets/icons/energy.svg" alt="Energy" class="w-6 h-6" />
          <span>Energy: {{ resources.energy }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Matter Icon -->
          <img src="@/assets/icons/matter.svg" alt="Matter" class="w-6 h-6" />
          <span>Credits: {{ resources.credits }}</span>
        </div>
      </div>

      <!-- Game Sections -->
      <div class="flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
        <!-- Buildings -->
        <div class="flex-1 bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-bold mb-4">Buildings</h2>
          <div class="flex items-center justify-between mb-4">
            <span>Mines: {{ buildings.mine }}</span>
            <img src="@/assets/icons/mine.svg" alt="Mine" class="w-8 h-8" />
          </div>
          <button 
            @click="buildMine"
            :disabled="resources.credits < 50"
            class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg disabled:bg-gray-500 transition-colors">
            Build Mine (50 Credits)
          </button>
        </div>

        <!-- Fleet -->
        <div class="flex-1 bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-bold mb-4">Fleet</h2>
          <div v-for="(ship, index) in fleet" :key="index" class="flex items-center justify-between mb-2">
            <span>Ship {{ index + 1 }}: {{ ship.type }} ({{ ship.health }} HP)</span>
            <img src="@/assets/icons/ship.svg" alt="Ship" class="w-8 h-8" />
          </div>
          <button 
            @click="buildShip"
            :disabled="resources.credits < 100"
            class="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg disabled:bg-gray-500 transition-colors">
            Build Scout (100 Credits)
          </button>
        </div>
      </div>

      <!-- Galaxy Map -->
      <div class="p-4">
        <GalaxyMap />
      </div>

      <!-- Alliance Manager -->
      <div class="p-4">
        <AllianceManager />
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStore } from '@/stores/game';
import { computed, onMounted } from 'vue';
import GalaxyMap from '@/components/GalaxyMap.vue'; // Import GalaxyMap
import AllianceManager from '@/components/AllianceManager.vue'; // Import AllianceManager

export default {
  components: { GalaxyMap, AllianceManager }, // Register components
  setup() {
    const gameStore = useGameStore();

    // Reactive state from Pinia store
    const resources = computed(() => gameStore.resources);
    const buildings = computed(() => gameStore.buildings);
    const fleet = computed(() => gameStore.fleet);

    // Actions from the store
    const buildMine = gameStore.buildMine;
    const buildShip = gameStore.buildShip;

    // Automate resource collection every 10 seconds
    onMounted(() => {
      setInterval(() => {
        gameStore.collectResources();
      }, 10000);
    });

    return {
      resources,
      buildings,
      fleet,
      buildMine,
      buildShip,
    };
  },
};
</script>

<style scoped>
.game {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  display: inline-block;
  vertical-align: middle;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* Resource Bar Icons (Energy and Matter) */
.flex.items-center img {
  width: 2rem; /* Set to 24px (smaller size) */
  height: 1rem;
}

.flex.items-center img:hover {
  transform: scale(2); /* Slight scaling for hover effect */
}

/* Section Icons (Mines and Fleet) */
.flex.items-center img.w-8 {
  width: 2rem; /* Set to 32px */
  height: 1rem;
}

.flex.items-center img.w-8:hover {
  transform: scale(2); /* Subtle scaling on hover */
}

/* Button Styling */
button {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

button:hover:enabled {
  transform: scale(1.05);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Section Box Styling (Buildings/Fleet) */
.bg-gray-700 {
  transition: transform 0.3s ease;
}

.bg-gray-700:hover {
  transform: translateY(-2px); /* Slight lift on hover */
}
</style>