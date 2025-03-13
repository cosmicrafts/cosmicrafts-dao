<template>
  <div 
    class="cosmic-roadmap" 
    ref="roadmapRef" 
    role="region" 
    aria-label="Project Roadmap Timeline"
  >
    <!-- Quarters Container -->
    <div 
      class="quarters-container" 
      role="list" 
      aria-label="Development Quarters"
    >
      <!-- Each Quarter Element -->
      <div 
        v-for="(quarter, qIndex) in quarters" 
        :key="qIndex"
        class="quarter"
        :class="{ 
          'active': quarter.open,
          'completed': isQuarterCompleted(quarter),
          'current': isCurrentQuarter(quarter),
          'future': isFutureQuarter(quarter)
        }"
        role="listitem"
      >
        <!-- Quarter Panel -->
        <div class="quarter-panel">
          <!-- Quarter Header -->
          <button 
            class="quarter-header"
            @click="toggleQuarter(qIndex)"
            :aria-expanded="quarter.open ? 'true' : 'false'"
            :aria-controls="`quarter-content-${qIndex}`"
          >
            <div class="header-content">
              <h2 class="quarter-title">{{ quarter.period }}</h2>
              <p class="quarter-description">{{ quarter.description }}</p>
              
              <!-- Tags -->
              <div class="quarter-tags" v-if="quarter.tags && quarter.tags.length">
                <span 
                  v-for="(tag, tagIndex) in quarter.tags" 
                  :key="tagIndex" 
                  class="tag"
                  :style="{ '--tag-color': getTagColor(tag) }"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div class="quarter-meta">
              <!-- Progress -->
              <span class="progress-text">{{ quarter.completed }}/{{ quarter.total }}</span>
              
              <!-- Toggle -->
              <div class="cosmic-toggle" :class="{ 'is-open': quarter.open }">
                <span class="toggle-icon"></span>
              </div>
            </div>
          </button>
          
          <!-- Milestones Container -->
          <div 
            v-if="quarter.open"
            class="milestones-container"
            role="list"
            aria-label="Milestones"
            :id="`quarter-content-${qIndex}`"
          >
            <!-- Milestone Cards -->
            <div
              v-for="(milestone, mIndex) in quarter.milestones"
              :key="mIndex"
              class="milestone"
              :class="{ 
                'active': milestone.open,
                'completed': isMilestoneCompleted(milestone)
              }"
              role="listitem"
            >
              <!-- Milestone Header -->
              <button
                class="milestone-header"
                @click="toggleMilestone(milestone)"
                :aria-expanded="milestone.open ? 'true' : 'false'"
                :aria-controls="`milestone-content-${qIndex}-${mIndex}`"
              >
                <div class="milestone-header-content">
                  <h3 class="milestone-title">{{ milestone.title }}</h3>
                  <p class="milestone-description">{{ milestone.description }}</p>
                  
                  <!-- Tags -->
                  <div class="milestone-tags" v-if="milestone.tags && milestone.tags.length">
                    <span 
                      v-for="(tag, tagIndex) in milestone.tags" 
                      :key="tagIndex" 
                      class="tag"
                      :style="{ '--tag-color': getTagColor(tag) }"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                
                <div class="milestone-meta">
                  <!-- Progress -->
                  <span class="progress-text">{{ milestone.completed }}/{{ milestone.total }}</span>
                  
                  <!-- Toggle -->
                  <div class="cosmic-toggle" :class="{ 'is-open': milestone.open }">
                    <span class="toggle-icon"></span>
                  </div>
                </div>
              </button>
              
              <!-- Tasks Grid -->
              <div
                v-if="milestone.open"
                class="tasks-grid"
                role="list"
                aria-label="Tasks"
                :id="`milestone-content-${qIndex}-${mIndex}`"
              >
                <!-- Task Cards -->
                <div
                  v-for="(task, tIndex) in milestone.tasks"
                  :key="tIndex"
                  class="task-card"
                  :class="{ 
                    'completed': isTaskCompleted(task),
                    'in-progress': isTaskInProgress(task),
                    'planned': isTaskPlanned(task)
                  }"
                  role="listitem"
                >
                  <!-- Task Header -->
                  <button
                    class="task-header"
                    @click="toggleTask(task)"
                    :aria-expanded="task.open ? 'true' : 'false'"
                    :aria-controls="`task-content-${qIndex}-${mIndex}-${tIndex}`"
                  >
                    <h4 class="task-title">{{ task.title }}</h4>
                    <p class="task-description">{{ task.description }}</p>
                    
                    <!-- Tags -->
                    <div class="task-tags" v-if="task.tags && task.tags.length">
                      <span
                        v-for="(tag, tagIndex) in task.tags"
                        :key="tagIndex"
                        class="tag"
                        :style="{ '--tag-color': getTagColor(tag) }"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    
                    <!-- Task Footer -->
                    <div class="task-footer">
                      <span class="progress-text">{{ task.completed }}/{{ task.total }}</span>
                      <span class="task-status" :class="task.status.toLowerCase().replace(/\s+/g, '-')">
                        {{ task.status }}
                      </span>
                      
                      <!-- Toggle -->
                      <div 
                        v-if="task.subtasks && task.subtasks.length" 
                        class="cosmic-toggle" 
                        :class="{ 'is-open': task.open }"
                      >
                        <span class="toggle-icon"></span>
                      </div>
                    </div>
                  </button>
                  
                  <!-- Subtasks List -->
                  <div
                    v-if="task.open && task.subtasks"
                    class="subtasks-list"
                    role="list"
                    aria-label="Subtasks"
                    :id="`task-content-${qIndex}-${mIndex}-${tIndex}`"
                  >
                    <div
                      v-for="(subtask, stIndex) in task.subtasks"
                      :key="stIndex"
                      class="subtask"
                      :class="{ 'completed': subtask.completed }"
                      role="listitem"
                    >
                      <div class="subtask-header">
                        <div class="subtask-checkbox">
                          <input 
                            type="checkbox" 
                            :id="`subtask-${qIndex}-${mIndex}-${tIndex}-${stIndex}`" 
                            :checked="subtask.completed" 
                            @change="toggleSubtask(quarter, milestone, task, subtask)"
                            :aria-label="`Mark subtask ${subtask.title} as ${subtask.completed ? 'incomplete' : 'complete'}`"
                          >
                          <label :for="`subtask-${qIndex}-${mIndex}-${tIndex}-${stIndex}`">
                            <span class="subtask-title">{{ subtask.title }}</span>
                          </label>
                        </div>
                      </div>
                      <p class="subtask-description">{{ subtask.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Timeline Navigation -->
    <div class="timeline-controls" v-if="quarters.length > 3">
      <button 
        class="timeline-control prev" 
        @click="navigateTimeline('prev')"
        :disabled="currentTimelinePosition <= 0"
        aria-label="View previous quarters"
      >
        <span class="control-icon">←</span>
      </button>
      <div class="timeline-indicators">
        <span 
          v-for="(_, index) in Math.ceil(quarters.length / 3)" 
          :key="index"
          class="indicator"
          :class="{ 'active': currentTimelinePosition === index }"
          @click="jumpToTimelinePosition(index)"
        ></span>
      </div>
      <button 
        class="timeline-control next" 
        @click="navigateTimeline('next')"
        :disabled="currentTimelinePosition >= Math.ceil(quarters.length / 3) - 1"
        aria-label="View next quarters"
      >
        <span class="control-icon">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import useRoadmapDisplay from '@/composables/useRoadmapDisplay';

// Define props
const props = defineProps({
  quarters: {
    type: Array,
    required: true
  },
  currentDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  tagColorMap: {
    type: Object,
    default: () => ({
      'Frontend': 'var(--cosmic-blue)',
      'Backend': 'var(--cosmic-purple)',
      'DevOps': 'var(--cosmic-magenta)',
      'Design': 'var(--cosmic-red)',
      'Research': 'var(--cosmic-green)',
      'Testing': 'var(--cosmic-yellow)',
      'Documentation': 'var(--cosmic-teal)',
      'Infrastructure': '#607D8B',
      'Security': '#FF3D00',
      'UX': '#009688',
      'API': '#3F51B5',
      'Database': '#795548',
      'Performance': '#FF9800',
      'Accessibility': '#8BC34A',
      'Mobile': '#E91E63'
    })
  }
});

// Define emits
const emit = defineEmits(['update:quarters', 'task-click', 'milestone-click', 'quarter-click']);

// Use the roadmap display composable
const {
  roadmapRef,
  currentTimelinePosition,
  isQuarterCompleted,
  isCurrentQuarter,
  isFutureQuarter,
  isMilestoneCompleted,
  isTaskCompleted,
  isTaskInProgress,
  isTaskPlanned,
  getProgressPercentage,
  getTagColor,
  toggleQuarter,
  toggleMilestone,
  toggleTask,
  toggleSubtask,
  navigateTimeline,
  jumpToTimelinePosition
} = useRoadmapDisplay(props, emit);
</script>

<style>
@import './styles/roadmap-components.css';
</style> 