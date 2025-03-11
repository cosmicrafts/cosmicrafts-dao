<template>
  <div class="careers-page">
    <!-- Hero Section -->
    <CareerHero />
    
    <!-- Vision & Culture Section -->
    <CareerCulture />
    
    <!-- Benefits Section -->
    <CareerBenefits />
    
    <!-- Open Positions Section -->
    <CareerPositions />
    
    <!-- Application Process Section -->
    <CareerProcess />
    
    <!-- Join Our Community Section -->
    <CareerJoin />
  </div>
</template>

<script>
import CareerHero from '../components/careers/CareerHero.vue'
import CareerCulture from '../components/careers/CareerCulture.vue'
import CareerBenefits from '../components/careers/CareerBenefits.vue'
import CareerPositions from '../components/careers/CareerPositions.vue'
import CareerProcess from '../components/careers/CareerProcess.vue'
import CareerJoin from '../components/careers/CareerJoin.vue'

export default {
  name: 'Careers',
  components: {
    CareerHero,
    CareerCulture,
    CareerBenefits,
    CareerPositions,
    CareerProcess,
    CareerJoin
  },
  metaInfo: {
    title: 'Careers | CosmicRafts DAO',
    meta: [
      { name: 'description', content: 'Join the CosmicRafts team and help shape the future of decentralized gaming and NFTs. Explore career opportunities in blockchain technology, game design, and more.' }
    ]
  }
}
</script>

<style scoped>
.careers-page {
  --cosmic-glass-bg: rgba(16, 20, 38, 0.6);
  --cosmic-glass-bg-darker: rgba(16, 20, 38, 0.8);
  --cosmic-glass-bg-lighter: rgba(16, 20, 38, 0.4);
  --cosmic-glass-border: 1px solid rgba(255, 255, 255, 0.1);
  --cosmic-glass-border-blue: 1px solid rgba(15, 185, 253, 0.2);
  --cosmic-glow-blue-sm: 0 0 15px rgba(15, 185, 253, 0.15);
  --cosmic-glow-blue-md: 0 0 25px rgba(15, 185, 253, 0.25);
  --cosmic-shadow-sm: 0 4px 10px rgba(0, 0, 0, 0.1);
  --cosmic-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);
  --cosmic-shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.2);
  --cosmic-blue: rgb(15, 185, 253);
  --cosmic-purple: rgb(103, 58, 183);
  --cosmic-text-primary: rgb(245, 245, 255);
  --cosmic-text-secondary: rgba(245, 245, 255, 0.75);
  --cosmic-text-tertiary: rgba(245, 245, 255, 0.5);
  --animation-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-bounce: cubic-bezier(0.2, 0.8, 0.2, 1.2);
  --animation-delay-base: 0.1s;
  
  background-color: rgb(10, 14, 28);
  min-height: 100vh;
  color: var(--cosmic-text-primary);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-x: hidden;
}
</style>