<script setup>
import { ChatBubbleOvalLeftEllipsisIcon, FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/solid"; 
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import EmojiPicker from './EmojiPicker.vue'
import { useAuthStore } from '../stores/auth';

const showChat = ref(false);
const isHovering = ref(false);
const isAnimating = ref(false);
const messages = ref([]);
const prompt = ref("");
const loading = ref(false);
const currentMessage = ref("");

const chatWindow = ref(null);
const isDragging = ref(false);
const isResizing = ref(false);
const startX = ref(0);
const startY = ref(0);
const startWidth = ref(0);
const startHeight = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);

const authStore = useAuthStore();

// ✅ Send Message to Backend
const sendPrompt = async () => {
  if (!prompt.value.trim() || loading.value) return;

  const tempPrompt = prompt.value;
  prompt.value = ""; // ✅ Clears input immediately

  messages.value.push({
    role: "user",
    content: tempPrompt,
  });

  await nextTick();
  focusInput(); // ✅ Immediately refocus input

  try {
    loading.value = true;
    currentMessage.value = "";

    const response = await fetch(
      `http://localhost:8000/chat?prompt=${encodeURIComponent(tempPrompt)}`
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      currentMessage.value += decoder.decode(value, { stream: true });

      await nextTick();
      scrollToBottom();
      focusInput();
    }

    messages.value.push({
      role: "assistant",
      content: currentMessage.value,
    });
    currentMessage.value = "";
  } catch (error) {
    console.error("Chat error:", error);
    messages.value.push({
      role: "assistant",
      content: "Error: Failed to get response",
    });
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
    focusInput();
  }
};

const focusInput = () => {
  nextTick(() => {
    document.querySelector(".chat-input")?.focus();
  });
};


// ✅ Auto-scroll function
const scrollToBottom = () => {
  const chatMessages = document.querySelector(".messages");
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
};

// ✅ Toggle Chat with Animation
const toggleChat = () => {
  isAnimating.value = true;
  showChat.value = !showChat.value;
  setTimeout(() => (isAnimating.value = false), 300);
};

// ✅ Make chat resizable from edges/corners
const startResize = (event) => {
  isResizing.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  startWidth.value = chatWindow.value.offsetWidth;
  startHeight.value = chatWindow.value.offsetHeight;

  document.addEventListener("mousemove", resizeChat);
  document.addEventListener("mouseup", stopResize);
};

const resizeChat = (event) => {
  if (!isResizing.value) return;

  const newWidth = startWidth.value + (event.clientX - startX.value);
  const newHeight = startHeight.value + (event.clientY - startY.value);

  chatWindow.value.style.width = `${Math.max(300, newWidth)}px`;
  chatWindow.value.style.height = `${Math.max(300, newHeight)}px`;
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", resizeChat);
  document.removeEventListener("mouseup", stopResize);
};

// ✅ Make chat draggable
const startDrag = (event) => {
  isDragging.value = true;
  offsetX.value = event.clientX - chatWindow.value.getBoundingClientRect().left;
  offsetY.value = event.clientY - chatWindow.value.getBoundingClientRect().top;

  document.addEventListener("mousemove", dragChat);
  document.addEventListener("mouseup", stopDrag);
};

const dragChat = (event) => {
  if (!isDragging.value) return;

  let x = event.clientX - offsetX.value;
  let y = event.clientY - offsetY.value;

  chatWindow.value.style.left = `${x}px`;
  chatWindow.value.style.top = `${y}px`;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", dragChat);
  document.removeEventListener("mouseup", stopDrag);
};

// ✅ Cleanup event listeners on unmount
onUnmounted(() => {
  document.removeEventListener("mousemove", dragChat);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("mousemove", resizeChat);
  document.removeEventListener("mouseup", stopResize);
});

const showEmojiPicker = ref(false)
</script>

