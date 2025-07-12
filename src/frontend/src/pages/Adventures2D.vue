<template>
  <div class="adventures2d-container">
    <section class="adventures2d-hero">
      <h1>Cosmicrafts Adventures 2D</h1>
      <p>A retro-inspired 2D version of Cosmicrafts. Coming soon!</p>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.adventures2d-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--cosmic-bg-darkest) 0%, var(--cosmic-bg-dark) 100%);
  color: var(--cosmic-text-primary);
}
.adventures2d-hero {
  text-align: center;
}
.adventures2d-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
.adventures2d-hero p {
  font-size: 1.2rem;
  color: var(--cosmic-text-secondary);
}
</style> 