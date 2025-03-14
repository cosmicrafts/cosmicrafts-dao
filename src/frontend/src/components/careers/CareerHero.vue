<template>
  <section class="careers-hero cosmic-page-bg">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-accent">BUIDL</span> what's next on Web3
        </h1>
        <p class="hero-subtitle">We're seeking exceptional talent to push the boundaries of gaming, AI, and blockchain technology.</p>
        <div class="hero-cta">
          <a @click="scrollToPositions" class="cosmic-button cosmic-button-primary hero-button">
            <i class="fas fa-rocket"></i>
            Explore Opportunities
          </a>
          <a href="#culture" class="cosmic-button cosmic-button-outline hero-button">
            <i class="fas fa-star"></i>
            Our Culture
          </a>
        </div>
      </div>
      <div class="hero-graphic">
        <div class="floating-elements">
          <div class="floating-element cosmic-float" style="--delay: 0s; --depth: 30px; --rotation: -5deg;">
            <div class="element-content">
              <i class="fas fa-meteor"></i>
              <span class="element-tooltip">Explore</span>
            </div>
            <div class="element-particles">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="floating-element cosmic-float" style="--delay: 1s; --depth: 60px; --rotation: 5deg;">
            <div class="element-content">
              <i class="fas fa-globe"></i>
              <span class="element-tooltip">Connect</span>
            </div>
            <div class="element-particles">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="floating-element cosmic-float" style="--delay: 2s; --depth: 90px; --rotation: -7deg;">
            <div class="element-content">
              <i class="fas fa-rocket"></i>
              <span class="element-tooltip">Launch</span>
            </div>
            <div class="element-particles">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="floating-element cosmic-float" style="--delay: 3s; --depth: 40px; --rotation: 7deg;">
            <div class="element-content">
              <i class="fas fa-satellite"></i>
              <span class="element-tooltip">Innovate</span>
            </div>
            <div class="element-particles">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <!-- Cosmic Portal Transition Element -->
    <div class="cosmic-portal">
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
        <div class="portal-star" style="--index: 9;"></div>
        <div class="portal-star" style="--index: 10;"></div>
        <div class="portal-star" style="--index: 11;"></div>
        <div class="portal-star" style="--index: 12;"></div>
      </div>
      <div class="portal-glow"></div>
      <div class="portal-core"></div>
      <div class="portal-scan-line"></div>
      <div class="portal-energy-streams">
        <div class="energy-stream" style="--angle: 0deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 45deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 90deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 135deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 180deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 225deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 270deg;">
          <div class="energy-particles"></div>
        </div>
        <div class="energy-stream" style="--angle: 315deg;">
          <div class="energy-particles"></div>
        </div>
      </div>
      <div class="portal-hexagons">
        <div class="hexagon-grid"></div>
      </div>
      <div class="portal-data-points">
        <div class="data-point" style="--pos: 30%; --delay: 0s;"></div>
        <div class="data-point" style="--pos: 70%; --delay: 0.7s;"></div>
        <div class="data-point" style="--pos: 20%; --delay: 1.4s;"></div>
        <div class="data-point" style="--pos: 85%; --delay: 2.1s;"></div>
        <div class="data-point" style="--pos: 40%; --delay: 2.8s;"></div>
        <div class="data-point" style="--pos: 60%; --delay: 3.5s;"></div>
      </div>
    </div>
    
    <!-- Interactive text navigation -->
    <div class="journey-container" @click="scrollToNextSection">
      <div class="cosmic-continue-text">
        <span class="continue-text">Learn More</span>
        <i class="fas fa-chevron-down"></i>
        <div class="text-glow-effect"></div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CareerHero',
  methods: {
    scrollToNextSection() {
      const nextSection = document.getElementById('culture');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    scrollToPositions() {
      const positionsSection = document.getElementById('open-positions');
      if (positionsSection) {
        // Account for header height with offset
        const headerHeight = 80; // Adjust this value based on your header height
        const positionRect = positionsSection.getBoundingClientRect();
        const offsetPosition = positionRect.top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
}
</script>

<style scoped>
/* Hero Section - Enhanced with modern effects */
.careers-hero {
  position: relative;
  min-height: 100vh;
  z-index: 2;
  padding-bottom: 0; /* Remove bottom padding */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem; /* Add margin to account for portal overlap */
}

.careers-hero::before {
  content: '';
  position: absolute;
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
  filter: blur(var(--glass-blur));
  opacity: 0.6;
  z-index: -1;
  animation: orbitEffect 20s infinite alternate var(--animation-smooth);
}

.careers-hero::after {
  content: '';
  position: absolute;
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
  filter: blur(var(--glass-blur));
  z-index: -1;
  animation: pulseBackground 15s infinite alternate var(--animation-smooth);
}

.careers-hero.cosmic-page-bg {
  background: none !important; /* Remove any background */
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  position: relative;
  z-index: 1;
  padding: 0 2rem;
  width: 100%;
}

.hero-content {
  flex: 1;
  max-width: 800px;
  position: relative;
  text-align: center;
}

.hero-content::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: var(--hero-accent-glow);
  filter: blur(30px);
  top: -30px;
  left: -30px;
  z-index: -1;
  opacity: 0.5;
  border-radius: 50%;
  animation: subtlePulse 4s infinite alternate var(--animation-smooth);
}

.hero-title {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(0,0,0,0.3);
  animation: textReveal 1.2s var(--animation-smooth);
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.title-accent {
  color: var(--cosmic-blue);
  position: relative;
  display: inline-block;
  animation: glowPulse 3s infinite alternate var(--animation-smooth);
  text-shadow: 0 0 15px var(--cosmic-blue);
}

.title-accent::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--hero-accent), transparent);
  box-shadow: var(--cosmic-glow-blue-md);
  animation: lineExpand 3s infinite alternate var(--animation-smooth);
}

