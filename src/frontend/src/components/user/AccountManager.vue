<template>
  <div class="account-manager">
    <div class="account-section">
      <h2 class="section-title">{{ $t('account.title') || 'Account Management' }}</h2>
      
      <!-- User Information -->
      <div v-if="isAuthenticated" class="user-info">
        <div class="user-avatar">
          <img :src="userAvatarSrc" alt="User Avatar" />
        </div>
        
        <div class="user-details">
          <h3 class="username">{{ userName }}</h3>
          <div class="principal-id">
            <span class="principal-text">{{ truncatedPrincipal }}</span>
            <button class="copy-btn" @click="copyPrincipal" title="Copy principal ID">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Security Section -->
      <div v-if="isAuthenticated" class="security-section">
        <h3 class="subsection-title">{{ $t('account.security') || 'Security' }}</h3>
        <div class="security-info">
          <p>{{ $t('account.securityInfo') || 'Secure your account with backup options below.' }}</p>
        </div>
        
        <div class="security-actions">
          <button 
            class="cosmic-button cosmic-button-primary action-button"
            @click="showSeedPhrase"
          >
            <i class="fas fa-key"></i>
            <span>{{ $t('account.viewSeedPhrase') || 'View Recovery Phrase' }}</span>
          </button>
          
          <button 
            v-if="hasMultipleAddresses"
            class="cosmic-button cosmic-button-primary action-button"
            @click="manageAddresses"
          >
            <i class="fas fa-address-card"></i>
            <span>{{ $t('account.manageAddresses') || 'Manage Addresses' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Account Actions -->
      <div class="account-actions">
        <button 
          v-if="isAuthenticated"
          class="cosmic-button cosmic-button-danger action-button"
          @click="confirmLogout"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>{{ $t('account.logout') || 'Logout' }}</span>
        </button>
        
        <button 
          v-if="!isAuthenticated"
          class="cosmic-button cosmic-button-primary action-button"
          @click="openLoginModal"
        >
          <i class="fas fa-sign-in-alt"></i>
          <span>{{ $t('account.login') || 'Login' }}</span>
        </button>
        
        <button 
          v-if="!isAuthenticated"
          class="cosmic-button cosmic-button-secondary action-button"
          @click="openRecoveryModal"
        >
          <i class="fas fa-undo"></i>
          <span>{{ $t('account.recover') || 'Recover Account' }}</span>
        </button>
      </div>
    </div>
    
    <!-- Additional Account Information -->
    <div v-if="isAuthenticated" class="account-info">
      <div class="info-row">
        <span class="info-label">{{ $t('account.registered') || 'Registered' }}:</span>
        <span class="info-value">{{ isRegistered ? $t('account.yes') : $t('account.no') }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">{{ $t('account.addresses') || 'Addresses' }}:</span>
        <span class="info-value">{{ derivedAddresses.length }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">{{ $t('account.currentAddress') || 'Current Address' }}:</span>
        <span class="info-value">{{ currentAddress ? currentAddress.name : '-' }}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">{{ $t('account.backupStatus') || 'Backup Status' }}:</span>
        <span class="info-value" :class="{ 'status-warning': !hasSeedPhrase }">
          {{ hasSeedPhrase ? $t('account.backupReady') || 'Recovery Phrase Available' : $t('account.noBackup') || 'No Backup Available' }}
        </span>
      </div>
    </div>
    
    <!-- Logout Confirmation Dialog -->
    <div v-if="showLogoutConfirm" class="logout-confirm-overlay" @click="cancelLogout">
      <div class="logout-confirm-dialog" @click.stop>
        <h3>{{ $t('account.confirmLogout') || 'Confirm Logout' }}</h3>
        <p>{{ $t('account.logoutWarning') || 'Are you sure you want to log out of your account?' }}</p>
        <p class="secondary-warning" v-if="hasSeedPhrase">
          {{ $t('account.seedPhraseReminder') || 'Make sure you have backed up your recovery phrase before logging out!' }}
        </p>
        
        <div class="dialog-actions">
          <button 
            class="cosmic-button cosmic-button-outline-primary"
            @click="cancelLogout"
          >
            {{ $t('account.cancel') || 'Cancel' }}
          </button>
          
          <button 
            class="cosmic-button cosmic-button-danger"
            @click="logout"
          >
            {{ $t('account.confirmLogoutBtn') || 'Yes, Logout' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import AddressManager from '@/components/wallet/AddressManager.vue';
import LoginForm from '@/components/user/LoginForm.vue';
import AccountRecovery from '@/components/user/AccountRecovery.vue';

const authStore = useAuthStore();
const modalStore = useModalStore();

// Reactive state
const showLogoutConfirm = ref(false);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated());
const isRegistered = computed(() => authStore.isRegistered());
const derivedAddresses = computed(() => authStore.derivedAddresses || []);
const hasMultipleAddresses = computed(() => derivedAddresses.value.length > 0);
const currentAddress = computed(() => authStore.currentAddress);
const hasSeedPhrase = computed(() => authStore.hasSeedPhrase);

const userName = computed(() => {
  if (authStore.player && authStore.player.username) {
    return authStore.player.username;
  }
  
  // If no player data, use principal ID
  const id = authStore.getIdentity()?.getPrincipal().toString();
  return id ? `User ${id.substring(0, 5)}...` : 'Unknown User';
});

const truncatedPrincipal = computed(() => {
  const id = authStore.getIdentity()?.getPrincipal().toString();
  if (!id) return '';
  
  // Truncate the principal ID for display
  return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
});

const userAvatarSrc = computed(() => {
  if (authStore.player && authStore.player.avatar) {
    // Use player avatar if available
    return `/assets/avatars/avatar_${authStore.player.avatar}.png`;
  }
  
  // Default avatar 
  return '/assets/avatars/avatar_1.png';
});

// Methods
const copyPrincipal = () => {
  const principalId = authStore.getIdentity()?.getPrincipal().toString();
  if (!principalId) return;
  
  navigator.clipboard.writeText(principalId)
    .then(() => {
      console.log('Principal ID copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy principal ID:', err);
    });
};

const showSeedPhrase = () => {
  if (authStore.hasSeedPhrase) {
    authStore.showSeedPhrase();
  } else {
    console.error('No seed phrase available');
    // Could show an error message here
  }
};

const manageAddresses = () => {
  modalStore.openModal(AddressManager);
};

const openLoginModal = () => {
  modalStore.openModal(LoginForm);
};

const openRecoveryModal = () => {
  modalStore.openModal(AccountRecovery);
};

const confirmLogout = () => {
  showLogoutConfirm.value = true;
};

const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

const logout = async () => {
  showLogoutConfirm.value = false;
  await authStore.logout();
};
</script>

<style scoped>
.account-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-lg);
  box-shadow: var(--cosmic-shadow-md);
}

.section-title {
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
}

.subsection-title {
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
  margin: 0 0 1rem 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(15, 185, 253, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex-grow: 1;
}

.username {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
}

.principal-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.principal-text {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.copy-btn {
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.copy-btn:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.security-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
}

.security-info {
  margin-bottom: 1rem;
}

.security-info p {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.security-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.account-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.account-info {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--cosmic-text-tertiary);
  font-size: 0.9rem;
}

.info-value {
  color: var(--cosmic-text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.status-warning {
  color: #ff9500;
}

.logout-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--cosmic-z-modal);
}

.logout-confirm-dialog {
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
}

.logout-confirm-dialog h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--cosmic-text-primary);
}

.logout-confirm-dialog p {
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-secondary);
}

.secondary-warning {
  color: #ff9500;
  font-weight: 500;
  background: rgba(255, 149, 0, 0.1);
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(255, 149, 0, 0.2);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .account-manager {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .user-avatar {
    width: 48px;
    height: 48px;
  }
  
  .username {
    font-size: 1rem;
  }
  
  .dialog-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
}
</style> 