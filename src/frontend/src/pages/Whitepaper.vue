<template>
  <div class="whitepaper-container cosmic-sidepanel-layout">
    <!-- Left Sidebar (Navigation) -->
    <aside class="sidebar left-sidebar">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <i class="fas fa-book-open"></i>
          <span class="header-text">
            <strong>Whitepaper</strong>
            <small>Documentation</small>
          </span>
        </div>
        <ul>
          <li
            v-for="section in sections"
            :key="section.id"
            :class="{ 
              'sidebar-nav-item': true,
              'left': true,
              'active': activeSection === section.id 
            }"
            @click="changeSection(section.id)"
          >
            <i class="fas" :class="getSectionIcon(section.id)"></i>
            <span class="section-text">
              <strong>{{ section.title }}</strong>
              <small>{{ getSectionDescription(section.id) }}</small>
            </span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <transition name="content-transition" mode="out-in">
          <div :key="activeSection" class="content-container">
            <!-- Content Transition and Markdown Rendering -->
            <div class="markdown-container">
              <MarkdownRenderer
                :fileName="activeSection"
                @rendered="generateTOC"
                @navigateToSection="handleNavigateToSection"
              />
            </div>

            <!-- Navigation Buttons -->
            <div class="navigation-buttons">
              <button
                v-if="showPreviousButton"
                class="button outline prev"
                @click="navigatePrevious"
              >
                <span class="arrow">
                  <img src="/src/assets/icons/prev.svg" alt="arrow" />
                </span>
                <small>Previous</small>
                <span>{{ previousSection?.title }}</span>
              </button>

              <button
                v-if="showNextButton"
                class="button outline next"
                @click="navigateNext"
              >
                <small>Next</small>
                <span>{{ nextSection?.title }}</span>
                <span class="arrow">
                  <img src="/src/assets/icons/next.svg" alt="arrow" />
                </span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- Right Sidebar (Table of Contents) -->
    <aside class="sidebar right-sidebar">
      <div class="sidebar-content">
        <transition name="content-transition" mode="out-in">
          <ul v-if="toc.length > 0" :key="activeSection">
            <li
              v-for="cue in toc"
              :key="cue.id"
              :class="{ 
                'sidebar-nav-item': true,
                'right': true,
                'active': cue.id === activeHeading 
              }"
              @click="scrollToHeading(cue.id)"
            >
              {{ cue.text }}
            </li>
          </ul>
        </transition>
      </div>
    </aside>

    <!-- Mobile Navigation -->
    <div class="mobile-navigation-container">
      <!-- Mobile Navigation Button -->
      <button class="mobile-nav-button" @click="toggleMobileNav">
        <div class="button-content">
          <i class="fas fa-book-open"></i>
          <span class="button-text">
            <strong>Whitepaper Sections</strong>
            <small>Navigate through chapters</small>
          </span>
        </div>
        <i class="fas fa-chevron-down nav-icon" :class="{ 'open': showMobileNav }"></i>
      </button>
      
      <!-- Mobile Navigation Menu -->
      <div class="mobile-nav-menu" :class="{ 'expanded': showMobileNav }">
        <ul>
          <li 
            v-for="section in sections" 
            :key="section.id"
            :class="{ active: activeSection === section.id }"
            @click="changeSectionAndCloseNav(section.id)"
          >
            <i class="fas" :class="getSectionIcon(section.id)"></i>
            <span class="section-text">
              <strong>{{ section.title }}</strong>
              <small>{{ getSectionDescription(section.id) }}</small>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownRenderer from "@/components/MarkdownRenderer.vue";

