import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { ENGLISH_ONLY_PAGES, processPage } from './content-segments.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outFile = path.resolve(
  outIndex >= 0
    ? args.splice(outIndex, 2)[1]
    : path.join(__dirname, '../translations/source.json')
);
const distDirs = (
  args.length > 0 ? args : [path.join(__dirname, '../dist')]
).map((dir) => path.resolve(dir));

const existing = fs.existsSync(outFile)
  ? JSON.parse(fs.readFileSync(outFile, 'utf-8'))
  : {};

const segments = new Map();
const pageIds = new Map();
let pageCount = 0;

for (const distDir of distDirs) {
  const pages = fs
    .readdirSync(distDir)
    .filter((file) => file.endsWith('.html'))
    .sort();
  pageCount += pages.length;
  for (const file of pages) {
    const pageName = file.replace(/\.html$/, '');
    const dom = new JSDOM(fs.readFileSync(path.join(distDir, file), 'utf-8'));
    processPage(dom.window.document, pageName, {
      record(id, text, tag) {
        const entry = segments.get(id) || { text, tags: new Set(), pages: [] };
        entry.tags.add(tag);
        if (!entry.pages.includes(pageName)) entry.pages.push(pageName);
        segments.set(id, entry);
        if (!ENGLISH_ONLY_PAGES.has(pageName)) {
          if (!pageIds.has(pageName)) pageIds.set(pageName, new Set());
          pageIds.get(pageName).add(id);
        }
      },
    });
    dom.window.close();
  }
}

const result = {};
for (const id of [...segments.keys()].sort()) {
  const entry = segments.get(id);
  result[id] = {
    text: entry.text,
    tags: [...entry.tags].sort(),
    pages: entry.pages.slice(0, 3),
    pageCount: entry.pages.length,
  };
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');

const pageIndex = {};
for (const page of [...pageIds.keys()].sort()) {
  pageIndex[page] = [...pageIds.get(page)].sort();
}
fs.writeFileSync(
  path.join(path.dirname(outFile), 'pages.json'),
  JSON.stringify(pageIndex) + '\n'
);

const added = Object.keys(result).filter((id) => !existing[id]).length;
const removed = Object.keys(existing).filter((id) => !result[id]).length;
const words = Object.values(result).reduce(
  (sum, entry) => sum + entry.text.split(/\s+/).length,
  0
);
console.log(
  `Extracted ${Object.keys(result).length} unique segments (${words} words) from ${pageCount} pages. Added ${added}, removed ${removed}.`
);
