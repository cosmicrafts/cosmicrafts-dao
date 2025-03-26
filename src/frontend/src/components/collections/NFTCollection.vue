<template>
  <div class="nft-collection cosmic-panel">
    <div class="nft-collection-header">
      <h2>{{ $t('wallet.nftCollection') }}</h2>
      
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.type"
          @click="$emit('update:modelValue', category.type)"
          class="category-tab"
          :class="{ active: modelValue === category.type }"
        >
          {{ category.title }}
          <span v-if="category.items.length > 0" class="item-count">{{ category.items.length }}</span>
        </button>
      </div>
    </div>
    
    <div class="nft-collection-content">
      <!-- Loading state -->
      <div v-if="currentCategory && currentCategory.isLoading" class="nft-loading">
        <div class="loading-spinner"></div>
        <div>{{ $t('wallet.loadingNfts') }}</div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!currentCategory || currentCategory.items.length === 0" class="nft-empty">
        <div>{{ $t('wallet.noNfts') }}</div>
      </div>
      
      <!-- NFT grid -->
      <div v-else class="nft-grid">
        <div 
          v-for="nft in currentCategory.items" 
          :key="nft.id"
          class="nft-card"
          @click="nft.metadata?.category === 'chests' ? $emit('open-chest', nft) : null"
          :class="{ clickable: nft.metadata?.category === 'chests' }"
        >
          <div class="nft-image">
            <img :src="nft.image" :alt="nft.name" />
            <div v-if="nft.metadata?.rarity" class="nft-rarity" :class="'rarity-' + nft.metadata.rarity">
              {{ getRarityLabel(nft.metadata.rarity) }}
            </div>
          </div>
          
          <div class="nft-info">
            <div class="nft-name">{{ nft.name }}</div>
            <div v-if="nft.metadata?.level" class="nft-level">{{ $t('wallet.level') }} {{ nft.metadata.level }}</div>
            
            <div v-if="nft.metadata?.category === 'chests'" class="open-chest-btn">
              {{ $t('wallet.openChest') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    default: 'all'
  }
});

// Emit events
const emit = defineEmits(['update:modelValue', 'open-chest']);

// Get the current category
const currentCategory = computed(() => {
  return props.categories.find(cat => cat.type === props.modelValue) || null;
});

// Get rarity label from numeric value
function getRarityLabel(rarity) {
  const rarityMap = {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary',
    6: 'Mythic',
    7: 'Divine'
  };
  
  return rarityMap[rarity] || 'Common';
}
</script>

<style scoped>
.nft-collection {
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--cosmic-shadow-sm);
  transition: all var(--cosmic-transition-medium);
  position: relative;
  overflow: hidden;
}

.nft-collection:hover {
  border-color: rgba(15, 185, 253, 0.25);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.nft-collection::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--cosmic-gradient-panel);
  opacity: 0.4;
  z-index: -1;
}

.nft-collection-header {
  margin-bottom: 20px;
}

.nft-collection-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  margin: 0 0 20px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}

.nft-collection-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--cosmic-blue), transparent);
  border-radius: 3px;
  box-shadow: var(--cosmic-glow-blue-sm);
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.category-tab {
  padding: 8px 16px;
  border-radius: var(--cosmic-radius-md);
  background: var(--cosmic-glass-bg-darker);
  border: 1px solid rgba(15, 185, 253, 0.15);
  color: var(--cosmic-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tab.active {
  background: var(--cosmic-gradient-blue-alpha);
  color: white;
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-1px);
}

.category-tab:hover:not(.active) {
  background: rgba(15, 185, 253, 0.05);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-1px);
}

.item-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.8rem;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.nft-collection-content {
  min-height: 220px;
}

.nft-loading, .nft-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  color: var(--cosmic-text-secondary);
  font-size: 1rem;
  text-align: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(15, 185, 253, 0.2);
  border-top-color: var(--cosmic-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 20px;
}

.nft-card {
  border-radius: var(--cosmic-radius-md);
  overflow: hidden;
  background: var(--cosmic-glass-bg-darker);
  border: 1px solid rgba(15, 185, 253, 0.15);
  transition: all var(--cosmic-transition-medium);
  box-shadow: var(--cosmic-shadow-sm);
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.nft-card.clickable {
  cursor: pointer;
}

.nft-card.clickable:hover {
  transform: translateY(-5px) translateZ(5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
}

.nft-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease-out;
}

.nft-card:hover .nft-image img {
  transform: scale(1.05);
}

.nft-rarity {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: var(--cosmic-radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.rarity-1 {
  color: #8E8E8E; /* Common */
  text-shadow: 0 0 5px rgba(142, 142, 142, 0.5);
}

.rarity-2 {
  color: #69D32C; /* Uncommon */
  text-shadow: 0 0 5px rgba(105, 211, 44, 0.5);
}

.rarity-3 {
  color: #3689FF; /* Rare */
  text-shadow: 0 0 5px rgba(54, 137, 255, 0.5);
}

.rarity-4 {
  color: #A82CFF; /* Epic */
  text-shadow: 0 0 5px rgba(168, 44, 255, 0.5);
}

.rarity-5 {
  color: #FF9426; /* Legendary */
  text-shadow: 0 0 5px rgba(255, 148, 38, 0.5);
}

.rarity-6 {
  color: #FF4776; /* Mythic */
  text-shadow: 0 0 5px rgba(255, 71, 118, 0.5);
}

.rarity-7 {
  color: #FFD700; /* Divine */
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.6);
}

.nft-info {
  padding: 16px;
}

.nft-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.nft-level {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
  margin-bottom: 12px;
}

.open-chest-btn {
  display: inline-block;
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--cosmic-gradient-blue-alpha);
  border-radius: var(--cosmic-radius-sm);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  text-align: center;
  box-shadow: var(--cosmic-shadow-sm);
}

.open-chest-btn:hover {
  box-shadow: var(--cosmic-shadow-sm), var(--cosmic-glow-blue-sm);
  transform: translateY(-1px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .nft-collection {
    padding: 20px;
  }
  
  .nft-collection-header h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
  }
  
  .category-tabs {
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .category-tab {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
  
  .nft-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
  
  .nft-info {
    padding: 12px;
  }
  
  .nft-name {
    font-size: 0.9rem;
  }
}
</style> 