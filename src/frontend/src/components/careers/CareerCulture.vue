<template>
  <section id="culture" class="vision-section">
    <!-- Cosmic Background Elements -->
    <div class="vision-starfield">
      <div class="vision-star" style="--size: 3px; --top: 15%; --left: 10%;"></div>
      <div class="vision-star" style="--size: 2px; --top: 25%; --left: 30%;"></div>
      <div class="vision-star" style="--size: 4px; --top: 40%; --left: 70%;"></div>
      <div class="vision-star" style="--size: 2px; --top: 65%; --left: 85%;"></div>
      <div class="vision-star" style="--size: 3px; --top: 82%; --left: 45%;"></div>
      <div class="vision-star" style="--size: 2px; --top: 70%; --left: 20%;"></div>
      <div class="vision-star" style="--size: 3px; --top: 30%; --left: 50%;"></div>
      <div class="vision-star" style="--size: 4px; --top: 55%; --left: 60%;"></div>
      <div class="vision-star" style="--size: 2px; --top: 35%; --left: 15%;"></div>
      <div class="vision-star" style="--size: 3px; --top: 50%; --left: 90%;"></div>
      <div class="vision-star" style="--size: 2px; --top: 10%; --left: 60%;"></div>
      <div class="vision-star" style="--size: 4px; --top: 90%; --left: 75%;"></div>
      <div class="vision-star" style="--size: 3px; --top: 5%; --left: 25%;"></div>
      <div class="vision-star" style="--size: 2px; --top: 75%; --left: 5%;"></div>
      <div class="vision-star" style="--size: 3px; --top: 60%; --left: 40%;"></div>
    </div>
    
    <div class="cosmic-nebula left-nebula"></div>
    <div class="cosmic-nebula right-nebula"></div>
    
    <div class="cosmic-dust-particles">
      <div class="dust-particle" style="--size: 3px; --delay: 0s; --speed: 20s;"></div>
      <div class="dust-particle" style="--size: 2px; --delay: 2s; --speed: 15s;"></div>
      <div class="dust-particle" style="--size: 4px; --delay: 4s; --speed: 25s;"></div>
      <div class="dust-particle" style="--size: 3px; --delay: 6s; --speed: 18s;"></div>
      <div class="dust-particle" style="--size: 2px; --delay: 8s; --speed: 22s;"></div>
      <div class="dust-particle" style="--size: 3px; --delay: 10s; --speed: 17s;"></div>
      <div class="dust-particle" style="--size: 4px; --delay: 12s; --speed: 24s;"></div>
      <div class="dust-particle" style="--size: 2px; --delay: 14s; --speed: 19s;"></div>
    </div>
    
    <div class="cosmic-container">
      <div class="section-header vision-header">
        <div class="cosmic-header-decoration">
          <div class="cosmic-line"></div>
          <div class="cosmic-orb"></div>
          <div class="cosmic-line"></div>
        </div>
        
        <h2 class="section-title vision-title">Our Vision & Culture</h2>
        <p class="section-subtitle vision-subtitle">Join a team of visionaries building the next generation of gaming experiences</p>
      </div>
      
      <div class="culture-grid">
        <div class="culture-card">
          <div class="card-shine"></div>
          <div class="card-cosmic-bg"></div>
          <div class="card-icon">
            <i class="fas fa-handshake"></i>
            <div class="icon-rays">
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
            </div>
          </div>
          <h3>Collaborative Innovation</h3>
          <p>We believe the best ideas emerge when brilliant minds work together. Our flat hierarchy encourages open dialogue and rapid experimentation.</p>
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
          </div>
          <h3>Creative Freedom</h3>
          <p>We hire exceptional people and give them the autonomy to create extraordinary things. Your unique perspective is our competitive advantage.</p>
        </div>
        
        <div class="culture-card">
          <div class="card-shine"></div>
          <div class="card-cosmic-bg"></div>
          <div class="card-icon">
            <i class="fas fa-rocket"></i>
            <div class="icon-rays">
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
            </div>
          </div>
          <h3>Frontier Explorers</h3>
          <p>We're charting unknown territories at the intersection of gaming, blockchain, and space exploration. Every day brings new discoveries.</p>
        </div>
        
        <div class="culture-card">
          <div class="card-shine"></div>
          <div class="card-cosmic-bg"></div>
          <div class="card-icon">
            <i class="fas fa-balance-scale"></i>
            <div class="icon-rays">
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
              <div class="icon-ray"></div>
            </div>
          </div>
          <h3>Work-Life Harmony</h3>
          <p>We value sustainable creativity. We foster an environment where peak performance comes from well-rested, passionate individuals, not burnout.</p>
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
  padding-top: 100px;
  margin-top: -80px; /* Pull up to overlap with hero portal */
  background: linear-gradient(
    to bottom,
    rgba(15, 25, 35, 0) 0%,
    rgba(15, 25, 35, 0.5) 100px,
    rgba(15, 25, 35, 0.3) 100%
  );
  overflow: hidden;
  min-height: 100vh;
}

.vision-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background: radial-gradient(
    ellipse at top center,
    rgba(15, 185, 253, 0.2) 0%,
    rgba(15, 185, 253, 0) 70%
  );
  z-index: -1;
}

.vision-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.vision-star {
  position: absolute;
  width: var(--size);
  height: var(--size);
  top: var(--top);
  left: var(--left);
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--size) * 3) rgba(255, 255, 255, 0.7),
              0 0 calc(var(--size) * 5) rgba(15, 185, 253, 0.5);
  animation: starTwinkle 3s infinite alternate;
  animation-delay: calc(var(--top) * 0.01s);
}

