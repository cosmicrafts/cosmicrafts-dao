<template>
  <div class="dao-page">
    <!-- Fixed center logo -->
    <div class="cosmic-logo-watermark">
      <div class="logo-glow-effect"></div>
      <img src="@/assets/icons/cosmicrafts.svg" alt="Cosmicrafts" class="logo-image" />
    </div>
    
    <!-- Sky Light Beams -->
    <div class="sky-light-beams">
      <!-- Regular beams - made wider -->
      <div class="light-beam" style="--rotate: -5deg; width: 5vw;"></div>
      <div class="light-beam" style="--rotate: 2deg; width: 4vw;"></div>
      <div class="light-beam" style="--rotate: -2deg; width: 6vw;"></div>
      <div class="light-beam" style="--rotate: 4deg; width: 4.5vw;"></div>
      <div class="light-beam" style="--rotate: -3deg; width: 5.5vw;"></div>
      <div class="light-beam" style="--rotate: 5deg; width: 3.5vw;"></div>
      <div class="light-beam" style="--rotate: -4deg; width: 4.5vw;"></div>
      <div class="light-beam" style="--rotate: 3deg; width: 5vw;"></div>
      
      <!-- Slow rotating beams -->
      <div class="light-beam slow-beam" style="--rotate: 15deg; width: 8vw;"></div>
      <div class="light-beam slow-beam" style="--rotate: -12deg; width: 8vw;"></div>
    </div>
    
    <!-- Starfield Canvas -->
    <canvas ref="starfield" class="global-starfield"></canvas>
    
    <!-- Enhanced Cosmic Background -->
    <div class="cosmic-background">
      <!-- Dynamic Accent Glows -->
      <div class="cosmic-accent-glow top-left-glow"></div>
      <div class="cosmic-accent-glow bottom-right-glow"></div>
      
      <!-- Floating Elements -->
      <div class="floating-elements">
        <div class="floating-element" style="--delay: 0s; --depth: 30px; --rotation: -5deg; --top: 15%; --left: 10%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="floating-element" style="--delay: 1s; --depth: 60px; --rotation: 5deg; --top: 65%; --left: 20%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="floating-element" style="--delay: 2s; --depth: 90px; --rotation: -7deg; --top: 25%; --right: 12%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="floating-element" style="--delay: 3s; --depth: 40px; --rotation: 7deg; --bottom: 20%; --right: 15%;">
          <div class="element-particles">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
      
      <!-- Cosmic Portal Elements -->
      <div class="cosmic-portal-bg">
        <div class="portal-ring outer-ring"></div>
        <div class="portal-ring inner-ring"></div>
        <div class="portal-shield"></div>
        <div class="portal-stars">
          <div class="portal-star" style="--index: 1;"></div>
          <div class="portal-star" style="--index: 2;"></div>
          <div class="portal-star" style="--index: 3;"></div>
          <div class="portal-star" style="--index: 4;"></div>
          <div class="portal-star" style="--index: 5;"></div>
          <div class="portal-star" style="--index: 6;"></div>
          <div class="portal-star" style="--index: 7;"></div>
          <div class="portal-star" style="--index: 8;"></div>
        </div>
        <div class="portal-glow"></div>
        <div class="portal-core"></div>
        
        
        <!-- Energy Streams -->
        <div class="portal-energy-streams">
          <div class="energy-stream" style="--angle: 45deg;">
            <div class="energy-particles"></div>
          </div>
          <div class="energy-stream" style="--angle: 135deg;">
            <div class="energy-particles"></div>
          </div>
          <div class="energy-stream" style="--angle: 225deg;">
            <div class="energy-particles"></div>
          </div>
          <div class="energy-stream" style="--angle: 315deg;">
            <div class="energy-particles"></div>
          </div>
        </div>
        
        <!-- Hexagon Grid -->
        <div class="portal-hexagons">
          <div class="hexagon-grid"></div>
        </div>
        
        <!-- Data Points -->
        <div class="portal-data-points">
          <div class="data-point" style="--pos: 30%; --delay: 0s;"></div>
          <div class="data-point" style="--pos: 70%; --delay: 0.7s;"></div>
          <div class="data-point" style="--pos: 20%; --delay: 1.4s;"></div>
          <div class="data-point" style="--pos: 85%; --delay: 2.1s;"></div>
          <div class="data-point" style="--pos: 40%; --delay: 2.8s;"></div>
          <div class="data-point" style="--pos: 60%; --delay: 3.5s;"></div>
        </div>
      </div>
      
      <!-- Cosmic Dust Particles -->
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
      
      <!-- Gradient Overlays -->
      <div class="cosmic-gradient-overlay top-gradient"></div>
      <div class="cosmic-gradient-overlay bottom-gradient"></div>
    </div>
    
    <!-- Hero Section -->
    <section class="dao-hero">
      <div class="content-container">
        <div class="hero-content">
          <div class="hero-image-wrapper">
            <img :src="dynamicHeroLogo" alt="DAO Logo" class="hero-emblem" />
          </div>

          <div class="dao-image-wrapper">
            <img src="@/assets/icons/DAO-1.svg" alt="DAO Illustration" class="dao-image" />
          </div>

          <h1 class="hero-title" data-text="The dawn of a legacy">
            {{ $t('dao.headline.title', 'The dawn of a legacy') }}
          </h1>

          <div class="hero-subtitle">
            {{ $t('dao.headline.subtitle', 'It\'s DAO or NEVER!') }}
          </div>

          <div class="hero-actions">
            <a :href="daoAppUrl" target="_blank" rel="noopener noreferrer" class="cosmic-button primary-button">
              <span class="button-glow"></span>
              <span class="button-content">
                <i class="fas fa-rocket"></i>
                {{ $t('dao.headline.stakeholder_cta', 'Become a Stakeholder') }}
              </span>
            </a>
            <router-link to="/whitepaper" class="cosmic-button secondary-button">
              <span class="button-glow"></span>
              <span class="button-content">
                <i class="fas fa-book"></i>
                {{ $t('dao.headline.whitepaper_cta', 'Read Whitepaper') }}
              </span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="hero-floating-elements">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
      </div>
    </section>

    <!-- DAO Explanation Section -->
    <section class="dao-explainer-section">
      <div class="explainer-container">
        <h2 class="section-title text-gradient">{{ $t('dao.explainer.title', 'What is the Cosmicrafts DAO?') }}</h2>
        <div class="explainer-content">
          <div class="explainer-text">
            <p>{{ $t('dao.explainer.description', 'The Cosmicrafts DAO (Decentralized Autonomous Organization) enables the community to collectively govern the future of the Cosmicrafts gaming ecosystem. Through SPIRAL token ownership, stakeholders can participate in key decisions affecting platform development, treasury management, and economic policy.') }}</p>
          </div>
          
          <div class="explainer-pillars">
            <div class="explainer-pillar cosmic-card">
              <div class="pillar-icon">
                <i class="fas fa-vote-yea"></i>
              </div>
              <h3>{{ $t('dao.explainer.pillars.governance.title', 'Community Governance') }}</h3>
              <p>{{ $t('dao.explainer.pillars.governance.description', 'Vote on proposals and shape the future direction of the platform through democratic decision-making.') }}</p>
            </div>
            
            <div class="explainer-pillar cosmic-card">
              <div class="pillar-icon">
                <i class="fas fa-landmark"></i>
              </div>
              <h3>{{ $t('dao.explainer.pillars.treasury.title', 'Shared Treasury') }}</h3>
              <p>{{ $t('dao.explainer.pillars.treasury.description', 'Collectively manage a treasury of 760M SPIRAL tokens dedicated to ecosystem growth and development.') }}</p>
            </div>
            
            <div class="explainer-pillar cosmic-card">
              <div class="pillar-icon">
                <i class="fas fa-coins"></i>
              </div>
              <h3>{{ $t('dao.explainer.pillars.rewards.title', 'Staking Rewards') }}</h3>
              <p>{{ $t('dao.explainer.pillars.rewards.description', 'Earn rewards through active participation and long-term commitment to platform growth.') }}</p>
            </div>
          </div>
        </div>
        
        <div class="explainer-links">
          <router-link to="/roadmap" class="cta-button">
            <i class="fas fa-map-marked-alt"></i>
            {{ $t('dao.explainer.links.roadmap', 'View Our Roadmap') }}
          </router-link>
          <router-link to="/whitepaper" class="cta-button whitepaper-btn">
            <i class="fas fa-book"></i>
            {{ $t('dao.explainer.links.whitepaper', 'Read the Whitepaper') }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- Distribution Section -->
    <section class="distribution-section">
      <h2 class="section-title text-gradient">{{ $t('dao.distribution.title', 'Token Distribution') }}</h2>
      <div class="distribution-grid">
        <div class="distribution-card cosmic-card">
          <div class="distribution-icon treasury">
            <i class="fas fa-university"></i>
          </div>
          <div class="distribution-content">
            <h3>{{ $t('dao.distribution.treasury.title', 'Treasury') }}</h3>
            <p class="percentage">76%</p>
            <p class="amount">760M SPIRAL</p>
            <p class="description">{{ $t('dao.distribution.treasury.description', 'Ecosystem growth and DAO-controlled funds') }}</p>
          </div>
        </div>

        <div class="distribution-card cosmic-card">
          <div class="distribution-icon swap">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="distribution-content">
            <h3>{{ $t('dao.distribution.swap.title', 'SNS Swap') }}</h3>
            <p class="percentage">12%</p>
            <p class="amount">120M SPIRAL</p>
            <p class="description">{{ $t('dao.distribution.swap.description', 'Public sale with 8 quarterly releases') }}</p>
          </div>
        </div>

        <div class="distribution-card cosmic-card">
          <div class="distribution-icon team">
            <i class="fas fa-users-cog"></i>
          </div>
          <div class="distribution-content">
            <h3>{{ $t('dao.distribution.team.title', 'Developer Team') }}</h3>
            <p class="percentage">8%</p>
            <p class="amount">80M SPIRAL</p>
            <p class="description">{{ $t('dao.distribution.team.description', '8-year vesting for core team') }}</p>
          </div>
        </div>

        <div class="distribution-card cosmic-card">
          <div class="distribution-icon investors">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="distribution-content">
            <h3>{{ $t('dao.distribution.investors.title', 'Seed Investors') }}</h3>
            <p class="percentage">4%</p>
            <p class="amount">40M SPIRAL</p>
            <p class="description">{{ $t('dao.distribution.investors.description', 'Early backers with varied vesting') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Governance Section -->
    <section class="governance-section">
      <h2 class="section-title text-gradient">{{ $t('dao.governance.title', 'Governance Model') }}</h2>
      <div class="governance-grid">
        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-gavel"></i>
          </div>
          <div class="governance-content">
            <h3>{{ $t('dao.governance.proposal_creation.title', 'Proposal Creation') }}</h3>
            <p class="requirement">{{ $t('dao.governance.proposal_creation.requirement', '1,000 SPIRAL') }}</p>
            <p class="description">{{ $t('dao.governance.proposal_creation.description', 'Minimum stake required to submit proposals') }}</p>
          </div>
        </div>

        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="governance-content">
            <h3>{{ $t('dao.governance.voting_period.title', 'Voting Period') }}</h3>
            <p class="requirement">{{ $t('dao.governance.voting_period.requirement', '7 Days') }}</p>
            <p class="description">{{ $t('dao.governance.voting_period.description', 'Standard deliberation time for proposals') }}</p>
          </div>
        </div>

        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="governance-content">
            <h3>{{ $t('dao.governance.voting_power.title', 'Voting Power') }}</h3>
            <p class="requirement">{{ $t('dao.governance.voting_power.requirement', 'Up to 3x') }}</p>
            <p class="description">{{ $t('dao.governance.voting_power.description', 'Maximum multiplier through staking and age') }}</p>
          </div>
        </div>

        <div class="governance-card cosmic-card">
          <div class="governance-icon">
            <i class="fas fa-hourglass-half"></i>
          </div>
          <div class="governance-content">
            <h3>{{ $t('dao.governance.lock_period.title', 'Lock Period') }}</h3>
            <p class="requirement">{{ $t('dao.governance.lock_period.requirement', '30d - 8y') }}</p>
            <p class="description">{{ $t('dao.governance.lock_period.description', 'Flexible dissolve delay options') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Multipliers Section -->
    <section class="multipliers-section">
      <div class="power-multipliers">
        <h3>{{ $t('dao.staking.multipliers.title', 'Power Multipliers') }}</h3>
        <div class="multiplier-grid">
          <div class="multiplier-card">
            <div class="multiplier-header">
              <i class="fas fa-shield-alt"></i>
              <h4>{{ $t('dao.staking.multipliers.dissolve.title', 'Dissolve Delay') }}</h4>
            </div>
            <div class="multiplier-content">
              <p class="bonus">+100%</p>
              <p class="time">8 years</p>
            </div>
          </div>

          <div class="multiplier-card">
            <div class="multiplier-header">
              <i class="fas fa-hourglass-half"></i>
              <h4>{{ $t('dao.staking.multipliers.age.title', 'Neuron Age') }}</h4>
            </div>
            <div class="multiplier-content">
              <p class="bonus">+100%</p>
              <p class="time">365 days</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stakeholder Rights Section -->
    <section class="stakeholder-section">
      <h2 class="section-title text-gradient">{{ $t('dao.rights.title', 'Stakeholder Rights') }}</h2>
      
      <div class="rights-grid">
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-landmark"></i>
          </div>
          <div class="rights-content">
            <h3>{{ $t('dao.rights.treasury.title', 'Treasury Management') }}</h3>
            <p>{{ $t('dao.rights.treasury.description', 'Vote on allocation of DAO treasury funds for development, marketing, and community initiatives') }}</p>
            <ul class="rights-list">
              <li>{{ $t('dao.rights.treasury.items.marketing', 'Marketing campaigns') }}</li>
              <li>{{ $t('dao.rights.treasury.items.development', 'Development funding') }}</li>
              <li>{{ $t('dao.rights.treasury.items.partnerships', 'Strategic partnerships') }}</li>
            </ul>
          </div>
        </div>
        
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="rights-content">
            <h3>{{ $t('dao.rights.economic.title', 'Economic Policies') }}</h3>
            <p>{{ $t('dao.rights.economic.description', 'Shape the economic framework of the ecosystem through collective decision-making') }}</p>
            <ul class="rights-list">
              <li>{{ $t('dao.rights.economic.items.tokenomics', 'Tokenomics adjustments') }}</li>
              <li>{{ $t('dao.rights.economic.items.staking', 'Staking rate changes') }}</li>
              <li>{{ $t('dao.rights.economic.items.fees', 'Fee structures') }}</li>
            </ul>
          </div>
        </div>
        
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="rights-content">
            <h3>{{ $t('dao.rights.roadmap.title', 'Development Roadmap') }}</h3>
            <p>{{ $t('dao.rights.roadmap.description', 'Influence the technical and product development priorities of the platform') }}</p>
            <ul class="rights-list">
              <li>{{ $t('dao.rights.roadmap.items.features', 'Feature prioritization') }}</li>
              <li>{{ $t('dao.rights.roadmap.items.expansions', 'Game expansions') }}</li>
              <li>{{ $t('dao.rights.roadmap.items.improvements', 'Technical improvements') }}</li>
            </ul>
          </div>
        </div>
        
        <div class="rights-card cosmic-card">
          <div class="rights-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="rights-content">
            <h3>{{ $t('dao.rights.community.title', 'Community Programs') }}</h3>
            <p>{{ $t('dao.rights.community.description', 'Establish and govern community-led initiatives to grow the ecosystem') }}</p>
            <ul class="rights-list">
              <li>{{ $t('dao.rights.community.items.creators', 'Content creator funding') }}</li>
              <li>{{ $t('dao.rights.community.items.events', 'Events and tournaments') }}</li>
              <li>{{ $t('dao.rights.community.items.education', 'Educational programs') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <!-- Join CTA Section -->
    <section class="join-section cosmic-card">
      <div class="join-content">
        <h2 class="text-gradient">{{ $t('dao.join.title', 'Claim Your Cosmic Power!') }}</h2>
        <p>{{ $t('dao.join.description', 'Join the DAO and participate in governing the first fully on-chain gaming franchise') }}</p>
        
        <div class="join-stats">
          <div class="join-stat">
            <i class="fas fa-vote-yea"></i>
            <span class="value">3x</span>
            <span class="label">{{ $t('dao.join.stats.voting', 'Max Voting Power') }}</span>
          </div>
          
          <div class="join-stat">
            <i class="fas fa-chart-line"></i>
            <span class="value">8→1%</span>
            <span class="label">{{ $t('dao.join.stats.apy', 'APY Range') }}</span>
          </div>
          
          <div class="join-stat">
            <i class="fas fa-calendar-alt"></i>
            <span class="value">7 Days</span>
            <span class="label">{{ $t('dao.join.stats.period', 'Voting Period') }}</span>
          </div>
        </div>
        
        <div class="join-buttons">
          <a :href="daoAppUrl" target="_blank" rel="noopener noreferrer" class="cosmic-button primary">
            <i class="fas fa-rocket"></i>
            {{ $t('dao.join.stakeholder_cta', 'Become a Stakeholder') }}
          </a>
          <router-link to="/whitepaper" class="cosmic-button secondary">
            <i class="fas fa-book"></i>
            {{ $t('dao.join.whitepaper_cta', 'Read Whitepaper') }}
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import logo2 from '@/assets/icons/DAO-1.svg';
import heroImage2Default from '@/assets/icons/logo.svg';
import heroImage2CN from '@/assets/icons/logo-cn.svg';
import heroImage2KR from '@/assets/icons/logo-kr.svg';
import heroImage2JP from '@/assets/icons/logo-jp.svg';
import heroImage2RU from '@/assets/icons/logo-ru.svg';
import heroImage2AR from '@/assets/icons/logo-ar.svg';
import Proposals from '@/components/feedback/Proposals.vue';

export default {
  name: "DAOPage",
  components: {
    Proposals
  },
  setup() {
    const { t, locale } = useI18n();
    
    // Reactive Properties
    const scrollY = ref(0);
    const starfield = ref(null);
    const tooltip = ref(null);
    const tooltipVisible = ref(false);
    const daoAppUrl = ref('https://nns.ic0.app');
    const isLoading = ref(false);
    const error = ref(null);
    
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

    // Performance optimization: Use requestAnimationFrame for scroll events
    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          scrollY.value = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    }
    
    function handleJoin() {
      // Redirect to NNS dashboard for participation
      window.open(daoAppUrl.value, '_blank', 'noopener,noreferrer');
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

    // Initialize canvas effects
    function initCanvasEffects() {
      if (starfield.value) {
        try {
          // Get canvas and context
          const canvas = starfield.value;
          const ctx = canvas.getContext('2d');
          
          // Get device pixel ratio
          const dpr = window.devicePixelRatio || 1;
          
          // Create stars
          const stars = [];
          const createStars = () => {
            // Set canvas dimensions with pixel ratio
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Set display size
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            
            // Set actual size in memory
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            
            // Scale context to match pixel ratio
            ctx.scale(dpr, dpr);
            
            // Calculate star count based on screen area with increased density
            const starCount = Math.floor((width * height) / 1000); // Increased density from 1600 to 1000
            stars.length = 0;
            
            for (let i = 0; i < starCount; i++) {
              stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: (Math.random() * 1.5) + 0.5,
                opacity: 0,
                targetOpacity: 0.7 + Math.random() * 0.3,
                twinkleSpeed: 0.002 + Math.random() * 0.008,
                delay: Math.random() * 2000
              });
            }
          };
          
          // Draw stars
          const drawStars = () => {
            if (!ctx) return;
            
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
            
            const now = Date.now();
            const animStart = now - 500;
            
            ctx.fillStyle = '#ffffff';
            stars.forEach(star => {
              if (star.opacity < star.targetOpacity && now > animStart + star.delay) {
                star.opacity = Math.min(star.targetOpacity, star.opacity + 0.01);
              }
              
              const twinkle = Math.sin(now * star.twinkleSpeed) * 0.2;
              const currentOpacity = Math.max(0.1, Math.min(star.targetOpacity, star.opacity + twinkle));
              
              ctx.globalAlpha = currentOpacity;
              ctx.beginPath();
              ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
              ctx.fill();
            });
          };
          
          // Animation loop
          let animationFrameId;
          const animate = () => {
            drawStars();
            animationFrameId = requestAnimationFrame(animate);
          };
          
          // Handle window resize
          const handleResize = () => {
            // Reset scale before resizing
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            createStars();
          };
          
          // Initial setup
          createStars();
          animate();
          
          // Handle window resize
          window.addEventListener('resize', handleResize, { passive: true });
          
          // Clean up
          onUnmounted(() => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            window.removeEventListener('resize', handleResize);
          });
        } catch (err) {
          console.error('Canvas initialization error:', err);
        }
      }
    }

    // Initialize canvas effects and setup event listeners
    onMounted(() => {
      // Add scroll event listener with passive: true for better performance
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Initialize canvas effects
      initCanvasEffects();
      
      // Create entrance animation for the hero section
      const heroElements = [
        '.hero-logo',
        '.dao-image',
        '.primary-headline',
        '.cta-subtext',
        '.cta-buttons-container .cta-button:first-child',
        '.cta-buttons-container .cta-button:last-child'
      ];
      
      // Ensure animations reset if page is reloaded midway through
      heroElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.opacity = '0';
        }
      });
      
      // No need to set initial opacity for starfield - handled by CSS animation
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      // Note: Canvas cleanup is handled in initCanvasEffects
    });

    return {
      dynamicHeroLogo,
      scrollY,
      tooltip,
      tooltipVisible,
      showTooltip,
      hideTooltip,
      activeProposals,
      handleJoin,
      daoAppUrl,
      starfield,
      isLoading,
      error
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
  /* Add content-visibility for better performance */
  contain: content;
  position: relative; /* Ensure proper positioning for absolute elements */
  min-height: 100vh;
  /* Cosmic theme variables */
  --cosmic-glass-bg: rgba(16, 20, 38, 0.6);
  --cosmic-glass-bg-darker: rgba(16, 20, 38, 0.8);
  --cosmic-glass-bg-lighter: rgba(16, 20, 38, 0.4);
  --cosmic-glass-border: 1px solid rgba(255, 255, 255, 0.1);
  --cosmic-glass-border-blue: 1px solid rgba(15, 185, 253, 0.2);
  --cosmic-glow-blue-sm: 0 0 15px rgba(15, 185, 253, 0.15);
  --cosmic-glow-blue-md: 0 0 25px rgba(15, 185, 253, 0.25);
  --cosmic-shadow-sm: 0 4px 10px rgba(0, 0, 0, 0.1);
  --cosmic-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.15);
  --cosmic-shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.2);
  --cosmic-blue: rgb(15, 185, 253);
  --cosmic-purple: rgb(103, 58, 183);
  --cosmic-text-primary: rgb(245, 245, 255);
  --cosmic-text-secondary: rgba(245, 245, 255, 0.75);
  --cosmic-text-tertiary: rgba(245, 245, 255, 0.5);
  --animation-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-bounce: cubic-bezier(0.2, 0.8, 0.2, 1.2);
  --animation-delay-base: 0.1s;
  --cosmic-bg-dark: rgb(10, 14, 28);
  --hero-accent-glow: rgba(15, 185, 253, 0.3);
  --glass-blur: 60px;
  --cosmic-bg-primary: #0a111f;
  --cosmic-bg-secondary: #1a2035;
  --cosmic-accent-glow: rgba(65, 195, 255, 0.8);
  --cosmic-highlight-1: #41c3ff;
  --cosmic-highlight-2: #5a6bff;
  --cosmic-font-glow: 0 0 10px rgba(65, 195, 255, 0.5);
  min-height: 100vh;
  background: radial-gradient(ellipse at center, var(--cosmic-bg-secondary) 0%, var(--cosmic-bg-primary) 100%);
  position: relative;
  overflow: hidden;
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Enhanced Cosmic Background */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  perspective: 1200px;
}

/* Dynamic Accent Glows */
.cosmic-accent-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(var(--glass-blur));
  opacity: 0.6;
  z-index: 1;
}

