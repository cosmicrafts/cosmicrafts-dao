<template>
  <div class="dao-page">
<!-- Headline Section -->
<section
  class="headline"
  :style="{ backgroundPositionY: `${scrollY * -0.15}px` }"
>
  <!-- Background Canvas for Stars -->
  <canvas
    id="starfield"
    ref="starfield"
    class="noise-canvas"
    :style="{ top: `${scrollY * 0.5}px` }"
  ></canvas>

  <!-- Content Wrapper -->
  <div class="content">
    <div>
      <!-- DAO Hero Logo -->
      <img
        :src="dynamicHeroLogo"
        alt="DAO Logo"
        class="hero-logo"
        :style="{ transform: `translateY(${scrollY * 0.075}px) scale(${1.1 - scrollY * 0.00155})` }"
      />
    </div>
    <div>
      <!-- Hero Image -->
      <img
        src="@/assets/icons/DAO-1.svg"
        alt="DAO Illustration"
        class="dao-image"
        :style="{ transform: `translateY(${scrollY * -0.065}px) scale(${1 - scrollY * 0.000825})` }"
      />
    </div>
    <!-- Headline Titles -->
    <h1
      class="primary-headline"
      :style="{ transform: `translateY(${scrollY * -0.065}px) scale(${1 - scrollY * 0.000425})` }"
    >
      The dawn of a legacy
    </h1>
    <h2
      class="secondary-headline"
      :style="{ transform: `translateY(${scrollY * -0.055}px) scale(${1 - scrollY * -0.000425})` }"
    >
      A DAO you Command
    </h2>
    <p
      class="cta-subtext"
      :style="{ transform: `translateY(${scrollY * -0.005}px) scale(${1 - scrollY * -0.001225})` }"
    >
      It's DAO or NEVER!
    </p>
    <!-- Call-to-Action Button -->
    <div>
      <button class="cta-button" @click="handleJoin">
        Become a Stakeholder
      </button>
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
  name: "HeadlineSection",
  setup() {
    const { locale } = useI18n();

    // Reactive Properties
    const scrollY = ref(0);
    const membersCount = ref(0); // Default value for membersCount
    const totalValueLocked = ref('$0'); // Default value for totalValueLocked
    const countdown = ref('00:00:00'); // Default value for countdown timer
    const tooltip = ref(null); // To store the currently active tooltip
    const tooltipVisible = ref(false); // To control tooltip visibility

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
      const parallaxEffect = () => {
    const section = document.querySelector('.vision-mission');
    if (!section) return;
    const offset = window.scrollY * 0.2;
    section.style.backgroundPositionY = `${offset}px`;
  };
      window.addEventListener('scroll',  handleScroll, parallaxEffect);

      // Example for simulating data updates (replace with real API calls)
      setTimeout(() => {
        membersCount.value = 1500; // Simulate fetched data
        totalValueLocked.value = '$1,500,000'; // Simulate fetched data
        countdown.value = '12:34:56'; // Simulate fetched data
      }, 1000);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      dynamicHeroLogo,
      scrollY,
      membersCount,
      totalValueLocked,
      countdown,
      tooltip,
      tooltipVisible,
      showTooltip,
      hideTooltip,
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
  background-blend-mode: lighten; /* Blend the image with the gradient */
  z-index: 2;
}


.content {
  position: relative;
  text-align: center;
}

.hero-logo {
  max-width: 20rem;
  margin-bottom: -10rem;
  transition: transform 0.5s ease;
  filter: drop-shadow(0px 0px 8px rgba(0, 1, 18, 0.5));

}

.dao-image {
  max-width: 20rem;
  margin-bottom: -8rem;
  filter: drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.5));
  transition: transform 0.5s ease;
}

.primary-headline {
  font-size: 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
  margin: 0.5rem 0;
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

.cta-button {
  display: inline-block;
  padding: 15px 40px; /* Adjust for desired size */
  font-size: 16px; 
  font-weight: bold;
  text-align: center;

  color: #e0f7ff;
  background: linear-gradient(135deg, #1e90ff, #0b3d91); /* Blue gradient */
  border: 2px solid #4faeff; /* Outer glowing border */
  border-radius: 50px; /* Fully rounded corners */
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), /* Inner glow */
              0 0 15px rgba(79, 174, 255, 0.6); /* Outer glow */
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), /* Smooth scaling */
              box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* Smooth glow transition */
  cursor: pointer;
}

.cta-button:hover {
  transform: scale(1.01); /* Slight zoom effect */
  box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.4), 
              0 0 20px rgba(79, 174, 255, 0.8); /* Brighter glow */
}


