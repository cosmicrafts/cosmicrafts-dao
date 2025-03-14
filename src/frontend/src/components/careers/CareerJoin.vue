<template>
  <section class="join-section">
    <div class="container mx-auto px-4">
      <!-- Cosmic Particles Background -->
      <div class="cosmic-particles">
        <div class="cosmic-particle"></div>
        <div class="cosmic-particle"></div>
        <div class="cosmic-particle"></div>
        <div class="cosmic-particle"></div>
        <div class="cosmic-particle"></div>
        <div class="cosmic-particle"></div>
      </div>
      

      
      <div class="community-links">
        <h3>Follow Our Journey</h3>
        <div class="social-links">
          <a href="https://twitter.com/cosmicrafts" class="social-link">
            <i class="fab fa-twitter"></i>
            <span>Twitter</span>
          </a>
          <a href="https://github.com/cosmicrafts" class="social-link">
            <i class="fab fa-github"></i>
            <span>GitHub</span>
          </a>
          <a href="https://medium.com/@cosmicrafts" class="social-link">
            <i class="fab fa-medium"></i>
            <span>Medium</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CareerJoin'
}
</script>

<style scoped>
/* Join Section - Enhanced with interactive effects */
.join-section {
  margin-top: -4rem;
  padding: 4rem;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.join-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.6;
  animation: pulseBackground 15s infinite alternate var(--animation-smooth);
}

.join-container {
  display: flex;
  border: var(--cosmic-glass-border-blue);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  margin-bottom: 5rem;
  backdrop-filter: blur(10px);
  box-shadow: var(--cosmic-shadow-lg);
  transform: translateY(50px);
  opacity: 0;
  animation: joinSlideUp 0.8s var(--animation-bounce) forwards;
}

.join-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.03) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
  z-index: 0;
  pointer-events: none;
}

.join-container:hover::before {
  opacity: 1;
}

.join-content {
  padding: 4rem;
  flex: 1;
  max-width: 60%;
  position: relative;
  z-index: 2;
}

.join-title {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-primary);
  background: linear-gradient(90deg, var(--cosmic-text-primary), var(--cosmic-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.6s var(--animation-bounce) forwards;
  animation-delay: 0.3s;
  position: relative;
  display: inline-block;
}

.join-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--cosmic-blue);
  border-radius: 3px;
  box-shadow: 0 0 10px var(--cosmic-blue);
  opacity: 0;
  animation: titleBarSlide 0.8s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
}

.join-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--cosmic-text-secondary);
  margin-bottom: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.6s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
}

.join-actions {
  display: flex;
  gap: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.6s var(--animation-bounce) forwards;
  animation-delay: 0.7s;
}

.join-actions .cosmic-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.5s var(--animation-bounce);
  position: relative;
  overflow: hidden;
}

.join-actions .cosmic-btn i {
  transition: all 0.4s var(--animation-bounce);
}

.join-actions .cosmic-btn:hover i {
  transform: translateX(3px) scale(1.2);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.join-actions .cosmic-btn-primary {
  position: relative;
  z-index: 1;
}

.join-actions .cosmic-btn-primary::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: conic-gradient(
    from 0deg,
    var(--cosmic-blue) 0%,
    rgba(103, 58, 183, 0.8) 25%,
    var(--cosmic-blue) 50%,
    rgba(103, 58, 183, 0.8) 75%,
    var(--cosmic-blue) 100%
  );
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
  z-index: -1;
  animation: rotateConic 10s linear infinite;
  filter: blur(10px);
}

.join-actions .cosmic-btn-primary:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-lg), 
    0 0 20px rgba(15, 185, 253, 0.3), 
    0 0 40px rgba(15, 185, 253, 0.2);
  letter-spacing: 0.5px;
}

.join-actions .cosmic-btn-primary:hover::before {
  opacity: 0.2;
}

.join-actions .cosmic-btn-secondary {
  box-shadow: none;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.join-actions .cosmic-btn-secondary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  z-index: -1;
}

.join-actions .cosmic-btn-secondary:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  letter-spacing: 0.5px;
}

.join-actions .cosmic-btn-secondary:hover::before {
  opacity: 1;
}

.join-graphic {
  flex: 1;
  position: relative;
  overflow: hidden;
  z-index: 1;
  min-height: 350px;
}

.floating-astronaut {
  position: absolute;
  width: 300px;
  height: 300px;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  animation: floatAstronaut 6s ease-in-out infinite alternate;
}

.astronaut-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: rotate(15deg);
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  transition: all 0.5s var(--animation-bounce);
}

.join-graphic:hover .astronaut-img {
  transform: rotate(5deg) scale(1.05);
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4)) brightness(1.1);
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(15, 185, 253, 0.7) 0%,
    rgba(15, 185, 253, 0.3) 40%,
    rgba(15, 185, 253, 0.1) 60%,
    rgba(15, 185, 253, 0) 70%
  );
  filter: blur(8px);
  animation: pulseGlow 4s ease-in-out infinite alternate;
  z-index: 1;
}

/* Cosmic Particles */
.cosmic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.cosmic-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  animation: floatParticle var(--duration, 10s) linear infinite;
  opacity: var(--opacity, 0.3);
  box-shadow: 0 0 10px var(--cosmic-blue);
}

