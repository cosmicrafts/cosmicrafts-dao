<template>
<section class="carousel">
  <div class="carousel">
    <!-- Carousel Viewport Wrapper -->
    <div class="carousel-viewport">
      <!-- Carousel Inner Wrapper -->
      <div class="carousel-inner" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <!-- Carousel Slides -->
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="carousel-slide"
          :style="{ backgroundImage: `url(${bgImageMap[slide.action]})` }"
        >
          <div class="carousel-content">
            <img :src="imageMap[slide.action]" :alt="slide.title" class="carousel-image" />
            <p class="carousel-description">{{ slide.description }}</p>
            <button class="cta-button" @click="handleClick(slide.action)">
              {{ slide.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Carousel Controls -->
    <button class="carousel-control prev" @click="prevSlide">‹</button>
    <button class="carousel-control next" @click="nextSlide">›</button>

    <!-- Carousel Indicators -->
    <div class="carousel-indicators">
      <span
        v-for="(slide, index) in slides"
        :key="index"
        :class="['indicator', { active: index === currentSlide }]"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</section>

</template>

<script setup>

import { useI18n } from 'vue-i18n';

// Manually import each image and create a map for them
import adventuresImg from '@/assets/webp/adventures.webp';
import battlegroundImg from '@/assets/webp/battlegrounds.webp';
import newsImg from '@/assets/webp/news.webp';
import technologyImg from '@/assets/icons/icp.svg';

import bgAdventuresImg from '@/assets/webp/bg-adventures.webp';
import bgBattlegroundImg from '@/assets/webp/bg-battlegrounds.webp';
import bgNewsImg from '@/assets/webp/bg-news.webp';
import bgTechnologyImg from '@/assets/webp/bg-technology.webp';

const bgImageMap = {
  adventures: bgAdventuresImg,
  battleground: bgBattlegroundImg,
  news: bgNewsImg,
  technology: bgTechnologyImg,
};


const imageMap = {
  adventures: adventuresImg,
  battleground: battlegroundImg,
  news: newsImg,
  technology: technologyImg,
};

const { t } = useI18n();
const currentSlide = ref(0);

// Load carousel slides from translations
const slides = ref([
  {
    title: t('carousel.slides[0].title'),
    description: t('carousel.slides[0].description'),
    buttonText: t('carousel.slides[0].buttonText'),
    action: 'adventures',
  },
  {
    title: t('carousel.slides[1].title'),
    description: t('carousel.slides[1].description'),
    buttonText: t('carousel.slides[1].buttonText'),
    action: 'battleground',
  },
  {
    title: t('carousel.slides[2].title'),
    description: t('carousel.slides[2].description'),
    buttonText: t('carousel.slides[2].buttonText'),
    action: 'news',
  },
  {
    title: t('carousel.slides[3].title'),
    description: t('carousel.slides[3].description'),
    buttonText: t('carousel.slides[3].buttonText'),
    action: 'technology',
  },
]);

// Emit event for the button click
const emit = defineEmits(['ctaClick']);
const handleClick = (action) => {
  emit('ctaClick', action);
};

const direction = ref('');

let interval;

// Function to start or restart the interval
const resetInterval = () => {
  clearInterval(interval); // Clear any existing interval
  interval = setInterval(nextSlide, 5000); // Restart the interval
};

// Manual slide navigation functions with interval reset
const nextSlide = () => {
  direction.value = 'slide-right';
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  resetInterval(); // Reset interval after manual interaction
};

const prevSlide = () => {
  direction.value = 'slide-left';
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
  resetInterval(); // Reset interval after manual interaction
};

const goToSlide = (index) => {
  currentSlide.value = index;
  resetInterval(); // Reset interval after manual interaction
};

// Initialize auto-slide on mount
onMounted(() => {
  interval = setInterval(nextSlide, 5000); // Start initial interval
});

// Clear interval on unmount
onUnmounted(() => {
  clearInterval(interval);
});

</script>

<style scoped>
.carousel {
  position: relative;
}

.carousel {
  position: absolute;
  width: 100%;
  height: 100%;
}

.carousel-viewport {
  width: 100%;
  height: 100%;
}

.carousel-inner {
  display: flex;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.25, 1);
  width: 100%;
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
}

.carousel-image {
  max-width: 12rem;
  margin-bottom: 1rem;
}

.carousel-description {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
}

.cta-button {
  background-color: #23221d;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.cta-button:hover {
  background-color: #3a7bd5;
  transform: scale(1.05);
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 2rem;
  padding: 1rem;
  border: none;
  cursor: pointer;
}

.carousel-control.prev {
  left: 1rem;
}

.carousel-control.next {
  right: 1rem;
}

.carousel-indicators {
  position: absolute;
  bottom: 1rem;
  display: flex;
  gap: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.indicator {
  width: 21px;
  height: 21px;
  background: #2b2b2b;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}

.indicator.active {
  background: #049bff;
}
</style>
