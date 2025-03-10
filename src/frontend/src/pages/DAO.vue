<template>
  <div class="dao-page">
    <!-- Headline Section -->
    <section class="headline" :style="{ backgroundPositionY: `${scrollY * -0.15}px` }">
      <!-- Background Canvas for Stars -->
      <canvas id="starfield" ref="starfield" class="noise-canvas" :style="{ top: `${scrollY * 0.5}px` }"></canvas>

      <!-- Content Wrapper -->
      <div class="content">
        <div>
          <!-- DAO Hero Logo -->
          <img :src="dynamicHeroLogo" alt="DAO Logo" class="hero-logo"
            :style="{ transform: `translateY(${scrollY * 0.075}px) scale(${1.1 - scrollY * 0.00155})` }" />
        </div>
        <div>
          <!-- Hero Image -->
          <img src="@/assets/icons/DAO-1.svg" alt="DAO Illustration" class="dao-image"
            :style="{ transform: `translateY(${scrollY * -0.065}px) scale(${1 - scrollY * 0.000825})` }" />
        </div>
        <!-- Headline Titles -->
        <h1 class="primary-headline"
          :style="{ transform: `translateY(${scrollY * -0.065}px) scale(${1 - scrollY * 0.000425})` }">
          The dawn of a legacy
        </h1>

        <p class="cta-subtext"
          :style="{ transform: `translateY(${scrollY * -0.005}px) scale(${1 - scrollY * -0.001225})` }">
          It's DAO or NEVER!
        </p>
        <!-- Call-to-Action Buttons Container -->
        <div class="cta-buttons-container">
          <a href="https://nns.ic0.app" target="_blank" class="cta-button">
            <i class="fas fa-rocket"></i>
            Become a Stakeholder
          </a>
          <router-link to="/whitepaper" class="cta-button whitepaper-btn">
            <i class="fas fa-book"></i>
            Read Whitepaper
          </router-link>
        </div>
      </div>
    </section>

    <!-- Distribution Section -->
    <section class="distribution-section">
      <h2 class="section-title text-gradient">Token Distribution</h2>
      <div class="distribution-grid">
        <div class="distribution-card cosmic-card">
          <div class="distribution-icon treasury">
            <i class="fas fa-vault"></i>
          </div>
          <div class="distribution-content">
            <h3>Treasury</h3>
            <p class="percentage">76%</p>
            <p class="amount">760M SPIRAL</p>
            <p class="description">Ecosystem growth and DAO-controlled funds</p>
          </div>
        </div>

        <div class="distribution-card cosmic-card">
          <div class="distribution-icon swap">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="distribution-content">
            <h3>SNS Swap</h3>
            <p class="percentage">12%</p>
            <p class="amount">120M SPIRAL</p>
            <p class="description">Public sale with 8 quarterly releases</p>
          </div>
        </div>

        <div class="distribution-card cosmic-card">
          <div class="distribution-icon team">
            <i class="fas fa-users-cog"></i>
          </div>
          <div class="distribution-content">
            <h3>Developer Team</h3>
            <p class="percentage">8%</p>
            <p class="amount">80M SPIRAL</p>
            <p class="description">8-year vesting for core team</p>
          </div>
        </div>

        <div class="distribution-card cosmic-card">
          <div class="distribution-icon investors">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="distribution-content">
            <h3>Seed Investors</h3>
            <p class="percentage">4%</p>
            <p class="amount">40M SPIRAL</p>
            <p class="description">Early backers with varied vesting</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Governance Section -->
    <section class="governance-section">
      <h2 class="section-title text-gradient">Governance Model</h2>
      <div class="governance-grid">
        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-gavel"></i>
          </div>
          <div class="governance-content">
            <h3>Proposal Creation</h3>
            <p class="requirement">1,000 SPIRAL</p>
            <p class="description">Minimum stake required to submit proposals</p>
          </div>
        </div>

        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="governance-content">
            <h3>Voting Period</h3>
            <p class="requirement">7 Days</p>
            <p class="description">Standard deliberation time for proposals</p>
          </div>
        </div>

        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="governance-content">
            <h3>Voting Power</h3>
            <p class="requirement">Up to 3x</p>
            <p class="description">Maximum multiplier through staking and age</p>
          </div>
        </div>

        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-lock-clock"></i>
          </div>
          <div class="governance-content">
            <h3>Lock Period</h3>
            <p class="requirement">30d - 8y</p>
            <p class="description">Flexible dissolve delay options</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Overview Section -->
    <section class="stats-overview cosmic-card">
      <h2 class="section-title text-gradient">Token Metrics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-coins"></i>
          </div>
          <div class="stat-content">
            <h3>1B</h3>
            <p>Total Supply</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-lock"></i>
          </div>
          <div class="stat-content">
            <h3>760M</h3>
            <p>Treasury Size</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-gavel"></i>
          </div>
          <div class="stat-content">
            <h3>1,000</h3>
            <p>Min. Proposal Stake</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-percent"></i>
          </div>
          <div class="stat-content">
            <h3>8%</h3>
            <p>Initial APY</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Staking Benefits -->
    <section class="staking-section cosmic-card">
      <h2 class="section-title text-gradient">Staking Benefits</h2>
      
      <div class="staking-content">
        <div class="staking-info">
          <h3>Earn Through Participation</h3>
          <p>Lock your SPIRAL tokens to earn rewards and increase your governance power</p>
          
          <div class="benefits-grid">
            <div class="benefit-item">
              <div class="benefit-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="benefit-content">
                <h4>Initial APY</h4>
                <p class="value">8%</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <i class="fas fa-hourglass-half"></i>
              </div>
              <div class="benefit-content">
                <h4>Transition Period</h4>
                <p class="value">8 Years</p>
              </div>
            </div>
            
            <div class="benefit-item">
              <div class="benefit-icon">
                <i class="fas fa-chart-pie"></i>
              </div>
              <div class="benefit-content">
                <h4>Final APY</h4>
                <p class="value">1%</p>
              </div>
            </div>
          </div>
        </div>

        <div class="power-multipliers">
          <h3>Power Multipliers</h3>
          <div class="multiplier-grid">
            <div class="multiplier-card">
              <div class="multiplier-header">
                <i class="fas fa-lock"></i>
                <h4>Dissolve Delay</h4>
              </div>
              <div class="multiplier-content">
                <p class="bonus">+100%</p>
                <p class="time">8 years</p>
              </div>
            </div>

            <div class="multiplier-card">
              <div class="multiplier-header">
                <i class="fas fa-history"></i>
                <h4>Neuron Age</h4>
              </div>
              <div class="multiplier-content">
                <p class="bonus">+100%</p>
                <p class="time">365 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stakeholder Rights Section -->
    <section class="stakeholder-section">
      <h2 class="section-title text-gradient">Stakeholder Rights</h2>
      
      <div class="rights-grid">
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-landmark"></i>
          </div>
          <div class="rights-content">
            <h3>Treasury Management</h3>
            <p>Vote on allocation of DAO treasury funds for development, marketing, and community initiatives</p>
            <ul class="rights-list">
              <li>Marketing campaigns</li>
              <li>Development funding</li>
              <li>Strategic partnerships</li>
            </ul>
          </div>
        </div>
        
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="rights-content">
            <h3>Economic Policies</h3>
            <p>Shape the economic framework of the ecosystem through collective decision-making</p>
            <ul class="rights-list">
              <li>Tokenomics adjustments</li>
              <li>Staking rate changes</li>
              <li>Fee structures</li>
            </ul>
          </div>
        </div>
        
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="rights-content">
            <h3>Development Roadmap</h3>
            <p>Influence the technical and product development priorities of the platform</p>
            <ul class="rights-list">
              <li>Feature prioritization</li>
              <li>Game expansions</li>
              <li>Technical improvements</li>
            </ul>
          </div>
        </div>
        
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="rights-content">
            <h3>Community Programs</h3>
            <p>Establish and govern community-led initiatives to grow the ecosystem</p>
            <ul class="rights-list">
              <li>Content creator funding</li>
              <li>Events and tournaments</li>
              <li>Educational programs</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Active Proposals -->
    <section class="proposals-section">
      <h2 class="section-title text-gradient">Active Proposals</h2>
      
      <div class="proposals-grid">
        <div v-for="proposal in activeProposals" 
             :key="proposal.id" 
             class="proposal-card cosmic-card">
          <div class="proposal-header">
            <div class="proposal-title">
              <h3>{{ proposal.title }}</h3>
              <span class="proposal-id">#{{ proposal.id }}</span>
            </div>
            <span class="proposal-status" :class="proposal.status">
              {{ proposal.status }}
            </span>
          </div>
          
          <p class="proposal-summary">{{ proposal.summary }}</p>
          
          <div class="proposal-stats">
            <div class="vote-progress">
              <div class="progress-bar">
                <div class="progress-fill" 
                     :style="{ width: `${proposal.forPercentage}%` }"></div>
              </div>
              <div class="vote-counts">
                <span class="for">For: {{ proposal.forVotes }}</span>
                <span class="against">Against: {{ proposal.againstVotes }}</span>
              </div>
            </div>
            
            <div class="time-remaining">
              <i class="fas fa-clock"></i>
              <span>{{ proposal.timeRemaining }}</span>
            </div>
          </div>
          
          <div class="proposal-actions">
            <a href="https://nns.ic0.app" target="_blank" class="cosmic-button primary">
              <i class="fas fa-check"></i>
              Vote For
            </a>
            <a href="https://nns.ic0.app" target="_blank" class="cosmic-button secondary">
              <i class="fas fa-times"></i>
              Vote Against
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Join CTA Section -->
    <section class="join-section cosmic-card">
      <div class="join-content">
        <h2 class="text-gradient">Claim Your Cosmic Power!</h2>
        <p>Join the DAO and participate in governing the first fully on-chain gaming franchise</p>
        
        <div class="join-stats">
          <div class="join-stat">
            <i class="fas fa-vote-yea"></i>
            <span class="value">3x</span>
            <span class="label">Max Voting Power</span>
          </div>
          
          <div class="join-stat">
            <i class="fas fa-chart-line"></i>
            <span class="value">8→1%</span>
            <span class="label">APY Range</span>
          </div>
          
          <div class="join-stat">
            <i class="fas fa-calendar-alt"></i>
            <span class="value">7 Days</span>
            <span class="label">Voting Period</span>
          </div>
        </div>
        
        <div class="join-buttons">
          <a href="https://nns.ic0.app" target="_blank" class="cosmic-button primary">
            <i class="fas fa-rocket"></i>
            Become a Stakeholder
          </a>
          <router-link to="/whitepaper" class="cosmic-button secondary">
            <i class="fas fa-book"></i>
            Read Whitepaper
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

