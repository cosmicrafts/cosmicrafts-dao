<template>
  <transition name="fade">
    <div class="loading-screen" v-if="isLoading">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>
  </transition>
</template>

<script setup>
import { useLoadingScreen } from '@/utils/useLoadingScreen';

const { isLoading, loadingMessage } = useLoadingScreen();
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, rgb(30, 43, 56), rgb(23, 33, 43));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #00c3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

p {
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
}

/* Fade Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
