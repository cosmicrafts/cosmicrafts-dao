<template>
  <div class="markdown-content" v-html="htmlContent" @click="emitRendered"></div>
</template>

<script>
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItToc from "markdown-it-toc-done-right";
import markdownItContainer from "markdown-it-container";
import markdownItHighlightjs from "markdown-it-highlightjs";

export default {
  name: 'MarkdownRenderer',
  props: {
    fileName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      htmlContent: "",
      tocLevels: [2, 2], // Default to level 2 headings only
      tocRegex: /\[\[toc(?::(\d+)-(\d+))?\]\]/i,
      toc: [],
      activeHeading: null,
      sectionObserver: null,
      scrollHandler: null,
      scrollTimeout: null,
      headingIndex: 1,
      mermaidInitialized: false
    };
  },
  mounted() {
    this.loadMarkdown(this.$i18n.locale);
    this.initializeMermaid();

    // Add click listener for internal links
    this.$el.addEventListener("click", (event) => {
      const target = event.target;
      if (target.tagName === "A" && target.classList.contains("internal-link")) {
        event.preventDefault(); // Prevent default anchor behavior
        const href = target.getAttribute("href");
        if (href.startsWith("#")) {
          const sectionId = href.slice(1); // Remove the # symbol
          
          // Check if this is a cross-section reference (like /tokenomics#section)
          if (sectionId.includes('/')) {
            const [targetSection, targetHeading] = sectionId.split('#');
            // Remove the leading slash if present
            const cleanSection = targetSection.startsWith('/') ? targetSection.substring(1) : targetSection;
            
            if (targetHeading) {
              // Both section and heading specified
              this.$emit("navigateToSection", `${cleanSection}#${targetHeading}`);
            } else {
              // Only section specified
              this.$emit("navigateToSection", cleanSection);
            }
          } else {
            // Regular internal heading reference
            this.$emit("navigateToSection", sectionId);
          }
        }
      }
      
      // We no longer need this TOC toggle handler since we're using onclick directly
      // in the HTML for better compatibility
    });
  },
  watch: {
    fileName: "reloadMarkdown",
    "$i18n.locale": "reloadMarkdown",
  },
  methods: {
    initializeMermaid() {
      if (this.mermaidInitialized) return;
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js';
      script.onload = () => {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          themeVariables: {
            darkMode: true,
            background: '#19222e',
            mainBkg: '#19222e',
            primaryColor: '#0FB9FD',
            primaryBorderColor: '#0A8BC0',
            primaryTextColor: '#ffffff',
            secondaryColor: '#FF9100',
            secondaryBorderColor: '#CC7400',
            secondaryTextColor: '#ffffff',
            tertiaryColor: '#00E5A4',
            tertiaryBorderColor: '#00B380',
            tertiaryTextColor: '#ffffff',
            noteTextColor: '#ffffff',
            noteBkgColor: 'rgba(15, 185, 253, 0.1)',
            noteBorderColor: '#0FB9FD',
            lineColor: 'rgba(15, 185, 253, 0.5)',
            textColor: '#ffffff',
            nodeBorder: '#0FB9FD',
            clusterBkg: 'rgba(15, 185, 253, 0.05)',
            clusterBorder: '#0FB9FD',
            defaultLinkColor: 'rgba(15, 185, 253, 0.5)',
            titleColor: '#0FB9FD',
            edgeLabelBackground: 'rgba(15, 185, 253, 0.05)',
          }
        });
        this.mermaidInitialized = true;
        this.renderMermaidDiagrams();
      };
      document.head.appendChild(script);
    },
    reloadMarkdown() {
      this.loadMarkdown(this.$i18n.locale);
    },
    async loadMarkdown(lang) {
      try {
        if (!lang) {
          console.error('No language specified for markdown loading');
          lang = 'en';
        }
        
        if (!this.fileName) {
          console.error('No fileName specified for markdown loading');
          throw new Error('fileName is required');
        }
        
        console.log(`Attempting to load markdown: ${lang}/${this.fileName}`);
        let content;
        let usedFallback = false;
        
        try {
          // First try to load the requested language
          content = await import(`@/assets/markdown/${lang}/${this.fileName}.md?raw`);
          console.log(`Successfully loaded ${lang}/${this.fileName}`);
        } catch (importError) {
          console.warn(`Failed to load ${lang}/${this.fileName}, falling back to English...`, importError);
          
          try {
            // Fallback to English if the requested language fails
            content = await import(`@/assets/markdown/en/${this.fileName}.md?raw`);
            usedFallback = true;
            console.log(`Successfully loaded English fallback for ${this.fileName}`);
          } catch (fallbackError) {
            console.error(`Failed to load English fallback for ${this.fileName}`, fallbackError);
            this.htmlContent = `<div class="error-message">Failed to load content for ${this.fileName}</div>`;
            return;
          }
        }
        
        if (!content || !content.default) {
          console.error(`Invalid content loaded for ${this.fileName}`);
          this.htmlContent = `<div class="error-message">Invalid content for ${this.fileName}</div>`;
          return;
        }
        
        // Process the content
        let processedContent = content.default;
        
        // Initialize markdown-it with options
        const md = new MarkdownIt({
          html: true,
          typographer: true,
          linkify: true,
          breaks: true
        });
        
        // Add custom fence renderer for mermaid diagrams
        const defaultFence = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options);
        };

        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
          const token = tokens[idx];
          const code = token.content.trim();
          if (token.info.trim() === 'mermaid') {
            return `<div class="mermaid">${code}</div>`;
          }
          return defaultFence(tokens, idx, options, env, self);
        };

        // Add info container support
        md.use(markdownItContainer, 'info', {
          validate: function(params) {
            return params.trim().match(/^info\s*(.*)$/);
          },
          render: function (tokens, idx) {
            const m = tokens[idx].info.trim().match(/^info\s*(.*)$/);
            if (tokens[idx].nesting === 1) {
              // opening tag
              return `<div class="cosmic-info-container">
                <div class="nebula-particles">
                  <div class="nebula-particle"></div>
                  <div class="nebula-particle"></div>
                  <div class="nebula-particle"></div>
                  <div class="nebula-particle"></div>
                  <div class="nebula-particle"></div>
                </div>
                <div class="energy-flow"></div>
                ${m[1] ? `<div class="cosmic-info-title">${md.utils.escapeHtml(m[1])}</div>` : ''}\n`;
            } else {
              // closing tag
              return '</div>\n';
            }
          }
        });

        // Add warning container support
        md.use(markdownItContainer, 'warning', {
          validate: function(params) {
            return params.trim().match(/^warning\s+(.*)$/);
          },
          render: function (tokens, idx) {
            if (tokens[idx].nesting === 1) {
              const m = tokens[idx].info.trim().match(/^warning\s+(.*)$/);
              return `<div class="warning-container">${m[1] ? `<div class="warning-title">${md.utils.escapeHtml(m[1])}</div>` : ''}\n`;
            } else {
              return '</div>\n';
            }
          }
        });

        // Custom image renderer
        md.renderer.rules.image = (tokens, idx, options, env, self) => {
          const token = tokens[idx];
          const srcIndex = token.attrIndex('src');
          const src = token.attrs[srcIndex][1];
          const alt = token.content || '';

          try {
            let imagePath;
            if (src.startsWith('http://') || src.startsWith('https://')) {
              imagePath = src;
            } else {
              // Handle both .webp and other image formats
              if (src.endsWith('.svg')) {
                imagePath = new URL(`../assets/icons/${src}`, import.meta.url).href;
              } else if (src.endsWith('.webp')) {
                imagePath = new URL(`../../assets/webp/${src}`, import.meta.url).href;
              } else {
                // Try .webp extension if no extension is specified
                imagePath = new URL(`../../assets/webp/${src}.webp`, import.meta.url).href;
              }
            }

            return `<img src="${imagePath}" alt="${alt}" class="markdown-image" loading="lazy">`;
          } catch (error) {
            console.error(`Error loading image: ${src}`, error);
            return `<div class="image-error">Failed to load image: ${alt}</div>`;
          }
        };

        // Add the rest of your markdown-it plugins
        md.use(markdownItToc)
          .use(markdownItAnchor)
          .use(markdownItContainer)
          .use(markdownItHighlightjs);
        
        // Add TOC if not present and this is a legal document
        if (this.fileName === 'terms' || this.fileName === 'privacy' || this.fileName === 'legal') {
          if (!processedContent.includes('[[toc]]')) {
            processedContent = '[[toc]]\n\n' + processedContent;
          }
        }
        
        // Render the markdown
        this.htmlContent = md.render(processedContent);
        
        // Emit the rendered event
        this.$nextTick(() => {
          this.emitRendered();
        });
        
      } catch (error) {
        console.error(`Error in loadMarkdown for ${this.fileName}:`, error);
        this.htmlContent = `<div class="error-message">Error loading content</div>`;
      }
    },
    processMarkdown(content) {
      if (!content) {
        console.error('No content provided to processMarkdown');
        return;
      }
      
      // Process TOC markers
      const tocMatch = content.match(this.tocRegex);
      if (tocMatch) {
        content = content.replace(this.tocRegex, '<div class="toc-placeholder"></div>');
      }

      // Replace Mermaid code blocks with a placeholder
      const mermaidRegex = /```mermaid([\s\S]*?)```/g;
      let processedContent = content.replace(mermaidRegex, (match, diagram) => {
        // Trim whitespace and ensure the diagram has proper syntax
        const trimmedDiagram = diagram.trim();
        return `<pre class="mermaid">${trimmedDiagram}</pre>`;
      });
      
      // Initialize markdown-it with basic options
      const md = new MarkdownIt({
        html: true,
        typographer: true,
        linkify: true,
      });
      
      // Add TOC plugin first
      md.use(markdownItToc, {
        containerClass: 'toc-container',
        listClass: 'toc-list',
        itemClass: 'toc-item',
        linkClass: 'toc-link',
        level: [1, 2, 3]
      });

      // Add anchor links to headings
      md.use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.headerLink({
          class: 'header-anchor',
          safariReaderFix: true
        })
      });
      
      // Custom container for legal documents
      md.use(markdownItContainer, 'info', {
        validate: function(params) {
          return params.trim().match(/^info\s*(.*)$/);
        },
        render: function (tokens, idx) {
          const m = tokens[idx].info.trim().match(/^info\s*(.*)$/);
          if (tokens[idx].nesting === 1) {
            // opening tag
            return `<div class="cosmic-info-container">
              <div class="nebula-particles">
                <div class="nebula-particle"></div>
                <div class="nebula-particle"></div>
                <div class="nebula-particle"></div>
                <div class="nebula-particle"></div>
                <div class="nebula-particle"></div>
              </div>
              <div class="energy-flow"></div>
              ${m[1] ? `<div class="cosmic-info-title">${md.utils.escapeHtml(m[1])}</div>` : ''}\n`;
          } else {
            // closing tag
            return '</div>\n';
          }
        }
      });

      md.use(markdownItContainer, 'warning', {
        validate: function(params) {
          return params.trim().match(/^warning\s+(.*)$/);
        },
        render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
            const m = tokens[idx].info.trim().match(/^warning\s+(.*)$/);
            return `<div class="warning-container">${m[1] ? `<div class="warning-title">${md.utils.escapeHtml(m[1])}</div>` : ''}\n`;
          } else {
            return '</div>\n';
          }
        }
      });

      // Add syntax highlighting
      md.use(markdownItHighlightjs);
      
      // Custom image renderer
      const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const srcIndex = token.attrIndex("src");
        
        if (srcIndex >= 0) {
          const src = token.attrs[srcIndex][1];
          
          if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            return defaultImageRender(tokens, idx, options, env, self);
          }
          
          try {
            if (src.endsWith('.svg')) {
              token.attrs[srcIndex][1] = new URL(`../assets/icons/${src}`, import.meta.url).href;
            } else {
              token.attrs[srcIndex][1] = new URL(`../assets/webp/${src}`, import.meta.url).href;
            }
          } catch (e) {
            console.error(`Error resolving image path for ${src}:`, e);
          }
        }
        
        return defaultImageRender(tokens, idx, options, env, self);
      };

      // Add classes to headings
      const defaultHeadingOpen = md.renderer.rules.heading_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };
      
      md.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
        const token = tokens[idx];
        token.attrJoin('class', 'cosmic-heading');
        return defaultHeadingOpen(tokens, idx, options, env, self);
      };
      
      // Process the content
      let finalContent = processedContent;
      
      // Add TOC if not present and this is a legal document
      if (this.fileName === 'terms' || this.fileName === 'privacy' || this.fileName === 'legal') {
        if (!finalContent.includes('[[toc]]')) {
          finalContent = '[[toc]]\n\n' + finalContent;
        }
      }
      
      // Render the markdown
      this.htmlContent = md.render(finalContent);
      
      // Render mermaid diagrams after content is rendered
      this.$nextTick(() => {
        this.renderMermaidDiagrams();
        this.emitRendered();
      });
    },
    emitRendered() {
      // Emit the rendered event
      this.$emit("rendered");
      
      // Generate TOC after rendering
      this.$nextTick(() => {
        // Generate the in-document TOC if needed
        this.generateInDocumentTOC();
        
        // Generate the sidebar TOC
        this.generateTOC();
      });
    },
    generateTOC() {
      const contentElement = document.querySelector(".main-content");
      if (!contentElement) return;
      
      console.log(`Generating TOC for ${this.fileName}`);
      
      // Get all h2 headings - try different selectors to ensure we find the headings
      let headings = contentElement.querySelectorAll("h2.cosmic-heading");
      
      // If no headings found, try without the cosmic-heading class
      if (!headings.length) {
        headings = contentElement.querySelectorAll("h2");
      }
      
      // If still no headings, try a more general selector
      if (!headings.length) {
        headings = contentElement.querySelectorAll(".markdown-content h2");
      }
      
      if (!headings.length) {
        console.warn("No h2 headings found for TOC generation");
        return;
      }

      console.log(`Found ${headings.length} h2 headings for TOC`);
      this.toc = [];
      
      // Create an array of objects with id and text for each heading
      headings.forEach((heading, index) => {
        // Use the ID that was already set by markdownItAnchor
        const headingId = heading.id;
        if (!headingId) {
          console.warn(`Heading #${index} has no ID:`, heading.outerHTML);
          return; // Skip headings without IDs
        }
        
        // Get text content from either the special span or the heading itself
        let headingText = "";
        const span = heading.querySelector('.heading-text');
        if (span) {
          headingText = span.textContent.trim();
        } else {
          headingText = heading.textContent.trim();
        }
        
        // Add to TOC
        this.toc.push({
          id: headingId,
          text: headingText,
          element: heading
        });
        
        // Log for debugging
        console.log(`TOC entry [${index}]: ID="${headingId}", Text="${headingText}"`);
      });

      if (this.toc.length > 0) {
        // Set the first heading as active initially
        this.activeHeading = this.toc[0].id;
        console.log(`Set initial active heading: ${this.activeHeading}`);
        
        // Emit both event formats for maximum compatibility
        this.$emit('toc-updated', this.toc);
        this.$emit('tocUpdated', this.toc);
      } else {
        console.warn("Generated TOC is empty!");
      }

      // Set up scroll tracking
      this.setupScrollTracking();
    },
    setupScrollTracking() {
      const contentElement = document.querySelector(".main-content");
      if (!contentElement || !this.toc.length) return;

      // Clean up existing scroll handler
      if (this.scrollHandler) {
        contentElement.removeEventListener('scroll', this.scrollHandler);
      }

      // Debounced scroll handler
      let debounceTimer = null;
      let lastScrollTop = contentElement.scrollTop;

      this.scrollHandler = () => {
        const scrollTop = contentElement.scrollTop;
        const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        lastScrollTop = scrollTop;
        
        // Clear previous timer
        if (debounceTimer) clearTimeout(debounceTimer);
        
        // Set new timer
        debounceTimer = setTimeout(() => {
          // Find visible headings
          const viewportHeight = contentElement.clientHeight;
          const viewportTop = scrollTop;
          const viewportMiddle = viewportTop + (viewportHeight / 3); // 1/3 from top
          
          let bestHeading = null;
          let bestDistance = Infinity;
          
          // Find heading closest to the middle of the viewport
          for (const { id, element } of this.toc) {
            const rect = element.getBoundingClientRect();
            const offsetTop = rect.top + window.pageYOffset;
            const distance = Math.abs(offsetTop - viewportMiddle);
            
            if (distance < bestDistance) {
              bestDistance = distance;
              bestHeading = id;
            }
          }
          
          // Update active heading if changed
          if (bestHeading && this.activeHeading !== bestHeading) {
            this.activeHeading = bestHeading;
            this.$emit('heading-change', this.activeHeading);
          }
        }, 50); // 50ms debounce
      };

      // Add event listener
      contentElement.addEventListener('scroll', this.scrollHandler, { passive: true });
    },
    scrollToHeading(headingId) {
      console.log(`Scrolling to heading: "${headingId}"`);
      
      const heading = document.getElementById(headingId);
      if (!heading) {
        console.warn(`Heading not found with ID: "${headingId}"`);
        
        // Try logging all headings to debug
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4');
        console.log(`All ${allHeadings.length} headings in document:`);
        allHeadings.forEach((h, i) => console.log(`Heading ${i}: ${h.tagName}, ID=${h.id}, content="${h.textContent}"`));
        
        return;
      }
      
      console.log(`Found heading: "${heading.textContent.trim()}" with tag ${heading.tagName}`);
      
      const contentElement = document.querySelector(".main-content");
      if (!contentElement) return;
      
      const offsetTop = heading.offsetTop;
      const headerOffset = 100; // Offset for fixed headers
      
      console.log(`Scrolling to position: ${offsetTop - headerOffset}`);
      
      contentElement.scrollTo({
        top: offsetTop - headerOffset,
        behavior: 'smooth'
      });
      
      this.activeHeading = headingId;
      console.log(`Updated active heading to: "${headingId}"`);
      this.$emit('heading-change', this.activeHeading);
    },
    beforeDestroy() {
      const contentElement = document.querySelector(".main-content");
      if (contentElement && this.scrollHandler) {
        contentElement.removeEventListener('scroll', this.scrollHandler);
      }
    },
    generateInDocumentTOC() {
      const tocPlaceholder = document.getElementById(`toc-placeholder-${this.fileName}`);
      if (!tocPlaceholder) return;
      
      // Clear any existing content first
      tocPlaceholder.innerHTML = '';
      
      // Get the TOC container to check for level restrictions
      const tocContainer = tocPlaceholder.closest('.toc-container');
      let minLevel = 2; // Default min level (h2)
      let maxLevel = 3; // Default max level (h3)
      
      // Check if we have custom level restrictions
      if (tocContainer) {
        if (tocContainer.hasAttribute('data-min-level')) {
          minLevel = parseInt(tocContainer.getAttribute('data-min-level'));
        }
        if (tocContainer.hasAttribute('data-max-level')) {
          maxLevel = parseInt(tocContainer.getAttribute('data-max-level'));
        }
      }
      
      // Build selector for the specified heading levels
      const headingSelectors = [];
      for (let i = minLevel; i <= maxLevel; i++) {
        headingSelectors.push(`.markdown-content h${i}`);
      }
      
      const headings = document.querySelectorAll(headingSelectors.join(', '));
      if (headings.length > 0) {
        const toc = document.createElement('ul');
        headings.forEach((heading, index) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = `#${heading.id}`;
          link.textContent = heading.textContent;
          link.classList.add('internal-link');
          
          // Indent based on heading level
          const headingLevel = parseInt(heading.tagName.substring(1));
          if (headingLevel > minLevel) {
            item.style.marginLeft = `${(headingLevel - minLevel) * 1}rem`;
          }
          
          item.appendChild(link);
          toc.appendChild(item);
        });
        
        tocPlaceholder.appendChild(toc);
      }
      
      // Render Mermaid diagrams after content is fully loaded
      this.renderMermaidDiagrams();
    },
    renderMermaidDiagrams() {
      if (!window.mermaid || !this.mermaidInitialized) {
        console.warn('Mermaid not initialized yet');
        return;
      }

      const mermaidDivs = document.querySelectorAll('.mermaid');
      if (mermaidDivs.length === 0) return;

      mermaidDivs.forEach((element, index) => {
        const uniqueId = `mermaid-diagram-${this.fileName}-${index}`;
        element.id = uniqueId;
        
        try {
          window.mermaid.run({
            nodes: [element]
          }).catch(error => {
            console.error(`Error rendering mermaid diagram ${uniqueId}:`, error);
            element.innerHTML = `<div class="mermaid-error">Failed to render diagram</div>`;
          });
        } catch (error) {
          console.error(`Error processing mermaid diagram ${uniqueId}:`, error);
        }
      });
    },
    // Helper method to create clean IDs from heading text
    slugify(text) {
      if (!text) return '';
      
      // For English, create a clean slug
      return text.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Remove consecutive hyphens
        .replace(/^-+|-+$/g, '')  // Remove trailing/leading hyphens
        || 'section';             // Fallback if empty
    },
    // Create a clean, URL-friendly slug from text
    createCleanSlug(text) {
      if (!text) return 'untitled';
      
      // First, convert to lowercase and normalize Unicode characters
      return text.toLowerCase()
        // Remove accents and convert to base latin characters
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Remove non-alphanumeric characters (except spaces and hyphens)
        .replace(/[^\w\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading/trailing hyphens
        .replace(/^-+|-+$/g, '');
    },
  },
};
</script>

