<template>
  <div class="loading-status">
    <div class="loading-spinner-small"></div>
    <span>{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingIndicator',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    }
  }
}
</script>

<style scoped>
.loading-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-top: 8px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: var(--radius-small, 4px);
  font-size: 0.9rem;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 2px solid var(--color-primary, #0FB9FD);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 