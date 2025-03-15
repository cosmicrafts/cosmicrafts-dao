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

const changeLanguage = (languageCode) => {
  languageStore.setLanguage(languageCode);
  isDropdownOpen.value = false;
};

const toggleDropdown = (event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleClickOutside = (event) => {
  const dropdownElement = document.querySelector('.mobile-lang-selector');
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
  <div class="mobile-lang-selector" @click="toggleDropdown">
    <img src="@/assets/icons/lang.svg" alt="Language Icon" class="lang-icon" />
    <span class="lang-label">
      {{ currentLanguageLabel }}
    </span>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <ul v-if="isDropdownOpen" class="dropdown-menu">
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
.mobile-lang-selector {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  z-index: 15;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mobile-lang-selector:hover {
  background: rgba(0, 195, 255, 0.1);
}

.lang-icon {
  width: 1.75rem;
  height: 1.75rem;
  filter: drop-shadow(0 0 5px rgba(0, 195, 255, 0.5));
}

.lang-label {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  bottom: 120%;
  left: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 43, 56, 0.95);
  border: 1px solid rgba(0, 195, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  width: max-content;
  min-width: 320px;
  backdrop-filter: blur(8px);
  z-index: 20;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Language items */
.lang-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: #ffffff;
  font-size: 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.lang-item:hover {
  background: rgba(0, 195, 255, 0.2);
  color: #00c3ff;
  text-shadow: 0 0 5px rgba(0, 195, 255, 0.5);
}

.lang-item.active {
  background: rgba(0, 195, 255, 0.3);
  color: #00c3ff;
  text-shadow: 0 0 5px rgba(0, 195, 255, 0.5);
}

@media (max-width: 576px) {
  .dropdown-menu {
    grid-template-columns: repeat(2, 1fr);
    min-width: 240px;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
</style> 