<template>
  <section class="careers-hero cosmic-page-bg">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-accent">Join</span> the Cosmic Revolution
        </h1>
        <p class="hero-subtitle">Create the future of gaming at the intersection of blockchain, strategy, and space exploration</p>
        <div class="hero-cta">
          <a href="#open-positions" class="cosmic-button-primary hero-button">
            <i class="fas fa-rocket"></i>
            Explore Opportunities
          </a>
          <a href="#culture" class="cosmic-button-outline hero-button">
            <i class="fas fa-star"></i>
            Our Culture
          </a>
        </div>
      </div>
      <div class="hero-graphic">
        <div class="floating-elements">
          <div class="floating-element cosmic-float" style="--delay: 0s;">
            <i class="fas fa-meteor"></i>
          </div>
          <div class="floating-element cosmic-float" style="--delay: 1s;">
            <i class="fas fa-planet-ringed"></i>
          </div>
          <div class="floating-element cosmic-float" style="--delay: 2s;">
            <i class="fas fa-rocket"></i>
          </div>
          <div class="floating-element cosmic-float" style="--delay: 3s;">
            <i class="fas fa-satellite"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cosmic Portal Transition Element -->
    <div class="cosmic-portal">
      <div class="portal-ring"></div>
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
      <div class="portal-energy-streams">
        <div class="energy-stream" style="--angle: 0deg;"></div>
        <div class="energy-stream" style="--angle: 45deg;"></div>
        <div class="energy-stream" style="--angle: 90deg;"></div>
        <div class="energy-stream" style="--angle: 135deg;"></div>
        <div class="energy-stream" style="--angle: 180deg;"></div>
        <div class="energy-stream" style="--angle: 225deg;"></div>
        <div class="energy-stream" style="--angle: 270deg;"></div>
        <div class="energy-stream" style="--angle: 315deg;"></div>
      </div>
    </div>
    
    <div class="scroll-indicator">
      <span>Journey through our universe</span>
      <i class="fas fa-chevron-down cosmic-pulse"></i>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CareerHero'
}
</script>

<style scoped>
/* Hero Section - Enhanced with modern effects */
.careers-hero {
  position: relative;
  min-height: 100vh;
  z-index: 2;
  padding-bottom: 140px; /* Extra space for the portal */
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

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  position: relative;
  z-index: 1;
}

.hero-content {
  flex: 1;
  max-width: 800px;
  position: relative;
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
  color: var(--hero-accent);
  position: relative;
  display: inline-block;
  animation: glowPulse 3s infinite alternate var(--animation-smooth);
  text-shadow: 0 0 15px var(--hero-accent-glow);
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
}

.hero-cta {
  display: flex;
  gap: 1.5rem;
  animation: fadeInUp 1s ease-out 0.5s both;
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
  perspective: 1000px;
}

.floating-elements {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: floatContainer 20s infinite linear;
}

.floating-element {
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: 12px;
  box-shadow: var(--cosmic-glow-blue-sm), 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  transform-style: preserve-3d;
  animation-timing-function: var(--animation-smooth);
  transition: all 0.5s var(--animation-bounce);
}

.floating-element:hover {
  transform: scale(1.15) rotate(-5deg);
  box-shadow: var(--cosmic-glow-blue-md), 0 15px 35px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.floating-element::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05), transparent);
  z-index: 0;
  pointer-events: none;
}

.floating-element i {
  font-size: 2rem;
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 5px var(--hero-accent-glow));
  position: relative;
  z-index: 2;
  animation: iconPulse 3s infinite alternate ease-in-out;
}

.floating-element:nth-child(1) {
  top: 20%;
  left: 20%;
  transform: rotate(-5deg) translateZ(30px);
  animation: float1 9s infinite alternate;
}

.floating-element:nth-child(2) {
  top: 60%;
  left: 30%;
  transform: rotate(5deg) translateZ(60px);
  animation: float2 8s infinite alternate-reverse;
}

.floating-element:nth-child(3) {
  top: 30%;
  right: 15%;
  transform: rotate(-7deg) translateZ(90px);
  animation: float3 10s infinite alternate;
}

