<template>
  <div v-if="visible" :style="tooltipStyle" class="game-tooltip">
    <p><strong>Type:</strong> {{ tooltipData.type }}</p>
    <p><strong>Health:</strong> {{ tooltipData.health }}</p>
    <p><strong>Owner:</strong> {{ tooltipData.owner }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { EventBus } from '@/pages/game/EventBus';

const visible = ref(false);
const tooltipData = ref({ type: '', health: '', owner: '' });
const mousePosition = ref({ x: 0, y: 0 });

const tooltipStyle = computed(() => ({
  position: 'absolute',
  top: `${mousePosition.value.y + 10}px`,  // 👈 Tooltip appears slightly below the cursor
  left: `${mousePosition.value.x + 15}px`, // 👈 Slight offset to the right
  background: '#242D44',
  color: '#FFF',
  padding: '8px',
  borderRadius: '5px',
  fontSize: '14px',
  pointerEvents: 'none',
  zIndex: 1000
}));

// Track mouse movement to update position dynamically
const updateMousePosition = (event) => {
  mousePosition.value = { x: event.clientX, y: event.clientY };
};

onMounted(() => {
  EventBus.on('show-tooltip', (data) => {
    tooltipData.value = data;
    visible.value = true;
  });

  EventBus.on('hide-tooltip', () => {
    visible.value = false;
  });

  window.addEventListener('mousemove', updateMousePosition); // 👈 Listen for mouse movement
});

onUnmounted(() => {
  EventBus.off('show-tooltip');
  EventBus.off('hide-tooltip');
  window.removeEventListener('mousemove', updateMousePosition); // 👈 Cleanup
});
</script>

<style scoped>
.game-tooltip {
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
