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
        console.log(`Loading markdown: ${lang}/${this.fileName}`);
        const content = await import(`@/assets/markdown/${lang}/${this.fileName}.md?raw`);
        
        // Always load the English version for heading mapping
        let englishContent = null;
        let englishHeadings = {};
        
        try {
          // Always load English as the canonical source for heading IDs
          if (lang !== 'en') {
            console.log(`Loading English version for canonical heading IDs`);
            englishContent = await import(`@/assets/markdown/en/${this.fileName}.md?raw`);
            
            // Extract English headings with their positions
            const enHeadingRegex = /^(#{1,4})\s+(.*?)$/gm;
            let match;
            let h2Index = 0;
            
            // Create mapping of positions to English headings
            while ((match = enHeadingRegex.exec(englishContent.default)) !== null) {
              const level = match[1].length; // Get heading level by number of # characters
              const headingText = match[2].trim();
              
              if (level === 2) { // Only map h2 headings
                // Create clean slug as the canonical ID
                const cleanSlug = this.createCleanSlug(headingText);
                
                // Store by position for mapping with non-English content
                englishHeadings[h2Index] = {
                  text: headingText,
                  slug: cleanSlug
                };
                h2Index++;
              }
            }
            
            console.log("English heading mapping:", englishHeadings);
          }
        } catch (enError) {
          console.warn(`Couldn't load English file for heading mapping: ${enError.message}`);
        }
        
        // Process the current language's markdown content
        let processedContent = content.default;
        let h2Index = 0;
        
        // Process h1 headings (title)
        processedContent = processedContent.replace(/^#\s+(.*?)$/gm, (match, text) => {
          return `# <span class="heading-text" data-heading-id="title">${text.trim()}</span>`;
        });
        
        // Process h2 headings with English-based IDs
        processedContent = processedContent.replace(/^##\s+(.*?)$/gm, (match, text) => {
          const localHeadingText = text.trim();
          let headingId;
          
          // Use English heading ID if available
          if (lang !== 'en' && englishHeadings[h2Index]) {
            // Use the English slug as the canonical ID
            headingId = englishHeadings[h2Index].slug;
            
            // Add data attributes for debugging
            const originalEnglish = englishHeadings[h2Index].text;
            console.log(`Mapped heading: "${localHeadingText}" → "${originalEnglish}" → ID: "${headingId}"`);
          } else {
            // For English or fallback
            headingId = this.createCleanSlug(localHeadingText);
            console.log(`Created heading ID for: "${localHeadingText}" → "${headingId}"`);
          }
          
          h2Index++;
          return `## <span class="heading-text" data-heading-id="${headingId}" data-heading-index="${h2Index-1}">${localHeadingText}</span>`;
        });
        
        // Process h3 and h4 headings
        processedContent = processedContent.replace(/^###\s+(.*?)$/gm, (match, text) => {
          const headingText = text.trim();
          // Use simple slug for h3-h4, since they're less likely to be directly linked
          const headingId = this.createCleanSlug(headingText);
          return `### <span class="heading-text" data-heading-id="${headingId}">${headingText}</span>`;
        });
        
        processedContent = processedContent.replace(/^####\s+(.*?)$/gm, (match, text) => {
          const headingText = text.trim();
          const headingId = this.createCleanSlug(headingText);
          return `#### <span class="heading-text" data-heading-id="${headingId}">${headingText}</span>`;
        });
        
        this.processMarkdown(processedContent);
      } catch (error) {
        console.error(`Failed to load markdown for ${lang}/${this.fileName}`, error);
        
        // Fallback to English
        if (lang !== 'en') {
          try {
            console.log(`Falling back to English for ${this.fileName}`);
            const fallbackContent = await import(`@/assets/markdown/en/${this.fileName}.md?raw`);
            
            // Process the English content
            let processedContent = fallbackContent.default;
            
            // Handle h1 headings
            processedContent = processedContent.replace(/^#\s+(.*?)$/gm, (match, text) => {
              const headingText = text.trim();
              return `# <span class="heading-text" data-heading-id="title">${headingText}</span>`;
            });
            
            // Handle h2 headings
            processedContent = processedContent.replace(/^##\s+(.*?)$/gm, (match, text) => {
              const headingText = text.trim();
              const headingId = this.createCleanSlug(headingText);
              return `## <span class="heading-text" data-heading-id="${headingId}">${headingText}</span>`;
            });
            
            // Handle h3 and h4 headings
            processedContent = processedContent.replace(/^###\s+(.*?)$/gm, (match, text) => {
              const headingText = text.trim();
              const headingId = this.createCleanSlug(headingText);
              return `### <span class="heading-text" data-heading-id="${headingId}">${headingText}</span>`;
            });
            
            processedContent = processedContent.replace(/^####\s+(.*?)$/gm, (match, text) => {
              const headingText = text.trim();
              const headingId = this.createCleanSlug(headingText);
              return `#### <span class="heading-text" data-heading-id="${headingId}">${headingText}</span>`;
            });
            
            this.processMarkdown(processedContent);
          } catch (fallbackError) {
            console.error(`Failed to load English fallback for ${this.fileName}`, fallbackError);
            this.htmlContent = `<div class="error-container">
              <h2>Content Not Available</h2>
              <p>The requested content is not available in this language.</p>
              <p>Requested file: ${this.fileName}.md</p>
            </div>`;
          }
        } else {
          console.error(`Content not available for ${this.fileName} in any language`);
          this.htmlContent = `<div class="error-container">
            <h2>Content Not Available</h2>
            <p>The requested content could not be found.</p>
            <p>Requested file: ${this.fileName}.md</p>
          </div>`;
        }
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
      
      // Custom image renderer to correctly resolve paths for WebP and SVG images
      const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const srcIndex = token.attrIndex("src");
        
        if (srcIndex >= 0) {
          const src = token.attrs[srcIndex][1];
          
          // Check if it's an absolute URL or relative
          if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            // External URL - keep as is
            return defaultImageRender(tokens, idx, options, env, self);
          }
          
          // Handle different image types
          try {
            if (src.endsWith('.svg')) {
              // SVG images usually reside in icons folder
              token.attrs[srcIndex][1] = new URL(`../assets/icons/${src}`, import.meta.url).href;
            } else {
              // Default to webp folder for other images
              token.attrs[srcIndex][1] = new URL(`../assets/webp/${src}`, import.meta.url).href;
            }
          } catch (e) {
            console.error(`Error resolving image path for ${src}:`, e);
            // Keep original source if there's an error
          }
        }
        
        return defaultImageRender(tokens, idx, options, env, self);
      };
      
      // Add anchor links to headings with stable IDs
      md.use(markdownItAnchor, {
        slugify: (s) => {
          // Extract the heading ID from the data attribute
          const match = s.match(/data-heading-id="([^"]+)"/);
          if (match) {
            console.log(`Found data-heading-id: ${match[1]}`);
            return match[1];
          }
          
          // If no data-heading-id, create a text-based ID
          const textContent = s.replace(/<[^>]*>/g, '').trim();
          console.log(`Creating text-based ID for: "${textContent}"`);
          return this.slugify(textContent);
        },
        permalink: markdownItAnchor.permalink.headerLink({
          class: 'header-anchor',
          safariReaderFix: true
        })
      });
      
      // Add classes to headings and ensure consistent IDs
      const defaultHeadingOpen = md.renderer.rules.heading_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };
      
      md.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
        const token = tokens[idx];
        token.attrJoin('class', 'cosmic-heading');
        
        // Ensure consistency in section IDs across languages
        if (token.tag === 'h2') {
          // Look ahead to check for data-heading-id
          const nextToken = tokens[idx + 1];
          const contentHtml = nextToken?.content || '';
          const idMatch = contentHtml.match(/data-heading-id="([^"]+)"/);
          
          if (idMatch) {
            // Use the extracted ID from the data-heading-id attribute
            console.log(`Setting explicit ID for h2: ${idMatch[1]}`);
            token.attrSet('id', idMatch[1]);
          }
        }
        
        return defaultHeadingOpen(tokens, idx, options, env, self);
      };
      
      // Custom containers, syntax highlighting, etc.
      md.use(markdownItContainer, 'info');
      md.use(markdownItContainer, 'warning');
      md.use(markdownItHighlightjs);
      
      // Render the markdown
      this.htmlContent = md.render(processedContent);
      
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
/* Styles for enhanced markdown features */
.toc-container {
  background-color: var(--color-surface-primary);
  border-radius: var(--radius-medium);
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-left: 2px solid var(--color-primary);
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: all 0.2s ease;
}

