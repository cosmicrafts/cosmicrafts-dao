<template>
  <section id="open-positions" class="positions-section">
    <div class="container mx-auto px-4">
      <div class="section-header text-center mb-16">
        <h2 class="section-title mb-6">Open Opportunities</h2>
        <p class="section-subtitle">Join our team of visionaries and innovators shaping the future of web3.</p>
      </div>

      <!-- Position Filters -->
      <div class="positions-filter">
        <span class="filter-title">Filter by:</span>
        <div class="filter-buttons">
          <button class="filter-button active">All Roles</button>
          <button class="filter-button">Engineering</button>
          <button class="filter-button">Design</button>
          <button class="filter-button">Product</button>
          <button class="filter-button">Community</button>
        </div>
      </div>

      <!-- Positions Grid -->
      <div class="positions-grid" v-if="positions.length > 0">
        <div 
          v-for="(position, index) in positions" 
          :key="index" 
          class="position-card cosmic-card"
          :class="{'is-active': position.open}"
        >
          <!-- Position Header (Always Visible) -->
          <div class="position-header" @click="togglePosition(index)">
            <div class="position-header-content">
              <h3 class="position-title">{{ position.title }}</h3>
              <div class="position-meta">
                <div class="position-location">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ position.location }}</span>
                </div>
                <div class="position-type">
                  <i class="fas fa-briefcase"></i>
                  <span>{{ position.type }}</span>
                </div>
              </div>
            </div>
            <div class="position-action">
              <div class="expand-toggle" :class="{'is-open': position.open}">
                <i class="fas" :class="position.open ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </div>
            </div>
          </div>

          <!-- Position Overview (Always Visible) -->
          <div class="position-overview" v-if="!position.open">
            <p>{{ truncateDescription(position.description) }}</p>
            <div class="overview-footer">
              <button class="cosmic-btn cosmic-btn-outline view-details-btn" @click="togglePosition(index)">
                View Full Details
              </button>
            </div>
          </div>

          <!-- Position Details (Visible when expanded) -->
          <div class="position-details" v-if="position.open">
            <!-- Full Description -->
            <div class="position-full-description">
              <p>{{ position.description }}</p>
            </div>

            <!-- Sections -->
            <div class="position-sections">
              <div 
                v-for="(section, sectionIndex) in position.sections" 
                :key="sectionIndex"
                class="position-section"
              >
                <h4>
                  <i class="fas" :class="getSectionIcon(section.title)"></i>
                  {{ section.title }}
                </h4>
                <ul class="section-items">
                  <li 
                    v-for="(item, itemIndex) in section.items" 
                    :key="itemIndex"
                    class="section-item"
                  >
                    <i class="fas fa-star-of-life"></i>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Apply Button -->
            <div class="position-apply">
              <a :href="`mailto:careers@cosmicrafts.com?subject=Application for ${position.title}`" class="cosmic-btn cosmic-btn-primary apply-btn">
                <i class="fas fa-paper-plane"></i>
                Apply Now
              </a>
              <div class="apply-note">
                <i class="fas fa-info-circle"></i>
                <span>Applications are reviewed within 48 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (No Positions) -->
      <div class="empty-state cosmic-card" v-if="positions.length === 0">
        <i class="fas fa-search"></i>
        <h3>No Open Positions Currently</h3>
        <p>We don't have any open positions matching your criteria at the moment. However, we're always looking for talented individuals. Submit your information and we'll reach out when there's a match.</p>
        <a href="mailto:careers@cosmicrafts.com" class="cosmic-btn cosmic-btn-primary">
          Send Your Portfolio
        </a>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import careersData from '@/data/careers.json';

export default {
  name: 'CareerPositions',
  setup() {
    const positions = ref([]);

    const loadPositions = () => {
      const data = Object.values(careersData).map(position => ({
        ...position,
        open: false,
        sections: position.sections.map(section => ({
          ...section,
          open: true // Always keep sections open
        }))
      }));
      positions.value = data;
    };

    const togglePosition = (index) => {
      // Close all other positions when opening a new one
      positions.value.forEach((pos, i) => {
        if (i !== index) {
          pos.open = false;
        }
      });
      positions.value[index].open = !positions.value[index].open;
    };
    
    // Helper function to truncate description text
    const truncateDescription = (text) => {
      if (!text) return '';
      return text.length > 150 ? text.substring(0, 150) + '...' : text;
    };

    // Helper function to map section titles to appropriate FontAwesome icons
    const getSectionIcon = (title) => {
      const titleLower = title.toLowerCase();
      if (titleLower.includes('responsib')) return 'fa-tasks';
      if (titleLower.includes('requirement')) return 'fa-clipboard-check';
      if (titleLower.includes('qualification')) return 'fa-graduation-cap';
      if (titleLower.includes('preferred')) return 'fa-star';
      if (titleLower.includes('technical')) return 'fa-laptop-code';
      if (titleLower.includes('skill')) return 'fa-tools';
      if (titleLower.includes('benefit')) return 'fa-gift';
      if (titleLower.includes('about')) return 'fa-info-circle';
      return 'fa-list'; // Default icon
    };

    onMounted(() => {
      loadPositions();
    });

    return {
      positions,
      togglePosition,
      truncateDescription,
      getSectionIcon
    };
  }
};
</script>

