<template>
  <div class="cosmic-navigator">
    <!-- Main Navigation Panel -->
    <div class="navigator-panel">
      <!-- Search Scanner -->
      <div class="search-scanner">
        <div class="search-field">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Scan for features, milestones, technologies..."
            @input="emitFilterChange"
            aria-label="Search roadmap features"
          >
          <div class="search-icon pulse-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        <div class="search-radar" v-if="searchQuery.length > 0">
          <div class="radar-ping"></div>
          <div class="search-status">Scanning cosmic regions...</div>
        </div>
      </div>
      
      <!-- Timeline Navigator -->
      <div class="timeline-navigator">
        <div class="navigator-label">
          <span>Cosmic Timeline</span>
          <div class="navigator-legend">
            <span class="legend-item past">
              <span class="legend-dot"></span>
              Past
            </span>
            <span class="legend-item current">
              <span class="legend-dot"></span>
              Current
            </span>
            <span class="legend-item future">
              <span class="legend-dot"></span>
              Future
            </span>
          </div>
        </div>
        <div class="timeline-scroll" ref="timelineScroll">
          <div 
            v-for="year in availableYears" 
            :key="year" 
            class="time-period" 
            :class="{ 'active': selectedPeriod === year }"
            @click="selectPeriod(year)"
          >
            <div class="time-marker"></div>
            <div class="time-label">{{ year }}</div>
          </div>
        </div>
        <div class="timeline-controls">
          <button 
            class="timeline-nav-btn" 
            @click="scrollTimeline('left')"
            aria-label="Scroll timeline left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            class="timeline-nav-btn" 
            @click="scrollTimeline('right')"
            aria-label="Scroll timeline right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Filters and Categories -->
    <div class="filters-panel">
      <div class="filter-groups">
        <!-- Region Filter (Year/Quarter) -->
        <div class="filter-group">
          <div class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" fill="currentColor"/>
            </svg>
            <span>Celestial Regions</span>
          </div>
          <div class="region-quarters">
            <button 
              v-for="quarter in availableQuarters" 
              :key="quarter"
              @click="toggleQuarter(quarter)"
              :class="['quarter-btn', { 'active': selectedQuarters.includes(quarter) }]"
            >
              {{ quarter }}
            </button>
          </div>
        </div>
        
        <!-- Category Filters -->
        <div class="filter-group">
          <div class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
            </svg>
            <span>Feature Categories</span>
          </div>
          <div class="category-filters">
            <button 
              v-for="category in categories" 
              :key="category"
              @click="toggleCategory(category)"
              :class="['category-btn', { 'active': selectedCategories.includes(category) }]"
            >
              <span class="category-dot" :style="getCategoryStyle(category)"></span>
              <span class="category-name">{{ category }}</span>
            </button>
          </div>
        </div>
        
        <!-- Status Filter -->
        <div class="filter-group status-group">
          <div class="filter-label">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
            </svg>
            <span>Status</span>
          </div>
          <div class="status-filters">
            <button 
              v-for="status in statuses" 
              :key="status"
              @click="toggleStatus(status)"
              :class="['status-btn', status.toLowerCase(), { 'active': selectedStatuses.includes(status) }]"
            >
              {{ status }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Active Filters Display -->
      <div class="active-filters" v-if="hasActiveFilters">
        <div class="active-filters-label">Active Filters:</div>
        <div class="filter-chips">
          <div 
            v-for="(filter, index) in activeFilters" 
            :key="index"
            class="filter-chip"
          >
            {{ filter.label }}
            <button class="remove-filter" @click="removeFilter(filter)" aria-label="Remove filter">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <button class="clear-filters" @click="clearAllFilters">Clear All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';

export default {
  name: 'CosmicNavigator',
  props: {
    availableYears: {
      type: Array,
      default: () => []
    },
    availableTags: {
      type: Array,
      default: () => []
    },
    availableMilestones: {
      type: Array,
      default: () => []
    }
  },
  emits: ['filter-change'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedPeriod = ref('');
    const selectedQuarters = ref([]);
    const selectedCategories = ref([]);
    const selectedStatuses = ref([]);
    const timelineScroll = ref(null);
    
    // Predefined categories with colors
    const categories = [
      'Gameplay',
      'NFTs',
      'Smart Contracts',
      'UI/UX',
      'Infrastructure',
      'Community',
      'Tokenomics',
      'Security'
    ];
    
    // Status options
    const statuses = [
      'Completed',
      'In Progress',
      'Planned'
    ];
    
    // Category colors
    const categoryColors = {
      'Gameplay': '#0FB9FD',
      'NFTs': '#C92AFD',
      'Smart Contracts': '#5865F2',
      'UI/UX': '#FD4D4D',
      'Infrastructure': '#607D8B',
      'Community': '#FF9800',
      'Tokenomics': '#00D26A',
      'Security': '#FF3D00'
    };
    
    // Computed available quarters based on selected period
    const availableQuarters = computed(() => {
      if (!selectedPeriod.value) return [];
      
      // Create quarters for the selected year (Q1, Q2, Q3, Q4)
      return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => `${selectedPeriod.value}-${q}`);
    });
    
    // Check if any filters are active
    const hasActiveFilters = computed(() => {
      return searchQuery.value || 
             selectedPeriod.value || 
             selectedQuarters.value.length > 0 || 
             selectedCategories.value.length > 0 ||
             selectedStatuses.value.length > 0;
    });
    
    // Get active filters as an array for display
    const activeFilters = computed(() => {
      const filters = [];
      
      if (searchQuery.value) {
        filters.push({ type: 'search', label: `Search: ${searchQuery.value}` });
      }
      
      if (selectedPeriod.value) {
        filters.push({ type: 'period', label: `Year: ${selectedPeriod.value}` });
      }
      
      selectedQuarters.value.forEach(quarter => {
        filters.push({ type: 'quarter', label: `Quarter: ${quarter}`, value: quarter });
      });
      
      selectedCategories.value.forEach(category => {
        filters.push({ type: 'category', label: `Category: ${category}`, value: category });
      });
      
      selectedStatuses.value.forEach(status => {
        filters.push({ type: 'status', label: `Status: ${status}`, value: status });
      });
      
      return filters;
    });
    
    // Get style for category dot
    const getCategoryStyle = (category) => {
      return { background: categoryColors[category] || '#0FB9FD' };
    };
    
    // Select a time period
    const selectPeriod = (period) => {
      selectedPeriod.value = selectedPeriod.value === period ? '' : period;
      emitFilterChange();
    };
    
    // Toggle quarter selection
    const toggleQuarter = (quarter) => {
      const index = selectedQuarters.value.indexOf(quarter);
      if (index === -1) {
        selectedQuarters.value.push(quarter);
      } else {
        selectedQuarters.value.splice(index, 1);
      }
      emitFilterChange();
    };
    
    // Toggle category selection
    const toggleCategory = (category) => {
      const index = selectedCategories.value.indexOf(category);
      if (index === -1) {
        selectedCategories.value.push(category);
      } else {
        selectedCategories.value.splice(index, 1);
      }
      emitFilterChange();
    };
    
    // Toggle status selection
    const toggleStatus = (status) => {
      const index = selectedStatuses.value.indexOf(status);
      if (index === -1) {
        selectedStatuses.value.push(status);
      } else {
        selectedStatuses.value.splice(index, 1);
      }
      emitFilterChange();
    };
    
    // Remove a specific filter
    const removeFilter = (filter) => {
      if (filter.type === 'search') {
        searchQuery.value = '';
      } else if (filter.type === 'period') {
        selectedPeriod.value = '';
      } else if (filter.type === 'quarter') {
        const index = selectedQuarters.value.indexOf(filter.value);
        if (index !== -1) selectedQuarters.value.splice(index, 1);
      } else if (filter.type === 'category') {
        const index = selectedCategories.value.indexOf(filter.value);
        if (index !== -1) selectedCategories.value.splice(index, 1);
      } else if (filter.type === 'status') {
        const index = selectedStatuses.value.indexOf(filter.value);
        if (index !== -1) selectedStatuses.value.splice(index, 1);
      }
      
      emitFilterChange();
    };
    
    // Clear all filters
    const clearAllFilters = () => {
      searchQuery.value = '';
      selectedPeriod.value = '';
      selectedQuarters.value = [];
      selectedCategories.value = [];
      selectedStatuses.value = [];
      
      emitFilterChange();
    };
    
    // Scroll the timeline left or right
    const scrollTimeline = (direction) => {
      if (!timelineScroll.value) return;
      
      const scrollAmount = 200; // px to scroll
      const currentScroll = timelineScroll.value.scrollLeft;
      
      if (direction === 'left') {
        timelineScroll.value.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: 'smooth'
        });
      } else {
        timelineScroll.value.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }
    };
    
    // Emit filter changes to parent component
    const emitFilterChange = () => {
      emit('filter-change', {
        searchQuery: searchQuery.value,
        selectedPeriod: selectedPeriod.value,
        selectedQuarters: selectedQuarters.value,
        selectedCategories: selectedCategories.value,
        selectedStatuses: selectedStatuses.value
      });
    };
    
    // Watch for prop changes to update defaults
    watch(() => props.availableYears, (newYears) => {
      if (newYears.length && !selectedPeriod.value) {
        // Default to the most recent year
        selectedPeriod.value = newYears[newYears.length - 1];
        emitFilterChange();
      }
    }, { immediate: true });
    
    // Scroll to current year on mounted
    onMounted(() => {
      // Add a small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        if (timelineScroll.value && selectedPeriod.value) {
          const activeElement = timelineScroll.value.querySelector('.time-period.active');
          if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }, 500);
    });
    
    return {
      searchQuery,
      selectedPeriod,
      selectedQuarters,
      selectedCategories,
      selectedStatuses,
      categories,
      statuses,
      availableQuarters,
      hasActiveFilters,
      activeFilters,
      timelineScroll,
      getCategoryStyle,
      selectPeriod,
      toggleQuarter,
      toggleCategory,
      toggleStatus,
      removeFilter,
      clearAllFilters,
      scrollTimeline,
      emitFilterChange
    };
  }
};
</script>

