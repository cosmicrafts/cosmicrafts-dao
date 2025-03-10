<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="about-container">


      <!-- Mission Section -->
      <div class="cosmic-card mission-section">
        <div class="section-header">
          <i class="fas fa-rocket"></i>
          <h2 class="section-title">Our Mission</h2>
        </div>
        
        <div class="mission-content">
          <div class="mission-text">
            <p>At Cosmicrafts, we're pioneering a new frontier in space gaming by integrating blockchain technology, immersive storytelling, and community governance.</p>
            
            <p>Our vision is to create a metaverse where players not only explore the cosmos but also shape its development through our decentralized autonomous organization (DAO).</p>
            
            <p>Through innovative game mechanics and cutting-edge technology, we're building experiences that inspire collaboration, strategy, and a genuine sense of ownership in our digital universe.</p>
          </div>
          
          <div class="mission-image">
            <img src="@/assets/icons/DAO-1.svg" alt="Cosmicrafts Mission" />
          </div>
        </div>
      </div>

      <!-- Team Section -->
      <div class="cosmic-card team-section">
        <div class="section-header">
          <i class="fas fa-users"></i>
          <h2 class="section-title">Meet the Team</h2>
        </div>
        
        <div class="team-grid">
          <div class="team-member">
            <div class="team-member-avatar">
              <img src="@/assets/icons/DAO-1.svg" alt="Alex Stellar" />
              <div class="team-member-glow"></div>
            </div>
            <h3>Alex Stellar</h3>
            <p class="team-role">Founder & CEO</p>
            <p class="team-bio">Visionary space enthusiast with over 10 years in game development and blockchain technology.</p>
          </div>
          
          <div class="team-member">
            <div class="team-member-avatar">
              <img src="@/assets/icons/DAO-1.svg" alt="Luna Orbit" />
              <div class="team-member-glow"></div>
            </div>
            <h3>Luna Orbit</h3>
            <p class="team-role">Lead Game Designer</p>
            <p class="team-bio">Award-winning designer specializing in strategy games and player-driven economics.</p>
          </div>
          
          <div class="team-member">
            <div class="team-member-avatar">
              <img src="@/assets/icons/DAO-1.svg" alt="Orion Nebula" />
              <div class="team-member-glow"></div>
            </div>
            <h3>Orion Nebula</h3>
            <p class="team-role">Blockchain Architect</p>
            <p class="team-bio">DeFi innovator with expertise in Internet Computer, Ethereum, and cross-chain solutions.</p>
          </div>
          
          <div class="team-member">
            <div class="team-member-avatar">
              <img src="@/assets/icons/DAO-1.svg" alt="Nova Comet" />
              <div class="team-member-glow"></div>
            </div>
            <h3>Nova Comet</h3>
            <p class="team-role">Community Manager</p>
            <p class="team-bio">Community builder passionate about creating inclusive, engaged player communities.</p>
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="cosmic-card values-section">
        <div class="section-header">
          <i class="fas fa-star"></i>
          <h2 class="section-title">Our Core Values</h2>
        </div>
        
        <div class="values-grid">
          <div class="value-card">
            <div class="value-icon">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h3>Innovation</h3>
            <p>We constantly push the boundaries of what's possible in gaming, combining cutting-edge technology with creative game design.</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">
              <i class="fas fa-users"></i>
            </div>
            <h3>Community</h3>
            <p>Our players are co-creators and stakeholders, empowered through our DAO to participate in governance and decision-making.</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">
              <i class="fas fa-clipboard-check"></i>
            </div>
            <h3>Transparency</h3>
            <p>We believe in open development, clear communication, and building trust with our community through honesty and accessibility.</p>
          </div>
          
          <div class="value-card">
            <div class="value-icon">
              <i class="fas fa-leaf"></i>
            </div>
            <h3>Sustainability</h3>
            <p>We're committed to energy-efficient blockchain solutions and creating a long-term, sustainable ecosystem for our games and players.</p>
          </div>
        </div>
      </div>

      <!-- Resources & Community Section -->
      <div class="cosmic-card resources-section">
        <div class="section-header">
          <i class="fas fa-globe"></i>
          <h2 class="section-title">Resources & Community</h2>
        </div>

        <div class="resources-grid">
          <!-- Quick Access Resources -->
          <div class="resource-block">
            <h3>Quick Access</h3>
            <div class="resource-cards">
              <div class="resource-card">
                <i class="fas fa-robot"></i>
                <h4>AI Assistant</h4>
                <p>Press 'A' in-game for instant help</p>
              </div>
              <div class="resource-card">
                <i class="fas fa-book"></i>
                <h4>Documentation</h4>
                <p>Comprehensive guides and technical details</p>
              </div>
              <div class="resource-card">
                <i class="fab fa-github"></i>
                <h4>GitHub</h4>
                <p>View our open-source code and contribute</p>
              </div>
              <div class="resource-card">
                <i class="fas fa-chart-line"></i>
                <h4>Dashboard</h4>
                <p>Monitor your assets and DAO participation</p>
              </div>
            </div>
          </div>

          <!-- Community Channels -->
          <div class="community-block">
            <h3>Community Channels</h3>
            <div class="channel-grid">
              <a href="https://discord.gg/cosmicrafts" class="channel-card discord">
                <i class="fab fa-discord"></i>
                <span>Discord</span>
              </a>
              <a href="https://twitter.com/CosmicraftsDAO" class="channel-card twitter">
                <i class="fab fa-twitter"></i>
                <span>Twitter</span>
              </a>
              <a href="https://t.me/cosmicrafts" class="channel-card telegram">
                <i class="fab fa-telegram"></i>
                <span>Telegram</span>
              </a>
              <a href="https://forum.cosmicrafts.com" class="channel-card forum">
                <i class="fas fa-comments"></i>
                <span>Forum</span>
              </a>
            </div>
          </div>

          <!-- AI Assistant Features -->
          <div class="ai-assistant-block">
            <h3>AI Assistant Features</h3>
            <div class="features-list">
              <div class="feature-item">
                <i class="fas fa-gamepad"></i>
                <span>Game mechanics and strategies</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-coins"></i>
                <span>Token and NFT information</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-headset"></i>
                <span>Technical support</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-globe"></i>
                <span>Real-time translations</span>
              </div>
            </div>
          </div>

          <!-- International Communities -->
          <div class="international-block">
            <h3>International Communities</h3>
            <div class="language-grid">
              <div class="language-tag">English</div>
              <div class="language-tag">Spanish</div>
              <div class="language-tag">Chinese</div>
              <div class="language-tag">Japanese</div>
              <div class="language-tag">Korean</div>
              <div class="language-tag">Russian</div>
              <div class="language-tag">French</div>
              <div class="language-tag">German</div>
              <div class="language-tag">Portuguese</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Join Us Section -->
      <div class="cosmic-card join-section">
        <div class="join-content">
          <h2 class="join-title">Join Our Cosmic Journey</h2>
          <p class="join-text">Whether you're a player, creator, or investor, there's a place for you in our growing universe.</p>
          
          <div class="join-buttons">
            <router-link to="/game" class="cosmic-button primary">
              <i class="fas fa-gamepad"></i>
              <span>Play the Game</span>
            </router-link>
            
            <router-link to="/dao" class="cosmic-button secondary">
              <i class="fas fa-project-diagram"></i>
              <span>Join the DAO</span>
            </router-link>
            
            <router-link to="/careers" class="cosmic-button outline">
              <i class="fas fa-briefcase"></i>
              <span>Careers</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Nothing needed here - keeping it clean
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Hero Section Styling */
.hero-section {
  height: 60vh;
  min-height: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 4rem;
  border-radius: var(--radius-large);
}

