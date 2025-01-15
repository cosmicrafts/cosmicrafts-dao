<template>
      <div id="app">
        <!-- Fullscreen particles.js container -->
        <div id="particles-js" class="fullscreen"></div>
    
        <!-- Your content goes here -->
        <div class="content">
          <h1>Oops! Lost in Space! 🚀</h1>
          <p>Can’t find what you’re looking for, Space Cowboy? Try searching below!</p>
        </div>
      </div>
    </template>
    
    <script>
    import particlesJS from "particles.js";
    
    export default {
      name: "App",
      mounted() {
        // Initialize particles.js
        this.initParticles();
      },
      methods: {
        initParticles() {
          particlesJS.load("particles-js", "/particles.json", () => {
            console.log("Particles.js loaded!");
          });
        },
      },
    };
    </script>
    
    <style scoped>
    /* Fullscreen particles container */
    .fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1; /* Ensure it stays in the background */
    }
    
    /* Content styling */
    .content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      font-family: 'Orbitron', sans-serif;
      padding-top: 20%;
    }
    
    h1 {
      font-size: 3rem;
      background: linear-gradient(45deg, #00ffcc, #ff00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      font-size: 1.2rem;
      margin-top: 1rem;
    }
    </style>