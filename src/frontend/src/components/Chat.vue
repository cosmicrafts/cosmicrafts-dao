<script setup lang="ts">
import { FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import { ref, nextTick, onMounted, onUnmounted, watch, computed, shallowRef } from "vue";

import EmojiPicker from './EmojiPicker.vue';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore, languages } from '../stores/language';

// Use fixed API key instead of env variable to reduce lookup overhead
const API_BASE_URL = 'https://openrouter.ai/api/v1';
const API_KEY = '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';

// Reactive state - use shallowRef for complex objects to improve performance
const showChat = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const isAnimating = ref<boolean>(false);
const messages = shallowRef<Array<{ role: string; content: string }>>([]);
const prompt = ref<string>("");
const loading = ref<boolean>(false);
const currentMessage = ref<string>("");
const isThinking = ref<boolean>(false);
const thinkingContent = ref<string>("");

// DOM refs
const chatWindow = ref<HTMLElement | null>(null);
const chatToggle = ref<HTMLElement | null>(null);
const isDragging = ref<boolean>(false);
const isResizing = ref<boolean>(false);
const startX = ref<number>(0);
const startY = ref<number>(0);
const startWidth = ref<number>(0);
const startHeight = ref<number>(0);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);
const isIconDragging = ref<boolean>(false);
const iconStartX = ref<number>(0);
const iconStartY = ref<number>(0);
const iconOffsetX = ref<number>(0);
const iconOffsetY = ref<number>(0);
const lastTapTime = ref<number>(0);
const isMaximized = ref<boolean>(false);
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
  bottom: '4rem',
  right: '1rem',
  top: null
});
const windowPosition = ref<{ left: string; bottom: string | null; right: string | null; top: string | null }>({
  left: 'auto',
  bottom: '6rem',
  right: '1rem',
  top: null
});

// Virtual scrolling implementation
const VISIBLE_MESSAGES = 10; // Number of messages to render at once
const startIndex = ref<number>(0);
const visibleMessages = computed(() => {
  const start = Math.max(0, messages.value.length - VISIBLE_MESSAGES - startIndex.value);
  const end = messages.value.length - startIndex.value;
  return messages.value.slice(start, end);
});
const canLoadMore = computed(() => messages.value.length > VISIBLE_MESSAGES + startIndex.value);

const authStore = useAuthStore();
const languageStore = useLanguageStore();
const MAX_HISTORY_TOKENS = 800; // Reduced from 1000 for better performance
const showEmojiPicker = ref<boolean>(false);
const chatInput = ref<HTMLElement | null>(null);

// Track if we've moved during touch
const hasMoved = ref<boolean>(false);
const lastHeaderTapTime = ref<number>(0);

// Expose the chat's visibility state to parent components
const isOpen = computed(() => showChat.value);

// Add a new ref for storing the input text
const savedInputText = ref<string>("");

// Debounced save function to reduce localStorage writes
let saveTimeout: number | null = null;
const debouncedSave = (data: any, key: string) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = window.setTimeout(() => {
    localStorage.setItem(key, JSON.stringify(data));
  }, 500);
};

// Load saved position from localStorage with validation
const loadIconPosition = (): void => {
  try {
    const savedPosition = localStorage.getItem('chatIconPosition');
    if (savedPosition) {
      iconPosition.value = JSON.parse(savedPosition);
    }
  } catch (error) {
    console.error('Error parsing saved chat icon position', error);
    resetIconPosition();
  }
};

// Reset icon to a safe default position
const resetIconPosition = (): void => {
  iconPosition.value = {
    left: 'auto',
    bottom: '4rem',
    right: '1rem',
    top: null
  };
  debouncedSave(iconPosition.value, 'chatIconPosition');
};

