<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="about-container">
      <!-- Header Section -->
      <header class="about-header">
        <h1 class="title-large text-gradient animated-title">{{ $t('about.title') }}</h1>
        <p class="page-subtitle">{{ $t('about.mission.description') }}</p>
      </header>

      <!-- Mission Section -->
      <div class="cosmic-card mission-section">
        <div class="section-icon">
          <i class="fas fa-rocket"></i>
        </div>
        <h2>{{ $t('about.mission.title') }}</h2>
        <p>{{ $t('about.mission.vision') }}</p>
        <p>{{ $t('about.mission.innovation') }}</p>
      </div>

      <!-- Core Values Grid -->
      <div class="values-grid">
        <div class="cosmic-card value-card" v-for="value in values" :key="value.key">
          <div class="value-icon">
            <i :class="value.icon"></i>
          </div>
          <h3>{{ $t(`about.values.${value.key}.title`) }}</h3>
          <p>{{ $t(`about.values.${value.key}.description`) }}</p>
        </div>
      </div>

      <!-- Team Section -->
      <div class="cosmic-card team-section">
        <h2>{{ $t('about.team.title') }}</h2>
        <div class="team-grid">
          <div class="team-member" v-for="member in teamMembers" :key="member.role">
            <div class="member-avatar">
              <i :class="member.icon"></i>
            </div>
            <h3>{{ member.name }}</h3>
            <p>{{ $t(`about.team.roles.${member.role}`) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const values = [
  { key: 'innovation', icon: 'fas fa-lightbulb' },
  { key: 'community', icon: 'fas fa-users' },
  { key: 'transparency', icon: 'fas fa-shield-alt' },
  { key: 'sustainability', icon: 'fas fa-leaf' }
];

const teamMembers = [
  { name: 'Alex Stellar', role: 'ceo', icon: 'fas fa-user-astronaut' },
  { name: 'Sarah Nova', role: 'gameDesigner', icon: 'fas fa-gamepad' },
  { name: 'Mike Quantum', role: 'blockchain', icon: 'fas fa-cube' },
  { name: 'Lisa Cosmos', role: 'community', icon: 'fas fa-comments' }
];
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem;
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.about-header {
  text-align: center;
  margin-bottom: 2rem;
}

.animated-title {
  font-size: 3.5rem;
  font-weight: var(--weight-black);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  text-shadow: var(--shadow-text-medium);
  animation: fadeInDown 1s ease-out;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 1s ease-out 0.3s both;
  line-height: 1.6;
}

/* Mission Section */
.mission-section {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  position: relative;
  overflow: hidden;
  animation: fadeIn 1s ease-out;
}

.mission-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-primary),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mission-section:hover::before {
  opacity: 1;
}

.section-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-icon i {
  font-size: 2rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.mission-section:hover .section-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.mission-section:hover .section-icon i {
  color: var(--color-primary-light);
  transform: scale(1.1);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.mission-section h2 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  font-weight: var(--weight-bold);
  text-shadow: var(--shadow-text-light);
}

.mission-section p {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  max-width: 800px;
  margin: 0 auto 1rem;
}

/* Values Grid */
.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin: 2rem 0;
}

.value-card {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.value-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-primary),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.value-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15),
              0 0 0 1px rgba(15, 185, 253, 0.1) inset;
}

.value-card:hover::before {
  opacity: 1;
}

.value-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
}

.value-icon i {
  font-size: 1.5rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.value-card:hover .value-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.value-card:hover .value-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.value-card h3 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: var(--weight-bold);
  text-shadow: var(--shadow-text-light);
}

.value-card p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Team Section */
.team-section {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  position: relative;
  overflow: hidden;
}

.team-section h2 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 3rem;
  font-weight: var(--weight-bold);
  text-shadow: var(--shadow-text-light);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.team-member {
  text-align: center;
}

.member-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.member-avatar i {
  font-size: 2.5rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.team-member:hover .member-avatar {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.team-member:hover .member-avatar i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.team-member h3 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-weight: var(--weight-bold);
  text-shadow: var(--shadow-text-light);
}

.team-member p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .values-grid,
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 7rem 1rem 2rem;
  }

  .animated-title {
    font-size: 2.5rem;
  }

  .values-grid,
  .team-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .mission-section,
  .team-section {
    padding: 2rem 1.5rem;
  }

  .section-icon,
  .member-avatar {
    width: 70px;
    height: 70px;
  }

  .section-icon i,
  .member-avatar i {
    font-size: 1.75rem;
  }
}
</style>