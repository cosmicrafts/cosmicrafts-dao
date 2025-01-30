<<<<<<< HEAD
<template>
  <div class="game">
    <canvas id="game-canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "GameView",
  setup() {
    onMounted(async () => {
      try {
        // Dynamically import the Wasm module
        const wasmModule = await import("@/assets/game.js");

        // Initialize the Wasm module
        await wasmModule.default();

        // Call your exported Rust function to start the game
        wasmModule.start_game();

        console.log("WASM game initialized successfully!");
      } catch (error) {
        console.error("Failed to load or initialize WASM game:", error);
      }
    });
  },
};
=======
<script setup lang="ts">
import ResetCameraButton from '@/components/ResetCameraButton.vue';
import Phaser from 'phaser';
import { onMounted, onUnmounted, ref } from 'vue';
import { MainGame } from '@/pages/game/scenes/MainGame';
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
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MainGame],
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
>>>>>>> Vue
</script>

<template>
  <div id="game-container" ref="gameContainer"></div>
  <ResetCameraButton />
</template>

<style scoped>
<<<<<<< HEAD
/* Ensure the .game container takes up the full viewport without causing overflow */
.game {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent scrolling */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
=======
#game-container {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    pointer-events: all;
>>>>>>> Vue
}

/* Ensure the canvas takes up the full size of the .game container */
#game-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>