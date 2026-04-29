import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const SITE_URL = (process.env.SITE_URL || 'https://www.bentopdf.com').replace(
  /\/+$/,
  ''
);
const HOST = new URL(SITE_URL).hostname;

const NOINDEX_ALLOWLIST = new Set(['404.html', 'wasm-settings.html']);
const SKIP_DIRS = new Set([
  'assets',
  'docs',
  'pdfjs-viewer',
  'pdfjs-annotation-viewer',
]);
const SITEMAP_FORBIDDEN_PATTERNS = [/\/404(\b|\/)/, /index\.html(?:$|\?)/];
const SITEMAP_MAX_URLS = 50000;

const failures = [];
const warnings = [];

function fail(rule, detail) {
  failures.push({ rule, detail });
}

function warn(rule, detail) {
  warnings.push({ rule, detail });
}

function listDistHtml() {
  const files = [];
  function walk(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const rel = path.posix.join(prefix, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
        walk(full, rel);
      } else if (entry.endsWith('.html')) {
        files.push({ full, rel });
      }
    }
  }
  walk(DIST_DIR);
  return files;
}

function findOne(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function findAll(html, regex) {
  const out = [];
  let m;
  while ((m = regex.exec(html)) !== null) out.push(m[1]);
  return out;
}

function expectedCanonicalForFile(rel) {
  const parts = rel.split('/');
  const fileName = parts.pop();
  const langPrefix = parts.length > 0 ? parts.join('/') : '';
  const baseName = fileName.replace(/\.html$/, '');
  const slug = baseName === 'index' ? '' : baseName;
  const segments = [SITE_URL];
  if (langPrefix) segments.push(langPrefix);
  if (slug) segments.push(slug);
  return segments.join('/').replace(/\/+$/, '') || SITE_URL;
}

function auditHtml(file) {
  const html = fs.readFileSync(file.full, 'utf-8');
  const titles = findAll(html, /<title[^>]*>[\s\S]*?<\/title>/g);
  if (titles.length === 0) {
    fail('title', `${file.rel}: no <title>`);
  } else if (titles.length > 1) {
    fail('title', `${file.rel}: ${titles.length} <title> tags (expected 1)`);
  }

  const canonicals = findAll(
    html,
    /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/g
  );
  if (canonicals.length === 0) {
    fail('canonical', `${file.rel}: missing <link rel="canonical">`);
  } else if (canonicals.length > 1) {
    fail(
      'canonical',
      `${file.rel}: ${canonicals.length} canonical tags (expected 1)`
    );
  } else {
    const actual = canonicals[0];
    if (file.rel !== '404.html' && actual.endsWith('.html')) {
      fail(
        'canonical',
        `${file.rel}: canonical "${actual}" still ends in .html`
      );
    }
    try {
      const url = new URL(actual);
      if (url.hostname !== HOST) {
        warn(
          'canonical',
          `${file.rel}: canonical host "${url.hostname}" != expected "${HOST}"`
        );
      }
    } catch {
      fail(
        'canonical',
        `${file.rel}: canonical "${actual}" is not a valid URL`
      );
    }
    if (file.rel !== '404.html') {
      const expected = expectedCanonicalForFile(file.rel);
      if (actual.replace(/\/+$/, '') !== expected.replace(/\/+$/, '')) {
        fail(
          'canonical',
          `${file.rel}: canonical "${actual}" != expected "${expected}"`
        );
      }
    }
  }

  const robots = findOne(
    html,
    /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i
  );
  if (
    robots &&
    /noindex/i.test(robots) &&
    !NOINDEX_ALLOWLIST.has(file.rel) &&
    !NOINDEX_ALLOWLIST.has(path.basename(file.rel))
  ) {
    fail(
      'robots',
      `${file.rel}: noindex on indexable page (robots="${robots}")`
    );
  }

  const emptyI18n = html.match(/<span[^>]*data-i18n="[^"]+"[^>]*>\s*<\/span>/g);
  if (emptyI18n && emptyI18n.length > 0) {
    fail(
      'data-i18n',
      `${file.rel}: ${emptyI18n.length} empty data-i18n spans (e.g. ${emptyI18n[0].slice(0, 80)})`
    );
  }

  const aggregateRating = html.includes('"aggregateRating"');
  if (aggregateRating) {
    fail('aggregateRating', `${file.rel}: contains aggregateRating JSON-LD`);
  }

  const hreflangTags = [
    ...html.matchAll(
      /<link[^>]+rel=["']alternate["'][^>]*hreflang=["'][^"']+["'][^>]*>/g
    ),
  ].map((m) => m[0]);
  for (const tag of hreflangTags) {
    const m = tag.match(/href=["']([^"']+)["']/);
    if (!m) continue;
    try {
      const url = new URL(m[1]);
      if (url.hostname !== HOST) {
        fail(
          'hreflang',
          `${file.rel}: hreflang href host "${url.hostname}" != expected "${HOST}"`
        );
      }
    } catch {
      fail('hreflang', `${file.rel}: hreflang href "${m[1]}" not a valid URL`);
    }
  }
}

function auditSitemap() {
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    fail('sitemap', 'dist/sitemap.xml not found');
    return;
  }
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  const locs = findAll(xml, /<loc>([^<]+)<\/loc>/g);

  if (locs.length === 0) fail('sitemap', 'sitemap has no <loc> entries');
  if (locs.length > SITEMAP_MAX_URLS) {
    fail(
      'sitemap',
      `sitemap has ${locs.length} URLs (max ${SITEMAP_MAX_URLS}); split into a sitemap index`
    );
  }

  const seen = new Set();
  for (const loc of locs) {
    if (seen.has(loc)) {
      fail('sitemap', `sitemap has duplicate <loc>: ${loc}`);
    }
    seen.add(loc);

    for (const pattern of SITEMAP_FORBIDDEN_PATTERNS) {
      if (pattern.test(loc)) {
        fail('sitemap', `sitemap contains forbidden URL: ${loc}`);
      }
    }

    try {
      const url = new URL(loc);
      if (url.hostname !== HOST) {
        fail(
          'sitemap',
          `sitemap URL host "${url.hostname}" != expected "${HOST}" (${loc})`
        );
      }
    } catch {
      fail('sitemap', `sitemap URL is not valid: ${loc}`);
    }
  }

  const expectedLocales = fs
    .readdirSync(LOCALES_DIR)
    .filter((d) => fs.statSync(path.join(LOCALES_DIR, d)).isDirectory());
  for (const lang of expectedLocales) {
    if (lang === 'en') continue;
    const sample = locs.find(
      (l) => l.includes(`/${lang}/`) || l.endsWith(`/${lang}`)
    );
    if (!sample) {
      warn('sitemap', `sitemap has no entry for locale "${lang}"`);
    }
  }
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`SEO audit: dist not found at ${DIST_DIR}`);
    process.exit(1);
  }

  const files = listDistHtml();
  if (files.length === 0) {
    fail('audit', 'no HTML files found in dist/');
  }

  for (const file of files) auditHtml(file);
  auditSitemap();

  const total = failures.length + warnings.length;
  if (total === 0) {
    console.log(`SEO audit: ${files.length} HTML files passed, sitemap clean.`);
    return;
  }

  if (warnings.length) {
    console.warn(`\nSEO audit warnings (${warnings.length}):`);
    for (const { rule, detail } of warnings.slice(0, 50)) {
      console.warn(`  [${rule}] ${detail}`);
    }
    if (warnings.length > 50) {
      console.warn(`  ... and ${warnings.length - 50} more warnings`);
    }
  }

  if (failures.length) {
    console.error(`\nSEO audit failures (${failures.length}):`);
    for (const { rule, detail } of failures.slice(0, 100)) {
      console.error(`  [${rule}] ${detail}`);
    }
    if (failures.length > 100) {
      console.error(`  ... and ${failures.length - 100} more failures`);
    }
    process.exit(1);
  }
}

main();