.cosmic-glow-orb {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(15, 185, 253, 0.2) 0%, transparent 70%);
  animation: pulse 8s infinite alternate ease-in-out;
  z-index: 0;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.3; }
  100% { transform: scale(1.2); opacity: 0.5; }
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: #fff;
  border-radius: 50%;
  animation: twinkle 4s infinite ease-in-out;
}

.star-1 {
  top: 15%;
  left: 10%;
  width: 3px;
  height: 3px;
  animation-delay: 0s;
}

.star-2 {
  top: 25%;
  left: 30%;
  width: 2px;
  height: 2px;
  animation-delay: 0.5s;
}

.star-3 {
  top: 10%;
  left: 70%;
  width: 4px;
  height: 4px;
  animation-delay: 1s;
}

.star-4 {
  top: 40%;
  left: 85%;
  width: 2px;
  height: 2px;
  animation-delay: 1.5s;
}

.star-5 {
  top: 60%;
  left: 45%;
  width: 3px;
  height: 3px;
  animation-delay: 2s;
}

.star-6 {
  top: 75%;
  left: 15%;
  width: 2px;
  height: 2px;
  animation-delay: 2.5s;
}

.star-7 {
  top: 80%;
  left: 60%;
  width: 4px;
  height: 4px;
  animation-delay: 3s;
}

.star-8 {
  top: 35%;
  left: 5%;
  width: 3px;
  height: 3px;
  animation-delay: 3.5s;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); box-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  padding: 3rem;
  background: rgba(13, 25, 42, 0.7);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-large);
  border: var(--border-thin);
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-logo {
  width: 120px;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.6));
  animation: float 6s infinite ease-in-out;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: var(--weight-black);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  font-weight: var(--weight-regular);
}

/* Section Common Styling */
.cosmic-card {
  background: linear-gradient(to right, rgba(15, 185, 253, 0.05), rgba(15, 185, 253, 0.02));
  border-radius: var(--radius-large);
  padding: 3rem;
  margin-bottom: 4rem;
  border: var(--border-thin);
  position: relative;
  overflow: hidden;
}

.cosmic-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 40%;
  background: linear-gradient(to left, rgba(15, 185, 253, 0.03), transparent);
  z-index: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}

.section-header i {
  font-size: 1.5rem;
  color: var(--color-primary);
  background: rgba(15, 185, 253, 0.1);
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
}

