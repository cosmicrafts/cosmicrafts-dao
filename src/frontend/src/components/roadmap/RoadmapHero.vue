<template>
  <div class="roadmap-hero" :class="{ 'mobile-view': isMobileView }">
    <div class="cosmic-stars"></div>
    <div class="hero-content">
      <h1 class="hero-title">Roadmap</h1>
      <p class="hero-subtitle">Charting Our Course Through the Blockchain Gaming Universe</p>
      
      <div class="hero-description desktop-only">
        <p>
          Welcome to our evolving journey through the metaverse. Our roadmap outlines the ambitious path we're taking 
          to revolutionize blockchain gaming, combining cutting-edge technology with immersive gameplay experiences.
        </p>
        <p class="highlight-text">
          Explore our milestones as we build the next generation of decentralized gaming.
        </p>
      </div>
      
      <div class="hero-description mobile-only">
        <p>
          Discover our journey to revolutionize blockchain gaming through innovative technology and immersive experiences.
        </p>
      </div>
      
      <div class="hero-actions">
        <button class="cosmic-button primary">Explore Roadmap</button>
        <button class="cosmic-button secondary">View Whitepaper</button>
      </div>
    </div>
    
    <div class="hero-visual desktop-only">
      <div class="cosmic-planet"></div>
      <div class="cosmic-rings"></div>
      <div class="tech-orbit">
        <div class="orbit-layer" v-for="(layer, layerIndex) in techLayers" :key="'layer-'+layerIndex">
          <div 
            class="orbit-item" 
            v-for="(tech, index) in layer" 
            :key="tech" 
            :style="getOrbitStyle(index, layer.length, layerIndex)"
          >
            <div class="tech-bubble">{{ tech }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="floating-tech mobile-only">
      <div 
        class="tech-tag" 
        v-for="(tech, index) in mobileTech" 
        :key="tech" 
        :style="getFloatingStyle(index)"
      >
        {{ tech }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'RoadmapHero',
  setup() {
    const isMobileView = ref(false);
    
    // Organize tech items in layers for better orbital distribution
    const techLayers = [
      ['Smart Contracts', 'NFT Assets', 'Web3', 'GameFi'],  // Inner orbit
      ['P2E Gaming', 'Cross-Chain', 'Metaverse', 'DeFi']    // Outer orbit
    ];
    
    const mobileTech = [
      'Smart Contracts', 'Web3', 'NFTs', 'GameFi', 'Metaverse'
    ];
    
    const getOrbitStyle = (index, total, layer) => {
      const angle = (index / total) * 2 * Math.PI;
      const radius = 140 + (layer * 60); // Increase radius for outer layers
      const delay = index * 0.5 + (layer * 0.25);
      return {
        transform: `rotate(${angle}rad) translateX(${radius}px) rotate(-${angle}rad)`,
        animationDelay: `${delay}s`
      };
    };
    
    const getFloatingStyle = (index) => {
      const positions = [
        { top: '20%', left: '15%' },
        { top: '30%', right: '20%' },
        { top: '55%', left: '25%' },
        { top: '70%', right: '15%' },
        { top: '85%', left: '20%' }
      ];
      
      return {
        ...positions[index],
        animationDelay: `${index * 0.4}s`
      };
    };
    
    const handleResize = () => {
      isMobileView.value = window.innerWidth < 768;
    };
    
    onMounted(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      isMobileView,
      techLayers,
      mobileTech,
      getOrbitStyle,
      getFloatingStyle
    };
  }
};
</script>

<style scoped>
.roadmap-hero {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4rem;
  padding: 3rem;
  position: relative;
  overflow: hidden;
  min-height: 500px;
  border-radius: 20px;
  background: linear-gradient(135deg, 
    rgba(15, 25, 45, 0.8), 
    rgba(30, 40, 80, 0.8));
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.roadmap-hero:hover {
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.5);
}

.cosmic-stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 25px 5px, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0)),
    radial-gradient(1px 1px at 50px 25px, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0)),
    radial-gradient(1px 1px at 125px 20px, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0)),
    radial-gradient(2px 2px at 70px 70px, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0)),
    radial-gradient(2px 2px at 160px 120px, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.3;
  z-index: 0;
}

.hero-content {
  flex: 1;
  padding: 2rem;
  z-index: 1;
  max-width: 55%;
  position: relative;
}

.hero-title {
  font-size: 4rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, #0FB9FD 70%, #C92AFD 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 800;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.8rem;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  line-height: 1.7;
}

.highlight-text {
  font-size: 1.25rem;
  color: rgba(15, 185, 253, 0.9);
  font-weight: 500;
  margin-top: 1rem;
  border-left: 3px solid rgba(15, 185, 253, 0.6);
  padding-left: 1rem;
}

.hero-actions {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.cosmic-button {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

.cosmic-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  z-index: 1;
  border-radius: 50%;
  pointer-events: none;
}

.cosmic-button:hover::after {
  transform: translate(-50%, -50%) scale(1);
}

.cosmic-button.primary {
  background: linear-gradient(135deg, #0FB9FD, #5865F2);
  color: white;
  box-shadow: 0 5px 15px rgba(15, 185, 253, 0.4);
}

.cosmic-button.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.cosmic-button:hover {
  transform: translateY(-3px);
}

.cosmic-button.primary:hover {
  box-shadow: 0 8px 25px rgba(15, 185, 253, 0.6);
}

.cosmic-button.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-visual {
  position: relative;
  width: 450px;
  height: 450px;
  margin-right: -2rem;
}

.cosmic-planet {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 30% 30%, #0FB9FD, #1a1f3d);
  border-radius: 50%;
  box-shadow: 
    0 0 60px rgba(15, 185, 253, 0.4),
    inset 0 0 40px rgba(0, 0, 0, 0.8);
}

.cosmic-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.1);
}

.cosmic-rings::before,
.cosmic-rings::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
}

.cosmic-rings::before {
  width: 160px;
  height: 160px;
}

.cosmic-rings::after {
  width: 240px;
  height: 240px;
}

.tech-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.orbit-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: orbit 20s linear infinite;
}

.orbit-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  animation: counter-orbit 20s linear infinite;
}

.tech-bubble {
  transform: translate(-50%, -50%);
  padding: 0.6rem 1.2rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 20px;
  color: #fff;
  font-size: 0.9rem;
  white-space: nowrap;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.tech-bubble:hover {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.5);
  transform: translate(-50%, -50%) scale(1.1);
}

@keyframes orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes counter-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.floating-tech {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}

.tech-tag {
  position: absolute;
  padding: 0.5rem 1rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 15px;
  color: #fff;
  font-size: 0.85rem;
  animation: float 3s ease-in-out infinite;
  backdrop-filter: blur(5px);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Mobile Styles */
.mobile-view {
  flex-direction: column;
  padding: 2rem 1.5rem;
  min-height: auto;
}

.mobile-view .hero-content {
  max-width: 100%;
  padding: 1rem 0;
  text-align: center;
}

.mobile-view .hero-title {
  font-size: 3rem;
}

.mobile-view .hero-subtitle {
  font-size: 1.2rem;
}

.mobile-view .hero-actions {
  justify-content: center;
}

.mobile-view .floating-tech {
  height: 300px;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
  
  .hero-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cosmic-button {
    width: 100%;
  }
}

@media (min-width: 769px) {
  .desktop-only {
    display: block;
  }
  
  .mobile-only {
    display: none;
  }
}
</style> 