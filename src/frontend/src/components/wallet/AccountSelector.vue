<template>
  <div class="account-selector">
    <div class="account-label" @click="toggleAccountMenu">
      <div class="account-avatar-container">
        <img v-if="addresses.length > currentAddressIndex" :src="getAddressAvatar(currentAddressIndex)" alt="Account Avatar" class="account-avatar" />
        <span v-else class="account-icon">{{ getAccountInitial() }}</span>
      </div>
      <span class="account-name">{{ getCurrentAccountName() }}</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    
    <!-- Account menu dropdown -->
    <div v-if="showAccountMenu" class="account-menu">
      <div class="menu-header">
        <span>My Accounts</span>
        <div class="menu-actions">
          <button class="menu-action" @click.stop="showRecoverAccountDialog" title="Recover Account">
            <i class="fas fa-undo"></i>
          </button>
          <button class="menu-action" @click.stop="showImportAccountDialog" title="Import Account">
            <i class="fas fa-download"></i>
          </button>
          <button class="menu-action" @click.stop="createNewAccount" title="Create New Account">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <div class="accounts-list">
        <div 
          v-for="(address, index) in addresses" 
          :key="address.index"
          class="account-option"
          :class="{ active: index === currentAddressIndex }"
          @click.stop="selectAccount(index)"
        >
          <div class="account-option-content">
            <div class="account-avatar-container">
              <img v-if="address.avatar" :src="address.avatar" alt="Account Avatar" class="account-avatar" />
              <span v-else class="account-icon">{{ getAccountInitial(address) }}</span>
            </div>
            <div class="account-details">
              <span class="account-name">{{ address.name }}</span>
              <span class="account-id">{{ formatId(address.principalId) }}</span>
            </div>
          </div>
          <div class="account-actions">
            <span v-if="index === currentAddressIndex" class="active-indicator">
              <i class="fas fa-check"></i>
            </span>
            <button 
              class="account-action-button rename-btn"
              @click.stop="openRenameDialog(index)" 
              title="Rename Account"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button 
              v-if="addresses.length > 1 && index !== 0"
              class="account-action-button delete-btn"
              @click.stop="confirmDeleteAddress(index)" 
              title="Remove Account"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="menu-footer">
        <button class="menu-action-full backup-btn" @click.stop="showSeedPhrase" title="Backup Recovery Phrase">
          <i class="fas fa-key"></i>
          <span>View Recovery Phrase</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Backdrop overlay for mobile -->
  <div 
    v-if="showAccountMenu" 
    class="menu-backdrop"
    @click="toggleAccountMenu"
  ></div>
  
  <!-- Rename Account Dialog -->
  <div v-if="showRenameDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Rename Account</h3>
        <button class="modal-close" @click="showRenameDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="account-name">Account Name</label>
          <input 
            id="account-name" 
            type="text" 
            v-model="newAddressName" 
            placeholder="Enter account name"
            class="form-input"
            @keyup.enter="handleRenameAccount"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showRenameDialog = false">Cancel</button>
        <button class="button-primary" @click="handleRenameAccount">Save</button>
      </div>
    </div>
  </div>
  
  <!-- Delete Account Confirmation Dialog -->
  <div v-if="showDeleteDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Remove Account</h3>
        <button class="modal-close" @click="showDeleteDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p class="warning-text">
          Are you sure you want to remove this account? This action cannot be undone.
        </p>
        <p class="info-text">
          Make sure you have backed up the recovery phrase for this account if you want to access it again in the future.
        </p>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showDeleteDialog = false">Cancel</button>
        <button class="button-danger" @click="handleDeleteAccount">Remove</button>
      </div>
    </div>
  </div>
  
  <!-- Import Account Dialog -->
  <div v-if="showImportDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Import Account</h3>
        <button class="modal-close" @click="showImportDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="account-seed">Recovery Phrase (12 or 24 words)</label>
          <textarea 
            id="account-seed"
            v-model="importSeedPhrase" 
            placeholder="Enter your recovery phrase"
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="import-name">Account Name (Optional)</label>
          <input 
            id="import-name" 
            type="text" 
            v-model="importAccountName" 
            placeholder="Enter account name"
            class="form-input"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showImportDialog = false">Cancel</button>
        <button class="button-primary" @click="handleImportAccount">Import</button>
      </div>
    </div>
  </div>
  
  <!-- Recover Account Dialog -->
  <div v-if="showRecoverDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Recover Account</h3>
        <button class="modal-close" @click="showRecoverDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="recovery-seed">Recovery Phrase (12 words)</label>
          <textarea 
            id="recovery-seed"
            v-model="recoverySeedPhrase" 
            placeholder="Enter your 12-word recovery phrase"
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
        
        <div v-if="recoveryError" class="error-message">
          {{ recoveryError }}
        </div>
        
        <div class="help-text">
          <p>Enter your 12-word seed phrase to recover your account. Make sure to enter the words in the exact same order as they were shown.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showRecoverDialog = false">Cancel</button>
        <button 
          class="button-primary" 
          @click="handleRecoverAccount"
          :disabled="!isRecoveryPhraseValid || isRecovering"
        >
          <span v-if="!isRecovering">Recover</span>
          <span v-else class="button-spinner"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import { useModalStore } from '@/stores/modal';
