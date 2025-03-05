// src/frontend/src/directives/scrollToTop.js

// This directive forces scrolling to top when the element it's attached to is updated
export const vScrollToTop = {
  mounted(el) {
    el._scrollToTopObserver = new MutationObserver(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Watch for changes to this element's children (router-view content changes)
    el._scrollToTopObserver.observe(el, { 
      childList: true,
      subtree: false
    });
  },
  unmounted(el) {
    // Clean up the observer when the component is unmounted
    if (el._scrollToTopObserver) {
      el._scrollToTopObserver.disconnect();
      delete el._scrollToTopObserver;
    }
  }
};

export default vScrollToTop; 