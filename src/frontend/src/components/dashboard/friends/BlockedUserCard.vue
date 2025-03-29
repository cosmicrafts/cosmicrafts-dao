<template>
  <div class="blocked-card">
    <div class="blocked-avatar" @click="viewProfile">
      <img :src="getAvatarUrl(user.avatar)" :alt="user.username">
      <div class="blocked-badge">
        <i class="fas fa-ban"></i>
      </div>
    </div>
    
    <div class="blocked-info" @click="viewProfile">
      <div class="blocked-name">{{ user.username }}</div>
      <div class="blocked-status">Blocked</div>
    </div>
    
    <div class="blocked-actions">
      <button class="action-btn unblock" @click="$emit('unblock', user.playerId)" title="Unblock">
        <i class="fas fa-user-check"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
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
  user: {
    type: Object,
    required: true
  }
});

// Define emits
defineEmits(['unblock']);

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

// Navigate to user profile
const viewProfile = () => {
  router.push(`/profile/${props.user.playerId}`);
};
</script>

<style scoped>
.blocked-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(255, 82, 82, 0.03);
  border: 1px solid rgba(255, 82, 82, 0.1);
  transition: all 0.2s ease;
}

.blocked-card:hover {
  background: rgba(255, 82, 82, 0.06);
  border-color: rgba(255, 82, 82, 0.2);
}

.blocked-avatar {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  filter: grayscale(50%);
  opacity: 0.8;
  transition: all 0.2s ease;
}

.blocked-avatar:hover {
  filter: grayscale(30%);
  opacity: 0.9;
}

.blocked-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blocked-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff5252;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--cosmic-bg-darker);
}

.blocked-badge i {
  font-size: 10px;
  color: white;
}

.blocked-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.blocked-name {
  font-weight: 600;
  color: var(--cosmic-text-secondary);
  margin-bottom: 0.25rem;
  text-decoration: line-through;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.blocked-status {
  font-size: 0.8rem;
  color: #ff5252;
}

.blocked-actions {
  display: flex;
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

.action-btn.unblock {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.action-btn.unblock:hover {
  background: rgba(15, 185, 253, 0.2);
  transform: scale(1.05);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .blocked-avatar {
    width: 40px;
    height: 40px;
  }
}
</style> 