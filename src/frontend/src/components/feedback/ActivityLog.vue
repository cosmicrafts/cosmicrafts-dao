<template>
  <div class="activity-log">
    <div class="log-header">
      <h3 class="section-title">{{ $t('wallet.activityLog') }}</h3>
      <button v-if="logs.length > 0" class="clear-button" @click="$emit('clear-logs')">
        {{ $t('wallet.clearLogs') }}
      </button>
    </div>
    
    <div v-if="logs.length === 0" class="empty-logs">
      <div class="empty-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <span class="empty-text">{{ $t('wallet.noLogs') }}</span>
    </div>
    
    <div v-else class="log-container">
      <div 
        v-for="(log, index) in logs" 
        :key="index" 
        class="log-entry"
        :class="{ 
          'info': log.type === 'info', 
          'success': log.type === 'success', 
          'error': log.type === 'error',
          'warning': log.type === 'warning'
        }"
      >
        <div class="log-icon">
          <i 
            class="fas" 
            :class="{
              'fa-info-circle': log.type === 'info',
              'fa-check-circle': log.type === 'success',
              'fa-exclamation-circle': log.type === 'error',
              'fa-exclamation-triangle': log.type === 'warning'
            }"
          ></i>
        </div>
        <div class="log-content">
          <div class="log-message">{{ log.message }}</div>
          <div class="log-time">{{ log.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LogEntry {
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  time: string;
}

const props = defineProps({
  logs: {
    type: Array as () => LogEntry[],
    default: () => []
  }
});

const emit = defineEmits(['clear-logs']);
</script>

<style scoped>
.activity-log {
  background: var(--color-bg-secondary, #16213e);
  border-radius: 12px;
  border: 1px solid var(--color-border-highlight, rgba(255, 255, 255, 0.1));
  margin-top: 16px;
  overflow: hidden;
}

.log-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.clear-button {
  background: none;
  border: none;
  color: var(--color-accent, #4169e1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s;
}

.clear-button:hover {
  color: var(--color-accent-hover, #5a7ae2);
  text-decoration: underline;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.4));
  margin-bottom: 12px;
}

.empty-text {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
}

.log-container {
  max-height: 250px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-accent, #4169e1) transparent;
}

.log-container::-webkit-scrollbar {
  width: 5px;
}

.log-container::-webkit-scrollbar-track {
  background: transparent;
}

.log-container::-webkit-scrollbar-thumb {
  background-color: var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  border-radius: 20px;
}

.log-entry {
  display: flex;
  align-items: flex-start;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
}

.log-entry:last-child {
  border-bottom: none;
}

.log-icon {
  margin-right: 12px;
  font-size: 1.1rem;
  padding-top: 2px;
}

.log-entry.info .log-icon {
  color: var(--color-info, #3b82f6);
}

.log-entry.success .log-icon {
  color: var(--color-success, #10b981);
}

.log-entry.error .log-icon {
  color: var(--color-error, #ef4444);
}

.log-entry.warning .log-icon {
  color: var(--color-warning, #f59e0b);
}

.log-content {
  flex: 1;
}

.log-message {
  color: var(--color-text-primary, #ffffff);
  font-size: 0.9rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.log-time {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.5));
  font-size: 0.8rem;
}

@media (max-width: 480px) {
  .log-entry {
    padding: 10px 16px;
  }
  
  .log-message {
    font-size: 0.85rem;
  }
}
</style> 