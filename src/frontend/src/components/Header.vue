<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/LanguageSelector.vue';
import MobileMenu from '@/components/MobileMenu.vue';
import Modal from '@/components/Modal.vue'; // Import the modal
import Login from '@/components/Login.vue'; // Import the login component
import defaultLogo from '@/assets/icons/logo.svg';
import logoCN from '@/assets/icons/logo-cn.svg';
import logoKR from '@/assets/icons/logo-kr.svg';
import logoJP from '@/assets/icons/logo-jp.svg';
import logoRU from '@/assets/icons/logo-ru.svg';
import logoAR from '@/assets/icons/logo-ar.svg';
import { inject } from 'vue';
const selectedLanguage = inject('selectedLanguage');
import { useRouter, useRoute } from 'vue-router';

const { t, locale } = useI18n();
const isMenuOpen = ref(false);
const isLoginModalOpen = ref(false); // State for controlling the modal

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleLogin = () => {
  isLoginModalOpen.value = true; // Open the modal
};

const closeLoginModal = () => {
  isLoginModalOpen.value = false; // Close the modal
};

// Scroll to the top of the page when the logo is clicked
const router = useRouter();
const route = useRoute();

const scrollToTop = () => {
  if (route.path !== '/') {
    // Redirect to the home page if not already there
    router.push('/');
  } else {
    // Scroll to the top if already on the home page
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

<template>
  <header>
    <!-- Burger Menu Icon (Visible on Mobile) -->
    <div class="burger" @click="toggleMenu">
      <span :class="{ open: isMenuOpen }"></span>
      <span :class="{ open: isMenuOpen }"></span>
      <span :class="{ open: isMenuOpen }"></span>
    </div>

    <!-- Logo with Click Event for Scrolling to Top -->
    <div class="logo-wrapper" @click="scrollToTop">
      <!-- Main Logo -->
      <div class="logo">
        <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts Logo" />
      </div>

      <!-- Additional Logo SVG (Visible only on desktop) with dynamic source -->
      <div class="additional-logo">
        <img :src="additionalLogoSrc" alt="Additional Logo" />
      </div>
    </div>

    <!-- Navigation Links (Desktop Only) -->
    <nav class="nav-links">
      <ul>
        <li><router-link to="/games">{{ t('header.games') }}</router-link></li>
        <li><router-link to="/dao">{{ t('header.dao') }}</router-link></li>
        <li><router-link to="/whitepaper">{{ t('header.whitepaper') }}</router-link></li>
        <li><router-link to="/dashboard">{{ t('header.dashboard') }}</router-link></li>
      </ul>
    </nav>

    <!-- Flex Container for Connect Button and Language Selector -->
    <div class="connect-container">
      <div class="desktop-language-selector header">
        <LanguageSelector direction="down-left" />
      </div>
      <button class="button outline" @click="handleLogin">{{ t('header.connect') }}</button>
    </div>
  </header>

  <!-- MobileMenu Component -->
  <MobileMenu :isOpen="isMenuOpen" @closeMenu="toggleMenu" />

  <!-- Login Modal -->
  <Modal :isOpen="isLoginModalOpen" @close="closeLoginModal">
    <Login />
  </Modal>
</template>


<style scoped>
/* Basic Header Styling */

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border: 1px solid #ffffff12;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.2), rgba(23, 33, 43, 0.4));
  position: fixed;
  z-index: 12;
  border-radius: 16px;
  margin: auto;
  top: 1%;
  left: 0.5rem;
  right: 0.5rem;
  height: 1rem;
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
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Subtle shadow for depth */
}

/* Hover effect */
.desktop-language-selector:hover {
  background-color: rgba(0, 195, 255, 0.862); /* Lighter blue background on hover */
  box-shadow: 0 6px 12px rgba(0, 195, 255, 0.2); 
}

.logo-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}


/* Logo Styling */
.logo img {
  width: 2.5rem;
  cursor: pointer; /* Cursor pointer to indicate it's clickable */
  transition: transform 0.5s ease, filter 0.1s ease;
}

.logo img:hover {
  transform: scale(1.1) rotate(-4deg);
  filter: drop-shadow(0px 0px 6px rgba(0, 195, 255, 0.8));
  animation: pulse 0.8s infinite alternate;
}

@keyframes pulse {
  from {
    filter: drop-shadow(0px 0px 6px rgba(0, 195, 255, 0.8));
    transform: translateY(-1px); /* Start slightly above */
  }
  to {
    filter: drop-shadow(0px 0px 12px rgba(0, 195, 255, 1));
    transform: translateY(1px); /* Move slightly below */
  }
}

/* Additional Logo Styling */
.additional-logo img {
  width: 4rem;
  margin-left: 0.55rem; /* Add space between the two logos */
  transition: transform 0.25s ease, filter 0.1s ease;
}

.additional-logo img:hover {
  transform: scale(1.1) rotate(-2deg);
  filter: drop-shadow(0px 0px 16px rgba(0, 195, 255, 0.58));
}

/* Navigation Links */
.nav-links ul {
  position: absolute;
  left: 8rem;
  top: 1.5%;
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  display: inline-block;
  position: relative;
  transition: color 0.25s ease-in-out, transform 0.25s ease-in-out, text-shadow 0.25s ease-in-out;
  padding: 0.2rem 0.5rem;
}

.nav-links a:hover {
  color: #00c3ff;
  border-bottom: 1px solid #00c3ff;
  border-top: 1px solid #00c3ff;
  padding-bottom: 0.2rem; /* Adjust padding to account for the new border */
  text-shadow: 0px 0px 2px rgba(0, 191, 255, 0.686);
}

/* Line Animation */
.nav-links a::before,
.nav-links a::after {
  content: '';
  position: absolute;
  height: 1.5px;
  width: 50%;
  background-color: #ffa200;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0px 0px 5px rgba(255, 162, 0, 0);
  transform: scaleX(0); /* Start hidden */
}

.nav-links a::before {
  top: -1px; /* Offset top line above text */
  left: -4%; /* Adjust horizontal offset for breathing room */
  transform-origin: left; /* Line grows from the left */
}

.nav-links a::after {
  bottom: -1px; /* Offset bottom line below text */
  right: -4%; /* Adjust horizontal offset for breathing room */
  transform-origin: right; /* Line grows from the right */
}

/* Hover Effect */
.nav-links a:hover::before,
.nav-links a:hover::after {
  transform: scaleX(1.5);
  box-shadow: 0px 0px 5px rgba(255, 162, 0, 0.6);
}

.connect-container {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Adjust spacing as needed */
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Log In Button Styling */
.login-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(to bottom, #00C0FC, #0056BA);
  color: #fff;
  border: 1px solid #25252529;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  height: 2.5rem;
}

.login-button:hover {
  background: linear-gradient(to bottom, #50b3d1, #32649d);
  border-color: #f7f7f778;
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
