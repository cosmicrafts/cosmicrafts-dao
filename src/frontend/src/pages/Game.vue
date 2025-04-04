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
  }
}

// Define interfaces for auth store types
interface AddressInfo {
  index: number;
  principalId: string;
  publicKey: string;
  name: string;
}

const loading = ref(true);
const loadingProgress = ref(0);
const error = ref<string | null>(null);
const unityContext = ref<any>(null);
const authStore = useAuthStore();

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

// Function to send auth data to Unity
const sendAuthDataToUnity = () => {
  if (!unityContext.value) return;
  
  try {
    // Get current user authentication data
    const currentAddress = authStore.currentAddress as AddressInfo | null;
    
    const authData = {
      authenticated: authStore.authenticated,
      registered: authStore.registered,
      principalId: currentAddress?.principalId || '',
      publicKey: currentAddress?.publicKey || '',
      seedPhrase: authStore.seedPhrase || '', // Be careful with sending seed phrase
      playerData: authStore.player ? JSON.stringify(authStore.player) : ''
    };
    
    console.log('Sending auth data to Unity');
    
    // Send authentication data to Unity
    unityContext.value.sendMessage('AuthenticationManager', 'ReceiveAuthData', JSON.stringify(authData));
    
    // You can also send individual pieces of data if needed
    if (currentAddress?.principalId) {
      unityContext.value.sendMessage('AuthenticationManager', 'SetPrincipalId', currentAddress.principalId);
    }
    
    if (authStore.player) {
      unityContext.value.sendMessage('AuthenticationManager', 'SetPlayerData', JSON.stringify(authStore.player));
    }
  } catch (err) {
    console.error('Error sending auth data to Unity:', err);
  }
};

onMounted(async () => {
  try {
    // Create the Unity WebGL instance
    unityContext.value = new UnityWebgl('#unity-canvas', config);
    
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
        
        // Once Unity is loaded, send the auth data
        setTimeout(() => sendAuthDataToUnity(), 1000);
      });
    
    // Register methods for Unity to call
    unityContext.value.addUnityListener('requestAuthData', () => {
      console.log('Unity requested auth data');
      sendAuthDataToUnity();
    });
    
    unityContext.value.addUnityListener('logoutRequested', () => {
      console.log('Unity requested logout');
      authStore.logout().then(() => {
        console.log('Logged out successfully');
      }).catch(err => {
        console.error('Logout error:', err);
      });
    });
    
    unityContext.value.addUnityListener('savePlayerData', (playerDataJson: string) => {
      console.log('Saving player data from Unity:', playerDataJson);
      try {
        const playerData = JSON.parse(playerDataJson);
        // Implement saving player data to your backend
        console.log('Player data received from Unity:', playerData);
      } catch (err) {
        console.error('Error parsing player data from Unity:', err);
      }
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
