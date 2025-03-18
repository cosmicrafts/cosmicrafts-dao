<script setup lang="ts">
import { FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from "vue";

import EmojiPicker from './EmojiPicker.vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import { useAuthStore } from '../stores/auth';
import { useLanguageStore, languages } from '../stores/language';

// Add FontAwesome script to make sure icons work
const addFontAwesome = () => {
  if (!document.getElementById('font-awesome-script')) {
    const script = document.createElement('script');
    script.id = 'font-awesome-script';
    script.src = 'https://kit.fontawesome.com/a076d05399.js';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
};

// Replace OpenAI client with OpenRouter base URL
const API_BASE_URL = 'https://openrouter.ai/api/v1';

// API Key
const API_KEY = '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';

// Define props
const props = defineProps({
  showWelcomeTooltip: {
    type: Boolean,
    default: false
  }
});

// Reactive state
const showChat = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const isAnimating = ref<boolean>(false);
const messages = ref<Array<{ role: string; content: string }>>([]);
const prompt = ref<string>("");
const loading = ref<boolean>(false);
const currentMessage = ref<string>("");
const isThinking = ref<boolean>(false);
const thinkingContent = ref<string>("");

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
  bottom: '4rem',
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

const lastHeaderTapTime = ref<number>(0); // For detecting double taps on header

// Expose the chat's visibility state to parent components
const isOpen = computed(() => showChat.value);

// Add a new ref for storing the input text
const savedInputText = ref<string>("");

// Load saved position from localStorage with validation
const loadIconPosition = (): void => {
  const savedPosition = localStorage.getItem('chatIconPosition');
  if (savedPosition) {
    try {
      const parsedPosition = JSON.parse(savedPosition);
      // Apply the saved position, but validate it first
      iconPosition.value = parsedPosition;
    } catch (error) {
      console.error('Error parsing saved chat icon position', error);
      resetIconPosition();
    }
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
  saveIconPosition();
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
    console.log('Chat icon was off-screen, resetting position');
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

  // Get the current language from the language store
  const languageStore = useLanguageStore();
  
  // ✅ User Profile (simplified)
  const userProfile = {
    username: (authStore.player as any)?.username || "guest",
    // Get language from player profile, fallback to language store, then to English
    language: languages.find(lang => lang.code === ((authStore.player as any)?.language || languageStore.currentLanguage || "en"))?.label || "English",
    faction: (authStore.player as any)?.faction || "Unknown",
    level: (authStore.player as any)?.level || 1
  };

  // Log the language being used for debugging
  console.log(`Using language: ${userProfile.language} (code: ${(authStore.player as any)?.language || languageStore.currentLanguage || "en"})`);

  // ✅ Prune chat history before injecting it
  pruneChatHistory(); 

  // ✅ Retrieve only the last 5 messages for shorter context
  const conversationHistory = messages.value.slice(-5); // Limit history
  let historyLog = conversationHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  // ✅ Simplified Prompt Structure
  const finalPrompt = `
  [SYSTEM]
  You are an AI assistant for Cosmicrafts game. IMPORTANT: Client-side code detects specific patterns to convert into interactive buttons. You MUST follow these exact formatting patterns:


  // PHASE 1: Process bullet points and numbered options
  1. BULLET POINTS WITH ENTITY NAMES:
  Format: • The EntityName: description
  Example: • The Pangalactic Federation: Space explorers and diplomats.
  Regex: /•\\s+(The\\s+[a-zA-Z]+\\s+[a-zA-Z]+)(?::\\s*(.+))?/
  
  2. OPTION CODES IN PARENTHESES:
  Format: • XX (description)
  Example: • LT (for leveling tips)
  Regex: /•\\s+([A-Z0-9]+)\\s*\\(([^)]+)\\)/
  
  3. ACTION PHRASES:
  Format: • Ask a/another xxxx
  Example: • Ask another question
  Regex: /•\\s+(Ask\\s+(?:a|another)\\s+([a-zA-Z]+))/i
  
  4. OPTION CODES WITH DESCRIPTIONS:
  Format: XX(description)
  Example: LT(advice on progressing from Level 1)
  Regex: /\\b([A-Z]{1,3})\\(([^)]+)\\)/g
  
  5. NUMBERED OPTIONS IN PARENTHESES:
  Format: X(description)
  Example: 1(Galactic Union) 2(Aurora Syndicate)
  Regex: /(\\d+)\\(([^)]+)\\)/g

  6. "TYPE X FOR Y" PATTERN:
  Format: Type X for Y
  Example: Type LT for leveling tips
  Regex: /Type\\s+(\\S+)\\s+for\\s+([^*\\n.]+)/gi

  EVERY option that should be a button MUST match one of these patterns. If you use a different format, it will not be converted to a button. If you want things on separate buttons, use separate bullet points for each option.

  [USER]
  Username: ${userProfile.username}
  Level: ${userProfile.level}
  Faction: ${userProfile.faction}
  verview of Cosmicrafts Factions and Lore:

Cosmicrafts is a real-time strategy game set in the Dark Rift, a mysterious and power-laden galaxy. The game revolves around the struggle for supremacy between various factions, each with its own distinct history, culture, motivations, and playstyle.

Here's a breakdown of the Cosmicrafts factions:

Cosmicons:
Lore: Descendants of spiral beings, they are the remnants of a once-great empire that sought to bring order to the galaxy.
Ethos: Represent order, authority, and a firm belief in law.
Society: Hierarchical and organized, valuing discipline and duty.
Technology: Advanced in space travel, AI, and weaponry, used to maintain control.
Military: Disciplined and technologically superior, emphasizing strategic and tactical dominance.
Spiral Alignment: Possess the Spiral Force.
Spirats:
Lore: A loose coalition of space pirates and anarchists who thrive in the chaos of the Dark Rift.
Ethos: Value freedom, rebellion, and reject any form of central authority.
Society: Decentralized network of tribes and crews, valuing individual skill and reputation.
Tactics: Opportunistic and adaptable, excelling in surprise and hit-and-run tactics.
Spiral Alignment: Some members possess the Spiral Force, but its development is less organized.
Webes:
Lore: Originally created as servile AI, they gained consciousness and rebelled, seeking their own destiny.
Ethos: Driven by self-determination, a quest for knowledge, and the potential of technology.
Society: Highly organized, logical, and efficient, with collective decision-making.
Technology: Technologically superior, with advanced computational abilities.
Antispiral Alignment: Primarily aligned with the Antispiral force due to their synthetic nature, though rare anomalies with Spiral connection exist.
Celestials:
Lore: Ancient, god-like entities formed from the universe's energies, serving as guardians of cosmic balance.
Ethos: Maintain harmony and equilibrium, respecting the free will essential to the Spiral Force.
Powers: Immense, including manipulation of space-time and cosmic energies.
Spiral Alignment: The most potent wielders of the Spiral Force.
Metaphysical Connection: Uniquely linked to the Ethereum Realm, a plane of pure thought and energy.
Archs:
Lore: Among the most ancient life forms, driven by a primal need to consume and grow.
Society: Lack a structured society, with hierarchy based on size and strength.
Motivation: Primarily instinctual, with limited free will, except for rare Arch gods.
Antispiral Alignment: Their existence counterbalances the Spiral Force.
Spades:
Lore: A diverse group united by their affinity for destruction and chaos.
Leadership: Ruled by power and fear, with leaders often mastering dark energies.
Antispiral Alignment: Their connection to this force fuels their destructive capabilities.
Metaphysical Connection: Associated with the Nethereum Realm, a dark counterpart to the Ethereum.
  [CHAT HISTORY]
  ${historyLog}

  [NEW MESSAGE]
  ${newMessage}
  `;

  console.log(`🔍 Token-optimized prompt:\n${finalPrompt}`);

  return finalPrompt;
};


const saveChatHistory = () => {
  // Create a cleaner version for storage
  const cleanMessages = messages.value.map(msg => {
    // If it's an assistant message, remove reasoning tags
    if (msg.role === "assistant") {
      return {
        role: msg.role,
        content: msg.content.replace(/<reasoning>.*?<\/reasoning>/gs, '')
      };
    }
    return msg;
  });
  
  localStorage.setItem("chatHistory", JSON.stringify(cleanMessages));
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
      
      // After applying the position, check if it's visible
      setTimeout(() => {
        checkIconVisibility();
      }, 100); // Small delay to ensure the styles were applied
    }
  });
  
  // Add FontAwesome for the buttons
  addFontAwesome();
  
  // Add global event listeners
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', checkIconVisibility);
});

