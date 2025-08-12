<script setup>
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from '@/stores/language'; // Import languageStore
import LanguageSelector from '@/components/navigation/LanguageSelector.vue';
import { ref, defineProps } from 'vue';

const props = defineProps({
  hideForFullscreenGame: { type: Boolean, default: false }
});

// Access languageStore and i18n
const languageStore = useLanguageStore();
const { t } = useI18n();

// Get current year for copyright
const currentYear = new Date().getFullYear();

// Check if mobile (initial check)
const isMobile = ref(window.innerWidth <= 768);

// Initialize with appropriate sections expanded (all on desktop, none on mobile)
const expandedSections = ref(new Set(isMobile.value ? [] : ['explore', 'legal']));

// Update mobile state on resize
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768;
  
  // If transitioning to desktop, open all sections
  if (!isMobile.value) {
    expandedSections.value = new Set(['explore', 'legal']);
  }
});

const toggleSection = (section) => {
  // Track footer accordion toggle
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'footer_accordion_toggled', {
      section: section,
      action: expandedSections.value.has(section) ? 'close' : 'open',
      location: 'footer_mobile'
    });
  }
  
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section);
  } else {
    expandedSections.value.add(section);
  }
};

// Track footer navigation clicks
const trackFooterNavClick = (navItem) => {
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'footer_nav_clicked', {
      nav_item: navItem,
      location: 'footer'
    });
  }
};

// Track footer social media clicks
const trackFooterSocialClick = (platform) => {
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'footer_social_clicked', {
      platform: platform,
      location: 'footer'
    });
  }
};

// Helper to check if a section is expanded
const isSectionExpanded = (section) => {
  return expandedSections.value.has(section);
};
</script>

