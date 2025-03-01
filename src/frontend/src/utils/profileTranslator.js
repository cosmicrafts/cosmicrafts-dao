/**
 * Utility functions to translate blockchain messages in the profile context
 */

/**
 * Translates profile-related messages from the blockchain
 * @param {string} message - The original message from the blockchain
 * @param {Function} t - The i18n translation function
 * @returns {string} - The translated message
 */
export function translateProfileMessage(message, t) {
  // Default title
  if (message === 'Galactic Adventurer') {
    return t('profilePage.defaultTitle');
  }
  
  // No description message
  if (message === 'No description yet' || message === 'No description available.') {
    return t('profilePage.noDescription');
  }
  
  // Unknown player
  if (message === 'Unknown Player') {
    return t('profilePage.unknownPlayer');
  }
  
  // If no match, return the original message
  return message;
}

/**
 * Formats a registration date with translation
 * @param {string|number} timestamp - The registration timestamp (nanoseconds since epoch)
 * @param {Function} t - The i18n translation function
 * @param {string} locale - The current locale
 * @returns {string} - The formatted and translated date
 */
export function formatRegistrationDate(timestamp, t, locale) {
  if (!timestamp) return '';

  try {
    // Convert nat64 (nanoseconds) to milliseconds by dividing by 1_000_000
    const milliseconds = Number(timestamp) / 1_000_000;

    // Create a Date object from the milliseconds
    const date = new Date(milliseconds);
    
    // Get month and year
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    
    // Get the translated month name using i18n
    const translatedMonth = t(`months.${month}`);
    
    // Format based on locale preferences
    let formattedDate;
    if (['zh', 'ja', 'ko'].includes(locale)) {
      // East Asian format: Year Month
      formattedDate = `${year} ${translatedMonth}`;
    } else if (locale === 'ar') {
      // Arabic format
      formattedDate = `${translatedMonth} ${year}`;
    } else {
      // Default format: Month Year
      formattedDate = `${translatedMonth} ${year}`;
    }
    
    // Return the translated string with the formatted date
    return t('profilePage.registrationDate', { date: formattedDate });
  } catch (error) {
    console.error('Error formatting registration date:', error);
    // Return a fallback message if there's an error
    return t('profilePage.unknownRegistrationDate');
  }
} 