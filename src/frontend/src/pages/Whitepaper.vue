<template>
  <div class="whitepaper-container">
    <!-- Left Sidebar (Navigation) -->
    <aside class="left-sidebar">
      <div class="sidebar-content">
        <ul>
          <li
            v-for="section in sections"
            :key="section.id"
            :class="{ active: activeSection === section.id }"
            @click="changeSection(section.id)"
          >
            {{ section.title }}
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Content Transition and Markdown Rendering -->
        <transition
          name="fade-slide"
          @after-leave="() => { generateTOC(); this.observeSections(); }"
        >
          <MarkdownRenderer
            :fileName="activeSection"
            @rendered="generateTOC"
            @navigateToSection="handleNavigateToSection"
            :key="activeSection"
          />
        </transition>

        <!-- Navigation Buttons -->
        <div class="navigation-buttons">
          <transition name="fade-button">
            <button
              v-if="showPreviousButton"
              class="button prev"
              @click="navigatePrevious"
            >
              <span class="arrow">
                <img src="/src/assets/icons/prev.svg" alt="arrow" />
              </span>
              <small>Previous</small>
              <span>{{ previousSection?.title }}</span>
            </button>
          </transition>

          <transition name="fade-button">
            <button
              v-if="showNextButton"
              class="button next"
              @click="navigateNext"
            >
              <small>Next</small>
              <span>{{ nextSection?.title }}</span>
              <span class="arrow">
                <img src="/src/assets/icons/next.svg" alt="arrow" />
              </span>
            </button>
          </transition>
        </div>
      </div>
    </main>

    <!-- Right Sidebar (Table of Contents) -->
    <aside class="right-sidebar">
      <div class="sidebar-content">
        <transition name="fade-slide-toc">
          <ul v-if="toc.length > 0">
            <li
              v-for="cue in toc"
              :key="cue.id"
              :class="{ active: cue.id === activeHeading }"
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
      <!-- Mobile Navigation Button (Always Visible) -->
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
        { id: "community", title: "Community" },
        { id: "sustainability", title: "Sustainability" },
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
      // Update URL hash when section changes
      this.updateUrlHash();
    },
    activeHeading() {
      // Update URL hash when active heading changes
      this.updateUrlHash();
    },
    // Watch for hash changes in the URL
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
    // Updates the URL hash with current section and heading
    updateUrlHash() {
      if (!this.activeSection) return;
      
      const hash = this.activeHeading 
        ? `#${this.activeSection}#${this.activeHeading}` 
        : `#${this.activeSection}`;
      
      // Update URL without triggering navigation
      if (window.location.hash !== hash) {
        history.replaceState(null, null, hash);
      }
    },
    
    // Handles URL hash changes
    handleUrlHash(hash) {
      if (!hash) return;
      
      // Remove the leading # character
      const hashValue = hash.startsWith('#') ? hash.substring(1) : hash;
      
      // Check if it's a nested hash (#section#heading)
      if (hashValue.includes('#')) {
        const [sectionId, headingId] = hashValue.split('#');
        
        // First change to the correct section
        if (sectionId && this.sections.some(s => s.id === sectionId)) {
          // Only change section if it's different from the current one
          if (this.activeSection !== sectionId) {
            this.changeSection(sectionId, false);
            
            // After section is loaded, scroll to heading
            this.$nextTick(() => {
              setTimeout(() => {
                if (headingId) {
                  this.scrollToHeading(headingId, false);
                }
              }, 500); // Give time for content to render
            });
          } else if (headingId) {
            // If already on the correct section, just scroll to heading
            this.scrollToHeading(headingId, false);
          }
        }
      } else if (this.sections.some(s => s.id === hashValue)) {
        // It's just a section hash
        this.changeSection(hashValue, false);
      } else {
        // It might be just a heading hash
        this.scrollToHeading(hashValue, false);
      }
    },
    
    // Changes the active section
    changeSection(sectionId, updateUrl = true) {
      this.activeSection = sectionId;
      this.toc = [];
      
      this.$nextTick(() => {
        this.generateTOC();
        
        // Scroll to the top of the main content
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
        
        // Update URL if needed
        if (updateUrl) {
          this.updateUrlHash();
        }
      });
    },

    // Navigation controls
    navigatePrevious() {
      if (this.previousSection) this.changeSection(this.previousSection.id);
    },
    navigateNext() {
      if (this.nextSection) this.changeSection(this.nextSection.id);
    },

    // Handles TOC navigation
    handleNavigateToSection(sectionIdOrHeadingId) {
      // Check if it contains both section and heading (section#heading format)
      if (sectionIdOrHeadingId.includes('#')) {
        const [sectionId, headingId] = sectionIdOrHeadingId.split('#');
        
        // Check if it's a valid section
        if (this.sections.some(s => s.id === sectionId)) {
          // Change to the section first
          if (this.activeSection !== sectionId) {
            this.changeSection(sectionId, false);
            
            // After section is loaded, scroll to heading
            this.$nextTick(() => {
              setTimeout(() => {
                this.scrollToHeading(headingId);
              }, 500); // Give time for content to render
            });
          } else {
            // Already on the correct section, just scroll to heading
            this.scrollToHeading(headingId);
          }
        }
        return;
      }
      
      // Check if it's a known section ID (normal case)
      const section = this.sections.find((s) => s.id === sectionIdOrHeadingId);
      
      if (section) {
        // It's a section, change to it
        this.changeSection(sectionIdOrHeadingId);
      } else {
        // It's a heading, scroll to it
        this.scrollToHeading(sectionIdOrHeadingId);
      }
    },

    // Updates the visibility of navigation buttons
    updateButtonVisibility() {
      setTimeout(() => {
        this.showPreviousButton = !!this.previousSection;
        this.showNextButton = !!this.nextSection;
      }, 100);
    },

    // Generates the table of contents
    generateTOC() {
      this.toc = [];
      const contentElement = document.querySelector(".main-content");
      if (!contentElement) return;
      
      const headings = contentElement.querySelectorAll("h2");
      if (!headings.length) return;

      this.toc = Array.from(headings).map((heading, index) => {
        // Use the heading text for the ID to make it more readable in URLs
        const headingText = heading.textContent.trim();
        const headingId = this.slugify(headingText);
        heading.id = headingId;
        
        return { 
          id: headingId, 
          text: headingText 
        };
      });

      if (this.toc.length > 0) {
        this.activeHeading = this.toc[0].id;
      }
      
      this.$nextTick(() => this.observeSections());
    },

    // Scrolls to a specific heading
    scrollToHeading(id) {
    const target = document.getElementById(id);
      if (target) {
        // Calculate the header offset (20% from the top)
        const headerOffset = window.innerHeight * 0.2;

        // Get the main content element for scrolling
        const mainContent = document.querySelector(".main-content");
        if (!mainContent) return;

        // Calculate the target position relative to the main content
        const targetPosition = target.offsetTop - headerOffset;

        // Scroll the main content to the target
        mainContent.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        // Update the active heading
        this.activeHeading = id;
      }
    },
    
    // Creates a URL-friendly slug from text
    slugify(text) {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
        .trim();                  // Trim leading/trailing whitespace
    },

    // Observes which section is currently in view
    observeSections() {
      if (!this.toc.length) return;
      
      // Clear any existing observer
      if (this.sectionObserver) {
        this.sectionObserver.disconnect();
      }
      
      // Create a new IntersectionObserver
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          // Find the first visible heading
          const visibleHeading = entries.find(entry => entry.isIntersecting);
          if (visibleHeading) {
            this.activeHeading = visibleHeading.target.id;
          }
        },
        {
          root: document.querySelector('.main-content'), // Use main-content as the viewport
          rootMargin: "-100px 0px -70% 0px", // Adjust margins to determine when a section is "active"
          threshold: 0
        }
      );
      
      // Observe all headings
      this.toc.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element) {
          this.sectionObserver.observe(element);
        }
      });
    },

    // Toggles the mobile TOC expansion
    toggleMobileNav() {
      this.showMobileNav = !this.showMobileNav;
    },
    
    // Changes the section and closes the mobile navigation
    changeSectionAndCloseNav(sectionId) {
      this.changeSection(sectionId);
      this.showMobileNav = false;
    },
  },

  // Lifecycle hooks
  mounted() {
    this.updateButtonVisibility();
    this.generateTOC();
    this.$nextTick(() => this.observeSections());
    
    // Apply animation classes after component is mounted
    setTimeout(() => {
      const container = document.querySelector('.whitepaper-container');
      if (container) {
        container.classList.add('animated');
      }
    }, 100);
  },
};
</script>

