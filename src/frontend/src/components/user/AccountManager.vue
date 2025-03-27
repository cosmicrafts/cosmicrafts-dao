<template>
  <div class="account-manager">
    <div class="account-section">
      <h2 class="section-title">{{ $t('account.title') || 'Account Management' }}</h2>
      
      <!-- Chain Switcher -->
      <div v-if="isAuthenticated" class="chain-switcher">
        <button 
          class="chain-btn" 
          :class="{ active: activeChain === 'icp' }"
          @click="switchToIcpChain"
        >
          <img src="/assets/networks/icp-logo.svg" alt="ICP" class="chain-icon" />
          <span>ICP</span>
        </button>
        
        <button 
          class="chain-btn" 
          :class="{ active: activeChain === 'ethereum' }"
          @click="switchToEthereumChain"
        >
          <img src="/assets/networks/eth-logo.svg" alt="Ethereum" class="chain-icon" />
          <span>Ethereum</span>
        </button>
      </div>
      
      <!-- User Information -->
      <div v-if="isAuthenticated" class="user-info">
        <div class="user-avatar">
          <img :src="userAvatarSrc" alt="User Avatar" />
        </div>
        
        <div class="user-details">
          <h3 class="username">{{ userName }}</h3>
          <div class="principal-id">
            <span v-if="activeChain === 'icp'" class="principal-text">{{ truncatedPrincipal }}</span>
            <span v-else class="principal-text">{{ truncatedEthAddress }}</span>
            <button class="copy-btn" @click="copyAddress" title="Copy address">
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
            v-if="activeChain === 'icp' && hasMultipleAddresses"
            class="cosmic-button cosmic-button-primary action-button"
            @click="manageAddresses"
          >
            <i class="fas fa-address-card"></i>
            <span>{{ $t('account.manageAddresses') || 'Manage ICP Addresses' }}</span>
          </button>
          
          <button 
            v-if="activeChain === 'ethereum' && hasEthAccounts"
            class="cosmic-button cosmic-button-primary action-button"
            @click="manageEthAccounts"
          >
            <i class="fas fa-wallet"></i>
            <span>{{ $t('account.manageEthAddresses') || 'Manage ETH Accounts' }}</span>
          </button>
          
          <button 
            v-if="activeChain === 'ethereum'"
            class="cosmic-button cosmic-button-secondary action-button"
            @click="generateNewEthAccount"
          >
            <i class="fas fa-plus-circle"></i>
            <span>{{ $t('account.newEthAccount') || 'Generate New ETH Account' }}</span>
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
      <div v-if="activeChain === 'icp'" class="info-row">
        <span class="info-label">{{ $t('account.registered') || 'Registered' }}:</span>
        <span class="info-value">{{ isRegistered ? $t('account.yes') : $t('account.no') }}</span>
      </div>
      
      <div v-if="activeChain === 'icp'" class="info-row">
        <span class="info-label">{{ $t('account.addresses') || 'ICP Addresses' }}:</span>
        <span class="info-value">{{ derivedAddresses.length }}</span>
      </div>
      
      <div v-if="activeChain === 'icp'" class="info-row">
        <span class="info-label">{{ $t('account.currentAddress') || 'Current ICP Address' }}:</span>
        <span class="info-value">{{ currentAddress ? currentAddress.name : '-' }}</span>
      </div>
      
      <div v-if="activeChain === 'ethereum'" class="info-row">
        <span class="info-label">{{ $t('account.ethAccounts') || 'ETH Accounts' }}:</span>
        <span class="info-value">{{ ethAccounts.length }}</span>
      </div>
      
      <div v-if="activeChain === 'ethereum'" class="info-row">
        <span class="info-label">{{ $t('account.currentEthAccount') || 'Current ETH Account' }}:</span>
        <span class="info-value">{{ currentEthAccount ? currentEthAccount.name : '-' }}</span>
      </div>
      
      <div v-if="activeChain === 'ethereum'" class="info-row">
        <span class="info-label">{{ $t('account.path') || 'Derivation Path' }}:</span>
        <span class="info-value">{{ currentEthAccount ? currentEthAccount.path : '-' }}</span>
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
    
    <!-- Ethereum Account Manager Modal (placeholder) -->
    <div v-if="showEthAccountManager" class="eth-account-manager-overlay" @click="closeEthAccountManager">
      <div class="eth-account-manager-dialog" @click.stop>
        <h3>{{ $t('account.manageEthAccounts') || 'Manage Ethereum Accounts' }}</h3>
        
        <!-- Network Selector -->
        <div class="eth-network-selector">
          <label for="eth-network">Network:</label>
          <select id="eth-network" v-model="selectedEthNetwork" @change="switchEthNetwork">
            <option value="mainnet">Ethereum Mainnet</option>
            <option value="goerli">Goerli Testnet</option>
            <option value="sepolia">Sepolia Testnet</option>
          </select>
        </div>
        
        <div class="eth-accounts-list">
          <div 
            v-for="account in ethAccounts" 
            :key="account.index"
            class="eth-account-item"
            :class="{ active: account.index === currentEthAccountIndex }"
          >
            <div class="eth-account-info">
              <div class="eth-account-name">
                {{ account.name }}
                <input 
                  v-if="editingAccountIndex === account.index" 
                  v-model="editAccountName" 
                  @keyup.enter="renameEthAccount"
                  @click.stop
                  class="eth-account-name-input"
                />
              </div>
              <div class="eth-account-address">{{ formatAddress(account.address) }}</div>
              <div class="eth-account-path">{{ account.path }}</div>
            </div>
            <div class="eth-account-actions">
              <button v-if="account.index !== currentEthAccountIndex" 
                      class="eth-account-select-btn" 
                      @click.stop="switchToEthAccount(account.index)">
                Select
              </button>
              <div v-else class="eth-account-active-badge">Active</div>
              
              <div class="eth-account-buttons">
                <button class="eth-action-btn rename-btn" 
                        @click.stop="startRenameAccount(account.index)"
                        title="Rename Account">
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="eth-action-btn copy-btn" 
                        @click.stop="copyEthAddress(account.address)"
                        title="Copy Address">
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Derivation Path Input -->
        <div class="eth-derivation-section">
          <h4>Create New Account</h4>
          <div class="derivation-path-input">
            <label for="custom-path">Custom Path (Optional):</label>
            <input 
              id="custom-path" 
              type="text"
              v-model="customDerivationPath"
              placeholder="m/44'/60'/0'/0/x"
              class="eth-input"
            />
            <p class="derivation-info">Leave blank to use next available index ({{ nextAccountIndex }})</p>
          </div>
          
          <div class="eth-account-form">
            <label for="new-account-name">Account Name:</label>
            <input 
              id="new-account-name" 
              type="text"
              v-model="newAccountName"
              placeholder="My ETH Account"
              class="eth-input"
            />
          </div>
        </div>
        
        <div class="eth-manager-actions">
          <button 
            class="cosmic-button cosmic-button-secondary"
            @click="createCustomEthAccount"
          >
            <i class="fas fa-plus-circle"></i>
            <span>{{ $t('account.newEthAccount') || 'Create New Account' }}</span>
          </button>
          
          <button 
            class="cosmic-button cosmic-button-outline-primary"
            @click="closeEthAccountManager"
          >
            {{ $t('account.close') || 'Close' }}
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
const showEthAccountManager = ref(false);
const newAccountName = ref('');
const customDerivationPath = ref('');
const selectedEthNetwork = ref('mainnet');
const editingAccountIndex = ref(-1);
const editAccountName = ref('');

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated());
const isRegistered = computed(() => authStore.isRegistered());
const derivedAddresses = computed(() => authStore.derivedAddresses || []);
const hasMultipleAddresses = computed(() => derivedAddresses.value.length > 0);
const currentAddress = computed(() => authStore.currentAddress);
const hasSeedPhrase = computed(() => authStore.hasSeedPhrase);
const activeChain = computed(() => authStore.activeChain);
const ethAccounts = computed(() => authStore.ethAccounts || []);
const hasEthAccounts = computed(() => authStore.hasEthAccounts);
const currentEthAccount = computed(() => authStore.currentEthAccount);
const currentEthAccountIndex = computed(() => authStore.currentEthAccountIndex);
const nextAccountIndex = computed(() => ethAccounts.value.length);

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