.cosmic-particle:nth-child(1) {
  top: 20%;
  left: 10%;
  --duration: 15s;
  --opacity: 0.4;
}

.cosmic-particle:nth-child(2) {
  top: 50%;
  left: 20%;
  --duration: 20s;
  --opacity: 0.2;
}

.cosmic-particle:nth-child(3) {
  top: 70%;
  left: 15%;
  --duration: 18s;
  --opacity: 0.3;
}

.cosmic-particle:nth-child(4) {
  top: 30%;
  left: 80%;
  --duration: 12s;
  --opacity: 0.5;
}

.cosmic-particle:nth-child(5) {
  top: 60%;
  left: 75%;
  --duration: 16s;
  --opacity: 0.2;
}

.cosmic-particle:nth-child(6) {
  top: 80%;
  left: 85%;
  --duration: 14s;
  --opacity: 0.4;
}

.community-links {
  text-align: center;
  padding-top: 3rem;
  position: relative;
  z-index: 1;
}

.community-links h3 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: var(--cosmic-text-primary);
  position: relative;
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.6s var(--animation-bounce) forwards;
  animation-delay: 0.3s;
}

.community-links h3::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--cosmic-blue);
  border-radius: 3px;
  opacity: 0;
  animation: communityBarExpand 0.8s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.6s var(--animation-bounce) forwards;
  animation-delay: 0.5s;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.8rem;
  border-radius: 50px;
  transition: all 0.5s var(--animation-bounce);
  background: var(--cosmic-glass-bg);
  backdrop-filter: blur(5px);
  border: var(--cosmic-glass-border);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.social-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  z-index: -1;
  border-radius: inherit;
}

.social-link::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s var(--animation-bounce), opacity 0.6s;
  z-index: -1;
}

.social-link:hover {
  transform: translateY(-7px);
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm), 0 10px 20px rgba(0, 0, 0, 0.1);
  color: var(--cosmic-text-primary);
}

.social-link:hover::before {
  opacity: 1;
}

.social-link:hover::after {
  opacity: 0.1;
  transform: translate(-50%, -50%) scale(40);
}

.social-link i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
  transition: all 0.4s var(--animation-bounce);
}

.social-link:hover i {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
}

.social-link span {
  font-size: 1rem;
  color: var(--cosmic-text-primary);
  transition: all 0.3s var(--animation-smooth);
  font-weight: 500;
}

.social-link:hover span {
  letter-spacing: 0.5px;
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

@keyframes floatAstronaut {
  0% {
    transform: translateY(-50%) translateX(0) rotate(0deg);
  }
  50% {
    transform: translateY(-55%) translateX(-15px) rotate(-2deg);
  }
  100% {
    transform: translateY(-45%) translateX(5px) rotate(3deg);
  }
}

@keyframes pulseGlow {
  0% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.8);
    filter: blur(8px);
  }
  50% {
    opacity: 0.6;
    filter: blur(10px);
  }
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
    filter: blur(12px);
  }
}

@keyframes floatParticle {
  0% {
    transform: translateY(0) translateX(0);
    opacity: var(--opacity, 0.3);
  }
  25% {
    transform: translateY(-10px) translateX(10px);
    opacity: calc(var(--opacity, 0.3) + 0.1);
  }
  50% {
    transform: translateY(10px) translateX(20px);
    opacity: var(--opacity, 0.3);
  }
  75% {
    transform: translateY(0) translateX(10px);
    opacity: calc(var(--opacity, 0.3) - 0.1);
  }
  100% {
    transform: translateY(0) translateX(0);
    opacity: var(--opacity, 0.3);
  }
}

@keyframes joinSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleBarSlide {
  from {
    opacity: 0;
    width: 0;
  }
  to {
    opacity: 1;
    width: 50px;
  }
}

@keyframes communityBarExpand {
  from {
    opacity: 0;
    width: 0;
  }
  to {
    opacity: 1;
    width: 60px;
  }
}

@keyframes pulseBackground {
  0% {
    opacity: 0.4;
    transform: scale(0.9) translateX(0);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.1) translateX(-30px);
  }
}

@keyframes rotateConic {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .join-container {
    flex-direction: column;
  }
  
  .join-content {
    max-width: 100%;
    padding: 3rem;
  }
  
  .join-graphic {
    height: 250px;
  }
  
  .floating-astronaut {
    right: auto;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  @keyframes floatAstronaut {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    50% {
      transform: translate(-50%, -60%) rotate(-3deg);
    }
    100% {
      transform: translate(-50%, -40%) rotate(3deg);
    }
  }
}

@media (max-width: 768px) {
  .join-title {
    font-size: 2rem;
  }
  
  .join-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .join-actions .cosmic-btn {
    width: 100%;
    justify-content: center;
  }
  
  .social-links {
    gap: 1rem;
  }
  
  .social-link {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .join-content {
    padding: 2rem;
  }
  
  .social-links {
    flex-direction: column;
  }
  
  .social-link {
    width: 100%;
    justify-content: center;
  }
  
  /* Optimized animations for mobile performance */
  .cosmic-particle {
    display: none;
  }
  
  .glow-effect {
    opacity: 0.5;
    filter: blur(5px);
  }
  
  @keyframes pulseGlow {
    0% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(0.8);
      filter: blur(5px);
    }
    100% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1.1);
      filter: blur(7px);
    }
  }
}
</style> 