<template>
  <div class="whitepaper-layout animated">
    <!-- Main Layout -->
    <div class="main-content">

      <!-- Sidebar (Left) -->
      <aside class="sidebar">
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
      </aside>

      <!-- Main Content -->
      <div class="content">

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

      <!-- Right Sidebar (Table of Contents) -->
      <aside class="right-sidebar">
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
      </aside>

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
      ],
      toc: [],
      activeHeading: null,
      showPreviousButton: false,
      showNextButton: false,
      observer: null,
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
    // Handles the dynamic parallax effect
    applyDynamicParallaxEffect() {
      const contentElement = this.$el.querySelector(".content");
      const mdContent = contentElement.querySelectorAll(".markdown-content > *");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const boundingClientRect = entry.target.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const midpoint = viewportHeight * 0.5;
            const distanceFromMidpoint = Math.abs(
              boundingClientRect.top - midpoint
            );
            const scaleFactor =
              1 + Math.max(0, 1 - distanceFromMidpoint / (viewportHeight * 0.75)) * 0.05;

            if (boundingClientRect.top < viewportHeight && boundingClientRect.bottom > 0) {
              entry.target.style.transform = `scale(${scaleFactor})`;
              entry.target.style.opacity = `${
                0.75 + Math.min(1, 1 - distanceFromMidpoint / viewportHeight)
              }`;
            } else {
              entry.target.style.transform = `scale(1)`;
              entry.target.style.opacity = `1`;
            }
          });
        },
        { root: contentElement, threshold: 0 }
      );

      mdContent.forEach((el) => observer.observe(el));
    },

    // Observes rendered content for changes
    observeRenderedContent() {
      const contentElement = this.$el.querySelector(".content");
      const observer = new MutationObserver(() => {
        this.applyDynamicParallaxEffect();
      });

      observer.observe(contentElement, { childList: true, subtree: true });
    },

    // Changes the active section
    changeSection(sectionId) {
      this.activeSection = sectionId;
      this.toc = [];
      
      this.$nextTick(() => {
        this.generateTOC();
        
        setTimeout(() => {
          const target = document.querySelector(".content");
          if (target) {
            const headerOffset = 80; // Adjust for fixed headers
            const targetPosition =
              target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
              
            window.scrollTo({ top: targetPosition, behavior: "smooth" });
          }
        }, 100);
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
      const contentElement = this.$el.querySelector(".content");
      const headings = contentElement.querySelectorAll("h2");

      this.toc = Array.from(headings).map((heading, index) => {
        if (!heading.id) heading.id = `heading-${index}`;
        return { id: heading.id, text: heading.textContent };
      });

      if (this.toc.length > 0) this.activeHeading = this.toc[0].id;
      this.$nextTick(() => this.observeSections());
    },

    // Scrolls to a specific heading
    scrollToHeading(id) {
      const target = document.getElementById(id);
      if (target) {
        const headerOffset = 80;
        const targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({ top: targetPosition, behavior: "smooth" });
        this.activeHeading = id;
      }
    },

    // Observes sections for active heading
    observeSections() {
      if (this.observer) this.observer.disconnect();

      const options = {
        root: null,
        rootMargin: "0px",
        threshold: [0.4],
      };

      this.observer = new IntersectionObserver((entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          this.activeHeading = visibleEntries[0].target.id;
        }
      }, options);

      const headings = document.querySelectorAll(".content h2");
      headings.forEach((heading) => this.observer.observe(heading));

      if (headings.length > 0) this.activeHeading = headings[0].id;
    },
  },

  // Lifecycle hooks
  mounted() {
    this.updateButtonVisibility();
    this.generateTOC();
    this.$nextTick(() => this.observeSections());
    this.observeRenderedContent();
  },
};
</script>

<style scoped>
.whitepaper-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  height: auto;
}

