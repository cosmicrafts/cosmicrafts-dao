<script setup>
import { ref, inject, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const isDropdownOpen = ref(false);

// Inject the centralized language state
const selectedLanguage = inject('selectedLanguage');
const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" }, 
  { code: "tr", label: "Türkçe" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

// Define props for dropdown direction
const props = defineProps({
  direction: {
    type: String,
    default: "up-right"
  }
});

const changeLanguage = (languageCode) => {
  selectedLanguage.value = languageCode;
  locale.value = languageCode;
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

// Watch for changes in the global language state and update locale accordingly
watch(selectedLanguage, (newLang) => {
  locale.value = newLang;
});
</script>


<template>
  <div class="language-selector" @click="toggleDropdown">
    <img src="@/assets/icons/lang.svg" alt="Language Icon" class="lang-icon" />
    <span class="lang-label">{{ languages.find(lang => lang.code === selectedLanguage).label }}</span>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <ul v-if="isDropdownOpen" :class="['dropdown-menu', direction]">
        <li v-for="(lang, index) in languages" :key="lang.code" :style="{ '--index': index }" @click.stop="changeLanguage(lang.code)">
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
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: background-color 0.1s ease;
  font-weight: 600;
}

.lang-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.lang-label {
  display: inline; /* Default display for non-desktop instances */
}

/* Dropdown open/close animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8);
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  display: grid;
  grid-template-columns: repeat(2, 3fr);
  gap: 0.9rem;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.98), rgba(23, 33, 43, 0.99));
  border: 1px solid #3a3a3a;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  font-weight: 700;
  border: 0.25px solid rgba(255, 255, 255, 0.086);
  border-radius: 10px;
  transform-origin: top left;
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

/* Staggered animation for each language */
.dropdown-menu li {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  color: #e2e8f0;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transform: translateX(-10px);
  animation: fadeIn 0.25s ease forwards;
  animation-delay: calc(0.05s * var(--index)); /* Stagger each item */
}

/* Animation on hover */
.dropdown-menu li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 767px) {
  /* Hide the language label on larger screens (for header) */
  .header .language-selector .lang-label {
    display: none;
  }
}
</style>
