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
</script>

<style scoped>
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
}

/* Ensure the canvas takes up the full size of the .game container */
#game-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>