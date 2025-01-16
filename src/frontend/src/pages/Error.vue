<template>
 <div class="error-page">
      <!-- Starry background component -->
      <Starfield class="background-starfield" />

      <!-- Fun space-themed message -->
      <div class="alien-message">
      <!-- Cosmic Dog Image -->
      <img src="@/assets/webp/chihuahua.webp" alt="Cosmic Dog" class="cosmic-dog" />

      <h1 
      class="error-title wave-effect"
      @mousemove="handleHover"
      @mouseleave="resetWave"
      >
      {{ t("error.title") }}
      </h1>
      <p 
      class="error-description wave-effect"
      @mousemove="handleHover"
      @mouseleave="resetWave"
      >
      {{ t("error.description") }}
      </p>

      <!-- Home button -->
      <button @click="goHome" class="home-button">
      {{ t("error.homeButton") }}
      </button>
      </div>
 </div>
</template>

<script>
import Starfield from "@/components/Starfield.vue";
import { useI18n } from "vue-i18n";

export default {
  name: "ErrorPage",
  components: {
    Starfield,
  },
setup() {
      const { t } = useI18n();
},
  methods: {
    goHome() {
      this.$router.push("/");
    },
  },
};
</script>

    
    <style scoped>
    /* Error page container */
    .error-page {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1; /* Ensure it is above the background */
      background: radial-gradient(circle, rgb(12, 24, 46), rgb(25, 24, 24));
    }
    
    /* Starfield background */
    .background-starfield {
      position: absolute; /* Ensure the Starfield stays in the background */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1; 
    }
    
    /* Alien message */
    .alien-message {
      text-align: center;
      animation: fadeIn 1s ease-in-out;
    }

         
    /* Alien message */
    .alien-message {
      text-align: center;
      animation: fadeIn 1s ease-in-out;
    }

      .cosmic-dog {
      margin-bottom: -12rem;
      max-width: 24rem;
      display: block;
      filter: drop-shadow(0px 0px 10px rgba(0, 179, 239, 0.5));
      }
      
    
    .error-title {
      font-size: 8rem;
      font-weight: 900;
      margin-bottom: 3.5rem;
      margin-top: .25rem;
      font-weight: bold;
      background: linear-gradient(180deg, #ffffff,  #c47530);
      -webkit-background-clip: text; /* Ensures the gradient is clipped to text */
      -webkit-text-fill-color: transparent; /* Makes the text itself transparent */
      background-clip: text; /* For non-WebKit browsers supporting background-clip */
      color: transparent; 
      filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.95));
    }
    
    .error-description {
      color: rgb(160, 160, 160);
      font-size: 1rem;
      margin-top: -4rem;
      text-shadow: 0px 0px 20px rgba(0, 174, 255, 0.3);
      transition: transform 0.2s ease, text-shadow 0.2s ease;
    }

      /* Home button */
      .home-button {

      background: #4e3714;
      border: none;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 900;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      transition: box-shadow 1s ease, background 0.5s ease, transform 0.2s ease, text-shadow 0.2s ease;
      text-shadow: 0px 0px 10px rgba(255, 153, 0, 0.6);
      }

      .home-button:hover {
      background: #ffaa00;
      box-shadow: 0 0 16px 4px rgba(255, 153, 0, 0.8);
      
      }
    
/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {

      .cosmic-dog {
      margin-bottom: -6rem;
      max-width: 70%;
      }
      
    .error-title {
      font-size: 5rem;
    }
    
    .error-description {
      font-size: .8rem;
    }

      /* Home button */
      .home-button {    
            width: 60%;
      }
}

@media (max-width: 640px) {

.cosmic-dog {
max-width: 100%;
}
}
</style>
    