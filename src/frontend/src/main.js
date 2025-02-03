import { createApp, watch } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { createI18n } from 'vue-i18n';
import './style.css';
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
const languageStore = useLanguageStore();

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

// Load stored state and language
const hasUserData = await authStore.loadStateFromLocalStorage();

if (!hasUserData) {
  console.log('No user data found in local storage. Detecting language...');
  const detectedLanguage = await languageStore.detectLanguage();
  languageStore.setLanguage(detectedLanguage || 'en');
} else {
  console.log('User data found in local storage. Skipping language detection.');
  // If user data is found, load the language from the store
  await languageStore.loadLanguage();
}

// Watch for changes in the current language and update i18n
watch(
  () => languageStore.currentLanguage,
  (newLang) => {
    i18n.global.locale.value = newLang;
    console.log(`i18n locale updated to: ${newLang}`);
  },
  { immediate: true }
);



app.use(i18n);
app.use(router);
app.mount('#app');