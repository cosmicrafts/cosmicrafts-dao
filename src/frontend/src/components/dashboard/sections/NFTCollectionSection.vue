<template>
  <section class="dashboard-section nft-collection cosmic-panel">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <div v-if="showCategories" class="actions">
        <div class="category-filter">
          <button 
            v-for="category in nftCategories" 
            :key="category"
            @click="currentCategory = category"
            :class="['filter-button', { active: currentCategory === category }]"
          >
            {{ formatCategory(category) }}
          </button>
        </div>
      </div>
      <slot name="header-actions"></slot>
    </div>

    <div :class="compact ? 'nft-preview-grid' : 'nft-grid'">
      <div v-if="loading" class="loading-nfts">
        <!-- Skeleton NFT Cards -->
        <div v-for="i in skeletonCount" :key="`skeleton-nft-${i}`" class="skeleton-card nft-skeleton">
          <div class="skeleton-image"></div>
          <div class="skeleton-nft-details">
            <div class="skeleton-nft-title"></div>
            <div class="skeleton-nft-subtitle"></div>
          </div>
        </div>
      </div>

      <template v-else-if="currentCategoryNFTs.length > 0">
        <NFTCard 
          v-for="nft in displayedNFTs" 
          :key="nft.id" 
          :nft="nft"
          @click="showNFTDetails(nft)"
        />
      </template>
      
      <div v-else class="empty-collection">
        <i class="fas fa-cubes"></i>
        <p>No {{ formatCategory(currentCategory) }} found in your collection</p>
        <slot name="empty-action">
          <button @click="navigateTo('/marketplace')" class="cosmic-button cosmic-button-sm">
            Browse Marketplace
          </button>
        </slot>
      </div>
    </div>
    
    <div v-if="showViewAll && currentCategoryNFTs.length > limit && limit > 0" class="view-all-container">
      <button @click="navigateTo('/collection')" class="view-all-btn">
        View All <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNftsStore } from '@/stores/nfts';
import NFTCard from '@/components/ui/cards/NFTCard.vue';

// Router for navigation
const router = useRouter();

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'NFT Collection'
  },
  compact: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 0 // 0 means no limit
  },
  showViewAll: {
    type: Boolean,
    default: true
  },
  showCategories: {
    type: Boolean,
    default: true
  },
  skeletonCount: {
    type: Number,
    default: 4
  },
  defaultCategory: {
    type: String,
    default: 'characters'
  }
});

// Emits
const emit = defineEmits(['nft-selected', 'category-changed']);

// NFTs store
const nftsStore = useNftsStore();

// Local state
const loading = ref(true);
const currentCategory = ref(props.defaultCategory);

// NFT Categories
const nftCategories = [
  'characters', 
  'units', 
  'avatars', 
  'trophies', 
  'chests'
];

// Format category name
const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Get NFTs for current category
const currentCategoryNFTs = computed(() => {
  return nftsStore.getCategoryNFTs(currentCategory.value) || [];
});

// Get displayed NFTs based on limit prop
const displayedNFTs = computed(() => {
  if (props.limit > 0) {
    return currentCategoryNFTs.value.slice(0, props.limit);
  }
  return currentCategoryNFTs.value;
});

// Methods
const navigateTo = (path) => {
  router.push(path);
};

const showNFTDetails = (nft) => {
  emit('nft-selected', nft);
  if (props.compact) {
    navigateTo(`/collection/${nft.id}`);
  }
};

// Load NFTs for initial category
const loadNFTs = async () => {
  loading.value = true;
  try {
    await nftsStore.fetchNFTsByCategory(currentCategory.value);
  } catch (error) {
    console.error('Error loading NFTs:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for category changes and load NFTs
watch(currentCategory, (newCategory) => {
  loadNFTs();
  emit('category-changed', newCategory);
});

// Initialize
onMounted(async () => {
  // Load NFTs for current category
  await loadNFTs();
  
  // Load all categories in the background for better UX
  try {
    await nftsStore.fetchNFTs();
  } catch (error) {
    console.error('Error loading all NFTs:', error);
  }
});
</script>

<style scoped>
/* NFT Collection Section */
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

/* NFT Grid Layouts */
.nft-preview-grid, .nft-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.nft-grid {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

.category-filter::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.filter-button {
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--cosmic-radius-sm);
  cursor: pointer;
  transition: all var(--cosmic-transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-button:hover {
  background: rgba(15, 185, 253, 0.1);
  color: var(--cosmic-blue);
}

.filter-button.active {
  background: rgba(15, 185, 253, 0.2);
  color: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

/* Loading States */
.loading-nfts {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* Empty Collection */
.empty-collection {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
  gap: 1rem;
}

.empty-collection i {
  font-size: 2.5rem;
  opacity: 0.5;
}

/* Skeleton Loading */
@keyframes skeleton-pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

@keyframes skeleton-shine {
  0% { left: -150px; }
  40%, 100% { left: 100%; }
}

.skeleton-card {
  border-radius: var(--cosmic-radius-md);
  background: rgba(15, 185, 253, 0.05);
  padding-bottom: 1rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  overflow: hidden;
  position: relative;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150px;
  width: 150px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  animation: skeleton-shine 2s ease-in-out infinite;
  pointer-events: none;
}

.skeleton-image {
  height: 140px;
  background: rgba(15, 185, 253, 0.1);
  margin-bottom: 0.8rem;
}

.skeleton-nft-details {
  padding: 0 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-nft-title {
  height: 1.2rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 70%;
}

.skeleton-nft-subtitle {
  height: 1rem;
  border-radius: 4px;
  background: rgba(15, 185, 253, 0.1);
  width: 50%;
}

/* View All Button */
.view-all-container {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.view-all-btn {
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

.view-all-btn:hover {
  background: rgba(15, 185, 253, 0.05);
  transform: translateY(-2px);
}

.view-all-btn i {
  font-size: 0.8rem;
}

/* Responsive Adjustments */
@media (min-width: 768px) {
  .nft-preview-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .loading-nfts {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions {
    width: 100%;
  }
  
  .category-filter {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-section {
    padding: 1rem;
  }
  
  .nft-preview-grid, .nft-grid, .loading-nfts {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  
  .skeleton-image {
    height: 120px;
  }
}
</style> 