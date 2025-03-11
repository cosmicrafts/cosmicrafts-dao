<template>
  <section class="process-section">
    <div class="container mx-auto px-4">
      <div class="section-header text-center mb-16">
        <h2 class="section-title mb-6">Our Selection Process</h2>
        <p class="section-subtitle">We've carefully designed our hiring process to be thorough yet respectful of your time.</p>
      </div>

      <!-- Process Timeline -->
      <div class="process-timeline cosmic-card">
        <!-- Timeline Animation Progress -->
        <div class="timeline-animation-progress"></div>
        
        <!-- Timeline Dots -->
        <div class="timeline-dots">
          <div class="timeline-dot"></div>
          <div class="timeline-dot"></div>
          <div class="timeline-dot"></div>
          <div class="timeline-dot"></div>
        </div>
        
        <!-- Step 1 -->
        <div class="timeline-item">
          <div class="timeline-number">1</div>
          <div class="timeline-connector"></div>
          <div class="timeline-content cosmic-card">
            <div class="timeline-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <h3>Application Review</h3>
            <p>Our team carefully reviews your application to understand your skills, experience, and alignment with our mission. We look beyond just qualifications to identify creative minds that share our vision.</p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="timeline-item">
          <div class="timeline-number">2</div>
          <div class="timeline-connector"></div>
          <div class="timeline-content cosmic-card">
            <div class="timeline-icon">
              <i class="fas fa-comments"></i>
            </div>
            <h3>Initial Conversation</h3>
            <p>If there's a potential match, we'll schedule a casual conversation to discuss your background, interests, and answer any questions you might have about the role and our organization.</p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="timeline-item">
          <div class="timeline-number">3</div>
          <div class="timeline-connector"></div>
          <div class="timeline-content cosmic-card">
            <div class="timeline-icon">
              <i class="fas fa-laptop-code"></i>
            </div>
            <h3>Technical Assessment</h3>
            <p>For technical roles, we'll ask you to complete a brief, practical assessment related to the work you'll be doing. This helps us evaluate your skills in a real-world context rather than through abstract problems.</p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="timeline-item">
          <div class="timeline-number">4</div>
          <div class="timeline-connector"></div>
          <div class="timeline-content cosmic-card">
            <div class="timeline-icon">
              <i class="fas fa-users"></i>
            </div>
            <h3>Team Interviews</h3>
            <p>Meet with team members you'll be working with to discuss collaboration approaches, technical challenges, and ensure there's a mutual cultural fit. This is as much about you evaluating us as it is about us evaluating you.</p>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="timeline-item">
          <div class="timeline-number">5</div>
          <div class="timeline-connector"></div>
          <div class="timeline-content cosmic-card">
            <div class="timeline-icon">
              <i class="fas fa-handshake"></i>
            </div>
            <h3>Decision & Offer</h3>
            <p>If there's a great match, we'll extend an offer that includes competitive compensation, benefits, and details about your role. We'll also provide feedback regardless of the outcome.</p>
          </div>
        </div>
      </div>

      <!-- Process Summary -->
      <div class="process-summary cosmic-card">
        <div class="summary-icon">
          <i class="fas fa-rocket"></i>
        </div>
        <div class="summary-content">
          <h3>Fast & Transparent Process</h3>
          <p>Our entire process typically takes 1-2 weeks from application to decision. We respect your time and communicate promptly at every stage. We believe a hiring process should be human, efficient, and focused on finding the right match for both parties.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CareerProcess'
}
</script>

<style scoped>
/* Process Section - Enhanced with advanced timeline animations */
.process-section {
  padding-top: 10rem;
  padding-bottom: 12rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, transparent, rgba(15, 25, 35, 0.4), transparent);
  isolation: isolate;
}

.process-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(15, 185, 253, 0.07) 0%, transparent 70%),
    radial-gradient(circle at 80% 70%, rgba(103, 58, 183, 0.07) 0%, transparent 70%);
  z-index: -1;
  opacity: 0.8;
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

.process-timeline {
  max-width: 900px;
  margin: 0 auto 5rem;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.process-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 40px;
  width: 2px;
  background: linear-gradient(to bottom, 
    rgba(15, 185, 253, 0.1),
    rgba(15, 185, 253, 0.5) 50%,
    rgba(15, 185, 253, 0.1)
  );
  z-index: 0;
  box-shadow: var(--cosmic-glow-blue-sm);
  opacity: 0;
  transform: scaleY(0.8);
  animation: timelineAppear 0.6s var(--animation-smooth) forwards;
  animation-delay: 0.3s;
  transform-origin: top center;
}

.timeline-item {
  display: flex;
  margin-bottom: 3.5rem;
  position: relative;
  opacity: 0;
  transform: translateX(-30px);
  animation: timelineItemAppear 0.8s var(--animation-bounce) forwards;
  transform-style: preserve-3d;
}

