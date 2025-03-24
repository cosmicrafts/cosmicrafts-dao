<!-- File: components/user/NotificationIcon.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Props
const props = defineProps({
  // Optional props
});

// State
const hasUnread = ref(false);
const notificationCount = ref(0);
const router = useRouter();

// Computed
const badgeClass = computed(() => {
  return {
    'has-notifications': notificationCount.value > 0
  };
});

// Methods
const navigateToNotifications = () => {
  router.push('/notifications');
};

// On component mount, check for notifications
onMounted(() => {
  // Simulate fetching notification data
  setTimeout(() => {
    notificationCount.value = 3; // Example: 3 unread notifications
    hasUnread.value = notificationCount.value > 0;
  }, 1000);
});
</script>

<template>
  <div class="notification-icon-wrapper">
    <button 
      class="notification-icon"
      @click="navigateToNotifications"
      :class="{ 'has-unread': hasUnread }"
    >
      <i class="fa-solid fa-bell"></i>
      <span v-if="notificationCount > 0" class="notification-badge" :class="badgeClass">
        {{ notificationCount > 99 ? '99+' : notificationCount }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.notification-icon-wrapper {
  position: relative;
  margin-right: 10px;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: white;
}

.notification-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.notification-icon.has-unread {
  color: var(--color-accent, #FF9500);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: var(--color-error, #FF3B30);
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style> 