<style scoped>
.cosmic-navigator {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 2rem;
}

/* Main Navigator Panel */
.navigator-panel {
  background: linear-gradient(145deg, 
    rgba(10, 17, 35, 0.8),
    rgba(15, 25, 45, 0.9));
  border: 1px solid rgba(15, 185, 253, 0.15);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-left: 4px solid rgba(15, 185, 253, 0.6);
  transition: all 0.3s ease;
}

.navigator-panel:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(15, 185, 253, 0.2);
  border-left-color: rgba(15, 185, 253, 0.8);
}

/* Search Scanner */
.search-scanner {
  width: 100%;
}

.search-field {
  position: relative;
  width: 100%;
}

.search-field input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 1.5rem;
  background: linear-gradient(145deg, 
    rgba(20, 30, 55, 0.7),
    rgba(30, 40, 70, 0.8));
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.search-field input:focus {
  outline: none;
  border-color: rgba(15, 185, 253, 0.5);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3), 
              inset 0 1px 0 rgba(255, 255, 255, 0.05), 
              0 0 20px rgba(15, 185, 253, 0.2);
  transform: translateY(-2px);
}

.search-field input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-icon {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  color: rgba(15, 185, 253, 0.8);
  pointer-events: none;
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.4));
}

.pulse-subtle {
  animation: pulse-subtle 2s infinite ease-in-out;
}

