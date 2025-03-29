<template>
  <div class="notification-container" :class="position">
    <transition-group name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        <div class="notification-icon">
          <i :class="getIconForType(notification.type)"></i>
        </div>
        
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        
        <button class="close-btn" @click="dismissNotification(notification.id)">
          <i class="fas fa-times"></i>
        </button>
        
        <div 
          v-if="notification.duration > 0" 
          class="notification-progress" 
          :style="getProgressStyle(notification)"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';

// Store
const notificationStore = useNotificationStore();

// Props
const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-right', 
      'top-left', 
      'bottom-right', 
      'bottom-left',
      'top-center',
      'bottom-center'
    ].includes(value)
  },
  maxNotifications: {
    type: Number,
    default: 5
  }
});

// Computed
const notifications = computed(() => {
  // Limit the number of notifications shown
  return notificationStore.notifications.slice(0, props.maxNotifications);
});

// Methods
function dismissNotification(id) {
  notificationStore.dismissNotification(id);
}

function getIconForType(type) {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'info':
    default:
      return 'fas fa-info-circle';
  }
}

function getProgressStyle(notification) {
  const elapsed = Date.now() - notification.timestamp;
  const remaining = Math.max(0, notification.duration - elapsed);
  const widthPercent = (remaining / notification.duration) * 100;
  
  return {
    width: `${widthPercent}%`
  };
}

// Interval to update progress bars
let progressInterval = null;

onMounted(() => {
  // Update progress bars every 100ms
  progressInterval = setInterval(() => {
    // Force a reactivity trigger by accessing the notifications
    if (notifications.value.length > 0) {
      // Do nothing, just trigger reactivity
    }
  }, 100);
});

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 320px;
  max-width: 90vw;
  pointer-events: none;
}

/* Positions */
.top-right {
  top: 1rem;
  right: 1rem;
}

.top-left {
  top: 1rem;
  left: 1rem;
}

.bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

/* Notification Styles */
.notification {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--cosmic-shadow-md);
  display: flex;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Notification types */
.notification.info {
  border-left: 4px solid var(--cosmic-blue);
}

.notification.success {
  border-left: 4px solid #0dce63;
}

.notification.warning {
  border-left: 4px solid #ff9800;
}

.notification.error {
  border-left: 4px solid #ff5252;
}

.notification-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.notification.info .notification-icon {
  color: var(--cosmic-blue);
}

.notification.success .notification-icon {
  color: #0dce63;
}

.notification.warning .notification-icon {
  color: #ff9800;
}

.notification.error .notification-icon {
  color: #ff5252;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--cosmic-text-primary);
}

.notification-message {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  word-break: break-word;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary);
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  margin-top: -0.25rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary);
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  transition: width 0.1s linear;
}

.notification.info .notification-progress {
  background: var(--cosmic-blue);
}

.notification.success .notification-progress {
  background: #0dce63;
}

.notification.warning .notification-progress {
  background: #ff9800;
}

.notification.error .notification-progress {
  background: #ff5252;
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .notification-container {
    width: calc(100% - 2rem);
  }
  
  .notification {
    padding: 0.75rem;
  }
  
  .notification-title {
    font-size: 0.95rem;
  }
  
  .notification-message {
    font-size: 0.85rem;
  }
}
</style> 