<template>
  <div class="theme-guide-container">
    <h1 class="cosmic-title">Cosmicrafts Theme Guide</h1>
    <p>This guide demonstrates the unified Cosmicrafts theme system components.</p>

    <!-- Buttons Section -->
    <section class="theme-section">
      <h2 class="cosmic-title">Buttons</h2>
      
      <div class="component-group">
        <h3>Primary Buttons</h3>
        <div class="demo-row">
          <button class="cosmic-button cosmic-button-primary">
            <span class="button-text">Primary Button</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
          
          <button class="cosmic-button cosmic-button-primary cosmic-button-sm">
            <span class="button-text">Small</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
          
          <button class="cosmic-button cosmic-button-primary cosmic-button-lg">
            <span class="button-text">Large Primary</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Secondary Buttons</h3>
        <div class="demo-row">
          <button class="cosmic-button cosmic-button-secondary">
            <span class="button-text">Secondary Button</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
          
          <button class="cosmic-button cosmic-button-secondary cosmic-button-sm">
            <span class="button-text">Small</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
          
          <button class="cosmic-button cosmic-button-secondary cosmic-button-lg">
            <span class="button-text">Large Secondary</span>
            <span class="button-glow"></span>
            <span class="button-particles"></span>
          </button>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Outline Buttons</h3>
        <div class="demo-row">
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
        </div>
      </div>
      
      <div class="component-group">
        <h3>Special Buttons</h3>
        <div class="demo-row">
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
        </div>
      </div>
    </section>

    <!-- Cards Section -->
    <section class="theme-section">
      <h2 class="cosmic-title">Cards &amp; Panels</h2>
      
      <div class="component-group">
        <h3>Default Card</h3>
        <div class="demo-row cards-row">
          <div class="cosmic-card">
            <div class="cosmic-card-header">
              <div class="cosmic-card-title">
                <h3>Default Card</h3>
              </div>
            </div>
            <div class="cosmic-card-body">
              <p>This is the default card styling.</p>
            </div>
            <div class="cosmic-card-footer">
              <p>Card Footer</p>
            </div>
          </div>
          
          <div class="cosmic-card cosmic-panel-primary">
            <div class="cosmic-card-header">
              <div class="cosmic-card-title">
                <h3 class="cosmic-title">Primary Card</h3>
              </div>
            </div>
            <div class="cosmic-card-body">
              <p>Primary theme card with gradient title.</p>
            </div>
            <div class="cosmic-card-footer">
              <p>Card Footer</p>
            </div>
          </div>
          
          <div class="cosmic-card cosmic-panel-secondary">
            <div class="cosmic-card-header">
              <div class="cosmic-card-title">
                <h3 class="cosmic-title-secondary">Secondary Card</h3>
              </div>
            </div>
            <div class="cosmic-card-body">
              <p>Secondary theme card with gradient title.</p>
            </div>
            <div class="cosmic-card-footer">
              <p>Card Footer</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Panels</h3>
        <div class="demo-row">
          <div class="cosmic-panel" style="width: 30%">
            <h3>Standard Panel</h3>
            <p>This is a standard panel with default styling.</p>
          </div>
          
          <div class="cosmic-panel cosmic-panel-primary" style="width: 30%">
            <h3 class="cosmic-text-glow">Primary Panel</h3>
            <p>Panel with primary color theme.</p>
          </div>
          
          <div class="cosmic-panel cosmic-panel-secondary" style="width: 30%">
            <h3 class="cosmic-text-glow-secondary">Secondary Panel</h3>
            <p>Panel with secondary color theme.</p>
          </div>
        </div>
      </div>

      <!-- Page Layout Considerations -->
      <div class="component-group">
        <h3>Layout Considerations</h3>
        <div class="demo-row column">
          <div class="cosmic-panel cosmic-panel-primary" style="width: 100%">
            <h3 class="cosmic-text-glow">Header Spacing</h3>
            <p class="warning-text">⚠️ Important: Always account for the fixed header in page layouts!</p>
            <div class="code-snippet">
              <pre><code>/* CSS for page containers */
