<template>
  <div class="game-container">
    <div id="unity-container">
      <canvas id="unity-canvas"></canvas>
      <div v-if="loading" class="loading-screen">
        <div class="loader-text">Cargando Juego...</div>
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
import { useAuthStore } from '@/stores/auth';
import UnityWebgl from 'unity-webgl';

// Define types for Unity communication
declare global {
  interface Window {
    gameInstance?: any;
    dispatchUnityEvent: (name: string, ...args: any[]) => void;
    sendSeedPhraseToUnity: () => void;
    listUnityGameObjects: () => void;
  }
}

// Initialize auth store
const authStore = useAuthStore();

const loading = ref(true);
const loadingProgress = ref(0);
const error = ref<string | null>(null);
const unityContext = ref<any>(null);

// Unity build configuration: update these as needed
const buildUrl = '/Cosmicrafts/';
const config = {
  loaderUrl: buildUrl + 'Cosmicrafts.loader.js',
  dataUrl: buildUrl + 'Cosmicrafts.data.br',
  frameworkUrl: buildUrl + 'Cosmicrafts.framework.js.br',
  codeUrl: buildUrl + 'Cosmicrafts.wasm.br',
  streamingAssetsUrl: 'StreamingAssets',
  companyName: 'World of Unreal',
  productName: 'Cosmicrafts', 
  productVersion: '1.0.1',
};

// Function to send seed phrase to Unity
const sendSeedPhraseToUnity = () => {
  if (!unityContext.value) {
    console.error('Unity context not initialized when trying to send seed phrase');
    return;
  }
  
  try {
    const seedPhrase = authStore.seedPhrase || '';
    console.log('Sending seed phrase to Unity');
    
    // Based on the Unity logs, only ICPService.SetSeedPhrase is working properly
    // Send directly to ICPService which is the component that actually needs and uses the seed phrase
    unityContext.value.sendMessage('ICPService', 'SetSeedPhrase', seedPhrase);
    console.log('Sent seed phrase to ICPService.SetSeedPhrase');
    
  } catch (err) {
    console.error('Error sending seed phrase to Unity:', err);
  }
};

onMounted(async () => {
  try {
    // Create the Unity WebGL instance
    unityContext.value = new UnityWebgl('#unity-canvas', config);
    
    // Attach the sendSeedPhraseToUnity function to the window object
    window.sendSeedPhraseToUnity = sendSeedPhraseToUnity;
    
    // Add a function to list active GameObjects for debugging
    window.listUnityGameObjects = () => {
      console.log('Unity requested to list GameObjects - this is just a stub in the web app');
    };
    
    // Add a generic event dispatcher for Unity
    window.dispatchUnityEvent = (name, ...args) => {
      console.log(`Unity dispatched event: ${name}`, args);
      if (name === 'requestSeedPhrase') {
        sendSeedPhraseToUnity();
      }
    };
    
    // Set up event listeners
    unityContext.value
      .on('progress', (progress: number) => {
        console.log('Unity loading progress:', progress);
        loadingProgress.value = progress * 100;
      })
      .on('error', (message: string) => {
        console.error('Unity error:', message);
        error.value = 'Error al cargar el juego: ' + message;
      })
      .on('mounted', () => {
        console.log('Unity WebGL instance mounted successfully');
        loading.value = false;
        window.gameInstance = unityContext.value;
        
        // According to unity-webgl docs, only send messages after Unity is mounted
        // Wait a moment to ensure Unity has fully initialized its GameObjects
        setTimeout(() => {
          console.log('Attempting to send seed phrase after Unity mount');
          sendSeedPhraseToUnity();
        }, 2000); // Give Unity more time to initialize (2 seconds)
      });
    
      
    // Register methods for Unity to call
    unityContext.value.addUnityListener('requestSeedPhrase', () => {
      console.log('Unity requested seed phrase');
      sendSeedPhraseToUnity();
    });
    
    unityContext.value.addUnityListener('logoutRequested', () => {
      console.log('Unity requested logout');
      authStore.logout().then(() => {
        console.log('Logged out successfully');
      }).catch(err => {
        console.error('Logout error:', err);
      });
    });
    
  } catch (err: any) {
    error.value = 'Error al inicializar el juego: ' + (err.message || err);
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
