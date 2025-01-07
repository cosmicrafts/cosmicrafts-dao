<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/LanguageSelector.vue';

// Import logos explicitly for each language
import defaultLogo from '@/assets/icons/logo.svg';
import logoCN from '@/assets/icons/logo-cn.svg';
import logoKR from '@/assets/icons/logo-kr.svg';
import logoJP from '@/assets/icons/logo-jp.svg';
import logoRU from '@/assets/icons/logo-ru.svg';
import logoAR from '@/assets/icons/logo-ar.svg';
import { inject } from 'vue';
const selectedLanguage = inject('selectedLanguage');

const { t, locale } = useI18n();
const emit = defineEmits(['closeMenu']);
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

// Map the imported logos to language codes
const additionalLogoMap = {
  zh: logoCN,
  ko: logoKR,
  ja: logoJP,
  ru: logoRU,
  ar: logoAR,
  default: defaultLogo
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};


// Computed property to get the additional logo source based on the current language
const additionalLogoSrc = computed(() => {
  return additionalLogoMap[locale.value] || additionalLogoMap.default;
});

const closeMenu = () => {
  emit('closeMenu');
};
</script>

<template>
  <!-- Overlay to close the menu, conditionally rendered -->
  <div v-if="isOpen" class="overlay overlay-fade" @click="closeMenu"></div>
  
  <!-- Side panel for nav-links and independent language selector -->
  <nav class="mobile-panel" :class="{ 'mobile-panel-open': isOpen }">
    <div class="close-btn" @click="closeMenu">
      <span class="open"></span>
      <span class="open"></span>
      <span class="open"></span>
    </div>

    <!-- Dynamic Language-Based Logo -->
    <div class="additional-logo-mobile" @click="() => { closeMenu(); scrollToTop(); }">
  <img :src="additionalLogoSrc" alt="Additional Logo" />
</div>


    <div class="nav-container">
      <ul class="nav-links">
        <li v-for="(item, index) in [
          { label: 'header.games', path: '/games' },
          { label: 'header.dao', path: '/dao' },
          { label: 'header.whitepaper', path: '/whitepaper' },
          { label: 'header.dashboard', path: '/dashboard' }
        ]" :key="index">
          <router-link :to="item.path" :style="{ '--index': index }" @click="closeMenu">
            {{ t(item.label) }}
          </router-link>
        </li>
      </ul>
    </div>
    
    <div class="language-selector-container">
      <LanguageSelector />
    </div>
  </nav>
</template>
  
  <style scoped>
  /* Overlay Styling */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }
  
/* Side Panel */
.mobile-panel {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(-100%) scale(1); /* Start scaled down slightly */
  width: 60%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.88), rgba(23, 33, 43, 0.77));
  display: flex;
  flex-direction: column;
  padding: 6rem 1.5rem 2rem;
  transition: transform 0.25s ease-in-out;
  z-index: 11;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  backdrop-filter: blur(8px);
  border-right: 1px solid #ffffff12;
}

.mobile-panel-open {
  transform: translateX(0) scale(1);
}

/* Navigation Links */
.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 2rem;
}

.nav-links a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 2rem;
  display: inline-block;
  position: relative;
  opacity: 0; /* Start invisible */
  transform: translateX(-64px); /* Slide in effect */
  transition: opacity 0.5s ease, transform 0.5s ease, color 0.25s ease-in-out,
              border-top 0.3s ease, border-bottom 0.3s ease; /* Add border transition */
  transition-delay: calc(0.1s * var(--index)); /* Staggered delay */
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  border-top: 1px solid transparent; /* Start with transparent borders */
  border-bottom: 1px solid transparent;
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
  height: 2px;
  width: 50%;
  background-color: #ffa200;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0px 0px 5px rgba(255, 162, 0, 0);
  transform: scaleX(0); /* Start hidden */
}

.nav-links a::before {
  top: -1px; /* Offset top line above text */
  left: -4%; /* Adjust horizontal offset */
  transform-origin: left; /* Line grows from the left */
}

.nav-links a::after {
  bottom: -1px; /* Offset bottom line below text */
  right: -4%; /* Adjust horizontal offset */
  transform-origin: right; /* Line grows from the right */
}

/* Hover Effect for Line Animation */
.nav-links a:hover::before,
.nav-links a:hover::after {
  transform: scaleX(1.5); /* Grow lines */
  box-shadow: 0px 0px 5px rgba(255, 162, 0, 0.6);
}

/* When the panel is open, fade in and slide each link */
.mobile-panel-open .nav-links a {
  opacity: 1;
  transform: translateX(0);
}

.close-btn {
    transform: scaleX(0);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  gap: 3px;
  position: absolute;
  top: 2rem;
  left: 2rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.1);
}

.close-btn span {
  display: block;
  width: 24px;
  height: 3px;
  background-color: #e2e8f0;
  transition: transform 0.1s, opacity 0.1s, background-color 0.25s ease;
}

.close-btn:hover span {
  background-color: #00c3ff;
  box-shadow: 0px 0px 2px rgba(0, 191, 255, 0.6);
}

.close-btn .open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.close-btn .open:nth-child(2) {
  opacity: 0;
}

.close-btn .open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}
  .language-selector-container {
    position: flex;
    justify-content: right;
    padding: 2rem 0;
  }


  /* Additional Logo for Mobile */
.additional-logo-mobile {
position: flex;
margin-top: -2rem;
margin-bottom: -1rem;
}

.additional-logo-mobile img {
  width: 8rem;
  transition: transform 0.25s ease, filter 0.1s ease;
}

.additional-logo-mobile img:hover {
  transform: scale(1.05) rotate(-2deg);
  filter: drop-shadow(0px 0px 16px rgba(0, 195, 255, 0.18));
}
  </style>
  