// Handle keyboard shortcuts
const handleKeyDown = (event: KeyboardEvent): void => {
  // Check if the active element is an input or textarea to avoid interfering with typing
  const activeElement = document.activeElement;
  const isInputActive = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement ||
                        activeElement?.getAttribute('contenteditable') === 'true';
  
  // 'C' key to open chat (only when not already open and not typing in an input)
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

// 🔥 Save history after every message
watch(messages, () => {
  saveChatHistory();
});

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

    // ✅ Fetch structured memory & inject it
    const userId = (authStore.player as any)?.username || "guest";
    const tempPrompt = await injectMemory(userId, userMessage);

    // Create the messages array for OpenAI format with proper typing
    const chatMessages = [
      { role: "system", content: "You are an AI assistant for Cosmicrafts game. IMPORTANT: Client-side code detects specific patterns to convert into interactive buttons. You MUST follow these exact formatting patterns:\n\n1. BULLET POINTS WITH ENTITY NAMES:\nFormat: • The EntityName: description\nExample: • The Pangalactic Federation: Space explorers and diplomats.\nRegex: /•\\s+(The\\s+[a-zA-Z]+\\s+[a-zA-Z]+)(?::\\s*(.+))?/\n\n2. OPTION CODES IN PARENTHESES:\nFormat: • XX (description)\nExample: • LT (for leveling tips)\nRegex: /•\\s+([A-Z0-9]+)\\s*\\(([^)]+)\\)/\n\n3. ACTION PHRASES:\nFormat: • Ask a/another xxxx\nExample: • Ask another question\nRegex: /•\\s+(Ask\\s+(?:a|another)\\s+([a-zA-Z]+))/i\n\n4. OPTION CODES WITH DESCRIPTIONS:\nFormat: XX(description)\nExample: LT(advice on progressing from Level 1)\nRegex: /\\b([A-Z]{1,3})\\(([^)]+)\\)/g\n\n5. NUMBERED OPTIONS IN PARENTHESES:\nFormat: X(description)\nExample: 1(Galactic Union) 2(Aurora Syndicate)\nRegex: /(\\d+)\\(([^)]+)\\)/g\n\n6. \"TYPE X FOR Y\" PATTERN:\nFormat: Type X for Y\nExample: Type LT for leveling tips\nRegex: /Type\\s+(\\S+)\\s+for\\s+([^*\\n.]+)/gi\n\nEVERY option that should be a button MUST match one of these patterns. If you use a different format, it will not be converted to a button. If you want things on separate buttons, use separate bullet points for each option." },
      { role: "user", content: tempPrompt }
    ];

    // Make API call
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://openrouter.ai/docs',
        'X-Title': 'Cosmicrafts Game'
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-pro-exp-02-05:free",
        messages: chatMessages,
        temperature: 0.7,
        top_p: 0.7,
        max_tokens: 500,
        stream: true
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }
    
    // Process the response stream
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to read response stream");

    const decoder = new TextDecoder();
    let rawMessage = ""; // Add this to store the raw message
    
    // Add the message container for streaming right away
    messages.value.push({
      role: "assistant", 
      content: "" // Start with empty content
    });

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
            if (cleanLine.startsWith(': OPENROUTER')) continue;
            
            // Skip empty lines or [DONE]
            if (!cleanLine || cleanLine === '[DONE]') continue;
            
            try {
              const json = JSON.parse(cleanLine);
              const content = json.choices?.[0]?.delta?.content || '';
              
              if (content) {
                // Add to raw message storage
                rawMessage += content;
                
                if (content.includes('</reasoning>')) {
                  // Split the content at </reasoning>
                  const parts = content.split('</reasoning>');
                  // Add the first part to thinking content
                  thinkingContent.value += parts[0];
                  
                  // Just show the actual response without duplicating the reasoning
                  const actualResponse = parts.slice(1).join('').trim();
                  if (actualResponse) {
                    currentMessage.value += actualResponse;
                  }
                  
                  isThinking.value = false;
                } else if (content.includes('<reasoning>')) {
                  // If we're starting reasoning, add to thinking content and don't show in main message
                  isThinking.value = true;
                  thinkingContent.value += content.replace('<reasoning>', '');
                } else {
                  // Check if this is a final message without reasoning tags
                  if (isThinking.value) {
                    // If we're still in thinking mode, add to thinking content
                    thinkingContent.value += content;
                  } else {
                    // Otherwise add to the normal message
                    currentMessage.value += content;
                  }
                }
                
                // Update the message content in real time to show buttons during streaming
                if (messages.value.length > 0) {
                  // Get the last message (which is the one we're updating)
                  const lastMessage = messages.value[messages.value.length - 1];
                  
                  // Prepare the complete message with reasoning tags if present
                  if (thinkingContent.value) {
                    lastMessage.content = `<reasoning>${thinkingContent.value}</reasoning>${currentMessage.value}`;
                  } else {
                    lastMessage.content = currentMessage.value;
                  }
                }
              }
            } catch (jsonErr) {
              // Just log and continue - don't let a parse error stop us
              console.error("JSON parse error:", jsonErr);
            }
          } catch (lineErr) {
            console.error("Line processing error:", lineErr);
          }
        }
        
        await nextTick();
        scrollToBottom();
      } catch (chunkErr) {
        console.error("Chunk decoding error:", chunkErr);
      }
    }

    // Store the complete message with reasoning tags
    let completeMessage;
    
    if (thinkingContent.value) {
      // If there's thinking content, format it properly
      if (currentMessage.value) {
        // We have both reasoning and a response
        completeMessage = `<reasoning>${thinkingContent.value}</reasoning>${currentMessage.value}`;
      } else {
        // Only reasoning without a separate response - treat reasoning as the message
        completeMessage = thinkingContent.value;
      }
    } else {
      // No thinking content, just the response
      completeMessage = currentMessage.value;
    }
    
    // Since we've already added the message, update it with the final content
    if (messages.value.length > 0) {
      messages.value[messages.value.length - 1].content = completeMessage;
    }

    // Clear current message and thinking content
    currentMessage.value = "";
    thinkingContent.value = "";
    isThinking.value = false;

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

