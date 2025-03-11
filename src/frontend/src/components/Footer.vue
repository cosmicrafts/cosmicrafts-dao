<script setup>
import { useI18n } from 'vue-i18n';
import { useLanguageStore } from '@/stores/language'; // Import languageStore
import LanguageSelector from '@/components/LanguageSelector.vue';
import { ref } from 'vue';

// Access languageStore and i18n
const languageStore = useLanguageStore();
const { t } = useI18n();

// Get current year for copyright
const currentYear = new Date().getFullYear();

// Mobile accordion state
const expandedSection = ref(null);

const toggleSection = (section) => {
  expandedSection.value = expandedSection.value === section ? null : section;
};
</script>

<template>
  <!-- Desktop Footer (New Design) -->
  <footer class="cosmic-footer desktop-footer">
    <div class="footer-cosmic-bg"></div>
    
    <!-- Social Buttons Row (Now at the top) -->
    <div class="social-top-row">
      <div class="social-top-container">
        <h4 class="social-top-title">{{ t('footer.stayConnected') }}</h4>
        <div class="social-icons-group">
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="social-top-icon">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://twitter.com/CosmicraftsDAO" class="social-top-icon">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://facebook.com/CosmicraftsDAO" class="social-top-icon">
            <img src="@/assets/icons/facebook.svg" alt="Facebook" />
          </a>
          <a href="https://dscvr.one/p/cosmicrafts" class="social-top-icon">
            <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
          </a>
          <a href="https://distrikt.app/u/cosmicrafts" class="social-top-icon">
            <img src="@/assets/icons/distrikt.svg" alt="Distrikt" />
          </a>
        </div>
      </div>
    </div>

    <div class="footer-container">
      <!-- Main Content -->
      <div class="footer-sections">
        <!-- Logo Section -->
        <div class="footer-logo-section">
          <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts" class="footer-logo" />
        </div>
        
        <!-- Navigation Sections -->
        <div class="footer-nav-sections">
          <div class="footer-nav-group">
            <h4 class="nav-title">{{ t('footer.explore') }}</h4>
            <ul class="nav-list">
              <li><router-link to="/careers">{{ t('footer.careers') }}</router-link></li>
              <li><router-link to="/about">{{ t('footer.about') }}</router-link></li>
              <li><router-link to="/contact">{{ t('footer.contact') }}</router-link></li>
            </ul>
          </div>

          <div class="footer-nav-group">
            <h4 class="nav-title">{{ t('footer.legal') }}</h4>
            <ul class="nav-list">
              <li><router-link to="/privacy">{{ t('footer.privacy') }}</router-link></li>
              <li><router-link to="/legal">{{ t('footer.legal') }}</router-link></li>
              <li><router-link to="/terms">{{ t('footer.terms') }}</router-link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Footer Bottom with Language Selector -->
      <div class="footer-bottom">
        <!-- Language Selector now in the bottom section -->
        <div class="language-bottom-section">
          <LanguageSelector context="footer" />
        </div>
        
        <img src="@/assets/icons/wou.svg" alt="World of Unreal" class="wou-logo" />
        <p class="copyright-text">
          © {{ currentYear }} World of Unreal, LLC.<br>
          {{ t('footer.trademarks') }}
        </p>
      </div>
    </div>
  </footer>

  <!-- Mobile Footer -->
  <footer class="cosmic-footer mobile-footer">
    <div class="footer-cosmic-bg"></div>
    
    <!-- Language Selector Row -->
    <div class="language-row">
      <LanguageSelector context="footer" />
    </div>
    
    <!-- Mobile Footer Social Bar -->
    <div class="mobile-social-bar">
      <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="mobile-social-icon">
        <img src="@/assets/icons/discord.svg" alt="Discord" />
      </a>
      <a href="https://twitter.com/CosmicraftsDAO" class="mobile-social-icon">
        <img src="@/assets/icons/x.svg" alt="Twitter" />
      </a>
      <a href="https://facebook.com/CosmicraftsDAO" class="mobile-social-icon">
        <img src="@/assets/icons/facebook.svg" alt="Facebook" />
      </a>
      <a href="https://dscvr.one/p/cosmicrafts" class="mobile-social-icon">
        <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
      </a>
      <a href="https://distrikt.app/u/cosmicrafts" class="mobile-social-icon">
        <img src="@/assets/icons/distrikt.svg" alt="Distrikt" />
      </a>
    </div>
    
    <!-- Mobile Footer Accordions -->
    <div class="mobile-accordion-container">
      <!-- Explore Section -->
      <div class="mobile-accordion">
        <div 
          class="mobile-accordion-header" 
          :class="{ 'active': expandedSection === 'explore' }"
          @click="toggleSection('explore')"
        >
          <h4>{{ t('footer.explore') }}</h4>
          <i class="fas" :class="expandedSection === 'explore' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        <div class="mobile-accordion-content" :class="{ 'expanded': expandedSection === 'explore' }">
          <ul class="mobile-link-list">
            <li><router-link to="/careers">{{ t('footer.careers') }}</router-link></li>
            <li><router-link to="/about">{{ t('footer.about') }}</router-link></li>
            <li><router-link to="/contact">{{ t('footer.contact') }}</router-link></li>
          </ul>
        </div>
      </div>
      
      <!-- Legal Section -->
      <div class="mobile-accordion">
        <div 
          class="mobile-accordion-header" 
          :class="{ 'active': expandedSection === 'legal' }"
          @click="toggleSection('legal')"
        >
          <h4>{{ t('footer.legal') }}</h4>
          <i class="fas" :class="expandedSection === 'legal' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        <div class="mobile-accordion-content" :class="{ 'expanded': expandedSection === 'legal' }">
          <ul class="mobile-link-list">
            <li><router-link to="/privacy">{{ t('footer.privacy') }}</router-link></li>
            <li><router-link to="/legal">{{ t('footer.legal') }}</router-link></li>
            <li><router-link to="/terms">{{ t('footer.terms') }}</router-link></li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Mobile Footer Copyright with Logo -->
    <div class="mobile-copyright-container">
      <img src="@/assets/icons/wou.svg" alt="World of Unreal Logo" class="mobile-copyright-logo" />
      <div class="mobile-copyright">
        <p>© {{ currentYear }} World of Unreal, LLC.</p>
        <p>{{ t('footer.trademarks') }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Main Footer Styles (Shared) */
.cosmic-footer {
  position: relative;
  color: var(--color-text-primary);
  overflow: hidden;
  background: linear-gradient(180deg, 
    rgba(8, 9, 12, 0.98) 0%, 
    rgba(15, 25, 45, 0.98) 100%);
  border-top: 2px solid rgba(15, 185, 253, 0.2);
  backdrop-filter: blur(20px);
}

.footer-cosmic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(15, 185, 253, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(15, 185, 253, 0.1) 0%, transparent 50%);
  opacity: 0.8;
  z-index: 0;
  pointer-events: none;
  animation: cosmicPulse 8s infinite ease-in-out;
}