@keyframes pulse-subtle {
  0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.8; }
  50% { transform: translateY(-50%) scale(1.1); opacity: 1; }
}

.search-radar {
  position: relative;
  height: 6px;
  margin-top: 0.75rem;
  overflow: hidden;
  border-radius: 3px;
  background: rgba(15, 25, 45, 0.5);
}

.radar-ping {
  position: absolute;
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0), 
    rgba(15, 185, 253, 0.8) 50%, 
    rgba(15, 185, 253, 0));
  animation: radar-scan 2s infinite linear;
}

@keyframes radar-scan {
  0% { left: -30%; }
  100% { left: 100%; }
}

.search-status {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 0.8rem;
  color: rgba(15, 185, 253, 0.8);
  background: rgba(15, 25, 45, 0.7);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* Timeline Navigator */
.timeline-navigator {
  position: relative;
  margin-top: 0.5rem;
}

.navigator-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 1rem;
}

.navigator-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  font-weight: normal;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: rgba(255, 255, 255, 0.7);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item.past .legend-dot {
  background: rgba(0, 210, 106, 0.8);
}

.legend-item.current .legend-dot {
  background: rgba(15, 185, 253, 0.8);
}

.legend-item.future .legend-dot {
  background: rgba(255, 180, 0, 0.8);
}

.timeline-scroll {
  display: flex;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  position: relative;
}

.timeline-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.timeline-scroll::after {
  content: '';
  position: absolute;
  top: 35%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(15, 185, 253, 0.3);
  z-index: 0;
}

.time-period {
  position: relative;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 0 1rem;
  z-index: 1;
}

