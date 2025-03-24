<template>
  <div class="loading-indicator-container">
    <div class="loading-backdrop"></div>
    <div class="loading-panel">
      <div class="spinner"></div>
      <div class="loading-message">{{ message || $t('common.loading') }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.loading-indicator-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
}

.loading-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-bg-secondary, #16213e);
  border: 1px solid var(--color-border-highlight, rgba(255, 255, 255, 0.2));
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  max-width: 90%;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-accent, #4169e1);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-message {
  color: var(--color-text-primary, #ffffff);
  font-size: 1rem;
  text-align: center;
  max-width: 300px;
}

@media (max-width: 480px) {
  .loading-panel {
    padding: 20px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    margin-bottom: 16px;
  }
  
  .loading-message {
    font-size: 0.9rem;
  }
}
</style> 