<style>
/* Base styles for markdown content - update existing styles */
.markdown-content {
  line-height: 1.6;
  color: var(--color-text-secondary);
  font-size: 1.05rem;
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
  letter-spacing: 0.01em;
  text-rendering: optimizeLegibility;
  overflow-wrap: break-word;
  hyphens: auto;
  margin: 0 auto;
}

/* Enhanced Typography System */
.markdown-content p {
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  line-height: 1.75;
}

.markdown-content strong {
  color: #0FB9FD;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-shadow: 0 0 3px rgba(15, 185, 253, 0.2);
}

.markdown-content em {
  color: #FFB800;
  font-style: italic;
  letter-spacing: 0.02em;
}

.markdown-content a:not(.header-anchor) {
  color: #4DCFFF;
  text-decoration: none;
  border-bottom: 1px solid rgba(15, 185, 253, 0.3);
  transition: all 0.25s ease;
  padding: 0.1em 0.2em;
  margin: -0.1em -0.2em;
  border-radius: 3px;
  position: relative;
  z-index: 1;
}

.markdown-content a:not(.header-anchor):hover {
  color: #F0F0F0;
  background-color: rgba(15, 185, 253, 0.2);
  border-bottom-color: rgba(15, 185, 253, 0.8);
  text-shadow: 0 0 6px rgba(15, 185, 253, 0.5);
}