export default {
  components: {
    MarkdownRenderer,
  },
  data() {
    return {
      activeSection: "introduction",
      sections: [
        { id: "introduction", title: "Introduction" },
        { id: "architecture", title: "Architecture" },
        { id: "core-features", title: "Core Features" },       
        { id: "governance", title: "Governance" },
        { id: "tokenomics", title: "Tokenomics" },
        { id: "community", title: "Community" }
      ],
      toc: [],
      activeHeading: null,
      showPreviousButton: false,
      showNextButton: false,
      sectionObserver: null,
      showMobileNav: false,
    };
  },
  computed: {
    previousSection() {
      const currentIndex = this.sections.findIndex(
        (section) => section.id === this.activeSection
      );
      return currentIndex > 0 ? this.sections[currentIndex - 1] : null;
    },
    nextSection() {
      const currentIndex = this.sections.findIndex(
        (section) => section.id === this.activeSection
      );
      return currentIndex < this.sections.length - 1
        ? this.sections[currentIndex + 1]
        : null;
    },
  },
  watch: {
    activeSection() {
      this.updateButtonVisibility();
      this.updateUrlHash();
    },
    activeHeading() {
      this.updateUrlHash();
    },
    '$route.hash': {
      immediate: true,
      handler(hash) {
        if (hash) {
          this.handleUrlHash(hash);
        }
      }
    }
  },
  methods: {
    afterTransition() {
      this.generateTOC();
      this.observeSections();
    },
    
    updateUrlHash() {
      if (!this.activeSection) return;
      
      const hash = this.activeHeading 
        ? `#${this.activeSection}#${this.activeHeading}` 
        : `#${this.activeSection}`;
      
      if (window.location.hash !== hash) {
        history.replaceState(history.state, '', hash);
      }
    },
    
    handleUrlHash(hash) {
      if (!hash) return;
      
      const hashValue = hash.startsWith('#') ? hash.substring(1) : hash;
      
      if (hashValue.includes('#')) {
        const [sectionId, headingId] = hashValue.split('#');
        
        if (sectionId && this.sections.some(s => s.id === sectionId)) {
          if (this.activeSection !== sectionId) {
            this.changeSection(sectionId, false);
            
            this.$nextTick(() => {
              setTimeout(() => {
                if (headingId) {
                  this.scrollToHeading(headingId, false);
                }
              }, 300);
            });
          } else if (headingId) {
            this.scrollToHeading(headingId, false);
          }
        }
      } else if (this.sections.some(s => s.id === hashValue)) {
        this.changeSection(hashValue, false);
      } else {
        this.scrollToHeading(hashValue, false);
      }
    },
    
    changeSection(sectionId, updateUrl = true) {
      this.activeSection = sectionId;
      this.toc = [];
      this.updateButtonVisibility();
      
      // Wait for the transition to complete before scrolling
      this.$nextTick(() => {
        // Generate TOC first
        this.generateTOC();
        
        if (updateUrl) {
          this.updateUrlHash();
        }
        
        // Add a small delay to ensure content is rendered
        setTimeout(() => {
          const mainContent = document.querySelector(".main-content");
          if (mainContent) {
            mainContent.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        }, 50);
      });
    },

    navigatePrevious() {
      if (this.previousSection) this.changeSection(this.previousSection.id);
    },
    
    navigateNext() {
      if (this.nextSection) this.changeSection(this.nextSection.id);
    },

    handleNavigateToSection(sectionIdOrHeadingId) {
      if (sectionIdOrHeadingId.includes('#')) {
        const [sectionId, headingId] = sectionIdOrHeadingId.split('#');
        
        if (this.sections.some(s => s.id === sectionId)) {
          if (this.activeSection !== sectionId) {
            this.changeSection(sectionId, false);
            
            this.$nextTick(() => {
              setTimeout(() => this.scrollToHeading(headingId), 300);
            });
          } else {
            this.scrollToHeading(headingId);
          }
        }
        return;
      }
      
      const section = this.sections.find((s) => s.id === sectionIdOrHeadingId);
      
      if (section) {
        this.changeSection(sectionIdOrHeadingId);
      } else {
        this.scrollToHeading(sectionIdOrHeadingId);
      }
    },

    updateButtonVisibility() {
      this.showPreviousButton = !!this.previousSection;
      this.showNextButton = !!this.nextSection;
    },

    generateTOC() {
      this.toc = [];
      const contentElement = document.querySelector(".main-content");
      if (!contentElement) return;
      
      const headings = contentElement.querySelectorAll("h2");
      if (!headings.length) return;

      this.toc = Array.from(headings).map((heading) => {
        const headingText = heading.textContent.trim();
        const headingId = this.slugify(headingText);
        heading.id = headingId;
        return { id: headingId, text: headingText };
      });

      if (this.toc.length > 0) {
        this.activeHeading = this.toc[0].id;
      }
      
      // Observe sections after TOC is generated
      this.$nextTick(() => this.observeSections());
    },

    scrollToHeading(id) {
      const target = document.getElementById(id);
      if (target) {
        const headerOffset = 120; // Fixed header height (approximately)
        const mainContent = document.querySelector(".main-content");
        if (!mainContent) return;

        const targetPosition = target.offsetTop - headerOffset;

        mainContent.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        this.activeHeading = id;
      }
    },
    
    slugify(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
    },

    observeSections() {
      if (!this.toc.length) return;
      
      if (this.sectionObserver) {
        this.sectionObserver.disconnect();
      }
      
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          const visibleHeading = entries.find(entry => entry.isIntersecting);
          if (visibleHeading) {
            this.activeHeading = visibleHeading.target.id;
          }
        },
        {
          root: document.querySelector('.main-content'),
          rootMargin: "-100px 0px -70% 0px",
          threshold: 0
        }
      );
      
      this.toc.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element) {
          this.sectionObserver.observe(element);
        }
      });
    },

    toggleMobileNav() {
      this.showMobileNav = !this.showMobileNav;
    },
    
    changeSectionAndCloseNav(sectionId) {
      this.changeSection(sectionId);
      this.showMobileNav = false;
    },

    getSectionIcon(sectionId) {
      const icons = {
        'introduction': 'fa-star',
        'architecture': 'fa-layer-group',
        'core-features': 'fa-cube',
        'governance': 'fa-landmark',
        'tokenomics': 'fa-coins',
        'community': 'fa-users'
      };
      return icons[sectionId] || 'fa-file-alt';
    },

    getSectionDescription(sectionId) {
      const descriptions = {
        'introduction': 'Project overview and vision',
        'architecture': 'Technical foundation and structure',
        'core-features': 'Key platform capabilities',
        'governance': 'Decision-making framework',
        'tokenomics': 'Token economics and distribution',
        'community': 'Ecosystem and participation'
      };
      return descriptions[sectionId] || '';
    },
  },

  mounted() {
    // Initialize buttons and TOC immediately
    this.updateButtonVisibility();
    
    // Add animation class after a brief delay
    this.$nextTick(() => {
      const container = document.querySelector('.whitepaper-container');
      if (container) {
        container.classList.add('animated');
      }
      
      // Generate TOC after initial animation
      setTimeout(() => {
        this.generateTOC();
        this.observeSections();
      }, 100);
    });
  },
};
</script>

