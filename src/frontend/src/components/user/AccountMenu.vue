<!-- File: components/user/AccountMenu.vue -->
<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { useI18n } from 'vue-i18n';

// Composable setup
const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const { t } = useI18n();

// User data from store
const username = profileStore.getUsername();
const level = profileStore.getLevel();

// Menu items
const menuItems = [
  {
    id: 'profile',
    label: t('header.profile'),
    icon: 'fa-solid fa-user',
    action: () => router.push('/profile')
  },
  {
    id: 'dashboard',
    label: t('header.dashboard'),
    icon: 'fa-solid fa-gauge-high',
    action: () => router.push('/dashboard')
  },
  {
    id: 'wallet',
    label: t('header.wallet'),
    icon: 'fa-solid fa-wallet',
    action: () => router.push('/wallet')
  },
  {
    id: 'settings',
    label: t('header.settings'),
    icon: 'fa-solid fa-gear',
    action: () => router.push('/settings')
  },
  {
    id: 'logout',
    label: t('header.logout'),
    icon: 'fa-solid fa-right-from-bracket',
    action: logout,
    highlight: true
  }
];

// Logout function
async function logout() {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
</script>

<template>
  <div class="account-menu cosmic-panel">
    <!-- User Info Header -->
    <div class="user-info">
      <div class="username">{{ username }}</div>
      <div class="user-level">
        <span class="level-label">Lvl</span>
        <span class="level-value">{{ level }}</span>
      </div>
    </div>
    
    <!-- Menu Items -->
    <ul class="menu-items">
      <li 
        v-for="item in menuItems" 
        :key="item.id"
        @click="item.action"
        :class="{ 'highlight': item.highlight }"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.account-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 220px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-background-secondary, #1a1a2e);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.user-info {
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.username {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.user-level {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.level-label {
  margin-right: 5px;
  opacity: 0.7;
}

.level-value {
  font-weight: bold;
  color: var(--color-accent, #FF9500);
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-items li {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-items li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu-items li.highlight {
  color: var(--color-error, #FF3B30);
}

.menu-items li i {
  width: 20px;
  margin-right: 10px;
  text-align: center;
}
</style> 