<template>
  <div class="cosmos-container">
    <div class="cosmos-overlay"></div>
    <canvas ref="cosmosCanvas" class="cosmos-canvas"></canvas>
    <div class="nebula-glow nebula-1"></div>
    <div class="nebula-glow nebula-2"></div>
    <div class="parallax-stars" ref="parallaxStars"></div>
    <div class="cosmic-dust"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const cosmosCanvas = ref(null);
const parallaxStars = ref(null);
const canvasCtx = ref(null);
const particles = ref([]);
const mouse = ref({ x: 0, y: 0, moved: false, timeout: null });

// Initialize interactive cosmos canvas
function initCosmosCanvas() {
  if (!cosmosCanvas.value) return;
  
  const canvas = cosmosCanvas.value;
  canvasCtx.value = canvas.getContext('2d');
  
  // Set canvas dimensions with device pixel ratio for sharp rendering
  function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set display size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Set actual size in memory
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;
    
    // Scale context to ensure correct drawing operations
    canvasCtx.value.scale(pixelRatio, pixelRatio);
    
    // Update particles for new dimensions
    initParticles();
  }
  
  // Create particles with precise positioning
  function initParticles() {
    particles.value = [];
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const particleCount = Math.floor((width * height) / 10000);
    
    for (let i = 0; i < particleCount; i++) {
      particles.value.push({
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        radius: Math.max(1, Math.round(Math.random() * 1.5)),
        color: Math.random() > 0.5 ? 'rgba(15, 185, 253, ' : 'rgba(138, 43, 226, ',
        opacity: Number((Math.random() * 0.5 + 0.2).toFixed(3)),
        vx: Number((Math.random() - 0.5) * 0.25).toFixed(3),
        vy: Number((Math.random() - 0.5) * 0.25).toFixed(3),
        proximity: []
      });
    }
  }
  
  // Animate particles with precise rendering
  function animateParticles() {
    if (!canvasCtx.value) return;
    
    const ctx = canvasCtx.value;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw particles
    particles.value.forEach(particle => {
      // Update position with precise calculations
      particle.x = Math.round((particle.x + Number(particle.vx) + width) % width);
      particle.y = Math.round((particle.y + Number(particle.vy) + height) % height);
      
      // Mouse interaction with precise distance calculation
      if (mouse.value.moved) {
        const dx = mouse.value.x - particle.x;
        const dy = mouse.value.y - particle.y;
        const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
        
        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 2000;
          particle.vx = Number((Number(particle.vx) - Math.cos(angle) * force).toFixed(3));
          particle.vy = Number((Number(particle.vy) - Math.sin(angle) * force).toFixed(3));
        }
      }
      
      // Draw particle with anti-aliasing disabled for crisp rendering
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${particle.color}${particle.opacity})`;
      ctx.fill();
    });
    
    // Draw constellation lines with precise endpoints
    ctx.lineCap = 'round';
    particles.value.forEach(particle => {
      particle.proximity = [];
      
      particles.value.forEach(otherParticle => {
        if (particle !== otherParticle) {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
          
          if (distance < 100) {
            particle.proximity.push({
              particle: otherParticle,
              distance: distance
            });
          }
        }
      });
      
      particle.proximity.forEach(prox => {
        ctx.beginPath();
        ctx.moveTo(Math.round(particle.x), Math.round(particle.y));
        ctx.lineTo(Math.round(prox.particle.x), Math.round(prox.particle.y));
        const opacity = Number(((100 - prox.distance) / 500).toFixed(3));
        ctx.strokeStyle = `rgba(15, 185, 253, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });
    
    requestAnimationFrame(animateParticles);
  }
  
  // Handle mouse movement with precise coordinates
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.value.x = Math.round(e.clientX - rect.left);
    mouse.value.y = Math.round(e.clientY - rect.top);
    mouse.value.moved = true;
    
    clearTimeout(mouse.value.timeout);
    mouse.value.timeout = setTimeout(() => {
      mouse.value.moved = false;
    }, 3000);
  }
  
  // Set up event listeners
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('mousemove', handleMouseMove);
  
  // Initialize and start animation
  resizeCanvas();
  requestAnimationFrame(animateParticles);
  
  return () => {
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('mousemove', handleMouseMove);
  };
}

