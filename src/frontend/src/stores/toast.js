import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toastSystem = ref(null);

  // Method to register the toast system component
  function setToastSystem(system) {
    toastSystem.value = system;
  }

  // Show a toast notification
  function showToast({ 
    title, 
    message = '', 
    type = 'info', 
    duration = 5000, 
    showProgress = true,
    dismissible = true,
    actions = [] 
  }) {
    if (!toastSystem.value) {
      console.warn('Toast system not initialized');
      return null;
    }
    
    return toastSystem.value.showToast({
      title,
      message,
      type,
      duration,
      showProgress,
      dismissible,
      actions
    });
  }

  // Dismiss a toast notification
  function dismissToast(id) {
    if (!toastSystem.value) {
      console.warn('Toast system not initialized');
      return;
    }
    
    toastSystem.value.dismissToast(id);
  }

  // Update a toast notification
  function updateToast(id, updates) {
    if (!toastSystem.value) {
      console.warn('Toast system not initialized');
      return;
    }
    
    toastSystem.value.updateToast(id, updates);
  }

  return {
    setToastSystem,
    showToast,
    dismissToast,
    updateToast
  };
}); 