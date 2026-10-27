import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DOCS_INLINE_SCRIPT_HASHES } from './generate-security-headers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const docsDistPath = path.join(projectRoot, 'docs', '.vitepress', 'dist');
const mainDistPath = path.join(projectRoot, 'dist');
const targetDocsPath = path.join(mainDistPath, 'docs');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findUnlistedInlineScripts(dir, unlisted = new Set()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findUnlistedInlineScripts(entryPath, unlisted);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(entryPath, 'utf8');
    const inlineScripts = html.matchAll(
      /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g
    );
    for (const [, attributes, code] of inlineScripts) {
      if (
        !code.trim() ||
        /type=["']?application\/(ld\+)?json/.test(attributes)
      ) {
        continue;
      }
      const hash = `sha256-${crypto.createHash('sha256').update(code).digest('base64')}`;
      if (!DOCS_INLINE_SCRIPT_HASHES.includes(hash)) unlisted.add(hash);
    }
  }
  return unlisted;
}

console.log('Including docs in dist...');

if (!fs.existsSync(docsDistPath)) {
  console.error(
    'Error: Docs build not found. Please run "npm run docs:build" first.'
  );
  process.exit(1);
}
if (!fs.existsSync(mainDistPath)) {
  console.error(
    'Error: Main dist folder not found. Please run "npm run build" first.'
  );
  process.exit(1);
}

const unlistedScripts = findUnlistedInlineScripts(docsDistPath);
if (unlistedScripts.size > 0) {
  console.error(
    'Error: The docs contain inline scripts that the docs Content-Security-Policy does not allow:'
  );
  for (const hash of unlistedScripts) console.error(`  '${hash}'`);
  console.error(
    'Add these hashes to DOCS_INLINE_SCRIPT_HASHES in scripts/generate-security-headers.mjs and to the /docs script-src in vercel.json and serve.json, then rebuild.'
  );
  process.exit(1);
}

try {
  console.log(`Copying from: ${docsDistPath}`);
  console.log(`Copying to: ${targetDocsPath}`);

  copyDir(docsDistPath, targetDocsPath);

  console.log('Docs successfully included in dist/docs!');

  const files = fs.readdirSync(targetDocsPath);
  console.log(`Copied ${files.length} items to dist/docs`);

  addDocsToSitemap();
} catch (error) {
  console.error('Error copying docs:', error.message);
  process.exit(1);
}

function listDocsHtml(dir, prefix) {
  const urls = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name.startsWith('.')) continue;
      urls.push(
        ...listDocsHtml(path.join(dir, entry.name), `${prefix}/${entry.name}`)
      );
    } else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
      const slug = entry.name.replace(/\.html$/, '');
      const html = fs.readFileSync(path.join(dir, entry.name), 'utf-8');
      const canonical = html.match(
        /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/
      );
      urls.push({
        url: slug === 'index' ? prefix : `${prefix}/${slug}`,
        canonical: canonical ? canonical[1] : null,
      });
    }
  }
  return urls;
}

function addDocsToSitemap() {
  const siteUrl = (process.env.SITE_URL || 'https://www.bentopdf.com').replace(
    /\/+$/,
    ''
  );
  const sitemapPath = path.join(mainDistPath, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.warn(
      'sitemap.xml not found in dist; skipping docs sitemap entries'
    );
    return;
  }
  let xml = fs.readFileSync(sitemapPath, 'utf-8');
  if (xml.includes(`<loc>${siteUrl}/docs</loc>`)) return;

  const urls = listDocsHtml(targetDocsPath, '/docs')
    .filter(({ url, canonical }) => canonical === `${siteUrl}${url}`)
    .map(({ url }) => url);
  const entries = urls
    .map(
      (url) =>
        `  <url>\n    <loc>${siteUrl}${url}</loc>\n    <priority>0.6</priority>\n  </url>\n`
    )
    .join('');
  xml = xml.replace('</urlset>', `${entries}</urlset>`);
  fs.writeFileSync(sitemapPath, xml);
  console.log(`Added ${urls.length} docs URLs to sitemap.xml`);
}