<template>
  <!-- ✅ Floating Chat Button -->
  <div
    class="chat-toggle"
    :class="{ 'hover-scale': isHovering, pulse: !showChat && !isAnimating }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @click="toggleChat"
  >
    <transition name="rotate-icon">
      <ChatBubbleOvalLeftEllipsisIcon v-if="!showChat" class="icon" />
      <XMarkIcon v-else class="icon" />
    </transition>
  </div>

  <!-- ✅ Chat Window -->
  <transition name="slide-fade">
    <div v-if="showChat" class="chat-window">
      <div class="chat-header">
        <span>Cosmicrafts AI</span>
        <XMarkIcon class="close-icon" @click="toggleChat" />
      </div>

      <div class="messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="bubble">
            <span class="message-text">{{ msg.content }}</span>
          </div>
        </div>

        <div v-if="currentMessage" class="message assistant">
          <div class="bubble">
            <span class="message-text">{{ currentMessage }}</span>
          </div>
        </div>

      </div>
      <!-- ✅ Input Area -->
        <div class="input-area">
        <div class="input-wrapper">
            
            <!-- Input Field -->
            <input
            v-model="prompt"
            @keyup.enter="sendPrompt"
            :placeholder="loading ? '' : 'Ask me anything...'"
            :disabled="loading"
            class="chat-input"
            />
            <!-- Thinking Indicator (Icon + Text) -->
            <div v-if="loading" class="thinking-indicator">
            <div class="dot-flashing"></div>
            <span class="thinking-text">Thinking...</span>
            </div>
        </div>
        <button class="emoji-button" @click="showEmojiPicker = !showEmojiPicker">
        <FaceSmileIcon class="icon" />
      </button>
        <button class="send-icon" @click="sendPrompt" :disabled="loading">
            <PaperAirplaneIcon class="icon" />
        </button>
        </div>
        <EmojiPicker
        v-if="showEmojiPicker"
        :show="showEmojiPicker"
        @select="(emoji) => { prompt += emoji; showEmojiPicker = false }"
        @close="showEmojiPicker = false"
        />
    </div>
  </transition>
</template>

<style scoped>
/* ✅ Floating Chat Button */
/* ✅ Floating Chat Button */
.chat-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: #ff0000;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 64px rgb(0, 217, 255);
  transition: all 0.25s ease-in-out;
  z-index: 1000;
}

.hover-scale:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* ✅ Chat Window */
.chat-window {
  position: fixed;
  bottom: 8rem;
  right: 2rem;
  width: 400px;
  max-width: 90vw;
  height: 60vh;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.658), rgba(23, 33, 43, 0.705));
  backdrop-filter: blur(8px);
  color: #f5f5f5;
  overflow: hidden;
  z-index: 999;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid rgba(126, 126, 126, 0.1);
}

/* ✅ Chat Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.2), rgba(23, 33, 43, 0.4));
  border-bottom: 1px solid rgba(126, 126, 126, 0.1);
}

.close-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* ✅ Chat Messages */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  overflow-x: hidden; /* ✅ Prevents horizontal scrolling */
}

/* ✅ Chat Bubbles */
.bubble {
  max-width: 75%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding: 1rem;
  border-radius: 12px;
  display: inline-block;
  overflow: hidden; /* ✅ Ensures text stays inside */
  white-space: normal; /* ✅ Forces text to wrap instead of overflowing */
}

.message-text {
  display: block; /* ✅ Ensures it behaves like a paragraph */
  word-wrap: break-word; /* ✅ Prevents overflow */
  overflow-wrap: break-word; /* ✅ Wraps long words properly */
  line-height: 2;
}

.user {
  display: flex;
  justify-content: flex-end;
}

.user .bubble {
  background: #246bdd28;
  color: white;
  text-align: right;
  margin-top: 1rem;
}

.assistant {
  display: flex;
  justify-content: flex-start;
}

.assistant .bubble {
  background: #324b6362;
  color: #ddd;
  text-align: left;
  margin-top: 1rem;
}

/* ✅ Input Area */
.input-area {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #1e1e1e38;
  border-top: 1px solid rgba(126, 126, 126, 0.1);
  gap: 0.5rem; /* ✅ Adds spacing between input and button */
}

