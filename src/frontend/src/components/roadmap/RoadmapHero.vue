<template>
  <div class="roadmap-hero">
    <div class="hero-content">
      <div class="hero-text-container">
        <h1 class="hero-title">
          <span class="gradient-text">Cosmic</span> Roadmap
        </h1>
        <p class="hero-description">Explore our development journey and upcoming milestones. Follow our progress and discover what we're building next.</p>
        
        <!-- Hero actions -->
        <div class="hero-actions">
          <button class="cosmic-button cosmic-button-primary hero-button">
            <i class="hero-icon fa-solid fa-calendar-days"></i>
            Current Quarter
          </button>
          <button class="cosmic-button cosmic-button-outline hero-button">
            <i class="hero-icon fa-solid fa-star"></i>
            Key Milestones
          </button>
        </div>
      </div>
      
      <!-- Hero visual elements -->
      <div class="hero-visual" aria-hidden="true">
        <div class="hero-glow"></div>
        <div class="hero-grid"></div>
        <div class="hero-floating-items">
          <div class="floating-item item-1 cosmic-float">
            <i class="fa-solid fa-code"></i>
          </div>
          <div class="floating-item item-2 cosmic-float">
            <i class="fa-solid fa-rocket"></i>
          </div>
          <div class="floating-item item-3 cosmic-float">
            <i class="fa-solid fa-shield"></i>
          </div>
        </div>
      </div>
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
  padding: var(--space-xl) 0;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(var(--bg-depth-2-rgb), 0.7),
    rgba(var(--bg-depth-0-rgb), 0.8)
  );
  border-radius: var(--radius-medium);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-medium);
}

.hero-content {
  position: relative;
  max-width: var(--roadmap-container-width, 1400px);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  z-index: 1;
  min-height: 320px;
}

.hero-text-container {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-family: 'Montserrat', 'Noto Sans', sans-serif;
  font-size: 3.5rem;
  font-weight: var(--font-weight-black);
  margin-bottom: var(--space-md);
  line-height: 1.2;
  color: var(--color-text-primary);
  text-shadow: var(--shadow-text-medium);
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: var(--cosmic-glow-blue-sm);
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: var(--space-lg);
  color: var(--color-text-secondary);
  max-width: 90%;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.hero-button {
  display: flex;
  align-items: center;
  font-family: 'Montserrat', 'Noto Sans', sans-serif;
  font-weight: var(--font-weight-medium);
  padding: 0.8rem 1.6rem;
  font-size: 1rem;
  transition: all var(--transition-medium);
}

.hero-icon {
  margin-right: var(--space-sm);
  font-size: 1.1rem;
}

/* Visual elements */
.hero-visual {
  position: relative;
  width: 400px;
  height: 400px;
  margin-left: auto;
}

.hero-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(var(--cosmic-blue-rgb), 0.2) 0%,
    rgba(var(--cosmic-purple-rgb), 0.1) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.8;
  animation: pulse 4s ease-in-out infinite alternate;
}

.hero-grid {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
      rgba(var(--cosmic-blue-rgb), 0.07) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(var(--cosmic-blue-rgb), 0.07) 1px,
      transparent 1px
    );
  background-size: 20px 20px;
  transform: perspective(500px) rotateX(60deg) rotateZ(-5deg);
  transform-origin: center bottom;
  animation: grid-fade 8s ease-in-out infinite alternate;
}

.hero-floating-items {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.floating-item {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(var(--bg-depth-2-rgb), 0.6);
  border: 2px solid rgba(var(--cosmic-blue-rgb), 0.3);
  color: var(--color-primary);
  box-shadow: 0 0 20px rgba(var(--cosmic-blue-rgb), 0.2);
  font-size: 1.5rem;
}

.item-1 {
  top: 20%;
  right: 25%;
  animation-duration: 6s;
  animation-delay: 0.5s;
}

.item-2 {
  top: 50%;
  right: 10%;
  animation-duration: 8s;
  animation-delay: 1s;
}

.item-3 {
  bottom: 20%;
  right: 30%;
  animation-duration: 7s;
  animation-delay: 0s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes grid-fade {
  0%, 100% {
    opacity: 0.5;
    transform: perspective(500px) rotateX(60deg) rotateZ(-5deg) translateZ(0);
  }
  50% {
    opacity: 0.8;
    transform: perspective(500px) rotateX(60deg) rotateZ(-5deg) translateZ(20px);
  }
}

/* Responsive styles */
@media (max-width: 1200px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-visual {
    width: 350px;
    height: 350px;
  }
}

@media (max-width: 992px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    padding: var(--space-lg) var(--space-xl);
  }
  
  .hero-text-container {
    max-width: 100%;
  }
  
  .hero-description {
    max-width: 600px;
    margin: 0 auto var(--space-lg);
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-visual {
    width: 100%;
    height: 200px;
    margin-top: var(--space-xl);
    margin-left: 0;
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .roadmap-hero {
    padding: var(--space-lg) 0;
  }
  
  .hero-content {
    min-height: auto;
    padding: var(--space-md);
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    gap: var(--space-sm);
    width: 100%;
    max-width: 300px;
    margin: var(--space-lg) auto 0;
  }
  
  .floating-item {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-visual {
    height: 150px;
  }
}
</style> 