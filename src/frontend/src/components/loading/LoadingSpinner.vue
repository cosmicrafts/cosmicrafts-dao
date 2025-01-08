<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner">
      <img src="@/assets/icons/icp.svg" alt="ICP Logo" />
    </div>
    <transition name="fade" mode="out-in">
      <div class="loading-message" :key="currentMessage">
        <span v-for="(char, index) in splitMessage(currentMessage)" :key="index" class="letter">
          <span v-if="char === ' '">&nbsp;</span>
          <span v-else>{{ char }}</span>
        </span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      messages: [
        "Cosmic login in progress... 🚀",
        "Charging stardust reserves... 🌟",
        "Warping you to the dashboard... 🌌",
        "Aligning galaxies for takeoff... 🌠",
        "Syncing with the blockchain... 🔗",
        "Unlocking the Metaverse... 🚀",
        "Calculating warp speed... ⚙️",
        "Refueling your starship... ⛽",
        "Prepping for your space mission... 🪐"
      ],
      startMessage: "Connecting your starship... 🛸",
      endMessage: "Warp successful! Welcome aboard! 🚀",
      currentMessage: "",
      messageIndex: 0,
      previousMessageIndex: null,
      messageInterval: null
    };
  },
  watch: {
    isLoading: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.showLoadingMessages();
        } else {
          clearInterval(this.messageInterval);
          this.currentMessage = this.endMessage;
        }
      }
    }
  },
  methods: {
    getRandomMessage() {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * this.messages.length);
      } while (newIndex === this.previousMessageIndex); // Prevent same message repetition
      this.previousMessageIndex = newIndex;
      return this.messages[newIndex];
    },
    showLoadingMessages() {
      this.currentMessage = this.startMessage;
      this.messageInterval = setInterval(() => {
        if (this.isLoading) {
          this.currentMessage = this.getRandomMessage();
        } else {
          clearInterval(this.messageInterval);
          this.currentMessage = this.endMessage;
        }
      }, 3000); // Message changes every 3 seconds
    },
    splitMessage(message) {
      return message.split('');
    }
  },
  beforeUnmount() {
    clearInterval(this.messageInterval); // Ensure interval is cleared when component is destroyed
  }
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
  background: linear-gradient(to top, #0000009c, #080d115a);
  z-index: 9999;
}

.spinner {
  position: relative;
  border: 4px solid rgba(0, 255, 8, 0.1);
  border-top: 4px solid rgba(0, 255, 8, 0.9);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  box-shadow: 0 0 10px rgba(0, 255, 8, 0.5), 0 0 20px rgba(0, 255, 8, 0.3);
  animation: refinedSpin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite, borderSizeChange 3s infinite ease-in-out;
}

.loading-message {
  position: absolute;
  bottom: 360px;
  font-size: 18px;
  color: #a9a9a9;
  text-align: center;
  display: inline-block;
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px) rotate(-10deg);
  animation: fadeInUp 1s ease forwards;
}

.letter:nth-child(1) { animation-delay: 0.4s; }
.letter:nth-child(2) { animation-delay: 0.45s; }
.letter:nth-child(3) { animation-delay: 0.5s; }
.letter:nth-child(4) { animation-delay: 0.55s; }
.letter:nth-child(5) { animation-delay: 0.6s; }
.letter:nth-child(6) { animation-delay: 0.65s; }
.letter:nth-child(7) { animation-delay: 0.7s; }
.letter:nth-child(8) { animation-delay: 0.75s; }
.letter:nth-child(9) { animation-delay: 0.8s; }
.letter:nth-child(10) { animation-delay: 0.85s; }
.letter:nth-child(11) { animation-delay: 0.9s; }
.letter:nth-child(12) { animation-delay: 0.95s; }
.letter:nth-child(13) { animation-delay: 1.0s; }
.letter:nth-child(14) { animation-delay: 1.05s; }
.letter:nth-child(15) { animation-delay: 1.1s; }
.letter:nth-child(16) { animation-delay: 1.15s; }
.letter:nth-child(17) { animation-delay: 1.2s; }
.letter:nth-child(18) { animation-delay: 1.25s; }
.letter:nth-child(19) { animation-delay: 1.3s; }
.letter:nth-child(20) { animation-delay: 1.35s; }
.letter:nth-child(21) { animation-delay: 1.4s; }
.letter:nth-child(22) { animation-delay: 1.45s; }
.letter:nth-child(23) { animation-delay: 1.5s; }
.letter:nth-child(24) { animation-delay: 1.55s; }
.letter:nth-child(25) { animation-delay: 1.6s; }
.letter:nth-child(26) { animation-delay: 1.65s; }
.letter:nth-child(27) { animation-delay: 1.7s; }
.letter:nth-child(28) { animation-delay: 1.75s; }
.letter:nth-child(29) { animation-delay: 1.8s; }
.letter:nth-child(30) { animation-delay: 1.85s; }
.letter:nth-child(32) { animation-delay: 1.9s; }
.letter:nth-child(32) { animation-delay: 1.95s; }


/* Transition for the entire line entering and leaving */
.line-transition-enter-active, .line-transition-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.line-transition-enter {
  opacity: 0;
  transform: translateY(20px);
}
.line-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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

@keyframes refinedSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes borderSizeChange {
  0% {
    border-top-width: 2px;
  }
  25% {
    border-top-width: 8px;
  }
  50% {
    border-top-width: -4px;
  }
  75% {
    border-top-width: 2px;
  }
  100% {
    border-top-width: 6px;
  }
}

.spinner img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 30px;
  animation: rock 1.5s ease-in-out infinite;
}

@keyframes rock {
  0% {
    transform: translate(-50%, -50%) rotate(-10deg);
  }
  50% {
    transform: translate(-50%, -50%) rotate(80deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(-10deg);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


</style>