@keyframes cosmicPulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.footer-cosmic-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, transparent 0%, rgba(15, 185, 253, 0.1) 25%, transparent 50%),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><path d="M29 28.5a2 2 0 1 1 2 2 2 2 0 0 1-2-2zm-10 10a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm20-5a1.5 1.5 0 1 1 1.5 1.5 1.5 1.5 0 0 1-1.5-1.5zM35 48a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm-10-30a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm-8 15a1.5 1.5 0 1 1 1.5 1.5 1.5 1.5 0 0 1-1.5-1.5z" fill="%230FB9FD" fill-opacity="0.15"/></svg>');
  opacity: 0.5;
  animation: cosmicScan 15s linear infinite;
}

@keyframes cosmicScan {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}

/* Desktop Footer Styles */
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem 1rem;
}

/* New Footer Layout */
.footer-sections {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0; /* Remove margin between sections and bottom */
  position: relative;
}

.footer-logo-section {
  flex: 0 0 25%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-logo {
  width: 160px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4));
  transition: all 0.4s var(--cosmic-bounce);
}

.footer-logo:hover {
  filter: drop-shadow(0 0 40px rgba(15, 185, 253, 0.8));
  transform: translateY(-5px);
}

.footer-nav-sections {
  flex: 0 0 50%;
  display: flex;
  justify-content: space-around;
  padding: 0 2rem;
}

/* Navigation Groups */
.footer-nav-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
  position: relative;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.nav-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2.5rem;
  height: 2px;
  background: linear-gradient(90deg,
    var(--color-primary) 0%,
    transparent 100%);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nav-list a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.3s var(--cosmic-bounce);
  display: inline-block;
  font-size: 1rem;
  padding: 0.25rem 0;
}

.nav-list a:hover {
  color: var(--color-primary);
  transform: translateX(5px);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.4);
}

/* Social Top Row (New) */
.social-top-row {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.social-top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.social-top-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.social-icons-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.social-top-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s var(--cosmic-bounce);
  transform-style: preserve-3d;
}

.social-top-icon img {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.4));
  transition: all 0.4s var(--cosmic-bounce);
  transform: translateZ(20px);
}

.social-top-icon:hover {
  transform: translateY(-5px) scale(1.05) translateZ(20px);
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 10px 30px rgba(15, 185, 253, 0.2),
    0 0 0 1px rgba(15, 185, 253, 0.2) inset;
}

