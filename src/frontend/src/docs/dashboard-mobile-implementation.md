# CosmicRafts Mobile Dashboard Implementation Guide

This document outlines the specific mobile-first features implemented in the CosmicRafts Dashboard.

## Core Features Implemented

### 1. Bottom Tab Navigation System

Our implementation uses a fixed bottom navigation bar with 5 key destinations, allowing users to quickly navigate between primary app functions. The approach provides:

- **Icon + Text Labels**: Each tab includes both an icon and text for clarity
- **Visual Feedback**: Active tab has color and glow effects
- **Location Context**: Header title updates based on current section
- **Safe Area Support**: Navigation adjusts for notched phones using CSS env()

```vue
<nav class="mobile-bottom-nav">
  <button 
    v-for="tab in bottomNavTabs" 
    :key="tab.id"
    @click="selectTab(tab.id)"
    class="bottom-nav-item" 
    :class="{ active: activeTab === tab.id }"
  >
    <i :class="tab.icon"></i>
    <span>{{ tab.label }}</span>
  </button>
</nav>
```

### 2. Multi-Level Navigation History

We've implemented a stack-based navigation history system that tracks user movement through the app and enables proper back button functionality:

```js
// When selecting a new tab
navHistory.value.push(activeTab.value);
activeTab.value = tabId;

// When going back
activeTab.value = navHistory.value.pop();
```

### 3. Native Gestures

#### Pull-to-Refresh

Implemented with touch event handlers that:
- Track touch position deltas
- Apply logarithmic resistance for natural feel
- Show visual pull indicator with spinner
- Include threshold detection for refresh trigger
- Provide visual feedback during refresh operation

```js
// In touchmove handler
if (isPulling.value && !isHorizontalSwipe.value) {
  if (verticalDistance > 0) {
    const translateY = Math.min(Math.pow(verticalDistance, 0.8), pullThreshold);
    pullIndicator.style.transform = `translateY(${translateY}px)`;
    
    // Visual feedback during pull
    spinner.style.transform = `rotate(${verticalDistance * 2}deg)`;
  }
}
```

#### Swipe Navigation

Horizontal swipe detection for natural tab navigation:
- Detects primary swipe direction (horizontal vs vertical)
- Applies resistance effect during swipe for feedback
- Triggers tab transition when threshold is met
- Includes haptic feedback via vibration API
- Provides smooth animation back to position when threshold not met

```js
// Swipe gesture detection
const horizontalDistance = swipeMoveX.value - swipeStartX.value;
if (Math.abs(horizontalDistance) > swipeThreshold) {
  // Swipe threshold reached, navigate to adjacent tab
  selectTab(allTabs[newIndex].id);
  
  // Haptic feedback
  navigator.vibrate(50);
}
```

### 4. Tab Transitions

Direction-aware transitions that flow naturally based on navigation direction:

```js
// Determine transition direction based on tab index
if (newIndex > currentIndex) {
  transitionDirection.value = 'right';
} else {
  transitionDirection.value = 'left';
}

// Apply transition based on direction
const beforeEnter = (el) => {
  el.style.transform = `translateX(${direction === 'right' ? '50px' : '-50px'})`;
};
```

### 5. Floating Action Button

A context-aware Floating Action Button (FAB) with expandable menu:
- Fixed position above bottom navigation bar
- Expands to show contextually relevant actions
- Includes smooth rotation animation
- Features backdrop blur when expanded
- Provides visual tooltips on hover

```vue
<div class="fab-container" :class="{ 'fab-expanded': isFabExpanded }">
  <div class="fab-actions" :class="{ 'fab-actions-visible': isFabExpanded }">
    <!-- Action buttons -->
  </div>
  <button class="fab-main" @click="toggleFab">
    <i class="fas" :class="isFabExpanded ? 'fa-times' : 'fa-plus'"></i>
  </button>
</div>
```

### 6. Toast Notification System

A comprehensive toast notification system that:
- Shows success/error/info/achievement states
- Auto-dismisses after configurable duration
- Includes progress indicator for timeout
- Features slick enter/exit animations
- Has manual dismiss option 
- Properly stacks multiple notifications

```js
// Show toast with various options
showToast({
  title: 'Daily Reward Claimed!',
  message: 'You received 50 STDs and 25 XP',
  type: 'reward',
  duration: 5000,
  showProgress: true
});
```

### 7. Skeleton Loading

Implemented content-aware skeleton loading that:
- Matches exact shape and structure of final content
- Includes subtle pulse animation
- Features shimmer effect with CSS gradients
- Provides immediate visual feedback about layout
- Transitions smoothly to actual content when loaded

```vue
<template v-if="tokenStore.loading">
  <!-- Skeleton Token Cards -->
  <div v-for="i in 3" :key="`skeleton-token-${i}`" class="skeleton-card token-skeleton">
    <div class="skeleton-header">
      <div class="skeleton-icon"></div>
      <div class="skeleton-title"></div>
    </div>
    <!-- More skeleton structure -->
  </div>
</template>
```

```css
.skeleton-card {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  position: relative;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -150px;
  width: 150px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  animation: skeleton-shine 2s ease-in-out infinite;
}
```

### 8. Interactive Welcome Card

Enhanced welcome card with:
- Particle animations in background
- XP progress visualization 
- Stat summary with visual hierarchy
- Daily check-in functionality
- Haptic feedback on interactions
- Responsive layout adjustments

## CSS Techniques Used

### Glass Morphism

Applied throughout the dashboard for a modern look:

```css
.cosmic-panel {
  background: var(--cosmic-glass-bg);
  backdrop-filter: var(--cosmic-glass-blur);
  border: var(--cosmic-glass-border-blue);
}
```

### Notch Safety

Ensured compatibility with notched devices:

```css
.mobile-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}
```

### Animation Best Practices

Followed performance guidelines for smooth animations:

```css
.fab-main {
  will-change: transform;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Grid Layouts

Used responsive grid layouts for content:

```css
.nft-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
```

## Performance Considerations

1. **Transition Optimization**
   - Used opacity/transform for animations
   - Applied will-change sparingly
   - Kept animations under 300ms
   - Used hardware-accelerated properties

2. **Loading States**
   - Added skeleton loaders to indicate structure
   - Implemented content-aware placeholders
   - Used progressive loading techniques

3. **Touch Handling**
   - Optimized touch event handlers
   - Applied debouncing to gesture detection
   - Used passive listeners when possible 