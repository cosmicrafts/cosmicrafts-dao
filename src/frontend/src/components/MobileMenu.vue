<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from '@/stores/language';
import LanguageSelector from '@/components/LanguageSelector.vue';

// Import logos explicitly for each language
import defaultLogo from '@/assets/icons/logo.svg';
import logoCN from '@/assets/icons/logo-cn.svg';
import logoKR from '@/assets/icons/logo-kr.svg';
import logoJP from '@/assets/icons/logo-jp.svg';
import logoRU from '@/assets/icons/logo-ru.svg';
import logoAR from '@/assets/icons/logo-ar.svg';

const { t } = useI18n();
const languageStore = useLanguageStore();
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
  default: defaultLogo,
};

// Computed property to get the additional logo source based on the current language
const additionalLogoSrc = computed(() => {
  return additionalLogoMap[languageStore.currentLanguage] || additionalLogoMap.default;
});

// Close the menu
const closeMenu = () => {
  emit('closeMenu');
};

// Scroll to top
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};
</script>


<template>
  <!-- Overlay to close the menu, conditionally rendered -->
  <div v-if="isOpen" class="overlay overlay-fade" @click="closeMenu"></div>
  
  <!-- Side panel for nav-links and independent language selector -->
  <nav class="mobile-panel" :class="{ 'mobile-panel-open': isOpen }">
    <div class="mobile-panel-header">
      <div class="close-btn" @click="closeMenu">
        <span class="open"></span>
        <span class="open"></span>
        <span class="open"></span>
      </div>

      <!-- Dynamic Language-Based Logo -->
      <div class="additional-logo-mobile" @click="() => { closeMenu(); scrollToTop(); }">
        <img :src="additionalLogoSrc" alt="Additional Logo" />
      </div>
    </div>

    <div class="nav-container">
      <ul class="nav-links">
        <li v-for="(item, index) in [
          { label: 'header.games', path: '/game' },
          { label: 'header.dao', path: '/dao' },
          { label: 'header.whitepaper', path: '/whitepaper' },
          { label: 'header.roadmap', path: '/roadmap' }
        ]" :key="index">
          <router-link :to="item.path" class="cosmic-nav-link" :style="{ '--index': index }" @click="closeMenu">
            {{ t(item.label) }}
          </router-link>
        </li>
        
        <!-- Developer section - includes theme guide -->
        <li class="dev-section">
          <div class="section-title">Developers</div>
          <router-link to="/theme-guide" class="cosmic-nav-link dev-link" :style="{ '--index': 5 }" @click="closeMenu">
            Theme Guide
          </router-link>
          <router-link to="/style-guide" class="cosmic-nav-link dev-link" :style="{ '--index': 6 }" @click="closeMenu">
            Style Guide
          </router-link>
        </li>
      </ul>
    </div>
    
    <div class="language-selector-container">
      <LanguageSelector context="mobile" />
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
  backdrop-filter: blur(2px);
  z-index: var(--cosmic-z-dropdown);
}

/* Side Panel */
.mobile-panel {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(-100%) scale(1);
  width: 80%;
  max-width: 320px;
  height: 100%;
  background: var(--cosmic-glass-bg-darker);
  display: flex;
  flex-direction: column;
  padding: 0;
  transition: transform 0.25s ease-in-out;
  z-index: var(--cosmic-z-dropdown);
  border-top-right-radius: var(--cosmic-radius-md);
  border-bottom-right-radius: var(--cosmic-radius-md);
  backdrop-filter: var(--cosmic-glass-blur);
  border-right: var(--cosmic-glass-border);
  box-shadow: var(--cosmic-shadow-lg);
}

.mobile-panel-open {
  transform: translateX(0) scale(1);
}

/* Panel Header */
.mobile-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

/* Navigation Container */
.nav-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
}

/* Navigation Links */
.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--cosmic-text-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.75rem;
  display: inline-block;
  position: relative;
  opacity: 0; /* Start invisible */
  transform: translateX(-64px); /* Slide in effect */
  transition: opacity 0.5s ease, transform 0.5s ease, color 0.25s ease-in-out;
  transition-delay: calc(0.1s * var(--index)); /* Staggered delay */
  padding: 0.2rem 0.5rem;
  cursor: pointer;
}

/* When the panel is open, fade in and slide each link */
.mobile-panel-open .nav-links a {
  opacity: 1;
  transform: translateX(0);
}

.nav-links a:hover {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

.close-btn {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  gap: 3px;
  width: 24px;
  height: 24px;
  justify-content: center;
  transition: transform 0.2s ease, color 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.1);
}

.close-btn span {
  display: block;
  width: 24px;
  height: 3px;
  background-color: var(--cosmic-text-primary);
  transition: transform 0.1s, opacity 0.1s, background-color 0.25s ease;
}

.close-btn:hover span {
  background-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
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
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

/* Additional Logo for Mobile */
.additional-logo-mobile {
  display: flex;
  justify-content: center;
}

.additional-logo-mobile img {
  width: 6rem;
  transition: transform var(--cosmic-transition-medium), filter var(--cosmic-transition-fast);
}

.additional-logo-mobile img:hover {
  transform: scale(1.05) rotate(-2deg);
  filter: drop-shadow(0px 0px 16px rgba(0, 195, 255, 0.3));
}

/* Developer section styling */
.dev-section {
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

.section-title {
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.dev-link {
  font-size: 1.5rem !important;
  padding-left: 0.5rem !important;
  margin-top: 0.5rem;
}

/* Animation for overlay */
.overlay-fade {
  animation: fadeIn 0.25s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .mobile-panel {
    width: 85%;
  }
  
  .nav-links a {
    font-size: 1.5rem;
  }
  
  .dev-link {
    font-size: 1.3rem !important;
  }
}
</style>
  