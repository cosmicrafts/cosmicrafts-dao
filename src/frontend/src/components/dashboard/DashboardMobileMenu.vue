<!-- DashboardMobileMenu.vue -->
<template>
  <Teleport to="body">
    <transition name="cosmic-fullscreen">
      <div v-if="isOpen" class="cosmic-mobile-menu">
        <!-- Menu Header -->
        <div class="cosmic-mobile-menu-header">
          <div class="user-greeting">
            <img :src="avatarUrl" alt="User Avatar" class="menu-avatar" />
            <div class="greeting-text">
              <h2>{{ player?.username || 'Cosmic Explorer' }}</h2>
              <p>Level {{ player?.level || 1 }} {{ player?.title || 'Recruit' }}</p>
            </div>
          </div>
          
          <button @click="close" class="cosmic-close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Menu Content -->
        <div class="cosmic-mobile-menu-content">
          <!-- Main Navigation Options -->
          <div class="cosmic-menu-section">
            <h3 class="cosmic-menu-section-title">Main Navigation</h3>
            <div class="cosmic-menu-grid">
              <button 
                v-for="tab in mainTabs" 
                :key="tab.id"
                @click="selectTabAndClose(tab.id)"
                class="cosmic-menu-item" 
                :class="{ active: activeTab === tab.id }"
              >
                <div class="cosmic-menu-item-icon">
                  <i :class="tab.icon"></i>
                </div>
                <span class="cosmic-menu-item-label">{{ tab.label }}</span>
                <div class="cosmic-menu-item-glow"></div>
                <div class="cosmic-menu-item-particles"></div>
              </button>
            </div>
          </div>
          
          <!-- Additional Options -->
          <div class="cosmic-menu-section">
            <h3 class="cosmic-menu-section-title">Additional Options</h3>
            <div class="cosmic-menu-grid">
              <button 
                v-for="tab in additionalTabs" 
                :key="tab.id"
                @click="selectTabAndClose(tab.id)"
                class="cosmic-menu-item" 
                :class="{ active: activeTab === tab.id }"
              >
                <div class="cosmic-menu-item-icon">
                  <i :class="tab.icon"></i>
                </div>
                <span class="cosmic-menu-item-label">{{ tab.label }}</span>
                <div class="cosmic-menu-item-glow"></div>
                <div class="cosmic-menu-item-particles"></div>
              </button>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="cosmic-menu-section">
            <h3 class="cosmic-menu-section-title">Quick Actions</h3>
            <div class="cosmic-menu-actions">
              <button class="cosmic-action-button cosmic-button-outline-primary" @click="logOut">
                <i class="fas fa-sign-out-alt"></i>
                <span>Log Out</span>
              </button>
              <button class="cosmic-action-button cosmic-button-outline-secondary" @click="openSettings">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Floating elements for cosmic effect -->
        <div class="cosmic-floating-elements">
          <div class="cosmic-float-element" style="--delay: 0s; --top: 15%; --left: 10%;"></div>
          <div class="cosmic-float-element" style="--delay: 2s; --top: 60%; --left: 85%;"></div>
          <div class="cosmic-float-element" style="--delay: 4s; --top: 80%; --left: 25%;"></div>
          <div class="cosmic-float-element" style="--delay: 1s; --top: 25%; --left: 90%;"></div>
          <div class="cosmic-float-element" style="--delay: 3s; --top: 85%; --left: 75%;"></div>
          <div class="cosmic-float-element" style="--delay: 5s; --top: 35%; --left: 15%;"></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AvatarService from '@/utils/AvatarService';

// Router for navigation
const router = useRouter();
const authStore = useAuthStore();

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activeTab: {
    type: String,
    required: true
  },
  player: {
    type: Object,
    default: () => null
  },
  avatarUrl: {
    type: String,
    required: true
  },
  mainTabs: {
    type: Array,
    required: true
  },
  additionalTabs: {
    type: Array,
    required: true
  }
});

// Emits
const emit = defineEmits(['select-tab', 'update:isOpen']);

