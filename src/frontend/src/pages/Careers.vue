<template>
  <div class="careers-page">
    <!-- Enhanced Cosmic Background Elements -->
    <div class="cosmic-background">
      <!-- Dynamic Accent Glows -->
      <div class="cosmic-accent-glow top-left-glow"></div>
      <div class="cosmic-accent-glow bottom-right-glow"></div>
      
      <!-- Floating Elements -->
      <div class="floating-elements">
        <div class="floating-element" style="--delay: 0s; --depth: 30px; --rotation: -5deg; --top: 15%; --left: 10%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="floating-element" style="--delay: 1s; --depth: 60px; --rotation: 5deg; --top: 65%; --left: 20%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="floating-element" style="--delay: 2s; --depth: 90px; --rotation: -7deg; --top: 25%; --right: 12%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="floating-element" style="--delay: 3s; --depth: 40px; --rotation: 7deg; --bottom: 20%; --right: 15%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
      
      <!-- Cosmic Portal Elements -->
      <div class="cosmic-portal-bg">
        <div class="portal-ring outer-ring"></div>
        <div class="portal-ring inner-ring"></div>
        <div class="portal-shield"></div>
        <div class="portal-stars">
          <div class="portal-star" style="--index: 1;"></div>
          <div class="portal-star" style="--index: 2;"></div>
          <div class="portal-star" style="--index: 3;"></div>
          <div class="portal-star" style="--index: 4;"></div>
          <div class="portal-star" style="--index: 5;"></div>
          <div class="portal-star" style="--index: 6;"></div>
          <div class="portal-star" style="--index: 7;"></div>
          <div class="portal-star" style="--index: 8;"></div>
        </div>
        <div class="portal-glow"></div>
        <div class="portal-core"></div>
        
        <!-- Logo Watermark (positioned independently) -->
        <div class="cosmic-logo-watermark">
          <div class="logo-glow-effect"></div>
          <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts" class="logo-image" />
        </div>
        
        <!-- Energy Streams -->
        <div class="portal-energy-streams">
          <div class="energy-stream" style="--angle: 45deg;">
            <div class="energy-particles"></div>
          </div>
          <div class="energy-stream" style="--angle: 135deg;">
            <div class="energy-particles"></div>
          </div>
          <div class="energy-stream" style="--angle: 225deg;">
            <div class="energy-particles"></div>
          </div>
          <div class="energy-stream" style="--angle: 315deg;">
            <div class="energy-particles"></div>
          </div>
        </div>
        
        <!-- Hexagon Grid -->
        <div class="portal-hexagons">
          <div class="hexagon-grid"></div>
        </div>
        
        <!-- Data Points -->
        <div class="portal-data-points">
          <div class="data-point" style="--pos: 30%; --delay: 0s;"></div>
          <div class="data-point" style="--pos: 70%; --delay: 0.7s;"></div>
          <div class="data-point" style="--pos: 20%; --delay: 1.4s;"></div>
          <div class="data-point" style="--pos: 85%; --delay: 2.1s;"></div>
          <div class="data-point" style="--pos: 40%; --delay: 2.8s;"></div>
          <div class="data-point" style="--pos: 60%; --delay: 3.5s;"></div>
        </div>
      </div>
      
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
      </div>
      
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
      </div>
      
      <!-- Gradient Overlays -->
      <div class="cosmic-gradient-overlay top-gradient"></div>
      <div class="cosmic-gradient-overlay bottom-gradient"></div>
    </div>
    
    <!-- Content Sections -->
    <CareerHero />
    <CareerCulture />
    <CareerBenefits />
    <CareerPositions />
    <CareerJoin />
  </div>
</template>

<script>
import CareerHero from '../components/careers/CareerHero.vue'
import CareerCulture from '../components/careers/CareerCulture.vue'
import CareerBenefits from '../components/careers/CareerBenefits.vue'
import CareerPositions from '../components/careers/CareerPositions.vue'
import CareerJoin from '../components/careers/CareerJoin.vue'

export default {
  name: 'Careers',
  components: {
    CareerHero,
    CareerCulture,
    CareerBenefits,
    CareerPositions,
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

/* Enhanced Cosmic Background Styles */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  perspective: 1200px;
}

/* Dynamic Accent Glows */
.cosmic-accent-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(var(--glass-blur));
  opacity: 0.6;
  z-index: 1;
}

.top-left-glow {
  top: -50%;
  left: -20%;
  width: 70%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    var(--hero-accent-glow) 0%,
    rgba(15, 185, 253, 0.15) 30%,
    rgba(15, 185, 253, 0) 70%
  );
  animation: orbitEffect 20s infinite alternate var(--animation-smooth);
}

