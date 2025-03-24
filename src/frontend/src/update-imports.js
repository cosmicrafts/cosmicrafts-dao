#!/usr/bin/env node

/**
 * This script updates import paths in Vue components after migration.
 * It reads the component-migration-plan.md file to know what files
 * have been moved and updates imports accordingly.
 * 
 * Usage:
 * node update-imports.js <directory>
 * 
 * Example:
 * node update-imports.js ./src
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path mapping from old to new 
const pathMappings = [];

// Read the migration plan file
function loadMigrationPlan() {
  try {
    const planFile = path.resolve(__dirname, 'component-migration-plan.md');
    const content = fs.readFileSync(planFile, 'utf8');
    
    // Extract mappings using regex
    const tableSections = content.split('##').slice(1); // Skip the intro
    
    for (const section of tableSections) {
      const tableLines = section.split('\n').filter(line => line.includes('|'));
      // Skip the header and separator lines
      const mappingLines = tableLines.slice(2);
      
      for (const line of mappingLines) {
        const cells = line.split('|').map(cell => cell.trim());
        if (cells.length >= 3) {
          const oldPath = cells[1].replace(/`/g, '');
          const newPath = cells[2].replace(/`/g, '');
          
          if (oldPath && newPath) {
            pathMappings.push({
              oldPath: oldPath,
              newPath: newPath
            });
          }
        }
      }
    }
    
    console.log(`Loaded ${pathMappings.length} path mappings from migration plan`);
  } catch (error) {
    console.error('Error loading migration plan:', error);
    process.exit(1);
  }
}

// Process a Vue file to update imports
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Search for imports that need updating
    for (const mapping of pathMappings) {
      const oldImportPattern = new RegExp(`(?:from|import)\\s+(['"])@/components/${mapping.oldPath}\\1`, 'g');
      const newImport = `$1@/components/${mapping.newPath}$1`;
      
      // Check if we have a match before replacing
      const hasMatch = oldImportPattern.test(content);
      if (hasMatch) {
        // Reset regex lastIndex
        oldImportPattern.lastIndex = 0;
        
        // Replace the import
        const newContent = content.replace(oldImportPattern, `from ${newImport}`);
        if (newContent !== content) {
          content = newContent;
          modified = true;
          console.log(`Updated import in ${filePath}: ${mapping.oldPath} -> ${mapping.newPath}`);
        }
      }
    }
    
    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Find all Vue files in a directory and its subdirectories
function findVueFiles(directory) {
  let vueFiles = [];
  
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        vueFiles = vueFiles.concat(findVueFiles(fullPath));
      } else if (stats.isFile() && item.endsWith('.vue')) {
        vueFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error finding Vue files in ${directory}:`, error);
  }
  
  return vueFiles;
}

// Main function
async function main() {
  // Check arguments
  if (process.argv.length < 3) {
    console.log('Please provide a directory to search for Vue files');
    console.log('Usage: node update-imports.js <directory>');
    process.exit(1);
  }
  
  const searchDir = path.resolve(process.argv[2]);
  console.log(`Searching for Vue files in ${searchDir}`);
  
  // Load migration plan
  loadMigrationPlan();
  
  // Find Vue files
  const vueFiles = findVueFiles(searchDir);
  console.log(`Found ${vueFiles.length} Vue files`);
  
  // Process each file
  let modifiedCount = 0;
  for (const file of vueFiles) {
    const wasModified = processFile(file);
    if (wasModified) {
      modifiedCount++;
    }
  }
  
  console.log(`Updated imports in ${modifiedCount} files`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 