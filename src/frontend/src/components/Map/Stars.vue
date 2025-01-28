<template>
      <svg :width="width" :height="height" class="stars">
        <circle
          v-for="(star, index) in stars"
          :key="`star-${index}`"
          :cx="star.x"
          :cy="star.y"
          :r="star.r"
          fill="white"
          :opacity="star.opacity"
        />
      </svg>
    </template>
    
    <script>
    export default {
      name: "Stars",
      props: {
        width: { type: Number, default: 1920 },
        height: { type: Number, default: 1080 },
        count: { type: Number, default: 500 },
        minSize: { type: Number, default: 0.5 },
        maxSize: { type: Number, default: 2 },
      },
      data() {
        return { stars: [] };
      },
      created() {
        this.generateStars();
      },
      methods: {
        generateStars() {
          for (let i = 0; i < this.count; i++) {
            this.stars.push({
              x: this.random(0, this.width),
              y: this.random(0, this.height),
              r: this.random(this.minSize, this.maxSize),
              opacity: this.random(0.3, 1),
            });
          }
        },
        random(min, max) {
          return Math.random() * (max - min) + min;
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