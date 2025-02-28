<template>
  <div class="nft-card" :class="[cardCategory, { 'has-soul': hasSoul }]">
    <div class="nft-image-container">
      <!-- Show skeleton loader while loading -->
      <div v-if="imageLoading" class="skeleton-loader" />
      
      <!-- Show error state -->
      <div v-else-if="imageError" class="error-state">
        <i class="fas fa-exclamation-circle" />
        <span>Failed to load image</span>
      </div>
      
      <!-- Show image when loaded -->
      <img
        v-else
        :src="imageSrc"
        :alt="nft.name"
        class="nft-image"
        loading="lazy"
        @error="handleImageError"
      />
      <div class="nft-overlay">
        <div class="nft-rarity" :class="'rarity-' + nftRarity">
          {{ getRarityLabel(nftRarity) }}
        </div>
        <div v-if="nftFaction" class="nft-faction" :class="nftFaction">
          {{ nftFaction }}
        </div>
      </div>
    </div>
    
    <div class="nft-info">
      <h3 class="nft-name">{{ nft.name }}</h3>
      <p class="nft-description">{{ nft.description }}</p>
      
      <!-- Stats Section -->
      <div class="nft-stats" v-if="hasStats">
        <div class="stat">
          <span class="stat-label">Level</span>
          <span class="stat-value">{{ nftLevel }}</span>
        </div>
        <div class="stat" v-if="nftDamage">
          <span class="stat-label">Damage</span>
          <span class="stat-value">{{ nftDamage }}</span>
        </div>
        <div class="stat" v-if="nftHealth">
          <span class="stat-label">Health</span>
          <span class="stat-value">{{ nftHealth }}</span>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="nft-skills" v-if="hasSkills">
        <h4>Skills</h4>
        <div class="skills-list">
          <span 
            v-for="skill in nftSkills" 
            :key="skill"
            class="skill-badge"
            :class="skill"
          >
            {{ formatSkillName(skill) }}
          </span>
        </div>
      </div>

      <!-- Soul Stats Section -->
      <div class="nft-soul" v-if="hasSoul">
        <h4>Soul Stats</h4>
        <div class="soul-stats">
          <div class="stat">
            <span class="stat-label">Games</span>
            <span class="stat-value">{{ soulGamesPlayed }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Kills</span>
            <span class="stat-value">{{ soulTotalKills }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">XP</span>
            <span class="stat-value">{{ soulCombatExperience }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { assetManager } from '@/services/AssetManager';

const props = defineProps({
  nft: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: 'Unknown NFT',
      description: '',
      image: '/assets/webp/chest.webp',
      metadata: {
        category: 'unknown',
        rarity: 1,
        level: 1,
        damage: 0,
        health: 0,
        skills: [],
        soul: null
      }
    })
  }
});

const imageLoading = ref(true);
const imageError = ref(false);
const imageSrc = ref('');

// Load the image using the asset manager
onMounted(async () => {
  try {
    imageLoading.value = true;
    imageSrc.value = await assetManager.getAsset(
      props.nft.metadata.category,
      props.nft.name
    );
  } catch (error) {
    console.error('Failed to load NFT image:', error);
    imageError.value = true;
  } finally {
    imageLoading.value = false;
  }
});

// Computed properties for safe access to NFT data
const cardCategory = computed(() => props.nft.metadata?.category || 'unknown');
const nftRarity = computed(() => props.nft.metadata?.rarity || 1);
const nftFaction = computed(() => props.nft.metadata?.faction);
const nftLevel = computed(() => props.nft.metadata?.level || 1);
const nftDamage = computed(() => props.nft.metadata?.damage);
const nftHealth = computed(() => props.nft.metadata?.health);
const nftSkills = computed(() => props.nft.metadata?.skills || []);
const hasSoul = computed(() => Boolean(props.nft.metadata?.soul));
const hasSkills = computed(() => nftSkills.value.length > 0);

// Soul stats with safe access
const soulGamesPlayed = computed(() => props.nft.metadata?.soul?.gamesPlayed || 0);
const soulTotalKills = computed(() => props.nft.metadata?.soul?.totalKills || 0);
const soulCombatExperience = computed(() => props.nft.metadata?.soul?.combatExperience || 0);

const hasStats = computed(() => {
  return nftLevel.value > 1 || nftDamage.value > 0 || nftHealth.value > 0;
});

function getRarityLabel(rarity) {
  const labels = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary'
  };
  return labels[rarity] || 'Unknown';
}

function formatSkillName(skill) {
  return skill.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function handleImageError(event) {
  event.target.src = '/assets/webp/chest.webp';
}
</script>

<style scoped>
.nft-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.nft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.nft-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
}

.nft-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
}

.nft-rarity {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: bold;
  text-transform: uppercase;
}

.rarity-1 { background: #7E7E7E; }
.rarity-2 { background: #4CAF50; }
.rarity-3 { background: #2196F3; }
.rarity-4 { background: #9C27B0; }
.rarity-5 { 
  background: linear-gradient(45deg, #FFD700, #FFA500);
  animation: shine 2s linear infinite;
}

.nft-faction {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.5);
}

.nft-info {
  padding: 16px;
}

.nft-name {
  margin: 0 0 8px;
  font-size: 1.2em;
  font-weight: bold;
}

.nft-description {
  margin: 0 0 16px;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
}

.nft-stats, .soul-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.stat-label {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-size: 1.1em;
  font-weight: bold;
}

.nft-skills h4, .nft-soul h4 {
  margin: 0 0 8px;
  font-size: 1em;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  background: rgba(255, 255, 255, 0.1);
}

/* Category-specific styles */
.avatars { border: 2px solid #4CAF50; }
.units { border: 2px solid #2196F3; }
.trophies { border: 2px solid #FFD700; }
.chests { border: 2px solid #9C27B0; }

/* Faction-specific colors */
.cosmicon { background: #FF5722; }
.spade { background: #673AB7; }
.arch { background: #2196F3; }
.celestial { background: #FFC107; }
.webe { background: #4CAF50; }
.neutral { background: #9E9E9E; }
.spirat { background: #F44336; }

/* Soul animation */
.has-soul {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes shine {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
  100% { filter: brightness(1); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

/* Add these new styles */
.skeleton-loader {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.5rem;
}

.error-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  gap: 0.5rem;
  border-radius: 0.5rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style> 