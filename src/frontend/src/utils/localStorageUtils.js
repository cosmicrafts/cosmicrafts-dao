/**
 * Local Storage Utilities
 * Handles data persistence for user preferences and onboarding state
 */

// Keys used for local storage
const KEYS = {
  ONBOARDING_PROGRESS: 'cosmicrafts_onboarding_progress',
  ONBOARDING_COMPLETED: 'cosmicrafts_onboarding_completed',
  DAILY_STREAK: 'cosmicrafts_daily_streak',
  LAST_LOGIN: 'cosmicrafts_last_login',
  FEATURE_DISCOVERIES: 'cosmicrafts_feature_discoveries',
  USER_PREFERENCES: 'cosmicrafts_user_preferences',
};

/**
 * Store onboarding progress to resume if user leaves mid-onboarding
 * @param {Number} step - Current onboarding step
 * @param {Object} data - Additional data to store with the step
 */
export const storeOnboardingProgress = (step, data = {}) => {
  try {
    const progressData = {
      step,
      timestamp: Date.now(),
      ...data
    };
    localStorage.setItem(KEYS.ONBOARDING_PROGRESS, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error storing onboarding progress:', error);
  }
};

/**
 * Retrieve stored onboarding progress
 * @returns {Object|null} The stored onboarding progress data or null if not found
 */
export const getOnboardingProgress = () => {
  try {
    const progressData = localStorage.getItem(KEYS.ONBOARDING_PROGRESS);
    return progressData ? JSON.parse(progressData) : null;
  } catch (error) {
    console.error('Error retrieving onboarding progress:', error);
    return null;
  }
};

/**
 * Mark onboarding as completed
 * @param {Boolean} skipped - Whether onboarding was skipped
 */
export const completeOnboarding = (skipped = false) => {
  try {
    localStorage.setItem(
      KEYS.ONBOARDING_COMPLETED, 
      JSON.stringify({
        completed: true,
        skipped,
        timestamp: Date.now()
      })
    );
    // Clear onboarding progress
    localStorage.removeItem(KEYS.ONBOARDING_PROGRESS);
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
};

/**
 * Check if onboarding has been completed
 * @returns {Boolean} Whether onboarding has been completed
 */
export const isOnboardingCompleted = () => {
  try {
    const completionData = localStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return completionData ? JSON.parse(completionData).completed : false;
  } catch (error) {
    console.error('Error checking onboarding completion:', error);
    return false;
  }
};

/**
 * Track user's daily login streak
 * @returns {Object} Object containing streak count and whether it increased
 */
export const trackDailyStreak = () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Get last login data
    const lastLoginData = localStorage.getItem(KEYS.LAST_LOGIN);
    const lastLogin = lastLoginData ? JSON.parse(lastLoginData) : null;
    
    // Get current streak data
    const streakData = localStorage.getItem(KEYS.DAILY_STREAK);
    const currentStreak = streakData ? JSON.parse(streakData) : { count: 0, lastIncrease: 0 };
    
    let streakIncreased = false;
    
    // If last login was yesterday, increase streak
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin.timestamp);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
      
      if (new Date(lastLogin.timestamp).getTime() === yesterdayDate) {
        // User logged in yesterday, increase streak
        currentStreak.count += 1;
        currentStreak.lastIncrease = today;
        streakIncreased = true;
      } else if (new Date(lastLogin.timestamp).getTime() < yesterdayDate) {
        // User missed a day, reset streak
        currentStreak.count = 1;
        currentStreak.lastIncrease = today;
        streakIncreased = true;
      } else if (new Date(lastLogin.timestamp).getTime() === today) {
        // Already logged in today, don't change streak
        streakIncreased = false;
      }
    } else {
      // First login ever, start streak at 1
      currentStreak.count = 1;
      currentStreak.lastIncrease = today;
      streakIncreased = true;
    }
    
    // Save updated streak
    localStorage.setItem(KEYS.DAILY_STREAK, JSON.stringify(currentStreak));
    
    // Save last login time
    localStorage.setItem(KEYS.LAST_LOGIN, JSON.stringify({ timestamp: today }));
    
    return {
      streak: currentStreak.count,
      increased: streakIncreased
    };
  } catch (error) {
    console.error('Error tracking daily streak:', error);
    return { streak: 1, increased: false };
  }
};

/**
 * Track when user discovers a feature
 * @param {String} featureId - Unique identifier for the feature
 */
export const trackFeatureDiscovery = (featureId) => {
  try {
    const featuresData = localStorage.getItem(KEYS.FEATURE_DISCOVERIES);
    const discoveries = featuresData ? JSON.parse(featuresData) : {};
    
    // Only track first time discovery
    if (!discoveries[featureId]) {
      discoveries[featureId] = {
        discovered: true,
        timestamp: Date.now()
      };
      
      localStorage.setItem(KEYS.FEATURE_DISCOVERIES, JSON.stringify(discoveries));
    }
  } catch (error) {
    console.error('Error tracking feature discovery:', error);
  }
};

/**
 * Check if a feature has been discovered
 * @param {String} featureId - Unique identifier for the feature
 * @returns {Boolean} Whether the feature has been discovered
 */
export const hasDiscoveredFeature = (featureId) => {
  try {
    const featuresData = localStorage.getItem(KEYS.FEATURE_DISCOVERIES);
    const discoveries = featuresData ? JSON.parse(featuresData) : {};
    return !!discoveries[featureId];
  } catch (error) {
    console.error('Error checking feature discovery:', error);
    return false;
  }
};

/**
 * Store user preferences
 * @param {Object} preferences - User preference settings
 */
export const storeUserPreferences = (preferences) => {
  try {
    const existingData = localStorage.getItem(KEYS.USER_PREFERENCES);
    const existingPreferences = existingData ? JSON.parse(existingData) : {};
    
    const updatedPreferences = {
      ...existingPreferences,
      ...preferences,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences));
  } catch (error) {
    console.error('Error storing user preferences:', error);
  }
};

/**
 * Get user preferences
 * @returns {Object} User preference settings
 */
export const getUserPreferences = () => {
  try {
    const preferencesData = localStorage.getItem(KEYS.USER_PREFERENCES);
    return preferencesData ? JSON.parse(preferencesData) : {};
  } catch (error) {
    console.error('Error retrieving user preferences:', error);
    return {};
  }
}; 