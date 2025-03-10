<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <!-- Background Canvas for Stars -->
    <canvas id="starfield" ref="starfield" class="noise-canvas" :style="{ top: `${scrollY * 0.5}px` }"></canvas>

    <div class="about-container">
      <!-- Header Section -->
      <header class="about-header">
        <div class="header-content">
          <img src="@/assets/webp/bg-adventures.webp" alt="About Cosmicrafts" class="about-hero-image" 
               :style="{ transform: `translateY(${scrollY * 0.075}px) scale(${1.1 - scrollY * 0.00155})` }" />
          <h1 class="title-large text-gradient animated-title"
              :style="{ transform: `translateY(${scrollY * -0.065}px) scale(${1 - scrollY * 0.000425})` }">
            {{ $t('about.title') }}
          </h1>
          <p class="page-subtitle"
             :style="{ transform: `translateY(${scrollY * -0.045}px) scale(${1 - scrollY * 0.000325})` }">
            {{ $t('about.mission.description') }}
          </p>
        </div>
      </header>

      <!-- Mission Section -->
      <div class="cosmic-card mission-section">
        <div class="mission-content">
          <div class="section-icon">
            <i class="fas fa-rocket"></i>
          </div>
          <h2>{{ $t('about.mission.title') }}</h2>
          <p>{{ $t('about.mission.vision') }}</p>
          <p>{{ $t('about.mission.innovation') }}</p>
          <div class="mission-decoration">
            <img src="@/assets/webp/energy.webp" alt="" class="floating-element" />
          </div>
        </div>
      </div>

      <!-- Core Values Grid -->
      <div class="values-grid">
        <div class="cosmic-card value-card" v-for="value in values" :key="value.key">
          <div class="value-icon">
            <i :class="value.icon"></i>
          </div>
          <div class="value-content">
            <h3>{{ $t(`about.values.${value.key}.title`) }}</h3>
            <p>{{ $t(`about.values.${value.key}.description`) }}</p>
          </div>
          <div class="card-decoration"></div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="cosmic-card team-section">
        <div class="section-header">
          <h2>Meet the Cosmic Crew</h2>
          <div class="cosmic-decoration"></div>
        </div>
        <div class="team-grid">
          <div class="team-member" v-for="member in teamMembers" :key="member.alias">
            <div class="member-profile">
              <img :src="member.image" :alt="member.name" class="member-avatar" />
              <div class="member-hover">
                <a :href="member.linkedin" target="_blank" rel="noopener noreferrer" class="linkedin-link">
                  <i class="fab fa-linkedin"></i>
                </a>
              </div>
              <div class="member-glow"></div>
            </div>
            <div class="member-info">
              <h3>{{ member.name }}</h3>
              <span class="member-alias">{{ member.alias }}</span>
              <h4 class="member-role">{{ member.role }}</h4>
              <p class="member-bio">{{ member.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const scrollY = ref(0);

function handleScroll() {
  scrollY.value = window.scrollY;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  initStarfield();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Starfield implementation here
  // (Similar to DAO.vue starfield implementation)
}

const values = [
  { key: 'innovation', icon: 'fas fa-lightbulb' },
  { key: 'community', icon: 'fas fa-users' },
  { key: 'transparency', icon: 'fas fa-shield-alt' },
  { key: 'sustainability', icon: 'fas fa-leaf' }
];

const teamMembers = [
  {
    name: "Omar Hernandez",
    alias: "Bizkit",
    role: "Founder & CEO",
    description: "Game Designer & esports veteran turned AI enthusiast. Do-it-all skillset, one algorithm at a time.",
    image: "/src/assets/webp/team/bizkit.webp",
    linkedin: "https://www.linkedin.com/in/ohsalmeron/"
  },
  {
    name: "Erick Picos",
    alias: "Shizuken",
    role: "Lead Game Developer",
    description: "Unity sorcerer & C# ninja. Biotech student by day, extraordinaire game developer by night.",
    image: "/src/assets/webp/team/shizuken.webp",
    linkedin: "https://www.linkedin.com/in/erickpicos/"
  },
  {
    name: "Manuel Quintero",
    alias: "Sakunix",
    role: "Lead Backend Developer",
    description: "Open-source advocate & Linux guru. Crafting sleek code and cyber security for gaming's future.",
    image: "/src/assets/webp/team/sakunix.webp",
    linkedin: "https://www.linkedin.com/in/sakunix/"
  },
  {
    name: "Erick Rimas",
    alias: "Kurisu",
    role: "Community Ambassador",
    description: "Web3 explorer & crypto strategist. Gamer at heart, building connections with our awesome community.",
    image: "/src/assets/webp/team/kurisu.webp",
    linkedin: "https://www.linkedin.com/in/kristian-erick-rimas/"
  }
];
</script>

<style scoped>
/* Base Styles */
.cosmic-page-bg {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, 
    var(--color-background) 0%, 
    var(--color-background-darker) 100%);
  overflow: hidden;
}

.noise-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.45;
  mix-blend-mode: overlay;
  z-index: 1;
  pointer-events: none;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  gap: 6rem;
  position: relative;
  z-index: 2;
}

