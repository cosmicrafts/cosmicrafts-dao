<template>
  <section class="dashboard-section cosmic-panel friends-section">
    <div class="section-header">
      <h2><i class="fas fa-user-friends"></i> Friends</h2>
      <div class="section-actions">
        <button @click="refreshFriends" class="action-button refresh-btn">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
        </button>
        <button @click="showSettings = !showSettings" class="action-button settings-btn">
          <i class="fas fa-cog"></i>
        </button>
      </div>
    </div>

    <!-- Friend Tabs -->
    <div class="friends-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="tab-button"
        :class="{ 'active': activeTab === tab.id }"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="friends-loading">
      <div class="cosmic-loader small"></div>
      <p>Loading friend data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="friends-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="refreshFriends" class="cosmic-button cosmic-button-primary sm">Try Again</button>
    </div>

    <!-- Friends List -->
    <div v-else-if="activeTab === 'all' && friends.length > 0" class="friends-list">
      <FriendCard 
        v-for="friend in friends"
        :key="friend.playerId"
        :friend="friend"
        :dashboard-mode="props.dashboardMode"
        @remove="confirmRemoveFriend"
        @message="messageFriend"
        @view-profile="viewProfile"
      />
    </div>
    
    <!-- Friend Requests -->
    <div v-else-if="activeTab === 'requests' && pendingRequests.length > 0" class="friends-list requests">
      <FriendRequestCard 
        v-for="request in pendingRequests"
        :key="request.from"
        :request="request"
        @accept="acceptFriendRequest"
        @decline="declineFriendRequest"
      />
    </div>
    
    <!-- Blocked Users -->
    <div v-else-if="activeTab === 'blocked' && blockedUsers.length > 0" class="friends-list blocked">
      <BlockedUserCard 
        v-for="user in blockedUsers"
        :key="user.playerId"
        :user="user"
        @unblock="unblockUser"
      />
    </div>
    
    <!-- Empty State -->
    <div v-else class="friends-empty">
      <div v-if="activeTab === 'all'" class="empty-state">
        <i class="fas fa-user-friends"></i>
        <h3>No friends yet</h3>
        <p>Start connecting with other players!</p>
        <button @click="activeTab = 'discover'" class="cosmic-button cosmic-button-primary">Find Friends</button>
      </div>
      
      <div v-else-if="activeTab === 'requests'" class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>No friend requests</h3>
        <p>When someone sends you a friend request, it will appear here</p>
      </div>
      
      <div v-else-if="activeTab === 'blocked'" class="empty-state">
        <i class="fas fa-ban"></i>
        <h3>No blocked users</h3>
        <p>Users you block will appear here</p>
      </div>
      
      <div v-else-if="activeTab === 'discover'" class="empty-state">
        <i class="fas fa-search"></i>
        <h3>Find Friends</h3>
        
        <div class="search-tabs">
          <button class="search-tab-btn" :class="{ 'active': searchMode === 'username' }" @click="searchMode = 'username'">
            <i class="fas fa-user"></i> By Username
          </button>
          <button class="search-tab-btn" :class="{ 'active': searchMode === 'principal' }" @click="searchMode = 'principal'">
            <i class="fas fa-id-card"></i> By Principal ID
          </button>
        </div>
        
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="searchMode === 'username' ? 'Search by username' : 'Enter principal ID'"
            @keyup.enter="searchUsers"
          />
          <button @click="searchUsers" class="search-button">
            <i class="fas fa-search"></i>
          </button>
        </div>
        
        <div v-if="isSearching" class="search-loading">
          <span class="loading-spinner"></span>
          <span>Searching...</span>
        </div>
        <div v-else-if="searchResults.length > 0" class="search-results">
          <PlayerSearchResult
            v-for="player in searchResults"
            :key="player.id"
            :player="player"
            @add-friend="sendFriendRequest"
          />
        </div>
        <p v-else-if="searchPerformed && searchQuery" class="no-results">No users found matching your search</p>
        <p v-else-if="searchMode === 'username'" class="search-hint">
          Try searching for usernames like "cosmic", "star", or "nebula"
        </p>
        <p v-else class="search-hint">
          Enter a complete principal ID (e.g., "x4zkw-zyaaa-aaaaa-qaacq-cai")
        </p>
      </div>
    </div>

    <!-- Settings Popup -->
    <div v-if="showSettings" class="settings-popup">
      <div class="settings-header">
        <h3>Privacy Settings</h3>
        <button @click="showSettings = false" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="settings-content">
        <div class="setting-group">
          <h4>Who can send you friend requests?</h4>
          <div class="setting-options">
            <label class="radio-option">
              <input 
                type="radio" 
                name="privacy" 
                value="acceptAll" 
                v-model="privacySetting"
              />
              <span>Everyone</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                name="privacy" 
                value="friendsOfFriends" 
                v-model="privacySetting"
              />
              <span>Friends of Friends</span>
            </label>
            <label class="radio-option">
              <input 
                type="radio" 
                name="privacy" 
                value="blockAll" 
                v-model="privacySetting"
              />
              <span>Nobody</span>
            </label>
          </div>
          
          <button 
            @click="savePrivacySettings" 
            class="cosmic-button cosmic-button-primary"
            :disabled="isSavingSettings"
          >
            {{ isSavingSettings ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <ConfirmationModal 
      v-if="showConfirmation"
      :title="confirmData.title"
      :message="confirmData.message"
      :confirm-text="confirmData.confirmText"
      :cancel-text="confirmData.cancelText"
      @confirm="confirmData.onConfirm"
      @cancel="closeConfirmation"
    />

    <!-- Principal ID suggestions -->
    <div v-if="searchMode === 'principal' && !searchQuery && !searchPerformed" class="principal-suggestions">
      <h4>Popular Users</h4>
      <div class="suggestion-list">
        <div 
          v-for="(suggestion, index) in principalSuggestions" 
          :key="index" 
          class="suggestion-item"
          @click="useSuggestion(suggestion)"
        >
          <div class="suggestion-avatar">
            <img :src="getAvatarUrl(suggestion.avatar)" :alt="suggestion.name">
          </div>
          <div class="suggestion-info">
            <div class="suggestion-name">{{ suggestion.name }}</div>
            <div class="suggestion-id">{{ formatPrincipal(suggestion.principal) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- After search tabs -->
    <div v-if="searchMode === 'principal'" class="principal-explainer">
      <p>
        <i class="fas fa-info-circle"></i>
        Principal IDs are unique identifiers for Internet Computer users. You can find your friend's ID by asking them to share it from their profile.
      </p>
    </div>

    <!-- Add this after the friends list -->
    <div class="share-my-id">
      <h3>Share Your ID</h3>
      <p>Share your principal ID with others so they can add you as a friend:</p>
      <div class="id-copy-container">
        <input type="text" readonly :value="userPrincipalId" class="id-input" ref="principalInput" />
        <button @click="copyPrincipalId" class="cosmic-btn small">
          <i class="fas" :class="copied ? 'fa-check' : 'fa-copy'"></i>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p v-if="!userPrincipalId" class="id-error">
        <i class="fas fa-exclamation-triangle"></i> 
        Not logged in or identity not available
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCanisterStore } from '@/stores/canister';
import { useNotificationStore } from '@/stores/notification';
import { Principal } from '@dfinity/principal';
import FriendCard from '@/components/dashboard/friends/FriendCard.vue';
import FriendRequestCard from '@/components/dashboard/friends/FriendRequestCard.vue';
import BlockedUserCard from '@/components/dashboard/friends/BlockedUserCard.vue';
import PlayerSearchResult from '@/components/dashboard/friends/PlayerSearchResult.vue';
import ConfirmationModal from '@/components/ui/modals/ConfirmationModal.vue';

// Stores
const authStore = useAuthStore();
const canisterStore = useCanisterStore();
const notificationStore = useNotificationStore();
const router = useRouter();

// Props
const props = defineProps({
  dashboardMode: {
    type: Boolean,
    default: false
  }
});

// State
const isLoading = ref(true);
const isRefreshing = ref(false);
const error = ref(null);
const friends = ref([]);
const pendingRequests = ref([]);
const blockedUsers = ref([]);
const activeTab = ref('all');
const showSettings = ref(false);
const privacySetting = ref('acceptAll');
const isSavingSettings = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const isSearching = ref(false);
const searchPerformed = ref(false);
const showConfirmation = ref(false);
const confirmData = ref({
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: () => {}
});
const searchMode = ref('username');
const confirmationOpen = ref(false);
const playerToRemove = ref(null);
const userPrincipalId = computed(() => {
  const identity = authStore.getIdentity();
  return identity ? identity.getPrincipal().toString() : '';
});
const copied = ref(false);
const principalInput = ref(null);

// Popular principal IDs suggestions
const principalSuggestions = ref([
  {
    name: 'Cosmicrafts Admin',
    principal: 'aaaaa-aa',
    avatar: 'cosmic_admin'
  },
  {
    name: 'Test User 1',
    principal: 'hvr47-rfruk-fjz6z-exqu7-sqtwk-cbcl6-eqdga-dtlmj-afqsb-jdzwd-eae',
    avatar: 'default_avatar'
  },
  {
    name: 'Test User 2',
    principal: 'q4eej-kyaaa-aaaaa-aaaha-cai',
    avatar: 'default_avatar'
  }
]);

// Tabs configuration
const tabs = computed(() => [
  { id: 'all', label: 'Friends', icon: 'fas fa-user-friends', count: friends.value.length },
  { id: 'requests', label: 'Requests', icon: 'fas fa-user-plus', count: pendingRequests.value.length },
  { id: 'blocked', label: 'Blocked', icon: 'fas fa-ban', count: blockedUsers.value.length },
  { id: 'discover', label: 'Find Friends', icon: 'fas fa-search', count: 0 }
]);

// Fetch all friend data
const fetchFriendData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    // Fetch data in parallel
    const [friendsList, requests, blocked, privacySettings] = await Promise.all([
      cosmicrafts.getFriendsList(),
      cosmicrafts.getFriendRequests(),
      cosmicrafts.getBlockedUsers(),
      cosmicrafts.getMyPrivacySettings()
    ]);
    
    // Process friends list
    if (friendsList && friendsList[0]) {
      friends.value = await processFriends(friendsList[0]);
    } else {
      friends.value = [];
    }
    
    // Process friend requests
    if (requests && requests.length > 0) {
      pendingRequests.value = await processRequests(requests);
    } else {
      pendingRequests.value = [];
    }
    
    // Process blocked users
    if (blocked && blocked.length > 0) {
      blockedUsers.value = await processBlockedUsers(blocked);
    } else {
      blockedUsers.value = [];
    }
    
    // Set privacy setting
    if (privacySettings) {
      setPrivacySettingFromResponse(privacySettings);
    }
    
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching friend data:', err);
    error.value = 'Failed to load friend data. Please try again.';
    isLoading.value = false;
  }
};

// Refresh friend data
const refreshFriends = async () => {
  isRefreshing.value = true;
  await fetchFriendData();
  isRefreshing.value = false;
};

// Process friends list into usable format
const processFriends = async (rawFriends) => {
  if (!rawFriends || !rawFriends.length) return [];
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    const processedFriends = [];
    
    for (const friendId of rawFriends) {
      let principalId;
      
      // Convert to Principal if needed
      if (typeof friendId === 'string') {
        principalId = Principal.fromText(friendId);
      } else if (friendId instanceof Principal) {
        principalId = friendId;
      } else {
        continue; // Skip invalid friend ID
      }
      
      // Fetch friend profile
      const profile = await cosmicrafts.getProfile(principalId);
      if (profile && profile[0]) {
        const friend = {
          playerId: principalId.toString(),
          username: profile[0].username || 'Unknown',
          avatar: profile[0].avatar || 1,
          level: profile[0].level || 1,
          title: profile[0].title || 'Player',
        };
        processedFriends.push(friend);
      }
    }
    
    return processedFriends;
  } catch (error) {
    console.error('Error processing friends:', error);
    return [];
  }
};

