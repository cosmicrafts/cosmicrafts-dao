<template>
  <div class="mission-card" :class="[rarity, { 'available': isAvailable, 'in-progress': isInProgress }]">
    <div class="mission-header">
      <div class="mission-title">
        <h3>{{ mission.name }}</h3>
        <span class="rarity-badge">{{ formatRarity(mission.rarity) }}</span>
      </div>
      <div class="mission-timer">
        <template v-if="isInProgress">
          <i class="fas fa-hourglass-half"></i>
          <span>{{ formatTimeRemaining(timeRemaining) }}</span>
        </template>
        <template v-else>
          <i class="fas fa-clock"></i>
          <span>{{ formatDuration(mission.duration) }}</span>
        </template>
      </div>
    </div>

    <div class="mission-content">
      <p class="mission-description">{{ mission.description }}</p>
      
      <div class="mission-details">
        <div class="requirements">
          <h4>Requirements</h4>
          <ul>
            <li>
              <i class="fas fa-user-astronaut"></i>
              <span>Level {{ mission.requirements.minLevel }}+</span>
            </li>
            <li v-if="mission.requirements.shipClass">
              <i class="fas fa-rocket"></i>
              <span>{{ mission.requirements.shipClass }}</span>
            </li>
            <li>
              <i class="fas fa-space-shuttle"></i>
              <span>{{ mission.requirements.numShips }} Ship(s)</span>
            </li>
            <li v-if="mission.requirements.specialItem">
              <i class="fas fa-gem"></i>
              <span>{{ mission.requirements.specialItem }}</span>
            </li>
          </ul>
        </div>
        
        <div class="rewards">
          <h4>Rewards</h4>
          <ul>
            <li v-if="mission.reward.tokenAmount > 0">
              <i class="fas fa-coins"></i>
              <span>{{ mission.reward.tokenAmount }} Tokens</span>
            </li>
            <li v-if="mission.reward.xpAmount > 0">
              <i class="fas fa-star"></i>
              <span>{{ mission.reward.xpAmount }} XP</span>
            </li>
            <li v-if="mission.reward.rareLoot">
              <i class="fas fa-gem"></i>
              <span>{{ mission.reward.rareLoot }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="mission-participation">
      <div class="participants">
        <i class="fas fa-users"></i>
        <span>{{ mission.currentParticipants }}/{{ mission.maxParticipants }}</span>
      </div>
      
      <button 
        v-if="isAvailable && !isInProgress" 
        class="accept-btn"
        :disabled="!canAccept"
        @click="acceptMission"
      >
        <i class="fas fa-check-circle"></i>
        <span>Accept</span>
      </button>
      
      <button 
        v-else-if="isInProgress && mission.status === 'ReadyToComplete'"
        class="complete-btn"
        @click="completeMission"
      >
        <i class="fas fa-trophy"></i>
        <span>Complete</span>
      </button>
      
      <div 
        v-else-if="isInProgress"
        class="in-progress-badge"
      >
        <i class="fas fa-sync-alt fa-spin"></i>
        <span>In Progress</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  mission: {
    type: Object,
    required: true
  },
  playerLevel: {
    type: Number,
    default: 1
  },
  playerShips: {
    type: Array,
    default: () => []
  },
  playerItems: {
    type: Array,
    default: () => []
  },
  inProgress: {
    type: Boolean,
    default: false
  },
  completesAt: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['accept', 'complete']);

// Timer for updating time remaining
const interval = ref(null);
const now = ref(Date.now());

// Calculate time remaining if mission is in progress
const timeRemaining = computed(() => {
  if (!props.inProgress || !props.completesAt) return 0;
  return Math.max(0, props.completesAt - now.value);
});

// Mission status computed properties
const isAvailable = computed(() => {
  return props.mission.status === 'Available' && 
         props.mission.currentParticipants < props.mission.maxParticipants;
});

const isInProgress = computed(() => {
  return props.inProgress;
});

// Check if player meets requirements
const canAccept = computed(() => {
  const reqs = props.mission.requirements;
  
  // Check player level
  if (props.playerLevel < reqs.minLevel) return false;
  
  // Check if player has enough ships
  if (props.playerShips.length < reqs.numShips) return false;
  
  // Check for specific ship class
  if (reqs.shipClass && !props.playerShips.some(ship => ship.class === reqs.shipClass)) return false;
  
  // Check for special item
  if (reqs.specialItem && !props.playerItems.includes(reqs.specialItem)) return false;
  
  return true;
});

