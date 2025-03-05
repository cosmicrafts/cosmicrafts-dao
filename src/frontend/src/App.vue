<!-- File: App.vue -->
<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Modal from '@/components/Modal.vue'; 
import Chat from "@/components/Chat.vue";
import EscMenu from "@/components/EscMenu.vue";
import vScrollToTop from '@/directives/scrollToTop';

const route = useRoute();
const isWhitepaper = computed(() => route.path === '/whitepaper');
const isGame = computed(() => route.path === '/game');

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
const chatRef = ref(null);

// Method to check if any other windows are open
const areOtherWindowsOpen = () => {
  // Check if the Chat component is showing
  if (chatRef.value?.isOpen) {
    return true;
  }
  
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
  <main id="app" @keydown.esc="handleEscKey">
    <Header />
    <Chat ref="chatRef" />
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
  </main>
</template>

<style scoped>
/* Global styles (optional) */
</style>
