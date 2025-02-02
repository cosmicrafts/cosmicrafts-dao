<template>
  <div v-if="isVisible" class="dialogue-box">
    <div class="dialogue-content">
      <p class="dialogue-text">{{ currentDialogue }}</p>
      <button @click="nextDialogue" class="dialogue-button">Next</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Dialogue templates with placeholders
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

const currentDialogue = ref('');
const isVisible = ref(true);
let dialogueIndex = 0;

// Generate dialogue using simple randomness
function generateDialogue() {
  const dialogueTemplate = dialogues[dialogueIndex];
  let dialogue = dialogueTemplate.template;

  for (const [placeholder, options] of Object.entries(dialogueTemplate.placeholders)) {
    const choice = options[Math.floor(Math.random() * options.length)];
    dialogue = dialogue.replace(`{${placeholder}}`, choice);
  }

  currentDialogue.value = dialogue;
}

// Move to the next dialogue or hide if finished
function nextDialogue() {
  dialogueIndex++;
  if (dialogueIndex < dialogues.length) {
    generateDialogue();
  } else {
    isVisible.value = false;  // Hide dialogue after finishing
  }
}

// Initialize the first dialogue
generateDialogue();
</script>

<style scoped>
/* Fullscreen dialogue box container with background gradient */
.dialogue-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #1C304C, #122136);
  display: flex;
  align-items: end;
  justify-content: center;
  color: #ffffff;
  text-align: left;
  z-index: 100;
}

/* Create a blurred radial circle in the background */
.dialogue-box::before {
  content: '';
  position: absolute;
  top: 0;
  width: 48rem;
  height: 24rem;
  border-radius: 50%;
  background: radial-gradient(circle,
  rgba(48, 180, 255, .25) 0%, rgba(0, 163, 255, 0) 50%);
  filter: blur(20px);
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

/* Content wrapper to allow proper stacking above the background */
.dialogue-content {
  padding: 2rem 1.5rem;
  
}

/* Dialogue text styling */
.dialogue-text {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

/* Button styling */
.dialogue-button {
  font-size: 2rem;
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
