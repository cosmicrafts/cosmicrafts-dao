import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

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

  const API_URLS = [
    'https://ipapi.co/json/',
    'https://ipwhois.app/json/',
    'https://geolocation-db.com/json/',
  ];

  function mapLanguageCode(code) {
    return languageMapping[code] || 'en';
  }

  async function detectLanguage() {
    for (const url of API_URLS) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        const data = await response.json();
        const countryCode = data.country_code || data.countryCode || data.location?.country_code;
        return mapLanguageCode(countryCode) || detectBrowserLanguage();
      } catch {
        continue;
      }
    }
    return detectBrowserLanguage();
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
    mapLanguageCode,
  };
});