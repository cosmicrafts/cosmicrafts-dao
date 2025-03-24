<!-- File: components/core/modals/BaseModal.vue -->
<script setup>
import { computed } from 'vue';
import { useModalStore } from '@/stores/modal';

const modalStore = useModalStore();

const closeModal = () => {
  modalStore.closeModal();
};
</script>

<template>
  <div class="modal-overlay" v-if="modalStore.isOpen" @click.self="closeModal">
    <div class="modal-content cosmic-panel">
      <component :is="modalStore.currentComponent" v-bind="modalStore.props" />
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(8, 11, 20, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--cosmic-z-modal);
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  transform: translateY(0);
  animation: modalEntrance 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalEntrance {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 