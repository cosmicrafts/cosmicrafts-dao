<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner"></div>
    <img src="@/assets/icons/icp.svg" alt="ICP Logo" class="spinner-logo" />
    <transition name="fade" mode="out-in">
      <div class="loading-message" :key="currentMessage">
        <span v-for="(char, index) in splitMessage(currentMessage)" :key="index" class="letter">
          {{ char === ' ' ? '&nbsp;' : char }}
        </span>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    name: 'LoadingScreen',
    props: {
      isLoading: {
        type: Boolean,
        required: true,
      },
      messages: {
        type: Array,
        required: true,
        validator: (value) => value.length > 0, // Ensure messages array is not empty
      },
    },
    data() {
      return {
        currentMessage: '',
        previousMessageIndex: null,
        messageInterval: null,
      };
    },
    watch: {
      isLoading: {
        immediate: true,
        handler(isLoading) {
          isLoading ? this.startMessageCycle() : this.stopMessageCycle();
        },
      },
    },
    methods: {
      getRandomMessage() {
        const availableIndices = this.messages
          .map((_, index) => index)
          .filter((index) => index !== this.previousMessageIndex);

        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        this.previousMessageIndex = randomIndex;
        return this.messages[randomIndex];
      },
      startMessageCycle() {
        this.currentMessage = this.getRandomMessage();
        this.messageInterval = setInterval(() => {
          this.currentMessage = this.getRandomMessage();
        }, 3000);
      },
      stopMessageCycle() {
        clearInterval(this.messageInterval);
        this.currentMessage = '';
      },
      splitMessage(message) {
        return message.split('');
      },
      cleanup() {
        this.stopMessageCycle();
      },
    },
    beforeUnmount() {
      this.cleanup();
    },
  };
</script>

<style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(4px);
    background: linear-gradient(to bottom, rgba(30, 43, 56, 0.745), rgba(23, 33, 43, 0.938));
    z-index: 9999;
  }

  .spinner {
    position: relative;
    border-bottom: 3px solid rgba(234, 0, 255, 0.942);
    border-radius: 24%;
    background: radial-gradient(rgba(7, 7, 7, 0.8), rgba(15, 15, 15, 0.949));
    width: 64px;
    height: 64px;
    filter: drop-shadow(0px -2px 4px rgba(0, 174, 255, 0.634)) drop-shadow(0px 2px 4px rgba(234, 0, 255, 0.942));
    animation: refinedSpin 8s linear infinite, flashingLight 0.8s ease-in-out infinite;
  }

  .spinner-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 36px;
  }

  .loading-message {
    position: absolute; /* Changed from fixed to absolute */
    top: 58%;
    left: 50%;
    transform: translate(-50%, 100%); /* Center and move it below the logo */
    font-weight: 600;
    font-size: .65rem;
  }

  .letter {
    display: inline-block;
    opacity: 0;
    animation: fadeInUp 1s ease forwards;
  }

  /* Animations */
  @keyframes refinedSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes flashingLight {
    0%, 100% {
      box-shadow: 0 0 2px rgb(0, 157, 255), 0 0 4px rgba(0, 136, 255, 0.9);
      border-top: 2px solid rgb(0, 213, 255);
    }
    50% {
      border-radius: 45%;
      border-bottom: 2px solid rgba(255, 87, 233, 0.942);
      box-shadow: 0 0 2px rgb(0, 200, 255), 0 0 18px rgb(255, 0, 234);
    }
  }

  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px) rotate(-10deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) rotate(0deg);
    }
  }

  /* Transitions */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>