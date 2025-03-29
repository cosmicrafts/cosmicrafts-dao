<!-- ToastNotificationSystem.vue -->
<template>
  <div class="toast-container" :class="position">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-notification"
        :class="[
          `toast-${toast.type}`, 
          { 'with-progress': toast.showProgress },
          { 'with-actions': toast.actions && toast.actions.length }
        ]"
      >
        <div class="toast-icon">
          <i :class="getToastIcon(toast.type)"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
          <div v-if="toast.actions && toast.actions.length" class="toast-actions">
            <button 
              v-for="(action, index) in toast.actions" 
              :key="index"
              @click="handleAction(toast, action)"
              class="toast-action-button"
            >
              {{ action.label }}
            </button>
          </div>
          <div v-if="toast.showProgress" class="toast-progress-bar">
            <div 
              class="toast-progress" 
              :style="{ width: `${getToastProgress(toast)}%` }"
            ></div>
          </div>
        </div>
        <button v-if="toast.dismissible !== false" class="toast-close" @click="() => dismissToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';

// Props
const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: value => [
      'top-right', 
      'top-left', 
      'bottom-right', 
      'bottom-left', 
      'top-center', 
      'bottom-center'
    ].includes(value)
  },
  maxToasts: {
    type: Number,
    default: 5
  }
});

// Emits
const emit = defineEmits(['dismiss', 'action']);

// State
const toasts = ref([]);
const progressIntervals = ref({});

// Show a toast notification
const showToast = ({ 
  title, 
  message = '', 
  type = 'info', 
  duration = 5000, 
  showProgress = true,
  dismissible = true,
  actions = [] 
}) => {
  const id = uuidv4();
  const timestamp = Date.now();
  const expiresAt = timestamp + duration;
  
  const toast = {
    id,
    title,
    message,
    type,
    timestamp,
    duration,
    expiresAt,
    showProgress,
    dismissible,
    actions
  };
  
  // Add the toast to our array
  toasts.value.push(toast);
  
  // If we have more than maxToasts, remove the oldest one
  if (toasts.value.length > props.maxToasts) {
    const oldestToast = toasts.value[0];
    dismissToast(oldestToast.id);
  }
  
  // If there's a duration, set a timeout to remove the toast
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
    
    // If showing progress, set up a progress updater
    if (showProgress) {
      setupProgressUpdater(id, timestamp, expiresAt);
    }
  }
  
  // Add haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  return id;
};

// Dismiss a toast
const dismissToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  
  if (index !== -1) {
    // Clean up any progress intervals
    if (progressIntervals.value[id]) {
      clearInterval(progressIntervals.value[id]);
      delete progressIntervals.value[id];
    }
    
    // Remove the toast
    toasts.value.splice(index, 1);
    
    // Emit the dismiss event
    emit('dismiss', id);
  }
};

// Update the toast (used to modify an existing toast)
const updateToast = (id, updates) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  
  if (index !== -1) {
    // Update the toast
    toasts.value[index] = {
      ...toasts.value[index],
      ...updates
    };
    
    // If duration has changed and toast used to have a timeout
    if (updates.duration && toasts.value[index].duration !== updates.duration) {
      // Clear existing timeout
      if (progressIntervals.value[id]) {
        clearInterval(progressIntervals.value[id]);
        delete progressIntervals.value[id];
      }
      
      // Setup new timeout if duration > 0
      if (updates.duration > 0) {
        const newExpiresAt = Date.now() + updates.duration;
        toasts.value[index].expiresAt = newExpiresAt;
        
        setTimeout(() => {
          dismissToast(id);
        }, updates.duration);
        
        // Setup new progress updater if needed
        if (toasts.value[index].showProgress) {
          setupProgressUpdater(id, Date.now(), newExpiresAt);
        }
      }
    }
  }
};

// Setup a progress updater for a toast
const setupProgressUpdater = (id, startTime, endTime) => {
  // Clear any existing interval
  if (progressIntervals.value[id]) {
    clearInterval(progressIntervals.value[id]);
  }
  
  // Set interval to update progress
  progressIntervals.value[id] = setInterval(() => {
    const now = Date.now();
    
    // If the toast has expired, clear the interval
    if (now >= endTime) {
      clearInterval(progressIntervals.value[id]);
      delete progressIntervals.value[id];
    }
  }, 100); // Update every 100ms for smooth progress
};

