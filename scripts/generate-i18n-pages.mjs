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
const BRAND_NAME = process.env.VITE_BRAND_NAME || 'BentoPDF';
const BRAND_LOGO = (
  process.env.VITE_BRAND_LOGO || 'images/favicon.svg'
).replace(/^\/+/, '');
const SOURCE_REPOSITORY_URL = process.env.VITE_SOURCE_REPOSITORY_URL || '';

const DEFAULT_SAME_AS =
  BRAND_NAME === 'BentoPDF' && SOURCE_REPOSITORY_URL
    ? [
        SOURCE_REPOSITORY_URL,
        'https://x.com/BentoPDF',
        'https://www.linkedin.com/company/bentopdf/',
        'https://www.instagram.com/thebentopdf/',
      ]
    : SOURCE_REPOSITORY_URL
      ? [SOURCE_REPOSITORY_URL]
      : [];

const allLanguages = fs.readdirSync(LOCALES_DIR).filter((file) => {
  return fs.statSync(path.join(LOCALES_DIR, file)).isDirectory();
});
const languages =
  process.env.HIREPDF_RU_ONLY === 'true' ||
  process.env.HIREFPDF_RU_ONLY === 'true' ||
  process.env.HIREF_PDF_RU_ONLY === 'true'
    ? ['ru']
    : allLanguages;
const isSingleLanguageBuild = languages.length === 1;

