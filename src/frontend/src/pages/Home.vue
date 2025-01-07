<template>
  <div>
    <!-- Hero Section -->
    <div class="hero-wrapper">
      <HeroSection @ctaClick="handleCtaClick" />
    </div>
  </div>
</template>

<script setup>
import HeroSection from '@/components/HeroSection.vue';
import Lore from '@/components/Lore.vue';
import Lore2 from '@/components/Lore2.vue';

const handleCtaClick = (action) => {
  console.log(`CTA button clicked with action: ${action}`);
};
</script>

  
  <style scoped>

  .hero {
    position: relative;
    z-index: 2;
    margin-top: 0;
  }
  

  .carousel {
    margin-top: 0rem;
    height: 24rem;
  }
  
  .lore,
  .games,
  .cta-section {
    margin-top: 2rem;
    z-index: 100;
  }
  
  .cta-button {
    background-color: #4a90e2;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .cta-button:hover {
    background-color: #3a7bd5;
  }
  
  .game-highlight {
    margin-top: 1rem;
    padding: 1rem;
    border-top: 1px solid #3a3a3a;
  }
  </style>
  