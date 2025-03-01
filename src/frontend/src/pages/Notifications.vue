<template>
  <div class="notifications-page cosmic-page-bg-gradient with-glow">
    <div class="cosmic-page-container">
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
  background: var(--gradient-hero);
  color: var(--color-text-primary);
  padding: var(--space-xl) 0;
}

.cosmic-page-container {
  margin-left: 1rem;
  max-width: 100%;

  padding: 0 var(--space-md);
}

.page-header {
  margin-bottom: var(--space-xl);
  background: var(--color-surface-primary);
  padding: var(--space-lg);
  border-radius: var(--radius-large);
  border: var(--border-thin);
  backdrop-filter: blur(8px);
  margin-top: 4rem;
}

.page-header h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
  font-weight: var(--weight-bold);
}

.tabs {
  display: flex;
  gap: var(--space-md);
  margin-bottom: 0;
  border-bottom: var(--border-thin);
  padding-bottom: var(--space-sm);
}

.tab-button {
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-fast);
}

.tab-button.active {
  color: var(--color-text-primary);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-info);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-error);
  color: white;
  border-radius: var(--radius-circle);
  width: 18px;
  height: 18px;
  font-size: var(--text-xs);
  margin-left: var(--space-sm);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl);
  color: var(--color-text-tertiary);
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: var(--space-sm);
  font-size: var(--text-lg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl) var(--space-xl);
  text-align: center;
}

.empty-icon {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.empty-state p {
  color: var(--color-text-tertiary);
}

.section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.friend-requests-list, .notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.friend-request-card, .notification-card {
  background: var(--color-surface-primary);
  border: var(--border-thin);
  border-radius: var(--radius-medium);
  overflow: hidden;
  transition: all var(--transition-medium);
  backdrop-filter: blur(8px);
}

.friend-request-card:hover, .notification-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  border-color: var(--color-border-hover);
}

.friend-request-card {
  padding: var(--space-md);
}

.request-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-md);
}

.request-avatar {
  margin-right: var(--space-md);
}

.request-avatar .avatar {
  width: 50px;
  height: 50px;
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
  font-size: var(--text-md);
}

.request-message {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.request-time {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}

.request-actions {
  display: flex;
  gap: var(--space-sm);
}

.accept-btn, .decline-btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-small);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.accept-btn {
  background-color: var(--color-info);
  color: white;
  flex: 1;
}

.accept-btn:hover {
  background-color: #3a5cef;
}

.decline-btn {
  background-color: transparent;
  border: var(--border-thin);
  color: var(--color-text-primary);
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
  padding: var(--space-md);
}

.notification-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.notification-avatar {
  margin-right: var(--space-md);
}

.notification-avatar .avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-medium);
  border: var(--border-thin);
}

.notification-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.notification-message {
  color: var(--color-text-primary);
  font-size: var(--text-md);
  line-height: 1.5;
}

.notification-time {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-sm);
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive styles */
@media (max-width: 768px) {
  .cosmic-page-container {
    padding: 0 var(--space-md);
  }
  
  .tabs {
    overflow-x: auto;
    padding-bottom: var(--space-md);
  }
  
  .tab-button {
    white-space: nowrap;
  }
  
  .friend-request-card {
    padding: var(--space-sm);
  }
  
  .request-avatar .avatar {
    width: 40px;
    height: 40px;
  }
  
  .request-username {
    font-size: var(--text-md);
  }
  
  .accept-btn, .decline-btn {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-sm);
  }
}
</style> 