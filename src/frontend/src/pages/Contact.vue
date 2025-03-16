<!-- Support.vue -->
<template>
  <section class="cosmic-page-bg with-subtle-grid">
    <div class="support-container">
      <header class="support-header">
        <h1 class="title-large text-gradient animated-title">{{ $t('contact.support.title') }}</h1>
        <p class="page-subtitle">{{ $t('contact.support.subtitle') }}</p>
      </header>

      <div class="support-options-grid">
        <!-- AI Assistant Option -->
        <div class="cosmic-card support-card">
          <div class="support-icon">
            <i class="fas fa-robot"></i>
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
        <div class="cosmic-card support-card featured">
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
        <div class="cosmic-card support-card">
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

      <!-- Coming Soon Section -->
      <div class="cosmic-card coming-soon-section">
        <div class="coming-soon-content">
          <h2>{{ $t('contact.support.comingSoon.title') }}</h2>
          <p>{{ $t('contact.support.comingSoon.description') }}</p>
          <div class="coming-soon-badge">
            <i class="fas fa-rocket"></i>
            Coming Soon
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
  padding: 8rem 2rem 4rem;
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.support-header {
  text-align: center;
  margin-bottom: 4rem;
  padding-top: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.animated-title {
  font-size: 3.5rem;
  font-weight: var(--weight-black);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  text-shadow: var(--shadow-text-medium);
  animation: fadeInDown 1s ease-out;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 1s ease-out 0.3s both;
  width: 100%;
  box-sizing: border-box;
}

.support-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.support-card {
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  backdrop-filter: blur(8px);
  border-radius: var(--radius-large);
  padding: 2.5rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fadeIn 1s ease-out;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.support-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent,
    var(--color-primary),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.support-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(15, 185, 253, 0.05) 50%,
    rgba(255, 145, 0, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.support-card:hover {
  transform: translateY(-4px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15),
              0 0 0 1px rgba(15, 185, 253, 0.1) inset;
}

.support-card:hover::before {
  opacity: 1;
}

.support-card:hover::after {
  opacity: 1;
}

.support-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.08);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.support-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1),
    rgba(15, 185, 253, 0.05)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.support-card:hover .support-icon {
  transform: scale(1.1);
  background: rgba(15, 185, 253, 0.12);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2),
              0 0 0 1px rgba(15, 185, 253, 0.2) inset;
}

.support-card:hover .support-icon::after {
  opacity: 1;
}

.support-icon i {
  font-size: 2rem;
  color: var(--color-primary);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.support-card:hover .support-icon i {
  transform: scale(1.1);
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

.support-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.support-content h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  font-weight: var(--weight-bold);
  text-shadow: var(--shadow-text-light);
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.support-content p {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
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
  max-width: 300px;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.cosmic-button.primary {
  background: var(--gradient-button);
  color: var(--color-text-primary);
  text-shadow: var(--shadow-text-light);
  box-shadow: var(--shadow-small),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.cosmic-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-primary),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  background: var(--gradient-button-hover);
}

.cosmic-button.primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.cosmic-button.primary:hover::before {
  left: 100%;
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
  opacity: 0.8;
}

.response-time i {
  font-size: 0.8rem;
  color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .support-options-grid {
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 768px) {
  .support-container {
    padding: 7rem 1rem 2rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .support-header {
    padding-top: 1rem;
    width: 100%;
    box-sizing: border-box;
  }

  .animated-title {
    font-size: 2.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .support-options-grid {
    grid-template-columns: 1fr;
    width: 100%;
    box-sizing: border-box;
    gap: 1.5rem;
  }

  .support-card {
    padding: 1.5rem;
    width: 100%;
    box-sizing: border-box;
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
    width: 100%;
    box-sizing: border-box;
  }

  .support-content p {
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }

  .cosmic-button {
    max-width: 90%;
    min-width: unset;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .coming-soon-section {
    margin-top: 2rem;
    padding: 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .coming-soon-content h2 {
    font-size: 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .coming-soon-content p {
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .support-container {
    padding: 6rem 0.75rem 1.5rem;
  }
  
  .animated-title {
    font-size: 2rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .support-card {
    padding: 1.25rem;
  }
  
  .support-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
  }
  
  .support-content h3 {
    font-size: 1.1rem;
  }
  
  .support-content p {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  .cosmic-button {
    font-size: 0.9rem;
    padding: 0.6rem 1.5rem;
  }
}

/* Featured Card Style - Enhanced */
.support-card.featured {
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.05) 50%,
    rgba(255, 145, 0, 0.08) 100%
  );
  border: 1px solid rgba(255, 145, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.support-card.featured::before {
  background: linear-gradient(90deg,
    transparent,
    var(--color-secondary),
    var(--color-primary),
    var(--color-secondary),
    transparent
  );
  opacity: 1;
  height: 2px;
}

.support-card.featured::after {
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1) 0%,
    rgba(255, 145, 0, 0.1) 100%
  );
}

.support-card.featured:hover {
  border-color: var(--color-secondary);
  box-shadow: 0 8px 30px rgba(255, 145, 0, 0.15),
              0 0 0 1px rgba(255, 145, 0, 0.2) inset;
}

.support-card.featured .support-icon {
  background: rgba(255, 145, 0, 0.1);
  border-color: rgba(255, 145, 0, 0.3);
}

.support-card.featured .support-icon::after {
  background: linear-gradient(135deg,
    rgba(255, 145, 0, 0.15),
    rgba(255, 145, 0, 0.05)
  );
}

.support-card.featured:hover .support-icon {
  background: rgba(255, 145, 0, 0.15);
  border-color: var(--color-secondary);
  box-shadow: 0 0 20px rgba(255, 145, 0, 0.25),
              0 0 0 1px rgba(255, 145, 0, 0.3) inset;
}

.support-card.featured:hover .support-icon i {
  color: var(--color-secondary);
  text-shadow: 0 0 10px rgba(255, 145, 0, 0.5);
}

/* Coming Soon Section - Enhanced */
.coming-soon-section {
  margin-top: 4rem;
  padding: 2rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border-radius: var(--radius-large);
  border: 1px solid rgba(15, 185, 253, 0.1);
  text-align: center;
  animation: slideIn 1.2s ease-out;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  box-sizing: border-box;
}

.coming-soon-section:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15),
              0 0 0 1px rgba(15, 185, 253, 0.1) inset;
}

.coming-soon-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.coming-soon-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: var(--weight-black);
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.coming-soon-content p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  width: 100%;
  box-sizing: border-box;
}

.coming-soon-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.05) 100%
  );
  border-radius: var(--radius-medium);
  color: var(--color-text-primary);
  font-weight: var(--weight-bold);
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.coming-soon-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.1),
    rgba(15, 185, 253, 0.05)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.coming-soon-badge:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2),
              0 0 0 1px rgba(15, 185, 253, 0.2) inset;
  transform: translateY(-2px);
}

.coming-soon-badge:hover::after {
  opacity: 1;
}

.coming-soon-badge i {
  color: var(--color-primary);
  animation: rocket-pulse 2s infinite;
  position: relative;
  z-index: 1;
}

.coming-soon-badge:hover i {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
}

@keyframes rocket-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 