// Process friend requests into usable format
const processRequests = async (requests) => {
  if (!requests || !requests.length) return [];
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    const processedRequests = [];
    
    for (const request of requests) {
      let fromPrincipal;
      
      // Convert to Principal if needed
      if (typeof request.from === 'string') {
        fromPrincipal = Principal.fromText(request.from);
      } else if (request.from instanceof Principal) {
        fromPrincipal = request.from;
      } else {
        continue; // Skip invalid request
      }
      
      // Fetch sender profile
      const profile = await cosmicrafts.getProfile(fromPrincipal);
      if (profile && profile[0]) {
        const processedRequest = {
          from: fromPrincipal.toString(),
          username: profile[0].username || 'Unknown',
          avatar: profile[0].avatar || 1,
          timestamp: request.timestamp || Date.now(),
          level: profile[0].level || 1
        };
        processedRequests.push(processedRequest);
      }
    }
    
    return processedRequests;
  } catch (error) {
    console.error('Error processing friend requests:', error);
    return [];
  }
};

// Process blocked users into usable format
const processBlockedUsers = async (blockedIds) => {
  if (!blockedIds || !blockedIds.length) return [];
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    const processedBlocked = [];
    
    for (const userId of blockedIds) {
      let principalId;
      
      // Convert to Principal if needed
      if (typeof userId === 'string') {
        principalId = Principal.fromText(userId);
      } else if (userId instanceof Principal) {
        principalId = userId;
      } else {
        continue; // Skip invalid user ID
      }
      
      // Fetch user profile
      const profile = await cosmicrafts.getProfile(principalId);
      if (profile && profile[0]) {
        const blockedUser = {
          playerId: principalId.toString(),
          username: profile[0].username || 'Unknown',
          avatar: profile[0].avatar || 1
        };
        processedBlocked.push(blockedUser);
      }
    }
    
    return processedBlocked;
  } catch (error) {
    console.error('Error processing blocked users:', error);
    return [];
  }
};

