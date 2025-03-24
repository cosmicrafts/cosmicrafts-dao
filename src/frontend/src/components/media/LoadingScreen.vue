<template>
  <div class="loading-screen" v-if="show">
    <div class="loading-container">
      <div class="loading-icon">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
      </div>
      <div class="loading-text">{{ message || $t('common.loading') }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  margin-bottom: 20px;
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary, #fff);
  text-align: center;
  max-width: 300px;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 50px;
  height: 50px;
}

.path {
  stroke: var(--color-accent, #4169e1);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style> 