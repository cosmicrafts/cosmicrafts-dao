<template>
  <div class="roadmap-search">
    <div class="cosmic-panel search-container">
      <div class="search-input-wrapper">
        <input 
          v-model="searchQuery" 
          type="search" 
          class="search-input" 
          placeholder="Search roadmap..." 
          @input="emitFilterChanges"
          aria-label="Search roadmap items"
        >
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'SearchFilters',
  props: {
    availableYears: {
      type: Array,
      default: () => []
    },
    availableMilestones: {
      type: Array,
      default: () => []
    },
    availableTags: {
      type: Array,
      default: () => []
    }
  },
  emits: ['filter-changed'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedYear = ref('');
    const selectedMilestone = ref('');
    const selectedTags = ref([]);

    const emitFilterChanges = () => {
      emit('filter-changed', {
        searchQuery: searchQuery.value,
        selectedYear: selectedYear.value,
        selectedMilestone: selectedMilestone.value,
        selectedTags: selectedTags.value
      });
    };

    // Watch for changes in the search query
    watch(searchQuery, () => {
      emitFilterChanges();
    });

    return {
      searchQuery,
      selectedYear,
      selectedMilestone,
      selectedTags,
      emitFilterChanges
    };
  }
};
</script>

<style scoped>
.roadmap-search {
  width: 100%;
  margin-bottom: var(--space-lg);
}

.search-container {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-lg);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-sm);
  transition: all var(--cosmic-transition-medium);
}

.search-container:hover {
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.25);
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border);
  border-radius: var(--cosmic-radius-md);
  color: var(--cosmic-text-primary);
  padding: var(--space-md) var(--space-md) var(--space-md) 3rem;
  font-size: 1rem;
  transition: all var(--cosmic-transition-medium);
  outline: none;
}

.search-input:focus {
  border-color: rgba(15, 185, 253, 0.4);
  box-shadow: 0 0 0 2px rgba(15, 185, 253, 0.2), var(--cosmic-glow-blue-sm);
}

.search-input::placeholder {
  color: var(--cosmic-text-tertiary);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cosmic-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: color var(--cosmic-transition-fast);
}

.search-input:focus + .search-icon {
  color: var(--cosmic-blue-light);
  filter: drop-shadow(0 0 8px rgba(15, 185, 253, 0.5));
}

/* Responsive Styles */
@media (max-width: 768px) {
  .search-container {
    padding: var(--space-sm);
  }
  
  .search-input {
    padding: calc(var(--space-sm) + 2px) var(--space-sm) calc(var(--space-sm) + 2px) 2.5rem;
    font-size: 0.9rem;
  }
  
  .search-icon {
    left: 0.8rem;
  }
  
  .search-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style> 