import { validateMnemonic } from 'bip39';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import AvatarService from '@/utils/AvatarService';
import { isPasskeySupported } from '@/utils/securityUtils';

export default {
  name: 'AccountSelector',
  emits: ['account-changed'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    const modalStore = useModalStore();
    
    // Account management using auth store
    const showAccountMenu = ref(false);
    
    // Get addresses from auth store
    const addresses = computed(() => {
      return authStore.derivedAddresses || [];
    });
    
    const currentAddressIndex = computed(() => {
      return authStore.currentAddressIndex;
    });
    
    // Format ID (truncate middle part)
    const formatId = (id) => {
      if (!id || id.length < 10) return id;
      return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
    };
    
    // Get current account name
    const getCurrentAccountName = () => {
      if (addresses.value && addresses.value.length > currentAddressIndex.value) {
        return addresses.value[currentAddressIndex.value].name;
      }
      return 'My Account';
    };
    
    // Methods
    const toggleAccountMenu = () => {
      console.log("Toggling account menu");
      showAccountMenu.value = !showAccountMenu.value;
      
      // If opening menu on mobile, prevent body scrolling
      if (showAccountMenu.value && window.innerWidth <= 480) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };
    
    const selectAccount = async (index) => {
      try {
        if (index === currentAddressIndex.value) {
          showAccountMenu.value = false;
          return;
        }
        
        // Switch address in auth store
        const success = await authStore.switchToAddress(index);
        
        if (success) {
          showAccountMenu.value = false;
          
          // Refresh token balances
          await tokenStore.refreshAllBalances();
          
          // Emit event
          emit('account-changed', { 
            index,
            account: addresses.value[index]
          });
        }
      } catch (error) {
        console.error('Error switching account:', error);
      }
    };
    
    const createNewAccount = async () => {
      try {
        // First close menu to prevent user spam clicking
        showAccountMenu.value = false;
        
        // Generate new address from auth store
        const newAddress = await authStore.generateNewAddress();
        
        if (newAddress) {
          // Switch to the new address
          await authStore.switchToAddress(addresses.value.length - 1);
          
          // Emit event to notify parent
          emit('account-changed', {
            index: addresses.value.length - 1,
            account: newAddress
          });
        }
      } catch (error) {
        console.error('Error creating new account:', error);
      }
    };
    
    // Get account initial for avatar fallback
    const getAccountInitial = (account = null) => {
      const addr = account || (addresses.value && addresses.value[currentAddressIndex.value]);
      if (!addr || !addr.name) return 'A';
      
      return addr.name.charAt(0).toUpperCase();
    };
    
    // Dialog state for account management
    const renameAccountIndex = ref(-1);
    const newAddressName = ref('');
    const showRenameDialog = ref(false);
    const showDeleteDialog = ref(false);
    const accountToDelete = ref(-1);
    const showImportDialog = ref(false);
    const importSeedPhrase = ref('');
    const importAccountName = ref('');
    const showRecoverDialog = ref(false);
    const recoverySeedPhrase = ref('');
    const recoveryError = ref('');
    const isRecovering = ref(false);
    
    // Add a computed property to validate the recovery phrase
    const isRecoveryPhraseValid = computed(() => {
      if (!recoverySeedPhrase.value) return false;
      
      const words = recoverySeedPhrase.value.trim().split(/\s+/);
      
      // Check if we have exactly 12 words
      if (words.length !== 12) {
        return false;
      }
      
      // Check if each word is valid (basic check)
      return validateMnemonic(recoverySeedPhrase.value);
    });
    
    // Open rename dialog
    const openRenameDialog = (index) => {
      renameAccountIndex.value = index;
      const address = addresses.value[index];
      if (address) {
        newAddressName.value = address.name;
        showRenameDialog.value = true;
      }
    };
    
    // Handle rename account
    const handleRenameAccount = () => {
      if (renameAccountIndex.value >= 0 && newAddressName.value.trim()) {
        // Find the address in the array
        const index = authStore.derivedAddresses.findIndex(
          a => a.index === renameAccountIndex.value
        );
        
        if (index !== -1) {
          // Update the name
          authStore.derivedAddresses[index].name = newAddressName.value.trim();
          
          // Save to local storage
          authStore.saveStateToLocalStorage();
        }
        
        showRenameDialog.value = false;
        renameAccountIndex.value = -1;
        newAddressName.value = '';
      }
    };
    
    // Confirm delete account
    const confirmDeleteAddress = (index) => {
      accountToDelete.value = index;
      showDeleteDialog.value = true;
    };
    
    // Handle delete account
    const handleDeleteAccount = () => {
      if (accountToDelete.value >= 0 && accountToDelete.value !== 0) {
        if (accountToDelete.value === currentAddressIndex.value) {
          // Switch to main account first if deleting active account
          selectAccount(0);
        }
        
        // Filter out the address to delete
        authStore.derivedAddresses = authStore.derivedAddresses.filter(
          a => a.index !== accountToDelete.value
        );
        
        // Save to local storage
        authStore.saveStateToLocalStorage();
        
        showDeleteDialog.value = false;
        accountToDelete.value = -1;
      }
    };
    
    // Show import account dialog
    const showImportAccountDialog = () => {
      importSeedPhrase.value = '';
      importAccountName.value = '';
      showImportDialog.value = true;
    };
    
    // Handle import account
    const handleImportAccount = async () => {
      if (importSeedPhrase.value.trim()) {
        try {
          // Validate the seed phrase first
          if (!validateMnemonic(importSeedPhrase.value.trim())) {
            throw new Error('Invalid seed phrase');
          }
          
          // For now, simply notify the user this would import an account
          alert('Account import feature is coming soon');
          
          showImportDialog.value = false;
          importSeedPhrase.value = '';
          importAccountName.value = '';
        } catch (error) {
          console.error('Error importing account:', error);
          // Here you would typically show an error message to the user
        }
      }
    };
    
    // Show recover account dialog
    const showRecoverAccountDialog = () => {
      recoverySeedPhrase.value = '';
      recoveryError.value = '';
      showRecoverDialog.value = true;
    };
    
    // Handle recover account
    const handleRecoverAccount = async () => {
      if (!recoverySeedPhrase.value.trim()) {
        recoveryError.value = 'Please enter a recovery phrase';
        return;
      }
      
      const words = recoverySeedPhrase.value.trim().split(/\s+/);
      
      // Check word count
      if (words.length !== 12) {
        recoveryError.value = `Invalid word count: ${words.length}. Expected 12 words.`;
        return;
      }
      
      // Validate the seed phrase
      if (!validateMnemonic(recoverySeedPhrase.value.trim())) {
        recoveryError.value = 'Invalid recovery phrase. One or more words are not in the wordlist.';
        return;
      }
      
      try {
        isRecovering.value = true;
        recoveryError.value = '';
        showRecoverDialog.value = false;
        
        // Use the auth store's recover account method
        await authStore.recoverAccount(recoverySeedPhrase.value.trim());
        
        // Check if we have addresses, if not generate one
        if (!authStore.derivedAddresses || authStore.derivedAddresses.length === 0) {
          await authStore.generateNewAddress();
        }
        
        // Emit event to notify parent
        emit('account-changed', {
          index: authStore.currentAddressIndex,
          account: authStore.derivedAddresses[authStore.currentAddressIndex]
        });
        
        // Reset the recovery phrase
        recoverySeedPhrase.value = '';
      } catch (error) {
        console.error('Error recovering account:', error);
        recoveryError.value = error.message || 'Recovery failed. Please try again.';
        showRecoverDialog.value = true;
      } finally {
        isRecovering.value = false;
      }
    };
    
    // Show seed phrase
    const showSeedPhrase = async () => {
      try {
        const result = await authStore.showSeedPhrase();
        
        // Check if authentication is needed
        if (result && result.needsAuth) {
          // Open authentication modal
          modalStore.openModal({
            component: () => import('@/components/wallet/AccountManagement.vue'),
            props: {
              activeTab: 'recovery'
            }
          });
          return;
        }
        
        if (result && result.success && result.phrase) {
          // Show seed phrase in a modal
          modalStore.openModal(SeedPhraseModal, {
            seedPhrase: result.phrase,
            principalId: authStore.getIdentity()?.getPrincipal().toText() || '',
            title: 'Account Recovery Phrase'
          });
        }
      } catch (error) {
        console.error('Error showing seed phrase:', error);
      }
      
      showAccountMenu.value = false;
    };
    
    // Get address avatar 
    const getAddressAvatar = (index) => {
      // Use the AvatarService to generate a deterministic avatar based on account index
      // We'll use modulo to cycle through the available avatars (1-12)
      const avatarIndex = (index % AvatarService.TOTAL_AVATARS) + 1;
      return AvatarService.getAvatarById(avatarIndex);
    };
    
    // Initial setup
    onMounted(() => {
      const handleClickOutside = (event) => {
        if (showAccountMenu.value && 
            !event.target.closest('.account-selector') && 
            !event.target.closest('.account-menu')) {
          showAccountMenu.value = false;
          document.body.style.overflow = '';
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      
      // Clean up on component unmount
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.body.style.overflow = ''; // Reset overflow if component unmounts
      };
    });

    return {
      addresses,
      currentAddressIndex,
      showAccountMenu,
      
      formatId,
      getCurrentAccountName,
      toggleAccountMenu,
      selectAccount,
      createNewAccount,
      getAccountInitial,
      renameAccountIndex,
      newAddressName,
      showRenameDialog,
      showDeleteDialog,
      accountToDelete,
      showImportDialog,
      importSeedPhrase,
      importAccountName,
      openRenameDialog,
      handleRenameAccount,
      confirmDeleteAddress,
      handleDeleteAccount,
      showImportAccountDialog,
      handleImportAccount,
      getAddressAvatar,
      
      // Recovery and seed phrase management
      showSeedPhrase,
      showRecoverDialog,
      recoverySeedPhrase,
      showRecoverAccountDialog,
      handleRecoverAccount,
      recoveryError,
      isRecovering,
      isRecoveryPhraseValid,
    };
  }
};
</script>

<style scoped>
.account-selector {
  position: relative;
  width: 100%;
  height: 100%;
}

.account-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--cosmic-radius-md);
  background-color: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.15);
  cursor: pointer;
  transition: all 0.2s;
}

