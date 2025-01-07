<template>
  <main id="app">
    <LoadingScreen />
    <Header />
    <router-view />
    <Footer v-if="!isWhitepaper" />
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import LoadingScreen from '@/components/LoadingScreen.vue';

const route = useRoute();
const isWhitepaper = computed(() => route.path === '/whitepaper');
</script>

<style scoped>
/* Global styles (optional) */
</style>
