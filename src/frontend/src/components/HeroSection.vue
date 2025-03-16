<template>
  <section class="hero">
    <!-- Background Canvas for Stars -->
    <canvas
      id="starfield"
      ref="starfield"
      class="noise-canvas"
      :style="{ top: `${scrollY * 0.5}px` }"
    ></canvas>

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
            :class="['cosmic-button', button.style === 'primary' ? 'cosmic-button-primary' : 'cosmic-button-outline', { 'initial-load': !hasLoadedOnce }]"
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
          <a href="https://x.com/cosmicrafts" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://www.youtube.com/@cosmicrafts" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/youtube.svg" alt="YouTube" />
          </a>
          <a href="https://instagram.com/cosmicraftz" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/instagram.svg" alt="Instagram" />
          </a>
          <a href="https://facebook.com/cosmicrafts" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/facebook.svg" alt="Facebook" />
          </a>
        </div>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="nav-controls" :class="{ 'initial-load': !hasLoadedOnce }">
      <button @click="prevSlide">&#10094;</button>
      <button @click="nextSlide">&#10095;</button>
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
const starSpeed = ref(0.5); // Default speed
const defaultSpeed = 0.1; // Define baseline speed
const maxSpeed = 2; // Set maximum speed limit
const minSpeed = 0.5; // Set minimum speed limit
const speedIncrement = 0.05; // Define smaller increment for finer control

let previousScrollY = 0;
const noiseCanvas = ref(null);

let n = 2000 + Math.floor(2000 * Math.random());
let w = 0, h = 0, x = 0, y = 0, z = 0;
let star_color_ratio = 0, star_x_save, star_y_save;
let star_ratio = 256;
let star = new Array(n);
let context;
let opacity = 0.1;

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

function init() {
  for (let i = 0; i < n; i++) {
    star[i] = new Array(5);
    
    // Create a more 3D distribution of stars
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = z * (0.1 + 0.9 * Math.random());
    
    star[i][0] = radius * Math.sin(phi) * Math.cos(theta);
    star[i][1] = radius * Math.sin(phi) * Math.sin(theta);
    star[i][2] = radius * Math.cos(phi);
    
    // Add color and size properties
    star[i][3] = 0; // x position
    star[i][4] = 0; // y position
    star[i][5] = 0.5 + Math.random() * 0.5; // size variation
  }
  const starfield = $i('starfield');
  starfield.width = w;
  starfield.height = h;
  context = starfield.getContext('2d');
  context.strokeStyle = 'rgb(255,255,255)';
  context.globalCompositeOperation = 'lighten';
}

