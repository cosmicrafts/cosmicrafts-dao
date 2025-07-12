<template>
  <div class="battlegrounds-container">
    <section class="battlegrounds-hero">
      <h1>Cosmicrafts Battlegrounds</h1>
      <p>Massive multiplayer battles are coming soon. Stay tuned!</p>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.battlegrounds-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--cosmic-bg-darkest) 0%, var(--cosmic-bg-dark) 100%);
  color: var(--cosmic-text-primary);
}
.battlegrounds-hero {
  text-align: center;
}
.battlegrounds-hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
.battlegrounds-hero p {
  font-size: 1.2rem;
  color: var(--cosmic-text-secondary);
}
</style> 