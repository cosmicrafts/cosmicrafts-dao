<template>
  <section class="careers-section">
    <div class="careers-container">
      <header class="careers-header">
        <h1 class="page-title">Join Our Mission</h1>
        <p class="page-subtitle">Help us shape the future of space gaming</p>
      </header>

      <div class="content-wrapper">
        <div class="intro-section">
          <div class="mission-statement">
            <h2>Why Cosmicrafts?</h2>
            <p>We're pioneering the next generation of space strategy games, combining blockchain technology with immersive gameplay. Join our diverse team of innovators, creators, and space enthusiasts.</p>
            <div class="perks-grid">
              <div class="perk-item">
                <i class="fas fa-globe"></i>
                <span>Remote-First Culture</span>
              </div>
              <div class="perk-item">
                <i class="fas fa-coins"></i>
                <span>Competitive Pay</span>
              </div>
              <div class="perk-item">
                <i class="fas fa-laptop-house"></i>
                <span>Flexible Hours</span>
              </div>
              <div class="perk-item">
                <i class="fas fa-graduation-cap"></i>
                <span>Learning Budget</span>
              </div>
            </div>
          </div>
        </div>

        <div class="positions-grid">
          <div v-for="(position, pIndex) in positions" 
               :key="pIndex" 
               class="position-card"
               :class="{ 'is-expanded': position.open }">
            <div class="position-header" 
                 @click="togglePosition(pIndex)"
                 :class="{ 'is-active': position.open }">
              <div class="position-title-wrapper">
                <h3 class="position-name">{{ position.title }}</h3>
                <div class="position-badges">
                  <span class="badge location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ position.location }}
                  </span>
                  <span class="badge type">
                    <i class="fas fa-clock"></i>
                    {{ position.type }}
                  </span>
                </div>
              </div>
              <button class="expand-button" :aria-expanded="position.open">
                <span class="sr-only">Toggle position details</span>
                <i class="fas" :class="position.open ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>
            </div>
            
            <transition name="expand">
              <div v-if="position.open" class="position-content">
                <p class="position-description">{{ position.description }}</p>
                
                <div class="sections-wrapper">
                  <div v-for="(section, sIndex) in position.sections" 
                       :key="sIndex" 
                       class="section">
                    <div class="section-header">
                      <h4>{{ section.title }}</h4>
                    </div>
                    <ul class="section-list">
                      <li v-for="(item, iIndex) in section.items" 
                          :key="iIndex"
                          class="section-item">
                        {{ item }}
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div class="position-footer">
                  <a :href="'mailto:careers@cosmicrafts.com?subject=Application for ' + position.title"
                     class="apply-button">
                    <i class="fas fa-rocket"></i>
                    Apply Now
                  </a>
                  <p class="compensation-note">
                    We offer competitive compensation, flexible work arrangements, and comprehensive benefits.
                  </p>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <div class="careers-footer">
          <div class="contact-card">
            <h2>You have a unique skillset?</h2>
            <p>We're always looking for talented individuals to join our crew. Send us your resume and tell us how you can contribute to our mission.</p>
            <a href="mailto:careers@cosmicrafts.com" class="contact-button">
              <i class="fas fa-paper-plane"></i>
              Contact Us
            </a>
          </div>
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
          open: true // Always keep sections open
        }))
      }));
      positions.value = data;
    };

    const togglePosition = (index) => {
      // Close all other positions when opening a new one
      positions.value.forEach((pos, i) => {
        if (i !== index) {
          pos.open = false;
        }
      });
      positions.value[index].open = !positions.value[index].open;
    };

    onMounted(() => {
      loadPositions();
    });

    return {
      positions,
      togglePosition
    };
  }
};
</script>

<style scoped>
.careers-section {
  min-height: 100vh;
  background: var(--gradient-hero);
  color: var(--color-text-primary);
}

.careers-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.careers-header {
  text-align: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 3.5rem;
  font-weight: var(--weight-extra-bold);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  font-weight: var(--weight-regular);
}

.intro-section {
  margin-bottom: 4rem;
}

.mission-statement {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.mission-statement h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.mission-statement p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.positions-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;
}

.position-card {
  background: var(--color-surface-primary);
  border: var(--border-thin);
  border-radius: var(--radius-large);
  overflow: hidden;
  transition: all 0.3s ease;
}

.position-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow-primary);
}

.position-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.position-header:hover {
  background: var(--color-surface-secondary);
}

.position-header.is-active {
  background: var(--color-surface-secondary);
  border-bottom: var(--border-thin);
}

.position-name {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.position-badges {
  display: flex;
  gap: 1rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-circle);
  font-size: 0.875rem;
  background: var(--color-surface-secondary);
  border: var(--border-thin);
}

.badge i {
  font-size: 0.75rem;
  color: var(--color-primary);
}

.expand-button {
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.3s ease;
}

.position-content {
  padding: 2rem;
  border-top: var(--border-thin);
}

.position-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-medium);
  border: var(--border-thin);
}

.sections-wrapper {
  display: grid;
  gap: 1.5rem;
}

.section {
  background: var(--color-surface-secondary);
  border-radius: var(--radius-medium);
  overflow: hidden;
  border: var(--border-thin);
}

.section-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface-tertiary);
  border-bottom: var(--border-thin);
}

.section-header h4 {
  font-size: 1.1rem;
  color: var(--color-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header h4::before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: var(--radius-circle);
}

.section-list {
  list-style: none;
  padding: 1.5rem;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.section-item {
  padding: 0.75rem 1rem;
  color: var(--color-text-secondary);
  position: relative;
  padding-left: 2rem;
  background: var(--color-surface-tertiary);
  border-radius: var(--radius-small);
  transition: all 0.2s ease;
  border: var(--border-thin);
}

.section-item:hover {
  background: var(--color-surface-secondary);
  transform: translateX(4px);
  border-color: var(--color-primary);
}

.section-item::before {
  content: "→";
  position: absolute;
  left: 0.75rem;
  color: var(--color-primary);
  opacity: 0.7;
}

.position-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 2rem;
  border-top: var(--border-thin);
}

.apply-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--gradient-button);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-circle);
  font-weight: var(--weight-bold);
  transition: all 0.3s ease;
}

.apply-button:hover {
  background: var(--gradient-button-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-primary);
}

.apply-button i {
  font-size: 1.1rem;
}

.compensation-note {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.careers-footer {
  margin-top: 6rem;
}

.contact-card {
  text-align: center;
  padding: 3rem;
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  border: var(--border-thin);
}

.contact-card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.contact-card p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.contact-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-circle);
  font-weight: var(--weight-bold);
  transition: all 0.3s ease;
  border: var(--border-thin);
}

.contact-button:hover {
  background: var(--color-surface-primary);
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-primary);
}

.contact-button i {
  font-size: 1.1rem;
  color: var(--color-primary);
}

.perks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.perk-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-medium);
  border: var(--border-thin);
  transition: all 0.2s ease;
}

.perk-item:hover {
  background: var(--color-surface-primary);
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-primary);
}

.perk-item i {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.perk-item span {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

/* Animations */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .careers-container {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .mission-statement {
    padding: 1.5rem;
  }

  .position-header {
    padding: 1rem;
  }

  .position-name {
    font-size: 1.25rem;
  }

  .position-badges {
    flex-wrap: wrap;
  }

  .position-content {
    padding: 1.5rem;
  }

  .contact-card {
    padding: 2rem 1rem;
  }

  .perks-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }

  .perks-grid {
    grid-template-columns: 1fr;
  }
}
</style>