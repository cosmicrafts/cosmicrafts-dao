<template>
  <div class="roadmap-hero">
    <div class="cosmic-container">
      <div class="hero-content">
        <h1 class="cosmic-title">Cosmic Journey</h1>
        <p class="hero-description">
          Explore our development roadmap and follow our expedition across the digital cosmos.
          This timeline outlines our past achievements and future aspirations.
        </p>
        <div class="roadmap-stats">
          <div class="stat-item">
            <div class="stat-value">10+</div>
            <div class="stat-label">Development Quarters</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">125+</div>
            <div class="stat-label">Total Milestones</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">35%</div>
            <div class="stat-label">Overall Progress</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="hero-graphics">
      <!-- Star field background with parallax effect -->
      <div class="stars-container">
        <div class="star-field star-field-small"></div>
        <div class="star-field star-field-medium"></div>
        <div class="star-field star-field-large"></div>
      </div>
      
      <!-- Hero animated elements -->
      <div class="cosmic-float orbital-path">
        <div class="orbital-circle"></div>
        <div class="orbital-dot"></div>
      </div>
      
      <div class="cosmic-pulse cosmic-sphere"></div>
      
      <!-- Added floating polygons -->
      <div class="floating-poly poly-1"></div>
      <div class="floating-poly poly-2"></div>
      <div class="floating-poly poly-3"></div>
      <div class="floating-poly poly-4"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapHero'
}
</script>

<style scoped>
.roadmap-hero {
  position: relative;
  width: 100%;
  min-height: 350px;
  overflow: hidden;
  display: flex;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding: var(--space-xl) 0;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
}

.cosmic-title {
  font-size: 4rem;
  font-weight: var(--weight-black);
  margin-bottom: var(--space-md);
  background: linear-gradient(135deg, var(--cosmic-blue) 0%, var(--cosmic-blue-light) 50%, var(--cosmic-blue) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
  animation: cosmicTextFlow 3s linear infinite;
  background-size: 200% auto;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--cosmic-text-secondary);
  margin-bottom: var(--space-lg);
  max-width: 600px;
  text-shadow: var(--shadow-text-light);
}

/* Roadmap stats */
.roadmap-stats {
  display: flex;
  gap: var(--space-lg);
  margin-top: var(--space-lg);
}

.stat-item {
  text-align: center;
  background: rgba(15, 185, 253, 0.05);
  padding: var(--space-md);
  border-radius: var(--cosmic-radius-md);
  border: 1px solid rgba(15, 185, 253, 0.15);
  min-width: 120px;
  transition: all var(--cosmic-transition-medium);
}

.stat-item:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.1);
}

.stat-value {
  font-size: 2.2rem;
  font-weight: var(--weight-bold);
  color: var(--cosmic-blue-light);
  margin-bottom: 0.5rem;
  text-shadow: var(--cosmic-glow-blue-sm);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--cosmic-text-secondary);
  font-weight: var(--weight-medium);
}

/* Parallax star field */
.hero-graphics {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.star-field {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  opacity: 0.6;
  background-image: radial-gradient(
    2px 2px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    rgba(255, 255, 255, 0.8),
    transparent
  );
  background-size: 400px 400px;
  animation: drift 60s linear infinite;
}

.star-field-small {
  background-size: 300px 300px;
  animation-duration: 50s;
}

.star-field-medium {
  background-size: 400px 400px;
  animation-delay: -20s;
  opacity: 0.4;
}

.star-field-large {
  background-size: 600px 600px;
  animation-duration: 150s;
  opacity: 0.3;
}

@keyframes drift {
  from {
    transform: rotate(0deg) translateZ(0);
  }
  to {
    transform: rotate(360deg) translateZ(0);
  }
}

/* Orbital animation */
.orbital-path {
  position: absolute;
  top: 20%;
  right: 15%;
  width: 150px;
  height: 150px;
}

.orbital-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(15, 185, 253, 0.2);
  border-radius: 50%;
  animation: rotateOrbit 20s linear infinite;
}

.orbital-dot {
  position: absolute;
  top: -5px;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-md);
  animation: moveOrbit 10s linear infinite;
}

@keyframes rotateOrbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes moveOrbit {
  from {
    transform: rotate(0deg) translateX(75px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(75px) rotate(-360deg);
  }
}

/* Cosmic sphere */
.cosmic-sphere {
  position: absolute;
  bottom: 20%;
  left: 15%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.4), rgba(200, 42, 253, 0.4));
  box-shadow: 0 0 30px rgba(15, 185, 253, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.5);
  animation: pulseSphere 4s ease-in-out infinite;
}

@keyframes pulseSphere {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.8;
    box-shadow: 0 0 30px rgba(15, 185, 253, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.5);
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 0 50px rgba(15, 185, 253, 0.8), inset 0 0 25px rgba(255, 255, 255, 0.7);
  }
}

/* Floating polygons for additional visual interest */
.floating-poly {
  position: absolute;
  border-radius: 5px;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.2);
  opacity: 0.6;
  animation: floatAnimation 8s ease-in-out infinite;
}

.poly-1 {
  top: 15%;
  right: 25%;
  width: 40px;
  height: 40px;
  transform: rotate(45deg);
  animation-delay: 0s;
}

.poly-2 {
  bottom: 35%;
  right: 30%;
  width: 25px;
  height: 25px;
  transform: rotate(20deg);
  animation-delay: 2s;
}

.poly-3 {
  top: 35%;
  left: 30%;
  width: 35px;
  height: 35px;
  transform: rotate(30deg);
  animation-delay: 4s;
}

.poly-4 {
  bottom: 25%;
  right: 45%;
  width: 20px;
  height: 20px;
  transform: rotate(15deg);
  animation-delay: 6s;
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0) rotate(45deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px) rotate(35deg);
    opacity: 0.9;
  }
}

/* Animated gradient text */
@keyframes cosmicTextFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

/* Responsive styles */
@media (max-width: 1200px) {
  .cosmic-title {
    font-size: 3.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .orbital-path {
    width: 120px;
    height: 120px;
    right: 10%;
  }
  
  .cosmic-sphere {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 992px) {
  .cosmic-title {
    font-size: 3rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .orbital-path {
    width: 100px;
    height: 100px;
  }
  
  .stat-item {
    min-width: 100px;
    padding: var(--space-sm);
  }
  
  .stat-value {
    font-size: 1.8rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  .roadmap-hero {
    min-height: 320px;
    padding: var(--space-lg) 0;
  }
  
  .cosmic-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1rem;
    margin-bottom: var(--space-md);
  }
  
  .roadmap-stats {
    gap: var(--space-md);
  }
  
  .orbital-path {
    opacity: 0.6;
    right: 5%;
  }
  
  .cosmic-sphere {
    opacity: 0.6;
    left: 5%;
  }
  
  .floating-poly {
    opacity: 0.3;
  }
}

@media (max-width: 576px) {
  .roadmap-hero {
    min-height: 300px;
    padding: var(--space-md) 0;
  }
  
  .cosmic-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 0.9rem;
  }
  
  .roadmap-stats {
    flex-direction: column;
    gap: var(--space-sm);
    margin-top: var(--space-md);
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: left;
    padding: var(--space-xs) var(--space-sm);
    min-width: auto;
    gap: var(--space-sm);
  }
  
  .stat-value {
    font-size: 1.5rem;
    margin-bottom: 0;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .orbital-path, .cosmic-sphere {
    display: none;
  }
  
  .floating-poly {
    opacity: 0.2;
  }
}
</style> 