.hero-subtitle {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  animation: fadeInUp 1s ease-out 0.3s both;
  letter-spacing: -0.01em;
  font-weight: 300;
  margin-left: auto;
  margin-right: auto;
}

.hero-cta {
  display: flex;
  gap: 1.5rem;
  animation: fadeInUp 1s ease-out 0.5s both;
  justify-content: center;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.4s var(--animation-bounce);
  position: relative;
  overflow: hidden;
}

.hero-button i {
  transition: transform 0.5s var(--animation-bounce);
}

.hero-button:hover i {
  transform: translateX(3px) scale(1.2);
}

.hero-button:active {
  transform: translateY(2px);
}

.hero-graphic {
  flex: 1;
  max-width: 600px;
  height: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
  overflow: visible;
}

.floating-elements {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: floatContainer 25s infinite linear;
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
  transition: all 0.6s var(--animation-bounce);
  cursor: pointer;
}

.element-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: all 0.6s var(--animation-bounce);
}

.floating-element i {
  font-size: 2.2rem;
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
  position: relative;
  z-index: 2;
  animation: iconPulse 4s infinite alternate ease-in-out;
  transition: all 0.6s var(--animation-bounce);
}

.element-tooltip {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%) translateY(30px) translateZ(20px) scale(0);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--cosmic-text-primary);
  background: rgba(15, 185, 253, 0.9);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.4s var(--animation-bounce);
  white-space: nowrap;
  z-index: 3;
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.4);
  transform-style: preserve-3d;
  backface-visibility: hidden;
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
  opacity: 0;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
  transition: all 0.6s var(--animation-bounce);
}

.element-particles span:nth-child(1) { top: 20%; left: 10%; }
.element-particles span:nth-child(2) { top: 15%; right: 15%; }
.element-particles span:nth-child(3) { bottom: 15%; left: 15%; }
.element-particles span:nth-child(4) { bottom: 20%; right: 10%; }