// Import multi-language logos and DAO image
import logo2 from '@/assets/icons/DAO-1.svg';
import heroImage2Default from '@/assets/icons/logo.svg';
import heroImage2CN from '@/assets/icons/logo-cn.svg';
import heroImage2KR from '@/assets/icons/logo-kr.svg';
import heroImage2JP from '@/assets/icons/logo-jp.svg';
import heroImage2RU from '@/assets/icons/logo-ru.svg';
import heroImage2AR from '@/assets/icons/logo-ar.svg';

export default {
  name: "DAOPage",
  setup() {
    const { locale } = useI18n();

    // Reactive Properties
    const scrollY = ref(0);
    const tooltip = ref(null);
    const tooltipVisible = ref(false);
    
    // Mock data for active proposals
    const activeProposals = ref([
      {
        id: "1",
        title: "Community Content Creator Program",
        status: "active",
        summary: "Establish a framework for content creators to receive funding for promoting Cosmicrafts ecosystem",
        forVotes: "243K",
        againstVotes: "52K",
        forPercentage: 82,
        timeRemaining: "3 days"
      },
      {
        id: "2",
        title: "Treasury Diversification Strategy",
        status: "active",
        summary: "Allocate 5% of treasury funds to strategic investments in ecosystem-aligned protocols",
        forVotes: "189K",
        againstVotes: "115K",
        forPercentage: 62,
        timeRemaining: "5 days"
      }
    ]);

    const heroLogoMap = {
      zh: heroImage2CN,
      ko: heroImage2KR,
      ja: heroImage2JP,
      ru: heroImage2RU,
      ar: heroImage2AR,
      default: heroImage2Default,
    };

    const dynamicHeroLogo = computed(() => {
      return heroLogoMap[locale.value] || heroLogoMap.default;
    });

    function handleScroll() {
      scrollY.value = window.scrollY;
    }
    
    function handleJoin() {
      // Redirect to NNS dashboard for participation
      window.open('https://nns.ic0.app', '_blank');
    }

    // Tooltip control methods
    function showTooltip(id) {
      tooltip.value = id;
      tooltipVisible.value = true;
    }

    function hideTooltip() {
      tooltip.value = null;
      tooltipVisible.value = false;
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      
      // Initialize starfield or other animations here if needed
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      dynamicHeroLogo,
      scrollY,
      tooltip,
      tooltipVisible,
      showTooltip,
      hideTooltip,
      activeProposals,
      handleJoin
    };
  },
};
</script>