<style scoped>
/* Positions Section - Enhanced with modern UI techniques */
.positions-section {
  background: linear-gradient(to bottom, transparent, rgba(15, 25, 35, 0.5), transparent);
  padding-top: 8rem;
  padding-bottom: 8rem;
  position: relative;
  overflow: hidden;
}

.positions-section::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(15, 185, 253, 0.1) 0%, transparent 20%), 
    radial-gradient(circle at 90% 80%, rgba(103, 58, 183, 0.1) 0%, transparent 20%);
  z-index: -1;
  opacity: 0.8;
}

.positions-filter {
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.8s var(--animation-smooth) forwards;
  animation-delay: 0.3s;
  position: relative;
  z-index: 2;
}

.filter-title {
  font-size: 1.1rem;
  color: var(--cosmic-text-primary);
  margin-right: 1rem;
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  position: relative;
}

.filter-button {
  padding: 0.5rem 1.25rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
  border-radius: 20px;
  color: var(--cosmic-text-secondary);
  cursor: pointer;
  transition: all 0.4s var(--animation-bounce);
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.filter-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  z-index: -1;
  border-radius: inherit;
}

.filter-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: var(--cosmic-blue);
  border-radius: 50%;
  z-index: -1;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s var(--animation-bounce), opacity 0.5s;
}

.filter-button:hover, .filter-button.active {
  background: var(--cosmic-glass-bg-lighter);
  color: var(--cosmic-text-primary);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-3px);
}

.filter-button:hover::before, .filter-button.active::before {
  opacity: 1;
}

.filter-button:active {
  transform: translateY(0);
}

.filter-button.active {
  background: rgba(15, 185, 253, 0.15);
  color: var(--cosmic-blue);
  font-weight: 600;
}

.filter-button.active::after {
  opacity: 0.2;
  transform: translate(-50%, -50%) scale(40);
}

.positions-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;
  position: relative;
  transition: height 0.6s var(--animation-smooth);
}

.position-card {
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.6s var(--animation-bounce);
  transform: translateY(30px);
  opacity: 0;
  animation: fadeSlideUp 1s var(--animation-smooth) forwards;
  position: relative;
  z-index: 1;
}

.position-card:nth-child(1) { animation-delay: 0.1s; }
.position-card:nth-child(2) { animation-delay: 0.2s; }
.position-card:nth-child(3) { animation-delay: 0.3s; }
.position-card:nth-child(4) { animation-delay: 0.4s; }
.position-card:nth-child(5) { animation-delay: 0.5s; }

.position-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.03) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.6s var(--animation-smooth);
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
}

.position-card.is-active {
  transform: translateY(-5px) scale(1.01);
  box-shadow: var(--cosmic-shadow-lg), 
    0 0 20px rgba(15, 185, 253, 0.2), 
    0 0 40px rgba(15, 185, 253, 0.1);
  border-color: rgba(15, 185, 253, 0.4);
  z-index: 2;
}

.position-card.is-active::before {
  opacity: 1;
}

.position-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.4s var(--animation-smooth);
  border-bottom: var(--cosmic-glass-border);
  position: relative;
  z-index: 2;
}

.position-header:hover {
  background: var(--cosmic-glass-bg-lighter);
}

.position-header-content {
  flex: 1;
}

.position-title {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--cosmic-text-primary);
  font-weight: 600;
  transition: all 0.3s var(--animation-smooth);
  position: relative;
  display: inline-block;
}

.position-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--cosmic-blue);
  transition: width 0.4s var(--animation-bounce);
  border-radius: 2px;
  opacity: 0.7;
}

.position-card.is-active .position-title,
.position-header:hover .position-title {
  color: var(--cosmic-blue);
}

.position-card.is-active .position-title::after,
.position-header:hover .position-title::after {
  width: 100%;
}

