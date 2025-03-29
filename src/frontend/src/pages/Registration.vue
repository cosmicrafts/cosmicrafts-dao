<template>
  <div class="registration-container">
    <div v-if="loading" class="loading-overlay">
      <LoadingScreen
        :isLoading="loading"
        :messages="[
          $t('loadingScreen.messages.initializingQuantumShenanigans'),
          $t('loadingScreen.messages.chargingHyperdrive'),
          $t('loadingScreen.messages.syncingHiveMind'),
          $t('loadingScreen.messages.encryptingCosmos'),
          $t('loadingScreen.messages.uploadingTheUniverse'),
        ]"
      />
    </div>
    
    <OnboardingExperience v-if="showOnboarding && !loading" />
    
    <div v-if="!showOnboarding && !loading" class="registration-content">
      <RegistrationForm @registration-complete="handleRegistrationComplete" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import RegistrationForm from '@/components/forms/RegistrationForm.vue';
import OnboardingExperience from '@/components/onboarding/OnboardingExperience.vue';
import LoadingScreen from '@/components/media/LoadingScreen.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

export default {
  components: {
    RegistrationForm,
    OnboardingExperience,
    LoadingScreen
  },
  setup() {
    const showOnboarding = ref(false);
    const loading = ref(false);
    const authStore = useAuthStore();
    const router = useRouter();

    // Check if user is authenticated, otherwise redirect to login
    if (!authStore.isAuthenticated()) {
      router.push('/login');
    }

    const handleRegistrationComplete = async () => {
      loading.value = true;
      
      // Short delay to allow the registration to complete
      setTimeout(() => {
        loading.value = false;
        showOnboarding.value = true;
      }, 1500);
    };

    return {
      showOnboarding,
      loading,
      handleRegistrationComplete
    };
  }
};
</script>

<style scoped>
.registration-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #080c24 0%, #1a1248 50%, #341a54 100%);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.registration-content {
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style> 