.floating-element::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg, 
    rgba(255,255,255,0.15), 
    rgba(255,255,255,0.05) 20%, 
    rgba(15, 185, 253, 0.05) 60%,
    transparent 80%
  );
  z-index: 0;
  pointer-events: none;
  transition: opacity 0.5s var(--animation-smooth);
}

.floating-element::after {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: inherit;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.4) 0%,
    rgba(15, 185, 253, 0.1) 30%,
    transparent 70%
  );
  opacity: 0;
  filter: blur(20px);
  z-index: -1;
  transition: opacity 0.6s var(--animation-smooth);
}

/* Hover and active states */
.floating-element:hover {
  box-shadow: 
    0 0 25px rgba(15, 185, 253, 0.3),
    0 0 40px rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.6);
  background: rgba(16, 20, 38, 0.9);
}

.floating-element:hover i {
  color: var(--cosmic-blue-light);
  filter: drop-shadow(0 0 12px rgba(15, 185, 253, 0.8));
}

.floating-element:hover .element-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(10px) translateZ(20px) scale(1);
}

.floating-element:hover .element-particles span {
  opacity: 1;
  animation: particleFloat 2s infinite alternate var(--animation-smooth);
}

.floating-element:hover .element-particles span:nth-child(1) { animation-delay: 0s; }
.floating-element:hover .element-particles span:nth-child(2) { animation-delay: 0.3s; }
.floating-element:hover .element-particles span:nth-child(3) { animation-delay: 0.6s; }
.floating-element:hover .element-particles span:nth-child(4) { animation-delay: 0.9s; }

.floating-element:hover::after {
  opacity: 0.7;
}

.floating-element:active {
  transform: scale(1.05) translateZ(10px) !important;
  border-color: rgba(15, 185, 253, 0.8);
}

/* Individual element positioning and animations */
.floating-element:nth-child(1) {
  top: 20%;
  left: 15%;
  transform: rotate(var(--rotation)) translateZ(var(--depth));
  animation: float1 9s infinite alternate;
}

.floating-element:nth-child(2) {
  top: 65%;
  left: 25%;
  transform: rotate(var(--rotation)) translateZ(var(--depth));
  animation: float2 8s infinite alternate-reverse;
}

.floating-element:nth-child(3) {
  top: 25%;
  right: 12%;
  transform: rotate(var(--rotation)) translateZ(var(--depth));
  animation: float3 10s infinite alternate;
}

.floating-element:nth-child(4) {
  bottom: 22%;
  right: 18%;
  transform: rotate(var(--rotation)) translateZ(var(--depth));
  animation: float4 7s infinite alternate-reverse;
}

/* Cosmic dust effect */
.cosmic-dust {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
}

.dust-particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: #fff;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(1px);
  box-shadow: 0 0 calc(var(--size) * 2) rgba(15, 185, 253, 0.6);
  animation: dustFloat var(--speed) infinite linear;
  animation-delay: var(--delay);
}

.dust-particle:nth-child(1) { top: 20%; left: 30%; }
.dust-particle:nth-child(2) { top: 50%; left: 60%; }
.dust-particle:nth-child(3) { top: 70%; left: 40%; }
.dust-particle:nth-child(4) { top: 30%; left: 70%; }
.dust-particle:nth-child(5) { top: 80%; left: 20%; }
.dust-particle:nth-child(6) { top: 40%; left: 80%; }

/* Cosmic Portal - Dramatic Section Transition */
.cosmic-portal {
  position: absolute;
  bottom: -125px;
  left: 50%;
  transform: translateX(-50%);
  width: 2rem;
  height: 16rem;
  z-index: 10;
  perspective: 1000px;
}

.portal-ring {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  opacity: 0;
  animation-fill-mode: forwards;
  animation-delay: 0.5s;
}

.outer-ring {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(15, 185, 253, 0.8);
  box-shadow: 
    0 0 20px rgba(15, 185, 253, 0.5),
    0 0 40px rgba(15, 185, 253, 0.3),
    inset 0 0 20px rgba(15, 185, 253, 0.5);
  animation: portalPulse 4s infinite alternate var(--animation-smooth), 
             portalRotate 20s linear infinite;
  transform: scale(0.8) rotate(0deg);
}

