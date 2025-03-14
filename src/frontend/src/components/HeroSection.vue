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
            @click="handleCTA(button.link)"
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
          <a href="https://twitter.com/CosmicraftsDAO" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          <a href="https://discord.com/invite/cosmicrafts-884272584491941888" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          <a href="https://www.youtube.com/@CosmicraftsDAO" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/youtube.svg" alt="YouTube" />
          </a>
          <a href="https://instagram.com/CosmicraftsDAO" :class="{ 'initial-load': !hasLoadedOnce }">
            <img src="@/assets/icons/instagram.svg" alt="Instagram" />
          </a>
          <a href="https://facebook.com/CosmicraftsDAO" :class="{ 'initial-load': !hasLoadedOnce }">
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
      { text: 'Play Now', link: '/games/adventures', style: 'primary' },
      { text: 'Wishlist on Steam', link: 'https://store.steampowered.com/app/CosmicraftsAdventures', style: 'secondary' },
    ],
  },
  {
    heroImage: dynamicHeroImage2,
    logo: logo2,
    title: "The Party's Here. Are You In or What?",
    ctaButtons: [
      { text: 'Join the Beta', link: '/signup', style: 'primary' },
      { text: 'Learn More', link: '/about', style: 'secondary' },
    ],
  },
  // Slide 3
  {
    heroImage: heroImage3,
    logo: logo3,
    title: 'On-chain RTS. A Starlight Drift, Galactic Mayhem',
    ctaButtons: [
      { text: 'Pre-Order Now', link: '/games/battlegrounds', style: 'primary' },
      { text: 'Explore More', link: '/games', style: 'secondary' },
    ],
  },
  // Slide 4
  {
    heroImage: heroImage4,
    logo: logo4,
    title: 'Lets get Social!, Invite Now and Claim Exclusive Rewards!',
    ctaButtons: [
      { text: 'Start Adventure', link: '/dashboard', style: 'primary' },
      { text: 'Follow on Socials', link: 'https://discord.com/invite/cosmicrafts-884272584491941888', style: 'secondary' },
    ],
  }
]);

// **Social Media Links**
const socialLinks = [
  { link: 'https://twitter.com/CosmicraftsDAO', icon: '@/assets/icons/x.svg', alt: 'Twitter' },
  { link: 'https://discord.com/invite/cosmicrafts-884272584491941888', icon: '@/assets/icons/discord.svg', alt: 'Discord' },
  { link: 'https://www.youtube.com/@CosmicraftsDAO', icon: '@/assets/icons/youtube.svg', alt: 'YouTube' },
  { link: 'https://instagram.com/CosmicraftsDAO', icon: '@/assets/icons/instagram.svg', alt: 'Instagram' },
  { link: 'https://facebook.com/CosmicraftsDAO', icon: '@/assets/icons/facebook.svg', alt: 'Facebook' },
];

// **Function to handle CTA button clicks**
const handleCTA = (link) => {
  if (link.startsWith('http')) {
    // For external links, open in a new tab
    window.open(link, '_blank');
  } else {
    // For internal links, use vue-router
    router.push(link);
  }
};

function $i(id) {
  return document.getElementById(id);
}

function init() {
  for (let i = 0; i < n; i++) {
    star[i] = new Array(5);
    star[i][0] = Math.random() * w * 2 - x * 2;
    star[i][1] = Math.random() * h * 2 - y * 2;
    star[i][2] = Math.round(Math.random() * z);
    star[i][3] = 0;
    star[i][4] = 0;
  }
  const starfield = $i('starfield');
  starfield.width = w;
  starfield.height = h;
  context = starfield.getContext('2d');
  context.strokeStyle = 'rgb(255,255,255)';
}

