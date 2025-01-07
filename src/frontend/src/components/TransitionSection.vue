<template>
  <section class="transition-section">
    <!-- Parallax Background Canvas -->
    <canvas id="parallaxBackground" ref="parallaxBackground" class="parallax-canvas"></canvas>
    
    <div class="transition-content">
      <!-- Animated Section Title -->
      <h2 class="section-title">Discover Cosmicrafts</h2>
      <div class="cards-container">
        <!-- Feature Cards with Icons and Depth Effects -->
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          :style="{ transform: `translateY(${scrollY * feature.parallax}px)`, opacity: `${1 - scrollY * 0.0015}` }"
        >
          <img :src="feature.icon" :alt="feature.title + ' Icon'" class="feature-icon" />
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import battleIcon from '@/assets/icons/battle-icon.svg';
import empireIcon from '@/assets/icons/empire-icon.svg';
import communityIcon from '@/assets/icons/community-icon.svg';

const scrollY = ref(0);
const features = ref([
  {
    title: 'Epic Battles',
    description: 'Engage in thrilling cosmic battles with unique strategies and intense action.',
    icon: battleIcon,
    parallax: 0.1,
  },
  {
    title: 'Build Your Empire',
    description: 'Construct your cosmic base, gather resources, and prepare for interstellar conquest.',
    icon: empireIcon,
    parallax: 0.15,
  },
  {
    title: 'Join the Community',
    description: 'Collaborate with other players, form alliances, and dominate the cosmos together.',
    icon: communityIcon,
    parallax: 0.2,
  },
]);

function handleScroll() {
  scrollY.value = window.scrollY;
}

function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    speedX: Math.random() * 0.5 - 0.25,
    speedY: Math.random() * 0.5 - 0.25,
  }));
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
    requestAnimationFrame(drawParticles);
  }
  
  drawParticles();
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  const parallaxCanvas = document.getElementById('parallaxBackground');
  parallaxCanvas.width = window.innerWidth;
  parallaxCanvas.height = window.innerHeight;
  initParticles(parallaxCanvas);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Section Styles */
.transition-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rem 2rem;
  background: linear-gradient(to bottom, rgba(12, 24, 46, 0.9), rgba(25, 24, 24, 0.95));
  color: #fff;
  overflow: hidden;
}

/* Parallax Background Canvas */
.parallax-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 1;
}

/* Section Title with Glow */
.section-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 3rem;
  text-align: center;
  color: #00aaff;
  text-shadow: 0 0 10px rgba(0, 174, 255, 0.8), 0 0 20px rgba(0, 174, 255, 0.6);
  animation: title-glow 2s ease-in-out infinite alternate;
}

@keyframes title-glow {
  from {
    text-shadow: 0 0 10px rgba(0, 174, 255, 0.8), 0 0 20px rgba(0, 174, 255, 0.6);
  }
  to {
    text-shadow: 0 0 20px rgba(0, 174, 255, 1), 0 0 40px rgba(0, 174, 255, 0.8);
  }
}

/* Cards Container */
.cards-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
  z-index: 1;
}

/* Feature Card Styles */
.feature-card {
  width: 300px;
  padding: 2rem;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 119, 255, 0.3);
  text-align: center;
  color: #fff;
  transition: transform 0.6s ease, opacity 0.6s ease, box-shadow 0.6s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 174, 255, 0.6);
}

/* Feature Card Icon */
.feature-icon {
  width: 64px;
  margin-bottom: 1rem;
  filter: drop-shadow(0px 0px 12px rgba(0, 174, 255, 0.8));
  transition: transform 0.5s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.15);
}

/* Feature Card Title */
.feature-title {
  font-size: 1.75rem;
  color: #00aaff;
  margin-bottom: 1rem;
  text-shadow: 0px 0px 8px rgba(0, 174, 255, 0.7);
}

/* Feature Card Description */
.feature-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

/* Particle Effect for 3D Feel */
@keyframes particle-float {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(10px, -10px);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
