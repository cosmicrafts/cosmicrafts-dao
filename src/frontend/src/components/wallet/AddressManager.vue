<template>
  <div class="address-manager cosmic-panel">
    <div class="manager-header">
      <div class="title-section">
        <h2 class="cosmic-title">{{ $t('wallet.addressManager') || 'Address Manager' }}</h2>
        <p class="description">{{ $t('wallet.addressDescription') || 'Generate and manage multiple addresses from your secure wallet.' }}</p>
      </div>
      
      <div class="action-section">
        <button 
          class="cosmic-button cosmic-button-primary reveal-seed-btn"
          @click="revealSeedPhrase"
        >
          <i class="fas fa-key"></i>
          <span class="button-text">{{ $t('wallet.revealSeed') || 'Reveal Seed Phrase' }}</span>
        </button>
      </div>
    </div>
    
    <div class="address-list">
      <div class="list-header">
        <h3>{{ $t('wallet.yourAddresses') || 'Your Addresses' }}</h3>
        <div class="list-actions">
          <button 
            class="cosmic-button cosmic-button-sm cosmic-button-secondary"
            @click="generateNewAddress"
            :disabled="loading"
          >
            <i class="fas fa-plus"></i>
            <span class="button-text">{{ $t('wallet.newAddress') || 'New Address' }}</span>
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <span>{{ $t('wallet.loading') || 'Loading addresses...' }}</span>
      </div>
      
      <div v-else-if="addresses.length === 0" class="empty-state">
        <i class="fas fa-address-card empty-icon"></i>
        <p>{{ $t('wallet.noAddresses') || 'No addresses found. Generate your first address to get started.' }}</p>
        <button 
          class="cosmic-button cosmic-button-secondary"
          @click="generateNewAddress"
        >
          <i class="fas fa-plus"></i>
          <span class="button-text">{{ $t('wallet.generateFirst') || 'Generate First Address' }}</span>
        </button>
      </div>
      
      <div v-else class="addresses">
        <div 
          v-for="address in addresses" 
          :key="address.index"
          class="address-item"
          :class="{ 'address-active': address.index === currentAddressIndex }"
          @click="selectAddress(address.index)"
        >
          <div class="address-avatar">
            <img :src="getAddressAvatar(address.index)" alt="Address Avatar" />
            <div v-if="address.index === currentAddressIndex" class="active-indicator"></div>
          </div>
          
          <div class="address-details">
            <div class="address-name">
              <span class="name-text">{{ address.name }}</span>
              <span v-if="address.index === 0" class="primary-badge">
                {{ $t('wallet.primary') || 'Primary' }}
              </span>
            </div>
            
            <div class="address-id">
              <span class="id-text">{{ formatPrincipalId(address.principalId) }}</span>
              <button class="copy-button" @click.stop="copyToClipboard(address.principalId)">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          
          <div class="address-actions">
            <button 
              v-if="address.index !== 0"
              class="action-button edit-button" 
              @click.stop="renameAddress(address.index)"
            >
              <i class="fas fa-edit"></i>
            </button>
            
            <button 
              v-if="address.index !== 0 && addresses.length > 1"
              class="action-button delete-button" 
              @click.stop="confirmDeleteAddress(address.index)"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Rename Dialog -->
    <div v-if="showRenameDialog" class="dialog-overlay" @click="cancelRename">
      <div class="dialog rename-dialog" @click.stop>
        <h3>{{ $t('wallet.renameAddress') || 'Rename Address' }}</h3>
        <input 
          v-model="newAddressName" 
          type="text" 
          :placeholder="$t('wallet.enterName') || 'Enter address name'"
          ref="renameInput"
        />
        <div class="dialog-actions">
          <button class="cosmic-button cosmic-button-outline-primary" @click="cancelRename">
            {{ $t('wallet.cancel') || 'Cancel' }}
          </button>
          <button class="cosmic-button cosmic-button-primary" @click="confirmRename">
            {{ $t('wallet.save') || 'Save' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="cancelDelete">
      <div class="dialog delete-dialog" @click.stop>
        <h3>{{ $t('wallet.deleteAddress') || 'Delete Address' }}</h3>
        <p>{{ $t('wallet.deleteWarning') || 'Are you sure you want to delete this address?' }}</p>
        <div class="warning-box">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ $t('wallet.deleteNote') || 'You can always recreate it using your seed phrase.' }}</span>
        </div>
        <div class="dialog-actions">
          <button class="cosmic-button cosmic-button-outline-primary" @click="cancelDelete">
            {{ $t('wallet.cancel') || 'Cancel' }}
          </button>
          <button class="cosmic-button cosmic-button-danger" @click="confirmDelete">
            {{ $t('wallet.delete') || 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useCanisterStore } from '@/stores/canister';

// State
const authStore = useAuthStore();
const modalStore = useModalStore();
const canisterStore = useCanisterStore();

const loading = ref(false);
const showRenameDialog = ref(false);
const showDeleteDialog = ref(false);
const addressToRename = ref(null);
const addressToDelete = ref(null);
const newAddressName = ref('');
const renameInput = ref(null);

// Computed
const addresses = computed(() => {
  return authStore.derivedAddresses || [];
});

const currentAddressIndex = computed(() => {
  return authStore.currentAddressIndex;
});

// Methods
const formatPrincipalId = (principalId) => {
  if (!principalId) return '';
  
  const start = principalId.substring(0, 8);
  const end = principalId.substring(principalId.length - 8);
  return `${start}...${end}`;
};

const getAddressAvatar = (index) => {
  // Simple function to get a different avatar for each address
  // In a real application, you might want to generate this deterministically
  const avatarIndex = (index % 12) + 1; // Loop through 12 different avatars
  return `/assets/avatars/avatar_${avatarIndex}.png`;
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      // Could add a visual indicator that copy succeeded
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
};

const selectAddress = async (index) => {
  if (index === currentAddressIndex.value) return;
  
  try {
    loading.value = true;
    
    // Switch address in auth store
    const success = await authStore.switchToAddress(index);
    
    if (success) {
      // Refresh tokens or other data
      const tokenStore = await import('@/stores/token').then(m => m.useTokenStore());
      tokenStore.refreshAllBalances();
      
      // Refresh player data if applicable
      try {
        const cosmicrafts = await canisterStore.get('cosmicrafts');
        if (cosmicrafts) {
          const player = await authStore.getPlayerByPrincipal(authStore.getIdentity().getPrincipal());
          if (player) {
            authStore.$patch((state) => {
              state.player = player;
            });
          }
        }
      } catch (e) {
        console.error('Error refreshing player data:', e);
      }
    }
  } catch (error) {
    console.error('Error switching address:', error);
  } finally {
    loading.value = false;
  }
};

const generateNewAddress = async () => {
  try {
    loading.value = true;
    
    // Generate new address
    const addressInfo = await authStore.generateNewAddress();
    
    if (addressInfo) {
      // Success, optionally select the new address
      await selectAddress(addresses.value.length - 1);
    }
  } catch (error) {
    console.error('Error generating new address:', error);
  } finally {
    loading.value = false;
  }
};

const revealSeedPhrase = () => {
  authStore.showSeedPhrase();
};

// Rename address functions
const renameAddress = (index) => {
  addressToRename.value = index;
  const address = addresses.value.find(a => a.index === index);
  newAddressName.value = address ? address.name : '';
  showRenameDialog.value = true;
  
  // Focus the input field after dialog appears
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus();
    }
  });
};

