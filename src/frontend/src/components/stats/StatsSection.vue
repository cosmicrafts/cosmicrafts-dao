<template>
  <section class="dashboard-section stats-section cosmic-panel">
    <div class="section-header">
      <h2>Player Stats</h2>
    </div>
    
    <div class="stats-content">
      <div class="coming-soon-placeholder">
        <i class="fas fa-chart-bar"></i>
        <p>Stats Dashboard coming soon!</p>
        <p class="subtitle">Track your gameplay metrics and performance</p>
      </div>
    </div>
  </section>
</template>

<script setup>
// This is a placeholder component for the Stats section
// It will be expanded with real stats content in future updates
</script>

<style scoped>
.dashboard-section {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.section-header h2 {
  font-size: 1.2rem;
  margin: 0;
  color: var(--cosmic-text-primary);
  font-weight: 700;
}

.coming-soon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.coming-soon-placeholder i {
  font-size: 3rem;
  color: var(--cosmic-blue);
  margin-bottom: 1rem;
  opacity: 0.7;
}

.coming-soon-placeholder p {
  font-size: 1.2rem;
  color: var(--cosmic-text-primary);
  margin: 0.5rem 0;
}

.coming-soon-placeholder .subtitle {
  font-size: 1rem;
  color: var(--cosmic-text-tertiary);
}
</style> 