function anim() {
  context.clearRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    star_x_save = star[i][3];
    star_y_save = star[i][4];
    star[i][2] -= starSpeed.value;
    if (star[i][2] > z) star[i][2] -= z;
    if (star[i][2] < 0) star[i][2] += z;
    star[i][3] = x + (star[i][0] / star[i][2]) * star_ratio;
    star[i][4] = y + (star[i][1] / star[i][2]) * star_ratio;
    if (star_x_save > 0 && star_x_save < w && star_y_save > 0 && star_y_save < h) {
      context.lineWidth = (1 - star_color_ratio * star[i][2]) * 1;
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
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', resize);
  stopAutoSlide(); // **Stop auto-sliding**
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
  background: radial-gradient(circle, rgb(12, 24, 46), rgb(25, 24, 24));
  /* Add initial state for page entry animation */
  opacity: 0;
  animation: revealPage 0.8s cubic-bezier(0.19, 1, 0.22, 1) 0.1s forwards; /* Faster animation */
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
}

/* Initial page load animation for hero content */
.hero-content {
  animation: contentReveal 0.8s cubic-bezier(0.19, 1, 0.22, 1) 0.3s forwards; /* Faster animation */
  opacity: 0;
}

@keyframes contentReveal {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Initial page load state for hero image (separated from slide transitions) */
.hero-image.initial-load {
  animation: heroImageEntry 1s cubic-bezier(0.23, 1, 0.32, 1) 0.4s forwards !important; /* Faster animation */
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.hero-image {
  max-width: 24rem;
  margin-top: -4rem;
  z-index: 2;
  opacity: 0.95;
  filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
}

@keyframes heroImageEntry {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
    filter: drop-shadow(0px 0px 0px rgba(0, 183, 255, 0));
  }
  60% {
    opacity: 1;
    transform: translateY(-10px) scale(1.02);
    filter: drop-shadow(0px 0px 50px rgba(0, 183, 255, 0.4));
  }
  100% {
    opacity: 0.95;
    transform: translateY(0) scale(1);
    filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  }
}

/* Initial page load state for hero logo (separated from slide transitions) */
.hero-logo.initial-load {
  animation: heroLogoEntry 0.9s cubic-bezier(0.23, 1, 0.32, 1) 0.6s forwards !important; /* Faster animation */
  opacity: 0;
  transform: translateY(-30px) scale(0.8);
}

.hero-logo {
  max-width: 16rem;
  margin-top: -11rem;
  z-index: 3;
  filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
}

@keyframes heroLogoEntry {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
    filter: drop-shadow(0px 0px 0px rgba(0, 183, 255, 0));
  }
  70% {
    opacity: 1;
    transform: translateY(5px) scale(1.05);
    filter: drop-shadow(0px 0px 50px rgba(0, 183, 255, 0.5));
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: drop-shadow(0px 0px 36px rgba(0, 183, 255, 0.25));
  }
}

/* Initial page load state for hero title (separated from slide transitions) */
.hero-title.initial-load {
  animation: titleEntry 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.7s forwards !important; /* Faster animation */
  opacity: 0;
  transform: translateY(20px);
}

.hero-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: -2rem;
  z-index: 3;
  text-shadow: 0px 0px 36px rgba(0, 174, 255, 0.507);
}

@keyframes titleEntry {
  0% {
    opacity: 0;
    transform: translateY(20px);
    text-shadow: 0px 0px 0px rgba(0, 174, 255, 0);
  }
  70% {
    opacity: 1;
    transform: translateY(-5px);
    text-shadow: 0px 0px 50px rgba(0, 174, 255, 0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    text-shadow: 0px 0px 36px rgba(0, 174, 255, 0.507);
  }
}

/* Initial page load state for CTA panel (only animates on page load) */
.cta-panel.initial-load {
  animation: ctaPanelEntry 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.8s forwards; /* Faster animation */
  opacity: 0;
  transform: translateY(100%);
}

.cta-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  gap: 1rem;
  background: linear-gradient(to bottom, rgba(22, 24, 31, 0.1), rgba(24, 27, 34, 0.2));
  backdrop-filter: blur(4px);
  border-top: 1px solid #ffffff12;
  z-index: 6;
  box-sizing: border-box;
  opacity: 1; /* Ensure it's visible by default after initial animation */
}

@keyframes ctaPanelEntry {
  0% {
    opacity: 0;
    transform: translateY(100%);
    backdrop-filter: blur(0px);
    border-top: 1px solid rgba(255, 255, 255, 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    backdrop-filter: blur(4px);
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
}

/* Initial page load state for buttons (only animates on page load) */
.cosmic-button.initial-load:nth-child(1) {
  animation: buttonEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.9s forwards; /* Faster animation */
  opacity: 0;
  transform: translateY(20px);
}

.cosmic-button.initial-load:nth-child(2) {
  animation: buttonEntry 0.5s cubic-bezier(0.23, 1, 0.32, 1) 1.0s forwards; /* Faster animation */
  opacity: 0;
  transform: translateY(20px);
}

/* Base cosmic button */
.cosmic-button {
  position: relative;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--cosmic-text-primary, rgba(255, 255, 255, 0.95));
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: none;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
}

.cosmic-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25), 0 0 15px rgba(15, 185, 253, 0.3);
}

.cosmic-button:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 0 10px rgba(15, 185, 253, 0.2);
}