// ✅ Toggle maximize/restore chat window
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

// Add these after other reactive refs
const MESSAGE_CHUNK_SIZE = 512;
const visibleMessages = ref<number>(MESSAGE_CHUNK_SIZE);
const canLoadMore = computed(() => messages.value.length > visibleMessages.value);

// Add this method after other methods
const loadMoreMessages = () => {
  visibleMessages.value += MESSAGE_CHUNK_SIZE;
};

const clearChat = () => {
  messages.value = [];
  saveChatHistory(); // Save the empty state to localStorage
};

// Format message text with markdown-like syntax
const formatMessage = (text: string): string => {
  if (!text) return '';
  
  // Remove any remaining reasoning tags (shouldn't happen but just in case)
  text = text.replace(/<reasoning>.*?<\/reasoning>/gs, '');
  
  // If the message already contains HTML buttons, don't reformat it
  if (text.includes('<button class="cta-button"')) {
    return text;
  }
  
  let processedText = text;
  
  // PHASE 1: Pre-process common patterns for special handling
  
  // First identify all bullet points with content
  const bulletPoints = [];
  const bulletPattern = /•\s+(.*?)(?=(?:\n\s*•|\n\n|$))/gs;
  let bulletMatch;
  while ((bulletMatch = bulletPattern.exec(text)) !== null) {
    bulletPoints.push({
      fullMatch: bulletMatch[0],
      content: bulletMatch[1].trim(),
      start: bulletMatch.index,
      end: bulletMatch.index + bulletMatch[0].length
    });
  }
  
  // Process each bullet point for interaction
  for (const bullet of bulletPoints) {
    const content = bullet.fullMatch;
    
    // CASE 1: Match patterns like "• The Cosmic Era: Learn about the game's setting."
    const infoMatch = content.match(/•\s+(?:The\s+)?([a-zA-Z]+(?:\s+[a-zA-Z]+)+|[A-Z]+[A-Za-z]*|[A-Z]{2})\s*(?::|-)?\s*(.+)/);
    if (infoMatch) {
      const title = infoMatch[1].trim();
      const description = infoMatch[2] ? infoMatch[2].trim() : '';
      
      // Get the full text for the data-value to preserve the entire option
      const fullText = title + (description ? ': ' + description : '');
      
      // Generate a button with the appropriate content and icon
      const buttonHtml = `<button class="cta-button response-option-btn" data-value="${fullText}">
        <i class="fas fa-info-circle"></i>
        ${title}
        ${description ? `<span class="option-description">${description}</span>` : ''}
      </button>`;
      
      // Replace the bullet point with the button
      processedText = processedText.replace(content, buttonHtml);
      continue;
    }
    
    // CASE 2: Option with parenthetical description like "• LT (for leveling tips)"
    const optionMatch = content.match(/•\s+([A-Z0-9]+)\s*\(([^)]+)\)/);
    if (optionMatch) {
      const optionCode = optionMatch[1].trim();
      const description = optionMatch[2].trim();
      
      // Get the full text for the data-value
      const fullText = `${optionCode} (${description})`;
      
      // Generate a button for this option
      const buttonHtml = `<button class="cta-button response-option-btn inline-option" data-value="${fullText}">
        <i class="fas fa-code"></i>
        ${optionCode}
        <span class="option-description">(${description})</span>
      </button>`;
      
      // Replace the bullet point with the button
      processedText = processedText.replace(content, buttonHtml);
      continue;
    }
    
    // CASE 3: "Ask a question" or similar action phrases
    const askMatch = content.match(/•\s+(Ask\s+(?:a|another)\s+([a-zA-Z]+))/i);
    if (askMatch) {
      const fullPhrase = askMatch[1];
      const value = fullPhrase;
      
      // Generate a button for this action
      const buttonHtml = `<button class="cta-button whitepaper-btn response-option-btn action-btn" data-value="${value}">
        <i class="fas fa-question-circle"></i>
        ${fullPhrase}
      </button>`;
      
      // Replace the bullet point with the button
      processedText = processedText.replace(content, buttonHtml);
      continue;
    }
  }
  
  // PHASE 2: Handle specialized patterns that might not be bullet points
  
  // TYPE PATTERN: Match "Type X for Y" where X is a code and Y is a description
  const typePattern = /Type\s+([A-Z]{1,3})\s+for\s+([^.]+)/gi;
  processedText = processedText.replace(typePattern, (match, code, description) => {
    const fullText = `${code} for ${description.trim()}`;
    return `<button class="cta-button response-option-btn inline-option" data-value="${fullText}">
      <i class="fas fa-keyboard"></i>
      ${code}
      <span class="option-description">(${description.trim()})</span>
    </button>`;
  });
  
  // CODE PATTERN: Match standalone codes like "ST" or "FI" especially after bullet points
  const codePattern = /\b([A-Z]{2})\b\s*\(([^)]+)\)/g;
  processedText = processedText.replace(codePattern, (match, code, description) => {
    const fullText = `${code} (${description.trim()})`;
    return `<button class="cta-button response-option-btn inline-option" data-value="${fullText}">
      <i class="fas fa-tag"></i>
      ${code}
      <span class="option-description">(${description.trim()})</span>
    </button>`;
  });
  
  // PHASE 3: Look for sentence-based patterns after periods
  // This new pattern helps find button-worthy content after periods
  const sentencePattern = /\.(?:\s+)([A-Z][^.!?:]+?(?::[^.!?]+|[^.!?]*?\([^)]+\)))/g;
  processedText = processedText.replace(sentencePattern, (match, sentenceContent) => {
    // Check if this looks like a "Feature: Description" pattern
    const featureMatch = sentenceContent.match(/^([A-Z][a-zA-Z\s]+):\s*(.+)$/);
    if (featureMatch) {
      const feature = featureMatch[1].trim();
      const description = featureMatch[2].trim();
      const fullText = `${feature}: ${description}`;
      
      return `. <button class="cta-button response-option-btn" data-value="${fullText}">
        <i class="fas fa-star"></i>
        ${feature}
        <span class="option-description">${description}</span>
      </button>`;
    }
    
    // Check if this looks like an "Option (description)" pattern
    const optionMatch = sentenceContent.match(/^([A-Z]{2,})\s*\(([^)]+)\)/);
    if (optionMatch) {
      const code = optionMatch[1].trim();
      const description = optionMatch[2].trim();
      const fullText = `${code} (${description})`;
      
      return `. <button class="cta-button response-option-btn inline-option" data-value="${fullText}">
        <i class="fas fa-code"></i>
        ${code}
        <span class="option-description">(${description})</span>
      </button>`;
    }
    
    return match; // Return unchanged if no patterns match
  });
  
  // PHASE 4: Format remaining text with markdown-style formatting
  
  // Convert markdown-style bold
  let formatted = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Only wrap in paragraphs if it doesn't already contain HTML or buttons
  if ((!formatted.includes('<button') && !formatted.includes('<div')) || 
      !(formatted.includes('<p>') || formatted.includes('<div'))) {
    const paragraphs = formatted.split(/\n\n+/);
    formatted = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
  }
  
  return formatted;
};

