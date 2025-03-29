<template>
  <div class="test-notifications">
    <h1>Notification Systems Test</h1>
    
    <div class="section-intro">
      <p>Compare both notification systems to decide which one to keep or combine features.</p>
    </div>
    
    <div class="systems-container">
      <div class="system-section">
        <h2>NotificationSystem (via Store)</h2>
        <p>This is the current global notification system using <code>NotificationStore</code>.</p>
        <div class="controls">
          <button @click="showStoreNotification('info')" class="cosmic-button cosmic-button-info">Info</button>
          <button @click="showStoreNotification('success')" class="cosmic-button cosmic-button-success">Success</button>
          <button @click="showStoreNotification('warning')" class="cosmic-button cosmic-button-warning">Warning</button>
          <button @click="showStoreNotification('error')" class="cosmic-button cosmic-button-error">Error</button>
        </div>
        <NotificationSystem position="top-left" />
      </div>
      
      <div class="system-section">
        <h2>ToastNotificationSystem (Direct)</h2>
        <p>This is the component-level toast system.</p>
        <div class="controls">
          <button @click="showToast('info')" class="cosmic-button cosmic-button-info">Info</button>
          <button @click="showToast('success')" class="cosmic-button cosmic-button-success">Success</button>
          <button @click="showToast('warning')" class="cosmic-button cosmic-button-warning">Warning</button>
          <button @click="showToast('error')" class="cosmic-button cosmic-button-error">Error</button>
          <button @click="showToastWithActions()" class="cosmic-button cosmic-button-primary">With Actions</button>
        </div>
        <ToastNotificationSystem ref="toastSystem" position="top-right" />
      </div>
    </div>
    
    <div class="system-section">
      <h2>ToastNotificationSystem (via Store)</h2>
      <p>This tests the same toast component but accessed through a global store.</p>
      <div class="controls">
        <button @click="showGlobalToast('info')" class="cosmic-button cosmic-button-info">Info</button>
        <button @click="showGlobalToast('success')" class="cosmic-button cosmic-button-success">Success</button>
        <button @click="showGlobalToast('warning')" class="cosmic-button cosmic-button-warning">Warning</button>
        <button @click="showGlobalToast('error')" class="cosmic-button cosmic-button-error">Error</button>
        <button @click="showGlobalToastWithActions()" class="cosmic-button cosmic-button-primary">With Actions</button>
      </div>
      <ToastNotificationSystem ref="globalToastSystem" position="bottom-right" />
    </div>
    
    <div class="comparison-table">
      <h2>Feature Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>NotificationSystem</th>
            <th>ToastNotificationSystem</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Global Store Access</td>
            <td>✅</td>
            <td>✅ (with new toast store)</td>
          </tr>
          <tr>
            <td>Custom Types</td>
            <td>🔵 Basic (info, success, warning, error)</td>
            <td>✅ Extended (includes achievement, reward, etc.)</td>
          </tr>
          <tr>
            <td>Interactive Elements</td>
            <td>❌</td>
            <td>✅ Action buttons</td>
          </tr>
          <tr>
            <td>Progress Indicator</td>
            <td>✅</td>
            <td>✅</td>
          </tr>
          <tr>
            <td>API Methods</td>
            <td>🔵 Basic</td>
            <td>✅ Extended (update, dismiss)</td>
          </tr>
          <tr>
            <td>Animation Quality</td>
            <td>🔵 Simple</td>
            <td>✅ Better</td>
          </tr>
          <tr>
            <td>Custom Positions</td>
            <td>✅</td>
            <td>✅</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NotificationSystem from '@/components/ui/notifications/NotificationSystem.vue';
import ToastNotificationSystem from '@/components/dashboard/ui/ToastNotificationSystem.vue';
import { useNotificationStore } from '@/stores/notification';
import { useToastStore } from '@/stores/toast';

const notificationStore = useNotificationStore();
const toastStore = useToastStore();
const toastSystem = ref(null);
const globalToastSystem = ref(null);

// For NotificationSystem
function showStoreNotification(type) {
  notificationStore.showNotification({
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
    message: `This is a ${type} notification from the notification store.`,
    type: type,
    duration: 5000
  });
}

// For ToastNotificationSystem (direct reference)
function showToast(type) {
  toastSystem.value.showToast({
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
    message: `This is a ${type} toast notification with progress bar.`,
    type: type,
    duration: 5000,
    showProgress: true
  });
}

function showToastWithActions() {
  toastSystem.value.showToast({
    title: 'Toast with Actions',
    message: 'This toast has action buttons that you can click.',
    type: 'info',
    duration: 10000,
    showProgress: true,
    actions: [
      { label: 'Accept', dismissOnClick: true },
      { label: 'Dismiss', dismissOnClick: true }
    ]
  });
}

// For ToastNotificationSystem (via store)
function showGlobalToast(type) {
  toastStore.showToast({
    title: `Global ${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
    message: `This is a ${type} toast notification accessed through the global toast store.`,
    type: type,
    duration: 5000,
    showProgress: true
  });
}

function showGlobalToastWithActions() {
  toastStore.showToast({
    title: 'Global Toast with Actions',
    message: 'This toast demonstrates the global store access with actions.',
    type: 'info',
    duration: 10000,
    showProgress: true,
    actions: [
      { label: 'Accept', dismissOnClick: true },
      { label: 'Cancel', dismissOnClick: true }
    ]
  });
}

onMounted(() => {
  // Register the global toast system with the store
  toastStore.setToastSystem(globalToastSystem.value);
});
</script>

<style scoped>
.test-notifications {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 1rem;
  text-align: center;
}

.section-intro {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--cosmic-text-secondary);
}

.systems-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.system-section {
  padding: 1.5rem;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-lg);
  border: 1px solid rgba(15, 185, 253, 0.2);
  margin-bottom: 2rem;
}

.system-section p {
  color: var(--cosmic-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  text-align: center;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.cosmic-button-info {
  background-color: var(--cosmic-blue);
}

.cosmic-button-success {
  background-color: #0dce63;
}

.cosmic-button-warning {
  background-color: #ff9800;
}

.cosmic-button-error {
  background-color: #ff5252;
}

/* Comparison table */
.comparison-table {
  margin-top: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
}

th {
  background-color: rgba(15, 185, 253, 0.1);
  font-weight: 600;
}

tr:last-child td {
  border-bottom: none;
}

code {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .systems-container {
    grid-template-columns: 1fr;
  }
  
  th, td {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}
</style> 