.main-content {
  display: flex;
  flex: 1;
  color: white;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(90deg, #08090cda, rgba(29, 37, 55, 0.85), #08090cd8),
    url('@/assets/webp/daomission.webp') no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
  background-blend-mode: normal;
  opacity: 0.8;
}

.content {
  flex: 1;
  margin-left: 15%;
  margin-right: 12%;
  padding: 4.5rem 6rem 6rem;
}

.sidebar {
  position: fixed;
  left: 0;
  width: 15%;
  height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #3a3a3a3d;
}

.sidebar ul {
  font-size: 0.9rem;
  font-weight: bold;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
  list-style: none;
  padding: 0;
}

.sidebar li {
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

.sidebar li:hover {
  color: #00c3ff;
  border-bottom: 1px solid #00c3ff;
  border-top: 1px solid #00c3ff;
  text-shadow: 0px 0px 2px rgba(0, 191, 255, 0.686);
  padding-bottom: 0.5rem;
  font-size: 0.925rem;
  margin-left: 0.25rem;
}

.sidebar li::before,
.sidebar li::after {
  content: '';
  position: absolute;
  height: 1.5px;
  width: 50%;
  background-color: #ffa200;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0px 0px 4px rgba(255, 162, 0, 0.948);
  transform: scaleX(0);
}

.sidebar li::before {
  top: -1px;
  left: -0.25rem;
  transform-origin: left;
}

.sidebar li::after {
  bottom: -1px;
  right: -0.25rem;
  transform-origin: right;
}

.sidebar li:hover::before,
.sidebar li:hover::after {
  transform: scaleX(1.5);
  box-shadow: 0px 0px 8px rgb(255, 162, 0);
}

.sidebar li.active {
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

.sidebar li.active::before,
.sidebar li.active::after {
  display: none;
}

.sidebar li,
.sidebar li:hover,
.sidebar li.active {
  transition: all 0.3s ease-in-out;
}

.right-sidebar {
  position: fixed;
  right: 0;
  width: 12%;
  height: 100vh;
  padding: 0.4rem 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: right;
  border-left: 1px solid #3a3a3a58;
}

.right-sidebar ul {
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 4.5rem;
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

.right-sidebar li,
.right-sidebar li:hover,
.right-sidebar li.active {
  transition: all 0.3s ease-in-out;
}

.fade-slide-toc-enter-active {
  top: 0;
  left: 0;
  width: 100%;
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-toc-leave-active {
  top: 0;
  left: 0;
  width: 100%;
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

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
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

.fade-slide-leave-active {
  top: 0;
  left: 0;
  width: 100%;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-active {
  top: 0;
  left: 0;
  width: 100%;
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
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

.animated .whitepaper-layout {
  opacity: 0;
  animation: fade-in 1.2s ease forwards;
}

.animated .sidebar {
  transform: translateX(-100%);
  opacity: 0;
  animation: slide-in-left 0.8s ease forwards;
}

.animated .right-sidebar {
  transform: translateX(100%);
  opacity: 0;
  animation: slide-in-right 0.8s ease forwards 0.2s;
}

.animated .content {
  opacity: 0;
  transform: translateY(20px);
  animation: fade-in 1s ease forwards 0.4s;
}

.animated .sidebar ul li,
.animated .right-sidebar ul li {
  opacity: 0;
  transform: translateY(20px);
  animation: fade-in 0.6s ease forwards;
  animation-delay: calc(0.2s + var(--index) * 0.1s);
}

@keyframes starWarsScroll {
  0% {
    transform: perspective(800px) rotateX(25deg) translateY(100%);
    opacity: 1;
  }
  100% {
    transform: perspective(800px) rotateX(25deg) translateY(-200%);
    opacity: 0;
  }
}

.content .scrolling-text {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  line-height: 1.5;
  animation: starWarsScroll 15s linear infinite;
  transform-origin: 50% 100%;
}

@media (max-width: 1024px) {
  .content {
    margin-left: 15%;
    margin-right: 15%;
    padding: 4.5rem 5rem 5rem;
  }

  .content {
    margin-right: 1rem;
    margin-left: 12rem;
    padding: 4.5rem 2rem 1rem;
    width: 100%;
  }

  .right-sidebar {
    display: none;
  }

  .sidebar {
    padding: 1.5rem;
  }
}

.markdown-content > * {
  transform-origin: bottom top;
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}

@media (max-width: 768px) {
  .sidebar,
  .right-sidebar {
    display: none;
  }

  .content {
    margin: 0;
    padding: 4.5rem 2rem 2rem;
    width: 100%;
  }

  .navigation-buttons .button {
    padding: 1rem 1rem;
    position: relative;
  }

  .navigation-buttons {
    display: flex;
    gap: 1rem;
  }
}
</style>

    