<style>
/* Base Variables */
:root {
  --color-primary: #00c3ff;
  --color-primary-alpha-10: rgba(0, 195, 255, 0.1);
  --color-primary-alpha-15: rgba(0, 195, 255, 0.15);
  --color-primary-alpha-20: rgba(0, 195, 255, 0.2);
  --color-primary-alpha-30: rgba(0, 195, 255, 0.3);
  --color-primary-alpha-50: rgba(0, 195, 255, 0.5);
  
  --color-accent: #ffa200;
  --color-accent-alpha-10: rgba(255, 162, 0, 0.1);
  --color-accent-alpha-15: rgba(255, 162, 0, 0.15);
  --color-accent-alpha-20: rgba(255, 162, 0, 0.2);
  --color-accent-alpha-30: rgba(255, 162, 0, 0.3);
  
  --color-bg-dark: rgba(30, 43, 56, 0.6);
  --color-bg-darker: rgba(23, 33, 43, 0.98);
  
  --color-border: rgba(58, 58, 58, 0.24);
  
  --color-text-primary: rgba(255, 255, 255, 0.95);
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  
  --shadow-primary: 0 0 15px var(--color-primary-alpha-20);
  --shadow-accent: 0 0 15px var(--color-accent-alpha-20);
  
  --transition-standard: all 0.3s ease;
  
  --left-sidebar-width: 360px;
  --right-sidebar-width: 240px;
  --main-content-min-width: 600px;
  --sidebar-padding: 1rem;
  --content-max-width: 900px;
}

/* Main Layout */
.cosmic-sidepanel-layout {
  display: grid;
  grid-template-columns: var(--left-sidebar-width) minmax(var(--main-content-min-width), 1fr) var(--right-sidebar-width);
  grid-template-areas: "left-panel main-content right-panel";
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* Sidebar Base Styles */
.sidebar {
  height: 100%;
  overflow: hidden;
  border-color: var(--color-border);
  border-style: solid;
  border-width: 0;
  display: flex;
  flex-direction: column;
}

.left-sidebar {
  grid-area: left-panel;
  width: var(--left-sidebar-width);
  min-width: var(--left-sidebar-width);
  border-right-width: 1px;
}

.right-sidebar {
  grid-area: right-panel;
  width: var(--right-sidebar-width);
  min-width: var(--right-sidebar-width);
  border-left-width: 1px;
}

/* Sidebar Content */
.sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 6.5rem var(--sidebar-padding) 4rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
  box-sizing: border-box;
}

