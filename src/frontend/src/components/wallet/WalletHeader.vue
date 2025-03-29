<template>
  <div class="account-header">
    <!-- Network and account management -->
    <div class="header-top">
      <NetworkSelector @network-changed="handleNetworkChange" />
      
      <!-- Account selector -->
      <SimpleAccountSelector class="account-selector-container" @account-changed="handleAccountChange" />
      
      <!-- Currency selector -->
      <CurrencySelector @currency-changed="handleCurrencyChange" />
    </div>
    
    <!-- Chain switcher -->
    <div class="network-selector-container">
      <NetworkSelector @network-changed="handleNetworkChange" />
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
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTokenStore } from '@/stores/token';
import { useModalStore } from '@/stores/modal';
import NetworkSelector from '@/components/wallet/NetworkSelector.vue';
import CurrencySelector from './CurrencySelector.vue';
import SimpleAccountSelector from '@/components/wallet/SimpleAccountSelector.vue';
import { getNetworkIcon } from '@/utils/IconService';
import { validateMnemonic } from 'bip39';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import { calculateAccountId } from '@/utils/cryptoUtils';
import { encryptData, decryptData } from '@/utils/securityUtils';
import * as jsSHA from 'jssha';

export default {
  name: 'AccountHeader',
  components: {
    NetworkSelector,
    CurrencySelector,
    SimpleAccountSelector
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
    
    // Add this handler in the setup function
    const handleAccountChange = async (data) => {
      try {
        const { index, account } = data;
        
        // Update IDs
        if (account) {
          principalId.value = account.principalId;
          
          // Calculate proper account ID
          try {
            const principal = Principal.fromText(account.principalId);
            accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
          } catch (error) {
            console.error('Error calculating account ID:', error);
            accountId.value = 'Error calculating';
          }
        }
        
        // Refresh token balances
        await tokenStore.refreshAllBalances();
        
        // Refresh balance data
        await fetchBalanceData();
      } catch (error) {
        console.error('Error handling account change:', error);
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
          // Wait for core initialization to complete with retry
          const retryInitialization = async (maxAttempts = 3, delayMs = 500) => {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              // First check authentication status
              if (!authStore.isAuthenticated()) {
                // Try to initialize identity from cache with force=true to ensure best chance of success
                const initialized = authStore.initializeIdentityFromCache(true);
                console.log(`Identity initialization attempt ${attempt}/${maxAttempts}:`, initialized);
                
                if (initialized) {
                  break; // Success, exit retry loop
                } else if (attempt < maxAttempts) {
                  // Wait before next attempt
                  console.log(`Waiting ${delayMs}ms before retry ${attempt+1}/${maxAttempts}...`);
                  await new Promise(resolve => setTimeout(resolve, delayMs));
                  delayMs *= 1.5; // Increase delay for each retry
                }
              } else {
                console.log('User already authenticated, proceeding with data loading');
                break; // Already authenticated, no need to retry
              }
            }
          };
          
          // Try to initialize with retry mechanism
          await retryInitialization();
          
          // Check again if we're authenticated
          if (!authStore.isAuthenticated()) {
            console.warn('User not authenticated after retries, cannot load network data');
            principalId.value = 'Not authenticated';
            accountId.value = 'Not authenticated';
            isLoading.value = false;
            return;
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
    
    // Load account data from the auth store
    const loadAccountData = async () => {
      isLoading.value = true;
      
      try {
        const currentPrincipal = authStore.currentAddress?.principalId;
        if (currentPrincipal) {
          principalId.value = currentPrincipal;
          
          // Calculate account ID properly
          try {
            const principal = Principal.fromText(currentPrincipal);
            accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
          } catch (error) {
            console.error('Error calculating account ID:', error);
            accountId.value = 'Error calculating';
          }
        }
        
        // Load balance data
        await fetchBalanceData();
      } catch (error) {
        console.error('Error loading account data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
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

    // Add the chain switching handler function in the component script
    const handleChainSwitch = async (chain) => {
      if (chain === activeChain.value) return;
      
      try {
        if (chain === 'ethereum') {
          await authStore.switchToEthereumChain();
        } else {
          authStore.switchToIcpChain();
        }
        
        // Update UI after chain switch
        await fetchBalanceData();
      } catch (error) {
        console.error(`Error switching to ${chain} chain:`, error);
      }
    };

    // Add these imports at the top of the setup function
    watch(
      () => activeChain.value,
      async (newChain) => {
        // Update balances when the chain changes
        await fetchBalanceData();
        
        // Load appropriate network data
        if (newChain === 'ethereum') {
          // Update the network display for Ethereum
          currentNetwork.value = {
            id: 'ethereum',
            name: authStore.currentEthNetwork === 'mainnet' ? 'Ethereum Mainnet' : 
                  authStore.currentEthNetwork === 'goerli' ? 'Goerli Testnet' : 
                  authStore.currentEthNetwork === 'sepolia' ? 'Sepolia Testnet' : 
                  'Ethereum',
            icon: getNetworkIcon('eth')
          };
        } else {
          // Update for ICP
          currentNetwork.value = {
            id: 'icp',
            name: 'Internet Computer',
            icon: getNetworkIcon('icp')
          };
        }
      }
    );

    // Initial setup
    onMounted(async () => {
      try {
        // Wait a brief moment to let app initialization progress
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // First check if we have an active identity in the auth store
        let identity = authStore.getIdentity();
        
        // If no identity yet, wait a bit more and retry before giving up
        if (!identity) {
          console.log('No identity yet, waiting for initialization to complete...');
          
          // Wait longer to give the auth initialization a chance to complete
          await new Promise(resolve => setTimeout(resolve, 700));
          
          // Try force initialization
          const initialized = authStore.initializeIdentityFromCache(true);
          console.log('Force identity initialization result:', initialized);
          
          // Try getting identity again
          identity = authStore.getIdentity();
        }
        
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
          // Update IDs from current store data
          const identity = authStore.getIdentity();
          if (identity) {
            const principal = identity.getPrincipal();
            principalId.value = principal.toString();
            
            // Calculate account ID
            try {
              accountId.value = AccountIdentifier.fromPrincipal({ principal }).toHex();
            } catch (error) {
              console.error('Error calculating account ID:', error);
              accountId.value = 'Error calculating';
            }
          }
          
          // Load account data
          await loadNetworkSpecificData(currentNetwork.value);
        }
      }
    );
    
    return {
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
      handleAction,
      handleCurrencyChange,
      handleNetworkChange,
      getNetworkIcon,
      idSectionExpanded,
      toggleIdSection,
      loadAccountData,
      fetchBalanceData,
      
      // New computed properties
      activeChain,
      formatEthAddress,
      currentEthAccount,
      
      // New methods for chain switching
      handleChainSwitch,
      handleAccountChange
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

.account-selector-container {
  flex: 1;
  margin: 0 0.75rem;
  height: 36px;
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
  
  .account-selector-container {
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
  
  .account-selector-container {
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

/* Add these new styles for the recovery UI */
.menu-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.backup-btn {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue, #0FB9FD);
}

.backup-btn:hover {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: monospace;
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

/* Add chain switcher styles */
.chain-switcher {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--cosmic-radius-md);
  padding: 0.35rem;
}

.chain-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
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
  width: 18px;
  height: 18px;
}
</style> 