import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore, i18n } from '@/stores/language';
import './style.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const authStore = useAuthStore();
const languageStore = useLanguageStore();

// Load stored state and language
await authStore.loadStateFromLocalStorage();
await languageStore.loadLanguage();

app.use(i18n);
app.use(router);

console.log('AuthStore instance:', authStore, Object.keys(authStore));
console.log('LanguageStore instance:', languageStore, Object.keys(languageStore));

app.mount('#app');
