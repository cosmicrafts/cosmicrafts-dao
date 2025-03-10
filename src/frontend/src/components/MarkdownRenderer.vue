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
      tocRegex: /\[\[toc(?::(\d+)-(\d+))?\]\]/i
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
        
        // Pre-process the markdown to convert headings to custom HTML elements
        const processedContent = content.default
          .replace(/^# (.*?)$/gm, '# <span id="$1" style="color: #0FB9FD;">$1</span>')
          .replace(/^## (.*?)$/gm, '## <span id="$1" style="color: #4DCFFF;">$1</span>')
          .replace(/^### (.*?)$/gm, '### <span id="$1" style="color: #7CDFFF;">$1</span>')
          .replace(/^#### (.*?)$/gm, '#### <span id="$1" style="color: #B5EBFF;">$1</span>');
        
        this.processMarkdown(processedContent);
      } catch (error) {
        console.error(`Failed to load markdown for ${lang}/${this.fileName}`, error);
        
        // Try to fall back to English if the current language file doesn't exist
        if (lang !== 'en') {
          try {
            console.log(`Falling back to English for ${this.fileName}`);
            const fallbackContent = await import(`@/assets/markdown/en/${this.fileName}.md?raw`);
            
            // Pre-process the markdown
            const processedContent = fallbackContent.default
              .replace(/^# (.*?)$/gm, '# <span id="$1" style="color: #0FB9FD;">$1</span>')
              .replace(/^## (.*?)$/gm, '## <span id="$1" style="color: #4DCFFF;">$1</span>')
              .replace(/^### (.*?)$/gm, '### <span id="$1" style="color: #7CDFFF;">$1</span>')
              .replace(/^#### (.*?)$/gm, '#### <span id="$1" style="color: #B5EBFF;">$1</span>');
            
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
        // Extract min and max levels if specified
        if (tocMatch[1] && tocMatch[2]) {
          this.tocLevels = [parseInt(tocMatch[1]), parseInt(tocMatch[2])];
        }
        
        // Replace the TOC marker with a placeholder
        content = content.replace(this.tocRegex, '<div class="toc-placeholder"></div>');
      }
      
      // Replace Mermaid code blocks with a placeholder
      const mermaidRegex = /```mermaid([\s\S]*?)```/g;
      let processedContent = content.replace(mermaidRegex, (match, diagram) => {
        // Trim whitespace and ensure the diagram has proper syntax
        const trimmedDiagram = diagram.trim();
        return `<pre class="mermaid">${trimmedDiagram}</pre>`;
      });

      // Add basic emoji support manually
      const emojiMap = {
        ':rocket:': '🚀',
        ':star:': '⭐',
        ':smile:': '😊',
        ':warning:': '⚠️',
        ':information_source:': 'ℹ️',
        ':bulb:': '💡',
        ':chart_with_upwards_trend:': '📈',
        ':thumbsup:': '👍',
        ':thumbsdown:': '👎',
        ':check:': '✅',
        ':x:': '❌',
        ':tada:': '🎉',
        ':fire:': '🔥',
        ':heart:': '❤️',
        ':zap:': '⚡',
        ':gear:': '⚙️',
        ':lock:': '🔒',
        ':unlock:': '🔓',
        ':memo:': '📝',
        ':book:': '📚',
        ':calendar:': '📅',
        ':clock:': '🕒',
        ':money:': '💰',
        ':gem:': '💎',
        ':trophy:': '🏆'
      };
      
      // Replace emoji shortcodes in the content
      Object.keys(emojiMap).forEach(shortcode => {
        const regex = new RegExp(shortcode, 'g');
        processedContent = processedContent.replace(regex, emojiMap[shortcode]);
      });

      // Initialize markdown-it with basic options
      const md = new MarkdownIt({
        html: true,
        typographer: true,
        linkify: true,
      });
      
      // Custom image renderer to resolve Vite paths
      const defaultImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const srcIndex = token.attrIndex("src");
        if (srcIndex >= 0) {
          const src = token.attrs[srcIndex][1];
          token.attrs[srcIndex][1] = new URL(`../assets/webp/${src}`, import.meta.url).href;
        }
        return defaultImageRender(tokens, idx, options, env, self);
      };

      // Override default heading renderer to add our class
      const defaultHeadingRender = md.renderer.rules.heading_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        token.attrJoin('class', 'cosmic-heading');
        return defaultHeadingRender(tokens, idx, options, env, self);
      };

      // Add anchor links to headings
      md.use(markdownItAnchor, {
        slugify: (s) => s.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
        level: [1, 2, 3],
        permalink: markdownItAnchor.permalink.headerLink({
          class: 'header-anchor',
          safariReaderFix: true
        })
      });
      
      // Add custom containers
      md.use(markdownItContainer, 'info', {
        validate: function(params) {
          return params.trim().match(/^info\s+(.*)$/);
        },
        render: function (tokens, idx) {
          const m = tokens[idx].info.trim().match(/^info\s+(.*)$/);
          if (tokens[idx].nesting === 1) {
            return `<div class="info-container"><div class="info-title">${md.utils.escapeHtml(m[1])}</div>\n`;
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
          const m = tokens[idx].info.trim().match(/^warning\s+(.*)$/);
          if (tokens[idx].nesting === 1) {
            return `<div class="warning-container"><div class="warning-title">${md.utils.escapeHtml(m[1])}</div>\n`;
          } else {
            return '</div>\n';
          }
        }
      });
      
      // Add syntax highlighting
      md.use(markdownItHighlightjs);

      // Custom link renderer for internal/external links
      const defaultLinkRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const hrefIndex = token.attrIndex("href");
        if (hrefIndex >= 0) {
          const href = token.attrs[hrefIndex][1];
          
          // Handle internal links
          if (href.startsWith("#")) {
            token.attrPush(["class", "internal-link"]);
          } 
          // Handle cross-document links in whitepaper (like /tokenomics or /tokenomics#section)
          else if (href.startsWith("/") && 
                  ["introduction", "executive-summary", "architecture", "core-features",
                   "governance", "tokenomics", "community", "sustainability"].some(section => 
                   href.startsWith(`/${section}`))) {
            
            // Convert to proper nested hash format that our component can handle
            const pathParts = href.substring(1).split("#");
            const section = pathParts[0];
            const heading = pathParts.length > 1 ? pathParts[1] : "";
            
            // Update the href attribute to use our nested hash format
            token.attrs[hrefIndex][1] = heading ? `#${section}#${heading}` : `#${section}`;
            token.attrPush(["class", "internal-link"]);
          }
          else {
            token.attrPush(["target", "_blank"]);
            token.attrPush(["rel", "noopener noreferrer"]);
          }
        }
        return defaultLinkRender(tokens, idx, options, env, self);
      };

      // Only replace TOC placeholder if it exists in the content
      const tocRegex = /\[\[toc(?::(\d+)-(\d+))?\]\]/gi;
      if (tocRegex.test(processedContent)) {
        processedContent = processedContent.replace(tocRegex, (match, minLevel, maxLevel) => {
          // Store TOC level range as data attributes for later use
          const minLevelAttr = minLevel ? `data-min-level="${minLevel}"` : '';
          const maxLevelAttr = maxLevel ? `data-max-level="${maxLevel}"` : '';
          
          return `<div class="toc-container" ${minLevelAttr} ${maxLevelAttr}>
            <div class="toc-header" onclick="this.nextElementSibling.classList.toggle('toc-expanded'); this.querySelector('.toc-toggle-icon').textContent = this.querySelector('.toc-toggle-icon').textContent === '▶' ? '▼' : '▶';">
              <h3 class="toc-title">Table of Contents</h3>
              <span class="toc-toggle-icon">▶</span>
            </div>
            <div class="toc-content" id="toc-placeholder-${this.fileName}"></div>
          </div>`;
        });
      }
      
      // Simple task list replacement
      processedContent = processedContent.replace(/- \[ \]/g, '- <input type="checkbox" disabled class="task-list-item-checkbox"> ');
      processedContent = processedContent.replace(/- \[x\]/g, '- <input type="checkbox" checked disabled class="task-list-item-checkbox"> ');

      this.htmlContent = md.render(processedContent);

      // We're keeping the actual heading elements now, so no need to replace them with spans
      // The styling is handled by CSS and the heading_open renderer
      this.$nextTick(() => this.emitRendered());
    },
    emitRendered() {
      this.$emit("rendered");
      
      // Generate TOC after rendering
      this.$nextTick(() => {
        const tocPlaceholder = document.getElementById(`toc-placeholder-${this.fileName}`);
        if (tocPlaceholder) {
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
              // Create ID if not exists
              if (!heading.id) {
                heading.id = `heading-${index}`;
              }
              
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
        }
        
        // Render Mermaid diagrams after content is fully loaded
        this.renderMermaidDiagrams();
      });
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
            
            // No need to add custom zoom controls anymore
          } catch (error) {
            console.error('Error initializing mermaid diagrams:', error);
          }
        }
      });
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

.cosmic-heading {
  color: #FFFFFF !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
  font-family: 'Montserrat', sans-serif !important;
  width: 100% !important;
  display: block !important;
  margin: 1rem 0 !important;
}

h1.cosmic-heading {
  font-size: 2.5rem !important;
  font-weight: 900 !important;
  margin-bottom: 1.5rem !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}

h2.cosmic-heading {
  font-size: 2rem !important;
  font-weight: 800 !important;
  margin-top: 2rem !important;
  margin-bottom: 1rem !important;
}

h3.cosmic-heading {
  font-size: 1.75rem !important;
  font-weight: 900 !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
}

h4.cosmic-heading {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  margin-top: 1.25rem !important;
  margin-bottom: 0.75rem !important;
}

.cosmic-heading:hover {
  color: #FFFFFF !important;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.3) !important;
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
