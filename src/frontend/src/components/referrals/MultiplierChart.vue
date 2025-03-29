<template>
  <div class="multiplier-chart-container cosmic-panel">
    <div class="chart-header">
      <div class="icon-wrapper">
        <i class="fas fa-chart-line"></i>
      </div>
      <div class="header-content">
        <h3>Multiplier Bonus</h3>
        <p class="current-multiplier">
          Your current multiplier: 
          <span class="multiplier-value">{{ formatMultiplier(currentMultiplier) }}x</span>
        </p>
      </div>
    </div>
    
    <div class="chart-content">
      <div class="chart-wrapper">
        <canvas ref="chartContainer" class="chart-container"></canvas>
      </div>
      
      <div class="multiplier-explanation">
        <h4>How to increase your multiplier</h4>
        <ul class="multiplier-factors">
          <li v-for="(factor, index) in multiplierFactors" :key="index">
            <div class="factor-icon">
              <i :class="factor.icon"></i>
            </div>
            <div class="factor-content">
              <span class="factor-name">{{ factor.name }}</span>
              <span class="factor-value">+{{ factor.bonus }}x</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: factor.progress + '%' }"></div>
              </div>
              <span class="factor-progress">{{ factor.currentValue }}/{{ factor.targetValue }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';

// Import Chart.js dynamically to avoid SSR issues
let Chart;

const props = defineProps({
  currentMultiplier: {
    type: Number,
    default: 1.0
  },
  multiplierHistory: {
    type: Array,
    default: () => []
  },
  directReferrals: {
    type: Array,
    default: () => []
  },
  indirectReferrals: {
    type: Array,
    default: () => []
  },
  beyondReferrals: {
    type: Array,
    default: () => []
  }
});

const chartContainer = ref(null);
let multiplierChart = null;

// Format multiplier to display with 2 decimal places
const formatMultiplier = (value) => {
  return value.toFixed(2);
};

// Calculate multiplier factors
const multiplierFactors = computed(() => {
  return [
    {
      name: 'Direct Referrals',
      icon: 'fas fa-user-plus',
      bonus: 0.05,
      currentValue: props.directReferrals.length,
      targetValue: 20,
      progress: Math.min(100, (props.directReferrals.length / 20) * 100)
    },
    {
      name: 'Indirect Referrals',
      icon: 'fas fa-users',
      bonus: 0.02,
      currentValue: props.indirectReferrals.length,
      targetValue: 50,
      progress: Math.min(100, (props.indirectReferrals.length / 50) * 100)
    },
    {
      name: 'Network Depth',
      icon: 'fas fa-project-diagram',
      bonus: 0.1,
      currentValue: props.beyondReferrals.length > 0 ? 3 : props.indirectReferrals.length > 0 ? 2 : props.directReferrals.length > 0 ? 1 : 0,
      targetValue: 3,
      progress: Math.min(100, ((props.beyondReferrals.length > 0 ? 3 : props.indirectReferrals.length > 0 ? 2 : props.directReferrals.length > 0 ? 1 : 0) / 3) * 100)
    },
    {
      name: 'Total Network Size',
      icon: 'fas fa-network-wired',
      bonus: 0.15,
      currentValue: props.directReferrals.length + props.indirectReferrals.length + props.beyondReferrals.length,
      targetValue: 100,
      progress: Math.min(100, ((props.directReferrals.length + props.indirectReferrals.length + props.beyondReferrals.length) / 100) * 100)
    }
  ];
});

// Initialize chart
const initChart = async () => {
  if (!chartContainer.value) {
    console.warn('Chart container not found, skipping chart initialization');
    return;
  }
  
  try {
    // Dynamically import Chart.js
    if (!Chart) {
      const module = await import('chart.js/auto');
      Chart = module.default;
    }
    
    // Clean up any existing chart instance
    if (multiplierChart) {
      multiplierChart.destroy();
    }
    
    // Generate chart data
    const timestamps = props.multiplierHistory.map(item => item.timestamp);
    const multipliers = props.multiplierHistory.map(item => item.value);
    
    // If no history, create some mock data
    const chartData = {
      labels: timestamps.length > 0 ? timestamps.map(ts => new Date(ts).toLocaleDateString()) : generateMockDates(),
      datasets: [{
        label: 'Multiplier',
        data: multipliers.length > 0 ? multipliers : generateMockMultipliers(),
        borderColor: '#0FB9FD',
        backgroundColor: 'rgba(15, 185, 253, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#0FB9FD',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0FB9FD',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      }]
    };

    // Create chart directly with the canvas element
    multiplierChart = new Chart(chartContainer.value, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(26, 26, 46, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(15, 185, 253, 0.3)',
            borderWidth: 1,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => `Multiplier: ${context.parsed.y.toFixed(2)}x`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              tickLength: 0
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: (value) => `${value.toFixed(2)}x`
            },
            beginAtZero: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to create chart:', error);
  }
};

// Generate mock dates for the last 7 days
const generateMockDates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString());
  }
  return dates;
};

// Generate mock multiplier data (starting at 1.0 and gradually increasing)
const generateMockMultipliers = () => {
  const multipliers = [];
  let value = 1.0;
  for (let i = 0; i < 7; i++) {
    multipliers.push(value);
    // Random increase between 0.01 and 0.05
    value += 0.01 + Math.random() * 0.04;
  }
  return multipliers;
};

// Update chart when multiplier history changes
watch(() => props.multiplierHistory, () => {
  if (multiplierChart) {
    multiplierChart.destroy();
    initChart();
  }
}, { deep: true });

onMounted(() => {
  initChart();
});
</script>

<style scoped>
.multiplier-chart-container {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
}

.multiplier-chart-container:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(15, 185, 253, 0.1) 0%, rgba(15, 185, 253, 0.2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  box-shadow: var(--cosmic-glow-blue-sm);
  border: 1px solid rgba(15, 185, 253, 0.2);
  flex-shrink: 0;
}

.icon-wrapper i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.header-content {
  flex: 1;
}

.header-content h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
}

.current-multiplier {
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
}

.multiplier-value {
  font-weight: 700;
  color: var(--cosmic-blue);
  font-size: 1.1rem;
  text-shadow: var(--cosmic-glow-blue-sm);
}

.chart-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 250px;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.multiplier-explanation {
  width: 100%;
}

.multiplier-explanation h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--cosmic-text-primary);
}

.multiplier-factors {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.multiplier-factors li {
  display: flex;
  align-items: flex-start;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 0.75rem;
  transition: all var(--cosmic-transition-fast);
}

.multiplier-factors li:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-sm);
}

.factor-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 185, 253, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.factor-icon i {
  font-size: 0.9rem;
  color: var(--cosmic-blue);
}

.factor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.factor-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.factor-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--cosmic-blue);
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(15, 185, 253, 0.7) 0%, rgba(15, 185, 253, 1) 100%);
  border-radius: 3px;
  width: 0%;
  transition: width 0.5s ease;
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.5);
}

.factor-progress {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  text-align: right;
}

@media (max-width: 768px) {
  .chart-content {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 200px;
  }
}
</style> 