/* Dramatic Cosmic Headings */
.markdown-content h1.cosmic-heading {
  font-size: 3.5rem !important;
  font-weight: 900 !important;
  background: linear-gradient(135deg, 
    #FF9100 0%,
    #FFB800 25%,
    #0FB9FD 50%,
    #4DCFFF 75%,
    #00E5A4 100%
  ) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  margin-bottom: 2rem !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 4px 15px rgba(15, 185, 253, 0.4) !important;
  position: relative !important;
  transform: perspective(1000px) translateZ(0);
  transition: all 0.3s ease;
}

.markdown-content h1.cosmic-heading:hover {
  transform: perspective(1000px) translateZ(20px);
}

.markdown-content h2.cosmic-heading {
  font-size: 2.5rem !important;
  font-weight: 800 !important;
  margin-top: 3rem !important;
  margin-bottom: 1.5rem !important;
  background: linear-gradient(90deg, 
    #FF9100,
    #FFB800,
    #FF9100
  ) !important;
  background-size: 200% auto !important;
  animation: shine 3s linear infinite !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: 0 2px 10px rgba(255, 145, 0, 0.3) !important;
  position: relative !important;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.markdown-content h3.cosmic-heading {
  font-size: 2rem !important;
  font-weight: 700 !important;
  background: linear-gradient(45deg, #0FB9FD, #00E5A4) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: 0 2px 8px rgba(15, 185, 253, 0.3) !important;
  letter-spacing: 0.02em !important;
}

.markdown-content h4.cosmic-heading {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  background: linear-gradient(45deg, #4DCFFF, #91E0FF) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: 0 2px 6px rgba(15, 185, 253, 0.2) !important;
}

/* Dramatic New List Styling */
.markdown-content ul {
  padding-left: 0;
  margin: 2rem 0;
  list-style: none;
}

.markdown-content ul li {
  position: relative;
  padding: 0.75rem 1rem 0.75rem 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.1),
    rgba(15, 185, 253, 0.05) 50%,
    transparent
  );
  border-radius: 8px;
  transition: all 0.3s ease;
}

.markdown-content ul li:hover {
  transform: translateX(10px);
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.15),
    rgba(15, 185, 253, 0.08) 50%,
    transparent
  );
}

