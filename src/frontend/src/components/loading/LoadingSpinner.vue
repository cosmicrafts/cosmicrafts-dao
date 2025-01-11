<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner">
    </div>
    <img src="@/assets/icons/icp.svg" alt="ICP Logo" class="spinner-logo" />
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
  border-bottom: 3px solid rgba(234, 0, 255, 0.942);
  border-radius: 24%;
  background: radial-gradient( rgba(7, 7, 7, 0.8), rgba(15, 15, 15, 0.949));
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


/* Flashing light effect */
@keyframes flashingLight {
  0%, 100% {
    box-shadow: 0 0 2px rgb(0, 157, 255), 0 0 4px rgba(0, 136, 255, 0.9);
    border-top: 2px solid rgb(0, 213, 255); /* Bright green */
  }
  50% {
    border-radius: 45%;
    border-bottom: 2px solid rgba(255, 87, 233, 0.942);
    box-shadow: 0 0 2px rgb(0, 200, 255), 0 0 18px rgb(255, 0, 234);
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


.loading-message {
  position: absolute;
  bottom: 60px;
  font-size: 10px;
  color: #8b8b8b;
  text-align: center;
  display: inline-block;
}

.letter {
  display: inline-block;
  opacity: 0;
  animation: fadeInUp 1s ease forwards;
}

/* Transition for the entire line entering and leaving */
.line-transition-enter-active, .line-transition-leave-active {
  transition: opacity 0.01s ease, transform 0.01s ease;
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


@keyframes borderSizeChange {
  0%, 100% {
    border-top-width: 4px;
  }
  50% {
    border-top-width: 8px;
  }
}

.spinner img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 128px;
  height: 256;
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
