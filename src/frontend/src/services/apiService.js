import { useNotificationStore } from '@/stores/notification';
import { useCanisterStore } from '@/stores/canister';

/**
 * API Service with notification integration
 * Provides methods to call backend functions and automatically handle notifications
 */
export class ApiService {
  /**
   * Call a backend function with notification handling
   * @param {Object} options - Call options
   * @param {String} options.method - The backend method name
   * @param {Array} options.args - Array of arguments to pass to the method
   * @param {Object} options.notification - Notification options
   * @param {String} options.notification.successTitle - Title for success notification
   * @param {String} options.notification.successMessage - Message for success notification
   * @param {String} options.notification.errorTitle - Title for error notification
   * @param {String} options.notification.overrideErrorMessage - Override error message from backend
   * @param {Boolean} options.notification.showSuccess - Whether to show success notification
   * @param {Boolean} options.notification.showError - Whether to show error notification
   * @param {Number} options.notification.successDuration - Duration for success notification
   * @param {Number} options.notification.errorDuration - Duration for error notification
   * @param {Array} options.notification.actions - Actions for success notification
   * @returns {Promise<*>} - The result of the backend call
   */
  static async call({
    method,
    args = [],
    notification = {
      successTitle: 'Success',
      errorTitle: 'Error',
      showSuccess: true,
      showError: true
    }
  }) {
    const canisterStore = useCanisterStore();
    const notificationStore = useNotificationStore();
    
    // Ensure backend is initialized
    if (!canisterStore.isInitialized) {
      await canisterStore.initializeImmediately();
    }
    
    try {
      console.log(`Calling ${method} with args:`, args);
      
      // Call backend method
      const result = await canisterStore.backendActor[method](...args);
      console.log(`${method} result:`, result);
      
      // Handle result based on pattern (many methods return [Bool, Text])
      if (Array.isArray(result) && result.length === 2 && typeof result[0] === 'boolean') {
        const [success, message] = result;
        
        // Show notification based on result
        if (success && notification.showSuccess) {
          notificationStore.success(
            notification.successMessage || message,
            {
              title: notification.successTitle,
              duration: notification.successDuration,
              actions: notification.actions
            }
          );
        } else if (!success && notification.showError) {
          notificationStore.error(
            notification.overrideErrorMessage || message,
            {
              title: notification.errorTitle,
              duration: notification.errorDuration
            }
          );
        }
        
        return result;
      } 
      
      // For non-standard responses, just show success notification
      if (notification.showSuccess) {
        notificationStore.success(
          notification.successMessage || `${method} completed successfully`,
          {
            title: notification.successTitle,
            duration: notification.successDuration,
            actions: notification.actions
          }
        );
      }
      
      return result;
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      
      // Show error notification
      if (notification.showError) {
        notificationStore.error(
          notification.overrideErrorMessage || `Error: ${error.message || error}`,
          {
            title: notification.errorTitle,
            duration: notification.errorDuration
          }
        );
      }
      
      throw error;
    }
  }
  
  /**
   * Call a backend query function (read-only)
   * This won't show notifications by default unless explicitly requested
   */
  static async query({
    method,
    args = [],
    notification = {
      showSuccess: false,
      showError: true
    }
  }) {
    return this.call({
      method,
      args,
      notification
    });
  }
  
  /**
   * Common API methods with predefined notification settings
   */
  static async signup(username, avatarId, referralCode, language) {
    return this.call({
      method: 'signup',
      args: [username, avatarId, referralCode ? [referralCode] : [], language],
      notification: {
        successTitle: 'Welcome!',
        successMessage: `Welcome to Cosmicrafts, ${username}!`,
        errorTitle: 'Signup Failed'
      }
    });
  }
  
  static async login(country = null) {
    return this.call({
      method: 'login',
      args: [country ? [country] : []],
      notification: {
        successTitle: 'Welcome Back!',
        successMessage: 'You have successfully logged in',
        errorTitle: 'Login Failed',
        errorDuration: 8000
      }
    });
  }
  