.cosmic-button .button-text {
  position: relative;
  z-index: 3;
}

/* Primary cosmic button */
.cosmic-button-primary {
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.9) 0%, rgba(77, 207, 255, 0.9) 100%);
  color: #fff;
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(15, 185, 253, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.cosmic-button-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.6) 0%, rgba(77, 207, 255, 0.8) 50%, rgba(15, 185, 253, 0.9) 100%);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.cosmic-button-primary:hover {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.25), 
    0 0 20px rgba(15, 185, 253, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.cosmic-button-primary:hover::before {
  opacity: 1;
}

/* Outline cosmic button */
.cosmic-button-outline {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: rgba(15, 185, 253, 0.9);
  box-shadow: 
    0 4px 10px rgba(0, 0, 0, 0.15),
    0 0 10px rgba(15, 185, 253, 0.1);
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
  background: rgba(15, 185, 253, 0.1);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.cosmic-button-outline:hover {
  border-color: rgba(15, 185, 253, 0.6);
  color: rgba(15, 185, 253, 1);
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.6);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.2), 
    0 0 15px rgba(15, 185, 253, 0.3);
}

.cosmic-button-outline:hover::before {
  opacity: 1;
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
  background: radial-gradient(circle at center, rgba(15, 185, 253, 0.4) 0%, transparent 70%);
  transition: opacity 0.5s ease;
}

.cosmic-button:hover .button-glow {
  opacity: 0.6;
  animation: pulseGlow 2s infinite alternate;
}

@keyframes pulseGlow {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  100% {
    opacity: 0.8;
    transform: scale(1.1);
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
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.button-particles::before {
  width: 6px;
  height: 6px;
  top: 30%;
  left: 20%;
  box-shadow: 
    30px 10px 0 -2px rgba(255, 255, 255, 0.4),
    60px -5px 0 -1px rgba(255, 255, 255, 0.2),
    90px 20px 0 -3px rgba(255, 255, 255, 0.1);
}

.button-particles::after {
  width: 4px;
  height: 4px;
  top: 60%;
  left: 30%;
  box-shadow: 
    25px -15px 0 -1px rgba(255, 255, 255, 0.3),
    55px 5px 0 -2px rgba(255, 255, 255, 0.2),
    75px -10px 0 rgba(255, 255, 255, 0.1);
}

.cosmic-button:hover .button-particles::before,
.cosmic-button:hover .button-particles::after {
  opacity: 1;
  animation: floatParticles 3s linear infinite;
}

@keyframes floatParticles {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(20px);
  }
}

@keyframes buttonEntry {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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
}

@keyframes navControlsEntry {
  0% {
    opacity: 0;
    transform: translateY(-50%) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

.nav-controls button {
  background: none;
  filter: drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.5));
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #fff;
  padding: 0 1rem;
  width: 4rem;
  height: 3rem;
  transition: color 0.2s, filter 0.2s;
}

.nav-controls button:hover {
  color: #00c3ff;
  filter: drop-shadow(0px 0px 8px rgba(0, 119, 255, 0.9));
}

.title-indicator-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
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
}

@keyframes indicatorsEntry {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(15px);
  }
  70% {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Slide Indicator Styling */
/* Initial page load state for indicator dots (only animates on page load) */
.slide-indicators span.initial-load {
  opacity: 0;
  transform: scale(0);
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
  background: linear-gradient(180deg, rgb(58, 58, 58), rgb(42, 42, 42));
  border-radius: 50%;
  transition: transform 0.1s ease, background-color 0.1s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.574);
  opacity: 1; /* Ensure dots are visible by default after initial animation */
}

