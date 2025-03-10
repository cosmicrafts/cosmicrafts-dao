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

// Define props for dropdown direction
const props = defineProps({
  direction: {
    type: String,
    default: 'up-right',
  },
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
  <div class="language-selector cosmic-hover-effect" @click="toggleDropdown">
    <img src="@/assets/icons/lang.svg" alt="Language Icon" class="lang-icon cosmic-float" />
    <span class="lang-label cosmic-text">
      {{ currentLanguageLabel }}
    </span>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <ul v-if="isDropdownOpen" :class="['dropdown-menu cosmic-panel', props.direction]">
        <li
          v-for="(lang, index) in languages"
          :key="lang.code"
          :style="{ '--index': index }"
          class="cosmic-hover-effect"
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
  z-index: 1000000;
}

.lang-icon {
  width: 1.25rem;
  height: 1.25rem;
  filter: drop-shadow(var(--cosmic-text-glow));
}

.lang-label {
  display: inline;
}

/* Dropdown open/close animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s var(--cosmic-bounce);
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.2) scaleX(0.2);
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  display: grid;
  grid-template-columns: repeat(4, 2fr);
  gap: 2rem;
  margin-top: .75rem;
  padding: 1.5rem;
  width: max-content;
  min-width: 480px;
}

/* Positioning for up-right */
.dropdown-menu.up-right {
  bottom: 110%;
  left: 0;
}

/* Positioning for down-left */
.dropdown-menu.down-left {
  top: 110%;
  right: 0;
}

/* Language items */
.dropdown-menu li {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  color: var(--color-text-primary);
  font-size: 1rem;
  border-radius: var(--radius-small);
  animation: fadeIn 0.25s var(--cosmic-bounce) forwards;
  animation-delay: calc(0.05s * var(--index));
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s var(--cosmic-bounce);
}

.dropdown-menu li:hover {
  background: var(--cosmic-hover-bg);
  color: var(--color-primary);
  text-shadow: var(--cosmic-text-glow);
}

.dropdown-menu li.active {
  background: var(--cosmic-active-bg);
  color: var(--color-primary);
  text-shadow: var(--cosmic-text-glow);
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 767px) {
  .header .language-selector .lang-label {
    display: none;
  }
}

@media (max-width: 576px) {
  .dropdown-menu {
    grid-template-columns: repeat(3, 1fr);
    min-width: 320px;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
