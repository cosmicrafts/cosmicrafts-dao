<template>
  <div class="wallet-actions cosmic-panel">
    <button class="cosmic-button cosmic-button-primary action-button" @click="$emit('action', 'send')">
      <i class="fas fa-paper-plane"></i>
      <span>Send</span>
    </button>
    <button class="cosmic-button cosmic-button-primary action-button" @click="$emit('action', 'receive')">
      <i class="fas fa-qrcode"></i>
      <span>Receive</span>
    </button>
    <button class="cosmic-button cosmic-button-primary action-button" @click="$emit('action', 'add-token')">
      <i class="fas fa-plus"></i>
      <span>Add Token</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'WalletActions',
  emits: ['action']
}
</script>

<style scoped>
.wallet-actions {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: var(--cosmic-panel-bg, rgba(20, 20, 30, 0.5));
  border-radius: var(--radius-medium, 8px);
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  flex: 1;
  margin: 0 8px;
  max-width: 120px;
  background: linear-gradient(to bottom, 
    var(--color-primary, #0FB9FD), 
    var(--color-primary-dark, #0A8BBD));
  border-radius: var(--radius-medium, 8px);
}

.action-button i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .wallet-actions {
    flex-wrap: wrap;
  }
  
  .action-button {
    min-width: 100px;
    margin-bottom: 8px;
  }
}
</style> 