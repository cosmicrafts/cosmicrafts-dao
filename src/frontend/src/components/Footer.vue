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
            <li><a href="#" class="footer-link">{{ t('footer.support') }}</a></li>
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
              <a href="#" class="social-icon-link">
                <img src="@/assets/icons/discord.svg" alt="Discord" />
                <span class="social-hover-text">Discord</span>
              </a>
            </li>
            <li>
              <a href="#" class="social-icon-link">
                <img src="@/assets/icons/x.svg" alt="Twitter" />
                <span class="social-hover-text">Twitter</span>
              </a>
            </li>
            <li>
              <a href="#" class="social-icon-link">
                <img src="@/assets/icons/facebook.svg" alt="Facebook" />
                <span class="social-hover-text">Facebook</span>
              </a>
            </li>
            <li>
              <a href="#" class="social-icon-link">
                <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
                <span class="social-hover-text">DSCVR</span>
              </a>
            </li>
            <li>
              <a href="#" class="social-icon-link">
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
      <a href="#" class="mobile-social-icon">
        <img src="@/assets/icons/discord.svg" alt="Discord" />
      </a>
      <a href="#" class="mobile-social-icon">
        <img src="@/assets/icons/x.svg" alt="Twitter" />
      </a>
      <a href="#" class="mobile-social-icon">
        <img src="@/assets/icons/facebook.svg" alt="Facebook" />
      </a>
      <a href="#" class="mobile-social-icon">
        <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
      </a>
      <a href="#" class="mobile-social-icon">
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
            <li><a href="#">{{ t('footer.support') }}</a></li>
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
  background: linear-gradient(to bottom, rgba(13, 25, 42, 0.7), rgba(8, 15, 30, 0.9));
  border-top: 1px solid rgba(15, 185, 253, 0.15);
}

.footer-cosmic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><path d="M29 28.5a2 2 0 1 1 2 2 2 2 0 0 1-2-2zm-10 10a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm20-5a1.5 1.5 0 1 1 1.5 1.5 1.5 1.5 0 0 1-1.5-1.5zM35 48a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm-10-30a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm-8 15a1.5 1.5 0 1 1 1.5 1.5 1.5 1.5 0 0 1-1.5-1.5z" fill="%230FB9FD" fill-opacity="0.07"/></svg>');
  opacity: 0.5;
  z-index: -1;
}

/* Desktop Footer Styles */
.desktop-footer {
  padding: 4rem 0 2rem;
  display: block;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-main {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.footer-logo img {
  width: 90px;
  height: auto;
  filter: drop-shadow(0 0 12px rgba(15, 185, 253, 0.6));
  transition: all 0.3s ease;
}

.footer-logo img:hover {
  transform: scale(1.05) rotate(-2deg);
  filter: drop-shadow(0 0 18px rgba(15, 185, 253, 0.7));
}

/* Navigation Sections */
.footer-heading {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1.25rem;
  color: var(--color-primary);
  position: relative;
  padding-bottom: 0.75rem;
}

.footer-heading::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 2rem;
  height: 2px;
  background: linear-gradient(to right, var(--color-primary), transparent);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  padding-left: 0;
  display: inline-block;
}

.footer-link::before {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: var(--color-primary);
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--color-primary);
  padding-left: 5px;
}

.footer-link:hover::before {
  width: 100%;
}

/* Social Media Section */
.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.social-icon-link {
  display: flex;
  align-items: center;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--radius-medium);
  padding: 0.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.social-icon-link img {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
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
  transition: all 0.3s ease;
  pointer-events: none;
}

.social-icon-link:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.15);
}

.social-icon-link:hover img {
  transform: scale(1.2);
}

.social-icon-link:hover .social-hover-text {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

.language-selector-container {
  display: flex;
  align-items: center;
}

.copyright-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.copyright-logo {
  width: 72px;
  filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.5));
  margin-top: 0.75rem;
}

.copyright {
  text-align: right;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

/* Mobile Footer Styles */
.mobile-footer {
  display: none;
  padding: 2rem 0 1rem;
}

.mobile-social-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 1.5rem;
}

.mobile-social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.mobile-social-icon img {
  width: 20px;
  height: 20px;
}

.mobile-social-icon:active {
  transform: scale(0.95);
  background: rgba(15, 185, 253, 0.15);
}

.mobile-accordion-container {
  margin-bottom: 1.5rem;
}

.mobile-accordion {
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.mobile-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.mobile-accordion-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 600;
}

.mobile-accordion-header i {
  color: var(--color-primary);
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.mobile-accordion-header.active {
  background: rgba(15, 185, 253, 0.05);
}

.mobile-accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-accordion-content.expanded {
  max-height: 200px;
}

.mobile-link-list {
  list-style: none;
  padding: 0 1.5rem 1rem;
  margin: 0;
}

.mobile-link-list li {
  margin-bottom: 0.75rem;
}

.mobile-link-list a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  display: block;
  padding: 0.5rem 0;
  position: relative;
  padding-left: 1rem;
}

.mobile-link-list a::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.mobile-language-selector {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.mobile-copyright-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

.mobile-copyright-logo {
  width: 64px;
  height: 64;
  margin-bottom: 0.25rem;
  filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.5));
}

.mobile-copyright {
  text-align: center;
  font-size: 0.65rem;
  color: var(--color-text-tertiary);
}

.mobile-copyright p {
  margin: 0.25rem 0;
}

/* Responsive Switches */
@media (max-width: 992px) {
  .desktop-footer .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .desktop-footer .footer-brand, 
  .desktop-footer .footer-social {
    grid-column: span 2;
  }
}

@media (max-width: 1024px) {
  .desktop-footer {
    display: none;
  }
  
  .mobile-footer {
    display: block;
  }
}
</style>
