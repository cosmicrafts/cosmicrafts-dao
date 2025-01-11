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

.cta-button {
  display: inline-block;
  padding: 1rem 2.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: -2px 2px 4px rgba(0, 0, 0, 0.224);
  text-align: center;
  color: #e0f7ff;
  background: linear-gradient(to bottom, #4a90e2, #264f89); /* Blue gradient */
  border: 2px solid #4faeff; /* Outer glowing border */
  border-radius: 16px; /* Fully rounded corners */
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2), /* Subtle inner glow */
    0 0 15px rgba(79, 174, 255, 0.6); /* Outer glow */
  transition: 
    transform 2.5s cubic-bezier(0.4, 0, 0.2, 1), /* Smooth scaling */
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), /* Smooth glow transition */
    background-color 0.5s ease-in-out; /* Quick background change */
  cursor: pointer;
}

.cta-button:hover {
  text-shadow: 0px 0px 4px rgba(255, 255, 255, 0.455);
  background: linear-gradient(to bottom, #3d92f3, #287aed); /* Lighter blue gradient */
  box-shadow: 
    inset 0 2px 8px rgba(146, 217, 255, 0.889), /* Stronger inner glow */
    0 0 8px rgba(30, 184, 255, 0.879); /* Brighter outer glow */
}



</style>
