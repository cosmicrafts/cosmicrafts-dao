<template>
  <div class="search-filters">
    <div class="filters-header">
      <h2>Explore Our Roadmap</h2>
      <p>Track our progress and discover upcoming features</p>
    </div>

    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Search milestones or features..."
        @input="emitFilterChange"
      >
      <div class="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>

    <div class="filter-controls">
      <select 
        v-model="selectedYear" 
        @change="emitFilterChange"
        class="year-filter"
      >
        <option value="">All Years</option>
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>

      <select 
        v-model="selectedMilestone" 
        @change="emitFilterChange"
        class="milestone-filter"
      >
        <option value="">All Milestones</option>
        <option v-for="milestone in milestones" :key="milestone" :value="milestone">
          {{ milestone }}
        </option>
      </select>
    </div>

    <div class="tags-section">
      <div class="tags-header">
        <h3>Filter by Category</h3>
        <button @click="clearTags" class="clear-tags" v-if="selectedTags.length">
          Clear All
        </button>
      </div>
      
      <div class="tags-container">
        <button 
          v-for="tag in tags" 
          :key="tag"
          @click="toggleTag(tag)"
          :class="['tag-button', { active: selectedTags.includes(tag) }]"
        >
          {{ tag }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'SearchFilters',
  props: {
    years: {
      type: Array,
      default: () => []
    },
    milestones: {
      type: Array,
      default: () => []
    },
    tags: {
      type: Array,
      default: () => [
        'Gameplay', 'NFTs', 'Smart Contracts', 'UI/UX', 
        'Infrastructure', 'Community', 'Tokenomics', 'Security'
      ]
    }
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedYear = ref('');
    const selectedMilestone = ref('');
    const selectedTags = ref([]);

    const toggleTag = (tag) => {
      const index = selectedTags.value.indexOf(tag);
      if (index === -1) {
        selectedTags.value.push(tag);
      } else {
        selectedTags.value.splice(index, 1);
      }
      emitFilterChange();
    };

    const clearTags = () => {
      selectedTags.value = [];
      emitFilterChange();
    };

    const emitFilterChange = () => {
      emit('filter-change', {
        search: searchQuery.value,
        year: selectedYear.value,
        milestone: selectedMilestone.value,
        tags: selectedTags.value
      });
    };

    return {
      searchQuery,
      selectedYear,
      selectedMilestone,
      selectedTags,
      toggleTag,
      clearTags,
      emitFilterChange
    };
  }
};
</script>

<style scoped>
.search-filters {
  background: rgba(13, 18, 38, 0.7);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.filters-header {
  text-align: center;
  margin-bottom: 2rem;
}

.filters-header h2 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, #0fb9fd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.filters-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-bar input {
  width: 100%;
  padding: 1rem 3rem 1rem 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.4);
  background: rgba(15, 25, 45, 0.6);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.1);
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.year-filter,
.milestone-filter {
  flex: 1;
  padding: 0.8rem 1rem;
  background: rgba(15, 25, 45, 0.4);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.year-filter:focus,
.milestone-filter:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.4);
  background: rgba(15, 25, 45, 0.6);
}

.tags-section {
  margin-top: 2rem;
}

.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tags-header h3 {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.clear-tags {
  background: none;
  border: none;
  color: rgba(15, 185, 253, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.clear-tags:hover {
  color: rgba(15, 185, 253, 1);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.tag-button {
  padding: 0.5rem 1rem;
  background: rgba(15, 25, 45, 0.4);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-button:hover {
  background: rgba(15, 25, 45, 0.6);
  border-color: rgba(15, 185, 253, 0.4);
  transform: translateY(-2px);
}

.tag-button.active {
  background: rgba(15, 185, 253, 0.2);
  border-color: rgba(15, 185, 253, 0.6);
  color: #fff;
}

@media (max-width: 768px) {
  .search-filters {
    padding: 1.5rem;
  }

  .filters-header h2 {
    font-size: 1.5rem;
  }

  .filter-controls {
    flex-direction: column;
  }

  .tags-container {
    gap: 0.5rem;
  }

  .tag-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style> 