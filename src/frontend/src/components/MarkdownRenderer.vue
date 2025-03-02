<template>
  <div class="markdown-content" v-html="htmlContent" @click="emitRendered"></div>
</template>

<script>
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItContainer from "markdown-it-container";
import markdownItHighlightjs from "markdown-it-highlightjs";

export default {
  props: {
    fileName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      htmlContent: "",
    };
  },
  mounted() {
    this.loadMarkdown(this.$i18n.locale);

    // Load Mermaid from CDN
    const mermaidScript = document.createElement('script');
    mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js';
    mermaidScript.onload = () => {
      // Initialize Mermaid with custom theme
      window.mermaid.initialize({ 
        startOnLoad: false, // Important: set to false for manual initialization
        theme: 'dark',
        themeVariables: {
          primaryColor: '#00c3ff',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#00c3ff',
          lineColor: '#00c3ff',
          secondaryColor: '#ffa200',
          tertiaryColor: '#121725',
          background: '#1d2537',
          mainBkg: '#1d2537',
          secondaryBorderColor: '#ffa200',
          textColor: '#ffffff',
          nodeBorder: '#00c3ff',
          clusterBkg: '#121725',
          titleColor: '#00c3ff',
          edgeLabelBackground: '#121725',
          nodeTextColor: '#ffffff'
        },
        securityLevel: 'loose', // Allow rendering of all diagram types
        flowchart: {
          htmlLabels: true,
          curve: 'basis'
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50
        }
      });
      this.renderMermaidDiagrams(); // Ensure `this` refers to the Vue instance
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
          this.$emit("navigateToSection", sectionId); // Emit event for parent to handle
        }
      }
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
        const content = await import(`@/assets/markdown/${lang}/${this.fileName}.md?raw`);
        this.htmlContent = this.renderMarkdown(content.default);
        this.$nextTick(() => this.emitRendered());
      } catch (error) {
        console.error(`Failed to load markdown for ${lang}/${this.fileName}`, error);
        
        // Try to fall back to English if the current language file doesn't exist
        if (lang !== 'en') {
          try {
            const fallbackContent = await import(`@/assets/markdown/en/${this.fileName}.md?raw`);
            this.htmlContent = this.renderMarkdown(fallbackContent.default);
            this.$nextTick(() => this.emitRendered());
          } catch (fallbackError) {
            this.htmlContent = "<p>Content not available in this language.</p>";
          }
        } else {
          this.htmlContent = "<p>Content not available.</p>";
        }
      }
    },
    renderMarkdown(content) {
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

      // Custom link renderer for internal/external links
      const defaultLinkRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const hrefIndex = token.attrIndex("href");
        if (hrefIndex >= 0) {
          const href = token.attrs[hrefIndex][1];
          if (href.startsWith("#")) {
            token.attrPush(["class", "internal-link"]);
          } else {
            token.attrPush(["target", "_blank"]);
            token.attrPush(["rel", "noopener noreferrer"]);
          }
        }
        return defaultLinkRender(tokens, idx, options, env, self);
      };

      // Only replace TOC placeholder if it exists in the content
      const tocRegex = /\[\[toc\]\]/gi;
      if (tocRegex.test(processedContent)) {
        processedContent = processedContent.replace(tocRegex, `<div class="toc-container"><h3>Table of Contents</h3><div id="toc-placeholder-${this.fileName}"></div></div>`);
      }
      
      // Simple task list replacement
      processedContent = processedContent.replace(/- \[ \]/g, '- <input type="checkbox" disabled class="task-list-item-checkbox"> ');
      processedContent = processedContent.replace(/- \[x\]/g, '- <input type="checkbox" checked disabled class="task-list-item-checkbox"> ');

      return md.render(processedContent);
    },
    emitRendered() {
      this.$emit("rendered");
      
      // Generate TOC after rendering
      this.$nextTick(() => {
        const tocPlaceholder = document.getElementById(`toc-placeholder-${this.fileName}`);
        if (tocPlaceholder) {
          // Clear any existing content first
          tocPlaceholder.innerHTML = '';
          
          const headings = document.querySelectorAll('.markdown-content h2, .markdown-content h3');
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
              
              // Indent h3
              if (heading.tagName === 'H3') {
                item.style.marginLeft = '1rem';
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
  padding: 1rem;
  margin-bottom: 2rem;
  border-left: 3px solid var(--color-primary);
}

.toc-container ul {
  list-style-type: none;
  padding-left: 1rem;
}

.toc-container li {
  margin-bottom: 0.5rem;
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
  background-color: rgba(29, 37, 55, 0.7);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border-left: 3px solid var(--color-primary);
  overflow: auto;
  text-align: center;
}

/* Remove pre default styling */
pre.mermaid {
  white-space: pre-wrap;
  font-family: inherit;
}

/* Enhance mermaid diagram text */
.mermaid text {
  font-family: 'Montserrat', sans-serif !important;
  font-weight: 500 !important;
}

/* Style for pie charts */
.mermaid .pieCircle {
  stroke: #121725 !important;
  stroke-width: 2px !important;
}

/* Style for flowcharts */
.mermaid .node rect, 
.mermaid .node circle, 
.mermaid .node ellipse, 
.mermaid .node polygon, 
.mermaid .node path {
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5)) !important;
}

/* Style for sequence diagrams */
.mermaid .actor {
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5)) !important;
}

/* Style for gantt charts */
.mermaid .section {
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5)) !important;
}

/* Style for mermaid SVG */
.mermaid svg {
  max-width: 100%;
  height: auto !important;
}
</style>
