import { ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Composable for using the notification system
 * Can be used in any component with the composition API
 * 
 * Example:
 * ```
 * import { useNotification } from '@/composables/useNotification';
 * 
 * const { success, error } = useNotification();
 * 
 * success('Operation successful!');
 * ```
 */
export function useNotification() {
  const { t } = useI18n();

  // Create a single notification store that can be shared across components
  const notifications = ref([]);
  let notificationId = 0;

  // Remove notifications after they expire
  const clearNotification = (id) => {
    notifications.value = notifications.value.filter(notif => notif.id !== id);
  };

  // Add a new notification
  const addNotification = (message, options = {}) => {
    const id = notificationId++;
    const notification = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration || 3000,
      autoClose: options.autoClose !== false,
    };
    
    notifications.value.push(notification);
    
    // Auto-remove the notification after duration
    if (notification.autoClose) {
      setTimeout(() => {
        clearNotification(id);
      }, notification.duration);
    }
    
    return id;
  };

  // Convenience methods for different notification types
  const success = (message, options = {}) => 
    addNotification(message, { ...options, type: 'success' });
  
  const error = (message, options = {}) => 
    addNotification(message, { ...options, type: 'error' });
  
  const info = (message, options = {}) => 
    addNotification(message, { ...options, type: 'info' });
  
  const warning = (message, options = {}) => 
    addNotification(message, { ...options, type: 'warning' });
  
  // Special notification for rewards - with animation
  const reward = (message, options = {}) => 
    addNotification(message, { 
      ...options, 
      type: 'reward', 
      autoClose: options.autoClose !== false,
      duration: options.duration || 5000 
    });

  return {
    notifications,
    addNotification,
    clearNotification,
    success,
    error,
    info,
    warning,
    reward
  };
} 