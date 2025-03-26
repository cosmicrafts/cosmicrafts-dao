<template>
  <div class="token-info">
    <div class="token-name-row">
      <span class="token-symbol">{{ symbol }}</span>
      <span class="token-name">{{ name }}</span>
    </div>
    
    <div class="token-standard">
      <span class="token-network">{{ standard }}</span>
      <span v-if="network" class="token-chain">on {{ network }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenInfo',
  props: {
    symbol: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    standard: {
      type: String,
      default: 'ICRC-1'
    },
    network: {
      type: String,
      default: null
    }
  }
};
</script>

<style scoped>
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
  color: var(--cosmic-text-primary, #ffffff);
  margin-right: 0.5rem;
}

.token-name {
  font-size: 0.9rem;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
}

.token-standard {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.7));
  display: flex;
  gap: 0.5rem;
}

.token-chain {
  opacity: 0.8;
}
</style> 