.floating-element:nth-child(4) {
  bottom: 25%;
  right: 25%;
  transform: rotate(7deg) translateZ(40px);
  animation: float4 7s infinite alternate-reverse;
}

.scroll-indicator {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  color: var(--cosmic-text-primary);
  text-align: center;
  opacity: 0;
  animation: fadeInUp 1s ease-out 1.5s forwards;
}

.scroll-indicator span {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* Cosmic Portal - Dramatic Section Transition */
.cosmic-portal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  z-index: 10;
  perspective: 1000px;
}

.portal-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(15, 185, 253, 0.8);
  border-radius: 50%;
  box-shadow: 
    0 0 20px rgba(15, 185, 253, 0.5),
    0 0 40px rgba(15, 185, 253, 0.3),
    inset 0 0 20px rgba(15, 185, 253, 0.5);
  animation: portalPulse 4s infinite alternate var(--animation-smooth), 
             portalRotate 20s linear infinite;
  opacity: 0;
  transform: scale(0.8) rotate(0deg);
  animation-fill-mode: forwards;
  animation-delay: 0.5s;
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

.portal-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.8) 0%,
    rgba(15, 185, 253, 0.5) 20%,
    rgba(15, 185, 253, 0.3) 40%,
    rgba(15, 185, 253, 0) 70%
  );
  border-radius: 50%;
  filter: blur(15px);
  opacity: 0;
  animation: portalGlowPulse 4s infinite alternate var(--animation-smooth);
  animation-delay: 0.8s;
}

.portal-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 40%;
  height: 40%;
  background: rgba(15, 185, 253, 0.9);
  box-shadow: 0 0 30px rgba(15, 185, 253, 0.9);
  border-radius: 50%;
  filter: blur(5px);
  opacity: 0;
  animation: portalCoreExpand 4s var(--animation-bounce) forwards, 
             portalCorePulse 3s infinite alternate var(--animation-smooth);
  animation-delay: 1s, 1s;
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
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0.9),
    rgba(15, 185, 253, 0)
  );
  transform-origin: left center;
  transform: rotate(var(--angle)) scaleX(0);
  opacity: 0;
  animation: energyStreamExpand 3s var(--animation-bounce) forwards;
  animation-delay: 1.2s;
  filter: blur(1px);
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
    transform: scale(1);
    filter: drop-shadow(0 0 3px var(--hero-accent-glow));
  }
  100% {
    transform: scale(1.15);
    filter: drop-shadow(0 0 7px var(--hero-accent-glow));
  }
}

@keyframes float1 {
  0% {
    transform: rotate(-5deg) translateZ(30px) translate(0, 0);
  }
  100% {
    transform: rotate(5deg) translateZ(30px) translate(-15px, -15px);
  }
}

@keyframes float2 {
  0% {
    transform: rotate(5deg) translateZ(60px) translate(0, 0);
  }
  100% {
    transform: rotate(-5deg) translateZ(60px) translate(20px, -10px);
  }
}

@keyframes float3 {
  0% {
    transform: rotate(-7deg) translateZ(90px) translate(0, 0);
  }
  100% {
    transform: rotate(3deg) translateZ(90px) translate(-10px, 20px);
  }
}

@keyframes float4 {
  0% {
    transform: rotate(7deg) translateZ(40px) translate(0, 0);
  }
  100% {
    transform: rotate(-3deg) translateZ(40px) translate(15px, 10px);
  }
}

@keyframes floatContainer {
  0% {
    transform: rotateY(0deg) rotateX(0deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(10deg);
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
    opacity: 0.8;
    transform: rotate(var(--angle)) scaleX(1);
  }
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .hero-container {
    flex-direction: column;
    padding: 2rem;
  }
  
  .hero-content {
    max-width: 100%;
    text-align: center;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .hero-graphic {
    max-width: 100%;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-cta {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-button {
    width: 100%;
    justify-content: center;
  }
  
  .cosmic-portal {
    width: 200px;
    height: 200px;
  }
}
</style> 