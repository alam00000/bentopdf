import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = (process.env.SITE_URL || 'https://pdf.hiiire.com').replace(
  /\/+$/,
  ''
);
const BRAND_NAME = process.env.VITE_BRAND_NAME || 'hiiirePDF';
const BRAND_LOGO = (
  process.env.VITE_BRAND_LOGO || 'images/favicon.svg'
).replace(/^\/+/, '');
const FAVICON_ICONS = [
  {
    src: '/images/favicon.svg',
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any',
  },
  {
    src: '/images/favicon-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any',
  },
  {
    src: '/images/favicon-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any',
  },
];
const FOOTER_TEXT =
  process.env.VITE_FOOTER_TEXT || '© 2026 hiiirePDF. All rights reserved.';
const SOURCE_REPOSITORY_URL = process.env.VITE_SOURCE_REPOSITORY_URL || '';

const isBrandedBuild =
  BRAND_NAME !== 'hiiirePDF' || SITE_URL !== 'https://pdf.hiiire.com';
const shouldExposeSourceRepository =
  !isBrandedBuild && SOURCE_REPOSITORY_URL.length > 0;

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
    .replace(/hiiirePDF/g, BRAND_NAME)
    .replace(/hiiirePDF/g, BRAND_NAME);
}

function rewriteTextNodes(html) {
  return html.replace(/>([^<]*hiiire\s?PDF[^<]*)</g, (_match, text) => {
    return `>${replaceBrandText(text)}<`;
  });
}

function rewriteBrandAttributes(html) {
  return html.replace(
    /\b(content|alt|title|aria-label)="([^"]*hiiire\s?PDF[^"]*)"/g,
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
      if (shouldExposeSourceRepository) {
        output.sameAs = [SOURCE_REPOSITORY_URL];
      } else {
        delete output.sameAs;
      }
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
    /<a\s+[^>]*href="https:\/\/github\.com\/[^"]*"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/discord\.gg\/[^"]*"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/www\.instagram\.com\/thehiiirepdf\/"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/www\.linkedin\.com\/company\/hiiirepdf\/"[\s\S]*?<\/a>/g,
    /<a\s+[^>]*href="https:\/\/x\.com\/hiiirePDF"[\s\S]*?<\/a>/g,
  ];

  return originalSocialLinks.reduce(
    (updatedHtml, pattern) => updatedHtml.replace(pattern, ''),
    html
  );
}

function removeSourceRepositoryUi(html) {
  return html
    .replace(
      /<a\s+[^>]*href="about:blank"[^>]*>[\s\S]*?github-stars-(?:desktop|mobile)[\s\S]*?<\/a>/g,
      ''
    )
    .replace(
      /<a\s+[^>]*>[\s\S]*?github-stars-(?:desktop|mobile)[\s\S]*?<\/a>/g,
      ''
    )
    .replace(/<a\s+[^>]*title="GitHub"[^>]*>[\s\S]*?<\/a>/g, '');
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
    html = removeSourceRepositoryUi(html);
  }

  html = html
    .replace(/https:\/\/www\.hiiirepdf\.com/g, SITE_URL)
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
    description: isBrandedBuild
      ? `Бесплатные PDF-инструменты ${BRAND_NAME}: редактирование, объединение, сжатие и конвертация файлов прямо в браузере.`
      : 'Free online PDF tools - Privacy-first PDF toolkit that works 100% in your browser',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    orientation: 'portrait-primary',
    icons: FAVICON_ICONS,
    categories: [
      'productivity',
      'utilities',
      'privacy',
      'pdf',
      'security',
      'offline',
      'tools',
    ],
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

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /
`;

  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots);
}

function removeUnusedBrandAssets() {
  if (!isBrandedBuild) return;

  const oldBrandMark = path.join(DIST_DIR, 'images', 'hiiire-pdf-mark.svg');
  if (fs.existsSync(oldBrandMark)) {
    fs.unlinkSync(oldBrandMark);
  }
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
removeUnusedBrandAssets();

console.log(`Applied branding for ${BRAND_NAME} at ${SITE_URL}`);
