<template>
      <div class="p-6 bg-gray-700 rounded-lg">
        <h2 class="text-xl font-bold mb-4">Alliances</h2>
        <input 
          v-model="allianceName" 
          placeholder="Enter alliance name" 
          class="p-2 bg-gray-600 rounded-lg w-full" 
        />
        <button 
          @click="createAlliance" 
          class="mt-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg">
          Create Alliance
        </button>
      </div>
    </template>
    
    <script setup>
    import { ref } from 'vue';
    import { useGameStore } from '@/stores/game';
    
    const gameStore = useGameStore();
    const allianceName = ref('');
    
    const createAlliance = () => {
      if (allianceName.value.trim()) {
        gameStore.createAlliance(allianceName.value.trim());
        allianceName.value = '';
      }
    };
    </script>
    