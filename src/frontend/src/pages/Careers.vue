<template>
  <div class="careers-page cosmic-page-bg with-subtle-grid">
    <!-- Hero Section -->
    <section class="careers-hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-accent">Join</span> the Cosmic Revolution
          </h1>
          <p class="hero-subtitle">Create the future of gaming at the intersection of blockchain, strategy, and space exploration</p>
          <div class="hero-cta">
            <a href="#open-positions" class="cosmic-button-primary hero-button">
              <i class="fas fa-rocket"></i>
              Explore Opportunities
            </a>
            <a href="#culture" class="cosmic-button-outline hero-button">
              <i class="fas fa-star"></i>
              Our Culture
            </a>
          </div>
        </div>
        <div class="hero-graphic">
          <div class="floating-elements">
            <div class="floating-element cosmic-float" style="--delay: 0s;">
              <i class="fas fa-meteor"></i>
            </div>
            <div class="floating-element cosmic-float" style="--delay: 1s;">
              <i class="fas fa-planet-ringed"></i>
            </div>
            <div class="floating-element cosmic-float" style="--delay: 2s;">
              <i class="fas fa-rocket"></i>
            </div>
            <div class="floating-element cosmic-float" style="--delay: 3s;">
              <i class="fas fa-satellite"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="scroll-indicator">
        <span>Scroll to explore</span>
        <i class="fas fa-chevron-down cosmic-pulse"></i>
      </div>
    </section>

    <!-- Culture Section -->
    <section id="culture" class="career-section culture-section">
      <div class="cosmic-container">
        <div class="section-header">
          <h2 class="section-title">Our Vision & Culture</h2>
          <p class="section-subtitle">Join a team of visionaries building the next generation of gaming experiences</p>
        </div>

        <div class="culture-grid">
          <div class="culture-card cosmic-card">
            <div class="card-icon">
              <i class="fas fa-handshake"></i>
            </div>
            <h3>Collaborative Innovation</h3>
            <p>We believe the best ideas emerge when brilliant minds work together. Our flat hierarchy encourages open dialogue and rapid experimentation.</p>
          </div>

          <div class="culture-card cosmic-card">
            <div class="card-icon">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h3>Creative Freedom</h3>
            <p>We hire exceptional people and give them the autonomy to create extraordinary things. Your unique perspective is our competitive advantage.</p>
          </div>

          <div class="culture-card cosmic-card">
            <div class="card-icon">
              <i class="fas fa-rocket"></i>
            </div>
            <h3>Frontier Explorers</h3>
            <p>We're charting unknown territories at the intersection of gaming, blockchain, and space exploration. Every day brings new discoveries.</p>
          </div>

          <div class="culture-card cosmic-card">
            <div class="card-icon">
              <i class="fas fa-balance-scale"></i>
            </div>
            <h3>Work-Life Harmony</h3>
            <p>We value sustainable creativity. We foster an environment where peak performance comes from well-rested, passionate individuals, not burnout.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
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
              <li class="benefit-item cosmic-hover-effect">
                <i class="fas fa-heart"></i>
                <div>
                  <h4>Comprehensive Healthcare</h4>
                  <p>Premium health, dental, and vision coverage for you and your dependents, regardless of your location.</p>
                </div>
              </li>
              <li class="benefit-item cosmic-hover-effect">
                <i class="fas fa-battery-full"></i>
                <div>
                  <h4>Recharge Time</h4>
                  <p>Unlimited paid time off, company-wide wellness days, and sabbatical opportunities after extended tenure.</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="benefits-graphic">
            <div class="graphic-element cosmic-panel with-glow">
              <div class="graphic-content">
                <img src="/src/assets/webp/tokenomics.webp" alt="Cosmicrafts benefits" class="benefits-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Open Positions Section -->
    <section class="positions-section">
      <div class="container mx-auto px-4">
        <div class="section-header text-center mb-16">
          <h2 class="section-title mb-6">Open Opportunities</h2>
          <p class="section-subtitle">Join our team of visionaries and innovators shaping the future of web3.</p>
        </div>

        <!-- Position Filters -->
        <div class="positions-filter">
          <span class="filter-title">Filter by:</span>
          <div class="filter-buttons">
            <button class="filter-button active">All Roles</button>
            <button class="filter-button">Engineering</button>
            <button class="filter-button">Design</button>
            <button class="filter-button">Product</button>
            <button class="filter-button">Community</button>
          </div>
        </div>

        <!-- Positions Grid -->
        <div class="positions-grid" v-if="positions.length > 0">
          <div 
            v-for="(position, index) in positions" 
            :key="index" 
            class="position-card cosmic-card"
            :class="{'is-active': position.open}"
          >
            <!-- Position Header (Always Visible) -->
            <div class="position-header" @click="togglePosition(index)">
              <div class="position-header-content">
                <h3 class="position-title">{{ position.title }}</h3>
                <div class="position-meta">
                  <div class="position-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>{{ position.location }}</span>
                  </div>
                  <div class="position-type">
                    <i class="fas fa-briefcase"></i>
                    <span>{{ position.type }}</span>
                  </div>
                </div>
              </div>
              <div class="position-action">
                <div class="expand-toggle" :class="{'is-open': position.open}">
                  <i class="fas" :class="position.open ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
              </div>
            </div>

            <!-- Position Overview (Always Visible) -->
            <div class="position-overview" v-if="!position.open">
              <p>{{ truncateDescription(position.description) }}</p>
              <div class="overview-footer">
                <button class="cosmic-btn cosmic-btn-outline view-details-btn" @click="togglePosition(index)">
                  View Full Details
                </button>
              </div>
            </div>

            <!-- Position Details (Visible when expanded) -->
            <div class="position-details" v-if="position.open">
              <!-- Full Description -->
              <div class="position-full-description">
                <p>{{ position.description }}</p>
              </div>

              <!-- Sections -->
              <div class="position-sections">
                <div 
                  v-for="(section, sectionIndex) in position.sections" 
                  :key="sectionIndex"
                  class="position-section"
                >
                  <h4>
                    <i class="fas" :class="getSectionIcon(section.title)"></i>
                    {{ section.title }}
                  </h4>
                  <ul class="section-items">
                    <li 
                      v-for="(item, itemIndex) in section.items" 
                      :key="itemIndex"
                      class="section-item"
                    >
                      <i class="fas fa-star-of-life"></i>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Apply Button -->
              <div class="position-apply">
                <a :href="`mailto:careers@cosmicrafts.com?subject=Application for ${position.title}`" class="cosmic-btn cosmic-btn-primary apply-btn">
                  <i class="fas fa-paper-plane"></i>
                  Apply Now
                </a>
                <div class="apply-note">
                  <i class="fas fa-info-circle"></i>
                  <span>Applications are reviewed within 48 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State (No Positions) -->
        <div class="empty-state cosmic-card" v-if="positions.length === 0">
          <i class="fas fa-search"></i>
          <h3>No Open Positions Currently</h3>
          <p>We don't have any open positions matching your criteria at the moment. However, we're always looking for talented individuals. Submit your information and we'll reach out when there's a match.</p>
          <a href="mailto:careers@cosmicrafts.com" class="cosmic-btn cosmic-btn-primary">
            Send Your Portfolio
          </a>
        </div>
      </div>
    </section>

    <!-- Application Process Section -->
    <section class="process-section">
      <div class="container mx-auto px-4">
        <div class="section-header text-center mb-16">
          <h2 class="section-title mb-6">Our Selection Process</h2>
          <p class="section-subtitle">We've carefully designed our hiring process to be thorough yet respectful of your time.</p>
        </div>

        <!-- Process Timeline -->
        <div class="process-timeline cosmic-card">
          <!-- Step 1 -->
          <div class="timeline-item">
            <div class="timeline-number">1</div>
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

    <!-- Testimonials Section (placeholder for batch 3) -->
    <section class="career-section testimonials-section">
      <!-- Will be completed in batch 3 -->
    </section>

    <!-- Contact Section (placeholder for batch 3) -->
    <section class="career-section contact-section">
      <!-- Will be completed in batch 3 -->
    </section>

    <!-- Join Our Community Section -->
    <section class="join-section">
      <div class="container mx-auto px-4">
        <div class="join-container cosmic-card">
          <div class="join-content">
            <h2 class="join-title">Not Seeing the Perfect Role?</h2>
            <p class="join-text">We're always interested in connecting with talented individuals passionate about web3 and blockchain innovation. Send us your portfolio and tell us how you'd like to contribute to our mission.</p>
            
            <div class="join-actions">
              <a href="mailto:careers@cosmicrafts.com" class="cosmic-btn cosmic-btn-primary">
                <i class="fas fa-envelope"></i>
                Contact Our Team
              </a>
              <a href="#" class="cosmic-btn cosmic-btn-secondary">
                <i class="fab fa-discord"></i>
                Join Our Discord
              </a>
            </div>
          </div>
          
          <div class="join-graphic">
            <div class="floating-astronaut">
              <img src="/src/assets/webp/tokenomics.webp" alt="Cosmic Astronaut" class="astronaut-img">
              <div class="glow-effect"></div>
            </div>
          </div>
        </div>
        
        <div class="community-links">
          <h3>Follow Our Journey</h3>
          <div class="social-links">
            <a href="#" class="social-link cosmic-card">
              <i class="fab fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a href="#" class="social-link cosmic-card">
              <i class="fab fa-github"></i>
              <span>GitHub</span>
            </a>
            <a href="#" class="social-link cosmic-card">
              <i class="fab fa-linkedin"></i>
              <span>LinkedIn</span>
            </a>
            <a href="#" class="social-link cosmic-card">
              <i class="fab fa-medium"></i>
              <span>Medium</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
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
    
    // Helper function to truncate description text
    const truncateDescription = (text) => {
      if (!text) return '';
      return text.length > 150 ? text.substring(0, 150) + '...' : text;
    };

    // Helper function to map section titles to appropriate FontAwesome icons
    const getSectionIcon = (title) => {
      const titleLower = title.toLowerCase();
      if (titleLower.includes('responsib')) return 'fa-tasks';
      if (titleLower.includes('requirement')) return 'fa-clipboard-check';
      if (titleLower.includes('qualification')) return 'fa-graduation-cap';
      if (titleLower.includes('preferred')) return 'fa-star';
      if (titleLower.includes('technical')) return 'fa-laptop-code';
      if (titleLower.includes('skill')) return 'fa-tools';
      if (titleLower.includes('benefit')) return 'fa-gift';
      if (titleLower.includes('about')) return 'fa-info-circle';
      return 'fa-list'; // Default icon
    };

    onMounted(() => {
      loadPositions();
    });

    return {
      positions,
      togglePosition,
      truncateDescription,
      getSectionIcon
    };
  }
};
</script>

