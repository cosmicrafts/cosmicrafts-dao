import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export function useCanonical() {
  const route = useRoute();

  const updateCanonical = (url) => {
    // Remove existing canonical tag
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create new canonical tag
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url || `https://cosmicrafts.com${route.path}`;
    document.head.appendChild(canonical);
  };

  const updateMetaTags = () => {
    const currentUrl = `https://cosmicrafts.com${route.path}`;
    
    // Update canonical
    updateCanonical(currentUrl);
    
    // Update Open Graph URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', currentUrl);
    }
    
    // Update Twitter Card URL
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', currentUrl);
    }
  };

  // Update on route change
  watch(() => route.path, () => {
    updateMetaTags();
  }, { immediate: true });

  // Update on mount
  onMounted(() => {
    updateMetaTags();
  });

  return {
    updateCanonical,
    updateMetaTags
  };
}
