<template>
  <div class="account-header">
    <!-- Network and account management -->
    <div class="header-top">
      <NetworkSelector @network-changed="handleNetworkChange" />
      
      <!-- Account selector -->
      <div class="account-selector" @click="toggleAccountMenu">
        <div class="account-label">
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
                  v-if="addresses.length > 1"
                  class="account-action-button rename-btn"
                  @click.stop="openRenameDialog(index)" 
                  title="Rename Account"
                >
                  <i class="fas fa-pencil-alt"></i>
                </button>
                <button 
                  v-if="addresses.length > 1"
                  class="account-action-button delete-btn"
                  @click.stop="confirmDeleteAddress(index)" 
                  title="Remove Account"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Currency selector -->
      <CurrencySelector @currency-changed="handleCurrencyChange" />
    </div>
    
    <!-- Account ID info with toggle for mobile -->
    <div class="account-id-info">
      <div class="id-toggle" @click="toggleIdSection">
        <span>Account IDs</span>
        <i :class="['fas', idSectionExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </div>
      
      <div class="id-sections" :class="{ 'expanded': idSectionExpanded }">
        <div class="id-section">
          <div class="id-label">Principal ID</div>
          <div class="id-value">
            <span class="id-text">{{ formatId(principalId) }}</span>
            <button class="copy-btn" @click="copyToClipboard(principalId, 'principal')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div class="id-section">
          <div class="id-label">Account ID</div>
          <div class="id-value">
            <span class="id-text">{{ formatId(accountId) }}</span>
            <button class="copy-btn" @click="copyToClipboard(accountId, 'account')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Balance display -->
    <div class="balance-container">
      <div class="main-balance">
        <span class="currency-symbol">{{ currencySymbol }}</span>
        <span class="balance-amount">{{ formattedBalance }}</span>
      </div>
      <div class="balance-change" :class="changeDirection">
        <span>{{ formattedChange }}</span>
        <span>{{ changePercentage }}%</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button class="action-button" @click="handleAction('receive')">
        <i class="fas fa-qrcode"></i>
        <span>Receive</span>
      </button>
      <button class="action-button" @click="handleAction('send')">
        <i class="fas fa-paper-plane"></i>
        <span>Send</span>
      </button>
      <button class="action-button" @click="handleAction('swap')">
        <i class="fas fa-exchange-alt"></i>
        <span>Swap</span>
      </button>
      <button class="action-button" @click="handleAction('buy')">
        <i class="fas fa-dollar-sign"></i>
        <span>Buy</span>
      </button>
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
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import NetworkSelector from './NetworkSelector.vue';
import CurrencySelector from './CurrencySelector.vue';
import { getNetworkIcon } from '@/utils/IconService';
import { validateMnemonic } from 'bip39';

