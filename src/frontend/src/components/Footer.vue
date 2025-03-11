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
        <h4 class="social-top-title cosmic-text-glow">{{ t('footer.stayConnected') }}</h4>
        <div class="social-icons-group">
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="cosmic-social-icon">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://twitter.com/CosmicraftsDAO" class="cosmic-social-icon">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://facebook.com/CosmicraftsDAO" class="cosmic-social-icon">
            <img src="@/assets/icons/facebook.svg" alt="Facebook" />
          </a>
          <a href="https://dscvr.one/p/cosmicrafts" class="cosmic-social-icon">
            <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
          </a>
          <a href="https://distrikt.app/u/cosmicrafts" class="cosmic-social-icon">
            <img src="@/assets/icons/distrikt.svg" alt="Distrikt" />
          </a>
        </div>
      </div>
    </div>

    <div class="footer-container">
      <!-- Main Content -->
      <div class="footer-sections">
        <!-- Navigation Sections -->
        <div class="footer-nav-sections">
          <div class="footer-nav-group">
            <h4 class="nav-title cosmic-text-glow">{{ t('footer.explore') }}</h4>
            <ul class="nav-list">
              <li><router-link to="/careers" class="cosmic-nav-link">{{ t('footer.careers') }}</router-link></li>
              <li><router-link to="/about" class="cosmic-nav-link">{{ t('footer.about') }}</router-link></li>
              <li><router-link to="/contact" class="cosmic-nav-link">{{ t('footer.support') }}</router-link></li>
            </ul>
          </div>

          <div class="footer-nav-group">
            <h4 class="nav-title cosmic-text-glow">{{ t('footer.legal') }}</h4>
            <ul class="nav-list">
              <li><router-link to="/privacy" class="cosmic-nav-link">{{ t('footer.privacy') }}</router-link></li>
              <li><router-link to="/legal" class="cosmic-nav-link">{{ t('footer.legal') }}</router-link></li>
              <li><router-link to="/terms" class="cosmic-nav-link">{{ t('footer.terms') }}</router-link></li>
            </ul>
          </div>
        </div>
        
        <!-- Language Selector below navigation -->
        <div class="language-below-section">
          <LanguageSelector context="footer" />
        </div>
      </div>
      
      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <img src="@/assets/icons/wou.svg" alt="World of Unreal" class="wou-logo cosmic-float" />
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
    
    <!-- Mobile Footer Social Bar - Kept at the top -->
    <div class="mobile-social-bar">
      <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="cosmic-social-icon mobile-social-icon">
        <img src="@/assets/icons/discord.svg" alt="Discord" />
      </a>
      <a href="https://twitter.com/CosmicraftsDAO" class="cosmic-social-icon mobile-social-icon">
        <img src="@/assets/icons/x.svg" alt="Twitter" />
      </a>
      <a href="https://facebook.com/CosmicraftsDAO" class="cosmic-social-icon mobile-social-icon">
        <img src="@/assets/icons/facebook.svg" alt="Facebook" />
      </a>
      <a href="https://dscvr.one/p/cosmicrafts" class="cosmic-social-icon mobile-social-icon">
        <img src="@/assets/icons/dscvr.svg" alt="DSCVR" />
      </a>
      <a href="https://distrikt.app/u/cosmicrafts" class="cosmic-social-icon mobile-social-icon">
        <img src="@/assets/icons/distrikt.svg" alt="Distrikt" />
      </a>
    </div>
    
    <!-- Mobile Footer Accordions -->
    <div class="mobile-accordion-container">
      <!-- Explore Section -->
      <div class="mobile-accordion cosmic-panel">
        <div 
          class="mobile-accordion-header" 
          :class="{ 'active': expandedSection === 'explore' }"
          @click="toggleSection('explore')"
        >
          <h4 class="cosmic-text-glow">{{ t('footer.explore') }}</h4>
          <i class="fas" :class="expandedSection === 'explore' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        <div class="mobile-accordion-content" :class="{ 'expanded': expandedSection === 'explore' }">
          <ul class="mobile-link-list">
            <li><router-link to="/careers" class="cosmic-nav-link">{{ t('footer.careers') }}</router-link></li>
            <li><router-link to="/about" class="cosmic-nav-link">{{ t('footer.about') }}</router-link></li>
            <li><router-link to="/contact" class="cosmic-nav-link">{{ t('footer.contact') }}</router-link></li>
          </ul>
        </div>
      </div>
      
      <!-- Legal Section -->
      <div class="mobile-accordion cosmic-panel">
        <div 
          class="mobile-accordion-header" 
          :class="{ 'active': expandedSection === 'legal' }"
          @click="toggleSection('legal')"
        >
          <h4 class="cosmic-text-glow">{{ t('footer.legal') }}</h4>
          <i class="fas" :class="expandedSection === 'legal' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </div>
        <div class="mobile-accordion-content" :class="{ 'expanded': expandedSection === 'legal' }">
          <ul class="mobile-link-list">
            <li><router-link to="/privacy" class="cosmic-nav-link">{{ t('footer.privacy') }}</router-link></li>
            <li><router-link to="/legal" class="cosmic-nav-link">{{ t('footer.legal') }}</router-link></li>
            <li><router-link to="/terms" class="cosmic-nav-link">{{ t('footer.terms') }}</router-link></li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Language Selector Row - Moved to after menus -->
    <div class="language-row">
      <LanguageSelector context="footer" />
    </div>
    
    <!-- Mobile Footer Copyright with Logo -->
    <div class="mobile-copyright-container">
      <img src="@/assets/icons/wou.svg" alt="World of Unreal Logo" class="mobile-copyright-logo cosmic-float" />
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
  color: var(--cosmic-text-primary);
  overflow: hidden;
  background: linear-gradient(180deg, 
    rgba(8, 9, 12, 0.98) 0%, 
    rgba(15, 25, 45, 0.98) 100%);
  border-top: 2px solid rgba(15, 185, 253, 0.2);
  backdrop-filter: var(--cosmic-glass-blur);
  text-align: center; /* Center all text */
}