.toc-header:hover {
  background-color: rgba(0, 195, 255, 0.05);
}

.toc-title {
  margin: 0;
  font-size: 1rem;
  color: var(--color-primary);
  font-weight: 600;
}

.toc-toggle-icon {
  display: inline-block;
  transition: transform 0.2s ease;
  color: var(--color-primary);
  font-size: 0.8rem;
}

.toc-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.toc-content.toc-expanded {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.5rem;
}

.toc-container ul {
  list-style-type: none;
  padding-left: 0.75rem;
  margin: 0;
}

.toc-container li {
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  line-height: 1.3;
}

.toc-container a {
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-small);
}

.toc-container a:hover {
  color: var(--color-primary);
  background-color: rgba(0, 195, 255, 0.05);
}

/* Updated header anchor styles for the new permalink approach */
.header-anchor {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.header-anchor:hover {
  text-decoration: underline;
}

h1 .header-anchor,
h2 .header-anchor,
h3 .header-anchor {
  opacity: 0.7;
}

h1 .header-anchor:hover,
h2 .header-anchor:hover,
h3 .header-anchor:hover {
  opacity: 1;
}

/* Base styles for markdown content */
.markdown-content {
  line-height: 1.6;
  color: var(--color-text-secondary);
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

.markdown-content h1.cosmic-heading:hover,
.markdown-content h2.cosmic-heading:hover,
.markdown-content h3.cosmic-heading:hover,
.markdown-content h4.cosmic-heading:hover {
  text-shadow: 0 0 15px var(--color-primary-alpha-30) !important;
}

.info-container, .warning-container {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: var(--radius-medium);
}

.info-container {
  background-color: rgba(0, 123, 255, 0.1);
  border-left: 4px solid var(--color-info);
}

.warning-container {
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 4px solid var(--color-warning);
}

.info-title, .warning-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.info-title {
  color: var(--color-info);
}

.warning-title {
  color: var(--color-warning);
}

/* Task list styles */
.task-list-item {
  list-style-type: none;
  margin-left: -1.5rem;
}

.task-list-item-checkbox {
  margin-right: 0.5rem;
}

/* Mermaid diagram styles */
.mermaid {
  background-color: transparent;
  border-radius: 0;
  padding: 1.5rem 0;
  margin: 1.5rem auto;
  box-shadow: none;
  border-left: none;
  overflow: visible;
  text-align: center;
  width: 65%;
}

/* Remove pre default styling */
pre.mermaid {
  white-space: pre-wrap;
  font-family: inherit;
  background: transparent;
}

/* Enhance mermaid diagram text */
.mermaid text {
  font-family: 'Montserrat', sans-serif !important;
  font-weight: 500 !important;
  fill: #ffffff !important;
}

/* Style for pie charts */
.mermaid .pieCircle {
  stroke: transparent !important;
  stroke-width: 2px !important;
}

/* Remove any background from SVG */
.mermaid svg {
  background: transparent !important;
  max-width: 100%;
  height: auto !important;
}

/* Mobile optimizations for mermaid diagrams */
@media (max-width: 768px) {
  .mermaid {
    width: 100%;
    padding: 1rem 0;
    margin: 1rem auto;
  }
}

/* Mobile navigation styles */
.mobile-nav {
  display: none;
}

.mobile-nav h2 {
  display: none;
}

.mobile-nav ul {
  display: none;
}

.mobile-nav li {
  display: none;
}

.mobile-nav a {
  display: none;
}

.mobile-nav a:hover {
  display: none;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: none;
  }
}

/* Mobile optimizations for info and warning boxes */
@media (max-width: 768px) {
  .info-container, .warning-container {
    padding: 0.75rem;
    margin: 0.75rem 0;
    font-size: 0.9rem;
  }
  
  .info-title, .warning-title {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }
  
  .toc-container {
    padding: 0.6rem;
    margin-bottom: 1.25rem;
    font-size: 0.85rem;
  }
  
  .toc-title {
    font-size: 0.95rem;
  }
  
  .toc-container ul {
    padding-left: 0.5rem;
  }
  
  .toc-container li {
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
  }
  
  .toc-content.toc-expanded {
    max-height: 300px;
  }
  
  .toc-container a {
    padding: 0.15rem 0.3rem;
  }
  
  /* Make mermaid diagrams scrollable on mobile */
  .mermaid {
    overflow-x: auto;
    padding: 1rem;
    margin: 1rem 0;
  }
}

.markdown-content table {
  width: 100%;
  min-width: 650px; /* Ensures table won't shrink below readable size */
  border-collapse: collapse;
  margin: 0; /* Reset margin as it's handled by table-scroll */
  background: var(--color-surface-primary);
  border-radius: var(--radius-medium);
  overflow: hidden;
  font-size: 1rem;
}

.markdown-content th,
.markdown-content td {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(15, 185, 253, 0.1);
}

.markdown-content th {
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-text-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .markdown-content table {
    font-size: 0.85rem;
  }
  
  .markdown-content th,
  .markdown-content td {
    padding: 0.5rem 0.75rem;
  }
}
</style>
