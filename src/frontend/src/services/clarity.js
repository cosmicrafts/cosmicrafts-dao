// Microsoft Clarity Service using NPM package
import { clarity } from '@microsoft/clarity';

class ClarityService {
  constructor() {
    this.isInitialized = false;
    this.projectId = 'YOUR_CLARITY_PROJECT_ID'; // Replace with your actual ID
  }

  // Initialize Clarity
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Initialize Clarity with NPM package
      clarity.init(this.projectId, {
        // Configuration options
        logLevel: 'warn',
        upload: 'https://c.clarity.ms/collect',
        delay: 1000,
        // Enable session recordings
        sessionReplay: {
          enabled: true,
          maskTextInputs: true,
          maskUserInputs: true
        },
        // Enable heatmaps
        heatmap: {
          enabled: true
        }
      });

      this.isInitialized = true;
      console.log('Microsoft Clarity initialized with NPM package');
    } catch (error) {
      console.error('Failed to initialize Clarity:', error);
    }
  }

  // Track custom events
  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized || typeof clarity === 'undefined') return;

    try {
      clarity.event(eventName, properties);
    } catch (error) {
      console.warn('Clarity event tracking failed:', error);
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
}

// Create singleton instance
const clarityService = new ClarityService();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  clarityService.init();
}

export default clarityService;
