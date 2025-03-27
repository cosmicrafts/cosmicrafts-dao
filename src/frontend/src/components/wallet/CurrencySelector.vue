<template>
  <div class="currency-selector">
    <div class="selected-currency" @click="toggleCurrencyMenu">
      <span class="currency-symbol">{{ selectedCurrency.symbol }}</span>
      <div class="currency-code-container">
        <span class="currency-code">{{ selectedCurrency.code }}</span>
      </div>
      <i class="fas fa-chevron-down"></i>
    </div>
    
    <div v-if="showCurrencyMenu" class="currency-menu">
      <div class="menu-header">
        <span>Display Currency</span>
        <button class="close-button" @click.stop="showCurrencyMenu = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="currency-list">
        <div 
          v-for="currency in availableCurrencies" 
          :key="currency.code"
          class="currency-option"
          :class="{ active: selectedCurrency.code === currency.code }"
          @click="selectCurrency(currency)"
        >
          <span class="currency-symbol">{{ currency.symbol }}</span>
          <span class="currency-name">{{ currency.name }}</span>
          <span class="currency-code">{{ currency.code }}</span>
          <span v-if="selectedCurrency.code === currency.code" class="selected-indicator">
            <i class="fas fa-check"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'CurrencySelector',
  emits: ['currency-changed'],
  setup(props, { emit }) {
    const showCurrencyMenu = ref(false);
    
    // Available currencies
    const availableCurrencies = ref([
      { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
      { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.93 },
      { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', rate: 16.74 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.10 },
      { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 153.31 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.51 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.37 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 }
    ]);
    
    // Currently selected currency
    const selectedCurrency = ref(availableCurrencies.value[0]);
    
    // Toggle currency menu
    const toggleCurrencyMenu = () => {
      showCurrencyMenu.value = !showCurrencyMenu.value;
    };
    
    // Select a currency
    const selectCurrency = (currency) => {
      if (selectedCurrency.value.code !== currency.code) {
        selectedCurrency.value = currency;
        
        // Save to localStorage
        localStorage.setItem('preferredCurrency', currency.code);
        
        // Emit event to parent
        emit('currency-changed', currency);
      }
      
      showCurrencyMenu.value = false;
    };
    
    // Load from localStorage
    const loadSavedCurrency = () => {
      const savedCurrency = localStorage.getItem('preferredCurrency');
      if (savedCurrency) {
        const currency = availableCurrencies.value.find(c => c.code === savedCurrency);
        if (currency) {
          selectedCurrency.value = currency;
        }
      }
    };
    
    // Close menu when clicking outside
    const handleOutsideClick = (event) => {
      if (showCurrencyMenu.value && !event.target.closest('.currency-selector')) {
        showCurrencyMenu.value = false;
      }
    };
    
    // Fetch latest exchange rates (mock function)
    const updateExchangeRates = async () => {
      try {
        // In a real app, you would fetch exchange rates from an API
        // For now, we'll use static values
        console.log('Exchange rates would be updated here');
        
        // Example of how you might update the rates:
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        // const data = await response.json();
        // availableCurrencies.value.forEach(currency => {
        //   if (currency.code !== 'USD') {
        //     currency.rate = data.rates[currency.code];
        //   }
        // });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      loadSavedCurrency();
      document.addEventListener('click', handleOutsideClick);
      updateExchangeRates();
      
      // Update exchange rates periodically
      const intervalId = setInterval(updateExchangeRates, 3600000); // Every hour
      
      return () => {
        clearInterval(intervalId);
      };
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick);
    });
    
    return {
      showCurrencyMenu,
      availableCurrencies,
      selectedCurrency,
      toggleCurrencyMenu,
      selectCurrency
    };
  }
};
</script>

<style scoped>
/* Z-index variables */
:root {
  --z-index-base: 1;
  --z-index-token-list: 5;
  --z-index-account-header: 10;
  --z-index-dropdown-menu: 1000;
  --z-index-backdrop: 999;
  --z-index-modal: 1500;
}

.currency-selector {
  position: relative;
  width: 100%;
  height: 100%;
}

.selected-currency {
  display: flex;
  align-items: center;
  background-color: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: var(--cosmic-radius-md);
  padding: 0 0.75rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  height: 100%;
  width: 100%;
}

.selected-currency:hover {
  background-color: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.currency-symbol {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cosmic-blue);
  flex-shrink: 0;
  padding-right: 0.25rem;
}

.currency-code-container {
  flex: 1;
  padding: 0 0.25rem 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.currency-code {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
}

.currency-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 220px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  z-index: var(--cosmic-z-dropdown);
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
  transition: all var(--cosmic-transition-fast);
}

.close-button:hover {
  color: var(--cosmic-text-primary);
}

.currency-list {
  max-height: 300px;
  overflow-y: auto;
}

.currency-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.currency-option:hover {
  background-color: rgba(15, 185, 253, 0.05);
}

.currency-option.active {
  background-color: rgba(15, 185, 253, 0.08);
}

.currency-name {
  flex: 1;
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.currency-code {
  color: var(--cosmic-text-primary);
  font-size: 0.85rem;
  margin: 0 0.5rem;
  opacity: 0.8;
}

.selected-indicator {
  color: var(--cosmic-blue);
  margin-left: 0.25rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .currency-code,
  .currency-symbol {
    font-size: 0.85rem;
  }
  
  .currency-menu {
    width: 200px;
  }
  
  .currency-option {
    padding: 0.6rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .currency-menu {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 75vh;
    border-radius: var(--cosmic-radius-lg) var(--cosmic-radius-lg) 0 0;
  }
  
  .selected-currency {
    padding: 0 0.5rem;
  }
}
</style> 