<template>
  <div class="buy-form-container">
    <div class="buy-form-header">
      <h2>Buy Tokens</h2>
      <button class="close-button" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="buy-form-content">
      <!-- Token Selection -->
      <div class="form-group">
        <label>Select Token</label>
        <div class="token-selector" @click="showTokenList = !showTokenList">
          <img :src="selectedToken.icon" :alt="selectedToken.symbol" class="token-icon" />
          <span class="token-name">{{ selectedToken.name }}</span>
          <span class="token-symbol">{{ selectedToken.symbol }}</span>
          <i class="fas fa-chevron-down"></i>
          
          <!-- Token List Dropdown -->
          <div v-if="showTokenList" class="token-dropdown">
            <div 
              v-for="token in buyableTokens" 
              :key="token.symbol"
              class="token-option"
              :class="{ active: token.symbol === selectedToken.symbol }"
              @click.stop="selectToken(token)"
            >
              <img :src="token.icon" :alt="token.symbol" class="token-icon" />
              <span class="token-name">{{ token.name }}</span>
              <span class="token-symbol">{{ token.symbol }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Amount Input with Currency Selector -->
      <div class="form-group">
        <label>Amount</label>
        <div class="amount-input-group">
          <div class="currency-selector" @click="showCurrencyList = !showCurrencyList">
            <span>{{ selectedCurrency.symbol }}</span>
            <i class="fas fa-chevron-down"></i>
            
            <!-- Currency List Dropdown -->
            <div v-if="showCurrencyList" class="currency-dropdown">
              <div 
                v-for="currency in supportedCurrencies" 
                :key="currency.code"
                class="currency-option"
                :class="{ active: currency.code === selectedCurrency.code }"
                @click.stop="selectCurrency(currency)"
              >
                <span>{{ currency.symbol }} {{ currency.name }}</span>
              </div>
            </div>
          </div>
          
          <input 
            v-model="amount" 
            type="number" 
            min="10" 
            step="10"
            class="amount-input"
            placeholder="0.00"
            @input="updateTokenAmount"
          />
        </div>
        <div class="min-max-info">
          <span>Min: {{ selectedCurrency.symbol }}10</span>
          <span>Max: {{ selectedCurrency.symbol }}10,000</span>
        </div>
      </div>
      
      <!-- Token Amount Received -->
      <div class="token-amount-preview">
        <div class="token-amount-label">You'll receive approximately:</div>
        <div class="token-amount-value">
          <span>{{ tokenAmount }}</span>
          <span>{{ selectedToken.symbol }}</span>
        </div>
        <div class="exchange-rate">
          1 {{ selectedToken.symbol }} ≈ {{ selectedCurrency.symbol }}{{ tokenPrice }}
        </div>
      </div>
      
      <!-- Payment Methods -->
      <div class="form-group">
        <label>Payment Method</label>
        <div class="payment-methods">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="payment-method"
            :class="{ selected: method.id === selectedPaymentMethod }"
            @click="selectedPaymentMethod = method.id"
          >
            <img :src="method.icon" :alt="method.name" class="payment-icon" />
            <span>{{ method.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- Terms & Conditions -->
      <div class="terms-checkbox">
        <input type="checkbox" id="terms" v-model="termsAccepted" />
        <label for="terms">
          I agree to the <a href="#" @click.prevent="showTerms">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
        </label>
      </div>
      
      <!-- Continue Button -->
      <button 
        class="continue-button" 
        :disabled="!isFormValid || isProcessing"
        @click="processPurchase"
      >
        <span v-if="isProcessing">
          <i class="fas fa-spinner fa-spin"></i> Processing...
        </span>
        <span v-else>
          Continue
        </span>
      </button>
      
      <!-- Supported By -->
      <div class="supported-by">
        <span>Payment processing by </span>
        <img :src="getPaymentIcon('stripe')" alt="Stripe" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getTokenIcon, getPaymentIcon } from '@/utils/IconService';

export default {
  name: 'BuyTokenForm',
  emits: ['close', 'purchase-complete'],
  setup(props, { emit }) {
    // Token selection
    const showTokenList = ref(false);
    const selectedToken = ref({
      symbol: 'ICP',
      name: 'Internet Computer',
      icon: getTokenIcon('icp'),
      price: 6
    });
    
    const buyableTokens = ref([
      {
        symbol: 'ICP',
        name: 'Internet Computer',
        icon: getTokenIcon('icp'),
        price: 6
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        icon: getTokenIcon('eth'),
        price: 2090.25
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: getTokenIcon('btc'),
        price: 87421.83
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        icon: getTokenIcon('sol'),
        price: 238.87
      }
    ]);
    
    // Currency selection
    const showCurrencyList = ref(false);
    const selectedCurrency = ref({
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      rate: 1
    });
    
    const supportedCurrencies = ref([
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.93 },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 153.31 },
      { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', rate: 20.74 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.10 }
    ]);
    
    // Payment methods
    const paymentMethods = ref([
      { 
        id: 'credit-card',
        name: 'Credit Card',
        icon: getPaymentIcon('credit-card')
      },
      {
        id: 'apple-pay',
        name: 'Apple Pay',
        icon: getPaymentIcon('apple-pay')
      },
      {
        id: 'google-pay',
        name: 'Google Pay',
        icon: getPaymentIcon('google-pay')
      }
    ]);
    
    // Form state
    const amount = ref('100');
    const tokenAmount = ref('0');
    const selectedPaymentMethod = ref('card');
    const termsAccepted = ref(false);
    const isProcessing = ref(false);
    
    // Computed values
    const isFormValid = computed(() => {
      return (
        amount.value && 
        parseFloat(amount.value) >= 10 && 
        parseFloat(amount.value) <= 10000 &&
        termsAccepted.value
      );
    });
    
    const tokenPrice = computed(() => {
      // Convert token price from USD to selected currency
      return (selectedToken.value.price * selectedCurrency.value.rate).toFixed(2);
    });
    
    // Methods
    const selectToken = (token) => {
      selectedToken.value = token;
      showTokenList.value = false;
      updateTokenAmount();
    };
    
    const selectCurrency = (currency) => {
      selectedCurrency.value = currency;
      showCurrencyList.value = false;
      updateTokenAmount();
    };
    
    const updateTokenAmount = () => {
      if (!amount.value || parseFloat(amount.value) <= 0) {
        tokenAmount.value = '0';
        return;
      }
      
      // Calculate token amount based on price and currency rate
      const fiatAmount = parseFloat(amount.value);
      const valueInUSD = fiatAmount / selectedCurrency.value.rate;
      const tokens = valueInUSD / selectedToken.value.price;
      
      // Format with appropriate precision
      tokenAmount.value = tokens.toFixed(6);
    };
    
    const showTerms = () => {
      // In a real app, this would show terms of service
      alert('Terms of Service would be shown here');
    };
    
    const showPrivacy = () => {
      // In a real app, this would show privacy policy
      alert('Privacy Policy would be shown here');
    };
    
    const processPurchase = async () => {
      if (!isFormValid.value || isProcessing.value) return;
      
      isProcessing.value = true;
      
      try {
        // In a real app, this would integrate with a payment processor API
        // For now, we'll simulate a purchase
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success
        emit('purchase-complete', {
          success: true,
          amount: tokenAmount.value,
          symbol: selectedToken.value.symbol,
          fiatAmount: amount.value,
          fiatCurrency: selectedCurrency.value.code
        });
      } catch (error) {
        console.error('Purchase error:', error);
        emit('purchase-complete', {
          success: false,
          error: error.message || 'Failed to process purchase'
        });
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Handle outside clicks for dropdowns
    const handleOutsideClick = (event) => {
      if (showTokenList.value && !event.target.closest('.token-selector')) {
        showTokenList.value = false;
      }
      
      if (showCurrencyList.value && !event.target.closest('.currency-selector')) {
        showCurrencyList.value = false;
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleOutsideClick);
      updateTokenAmount();
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
    });
    
    return {
      // State
      showTokenList,
      selectedToken,
      buyableTokens,
      showCurrencyList,
      selectedCurrency,
      supportedCurrencies,
      paymentMethods,
      amount,
      tokenAmount,
      selectedPaymentMethod,
      termsAccepted,
      isProcessing,
      isFormValid,
      tokenPrice,
      
      // Methods
      selectToken,
      selectCurrency,
      updateTokenAmount,
      showTerms,
      showPrivacy,
      processPurchase,
      getPaymentIcon
    };
  }
};
</script>

<style scoped>
.buy-form-container {
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: var(--cosmic-shadow-md);
}

.buy-form-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.buy-form-header h2 {
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

.buy-form-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.token-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.token-selector:hover {
  background-color: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.2);
}

.token-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: contain;
}

.token-name {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  flex: 1;
}

.token-symbol {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.token-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md);
  backdrop-filter: var(--cosmic-glass-blur);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.token-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.token-option:hover,
.token-option.active {
  background-color: rgba(15, 185, 253, 0.1);
}

.amount-input-group {
  display: flex;
  background-color: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  overflow: hidden;
}

.currency-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  background-color: rgba(15, 185, 253, 0.08);
  border-right: 1px solid rgba(15, 185, 253, 0.1);
  cursor: pointer;
  position: relative;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  min-width: 70px;
  justify-content: center;
}