  static async sendFriendRequest(playerId) {
    return this.call({
      method: 'sendFriendRequest',
      args: [playerId],
      notification: {
        successTitle: 'Friend Request Sent',
        errorTitle: 'Failed to Send Request'
      }
    });
  }
  
  static async acceptFriendRequest(playerId) {
    return this.call({
      method: 'acceptFriendRequest',
      args: [playerId],
      notification: {
        successTitle: 'Friend Request Accepted',
        errorTitle: 'Failed to Accept Request'
      }
    });
  }
  
  static async declineFriendRequest(playerId) {
    return this.call({
      method: 'declineFriendRequest',
      args: [playerId],
      notification: {
        successTitle: 'Friend Request Declined',
        errorTitle: 'Failed to Decline Request'
      }
    });
  }
  
  static async mintChest(playerId, amount) {
    return this.call({
      method: 'mintChest',
      args: [playerId, amount],
      notification: {
        successTitle: 'Chest Minted',
        successMessage: `Successfully minted ${amount} chest(s)`,
        errorTitle: 'Failed to Mint Chest'
      }
    });
  }
  
  static async openChest(tokenId) {
    return this.call({
      method: 'openChest',
      args: [tokenId],
      notification: {
        successTitle: 'Chest Opened',
        successMessage: 'You received new items!',
        errorTitle: 'Failed to Open Chest'
      }
    });
  }
  
  static async claimUserReward(missionId) {
    return this.call({
      method: 'claimUserReward',
      args: [missionId],
      notification: {
        successTitle: 'Reward Claimed',
        successMessage: 'You claimed your mission reward!',
        errorTitle: 'Failed to Claim Reward'
      }
    });
  }
  
  static async claimAchievementLineReward(achievementId) {
    return this.call({
      method: 'claimAchievementLineReward',
      args: [achievementId],
      notification: {
        successTitle: 'Achievement Reward Claimed',
        successMessage: 'You claimed your achievement reward!',
        errorTitle: 'Failed to Claim Reward'
      }
    });
  }
  
  static async claimIndividualAchievementReward(achievementId) {
    return this.call({
      method: 'claimIndividualAchievementReward',
      args: [achievementId],
      notification: {
        successTitle: 'Achievement Reward Claimed',
        successMessage: 'You claimed your achievement reward!',
        errorTitle: 'Failed to Claim Reward'
      }
    });
  }
  
  static async updateDescription(description) {
    return this.call({
      method: 'updateDescription',
      args: [description],
      notification: {
        successTitle: 'Profile Updated',
        successMessage: 'Your profile description has been updated',
        errorTitle: 'Failed to Update Profile'
      }
    });
  }
  
  static async updateUsername(username) {
    return this.call({
      method: 'updateUsername',
      args: [username],
      notification: {
        successTitle: 'Username Updated',
        successMessage: `Your username has been updated to ${username}`,
        errorTitle: 'Failed to Update Username'
      }
    });
  }
  
  static async updateAvatar(avatarId) {
    return this.call({
      method: 'updateAvatar',
      args: [avatarId],
      notification: {
        successTitle: 'Avatar Updated',
        successMessage: 'Your avatar has been updated',
        errorTitle: 'Failed to Update Avatar'
      }
    });
  }
  
  static async updateTitle(titleId) {
    return this.call({
      method: 'updateTitle',
      args: [titleId],
      notification: {
        successTitle: 'Title Updated',
        successMessage: 'Your title has been updated',
        errorTitle: 'Failed to Update Title'
      }
    });
  }
  
  static async cancelMatchmaking() {
    return this.call({
      method: 'cancelMatchmaking',
      args: [],
      notification: {
        successTitle: 'Matchmaking Cancelled',
        errorTitle: 'Failed to Cancel Matchmaking'
      }
    });
  }
  
  static async saveFinishedGame(matchId, stats) {
    return this.call({
      method: 'saveFinishedGame',
      args: [matchId, stats],
      notification: {
        successTitle: 'Game Results Saved',
        successMessage: 'Your game results have been recorded',
        errorTitle: 'Failed to Save Game Results',
        errorDuration: 8000
      }
    });
  }
  
  // Add more common API methods as needed
}

export default ApiService; 