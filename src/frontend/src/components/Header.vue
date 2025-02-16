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
        <li><router-link to="/game" class="u-hover">{{ t('header.games') }}</router-link></li>
        <li><router-link to="/dao" class="u-hover">{{ t('header.dao') }}</router-link></li>
        <li><router-link to="/whitepaper" class="u-hover">{{ t('header.whitepaper') }}</router-link></li>
        <li><router-link to="/dashboard" class="u-hover">{{ t('header.dashboard') }}</router-link></li>
      </ul>
    </nav>


    <!-- Flex Container for Connect Button and Language Selector -->
    <div class="connect-container">
      <!-- Multi-Language Selector -->
      <div class="desktop-language-selector header">
        <LanguageSelector direction="down-left" />
      </div>

      <!-- Avatar and Dropdown Menu -->
      <div v-if="authStore.player" class="avatar-container">
        <img
          v-if="computedPlayerAvatar"
          :src="computedPlayerAvatar"
          :key="computedPlayerAvatar"
          alt="Avatar"
          class="player-avatar"
          @click="toggleDropdown"
        />
        <span v-else class="player-placeholder" @click="toggleDropdown"></span>

        <!-- Dropdown Menu -->
        <div v-if="isDropdownVisible" class="dropdown-menu">
          <ul>
            <li @click="goToProfile">{{ t('header.myProfile') }}</li>
            <li @click="goToSettings">{{ t('header.settings') }}</li>
            <li @click="logout">{{ t('header.signout') }}</li>
          </ul>
        </div>
      </div>

      <!-- Show "Connect" Button When Not Authenticated -->
      <button v-else class="button outline" @click="handleLogin">
        {{ t('header.connect') }}
      </button>
    </div>
  </header>

  <MobileMenu :isOpen="isMenuOpen" @closeMenu="toggleMenu" />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import MobileMenu from '@/components/MobileMenu.vue';
import LanguageSelector from '@/components/LanguageSelector.vue'; // Re-import the LanguageSelector
import { useModalStore } from '@/stores/modal';
import Login from '@/components/Login.vue';
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

const toggleDropdown = () => {
  isDropdownVisible.value = !isDropdownVisible.value;
};

// Logout functionality
const logout = async () => {
  await authStore.logout();
  router.push('/'); // Redirect to the home page
};

// Navigation handlers
const goToProfile = () => {
  router.push('/profile'); // Adjust route as needed
};

const goToSettings = () => {
  router.push('/settings'); // Adjust route as needed
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
</script>


<style scoped>
/* Basic Header Styling */

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rem 1.75rem;
  border: 1px solid #ffffff12;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.2), rgba(23, 33, 43, 0.4));
  position: fixed;
  z-index: 12;
  border-radius: 12px;
  margin: auto;
  margin-top: .7%;
  left: 0.5rem;
  right: 0.5rem;
  height: 4rem;
  backdrop-filter: blur(8px);
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
  transition: 
    transform 0.3s ease-out, 
    background-color 0.4s ease-out, /* ⏳ Slow fade-out */
    box-shadow 0.6s ease-out; /* ⏳ Longer glow fade */
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.15);
}

/* Hover effect */
.desktop-language-selector:hover {
  background-color: rgba(0, 195, 255, 0.862); /* Lighter blue background on hover */
  box-shadow: 0 4px 16px rgba(0, 208, 255, 0.896);
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
  transition: transform 0.4s ease, filter 0.25s ease;
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
  transition: transform 0.55s ease, filter 0.1s ease;
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
  top: 5%;
  display: flex;
  gap: 2rem;
  list-style: none;
}

/* Apply Universal Hover Effect */
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
  background-color: #00c3ff; /* Blue color on hover */
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
  border: 1px solid #00c3ffc4;
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
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.658), rgba(23, 33, 43, 0.705));
  border: 1px solid rgba(128, 128, 128, 0.116);
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
  padding: 1rem 0;
  z-index: 1000;
  min-width: 160px;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  font-weight: 700;
  padding: 0.5rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.dropdown-menu li:hover {
  background-color: #243546;
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
  right: 1.25rem;

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
