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
  <!-- Desktop Footer (hidden on mobile) -->
  <footer class="cosmic-footer desktop-footer">
    <div class="footer-cosmic-bg"></div>
    
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-main">
        <!-- Cosmicrafts Logo -->
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts Logo" />
          </div>
        </div>
        
        <!-- Navigation Links -->
        <div class="footer-nav">
          <h4 class="footer-heading">
            {{ t('footer.explore') }}
          </h4>
          <ul class="footer-links">
            <li><router-link to="/careers" class="footer-link">{{ t('footer.careers') }}</router-link></li>
            <li><router-link to="/about" class="footer-link">{{ t('footer.about') }}</router-link></li>
            <li><router-link to="/contact" class="footer-link">{{ t('footer.contact') }}</router-link></li>
          </ul>
        </div>
        
        <!-- Legal Links -->
        <div class="footer-legal-nav">
          <h4 class="footer-heading">{{ t('footer.legal') }}</h4>
          <ul class="footer-links">
            <li><router-link to="/privacy" class="footer-link">{{ t('footer.privacy') }}</router-link></li>
            <li><router-link to="/legal" class="footer-link">{{ t('footer.legal') }}</router-link></li>
            <li><router-link to="/terms" class="footer-link">{{ t('footer.terms') }}</router-link></li>
          </ul>
        </div>
        
        <!-- Social Media Section -->
        <div class="footer-social">
          <h4 class="footer-heading">{{ t('footer.stayConnected') }}</h4>
          <ul class="social-links">
            <li>
              <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="social-icon-link">
                <img src="@/assets/icons/discord.svg" alt="Discord" />
                <span class="social-hover-text">Discord</span>
              </a>
            </li>
            <li>
              <a href="https://twitter.com/CosmicraftsDAO" class="social-icon-link">
                <img src="@/assets/icons/x.svg" alt="Twitter" />
                <span class="social-hover-text">Twitter</span>
              </a>
            </li>
            <li>
              <a href="https://facebook.com/CosmicraftsDAO" class="social-icon-link">
                <img src="@/assets/icons/facebook.svg" alt="Facebook" />
                <span class="social-hover-text">Facebook</span>
              </a>
            </li>
            <li>
              <a href="https://dscvr.one/p/cosmicrafts" class="social-icon-link">
                <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
                <span class="social-hover-text">DSCVR</span>
              </a>
            </li>
            <li>
              <a href="https://distrikt.app/u/cosmicrafts" class="social-icon-link">
                <img src="@/assets/icons/distrikt.svg" alt="Distrikt" />
                <span class="social-hover-text">Distrikt</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="language-selector-container">
          <LanguageSelector />
        </div>
        
        <div class="copyright-container">
          <div class="copyright">
            <p>© {{ currentYear }} World of Unreal, LLC.<br>{{ t('footer.trademarks') }}</p>
          </div>
          <img src="@/assets/icons/wou.svg" alt="World of Unreal Logo" class="copyright-logo" />
        </div>
      </div>
    </div>
  </footer>

  <!-- Mobile Footer (hidden on desktop) -->
  <footer class="cosmic-footer mobile-footer">
    <div class="footer-cosmic-bg"></div>
    
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
          <h4>
            {{ t('footer.explore') }}
          </h4>
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
    
    <!-- Mobile Language Selector -->
    <div class="mobile-language-selector">
      <LanguageSelector />
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
  padding: 4rem 2rem 2rem;
  position: relative;
  background: linear-gradient(180deg, 
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.01) 100%);
  border-radius: 24px 24px 0 0;
  backdrop-filter: blur(10px);
}

.footer-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent,
    rgba(15, 185, 253, 0.5),
    transparent);
  filter: blur(1px);
}

.footer-main {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 3rem;
  position: relative;
}

/* Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.footer-logo {
  margin-bottom: 1.5rem;
}

.footer-logo img {
  width: 120px;
  height: auto;
  filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.4));
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-style: preserve-3d;
  transform: translateZ(0);
  animation: logoFloat 6s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0) translateZ(0) rotate(0); }
  50% { transform: translateY(-10px) translateZ(20px) rotate(-2deg); }
}

.footer-logo img:hover {
  transform: translateY(-10px) rotate(-5deg) translateZ(30px);
  filter: drop-shadow(0 0 40px rgba(15, 185, 253, 0.8));
}

/* Navigation Sections */
.footer-nav,
.footer-legal-nav {
  padding-top: 0.5rem;
}

.footer-heading {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    var(--color-primary-light) 50%,
    var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding-bottom: 0.75rem;
  text-shadow: 0 2px 10px rgba(15, 185, 253, 0.3);
  animation: gradientFlow 3s linear infinite;
  background-size: 200% auto;
}

@keyframes gradientFlow {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.footer-heading::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 50%,
    transparent 100%);
  border-radius: 2px;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  animation: lineGlow 3s ease-in-out infinite;
}

@keyframes lineGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(15, 185, 253, 0.5); }
  50% { box-shadow: 0 0 30px rgba(15, 185, 253, 0.8); }
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 1rem;
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  padding-left: 0;
  display: inline-block;
  font-size: 1rem;
}

.footer-link::before {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background: linear-gradient(90deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
  opacity: 0;
}

.footer-link:hover {
  color: var(--color-primary);
  transform: translateX(5px);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.footer-link:hover::before {
  width: 100%;
  opacity: 1;
}

/* Social Media Section */
.footer-social {
  padding-top: 0.5rem;
}

.social-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.social-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 14px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
}

.social-icon-link img {
  width: 24px;
  height: 24px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform: translateZ(20px);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.4));
}

.social-icon-link:hover {
  transform: translateY(-5px) scale(1.1) translateZ(20px);
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 10px 30px rgba(15, 185, 253, 0.2),
    0 0 0 1px rgba(15, 185, 253, 0.2) inset;
}

.social-icon-link:hover img {
  transform: scale(1.2) translateZ(30px);
  filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.6));
}

.social-hover-text {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  white-space: nowrap;
  color: var(--color-primary);
  font-size: 0.75rem;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  position: relative;
}

.footer-bottom::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(15, 185, 253, 0.5) 50%,
    transparent 100%);
  filter: blur(1px);
}

.language-selector-container {
  display: flex;
  align-items: center;
}

.copyright-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.copyright-logo {
  width: 80px;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4));
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform: translateZ(0);
  animation: logoGlow 4s ease-in-out infinite;
}

@keyframes logoGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4)); }
  50% { filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.7)); }
}

.copyright-logo:hover {
  transform: scale(1.1) translateZ(20px);
  filter: drop-shadow(0 0 40px rgba(15, 185, 253, 0.8));
}

.copyright {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  gap: 1rem;
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
}

.mobile-social-icon img {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.4));
  transition: all 0.3s ease;
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
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
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
  width: 70px;
  margin-bottom: 1.5rem;
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
@media (max-width: 1200px) {
  .footer-container {
    padding: 0 1.5rem;
  }
  
  .footer-main {
    gap: 2rem;
  }
}

@media (max-width: 992px) {
  .footer-main {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem 2rem;
  }

  .footer-brand {
    grid-column: 1 / -1;
    align-items: center;
  }

  .footer-social {
    grid-column: 1 / -1;
  }

  .social-links {
    grid-template-columns: repeat(5, 1fr);
    justify-items: center;
  }
}

@media (max-width: 768px) {
  .desktop-footer {
    display: none;
  }
  
  .mobile-footer {
    display: block;
  }
}
</style>
