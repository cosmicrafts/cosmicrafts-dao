<template>
  <div class="nft-card cosmic-card" @click="$emit('click', nft)">
    <div class="nft-image">
      <img :src="nft.image || defaultImage" :alt="nft.name" />
      <div v-if="nft.rarity" class="nft-rarity" :class="`rarity-${nft.rarity}`">
        {{ getRarityLabel(nft.rarity) }}
      </div>
    </div>
    
    <div class="nft-info">
      <h3 class="nft-name">{{ nft.name || `#${nft.tokenId}` }}</h3>
      <p v-if="nft.collection" class="nft-collection">{{ nft.collection }}</p>
      
      <div class="nft-details">
        <div v-if="showPrice && nft.price" class="nft-price">
          {{ formatPrice(nft.price) }} {{ nft.currency || 'ICP' }}
        </div>
        <div v-if="nft.tokenId" class="nft-id">ID: {{ nft.tokenId }}</div>
      </div>
      
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  nft: {
    type: Object,
    required: true
  },
  showPrice: {
    type: Boolean,
    default: true
  },
  defaultImage: {
    type: String,
    default: '/assets/images/nft-placeholder.png'
  }
});

defineEmits(['click']);

// Get rarity label based on numeric value
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

// Format price with appropriate decimal places
function formatPrice(price) {
  if (!price) return '0';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // For ICP or other cryptocurrencies, show 4 decimal places
  return numPrice.toFixed(4);
}
</script>

<style scoped>
.nft-card {
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-surface-primary, #1a1a2e);
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.1));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.nft-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 0 8px rgba(5, 163, 204, 0.3);
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
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.7);
}

.rarity-1 { color: #8E8E8E; } /* Common */
.rarity-2 { color: #69D32C; } /* Uncommon */
.rarity-3 { color: #3689FF; } /* Rare */
.rarity-4 { color: #A82CFF; } /* Epic */
.rarity-5 { color: #FF9426; } /* Legendary */
.rarity-6 { color: #FF4776; } /* Mythic */
.rarity-7 { color: #FFD700; } /* Divine */

.nft-info {
  padding: 1rem;
}

.nft-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary, #ffffff);
}

.nft-collection {
  font-size: 0.85rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
  margin: 0 0 0.75rem 0;
}

.nft-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.nft-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.nft-id {
  font-size: 0.8rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}
</style> 