<style scoped>
/* DAO Page Specific Styles */

.dao-page {
  color: var(--font-color);
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
  line-height: 1.2;
  
}


.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Headline Section Styles */
.headline {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #08090c, #1d263c, #08090c), url('@/assets/webp/daoheadline.webp') no-repeat center center;
  background-size: cover; /* Ensure the image covers the area */
  background-blend-mode: lighten;
}


.content {
  position: relative;
  text-align: center;
}

.hero-logo {
  max-width: 16rem;
  margin-bottom: -8rem;
  transition: transform 0.5s ease;
  filter: drop-shadow(0px 0px 8px rgba(0, 1, 18, 0.5));

}

.dao-image {
  max-width: 14rem;
  margin-bottom: -8rem;
  filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.5));
  transition: transform 0.5s ease;
}

.primary-headline {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 4rem;
  text-transform: uppercase;
  background: linear-gradient(180deg, #89c0ff, #007bff);
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent;
  background-clip: text; /* For non-WebKit browsers supporting background-clip */
  color: transparent; 
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.95));
}

.secondary-headline {
  margin-top: .25rem;
  font-weight: bold;
  background: linear-gradient(90deg, #8bd6fc, #8ac1ff, #a3c8ff);
  -webkit-background-clip: text; /* Ensures the gradient is clipped to text */
  -webkit-text-fill-color: transparent; /* Makes the text itself transparent */
  background-clip: text; /* For non-WebKit browsers supporting background-clip */
  color: transparent; 
  filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.95));
}

