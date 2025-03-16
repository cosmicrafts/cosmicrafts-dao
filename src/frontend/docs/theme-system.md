# Cosmicrafts UI

A comprehensive theme system for building beautiful and consistent user interfaces for the Cosmicrafts platform.

## Introduction

Cosmicrafts UI is a set of reusable, themeable components built with Vue 3 and CSS variables. The design language combines futuristic cosmic aesthetics with a clean, modern UI approach.

## Installation

The theme system is pre-installed in the Cosmicrafts project, but if you need to set it up in a new project:

```bash
# Clone the repository
git clone https://github.com/cosmicrafts/cosmic-ui.git

# Copy the assets folder to your project
cp -r cosmic-ui/src/assets/css /your-project/src/assets

# Import the CSS in your main.js or main.ts
import '@/assets/css/cosmic-theme.css'
```

## Core Concepts

### Theme Variables

All components use CSS variables for colors, spacing, animations, and more. This allows for easy theming and consistent styling.

```css
:root {
  /* Colors */
  --cosmic-blue: #0094ff;
  --cosmic-blue-dark: #0170c2;
  --cosmic-orange: #ff7700;
  --cosmic-purple: #a855f7;
  
  /* Spacing */
  --cosmic-space-xs: 0.25rem;
  --cosmic-space-sm: 0.5rem;
  --cosmic-space-md: 1rem;
  --cosmic-space-lg: 1.5rem;
  --cosmic-space-xl: 2rem;
  
  /* ... more variables */
}
```

### Layout Considerations

#### Header Spacing

All pages should account for the fixed header:

```css
.page-container {
  padding-top: var(--cosmic-header-height, 80px);
  min-height: 100vh;
}
```

## Components

### Buttons

We have four main button variants for different contexts.

#### Primary Button

For primary actions like "Play Now", "Sign Up", etc.

```html
<button class="cosmic-button cosmic-button-primary">
  <span class="button-text">Primary Action</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>
```

#### Secondary Button

For secondary actions like "Learn More", "View Details", etc.

```html
<button class="cosmic-button cosmic-button-secondary">
  <span class="button-text">Secondary Action</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>
```

#### Outline Buttons

For less prominent actions.

```html
<button class="cosmic-button cosmic-button-outline-primary">
  <span class="button-text">Outline Primary</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<button class="cosmic-button cosmic-button-outline-secondary">
  <span class="button-text">Outline Secondary</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>
```

#### Button Sizes

Add size modifiers for different button sizes:

```html
<!-- Small button -->
<button class="cosmic-button cosmic-button-primary cosmic-button-sm">
  <span class="button-text">Small Button</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<!-- Large button -->
<button class="cosmic-button cosmic-button-primary cosmic-button-lg">
  <span class="button-text">Large Button</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>
```

#### Special Buttons

We also provide contextual buttons:

```html
<button class="cosmic-button cosmic-button-danger">
  <span class="button-text">Danger</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<button class="cosmic-button cosmic-button-success">
  <span class="button-text">Success</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<button class="cosmic-button cosmic-button-warning">
  <span class="button-text">Warning</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>
```

### Cards & Panels

#### Standard Card

```html
<div class="cosmic-card">
  <div class="cosmic-card-header">
    <div class="cosmic-card-title">
      <h3>Card Title</h3>
    </div>
  </div>
  <div class="cosmic-card-body">
    <p>Card content goes here...</p>
  </div>
  <div class="cosmic-card-footer">
    <p>Card Footer</p>
  </div>
</div>
```

#### Themed Cards

```html
<div class="cosmic-card cosmic-panel-primary">
  <div class="cosmic-card-header">
    <div class="cosmic-card-title">
      <h3 class="cosmic-title">Primary Card</h3>
    </div>
  </div>
  <div class="cosmic-card-body">
    <p>Primary themed card content...</p>
  </div>
</div>

<div class="cosmic-card cosmic-panel-secondary">
  <div class="cosmic-card-header">
    <div class="cosmic-card-title">
      <h3 class="cosmic-title-secondary">Secondary Card</h3>
    </div>
  </div>
  <div class="cosmic-card-body">
    <p>Secondary themed card content...</p>
  </div>
</div>
```

#### Simple Panels

For simpler content containers:

```html
<div class="cosmic-panel">
  <h3>Standard Panel</h3>
  <p>Content goes here...</p>
</div>

<div class="cosmic-panel cosmic-panel-primary">
  <h3 class="cosmic-text-glow">Primary Panel</h3>
  <p>Content with primary styling...</p>
</div>

<div class="cosmic-panel cosmic-panel-secondary">
  <h3 class="cosmic-text-glow-secondary">Secondary Panel</h3>
  <p>Content with secondary styling...</p>
</div>
```

