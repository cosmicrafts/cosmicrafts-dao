<template>
  <div class="notification-icon-container">
    <div 
      class="notification-icon" 
      @click="toggleNotifications"
      :class="{ 'has-notifications': notificationCount > 0 }"
    >
      <img :src="notificationIcon" alt="Notifications" class="icon" />
      <span v-if="notificationCount > 0" class="notification-badge">
        {{ notificationCount > 9 ? '9+' : notificationCount }}
      </span>
    </div>
    
    <transition name="dropdown">
      <div v-if="showNotifications" class="notification-dropdown" ref="notificationDropdown">
        <div class="notification-header">
          <h3>{{ $t('notifications.title') }}</h3>
          <button v-if="friendRequests.length > 0" class="view-all-btn" @click="viewAllNotifications">
            {{ $t('notifications.viewAll') }}
          </button>
        </div>
        
        <div v-if="isLoading" class="notification-loading">
          <span class="loading-indicator">⟳</span>
          <span>Loading notifications...</span>
        </div>
        
        <div v-else-if="friendRequests.length === 0 && notifications.length === 0" class="no-notifications">
          <span>{{ $t('notifications.noNotifications') }}</span>
        </div>
        
        <div v-else>
          <!-- Friend Requests Section -->
          <div v-if="friendRequests.length > 0" class="notification-section">
            <h4 class="section-title">{{ $t('notifications.friendRequests') }}</h4>
            <div v-for="(request, index) in displayedFriendRequests" :key="'fr-' + index" class="friend-request">
              <div class="request-info">
                <div class="request-avatar">
                  <img :src="getDefaultAvatar()" alt="User Avatar" class="avatar" />
                </div>
                <div class="request-details">
                  <span class="request-username">{{ request.username || 'Unknown User' }}</span>
                  <span class="request-message">{{ $t('notifications.sentYouFriendRequest') }}</span>
                  <span class="request-time">{{ formatTime(request.timestamp) }}</span>
                </div>
              </div>
              <div class="request-actions">
                <button 
                  class="accept-btn" 
                  @click="acceptFriendRequest(request.from)"
                  :disabled="isProcessingRequest"
                >
                  {{ $t('notifications.accept') }}
                </button>
                <button 
                  class="decline-btn" 
                  @click="declineFriendRequest(request.from)"
                  :disabled="isProcessingRequest"
                >
                  {{ $t('notifications.decline') }}
                </button>
              </div>
            </div>
            <div v-if="friendRequests.length > 2" class="view-more">
              <button @click="viewAllFriendRequests" class="view-more-btn">
                {{ $t('notifications.viewAll') }} {{ friendRequests.length }} {{ $t('notifications.friendRequests').toLowerCase() }}
              </button>
            </div>
          </div>
          
          <!-- Other Notifications Section -->
          <div v-if="notifications.length > 0" class="notification-section">
            <h4 class="section-title">Recent</h4>
            <div v-for="(notification, index) in displayedNotifications" :key="'notif-' + index" class="notification-item">
              <div class="notification-content">
                <span class="notification-message">{{ translateMessage(notification.message) }}</span>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
            </div>
            <div v-if="notifications.length > 3" class="view-more">
              <button @click="viewAllNotifications" class="view-more-btn">
                {{ $t('notifications.viewAll') }} {{ notifications.length }} {{ $t('notifications.title').toLowerCase() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import notificationIcon from '@/assets/icons/notifications.svg';

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCanisterStore } from '@/stores/canister';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import defaultAvatar from '@/assets/avatars/Avatar_01.webp';
import { translateNotification } from '@/utils/notificationTranslator';

const router = useRouter();
const canisterStore = useCanisterStore();
const authStore = useAuthStore();
const { t } = useI18n();

// State
const showNotifications = ref(false);
const notifications = ref([]);
const friendRequests = ref([]);
const isLoading = ref(false);
const isProcessingRequest = ref(false);
const notificationDropdown = ref(null);

// Computed properties
const notificationCount = computed(() => {
  return friendRequests.value.length + notifications.value.length;
});

const displayedFriendRequests = computed(() => {
  return friendRequests.value.slice(0, 2); // Show only first 2 friend requests
});

const displayedNotifications = computed(() => {
  return notifications.value.slice(0, 3); // Show only first 3 notifications
});

// Methods
const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value;
  
  if (showNotifications.value) {
    await fetchNotifications();
  }
};