.cta-subtext {
  font-size: 1.2rem;
  color: #d1d9e6;
  font-style: italic;
  margin-top: -1.25rem;
  filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.95));
}

/* CTA Buttons Container to hold both buttons side by side */
.cta-buttons-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: -2px 2px 4px rgba(0, 0, 0, 0.224);
  text-align: center;
  color: #e0f7ff;
  background: linear-gradient(to bottom, #4a90e2, #264f89); /* Blue gradient */
  border: 2px solid #4faeff; /* Outer glowing border */
  border-radius: 6px; /* Less rounded corners */
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2), /* Subtle inner glow */
    0 0 15px rgba(79, 174, 255, 0.6); /* Outer glow */
  transition: 
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), /* Smooth scaling */
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), /* Smooth glow transition */
    background-color 0.5s ease-in-out; /* Quick background change */
  cursor: pointer;
  text-decoration: none;
}

.cta-button i {
  font-size: 1.2rem;
}

.cta-button.whitepaper-btn {
  background: linear-gradient(to bottom, #264f89, #1a3c6e); /* Darker blue gradient */
  border: 2px solid #3d88d6; /* Slightly less bright border */
}

.cta-button:hover {
  transform: translateY(-3px);
  text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.455);
  background: linear-gradient(to bottom, #3d92f3, #287aed); /* Lighter blue gradient */
  box-shadow: 
    inset 0 2px 8px rgba(146, 217, 255, 0.889), /* Stronger inner glow */
    0 0 8px rgba(30, 184, 255, 0.879); /* Brighter outer glow */
}

.cta-button.whitepaper-btn:hover {
  background: linear-gradient(to bottom, #3173c7, #1e4e8d); /* Lighter dark blue gradient */
  box-shadow: 
    inset 0 2px 8px rgba(123, 187, 255, 0.8), /* Subtle inner glow */
    0 0 12px rgba(61, 142, 255, 0.7); /* Medium outer glow */
}

/* Media query for mobile responsiveness */
@media (max-width: 768px) {
  .cta-buttons-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cta-button {
    padding: 0.8rem 1.5rem;
    font-size: 1.2rem;
  }
}

/* New Styles for Stats Section */
.stats-overview {
  margin: 2rem auto 4rem;
  padding: 2rem;
  max-width: 1200px;
  position: relative;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: rgba(15, 185, 253, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  background: rgba(15, 185, 253, 0.08);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
}

.stat-icon i {
  font-size: 1.5rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.stat-card:hover .stat-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.stat-content h3 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-weight: var(--weight-bold);
}

.stat-content p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* Distribution Section Styles */
.distribution-section {
  padding: 6rem 2rem 4rem;
  margin-top: -2rem;
  z-index: 1;
  position: relative;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: var(--weight-black);
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.distribution-card {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.distribution-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-primary),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.distribution-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15);
}

.distribution-card:hover::before {
  opacity: 1;
}

.distribution-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
}

.distribution-icon i {
  font-size: 1.75rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.distribution-card:hover .distribution-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.distribution-card:hover .distribution-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.distribution-content h3 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: var(--weight-bold);
}

.distribution-content .percentage {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-weight: var(--weight-black);
}

.distribution-content .amount {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.distribution-content .description {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid,
  .distribution-grid,
  .governance-grid,
  .rights-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .staking-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .benefits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .distribution-grid,
  .governance-grid {
    grid-template-columns: 1fr;
  }

  /* Mobile Governance Model styling */
  .governance-section {
    padding: 3rem 1rem;
    background: linear-gradient(135deg,
      rgba(15, 185, 253, 0.01) 0%,
      rgba(15, 185, 253, 0.03) 50%,
      rgba(15, 185, 253, 0.01) 100%
    );
  }
  
  .governance-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .governance-card {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: auto 1fr;
    text-align: left;
    gap: 1.25rem;
    align-items: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .governance-card:active {
    transform: scale(0.98);
    background: rgba(15, 185, 253, 0.08);
  }
  
  .governance-icon {
    width: 50px;
    height: 50px;
    margin: 0;
    grid-row: span 2;
  }
  
  .governance-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .governance-content h3 {
    font-size: 1.15rem;
    margin-bottom: 0.25rem;
  }
  
  .governance-content .requirement {
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
  }
  
  .governance-content .description {
    font-size: 0.85rem;
    opacity: 0.85;
  }
  
  /* Enhanced Staking Benefits mobile styling */
  .staking-section {
    padding: 3rem 1rem;
    border-radius: 8px;
  }
  
  .staking-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  
  .staking-info {
    order: 1;
  }
  
  .power-multipliers {
    order: 2;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .staking-info h3 {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 0.75rem;
  }
  
  .staking-info > p {
    font-size: 1rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .benefit-item {
    padding: 1.25rem;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    text-align: left;
  }
  
  .benefit-icon {
    margin: 0;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
  
  .benefit-content {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .benefit-content h4 {
    margin-bottom: 0;
  }
  
  .benefit-content .value {
    margin-left: auto;
    font-size: 1.3rem;
  }
  
  .power-multipliers {
    padding: 1.5rem;
  }
  
  .power-multipliers h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .multiplier-grid {
    gap: 1rem;
  }
  
  .multiplier-card {
    padding: 1.25rem;
  }
  
  .multiplier-header {
    margin-bottom: 0.75rem;
  }
  
  .multiplier-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .multiplier-content .bonus {
    font-size: 1.5rem;
    margin-bottom: 0;
  }
  
  .multiplier-content .time {
    font-size: 0.85rem;
  }

  .stakeholder-section,
  .staking-section {
    padding: 2rem 1rem;
  }

  .power-multipliers {
    padding: 1.5rem;
  }

  .proposal-header {
    flex-direction: column;
    gap: 1rem;
  }

  .proposal-actions {
    flex-direction: column;
  }

  .join-stats {
    flex-direction: column;
    gap: 2rem;
  }

  .join-content h2 {
    font-size: 2rem;
  }

  .governance-card,
  .distribution-card {
    padding: 1.5rem;
  }

  .governance-content .description,
  .distribution-content .description {
    font-size: 0.85rem;
  }
}

/* Stakeholder Rights Section Styles */
.stakeholder-section {
  padding: 4rem 2rem;
  margin: 4rem auto;
  max-width: 1200px;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.03) 100%
  );
}

.rights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.rights-card {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  height: 100%; /* Ensure consistent height */
  display: flex;
  flex-direction: column;
}

.rights-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    var(--color-primary),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.rights-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15);
}

.rights-card:hover::before {
  opacity: 1;
}

.rights-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
}

.rights-icon i {
  font-size: 1.75rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.rights-card:hover .rights-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.rights-card:hover .rights-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.rights-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rights-content h3 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: var(--weight-bold);
}

.rights-content p {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  line-height: 1.4;
  margin-bottom: 1rem;
}

.rights-list {
  list-style: none;
  padding-left: 0;
  margin-top: auto; /* Push list to bottom of card */
  text-align: left;
}

.rights-list li {
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.rights-list li::before {
  content: '•';
  position: absolute;
  left: 0.4rem;
  color: var(--color-primary);
  font-size: 1.2rem;
  line-height: 1;
  text-shadow: 0 0 5px rgba(15, 185, 253, 0.4);
}

.rights-card:hover .rights-list li::before {
  color: var(--color-primary-light);
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.7);
}

/* Proposals Section Styles */
.proposals-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.proposals-grid {
  display: grid;
  gap: 2rem;
}

.proposal-card {
  padding: 2rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.proposal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.2);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

.proposal-title {
  flex: 1;
}

.proposal-title h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  font-weight: var(--weight-bold);
}

.proposal-id {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.proposal-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.proposal-status.active {
  background: rgba(15, 185, 253, 0.15);
}

.proposal-summary {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.proposal-stats {
  margin-bottom: 2rem;
}

.vote-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  height: 8px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.vote-counts {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.time-remaining {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.time-remaining i {
  color: var(--color-primary);
}

.proposal-actions {
  display: flex;
  gap: 1rem;
}

.cosmic-button {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-text-primary);
}

.cosmic-button.primary {
  background: linear-gradient(135deg, 
    rgba(15, 185, 253, 0.8) 0%, 
    rgba(15, 185, 253, 0.6) 100%
  );
  color: white;
  border: 1px solid rgba(15, 185, 253, 0.3);
  box-shadow: 0 4px 15px rgba(15, 185, 253, 0.2);
}

.cosmic-button.primary:hover {
  background: linear-gradient(135deg, 
    rgba(15, 185, 253, 0.9) 0%, 
    rgba(15, 185, 253, 0.7) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15, 185, 253, 0.3);
}

.cosmic-button.secondary {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--color-primary);
}

.cosmic-button.secondary:hover {
  background: rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-2px);
}

/* Join Section Styles */
.join-section {
  padding: 4rem 2rem;
  margin: 4rem auto;
  max-width: 1200px;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.03) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.1);
}

