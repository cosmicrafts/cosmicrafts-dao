<template>
  <section class="hero">
    <!-- Background Canvas for Stars - Move to the first child with proper styling -->
    <Starfield class="hero-starfield" />

    <!-- Slide Wrapper -->
    <div v-if="slides[currentSlide]" :key="currentSlide" class="slide">
      <!-- Content Wrapper -->
<div class="hero-content">
<!-- Hero Image with Conditional Classes -->
<img
  :src="slides[currentSlide].heroImage"
  alt="Hero Image"
  class="hero-image"
  :class="{
    'enter-animation-next': isEntering && slideDirection === 'next',
    'leave-animation-next': isLeaving && slideDirection === 'next',
    'enter-animation-prev': isEntering && slideDirection === 'prev',
    'leave-animation-prev': isLeaving && slideDirection === 'prev',
    'initial-load': !hasLoadedOnce
  }"
  :style="{ transform: `translateY(${scrollY * -0.05}px) scale(${1 - scrollY * 0.000825})` }"
  @animationend="onAnimationEnd"
/>


  <!-- Hero Logo -->
  <img
    :src="slides[currentSlide].logo"
    alt="Game Logo"
    class="hero-logo"
    :class="{
      'enter-animation': isEntering,
      'leave-animation': isLeaving,
      'initial-load': !hasLoadedOnce
    }"
    :style="{ transform: `translateY(${scrollY * -0.05}px) scale(${1 - scrollY * -0.00055})` }"
  />

  <!-- Hero Title and Indicators Wrapper -->
  <div class="title-indicator-wrapper">
    <!-- Hero Title -->
    <h1
      class="hero-title"
      :class="{
        'enter-animation': isEntering,
        'leave-animation': isLeaving,
        'initial-load': !hasLoadedOnce
      }"
      :style="{ transform: `translateY(${scrollY * -0.055}px) scale(${1 - scrollY * -0.00055})` }"
    >
    {{ t(`hero.slides[${currentSlide}].title`) }}
    </h1>
  </div>
</div>

 <!-- Slide Indicators -->
 <div class="slide-indicators" :class="{ 'initial-load': !hasLoadedOnce }">
      <span
        v-for="(slide, i) in slides"
        :key="i"
        :class="{ active: currentSlide === i, 'initial-load': !hasLoadedOnce }"
        @click="goToSlide(i)"
      ></span>
    </div>


      <!-- CTA and Social Media Panel -->
      <div class="cta-panel" :class="{ 'initial-load': !hasLoadedOnce }">
        <div class="cta-buttons">
          <button
            v-for="(button, i) in slides[currentSlide].ctaButtons"
            :key="i"
            :class="['cosmic-button', button.style === 'primary' ? 'cosmic-button-primary' : 'cosmic-button-secondary', { 'initial-load': !hasLoadedOnce }]"
            @click="handleCTA(button.link, button.isReferral)"
          >
            <span class="button-text">{{ t(`hero.slides[${currentSlide}].ctaButtons[${i}].text`) }}</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
        </div>

        <!--
        <button @click="toggleFreeze" class="freeze-button">
  {{ isFrozen ? 'Unfreeze Slide' : 'Freeze Slide' }}
</button>
-->


        <!-- Social Media Links -->
        <div class="social-links">
          <a href="https://x.com/cosmicrafts" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }" @click="trackSocialClick('x')">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }" @click="trackSocialClick('discord')">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://www.youtube.com/@cosmicrafts" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }" @click="trackSocialClick('youtube')">
            <img src="@/assets/icons/youtube.svg" alt="YouTube" />
          </a>
          <a href="https://instagram.com/cosmicraftz" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }" @click="trackSocialClick('instagram')">
            <img src="@/assets/icons/instagram.svg" alt="Instagram" />
          </a>
          <a href="https://facebook.com/cosmicrafts" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }" @click="trackSocialClick('facebook')">
            <img src="@/assets/icons/facebook.svg" alt="Facebook" />
          </a>
        </div>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="nav-controls" :class="{ 'initial-load': !hasLoadedOnce }">
      <button class="cosmic-nav-arrow" @click="prevSlide">
        <span class="nav-arrow-glow"></span>
        &#10094;
      </button>
      <button class="cosmic-nav-arrow" @click="nextSlide">
        <span class="nav-arrow-glow"></span>
        &#10095;
      </button>
    </div>

    <!-- Referral Code Notification -->
    <div v-if="showNotification" class="referral-notification" :class="{ 'mobile': isMobile }">
      <div class="notification-content">
        <i class="notification-icon">✓</i>
        <div class="notification-text">
          <p class="notification-title">{{ t('referral.notification.title') }}</p>
          <p class="notification-message">{{ t('referral.notification.message') }}</p>
        </div>
        <button class="notification-close" @click="showNotification = false">×</button>
      </div>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Starfield from '@/components/media/Starfield.vue';