/* A DAO for Investors */
.investor-focus {

  background: linear-gradient(90deg, #08090c, #1d263c, #08090c), url('@/assets/webp/daomission.webp') no-repeat center center;
  background-size: cover; /* Ensure the image covers the area */
  background-blend-mode: lighten; /* Blend the image with the gradient */
  text-align: center;

  padding: 4rem;
  z-index: 2;
}

.highlight {
  font-size: 1.8rem;
  font-style: italic;
  color: #fff;
  margin-bottom: 2rem;
}

.proven-track-record, .investor-empowerment, .community-callout {
  margin-bottom: 2rem;
}

.proven-track-record h3, .investor-empowerment h3, .community-callout h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.key-points {
  list-style: none;
  padding: 0;
}

.key-points li {
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.key-points h3 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.key-points p {
  margin: 0;
}

.call-to-action {
  margin-top: 3rem;
}

.call-to-action p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.cta-button {
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(to bottom, #4a90e2, #264f89);
  color: #fff;
  border-radius: var(--button-border-radius);
  cursor: pointer;
  transition: background-color 0.1s;
}

.cta-button:hover {
  background: linear-gradient(to bottom, #3d92f3, #287aed);
}

.countdown {
  margin-top: 1rem;
}

.countdown p {
  font-size: 1rem;
  color: #b0c4de;
  margin-bottom: 0.5rem;
}

progress {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

progress::-webkit-progress-bar {
  background: #e0e0e0;
}

progress::-webkit-progress-value {
  background: #4a90e2;
}


/* Vision and Mission Section */
.vision-mission {
  position: relative;
  padding: 5rem 2rem;
  background: linear-gradient(90deg, #08090c, #1d263c, #08090c);
  text-align: center;
  color: #e0e0e0;
  overflow: hidden;
}

.vision-mission .container {
  max-width: 1200px;
  margin: 0 auto;
}

.vision-mission .section-title {
  font-size: 2.5rem;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
}

.vision-mission .content-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.vision-mission .card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
  flex: 1;
  max-width: 320px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 2;
}

.vision-mission .card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);
}

.vision-mission .icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #4faeff, #1d263c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(79, 174, 255, 0.8);
}

.vision-mission .icon-container img {
  width: 40px;
  height: 40px;
}

.vision-mission .subheading {
  font-size: 1.8rem;
  color: #8ac1ff;
  margin-bottom: 1rem;
}

.vision-mission .card p {
  font-size: 1rem;
  color: #d1d9e6;
  line-height: 1.6;
}

.vision-mission::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 100%;
  background: url('@/assets/webp/daomission.webp') center/cover no-repeat;
  opacity: 0.2;
  z-index: 1;
}

.vision-mission::after {
  content: '';
  position: absolute;
  top: -50px;
  left: 0;
  width: 100%;
  height: 300px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  z-index: 3;
}


/* Core Value Proposition Section */
.core-value {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  text-align: center;
  padding: 3rem;
}

.value-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin: 1rem auto;
}

.value-item h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.value-item p {
  font-size: 1.2rem;
  color: #e0e0e0;
  line-height: 1.8;
}

.value-item .context {
  margin-top: 1rem;
}

.visual-placeholder img {
  width: 64px;
  height: 64px;
}

.call-to-action {
  margin-top: 3rem;
}