.join-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: var(--weight-black);
}

.join-content p {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.join-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 3rem;
}

.join-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.join-stat i {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.join-stat .value {
  font-size: 2rem;
  color: var(--color-text-primary);
  font-weight: var(--weight-bold);
}

.join-stat .label {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.join-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.join-buttons .cosmic-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  flex: 0 1 auto; /* Allow buttons to maintain natural width */
  min-width: 200px; /* Set a minimum width */
  max-width: 300px; /* Set a maximum width */
}

.join-buttons .cosmic-button.primary {
  background: linear-gradient(135deg, 
    rgba(15, 185, 253, 0.85) 0%, 
    rgba(15, 185, 253, 0.65) 100%
  );
  box-shadow: 0 6px 20px rgba(15, 185, 253, 0.25);
}

.join-buttons .cosmic-button.secondary {
  background: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.2);
}

@media (max-width: 768px) {
  .join-buttons {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 280px; /* Constrain the width of the container */
    margin: 0 auto; /* Center the container */
  }
  
  .join-buttons .cosmic-button {
    padding: 0.9rem 1rem;
    font-size: 1rem;
    width: 100%;
    min-width: 0; /* Override min-width on mobile */
    max-width: 100%; /* Allow full width of container */
  }
}

/* Staking Benefits Section Styles - Desktop */
.staking-section {
  padding: 6rem 2rem 4rem;
  position: relative;
  overflow: hidden;
  max-width: 1200px;
  margin: 4rem auto;
  border-radius: 12px;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.04) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
}