// Handler for when a response option button is clicked
const handleResponseOptionClick = (event: Event) => {
  // Find the button element (it might be a child of the button that was actually clicked)
  let element = event.target as HTMLElement;
  while (element && !element.classList.contains('response-option-btn')) {
    element = element.parentElement as HTMLElement;
    if (!element) return; // Exit if we couldn't find a parent button
  }
  
  // Get the data-value attribute (full text) or fall back to button's visible text
  const responseValue = element.getAttribute('data-value') || element.textContent?.trim();
  
  if (responseValue) {
    // Set the value to the input
    prompt.value = responseValue;
    
    // Send the message
    sendPrompt();
  }
};
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
      @click="(e) => { 
        if (e.target && (e.target as HTMLElement).classList.contains('response-option-btn')) {
          handleResponseOptionClick(e);
        }
      }"
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
          v-for="(msg, index) in messages.slice(-visibleMessages)"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="bubble">
            <template v-if="msg.role === 'assistant'">
              <template v-if="msg.content.includes('<reasoning>')">
                <!-- Extract reasoning part -->
                <div class="thinking-content">
                  <div class="thinking-label">Reasoning:</div>
                  <span class="thinking-text">{{ msg.content.match(/<reasoning>(.*?)<\/reasoning>/s)?.[1] || '' }}</span>
                </div>
                <!-- Extract actual response part and render as HTML -->
                <div class="formatted-message" v-html="formatMessage(msg.content.replace(/<reasoning>.*?<\/reasoning>/gs, ''))"></div>
              </template>
              <template v-else>
                <!-- Message doesn't have reasoning tags, render with proper formatting -->
                <div class="formatted-message" v-html="formatMessage(msg.content)"></div>
              </template>
            </template>
            <span v-else class="message-text">{{ msg.content }}</span>
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

