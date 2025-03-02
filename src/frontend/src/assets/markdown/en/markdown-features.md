# Markdown Features Guide

This guide demonstrates all the enhanced Markdown features available in the Cosmicrafts whitepaper.

## Table of Contents

[[toc]]

## Basic Markdown

### Text Formatting

You can use **bold text**, *italic text*, or ***bold and italic text***.

You can also use ~~strikethrough~~ for deleted text.

### Links

[External link to Cosmicrafts](https://cosmicrafts.io)

[Internal link to Introduction](#introduction)

### Lists

Unordered list:
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

Ordered list:
1. First item
2. Second item
3. Third item

### Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

### Code

Inline code: `const greeting = "Hello, world!";`

Code block with syntax highlighting:

```javascript
function calculateRewards(stakeAmount, duration) {
  const baseRate = 0.05; // 5% base APY
  const bonusRate = duration > 365 ? 0.02 : 0; // 2% bonus for staking > 1 year
  
  return stakeAmount * (baseRate + bonusRate);
}
```

## Enhanced Features

### Task Lists

- [x] Implement basic Markdown
- [x] Add syntax highlighting
- [x] Add emoji support
- [ ] Complete documentation

### Emojis

You can use emoji shortcodes like :rocket:, :star:, and :smile:.

Common emojis for our documentation:
- :warning: for warnings
- :information_source: for information
- :bulb: for tips
- :chart_with_upwards_trend: for growth metrics

### Custom Containers

:::info Information Box
This is an information box with important details.
:::

:::warning Warning Box
This is a warning box to highlight potential issues.
:::

### Tables

| Feature | Description | Status |
|---------|-------------|--------|
| Governance | Community-driven decision making | Live |
| Staking | Lock tokens for rewards | Coming Soon |
| Treasury | Community-managed funds | Live |

### Anchors and Permalinks

Hover over any heading to see the permalink symbol (§) which allows direct linking to that section.

## Advanced Usage

### Mathematical Expressions

When combined with KaTeX or MathJax (not included by default), you can render mathematical expressions:

```
E = mc^2
```

### Diagrams

When combined with Mermaid.js (not included by default), you can create diagrams:

```
graph TD
    A[User] -->|Stakes Tokens| B[Staking Contract]
    B -->|Generates| C[Rewards]
    C -->|Distributed to| A
```

## Best Practices

1. Use headings hierarchically (H1 > H2 > H3)
2. Include a table of contents for longer documents
3. Use code highlighting for all code blocks
4. Add descriptive alt text to images
5. Use custom containers to highlight important information

---

This guide covers the main features available in our enhanced Markdown system. For more information, refer to the [Markdown Guide](https://www.markdownguide.org/). 