.staking-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(15, 185, 253, 0.08) 0%, transparent 60%);
  z-index: 0;
  pointer-events: none;
}

.staking-section .section-title {
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
  transition: all 0.4s ease;
}

.staking-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  position: relative;
  z-index: 1;
  margin-top: 3rem;
  perspective: 1000px;
}

.staking-info {
  text-align: center;
  transform-style: preserve-3d;
  transition: all 0.4s ease;
}

.staking-info h3 {
  font-size: 1.8rem;
  color: var(--color-text-primary);
  margin-bottom: 1.5rem;
  font-weight: var(--weight-bold);
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.staking-info h3::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 2px;
  background: linear-gradient(to right, 
    rgba(15, 185, 253, 0), 
    rgba(15, 185, 253, 0.7), 
    rgba(15, 185, 253, 0));
  opacity: 0.8;
}

.staking-info > p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2.5rem;
  line-height: 1.6;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  transform: translateZ(5px);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  perspective: 800px;
}

.benefit-item {
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.06) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 8px;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.02);
}

.benefit-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    rgba(15, 185, 253, 0.03) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.benefit-item::after {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  transition: transform 1s ease;
  z-index: 0;
  pointer-events: none;
}

.benefit-item:hover {
  transform: translateY(-6px) rotateX(1deg) rotateY(1deg);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow:
    0 15px 30px rgba(15, 185, 253, 0.08),
    0 5px 15px rgba(0, 0, 0, 0.05);
}

