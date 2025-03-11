# Cosmic Theme Styling Guide

This guide provides an overview of the Cosmic Theme styling system for the Cosmicrafts application. The theme provides a consistent, elegant 3D glassy and glowy aesthetic across all components.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Color Variables](#color-variables)
3. [Component Classes](#component-classes)
4. [Text Effects](#text-effects)
5. [Icons and Badges](#icons-and-badges)
6. [Animations](#animations)
7. [Responsive Design](#responsive-design)
8. [Best Practices](#best-practices)

## Getting Started

The Cosmic Theme is automatically imported in the main `style.css` file. To use the theme in your components, simply apply the appropriate classes to your HTML elements.

```vue
<template>
  <div class="cosmic-panel">
    <h2 class="cosmic-title">Welcome to Cosmicrafts</h2>
    <p>This is a cosmic-styled panel with a glassy effect.</p>
    <button class="cosmic-button cosmic-button-primary">Get Started</button>
  </div>
</template>
```

## Color Variables

The theme provides a set of CSS variables for consistent colors across the application:

### Primary Colors

```css
--cosmic-blue: #0FB9FD;
--cosmic-blue-light: #4DCFFF;
--cosmic-blue-dark: #0A8BC0;
--cosmic-orange: #FF9100;
--cosmic-orange-light: #FFB800;
--cosmic-green: #00E5A4;
--cosmic-red: #FF4B4B;
```

### Background Colors

```css
--cosmic-bg-dark: #19222e;
--cosmic-bg-darker: #0A1420;
--cosmic-bg-darkest: #050A10;
```

### Text Colors

```css
--cosmic-text-primary: rgba(255, 255, 255, 0.95);
--cosmic-text-secondary: rgba(255, 255, 255, 0.85);
--cosmic-text-tertiary: rgba(255, 255, 255, 0.7);
```

### Glassy Panel Styles

```css
--cosmic-glass-bg: linear-gradient(to bottom, rgba(30, 43, 56, 0.65), rgba(23, 33, 43, 0.72));
--cosmic-glass-bg-darker: linear-gradient(to bottom, rgba(23, 33, 43, 0.75), rgba(15, 25, 35, 0.85));
--cosmic-glass-bg-lighter: linear-gradient(to bottom, rgba(35, 50, 65, 0.65), rgba(28, 40, 52, 0.72));
--cosmic-glass-border: 1px solid rgba(255, 255, 255, 0.12);
--cosmic-glass-border-blue: 1px solid rgba(15, 185, 253, 0.15);
--cosmic-glass-blur: blur(8px);
```

### Glow Effects

```css
--cosmic-glow-blue-sm: 0 0 10px rgba(15, 185, 253, 0.3);
--cosmic-glow-blue-md: 0 0 15px rgba(15, 185, 253, 0.4);
--cosmic-glow-blue-lg: 0 0 20px rgba(15, 185, 253, 0.5);
--cosmic-glow-orange-sm: 0 0 10px rgba(255, 145, 0, 0.3);
--cosmic-glow-orange-md: 0 0 15px rgba(255, 145, 0, 0.4);
--cosmic-glow-orange-lg: 0 0 20px rgba(255, 145, 0, 0.5);
```

### Shadows

```css
--cosmic-shadow-sm: 0 4px 8px rgba(0, 0, 0, 0.15);
--cosmic-shadow-md: 0 8px 16px rgba(0, 0, 0, 0.2);
--cosmic-shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.25);
```

### Transitions

```css
--cosmic-transition-fast: 0.2s ease;
--cosmic-transition-medium: 0.3s ease;
--cosmic-transition-slow: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
```

## Component Classes

### Panels and Cards

Use these classes for container elements:

- `cosmic-panel`: A glassy panel with subtle hover effects
- `cosmic-card`: A 3D card with more pronounced hover effects

```vue
<div class="cosmic-panel">
  <h3>This is a panel</h3>
  <p>Panels have subtle hover effects and are good for larger containers.</p>
</div>

<div class="cosmic-card">
  <h3>This is a card</h3>
  <p>Cards have more pronounced 3D hover effects and work well for smaller containers.</p>
</div>
```

### Buttons

- `cosmic-button`: Base button style
- `cosmic-button-primary`: Primary action button with gradient background
- `cosmic-button-outline`: Outline button with glowing border effect

```vue
<button class="cosmic-button">Secondary Action</button>
<button class="cosmic-button cosmic-button-primary">Primary Action</button>
<button class="cosmic-button cosmic-button-outline">Connect Wallet</button>
```

### Navigation

- `cosmic-nav-link`: Navigation link with subtle hover effect
- `cosmic-hover`: Special hover effect with orange lines (used in header)

```vue
<a href="#" class="cosmic-nav-link">Regular Nav Link</a>
<a href="#" class="cosmic-hover">Header Nav Link</a>
```

## Text Effects

- `cosmic-title`: Glowing title with gradient effect
- `cosmic-text-glow`: Text with blue glow effect
- `cosmic-text-glow-animate`: Text with animated glow effect

```vue
<h1 class="cosmic-title">Glowing Gradient Title</h1>
<p class="cosmic-text-glow">This text has a blue glow effect on hover</p>
<span class="cosmic-text-glow-animate">This text has an animated glow effect</span>
```

## Icons and Badges

- `cosmic-icon`: Container for icons with hover effects
- `cosmic-social-icon`: Larger icon container for social media icons
- `cosmic-badge`: Small badge for labels or status indicators

```vue
<div class="cosmic-icon">
  <i class="fas fa-star"></i>
</div>

<a href="#" class="cosmic-social-icon">
  <img src="@/assets/icons/discord.svg" alt="Discord" />
</a>

<span class="cosmic-badge">New</span>
```

## Animations

- `cosmic-float`: Gentle floating animation
- `cosmic-pulse`: Subtle pulsing animation
- `cosmic-glow`: Animated glow effect for containers

```vue
<img src="logo.png" class="cosmic-float" alt="Floating Logo" />
<div class="cosmic-pulse">This element pulses</div>
<div class="cosmic-glow">This element has an animated glow</div>
```

## Responsive Design

The Cosmic Theme includes responsive breakpoints for mobile and tablet devices:

```css
/* Mobile-specific styles */
@media (max-width: 768px) {
  /* Mobile styles here */
}

/* Tablet-specific styles */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles here */
}
```

## Best Practices

1. **Consistency**: Use the provided classes and variables consistently across components.
2. **Performance**: Be mindful of performance when using multiple glow and animation effects.
3. **Accessibility**: Ensure sufficient contrast between text and backgrounds.
4. **Responsive Design**: Test your components on different screen sizes.
5. **Hover States**: Provide visual feedback for interactive elements.

### Example: Header Component

```vue
<header class="cosmic-header">
  <div class="logo">
    <img src="@/assets/logo.svg" alt="Logo" />
  </div>
  <nav>
    <ul>
      <li><a href="#" class="cosmic-hover">Home</a></li>
      <li><a href="#" class="cosmic-hover">About</a></li>
      <li><a href="#" class="cosmic-hover">Contact</a></li>
    </ul>
  </nav>
  <button class="cosmic-button cosmic-button-primary">Connect</button>
</header>
```

### Example: Footer Component

```vue
<footer class="cosmic-footer">
  <div class="footer-content">
    <div class="footer-nav">
      <h4 class="cosmic-text-glow">Navigation</h4>
      <ul>
        <li><a href="#" class="cosmic-nav-link">Home</a></li>
        <li><a href="#" class="cosmic-nav-link">About</a></li>
        <li><a href="#" class="cosmic-nav-link">Contact</a></li>
      </ul>
    </div>
    <div class="footer-social">
      <h4 class="cosmic-text-glow">Connect</h4>
      <div class="social-icons">
        <a href="#" class="cosmic-social-icon">
          <img src="@/assets/icons/twitter.svg" alt="Twitter" />
        </a>
        <a href="#" class="cosmic-social-icon">
          <img src="@/assets/icons/discord.svg" alt="Discord" />
        </a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2023 Cosmicrafts. All rights reserved.</p>
  </div>
</footer>
```

By following this guide, you'll ensure a consistent and beautiful cosmic theme across the entire application. 