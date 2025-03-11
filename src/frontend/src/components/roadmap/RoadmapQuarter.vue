<template>
  <div class="quarter-container" :id="`quarter-${year}-${quarter}`">
    <div class="quarter-header">
      <h2 class="quarter-title">{{ title }}</h2>
      <span class="quarter-badge">{{ badge }}</span>
    </div>
    
    <div class="milestones-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoadmapQuarter',
  props: {
    year: {
      type: [String, Number],
      required: true
    },
    quarter: {
      type: [String, Number],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    badge: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
.quarter-container {
  margin-bottom: 3rem;
  padding-top: 0.5rem;
  scroll-margin-top: 2rem;
}

.quarter-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.2);
}

.quarter-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 10px rgba(15, 185, 253, 0.3);
  letter-spacing: 0.5px;
  background: linear-gradient(120deg, #ffffff, #0FB9FD);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.quarter-badge {
  padding: 0.35rem 0.85rem;
  background: rgba(15, 185, 253, 0.1);
  border: 1px solid rgba(15, 185, 253, 0.3);
  border-radius: 20px;
  color: rgba(15, 185, 253, 0.9);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.milestones-container {
  display: grid;
  gap: 2rem;
}

/* Subtle animation on hover */
.quarter-container {
  transition: transform 0.3s ease;
}

.quarter-container:hover .quarter-title {
  background-position: 100%;
  transition: all 0.5s ease;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .quarter-title {
    font-size: 1.5rem;
  }
  
  .quarter-badge {
    padding: 0.3rem 0.7rem;
    font-size: 0.75rem;
  }
  
  .milestones-container {
    gap: 1.5rem;
  }
}
</style> 