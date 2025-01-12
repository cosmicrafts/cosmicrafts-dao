<!-- File: App.vue -->
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Modal from '@/components/Modal.vue'; 

const route = useRoute();
const isWhitepaper = computed(() => route.path === '/whitepaper');
</script>

<template>
  <main id="app">
    <Header />
    <Modal />
    <router-view />
    <Footer v-if="!isWhitepaper" />
  </main>
</template>

<style scoped>
/* Global styles (optional) */
</style>