// Body scroll lock/unlock
watchEffect(() => {
  if (props.isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// Methods
const close = () => {
  emit('update:isOpen', false);
};

const selectTabAndClose = (tabId) => {
  emit('select-tab', tabId);
  close();
};

// Action handlers
const logOut = async () => {
  close();
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

const openSettings = () => {
  close();
  router.push('/settings');
};
</script>

<style scoped>
/* Cosmic Mobile Menu - Full Screen */
.cosmic-fullscreen-enter-active,
.cosmic-fullscreen-leave-active {
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.cosmic-fullscreen-enter-from,
.cosmic-fullscreen-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.cosmic-mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(10, 20, 32, 0.97), rgba(15, 25, 45, 0.98));
  backdrop-filter: blur(10px);
  z-index: 9999;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.cosmic-mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.15);
  margin-bottom: 1.5rem;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--cosmic-blue);
  object-fit: cover;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.greeting-text h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.2rem;
}

.greeting-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.cosmic-close-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--cosmic-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  box-shadow: var(--cosmic-shadow-sm);
}

.cosmic-close-button:hover {
  transform: rotate(90deg) scale(1.1);
  background: rgba(15, 185, 253, 0.2);
  border-color: var(--cosmic-blue);
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.cosmic-mobile-menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 1.5rem 2rem;
  position: relative;
  z-index: 2;
}

.cosmic-menu-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cosmic-menu-section-title {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--cosmic-text-secondary);
  margin: 0;
  font-weight: 600;
  position: relative;
  padding-left: 1rem;
}

.cosmic-menu-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1rem;
  background: var(--cosmic-blue);
  border-radius: 2px;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.cosmic-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.cosmic-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 0.75rem;
  background: rgba(15, 185, 253, 0.03);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--cosmic-radius-md);
  position: relative;
  overflow: hidden;
  transition: all var(--cosmic-transition-medium);
  cursor: pointer;
  box-shadow: var(--cosmic-shadow-sm);
}

.cosmic-menu-item-icon {
  font-size: 2rem;
  color: var(--cosmic-blue);
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 2;
  transition: all var(--cosmic-transition-medium);
}

.cosmic-menu-item-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  position: relative;
  z-index: 2;
  transition: all var(--cosmic-transition-medium);
}

.cosmic-menu-item-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(15, 185, 253, 0.3) 0%, transparent 70%);
  opacity: 0;
  z-index: 1;
  transition: opacity var(--cosmic-transition-medium);
}

.cosmic-menu-item-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.cosmic-menu-item-particles::before,
.cosmic-menu-item-particles::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(1px);
}

.cosmic-menu-item:hover {
  transform: translateY(-5px) scale(1.02);
  background: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.cosmic-menu-item:hover .cosmic-menu-item-icon {
  transform: scale(1.1) translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
}

.cosmic-menu-item:hover .cosmic-menu-item-label {
  color: var(--cosmic-blue);
}

.cosmic-menu-item:hover .cosmic-menu-item-glow {
  opacity: 1;
  animation: pulse 2s infinite alternate;
}

.cosmic-menu-item.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-md);
}

.cosmic-menu-item.active .cosmic-menu-item-icon {
  color: var(--cosmic-blue-light);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.7));
}

.cosmic-menu-item.active .cosmic-menu-item-label {
  color: var(--cosmic-blue-light);
}

.cosmic-menu-item.active .cosmic-menu-item-glow {
  opacity: 1;
  animation: pulse 1.5s infinite alternate;
}

.cosmic-menu-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.cosmic-action-button {
  flex: 1;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: var(--cosmic-shadow-sm);
}

.cosmic-action-button i {
  font-size: 1.1rem;
}

/* Floating Elements */
.cosmic-floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.cosmic-float-element {
  position: absolute;
  top: var(--top, 50%);
  left: var(--left, 50%);
  width: 8px;
  height: 8px;
  background: var(--cosmic-blue);
  border-radius: 50%;
  filter: blur(3px);
  opacity: 0.6;
  animation: cosmic-float 8s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  box-shadow: 0 0 15px 5px rgba(15, 185, 253, 0.3);
}

@keyframes cosmic-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translate(15px, -15px) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: translate(0, -30px) scale(1);
    opacity: 0.4;
  }
  75% {
    transform: translate(-15px, -15px) scale(1.2);
    opacity: 0.7;
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .cosmic-menu-grid {
    grid-template-columns: 1fr;
  }

  .cosmic-menu-item {
    padding: 1rem 0.75rem;
  }

  .cosmic-menu-item-icon {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .cosmic-menu-item-label {
    font-size: 0.9rem;
  }

  .cosmic-menu-actions {
    flex-direction: column;
  }

  .cosmic-mobile-menu-header {
    padding: 1rem;
  }

  .menu-avatar {
    width: 40px;
    height: 40px;
  }

  .greeting-text h2 {
    font-size: 1.1rem;
  }

  .greeting-text p {
    font-size: 0.8rem;
  }
}
</style> 