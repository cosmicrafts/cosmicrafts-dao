<template>
  <div class="referral-network cosmic-panel">
    <div class="network-header">
      <div class="icon-wrapper">
        <i class="fas fa-sitemap"></i>
      </div>
      <div class="header-content">
        <h3>Your Referral Network</h3>
        <p class="network-stats">
          {{ totalReferrals }} total referrals across {{ networkDepth }} levels
        </p>
      </div>
    </div>
    
    <div class="network-visualization">
      <!-- Tree visualization will be rendered here -->
      <div ref="treeContainer" class="tree-container"></div>
      
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="cosmic-loader small"></div>
        <p>Building your network visualization...</p>
      </div>
      
      <!-- Empty state -->
      <div v-if="!loading && totalReferrals === 0" class="empty-state">
        <i class="fas fa-user-friends"></i>
        <p>You haven't referred anyone yet. Share your referral code to start building your network!</p>
      </div>
    </div>
    
    <div class="network-legend">
      <div class="legend-item">
        <div class="legend-color level-1"></div>
        <span>Level 1 (Direct)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color level-2"></div>
        <span>Level 2 (Indirect)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color level-3"></div>
        <span>Level 3+ (Beyond)</span>
      </div>
    </div>
    
    <div class="network-details">
      <div class="network-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      
      <div class="referrals-list">
        <div v-if="visibleReferrals.length === 0" class="empty-list">
          <p>No referrals in this category</p>
        </div>
        
        <div v-else v-for="referral in visibleReferrals" :key="referral.id" class="referral-item">
          <div class="referral-avatar">
            <img :src="getAvatarUrl(referral.avatar)" :alt="referral.username" />
          </div>
          <div class="referral-details">
            <span class="referral-name">{{ referral.username }}</span>
            <span class="referral-id">{{ formatPrincipal(referral.id) }}</span>
          </div>
          <div class="referral-stats">
            <div class="referral-stat">
              <span class="stat-label">Level</span>
              <span class="stat-value">{{ referral.level }}</span>
            </div>
            <div class="referral-stat">
              <span class="stat-label">Referrals</span>
              <span class="stat-value">{{ referral.referrals || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Import D3.js dynamically
let d3;

const props = defineProps({
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
  },
  playerInfo: {
    type: Object,
    default: () => ({
      username: 'You',
      id: '',
      avatar: 1
    })
  }
});

// Refs
const treeContainer = ref(null);
const loading = ref(true);
const activeTab = ref('direct');

// Computed properties
const totalReferrals = computed(() => {
  return props.directReferrals.length + props.indirectReferrals.length + props.beyondReferrals.length;
});

const networkDepth = computed(() => {
  if (props.beyondReferrals.length > 0) return 3;
  if (props.indirectReferrals.length > 0) return 2;
  if (props.directReferrals.length > 0) return 1;
  return 0;
});

const tabs = computed(() => [
  { id: 'direct', label: 'Direct Referrals', count: props.directReferrals.length },
  { id: 'indirect', label: 'Indirect Referrals', count: props.indirectReferrals.length },
  { id: 'beyond', label: 'Beyond Referrals', count: props.beyondReferrals.length },
]);

const visibleReferrals = computed(() => {
  switch (activeTab.value) {
    case 'direct':
      return props.directReferrals;
    case 'indirect':
      return props.indirectReferrals;
    case 'beyond':
      return props.beyondReferrals;
    default:
      return [];
  }
});

// Methods
const formatPrincipal = (principal) => {
  if (!principal) return '';
  const str = principal.toString();
  if (str.length > 16) {
    return `${str.substring(0, 8)}...${str.substring(str.length - 8)}`;
  }
  return str;
};

const getAvatarUrl = (avatarId) => {
  return `/assets/avatars/avatar-${avatarId || 1}.webp`;
};

// Create D3 tree visualization
const createNetworkTree = async () => {
  if (!treeContainer.value) {
    console.warn('Tree container DOM element not found, skipping network tree creation');
    return;
  }
  
  loading.value = true;
  
  try {
    // Dynamically import D3
    if (!d3) {
      try {
        const d3Module = await import('d3');
        // Fix: Assign specific D3 methods instead of the entire module
        d3 = {
          select: d3Module.select,
          tree: d3Module.tree,
          hierarchy: d3Module.hierarchy
        };
      } catch (importError) {
        console.error('Error importing D3:', importError);
        loading.value = false;
        return;
      }
    }
    
    // Make sure we have access to the select method
    if (!d3.select) {
      console.error('D3 select method not available');
      loading.value = false;
      return;
    }
    
    // Clear container
    d3.select(treeContainer.value).selectAll('*').remove();
    
    // If no referrals, don't render
    if (totalReferrals.value === 0) {
      loading.value = false;
      return;
    }
    
    // Prepare tree data
    const treeData = {
      name: props.playerInfo.username || 'You',
      id: props.playerInfo.id,
      avatar: props.playerInfo.avatar || 1,
      level: 0,
      children: []
    };
    
    // Add direct referrals
    props.directReferrals.forEach(direct => {
      const directNode = {
        name: direct.username,
        id: direct.id,
        avatar: direct.avatar,
        level: 1,
        children: []
      };
      
      // Find indirect referrals of this direct referral
      const indirectsOfDirect = props.indirectReferrals.filter(
        indirect => indirect.referrerId === direct.id
      );
      
      indirectsOfDirect.forEach(indirect => {
        const indirectNode = {
          name: indirect.username,
          id: indirect.id,
          avatar: indirect.avatar,
          level: 2,
          children: []
        };
        
        // Find beyond referrals of this indirect referral
        const beyondsOfIndirect = props.beyondReferrals.filter(
          beyond => beyond.referrerId === indirect.id
        );
        
        beyondsOfIndirect.forEach(beyond => {
          indirectNode.children.push({
            name: beyond.username,
            id: beyond.id,
            avatar: beyond.avatar,
            level: 3,
            children: []
          });
        });
        
        directNode.children.push(indirectNode);
      });
      
      treeData.children.push(directNode);
    });
    
    // Set up SVG dimensions
    const containerWidth = treeContainer.value.offsetWidth;
    const containerHeight = Math.max(500, 100 * Math.log(totalReferrals.value + 1));
    
    // Create SVG
    const svg = d3.select(treeContainer.value)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .append('g')
      .attr('transform', `translate(${containerWidth / 2}, 30)`);
    
    // Create tree layout
    const treeLayout = d3.tree().size([containerWidth - 100, containerHeight - 60]);
    
    // Prepare hierarchy
    const root = d3.hierarchy(treeData);
    
    // Assign x,y positions
    treeLayout(root);
    
    // Draw links
    svg.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      })
      .attr('stroke', d => {
        const level = d.target.data.level;
        if (level === 1) return 'rgba(15, 185, 253, 0.6)';
        if (level === 2) return 'rgba(157, 53, 191, 0.6)';
        return 'rgba(255, 145, 0, 0.6)';
      })
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);
    
    // Create node groups
    // Fix: Use style instead of attr for opacity to ensure compatibility
    const nodeGroups = svg.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('opacity', 0);
      
    // Apply transition separately
    nodeGroups.transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style('opacity', 1);
    
    // Add circles for nodes
    nodeGroups.append('circle')
      .attr('r', d => d.data.level === 0 ? 24 : 18)
      .attr('fill', d => {
        const level = d.data.level;
        if (level === 0) return 'url(#gradient-you)';
        if (level === 1) return 'url(#gradient-direct)';
        if (level === 2) return 'url(#gradient-indirect)';
        return 'url(#gradient-beyond)';
      })
      .attr('stroke', d => {
        const level = d.data.level;
        if (level === 0) return 'rgba(15, 185, 253, 0.8)';
        if (level === 1) return 'rgba(15, 185, 253, 0.6)';
        if (level === 2) return 'rgba(157, 53, 191, 0.6)';
        return 'rgba(255, 145, 0, 0.6)';
      })
      .attr('stroke-width', 2);
    
    // Add labels
    nodeGroups.append('text')
      .attr('dy', d => d.data.level === 0 ? 36 : 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => d.data.level === 0 ? '12px' : '11px')
      .text(d => {
        const name = d.data.name;
        return name.length > 12 ? name.substring(0, 10) + '...' : name;
      })
      .attr('fill', 'var(--cosmic-text-primary)');
    
    // Add gradients
    const defs = svg.append('defs');
    
    // Add avatar clip paths - Fix: Use selectAll before data binding
    defs.selectAll('clipPath')
      .data(root.descendants())
      .enter()
      .append('clipPath')
      .attr('id', d => `clip-${d.data.id}`)
      .append('circle')
      .attr('r', d => d.data.level === 0 ? 22 : 16);
    
    // You gradient
    const youGradient = defs.append('radialGradient')
      .attr('id', 'gradient-you')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
    
    youGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(15, 185, 253, 0.2)');
      
    youGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(15, 185, 253, 0.1)');
    
    // Direct gradient
    const directGradient = defs.append('radialGradient')
      .attr('id', 'gradient-direct')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
      
    directGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(15, 185, 253, 0.15)');
      
    directGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(15, 185, 253, 0.05)');
    
    // Indirect gradient
    const indirectGradient = defs.append('radialGradient')
      .attr('id', 'gradient-indirect')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
      
    indirectGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(157, 53, 191, 0.15)');
      
    indirectGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(157, 53, 191, 0.05)');
    
    // Beyond gradient
    const beyondGradient = defs.append('radialGradient')
      .attr('id', 'gradient-beyond')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%');
      
    beyondGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(255, 145, 0, 0.15)');
      
    beyondGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(255, 145, 0, 0.05)');
    
  } catch (error) {
    console.error('Error creating network tree:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for changes in referrals
watch(
  () => [
    props.directReferrals, 
    props.indirectReferrals, 
    props.beyondReferrals
  ],
  () => {
    createNetworkTree();
  },
  { deep: true }
);

// Initialize on mount
onMounted(() => {
  createNetworkTree();
});
</script>

<style scoped>
.referral-network {
  padding: 1.5rem;
  border-radius: var(--cosmic-radius-lg);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  transition: all var(--cosmic-transition-medium);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.referral-network:hover {
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
}

.network-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
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

.network-stats {
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
  color: var(--cosmic-text-secondary);
}

.network-visualization {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  overflow: hidden;
}

.tree-container {
  width: 100%;
  height: 100%;
}

.loading-state,
.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading-state .cosmic-loader {
  margin-bottom: 1rem;
}

.loading-state p,
.empty-state p {
  color: var(--cosmic-text-tertiary);
  max-width: 300px;
}

.empty-state i {
  font-size: 3rem;
  color: rgba(15, 185, 253, 0.3);
  margin-bottom: 1rem;
}

.cosmic-loader.small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid rgba(15, 185, 253, 0.2);
  border-top: 2px solid var(--cosmic-blue);
  animation: spin 1.2s linear infinite;
  box-shadow: var(--cosmic-glow-blue-sm);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.network-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.5rem;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.level-1 {
  background: rgba(15, 185, 253, 0.6);
  box-shadow: 0 0 5px rgba(15, 185, 253, 0.4);
}

.level-2 {
  background: rgba(157, 53, 191, 0.6);
  box-shadow: 0 0 5px rgba(157, 53, 191, 0.4);
}

.level-3 {
  background: rgba(255, 145, 0, 0.6);
  box-shadow: 0 0 5px rgba(255, 145, 0, 0.4);
}

.network-details {
  width: 100%;
}

.network-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  padding-bottom: 0.5rem;
  overflow-x: auto;
}

.tab-button {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  font-size: 0.95rem;
  position: relative;
  transition: all var(--cosmic-transition-fast);
  white-space: nowrap;
}

.tab-button:hover {
  color: var(--cosmic-blue);
}

.tab-button.active {
  color: var(--cosmic-blue);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 0.75rem;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 10px;
  margin-left: 0.5rem;
}

.referrals-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.referrals-list::-webkit-scrollbar {
  width: 6px;
}

.referrals-list::-webkit-scrollbar-track {
  background: rgba(15, 185, 253, 0.05);
  border-radius: 3px;
}

.referrals-list::-webkit-scrollbar-thumb {
  background: rgba(15, 185, 253, 0.2);
  border-radius: 3px;
}

.referrals-list::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 185, 253, 0.3);
}

.empty-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--cosmic-text-tertiary);
  text-align: center;
}

.referral-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: rgba(15, 185, 253, 0.03);
  border-radius: var(--cosmic-radius-md);
  margin-bottom: 0.75rem;
  transition: all var(--cosmic-transition-fast);
}

.referral-item:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateY(-2px);
  box-shadow: var(--cosmic-shadow-sm);
}

.referral-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
  border: 2px solid rgba(15, 185, 253, 0.2);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.referral-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.referral-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.referral-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cosmic-text-primary);
  margin-bottom: 0.25rem;
}

.referral-id {
  font-size: 0.8rem;
  color: var(--cosmic-text-tertiary);
  font-family: monospace;
}

.referral-stats {
  display: flex;
  gap: 1rem;
}

.referral-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--cosmic-text-tertiary);
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--cosmic-blue);
}

@media (max-width: 768px) {
  .network-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
  }
}

@media (max-width: 600px) {
  .network-visualization {
    min-height: 250px;
  }
  
  .referral-stats {
    display: none;
  }
}
</style> 