// Check if the icon is within visible bounds and fix if needed
const checkIconVisibility = (): void => {
  if (!chatToggle.value) return;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const iconRect = chatToggle.value.getBoundingClientRect();
  
  // Check if the icon is partially or fully off-screen
  const isOffScreenX = iconRect.left < 0 || iconRect.right > viewportWidth;
  const isOffScreenY = iconRect.top < 0 || iconRect.bottom > viewportHeight;
  
  if (isOffScreenX || isOffScreenY) {
    resetIconPosition();
    
    // Apply the reset position to the element
    nextTick(() => {
      if (chatToggle.value) {
        Object.entries(iconPosition.value).forEach(([key, value]) => {
          if (value !== null && chatToggle.value) {
            (chatToggle.value.style as any)[key] = value;
          }
        });
      }
    });
  }
};

// Save position to localStorage with debounce
const saveIconPosition = (): void => {
  debouncedSave(iconPosition.value, 'chatIconPosition');
};

// Load saved window position from localStorage
const loadWindowPosition = (): void => {
  try {
    const savedPosition = localStorage.getItem('chatWindowPosition');
    if (savedPosition) {
      windowPosition.value = JSON.parse(savedPosition);
    }
  } catch (error) {
    console.error('Error parsing saved window position', error);
  }
};

// Save window position to localStorage with debounce
const saveWindowPosition = (): void => {
  debouncedSave(windowPosition.value, 'chatWindowPosition');
};

// Optimized memory injection function
const injectMemory = async (userId: string, newMessage: string) => {
  // Prune chat history before injecting it
  pruneChatHistory(); 

  // Retrieve only the last 3 messages for shorter context (reduced from 5)
  const conversationHistory = messages.value.slice(-3);
  let historyLog = conversationHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  // Simplified Prompt Structure
  return `
  [SYSTEM]
  You are a helpful AI assistant for Cosmicrafts game. Keep answers short and concise.
  Language: ${languages.find(lang => lang.code === ((authStore.player as any)?.language || "en"))?.label || "English"}

  [USER]
  Username: ${(authStore.player as any)?.username || "guest"}
  Level: ${(authStore.player as any)?.level || 1}
  Faction: ${(authStore.player as any)?.faction || "Unknown"}

  [CHAT HISTORY]
  ${historyLog}

  [NEW MESSAGE]
  ${newMessage}
  `;
};

// Optimized chat history saving with debounce
const saveChatHistory = () => {
  debouncedSave(messages.value, 'chatHistory');
};

const loadChatHistory = () => {
  try {
    const storedChat = localStorage.getItem("chatHistory");
    if (storedChat) {
      messages.value = JSON.parse(storedChat);
    }
  } catch (error) {
    console.error('Error loading chat history', error);
    messages.value = [];
  }
};

// Optimized event listeners with passive option for touch events
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
      
      // After applying the position, check if it's visible
      requestAnimationFrame(() => {
        checkIconVisibility();
      });
    }
  });
  
  // Add global event listeners with passive option where possible
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', checkIconVisibility, { passive: true });
});

// Handle keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent): void => {
  // Check if the active element is an input or textarea to avoid interfering with typing
  const activeElement = document.activeElement;
  const isInputActive = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement ||
                        activeElement?.getAttribute('contenteditable') === 'true';
  
  // 'A' key to open chat (only when not already open and not typing in an input)
  if (event.key.toLowerCase() === 'a' && !showChat.value && !isInputActive) {
    toggleChat();
    event.preventDefault();
  }
  
  // 'ESC' key to close chat or emoji picker (close emoji picker first if it's open)
  if (event.key === 'Escape') {
    if (showEmojiPicker.value) {
      showEmojiPicker.value = false;
      event.preventDefault();
    } else if (showChat.value) {
      toggleChat();
      event.preventDefault();
    }
  }
};

// Optimize watch by using deep: false where possible
watch(messages, () => {
  saveChatHistory();
}, { deep: false });

// Focus input whenever chat is opened
watch(showChat, (newValue) => {
  if (newValue) {
    // Chat was opened, focus the input and scroll to latest message
    nextTick(() => {
      focusInput();
      scrollToBottom();
    });
  }
});

