<template>
  <div class="login-container">
    <div class="login-panel">
      <!-- Logo at the top -->
      <img src="@/assets/icons/Cosmicrafts_Logo.svg" class="full-logo" alt="Cosmicrafts Logo" />

      <!-- "Connect with" Text -->
      <label class="cosmic-label-connect">Connect with:</label>

      <!-- Custom Google Button -->
      <div class="inner-grid">
        <div class="btn-div" @click="loginWithGoogle">
          <label class="btn-label">
            <img src="@/assets/icons/google_logo.svg" class="button-account-icon" alt="Google" />
            <span class="btn-text"> Google</span>
          </label>
        </div>

        <!-- Other Auth Methods -->
        <div class="btn-div" v-for="method in authMethods" :key="method.text" @click="method.onClick">
          <label class="btn-label">
            <img :src="method.logo" class="button-account-icon" :alt="method.text" />
            <span class="btn-text"> {{ method.text }}</span>
          </label>
        </div>
      </div>

      <!-- Clarification Message -->
      <div class="clarification-message">
        <p>Create a new account by connecting.</p>
      </div>
    </div>

    <!-- WOU Info detached from the panel, at the bottom -->
    <div class="bottom-div">
      <img src="@/assets/icons/wou_logo.svg" alt="wou-icon" class="bottom-wou-icon" />
      <label class="bottom-label">
        &copy;&nbsp;2024 World of Unreal<br />
        All trademarks referenced herein are the properties of their respective owners.
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import icpLogo from '@/assets/icons/icp.svg';
import metaMaskLogo from '@/assets/icons/metaMask_icon.svg';
import phantomLogo from '@/assets/icons/Phantom_icon.svg';

const authStore = useAuthStore();
const router = useRouter();

const handleAfterLogin = async () => {
  router.push({ path: '/' });
};

// Custom Google login handler
const loginWithGoogle = () => {
  window.google.accounts.id.prompt();
};

const loginIC = async () => {
  await authStore.loginWithInternetIdentity();
  router.push({ path: '/' });
};

const loadGoogleIdentityServices = () => {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = initializeGoogleSignIn;
  script.onerror = () => {
    setTimeout(loadGoogleIdentityServices, 10000);
  };
  document.body.appendChild(script);
};

const initializeGoogleSignIn = () => {
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
  });
};

const handleCredentialResponse = (response) => {
  authStore.loginWithGoogle(response, router).then(handleAfterLogin);
};

onMounted(() => {
  loadGoogleIdentityServices();
});

const authMethods = [
  {
    logo: icpLogo,
    text: 'Internet Identity',
    onClick: () => loginIC(),
  },
  {
    logo: metaMaskLogo,
    text: 'MetaMask',
    onClick: () => authStore.loginWithMetaMask().then(handleAfterLogin),
  },
  {
    logo: phantomLogo,
    text: 'Phantom',
    onClick: () => authStore.loginWithPhantom().then(handleAfterLogin),
  },
];
</script>

<style scoped>
/* Container for the login screen */
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

/* Container for the login screen */
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

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/webp/fondo.webp');
  background-size: cover;
  background-position: center;
  opacity: 1;
  z-index: -1;
}

.login-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: rgba(31, 48, 62, 0.37);
  backdrop-filter: blur(4px);
  padding: 5vh; /* Adjusted padding for responsiveness */
  border-radius: 12px;
  border: 0.5px solid rgba(0, 0, 0, 0.114);
  box-shadow: inset 0px 0px 10px rgba(255, 255, 255, 0.149);

  /* Max width and height constraints */
  max-width: 240px;
  max-height: 60vh;
  width: 100%;
  height: auto;
  
  /* Ensure margin spacing relative to viewport */
  margin-top: 5vh;
  margin-bottom: 5vh;
}

/* Full logo styling */
.full-logo {
  display: block;
  width: 21vh; /* Proportional to viewport height */
  margin-top: 0px;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
}

/* Connect with text */
.cosmic-label-connect {
  color: #FFFFFF;
  font-weight: 600;
  margin-top: 4vh;
  margin-bottom: 2vh;
  font-size: 2vh;
}

/* Custom Google Button & Auth Methods Grid */
.inner-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2vh; /* Use vh for gap for consistency */
  margin-bottom: 2vh;
}

/* Button for Auth Methods and Custom Google Button */
.btn-div {
  display: flex;
  justify-content: space-between;
  height: 4.8vh;
  width: 24vh;
  background: linear-gradient(135deg, rgba(28, 30, 33, 0.625), rgba(31, 36, 44, 0.765));
  border-radius: 8px;
  cursor: pointer;
  border: .25px solid rgba(255, 255, 255, 0.157);
  padding: 0 2vh; /* Use vh for padding */
}

.btn-div:hover {
  background: linear-gradient(135deg, rgba(40, 45, 55, 0.635), rgba(50, 60, 70, 0.612));
}

/* Icon inside the button */
.button-account-icon {
  width: 3vh; /* Responsive icon size */
  height: 3vh;
  margin-right: 1.5vh;
}

/* Label and Text inside the button */
.btn-label {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  color: #d6d6d6;
  font-size: 1.8vh; /* Responsive font size */
}

.btn-text {
  margin-left: 1vh; /* Adjust text margin */
}

/* Clarification message */
.clarification-message {
  text-align: center;
  font-size: 1.2vh;
  color: #a1a1a1;
  margin-top: -1vh;
}

/* WOU info, detached from panel and placed at the bottom */
.bottom-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3vh;
}

.bottom-wou-icon {
  width: 6vh; /* Responsive size */
}

.bottom-label {
  color: #aaaaaa;
  display: block;
  font-size: 1.4vh; /* Responsive font size */
  text-align: center;
  margin-top: 1vh;
}

</style>