<style scoped>
/* Base Layout */
.careers-page {
  min-height: 100vh;
  color: var(--cosmic-text-primary);
}

.career-section {
  padding: 6rem 0;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
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
}

.section-subtitle {
  font-size: 1.25rem;
  color: var(--cosmic-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Hero Section */
.careers-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding: 2rem;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}

.hero-content {
  flex: 1;
  max-width: 800px;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(0,0,0,0.3);
  animation: fadeInUp 1s ease-out;
}

.title-accent {
  color: var(--cosmic-blue);
  position: relative;
  display: inline-block;
  animation: glowPulse 3s infinite alternate ease-in-out;
}

.title-accent::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--cosmic-blue);
  border-radius: 2px;
  box-shadow: var(--cosmic-glow-blue-md);
}

.hero-subtitle {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.hero-cta {
  display: flex;
  gap: 1.5rem;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.hero-graphic {
  flex: 1;
  max-width: 600px;
  height: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-elements {
  width: 100%;
  height: 100%;
  position: relative;
}

.floating-element {
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: 12px;
  box-shadow: var(--cosmic-glow-blue-sm);
  backdrop-filter: blur(4px);
  animation-duration: 6s;
}

.floating-element i {
  font-size: 2rem;
  color: var(--cosmic-blue);
}

.floating-element:nth-child(1) {
  top: 20%;
  left: 20%;
}

.floating-element:nth-child(2) {
  top: 60%;
  left: 30%;
}

.floating-element:nth-child(3) {
  top: 30%;
  right: 15%;
}

.floating-element:nth-child(4) {
  bottom: 25%;
  right: 25%;
}

.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  animation: fadeInUp 1s ease-out 0.8s both;
}

.scroll-indicator i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
  animation-duration: 2s;
}

/* Culture Section */
.culture-section {
  background: linear-gradient(to bottom, transparent, rgba(15, 25, 35, 0.5));
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.culture-card {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  height: 100%;
}

.culture-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.card-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmic-glass-bg);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.card-icon i {
  font-size: 2.5rem;
  color: var(--cosmic-blue);
}

.culture-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
}

