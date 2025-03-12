<template>
  <div class="cosmic-hero" ref="heroContainer">
    <!-- Interactive Star Background -->
    <div class="star-field" ref="starField">
      <div class="stars-container" ref="starsContainer">
        <div class="star-layer near" ref="starLayerNear"></div>
        <div class="star-layer mid" ref="starLayerMid"></div>
        <div class="star-layer far" ref="starLayerFar"></div>
      </div>
      <div class="nebula-container">
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
      </div>
    </div>
    
    <!-- Hero Content -->
    <div class="hero-content">
      <div class="content-container" ref="contentContainer">
        <div class="hero-badge">Cosmicrafts Development</div>
        <h1 class="hero-title">
          <span class="title-line">Chart Your</span>
          <span class="title-line highlight">Cosmic Voyage</span>
        </h1>
        
        <p class="hero-subtitle">Navigate the stars of innovation as we build the future of blockchain gaming</p>
        
        <div class="hero-description">
          <p>
            Welcome to the Cosmicrafts Expedition Map - your interactive guide to our evolving universe. 
            Each celestial region represents a phase in our journey, with constellations of features waiting to be discovered.
          </p>
          <p class="emphasis-text">
            Explore completed milestones, track ongoing developments, and glimpse the distant horizons we're reaching for.
          </p>
        </div>
        
        <div class="hero-actions">
          <button class="cosmic-btn primary pulse-glow">
            <span class="btn-text">Begin Your Exploration</span>
            <span class="btn-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" fill="currentColor"/>
              </svg>
            </span>
          </button>
          
          <button class="cosmic-btn secondary">
            <span class="btn-text">Join the Expedition</span>
          </button>
          
          <button class="cosmic-btn tertiary">
            <span class="btn-text">Become a Pioneer</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Floating Elements -->
    <div class="floating-elements">
      <div class="floating-planet" ref="floatingPlanet"></div>
      <div class="floating-compass" ref="floatingCompass">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="28" stroke="rgba(15, 185, 253, 0.4)" stroke-width="1"/>
          <circle cx="30" cy="30" r="24" stroke="rgba(15, 185, 253, 0.2)" stroke-width="1"/>
          <circle cx="30" cy="30" r="3" fill="rgba(15, 185, 253, 0.8)"/>
          <path d="M30 6L32 28H28L30 6Z" fill="rgba(15, 185, 253, 0.8)"/>
          <path d="M30 54L28 32H32L30 54Z" fill="rgba(200, 42, 253, 0.8)"/>
          <path d="M6 30L28 28V32L6 30Z" fill="rgba(255, 180, 0, 0.8)"/>
          <path d="M54 30L32 32V28L54 30Z" fill="rgba(0, 210, 106, 0.8)"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

