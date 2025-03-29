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

import AccountManagement from '@/components/wallet/AccountManagement.vue';

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

// Register global components
app.component('AccountManagement', AccountManagement);

// Bootstrap the application - First mount the app, then load user data
// This ensures the UI is visible immediately before data loading
app.use(i18n);
app.use(router);
app.mount('#app');

// GLOBAL initialization state to ensure proper coordination
let isIdentityInitialized = false;
let isCanisterInitialized = false;

// Unified initialization flow to properly coordinate identity and canister setup
(async function initializeApplication() {
  console.log('Starting unified application initialization...');
  
  try {
    // First: Initialize identity
    console.log('STEP 1: Initializing identity...');
    const { useAuthStore } = await import('@/stores/auth');
    const authStore = useAuthStore();
    
    // First try loading state from localStorage with a proper await
    // This is critical as it loads the seed phrase needed for identity
    await authStore.loadStateFromLocalStorage();
    console.log('State loaded from localStorage - authenticated:', authStore.authenticated);
    
    // Then initialize identity from cache with force option
    // This will ensure we create the identity object from the seed phrase
    let identityInitialized = false;
    
    // Always attempt initialization with force=true 
    identityInitialized = authStore.initializeIdentityFromCache(true);
    console.log(`Direct identity initialization result: ${identityInitialized ? 'SUCCESS' : 'FAILED'}`);
    
    if (!identityInitialized) {
      console.log('Identity initialization failed. Check if there is a valid seed phrase.');
      
      // If we still have authenticated = true but no seed phrase, fix this inconsistency
      if (authStore.authenticated && !authStore.seedPhrase) {
        console.warn('Authentication state inconsistency detected. Resetting authenticated state.');
        authStore.authenticated = false;
      }
    }
    
    isIdentityInitialized = identityInitialized;
    console.log(`Identity initialization: ${identityInitialized ? 'SUCCESSFUL' : 'FAILED - limited functionality'}`);
    
    // Second: Initialize canister EVEN IF identity failed - we'll use anonymous agent
    console.log('STEP 2: Initializing canisters...');
    const { useCanisterStore } = await import('@/stores/canister');
    const canisterStore = useCanisterStore();
    
    // This will use the identity if available, or create anonymous agent if not
    const canisterInitialized = await canisterStore.initializeImmediately();
    isCanisterInitialized = true; // Mark as initialized even if it returns false
    console.log(`Canister initialization: ${canisterInitialized ? 'SUCCESSFUL' : 'LIMITED - anonymous mode'}`);
    
    // Third: Initialize language if we have player data
    if (authStore.player?.language) {
      console.log('STEP 3: Initializing language...');
      try {
        const { useLanguageStore } = await import('@/stores/language');
        const languageStore = useLanguageStore();
        const language = authStore.player.language;
        languageStore.setLanguage(language);
        console.log(`Language initialized to: ${language}`);
      } catch (langError) {
        console.warn('Error initializing language:', langError);
      }
    }
    
    // Now that core initialization is complete, we can load user data
    console.log('Core initialization complete, proceeding with user data loading...');
    loadUserData();
    
  } catch (err) {
    console.error('Error during application initialization:', err);
    // Still try to load user data even if core initialization failed
    loadUserData();
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
      // The initial initialization already called loadStateFromLocalStorage
      // Just check if we're authenticated now
      console.log(authStore.authenticated ? 'User authenticated' : 'No user data found');
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
};