.page-container {
  padding-top: var(--cosmic-header-height, 80px);
  min-height: 100vh;
}</code></pre>
              <button class="cosmic-button cosmic-button-sm cosmic-button-outline-primary copy-btn" @click="copyToClipboard('.page-container { padding-top: var(--cosmic-header-height, 80px); min-height: 100vh; }')">
                <span class="button-text">Copy</span>
              </button>
            </div>
          </div>
          
          <div class="cosmic-panel" style="width: 100%; margin-top: 1rem;">
            <h3>Responsive Spacing</h3>
            <p>Use these spacing variables for consistent layout:</p>
            <div class="space-samples">
              <div class="space-item">
                <div class="space-box space-xs"></div>
                <code>var(--cosmic-space-xs)</code>
              </div>
              <div class="space-item">
                <div class="space-box space-sm"></div>
                <code>var(--cosmic-space-sm)</code>
              </div>
              <div class="space-item">
                <div class="space-box space-md"></div>
                <code>var(--cosmic-space-md)</code>
              </div>
              <div class="space-item">
                <div class="space-box space-lg"></div>
                <code>var(--cosmic-space-lg)</code>
              </div>
              <div class="space-item">
                <div class="space-box space-xl"></div>
                <code>var(--cosmic-space-xl)</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Text Styling Section -->
    <section class="theme-section">
      <h2 class="cosmic-title">Text Styling</h2>
      
      <div class="component-group">
        <h3>Title Styles</h3>
        <div class="demo-row column">
          <h2 class="cosmic-title">Primary Gradient Title</h2>
          <h2 class="cosmic-title-secondary">Secondary Gradient Title</h2>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Glowing Text</h3>
        <div class="demo-row">
          <p class="cosmic-text-glow">Primary glowing text</p>
          <p class="cosmic-text-glow-secondary">Secondary glowing text</p>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Utility Text Colors</h3>
        <div class="demo-row">
          <p class="text-primary-color">Primary color text</p>
          <p class="text-secondary-color">Secondary color text</p>
          <p class="text-accent-color">Accent color text</p>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Navigation Links</h3>
        <div class="demo-row column">
          <a href="#" class="cosmic-nav-link">Standard Navigation Link</a>
          <a href="#" class="cosmic-nav-link cosmic-hover">Nav Link with Hover Effect</a>
          <div style="background: var(--cosmic-glass-bg-darker); padding: 1rem; width: 100%;">
            <a href="#" class="cosmic-nav-link cosmic-text-glow">Nav Link with Glow Effect</a>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Animation Section -->
    <section class="theme-section">
      <h2 class="cosmic-title">Animations</h2>
      
      <div class="component-group">
        <h3>Animation Effects</h3>
        <div class="demo-row">
          <div class="cosmic-panel" style="width: 20%">
            <p class="cosmic-float">Floating animation</p>
          </div>
          
          <div class="cosmic-panel" style="width: 20%">
            <p class="cosmic-pulse">Pulse animation</p>
          </div>
          
          <div class="cosmic-panel" style="width: 20%">
            <p class="cosmic-glow">Glow animation</p>
          </div>
          
          <div class="cosmic-panel" style="width: 20%">
            <p class="cosmic-text-glow-animate">Text glow animation</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Social Icons -->
    <section class="theme-section">
      <h2 class="cosmic-title">Social Icons</h2>
      
      <div class="component-group">
        <h3>Basic Icons</h3>
        <div class="demo-row">
          <a href="#" class="cosmic-social-icon">
            <i>T</i>
          </a>
          
          <a href="#" class="cosmic-social-icon">
            <i>F</i>
          </a>
          
          <a href="#" class="cosmic-social-icon">
            <i>D</i>
          </a>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Styled Social Icons (Footer Style)</h3>
        <div class="demo-row">
          <a href="#" class="cosmic-social-icon footer-style">
            <img src="@/assets/icons/discord.svg" alt="Discord" />
          </a>
          
          <a href="#" class="cosmic-social-icon footer-style">
            <img src="@/assets/icons/x.svg" alt="Twitter" />
          </a>
          
          <a href="#" class="cosmic-social-icon footer-style">
            <img src="@/assets/icons/facebook.svg" alt="Facebook" />
          </a>
        </div>
      </div>
    </section>
    
    <!-- Accordion Section (new) -->
    <section class="theme-section">
      <h2 class="cosmic-title">Accordion Components</h2>
      
      <div class="component-group">
        <h3>Standard Accordion</h3>
        <div class="demo-accordion-container">
          <!-- First Accordion -->
          <div class="accordion cosmic-panel">
            <div 
              class="accordion-header" 
              :class="{ 'active': isExpanded.section1 }"
              @click="toggleSection('section1')"
            >
              <h4 class="cosmic-text-glow">Section 1</h4>
              <i class="fas" :class="isExpanded.section1 ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </div>
            <div class="accordion-content" :style="{ maxHeight: isExpanded.section1 ? '200px' : '0' }">
              <div class="accordion-inner">
                <p>This is the content of section 1. The accordion expands smoothly to reveal this content.</p>
                <p>You can put any content here.</p>
              </div>
            </div>
          </div>
          
          <!-- Second Accordion -->
          <div class="accordion cosmic-panel">
            <div 
              class="accordion-header" 
              :class="{ 'active': isExpanded.section2 }"
              @click="toggleSection('section2')"
            >
              <h4 class="cosmic-text-glow">Section 2</h4>
              <i class="fas" :class="isExpanded.section2 ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </div>
            <div class="accordion-content" :style="{ maxHeight: isExpanded.section2 ? '200px' : '0' }">
              <div class="accordion-inner">
                <ul class="link-list">
                  <li><a href="#" class="cosmic-nav-link">Navigation Link 1</a></li>
                  <li><a href="#" class="cosmic-nav-link">Navigation Link 2</a></li>
                  <li><a href="#" class="cosmic-nav-link">Navigation Link 3</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer Patterns Section (new) -->
    <section class="theme-section">
      <h2 class="cosmic-title">Footer Patterns</h2>
      
      <div class="component-group">
        <h3>Footer Top Row</h3>
        <div class="footer-demo">
          <div class="social-top-row">
            <div class="social-top-container">
              <h4 class="cosmic-text-glow">Stay Connected</h4>
              <div class="social-icons-group">
                <a href="#" class="cosmic-social-icon footer-style">
                  <img src="@/assets/icons/discord.svg" alt="Discord" />
                </a>
                <a href="#" class="cosmic-social-icon footer-style">
                  <img src="@/assets/icons/x.svg" alt="Twitter" />
                </a>
                <a href="#" class="cosmic-social-icon footer-style">
                  <img src="@/assets/icons/facebook.svg" alt="Facebook" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Copyright Section</h3>
        <div class="footer-demo">
          <div class="copyright-container">
            <img src="@/assets/icons/wou.svg" alt="World of Unreal" class="copyright-logo" />
            <div class="copyright">
              <p>© 2023 World of Unreal, LLC.</p>
              <p>All trademarks referenced herein are the properties of their respective owners.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Glass Effects Section (new) -->
    <section class="theme-section">
      <h2 class="cosmic-title">Glass Effects</h2>
      
      <div class="component-group">
        <h3>Glass Backgrounds</h3>
        <div class="demo-row">
          <div class="glass-demo cosmic-glass-bg">
            <p>Default Glass Background</p>
          </div>
          
          <div class="glass-demo cosmic-glass-bg-lighter">
            <p>Lighter Glass Background</p>
          </div>
          
          <div class="glass-demo cosmic-glass-bg-darker">
            <p>Darker Glass Background</p>
          </div>
        </div>
      </div>
      
      <div class="component-group">
        <h3>Glass Borders</h3>
        <div class="demo-row">
          <div class="glass-demo" style="border: var(--cosmic-glass-border);">
            <p>Standard Glass Border</p>
          </div>
          
          <div class="glass-demo" style="border: var(--cosmic-glass-border-blue);">
            <p>Blue Glass Border</p>
          </div>
          
          <div class="glass-demo" style="border: var(--cosmic-glass-border); border-color: var(--cosmic-orange);">
            <p>Orange Glass Border</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
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