<template>
  <!-- Desktop Footer -->
  <footer class="cosmic-footer" v-show="!hideForFullscreenGame">
    <div class="footer-cosmic-bg"></div>
    
    <!-- Social Buttons Row -->
    <div class="social-top-row">
      <div class="social-top-container">
        <h4 class="cosmic-text-glow">{{ t('footer.stayConnected') }}</h4>
        <div class="social-icons-group">
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="cosmic-social-icon" target="_blank" rel="noopener noreferrer" @click="trackFooterSocialClick('discord')">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://x.com/cosmicrafts" class="cosmic-social-icon" target="_blank" rel="noopener noreferrer" @click="trackFooterSocialClick('x')">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://facebook.com/cosmicrafts" class="cosmic-social-icon" target="_blank" rel="noopener noreferrer" @click="trackFooterSocialClick('facebook')">
            <img src="@/assets/icons/facebook.svg" alt="Facebook" />
          </a>
          <a href="https://dscvr.one/p/cosmicrafts" class="cosmic-social-icon" target="_blank" rel="noopener noreferrer" @click="trackFooterSocialClick('dscvr')">
            <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
          </a>
          <a href="https://distrikt.app/u/cosmicrafts" class="cosmic-social-icon" target="_blank" rel="noopener noreferrer" @click="trackFooterSocialClick('distrikt')">
            <img src="@/assets/icons/distrikt.svg" alt="Distrikt" />
          </a>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation (visible only on desktop) -->
    <div class="desktop-nav-container">
      <div class="desktop-nav-row">
        <!-- Explore Section -->
        <div class="desktop-nav-column cosmic-panel">
          <h4 class="cosmic-text-glow desktop-nav-title">{{ t('footer.explore') }}</h4>
          <ul class="desktop-link-list">
            <li><router-link to="/careers" class="cosmic-nav-link" @click="trackFooterNavClick('careers')">{{ t('footer.careers') }}</router-link></li>
            <li><router-link to="/about" class="cosmic-nav-link" @click="trackFooterNavClick('about')">{{ t('footer.about') }}</router-link></li>
            <li><router-link to="/contact" class="cosmic-nav-link" @click="trackFooterNavClick('contact')">{{ t('footer.support') }}</router-link></li>
          </ul>
        </div>

        <!-- Legal Section -->
        <div class="desktop-nav-column cosmic-panel">
          <h4 class="cosmic-text-glow desktop-nav-title">{{ t('footer.legal') }}</h4>
          <ul class="desktop-link-list">
            <li><router-link to="/privacy" class="cosmic-nav-link" @click="trackFooterNavClick('privacy')">{{ t('footer.privacy') }}</router-link></li>
            <li><router-link to="/legal" class="cosmic-nav-link" @click="trackFooterNavClick('legal')">{{ t('footer.legal') }}</router-link></li>
            <li><router-link to="/terms" class="cosmic-nav-link" @click="trackFooterNavClick('terms')">{{ t('footer.terms') }}</router-link></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mobile Accordion Container (visible only on mobile) -->
    <div class="accordion-container">
      <!-- Navigation Sections in Row -->
      <div class="nav-row">
        <!-- Explore Section -->
        <div class="accordion cosmic-panel">
          <div 
            class="accordion-header" 
            :class="{ 'active': isSectionExpanded('explore') }"
            @click="toggleSection('explore')"
          >
            <h4 class="cosmic-text-glow">{{ t('footer.explore') }}</h4>
            <i class="fas" :class="isSectionExpanded('explore') ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </div>
          <div class="accordion-content" :style="{ maxHeight: isSectionExpanded('explore') ? '200px' : '0' }">
            <ul class="link-list">
              <li><router-link to="/careers" class="cosmic-nav-link" @click="trackFooterNavClick('careers')">{{ t('footer.careers') }}</router-link></li>
              <li><router-link to="/about" class="cosmic-nav-link" @click="trackFooterNavClick('about')">{{ t('footer.about') }}</router-link></li>
              <li><router-link to="/contact" class="cosmic-nav-link" @click="trackFooterNavClick('contact')">{{ t('footer.support') }}</router-link></li>
            </ul>
          </div>
        </div>

        <!-- Legal Section -->
        <div class="accordion cosmic-panel">
          <div 
            class="accordion-header" 
            :class="{ 'active': isSectionExpanded('legal') }"
            @click="toggleSection('legal')"
          >
            <h4 class="cosmic-text-glow">{{ t('footer.legal') }}</h4>
            <i class="fas" :class="isSectionExpanded('legal') ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </div>
          <div class="accordion-content" :style="{ maxHeight: isSectionExpanded('legal') ? '200px' : '0' }">
            <ul class="link-list">
              <li><router-link to="/privacy" class="cosmic-nav-link" @click="trackFooterNavClick('privacy')">{{ t('footer.privacy') }}</router-link></li>
              <li><router-link to="/legal" class="cosmic-nav-link" @click="trackFooterNavClick('legal')">{{ t('footer.legal') }}</router-link></li>
              <li><router-link to="/terms" class="cosmic-nav-link" @click="trackFooterNavClick('terms')">{{ t('footer.terms') }}</router-link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Language Selector -->
    <div class="language-row">
      <LanguageSelector context="footer" />
    </div>

    <!-- Footer Bottom -->
    <div class="copyright-container">
      <img src="@/assets/icons/wou.svg" alt="World of Unreal" class="copyright-logo" />
      <div class="copyright">
        <p>© {{ currentYear }} World of Unreal, LLC.</p>
        <p>{{ t('footer.trademarks') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Main Footer Styles */
.cosmic-footer {
  position: relative;
  color: var(--cosmic-text-primary);
  background: var(--cosmic-glass-bg);
  border-top: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  overflow: hidden;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
}

.footer-cosmic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--cosmic-glass-bg);
  opacity: 0.8;
  z-index: 0;
  pointer-events: none;
}

.footer-cosmic-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--cosmic-blue-translucent-faint);
  opacity: 0.3;
}

/* Social Top Row */
.social-top-row {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--cosmic-blue-translucent-faint);
  border-bottom: var(--cosmic-glass-border-blue);
  width: 100%;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.social-top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
}

.social-top-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cosmic-blue);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.social-icons-group {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: nowrap;
}

/* Cosmic social icon class from theme system */
.cosmic-social-icon {
  width: 4rem !important;
  height: 4rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: var(--cosmic-radius-sm);
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  transition: all var(--cosmic-transition-fast);
}

.cosmic-social-icon:hover {
  transform: translateY(-3px);
  box-shadow: var(--cosmic-glow-blue-sm);
  border-color: var(--cosmic-blue);
}

.cosmic-social-icon img {
  width: 24px;
  height: 24px;
}

/* Desktop Navigation Styles */
.desktop-nav-container {
  margin: 2rem auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  box-sizing: border-box;
}

.desktop-nav-row {
  display: flex;
  justify-content: center;
  gap: 4rem;
  width: 100%;
}

.desktop-nav-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  background: var(--cosmic-glass-bg-lighter);
  min-width: 200px;
  transition: all var(--cosmic-transition-medium);
}

.desktop-nav-column:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-glow-blue-sm);
  border-color: var(--cosmic-blue);
}

.desktop-nav-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  position: relative;
}

.desktop-nav-title::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.desktop-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center;
  width: 100%;
}

.desktop-link-list li {
  margin-bottom: 1rem;
  transition: transform var(--cosmic-transition-fast);
}

