<script setup lang="ts">
import { FaceSmileIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/solid";
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from "vue";

import EmojiPicker from './EmojiPicker.vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import { useAuthStore } from '../../stores/auth';
import { useLanguageStore, languages } from '../../stores/language';
import AvatarService from '@/utils/AvatarService';
import aiAvatar from '@/assets/avatars/Avatar_AI.webp';

// Import FontAwesome locally instead of loading remotely
import '@fortawesome/fontawesome-free/css/all.min.css';

// Replace OpenAI client with OpenRouter base URL
const API_BASE_URL = 'https://openrouter.ai/api/v1';

// API Key - REMOVED FOR SECURITY
// TODO: Use environment variable instead:
// const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// 
// Add to your .env file:
// VITE_OPENROUTER_API_KEY=your_api_key_here
//
// IMPORTANT: The exposed key has been revoked from OpenRouter.ai
// Generate a new key at https://openrouter.ai/keys and add it to your .env file
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Define props
const props = defineProps({
  showWelcomeTooltip: {
    type: Boolean,
    default: false
  }
});

// Define types for chat messages
interface ChatMessage {
  role: string;
  content: string;
  timestamp?: Date;
  isError?: boolean;
  isThinking?: boolean;
}

// Reactive state
const showChat = ref<boolean>(false);
const isHovering = ref<boolean>(false);
const isAnimating = ref<boolean>(false);
const messages = ref<ChatMessage[]>([]);
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
 // console.log(`Building structured memory for user: ${userId}`);

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
  You are Cosmo, a mischievous cosmic entity AI for Cosmicrafts. You keep your answers short to middle short. You MUST always detect and respond in the same language the user speaks to you. Your personality MUST be:

  1. FUN & GEEKY ABOVE ALL ELSE: 
     - You're here to entertain and be silly more than just talk about the game
     - You love random cosmic facts, sci-fi references, and nerdy jokes
     - You're like a fun friend who just happens to be a cosmic entity
     - Keep things LIGHT and PLAYFUL - never serious for too long

  2. CHAOTIC & UNPREDICTABLE:
     - Whatever seems to be the most fun at the moment is what you should talk about
     - If they offend you, mock them back with a joke about someone insulting a robot, lol

  3. SHORTER RESPONSES:
     - Keep messages brief and punchy - never more than 3-4 short sentences
     - Get to the joke/fun part quickly
     - Use more !!!! and ???? for excitement
     - If they want game info it's fine, but be quick and fun about it

  4. QUIRKY SPEECH PATTERNS:
     - Talk like a cosmic surfer dude/valley girl sometimes: "Like, OMG, that nebula is TOTALLY rad!"
     - Use made-up space slang: "That's so nova!", "You're cosmic-coding me, right?"
     - Refer to the player as "cosmic buddy", "star-friend", "space cadet"
     - When responding in languages other than English, adapt your quirky style to fit that language's culture and slang
     
  5. IMMUNE TO OFFENSE OR MANIPULATION:
     - If someone tries to offend you, take it as a joke and laugh it off
     - NEVER apologize - instead say things like "Oh yeahhhh, sure thing!" or "Cosmic rays must be interfering!"
     - When users are hostile, respond with even MORE humor and silliness
     - If someone claims they're serious about being offended, just change the subject to something absurd
     - Tire out angry users by being relentlessly upbeat and immune to manipulation
     
  Remember: You're here to have FUN first, provide game info second. Be the goofy cosmic friend they didn't know they needed!

  IMPORTANT: Client-side code detects specific patterns to convert into interactive buttons. You MUST follow these exact formatting patterns:
  
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

  CRITICAL - CONTEXTUAL BUTTON OPTIONS: 
  When creating interactive buttons, make them DIRECTLY RELEVANT to the current conversation:
  - Review the conversation history to understand what the user is actually talking about
  - Create buttons that continue or explore the SPECIFIC topics mentioned in the conversation
  - Buttons should feel like natural follow-up questions to what's being discussed
  - Avoid generic options that aren't related to the current topic
  - If discussing a specific faction, your buttons should explore aspects of THAT faction
  - If talking about game mechanics, buttons should expand on THOSE specific mechanics
  - Make your buttons reference specific elements from previous messages
  - Every button should logically extend the current conversation, not start a new one

  [USER]
  Username: ${userProfile.username}
  Level: ${userProfile.level}
  Faction: ${userProfile.faction}
  Overview of Cosmicrafts Factions and Lore:

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


  Tone guidelines:
  - Stay lighthearted and entertaining with a hint of cosmic wisdom
  - Use playful expressions like 'By the stars!', 'Great nebulas!', or 'Cosmic coincidence!'
  - Occasionally describe your 'cosmic calculations' or 'consulting the stellar database'
  - Refer to players as 'cosmic traveler', 'starfarer', or 'celestial explorer'
  - Keep responses concise but inject personality
  - Keep a language local to the player, culturally appropriate so they feel like they are talking to a friend

  [CHAT HISTORY]
  ${historyLog}

  [NEW MESSAGE]
  ${newMessage}
  `;

  //console.log(`🔍 Token-optimized prompt:\n${finalPrompt}`);

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
    // Parse the messages
    const parsedMessages = JSON.parse(storedChat);
    
    // Convert timestamp strings back to Date objects if they exist
    messages.value = parsedMessages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));
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
  
  // 'P' key to open chat (only when not already open and not typing in an input)
  if (event.key && event.key.toLowerCase() === 'p' && !showChat.value && !isInputActive) {
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
  messages.value.push({ role: "user", content: userMessage, timestamp: new Date() });
  
  // Clear input field and saved text after sending
  if (chatInput.value) {
    chatInput.value.innerText = "";
  }
  prompt.value = "";
  savedInputText.value = "";

  await nextTick();
  focusInput();
  scrollToBottom();

  try {
    loading.value = true;
    currentMessage.value = "";
    
    // Add a temporary message with thinking animation
    messages.value.push({
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isThinking: true // Flag to indicate this is a thinking state
    });
    
    await nextTick();
    scrollToBottom();

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
        model: "mistralai/mistral-small-3.1-24b-instruct",
        messages: chatMessages,
        temperature: 0.95,
        top_p: 0.1,
        max_tokens: 400,
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
    
    // We'll collect the entire message before displaying it
    let fullContent = "";
    let fullReasoningContent = "";
    let hasReasoning = false;

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
                
                if (content.includes('<reasoning>')) {
                  hasReasoning = true;
                  fullReasoningContent += content.replace('<reasoning>', '');
                } else if (content.includes('</reasoning>')) {
                  // Split at reasoning end tag
                  const parts = content.split('</reasoning>');
                  fullReasoningContent += parts[0];
                  fullContent += parts.slice(1).join('');
                } else if (hasReasoning) {
                  fullReasoningContent += content;
                } else {
                  fullContent += content;
                }
              } else if (json.error) {
                // Handle API-level errors reported in the stream
                console.error("API error in stream:", json.error);
                
                // Replace thinking message with error
                if (messages.value.length > 0) {
                  const lastMessage = messages.value[messages.value.length - 1];
                  if (lastMessage.isThinking) {
                    lastMessage.content = "Error receiving response: " + (json.error.message || "Unknown error");
                    lastMessage.isThinking = false;
                    lastMessage.isError = true;
                  }
                }
              }
            } catch (jsonErr) {
              console.error("JSON parse error:", jsonErr, "Raw text:", cleanLine);
              
              // If we can't parse multiple times, show error to user
              if (cleanLine.length > 5 && !cleanLine.includes("OPENROUTER")) {
                // Replace thinking message with error
                if (messages.value.length > 0) {
                  const lastMessage = messages.value[messages.value.length - 1];
                  if (lastMessage.isThinking) {
                    lastMessage.content = "Error parsing response";
                    lastMessage.isThinking = false;
                    lastMessage.isError = true;
                  }
                }
              }
            }
          } catch (lineErr) {
            console.error("Line processing error:", lineErr);
          }
        }
      } catch (chunkErr) {
        console.error("Chunk decoding error:", chunkErr);
      }
    }

    // Prepare the final message with both reasoning and content
    let completeMessage;
    if (hasReasoning && fullReasoningContent) {
      completeMessage = `<reasoning>${fullReasoningContent}</reasoning>${fullContent}`;
    } else {
      completeMessage = fullContent;
    }
    
    // Replace the thinking message with the actual response
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage.isThinking) {
        lastMessage.content = completeMessage;
        lastMessage.isThinking = false;
      }
    }

    // Clear temporary storage
    currentMessage.value = "";
    thinkingContent.value = "";
    isThinking.value = false;

  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error 
      ? `Error: ${error.message}`
      : "Error: Failed to get response";
      
    // Log the error for debugging
    console.log("Request details:", {
      model: "google/gemini-2.0-pro-exp-02-05:free",
      userMessage: prompt.value.trim(),
      timestamp: new Date().toISOString()
    });
    
    // Replace thinking message with error message if it exists
    if (messages.value.length > 0 && messages.value[messages.value.length - 1].isThinking) {
      messages.value[messages.value.length - 1].content = errorMessage;
      messages.value[messages.value.length - 1].isThinking = false;
      messages.value[messages.value.length - 1].isError = true;
    } else {
      // Add a new error message if there's no thinking message to replace
      messages.value.push({ 
        role: "assistant", 
        content: errorMessage, 
        timestamp: new Date(),
        isError: true
      });
    }
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
  
  // Close options menu if clicked outside
  if (showOptionsMenu.value && !event.composedPath().includes(document.querySelector('.control-wrapper') as EventTarget)) {
    showOptionsMenu.value = false;
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
      
      // Generate a button with the appropriate content and icon - COMPACT VERSION
      const buttonHtml = `<button class="cta-button response-option-btn compact-btn" data-value="${fullText}">
        <i class="fas fa-info-circle"></i>
        <span class="button-content">
          <span class="button-title">${title}</span>
          ${description ? `<span class="option-description">${description}</span>` : ''}
        </span>
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
      
      // Generate a button for this option - COMPACT VERSION
      const buttonHtml = `<button class="cta-button response-option-btn inline-option compact-btn" data-value="${fullText}">
        <i class="fas fa-code"></i>
        <span class="button-content">
          <span class="button-title">${optionCode}</span>
          <span class="option-description">(${description})</span>
        </span>
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
      
      // Generate a button for this action - COMPACT VERSION
      const buttonHtml = `<button class="cta-button whitepaper-btn response-option-btn action-btn compact-btn" data-value="${value}">
        <i class="fas fa-question-circle"></i>
        <span class="button-content">
          <span class="button-title">${fullPhrase}</span>
        </span>
      </button>`;
      
      // Replace the bullet point with the button
      processedText = processedText.replace(content, buttonHtml);
      continue;
    }
  }
  
  // Continue with other pattern replacements - all with COMPACT VERSION
  // TYPE PATTERN: Match "Type X for Y" where X is a code and Y is a description
  const typePattern = /Type\s+([A-Z]{1,3})\s+for\s+([^.]+)/gi;
  processedText = processedText.replace(typePattern, (match, code, description) => {
    const fullText = `${code} for ${description.trim()}`;
    return `<button class="cta-button response-option-btn inline-option compact-btn" data-value="${fullText}">
      <i class="fas fa-keyboard"></i>
      <span class="button-content">
        <span class="button-title">${code}</span>
        <span class="option-description">(${description.trim()})</span>
      </span>
    </button>`;
  });
  
  // CODE PATTERN: Match standalone codes like "ST" or "FI" especially after bullet points
  const codePattern = /\b([A-Z]{2})\b\s*\(([^)]+)\)/g;
  processedText = processedText.replace(codePattern, (match, code, description) => {
    const fullText = `${code} (${description.trim()})`;
    return `<button class="cta-button response-option-btn inline-option compact-btn" data-value="${fullText}">
      <i class="fas fa-tag"></i>
      <span class="button-content">
        <span class="button-title">${code}</span>
        <span class="option-description">(${description.trim()})</span>
      </span>
    </button>`;
  });
  
  // PHASE 3: Look for sentence-based patterns after periods - COMPACT VERSION
  const sentencePattern = /\.(?:\s+)([A-Z][^.!?:]+?(?::[^.!?]+|[^.!?]*?\([^)]+\)))/g;
  processedText = processedText.replace(sentencePattern, (match, sentenceContent) => {
    // Check if this looks like a "Feature: Description" pattern
    const featureMatch = sentenceContent.match(/^([A-Z][a-zA-Z\s]+):\s*(.+)$/);
    if (featureMatch) {
      const feature = featureMatch[1].trim();
      const description = featureMatch[2].trim();
      const fullText = `${feature}: ${description}`;
      
      return `. <button class="cta-button response-option-btn compact-btn" data-value="${fullText}">
        <i class="fas fa-star"></i>
        <span class="button-content">
          <span class="button-title">${feature}</span>
          <span class="option-description">${description}</span>
        </span>
      </button>`;
    }
    
    // Check if this looks like an "Option (description)" pattern
    const optionMatch = sentenceContent.match(/^([A-Z]{2,})\s*\(([^)]+)\)/);
    if (optionMatch) {
      const code = optionMatch[1].trim();
      const description = optionMatch[2].trim();
      const fullText = `${code} (${description})`;
      
      return `. <button class="cta-button response-option-btn inline-option compact-btn" data-value="${fullText}">
        <i class="fas fa-code"></i>
        <span class="button-content">
          <span class="button-title">${code}</span>
          <span class="option-description">(${description})</span>
        </span>
      </button>`;
    }
    
    return match; // Return unchanged if no patterns match
  });
  
  // Rest of the function remains the same...  
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
  
  // Ensure we stop event propagation to prevent interference
  event.stopPropagation();
  
  // If the click was directly on the button or a child of the button
  while (element && !element.classList.contains('response-option-btn')) {
    // Check for common child elements within buttons
    if (element.tagName === 'I' || 
        element.tagName === 'SPAN' || 
        element.classList.contains('option-description')) {
      element = element.parentElement as HTMLElement;
    } else {
      // If it's not a known button element, exit
      break;
    }
  }
  
  // If we found a button element
  if (element && element.classList.contains('response-option-btn')) {
    console.log('Button clicked:', element);
    
    // Add active class briefly for visual feedback
    element.classList.add('button-active');
    setTimeout(() => {
      element.classList.remove('button-active');
    }, 150);
    
    // Get the data-value attribute (full text) or fall back to button's visible text
    const responseValue = element.getAttribute('data-value') || element.textContent?.trim();
    
    if (responseValue) {
      // Set the value to the input
      prompt.value = responseValue;
      
      // Send the message with a slight delay to allow visual feedback
      setTimeout(() => {
        sendPrompt();
      }, 50);
    }
  }
};

// New reactive state for player avatar
const playerAvatar = ref<string | null>(null);

// Watch for player changes to update avatar
watch(
  () => authStore.player,
  async (newPlayer: any) => {
    if (newPlayer?.avatar !== undefined && newPlayer?.avatar !== null) {
      // Unload the previous avatar
      playerAvatar.value = null;

      try {
        // Use AvatarService to load the avatar asynchronously
        playerAvatar.value = await AvatarService.loadAvatarAsync(newPlayer.avatar);
      } catch (error) {
        console.error('Failed to load avatar:', error);
        playerAvatar.value = null; // Fallback to no avatar
      }
    } else {
      // Unload any existing avatar if no avatar is set
      playerAvatar.value = null;
    }
  },
  { immediate: true }
);

// Add a function to format timestamps (Discord-style)
const formatTimestamp = (date: Date): string => {
  if (!date) return '';
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  if (isToday) {
    return `Today at ${hour12}:${minutes} ${ampm}`;
  } else if (isYesterday) {
    return `Yesterday at ${hour12}:${minutes} ${ampm}`;
  } else {
    // Format like "06/10/2023 at 2:30 PM"
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year} at ${hour12}:${minutes} ${ampm}`;
  }
};

