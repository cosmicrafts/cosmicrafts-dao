<!-- ActivityFeedSection.vue -->
<template>
  <section class="dashboard-section activity-feed cosmic-panel">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <div class="actions">
        <button v-if="allowRefresh" @click="refreshActivities" class="cosmic-button-sm cosmic-button-outline-primary">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>
      
    <div class="activity-list">
      <div v-if="isLoading" class="activity-loading">
        <!-- Skeleton Loading -->
        <div v-for="i in 4" :key="`skeleton-activity-${i}`" class="activity-skeleton">
          <div class="skeleton-icon"></div>
          <div class="skeleton-content">
            <div class="skeleton-text"></div>
            <div class="skeleton-time"></div>
          </div>
        </div>
      </div>

      <div v-else-if="activities.length === 0" class="empty-activity">
        <i class="fas fa-history"></i>
        <p>No recent activity to display</p>
      </div>

      <template v-else>
        <div 
          v-for="(activity, index) in displayedActivities" 
          :key="index" 
          class="activity-item"
          :class="activity.type"
        >
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-text">{{ activity.text }}</div>
            <div class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</div>
          </div>
        </div>
      </template>
    </div>
    
    <div v-if="activities.length > limit && limit > 0" class="view-more-container">
      <button @click="viewMoreActivities" class="view-more-btn">
        View More <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Router for navigation
const router = useRouter();

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Recent Activity'
  },
  activities: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 0 // 0 means no limit
  },
  allowRefresh: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['refresh', 'view-more']);

// Local state
const isLoading = ref(false);
const isRefreshing = ref(false);

// Computed properties
const displayedActivities = computed(() => {
  if (props.limit > 0 && props.activities.length > props.limit) {
    return props.activities.slice(0, props.limit);
  }
  return props.activities;
});

// Activity icon mapping
const getActivityIcon = (type) => {
  const icons = {
    transfer: 'fas fa-exchange-alt',
    mint: 'fas fa-plus-circle',
    purchase: 'fas fa-shopping-cart',
    sale: 'fas fa-tag',
    game: 'fas fa-gamepad',
    reward: 'fas fa-gift',
    achievement: 'fas fa-trophy',
    message: 'fas fa-comment',
    default: 'fas fa-bell'
  };
  
  return icons[type] || icons.default;
};

// Time formatter
const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Convert to seconds
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  // Convert to minutes
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to days
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to months
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to years
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

// Methods
const refreshActivities = async () => {
  isRefreshing.value = true;
  
  try {
    await emit('refresh');
  } catch (error) {
    console.error('Error refreshing activities:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const viewMoreActivities = () => {
  emit('view-more');
  // Navigate to history or activity page if needed
  // router.push('/activities');
};
</script>

<style scoped>
/* Activity Feed Styling */
.dashboard-section {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.section-header h2 {
  font-size: 1.2rem;
  margin: 0;
  color: var(--cosmic-text-primary);
  font-weight: 700;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  transition: all var(--cosmic-transition-fast);
  border-left: 3px solid transparent;
}

.activity-item:hover {
  background: rgba(15, 185, 253, 0.1);
  transform: translateX(3px);
}

/* Activity type styling */
.activity-item.transfer {
  border-left-color: var(--cosmic-blue);
}

.activity-item.mint {
  border-left-color: var(--cosmic-green);
}

.activity-item.game {
  border-left-color: var(--cosmic-purple);
}

.activity-item.reward {
  border-left-color: var(--cosmic-orange);
}

.activity-item.achievement {
  border-left-color: var(--cosmic-gold);
}

.activity-item.sale {
  border-left-color: var(--cosmic-red);
}

.activity-item.purchase {
  border-left-color: var(--cosmic-green);
}

.activity-item.message {
  border-left-color: var(--cosmic-teal);
}

/* Activity Icons */
.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
  flex-shrink: 0;
}

.activity-icon.transfer {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.activity-icon.mint {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
}

.activity-icon.game {
  background: rgba(157, 53, 191, 0.1);
  color: var(--cosmic-purple);
}

.activity-icon.reward {
  background: rgba(255, 145, 0, 0.1);
  color: var(--cosmic-orange);
}

.activity-icon.achievement {
  background: rgba(255, 215, 0, 0.1);
  color: gold;
}

.activity-icon.sale {
  background: rgba(255, 0, 76, 0.1);
  color: var(--cosmic-red);
}

.activity-icon.purchase {
  background: rgba(0, 229, 164, 0.1);
  color: var(--cosmic-green);
}

.activity-icon.message {
  background: rgba(0, 184, 156, 0.1);
  color: var(--cosmic-teal);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-text {
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
}

/* Empty State */
.empty-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.empty-activity i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Skeleton Loading */
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

.activity-loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.activity-skeleton {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-text {
  height: 1rem;
  width: 80%;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
}

.skeleton-time {
  height: 0.8rem;
  width: 40%;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
}

/* View More Button */
.view-more-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.view-more-btn {
  background: transparent;
  border: none;
  color: var(--cosmic-blue);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: var(--cosmic-radius-sm);
  transition: all var(--cosmic-transition-fast);
}

.view-more-btn:hover {
  background: rgba(15, 185, 253, 0.05);
  transform: translateY(-2px);
}

.view-more-btn i {
  font-size: 0.8rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .dashboard-section {
    padding: 1rem;
  }
  
  .activity-item {
    padding: 0.6rem;
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}
</style> 