.inner-ring {
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  border: 2px solid rgba(15, 185, 253, 0.6);
  box-shadow: 
    0 0 15px rgba(15, 185, 253, 0.4),
    0 0 30px rgba(15, 185, 253, 0.2),
    inset 0 0 10px rgba(15, 185, 253, 0.4);
  animation: portalPulse 4s infinite alternate-reverse var(--animation-smooth), 
             portalRotate 15s linear infinite reverse;
  transform: scale(0.8) rotate(0deg);
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
  box-shadow: inset 0 0 30px rgba(15, 185, 253, 0.2);
  opacity: 0;
  animation: shieldPulse 8s infinite alternate-reverse var(--animation-smooth);
  animation-delay: 0.8s;
  pointer-events: none;
}

.portal-scan-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(15, 185, 253, 0.8) 50%,
    transparent 100%
  );
  transform-origin: center;
  animation: scanLine 4s infinite linear;
  opacity: 0;
  animation-delay: 1s;
  z-index: 3;
}

.portal-hexagons {
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  overflow: hidden;
  opacity: 0;
  animation: fadeIn 2s forwards;
  animation-delay: 1.2s;
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
  animation: rotateGrid 40s linear infinite;
  opacity: 0.7;
}

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
    rgba(15, 185, 253, 0.2) 30%,
    rgba(15, 185, 253, 0.8) 50%,
    rgba(15, 185, 253, 0.2) 70%,
    transparent 100%
  );
  animation: dataPointScan 4s infinite;
  animation-delay: var(--delay);
  opacity: 0;
}

.portal-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: portalRotate 40s linear infinite reverse;
}

.portal-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(15, 185, 253, 0.6);
  opacity: 0;
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
.portal-star:nth-child(9) { top: 30%; left: 30%; }
.portal-star:nth-child(10) { top: 70%; left: 30%; }
.portal-star:nth-child(11) { top: 30%; left: 70%; }
.portal-star:nth-child(12) { top: 70%; left: 70%; }

.portal-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.6) 0%,
    rgba(15, 185, 253, 0.4) 30%,
    rgba(15, 185, 253, 0.2) 50%,
    rgba(15, 185, 253, 0) 70%
  );
  border-radius: 50%;
  filter: blur(15px);
  opacity: 0;
  animation: portalGlowPulse 4s infinite alternate var(--animation-smooth);
  animation-delay: 0.8s;
  transition: all 0.7s var(--animation-bounce);
}

.portal-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 40%;
  height: 40%;
  background: rgba(15, 185, 253, 0.7);
  box-shadow: 0 0 30px rgba(15, 185, 253, 0.7);
  border-radius: 50%;
  filter: blur(5px);
  opacity: 0;
  animation: portalCoreExpand 4s var(--animation-bounce) forwards, 
             portalCorePulse 3s infinite alternate var(--animation-smooth);
  animation-delay: 1s, 1s;
  transition: all 0.7s var(--animation-bounce);
}

.portal-energy-streams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: portalRotate 15s linear infinite;
}

.energy-stream {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 3px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0.95),
    rgba(15, 185, 253, 0)
  );
  transform-origin: left center;
  transform: rotate(var(--angle)) scaleX(0);
  opacity: 0;
  animation: energyStreamExpand 3s var(--animation-bounce) forwards;
  animation-delay: 1.2s;
  filter: blur(1px);
  border-radius: 1.5px;
  overflow: visible;
}

.energy-particles {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 20px;
  pointer-events: none;
  transform-origin: left center;
  animation: particleFlow 4s infinite linear;
  filter: url(#gooey);
}

.energy-particles::before,
.energy-particles::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.8);
  box-shadow: 0 0 8px rgba(15, 185, 253, 0.8), 0 0 15px rgba(15, 185, 253, 0.5);
  opacity: 0;
  animation: particleOpacity 3s infinite ease-in-out;
}

