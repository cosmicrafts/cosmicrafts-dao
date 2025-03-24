<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="cosmic-page-container legal-container">
      <h1 class="title-large text-gradient animated-title">{{ $t('footer.legal') }}</h1>
      
      <!-- Legal Information Section -->
      <div class="cosmic-card legal-info">
        <h2 class="legal-title">
          <i class="fas fa-balance-scale"></i> Legal Information Overview
        </h2>
        
        <div class="legal-info-content">
          <div class="info-section">
            <h3><i class="fas fa-gavel"></i> Terms of Use</h3>
            <p>
              The following documentation outlines the legal framework governing your use of Cosmicrafts services, games, and platforms. These terms constitute a binding agreement between you and Cosmicrafts. By accessing our services, you acknowledge and agree to be bound by these terms.
            </p>
          </div>
          
          <div class="info-section">
            <h3><i class="fas fa-file-contract"></i> Understanding Our Agreements</h3>
            <p>
              Our legal documents are written to be as clear and transparent as possible. Below you'll find key points that outline your rights and responsibilities, as well as ours:
            </p>
            <ul class="key-points-list">
              <li>Account ownership and responsibilities</li>
              <li>Intellectual property rights</li>
              <li>Content usage and limitations</li>
              <li>Dispute resolution procedures</li>
              <li>Liability limitations and warranty disclaimers</li>
            </ul>
          </div>
          
          <div class="info-section">
            <h3><i class="fas fa-globe"></i> International Users</h3>
            <p>
              Cosmicrafts services are accessible worldwide. However, certain features may vary based on your jurisdiction. It is your responsibility to ensure compliance with local laws when using our services. For specific regional legal information, please contact <a href="mailto:legal@cosmicrafts.com" class="text-link">legal@cosmicrafts.com</a>.
            </p>
          </div>
          
          <!-- Cross-references to Related Policies -->
          <div class="info-section related-policies">
            <h3><i class="fas fa-link"></i> Related Documents</h3>
            <p>
              This Legal Information document is part of a comprehensive set of policies:
            </p>
            <div class="policy-links">
              <router-link to="/terms" class="policy-link">
                <i class="fas fa-file-signature"></i>
                <span>
                  <strong>Terms of Service</strong>
                  <small>User obligations and service limitations</small>
                </span>
              </router-link>
              
              <router-link to="/privacy" class="policy-link">
                <i class="fas fa-shield-alt"></i>
                <span>
                  <strong>Privacy Policy</strong>
                  <small>How we collect, use and protect your data</small>
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Legal Content -->
      <div class="cosmic-card legal-content">
        <h2 class="legal-policy-title">Legal Terms and Conditions</h2>
        <div class="last-updated">Last Updated: March 4, 2023</div>
        
        <MarkdownRenderer 
          fileName="legal" 
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

.legal-container {
  padding-top: 4.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.animated-title {
  margin-bottom: 2rem;
  text-align: center;
  animation: fadeInDown 1s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Legal Information Section */
.legal-info {
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

.legal-title {
  color: var(--color-primary);
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
}

.legal-title i {
  background: rgba(15, 185, 253, 0.1);
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--color-primary);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.4);
}

.legal-info-content {
  display: grid;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.info-section h3 {
  font-size: 1.25rem;
  color: var(--color-primary-light);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section h3 i {
  color: var(--color-primary);
  font-size: 0.9em;
  opacity: 0.9;
}

.info-section p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.key-points-list {
  list-style-type: none;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.key-points-list li {
  position: relative;
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  color: var(--color-text-secondary);
}

.key-points-list li:before {
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

  .legal-container {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
    padding-top: 4rem;
  }
  
  .legal-info,
  .legal-content {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .legal-title {
    font-size: 1.5rem;
  }
  
  .info-section h3 {
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
  
  .info-section {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .cosmic-page-container,
  .legal-container {
    padding: 0;
    padding-top: 4.5rem;
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .animated-title {
    font-size: 2rem;
    margin-top: 2rem;
  }
  
  .legal-info,
  .legal-content {
    padding: 1rem;
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }
  
  .legal-title {
    font-size: 1.25rem;
  }
  
  .info-section h3 {
    font-size: 1rem;
  }
  
  .key-points-list {
    padding-left: 1rem;
  }
  
  .policy-link span strong {
    font-size: 0.9rem;
  }
  
  .policy-link span small {
    font-size: 0.75rem;
  }
}

/* Legal Content Section */
.legal-content {
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

.legal-policy-title {
  font-size: 1.75rem;
  color: var(--color-title-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  position: relative;
}

.legal-policy-title::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230FB9FD"><path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3zm0 14.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-4.5h-2V7h2v5z"/></svg>');
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