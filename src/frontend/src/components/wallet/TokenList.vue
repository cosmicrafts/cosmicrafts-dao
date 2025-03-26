<template>
  <div class="token-list-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Loading tokens...</span>
    </div>
    
    <div v-else-if="tokens.length === 0" class="empty-state">
      <i class="fas fa-coins"></i>
      <p>No tokens found</p>
      <button class="add-token-btn" @click="$emit('add-token')">
        Add Token
      </button>
    </div>
    
    <div v-else>
      <div 
        v-for="token in tokens" 
        :key="token.symbol"
        class="token-item"
        @click="selectToken(token)"
      >
        <div class="token-icon">
          <img :src="token.icon" :alt="token.name" />
        </div>
        <div class="token-details">
          <div class="token-name-container">
            <span class="token-name">{{ token.name }}</span>
            <span v-if="token.testnet" class="testnet-badge">Testnet</span>
          </div>
          <span class="token-symbol">{{ token.symbol }}</span>
        </div>
        <div class="token-balance">
          <span class="token-amount">{{ formatBalance(token.balance, token.decimals) }}</span>
          <span class="token-value">{{ formatFiatValue(token.balance, token.decimals, token.price) }}</span>
        </div>
      </div>
      
      <div class="token-list-footer">
        <button class="manage-tokens-btn" @click="$emit('manage-tokens')">
          <i class="fas fa-wrench"></i>
          <span>Manage token list</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useTokenStore } from '@/stores/token';
import { getTokenIcon } from '@/utils/IconService';

