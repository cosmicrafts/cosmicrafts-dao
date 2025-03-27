<template>
  <div class="network-selector">
    <div class="selected-network" @click="toggleNetworkMenu">
      <div class="network-icon" :class="selectedNetwork.id">
        <img :src="networkIcons[selectedNetwork.id]" :alt="selectedNetwork.name">
      </div>
      <div class="network-name-container">
        <span class="network-name">{{ selectedNetwork.name }}</span>
      </div>
      <i class="fas fa-chevron-down"></i>
    </div>
    
    <div v-if="showNetworkMenu" class="network-menu">
      <div class="menu-header">
        <span>Select Network</span>
        <button class="close-button" @click.stop="showNetworkMenu = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="network-list">
        <div 
          v-for="network in availableNetworks" 
          :key="network.id"
          class="network-option"
          :class="{ 
            active: selectedNetwork.id === network.id,
            disabled: network.disabled
          }"
          @click="selectNetwork(network)"
        >
          <div class="network-icon" :class="network.id">
            <img :src="networkIcons[network.id]" :alt="network.name">
          </div>
          <div class="network-info">
            <span class="network-name">{{ network.name }}</span>
          </div>
          <span v-if="selectedNetwork.id === network.id" class="selected-indicator">
            <i class="fas fa-check"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
// Import icon assets directly
import icpIcon from '@/assets/icons/icp.svg';
import ethereumIcon from '@/assets/icons/ethereum.svg';
import solanaIcon from '@/assets/icons/solana.svg';

export default {
  name: 'NetworkSelector',
  emits: ['network-changed'],
  setup(props, { emit }) {
    const showNetworkMenu = ref(false);
    const authStore = useAuthStore();
    
    // Create a map of network IDs to icon assets
    const networkIcons = {
      icp: icpIcon,
      ethereum: ethereumIcon,
      sol: solanaIcon
    };
    
    // Available networks
    const availableNetworks = ref([
      {
        id: 'icp',
        name: 'Internet Computer',
        status: 'mainnet',
        chain: 'icp',
        isActive: true
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        status: 'mainnet',
        chain: 'ethereum',
        disabled: false,
        isActive: true
      },
      {
        id: 'sol',
        name: 'Solana (soon)',
        status: 'mainnet',
        chain: 'solana',
        disabled: true,
        isActive: false
      }
    ]);
    
    // Get current chain from auth store
    const currentChain = computed(() => authStore.activeChain);
    
    // Get current network from auth store
    const currentEthNetwork = computed(() => authStore.currentEthNetwork);
    
    // Computed property for selected network
    const selectedNetwork = computed(() => {
      if (currentChain.value === 'ethereum') {
        return availableNetworks.value.find(n => n.id === 'ethereum') || availableNetworks.value[0];
      } else {
        return availableNetworks.value.find(n => n.id === 'icp') || availableNetworks.value[0];
      }
    });
    
    // Toggle network menu
    const toggleNetworkMenu = () => {
      showNetworkMenu.value = !showNetworkMenu.value;
    };
    
    // Select a network
    const selectNetwork = async (network) => {
      // Don't do anything for disabled networks
      if (network.disabled) {
        return;
      }
      
      // Close the menu
      showNetworkMenu.value = false;
      
      // If already on this network, do nothing
      if (selectedNetwork.value.id === network.id) {
        return;
      }
      
      try {
        if (network.chain === 'ethereum') {
          // Set active chain to Ethereum
          await authStore.switchToEthereumChain();
        } else if (network.chain === 'icp') {
          // Switch to ICP chain
          authStore.switchToIcpChain();
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('selectedNetwork', network.id);
        
        // Emit event to parent
        emit('network-changed', network);
      } catch (error) {
        console.error(`Error switching to network ${network.id}:`, error);
      }
    };
    
    // Close menu when clicking outside
    const handleOutsideClick = (event) => {
      if (showNetworkMenu.value && !event.target.closest('.network-selector')) {
        showNetworkMenu.value = false;
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleOutsideClick);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
    });
    
    return {
      showNetworkMenu,
      availableNetworks,
      selectedNetwork,
      toggleNetworkMenu,
      selectNetwork,
      networkIcons
    };
  }
};
</script>

<style scoped>
.network-selector {
  position: relative;
  width: 100%;
  height: 100%;
}

.selected-network {
  display: flex;
  align-items: center;
  background: var(--cosmic-gradient-panel);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  padding: 0 0.75rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  height: 100%;
  width: 100%;
  box-shadow: var(--cosmic-shadow-sm);
}

.selected-network:hover {
  background: var(--cosmic-gradient-panel-hover);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  transform: translateY(-2px);
}

.network-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(15, 185, 253, 0.1);
  padding: 2px;
  flex-shrink: 0;
  box-shadow: var(--cosmic-shadow-sm);
}

.network-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.network-name-container {
  flex: 1;
  padding: 0 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.network-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
}

.network-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 220px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  z-index: var(--cosmic-z-dropdown);
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-header span {
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--cosmic-transition-fast);
}

.close-button:hover {
  color: var(--cosmic-text-primary);
}

.network-list {
  max-height: 300px;
  overflow-y: auto;
}

.network-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.network-option:hover {
  background-color: rgba(15, 185, 253, 0.12);
  transform: translateX(3px);
}

.network-option.active {
  background-color: rgba(15, 185, 253, 0.15);
}

.network-option.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.network-info {
  flex: 1;
  margin-left: 0.75rem;
}

.selected-indicator {
  color: var(--cosmic-blue);
  font-size: 1rem;
  filter: drop-shadow(0 0 3px rgba(15, 185, 253, 0.5));
}

/* Network specific styles */
.network-icon.icp {
  background-color: rgba(166, 105, 247, 0.1);
}

.network-icon.ethereum {
  background-color: rgba(98, 126, 234, 0.1);
}

.network-icon.sol {
  background-color: rgba(20, 241, 155, 0.1);
}

@media (max-width: 768px) {
  .network-name {
    font-size: 0.85rem;
  }
  
  .network-menu {
    width: 200px;
  }
  
  .network-option {
    padding: 0.6rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .network-icon {
    width: 24px;
    height: 24px;
  }
  
  .network-menu {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 75vh;
    border-radius: var(--cosmic-radius-lg) var(--cosmic-radius-lg) 0 0;
  }
}
</style> 