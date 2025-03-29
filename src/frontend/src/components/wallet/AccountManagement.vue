<template>
  <div class="account-management">
    <div class="account-management-header">
      <h2>Account Security</h2>
      <button class="modal-close" @click="closeModal">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="account-management-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
    
    <div class="account-management-content">
      <!-- Accounts Tab -->
      <div v-if="activeTab === 'accounts'" class="tab-content">
        <h3>My Accounts</h3>
        <div class="accounts-list">
          <div 
            v-for="(address, index) in addresses" 
            :key="address.index"
            class="account-option"
            :class="{ active: index === currentAddressIndex }"
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
        
        <div class="account-actions-row">
          <button class="cosmic-button cosmic-button-outline-primary" @click="createNewAccount">
            <i class="fas fa-plus"></i>
            <span>Create New Account</span>
          </button>
          <button class="cosmic-button cosmic-button-outline-primary" @click="showImportAccountDialog">
            <i class="fas fa-download"></i>
            <span>Import Account</span>
          </button>
          <button class="cosmic-button cosmic-button-outline-primary" @click="showRecoverAccountDialog">
            <i class="fas fa-undo"></i>
            <span>Recover Account</span>
          </button>
        </div>
      </div>
      
      <!-- Security Tab -->
      <div v-if="activeTab === 'security'" class="tab-content">
        <h3>Security Settings</h3>
        
        <div v-if="!hasEncryption" class="security-notice">
          <div class="security-notice-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="security-notice-content">
            <h4>Your wallet is not encrypted</h4>
            <p>We recommend enabling at least one security method to protect your wallet. Your recovery phrase is currently stored unencrypted.</p>
          </div>
        </div>
        
        <div class="security-options">
          <!-- Password Protection -->
          <div class="security-option">
            <div class="security-option-info">
              <h4>Password Protection</h4>
              <p>Encrypt your wallet data with a password</p>
              <div v-if="securitySettings.hasPassword" class="status enabled">
                <i class="fas fa-check-circle"></i> Enabled
              </div>
              <div v-else class="status disabled">
                <i class="fas fa-times-circle"></i> Disabled
              </div>
            </div>
            <button 
              class="cosmic-button cosmic-button-sm"
              :class="securitySettings.hasPassword ? 'cosmic-button-danger' : 'cosmic-button-primary'"
              @click="securitySettings.hasPassword ? disablePasswordProtection() : setupPasswordProtection()"
            >
              {{ securitySettings.hasPassword ? 'Disable' : 'Enable' }}
            </button>
          </div>
          
          <!-- Passkey (WebAuthn) -->
          <div class="security-option">
            <div class="security-option-info">
              <h4>Passkey Authentication</h4>
              <p>Use your device's biometrics or PIN for secure access</p>
              <div v-if="securitySettings.hasPasskey" class="status enabled">
                <i class="fas fa-check-circle"></i> Enabled
              </div>
              <div v-else class="status disabled">
                <i class="fas fa-times-circle"></i> Disabled
              </div>
            </div>
            <button 
              class="cosmic-button cosmic-button-sm" 
              :class="securitySettings.hasPasskey ? 'cosmic-button-danger' : 'cosmic-button-primary'"
              @click="securitySettings.hasPasskey ? disablePasskey() : setupPasskey()"
              :disabled="!isPasskeySupported"
            >
              {{ securitySettings.hasPasskey ? 'Disable' : 'Enable' }}
            </button>
          </div>
          
          <!-- Two-Factor Authentication -->
          <div class="security-option">
            <div class="security-option-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security with a time-based code</p>
              <div v-if="securitySettings.hasTwoFactor" class="status enabled">
                <i class="fas fa-check-circle"></i> Enabled
              </div>
              <div v-else class="status disabled">
                <i class="fas fa-times-circle"></i> Disabled
              </div>
            </div>
            <button 
              class="cosmic-button cosmic-button-sm" 
              :class="securitySettings.hasTwoFactor ? 'cosmic-button-danger' : 'cosmic-button-primary'"
              @click="securitySettings.hasTwoFactor ? disableTwoFactor() : setupTwoFactor()"
            >
              {{ securitySettings.hasTwoFactor ? 'Disable' : 'Enable' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Recovery Tab -->
      <div v-if="activeTab === 'recovery'" class="tab-content">
        <h3>Wallet Recovery</h3>
        
        <div class="recovery-section">
          <div class="recovery-info">
            <h4>Recovery Phrase</h4>
            <p>Your recovery phrase provides full access to your wallet. Keep it secure and private.</p>
          </div>
          
          <button class="cosmic-button cosmic-button-warning" @click="authenticateAndShowSeedPhrase">
            <i class="fas fa-key"></i>
            <span>View Recovery Phrase</span>
          </button>
          
          <div class="recovery-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Never share your recovery phrase with anyone. Nobody should ever ask for it, if you lose it you lose your wallet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Password Protection Dialog -->
  <div v-if="showPasswordDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ securitySettings.hasPassword ? 'Password Verification' : 'Set Password Protection' }}</h3>
        <button class="modal-close" @click="showPasswordDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <!-- Password Setup -->
        <template v-if="!securitySettings.hasPassword">
          <div class="form-group">
            <label for="password">New Password</label>
            <input 
              id="password" 
              type="password" 
              v-model="newPassword" 
              placeholder="Enter a strong password"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input 
              id="confirm-password" 
              type="password" 
              v-model="confirmPassword" 
              placeholder="Confirm your password"
              class="form-input"
            />
          </div>
        </template>
        
        <!-- Password Verification -->
        <template v-else>
          <div class="form-group">
            <label for="current-password">Current Password</label>
            <input 
              id="current-password" 
              type="password" 
              v-model="currentPassword" 
              placeholder="Enter your password"
              class="form-input"
            />
          </div>
        </template>
        
        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showPasswordDialog = false">Cancel</button>
        <button class="button-primary" @click="securitySettings.hasPassword ? confirmDisablePassword() : confirmPasswordSetup()">
          {{ securitySettings.hasPassword ? 'Verify & Disable' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Two-Factor Setup Dialog -->
  <div v-if="showTwoFactorDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Set Up Two-Factor Authentication</h3>
        <button class="modal-close" @click="showTwoFactorDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="setup-instructions">
          <p>1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
          <div class="qr-code-container">
            <img :src="qrCodeDataUrl" alt="QR Code" class="qr-code" />
          </div>
          
          <p>2. If you can't scan the QR code, enter this secret key manually:</p>
          <div class="secret-key">{{ totpSecret }}</div>
          
          <p>3. Enter the verification code from your authenticator app:</p>
          <div class="form-group">
            <input 
              type="text" 
              v-model="totpCode" 
              placeholder="6-digit code"
              class="form-input verification-code"
              maxlength="6"
              pattern="[0-9]*"
            />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showTwoFactorDialog = false">Cancel</button>
        <button class="button-primary" @click="confirmTwoFactorSetup">Verify</button>
      </div>
    </div>
  </div>
  
  <!-- Two-Factor Verification Dialog (for disabling) -->
  <div v-if="showDisableTwoFactorDialog" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Verify Two-Factor Authentication</h3>
        <button class="modal-close" @click="showDisableTwoFactorDialog = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p>Enter the verification code from your authenticator app to disable two-factor authentication:</p>
        <div class="form-group">
          <input 
            type="text" 
            v-model="totpCode" 
            placeholder="6-digit code"
            class="form-input verification-code"
            maxlength="6"
            pattern="[0-9]*"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button class="button-secondary" @click="showDisableTwoFactorDialog = false">Cancel</button>
        <button class="button-primary" @click="confirmDisableTwoFactor">Verify & Disable</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import AvatarService from '@/utils/AvatarService';
import { isPasskeySupported as checkPasskeySupport } from '@/utils/securityUtils';
import { encryptData, decryptData } from '@/utils/securityUtils';
import QRCode from 'qrcode';

export default {
  name: 'AccountManagement',
  props: {
    activeTab: {
      type: String,
      default: 'accounts'
    }
  },
  setup(props) {
    const authStore = useAuthStore();
    const modalStore = useModalStore();
    
    // Tabs - use the prop for initial value
    const activeTab = ref(props.activeTab);
    const tabs = [
      { id: 'accounts', label: 'Accounts', icon: 'fas fa-user-circle' },
      { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
      { id: 'recovery', label: 'Recovery', icon: 'fas fa-key' }
    ];
    
    // Account data
    const addresses = computed(() => authStore.derivedAddresses || []);
    const currentAddressIndex = computed(() => authStore.currentAddressIndex);
    
    // Security settings from auth store
    const securitySettings = computed(() => authStore.securitySettings || {
      hasPassword: false,
      hasPasskey: false,
      hasTwoFactor: false
    });
    
    // Check if wallet has any encryption enabled
    const hasEncryption = computed(() => {
      return securitySettings.value.hasPassword || 
             securitySettings.value.hasPasskey || 
             securitySettings.value.hasTwoFactor;
    });
    
    // UI state
    const isPasskeySupported = ref(false);
    const showPasswordDialog = ref(false);
    const showTwoFactorDialog = ref(false);
    const showDisableTwoFactorDialog = ref(false);
    const newPassword = ref('');
    const confirmPassword = ref('');
    const passwordError = ref('');
    const currentPassword = ref('');
    const totpCode = ref('');
    const totpSecret = ref('');
    const totpQrCode = ref('');
    const qrCodeDataUrl = ref('');
    
    // Format ID (truncate middle part)
    const formatId = (id) => {
      if (!id || id.length < 10) return id;
      return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
    };
    
    const getAccountInitial = (account = null) => {
      const addr = account || (addresses.value && addresses.value[currentAddressIndex.value]);
      if (!addr || !addr.name) return 'A';
      
      return addr.name.charAt(0).toUpperCase();
    };
    
    // Security methods
    const setupPasswordProtection = () => {
      newPassword.value = '';
      confirmPassword.value = '';
      passwordError.value = '';
      showPasswordDialog.value = true;
    };
    
    const confirmPasswordSetup = async () => {
      // Validate passwords
      if (!newPassword.value) {
        passwordError.value = 'Please enter a password';
        return;
      }
      
      if (newPassword.value.length < 8) {
        passwordError.value = 'Password must be at least 8 characters';
        return;
      }
      
      if (newPassword.value !== confirmPassword.value) {
        passwordError.value = 'Passwords do not match';
        return;
      }
      
      try {
        // Enable password protection in auth store
        await authStore.enablePasswordProtection(newPassword.value);
        showPasswordDialog.value = false;
      } catch (error) {
        passwordError.value = error.message || 'Failed to set up password protection';
      }
    };
    
    const disablePasswordProtection = async () => {
      currentPassword.value = '';
      passwordError.value = '';
      
      try {
        // Show password verification dialog
        showPasswordDialog.value = true;
        
        // Will be handled in confirmPasswordSetup
      } catch (error) {
        console.error('Error disabling password protection:', error);
      }
    };
    
    const confirmDisablePassword = async () => {
      try {
        // Verify the password and disable protection
        await authStore.disablePasswordProtection(currentPassword.value);
        showPasswordDialog.value = false;
      } catch (error) {
        passwordError.value = error.message || 'Failed to disable password protection';
      }
    };
    
    const setupPasskey = async () => {
      try {
        // Enable passkey in auth store
        await authStore.enablePasskey();
      } catch (error) {
        console.error('Passkey setup failed:', error);
        alert(`Passkey setup failed: ${error.message}`);
      }
    };
    
    const disablePasskey = async () => {
      try {
        // Disable passkey in auth store
        await authStore.disablePasskey();
      } catch (error) {
        console.error('Error disabling passkey:', error);
        alert(`Failed to disable passkey: ${error.message}`);
      }
    };
    
    const setupTwoFactor = async () => {
      try {
        // Generate TOTP secret and QR code URL
        const result = await authStore.enableTwoFactor();
        totpSecret.value = result.secret;
        totpQrCode.value = result.otpauth;
        
        // Generate QR code data URL
        try {
          qrCodeDataUrl.value = await QRCode.toDataURL(result.otpauth, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000FF',
              light: '#FFFFFFFF'
            }
          });
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
          // Fall back to Google Charts if local generation fails
          qrCodeDataUrl.value = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(result.otpauth)}`;
        }
        
        // Show TOTP setup dialog
        showTwoFactorDialog.value = true;
        totpCode.value = '';
      } catch (error) {
        console.error('2FA setup failed:', error);
        alert(`Failed to set up two-factor authentication: ${error.message}`);
      }
    };
    
    const confirmTwoFactorSetup = async () => {
      try {
        // Verify the entered TOTP code
        if (!(await authStore.verifyTwoFactor(totpCode.value))) {
          throw new Error('Invalid verification code. Please try again.');
        }
        
        showTwoFactorDialog.value = false;
      } catch (error) {
        console.error('2FA verification failed:', error);
        alert(`Verification failed: ${error.message}`);
      }
    };
    
    const disableTwoFactor = async () => {
      try {
        // Show 2FA verification dialog
        showDisableTwoFactorDialog.value = true;
        totpCode.value = '';
      } catch (error) {
        console.error('Error disabling 2FA:', error);
      }
    };
    
    const confirmDisableTwoFactor = async () => {
      try {
        // Disable 2FA with verification
        await authStore.disableTwoFactor(totpCode.value);
        showDisableTwoFactorDialog.value = false;
      } catch (error) {
        console.error('Error disabling 2FA:', error);
        alert(`Failed to disable two-factor authentication: ${error.message}`);
      }
    };
    
    const authenticateAndShowSeedPhrase = async () => {
      try {
        // Try to show seed phrase - this will trigger auth if needed
        const result = await authStore.showSeedPhrase();
        
        if (!result.success) {
          if (result.needsAuth) {
            // Show authentication dialog based on active security methods
            if (securitySettings.value.hasPassword) {
              currentPassword.value = '';
              passwordError.value = '';
              showPasswordDialog.value = true;
            } else if (securitySettings.value.hasTwoFactor) {
              totpCode.value = '';
              showDisableTwoFactorDialog.value = true;
            }
          } else {
            console.error('Could not show seed phrase:', result.error);
            alert(`Could not show seed phrase: ${result.error}`);
          }
        }
      } catch (error) {
        console.error('Error showing seed phrase:', error);
        alert(`Error showing seed phrase: ${error.message}`);
      }
    };
    
    // Account actions (from AccountSelector)
    const openRenameDialog = (index) => {
      // To be implemented for account management
    };
    
    const confirmDeleteAddress = (index) => {
      // To be implemented for account management
    };
    
    const createNewAccount = async () => {
      // To be implemented for account management
    };
    
    const showImportAccountDialog = () => {
      // To be implemented for account management
    };
    
    const showRecoverAccountDialog = () => {
      // To be implemented for account management
    };
    
    const closeModal = () => {
      modalStore.closeModal();
    };
    
    onMounted(() => {
      // Check if WebAuthn/Passkeys are supported
      isPasskeySupported.value = checkPasskeySupport();
      
      // Initialize security settings from store
      if (authStore.securitySettings) {
        // Already initialized by the computed property
      }
    });
    
    return {
      activeTab,
      tabs,
      addresses,
      currentAddressIndex,
      formatId,
      getAccountInitial,
      securitySettings,
      isPasskeySupported,
      hasEncryption,
      
      // Password protection
      showPasswordDialog,
      newPassword,
      confirmPassword,
      passwordError,
      currentPassword,
      setupPasswordProtection,
      confirmPasswordSetup,
      disablePasswordProtection,
      confirmDisablePassword,
      
      // Passkey
      setupPasskey,
      disablePasskey,
      
      // Two-factor
      showTwoFactorDialog,
      showDisableTwoFactorDialog,
      totpCode,
      totpSecret,
      totpQrCode,
      setupTwoFactor,
      confirmTwoFactorSetup,
      disableTwoFactor,
      confirmDisableTwoFactor,
      
      // Recovery phrase
      authenticateAndShowSeedPhrase,
      
      // Account management
      openRenameDialog,
      confirmDeleteAddress,
      createNewAccount,
      showImportAccountDialog,
      showRecoverAccountDialog,
      closeModal,
      qrCodeDataUrl
    };
  }
};
</script>

<style scoped>
.account-management {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  box-shadow: var(--cosmic-shadow-md);
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.account-management-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-management-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  color: var(--cosmic-text-primary);
  transform: scale(1.1);
}

.account-management-tabs {
  display: flex;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--cosmic-text-primary);
}

.tab-button.active {
  color: var(--cosmic-blue);
  position: relative;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--cosmic-blue);
  border-radius: 2px 2px 0 0;
}

.account-management-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.tab-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-primary);
}

/* Security tab styles */
.security-options {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.security-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.security-option-info {
  flex: 1;
}

.security-option-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary);
}

.security-option-info p {
  margin: 0 0 0.75rem 0;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

.status {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status.enabled {
  color: var(--cosmic-green, #0ab86c);
}

.status.disabled {
  color: var(--cosmic-text-tertiary);
}

/* Recovery tab styles */
.recovery-section {
  padding: 1.5rem;
  background: rgba(255, 145, 0, 0.05);
  border: 1px solid rgba(255, 145, 0, 0.15);
  border-radius: var(--cosmic-radius-md);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recovery-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary);
}

.recovery-info p {
  margin: 0;
  color: var(--cosmic-text-secondary);
}

.recovery-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 75, 75, 0.05);
  border: 1px solid rgba(255, 75, 75, 0.15);
  border-radius: var(--cosmic-radius-sm);
}

.recovery-warning i {
  color: var(--cosmic-danger, #ff4b4b);
  font-size: 1.25rem;
}

.recovery-warning p {
  margin: 0;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

/* Account tab styles */
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
  border-radius: var(--cosmic-radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.account-option.active {
  background-color: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.15);
}

.account-option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.account-avatar-container {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
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
  width: 2rem;
  height: 2rem;
  background-color: rgba(128, 96, 255, 0.15);
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
  color: rgb(128, 96, 255);
}

.account-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-name {
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.account-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-indicator {
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
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.account-action-button.rename-btn:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
}

.account-action-button.delete-btn:hover {
  background: rgba(255, 75, 75, 0.1);
  border-color: rgba(255, 75, 75, 0.2);
  color: var(--cosmic-danger);
}

.account-actions-row {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Password dialog */
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
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-glow-blue-md);
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
  color: var(--cosmic-text-primary);
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
  color: var(--cosmic-text-secondary);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.5);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.25);
}

.error-message {
  color: var(--cosmic-danger);
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.2);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.75rem;
  font-size: 0.9rem;
}

.button-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9), rgba(0, 157, 223, 0.9));
  color: white;
  font-weight: 600;
  border: none;
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.button-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--cosmic-text-primary);
  font-weight: 600;
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

/* QR code and 2FA setup styles */
.setup-instructions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.qr-code {
  width: 200px;
  height: 200px;
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: white;
  padding: 0.5rem;
}

.secret-key {
  font-family: monospace;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-md);
  font-size: 1.1rem;
  text-align: center;
  letter-spacing: 1px;
  word-break: break-all;
}

.verification-code {
  font-family: monospace;
  text-align: center;
  letter-spacing: 4px;
  font-size: 1.5rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .account-management {
    max-width: 100%;
    max-height: 90vh;
  }
  
  .security-option {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .account-actions-row {
    flex-direction: column;
  }
  
  .qr-code {
    width: 160px;
    height: 160px;
  }
}

/* Security notice styles */
.security-notice {
  display: flex;
  padding: 1rem;
  background: rgba(255, 145, 0, 0.1);
  border: 1px solid rgba(255, 145, 0, 0.2);
  border-radius: var(--cosmic-radius-md);
  margin-bottom: 1.5rem;
  align-items: center;
  gap: 1rem;
}

.security-notice-icon {
  color: rgba(255, 145, 0, 0.8);
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.security-notice-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary);
}

.security-notice-content p {
  margin: 0;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}
</style> 