.markdown-content ul li::before {
  content: '★';
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #0FB9FD;
  font-size: 1rem;
  background: linear-gradient(45deg, #0FB9FD, #4DCFFF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.5);
  animation: pulse 2s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

@keyframes pulse {
  0% { transform: translateY(-50%) scale(1); }
  50% { transform: translateY(-50%) scale(1.2); }
  100% { transform: translateY(-50%) scale(1); }
}

.markdown-content ul li ul {
  margin: 1rem 0 0.5rem 0;
}

.markdown-content ul li ul li {
  background: linear-gradient(90deg, 
    rgba(0, 183, 255, 0.137),
    rgba(15, 185, 253, 0.05) 50%,
    transparent
  );
  padding-left: 3.5rem;
}

.markdown-content ul li ul li::before {
  content: '•';
  left: 1.5rem;
  font-size: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  background: linear-gradient(45deg, #0FB9FD, #4DCFFF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
}

/* New Ordered List Styling */
.markdown-content ol {
  padding-left: 0;
  margin: 2rem 0;
  list-style: none;
  counter-reset: cosmic-counter;
}

.markdown-content ol > li {
  position: relative;
  padding: 1rem 1rem 1rem 4rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, 
    rgba(97, 55, 0, 0.315),
    rgba(255, 145, 0, 0.144) 50%,
    transparent
  );
  border-radius: 8px;
  counter-increment: cosmic-counter;
  transition: all 0.3s ease;
}

.markdown-content ol > li:hover {
  transform: translateX(10px);
  background: linear-gradient(90deg, 
    rgba(255, 145, 0, 0.15),
    rgba(255, 145, 0, 0.08) 50%,
    transparent
  );
}

.markdown-content ol > li::before {
  content: counter(cosmic-counter);
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF9100, #FFB800);
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 0 15px rgba(255, 145, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Fix for nested ordered lists */
.markdown-content ol ol {
  margin: 1rem 0 0.5rem 0;
  counter-reset: cosmic-nested-counter;
}

.markdown-content ol ol li {
  counter-increment: cosmic-nested-counter;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.1),
    rgba(15, 185, 253, 0.05) 50%,
    transparent
  );
  padding-left: 3.5rem;
}

.markdown-content ol ol li::before {
  content: counter(cosmic-nested-counter);
  background: linear-gradient(135deg, #0FB9FD, #4DCFFF);
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.9rem;
  left: 1rem;
  color: white;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Fix for nested unordered lists within ordered lists */
.markdown-content ol li ul {
  margin: 1rem 0 0.5rem 0;
}

.markdown-content ol li ul li {
  counter-increment: none;
  background: linear-gradient(90deg, 
    rgba(253, 178, 15, 0.288),
    rgba(15, 185, 253, 0.05) 50%,
    transparent
  );
  padding-left: 3.5rem;
}

.markdown-content ol li ul li::before {
  content: '•';
  left: 1.5rem;
  font-size: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  background: linear-gradient(45deg, #0FB9FD, #4DCFFF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
}

/* Blockquotes with gradient border */
.markdown-content blockquote {
  border-left: 4px solid;
  border-image: linear-gradient(to bottom, #0FB9FD, #4DCFFF) 1;
  padding: 0.5rem 0 0.5rem 1.5rem;
  margin: 2rem 0;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0.08), 
    rgba(0, 0, 0, 0) 80%);
  border-radius: 0 8px 8px 0;
}

.markdown-content blockquote p {
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  font-size: 1.1rem;
  position: relative;
}

.markdown-content blockquote p::before {
  content: '"';
  position: absolute;
  left: -0.75rem;
  top: -0.5rem;
  font-size: 2rem;
  color: rgba(15, 185, 253, 0.4);
  font-family: Georgia, serif;
}

/* Code blocks with vibrant syntax highlighting */
.markdown-content pre {
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(10, 17, 25, 0.9), rgba(20, 30, 45, 0.9)) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 
              inset 0 0 0 1px rgba(15, 185, 253, 0.2) !important;
  padding: 1.5rem !important;
  margin: 2rem 0 !important;
  overflow-x: auto !important;
  position: relative;
  backdrop-filter: blur(10px);
}

.markdown-content pre code {
  font-family: 'Fira Code', monospace !important;
  font-size: 0.9rem !important;
  line-height: 1.5 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
}

/* Inline code */
.markdown-content p code, 
.markdown-content li code {
  background: rgba(15, 185, 253, 0.1);
  color: #0FB9FD;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  white-space: nowrap;
  border: 1px solid rgba(15, 185, 253, 0.2);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Tables with modern styling */
.markdown-content table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: rgba(20, 30, 45, 0.4);
}

.markdown-content th {
  background: linear-gradient(90deg, #0A8BC0, #0FB9FD);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  padding: 1rem;
  text-align: left;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.markdown-content td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.markdown-content tr:last-child td {
  border-bottom: none;
}

.markdown-content tr:nth-child(even) {
  background: rgba(15, 185, 253, 0.05);
}

.markdown-content td:first-child {
  font-weight: 500;
  color: #0FB9FD;
}

/* Animation for content entry */
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}

.markdown-content > * {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Horizontal rule with gradient */
.markdown-content hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(0, 0, 0, 0), 
    rgba(15, 185, 253, 0.7), 
    rgba(0, 0, 0, 0));
  margin: 3rem 0;
  border-radius: 100%;
}

/* Special call-out boxes */
.info-container, .warning-container {
  background: rgba(20, 30, 45, 0.2) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px !important;
  padding: 1.5rem !important;
  margin: 2rem 0 !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid !important;
  position: relative;
  overflow: hidden;
}

.info-container {
  border-color: rgba(15, 185, 253, 0.3) !important;
}

.info-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #0FB9FD, #4DCFFF);
  border-radius: 3px 0 0 3px;
}

.warning-container {
  border-color: rgba(255, 145, 0, 0.3) !important;
}

.warning-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #FF9100, #FFB800);
  border-radius: 3px 0 0 3px;
}

.info-title, .warning-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  margin-bottom: 1rem !important;
  display: flex;
  align-items: center;
}

