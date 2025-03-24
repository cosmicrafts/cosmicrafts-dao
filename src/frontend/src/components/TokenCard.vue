<template>
  <div 
    :class="['token-card', { active: isActive }]"
    @click="$emit('select')"
  >
    <div class="token-icon-container" :class="{'cosmic-container': token.symbol === 'STDs'}">
      <img v-if="token.symbol === 'ICP'" src="../assets/icons/icp.svg" alt="ICP" class="token-img" />
      <i v-else :class="getTokenIcon(token.symbol)" class="token-icon"></i>
    </div>
    <div class="token-details">
      <div class="token-symbol-name">{{ token.name }}</div>
      <div class="token-balance">
        {{ formattedBalance }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { tokenService } from '../services/TokenService.js';

export default {
  name: 'TokenCard',
  props: {
    token: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    principalId: {
      type: String,
      default: ''
    }
  },
  emits: ['select', 'balance-updated'],
  setup(props, { emit }) {
    const balance = ref(BigInt(0));
    const loading = ref(false);
    const initialized = ref(false);
    
    // Format balance with proper decimals
    const formattedBalance = computed(() => {
      try {
        if (!balance.value) return '0';
        
        // Get the proper decimals from token metadata
        const decimals = props.token.decimals || 8;
        
        const divisor = 10n ** BigInt(decimals);
        
        // Convert to string first to avoid floating point issues
        const wholePart = balance.value / divisor;
        const fractionalPart = balance.value % divisor;
        
        // Format with padding zeros
        let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
        
        // Trim trailing zeros but keep at least 2 decimal places
        const trimmedFractional = fractionalStr.replace(/0+$/, '');
        fractionalStr = trimmedFractional.length > 0 ? trimmedFractional : '00';
        
        // Ensure at least 2 decimal places
        if (fractionalStr.length < 2) {
          fractionalStr = fractionalStr.padEnd(2, '0');
        }
        
        // Format with commas for thousands
        const wholeFormatted = new Intl.NumberFormat().format(Number(wholePart));
        
        // For small amounts that round to zero, show at least the first significant digit
        if (wholePart === 0n && fractionalPart > 0n) {
          let significantDigits = '';
          for (let i = 0; i < fractionalStr.length; i++) {
            significantDigits += fractionalStr[i];
            if (fractionalStr[i] !== '0') {
              // Found first non-zero digit
              break;
            }
          }
          // Keep up to 4 more digits after the first significant digit
          const displayDigits = significantDigits.length + 4;
          return `${wholeFormatted}.${fractionalStr.substring(0, displayDigits)}`;
        }
        
        // For normal amounts, show whole part and first few decimal places
        return `${wholeFormatted}.${fractionalStr.substring(0, Math.min(fractionalStr.length, 8))}`;
      } catch (error) {
        console.error('Error formatting balance:', error);
        return '0';
      }
    });
    
    // Get token icon based on symbol
    function getTokenIcon(symbol) {
      const iconMap = {
        'ICP': 'fas fa-globe',
        'STDs': 'fas fa-star', // For Stardust token
        'BTC': 'fab fa-bitcoin',
        'ETH': 'fab fa-ethereum'
      };
      
      return iconMap[symbol] || 'fas fa-coins';
    }
    
    // Fetch token balance from blockchain
    async function fetchBalance(silent = false) {
      if (loading.value) return;
      
      // Skip if no principal ID provided
      if (!props.principalId) return;
      
      loading.value = true;
      
      try {
        const tokenBalance = await tokenService.getBalance(props.principalId, props.token.symbol);
        balance.value = tokenBalance;
        
        // Emit event when balance is updated
        emit('balance-updated', {
          symbol: props.token.symbol,
          balance: tokenBalance
        });
        
        initialized.value = true;
      } catch (error) {
        console.error(`Error fetching ${props.token.symbol} balance:`, error);
      } finally {
        loading.value = false;
      }
    }
    
    // Initialize when component is mounted
    onMounted(() => {
      // Use cached balance immediately if available
      try {
        const cachedBalances = localStorage.getItem('cosmicrafts-token-balances');
        if (cachedBalances) {
          const balances = JSON.parse(cachedBalances);
          const key = `${props.principalId}_${props.token.symbol}`;
          if (balances[key]) {
            balance.value = BigInt(balances[key]);
            initialized.value = true;
          }
        }
      } catch (e) {
        console.warn('Error loading cached balance:', e);
      }
      
      // Then fetch live balance in the background
      fetchBalance(true).catch(e => console.error('Error in background balance update:', e));
    });
    
    // Watch for principal ID changes to reload balance
    watch(() => props.principalId, (newPrincipalId) => {
      if (newPrincipalId) {
        fetchBalance(true).catch(e => console.error('Error updating balance after principal change:', e));
      }
    });
    
    // Manual refresh method that can be called from parent
    function refresh() {
      return fetchBalance(false);
    }
    
    return {
      balance,
      formattedBalance,
      loading,
      initialized,
      getTokenIcon,
      fetchBalance,
      refresh
    };
  }
}
</script>

<style scoped>
.token-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-medium, 8px);
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.token-card:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.token-card.active {
  background: rgba(15, 185, 253, 0.15);
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.2);
}

.token-icon-container {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.cosmic-container {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(200, 150, 255, 0.2));
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.token-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
}

.token-icon {
  color: var(--color-primary, #0FB9FD);
  font-size: 1.5rem;
}

.token-details {
  flex: 1;
}

.token-symbol-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: var(--color-text-primary, #ffffff);
}

.token-balance {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}
</style> 