.currency-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 150px;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md);
  backdrop-filter: var(--cosmic-glass-blur);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.currency-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.currency-option:hover,
.currency-option.active {
  background-color: rgba(15, 185, 253, 0.1);
}

.amount-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--cosmic-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  outline: none;
}

.min-max-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  padding: 0 0.5rem;
}

.token-amount-preview {
  background-color: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  text-align: center;
}

.token-amount-label {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.5rem;
}

.token-amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.exchange-rate {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.payment-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.payment-method:hover {
  background-color: rgba(15, 185, 253, 0.08);
  transform: translateY(-2px);
}

.payment-method.selected {
  background-color: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.payment-icon {
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.payment-method span {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.4;
}

.terms-checkbox input {
  margin-top: 0.25rem;
}

.terms-checkbox a {
  color: var(--cosmic-blue);
  text-decoration: none;
}

.terms-checkbox a:hover {
  text-decoration: underline;
}

.continue-button {
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

.continue-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-secondary);
}

.continue-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.supported-by {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  margin-top: 0.5rem;
}

.supported-by img {
  height: 1.1rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .buy-form-content {
    padding: 1rem;
  }
  
  .payment-methods {
    grid-template-columns: 1fr 1fr;
  }
  
  .payment-method {
    padding: 0.75rem 0.5rem;
  }
  
  .token-amount-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .payment-methods {
    grid-template-columns: 1fr;
  }
  
  .token-selector,
  .amount-input-group {
    padding: 0.5rem 0.75rem;
  }
  
  .token-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style> 