.section-title {
  font-size: 2.25rem;
  font-weight: var(--weight-bold);
  color: var(--color-title-primary);
  margin: 0;
}

/* Mission Section Styling */
.mission-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.mission-text p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.mission-text p:last-child {
  margin-bottom: 0;
}

.mission-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mission-image img {
  width: 100%;
  max-width: 200px;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.4));
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Team Section Styling */
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.team-member {
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--radius-medium);
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.team-member::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.05) 0%, rgba(255, 145, 0, 0.05) 100%);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.5s ease;
}

.team-member:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(15, 185, 253, 0.15);
  background: rgba(15, 185, 253, 0.08);
}

.team-member:hover::before {
  opacity: 1;
}

.team-member-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
}

.team-member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 2px solid rgba(15, 185, 253, 0.3);
  transition: transform 0.5s ease, border 0.3s ease;
}

.team-member:hover .team-member-avatar img {
  transform: scale(1.05);
  border: 2px solid rgba(15, 185, 253, 0.8);
}

.team-member-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(15, 185, 253, 0.3) 0%, transparent 70%);
  z-index: 1;
  animation: glowPulse 3s infinite alternate ease-in-out;
}

@keyframes glowPulse {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.2); }
}

.team-member h3 {
  font-size: 1.3rem;
  color: var(--color-primary);
  margin: 0 0 0.5rem;
  font-weight: var(--weight-bold);
  transition: color 0.3s ease;
}

.team-member:hover h3 {
  color: #FFFFFF;
}

.team-role {
  font-size: 0.9rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: var(--weight-medium);
}

.team-bio {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* Values Section Styling */
.values-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.value-card {
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--radius-medium);
  padding: 2rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(15, 185, 253, 0.1);
  background: rgba(15, 185, 253, 0.08);
}

.value-icon {
  margin-bottom: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.2), rgba(255, 145, 0, 0.2));
  border-radius: 50%;
}

.value-icon i {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.value-card h3 {
  font-size: 1.3rem;
  color: var(--color-primary);
  margin: 0 0 1rem;
  font-weight: var(--weight-bold);
}

.value-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* Resources Section Styling */
.resources-grid {
  display: grid;
  gap: 3rem;
}

.resource-block h3,
.community-block h3,
.ai-assistant-block h3,
.international-block h3 {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

/* Resource Cards */
.resource-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.resource-card {
  background: rgba(15, 185, 253, 0.05);
  padding: 1.5rem;
  border-radius: var(--radius-medium);
  text-align: center;
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
  background: rgba(15, 185, 253, 0.1);
}

.resource-card i {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.resource-card h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.resource-card p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

/* Community Channels */
.channel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.channel-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: var(--radius-medium);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
}

.channel-card i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.channel-card.discord {
  background: rgba(114, 137, 218, 0.1);
}

.channel-card.twitter {
  background: rgba(29, 161, 242, 0.1);
}

.channel-card.telegram {
  background: rgba(0, 136, 204, 0.1);
}

.channel-card.forum {
  background: rgba(255, 145, 0, 0.1);
}

.channel-card:hover {
  transform: translateY(-5px);
  background: rgba(15, 185, 253, 0.2);
}

/* AI Assistant Features */
.features-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--radius-medium);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateX(5px);
}

.feature-item i {
  color: var(--color-primary);
}

/* International Communities */
.language-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.language-tag {
  padding: 0.5rem 1rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: var(--radius-circle);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.language-tag:hover {
  background: rgba(15, 185, 253, 0.2);
  transform: translateY(-2px);
}

/* Join Section Styling */
.join-section {
  background: linear-gradient(to right, rgba(15, 185, 253, 0.1), rgba(15, 185, 253, 0.05));
  text-align: center;
}

.join-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.join-title {
  font-size: 2.5rem;
  font-weight: var(--weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 1.5rem;
}

.join-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
}

.join-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cosmic-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-circle);
  font-weight: var(--weight-bold);
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cosmic-button i {
  font-size: 1.1rem;
}

.cosmic-button.primary {
  background: var(--gradient-button);
  color: var(--color-text-primary);
  border: none;
}

.cosmic-button.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(15, 185, 253, 0.2);
}

.cosmic-button.secondary {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(15, 185, 253, 0.2);
}

.cosmic-button.secondary:hover {
  background: rgba(15, 185, 253, 0.2);
  transform: translateY(-3px);
}

.cosmic-button.outline {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cosmic-button.outline:hover {
  border-color: var(--color-primary);
  background: rgba(15, 185, 253, 0.05);
  transform: translateY(-3px);
}

/* Responsive Styling */
@media (max-width: 1200px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .mission-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .mission-image {
    order: -1;
  }
  
  .mission-image img {
    max-width: 150px;
  }
  
  .values-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }
  
  .hero-section {
    height: auto;
    min-height: 400px;
    margin-bottom: 3rem;
  }
  
  .hero-content {
    padding: 2rem 1.5rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .cosmic-card {
    padding: 2rem 1.5rem;
    margin-bottom: 3rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .join-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cosmic-button {
    width: 100%;
    justify-content: center;
  }
}
</style>