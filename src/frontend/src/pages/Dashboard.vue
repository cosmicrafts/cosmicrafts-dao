<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <section class="dashboard">
    <h1>{{ t('header.dashboard') }}</h1>
    <p>{{ t('header.dashboard') }}</p>
    <!-- Add your dashboard content here -->
  </section>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  text-align: center;
}

.dashboard h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.dashboard p {
  font-size: 1.2rem;
  color: #ddd;
}
</style>
