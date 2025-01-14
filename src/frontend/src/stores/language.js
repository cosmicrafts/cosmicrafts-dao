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

  const languageMapping = {
    vi: 'vi',
    en: 'en',
    es: 'es',
    fr: 'fr',
    de: 'de',
    pt: 'pt',
    ru: 'ru',
    ar: 'ar',
    ko: 'ko',
    ja: 'ja',
    zh: 'zh',
    tr: 'tr',
  };

  // Watch for changes in `currentLanguage` and sync with `i18n.global.locale`
  watch(currentLanguage, (newLang) => {
    i18n.global.locale = newLang; // Update the locale for i18n
  });

  function mapLanguageCode(code) {
    return languageMapping[code] || 'en'; // Fallback to English
  }

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

  function setLanguage(lang) {
    currentLanguage.value = lang; // Update the language state
    localStorage.setItem('preferredLanguage', lang); // Persist language
  }

  async function loadLanguage() {
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      const detectedLanguage = await detectLanguage();
      setLanguage(detectedLanguage || 'en'); // Fallback to English
    }
  }

  return {
    currentLanguage,
    loadLanguage,
    setLanguage,
    mapLanguageCode, // Export the mapping function
  };
});
