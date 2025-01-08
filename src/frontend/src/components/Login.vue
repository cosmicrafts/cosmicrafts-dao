<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/Modal.vue'; // Import the modal
import Registration from '@/components/Registration.vue'; // Import the registration form component

// Modal State
const isRegistrationModalOpen = ref(false); // State to control registration modal

const authStore = useAuthStore();
const router = useRouter();



/**
 * Handles post-login actions based on registration status.
 */

const isLoading = ref(false);
const handleAfterLogin = async () => {
  isLoading.value = true; // Start loading
  try {
    const isReg = await authStore.isPlayerRegistered();
    if (isReg) {
      closeLoginModal();
    } else {
      showRegistrationModal();
    }
  } catch (error) {
    console.error("Error during handleAfterLogin:", error);
  } finally {
    isLoading.value = false; // End loading
  }
};



/**
 * Shows the registration modal.
 */
const showRegistrationModal = () => {
  isRegistrationModalOpen.value = true;
};

/**
 * Closes the registration modal.
 */
const closeRegistrationModal = () => {
  isRegistrationModalOpen.value = false;
};

/**
 * Google flow: The button triggers google.accounts.id.prompt() 
 * which calls handleCredentialResponse when the user logs in.
 */
const onGoogleClick = () => {
  window.google.accounts.id.prompt();
};

/**
 * Initialize Google Sign-In
 */
const loadGoogleIdentityServices = () => {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = initializeGoogleSignIn;
  script.onerror = () => setTimeout(loadGoogleIdentityServices, 5000);
  document.body.appendChild(script);
};

const initializeGoogleSignIn = () => {
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
  });
};

/**
 * Google credential callback
 */
const handleCredentialResponse = async (response) => {
  await authStore.loginWithGoogle(response);
  await handleAfterLogin();
};

/**
 * Called on mount
 */
onMounted(() => {
  loadGoogleIdentityServices();
});

const authMethods = [
  {
    logo: new URL('@/assets/icons/icp.svg', import.meta.url).href,
    text: 'Internet Identity',
    onClick: async () => {
      await authStore.loginWithInternetIdentity();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/metaMask_icon.svg', import.meta.url).href,
    text: 'MetaMask',
    onClick: async () => {
      await authStore.loginWithMetaMask();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/Phantom_icon.svg', import.meta.url).href,
    text: 'Phantom',
    onClick: async () => {
      await authStore.loginWithPhantom();
      await handleAfterLogin();
    },
  },
];

</script>

<template>
  <div class="login-container">
    <div class="login-panel">
      <img src="@/assets/icons/Cosmicrafts_Logo.svg" class="full-logo" alt="Cosmicrafts Logo" />
      <label class="cosmic-label-connect">Connect with:</label>
      <div class="inner-grid">
        <div class="btn-div" @click="onGoogleClick">
          <label class="btn-label">
            <img src="@/assets/icons/google_logo.svg" class="button-account-icon" alt="Google" />
            <span class="btn-text">Google</span>
          </label>
        </div>
        <div
        class="btn-div"
        v-for="method in authMethods"
        :key="method.text"
        @click="method.onClick"
        :aria-label="'Login with ' + method.text"
      >

          <label class="btn-label">
            <img :src="method.logo" class="button-account-icon" :alt="method.text" />
            <span class="btn-text">{{ method.text }}</span>
          </label>
        </div>
      </div>
      <div class="clarification-message">
        <p>Create a new account by connecting.</p>
      </div>
    </div>

    <!-- Registration Modal -->
    <Modal :isOpen="isRegistrationModalOpen" @close="closeRegistrationModal">
      <Registration />
    </Modal>
  </div>
</template>


<style scoped>
/* Basic styling for your login page */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(350deg, #161a2070, #1f242c4c);
  overflow: hidden;
  position: relative;
}

.login-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(31, 48, 62, 0.37);
  backdrop-filter: blur(4px);
  padding: 5vh;
  border-radius: 12px;
  border: 0.5px solid rgba(0, 0, 0, 0.114);
  box-shadow: inset 0px 0px 10px rgba(255, 255, 255, 0.149);
  max-width: 240px;
  width: 100%;
  margin: 5vh 0;
}

.full-logo {
  width: 21vh;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
}

.cosmic-label-connect {
  color: #ffffff;
  font-weight: 600;
  margin-top: 4vh;
  margin-bottom: 2vh;
  font-size: 2vh;
}

.inner-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2vh;
  margin-bottom: 2vh;
}

.btn-div {
  display: flex;
  justify-content: space-between;
  height: 4.8vh;
  width: 24vh;
  background: linear-gradient(135deg, rgba(28, 30, 33, 0.625), rgba(31, 36, 44, 0.765));
  border-radius: 8px;
  cursor: pointer;
  border: 0.25px solid rgba(255, 255, 255, 0.157);
  padding: 0 2vh;
}

.btn-div:hover {
  background: linear-gradient(135deg, rgba(40, 45, 55, 0.635), rgba(50, 60, 70, 0.612));
}

.button-account-icon {
  width: 3vh;
  margin-right: 1.5vh;
}

.btn-label {
  display: flex;
  align-items: center;
  width: 100%;
  color: #d6d6d6;
  font-size: 1.8vh;
}

.btn-text {
  margin-left: 1vh;
}

.clarification-message {
  text-align: center;
  font-size: 1.2vh;
  color: #a1a1a1;
  margin-top: -1vh;
}

.bottom-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3vh;
}

.bottom-wou-icon {
  width: 6vh;
}

.bottom-label {
  color: #aaaaaa;
  display: block;
  font-size: 1.4vh;
  text-align: center;
  margin-top: 1vh;
}
</style>