// Set privacy setting based on canister response
const setPrivacySettingFromResponse = (setting) => {
  if (setting && typeof setting === 'object') {
    if ('acceptAll' in setting) {
      privacySetting.value = 'acceptAll';
    } else if ('friendsOfFriends' in setting) {
      privacySetting.value = 'friendsOfFriends';
    } else if ('blockAll' in setting) {
      privacySetting.value = 'blockAll';
    }
  }
};

// Save privacy settings
const savePrivacySettings = async () => {
  isSavingSettings.value = true;
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    const setting = {
      [privacySetting.value]: null
    };
    
    const [success, message] = await cosmicrafts.setPrivacySetting(setting);
    
    if (success) {
      showSettings.value = false;
      notificationStore.showNotification({
        title: 'Settings Saved',
        message: 'Your privacy settings have been updated',
        type: 'success'
      });
    } else {
      throw new Error(message || 'Failed to save settings');
    }
  } catch (error) {
    console.error('Error saving privacy settings:', error);
    notificationStore.showNotification({
      title: 'Error',
      message: 'Failed to save settings: ' + error.message,
      type: 'error'
    });
  } finally {
    isSavingSettings.value = false;
  }
};

// Search for users
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    searchPerformed.value = false;
    return;
  }

  searchPerformed.value = true;
  isSearching.value = true;
  
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      console.error('Failed to get Cosmicrafts canister');
      notificationStore.showNotification({
        type: 'error',
        message: 'Cannot connect to backend'
      });
      searchResults.value = [];
      return;
    }
    
    let results;
    
    if (searchMode.value === 'username') {
      // Search by username
      results = await cosmicrafts.searchUserByUsername(searchQuery.value);
    } else {
      // Search by principal ID
      try {
        // Try to parse the principal ID
        const principalId = Principal.fromText(searchQuery.value.trim());
        // Get profile by principal
        const profile = await cosmicrafts.getProfile(principalId);
        
        // If profile found, convert it to the format used by searchResults
        if (profile && profile[0]) {
          results = [{
            id: principalId.toString(),
            username: profile[0].username || 'Unknown',
            avatar: profile[0].avatar || 1,
            level: profile[0].level || 1,
            title: profile[0].title || 'Player'
          }];
        } else {
          results = [];
        }
      } catch (err) {
        console.error('Invalid principal ID:', err);
        notificationStore.showNotification({
          title: 'Invalid Principal ID',
          message: 'Please enter a valid principal ID',
          type: 'error'
        });
        results = [];
      }
    }
    
    // Filter out current friends and process results
    const friendIds = friends.value.map(f => f.playerId);
    const processed = [];
    
    if (results && results.length) {
      for (const player of results) {
        const playerId = player.id.toString();
        // Skip if player is already a friend
        if (friendIds.includes(playerId)) continue;
        
        processed.push({
          id: playerId,
          username: player.username || 'Unknown',
          avatar: player.avatar || 1,
          level: player.level || 1,
          title: player.title || 'Player'
        });
      }
    }
    
    searchResults.value = processed;
  } catch (error) {
    console.error('Error searching users:', error);
    notificationStore.showNotification({
      type: 'error',
      message: 'Error searching users'
    });
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Send friend request
const sendFriendRequest = async (playerId) => {
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    const principalId = Principal.fromText(playerId);
    const [success, message] = await cosmicrafts.sendFriendRequest(principalId);
    
    if (success) {
      // Update search results to indicate request sent
      const index = searchResults.value.findIndex(p => p.id === playerId);
      if (index !== -1) {
        searchResults.value[index].requestSent = true;
      }
      
      notificationStore.showNotification({
        title: 'Request Sent',
        message: 'Friend request sent successfully',
        type: 'success'
      });
    } else {
      throw new Error(message || 'Failed to send friend request');
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    notificationStore.showNotification({
      title: 'Error',
      message: 'Failed to send friend request: ' + error.message,
      type: 'error'
    });
  }
};

// Accept a friend request
const acceptFriendRequest = async (fromId) => {
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    const principalId = Principal.fromText(fromId);
    const [success, message] = await cosmicrafts.acceptFriendRequest(principalId);
    
    if (success) {
      // Remove from pending requests
      pendingRequests.value = pendingRequests.value.filter(req => req.from !== fromId);
      
      // Refresh friends list
      await refreshFriends();
      
      notificationStore.showNotification({
        title: 'Friend Added',
        message: 'Friend request accepted',
        type: 'success'
      });
    } else {
      throw new Error(message || 'Failed to accept friend request');
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    notificationStore.showNotification({
      title: 'Error',
      message: 'Failed to accept friend request: ' + error.message,
      type: 'error'
    });
  }
};

// Decline a friend request
const declineFriendRequest = async (fromId) => {
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    const principalId = Principal.fromText(fromId);
    const [success, message] = await cosmicrafts.declineFriendRequest(principalId);
    
    if (success) {
      // Remove from pending requests
      pendingRequests.value = pendingRequests.value.filter(req => req.from !== fromId);
      
      notificationStore.showNotification({
        title: 'Request Declined',
        message: 'Friend request declined',
        type: 'info'
      });
    } else {
      throw new Error(message || 'Failed to decline friend request');
    }
  } catch (error) {
    console.error('Error declining friend request:', error);
    notificationStore.showNotification({
      title: 'Error',
      message: 'Failed to decline friend request: ' + error.message,
      type: 'error'
    });
  }
};

