<template>
    <transition name="emoji-fade">
      <div v-if="show" ref="emojiPicker" class="emoji-picker" @click.stop>
        <div class="emoji-grid">
          <button
            v-for="(emoji, index) in emojis"
            :key="index"
            @click="selectEmoji(emoji)"
            class="emoji"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
import { ref, onMounted, onUnmounted } from 'vue'
  
  const props = defineProps({
    show: Boolean,
  })
  
  const emit = defineEmits(['select', 'close'])
  
  const emojis = ref([
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '🥳', '🤠', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮',
    '😯', '😲', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭',
    '🕹️', '🎮', '👾', '🎲', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤',
    '🎧', '🎼', '🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🎭', '🪩',
    '🚀', '🛸', '🌌', '🌠', '🎇', '🎆', '🌃', '🌌', '🌑', '🌒',
    '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜',
    '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '🌪️', '🌈'
  ])
  
  const emojiPicker = ref(null)
  
  const selectEmoji = (emoji) => {
    emit('select', emoji)
  }
  
  const closeOnClickOutside = (event) => {
    if (emojiPicker.value && !emojiPicker.value.contains(event.target)) {
      emit('close')
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', closeOnClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', closeOnClickOutside)
  })
  </script>
  
  <style scoped>
  .emoji-picker {
    position: absolute;
    bottom: 4.5rem;
    left: 1rem; /* Adjust position */
    background: rgba(30, 43, 56, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); /* Stronger shadow */
    z-index: 1001; /* Higher z-index to ensure visibility */
    max-height: 300px;
    overflow-y: auto;
    width: 300px; /* Fixed width */
    border: 1px solid rgba(255, 255, 255, 0.2); /* Add border */
  }
  
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }
  
  .emoji {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .emoji:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.1);
  }
  
  .emoji-fade-enter-active,
  .emoji-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  
  .emoji-fade-enter-from,
  .emoji-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
  </style>
  