export default {
  name: 'CosmicHero',
  setup() {
    const heroContainer = ref(null);
    const starField = ref(null);
    const starsContainer = ref(null);
    const starLayerNear = ref(null);
    const starLayerMid = ref(null);
    const starLayerFar = ref(null);
    const contentContainer = ref(null);
    const floatingPlanet = ref(null);
    const floatingCompass = ref(null);
    
    // Mouse movement tracking for parallax effect
    const handleMouseMove = (event) => {
      if (!heroContainer.value) return;
      
      const bounds = heroContainer.value.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      
      // Calculate mouse position relative to center (values from -1 to 1)
      const relativeX = (event.clientX - centerX) / (bounds.width / 2);
      const relativeY = (event.clientY - centerY) / (bounds.height / 2);
      
      // Apply parallax to star layers with different intensities
      if (starLayerNear.value) {
        gsap.to(starLayerNear.value, {
          x: relativeX * 40,
          y: relativeY * 40,
          duration: 1,
          ease: "power2.out"
        });
      }
      
      if (starLayerMid.value) {
        gsap.to(starLayerMid.value, {
          x: relativeX * 20,
          y: relativeY * 20,
          duration: 1.5,
          ease: "power2.out"
        });
      }
      
      if (starLayerFar.value) {
        gsap.to(starLayerFar.value, {
          x: relativeX * 10,
          y: relativeY * 10,
          duration: 2,
          ease: "power2.out"
        });
      }
      
      // Parallax for content
      if (contentContainer.value) {
        gsap.to(contentContainer.value, {
          x: relativeX * -5,
          y: relativeY * -5,
          duration: 2,
          ease: "power2.out"
        });
      }
      
      // Floating elements
      if (floatingPlanet.value) {
        gsap.to(floatingPlanet.value, {
          x: relativeX * 25,
          y: relativeY * 25,
          rotation: relativeX * 5,
          duration: 2,
          ease: "power2.out"
        });
      }
      
      if (floatingCompass.value) {
        gsap.to(floatingCompass.value, {
          x: relativeX * -15,
          y: relativeY * -15,
          rotation: relativeX * -10,
          duration: 2,
          ease: "power2.out"
        });
      }
    };
    
    // Generate random stars for each layer
    const generateStars = (layer, count, maxSize) => {
      if (!layer) return;
      
      layer.innerHTML = '';
      
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // Random size (smaller values for distant stars)
        const size = Math.random() * maxSize + 1;
        
        // Random opacity for twinkling effect
        const opacity = Math.random() * 0.5 + 0.5;
        
        // Random twinkle animation delay
        const delay = Math.random() * 5;
        
        star.style.left = `${left}%`;
        star.style.top = `${top}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.opacity = opacity;
        star.style.animationDelay = `${delay}s`;
        
        layer.appendChild(star);
      }
    };
    
    // Initialize animations
    const initAnimations = () => {
      // Animate hero content entrance
      gsap.fromTo(
        contentContainer.value, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }
      );
      
      // Animate floating elements
      gsap.fromTo(
        floatingPlanet.value,
        { scale: 0.5, opacity: 0 },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 2, 
          delay: 0.5,
          ease: "elastic.out(1, 0.5)" 
        }
      );
      
      gsap.fromTo(
        floatingCompass.value,
        { scale: 0.5, opacity: 0, rotation: -30 },
        { 
          scale: 1, 
          opacity: 1, 
          rotation: 0,
          duration: 2, 
          delay: 0.7,
          ease: "elastic.out(1, 0.5)" 
        }
      );
      
      // Set up floating animations
      gsap.to(floatingPlanet.value, {
        y: 15,
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
      
      gsap.to(floatingCompass.value, {
        y: -15,
        rotation: 5,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
    };
    
    onMounted(() => {
      // Generate stars for different layers
      generateStars(starLayerNear.value, 25, 3);
      generateStars(starLayerMid.value, 50, 2);
      generateStars(starLayerFar.value, 100, 1);
      
      // Add event listener for parallax effect
      window.addEventListener('mousemove', handleMouseMove);
      
      // Initialize animations
      initAnimations();
    });
    
    onUnmounted(() => {
      window.removeEventListener('mousemove', handleMouseMove);
    });
    
    return {
      heroContainer,
      starField,
      starsContainer,
      starLayerNear,
      starLayerMid,
      starLayerFar,
      contentContainer,
      floatingPlanet,
      floatingCompass
    };
  }
};
</script>

<style scoped>
.cosmic-hero {
  position: relative;
  width: 100%;
  height: 85vh;
  min-height: 650px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  background: linear-gradient(180deg, 
    rgba(4, 8, 20, 1) 0%, 
    rgba(10, 20, 45, 0.9) 50%,
    rgba(4, 8, 20, 1) 100%
  );
  z-index: 1;
}

/* Star Field Styling */
.star-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.star-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.star {
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
  animation: twinkle 4s infinite ease-in-out;
  will-change: opacity;
}

.star-layer.near .star {
  box-shadow: 0 0 6px rgba(15, 185, 253, 0.8);
}

.star-layer.mid .star {
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
}

.star-layer.far .star {
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.4);
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.nebula-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.15;
  pointer-events: none;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}

.nebula-1 {
  top: 20%;
  right: 15%;
  width: 40%;
  height: 40%;
  background: radial-gradient(
    circle at center,
    rgba(200, 42, 253, 0.4) 0%,
    rgba(15, 185, 253, 0.2) 50%,
    transparent 80%
  );
  transform: rotate(-15deg) scale(1.5);
}

.nebula-2 {
  bottom: 10%;
  left: 15%;
  width: 35%;
  height: 35%;
  background: radial-gradient(
    circle at center,
    rgba(255, 180, 0, 0.3) 0%,
    rgba(255, 70, 130, 0.2) 50%,
    transparent 80%
  );
  transform: rotate(10deg) scale(1.5);
}

/* Hero Content Styling */
.hero-content {
  position: relative;
  width: 100%;
  max-width: 1000px;
  padding: 0 2rem;
  z-index: 2;
  box-sizing: border-box;
}

.content-container {
  will-change: transform;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(15, 185, 253, 0.15);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 50px;
  color: rgba(15, 185, 253, 0.9);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}

.hero-title {
  font-size: 4.5rem;
  line-height: 1.1;
  margin: 0 0 1.5rem;
  font-weight: 800;
}

.title-line {
  display: block;
  color: #fff;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.title-line.highlight {
  background: linear-gradient(135deg, #0FB9FD 0%, #C92AFD 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.3));
}

.hero-subtitle {
  font-size: 1.6rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2rem;
  font-weight: 400;
  line-height: 1.4;
  max-width: 700px;
}

.hero-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 700px;
  margin-bottom: 2.5rem;
}

.emphasis-text {
  font-size: 1.2rem;
  color: rgba(15, 185, 253, 0.9);
  font-weight: 500;
  position: relative;
  padding-left: 1rem;
  border-left: 3px solid rgba(15, 185, 253, 0.6);
  margin-top: 1.5rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Button Styling */
.cosmic-btn {
  position: relative;
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  gap: 0.5rem;
}

.cosmic-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.cosmic-btn:hover::after {
  transform: translateX(0);
}

.cosmic-btn.primary {
  background: linear-gradient(135deg, #0FB9FD, #5865F2);
  color: white;
  box-shadow: 0 4px 15px rgba(15, 185, 253, 0.3);
}

.cosmic-btn.secondary {
  background: rgba(15, 185, 253, 0.1);
  color: white;
  border: 1px solid rgba(15, 185, 253, 0.3);
  backdrop-filter: blur(5px);
}

.cosmic-btn.tertiary {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.85rem 1rem;
}

.cosmic-btn:hover {
  transform: translateY(-2px);
}

.cosmic-btn.primary:hover {
  box-shadow: 0 6px 20px rgba(15, 185, 253, 0.5);
}

.cosmic-btn.secondary:hover {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.5);
}

.cosmic-btn.tertiary:hover {
  color: #fff;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-icon {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.pulse-glow {
  animation: pulse-glow 3s infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 4px 15px rgba(15, 185, 253, 0.3); }
  50% { box-shadow: 0 4px 25px rgba(15, 185, 253, 0.6); }
}

/* Floating Elements Styling */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.floating-planet {
  position: absolute;
  top: 25%;
  right: 10%;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at 30% 30%, #0FB9FD, #1a1f3d);
  border-radius: 50%;
  box-shadow: 
    0 0 60px rgba(15, 185, 253, 0.4),
    inset 0 0 40px rgba(0, 0, 0, 0.8);
  will-change: transform;
}

.floating-planet::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 20px;
  background: rgba(15, 185, 253, 0.1);
  transform: translate(-50%, -50%) rotate(30deg);
  border-radius: 50%;
}

.floating-compass {
  position: absolute;
  bottom: 15%;
  left: 15%;
  width: 60px;
  height: 60px;
  will-change: transform;
}

/* Media Queries */
@media (max-width: 1200px) {
  .hero-title {
    font-size: 4rem;
  }
  
  .floating-planet {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 992px) {
  .hero-title {
    font-size: 3.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.4rem;
  }
  
  .floating-planet {
    right: 5%;
  }
  
  .floating-compass {
    left: 10%;
  }
}

@media (max-width: 768px) {
  .cosmic-hero {
    height: auto;
    min-height: 600px;
    padding: 4rem 0;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .emphasis-text {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cosmic-btn {
    width: 100%;
  }
  
  .floating-planet {
    width: 80px;
    height: 80px;
    top: 15%;
    right: 5%;
  }
  
  .floating-compass {
    width: 50px;
    height: 50px;
    bottom: 10%;
    left: 8%;
  }
}

@media (max-width: 576px) {
  .cosmic-hero {
    min-height: 550px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-badge {
    font-size: 0.75rem;
  }
  
  .floating-planet,
  .floating-compass {
    display: none;
  }
}
</style> 