// Confirm before removing a friend
const confirmRemoveFriend = (friend) => {
  confirmData.value = {
    title: 'Remove Friend',
    message: `Are you sure you want to remove ${friend.username} from your friends list?`,
    confirmText: 'Remove',
    cancelText: 'Cancel',
    onConfirm: () => removeFriend(friend.playerId)
  };
  showConfirmation.value = true;
};

// Remove a friend
const removeFriend = async (playerId) => {
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    const principalId = Principal.fromText(playerId);
    
    // Try to use removeFriend method if it exists
    if (typeof cosmicrafts.removeFriend === 'function') {
      const [success, message] = await cosmicrafts.removeFriend(principalId);
      
      if (success) {
        // Remove from friends list
        friends.value = friends.value.filter(friend => friend.playerId !== playerId);
        
        notificationStore.showNotification({
          title: 'Friend Removed',
          message: 'Friend has been removed from your list',
          type: 'success'
        });
      } else {
        throw new Error(message || 'Failed to remove friend');
      }
    } else {
      // Fallback for when the method doesn't exist: block the user which effectively removes from friends
      const [success, message] = await cosmicrafts.blockUser(principalId);
      
      if (success) {
        // If blocked successfully, we need to unblock them after removal
        await cosmicrafts.unblockUser(principalId);
        
        // Remove from friends list locally
        friends.value = friends.value.filter(friend => friend.playerId !== playerId);
        
        notificationStore.showNotification({
          title: 'Friend Removed',
          message: 'Friend has been removed from your list',
          type: 'success'
        });
      } else {
        throw new Error(message || 'Failed to remove friend');
      }
    }
    
    closeConfirmation();
  } catch (error) {
    console.error('Error removing friend:', error);
    notificationStore.showNotification({
      title: 'Error',
      message: 'Failed to remove friend: ' + error.message,
      type: 'error'
    });
  }
};

