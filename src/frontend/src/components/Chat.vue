<script setup lang="ts">
import { ChatBubbleOvalLeftEllipsisIcon, FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";

import EmojiPicker from './EmojiPicker.vue';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore, languages } from '../stores/language';

// Reactive state
const showChat = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const isAnimating = ref<boolean>(false);
const messages = ref<Array<{ role: string; content: string }>>([]);
const prompt = ref<string>("");
const loading = ref<boolean>(false);
const currentMessage = ref<string>("");

const chatWindow = ref<HTMLElement | null>(null);
const isDragging = ref<boolean>(false);
const isResizing = ref<boolean>(false);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startWidth = ref<number>(0);
const startHeight = ref<number>(0);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);

const authStore = useAuthStore();
const languageStore = useLanguageStore();
const MAX_HISTORY_TOKENS = 1000; // Adjust for performance
const showEmojiPicker = ref<boolean>(false);
const chatInput = ref<HTMLElement | null>(null); // Reference for the input box

const injectMemory = async (userId: string, newMessage: string) => {
  console.log(`Building structured memory for user: ${userId}`);

  // ✅ User Profile (expanded)
  const userProfile = {
    username: authStore.player?.username || "guest",
    language: languages.find(lang => lang.code === (authStore.player?.language || "en"))?.label || "English",
    faction: authStore.player?.faction || "Unknown",
    level: authStore.player?.level || 1,
    experience: authStore.player?.experience || 0,
    rank: authStore.player?.rank || "Unranked",
    resources: authStore.player?.resources || {},
    achievements: authStore.player?.achievements || [],
    lastLogin: authStore.player?.lastLogin || "Unknown",
  };

  // ✅ Prune chat history before injecting it
  pruneChatHistory(); 

  // ✅ Retrieve the last 10 messages (for context)
  const conversationHistory = messages.value.slice(-10); // Limit history
  let historyLog = conversationHistory
    .map((msg) => `[${new Date().toLocaleTimeString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n");

  // ✅ Structured Prompt for Ollama
  const finalPrompt = `
[SYSTEM INSTRUCTIONS]
This is a structured log of an AI chat assistant. 
The user has a profile and a conversation history. 
Use the timestamps to understand conversation flow.


[USER PROFILE]
- Username: ${userProfile.username}
- Language: ${userProfile.language} **REPLY IN THIS LANGUAGE**
- Faction: ${userProfile.faction}
- Level: ${userProfile.level}
- Experience: ${userProfile.experience}
- Rank: ${userProfile.rank}
- Resources: ${JSON.stringify(userProfile.resources)}
- Achievements: ${userProfile.achievements.join(", ")}
- Last Login: ${userProfile.lastLogin}


[CONVERSATION HISTORY]
${historyLog}

[NEW USER INPUT]
"${newMessage}"

[RESPONSE]
`;

  // ✅ Log the full prompt sent to Ollama
  console.log(`🔍 Final Prompt Sent to Ollama:\n${finalPrompt}`);

  return finalPrompt;
};

const saveChatHistory = () => {
  localStorage.setItem("chatHistory", JSON.stringify(messages.value));
};

const loadChatHistory = () => {
  const storedChat = localStorage.getItem("chatHistory");
  if (storedChat) {
    messages.value = JSON.parse(storedChat);
  }
};

// 🔥 Load history when component mounts
onMounted(() => {
  loadChatHistory();
});

// 🔥 Save history after every message
watch(messages, () => {
  saveChatHistory();
});

const pruneChatHistory = () => {
  let totalTokens = 0;
  let prunedMessages = [];

  // ✅ Keep latest messages until reaching the max token limit
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const msg = messages.value[i];
    const msgTokens = msg.content.length / 4; // Approximate token count

    if (totalTokens + msgTokens > MAX_HISTORY_TOKENS) break;

    prunedMessages.unshift(msg);
    totalTokens += msgTokens;
  }

  messages.value = prunedMessages;
};

// ✅ Send Message to Backend
const sendPrompt = async (): Promise<void> => {
  if (!prompt.value.trim() || loading.value) return;

  const userMessage: string = prompt.value.trim();
  messages.value.push({ role: "user", content: userMessage });

  await nextTick();
  focusInput();

  try {
    loading.value = true;
    currentMessage.value = "";

    // ✅ Fetch structured memory & inject it
    const userId = authStore.player?.username || "guest";
    const tempPrompt = await injectMemory(userId, userMessage);

    const response: Response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "robotina",
        prompt: tempPrompt,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to read response stream");

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk: string = decoder.decode(value, { stream: true }).trim();
      const lines: string[] = chunk.split("\n");

      for (const line of lines) {
        if (!line) continue;

        try {
          const json = JSON.parse(line);
          if (json.response) {
            currentMessage.value += json.response;
          }
        } catch (err) {
          console.error("JSON parse error:", err);
        }
      }

      await nextTick();
      scrollToBottom();
    }

    messages.value.push({
      role: "assistant",
      content: currentMessage.value,
    });

    currentMessage.value = "";

  } catch (error) {
    console.error("Chat error:", error);
    messages.value.push({ role: "assistant", content: "Error: Failed to get response" });
  } finally {
    loading.value = false;
    saveChatHistory(); // ✅ Save chat history
    await nextTick();
    scrollToBottom();
    focusInput();
  }
};

// ✅ Auto-scroll function
const scrollToBottom = (): void => {
  const chatMessages: HTMLElement | null = document.querySelector(".messages");
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
};

// ✅ Toggle Chat with Animation
const toggleChat = (): void => {
  isAnimating.value = true;
  showChat.value = !showChat.value;
  setTimeout(() => (isAnimating.value = false), 300);
};

// ✅ Make chat resizable from edges/corners
const startResize = (event: MouseEvent): void => {
  if (!chatWindow.value) return;

  isResizing.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  startWidth.value = chatWindow.value.offsetWidth;
  startHeight.value = chatWindow.value.offsetHeight;

  document.addEventListener("mousemove", resizeChat);
  document.addEventListener("mouseup", stopResize);
};

const resizeChat = (event: MouseEvent): void => {
  if (!isResizing.value || !chatWindow.value) return;

  const newWidth: number = startWidth.value + (event.clientX - startX.value);
  const newHeight: number = startHeight.value + (event.clientY - startY.value);

  chatWindow.value.style.width = `${Math.max(300, newWidth)}px`;
  chatWindow.value.style.height = `${Math.max(300, newHeight)}px`;
};

const stopResize = (): void => {
  isResizing.value = false;
  document.removeEventListener("mousemove", resizeChat);
  document.removeEventListener("mouseup", stopResize);
};

// ✅ Make chat draggable
const startDrag = (event: MouseEvent): void => {
  if (!chatWindow.value) return;

  isDragging.value = true;
  offsetX.value = event.clientX - chatWindow.value.getBoundingClientRect().left;
  offsetY.value = event.clientY - chatWindow.value.getBoundingClientRect().top;

  document.addEventListener("mousemove", dragChat);
  document.addEventListener("mouseup", stopDrag);
};

const dragChat = (event: MouseEvent): void => {
  if (!isDragging.value || !chatWindow.value) return;

  const x: number = event.clientX - offsetX.value;
  const y: number = event.clientY - offsetY.value;

  chatWindow.value.style.left = `${x}px`;
  chatWindow.value.style.top = `${y}px`;
};

const stopDrag = (): void => {
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

// ✅ Auto-expand logic
const updatePrompt = (): void => {
  if (!chatInput.value) return;

  const input: HTMLElement = chatInput.value;
  prompt.value = input.innerText.trim(); // Update the real prompt variable
  adjustInputHeight();
};

const adjustInputHeight = (): void => {
  if (!chatInput.value) return;

  const input: HTMLElement = chatInput.value;
  input.style.height = "auto"; // Reset height before measuring
  const maxHeight: number = 120; // Maximum height before scrolling
  if (input.scrollHeight <= maxHeight) {
    input.style.height = `${input.scrollHeight}px`;
  } else {
    input.style.height = `${maxHeight}px`;
    input.style.overflowY = "auto"; // Enable scrolling
  }
};

// ✅ Insert Emoji into Input
const insertEmoji = (emoji: string): void => {
  if (!chatInput.value) return;

  chatInput.value.innerText += emoji;
  updatePrompt();
};

// ✅ Focus Input
const focusInput = (): void => {
  nextTick(() => {
    document.querySelector<HTMLElement>(".chat-input")?.focus();
  });
};
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
<!-- ✅ New Auto-Expanding Input -->
<div
  ref="chatInput"
  class="chat-input"
  contenteditable="true"
  @input="updatePrompt"
  @keydown.enter.prevent="sendPrompt"
  role="textbox"
></div>


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
.chat-toggle {
  position: fixed;
  bottom: 1.5rem;
  right: 1rem;
  width: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(30, 43, 56, 0.9);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: 
    transform 0.3s ease-out, 
    background-color 0.4s ease-out, /* ⏳ Slow fade-out */
    box-shadow 0.6s ease-out; /* ⏳ Longer glow fade */
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.15);
  z-index: 1000;
}

.hover-scale:hover {
  background-color: rgba(0, 195, 255, 0.862); /* Lighter blue background on hover */
  box-shadow: 0 4px 16px rgba(0, 208, 255, 0.896);
}

/* ✅ Chat Window */
.chat-window {
  position: fixed;
  bottom: 6rem;
  right: 1rem;
  width: 400px;
  max-width: 90vw;
  height: 60vh;
  background: linear-gradient(to bottom, rgba(27, 56, 85, 0.858), rgba(17, 25, 32, 0.905));
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
  margin-right: -.75rem;
  width: 2rem;
  height: 1.5rem;
  cursor: pointer;
  
}
.close-icon:hover {
  transform: scale(1.25);
  color: #0099ff;
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
/* ✅ Auto-Expanding Input */
.chat-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px; /* Max height before scrolling */
  padding: 0.75rem;
  background: transparent;
  color: white;
  border: none;
  outline: none;
  overflow-y: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: 5px;
}


.chat-input:focus {
  outline: none;
  border-color: #00a2fff8;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
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
  border-radius: 4rem;
  transition: all 0.1s ease;
  padding: .25rem;
}

.emoji-button:hover {
  color: #3b82f6;
  transform: scale(1.1);
  background: #ffffff21;
  border-radius: 50%;
}

.emoji-button .icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* ✅ Send Icon Button */
.send-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.1s ease;
  width: 2rem;
  margin-right: -.5rem;
  padding: .25rem;
}

.send-icon:hover {
  color: #3b82f6;
  transform: scale(1.1);
  background: #ffffff21;
  border-radius: 50%;
}

@media (max-width: 768px) {
.chat-toggle{
  bottom: 20%;
}

.chat-window {
  position: fixed;
  bottom: 25%;
}

}

</style>