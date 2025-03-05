/**
 * Forces the window to scroll to the top of the page
 * @param {boolean} smooth - Whether to use smooth scrolling
 */
export function scrollToTop(smooth = true) {
  // Use both approaches for maximum compatibility
  // 1. Modern approach - scrollTo with behavior option
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
  
  // 2. Classic approach as fallback for older browsers
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/**
 * Creates a component mixin that scrolls to top on component mount
 * Use this in pages that need to start at the top
 */
export const scrollTopMixin = {
  mounted() {
    setTimeout(() => scrollToTop(), 100);
  }
}; 