.bottom-right-glow {
  bottom: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(103, 58, 183, 0.3) 0%,
    rgba(103, 58, 183, 0.1) 50%,
    rgba(103, 58, 183, 0) 70%
  );
  animation: pulseBackground 15s infinite alternate var(--animation-smooth);
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  z-index: 2;
}

.floating-element {
  position: absolute;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 20, 38, 0.75);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 0 15px rgba(15, 185, 253, 0.15),
    0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  transform-style: preserve-3d;
  animation-timing-function: var(--animation-smooth);
  animation: float 10s infinite alternate;
  animation-delay: var(--delay);
  transform: rotate(var(--rotation)) translateZ(var(--depth));
}

.element-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  z-index: 1;
}

.element-particles span {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  opacity: 0.5;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
  animation: particleFloat 3s infinite alternate ease-in-out;
}

.element-particles span:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.element-particles span:nth-child(2) { top: 15%; right: 15%; animation-delay: 0.5s; }
.element-particles span:nth-child(3) { bottom: 15%; left: 15%; animation-delay: 1s; }
.element-particles span:nth-child(4) { bottom: 20%; right: 10%; animation-delay: 1.5s; }

/* Cosmic Portal Background */
.cosmic-portal-bg {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  z-index: 1;
  perspective: 1000px;
  opacity: 0.6;
}

.portal-ring {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  opacity: 0.6;
  animation-fill-mode: forwards;
}

.outer-ring {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(15, 185, 253, 0.5);
  box-shadow: 
    0 0 20px rgba(15, 185, 253, 0.3),
    0 0 40px rgba(15, 185, 253, 0.2),
    inset 0 0 20px rgba(15, 185, 253, 0.3);
  animation: portalPulse 8s infinite alternate var(--animation-smooth), 
             portalRotate 40s linear infinite;
  transform: scale(1) rotate(0deg);
}

.inner-ring {
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  border: 2px solid rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 0 15px rgba(15, 185, 253, 0.3),
    0 0 30px rgba(15, 185, 253, 0.1),
    inset 0 0 10px rgba(15, 185, 253, 0.3);
  animation: portalPulse 6s infinite alternate-reverse var(--animation-smooth), 
             portalRotate 30s linear infinite reverse;
  transform: scale(1) rotate(0deg);
}

.portal-shield {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 60%,
    rgba(15, 185, 253, 0.01) 80%
  );
  box-shadow: inset 0 0 30px rgba(15, 185, 253, 0.1);
  opacity: 0.5;
  animation: shieldPulse 10s infinite alternate-reverse var(--animation-smooth);
  pointer-events: none;
}

.portal-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: portalRotate 60s linear infinite reverse;
}

.portal-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(15, 185, 253, 0.6);
  opacity: 0.6;
  animation: portalStarPulse 3s infinite alternate var(--animation-smooth);
  animation-delay: calc(var(--index) * 0.3s);
}

.portal-star:nth-child(1) { top: 20%; left: 10%; }
.portal-star:nth-child(2) { top: 10%; left: 50%; }
.portal-star:nth-child(3) { top: 20%; left: 90%; }
.portal-star:nth-child(4) { top: 50%; left: 95%; }
.portal-star:nth-child(5) { top: 80%; left: 90%; }
.portal-star:nth-child(6) { top: 90%; left: 50%; }
.portal-star:nth-child(7) { top: 80%; left: 10%; }
.portal-star:nth-child(8) { top: 50%; left: 5%; }

.portal-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(15, 185, 253, .3);
  box-shadow: 0 0 64px rgba(0, 183, 255, 0.6);
  border-radius: 50%;

  animation: portalCorePulse 4s infinite alternate var(--animation-smooth);
}

/* Logo Watermark (positioned independently) */
.cosmic-logo-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64vw;
  height: 64vh;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;

}


.logo-image {
  max-width: 36%;
  max-height: 100%;
  animation: logoBreathing 10s infinite alternate-reverse var(--animation-smooth);
  z-index: 3;
  position: relative;
}

/* Hide the original logo container */
.portal-logo-container,
.portal-logo-wrapper,
.portal-logo,
.portal-logo-electric-effect,
.portal-logo-electric-effect::before,
.portal-logo-electric-effect::after {
  display: none;
}

/* Energy Streams */
.portal-energy-streams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: portalRotate 30s linear infinite;
}

.energy-stream {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0),
    rgba(15, 185, 253, 0.25),
    rgba(15, 185, 253, 0)
  );
  transform-origin: left center;
  transform: rotate(var(--angle));
  opacity: 0.6;
  filter: blur(1px);
  border-radius: 1px;
}


