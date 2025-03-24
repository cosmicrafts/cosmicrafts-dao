<!-- File: components/core/EmojiPicker.vue -->
<!-- 
NOTE: This is a simplified version of the original EmojiPicker.vue component.
This file serves as a placeholder for migration purposes and should be further improved.
-->

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Emoji categories
const categories = [
  { id: 'recent', name: 'Recently Used', icon: '🕒' },
  { id: 'smileys', name: 'Smileys & Emotion', icon: '😀' },
  { id: 'people', name: 'People & Body', icon: '👋' },
  { id: 'animals', name: 'Animals & Nature', icon: '🐶' },
  { id: 'food', name: 'Food & Drink', icon: '🍔' },
  { id: 'travel', name: 'Travel & Places', icon: '✈️' },
  { id: 'activities', name: 'Activities', icon: '⚽' },
  { id: 'objects', name: 'Objects', icon: '💡' },
  { id: 'symbols', name: 'Symbols', icon: '🔣' },
  { id: 'flags', name: 'Flags', icon: '🏁' }
];

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['select', 'close']);

// State
const selectedCategory = ref('smileys');
const searchQuery = ref('');

// Methods
const selectEmoji = (emoji) => {
  emit('select', emoji);
};

const close = () => {
  emit('close');
};
</script>

<template>
  <div v-if="props.visible" class="emoji-picker cosmic-panel">
    <div class="emoji-picker-header">
      <div class="emoji-search">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search emojis..."
          class="emoji-search-input"
        />
      </div>
    </div>
    
    <div class="emoji-categories">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-button"
        :class="{ active: selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        {{ category.icon }}
      </button>
    </div>
    
    <div class="emoji-content">
      <!-- Placeholder for emoji grid -->
      <div class="emoji-grid">
        <button
          class="emoji-button"
          @click="selectEmoji('😀')"
        >
          😀
        </button>
        <button
          class="emoji-button"
          @click="selectEmoji('😁')"
        >
          😁
        </button>
        <!-- More emojis would be here -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.emoji-picker {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 320px;
  height: 350px;
  border-radius: 8px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.emoji-picker-header {
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.emoji-search-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.emoji-categories {
  display: flex;
  overflow-x: auto;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-button {
  min-width: 28px;
  height: 28px;
  margin-right: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}

.category-button.active {
  background: rgba(255, 255, 255, 0.1);
}

.emoji-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  transition: background-color 0.2s;
}

.emoji-button:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style> 