<template>
  <transition name="emoji-fade">
    <div 
      v-if="show" 
      ref="emojiPicker" 
      class="emoji-picker" 
      @click.stop
      :style="pickerStyle"
    >
      <!-- Draggable header -->
      <div 
        class="emoji-picker-header"
        @mousedown.stop="startDrag"
        @touchstart.stop="startDrag"
      >
        <span class="emoji-picker-title">Emoji Picker</span>
        <button class="close-button" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Search input with icon -->
      <div class="search-container">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search emojis by name..." 
          class="emoji-search"
          @input="filterEmojis"
          ref="searchInput"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Categories -->
      <div class="emoji-categories">
        <!-- Recently Used Category First -->
        <button 
          v-if="recentlyUsed.length > 0"
          @click="selectCategory('Recent')"
          :class="['category-button', { active: currentCategory === 'Recent' }]"
          title="Recently Used"
        >
          🕒
        </button>
        
        <!-- Other categories -->
        <button 
          v-for="category in categories"
          :key="category.name"
          @click="selectCategory(category)"
          :class="['category-button', { active: currentCategory === category.name }]"
          :title="category.name"
        >
          {{ category.icon }}
        </button>
      </div>
      
      <!-- Picker content area with scrolling -->
      <div class="emoji-content">
        <!-- Results count or category title -->
        <div v-if="searchQuery" class="section-title">
          {{ filteredEmojis.length }} results for "{{ searchQuery }}"
        </div>
        <div v-else-if="currentCategory === 'Recent'" class="section-title">
          Recently Used
        </div>
        <div v-else class="section-title">
          {{ currentCategory }}
        </div>
        
        <!-- Emoji grid -->
        <div class="emoji-grid">
          <button
            v-for="(emoji, index) in currentEmojis"
            :key="index"
            @click="selectEmoji(emoji)"
            class="emoji"
            :title="getEmojiName(emoji)"
            @mouseenter="showTooltip(emoji)"
            @mouseleave="hideTooltip"
          >
            {{ emoji }}
          </button>
        </div>
        
        <!-- No results message -->
        <div v-if="searchQuery && filteredEmojis.length === 0" class="no-results">
          No emojis found for "{{ searchQuery }}"
        </div>
      </div>
      
      <!-- Twitter-style fixed bottom panel for hover info -->
      <div class="emoji-info-panel" :class="{ active: hoveredEmoji }">
        <div v-if="hoveredEmoji" class="emoji-info-content">
          <div class="emoji-info-emoji">{{ hoveredEmoji }}</div>
          <div class="emoji-info-name">{{ getEmojiName(hoveredEmoji) }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['select', 'close']);

// Original emoji list
const allEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '🥳', '🤠', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮',
  '😯', '😲', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭',
  '🕹️', '🎮', '👾', '🎲', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤',
  '🎧', '🎼', '🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🎭', '🪩',
  '🚀', '🛸', '🌌', '🌠', '🎇', '🎆', '🌃', '🌌', '🌑', '🌒',
  '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜',
  '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '🌪️', '🌈'
];

