<template>
  <div class="request-card">
    <div class="request-avatar" @click="viewProfile">
      <img :src="getAvatarUrl(request.avatar)" :alt="request.username">
    </div>
    
    <div class="request-info" @click="viewProfile">
      <div class="request-name">{{ request.username }}</div>
      <div class="request-details">
        <span class="request-level">Level {{ request.level }}</span>
        <span class="request-time">{{ formatTimestamp(request.timestamp) }}</span>
      </div>
    </div>
    
    <div class="request-actions">
      <button class="action-btn accept" @click="$emit('accept', request.from)" title="Accept">
        <i class="fas fa-check"></i>
      </button>
      <button class="action-btn decline" @click="$emit('decline', request.from)" title="Decline">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import avatar1 from '@/assets/avatars/Avatar_01.webp';
import avatar2 from '@/assets/avatars/Avatar_02.webp';
import avatar3 from '@/assets/avatars/Avatar_03.webp';
import avatar4 from '@/assets/avatars/Avatar_04.webp';
import avatar5 from '@/assets/avatars/Avatar_05.webp';
import avatar6 from '@/assets/avatars/Avatar_06.webp';
import avatar7 from '@/assets/avatars/Avatar_07.webp';
import avatar8 from '@/assets/avatars/Avatar_08.webp';
import avatar9 from '@/assets/avatars/Avatar_09.webp';
import avatar10 from '@/assets/avatars/Avatar_10.webp';
import avatar11 from '@/assets/avatars/Avatar_11.webp';
import avatar12 from '@/assets/avatars/Avatar_12.webp';

// Router
const router = useRouter();

// Define props
const props = defineProps({
  request: {
    type: Object,
    required: true
  }
});

// Define emits
defineEmits(['accept', 'decline']);

// Avatar array
const avatarSrcArray = [
  avatar1, avatar2, avatar3, avatar4,
  avatar5, avatar6, avatar7, avatar8,
  avatar9, avatar10, avatar11, avatar12
];

// Get avatar URL based on avatar ID
const getAvatarUrl = (avatarId) => {
  const index = (Number(avatarId) - 1) % avatarSrcArray.length;
  return avatarSrcArray[index] || avatar1;
};

// Format timestamp to relative time
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const now = Date.now();
  const date = new Date(Number(timestamp));
  const diffMs = now - date;
  
  // Convert to seconds, minutes, hours, and days
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHrs < 24) {
    return `${diffHrs}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Navigate to user profile
const viewProfile = () => {
  router.push(`/profile/${props.request.from}`);
};
</script>

<style scoped>
.request-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.2s ease;
}

.request-card:hover {
  background: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.25);
  transform: translateY(-2px);
}

.request-avatar {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.request-avatar:hover {
  border-color: var(--cosmic-blue);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.request-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.request-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.request-name {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-tertiary);
  font-size: 0.8rem;
}

.request-level {
  background: rgba(15, 185, 253, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: var(--cosmic-blue);
}

.request-time {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-actions {
  display: flex;
  gap: 0.4rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.accept {
  background: rgba(13, 206, 99, 0.1);
  color: #0dce63;
}

.action-btn.accept:hover {
  background: rgba(13, 206, 99, 0.2);
  transform: scale(1.05);
}

.action-btn.decline {
  background: rgba(255, 82, 82, 0.1);
  color: #ff5252;
}

.action-btn.decline:hover {
  background: rgba(255, 82, 82, 0.2);
  transform: scale(1.05);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .request-avatar {
    width: 40px;
    height: 40px;
  }
}
</style> 