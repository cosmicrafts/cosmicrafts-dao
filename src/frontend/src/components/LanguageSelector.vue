<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLanguageStore } from '@/stores/language';

const isDropdownOpen = ref(false);
const languageStore = useLanguageStore();

// Use a computed property for currentLanguage
const currentLanguage = computed(() => languageStore.currentLanguage);

// Use a computed property for the language label
const currentLanguageLabel = computed(() => {
  return languages.find((lang) => lang.code === currentLanguage.value)?.label || 'English';
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

// Define props for context
const props = defineProps({
  context: {
    type: String,
    default: 'header', // 'header', 'footer', or 'mobile'
  }
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

const handleClickOutside = (event) => {
  // Get all language selectors
  const dropdownElements = document.querySelectorAll('.language-selector');
  let isInsideAnyDropdown = false;
  
  // Check if click is inside any language selector
  dropdownElements.forEach(element => {
    if (element.contains(event.target)) {
      isInsideAnyDropdown = true;
    }
  });
  
  // Close dropdown if click is outside all language selectors
  if (!isInsideAnyDropdown) {
    isDropdownOpen.value = false;
  }
};

// Add and remove the event listener on mount and unmount
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="language-selector" :class="context" @click="toggleDropdown">
    <img src="@/assets/icons/lang.svg" alt="Language Icon" class="lang-icon" />
    <span class="lang-label">
      {{ currentLanguageLabel }}
    </span>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <ul v-if="isDropdownOpen" :class="['dropdown-menu', getDropdownPosition]">
        <li
          v-for="lang in languages"
          :key="lang.code"
          class="lang-item"
          :class="{ active: lang.code === currentLanguage }"
          @click.stop="changeLanguage(lang.code)"
        >
          {{ lang.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  z-index: var(--cosmic-z-dropdown);
  transition: all var(--cosmic-transition-fast);
}

.language-selector:hover {
  transform: none;
}

.lang-icon {
  width: 1.25rem;
  height: 1.25rem;
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
  transition: all var(--cosmic-transition-fast);
}

.language-selector:hover .lang-icon {
  filter: drop-shadow(var(--cosmic-glow-blue-md));
  transform: none;
}

.lang-label {
  display: inline;
  color: var(--cosmic-text-primary);
  transition: all var(--cosmic-transition-fast);
}

.language-selector:hover .lang-label {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

/* Optimized dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--cosmic-transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  width: max-content;
  min-width: 320px;
  backdrop-filter: var(--cosmic-glass-blur);
}

/* Position for footer (top) */
.dropdown-top {
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  transform-origin: bottom center;
}

/* Position for header (bottom) */
.dropdown-bottom {
  top: 120%;
  right: 0;
  transform-origin: top right;
}

/* Position for mobile menu */
.dropdown-mobile {
  bottom: 120%;
  left: 0;
  transform: none;
  transform-origin: bottom left;
  z-index: 20;
  box-shadow: var(--cosmic-shadow-lg), var(--cosmic-glow-blue-md);
  border: 2px solid rgba(15, 185, 253, 0.3);
}

/* Language items */
.lang-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: var(--cosmic-text-primary);
  font-size: 0.9rem;
  border-radius: var(--cosmic-radius-sm);
  transition: all var(--cosmic-transition-fast);
  position: relative;
  overflow: hidden;
}

.lang-item::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  transition: transform 0.6s ease;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
}

.lang-item:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
  transform: none;
}

.lang-item:hover::after {
  transform: rotate(45deg) translate(50%, 50%);
  opacity: 1;
}

.lang-item.active {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
  box-shadow: var(--cosmic-shadow-sm);
}

@media (min-width: 767px) {
  .header .language-selector .lang-label {
    display: none;
  }
}

/* Mobile menu specific styling */
.language-selector[class*="mobile"] {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  background: none;
  border: none;
  box-shadow: none;
}

.language-selector[class*="mobile"]:hover {
  background: none;
  border: none;
  box-shadow: none;
}

.language-selector[class*="mobile"] .lang-icon {
  width: 1.5rem;
  height: 1.5rem;
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
}

.language-selector[class*="mobile"] .lang-label {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
}

.language-selector[class*="mobile"]:hover .lang-label {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

@media (max-width: 576px) {
  .dropdown-menu {
    grid-template-columns: repeat(3, 1fr);
    min-width: 280px;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
