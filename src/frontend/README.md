# Cosmicrafts Frontend Style Guide

This document provides an overview of the Cosmicrafts UI design system and style guidelines.

## Style System Overview

The Cosmicrafts UI uses a consistent design system built on CSS variables and utility classes. The system is organized as follows:

### 1. Core Style Files

- **universal.css** - The foundation of our design system containing all CSS variables, utility classes, and reusable components
- **style.css** - Global styles that apply to the entire application, imports universal.css

### 2. Component Library

We use Vue components that implement our design system:

- **CosmicButton** - Button component with various styles and states
- **CosmicCard** - Card component for content containers
- And more...

## How to Use the Style System

### CSS Variables

Our design system uses CSS variables for consistent styling. Access them using the `var()` function:

```css
.my-element {
  color: var(--color-primary);
  padding: var(--space-md);
}
```

### Utility Classes

Use utility classes to quickly apply common styles:

```html
<div class="bg-surface">
  <h2 class="title-medium">Section Title</h2>
  <p class="text-secondary">This is some content.</p>
</div>
```

### Components

Use our Vue components for consistent UI elements:

```html
<CosmicButton label="Click Me" variant="primary" />
<CosmicCard title="Card Title">
  Card content goes here
</CosmicCard>
```

## Style Guide

For a visual reference of all available styles and components, visit the Style Guide page in the application.

## Naming Conventions

- All utility classes use the `cosmic-` prefix or descriptive names like `bg-surface`
- Component classes follow the BEM methodology (Block, Element, Modifier)
- CSS variables use descriptive names with categories (e.g., `--color-primary`, `--space-md`)

## Legacy Support

Some older components may use legacy class names. When updating these components:

1. Replace `.button` with `.cosmic-button` or the `CosmicButton` component
2. Replace `.markdown-content` with `.cosmic-markdown`
3. Replace `.u-hover` with `.cosmic-hover`

## Markdown Styling

For content that uses markdown:

1. Apply the `.cosmic-markdown` class to the container
2. All markdown elements will be styled automatically

## Responsive Design

The design system includes responsive breakpoints:

```css
@media (max-width: 768px) {
  /* Mobile styles */
}
```

## Contributing

When adding new styles:

1. Add variables to universal.css
2. Create utility classes with the `cosmic-` prefix
3. Update the Style Guide to showcase the new styles
4. Document any new components or classes 