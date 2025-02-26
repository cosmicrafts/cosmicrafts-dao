<template>
  <section class="privacy-section">
    <div class="privacy-container">
      <h1 class="animated-title">Privacy Policy</h1>
      
      <!-- Hero Section -->
      <div class="hero-section content-box">
        <div class="stars"></div>
        <div class="content">
          <p class="lead-text">
            At Cosmicrafts, we take your privacy seriously. This policy outlines how we collect, 
            use, and protect your personal information.
          </p>
        </div>
      </div>

      <!-- Policy Sections -->
      <div class="policy-grid">
        <div class="policy-card">
          <img src="@/assets/icons/DAO-1.svg" alt="Data Collection" class="policy-icon" />
          <h2>Data Collection</h2>
          <p>We collect information necessary to provide our gaming services, including:</p>
          <ul>
            <li>Account information</li>
            <li>Game progress and statistics</li>
            <li>Technical data for service improvement</li>
            <li>Communication preferences</li>
          </ul>
        </div>

        <div class="policy-card">
          <img src="@/assets/icons/DAO-1.svg" alt="Data Usage" class="policy-icon" />
          <h2>How We Use Your Data</h2>
          <p>Your data helps us:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Protect against fraud and abuse</li>
            <li>Communicate important updates</li>
            <li>Enhance your gaming experience</li>
          </ul>
        </div>

        <div class="policy-card">
          <img src="@/assets/icons/DAO-1.svg" alt="Data Protection" class="policy-icon" />
          <h2>Data Protection</h2>
          <p>We implement strong security measures to protect your data:</p>
          <ul>
            <li>End-to-end encryption</li>
            <li>Regular security audits</li>
            <li>Secure data storage</li>
            <li>Access controls</li>
          </ul>
        </div>

        <div class="policy-card">
          <img src="@/assets/icons/DAO-1.svg" alt="Your Rights" class="policy-icon" />
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your data</li>
            <li>Request data deletion</li>
            <li>Opt-out of communications</li>
            <li>Update your preferences</li>
          </ul>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="contact-section content-box">
        <h2>Questions About Privacy?</h2>
        <p>Contact our Data Protection Officer at privacy@cosmicrafts.com</p>
        <router-link to="/support" class="contact-button">Contact Support</router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<style scoped>
/* I'm referencing your About.vue styles for consistency */
.privacy-section {
  padding: 2rem;
  color: #e2e8f0;
  background: linear-gradient(180deg, #0a0e27, #1a1f4b);
}

.policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.policy-card {
  background: rgba(12, 15, 37, 0.8);
  padding: 2rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.policy-icon {
  width: 64px;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 8px rgba(255, 0, 195, 0.3));
}

.policy-card h2 {
  color: #00e1ff;
  margin-bottom: 1rem;
}

.policy-card ul {
  list-style-type: none;
  padding: 0;
}

.policy-card li {
  margin: 0.5rem 0;
  color: #cbd5e0;
}

.contact-section {
  text-align: center;
  padding: 4rem 2rem;
  margin-top: 2rem;
}

.contact-button {
  display: inline-block;
  background: linear-gradient(45deg, #7000ff, #ff00c3);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 2rem;
  transition: transform 0.3s ease;
}

.contact-button:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .policy-grid {
    grid-template-columns: 1fr;
  }
}
</style> 