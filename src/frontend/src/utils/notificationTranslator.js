/**
 * Utility functions to translate backend notification messages
 */

/**
 * Translates backend notification messages using i18n
 * @param {string} message - The original message from the backend
 * @param {Function} t - The i18n translation function
 * @returns {string} - The translated message
 */
export function translateNotification(message, t) {
  // Check for friend request notification
  if (message.startsWith("You have a new friend request from ")) {
    const username = message.replace("You have a new friend request from ", "");
    return `${t('notifications.newFriendRequest')} ${username}`;
  }
  
  // Check for accepted friend request notification
  if (message.includes(" accepted your friend request")) {
    const username = message.replace(" accepted your friend request", "");
    return `${username} ${t('notifications.acceptedYourFriendRequest')}`;
  }
  
  // Check for privacy settings update notification
  if (message === "Your privacy settings have been updated.") {
    return t('notifications.privacySettingsUpdated');
  }
  
  // If no match, return the original message
  return message;
} 