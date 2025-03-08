<template>
  <div class="whitepaper-container cosmic-sidepanel-layout">
    <!-- Left Sidebar (Navigation) -->
    <aside class="left-sidebar cosmic-left-panel">
      <div class="sidebar-content">
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
            {{ section.title }}
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content cosmic-main-content">
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
    <aside class="right-sidebar cosmic-right-panel">
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
        <span>Whitepaper Sections</span>
        <span class="mobile-nav-icon" :class="{ 'open': showMobileNav }">▼</span>
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
            {{ section.title }}
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
/* Content container and transitions */
.content-container {
  display: flex;
  flex-direction: column;
  min-height: 300px;
  position: relative;
}

.content-transition-enter-active,
.content-transition-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  width: 100%;
}

.content-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.content-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Main content wrapper */
.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  padding: 6rem 4rem 4rem; /* Increased top padding */
  padding-right: 0;
  position: relative;
  min-height: calc(100vh - 8rem);
}

/* Main content scrollbar styling */
.cosmic-main-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 195, 255, 0.3) rgba(30, 43, 56, 0.3);
  padding-right: 0;
  margin-right: -8px; /* Pull content to align with scrollbar */
}

.cosmic-main-content::-webkit-scrollbar {
  width: 8px;
  background-color: rgba(30, 43, 56, 0.3);
}

.cosmic-main-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 195, 255, 0.3);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.cosmic-main-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 195, 255, 0.5);
}

.cosmic-main-content::-webkit-scrollbar-track {
  background-color: rgba(30, 43, 56, 0.3);
}

/* Adjust right sidebar to align with scrollbar */
.right-sidebar {
  border-left: 1px solid rgba(58, 58, 58, 0.24);
  margin-left: 0; /* Reset margin */
}

/* Navigation buttons */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 3rem auto;
  max-width: 800px;
  padding: 0 1rem;
}

/* Right sidebar transitions */
.right-sidebar .content-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.right-sidebar .content-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Content wrapper and container styles */
.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  padding: 4rem 4rem;
  position: relative;
}

.markdown-container {
  position: relative;
  min-height: 300px;
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

/* Main content specific transitions */
.markdown-container .content-transition-enter-active {
  position: relative;
  z-index: 2;
}

.markdown-container .content-transition-leave-active {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: 1;
}

/* Right sidebar specific transitions */
.right-sidebar .content-transition-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.right-sidebar .content-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.right-sidebar .content-transition-enter-active,
.right-sidebar .content-transition-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  width: 100%;
  left: 0;
}

/* Button fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.navigation-buttons .button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  justify-content: center;
  padding: 1rem 1.5rem;
  position: relative;
  border: 1px solid rgba(58, 58, 58, 0.24);
  background: rgba(30, 43, 56, 0.65);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.navigation-buttons .button:hover {
  background: rgba(30, 43, 56, 0.85);
  border-color: rgba(0, 195, 255, 0.5);
}

.navigation-buttons .button.prev {
  padding-left: 3rem;
  text-align: left;
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
}

.navigation-buttons small {
  color: rgba(255, 255, 255, 0.7);
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

/* Sidebar content styles */
.sidebar-content {
  position: relative;
  height: calc(100vh - 8rem);
  overflow-y: auto;
  padding: 6rem 1.25rem 4rem; /* Match content padding */
}

.right-sidebar .sidebar-content {
  padding: 6rem 1rem 4rem; /* Match content padding */
}

.right-sidebar ul {
  position: relative;
  width: 100%;
  padding-right: 0.5rem;
}

.left-sidebar ul, 
.right-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Refined sidebar navigation styles */
.sidebar-nav-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  border-left: 2px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 400;
  transition: 
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-left-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: background-color, border-left-color, color, opacity;
}

.sidebar-nav-item:hover {
  background: rgba(0, 195, 255, 0.08);
  border-left-color: rgba(0, 195, 255, 0.5);
  color: var(--color-text-primary);
}