// Update parallax elements based on scroll/mouse position
function updateParallaxElements(scrollY, mouseX, mouseY) {
  if (!parallaxStars.value) return;
  
  const stars = parallaxStars.value;
  const parallaxRate = scrollY * 0.2;
  
  stars.style.transform = `translate3d(0, -${parallaxRate}px, 0)`;
  
  // Further enhance parallax with mouse movement
  const nebulaElements = document.querySelectorAll('.nebula-glow');
  nebulaElements.forEach(element => {
    element.style.transform = `translate3d(${(mouseX - window.innerWidth / 2) / 50}px, ${(mouseY - window.innerHeight / 2) / 50}px, 0)`;
  });
}

// Expose methods to parent component
defineExpose({
  updateParallaxElements
});

// Lifecycle hooks
onMounted(() => {
  const cleanupCanvas = initCosmosCanvas();
  
  onUnmounted(() => {
    if (cleanupCanvas) cleanupCanvas();
  });
});
</script>

<style scoped>
/* Interactive Cosmos - Advanced Effects */
.cosmos-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.cosmos-overlay {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 15% 15%, rgba(76, 0, 255, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 85% 85%, rgba(15, 185, 253, 0.15) 0%, transparent 60%);
  mix-blend-mode: screen;
  opacity: 0;
  animation: fadeInBlend 2s ease-out forwards;
  pointer-events: none;
}

.cosmos-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: fadeIn 3s ease-out forwards;
}

.nebula-glow {
  position: absolute;
  filter: blur(80px);
  opacity: 0;
  animation: nebulaGlow 20s infinite alternate ease-in-out;
}

.nebula-1 {
  width: 40%;
  height: 40%;
  top: 10%;
  left: 10%;
  background: radial-gradient(
    ellipse at center,
    rgba(76, 0, 255, 0.15) 0%,
    rgba(76, 0, 255, 0.05) 40%,
    transparent 70%
  );
  animation-delay: 0.5s;
  transform: translate3d(0, 0, -50px);
}

.nebula-2 {
  width: 50%;
  height: 50%;
  bottom: 10%;
  right: 10%;
  background: radial-gradient(
    ellipse at center,
    rgba(15, 185, 253, 0.15) 0%,
    rgba(15, 185, 253, 0.05) 40%,
    transparent 70%
  );
  animation-delay: 1s;
  transform: translate3d(0, 0, -100px);
}

.parallax-stars {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(1px 1px at calc(50% + 25px) calc(50% + 25px), white, transparent),
    radial-gradient(1px 1px at calc(50% - 25px) calc(50% - 25px), white, transparent),
    radial-gradient(2px 2px at calc(50% + 125px) calc(50% + 125px), white, transparent),
    radial-gradient(2px 2px at calc(50% - 125px) calc(50% - 125px), white, transparent),
    radial-gradient(1px 1px at calc(50% + 225px) calc(50% + 225px), white, transparent),
    radial-gradient(1px 1px at calc(50% - 225px) calc(50% - 225px), white, transparent),
    radial-gradient(2px 2px at calc(50% + 325px) calc(50% + 325px), white, transparent),
    radial-gradient(2px 2px at calc(50% - 325px) calc(50% - 325px), white, transparent);
  background-repeat: repeat;
  background-size: 700px 700px;
  opacity: 0;
  animation: fadeIn 3s ease-out forwards, parallaxMove 60s infinite linear alternate;
  transform-style: preserve-3d;
}

.cosmic-dust {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(0.5px 0.5px at 50% 50%, rgba(15, 185, 253, 0.1), transparent),
    radial-gradient(0.5px 0.5px at 60% 30%, rgba(76, 0, 255, 0.1), transparent);
  background-size: 150px 150px;
  opacity: 0;
  animation: fadeIn 3s ease-out forwards, dustMove 120s infinite linear;
  transform-style: preserve-3d;
  transform: translate3d(0, 0, -20px);
}

/* Animation Keyframes */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fadeInBlend {
  0% { opacity: 0; }
  100% { opacity: 0.8; }
}

@keyframes nebulaGlow {
  0% { 
    opacity: 0.3; 
    transform: translate3d(0, 0, -50px) scale(0.9);
  }
  50% {
    opacity: 0.5;
  }
  100% { 
    opacity: 0.3; 
    transform: translate3d(0, 0, -100px) scale(1.1);
  }
}

@keyframes parallaxMove {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-20px, -20px, 0); }
}

@keyframes dustMove {
  0% { background-position: 0 0; }
  100% { background-position: 100px 100px; }
}
</style> 