import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const SITE_URL = process.env.SITE_URL || 'https://www.bentopdf.com';

const languages = fs.readdirSync(LOCALES_DIR).filter((file) => {
  return fs.statSync(path.join(LOCALES_DIR, file)).isDirectory();
});

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
  404: 0.1,
};

function getPriority(pageName) {
  return PRIORITY_MAP[pageName] || 0.7;
}

function buildUrl(lang, pageName) {
  const pagePath = pageName === 'index' ? '' : pageName;
  if (lang === 'en') {
    return pagePath ? `${SITE_URL}/${pagePath}` : SITE_URL;
  }
  return pagePath ? `${SITE_URL}/${lang}/${pagePath}` : `${SITE_URL}/${lang}`;
}

function generateSitemap() {
  console.log('🗺️  Generating multilingual sitemap...');
  console.log(`   SITE_URL: ${SITE_URL}`);
  console.log(`   Languages: ${languages.join(', ')}`);

  // Get all HTML files from dist root (English pages)
  const htmlFiles = fs
    .readdirSync(DIST_DIR)
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.replace('.html', ''));

  const today = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  for (const pageName of htmlFiles) {
    const priority = getPriority(pageName);

    // Generate entry for each language
    for (const lang of languages) {
      const url = buildUrl(lang, pageName);

      sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
`;

      // Add hreflang alternates for all languages
      for (const altLang of languages) {
        const altUrl = buildUrl(altLang, pageName);
        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>
`;
      }

      // Add x-default pointing to English
      const defaultUrl = buildUrl('en', pageName);
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>
  </url>
`;
    }
  }

  sitemap += `</urlset>
`;

  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);

  const publicSitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemap);

  const urlCount = htmlFiles.length * languages.length;
  console.log(
    `✅ Sitemap generated with ${urlCount} URLs (${htmlFiles.length} pages × ${languages.length} languages)`
  );
}

generateSitemap();