const truncatedEthAddress = computed(() => {
  const addr = currentEthAccount.value?.address;
  if (!addr) return '';
  
  // Format Ethereum address for display
  return formatAddress(addr);
});

const userAvatarSrc = computed(() => {
  if (authStore.player && authStore.player.avatar) {
    // Use player avatar if available
    return `/assets/avatars/avatar_${authStore.player.avatar}.png`;
  }
  
  // Default avatar 
  return '/assets/avatars/avatar_1.png';
});

// Format Ethereum address for display
function formatAddress(address) {
  if (!address) return '';
  // Ensure the address has 0x prefix
  const formattedAddr = address.startsWith('0x') ? address : `0x${address}`;
  // Show the first 6 and last 4 characters
  return `${formattedAddr.substring(0, 6)}...${formattedAddr.substring(formattedAddr.length - 4)}`;
}

// Methods
const copyAddress = () => {
  let addressToCopy = '';
  
  if (activeChain.value === 'icp') {
    addressToCopy = authStore.getIdentity()?.getPrincipal().toString();
  } else {
    addressToCopy = currentEthAccount.value?.address || '';
  }
  
  if (!addressToCopy) return;
  
  navigator.clipboard.writeText(addressToCopy)
    .then(() => {
      console.log('Address copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy address:', err);
    });
};

