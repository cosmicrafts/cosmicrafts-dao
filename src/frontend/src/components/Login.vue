<!-- File: components/Login.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useI18n } from 'vue-i18n';
import LoadingScreen from '@/components/LoadingScreen.vue';

const authStore = useAuthStore();
const modalStore = useModalStore();
const { t } = useI18n();

const loading = ref(false);

const handleAfterLogin = async () => {
  modalStore.closeModal(); // Close the modal immediately
};

const handleGuestLogin = async () => {
  loading.value = true;
  try {
    const { username } = await authStore.createGuestAccount();
    console.log(`Guest account created`);
    await handleAfterLogin();
  } catch (error) {
    console.error('Error during guest login:', error);
    alert('Failed to create a guest account. Please try again.');
  } finally {
    loading.value = false;
  }
};

const onGoogleClick = () => {
  window.google.accounts.id.prompt();
};

const openAccountRecoveryModal = async () => {
  const AccountRecovery = (await import('@/components/AccountRecovery.vue')).default;
  modalStore.openModal(AccountRecovery);
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
    onClick: async () => {
      await authStore.loginWithInternetIdentity();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/google_logo.svg', import.meta.url).href,
    text: t('login.google'),
    onClick: onGoogleClick,
  },

];

// Secondary methods (icon-only buttons)
const secondaryMethods = [
  {
    logo: new URL('@/assets/icons/metaMask_icon.svg', import.meta.url).href,
    onClick: async () => {
      await authStore.loginWithMetaMask();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/Phantom_icon.svg', import.meta.url).href,
    onClick: async () => {
      await authStore.loginWithPhantom();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/nfid.svg', import.meta.url).href,
    onClick: async () => {
      await authStore.loginWithNFID();
      await handleAfterLogin();
    },
  },
  {
    logo: new URL('@/assets/icons/plug.svg', import.meta.url).href, // Replace with Plug icon URL
    onClick: async () => {
      await authStore.loginWithPlug();
      await handleAfterLogin();
    }
  },
  
];
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

    <div class="login-panel" v-if="!loading">
      <img src="@/assets/icons/Cosmicrafts_Logo.svg" class="full-logo" alt="Cosmicrafts Logo" />
      <label class="cosmic-label-connect">{{ t('login.connectWith') }}</label>

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
          :aria-label="'Login with secondary method'"
        >
          <img :src="method.logo" class="icon" />
        </div>
      </div>

      <!-- Clarification Message -->
      <div class="clarification-message">
        <p>
          {{ t('login.signInClarification') }}
          <a class="recovery-link" @click="openAccountRecoveryModal">{{ t('login.accountRecovery') }}</a>
        </p>
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
  color: #c3c3c3;
  margin-bottom: -1vh;
}

.recovery-link {
  color: #00b3ff; /* Blue color for the link */
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer; /* Make the cursor indicate a clickable link */
}

.recovery-link:hover {
  color: #61c8ff; /* Slightly darker blue on hover */
}

</style>
