<template>
  <div class="player-result">
    <div class="player-avatar" @click="viewProfile">
      <img :src="getAvatarUrl(player.avatar)" :alt="player.username">
    </div>
    
    <div class="player-info" @click="viewProfile">
      <div class="player-name">{{ player.username }}</div>
      <div class="player-details">
        <span class="player-level">Level {{ player.level }}</span>
        <span class="player-title">{{ player.title }}</span>
      </div>
    </div>
    
    <div class="player-actions">
      <button 
        class="action-btn"
        :class="{ 'sent': player.requestSent }"
        @click="addFriend"
        :disabled="player.requestSent"
      >
        <i :class="player.requestSent ? 'fas fa-check' : 'fas fa-user-plus'"></i>
        <span>{{ player.requestSent ? 'Sent' : 'Add' }}</span>
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
  player: {
    type: Object,
    required: true
  }
});

// Define emits
const emit = defineEmits(['add-friend']);

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
  router.push(`/profile/${props.player.id}`);
};

// Add friend
const addFriend = () => {
  if (!props.player.requestSent) {
    emit('add-friend', props.player.id);
  }
};
</script>

<style scoped>
.player-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(15, 185, 253, 0.03);
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all 0.2s ease;
}

.player-result:hover {
  background: rgba(15, 185, 253, 0.06);
  border-color: rgba(15, 185, 253, 0.2);
  transform: translateY(-2px);
}

.player-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.player-avatar:hover {
  border-color: var(--cosmic-blue);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.player-name {
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-tertiary);
  font-size: 0.8rem;
}

.player-level {
  background: rgba(15, 185, 253, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: var(--cosmic-blue);
}

.player-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-actions {
  display: flex;
}

.action-btn {
  background: var(--cosmic-blue);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: #0a8bd0;
  transform: translateY(-1px);
}

.action-btn.sent {
  background: #0dce63;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .player-avatar {
    width: 40px;
    height: 40px;
  }
  
  .player-title {
    display: none;
  }
  
  .action-btn {
    padding: 0.4rem;
  }
  
  .action-btn span {
    display: none;
  }
}
</style> 