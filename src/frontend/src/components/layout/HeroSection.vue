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
          <a href="https://x.com/cosmicrafts" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://www.youtube.com/@cosmicrafts" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/youtube.svg" alt="YouTube" />
          </a>
          <a href="https://instagram.com/cosmicraftz" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/instagram.svg" alt="Instagram" />
          </a>
          <a href="https://facebook.com/cosmicrafts" class="cosmic-social-icon" :class="{ 'initial-load': !hasLoadedOnce }">
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
import heroImage3 from '@/assets/webp/hero2.webp';
import logo4 from '@/assets/icons/dashboard.svg';
import heroImage4 from '@/assets/webp/hero4.webp';

import heroImage2Default from '@/assets/icons/logo.svg';
import heroImage2CN from '@/assets/icons/logo-cn.svg';
import heroImage2KR from '@/assets/icons/logo-kr.svg';
import heroImage2JP from '@/assets/icons/logo-jp.svg';
import heroImage2RU from '@/assets/icons/logo-ru.svg';
import heroImage2AR from '@/assets/icons/logo-ar.svg';

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
      { text: 'Play Now', link: '/game', style: 'primary' },
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
  // Slide 3
  {
    heroImage: heroImage3,
    logo: logo3,
    title: 'On-chain RTS. A Starlight Drift, Galactic Mayhem',
    ctaButtons: [
      { text: 'Download Now', link: 'https://ohsalmeron.itch.io/cosmicrafts', style: 'primary' },
      { text: 'Learn More', link: 'https://cosmicrafts.fandom.com/wiki/Cosmicrafts_Wiki', style: 'secondary' },
    ],
  },
  // Slide 4
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
  const newSlide = (currentSlide.value + 1) % slides.value.length;
  transitionSlides(newSlide, "next"); // Set direction as "next"
  resetAutoSlide();
}

function prevSlide() {
  if (isFrozen.value) return;
  const newSlide = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
  transitionSlides(newSlide, "prev"); // Set direction as "prev"
  resetAutoSlide();
}

function goToSlide(index) {
  if (index === currentSlide.value) return; // Do nothing if the same slide is clicked
  
  const direction = index > currentSlide.value ? "next" : "prev";
  transitionSlides(index, direction); // Pass the direction based on relative position
  resetAutoSlide();
}

function startAutoSlide() {
  slideInterval = setInterval(nextSlide, 8000); // Slightly faster auto-slide
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

// Reactive value to check if on mobile
const isMobile = ref(false);

// Update mobile status on mount and resize
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  // Add event listeners
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Start auto-sliding
  startAutoSlide();
  
  // Mark as loaded after initial animations - faster finish
  setTimeout(() => {
    hasLoadedOnce.value = true;
  }, 800); // Reduced from 1200ms for faster initial load
  
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

<style scoped>
/* Core layout styles */
.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cosmic-text-primary);
  overflow: hidden;
  background: radial-gradient(circle at 30% 30%, var(--cosmic-bg-dark), var(--cosmic-bg-darkest) 70%);
  opacity: 0;
  animation: revealPage 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.1s forwards;
  perspective: 1000px;
}

/* Starfield positioning */
.hero-starfield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Main content container */
.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 5;
  transform-origin: center center;
  transform-style: preserve-3d;
  transition: transform 0.5s ease-out;
  opacity: 0;
  animation: contentReveal 0.5s cubic-bezier(0.19, 1, 0.22, 1) 0.3s forwards;
}

/* Hero image */
.hero-image {
  max-width: 22rem;
  margin-top: -4rem;
  z-index: 2;
  opacity: 0.95;
  filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  transform-style: preserve-3d;
  transition: transform var(--cosmic-transition-medium), filter var(--cosmic-transition-medium);
}

/* Logo styling */
.hero-logo {
  max-width: 18rem;
  margin-top: -11rem;
  z-index: 3;
  filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  transform-style: preserve-3d;
  transition: transform var(--cosmic-transition-medium), filter var(--cosmic-transition-medium);
}

