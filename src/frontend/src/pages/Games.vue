<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <section class="games">
    <h1>{{ t('header.games') }}</h1>
    <p>{{ t('header.games') }}</p>
    <!-- Add your games list or content here -->
  </section>
</template>

<style scoped>
.games {
  padding: 2rem;
  text-align: center;
}

.games h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.games p {
  font-size: 1.2rem;
  color: #ddd;
}
</style>
