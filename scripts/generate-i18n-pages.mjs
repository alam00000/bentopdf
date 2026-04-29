import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const SITE_URL = (process.env.SITE_URL || 'https://www.bentopdf.com').replace(
  /\/+$/,
  ''
);
const BASE_PATH = (process.env.BASE_URL || '/').replace(/\/$/, '');

const languages = fs.readdirSync(LOCALES_DIR).filter((file) => {
  return fs.statSync(path.join(LOCALES_DIR, file)).isDirectory();
});

const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const KEY_MAPPING = {
  index: 'home',
  404: 'notFound',
};

function loadAllTranslations() {
  const translations = {};
  for (const lang of languages) {
    if (lang === 'en') continue;
    const commonPath = path.join(LOCALES_DIR, `${lang}/common.json`);
    const toolsPath = path.join(LOCALES_DIR, `${lang}/tools.json`);
    translations[lang] = {
      common: fs.existsSync(commonPath)
        ? JSON.parse(fs.readFileSync(commonPath, 'utf-8'))
        : {},
      tools: fs.existsSync(toolsPath)
        ? JSON.parse(fs.readFileSync(toolsPath, 'utf-8'))
        : {},
    };
  }
  return translations;
}

function loadEnglishTools() {
  const toolsPath = path.join(LOCALES_DIR, 'en/tools.json');
  if (!fs.existsSync(toolsPath)) return {};
  return JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
}

const ENGLISH_TOOLS = loadEnglishTools();

// TODO@ALAM: Let users build only a single language
function buildUrl(langPrefix, pagePath) {
  const parts = [SITE_URL];
  if (BASE_PATH && BASE_PATH !== '') parts.push(BASE_PATH.replace(/^\//, ''));
  if (langPrefix) parts.push(langPrefix);
  if (pagePath) parts.push(pagePath.replace(/^\//, ''));
  return parts.filter(Boolean).join('/').replace(/\/+$/, '') || SITE_URL;
}

const ORGANIZATION_LD_MARKER = 'data-bentopdf-organization';

function injectOrganizationLd(document) {
  if (document.querySelector(`script[${ORGANIZATION_LD_MARKER}]`)) return;
  const existing = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  for (const node of existing) {
    try {
      const parsed = JSON.parse(node.textContent || '');
      if (parsed && parsed['@type'] === 'Organization') return;
    } catch {
      continue;
    }
  }
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BentoPDF',
    url: SITE_URL,
    logo: `${SITE_URL}/images/favicon.svg`,
    sameAs: [
      'https://github.com/alam00000/bentopdf',
      'https://x.com/BentoPDF',
      'https://www.linkedin.com/company/bentopdf/',
      'https://www.instagram.com/thebentopdf/',
    ],
  };
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute(ORGANIZATION_LD_MARKER, '');
  script.textContent = JSON.stringify(data, null, 2);
  document.body.appendChild(script);
}

const BREADCRUMB_MARKER = 'data-bentopdf-breadcrumb';

function injectToolBreadcrumb(document, lang, toolName, toolUrl) {
  const h1 = document.querySelector('h1[data-i18n^="tools:"]');
  if (!h1) return;
  if (document.querySelector(`[${BREADCRUMB_MARKER}]`)) return;

  const homeUrl = buildUrl(lang === 'en' ? '' : lang, '');

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.setAttribute(BREADCRUMB_MARKER, '');
  nav.className = 'text-sm text-gray-400 mb-4';

  const homeLink = document.createElement('a');
  homeLink.href = homeUrl;
  homeLink.className = 'hover:text-indigo-300';
  homeLink.textContent = 'BentoPDF';

  const sep = document.createElement('span');
  sep.setAttribute('aria-hidden', 'true');
  sep.className = 'mx-2';
  sep.textContent = '›';

  const current = document.createElement('span');
  current.className = 'text-gray-300';
  current.setAttribute('aria-current', 'page');
  current.textContent = toolName;

  nav.appendChild(homeLink);
  nav.appendChild(sep);
  nav.appendChild(current);

  h1.parentNode.insertBefore(nav, h1);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'BentoPDF',
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: toolName,
        item: toolUrl,
      },
    ],
  };

  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute(BREADCRUMB_MARKER, '');
  script.textContent = JSON.stringify(ld, null, 2);
  document.body.appendChild(script);
}

function resolveToolName(translationKey, langTools) {
  const langEntry = langTools && langTools[translationKey];
  if (langEntry && langEntry.name) return langEntry.name;
  const enEntry = ENGLISH_TOOLS[translationKey];
  return enEntry && enEntry.name ? enEntry.name : null;
}

