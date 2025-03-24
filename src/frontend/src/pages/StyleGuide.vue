<template>
  <div class="style-guide">
    <div class="cosmic-container">
      <h1 class="text-gradient title-large">Cosmic UI Style Guide</h1>
      <p class="text-secondary">
        This page showcases all the UI components and styles used in the Cosmicrafts application.
      </p>

      <!-- Color System -->
      <section class="cosmic-section">
        <h2 class="title-medium">Color System</h2>
        
        <div class="color-grid">
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-primary)"></div>
            <div class="color-details">
              <span class="color-name">Primary</span>
              <span class="color-value">var(--color-primary)</span>
            </div>
          </div>
          
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-secondary)"></div>
            <div class="color-details">
              <span class="color-name">Secondary</span>
              <span class="color-value">var(--color-secondary)</span>
            </div>
          </div>
          
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-accent)"></div>
            <div class="color-details">
              <span class="color-name">Accent</span>
              <span class="color-value">var(--color-accent)</span>
            </div>
          </div>
          
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-success)"></div>
            <div class="color-details">
              <span class="color-name">Success</span>
              <span class="color-value">var(--color-success)</span>
            </div>
          </div>
          
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-warning)"></div>
            <div class="color-details">
              <span class="color-name">Warning</span>
              <span class="color-value">var(--color-warning)</span>
            </div>
          </div>
          
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-error)"></div>
            <div class="color-details">
              <span class="color-name">Error</span>
              <span class="color-value">var(--color-error)</span>
            </div>
          </div>
          
          <div class="color-item">
            <div class="color-preview" style="background-color: var(--color-info)"></div>
            <div class="color-details">
              <span class="color-name">Info</span>
              <span class="color-value">var(--color-info)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Typography -->
      <section class="cosmic-section">
        <h2 class="title-medium">Typography</h2>
        
        <div class="typography-showcase bg-surface">
          <div class="typography-item">
            <h1 class="title-large">Title Large (var(--text-2xl))</h1>
            <p class="text-tertiary">Font size: var(--text-2xl) / Weight: var(--weight-bold)</p>
          </div>
          
          <div class="typography-item">
            <h2 class="title-medium">Title Medium (var(--text-xl))</h2>
            <p class="text-tertiary">Font size: var(--text-xl) / Weight: var(--weight-bold)</p>
          </div>
          
          <div class="typography-item">
            <h3 class="title-small">Title Small (var(--text-lg))</h3>
            <p class="text-tertiary">Font size: var(--text-lg) / Weight: var(--weight-medium)</p>
          </div>
          
          <div class="typography-item">
            <p class="text-primary">Text Primary</p>
            <p class="text-tertiary">Color: var(--color-text-primary)</p>
          </div>
          
          <div class="typography-item">
            <p class="text-secondary">Text Secondary</p>
            <p class="text-tertiary">Color: var(--color-text-secondary)</p>
          </div>
          
          <div class="typography-item">
            <p class="text-tertiary">Text Tertiary</p>
            <p class="text-tertiary">Color: var(--color-text-tertiary)</p>
          </div>
          
          <div class="typography-item">
            <p class="text-accent">Text Accent</p>
            <p class="text-tertiary">Color: var(--color-primary)</p>
          </div>
          
          <div class="typography-item">
            <p class="text-gradient">Text Gradient</p>
            <p class="text-tertiary">Background: var(--gradient-accent)</p>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section class="cosmic-section">
        <h2 class="title-medium">Buttons</h2>
        
        <div class="component-showcase bg-surface">
          <div class="showcase-section">
            <h3 class="title-small">Button Variants</h3>
            <div class="component-grid">
              <CosmicButton label="Primary" variant="primary" />
              <CosmicButton label="Secondary" variant="secondary" />
              <CosmicButton label="Danger" variant="danger" />
              <CosmicButton label="Success" variant="success" />
              <CosmicButton label="Warning" variant="warning" />
              <CosmicButton label="Info" variant="info" />
            </div>
          </div>
          
          <div class="showcase-section">
            <h3 class="title-small">Button Sizes</h3>
            <div class="component-grid">
              <CosmicButton label="Small" size="sm" />
              <CosmicButton label="Medium" size="md" />
              <CosmicButton label="Large" size="lg" />
            </div>
          </div>
          
          <div class="showcase-section">
            <h3 class="title-small">Button States</h3>
            <div class="component-grid">
              <CosmicButton label="Normal" />
              <CosmicButton label="Disabled" disabled />
              <CosmicButton label="Loading" loading />
              <CosmicButton label="Block" block />
            </div>
          </div>
          
          <div class="showcase-section">
            <h3 class="title-small">Icon Buttons</h3>
            <div class="component-grid">
              <CosmicButton icon="🔍" />
              <CosmicButton icon="📝" label="Edit" />
              <CosmicButton icon="🗑️" variant="danger" />
            </div>
          </div>
        </div>
      </section>

      <!-- Cards -->
      <section class="cosmic-section">
        <h2 class="title-medium">Cards</h2>
        
        <div class="component-showcase bg-surface">
          <div class="showcase-section">
            <h3 class="title-small">Card Variants</h3>
            <div class="component-grid cards-grid">
              <CosmicCard title="Default Card" hover>
                <p>This is a default card with hover effect.</p>
              </CosmicCard>
              
              <CosmicCard title="Primary Card" variant="primary" hover>
                <p>This card has a primary variant style.</p>
              </CosmicCard>
              
              <CosmicCard title="Secondary Card" variant="secondary" hover>
                <p>This card has a secondary variant style.</p>
              </CosmicCard>
              
              <CosmicCard title="Flat Card" variant="flat" hover>
                <p>This is a flat card with minimal styling.</p>
              </CosmicCard>
            </div>
          </div>
          
          <div class="showcase-section">
            <h3 class="title-small">Card Features</h3>
            <div class="component-grid cards-grid">
              <CosmicCard icon="🚀" title="Card with Icon">
                <p>This card has an icon in its header.</p>
              </CosmicCard>
              
              <CosmicCard title="Card with Action" hover>
                <template #action>
                  <CosmicButton variant="info" icon="⚙️" />
                </template>
                <p>This card has an action button in its header.</p>
              </CosmicCard>
              
              <CosmicCard title="Gradient Title" gradientTitle>
                <p>This card has a gradient title.</p>
              </CosmicCard>
              
              <CosmicCard title="Card with Footer" hover>
                <p>This card has a footer section.</p>
                <template #footer>
                  <div class="cosmic-flex-between">
                    <span>Created: Today</span>
                    <CosmicButton label="View" size="sm" variant="info" />
                  </div>
                </template>
              </CosmicCard>
            </div>
          </div>
        </div>
      </section>

      <!-- Background Surfaces -->
      <section class="cosmic-section">
        <h2 class="title-medium">Background Surfaces</h2>
        
        <div class="component-grid surfaces-grid">
          <div class="surface-demo bg-surface">
            <h3 class="title-small">Primary Surface</h3>
            <p class="surface-class">.bg-surface</p>
          </div>
          
          <div class="surface-demo bg-surface-secondary">
            <h3 class="title-small">Secondary Surface</h3>
            <p class="surface-class">.bg-surface-secondary</p>
          </div>
          
          <div class="surface-demo bg-panel">
            <h3 class="title-small">Panel Surface</h3>
            <p class="surface-class">.bg-panel</p>
          </div>
          
          <div class="surface-demo bg-gradient">
            <h3 class="title-small">Gradient Surface</h3>
            <p class="surface-class">.bg-gradient</p>
          </div>
        </div>
      </section>

      <!-- Animations & Effects -->
      <section class="cosmic-section">
        <h2 class="title-medium">Animations & Effects</h2>
        
        <div class="component-showcase bg-surface">
          <div class="showcase-section">
            <h3 class="title-small">Hover Effects</h3>
            <div class="component-grid">
              <div class="effect-demo hover-scale">
                <p>Hover Scale (.hover-scale)</p>
              </div>
              
              <div class="effect-demo glow-effect">
                <p>Glow Effect (.glow-effect)</p>
              </div>
              
              <div class="effect-demo cosmic-hover">
                <p>Cosmic Hover (.cosmic-hover)</p>
              </div>
            </div>
          </div>
          
          <div class="showcase-section">
            <h3 class="title-small">Loading Animation</h3>
            <div class="component-grid">
              <div class="effect-demo">
                <span class="cosmic-loading" style="font-size: 2rem;">⟳</span>
                <p>Loading Spinner (.cosmic-loading)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Markdown Styling -->
      <section class="cosmic-section">
        <h2 class="title-medium">Markdown Styling</h2>
        
        <div class="component-showcase bg-surface">
          <div class="showcase-section">
            <h3 class="title-small">Markdown Content</h3>
            <p class="text-secondary">Apply the <code>.cosmic-markdown</code> class to containers with markdown content.</p>
            
            <div class="cosmic-markdown bg-panel" style="padding: var(--space-md); margin-top: var(--space-md);">
              <h1>Markdown Heading 1</h1>
              <h2>Markdown Heading 2</h2>
              <h3>Markdown Heading 3</h3>
              <h4>Markdown Heading 4</h4>
              
              <p>This is a paragraph with <strong>bold text</strong> and <a href="#">a link</a>.</p>
              
              <blockquote>
                This is a blockquote with some important information.
              </blockquote>
              
              <ul>
                <li>List item one</li>
                <li>List item two
                  <ul>
                    <li>Nested list item</li>
                    <li>Another nested item</li>
                  </ul>
                </li>
                <li>List item three</li>
              </ul>
              
              <code>This is a code block with some sample code.</code>
              
              <p>Below is a simple table:</p>
              
              <table>
                <thead>
                  <tr>
                    <th>Header 1</th>
                    <th>Header 2</th>
                    <th>Header 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cell 1</td>
                    <td>Cell 2</td>
                    <td>Cell 3</td>
                  </tr>
                  <tr>
                    <td>Cell 4</td>
                    <td>Cell 5</td>
                    <td>Cell 6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Example Layouts -->
      <section class="cosmic-section">
        <h2 class="title-medium">Example Layouts</h2>
        
        <CosmicCard title="User Profile Layout Example">
          <div class="example-layout">
            <div class="example-layout-header bg-gradient">
              <div class="example-avatar glow-effect"></div>
              <div class="example-header-content">
                <h3 class="text-gradient">Cosmic Player</h3>
                <p class="text-secondary">Level 42 • Galactic Explorer</p>
              </div>
            </div>
            
            <div class="example-layout-content cosmic-grid">
              <div class="bg-panel example-stat">
                <span class="example-icon">⚔️</span>
                <div>
                  <h4>Battles</h4>
                  <p>142</p>
                </div>
              </div>
              
              <div class="bg-panel example-stat">
                <span class="example-icon">🏆</span>
                <div>
                  <h4>Victories</h4>
                  <p>98</p>
                </div>
              </div>
              
              <div class="bg-panel example-stat">
                <span class="example-icon">⭐</span>
                <div>
                  <h4>Rating</h4>
                  <p>1842</p>
                </div>
              </div>
            </div>
            
            <div class="example-layout-footer cosmic-flex-between">
              <CosmicButton label="View Profile" variant="secondary" />
              <CosmicButton label="Add Friend" variant="primary" icon="👤" />
            </div>
          </div>
        </CosmicCard>
      </section>
    </div>
  </div>
