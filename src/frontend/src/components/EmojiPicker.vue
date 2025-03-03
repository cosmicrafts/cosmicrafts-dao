<template>
    <transition name="emoji-fade">
      <div v-if="show" ref="emojiPicker" class="emoji-picker" @click.stop>
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
          <button 
            v-for="(category, index) in categories" 
            :key="index"
            @click="selectCategory(category.name)"
            :class="['category-btn', { active: currentCategory === category.name }]"
            :title="category.name"
          >
            {{ category.icon }}
          </button>
          <button 
            @click="selectCategory('Recent')"
            :class="['category-btn', { active: currentCategory === 'Recent' }]"
            title="Recently Used"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
        </div>
        
        <!-- Results count when searching -->
        <div v-if="searchQuery" class="search-results">
          {{ filteredEmojis.length }} results for "{{ searchQuery }}"
        </div>
        
        <!-- Emoji grid -->
        <div class="emoji-grid">
          <button
            v-for="(emoji, index) in filteredEmojis"
            :key="index"
            @click="selectEmoji(emoji)"
            class="emoji"
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
        
        <!-- Recently used section -->
        <div v-if="!searchQuery && currentCategory === 'Recent' && recentlyUsed.length > 0" class="recently-used">
          <div class="section-title">Recently Used</div>
          <div class="emoji-grid">
            <button
              v-for="(emoji, index) in recentlyUsed"
              :key="'recent-' + index"
              @click="selectEmoji(emoji)"
              class="emoji"
              @mouseenter="showTooltip(emoji)"
              @mouseleave="hideTooltip"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
        
        <!-- Emoji tooltip -->
        <div v-if="activeTooltip.visible" class="emoji-tooltip" :style="tooltipStyle">
          <div class="tooltip-emoji">{{ activeTooltip.emoji }}</div>
          <div class="tooltip-name">{{ activeTooltip.name }}</div>
          <div class="tooltip-shortcut">:{{ activeTooltip.shortcut }}:</div>
        </div>
      </div>
    </transition>
  </template>
  
  <script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
  
  const props = defineProps({
    show: Boolean,
  })
  
  const emit = defineEmits(['select', 'close'])
  
  // Emoji categories
  const categories = [
    { name: 'Smileys', icon: '😀' },
    { name: 'Activities', icon: '🎮' },
    { name: 'Travel', icon: '🚀' },
    { name: 'Objects', icon: '💎' },
    { name: 'Symbols', icon: '💫' }
  ]
  
  const currentCategory = ref('Smileys')
  const searchQuery = ref('')
  const searchInput = ref(null)
  const recentlyUsed = ref([])
  const MAX_RECENT = 12
  
  // Tooltip state
  const activeTooltip = ref({
    visible: false,
    emoji: '',
    name: '',
    shortcut: '',
    x: 0,
    y: 0
  })
  
  // Tooltip position style
  const tooltipStyle = computed(() => {
    return {
      left: `${activeTooltip.value.x}px`,
      top: `${activeTooltip.value.y}px`
    }
  })
  
  // Show tooltip for emoji
  const showTooltip = (emoji) => {
    const name = getEmojiName(emoji)
    const shortcut = getEmojiShortcut(emoji)
    
    // Get position of emoji element
    const emojiElement = event.currentTarget
    const rect = emojiElement.getBoundingClientRect()
    const pickerRect = emojiPicker.value.getBoundingClientRect()
    
    // Calculate position (centered at bottom of emoji grid)
    const x = (pickerRect.width / 2) - 100 // Center the tooltip (200px width)
    const y = rect.bottom - pickerRect.top + 10 // Position below the emoji
    
    activeTooltip.value = {
      visible: true,
      emoji,
      name,
      shortcut,
      x,
      y
    }
  }
  
  // Hide tooltip
  const hideTooltip = () => {
    activeTooltip.value.visible = false
  }
  
  // Load recently used emojis from localStorage
  const loadRecentlyUsed = () => {
    try {
      const saved = localStorage.getItem('recentlyUsedEmojis')
      if (saved) {
        recentlyUsed.value = JSON.parse(saved).slice(0, MAX_RECENT)
      }
    } catch (e) {
      console.error('Error loading recently used emojis:', e)
    }
  }
  
  // Save recently used emojis to localStorage
  const saveRecentlyUsed = () => {
    try {
      localStorage.setItem('recentlyUsedEmojis', JSON.stringify(recentlyUsed.value))
    } catch (e) {
      console.error('Error saving recently used emojis:', e)
    }
  }
  
  // Add emoji to recently used
  const addToRecentlyUsed = (emoji) => {
    // Remove if already exists
    const index = recentlyUsed.value.indexOf(emoji)
    if (index !== -1) {
      recentlyUsed.value.splice(index, 1)
    }
    
    // Add to beginning
    recentlyUsed.value.unshift(emoji)
    
    // Limit to MAX_RECENT
    if (recentlyUsed.value.length > MAX_RECENT) {
      recentlyUsed.value = recentlyUsed.value.slice(0, MAX_RECENT)
    }
    
    // Save to localStorage
    saveRecentlyUsed()
  }
  
  // Emoji data with categories
  const allEmojis = {
    'Smileys': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '🥳', '🤠', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮',
      '😯', '😲', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭'
    ],
    'Activities': [
      '🕹️', '🎮', '👾', '🎲', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤',
      '🎧', '🎼', '🎹', '🥁', '🎸', '🎷', '🎺', '🎻', '🎭', '🪩'
    ],
    'Travel': [
      '🚀', '🛸', '🌌', '🌠', '🎇', '🎆', '🌃', '🌌', '🌑', '🌒',
      '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜'
    ],
    'Objects': [
      '💻', '📱', '💿', '📀', '💾', '📷', '🔋', '🔌', '💡', '🔦',
      '🧮', '🎥', '📺', '📻', '⏰', '⏱️', '⏲️', '🕰️', '📡', '🔭'
    ],
    'Symbols': [
      '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💥', '☄️', '🌪️', '🌈',
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', ''
    ],
    'Recent': [] // Will be populated from recentlyUsed
  }
  
  // Expanded emoji names for better search
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
    '🚀': 'Rocket',
    '🎮': 'Video Game',
    '💫': 'Dizzy',
    '💻': 'Laptop',
    '📱': 'Mobile Phone',
    '❤️': 'Red Heart',
    '🔥': 'Fire',
    '✨': 'Sparkles',
    // Add more as needed
  }
  
  // Emoji shortcuts for typing
  const emojiShortcuts = {
    '😀': 'grinning_face',
    '😃': 'grinning_face_with_big_eyes',
    '😄': 'grinning_face_with_smiling_eyes',
    '😁': 'beaming_face_with_smiling_eyes',
    '😆': 'grinning_squinting_face',
    '😅': 'grinning_face_with_sweat',
    '😂': 'joy',
    '🤣': 'rofl',
    '🥲': 'smiling_face_with_tear',
    '🥹': 'face_holding_back_tears',
    '😉': 'wink',
    '😊': 'blush',
    '😇': 'innocent',
    '🥰': 'smiling_face_with_hearts',
    '😍': 'heart_eyes',
    '🤩': 'star_struck',
    '😘': 'kissing_heart',
    '😗': 'kissing',
    '😚': 'kissing_closed_eyes',
    '😙': 'kissing_smiling_eyes',
    '🥳': 'partying_face',
    '🤠': 'cowboy_hat_face',
    '😎': 'sunglasses',
    '🤓': 'nerd_face',
    '🧐': 'monocle_face',
    '🚀': 'rocket',
    '🎮': 'video_game',
    '💫': 'dizzy',
    '💻': 'laptop',
    '📱': 'mobile_phone',
    '❤️': 'heart',
    '🔥': 'fire',
    '✨': 'sparkles',
    // Add more as needed
  }
  
  // Get emoji name for tooltip
  const getEmojiName = (emoji) => {
    return emojiNames[emoji] || 'Emoji'
  }
  
  // Get emoji shortcut for tooltip
  const getEmojiShortcut = (emoji) => {
    return emojiShortcuts[emoji] || emoji.codePointAt(0).toString(16)
  }
  
  // Current emojis based on selected category
  const currentEmojis = computed(() => {
    if (currentCategory.value === 'Recent') {
      return recentlyUsed.value
    }
    return allEmojis[currentCategory.value] || []
  })
  
  // Filtered emojis based on search
  const filteredEmojis = computed(() => {
    if (!searchQuery.value) {
      return currentEmojis.value
    }
    
    const query = searchQuery.value.toLowerCase()
    
    // If searching, search across all categories
    const allEmojisList = Object.values(allEmojis).flat()
    
    return allEmojisList.filter(emoji => {
      const name = getEmojiName(emoji).toLowerCase()
      const shortcut = getEmojiShortcut(emoji).toLowerCase()
      return name.includes(query) || emoji.includes(query) || shortcut.includes(query)
    })
  })
  
  const emojiPicker = ref(null)
  
  const selectEmoji = (emoji) => {
    addToRecentlyUsed(emoji)
    emit('select', emoji)
  }
  
  const selectCategory = (category) => {
    currentCategory.value = category
    searchQuery.value = '' // Clear search when changing category
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }
  
  const filterEmojis = () => {
    // This function exists to handle the @input event
    // The actual filtering is done by the computed property
  }
  
  const closeOnClickOutside = (event) => {
    if (emojiPicker.value && !emojiPicker.value.contains(event.target)) {
      emit('close')
    }
  }
  
  // Reset to default category when picker is shown
  watch(() => props.show, (newVal) => {
    if (newVal) {
      searchQuery.value = ''
      currentCategory.value = 'Smileys'
      
      // Focus search input when picker is shown
      nextTick(() => {
        if (searchInput.value) {
          searchInput.value.focus()
        }
      })
    }
  })
  
  onMounted(() => {
    document.addEventListener('click', closeOnClickOutside)
    loadRecentlyUsed()
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', closeOnClickOutside)
  })
  </script>
  
  <style scoped>
  .emoji-picker {
    position: absolute;
    bottom: 4.5rem;
    right: 0; /* Position on the right side of the button */
    background: linear-gradient(to bottom, rgba(27, 56, 85, 0.95), rgba(17, 25, 32, 0.95));
    backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 1010 !important; /* Higher z-index to ensure visibility */
    max-height: 350px;
    overflow-y: auto;
    overflow-x: hidden !important; /* Prevent horizontal scrolling */
    width: 320px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  /* Search input */
  .search-container {
    position: relative;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    position: absolute;
    left: 10px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  
  .clear-search {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color 0.2s ease;
  }
  
  .clear-search:hover {
    color: white;
  }
  
  .emoji-search {
    width: 100%;
    padding: 0.75rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
  }
  
  .emoji-search:focus {
    border-color: #00a2fff8;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
    background: rgba(255, 255, 255, 0.15);
  }
  
  .emoji-search::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  /* Categories */
  .emoji-categories {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0.5rem;
  }
  
  .category-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .category-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.1);
  }
  
  .category-btn.active {
    background: rgba(59, 130, 246, 0.5);
    transform: scale(1.1);
  }
  
  /* Search results count */
  .search-results {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    padding: 0.25rem 0;
    margin-bottom: 0.5rem;
  }
  
  /* Emoji grid */
  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
    width: 100%;
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .emoji:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.1);
  }
  
  /* No results message */
  .no-results {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    padding: 1rem 0;
    font-size: 0.9rem;
  }
  
  /* Recently used section */
  .recently-used {
    margin-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 0.5rem;
  }
  
  .section-title {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
  }
  
  /* Emoji tooltip */
  .emoji-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 8px;
    padding: 0.75rem;
    width: 200px;
    text-align: center;
    z-index: 1020;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
    animation: fadeIn 0.2s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .tooltip-emoji {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .tooltip-name {
    font-size: 0.9rem;
    color: white;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  
  .tooltip-shortcut {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    font-family: monospace;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
  }
  
  /* Scrollbar styling */
  .emoji-picker::-webkit-scrollbar {
    width: 0.5rem;
  }
  
  .emoji-picker::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 24px;
  }
  
  .emoji-picker::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.8);
    border-radius: 24px;
    transition: background 0.3s ease;
  }
  
  .emoji-picker::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 1);
  }
  
  /* Animation */
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
  