/* Fix for sidebar lists */
.sidebar ul {
  width: 100%;
  padding: .25rem;
  margin: 0;
  list-style-type: none;
  box-sizing: border-box;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.sidebar-header i {
  font-size: 1.5rem;
  color: var(--color-primary);
  background: var(--color-primary-alpha-10);
  padding: 1rem;
  border-radius: 50%;
  box-shadow: var(--shadow-primary);
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-text strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-text small {
  font-size: 0.85rem;
  color: grey;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Main Content Area */
.main-content {
  grid-area: main-content;
  height: 100%;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* Navigation Items Base */
.sidebar-nav-item {
  position: relative;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 700;
  cursor: pointer;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  box-sizing: border-box;
  text-shadow: 0 2px 4px rgba(0, 0, 0, .75);
  transition: var(--transition-standard);
  width: 100%;
}

/* Left Sidebar Navigation */
.sidebar-nav-item.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
  padding: 0.85rem 1rem;
  background: var(--color-bg-dark);
  border: 1px solid var(--color-primary-alpha-10);
  border-radius: 12px;
  max-width: 100%;
  box-sizing: border-box;
}

.sidebar-nav-item.left i {
  font-size: 1rem;
  color: var(--color-primary);
  background: var(--color-primary-alpha-10);
  padding: 0.75rem;
  border-radius: 50%;
  transition: var(--transition-standard);
  flex-shrink: 0;
}

.section-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  overflow: hidden;
  min-width: 0; /* Critical for text-overflow to work */
}

.section-text strong {
  font-size: 1rem;
  color: var(--color-text-primary);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-text small {
  font-size: 0.75rem;
  font-weight: 400;
  color: grey;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Right Sidebar Navigation */
.sidebar-nav-item.right {
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  margin: 0.25rem 0;
  line-height: 1.4;
  opacity: 0.85;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

/* Navigation Item States */
.sidebar-nav-item.left:hover {
  background: rgba(30, 43, 56, 0.8);
  border-color: var(--color-primary-alpha-30);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sidebar-nav-item.left:hover i {
  background: var(--color-primary-alpha-20);
  box-shadow: 0 0 8px var(--color-primary);
  transform: scale(1.1);
}

.sidebar-nav-item.left.active {
  background: var(--color-primary-alpha-15);
  border-color: var(--color-primary);
  border-left: 3px solid var(--color-accent);
  box-shadow: 0 4px 25px var(--color-primary-alpha-15);
}

.sidebar-nav-item.left.active i {
  background: var(--color-primary-alpha-15);
  box-shadow: 0 0 8px var(--color-primary);
}

.sidebar-nav-item.right:hover {
  color: var(--color-primary);
  background: var(--color-primary-alpha-10);
  transform: translateX(4px);
}

.sidebar-nav-item.right.active {
  color: var(--color-primary);
  font-weight: 600;
  background: var(--color-primary-alpha-15);
  border-left: 2px solid var(--color-accent);
  text-shadow: 0 0 12px var(--color-primary-alpha-30);
}

/* Decorative elements for nav items */
.sidebar-nav-item::before,
.sidebar-nav-item::after {
  content: '';
  position: absolute;
  height: 2px;
  width: 60%;
  background-color: var(--color-accent);
  transition: transform 0.45s ease, box-shadow 0.65s ease;
  box-shadow: 0px 0px 4px var(--color-accent-alpha-50);
  transform: scaleX(0);
  z-index: 1;
  pointer-events: none;
  opacity: 0;
}

.sidebar-nav-item::before {
  top: -1px;
  left: 5%;
  transform-origin: left;
}

.sidebar-nav-item::after {
  bottom: -1px;
  right: 5%;
  transform-origin: right;
}

.sidebar-nav-item:hover::before,
.sidebar-nav-item:hover::after {
  transform: scaleX(1);
  opacity: 0.7;
}

.sidebar-nav-item.active::before,
.sidebar-nav-item.active::after {
  transform: scaleX(1);
  opacity: 1;
  box-shadow: 0 0 10px var(--color-accent);
}

/* Content Containers */
.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  padding: 4rem 2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  box-sizing: border-box;
}

.content-container,
.markdown-container {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  box-sizing: border-box;
}

/* Navigation buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: var(--content-max-width);
  margin: 2rem auto;
  box-sizing: border-box;
}

.navigation-buttons .button {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  padding: 1rem 1.5rem;
  position: relative;
  border: 1px solid var(--color-border);
  background: rgba(30, 43, 56, 0.65);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.navigation-buttons .button:hover {
  background: rgba(30, 43, 56, 0.85);
  border-color: var(--color-primary-alpha-50);
}

.navigation-buttons .button.prev {
  padding-left: 3rem;
  text-align: left;
  align-items: flex-start;
}

.navigation-buttons .button.next {
  padding-right: 3rem;
  text-align: right;
  align-items: flex-end;
}

.navigation-buttons .button span {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.navigation-buttons small {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.navigation-buttons .button .arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.navigation-buttons .button.prev .arrow {
  left: 1rem;
}

.navigation-buttons .button.next .arrow {
  right: 1rem;
}

/* Mobile Navigation */
.mobile-navigation-container {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  background: linear-gradient(to bottom, 
    rgba(14, 24, 36, 0.95),
    rgba(10, 20, 32, 0.98)
  );
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(15, 185, 253, 0.15);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.mobile-nav-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: rgba(15, 185, 253, 0.05);
  border: none;
  border-top: 1px solid rgba(15, 185, 253, 0.2);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-standard);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.button-content i {
  font-size: 1.5rem;
  color: var(--color-primary);
  background: rgba(15, 185, 253, 0.08);
  padding: 0.85rem;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.2);
  flex-shrink: 0;
}

.button-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  min-width: 0;
}

.button-text strong {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button-text small {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-icon {
  color: var(--color-primary);
  font-size: 1.25rem;
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  background: rgba(15, 185, 253, 0.08);
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.nav-icon.open {
  transform: rotate(180deg);
  background: rgba(15, 185, 253, 0.15);
  box-shadow: 0 0 25px rgba(15, 185, 253, 0.25);
}

.mobile-nav-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  background: var(--color-background-darker);
  box-sizing: border-box;
}

.mobile-nav-menu.expanded {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem 0;
  border-top: 1px solid rgba(15, 185, 253, 0.1);
}

.mobile-nav-menu ul {
  list-style: none;
  padding: 1rem;
  margin: 0;
  box-sizing: border-box;
  width: 100%;
}

.mobile-nav-menu li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  background: rgba(15, 185, 253, 0.05);
  border: 1px solid rgba(15, 185, 253, 0.1);
  cursor: pointer;
  transition: var(--transition-standard);
  box-sizing: border-box;
  width: 100%;
}

.mobile-nav-menu li i {
  font-size: 1.25rem;
  color: var(--color-primary);
  background: rgba(15, 185, 253, 0.08);
  padding: 0.75rem;
  border-radius: 50%;
  transition: var(--transition-standard);
  flex-shrink: 0;
}

.mobile-nav-menu li:hover {
  background: rgba(15, 185, 253, 0.08);
  transform: translateX(8px);
  border-color: rgba(15, 185, 253, 0.2);
}

.mobile-nav-menu li:hover i {
  background: rgba(15, 185, 253, 0.15);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.25);
}

.mobile-nav-menu li.active {
  background: rgba(15, 185, 253, 0.1);
  border-color: var(--color-primary);
  box-shadow: 0 4px 20px rgba(15, 185, 253, 0.15);
}

.mobile-nav-menu li.active i {
  background: rgba(15, 185, 253, 0.15);
  box-shadow: 0 0 20px rgba(15, 185, 253, 0.3);
}

/* Animations */
.whitepaper-container.animated .left-sidebar {
  opacity: 0;
  animation: slide-in-left 0.6s ease forwards;
}

.whitepaper-container.animated .right-sidebar {
  opacity: 0;
  animation: slide-in-right 0.6s ease forwards 0.1s;
}

.whitepaper-container.animated .main-content {
  opacity: 0;
  animation: fade-in 0.6s ease forwards 0.2s;
}

@keyframes slide-in-left {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Content Transitions */
.content-transition-enter-active,
.content-transition-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: relative;
}

.content-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.content-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Right sidebar specific transitions */
.right-sidebar .content-transition-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.right-sidebar .content-transition-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.right-sidebar .content-transition-enter-active,
.right-sidebar .content-transition-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  width: 100%;
  left: 0;
}

/* Responsive Layouts */
@media (max-width: 1280px) {

  
  .cosmic-sidepanel-layout {
    grid-template-columns: var(--left-sidebar-width) 1fr;
    grid-template-areas: "left-panel main-content";
  }
  
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .cosmic-sidepanel-layout {
    grid-template-columns: 1fr;
    grid-template-areas: "main-content";
  }
  
  .left-sidebar {
    display: none;
  }
  
  .mobile-navigation-container {
    display: block;
  }
  
  .content-wrapper {
    padding-bottom: 6rem; /* Add space for mobile nav */
  }
}
</style>