.info-title::before, .warning-title::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 12px;
  background-size: contain;
  background-repeat: no-repeat;
}

.info-title {
  color: #0FB9FD !important;
}

.info-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230FB9FD'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
}

.warning-title {
  color: #FF9100 !important;
}

.warning-title::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF9100'%3E%3Cpath d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/%3E%3C/svg%3E");
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .markdown-content {
    font-size: 1rem;
  }
  
  .markdown-content h1.cosmic-heading {
    font-size: 2.25rem !important;
  }
  
  .markdown-content h2.cosmic-heading {
    font-size: 1.8rem !important;
  }
  
  .markdown-content h3.cosmic-heading {
    font-size: 1.4rem !important;
  }
  
  .markdown-content h4.cosmic-heading {
    font-size: 1.15rem !important;
  }
  
  .markdown-content blockquote {
    padding-left: 1rem;
  }
  
  .info-container, .warning-container {
    padding: 1.25rem !important;
    margin: 1.5rem 0 !important;
  }
  
  .markdown-content table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .markdown-content td, .markdown-content th {
    padding: 0.6rem 0.8rem;
  }
  
  /* Improved touch targets for mobile */
  .markdown-content a:not(.header-anchor) {
    padding: 0.2em 0.3em;
    margin: -0.2em -0.3em;
  }
  
  .markdown-content ul li, 
  .markdown-content ol li {
    margin-bottom: 1rem;
  }
}

