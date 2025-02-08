<template>
  <!-- The outer container covers the full screen -->
  <div class="cinematic-container" @click="skipCinematic">
    <!-- Lottie animation container -->
    <div class="lottie-container" ref="lottieContainer"></div>
    <!-- A Skip button to explicitly skip the cinematic -->
    <button class="skip-button" @click.stop="skipCinematic">Skip</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import lottie from 'lottie-web';
import cinematicAnimationData from '@/assets/cinematic.json'; // adjust the path if necessary

// Create a ref for the Lottie container.
const lottieContainer = ref<HTMLElement | null>(null);
// Declare lottieInstance at the top so it is available in all functions.
let lottieInstance: any = null;

/**
 * Function to skip the cinematic.
 * This function is called when the cinematic completes or when the user clicks anywhere (or the Skip button).
 */
function skipCinematic() {
  // Destroy the Lottie instance if it exists.
  if (lottieInstance) {
    lottieInstance.destroy();
  }
  // Insert your own logic here.
  // For example, you could navigate to a new route, emit an event, or simply hide this component.
  console.log('Cinematic skipped or complete.');
  // Example: if using vue-router, you might do:
  // router.push('/nextRoute')
}

onMounted(() => {
  if (lottieContainer.value) {
    // Load the cinematic Lottie animation.
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value, // The DOM element that will contain the animation
      renderer: 'svg',
      loop: false,      // Do not loop; the cinematic plays once
      autoplay: true,   // Automatically play the animation
      animationData: cinematicAnimationData,
    });
    // When the animation completes, call skipCinematic.
    lottieInstance.addEventListener('complete', () => {
      skipCinematic();
    });
  }
});

onBeforeUnmount(() => {
  if (lottieInstance) {
    lottieInstance.destroy();
  }
});
</script>

<style scoped>
.cinematic-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* Background can be black or any color you want for the cinematic */
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 1000;
}

.lottie-container {
  width: 100%;
  height: 100%;
  /* Optional: adjust object-fit if needed */
  object-fit: cover;
}

.skip-button {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
  font-size: 1rem;
  transition: background 0.2s;
}

.skip-button:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>
