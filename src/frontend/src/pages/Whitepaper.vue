<template>
  <div class="whitepaper-container cosmic-sidepanel-layout">
    <!-- Left Sidebar (Navigation) -->
    <aside class="sidebar left-sidebar">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <i class="fas fa-book-open"></i>
          <span class="header-text">
            <strong>{{ $t('whitepaper.title') }}</strong>
            <small>{{ $t('whitepaper.navigation.documentation') }}</small>
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
              <strong>{{ $t(`whitepaper.navigation.sections.${section.id}.title`) }}</strong>
              <small>{{ $t(`whitepaper.navigation.sections.${section.id}.description`) }}</small>
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
                @headingChange="handleHeadingChange"
                @toc-updated="handleTocUpdated"
                ref="markdownRenderer"
              />
            </div>

            <!-- Loading TOC message -->
            <div class="loading-toc" v-if="toc.length === 0">Loading table of contents...</div>

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
                <small>{{ $t('whitepaper.navigation.previous') }}</small>
                <span>{{ $t(`whitepaper.navigation.sections.${previousSection?.id}.title`) }}</span>
              </button>

              <button
                v-if="showNextButton"
                class="button outline next"
                @click="navigateNext"
              >
                <small>{{ $t('whitepaper.navigation.next') }}</small>
                <span>{{ $t(`whitepaper.navigation.sections.${nextSection?.id}.title`) }}</span>
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
            <strong>{{ $t('whitepaper.navigation.mobileTitle') }}</strong>
            <small>{{ $t('whitepaper.navigation.mobileSubtitle') }}</small>
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
              <strong>{{ $t(`whitepaper.navigation.sections.${section.id}.title`) }}</strong>
              <small>{{ $t(`whitepaper.navigation.sections.${section.id}.description`) }}</small>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownRenderer from "@/components/core/MarkdownRenderer.vue";

