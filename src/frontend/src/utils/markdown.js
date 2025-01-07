import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable some smart typography replacements
});

export function renderMarkdown(content) {
  return md.render(content);
}
