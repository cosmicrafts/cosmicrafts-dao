<template>
  <div class="account-header">
    <div class="account-selector">
      <div 
        class="selected-account"
        @click="toggleAccountsMenu"
      >
        <div class="account-avatar">
          <img :src="currentAccount.avatar || '/images/avatar-placeholder.svg'" :alt="currentAccount.name" />
        </div>
        
        <div class="account-details">
          <span class="account-name">{{ currentAccount.name }}</span>
          <span class="account-id">{{ formatPrincipalId(currentAccount.principalId) }}</span>
        </div>
        
        <div class="account-toggle">
          <i class="fas fa-chevron-down" :class="{'rotated': showAccountsMenu}"></i>
        </div>
      </div>
      
      <!-- Accounts dropdown menu -->
      <div 
        v-if="showAccountsMenu" 
        class="accounts-menu"
        v-click-outside="closeAccountsMenu"
      >
        <div class="accounts-menu-header">
          <span>Select Account</span>
          <button class="menu-action" @click="$emit('action', 'create-account')">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        
        <div class="accounts-list">
          <div 
            v-for="(account, index) in accounts" 
            :key="account.id"
            class="account-option"
            :class="{'selected': account.id === currentAccount.id}"
            @click="selectAccount(index)"
          >
            <div class="account-avatar small">
              <img :src="account.avatar || '/images/avatar-placeholder.svg'" :alt="account.name" />
            </div>
            
            <div class="account-details">
              <span class="account-name">{{ account.name }}</span>
              <span class="account-id">{{ formatPrincipalId(account.principalId) }}</span>
            </div>
          </div>
        </div>
        
        <div class="accounts-menu-footer">
          <button 
            class="menu-action-full"
            @click="$emit('action', 'logout')"
          >
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="account-actions">
      <NetworkSelector 
        :current-network="currentNetwork"
        @network-changed="$emit('network-changed', $event)"
      />
      
      <CurrencySelector
        :current-currency="defaultCurrency"
        @currency-changed="$emit('currency-changed', $event)"
      />
      
      <div class="action-buttons">
        <button 
          class="action-button" 
          @click="copyIdentifier"
          :title="identifierType === 'principal' ? 'Copy Principal ID' : 'Copy Account ID'"
        >
          <i class="fas fa-copy"></i>
        </button>
        
        <button 
          class="action-button" 
          @click="toggleIdentifierType"
          :title="identifierType === 'principal' ? 'Switch to Account ID' : 'Switch to Principal ID'"
        >
          <i class="fas fa-exchange-alt"></i>
        </button>
        
        <button 
          class="action-button" 
          @click="$emit('action', 'settings')"
          title="Settings"
        >
          <i class="fas fa-cog"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import NetworkSelector from '../network/NetworkSelector.vue';