// Convert rarity enum to display text
const formatRarity = (rarity) => {
  if (!rarity) return 'Common';
  
  // Remove the # symbol and capitalize
  const rarityStr = String(rarity).replace('#', '');
  return rarityStr.charAt(0).toUpperCase() + rarityStr.slice(1);
};

// Format duration in seconds to human-readable format
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Format time remaining in milliseconds to human-readable format
const formatTimeRemaining = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  return formatDuration(seconds);
};

// Mission actions
const acceptMission = () => {
  emit('accept', props.mission.id);
};

const completeMission = () => {
  emit('complete', props.mission.id);
};

// Keep time updated
onMounted(() => {
  interval.value = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value);
  }
});

// Computed for CSS class based on rarity
const rarity = computed(() => {
  if (!props.mission.rarity) return 'common';
  
  const rarityStr = String(props.mission.rarity).replace('#', '').toLowerCase();
  return rarityStr;
});
</script>

<style scoped>
.mission-card {
  background: rgba(15, 25, 40, 0.6);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(65, 95, 140, 0.2);
  position: relative;
}

.mission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Rarity styles */
.mission-card.common {
  border-color: rgba(180, 180, 180, 0.4);
}

.mission-card.uncommon {
  border-color: rgba(30, 255, 0, 0.4);
  box-shadow: 0 0 8px rgba(30, 255, 0, 0.15);
}

.mission-card.rare {
  border-color: rgba(0, 112, 255, 0.4);
  box-shadow: 0 0 12px rgba(0, 112, 255, 0.2);
}

.mission-card.epic {
  border-color: rgba(163, 53, 238, 0.5);
  box-shadow: 0 0 15px rgba(163, 53, 238, 0.25);
}

.mission-card.legendary {
  border-color: rgba(255, 128, 0, 0.6);
  box-shadow: 0 0 20px rgba(255, 128, 0, 0.3);
  background: linear-gradient(to bottom, rgba(30, 35, 50, 0.8), rgba(15, 25, 40, 0.8));
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.mission-title {
  display: flex;
  align-items: center;
}

.mission-title h3 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--cosmic-text-primary, #ffffff);
}

.rarity-badge {
  margin-left: 0.5rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.2);
}

.common .rarity-badge {
  background: rgba(180, 180, 180, 0.2);
  color: #c0c0c0;
}

.uncommon .rarity-badge {
  background: rgba(30, 255, 0, 0.1);
  color: #1eff00;
}

.rare .rarity-badge {
  background: rgba(0, 112, 255, 0.1);
  color: #0070ff;
}

.epic .rarity-badge {
  background: rgba(163, 53, 238, 0.1);
  color: #a335ee;
}

.legendary .rarity-badge {
  background: rgba(255, 128, 0, 0.1);
  color: #ff8000;
}

.mission-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-secondary, #a0a0b0);
  font-size: 0.85rem;
}

.mission-content {
  margin-bottom: 1rem;
}

.mission-description {
  margin-bottom: 1rem;
  color: var(--cosmic-text-secondary, #a0a0b0);
  font-size: 0.95rem;
  line-height: 1.5;
}

.mission-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.requirements h4, .rewards h4 {
  font-size: 0.9rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--cosmic-text-secondary, #a0a0b0);
}

.requirements ul, .rewards ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.requirements li, .rewards li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
}

.mission-participation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.participants {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-secondary, #a0a0b0);
  font-size: 0.85rem;
}

.accept-btn, .complete-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.accept-btn {
  background: rgba(0, 128, 255, 0.2);
  color: #0080ff;
}

.accept-btn:hover:not(:disabled) {
  background: rgba(0, 128, 255, 0.3);
}

.accept-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.complete-btn {
  background: rgba(0, 255, 128, 0.2);
  color: #00ff80;
}

.complete-btn:hover {
  background: rgba(0, 255, 128, 0.3);
}

.in-progress-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffcc00;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Animation for in-progress missions */
.mission-card.in-progress {
  border-color: rgba(255, 204, 0, 0.4);
  box-shadow: 0 0 15px rgba(255, 204, 0, 0.15);
}

@media (max-width: 768px) {
  .mission-details {
    grid-template-columns: 1fr;
  }
  
  .mission-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mission-title {
    margin-bottom: 0.5rem;
  }
}
</style> 