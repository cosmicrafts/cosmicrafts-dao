<!-- File: components/core/Chat.vue -->
<!-- 
NOTE: This is a simplified version of the original Chat.vue component.
The original component is over 2600 lines and should be refactored into smaller subcomponents.
This file serves as a placeholder for migration purposes and should be further improved.
-->

<script setup lang="ts">
import { FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import { ref, nextTick, onMounted, onUnmounted, watch, computed, inject } from "vue";

import EmojiPicker from './EmojiPicker.vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore, languages } from '@/stores/language';

// Replace OpenAI client with OpenRouter base URL
const API_BASE_URL = 'https://openrouter.ai/api/v1';

// API Key
const API_KEY = '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';

// Define props
const props = defineProps({
  showWelcomeTooltip: {
    type: Boolean,
    default: false
  }
});

// Reactive state
const showChat = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const isAnimating = ref<boolean>(false);
const messages = ref<Array<{ role: string; content: string }>>([]);
const prompt = ref<string>("");
const loading = ref<boolean>(false);
const currentMessage = ref<string>("");
const isThinking = ref<boolean>(false);
const thinkingContent = ref<string>("");

const chatWindow = ref<HTMLElement | null>(null);
const chatToggle = ref<HTMLElement | null>(null); // Reference to the chat toggle button
const isDragging = ref<boolean>(false);
const isResizing = ref<boolean>(false);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startWidth = ref<number>(0);
const startHeight = ref<number>(0);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);
const isIconDragging = ref<boolean>(false); // Track if the chat icon is being dragged
const iconStartX = ref<number>(0);
const iconStartY = ref<number>(0);
const iconOffsetX = ref<number>(0);
const iconOffsetY = ref<number>(0);

// Computed properties and methods would be defined here
// ...

// Expose isOpen property for parent components
defineExpose({
  isOpen: computed(() => showChat.value)
});

// Template would be here
// ...
</script>

<template>
  <div 
    class="chat-container"
    :class="{ 'chat-visible': showChat }"
  >
    <!-- Chat toggle button -->
    <div 
    ref="chatToggle"
      class="chat-toggle cosmic-panel"
      @click="showChat = !showChat"
      :style="{
        left: `${iconOffsetX}px`,
        bottom: `${iconOffsetY}px`
      }"
    >
      <span class="chat-icon">💬</span>
  </div>

    <!-- Chat window -->
    <div 
      v-show="showChat"
      ref="chatWindow" 
      class="chat-window cosmic-panel"
    >
      <!-- Header -->
      <div class="chat-header">
        <h3>Cosmic Assistant</h3>
        <button class="close-button" @click="showChat = false">
          <XMarkIcon class="h-5 w-5" />
            </button>
      </div>

      <!-- Messages container -->
      <div class="messages-container">
        <div v-if="messages.length === 0" class="empty-chat">
          Ask me anything about Cosmicrafts!
      </div>
      
        <!-- Messages would render here -->
            </div>
      
      <!-- Input area -->
      <div class="chat-input-area">
        <textarea 
          v-model="prompt"
          placeholder="Type a message..."
          rows="1"
        ></textarea>
        <button class="emoji-button">
          <FaceSmileIcon class="h-5 w-5" />
      </button>
        <button class="send-button">
          <PaperAirplaneIcon class="h-5 w-5" />
        </button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.chat-container {
  position: fixed;
  z-index: var(--cosmic-z-chat, 1000);
}

.chat-toggle {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #4c1d95, #7c3aed);
  transition: transform 0.2s;
}

.chat-toggle:hover {
  transform: scale(1.05);
}

.chat-window {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 350px;
  height: 500px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.chat-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: white;
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-chat {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.chat-input-area {
  padding: 12px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.chat-input-area textarea {
  flex: 1;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  resize: none;
}

.emoji-button, .send-button {
  background: transparent;
  border: none;
  color: white;
  padding: 8px;
  cursor: pointer;
}
</style>