/* Enhanced image styling */
.markdown-image {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15), 
              0 0 0 1px rgba(15, 185, 253, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-origin: center;
}

.markdown-image:hover {
  transform: scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 
              0 0 0 1px rgba(15, 185, 253, 0.2),
              0 0 20px rgba(15, 185, 253, 0.15);
}

/* Update Mermaid diagram styling */
.mermaid svg {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  background: rgba(25, 34, 46, 0.4);
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.mermaid .node rect,
.mermaid .node circle,
.mermaid .node ellipse,
.mermaid .node polygon,
.mermaid .node path {
  fill: rgba(25, 34, 46, 0.8) !important;
  stroke: #0FB9FD !important;
  stroke-width: 2px !important;
}

.mermaid .edgePath .path {
  stroke: rgba(15, 185, 253, 0.7) !important;
  stroke-width: 2px !important;
}

.mermaid .arrowheadPath {
  fill: #0FB9FD !important;
  stroke: none !important;
}

/* Cosmic Info Container */
.cosmic-info-container {
  background: linear-gradient(145deg, 
    rgba(15, 185, 253, 0.08) 0%,
    rgba(15, 185, 253, 0.05) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 0 15px rgba(15, 185, 253, 0.1);
  backdrop-filter: blur(10px);
  isolation: isolate;
}

/* Cosmic Background Effects */
.cosmic-info-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(
      circle at 20% 30%,
      rgba(15, 185, 253, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 145, 0, 0.08) 0%,
      transparent 50%
    );
  z-index: -2;
  opacity: 0.5;
  animation: nebulaPulse 8s infinite alternate ease-in-out;
}

.cosmic-info-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #0FB9FD, #4DCFFF);
  border-radius: 2px 0 0 2px;
  box-shadow: 0 0 15px rgba(15, 185, 253, 0.3);
  z-index: 1;
}

