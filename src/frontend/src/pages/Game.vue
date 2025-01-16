<!-- File: src/pages/Game.vue -->

<template>
      
      <div class="game-page">
            <Starfield class="background-starfield" />
        <!-- Title of the overall event -->
        <!-- Display the current event -->
    <h1>{{ currentScene.title }}</h1>
    <p>{{ currentScene.narrative }}</p>

    <!-- Action buttons -->
    <div class="actions">
      <button
        v-for="action in currentScene.actions"
        :key="action.label"
        @click="goToNextScene(action.next)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
    </template>
    
    <script setup>
    import { ref, computed } from 'vue';
    import { generateEvent } from '@/utils/generateEvent';
    import Starfield from "@/components/Starfield.vue";
    
    // Initialize the first scene dynamically
    const currentSceneKey = ref("root");
    const scenes = ref({
      root: generateEvent(), // Generate the root scene
    });
    
    // Compute the current scene based on the key
    const currentScene = computed(() => scenes.value[currentSceneKey.value]);
    
    // Move to the next scene
    function goToNextScene(nextKey) {
      if (!scenes.value[nextKey]) {
        // If the next scene doesn't exist, generate it dynamically
        scenes.value[nextKey] = generateEvent(currentScene.value);
      }
      currentSceneKey.value = nextKey; // Update the current key to the new scene
    }
    </script>
    
    <style scoped>
      .background-starfield {
      position: absolute; /* Ensure the Starfield stays in the background */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1; 
    }
    .game-page {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
    }
    .actions button {
      margin-top: 1rem;
      margin-right: 1rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
      }
    </style>
    