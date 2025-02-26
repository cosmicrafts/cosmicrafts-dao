<template>
    <section class="careers-section">
      <div class="careers-container">
        <h1 class="animated-title">Join the Cosmicrafts Crew</h1>
        <div class="content-box">
          <div class="stars"></div>
          <div class="content">
            <p class="lead-text">
              🚀 Ready to launch your career into the stratosphere? We're seeking stellar talent to help shape the future of space gaming!
            </p>

            <CareersPositions />

            <div class="cta-card">
              <p class="instruction-text">
                If you believe you can contribute to Cosmicrafts in a professional capacity,<br>
                send us your resume along with your <strong>cover letter</strong> explaining<br>
                why you're the perfect fit for our crew.
              </p>
              <a 
                href="mailto:careers@cosmicrafts.com" 
                class="email-button"
              >
                ✨ Beam to Careers ✨
              </a>
            </div>
            <p class="subtext">
              We're excited to review applications for all positions - from game developers to<br>
              concept artists, community managers to blockchain wizards!
            </p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
<script>
import CareersPositions from '@/components/CareersPositions.vue';

export default {
  name: 'CareersPage',
  components: {
    CareersPositions
  },
  mounted() {
    window.scrollTo(0, 0);
  }
}
</script>
  
  <style scoped>
  .careers-section {
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    position: relative;
  }
  
  .careers-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 2rem;
    position: relative;
    z-index: 2;
  }
  
  .animated-title {
    text-align: center;
    font-size: 3.5rem;
    margin-bottom: 2rem;
    background: linear-gradient(90deg, #00e1ff, #ff01d5);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: title-glow .5s ease-in-out infinite alternate;
  }
  
  .content-box {
    background: rgba(12, 15, 37, 0.8);
    border-radius: 20px;
    padding: 3rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }
  
  .lead-text {
    font-size: 1.25rem;
    text-align: center;
    margin-bottom: 3rem;
    line-height: 1.6;
  }
  
  .cta-card {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    padding: 2.5rem;
    margin: 2rem 0;
    position: relative;
    text-align: center;
  }
  
  .instruction-text {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.8;
  }
  
  .email-button {
    display: inline-block;
    background: linear-gradient(45deg, #7000ff, #ff00c3);
    color: white;
    padding: 1rem 2.5rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin: 1rem 0;
  }
  
  .email-button:hover {
    transform: translateY(-2px);
    background: linear-gradient(45deg, #8427ff, #ff36d0);

    box-shadow: 0 10px 20px rgba(255, 0, 195, 0.3);
  }
  
  .subtext {
    text-align: center;
    color: #a0a0ff;
    margin-top: 2rem;
    line-height: 1.6;
  }
  
  /* Animations */
  @keyframes title-glow {
    from {
      text-shadow: 0 0 5px rgba(0, 225, 255, 0.451);
      
    }
    to {
      text-shadow: 0 0 5px rgba(255, 0, 195, 0.291)
    }
  }
  
  /* Stars background animation */
  .stars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    animation: stars 50s linear infinite;
  }
  
  @keyframes stars {
    from { background-position: 0 0; }
    to { background-position: 1000px 1000px; }
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .careers-container {
      padding: 2rem 1rem;
    }
  
    .animated-title {
      font-size: 2.5rem;
    }
  
    .content-box {
      padding: 1.5rem;
    }
  
    .lead-text {
      font-size: 1rem;
    }
  
    .cta-card {
      padding: 1.5rem;
    }
  
    .instruction-text {
      font-size: 1rem;
    }
  
  }
  </style>