import logo1 from '@/assets/webp/adventures.webp';
import heroImage1 from '@/assets/webp/hero.webp';
import logo2 from '@/assets/icons/DAO-1.svg';
import logo3 from '@/assets/webp/battlegrounds.webp';
import heroImage3 from '@/assets/webp/hero-battlegrounds.webp';
import logo4 from '@/assets/icons/dashboard.svg';
import heroImage4 from '@/assets/webp/hero4.webp';

import heroImage2Default from '@/assets/icons/logo.svg';
import heroImage2CN from '@/assets/icons/logo-cn.svg';
import heroImage2KR from '@/assets/icons/logo-kr.svg';
import heroImage2JP from '@/assets/icons/logo-jp.svg';
import heroImage2RU from '@/assets/icons/logo-ru.svg';
import heroImage2AR from '@/assets/icons/logo-ar.svg';

import logoClassics from '@/assets/webp/classics-logo.webp';
import heroImageClassics from '@/assets/webp/classics-hero.webp';

import '@/assets/css/hero-section.css';

const { t, locale } = useI18n();
const router = useRouter();

// Flag to track initial page load animation
const hasLoadedOnce = ref(false);

// Function to mark initial animations as complete
const onAnimationEnd = () => {
  if (!hasLoadedOnce.value) {
    hasLoadedOnce.value = true;
  }
};

const heroImageMap = {
  zh: heroImage2CN,
  ko: heroImage2KR,
  ja: heroImage2JP,
  ru: heroImage2RU,
  ar: heroImage2AR,
  default: heroImage2Default
};

// Computed property for the dynamic hero image for the second slide
const dynamicHeroImage2 = computed(() => {
  return heroImageMap[locale.value] || heroImageMap.default;
});

const scrollY = ref(0);

// **Add the slides data**
const slides = ref([
  {
    heroImage: heroImage1,
    logo: logo1,
    title: "This is ground zero. Alpha's live!",
    ctaButtons: [
      { text: 'Play Now', link: '/adventures', style: 'primary' },
      { text: 'Wishlist on Epic Games', link: 'https://store.epicgames.com/en-US/p/cosmicrafts-499a8f', style: 'secondary' },
    ],
  },
  {
    heroImage: dynamicHeroImage2,
    logo: logo2,
    title: "The Party's Here. Are You In or What?",
    ctaButtons: [
      { text: 'Join the Beta', link: 'https://nns.ic0.app/', style: 'primary' },
      { text: 'Learn More', link: '/whitepaper', style: 'secondary' },
    ],
  },
  {
    heroImage: heroImage3,
    logo: logo3,
    title: 'On-chain RTS. A Starlight Drift, Galactic Mayhem',
    ctaButtons: [
      { text: 'Download Now', link: 'https://ohsalmeron.itch.io/cosmicrafts', style: 'primary' },
      { text: 'Learn More', link: 'https://cosmicrafts.fandom.com/wiki/Cosmicrafts_Wiki', style: 'secondary' },
    ],
  },
  // Classics Slide
  {
    heroImage: heroImageClassics,
    logo: logoClassics,
    title: 'Cosmicrafts Classics - Bring back the Legacy',
    ctaButtons: [
      { text: 'Play Classics', link: '/games', style: 'primary' },
      { text: 'X Highlights', link: 'https://x.com/cosmicrafts/highlights', style: 'secondary' },
    ],
  },
  {
    heroImage: heroImage4,
    logo: logo4,
    title: 'Lets get Social!, Invite Now and Claim Exclusive Rewards!',
    ctaButtons: [
      { text: 'Start Adventure', link: '/dashboard', style: 'primary' },
      { text: 'Get Referral Code', link: '#', style: 'secondary', isReferral: true },
    ],
  }
]);

// **Social Media Links**
const socialLinks = [
  { link: 'https://x.com/cosmicrafts', icon: '@/assets/icons/x.svg', alt: 'Twitter' },
  { link: 'https://discord.com/invite/cosmicrafts-884272584491941888', icon: '@/assets/icons/discord.svg', alt: 'Discord' },
  { link: 'https://www.youtube.com/@cosmicrafts', icon: '@/assets/icons/youtube.svg', alt: 'YouTube' },
  { link: 'https://instagram.com/cosmicrafts', icon: '@/assets/icons/instagram.svg', alt: 'Instagram' },
  { link: 'https://facebook.com/cosmicrafts', icon: '@/assets/icons/facebook.svg', alt: 'Facebook' },
];