.sidebar-nav-item.active {
  background: rgba(0, 195, 255, 0.15);
  border-left-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

/* Left sidebar specific styles */
.sidebar-nav-item.left {
  font-size: 0.95rem;
  padding: 0.85rem 1rem;
}

/* Right sidebar specific styles */
.sidebar-nav-item.right {
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  line-height: 1.4;
  opacity: 0.85;
  transition: 
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-left-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-nav-item.right:hover {
  opacity: 1;
  background: rgba(0, 195, 255, 0.08);
  border-left-color: rgba(0, 195, 255, 0.5);
}

.sidebar-nav-item.right.active {
  opacity: 1;
  background: rgba(0, 195, 255, 0.15);
  border-left-color: var(--color-primary);
  color: var(--color-primary);
}

/* Mobile Navigation */
.mobile-navigation-container {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  border-top: 1px solid rgba(58, 58, 58, 0.24);
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.85), rgba(23, 33, 43, 0.92));
  backdrop-filter: blur(8px);
}

.mobile-nav-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.25rem 2rem;
  background: transparent;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-nav-icon {
  transition: transform 0.3s ease;
  color: rgba(0, 195, 255, 0.7);
}

.mobile-nav-icon.open {
  transform: rotate(180deg);
}

.mobile-nav-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  background: rgba(23, 33, 43, 0.8);
  backdrop-filter: blur(8px);
}

.mobile-nav-menu.expanded {
  max-height: 70vh;
  overflow-y: auto;
}

.mobile-nav-menu ul {
  list-style-type: none;
  padding: 1rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-menu li {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 400;
  border-left: 2px solid transparent;
  color: #fff;
  background: rgba(30, 43, 56, 0.5);
  transition: 
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-left-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: background-color, border-left-color, color;
}

.mobile-nav-menu li:hover {
  border-left-color: rgba(0, 195, 255, 0.7);
  background: rgba(30, 43, 56, 0.7);
  color: rgba(0, 195, 255, 0.9);
}

.mobile-nav-menu li.active {
  border-left-color: rgba(0, 195, 255, 0.9);
  color: rgba(0, 195, 255, 0.9);
  font-weight: 600;
  background: rgba(30, 43, 56, 0.7);
}

/* Responsive Layout Adjustments */
@media (min-width: 1280px) {
  .cosmic-sidepanel-layout {
    grid-template-columns: 320px minmax(600px, 1fr) 300px;
    gap: 2.5rem;
    padding: 0 2rem;
  }

  /* Increase text size in sidebars for better readability */
  .sidebar-nav-item.left {
    font-size: 1.05rem;
    padding: 1rem 1.25rem;
  }

  .sidebar-nav-item.right {
    font-size: 0.9rem;
    padding: 0.65rem 1.25rem;
    line-height: 1.5;
  }

  /* Adjust padding for wider sidebars */
  .sidebar-content {
    padding: 6rem 1.5rem;
  }

  .right-sidebar .sidebar-content {
    padding: 6rem 1.5rem;
  }
}

/* Large screens */
@media (min-width: 1600px) {
  .cosmic-sidepanel-layout {
    grid-template-columns: 380px minmax(700px, 1fr) 340px;
    gap: 3rem;
    padding: 0 3rem;
  }
}

@media (max-width: 1279px) {
  .cosmic-sidepanel-layout {
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    padding: 0 1.5rem;
  }
  
  .right-sidebar {
    display: none;
  }

  /* Adjust left sidebar for medium screens */
  .sidebar-nav-item.left {
    font-size: 1rem;
    padding: 0.9rem 1.2rem;
  }

  .content-wrapper {
    padding: 4rem; /* Restore full padding when right sidebar is hidden */
  }
  
  .cosmic-main-content {
    margin-right: 0; /* Reset margin when right sidebar is hidden */
  }
}

@media (max-width: 768px) {
  .whitepaper-container {
    padding-top: 6rem; /* Slightly less padding on mobile */
  }

  .cosmic-sidepanel-layout {
    grid-template-columns: 1fr;
    padding: 0;
  }
  
  .left-sidebar {
    display: none;
  }
  
  .content-wrapper {
    padding: 5rem 1.5rem 5rem; /* Adjust for mobile */
  }

  .mobile-navigation-container {
    display: block;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
    margin: 2rem auto;
  }
  
  .navigation-buttons .button {
    width: 100%;
    max-width: none;
  }
  
  .cosmic-heading {
    scroll-margin-top: 6rem; /* Slightly less margin on mobile */
  }
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
  from { 
    transform: translateX(-20px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}

@keyframes slide-in-right {
  from { 
    transform: translateX(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}

@keyframes fade-in {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Add scroll margin to headings to account for fixed header */
.cosmic-heading {
  scroll-margin-top: 8rem; /* Add margin for header */
}
</style>