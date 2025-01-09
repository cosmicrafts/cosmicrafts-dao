<template>
  <div class="modal-overlay" v-if="isOpen">
    <div class="modal-content">
      <slot>
        <div class="spinner"></div>
        <p>{{ message }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  message: {
    type: String,
    default: 'Processing...',
  },
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #20232a;
  color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 1rem auto;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