.top-left-glow {
  top: -50%;
  left: -20%;
  width: 70%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    var(--hero-accent-glow) 0%,
    rgba(15, 185, 253, 0.15) 30%,
    rgba(15, 185, 253, 0) 70%
  );
  animation: orbitEffect 20s infinite alternate var(--animation-smooth);
}

.bottom-right-glow {
  bottom: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(103, 58, 183, 0.3) 0%,
    rgba(103, 58, 183, 0.1) 50%,
    rgba(103, 58, 183, 0) 70%
  );
  animation: pulseBackground 15s infinite alternate var(--animation-smooth);
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  z-index: 2;
}

.floating-element {
  position: absolute;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 20, 38, 0.75);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 0 15px rgba(15, 185, 253, 0.15),
    0 10px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  transform-style: preserve-3d;
  animation-timing-function: var(--animation-smooth);
  animation: float 10s infinite alternate;
  animation-delay: var(--delay);
  transform: rotate(var(--rotation)) translateZ(var(--depth));
}

.element-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  z-index: 1;
}

.element-particles span {
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--cosmic-blue);
  opacity: 0.5;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.8);
  animation: particleFloat 3s infinite alternate ease-in-out;
}

.element-particles span:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.element-particles span:nth-child(2) { top: 15%; right: 15%; animation-delay: 0.5s; }
.element-particles span:nth-child(3) { bottom: 15%; left: 15%; animation-delay: 1s; }
.element-particles span:nth-child(4) { bottom: 20%; right: 10%; animation-delay: 1.5s; }

