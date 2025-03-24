<template>
  <div class="activity-log cosmic-panel">
    <div class="form-header">
      <h3>Recent Activity</h3>
      <button class="icon-button" @click="showFullLog = !showFullLog">
        <i :class="showFullLog ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>
    </div>
    
    <div v-if="showFullLog" class="log-entries">
      <div v-if="logs.length === 0" class="empty-log">
        <div>No recent activity</div>
      </div>
      <div v-else v-for="(log, index) in logs" :key="index" class="log-entry">
        <span class="log-time">{{ log.time }}</span>
        <span :class="['log-message', log.type]">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ActivityLog',
  props: {
    logs: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    const showFullLog = ref(false);
    
    return {
      showFullLog
    };
  }
}
</script>

<style scoped>
.activity-log {
  padding: 16px;
  background: var(--cosmic-panel-bg, rgba(20, 20, 30, 0.5));
  border-radius: var(--radius-medium, 8px);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-primary, #0FB9FD);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary-light, #3DC5FD);
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
}

.log-entry {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-small, 4px);
  font-size: 0.9rem;
}

.log-time {
  color: var(--color-text-tertiary, #808080);
  margin-right: 8px;
  white-space: nowrap;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-message.info {
  color: var(--color-primary, #0FB9FD);
}

.log-message.success {
  color: var(--color-success, #4CAF50);
}

.log-message.warning {
  color: var(--color-warning, #FFC107);
}

.log-message.error {
  color: var(--color-error, #F44336);
}

.empty-log {
  text-align: center;
  padding: 24px;
  color: var(--color-text-tertiary, #808080);
  font-style: italic;
}
</style> 