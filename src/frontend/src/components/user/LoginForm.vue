<!-- File: components/user/LoginForm.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';
import LoadingScreen from '@/components/media/LoadingScreen.vue';
import AccountRecovery from '@/components/user/AccountRecovery.vue';

const authStore = useAuthStore();
const modalStore = useModalStore();
const { t } = useI18n();

const loading = ref(false);
const errorMessage = ref(null);
const showRecoverySection = ref(false);

// Common post-login processing
const handleAfterLogin = async () => {
  // Ensure addresses are initialized for the current account
  if (!authStore.derivedAddresses || authStore.derivedAddresses.length === 0) {
    try {
      // Generate the first address if none exists
      await authStore.generateNewAddress();
    } catch (error) {
      console.error('Error initializing addresses:', error);
    }
  }
  
  // Save state to ensure persistence
  authStore.saveStateToLocalStorage();
  
  // Close the login modal
  modalStore.closeModal();
};

// Unified login method handler to ensure consistent behavior
const handleLogin = async (loginMethod, ...args) => {
  loading.value = true;
  errorMessage.value = null;
  
  try {
    console.log(`Starting login process with method: ${loginMethod.name}`);
    const result = await loginMethod(...args);
    console.log('Login method completed successfully', result);
    
    // Ensure we have addresses - this needs to happen AFTER authentication is complete
    await handleAfterLogin();
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = error.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleGuestLogin = async () => {
  await handleLogin(authStore.createGuestAccount);
};

const onGoogleClick = () => {
  window.google.accounts.id.prompt();
};

const openAccountRecoveryModal = () => {
  // Switch to directly showing the recovery section in the modal
  showRecoverySection.value = true;
};

// Main authentication methods (buttons with text)
const mainMethods = [
  {
    logo: new URL('@/assets/icons/wouid_icon.svg', import.meta.url).href,
    text: t('login.guestAccount'),
    onClick: handleGuestLogin,
  },
  {
    logo: new URL('@/assets/icons/icp.svg', import.meta.url).href,
    text: t('login.internetIdentity'),
    onClick: () => handleLogin(authStore.loginWithInternetIdentity.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/google_logo.svg', import.meta.url).href,
    text: t('login.google'),
    onClick: onGoogleClick,
  },
];

// For Metamask specifically, we need to handle the login flow differently
const handleMetaMaskLogin = async () => {
  loading.value = true;
  errorMessage.value = null;
  
  try {
    console.log('Starting MetaMask login process');
    // Use a specific timeout for MetaMask as it can take longer
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('MetaMask login timed out. Please try again.')), 30000)
    );
    
    const loginPromise = authStore.loginWithMetaMask();
    
    // Race the login against the timeout
    const result = await Promise.race([loginPromise, timeoutPromise]);
    console.log('MetaMask login completed successfully', result);
    
    // Call handleAfterLogin to properly handle post-login actions including modal closing
    await handleAfterLogin();
  } catch (error) {
    console.error('MetaMask login failed:', error);
    errorMessage.value = error.message || 'MetaMask login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Secondary methods (icon-only buttons)
const secondaryMethods = [
  {
    logo: new URL('@/assets/icons/metaMask_icon.svg', import.meta.url).href,
    title: 'MetaMask',
    onClick: handleMetaMaskLogin, // Use the special handler for MetaMask
  },
  {
    logo: new URL('@/assets/icons/Phantom_icon.svg', import.meta.url).href,
    title: 'Phantom',
    onClick: () => handleLogin(authStore.loginWithPhantom.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/xverse_icon.svg', import.meta.url).href,
    title: 'Xverse',
    onClick: () => handleLogin(authStore.loginWithXverse.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/magic_eden_icon.svg', import.meta.url).href,
    title: 'Magic Eden',
    onClick: () => handleLogin(authStore.loginWithMagicEden.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/unisat_icon.svg', import.meta.url).href,
    title: 'Unisat',
    onClick: () => handleLogin(authStore.loginWithUnisat.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/okx_icon.svg', import.meta.url).href,
    title: 'OKX',
    onClick: () => handleLogin(authStore.loginWithOKX.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/leather_icon.svg', import.meta.url).href,
    title: 'Leather',
    onClick: () => handleLogin(authStore.loginWithLeather.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/nfid.svg', import.meta.url).href,
    title: 'NFID',
    onClick: () => handleLogin(authStore.loginWithNFID.bind(authStore)),
  },
  {
    logo: new URL('@/assets/icons/plug.svg', import.meta.url).href,
    title: 'Plug Wallet',
    onClick: () => handleLogin(authStore.loginWithPlug.bind(authStore)),
  },
];

// Back to login from recovery section
const backToLogin = () => {
  showRecoverySection.value = false;
};

// Initialize Google Sign-In on mount
onMounted(() => {
  // This can be expanded if needed for Google Sign-In initialization
  
  // Initialize Google login callback to handle successful login
  if (window.google && window.google.accounts) {
    window.google.accounts.id.initialize({
      callback: async (response) => {
        try {
          loading.value = true;
          await authStore.loginWithGoogle(response);
          // Ensure modal closes after Google login
          await handleAfterLogin();
        } catch (error) {
          console.error('Google login failed:', error);
          errorMessage.value = error.message || 'Google login failed. Please try again.';
        } finally {
          loading.value = false;
        }
      }
    });
  }
});
</script>

<template>
  <div class="login-container">
    <!-- Loading Spinner -->
    <LoadingScreen 
      :isLoading="loading" 
      :messages="[
        t('loadingScreen.messages.chargingHyperdrive'),
        t('loadingScreen.messages.summoningSpaceHamsters'),
        t('loadingScreen.messages.fuelingRocket'),
        t('loadingScreen.messages.lubricatingGears'),
        t('loadingScreen.messages.herdingWormholes'),
        t('loadingScreen.messages.calibratingFluxCapacitor'),
        t('loadingScreen.messages.syncingHiveMind'),
        t('loadingScreen.messages.hackingGravity'),
        t('loadingScreen.messages.debuggingTheMultiverse'),
      ]"
    />

    <!-- Account Recovery Section -->
    <AccountRecovery v-if="showRecoverySection" />
    
    <!-- Login Options Section -->
    <div class="login-panel" v-if="!loading && !showRecoverySection">
      <img src="@/assets/icons/cosmicrafts.svg" class="full-logo" alt="Cosmicrafts Logo" />
      <label class="cosmic-label-connect">{{ $t('login.connectWith') }}</label>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Main Buttons -->
      <div class="main-buttons">
        <div
          class="btn-div"
          v-for="method in mainMethods"
          :key="method.text"
          @click="method.onClick"
          :aria-label="t('login.loginWith', { method: method.text })"
        >
          <label class="btn-label">
            <img :src="method.logo" class="button-account-icon" :alt="method.text" />
            <span class="btn-text">{{ method.text }}</span>
          </label>
        </div>
      </div>

      <!-- Secondary Icon-Only Buttons -->
      <div class="secondary-buttons">
        <div
          class="icon-btn"
          v-for="method in secondaryMethods"
          :key="method.logo"
          @click="method.onClick"
          :aria-label="'Login with ' + method.title"
          :title="method.title"
        >
          <img :src="method.logo" class="icon" :alt="method.title" />
        </div>
      </div>

      <!-- Recovery Button -->
      <div class="recovery-section">
        <button class="recovery-button" @click="openAccountRecoveryModal">
          <i class="fas fa-key"></i>
          <span>{{ $t('login.recoverWithSeedPhrase') || 'Recover with Seed Phrase' }}</span>
        </button>
      </div>

      <!-- Clarification Message -->
      <div class="clarification-message">
        <p>{{ $t('login.signInClarification') }}</p>
      </div>
    </div>
    
    <!-- Back Button (when in recovery mode) -->
    <div v-if="showRecoverySection" class="back-button-container">
      <button class="back-button" @click="backToLogin">
        <i class="fas fa-arrow-left"></i>
        <span>{{ $t('login.backToLogin') || 'Back to Login' }}</span>
      </button>
    </div>
  </div>
</template>


<style scoped>
/* Basic styling for your login page */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.login-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.full-logo {
  width: 12vh;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
}

.cosmic-label-connect {
  color: #ffffff;
  font-weight: 600;
  margin-top: 2vh;
  margin-bottom: .5vh;
  font-size: 1.5vh;
}

.main-buttons {
  display: flex;
  flex-direction: column;
  gap: .25rem;
  margin-bottom: .75rem;
}

.secondary-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.icon-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, rgba(28, 30, 33, 0.625), rgba(31, 36, 44, 0.765));
  border-radius: 8px;
  cursor: pointer;
  border: 0.25px solid rgba(255, 255, 255, 0.157);
  transition: background 0.2s;
  margin-bottom: .5rem;
}

.icon-btn:hover {
  background: linear-gradient(135deg, rgba(40, 45, 55, 0.635), rgba(50, 60, 70, 0.612));
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.icon {
  width: 1.5rem;
}

.btn-div {
  display: flex;
  justify-content: space-between;
  height: 5vh;
  width: 24vh;
  background: linear-gradient(135deg, rgba(28, 30, 33, 0.625), rgba(31, 36, 44, 0.765));
  border-radius: 8px;
  cursor: pointer;
  border: 0.25px solid rgba(255, 255, 255, 0.157);
  padding: 0 2vh;
  margin-top: 1vh;
  transition: all 0.2s ease;
}

.btn-div:hover {
  background: linear-gradient(135deg, rgba(40, 45, 55, 0.635), rgba(50, 60, 70, 0.612));
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-account-icon {
  width: 2.5vh;
  margin-right: 1vh;
}

.btn-label {
  display: flex;
  align-items: center;
  width: 100%;
  color: #ffffff;
  font-size: 1.5vh;
}

.btn-text {
  margin-left: 1vh;
  font-size: 1.25vh;
  font-weight: 500;
}

.recovery-section {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.recovery-button {
  padding: 0.75rem 1.25rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 8px;
  color: rgba(15, 185, 253, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recovery-button:hover {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 0 12px rgba(15, 185, 253, 0.15);
}

.recovery-button i {
  font-size: 0.9rem;
}

.clarification-message {
  text-align: center;
  font-size: 1.2vh;
  color: #c3c3c3;
  margin-top: 1.5vh;
}

/* Add error message style */
.error-message {
  background: rgba(255, 75, 75, 0.2);
  color: #ff4b4b;
  border: 1px solid rgba(255, 75, 75, 0.3);
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
  max-width: 80%;
}

/* Back button styling */
.back-button-container {
  margin-top: 1rem;
}

.back-button {
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.back-button i {
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .main-buttons {
    width: 90%;
  }
  
  .btn-div {
    width: 100%;
  }
  
  .recovery-button {
    width: 90%;
    justify-content: center;
  }
}
</style>