.account-label:hover {
  background-color: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.account-avatar-container {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.5rem;
}

.account-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background-color: rgba(128, 96, 255, 0.15);
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.8rem;
  color: rgb(128, 96, 255);
}

.account-name {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  z-index: 1000;
  padding: 0.5rem;
  margin-top: 0.5rem;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0.5rem;
}

.menu-actions {
  display: flex;
  gap: 0.5rem;
}

.menu-action {
  background: transparent;
  border: none;
  color: var(--cosmic-blue);
  cursor: pointer;
  font-size: 1rem;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.account-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md, 8px);
  transition: all 0.2s ease;
}

.account-option.active, 
.account-option:hover {
  background-color: rgba(15, 185, 253, 0.1);
}

.account-option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-id {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-indicator {
  margin-left: auto;
  color: var(--cosmic-blue);
}

.account-action-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}

.account-option:hover .account-action-button {
  opacity: 1;
}

.account-action-button.rename-btn:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue, #0FB9FD);
}

.account-action-button.delete-btn:hover {
  background: rgba(255, 75, 75, 0.1);
  border-color: rgba(255, 75, 75, 0.2);
  color: var(--cosmic-danger, #FF4B4B);
}

.menu-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-action-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--cosmic-blue);
  font-weight: 600;
}

