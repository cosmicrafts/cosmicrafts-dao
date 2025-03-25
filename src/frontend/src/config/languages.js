/**
 * Supported languages configuration for the application
 */
export const supportedLanguages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    file: 'wallet.en.json'
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    file: 'wallet.es.json'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    file: 'wallet.fr.json'
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    file: 'wallet.de.json'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    file: 'wallet.zh.json'
  }
];

/**
 * Get supported language by code
 * @param {string} code - Language code
 * @returns {Object|null} Language object or null if not found
 */
export const getLanguageByCode = (code) => {
  return supportedLanguages.find(lang => lang.code === code) || null;
};

/**
 * Default language code (fallback)
 */
export const defaultLanguage = 'en';

/**
 * Get language file path
 * @param {string} code - Language code
 * @returns {string} Path to language file
 */
export const getLanguageFilePath = (code) => {
  const language = getLanguageByCode(code) || getLanguageByCode(defaultLanguage);
  return `../locales/${language.file}`;
};

export default supportedLanguages; 