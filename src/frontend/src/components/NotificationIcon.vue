<template>
  <div class="notification-icon-container">
    <div 
      class="notification-icon" 
      @click="toggleNotifications"
      :class="{ 'has-notifications': notificationCount > 0 }"
    >
      <span class="icon">🔔</span>
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
  if (!authStore.isAuthenticated) return;
  
  isLoading.value = true;
  
  try {
    const cosmicrafts = await canisterStore.get("cosmicrafts");
    if (!cosmicrafts) {
      console.error('Cosmicrafts canister not initialized');
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
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Fetch notifications initially if user is authenticated
  if (authStore.isAuthenticated) {
    fetchNotifications();
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
  margin-right: 1rem;
}

.notification-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.notification-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.notification-icon.has-notifications .icon {
  animation: pulse 2s infinite;
}

.icon {
  font-size: 1.5rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff3e3e;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.95), rgba(23, 33, 43, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  margin-top: 0.5rem;
  backdrop-filter: blur(4px);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #ffffff;
}

.view-all-btn {
  background: none;
  border: none;
  color: #4a6cff;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.notification-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  color: #8a8a8a;
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.no-notifications {
  padding: 2rem 1rem;
  text-align: center;
  color: #8a8a8a;
}

.notification-section {
  padding: 0.5rem 0;
}

.section-title {
  margin: 0;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  color: #8a8a8a;
  text-transform: uppercase;
}

.friend-request {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.request-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.request-avatar {
  margin-right: 0.75rem;
}

.request-avatar .avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.request-details {
  display: flex;
  flex-direction: column;
}

.request-username {
  font-weight: 500;
  color: #ffffff;
}

.request-message {
  font-size: 0.75rem;
  color: #8a8a8a;
  margin-top: 0.25rem;
}

.request-time {
  font-size: 0.75rem;
  color: #8a8a8a;
  margin-top: 0.25rem;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn, .decline-btn {
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.accept-btn {
  background-color: #4a6cff;
  color: white;
}

.accept-btn:hover {
  background-color: #3a5cef;
}

.decline-btn {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.decline-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.accept-btn:disabled, .decline-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notification-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-message {
  color: #ffffff;
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #8a8a8a;
  margin-top: 0.25rem;
}

.view-more {
  padding: 0.5rem 1rem;
  text-align: center;
}

.view-more-btn {
  background: none;
  border: none;
  color: #4a6cff;
  font-size: 0.8rem;
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
  transition: opacity 0.3s, transform 0.3s;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 