import CurrencySelector from '../currency/CurrencySelector.vue';

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
  emits: ['action', 'currency-changed', 'network-changed', 'account-changed', 'copy-success', 'copy-error'],
  setup(props, { emit }) {
    const showAccountsMenu = ref(false);
    const identifierType = ref('principal'); // 'principal' or 'account'
    const currentAccountIndex = ref(0);
    const currentNetwork = ref({
      id: 'icp',
      name: 'Internet Computer'
    });
    
    // Mock accounts data - in a real app, this would come from a store
    const accounts = ref([
      {
        id: '1',
        name: 'Main Account',
        principalId: 'abc123def456ghi789jkl',
        accountId: '0x1234567890abcdef1234567890abcdef12345678',
        avatar: null
      },
      {
        id: '2',
        name: 'Game Account',
        principalId: 'mno123pqr456stu789vwx',
        accountId: '0xabcdef1234567890abcdef1234567890abcdef12',
        avatar: null
      }
    ]);
    
    const currentAccount = computed(() => {
      return accounts.value[currentAccountIndex.value];
    });
    
    const currentIdentifier = computed(() => {
      if (identifierType.value === 'principal') {
        return currentAccount.value.principalId;
      } else {
        return currentAccount.value.accountId;
      }
    });
    
    // Load saved state
    onMounted(() => {
      try {
        const savedAccountIndex = localStorage.getItem('currentAccountIndex');
        if (savedAccountIndex !== null) {
          currentAccountIndex.value = parseInt(savedAccountIndex, 10);
        }
        
        const savedIdentifierType = localStorage.getItem('identifierType');
        if (savedIdentifierType) {
          identifierType.value = savedIdentifierType;
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    });
    
    function toggleAccountsMenu() {
      showAccountsMenu.value = !showAccountsMenu.value;
    }
    
    function closeAccountsMenu() {
      showAccountsMenu.value = false;
    }
    
    function selectAccount(index) {
      if (index !== currentAccountIndex.value) {
        currentAccountIndex.value = index;
        // Save to localStorage
        try {
          localStorage.setItem('currentAccountIndex', index.toString());
        } catch (error) {
          console.error('Error saving account index:', error);
        }
        
        emit('account-changed', { 
          index, 
          account: accounts.value[index] 
        });
      }
      closeAccountsMenu();
    }
    
    function toggleIdentifierType() {
      identifierType.value = identifierType.value === 'principal' ? 'account' : 'principal';
      // Save to localStorage
      try {
        localStorage.setItem('identifierType', identifierType.value);
      } catch (error) {
        console.error('Error saving identifier type:', error);
      }
    }
    
    function formatPrincipalId(id) {
      if (!id) return '';
      
      // Show first 5 and last 5 characters
      return `${id.substring(0, 5)}...${id.substring(id.length - 5)}`;
    }
    
    async function copyIdentifier() {
      try {
        await navigator.clipboard.writeText(currentIdentifier.value);
        emit('copy-success', { type: identifierType.value });
      } catch (error) {
        console.error('Failed to copy:', error);
        emit('copy-error', { error: error.message });
      }
    }
    
    return {
      showAccountsMenu,
      identifierType,
      accounts,
      currentAccount,
      currentAccountIndex,
      currentNetwork,
      toggleAccountsMenu,
      closeAccountsMenu,
      selectAccount,
      toggleIdentifierType,
      formatPrincipalId,
      copyIdentifier
    };
  }
};
</script>

<style scoped>
.account-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--cosmic-glass-bg);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border);
  margin-bottom: 1rem;
  position: relative;
  backdrop-filter: var(--cosmic-glass-blur);
}

.account-selector {
  position: relative;
}

.selected-account {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-account:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.account-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--cosmic-gradient-blue-alpha);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  overflow: hidden;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-avatar.small {
  width: 2rem;
  height: 2rem;
}

.account-details {
  display: flex;
  flex-direction: column;
}

.account-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

.account-id {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.account-toggle {
  margin-left: 0.75rem;
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.account-toggle .rotated {
  transform: rotate(180deg);
}

.accounts-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 280px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  border: var(--cosmic-glass-border);
  box-shadow: var(--cosmic-shadow-md);
  z-index: 10;
  overflow: hidden;
  backdrop-filter: var(--cosmic-glass-blur);
}

.accounts-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: var(--cosmic-glass-border);
  font-weight: 700;
}

.accounts-list {
  max-height: 300px;
  overflow-y: auto;
}

.account-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.account-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.account-option.selected {
  background: rgba(15, 185, 253, 0.2);
}

.accounts-menu-footer {
  padding: 0.75rem 1rem;
  border-top: var(--cosmic-glass-border);
}

.menu-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-action:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.3);
}

.menu-action-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.2);
  color: var(--cosmic-danger);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-action-full:hover {
  background: rgba(255, 75, 75, 0.2);
  border-color: rgba(255, 75, 75, 0.3);
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
}

@media (max-width: 768px) {
  .account-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .account-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .accounts-menu {
    width: 100%;
  }
}
</style>
