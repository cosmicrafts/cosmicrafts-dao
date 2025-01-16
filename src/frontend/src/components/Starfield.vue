<template>
      <section class="starry-background">
        <!-- Background Canvas for Stars -->
        <canvas
          id="starfield"
          ref="starfield"
          class="noise-canvas"
          :style="{ top: `${scrollY * 0.5}px` }"
        ></canvas>
      </section>
    </template>
 <script setup>
 import { ref, onMounted, onUnmounted } from 'vue';
 
 const scrollY = ref(0);
 const starSpeed = ref(0.5); // Default speed
 const defaultSpeed = 0.1; // Define baseline speed
 const maxSpeed = 2; // Set maximum speed limit
 const minSpeed = 0.5; // Set minimum speed limit
 const speedIncrement = 0.05; // Define smaller increment for finer control
 
 let previousScrollY = 0;
 const noiseCanvas = ref(null);
 
 let n = 2000 + Math.floor(2000 * Math.random());
 let w = 0,
   h = 0,
   x = 0,
   y = 0,
   z = 0;
 let star_color_ratio = 0,
   star_x_save,
   star_y_save;
 let star_ratio = 256;
 let star = new Array(n);
 let context;
 
 // Initialize the stars array
 function init() {
   for (let i = 0; i < n; i++) {
     star[i] = new Array(5);
     star[i][0] = Math.random() * w * 2 - x * 2;
     star[i][1] = Math.random() * h * 2 - y * 2;
     star[i][2] = Math.round(Math.random() * z);
     star[i][3] = 0;
     star[i][4] = 0;
   }
   const starfield = document.getElementById('starfield');
   starfield.width = w;
   starfield.height = h;
   context = starfield.getContext('2d');
   context.strokeStyle = 'rgb(255,255,255)';
 }
 
 // Animation function
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
     if (
       star_x_save > 0 &&
       star_x_save < w &&
       star_y_save > 0 &&
       star_y_save < h
     ) {
       context.lineWidth = (1 - star_color_ratio * star[i][2]) * 1;
       context.beginPath();
       context.moveTo(star_x_save, star_y_save);
       context.lineTo(star[i][3], star[i][4]);
       context.stroke();
     }
   }
   requestAnimationFrame(anim);
 }
 
 // Handle scroll events
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
 
 // Handle window resize
 function resize() {
   w = window.innerWidth;
   h = window.innerHeight;
   x = Math.round(w / 2);
   y = Math.round(h / 2);
   z = (w + h) / 2;
   star_color_ratio = 1 / z;
   init();
 }
 
 // Lifecycle hooks
 onMounted(() => {
   w = window.innerWidth;
   h = window.innerHeight;
   resize();
   anim();
   window.addEventListener('scroll', handleScroll);
   window.addEventListener('resize', resize);
 });
 
 onUnmounted(() => {
   window.removeEventListener('scroll', handleScroll);
   window.removeEventListener('resize', resize);
 });
 </script>
<style scoped>
.starry-background {
  position: relative;
  height: 100vh;
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
</style>
    