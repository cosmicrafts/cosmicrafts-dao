# Cosmicrafts Theme System

This document provides guidelines on how to use the Cosmicrafts unified theme system throughout the application.

## Overview

The Cosmicrafts theme system is a centralized styling approach that provides consistent visual elements across the entire application. It uses CSS variables, reusable components, and utility classes to create a cohesive design language.

## Core Theme Files

- **cosmic-theme.css**: Contains all CSS variables, utility classes, and base component styles
- **ThemeGuide.vue**: Visual documentation of available theme components and styles

## Key Theme Variables

### Colors

```css
--cosmic-blue: #0fb9fd;
--cosmic-blue-light: #4dcfff;
--cosmic-blue-dark: #0081cc;
--cosmic-orange: #ff9800;
--cosmic-orange-light: #ffb74d;
--cosmic-orange-dark: #f57c00;
--cosmic-red: #ff4d4d;
--cosmic-green: #00e676;
--cosmic-yellow: #ffea00;
--cosmic-purple: #7f268b;

--cosmic-text-primary: rgba(255, 255, 255, 0.95);
--cosmic-text-secondary: rgba(255, 255, 255, 0.7);
--cosmic-text-disabled: rgba(255, 255, 255, 0.5);
```

### Background and Panels

```css
--cosmic-glass-bg: rgba(30, 43, 56, 0.4);
--cosmic-glass-bg-lighter: rgba(40, 53, 66, 0.5);
--cosmic-glass-bg-darker: rgba(20, 33, 46, 0.6);
--cosmic-glass-blur: blur(8px);
--cosmic-glass-border: 1px solid rgba(255, 255, 255, 0.1);
--cosmic-glass-border-blue: 1px solid rgba(15, 185, 253, 0.15);
--cosmic-glass-border-orange: 1px solid rgba(255, 153, 0, 0.15);
```

### Shadows and Effects

```css
--cosmic-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
--cosmic-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
--cosmic-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);

--cosmic-glow-blue-sm: 0 0 10px rgba(15, 185, 253, 0.3);
--cosmic-glow-blue-md: 0 0 20px rgba(15, 185, 253, 0.5);
--cosmic-glow-blue-lg: 0 0 30px rgba(15, 185, 253, 0.7);

--cosmic-glow-orange-sm: 0 0 10px rgba(255, 153, 0, 0.3);
--cosmic-glow-orange-md: 0 0 20px rgba(255, 153, 0, 0.5);
--cosmic-glow-orange-lg: 0 0 30px rgba(255, 153, 0, 0.7);
```

## Component Usage Guidelines

### Buttons

Use the `cosmic-button` classes for all buttons:

```html
<!-- Primary Button (Blue) -->
<button class="cosmic-button cosmic-button-primary">
  <span class="button-text">Primary Action</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<!-- Secondary Button (Orange) -->
<button class="cosmic-button cosmic-button-secondary">
  <span class="button-text">Secondary Action</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<!-- Outline Button -->
<button class="cosmic-button cosmic-button-outline-primary">
  <span class="button-text">Outline Action</span>
  <span class="button-glow"></span>
  <span class="button-particles"></span>
</button>

<!-- Size Variants -->
<button class="cosmic-button cosmic-button-primary cosmic-button-sm">Small</button>
<button class="cosmic-button cosmic-button-primary cosmic-button-lg">Large</button>
```

### Cards and Panels

```html
<!-- Default Card -->
<div class="cosmic-card">
  <div class="cosmic-card-header">
    <div class="cosmic-card-title">
      <h3>Card Title</h3>
    </div>
  </div>
  <div class="cosmic-card-body">
    Card content here...
  </div>
  <div class="cosmic-card-footer">
    Footer content...
  </div>
</div>

<!-- Primary Panel -->
<div class="cosmic-panel cosmic-panel-primary">
  Panel content here...
</div>

<!-- Secondary Panel -->
<div class="cosmic-panel cosmic-panel-secondary">
  Panel content here...
</div>
```

### Text Styling

```html
<!-- Title with gradient -->
<h2 class="cosmic-title">Primary Gradient Title</h2>
<h2 class="cosmic-title-secondary">Secondary Gradient Title</h2>

<!-- Glowing text -->
<p class="cosmic-text-glow">Primary glowing text</p>
<p class="cosmic-text-glow-secondary">Secondary glowing text</p>

<!-- Utility text colors -->
<p class="text-primary-color">Primary color text</p>
<p class="text-secondary-color">Secondary color text</p>
<p class="text-accent-color">Accent color text</p>
```

### Social Icons

```html
<a href="#" class="cosmic-social-icon">
  <img src="@/assets/icons/social-icon.svg" alt="Social Icon" />
</a>
```

## Animation Classes

```html
<!-- Floating animation -->
<div class="cosmic-float">Floating element</div>

<!-- Pulse animation -->
<div class="cosmic-pulse">Pulsing element</div>

<!-- Glow animation -->
<div class="cosmic-glow">Glowing element</div>

<!-- Text glow animation -->
<div class="cosmic-text-glow-animate">Text with glow animation</div>
```

## Theme Components

Use the pre-built components that are already integrated with the theme system:

- `CosmicButton.vue` - Button component with various styles and sizes
- `CosmicCard.vue` - Card component with header, body, and footer sections
- `Modal.vue` - Modal dialog with proper styling

## Z-Index Scale

```css
--cosmic-z-base: 1;
--cosmic-z-dropdown: 100;
--cosmic-z-header: 200;
--cosmic-z-modal: 300;
--cosmic-z-popup: 400;
--cosmic-z-toast: 500;
```

## Responsive Design

The theme system includes responsive breakpoints and adjustments for different screen sizes:

```css
@media (max-width: 768px) {
  /* Mobile styles */
}

@media (max-width: 480px) {
  /* Small mobile styles */
}
```

## Migrating Existing Components

When migrating existing components:

1. Replace hardcoded colors with theme variables
2. Use the `cosmic-button` classes for buttons
3. Use `cosmic-card` and `cosmic-panel` for card-like components
4. Apply consistent shadows and effects using variables
5. Use the provided animation classes instead of custom animations
6. Run the theme audit script to identify styling issues

## Theme Audit

A theme audit script is available at `src/frontend/scripts/theme-audit.js` to help identify inconsistencies in the codebase:

```bash
node theme-audit.js
```

## Theme Guide

Visit the Theme Guide at `/theme-guide` to see visual examples of all available components and styles. 