// Optimized pruning function
const pruneChatHistory = () => {
  if (messages.value.length <= 5) return; // Don't prune if we have 5 or fewer messages
  
  let totalTokens = 0;
  let prunedMessages = [];

  // Keep latest messages until reaching the max token limit
  for (let i = messages.value.length - 1; i >= 0; i--) {
    const msg = messages.value[i];
    const msgTokens = msg.content.length / 4; // Approximate token count

    if (totalTokens + msgTokens > MAX_HISTORY_TOKENS) break;

    prunedMessages.unshift(msg);
    totalTokens += msgTokens;
  }

  messages.value = prunedMessages;
};

// Optimized send message function
const sendPrompt = async (): Promise<void> => {
  if (!prompt.value.trim() || loading.value) return;

  const userMessage: string = prompt.value.trim();
  messages.value = [...messages.value, { role: "user", content: userMessage }];
  
  // Clear input field and saved text after sending
  if (chatInput.value) {
    chatInput.value.innerText = "";
  }
  prompt.value = "";
  savedInputText.value = "";

  await nextTick();
  focusInput();

  try {
    loading.value = true;
    currentMessage.value = "";
    thinkingContent.value = "";

    // Fetch structured memory & inject it
    const userId = (authStore.player as any)?.username || "guest";
    const tempPrompt = await injectMemory(userId, userMessage);

    // Create the messages array for OpenAI format with proper typing
    const chatMessages = [
      { role: "system", content: "You are a helpful AI assistant for the Cosmicrafts game. Keep answers short and concise." },
      { role: "user", content: tempPrompt }
    ];

    // Use OpenRouter API directly
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://openrouter.ai/docs',
        'X-Title': '@cosmicrafts/chat'
      },
      body: JSON.stringify({
        model: "rekaai/reka-flash-3:free",
        messages: chatMessages,
        temperature: 0.7,
        top_p: 0.7,
        max_tokens: 500,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to read response stream");

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      try {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            // Strip "data: " prefix
            const cleanLine = line.replace(/^data: /, '');
            
            // Skip processing messages
            if (cleanLine.startsWith(': OPENROUTER')) {
              continue;
            }
            
            // Skip empty lines or [DONE]
            if (!cleanLine || cleanLine === '[DONE]') continue;
            
            const json = JSON.parse(cleanLine);
            const content = json.choices?.[0]?.delta?.content || '';
            
            if (content) {
              if (content.includes('</reasoning>')) {
                // Split the content at </reasoning>
                const parts = content.split('</reasoning>');
                // Add the first part to thinking content
                thinkingContent.value += parts[0];
                
                // Format the complete thinking content plus the actual response
                const actualResponse = parts.slice(1).join('').trim();
                currentMessage.value = `<div class="thinking-content">
                  <div class="thinking-label">Reasoning:</div>
                  <span class="thinking-text">${thinkingContent.value}</span>
                </div>${actualResponse}`;
                
                isThinking.value = false;
              } else {
                // Always add to thinking content and show formatted until we see </reasoning>
                thinkingContent.value += content;
                currentMessage.value = `<div class="thinking-content">
                  <div class="thinking-label">Reasoning:</div>
                  <span class="thinking-text">${thinkingContent.value}</span>
                </div>`;
              }
            }
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        }
        
        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      } catch (error) {
        console.error("Decoding error:", error);
      }
    }

    // Store the complete message with reasoning tags
    const completeMessage = thinkingContent.value ? 
      `<reasoning>${thinkingContent.value}</reasoning>${currentMessage.value}` :
      currentMessage.value;
    
    messages.value = [...messages.value, {
      role: "assistant",
      content: completeMessage,
    }];

    currentMessage.value = "";
    thinkingContent.value = "";
    isThinking.value = false;

  } catch (error) {
    console.error("Chat error:", error);
    messages.value = [...messages.value, { role: "assistant", content: "Error: Failed to get response" }];
  } finally {
    loading.value = false;
    saveChatHistory();
    requestAnimationFrame(() => {
      scrollToBottom();
      focusInput();
    });
  }
};

