<template>
  <transition name="fade">
    <div v-if="isOpen" class="esc-menu-overlay" @click="closeOnClickOutside" @keydown.esc.stop="close">
      <div class="esc-menu" @click.stop>
        <div class="esc-menu-header">
          <h2>Menu</h2>
          <button class="close-button" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="esc-menu-content">
          <div class="menu-section">
            <h3>Game</h3>
            <button class="menu-item" @click="navigate('/')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </button>
            <button class="menu-item" @click="navigate('/game')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Play Game
            </button>
          </div>
          
          <div class="menu-section">
            <h3>Settings</h3>
            <button class="menu-item" @click="toggleTheme">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              Toggle Theme
            </button>
            <button class="menu-item" @click="toggleSound">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
              {{ soundEnabled ? 'Sound: On' : 'Sound: Off' }}
            </button>
          </div>
          
          <div class="menu-section">
            <h3>Help</h3>
            <button class="menu-item" @click="navigate('/whitepaper')">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Whitepaper
            </button>
            <button class="menu-item" @click="showKeyboardShortcuts = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                <path d="M6 8h.001"></path>
                <path d="M10 8h.001"></path>
                <path d="M14 8h.001"></path>
                <path d="M18 8h.001"></path>
                <path d="M8 12h.001"></path>
                <path d="M12 12h.001"></path>
                <path d="M16 12h.001"></path>
                <path d="M7 16h10"></path>
              </svg>
              Keyboard Shortcuts
            </button>
          </div>
        </div>
        
        <div class="esc-menu-footer">
          <p>Press <span class="key">ESC</span> to close this menu</p>
        </div>
      </div>
      
      <!-- Keyboard shortcuts modal -->
      <div v-if="showKeyboardShortcuts" class="keyboard-shortcuts-modal" @click.stop>
        <div class="modal-header">
          <h3>Keyboard Shortcuts</h3>
          <button class="close-button" @click="showKeyboardShortcuts = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <table class="shortcuts-table">
            <tbody>
              <tr>
                <td><span class="key">ESC</span></td>
                <td>Toggle menu / Close windows</td>
              </tr>
              <tr>
                <td><span class="key">C</span></td>
                <td>Open chat</td>
              </tr>
              <tr>
                <td><span class="key">M</span></td>
                <td>Toggle sound</td>
              </tr>
              <tr>
                <td><span class="key">F</span></td>
                <td>Toggle fullscreen</td>
              </tr>
              <tr>
                <td><span class="key">H</span></td>
                <td>Go home</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  isOpen: Boolean,
  otherWindowsOpen: Boolean
});

const emit = defineEmits(['close']);

const router = useRouter();
const showKeyboardShortcuts = ref(false);
const soundEnabled = ref(true); // Get from a store in a real implementation

// Methods
const close = () => {
  emit('close');
};

const closeOnClickOutside = (event) => {
  if (event.target.classList.contains('esc-menu-overlay')) {
    close();
  }
};

const navigate = (route) => {
  router.push(route);
  close();
};

const toggleTheme = () => {
  // Implement theme toggling logic here
  // This would typically interact with a theme store or similar
  document.body.classList.toggle('dark-theme');
};

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  // Implement actual sound toggling logic here
};

// Handle keyboard events specifically for the keyboard shortcuts modal
const handleKeyDown = (event) => {
  if (event.key === 'Escape' && showKeyboardShortcuts.value) {
    event.stopPropagation();
    event.preventDefault();
    showKeyboardShortcuts.value = false;
  }
};

onMounted(() => {
  // Only add keyboard handler for the shortcuts modal
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.esc-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200000;
  animation: fadeIn 0.3s ease;
}

.esc-menu {
  background: linear-gradient(to bottom, rgba(27, 56, 85, 0.95), rgba(17, 25, 32, 0.95));
  border-radius: 12px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.esc-menu-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.esc-menu-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.close-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: scale(1.1);
}

.esc-menu-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.menu-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  font-size: 1rem;
  text-align: left;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateX(5px);
}

.menu-item svg {
  color: rgba(59, 130, 246, 0.8);
}

.esc-menu-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.key {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  font-family: monospace;
  color: white;
  font-weight: bold;
  margin: 0 0.2rem;
}

/* Keyboard shortcuts modal */
.keyboard-shortcuts-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(to bottom, rgba(27, 56, 85, 0.98), rgba(17, 25, 32, 0.98));
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2001;
  animation: fadeIn 0.2s ease;
}

.modal-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: white;
}

.modal-content {
  padding: 1.5rem;
}

.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
}

.shortcuts-table tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shortcuts-table tr:last-child {
  border-bottom: none;
}

.shortcuts-table td {
  padding: 0.75rem 0;
  color: white;
}

.shortcuts-table td:first-child {
  width: 80px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 