/* Cosmic Portal Background */
.cosmic-portal-bg {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1200px;
  height: 1600px;
  z-index: 1;
  opacity: 0.9;
}

.portal-ring {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  opacity: 0.6;
  animation-fill-mode: forwards;
}

.outer-ring {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(15, 185, 253, 0.5);
  box-shadow: 
    0 0 20px rgba(15, 185, 253, 0.3),
    0 0 40px rgba(15, 185, 253, 0.2),
    inset 0 0 20px rgba(15, 185, 253, 0.3);
  animation: portalPulse 8s infinite alternate var(--animation-smooth), 
             portalRotate 40s linear infinite;
  transform: scale(1) rotate(0deg);
}

.inner-ring {
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  border: 2px solid rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 0 15px rgba(15, 185, 253, 0.3),
    0 0 30px rgba(15, 185, 253, 0.1),
    inset 0 0 10px rgba(15, 185, 253, 0.3);
  animation: portalPulse 6s infinite alternate-reverse var(--animation-smooth), 
             portalRotate 30s linear infinite reverse;
  transform: scale(1) rotate(0deg);
}

.portal-shield {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 90%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 60%,
    rgba(15, 185, 253, 0.01) 80%
  );
  box-shadow: inset 0 0 30px rgba(15, 185, 253, 0.1);
  opacity: 0.5;
  animation: shieldPulse 10s infinite alternate-reverse var(--animation-smooth);
  pointer-events: none;
}

.portal-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: portalRotate 60s linear infinite reverse;
}

.portal-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(15, 185, 253, 0.6);
  opacity: 0.6;
  animation: portalStarPulse 3s infinite alternate var(--animation-smooth);
  animation-delay: calc(var(--index) * 0.3s);
}

.portal-star:nth-child(1) { top: 20%; left: 10%; }
.portal-star:nth-child(2) { top: 10%; left: 50%; }
.portal-star:nth-child(3) { top: 20%; left: 90%; }
.portal-star:nth-child(4) { top: 50%; left: 95%; }
.portal-star:nth-child(5) { top: 80%; left: 90%; }
.portal-star:nth-child(6) { top: 90%; left: 50%; }
.portal-star:nth-child(7) { top: 80%; left: 10%; }
.portal-star:nth-child(8) { top: 50%; left: 5%; }

.portal-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(15, 185, 253, .3);
  box-shadow: 0 0 64px rgba(0, 183, 255, 0.6);
  border-radius: 50%;
  animation: portalCorePulse 4s infinite alternate var(--animation-smooth);
}

/* Logo Watermark */
.cosmic-logo-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.15; /* Reduce overall opacity */
}

.logo-glow-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, 
    rgba(65, 195, 255, 0.1) 0%,
    rgba(65, 195, 255, 0.05) 30%,
    rgba(65, 195, 255, 0.02) 50%,
    rgba(65, 195, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(15px);
  opacity: 0.3;
  animation: logoGlowPulse 4s infinite alternate ease-in-out;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: logoFade 5s infinite alternate ease-in-out;
  z-index: 1000;
  position: relative;
  opacity: 0.2;
  filter: none; /* Remove the drop shadow */
}

@keyframes logoGlowPulse {
  0% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes logoFade {
  0% {
    opacity: 0.2;
    filter: drop-shadow(0 0 15px rgba(65, 195, 255, 0.6)) 
           drop-shadow(0 0 30px rgba(65, 195, 255, 0.3));
  }
  100% {
    opacity: 0.4;
    filter: drop-shadow(0 0 30px rgba(65, 195, 255, 1)) 
           drop-shadow(0 0 60px rgba(65, 195, 255, 0.6));
  }
}

/* Make the logo responsive */
@media (max-width: 768px) {
  .cosmic-logo-watermark {
    width: 200px;
    height: 200px;
    opacity: 0.1; /* Even less visible on mobile */
  }
}

/* Energy Streams */
.portal-energy-streams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: portalRotate 30s linear infinite;
}

.energy-stream {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(15, 185, 253, 0),
    rgba(15, 185, 253, 0.25),
    rgba(15, 185, 253, 0)
  );
  transform-origin: left center;
  transform: rotate(var(--angle));
  opacity: 0.6;
  filter: blur(1px);
  border-radius: 1px;
}

/* Hexagon Grid */
.portal-hexagons {
  position: absolute;
  top: 0;
  left: 0;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  overflow: hidden;
  opacity: 0.4;
}

.hexagon-grid {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background-image: 
    repeating-linear-gradient(0deg, rgba(15, 185, 253, 0.1) 0px, transparent 1px, transparent 30px),
    repeating-linear-gradient(60deg, rgba(15, 185, 253, 0.1) 0px, transparent 1px, transparent 30px),
    repeating-linear-gradient(120deg, rgba(15, 185, 253, 0.1) 0px, transparent 1px, transparent 30px);
  border-radius: 50%;
  animation: rotateGrid 60s linear infinite;
  opacity: 0.5;
}

/* Data Points */
.portal-data-points {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.data-point {
  position: absolute;
  top: var(--pos);
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(15, 185, 253, 0.1) 30%,
    rgba(15, 185, 253, 0.3) 50%,
    rgba(15, 185, 253, 0.1) 70%,
    transparent 100%
  );
  animation: dataPointScan 6s infinite;
  animation-delay: var(--delay);
  opacity: 0.6;
}

/* Starfield */
.cosmic-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.cosmic-star {
  position: absolute;
  width: var(--size);
  height: var(--size);
  top: var(--top);
  left: var(--left);
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 calc(var(--size) * 2) rgba(255, 255, 255, 0.5),
              0 0 calc(var(--size) * 4) rgba(15, 185, 253, 0.3);
  animation: starTwinkle 3s infinite alternate;
  animation-delay: calc(var(--top) * 0.01s);
}

/* Dust Particles */
.cosmic-dust-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
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

.dust-particle:nth-child(1) { top: 10%; left: 20%; }
.dust-particle:nth-child(2) { top: 25%; left: 70%; }
.dust-particle:nth-child(3) { top: 40%; left: 30%; }
.dust-particle:nth-child(4) { top: 55%; left: 80%; }
.dust-particle:nth-child(5) { top: 70%; left: 15%; }
.dust-particle:nth-child(6) { top: 85%; left: 60%; }
.dust-particle:nth-child(7) { top: 15%; left: 45%; }
.dust-particle:nth-child(8) { top: 35%; left: 90%; }

/* Gradient Overlays */
.cosmic-gradient-overlay {
  position: absolute;
  width: 100%;
  z-index: 4;
  pointer-events: none;
  opacity: 0.8;
}

.top-gradient {
  top: 0;
  height: 30vh;
  background: linear-gradient(
    to bottom,
    var(--cosmic-bg-dark) 0%,
    transparent 100%
  );
}

.bottom-gradient {
  bottom: 0;
  height: 30vh;
  background: linear-gradient(
    to top,
    var(--cosmic-bg-dark) 0%,
    transparent 100%
  );
}

/* Global starfield that spans the entire page */
.global-starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
  mix-blend-mode: screen;
  z-index: 2;
  pointer-events: none;
  will-change: opacity;
  animation: starfieldFadeIn 1.5s ease 0.2s forwards;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

@keyframes starfieldFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.8; /* Increased opacity for better visibility */
  }
}

/* Keep original .noise-canvas for compatibility with existing code */
.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Optimize canvas rendering */
  will-change: transform;
}

/* Headline Section Styles */
.headline {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(8, 9, 12, 0.95) 0%, 
    rgba(29, 38, 60, 0.95) 50%,
    rgba(8, 9, 12, 0.95) 100%), 
    url('@/assets/webp/daoheadline.webp') no-repeat center center;
  background-size: cover;
  background-blend-mode: overlay;
  perspective: 1500px;
  transform-style: preserve-3d;
  /* Add content-visibility for better performance */
  content-visibility: auto;
  contain-intrinsic-size: 100vh;
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.headline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 30%, 
    rgba(15, 185, 253, 0.12) 0%, 
    transparent 60%);
  z-index: 1;
  pointer-events: none;
}

.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.45;
  mix-blend-mode: overlay;
  z-index: 1;
}

.content {
  position: relative;
  text-align: center;
  z-index: 2;
  transform-style: preserve-3d;
  max-width: 1200px;
  padding: 0 2rem;
}

/* Add new animations for hero elements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateZ(0);
  }
  to {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
}

@keyframes glowPulse {
  0% {
    filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(15, 185, 253, 0.7));
  }
  100% {
    filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.3));
  }
}

.hero-logo {
  max-width: 16rem;
  margin-bottom: -8rem;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  filter: drop-shadow(0 0 15px rgba(0, 123, 255, 0.3));
  transform-style: preserve-3d;
  transform: translateZ(20px);
  will-change: transform;
  opacity: 0;
  animation: scaleIn 0.7s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.1s forwards,
             glowPulse 3s ease-in-out 1.4s infinite;
}

.dao-image {
  max-width: 14rem;
  filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.35))
          drop-shadow(0 0 40px rgba(15, 185, 253, 0.2));
  will-change: transform, filter;
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.3s forwards;
  transition: filter 0.5s ease;
}

.dao-image:hover {
  filter: drop-shadow(0 0 25px rgba(15, 185, 253, 0.5))
          drop-shadow(0 0 50px rgba(15, 185, 253, 0.3));
}

@keyframes float {
  0% { transform: translateZ(40px) translateY(0px); }
  50% { transform: translateZ(40px) translateY(-15px); }
  100% { transform: translateZ(40px) translateY(0px); }
}

@keyframes textGradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes lineReveal {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 15rem;
    opacity: 0.7;
  }
}

.primary-headline {
  font-size: 3.5rem;
  font-weight: 800;
  margin-top: 4rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  position: relative;
  background: linear-gradient(
    300deg,
    rgba(135, 192, 255, 1) 0%,
    rgba(15, 185, 253, 1) 25%,
    rgba(88, 101, 242, 1) 50%,
    rgba(15, 185, 253, 1) 75%,
    rgba(135, 192, 255, 1) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  text-shadow: 
    0 0 30px rgba(15, 185, 253, 0.3),
    0 0 60px rgba(15, 185, 253, 0.1);
  letter-spacing: 0.02em;
  transform-style: preserve-3d;
  transform: translateZ(30px);
  will-change: transform;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  animation: 
    fadeInUp 0.8s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.5s forwards,
    gradientFlow 8s linear infinite,
    cosmicPulse 4s ease-in-out infinite;
}

.primary-headline::before {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(15, 185, 253, 0.15) 0%,
    transparent 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  z-index: -1;
  filter: blur(8px);
  opacity: 0.7;
  transform: translateZ(15px);
}

.primary-headline::after {
  content: '';
  position: absolute;
  bottom: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: 15rem;
  height: 2px;
  background: linear-gradient(
    90deg, 
    rgba(15, 185, 253, 0) 0%, 
    rgba(15, 185, 253, 0.8) 50%, 
    rgba(15, 185, 253, 0) 100%
  );
  filter: blur(1px);
  border-radius: 2px;
  opacity: 0;
  animation: lineReveal 1s ease 0.7s forwards;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes cosmicPulse {
  0% { 
    text-shadow: 
      0 0 30px rgba(15, 185, 253, 0.3),
      0 0 60px rgba(15, 185, 253, 0.1);
  }
  50% { 
    text-shadow: 
      0 0 40px rgba(15, 185, 253, 0.4),
      0 0 80px rgba(15, 185, 253, 0.2);
  }
  100% { 
    text-shadow: 
      0 0 30px rgba(15, 185, 253, 0.3),
      0 0 60px rgba(15, 185, 253, 0.1);
  }
}

/* Mobile optimization for the enhanced title */
@media (max-width: 768px) {
  .primary-headline {
    font-size: 2.5rem;
    margin-top: 2rem;
    letter-spacing: 0.01em;
    text-shadow: 
      0 0 20px rgba(15, 185, 253, 0.3),
      0 0 40px rgba(15, 185, 253, 0.1);
  }

  .primary-headline::after {
    width: 10rem;
    height: 1.5px;
  }
}

