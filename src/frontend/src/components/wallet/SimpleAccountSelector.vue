<template>
  <div class="simple-account-selector" :class="$attrs.class">
    <div class="account-label" @click="toggleAccountMenu">
      <div class="account-avatar-container">
        <img v-if="addresses.length > currentAddressIndex" 
             :src="getAddressAvatar(currentAddressIndex)" 
             alt="Account Avatar" 
             class="account-avatar" />
        <span v-else class="account-icon">{{ getAccountInitial() }}</span>
      </div>
      <span class="account-name">{{ getCurrentAccountName() }}</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    
    <!-- Simple account menu dropdown -->
    <div v-if="showAccountMenu" class="account-menu">
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
          <span v-if="index === currentAddressIndex" class="active-indicator">
            <i class="fas fa-check"></i>
          </span>
        </div>
      </div>
      
      <div class="menu-footer">
        <button class="menu-action-full manage-accounts-btn" @click.stop="openAccountManager">
          <i class="fas fa-cog"></i>
          <span>Manage Accounts</span>
        </button>
      </div>
    </div>
    
    <!-- Error notification -->
    <div v-if="errorMessage" class="error-notification">
      {{ errorMessage }}
      <button class="close-error" @click="errorMessage = ''">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
  
  <!-- Backdrop for mobile -->
  <div v-if="showAccountMenu" class="menu-backdrop" @click="toggleAccountMenu"></div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import AvatarService from '@/utils/AvatarService';
import { defineAsyncComponent } from 'vue';

export default {
  name: 'SimpleAccountSelector',
  emits: ['account-changed'],
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const modalStore = useModalStore();
    
    const showAccountMenu = ref(false);
    
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
    
    const getCurrentAccountName = () => {
      if (addresses.value && addresses.value.length > currentAddressIndex.value) {
        return addresses.value[currentAddressIndex.value].name;
      }
      return 'My Account';
    };
    
    const getAccountInitial = (account = null) => {
      const addr = account || (addresses.value && addresses.value[currentAddressIndex.value]);
      if (!addr || !addr.name) return 'A';
      
      return addr.name.charAt(0).toUpperCase();
    };
    
    const getAddressAvatar = (index) => {
      // Use the AvatarService to generate a deterministic avatar based on account index
      // We'll use modulo to cycle through the available avatars (1-12)
      const avatarIndex = (index % AvatarService.TOTAL_AVATARS) + 1;
      return AvatarService.getAvatarById(avatarIndex);
    };
    
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
      if (index === currentAddressIndex.value) {
        showAccountMenu.value = false;
        return;
      }
      
      const success = await authStore.switchToAddress(index);
      
      if (success) {
        showAccountMenu.value = false;
        emit('account-changed', { 
          index,
          account: addresses.value[index]
        });
      }
    };
    
    // Add error state
    const errorMessage = ref('');
    
    const openAccountManager = async () => {
      showAccountMenu.value = false;
      try {
        // Use defineAsyncComponent for better async component handling
        const AccountManagement = defineAsyncComponent(() => 
          import('@/components/wallet/AccountManagement.vue')
        );
        
        // Open the modal with the async component
        modalStore.openModal(AccountManagement, {
          activeTab: 'accounts'
        });
      } catch (error) {
        console.error('Error opening Account Management:', error);
        errorMessage.value = 'Could not open Account Management. Please try again.';
      }
    };
    
    // Handle clicks outside the menu
    onMounted(() => {
      const handleClickOutside = (event) => {
        if (showAccountMenu.value && 
            !event.target.closest('.simple-account-selector') && 
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
      showAccountMenu,
      addresses,
      currentAddressIndex,
      formatId,
      getCurrentAccountName,
      getAccountInitial,
      getAddressAvatar,
      toggleAccountMenu,
      selectAccount,
      openAccountManager,
      errorMessage,
    };
  }
};
</script>

<style scoped>
.simple-account-selector {
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

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.account-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: var(--cosmic-radius-md, 8px);
  transition: all 0.2s ease;
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
  font-size: 0.75rem;
  color: var(--cosmic-text-secondary);
}

.active-indicator {
  margin-left: auto;
  color: var(--cosmic-blue);
}

.menu-footer {
  padding: 0.75rem 0.5rem;
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
}

/* Error notification */
.error-notification {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(255, 75, 75, 0.15);
  border: 1px solid rgba(255, 75, 75, 0.3);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-danger, #ff4b4b);
  font-size: 0.85rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeIn 0.3s ease;
}

.close-error {
  background: transparent;
  border: none;
  color: var(--cosmic-danger, #ff4b4b);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.85rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 