</template>

<script setup>
import CosmicButton from '@/components/ui/buttons/BaseButton.vue';
import CosmicCard from '@/components/ui/cards/BaseCard.vue';
</script>

<style scoped>
.style-guide {
  min-height: 100vh;
  background: var(--gradient-hero);
  color: var(--color-text-primary);
  padding: var(--space-xl) 0;
}

.cosmic-section {
  margin-bottom: var(--space-xl);
  animation: fadeIn 0.5s ease;
}

/* Sequentially animate sections */
.cosmic-section:nth-child(2) { animation-delay: 0.1s; }
.cosmic-section:nth-child(3) { animation-delay: 0.2s; }
.cosmic-section:nth-child(4) { animation-delay: 0.3s; }
.cosmic-section:nth-child(5) { animation-delay: 0.4s; }
.cosmic-section:nth-child(6) { animation-delay: 0.5s; }
.cosmic-section:nth-child(7) { animation-delay: 0.6s; }
.cosmic-section:nth-child(8) { animation-delay: 0.7s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Color System */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.color-item {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-medium);
  overflow: hidden;
  background: var(--color-surface-primary);
  border: var(--border-thin);
}

.color-preview {
  height: 100px;
  width: 100%;
}

.color-details {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
}

.color-name {
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-xs);
}

