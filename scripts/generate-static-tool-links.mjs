import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOOLS_CONFIG = path.resolve(__dirname, '../src/js/config/tools.ts');
const arabicTools = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../public/locales/ar/tools.json'),
    'utf8'
  )
);
const PAGES_DIR = path.resolve(__dirname, '../src/pages');
const PARTIAL_PATH = path.resolve(
  __dirname,
  '../src/partials/tool-links-static.html'
);

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeTs(value) {
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

function parseCategories(source) {
  const headers = [
    ...source.matchAll(/name:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*tools:\s*\[/g),
  ].map((m) => ({ name: unescapeTs(m[1]), index: m.index }));

  const toolMatches = [
    ...source.matchAll(
      /\{[^{}]*?href:\s*import\.meta\.env\.BASE_URL\s*\+\s*'((?:[^'\\]|\\.)*)'[^{}]*?\}/gs
    ),
  ];
  const categories = headers.map((h) => ({ name: h.name, tools: [] }));
  for (const match of toolMatches) {
    const block = match[0];
    const hrefFile = unescapeTs(match[1]);
    const nameMatch = block.match(/name:\s*'((?:[^'\\]|\\.)*)'/s);
    const subtitleMatch = block.match(/subtitle:\s*\n?\s*'((?:[^'\\]|\\.)*)'/s);
    if (!nameMatch) continue;

    let categoryIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].index < match.index) categoryIndex = i;
    }
    if (categoryIndex === -1) continue;

    categories[categoryIndex].tools.push({
      slug: hrefFile.replace(/\.html$/, ''),
      name: unescapeTs(nameMatch[1]),
      subtitle: subtitleMatch ? unescapeTs(subtitleMatch[1]) : '',
    });
  }
  return categories.filter((c) => c.tools.length > 0);
}

function generate() {
  const main = fs.readFileSync(
    path.resolve(__dirname, '../src/js/main.ts'),
    'utf8'
  );
  const keyMap = new Map(
    [...main.matchAll(/'([^']+)': 'tools:([^']+)'/g)].map((m) => [m[1], m[2]])
  );
  const translateTool = (tool) => {
    const copy = arabicTools[keyMap.get(tool.name)];
    return copy ? { ...tool, name: copy.name, subtitle: copy.subtitle } : tool;
  };

  const source = fs.readFileSync(TOOLS_CONFIG, 'utf-8');
  const categories = parseCategories(source);
  const existingPages = new Set(
    fs
      .readdirSync(PAGES_DIR)
      .filter((f) => f.endsWith('.html'))
      .map((f) => f.replace(/\.html$/, ''))
  );

  const seen = new Set();
  const lines = [];
  let toolCount = 0;
  for (const category of categories) {
    const tools = category.tools.filter(
      (t) => existingPages.has(t.slug) && !seen.has(t.slug)
    );
    if (tools.length === 0) continue;
    for (const t of tools) seen.add(t.slug);
    lines.push(
      `<div class="col-span-full mt-6 first:mt-0"><h2 class="text-lg font-semibold text-white">${escapeHtml(arabicTools.categories[keyMap.get(category.name)?.split('.')[1]] || category.name)}</h2></div>`
    );
    for (const rawTool of tools) {
      const tool = translateTool(rawTool);
      toolCount++;
      lines.push(
        `<a href="/${tool.slug}" class="block bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">` +
          `<h3 class="text-white font-semibold mb-1">${escapeHtml(tool.name)}</h3>` +
          `<p class="text-gray-400 text-sm">${escapeHtml(tool.subtitle)}</p>` +
          `</a>`
      );
    }
  }

  if (toolCount < 50) {
    console.error(
      `generate-static-tool-links: only ${toolCount} tools parsed from tools.ts — parser is likely out of sync with the config format`
    );
    process.exit(1);
  }

  fs.writeFileSync(PARTIAL_PATH, lines.join('\n') + '\n');
  console.log(
    `Static tool links: ${toolCount} tools in ${categories.length} categories -> src/partials/tool-links-static.html`
  );
}

generate();
