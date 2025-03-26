<template>
  <div class="account-header">
    <!-- Network and account management -->
    <div class="header-top">
      <NetworkSelector @network-changed="handleNetworkChange" />
      
      <!-- Account selector -->
      <div class="account-selector" @click="toggleAccountMenu">
        <div class="account-label">
          <span class="account-icon">A1</span>
          <span class="account-name">{{ getCurrentAccountName() }}</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        
        <!-- Account menu dropdown -->
        <div v-if="showAccountMenu" class="account-menu">
          <div class="menu-header">
            <span>My Accounts</span>
            <button class="add-account-btn" @click.stop="createNewAccount">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div 
            v-for="(account, index) in accounts" 
            :key="index"
            class="account-option"
            :class="{ active: currentAccountIndex === index }"
            @click.stop="selectAccount(index)"
          >
            <span class="account-icon">A{{ index + 1 }}</span>
            <span class="account-name">{{ account.name }}</span>
            <span v-if="currentAccountIndex === index" class="active-indicator">
              <i class="fas fa-check"></i>
            </span>
          </div>
        </div>
      </div>
      
      <!-- Currency selector -->
      <CurrencySelector @currency-changed="handleCurrencyChange" />
    </div>
    
    <!-- Account ID info -->
    <div class="account-id-info">
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
import NetworkSelector from './NetworkSelector.vue';
import CurrencySelector from './CurrencySelector.vue';
import { getNetworkIcon } from '@/utils/IconService';

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
    
    // Account management
    const accounts = ref([{ name: 'Account 1', active: true }]);
    const currentAccountIndex = ref(0);
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
      if (accounts.value[currentAccountIndex.value]) {
        return accounts.value[currentAccountIndex.value].name;
      }
      return `Account ${currentAccountIndex.value + 1}`;
    };
    
    // Methods
    const toggleAccountMenu = () => {
      showAccountMenu.value = !showAccountMenu.value;
    };
    
    const selectAccount = (index) => {
      currentAccountIndex.value = index;
      showAccountMenu.value = false;
      loadAccountData(index);
      emit('account-changed', { index, account: accounts.value[index] });
    };
    
    const createNewAccount = () => {
      const newIndex = accounts.value.length + 1;
      accounts.value.push({ name: `Account ${newIndex}`, active: false });
      saveAccountsToLocalStorage();
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
        loadAccountDataForNetwork(network.id);
      } catch (error) {
        console.error(`Error loading data for network ${network.id}:`, error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Load and fetch data
    const loadAccountsFromLocalStorage = () => {
      try {
        const networkId = currentNetwork.value.id;
        const savedAccounts = localStorage.getItem(`walletAccounts_${networkId}`);
        if (savedAccounts) {
          accounts.value = JSON.parse(savedAccounts);
        }
        
        const savedIndex = localStorage.getItem(`currentAccountIndex_${networkId}`);
        if (savedIndex !== null) {
          currentAccountIndex.value = parseInt(savedIndex, 10);
        }
      } catch (error) {
        console.error('Error loading accounts from localStorage:', error);
      }
    };
    
    const saveAccountsToLocalStorage = () => {
      try {
        const networkId = currentNetwork.value.id;
        localStorage.setItem(`walletAccounts_${networkId}`, JSON.stringify(accounts.value));
        localStorage.setItem(`currentAccountIndex_${networkId}`, currentAccountIndex.value.toString());
      } catch (error) {
        console.error('Error saving accounts to localStorage:', error);
      }
    };
    
    const loadAccountData = async (accountIndex) => {
      isLoading.value = true;
      
      try {
        const networkId = currentNetwork.value.id;
        // First load cached data if available
        const cachedData = localStorage.getItem(`account_${networkId}_${accountIndex}_balance`);
        if (cachedData) {
          const { balance: cachedBalance, timestamp } = JSON.parse(cachedData);
          // Use cached data if it's less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            previousBalance.value = balance.value;
            balance.value = cachedBalance;
          }
        }
        
        // Then fetch fresh data
        await fetchBalanceData(accountIndex);
      } catch (error) {
        console.error('Error loading account data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    const loadAccountDataForNetwork = async (networkId) => {
      // Load accounts for this network
      loadAccountsFromLocalStorage();
      
      // Load balance data for the current account
      await loadAccountData(currentAccountIndex.value);
    };
    
    const fetchBalanceData = async (accountIndex) => {
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
        localStorage.setItem(`account_${networkId}_${accountIndex}_balance`, JSON.stringify({
          balance: balanceNumber,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    
    // Initial setup
    onMounted(() => {
      document.addEventListener('click', (event) => {
        if (showAccountMenu.value && !event.target.closest('.account-selector')) {
          showAccountMenu.value = false;
        }
      });
      
      // Load principal & account IDs from auth store
      if (authStore.isAuthenticated()) {
        const identity = authStore.getIdentity();
        if (identity) {
          const principal = identity.getPrincipal();
          principalId.value = principal.toString();
          
          // Mock account ID for demo
          accountId.value = '1234...5678';
        }
      }
      
      // Load initial network data
      loadNetworkSpecificData(currentNetwork.value);
      
      // Set up periodic refresh of balance data
      const intervalId = setInterval(() => {
        fetchBalanceData(currentAccountIndex.value);
      }, 60000); // Refresh every minute
      
      // Clean up on component unmount
      return () => {
        clearInterval(intervalId);
        document.removeEventListener('click', () => {});
      };
    });
    
    // Watch for auth store changes
    watch(
      () => authStore.authenticated,
      (isAuthenticated) => {
        if (isAuthenticated) {
          loadNetworkSpecificData(currentNetwork.value);
        }
      }
    );
    
    return {
      accounts,
      currentAccountIndex,
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
      getNetworkIcon
    };
  }
};
</script>

<style scoped>
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
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  z-index: 30;
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

.add-account-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-blue);
  cursor: pointer;
  font-size: 1rem;
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
}

.copy-btn:hover {
  color: var(--cosmic-blue);
  background-color: rgba(15, 185, 253, 0.1);
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
}

.action-button:hover {
  background-color: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
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
</style> 