<template>
    <div class="fps-display">
      FPS: {{ fps }}
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { EventBus } from '@/pages/game/EventBus';
  
  const fps = ref("0");
  
  const updateFPSHandler = (newFps: string) => {
    fps.value = newFps;
  };
  
  onMounted(() => {
    EventBus.on('update-fps', updateFPSHandler);
  });
  
  onUnmounted(() => {
    EventBus.off('update-fps', updateFPSHandler);
  });
  </script>
  
  <style scoped>
  .fps-display {
    position: fixed;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    color: #00FF00;
    font-family: Arial, sans-serif;
    font-size: 14px;
    padding: 5px 10px;
    border: 1px solid #fff;
    border-radius: 3px;
    z-index: 1000;
  }
  </style>
  