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
const chatToggle = ref<HTMLElement | null>(null); // Reference to the chat toggle button
const isDragging = ref<boolean>(false);
const isResizing = ref<boolean>(false);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startWidth = ref<number>(0);
const startHeight = ref<number>(0);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);
const isIconDragging = ref<boolean>(false); // Track if the chat icon is being dragged
const iconStartX = ref<number>(0);
const iconStartY = ref<number>(0);
const iconOffsetX = ref<number>(0);
const iconOffsetY = ref<number>(0);
const lastTapTime = ref<number>(0); // For detecting double taps on mobile
const isMaximized = ref<boolean>(false); // Track if the chat window is maximized
const previousWindowState = ref<{
  width: string;
  height: string;
  left: string;
  top: string;
  right: string;
  bottom: string;
}>({
  width: '400px',
  height: '60vh',
  left: 'auto',
  top: 'auto',
  right: '1rem',
  bottom: '6rem'
});
const iconPosition = ref<{ left: string; bottom: string | null; right: string | null; top: string | null }>({
  left: 'auto',
  bottom: '1.5rem',
  right: '1rem',
  top: null
});
// Chat window position
const windowPosition = ref<{ left: string; bottom: string | null; right: string | null; top: string | null }>({
  left: 'auto',
  bottom: '6rem',
  right: '1rem',
  top: null
});

const authStore = useAuthStore();
const languageStore = useLanguageStore();
const MAX_HISTORY_TOKENS = 1000; // Adjust for performance
const showEmojiPicker = ref<boolean>(false);
const chatInput = ref<HTMLElement | null>(null); // Reference for the input box

// Track if we've moved during touch
const hasMoved = ref<boolean>(false);

// Load saved position from localStorage
const loadIconPosition = (): void => {
  const savedPosition = localStorage.getItem('chatIconPosition');
  if (savedPosition) {
    iconPosition.value = JSON.parse(savedPosition);
  }
};

// Save position to localStorage
const saveIconPosition = (): void => {
  localStorage.setItem('chatIconPosition', JSON.stringify(iconPosition.value));
};

// Load saved window position from localStorage
const loadWindowPosition = (): void => {
  const savedPosition = localStorage.getItem('chatWindowPosition');
  if (savedPosition) {
    windowPosition.value = JSON.parse(savedPosition);
  }
};

// Save window position to localStorage
const saveWindowPosition = (): void => {
  localStorage.setItem('chatWindowPosition', JSON.stringify(windowPosition.value));
};

