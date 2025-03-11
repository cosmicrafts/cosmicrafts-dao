<template>
  <div class="search-filter-container" role="search" aria-label="Search and filter roadmap">
    <div class="search-input-wrapper">
      <div class="search-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input 
        type="text" 
        class="search-input cosmic-input" 
        placeholder="Search milestones or tasks..." 
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        aria-label="Search roadmap items"
      >
    </div>
    <div class="filter-wrapper">
      <select 
        class="filter-select cosmic-select" 
        :value="selectedYear" 
        @change="$emit('update:selectedYear', $event.target.value)"
        aria-label="Filter by year"
      >
        <option value="">All Years</option>
        <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
      </select>
      <select 
        class="filter-select cosmic-select" 
        :value="selectedMilestone" 
        @change="$emit('update:selectedMilestone', $event.target.value)"
        aria-label="Filter by milestone"
      >
        <option value="">All Milestones</option>
        <option v-for="milestone in availableMilestones" :key="milestone" :value="milestone">{{ milestone }}</option>
      </select>
    </div>
    
    <!-- Tags Filter Bar -->
    <div class="tags-filter-container">
      <h3 class="tags-title">Filter by Tags:</h3>
      <div class="tags-wrapper">
        <button 
          v-for="tag in availableTags" 
          :key="tag" 
          class="tag-button" 
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTagFilter(tag)"
          :aria-pressed="selectedTags.includes(tag).toString()"
        >
          <span class="tag-dot" :style="{ background: getTagColor(tag) }"></span>
          {{ tag }}
        </button>
      </div>
      <button 
        v-if="selectedTags.length > 0" 
        class="clear-tags-button"
        @click="clearTagFilters"
        aria-label="Clear all tag filters"
      >
        <span class="clear-icon">×</span> Clear All
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapSearch',
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    selectedYear: {
      type: String,
      default: ''
    },
    selectedMilestone: {
      type: String,
      default: ''
    },
    selectedTags: {
      type: Array,
      default: () => []
    },
    availableYears: {
      type: Array,
      required: true
    },
    availableMilestones: {
      type: Array,
      required: true
    },
    availableTags: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      tagColors: {
        'Frontend': '#0FB9FD',
        'Backend': '#5865F2',
        'DevOps': '#C92AFD',
        'Design': '#FD4D4D',
        'Research': '#00D26A',
        'Testing': '#F9A825',
        'Documentation': '#9C27B0',
        'Infrastructure': '#607D8B',
        'Security': '#FF3D00',
        'UX': '#009688',
        'API': '#3F51B5',
        'Database': '#795548',
        'Performance': '#FF9800',
        'Accessibility': '#8BC34A',
        'Mobile': '#E91E63'
      }
    };
  },
  methods: {
    toggleTagFilter(tag) {
      const newTags = [...this.selectedTags];
      const index = newTags.indexOf(tag);
      if (index > -1) {
        newTags.splice(index, 1);
      } else {
        newTags.push(tag);
      }
      this.$emit('update:selectedTags', newTags);
    },
    clearTagFilters() {
      this.$emit('update:selectedTags', []);
    },
    getTagColor(tag) {
      return this.tagColors[tag] || '#0FB9FD';
    }
  }
};
</script>

<style scoped>
.search-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: rgba(15, 25, 45, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(15, 185, 253, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(15, 185, 253, 0.7);
}

.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  background: rgba(10, 17, 35, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: rgba(15, 185, 253, 0.6);
  outline: none;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2), inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.filter-wrapper {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.85rem 1.5rem 0.85rem 1rem;
  background: rgba(10, 17, 35, 0.6);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  min-width: 170px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(15, 185, 253, 0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.filter-select:focus {
  border-color: rgba(15, 185, 253, 0.6);
  outline: none;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
}

/* Tags Filter */
.tags-filter-container {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(15, 25, 45, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(15, 185, 253, 0.15);
  width: 100%;
}

.tags-title {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.tag-button {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: rgba(15, 25, 45, 0.5);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 30px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.tag-button:hover {
  background: rgba(15, 25, 45, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.tag-button.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.5);
  color: #fff;
  box-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
}

.tag-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.clear-tags-button {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 75, 75, 0.1);
  border: 1px solid rgba(255, 75, 75, 0.3);
  border-radius: 30px;
  color: rgba(255, 150, 150, 0.9);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-tags-button:hover {
  background: rgba(255, 75, 75, 0.2);
  color: rgba(255, 200, 200, 1);
}

.clear-icon {
  font-size: 1.2rem;
  margin-right: 0.3rem;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .search-filter-container {
    flex-direction: column;
    padding: 1.25rem;
  }

  .tags-filter-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .tags-wrapper {
    margin-top: 0.5rem;
  }

  .clear-tags-button {
    margin-top: 0.5rem;
    align-self: flex-start;
  }
}
</style> 