function processFileForLanguage(
  originalContent,
  file,
  lang,
  translations,
  langDir
) {
  const filenameNoExt = file.replace('.html', '');
  let translationKey = toCamelCase(filenameNoExt);
  if (KEY_MAPPING[filenameNoExt]) {
    translationKey = KEY_MAPPING[filenameNoExt];
  }

  const { tools } = translations[lang];
  const dom = new JSDOM(originalContent);
  const document = dom.window.document;

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  let title = null;
  let description = null;

  if (tools[translationKey]) {
    title =
      tools[translationKey].pageTitle ||
      (tools[translationKey].name
        ? `${tools[translationKey].name} - BentoPDF`
        : null);
    description = tools[translationKey].subtitle;
  }

  if (title) {
    document.title = title;
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) metaTitle.content = title;
    const metaTwitterTitle = document.querySelector(
      'meta[name="twitter:title"]'
    );
    if (metaTwitterTitle) metaTwitterTitle.content = title;
  }

  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = description;
    const metaOgDesc = document.querySelector(
      'meta[property="og:description"]'
    );
    if (metaOgDesc) metaOgDesc.content = description;
    const metaTwitterDesc = document.querySelector(
      'meta[name="twitter:description"]'
    );
    if (metaTwitterDesc) metaTwitterDesc.content = description;
  }

  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  const pagePath = filenameNoExt === 'index' ? '' : filenameNoExt;

  languages.forEach((l) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = l;
    link.href = buildUrl(l === 'en' ? '' : l, pagePath);
    document.head.appendChild(link);
  });

  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = buildUrl('', pagePath);
  document.head.appendChild(defaultLink);

  const canonicalUrl = buildUrl(lang, pagePath);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = canonicalUrl;
  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) twitterUrl.content = canonicalUrl;

  injectOrganizationLd(document);

  const localizedToolName = resolveToolName(translationKey, tools);
  if (localizedToolName) {
    injectToolBreadcrumb(document, lang, localizedToolName, canonicalUrl);
  }

  const links = document.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      href.startsWith('data:') ||
      href.startsWith('vbscript:')
    ) {
      return;
    }

    if (href.startsWith('/assets/') || href.includes('/assets/')) return;

    const langPrefixRegex = new RegExp(
      `^(${BASE_PATH})?/(${languages.join('|')})(/|$)`
    );
    if (langPrefixRegex.test(href)) return;

    let newHref;
    if (href.startsWith('/')) {
      const pathWithoutBase = href.startsWith(BASE_PATH)
        ? href.slice(BASE_PATH.length)
        : href;
      newHref = `${BASE_PATH}/${lang}${pathWithoutBase}`;
    } else {
      newHref = `${BASE_PATH}/${lang}/${href}`;
    }

    link.setAttribute('href', newHref);
  });

  const result = dom.serialize();

  dom.window.close();

  fs.writeFileSync(path.join(langDir, file), result);
}

function updateEnglishFile(filePath, originalContent) {
  const filenameNoExt = path.basename(filePath, '.html');
  const dom = new JSDOM(originalContent);
  const document = dom.window.document;

  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  const pagePath = filenameNoExt === 'index' ? '' : filenameNoExt;
  const canonicalUrl = buildUrl('', pagePath);

  languages.forEach((l) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = l;
    link.href = buildUrl(l === 'en' ? '' : l, pagePath);
    document.head.appendChild(link);
  });

  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = canonicalUrl;
  document.head.appendChild(defaultLink);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = canonicalUrl;
  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) twitterUrl.content = canonicalUrl;

  injectOrganizationLd(document);

  const enTranslationKey =
    KEY_MAPPING[filenameNoExt] || toCamelCase(filenameNoExt);
  const enToolName = resolveToolName(enTranslationKey, ENGLISH_TOOLS);
  if (enToolName) {
    injectToolBreadcrumb(document, 'en', enToolName, canonicalUrl);
  }

  const result = dom.serialize();

  dom.window.close();

  fs.writeFileSync(filePath, result);
}

async function generateI18nPages() {
  console.log('🌍 Generating i18n pages...');
  console.log(`   SITE_URL: ${SITE_URL}`);
  console.log(`   BASE_PATH: ${BASE_PATH || '/'}`);
  console.log(`   Languages: ${languages.length} (${languages.join(', ')})`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist directory not found. Please run build first.');
    process.exit(1);
  }

  console.log('   Loading translations...');
  const translations = loadAllTranslations();

  const htmlFiles = fs
    .readdirSync(DIST_DIR)
    .filter((file) => file.endsWith('.html'));

  console.log(`   Processing ${htmlFiles.length} HTML files...`);

  for (const lang of languages) {
    if (lang === 'en') continue;
    const langDir = path.join(DIST_DIR, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
  }

  let processed = 0;
  const total = htmlFiles.length * (languages.length - 1);

  for (const file of htmlFiles) {
    const filePath = path.join(DIST_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf-8');

    for (const lang of languages) {
      if (lang === 'en') continue;

      const langDir = path.join(DIST_DIR, lang);

      processFileForLanguage(
        originalContent,
        file,
        lang,
        translations,
        langDir
      );

      processed++;
      if (processed % 10 === 0 || processed === total) {
        console.log(`   Progress: ${processed}/${total} pages`);
      }

      // Clean up JSDOM instances
      await new Promise((resolve) => setImmediate(resolve));
    }

    updateEnglishFile(filePath, originalContent);
  }

  console.log('✅ i18n pages generated successfully!');
}

generateI18nPages().catch((err) => {
  console.error('❌ i18n page generation failed:', err);
  process.exit(1);
});
