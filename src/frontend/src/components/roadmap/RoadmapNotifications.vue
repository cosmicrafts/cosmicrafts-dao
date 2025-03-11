<template>
  <div class="notifications-container" v-if="notifications.length > 0 || hasRecentUpdates">
    <div class="notifications-header">
      <h3 class="notifications-title">
        <span class="notification-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </span>
        Roadmap Updates
        <span class="notification-badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
      </h3>
      <button
        class="dismiss-all-button"
        v-if="notifications.length > 0"
        @click="dismissAllNotifications"
        aria-label="Dismiss all notifications"
      >
        Dismiss All
      </button>
    </div>

    <transition-group 
      name="notification-list" 
      tag="div" 
      class="notifications-list"
    >
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        class="notification-item"
        :class="{ 
          'type-update': notification.type === 'update',
          'type-new': notification.type === 'new',
          'type-complete': notification.type === 'complete'
        }"
      >
        <div class="notification-content">
          <div class="notification-type-icon" aria-hidden="true">
            <svg v-if="notification.type === 'update'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <svg v-else-if="notification.type === 'new'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <svg v-else-if="notification.type === 'complete'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
          <div class="notification-text">
            <p class="notification-message">{{ notification.message }}</p>
            <p class="notification-date">{{ formatDate(notification.date) }}</p>
          </div>
        </div>
        <button 
          class="dismiss-button" 
          @click="dismissNotification(notification.id)"
          aria-label="Dismiss notification"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </transition-group>

    <div v-if="hasRecentUpdates && notifications.length === 0" class="all-caught-up">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <p>You're all caught up!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapNotifications',
  props: {
    notifications: {
      type: Array,
      default: () => []
    },
    hasRecentUpdates: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    notificationCount() {
      return this.notifications.length;
    }
  },
  methods: {
    dismissNotification(notificationId) {
      this.$emit('dismiss-notification', notificationId);
    },
    dismissAllNotifications() {
      this.$emit('dismiss-all-notifications');
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  }
};
</script>

<style scoped>
.notifications-container {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.notifications-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.notification-icon {
  display: inline-flex;
  margin-right: 0.75rem;
  color: rgba(15, 185, 253, 0.9);
}

.notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 0.75rem;
  background: rgba(15, 185, 253, 0.9);
  color: rgba(15, 25, 45, 0.9);
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.dismiss-all-button {
  padding: 0.4rem 0.8rem;
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dismiss-all-button:hover {
  background: rgba(15, 185, 253, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(15, 25, 45, 0.6);
  border-radius: 10px;
  border-left: 4px solid rgba(15, 185, 253, 0.6);
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(15, 25, 45, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.notification-item.type-update {
  border-left-color: rgba(15, 185, 253, 0.8);
}

.notification-item.type-new {
  border-left-color: rgba(201, 42, 253, 0.8);
}

.notification-item.type-complete {
  border-left-color: rgba(0, 210, 106, 0.8);
}

.notification-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.notification-type-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 1rem;
  border-radius: 50%;
  background: rgba(15, 25, 45, 0.6);
}

.type-update .notification-type-icon {
  color: rgba(15, 185, 253, 0.9);
  background: rgba(15, 185, 253, 0.1);
}

.type-new .notification-type-icon {
  color: rgba(201, 42, 253, 0.9);
  background: rgba(201, 42, 253, 0.1);
}

.type-complete .notification-type-icon {
  color: rgba(0, 210, 106, 0.9);
  background: rgba(0, 210, 106, 0.1);
}

.notification-text {
  flex: 1;
}

.notification-message {
  margin: 0 0 0.3rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.notification-date {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.dismiss-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dismiss-button:hover {
  background: rgba(255, 75, 75, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.all-caught-up {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.all-caught-up svg {
  margin-bottom: 1rem;
  color: rgba(0, 210, 106, 0.8);
}

.all-caught-up p {
  margin: 0;
  font-size: 1.1rem;
}

/* Animation transitions */
.notification-list-enter-active, 
.notification-list-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.notification-list-enter-from, 
.notification-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.notification-list-move {
  transition: transform 0.6s;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .notifications-container {
    padding: 1.25rem;
  }
  
  .notification-item {
    padding: 0.75rem;
  }
  
  .notification-type-icon {
    width: 28px;
    height: 28px;
    margin-right: 0.75rem;
  }
}
</style> 