/* Enhanced Header Section */
.about-header {
  text-align: center;
  margin-bottom: 2rem;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  perspective: 1000px;
}

.header-content {
  position: relative;
  z-index: 2;
  transform-style: preserve-3d;
}

.about-hero-image {
  max-width: 400px;
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.3));
  animation: float 6s ease-in-out infinite;
}

.animated-title {
  font-size: 4rem;
  font-weight: var(--weight-black);
  background: linear-gradient(135deg, 
    var(--color-primary) 0%, 
    var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  text-shadow: 0 10px 30px rgba(15, 185, 253, 0.5);
  animation: fadeInDown 1s ease-out;
}

.page-subtitle {
  font-size: 1.4rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 1s ease-out 0.3s both;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Enhanced Mission Section */
.mission-section {
  text-align: center;
  padding: 4rem;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 16px;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
  transform-style: preserve-3d;
}

.mission-content {
  position: relative;
  z-index: 2;
}

.mission-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  opacity: 0.5;
  pointer-events: none;
}

.floating-element {
  animation: float 6s ease-in-out infinite;
}

/* Enhanced Values Grid */
.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.5rem;
  perspective: 1000px;
}

.value-card {
  padding: 3rem 2rem;
  text-align: center;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
  transform-style: preserve-3d;
}

.value-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    rgba(15, 185, 253, 0.05) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: all 0.5s ease;
}

.value-card::after {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  transition: transform 1s ease;
  z-index: 0;
  pointer-events: none;
}

.value-card:hover {
  transform: translateY(-10px) rotateX(2deg) rotateY(2deg) translateZ(10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 25px 50px rgba(15, 185, 253, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05);
}

.value-card:hover::before {
  opacity: 1;
}

.value-card:hover::after {
  transform: translateY(100%) translateX(100%) rotate(45deg);
}

/* Enhanced Team Section */
.team-section {
  padding: 6rem 3rem;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 6rem;
  position: relative;
}

.section-header h2 {
  font-size: 3.5rem;
  background: linear-gradient(135deg, 
    var(--color-text-primary) 0%, 
    var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: var(--weight-black);
  position: relative;
  z-index: 2;
}

.cosmic-decoration {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 4px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-primary),
    transparent
  );
  opacity: 0.7;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
  perspective: 1200px;
}

.team-member {
  text-align: center;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.member-profile {
  position: relative;
  margin-bottom: 2rem;
  border-radius: 50%;
  overflow: hidden;
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
  transform-style: preserve-3d;
  transition: all 0.4s ease;
}

.member-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid rgba(15, 185, 253, 0.2);
  transition: all 0.4s ease;
}

.member-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 185, 253, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.member-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle,
    rgba(15, 185, 253, 0.2) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.linkedin-link {
  background: rgba(15, 185, 253, 0.2);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  transform: translateY(20px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.linkedin-link:hover {
  background: rgba(15, 185, 253, 0.4);
  transform: translateY(0) scale(1.1);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.4);
}

.team-member:hover .member-hover {
  opacity: 1;
}

.team-member:hover .member-glow {
  opacity: 1;
}

.team-member:hover .member-avatar {
  transform: scale(1.05);
  border-color: var(--color-primary);
}

.member-info {
  transform-style: preserve-3d;
}

.member-info h3 {
  font-size: 1.75rem;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
  font-weight: var(--weight-black);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.member-alias {
  display: block;
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-weight: var(--weight-bold);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.member-role {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-weight: var(--weight-medium);
}

.member-bio {
  font-size: 1rem;
  color: var(--color-text-tertiary);
  line-height: 1.6;
  max-width: 280px;
  margin: 0 auto;
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Enhanced Mobile Responsiveness */
@media (max-width: 1024px) {
  .values-grid,
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 6rem 1rem 2rem;
  }

  .animated-title {
    font-size: 2.75rem;
  }

  .values-grid,
  .team-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .team-section {
    padding: 3rem 1.5rem;
  }

  .section-header h2 {
    font-size: 2.5rem;
  }

  .member-profile {
    width: 180px;
    height: 180px;
  }

  .member-info h3 {
    font-size: 1.5rem;
  }

  .member-bio {
    font-size: 0.95rem;
    max-width: 100%;
    padding: 0 1rem;
  }

  .about-hero-image {
    max-width: 280px;
  }
}
</style>