.desktop-link-list li:hover {
  transform: translateY(-3px);
}

.desktop-link-list a {
  color: var(--cosmic-text-secondary);
  text-decoration: none;
  font-size: 1.2rem;
  display: block;
  padding: 0.5rem 0;
  transition: all var(--cosmic-transition-fast);
  font-weight: 500;
}

.desktop-link-list a:hover,
.desktop-link-list a:active {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

/* Accordion Styles (Mobile) */
.accordion-container {
  display: none; /* Hidden on desktop */
  margin: 1rem auto;
  width: 100%;
  padding: .5rem;
  max-width: 800px;
  box-sizing: border-box;
}

.nav-row {
  display: flex;
  gap: 2rem;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.accordion {
  flex: 1;
  max-width: 400px;
  margin-bottom: 0.5rem;
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  box-sizing: border-box;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  background: var(--cosmic-glass-bg);
  border-bottom: var(--cosmic-glass-border-blue);
}

.accordion-header h4 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  /* Allow space for icon */
  width: calc(100% - 30px);
}

.accordion-header i {
  display: block;
  color: var(--cosmic-blue);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 1.2rem;
}

.accordion-header.active {
  background: var(--cosmic-glass-bg-lighter);
}

.accordion-header.active i {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: none;
  overflow: hidden;
  transition: max-height 0.4s ease;
  background: var(--cosmic-glass-bg-lighter);
}

.link-list {
  list-style: none;
  padding: 1rem;
  margin: 0;
  text-align: center;
}

.link-list li {
  margin-bottom: 0.5rem;
  transition: transform var(--cosmic-transition-fast);
}

.link-list li:hover {
  transform: translateY(-3px);
}

.link-list a {
  color: var(--cosmic-text-secondary);
  text-decoration: none;
  font-size: 1.2rem;
  display: block;
  padding: 0.5rem 0;
  transition: all var(--cosmic-transition-fast);
  font-weight: 500;
}

.link-list a:hover,
.link-list a:active {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

/* Mobile Button Styles (DAO-style) */
@media (max-width: 768px) {
  .link-list {
    padding: 0.75rem;
  }
  
  .link-list li {
    margin-bottom: 0.75rem;
  }
  
  .link-list a {
    background: var(--cosmic-glass-bg-darker);
    border: var(--cosmic-glass-border-blue);
    border-radius: var(--cosmic-radius-md);
    padding: 0.75rem 0.5rem;
    height: auto;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--cosmic-text-primary);
    box-shadow: var(--cosmic-shadow-sm);
    transition: all var(--cosmic-transition-fast);
    word-break: break-word;
    white-space: normal;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  
  .link-list a:hover,
  .link-list a:active {
    background: var(--cosmic-glass-bg-lighter);
    border-color: var(--cosmic-blue);
    box-shadow: var(--cosmic-glow-blue-sm);
    transform: translateY(-2px);
  }
  
  .accordion-content {
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .cosmic-footer {
    padding: 0;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    left: 0;
    right: 0;
  }
  
  /* Hide desktop navigation on mobile */
  .desktop-nav-container {
    display: none;
  }
  
  /* Show accordion on mobile */
  .accordion-container {
    display: block;
    width: 100%;
    padding: 0.5rem;
    max-width: 100%;
  }
  
  .nav-row {
    flex-direction: column;
    align-items: center;
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
    gap: 1rem;
  }

  .accordion {
    width: 100%;
    max-width: 100%;
  }

  .accordion-content {
    max-height: 0; /* Collapsed by default on mobile */
  }
  
  .accordion-content[style*="200px"] {
    /* Maintain the spacing and padding when expanded */
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .accordion-header {
    justify-content: space-between;
    border-bottom: none;
  }
  
  .accordion-header h4 {
    text-align: left;
    width: auto;
    font-size: 1.2rem;
  }
  
  .accordion-header i {
    display: block;
  }

  /* On mobile, start with all sections collapsed */
  .accordion-content {
    max-height: 0 !important;
  }
  
  /* Override for expanded sections */
  .accordion-content[style*="200px"] {
    max-height: 300px !important;
  }

  .social-top-container {
    width: 100%;
    max-width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .social-top-row {
    padding: 1rem 0;
    width: 100%;
  }

  .language-row {
    padding: 0.75rem 0;
    width: 100%;
  }

  .copyright-container {
    padding: 1.5rem 0;
    width: 100%;
  }

  .social-icons-group {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
  
  .cosmic-social-icon {
    width: 3.5rem !important;
    height: 3.5rem !important;
  }
  
  .cosmic-social-icon img {
    width: 22px;
    height: 22px;
  }

  .link-list {
    padding: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .link-list a {
    font-size: 0.9rem;
    padding: 0.6rem 0.5rem;
    min-height: 2.25rem;
  }
}

@media (max-width: 320px) {
  .social-icons-group {
    gap: 0.5rem;
  }
  
  .cosmic-social-icon {
    width: 2.5rem !important;
    height: 2.5rem !important;
  }
  
  .cosmic-social-icon img {
    width: 18px;
    height: 18px;
  }
}

/* Language Row */
.language-row {
  display: flex;
  justify-content: center;
  padding: 0.75rem;
  background: var(--cosmic-blue-translucent-faint);
  border-top: var(--cosmic-glass-border-blue);
  margin-top: 0.5rem;
  width: 100%;
}

/* Copyright Container */
.copyright-container {
  background: var(--cosmic-glass-bg);
  padding: 2rem 1rem;
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-top: var(--cosmic-glass-border-blue);
  margin-bottom: 0;
  width: 100%;
}

.copyright-logo {
  width: 4rem;
  margin-top: 0.15rem;
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
  transition: transform var(--cosmic-transition-medium), filter var(--cosmic-transition-fast);
}

.copyright-logo:hover {
  transform: scale(1.05) rotate(-2deg);
  filter: drop-shadow(0 0 8px var(--cosmic-blue));
}

.copyright {
  text-align: center;
  font-size: 0.55rem;
  color: gray;
  line-height: 1.2;
}

.copyright p {
  margin: 0.1rem 0;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .cosmic-footer {
    padding: 0;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    left: 0;
    right: 0;
  }
  
  /* Hide desktop navigation on mobile */
  .desktop-nav-container {
    display: none;
  }
  
  /* Show accordion on mobile */
  .accordion-container {
    display: block;
    width: 100%;
    padding: 0.5rem;
    max-width: 100%;
  }
  
  .nav-row {
    flex-direction: column;
    align-items: center;
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
    gap: 1rem;
  }

  .accordion {
    width: 100%;
    max-width: 100%;
  }

  .accordion-content {
    max-height: 0; /* Collapsed by default on mobile */
  }
  
  .accordion-content[style*="200px"] {
    /* Maintain the spacing and padding when expanded */
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .accordion-header {
    justify-content: space-between;
    border-bottom: none;
  }
  
  .accordion-header h4 {
    text-align: left;
    width: auto;
    font-size: 1.2rem;
  }
  
  .accordion-header i {
    display: block;
  }

  /* On mobile, start with all sections collapsed */
  .accordion-content {
    max-height: 0 !important;
  }
  
  /* Override for expanded sections */
  .accordion-content[style*="200px"] {
    max-height: 300px !important;
  }

  .social-top-container {
    width: 100%;
    max-width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .social-top-row {
    padding: 1rem 0;
    width: 100%;
  }

  .language-row {
    padding: 0.75rem 0;
    width: 100%;
  }

  .copyright-container {
    padding: 1.5rem 0;
    width: 100%;
  }

  .social-icons-group {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
  
  .cosmic-social-icon {
    width: 3.5rem !important;
    height: 3.5rem !important;
  }
  
  .cosmic-social-icon img {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 480px) {
  .cosmic-footer {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .accordion-container {
    padding: 0;
    width: 100%;
  }

  .nav-row {
    max-width: 100%;
    padding: 0 0.5rem;
    width: 100%;
    gap: 0.5rem;
  }
  
  .social-top-row,
  .language-row,
  .copyright-container {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }
  
  .social-top-container {
    padding: 0 0.5rem;
  }

  .social-icons-group {
    gap: 0.5rem;
    width: 100%;
    justify-content: center;
  }
  
  .cosmic-social-icon {
    width: 3rem !important;
    height: 3rem !important;
  }
  
  .cosmic-social-icon img {
    width: 20px;
    height: 20px;
  }
  
  .link-list {
    padding: 0.5rem;
  }
  
  .link-list a {
    font-size: 1rem;
    padding: 0.6rem 0.75rem;
    min-height: 2.25rem;
  }
  
  .copyright-logo {
    width: 3.75rem;
  }
  
  .accordion-header h4 {
    font-size: 1rem;
  }
}

@media (max-width: 320px) {
  .social-icons-group {
    gap: 0.5rem;
  }
  
  .cosmic-social-icon {
    width: 2.5rem !important;
    height: 2.5rem !important;
  }
  
  .cosmic-social-icon img {
    width: 18px;
    height: 18px;
  }
}
</style>