.footer-cosmic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(15, 185, 253, 0.05) 0%, transparent 70%);
  opacity: 0.5;
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
  background: rgba(15, 185, 253, 0.03);
  opacity: 0.3;
}

/* Desktop Footer Styles */
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 1rem; /* Reduced padding */
}

/* New Footer Layout - Centered */
.footer-sections {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  position: relative;
}

.footer-nav-sections {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6rem; /* Increased gap between nav groups */
  padding: 0;
  margin-bottom: 2rem;
}

/* Language Below Section */
.language-below-section {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

/* Navigation Groups */
.footer-nav-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem; /* Increased gap */
}

.nav-title {
  font-size: 1rem; /* MUCH larger font size */
  font-weight: 700;
  color: var(--cosmic-blue);
  position: relative;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4rem;
  height: 3px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--cosmic-blue) 50%,
    transparent 100%);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin-top: -1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .25rem; /* Increased gap */
}

.nav-list a {
  color: var(--cosmic-text-secondary);
  text-decoration: none;
  transition: all var(--cosmic-transition-fast);
  display: inline-block;
  font-size: 1rem; /* MUCH larger font size */
  padding: .5rem 8rem;
  border-radius: var(--cosmic-radius-md);
  font-weight: 500;
}

.nav-list a:hover {
  color: var(--cosmic-blue);
  transform: translateY(-3px);
  text-shadow: var(--cosmic-glow-blue-sm);
  background: rgba(15, 185, 253, 0.05);
  box-shadow: var(--cosmic-shadow-sm);
  font-weight: 600;
}