// Optimized scroll function using requestAnimationFrame
const scrollToBottom = (): void => {
  requestAnimationFrame(() => {
    const chatMessages: HTMLElement | null = document.querySelector(".messages");
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
};

// Optimized toggle chat function
const toggleChat = (): void => {
  isAnimating.value = true;
  
  // Save input text when closing chat
  if (showChat.value) {
    savedInputText.value = prompt.value;
  }
  
  showChat.value = !showChat.value;
  
  // Restore input text when opening chat
  if (showChat.value && savedInputText.value) {
    nextTick(() => {
      if (chatInput.value) {
        chatInput.value.innerText = savedInputText.value;
        prompt.value = savedInputText.value;
      }
    });
  }
  
  setTimeout(() => (isAnimating.value = false), 300);
};

// Toggle maximize/restore chat window
const toggleMaximize = (): void => {
  if (!chatWindow.value) return;
  
  // Add transition class for smooth animation
  chatWindow.value.classList.add('size-transition');
  
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
  
  // Remove transition class after animation completes
  setTimeout(() => {
    if (chatWindow.value) {
      chatWindow.value.classList.remove('size-transition');
    }
  }, 300);
  
  // Scroll to bottom after resize
  requestAnimationFrame(() => {
    scrollToBottom();
  });
};

// Make chat resizable from edges/corners
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

// Make chat draggable
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

// Touch event handlers for chat window
const handleWindowTouchStart = (event: TouchEvent): void => {
  if (!chatWindow.value || event.touches.length !== 1 || isMaximized.value && (event.target as HTMLElement).closest('.resize-handle')) return;
  
  // Check for double tap on header
  if ((event.target as HTMLElement).closest('.chat-header')) {
    const now = new Date().getTime();
    const timeSinceLastTap = now - lastHeaderTapTime.value;
    
    // Detect double tap (300ms threshold)
    if (timeSinceLastTap < 300) {
      // Double tap detected, toggle maximize
      toggleMaximize();
      event.preventDefault();
      return;
    }
    
    lastHeaderTapTime.value = now;
  }
  
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

// Touch support for resize handle
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

// Make chat icon draggable (Mouse events)
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
  
  // Calculate positions as percentages of viewport
  const leftPercentage = (boundedX / viewportWidth) * 100;
  const topPercentage = (boundedY / viewportHeight) * 100;
  const rightPercentage = ((viewportWidth - boundedX - iconWidth) / viewportWidth) * 100;
  const bottomPercentage = ((viewportHeight - boundedY - iconHeight) / viewportHeight) * 100;
  
  // Determine if we should use left/right and top/bottom based on which half of the screen we're on
  if (boundedX < viewportWidth / 2) {
    // Left half of screen - use left
    chatToggle.value.style.left = `${leftPercentage}%`;
    chatToggle.value.style.right = 'auto';
    iconPosition.value.left = `${leftPercentage}%`;
    iconPosition.value.right = null;
  } else {
    // Right half of screen - use right
    chatToggle.value.style.right = `${rightPercentage}%`;
    chatToggle.value.style.left = 'auto';
    iconPosition.value.right = `${rightPercentage}%`;
    iconPosition.value.left = 'auto';
  }
  
  if (boundedY < viewportHeight / 2) {
    // Top half of screen - use top
    chatToggle.value.style.top = `${topPercentage}%`;
    chatToggle.value.style.bottom = 'auto';
    iconPosition.value.top = `${topPercentage}%`;
    iconPosition.value.bottom = null;
  } else {
    // Bottom half of screen - use bottom
    chatToggle.value.style.bottom = `${bottomPercentage}%`;
    chatToggle.value.style.top = 'auto';
    iconPosition.value.bottom = `${bottomPercentage}%`;
    iconPosition.value.top = null;
  }
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

// Touch event handlers for mobile
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

// Optimized loadMoreMessages function for virtual scrolling
const loadMoreMessages = () => {
  startIndex.value += 5;
  if (startIndex.value > messages.value.length - VISIBLE_MESSAGES) {
    startIndex.value = messages.value.length - VISIBLE_MESSAGES;
  }
};

// Optimized clearChat function
const clearChat = () => {
  messages.value = [];
  localStorage.removeItem('chatHistory'); // Direct removal instead of saving empty array
};

// Add intersection observer for lazy loading
onMounted(() => {
  // Set up intersection observer for lazy loading images/content
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyElement = entry.target as HTMLElement;
        if (lazyElement.dataset.src) {
          lazyElement.setAttribute('src', lazyElement.dataset.src);
          lazyElement.removeAttribute('data-src');
        }
        observer.unobserve(lazyElement);
      }
    });
  }, { rootMargin: '100px' });
  
  // Observe all elements with data-src attribute
  document.querySelectorAll('[data-src]').forEach(el => {
    observer.observe(el);
  });
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

