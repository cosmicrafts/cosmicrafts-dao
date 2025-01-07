<template>
      <div class="modal-overlay" v-if="isOpen" @click.self="closeModal">
        <div class="modal-content">
          <slot></slot>
        </div>
      </div>
    </template>
    
    <script setup>
    const props = defineProps({
      isOpen: Boolean,
    });

    const emit = defineEmits(['close']);

    const closeModal = () => {
      emit('close');
    };
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
      background: #16212b;
      border-radius: 12px;
      padding: 2rem;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
    }
    </style>