<style>
/* Main container layout */
.whitepaper-container {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  grid-template-areas: "left-sidebar main-content right-sidebar";
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* Left sidebar styles */
.left-sidebar {
  grid-area: left-sidebar;
  border-right: 1px solid rgba(58, 58, 58, 0.24);
  height: 100%;
  overflow: hidden;
}

.left-sidebar .sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.left-sidebar ul {
  font-size: 0.9rem;
  font-weight: bold;
  margin-top: 5rem;
  list-style: none;
  padding: 0;
}

.left-sidebar li {
  position: relative;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: bold;
  color: #ffffff;
  transition: color 0.25s ease-in-out, transform 0.25s ease-in-out,
    text-shadow 0.25s ease-in-out, border-color 0.25s ease-in-out;
  padding: 0.4rem 1rem;
  text-align: left;
}

.left-sidebar li:hover {
  color: #00c3ff;
  border-bottom: 1px solid #00c3ff;
  border-top: 1px solid #00c3ff;
  text-shadow: 0px 0px 2px rgba(0, 191, 255, 0.686);
  padding-bottom: 0.5rem;
  font-size: 0.925rem;
  margin-left: 0.25rem;
}

.left-sidebar li::before,
.left-sidebar li::after {
  content: '';
  position: absolute;
  height: 1.5px;
  width: 50%;
  background-color: #ffa200;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
  transform: scaleX(0);
}

.left-sidebar li::before {
  top: -1px;
  left: -0.25rem;
  transform-origin: left;
}

.left-sidebar li::after {
  bottom: -1px;
  right: -0.25rem;
  transform-origin: right;
}

.left-sidebar li:hover::before,
.left-sidebar li:hover::after {
  transform: scaleX(1.5);
  box-shadow: 0px 0px 8px rgb(255, 162, 0);
}

.left-sidebar li.active {
  color: #00c3ff;
  font-weight: bold;
  font-size: 1rem;
  text-shadow: 0px 0px 8px rgba(0, 0, 0, 0.88);
  background-color: rgba(255, 255, 255, 0.056);
  border-radius: 8px;
  padding: 0.8rem 1rem;
  border-top: 1.5px solid #00c3ff;
  border-bottom: 3px solid rgb(255, 162, 0);
  margin-left: -0.5rem;
}

.left-sidebar li.active::before,
.left-sidebar li.active::after {
  display: none;
}

/* Main content styles */
.main-content {
  grid-area: main-content;
  height: 100%;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.content-wrapper {
  max-width: 100%;
  margin: 2rem auto;
  padding: 2rem 12rem;
  position: relative;
}

/* Right sidebar styles */
.right-sidebar {
  grid-area: right-sidebar;
  border-left: 1px solid rgba(58, 58, 58, 0.24);
  height: 100%;
  overflow: hidden;
}

.right-sidebar .sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.right-sidebar ul {
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 5rem;
  list-style: none;
  padding: 0.4rem 0.4rem;
}

.right-sidebar li {
  position: relative;
  cursor: pointer;
  margin-bottom: 0.75rem;
  font-weight: bold;
  color: #ffffff;
  transition: color 0.25s ease-in-out, transform 0.25s ease-in-out,
    text-shadow 0.25s ease-in-out, border-color 0.25s ease-in-out;
  padding: 0.4rem 0.1rem;
  text-align: left;
}

.right-sidebar li.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: -0.5rem;
  right: -0.5rem;
  bottom: 0;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: -1;
  transition: all 0.3s ease-in-out;
}

.right-sidebar li:hover {
  color: #00c3ff;
  border-bottom: 1px solid #00c3ff;
  border-top: 1px solid #00c3ff;
  text-shadow: 0px 0px 2px rgba(0, 191, 255, 0.686);
  padding-bottom: 0.5rem;
  transform: scale(1.05);
}

.right-sidebar li::before,
.right-sidebar li::after {
  content: '';
  position: absolute;
  height: 1.5px;
  width: 50%;
  background-color: #ffa200;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
  transform: scaleX(0);
}

.right-sidebar li::before {
  top: -1px;
  left: -0.25rem;
  transform-origin: left;
}

.right-sidebar li::after {
  bottom: -1px;
  right: -0.25rem;
  transform-origin: right;
}

.right-sidebar li:hover::before,
.right-sidebar li:hover::after {
  transform: scaleX(1.5);
  box-shadow: 0px 0px 8px rgb(255, 162, 0);
}

.right-sidebar li.active {
  color: #00c3ff;
  font-weight: bold;
  font-size: 0.75rem;
  text-shadow: 0px 0px 8px rgba(0, 0, 0, 0.88);
  background-color: rgba(255, 255, 255, 0.056);
  border-radius: 8px;
  padding: 0.4rem 0.5rem;
  border-top: 1.5px solid #00c3ff;
  border-bottom: 3px solid rgb(255, 162, 0);
}

.right-sidebar li.active::before,
.right-sidebar li.active::after {
  display: none;
}

/* Navigation buttons */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.navigation-buttons .button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  justify-content: center;
  padding: 1rem 1rem;
  border: 1px solid #3a3a3a76;
  background: linear-gradient(180deg, #252c3f, #191e2b);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s ease;
  position: relative;
}

.navigation-buttons .button:hover {
  background: linear-gradient(180deg, #007bff, #265ef9);
}

.navigation-buttons .button.prev {
  align-items: flex-end;
  text-align: right;
}

.navigation-buttons .button span {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 0.25rem;
}

.navigation-buttons small {
  color: rgb(176, 176, 176);
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

/* Transitions */
.fade-slide-enter-active {
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-toc-enter-active {
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-toc-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-toc-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-toc-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-toc-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-toc-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Animations */
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.whitepaper-container.animated .left-sidebar {
  animation: slide-in-left 0.8s ease forwards;
}

.whitepaper-container.animated .right-sidebar {
  animation: slide-in-right 0.8s ease forwards 0.2s;
}

.whitepaper-container.animated .main-content {
  opacity: 0;
  animation: fade-in 1s ease forwards 0.4s;
}

@media (max-width: 1600px) {
  .content-wrapper {
    padding: 2rem 4rem;
  }
}


@media (max-width: 1440px) {
  .content-wrapper {
    padding: 2rem 2rem;
  }
}


/* Responsive styles */
@media (max-width: 1280px) {

  .content-wrapper {
  max-width: 100%;
  margin: 2rem auto;
  padding: 2rem 2rem;
  position: relative;
}
  .whitepaper-container {
    grid-template-columns: 200px 1fr;
    grid-template-areas: "left-sidebar main-content";
  }
  
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .whitepaper-container {
    grid-template-columns: 1fr;
    grid-template-areas: "main-content";
  }
  
  .left-sidebar {
    display: none;
  }
  
  .navigation-buttons {
    gap: 1rem;
  }
  
  .navigation-buttons .button {
    padding: 0.8rem;
  }
  
  .mobile-navigation-container {
    display: block;
  }
  
  .content-wrapper {
    padding-bottom: 4rem; /* Add space for the mobile navigation button */
  }
}

/* Mobile Navigation Container */
.mobile-navigation-container {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
}

/* Mobile Navigation Button */
.mobile-nav-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(to bottom, rgba(30, 43, 56, 0.6), rgba(23, 33, 43, .9));
  backdrop-filter: blur(8px);
  border: none;
  border-top: 1px solid var(--color-primary, #00c3ff3a);
  color: #04d5ff;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 -4px 15px rgba(0, 195, 255, 0.099);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 -4px 15px rgba(0, 195, 255, 0.3);
  }
  50% {
    box-shadow: 0 -4px 20px rgba(0, 195, 255, 0.5);
  }
  100% {
    box-shadow: 0 -4px 15px rgba(0, 195, 255, 0.3);
  }
}

.mobile-nav-icon {
  transition: transform var(--transition-medium, 1.6s ease);
  font-size: 1rem;
}

.mobile-nav-icon.open {
  transform: rotate(180deg);
}

/* Mobile Navigation Menu */
.mobile-nav-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-slow, 0.3s ease);
  background-color: var(--color-surface-primary, rgba(30, 43, 56, 0.9));
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-menu.expanded {
  max-height: 70vh;
  overflow-y: auto;
}

.mobile-nav-menu ul {
  list-style-type: none;
  padding: 0.75rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-menu li {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-small, 4px);
  background-color: var(--color-surface-tertiary, rgba(0, 0, 0, 0.2));
  cursor: pointer;
  transition: all var(--transition-medium, 0.2s ease);
  font-weight: var(--weight-medium, 500);
  border-left: 2px solid transparent;
  color: var(--color-text-primary, #ffffff);
}

.mobile-nav-menu li:hover {
  background-color: rgba(0, 195, 255, 0.1);
  border-left: 2px solid var(--color-primary, #00c3ff);
  transform: translateX(2px);
}

.mobile-nav-menu li.active {
  background-color: rgba(0, 195, 255, 0.15);
  border-left: 3px solid var(--color-primary, #00c3ff);
  color: var(--color-primary, #00c3ff);
  font-weight: var(--weight-bold, 700);
  text-shadow: var(--shadow-glow-primary, 0 0 10px rgba(0, 195, 255, 0.5));
}

@media (max-width: 768px) {
  .mobile-navigation-container {
    display: block;
  }
  
  .content-wrapper {
    padding-bottom: 4rem; /* Add space for the mobile navigation button */
  }
}
</style>