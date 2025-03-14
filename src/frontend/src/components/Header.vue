<template>
  <header>
    <!-- Burger Menu Icon (Visible on Mobile) -->
    <div class="burger" @click="toggleMenu">
      <span :class="{ open: isMenuOpen }"></span>
      <span :class="{ open: isMenuOpen }"></span>
      <span :class="{ open: isMenuOpen }"></span>
    </div>

    <!-- Logo -->
    <div class="logo-wrapper " @click="scrollToTop">
      <div class="logo">
        <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts Logo" />
      </div>
      <div class="additional-logo">
        <img :src="additionalLogoSrc" alt="Additional Logo" />
      </div>
    </div>

    <!-- Navigation Links (Desktop Only) -->
    <nav class="nav-links">
      <ul>
        <li><router-link to="/game" class="cosmic-hover">{{ t('header.games') }}</router-link></li>
        <li><router-link to="/dao" class="cosmic-hover">{{ t('header.dao') }}</router-link></li>
        <li><router-link to="/whitepaper" class="cosmic-hover">{{ t('header.whitepaper') }}</router-link></li>
        <li><router-link to="/roadmap" class="cosmic-hover">{{ t('header.roadmap') }}</router-link></li>
      </ul>
    </nav>


    <!-- Flex Container for Connect Button and Language Selector -->
    <div class="connect-container">
      <!-- Multi-Language Selector -->
      <div class="desktop-language-selector header">
        <LanguageSelector context="header" />
      </div>

      <!-- Notifications Icon (Only show when logged in) -->
      <NotificationIcon v-if="authStore.player" />

      <!-- Avatar and Dropdown Menu -->
      <div v-if="authStore.player" class="avatar-container" ref="avatarContainerRef">  <img
          v-if="computedPlayerAvatar"
          :src="computedPlayerAvatar"
          :key="computedPlayerAvatar"
          alt="Avatar"
          class="player-avatar"
          @click="toggleDropdown"
        />
        <span v-else class="player-placeholder" @click="toggleDropdown"></span>

        <div v-if="isDropdownVisible" class="dropdown-menu" ref="dropdownMenuRef">
          <ul>
            <li @click="goToDashboard">{{ t('header.dashboard') }}</li>
            <li @click="logout">{{ t('header.signout') }}</li>
          </ul>
        </div>
      </div>

      <button v-else class="cosmic-button cosmic-button-outline" @click="handleLogin">
        {{ t('header.connect') }}
      </button>
    </div>
  </header>

  <MobileMenu :isOpen="isMenuOpen" @closeMenu="toggleMenu" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import MobileMenu from '@/components/MobileMenu.vue';
import LanguageSelector from '@/components/LanguageSelector.vue'
import { useModalStore } from '@/stores/modal';
import Login from '@/components/Login.vue';
import NotificationIcon from '@/components/NotificationIcon.vue';
import defaultLogo from '@/assets/icons/logo.svg';
import logoCN from '@/assets/icons/logo-cn.svg';
import logoKR from '@/assets/icons/logo-kr.svg';
import logoJP from '@/assets/icons/logo-jp.svg';
import logoRU from '@/assets/icons/logo-ru.svg';
import logoAR from '@/assets/icons/logo-ar.svg';
import avatarMap from '@/utils/avatarMap';

const { t, locale } = useI18n();
const isMenuOpen = ref(false);
const authStore = useAuthStore();
const modalStore = useModalStore();
const playerAvatar = ref(null); // Reactive avatar reference
const isDropdownVisible = ref(false);

// Refs for DOM elements - ADD THESE LINES
const dropdownMenuRef = ref(null); // Ref for the dropdown menu itself
const avatarContainerRef = ref(null); // Ref for the avatar container (the clickable area)


// Computed property for reactive player avatar
const computedPlayerAvatar = computed(() => playerAvatar.value);

// Watch authStore.player for changes
watch(
  () => authStore.player,
  async (newPlayer) => {
    if (newPlayer?.avatar !== undefined && newPlayer?.avatar !== null) {
      // Unload the previous avatar
      playerAvatar.value = null;

      const avatarId = newPlayer.avatar.toString().padStart(2, '0'); // Ensure two-digit format

      // Dynamically import the avatar
      try {
        const avatarModule = await avatarMap[avatarId]();
        playerAvatar.value = avatarModule.default; // Set the new avatar URL
      } catch (error) {
        console.error('Failed to load avatar:', error);
        playerAvatar.value = null; // Fallback to no avatar
      }
    } else {
      // Unload any existing avatar if no avatar is set
      playerAvatar.value = null;
    }
  },
  { immediate: true }
);


const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleDropdown = (event) => {
  event.stopPropagation(); // Prevent click from immediately propagating to document
  isDropdownVisible.value = !isDropdownVisible.value;
};

// Logout functionality
const logout = async () => {
  isDropdownVisible.value = false; // Close dropdown before logout
  await authStore.logout();
  router.push('/');
};

// Navigation handlers
const goToDashboard = () => {
  router.push('/dashboard');
  isDropdownVisible.value = false; // Close dropdown after navigation
};

// Open login modal
const handleLogin = () => {
  modalStore.openModal(Login);
};

// Scroll to the top of the page when the logo is clicked
const router = useRouter();
const route = useRoute();

