<template>
  <div 
    class="token-item"
    :class="{ 'selected': selected }"
    @click="$emit('click')"
  >
    <TokenIcon 
      :symbol="token.symbol" 
      :icon-src="token.logo" 
      :alt="token.name" 
    />
    
    <TokenInfo 
      :symbol="token.symbol"
      :name="token.name"
      :standard="token.standard"
      :network="token.network"
    />
    
    <TokenBalanceDisplay 
      :amount="token.balance"
      :symbol="token.symbol"
      :value-usd="token.valueUsd"
      :decimals="token.decimals"
      :currency="currency"
    />
    
    <TokenItemActions
      :show-buy="showBuyAction"
      @send="$emit('send', token)"
      @receive="$emit('receive', token)"
      @swap="$emit('swap', token)"
      @buy="$emit('buy', token)"
    />
  </div>
</template>

<script>
import TokenIcon from './TokenIcon.vue';
import TokenInfo from './TokenInfo.vue';
import TokenBalanceDisplay from './TokenBalanceDisplay.vue';
import TokenItemActions from './TokenItemActions.vue';

export default {
  name: 'TokenItem',
  components: {
    TokenIcon,
    TokenInfo,
    TokenBalanceDisplay,
    TokenItemActions
  },
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
    },
    showBuyAction: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'send', 'receive', 'swap', 'buy']
};
</script>

<style scoped>
.token-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: var(--cosmic-radius-md, 8px);
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
  box-shadow: var(--cosmic-shadow-sm, 0 4px 8px rgba(0, 0, 0, 0.15));
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
</style>