export default {
  name: 'AccountHeader',
  components: {
    NetworkSelector,
    CurrencySelector
  },
  props: {
    defaultCurrency: {
      type: String,
      default: 'USD'
    }
  },
  emits: ['action', 'currency-changed', 'network-changed', 'account-changed'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    
    // IDs from the authentication store
    const principalId = ref('');
    const accountId = ref('');
    
    // Account management using auth store
    const showAccountMenu = ref(false);
    
    // Network management
    const currentNetwork = ref({
      id: 'icp',
      name: 'Internet Computer',
      icon: getNetworkIcon('icp')
    });
    
    // Balance data
    const balance = ref(0);
    const previousBalance = ref(0);
    const isLoading = ref(true);
    const currency = ref({
      code: props.defaultCurrency,
      symbol: '$',
      rate: 1
    });
    
    // Format the balance based on current currency
    const formattedBalance = computed(() => {
      if (isLoading.value) return '0.00';
      
      const convertedBalance = balance.value * currency.value.rate;
      return convertedBalance.toFixed(2);
    });
    
    // Calculate change and percentage
    const change = computed(() => {
      return balance.value - previousBalance.value;
    });
    
    const changePercentage = computed(() => {
      if (previousBalance.value === 0) return '+0.00';
      const percentage = (change.value / previousBalance.value) * 100;
      return percentage > 0 ? `+${percentage.toFixed(2)}` : percentage.toFixed(2);
    });
    
    const formattedChange = computed(() => {
      const convertedChange = change.value * currency.value.rate;
      return convertedChange > 0 ? `+${convertedChange.toFixed(2)}` : convertedChange.toFixed(2);
    });
    
    const changeDirection = computed(() => {
      return change.value >= 0 ? 'positive' : 'negative';
    });
    
    const currencySymbol = computed(() => {
      return currency.value.symbol || '$';
    });
    
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
    
    // Copy ID to clipboard
    const copyToClipboard = async (text, type) => {
      try {
        await navigator.clipboard.writeText(text);
        emit('copy-success', { type });
      } catch (error) {
        console.error('Failed to copy:', error);
        emit('copy-error', { error: error.message });
      }
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
        
        isLoading.value = true;
        
        // Switch address in auth store
        const success = await authStore.switchToAddress(index);
        
        if (success) {
          showAccountMenu.value = false;
          
          // Update IDs
          const currentAddress = addresses.value[index];
          if (currentAddress) {
            principalId.value = currentAddress.principalId;
            
            // Account ID would need to be recalculated here, this is just a placeholder
            accountId.value = '...calculating...'; 
          }
          
          // Refresh token balances
          await tokenStore.refreshAllBalances();
          
          // Emit event
          emit('account-changed', { 
            index,
            address: currentAddress
          });
        }
      } catch (error) {
        console.error('Error switching account:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    const createNewAccount = async () => {
      try {
        // First close menu to prevent user spam clicking
        showAccountMenu.value = false;
        isLoading.value = true;
        
        // Generate new address from auth store
        const newAddress = await authStore.generateNewAddress();
        
        if (newAddress) {
          // Switch to the new address
          await authStore.switchToAddress(addresses.value.length - 1);
          
          // Update IDs
          principalId.value = newAddress.principalId;
          // Account ID would need to be recalculated
          
          // Refresh balance
          await fetchBalanceData();
        }
      } catch (error) {
        console.error('Error creating new account:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleAction = (action) => {
      emit('action', action);
    };
    
    const handleCurrencyChange = (newCurrency) => {
      currency.value = newCurrency;
      emit('currency-changed', newCurrency);
    };
    
    const handleNetworkChange = (network) => {
      currentNetwork.value = network;
      // Reset IDs when network changes
      loadNetworkSpecificData(network);
      emit('network-changed', network);
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
          // This method needs to be implemented
          // It should validate the seed phrase first
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
    
    // Load account data from the auth store
    const loadAccountData = async () => {
      isLoading.value = true;
      
      try {
        // Get current address
        if (addresses.value && addresses.value.length > currentAddressIndex.value) {
          const currentAddress = addresses.value[currentAddressIndex.value];
          
          // Update IDs
          principalId.value = currentAddress.principalId;
          
          // Account ID would need to be calculated here
          // using AccountIdentifier.fromPrincipal
          
          // Load balance data
          await fetchBalanceData();
        }
      } catch (error) {
        console.error('Error loading account data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Fetch balance data for the current account
    const fetchBalanceData = async () => {
      try {
        const networkId = currentNetwork.value.id;
        
        // This would vary based on the network
        let balanceNumber = 0;
        
        if (networkId.startsWith('icp')) {
          // Get ICP balance from token store
          const icpBalance = await tokenStore.getBalance('ICP');
          
          // Convert from bigint to number (assuming reasonable size)
          balanceNumber = parseFloat(icpBalance.toString()) / 100000000; // 8 decimals for ICP
        } else {
          // Mock data for other networks
          // In a real app, you would use network-specific API calls
          balanceNumber = networkId === 'eth' ? 0.25 : networkId === 'sol' ? 12.5 : 0;
        }
        
        // Store previous balance for change calculation
        previousBalance.value = balance.value;
        balance.value = balanceNumber;
        
        // Cache the result
        localStorage.setItem(`account_${networkId}_${currentAddressIndex.value}_balance`, JSON.stringify({
          balance: balanceNumber,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    
    // Load network-specific data (accounts, balances, etc.)
    const loadNetworkSpecificData = async (network) => {
      isLoading.value = true;
      
      try {
        // For ICP network, use the ICP identity
        if (network.id === 'icp' || network.id === 'icp-testnet') {
          const identity = authStore.getIdentity();
          if (identity) {
            const principal = identity.getPrincipal();
            principalId.value = principal.toString();
            
            // Account ID would be calculated differently for each network
            // For now, we'll use a mock for non-ICP networks
            if (network.id.startsWith('icp')) {
              // This would use the correct AccountIdentifier calculation in real code
              accountId.value = '1234...5678'; // Placeholder
            } else {
              accountId.value = '9876...5432'; // Placeholder
            }
          }
        } else {
          // Mock data for other networks
          principalId.value = network.id === 'eth' 
            ? '0x1234...5678' 
            : network.id === 'sol' 
              ? 'ABCD...XYZ' 
              : '---';
          accountId.value = network.id === 'eth' 
            ? '0x8765...4321' 
            : network.id === 'sol' 
              ? 'WXYZ...ABC' 
              : '---';
        }
        
        // Load account data for this network
        await loadAccountData();
      } catch (error) {
        console.error(`Error loading data for network ${network.id}:`, error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Get address avatar 
    const getAddressAvatar = (index) => {
      // Simple function to get a different avatar for each address
      const avatarIndex = (index % 12) + 1; // Loop through 12 different avatars
      return `/assets/avatars/avatar_${avatarIndex}.png`;
    };
    
    // Initial setup
    onMounted(async () => {
      const handleClickOutside = (event) => {
        if (showAccountMenu.value && 
            !event.target.closest('.account-selector') && 
            !event.target.closest('.account-menu')) {
          showAccountMenu.value = false;
          document.body.style.overflow = '';
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      
      try {
        // If no derivedAddresses yet and the user is authenticated, create the first address
        if ((!addresses.value || addresses.value.length === 0) && authStore.isAuthenticated()) {
          const seedPhrase = authStore.seedPhrase;
          if (seedPhrase) {
            await authStore.handleLoginFlow(seedPhrase);
          }
        }
        
        // Load user IDs from current address
        if (addresses.value && addresses.value.length > currentAddressIndex.value) {
          const currentAddress = addresses.value[currentAddressIndex.value];
          principalId.value = currentAddress.principalId;
          // Account ID would need to be calculated
        }
        
        // Load initial network data
        await loadNetworkSpecificData(currentNetwork.value);
        
        // Set up periodic refresh of balance data
        const intervalId = setInterval(() => {
          fetchBalanceData();
        }, 60000); // Refresh every minute
        
        // Clean up on component unmount
        return () => {
          clearInterval(intervalId);
          document.removeEventListener('click', handleClickOutside);
          document.body.style.overflow = ''; // Reset overflow if component unmounts
        };
      } catch (error) {
        console.error('Error initializing account header:', error);
      }
    });
    
    // Watch for auth store changes
    watch(
      () => authStore.authenticated,
      async (isAuthenticated) => {
        if (isAuthenticated) {
          // Update IDs
          if (addresses.value && addresses.value.length > currentAddressIndex.value) {
            const currentAddress = addresses.value[currentAddressIndex.value];
            principalId.value = currentAddress.principalId;
            // Account ID would need to be calculated
          }
          
          // Load account data
          await loadNetworkSpecificData(currentNetwork.value);
        }
      }
    );
    
    // Add to setup function
    const idSectionExpanded = ref(true);

    const toggleIdSection = () => {
      // Only toggle on mobile
      if (window.innerWidth <= 480) {
        idSectionExpanded.value = !idSectionExpanded.value;
      }
    };
    
    return {
      addresses,
      currentAddressIndex,
      showAccountMenu,
      balance,
      formattedBalance,
      isLoading,
      currency,
      change,
      changePercentage,
      formattedChange,
      changeDirection,
      currencySymbol,
      principalId,
      accountId,
      currentNetwork,
      
      formatId,
      copyToClipboard,
      getCurrentAccountName,
      toggleAccountMenu,
      selectAccount,
      createNewAccount,
      handleAction,
      handleCurrencyChange,
      handleNetworkChange,
      getNetworkIcon,
      idSectionExpanded,
      toggleIdSection,
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
      loadAccountData,
      fetchBalanceData,
      getAddressAvatar
    };
  }
};
</script>

<style scoped>
/* Z-index variables */
:root {
  --z-index-base: 1;
  --z-index-token-list: 5;
  --z-index-account-header: 10;
  --z-index-dropdown-menu: 1000;
  --z-index-backdrop: 999;
  --z-index-modal: 1500;
}

.account-header {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  box-shadow: var(--cosmic-shadow-sm);
  border: var(--cosmic-glass-border-blue);
  z-index: var(--z-index-account-header);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.account-selector {
  position: relative;
  flex: 1;
  margin: 0 0.75rem;
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
  z-index: var(--z-index-dropdown-menu);
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
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  cursor: pointer;
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

/* Account IDs styling */
.account-id-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background-color: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem 1rem;
}

.id-toggle {
  display: none;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.id-toggle:active {
  color: var(--cosmic-blue);
}

.id-sections {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.id-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.id-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.id-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.id-text {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.copy-btn:hover {
  color: var(--cosmic-blue);
  background-color: rgba(15, 185, 253, 0.1);
}

.copy-btn:active {
  transform: scale(0.95);
  background-color: rgba(15, 185, 253, 0.2);
}

/* Balance styling */
.balance-container {
  text-align: center;
  margin: 0.5rem 0;
}

.main-balance {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.balance-change {
  font-size: 0.9rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.balance-change.positive {
  color: #00c48c;
}

.balance-change.negative {
  color: #ff5252;
}

/* Action buttons */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem 0;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent; /* Remove highlight on touch */
}

.action-button:hover {
  background-color: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.action-button:active {
  background-color: rgba(15, 185, 253, 0.15);
  transform: translateY(0);
  box-shadow: none;
}

.action-button i {
  font-size: 1.25rem;
  margin-bottom: 0.35rem;
  color: var(--cosmic-blue);
}

.action-button span {
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .header-top {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .account-selector {
    order: 1;
    width: 100%;
    margin: 0.5rem 0;
  }
  
  .action-buttons {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  .action-button {
    padding: 0.6rem 0;
  }
  
  .action-button i {
    font-size: 1.1rem;
  }
  
  .action-button span {
    font-size: 0.75rem;
  }
  
  .main-balance {
    font-size: 2rem;
  }
}

/* Add enhanced mobile styles for smaller screens */
@media (max-width: 480px) {
  .account-header {
    padding: 1rem;
    gap: 1rem;
  }
  
  .header-top {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .account-selector {
    margin: 0;
    width: 100%;
  }
  
  .account-label {
    justify-content: space-between;
    padding: 0.75rem;
  }
  
  .id-toggle {
    display: flex;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    color: var(--cosmic-text-secondary);
  }
  
  .id-toggle:active {
    opacity: 0.7;
  }
  
  .id-sections {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    opacity: 0;
  }
  
  .id-sections.expanded {
    max-height: 200px;
    opacity: 1;
  }
  
  .id-section {
    margin-top: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .id-value {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.25rem;
    background-color: rgba(15, 185, 253, 0.05);
    padding: 0.5rem;
    border-radius: var(--cosmic-radius-sm);
  }
  
  .id-text {
    max-width: 85%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .copy-btn {
    background-color: rgba(15, 185, 253, 0.1);
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
  }
  
  .copy-btn:active {
    transform: scale(0.9);
  }
  
  .main-balance {
    font-size: 1.75rem;
  }
  
  .balance-change {
    font-size: 0.8rem;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .action-button {
    padding: 1rem 0;
    touch-action: manipulation; /* Improves touch response */
    position: relative;
    overflow: hidden;
  }
  
  .action-button:active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(15, 185, 253, 0.15);
    opacity: 0.5;
    border-radius: var(--cosmic-radius-md);
    pointer-events: none;
  }
  
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
  
  .menu-header {
    padding: 0.75rem;
  }
  
  .account-option {
    padding: 0.85rem 0.75rem;
  }
  
  .menu-backdrop {
    display: block;
  }
}

.menu-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-index-backdrop);
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
  z-index: var(--z-index-modal);
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

/* Account option styling */
.account-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md, 8px);
  transition: all 0.2s ease;
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

/* Mobile specific styles */
@media (max-width: 480px) {
  .menu-backdrop {
    display: block;
  }
  
  .modal-container {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .account-action-button {
    opacity: 1;
  }
}
</style> 