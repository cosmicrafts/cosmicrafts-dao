<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="cosmic-page-container terms-container">
      <h1 class="title-large text-gradient animated-title">{{ $t('footer.terms') }}</h1>
      
      <!-- Terms Content -->
      <div class="cosmic-card terms-content">
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
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

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
    // Scroll with a slight offset to account for sticky headers
    const yOffset = -80;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    // Smooth scroll to the element
    window.scrollTo({
      top: y,
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
.terms-container {
  padding-top: 4rem;
}

.animated-title {
  text-align: center;
  animation: fadeInDown 1s ease-out;
}

.terms-content {
  padding: 4rem;
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

@media (max-width: 768px) {
  .terms-content {
    padding: 2rem;
  }
}
</style> 