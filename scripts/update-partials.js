#!/usr/bin/env node
/**
 * Script to update all HTML files in src/pages to use Handlebars partials
 * for navbar and footer
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, '..', 'src', 'pages');

// Get all HTML files in src/pages
const htmlFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to process...`);

let updatedCount = 0;
let skippedCount = 0;

for (const file of htmlFiles) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Check if already using partials
  if (content.includes('{{> navbar }}') && content.includes('{{> footer }}')) {
    console.log(`  [SKIP] ${file} - already using partials`);
    skippedCount++;
    continue;
  }

  // Replace navbar - match from <nav to </nav>
  const navbarRegex =
    /<nav class="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">[\s\S]*?<\/nav>/;
  if (navbarRegex.test(content)) {
    content = content.replace(navbarRegex, '{{> navbar }}');
    modified = true;
  }

  // Replace footer - match from <footer to </footer>
  const footerRegex =
    /<footer class="mt-16 border-t-2 border-gray-700 py-8">[\s\S]*?<\/footer>/;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, '{{> footer }}');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  [UPDATED] ${file}`);
    updatedCount++;
  } else {
    console.log(`  [NO MATCH] ${file} - navbar/footer pattern not found`);
    skippedCount++;
  }
}

console.log(
  `\nDone! Updated ${updatedCount} files, skipped ${skippedCount} files.`
);