const copyEthAddress = (address) => {
  if (!address) return;
  
  navigator.clipboard.writeText(address)
    .then(() => {
      console.log('Ethereum address copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy ethereum address:', err);
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

const manageEthAccounts = () => {
  selectedEthNetwork.value = authStore.currentEthNetwork;
  newAccountName.value = `ETH Account ${nextAccountIndex.value + 1}`;
  customDerivationPath.value = '';
  showEthAccountManager.value = true;
};

const closeEthAccountManager = () => {
  showEthAccountManager.value = false;
  editingAccountIndex.value = -1;
  editAccountName.value = '';
};

const switchToEthAccount = (index) => {
  authStore.switchToEthAccount(index);
};

const generateNewEthAccount = async () => {
  await authStore.generateEthAccount();
  // If we're in the ETH account manager, we're already in ethereum mode
  if (!showEthAccountManager.value) {
    authStore.switchToEthereumChain();
  }
};

const createCustomEthAccount = async () => {
  try {
    // Get account name or use default
    const accountName = newAccountName.value.trim() || `ETH Account ${nextAccountIndex.value + 1}`;
    
    if (customDerivationPath.value.trim() && customDerivationPath.value.trim().startsWith('m/')) {
      // Direct import from cryptoUtils for custom path
      const { deriveEthereumFromSeedPhrase } = await import('@/utils/cryptoUtils');
      
      // Get the seed phrase from auth store
      const seedPhrase = authStore.seedPhrase;
      if (!seedPhrase) {
        throw new Error('No seed phrase available');
      }
      
      // Generate account with custom path
      const newAccount = await deriveEthereumFromSeedPhrase(seedPhrase, customDerivationPath.value.trim());
      
      // Add account to auth store's list with custom name
      newAccount.name = accountName;
      
      // Check if we already have an account with this address
      const existingAccount = ethAccounts.value.find(acc => acc.address === newAccount.address);
      if (existingAccount) {
        throw new Error('Account with this derivation path already exists');
      }
      
      // Add to accounts and switch to it
      authStore.ethAccounts.push(newAccount);
      authStore.saveStateToLocalStorage();
      
      // Switch to the new account
      switchToEthAccount(authStore.ethAccounts.length - 1);
    } else {
      // Generate account with next index
      await authStore.generateEthAccount();
      
      // Update the name of the newly created account
      if (ethAccounts.value.length > 0) {
        const lastIndex = ethAccounts.value.length - 1;
        ethAccounts.value[lastIndex].name = accountName;
        
        // Save state
        authStore.saveStateToLocalStorage();
        
        // Switch to the new account
        switchToEthAccount(lastIndex);
      }
    }
    
    // Reset form
    newAccountName.value = `ETH Account ${nextAccountIndex.value + 1}`;
    customDerivationPath.value = '';
    
  } catch (error) {
    console.error('Error creating custom ETH account:', error);
    alert(`Error creating account: ${error.message}`);
  }
};

const startRenameAccount = (index) => {
  editingAccountIndex.value = index;
  editAccountName.value = ethAccounts.value[index]?.name || '';
};

const renameEthAccount = () => {
  if (editingAccountIndex.value >= 0 && editAccountName.value.trim()) {
    // Update the account name
    ethAccounts.value[editingAccountIndex.value].name = editAccountName.value.trim();
    
    // Save state
    authStore.saveStateToLocalStorage();
    
    // Reset editing state
    editingAccountIndex.value = -1;
    editAccountName.value = '';
  }
};

const switchEthNetwork = async () => {
  await authStore.switchEthNetwork(selectedEthNetwork.value);
};

const switchToIcpChain = () => {
  authStore.switchToIcpChain();
};

const switchToEthereumChain = async () => {
  await authStore.switchToEthereumChain();
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

// Initialize if needed
onMounted(() => {
  // Check if we need to initialize ethereum accounts
  if (isAuthenticated.value && authStore.hasSeedPhrase && !hasEthAccounts.value) {
    authStore.initializeEthAccounts(1).then(() => {
      console.log('Initial Ethereum account created');
    }).catch(err => {
      console.error('Failed to initialize Ethereum account:', err);
    });
  }
  
  // Set initial value for new account name
  newAccountName.value = `ETH Account ${nextAccountIndex.value + 1}`;
});
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

/* Add new styles for chain switcher */
.chain-switcher {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--cosmic-radius-md);
  padding: 0.5rem;
}

.chain-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--cosmic-radius-sm);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.chain-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--cosmic-text-primary);
}