// Set the initial emoji picker position based on button position
const setEmojiPickerInitialPosition = () => {
  // This function will be called when the emoji picker is shown
  // The EmojiPicker component now handles its own positioning with draggable functionality
  // Just ensure any dialogs/elements are not covering it
  nextTick(() => {
    // This happens after the EmojiPicker is rendered
    // The position is now handled internally by the EmojiPicker component
  });
};

// ✅ Focus Input
const focusInput = (): void => {
  if (!chatInput.value) return;
  
  chatInput.value.focus();
  
  // Place cursor at the end
  const range = document.createRange();
  const sel = window.getSelection();
  
  range.selectNodeContents(chatInput.value);
  range.collapse(false); // false means collapse to end
  
  sel?.removeAllRanges();
  sel?.addRange(range);
};

// Watch for emoji picker changes
watch(showEmojiPicker, (newValue) => {
  if (newValue) {
    // When emoji picker is shown, set its initial position
    setEmojiPickerInitialPosition();
  }
});

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
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener('resize', checkIconVisibility);
});

// ✅ Handle click outside the chat window to close it
const handleClickOutside = (event: MouseEvent): void => {
  if (showChat.value && chatWindow.value && !chatWindow.value.contains(event.target as Node)) {
    // Check if the click is on the chat toggle button (which should toggle, not close)
    if (chatToggle.value && chatToggle.value.contains(event.target as Node)) {
      return;
    }
    
    // Close chat if clicking outside
    toggleChat();
  }
  
  // Also handle closing emoji picker when clicking outside
  if (showEmojiPicker.value) {
    // The emoji picker already has @click.stop on it, so if we get here,
    // we're clicking outside of it. However, don't close if clicking the emoji button.
    const emojiButton = document.querySelector('.emoji-button');
    if (emojiButton && !emojiButton.contains(event.target as Node)) {
      showEmojiPicker.value = false;
    }
  }
};

// Make isOpen available to parent components through the template ref
defineExpose({
  isOpen,
  toggleChat
});
</script>

