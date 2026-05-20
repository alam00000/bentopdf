import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = (process.env.SITE_URL || 'https://www.bentopdf.com').replace(
  /\/+$/,
  ''
);
const BRAND_NAME = process.env.VITE_BRAND_NAME || 'BentoPDF';
const BRAND_LOGO = (
  process.env.VITE_BRAND_LOGO || 'images/favicon.svg'
).replace(/^\/+/, '');
const FOOTER_TEXT =
  process.env.VITE_FOOTER_TEXT || '© 2026 BentoPDF. All rights reserved.';
const SOURCE_REPOSITORY_URL =
  process.env.VITE_SOURCE_REPOSITORY_URL ||
  'https://github.com/alam00000/bentopdf';

const isBrandedBuild =
  BRAND_NAME !== 'BentoPDF' || SITE_URL !== 'https://www.bentopdf.com';

function walk(dir, predicate) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath, predicate));
    } else if (!predicate || predicate(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function replaceBrandText(value) {
  return value
    .replace(/Bento PDF/g, BRAND_NAME)
    .replace(/BentoPDF/g, BRAND_NAME);
}

function rewriteTextNodes(html) {
  return html.replace(/>([^<]*Bento\s?PDF[^<]*)</g, (_match, text) => {
    return `>${replaceBrandText(text)}<`;
  });
}

function rewriteBrandAttributes(html) {
  return html.replace(
    /\b(content|alt|title|aria-label)="([^"]*Bento\s?PDF[^"]*)"/g,
    (_match, attribute, value) => {
      return `${attribute}="${replaceBrandText(value)}"`;
    }
  );
}

function rewriteJsonLdValue(value, isOrganization = false) {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteJsonLdValue(item));
  }

  if (value && typeof value === 'object') {
    const isCurrentOrganization =
      isOrganization || value['@type'] === 'Organization';
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = rewriteJsonLdValue(item, isCurrentOrganization);
    }

    if (isCurrentOrganization) {
      output.name = BRAND_NAME;
      output.url = SITE_URL;
      output.logo = `${SITE_URL}/${BRAND_LOGO}`;
      output.sameAs = [SOURCE_REPOSITORY_URL];
    }

    return output;
  }

  if (typeof value !== 'string' || /^https?:\/\//i.test(value)) {
    return value;
  }

  return replaceBrandText(value);
}

function rewriteStructuredData(html) {
  return html.replace(
    /(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,
    (match, openTag, json, closeTag) => {
      try {
        const data = JSON.parse(json);
        return `${openTag}${JSON.stringify(rewriteJsonLdValue(data), null, 2)}${closeTag}`;
      } catch {
        return match;
      }
    }
  );
}

function removeOriginalSocialLinks(html) {
  const originalSocialLinks = [
    /<a\s+[^>]*href="https:\/\/discord\.gg\/[^"]*"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/www\.instagram\.com\/thebentopdf\/"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/www\.linkedin\.com\/company\/bentopdf\/"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/x\.com\/BentoPDF"[\s\S]*?<\/a>/g,
  ];

  return originalSocialLinks.reduce(
    (updatedHtml, pattern) => updatedHtml.replace(pattern, ''),
    html
  );
}

function rewriteBrandHtml(html) {
  return rewriteStructuredData(rewriteBrandAttributes(rewriteTextNodes(html)));
}

function rewriteHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  if (isBrandedBuild) {
    html = rewriteBrandHtml(html)
      .replace(
        /<meta\s+name="author"\s+content="[^"]*"\s*\/?>/g,
        `<meta name="author" content="${BRAND_NAME}">`
      )
      .replace(
        /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/g,
        `<meta property="og:site_name" content="${BRAND_NAME}">`
      )
      .replace(
        /<meta\s+name="apple-mobile-web-app-title"\s+content="[^"]*"\s*\/?>/g,
        `<meta name="apple-mobile-web-app-title" content="${BRAND_NAME}">`
      )
      .replace(
        /<meta\s+name="twitter:(?:site|creator)"\s+content="[^"]*"\s*\/?>\s*/g,
        ''
      )
      .replace(
        /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="[^"]*"\s*\/?>/g,
        `<link rel="icon" type="image/svg+xml" href="/${BRAND_LOGO}">`
      )
      .replace(
        /<p([^>]*id="footer-copyright"[^>]*)>[\s\S]*?<\/p>/g,
        `<p$1>${FOOTER_TEXT}</p>`
      )
      .replace(
        /(<p[^>]*id="footer-copyright"[^>]*)\s+data-i18n="footer\.copyright"([^>]*>)/g,
        '$1$2'
      );
    html = removeOriginalSocialLinks(html);
  }

  html = html
    .replace(/https:\/\/www\.bentopdf\.com/g, SITE_URL)
    .replace(/\/images\/favicon\.svg/g, `/${BRAND_LOGO}`);

  if (isBrandedBuild) {
    html = rewriteBrandHtml(html);
  }

  fs.writeFileSync(filePath, html);
}

function writeManifest() {
  const manifest = {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description:
      'Бесплатные PDF-инструменты Hiiire: редактирование, объединение, сжатие и конвертация файлов прямо в браузере.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    orientation: 'portrait-primary',
    icons: [
      {
        src: `/${BRAND_LOGO}`,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['productivity', 'utilities', 'privacy', 'pdf', 'tools'],
    screenshots: [],
  };

  fs.writeFileSync(
    path.join(DIST_DIR, 'site.webmanifest'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function writeRobots() {
  const robots = `# ${BRAND_NAME} Robots.txt
# ${SITE_URL}

User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

Disallow: /api/
Disallow: /_next/
Disallow: /assets/
Disallow: /src/
Disallow: /*.wasm$
Disallow: /*.wasm.gz$
Disallow: /*.data.gz$
Disallow: /*.br$
Disallow: /tmp/
Disallow: /temp/
Disallow: /uploads/
Disallow: /docs/assets/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /
`;

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots);
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist directory not found. Run the Vite build first.');
  process.exit(1);
}

for (const file of walk(DIST_DIR, (filePath) => filePath.endsWith('.html'))) {
  rewriteHtml(file);
}

writeManifest();
writeRobots();

console.log(`Applied branding for ${BRAND_NAME} at ${SITE_URL}`);
