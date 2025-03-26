<template>
  <div class="donut-chart-container">
    <svg :width="size" :height="size" viewBox="0 0 100 100" class="donut-chart">
      <!-- Background Circle -->
      <circle 
        cx="50" 
        cy="50" 
        :r="radius" 
        fill="none" 
        stroke="rgba(15, 185, 253, 0.1)" 
        stroke-width="10"
      />
      
      <!-- Data segments -->
      <path 
        v-for="(segment, index) in segments" 
        :key="index"
        :d="segment.path"
        :fill="segment.color"
        :stroke="segment.color"
        stroke-width="10"
        stroke-linecap="round"
        class="donut-segment"
      />
      
      <!-- Center circle -->
      <circle 
        cx="50" 
        cy="50" 
        :r="innerRadius" 
        fill="var(--cosmic-glass-bg)" 
        class="donut-hole"
      />
      
      <!-- Center text -->
      <text 
        x="50" 
        y="45" 
        text-anchor="middle" 
        dominant-baseline="middle"
        class="donut-label"
      >
        {{ centerLabel }}
      </text>
      
      <text 
        x="50" 
        y="55" 
        text-anchor="middle" 
        dominant-baseline="middle"
        class="donut-value"
      >
        {{ formattedTotal }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // Array of data values
  data: {
    type: Array,
    required: true
  },
  // Array of colors for each data segment
  colors: {
    type: Array,
    default: () => ['#0FB9FD', '#FF4B4B', '#00E5A4']
  },
  // Total value (for displaying in center)
  total: {
    type: Number,
    default: 0
  },
  // Label to display in center
  centerLabel: {
    type: String,
    default: ''
  },
  // Size of the chart in pixels
  size: {
    type: Number,
    default: 160
  }
});

// Calculate the radius
const radius = computed(() => 40);
const innerRadius = computed(() => 30);

// Format large numbers
const formattedTotal = computed(() => {
  const num = props.total;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
});

// Calculate segments for the donut chart
const segments = computed(() => {
  const dataSum = props.data.reduce((sum, value) => sum + value, 0) || 1;
  const r = radius.value;
  
  let startAngle = 0;
  return props.data.map((value, index) => {
    // Skip segments with zero value
    if (value <= 0) {
      return {
        path: '',
        color: props.colors[index % props.colors.length]
      };
    }
    
    const percentage = value / dataSum;
    const endAngle = startAngle + percentage * 2 * Math.PI;
    
    // Calculate path for the segment
    const x1 = 50 + r * Math.sin(startAngle);
    const y1 = 50 - r * Math.cos(startAngle);
    const x2 = 50 + r * Math.sin(endAngle);
    const y2 = 50 - r * Math.cos(endAngle);
    
    // Use arc flag 1 for arcs > 180 degrees
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    // SVG Path
    const path = `
      M 50 50
      L ${x1} ${y1}
      A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;
    
    // Store start angle for next segment
    startAngle = endAngle;
    
    return {
      path,
      color: props.colors[index % props.colors.length]
    };
  });
});
</script>

<style scoped>
.donut-chart-container {
  display: inline-block;
}

.donut-chart {
  transform-origin: center;
  transform: rotate(-90deg); /* Start from top */
}

.donut-segment {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
}

.donut-segment:hover {
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));
  transform: scale(1.02) translateY(-1px);
}

.donut-hole {
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.15));
}

.donut-label {
  transform: rotate(90deg); /* Correct text orientation */
  font-size: 10px;
  fill: var(--cosmic-text-tertiary);
  font-family: var(--font-family-default);
}

.donut-value {
  transform: rotate(90deg); /* Correct text orientation */
  font-size: 14px;
  font-weight: bold;
  fill: var(--cosmic-text-primary);
  font-family: var(--font-family-default);
}
</style> 