.position-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  opacity: 0.9;
  transition: opacity 0.3s var(--animation-smooth);
}

.position-header:hover .position-meta {
  opacity: 1;
}

.position-location, .position-type {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cosmic-text-secondary);
  font-size: 0.95rem;
  transition: all 0.3s var(--animation-smooth);
}

.position-location i, .position-type i {
  color: var(--cosmic-blue);
  font-size: 0.9rem;
  transition: all 0.4s var(--animation-bounce);
}

.position-header:hover .position-location i, 
.position-header:hover .position-type i {
  transform: scale(1.2);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.position-action {
  margin-left: 2rem;
}

.expand-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border);
  color: var(--cosmic-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s var(--animation-bounce);
  position: relative;
  z-index: 1;
}

.expand-toggle::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(
    145deg, 
    rgba(15, 185, 253, 0.3), 
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s var(--animation-smooth), transform 0.4s var(--animation-smooth);
  z-index: -1;
  transform: scale(0.8);
}

.expand-toggle i {
  transition: transform 0.5s var(--animation-bounce);
}

.expand-toggle:hover, .expand-toggle.is-open {
  background: var(--cosmic-glass-bg-lighter);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-glow-blue-sm);
  border-color: var(--cosmic-blue);
  color: var(--cosmic-blue);
}

.expand-toggle:hover::before, .expand-toggle.is-open::before {
  opacity: 1;
  transform: scale(1);
}

.expand-toggle.is-open {
  transform: rotate(180deg);
  background: rgba(15, 185, 253, 0.1);
}

.position-overview {
  padding: 1.5rem;
  border-bottom: var(--cosmic-glass-border);
  position: relative;
  z-index: 1;
  transition: all 0.4s var(--animation-smooth);
}

.position-overview p {
  color: var(--cosmic-text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  transition: all 0.3s var(--animation-smooth);
}

.overview-footer {
  display: flex;
  justify-content: flex-end;
}

.view-details-btn {
  font-size: 0.95rem;
  padding: 0.5rem 1.25rem;
  transition: all 0.4s var(--animation-bounce);
  position: relative;
  overflow: hidden;
}

.view-details-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  z-index: -1;
}

.view-details-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), var(--cosmic-glow-blue-sm);
}

.view-details-btn:hover::before {
  opacity: 1;
}

.view-details-btn:active {
  transform: translateY(-1px);
}

.position-details {
  padding: 1.5rem;
  animation: expandSection 0.6s var(--animation-bounce);
  transform-origin: top center;
  position: relative;
  z-index: 1;
}

.position-full-description {
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: var(--cosmic-glass-bg-darker);
  border-radius: 12px;
  border: var(--cosmic-glass-border);
  transform: translateY(10px);
  opacity: 0;
  animation: fadeSlideUp 0.5s var(--animation-smooth) forwards;
  animation-delay: 0.1s;
  position: relative;
  overflow: hidden;
}

.position-full-description::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  pointer-events: none;
}

.position-full-description:hover::before {
  opacity: 1;
}

.position-full-description p {
  color: var(--cosmic-text-secondary);
  line-height: 1.7;
}

.position-sections {
  display: grid;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.position-section {
  background: var(--cosmic-glass-bg-darker);
  border-radius: 12px;
  border: var(--cosmic-glass-border);
  overflow: hidden;
  transform: translateY(20px);
  opacity: 0;
  animation: fadeSlideUp 0.5s var(--animation-smooth) forwards;
  transition: all 0.4s var(--animation-bounce);
  position: relative;
}

.position-section:nth-child(1) { animation-delay: 0.2s; }
.position-section:nth-child(2) { animation-delay: 0.3s; }
.position-section:nth-child(3) { animation-delay: 0.4s; }
.position-section:nth-child(4) { animation-delay: 0.5s; }

.position-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.02) 40%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  pointer-events: none;
}

.position-section:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-sm);
  border-color: rgba(15, 185, 253, 0.3);
}

.position-section:hover::before {
  opacity: 1;
}

.position-section h4 {
  padding: 1.25rem 1.5rem;
  margin: 0;
  background: var(--cosmic-glass-bg);
  color: var(--cosmic-blue);
  font-size: 1.2rem;
  border-bottom: var(--cosmic-glass-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s var(--animation-smooth);
}

.position-section:hover h4 {
  background: rgba(15, 185, 253, 0.1);
}

.position-section h4 i {
  font-size: 1rem;
  transition: transform 0.4s var(--animation-bounce);
}

.position-section:hover h4 i {
  transform: scale(1.2);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.section-items {
  list-style: none;
  padding: 1.5rem;
  margin: 0;
  display: grid;
  gap: 1rem;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInItems 0.5s var(--animation-smooth) forwards;
  animation-delay: 0.2s;
}

.section-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--cosmic-glass-bg);
  border-radius: 8px;
  border: var(--cosmic-glass-border);
  color: var(--cosmic-text-secondary);
  transition: all 0.4s var(--animation-bounce);
  position: relative;
  overflow: hidden;
}

