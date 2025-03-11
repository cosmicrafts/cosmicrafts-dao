<template>
  <div class="careers-page">
    <!-- Unified Cosmic Background Elements -->
    <div class="cosmic-background">
      <!-- Starfield -->
      <div class="cosmic-starfield">
        <div class="cosmic-star" style="--size: 3px; --top: 5%; --left: 10%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 15%; --left: 30%;"></div>
        <div class="cosmic-star" style="--size: 4px; --top: 30%; --left: 70%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 45%; --left: 85%;"></div>
        <div class="cosmic-star" style="--size: 3px; --top: 60%; --left: 45%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 75%; --left: 20%;"></div>
        <div class="cosmic-star" style="--size: 3px; --top: 20%; --left: 50%;"></div>
        <div class="cosmic-star" style="--size: 4px; --top: 40%; --left: 60%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 55%; --left: 15%;"></div>
        <div class="cosmic-star" style="--size: 3px; --top: 70%; --left: 90%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 85%; --left: 60%;"></div>
        <div class="cosmic-star" style="--size: 4px; --top: 95%; --left: 75%;"></div>
        <div class="cosmic-star" style="--size: 3px; --top: 8%; --left: 25%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 25%; --left: 5%;"></div>
        <div class="cosmic-star" style="--size: 3px; --top: 50%; --left: 40%;"></div>
        <div class="cosmic-star" style="--size: 2px; --top: 65%; --left: 80%;"></div>
        <div class="cosmic-star" style="--size: 4px; --top: 80%; --left: 35%;"></div>
        <div class="cosmic-star" style="--size: 3px; --top: 90%; --left: 10%;"></div>
      </div>
      
      <!-- Nebulas -->
      <div class="cosmic-nebula left-top-nebula"></div>
      <div class="cosmic-nebula right-middle-nebula"></div>
      <div class="cosmic-nebula left-bottom-nebula"></div>
      
      <!-- Cosmic Dust Particles -->
      <div class="cosmic-dust-particles">
        <div class="dust-particle" style="--size: 3px; --delay: 0s; --speed: 20s;"></div>
        <div class="dust-particle" style="--size: 2px; --delay: 2s; --speed: 15s;"></div>
        <div class="dust-particle" style="--size: 4px; --delay: 4s; --speed: 25s;"></div>
        <div class="dust-particle" style="--size: 3px; --delay: 6s; --speed: 18s;"></div>
        <div class="dust-particle" style="--size: 2px; --delay: 8s; --speed: 22s;"></div>
        <div class="dust-particle" style="--size: 3px; --delay: 10s; --speed: 17s;"></div>
        <div class="dust-particle" style="--size: 4px; --delay: 12s; --speed: 24s;"></div>
        <div class="dust-particle" style="--size: 2px; --delay: 14s; --speed: 19s;"></div>
        <div class="dust-particle" style="--size: 3px; --delay: 16s; --speed: 21s;"></div>
        <div class="dust-particle" style="--size: 2px; --delay: 18s; --speed: 16s;"></div>
      </div>
      
      <!-- Cosmic Gradient Overlays -->
      <div class="cosmic-gradient-overlay top-gradient"></div>
      <div class="cosmic-gradient-overlay middle-gradient"></div>
      <div class="cosmic-gradient-overlay bottom-gradient"></div>
    </div>
    
    <!-- Content Sections -->
    <CareerHero />
    <CareerCulture />
    <CareerBenefits />
    <CareerPositions />
    <CareerProcess />
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
    title: 'Careers | Cosmicrafts DAO',
    meta: [
      { name: 'description', content: 'Join the Cosmicrafts team and help shape the future of decentralized gaming and NFTs. Explore career opportunities in blockchain technology, game design, and more.' }
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
  --cosmic-bg-dark: rgb(10, 14, 28);
  --hero-accent-glow: rgba(15, 185, 253, 0.3);
  --glass-blur: 60px;
  
  background-color: var(--cosmic-bg-dark);
  min-height: 100vh;
  color: var(--cosmic-text-primary);
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Unified Cosmic Background Styles */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Starfield Styles */
.cosmic-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300%;
  z-index: 1;
  pointer-events: none;
}

