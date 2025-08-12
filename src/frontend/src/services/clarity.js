// Microsoft Clarity Service - Compatible with existing window.clarity calls
class ClarityService {
  constructor() {
    this.isInitialized = false;
    this.projectId = 'stoo40s80v'; // Replace this with your actual Clarity Project ID
  }

  // Initialize Clarity
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Load Clarity script dynamically
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${this.projectId}`;

      script.onload = () => {
        this.isInitialized = true;
        console.log('Microsoft Clarity initialized');
      };

      script.onerror = (error) => {
        console.error('Failed to load Clarity script:', error);
      };

      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);

    } catch (error) {
      console.error('Failed to initialize Clarity:', error);
    }
  }

  // Track custom events - compatible with existing window.clarity calls
  trackEvent(eventName, properties = {}) {
    if (typeof window.clarity !== 'undefined') {
      try {
        window.clarity('event', eventName, properties);
      } catch (error) {
        console.warn('Clarity event tracking failed:', error);
      }
    }
  }

  // Track user actions specific to your gaming platform
  trackGameAction(action, gameData = {}) {
    this.trackEvent('game_action', {
      action,
      ...gameData,
      timestamp: new Date().toISOString()
    });
  }

  // Track NFT interactions
  trackNFTInteraction(action, nftData = {}) {
    this.trackEvent('nft_interaction', {
      action,
      ...nftData,
      timestamp: new Date().toISOString()
    });
  }

  // Track DAO governance actions
  trackGovernanceAction(action, proposalData = {}) {
    this.trackEvent('governance_action', {
      action,
      ...proposalData,
      timestamp: new Date().toISOString()
    });
  }

  // Track wallet connections
  trackWalletConnection(walletType, success) {
    this.trackEvent('wallet_connection', {
      wallet_type: walletType,
      success,
      timestamp: new Date().toISOString()
    });
  }

  // Track page views for SPA
  trackPageView(pageName, pageData = {}) {
    this.trackEvent('page_view', {
      page_name: pageName,
      ...pageData,
      timestamp: new Date().toISOString()
    });
  }

  // Track performance metrics
  trackPerformance(metrics) {
    this.trackEvent('performance_metrics', {
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Track user engagement
  trackEngagement(action, duration = 0) {
    this.trackEvent('user_engagement', {
      action,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  // Identify user (for better tracking)
  identifyUser(userId, sessionId = null, pageId = null, friendlyName = null) {
    if (typeof window.clarity !== 'undefined') {
      try {
        window.clarity('identify', userId, sessionId, pageId, friendlyName);
      } catch (error) {
        console.warn('Clarity identify failed:', error);
      }
    }
  }

  // Set custom tags for filtering
  setTag(key, value) {
    if (typeof window.clarity !== 'undefined') {
      try {
        window.clarity('setTag', key, value);
      } catch (error) {
        console.warn('Clarity setTag failed:', error);
      }
    }
  }

  // Upgrade session for priority recording
  upgradeSession(reason) {
    if (typeof window.clarity !== 'undefined') {
      try {
        window.clarity('upgrade', reason);
      } catch (error) {
        console.warn('Clarity upgrade failed:', error);
      }
    }
  }

  // Set cookie consent
  setConsent(consent = true) {
    if (typeof window.clarity !== 'undefined') {
      try {
        window.clarity('consent', consent);
      } catch (error) {
        console.warn('Clarity consent failed:', error);
      }
    }
  }
}

// Create singleton instance
const clarityService = new ClarityService();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  clarityService.init();
}

export default clarityService;
