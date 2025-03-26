// Import styles first to ensure they load before components
import './style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import core Vue dependencies
import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// Import translations
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
import { registerSW } from 'virtual:pwa-register';

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en, es, fr, de, pt, ru, ar, vi, ko, ja, zh, tr,
  },
});

// Create Vue app and Pinia store
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Reload to update?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App is ready to work offline!");
  },
});

// Bootstrap the application - First mount the app, then load user data
// This ensures the UI is visible immediately before data loading
app.use(i18n);
app.use(router);
app.mount('#app');

// Add immediate identity initialization
// This needs to happen BEFORE any data loading to ensure canister calls can work
(async function initializeAuth() {
  try {
    // Import auth store synchronously first
    const { useAuthStore } = await import('@/stores/auth');
    const authStore = useAuthStore();
    
    // Initialize identity immediately so it's available for all canister calls
    const initialized = authStore.initializeIdentityFromCache();
    console.log(`Identity immediate initialization: ${initialized ? 'successful' : 'not needed'}`);
  } catch (err) {
    console.warn('Error during immediate identity initialization:', err);
  }
})();

// Parallel loading of user data tasks - fully non-blocking architecture
const loadUserData = () => {
  console.log("Loading user data in background...");
  
  // Pre-fetch both imports concurrently but don't await - start them immediately
  const authStoreImport = import('@/stores/auth');
  const languageStoreImport = import('@/stores/language');
  
  // Load auth in the background
  authStoreImport.then(({ useAuthStore }) => {
    const authStore = useAuthStore();
    
    // Wrap in try-catch to ensure errors don't break the app
    try {
      // Load auth data independently - doesn't block anything else
      authStore.loadStateFromLocalStorage().then(hasUserData => {
        // Authentication data loaded - no waiting or callbacks
        console.log(hasUserData ? 'User authenticated' : 'No user data found');
      }).catch(err => {
        console.warn('Auth data loading error:', err);
        // Continue app operation even if auth fails
      });
    } catch (criticalError) {
      console.error('Critical auth store initialization error:', criticalError);
      // App can still function without auth data
    }
  }).catch(err => {
    console.warn('Auth store import error:', err);
  });
  
  // Load language in parallel - completely independent from auth
  languageStoreImport.then(({ useLanguageStore }) => {
    const languageStore = useLanguageStore();
    
    // Load language independently
    languageStore.loadLanguage().then(() => {
      // Update i18n when language is ready
      watch(
        () => languageStore.currentLanguage,
        (newLang) => {
          i18n.global.locale.value = newLang;
          console.log(`i18n locale updated to: ${newLang}`);
        },
        { immediate: true }
      );
    }).catch(err => {
      console.warn('Language data loading error:', err);
      // Fallback to browser language detection on error
      languageStore.detectLanguage().then(detectedLang => {
        languageStore.setLanguage(detectedLang || 'en');
      });
    });
  }).catch(err => {
    console.warn('Language store import error:', err);
  });
  
  // Pre-load other stores that might be needed soon in parallel
  // This happens concurrently with auth and language loading
  Promise.all([
    // Pre-fetch token store module (but don't initialize yet)
    import('@/stores/token'),
    // Wait a bit before loading the canister store to spread the load
    new Promise(resolve => setTimeout(() => 
      import('@/stores/canister').then(resolve), 
      300
    ))
  ]).catch(err => {
    console.warn('Error pre-loading stores:', err);
  });
};

// Start loading immediately but give the UI rendering thread priority
// by pushing this to the end of the event queue
setTimeout(loadUserData, 0);