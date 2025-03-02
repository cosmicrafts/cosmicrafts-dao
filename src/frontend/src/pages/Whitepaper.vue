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
        { id: "executive-summary", title: "Executive Summary" },
        { id: "architecture", title: "Architecture" },
        { id: "core-features", title: "Core Features" },       
        { id: "tokenomics", title: "Tokenomics" },
        { id: "governance", title: "Governance" },
        { id: "treasurymanagement", title: "Treasury Management" },
        { id: "proposalprocess", title: "Proposal Process" },
        { id: "stakingrewards", title: "Staking Rewards" },
        { id: "sustainability", title: "Sustainability" },
        { id: "community", title: "Community" },
        { id: "markdown-features", title: "Markdown Guide" },
      ],
      toc: [],
      activeHeading: null,
      showPreviousButton: false,
      showNextButton: false,
      sectionObserver: null,
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
    },
  },
  methods: {
    // Changes the active section
    changeSection(sectionId) {
      this.activeSection = sectionId;
      this.toc = [];
      
      this.$nextTick(() => {
        this.generateTOC();
        
        // Scroll to the top of the main content
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.scrollTop = 0;
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
    handleNavigateToSection(sectionId) {
      const section = this.sections.find((s) => s.id === sectionId);
      section ? this.changeSection(sectionId) : this.scrollToHeading(sectionId);
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
        // Create a simple ID based on index to avoid any issues
        const headingId = `heading-${index}`;
        heading.id = headingId;
        
        return { 
          id: headingId, 
          text: heading.textContent.trim() 
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
        // Calculate the header offset (adjust this value if you have a fixed header)
        const headerOffset = 100;

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
  background-color: var(--color-background-secondary, #121725);
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
  max-width: 800px;
  margin: 3rem auto;
  padding: 40px 20px;
  position: relative;
}

/* Right sidebar styles */
.right-sidebar {
  grid-area: right-sidebar;
  background-color: var(--color-background-secondary, #121725);
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

/* Responsive styles */
@media (max-width: 1280px) {
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
  
  .content-wrapper {
    padding: 20px;
  }
  
  .navigation-buttons {
    gap: 1rem;
  }
  
  .navigation-buttons .button {
    padding: 0.8rem;
  }
}
</style>