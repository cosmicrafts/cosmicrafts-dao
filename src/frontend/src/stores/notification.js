import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([]);
  const nextId = ref(1);
  
  // Actions
  
  /**
   * Show a notification
   * @param {Object} notification - The notification object
   * @param {string} notification.title - The notification title
   * @param {string} notification.message - The notification message
   * @param {string} notification.type - The notification type (info, success, error, warning)
   * @param {number} notification.duration - The notification duration in ms (default: 5000)
   */
  function showNotification({ title, message, type = 'info', duration = 5000 }) {
    const id = nextId.value++;
    
    // Add notification to list
    notifications.value.push({
      id,
      title,
      message,
      type,
      duration,
      timestamp: Date.now(),
    });
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
    
    return id;
  }
  
  /**
   * Dismiss a notification by ID
   * @param {number} id - The notification ID
   */
  function dismissNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }
  
  /**
   * Dismiss all notifications
   */
  function dismissAll() {
    notifications.value = [];
  }
  
  /**
   * Show a success notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number} duration - The notification duration in ms (default: 5000)
   */
  function showSuccess(title, message, duration = 5000) {
    return showNotification({ title, message, type: 'success', duration });
  }
  
  /**
   * Show an error notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number} duration - The notification duration in ms (default: 8000)
   */
  function showError(title, message, duration = 8000) {
    return showNotification({ title, message, type: 'error', duration });
  }
  
  /**
   * Show a warning notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number} duration - The notification duration in ms (default: 6000)
   */
  function showWarning(title, message, duration = 6000) {
    return showNotification({ title, message, type: 'warning', duration });
  }
  
  /**
   * Show an info notification
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {number} duration - The notification duration in ms (default: 5000)
   */
  function showInfo(title, message, duration = 5000) {
    return showNotification({ title, message, type: 'info', duration });
  }
  
  return {
    // State
    notifications,
    
    // Actions
    showNotification,
    dismissNotification,
    dismissAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}); 