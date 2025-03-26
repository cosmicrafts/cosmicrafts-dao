<template>
  <div class="token-icon" :class="{ 'small': size === 'small' }">
    <img :src="iconSrc" :alt="alt" />
  </div>
</template>

<script>
import { getTokenIcon } from '@/utils/IconService';

export default {
  name: 'TokenIcon',
  props: {
    symbol: {
      type: String,
      required: true
    },
    iconSrc: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    }
  },
  computed: {
    tokenIconSrc() {
      // Use provided iconSrc if available, otherwise get from IconService
      return this.iconSrc || getTokenIcon(this.symbol);
    }
  }
};
</script>

<style scoped>
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
  box-shadow: var(--cosmic-shadow-sm, 0 4px 8px rgba(0, 0, 0, 0.15));
}

.token-icon.small {
  width: 2rem;
  height: 2rem;
}

.token-icon img {
  width: 2.25rem;
  height: 2.25rem;
  object-fit: contain;
}

.token-icon.small img {
  width: 1.5rem;
  height: 1.5rem;
}
</style> 