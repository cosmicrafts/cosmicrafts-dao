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
    'leave-animation-prev': isLeaving && slideDirection === 'prev'
  }"
  :style="{ transform: `translateY(${scrollY * -0.05}px) scale(${1 - scrollY * 0.000825})` }"
/>


  <!-- Hero Logo -->
  <img
    :src="slides[currentSlide].logo"
    alt="Game Logo"
    class="hero-logo"
    :class="{ 'enter-animation': isEntering, 'leave-animation': isLeaving }"
    :style="{ transform: `translateY(${scrollY * -0.05}px) scale(${1 - scrollY * -0.00055})` }"
  />

  <!-- Hero Title and Indicators Wrapper -->
  <div class="title-indicator-wrapper">
    <!-- Hero Title -->
    <h1
      class="hero-title"
      :class="{ 'enter-animation': isEntering, 'leave-animation': isLeaving }"
      :style="{ transform: `translateY(${scrollY * -0.055}px) scale(${1 - scrollY * -0.00055})` }"
    >
    {{ t(`hero.slides[${currentSlide}].title`) }}
    </h1>
  </div>
</div>

 <!-- Slide Indicators -->
 <div class="slide-indicators">
      <span
        v-for="(slide, i) in slides"
        :key="i"
        :class="{ active: currentSlide === i }"
        @click="goToSlide(i)"
      ></span>
    </div>


      <!-- CTA and Social Media Panel -->
      <div class="cta-panel">
        <div class="cta-buttons">
          <button
            v-for="(button, i) in slides[currentSlide].ctaButtons"
            :key="i"
            :class="['button', button.style]"
            @click="handleCTA(button.link)"
          >
          {{ t(`hero.slides[${currentSlide}].ctaButtons[${i}].text`) }}

          </button>
        </div>

        <!--
        <button @click="toggleFreeze" class="freeze-button">
  {{ isFrozen ? 'Unfreeze Slide' : 'Freeze Slide' }}
</button>
-->


        <!-- Social Media Links -->
        <div class="social-links">
          <a href="#"><img src="@/assets/icons/x.svg" alt="Twitter" /></a>
          <a href="#"><img src="@/assets/icons/discord.svg" alt="Discord" /></a>
          <a href="#"><img src="@/assets/icons/youtube.svg" alt="YouTube" /></a>
          <a href="#"><img src="@/assets/icons/instagram.svg" alt="Instagram" /></a>
          <a href="#"><img src="@/assets/icons/facebook.svg" alt="Facebook" /></a>
        </div>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="nav-controls">
      <button @click="prevSlide">&#10094;</button>
      <button @click="nextSlide">&#10095;</button>
    </div>

  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
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
    title: 'This is ground zero. Alpha’s live!',
    ctaButtons: [
      { text: 'Play Now', link: '#', style: 'primary' },
      { text: 'Wishlist on Steam', link: '#', style: 'secondary' },
    ],
  },
  {
    heroImage: dynamicHeroImage2,
    logo: logo2,
    title: 'The Party’s Here. Are You In or What?',
    ctaButtons: [
      { text: 'Join the Beta', link: '#', style: 'primary' },
      { text: 'Learn More', link: '#', style: 'secondary' },
    ],
  },
  // Slide 3
  {
    heroImage: heroImage3,
    logo: logo3,
    title: 'On-chain RTS. A Starlight Drift, Galactic Mayhem',
    ctaButtons: [
      { text: 'Pre-Order Now', link: '#', style: 'primary' },
      { text: 'Explore More', link: '#', style: 'secondary' },
    ],
  },
  // Slide 4
  {
    heroImage: heroImage4,
    logo: logo4,
    title: 'Lets get Social!, Invite Now and Claim Exclusive Rewards!',
    ctaButtons: [
      { text: 'Start Adventure', link: '#', style: 'primary' },
      { text: 'Follow on Socials', link: '#', style: 'secondary' },
    ],
  }
]);