const toCamelCase = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const KEY_MAPPING = {
  index: 'home',
  404: 'notFound',
  bookmark: 'editBookmarks',
  'overlay-pdf': 'pdfOverlay',
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

const ORGANIZATION_LD_MARKER = 'data-hirepdf-organization';

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
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/${BRAND_LOGO}`,
  };
  if (DEFAULT_SAME_AS.length > 0) {
    data.sameAs = DEFAULT_SAME_AS;
  }
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute(ORGANIZATION_LD_MARKER, '');
  script.textContent = JSON.stringify(data, null, 2);
  document.body.appendChild(script);
}

const BREADCRUMB_MARKER = 'data-hirepdf-breadcrumb';

function injectToolBreadcrumb(document, lang, toolName, toolUrl) {
  const h1 = document.querySelector('h1[data-i18n^="tools:"]');
  if (!h1) return;
  if (document.querySelector(`[${BREADCRUMB_MARKER}]`)) return;

  const homeUrl = buildUrl(
    isSingleLanguageBuild || lang === 'en' ? '' : lang,
    ''
  );

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.setAttribute(BREADCRUMB_MARKER, '');
  nav.className = 'text-sm text-gray-400 mb-4';

  const homeLink = document.createElement('a');
  homeLink.href = homeUrl;
  homeLink.className = 'hover:text-slate-200';
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
  script.textContent = JSON.stringify(ld, null, 2);
  document.body.appendChild(script);
}

function resolveToolName(translationKey, langTools) {
  const langEntry = langTools && langTools[translationKey];
  if (langEntry && langEntry.name) return langEntry.name;
  const enEntry = ENGLISH_TOOLS[translationKey];
  return enEntry && enEntry.name ? enEntry.name : null;
}

function getNestedValue(source, pathKey) {
  return pathKey.split('.').reduce((value, part) => {
    if (value && typeof value === 'object' && part in value) {
      return value[part];
    }
    return null;
  }, source);
}

function resolveTranslation(resources, key) {
  const [namespace, pathKey] = key.includes(':')
    ? key.split(':', 2)
    : ['common', key];
  const source = namespace === 'tools' ? resources.tools : resources.common;
  const value = getNestedValue(source, pathKey);
  return typeof value === 'string' ? value : null;
}

function applyStaticTranslations(document, resources) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    const value = resolveTranslation(resources, key);
    if (value) element.textContent = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (!key) return;
    const value = resolveTranslation(resources, key);
    if (value) element.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (!key) return;
    const value = resolveTranslation(resources, key);
    if (value) element.setAttribute('title', value);
  });
}

function setMetaContent(document, selector, value) {
  document.querySelectorAll(selector).forEach((meta) => {
    meta.content = value;
  });
}

function getVisibleRussianTitle(document) {
  const h1 = document.querySelector('h1');
  const text = h1?.textContent?.replace(/\s+/g, ' ').trim();
  return text && /[А-Яа-яЁё]/.test(text) ? text : null;
}

function getGenericToolTitle(document) {
  return `${getVisibleRussianTitle(document) || 'PDF-инструмент'} - ${BRAND_NAME}`;
}

function getGenericToolDescription() {
  return `Бесплатный PDF-инструмент ${BRAND_NAME} работает в браузере и помогает быстро подготовить документ без установки программ.`;
}

function removeLegacyStructuredData(document) {
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((node) => {
      try {
        const parsed = JSON.parse(node.textContent || '');
        const types = Array.isArray(parsed['@type'])
          ? parsed['@type']
          : [parsed['@type']];
        if (
          types.some((type) =>
            [
              'Organization',
              'SoftwareApplication',
              'HowTo',
              'FAQPage',
            ].includes(type)
          )
        ) {
          node.remove();
        }
      } catch {
        return;
      }
    });
}

function removeSectionByDataI18n(document, key) {
  const heading = document.querySelector(`[data-i18n="${key}"]`);
  heading?.closest('section')?.remove();
}

function removeEnglishSeoSections(document) {
  removeSectionByDataI18n(document, 'howItWorks.title');
  removeSectionByDataI18n(document, 'relatedTools.title');
  removeSectionByDataI18n(document, 'faq.sectionTitle');
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
  const isToolPage = Boolean(document.querySelector('h1[data-i18n^="tools:"]'));

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  applyStaticTranslations(document, translations[lang]);

  if (isSingleLanguageBuild) {
    removeLegacyStructuredData(document);
    removeEnglishSeoSections(document);
  }

  let title = null;
  let description = null;

  if (tools[translationKey]) {
    title =
      tools[translationKey].pageTitle ||
      (tools[translationKey].name
        ? `${tools[translationKey].name} - ${BRAND_NAME}`
        : null);
    description = tools[translationKey].subtitle;
  }

  if (isToolPage && !title) {
    title = getGenericToolTitle(document);
  }

  if (isToolPage && !description) {
    description = getGenericToolDescription();
  }

  if (title) {
    document.title = title;
    setMetaContent(document, 'meta[name="title"]', title);
    setMetaContent(document, 'meta[property="og:title"]', title);
    setMetaContent(document, 'meta[name="twitter:title"]', title);
  }

  if (description) {
    setMetaContent(document, 'meta[name="description"]', description);
    setMetaContent(document, 'meta[property="og:description"]', description);
    setMetaContent(document, 'meta[name="twitter:description"]', description);
  }

  if (isToolPage) {
    setMetaContent(
      document,
      'meta[name="keywords"]',
      'PDF, PDF инструменты, редактировать PDF, конвертировать PDF, HirePDF'
    );
  }

  document
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  const pagePath = filenameNoExt === 'index' ? '' : filenameNoExt;

  if (!isSingleLanguageBuild) {
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
  }

  const localizedUrl = isSingleLanguageBuild
    ? buildUrl('', pagePath)
    : buildUrl(lang, pagePath);
  const canonicalUrl = buildUrl('', pagePath);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = localizedUrl;
  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) twitterUrl.content = localizedUrl;

  injectOrganizationLd(document);

  const localizedToolName =
    resolveToolName(translationKey, tools) || getVisibleRussianTitle(document);
  if (localizedToolName) {
    injectToolBreadcrumb(document, lang, localizedToolName, localizedUrl);
  }

  if (!isSingleLanguageBuild) {
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
  }

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

  if (!isSingleLanguageBuild) {
    for (const lang of languages) {
      if (lang === 'en') continue;
      const langDir = path.join(DIST_DIR, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }
    }
  }

  let processed = 0;
  const localizedLanguages = languages.filter((lang) => lang !== 'en');
  const total = htmlFiles.length * localizedLanguages.length;

  for (const file of htmlFiles) {
    const filePath = path.join(DIST_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf-8');

    if (!isSingleLanguageBuild) {
      for (const lang of localizedLanguages) {
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
    }

    if (isSingleLanguageBuild && languages[0] !== 'en') {
      processFileForLanguage(
        originalContent,
        file,
        languages[0],
        translations,
        DIST_DIR
      );
    } else {
      updateEnglishFile(filePath, originalContent);
    }
  }

  console.log('✅ i18n pages generated successfully!');
}

generateI18nPages().catch((err) => {
  console.error('❌ i18n page generation failed:', err);
  process.exit(1);
});
