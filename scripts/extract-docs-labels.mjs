import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nav, sidebar } from '../docs/.vitepress/navigation.mjs';
import {
  DESCRIPTION,
  FOOTER_MESSAGE,
  THEME_LABELS,
} from '../docs/.vitepress/i18n/theme-labels.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.resolve(__dirname, '../docs/.vitepress/i18n/source.json');

const labels = new Set([DESCRIPTION, FOOTER_MESSAGE, ...THEME_LABELS]);

function collect(items) {
  for (const item of items) {
    if (item.text) labels.add(item.text);
    if (item.items) collect(item.items);
  }
}

collect(nav);
Object.values(sidebar).forEach(collect);

const sorted = [...labels].sort((a, b) => a.localeCompare(b));
fs.writeFileSync(OUT_FILE, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Wrote ${sorted.length} docs labels to ${OUT_FILE}`);
