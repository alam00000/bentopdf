import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const SITE_URL = (process.env.SITE_URL || 'https://pdf.hiiire.com').replace(
  /\/+$/,
  ''
);
const EXCLUDED_PAGES = new Set([
  '404',
  'wasm-settings',
  ...(process.env.VITE_EXCLUDED_PAGES || '')
    .split(',')
    .map((page) => page.trim())
    .filter(Boolean),
]);

const allLanguages = fs.readdirSync(LOCALES_DIR).filter((file) => {
  return fs.statSync(path.join(LOCALES_DIR, file)).isDirectory();
});
const languages =
  process.env.HIREPDF_RU_ONLY === 'true' ? ['ru'] : allLanguages;
const isSingleLanguageBuild = languages.length === 1;

const PRIORITY_MAP = {
  index: 1.0,
  tools: 0.9,
  'pdf-converter': 0.9,
  'pdf-editor': 0.9,
  'pdf-security': 0.9,
  'pdf-merge-split': 0.9,
  'merge-pdf': 0.9,
  'split-pdf': 0.9,
  'compress-pdf': 0.9,
  'edit-pdf': 0.9,
  'word-to-pdf': 0.9,
  'excel-to-pdf': 0.9,
  'powerpoint-to-pdf': 0.9,
  'jpg-to-pdf': 0.9,
  'pdf-to-docx': 0.9,
  'pdf-to-excel': 0.9,
  'pdf-to-jpg': 0.9,
  about: 0.8,
  faq: 0.8,
  contact: 0.7,
  privacy: 0.5,
  terms: 0.5,
  licensing: 0.5,
};

function getPriority(pageName) {
  return PRIORITY_MAP[pageName] || 0.7;
}

function buildUrl(lang, pageName) {
  const pagePath = pageName === 'index' ? '' : pageName;
  if (isSingleLanguageBuild || lang === 'en') {
    return pagePath ? `${SITE_URL}/${pagePath}` : SITE_URL;
  }
  return pagePath ? `${SITE_URL}/${lang}/${pagePath}` : `${SITE_URL}/${lang}`;
}

function generateSitemap() {
  console.log('🗺️  Generating multilingual sitemap...');
  console.log(`   SITE_URL: ${SITE_URL}`);
  console.log(`   Languages: ${languages.join(', ')}`);

  const htmlFiles = fs
    .readdirSync(DIST_DIR)
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.replace('.html', ''))
    .filter((name) => !EXCLUDED_PAGES.has(name));

  const lastModCache = new Map();
  const getLastMod = (lang, pageName) => {
    const cacheKey = `${lang}::${pageName}`;
    if (lastModCache.has(cacheKey)) return lastModCache.get(cacheKey);
    const fileName = `${pageName}.html`;
    const filePath =
      isSingleLanguageBuild || lang === 'en'
        ? path.join(DIST_DIR, fileName)
        : path.join(DIST_DIR, lang, fileName);
    let iso;
    try {
      iso = fs.statSync(filePath).mtime.toISOString().slice(0, 10);
    } catch {
      iso = new Date().toISOString().slice(0, 10);
    }
    lastModCache.set(cacheKey, iso);
    return iso;
  };

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  for (const pageName of htmlFiles) {
    const priority = getPriority(pageName);
    const canonicalLanguage = isSingleLanguageBuild ? languages[0] : 'en';
    const url = buildUrl(canonicalLanguage, pageName);
    const lastmod = getLastMod(canonicalLanguage, pageName);

    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
`;

    if (!isSingleLanguageBuild) {
      for (const altLang of languages) {
        const altUrl = buildUrl(altLang, pageName);
        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>
`;
      }

      const defaultUrl = buildUrl('en', pageName);
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>
`;
    }

    sitemap += `  </url>
`;
  }

  sitemap += `</urlset>
`;

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);

  const publicSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemap);

  console.log(
    `✅ Sitemap generated with ${htmlFiles.length} canonical URLs (${languages.length} hreflang alternates each)`
  );
}

generateSitemap();