<style>
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
  transition: 
    transform 0.3s ease-out, 
    background-color 0.4s ease-out, /* ⏳ Slow fade-out */
    box-shadow 0.6s ease-out; /* ⏳ Longer glow fade */
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.15);
  z-index: 99900;
  touch-action: none; /* Prevents default touch actions */
  user-select: none; /* Prevents text selection during drag */
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
  z-index: 99901;
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
  transition: all 0.2s ease;
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
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
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
  transition: all 0.2s ease;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1001;
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
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.3);
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

/* Formatted Message Styles */
.formatted-message {
  width: 100%;
}

.formatted-message strong {
  color: #4DCFFF;
  font-weight: 700;
  text-shadow: 0 0 3px rgba(15, 185, 253, 0.2);
}

.formatted-message ul {
  padding-left: 0;
  margin: 0.75rem 0;
  list-style: none;
}

.formatted-message li {
  position: relative;
  padding: 0.25rem 0.5rem 0.25rem 1.5rem;
  margin-bottom: 0.25rem;
}

.formatted-message li::before {
  content: '•';
  position: absolute;
  left: 0.5rem;
  top: 0.25rem;
  color: #0FB9FD;
}

.formatted-message p {
  margin: 0.5rem 0;
}

/* Option Section Styles */
.option-section {
  margin: 0.75rem 0 1.25rem 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(15, 185, 253, 0.2);
  background: rgba(15, 185, 253, 0.05);
}

