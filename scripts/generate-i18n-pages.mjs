import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';
import { serializeJsonLd } from './json-ld.mjs';
import { ENGLISH_ONLY_PAGES, processPage } from './content-segments.mjs';
import { completeDocsLanguages } from './docs-languages.mjs';
import { createTranslationChecker } from './page-translation.mjs';
import { canonicalBasePath } from './indexing-policy.mjs';
import { applyServerTranslations } from './server-translations.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const CONTENT_DIR = path.resolve(__dirname, '../translations');
const SITE_URL = (process.env.SITE_URL || 'https://www.bentopdf.com').replace(
  /\/+$/,
  ''
);
const BASE_PATH = (process.env.BASE_URL || '/').replace(/\/$/, '');

const languages = fs.readdirSync(LOCALES_DIR).filter((file) => {
  return fs.statSync(path.join(LOCALES_DIR, file)).isDirectory();
});

const OFFICIAL_DOCS_URL = 'https://www.bentopdf.com/docs';

const docsLanguages = completeDocsLanguages(
  path.resolve(__dirname, '../docs'),
  languages.filter((lang) => lang !== 'en'),
  process.env.DOCS_LANGUAGES
).enabled;

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
    const contentPath = path.join(CONTENT_DIR, lang, 'content.json');
    translations[lang] = {
      content: fs.existsSync(contentPath)
        ? JSON.parse(fs.readFileSync(contentPath, 'utf-8'))
        : {},
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

const contentTotals = {};

// TODO@ALAM: Let users build only a single language
function buildUrl(langPrefix, pagePath) {
  const parts = [SITE_URL];
  const canonicalBase = canonicalBasePath();
  if (canonicalBase) parts.push(canonicalBase.replace(/^\//, ''));
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
  script.textContent = serializeJsonLd(data);
  document.body.appendChild(script);
}

const BREADCRUMB_MARKER = 'data-bentopdf-breadcrumb';
const BRAND_NAME = process.env.VITE_BRAND_NAME || 'BentoPDF';

function buildLocalHomeHref(lang) {
  const langSegment = lang === 'en' ? '/' : `/${lang}`;
  return `${BASE_PATH}${langSegment}`.replace(/\/+/g, '/');
}

function removeStaticBreadcrumbLd(document) {
  for (const script of document.querySelectorAll(
    `script[type="application/ld+json"]:not([${BREADCRUMB_MARKER}])`
  )) {
    try {
      const parsed = JSON.parse(script.textContent || '');
      if (parsed && parsed['@type'] === 'BreadcrumbList') script.remove();
    } catch {
      continue;
    }
  }
}

function injectToolBreadcrumb(
  document,
  lang,
  toolName,
  toolUrl,
  label = 'Breadcrumb'
) {
  const h1 = document.querySelector('h1[data-i18n^="tools:"]');
  if (!h1) return;
  if (document.querySelector(`[${BREADCRUMB_MARKER}]`)) return;
  removeStaticBreadcrumbLd(document);

  const homeUrl = buildUrl(lang === 'en' ? '' : lang, '');

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', label);
  nav.setAttribute(BREADCRUMB_MARKER, '');
  nav.setAttribute('data-no-i18n', '');
  nav.className = 'text-sm text-gray-400 mb-4';

  const homeLink = document.createElement('a');
  homeLink.href = buildLocalHomeHref(lang);
  homeLink.className = 'hover:text-indigo-300';
  homeLink.textContent = BRAND_NAME;

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
        name: BRAND_NAME,
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
  script.textContent = serializeJsonLd(ld);
  document.body.appendChild(script);
}

function resolveToolName(translationKey, langTools) {
  const langEntry = langTools && langTools[translationKey];
  if (langEntry && langEntry.name) return langEntry.name;
  const enEntry = ENGLISH_TOOLS[translationKey];
  return enEntry && enEntry.name ? enEntry.name : null;
}

function translationKeyForFile(filenameNoExt) {
  return KEY_MAPPING[filenameNoExt] || toCamelCase(filenameNoExt);
}

let isPageTranslated = null;

function translatedLangsForFile(filenameNoExt, translations) {
  if (!isPageTranslated) {
    const toolsByLang = {};
    for (const lang of languages) {
      toolsByLang[lang] = translations[lang] ? translations[lang].tools : {};
    }
    isPageTranslated = createTranslationChecker(
      toolsByLang,
      translationKeyForFile
    );
  }
  return languages.filter((l) => isPageTranslated(filenameNoExt, l));
}

function processFileForLanguage(
  originalContent,
  file,
  lang,
  translations,
  langDir,
  translatedLangs
) {
  const filenameNoExt = file.replace('.html', '');
  const translationKey = translationKeyForFile(filenameNoExt);
  const isTranslated = translatedLangs.includes(lang);

  const { tools } = translations[lang];
  const dom = new JSDOM(originalContent);
  const document = dom.window.document;

  document.documentElement.lang = lang;
  document.documentElement.dir = ['ar', 'fa'].includes(lang) ? 'rtl' : 'ltr';
  document.querySelector('script[data-language-redirect]')?.remove();
  if (ENGLISH_ONLY_PAGES.has(filenameNoExt)) {
    const englishContent = document.getElementById('app');
    englishContent?.setAttribute('lang', 'en');
    englishContent?.setAttribute('dir', 'ltr');
  }

  const metaContent = (selector) =>
    document.querySelector(selector)?.getAttribute('content') ?? null;
  const englishMeta = {
    title: document.title,
    description: metaContent('meta[name="description"]'),
  };

  applyServerTranslations(document, translations[lang]);
  const contentStats = processPage(document, filenameNoExt, {
    translate: (id) => translations[lang].content[id] || null,
  });
  contentTotals[lang] ??= { found: 0, translated: 0, invalid: 0 };
  contentTotals[lang].found += contentStats.found;
  contentTotals[lang].translated += contentStats.translated;
  contentTotals[lang].invalid += contentStats.invalid.length;

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

  const titleTranslated = document.title !== englishMeta.title;
  const descriptionTranslated =
    metaContent('meta[name="description"]') !== englishMeta.description;

  if (title && !titleTranslated) {
    document.title = title;
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) metaTitle.content = title;
    const metaTwitterTitle = document.querySelector(
      'meta[name="twitter:title"]'
    );
    if (metaTwitterTitle) metaTwitterTitle.content = title;
  }

  if (description && !descriptionTranslated) {
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

  if (isTranslated) {
    translatedLangs.forEach((l) => {
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
  }

  const englishUrl = buildUrl('', pagePath);
  const localizedUrl = buildUrl(lang, pagePath);
  const canonicalUrl = isTranslated ? localizedUrl : englishUrl;
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
    injectToolBreadcrumb(
      document,
      lang,
      localizedToolName,
      localizedUrl,
      translations[lang].common?.nav?.breadcrumb || 'Breadcrumb'
    );
  }

  if (docsLanguages.includes(lang)) {
    const localDocs = `${BASE_PATH}/docs`;
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      for (const docsUrl of [OFFICIAL_DOCS_URL, localDocs]) {
        if (href === docsUrl || href?.startsWith(`${docsUrl}/`)) {
          link.setAttribute(
            'href',
            href.replace(docsUrl, `${docsUrl}/${lang}`)
          );
          break;
        }
      }
    });
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

    const hrefWithoutBase =
      BASE_PATH && href.startsWith(`${BASE_PATH}/`)
        ? href.slice(BASE_PATH.length)
        : href;
    if (/^\/(blog|docs)(\/|$)/.test(hrefWithoutBase)) {
      return;
    }

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

    link.setAttribute(
      'href',
      newHref.replace(/^([^?#]*[^/?#])\/(?=$|[?#])/, '$1')
    );
  });

  const result = dom.serialize();

  dom.window.close();

  fs.writeFileSync(path.join(langDir, file), result);
}

function updateEnglishFile(filePath, originalContent, translatedLangs) {
  const filenameNoExt = path.basename(filePath, '.html');
  const dom = new JSDOM(originalContent);
  const document = dom.window.document;

  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  const pagePath = filenameNoExt === 'index' ? '' : filenameNoExt;
  const canonicalUrl = buildUrl('', pagePath);

  translatedLangs.forEach((l) => {
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
    const translatedLangs = translatedLangsForFile(
      file.replace('.html', ''),
      translations
    );

    for (const lang of languages) {
      if (lang === 'en') continue;

      const langDir = path.join(DIST_DIR, lang);

      processFileForLanguage(
        originalContent,
        file,
        lang,
        translations,
        langDir,
        translatedLangs
      );

      processed++;
      if (processed % 10 === 0 || processed === total) {
        console.log(`   Progress: ${processed}/${total} pages`);
      }

      // Clean up JSDOM instances
      await new Promise((resolve) => setImmediate(resolve));
    }

    updateEnglishFile(filePath, originalContent, translatedLangs);
  }

  const covered = Object.entries(contentTotals).filter(
    ([, totals]) => totals.translated > 0
  );
  if (covered.length > 0) {
    console.log(
      `   Page content translated: ${covered
        .map(
          ([lang, totals]) =>
            `${lang} ${Math.round((totals.translated / totals.found) * 100)}%${totals.invalid ? ` (${totals.invalid} rejected)` : ''}`
        )
        .join(', ')}`
    );
  }

  console.log('✅ i18n pages generated successfully!');
}

generateI18nPages().catch((err) => {
  console.error('❌ i18n page generation failed:', err);
  process.exit(1);
});
