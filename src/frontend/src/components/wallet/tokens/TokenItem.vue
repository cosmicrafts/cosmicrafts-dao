<template>
  <div 
    class="token-item"
    :class="{ 'selected': selected }"
    @click="$emit('click')"
  >
    <div class="token-icon">
      <img :src="token.logo" :alt="token.name" />
    </div>
    
    <div class="token-info">
      <div class="token-name-row">
        <span class="token-symbol">{{ token.symbol }}</span>
        <span class="token-name">{{ token.name }}</span>
      </div>
      
      <div class="token-standard">
        <span class="token-network">{{ token.standard }}</span>
      </div>
    </div>
    
    <div class="token-balance">
      <div class="token-amount">
        {{ formatTokenAmount(token.balance, token.decimals) }} {{ token.symbol }}
      </div>
      
      <div class="token-value">
        {{ formatFiatValue(token.valueUsd, currency) }}
      </div>
    </div>
    
    <div class="token-actions">
      <button class="action-button" @click.stop="$emit('send', token)">
        <i class="fas fa-arrow-up"></i>
      </button>
      
      <button class="action-button" @click.stop="$emit('receive', token)">
        <i class="fas fa-arrow-down"></i>
      </button>
      
      <button class="action-button" @click.stop="$emit('swap', token)">
        <i class="fas fa-exchange-alt"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenItem',
  props: {
    token: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  emits: ['click', 'send', 'receive', 'swap'],
  setup() {
    function formatTokenAmount(amount, decimals) {
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
    }
    
    function formatFiatValue(value, currencyCode) {
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
    
    return {
      formatTokenAmount,
      formatFiatValue
    };
  }
};
</script>

<style scoped>
.token-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(30, 43, 56, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.token-item:hover {
  background: rgba(30, 43, 56, 0.6);
  border-color: rgba(15, 185, 253, 0.15);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-sm);
}

.token-item.selected {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
}

.token-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.token-item:hover::before {
  opacity: 1;
}

.token-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  background: rgba(15, 185, 253, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--cosmic-shadow-sm);
}

.token-icon img {
  width: 2.25rem;
  height: 2.25rem;
  object-fit: contain;
}

.token-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.token-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.token-symbol {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--cosmic-text-primary);
  margin-right: 0.5rem;
}

.token-name {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary);
}

.token-standard {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.token-balance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 1.5rem;
}

.token-amount {
  font-weight: 700;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.token-value {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary);
}

.token-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.token-item:hover .token-actions {
  opacity: 1;
}

.action-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.action-button i {
  font-size: 0.8rem;
}
</style>