.cta-button {
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(to bottom, #4a90e2, #264f89);
  color: #fff;
  cursor: pointer;
  border-radius: var(--button-border-radius);
  transition: background-color 0.1s;
}

.cta-button:hover {
  background: linear-gradient(to bottom, #3d92f3, #287aed);
}

/* Why Cosmicrafts Matters */
.why-it-matters {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  padding: 4rem;
  color: #e0e0e0;
}

.why-it-matters h2 {
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 1rem;
  text-align: center;
}

.why-it-matters p {
  margin: 1rem 0;
  line-height: 1.6;
  font-size: 1.2rem;
}

.why-it-matters .impact h3 {
  margin-top: 2rem;
  font-size: 1.8rem;
  color: #b0c4de;
}

.why-it-matters ul {
  list-style: none;
  margin: 1rem 0;
  padding: 0;
}

.why-it-matters ul li {
  margin: 1rem 0;
  font-size: 1.1rem;
}

.why-it-matters ul li strong {
  color: #fff;
}

.why-it-matters .cta {
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
}

/* Revenue Streams and Tokenomics */
.revenue-streams {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  color: #e0e0e0;
  padding: 3rem;
}

.intro {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.streams, .tokenomics-model ul {
  list-style: none;
  padding: 0;
}

.streams li, .tokenomics-model ul li {
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.streams h3, .tokenomics-model h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.streams p, .tokenomics-model ul li {
  font-size: 1.2rem;
  margin: 0;
  line-height: 1.8;
}

.visual-representation {
  margin: 2rem 0;
  text-align: center;
}

.visual-representation img {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
}

.caption {
  font-size: 1rem;
  color: #b0c4de;
  margin-top: 1rem;
}

.call-to-action {
  margin-top: 3rem;
  text-align: center;
}

.cta-button {
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(to bottom, #4a90e2, #264f89);
  color: #fff;
  border-radius: var(--button-border-radius);
  cursor: pointer;
  transition: background-color 0.1s;
}

.cta-button:hover {
  background: linear-gradient(to bottom, #3d92f3, #287aed);
}

/* Building ICP */
.building-icp {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  color: #e0e0e0;
  padding: 3rem;
  text-align: center;
}

.intro {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.partnership-goals {
  list-style: none;
  padding: 0;
}

.partnership-goals li {
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
}

.partnership-goals h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.partnership-goals p {
  font-size: 1.2rem;
  margin: 0;
  line-height: 1.8;
}

.visual-representation {
  margin: 2rem 0;
  text-align: center;
}

.visual-representation img {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
}

.caption {
  font-size: 1rem;
  color: #b0c4de;
  margin-top: 1rem;
}

.call-to-action {
  margin-top: 3rem;
}

.cta-button {
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(to bottom, #4a90e2, #264f89);
  color: #fff;
  border-radius: var(--button-border-radius);
  cursor: pointer;
  transition: background-color 0.1s;
}

.cta-button:hover {
  background: linear-gradient(to bottom, #3d92f3, #287aed);
}

/* How to Join */
.how-to-join {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  color: #e0e0e0;
  padding: 3rem;
  text-align: center;
}

.intro {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.step {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: left;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.step-icon img {
  width: 64px;
  height: 64px;
}

.step h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.step p {
  font-size: 1.2rem;
  line-height: 1.8;
  margin: 0;
}

.call-to-action {
  margin-top: 3rem;
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.cta-button {
  font-size: 1.5rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(to bottom, #4a90e2, #264f89);
  color: #fff;
  border-radius: var(--button-border-radius);
  cursor: pointer;
  transition: background-color 0.1s;
}

.cta-button:hover {
  background: linear-gradient(to bottom, #3d92f3, #287aed);
}



/* Roadmap */
.roadmap {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  padding: 3rem;
}

.roadmap .intro {
  max-width: 800px;
  margin: 0 auto 3rem auto;
}

.timeline {
  position: relative;
  margin: 4rem 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-50%);
}

.milestone {
  position: relative;
  width: 50%;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.milestone:nth-child(odd) {
  left: 0;
  transform: translateX(-10%);
}

.milestone:nth-child(even) {
  left: 50%;
  transform: translateX(10%);
}

.milestone::after {
  content: '';
  position: absolute;
  top: 20px;
  right: -12px;
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

.milestone:nth-child(even)::after {
  left: -12px;
  right: auto;
}

.milestone .icon {
  display: none; /* Removed icons for cleaner look */
}

.milestone .content h3 {
  font-size: 1.6rem;
  color: var(--accent-color-light);
  margin-bottom: 0.5rem;
}

.milestone .content p {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 0.5rem;
}

.milestone .impact {
  font-size: 1rem;
  font-style: italic;
  color: var(--subheading-color);
}

.tooltip {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(14, 15, 27, 0.9);
  color: #fff;
  padding: 1rem;
  border-radius: 12px;
  width: 250px;
  text-align: center;
  display: none;
}

.milestone:hover .tooltip {
  display: block;
}

.community-involvement {
  margin-top: 4rem;
}

.community-involvement h3 {
  font-size: 2rem;
  color: var(--accent-color-light);
  margin-bottom: 1rem;
}

.community-involvement p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.community-involvement .cta-button {
  font-size: 1.3rem;
  padding: 0.8rem 2rem;
  border-radius: 50px;
}


/* Closing CTA */
.closing-cta {
  background: linear-gradient(90deg,  #08090c, #1d263c, #08090c);
  padding: 3rem;
  color: #e0e0e0;
}

.subtext {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.8;
}

.cta-container {
  margin-top: 2rem;
}

.progress-bar-container {
  position: relative;
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.progress-text {
  font-size: 1rem;
  color: #b0c4de;
  margin-bottom: 0.5rem;
}

.tooltip {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-size: 0.9rem;
  color: #333;
}

.testimonial-carousel {
  margin-top: 2rem;
  font-style: italic;
  color: #b0c4de;
}

.testimonial-carousel blockquote {
  font-size: 1.2rem;
  margin: 0;
}

.testimonial-name {
  font-size: 1rem;
  color: #e0e0e0;
  margin-top: 0.5rem;
}

.community-stats {
  margin-top: 2rem;
  font-size: 1rem;
  color: #b0c4de;
}

.countdown-timer {
  margin-top: 2rem;
}

.countdown-timer p {
  font-size: 1rem;
  color: #b0c4de;
}

.countdown-timer .timer {
  font-size: 1.5rem;
  color: #fff;
  font-weight: var(--font-weight-bold);
}
</style>
