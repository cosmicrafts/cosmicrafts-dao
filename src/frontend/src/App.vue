<!-- File: App.vue -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Modal from '@/components/Modal.vue'; 
import Chat from "@/components/Chat.vue";

const route = useRoute();
const isWhitepaper = computed(() => route.path === '/whitepaper');
const isGame = computed(() => route.path === '/game');
</script>

<template>
  <main id="app">
    <Header />
    <Chat />
    <Modal />
    <router-view />
    <Footer v-if="!isWhitepaper && !isGame" />
  </main>
</template>

<style scoped>
/* Global styles (optional) */
</style>
