<template>
  <div class="account-header cosmic-panel">
    <!-- Network and account management -->
    <div class="header-controls-grid">
      <!-- Network selector -->
      <div class="control-item network-control">
        <NetworkSelector @network-changed="handleNetworkChange" />
      </div>
      
      <!-- Account selector -->
      <div class="control-item account-control">
        <div class="account-selector" @click="toggleAccountMenu">
          <div class="account-avatar-container">
            <img v-if="addresses.length > currentAddressIndex" :src="getAddressAvatar(currentAddressIndex)" alt="Account Avatar" class="account-avatar" />
            <span v-else class="account-icon">{{ getAccountInitial() }}</span>
          </div>
          <div class="account-details">
            <span class="account-name">{{ getCurrentAccountName() }}</span>
          </div>
          <i class="fas fa-chevron-down"></i>
        </div>
        
        <!-- Account menu dropdown -->
        <div v-if="showAccountMenu" class="cosmic-dropdown-menu account-menu">
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
          <div class="menu-footer">
            <button class="cosmic-button cosmic-button-outline-primary menu-action-full" @click.stop="showSeedPhrase" title="Backup Recovery Phrase">
              <i class="fas fa-key"></i>
              <span>View Recovery Phrase</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Currency selector -->
      <div class="control-item currency-control">
        <CurrencySelector @currency-changed="handleCurrencyChange" />
      </div>
    </div>
    
    <!-- Account Information -->
    <div class="account-id-info">
      <div class="id-toggle" @click="toggleIdSection">
        <span>{{ activeChain === 'ethereum' ? 'Ethereum Address' : 'Account IDs' }}</span>
        <i :class="['fas', idSectionExpanded ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </div>
      
      <div class="id-sections" :class="{ 'expanded': idSectionExpanded }">
        <div v-if="activeChain !== 'ethereum'" class="id-section">
          <div class="id-label">Principal ID</div>
          <div class="id-value">
            <span class="id-text">{{ formatId(principalId) }}</span>
            <button class="copy-btn" @click="copyToClipboard(principalId, 'principal')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div v-if="activeChain !== 'ethereum'" class="id-section">
          <div class="id-label">Account ID</div>
          <div class="id-value">
            <span class="id-text">{{ formatId(accountId) }}</span>
            <button class="copy-btn" @click="copyToClipboard(accountId, 'account')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div v-if="activeChain === 'ethereum'" class="id-section">
          <div class="id-label">ETH Address</div>
          <div class="id-value">
            <span class="id-text">{{ formatEthAddress }}</span>
            <button class="copy-btn" @click="copyToClipboard(currentEthAccount?.address || '', 'ethereum')">
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
      <button class="cosmic-button cosmic-button-outline-primary action-button" @click="handleAction('receive')">
        <i class="fas fa-qrcode"></i>
        <span class="button-text">Receive</span>
      </button>
      <button class="cosmic-button cosmic-button-outline-primary action-button" @click="handleAction('send')">
        <i class="fas fa-paper-plane"></i>
        <span class="button-text">Send</span>
      </button>
      <button class="cosmic-button cosmic-button-outline-primary action-button" @click="handleAction('swap')">
        <i class="fas fa-exchange-alt"></i>
        <span class="button-text">Swap</span>
      </button>
      <button class="cosmic-button cosmic-button-outline-primary action-button" @click="handleAction('buy')">
        <i class="fas fa-dollar-sign"></i>
        <span class="button-text">Buy</span>
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
        <button class="cosmic-button cosmic-button-outline-primary" @click="showRenameDialog = false">Cancel</button>
        <button class="cosmic-button cosmic-button-primary" @click="handleRenameAccount">Save</button>
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
        <button class="cosmic-button cosmic-button-outline-primary" @click="showDeleteDialog = false">Cancel</button>
        <button class="cosmic-button cosmic-button-danger" @click="handleDeleteAccount">Remove</button>
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
        <button class="cosmic-button cosmic-button-outline-primary" @click="showImportDialog = false">Cancel</button>
        <button class="cosmic-button cosmic-button-primary" @click="handleImportAccount">Import</button>
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
        <button class="cosmic-button cosmic-button-outline-primary" @click="showRecoverDialog = false">Cancel</button>
        <button 
          class="cosmic-button cosmic-button-primary" 
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
import NetworkSelector from '@/components/wallet/NetworkSelector.vue';
import CurrencySelector from './CurrencySelector.vue';
import { getNetworkIcon } from '@/utils/IconService';
import { validateMnemonic } from 'bip39';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import { calculateAccountId } from '@/utils/cryptoUtils';