// Copy to clipboard functionality
const copySuccess = ref(false);
const copyTimeout = ref(null);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    copySuccess.value = true;
    
    // Clear any existing timeout
    if (copyTimeout.value) {
      clearTimeout(copyTimeout.value);
    }
    
    // Set a new timeout to reset copy state
    copyTimeout.value = setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
};
</script>

<style scoped>
.theme-guide-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.theme-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: rgba(30, 43, 56, 0.3);
  border-radius: var(--cosmic-radius-lg);
  border: var(--cosmic-glass-border);
}

.component-group {
  margin-bottom: 2rem;
}

.component-group h3 {
  margin-bottom: 1rem;
  color: var(--cosmic-text-primary);
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.demo-row.column {
  flex-direction: column;
  align-items: flex-start;
}

.cards-row {
  gap: 2rem;
}

.cards-row > div {
  flex: 1;
  min-width: 250px;
}

/* Code Snippet Styles */
.code-snippet {
  position: relative;
  background: var(--cosmic-glass-bg-darker);
  border-radius: var(--cosmic-radius-md);
  padding: 1rem;
  margin: 1rem 0;
  width: 100%;
  overflow: hidden;
}

.code-snippet pre {
  margin: 0;
  overflow-x: auto;
  max-width: 100%;
  padding-right: 80px; /* Space for copy button */
}

.code-snippet code {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  color: var(--cosmic-text-primary);
  display: block;
  line-height: 1.5;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.warning-text {
  color: var(--cosmic-orange);
  font-weight: bold;
}

/* Spacing Visualization */
.space-samples {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
}

.space-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.space-box {
  background: var(--cosmic-blue-translucent);
  border-radius: var(--cosmic-radius-sm);
}

.space-xs {
  width: 0.25rem;
  height: 0.25rem;
}

.space-sm {
  width: 0.5rem;
  height: 0.5rem;
}

.space-md {
  width: 1rem;
  height: 1rem;
}

.space-lg {
  width: 1.5rem;
  height: 1.5rem;
}

.space-xl {
  width: 2rem;
  height: 2rem;
}

/* Accordion Styles */
.demo-accordion-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.accordion {
  width: 100%;
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all var(--cosmic-transition-medium);
  background: var(--cosmic-glass-bg);
  border-bottom: var(--cosmic-glass-border-blue);
}

.accordion-header h4 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.accordion-header i {
  display: block;
  color: var(--cosmic-blue);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 1.2rem;
}

.accordion-header.active {
  background: var(--cosmic-glass-bg-lighter);
}

.accordion-header.active i {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  background: var(--cosmic-glass-bg-lighter);
}

.accordion-inner {
  padding: 1rem;
}

/* Footer Demo Styles */
.footer-demo {
  width: 100%;
  border-radius: var(--cosmic-radius-lg);
  overflow: hidden;
}

.social-top-row {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--cosmic-blue-translucent-faint);
  border-bottom: var(--cosmic-glass-border-blue);
  width: 100%;
}

.social-top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.social-icons-group {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: nowrap;
}

.cosmic-social-icon.footer-style {
  width: 3rem !important;
  height: 3rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: var(--cosmic-radius-sm);
  background: var(--cosmic-glass-bg-darker);
  border: var(--cosmic-glass-border-blue);
  transition: all var(--cosmic-transition-fast);
}

.cosmic-social-icon.footer-style:hover {
  transform: translateY(-3px);
  box-shadow: var(--cosmic-glow-blue-sm);
  border-color: var(--cosmic-blue);
}

.cosmic-social-icon.footer-style img {
  width: 20px;
  height: 20px;
}

.copyright-container {
  background: var(--cosmic-glass-bg);
  padding: 2rem 1rem;
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-top: var(--cosmic-glass-border-blue);
  width: 100%;
}

.copyright-logo {
  width: 4rem;
  margin-top: 0.15rem;
  filter: drop-shadow(var(--cosmic-glow-blue-sm));
  transition: transform var(--cosmic-transition-medium), filter var(--cosmic-transition-fast);
}

.copyright-logo:hover {
  transform: scale(1.05) rotate(-2deg);
  filter: drop-shadow(0 0 8px var(--cosmic-blue));
}

.copyright {
  text-align: center;
  font-size: 0.65rem;
  color: var(--cosmic-text-disabled);
  line-height: 1.1;
}

.copyright p {
  margin: 0.1rem 0;
}

/* Link List Styles */
.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.link-list li {
  margin-bottom: 0.5rem;
  transition: transform var(--cosmic-transition-fast);
}

.link-list li:hover {
  transform: translateY(-3px);
}

.link-list a {
  color: var(--cosmic-text-secondary);
  text-decoration: none;
  font-size: 1.2rem;
  display: block;
  padding: 0.5rem 0;
  transition: all var(--cosmic-transition-fast);
  font-weight: 500;
}

.link-list a:hover,
.link-list a:active {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-sm);
}

/* Glass Effects Demo */
.glass-demo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 100px;
  border-radius: var(--cosmic-radius-lg);
  padding: 1rem;
  color: var(--cosmic-text-primary);
  backdrop-filter: var(--cosmic-glass-blur);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .demo-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cards-row > div {
    width: 100%;
  }
  
  .social-icons-group {
    gap: 1rem;
  }
  
  .copyright-container {
    padding: 1.5rem 1rem;
  }
  
  .space-samples {
    justify-content: center;
  }
}
</style> 