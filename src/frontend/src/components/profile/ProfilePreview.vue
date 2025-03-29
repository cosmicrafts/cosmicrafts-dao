<template>
  <div class="profile-preview" :class="{ 'embedded': embedded }">
    <div v-if="loading" class="profile-loading">
      <div class="cosmic-loader small"></div>
      <p>Loading profile...</p>
    </div>
    
    <div v-else-if="error" class="profile-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="loadProfile" class="cosmic-button cosmic-button-primary sm">Retry</button>
    </div>
    
    <div v-else class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="getAvatarUrl(profile.avatar)" :alt="profile.username">
        </div>
        
        <div class="profile-info">
          <h3 class="profile-name">{{ profile.username }}</h3>
          <div class="profile-title">{{ profile.title }}</div>
          <div class="profile-level">Level {{ profile.level }}</div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ profile.friends?.length || 0 }}</span>
              <span class="stat-label">Friends</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ nftCount }}</span>
              <span class="stat-label">NFTs</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Profile Actions -->
      <div class="profile-actions">
        <button class="cosmic-button cosmic-button-primary sm" @click="handleAddFriend">
          <i class="fas" :class="isFriend ? 'fa-check' : 'fa-user-plus'"></i>
          {{ isFriend ? 'Friends' : 'Add Friend' }}
        </button>
        
        <button class="cosmic-button cosmic-button-secondary sm" @click="handleMessage">
          <i class="fas fa-comment"></i>
          Message
        </button>
        
        <button class="cosmic-button cosmic-button-outline sm" @click="viewFullProfile">
          <i class="fas fa-external-link-alt"></i>
          Full Profile
        </button>
      </div>
      
      <!-- Profile Description -->
      <div class="profile-description" v-if="profile.description">
        <h4>About</h4>
        <p>{{ profile.description }}</p>
      </div>
      
      <!-- Recent Activity -->
      <div class="profile-activity" v-if="recentActivity.length > 0">
        <h4>Recent Activity</h4>
        <div class="activity-list">
          <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <i :class="getActivityIcon(activity.type)"></i>
            </div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useNftsStore } from '@/stores/nfts';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { Principal } from '@dfinity/principal';
import AvatarService from '@/utils/AvatarService';

// Props
const props = defineProps({
  profileId: {
    type: String,
    required: true
  },
  embedded: {
    type: Boolean,
    default: false
  }
});

// Stores
const profileStore = useProfileStore();
const nftsStore = useNftsStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const profile = ref(null);
const recentActivity = ref([]);

// Computed
const nftCount = computed(() => {
  // This is a placeholder - ideally would fetch actual NFT count
  return profile.value?.level * 2 || 0;
});

const isFriend = computed(() => {
  if (!authStore.player || !profile.value) return false;
  return authStore.player.friends?.some(friend => 
    friend.playerId === props.profileId
  ) || false;
});

// Methods
const loadProfile = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    let principalObj;
    try {
      principalObj = Principal.fromText(props.profileId);
    } catch (e) {
      throw new Error('Invalid Principal ID');
    }
    
    const playerData = await profileStore.getProfileByPrincipal(principalObj);
    
    if (playerData) {
      profile.value = playerData;
      // Fetch mock activity data
      loadMockActivities();
    } else {
      throw new Error('Profile not found');
    }
  } catch (err) {
    console.error('Error loading profile:', err);
    error.value = err.message || 'Failed to load profile';
  } finally {
    loading.value = false;
  }
};

const loadMockActivities = () => {
  recentActivity.value = [
    {
      type: 'game',
      text: 'Won a battle in Cosmic Clash',
      timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
    },
    {
      type: 'mint',
      text: 'Minted a new Cosmic Guardian NFT',
      timestamp: Date.now() - 1000 * 60 * 60 * 5 // 5 hours ago
    },
    {
      type: 'reward',
      text: 'Earned the "Star Voyager" achievement',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    }
  ];
};

const handleAddFriend = () => {
  if (isFriend.value) {
    notificationStore.showNotification({
      title: 'Already Friends',
      message: `You are already friends with ${profile.value.username}`,
      type: 'info'
    });
    return;
  }
  
  // This would call the actual friend request API in a real implementation
  notificationStore.showNotification({
    title: 'Friend Request Sent',
    message: `Friend request sent to ${profile.value.username}`,
    type: 'success'
  });
};

const handleMessage = () => {
  notificationStore.showNotification({
    title: 'Coming Soon',
    message: 'Messaging feature is coming soon!',
    type: 'info'
  });
};

const viewFullProfile = () => {
  router.push(`/${props.profileId}`);
};

const getAvatarUrl = (avatarId) => {
  return AvatarService.getAvatarById(avatarId);
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'game': return 'fas fa-gamepad';
    case 'mint': return 'fas fa-cube';
    case 'reward': return 'fas fa-trophy';
    case 'transfer': return 'fas fa-exchange-alt';
    default: return 'fas fa-star';
  }
};

const formatTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

// Load profile on mount and when profileId changes
watchEffect(() => {
  if (props.profileId) {
    loadProfile();
  }
});
</script>

<style scoped>
.profile-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.profile-loading, .profile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  text-align: center;
}

.profile-error i {
  font-size: 2rem;
  color: var(--cosmic-red);
}

.profile-header {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
  flex-shrink: 0;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary);
}

.profile-title {
  font-size: 1rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.5rem;
}

.profile-level {
  display: inline-block;
  background: rgba(15, 185, 253, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--cosmic-blue);
  margin-bottom: 0.75rem;
}

.profile-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--cosmic-blue);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.profile-description {
  background: rgba(15, 185, 253, 0.03);
  padding: 1rem;
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.profile-description h4 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: var(--cosmic-text-primary);
}

.profile-description p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.5;
}

.profile-activity h4 {
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
  color: var(--cosmic-text-primary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.03);
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: rgba(15, 185, 253, 0.06);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  flex-shrink: 0;
}

.activity-icon.game {
  background: rgba(157, 53, 191, 0.1);
  color: var(--cosmic-purple);
}

.activity-icon.mint {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
}

.activity-icon.reward {
  background: rgba(255, 145, 0, 0.1);
  color: var(--cosmic-orange);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

/* Embedded version styling */
.embedded .profile-avatar {
  width: 80px;
  height: 80px;
}

.embedded .profile-name {
  font-size: 1.3rem;
}

.section-header.with-back {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .profile-actions {
    justify-content: center;
  }
  
  .embedded .profile-header {
    flex-direction: row;
    text-align: left;
  }
}
</style> 