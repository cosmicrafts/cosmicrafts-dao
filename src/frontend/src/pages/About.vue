<template>
    <section class="about-section">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-content">
          <img src="@/assets/icons/DAO-1.svg" alt="Cosmicrafts Logo" class="hero-logo" />
          <h1 class="hero-title">About Cosmicrafts</h1>
          <p class="hero-subtitle">
            Crafting the future of space gaming, one star at a time.
          </p>
        </div>
      </div>
  
      <!-- Mission Section -->
      <div class="mission-section">
        <div class="mission-content">
          <h2 class="section-title">Our Mission</h2>
          <p class="section-text">
            At Cosmicrafts, we're on a mission to revolutionize space gaming by combining cutting-edge technology, immersive storytelling, and a passionate community. We believe in creating games that inspire exploration, strategy, and collaboration across the cosmos.
          </p>
        </div>
        <div class="mission-image">
          <img src="@/assets/icons/DAO-1.svg" alt="Cosmicrafts Mission" class="mission-icon" />
        </div>
      </div>
  
      <!-- Team Section -->
      <div class="team-section">
        <h2 class="section-title">Meet the Team</h2>
        <div class="team-grid">
          <div class="team-member">
            <img src="@/assets/icons/DAO-1.svg" alt="Team Member 1" class="team-icon" />
            <h3>Alex Stellar</h3>
            <p>Founder & CEO</p>
          </div>
          <div class="team-member">
            <img src="@/assets/icons/DAO-1.svg" alt="Team Member 2" class="team-icon" />
            <h3>Luna Orbit</h3>
            <p>Lead Game Designer</p>
          </div>
          <div class="team-member">
            <img src="@/assets/icons/DAO-1.svg" alt="Team Member 3" class="team-icon" />
            <h3>Orion Nebula</h3>
            <p>Blockchain Architect</p>
          </div>
          <div class="team-member">
            <img src="@/assets/icons/DAO-1.svg" alt="Team Member 4" class="team-icon" />
            <h3>Nova Comet</h3>
            <p>Community Manager</p>
          </div>
        </div>
      </div>
  
      <!-- Values Section -->
      <div class="values-section">
        <h2 class="section-title">Our Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <img src="@/assets/icons/DAO-1.svg" alt="Innovation" class="value-icon" />
            <h3>Innovation</h3>
            <p>We push the boundaries of gaming technology to create unique experiences.</p>
          </div>
          <div class="value-card">
            <img src="@/assets/icons/DAO-1.svg" alt="Community" class="value-icon" />
            <h3>Community</h3>
            <p>Our players are at the heart of everything we do.</p>
          </div>
          <div class="value-card">
            <img src="@/assets/icons/DAO-1.svg" alt="Transparency" class="value-icon" />
            <h3>Transparency</h3>
            <p>We believe in open communication and trust with our community.</p>
          </div>
          <div class="value-card">
            <img src="@/assets/icons/DAO-1.svg" alt="Sustainability" class="value-icon" />
            <h3>Sustainability</h3>
            <p>We're committed to eco-friendly practices in game development.</p>
          </div>
        </div>
      </div>
  
      <!-- Call to Action -->
      <div class="cta-section">
        <img src="@/assets/icons/DAO-1.svg" alt="Join Us" class="cta-icon" />
        <h2 class="cta-title">Join the Cosmicrafts Universe</h2>
        <p class="cta-text">
          Whether you're a player, creator, or space enthusiast, there's a place for you in our community.
        </p>
        <router-link to="/careers" class="cta-button">Explore Careers</router-link>
      </div>
    </section>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { scrollToTop } from '@/utils/scroll';
  
  // Force scroll to top on mount
  onMounted(() => {
    scrollToTop();
  });
  </script>
  
  <style scoped>
  .about-section {
    padding: 2rem;
    color: #e2e8f0;
    background: linear-gradient(180deg, #0a0e27, #1a1f4b);
  }
  
  /* Hero Section */
  .hero {
    background: linear-gradient(rgba(10, 14, 39, 0.8), rgba(26, 31, 75, 0.8));
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 1rem;
    margin-bottom: 2rem;
  }
  
  .hero-logo {
    width: 120px;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 10px rgba(0, 225, 255, 0.5));
  }
  
  .mission-icon {
    width: 200px;
    filter: drop-shadow(0 0 15px rgba(112, 0, 255, 0.3));
  }
  
  .value-icon {
    width: 64px;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 8px rgba(255, 0, 195, 0.3));
  }
  
  .team-icon {
    width: 120px;
    border-radius: 50%;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 10px rgba(0, 225, 255, 0.3));
  }
  
  .cta-icon {
    width: 80px;
    margin-bottom: 2rem;
    filter: drop-shadow(0 0 12px rgba(112, 0, 255, 0.4));
  }
  
  .hero-content {
    background: rgba(12, 15, 37, 0.8);
    padding: 2rem;
    border-radius: 1rem;
    backdrop-filter: blur(10px);
  }
  
  .hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #00e1ff, #ff00ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: #a0a0ff;
  }
  
  /* Mission Section */
  .mission-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 4rem;
  }
  
  .mission-content {
    flex: 1;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #00e1ff;
  }
  
  .section-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #cbd5e0;
  }
  
  /* Team Section */
  .team-section {
    margin-bottom: 4rem;
  }
  
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .team-member {
    text-align: center;
  }
  
  .team-member h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .team-member p {
    color: #a0a0ff;
  }
  
  /* Values Section */
  .values-section {
    margin-bottom: 4rem;
  }
  
  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .value-card {
    text-align: center;
    padding: 1.5rem;
    background: rgba(12, 15, 37, 0.8);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
  }
  
  .value-card h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
  
  .value-card p {
    color: #cbd5e0;
  }
  
  /* CTA Section */
  .cta-section {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(12, 15, 37, 0.8);
    border-radius: 1rem;
    backdrop-filter: blur(10px);
  }
  
  .cta-title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #00e1ff;
  }
  
  .cta-text {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    color: #cbd5e0;
  }
  
  .cta-button {
    display: inline-block;
    background: linear-gradient(45deg, #7000ff, #ff00c3);
    color: white;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    transition: transform 0.3s ease;
  }
  
  .cta-button:hover {
    transform: scale(1.05);
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }
  
    .hero-subtitle {
      font-size: 1rem;
    }
  
    .mission-section {
      flex-direction: column;
    }
  
    .section-title {
      font-size: 1.75rem;
    }
  
    .team-grid,
    .values-grid {
      grid-template-columns: 1fr;
    }
  
    .cta-title {
      font-size: 1.5rem;
    }
  
    .cta-text {
      font-size: 1rem;
    }
  }
  </style>