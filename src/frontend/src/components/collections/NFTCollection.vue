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
  border-radius: 12px;
  background: var(--color-bg-secondary, #16213e);
  padding: 20px;
  margin-bottom: 16px;
}

.nft-collection-header {
  margin-bottom: 16px;
}

.nft-collection-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  margin: 0 0 16px 0;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.category-tab {
  padding: 6px 12px;
  border-radius: 16px;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tab.active {
  background: var(--color-accent, #4169e1);
  color: white;
  border-color: var(--color-accent, #4169e1);
}

.category-tab:hover:not(.active) {
  background: var(--color-bg-hover, rgba(255, 255, 255, 0.1));
}

.item-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  font-size: 0.75rem;
}

.nft-collection-content {
  min-height: 200px;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.nft-card {
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  transition: all 0.2s ease;
}

.nft-card.clickable {
  cursor: pointer;
}

.nft-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-color: var(--color-border-highlight, rgba(255, 255, 255, 0.2));
}

.nft-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-rarity {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.7);
}

.rarity-1 {
  color: #8E8E8E; /* Common */
}

.rarity-2 {
  color: #69D32C; /* Uncommon */
}

.rarity-3 {
  color: #3689FF; /* Rare */
}

.rarity-4 {
  color: #A82CFF; /* Epic */
}

.rarity-5 {
  color: #FF9426; /* Legendary */
}

.rarity-6 {
  color: #FF4776; /* Mythic */
}

.rarity-7 {
  color: #FFD700; /* Divine */
}

.nft-info {
  padding: 12px;
}

.nft-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  margin-bottom: 4px;
}

.nft-level {
  font-size: 0.8rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}

.open-chest-btn {
  margin-top: 8px;
  padding: 6px 0;
  border-radius: 4px;
  background: var(--color-accent, #4169e1);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.2s;
}

.open-chest-btn:hover {
  background-color: var(--color-accent-hover, #5a7ae2);
}

.nft-loading, .nft-empty {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  text-align: center;
  gap: 16px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-accent, #4169e1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .nft-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 