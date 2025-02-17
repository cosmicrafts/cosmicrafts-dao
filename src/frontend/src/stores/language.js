import { defineStore } from 'pinia';
import { ref } from 'vue';

export const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref('en'); // Default language



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

  function getLanguageLabel(code) {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.label : 'English'; // Default to English if not found
  }

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
    for (const url of [
      'https://ipapi.co/json/',
      'https://ipwhois.app/json/',
      'https://geolocation-db.com/json/',
    ]) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        const countryCode = data.country_code || data.countryCode || data.location?.country_code;
        const language = mapLanguageByCountry(countryCode);
        if (language) return language;
      } catch (error) {
        console.warn(`Error fetching from ${url}:`, error.message);
      }
    }
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
    languages,
    loadLanguage,
    setLanguage,
    detectLanguage,
    getLanguageLabel,
  };
});