// **Function to handle CTA button clicks**
const handleCTA = (link, isReferral) => {
  // Track CTA button click
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'hero_cta_clicked', {
      slide_index: currentSlide.value,
      slide_title: slides.value[currentSlide.value].title,
      link: link,
      is_referral: isReferral,
      is_external: link.startsWith('http')
    });
  }
  
  if (isReferral) {
    // Show referral code notification
    showReferralNotification();
    return;
  }
  
  if (link.startsWith('http')) {
    // For external links, open in a new tab
    window.open(link, '_blank');
  } else {
    // For internal links, use vue-router
    router.push(link);
  }
};

// Referral notification state
const showNotification = ref(false);
const notificationTimeout = ref(null);

// Function to show referral notification
const showReferralNotification = () => {
  // Example referral code - in a real app, this would come from the user's account
  const referralCode = "COSMIC" + Math.floor(1000 + Math.random() * 9000);
  
  // Copy to clipboard
  navigator.clipboard.writeText(referralCode).then(() => {
    showNotification.value = true;
    
    // Clear any existing timeout
    if (notificationTimeout.value) {
      clearTimeout(notificationTimeout.value);
    }
    
    // Auto hide notification after 3 seconds
    notificationTimeout.value = setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  });
};

function $i(id) {
  return document.getElementById(id);
}

// Simplified handleScroll for parallax effects only
function handleScroll() {
  scrollY.value = window.scrollY;
}

const currentSlide = ref(0);
const isEntering = ref(false);
const isLeaving = ref(false);
const slideDirection = ref("next");
let slideInterval;

// Function to transition slides with direction tracking
function transitionSlides(newSlide, direction) {
  slideDirection.value = direction; // Set the direction (either "next" or "prev")
  isLeaving.value = true;
  
  // Faster transition with reduced timeout
  setTimeout(() => {
    currentSlide.value = newSlide;
    isLeaving.value = false;
    isEntering.value = true;
    
    // Faster reset of entering state
    setTimeout(() => {
      isEntering.value = false;
    }, 30); // Reduced from 50ms
  }, 30); // Reduced from 50ms
}

// **Slide navigation functions**
function resetAutoSlide() {
  stopAutoSlide(); // Clear the current interval
  startAutoSlide(); // Restart the interval
}

const isFrozen = ref(false); // Add this line

function toggleFreeze() {
  isFrozen.value = !isFrozen.value;
}

function nextSlide() {
  if (isFrozen.value) return;
  
  // Track manual slide navigation
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'hero_slide_navigated', {
      action: 'next',
      from_slide: currentSlide.value,
      to_slide: (currentSlide.value + 1) % slides.value.length
    });
  }
  
  const newSlide = (currentSlide.value + 1) % slides.value.length;
  transitionSlides(newSlide, "next"); // Set direction as "next"
  resetAutoSlide();
}

function prevSlide() {
  if (isFrozen.value) return;
  
  // Track manual slide navigation
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'hero_slide_navigated', {
      action: 'prev',
      from_slide: currentSlide.value,
      to_slide: (currentSlide.value - 1 + slides.value.length) % slides.value.length
    });
  }
  
  const newSlide = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
  transitionSlides(newSlide, "prev"); // Set direction as "prev"
  resetAutoSlide();
}

function goToSlide(index) {
  if (index === currentSlide.value) return; // Do nothing if the same slide is clicked
  
  // Track slide indicator click
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'hero_slide_indicator_clicked', {
      from_slide: currentSlide.value,
      to_slide: index,
      direction: index > currentSlide.value ? "next" : "prev"
    });
  }
  
  const direction = index > currentSlide.value ? "next" : "prev";
  transitionSlides(index, direction); // Pass the direction based on relative position
  resetAutoSlide();
}

// Track social media clicks
const trackSocialClick = (platform) => {
  if (typeof window.clarity !== 'undefined') {
    window.clarity('event', 'hero_social_clicked', {
      platform: platform,
      slide_index: currentSlide.value,
      slide_title: slides.value[currentSlide.value].title,
      location: 'hero_section'
    });
  }
};

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 5000); // Slightly faster auto-slide
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

// Reactive value to check if on mobile
const isMobile = ref(false);

// Update mobile status on mount and resize
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth <= 1024;
};

onMounted(() => {
  // Add event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Start auto-sliding
  startAutoSlide();
  
  // Mark as loaded after initial animations - faster finish
  setTimeout(() => {
    hasLoadedOnce.value = true;
  }, 100); // Reduced from 1200ms for faster initial load
  
  // Set initial mobile status
  updateMobileStatus();
  window.addEventListener('resize', updateMobileStatus, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  stopAutoSlide(); // Stop auto-sliding
  
  // Clean up resize listener
  window.removeEventListener('resize', updateMobileStatus);
  
  // Clear notification timeout if it exists
  if (notificationTimeout.value) {
    clearTimeout(notificationTimeout.value);
  }
});
</script>