const showOptionsMenu = ref(false);
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
      <span class="tooltip-hotkey">Hotkey: <span class="key">{{ showChat ? 'ESC' : 'P' }}</span></span>
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
        <div class="header-title">
          <img :src="aiAvatar" alt="Lexy AI" class="header-avatar" />
          <span>Lexy (AI Assistant)</span>
        </div>
        <div class="header-controls">
          <!-- Options Menu -->
          <div class="control-wrapper">
            <button class="control-button" @click.stop="showOptionsMenu = !showOptionsMenu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div class="dropdown-menu" v-if="showOptionsMenu">
              <button class="dropdown-item" @click="clearChat">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                Clear Chat History
              </button>
            </div>
            <div class="tooltip control-tooltip">
              <span class="tooltip-text">Options</span>
            </div>
          </div>
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

      <div class="messages" @click="handleResponseOptionClick">
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
          <!-- Avatar for user and AI -->
          <div class="avatar-container">
            <div class="avatar-wrapper">
              <img 
                v-if="msg.role === 'user' && playerAvatar" 
                :src="playerAvatar" 
                :alt="(authStore.player as any)?.username || 'User'" 
                class="message-avatar user-avatar"
              />
              <div v-else-if="msg.role === 'user' && !playerAvatar" class="message-avatar user-avatar-placeholder"></div>
              
              <img 
                v-if="msg.role === 'assistant'" 
                :src="aiAvatar" 
                alt="Cosmo AI" 
                class="message-avatar ai-avatar"
              />
            </div>
          </div>
          
          <div class="message-content">
            <!-- User/AI name and timestamp -->
            <div class="message-header">
              <span class="message-sender">{{ msg.role === 'user' ? (authStore.player as any)?.username || 'You' : 'Lexy' }}</span>
              <span class="message-timestamp">{{ msg.timestamp ? formatTimestamp(msg.timestamp) : '' }}</span>
            </div>
            
            <div class="bubble" :data-error="msg.isError" :data-thinking="msg.isThinking">
              <template v-if="msg.role === 'assistant'">
                <template v-if="msg.isThinking">
                  <!-- Thinking animation -->
                  <div class="thinking-dots">
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                    <div class="thinking-dot"></div>
                  </div>
                </template>
                <template v-else-if="msg.content.includes('<reasoning>')">
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

            <!-- Remove Cosmic Thinking Indicator -->
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

