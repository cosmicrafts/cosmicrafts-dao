<template>
  <div v-if="hoverToShow">
    <div class="header-hover-area" @mouseenter="showHeader" @mouseleave="hideHeader"></div>
    <div
      class="header-fade"
      :class="{ 'header-fade-visible': isVisible }"
      @mouseenter="showHeader"
      @mouseleave="hideHeader"
    >
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
            <li><router-link to="/games" class="cosmic-hover" @click="trackNavClick('games')">{{ t('header.games') }}</router-link></li>
            <li><router-link to="/dao" class="cosmic-hover" @click="trackNavClick('dao')">{{ t('header.dao') }}</router-link></li>
            <li><router-link to="/whitepaper" class="cosmic-hover" @click="trackNavClick('whitepaper')">{{ t('header.whitepaper') }}</router-link></li>
            <li><router-link to="/roadmap" class="cosmic-hover" @click="trackNavClick('roadmap')">{{ t('header.roadmap') }}</router-link></li>
            
            <!-- Developer dropdown - commented out for now -->
            <!--
            <li class="dev-dropdown" ref="devDropdownRef">
              <div class="dropdown-trigger cosmic-hover" @click="toggleDevDropdown">Developers</div>
              <div v-if="isDevDropdownVisible" class="dev-dropdown-menu">
                <ul>
                  <li><router-link to="/theme-guide" @click="isDevDropdownVisible = false">Theme Guide</router-link></li>
                  <li><router-link to="/style-guide" @click="isDevDropdownVisible = false">Style Guide</router-link></li>
                </ul>
              </div>
            </li>
            -->
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
                <li class="principal-item">
                  <div class="principal-id-display">
                    <div class="principal-header">
                      <img src="@/assets/icons/icp.svg" alt="ICP Logo" class="principal-icon" />
                      <span class="principal-label">Principal ID</span>
                    </div>
                    <div class="principal-value-container">
                      <span class="principal-value">{{ formatPrincipal(getPrincipalString) }}</span>
                      <button @click.stop="copyPrincipal" class="copy-button">
                        <i class="fas fa-copy"></i>
                        <span v-if="copySuccess" class="copy-tooltip">{{ t('header.copied') }}</span>
                      </button>
                    </div>
                  </div>
                </li>
                <li class="menu-divider"></li>
                <li @click="logout" class="logout-item">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>{{ t('header.signout') }}</span>
                </li>
              </ul>
            </div>
          </div>

          <button v-else class="cosmic-button cosmic-button-outline-primary" @click="handleLogin">
            <span class="button-text">{{ t('header.connect') }}</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
        </div>
      </header>
    </div>
  </div>
  <div v-else>
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
            <li><router-link to="/games" class="cosmic-hover" @click="trackNavClick('games')">{{ t('header.games') }}</router-link></li>
            <li><router-link to="/dao" class="cosmic-hover" @click="trackNavClick('dao')">{{ t('header.dao') }}</router-link></li>
            <li><router-link to="/whitepaper" class="cosmic-hover" @click="trackNavClick('whitepaper')">{{ t('header.whitepaper') }}</router-link></li>
            <li><router-link to="/roadmap" class="cosmic-hover" @click="trackNavClick('roadmap')">{{ t('header.roadmap') }}</router-link></li>
          <!-- Developer dropdown - commented out for now -->
          <!--
          <li class="dev-dropdown" ref="devDropdownRef">
            <div class="dropdown-trigger cosmic-hover" @click="toggleDevDropdown">Developers</div>
            <div v-if="isDevDropdownVisible" class="dev-dropdown-menu">
              <ul>
                <li><router-link to="/theme-guide" @click="isDevDropdownVisible = false">Theme Guide</router-link></li>
                <li><router-link to="/style-guide" @click="isDevDropdownVisible = false">Style Guide</router-link></li>
              </ul>
            </div>
          </li>
          -->
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
              <li class="principal-item">
                <div class="principal-id-display">
                  <div class="principal-header">
                    <img src="@/assets/icons/icp.svg" alt="ICP Logo" class="principal-icon" />
                    <span class="principal-label">Principal ID</span>
                  </div>
                  <div class="principal-value-container">
                    <span class="principal-value">{{ formatPrincipal(getPrincipalString) }}</span>
                    <button @click.stop="copyPrincipal" class="copy-button">
                      <i class="fas fa-copy"></i>
                      <span v-if="copySuccess" class="copy-tooltip">{{ t('header.copied') }}</span>
                    </button>
                  </div>
                </div>
              </li>
              <li class="menu-divider"></li>
              <li @click="logout" class="logout-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>{{ t('header.signout') }}</span>
              </li>
            </ul>
          </div>
        </div>

        <button v-else class="cosmic-button cosmic-button-outline-primary" @click="handleLogin">
          <span class="button-text">{{ t('header.connect') }}</span>
          <span class="button-glow"></span>
          <span class="button-particles"></span>
        </button>
      </div>
    </header>
  </div>

  <MobileMenu :isOpen="isMenuOpen" @closeMenu="toggleMenu" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import MobileMenu from '@/components/navigation/MobileMenu.vue';
