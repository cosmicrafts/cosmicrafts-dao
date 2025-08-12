<template>
  <div class="game-container">
    <div id="unity-container">
      <canvas id="unity-canvas"></canvas>
      <div v-if="showLoadingScreen" :class="['loading-screen', !loading ? 'fade-out' : '']">
        <img class="loader-preview-bg" src="@/assets/webp/cosmicrafts-2d.webp" alt="Cosmicrafts 2D Preview" />
        <div class="loader-overlay">
          <div class="loader-text">Loading Cosmicrafts 2D (2019)...</div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{width: `${displayProgress}%`}" />
            </div>
            <div class="progress-text">{{ displayProgress }}%</div>
          </div>
        </div>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
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

// Remap Unity's 0-0.60 progress to 0-100% (faster fill)
const displayProgress = computed(() => {
  const unityProgress = loadingProgress.value / 100;
  const maxUnityProgress = 0.60;
  let mapped = (unityProgress / maxUnityProgress) * 100;
  mapped = Math.min(Math.round(mapped), 100);
  return mapped;
});

// Fade out loading screen after loading is complete
const showLoadingScreen = ref(true);
watch(loading, (isLoading) => {
  if (!isLoading) {
    setTimeout(() => {
      showLoadingScreen.value = false;
    }, 600); // 600ms delay after loading is done
  } else {
    showLoadingScreen.value = true;
  }
});

// Unity build configuration for Cosmicrafts2D
const buildUrl = '/Cosmicrafts2D/';
const config = {
  loaderUrl: buildUrl + 'Cosmicrafts2D.loader.js',
  dataUrl: buildUrl + 'Cosmicrafts2D.data.br',
  frameworkUrl: buildUrl + 'Cosmicrafts2D.framework.js.br',
  codeUrl: buildUrl + 'Cosmicrafts2D.wasm.br',
  streamingAssetsUrl: 'StreamingAssets',
  companyName: 'World of Unreal',
  productName: 'Cosmicrafts2D', 
  productVersion: '1.0.0',
};

onMounted(async () => {
  // Track game page load
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'game_page_loaded', {
      game: 'cosmicrafts_2d',
      game_type: 'unity_webgl',
      game_category: 'classic'
    });
  }
  
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
      
      // Track Unity game events
      if (typeof window.clarity !== 'undefined') {
        window.clarity('event', 'unity_game_event', {
          game: 'cosmicrafts_2d',
          event_name: name,
          event_args: args
        });
      }
    };
    
    // Set up event listeners
    unityContext.value
      .on('progress', (progress: number) => {
        loadingProgress.value = progress * 100;
        
        // Track loading progress milestones
        if (typeof window.clarity !== 'undefined' && progress > 0.5 && progress < 0.51) {
          window.clarity('event', 'game_loading_milestone', {
            game: 'cosmicrafts_2d',
            progress: Math.round(progress * 100),
            milestone: '50_percent_loaded'
          });
        }
      })
      .on('error', (message: string) => {
        console.error('Unity error:', message);
        error.value = 'Error loading Cosmicrafts 2D (2019): ' + message;
        
        // Track game loading error
        if (typeof window.clarity !== 'undefined') {
          window.clarity('event', 'game_loading_error', {
            game: 'cosmicrafts_2d',
            error: message
          });
        }
      })
      .on('mounted', () => {
        loading.value = false;
        window.gameInstance = unityContext.value;
        
        // Track successful game load
        if (typeof window.clarity !== 'undefined') {
          window.clarity('event', 'game_loaded_successfully', {
            game: 'cosmicrafts_2d',
            load_time: Date.now()
          });
        }
      });
    
  } catch (err: any) {
    error.value = 'Error initializing Cosmicrafts 2D (2019): ' + (err.message || err);
    console.error('Unity initialization error:', err);
    
    // Track initialization error
    if (typeof window.clarity !== 'undefined') {
      window.clarity('event', 'game_initialization_error', {
        game: 'cosmicrafts_2d',
        error: err.message || err
      });
    }
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
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  pointer-events: all;
}
.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loader-preview-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  filter: brightness(0.7);
}

.loader-overlay {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 18px 0 16px 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.2) 100%, rgba(0,0,0,0));
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.loader-text {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 210, 255, 0.7);
}

.progress-container {
  width: 80%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%);
  transition: width 0.15s ease-out;
  border-radius: 4px;
  box-shadow: 0 0 12px rgba(0, 210, 255, 0.6);
}

.progress-text {
  font-size: 1rem;
  font-weight: 500;
  color: #00d2ff;
  text-shadow: 0 0 8px rgba(0, 210, 255, 0.7);
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4d4d;
  font-size: 1.2rem;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px 30px;
  border-radius: 10px;
  border: 1px solid #ff4d4d;
  z-index: 10;
  text-align: center;
  max-width: 80%;
}
</style> 