<template>
  <div class="swap-form-container">
    <div class="swap-form-header">
      <h2>Swap Tokens</h2>
      <button class="close-button" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="swap-form-content">
      <!-- From Token -->
      <div class="token-input-container">
        <div class="token-label">From</div>
        <div class="token-input-wrapper">
          <div class="token-selector" @click="openFromSelector">
            <img :src="fromToken.icon" :alt="fromToken.symbol" class="token-icon" />
            <span class="token-symbol">{{ fromToken.symbol }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <input
            v-model="fromAmount"
            type="number"
            class="token-amount-input"
            placeholder="0.00"
            min="0"
            @input="calculateToAmount"
          />
        </div>
        <div class="balance-info">
          <span>Balance: {{ formatBalance(fromToken.balance, fromToken.decimals) }}</span>
          <button class="max-button" @click="setMaxAmount">MAX</button>
        </div>
      </div>
      
      <!-- Swap Direction Button -->
      <div class="swap-direction">
        <button class="swap-direction-button" @click="swapTokens">
          <i class="fas fa-exchange-alt"></i>
        </button>
      </div>
      
      <!-- To Token -->
      <div class="token-input-container">
        <div class="token-label">To (Estimated)</div>
        <div class="token-input-wrapper">
          <div class="token-selector" @click="openToSelector">
            <img :src="toToken.icon" :alt="toToken.symbol" class="token-icon" />
            <span class="token-symbol">{{ toToken.symbol }}</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <input
            v-model="toAmount"
            type="number"
            class="token-amount-input"
            placeholder="0.00"
            disabled
          />
        </div>
        <div class="balance-info">
          <span>Balance: {{ formatBalance(toToken.balance, toToken.decimals) }}</span>
        </div>
      </div>
      
      <!-- Exchange Rate -->
      <div class="exchange-rate">
        <span>Rate: 1 {{ fromToken.symbol }} ≈ {{ exchangeRate }} {{ toToken.symbol }}</span>
        <span class="price-impact" :class="priceImpactClass">
          Price Impact: {{ priceImpact }}%
        </span>
      </div>
      
      <!-- Swap Button -->
      <button 
        class="swap-button" 
        :disabled="!isSwapValid || isSwapping"
        @click="executeSwap"
      >
        <span v-if="isSwapping">
          <i class="fas fa-spinner fa-spin"></i> Swapping...
        </span>
        <span v-else-if="!isSwapValid">
          {{ swapButtonText }}
        </span>
        <span v-else>
          Swap
        </span>
      </button>
      
      <!-- Trading Info -->
      <div class="trading-info">
        <div class="info-row">
          <span>Min. Received</span>
          <span>{{ minReceived }} {{ toToken.symbol }}</span>
        </div>
        <div class="info-row">
          <span>Fee</span>
          <span>{{ swapFee }} {{ fromToken.symbol }}</span>
        </div>
        <div class="info-row">
          <span>Slippage Tolerance</span>
          <span>{{ slippageTolerance }}%</span>
        </div>
      </div>
    </div>
    
    <!-- Token Selection Modal -->
    <div v-if="showTokenSelector" class="token-selector-modal" @click.self="closeTokenSelector">
      <div class="token-selector-content">
        <div class="token-selector-header">
          <h3>Select Token</h3>
          <button class="close-button" @click="closeTokenSelector">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <input
          v-model="tokenSearchQuery"
          type="text"
          class="token-search-input"
          placeholder="Search token name or symbol"
        />
        
        <div class="token-list">
          <div
            v-for="token in filteredTokens"
            :key="token.symbol"
            class="token-list-item"
            @click="selectToken(token)"
          >
            <img :src="token.icon" :alt="token.symbol" class="token-icon" />
            <div class="token-info">
              <div class="token-name">{{ token.name }}</div>
              <div class="token-symbol-small">{{ token.symbol }}</div>
            </div>
            <div class="token-balance">{{ formatBalance(token.balance, token.decimals) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useTokenStore } from '../../stores/token';
import { getTokenIcon } from '@/utils/IconService';

export default {
  name: 'SwapTokenForm',
  emits: ['close', 'swap-complete'],
  setup(props, { emit }) {
    const tokenStore = useTokenStore();
    
    // Token selection state
    const activeSelector = ref(null); // 'from' or 'to'
    const showTokenSelector = ref(false);
    const tokenSearchQuery = ref('');
    const availableTokens = ref([
      {
        symbol: 'ICP',
        name: 'Internet Computer',
        balance: '1.25000000',
        price: 12.45,
        icon: getTokenIcon('icp')
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '0.05000000',
        price: 3489.75,
        icon: getTokenIcon('eth')
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: '2.50000000',
        price: 138.50,
        icon: getTokenIcon('sol')
      },
      {
        symbol: 'STDs',
        name: 'Stardust',
        balance: '1000.00000000',
        price: 0.01,
        icon: getTokenIcon('stds')
      }
    ]);
    
    // Swap state
    const fromToken = ref({
      symbol: 'ICP',
      name: 'Internet Computer',
      icon: getTokenIcon('icp'),
      balance: BigInt(0),
      decimals: 8,
      price: 0
    });
    
    const toToken = ref({
      symbol: 'STDs',
      name: 'Stardust',
      icon: getTokenIcon('stds'),
      balance: BigInt(0),
      decimals: 8,
      price: 0
    });
    
    const fromAmount = ref('');
    const toAmount = ref('');
    const isSwapping = ref(false);
    const slippageTolerance = ref(0.5); // Default 0.5%
    
    // Computed values
    const exchangeRate = computed(() => {
      if (!fromToken.value.price || !toToken.value.price) return '0.00';
      const rate = (fromToken.value.price / toToken.value.price);
      return rate.toFixed(6);
    });
    
    const minReceived = computed(() => {
      if (!toAmount.value) return '0.00';
      const amount = parseFloat(toAmount.value);
      const min = amount * (1 - slippageTolerance.value / 100);
      return min.toFixed(6);
    });
    
    const swapFee = computed(() => {
      if (!fromAmount.value) return '0.00';
      // Assume 0.3% fee
      const fee = parseFloat(fromAmount.value) * 0.003;
      return fee.toFixed(6);
    });
    
    const priceImpact = computed(() => {
      // Simplified price impact calculation
      // In a real app, this would be more complex
      if (!fromAmount.value) return '0.00';
      const impact = parseFloat(fromAmount.value) * 0.01; // Just a demo value
      return impact.toFixed(2);
    });
    
    const priceImpactClass = computed(() => {
      const impact = parseFloat(priceImpact.value);
      if (impact < 1) return 'impact-low';
      if (impact < 3) return 'impact-medium';
      return 'impact-high';
    });
    
    const isSwapValid = computed(() => {
      if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) return false;
      if (fromToken.value.symbol === toToken.value.symbol) return false;
      
      // Check if user has enough balance
      const amountBigInt = BigInt(Math.floor(parseFloat(fromAmount.value) * Math.pow(10, fromToken.value.decimals)));
      return amountBigInt <= fromToken.value.balance;
    });
    
    const swapButtonText = computed(() => {
      if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) {
        return 'Enter an amount';
      }
      
      if (fromToken.value.symbol === toToken.value.symbol) {
        return 'Select different tokens';
      }
      
      const amountBigInt = BigInt(Math.floor(parseFloat(fromAmount.value) * Math.pow(10, fromToken.value.decimals)));
      if (amountBigInt > fromToken.value.balance) {
        return 'Insufficient balance';
      }
      
      return 'Swap';
    });
    
    const filteredTokens = computed(() => {
      if (!tokenSearchQuery.value) return availableTokens.value;
      
      const query = tokenSearchQuery.value.toLowerCase();
      return availableTokens.value.filter(token => 
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
      );
    });
    
    // Methods
    const loadTokens = async () => {
      try {
        const supportedTokens = await tokenStore.getSupportedTokens();
        
        const tokens = await Promise.all(
          supportedTokens.map(async (symbol) => {
            try {
              const balance = await tokenStore.getBalance(symbol);
              const decimals = tokenStore.getTokenDecimals(symbol) || 8;
              const price = await tokenStore.getTokenPrice(symbol) || 0;
              const name = tokenStore.getTokenName(symbol) || symbol;
              
              return {
                symbol,
                name,
                balance,
                decimals,
                price,
                icon: getTokenIcon(symbol)
              };
            } catch (error) {
              console.error(`Error loading token ${symbol}:`, error);
              return null;
            }
          })
        );
        
        availableTokens.value = tokens.filter(Boolean);
        
        // Update from and to token data
        const fromTokenData = availableTokens.value.find(t => t.symbol === fromToken.value.symbol);
        const toTokenData = availableTokens.value.find(t => t.symbol === toToken.value.symbol);
        
        if (fromTokenData) {
          fromToken.value = { ...fromTokenData };
        }
        
        if (toTokenData) {
          toToken.value = { ...toTokenData };
        }
      } catch (error) {
        console.error('Error loading tokens:', error);
      }
    };
    
    const formatBalance = (balance, decimals) => {
      if (typeof balance === 'bigint') {
        const balanceNum = Number(balance) / Math.pow(10, decimals);
        
        if (balanceNum < 0.001) return '<0.001';
        if (balanceNum < 1) return balanceNum.toFixed(4);
        if (balanceNum < 1000) return balanceNum.toFixed(2);
        return balanceNum.toLocaleString(undefined, { maximumFractionDigits: 2 });
      }
      
      return '0';
    };
    
    const openFromSelector = () => {
      activeSelector.value = 'from';
      showTokenSelector.value = true;
    };
    
    const openToSelector = () => {
      activeSelector.value = 'to';
      showTokenSelector.value = true;
    };
    
    const closeTokenSelector = () => {
      showTokenSelector.value = false;
      tokenSearchQuery.value = '';
    };
    
    const selectToken = (token) => {
      if (activeSelector.value === 'from') {
        // Don't allow selecting the same token
        if (token.symbol === toToken.value.symbol) {
          // Swap them instead
          const temp = toToken.value;
          toToken.value = fromToken.value;
          fromToken.value = temp;
        } else {
          fromToken.value = token;
        }
      } else if (activeSelector.value === 'to') {
        if (token.symbol === fromToken.value.symbol) {
          // Swap them instead
          const temp = fromToken.value;
          fromToken.value = toToken.value;
          toToken.value = temp;
        } else {
          toToken.value = token;
        }
      }
      
      showTokenSelector.value = false;
      tokenSearchQuery.value = '';
      calculateToAmount();
    };
    
    const swapTokens = () => {
      const temp = fromToken.value;
      fromToken.value = toToken.value;
      toToken.value = temp;
      
      // Swap amounts too and recalculate
      const tempAmount = fromAmount.value;
      fromAmount.value = toAmount.value;
      toAmount.value = tempAmount;
      calculateToAmount();
    };
    
    const setMaxAmount = () => {
      // Convert balance to human-readable form
      const maxAmount = Number(fromToken.value.balance) / Math.pow(10, fromToken.value.decimals);
      fromAmount.value = maxAmount.toString();
      calculateToAmount();
    };
    
    const calculateToAmount = () => {
      if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) {
        toAmount.value = '';
        return;
      }
      
      // Calculate based on exchange rate
      const from = parseFloat(fromAmount.value);
      const rate = parseFloat(exchangeRate.value);
      toAmount.value = (from * rate).toFixed(6);
    };
    
    const executeSwap = async () => {
      if (!isSwapValid.value || isSwapping.value) return;
      
      isSwapping.value = true;
      
      try {
        // In a real app, this would call a canister method
        // For now, we'll simulate the swap
        
        // Convert amounts to BigInt with proper decimals
        const fromAmountBigInt = BigInt(Math.floor(parseFloat(fromAmount.value) * Math.pow(10, fromToken.value.decimals)));
        const toAmountBigInt = BigInt(Math.floor(parseFloat(toAmount.value) * Math.pow(10, toToken.value.decimals)));
        
        // Simulate swap delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        emit('swap-complete', {
          success: true,
          fromAmount: fromAmount.value,
          fromSymbol: fromToken.value.symbol,
          toAmount: toAmount.value,
          toSymbol: toToken.value.symbol
        });
      } catch (error) {
        console.error('Swap error:', error);
        emit('swap-complete', {
          success: false,
          error: error.message || 'Failed to execute swap'
        });
      } finally {
        isSwapping.value = false;
      }
    };
    
    // Initialize
    onMounted(() => {
      loadTokens();
    });
    
    return {
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      isSwapping,
      showTokenSelector,
      activeSelector,
      tokenSearchQuery,
      availableTokens,
      filteredTokens,
      exchangeRate,
      minReceived,
      swapFee,
      slippageTolerance,
      priceImpact,
      priceImpactClass,
      isSwapValid,
      swapButtonText,
      
      formatBalance,
      openFromSelector,
      openToSelector,
      closeTokenSelector,
      selectToken,
      swapTokens,
      setMaxAmount,
      calculateToAmount,
      executeSwap,
      getTokenIcon
    };
  }
};
</script>

