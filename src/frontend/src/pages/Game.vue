<template>
  <div class="game-container">
    <canvas id="unity-canvas"></canvas>
    <div v-if="loading" class="loading-screen">Cargando Juego...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Declare global function and extend the Window interface:
declare const createUnityInstance: (canvas: Element | null, config: any) => Promise<any>;

declare global {
  interface Window {
    gameInstance?: any;
  }
}

const loading = ref(true);
const error = ref<string | null>(null);

// Unity build configuration: update these as needed.
const buildUrl = '/Cosmicrafts/';  // Absolute path to your Unity build folder in public
const config = {
  dataUrl: buildUrl + 'Cosmicrafts.data.br',
  frameworkUrl: buildUrl + 'Cosmicrafts.framework.js.br',
  codeUrl: buildUrl + 'Cosmicrafts.wasm.br',  // The Unity loader will handle Brotli decompression automatically
  streamingAssetsUrl: 'StreamingAssets',
  companyName: 'YourCompany',    // Replace with your company name
  productName: 'Cosmicrafts',      // Replace with your product name
  productVersion: '1.0',
};

onMounted(async () => {
  try {
    // Dynamically create a script element to load the Unity loader
    const script = document.createElement('script');
    script.src = '/Cosmicrafts/Cosmicrafts.loader.js';  // Absolute path from public folder
    script.async = true;
    script.onload = () => {
      // Check if the global createUnityInstance function is available.
      if (typeof createUnityInstance === 'function') {
        // Create the Unity instance on the canvas with id "unity-canvas"
        createUnityInstance(document.querySelector('#unity-canvas'), config)
          .then((unityInstance: any) => {
            loading.value = false;
            // Optionally store the instance on window for later use.
            window.gameInstance = unityInstance;
            console.log('Juego cargado exitosamente!', unityInstance);
          })
          .catch((err: any) => {
            error.value = 'Error al cargar el juego: ' + err;
            console.error(err);
          });
      } else {
        error.value = 'createUnityInstance no está disponible en el loader.';
        console.error('createUnityInstance no encontrado en Cosmicrafts.loader.js');
      }
    };
    script.onerror = () => {
      error.value = 'Error al cargar el loader de Unity.';
      console.error('No se pudo cargar Cosmicrafts.loader.js');
    };
    document.head.appendChild(script);
  } catch (err: any) {
    error.value = 'Error al importar el loader de Unity.';
    console.error(err);
  }
});
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  position: relative;
}

#unity-canvas {
  width: 100%;
  height: 100%;
}

.loading-screen {
  position: absolute;
  color: white;
  font-size: 2rem;
  z-index: 10;
}

.error-message {
  position: absolute;
  color: red;
  font-size: 1.5rem;
  z-index: 10;
}
</style>
