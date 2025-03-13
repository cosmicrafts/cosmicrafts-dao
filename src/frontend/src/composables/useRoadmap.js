// useRoadmap.js - Composable for roadmap functionality
import { ref, computed, onMounted } from 'vue';
import roadmapData from '@/data/roadmap.json';

export default function useRoadmap() {
  const quarters = ref([]);
  const searchQuery = ref('');
  const selectedYear = ref('');
  const selectedMilestone = ref('');
  const selectedTags = ref([]);

  // Load roadmap data and transform it
  const loadRoadmap = () => {
    const data = Object.keys(roadmapData).map(key => {
      const quarter = roadmapData[key];
      return {
        ...quarter,
        open: false,
        milestones: quarter.milestones.map(milestone => ({
          ...milestone,
          open: false,
          tasks: milestone.tasks.map(task => ({
            ...task,
            open: false
          }))
        }))
      };
    });
    quarters.value = data;
  };

  // Handle filter changes from the SearchFilters component
  const handleFilterChanges = (filters) => {
    searchQuery.value = filters.searchQuery;
    selectedYear.value = filters.selectedYear;
    selectedMilestone.value = filters.selectedMilestone;
    selectedTags.value = filters.selectedTags;
  };

  // Computed properties for available filter options
  const availableYears = computed(() => {
    return [...new Set(quarters.value.map(q => q.period.split('-')[0]))];
  });

  const availableMilestones = computed(() => {
    const milestones = [];
    quarters.value.forEach(q => {
      q.milestones.forEach(m => {
        if (!milestones.includes(m.title)) {
          milestones.push(m.title);
        }
      });
    });
    return milestones;
  });

  const availableTags = computed(() => {
    const tags = new Set();
    quarters.value.forEach(quarter => {
      quarter.milestones.forEach(milestone => {
        if (milestone.tags) {
          milestone.tags.forEach(tag => tags.add(tag));
        }
        milestone.tasks.forEach(task => {
          if (task.tags) {
            task.tags.forEach(tag => tags.add(tag));
          }
        });
      });
    });
    return Array.from(tags).sort();
  });

  // Filtered quarters based on search and filters
  const filteredQuarters = computed(() => {
    return quarters.value.filter(q => {
      const matchesYear = selectedYear.value ? q.period.includes(selectedYear.value) : true;
      const matchesMilestone = selectedMilestone.value ? q.milestones.some(m => m.title.includes(selectedMilestone.value)) : true;
      
      let matchesTags = true;
      if (selectedTags.value.length > 0) {
        matchesTags = q.milestones.some(m => {
          // Check if milestone has any of the selected tags
          const milestoneTags = m.tags || [];
          const milestoneHasTags = milestoneTags.some(tag => selectedTags.value.includes(tag));
          
          // Check if any tasks have the selected tags
          const tasksHaveTags = m.tasks.some(t => {
            const taskTags = t.tags || [];
            return taskTags.some(tag => selectedTags.value.includes(tag));
          });
          
          return milestoneHasTags || tasksHaveTags;
        });
      }
      
      const matchesSearch = searchQuery.value ? q.milestones.some(m => 
        m.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
        m.tasks.some(t => t.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
      ) : true;
      
      return matchesYear && matchesMilestone && matchesSearch && matchesTags;
    });
  });

  // Initialize data on component mount
  onMounted(() => {
    loadRoadmap();
  });

  return {
    quarters,
    filteredQuarters,
    availableYears,
    availableMilestones,
    availableTags,
    handleFilterChanges
  };
} 