.social-top-icon:hover img {
  transform: scale(1.2) translateZ(30px);
  filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.6));
}

/* Add language bottom section styles */
.language-bottom-section {
  margin-bottom: 1.5rem;
}

/* Footer Bottom */
.desktop-footer .footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  margin-top: 2rem; /* Add margin to create separation */
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  position: relative;
}

.wou-logo {
  width: 72px;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4));
  transition: all 0.3s var(--cosmic-bounce);
}

.wou-logo:hover {
  filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.7));
  transform: scale(1.1);
}

.copyright-text {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  text-align: center;
  line-height: 1.6;
}

/* Language Row Styles */
.language-row {
  display: flex;
  justify-content: center;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

/* Responsive Breakpoints for Desktop */
@media (max-width: 1200px) {
  .desktop-footer .footer-container {
    padding: 2.5rem 1.5rem 2rem;
  }
  
  .footer-nav-sections {
    padding: 0 1rem;
  }
}

@media (max-width: 992px) {
  .footer-sections {
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
  }
  
  .footer-logo-section {
    flex: initial;
  }
  
  .footer-nav-sections {
    flex: initial;
    width: 100%;
    justify-content: space-around;
  }
  
  .footer-social-section {
    margin-top: 1rem;
  }
  
  .nav-title {
    text-align: center;
  }
  
  .nav-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .nav-list {
    align-items: center;
  }
}

/* Mobile Footer Styles */
.mobile-footer {
  display: none;
  padding: 2rem 0 1rem;
  position: relative;
  z-index: 1;
}

.mobile-social-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.mobile-social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s var(--cosmic-bounce);
  transform-style: preserve-3d;
}

.mobile-social-icon img {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.4));
  transition: all 0.4s var(--cosmic-bounce);
  transform: translateZ(20px);
}

.mobile-social-icon:active {
  transform: scale(0.95);
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.4);
}

/* Add desktop animations to mobile */
.mobile-social-icon:hover {
  transform: translateY(-5px) scale(1.05) translateZ(20px);
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 10px 30px rgba(15, 185, 253, 0.2),
    0 0 0 1px rgba(15, 185, 253, 0.2) inset;
}

.mobile-social-icon:hover img {
  transform: scale(1.2) translateZ(30px);
  filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.6));
}

/* Media query adjustments */
@media (max-width: 400px) {
  .mobile-social-bar {
    gap: 0.5rem;
    padding: 0 1rem;
  }
  
  .mobile-social-icon img {
    width: 18px;
    height: 18px;
  }
}

.mobile-accordion-container {
  margin: 0 1rem 1.5rem;
}

.mobile-accordion {
  margin-bottom: 1rem;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.mobile-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-accordion-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mobile-accordion-header i {
  color: var(--color-primary);
  transition: transform 0.3s ease;
}

.mobile-accordion-header.active {
  background: rgba(15, 185, 253, 0.1);
}

.mobile-accordion-header.active i {
  transform: rotate(180deg);
}

.mobile-accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.mobile-accordion-content.expanded {
  max-height: 200px;
}

.mobile-link-list {
  list-style: none;
  padding: 0.5rem 1.25rem 1.25rem;
  margin: 0;
}

.mobile-link-list li {
  margin-bottom: 0.75rem;
}

.mobile-link-list a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 1rem;
  display: block;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.mobile-language-selector {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.mobile-copyright-container {
  background: linear-gradient(180deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.05) 100%);
  padding: 4rem 1.5rem;
  position: relative;
  text-align: center;
}

.mobile-copyright-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(15, 185, 253, 0.3) 50%,
    transparent 100%);
  filter: blur(1px);
}

.mobile-copyright-logo {
  width: 64px;
  margin-bottom: .25rem;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4));
  animation: mobileLogoGlow 4s ease-in-out infinite;
}

@keyframes mobileLogoGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4)); }
  50% { filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.7)); }
}

.mobile-copyright {
  text-align: center;
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mobile-copyright p {
  margin: 0.35rem 0;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .desktop-footer {
    display: none;
  }
  
  .mobile-footer {
    display: block;
  }
}

/* Footer Bottom Styles - Consistent between desktop and mobile */
.footer-bottom,
.mobile-copyright-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem 1rem;
  background: linear-gradient(180deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.05) 100%);
  margin-top: 0;
}

.copyright-container,
.mobile-copyright-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.copyright-logo,
.mobile-copyright-logo {
  width: 64px;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4));
  transition: all 0.3s var(--cosmic-bounce);
}

.copyright-logo:hover,
.mobile-copyright-logo:hover {
  filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.7));
  transform: scale(1.1);
}

.copyright,
.mobile-copyright {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  line-height: 1.5;
}
</style>
