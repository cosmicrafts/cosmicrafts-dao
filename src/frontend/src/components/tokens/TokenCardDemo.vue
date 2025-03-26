<template>
  <div class="token-cards-demo">
    <h3 class="demo-title">Your Tokens</h3>
    
    <div class="card-grid">
      <!-- Basic token card for ICP -->
      <TokenCard 
        symbol="ICP"
        @balance-updated="handleBalanceUpdate"
        @action="handleAction"
      />
      
      <!-- Token card for Stardust -->
      <TokenCard 
        symbol="STDs" 
        :refresh-interval="60000"
        @balance-updated="handleBalanceUpdate"
        @action="handleAction"
      />
      
      <!-- Custom card for any principal that is different from user's principal -->
      <TokenCard 
        v-if="customPrincipal && shouldShowCustomPrincipal"
        symbol="ICP"
        :principal-id="customPrincipal"
        :label="`ICP (${shortenPrincipal(customPrincipal)})`"
        :use-cache="false"
        @balance-updated="handleOtherBalance"
        @action="handleAction"
      />
    </div>
    
    <!-- Display total value for demonstration -->
    <div class="total-balance" v-if="totalBalance > 0">
      <div class="total-label">Total Balance (USD):</div>
      <div class="total-value">${{ totalBalance.toFixed(2) }}</div>
    </div>
    
    <!-- Action feedback -->
    <div v-if="actionMessage" class="action-message">
      {{ actionMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue';
import TokenCard from './TokenCard.vue';
import { useAuthStore } from '../../stores/auth.js';

export default {
  name: 'TokenCardDemo',
  components: {
    TokenCard
  },
  props: {
    // Optional: Show balance for another principal as well
    customPrincipal: {
      type: String,
      default: null
    }
  },
  setup(props) {
    // Get auth store to access current user's principal
    const authStore = useAuthStore();
    
    // Track balances
    const balances = ref({
      ICP: { amount: BigInt(0), formatted: '0.00', usdValue: 0 },
      STDs: { amount: BigInt(0), formatted: '0.00', usdValue: 0 }
    });
    
    // Other principal's balance
    const otherBalance = ref(BigInt(0));
    
    // Track action feedback
    const actionMessage = ref('');
    
    // Determine if we should show the custom principal
    const shouldShowCustomPrincipal = computed(() => {
      // Only show if the custom principal is different from the user's principal
      if (!props.customPrincipal) return false;
      
      // Check if we have auth store and current principal
      const currentPrincipal = authStore.isAuthenticated() ? 
        authStore.getIdentity()?.getPrincipal().toString() : null;
        
      return currentPrincipal && props.customPrincipal !== currentPrincipal;
    });
    
    // Helper to shorten principal for display
    const shortenPrincipal = (principal) => {
      if (!principal) return '';
      return principal.substring(0, 5) + '...' + principal.substring(principal.length - 3);
    };
    
    // Calculate total balance
    const totalBalance = computed(() => {
      // Using mock prices
      const icpPrice = 12.45; // Example price
      const stdsPrice = 0.05; // Example price
      
      let total = 0;
      
      // Add ICP value
      if (balances.value.ICP) {
        total += parseFloat(balances.value.ICP.formatted) * icpPrice;
      }
      
      // Add Stardust value
      if (balances.value.STDs) {
        total += parseFloat(balances.value.STDs.formatted) * stdsPrice;
      }
      
      return total;
    });
    
    // Handle balance updates
    const handleBalanceUpdate = ({ symbol, balance, formatted }) => {
      balances.value[symbol] = {
        amount: balance,
        formatted,
        // Mock price calculation
        usdValue: parseFloat(formatted) * (symbol === 'ICP' ? 12.45 : 0.05)
      };
      
      console.log(`${symbol} balance updated:`, formatted);
    };
    
    // Handle other principal's balance
    const handleOtherBalance = ({ balance, formatted }) => {
      otherBalance.value = {
        amount: balance,
        formatted
      };
      
      console.log(`Other principal's balance:`, formatted);
    };
    
    // Handle token actions
    const handleAction = (data) => {
      const { action, symbol, formatted } = data;
      
      // Show feedback message
      actionMessage.value = `${action.charAt(0).toUpperCase() + action.slice(1)} ${formatted} ${symbol}`;
      
      // Clear message after 3 seconds
      setTimeout(() => {
        actionMessage.value = '';
      }, 3000);
      
      console.log(`Token action:`, data);
    };
    
    return {
      balances,
      otherBalance,
      totalBalance,
      actionMessage,
      shouldShowCustomPrincipal,
      shortenPrincipal,
      handleBalanceUpdate,
      handleOtherBalance,
      handleAction
    };
  }
};
</script>

<style scoped>
.token-cards-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-title {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: var(--color-text-primary, #ffffff);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.total-balance {
  background: var(--color-bg-secondary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.total-label {
  font-size: 1rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.total-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-accent, #4169e1);
}

.action-message {
  background: var(--color-success-bg, rgba(16, 185, 129, 0.1));
  border: 1px solid var(--color-success, #10b981);
  color: var(--color-success, #10b981);
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style> 