<template>
      <div class="avatar-container">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Player Avatar"
          class="player-avatar"
          @click="toggleDropdown"
        />
        <span v-else class="player-placeholder" @click="toggleDropdown">
          {{ fallbackInitials }}
        </span>
        <div v-if="isDropdownVisible" class="dropdown-menu">
          <ul>
            <li @click="goToProfile">{{ t('header.myProfile') }}</li>
            <li @click="goToSettings">{{ t('header.settings') }}</li>
            <li @click="logout">{{ t('header.signout') }}</li>
          </ul>
        </div>
      </div>
    </template>
    
    <script setup>
    import { ref, computed, watch } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import avatarMap from '@/utils/avatarMap';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    
    const authStore = useAuthStore();
    const router = useRouter();
    const { t } = useI18n();
    
    const avatarUrl = ref(null);
    const isDropdownVisible = ref(false);
    
    // Extract player info
    const player = computed(() => authStore.player || {});
    const fallbackInitials = computed(() =>
      player.value.username ? player.value.username.charAt(0).toUpperCase() : '?'
    );
    
    // Watch for avatar changes
    watch(
      () => player.value.avatar,
      async (avatarId) => {
        if (avatarId !== undefined && avatarId !== null) {
          try {
            const paddedId = avatarId.toString().padStart(2, '0');
            const avatarModule = await avatarMap[paddedId]();
            avatarUrl.value = avatarModule.default;
          } catch (error) {
            console.error('Failed to load avatar:', error);
            avatarUrl.value = null;
          }
        } else {
          avatarUrl.value = null;
        }
      },
      { immediate: true }
    );
    
    // Toggle dropdown visibility
    const toggleDropdown = () => {
      isDropdownVisible.value = !isDropdownVisible.value;
    };
    
    // Navigation
    const goToProfile = () => router.push('/profile');
    const goToSettings = () => router.push('/settings');
    
    // Logout
    const logout = async () => {
      await authStore.logout();
      router.push('/');
    };
    </script>
    
    <style scoped>
    .avatar-container {
      position: relative;
      display: inline-block;
    }
    
    .player-avatar {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      border: 1px solid #00c3ff;
    }
    
    .player-placeholder {
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      background: #333;
      padding: 8px;
      border-radius: 4px;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: #1e2b38;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
      padding: 0.5rem 0;
      z-index: 10;
      min-width: 160px;
    }
    
    .dropdown-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .dropdown-menu li {
      padding: 0.5rem 1rem;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .dropdown-menu li:hover {
      background-color: #243546;
    }
    </style>
    