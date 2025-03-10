<!-- Support.vue -->
<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="support-container">
      <header class="support-header">
        <h1 class="page-title">{{ $t('contact.support.title') }}</h1>
        <p class="page-subtitle">{{ $t('contact.support.subtitle') }}</p>
      </header>

      <div class="support-options-grid">
        <!-- Live Chat Option -->
        <div class="support-card">
          <div class="support-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="support-content">
            <h3>{{ $t('contact.support.chat.title') }}</h3>
            <p>{{ $t('contact.support.chat.description') }}</p>
            <button 
              class="cosmic-button primary" 
              type="button"
              @click.prevent.stop="openChat"
            >
              <i class="fas fa-comment"></i>
              {{ $t('contact.support.chat.button') }}
            </button>
          </div>
        </div>

        <!-- Discord Community Support -->
        <div class="support-card">
          <div class="support-icon">
            <i class="fab fa-discord"></i>
          </div>
          <div class="support-content">
            <h3>{{ $t('contact.support.discord.title') }}</h3>
            <p>{{ $t('contact.support.discord.description') }}</p>
            <a href="https://discord.com/invite/cosmicrafts-884272584491941888" target="_blank" class="cosmic-button primary">
              <i class="fab fa-discord"></i>
              {{ $t('contact.support.discord.button') }}
            </a>
          </div>
        </div>

        <!-- Email Support -->
        <div class="support-card">
          <div class="support-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="support-content">
            <h3>{{ $t('contact.support.email.title') }}</h3>
            <p>{{ $t('contact.support.email.description') }}</p>
            <a href="mailto:support@cosmicrafts.com" class="cosmic-button primary">
              <i class="fas fa-paper-plane"></i>
              {{ $t('contact.support.email.button') }}
            </a>
            <div class="response-time">
              <i class="fas fa-clock"></i>
              {{ $t('contact.support.email.responseTime') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const chatRef = inject('chatRef');

const openChat = (event) => {
  // Prevent any default behavior
  event?.preventDefault();
  event?.stopPropagation();

  console.log('🎯 Chat button clicked');
  
  if (!chatRef?.value) {
    console.error('❌ Chat reference is not available!');
    return;
  }

  try {
    // Directly set the chat's internal state
    if (chatRef.value.showChat !== undefined) {
      chatRef.value.showChat = true;
    } else {
      console.warn('⚠️ Using fallback toggle method');
      chatRef.value.toggleChat();
    }
    console.log('✅ Chat opened successfully');
  } catch (error) {
    console.error('❌ Error opening chat:', error);
  }
};
</script>

<style scoped>
.support-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem 4rem; /* Increased top padding to account for header */
  min-height: calc(100vh - 6rem); /* Adjust for header height */
  display: flex;
  flex-direction: column;
}

.support-header {
  text-align: center;
  margin-bottom: 4rem;
  padding-top: 2rem; /* Additional padding for better spacing */
}

.page-title {
  font-size: 3.5rem;
  font-weight: var(--weight-extra-bold);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.support-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}

.support-card {
  background: var(--color-surface-primary);
  border-radius: var(--radius-large);
  padding: 2.5rem;
  border: var(--border-thin);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.support-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.support-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-primary);
}

.support-card:hover::before {
  opacity: 1;
}

.support-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  border: var(--border-thin);
  transition: all 0.3s ease;
}

.support-card:hover .support-icon {
  transform: scale(1.1);
  background: var(--color-surface-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow-primary);
}

.support-icon i {
  font-size: 2rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
}

.support-card:hover .support-icon i {
  transform: scale(1.1);
}

.support-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.support-content h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: var(--weight-bold);
}

.support-content p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 400px;
}

.cosmic-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: var(--radius-medium);
  font-weight: var(--weight-bold);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-width: 200px;
  max-width: 300px; /* Added max-width */
  width: 100%;
}

.cosmic-button.primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--color-text-primary);
}

.cosmic-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-primary);
}

.shortcut-hint {
  margin-top: 1rem;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shortcut-hint i {
  font-size: 0.8rem;
}

.response-time {
  margin-top: 1rem;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.response-time i {
  font-size: 0.8rem;
  color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .support-options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .support-container {
    padding: 7rem 1rem 2rem; /* Adjusted padding for mobile */
  }

  .support-header {
    padding-top: 1rem;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .support-options-grid {
    grid-template-columns: 1fr;
  }

  .support-card {
    padding: 1.5rem;
  }

  .support-icon {
    width: 60px;
    height: 60px;
  }

  .support-icon i {
    font-size: 1.5rem;
  }

  .support-content h3 {
    font-size: 1.25rem;
  }

  .cosmic-button {
    max-width: 90%; /* Mobile max-width */
    min-width: unset;
    margin: 0 auto; /* Center the button */
  }
}
</style> 