.menu-action-full:hover {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
}

/* Menu backdrop */
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  cursor: pointer;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.modal-container {
  width: 90%;
  max-width: 450px;
  background: var(--cosmic-glass-bg-darker, rgba(23, 33, 43, 0.95));
  border-radius: var(--cosmic-radius-lg, 12px);
  border: var(--cosmic-glass-border-blue, 1px solid rgba(15, 185, 253, 0.2));
  box-shadow: var(--cosmic-glow-blue-md, 0 0 20px rgba(15, 185, 253, 0.25));
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--cosmic-text-primary, #ffffff);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  color: var(--cosmic-text-primary, #ffffff);
  transform: scale(1.1);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.85));
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-md, 8px);
  color: var(--cosmic-text-primary, #ffffff);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.5);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: monospace;
}

.button-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9) 0%, rgba(77, 207, 255, 0.9) 50%, rgba(0, 157, 223, 0.9) 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--cosmic-radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.35);
}

.button-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--cosmic-text-primary, #ffffff);
  font-weight: 600;
  border-radius: var(--cosmic-radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s;
}

.button-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.button-danger {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 75, 75, 0.9) 0%, rgba(255, 100, 100, 0.9) 50%, rgba(223, 0, 0, 0.9) 100%);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--cosmic-radius-md, 8px);
  cursor: pointer;
  transition: all 0.2s;
}

.button-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(255, 75, 75, 0.35);
}

.warning-text {
  color: #ff4b4b;
  font-weight: 600;
  margin-bottom: 1rem;
}

.info-text {
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.85));
  font-size: 0.9rem;
}

.error-message {
  color: #ff4b4b;
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.2);
  border-radius: var(--cosmic-radius-sm, 8px);
  padding: 0.75rem;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.help-text {
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

.button-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile styles */
@media (max-width: 480px) {
  .account-menu {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 75vh;
    margin-top: 0;
    border-radius: var(--cosmic-radius-md) var(--cosmic-radius-md) 0 0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .account-action-button {
    opacity: 1;
  }
}
</style> 