.energy-particles::before {
  top: 0;
  animation-delay: calc(var(--angle) * 0.01s);
}

.energy-particles::after {
  top: 10px;
  animation-delay: calc(var(--angle) * 0.01s + 1.5s);
}

/* Animation Keyframes */
@keyframes textReveal {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes glowPulse {
  0% {
    text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
  }
  50% {
    text-shadow: 0 0 15px rgba(15, 185, 253, 0.7), 0 0 25px rgba(15, 185, 253, 0.3);
  }
  100% {
    text-shadow: 0 0 20px rgba(15, 185, 253, 0.8), 0 0 30px rgba(15, 185, 253, 0.4), 0 0 40px rgba(15, 185, 253, 0.2);
  }
}

@keyframes lineExpand {
  0% {
    width: 70%;
    left: 15%;
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    width: 100%;
    left: 0;
    opacity: 0.8;
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.4));
  }
  50% {
    transform: scale(1.1) rotate(-5deg);
    filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.6));
  }
  100% {
    transform: scale(1.2) rotate(5deg);
    filter: drop-shadow(0 0 12px rgba(15, 185, 253, 0.8));
  }
}

@keyframes floatContainer {
  0% {
    transform: rotateY(0deg) rotateX(2deg);
  }
  50% {
    transform: rotateY(180deg) rotateX(-2deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(2deg);
  }
}

@keyframes orbitEffect {
  0% {
    transform: rotate(0deg) translateX(0) scale(1);
    opacity: 0.5;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: rotate(360deg) translateX(50px) scale(1.2);
    opacity: 0.6;
  }
}

@keyframes pulseBackground {
  0% {
    opacity: 0.4;
    transform: scale(0.9) translateX(0);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.1) translateX(-30px);
  }
}

@keyframes subtlePulse {
  0% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes portalPulse {
  0% {
    opacity: 0.7;
    transform: scale(0.9) rotate(0deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
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
    opacity: 0.2;
    transform: scale(0.8);
  }
  100% {
    opacity: 0.9;
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

@keyframes portalCoreExpand {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  70% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes portalCorePulse {
  0% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes energyStreamExpand {
  0% {
    opacity: 0;
    transform: rotate(var(--angle)) scaleX(0);
  }
  100% {
    opacity: 0.9;
    transform: rotate(var(--angle)) scaleX(1);
  }
}

@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(calc(var(--index) * 5px), calc(var(--index) * -5px)) scale(1.5);
  }
}

@keyframes dustFloat {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.1;
  }
  30% {
    opacity: 0.4;
  }
  70% {
    opacity: 0.2;
  }
  100% {
    transform: translate(100px, -100px) rotate(360deg);
    opacity: 0;
  }
}

/* Interactive Text Navigation */
.journey-container {
  position: absolute;
  bottom: 30px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 15;
  cursor: pointer;
}

.cosmic-continue-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--cosmic-text-secondary);
  transition: all 0.5s var(--animation-bounce);
  animation: textFloat 4s infinite alternate ease-in-out;
  position: relative;
}

.continue-text {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  position: relative;
  transition: all 0.5s var(--animation-bounce);
}

.continue-text::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cosmic-blue) 50%,
    transparent 100%
  );
  transition: width 0.5s var(--animation-bounce);
  opacity: 0.7;
}

.text-glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse at center,
    rgba(15, 185, 253, 0.4) 0%,
    rgba(15, 185, 253, 0) 70%
  );
  opacity: 0;
  filter: blur(10px);
  transition: all 0.5s var(--animation-bounce);
  border-radius: 50%;
  z-index: -1;
  pointer-events: none;
}

.cosmic-continue-text:hover {
  color: var(--cosmic-text-primary);
  transform: translateY(-5px);
  text-shadow: 
    0 0 10px rgba(15, 185, 253, 0.8),
    0 0 20px rgba(15, 185, 253, 0.4);
}