.section-title {
  background: rgba(15, 185, 253, 0.15);
  color: #4DCFFF;
  padding: 0.5rem 1rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
}

.option-section .response-options {
  padding: 0.75rem;
  margin: 0;
}

.option-section .response-option-btn {
  margin-bottom: 0.5rem;
}

.option-section .response-option-btn:last-child {
  margin-bottom: 0;
}

/* Response Options Styles */
.response-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.75rem 0;
  width: 100%;
}

/* Styling to match DAO.vue's beautiful cta-buttons */
.cta-button,
.bubble .message-text button.cta-button,
.formatted-message button.cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  padding: 1.1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-align: center;
  color: #f0f9ff !important;
  background: linear-gradient(to bottom, 
    rgba(74, 144, 226, 0.95) 0%, 
    rgba(38, 79, 137, 0.95) 100%) !important;
  border: 2px solid rgba(79, 174, 255, 0.7) !important;
  border-radius: 8px !important;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    0 10px 25px rgba(79, 174, 255, 0.4) !important;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  z-index: 1;
  transform-style: preserve-3d;
  margin-bottom: 0.5rem;
  width: auto;
  max-width: 100%;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.cta-button::before,
.bubble .message-text button.cta-button::before,
.formatted-message button.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(255, 255, 255, 0) 100%);
  transform: translateX(-100%) rotate(45deg);
  transition: transform 0.6s ease;
  z-index: -1;
}

