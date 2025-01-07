import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const isLoading = ref(false);
const loadingMessage = ref('');

export function useLoadingScreen() {
  const showLoadingScreen = (translateFn, messageKey = 'header.home') => {
    loadingMessage.value = translateFn(messageKey); // Use the provided translation function
    isLoading.value = true;
  };

  const hideLoadingScreen = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    loadingMessage,
    showLoadingScreen,
    hideLoadingScreen,
  };
}