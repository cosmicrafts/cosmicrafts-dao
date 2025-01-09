<!-- File: components/Modal.vue -->
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
    <div class="modal-content">
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
  background: rgba(14, 17, 27, 0.664);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.9), rgba(23, 33, 43, 0.9));
  border-radius: 8px;
  border: 1px solid #ffffff12;
  padding: 2rem;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}
</style>