### Typography

#### Gradient Titles

```html
<h2 class="cosmic-title">Primary Gradient Title</h2>
<h2 class="cosmic-title-secondary">Secondary Gradient Title</h2>
```

#### Glowing Text

```html
<p class="cosmic-text-glow">Primary glowing text</p>
<p class="cosmic-text-glow-secondary">Secondary glowing text</p>
```

#### Utility Text Classes

```html
<p class="text-primary-color">Blue text</p>
<p class="text-secondary-color">Orange text</p>
<p class="text-accent-color">Purple text</p>
```

### Navigation Links

```html
<a href="#" class="cosmic-nav-link">Standard Navigation Link</a>
<a href="#" class="cosmic-nav-link cosmic-hover">Link with Hover Effect</a>
<a href="#" class="cosmic-nav-link cosmic-text-glow">Glowing Link</a>
```

### Social Icons

```html
<a href="https://discord.com/invite/cosmicrafts" class="cosmic-social-icon" target="_blank">
  <img src="@/assets/icons/discord.svg" alt="Discord" />
</a>

<a href="https://x.com/cosmicrafts" class="cosmic-social-icon" target="_blank">
  <img src="@/assets/icons/x.svg" alt="Twitter" />
</a>
```

### Accordion Components

```html
<div class="accordion cosmic-panel">
  <div 
    class="accordion-header" 
    :class="{ 'active': isExpanded.section1 }"
    @click="toggleSection('section1')"
  >
    <h4 class="cosmic-text-glow">Section Title</h4>
    <i class="fas" :class="isExpanded.section1 ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
  </div>
  <div class="accordion-content" :style="{ maxHeight: isExpanded.section1 ? '200px' : '0' }">
    <div class="accordion-inner">
      <p>Accordion content goes here...</p>
    </div>
  </div>
</div>
```

With this script:

```javascript
import { ref } from 'vue';

// Manage accordion sections state
const isExpanded = ref({
  section1: true,
  section2: false
});

// Toggle accordion sections
const toggleSection = (section) => {
  isExpanded.value[section] = !isExpanded.value[section];
};
```

### Animations

Add these classes to create animated elements:

```html
<div class="cosmic-float">This element will float up and down</div>
<div class="cosmic-pulse">This element will pulse in and out</div>
<div class="cosmic-glow">This will have a pulsing glow effect</div>
<span class="cosmic-text-glow-animate">Text with animated glow</span>
```

## Glass UI Effects

### Glass Backgrounds

```html
<div class="cosmic-glass-bg">Default glass background</div>
<div class="cosmic-glass-bg-lighter">Lighter glass background</div>
<div class="cosmic-glass-bg-darker">Darker glass background</div>
```

### Glass Borders

```html
<div style="border: var(--cosmic-glass-border);">Standard glass border</div>
<div style="border: var(--cosmic-glass-border-blue);">Blue glass border</div>
```

## Best Practices

1. **Consistency in Action Types**: Use primary buttons for main actions, secondary for alternatives

2. **Color Meaning**:
   - Blue: Primary UI and most important actions
   - Orange: Secondary actions and calls to attention
   - Purple: Special elements and tertiary actions

3. **Maintain Visual Hierarchy**:
   - Use proper button styles to guide users to important actions
   - Ensure primary actions stand out visually
   - Don't overuse glowing effects (they should highlight important elements)

4. **Layout Spacing**:
   - Always account for the fixed header at the top of pages
   - Use the spacing variables for consistent margins and padding

5. **Responsive Design**:
   - All components are designed to be responsive by default
   - Test layouts on mobile devices (< 768px width)

6. **Animation Use**:
   - Use animations sparingly to avoid visual overload
   - Ensure animations enhance UX rather than distract

## Customization

While Cosmicrafts UI comes with a predefined theme, you can override CSS variables to customize it for specific use cases:

```css
/* Custom theme variations */
.dark-theme {
  --cosmic-blue: #00c3ff;
  --cosmic-text-primary: #ffffff;
  --cosmic-glass-bg: rgba(15, 23, 42, 0.75);
}

.light-theme {
  --cosmic-blue: #0082e6;
  --cosmic-text-primary: #1e293b;
  --cosmic-glass-bg: rgba(255, 255, 255, 0.7);
}
```

## Interactive Guide

For a complete visual reference of all components and styles, visit the [Theme Guide](/theme-guide) in the application. 