.chain-btn.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.chain-icon {
  width: 20px;
  height: 20px;
}

/* Ethereum account manager */
.eth-account-manager-overlay {
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

.eth-account-manager-dialog {
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
}

.eth-account-manager-dialog h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-primary);
  text-align: center;
}

.eth-network-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
}

.eth-network-selector label {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

.eth-network-selector select {
  flex-grow: 1;
  padding: 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
  outline: none;
}

.eth-network-selector select:focus {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.eth-accounts-list {
  max-height: 40vh;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.5rem;
}

.eth-account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.eth-account-item:hover {
  background: rgba(15, 185, 253, 0.05);
  border-color: rgba(15, 185, 253, 0.15);
}

.eth-account-item.active {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.eth-account-info {
  flex-grow: 1;
}

.eth-account-name {
  font-weight: 500;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}

.eth-account-name-input {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: var(--cosmic-radius-sm);
  color: var(--cosmic-text-primary);
  font-size: 0.9rem;
  width: 150px;
}

.eth-account-address {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.25rem;
}

.eth-account-path {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--cosmic-text-tertiary);
}

.eth-account-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.eth-account-buttons {
  display: flex;
  gap: 0.5rem;
}

.eth-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.eth-action-btn.copy-btn:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
}

.eth-action-btn.rename-btn:hover {
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.eth-account-select-btn {
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  padding: 0.25rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.eth-account-select-btn:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.eth-account-active-badge {
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.3);
  color: #27ae60;
  padding: 0.25rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  font-size: 0.8rem;
}

.eth-derivation-section {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
}

.eth-derivation-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
  font-size: 1rem;
}

.derivation-path-input {
  margin-bottom: 1rem;
}

.derivation-path-input label,
.eth-account-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

.eth-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-sm);
  color: var(--cosmic-text-primary);
  margin-bottom: 0.5rem;
}

.eth-input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.derivation-info {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  margin: 0.25rem 0 0.5rem;
}

.eth-manager-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

@media (max-width: 480px) {
  .eth-account-manager-dialog {
    width: 95%;
    height: 80vh;
    display: flex;
    flex-direction: column;
  }
  
  .eth-accounts-list {
    flex-grow: 1;
  }
  
  .eth-account-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .eth-account-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
}
</style> 