.color-value {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  font-family: monospace;
}

/* Typography */
.typography-showcase {
  padding: var(--space-md);
  margin-top: var(--space-md);
  border-radius: var(--radius-medium);
}

.typography-item {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--border-thin);
}

.typography-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* Component Showcase */
.component-showcase {
  padding: var(--space-md);
  margin-top: var(--space-md);
  border-radius: var(--radius-medium);
}

.showcase-section {
  margin-bottom: var(--space-lg);
}

.showcase-section:last-child {
  margin-bottom: 0;
}

.component-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

/* Surfaces */
.surfaces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.surface-demo {
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.surface-class {
  font-family: monospace;
  color: var(--color-text-tertiary);
  margin-top: var(--space-sm);
}

/* Effects */
.effect-demo {
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  background: var(--color-surface-tertiary);
  min-width: 200px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all var(--transition-medium);
  border: var(--border-thin);
}

/* Example Layout */
.example-layout {
  display: flex;
  flex-direction: column;
}

.example-layout-header {
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.example-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-circle);
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
}

.example-header-content h3 {
  margin: 0 0 var(--space-xs);
}

.example-header-content p {
  margin: 0;
}

.example-layout-content {
  margin-bottom: var(--space-md);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.example-stat {
  padding: var(--space-md);
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.example-icon {
  font-size: var(--text-xl);
}

.example-stat h4 {
  margin: 0 0 var(--space-xs);
  color: var(--color-text-secondary);
}

.example-stat p {
  margin: 0;
  font-weight: var(--weight-bold);
  color: var(--color-primary);
}

.example-layout-footer {
  border-top: var(--border-thin);
  padding-top: var(--space-md);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cards-grid,
  .surfaces-grid,
  .example-layout-content {
    grid-template-columns: 1fr;
  }
}
</style> 