/* Hero title */
.hero-title {
  font-size: 2rem;
  font-weight: bold;
  margin-top: -3.5rem;
  z-index: 3;
  text-shadow: var(--cosmic-glow-blue-sm);
  background: linear-gradient(180deg, var(--cosmic-text-primary), var(--cosmic-blue-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding: 0.5rem 1.5rem;
  transition: transform var(--cosmic-transition-medium), text-shadow var(--cosmic-transition-medium);
  transform-style: preserve-3d;
}

/* CTA panel */
.cta-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem;
  gap: 1.5rem;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-top: var(--cosmic-glass-border-blue);
  z-index: 6;
  box-sizing: border-box;
  transform-style: preserve-3d;
  transition: all var(--cosmic-transition-medium);
  box-shadow: 
    0 -10px 30px rgba(0, 0, 0, 0.25),
    0 -1px 10px rgba(0, 140, 255, 0.15);
}

/* CTA buttons container */
.cta-buttons {
  display: flex;
  gap: 1.2rem;
  position: relative;
  z-index: 2;
}

/* Social media links */
.social-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

/* Navigation controls */
.nav-controls {
  position: absolute;
  top: 45%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 7;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Slide indicators */
.slide-indicators {
  position: absolute;
  bottom: calc(80px + 2rem);
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  z-index: 6;
}

.slide-indicators span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slide-indicators span.active {
  background: var(--cosmic-blue-light);
  box-shadow: 0 0 8px var(--cosmic-blue-glow);
}

/* Referral notification */
.referral-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: 1px solid rgba(0, 183, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-width: 400px;
  animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 183, 255, 0.2);
  color: var(--cosmic-blue-light);
  margin-right: 1rem;
  font-style: normal;
}

.notification-text {
  flex: 1;
}

.notification-title {
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: var(--cosmic-text-primary);
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
  color: var(--cosmic-text-secondary);
}

.notification-close {
  background: none;
  border: none;
  color: var(--cosmic-text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.5rem;
  transition: all 0.2s ease;
}

.notification-close:hover {
  color: var(--cosmic-text-primary);
}

/* Animation keyframes */
@keyframes revealPage {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes contentReveal {
  0% { opacity: 0; transform: scale(0.95) translateZ(-30px); }
  100% { opacity: 1; transform: scale(1) translateZ(0); }
}

@keyframes slideInRight {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutLeft {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30px); opacity: 0; }
}

@keyframes slideInLeft {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(30px); opacity: 0; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Animations for slide transitions */
.hero-image.enter-animation-next { animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-image.leave-animation-next { animation: slideOutLeft 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-image.enter-animation-prev { animation: slideInLeft 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-image.leave-animation-prev { animation: slideOutRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-logo.enter-animation { animation: fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-logo.leave-animation { animation: fadeOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-title.enter-animation { animation: fadeIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.hero-title.leave-animation { animation: fadeOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

/* Initial load animations */
.hero-image.initial-load { animation: heroImageEntry 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.4s forwards !important; opacity: 0; transform: translateY(30px) scale(0.9) translateZ(-10px); }
.hero-logo.initial-load { animation: heroLogoEntry 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.5s forwards !important; opacity: 0; transform: translateY(-30px) scale(0.8) translateZ(-20px); }
.hero-title.initial-load { animation: titleEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.6s forwards !important; opacity: 0; transform: translateY(20px) translateZ(-30px); }
.cta-panel.initial-load { animation: ctaPanelEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.6s forwards; opacity: 0; transform: translateY(100%) translateZ(-50px); }
.nav-controls.initial-load { animation: navControlsEntry 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0.7s forwards; opacity: 0; }

@keyframes heroImageEntry {
  0% { opacity: 0; transform: translateY(30px) scale(0.9) translateZ(-30px); filter: drop-shadow(0px 0px 0px rgba(0, 183, 255, 0)); }
  60% { opacity: 1; transform: translateY(-5px) scale(1.02) translateZ(20px); filter: drop-shadow(0px 0px 50px rgba(0, 183, 255, 0.4)); }
  100% { opacity: 0.95; transform: translateY(0) scale(1) translateZ(0); filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25)); }
}

@keyframes heroLogoEntry {
  0% { opacity: 0; transform: translateY(-30px) scale(0.8) translateZ(-50px); filter: drop-shadow(0px 0px 0px rgba(0, 183, 255, 0)); }
  70% { opacity: 1; transform: translateY(5px) scale(1.05) translateZ(30px); filter: drop-shadow(0px 0px 50px rgba(0, 183, 255, 0.5)); }
  100% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25)); }
}

@keyframes titleEntry {
  0% { opacity: 0; transform: translateY(20px) translateZ(-30px); text-shadow: 0px 0px 0px rgba(0, 174, 255, 0); }
  70% { opacity: 1; transform: translateY(-5px) translateZ(20px); text-shadow: 0px 0px 50px rgba(0, 174, 255, 0.8); }
  100% { opacity: 1; transform: translateY(0) translateZ(0); text-shadow: 0px 0px 36px rgba(0, 174, 255, 0.507); }
}

@keyframes ctaPanelEntry {
  0% { opacity: 0; transform: translateY(100%) translateZ(-50px); }
  100% { opacity: 1; transform: translateY(0) translateZ(0); }
}

@keyframes navControlsEntry {
  0% { opacity: 0; transform: translateY(-50%) scale(0.9); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(-50%) scale(1); filter: blur(0); }
}

/* Mobile styles */
@media (max-width: 768px) {
  .hero-image {
    max-width: 18rem;
    margin-top: -8rem;
  }

  .hero-logo {
    max-width: 8rem;
    margin-top: -7rem;
  }

  .hero-title {
    font-size: 0.9rem;
    margin-top: -.5rem;
    padding: 0 1rem;
    line-height: 1.3;
  }

  .cta-panel {
    flex-direction: column;
    gap: .25rem;
    padding: 0.8rem 1rem;
  }

  .cta-buttons {
    flex-direction: column;
    width: 88%;
    gap: 0.5rem;
    margin-bottom: .25rem;
  }

  .nav-controls {
    top: 40%;
  }

  .social-links {
    gap: 0.5rem;
  }

  .social-links .cosmic-social-icon {
    width: 2rem;
    height: 2rem;
  }

  .social-links .cosmic-social-icon img {
    width: 1rem;
    height: 1rem;
  }
  
  .referral-notification.mobile {
    width: 90%;
    right: 5%;
    left: 5%;
    max-width: none;
  }
}
</style>
