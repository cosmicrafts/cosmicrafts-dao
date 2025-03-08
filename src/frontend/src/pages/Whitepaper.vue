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
        <!-- Content Transition and Markdown Rendering -->
        <transition name="content-transition" @after-leave="afterTransition">
          <MarkdownRenderer
            :fileName="activeSection"
            @rendered="generateTOC"
            @navigateToSection="handleNavigateToSection"
            :key="activeSection"
          />
        </transition>

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
    </main>

    <!-- Right Sidebar (Table of Contents) -->
    <aside class="right-sidebar cosmic-right-panel">
      <div class="sidebar-content">
        <ul v-if="toc.length > 0">
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
        history.replaceState(null, null, hash);
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
      
      this.$nextTick(() => {
        this.generateTOC();
        
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
        
        if (updateUrl) {
          this.updateUrlHash();
        }
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
      
      this.$nextTick(() => this.observeSections());
    },

    scrollToHeading(id) {
      const target = document.getElementById(id);
      if (target) {
        const headerOffset = window.innerHeight * 0.2;
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
    this.updateButtonVisibility();
    this.generateTOC();
    this.$nextTick(() => this.observeSections());
    
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
/* Content wrapper custom styling */
.content-wrapper {
  max-width: 100%;
  margin: 0 auto;
  padding: 4rem 4rem;
  position: relative;
}


/* Navigation buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin: 3rem auto;
  max-width: 800px;
  padding: 0 1rem;
}

.navigation-buttons .button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: auto;
  min-width: 200px;
  max-width: 300px;
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

.sidebar-content {
  height: calc(100vh - 8rem);
  overflow-y: auto;
  padding: 6rem 1.25rem;
}

.left-sidebar ul, 
.right-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.right-sidebar ul {
  padding-right: 0.5rem;
}

.right-sidebar .sidebar-content {
  padding: 1.25rem 1rem;
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
    grid-template-columns: 280px minmax(600px, 1fr) 240px;
    gap: 2rem;
    padding: 0 2rem;
  }
}

@media (max-width: 1279px) {
  .cosmic-sidepanel-layout {
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  .right-sidebar {
    display: none;
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
    padding: 1.5rem;
    padding-bottom: 5rem;
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
}

/* Animations */
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
</style>