/* ✅ Input Field */
.chat-input {
  flex: 1; /* ✅ Ensures input takes up remaining space */
  padding: 1rem;
  background: #1b1b1b;
  border: 1px solid #ffffff21;
  border-radius: 0.5rem;
  color: white;
  transition: all 0.2s ease;
}

.chat-input:focus {
  outline: none;
  border-color: #00a2fff8;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

/* ✅ Send Icon Button */
.send-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #85b6ff;
  transition: all 0.2s ease;
  width: 2.5rem;
  flex-shrink: 0; /* ✅ Prevents button from shrinking */
  margin-right: -.5rem;
}

.send-icon:hover {
  color: #ffffff;
  background: #ffffff21;
  border-radius: 0.5rem;
}

/* ✅ Input Wrapper */
.input-wrapper {
  flex: 1; /* ✅ Ensures input takes up remaining space */
  display: flex;
  align-items: center;
  position: relative;
}

/* ✅ Thinking Icon */
.thinking-icon {
  position: relative;
  left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✅ Thinking Indicator (Icon + Text) */
.thinking-indicator {
  position: absolute;
  left: 1rem; /* Adjust based on input padding */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Space between icon and text */
  pointer-events: none; /* Ensure it doesn't interfere with input */
}
/* ✅ Dot Flashing Animation */
.dot-flashing {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  animation: dotFlashing 1s infinite linear alternate;
  animation-delay: 0.5s;
}

.dot-flashing::before,
.dot-flashing::after {
  content: "";
  display: inline-block;
  position: absolute;
  top: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.dot-flashing::before {
  left: -12px;
  animation: dotFlashing 1s infinite alternate;
  animation-delay: 0s;
}

.dot-flashing::after {
  left: 12px;
  animation: dotFlashing 1s infinite alternate;
  animation-delay: 1s;
}

@keyframes dotFlashing {
  0% {
    background-color: #3b82f6;
  }
  50%,
  100% {
    background-color: rgba(59, 130, 246, 0.2);
  }
}

/* ✅ Thinking Text */
.thinking-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* ✅ Three-Dot Typing Animation */
.dot-typing {
  position: absolute;
  left: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
}

.dot-typing span {
  width: 5px;
  height: 5px;
  margin: 0 3px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: typingDots 1.4s infinite ease-in-out;
}

.dot-typing span:nth-child(1) { animation-delay: 0s; }
.dot-typing span:nth-child(2) { animation-delay: 0.2s; }
.dot-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDots {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ✅ Glowing Text Effect */
.thinking-glow {
  position: absolute;
  color: rgba(59, 130, 246, 0.8);
  font-weight: bold;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  animation: glowPulse 1.5s infinite alternate ease-in-out;
}

@keyframes glowPulse {
  0% { opacity: 0.5; text-shadow: 0 0 4px rgba(59, 130, 246, 0.3); }
  100% { opacity: 1; text-shadow: 0 0 12px rgba(59, 130, 246, 0.8); }
}


/* ✅ Scrollbar - Webkit (Chrome, Edge, Safari) */
.messages::-webkit-scrollbar {
  width: 1rem; /* Slim scrollbar */
}

.messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1); /* Subtle track */
  border-radius: 24px;
}

.messages::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.8); /* Blue thumb */
  border-radius: 24px;
  transition: background 0.3s ease;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 1); /* Brighten on hover */
}

/* ✅ Scrollbar - Firefox */
.messages {
  scrollbar-width: 1rem;
  scrollbar-color: rgba(59, 130, 246, 0.8) rgba(255, 255, 255, 0.1);
}

/* ✅ Fix: Make emoji button visible */
.emoji-button {
  background: none;
  border: none;
  color: #ffffff; /* ✅ Change color */
  cursor: pointer;
  transition: all 0.2s ease;
}

.emoji-button:hover {
  color: #3b82f6;
  transform: scale(1.1);
}

.emoji-button .icon {
  width: 1.5rem;
  height: 1.5rem;
}

</style>