.benefit-item:hover::before {
  opacity: 1;
}

.benefit-item:hover::after {
  transform: translateY(100%) translateX(100%) rotate(45deg);
  transition: transform 0.8s ease;
}

.benefit-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.2) 100%
  );
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  transform-style: preserve-3d;
  z-index: 1;
}

.benefit-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent,
    rgba(255, 255, 255, 0.1)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.benefit-icon i {
  font-size: 2rem;
  color: var(--color-primary);
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transition: all 0.4s ease;
  transform: translateZ(10px);
}

.benefit-item:hover .benefit-icon {
  transform: scale(1.1) translateZ(10px);
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.15) 0%,
    rgba(15, 185, 253, 0.25) 100%
  );
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 0 30px rgba(15, 185, 253, 0.15),
    0 0 12px rgba(15, 185, 253, 0.1);
}

.benefit-item:hover .benefit-icon::before {
  opacity: 1;
}

.benefit-item:hover .benefit-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  transform: translateZ(15px);
}

.benefit-content {
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
}

.benefit-content h4 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
  font-weight: var(--weight-bold);
  transition: all 0.3s ease;
}

.benefit-content .value {
  font-size: 2rem;
  color: var(--color-primary);
  font-weight: var(--weight-black);
  transition: all 0.3s ease;
  transform: translateZ(5px);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.benefit-item:hover .benefit-content h4 {
  color: var(--color-primary);
}

.benefit-item:hover .benefit-content .value {
  transform: translateZ(10px);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.2);
}