import LanguageSelector from '@/components/navigation/LanguageSelector.vue'
import { useModalStore } from '@/stores/modal';
import Login from '@/components/user/LoginForm.vue';
import NotificationIcon from '@/components/user/NotificationIcon.vue';
import defaultLogo from '@/assets/icons/logo.svg';
import logoCN from '@/assets/icons/logo-cn.svg';
import logoKR from '@/assets/icons/logo-kr.svg';
import logoJP from '@/assets/icons/logo-jp.svg';
import logoRU from '@/assets/icons/logo-ru.svg';
import logoAR from '@/assets/icons/logo-ar.svg';
import AvatarService from '@/utils/AvatarService';

const { t, locale } = useI18n();
const isMenuOpen = ref(false);
const authStore = useAuthStore();
const modalStore = useModalStore();
const playerAvatar = ref(null); // Reactive avatar reference
const isDropdownVisible = ref(false);
// const isDevDropdownVisible = ref(false); // Commented out for developer mode
const copySuccess = ref(false);
const hideTimeout = ref(null);

// Refs for DOM elements - ADD THESE LINES
const dropdownMenuRef = ref(null); // Ref for the dropdown menu itself
const avatarContainerRef = ref(null); // Ref for the avatar container (the clickable area)
// const devDropdownRef = ref(null); // Commented out for developer mode

// Principal ID utilities
// Create a reactive ref to store the principal string
const principalString = ref('');

// Update principal when needed
const updatePrincipal = () => {
  try {
    const identity = authStore.getIdentity();
    if (identity) {
      principalString.value = identity.getPrincipal().toText();
    } else {
      principalString.value = '';
    }
  } catch (error) {
    console.error('Error getting principal string:', error);
    principalString.value = '';
  }
};

// Computed to access the principal string
const getPrincipalString = computed(() => principalString.value);

// Watch for identity changes
watch(() => authStore.authenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    updatePrincipal();
  } else {
    principalString.value = '';
  }
}, { immediate: true });

// Also update principal when player changes
watch(() => authStore.player, () => {
  updatePrincipal();
}, { immediate: true });