.time-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(15, 25, 45, 0.7);
  border: 2px solid rgba(15, 185, 253, 0.5);
  box-shadow: 0 0 0 4px rgba(15, 185, 253, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.time-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.time-period:hover .time-marker {
  transform: scale(1.2);
  background: rgba(15, 185, 253, 0.3);
  box-shadow: 0 0 0 6px rgba(15, 185, 253, 0.15), 0 0 15px rgba(15, 185, 253, 0.5);
}

.time-period:hover .time-label {
  color: rgba(255, 255, 255, 0.9);
}

.time-period.active .time-marker {
  background: rgba(15, 185, 253, 0.8);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 6px rgba(15, 185, 253, 0.2), 0 0 30px rgba(15, 185, 253, 0.8);
  transform: scale(1.3);
}

.time-period.active .time-label {
  color: rgba(15, 185, 253, 0.9);
  font-weight: 600;
}

.timeline-controls {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  pointer-events: none;
  padding: 0 0.5rem;
}

.timeline-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: rgba(15, 185, 253, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.timeline-nav-btn:hover {
  background: rgba(15, 185, 253, 0.2);
  color: white;
  transform: scale(1.1);
}

/* Filters Panel */
.filters-panel {
  margin-top: 1.25rem;
  background: rgba(15, 25, 45, 0.6);
  border-radius: 12px;
  padding: 1.25rem;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(15, 185, 253, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: all 0.3s ease;
}

.filters-panel:hover {
  border-color: rgba(15, 185, 253, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.filter-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  flex: 1;
  min-width: 250px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  font-size: 0.95rem;
}

.region-quarters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quarter-btn {
  padding: 0.5rem 0.75rem;
  background: rgba(25, 35, 55, 0.7);
  border: 1px solid rgba(88, 101, 242, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quarter-btn:hover {
  background: rgba(30, 40, 70, 0.8);
  border-color: rgba(15, 185, 253, 0.4);
  transform: translateY(-2px);
}

.quarter-btn.active {
  background: rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.5);
  color: rgba(15, 185, 253, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: rgba(25, 35, 55, 0.7);
  border: 1px solid rgba(88, 101, 242, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.category-btn:hover {
  background: rgba(30, 40, 70, 0.8);
  border-color: rgba(15, 185, 253, 0.3);
  transform: translateY(-2px);
}

.category-btn.active {
  background: rgba(15, 25, 45, 0.9);
  border-color: rgba(15, 185, 253, 0.4);
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.status-btn {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-btn.completed {
  background: rgba(0, 210, 106, 0.1);
  border: 1px solid rgba(0, 210, 106, 0.3);
  color: rgba(0, 210, 106, 0.9);
}

.status-btn.in.progress {
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  color: rgba(15, 185, 253, 0.9);
}

.status-btn.planned {
  background: rgba(255, 180, 0, 0.1);
  border: 1px solid rgba(255, 180, 0, 0.3);
  color: rgba(255, 180, 0, 0.9);
}

.status-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.status-btn.active {
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  filter: brightness(1.3);
  font-weight: 600;
}

/* Active Filters Display */
.active-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

.active-filters-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 20px;
  color: rgba(15, 185, 253, 0.9);
  font-size: 0.8rem;
}

.remove-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(15, 25, 45, 0.5);
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-filter:hover {
  background: rgba(255, 70, 70, 0.2);
  color: rgba(255, 70, 70, 0.9);
}

.clear-filters {
  padding: 0.3rem 0.6rem;
  background: rgba(255, 70, 70, 0.1);
  border: 1px solid rgba(255, 70, 70, 0.2);
  border-radius: 20px;
  color: rgba(255, 70, 70, 0.9);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters:hover {
  background: rgba(255, 70, 70, 0.2);
  transform: translateY(-2px);
}

/* Media Queries */
@media (max-width: 992px) {
  .navigator-panel,
  .filters-panel {
    padding: 1.25rem;
  }
  
  .filter-groups {
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .cosmic-navigator {
    margin-bottom: 1.5rem;
  }
  
  .navigator-panel {
    padding: 1rem;
    gap: 1.25rem;
  }
  
  .search-field input {
    padding: 0.875rem 3rem 0.875rem 1.25rem;
  }
  
  .timeline-navigator {
    margin-top: 0.25rem;
  }
  
  .navigator-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 576px) {
  .navigator-panel {
    border-left-width: 3px;
  }
  
  .navigator-legend {
    gap: 0.75rem;
    font-size: 0.75rem;
  }
  
  .time-period {
    min-width: 60px;
    padding: 0 0.75rem;
  }
  
  .timeline-controls {
    padding: 0;
  }
  
  .timeline-nav-btn {
    width: 30px;
    height: 30px;
  }
}
</style> 