<template>
  <!-- Floating Chat Button (hidden when chat is maximized) -->
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
      <i v-if="!showChat" class="fas fa-robot icon"></i>
      <XMarkIcon v-else class="icon" />
    </transition>
    
    <!-- Tooltip -->
    <div class="tooltip" :class="{ 'visible': isHovering }">
      <span class="tooltip-text">{{ showChat ? 'Close' : 'Open your AI Assistant' }}</span>
      <span class="tooltip-hotkey">Hotkey: <span class="key">{{ showChat ? 'ESC' : 'A' }}</span></span>
      <span class="tooltip-hint">Drag to reposition</span>
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
        @dblclick="toggleMaximize"
      >
        <span>Cosmicrafts AI</span>
        <div class="header-controls">
          <!-- Maximize/Restore Button -->
          <div class="control-wrapper">
            <button class="control-button" @click.stop="toggleMaximize">
              <svg v-if="!isMaximized" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <div class="tooltip control-tooltip">
              <span class="tooltip-text">{{ isMaximized ? 'Restore' : 'Maximize' }}</span>
              <span class="tooltip-hint">Double-click header to {{ isMaximized ? 'restore' : 'maximize' }}</span>
            </div>
          </div>
          <!-- Close Button -->
          <div class="control-wrapper">
            <button class="control-button" @click.stop="toggleChat">
              <XMarkIcon class="control-icon" />
            </button>
            <div class="tooltip control-tooltip">
              <span class="tooltip-text">Close</span>
              <span class="tooltip-hotkey">Hotkey: <span class="key">ESC</span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="messages">
        <button 
          v-if="canLoadMore" 
          class="load-more-btn"
          @click="loadMoreMessages"
        >
          Load More
        </button>
        
        <div
          v-for="(msg, index) in visibleMessages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="bubble">
            <template v-if="msg.content.includes('<reasoning>')">
              <div class="thinking-content">
                <div class="thinking-label">Reasoning:</div>
                <span class="thinking-text">{{ msg.content.match(/<reasoning>(.*?)<\/reasoning>/s)?.[1] || '' }}</span>
              </div>
              <span class="message-text">{{ msg.content.split('</reasoning>')[1] || msg.content }}</span>
            </template>
            <span v-else class="message-text">{{ msg.content }}</span>
          </div>
        </div>

        <div v-if="currentMessage" class="message assistant">
          <div class="bubble" v-html="currentMessage"></div>
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
        <div class="emoji-button-wrapper">
          <button class="emoji-button" @click.stop="showEmojiPicker = !showEmojiPicker">
        <FaceSmileIcon class="icon" />
      </button>
        </div>
        <button class="send-icon" @click="sendPrompt" :disabled="loading">
            <PaperAirplaneIcon class="icon" />
        </button>
        </div>
      
      <!-- Add Clear Chat Button -->
      <div class="clear-chat-container">
        <button class="clear-chat-button" @click="clearChat">
          Clear Chat History
        </button>
      </div>
      
      <!-- Resize Handle (only visible when not maximized) -->
      <div 
        v-if="!isMaximized" 
        class="resize-handle" 
        @mousedown.stop="startResize"
        @touchstart.stop="handleResizeTouchStart"
      ></div>
    </div>
  </transition>
  
  <!-- Teleport EmojiPicker to body -->
  <Teleport to="body">
        <EmojiPicker
        v-if="showEmojiPicker"
        :show="showEmojiPicker"
      @select="(emoji) => { insertEmoji(emoji); showEmojiPicker = false }"
        @close="showEmojiPicker = false"
        />
  </Teleport>
</template>

<style scoped>
/* ✅ Floating Chat Button */
.chat-toggle {
  position: fixed;
  bottom: 4rem; /* Increased from 1.5rem to keep it higher on mobile */
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
  transition: transform 0.3s ease-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 99900;
  touch-action: none; /* Prevents default touch actions */
  user-select: none; /* Prevents text selection during drag */
  will-change: transform; /* Optimize for animations */
}

.chat-toggle .icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.chat-toggle i.icon {
  font-size: 1.25rem; /* Slightly smaller than before */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
}

.hover-scale:hover {
  transform: scale(1.1);
  background-color: rgba(0, 195, 255, 0.862); /* Lighter blue background on hover */
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
  z-index: 99901;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid rgba(126, 126, 126, 0.1);
  touch-action: none; /* Prevents default touch actions */
  user-select: none; /* Prevents text selection during drag */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-out;
  will-change: transform, width, height; /* Optimize for animations */
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

/* Control Buttons */
.control-button {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: transform 0.2s ease, background-color 0.2s ease;
  width: 2.5rem;
  height: 2.5rem;
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
  color: #0099ff;
}

.control-icon {
  width: 20px;
  height: 20px;
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
  contain: content; /* Improve scrolling performance */
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
  contain: content; /* Improve rendering performance */
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
  contain: layout; /* Improve layout performance */
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
  contain: layout; /* Improve layout performance */
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

/* ✅ Dot Flashing Animation - Optimized */
.dot-flashing {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
  animation: dotFlashing 1s infinite linear alternate;
  animation-delay: 0.5s;
  will-change: opacity; /* Optimize animation */
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
  will-change: opacity; /* Optimize animation */
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
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.2;
  }
}

/* ✅ Thinking Text */
.thinking-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* ✅ Scrollbar - Webkit (Chrome, Edge, Safari) */
.messages::-webkit-scrollbar {
  width: 0.5rem; /* Slimmer scrollbar for better performance */
}

.messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1); /* Subtle track */
  border-radius: 24px;
}

