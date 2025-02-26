<template>
  <section class="careers-section">
    <div class="careers-container">
      <h1 class="animated-title">Join the Cosmicrafts Crew</h1>
      <div class="content-box">
        <div class="stars"></div>
        <div class="content">
          <p class="lead-text">
            🚀 Ready to launch your career into the stratosphere? We're seeking stellar talent to help shape the future of space gaming!
          </p>

          <div class="careers-positions galactic">
            <div v-for="(position, pIndex) in positions" :key="pIndex" class="position galactic-box">
              <div class="position-header" @click="togglePosition(pIndex)" @touchstart="handleTouchStart(pIndex)">
                <div class="position-title">
                  <h3>{{ position.title }}</h3>
                  <div class="position-meta">
                    <span class="location">{{ position.location }}</span>
                    <span class="type">{{ position.type }}</span>
                  </div>
                </div>
                <span class="icon" :class="{ rotated: position.open }">
                  {{ position.open ? '−' : '+' }}
                </span>
              </div>
              
              <transition name="galactic-slide">
                <div v-if="position.open" class="position-details">
                  <p class="position-description">{{ position.description }}</p>
                  
                  <div v-for="(section, sIndex) in position.sections" 
                       :key="sIndex" 
                       class="section galactic-box">
                    <div class="section-header" @click="toggleSection(section)" @touchstart="handleTouchStart(section)">
                      <h4>{{ section.title }}</h4>
                      <span class="icon" :class="{ rotated: section.open }">
                        {{ section.open ? '−' : '+' }}
                      </span>
                    </div>
                    
                    <transition name="galactic-fade">
                      <ul v-if="section.open" class="section-items">
                        <li v-for="(item, iIndex) in section.items" 
                            :key="iIndex"
                            class="section-item">
                          {{ item }}
                        </li>
                      </ul>
                    </transition>
                  </div>
                  
                  <div class="apply-cta">
                    <a href="mailto:careers@cosmicrafts.com" class="email-button">
                      🚀 Apply as {{ position.title }}
                    </a>
                    <p class="salary-note">
                      Compensation will be competitive and commensurate with experience. We offer flexible working hours and the opportunity to work remotely.
                    </p>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <div class="cta-card">
            <p class="instruction-text">
              If you believe you can contribute to Cosmicrafts in a professional capacity,<br>
              send us your resume along with your <strong>cover letter</strong> explaining<br>
              why you're the perfect fit for our crew.
            </p>
            <a 
              href="mailto:careers@cosmicrafts.com" 
              class="email-button"
            >
              ✨ Beam to Careers ✨
            </a>
          </div>
          <p class="subtext">
            We're excited to review applications for all positions - from game developers to<br>
            concept artists, community managers to blockchain wizards!
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import careersData from '@/data/careers.json';

export default {
  name: 'CareersPage',
  setup() {
    const positions = ref([]);

    const loadPositions = () => {
      const data = Object.values(careersData).map(position => ({
        ...position,
        open: false,
        sections: position.sections.map(section => ({
          ...section,
          open: false
        }))
      }));
      positions.value = data;
    };

    const togglePosition = (index) => {
      positions.value[index].open = !positions.value[index].open;
    };

    const toggleSection = (section) => {
      section.open = !section.open;
    };

    const handleTouchStart = (target) => {
      if (target.open !== undefined) {
        toggleSection(target);
      } else {
        togglePosition(target);
      }
    };

    onMounted(() => {
      loadPositions();
      window.scrollTo(0, 0);
    });

    return {
      positions,
      togglePosition,
      toggleSection,
      handleTouchStart
    };
  }
};
</script>

<style scoped>
.careers-section {
  background: linear-gradient(180deg, #1e2436, #151b2c);
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

.careers-container {
  padding: 4rem 2rem;
  position: relative;
}

.animated-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #00e1ff, #ff01d5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: title-glow .5s ease-in-out infinite alternate;
}

.content-box {
  border-radius: 20px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.lead-text {
  font-size: 1.25rem;
  text-align: center;
  line-height: 1.6;
}

.cta-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 2.5rem;
  margin: 2rem 0;
  position: relative;
  text-align: center;
}

.instruction-text {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.email-button {
  display: inline-block;
  background: linear-gradient(45deg, #7000ff, #ff00c3);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 1rem 0;
}

.email-button:hover {
  transform: translateY(-2px);
  background: linear-gradient(45deg, #8427ff, #ff36d0);
  box-shadow: 0 10px 20px rgba(255, 0, 195, 0.3);
}

.subtext {
  text-align: center;
  color: #a0a0ff;
  margin-top: 2rem;
  line-height: 1.6;
}

.careers-positions.galactic {

  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.position.galactic-box {
  background: linear-gradient(180deg, #212b46da, #121724e3);
  border: 1px solid rgba(255, 255, 255, 0.068);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  backdrop-filter: blur(6px);
  transition: transform 0.6s ease, box-shadow 0.3s ease;
}

.position.galactic-box:hover {
  transform: translateY(-0.25rem);
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.5);
}

.position-header {
  padding: 2rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.3s ease;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.position-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.position-title h3 {
  margin: 0;
}

.position-meta {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.position-meta span {
  margin-right: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
}

.position-description {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
}

.section.galactic-box {
  margin: 1rem 0;
  padding: 0.5rem;
}

.section-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  transition: background 0.3s ease;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.section-items {
  padding: 0 1rem 1rem 1rem;
  list-style: none;
}

.section-item {
  padding: 0.8rem;
  margin: 0.5rem 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  transition: transform 0.3s ease;
}

.section-item:hover {
  transform: translateX(5px);
}

.apply-cta {
  margin: 2rem 0;
  text-align: center;
}

.salary-note {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #a0a0ff;
}

.icon {
  font-size: 2rem;
  transition: transform 0.1s ease;
}

.rotated {
  transform: rotate(180deg);
}

.galactic-slide-enter-active,
.galactic-slide-leave-active {
  transition: all 0.1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.galactic-slide-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.galactic-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.galactic-fade-enter-active,
.galactic-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.galactic-fade-enter-from,
.galactic-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animations */
@keyframes title-glow {
  from {
    text-shadow: 0 0 5px rgba(0, 225, 255, 0.451);
  }
  to {
    text-shadow: 0 0 5px rgba(255, 0, 195, 0.291);
  }
}

/* Stars background animation */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  animation: stars 50s linear infinite;
}

@keyframes stars {
  from { background-position: 0 0; }
  to { background-position: 1000px 1000px; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .careers-container {
    padding: 2rem 1rem;
  }

  .animated-title {
    font-size: 2.5rem;
  }

  .content-box {
    padding: 1.5rem;
  }

  .lead-text {
    font-size: 1rem;
  }

  .cta-card {
    padding: 1.5rem;
  }

  .instruction-text {
    font-size: 1rem;
  }
}
</style>