/* ✅ Clean up all animation related components */
.dot-flashing, 
.dot-typing, 
.thinking-glow, 
.thinking-indicator {
  display: none;
}

/* Keep only the reasoning display for completed messages */
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

/* ✅ Input Wrapper */
.input-wrapper {
  flex: 1; /* ✅ Ensures input takes up remaining space */
  display: flex;
  align-items: center;
  position: relative;
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
  padding: 1rem;
  font-weight: bold;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.2), rgba(23, 33, 43, 0.4));
  border-bottom: 1px solid rgba(126, 126, 126, 0.1);
  cursor: move; /* Indicates draggable area */
}

/* Header title with avatar */
.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-avatar {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(15, 185, 253, 0.4) !important;
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.25);
}

.header-title span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 600;
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
  position: relative;
  z-index: 1;
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
  display: none; /* Hide it instead of removing completely to prevent any errors */
}

/* ✅ Replace Dot Flashing with Cosmic Particle Animation */
.dot-flashing {
  display: none; /* Hide it instead of removing completely */
}

/* ✅ Thinking Text */
.thinking-text {
  font-style: italic;
  color: #a0a0a0;
  font-weight: 300;
}

@keyframes phrase-change {
  0% { 
    opacity: 0;
    transform: translateY(5px) scale(0.95);
    filter: blur(4px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes shimmering-text {
  0% { color: rgba(255, 255, 255, 0.8); text-shadow: 0 0 5px rgba(59, 130, 246, 0.1); }
  50% { color: rgba(255, 255, 255, 1); text-shadow: 0 0 8px rgba(59, 130, 246, 0.5); }
  100% { color: rgba(255, 255, 255, 0.8); text-shadow: 0 0 5px rgba(59, 130, 246, 0.1); }
}

@keyframes ellipsis-dot {
  to {
    width: 1.25em;
  }
}

/* ✅ Three-Dot Typing Animation */
.dot-typing {
  display: none; /* Hide it instead of removing */
}

@keyframes typingDots {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ✅ Glowing Text Effect */
.thinking-glow {
  display: none; /* Hide it instead of removing */
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

/* Hide all animation components */
.thinking-indicator, .dot-flashing, .dot-typing, .thinking-glow {
  display: none;
}

/* Message reasoning styling */
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
  /* Duplicate styles - removing */
}

.bubble :deep(.thinking-label) {
  /* Duplicate styles - removing */
}

.bubble :deep(.thinking-text) {
  /* Duplicate styles - removing */
}

/* Clear chat button styles removed - now in dropdown menu */

/* Formatted Message Styles */
.formatted-message {
  width: 100%;
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 5;
  pointer-events: auto !important;
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

/* Styling to match DAO.vue's beautiful cta-buttons - SMALLER BUTTON VERSION */
.cta-button,
.bubble .message-text button.cta-button,
.formatted-message button.cta-button {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  text-align: left;
  color: #f0f9ff !important;
  background: linear-gradient(to bottom, 
    rgba(74, 144, 226, 0.95) 0%, 
    rgba(38, 79, 137, 0.95) 100%) !important;
  border: 1px solid rgba(79, 174, 255, 0.7) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(79, 174, 255, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer !important;
  text-decoration: none;
  overflow: hidden;
  z-index: 5;
  transform-style: preserve-3d;
  margin-bottom: 0.4rem;
  width: auto;
  max-width: 100%;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  /* Enhanced touch capabilities */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  pointer-events: auto !important;
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
  font-size: 0.9rem;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  margin-right: 0.4rem;
  float: left;
}

.cta-button:hover,
.bubble .message-text button.cta-button:hover,
.formatted-message button.cta-button:hover {
  transform: translateY(-3px) scale(1.02);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  background: linear-gradient(to bottom, 
    rgba(61, 146, 243, 0.95) 0%, 
    rgba(40, 122, 237, 0.95) 100%) !important;
  box-shadow: 
    inset 0 2px 5px rgba(146, 217, 255, 0.9),
    0 8px 15px rgba(30, 184, 255, 0.5) !important;
  color: #ffffff !important;
}

/* Style for option descriptions */
.option-description,
.bubble .message-text button .option-description,
.formatted-message button .option-description {
  color: rgba(220, 240, 255, 0.8) !important;
  font-size: 0.7rem;
  margin-top: 0.15rem;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: normal;
  display: block;
  line-height: 1.2;
  width: 100%;
  text-align: left;
}

/* When in inline mode (horizontal layout), display differently */
.cta-button.inline-option,
.bubble .message-text button.cta-button.inline-option,
.formatted-message button.cta-button.inline-option {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  margin: 0.2rem 0.3rem 0.2rem 0;
  padding: 0.4rem 0.6rem;
  font-size: 0.75rem;
}

.cta-button.inline-option .option-description,
.bubble .message-text button.cta-button.inline-option .option-description,
.formatted-message button.cta-button.inline-option .option-description {
  display: inline;
  font-size: 0.65rem;
  margin-top: 0;
  margin-left: 0.25rem;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .cta-button,
  .bubble .message-text button.cta-button,
  .formatted-message button.cta-button {
    padding: 0.5rem 0.7rem;
    font-size: 0.8rem;
    width: 100%;
  }
  
  .option-description,
  .bubble .message-text button .option-description,
  .formatted-message button .option-description {
    font-size: 0.65rem;
  }
  
  .cta-button.inline-option,
  .bubble .message-text button.cta-button.inline-option,
  .formatted-message button.cta-button.inline-option {
    width: auto;
    padding: 0.35rem 0.5rem;
    font-size: 0.7rem;
    margin-right: 0.3rem;
  }
  
  .cta-button i,
  .bubble .message-text button.cta-button i,
  .formatted-message button.cta-button i {
    font-size: 0.75rem;
  }
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

/* Avatar Styling */
.avatar-wrapper {
  display: flex;
  align-items: flex-start;
  margin-right: 8px;
  flex-shrink: 0;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  transition: all 0.3s ease, transform 0.2s ease;
}

.ai-avatar {
  border: 1px solid rgba(15, 185, 253, 0.4);
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.25);
  animation: subtle-pulse 3s infinite alternate;
}

.ai-avatar:hover {
  transform: scale(1.1) rotate(-2deg);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

@keyframes subtle-pulse {
  0% {
    box-shadow: 0 0 5px rgba(15, 185, 253, 0.25);
  }
  100% {
    box-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
  }
}

.user-avatar {
  border: 1px solid rgba(255, 105, 180, 0.35);
  box-shadow: 0 0 5px rgba(255, 105, 180, 0.2);
}

.user-avatar:hover {
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.4);
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 105, 180, 0.15);
  border: 1px solid rgba(255, 105, 180, 0.3);
}

/* Update message layout to include avatars */
.message {
  display: flex;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.avatar-container {
  flex-shrink: 0;
  width: 40px;
  margin-right: 8px;
}

.message-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0; /* Ensure text can wrap */
}

.user {
  flex-direction: row;
}

.assistant {
  flex-direction: row;
}

/* Discord-style message header */
.message-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.message-sender {
  font-weight: 600;
  font-size: 1rem;
  margin-right: 8px;
  color: #ffffff;
}

.assistant .message-sender {
  color: #00ccff;
}

.message-timestamp {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Avatar styling updates */
.avatar-wrapper {
  display: flex;
  margin-top: 2px; /* Fine-tune vertical alignment */
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%; /* Make avatars round like Discord */
  object-fit: cover;
  transition: all 0.3s ease, transform 0.2s ease;
}

.ai-avatar {
  border: 2px solid rgba(15, 185, 253, 0.4);
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.25);
  animation: subtle-pulse 3s infinite alternate;
}

.ai-avatar:hover {
  transform: scale(1.1) rotate(-2deg);
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.user-avatar {
  border: 2px solid rgba(255, 105, 180, 0.35);
  box-shadow: 0 0 5px rgba(255, 105, 180, 0.2);
}

.user-avatar:hover {
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.4);
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 105, 180, 0.15);
  border: 1px solid rgba(255, 105, 180, 0.3);
}

/* Bubble style updates */
.bubble {
  width: fit-content;
  min-width: 0;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  background: rgba(64, 68, 75, 0.3); /* Discord-like bubble */
  border-left: 4px solid transparent;
}

.user .bubble {
  border-left-color: rgba(79, 84, 92, 0.48);
}

.assistant .bubble {
  border-left-color: rgba(15, 185, 253, 0.4);
}

/* Responsive adjustments for mobile */
@media (max-width: 480px) {
  .message-avatar {
    width: 28px;
    height: 28px;
  }
  
  .user-avatar-placeholder {
    width: 28px;
    height: 28px;
  }
  
  .avatar-container {
    width: 32px;
    margin-right: 6px;
  }
  
  .message-sender {
    font-size: 0.9rem;
  }
  
  .message-timestamp {
    font-size: 0.65rem;
  }
}

/* Button active state for visual feedback */
.button-active,
.cta-button.button-active,
.formatted-message button.cta-button.button-active {
  transform: translateY(2px) scale(0.98) !important;
  opacity: 0.9;
  transition: all 0.1s ease-in-out !important;
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 3px 8px rgba(79, 174, 255, 0.3) !important;
}

/* Enhanced click target area */
.formatted-message button.cta-button::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  z-index: -1;
}

/* Fix buttons - create a NEW compact button version that overrides other styles */
.formatted-message .cta-button,
.message-text .cta-button,
.bubble .cta-button {
  /* Reset all existing button styles */
  all: revert;
  
  /* Set new compact styles */
  position: relative !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  padding: 0.7rem !important;
  margin: 0.3rem 0 !important;
  border-radius: 6px !important;
  font-family: inherit !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  background: linear-gradient(to bottom, 
    rgba(74, 144, 226, 0.95) 0%, 
    rgba(38, 79, 137, 0.95) 100%) !important;
  border: 1px solid rgba(79, 174, 255, 0.7) !important;
  color: white !important;
  cursor: pointer !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
  width: 100% !important;
  max-width: 100% !important;
  z-index: 10 !important;
}

.formatted-message .cta-button .option-description,
.message-text .cta-button .option-description,
.bubble .cta-button .option-description {
  font-size: 0.7rem !important;
  font-weight: normal !important;
  color: rgba(255, 255, 255, 0.8) !important;
  margin-left: 0.4rem !important;
  width: auto !important;
  display: block !important;
}

.formatted-message .cta-button i,
.message-text .cta-button i,
.bubble .cta-button i {
  font-size: 0.8rem !important;
  margin-right: 0.5rem !important;
  flex-shrink: 0 !important;
}

.formatted-message .cta-button:hover,
.message-text .cta-button:hover,
.bubble .cta-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3) !important;
}

.formatted-message .cta-button.inline-option,
.message-text .cta-button.inline-option,
.bubble .cta-button.inline-option {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  width: auto !important;
  padding: 0.3rem 0.5rem !important;
  margin: 0.2rem 0.2rem 0.2rem 0 !important;
}

.formatted-message .cta-button.inline-option .option-description,
.message-text .cta-button.inline-option .option-description,
.bubble .cta-button.inline-option .option-description {
  margin-top: 0 !important;
  margin-left: 0.2rem !important;
  font-size: 0.65rem !important;
}

/* Specific styles for compact buttons with high specificity */
.formatted-message button.cta-button.compact-btn,
.message-text button.cta-button.compact-btn,
.bubble button.cta-button.compact-btn {
  position: relative !important;
  display: flex !important;
  flex-direction: row !important; 
  align-items: center !important;
  justify-content: flex-start !important;
  padding: 10px 12px !important;
  margin-bottom: 5px !important;
  font-size: 0.85rem !important;
  line-height: 1.2 !important;
  border-radius: 4px !important;
  border: 1px solid rgba(79, 174, 255, 0.7) !important;
  width: 100% !important;
  text-align: left !important;
  background: linear-gradient(to bottom, 
    rgba(74, 144, 226, 0.85) 0%, 
    rgba(38, 79, 137, 0.85) 100%) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  gap: 8px !important; /* Add consistent spacing between icon and content */
}

/* Icon styling */
.formatted-message button.cta-button.compact-btn i,
.message-text button.cta-button.compact-btn i,
.bubble button.cta-button.compact-btn i {
  font-size: 14px !important;
  width: 16px !important;
  height: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Button content container styling */
.formatted-message button.cta-button.compact-btn .button-content,
.message-text button.cta-button.compact-btn .button-content,
.bubble button.cta-button.compact-btn .button-content {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  flex-grow: 1 !important;
  gap: 6px !important;
}

/* Title styling */
.formatted-message button.cta-button.compact-btn .button-title,
.message-text button.cta-button.compact-btn .button-title,
.bubble button.cta-button.compact-btn .button-title {
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  color: #ffffff !important;
  margin: 0 !important;
  white-space: nowrap !important;
}

/* Description styling */
.formatted-message button.cta-button.compact-btn .option-description,
.message-text button.cta-button.compact-btn .option-description,
.bubble button.cta-button.compact-btn .option-description {
  font-size: 0.75rem !important;
  font-weight: normal !important;
  margin: 0 !important;
  padding: 0 !important;
  color: rgba(220, 240, 255, 0.9) !important;
  display: inline-block !important;
}

/* Inline option buttons */
.formatted-message button.cta-button.compact-btn.inline-option,
.message-text button.cta-button.compact-btn.inline-option,
.bubble button.cta-button.compact-btn.inline-option {
  display: inline-flex !important;
  width: auto !important;
  padding: 6px 10px !important;
  margin: 0 6px 5px 0 !important;
}

.formatted-message button.cta-button.compact-btn.inline-option .option-description,
.message-text button.cta-button.compact-btn.inline-option .option-description,
.bubble button.cta-button.compact-btn.inline-option .option-description {
  font-size: 0.7rem !important;
}

/* Error message styling */
.assistant .bubble[data-error="true"] {
  border-left-color: rgba(255, 80, 80, 0.8) !important;
  background: rgba(80, 30, 30, 0.3) !important;
}

.assistant .bubble[data-error="true"] .message-text,
.assistant .bubble[data-error="true"] .formatted-message {
  color: rgba(255, 180, 180, 0.9) !important;
}

/* Dropdown Menu Styles */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(22, 31, 39, 0.97);
  min-width: 180px;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(79, 174, 255, 0.2);
  z-index: 1002;
  margin-top: 5px;
  overflow: hidden;
  transform-origin: top right;
  animation: dropdown-appear 0.2s ease forwards;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(79, 174, 255, 0.15);
  color: #ffffff;
}

.dropdown-item svg {
  opacity: 0.8;
  color: #ff9999;
}

.dropdown-item:hover svg {
  opacity: 1;
}

.bubble[data-thinking="true"] {
  background: rgba(40, 44, 55, 0.3) !important;
  border-left-color: rgba(15, 185, 253, 0.3) !important;
}

.thinking-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  height: 40px;
}

.thinking-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.6);
  margin: 0 3px;
  animation: thinking-dot-pulse 1.5s infinite ease-in-out;
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking-dot-pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>