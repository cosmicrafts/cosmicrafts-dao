<template>
  <svg :width="width" :height="height" class="stars">
    <defs>
      <pattern
        id="star-pattern"
        x="0"
        y="0"
        :width="patternWidth"
        :height="patternHeight"
        patternUnits="userSpaceOnUse"
      >
        <circle
          v-for="(star, index) in patternStars"
          :key="`star-${index}`"
          :cx="star.x"
          :cy="star.y"
          :r="star.r"
          :fill="star.color"
          :opacity="star.opacity"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#star-pattern)" />
  </svg>
</template>

<script>
export default {
  name: "Stars",
  props: {
    width: { type: Number, default: window.innerWidth },
    height: { type: Number, default: window.innerHeight },
    count: { type: Number, default: 500 }, // Stars per pattern
    minSize: { type: Number, default: 0.5 },
    maxSize: { type: Number, default: 2 },
    patternWidth: { type: Number, default: 500 }, // Adjust for density
    patternHeight: { type: Number, default: 500 }, // Adjust for density
  },
  data() {
    return {
      patternStars: [],
    };
  },
  created() {
    this.generatePatternStars();
  },
  methods: {
    generatePatternStars() {
      this.patternStars = [];
      for (let i = 0; i < this.count; i++) {
        this.patternStars.push({
          x: this.random(0, this.patternWidth),
          y: this.random(0, this.patternHeight),
          r: this.random(this.minSize, this.maxSize),
          color: this.getRandomStarColor(),
          opacity: this.random(0.3, 1),
        });
      }
    },
    random(min, max) {
      return Math.random() * (max - min) + min;
    },
    getRandomStarColor() {
      const colors = ["#FFFFFF", "#FFFFE0", "#ADD8E6", "#FFD700"]; // White, Ivory, LightBlue, Gold
      return colors[Math.floor(Math.random() * colors.length)];
    },
  },
};
</script>

<style scoped>
.stars {
  position: absolute;
  pointer-events: none;
}
</style>