/* Nebula Particles */
.cosmic-info-container .nebula-particles {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  opacity: 0.4;
}

.cosmic-info-container .nebula-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(15, 185, 253, 0.8);
  opacity: 0;
  animation: particleFade 3s infinite ease-in-out;
}

.cosmic-info-container .nebula-particle:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.cosmic-info-container .nebula-particle:nth-child(2) { top: 60%; left: 20%; animation-delay: 0.5s; }
.cosmic-info-container .nebula-particle:nth-child(3) { top: 30%; left: 80%; animation-delay: 1s; }
.cosmic-info-container .nebula-particle:nth-child(4) { top: 70%; left: 90%; animation-delay: 1.5s; }
.cosmic-info-container .nebula-particle:nth-child(5) { top: 40%; left: 40%; animation-delay: 2s; }

/* Energy Flow Effect */
.cosmic-info-container .energy-flow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(15, 185, 253, 0.05),
    transparent
  );
  transform: translateX(-100%);
  animation: energyFlow 8s infinite ease-in-out;
  z-index: -1;
}

/* Title Enhancement */
.cosmic-info-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cosmic-blue);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-shadow: 0 0 10px rgba(15, 185, 253, 0.3);
  position: relative;
  z-index: 2;
}

.cosmic-info-title::before {
  content: 'ℹ️';
  font-size: 1.2rem;
  background: rgba(15, 185, 253, 0.1);
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: 
    0 0 10px rgba(15, 185, 253, 0.2),
    0 0 20px rgba(15, 185, 253, 0.1);
  animation: iconPulse 4s infinite alternate ease-in-out;
}

