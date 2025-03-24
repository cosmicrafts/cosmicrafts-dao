<!-- File: components/navigation/LanguageSelector.vue -->
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLanguageStore } from '@/stores/language';

const isDropdownOpen = ref(false);
const languageStore = useLanguageStore();
const dropdownRef = ref(null);

// Use a computed property for currentLanguage
const currentLanguage = computed(() => languageStore.currentLanguage);

// Define props for context
const props = defineProps({
  context: {
    type: String,
    default: 'header', // 'header', 'footer', or 'mobile'
  }
});

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

// Use a computed property for the language label
const currentLanguageLabel = computed(() => {
  return languages.find((lang) => lang.code === currentLanguage.value)?.label || 'English';
});

// Computed property to determine dropdown position based on context
const getDropdownPosition = computed(() => {
  if (props.context === 'footer') return 'dropdown-top';
  if (props.context === 'mobile') return 'dropdown-mobile';
  return 'dropdown-bottom';
});

const changeLanguage = (languageCode) => {
  languageStore.setLanguage(languageCode); // Use the store method to update language
  isDropdownOpen.value = false;
};

const toggleDropdown = (event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event) => {
  // Only close if the click is outside the dropdown
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// Close when clicking outside
onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<template>
  <div class="language-selector" ref="dropdownRef">
    <button 
      class="language-button" 
      @click="toggleDropdown"
      :class="{ active: isDropdownOpen }"
    >
      <span class="lang-code">{{ currentLanguage.toUpperCase() }}</span>
      <span class="lang-label" v-if="props.context !== 'mobile'">{{ currentLanguageLabel }}</span>
      <i class="fa-solid fa-chevron-down" :class="{ rotated: isDropdownOpen }"></i>
    </button>
    
    <div 
      v-if="isDropdownOpen" 
      class="language-dropdown cosmic-panel" 
      :class="getDropdownPosition"
    >
      <div class="dropdown-header">
        <span>{{ props.context === 'mobile' ? 'Select Language' : 'Language' }}</span>
      </div>
      <ul class="language-list">
        <li 
          v-for="language in languages" 
          :key="language.code"
          @click="changeLanguage(language.code)"
          :class="{ active: language.code === currentLanguage }"
        >
          <div class="language-option">
            <span class="lang-code">{{ language.code.toUpperCase() }}</span>
            <span class="lang-label">{{ language.label }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
  z-index: 10;
}

.language-button {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.language-button:hover,
.language-button.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.lang-code {
  font-weight: bold;
  margin-right: 4px;
}

.lang-label {
  margin-right: 6px;
}

.fa-chevron-down {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  min-width: 160px;
  background: var(--color-background-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dropdown-bottom {
  top: calc(100% + 5px);
  left: 0;
}

.dropdown-top {
  bottom: calc(100% + 5px);
  left: 0;
}

.dropdown-mobile {
  position: relative;
  width: 100%;
  margin-top: 10px;
}

.dropdown-header {
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: bold;
}

.language-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
}

.language-list li {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.language-list li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.language-list li.active {
  background-color: rgba(124, 58, 237, 0.2);
}

.language-option {
  display: flex;
  align-items: center;
}

.language-option .lang-code {
  width: 28px;
  display: inline-block;
  font-weight: bold;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .language-button .lang-label {
    display: none;
  }
}
</style> 