<template>
  <button @click="resetCamera" class="reset-button">
    Reset Camera
  </button>
</template>

<script setup>
import { EventBus } from '@/pages/game/EventBus';

const resetCamera = () => {
  EventBus.emit('reset-camera'); // 📢 Send event to Phaser
};
</script>

<style scoped>
.reset-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background: #222;
  color: white;
  border: 1px solid white;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.reset-button:hover {
  opacity: 1;
}
</style>
