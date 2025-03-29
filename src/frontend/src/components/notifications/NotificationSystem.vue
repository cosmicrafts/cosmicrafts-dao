<template>
  <div class="cosmic-notification-system" :class="positionClass">
    <TransitionGroup 
      name="notification" 
      tag="div" 
      class="notification-container"
    >
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        :class="['cosmic-notification', `notification-${notification.type}`]"
        @mouseenter="pauseNotification(notification)"
        @mouseleave="resumeNotification(notification)"
      >
        <div class="notification-icon">
          <i :class="getIconClass(notification.type)"></i>
        </div>
        
        <div class="notification-content">
          <div class="notification-header">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <button 
              class="notification-close" 
              @click="closeNotification(notification.id)"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="notification-message">{{ notification.message }}</div>
          
          <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
            <button 
              v-for="(action, index) in notification.actions" 
              :key="index"
              class="notification-action-button"
              @click="handleAction(action, notification)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        
        <div 
          v-if="notification.progress !== undefined"
          class="notification-progress-bar"
        >
          <div 
            class="notification-progress" 
            :style="{width: `${notification.progress}%`}"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';

const props = defineProps({
  position: {
    type: String,
    default: null, // Will use store default if not specified
  },
  maxNotifications: {
    type: Number,
    default: null, // Will use store default if not specified
  }
});

// Store access
const notificationStore = useNotificationStore();
const { notifications, config } = storeToRefs(notificationStore);

// Computed properties
const positionClass = computed(() => {
  const position = props.position || config.value.position;
  return `position-${position}`;
});

// Methods
function getIconClass(type) {
  switch (type) {
    case 'success': return 'fas fa-check-circle';
    case 'error': return 'fas fa-exclamation-circle';
    case 'warning': return 'fas fa-exclamation-triangle';
    case 'info': return 'fas fa-info-circle';
    case 'achievement': return 'fas fa-trophy';
    case 'reward': return 'fas fa-gift';
    default: return 'fas fa-bell';
  }
}

function closeNotification(id) {
  notificationStore.removeNotification(id);
}

function pauseNotification(notification) {
  // Add pause functionality if needed
  notification._paused = true;
}

function resumeNotification(notification) {
  // Resume auto-close timer if needed
  notification._paused = false;
}

function handleAction(action, notification) {
  // Execute the action callback if provided
  if (typeof action.onClick === 'function') {
    action.onClick(notification);
  }
  
  // Close the notification if action.closeOnClick is true (default)
  if (action.closeOnClick !== false) {
    closeNotification(notification.id);
  }
}

// Update store config if props are provided
onMounted(() => {
  const configUpdates = {};
  
  if (props.position) {
    configUpdates.position = props.position;
  }
  
  if (props.maxNotifications) {
    configUpdates.maxNotifications = props.maxNotifications;
  }
  
  if (Object.keys(configUpdates).length > 0) {
    notificationStore.updateConfig(configUpdates);
  }
});

// Expose methods to template refs
defineExpose({
  addNotification: notificationStore.addNotification,
  success: notificationStore.success,
  error: notificationStore.error,
  info: notificationStore.info,
  warning: notificationStore.warning,
  achievement: notificationStore.achievement,
  reward: notificationStore.reward,
  fromApiResponse: notificationStore.fromApiResponse,
  removeNotification: notificationStore.removeNotification,
  clearAll: notificationStore.clearAll
});
</script>

<style scoped>
.cosmic-notification-system {
  position: fixed;
  z-index: 9999;
  max-width: 400px;
  min-width: 300px;
  font-family: var(--cosmic-font-family, 'Inter', sans-serif);
}

/* Position variants */
.position-top-right {
  top: 20px;
  right: 20px;
}

.position-top-left {
  top: 20px;
  left: 20px;
}

.position-bottom-right {
  bottom: 20px;
  right: 20px;
}

.position-bottom-left {
  bottom: 20px;
  left: 20px;
}

.position-top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.position-bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.notification-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cosmic-notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  background: var(--cosmic-glass-bg, rgba(25, 25, 35, 0.8));
  backdrop-filter: var(--cosmic-glass-blur, blur(10px));
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  will-change: transform, opacity;
}

/* Notification types */
.notification-success {
  border-left: 4px solid var(--cosmic-green, #00e5a4);
}

.notification-error {
  border-left: 4px solid var(--cosmic-red, #ff004c);
}

.notification-warning {
  border-left: 4px solid var(--cosmic-orange, #ff9100);
}

.notification-info {
  border-left: 4px solid var(--cosmic-blue, #0fb9fd);
}

.notification-achievement {
  border-left: 4px solid var(--cosmic-purple, #9d35bf);
}

.notification-reward {
  border-left: 4px solid gold;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  background: rgba(0, 229, 164, 0.15);
  color: var(--cosmic-green, #00e5a4);
}

.notification-error .notification-icon {
  background: rgba(255, 0, 76, 0.15);
  color: var(--cosmic-red, #ff004c);
}

.notification-warning .notification-icon {
  background: rgba(255, 145, 0, 0.15);
  color: var(--cosmic-orange, #ff9100);
}

.notification-info .notification-icon {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue, #0fb9fd);
}

.notification-achievement .notification-icon {
  background: rgba(157, 53, 191, 0.15);
  color: var(--cosmic-purple, #9d35bf);
}

.notification-reward .notification-icon {
  background: rgba(255, 215, 0, 0.15);
  color: gold;
}

.notification-icon i {
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.notification-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary, #ffffff);
}

.notification-close {
  background: transparent;
  border: none;
  color: var(--cosmic-text-tertiary, rgba(255, 255, 255, 0.5));
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-text-primary, #ffffff);
}

.notification-message {
  color: var(--cosmic-text-secondary, rgba(255, 255, 255, 0.8));
  font-size: 0.9rem;
  margin-bottom: 8px;
  line-height: 1.4;
  word-break: break-word;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification-action-button {
  padding: 6px 12px;
  background: rgba(15, 185, 253, 0.15);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 4px;
  color: var(--cosmic-blue, #0fb9fd);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-action-button:hover {
  background: rgba(15, 185, 253, 0.25);
}

.notification-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.notification-progress {
  height: 100%;
  transition: width linear;
}

.notification-success .notification-progress {
  background: var(--cosmic-green, #00e5a4);
}

.notification-error .notification-progress {
  background: var(--cosmic-red, #ff004c);
}

.notification-warning .notification-progress {
  background: var(--cosmic-orange, #ff9100);
}

.notification-info .notification-progress {
  background: var(--cosmic-blue, #0fb9fd);
}

.notification-achievement .notification-progress {
  background: var(--cosmic-purple, #9d35bf);
}

.notification-reward .notification-progress {
  background: gold;
}

/* Animation transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .cosmic-notification-system {
    max-width: calc(100% - 40px);
    min-width: auto;
    width: calc(100% - 40px);
  }
  
  .notification-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
  
  .notification-title {
    font-size: 0.95rem;
  }
  
  .notification-message {
    font-size: 0.85rem;
  }
}

/* Safe area adjustments for modern devices */
@supports (padding: max(0px)) {
  .position-top-right, .position-top-left, .position-top-center {
    top: max(20px, env(safe-area-inset-top));
  }
  
  .position-bottom-right, .position-bottom-left, .position-bottom-center {
    bottom: max(20px, env(safe-area-inset-bottom));
  }
  
  .position-top-right, .position-bottom-right {
    right: max(20px, env(safe-area-inset-right));
  }
  
  .position-top-left, .position-bottom-left {
    left: max(20px, env(safe-area-inset-left));
  }
}
</style> 