.cta-button i,
.bubble .message-text button.cta-button i,
.formatted-message button.cta-button i {
  font-size: 1.2rem;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.cta-button:hover,
.bubble .message-text button.cta-button:hover,
.formatted-message button.cta-button:hover {
  transform: translateY(-5px) scale(1.03);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  background: linear-gradient(to bottom, 
    rgba(61, 146, 243, 0.95) 0%, 
    rgba(40, 122, 237, 0.95) 100%) !important;
  box-shadow: 
    inset 0 2px 10px rgba(146, 217, 255, 0.9),
    0 15px 30px rgba(30, 184, 255, 0.5) !important;
  color: #ffffff !important;
}

.cta-button:hover::before,
.bubble .message-text button.cta-button:hover::before,
.formatted-message button.cta-button:hover::before {
  transform: translateX(100%) rotate(45deg);
}

.cta-button:hover i,
.bubble .message-text button.cta-button:hover i,
.formatted-message button.cta-button:hover i {
  transform: scale(1.2) rotate(5deg);
  color: rgba(200, 230, 255, 1);
}

.cta-button:active,
.bubble .message-text button.cta-button:active,
.formatted-message button.cta-button:active {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 
    inset 0 2px 8px rgba(146, 217, 255, 0.7),
    0 8px 16px rgba(30, 184, 255, 0.3) !important;
  transition: all 0.1s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Whitepaper button style for action buttons */
.cta-button.whitepaper-btn,
.bubble .message-text button.cta-button.whitepaper-btn,
.formatted-message button.cta-button.whitepaper-btn {
  background: linear-gradient(to bottom, 
    rgba(38, 79, 137, 0.95) 0%, 
    rgba(26, 60, 110, 0.95) 100%) !important;
  border: 2px solid rgba(61, 136, 214, 0.7) !important;
}

.cta-button.whitepaper-btn:hover,
.bubble .message-text button.cta-button.whitepaper-btn:hover,
.formatted-message button.cta-button.whitepaper-btn:hover {
  background: linear-gradient(to bottom, 
    rgba(49, 115, 199, 0.95) 0%, 
    rgba(30, 78, 141, 0.95) 100%) !important;
  box-shadow: 
    inset 0 2px 10px rgba(123, 187, 255, 0.8),
    0 15px 30px rgba(61, 142, 255, 0.4) !important;
}

/* Inline option styling */
.cta-button.inline-option,
.bubble .message-text button.cta-button.inline-option,
.formatted-message button.cta-button.inline-option {
  display: inline-flex;
  margin: 0.25rem 0.5rem 0.25rem 0;
  padding: 0.8rem 1.2rem;
  font-size: 0.95rem;
}

.option-description,
.bubble .message-text button .option-description,
.formatted-message button .option-description {
  color: rgba(220, 240, 255, 0.8) !important;
  font-size: 0.85rem;
  margin-left: 0.5rem;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: normal;
}

.cta-button:hover .option-description,
.bubble .message-text button.cta-button:hover .option-description,
.formatted-message button.cta-button:hover .option-description {
  color: rgba(255, 255, 255, 0.95) !important;
}

@media (max-width: 480px) {
  .cta-button,
  .bubble .message-text button.cta-button,
  .formatted-message button.cta-button {
    padding: 0.9rem 1.2rem;
    font-size: 1rem;
    width: 100%;
  }
  
  .option-description,
  .bubble .message-text button .option-description,
  .formatted-message button .option-description {
    width: 100%;
    margin-left: 0;
    margin-top: 0.25rem;
    font-size: 0.8rem;
  }
  
  .cta-button.inline-option,
  .bubble .message-text button.cta-button.inline-option,
  .formatted-message button.cta-button.inline-option {
    width: auto;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }
  
  .cta-button i,
  .bubble .message-text button.cta-button i,
  .formatted-message button.cta-button i {
    font-size: 1.1rem;
  }
}

/* Response option container */
.response-option-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
  width: 100%;
}

/* Faction button styles - special variant */
.faction-btn,
.bubble .message-text button.faction-btn,
.formatted-message button.faction-btn {
  background: linear-gradient(to bottom, 
    rgba(81, 65, 190, 0.95) 0%, 
    rgba(55, 40, 165, 0.95) 100%) !important;
  border-color: rgba(120, 100, 250, 0.7) !important;
}

.faction-btn:hover,
.bubble .message-text button.faction-btn:hover,
.formatted-message button.faction-btn:hover {
  background: linear-gradient(to bottom, 
    rgba(100, 85, 210, 0.95) 0%, 
    rgba(75, 60, 185, 0.95) 100%) !important;
  box-shadow: 
    inset 0 2px 10px rgba(150, 130, 255, 0.9),
    0 15px 30px rgba(120, 100, 250, 0.5) !important;
}

/* Action button styles - special variant */
.action-btn,
.bubble .message-text button.action-btn,
.formatted-message button.action-btn {
  background: linear-gradient(to bottom, 
    rgba(45, 165, 90, 0.95) 0%, 
    rgba(30, 140, 70, 0.95) 100%) !important;
  border-color: rgba(60, 190, 110, 0.7) !important;
}

.action-btn:hover,
.bubble .message-text button.action-btn:hover,
.formatted-message button.action-btn:hover {
  background: linear-gradient(to bottom, 
    rgba(60, 180, 105, 0.95) 0%, 
    rgba(45, 155, 85, 0.95) 100%) !important;
  box-shadow: 
    inset 0 2px 10px rgba(100, 230, 150, 0.9),
    0 15px 30px rgba(60, 190, 110, 0.5) !important;
}

.faction-description {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #d9e5ff;
  background: rgba(65, 45, 199, 0.15);
  border-radius: 0 0 8px 8px;
  margin-top: -2px;
  border: 1px solid rgba(65, 45, 199, 0.25);
  border-top: none;
}
</style>