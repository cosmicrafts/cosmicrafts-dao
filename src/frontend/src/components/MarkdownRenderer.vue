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
      headingIndex: 1
    };
  },
  mounted() {
    this.loadMarkdown(this.$i18n.locale);

    // Load Mermaid from CDN
    const mermaidScript = document.createElement('script');
    mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js';
    mermaidScript.onload = () => {
      window.mermaid.initialize({ 
        startOnLoad: false,
        theme: 'base',
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
          // Pie chart specific
          pie1: '#0FB9FD',
          pie2: '#00E5A4',
          pie3: '#FF9100',
          pie4: '#FFB800',
          pie5: '#4DCFFF',
          pie6: '#00B380',
          pie7: '#CC7400',
          pie8: '#CC9400',
          pieStrokeWidth: '2px',
          pieStrokeColor: '#0FB9FD',
          pieSectionTextColor: '#ffffff',
          pieTitleTextColor: '#ffffff',
          pieLegendTextColor: '#ffffff',
          pieSectionTextSize: '14px',
          pieTitleTextSize: '20px',
          pieLegendTextSize: '14px',
          pieOuterStrokeWidth: '2px',
          pieOuterStrokeColor: '#0FB9FD',
          pieOpacity: '0.9'
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 50,
          padding: 15
        }
      });
      this.renderMermaidDiagrams();
    };
    document.head.appendChild(mermaidScript);

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
          return params.trim().match(/^info\s+(.*)$/);
        },
        render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
            const m = tokens[idx].info.trim().match(/^info\s+(.*)$/);
            return `<div class="info-container">${m[1] ? `<div class="info-title">${md.utils.escapeHtml(m[1])}</div>` : ''}\n`;
          } else {
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
      this.$nextTick(() => {
        // Clear any existing diagrams first
        const mermaidDivs = document.querySelectorAll('.mermaid');
        if (mermaidDivs.length > 0 && window.mermaid) {
          try {
            // For Mermaid 11.4.1, we need to use run() instead of init()
            window.mermaid.run({
              querySelector: '.mermaid',
              nodes: Array.from(mermaidDivs)
            }).catch(error => {
              console.error('Error rendering mermaid diagrams:', error);
            });
          } catch (error) {
            console.error('Error initializing mermaid diagrams:', error);
          }
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
/* Base styles for markdown content */
.markdown-content {
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* Error message styles */
.error-message {
  background-color: var(--color-surface-primary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  margin: 1.5rem 0;
  border-left: 4px solid var(--color-error);
  color: var(--color-error);
  font-weight: var(--weight-medium);
  text-align: center;
}

/* Table of Contents styles */
.toc-container {
  background-color: var(--color-surface-primary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-left: 4px solid var(--color-primary);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.toc-link {
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
  padding: 0.25rem 0;
}

.toc-link:hover {
  color: var(--color-primary);
}

/* Legal document containers */
.info-container, .warning-container {
  background-color: var(--color-surface-primary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  margin: 1.5rem 0;
  border-left: 4px solid;
}

.info-container {
  border-color: var(--color-info);
  background: linear-gradient(to right, rgba(15, 185, 253, 0.08), rgba(15, 185, 253, 0.03));
}

.warning-container {
  border-color: var(--color-warning);
  background: linear-gradient(to right, rgba(255, 145, 0, 0.08), rgba(255, 145, 0, 0.03));
}

.info-title, .warning-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.info-title {
  color: var(--color-info);
}

.warning-title {
  color: var(--color-warning);
}

/* Override any default heading styles with high specificity */
.markdown-content h1.cosmic-heading,
.markdown-content h2.cosmic-heading,
.markdown-content h3.cosmic-heading,
.markdown-content h4.cosmic-heading {
  font-family: 'Montserrat', sans-serif !important;
  width: 100% !important;
  display: block !important;
  margin: 1rem 0 !important;
  position: relative !important;
  color: var(--color-title-primary) !important;
}

.markdown-content h1.cosmic-heading {
  font-size: 3rem !important;
  font-weight: var(--weight-black) !important;
  margin-bottom: 2rem !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
  color: var(--color-primary) !important;
}

.markdown-content h2.cosmic-heading {
  font-size: 2.25rem !important;
  font-weight: var(--weight-extra-bold) !important;
  margin-top: 2.5rem !important;
  margin-bottom: 1.5rem !important;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  color: var(--color-primary-light) !important;
}

.markdown-content h3.cosmic-heading {
  font-size: 1.75rem !important;
  font-weight: var(--weight-black) !important;
  margin-top: 2rem !important;
  margin-bottom: 1.25rem !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
  color: var(--color-text-primary) !important;
}

.markdown-content h4.cosmic-heading {
  font-size: 1.35rem !important;
  font-weight: var(--weight-bold) !important;
  margin-top: 1.75rem !important;
  margin-bottom: 1rem !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  color: var(--color-text-secondary) !important;
}

/* Header anchor styles */
.header-anchor {
  color: var(--color-primary);
  text-decoration: none;
  opacity: 0;
  margin-left: -1.5rem;
  padding-right: 0.5rem;
  transition: opacity 0.2s ease;
}

.cosmic-heading:hover .header-anchor {
  opacity: 1;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .toc-container {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-container, .warning-container {
    padding: 1rem;
    margin: 1rem 0;
  }

  .info-title, .warning-title {
    font-size: 1rem;
  }

  .markdown-content h1.cosmic-heading {
    font-size: 2.5rem !important;
  }

  .markdown-content h2.cosmic-heading {
    font-size: 2rem !important;
  }

  .markdown-content h3.cosmic-heading {
    font-size: 1.5rem !important;
  }

  .markdown-content h4.cosmic-heading {
    font-size: 1.25rem !important;
  }
}
</style>
