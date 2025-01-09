<!-- File: components/Login.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';
import Registration from '@/components/Registration.vue';

const authStore = useAuthStore();
const modalStore = useModalStore();
const { t } = useI18n();

const handleAfterLogin = async () => {
  const isRegistered = await authStore.isPlayerRegistered();
  if (isRegistered) {
    modalStore.closeModal(); // Close the modal immediately
  } else {
    modalStore.openModal(Registration); // Open the registration modal
  }
};

const onGoogleClick = () => {
  window.google.accounts.id.prompt();
};

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

const handleCredentialResponse = async (response) => {
  await authStore.loginWithGoogle(response);
  await handleAfterLogin();
};

onMounted(() => {
  loadGoogleIdentityServices();
});

const authMethods = [
  {
    logo: new URL('@/assets/icons/icp.svg', import.meta.url).href,
    text: t('login.internetIdentity'),
    onClick: async () => {
      await authStore.loginWithInternetIdentity();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/metaMask_icon.svg', import.meta.url).href,
    text: t('login.metaMask'),
    onClick: async () => {
      await authStore.loginWithMetaMask();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/Phantom_icon.svg', import.meta.url).href,
    text: t('login.phantom'),
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
      <label class="cosmic-label-connect">{{ t('login.connectWith') }}</label>

      <div
        class="btn-div"
        v-for="method in authMethods"
        :key="method.text"
        @click="method.onClick"
        :aria-label="t('login.loginWith', { method: method.text })"
      >
        <label class="btn-label">
          <img :src="method.logo" class="button-account-icon" :alt="method.text" />
          <span class="btn-text">{{ method.text }}</span>
        </label>
      </div>

      <div class="inner-grid">
        <div class="btn-div" @click="onGoogleClick">
          <label class="btn-label">
            <img src="@/assets/icons/google_logo.svg" class="button-account-icon" alt="Google" />
            <span class="btn-text">{{ t('login.google') }}</span>
          </label>
        </div>
      </div>

      <div class="clarification-message">
        <p>{{ t('login.signInClarification') }}</p>
      </div>
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
  width: 18vh;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
}

.cosmic-label-connect {
  color: #ffffff;
  font-weight: 600;
  margin-top: 2vh;
  margin-bottom: 1vh;
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
  margin-top: 1vh;
}

.btn-div:hover {
  background: linear-gradient(135deg, rgba(40, 45, 55, 0.635), rgba(50, 60, 70, 0.612));
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

.clarification-message {
  text-align: center;
  font-size: 1.2vh;
  color: #505050;
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
