import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { createI18n } from 'vue-i18n';

import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import pt from '@/locales/pt.json';
import ru from '@/locales/ru.json';
import ar from '@/locales/ar.json';
import vi from '@/locales/vi.json';
import ko from '@/locales/ko.json';
import ja from '@/locales/ja.json';
import zh from '@/locales/zh.json';
import tr from '@/locales/tr.json';

// i18n setup
export const i18n = createI18n({
  legacy: false,
  locale: 'en', // Default locale
  fallbackLocale: 'en', // Fallback locale
  messages: {
    en,
    es,
    fr,
    de,
    pt,
    ru,
    ar,
    vi,
    ko,
    ja,
    zh,
    tr,
  },
});

const API_URLS = [
  'https://ipapi.co/json/',
  'https://ipwhois.app/json/',
  'https://geolocation-db.com/json/',
];

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref('en'); // Default language

  // Watch for changes in `currentLanguage` and sync with `i18n.global.locale`
  watch(currentLanguage, (newLang) => {
    i18n.global.locale = newLang; // Update the locale for i18n
  });

  /**
   * Detect the user's preferred language based on IP geolocation.
   */
  async function detectLanguage() {
    for (const url of API_URLS) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        const data = await response.json();
        const countryCode = data.country_code || data.countryCode || data.location?.country_code;
        return mapLanguageByCountry(countryCode) || detectBrowserLanguage();
      } catch {
        continue;
      }
    }
    return detectBrowserLanguage(); // Fallback to browser language
  }

  /**
   * Map a country code to a language code.
   */
  function mapLanguageByCountry(countryCode) {
    const languageCountryMapping = {
      en: ['US', 'GB', 'AU', 'CA', 'NZ', 'IE'],
      es: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE'],
      fr: ['FR', 'CA', 'BE', 'CH'],
      de: ['DE', 'AT', 'CH'],
      pt: ['PT', 'BR', 'AO', 'MZ'],
      ru: ['RU', 'BY', 'KZ'],
      ar: ['AE', 'SA', 'EG', 'IQ', 'DZ'],
      vi: ['VN'],
      ko: ['KR'],
      ja: ['JP'],
      zh: ['CN', 'HK', 'TW'],
      tr: ['TR'],
    };
    return Object.entries(languageCountryMapping).find(([, countries]) =>
      countries.includes(countryCode)
    )?.[0];
  }

  /**
   * Detect the browser's preferred language.
   */
  function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.languages[0];
    return browserLang?.split('-')[0];
  }

  /**
   * Set the application's language and persist it.
   */
  function setLanguage(lang) {
    currentLanguage.value = lang; // Update the language state
    localStorage.setItem('preferredLanguage', lang); // Persist language
  }

  /**
   * Load the language: from local storage, detect, or use the default.
   */
  async function loadLanguage() {
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      const detectedLanguage = await detectLanguage();
      setLanguage(detectedLanguage || 'en'); // Fallback to English
    }
  }

  return { currentLanguage, loadLanguage, setLanguage };
});