const injectMemory = async (userId: string, newMessage: string) => {
  console.log(`Building structured memory for user: ${userId}`);

  // ✅ User Profile (expanded)
  const userProfile = {
    username: (authStore.player as any)?.username || "guest",
    language: languages.find(lang => lang.code === ((authStore.player as any)?.language || "en"))?.label || "English",
    faction: (authStore.player as any)?.faction || "Unknown",
    level: (authStore.player as any)?.level || 1,
    experience: (authStore.player as any)?.experience || 0,
    rank: (authStore.player as any)?.rank || "Unranked",
    resources: (authStore.player as any)?.resources || {},
    achievements: (authStore.player as any)?.achievements || [],
    lastLogin: (authStore.player as any)?.lastLogin || "Unknown",
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
  Keep answers super short and concise.
  Max 1 question related to your prompt.
  If user is new welcome it first, then invite the user to sign in.
  They can sign in in the top right button.
  This is a structured log of an AI chat assistant. 
  The user has a profile and a conversation history. 
  Use the timestamps to understand conversation flow.
  If user answers short or unintelligibly, follow up with an I feel you.
  After [NEW USER INPUT] the user message is reveleaded.

  **if they prompt you nonesense, try to understand**
  **don't brush off user input, always address concerns**

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

// Load saved position on component mount
onMounted(() => {
  loadChatHistory();
  loadIconPosition();
  
  // Apply saved position to the chat toggle
  nextTick(() => {
    if (chatToggle.value) {
      Object.entries(iconPosition.value).forEach(([key, value]) => {
        if (value !== null && chatToggle.value) {
          (chatToggle.value.style as any)[key] = value;
        }
      });
    }
  });
  
  // Add global keyboard event listeners
  document.addEventListener('keydown', handleKeyDown);
});

// Handle keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent): void => {
  // Check if the active element is an input or textarea to avoid interfering with typing
  const activeElement = document.activeElement;
  const isInputActive = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement ||
                        activeElement?.getAttribute('contenteditable') === 'true';
  
  // 'C' key to open chat (only when not already open and not typing in an input)
  if (event.key.toLowerCase() === 'c' && !showChat.value && !isInputActive) {
    toggleChat();
    event.preventDefault();
  }
  
  // 'ESC' key to close chat (only when open)
  if (event.key === 'Escape' && showChat.value) {
    toggleChat();
    event.preventDefault();
  }
};

// 🔥 Save history after every message
watch(messages, () => {
  saveChatHistory();
});

// Focus input whenever chat is opened
watch(showChat, (newValue) => {
  if (newValue) {
    // Chat was opened, focus the input
    nextTick(() => {
      focusInput();
    });
  }
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
    const userId = (authStore.player as any)?.username || "guest";
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

// ✅ Toggle maximize/restore chat window
const toggleMaximize = (): void => {
  if (!chatWindow.value) return;
  
  if (!isMaximized.value) {
    // Save current state before maximizing
    previousWindowState.value = {
      width: chatWindow.value.style.width || '400px',
      height: chatWindow.value.style.height || '60vh',
      left: chatWindow.value.style.left || 'auto',
      top: chatWindow.value.style.top || 'auto',
      right: chatWindow.value.style.right || '1rem',
      bottom: chatWindow.value.style.bottom || '6rem'
    };
    
    // Maximize window
    chatWindow.value.style.width = '100vw';
    chatWindow.value.style.height = '100vh';
    chatWindow.value.style.left = '0';
    chatWindow.value.style.top = '0';
    chatWindow.value.style.right = 'auto';
    chatWindow.value.style.bottom = 'auto';
    chatWindow.value.style.maxWidth = '100vw';
    chatWindow.value.style.borderRadius = '0';
    
    isMaximized.value = true;
  } else {
    // Restore to previous state
    chatWindow.value.style.width = previousWindowState.value.width;
    chatWindow.value.style.height = previousWindowState.value.height;
    chatWindow.value.style.left = previousWindowState.value.left;
    chatWindow.value.style.top = previousWindowState.value.top;
    chatWindow.value.style.right = previousWindowState.value.right;
    chatWindow.value.style.bottom = previousWindowState.value.bottom;
    chatWindow.value.style.maxWidth = '90vw';
    chatWindow.value.style.borderRadius = '8px';
    
    isMaximized.value = false;
  }
  
  // Scroll to bottom after resize
  nextTick(() => {
    scrollToBottom();
  });
};

// ✅ Make chat resizable from edges/corners
const startResize = (event: MouseEvent): void => {
  if (!chatWindow.value || isMaximized.value) return; // Don't allow resize when maximized
  
  event.preventDefault();
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

  // Calculate width and height changes
  const deltaX: number = event.clientX - startX.value;
  const deltaY: number = event.clientY - startY.value;
  
  // Calculate new dimensions
  const newWidth: number = Math.max(300, startWidth.value + deltaX);
  const newHeight: number = Math.max(300, startHeight.value + deltaY);
  
  // Apply new dimensions directly for immediate response
  chatWindow.value.style.width = `${newWidth}px`;
  chatWindow.value.style.height = `${newHeight}px`;
  
  // Update the previous window state with new dimensions
  previousWindowState.value.width = chatWindow.value.style.width;
  previousWindowState.value.height = chatWindow.value.style.height;
};

const stopResize = (): void => {
  isResizing.value = false;
  document.removeEventListener("mousemove", resizeChat);
  document.removeEventListener("mouseup", stopResize);
};

// ✅ Make chat draggable
const startDrag = (event: MouseEvent): void => {
  if (!chatWindow.value || isMaximized.value) return; // Don't allow drag when maximized
  
  // Prevent default to avoid text selection during drag
  event.preventDefault();

  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;
  offsetX.value = event.clientX - chatWindow.value.getBoundingClientRect().left;
  offsetY.value = event.clientY - chatWindow.value.getBoundingClientRect().top;

  document.addEventListener("mousemove", dragChat);
  document.addEventListener("mouseup", stopDrag);
};

const dragChat = (event: MouseEvent | TouchEvent): void => {
  if (!isDragging.value || !chatWindow.value) return;
  
  event.preventDefault();
  
  let clientX: number;
  let clientY: number;
  
  if ('touches' in event) {
    // Touch event
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    // Mouse event
    clientX = event.clientX;
    clientY = event.clientY;
  }

  // Calculate new position
  const x: number = clientX - offsetX.value;
  const y: number = clientY - offsetY.value;
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Get window dimensions
  const windowWidth = chatWindow.value.offsetWidth;
  const windowHeight = chatWindow.value.offsetHeight;
  
  // Ensure the window stays within viewport bounds
  const boundedX = Math.max(0, Math.min(x, viewportWidth - windowWidth));
  const boundedY = Math.max(0, Math.min(y, viewportHeight - windowHeight));

  // Apply transform directly for immediate response
  chatWindow.value.style.transform = `translate3d(${boundedX}px, ${boundedY}px, 0)`;
  chatWindow.value.style.left = '0';
  chatWindow.value.style.top = '0';
  chatWindow.value.style.right = 'auto';
  chatWindow.value.style.bottom = 'auto';
  
  // Update position ref for saving (we'll convert transform to actual position on stopDrag)
  windowPosition.value = {
    left: `${boundedX}px`,
    top: `${boundedY}px`,
    right: null as unknown as string,
    bottom: null as unknown as string
  };
};

const stopDrag = (): void => {
  if (isDragging.value && chatWindow.value) {
    isDragging.value = false;
    
    // Convert transform to actual position
    const transform = chatWindow.value.style.transform;
    const matches = transform.match(/translate3d\(([^,]+),\s*([^,]+),\s*[^)]+\)/);
    
    if (matches && matches.length >= 3) {
      const x = matches[1];
      const y = matches[2];
      
      // Apply the final position
      chatWindow.value.style.transform = 'none';
      chatWindow.value.style.left = x;
      chatWindow.value.style.top = y;
      chatWindow.value.style.right = 'auto';
      chatWindow.value.style.bottom = 'auto';
      
      // Update position ref
      windowPosition.value = {
        left: x,
        top: y,
        right: null as unknown as string,
        bottom: null as unknown as string
      };
      
      // Save the new position
      saveWindowPosition();
    }
    
    // Remove event listeners
    document.removeEventListener("mousemove", dragChat);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", dragChat);
    document.removeEventListener("touchend", stopDrag);
  }
};

// ✅ Touch event handlers for chat window
const handleWindowTouchStart = (event: TouchEvent): void => {
  if (!chatWindow.value || event.touches.length !== 1 || isMaximized.value) return;
  
  // Don't start drag if we're touching inside the input area
  if ((event.target as HTMLElement).closest('.input-area') || 
      (event.target as HTMLElement).closest('.chat-input')) {
    return;
  }
  
  isDragging.value = true;
  const touch = event.touches[0];
  startX.value = touch.clientX;
  startY.value = touch.clientY;
  offsetX.value = touch.clientX - chatWindow.value.getBoundingClientRect().left;
  offsetY.value = touch.clientY - chatWindow.value.getBoundingClientRect().top;
  
  document.addEventListener("touchmove", dragChat, { passive: false });
  document.addEventListener("touchend", stopDrag);
};

// ✅ Touch support for resize handle
const handleResizeTouchStart = (event: TouchEvent): void => {
  if (!chatWindow.value || event.touches.length !== 1 || isMaximized.value) return;
  
  event.preventDefault();
  isResizing.value = true;
  const touch = event.touches[0];
  startX.value = touch.clientX;
  startY.value = touch.clientY;
  startWidth.value = chatWindow.value.offsetWidth;
  startHeight.value = chatWindow.value.offsetHeight;
  
  document.addEventListener("touchmove", resizeTouchMove, { passive: false });
  document.addEventListener("touchend", stopResize);
};

const resizeTouchMove = (event: TouchEvent): void => {
  if (!isResizing.value || !chatWindow.value) return;
  
  event.preventDefault();
  const touch = event.touches[0];
  
  // Calculate width and height changes
  const deltaX: number = touch.clientX - startX.value;
  const deltaY: number = touch.clientY - startY.value;
  
  // Calculate new dimensions
  const newWidth: number = Math.max(300, startWidth.value + deltaX);
  const newHeight: number = Math.max(300, startHeight.value + deltaY);
  
  // Apply new dimensions directly for immediate response
  chatWindow.value.style.width = `${newWidth}px`;
  chatWindow.value.style.height = `${newHeight}px`;
  
  // Update the previous window state with new dimensions
  previousWindowState.value.width = chatWindow.value.style.width;
  previousWindowState.value.height = chatWindow.value.style.height;
};

// ✅ Make chat icon draggable (Mouse events)
const startIconDrag = (event: MouseEvent): void => {
  // Prevent default to avoid text selection during drag
  event.preventDefault();
  
  if (!chatToggle.value) return;
  
  // Reset the moved flag
  hasMoved.value = false;
  
  isIconDragging.value = true;
  iconStartX.value = event.clientX;
  iconStartY.value = event.clientY;
  iconOffsetX.value = event.clientX - chatToggle.value.getBoundingClientRect().left;
  iconOffsetY.value = event.clientY - chatToggle.value.getBoundingClientRect().top;
  
  document.addEventListener("mousemove", dragIcon);
  document.addEventListener("mouseup", stopIconDrag);
};

const dragIcon = (event: MouseEvent | TouchEvent): void => {
  if (!isIconDragging.value || !chatToggle.value) return;
  
  event.preventDefault();
  
  // Mark that we've moved
  hasMoved.value = true;
  
  let clientX: number;
  let clientY: number;
  
  if ('touches' in event) {
    // Touch event
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    // Mouse event
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  // Calculate new position
  const x: number = clientX - iconOffsetX.value;
  const y: number = clientY - iconOffsetY.value;
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Get icon dimensions
  const iconWidth = chatToggle.value.offsetWidth;
  const iconHeight = chatToggle.value.offsetHeight;
  
  // Ensure the icon stays within viewport bounds
  const boundedX = Math.max(0, Math.min(x, viewportWidth - iconWidth));
  const boundedY = Math.max(0, Math.min(y, viewportHeight - iconHeight));
  
  // Update position directly
  chatToggle.value.style.left = `${boundedX}px`;
  chatToggle.value.style.top = `${boundedY}px`;
  chatToggle.value.style.right = 'auto';
  chatToggle.value.style.bottom = 'auto';
  
  // Update position ref for saving
  iconPosition.value = {
    left: `${boundedX}px`,
    top: `${boundedY}px`,
    right: null,
    bottom: null
  };
};

const stopIconDrag = (event: MouseEvent | TouchEvent): void => {
  if (isIconDragging.value) {
    isIconDragging.value = false;
    
    // If we haven't moved, treat it as a click
    if (!hasMoved.value) {
      toggleChat();
    }
    
    // Save the new position
    saveIconPosition();
    
    // Remove event listeners
    document.removeEventListener("mousemove", dragIcon);
    document.removeEventListener("mouseup", stopIconDrag);
    document.removeEventListener("touchmove", dragIcon);
    document.removeEventListener("touchend", stopIconDrag);
  }
};

// ✅ Touch event handlers for mobile
const handleTouchStart = (event: TouchEvent): void => {
  if (!chatToggle.value || event.touches.length !== 1) return;
  
  const now = new Date().getTime();
  const timeSinceLastTap = now - lastTapTime.value;
  
  // Detect double tap (300ms threshold)
  if (timeSinceLastTap < 300) {
    // Double tap detected, toggle chat
    toggleChat();
    event.preventDefault();
    return;
  }
  
  lastTapTime.value = now;
  
  // Reset the moved flag
  hasMoved.value = false;
  
  // Start tracking for potential drag
  isIconDragging.value = true;
  const touch = event.touches[0];
  iconStartX.value = touch.clientX;
  iconStartY.value = touch.clientY;
  iconOffsetX.value = touch.clientX - chatToggle.value.getBoundingClientRect().left;
  iconOffsetY.value = touch.clientY - chatToggle.value.getBoundingClientRect().top;
  
  document.addEventListener("touchmove", dragIcon, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
};

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
    if (chatInput.value) {
      chatInput.value.focus();
      
      // Place cursor at the end of any existing text
      if (chatInput.value.innerText.length > 0) {
        const selection = window.getSelection();
        const range = document.createRange();
        
        range.selectNodeContents(chatInput.value);
        range.collapse(false); // Collapse to end
        
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } else {
      // Fallback if ref isn't available yet
      setTimeout(() => {
        const inputElement = document.querySelector<HTMLElement>(".chat-input");
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  });
};

// ✅ Cleanup event listeners on unmount
onUnmounted(() => {
  document.removeEventListener("mousemove", dragChat);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("mousemove", resizeChat);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("mousemove", dragIcon);
  document.removeEventListener("mouseup", stopIconDrag);
  document.removeEventListener("touchmove", dragIcon);
  document.removeEventListener("touchend", stopIconDrag);
  document.removeEventListener("touchmove", dragChat);
  document.removeEventListener("touchend", stopDrag);
  document.removeEventListener("touchmove", resizeTouchMove);
  document.removeEventListener("touchend", stopResize);
  document.removeEventListener("keydown", handleKeyDown);
});

// Handle touch end for the chat icon
const handleTouchEnd = (event: TouchEvent): void => {
  if (!isIconDragging.value) return;
  
  isIconDragging.value = false;
  
  // If we haven't moved much, treat it as a tap
  if (!hasMoved.value) {
    toggleChat();
  }
  
  // Reset the moved flag
  hasMoved.value = false;
  
  // Save the new position
  saveIconPosition();
  
  // Remove event listeners
  document.removeEventListener("touchmove", dragIcon);
  document.removeEventListener("touchend", handleTouchEnd);
};
</script>

<template>
  <!-- ✅ Floating Chat Button (hidden when chat is maximized) -->
  <div
    v-if="!isMaximized || !showChat"
    ref="chatToggle"
    class="chat-toggle"
    :class="{ 'hover-scale': isHovering, pulse: !showChat && !isAnimating }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @mousedown.stop="startIconDrag"
    @touchstart="handleTouchStart"
  >
    <transition name="rotate-icon">
      <ChatBubbleOvalLeftEllipsisIcon v-if="!showChat" class="icon" />
      <XMarkIcon v-else class="icon" />
    </transition>
    
    <!-- Tooltip -->
    <div class="tooltip" :class="{ 'visible': isHovering }">
      <span class="tooltip-text">{{ showChat ? 'Close' : 'Open your AI Assistant' }}</span>
      <span class="tooltip-hotkey">Hotkey: <span class="key">{{ showChat ? 'ESC' : 'C' }}</span></span>
    </div>
  </div>

  <!-- ✅ Chat Window -->
  <transition name="slide-fade">
    <div 
      v-if="showChat" 
      ref="chatWindow" 
      class="chat-window" 
      :class="{ 'maximized': isMaximized }"
      @mousedown.self="startDrag"
      @touchstart.self="handleWindowTouchStart"
    >
      <div 
        class="chat-header" 
        @mousedown="startDrag"
        @touchstart="handleWindowTouchStart"
      >
        <span>Cosmicrafts AI</span>
        <div class="header-controls">
          <!-- Maximize/Restore Button -->
          <button class="control-button maximize-button" @click.stop="toggleMaximize">
            <svg v-if="!isMaximized" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <!-- Close Button -->
          <div class="close-button-wrapper">
            <XMarkIcon class="close-icon" @click="toggleChat" />
            <div class="tooltip close-tooltip">
              <span class="tooltip-text">Close</span>
              <span class="tooltip-hotkey">Hotkey: <span class="key">ESC</span></span>
            </div>
          </div>
        </div>
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
        @select="(emoji) => { insertEmoji(emoji); showEmojiPicker = false }"
        @close="showEmojiPicker = false"
      />
      
      <!-- Resize Handle (only visible when not maximized) -->
      <div 
        v-if="!isMaximized" 
        class="resize-handle" 
        @mousedown.stop="startResize"
        @touchstart.stop="handleResizeTouchStart"
      ></div>
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
  height: 2.5rem;
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
  touch-action: none; /* Prevents default touch actions */
  user-select: none; /* Prevents text selection during drag */
}

.chat-toggle .icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
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
  touch-action: none; /* Prevents default touch actions */
  user-select: none; /* Prevents text selection during drag */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease-out;
  will-change: transform; /* Optimize for animations */
}

/* Maximized state */
.chat-window.maximized {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  top: 0 !important;
  left: 0 !important;
  right: auto !important;
  bottom: auto !important;
  border-radius: 0 !important;
  border: none;
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
  cursor: move; /* Indicates draggable area */
}

/* Header Controls Container */
.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Control Buttons (Maximize/Restore) */
.control-button {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.maximize-button {
  width: 2rem;
  height: 1.5rem;
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

/* ✅ Resize Handle */
.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  cursor: nwse-resize;
  background: transparent;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  overflow: hidden;
}

.resize-handle::before {
  content: '';
  width: 14px;
  height: 14px;
  margin: 0 2px 2px 0;
  background-image: 
    linear-gradient(to bottom right,
      transparent 0%,
      transparent 40%,
      rgba(59, 130, 246, 0.6) 40%,
      rgba(59, 130, 246, 0.6) 50%,
      transparent 50%,
      transparent 65%,
      rgba(59, 130, 246, 0.6) 65%,
      rgba(59, 130, 246, 0.6) 75%,
      transparent 75%,
      transparent 90%,
      rgba(59, 130, 246, 0.6) 90%,
      rgba(59, 130, 246, 0.6) 100%
    );
  border-radius: 0 0 4px 0;
  transition: opacity 0.2s ease;
}

.resize-handle:hover::before {
  opacity: 1;
  background-image: 
    linear-gradient(to bottom right,
      transparent 0%,
      transparent 40%,
      rgba(59, 130, 246, 0.9) 40%,
      rgba(59, 130, 246, 0.9) 50%,
      transparent 50%,
      transparent 65%,
      rgba(59, 130, 246, 0.9) 65%,
      rgba(59, 130, 246, 0.9) 75%,
      transparent 75%,
      transparent 90%,
      rgba(59, 130, 246, 0.9) 90%,
      rgba(59, 130, 246, 0.9) 100%
    );
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
  touch-action: auto; /* Allow normal touch behavior in messages */
  user-select: text; /* Allow text selection in messages */
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
  touch-action: auto; /* Allow normal touch behavior in input area */
  user-select: text; /* Allow text selection in input area */
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
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle outline when not focused */
  outline: none;
  overflow-y: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  border-radius: 5px;
  touch-action: auto; /* Allow normal touch behavior */
  user-select: text; /* Allow text selection */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
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

/* ✅ Tooltip */
.tooltip {
  position: absolute;
  top: -70px;
  right: 0;
  background: rgba(30, 43, 56, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
}

.tooltip::after {
  content: '';
  position: absolute;
  bottom: -5px;
  right: 10px;
  width: 10px;
  height: 10px;
  background: rgba(30, 43, 56, 0.95);
  transform: rotate(45deg);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip.visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s; /* Show after 0.5s hover */
}

.tooltip-text {
  margin-bottom: 4px;
  color: white;
}

.tooltip-hotkey {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.tooltip-hotkey .key {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 2px;
  color: white;
  font-weight: bold;
}

/* ✅ Close Button Tooltip */
.close-tooltip {
  top: 40px;
  right: 0;
}

.close-tooltip::after {
  top: -5px;
  bottom: auto;
  border-top: none;
  border-left: none;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-button-wrapper {
  position: relative;
  display: inline-block;
}

.close-button-wrapper:hover .close-tooltip {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s;
}

/* ✅ New animations for chat window */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Add a subtle shadow animation */
.chat-window {
  transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>