.cosmic-continue-text:hover .text-glow-effect {
  opacity: 1;
  width: 150%;
  height: 150%;
}

.cosmic-continue-text:hover .continue-text::after {
  width: 100%;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
}

.cosmic-continue-text i {
  font-size: 1.2rem;
  animation: arrowBounce 1.5s infinite alternate ease-in-out;
  transition: all 0.5s var(--animation-bounce);
  color: var(--cosmic-blue);
  opacity: 0.8;
}

.cosmic-continue-text:hover i {
  transform: translateY(5px);
  opacity: 1;
  color: var(--cosmic-text-primary);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
}

.journey-container:hover ~ .cosmic-portal .portal-glow {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.5);
  filter: blur(25px);
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.8) 0%,
    rgba(15, 185, 253, 0.5) 40%,
    rgba(15, 185, 253, 0.2) 60%,
    rgba(15, 185, 253, 0) 80%
  );
}

.journey-container:hover ~ .cosmic-portal .portal-core {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 
    0 0 30px rgba(15, 185, 253, 0.9),
    0 0 60px rgba(15, 185, 253, 0.6);
  filter: blur(4px);
}

.journey-container:hover ~ .cosmic-portal .outer-ring {
  border-color: rgba(15, 185, 253, 1);
  box-shadow: 
    0 0 40px rgba(15, 185, 253, 0.8),
    0 0 80px rgba(15, 185, 253, 0.6),
    inset 0 0 40px rgba(15, 185, 253, 0.8);
}

.journey-container:hover ~ .cosmic-portal .inner-ring {
  border-color: rgba(15, 185, 253, 0.8);
  box-shadow: 
    0 0 25px rgba(15, 185, 253, 0.6),
    0 0 50px rgba(15, 185, 253, 0.4),
    inset 0 0 20px rgba(15, 185, 253, 0.6);
}

.journey-container:hover ~ .cosmic-portal .hexagon-grid {
  opacity: 1;
}

.journey-container:hover ~ .cosmic-portal .portal-data-points .data-point {
  opacity: 1;
}

.journey-container:hover ~ .cosmic-portal .portal-scan-line {
  opacity: 0.7;
}

.journey-container:hover ~ .cosmic-portal .portal-shield {
  opacity: 0.8;
  box-shadow: inset 0 0 50px rgba(15, 185, 253, 0.4);
}

/* Additional Animation Keyframes */
@keyframes textFloat {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}

@keyframes arrowBounce {
  0% {
    transform: translateY(0);
    opacity: 0.5;
  }
  100% {
    transform: translateY(8px);
    opacity: 0.9;
  }
}

@keyframes scanLine {
  0% {
    top: 0%;
    opacity: 0.3;
    transform: translateX(-50%) rotate(0deg);
  }
  50% {
    opacity: 0.7;
  }
  100% {
    top: 100%;
    opacity: 0.3;
    transform: translateX(-50%) rotate(0deg);
  }
}

@keyframes dataPointScan {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
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
    transform: scale(0.9);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.5;
  }
}

@keyframes particleOpacity {
  0% {
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
  20%, 80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(80px) scale(1);
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

/* Mobile Styles - Update for new elements */
@media (max-width: 768px) {
  .cosmic-portal {
    width: 200px;
    height: 200px;
    bottom: -100px;
  }
  
  .portal-scan-line,
  .data-point {
    height: 1px;
  }
  
  .energy-stream {
    width: 70px;
    height: 2px;
  }
  
  .inner-ring {
    top: 20%;
    left: 20%;
    width: 60%;
    height: 60%;
  }
  
  .journey-container {
    bottom: 20px;
  }
  
  .continue-text {
    font-size: 0.9rem;
  }
  
  .cosmic-continue-text i {
    font-size: 1rem;
  }
  
  .cosmic-continue-text:hover {
    transform: translateY(-3px);
  }
}
</style> 