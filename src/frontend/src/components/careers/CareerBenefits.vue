<template>
  <section class="career-section benefits-section">
    <div class="cosmic-container">
      <div class="section-header">
        <h2 class="section-title">Stellar Benefits</h2>
        <p class="section-subtitle">We offer more than competitive compensation. Join us and enjoy benefits designed for extraordinary talent.</p>
      </div>

      <div class="benefits-wrapper">
        <div class="benefits-content">
          <ul class="benefits-list">
            <li class="benefit-item cosmic-hover-effect">
              <i class="fas fa-globe-americas"></i>
              <div>
                <h4>Remote-First Philosophy</h4>
                <p>Work from anywhere in the world. Our distributed team spans continents, bringing diverse perspectives to every challenge.</p>
              </div>
            </li>
            <li class="benefit-item cosmic-hover-effect">
              <i class="fas fa-coins"></i>
              <div>
                <h4>Competitive Compensation</h4>
                <p>We offer industry-leading salaries, equity packages, and performance bonuses that recognize your exceptional contributions.</p>
              </div>
            </li>
            <li class="benefit-item cosmic-hover-effect">
              <i class="fas fa-clock"></i>
              <div>
                <h4>Flexible Hours</h4>
                <p>We trust you to manage your time. Work when you're at your creative best, with core collaboration hours to keep teams connected.</p>
              </div>
            </li>
            <li class="benefit-item cosmic-hover-effect">
              <i class="fas fa-graduation-cap"></i>
              <div>
                <h4>Continuous Learning</h4>
                <p>Generous personal development budget, conference attendance, and regular internal workshops to keep your skills cutting-edge.</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="benefits-graphic">
          <div class="graphic-element cosmic-panel with-glow">
            <div class="graphic-content">
              <img src="/src/assets/webp/hyperspace02.webp" alt="Cosmicrafts benefits" class="benefits-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CareerBenefits'
}
</script>

<style scoped>
.benefits-section {
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

.benefits-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.6;
}

.cosmic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
}

.section-title {
  font-size: 3rem;
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  letter-spacing: -0.02em;
  opacity: 0;
  transform: translateY(30px);
  animation: titleReveal 0.8s var(--animation-bounce) forwards;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 4rem;
  height: 3px;
  background: var(--cosmic-blue);
  border-radius: 2px;
  box-shadow: var(--cosmic-glow-blue-sm);
  animation: titleBarPulse 4s infinite alternate var(--animation-smooth);
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--cosmic-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 300;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.8s var(--animation-bounce) forwards;
  animation-delay: 0.2s;
}

.benefits-wrapper {
  display: flex;
  gap: 4rem;
  align-items: center;
}

.benefits-content {
  flex: 1;
  max-width: 60%;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.benefit-item {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(15, 25, 35, 0.5);
  border: 1px solid rgba(15, 185, 253, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.5s var(--animation-bounce);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  animation: benefitReveal 0.8s var(--animation-bounce) forwards;
}

.benefit-item:nth-child(1) { animation-delay: 0.1s; }
.benefit-item:nth-child(2) { animation-delay: 0.2s; }
.benefit-item:nth-child(3) { animation-delay: 0.3s; }
.benefit-item:nth-child(4) { animation-delay: 0.4s; }

.benefit-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 30%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  z-index: 0;
  pointer-events: none;
}

.benefit-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 0 15px rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.4);
}

.benefit-item:hover::before {
  opacity: 1;
}

.benefit-item i {
  font-size: 1.75rem;
  color: var(--cosmic-blue);
  flex-shrink: 0;
  margin-top: 0.25rem;
  transition: all 0.5s var(--animation-bounce);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.3));
}

.benefit-item:hover i {
  transform: scale(1.2) rotate(10deg);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.6));
}

.benefit-item h4 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
  color: var(--cosmic-text-primary);
  transition: all 0.3s var(--animation-smooth);
}

.benefit-item:hover h4 {
  color: var(--cosmic-blue);
}

.benefit-item p {
  margin: 0;
  color: var(--cosmic-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  transition: all 0.3s var(--animation-smooth);
}

.benefit-item:hover p {
  color: var(--cosmic-text-primary);
}

.benefits-graphic {
  flex: 1;
  max-width: 40%;
  position: relative;
}

.graphic-element {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  position: relative;
  transform: translateY(30px) rotate(3deg);
  opacity: 0;
  animation: graphicReveal 1s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
}

.graphic-content {
  position: relative;
  overflow: hidden;
  border-radius: inherit;
}

.graphic-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 185, 253, 0.3),
    transparent 60%
  );
  z-index: 1;
  opacity: 0.7;
  transition: opacity 0.5s var(--animation-smooth);
}

.graphic-element:hover .graphic-content::before {
  opacity: 0.5;
}

.benefits-image {
  width: 100%;
  display: block;
  transform: scale(1);
  transition: transform 1s var(--animation-bounce);
}

.graphic-element:hover .benefits-image {
  transform: scale(1.05);
}

@keyframes titleReveal {
  from {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes benefitReveal {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes graphicReveal {
  from {
    opacity: 0;
    transform: translateY(30px) rotate(3deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

@keyframes titleBarPulse {
  0% {
    opacity: 0.7;
    width: 3.5rem;
  }
  100% {
    opacity: 1;
    width: 5rem;
  }
}

/* Mobile Styles */
@media (max-width: 992px) {
  .benefits-wrapper {
    flex-direction: column-reverse;
    gap: 3rem;
  }
  
  .benefits-content,
  .benefits-graphic {
    max-width: 100%;
  }
  
  .benefits-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2.5rem;
  }
  
  .section-subtitle {
    font-size: 1.1rem;
  }
  
  .benefit-item {
    padding: 1.25rem;
  }
}
</style> 