function anim() {
  context.clearRect(0, 0, w, h);
  
  // Create a subtle glow effect by adding a semi-transparent overlay
  context.fillStyle = "rgba(0, 30, 60, 0.03)";
  context.fillRect(0, 0, w, h);
  
  // Add a subtle pulsing radial gradient in the center
  const gradient = context.createRadialGradient(x, y, 0, x, y, w * 0.5);
  gradient.addColorStop(0, "rgba(0, 100, 255, 0.03)");
  gradient.addColorStop(0.5, "rgba(0, 100, 255, 0.01)");
  gradient.addColorStop(1, "rgba(0, 100, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, w, h);
  
  // Add time-based variation
  const time = Date.now() * 0.001;
  
  for (let i = 0; i < n; i++) {
    // Save previous position
    star_x_save = star[i][3];
    star_y_save = star[i][4];
    
    // Update z position with time-based speed variation
    star[i][2] -= starSpeed.value * (1 + 0.1 * Math.sin(time * 0.5 + i * 0.01));
    
    // Keep stars in bounds
    if (star[i][2] > z) star[i][2] -= z;
    if (star[i][2] < 0) star[i][2] += z;
    
    // Calculate new screen position
    star[i][3] = x + (star[i][0] / star[i][2]) * star_ratio;
    star[i][4] = y + (star[i][1] / star[i][2]) * star_ratio;
    
    if (star_x_save > 0 && star_x_save < w && star_y_save > 0 && star_y_save < h) {
      // Calculate distance from center for color variation
      const dx = star[i][3] - x;
      const dy = star[i][4] - y;
      const dist = Math.sqrt(dx * dx + dy * dy) / (w * 0.5);
      
      // Color variations based on position and time
      const hue = (240 + dist * 60 + time * 10) % 360;
      const saturation = 80 + 20 * Math.sin(time + i * 0.1);
      const lightness = 70 + 20 * Math.sin(time * 0.5 + i * 0.05);
      
      // Varied line width based on z-position and time
      const lineWidth = (1 - star_color_ratio * star[i][2]) * (1.5 + 0.5 * Math.sin(time + i * 0.01));
      context.lineWidth = lineWidth;
      
      // Use HSL color for more dynamic coloring
      context.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.7 - dist * 0.5})`;
      
      // Draw the line
      context.beginPath();
      context.moveTo(star_x_save, star_y_save);
      context.lineTo(star[i][3], star[i][4]);
      context.stroke();
    }
  }
  requestAnimationFrame(anim);
}

function handleScroll() {
  const currentScrollY = window.scrollY;

  // Update scrollY for parallax effect
  scrollY.value = currentScrollY;

  // Adjust speed based on scroll direction
  if (currentScrollY > previousScrollY) {
    // Scrolling down - increase speed but cap it at maxSpeed
    starSpeed.value = Math.min(starSpeed.value + speedIncrement, maxSpeed);
  } else if (currentScrollY < previousScrollY) {
    // Scrolling up - decrease speed but don't go below minSpeed
    starSpeed.value = Math.max(starSpeed.value - speedIncrement, minSpeed);
  }

  // Update previous scroll position
  previousScrollY = currentScrollY;
}

function resize() {
  w = window.innerWidth;
  h = window.innerHeight;
  x = Math.round(w / 2);
  y = Math.round(h / 2);
  z = (w + h) / 2;
  star_color_ratio = 1 / z;
  init();
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
  
  setTimeout(() => {
    currentSlide.value = newSlide;
    isLeaving.value = false;
    isEntering.value = true;
    setTimeout(() => {
      isEntering.value = false;
    }, 50); // Faster animation
  }, 50); // Faster animation
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
  w = window.innerWidth;
  h = window.innerHeight;
  resize();
  anim();
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', resize);
  startAutoSlide(); // **Start auto-sliding**
  
  // Mark as loaded after initial animations - faster finish
  setTimeout(() => {
    hasLoadedOnce.value = true;
  }, 2000); // Shorter timeout for faster animations
  
  // Set initial mobile status
  updateMobileStatus();
  window.addEventListener('resize', updateMobileStatus);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', resize);
  stopAutoSlide(); // **Stop auto-sliding**
  
  // Clean up resize listener
  window.removeEventListener('resize', updateMobileStatus);
  
  // Clear notification timeout if it exists
  if (notificationTimeout.value) {
    clearTimeout(notificationTimeout.value);
  }
});
</script>


<style scoped>
.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  overflow: hidden;
  background: radial-gradient(circle at 30% 30%, rgb(22, 44, 76), rgb(8, 14, 26) 70%);
  /* Add initial state for page entry animation */
  opacity: 0;
  animation: revealPage 0.8s cubic-bezier(0.19, 1, 0.22, 1) 0.1s forwards; /* Faster animation */
  perspective: 1000px;
}

/* Page reveal animation */
@keyframes revealPage {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* Add starfield intro animation */
  opacity: 0;
  animation: starfieldReveal 1.2s cubic-bezier(0.19, 1, 0.22, 1) 0.2s forwards; /* Faster animation */
}

@keyframes starfieldReveal {
  0% {
    opacity: 0;
    filter: blur(4px) brightness(0.7);
  }
  100% {
    opacity: 1;
    filter: blur(0) brightness(1);
  }
}

.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 5;
  /* Add transform origin for content expansion */
  transform-origin: center center;
  transform-style: preserve-3d;
  transition: transform 0.5s ease-out;
}

/* Add a subtle hover effect to the hero content */
.slide:hover .hero-content {
  transform: translateZ(20px) rotateX(2deg);
}

/* Initial page load animation for hero content */
.hero-content {
  animation: contentReveal 0.8s cubic-bezier(0.19, 1, 0.22, 1) 0.3s forwards; /* Faster animation */
  opacity: 0;
}

@keyframes contentReveal {
  0% {
    opacity: 0;
    transform: scale(0.95) translateZ(-50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
}

/* Initial page load state for hero image (separated from slide transitions) */
.hero-image.initial-load {
  animation: heroImageEntry 1s cubic-bezier(0.23, 1, 0.32, 1) 0.4s forwards !important; /* Faster animation */
  opacity: 0;
  transform: translateY(30px) scale(0.9) translateZ(-10px);
}

.hero-image {
  max-width: 22rem;
  margin-top: -4rem;
  z-index: 2;
  opacity: 0.95;
  filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out, filter 0.3s ease-out;
}

.hero-image:hover {
  filter: drop-shadow(0px 0px 50px rgba(0, 217, 255, 0.45));
  transform: translateZ(30px) scale(1.05);
}

@keyframes heroImageEntry {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9) translateZ(-30px);
    filter: drop-shadow(0px 0px 0px rgba(0, 183, 255, 0));
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02) translateZ(20px);
    filter: drop-shadow(0px 0px 50px rgba(0, 183, 255, 0.4));
  }
  100% {
    opacity: 0.95;
    transform: translateY(0) scale(1) translateZ(0);
    filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  }
}

/* Initial page load state for hero logo (separated from slide transitions) */
.hero-logo.initial-load {
  animation: heroLogoEntry 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.6s forwards !important; /* Faster animation */
  opacity: 0;
  transform: translateY(-30px) scale(0.8) translateZ(-20px);
}

.hero-logo {
  max-width: 18rem; /* Increased from 16rem */
  margin-top: -11rem; /* Changed from -11rem to move it lower */
  z-index: 3;
  filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  transform-style: preserve-3d;
  transition: transform 0.4s ease-out, filter 0.4s ease-out;
}

.hero-logo:hover {
  filter: drop-shadow(0px 0px 40px rgba(0, 183, 255, 0.55));
  transform: translateZ(40px) scale(1.03) rotateY(5deg);
}

@keyframes heroLogoEntry {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8) translateZ(-50px);
    filter: drop-shadow(0px 0px 0px rgba(0, 183, 255, 0));
  }
  70% {
    opacity: 1;
    transform: translateY(5px) scale(1.05) translateZ(30px);
    filter: drop-shadow(0px 0px 50px rgba(0, 183, 255, 0.5));
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) translateZ(0);
    filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  }
}

/* Initial page load state for hero title (separated from slide transitions) */
.hero-title.initial-load {
  animation: titleEntry 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.7s forwards !important; /* Faster animation */
  opacity: 0;
  transform: translateY(20px) translateZ(-30px);
}

.hero-title {
  font-size: 2rem;
  font-weight: bold;
  margin-top: -3.5rem;
  z-index: 3;
  text-shadow: 0px 0px 36px rgba(0, 174, 255, 0.507);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(120, 200, 255, 0.9));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  padding: 0.5rem 1.5rem;
  transition: transform 0.4s ease-out, text-shadow 0.4s ease-out;
  transform-style: preserve-3d;
}

.hero-title:hover {
  text-shadow: 0px 0px 20px rgba(0, 174, 255, 0.9);
  transform: translateZ(25px);
}



@keyframes titleEntry {
  0% {
    opacity: 0;
    transform: translateY(20px) translateZ(-30px);
    text-shadow: 0px 0px 0px rgba(0, 174, 255, 0);
  }
  70% {
    opacity: 1;
    transform: translateY(-5px) translateZ(20px);
    text-shadow: 0px 0px 50px rgba(0, 174, 255, 0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) translateZ(0);
    text-shadow: 0px 0px 36px rgba(0, 174, 255, 0.507);
  }
}

/* Initial page load state for CTA panel (only animates on page load) */
.cta-panel.initial-load {
  animation: ctaPanelEntry 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.8s forwards; /* Faster animation */
  opacity: 0;
  transform: translateY(100%) translateZ(-50px);
}

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
  background: linear-gradient(125deg, rgba(49, 71, 119, 0.359), rgba(33, 44, 89, 0.428), rgba(127, 38, 139, 0.4));
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.181);
  z-index: 6;
  box-sizing: border-box;
  opacity: 1; /* Ensure it's visible by default after initial animation */
  transform-style: preserve-3d;
  transform: translateZ(0);
  transition: transform 0.5s ease-out, backdrop-filter 0.5s ease-out;
  box-shadow: 
    0 -10px 30px rgba(0, 0, 0, 0.2),
    0 -1px 10px rgba(0, 140, 255, 0.1);
  overflow: hidden;
}


/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1.2rem;
  position: relative;
  z-index: 2;
}

/* Initial page load state for buttons (only animates on page load) */
.cosmic-button.initial-load:nth-child(1) {
  animation: buttonEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.9s forwards; /* Faster animation */
  opacity: 0;
  transform: translateY(20px) translateZ(-20px);
}

.cosmic-button.initial-load:nth-child(2) {
  animation: buttonEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) 1.0s forwards; /* Faster animation */
  opacity: 0;
  transform: translateY(20px) translateZ(-20px);
}

/* Base cosmic button */
.cosmic-button {
  position: relative;
  padding: 0.7rem 1.6rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--cosmic-text-primary, rgba(255, 255, 255, 0.95));
  border-radius: 10px;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: none;
  overflow: hidden;
  z-index: 1;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.25),
    0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  text-transform: uppercase;
  transform-style: preserve-3d;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.cosmic-button:hover {
  transform: translateY(-3px) translateZ(10px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3), 
    0 0 20px rgba(15, 185, 253, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.cosmic-button:active {
  transform: translateY(-1px) translateZ(5px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2), 
    0 0 15px rgba(15, 185, 253, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.cosmic-button .button-text {
  position: relative;
  z-index: 3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(210, 230, 255, 0.9));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.cosmic-button:hover .button-text {
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(160, 220, 255, 1));
  -webkit-background-clip: text;
  filter: drop-shadow(0 0 5px rgba(0, 183, 255, 0.5));
}

/* Primary cosmic button */
.cosmic-button-primary {
  background: linear-gradient(135deg, 
    rgba(15, 185, 253, 0.85) 0%, 
    rgba(77, 207, 255, 0.85) 50%,
    rgba(0, 157, 223, 0.85) 100%);
  color: #fff;
  box-shadow: 
    0 6px 15px rgba(0, 0, 0, 0.25),
    0 0 15px rgba(15, 185, 253, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.cosmic-button-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(15, 185, 253, 0.8) 0%, 
    rgba(77, 207, 255, 0.9) 50%, 
    rgba(0, 140, 255, 0.8) 100%);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: translateZ(-1px);
}

.cosmic-button-primary:hover::before {
  opacity: 1;
  transform: translateZ(0);
}

/* Outline cosmic button */
.cosmic-button-outline {
  background: rgba(15, 185, 253, 0.08);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: rgba(15, 185, 253, 0.9);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(15, 185, 253, 0.1),
    inset 0 0 0 1px rgba(15, 185, 253, 0.1);
  backdrop-filter: blur(4px);
  text-shadow: 0 0 5px rgba(15, 185, 253, 0.4);
}

.cosmic-button-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 185, 253, 0.15);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease, transform 0.3s ease;
  transform: translateZ(-1px);
}

.cosmic-button-outline:hover {
  border-color: rgba(15, 185, 253, 0.5);
  color: rgba(15, 185, 253, 1);
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.6);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.25), 
    0 0 20px rgba(15, 185, 253, 0.3),
    inset 0 0 0 1px rgba(15, 185, 253, 0.2);
}

.cosmic-button-outline:hover::before {
  opacity: 1;
  transform: translateZ(0);
}

/* Button glow effect */
.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0;
  background: radial-gradient(circle at center, rgba(15, 185, 253, 0.6) 0%, transparent 70%);
  transition: opacity 0.5s ease;
  filter: blur(5px);
}

.cosmic-button:hover .button-glow {
  opacity: 0.8;
  animation: pulseGlow 2s infinite alternate;
}

@keyframes pulseGlow {
  0% {
    opacity: 0.4;
    transform: scale(1);
    filter: blur(5px);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.2);
    filter: blur(10px);
  }
}

/* Button particles effect */
.button-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.button-particles::before,
.button-particles::after {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(1px);
}

.button-particles::before {
  width: 6px;
  height: 6px;
  top: 30%;
  left: 20%;
  box-shadow: 
    30px 10px 0 -2px rgba(255, 255, 255, 0.6),
    60px -5px 0 -1px rgba(255, 255, 255, 0.5),
    90px 20px 0 -3px rgba(255, 255, 255, 0.4);
}

.button-particles::after {
  width: 4px;
  height: 4px;
  top: 60%;
  left: 30%;
  box-shadow: 
    25px -15px 0 -1px rgba(255, 255, 255, 0.5),
    55px 5px 0 -2px rgba(255, 255, 255, 0.4),
    75px -10px 0 rgba(255, 255, 255, 0.3);
}

.cosmic-button:hover .button-particles::before,
.cosmic-button:hover .button-particles::after {
  opacity: 1;
  animation: floatParticles 3s linear infinite;
}

@keyframes floatParticles {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(20px) translateY(-5px);
    opacity: 0.5;
  }
}

@keyframes buttonEntry {
  0% {
    opacity: 0;
    transform: translateY(20px) translateZ(-20px);
  }
  70% {
    opacity: 1;
    transform: translateY(-5px) translateZ(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

.social-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

/* Initial page load state for social links (only animates on page load) */
.social-links a.initial-load:nth-child(1) {
  animation: socialIconEntry 0.4s cubic-bezier(0.23, 1, 0.32, 1) 1.0s forwards; /* Faster animation */
  opacity: 0;
  transform: scale(0.7);
}

.social-links a.initial-load:nth-child(2) {
  animation: socialIconEntry 0.4s cubic-bezier(0.23, 1, 0.32, 1) 1.05s forwards; /* Faster animation */
  opacity: 0;
  transform: scale(0.7);
}

.social-links a.initial-load:nth-child(3) {
  animation: socialIconEntry 0.4s cubic-bezier(0.23, 1, 0.32, 1) 1.1s forwards; /* Faster animation */
  opacity: 0;
  transform: scale(0.7);
}

.social-links a.initial-load:nth-child(4) {
  animation: socialIconEntry 0.4s cubic-bezier(0.23, 1, 0.32, 1) 1.15s forwards; /* Faster animation */
  opacity: 0;
  transform: scale(0.7);
}

.social-links a.initial-load:nth-child(5) {
  animation: socialIconEntry 0.4s cubic-bezier(0.23, 1, 0.32, 1) 1.2s forwards; /* Faster animation */
  opacity: 0;
  transform: scale(0.7);
}

.social-links a {
  opacity: 0.8; /* Ensure social links are visible by default after initial animation */
}

@keyframes socialIconEntry {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  70% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
}

.social-links img {
  opacity: 0.8;
  padding: 0.5rem;
  width: 24px;
  height: 24px;
  transition: transform 0.1s, opacity 0.1s, filter 0.1s;
}

.social-links img:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.1);
  opacity: 1;
  border-radius: 8px;
  filter: drop-shadow(0px 0px 24px rgba(0, 145, 255, 0.784));
}

/* **Navigation Controls** */
/* Initial page load state for nav controls (only animates on page load) */
.nav-controls.initial-load {
  animation: navControlsEntry 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.9s forwards; /* Faster animation */
  opacity: 0;
}

.nav-controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 7;
  transform: translateY(-50%);
  opacity: 1; /* Ensure it's visible by default after initial animation */
  pointer-events: none; /* Make container transparent to clicks */
}

@keyframes navControlsEntry {
  0% {
    opacity: 0;
    transform: translateY(-50%) scale(0.9);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
    filter: blur(0);
  }
}

.nav-controls button {
  pointer-events: auto; /* Make buttons clickable */
  background: rgba(0, 26, 54, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  color: #fff;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 1.5rem;
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 5px 15px rgba(0, 0, 0, 0.2),
    0 0 5px rgba(0, 80, 255, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.nav-controls button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.4s ease;
}

.nav-controls button:hover {
  color: #00c3ff;
  transform: translateZ(10px) scale(1.08);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(0, 119, 255, 0.5),
    inset 0 0 0 1px rgba(0, 119, 255, 0.2);
}

.nav-controls button:hover::before {
  opacity: 1;
  animation: pulse 1.5s infinite alternate;
  transform: scale(1);
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(0.9) rotate(0deg);
  }
  100% {
    opacity: 0.7;
    transform: scale(1.1) rotate(35deg);
  }
}

.title-indicator-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-style: preserve-3d;
}

/* **Slide Indicators Container** */
/* Initial page load state for slide indicators (only animates on page load) */
.slide-indicators.initial-load {
  animation: indicatorsEntry 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.8s forwards; /* Faster animation */
  opacity: 0;
}

.slide-indicators {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 6;
  margin-top: .25rem;
  opacity: 1; /* Ensure it's visible by default after initial animation */
  transform-style: preserve-3d;
}

@keyframes indicatorsEntry {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(15px) translateZ(-20px);
  }
  70% {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px) translateZ(15px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) translateZ(0);
  }
}

/* Slide Indicator Styling */
/* Initial page load state for indicator dots (only animates on page load) */
.slide-indicators span.initial-load {
  opacity: 0;
  transform: scale(0) translateZ(-10px);
}

.slide-indicators span.initial-load:nth-child(1) {
  animation: indicatorDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s forwards; /* Faster animation */
}

.slide-indicators span.initial-load:nth-child(2) {
  animation: indicatorDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.85s forwards; /* Faster animation */
}

.slide-indicators span.initial-load:nth-child(3) {
  animation: indicatorDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.9s forwards; /* Faster animation */
}

.slide-indicators span.initial-load:nth-child(4) {
  animation: indicatorDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.95s forwards; /* Faster animation */
}

.slide-indicators span {
  cursor: pointer;
  display: inline-block;
  width: 16px;
  height: 16px;
  background: linear-gradient(145deg, rgb(34, 51, 68), rgb(22, 38, 54));
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
    background-color 0.3s ease, 
    box-shadow 0.3s ease,
    border 0.3s ease;
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  opacity: 1; /* Ensure dots are visible by default after initial animation */
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
}

.slide-indicators span::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

@keyframes indicatorDot {
  0% {
    opacity: 0;
    transform: scale(0) translateZ(-20px);
  }
  70% {
    opacity: 1;
    transform: scale(1.3) translateZ(15px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
}

/* Hover Effect */
.slide-indicators span:hover {
  transform: scale(1.2) translateZ(10px);
  background: linear-gradient(145deg, rgb(51, 79, 107), rgb(41, 60, 79));
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.5),
    0 0 8px rgba(0, 140, 255, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.slide-indicators span:hover::before {
  opacity: 1;
}

/* Active Slide Indicator */
/* Initial page load animation for active indicator */
.slide-indicators span.active.initial-load {
  animation: activeIndicator 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.0s forwards !important; /* Faster animation */
}

.slide-indicators span.active {
  background: linear-gradient(145deg, rgb(0, 171, 255), rgb(0, 102, 255));
  box-shadow: 
    0 0 15px rgba(0, 174, 255, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transform: scale(1.4) translateZ(15px);
  border: 1px solid rgba(0, 140, 255, 0.5);
}

.slide-indicators span.active::before {
  opacity: 1;
  animation: activeGlow 2s infinite alternate;
}

@keyframes activeGlow {
  0% {
    opacity: 0.5;
    background-position: 0% 0%;
  }
  100% {
    opacity: 1;
    background-position: 100% 100%;
  }
}

@keyframes activeIndicator {
  0% {
    opacity: 0;
    transform: scale(0) translateZ(-30px);
    box-shadow: 0 0 0px rgba(0, 174, 255, 0);
  }
  50% {
    opacity: 1;
    transform: scale(1.6) translateZ(25px);
    box-shadow: 0 0 20px rgba(0, 174, 255, 1);
  }
  100% {
    opacity: 1;
    transform: scale(1.4) translateZ(15px);
    box-shadow: 0 0 15px rgba(0, 174, 255, 0.4);
  }
}

/* Responsive Styles Enhancement */
@media (max-width: 1024px) {
  .hero-image {
    max-width: 24rem;
    margin-top: -8rem;
  }

  .hero-logo {
    max-width: 18rem; /* Increased from 16rem */
    margin-top: -11rem; /* Adjusted for responsive view */
  }

  /* Slightly smaller hero title text */
  .hero-title {
    font-size: 2rem;
    padding: 0 1rem;
    margin-top: -2rem;
  }
  
  /* Slightly smaller navigation buttons */
  .nav-controls button {
    width: 3rem;
    height: 3rem;
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {

  
  .hero-image {
    max-width: 18rem; /* Reduced from 24rem */
    margin-top: -8rem;
  }

  .hero-logo {
    max-width: 8rem; /* Increased from 12rem */
    margin-top: -7rem; /* Adjusted for mobile */
  }

  /* Specific style for the DAO slide (index 1) */
  :deep(.slide:nth-child(2) .hero-image) {
    max-width: 16rem; /* Even smaller for the DAO SVG */
  }
  
  :deep(.slide:nth-child(2) .hero-logo) {
    max-width: 10rem; /* Increased from 8rem */
  }

  /* Stack CTA panel items in rows */
  .cta-panel {
    flex-direction: column;
    gap: .5rem;
    padding: 1.2rem 1rem;
  }

  /* Slide indicator adjustments for mobile */
  .slide-indicators {
    margin-top: 1rem;
  }
  
  .slide-indicators span {
    width: 16px;
    height: 16px;
    margin: 0 4px;
  }

  /* Each button takes full width in its row */
  .cta-buttons {
    flex-direction: column;
    width: 88%;
    gap: 0.8rem;
    margin-bottom: .5rem;
  }

  /* Smaller hero title text */
  .hero-title {
    font-size: 0.9rem; /* Reduced from 1rem */
    margin-top: -.5rem;
    padding: 0 1rem;
    line-height: 1.3;
  }
  
  /* Compact nav buttons */
  .nav-controls button {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
    margin: 0 0.5rem;
  }
  
  /* Mobile-optimized animations */
  .hero-image:hover, 
  .hero-logo:hover, 
  .hero-title:hover {
    transform: none; /* Disable hover effects on mobile */
  }
  
  .slide:hover .hero-content {
    transform: none; /* Disable hover effect */
  }
}

/* Add even smaller sizes for very small devices */
@media (max-width: 480px) {
  .hero-image {
    margin-top: -7rem;
    max-width: 15rem;
  }
  
  .hero-logo {
    max-width: 12rem; /* Increased from 8rem */
    margin-top: -6rem; /* Adjusted for very small screens */
  }
  
  :deep(.slide:nth-child(2) .hero-image) {
    max-width: 14rem;
  }
  
  :deep(.slide:nth-child(2) .hero-logo) {
    max-width: 8rem; /* Increased from 7rem */
  }
  
  .hero-title {
    font-size: 0.8rem;
    padding: 0.4rem 1rem;
  }
  
  /* Further compact nav buttons */
  .nav-controls button {
    width: 2.2rem;
    height: 2.2rem;
    font-size: 1rem;
    margin: 0 0.3rem;
  }
  
  /* Even smaller indicators */
  .slide-indicators span {
    width: 12px;
    height: 12px;
  }
  
  /* Add glassmorphism to the title for better readability */
  .hero-title::before {
    background: rgba(0, 20, 40, 0.4);
    backdrop-filter: blur(4px);
  }
  
  /* Optimize CTA panel for very small screens */
  .cta-panel {
    padding: 1rem 0.8rem;
  }
  
  .cta-buttons {
    width: 95%;
  }
  
  .cosmic-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}

/* Media query for landscape orientation on mobile */
@media (max-height: 480px) and (orientation: landscape) {
  .hero-image {
    max-width: 12rem;
    margin-top: -3rem;
  }
  
  .hero-logo {
    max-width: 8rem;
    margin-top: -3.5rem;
  }
  
  .hero-title {
    font-size: 0.8rem;
    margin-top: -0.5rem;
  }
  
  .cta-panel {
    flex-direction: row;
    padding: 0.8rem;
  }
  
  .cta-buttons {
    flex-direction: row;
    width: auto;
    gap: 0.8rem;
    margin-bottom: 0;
  }
  
  .nav-controls button {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
  
  .social-links {
    display: none; /* Hide social links in landscape for space */
  }
}
</style>