/* Social Top Row (New) */
.social-top-row {
  display: flex;
  justify-content: center;
  padding: 1rem; /* Increased padding */
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
  font-size: 1rem; /* Larger font size */
  font-weight: 700;
  color: var(--cosmic-blue);
  margin: 0;
  text-shadow: var(--cosmic-glow-blue-sm);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.social-icons-group {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Footer Bottom */
.desktop-footer .footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  position: relative;
}

.wou-logo {
  width: 80px; /* Larger logo */
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
  transition: all var(--cosmic-transition-medium);
}

.wou-logo:hover {
  filter: drop-shadow(var(--cosmic-glow-blue-md));
  transform: scale(1.1);
}

.copyright-text {
  font-size: 0.9rem; /* Slightly larger */
  color: var(--cosmic-text-tertiary);
  text-align: center;
  line-height: 1.6;
}

/* Language Row Styles */
.language-row {
  display: flex;
  justify-content: center;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.05);
  border-top: 1px solid rgba(15, 185, 253, 0.1);
  margin-top: 0.5rem;
}

/* Responsive Breakpoints for Desktop */
@media (max-width: 1200px) {
  .desktop-footer .footer-container {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .footer-nav-sections {
    gap: 4rem; /* Reduced gap on smaller screens */
  }
}

@media (max-width: 992px) {
  .nav-title {
    font-size: 1.25rem; /* Slightly smaller on medium screens */
  }
  
  .nav-list a {
    font-size: 1.25rem; /* Slightly smaller on medium screens */
  }
}

/* Mobile Footer Styles */
.mobile-footer {
  display: none;
  padding: 1.5rem 0 1rem;
  position: relative;
  z-index: 1;
}

.mobile-social-bar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}

.mobile-social-icon {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1;
}

/* Media query adjustments */
@media (max-width: 400px) {
  .mobile-social-bar {
    gap: 0.5rem;
    padding: 0 1rem;
  }
  
  .mobile-social-icon img {
    width: 20px;
    height: 20px;
  }
}

.mobile-accordion-container {
  margin: 0 1rem 1rem;
}

.mobile-accordion {
  margin-bottom: 0.75rem;
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.mobile-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem; /* Increased padding */
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
}

.mobile-accordion-header h4 {
  margin: 0;
  font-size: 1.6rem; /* MUCH larger font size */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.mobile-accordion-header i {
  color: var(--cosmic-blue);
  transition: transform var(--cosmic-transition-fast);
  font-size: 1.2rem; /* Larger icon */
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
  max-height: 300px; /* Increased max height for larger text */
}

.mobile-link-list {
  list-style: none;
  padding: 0.5rem 1.25rem 1.25rem;
  margin: 0;
  text-align: center; /* Center mobile links */
}

.mobile-link-list li {
  margin-bottom: 0.75rem; /* Increased margin */
}

.mobile-link-list a {
  color: var(--cosmic-text-secondary);
  text-decoration: none;
  font-size: 1.4rem; /* MUCH larger font size */
  display: block;
  padding: 0.75rem 0;
  transition: all var(--cosmic-transition-fast);
  font-weight: 500;
}

.mobile-link-list a:hover, .mobile-link-list a:active {
  color: var(--cosmic-blue);
  transform: translateY(-3px);
  text-shadow: var(--cosmic-glow-blue-sm);
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
  width: 72px; /* Larger logo */
  margin-bottom: .5rem;
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
}

.mobile-copyright {
  text-align: center;
  font-size: 0.8rem; /* Slightly larger */
  color: var(--cosmic-text-tertiary);
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
  padding: 1.5rem 1.5rem 1rem;
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
  gap: 0.75rem;
}

.copyright-logo,
.mobile-copyright-logo {
  width: 72px;
  margin-bottom: 0.75rem;
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
  transition: all var(--cosmic-transition-medium);
}

.copyright-logo:hover,
.mobile-copyright-logo:hover {
  filter: drop-shadow(var(--cosmic-glow-blue-md));
  transform: scale(1.1);
}

.copyright,
.mobile-copyright {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  line-height: 1.5;
}

/* Additional hover effects for all interactive elements */
a, button {
  position: relative;
  z-index: 1;
}

a::before, button::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 185, 253, 0);
  border-radius: inherit;
  transition: all var(--cosmic-transition-fast);
}

a:hover::before, button:hover::before {
  background: rgba(15, 185, 253, 0.05);
  box-shadow: var(--cosmic-glow-blue-sm);
}
</style>
