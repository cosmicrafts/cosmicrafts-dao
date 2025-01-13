import { createApp, ref, provide } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import router from './router';
import './style.css';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import LocalizationService from '@/services/LocalizationService';
import { nat8ToLanguageMapping } from '@/utils/languageMapping';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import vi from './locales/vi.json';
import ko from './locales/ko.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';
import tr from './locales/tr.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
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

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

const authStore = useAuthStore();
console.log('AuthStore instance:', authStore);
console.log('AuthStore methods:', Object.keys(authStore));
authStore.loadStateFromLocalStorage();

// Check if there is an identity; if not, create a guest account
(async () => {
  authStore.loadStateFromLocalStorage(); // Load the store from localStorage

  // If authenticated and a seedPhrase exists, recreate the identity
  if (authStore.isAuthenticated() && authStore.seedPhrase) {
    console.log("Restoring identity from saved seed phrase...");
    await authStore.handleLoginFlow(authStore.seedPhrase);
  } else {
    console.log("No saved identity found. Creating a guest account...");
    await authStore.createAutomatedAccount();
  }
})();

const selectedLanguage = ref('en');
app.provide('selectedLanguage', selectedLanguage);

(async () => {
  try {
    console.log('Starting language detection flow...');
    authStore.loadStateFromLocalStorage();

    // Check authentication and player data
    if (authStore.isAuthenticated() && authStore.player) {
      console.log('Authenticated user detected. Player data:', authStore.player);

      const player = authStore.player;
      if (player.language != null) {
        console.log('Language found in player data (Nat8):', player.language);
        const language = nat8ToLanguageMapping[player.language] || 'en';
        console.log('Mapped language:', language);

        // Prioritize player's language
        LocalizationService.setLanguage(i18n, language, selectedLanguage);
        console.log('Language successfully set to:', language);
      } else {
        console.warn('Player data exists, but language is null. Defaulting to detection...');
        const detectedLanguage = await LocalizationService.detectLanguage();
        console.log('Detected language:', detectedLanguage);
        LocalizationService.setLanguage(i18n, detectedLanguage, selectedLanguage);
      }
    } else {
      console.log('Unauthenticated session or no player data. Detecting language...');
      const detectedLanguage = await LocalizationService.detectLanguage();
      console.log('Detected language:', detectedLanguage);
      LocalizationService.setLanguage(i18n, detectedLanguage, selectedLanguage);
    }

    console.log('Language detection flow completed.');
  } catch (error) {
    console.error('Error during language detection:', error.message, error);
    LocalizationService.setLanguage(i18n, 'en', selectedLanguage);
    console.log('Defaulted language to English due to an error.');
  }
})();

app.use(router).use(i18n).mount('#app');
