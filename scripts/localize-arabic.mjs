/** One-time, repeatable localization of first-party HTML using curated Arabic copy.
 * Never touches IDs, URLs, script bodies, input values or PDF processing data.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { processDocument } from './content-segments.mjs';
import { applyServerTranslations } from './server-translations.mjs';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const content = read('translations/ar/content.json');
const resources = {
  common: read('public/locales/ar/common.json'),
  tools: read('public/locales/ar/tools.json'),
};
const ui = read('public/locales/ar/ui.json');
const overrides = read('translations/ar/overrides.json');
const source = read('translations/source.json');
const direct = { ...ui, ...overrides };
for (const [id, entry] of Object.entries(source)) {
  if (content[id] && !/<\d/.test(entry.text)) direct[entry.text] = content[id];
}
export function localizeHtml(html, fragment = false) {
  // Protect Handlebars directives during HTML parsing/serialization.
  const tokens = [];
  html = html.replace(/{{[\s\S]*?}}/g, (m) => {
    tokens.push(m);
    return `PIXELHB${tokens.length - 1}TOKEN`;
  });
  const dom = new JSDOM(fragment ? `<body>${html}</body>` : html);
  const doc = dom.window.document;
  processDocument(doc, { translate: (id) => content[id] || null });
  applyServerTranslations(doc, resources);
  const walker = doc.createTreeWalker(
    doc.body,
    dom.window.NodeFilter.SHOW_TEXT
  );
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, code, pre')) continue;
    const key = node.textContent.trim();
    const normalized = key.replace(/\s+/g, ' ');
    const translated = direct[normalized];
    if (translated)
      node.textContent = node.textContent.replace(key, translated);
  }
  doc.documentElement.lang = 'ar';
  doc.documentElement.dir = 'rtl';
  doc
    .querySelectorAll('meta[property="og:locale"]')
    .forEach((e) => (e.content = 'ar_SA'));
  let result = fragment ? doc.body.innerHTML : dom.serialize();
  return result.replace(/PIXELHB(\d+)TOKEN/g, (_, i) => tokens[Number(i)]);
}
if (process.argv.includes('--write')) {
  const files = fs.readdirSync('.').filter((f) => f.endsWith('.html'));
  for (const dir of ['src/pages', 'src/partials']) {
    for (const f of fs.readdirSync(dir))
      if (f.endsWith('.html')) files.push(path.join(dir, f));
  }
  for (const file of files)
    fs.writeFileSync(
      file,
      localizeHtml(fs.readFileSync(file, 'utf8'), file.includes('/partials/'))
    );
  console.log(`تم تعريب ${files.length} صفحة وقالبًا.`);
}
