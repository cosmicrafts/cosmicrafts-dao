<template>
  <section id="culture" class="vision-section">
    <div class="cosmic-container">
      <div class="section-header vision-header">
        <div class="header-accent-wrapper">
          <div class="header-accent"></div>
        </div>
        <h2 class="section-title vision-title">
          <span class="title-gradient">Our Vision & Culture</span>
        </h2>
        <div class="subtitle-container">
          <p class="section-subtitle vision-subtitle">Build with us. We're direct, focused, and relentlessly committed to creating exceptional games that matter</p>
        </div>
      </div>
      
      <div class="culture-grid">
        <div class="culture-card">
          <div class="card-shine"></div>
          <div class="card-cosmic-bg"></div>
          <div class="card-icon">
            <i class="fas fa-bullseye"></i>
            <div class="icon-rays">
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
            </div>
            <div class="icon-particles"></div>
          </div>
          <h3>Focus is Everything</h3>
          <p>Freedom to develop is freedom to focus. In a remote-first world, your productivity is in your hands. Bring your own discipline, manage your space, deliver your best work.</p>
        </div>
        
        <div class="culture-card">
          <div class="card-shine"></div>
          <div class="card-cosmic-bg"></div>
          <div class="card-icon">
            <i class="fas fa-lightbulb"></i>
            <div class="icon-rays">
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
            </div>
            <div class="icon-particles"></div>
          </div>
          <h3>Creative Freedom</h3>
          <p>We need your unique perspective. Challenge conventions, break norms, and push boundaries. Your individual creativity is what sets our products apart.</p>
        </div>
        
        <div class="culture-card">
          <div class="card-shine"></div>
          <div class="card-cosmic-bg"></div>
          <div class="card-icon">
            <i class="fas fa-fire"></i>
            <div class="icon-rays">
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
            </div>
            <div class="icon-particles"></div>
          </div>
          <h3>Relentless Dedication</h3>
          <p>We're obsessed with excellence and expect the same from you. Long hours, tough challenges, and a refusal to settle for "good enough." That's how we build legendary products.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CareerCulture'
}
</script>

<style scoped>
/* Vision Section - Enhanced with cosmic style */
.vision-section {
  position: relative;
  z-index: 1;
  margin-top: 2rem;

  background: transparent;
  overflow: visible;
  min-height: 100vh;
}

.vision-section::before {
  display: none;
}

.cosmic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

.vision-header {
  position: relative;
  margin-bottom: 5rem;
  z-index: 2;
  text-align: center;
}

.header-accent-wrapper {
  position: relative;
  height: 60px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: 1rem;
}

.header-accent {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.7) 0%,
    rgba(15, 185, 253, 0.3) 50%,
    rgba(15, 185, 253, 0) 70%
  );
  opacity: 0;
  animation: accentReveal 1s var(--animation-bounce) forwards;
  animation-delay: 0.2s;
  transform: scale(0);
  filter: blur(5px);
}

.vision-title {
  opacity: 0;
  transform: translateY(30px);
  animation: titleReveal 1s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
  position: relative;
  z-index: 2;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 900;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.title-gradient {
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    #e6f7ff 25%,
    var(--cosmic-blue) 50%,
    #0088cc 75%,
    #006da3 100%
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  animation: gradientFlow 8s ease infinite, glow 3s ease-in-out infinite alternate;
  padding: 0.1em 0;
  position: relative;
  display: inline-block;
}

.title-gradient::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 3px;
  left: 25%;
  bottom: -12px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cosmic-blue) 50%,
    transparent 100%
  );
  opacity: 0.7;
  border-radius: 3px;
}

.subtitle-container {
  position: relative;
  margin-top: 1.5rem;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
}

.vision-subtitle {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: 0.8s;
  position: relative;
  z-index: 2;
  color: var(--cosmic-text-secondary);
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  letter-spacing: 0.01em;
  font-weight: 400;
  padding: 0 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto 4rem;
  position: relative;
  z-index: 2;
}

.culture-card {
  position: relative;
  padding: 2.5rem;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(15, 25, 35, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.6s var(--animation-bounce);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(30px);
  animation: cardReveal 0.8s var(--animation-bounce) forwards;
  perspective: 1000px;
  transform-style: preserve-3d;
  height: 100%;
}

.culture-card:nth-child(1) { animation-delay: 0.3s; }
.culture-card:nth-child(2) { animation-delay: 0.5s; }
.culture-card:nth-child(3) { animation-delay: 0.7s; }

.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.05) 20%,
    transparent 80%
  );
  z-index: 0;
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
}

.card-cosmic-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 70% 30%,
    rgba(15, 185, 253, 0.15) 0%,
    transparent 60%
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
}

