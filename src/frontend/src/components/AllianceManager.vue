<template>
      <div class="component">
        <h2 class="text-xl font-bold mb-4 text-center">Alliances</h2>
        <input 
          v-model="allianceName" 
          placeholder="Enter alliance name" 
          class="p-3 bg-gray-600 rounded-lg w-full mb-4 text-center" 
        />
        <button 
          @click="createAlliance" 
          class="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-bold">
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
    