.cta-subtext {
  font-size: 1.5rem;
  color: rgba(209, 217, 230, 0.9);
  font-style: italic;
  margin-top: 1rem;
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transform-style: preserve-3d;
  transform: translateZ(20px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
  letter-spacing: 0.02em;
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.7s forwards;
}

@keyframes buttonPop {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.9) translateZ(25px);
  }
  70% {
    opacity: 1;
    transform: translateY(-5px) scale(1.03) translateZ(25px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) translateZ(25px);
  }
}

.cta-buttons-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2.5rem;
  transform-style: preserve-3d;
  transform: translateZ(25px);
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

.cta-buttons-container .cta-button:first-child {
  opacity: 0;
  animation: buttonPop 0.9s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.9s forwards;
}

.cta-buttons-container .cta-button:last-child {
  opacity: 0;
  animation: buttonPop 0.9s cubic-bezier(0.17, 0.67, 0.3, 1.33) 1.1s forwards;
}

/* Add canvas particles animation */
@keyframes canvasFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.45;
  }
}

.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  mix-blend-mode: overlay;
  z-index: 1;
  animation: canvasFadeIn 1.5s ease 0.2s forwards;
  /* Optimize canvas rendering */
  will-change: transform;
}

.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: #f0f9ff;
  background: linear-gradient(to bottom, 
    rgba(74, 144, 226, 0.95) 0%, 
    rgba(38, 79, 137, 0.95) 100%);
  border: 2px solid rgba(79, 174, 255, 0.7);
  border-radius: 8px;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    0 10px 25px rgba(79, 174, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  z-index: 1;
  transform-style: preserve-3d;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0) 100%);
  transform: translateX(-100%) rotate(45deg);
  transition: transform 0.6s ease;
  z-index: -1;
}

.cta-button i {
  font-size: 1.3rem;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.cta-button.whitepaper-btn {
  background: linear-gradient(to bottom, 
    rgba(38, 79, 137, 0.95) 0%, 
    rgba(26, 60, 110, 0.95) 100%);
  border: 2px solid rgba(61, 136, 214, 0.7);
}

.cta-button:hover {
  transform: translateY(-5px) scale(1.03);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  background: linear-gradient(to bottom, 
    rgba(61, 146, 243, 0.95) 0%, 
    rgba(40, 122, 237, 0.95) 100%);
  box-shadow: 
    inset 0 2px 10px rgba(146, 217, 255, 0.9),
    0 15px 30px rgba(30, 184, 255, 0.5);
}

.cta-button:hover::before {
  transform: translateX(100%) rotate(45deg);
}

.cta-button:hover i {
  transform: scale(1.2) rotate(5deg);
  color: rgba(200, 230, 255, 1);
}

.cta-button.whitepaper-btn:hover {
  background: linear-gradient(to bottom, 
    rgba(49, 115, 199, 0.95) 0%, 
    rgba(30, 78, 141, 0.95) 100%);
  box-shadow: 
    inset 0 2px 10px rgba(123, 187, 255, 0.8),
    0 15px 30px rgba(61, 142, 255, 0.4);
}

@media (max-width: 768px) {
  .primary-headline {
    font-size: 2.5rem;
  }
  
  .cta-subtext {
    font-size: 1.2rem;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .cta-buttons-container {
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .cta-button {
    padding: 1rem 2rem;
    font-size: 1.3rem;
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
  padding: 1rem 2rem 6rem;
  margin-top: -2rem;
  z-index: 2;
  position: relative;
  perspective: 1200px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.distribution-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(15, 185, 253, 0.08) 0%, transparent 65%);
  z-index: 0;
  pointer-events: none;
}

.section-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 4rem;
  font-weight: 900;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 5px 15px rgba(15, 185, 253, 0.2);
  letter-spacing: -0.02em;
  transform-style: preserve-3d;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 8rem;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0) 0%, 
    rgba(15, 185, 253, 0.7) 50%, 
    rgba(15, 185, 253, 0) 100%);
  border-radius: 2px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  perspective: 1000px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.distribution-card {
  padding: 2.5rem 2rem;
  text-align: center;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
  transform-style: preserve-3d;
  transform: translateZ(0);
  width: 100%;
  box-sizing: border-box;
}

.distribution-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    rgba(15, 185, 253, 0.05) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: all 0.5s ease;
}

.distribution-card::after {
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

.distribution-card:hover {
  transform: translateY(-10px) rotateX(2deg) rotateY(2deg) translateZ(10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 25px 50px rgba(15, 185, 253, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05);
}

.distribution-card:hover::before {
  opacity: 1;
}

.distribution-card:hover::after {
  transform: translateY(100%) translateX(100%) rotate(45deg);
  transition: transform 0.8s ease;
}

.distribution-icon {
  width: 90px;
  height: 90px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.2) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(20px);
  z-index: 1;
}

.distribution-icon::before {
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

.distribution-icon i {
  font-size: 2.5rem;
  color: var(--color-primary);
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transition: all 0.4s ease;
  transform: translateZ(5px);
}

.distribution-card:hover .distribution-icon {
  transform: scale(1.1) translateZ(30px);
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.15) 0%,
    rgba(15, 185, 253, 0.25) 100%
  );
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 0 30px rgba(15, 185, 253, 0.15),
    0 0 12px rgba(15, 185, 253, 0.1);
}

.distribution-card:hover .distribution-icon::before {
  opacity: 1;
}

.distribution-card:hover .distribution-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  transform: translateZ(15px);
}

.distribution-content {
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

.distribution-content h3 {
  font-size: 1.4rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  transform: translateZ(10px);
}

.distribution-content .percentage {
  font-size: 3rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  font-weight: 900;
  transition: all 0.3s ease;
  transform: translateZ(15px);
}

.distribution-content .amount {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  transform: translateZ(10px);
}

.distribution-content .description {
  font-size: 1rem;
  color: var(--color-text-tertiary);
  line-height: 1.6;
  transition: all 0.3s ease;
  transform: translateZ(5px);
}

.distribution-card:hover .distribution-content h3 {
  color: var(--color-primary);
}

.distribution-card:hover .distribution-content .percentage {
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transform: translateZ(20px);
}

.distribution-card:hover .distribution-content .description {
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .distribution-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2.25rem;
    margin-bottom: 2.5rem;
  }
  
  .distribution-section {
    padding: 5rem 1.5rem 4rem;
  }
  
  .distribution-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .distribution-card {
    padding: 2rem 1.5rem;
  }
  
  .distribution-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1.5rem;
  }
  
  .distribution-icon i {
    font-size: 2rem;
  }
  
  .distribution-content .percentage {
    font-size: 2.5rem;
  }
  
  .distribution-content .amount {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
}

