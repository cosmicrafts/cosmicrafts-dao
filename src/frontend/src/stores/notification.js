import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    config: {
      position: 'top-right',
      maxNotifications: 5,
      defaultDuration: 5000
    }
  }),
  
  actions: {
    addNotification(notification) {
      const id = notification.id || uuidv4();
      const duration = notification.duration || this.config.defaultDuration;
      
      // Create the notification object
      const newNotification = {
        id,
        title: notification.title || 'Notification',
        message: notification.message || '',
        type: notification.type || 'info',
        duration,
        timestamp: Date.now(),
        actions: notification.actions || [],
        autoClose: notification.autoClose !== false,
        ...notification
      };
      
      // Add to beginning of array to show newest notifications at the top
      this.notifications.unshift(newNotification);
      
      // Remove excess notifications
      if (this.notifications.length > this.config.maxNotifications) {
        const toRemove = this.notifications.slice(this.config.maxNotifications);
        toRemove.forEach(n => this.removeNotification(n.id));
      }
      
      // Auto-remove after duration if autoClose is true
      if (newNotification.autoClose && duration > 0) {
        setTimeout(() => {
          this.removeNotification(id);
        }, duration);
      }
      
      return id;
    },
    
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },
    
    clearAll() {
      this.notifications = [];
    },
    
    // Utility methods for common notification types
    success(message, options = {}) {
      return this.addNotification({
        title: options.title || 'Success',
        message,
        type: 'success',
        ...options
      });
    },
    
    error(message, options = {}) {
      return this.addNotification({
        title: options.title || 'Error',
        message,
        type: 'error',
        duration: options.duration || 8000, // Errors stay longer by default
        ...options
      });
    },
    
    info(message, options = {}) {
      return this.addNotification({
        title: options.title || 'Information',
        message,
        type: 'info',
        ...options
      });
    },
    
    warning(message, options = {}) {
      return this.addNotification({
        title: options.title || 'Warning',
        message,
        type: 'warning',
        ...options
      });
    },
    
    achievement(message, options = {}) {
      return this.addNotification({
        title: options.title || 'Achievement',
        message,
        type: 'achievement',
        ...options
      });
    },
    
    reward(message, options = {}) {
      return this.addNotification({
        title: options.title || 'Reward',
        message,
        type: 'reward',
        ...options
      });
    },
    
    // Handle API responses directly
    fromApiResponse(success, message, options = {}) {
      if (success) {
        return this.success(message, options);
      } else {
        return this.error(message, options);
      }
    },
    
    // Configuration
    updateConfig(config) {
      this.config = { ...this.config, ...config };
    }
  }
}); 