.timeline-item:nth-child(1) { animation-delay: 0.4s; }
.timeline-item:nth-child(2) { animation-delay: 0.6s; }
.timeline-item:nth-child(3) { animation-delay: 0.8s; }
.timeline-item:nth-child(4) { animation-delay: 1.0s; }
.timeline-item:nth-child(5) { animation-delay: 1.2s; }

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-number {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--cosmic-blue);
  margin-right: 2rem;
  box-shadow: var(--cosmic-glow-blue-sm);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  transition: all 0.5s var(--animation-bounce);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.timeline-number::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent,
    var(--cosmic-blue) 25%,
    transparent 50%
  );
  opacity: 0;
  z-index: -1;
  transition: opacity 0.5s var(--animation-smooth), transform 10s linear;
  transform: rotate(0deg);
}

.timeline-item:hover .timeline-number {
  transform: translateZ(20px) scale(1.1);
  box-shadow: var(--cosmic-glow-blue-md), 0 15px 30px rgba(0, 0, 0, 0.2);
}

.timeline-item:hover .timeline-number::before {
  opacity: 0.3;
  transform: rotate(360deg);
}

.timeline-connector {
  position: absolute;
  top: 40px;
  left: 40px;
  width: 50px;
  height: 2px;
  background: linear-gradient(to right, var(--cosmic-blue), transparent);
  transform: translateX(100%);
  opacity: 0;
  animation: connectorAppear 0.4s var(--animation-smooth) forwards;
  animation-delay: calc(0.4s + var(--delay, 0s));
}

.timeline-item:nth-child(1) .timeline-connector { --delay: 0.4s; }
.timeline-item:nth-child(2) .timeline-connector { --delay: 0.6s; }
.timeline-item:nth-child(3) .timeline-connector { --delay: 0.8s; }
.timeline-item:nth-child(4) .timeline-connector { --delay: 1.0s; }
.timeline-item:nth-child(5) .timeline-connector { --delay: 1.2s; }

.timeline-content {
  flex: 1;
  padding: 2rem;
  position: relative;
  transition: all 0.5s var(--animation-bounce);
  transform-style: preserve-3d;
  border: var(--cosmic-glass-border);
  backdrop-filter: blur(5px);
  opacity: 0;
  transform: translateY(20px) translateZ(-10px) rotateX(5deg);
  animation: contentAppear 0.6s var(--animation-bounce) forwards;
  animation-delay: calc(0.4s + var(--delay, 0s) + 0.2s);
  overflow: hidden;
}

.timeline-item:nth-child(1) .timeline-content { --delay: 0.4s; }
.timeline-item:nth-child(2) .timeline-content { --delay: 0.6s; }
.timeline-item:nth-child(3) .timeline-content { --delay: 0.8s; }
.timeline-item:nth-child(4) .timeline-content { --delay: 1.0s; }
.timeline-item:nth-child(5) .timeline-content { --delay: 1.2s; }

.timeline-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.03) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.4s var(--animation-smooth);
  z-index: 0;
  pointer-events: none;
}

.timeline-item:hover .timeline-content {
  transform: translateY(-10px) translateZ(10px) rotateX(0deg);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
  z-index: 5;
}

.timeline-item:hover .timeline-content::before {
  opacity: 1;
}

.timeline-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
  position: relative;
  display: inline-block;
  z-index: 1;
  transition: all 0.3s var(--animation-smooth);
}

.timeline-content h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0;
  height: 2px;
  background: var(--cosmic-blue);
  transition: width 0.4s var(--animation-bounce);
  border-radius: 2px;
}

.timeline-item:hover .timeline-content h3 {
  color: var(--cosmic-blue);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.timeline-item:hover .timeline-content h3::after {
  width: 100%;
}

.timeline-content p {
  color: var(--cosmic-text-secondary);
  line-height: 1.7;
  transition: all 0.3s var(--animation-smooth);
}

.timeline-item:hover .timeline-content p {
  color: var(--cosmic-text-primary);
}

.timeline-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 54px;
  height: 54px;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: 12px;
  transform: translate(30%, -30%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
  transition: all 0.5s var(--animation-bounce);
  z-index: 2;
  opacity: 0;
  animation: iconAppear 0.5s var(--animation-bounce) forwards;
  animation-delay: calc(0.4s + var(--delay, 0s) + 0.4s);
}

.timeline-item:nth-child(1) .timeline-icon { --delay: 0.4s; }
.timeline-item:nth-child(2) .timeline-icon { --delay: 0.6s; }
.timeline-item:nth-child(3) .timeline-icon { --delay: 0.8s; }
.timeline-item:nth-child(4) .timeline-icon { --delay: 1.0s; }
.timeline-item:nth-child(5) .timeline-icon { --delay: 1.2s; }

.timeline-item:hover .timeline-icon {
  transform: translate(30%, -30%) rotate(0deg) scale(1.15);
  box-shadow: var(--cosmic-glow-blue-md), 0 10px 20px rgba(0, 0, 0, 0.2);
}

.timeline-icon i {
  font-size: 1.5rem;
  transition: all 0.4s var(--animation-bounce);
  filter: drop-shadow(0 0 3px rgba(15, 185, 253, 0.3));
}

.timeline-item:hover .timeline-icon i {
  transform: scale(1.2);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
}

.timeline-dots {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.timeline-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
  opacity: 0;
  animation: dotPulse 2s infinite alternate var(--animation-smooth);
}

.timeline-dot:nth-child(1) {
  top: 20%;
  left: 40px;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.timeline-dot:nth-child(2) {
  top: 40%;
  left: 40px;
  transform: translateX(-50%);
  animation-delay: 0.4s;
}

.timeline-dot:nth-child(3) {
  top: 60%;
  left: 40px;
  transform: translateX(-50%);
  animation-delay: 0.8s;
}

.timeline-dot:nth-child(4) {
  top: 80%;
  left: 40px;
  transform: translateX(-50%);
  animation-delay: 1.2s;
}

.process-summary {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  transform: translateY(50px);
  opacity: 0;
  animation: summarySlidein 0.8s var(--animation-bounce) forwards;
  animation-delay: 1.5s;
  overflow: hidden;
  transition: all 0.4s var(--animation-bounce);
}

.process-summary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
  z-index: 0;
  pointer-events: none;
}

.process-summary:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
}

