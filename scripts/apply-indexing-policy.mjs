import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isIndexingBlocked, resolveSiteUrl } from './indexing-policy.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const NOINDEX_META = '<meta name="robots" content="noindex, follow" />';

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtml(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

if (!isIndexingBlocked()) {
  console.log('Indexing policy: search engines may index this build.');
} else {
  let updated = 0;
  for (const file of listHtml(DIST_DIR)) {
    const html = fs.readFileSync(file, 'utf-8');
    const robots = /<meta\s+name=["']robots["'][^>]*>/i;
    const next = robots.test(html)
      ? html.replace(robots, NOINDEX_META)
      : html.replace(/<\/head>/i, `  ${NOINDEX_META}\n  </head>`);
    if (next !== html) {
      fs.writeFileSync(file, next);
      updated++;
    }
  }
  console.log(
    `Indexing policy: SITE_URL is ${resolveSiteUrl()}, so ${updated} pages were marked noindex. Set ALLOW_INDEXING=true to let search engines index this deployment.`
  );
}
