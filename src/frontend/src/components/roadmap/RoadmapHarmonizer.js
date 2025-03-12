/**
 * Roadmap Component Harmonizer
 * Provides centralized methods for consistent interactions across roadmap components
 * Used by all roadmap components to ensure harmonized behavior
 */

// Device detection - simplified responsive design helpers
const isMobile = () => window.innerWidth <= 767;
const isTablet = () => window.innerWidth > 767 && window.innerWidth <= 1199;
const isDesktop = () => window.innerWidth > 1199;

// Set CSS variables based on viewport - important for responsive design calculations
const updateViewportVariables = () => {
  document.documentElement.style.setProperty('--actual-viewport-width', `${window.innerWidth}px`);
  document.documentElement.style.setProperty('--actual-viewport-height', `${window.innerHeight}px`);
  
  // Calculate ideal container width for roadmap display
  const containerWidth = Math.min(window.innerWidth - 48, 1400);
  document.documentElement.style.setProperty('--roadmap-container-width', `${containerWidth}px`);
};

// Touch event handler for mobile devices - simplified swipe detection
const initTouchEvents = (element, leftSwipeHandler, rightSwipeHandler) => {
  if (!element || !isMobile()) return;
  
  let touchStartX = 0;
  let touchStartY = 0;
  
  element.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  element.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    
    // Detect horizontal swipe (with higher threshold for mobile)
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
      // Right to left swipe
      if (xDiff > 0 && leftSwipeHandler) {
        leftSwipeHandler();
      } 
      // Left to right swipe
      else if (xDiff < 0 && rightSwipeHandler) {
        rightSwipeHandler();
      }
    }
  }, { passive: true });
};

// Master initialization function for roadmap animations
const initRoadmapAnimations = (roadmapElement) => {
  if (!roadmapElement) return;
  
  updateViewportVariables();
  
  // Initialize intersection observer for scroll animations
  initScrollAnimations(roadmapElement);
  
  // Initialize device-specific animations
  if (isMobile()) {
    initMobileInteractions(roadmapElement);
  } else if (isTablet()) {
    initTabletInteractions(roadmapElement);
  } else {
    initDesktopInteractions(roadmapElement);
  }
  
  // Add resize listener to handle responsive changes
  window.addEventListener('resize', () => {
    handleResize(roadmapElement);
  });
};

// Scroll animations using Intersection Observer
const initScrollAnimations = (element) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Apply to elements with data-scroll attribute
    element.querySelectorAll('[data-scroll="true"]').forEach(el => {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    element.querySelectorAll('[data-scroll="true"]').forEach(el => {
      el.classList.add('revealed');
    });
  }
};

// Mobile-specific interactions
const initMobileInteractions = (element) => {
  // Add touch feedback
  const touchTargets = element.querySelectorAll('.quarter-header, .milestone-header, .task-header');
  touchTargets.forEach(target => {
    target.classList.add('mobile-tap-highlight');
    
    target.addEventListener('touchstart', () => {
      target.classList.add('mobile-touch-active');
    }, { passive: true });
    
    target.addEventListener('touchend', () => {
      target.classList.remove('mobile-touch-active');
      
      // Add a brief highlight after touch
      target.classList.add('mobile-touch-highlight');
      setTimeout(() => {
        target.classList.remove('mobile-touch-highlight');
      }, 300);
    }, { passive: true });
  });
};

// Tablet-specific interactions
const initTabletInteractions = (element) => {
  // Simplified hover animations for tablet
  element.querySelectorAll('.milestone').forEach(milestone => {
    milestone.addEventListener('mouseenter', () => {
      milestone.style.transform = 'translateY(-3px)';
    });
    
    milestone.addEventListener('mouseleave', () => {
      milestone.style.transform = '';
    });
  });
};

// Desktop-specific interactions
const initDesktopInteractions = (element) => {
  // Enhanced hover animations for desktop
  element.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};

// Reset animations on window resize
const handleResize = (roadmapElement) => {
  // First update viewport variables
  updateViewportVariables();
  
  // Clear all existing animations/event handlers
  resetAllAnimations(roadmapElement);
  
  // Reinitialize appropriate animations based on new device size
  if (isMobile()) {
    initMobileInteractions(roadmapElement);
  } else if (isTablet()) {
    initTabletInteractions(roadmapElement);
  } else {
    initDesktopInteractions(roadmapElement);
  }
};

// Reset all animations and event handlers for clean reinitializing
const resetAllAnimations = (element) => {
  if (!element) return;
  
  const milestones = element.querySelectorAll('.milestone');
  const taskCards = element.querySelectorAll('.task-card');
  const headers = element.querySelectorAll('.quarter-header, .milestone-header, .task-header');
  
  // Reset all animations
  milestones.forEach(m => {
    m.style.transform = '';
    m.onmousemove = null;
    m.onmouseleave = null;
    m.onmouseenter = null;
  });
  
  taskCards.forEach(t => {
    t.style.transform = '';
    t.onmouseenter = null;
    t.onmouseleave = null;
  });
  
  headers.forEach(h => {
    h.classList.remove('mobile-tap-highlight', 'mobile-touch-active', 'mobile-touch-highlight');
    h.ontouchstart = null;
    h.ontouchend = null;
  });
};

export default {
  isMobile,
  isTablet,
  isDesktop,
  updateViewportVariables,
  initTouchEvents,
  initRoadmapAnimations,
  initScrollAnimations,
  resetAllAnimations,
  handleResize
}; 