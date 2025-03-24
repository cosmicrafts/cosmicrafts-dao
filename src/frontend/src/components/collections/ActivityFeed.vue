<template>
  <div class="activity-feed">
    <div class="activity-header">
      <h3 class="section-title">{{ $t('wallet.recentActivity') }}</h3>
      <button v-if="activities.length > 0" class="view-all-button" @click="$emit('view-all')">
        {{ $t('wallet.viewAll') }}
      </button>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">{{ $t('common.loading') }}</div>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <div class="error-message">{{ error }}</div>
      <button class="retry-button" @click="$emit('retry')">
        {{ $t('common.retry') }}
      </button>
    </div>
    
    <div v-else-if="activities.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-history"></i>
      </div>
      <div class="empty-text">{{ $t('wallet.noActivityYet') }}</div>
      <div class="empty-subtext">{{ $t('wallet.activityWillAppearHere') }}</div>
    </div>
    
    <div v-else class="activity-list">
      <div 
        v-for="(activity, index) in activities.slice(0, limit)" 
        :key="activity.id || index" 
        class="activity-item"
        :class="{ 
          'success': activity.status === 'success',
          'pending': activity.status === 'pending',
          'failed': activity.status === 'failed' 
        }"
      >
        <div class="activity-icon">
          <i :class="getActivityIcon(activity.type)"></i>
        </div>
        
        <div class="activity-details">
          <div class="activity-title">
            {{ getActivityTitle(activity) }}
          </div>
          
          <div class="activity-meta">
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            <span v-if="activity.status === 'pending'" class="activity-status pending">
              {{ $t('wallet.pending') }}
            </span>
            <span v-else-if="activity.status === 'failed'" class="activity-status failed">
              {{ $t('wallet.failed') }}
            </span>
          </div>
        </div>
        
        <div class="activity-value" :class="{ 'credit': activity.isCredit, 'debit': !activity.isCredit }">
          <span v-if="activity.type === 'transfer' || activity.type === 'receive'">
            {{ activity.isCredit ? '+' : '-' }} {{ formatAmount(activity.amount) }} {{ activity.symbol }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['view-all', 'retry']);

// Get icon based on activity type
function getActivityIcon(type) {
  const iconMap = {
    'transfer': 'fas fa-arrow-up',
    'receive': 'fas fa-arrow-down',
    'swap': 'fas fa-exchange-alt',
    'stake': 'fas fa-lock',
    'unstake': 'fas fa-unlock',
    'claim': 'fas fa-gift',
    'mint': 'fas fa-plus-circle',
    'burn': 'fas fa-fire',
    'addToken': 'fas fa-plus'
  };
  
  return iconMap[type] || 'fas fa-circle';
}

// Get activity title based on activity object
function getActivityTitle(activity) {
  const typeMap = {
    'transfer': activity.isCredit 
      ? `${activity.fromShort ? activity.fromShort : 'Unknown'} → ${activity.toShort ? activity.toShort : 'You'}`
      : `${activity.fromShort ? 'You' : 'Unknown'} → ${activity.toShort ? activity.toShort : 'Unknown'}`,
    'receive': `${activity.fromShort ? activity.fromShort : 'Unknown'} → ${activity.toShort ? 'You' : 'Unknown'}`,
    'swap': `${activity.fromSymbol} → ${activity.toSymbol}`,
    'stake': `${activity.symbol} ${activity.stakingProvider ? 'on ' + activity.stakingProvider : ''}`,
    'unstake': `${activity.symbol} ${activity.stakingProvider ? 'from ' + activity.stakingProvider : ''}`,
    'claim': `${activity.symbol} ${activity.source ? 'from ' + activity.source : ''}`,
    'mint': `${activity.symbol}`,
    'burn': `${activity.symbol}`,
    'addToken': `${activity.symbol || 'Token'}`
  };
  
  return typeMap[activity.type] || activity.type;
}

// Format time to relative or absolute based on how recent
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffSeconds = Math.floor((now - activityTime) / 1000);
  
  // Return relative time if less than a day old
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
  
  // Return formatted date if older
  const options = { month: 'short', day: 'numeric' };
  if (now.getFullYear() !== activityTime.getFullYear()) {
    options.year = 'numeric';
  }
  
  return activityTime.toLocaleDateString(undefined, options);
}

// Format amount with proper number of decimals
function formatAmount(amount) {
  if (!amount && amount !== 0) return '0';
  
  // Convert to number if string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // For small numbers, show more decimals
  if (Math.abs(numericAmount) < 0.01 && numericAmount !== 0) {
    return numericAmount.toFixed(8);
  }
  
  // For medium numbers, show fewer decimals
  if (Math.abs(numericAmount) < 1000) {
    return numericAmount.toFixed(4);
  }
  
  // For large numbers, use compact notation
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(numericAmount);
}
</script>

<style scoped>
.activity-feed {
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-bg-secondary, #16213e);
  border: 1px solid var(--color-border-highlight, rgba(255, 255, 255, 0.1));
}

.activity-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  background: rgba(0, 0, 0, 0.2);
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.view-all-button {
  background: none;
  border: none;
  color: var(--color-accent, #4169e1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s;
}

.view-all-button:hover {
  color: var(--color-accent-hover, #5a7ae2);
  text-decoration: underline;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-accent, #4169e1);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
}

.error-icon,
.empty-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.error-icon {
  color: var(--color-error, #ef4444);
}

.empty-icon {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.4));
}

.error-message {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.retry-button {
  padding: 8px 16px;
  background: var(--color-accent, #4169e1);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: var(--color-accent-hover, #5a7ae2);
}

.empty-text {
  color: var(--color-text-primary, #ffffff);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-subtext {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.9rem;
}

.activity-list {
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  transition: background-color 0.2s;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background-color: var(--color-bg-hover, rgba(255, 255, 255, 0.05));
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.activity-item.success .activity-icon {
  color: var(--color-success, #10b981);
}

.activity-item.pending .activity-icon {
  color: var(--color-warning, #f59e0b);
}

.activity-item.failed .activity-icon {
  color: var(--color-error, #ef4444);
}

.activity-details {
  flex: 1;
  min-width: 0;
}

.activity-title {
  color: var(--color-text-primary, #ffffff);
  font-size: 0.95rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-time {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.8rem;
}

.activity-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.activity-status.pending {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning, #f59e0b);
}

.activity-status.failed {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error, #ef4444);
}

.activity-value {
  font-size: 0.95rem;
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
  margin-left: 16px;
}

.activity-value.credit {
  color: var(--color-success, #10b981);
}

.activity-value.debit {
  color: var(--color-text-primary, #ffffff);
}

@media (max-width: 480px) {
  .activity-title {
    font-size: 0.9rem;
  }
  
  .activity-value {
    font-size: 0.9rem;
  }
  
  .activity-icon {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
}
</style> 