@keyframes indicatorDot {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70% {
    opacity: 1;
    transform: scale(1.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hover Effect */
.slide-indicators span:hover {
  transform: scale(1.1);
  background: linear-gradient(180deg, rgb(121, 121, 121), rgb(60, 60, 60));
}

/* Active Slide Indicator */
/* Initial page load animation for active indicator */
.slide-indicators span.active.initial-load {
  animation: activeIndicator 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.0s forwards !important; /* Faster animation */
}

.slide-indicators span.active {
  background: linear-gradient(180deg, rgb(0, 191, 255), rgb(0, 132, 255));
  box-shadow: 0 0 4px rgba(0, 174, 255, 0.75);
  transform: scale(1.4);
}

@keyframes activeIndicator {
  0% {
    opacity: 0;
    transform: scale(0);
    box-shadow: 0 0 0px rgba(0, 174, 255, 0);
  }
  50% {
    opacity: 1;
    transform: scale(1.6);
    box-shadow: 0 0 15px rgba(0, 174, 255, 1);
  }
  100% {
    opacity: 1;
    transform: scale(1.4);
    box-shadow: 0 0 4px rgba(0, 174, 255, 0.75);
  }
}

/* Make slide transition animations faster */
/* Next Slide Animations */
@keyframes image-enter-next {
  0% {
    opacity: 0;
    transform: translateX(-50%) rotate(-10deg) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateX(0) rotate(0deg) scale(1);
  }
}

@keyframes image-leave-next {
  0% {
    opacity: 1;
    transform: translateX(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(50%) rotate(10deg) scale(0.8);
  }
}

/* Previous Slide Animations */
@keyframes image-enter-prev {
  0% {
    opacity: 0;
    transform: translateX(50%) rotate(10deg) scale(0.8);
  }
  100% {
    opacity: .85;
    transform: translateX(0) rotate(0deg) scale(1);
  }
}

@keyframes image-leave-prev {
  0% {
    opacity: .85;
    transform: translateX(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) rotate(-10deg) scale(0.8);
  }
}

/* Hero Logo Animation */
@keyframes logo-enter {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-30%);
  }
  100% {
    opacity: .85;
    transform: scale(1) translateY(0);
  }
}

@keyframes logo-leave {
  0% {
    opacity: .85;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) translateY(-30%);
  }
}

/* Hero Title Animation */
@keyframes title-enter {
  0% {
    opacity: 0;
    transform: translateY(20%) scale(0.9);
  }
  100% {
    opacity: .85;
    transform: translateY(0) scale(1);
  }
}

@keyframes title-leave {
  0% {
    opacity: .85;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(20%) scale(0.9);
  }
}

.hero-image.enter-animation-next {
  animation: image-enter-next 0.05s ease-out forwards; /* Faster animation */
}

.hero-image.leave-animation-next {
  animation: image-leave-next 0.05s ease-out forwards; /* Faster animation */
}

.hero-image.enter-animation-prev {
  animation: image-enter-prev 0.05s ease-out forwards; /* Faster animation */
}

.hero-image.leave-animation-prev {
  animation: image-leave-prev 0.05s ease-out forwards; /* Faster animation */
}

.hero-logo.enter-animation {
  animation: logo-enter 0.05s ease-out forwards; /* Faster animation */
}

.hero-logo.leave-animation {
  animation: logo-leave 0.05s ease-out forwards; /* Faster animation */
}

.hero-title.enter-animation {
  animation: title-enter 0.05s ease-out forwards; /* Faster animation */
}

.hero-title.leave-animation {
  animation: title-leave 0.05s ease-out forwards; /* Faster animation */
}

/* Keep existing responsive media queries */
@media (max-width: 1024px) {
  .hero-image {
    max-width: 24rem;
    margin-top: -8rem;
  }

  .hero-logo {
    max-width: 16rem;
    margin-top: -10.5rem;
  }

  /* Slightly smaller hero title text */
  .hero-title {
    font-size: 2rem;
    padding: 0 1rem;
    margin-top: -2rem;
  }

}

@media (max-width: 768px) {
  .hero-image {
    max-width: 24rem;
    margin-top: -8rem;
  }

  .hero-logo {
    max-width: 12rem;
    margin-top: -10rem;
  }

      /* Stack CTA panel items in rows */
      .cta-panel {
    flex-direction: column;
    gap: .25rem;
    padding: 1rem;
  }

  .slide-indicators span {
  width: 32px;
  height: 32px;
}

  /* Each button takes full width in its row */
  .cta-buttons {
    flex-direction: column;
    width:88%;
    margin-bottom: .25rem;
  }

  /* Slightly smaller hero title text */
  .hero-title {
    font-size: 1rem;
    margin-top: -.5rem;
    padding: 0 1rem
  }

  .slide-indicators span {
  width: 21px;
  height: 21px;
}

}

/* Add accessibility support for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero,
  .noise-canvas,
  .hero-content,
  .hero-image,
  .hero-logo,
  .hero-title,
  .cta-panel,
  .button,
  .social-links a,
  .nav-controls,
  .slide-indicators,
  .slide-indicators span,
  .slide-indicators span.active {
    animation: simpleAppear 0.5s ease forwards !important;
    transition: none !important;
    animation-delay: 0s !important;
  }
  
  @keyframes simpleAppear {
    to {
      opacity: 1;
      transform: none;
    }
  }
}
</style>
