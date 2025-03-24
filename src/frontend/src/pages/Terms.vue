<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="cosmic-page-container terms-container">
      <h1 class="title-large text-gradient animated-title">{{ $t('footer.terms') }}</h1>
      
      <!-- Terms Overview Section -->
      <div class="cosmic-card terms-overview">
        <h2 class="overview-title">
          <i class="fas fa-file-signature"></i> Understanding Our Terms
        </h2>
        
        <div class="overview-content">
          <div class="overview-section">
            <h3><i class="fas fa-check-circle"></i> Accepting the Terms</h3>
            <p>
              By creating an account, downloading, or using any Cosmicrafts service, you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not access or use our services. Please read this document carefully.
            </p>
          </div>
          
          <div class="overview-section">
            <h3><i class="fas fa-exclamation-triangle"></i> Important Considerations</h3>
            <p>
              Our Terms of Service contain important information about your legal rights and obligations. Key sections include:
            </p>
            <ul class="important-list">
              <li>Rules of conduct and account usage</li>
              <li>License limitations and restrictions</li>
              <li>User-generated content policies</li>
              <li>Payment terms and refund policies</li>
              <li>Termination and suspension conditions</li>
            </ul>
          </div>
          
          <div class="overview-section">
            <h3><i class="fas fa-sync-alt"></i> Changes to Terms</h3>
            <p>
              Cosmicrafts may update these Terms of Service from time to time to reflect changes in our services, business practices, or legal requirements. We will notify users of material changes through in-game notifications, emails, or site announcements. Continued use of our services after such updates constitutes acceptance of the revised terms.
            </p>
            <p>
              For questions about our Terms of Service, please contact <a href="mailto:terms@cosmicrafts.com" class="text-link">terms@cosmicrafts.com</a>.
            </p>
          </div>
          
          <!-- Cross-references to Related Policies -->
          <div class="overview-section related-policies">
            <h3><i class="fas fa-link"></i> Related Policies</h3>
            <p>
              These Terms of Service should be read in conjunction with our other policies:
            </p>
            <div class="policy-links">
              <router-link to="/privacy" class="policy-link">
                <i class="fas fa-shield-alt"></i>
                <span>
                  <strong>Privacy Policy</strong>
                  <small>How we collect, use and protect your data</small>
                </span>
              </router-link>
              
              <router-link to="/legal" class="policy-link">
                <i class="fas fa-balance-scale"></i>
                <span>
                  <strong>Legal Information</strong>
                  <small>Additional legal frameworks and jurisdictional information</small>
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Terms Content -->
      <div class="cosmic-card terms-content">
        <h2 class="terms-policy-title">Terms of Service</h2>
        <div class="last-updated">Last Updated: March 4, 2023</div>
        
        <MarkdownRenderer 
          fileName="terms" 
          @rendered="onRendered"
          @navigateToSection="scrollToSection"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import MarkdownRenderer from '@/components/core/MarkdownRenderer.vue';

// Track if markdown has been rendered
const isRendered = ref(false);

// Handle when markdown is rendered
const onRendered = () => {
  isRendered.value = true;
  
  // Check if there's a hash in the URL to scroll to a specific section
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1);
    scrollToSection(sectionId);
  }
};

// Scroll to a specific section
const scrollToSection = (sectionId) => {
  if (!sectionId) return;
  
  // For nested section references (format: section#heading)
  const parts = sectionId.split('#');
  const targetId = parts.length > 1 ? parts[1] : sectionId;
  
  // Find the heading element by ID
  const element = document.getElementById(targetId);
  if (element) {
    const headerOffset = 140; // Fixed header height (approximately)
    
    // Calculate the target position
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    // Smooth scroll to the element
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    // Highlight the section briefly
    element.classList.add('highlight-section');
    setTimeout(() => {
      element.classList.remove('highlight-section');
    }, 1500);
  }
};
</script>

