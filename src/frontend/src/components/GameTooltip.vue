<template>
    <div v-if="visible" class="game-tooltip" :style="tooltipStyle">
      <p v-for="(line, index) in content" :key="index">{{ line }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { EventBus } from '@/pages/game/EventBus';
  
  const visible = ref(false);
  const content = ref([]);
  const mouseX = ref(0);
  const mouseY = ref(0);
  
  const tooltipStyle = computed(() => ({
    left: `${mouseX.value + 20}px`,
    top: `${mouseY.value + 20}px`,
  }));
  
  const updateTooltip = ({ x, y, data }) => {
    mouseX.value = x;
    mouseY.value = y;
    content.value = data;
    visible.value = true;
  };
  
  const hideTooltip = () => {
    visible.value = false;
  };
  
  onMounted(() => {
    EventBus.on('show-tooltip', updateTooltip);
    EventBus.on('hide-tooltip', hideTooltip);
  });
  
  onUnmounted(() => {
    EventBus.off('show-tooltip', updateTooltip);
    EventBus.off('hide-tooltip', hideTooltip);
  });
  </script>
  
  <style scoped>
  .game-tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 5px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
  }
  </style>
  