.culture-card p {
  font-size: 1.05rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
}

/* Benefits Section */
.benefits-section {
  background: linear-gradient(to bottom, rgba(15, 25, 35, 0.5), transparent);
  backdrop-filter: blur(10px);
}

.benefits-wrapper {
  display: flex;
  gap: 4rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.benefits-content {
  flex: 3;
}

.benefits-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.benefit-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.benefit-item:hover {
  background: var(--cosmic-glass-bg-lighter);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.benefit-item i {
  font-size: 2rem;
  color: var(--cosmic-blue);
  margin-top: 0.25rem;
}

.benefit-item h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-primary);
}

.benefit-item p {
  font-size: 1rem;
  color: var(--cosmic-text-secondary);
  line-height: 1.5;
}

.benefits-graphic {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.graphic-element {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.graphic-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.benefits-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes glowPulse {
  0% {
    text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
  }
  100% {
    text-shadow: 0 0 20px rgba(15, 185, 253, 0.8), 0 0 30px rgba(15, 185, 253, 0.4);
  }
}

/* Positions Section */
.positions-section {
  background: linear-gradient(to bottom, transparent, rgba(15, 25, 35, 0.5), transparent);
  padding-top: 8rem;
  padding-bottom: 8rem;
}

.positions-filter {
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-title {
  font-size: 1.1rem;
  color: var(--cosmic-text-primary);
  margin-right: 1rem;
}

.filter-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-button {
  padding: 0.5rem 1.25rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
  border-radius: 20px;
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-button:hover, .filter-button.active {
  background: var(--cosmic-glass-bg-lighter);
  color: var(--cosmic-text-primary);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.filter-button.active {
  background: rgba(15, 185, 253, 0.15);
}

.positions-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;
}

.position-card {
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.position-card.is-active {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
}

.position-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  border-bottom: var(--cosmic-glass-border);
}

.position-header:hover {
  background: var(--cosmic-glass-bg-lighter);
}

.position-header-content {
  flex: 1;
}

.position-title {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--cosmic-text-primary);
  font-weight: 600;
}

.position-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.position-location, .position-type {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-secondary);
  font-size: 0.95rem;
}

.position-location i, .position-type i {
  color: var(--cosmic-blue);
  font-size: 0.9rem;
}

.position-action {
  margin-left: 2rem;
}

.expand-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
  color: var(--cosmic-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.expand-toggle:hover, .expand-toggle.is-open {
  background: var(--cosmic-glass-bg-lighter);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-glow-blue-sm);
  border-color: var(--cosmic-blue);
}

.expand-toggle.is-open {
  transform: rotate(180deg);
}

.position-overview {
  padding: 1.5rem;
  border-bottom: var(--cosmic-glass-border);
}

.position-overview p {
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.overview-footer {
  display: flex;
  justify-content: flex-end;
}

.view-details-btn {
  font-size: 0.95rem;
  padding: 0.5rem 1.25rem;
}

.position-details {
  padding: 1.5rem;
}

.position-full-description {
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: var(--cosmic-glass-bg-darker);
  border-radius: 12px;
  border: var(--cosmic-glass-border);
}

.position-full-description p {
  color: var(--cosmic-text-secondary);
  line-height: 1.7;
}

.position-sections {
  display: grid;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.position-section {
  background: var(--cosmic-glass-bg-darker);
  border-radius: 12px;
  border: var(--cosmic-glass-border);
  overflow: hidden;
}

.position-section h4 {
  padding: 1.25rem 1.5rem;
  margin: 0;
  background: var(--cosmic-glass-bg);
  color: var(--cosmic-blue);
  font-size: 1.2rem;
  border-bottom: var(--cosmic-glass-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.position-section h4 i {
  font-size: 1rem;
}

.section-items {
  list-style: none;
  padding: 1.5rem;
  margin: 0;
  display: grid;
  gap: 1rem;
}

.section-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--cosmic-glass-bg);
  border-radius: 8px;
  border: var(--cosmic-glass-border);
  color: var(--cosmic-text-secondary);
  transition: all 0.3s ease;
}

.section-item:hover {
  background: var(--cosmic-glass-bg-lighter);
  transform: translateX(5px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.section-item i {
  color: var(--cosmic-blue);
  font-size: 1rem;
  margin-top: 0.25rem;
}

.position-apply {
  margin-top: 2rem;
  text-align: center;
  padding-top: 2rem;
  border-top: var(--cosmic-glass-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.apply-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--cosmic-text-tertiary);
  font-size: 0.95rem;
}

.apply-note i {
  color: var(--cosmic-blue);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--cosmic-blue);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--cosmic-text-primary);
}

.empty-state p {
  color: var(--cosmic-text-secondary);
  max-width: 600px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

/* Process Section */
.process-section {
  padding-top: 8rem;
  padding-bottom: 8rem;
}

.process-timeline {
  max-width: 900px;
  margin: 0 auto 4rem;
  position: relative;
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
    rgba(15, 185, 253, 0.5),
    rgba(15, 185, 253, 0.1)
  );
  z-index: 0;
}

.timeline-item {
  display: flex;
  margin-bottom: 2.5rem;
  position: relative;
}

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
}

.timeline-content {
  flex: 1;
  padding: 2rem;
  position: relative;
}

.timeline-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
}

.timeline-content p {
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
}

.timeline-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: 12px;
  transform: translate(30%, -30%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.process-summary {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
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
}

.summary-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--cosmic-text-primary);
}

.summary-content p {
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
}

/* Mobile Styles for Positions and Process Sections */
@media (max-width: 768px) {
  .position-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .position-action {
    margin-left: 0;
    align-self: flex-end;
  }

  .position-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

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
    transform: translateX(-50%);
  }

  .process-summary {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }

  .summary-icon {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .filter-buttons {
    flex-direction: column;
    width: 100%;
  }

  .filter-button {
    width: 100%;
    text-align: center;
  }

  .position-title {
    font-size: 1.25rem;
  }

  .view-details-btn {
    width: 100%;
  }
}

/* Join Section */
.join-section {
  padding-top: 4rem;
  padding-bottom: 8rem;
  position: relative;
  overflow: hidden;
}

.join-container {
  display: flex;
  border: var(--cosmic-glass-border-blue);
  overflow: hidden;
  position: relative;
  margin-bottom: 4rem;
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
}

.join-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--cosmic-text-secondary);
  margin-bottom: 2.5rem;
}

