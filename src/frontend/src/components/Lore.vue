<template>
  <div class="parallax-wrapper" @scroll="handleScroll">
    <!-- Semi-Transparent Overlay -->
    <div class="color-overlay"></div>

    <div class="parallax-scene">
      <div class="scrollDist"></div>
      <main>
        <svg
          viewBox="0 0 1200 800"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          width="100%"
          height="100%"
        >
          <!-- Mask -->
          <mask id="m">
            <g class="cloud1">
              <rect fill="#fff" width="100%" height="800" y="799" />
              <image :href="maskImage" width="100%" height="100%" />
            </g>
          </mask>

          <!-- Background Layers -->
          <g v-for="image in images" :key="image.class">
            <image
              :class="image.class"
              :href="image.src"
              :width="image.width"
              :height="image.height"
              preserveAspectRatio="xMidYMid slice"
              :style="getTransform(image)"
            />
          </g>

          <!-- Centered Explore Text -->
          <text
            class="explore-text"
            x="50%"
            y="45%"
            text-anchor="middle"
            dominant-baseline="middle"
            :style="getTextStyle('explore-text')"
          >
            {{ $t('darkRift.discover') }}
          </text>

          <!-- Masked FURTHER Text -->
          <g mask="url(#m)">
            <rect fill="#fff" width="1200" height="800" />
            <text
              class="further-text"
              x="50%"
              y="45%"
              text-anchor="middle"
              dominant-baseline="middle"
              :style="getTextStyle('further-text')"
            >
              {{ $t('darkRift.title') }}
            </text>
          </g>
        </svg>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import skyImage from "@/assets/webp/go.webp";
import darkrift from "@/assets/webp/darkrift.webp";
import stars from "@/assets/webp/starsbig.webp";
import cloud1Mask from "@/assets/webp/cloud1Mask.webp";
import asteroids from "@/assets/webp/asteroids.webp";
import nebula from "@/assets/webp/nebula1.webp";
import planet1 from "@/assets/webp/planet1.webp";
import planet2 from "@/assets/webp/planet3.webp";

export default {
  name: "ParallaxScene",
  setup() {
    const scrollY = ref(0);

    // Define the animations for each layer
    const images = [
      { class: "sky", src: skyImage, y: -390, x: 200, scale: 0.85, rotation: -4 },
      { class: "darkrift", src: darkrift, y: -390, x: 200, scale: 0.85, rotation: -4 },
      { class: "stars", src: stars, y: 100, x: 150, scale: 1.85, rotation: -25 },
      { class: "cloud1", src: asteroids, y: -800, x: 0, scale: 1, rotation: 0 },
      { class: "nebula", src: nebula, y: 0, x: 0, scale: 0.25, rotation: 0 },
      { class: "cloud3", src: cloud1Mask, y: -650, x: 0, scale: 1, rotation: 0 },
      { class: "planet1", src: planet1, y: 0, x: -200, scale: 0.25, rotation: -25 },
      { class: "planet2", src: planet2, y: 350, x: 1200, scale: 0.25, rotation: 25 },
    ];

    const handleScroll = () => {
      scrollY.value = window.scrollY;
    };

    // Get transformation styles for each image layer
    const getTransform = (image) => {
      const y = scrollY.value * (image.y / 1000);
      const x = scrollY.value * (image.x / 1000);
      const scale = 1 + scrollY.value * (image.scale / 10000);
      const rotation = scrollY.value * (image.rotation / 1000);
      return {
        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
      };
    };

    // Text-specific transformations
    const getTextStyle = (textClass) => {
      if (textClass === "explore-text") {
        return {
          transform: `translateY(${scrollY.value * 0.05}px)`,
          opacity: Math.min(1, scrollY.value / 300),
        };
      } else if (textClass === "further-text") {
        return {
          transform: `translateY(${scrollY.value * 0.1}px)`,
          opacity: Math.min(1, scrollY.value / 400),
        };
      }
    };

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      scrollY,
      images,
      getTransform,
      getTextStyle,
      maskImage: cloud1Mask,
    };
  },
};
</script>

<style scoped>
/* Main Wrapper Styling */
.parallax-wrapper {
  position: relative;
  width: 100%;
  height: 400vh; /* Large scrollable height */
  background: linear-gradient(to bottom, #ffffff, #ffffffb8, #f0f0f000);
  overflow: hidden;
  z-index: 10;
}

.parallax-scene {
  position: relative;
}

main {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #111b29;
}

svg {
  width: 100%;
  height: 100%;
}

.explore-text,
.further-text {
  font-size: 6vw;
  font-weight: 800;
  text-transform: uppercase;
  fill: #fff;
}

.explore-text {
  text-shadow: -2px 2px 4px rgb(0, 0, 0);
}

.further-text {
  fill: #242424;
  mix-blend-mode: soft-light;
}
</style>
