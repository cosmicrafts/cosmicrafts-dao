<template>
  <div>
    <!-- Loading Spinner -->
    <div class="top" v-if="loading">
      <LoadingSpinner :isLoading="loading" />
    </div>

    <div class="register-container">
      <div class="register-panel">
        <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts" class="full-logo" />

        <form @submit.prevent="registerPlayer" class="form-grid">
          <!-- Example AvatarSelector -->
          <div class="avatar-section">
            <AvatarSelector @avatar-selected="onAvatarSelected" />
          </div>

          <!-- Right Section -->
          <div class="right-section">
            <div class="form-group">
              <label for="username">Username:</label>
              <input
                type="text"
                id="username"
                v-model="username"
                @input="enforceUsernameLimit"
                required
                placeholder="Max 12 characters"
              />
            </div>
            <div class="form-group">
              <label for="referralCode">Referral Code:</label>
              <input type="text" id="referralCode" v-model="referralCode" placeholder="Optional" />
            </div>
            <div class="referral-link">
              <p>
                Don't have a code?
                <a href="https://discord.com/invite/cosmicrafts-884272584491941888" target="_blank"
                  >Get one here!</a
                >
              </p>
            </div>
          </div>

          <!-- Terms of Service -->
          <div class="terms-column">
            <div class="form-group terms">
              <input type="checkbox" id="terms" v-model="acceptedTerms" required />
              <label for="terms">
                I accept
                <a href="https://cosmicrafts.com/privacy-policy" target="_blank">Terms of Service</a>
                and
                <a href="https://cosmicrafts.com/terms-of-service" target="_blank">Privacy Policy</a>
              </label>
            </div>
          </div>

          <!-- Submit -->
          <div class="submit-column">
            <button type="submit" class="submit-button">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Registration Result -->
    <div v-if="registerResult" class="register-result">
      {{ registerResult }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCanisterStore } from '@/stores/canister';
import { useModalStore } from '@/stores/modal'; // Import the modal store
import AvatarSelector from '@/components/account/AvatarSelector.vue';
import LoadingSpinner from '@/components/loading/LoadingSpinner.vue';

export default {
  components: {
    AvatarSelector,
    LoadingSpinner,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const modalStore = useModalStore(); // Initialize the modal store

    const loading = ref(false);
    const username = ref('');
    const referralCode = ref('');
    const selectedAvatarId = ref(null);
    const acceptedTerms = ref(true);
    const registerResult = ref(null);

    const enforceUsernameLimit = () => {
      if (username.value.length > 12) {
        username.value = username.value.substring(0, 12);
      }
    };

    // If not authenticated, go back to login
    if (!authStore.isAuthenticated()) {
      console.log('User is not authenticated');
      router.push({ path: '/login' });
    }

    /**
     * Avatar selection callback
     */
    const onAvatarSelected = (avatarId) => {
      selectedAvatarId.value = avatarId;
    };

    /**
     * Register the player on the canister
     */
    const registerPlayer = async () => {
      loading.value = true;
      registerResult.value = null;

      const canisterStore = useCanisterStore();
      const cosmicrafts = await canisterStore.get('cosmicrafts');

      // Default to 1 if no avatar is selected
      const avatarId = selectedAvatarId.value || 1;

      try {
        /**
         * signup: [Username, AvatarID, Opt(ReferralCode)]
         * returns [Bool, Opt(Player), Text]
         */
        const [ok, maybePlayer, msg] = await cosmicrafts.signup(
          username.value,
          avatarId,
          referralCode.value ? [referralCode.value] : []
        );

        if (ok) {
          // If signup succeeded
          registerResult.value = `Welcome, ${maybePlayer[0]?.username ?? 'New Player'}!`;
          // Refresh the store registration status
          await authStore.isPlayerRegistered();
          // Close the modal
          modalStore.closeModal(); // Close the modal after successful registration
          // Redirect to home or dash
          router.push('/');
        } else {
          // If signup failed
          registerResult.value = msg || 'Registration failed.';
        }
      } catch (error) {
        console.error('Error in registerPlayer:', error);
        registerResult.value = error.message || 'Registration failed.';
      }

      loading.value = false;
    };

    return {
      loading,
      username,
      enforceUsernameLimit,
      referralCode,
      selectedAvatarId,
      acceptedTerms,
      registerResult,
      onAvatarSelected,
      registerPlayer,
    };
  },
};
</script>

<style scoped>
.top {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
}

.register-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.register-panel {
  padding: 1rem;
  border-radius: 12px;
  position: relative;
  height: 30%;
  max-width: 24rem;
  width: 100%;
}

.full-logo {
  display: block;
  margin: 0 auto 24px auto;
  width: 128px;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.25));
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

.terms-column,
.submit-column {
  grid-column: 1 / span 2;
}

.right-section {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 14px;
  margin-bottom: 2px;
  margin-top: 4px;
  color: #ffffff;
}

input[type='text'] {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #303030, #202020);
  border: 0.25px solid #00ffff;
  border-radius: 8px;
  margin-bottom: 8px;
  color: #ffffff;
}

.referral-link {
  margin-top: -12px;
  font-size: 11px;
  color: #b0bec5;
}

.referral-link a {
  font-weight: bold;
  color: #21b6f6;
  text-decoration: underline;
}

.terms {
  display: flex;
  align-items: center;
}

.terms input[type='checkbox'] {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 1px solid #00ffff;
  border-radius: 4px;
  background-color: #202020;
  margin-right: 8px;
  cursor: pointer;
}

.terms input[type='checkbox']:checked {
  background-image: url('@/assets/icons/checkmark_icon.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px;
}

.terms label {
  color: #bfddea;
  font-size: 13px;
}

.terms a {
  color: #21b6f6;
  font-weight: bold;
  text-decoration: underline;
}

button.submit-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to bottom, #0390f5, #0a47d4);
  color: white;
  border: 0.001rem solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.1s, box-shadow 0.2s;
  margin-top: 8px;
}

button.submit-button:hover {
  background: linear-gradient(to bottom, #1dcaff, #0e40b5);
}

button.submit-button:active {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.3);
}

.avatar-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: -8px;
}
</style>