export default {
  components: {
    MarkdownRenderer,
  },
  data() {
    return {
      activeSection: "introduction",
      sections: [
        { id: "introduction" },
        { id: "tokenomics" },
        { id: "governance" },
        { id: "community" },
        { id: "architecture" },
        { id: "core-features" }
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
      // Skip manual TOC generation as it will be handled by MarkdownRenderer events
      this.updateButtonVisibility();
    },
    
    updateUrlHash() {
      if (!this.activeSection) return;
      
      // Create a clean URL hash without any prefixes
      let hash = `#${this.activeSection}`;
      
      if (this.activeHeading) {
        hash += `#${this.activeHeading}`;
      }
      
      if (window.location.hash !== hash) {
        console.log(`Updating URL hash to: ${hash}`);
        history.replaceState(history.state, '', hash);
      }
    },
    
    handleUrlHash(hash) {
      if (!hash) return;
      
      const hashValue = hash.startsWith('#') ? hash.substring(1) : hash;
      
      if (hashValue.includes('#')) {
        const [sectionId, headingId] = hashValue.split('#');
        
        // Ensure we're using English section IDs
        const normalizedSectionId = this.normalizeSection(sectionId);
        
        if (normalizedSectionId && this.sections.some(s => s.id === normalizedSectionId)) {
          if (this.activeSection !== normalizedSectionId) {
            this.changeSection(normalizedSectionId, false);
            
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
    
    // Helper to ensure section IDs are always English
    normalizeSection(sectionId) {
      // List of valid English section IDs
      const validSections = [
        "introduction",
        "tokenomics",
        "governance",
        "community",
        "architecture",
        "core-features"
      ];
      
      // If it's already a valid section ID, return it
      if (validSections.includes(sectionId)) {
        return sectionId;
      }
      
      // Try to map translated section names back to English
      // This could be expanded with more mappings if needed
      const sectionMap = {
        // Japanese
        "はじめに": "introduction",
        "トークノミクス": "tokenomics",
        "ガバナンス": "governance",
        "コミュニティ": "community",
        "アーキテクチャ": "architecture",
        "主な機能": "core-features",
        
        // Chinese
        "介绍": "introduction",
        "代币经济学": "tokenomics",
        "治理": "governance",
        "社区": "community",
        "架构": "architecture",
        "核心功能": "core-features",
        
        // Korean
        "소개": "introduction",
        "토크노믹스": "tokenomics",
        "거버넌스": "governance",
        "커뮤니티": "community",
        "아키텍처": "architecture",
        "핵심 기능": "core-features",
        
        // Russian
        "введение": "introduction",
        "токеномика": "tokenomics",
        "управление": "governance",
        "сообщество": "community",
        "архитектура": "architecture",
        "основные функции": "core-features",
        
        // Spanish
        "introducción": "introduction",
        "tokenomía": "tokenomics",
        "gobernanza": "governance",
        "comunidad": "community",
        "arquitectura": "architecture",
        "características-principales": "core-features",
        
        // French
        "présentation": "introduction",
        "tokénomie": "tokenomics",
        "gouvernance": "governance",
        "communauté": "community",
        "architecture": "architecture",
        "fonctionnalités-clés": "core-features",
        
        // German
        "einführung": "introduction",
        "tokenomie": "tokenomics",
        "verwaltung": "governance",
        "gemeinschaft": "community",
        "architektur": "architecture",
        "kernfunktionen": "core-features",
        
        // Arabic
        "مقدمة": "introduction",
        "اقتصاديات-التوكن": "tokenomics",
        "الحوكمة": "governance",
        "المجتمع": "community",
        "البنية": "architecture",
        "الميزات-الأساسية": "core-features",
        
        // Vietnamese
        "giới-thiệu": "introduction",
        "tokenomics": "tokenomics",
        "quản-trị": "governance",
        "cộng-đồng": "community",
        "kiến-trúc": "architecture",
        "tính-năng-chính": "core-features",
        
        // Portuguese
        "introdução": "introduction",
        "tokenomia": "tokenomics",
        "governança": "governance",
        "comunidade": "community",
        "arquitetura": "architecture",
        "recursos-principais": "core-features",
        
        // Turkish
        "giriş": "introduction",
        "token-ekonomisi": "tokenomics",
        "yönetişim": "governance",
        "topluluk": "community",
        "mimari": "architecture",
        "temel-özellikler": "core-features",
        
        // Common variations and partial matches
        "intro": "introduction",
        "token": "tokenomics",
        "govern": "governance",
        "commun": "community",
        "arch": "architecture",
        "features": "core-features",
        "core": "core-features"
      };
      
      // Log the section ID normalization for debugging
      console.log(`Normalizing section ID: ${sectionId} -> ${sectionMap[sectionId] || sectionId}`);
      
      // Return the mapped section or the original if not found
      return sectionMap[sectionId] || sectionId;
    },
    
    changeSection(sectionId, updateUrl = true) {
      this.activeSection = sectionId;
      this.toc = [];
      this.activeHeading = null;
      this.updateButtonVisibility();
      
      // Wait for the transition to complete before scrolling
      this.$nextTick(() => {
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
        
        // Normalize section ID to ensure it's English
        const normalizedSectionId = this.normalizeSection(sectionId);
        
        if (this.sections.some(s => s.id === normalizedSectionId)) {
          if (this.activeSection !== normalizedSectionId) {
            this.changeSection(normalizedSectionId, false);
            
            this.$nextTick(() => {
              setTimeout(() => this.scrollToHeading(headingId), 300);
            });
          } else {
            this.scrollToHeading(headingId);
          }
        }
        return;
      }
      
      // Normalize the single section ID
      const normalizedSectionId = this.normalizeSection(sectionIdOrHeadingId);
      const section = this.sections.find((s) => s.id === normalizedSectionId);
      
      if (section) {
        this.changeSection(normalizedSectionId);
      } else {
        this.scrollToHeading(sectionIdOrHeadingId);
      }
    },

    updateButtonVisibility() {
      this.showPreviousButton = !!this.previousSection;
      this.showNextButton = !!this.nextSection;
    },

    generateTOC() {
      // This is now a placeholder - the actual TOC generation is handled by MarkdownRenderer
      // and sent via the @toc-updated event. 
      // This method is kept for compatibility with existing code references.
      this.updateButtonVisibility();
    },

    scrollToHeading(id) {
      console.log(`Whitepaper trying to scroll to heading: "${id}"`);
      
      // Get reference to markdown renderer component
      const markdownRenderer = this.$refs.markdownRenderer;
      if (markdownRenderer) {
        console.log(`Using markdown renderer to scroll to: "${id}"`);
        markdownRenderer.scrollToHeading(id);
      } else {
        console.warn(`MarkdownRenderer not available, falling back to direct scrolling`);
        
        const target = document.getElementById(id);
        if (target) {
          const headerOffset = 120;
          const mainContent = document.querySelector(".main-content");
          if (!mainContent) return;

          const targetPosition = target.offsetTop - headerOffset;
          console.log(`Direct scrolling to position: ${targetPosition}`);

          mainContent.scrollTo({
            top: targetPosition,
            behavior: "smooth"
          });

          this.activeHeading = id;
          console.log(`Updated active heading to: "${id}"`);
        } else {
          console.error(`Heading not found with ID: "${id}"`);
        }
      }
    },

    observeSections() {
      // This is now handled by MarkdownRenderer
      // This method is kept for compatibility with existing code references.
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
        'introduction': 'Project overview and value proposition',
        'tokenomics': 'Token distribution and economic model',
        'governance': 'Stakeholder control and decision-making',
        'core-features': 'Product capabilities and mechanics',
        'community': 'Growth strategies and engagement',
        'architecture': 'Technical implementation details'
      };
      return descriptions[sectionId] || '';
    },

    handleHeadingChange(headingId) {
      this.activeHeading = headingId;
      this.updateUrlHash();
    },
    
    handleTocUpdated(newToc) {
      console.log("TOC Updated:", newToc); // Debug log
      if (Array.isArray(newToc)) {
        // Log the actual TOC structure to debug
        newToc.forEach(item => {
          console.log(`TOC item: ID=${item.id}, Text=${item.text}`);
        });
      }
      
      this.toc = newToc || [];
      if (newToc && newToc.length > 0 && !this.activeHeading) {
        this.activeHeading = newToc[0].id;
      }
      this.updateButtonVisibility();
      
      // Add a loading message when TOC is empty
      if (this.toc.length === 0) {
        const rightSidebar = document.querySelector('.right-sidebar .sidebar-content');
        if (rightSidebar) {
          rightSidebar.innerHTML = '<div class="loading-toc">Loading table of contents...</div>';
        }
      }
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
  
  --color-border: rgba(255, 255, 255, 0.11);
  
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
  background: radial-gradient(circle at 30% 30%, var(--cosmic-bg-dark), var(--cosmic-bg-darkest) 70%);
}

/* Sidebar Base Styles */
.sidebar {
  height: 100%;
  overflow: hidden;
  border-color: rgba(0, 217, 255, 0.164);
  border-style: solid;
  border-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--cosmic-glass-bg-darker);
  backdrop-filter: var(--cosmic-glass-blur);
  box-shadow: var(--cosmic-shadow-md);
  position: relative;
  z-index: 2;
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
  scrollbar-width: thin;
  scrollbar-color: var(--cosmic-blue-translucent) transparent;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: var(--cosmic-blue-translucent-faint);
  border-radius: 6px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--cosmic-blue-translucent);
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
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.sidebar-header i {
  font-size: 1.5rem;
  color: var(--cosmic-blue);
  background: var(--cosmic-blue-translucent-faint);
  padding: 1rem;
  border-radius: 50%;
  box-shadow: var(--cosmic-glow-blue-sm);
  flex-shrink: 0;
  transition: var(--cosmic-transition-fast);
}

.header-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-text strong {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cosmic-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: var(--cosmic-glow-blue-text);
}

.header-text small {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Navigation Items Base */
.sidebar-nav-item {
  position: relative;
  border-radius: var(--cosmic-radius-md);
  background: transparent;
  color: var(--cosmic-text-secondary);
  font-weight: 700;
  cursor: pointer;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  box-sizing: border-box;
  text-shadow: 0 2px 4px rgba(0, 0, 0, .75);
  transition: var(--cosmic-transition-medium);
  width: 100%;
  overflow: hidden;
}

/* Left Sidebar Navigation */
.sidebar-nav-item.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
  padding: 1rem;
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  border-radius: var(--cosmic-radius-md);
  max-width: 100%;
  box-sizing: border-box;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(0, 0, 0, 0.02);
}

.sidebar-nav-item.left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    var(--cosmic-blue-translucent-faint) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.sidebar-nav-item.left i {
  font-size: 1rem;
  color: var(--cosmic-blue);
  background: var(--cosmic-blue-translucent-faint);
  padding: 0.75rem;
  border-radius: 50%;
  transition: var(--cosmic-transition-fast);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.section-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  overflow: hidden;
  min-width: 0; /* Critical for text-overflow to work */
  position: relative;
  z-index: 1;
}

.section-text strong {
  font-size: 1rem;
  color: var(--cosmic-text-primary);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: var(--cosmic-transition-fast);
}

.section-text small {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--cosmic-text-secondary);
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
  border-radius: var(--cosmic-radius-sm);
}

/* Navigation Item States */
.sidebar-nav-item.left:hover {
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  transform: translateY(-4px) translateX(4px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.sidebar-nav-item.left:hover::before {
  opacity: 1;
}

.sidebar-nav-item.left:hover i {
  background: var(--cosmic-blue-translucent);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: scale(1.1);
}

.sidebar-nav-item.left:hover .section-text strong {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-text);
}

.sidebar-nav-item.left.active {
  background: var(--cosmic-blue-translucent-faint);
  border-color: var(--cosmic-blue);
  border-left: 3px solid var(--cosmic-orange);
  box-shadow: var(--cosmic-glow-blue-sm);
  transform: translateY(-2px);
}

.sidebar-nav-item.left.active i {
  background: var(--cosmic-blue-translucent);
  box-shadow: var(--cosmic-glow-blue-md);
}

.sidebar-nav-item.left.active .section-text strong {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-text);
}

.sidebar-nav-item.right:hover {
  color: var(--cosmic-blue);
  background: var(--cosmic-blue-translucent-faint);
  transform: translateX(4px);
}

.sidebar-nav-item.right.active {
  color: var(--cosmic-blue);
  font-weight: 600;
  background: var(--cosmic-blue-translucent-faint);
  border-left: 2px solid var(--cosmic-orange);
  text-shadow: var(--cosmic-glow-blue-text);
}

/* Main Content Area */
.main-content {
  grid-area: main-content;
  height: 100%;
  overflow-y: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: var(--cosmic-blue-translucent) transparent;
  background: radial-gradient(circle at 30% 30%, var(--cosmic-bg-dark), var(--cosmic-bg-darkest) 70%);
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: var(--cosmic-blue-translucent-faint);
  border-radius: 6px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--cosmic-blue-translucent);
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
  z-index: 2;
}

.content-container,
.markdown-container {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  background: var(--cosmic-glass-bg-faint);
  backdrop-filter: var(--cosmic-glass-blur);
  border-radius: var(--cosmic-radius-lg);
  padding: 2rem;
  border: var(--cosmic-glass-border-blue);
  box-shadow: var(--cosmic-shadow-md);
  overflow: hidden;
}

/* Loading TOC message */
.loading-toc {
  padding: 1rem;
  text-align: center;
  color: var(--cosmic-text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Navigation buttons */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
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
  padding: 1.5rem 1.5rem;
  position: relative;
  border: var(--cosmic-glass-border-blue);
  background: var(--cosmic-glass-bg);
  border-radius: var(--cosmic-radius-md);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  overflow: hidden;
  transform-style: preserve-3d;
}

.navigation-buttons .button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    transparent 0%,
    var(--cosmic-blue-translucent-faint) 100%
  );
  opacity: 0;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.navigation-buttons .button:hover {
  background: var(--cosmic-glass-bg-lighter);
  border-color: var(--cosmic-blue);
  transform: translateY(-3px);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.navigation-buttons .button:hover::before {
  opacity: 1;
}

.navigation-buttons .button.prev {
  padding-left: 5rem;
  text-align: left;
  align-items: flex-start;
}

.navigation-buttons .button.next {
  padding-right: 5rem;
  text-align: right;
  align-items: flex-end;
}

.navigation-buttons .button span {
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.navigation-buttons small {
  color: var(--cosmic-text-secondary);
  font-size: 0.85rem;
  position: relative;
  z-index: 1;
}

.navigation-buttons .button:hover span {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-text);
}

.navigation-buttons .button .arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmic-blue-translucent-faint);
  border-radius: 50%;
  padding: 0.5rem;
  transition: all 0.3s ease;
  z-index: 1;
}

.navigation-buttons .button.prev .arrow {
  left: 1rem;
}

.navigation-buttons .button.next .arrow {
  right: 1rem;
}

.navigation-buttons .button:hover .arrow {
  background: var(--cosmic-blue-translucent);
  transform: translateY(-50%) scale(1.1);
  box-shadow: var(--cosmic-glow-blue-md);
}

/* Mobile Navigation */
.mobile-navigation-container {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background: var(--cosmic-glass-bg-darker);
  backdrop-filter: var(--cosmic-glass-blur);
  border-top: var(--cosmic-glass-border-blue);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  overflow: hidden;
}

.mobile-nav-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: var(--cosmic-glass-bg);
  border: none;
  border-top: var(--cosmic-glass-border-blue);
  color: var(--cosmic-text-primary);
  cursor: pointer;
  transition: var(--cosmic-transition-medium);
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
  color: var(--cosmic-blue);
  background: var(--cosmic-blue-translucent-faint);
  padding: 0.85rem;
  border-radius: 50%;
  box-shadow: var(--cosmic-glow-blue-sm);
  flex-shrink: 0;
  transition: var(--cosmic-transition-fast);
}

.mobile-nav-button:hover .button-content i {
  transform: scale(1.05);
  box-shadow: var(--cosmic-glow-blue-md);
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
  color: var(--cosmic-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button-text small {
  font-size: 0.85rem;
  color: var(--cosmic-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-icon {
  color: var(--cosmic-blue);
  font-size: 1.25rem;
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  background: var(--cosmic-blue-translucent-faint);
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
  background: var(--cosmic-blue-translucent);
  box-shadow: var(--cosmic-glow-blue-md);
}

.mobile-nav-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
  background: var(--cosmic-glass-bg-darker);
  box-sizing: border-box;
}

.mobile-nav-menu.expanded {
  max-height: 70vh;
  overflow-y: auto;
  padding: 1rem 0;
  border-top: var(--cosmic-glass-border-blue);
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
  border-radius: var(--cosmic-radius-md);
  background: var(--cosmic-glass-bg);
  border: var(--cosmic-glass-border-blue);
  cursor: pointer;
  transition: var(--cosmic-transition-medium);
  box-sizing: border-box;
  width: 100%;
  transform-style: preserve-3d;
}

.mobile-nav-menu li i {
  font-size: 1.25rem;
  color: var(--cosmic-blue);
  background: var(--cosmic-blue-translucent-faint);
  padding: 0.75rem;
  border-radius: 50%;
  transition: var(--cosmic-transition-fast);
  flex-shrink: 0;
}

.mobile-nav-menu li:hover {
  background: var(--cosmic-glass-bg-lighter);
  transform: translateX(8px);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.mobile-nav-menu li:hover i {
  background: var(--cosmic-blue-translucent);
  transform: scale(1.1);
  box-shadow: var(--cosmic-glow-blue-md);
}

.mobile-nav-menu li.active {
  background: var(--cosmic-blue-translucent-faint);
  border-color: var(--cosmic-blue);
  box-shadow: var(--cosmic-glow-blue-sm);
}

.mobile-nav-menu li.active i {
  background: var(--cosmic-blue-translucent);
  box-shadow: var(--cosmic-glow-blue-md);
}

.mobile-nav-menu li.active .section-text strong {
  color: var(--cosmic-blue);
  text-shadow: var(--cosmic-glow-blue-text);
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

/* Background Elements */
.whitepaper-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(15, 185, 253, 0.05) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
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
    padding: 4rem 1rem 6rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .content-container,
  .markdown-container {
    padding: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .navigation-buttons .button {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 3rem 0.5rem 6rem;
  }
  
  .content-container,
  .markdown-container {
    padding: 1.25rem 0.75rem;
    border-radius: 8px;
  }
  
  .navigation-buttons .button {
    padding: 1rem;
  }
  
  .navigation-buttons .button.prev {
    padding-left: 3rem;
  }
  
  .navigation-buttons .button.next {
    padding-right: 3rem;
  }
  
  .navigation-buttons .button span {
    font-size: 0.9rem;
  }
  
  .navigation-buttons small {
    font-size: 0.75rem;
  }
}
</style>