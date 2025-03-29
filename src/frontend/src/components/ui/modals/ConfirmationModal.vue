<template>
  <div class="modal-overlay" @click="$emit('cancel')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('cancel')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-content">
        <p>{{ message }}</p>
      </div>
      
      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
        <button class="confirm-btn" @click="$emit('confirm')">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  width: 90%;
  max-width: 400px;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 12px;
  box-shadow: var(--cosmic-shadow-lg);
  animation: zoomIn 0.2s ease;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(15, 185, 253, 0.05);
  color: var(--cosmic-blue);
}

.modal-content {
  padding: 1.5rem 1rem;
  color: var(--cosmic-text-secondary);
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(15, 185, 253, 0.1);
}

.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  background: var(--cosmic-blue);
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: #0a8bd0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .modal-container {
    width: 95%;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .cancel-btn, .confirm-btn {
    width: 100%;
    padding: 0.75rem;
  }
}
</style> 