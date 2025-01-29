<script setup lang="ts">
import Phaser from 'phaser';
import { onMounted, onUnmounted, ref } from 'vue';
import { MainGame } from '@/pages/game/scenes/MainGame';
import { Events } from 'phaser';
import { EventBus } from '@/pages/game/EventBus';

const gameContainer = ref();
let game: Phaser.Game | null = null;

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameContainer.value,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
      mode: Phaser.Scale.RESIZE, // Ensures it fills the screen
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [new MainGame()], // ✅ No need for multiple scenes
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    }
  });

  window.addEventListener('resize', () => {
    if (game) {
      game.scale.resize(window.innerWidth, window.innerHeight);
    }
  });
});

onUnmounted(() => {
  if (game) {
    game.destroy(true);
    game = null;
  }
});
</script>

<template>
  <div id="game-container"></div>
</template>

<style scoped>
#game-container {
  width: 100vw;
  height: 100vh;
  position: fixed; /* Fix to viewport */
  top: 0;
  left: 0;
  overflow: hidden; /* Prevent any internal scrolling */
}
</style>
