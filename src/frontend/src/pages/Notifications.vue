<template>
  <div class="notifications-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ $t('notifications.title') }}</h1>
        <div class="tabs">
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'all' }" 
            @click="setActiveTab('all')"
          >
            {{ $t('notifications.tabs.all') }}
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'friend-requests' }" 
            @click="setActiveTab('friend-requests')"
          >
            {{ $t('notifications.friendRequests') }}
            <span v-if="friendRequests.length > 0" class="badge">{{ friendRequests.length }}</span>
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'notifications' }" 
            @click="setActiveTab('notifications')"
          >
            {{ $t('notifications.tabs.notifications') }}
            <span v-if="notifications.length > 0" class="badge">{{ notifications.length }}</span>
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-container">
        <span class="loading-indicator">⟳</span>
        <span>Loading notifications...</span>
      </div>

      <div v-else-if="(activeTab === 'all' || activeTab === 'friend-requests') && friendRequests.length === 0 && 
                      (activeTab === 'all' || activeTab === 'notifications') && notifications.length === 0" 
           class="empty-state">
        <div class="empty-icon">🔔</div>
        <h3>{{ $t('notifications.noNotifications') }}</h3>
        <p>You don't have any notifications at the moment.</p>
      </div>

      <div v-else>
        <!-- Friend Requests Section -->
        <div v-if="(activeTab === 'all' || activeTab === 'friend-requests') && friendRequests.length > 0" class="section">
          <h2 class="section-title">{{ $t('notifications.friendRequests') }}</h2>
          <div class="friend-requests-list">
            <div v-for="(request, index) in friendRequests" :key="'fr-' + index" class="friend-request-card">
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
                  <span v-if="isProcessingRequest && processingRequestId === request.from.toText()" class="loading-indicator">⟳</span>
                  {{ $t('notifications.accept') }}
                </button>
                <button 
                  class="decline-btn" 
                  @click="declineFriendRequest(request.from)"
                  :disabled="isProcessingRequest"
                >
                  <span v-if="isProcessingRequest && processingRequestId === request.from.toText()" class="loading-indicator">⟳</span>
                  {{ $t('notifications.decline') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Section -->
        <div v-if="(activeTab === 'all' || activeTab === 'notifications') && notifications.length > 0" class="section">
          <h2 class="section-title">{{ $t('notifications.tabs.notifications') }}</h2>
          <div class="notifications-list">
            <div v-for="(notification, index) in notifications" :key="'notif-' + index" class="notification-card">
              <div class="notification-content">
                <div class="notification-avatar">
                  <img :src="getDefaultAvatar()" alt="User Avatar" class="avatar" />
                </div>
                <div class="notification-details">
                  <span class="notification-message">{{ translateMessage(notification.message) }}</span>
                  <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCanisterStore } from '@/stores/canister';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import defaultAvatar from '@/assets/avatars/Avatar_01.webp';
import { translateNotification } from '@/utils/notificationTranslator';

const route = useRoute();
const router = useRouter();
const canisterStore = useCanisterStore();
const authStore = useAuthStore();
const { t } = useI18n();

// State
const activeTab = ref('all');
const notifications = ref([]);
const friendRequests = ref([]);
const isLoading = ref(true);
const isProcessingRequest = ref(false);
const processingRequestId = ref(null);

// Set active tab based on route query
onMounted(() => {
  if (route.query.tab && ['all', 'friend-requests', 'notifications'].includes(route.query.tab)) {
    activeTab.value = route.query.tab;
  }
  
  fetchNotifications();
});

// Watch for route changes
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['all', 'friend-requests', 'notifications'].includes(newTab)) {
    activeTab.value = newTab;
  }
});

// Methods
const setActiveTab = (tab) => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
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
  processingRequestId.value = fromId.toText();
  
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
    processingRequestId.value = null;
  }
};

const declineFriendRequest = async (fromId) => {
  if (isProcessingRequest.value) return;
  
  isProcessingRequest.value = true;
  processingRequestId.value = fromId.toText();
  
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
    processingRequestId.value = null;
  }
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

// Add this method to translate notification messages
const translateMessage = (message) => {
  return translateNotification(message, t);
};
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background: radial-gradient(circle at center, #0a0e1a, #000000);
  color: #ffffff;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.tab-button {
  background: none;
  border: none;
  color: #8a8a8a;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab-button.active {
  color: #ffffff;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4a6cff;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #ff3e3e;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #8a8a8a;
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.empty-state p {
  color: #8a8a8a;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.friend-requests-list, .notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.friend-request-card, .notification-card {
  background: rgba(30, 43, 56, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.friend-request-card {
  padding: 1rem;
}

.request-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.request-avatar {
  margin-right: 1rem;
}

.request-avatar .avatar {
  width: 50px;
  height: 50px;
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
  font-size: 1.1rem;
}

.request-message {
  font-size: 0.8rem;
  color: #8a8a8a;
  margin-top: 0.25rem;
}

.request-time {
  font-size: 0.8rem;
  color: #8a8a8a;
  margin-top: 0.25rem;
}

.request-actions {
  display: flex;
  gap: 0.75rem;
}

.accept-btn, .decline-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accept-btn {
  background-color: #4a6cff;
  color: white;
  flex: 1;
}

.accept-btn:hover {
  background-color: #3a5cef;
}

.decline-btn {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  flex: 1;
}

.decline-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.accept-btn:disabled, .decline-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notification-card {
  padding: 1rem;
}

.notification-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.notification-avatar {
  margin-right: 1rem;
}

.notification-avatar .avatar {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.notification-message {
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
}

.notification-time {
  font-size: 0.8rem;
  color: #8a8a8a;
  margin-top: 0.5rem;
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive styles */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .tabs {
    overflow-x: auto;
    padding-bottom: 1rem;
  }
  
  .tab-button {
    white-space: nowrap;
  }
  
  .friend-request-card {
    padding: 0.75rem;
  }
  
  .request-avatar .avatar {
    width: 40px;
    height: 40px;
  }
  
  .request-username {
    font-size: 1rem;
  }
  
  .accept-btn, .decline-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style> 