const cancelRename = () => {
  showRenameDialog.value = false;
  addressToRename.value = null;
  newAddressName.value = '';
};

const confirmRename = () => {
  if (addressToRename.value === null || !newAddressName.value.trim()) {
    return;
  }
  
  // Find the address in the array
  const index = authStore.derivedAddresses.findIndex(
    a => a.index === addressToRename.value
  );
  
  if (index !== -1) {
    // Update the name
    authStore.derivedAddresses[index].name = newAddressName.value.trim();
    
    // Save to local storage
    authStore.saveStateToLocalStorage();
  }
  
  // Close dialog
  cancelRename();
};

// Delete address functions
const confirmDeleteAddress = (index) => {
  addressToDelete.value = index;
  showDeleteDialog.value = true;
};

const cancelDelete = () => {
  showDeleteDialog.value = false;
  addressToDelete.value = null;
};

const confirmDelete = () => {
  if (addressToDelete.value === null || addressToDelete.value === 0) {
    return; // Can't delete primary address
  }
  
  // If deleting the current address, switch to primary first
  if (addressToDelete.value === currentAddressIndex.value) {
    selectAddress(0);
  }
  
  // Filter out the address to delete
  authStore.derivedAddresses = authStore.derivedAddresses.filter(
    a => a.index !== addressToDelete.value
  );
  
  // Save to local storage
  authStore.saveStateToLocalStorage();
  
  // Close dialog
  cancelDelete();
};