export default {
  name: 'TokenList',
  props: {
    currency: {
      type: String,
      default: 'USD'
    },
    selectedAccount: {
      type: Number,
      default: 0
    },
    currentNetwork: {
      type: Object,
      default: () => ({
        id: 'icp',
        name: 'Internet Computer'
      })
    }
  },
  emits: ['select-token', 'add-token', 'manage-tokens'],
  setup(props, { emit }) {
    const tokenStore = useTokenStore();
    const tokens = ref([]);
    const isLoading = ref(true);
    
    // Currency symbols mapping
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      MXN: 'MX$',
      INR: '₹',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      CNY: '¥'
    };
    
    // Format balance to human-readable format based on token decimals
    const formatBalance = (balance, decimals) => {
      if (typeof balance === 'bigint') {
        balance = balance.toString();
      }
      
      const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
      
      // Format based on size
      if (balanceNum === 0) return '0';
      if (balanceNum < 0.001) return '<0.001';
      if (balanceNum < 1) return balanceNum.toFixed(4);
      if (balanceNum < 1000) return balanceNum.toFixed(2);
      return balanceNum.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };
    
    // Format fiat value 
    const formatFiatValue = (balance, decimals, price) => {
      if (!price) return '—'; // Em dash for unknown price
      
      if (typeof balance === 'bigint') {
        balance = balance.toString();
      }
      
      const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
      const fiatValue = balanceNum * price;
      
      const symbol = currencySymbols[props.currency] || '$';
      
      // Format based on size
      if (fiatValue === 0) return `${symbol}0.00`;
      if (fiatValue < 0.01) return `<${symbol}0.01`;
      if (fiatValue < 1000) return `${symbol}${fiatValue.toFixed(2)}`;
      return `${symbol}${fiatValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    };
    
    // Select token and emit event
    const selectToken = (token) => {
      emit('select-token', token);
    };
    
    // Fetch token data from the store
    const fetchTokens = async () => {
      isLoading.value = true;
      
      try {
        const networkId = props.currentNetwork?.id || 'icp';
        
        // First try to load from cache
        const cachedTokens = localStorage.getItem(`account_${networkId}_${props.selectedAccount}_tokens`);
        if (cachedTokens) {
          const { tokens: tokenData, timestamp } = JSON.parse(cachedTokens);
          // Use cached data if it's less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            tokens.value = tokenData;
          }
        }
        
        // Get tokens based on network
        let supportedTokens = [];
        
        if (networkId.startsWith('icp')) {
          // ICP network tokens
          supportedTokens = await tokenStore.getSupportedTokens();
        } else if (networkId === 'eth') {
          // Ethereum tokens (mock data)
          supportedTokens = ['ETH', 'USDT', 'USDC', 'DAI'];
        } else if (networkId === 'sol') {
          // Solana tokens (mock data)
          supportedTokens = ['SOL', 'USDC', 'BONK', 'JUP'];
        } else {
          // Default
          supportedTokens = [];
        }
        
        const tokenData = await Promise.all(
          supportedTokens.map(async (symbol) => {
            try {
              // For ICP network, use the actual token store
              if (networkId.startsWith('icp')) {
                const balance = await tokenStore.getBalance(symbol);
                const decimals = tokenStore.getTokenDecimals(symbol) || 8;
                const price = await tokenStore.getTokenPrice(symbol) || 0;
                
                return {
                  symbol,
                  name: tokenStore.getTokenName(symbol) || symbol,
                  balance,
                  decimals,
                  price,
                  icon: getTokenIcon(symbol),
                  testnet: symbol === 'STDs' || symbol === 'COSMIC' || networkId === 'icp-testnet'
                };
              } else {
                // Mock data for other networks
                return getMockTokenData(symbol, networkId);
              }
            } catch (error) {
              console.error(`Error fetching data for token ${symbol}:`, error);
              return null;
            }
          })
        );
        
        // Filter out failed token fetches
        tokens.value = tokenData.filter(Boolean);
        
        // Cache the results
        localStorage.setItem(`account_${networkId}_${props.selectedAccount}_tokens`, JSON.stringify({
          tokens: tokens.value,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Helper to generate mock token data for non-ICP networks
    const getMockTokenData = (symbol, networkId) => {
      const mockPrices = {
        ETH: 3490.25,
        USDT: 1.0,
        USDC: 1.0,
        DAI: 1.0,
        SOL: 138.87,
        BONK: 0.00001234,
        JUP: 1.45
      };
      
      const mockDecimals = {
        ETH: 18,
        USDT: 6,
        USDC: 6,
        DAI: 18,
        SOL: 9,
        BONK: 5,
        JUP: 6
      };
      
      const mockBalances = {
        ETH: '125000000000000000', // 0.125 ETH
        USDT: '50000000', // 50 USDT
        USDC: '75000000', // 75 USDC
        DAI: '100000000000000000000', // 100 DAI
        SOL: '5000000000', // 5 SOL
        BONK: '1000000000', // 10000 BONK
        JUP: '20000000' // 20 JUP
      };
      
      const mockNames = {
        ETH: 'Ethereum',
        USDT: 'Tether USD',
        USDC: 'USD Coin',
        DAI: 'Dai Stablecoin',
        SOL: 'Solana',
        BONK: 'Bonk',
        JUP: 'Jupiter'
      };
      
      return {
        symbol,
        name: mockNames[symbol] || symbol,
        balance: mockBalances[symbol] || '0',
        decimals: mockDecimals[symbol] || 18,
        price: mockPrices[symbol] || 0,
        icon: getTokenIcon(symbol),
        testnet: false
      };
    };
    
    // Initial data loading
    onMounted(() => {
      fetchTokens();
      
      // Set up refresh interval
      const intervalId = setInterval(fetchTokens, 60000); // Refresh every minute
      
      // Clean up on component unmount
      return () => {
        clearInterval(intervalId);
      };
    });
    
    // Update watch to also watch for network changes
    watch(
      [() => props.selectedAccount, () => props.currentNetwork],
      () => {
        fetchTokens();
      }
    );
    
    return {
      tokens,
      isLoading,
      formatBalance,
      formatFiatValue,
      selectToken
    };
  }
};
</script>

<style scoped>
.token-list-container {
  width: 100%;
  border-radius: var(--cosmic-radius-lg, 12px);
  overflow: hidden;
  background: var(--cosmic-glass-bg, rgba(30, 43, 56, 0.65));
  backdrop-filter: var(--cosmic-glass-blur, blur(8px));
  border: var(--cosmic-glass-border, 1px solid rgba(255, 255, 255, 0.12));
  position: relative;
  z-index: 5; /* Lower z-index than the account menu */
}

.token-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: background-color 0.2s;
}

.token-item:hover {
  background-color: rgba(15, 185, 253, 0.05);
}

.token-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
}

.token-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.token-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.token-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

.testnet-badge {
  background-color: rgba(128, 96, 255, 0.15);
  color: rgb(128, 96, 255);
  font-size: 0.65rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.token-symbol {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.token-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.token-amount {
  font-weight: 600;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

.token-value {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  gap: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba(15, 185, 253, 0.3);
  border-radius: 50%;
  border-top-color: var(--cosmic-blue);
  animation: spin 1s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  gap: 1rem;
  color: var(--cosmic-text-secondary);
}

.empty-state i {
  font-size: 2.5rem;
  color: var(--cosmic-text-tertiary);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

.add-token-btn {
  background-color: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-token-btn:hover {
  background-color: rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.token-list-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.manage-tokens-btn {
  background: transparent;
  color: var(--cosmic-text-secondary);
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.manage-tokens-btn:hover {
  color: var(--cosmic-blue);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .token-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 0.75rem;
  }
  
  .token-name {
    font-size: 0.9rem;
  }
  
  .token-symbol,
  .token-value {
    font-size: 0.75rem;
  }
  
  .token-amount {
    font-size: 0.9rem;
  }
  
  .token-item {
    padding: 0.75rem 0.5rem;
  }
}
</style> 