/* Hexagon Grid */
.portal-hexagons {
  position: absolute;
  top: 0;
  left: 0;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  overflow: hidden;
  opacity: 0.4;
}

.hexagon-grid {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-image: 
    repeating-linear-gradient(0deg, rgba(15, 185, 253, 0.1) 0px, transparent 1px, transparent 30px),
    repeating-linear-gradient(60deg, rgba(15, 185, 253, 0.1) 0px, transparent 1px, transparent 30px),
    repeating-linear-gradient(120deg, rgba(15, 185, 253, 0.1) 0px, transparent 1px, transparent 30px);
  border-radius: 50%;
  animation: rotateGrid 60s linear infinite;
  opacity: 0.5;
}

/* Data Points */
.portal-data-points {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.data-point {
  position: absolute;
  top: var(--pos);
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(15, 185, 253, 0.1) 30%,
    rgba(15, 185, 253, 0.3) 50%,
    rgba(15, 185, 253, 0.1) 70%,
    transparent 100%
  );
  animation: dataPointScan 6s infinite;
  animation-delay: var(--delay);
  opacity: 0.6;
}

/* Starfield */
.cosmic-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
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

/* Dust Particles */
.cosmic-dust-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
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

/* Gradient Overlays */
.cosmic-gradient-overlay {
  position: absolute;
  width: 100%;
  z-index: 4;
  pointer-events: none;
  opacity: 0.8;
}

.top-gradient {
  top: 0;
  height: 30vh;
  background: linear-gradient(
    to bottom,
    var(--cosmic-bg-dark) 0%,
    transparent 100%
  );
}

.bottom-gradient {
  bottom: 0;
  height: 30vh;
  background: linear-gradient(
    to top,
    var(--cosmic-bg-dark) 0%,
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

@keyframes float {
  0% {
    transform: translateY(-5px) rotate(var(--rotation)) translateZ(var(--depth));
  }
  100% {
    transform: translateY(5px) rotate(var(--rotation)) translateZ(var(--depth));
  }
}

@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translate(5px, -5px) scale(1.5);
    opacity: 0.8;
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

@keyframes orbitEffect {
  0% {
    transform: rotate(0deg) translateX(0) scale(1);
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: rotate(360deg) translateX(50px) scale(1.2);
    opacity: 0.4;
  }
}

@keyframes pulseBackground {
  0% {
    opacity: 0.3;
    transform: scale(0.9) translateX(0);
  }
  100% {
    opacity: 0.5;
    transform: scale(1.1) translateX(-30px);
  }
}

@keyframes portalPulse {
  0% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes portalRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes portalStarPulse {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.3);
  }
}

@keyframes portalGlowPulse {
  0% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes portalCorePulse {
  0% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes particleFlow {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100px);
  }
}

@keyframes particleOpacity {
  0% {
    opacity: 0;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(200px);
  }
}

@keyframes orbFloat {
  0% {
    transform: translate(-50%, -50%) scale(var(--scale)) rotate(0deg) translateX(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(var(--scale)) rotate(180deg) translateX(80px);
  }
  100% {
    transform: translate(-50%, -50%) scale(var(--scale)) rotate(360deg) translateX(0);
  }
}

@keyframes rotateGrid {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shieldPulse {
  0% {
    opacity: 0.3;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes dataPointScan {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes logoBreathing {
  0%, 100% {
    opacity: 0.15;
    filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.8)) 
            drop-shadow(0 0 30px rgba(15, 185, 253, 0.5))
            brightness(1.2) contrast(1.1) hue-rotate(0deg);
    transform: scale(1);
  }
  25% {
    opacity: 0.2;
    filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.9)) 
            drop-shadow(0 0 40px rgba(15, 185, 253, 0.6))
            brightness(1.4) contrast(1.2) hue-rotate(5deg);
    transform: scale(1.02);
  }
  50% {
    opacity: 0.12;
    filter: drop-shadow(0 0 12px rgba(15, 185, 253, 0.7)) 
            drop-shadow(0 0 25px rgba(15, 185, 253, 0.4))
            brightness(1.1) contrast(1) hue-rotate(-3deg);
    transform: scale(0.98);
  }
  75% {
    opacity: 0.22;
    filter: drop-shadow(0 0 25px rgba(15, 185, 253, 1)) 
            drop-shadow(0 0 50px rgba(15, 185, 253, 0.7))
            brightness(1.5) contrast(1.3) hue-rotate(3deg);
    transform: scale(1.03);
  }
}

@keyframes logoGlowPulse {
  0% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
}
</style>