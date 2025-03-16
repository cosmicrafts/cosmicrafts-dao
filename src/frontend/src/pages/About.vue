<template>
  <div class="about-page">
   

    <!-- Team Section -->
    <section class="team-section">
      <h2 class="section-title text-gradient">The Cosmic Force</h2>
      
      <!-- Founder Spotlight -->
      <div class="founder-spotlight cosmic-card">
        <div class="founder-content">
          <div class="founder-profile">
            <img src="/src/assets/webp/team/bizkit.webp" alt="Omar Hernandez" class="founder-avatar" />
            <div class="founder-hover">
              <a href="https://www.linkedin.com/in/ohsalmeron/" target="_blank" rel="noopener noreferrer" class="linkedin-link">
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div class="founder-info">
            <span class="founder-tag">Founder & CEO</span>
            <h3>Omar "Bizkit" Hernandez</h3>
            <p class="founder-bio">
              Game Designer & esports veteran turned AI enthusiast. Building Cosmicrafts from the ground up with a passion for innovation and a vision for the future of gaming. Leading the charge in development, design, and community building.
            </p>
          </div>
        </div>
      </div>

      <!-- Core Contributors -->
      <div class="contributors-grid">
        <div class="contributor-card cosmic-card" v-for="member in teamMembers.slice(1)" :key="member.alias">
          <div class="contributor-profile">
            <img :src="member.image" :alt="member.name" class="contributor-avatar" />
            <div class="contributor-hover">
              <a :href="member.linkedin" target="_blank" rel="noopener noreferrer" class="linkedin-link">
                <i class="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
          <div class="contributor-info">
            <h3>{{ member.name }}</h3>
            <span class="contributor-alias">{{ member.alias }}</span>
            <h4 class="contributor-role">{{ member.role }}</h4>
            <p class="contributor-bio">{{ member.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
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
.about-page {
  color: var(--color-text);
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  line-height: 1.2;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Headline Section Styles */
.headline {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(8, 9, 12, 0.95) 0%, 
    rgba(29, 38, 60, 0.95) 50%,
    rgba(8, 9, 12, 0.95) 100%);
  background-size: cover;
  background-blend-mode: overlay;
  perspective: 1500px;
  transform-style: preserve-3d;
}

.headline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 30%, 
    rgba(15, 185, 253, 0.12) 0%, 
    transparent 60%);
  z-index: 1;
  pointer-events: none;
}

.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.45;
  mix-blend-mode: overlay;
  z-index: 1;
}

.content {
  position: relative;
  text-align: center;
  z-index: 2;
  transform-style: preserve-3d;
  max-width: 1200px;
  padding: 0 2rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.hero-logo {
  max-width: 400px;
  filter: drop-shadow(0 0 30px rgba(15, 185, 253, 0.3));
  animation: float 6s ease-in-out infinite;
}

.primary-headline {
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
}

.cta-subtext {
  font-size: 1.4rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Vision Section Styles */
.vision-section {
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;
  margin: 4rem auto;
  max-width: 1200px;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
}

.vision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  margin-top: 4rem;
}

.vision-card {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.vision-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.2);
  transition: all 0.3s ease;
}

.vision-icon i {
  font-size: 2rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.vision-card:hover {
  transform: translateY(-10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 15px 30px rgba(15, 185, 253, 0.1);
}

.vision-card:hover .vision-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.4);
}

.vision-card:hover .vision-icon i {
  color: var(--color-primary-light);
  transform: scale(1.1);
}

/* Team Section Styles */
.team-section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.founder-spotlight {
  margin-bottom: 4rem;
  padding: 3rem;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 16px;
}

.founder-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3rem;
  align-items: center;
}

.founder-profile {
  position: relative;
  width: 250px;
  height: 250px;
}

.founder-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid rgba(15, 185, 253, 0.3);
  transition: all 0.4s ease;
}

.founder-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 185, 253, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.founder-profile:hover .founder-hover {
  opacity: 1;
}

.founder-profile:hover .founder-avatar {
  transform: scale(1.05);
  border-color: var(--color-primary);
}

.founder-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 20px;
  color: var(--color-primary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.founder-info h3 {
  font-size: 2.5rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.founder-bio {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 600px;
}

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  margin-top: 4rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.contributor-card {
  text-align: center;
  padding: 2.5rem;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 100%;
  box-sizing: border-box;
}

.contributor-profile {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 2rem;
}

.contributor-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid rgba(15, 185, 253, 0.2);
  transition: all 0.4s ease;
}

.contributor-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 185, 253, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.contributor-card:hover {
  transform: translateY(-10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 15px 30px rgba(15, 185, 253, 0.1);
}

.contributor-card:hover .contributor-hover {
  opacity: 1;
}

.contributor-card:hover .contributor-avatar {
  transform: scale(1.05);
  border-color: var(--color-primary);
}

.contributor-info h3 {
  font-size: 1.75rem;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
}

.contributor-alias {
  display: block;
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.contributor-role {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.contributor-bio {
  font-size: 1rem;
  color: var(--color-text-tertiary);
  line-height: 1.6;
}


/* Shared Styles */
.section-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, 
    var(--color-text-primary) 0%, 
    var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 8rem;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0) 0%, 
    rgba(15, 185, 253, 0.7) 50%, 
    rgba(15, 185, 253, 0) 100%);
  border-radius: 2px;
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

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

/* Mobile Responsiveness */
@media (max-width: 1024px) {
  .vision-grid,
  .contributors-grid,
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .about-page {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .headline {
    padding: 6rem 1rem;
    width: 100%;
    max-width: 100%;
  }

  .primary-headline {
    font-size: 2.75rem;
  }

  .hero-logo {
    max-width: 280px;
  }

  .vision-grid,
  .contributors-grid,
  .values-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .founder-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .founder-profile {
    width: 200px;
    height: 200px;
    margin: 0 auto;
  }

  .founder-info h3 {
    font-size: 2rem;
  }

  .founder-bio {
    font-size: 1.1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .section-title {
    font-size: 2.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .vision-section,
  .team-section,
  .values-section {
    padding: 4rem 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .founder-spotlight,
  .contributor-card {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 2rem 1rem;
  }

  .contributors-grid {
    padding: 0 0.5rem;
  }
  
  .contributor-card {
    padding: 1.5rem;
  }
  
  .contributor-profile {
    width: 150px;
    height: 150px;
  }
}
</style>