.messages::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.8); /* Blue thumb */
  border-radius: 24px;
}

/* ✅ Scrollbar - Firefox */
.messages {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.8) rgba(255, 255, 255, 0.1);
}

/* ✅ Fix: Make emoji button visible */
.emoji-button {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: transform 0.2s ease, background-color 0.2s ease;
  width: 2.5rem;
  height: 2.5rem;
}

.emoji-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
  color: #0099ff;
}

.emoji-button .icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Emoji button wrapper for positioning the picker */
.emoji-button-wrapper {
  position: relative;
  display: inline-block;
}

/* ✅ Send Icon Button */
.send-icon {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: transform 0.2s ease, background-color 0.2s ease;
  width: 2.5rem;
  height: 2.5rem;
}

.send-icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
  color: #0099ff;
}

.send-icon .icon {
  width: 1.5rem;
  height: 1.5rem;
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
  top: -96px;
  right: 0;
  background: rgba(30, 43, 56, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
  will-change: opacity, transform; /* Optimize animations */
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
  transition-delay: 0.75s; /* Show after 0.75s hover */
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

/* ✅ New animations for chat window - Optimized */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Control wrapper for tooltips */
.control-wrapper {
  position: relative;
  display: inline-block;
}

.control-wrapper:hover .control-tooltip {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s;
}

/* Control tooltip */
.control-tooltip {
  position: absolute;
  top: 40px;
  right: 0;
  background: rgba(30, 43, 56, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
  will-change: opacity, transform;
}

.control-tooltip::after {
  content: '';
  position: absolute;
  top: -5px;
  right: 10px;
  width: 10px;
  height: 10px;
  background: rgba(30, 43, 56, 0.95);
  transform: rotate(45deg);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-top: 4px;
}

/* Size transition for maximize/restore */
.size-transition {
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0) !important;
}

.thinking-content {
  border-left: 2px solid #858585;
  padding-left: 1rem;
  margin-bottom: 1rem;
  opacity: 0.65;
  font-weight: 300;
}

.thinking-label {
  color: #858585;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.thinking-text {
  font-style: italic;
  color: #a0a0a0;
  font-weight: 300;
}

/* ✅ Load More Button */
.load-more-btn {
  position: sticky;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(59, 130, 246, 0.2);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.4);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin: 0.5rem 0;
  transition: all 0.2s ease;
  z-index: 1;
}

.load-more-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

/* Add this style to ensure v-html content inherits styles */
.bubble :deep(.thinking-content) {
  border-left: 2px solid #858585;
  padding-left: 1rem;
  margin-bottom: 1rem;
  opacity: 0.65;
  font-weight: 300;
}

.bubble :deep(.thinking-label) {
  color: #858585;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.bubble :deep(.thinking-text) {
  font-style: italic;
  color: #a0a0a0;
  font-weight: 300;
}

/* Clear Chat Button Styles */
.clear-chat-container {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  background: #1e1e1e38;
  border-top: 1px solid rgba(126, 126, 126, 0.1);
}

.clear-chat-button {
  background: rgba(220, 38, 38, 0.2);
  color: #ff9999;
  border: 1px solid rgba(220, 38, 38, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-chat-button:hover {
  background: rgba(220, 38, 38, 0.3);
  border-color: rgba(220, 38, 38, 0.4);
  color: #ffcccc;
}
</style>