const fetchNotifications = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  
  try {
    // Wait for initialization with retry mechanism
    let cosmicrafts = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempting to get cosmicrafts canister (attempt ${attempt}/${maxRetries})...`);
      cosmicrafts = await canisterStore.get("cosmicrafts");
      
      if (cosmicrafts) {
        console.log('Successfully obtained cosmicrafts canister');
        break;
      } else if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        const delay = 500 * Math.pow(1.5, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!cosmicrafts) {
      console.error('Cosmicrafts canister not initialized after retries');
      return;
    }
    
    // Fetch friend requests
    const requests = await cosmicrafts.getFriendRequests();
    console.log('Friend requests:', requests);
    
    // Process friend requests to include usernames
    const processedRequests = [];
    for (const request of requests) {
      try {
        // Get the profile of the user who sent the request
        const profile = await cosmicrafts.getProfile(request.from);
        processedRequests.push({
          ...request,
          username: profile ? profile.username : 'Unknown User'
        });
      } catch (error) {
        console.error('Error fetching profile for friend request:', error);
        processedRequests.push(request);
      }
    }
    
    friendRequests.value = processedRequests;
    
    // Fetch notifications
    const notifs = await cosmicrafts.getNotifications();
    notifications.value = notifs;
    
    console.log('Notifications loaded:', { friendRequests: friendRequests.value, notifications: notifications.value });
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    isLoading.value = false;
  }
};

const acceptFriendRequest = async (fromId) => {
  if (isProcessingRequest.value) return;
  
  isProcessingRequest.value = true;
  
  try {
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      console.error('Cosmicrafts canister not initialized');
      return;
    }
    
    const [success, message] = await cosmicrafts.acceptFriendRequest(fromId);
    
    console.log('Accept friend request response:', { success, message });
    
    if (success) {
      // Remove the request from the list
      friendRequests.value = friendRequests.value.filter(req => req.from.toText() !== fromId.toText());
      console.log('Friend request accepted successfully');
    } else {
      console.error('Failed to accept friend request:', message);
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
  } finally {
    isProcessingRequest.value = false;
  }
};

const declineFriendRequest = async (fromId) => {
  if (isProcessingRequest.value) return;
  
  isProcessingRequest.value = true;
  
  try {
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      console.error('Cosmicrafts canister not initialized');
      return;
    }
    
    const [success, message] = await cosmicrafts.declineFriendRequest(fromId);
    
    console.log('Decline friend request response:', { success, message });
    
    if (success) {
      // Remove the request from the list
      friendRequests.value = friendRequests.value.filter(req => req.from.toText() !== fromId.toText());
      console.log('Friend request declined successfully');
    } else {
      console.error('Failed to decline friend request:', message);
    }
  } catch (error) {
    console.error('Error declining friend request:', error);
  } finally {
    isProcessingRequest.value = false;
  }
};

const viewAllFriendRequests = () => {
  router.push('/notifications?tab=friend-requests');
  showNotifications.value = false;
};

const viewAllNotifications = () => {
  router.push('/notifications');
  showNotifications.value = false;
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
  const now = new Date();
  const diffMs = now - date;
  
  // Less than a minute
  if (diffMs < 60000) {
    return t('notifications.timeAgo.justNow');
  }
  
  // Less than an hour
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000);
    return t('notifications.timeAgo.minutesAgo', { minutes });
  }
  
  // Less than a day
  if (diffMs < 86400000) {
    const hours = Math.floor(diffMs / 3600000);
    return t('notifications.timeAgo.hoursAgo', { hours });
  }
  
  // Less than a week
  if (diffMs < 604800000) {
    const days = Math.floor(diffMs / 86400000);
    return t('notifications.timeAgo.daysAgo', { days });
  }
  
  // Format as date
  return date.toLocaleDateString();
};

const getDefaultAvatar = () => {
  return defaultAvatar;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (notificationDropdown.value && !notificationDropdown.value.contains(event.target) && 
      !event.target.closest('.notification-icon')) {
    showNotifications.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  
  // Wait a brief moment to let app initialization progress
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Fetch notifications initially if user is authenticated, but with delay to let auth initialize
  if (authStore.isAuthenticated) {
    fetchNotifications();
  } else {
    console.log('Waiting for authentication before fetching notifications...');
    // Additional delay if not authenticated yet, auth might still be initializing
    await new Promise(resolve => setTimeout(resolve, 800));
    // Try again after delay
    if (authStore.isAuthenticated) {
      fetchNotifications();
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for auth changes
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    fetchNotifications();
  } else {
    notifications.value = [];
    friendRequests.value = [];
  }
});

// Add this method to translate notification messages
const translateMessage = (message) => {
  return translateNotification(message, t);
};
</script>

<style scoped>
.notification-icon-container {
  position: relative;
  display: inline-block;

}

.notification-icon {
  position: relative;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: var(--radius-medium);
  transition: all var(--transition-fast);
}

.notification-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.notification-icon.has-notifications .icon {
  animation: pulse 2s infinite;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease;
}

.notification-icon:hover .icon {
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background-color: var(--color-error);
  color: white;
  border-radius: var(--radius-circle);
  width: 18px;
  height: 18px;
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-bold);
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--gradient-primary);
  border: var(--border-thin);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-medium);
  z-index: var(--z-dropdown);
  margin-top: var(--space-sm);
  backdrop-filter: blur(4px);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-thin);
}

.notification-header h3 {
  margin: 0;
  font-size: var(--text-md);
  color: var(--color-text-primary);
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--color-info);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: 0;
}

.notification-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  color: var(--color-text-tertiary);
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: var(--space-sm);
  font-size: var(--text-lg);
}

.no-notifications {
  padding: var(--space-xl) var(--space-md);
  text-align: center;
  color: var(--color-text-tertiary);
}

.notification-section {
  padding: var(--space-sm) 0;
}

.section-title {
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}

.friend-request {
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-thin);
}

.request-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.request-avatar {
  margin-right: var(--space-sm);
}

.request-avatar .avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-medium);
  border: var(--border-thin);
}

.request-details {
  display: flex;
  flex-direction: column;
}

.request-username {
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
}

.request-message {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.request-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.request-actions {
  display: flex;
  gap: var(--space-sm);
}

.accept-btn, .decline-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-small);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.accept-btn {
  background-color: var(--color-info);
  color: white;
}

.accept-btn:hover {
  background-color: #3a5cef;
}

.decline-btn {
  background-color: transparent;
  border: var(--border-thin);
  color: var(--color-text-primary);
}

.decline-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.accept-btn:disabled, .decline-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notification-item {
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-thin);
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-message {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.view-more {
  padding: var(--space-sm) var(--space-md);
  text-align: center;
}

.view-more-btn {
  background: none;
  border: none;
  color: var(--color-info);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: 0;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 