.section-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.07),
    rgba(255, 255, 255, 0.03) 40%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s var(--animation-smooth);
  pointer-events: none;
}

.section-item:hover {
  background: var(--cosmic-glass-bg-lighter);
  transform: translateX(10px);
  border-color: rgba(15, 185, 253, 0.3);
  box-shadow: var(--cosmic-glow-blue-sm);
  color: var(--cosmic-text-primary);
}

.section-item:hover::before {
  opacity: 1;
}

.section-item i {
  color: var(--cosmic-blue);
  font-size: 1rem;
  margin-top: 0.25rem;
  transition: all 0.4s var(--animation-bounce);
}

.section-item:hover i {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.position-apply {
  margin-top: 2rem;
  text-align: center;
  padding-top: 2rem;
  border-top: var(--cosmic-glass-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transform: translateY(20px);
  opacity: 0;
  animation: fadeSlideUp 0.5s var(--animation-smooth) forwards;
  animation-delay: 0.6s;
}

.apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition: all 0.5s var(--animation-bounce);
  border-radius: 50px;
}

.apply-btn::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: conic-gradient(
    from 0deg,
    var(--cosmic-blue) 0%,
    rgba(103, 58, 183, 0.8) 25%,
    var(--cosmic-blue) 50%,
    rgba(103, 58, 183, 0.8) 75%,
    var(--cosmic-blue) 100%
  );
  opacity: 0;
  transition: opacity 0.5s var(--animation-smooth);
  z-index: -1;
  animation: rotateConic 10s linear infinite;
  filter: blur(10px);
}

.apply-btn:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-lg), 
    0 0 20px rgba(15, 185, 253, 0.3), 
    0 0 40px rgba(15, 185, 253, 0.2);
  letter-spacing: 0.5px;
}

.apply-btn:hover::before {
  opacity: 0.2;
}

.apply-btn:active {
  transform: translateY(-2px);
}

.apply-btn i {
  transition: all 0.4s var(--animation-bounce);
}

.apply-btn:hover i {
  transform: translateX(3px);
}

.apply-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--cosmic-text-tertiary);
  font-size: 0.95rem;
  transition: all 0.3s var(--animation-smooth);
  opacity: 0.8;
}

.apply-note:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.apply-note i {
  color: var(--cosmic-blue);
  transition: all 0.4s var(--animation-bounce);
}

.apply-note:hover i {
  transform: scale(1.2);
  filter: drop-shadow(0 0 5px rgba(15, 185, 253, 0.5));
}

.empty-state {
  padding: 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  background: transparent;
  border: var(--cosmic-glass-border);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeSlideUp 1s var(--animation-bounce) forwards;
  animation-delay: 0.3s;
}

.empty-state::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(15, 185, 253, 0.05) 0%,
    transparent 70%
  );
  z-index: -1;
  opacity: 0.7;
}

.empty-state i {
  font-size: 4rem;
  color: var(--cosmic-blue);
  margin-bottom: 1rem;
  animation: pulseIcon 3s infinite alternate var(--animation-smooth);
  filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.3));
}

.empty-state h3 {
  font-size: 2rem;
  color: var(--cosmic-text-primary);
  background: var(--cosmic-gradient-blue);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.empty-state p {
  color: var(--cosmic-text-secondary);
  max-width: 600px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.empty-state .cosmic-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  transition: all 0.4s var(--animation-bounce);
}

.empty-state .cosmic-btn:hover {
  transform: translateY(-5px);
  box-shadow: var(--cosmic-shadow-md), var(--cosmic-glow-blue-md);
}

@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes expandSection {
  from {
    opacity: 0;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes fadeInItems {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseIcon {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px rgba(15, 185, 253, 0.3));
  }
  100% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(15, 185, 253, 0.5));
  }
}

@keyframes rotateConic {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .filter-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-button {
    width: 100%;
    text-align: center;
  }
  
  .position-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .position-action {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .position-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .position-title {
    font-size: 1.25rem;
  }
  
  .view-details-btn, .apply-btn {
    width: 100%;
  }
}
</style> 