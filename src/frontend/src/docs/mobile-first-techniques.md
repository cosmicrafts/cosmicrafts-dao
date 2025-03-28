# Mobile-First UI Techniques for Modern Web Apps

This guide documents key mobile-first UI techniques that create a native app-like experience in web applications.

## Core Mobile UX Patterns

### 1. Bottom Navigation

```vue
<nav class="mobile-bottom-nav">
  <button v-for="tab in bottomNavTabs" 
    :key="tab.id" 
    @click="selectTab(tab.id)"
    class="bottom-nav-item" 
    :class="{ active: activeTab === tab.id }">
    <i :class="tab.icon"></i>
    <span>{{ tab.label }}</span>
  </button>
</nav>
```

**Key principles:**
- Limit to 4-5 key destinations
- Use recognizable icons + labels
- Provide clear active state
- Position fixed at bottom within thumb reach
- Add safe area insets for notched devices

### 2. Pull-to-Refresh

```vue
<div @touchstart="handleTouchStart" 
     @touchmove="handleTouchMove" 
     @touchend="handleTouchEnd">
  <!-- Pull indicator + content -->
</div>
```

**Implementation steps:**
1. Track touch position changes
2. Apply resistance to pull distance
3. Show visual indicator with progress
4. Trigger refresh at threshold
5. Animate back to original position
6. Show loading state during refresh

### 3. Smooth Transitions

```js
// Direction-aware transitions
const beforeEnter = (el) => {
  el.style.opacity = 0;
  el.style.transform = `translateX(${direction === 'right' ? '50px' : '-50px'})`;
};

const enter = (el, done) => {
  void el.offsetWidth; // Force reflow
  el.style.transition = 'all 0.3s ease-out';
  el.style.opacity = 1;
  el.style.transform = 'translateX(0)';
  el.addEventListener('transitionend', done, { once: true });
};
```

**Key animation principles:**
- Use direction-aware transitions
- Keep animations under 300ms
- Use cubic-bezier curves for natural feel
- Apply will-change for performance
- Avoid animating expensive properties (use transform/opacity)

### 4. Floating Action Button (FAB)

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

**Best practices:**
- Position at bottom-right within thumb reach
- Use expandable pattern for multiple actions
- Apply clear hover/active states
- Add backdrop when expanded
- Use transform for smooth rotation animation

### 5. Toast Notifications

```vue
<div class="toast-container">
  <transition-group name="toast">
    <div v-for="toast in toastMessages" :key="toast.id" 
         class="toast-notification" :class="`toast-${toast.type}`">
      <!-- Toast content -->
    </div>
  </transition-group>
</div>
```

**Implementation tips:**
- Use auto-dismissing toasts
- Add progress indicator for timeout
- Create different types (success/error/info)
- Keep messages short and actionable
- Use smooth entrance/exit animations
- Make dismissable with tap

## CSS Techniques

### 1. Safe Area Insets

```css
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}
```

**What it solves:**
- Prevents content from being obscured by notches, home indicators, and system bars
- Works on iOS and Android
- Provides consistent spacing across devices

### 2. Backdrop Filter Blur

```css
.glass-card {
  background: rgba(15, 185, 253, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

**Use for:**
- Creating frosted glass effects
- Modal overlays and sheets
- Floating navigation elements
- Cards that overlay colorful backgrounds

### 3. Touch Target Sizing

```css
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

**Guidelines:**
- Minimum 44×44px touch targets (Apple/Google recommendation)
- Add sufficient spacing between touchable elements
- Use padding for invisible touch area expansion
- Ensure hover and active states are visible

### 4. Responsive Grids

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
```

**Techniques:**
- Use minmax with auto-fit/auto-fill
- Apply sensible min widths for content
- Use column count breakpoints as fallback
- Test on various screen sizes

## JavaScript Utilities

### 1. Navigation History Tracking

```js
// When navigating forward
navHistory.push(currentScreen);
currentScreen = newScreen;

// When going back
currentScreen = navHistory.pop();
```

**Implementation points:**
- Track screen hierarchy in array
- Show back button when history exists
- Customize transition direction for back navigation
- Clear history when reaching root level

### 2. Touch Gesture Detection

```js
// Distance calculation
const distance = currentY - startY;

// Resistance factor (gets harder to pull as distance increases)
const resistance = 0.5;
const resistedDistance = Math.pow(distance * resistance, 0.8);

// Threshold checking
if (resistedDistance > threshold) {
  triggerAction();
}
```

**Common gestures to implement:**
- Horizontal swipe for carousel/gallery
- Pull down for refresh
- Swipe to dismiss
- Pinch to zoom
- Long press for context menu

### 3. Viewport Height Handling

```js
// Fix for mobile viewport height issues
const setVH = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

window.addEventListener('resize', setVH);
setVH();
```

**Why it's needed:**
- Mobile browsers handle viewport height inconsistently
- Addresses issues with 100vh in mobile browsers
- Creates reliable full-height layouts

## Performance Optimizations

### 1. List Virtualization

For long scrollable lists, only render items in view:

```vue
<recycle-scroller
  class="items-list"
  :items="items"
  :item-size="50">
  <template #item="{ item }">
    <item-component :item="item" />
  </template>
</recycle-scroller>
```

### 2. Image Optimization

```html
<img 
  loading="lazy"
  srcset="image-sm.webp 400w, image-md.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  src="image-fallback.jpg"
  alt="Description">
```

### 3. Transition Performance

```css
.card {
  will-change: transform, opacity;
  transition: transform 0.3s, opacity 0.3s;
}
```

**Golden rules:**
- Only animate transform and opacity
- Use will-change sparingly
- Keep animations under 300ms
- Test on low-end devices
- Use hardware-accelerated properties

## Accessibility Considerations

- Maintain minimum 4.5:1 contrast ratio
- Ensure touch targets are at least 44×44px
- Add proper ARIA roles for custom controls
- Ensure app works with screen readers
- Test with keyboard navigation

## Testing Your Mobile Interfaces

1. **Device Testing:** Test on actual devices, not just simulators
2. **Throttle Network:** Test under slow 3G conditions
3. **Performance Monitoring:** Check for jank and frame drops
4. **Battery Impact:** Monitor for excessive battery usage
5. **One-Hand Test:** Use app with only one thumb 