.join-actions {
  display: flex;
  gap: 1rem;
}

.join-graphic {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.floating-astronaut {
  position: absolute;
  width: 300px;
  height: 300px;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  animation: float 6s ease-in-out infinite;
}

.astronaut-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: rotate(15deg);
  position: relative;
  z-index: 2;
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
  animation: pulse 4s ease-in-out infinite alternate;
  z-index: 1;
}

.community-links {
  text-align: center;
  padding-top: 2rem;
}

.community-links h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--cosmic-text-primary);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  transition: all 0.3s ease;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
}

.social-link:hover {
  transform: translateY(-5px);
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.social-link i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
}

.social-link span {
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

/* Enhanced Mobile Styles */
@media (max-width: 1024px) {
  .culture-grid, .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
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
}

@media (max-width: 768px) {
  .hero-container {
    flex-direction: column;
    gap: 2rem;
  }
  
  .hero-graphic {
    order: -1;
    height: 300px;
  }
  
  .hero-content {
    text-align: center;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .floating-elements {
    opacity: 0.5;
  }
  
  .culture-grid, .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .position-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .position-action {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .position-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
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
    transform: translateX(-50%);
  }
  
  .process-summary {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
  
  .summary-icon {
    margin-bottom: 1rem;
  }
  
  .join-title {
    font-size: 2rem;
  }
  
  .join-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .social-links {
    gap: 1rem;
  }
  
  .social-link {
    width: calc(50% - 0.5rem);
    justify-content: center;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-cta {
    flex-direction: column;
    width: 100%;
  }
  
  .hero-cta .cosmic-btn {
    width: 100%;
  }
  
  .filter-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-button {
    width: 100%;
    text-align: center;
  }
  
  .position-title {
    font-size: 1.25rem;
  }
  
  .view-details-btn {
    width: 100%;
  }
  
  .join-content {
    padding: 1.5rem;
  }
  
  .social-links {
    flex-direction: column;
  }
  
  .social-link {
    width: 100%;
  }
}

/* Animations */
@keyframes float {
  0% {
    transform: translateY(-50%) translateX(0);
  }
  50% {
    transform: translateY(-50%) translateX(-15px) translateY(-15px);
  }
  100% {
    transform: translateY(-50%) translateX(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.8);
  }
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.2);
  }
}
</style>