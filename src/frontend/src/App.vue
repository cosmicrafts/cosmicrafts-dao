<!-- File: App.vue -->
<script setup>
import { computed, ref, onMounted, onUnmounted, watch, provide } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import Modal from '@/components/core/modals/BaseModal.vue'; 
// Temporarily disabled Chat component for performance testing
// import Chat from "@/components/core/Chat.vue";
import EscMenu from "@/components/navigation/menus/EscMenu.vue";
import NotificationSystem from '@/components/ui/notifications/NotificationSystem.vue';
import ToastNotificationSystem from '@/components/dashboard/ui/ToastNotificationSystem.vue';
import vScrollToTop from '@/directives/scrollToTop';
import { useToastStore } from '@/stores/toast';

const route = useRoute();
const isWhitepaper = computed(() => route.path === '/whitepaper');
const isGame = computed(() => route.path === '/game');
const toastStore = useToastStore();
const globalToastSystem = ref(null);

// Add welcome tooltip state
const hasShownWelcome = ref(localStorage.getItem('hasShownWelcome') === 'true');
const showWelcomeTooltip = ref(false);

// Provide welcome tooltip state to Chat component - keep for when we re-enable it
provide('showWelcomeTooltip', showWelcomeTooltip);

// Add watcher for route changes to force scroll to top
watch(
  () => route.path,
  (newPath, oldPath) => {
    // Don't interfere with hash navigation within the whitepaper
    if (newPath === '/whitepaper' && route.hash) {
      return;
    }
    
    // For all other route changes, force scroll to top
    if (newPath !== oldPath) {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure it happens after the view transition
    }
  }
);

// State for tracking if other windows are open
const isEscMenuOpen = ref(false);
// Temporarily keep chatRef but not initialize it
const chatRef = ref(null);

// Provide chat reference to child components
provide('chatRef', chatRef);

// Method to check if any other windows are open
const areOtherWindowsOpen = () => {
  // Chat is disabled for performance testing
  // if (chatRef.value?.isOpen) {
  //   return true;
  // }
  
  // Add checks for other windows/modals here if needed
  // (e.g., modal dialogs, settings windows, etc.)
  
  return false;
};

// Dedicated handler for ESC key at the template level
const handleEscKey = (event) => {
  // Check if we're typing in an input field
  const activeElement = document.activeElement;
  const isInputActive = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement ||
                        activeElement?.getAttribute('contenteditable') === 'true';
  
  if (isInputActive) {
    return; // Don't interfere with input fields
  }
  
  // If other windows are open, let them handle the ESC key
  if (areOtherWindowsOpen()) {
    return;
  }
  
  // Toggle the menu if no other windows are open
  isEscMenuOpen.value = !isEscMenuOpen.value;
  event.stopPropagation();
  event.preventDefault();
};

// The existing handleKeyDown function - only use for initialization 
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    handleEscKey(event);
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  
  // Register the toast system with the store
  if (globalToastSystem.value) {
    toastStore.setToastSystem(globalToastSystem.value);
  }
  
  // Show welcome tooltip after 10 seconds if it hasn't been shown before
  if (!hasShownWelcome.value) {
    setTimeout(() => {
      showWelcomeTooltip.value = true;
      // Hide tooltip after 8 seconds
      setTimeout(() => {
        showWelcomeTooltip.value = false;
        // Mark as shown in localStorage
        localStorage.setItem('hasShownWelcome', 'true');
        hasShownWelcome.value = true;
      }, 8000);
    }, 10000);
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// Method to close the ESC menu
const closeEscMenu = () => {
  isEscMenuOpen.value = false;
};
</script>

<template>
  <!-- Temporarily disabled Chat Component for performance testing -->
  <!-- <Chat 
    ref="chatRef"
    :show-welcome-tooltip="showWelcomeTooltip"
  /> -->
  
  <main id="app" @keydown.esc="handleEscKey">
    <Header />
    <Modal />
    <router-view v-scroll-to-top />
    <Footer v-if="!isWhitepaper && !isGame" />
    
    <!-- ESC Menu component -->
    <EscMenu 
      :isOpen="isEscMenuOpen" 
      :otherWindowsOpen="areOtherWindowsOpen()"
      @close="closeEscMenu"
      @update:isOpen="isEscMenuOpen = $event"
    />
    
    <!-- Notification Systems -->
    <NotificationSystem position="top-right" />
    <!-- Replace ToastNotificationSystem with a comment explaining the change -->
    <!-- ToastNotificationSystem has been replaced by the global NotificationSystem -->
  </main>
</template>

<style scoped>
/* Global styles (optional) */
</style>