// Unblock a user
const unblockUser = async (playerId) => {
  try {
    const cosmicrafts = await canisterStore.get('cosmicrafts');
    if (!cosmicrafts) {
      throw new Error('Failed to initialize canister');
    }
    
    const principalId = Principal.fromText(playerId);
    const [success, message] = await cosmicrafts.unblockUser(principalId);
    
    if (success) {
      // Remove from blocked users
      blockedUsers.value = blockedUsers.value.filter(user => user.playerId !== playerId);
      
      notificationStore.showNotification({
        title: 'User Unblocked',
        message: 'User has been unblocked',
        type: 'success'
      });
    } else {
      throw new Error(message || 'Failed to unblock user');
    }
  } catch (error) {
    console.error('Error unblocking user:', error);
    notificationStore.showNotification({
      title: 'Error',
      message: 'Failed to unblock user: ' + error.message,
      type: 'error'
    });
  }
};

// Navigate to user profile
const viewProfile = (playerId) => {
  router.push(`/profile/${playerId}`);
};

// Send a message to friend (placeholder)
const messageFriend = (playerId) => {
  notificationStore.showNotification({
    title: 'Coming Soon',
    message: 'Messaging feature is coming soon!',
    type: 'info'
  });
};

// Close confirmation modal
const closeConfirmation = () => {
  showConfirmation.value = false;
};

