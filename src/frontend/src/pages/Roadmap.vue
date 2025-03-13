<template>
  <div class="roadmap-page cosmic-page-bg with-glow">
    <!-- Hero Section -->
    <RoadmapHero />
    
    <!-- Search and Filter Section -->
    <div class="roadmap-search-container">
      <div class="cosmic-container">
        <SearchFilters 
          :availableYears="availableYears"
          :availableMilestones="availableMilestones"
          :availableTags="availableTags"
          @filter-changed="handleFilterChanges"
        />
      </div>
    </div>

    <!-- Roadmap Display -->
    <div class="roadmap-display-container">
      <RoadmapDisplay :quarters="filteredQuarters" />
    </div>
  </div>
</template>

<script setup>
// Import components
import { RoadmapHero, SearchFilters, RoadmapDisplay } from '@/components/roadmap';
// Import roadmap composable
import useRoadmap from '@/composables/useRoadmap';

// Use the roadmap composable to get all the necessary data and methods
const { 
  filteredQuarters, 
  availableYears, 
  availableMilestones, 
  availableTags, 
  handleFilterChanges 
} = useRoadmap();
</script>

<style scoped>
.roadmap-page {
  width: 100%;
  overflow-x: hidden;
}

.roadmap-display-container {
  width: 100%;
  max-width: var(--cosmic-container-max);
  margin: 0 auto;
  padding: 0 var(--space-md);
  overflow-x: hidden;
}
</style>