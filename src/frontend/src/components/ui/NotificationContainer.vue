<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="[notification.type]"
      >
        <div 
          class="notification-content"
          @click="clearNotification(notification.id)"
        >
          <div class="notification-icon">
            <i :class="getIconClass(notification.type)"></i>
          </div>
          <div class="notification-body">
            <div v-if="notification.title" class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button class="notification-close" @click.stop="clearNotification(notification.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div 
          v-if="notification.type === 'reward'"
          class="reward-particles"
        >
          <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotification } from '@/composables/useNotification';

const { notifications, clearNotification } = useNotification();

const getIconClass = (type) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'info':
      return 'fas fa-info-circle';
    case 'reward':
      return 'fas fa-gift';
    default:
      return 'fas fa-bell';
  }
};

const getParticleStyle = (i) => {
  const size = Math.floor(Math.random() * 8) + 4;
  const speed = Math.floor(Math.random() * 60) + 30;
  const delay = Math.random() * 0.5;
  const angle = Math.random() * 360;
  const distance = Math.random() * 60 + 40;
  const opacity = Math.random() * 0.5 + 0.5;
  
  const x = Math.cos(angle * Math.PI / 180) * distance;
  const y = Math.sin(angle * Math.PI / 180) * distance;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${speed / 10}s`,
    animationDelay: `${delay}s`,
    transform: `translate(${x}px, ${y}px)`,
    opacity: opacity.toString()
  };
};
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  position: relative;
  border-radius: 8px;
  padding: 12px;
  background: rgba(20, 25, 40, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  border-left: 4px solid;
  color: white;
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.notification-icon {
  margin-right: 12px;
  font-size: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 14px;
}

.notification-message {
  font-size: 13px;
  opacity: 0.9;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  padding: 0;
  width: 24px;
  height: 24px;
  font-size: 14px;
  flex-shrink: 0;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  color: white;
}

.notification.success {
  border-left-color: #0cc077;
}

.notification.success .notification-icon {
  color: #0cc077;
}

.notification.error {
  border-left-color: #ff4d4f;
}

.notification.error .notification-icon {
  color: #ff4d4f;
}

.notification.warning {
  border-left-color: #faad14;
}

.notification.warning .notification-icon {
  color: #faad14;
}

.notification.info {
  border-left-color: #1890ff;
}

.notification.info .notification-icon {
  color: #1890ff;
}

.notification.reward {
  border-left-color: #9d35bf;
  border: 1px solid rgba(157, 53, 191, 0.3);
  background: linear-gradient(45deg, rgba(15, 185, 253, 0.1), rgba(157, 53, 191, 0.1));
}

.notification.reward .notification-icon {
  color: #9d35bf;
}

/* Animation for notifications */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Reward particles */
.reward-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  background: linear-gradient(45deg, #0fb9fd, #9d35bf);
  animation: particle-fade-out 2s forwards;
}

@keyframes particle-fade-out {
  0% {
    opacity: 1;
    transform: translate(0, 0);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x, 0), var(--y, 0));
  }
}
</style> 