const scrollToTop = () => {
  if (route.path !== '/') {
    router.push('/');
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};

// Map the imported logos to language codes
const additionalLogoMap = {
  zh: logoCN,
  ko: logoKR,
  ja: logoJP,
  ru: logoRU,
  ar: logoAR,
  default: defaultLogo,
};

// Computed property to get the additional logo source based on the current language
const additionalLogoSrc = computed(() => {
  return additionalLogoMap[locale.value] || additionalLogoMap.default;
});

// CLICK OUTSIDE LOGIC - ADD THIS ENTIRE BLOCK
const handleClickOutside = (event) => {
  if (isDropdownVisible.value) {
    if (dropdownMenuRef.value && avatarContainerRef.value) { // Check if refs are defined
      if (
        !dropdownMenuRef.value.contains(event.target) && // Click is NOT inside the dropdown menu
        !avatarContainerRef.value.contains(event.target) // AND click is NOT inside the avatar container
      ) {
        isDropdownVisible.value = false; // Close the dropdown
      }
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Basic Header Styling */

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rem 1.75rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
  position: fixed;
  z-index: var(--cosmic-z-header);
  border-radius: 12px;
  margin: auto;
  margin-top: 1rem;
  left: 2rem;
  right: 2rem;
  height: 3.75rem;
  backdrop-filter: var(--cosmic-glass-blur);
  transition: all var(--cosmic-transition-medium);
}

header:hover {
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.2);
}

.desktop-language-selector {
  position: static;
  width: auto;
  height: auto;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: rgba(30, 43, 56, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--cosmic-transition-medium);
  box-shadow: var(--cosmic-shadow-sm);
}

/* Hover effect */
.desktop-language-selector:hover {
  background-color: rgba(0, 195, 255, 0.15);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: none;
}

.logo-wrapper {
  margin-top: .35rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* Logo Styling */
.logo img {
  margin-left: -1rem;
  width: 2.5rem;
  cursor: pointer;
  transition: transform var(--cosmic-transition-medium), filter var(--cosmic-transition-fast);
}

.logo img:hover {
  transform: scale(1.25) rotate(-4deg);
  filter: 
  brightness(1.45)
  hue-rotate(120deg)
  drop-shadow(0px 0px 12px rgba(0, 0, 0, 0.8));
}

/* Additional Logo Styling */
.additional-logo img {
  width: 4.25rem;
  margin-left: 0.5rem; /* Add space between the two logos */
  transition: transform var(--cosmic-transition-slow), filter var(--cosmic-transition-fast);
}

.additional-logo img:hover {
  transform: scale(1.1) rotate(-2deg);
  filter: 
  brightness(1.65)
  saturate(0)
  drop-shadow(0px 0px 8px rgba(22, 154, 255, 0.58));
}

/* Navigation Links */
.nav-links ul {
  position: absolute;
  left: 8rem;
  top: 0;
  display: flex;
  gap: 2rem;
  list-style: none;
}

/* Apply Cosmic Nav Link Styles */
.nav-links a {
  padding: 0.2rem 0.5rem;
}

.connect-container {
  display: flex;
  align-items: center;
  gap: .5rem;
  position: absolute;
  right: .5rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Burger Menu Styling */
.burger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.burger span {
  display: block;
  width: 24px;
  height: 4px;
  background-color: #ffffff;
  transition: transform 0.25s, opacity 0.1s;
}

.burger:hover span {
  background-color: var(--cosmic-blue);
  box-shadow: 0px 0px 4px rgba(0, 191, 255, 0.4);
  transform: scale(115%);
}

.burger .open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger .open:nth-child(2) {
  opacity: 0;
}

.burger .open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Player Avatar Styling */
.player-avatar {
  margin-top: .4rem;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid rgba(15, 185, 253, 0.4);
  transition: all var(--cosmic-transition-fast);
  box-shadow: var(--cosmic-shadow-sm);
}

.player-avatar:hover {
  transform: none;
  border-color: rgba(15, 185, 253, 0.6);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
}

.player-placeholder {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  background: #333;
  padding: 8px;
  border-radius: 4px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  margin-top: .25rem;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md);
  padding: 1rem 0;
  z-index: var(--cosmic-z-dropdown);
  min-width: 140px;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  font-weight: 700;
  padding: 0.5rem 1rem;
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.dropdown-menu li:hover {
  background-color: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

/* Connect Button Custom Styling */
.connect-container .cosmic-button-outline {
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
  border-radius: 8px;
  margin-left: 0.5rem;
  position: relative;
  overflow: hidden;
}

.connect-container .cosmic-button-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.05) 0%, rgba(15, 185, 253, 0) 100%);
  border-radius: 8px;
  z-index: -1;
  transition: all var(--cosmic-transition-medium);
  opacity: 0;
}

.connect-container .cosmic-button-outline:hover {
  transform: none;
  background: rgba(15, 185, 253, 0.1);
  border-color: var(--cosmic-blue-light);
  color: var(--cosmic-blue-light);
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
  text-shadow: var(--cosmic-glow-blue-sm);
}

.connect-container .cosmic-button-outline:hover::before {
  opacity: 1;
}

@media (max-width: 1080px) {
  .nav-links ul {
    left: 7.5rem;
    gap: 1rem;
  }

  .nav-links a {
    font-size: .85rem;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .burger {
    display: flex; /* Visible on mobile */
  }
  
  .connect-container {
    right: .5rem;
  }

  .nav-links {
    display: none; /* Hide nav-links on mobile */
  }

  .additional-logo {
    display: none;
  }

  .desktop-language-selector {
    display: none;
  }

  /* Center logo on mobile */
  .logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