.cosmic-star {
  position: absolute;
  width: var(--size);
  height: var(--size);
  top: var(--top);
  left: var(--left);
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--size) * 2) rgba(255, 255, 255, 0.5),
              0 0 calc(var(--size) * 4) rgba(15, 185, 253, 0.3);
  animation: starTwinkle 3s infinite alternate;
  animation-delay: calc(var(--top) * 0.01s);
}

/* Nebula Styles */
.cosmic-nebula {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(60px);
  z-index: 1;
  pointer-events: none;
}

.left-top-nebula {
  top: -200px;
  left: -200px;
  background: radial-gradient(
    circle at center,
    rgba(103, 58, 183, 0.7) 0%,
    rgba(103, 58, 183, 0.3) 50%,
    rgba(103, 58, 183, 0) 70%
  );
  animation: nebulaFloat 20s infinite alternate var(--animation-smooth);
}

.right-middle-nebula {
  top: 50%;
  right: -300px;
  transform: translateY(-50%);
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.7) 0%,
    rgba(15, 185, 253, 0.3) 50%,
    rgba(15, 185, 253, 0) 70%
  );
  animation: nebulaFloat 25s infinite alternate-reverse var(--animation-smooth);
}

.left-bottom-nebula {
  bottom: -200px;
  left: -100px;
  background: radial-gradient(
    circle at center,
    rgba(103, 58, 183, 0.5) 0%,
    rgba(15, 185, 253, 0.3) 40%,
    rgba(15, 185, 253, 0) 70%
  );
  animation: nebulaFloat 22s infinite alternate var(--animation-smooth);
  animation-delay: 5s;
}

/* Dust Particles */
.cosmic-dust-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300%;
  z-index: 2;
  pointer-events: none;
}

.dust-particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--size) * 2) rgba(255, 255, 255, 0.5),
              0 0 calc(var(--size) * 4) rgba(15, 185, 253, 0.3);
  animation: floatDust var(--speed) linear infinite;
  animation-delay: var(--delay);
  opacity: 0.3;
}

.dust-particle:nth-child(1) { top: 10%; left: 20%; }
.dust-particle:nth-child(2) { top: 25%; left: 70%; }
.dust-particle:nth-child(3) { top: 40%; left: 30%; }
.dust-particle:nth-child(4) { top: 55%; left: 80%; }
.dust-particle:nth-child(5) { top: 70%; left: 15%; }
.dust-particle:nth-child(6) { top: 85%; left: 60%; }
.dust-particle:nth-child(7) { top: 15%; left: 45%; }
.dust-particle:nth-child(8) { top: 35%; left: 90%; }
.dust-particle:nth-child(9) { top: 65%; left: 40%; }
.dust-particle:nth-child(10) { top: 80%; left: 10%; }

/* Gradient Overlays for Seamless Section Transitions */
.cosmic-gradient-overlay {
  position: absolute;
  width: 100%;
  z-index: 3;
  pointer-events: none;
}

.top-gradient {
  top: 0;
  height: 100vh;
  background: linear-gradient(
    to bottom,
    var(--cosmic-bg-dark) 0%,
    transparent 30%,
    transparent 100%
  );
}

.middle-gradient {
  top: 100vh;
  height: 100vh;
  opacity: 0.8;
  background: radial-gradient(
    ellipse at center,
    rgba(15, 185, 253, 0.05) 0%,
    transparent 70%
  );
}

.bottom-gradient {
  top: 200vh;
  height: 100vh;
  background: linear-gradient(
    to top,
    var(--cosmic-bg-dark) 0%,
    transparent 30%,
    transparent 100%
  );
}

/* Animation Keyframes */
@keyframes starTwinkle {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes nebulaFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.15;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-30px) scale(1.1);
    opacity: 0.15;
  }
}

@keyframes floatDust {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0.2;
  }
  25% {
    opacity: 0.4;
  }
  50% {
    transform: translateY(-100px) translateX(100px);
    opacity: 0.3;
  }
  75% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-200px) translateX(200px);
    opacity: 0;
  }
}
</style>