onMounted(() => {
  // Initialize
  loading.value = true;
  
  // Check if we need to generate the initial address
  if (addresses.value.length === 0 && authStore.hasSeedPhrase) {
    generateNewAddress();
  }
  
  loading.value = false;
});
</script>

<style scoped>
.address-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title-section h2 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--cosmic-text-primary);
}

.title-section .description {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.reveal-seed-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
}

.address-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.15);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(15, 185, 253, 0.05);
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.list-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

.addresses {
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.address-item {
  display: flex;
  align-items: center;
  padding: 0.85rem;
  border-radius: var(--cosmic-radius-md);
  margin-bottom: 0.5rem;
  background: rgba(15, 185, 253, 0.02);
  border: 1px solid rgba(15, 185, 253, 0.1);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.address-item:hover {
  background: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.2);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.address-item.address-active {
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.address-avatar {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
  border: 2px solid rgba(15, 185, 253, 0.2);
}

.address-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.active-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--cosmic-success);
  border: 2px solid var(--cosmic-glass-bg-darker);
  box-shadow: 0 0 0 2px rgba(0, 229, 164, 0.3);
}

.address-details {
  flex-grow: 1;
  overflow: hidden;
}

.address-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.name-text {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  font-size: 0.95rem;
}

.primary-badge {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.address-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.id-text {
  font-family: 'Courier New', monospace;
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
}

.copy-button {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--cosmic-transition-fast);
}

.copy-button:hover {
  color: var(--cosmic-blue);
  transform: scale(1.1);
}

.address-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity var(--cosmic-transition-fast);
}

.address-item:hover .address-actions {
  opacity: 1;
}

.action-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: var(--cosmic-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.action-button:hover {
  transform: scale(1.1);
}

.edit-button:hover {
  background: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.delete-button:hover {
  background: rgba(255, 75, 75, 0.2);
  color: var(--cosmic-danger);
  border-color: rgba(255, 75, 75, 0.3);
  box-shadow: 0 0 10px rgba(255, 75, 75, 0.4);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--cosmic-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(15, 185, 253, 0.1);
  border-top-color: var(--cosmic-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--cosmic-text-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: rgba(15, 185, 253, 0.2);
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

/* Dialog styles */
.dialog-overlay {
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
  animation: fadeIn 0.2s ease-out;
}

.dialog {
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
  animation: dialogEnter 0.3s ease-out;
}

.dialog h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
  font-size: 1.2rem;
}

.dialog input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.dialog input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.dialog p {
  margin-bottom: 1rem;
  color: var(--cosmic-text-secondary);
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 145, 0, 0.1);
  border: 1px solid rgba(255, 145, 0, 0.2);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.75rem;
  margin-bottom: 1.5rem;
}

.warning-box i {
  color: var(--cosmic-orange);
  font-size: 1.1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .manager-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .reveal-seed-btn {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
  
  .addresses {
    max-height: 300px;
  }
  
  .address-item {
    flex-wrap: wrap;
  }
  
  .address-actions {
    opacity: 1;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .dialog {
    width: 95%;
    padding: 1.25rem;
  }
}
</style> 