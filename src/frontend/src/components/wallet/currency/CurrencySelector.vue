<template>
  <div class="currency-selector">
    <div
      class="selected-currency"
      @click="toggleCurrenciesMenu"
    >
      <span class="currency-code">{{ selectedCurrency.code }}</span>
      <div class="currency-toggle">
        <i class="fas fa-chevron-down" :class="{'rotated': showCurrenciesMenu}"></i>
      </div>
    </div>
    
    <!-- Currencies dropdown menu -->
    <div
      v-if="showCurrenciesMenu"
      class="currencies-menu"
      v-click-outside="closeCurrenciesMenu"
    >
      <div class="currencies-menu-header">
        <span>Select Currency</span>
      </div>
      
      <div class="currencies-list">
        <div
          v-for="currency in currencies"
          :key="currency.code"
          class="currency-option"
          :class="{'selected': currency.code === selectedCurrency.code}"
          @click="selectCurrency(currency)"
        >
          <div class="currency-flag">
            <span class="currency-emoji">{{ currency.flag }}</span>
          </div>
          
          <div class="currency-details">
            <span class="currency-code">{{ currency.code }}</span>
            <span class="currency-name">{{ currency.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'CurrencySelector',
  props: {
    currentCurrency: {
      type: String,
      default: 'USD'
    }
  },
  emits: ['currency-changed'],
  setup(props, { emit }) {
    const showCurrenciesMenu = ref(false);
    
    // Currency options
    const currencies = ref([
      { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
      { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
      { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
      { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
      { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
      { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
      { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
      { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
      { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
      { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
      { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
      { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
      { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
      { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
      { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' }
    ]);
    
    const selectedCurrency = computed(() => {
      const found = currencies.value.find(c => c.code === props.currentCurrency);
      return found || currencies.value[0];
    });
    
    function toggleCurrenciesMenu() {
      showCurrenciesMenu.value = !showCurrenciesMenu.value;
    }
    
    function closeCurrenciesMenu() {
      showCurrenciesMenu.value = false;
    }
    
    function selectCurrency(currency) {
      if (currency.code !== props.currentCurrency) {
        emit('currency-changed', currency);
      }
      closeCurrenciesMenu();
    }
    
    return {
      showCurrenciesMenu,
      currencies,
      selectedCurrency,
      toggleCurrenciesMenu,
      closeCurrenciesMenu,
      selectCurrency
    };
  }
};
</script>

<style scoped>
.currency-selector {
  position: relative;
}

.selected-currency {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-currency:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.2);
}

.currency-code {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.currency-toggle {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.currency-toggle .rotated {
  transform: rotate(180deg);
}

.currencies-menu {
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

.currencies-menu-header {
  padding: 0.75rem 1rem;
  border-bottom: var(--cosmic-glass-border);
  font-weight: 600;
  font-size: 0.9rem;
}

.currencies-list {
  max-height: 300px;
  overflow-y: auto;
}

.currency-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.currency-option:hover {
  background: rgba(15, 185, 253, 0.1);
}

.currency-option.selected {
  background: rgba(15, 185, 253, 0.2);
}

.currency-flag {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.currency-details {
  display: flex;
  flex-direction: column;
}

.currency-code {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
}

.currency-name {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}
</style>
