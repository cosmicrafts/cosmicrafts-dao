import { defineStore } from 'pinia';
import { ref } from 'vue';

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
    tr: ['TR'],
  };

  const API_URLS = [
    //'https://ipapi.co/json/',
    'https://ipwhois.app/json/',
    'https://geolocation-db.com/json/',
  ];

  function mapLanguageByCountry(countryCode) {
    for (const [language, countries] of Object.entries(languageCountryMapping)) {
      if (countries.includes(countryCode)) {
        return language;
      }
    }
    return null;
  }

  function detectBrowserLanguage() {
    const browserLanguage = navigator.language || navigator.languages[0];
    return browserLanguage?.split('-')[0];
  }

  async function detectLanguage() {
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
        const language = mapLanguageByCountry(countryCode);

        if (language) {
          console.log(`Language detected from ${url}: ${language}`);
          return language;
        }
      } catch (error) {
        console.warn(`Error fetching from ${url}:`, error.message);
      }
    }

    console.warn('All geolocation API attempts failed. Falling back to browser language.');
    return detectBrowserLanguage() || 'en';
  }

  function setLanguage(lang) {
    currentLanguage.value = lang;
    localStorage.setItem('preferredLanguage', lang);
  }

  async function loadLanguage() {
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      const detectedLanguage = await detectLanguage();
      setLanguage(detectedLanguage || 'en');
    }
  }

  return {
    currentLanguage,
    loadLanguage,
    setLanguage,
    detectLanguage,
  };
});