const formatPrincipal = (principal) => {
  if (!principal) return '';
  // Format to show first 5 and last 3 with ... in middle
  if (principal.length <= 8) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-3)}`;
};

const copyPrincipal = async (event) => {
  event.stopPropagation(); // Prevent closing the dropdown
  if (principalString.value) {
    try {
      await navigator.clipboard.writeText(principalString.value);
      copySuccess.value = true;
      console.log('Copied principal to clipboard:', principalString.value);
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy principal:', err);
    }
  } else {
    console.error('No principal available to copy');
  }
};

// Computed property for reactive player avatar
const computedPlayerAvatar = computed(() => playerAvatar.value);

// Watch authStore.player for changes
watch(
  () => authStore.player,
  async (newPlayer) => {
    if (newPlayer?.avatar !== undefined && newPlayer?.avatar !== null) {
      // Unload the previous avatar
      playerAvatar.value = null;

      try {
        // Use AvatarService to load the avatar asynchronously
        playerAvatar.value = await AvatarService.loadAvatarAsync(newPlayer.avatar);
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
  
  // Track mobile menu toggle
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'mobile_menu_toggled', {
      action: isMenuOpen.value ? 'opened' : 'closed',
      location: 'header'
    });
  }
};

const toggleDropdown = (event) => {
  event.stopPropagation(); // Prevent click from immediately propagating to document
  isDropdownVisible.value = !isDropdownVisible.value;
  
  // Track avatar dropdown toggle
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'avatar_dropdown_toggled', {
      action: isDropdownVisible.value ? 'opened' : 'closed',
      location: 'header'
    });
  }
};

// Logout functionality
const logout = async () => {
  // Track logout action
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'user_logged_out', {
      location: 'header_dropdown',
      principal: principalString.value.substring(0, 10) + '...'
    });
  }
  
  isDropdownVisible.value = false; // Close dropdown before logout
  await authStore.logout();
  // Clear principal after logout
  principalString.value = '';
  router.push('/');
};

// Navigation handlers
const goToDashboard = () => {
  router.push('/dashboard');
  isDropdownVisible.value = false; // Close dropdown after navigation
};

// Navigation to wallet
const goToWallet = () => {
  router.push('/wallet');
  isDropdownVisible.value = false; // Close dropdown after navigation
};

// Open login modal
const handleLogin = () => {
  // Track login button click
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'login_button_clicked', {
      location: 'header',
      button_type: 'connect'
    });
  }
  
  modalStore.openModal(Login);
  // After login modal is closed, ensure we update the principal
  // This will be triggered by the auth.authenticated watcher
};

// Scroll to the top of the page when the logo is clicked
const router = useRouter();
const route = useRoute();

const scrollToTop = () => {
  // Track logo click
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'logo_clicked', {
      current_path: route.path,
      action: route.path !== '/' ? 'navigate_home' : 'scroll_to_top'
    });
  }
  
  if (route.path !== '/') {
    router.push('/');
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
};

// Track navigation clicks
const trackNavClick = (navItem) => {
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'header_nav_clicked', {
      nav_item: navItem,
      current_path: route.path,
      location: 'header_desktop'
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

// Toggle developer dropdown - commented out for now
/*
const toggleDevDropdown = () => {
  isDevDropdownVisible.value = !isDevDropdownVisible.value;
};
*/

// Close dropdowns when clicking outside them
const handleClickOutside = (event) => {
  // Close avatar dropdown
  if (
    isDropdownVisible.value &&
    dropdownMenuRef.value &&
    avatarContainerRef.value &&
    !dropdownMenuRef.value.contains(event.target) &&
    !avatarContainerRef.value.contains(event.target)
  ) {
    isDropdownVisible.value = false;
  }
  
  // Close dev dropdown - commented out for now
  /*
  if (
    isDevDropdownVisible.value &&
    devDropdownRef.value &&
    !devDropdownRef.value.contains(event.target)
  ) {
    isDevDropdownVisible.value = false;
  }
  */
};

const props = defineProps({
  hoverToShow: { type: Boolean, default: false }
});

const isVisible = ref(false);

function showHeader() {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
    hideTimeout.value = null;
  }
  isVisible.value = true;
}
function hideHeader() {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
  }
  hideTimeout.value = setTimeout(() => {
    isVisible.value = false;
    hideTimeout.value = null;
  }, 750); // 1.8 seconds delay before hiding
}

watch(
  () => props.hoverToShow,
  (newVal) => {
    if (newVal) {
      if (hideTimeout.value) {
        clearTimeout(hideTimeout.value);
        hideTimeout.value = null;
      }
      isVisible.value = false;
    }
  }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Initialize principal value
  updatePrincipal();
  
  // If auth store is already authenticated, ensure principal is updated
  if (authStore.authenticated) {
    updatePrincipal();
  }
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
  max-width: 100%;
  box-sizing: border-box;
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
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-xs);
  padding: 0;
  z-index: var(--cosmic-z-dropdown);
  min-width: 220px;
  backdrop-filter: var(--cosmic-glass-blur);
  overflow: hidden;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  display: flex;
  align-items: center;
  font-weight: 600;
  padding: 0.75rem 1rem;
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  gap: 0.75rem;
}

.dropdown-menu li:hover {
  background-color: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.dropdown-menu li:hover i {
  color: var(--cosmic-blue);
}

.dropdown-menu li i {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
  color: var(--cosmic-text-secondary);
  transition: color var(--cosmic-transition-fast);
}

.principal-item {
  padding: 0.75rem 1rem !important;
  cursor: default !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 0.5rem !important;
  background-color: rgba(15, 185, 253, 0.05);
  border-bottom: 1px solid rgba(15, 185, 253, 0.15);
}

.principal-item:hover {
  background-color: rgba(15, 185, 253, 0.08) !important;
  color: var(--cosmic-text-primary) !important;
}

.principal-id-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.principal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.principal-icon {
  width: 1.25rem;
  height: auto;
}

.principal-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
  font-weight: 500;
}

.principal-value-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--cosmic-radius-sm);
  padding: 0.5rem 0.5rem;
  font-size: 0.9rem;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.principal-value {
  font-family: 'Fira Code', monospace;
  font-weight: 400;
  color: var(--cosmic-text-primary);
  font-size: 0.85rem;
}

.copy-button {
  position: relative;
  background: transparent;
  border: none;
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: color var(--cosmic-transition-fast);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.copy-button:hover {
  color: var(--cosmic-blue);
}

.copy-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--cosmic-radius-sm);
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
  animation: fadeInOut 2s ease-in-out;
}

.menu-divider {
  height: 1px;
  padding: 0 !important;
  margin: 0 !important;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: default !important;
}

.menu-divider:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.logout-item {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-item i {
  color: rgba(255, 100, 100, 0.7);
}

.logout-item:hover {
  color: rgba(255, 100, 100, 1);
}

.logout-item:hover i {
  color: rgba(255, 100, 100, 1);
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}

/* Header button styling - removed custom styles to use unified system */
.connect-container .cosmic-button-outline-primary {
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
  border-radius: 8px;
  margin-left: 0.5rem;
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
  header {
    left: 0.5rem;
    right: 0.5rem;
    padding: 0 1rem;
    margin-top: 0.5rem;
    width: calc(100% - 1rem);
    border-radius: 8px;
  }
  
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
  
  .logo img {
    margin-left: 0;
    width: 2.25rem;
  }
}

@media (max-width: 480px) {
  header {
    left: 0.25rem;
    right: 0.25rem;
    width: calc(100% - 0.5rem);
    padding: 0 0.75rem;
  }
  
  .connect-container {
    right: 0.25rem;
  }
  
  .connect-container .cosmic-button-outline-primary {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }
  
  .player-avatar {
    width: 40px;
    height: 40px;
  }
  
  .dropdown-menu {
    right: -10px; /* Adjust position for mobile */
    min-width: 260px; /* Wider dropdown on mobile for better touch targets */
  }
  
  .dropdown-menu li {
    padding: 0.85rem 1rem; /* Larger touch targets */
  }
  
  .principal-value {
    font-size: 0.75rem; /* Smaller font for principal ID on mobile */
    max-width: 160px; /* Limit width to prevent overflow */
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Developer dropdown styling */
.dev-dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
}

.dev-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 160px;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  border: var(--cosmic-glass-border);
  box-shadow: var(--cosmic-shadow-lg);
  backdrop-filter: var(--cosmic-glass-blur);
  overflow: hidden;
  z-index: var(--cosmic-z-dropdown);
  animation: fadeIn 0.2s ease-in-out;
}

.dev-dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dev-dropdown-menu li {
  padding: 0;
  transition: background-color 0.2s ease;
}

.dev-dropdown-menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dev-dropdown-menu a {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--cosmic-text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 0.9rem;
}

.dev-dropdown-menu a:hover {
  color: var(--cosmic-blue);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-hover-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  z-index: 9999;
  background: transparent;
}
.header-fade {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-30px);
  transition: opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1);
  will-change: opacity, transform;
  position: fixed;
  top: 0;
  left: 2rem;
  right: 2rem;
  z-index: var(--cosmic-z-header);
}
.header-fade.header-fade-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
@media (max-width: 768px) {
  .header-fade, .header-fade.header-fade-visible {
    left: 0.5rem;
    right: 0.5rem;
  }
}
@media (max-width: 480px) {
  .header-fade, .header-fade.header-fade-visible {
    left: 0.25rem;
    right: 0.25rem;
  }
}
</style>