.cosmic-nebula {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(50px);
  z-index: -1;
  pointer-events: none;
}

.left-nebula {
  top: 20%;
  left: -100px;
  background: radial-gradient(
    circle at center,
    rgba(103, 58, 183, 0.7) 0%,
    rgba(103, 58, 183, 0.3) 50%,
    rgba(103, 58, 183, 0) 70%
  );
  animation: nebulaFloat 20s infinite alternate var(--animation-smooth);
}

.right-nebula {
  bottom: 10%;
  right: -100px;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.7) 0%,
    rgba(15, 185, 253, 0.3) 50%,
    rgba(15, 185, 253, 0) 70%
  );
  animation: nebulaFloat 20s infinite alternate-reverse var(--animation-smooth);
}

.cosmic-dust-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.dust-particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--size) * 2) rgba(255, 255, 255, 0.5),
              0 0 calc(var(--size) * 4) rgba(15, 185, 253, 0.3);
  animation: floatDust var(--speed) linear infinite;
  animation-delay: var(--delay);
  opacity: 0.3;
}

.dust-particle:nth-child(1) { top: 20%; left: 10%; }
.dust-particle:nth-child(2) { top: 40%; left: 20%; }
.dust-particle:nth-child(3) { top: 70%; left: 15%; }
.dust-particle:nth-child(4) { top: 30%; left: 80%; }
.dust-particle:nth-child(5) { top: 60%; left: 75%; }
.dust-particle:nth-child(6) { top: 80%; left: 90%; }
.dust-particle:nth-child(7) { top: 10%; left: 40%; }
.dust-particle:nth-child(8) { top: 50%; left: 60%; }

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
}

.cosmic-header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: 0.2s;
}

.cosmic-line {
  width: 100px;
  height: 2px;
  background: linear-gradient(
    to var(--direction, right),
    rgba(15, 185, 253, 0),
    rgba(15, 185, 253, 0.8)
  );
  opacity: 0.7;
}

.cosmic-line:first-child {
  --direction: left;
}

.cosmic-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  margin: 0 10px;
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.8);
  animation: orbPulse 3s infinite alternate var(--animation-smooth);
}

.vision-title {
  opacity: 0;
  transform: translateY(30px);
  animation: titleReveal 1s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.3);
  position: relative;
  z-index: 2;
}

.vision-subtitle {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: 0.8s;
  position: relative;
  z-index: 2;
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
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
}

.culture-card:nth-child(1) { animation-delay: 0.3s; }
.culture-card:nth-child(2) { animation-delay: 0.5s; }
.culture-card:nth-child(3) { animation-delay: 0.7s; }
.culture-card:nth-child(4) { animation-delay: 0.9s; }

.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 20%,
    transparent 80%
  );
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
}

.card-cosmic-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 70% 30%,
    rgba(15, 185, 253, 0.1) 0%,
    transparent 60%
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
}

.culture-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(15, 185, 253, 0.3);
  border-color: rgba(15, 185, 253, 0.4);
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
}

.culture-card:hover .card-icon {
  transform: scale(1.1);
  box-shadow: 0 0 25px rgba(15, 185, 253, 0.5);
}

.card-icon i {
  font-size: 2rem;
  color: var(--cosmic-blue);
  transition: all 0.5s var(--animation-bounce);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.culture-card:hover .card-icon i {
  transform: scale(1.2);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.7));
}

.icon-rays {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
}

.culture-card:hover .icon-rays {
  opacity: 1;
}

.icon-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0.8),
    rgba(15, 185, 253, 0)
  );
  transform-origin: left center;
  animation: rayRotate 10s linear infinite;
}

.icon-ray:nth-child(1) { transform: translate(-50%, -50%) rotate(0deg); }
.icon-ray:nth-child(2) { transform: translate(-50%, -50%) rotate(90deg); }
.icon-ray:nth-child(3) { transform: translate(-50%, -50%) rotate(180deg); }
.icon-ray:nth-child(4) { transform: translate(-50%, -50%) rotate(270deg); }

.culture-card h3 {
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
  margin-bottom: 1rem;
  transition: all 0.3s var(--animation-smooth);
  position: relative;
}

.culture-card:hover h3 {
  color: var(--cosmic-blue);
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
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes starTwinkle {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes nebulaFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.15;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(-30px) scale(1.1);
    opacity: 0.15;
  }
}

@keyframes floatDust {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0.2;
  }
  25% {
    opacity: 0.4;
  }
  50% {
    transform: translateY(-100px) translateX(100px);
    opacity: 0.3;
  }
  75% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-200px) translateX(200px);
    opacity: 0;
  }
}

@keyframes orbPulse {
  0% {
    transform: scale(0.8);
    box-shadow: 0 0 10px rgba(15, 185, 253, 0.6);
  }
  100% {
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(15, 185, 253, 0.8);
  }
}

@keyframes rayRotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .culture-grid {
    grid-template-columns: 1fr;
  }
  
  .cosmic-header-decoration {
    margin-bottom: 1.5rem;
  }
  
  .cosmic-line {
    width: 70px;
  }
  
  .vision-title {
    font-size: 2.25rem;
  }
  
  .vision-subtitle {
    font-size: 1.1rem;
  }
}
</style> 