/* Power Multipliers Section */
.power-multipliers {
  padding: 2.5rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.08) 100%
  );
  border-radius: 10px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  text-align: center;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.05),
    0 4px 10px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  transform-style: preserve-3d;
}

.power-multipliers::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(15, 185, 253, 0.1) 0%, transparent 70%);
  z-index: 0;
  opacity: 0.7;
  transition: opacity 0.4s ease;
}

.power-multipliers:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 15px 35px rgba(15, 185, 253, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05);
  border-color: rgba(15, 185, 253, 0.25);
}

.power-multipliers:hover::before {
  opacity: 1;
}

.power-multipliers h3 {
  font-size: 1.8rem;
  color: var(--color-text-primary);
  margin-bottom: 2rem;
  font-weight: var(--weight-bold);
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.power-multipliers h3::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 2px;
  background: linear-gradient(to right, 
    rgba(15, 185, 253, 0), 
    rgba(15, 185, 253, 0.7), 
    rgba(15, 185, 253, 0));
  opacity: 0.8;
}

.multiplier-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}

.multiplier-card {
  padding: 2rem 1.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
}

.multiplier-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    rgba(15, 185, 253, 0.04) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.multiplier-card:hover {
  transform: translateY(-4px) translateZ(5px);
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: 
    0 10px 25px rgba(15, 185, 253, 0.08),
    0 5px 10px rgba(0, 0, 0, 0.04);
}

.multiplier-card:hover::before {
  opacity: 1;
}

.multiplier-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.multiplier-header i {
  font-size: 1.5rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.multiplier-header h4 {
  font-size: 1.25rem;
  color: var(--color-text-primary);
  font-weight: var(--weight-bold);
  transition: all 0.3s ease;
}

.multiplier-card:hover .multiplier-header i {
  color: var(--color-primary-light);
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.4);
  transform: scale(1.1);
}

.multiplier-content {
  position: relative;
  z-index: 1;
}

.multiplier-content .bonus {
  font-size: 2.5rem;
  font-weight: var(--weight-black);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
  transform: translateZ(5px);
}

.multiplier-content .time {
  font-size: 1rem;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
}

.multiplier-card:hover .multiplier-content .bonus {
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
  transform: translateZ(10px);
}

.multiplier-card:hover .multiplier-content .time {
  color: var(--color-text-primary);
}

/* Media queries for staking benefits section */
@media (max-width: 768px) {
  /* Mobile Staking Benefits styling */
  .staking-section {
    padding: 3rem 1rem;
    border-radius: 8px;
  }
  
  .staking-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  
  .staking-info {
    order: 1;
  }
  
  .power-multipliers {
    order: 2;
    padding: 1.5rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .staking-info h3 {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 0.75rem;
  }
  
  .staking-info > p {
    font-size: 1rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .benefit-item {
    padding: 1.25rem;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    text-align: left;
  }
  
  .benefit-icon {
    margin: 0;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
  
  .benefit-content {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .benefit-content h4 {
    margin-bottom: 0;
  }
  
  .benefit-content .value {
    margin-left: auto;
    font-size: 1.3rem;
  }
  
  .power-multipliers {
    padding: 1.5rem;
  }
  
  .power-multipliers h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .multiplier-grid {
    gap: 1rem;
  }
  
  .multiplier-card {
    padding: 1.25rem;
  }
  
  .multiplier-header {
    margin-bottom: 0.75rem;
  }
  
  .multiplier-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .multiplier-content .bonus {
    font-size: 1.5rem;
    margin-bottom: 0;
  }
  
  .multiplier-content .time {
    font-size: 0.85rem;
  }
}
</style>
