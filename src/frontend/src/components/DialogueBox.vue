<template>
  <!-- The click event is added to the outer container so that clicking anywhere triggers nextDialogue -->
  <div v-if="isVisible" class="dialogue-box" @click="nextDialogue">
    <!-- Background Avatar (fills height and is centered) -->
    <img class="background-avatar" :src="avatar" alt="Background Avatar" />

    <!-- Overlay Layer: semi-transparent black with blur -->
    <div class="background-overlay"></div>

    <!-- Dialogue Content -->
    <div class="dialogue-content" @click.stop>
      <!-- Avatar & Name Plate Container -->
      <div class="avatar-name-container">
        <img class="avatar" :src="avatar" alt="Avatar" />
        <div class="name-plate">Marshall Burke</div>
      </div>

      <!-- Lottie Orbit Animation Container (talking animation) -->
      <div class="orbit-animation" ref="lottieContainer"></div>

      <!-- Dialogue Text (Typewriter Effect) -->
      <p class="dialogue-text">{{ displayedDialogue }}</p>

      <!-- (Optional) Next button if you still want one visible -->
      <button class="dialogue-button" :disabled="typingInProgress" @click.stop="nextDialogue">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import lottie from 'lottie-web';
import avatar1 from '@/assets/avatars/Avatar_02.webp';
import lottieAnimationData from '@/assets/lottie-orbits.json';

// Declare lottieInstance at the very top so it’s in scope.
let lottieInstance: any = null;

// --------------------
// Dialogue Code with Typewriter Effect (Randomized Delay)
// --------------------
const dialogues = [
  {
    template: "Boot sequence complete. Welcome, {player_name}. Let's not crash this time, okay?",
    placeholders: {
      player_name: ["Captain", "Commander", "Space Genius"]
    }
  },
  {
    template: "Warning! {enemy} detected. Should we {action}, or just hope they go away?",
    placeholders: {
      enemy: ["Spirats", "Cosmicons", "Unknown Weirdos"],
      action: ["engage", "hide under the dashboard", "pretend we're not home"]
    }
  },
  {
    template: "Shields at {shield_status}. No big deal... unless you like explosions.",
    placeholders: {
      shield_status: ["50%", "critical levels", "non-existent"]
    }
  }
];

const fullDialogue = ref('');       // Holds the complete dialogue text
const displayedDialogue = ref('');  // Holds the text that appears gradually
const isVisible = ref(true);
let dialogueIndex = 0;
const avatar = avatar1;             // Selected avatar
const typingInProgress = ref(false); // Flag to disable "Next" while typing

// Generates dialogue text by replacing placeholders.
function generateDialogueText() {
  const dialogueTemplate = dialogues[dialogueIndex];
  let dialogue = dialogueTemplate.template;
  for (const [placeholder, options] of Object.entries(dialogueTemplate.placeholders)) {
    const choice = options[Math.floor(Math.random() * options.length)];
    dialogue = dialogue.replace(`{${placeholder}}`, choice);
  }
  return dialogue;
}

// Helper: returns a random delay between 15 and 50 milliseconds.
function randomDelay(min = 15, max = 50) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Typewriter function: reveals text character-by-character with random delay.
// It starts (plays) the Lottie animation if available and pauses it when finished.
function typeDialogue(text: string, index = 0) {
  typingInProgress.value = true;
  // Only play the animation if lottieInstance exists.
  if (lottieInstance && typeof lottieInstance.play === 'function') {
    lottieInstance.play();
  }
  if (index <= text.length) {
    displayedDialogue.value = text.slice(0, index);
    setTimeout(() => {
      typeDialogue(text, index + 1);
    }, randomDelay());
  } else {
    typingInProgress.value = false;
    // Pause the Lottie animation once typing is complete.
    if (lottieInstance && typeof lottieInstance.pause === 'function') {
      lottieInstance.pause();
    }
  }
}

// Generate a new dialogue and trigger the typewriter effect.
function generateDialogue() {
  fullDialogue.value = generateDialogueText();
  displayedDialogue.value = ''; // Reset displayed text.
  typeDialogue(fullDialogue.value, 0);
}

// The nextDialogue function is now used for both skipping the current typewriter animation
// (if still in progress) and advancing to the next dialogue.
function nextDialogue() {
  // If typing is still in progress, immediately finish the text.
  if (typingInProgress.value) {
    displayedDialogue.value = fullDialogue.value;
    typingInProgress.value = false;
    if (lottieInstance && typeof lottieInstance.pause === 'function') {
      lottieInstance.pause();
    }
    return;
  }

  // Otherwise, go to the next dialogue.
  dialogueIndex++;
  if (dialogueIndex < dialogues.length) {
    generateDialogue();
  } else {
    isVisible.value = false; // Hide dialogue after finishing.
  }
}

generateDialogue();

// --------------------
// Lottie Orbit Animation Code
// --------------------
const lottieContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (lottieContainer.value) {
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value, // The DOM element that will contain the animation.
      renderer: 'svg',
      loop: true,
      autoplay: false, // Do not autoplay; control playback with typewriter effect.
      animationData: lottieAnimationData,
    });
  }
});

onBeforeUnmount(() => {
  if (lottieInstance) {
    lottieInstance.destroy();
  }
});
</script>

<style scoped>
/* -------------------- */
/* Dialogue Box Styles */
/* -------------------- */
.dialogue-box {
  position: relative;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #1C304C, #122136);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-align: center;
  overflow: hidden;
  z-index: 100;
}

.dialogue-box::before {
  content: '';
  position: relative;
  top: 0;
  width: 48rem;
  height: 24rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(48, 180, 255, 0.25) 0%, rgba(0, 163, 255, 0) 50%);
  filter: blur(20px);
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -3;
}

.background-avatar {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  object-fit: cover;
  opacity: 0.1;
  z-index: -2;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  z-index: -1;
}

/* -------------------- */
/* Dialogue Content Styles */
/* -------------------- */
.dialogue-content {
  padding: 2rem 1.5rem;
  max-width: 90%;
}

/* -------------------- */
/* Avatar & Name Plate Container */
/* -------------------- */
.avatar-name-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  transform: translateY(-50px); /* Moves container upward */
}

.avatar {
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  border: 4px solid #FC4F83;
  box-shadow: 0 0 20px rgba(252, 79, 131, 0.5);
}

.name-plate {
  margin-top: 1rem;
  padding: 0.3rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  font-size: 1.5rem;
  color: #ffffff;
}

/* -------------------- */
/* Lottie Orbit Animation Styles */
/* -------------------- */
.orbit-animation {
  filter: drop-shadow(0px 0px 8px rgba(68, 255, 0, 0.93));
  width: 400px;
  height: 4rem;
  margin: 0 auto 1rem;
}

/* -------------------- */
/* Dialogue Text & Button */
/* -------------------- */
.dialogue-text {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #c0c0c0;
}

.dialogue-button {
  font-size: 1.5rem;
  font-weight: 800;
  background: #FC4F83;
  color: #ffffff;
  border: none;
  padding: 0.5rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s;
}

.dialogue-button:hover {
  background: #00e6b8;
}
</style>