// **Social Media Links**
const socialLinks = [
  { link: '#', icon: '@/assets/icons/x.svg', alt: 'Twitter' },
  { link: '#', icon: '@/assets/icons/discord.svg', alt: 'Discord' },
  { link: '#', icon: '@/assets/icons/youtube.svg', alt: 'YouTube' },
  { link: '#', icon: '@/assets/icons/instagram.svg', alt: 'Instagram' },
  { link: '#', icon: '@/assets/icons/facebook.svg', alt: 'Facebook' },
];

// **Function to handle CTA button clicks**
const handleCTA = (link) => {
  window.location.href = link;
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
    // Scrolling up - decrease speed but don’t go below minSpeed
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
    }, 100); // Match with CSS animation duration
  }, 100); // Match with CSS animation duration
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
  slideInterval = setInterval(nextSlide, 8888); // Auto-slide every 5 seconds
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
}

.noise-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 5;
}

.hero-image {
  max-width: 24rem;
  margin-top: -4rem;
  z-index: 2;
  opacity: 0.95;
  filter: drop-shadow(0px 0px 36px rgba(0, 119, 255, 0.5));
}

.hero-logo {
  max-width: 16rem;
  margin-top: -11rem;
  z-index: 3;
  filter: drop-shadow(0px 0px 36px rgba(0, 119, 255, 0.5));
}

.hero-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: -2rem;
  z-index: 3;
  text-shadow: 0px 0px 36px rgba(0, 174, 255, 0.507);
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
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.social-links img {
  opacity: 0.8;
  padding: 0.5rem;
  width: 24px;
  height: 24px;
  transition: transform 0.1s;
}

.social-links img:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.1);
  opacity: 1;
  border-radius: 8px;
  filter: drop-shadow(0px 0px 24px rgba(0, 145, 255, 0.784));
}

.cta-button {
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

/* **Navigation Controls** */
.nav-controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 7;
  transform: translateY(-50%);
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
}

.nav-controls button:hover {
  color: #00c3ff;
  filter: drop-shadow(0px 0px 4px rgba(0, 119, 255, 0.9));
}
.title-indicator-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* **Slide Indicators Container** */
.slide-indicators {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 6;
  margin-top: .25rem;
}

/* Slide Indicator Styling */
.slide-indicators span {
  cursor: pointer;
  display: inline-block;
  width: 16px;
  height: 16px;
  background: linear-gradient(180deg, rgb(58, 58, 58), rgb(42, 42, 42));
  border-radius: 50%;
  transition: transform 0.1s ease, background-color 0.1s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.574);
}

/* Hover Effect */
.slide-indicators span:hover {
  transform: scale(1.1);
  background: linear-gradient(180deg, rgb(121, 121, 121), rgb(60, 60, 60));
}

/* Active Slide Indicator */
.slide-indicators span.active {
  background: linear-gradient(180deg, rgb(0, 191, 255), rgb(0, 132, 255));
  box-shadow: 0 0 4px rgba(0, 174, 255, 0.75);
  transform: scale(1.4);
}

/* Hero Image Animation */
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
  animation: image-enter-next 0.1s ease forwards;
}

.hero-image.leave-animation-next {
  animation: image-leave-next 0.1s ease forwards;
}

.hero-image.enter-animation-prev {
  animation: image-enter-prev 0.1s ease forwards;
}

.hero-image.leave-animation-prev {
  animation: image-leave-prev 0.1s ease forwards;
}

.hero-logo.enter-animation {
  animation: logo-enter .1s ease forwards;
}

.hero-logo.leave-animation {
  animation: logo-leave .1s ease forwards;
}

.hero-title.enter-animation {
  animation: title-enter .1s ease forwards;
}

.hero-title.leave-animation {
  animation: title-leave .1s ease forwards;
}


@keyframes enter {
  to {
    opacity: .85;
    transform: scale(1);
  }
}

/* Leave Animation */
.leave-animation {
  opacity: .85;
  transform: scale(1);
  animation: leave .25s ease forwards;
}

@keyframes leave {
  to {
    opacity: 0;
    transform: scale(0.75);
  }
}

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
    max-width: 21rem;
    margin-top: -12rem;
  }

  .hero-logo {
    max-width: 16rem;
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
    font-size: 1.25rem;
    margin-top: -1rem;
    padding: 0 1rem
  }

  .slide-indicators span {
  width: 21px;
  height: 21px;
}

}
</style>
