<!-- File: App.vue -->
<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Modal from '@/components/Modal.vue'; 
import Chat from "@/components/Chat.vue";
import EscMenu from "@/components/EscMenu.vue";

const route = useRoute();
const isWhitepaper = computed(() => route.path === '/whitepaper');
const isGame = computed(() => route.path === '/game');

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

// Handle keyboard events for the Escape menu
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
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
    event.preventDefault();
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
  <main id="app">
    <Header />
    <Chat ref="chatRef" />
    <Modal />
    <router-view />
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
