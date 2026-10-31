import fs from 'fs';
import path from 'path';

export function listDocsSourcePages(docsDir, languageCodes) {
  const codes = new Set(languageCodes);
  const pages = [];
  const walk = (dir, relative) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'public'
      ) {
        continue;
      }
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!relative && codes.has(entry.name)) continue;
        walk(path.join(dir, entry.name), next);
      } else if (entry.name.endsWith('.md')) {
        pages.push(next);
      }
    }
  };
  walk(docsDir, '');
  return pages.sort();
}

export function completeDocsLanguages(docsDir, languageCodes, requested) {
  const pages = listDocsSourcePages(docsDir, languageCodes);
  const complete = [];
  const incomplete = [];
  for (const lang of languageCodes) {
    if (!fs.existsSync(path.join(docsDir, lang))) continue;
    const missing = pages.filter(
      (page) => !fs.existsSync(path.join(docsDir, lang, page))
    );
    if (missing.length === 0) complete.push(lang);
    else
      incomplete.push({ lang, missing: missing.length, total: pages.length });
  }
  const wanted =
    !requested || requested === 'all'
      ? complete
      : requested
          .split(',')
          .map((lang) => lang.trim())
          .filter((lang) => complete.includes(lang));
  return { enabled: wanted, incomplete };
}
