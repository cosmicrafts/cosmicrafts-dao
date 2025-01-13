import { languageCountryMapping } from '@/utils/languageMapping';

const API_URLS = [
  'https://ipapi.co/json/',
  'https://ipwhois.app/json/',
  'https://geolocation-db.com/json/',
 // 'https://api.ipdata.co/?api-key=YOUR_API_KEY'
];

const LocalizationService = {
  /**
   * Detect the user's preferred language based on IP geolocation.
   * Fallback to browser language if detection fails.
   * @returns {Promise<string>} Detected language code.
   */
  async detectLanguage() {
    for (const url of API_URLS) {
      try {
        console.log(`Trying to fetch language data from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`Response not ok from ${url}:`, response.statusText);
          continue;
        }

        const data = await response.json();
        console.log(`Successful response from ${url}:`, data);

        const countryCode = data.country_code || data.countryCode || data.location?.country_code;
        const language = this.mapLanguageByCountry(countryCode);

        if (language) {
          console.log(`Language detected from ${url}: ${language}`);
          return language;
        }
      } catch (error) {
        console.warn(`Error fetching from ${url}:`, error.message);
      }
    }

    console.warn('All geolocation API attempts failed. Falling back to browser language.');
    return this.detectBrowserLanguage() || 'en';
  },

  /**
   * Map a country code to a language code using predefined mappings.
   * @param {string} countryCode - The user's country code (e.g., 'US').
   * @returns {string} Language code (e.g., 'en').
   */
  mapLanguageByCountry(countryCode) {
    const languageCountryMapping = {
      en: ['US', 'GB', 'AU', 'CA'],
      es: ['ES', 'MX', 'AR'],
      fr: ['FR', 'BE', 'CA'],
      de: ['DE', 'AT', 'CH'],
      pt: ['PT', 'BR'],
      ru: ['RU'],
      ar: ['SA', 'EG'],
      vi: ['VN'],
      ko: ['KR'],
      ja: ['JP'],
      zh: ['CN', 'TW', 'HK'],
      tr: ['TR']
    };

    for (const [language, countries] of Object.entries(languageCountryMapping)) {
      if (countries.includes(countryCode)) {
        return language;
      }
    }
    return null;
  },

  /**
   * Detect the browser's preferred language.
   * @returns {string} Browser's language code (e.g., 'en').
   */
  detectBrowserLanguage() {
    const browserLanguage = navigator.language || navigator.languages[0];
    return browserLanguage?.split('-')[0];
  },

  /**
   * Set the application's language in the i18n instance and update global state.
   * @param {object} i18n - The i18n instance from vue-i18n.
   * @param {string} language - Language code to set.
   * @param {object} selectedLanguage - The global reactive language state.
   */
  setLanguage(i18n, language, selectedLanguage) {
    if (i18n.mode === 'legacy') {
      i18n.global.locale = language; // Legacy mode
    } else {
      i18n.global.locale.value = language; // Composition API mode
    }

    selectedLanguage.value = language;
    console.log(`Session language set to: ${language}`);
  }
};

export default LocalizationService;