// Format principal ID for display
const formatPrincipal = (principal) => {
  if (principal.length <= 10) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-5)}`;
};

// Use a suggestion
const useSuggestion = (suggestion) => {
  searchQuery.value = suggestion.principal;
  searchUsers();
};

// Get avatar URL
const getAvatarUrl = (avatar) => {
  if (avatar === 'default_avatar') {
    return '/images/default-avatar.png';
  } else if (avatar === 'cosmic_admin') {
    return '/images/cosmicrafts-logo.png';
  }
  return avatar;
};

// Copy principal ID
const copyPrincipalId = () => {
  if (!principalInput.value) return;
  principalInput.value.select();
  document.execCommand('copy');
  copied.value = true;
  
  // Reset copied state after 2 seconds
  setTimeout(() => {
    copied.value = false;
  }, 2000);
  
  notificationStore.showNotification({
    type: 'success',
    message: 'Your principal ID was copied to clipboard'
  });
};

// Fetch initial data on mount
onMounted(() => {
  fetchFriendData();
});

// Expose the activeTab to parent components
defineExpose({
  activeTab
});
</script>

<style scoped>
.friends-section {
  width: 100%;
  flex-direction: column;
  display: flex;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.section-header h2 {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: rgba(15, 185, 253, 0.05);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

/* Tabs */
.friends-tabs {
  display: flex;
  overflow-x: auto;
  margin-bottom: 1rem;
  padding-bottom: 0.25rem;
  gap: 0.5rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.friends-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab-button {
  padding: 0.5rem 1rem;
  background: rgba(15, 185, 253, 0.03);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 50px;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button.active {
  background: rgba(15, 185, 253, 0.08);
  color: var(--cosmic-blue);
  border-color: rgba(15, 185, 253, 0.3);
  font-weight: 500;
}

.tab-button:hover:not(.active) {
  background: rgba(15, 185, 253, 0.05);
}

.tab-badge {
  background: var(--cosmic-blue);
  color: white;
  border-radius: 50px;
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  font-weight: bold;
}

/* Loading state */
.friends-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--cosmic-text-secondary);
}

/* Error state */
.friends-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--cosmic-text-secondary);
  gap: 1rem;
}

.friends-error i {
  font-size: 2rem;
  color: var(--cosmic-red);
}

/* Friends lists */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

/* Empty state */
.friends-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--cosmic-text-secondary);
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 300px;
}

.empty-state i {
  font-size: 2.5rem;
  opacity: 0.6;
  margin-bottom: 0.5rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  margin: 0;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Search container */
.search-container {
  display: flex;
  width: 100%;
  margin: 1rem 0;
  position: relative;
}

.search-container input {
  flex: 1;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  border-radius: 50px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  background: rgba(15, 185, 253, 0.03);
  color: var(--cosmic-text-primary);
  font-size: 0.9rem;
}

.search-container input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.4);
  background: rgba(15, 185, 253, 0.05);
}

.search-button {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: rgba(15, 185, 253, 0.2);
}

.search-results {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.no-results {
  margin-top: 1rem;
  font-style: italic;
}

/* Settings popup */
.settings-popup {
  position: absolute;
  top: 3rem;
  right: 1rem;
  width: 300px;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 12px;
  box-shadow: var(--cosmic-shadow-lg);
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.settings-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(15, 185, 253, 0.05);
  color: var(--cosmic-blue);
}

.settings-content {
  padding: 1rem;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-group h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-option input {
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .settings-popup {
    width: calc(100% - 2rem);
    left: 1rem;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .friends-list {
    max-height: 300px;
  }
}

/* Search tabs */
.search-tabs {
  display: flex;
  width: 100%;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.search-tab-btn {
  flex: 1;
  padding: 0.5rem;
  background: rgba(15, 185, 253, 0.03);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 8px;
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.search-tab-btn.active {
  background: rgba(15, 185, 253, 0.08);
  color: var(--cosmic-blue);
  border-color: rgba(15, 185, 253, 0.3);
}

.search-tab-btn:hover:not(.active) {
  background: rgba(15, 185, 253, 0.05);
}

.search-hint {
  font-size: 0.85rem;
  font-style: italic;
  opacity: 0.7;
  margin-top: 1rem;
}

/* Principal ID suggestions */
.principal-suggestions {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 12px;
  box-shadow: var(--cosmic-shadow-lg);
}

.principal-suggestions h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.suggestion-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.suggestion-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.suggestion-id {
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.7;
}

/* Search loading */
.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(15, 185, 253, 0.3);
  border-top-color: var(--cosmic-accent);
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Principal explainer */
.principal-explainer {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background-color: rgba(15, 185, 253, 0.1);
  border-left: 3px solid var(--cosmic-accent);
  border-radius: 4px;
  font-size: 0.85rem;
}

.principal-explainer i {
  margin-right: 0.5rem;
  color: var(--cosmic-accent);
}

/* Share my ID */
.share-my-id {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-shadow-md);
}

.share-my-id h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
}

.share-my-id p {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.id-copy-container {
  display: flex;
  gap: 0.5rem;
}

.id-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--cosmic-text-primary);
  font-family: monospace;
  font-size: 0.8rem;
}

.id-error {
  color: var(--cosmic-red);
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style> 