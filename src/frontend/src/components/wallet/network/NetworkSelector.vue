<template>
  <div class="network-selector">
    <div 
      class="selected-network"
      @click="toggleNetworksMenu"
    >
      <div class="network-icon">
        <img :src="getNetworkIcon(currentNetwork.id)" :alt="currentNetwork.name" />
      </div>
      
      <div class="network-name">{{ currentNetwork.name }}</div>
      
      <div class="network-toggle">
        <i class="fas fa-chevron-down" :class="{'rotated': showNetworksMenu}"></i>
      </div>
    </div>
    
    <!-- Networks dropdown menu -->
    <div 
      v-if="showNetworksMenu" 
      class="networks-menu"
      v-click-outside="closeNetworksMenu"
    >
      <div class="networks-menu-header">
        <span>Select Network</span>
        <div class="network-toggle">
          <span class="toggle-label">Testnets</span>
          <div class="toggle-switch" @click="toggleShowTestnets">
            <div class="toggle-handle" :class="{'active': showTestnets}"></div>
          </div>
        </div>
      </div>
      
      <div class="networks-list">
        <div 
          v-for="network in filteredNetworks" 
          :key="network.id"
          class="network-option"
          :class="{'selected': network.id === currentNetwork.id}"
          @click="selectNetwork(network)"
        >
          <div class="network-icon small">
            <img :src="getNetworkIcon(network.id)" :alt="network.name" />
          </div>
          
          <div class="network-name">{{ network.name }}</div>
          
          <div v-if="network.isTestnet" class="network-badge">Testnet</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import AccountHeader from './components/wallet/account/AccountHeader.vue';
import TokenList from './components/wallet/tokens/TokenList.vue';

export default {
  name: 'NetworkSelector',
  props: {
    currentNetwork: {
      type: Object,
      default: () => ({
        id: 'icp',
        name: 'Internet Computer'
      })
    }
  },
  emits: ['network-changed'],
  setup(props, { emit }) {
    const showNetworksMenu = ref(false);
    const showTestnets = ref(false);
    const selectedNetwork = ref(props.currentNetwork);
    
    // Network options
    const networks = ref([
      {
        id: 'icp',
        name: 'Internet Computer',
        isTestnet: false,
        icon: '/images/networks/icp.svg'
      },
      {
        id: 'eth',
        name: 'Ethereum',
        isTestnet: false,
        icon: '/images/networks/ethereum.svg'
      },
      {
        id: 'btc',
        name: 'Bitcoin',
        isTestnet: false,
        icon: '/images/networks/bitcoin.svg'
      },
      {
        id: 'sol',
        name: 'Solana',
        isTestnet: false,
        icon: '/images/networks/solana.svg'
      },
      {
        id: 'icp-testnet',
        name: 'ICP Testnet',
        isTestnet: true,
        icon: '/images/networks/icp.svg'
      },
      {
        id: 'eth-goerli',
        name: 'Goerli Testnet',
        isTestnet: true,
        icon: '/images/networks/ethereum.svg'
      },
      {
        id: 'eth-sepolia',
        name: 'Sepolia Testnet',
        isTestnet: true,
        icon: '/images/networks/ethereum.svg'
      },
      {
        id: 'btc-testnet',
        name: 'Bitcoin Testnet',
        isTestnet: true,
        icon: '/images/networks/bitcoin.svg'
      }
    ]);
    
    const filteredNetworks = computed(() => {
      if (showTestnets.value) {
        return networks.value;
      } else {
        return networks.value.filter(network => !network.isTestnet);
      }
    });
    
    // Load saved state
    onMounted(() => {
      try {
        const savedShowTestnets = localStorage.getItem('showTestnets');
        if (savedShowTestnets !== null) {
          showTestnets.value = savedShowTestnets === 'true';
        }
      } catch (error) {
        console.error('Error loading saved testnet state:', error);
      }
    });
    
    function toggleNetworksMenu() {
      showNetworksMenu.value = !showNetworksMenu.value;
    }
    
    function closeNetworksMenu() {
      showNetworksMenu.value = false;
    }
    
    function toggleShowTestnets() {
      showTestnets.value = !showTestnets.value;
      // Save to localStorage
      try {
        localStorage.setItem('showTestnets', showTestnets.value.toString());
      } catch (error) {
        console.error('Error saving testnet state:', error);
      }
    }
    
    function selectNetwork(network) {
      if (network.id !== selectedNetwork.value.id) {
        selectedNetwork.value = network;
        emit('network-changed', network);
      }
      closeNetworksMenu();
    }
    
    function getNetworkIcon(networkId) {
      const network = networks.value.find(n => n.id === networkId);
      if (network && network.icon) {
        return network.icon;
      }
      
      // Fallback icon
      return '/images/networks/default.svg';
    }
    
    return {
      showNetworksMenu,
      showTestnets,
      filteredNetworks,
      toggleNetworksMenu,
      closeNetworksMenu,
      toggleShowTestnets,
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
  padding: 0.5rem 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-network:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.network-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmic-glass-bg);
}

.network-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.network-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--cosmic-text-secondary);
}

.network-toggle {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  display: flex;
  align-items: center;
}

.network-toggle .rotated {
  transform: rotate(180deg);
}

.networks-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 220px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  border: var(--cosmic-glass-border);
  box-shadow: var(--cosmic-shadow-md);
  z-index: 10;
  overflow: hidden;
  backdrop-filter: var(--cosmic-glass-blur);
}

.networks-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: var(--cosmic-glass-border);
  font-weight: 600;
  font-size: 0.9rem;
}

.networks-list {
  max-height: 300px;
  overflow-y: auto;
}

.network-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.network-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.network-option.selected {
  background: rgba(15, 185, 253, 0.2);
}

.network-icon.small {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.network-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-sm);
  margin-left: auto;
  color: var(--cosmic-blue);
}

.toggle-switch {
  width: 2.25rem;
  height: 1.25rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 1rem;
  position: relative;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: all 0.2s ease;
}

.toggle-handle {
  width: 0.75rem;
  height: 0.75rem;
  background: var(--cosmic-text-tertiary);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 0.25rem;
  transform: translateY(-50%);
  transition: all 0.2s ease;
}

.toggle-handle.active {
  left: 1.25rem;
  background: var(--cosmic-blue);
}

.toggle-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}
</style>
