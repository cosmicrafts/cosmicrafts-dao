<template>
  <div class="parallax-wrapper" @scroll="handleScroll">
    <!-- Parallax Background -->
    <div
      class="background-layer"
      :style="{ transform: `translateY(${scrollY * -0.5}px)` }"
    ></div>

    <!-- Section with White Stripe -->
    <div
      class="white-layer"
      :style="{ opacity: `${Math.min(1, scrollY / 300)}` }"
    >
      <svg
        viewBox="0 0 1200 200"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <polygon points="0,0 1200,0 1200,100 0,50" fill="white" />
      </svg>
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="parallax-text">
        <div
          v-for="(line, index) in lines"
          :key="index"
          class="line-wrapper"
          :style="{
            transform: `translateY(${scrollY * line.speed}px)`,
            opacity: getOpacity(scrollY, index),
          }"
        >
          <video
            class="parallax-video"
            :src="line.video"
            autoplay
            loop
            muted
            playsinline
            :style="{
              transform: `translateY(${scrollY * line.videoSpeed}px) scale(${
                1 + scrollY * 0.00001
              })`,
              opacity: getOpacity(scrollY, index),
            }"
          ></video>
          <span
            class="line"
            :style="{
              transform: `scale(${0.75 + scrollY * 0.0001})`,
              opacity: getOpacity(scrollY, index),
            }"
          >
            {{ line.text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import darkRift from "@/assets/webm/darkrift.webm";
import dude from "@/assets/webm/output.webm";
import battle from "@/assets/webm/output2.webm";

export default {
  name: "ParallaxScene",
  setup() {
    const scrollY = ref(0);

    const lines = [
      {
        video: darkRift,
        text: "Amidst the cosmic chaos",
        speed: -0.1,
        videoSpeed: -0.05,
      },
      {
        video: dude,
        text: "the remnants of ancient civilizations",
        speed: -0.2,
        videoSpeed: -0.1,
      },
      {
        video: battle,
        text: "as the Metaverse collapses",
        speed: -0.3,
        videoSpeed: -0.15,
      },
      {
        video: darkRift,
        text: "clash in a desperate struggle for supremacy.",
        speed: -0.4,
        videoSpeed: -0.2,
      },
    ];

    const handleScroll = () => {
      scrollY.value = window.scrollY;
    };

    const getOpacity = (scrollY, index) => {
      const baseOpacity = 0.1 * (index + 1);
      return Math.min(1, baseOpacity + scrollY * 0.001);
    };

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return { scrollY, lines, getOpacity };
  },
};
</script>

<style scoped>
/* Main Wrapper Styling */
.parallax-wrapper {
  position: relative;
  width: 100%;
  height: 400vh; /* Large scrollable height */
  background: linear-gradient(
    to bottom,
    #ffffff,
    #ffffff,
    #ffffffb8,
    #f0f0f000
  );
  overflow: hidden;
  z-index: 10;
}

/* Parallax Background */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  z-index: -1;
  will-change: transform;
}

/* White Stripe */
.white-layer {
  position: relative;
  width: 100%;
  transition: opacity 0.5s ease-in-out;
}

.white-layer svg {
  display: block;
}

/* Content Styling */
.content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 5rem 1rem;
}

.parallax-text {
  display: flex;
  flex-direction: column;
  gap: 6rem;
  position: relative;
}

.line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  will-change: transform, opacity;
}

.line {
  font-size: 4vw;
  text-transform: uppercase;
  font-weight: 800;
  color: transparent;
  background: linear-gradient(45deg, #ff004c, #7a00ff, #00ffe0);
  -webkit-background-clip: text;
  background-clip: text;
  mix-blend-mode: luminosity;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 0, 76, 0.5);
  opacity: 0; /* For animation visibility */
  will-change: transform, opacity;
  z-index: 10;
}

.parallax-video {
  width: 20%;
  mix-blend-mode: add;
  height: auto;
  opacity: 0; /* Start fully invisible */
  transform: scale(2.5); /* Start smaller */
  will-change: transform, opacity;
  z-index: 5;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
  filter: brightness(1.2) saturate(1.5);
  border-radius: 4px;
  transition: all 0.4s ease;
}

.line:hover {
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.5);
}

.parallax-video:hover {
  filter: brightness(1.5) saturate(2);
}

@media (max-width: 1200px) {
  .line {
    font-size: 5vw;
  }
  .parallax-video {
    width: 80%;
  }
}

@media (max-width: 768px) {
  .line {
    font-size: 6vw;
  }
  .parallax-video {
    width: 50%;
  }
}
</style>