// Category definitions
const categories = ref([
  { name: 'All', icon: '🔍', emojis: allEmojis },
  { name: 'Smileys', icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'] },
  { name: 'Activities', icon: '🎮', emojis: ['🕹️', '🎮', '👾', '🎲', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🎭', '🪩'] },
  { name: 'Travel', icon: '🚀', emojis: ['🚀', '🛸', '🌌', '🌠', '🌃', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜'] },
  { name: 'Objects', icon: '💫', emojis: ['💫', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '🌪️', '🌈'] }
]);

// References and state
const emojiPicker = ref(null);
const searchInput = ref(null);
const searchQuery = ref('');
const currentCategory = ref('All');
const filteredEmojis = ref([]);
const recentlyUsed = ref([]);
const hoveredEmoji = ref(null);
const MAX_RECENT = 12;

// Draggable functionality
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const pickerPosition = ref({ 
  left: '50%', 
  top: '50%', 
  transform: 'translate(-50%, -50%)'
});

// Emoji name mapping for tooltip
const emojiNames = {
  '😀': 'Grinning Face',
  '😃': 'Grinning Face with Big Eyes',
  '😄': 'Grinning Face with Smiling Eyes',
  '😁': 'Beaming Face with Smiling Eyes',
  '😆': 'Grinning Squinting Face',
  '😅': 'Grinning Face with Sweat',
  '😂': 'Face with Tears of Joy',
  '🤣': 'Rolling on the Floor Laughing',
  '🥲': 'Smiling Face with Tear',
  '🥹': 'Face Holding Back Tears',
  '😉': 'Winking Face',
  '😊': 'Smiling Face with Smiling Eyes',
  '😇': 'Smiling Face with Halo',
  '🥰': 'Smiling Face with Hearts',
  '😍': 'Smiling Face with Heart-Eyes',
  '🤩': 'Star-Struck',
  '😘': 'Face Blowing a Kiss',
  '😗': 'Kissing Face',
  '😚': 'Kissing Face with Closed Eyes',
  '😙': 'Kissing Face with Smiling Eyes',
  '🥳': 'Partying Face',
  '🤠': 'Cowboy Hat Face',
  '😎': 'Smiling Face with Sunglasses',
  '🤓': 'Nerd Face',
  '🧐': 'Face with Monocle',
  '😕': 'Confused Face',
  '😟': 'Worried Face',
  '🙁': 'Slightly Frowning Face',
  '☹️': 'Frowning Face',
  '😮': 'Face with Open Mouth',
  '😯': 'Hushed Face',
  '😲': 'Astonished Face',
  '🥺': 'Pleading Face',
  '😦': 'Frowning Face with Open Mouth',
  '😧': 'Anguished Face',
  '😨': 'Fearful Face',
  '😰': 'Anxious Face with Sweat',
  '😥': 'Sad but Relieved Face',
  '😢': 'Crying Face',
  '😭': 'Loudly Crying Face',
  '��️': 'Joystick',
  '🎮': 'Video Game',
  '👾': 'Alien Monster',
  '🎲': 'Game Die',
  '🎯': 'Bullseye',
  '🎨': 'Artist Palette',
  '🎭': 'Performing Arts',
  '🎪': 'Circus Tent',
  '🎬': 'Clapper Board',
  '🎤': 'Microphone',
  '🎧': 'Headphone',
  '🎼': 'Musical Score',
  '🎹': 'Musical Keyboard',
  '🥁': 'Drum',
  '🎸': 'Guitar',
  '🎷': 'Saxophone',
  '🎺': 'Trumpet',
  '🎻': 'Violin',
  '🪩': 'Mirror Ball',
  '🚀': 'Rocket',
  '🛸': 'Flying Saucer',
  '🌌': 'Milky Way',
  '🌠': 'Shooting Star',
  '🎇': 'Sparkler',
  '🎆': 'Fireworks',
  '🌃': 'Night with Stars',
  '🌑': 'New Moon',
  '🌒': 'Waxing Crescent Moon',
  '🌓': 'First Quarter Moon',
  '🌔': 'Waxing Gibbous Moon',
  '🌕': 'Full Moon',
  '🌖': 'Waning Gibbous Moon',
  '🌗': 'Last Quarter Moon',
  '🌘': 'Waning Crescent Moon',
  '🌙': 'Crescent Moon',
  '🌚': 'New Moon Face',
  '🌛': 'First Quarter Moon Face',
  '🌜': 'Last Quarter Moon Face',
  '💫': 'Dizzy',
  '⭐': 'Star',
  '🌟': 'Glowing Star',
  '✨': 'Sparkles',
  '⚡': 'High Voltage',
  '🔥': 'Fire',
  '💥': 'Collision',
  '☄️': 'Comet',
  '🌪️': 'Tornado',
  '🌈': 'Rainbow'
};

// Computed style for the picker
const pickerStyle = computed(() => {
  return {
    left: pickerPosition.value.left,
    top: pickerPosition.value.top,
    transform: pickerPosition.value.transform
  };
});

// Get emoji display name
const getEmojiName = (emoji) => {
  return emojiNames[emoji] || 'Emoji';
};

// Get current emojis based on category and search
const currentEmojis = computed(() => {
  if (searchQuery.value) {
    return filteredEmojis.value;
  }
  
  if (currentCategory.value === 'Recent') {
    return recentlyUsed.value;
  }
  
  const category = categories.value.find(c => c.name === currentCategory.value);
  return category ? category.emojis : allEmojis;
});

// Show tooltip for emoji (Twitter style)
const showTooltip = (emoji) => {
  hoveredEmoji.value = emoji;
};

// Hide tooltip
const hideTooltip = () => {
  hoveredEmoji.value = null;
};

// Start dragging
const startDrag = (event) => {
  event.preventDefault();
  
  if (!emojiPicker.value) return;
  
  isDragging.value = true;
  
  // Handle both mouse and touch events
  if (event.type === 'touchstart') {
    startX.value = event.touches[0].clientX;
    startY.value = event.touches[0].clientY;
  } else {
    startX.value = event.clientX;
    startY.value = event.clientY;
  }
  
  // Calculate offset from the picker's current position
  const rect = emojiPicker.value.getBoundingClientRect();
  offsetX.value = startX.value - rect.left;
  offsetY.value = startY.value - rect.top;
  
  // Add move and end event listeners
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
  
  // Remove transform on first drag to use absolute positioning
  if (pickerPosition.value.transform) {
    pickerPosition.value = {
      left: rect.left + 'px',
      top: rect.top + 'px',
      transform: ''
    };
  }
};

// Handle dragging
const drag = (event) => {
  if (!isDragging.value) return;
  
  event.preventDefault();
  
  let clientX, clientY;
  
  if (event.type === 'touchmove') {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  // Calculate new position
  const newLeft = clientX - offsetX.value;
  const newTop = clientY - offsetY.value;
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Get picker dimensions
  const pickerWidth = emojiPicker.value.offsetWidth;
  const pickerHeight = emojiPicker.value.offsetHeight;
  
  // Ensure the picker stays within viewport bounds
  const boundedLeft = Math.max(0, Math.min(newLeft, viewportWidth - pickerWidth));
  const boundedTop = Math.max(0, Math.min(newTop, viewportHeight - pickerHeight));
  
  // Update position
  pickerPosition.value = {
    left: boundedLeft + 'px',
    top: boundedTop + 'px',
    transform: ''
  };
};

// Stop dragging
const stopDrag = () => {
  isDragging.value = false;
  
  // Remove event listeners
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('touchmove', drag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);
};

// Select emoji and add to recently used
const selectEmoji = (emoji) => {
  // Add to recently used
  if (!recentlyUsed.value.includes(emoji)) {
    recentlyUsed.value.unshift(emoji);
    
    // Keep only MAX_RECENT items
    if (recentlyUsed.value.length > MAX_RECENT) {
      recentlyUsed.value = recentlyUsed.value.slice(0, MAX_RECENT);
    }
    
    // Save to localStorage
    saveRecentlyUsed();
  } else {
    // Move to the front of the list
    recentlyUsed.value = [
      emoji,
      ...recentlyUsed.value.filter(e => e !== emoji)
    ].slice(0, MAX_RECENT);
    saveRecentlyUsed();
  }
  
  emit('select', emoji);
};

// Filter emojis based on search query
const filterEmojis = () => {
  if (!searchQuery.value) {
    filteredEmojis.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  filteredEmojis.value = allEmojis.filter(emoji => {
    const name = getEmojiName(emoji).toLowerCase();
    return name.includes(query);
  });
};

// Clear the search input
const clearSearch = () => {
  searchQuery.value = '';
  filteredEmojis.value = [];
  
  // Focus the search input
  if (searchInput.value) {
    searchInput.value.focus();
  }
};

// Select an emoji category
const selectCategory = (category) => {
  if (typeof category === 'string') {
    currentCategory.value = category;
  } else {
    currentCategory.value = category.name;
  }
  
  searchQuery.value = '';
  filteredEmojis.value = [];
};

// Load recently used emojis from localStorage
const loadRecentlyUsed = () => {
  const stored = localStorage.getItem('recentlyUsedEmojis');
  if (stored) {
    try {
      recentlyUsed.value = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading recently used emojis', error);
      recentlyUsed.value = [];
    }
  }
};

// Save recently used emojis to localStorage
const saveRecentlyUsed = () => {
  localStorage.setItem('recentlyUsedEmojis', JSON.stringify(recentlyUsed.value));
};

// Handle ESC key to close the picker
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && props.show) {
    event.stopPropagation();
    event.preventDefault();
    emit('close');
  }
};

// Close when clicking outside
const closeOnClickOutside = (event) => {
  if (emojiPicker.value && !emojiPicker.value.contains(event.target)) {
    emit('close');
  }
};

// Calculate initial position based on the trigger button
const calculateInitialPosition = () => {
  // Default to center screen - this is fine with teleport
  pickerPosition.value = { 
    left: '50%', 
    top: '50%', 
    transform: 'translate(-50%, -50%)'
  };
};

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside);
  document.addEventListener('keydown', handleKeyDown);
  loadRecentlyUsed();
  
  if (props.show) {
    calculateInitialPosition();
    
    if (searchInput.value) {
      // Focus the search input when opened
      setTimeout(() => {
        searchInput.value.focus();
      }, 100);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
  
  // Clean up drag event listeners
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('touchmove', drag);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchend', stopDrag);
});

// Reset position when picker is closed and reopened
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Show picker
    calculateInitialPosition();
    
    if (searchInput.value) {
      setTimeout(() => {
        searchInput.value.focus();
      }, 100);
    }
  } else {
    // Reset hoveredEmoji when picker is closed
    hoveredEmoji.value = null;
  }
});
</script>

<style scoped>
.emoji-picker {
  position: fixed;
  z-index: 991100;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.97), rgba(17, 25, 40, 0.97));
  border-radius: 12px;
  width: 320px;
  height: 400px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: default;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Draggable header */
.emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(30, 30, 30, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: move;
  user-select: none;
  flex-shrink: 0;
}

.emoji-picker-title {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin: 12px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.emoji-search {
  width: 100%;
  padding: 8px 8px 8px 34px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.emoji-search:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
}

.clear-search:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.emoji-categories {
  display: flex;
  gap: 8px;
  padding: 0 12px;
  margin-bottom: 10px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none; /* Firefox */
}

.emoji-categories::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.category-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-button:hover, .category-button.active {
  background: rgba(59, 130, 246, 0.2);
}

.emoji-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 12px;
  scrollbar-width: thin;
}

.emoji-content::-webkit-scrollbar {
  width: 6px;
}

.emoji-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.emoji-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.section-title {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.emoji {
  background: none;
  border: none;
  font-size: 1.2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px;
  height: 36px;
  width: 36px;
}

.emoji:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.2);
}

.no-results {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 12px;
  font-size: 0.9rem;
}

/* Twitter-style bottom info panel */
.emoji-info-panel {
  flex-shrink: 0;
  height: 0;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: height 0.2s ease;
}

.emoji-info-panel.active {
  height: 60px;
}

.emoji-info-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.emoji-info-emoji {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.emoji-info-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: all 0.3s ease;
}

.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
  