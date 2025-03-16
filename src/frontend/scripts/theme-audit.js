/**
 * Theme Audit Script
 * 
 * This script scans Vue components for hardcoded styles that should be replaced
 * with variables from the cosmic-theme system.
 * 
 * Usage:
 * node theme-audit.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors to search for (add more as needed)
const colorPatterns = [
  // Hardcoded hex colors
  /(?:color|background|border|box-shadow):\s*#[0-9a-f]{3,6}/gi,
  
  // RGBA colors
  /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0?\.\d+\s*\)/gi,
  
  // RGB colors
  /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
];

// Style properties that should use theme variables
const stylePatterns = [
  // Hardcoded values that should use variables
  /border-radius:\s*\d+px/gi,
  /padding:\s*\d+(\.\d+)?rem/gi,
  /margin:\s*\d+(\.\d+)?rem/gi,
  /font-size:\s*\d+(\.\d+)?rem/gi,
  /box-shadow:/gi,
  /transition:/gi,
  /z-index:\s*\d+/gi,
  
  // Custom gradients (should use theme variables)
  /linear-gradient/gi,
  /radial-gradient/gi,
];

// Button class patterns
const buttonPatterns = [
  // Custom button classes
  /\.button/g,
  /\.btn/g,
  /\[class\*=['"]btn-/g,
  /\[class\*=['"]button-/g,
];

// Theme-related class patterns
const themeClassPatterns = [
  // Custom theme classes that should be migrated
  /\.(primary|secondary|success|danger|warning|info)/g,
  /\.(card|panel|modal)/g,
];

console.log('🔍 Starting theme audit...');
console.log('===================================');

// Find all Vue components
const vueFiles = glob.sync('src/frontend/src/**/*.vue');

let totalIssues = 0;
let fileIssues = {};

vueFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fileHasIssues = false;
  let issueCount = 0;
  
  // Check for color patterns
  colorPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      if (!fileHasIssues) {
        console.log(`\n📁 ${file}`);
        fileHasIssues = true;
      }
      console.log(`  ⚠️  Found ${matches.length} hardcoded colors: ${pattern}`);
      matches.forEach(match => {
        console.log(`     - ${match.trim()}`);
      });
      issueCount += matches.length;
    }
  });
  
  // Check for style patterns
  stylePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      if (!fileHasIssues) {
        console.log(`\n📁 ${file}`);
        fileHasIssues = true;
      }
      console.log(`  ⚠️  Found ${matches.length} style properties that should use theme variables: ${pattern}`);
      issueCount += matches.length;
    }
  });
  
  // Check for button patterns
  buttonPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      if (!fileHasIssues) {
        console.log(`\n📁 ${file}`);
        fileHasIssues = true;
      }
      console.log(`  ⚠️  Found ${matches.length} custom button classes that should be migrated to cosmic-button`);
      issueCount += matches.length;
    }
  });
  
  // Check for theme class patterns
  themeClassPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      if (!fileHasIssues) {
        console.log(`\n📁 ${file}`);
        fileHasIssues = true;
      }
      console.log(`  ⚠️  Found ${matches.length} theme classes that should be migrated to cosmic-theme`);
      issueCount += matches.length;
    }
  });
  
  if (fileHasIssues) {
    fileIssues[file] = issueCount;
    totalIssues += issueCount;
  }
});

// Sort files by number of issues
const sortedFiles = Object.entries(fileIssues)
  .sort((a, b) => b[1] - a[1])
  .map(([file, count]) => ({ file, count }));

console.log('\n===================================');
console.log('🔍 Theme Audit Summary:');
console.log(`Found ${totalIssues} issues across ${Object.keys(fileIssues).length} files`);

if (sortedFiles.length > 0) {
  console.log('\n📊 Top files to prioritize:');
  sortedFiles.slice(0, 10).forEach(({ file, count }, index) => {
    console.log(`${index + 1}. ${file} - ${count} issues`);
  });
  
  console.log('\n🎯 Migration Strategy:');
  console.log('1. Start with high-impact, common components');
  console.log('2. Replace hardcoded colors with theme variables');
  console.log('3. Update styling to use the cosmic-theme system');
  console.log('4. Standardize button and card styles');
  console.log('5. Run this audit again to track progress');
}

console.log('\n✅ Audit complete'); 