/* Enhanced Mobile Styles for Distribution Section */
@media (max-width: 768px) {
  .distribution-section {
    padding: 4rem 1.5rem;
    margin-top: 0;
  }
  
  .section-title {
    font-size: 2.25rem;
    margin-bottom: 3rem;
    padding: 0 1rem;
  }
  
  .distribution-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .distribution-card {
    /* Create card-based layout for mobile */
    transform: none !important;
    padding: 2.5rem 1.5rem;
    border-radius: 16px;
    box-shadow: 
      0 15px 35px rgba(0, 0, 0, 0.08),
      0 5px 15px rgba(0, 0, 0, 0.05);
    max-width: 400px;
    margin: 0 auto;
    
    /* Add smooth entrance animation */
    opacity: 0;
    animation: slideInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .distribution-card:nth-child(1) { animation-delay: 0.1s; }
  .distribution-card:nth-child(2) { animation-delay: 0.2s; }
  .distribution-card:nth-child(3) { animation-delay: 0.3s; }
  .distribution-card:nth-child(4) { animation-delay: 0.4s; }
  
  @keyframes slideInUp {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .distribution-icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
  }
  
  .distribution-content h3 {
    font-size: 1.6rem;
  }
  
  .distribution-content .percentage {
    font-size: 2.75rem;
  }
  
  .distribution-content .amount {
    font-size: 1.25rem;
    opacity: 0.9;
  }
  
  .distribution-content .description {
    font-size: 1rem;
    line-height: 1.5;
    margin-top: 0.5rem;
  }
  
  /* Enhance focus states for mobile touch interactions */
  .distribution-card:active {
    background: linear-gradient(145deg,
      rgba(15, 185, 253, 0.08) 0%,
      rgba(15, 185, 253, 0.12) 100%
    );
    border-color: rgba(15, 185, 253, 0.35);
    transform: scale(0.98) !important;
    transition: all 0.3s ease;
  }
}

/* Governance Section Styles */
.governance-section {
  padding: 1rem 2rem 4rem;
  margin-top: -4rem;
  z-index: 1;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.governance-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  padding: 0.5rem;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: var(--weight-black);
}

.governance-card {
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: visible;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.5rem;
}

.governance-card::before {
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

.governance-card:hover {
  transform: translateY(-8px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 12px 30px rgba(15, 185, 253, 0.15);
  z-index: 2;
}

.governance-card:hover::before {
  opacity: 1;
}

.governance-icon {
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

.governance-icon i {
  font-size: 1.75rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.governance-card:hover .governance-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

.governance-card:hover .governance-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.governance-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
  position: relative;
  transform-style: preserve-3d;
  width: 100%;
  box-sizing: border-box;
}

.governance-content h3 {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: var(--weight-bold);
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.governance-content .requirement {
  font-size: 1.5rem;
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  line-height: 1.4;
  margin-bottom: 0.75rem;
  transform: translateZ(5px);
  transition: all 0.3s ease;
}

.governance-content .description {
  font-size: 1rem;
  font-weight: var(--weight-normal);
  color: var(--color-text-tertiary);
  line-height: 1.5;
  margin-bottom: 0;
  transition: all 0.3s ease;
}

.governance-list {
  list-style: none;
  padding-left: 0;
  margin-top: auto;
  text-align: left;
  transform-style: preserve-3d;
}

.governance-list li {
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1.5rem;
  font-size: 0.95rem;
  color: var(--color-text-tertiary);
  transition: all 0.3s ease;
  transform: translateZ(2px);
}

.governance-list li::before {
  content: '•';
  position: absolute;
  left: 0.4rem;
  color: var(--color-primary);
  font-size: 1.2rem;
  line-height: 1;
  text-shadow: 0 0 5px rgba(15, 185, 253, 0.2);
  transition: all 0.3s ease;
}

.governance-card:hover .governance-content h3 {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.governance-card:hover .governance-content p {
  color: var(--color-text-primary);
}

.governance-card:hover .governance-list li {
  color: var(--color-text-secondary);
  transform: translateZ(5px);
}

.governance-card:hover .governance-list li::before {
  color: var(--color-primary-light);
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.7);
  transform: scale(1.2);
}

/* Enhanced Mobile Styles for Governance Section */
@media (max-width: 768px) {
  .governance-section {
    padding: 4rem 1rem 3rem;
  }
  
  .governance-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0.5rem;
  }
  
  .governance-card {
    max-width: 100%;
    margin: 0 auto 1rem;
    padding: 1.25rem;
    overflow: visible;
  }
  
  .governance-content h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .governance-content .requirement {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  .governance-content .description {
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  .governance-card:active {
    transform: scale(0.98);
    background: linear-gradient(145deg,
      rgba(15, 185, 253, 0.08) 0%,
      rgba(15, 185, 253, 0.12) 100%
    );
    border-color: rgba(15, 185, 253, 0.25);
  }
}

/* Stakeholder Rights Section Styles - Desktop */
.stakeholder-section {
  padding: 2rem 2rem 4rem;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.stakeholder-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 70%, rgba(15, 185, 253, 0.08) 0%, transparent 60%);
  z-index: 0;
  pointer-events: none;
}

.stakeholder-section .section-title {
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
  transition: all 0.4s ease;
  margin-bottom: 2.5rem;
}

.rights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.rights-card {
  padding: 2.5rem 2rem;
  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.06) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  width: 100%;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.rights-card::before {
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
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.rights-card::after {
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

.rights-card:hover {
  transform: translateY(-6px) rotateX(2deg) rotateY(1deg);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow:
    0 15px 35px rgba(15, 185, 253, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.07);
}

.rights-card:hover::before {
  opacity: 1;
  transform: scale(1.05);
}

.rights-card:hover::after {
  transform: translateY(100%) translateX(100%) rotate(45deg);
  transition: transform 0.8s ease;
}

.rights-icon {
  width: 96px;
  height: 96px;
  margin: 0 auto .5rem;
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

.rights-icon::before {
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

.rights-icon i {
  font-size: 3rem;
  color: var(--color-primary);
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transition: all 0.4s ease;
  transform: translateZ(10px);
}

.rights-card:hover .rights-icon {
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

.rights-card:hover .rights-icon::before {
  opacity: 1;
}

.rights-card:hover .rights-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  transform: translateZ(20px);
}

.rights-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  z-index: 1;
  position: relative;
  transform-style: preserve-3d;
  width: 100%;
  box-sizing: border-box;
}

.rights-content h3 {
  font-size: 2rem;
  margin-bottom: .5rem;
  font-weight: var(--weight-bold);
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.rights-content p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.1;
  transform: translateZ(5px);
  transition: all 0.3s ease;
}

.rights-list {
  list-style: none;
  padding-left: 0;
  margin-top: auto;
  text-align: left;
  transform-style: preserve-3d;
}

.rights-list li {
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1.5rem;
  font-size: 0.85rem;
  color: rgb(122, 242, 255);
  transition: all 0.3s ease;
  transform: translateZ(2px);
}

.rights-list li::before {
  content: '•';
  position: absolute;
  left: 0.4rem;
  color: var(--color-primary);
  font-size: 1.2rem;
  line-height: 1;
  text-shadow: 0 0 5px rgba(15, 185, 253, 0.2);
  transition: all 0.3s ease;
}

.rights-card:hover .rights-content h3 {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.rights-card:hover .rights-content p {
  color: var(--color-text-primary);
}

.rights-card:hover .rights-list li {
  color: var(--color-text-secondary);
  transform: translateZ(5px);
}

.rights-card:hover .rights-list li::before {
  color: var(--color-primary-light);
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.7);
  transform: scale(1.2);
}

/* Mobile Stakeholder Rights styling */
@media (max-width: 768px) {
  .stakeholder-section {
    padding: 3rem 1rem;
    position: relative;
    overflow: hidden;
    margin: 2rem 1rem;
    width: auto;
  }
  
  .rights-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0;
    margin: 0;
    width: 100%;
  }
  
  .rights-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 2rem 1.5rem;
    border-radius: 12px;
    transform: none !important;
    overflow: hidden;
    box-sizing: border-box;
    
    /* Add entrance animation */
    opacity: 0;
    animation: rightsFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .rights-card:nth-child(1) { animation-delay: 0.1s; }
  .rights-card:nth-child(2) { animation-delay: 0.2s; }
  .rights-card:nth-child(3) { animation-delay: 0.3s; }
  .rights-card:nth-child(4) { animation-delay: 0.4s; }
  
  @keyframes rightsFadeIn {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .rights-icon {
    width: 60px;
    height: 60px;
    margin: 0 auto 1.5rem;
  }
  
  .rights-content {
    text-align: center;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .rights-content h3 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    width: 100%;
    max-width: 100%;
    padding: 0 0.5rem;
    box-sizing: border-box;
  }
  
  .rights-content p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;
    padding: 0 0.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .rights-list {
    text-align: left;
    padding: 0 1rem;
    margin: 1rem 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    list-style-position: inside;
  }
  
  .rights-list li {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
    position: relative;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.4;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    text-indent: -1.5rem;
    padding-right: 0.5rem;
  }
  
  .rights-list li::before {
    content: '•';
    position: relative;
    left: 0;
    margin-right: 0.5rem;
    color: var(--color-primary);
  }
  
  /* Touch interaction */
  .rights-card:active {
    background: rgba(15, 185, 253, 0.08);
    border-color: rgba(15, 185, 253, 0.25);
    transform: scale(0.98) !important;
    transition: all 0.3s ease;
  }
}

/* Proposals Section Styles */
.proposals-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.proposals-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.proposals-grid {
  display: grid;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .proposals-section {
    padding: 4rem 1rem 2rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .proposals-container {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposals-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposal-card {
    padding: 1.5rem 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .proposals-section {
    padding: 3rem 0.5rem 1.5rem;
  }
  
  .proposals-container {
    padding: 1rem;
    margin: 0.5rem;
    width: calc(100% - 1rem);
  }
  
  .proposal-card {
    padding: 1.25rem 0.75rem;
  }
}

/* Join Section Styles */
.join-section {
  padding: 2rem 2rem;

  text-align: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.03) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.1);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.join-buttons .cosmic-button i {
  font-size: 1.5rem; /* Bigger icon */
  margin-right: 1rem; /* Add gap between icon and text */
  transition: all 0.3s ease;
}

.join-buttons .cosmic-button:hover i {
  transform: scale(1.2);
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
    padding: 0.9rem 1.5rem;
    font-size: 1rem;
    width: 100%;
    min-width: 0; /* Override min-width on mobile */
    max-width: 100%; /* Allow full width of container */
  }
  
  .join-buttons .cosmic-button i {
    font-size: 1.4rem;
    margin-right: 0.8rem;
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
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
  transform: translateZ(20px);
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
  padding: 2rem;
  margin: 0 auto;
  max-width: 1200px;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.06) 0%,
    rgba(15, 185, 253, 0.1) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.power-multipliers h3 {
  font-size: 2.25rem;
  margin-bottom: 3rem;
  text-align: center;
  color: var(--cosmic-text-primary);
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.multiplier-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;
}

.multiplier-card {
  padding: 2rem;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  transform-style: preserve-3d;
  position: relative;
}

.multiplier-card:hover {
  transform: translateY(-5px) translateZ(0);
  box-shadow: 0 12px 30px rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.3);
}

.multiplier-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.multiplier-header i {
  font-size: 2.5rem;
  color: var(--cosmic-blue);
  margin-bottom: 1.5rem;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.2) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 
    0 15px 30px rgba(15, 185, 253, 0.1),
    0 8px 15px rgba(0, 0, 0, 0.05);
}

.multiplier-header h4 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.multiplier-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.multiplier-content .bonus {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--cosmic-blue);
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.multiplier-content .time {
  font-size: 1.4rem;
  color: var(--cosmic-text-secondary);
  margin: 0;
  transition: all 0.3s ease;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .power-multipliers {
    padding: 1.5rem;
    margin: 0 1rem;
    width: calc(100% - 2rem);
  }

  .power-multipliers h3 {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }

  .multiplier-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0;
  }

  .multiplier-card {
    padding: 1.5rem;
  }

  .multiplier-header i {
    font-size: 2rem;
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
  }

  .multiplier-header h4 {
    font-size: 1.2rem;
  }

  .multiplier-content .bonus {
    font-size: 2.2rem;
  }

  .multiplier-content .time {
    font-size: 1.2rem;
  }
}

/* Small Mobile Devices */
@media (max-width: 480px) {
  .power-multipliers {
    padding: 1rem;
    margin: 0 0.5rem;
    width: calc(100% - 1rem);
  }

  .power-multipliers h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .multiplier-card {
    padding: 1.25rem;
  }

  .multiplier-header i {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }

  .multiplier-content .bonus {
    font-size: 2rem;
  }

  .multiplier-content .time {
    font-size: 1.1rem;
  }
}

/* Media queries for responsive design */
@media (max-width: 768px) {
  .governance-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .governance-card {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .power-multipliers {
    padding: 1.5rem;
    max-width: 400px;
    margin: 2rem auto 0;
  }
  
  .power-multipliers h3 {
    font-size: 1.75rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .multiplier-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .multiplier-card {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 100%;
    margin: 0 auto;
    
    /* Add smooth entrance animation */
    opacity: 0;
    animation: slideInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .multiplier-card:nth-child(1) { animation-delay: 0.1s; }
  .multiplier-card:nth-child(2) { animation-delay: 0.2s; }
  
  @keyframes slideInUp {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .multiplier-header {
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .multiplier-header i {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .multiplier-header h4 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .multiplier-content {
    width: 100%;
  }
  
  .multiplier-content .bonus {
    font-size: 2rem;
  }
  
  .multiplier-content .time {
    font-size: 1.1rem;
  }
  
  /* Enhance focus states for mobile touch interactions */
  .multiplier-card:active {
    background: linear-gradient(145deg,
      rgba(15, 185, 253, 0.08) 0%,
      rgba(15, 185, 253, 0.12) 100%
    );
    border-color: rgba(15, 185, 253, 0.35);
    transform: scale(0.98);
    transition: all 0.3s ease;
  }
  
  /* DAO Explainer Section Mobile Improvements */
  .explainer-pillar {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 100%;
    margin: 0 auto;
    
    /* Add smooth entrance animation */
    opacity: 0;
    animation: slideInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .explainer-pillar:nth-child(1) { animation-delay: 0.1s; }
  .explainer-pillar:nth-child(2) { animation-delay: 0.2s; }
  .explainer-pillar:nth-child(3) { animation-delay: 0.3s; }
  
  .pillar-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1rem;
  }
  
  .explainer-pillar h3 {
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .explainer-pillar p {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  /* Enhance focus states for mobile touch interactions */
  .explainer-pillar:active {
    background: linear-gradient(145deg,
      rgba(15, 185, 253, 0.08) 0%,
      rgba(15, 185, 253, 0.12) 100%
    );
    border-color: rgba(15, 185, 253, 0.35);
    transform: scale(0.98) !important;
    transition: all 0.3s ease;
  }
}

/* Enhanced Stats Overview Section Styles */
.stats-section {
  padding: 2rem 2rem 6rem;
  margin-top: -2rem;
  z-index: 2;
  position: relative;
  perspective: 1200px;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 70%, rgba(15, 185, 253, 0.08) 0%, transparent 65%);
  z-index: 0;
  pointer-events: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  perspective: 1000px;
}

.stats-card {
  padding: 2.5rem 2rem;
  text-align: center;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    rgba(15, 185, 253, 0.05) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: all 0.5s ease;
}

.stats-card::after {
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

.stats-card:hover {
  transform: translateY(-10px) rotateX(2deg) rotateY(2deg) translateZ(10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 25px 50px rgba(15, 185, 253, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05);
}

.stats-card:hover::before {
  opacity: 1;
}

.stats-card:hover::after {
  transform: translateY(100%) translateX(100%) rotate(45deg);
  transition: transform 0.8s ease;
}

.stats-icon {
  width: 90px;
  height: 90px;
  margin: 0 auto 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.2) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transform: translateZ(20px);
  z-index: 1;
}

.stats-icon::before {
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

.stats-icon i {
  font-size: 2.5rem;
  color: var(--color-primary);
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transition: all 0.4s ease;
  transform: translateZ(5px);
}

.stats-card:hover .stats-icon {
  transform: scale(1.1) translateZ(30px);
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.15) 0%,
    rgba(15, 185, 253, 0.25) 100%
  );
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 
    0 0 30px rgba(15, 185, 253, 0.15),
    0 0 12px rgba(15, 185, 253, 0.1);
}

.stats-card:hover .stats-icon::before {
  opacity: 1;
}

.stats-card:hover .stats-icon i {
  color: var(--color-primary-light);
  text-shadow: 0 0 20px rgba(15, 185, 253, 0.5);
  transform: translateZ(15px);
}

.stats-content {
  position: relative;
  z-index: 1;
  transform-style: preserve-3d;
}

.stats-content .value {
  font-size: 3rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  font-weight: 900;
  transition: all 0.3s ease;
  transform: translateZ(15px);
}

.stats-content .label {
  font-size: 1.4rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  transform: translateZ(10px);
}

.stats-content .description {
  font-size: 1rem;
  color: var(--color-text-tertiary);
  line-height: 1.6;
  transition: all 0.3s ease;
  transform: translateZ(5px);
}

.stats-card:hover .stats-content .value {
  text-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  transform: translateZ(20px);
}

.stats-card:hover .stats-content .label {
  color: var(--color-primary);
  transform: translateZ(15px);
}

.stats-card:hover .stats-content .description {
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .stats-section {
    padding: 5rem 1.5rem 4rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .stats-card {
    padding: 2rem 1.5rem;
  }
  
  .stats-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1.5rem;
  }
  
  .stats-icon i {
    font-size: 2rem;
  }
  
  .stats-content .value {
    font-size: 2.5rem;
  }
  
  .stats-content .label {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
  
  .stats-content .description {
    font-size: 0.95rem;
  }
}

/* Mobile Enhancements for Hero/Headline Section */
@media (max-width: 768px) {
  .headline {
    min-height: auto;
    padding: 6rem 1.5rem 8rem;
  }
  
  .headline .content {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0;
  }
  
  .headline .hero-logo {
    width: 80%;
    max-width: 280px;
    margin: 0 auto;
    grid-row: 1;
  }
  
  .headline .dao-image {
    width: 90%;
    max-width: 320px;
    margin: 0 auto;
    grid-row: 2;
  }
  
  .headline .primary-headline {
    font-size: 2.75rem;
    margin-bottom: 1rem;
    line-height: 1.2;
    text-align: center;
    grid-row: 3;
  }
  
  .headline .cta-subtext {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
    text-align: center;
    grid-row: 4;
  }
  
  .headline .cta-buttons-container {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
    grid-row: 5;
  }
  
  .headline .cta-button {
    width: 100%;
    padding: 1rem;
    justify-content: center;
  }
  
  /* Enhanced entrance animations for mobile */
  @keyframes mobileEntrance {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .headline .primary-headline,
  .headline .cta-subtext,
  .headline .cta-buttons-container,
  .headline .hero-logo,
  .headline .dao-image {
    animation: mobileEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    opacity: 0;
  }
  
  .headline .hero-logo {
    animation-delay: 0.1s;
  }
  
  .headline .dao-image {
    animation-delay: 0.3s;
  }
  
  .headline .primary-headline {
    animation-delay: 0.5s;
  }
  
  .headline .cta-subtext {
    animation-delay: 0.7s;
  }
  
  .headline .cta-buttons-container {
    animation-delay: 0.9s;
  }
}

/* Enhanced Mobile Styles for Stats Section */
@media (max-width: 768px) {
  .stats-section {
    padding: 4rem 1.5rem;
    margin-top: 0;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .stats-card {
    /* Create modern card-based layout for mobile */
    display: flex;
    flex-direction: column;
    max-width: 400px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
    border-radius: 16px;
    
    /* Add smooth entrance animation */
    opacity: 0;
    animation: statsCardIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    
    /* Reset hover effects for touch */
    transform: none !important;
  }
  
  .stats-card:nth-child(1) { animation-delay: 0.1s; }
  .stats-card:nth-child(2) { animation-delay: 0.2s; }
  .stats-card:nth-child(3) { animation-delay: 0.3s; }
  .stats-card:nth-child(4) { animation-delay: 0.4s; }
  
  @keyframes statsCardIn {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .stats-icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
  }
  
  .stats-icon i {
    font-size: 2rem;
  }
  
  .stats-content {
    text-align: center;
  }
  
  .stats-content .value {
    font-size: 2.75rem;
  }
  
  .stats-content .label {
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
  }
  
  .stats-content .description {
    font-size: 1rem;
    line-height: 1.5;
  }
  
  /* Enhance focus states for mobile touch interactions */
  .stats-card:active {
    background: linear-gradient(145deg,
      rgba(15, 185, 253, 0.07) 0%,
      rgba(15, 185, 253, 0.11) 100%
    );
    border-color: rgba(15, 185, 253, 0.35);
    transform: scale(0.98) !important;
    transition: all 0.3s ease;
  }
  
  .stats-card:active .stats-icon {
    transform: scale(1.05) !important;
    transition: all 0.3s ease;
  }
}

/* Enhanced Mobile Styles for Staking Benefits Section */
@media (max-width: 768px) {
  .staking-section {
    padding: 4rem 1.5rem;
    margin-top: 2rem;
  }
  
  .staking-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  /* Staking Info */
  .staking-info {
    text-align: center;
    padding: 1rem;
  }
  
  .staking-info h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .staking-info > p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Benefits Grid */
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .benefit-item {
    /* Create card-based UI for benefits */
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    background: rgba(15, 185, 253, 0.05);
    border: 1px solid rgba(15, 185, 253, 0.15);
    
    /* Add subtle animation */
    transform: translateX(0);
    transition: all 0.3s ease;
  }
  
  .benefit-item:active {
    background: rgba(15, 185, 253, 0.1);
    transform: scale(0.98);
  }
  
  .benefit-icon {
    width: 50px;
    height: 50px;
    margin: 0 1.25rem 0 0;
    flex-shrink: 0;
  }
  
  .benefit-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .benefit-content h4 {
    font-size: 1.1rem;
    margin-bottom: 0;
    flex: 1;
  }
  
  .benefit-content .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    white-space: nowrap;
  }
  
  /* Power Multipliers */
  .power-multipliers {
    padding: 2rem 1.5rem;
    margin-top: 1rem;
  }
  
  .power-multipliers h3 {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .multiplier-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.25rem;
    justify-content: center;
  }
  
  .multiplier-card {
    padding: 1.5rem;
    text-align: center;
  }
  
  .multiplier-header {
    margin-bottom: 1rem;
  }
  
  .multiplier-header i {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
  
  .multiplier-header h4 {
    font-size: 1.2rem;
  }
  
  .multiplier-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .multiplier-content .bonus {
    font-size: 2rem;
  }
  
  .multiplier-content .time {
    font-size: 1rem;
    opacity: 0.8;
  }
}

/* Enhanced Mobile Styles for Stakeholder Rights Section */
@media (max-width: 768px) {
  .stakeholder-section {
    padding: 4rem 1.5rem;
    margin-top: 2rem;
  }
  
  /* Convert horizontal scroll to vertical stack for better mobile UX */
  .rights-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0.5rem 0;
    overflow: visible;
    -webkit-overflow-scrolling: auto;
    scroll-snap-type: none;
    margin: 0;
  }
  
  .rights-card {
    min-width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    border-radius: 16px;
    transform: none !important;
    
    /* Add entrance animation */
    opacity: 0;
    animation: rightsFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .rights-card:nth-child(1) { animation-delay: 0.1s; }
  .rights-card:nth-child(2) { animation-delay: 0.2s; }
  .rights-card:nth-child(3) { animation-delay: 0.3s; }
  .rights-card:nth-child(4) { animation-delay: 0.4s; }
  
  @keyframes rightsFadeIn {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .rights-icon {
    margin: 0 auto 1.5rem;
    width: 60px;
    height: 60px;
  }
  
  .rights-content {
    text-align: center;
  }
  
  .rights-content h3 {
    font-size: 1.6rem;
    margin-bottom: 0.75rem;
    text-align: center;
  }
  
  .rights-content p {
    font-size: 1.05rem;
    text-align: center;
    margin-bottom: 1.25rem;
  }
  
  .rights-list {
    text-align: left;
    padding-left: 1rem;
  }
  
  .rights-list li {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
  
  /* Remove scroll indicator as we're now using vertical layout */
  .scroll-indicator {
    display: none;
  }
  
  /* Touch interaction */
  .rights-card:active {
    background: rgba(15, 185, 253, 0.08);
    border-color: rgba(15, 185, 253, 0.25);
    transform: scale(0.98) !important;
    transition: all 0.3s ease;
  }
}

/* Enhanced Mobile Styles for Proposals Section */
@media (max-width: 768px) {
  .proposals-section {
    padding: 4rem 1.5rem;
    margin-top: 2rem;
  }
  
  .proposals-header {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    text-align: center;
  }
  
  .proposals-header h2 {
    font-size: 2.25rem;
    margin-bottom: 0;
  }
  
  .proposals-header h2::after {
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
  }
  
  .proposals-header a {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
  
  .proposals-grid {
    gap: 2.5rem;
  }
  
  .proposal-card {
    margin: 0 auto;
    padding: 1.75rem 1.5rem;
    max-width: 500px;
    transform: none !important;
  }
  
  .proposal-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .proposal-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .proposal-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  
  .proposal-summary {
    font-size: 1.05rem;
    margin-bottom: 1.75rem;
  }
  
  .progress-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .votes-count {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .vote-for, .vote-against {
    font-size: 1.05rem;
  }
  
  .progress-bar {
    margin-bottom: 1rem;
  }
  
  .time-remaining {
    margin-bottom: 1.5rem;
  }
  
  .proposal-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .vote-button {
    width: 100%;
    padding: 1rem;
  }
  
  /* Touch interaction */
  .proposal-card:active {
    background: rgba(15, 185, 253, 0.06);
    border-color: rgba(15, 185, 253, 0.25);
    transform: scale(0.99) !important;
    transition: all 0.3s ease;
  }
  
  .vote-button:active {
    transform: scale(0.98) !important;
    transition: all 0.2s ease;
  }
}

/* Enhanced Mobile Styles for Join CTA Section */
@media (max-width: 768px) {
  .join-section {
    padding: 4rem 1.5rem;
    margin-top: 2rem;
  }
  
  .join-container {
    padding: 2.5rem 1.5rem;
    border-radius: 16px;
  }
  
  .join-content h2 {
    font-size: 2.5rem;
    line-height: 1.2;
    margin-bottom: 1rem;
  }
  
  .join-content p {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    padding: 0 0.5rem;
  }
  
  .join-stats {
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2.5rem;
  }
  
  .stat-item {
    /* Create a card-like appearance for stats */
    background: rgba(15, 185, 253, 0.05);
    border: 1px solid rgba(15, 185, 253, 0.15);
    border-radius: 12px;
    padding: 1.5rem;
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
    
    /* Add subtle hover/active effect */
    transition: all 0.3s ease;
  }
  
  .stat-item:active {
    transform: scale(0.98) translateY(0) !important;
    background: rgba(15, 185, 253, 0.1);
  }
  
  .stat-item .value {
    font-size: 2.5rem;
  }
  
  .stat-item .label {
    font-size: 1rem;
  }
  
  .join-buttons {
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .join-button {
    width: 100%;
    padding: 1.1rem 1rem;
    font-size: 1.05rem;
    justify-content: center;
  }
  
  /* Improve button touch feedback */
  .join-button:active {
    transform: scale(0.98) !important;
  }
}

/* Enhanced Mobile Styles for CSS Showcase Section */
@media (max-width: 768px) {
  .cosmic-showcase-section {
    padding: 4rem 1.5rem;
  }
  
  .showcase-title {
    font-size: 2.25rem;
  }
  
  .showcase-description {
    font-size: 1.1rem;
    margin-bottom: 3rem;
  }
  
  .showcase-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .showcase-item {
    max-width: 350px;
    margin: 0 auto;
    /* Add entrance animation */
    opacity: 0;
    animation: showcaseItemIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .showcase-item:nth-child(1) { animation-delay: 0.1s; }
  .showcase-item:nth-child(2) { animation-delay: 0.2s; }
  .showcase-item:nth-child(3) { animation-delay: 0.3s; }
  .showcase-item:nth-child(4) { animation-delay: 0.4s; }
  .showcase-item:nth-child(5) { animation-delay: 0.5s; }
  .showcase-item:nth-child(6) { animation-delay: 0.6s; }
  
  @keyframes showcaseItemIn {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .cosmic-portal, 
  .cosmic-orb, 
  .floating-island {
    transform: scale(0.9);
  }
  
  .cosmic-particles {
    height: 300px;
  }
  
  .particles-content {
    padding-top: 100px;
  }
  
  .particles-content h2 {
    font-size: 2rem;
  }
  
  .particles-content p {
    font-size: 1rem;
  }
  
  /* Optimized touch interactions */
  .liquid-button:active {
    transform: scale(0.95) !important;
  }
  
  .holo-card {
    height: 380px;
  }
}

/* Add a page-level smooth scroll for better mobile UX */
@media (max-width: 768px) {
  html {
    scroll-behavior: smooth;
  }
  
  /* Add scroll margin for better section navigation */
  section {
    scroll-margin-top: 70px;
  }
  
  /* Add subtle scroll reveal animation for all sections */
  @keyframes sectionReveal {
    from { 
      opacity: 0.6;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  section {
    animation: sectionReveal 0.6s ease-out forwards;
    opacity: 0.6;
  }
}

/* Enhanced Mobile Styles for Hero Section */
@media (max-width: 768px) {
  .headline {
    min-height: 100vh;
    padding: 4rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .content {
    width: 100%;
    max-width: 100%;
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
  }

  .hero-logo {
    width: 140px;
    max-width: 140px;
    height: auto;
    margin-bottom: -2rem;
    transform: translateZ(10px);
  }

  .dao-image {
    width: 200px;
    max-width: 200px;
    height: auto;
    margin-bottom: -2rem;
    transform: translateZ(20px);
  }

  .primary-headline {
    font-size: calc(2rem + 2vw);
    line-height: 1.2;
    margin: 0;
    padding: 0 0.5rem;
    width: 100%;
    text-align: center;
    transform: translateZ(15px);
  }

  .cta-subtext {
    font-size: calc(1rem + 1vw);
    margin: 0.5rem 0 1rem;
    padding: 0 1rem;
    width: 100%;
    text-align: center;
    transform: translateZ(10px);
  }

  .cta-buttons-container {
    flex-direction: column;
    width: 100%;
    max-width: 280px;
    gap: 1rem;
    margin-top: 1.5rem;
    padding: 0;
  }

  .cta-button {
    width: 100%;
    padding: 0.9rem 1.5rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transform: none !important;
  }

  /* Adjust entrance animations for mobile */
  @keyframes mobileHeroFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) translateZ(var(--z-depth));
    }
    to {
      opacity: 1;
      transform: translateY(0) translateZ(var(--z-depth));
    }
  }

  .hero-logo {
    --z-depth: 10px;
    animation: mobileHeroFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
  }

  .dao-image {
    --z-depth: 20px;
    animation: mobileHeroFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards;
  }

  .primary-headline {
    --z-depth: 15px;
    animation: 
      mobileHeroFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s forwards,
      gradientFlow 8s linear infinite,
      cosmicPulse 4s ease-in-out infinite;
  }

  .cta-subtext {
    --z-depth: 10px;
    animation: mobileHeroFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.7s forwards;
  }

  .cta-buttons-container .cta-button {
    --z-depth: 5px;
    animation: mobileHeroFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) var(--delay) forwards;
  }

  .cta-buttons-container .cta-button:first-child {
    --delay: 0.9s;
  }

  .cta-buttons-container .cta-button:last-child {
    --delay: 1.1s;
  }

  /* Optimize floating animation for mobile */
  @keyframes mobileFloat {
    0% { transform: translateZ(20px) translateY(0); }
    50% { transform: translateZ(20px) translateY(-8px); }
    100% { transform: translateZ(20px) translateY(0); }
  }

  .dao-image {
    animation: 
      mobileHeroFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards,
      mobileFloat 4s ease-in-out infinite;
  }

  /* Adjust glow effects for better mobile performance */
  .hero-logo {
    filter: none;
  }

  .dao-image {
    filter: none;
  }

  .primary-headline {
    text-shadow: 
      0 0 15px rgba(15, 185, 253, 0.2),
      0 0 30px rgba(15, 185, 253, 0.1);
  }

  /* Ensure content stays within viewport */
  .cosmic-background,
  .global-starfield {
    height: 100%;
    position: fixed;
  }
}

/* Additional optimization for very small screens */
@media (max-width: 380px) {
  .headline {
    padding: 3rem 0.5rem;
  }

  .hero-logo {
    width: 120px;
    margin-bottom: -1.5rem;
  }

  .dao-image {
    width: 180px;
    margin-bottom: -1.5rem;
  }

  .primary-headline {
    font-size: calc(1.75rem + 2vw);
  }

  .cta-subtext {
    font-size: calc(0.9rem + 1vw);
  }

  .cta-buttons-container {
    max-width: 250px;
  }

  .cta-button {
    padding: 0.8rem 1.25rem;
    font-size: 0.9rem;
  }
}

/* Ensure proper stacking context and hardware acceleration */
.headline * {
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Performance optimizations for animations */
.hero-logo, .dao-image, .primary-headline, .cta-subtext, .cta-buttons-container {
  will-change: transform;
  backface-visibility: hidden;
}

/* Optimize animations with hardware acceleration */
.distribution-card:hover, .governance-card:hover, .stat-card:hover, 
.rights-card:hover, .proposal-card:hover, .multiplier-card:hover {
  transform: translateY(-4px) translateZ(0);
  will-change: transform, box-shadow;
}

/* Optimize transitions */
.cta-button, .cosmic-button, .join-button {
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), 
              background 0.3s ease, 
              box-shadow 0.3s ease;
  will-change: transform, background, box-shadow;
}

/* Add print styles for better accessibility */
@media print {
  .dao-page {
    background: white !important;
    color: black !important;
  }
  
  .headline, .distribution-section, .governance-section,
  .stats-overview, .staking-section, .stakeholder-section,
  .proposals-section, .join-section {
    page-break-inside: avoid;
    background: white !important;
    color: black !important;
    margin: 20px 0;
    padding: 20px 0;
    border-bottom: 1px solid #ccc;
  }
  
  .cta-buttons-container, .join-buttons, .proposal-actions {
    display: none !important;
  }
}

/* Optimize for reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .hero-logo, .dao-image, .primary-headline, .cta-subtext {
    transform: none !important;
  }
  
  @keyframes float {
    0%, 50%, 100% { transform: translateY(0px); }
  }
  
  @keyframes sectionReveal {
    from, to { opacity: 1; transform: none; }
  }
}

/* DAO Explainer Section Styles */
.dao-explainer-section {
  padding: 2rem 2rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.explainer-container {
  padding: 3rem;
  border-radius: 12px;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.04) 0%,
    rgba(15, 185, 253, 0.01) 100%
  );
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .dao-explainer-section {
    padding: 4rem 1rem 2rem;
    width: 100%;
  }
  
  .explainer-container {
    padding: 2rem 1.5rem;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dao-explainer-section {
    padding: 3rem 0.5rem 1.5rem;
  }
  
  .explainer-container {
    padding: 1.5rem 1rem;
    border-radius: 8px;
  }
}

/* Animation Keyframes for Cosmic Background */
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

@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translate(5px, -5px) scale(1.5);
    opacity: 0.8;
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

@keyframes orbitEffect {
  0% {
    transform: rotate(0deg) translateX(0) scale(1);
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: rotate(360deg) translateX(50px) scale(1.2);
    opacity: 0.4;
  }
}

@keyframes pulseBackground {
  0% {
    opacity: 0.3;
    transform: scale(0.9) translateX(0);
  }
  100% {
    opacity: 0.5;
    transform: scale(1.1) translateX(-30px);
  }
}

@keyframes portalPulse {
  0% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes portalRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes portalStarPulse {
  0% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.3);
  }
}

@keyframes portalGlowPulse {
  0% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes portalCorePulse {
  0% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes rotateGrid {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shieldPulse {
  0% {
    opacity: 0.3;
    transform: scale(0.95);
  }
  100% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes dataPointScan {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes logoBreathing {
  0%, 100% {
    opacity: 0.15;
    filter: drop-shadow(0 0 15px rgba(15, 185, 253, 0.8)) 
            drop-shadow(0 0 30px rgba(15, 185, 253, 0.5))
            brightness(1.2) contrast(1.1) hue-rotate(0deg);
    transform: scale(1);
  }
  25% {
    opacity: 0.2;
    filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.9)) 
            drop-shadow(0 0 40px rgba(15, 185, 253, 0.6))
            brightness(1.4) contrast(1.2) hue-rotate(5deg);
    transform: scale(1.02);
  }
  50% {
    opacity: 0.12;
    filter: drop-shadow(0 0 12px rgba(15, 185, 253, 0.7)) 
            drop-shadow(0 0 25px rgba(15, 185, 253, 0.4))
            brightness(1.1) contrast(1) hue-rotate(-3deg);
    transform: scale(0.98);
  }
  75% {
    opacity: 0.22;
    filter: drop-shadow(0 0 25px rgba(15, 185, 253, 1)) 
            drop-shadow(0 0 50px rgba(15, 185, 253, 0.7))
            brightness(1.5) contrast(1.3) hue-rotate(3deg);
    transform: scale(1.03);
  }
}

.dao-hero {
  position: relative;
  overflow: hidden;
  padding: 0;
  background-color: transparent;
  color: var(--cosmic-text-primary);
  text-align: center;
  z-index: 1;
  height: 100vh;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 183, 255, 0.151);
  box-shadow: 0 0 12px rgba(0, 238, 255, 0.205);
  justify-content: center;
  width: 100%;
  outline: none;
}

.content-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: none;
}

.hero-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  position: relative;
}

.hero-image-wrapper {
  margin-bottom: -6rem; /* Increased overlap */
  position: relative;
  z-index: 3;
  transform: translateY(2rem); /* Move down slightly */
}

.hero-emblem {
  max-width: 16rem;
  will-change: transform, filter;
  opacity: 0;
  filter: none;
  animation: scaleIn 0.7s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.1s forwards;
  transition: filter 0.3s ease;
}

.dao-image-wrapper {
  margin-top: 1.25rem;
  margin-bottom: -4rem; /* Reduced to bring text closer */
  position: relative;
  z-index: 2;
  transform: translateY(-2rem); /* Move up to overlap */
}

.dao-image {
  max-width: 12rem;
  filter: none;
  will-change: transform, filter;
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.3s forwards;
  transition: filter 0.5s ease;
}

.hero-title {
  font-size: 3rem;
  margin: 0.5rem 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  z-index: 1;
  background: linear-gradient(
    135deg,
    var(--cosmic-highlight-1) 0%,
    var(--cosmic-highlight-2) 50%,
    var(--cosmic-highlight-1) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  text-shadow: var(--cosmic-font-glow);
  animation: textGradientShift 8s ease infinite;
  transform: translateY(-1rem);
}

.hero-subtitle {
  font-size: 1.75rem;
  margin: 0.5rem 0 2rem;
  font-weight: 500;
  color: var(--cosmic-text-secondary);
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.17, 0.67, 0.3, 1.33) 0.6s forwards;
  transform: translateY(-0.5rem); /* Move up slightly */
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  transform: translateY(-0.5rem); /* Move up slightly */
}

/* Fix floating elements positioning */
.hero-floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(15, 185, 253, 0.08) 0%, 
    rgba(15, 185, 253, 0.03) 70%,
    transparent 100%
  );
  filter: blur(15px);
  opacity: 0.2;
  animation: floatShape 15s infinite ease-in-out;
}

.shape-1 {
  top: 15%;
  right: 15%;
  animation-delay: 0s;
}

.shape-2 {
  bottom: 25%;
  left: 10%;
  width: 120px;
  height: 120px;
  animation-delay: -5s;
}

.shape-3 {
  top: 40%;
  right: 25%;
  width: 100px;
  height: 100px;
  animation-delay: -10s;
}

@keyframes floatShape {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-20px, 20px);
  }
  50% {
    transform: translate(20px, -20px);
  }
  75% {
    transform: translate(20px, 20px);
  }
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .hero-image-wrapper {
    margin-bottom: -4rem;
    transform: translateY(1rem);
  }

  .hero-emblem {
    max-width: 10rem;
  }

  .dao-image-wrapper {

    margin-top: 0rem;

    margin-bottom: -1rem;
    transform: translateY(-1rem);
  }

  .dao-image {
    max-width: 10rem;
  }

  .hero-title {
    font-size: calc(1.75rem + 2vw);
    letter-spacing: 0.05em;
    margin: 0.25rem 0;
    transform: translateY(-0.5rem);
  }

  .hero-subtitle {
    font-size: calc(1rem + 1vw);
    margin: 0.25rem 0 1.5rem;
    transform: translateY(-0.25rem);
  }

  .hero-actions {
    flex-direction: column;
    gap: 1rem;
    max-width: 280px;
    width: 100%;
    transform: translateY(0);
  }

  .floating-shape {
    opacity: 0.2;
    filter: blur(15px);
  }
}

@media (max-width: 480px) {
  .hero-image-wrapper {
    margin-bottom: -3rem;
  }

  .hero-emblem {
    max-width: 12rem;
    margin-bottom: -1.5rem;
  }

  .dao-image {
    max-width: 12rem;
  }

  .hero-title {
    font-size: calc(1rem + 1vw);
  }

  .hero-subtitle {
    font-size: calc(0.9rem + 1vw);
  }

  .cosmic-button {
    padding: 0.8rem 1.2rem;
    font-size: 0.9rem;
  }
}

@keyframes textGradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Sky Light Beams */
.sky-light-beams {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.light-beam {
  position: absolute;
  width: 3vw;
  height: 100vh;
  background: linear-gradient(to bottom, 
    rgba(65, 195, 255, 0) 0%,
    rgba(65, 195, 255, 0.05) 20%,
    rgba(65, 195, 255, 0.1) 40%,
    rgba(65, 195, 255, 0.05) 60%,
    rgba(65, 195, 255, 0) 100%);
  opacity: 0;
  transform: translateY(-100%) rotate(var(--rotate, 0deg));
  filter: blur(8px);
  animation: beamMove 15s infinite ease-in-out;
}

.light-beam:nth-child(1) {
  left: 15%;
  animation-delay: 0s;
  width: 4vw;
}

.light-beam:nth-child(2) {
  left: 30%;
  animation-delay: 3s;
  width: 2vw;
}

.light-beam:nth-child(3) {
  left: 50%;
  animation-delay: 7s;
  width: 5vw;
}

.light-beam:nth-child(4) {
  left: 65%;
  animation-delay: 5s;
  width: 3vw;
}

.light-beam:nth-child(5) {
  left: 85%;
  animation-delay: 2s;
  width: 4vw;
}

.light-beam:nth-child(6) {
  left: 10%;
  animation-delay: 9s;
  width: 2.5vw;
}

.light-beam:nth-child(7) {
  left: 40%;
  animation-delay: 11s;
  width: 3.5vw;
}

.light-beam:nth-child(8) {
  left: 75%;
  animation-delay: 4s;
  width: 3vw;
}

@keyframes beamMove {
  0% {
    opacity: 0;
    transform: translateY(-100%) rotate(var(--rotate, 0deg));
  }
  20% {
    opacity: 0.7;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateY(100%) rotate(var(--rotate, 0deg));
  }
}

/* Logo Watermark */
.cosmic-logo-watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.light-beam {
  position: absolute;
  width: 3vw;
  height: 100vh;
  background: linear-gradient(to bottom, 
    rgba(65, 195, 255, 0) 0%,
    rgba(65, 195, 255, 0.05) 20%,
    rgba(65, 195, 255, 0.1) 40%,
    rgba(65, 195, 255, 0.05) 60%,
    rgba(65, 195, 255, 0) 100%);
  opacity: 0;
  transform: translateY(-100%) rotate(var(--rotate, 0deg));
  filter: blur(8px);
  animation: beamMove 15s infinite ease-in-out;
}

@keyframes beamMove {
  0% {
    opacity: 0;
    transform: translateY(-100%) rotate(var(--rotate, 0deg));
  }
  20% {
    opacity: 0.7;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateY(100%) rotate(var(--rotate, 0deg));
  }
}

@media (max-width: 768px) {
  .dao-page {
    width: 100vw;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .dao-explainer-section {
    padding: 4rem 1rem 2rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .explainer-container {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .explainer-pillars {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .explainer-pillar {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .distribution-section {
    padding: 0 1rem;
    width: 100%;
    max-width: 100%;
  }
  
  .distribution-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 100%;
  }
}

.explainer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
}

@media (max-width: 768px) {
  .explainer-links {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 260px;
    margin: 2rem auto 0;
  }
  
  .explainer-links .cta-button {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    justify-content: center;
  }
}

.explainer-pillars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2.5rem;
  width: 100%;
}

.explainer-pillar {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.03) 0%,
    rgba(15, 185, 253, 0.07) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.05),
    0 5px 15px rgba(0, 0, 0, 0.03);
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.explainer-pillar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    rgba(15, 185, 253, 0.05) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: all 0.5s ease;
}

.explainer-pillar::after {
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

.explainer-pillar:hover {
  transform: translateY(-10px) rotateX(2deg) rotateY(2deg) translateZ(10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 
    0 25px 50px rgba(15, 185, 253, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05);
}

.explainer-pillar:hover::before {
  opacity: 1;
}

.explainer-pillar:hover::after {
  transform: translateY(100%) translateX(100%) rotate(45deg);
  transition: transform 0.8s ease;
}

.pillar-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.2) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  position: relative;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 
    0 10px 20px rgba(15, 185, 253, 0.1),
    0 5px 10px rgba(0, 0, 0, 0.05);
}

.pillar-icon::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 1px solid rgba(15, 185, 253, 0.2);
  opacity: 0.5;
  transition: all 0.4s ease;
}

.pillar-icon i {
  font-size: 1.8rem;
  color: rgba(15, 185, 253, 0.9);
  transition: all 0.4s ease;
}

.explainer-pillar:hover .pillar-icon {
  transform: translateY(-5px) scale(1.1);
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.2) 0%,
    rgba(15, 185, 253, 0.4) 100%
  );
  box-shadow: 
    0 15px 30px rgba(15, 185, 253, 0.2),
    0 8px 15px rgba(0, 0, 0, 0.08);
}

.explainer-pillar:hover .pillar-icon::before {
  opacity: 0.8;
  transform: scale(1.1);
}

.explainer-pillar:hover .pillar-icon i {
  color: rgba(255, 255, 255, 0.95);
  transform: scale(1.1);
}

.explainer-pillar h3 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
}

.explainer-pillar p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  transition: all 0.3s ease;
}

.explainer-pillar:hover h3 {
  color: rgba(15, 185, 253, 0.9);
}

.explainer-pillar:hover p {
  color: var(--color-text-primary);
}

@media (max-width: 992px) {
  .explainer-pillars {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .explainer-pillars {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .explainer-pillar {
    display: flex;
    text-align: left;
    padding: 1.5rem;
    align-items: center;
    transform: none !important;
  }
  
  .pillar-icon {
    width: 60px;
    height: 60px;
    margin: 0 1.5rem 0 0;
    flex-shrink: 0;
  }
  
  .pillar-icon i {
    font-size: 1.5rem;
  }
  
  .explainer-pillar h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .explainer-pillar p {
    font-size: 0.95rem;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .explainer-pillar {
    padding: 1.25rem;
  }
  
  .pillar-icon {
    width: 50px;
    height: 50px;
    margin: 0 1.25rem 0 0;
  }
  
  .pillar-icon i {
    font-size: 1.3rem;
  }
  
  .explainer-pillar h3 {
    font-size: 1.1rem;
  }
  
  .explainer-pillar p {
    font-size: 0.9rem;
  }
}

/* Multipliers Section */
.multipliers-section {
  padding: 2rem;
  position: relative;
  width: 100%;
  margin: 0 auto;
}

/* Update Power Multipliers for full width */
.multipliers-section .power-multipliers {
  padding: 2.5rem;
  margin-top: -2.5rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 1200px;
  background: linear-gradient(145deg,
    rgba(15, 185, 253, 0.06) 0%,
    rgba(15, 185, 253, 0.1) 100%
  );
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.multipliers-section .multiplier-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Responsive styles for multipliers section */
@media (max-width: 768px) {
  .multipliers-section {
    padding: 3rem 1rem 2rem;
    overflow: visible;
  }
  
  .multipliers-section .power-multipliers {
    max-width: 90%;
    padding: 1.75rem 1.5rem;
    margin: 1rem auto;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
  
  .multipliers-section .power-multipliers h3 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .multipliers-section .multiplier-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
  }
  
  .multipliers-section .multiplier-card {
    padding: 1.5rem;
    max-width: 90%;
    margin: 0 auto;
    box-sizing: border-box;
    transform: translateY(0);
    opacity: 0;
    animation: slideInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  
  .multipliers-section .multiplier-card:nth-child(1) { animation-delay: 0.1s; }
  .multipliers-section .multiplier-card:nth-child(2) { animation-delay: 0.3s; }
  
  .multipliers-section .multiplier-header i {
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .multipliers-section .multiplier-content .bonus {
    font-size: 2.2rem;
  }
  
  .multipliers-section .multiplier-content .time {
    font-size: 1.2rem;
  }
  
  .multipliers-section .multiplier-card:active {
    transform: scale(0.98);
    background: linear-gradient(145deg,
      rgba(15, 185, 253, 0.08) 0%,
      rgba(15, 185, 253, 0.12) 100%
    );
    border-color: rgba(15, 185, 253, 0.25);
    transition: all 0.3s ease;
  }
}

/* More targeted styles for smaller mobile devices */
@media (max-width: 480px) {
  .multipliers-section {
    padding: 2rem 0.75rem 1.5rem;
  }
  
  .multipliers-section .power-multipliers {
    max-width: 100%;
    padding: 1.25rem;
    margin: 0.75rem auto;
    border-radius: 8px;
  }
  
  .multipliers-section .power-multipliers h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .multipliers-section .multiplier-grid {
    gap: 1rem;
  }
  
  .multipliers-section .multiplier-card {
    padding: 1.25rem;
    max-width: 100%;
  }
  
  .multipliers-section .multiplier-header i {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .multipliers-section .multiplier-header h4 {
    font-size: 1.1rem;
  }
  
  .multipliers-section .multiplier-content .bonus {
    font-size: 2rem;
  }
  
  .multipliers-section .multiplier-content .time {
    font-size: 1rem;
  }
}

.text-gradient {
  background: linear-gradient(
    135deg,
    var(--cosmic-highlight-1) 0%,
    var(--cosmic-highlight-2) 50%,
    var(--cosmic-highlight-1) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: var(--cosmic-font-glow);
  animation: textGradientShift 8s ease infinite;
}
</style>