<style scoped>
.cosmic-page-bg {
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

.terms-container {
  padding-top: 4.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.animated-title {
  text-align: center;
  animation: fadeInDown 1s ease-out;
  margin-bottom: 2rem;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Terms Overview Section */
.terms-overview {
  margin-bottom: 3rem;
  padding: 2rem 3rem;
  border-left: 4px solid var(--color-info);
  background: linear-gradient(to right, rgba(15, 185, 253, 0.08), rgba(15, 185, 253, 0.03));
  animation: fadeIn 1s ease-out;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.overview-title {
  color: var(--color-primary);
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
}

.overview-title i {
  background: rgba(15, 185, 253, 0.1);
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--color-primary);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.4);
}

.overview-content {
  display: grid;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.overview-section h3 {
  font-size: 1.25rem;
  color: var(--color-primary-light);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.overview-section h3 i {
  color: var(--color-primary);
  font-size: 0.9em;
  opacity: 0.9;
}

.overview-section p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.important-list {
  list-style-type: none;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.important-list li {
  position: relative;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.important-list li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-size: 1.25rem;
}

.text-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  padding-bottom: 2px;
}

.text-link:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: var(--color-primary);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease;
}

.text-link:hover {
  color: var(--color-primary-hover);
}

.text-link:hover:after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* Policy Links */
.related-policies {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px dashed rgba(15, 185, 253, 0.2);
}

.policy-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.policy-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: var(--radius-medium);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.policy-link i {
  font-size: 1.5rem;
  color: var(--color-primary);
  background: rgba(15, 185, 253, 0.1);
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.policy-link span {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.policy-link strong {
  font-size: 1.1rem;
  font-weight: 600;
}

.policy-link small {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.policy-link:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.15);
}

.policy-link:hover i {
  background: rgba(15, 185, 253, 0.2);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
}

@media (max-width: 768px) {
  .cosmic-page-container {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding: 0;
    box-sizing: border-box;
  }

  .terms-container {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding-top: 4rem;
  }
  
  .terms-overview,
  .terms-content {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .overview-title {
    font-size: 1.5rem;
  }
  
  .overview-section h3 {
    font-size: 1.1rem;
  }
  
  .policy-links {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .policy-link {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .policy-link i {
    padding: 0.5rem;
    font-size: 1.2rem;
  }
  
  .overview-section {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .cosmic-page-container,
  .terms-container {
    padding: 0;
    padding-top: 3.5rem;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .animated-title {
    font-size: 2rem;
    margin-top: 2rem;
  }
  
  .terms-overview,
  .terms-content {
    padding: 1rem;
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }
  
  .overview-title {
    font-size: 1.25rem;
  }
  
  .overview-section h3 {
    font-size: 1rem;
  }
  
  .important-list {
    padding-left: 1rem;
  }
  
  .policy-link span strong {
    font-size: 0.9rem;
  }
  
  .policy-link span small {
    font-size: 0.75rem;
  }
}

/* Terms Content Section */
.terms-content {
  padding: 3rem;
  animation: slideIn 1.2s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
  border-top: 3px solid var(--color-primary);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.terms-policy-title {
  font-size: 1.75rem;
  color: var(--color-title-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  position: relative;
}

.terms-policy-title::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230FB9FD"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  margin-right: 0.75rem;
}

.last-updated {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  margin-bottom: 2rem;
  font-style: italic;
}

/* Force white headings in markdown */
:deep(h1), :deep(h2), :deep(h3), :deep(h4) {
  color: #FFFFFF !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;
}

/* Animation for headings when scrolled to */
@keyframes highlightSection {
  0% { background-color: rgba(255, 255, 255, 0); }
  30% { background-color: rgba(112, 0, 255, 0.2); }
  100% { background-color: rgba(255, 255, 255, 0); }
}

:deep(.highlight-section) {
  animation: highlightSection 1.5s ease-out;
  border-radius: 0.25rem;
}
</style> 