/* Content Styling */
.cosmic-info-container p,
.cosmic-info-container ul,
.cosmic-info-container li {
  position: relative;
  z-index: 2;
}

/* Animation Keyframes */
@keyframes nebulaPulse {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

@keyframes particleFade {
  0% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-10px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(1);
  }
}

@keyframes energyFlow {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  50% {
    transform: translateX(100%) skewX(-15deg);
  }
  100% {
    transform: translateX(-100%) skewX(-15deg);
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(15, 185, 253, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(15, 185, 253, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(15, 185, 253, 0.2);
  }
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .cosmic-info-container {
    padding: 1.25rem;
    margin: 1.5rem 0;
  }
  
  .cosmic-info-title {
    font-size: 1rem;
  }
  
  .cosmic-info-title::before {
    font-size: 1rem;
    padding: 0.4rem;
  }
  
  /* Mobile list styling improvements */
  .markdown-content ul li {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  }
  
  .markdown-content ul li::before {
    left: 0.75rem;
    font-size: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .markdown-content ul li ul {
    margin: 0.75rem 0 0.25rem 0;
  }
  
  .markdown-content ul li ul li {
    padding-left: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, 
      rgba(15, 185, 253, 0.1),
      rgba(15, 185, 253, 0.05) 50%,
      transparent
    );
  }
  
  .markdown-content ul li ul li::before {
    left: 1rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.2rem;
    height: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    background: linear-gradient(45deg, #0FB9FD, #4DCFFF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
  }
  
  /* Mobile ordered list styling */
  .markdown-content ol > li {
    padding: 0.75rem 0.75rem 0.75rem 3rem;
  }
  
  .markdown-content ol > li::before {
    left: 0.75rem;
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.9rem;
    background: linear-gradient(135deg, #FF9100, #FFB800);
  }
  
  .markdown-content ol ol li {
    padding-left: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, 
      rgba(15, 185, 253, 0.1),
      rgba(15, 185, 253, 0.05) 50%,
      transparent
    );
  }
  
  .markdown-content ol ol li::before {
    left: 0.75rem;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.8rem;
    background: linear-gradient(135deg, #0FB9FD, #4DCFFF);
  }
  
  .markdown-content ol li ul li {
    padding-left: 2.5rem;
    background: linear-gradient(90deg, 
      rgba(15, 185, 253, 0.1),
      rgba(15, 185, 253, 0.05) 50%,
      transparent
    );
  }
  
  .markdown-content ol li ul li::before {
    left: 1rem;
    background: linear-gradient(45deg, #0FB9FD, #4DCFFF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
  }
  
  /* Improve nested list readability on small screens */
  .markdown-content ul li ul li ul li,
  .markdown-content ol li ol li ol li,
  .markdown-content ol li ul li ul li,
  .markdown-content ul li ol li ul li {
    padding-left: 2.25rem;
    background: linear-gradient(90deg, 
      rgba(15, 185, 253, 0.08),
      rgba(15, 185, 253, 0.04) 50%,
      transparent
    );
  }
  
  .markdown-content ul li ul li ul li::before,
  .markdown-content ol li ul li ul li::before {
    left: 0.75rem;
    background: linear-gradient(45deg, #0FB9FD, #4DCFFF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 8px rgba(15, 185, 253, 0.5);
  }
  
  /* Fix animation for mobile */
  @keyframes pulse {
    0% { transform: translateY(-50%) scale(1); }
    50% { transform: translateY(-50%) scale(1.2); }
    100% { transform: translateY(-50%) scale(1); }
  }
}

@media (max-width: 480px) {
  /* Even smaller screens */
  .markdown-content ul li,
  .markdown-content ol > li {
    padding-right: 0.5rem;
  }
  
  .markdown-content ul li ul li,
  .markdown-content ol ol li,
  .markdown-content ol li ul li {
    padding-left: 2.25rem;
  }
  
  .markdown-content ul li::before {
    transform: translateY(-50%) scale(0.9);
  }
  
  .markdown-content ul li ul li::before {
    left: 0.75rem;
  }
  
  .markdown-content ol > li::before {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .markdown-content ol ol li::before {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* Keep existing styles at the bottom */
</style>