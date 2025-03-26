<template>
  <div class="network-selector">
    <div class="selected-network" @click="toggleNetworkMenu">
      <div class="network-icon" :class="selectedNetwork.id">
        <img :src="getNetworkIcon(selectedNetwork.id)" :alt="selectedNetwork.name">
      </div>
      <span class="network-name">{{ selectedNetwork.name }}</span>
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
          :class="{ active: selectedNetwork.id === network.id }"
          @click="selectNetwork(network)"
        >
          <div class="network-icon" :class="network.id">
            <img :src="getNetworkIcon(network.id)" :alt="network.name">
          </div>
          <div class="network-info">
            <span class="network-name">{{ network.name }}</span>
            <span class="network-status" :class="network.status">{{ network.status }}</span>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getNetworkIcon } from '@/utils/IconService';

export default {
  name: 'NetworkSelector',
  emits: ['network-changed'],
  setup(props, { emit }) {
    const showNetworkMenu = ref(false);
    
    // Available networks
    const availableNetworks = ref([
      {
        id: 'icp',
        name: 'Internet Computer',
        status: 'mainnet'
      },
      {
        id: 'eth',
        name: 'Ethereum',
        status: 'mainnet'
      },
      {
        id: 'sol',
        name: 'Solana',
        status: 'mainnet'
      },
      {
        id: 'icp-testnet',
        name: 'ICP Testnet',
        status: 'testnet'
      }
    ]);
    
    // Currently selected network
    const selectedNetwork = ref(availableNetworks.value[0]);
    
    // Toggle network menu
    const toggleNetworkMenu = () => {
      showNetworkMenu.value = !showNetworkMenu.value;
    };
    
    // Select a network
    const selectNetwork = (network) => {
      if (selectedNetwork.value.id !== network.id) {
        selectedNetwork.value = network;
        
        // Save to localStorage
        localStorage.setItem('selectedNetwork', network.id);
        
        // Emit event to parent
        emit('network-changed', network);
      }
      
      showNetworkMenu.value = false;
    };
    
    // Load from localStorage
    const loadSavedNetwork = () => {
      const savedNetworkId = localStorage.getItem('selectedNetwork');
      if (savedNetworkId) {
        const network = availableNetworks.value.find(n => n.id === savedNetworkId);
        if (network) {
          selectedNetwork.value = network;
        }
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
      loadSavedNetwork();
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
      getNetworkIcon
    };
  }
};
</script>

<style scoped>
.network-selector {
  position: relative;
}

.selected-network {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.selected-network:hover {
  background-color: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.network-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.network-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.network-icon.icp {
  background-color: rgba(15, 185, 253, 0.1);
}

.network-icon.eth {
  background-color: rgba(98, 126, 234, 0.1);
}

.network-icon.sol {
  background-color: rgba(148, 76, 234, 0.1);
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
  width: 240px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  z-index: 20;
  overflow: hidden;
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
  transition: background-color 0.2s;
}

.network-option:hover {
  background-color: rgba(15, 185, 253, 0.05);
}

.network-option.active {
  background-color: rgba(15, 185, 253, 0.08);
}

.network-info {
  flex: 1;
  margin-left: 0.75rem;
  display: flex;
  flex-direction: column;
}

.network-status {
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
  width: fit-content;
  margin-top: 0.25rem;
}

.network-status.mainnet {
  background-color: rgba(0, 171, 85, 0.1);
  color: #00ab55;
}

.network-status.testnet {
  background-color: rgba(255, 171, 0, 0.1);
  color: #ffab00;
}

.selected-indicator {
  color: var(--cosmic-blue);
}

@media (max-width: 768px) {
  .network-name {
    font-size: 0.8rem;
  }
  
  .network-menu {
    width: 220px;
  }
}
</style> 