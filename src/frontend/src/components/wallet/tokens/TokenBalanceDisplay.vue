<template>
  <div class="token-balance">
    <div class="token-amount">
      {{ formattedAmount }} {{ symbol }}
    </div>
    
    <div class="token-value">
      {{ formattedValue }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenBalanceDisplay',
  props: {
    amount: {
      type: [String, Number, Object], // Support BigInt via Object
      required: true
    },
    symbol: {
      type: String,
      required: true
    },
    valueUsd: {
      type: Number,
      default: 0
    },
    decimals: {
      type: Number,
      default: 8
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  computed: {
    formattedAmount() {
      return this.formatTokenAmount(this.amount, this.decimals);
    },
    formattedValue() {
      return this.formatFiatValue(this.valueUsd, this.currency);
    }
  },
  methods: {
    formatTokenAmount(amount, decimals) {
      // Handle BigInt and convert to display format
      if (typeof amount === 'bigint') {
        const divisor = BigInt(10) ** BigInt(decimals);
        const integerPart = amount / divisor;
        const fractionalPart = amount % divisor;
        
        let formatted = integerPart.toString();
        
        if (fractionalPart > 0) {
          // Convert fractional part to string with leading zeros
          let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
          
          // Trim trailing zeros
          while (fractionalStr.endsWith('0')) {
            fractionalStr = fractionalStr.slice(0, -1);
          }
          
          if (fractionalStr.length > 0) {
            // Only show first 4 decimal places
            formatted += '.' + fractionalStr.slice(0, 4);
          }
        }
        
        return formatted;
      }
      
      return '0';
    },
    
    formatFiatValue(value, currencyCode) {
      if (typeof value !== 'number') {
        return '—';
      }
      
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      return formatter.format(value);
    }
  }
};
</script>

<style scoped>
.token-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1.5rem;
}

.token-amount {
  font-weight: 700;
  font-size: 1rem;
  color: var(--cosmic-text-primary, #ffffff);
  margin-bottom: 0.25rem;
}

.token-value {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
}
</style> 