.process-summary:hover::before {
  opacity: 1;
}

.summary-icon {
  width: 80px;
  height: 80px;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  font-size: 2rem;
  box-shadow: var(--cosmic-glow-blue-sm);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: all 0.5s var(--animation-bounce);
  transform-style: preserve-3d;
}

.summary-icon::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: inherit;
  background: conic-gradient(
    from 0deg,
    transparent,
    var(--cosmic-blue) 25%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth), transform 10s linear;
  transform: rotate(0deg);
  z-index: -1;
}

.process-summary:hover .summary-icon {
  transform: translateZ(30px) scale(1.1);
  box-shadow: var(--cosmic-glow-blue-md), 0 15px 30px rgba(0, 0, 0, 0.2);
}

.process-summary:hover .summary-icon::before {
  opacity: 0.5;
  transform: rotate(360deg);
}

.summary-content {
  position: relative;
  z-index: 1;
  flex: 1;
}

.summary-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--cosmic-text-primary);
  position: relative;
  display: inline-block;
  transition: all 0.3s var(--animation-smooth);
}

.summary-content h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0;
  height: 2px;
  background: var(--cosmic-blue);
  transition: width 0.4s var(--animation-bounce);
  border-radius: 2px;
}

.process-summary:hover .summary-content h3 {
  color: var(--cosmic-blue);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.process-summary:hover .summary-content h3::after {
  width: 100%;
}

.summary-content p {
  color: var(--cosmic-text-secondary);
  line-height: 1.7;
  transition: all 0.3s var(--animation-smooth);
}

.process-summary:hover .summary-content p {
  color: var(--cosmic-text-primary);
}

.timeline-animation-progress {
  position: absolute;
  top: 0;
  left: 40px;
  width: 2px;
  height: 0;
  background: var(--cosmic-blue);
  z-index: 1;
  transform: translateX(-50%);
  animation: timelineProgress 2s var(--animation-smooth) forwards;
  animation-delay: 1.4s;
  box-shadow: var(--cosmic-glow-blue-md);
}

/* Animation Keyframes for Process Section */
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

@keyframes timelineAppear {
  from {
    opacity: A0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes timelineItemAppear {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes contentAppear {
  from {
    opacity: 0;
    transform: translateY(20px) translateZ(-10px) rotateX(5deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0) rotateX(0);
  }
}

@keyframes iconAppear {
  from {
    opacity: 0;
    transform: translate(30%, -30%) rotate(-45deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(30%, -30%) rotate(0) scale(1);
  }
}

@keyframes connectorAppear {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes dotPulse {
  0% {
    opacity: 0.2;
    transform: translateX(-50%) scale(0.8);
  }
  100% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1.2);
  }
}

@keyframes summarySlidein {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes timelineProgress {
  from {
    height: 0;
  }
  to {
    height: 100%;
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

/* Mobile Styles for Process Section */
@media (max-width: 768px) {
  .timeline-item {
    flex-direction: column;
  }

  .timeline-number {
    margin-bottom: 1.5rem;
    margin-right: 0;
    align-self: center;
  }

  .process-timeline::before {
    left: 50%;
    transform: translateX(-50%) scaleY(0.8);
  }

  .process-timeline::before.active {
    transform: translateX(-50%) scaleY(1);
  }

  .timeline-connector {
    top: 80px;
    left: 50%;
    width: 2px;
    height: 40px;
    transform: translateX(-50%);
    background: linear-gradient(to bottom, var(--cosmic-blue), transparent);
  }

  .timeline-dot:nth-child(1),
  .timeline-dot:nth-child(2),
  .timeline-dot:nth-child(3),
  .timeline-dot:nth-child(4) {
    left: 50%;
  }

  .timeline-animation-progress {
    left: 50%;
  }

  .process-summary {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }

  .process-summary .summary-icon {
    margin-bottom: 1rem;
  }

  .summary-content h3::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .process-summary:hover .summary-content h3::after {
    width: 50%;
  }
}
</style> 