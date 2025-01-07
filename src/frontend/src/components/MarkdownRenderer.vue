<template>
  <div class="markdown-content" v-html="htmlContent" @click="emitRendered"></div>
</template>

<script>
import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

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
        this.htmlContent = "<p>Content not available in this language.</p>";
      }
    },
    renderMarkdown(content) {
      const md = new MarkdownIt({
  html: true, // Enable HTML in Markdown
}).use(markdownItAnchor, {
  slugify: (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-"),
  level: [2, 3],
});

  // Default image renderer to resolve Vite paths
  const defaultImageRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, env, self) {
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

  // Default link renderer to handle internal and external links
  const defaultLinkRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex("href");
    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1];
      if (href.startsWith("#")) {
        // Internal link: add a class to identify
        token.attrPush(["class", "internal-link"]);
      } else {
        // External link: open in a new tab
        token.attrPush(["target", "_blank"]);
        token.attrPush(["rel", "noopener noreferrer"]);
      }
    }
    return defaultLinkRender(tokens, idx, options, env, self);
  };

  return md.render(content);
    },
    emitRendered() {
      this.$emit("rendered");
    },
  },
};
</script>

<style scoped>
</style>
