<template>
  <div class="game-container">
    <div id="unity-container">
      <canvas id="unity-canvas"></canvas>
      <div v-if="loading" class="loading-screen">
        <div class="loader-text">Loading Cosmicrafts Alpha 2021...</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{width: `${loadingProgress}%`}"></div>
        </div>
        <div class="progress-text">{{ Math.round(loadingProgress) }}%</div>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import UnityWebgl from 'unity-webgl';

// Define types for Unity communication
declare global {
  interface Window {
    gameInstance?: any;
    dispatchUnityEvent: (name: string, ...args: any[]) => void;
    listUnityGameObjects: () => void;
  }
}

const loading = ref(true);
const loadingProgress = ref(0);
const error = ref<string | null>(null);
const unityContext = ref<any>(null);

// Unity build configuration for Cosmicrafts2021
const buildUrl = '/Cosmicrafts2021/';
const config = {
  loaderUrl: buildUrl + 'Cosmicrafts2021.loader.js',
  dataUrl: buildUrl + 'Cosmicrafts2021.data.br',
  frameworkUrl: buildUrl + 'Cosmicrafts2021.framework.js.br',
  codeUrl: buildUrl + 'Cosmicrafts2021.wasm.br',
  streamingAssetsUrl: 'StreamingAssets',
  companyName: 'World of Unreal',
  productName: 'Cosmicrafts Alpha 2021', 
  productVersion: '1.0.0',
};

onMounted(async () => {
  try {
    // Create the Unity WebGL instance
    unityContext.value = new UnityWebgl('#unity-canvas', config);
    
    // Add a function to list active GameObjects for debugging
    window.listUnityGameObjects = () => {
      console.log('Unity requested to list GameObjects - this is just a stub in the web app');
    };
    
    // Add a generic event dispatcher for Unity
    window.dispatchUnityEvent = (name, ...args) => {
      console.log(`Unity dispatched event: ${name}`, args);
    };
    
    // Set up event listeners
    unityContext.value
      .on('progress', (progress: number) => {
        console.log('Unity loading progress:', progress);
        loadingProgress.value = progress * 100;
      })
      .on('error', (message: string) => {
        console.error('Unity error:', message);
        error.value = 'Error loading Cosmicrafts Alpha 2021: ' + message;
      })
      .on('mounted', () => {
        console.log('Cosmicrafts Alpha 2021 Unity WebGL instance mounted successfully');
        loading.value = false;
        window.gameInstance = unityContext.value;
      });
    
  } catch (err: any) {
    error.value = 'Error initializing Cosmicrafts Alpha 2021: ' + (err.message || err);
    console.error('Unity initialization error:', err);
  }
});

onUnmounted(() => {
  // Clean up Unity instance when component is unmounted
  if (unityContext.value) {
    unityContext.value.unload().catch((err: any) => {
      console.error('Error unloading Unity:', err);
    });
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

#unity-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#unity-canvas {
  width: 100%;
  height: 100%;
  background-color: #231F20;
}

.loading-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 10;
}

.loader-text {
  font-size: 2rem;
  margin-bottom: 20px;
}

.progress-bar {
  width: 80%;
  height: 30px;
  background-color: #333;
  border-radius: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 10px;
  font-size: 1.2rem;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: red;
  font-size: 1.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  z-index: 10;
}
</style> 