export default {
  name: 'AccountHeader',
  components: {
    NetworkSelector,
    CurrencySelector,
  },
  props: {
    defaultCurrency: {
      type: String,
      default: 'USD'
    }
  },
  emits: ['action', 'currency-changed', 'network-changed', 'account-changed', 'copy-success', 'copy-error'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const tokenStore = useTokenStore();
    const modalStore = useModalStore();
    
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
        emit('copy-success', { success: true, type });
      } catch (error) {
        console.error('Failed to copy:', error);
        emit('copy-error', { success: false, type, error: error.message });
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
            
            // Calculate proper account ID
            try {
              const principal = Principal.fromText(currentAddress.principalId);
              accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
            } catch (error) {
              console.error('Error calculating account ID:', error);
              accountId.value = 'Error calculating';
            }
          }
          
          // Refresh token balances
          await tokenStore.refreshAllBalances();
          
          // Emit event
          emit('account-changed', { 
            index,
            account: currentAddress
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
          
          // Calculate proper account ID
          try {
            const principal = Principal.fromText(newAddress.principalId);
            accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
          } catch (error) {
            console.error('Error calculating account ID:', error);
            accountId.value = 'Error calculating';
          }
          
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
    
    const handleNetworkChange = async (network) => {
      console.log('Network changed to:', network.name);
      // Balance will be updated via the activeChain watcher
      await fetchBalanceData();
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
    
    // Show recover account dialog
    const showRecoverAccountDialog = () => {
      recoverySeedPhrase.value = '';
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
        
        // Update the UI with the new account data
        await loadAccountData();
        
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
    const showSeedPhrase = () => {
      authStore.showSeedPhrase();
      showAccountMenu.value = false;
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
        if (isLoading.value) return; // Don't run if already loading
        
        isLoading.value = true;
        const currentChain = activeChain.value;
        let balanceNumber = 0;
        
        if (currentChain === 'ethereum' && authStore.hasEthAccounts) {
          try {
            // Get ETH balance from the service
            const ethBalance = await authStore.getEthBalance();
            
            // Parse float to convert string to number
            balanceNumber = parseFloat(ethBalance || '0');
          } catch (ethError) {
            console.error('Error fetching ETH balance:', ethError);
            balanceNumber = 0;
          }
        } else if (currentChain === 'icp') {
          try {
            // Get ICP balance from token store
            const tokenStore = useTokenStore();
            const icpBalance = await tokenStore.getBalance('ICP');
            
            // Convert from bigint to number
            balanceNumber = parseFloat(icpBalance.toString() || '0') / 100000000; // 8 decimals for ICP
          } catch (icpError) {
            console.error('Error fetching ICP balance:', icpError);
            balanceNumber = 0;
          }
        }
        
        // Store previous balance for change calculation
        previousBalance.value = balance.value;
        balance.value = balanceNumber || 0;
        
        // Cache the result with chain info
        try {
          localStorage.setItem(`account_${currentChain}_balance`, JSON.stringify({
            balance: balanceNumber,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          console.warn('Failed to cache balance data:', cacheError);
        }
      } catch (error) {
        console.error('Error in fetchBalanceData:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Load network-specific data (accounts, balances, etc.)
    const loadNetworkSpecificData = async (network) => {
      isLoading.value = true;
      
      try {
        // Only ICP network is supported for now
        if (network.id === 'icp') {
          // First check authentication status
          if (!authStore.isAuthenticated()) {
            // Try to initialize identity from cache
            const initialized = authStore.initializeIdentityFromCache();
            console.log('Identity initialization from cache:', initialized);
            
            if (!initialized) {
              console.warn('User not authenticated, cannot load network data');
              principalId.value = 'Not authenticated';
              accountId.value = 'Not authenticated';
              isLoading.value = false;
              return;
            }
          }
          
          // Get identity from auth store
          const identity = authStore.getIdentity();
          if (identity) {
            // Get principal ID directly from identity
            const principal = identity.getPrincipal();
            principalId.value = principal.toString();
            
            // Calculate account ID from principal using the proper function
            try {
              accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
            } catch (accountError) {
              console.error('Error calculating account ID:', accountError);
              accountId.value = 'Error calculating';
            }
          } else {
            console.error('Identity not available in auth store');
            principalId.value = 'Not available';
            accountId.value = 'Not available';
          }
        } else {
          // For other networks (currently disabled), just show unavailable
          principalId.value = 'Not available';
          accountId.value = 'Not available';
        }
        
        // Load account data for this network
        await loadAccountData();
      } catch (error) {
        console.error(`Error loading data for network ${network.id}:`, error);
        principalId.value = 'Error loading';
        accountId.value = 'Error loading';
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
        
        // First check if we have an active identity in the auth store
        const identity = authStore.getIdentity();
        if (identity) {
          // If we have identity, use it directly - this is the source of truth
          const principal = identity.getPrincipal();
          principalId.value = principal.toString();
          
          // Calculate account ID properly
          try {
            accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
          } catch (error) {
            console.error('Error calculating account ID:', error);
            accountId.value = 'Error calculating';
          }
        }
        // If no identity but we have address info, use that as fallback
        else if (addresses.value && addresses.value.length > currentAddressIndex.value) {
          const currentAddress = addresses.value[currentAddressIndex.value];
          principalId.value = currentAddress.principalId;
          
          // Calculate account ID
          try {
            const principal = Principal.fromText(currentAddress.principalId);
            accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
          } catch (error) {
            console.error('Error calculating account ID from address:', error);
            accountId.value = 'Error calculating';
          }
        }
        
        // Load initial network data, but don't call if we don't need to update IDs
        if (!principalId.value) {
          await loadNetworkSpecificData(currentNetwork.value);
        } else {
          // Only load account data/balances without overwriting IDs
          await loadAccountData();
          await fetchBalanceData();
        }
        
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
    
    // New computed properties
    const activeChain = computed(() => authStore.activeChain);
    const currentEthAccount = computed(() => authStore.currentEthAccount);
    const formatEthAddress = computed(() => {
      const addr = currentEthAccount.value?.address;
      if (!addr) return '';
      return formatId(addr);
    });

    // Add watch for activeChain
    watch(
      () => activeChain.value,
      async () => {
        // Update balances when the chain changes
        await fetchBalanceData();
      }
    );

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
      getAddressAvatar,
      
      // New methods for recovery and seed phrase management
      showSeedPhrase,
      showRecoverDialog,
      recoverySeedPhrase,
      showRecoverAccountDialog,
      handleRecoverAccount,
      recoveryError,
      isRecovering,
      isRecoveryPhraseValid,
      
      // New computed properties
      activeChain,
      formatEthAddress,
      currentEthAccount,
    };
  }
};
</script>

<style scoped>
.account-header {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  box-shadow: var(--cosmic-shadow-sm);
  border: var(--cosmic-glass-border-blue);
  z-index: var(--cosmic-z-account-header);
  transform: translateZ(0);
  transition: all var(--cosmic-transition-medium);
}

.account-header:hover {
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  transform: translateY(-2px);
}

/* New Grid Layout for Controls */
.header-controls-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
  width: 100%;
  align-items: center;
}

.control-item {
  height: 48px;
  position: relative;
}

/* Network Control - Left */
.network-control {
  justify-self: start;
}

/* Account Control - Center */
.account-control {
  justify-self: center;
  width: 100%;
}

/* Currency Control - Right */
.currency-control {
  justify-self: end;
}

/* Account Selector Styling */
.account-selector {
  display: flex;
  align-items: center;
  background: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  padding: 0 0.75rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  height: 100%;
  width: 100%;
}

.account-selector:hover {
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.account-avatar-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
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
  width: 100%;
  height: 100%;
  background-color: rgba(128, 96, 255, 0.15);
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.8rem;
  color: rgb(128, 96, 255);
}

.account-details {
  flex: 1;
  padding: 0 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
}

/* Dropdown Menu Styling */
.cosmic-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  z-index: var(--cosmic-z-dropdown);
  transition: all var(--cosmic-transition-fast);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-header span {
  font-weight: 600;
  color: var(--cosmic-text-primary);
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
  transition: all var(--cosmic-transition-fast);
}

.menu-action:hover {
  color: var(--cosmic-blue-light);
  transform: scale(1.1);
}

.accounts-list {
  padding: 0.5rem;
}

.account-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-sm);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.account-option:hover {
  background: rgba(15, 185, 253, 0.08);
}

.account-option.active {
  background: rgba(15, 185, 253, 0.12);
  border-left: 2px solid var(--cosmic-blue);
}

.account-option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-id {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  font-family: monospace;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity var(--cosmic-transition-fast);
}

.account-option:hover .account-actions {
  opacity: 1;
}

.active-indicator {
  color: var(--cosmic-blue);
}

.account-action-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.account-action-button.rename-btn:hover {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
}

.account-action-button.delete-btn:hover {
  background: rgba(255, 75, 75, 0.15);
  color: var(--cosmic-red);
  border-color: var(--cosmic-red);
}

.menu-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-action-full {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
}

/* Account ID Info Section */
.account-id-info {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
}

.id-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.5rem;
  display: none; /* Hide on desktop */
}

.id-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.id-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.id-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  font-weight: 500;
}

.id-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.id-text {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--cosmic-transition-fast);
}

.copy-btn:hover {
  color: var(--cosmic-blue);
  background: rgba(15, 185, 253, 0.1);
}

/* Balance Section */
.balance-container {
  text-align: center;
  padding: 1.5rem;
  background: var(--cosmic-gradient-panel);
  border-radius: var(--cosmic-radius-md);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-sm);
  transition: all var(--cosmic-transition-medium);
}

.balance-container:hover {
  background: var(--cosmic-gradient-panel-hover);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.main-balance {
  font-size: 2.5rem;
  font-weight: 700;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
  margin-bottom: 0.5rem;
}

.balance-change {
  font-size: 1rem;
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
}

.balance-change.positive {
  color: var(--cosmic-green);
}

.balance-change.negative {
  color: var(--cosmic-red);
}

/* Action Buttons */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 0.5rem;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-button i {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.action-button .button-text {
  font-size: 0.9rem;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--cosmic-z-modal);
}

.modal-container {
  width: 90%;
  max-width: 500px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
  overflow: hidden;
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
  color: var(--cosmic-text-primary);
  font-size: 1.25rem;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
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
  color: var(--cosmic-text-secondary);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--cosmic-radius-sm);
  color: var(--cosmic-text-primary);
  transition: all var(--cosmic-transition-fast);
}

.form-input:focus, .form-textarea:focus {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
  outline: none;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
  font-family: monospace;
}

.warning-text {
  color: var(--cosmic-red);
  font-weight: 500;
  margin-bottom: 1rem;
}

.info-text {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

.error-message {
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.2);
  color: var(--cosmic-red);
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  margin: 1rem 0;
}

.help-text {
  color: var(--cosmic-text-tertiary);
  font-size: 0.85rem;
  margin-top: 1rem;
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

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--cosmic-z-backdrop);
  cursor: pointer;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .header-controls-grid {
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .header-controls-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 0.75rem;
  }
  
  .network-control {
    grid-column: 1;
    grid-row: 1;
  }
  
  .currency-control {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }
  
  .account-control {
    grid-column: 1 / span 2;
    grid-row: 2;
    justify-self: stretch;
  }
  
  .id-sections {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .account-header {
    padding: 1rem;
  }
  
  .header-controls-grid {
    gap: 0.5rem;
  }
  
  .control-item {
    height: 44px;
  }

  .id-toggle {
    display: flex;
    cursor: pointer;
  }

  .id-sections {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.3s ease, opacity 0.3s ease;
  }

  .id-sections.expanded {
    max-height: 300px;
    opacity: 1;
  }

  .cosmic-dropdown-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    top: auto;
    width: 100%;
    max-height: 75vh;
    transform: none;
    border-radius: var(--cosmic-radius-lg) var(--cosmic-radius-lg) 0 0;
  }

  .action-button {
    padding: 0.6rem;
    min-height: 55px;
  }

  .modal-container {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .account-action-button {
    opacity: 1; /* Always visible on mobile */
  }
}
</style> 