.culture-card:hover {
  transform: translateY(-10px) rotateX(5deg) rotateY(-5deg);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 0 30px rgba(15, 185, 253, 0.3);
  border-color: rgba(15, 185, 253, 0.4);
  background: rgba(15, 25, 35, 0.75);
}

.culture-card:hover .card-shine,
.culture-card:hover .card-cosmic-bg {
  opacity: 1;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(15, 25, 35, 0.7);
  border: 2px solid rgba(15, 185, 253, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transition: all 0.5s var(--animation-bounce);
  transform-style: preserve-3d;
  perspective: 1000px;
  overflow: visible;
}

.culture-card:hover .card-icon {
  transform: translateZ(20px) rotateY(360deg);
  box-shadow: 
    0 0 25px rgba(15, 185, 253, 0.5),
    0 0 50px rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.6);
}

.card-icon i {
  font-size: 2rem;
  color: var(--cosmic-blue);
  transition: all 0.5s var(--animation-bounce);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
  position: relative;
  z-index: 2;
}

.culture-card:hover .card-icon i {
  transform: scale(1.2);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.7));
  color: #fff;
}

.icon-rays {
  position: absolute;
  inset: -20px;
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
  animation: rayRotate 10s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.culture-card:hover .icon-rays {
  opacity: 1;
}

.icon-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0.8),
    rgba(15, 185, 253, 0)
  );
  transform-origin: left center;
}

.icon-ray:nth-child(1) { transform: translate(-50%, -50%) rotate(0deg); }
.icon-ray:nth-child(2) { transform: translate(-50%, -50%) rotate(90deg); }
.icon-ray:nth-child(3) { transform: translate(-50%, -50%) rotate(180deg); }
.icon-ray:nth-child(4) { transform: translate(-50%, -50%) rotate(270deg); }

.icon-particles {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
  pointer-events: none;
}

.icon-particles::before,
.icon-particles::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.8);
  box-shadow: 
    0 0 8px rgba(15, 185, 253, 0.8),
    0 0 15px rgba(15, 185, 253, 0.5);
  animation: particleOrbit 3s infinite linear;
}

.icon-particles::before { 
  top: 50%; 
  left: 0;
  animation-delay: 0s;
}

.icon-particles::after { 
  top: 0; 
  left: 50%;
  animation-delay: 1.5s;
}

.culture-card:hover .icon-particles {
  opacity: 1;
}

.culture-card h3 {
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
  margin-bottom: 1rem;
  transition: all 0.3s var(--animation-smooth);
  position: relative;
  transform: translateZ(0);
}

.culture-card:hover h3 {
  color: var(--cosmic-blue);
  transform: translateZ(10px);
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.5);
}

.culture-card h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--cosmic-blue);
  transition: width 0.5s var(--animation-bounce);
  opacity: 0.7;
}

.culture-card:hover h3::after {
  width: 40px;
}

.culture-card p {
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
  transition: all 0.3s var(--animation-smooth);
}

.culture-card:hover p {
  color: var(--cosmic-text-primary);
}

/* Animation Keyframes */
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

@keyframes accentReveal {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 0.7;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes rayRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes particleOrbit {
  from {
    transform: rotate(0deg) translateX(40px) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(40px) rotate(-360deg);
  }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes glow {
  0% { filter: drop-shadow(0 0 2px rgba(15, 185, 253, 0.3)); }
  100% { filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.6)); }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .culture-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .header-accent {
    width: 60px;
    height: 60px;
  }
  
  .header-accent-wrapper {
    height: 50px;
    margin-bottom: 0.5rem;
  }
  
  .vision-title {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }
  
  .vision-subtitle {
    font-size: 1rem;
    padding: 0 1rem;
  }
  
  .vision-section {
    padding: 120px 0 80px;
  }
  
  .culture-card {
    padding: 2rem;
  }
  
  .card-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1.25rem;
  }
  
  .card-icon i {
    font-size: 1.75rem;
  }
  
  .culture-card h3 {
    font-size: 1.25rem;
  }
  
  .culture-card p {
    font-size: 0.95rem;
  }
  
  .icon-ray {
    width: 50px;
  }
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .culture-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .vision-title {
    font-size: 2.5rem;
  }
  
  .culture-card {
    padding: 1.75rem;
  }
  
  .card-icon {
    width: 70px;
    height: 70px;
  }
  
  .culture-card h3 {
    font-size: 1.3rem;
  }
  
  .culture-card p {
    font-size: 0.95rem;
  }
}

/* Small desktop styles */
@media (min-width: 1025px) and (max-width: 1280px) {
  .culture-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  .culture-card {
    padding: 2rem;
  }
}

/* Large desktop styles */
@media (min-width: 1281px) {
  .culture-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
  }
  
  .culture-card p {
    font-size: 1.05rem;
    line-height: 1.7;
  }
}
</style> 