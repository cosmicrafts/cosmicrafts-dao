/**
 * Roadmap Component Harmonizer
 * Provides centralized methods for consistent interactions across roadmap components
 * Used by all roadmap components to ensure harmonized behavior
 */

// Device detection
const isMobile = () => window.innerWidth <= 767;
const isTablet = () => window.innerWidth > 767 && window.innerWidth <= 1199;
const isDesktop = () => window.innerWidth > 1199;

// Set CSS variables based on viewport
const updateViewportVariables = () => {
  document.documentElement.style.setProperty('--actual-viewport-width', `${window.innerWidth}px`);
  document.documentElement.style.setProperty('--actual-viewport-height', `${window.innerHeight}px`);
  
  // Calculate ideal container width
  const containerWidth = Math.min(window.innerWidth - 48, 1400);
  document.documentElement.style.setProperty('--roadmap-container-width', `${containerWidth}px`);
};

// Touch event handler for mobile devices
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

// Initialize consistent animations for different devices
const initHarmonizedAnimations = (roadmapElement) => {
  if (!roadmapElement) return;
  
  // Apply consistent animations based on device
  if (isMobile()) {
    initMobileAnimations(roadmapElement);
  } else if (isTablet()) {
    initTabletAnimations(roadmapElement);
  } else {
    initDesktopAnimations(roadmapElement);
  }
  
  // Shared animations for all devices
  initSharedAnimations(roadmapElement);
};

// Mobile-specific animations
const initMobileAnimations = (element) => {
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
  
  // Remove any desktop hover effects that might cause issues
  element.querySelectorAll('.milestone').forEach(milestone => {
    milestone.style.transform = '';
    
    // Clean up event listeners
    milestone.onmousemove = null;
    milestone.onmouseleave = null;
  });
};

// Tablet-specific animations
const initTabletAnimations = (element) => {
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

// Desktop animations
const initDesktopAnimations = (element) => {
  // Rich hover animations for desktop
  element.querySelectorAll('.milestone').forEach(milestone => {
    milestone.addEventListener('mousemove', (e) => {
      const rect = milestone.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;
      
      // Subtle perspective tilt
      const tiltX = (y / rect.height - 0.5) * 2; // -1 to 1
      const tiltY = (x / rect.width - 0.5) * -2; // -1 to 1
      
      milestone.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    
    milestone.addEventListener('mouseleave', () => {
      milestone.style.transform = '';
    });
  });
  
  // Enhanced task card hover
  element.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};

// Animations shared across all devices
const initSharedAnimations = (element) => {
  // Progress bar shimmer effect
  const progressBars = element.querySelectorAll('.progress-bar');
  progressBars.forEach(bar => {
    const parent = bar.closest('.milestone, .task-card');
    if (parent) {
      if (isMobile()) {
        // For mobile, trigger on touch with longer duration
        parent.addEventListener('touchstart', () => {
          bar.classList.add('cosmic-shimmer-active');
        }, { passive: true });
        
        parent.addEventListener('touchend', () => {
          setTimeout(() => {
            bar.classList.remove('cosmic-shimmer-active');
          }, 1000);
        }, { passive: true });
      } else {
        // For desktop/tablet, trigger on hover
        parent.addEventListener('mouseenter', () => {
          bar.classList.add('cosmic-shimmer-active');
        });
        
        parent.addEventListener('mouseleave', () => {
          bar.classList.remove('cosmic-shimmer-active');
        });
      }
    }
  });
  
  // Scroll reveal animations
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

// Reset animations on window resize
const handleResize = (roadmapElement) => {
  // Update viewport variables
  updateViewportVariables();
  
  // Remove all animations
  const milestones = roadmapElement.querySelectorAll('.milestone');
  const taskCards = roadmapElement.querySelectorAll('.task-card');
  const headers = roadmapElement.querySelectorAll('.quarter-header, .milestone-header, .task-header');
  
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
    h.classList.remove('mobile-tap-highlight');
    h.ontouchstart = null;
    h.ontouchend = null;
  });
  
  // Reinitialize appropriate animations
  initHarmonizedAnimations(roadmapElement);
};

export default {
  isMobile,
  isTablet,
  isDesktop,
  updateViewportVariables,
  initTouchEvents,
  initHarmonizedAnimations,
  handleResize
}; 