import { createApp, ref, provide } from 'vue';
import App from './App.vue';
import { createI18n } from 'vue-i18n';
import router from './router';
import './style.css';
import { useLoadingScreen } from '@/utils/useLoadingScreen';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

// Import language files
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

// Initialize Pinia
const pinia = createPinia();
app.use(pinia); // Use Pinia
const authStore = useAuthStore();
authStore.loadStateFromLocalStorage();

const { showLoadingScreen, hideLoadingScreen } = useLoadingScreen();
// Router Navigation Guards
router.beforeEach((to, from, next) => {
  const t = i18n.global.t;

  if (to.path === '/dao') {
    showLoadingScreen(t, 'header.dao');
  } else if (to.path === '/whitepaper') {
    showLoadingScreen(t, 'header.whitepaper');
  } else {
    showLoadingScreen(t, 'header.home');
  }

  // Update the document title based on the route's meta title
  if (to.meta.title) {
    document.title = t(to.meta.title); // Use the translation key to set the title
  } else {
    document.title = t('header.default'); // Fallback title
  }

  next();
});

router.afterEach(() => {
  setTimeout(() => {
    hideLoadingScreen(); // Hide loading screen after 1 second
  }, 0);
});

// Define `selectedLanguage` as a global state
const selectedLanguage = ref('en');
app.provide('selectedLanguage', selectedLanguage); // Provide it globally

app.use(router).use(i18n).mount('#app');
