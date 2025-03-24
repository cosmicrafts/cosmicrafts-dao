<!-- File: components/navigation/menus/EscMenu.vue -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  otherWindowsOpen: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['close', 'update:isOpen']);

// Composables
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

// State
const activeTab = ref('game');

// Computed
const isLoggedIn = computed(() => authStore.isAuthenticated());

// Watch for outside changes to props
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.otherWindowsOpen) {
    // If trying to open while other windows are open, prevent it
    closeMenu();
  }
});

// Methods
const closeMenu = () => {
  emit('update:isOpen', false);
  emit('close');
};

const setTab = (tab) => {
  activeTab.value = tab;
};

const navigateTo = (path) => {
  router.push(path);
  closeMenu();
};

const logout = async () => {
  try {
    await authStore.logout();
    closeMenu();
    navigateTo('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const returnToMainMenu = () => {
  navigateTo('/');
};

// Menu items by tab
const gameTabs = [
  { id: 'game', label: t('esc_menu.game') },
  { id: 'social', label: t('esc_menu.social') },
  { id: 'settings', label: t('esc_menu.settings') },
];

const gameMenuItems = [
  {
    id: 'continue',
    label: t('esc_menu.continue_game'),
    icon: 'fa-solid fa-play',
    action: closeMenu
  },
  {
    id: 'main-menu',
    label: t('esc_menu.main_menu'),
    icon: 'fa-solid fa-house',
    action: returnToMainMenu
  }
];

const socialMenuItems = [
  {
    id: 'friends',
    label: t('esc_menu.friends'),
    icon: 'fa-solid fa-user-group',
    action: () => navigateTo('/friends')
  },
  {
    id: 'messages',
    label: t('esc_menu.messages'),
    icon: 'fa-solid fa-message',
    action: () => navigateTo('/messages')
  }
];

const settingsMenuItems = [
  {
    id: 'audio',
    label: t('esc_menu.audio'),
    icon: 'fa-solid fa-volume-high',
    action: () => console.log('Audio settings')
  },
  {
    id: 'video',
    label: t('esc_menu.video'),
    icon: 'fa-solid fa-display',
    action: () => console.log('Video settings')
  },
  {
    id: 'interface',
    label: t('esc_menu.interface'),
    icon: 'fa-solid fa-sliders',
    action: () => console.log('Interface settings')
  }
];

// Computed function to get current menu items based on active tab
const currentMenuItems = computed(() => {
  switch (activeTab.value) {
    case 'game': return gameMenuItems;
    case 'social': return socialMenuItems;
    case 'settings': return settingsMenuItems;
    default: return gameMenuItems;
  }
});
</script>

<template>
  <div v-if="isOpen" class="esc-menu-overlay" @click.self="closeMenu">
    <div class="esc-menu cosmic-panel">
      <!-- Menu Header -->
      <div class="menu-header">
        <h2>{{ t('esc_menu.title') }}</h2>
        <button class="close-button" @click="closeMenu">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <!-- Tab Navigation -->
      <div class="menu-tabs">
        <button 
          v-for="tab in gameTabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="setTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <!-- Menu Items -->
      <div class="menu-content">
        <ul class="menu-items">
          <li 
            v-for="item in currentMenuItems" 
            :key="item.id"
            @click="item.action"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>
      
      <!-- Bottom Actions -->
      <div class="menu-footer">
        <button 
          v-if="isLoggedIn" 
          class="logout-button"
          @click="logout"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          {{ t('esc_menu.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.esc-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--cosmic-z-modal, 1000);
}

.esc-menu {
  width: 350px;
  max-width: 90%;
  border-radius: 8px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  overflow: hidden;
  animation: menuEntrance 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes menuEntrance {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.menu-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.menu-tabs button {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  border-bottom: 2px solid transparent;
}

.menu-tabs button.active {
  border-bottom-color: var(--color-primary, #7c3aed);
  background: rgba(255, 255, 255, 0.05);
}

.menu-tabs button:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-content {
  padding: 20px 0;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-items li {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-items li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-items li i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.menu-footer {
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}

.logout-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FF3B30;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: rgba(255, 59, 48, 0.1);
}

.logout-button i {
  margin-right: 8px;
}
</style> 