// Get the progress percentage for a toast
const getToastProgress = (toast) => {
  const now = Date.now();
  const elapsed = now - toast.timestamp;
  const total = toast.duration;
  
  const remaining = Math.max(0, total - elapsed);
  return (remaining / total) * 100;
};

// Get the icon for a toast type
const getToastIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    achievement: 'fas fa-trophy',
    reward: 'fas fa-gift',
    notification: 'fas fa-bell'
  };
  
  return icons[type] || icons.info;
};

// Handle toast action button click
const handleAction = (toast, action) => {
  // Emit the action event
  emit('action', { toastId: toast.id, action });
  
  // Dismiss the toast after action if specified
  if (action.dismissOnClick) {
    dismissToast(toast.id);
  }
};

// Clean up on unmount
onUnmounted(() => {
  // Clear all progress intervals
  Object.keys(progressIntervals.value).forEach(id => {
    clearInterval(progressIntervals.value[id]);
  });
});

// Expose the API methods for external use
defineExpose({
  showToast,
  dismissToast,
  updateToast
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  max-width: 400px;
  width: calc(100% - 32px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  padding: 16px;
}

/* Positioning variants */
.toast-container.top-right {
  top: 0;
  right: 0;
}

.toast-container.top-left {
  top: 0;
  left: 0;
}

.toast-container.bottom-right {
  bottom: 0;
  right: 0;
}

.toast-container.bottom-left {
  bottom: 0;
  left: 0;
}

.toast-container.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

/* Toast notification styles */
.toast-notification {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(15, 185, 253, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.2);
  overflow: hidden;
  pointer-events: all;
  max-width: 100%;
  will-change: transform, opacity;
}

.toast-notification.with-progress {
  padding-bottom: 20px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 4px;
  font-size: 1rem;
}

.toast-message {
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-top: 2px;
}

.toast-icon i {
  font-size: 1.2rem;
}

.toast-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
}

/* Toast progress bar */
.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(15, 185, 253, 0.1);
  overflow: hidden;
}

.toast-progress {
  height: 100%;
  background: var(--cosmic-blue);
  transition: width 0.1s linear;
}

/* Toast actions */
.toast-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.toast-action-button {
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-action-button:hover {
  background: rgba(15, 185, 253, 0.2);
}

/* Toast types */
.toast-info .toast-icon {
  color: var(--cosmic-blue);
}

.toast-success .toast-icon {
  color: var(--cosmic-green);
}

.toast-warning .toast-icon {
  color: var(--cosmic-orange);
}

.toast-error .toast-icon {
  color: var(--cosmic-red);
}

.toast-achievement .toast-icon {
  color: var(--cosmic-purple);
}

.toast-reward .toast-icon {
  color: gold;
}

.toast-notification.toast-success .toast-progress {
  background: var(--cosmic-green);
}

.toast-notification.toast-warning .toast-progress {
  background: var(--cosmic-orange);
}

.toast-notification.toast-error .toast-progress {
  background: var(--cosmic-red);
}

.toast-notification.toast-achievement .toast-progress {
  background: var(--cosmic-purple);
}

.toast-notification.toast-reward .toast-progress {
  background: gold;
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Bottom position variants */
.bottom-right .toast-enter-from,
.bottom-left .toast-enter-from,
.bottom-center .toast-enter-from {
  transform: translateY(30px);
}

.bottom-right .toast-leave-to,
.bottom-left .toast-leave-to,
.bottom-center .toast-leave-to {
  transform: translateY(100px);
}

/* Adjust for safe areas */
@supports (padding: env(safe-area-inset-top)) {
  .toast-container.top-right,
  .toast-container.top-left,
  .toast-container.top-center {
    padding-top: calc(16px + env(safe-area-inset-top, 0px));
  }
  
  .toast-container.bottom-right,
  .toast-container.bottom-left,
  .toast-container.bottom-center {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
}
</style> 