<style scoped>
.swap-form-container {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: var(--cosmic-shadow-md);
}

.swap-form-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.swap-form-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.close-button {
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
}

.swap-form-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.token-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background-color: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem 1rem;
}

.token-label {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.token-input-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.token-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s;
}

.token-selector:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.token-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.token-symbol {
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.token-amount-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--cosmic-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  text-align: right;
  padding: 0.25rem;
  outline: none;
}

.token-amount-input:disabled {
  opacity: 0.7;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--cosmic-text-tertiary);
}

.max-button {
  background: transparent;
  border: none;
  color: var(--cosmic-blue);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  transition: all 0.2s;
}

.max-button:hover {
  background-color: rgba(15, 185, 253, 0.1);
}

.swap-direction {
  display: flex;
  justify-content: center;
  margin: -0.5rem 0;
  position: relative;
  z-index: 2;
}

.swap-direction-button {
  background-color: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.swap-direction-button:hover {
  background-color: rgba(15, 185, 253, 0.15);
  transform: rotate(180deg);
}

.exchange-rate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
  padding: 0.5rem 0;
}

.price-impact {
  font-weight: 600;
}

.impact-low {
  color: #38b000;
}

.impact-medium {
  color: #ffaa00;
}

.impact-high {
  color: #ff3c00;
}

.swap-button {
  background: linear-gradient(135deg, var(--cosmic-blue) 0%, var(--cosmic-blue-light) 100%);
  color: white;
  border: none;
  border-radius: var(--cosmic-radius-md);
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.swap-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary);
}

.swap-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.trading-info {
  background-color: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.info-row:last-child {
  margin-bottom: 0;
}

/* Token Selector Modal */
.token-selector-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.token-selector-content {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-lg);
}

.token-selector-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.token-selector-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.token-search-input {
  margin: 1rem;
  padding: 0.75rem 1rem;
  background-color: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  outline: none;
  font-size: 0.95rem;
}

.token-search-input:focus {
  border-color: rgba(15, 185, 253, 0.2);
  background-color: rgba(15, 185, 253, 0.08);
}

.token-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem;
}

.token-list-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s;
}

.token-list-item:hover {
  background-color: rgba(15, 185, 253, 0.05);
}

.token-info {
  flex: 1;
}

.token-name {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  font-size: 0.95rem;
}

.token-symbol-small {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.token-balance {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .swap-form-content {
    padding: 1rem;
  }
  
  .token-amount-input {
    font-size: 1.1rem;
  }
}
</style> 