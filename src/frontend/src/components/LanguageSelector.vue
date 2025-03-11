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
    default: 'header', // 'header' or 'footer'
  }
});

// Computed property to determine dropdown position based on context
const getDropdownPosition = computed(() => {
  return props.context === 'footer' ? 'dropdown-top' : 'dropdown-bottom';
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
  const dropdownElement = document.querySelector('.language-selector');
  if (dropdownElement && !dropdownElement.contains(event.target)) {
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
  <div class="language-selector" @click="toggleDropdown">
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
  z-index: 1000;
}

.lang-icon {
  width: 1.25rem;
  height: 1.25rem;
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.3));
}

.lang-label {
  display: inline;
}

/* Optimized dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 25, 45, 0.95);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: max-content;
  min-width: 320px;
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

/* Language items */
.lang-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.lang-item:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary);
}

.lang-item.active {
  background: rgba(15, 185, 253, 0.15);
  color: var(--color-primary);
}

@media (min-width: 767px) {
  .header .language-selector .lang-label {
    display: none;
  }
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
