<template>
  <div class="multi-chain-network-selector">
    <div class="current-network" @click="toggleNetworkMenu">
      <div class="network-icon" :style="{ backgroundColor: activeNetwork.color + '20' }">
        <img :src="getNetworkIcon(activeNetwork.id)" :alt="activeNetwork.name">
      </div>
      <div class="network-details">
        <span class="network-name">{{ activeNetwork.name }}</span>
        <span v-if="activeNetwork.testnet" class="network-tag testnet">Testnet</span>
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
      
      <div class="networks-container">
        <!-- Group networks by ecosystem -->
        <div v-for="group in networkGroups" :key="group.name" class="network-group">
          <div class="group-header">
            <span class="group-name">{{ group.name }}</span>
            <div class="group-divider"></div>
          </div>
          
          <div class="network-options">
            <div 
              v-for="network in group.networks" 
              :key="network.id"
              class="network-option"
              :class="{ 
                active: activeNetwork.id === network.id,
                disabled: network.disabled
              }"
              @click="selectNetwork(network)"
            >
              <div class="network-icon" :style="{ backgroundColor: network.color + '20' }">
                <img :src="getNetworkIcon(network.id)" :alt="network.name">
              </div>
              <div class="network-info">
                <div class="info-row">
                  <span class="network-name">{{ network.name }}</span>
                  <span v-if="network.testnet" class="network-tag testnet">Testnet</span>
                  <span v-if="network.disabled" class="network-tag disabled">Coming Soon</span>
                </div>
                
                <div v-if="network.wrappedTokens && Object.keys(network.wrappedTokens).length > 0" class="wrapped-tokens">
                  <span class="wrapped-token-label">Wrapped as:</span>
                  <div class="wrapped-token-list">
                    <div 
                      v-for="(info, symbol) in network.wrappedTokens" 
                      :key="symbol"
                      class="wrapped-token"
                      :class="{ 'coming-soon': info.isComingSoon }"
                    >
                      {{ symbol }}
                    </div>
                  </div>
                </div>
              </div>
              
              <span v-if="activeNetwork.id === network.id" class="active-indicator">
                <i class="fas fa-check"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bridge explanation section -->
      <div class="bridge-info">
        <i class="fas fa-info-circle"></i>
        <span>
          Chains are connected through ICP's Chain-Key technology, allowing secure cross-chain operations.
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getNetworkIcon } from '@/utils/iconUtils';
import crossChainService from '@/services/CrossChainService';

export default {
  name: 'MultiChainNetworkSelector',
  emits: ['network-changed'],
  setup(props, { emit }) {
    // State
    const showNetworkMenu = ref(false);
    const activeNetwork = ref(crossChainService.SUPPORTED_CHAINS.ICP);
    
    // Network groups for the UI
    const networkGroups = computed(() => {
      return [
        {
          name: 'ICP Ecosystem',
          networks: [
            crossChainService.SUPPORTED_CHAINS.ICP
          ]
        },
        {
          name: 'Connected Chains',
          networks: [
            crossChainService.SUPPORTED_CHAINS.ETH,
            crossChainService.SUPPORTED_CHAINS.BTC,
            {
              ...crossChainService.SUPPORTED_CHAINS.SOL,
              disabled: true // Solana integration coming soon
            }
          ]
        }
      ];
    });
    
    // Toggle network menu
    const toggleNetworkMenu = () => {
      showNetworkMenu.value = !showNetworkMenu.value;
    };
    
    // Select a network
    const selectNetwork = (network) => {
      if (network.disabled) return;
      
      activeNetwork.value = network;
      crossChainService.setActiveChain(network.id.toUpperCase());
      showNetworkMenu.value = false;
      
      // Emit event to parent
      emit('network-changed', network);
      
      // Update local storage preference
      localStorage.setItem('activeNetwork', network.id);
    };
    
    // Close menu when clicking outside
    const handleOutsideClick = (event) => {
      if (showNetworkMenu.value && !event.target.closest('.multi-chain-network-selector')) {
        showNetworkMenu.value = false;
      }
    };
    
    // Load saved network from local storage
    const loadSavedNetwork = () => {
      const savedNetworkId = localStorage.getItem('activeNetwork');
      if (savedNetworkId) {
        const upperNetworkId = savedNetworkId.toUpperCase();
        if (crossChainService.SUPPORTED_CHAINS[upperNetworkId]) {
          activeNetwork.value = crossChainService.SUPPORTED_CHAINS[upperNetworkId];
          crossChainService.setActiveChain(upperNetworkId);
        }
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
      activeNetwork,
      networkGroups,
      toggleNetworkMenu,
      selectNetwork,
      getNetworkIcon
    };
  }
};
</script>

<style scoped>
.multi-chain-network-selector {
  position: relative;
}

.current-network {
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

.current-network:hover {
  background-color: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.network-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.network-icon img {
  width: 75%;
  height: 75%;
  object-fit: contain;
}

.network-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.network-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
}

.network-tag {
  font-size: 0.65rem;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.network-tag.testnet {
  background-color: rgba(255, 171, 0, 0.1);
  color: #ffab00;
}

.network-tag.disabled {
  background-color: rgba(150, 150, 150, 0.1);
  color: #999999;
}

.network-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 300px;
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

.networks-container {
  max-height: 400px;
  overflow-y: auto;
}

.network-group {
  padding: 0.75rem 0;
}

.group-header {
  padding: 0 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cosmic-text-secondary);
  white-space: nowrap;
}

.group-divider {
  flex: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.network-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.network-option.disabled {
  opacity: 0.6;
  cursor: default;
}

.network-option.disabled:hover {
  background-color: transparent;
}

.network-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-indicator {
  color: var(--cosmic-blue);
}

.wrapped-tokens {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wrapped-token-label {
  font-size: 0.7rem;
  color: var(--cosmic-text-tertiary);
}

.wrapped-token-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.wrapped-token {
  font-size: 0.75rem;
  background-color: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 600;
}

.wrapped-token.coming-soon {
  background-color: rgba(150, 150, 150, 0.1);
  color: #999999;
  text-decoration: line-through;
}

.bridge-info {
  padding: 0.75rem 1rem;
  background-color: rgba(15, 185, 253, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
}

.bridge-info i {
  color: var(--cosmic-blue);
}

@media (max-width: 768px) {
  .network-menu {
    width: 280px;
  }
}
</style> 