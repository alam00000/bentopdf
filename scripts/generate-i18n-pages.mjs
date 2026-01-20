import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LOCALES_DIR = path.resolve(__dirname, '../public/locales');
const SITE_URL = process.env.SITE_URL || 'https://bentopdf.com';
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

// TODO@ALAM: Let users build only a single language
function buildUrl(langPrefix, pagePath) {
  const parts = [SITE_URL];
  if (BASE_PATH && BASE_PATH !== '') parts.push(BASE_PATH.replace(/^\//, ''));
  if (langPrefix) parts.push(langPrefix);
  if (pagePath) parts.push(pagePath.replace(/^\//, ''));
  return parts.filter(Boolean).join('/').replace(/\/+$/, '') || SITE_URL;
}

async function generateI18nPages() {
  console.log('🌍 Generating i18n pages...');
  console.log(`   SITE_URL: ${SITE_URL}`);
  console.log(`   BASE_PATH: ${BASE_PATH || '/'}`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist directory not found. Please run build first.');
    process.exit(1);
  }

  const htmlFiles = fs
    .readdirSync(DIST_DIR)
    .filter((file) => file.endsWith('.html'));

  for (const file of htmlFiles) {
    const filePath = path.join(DIST_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    const filenameNoExt = file.replace('.html', '');

    let translationKey = toCamelCase(filenameNoExt);
    if (KEY_MAPPING[filenameNoExt]) {
      translationKey = KEY_MAPPING[filenameNoExt];
    }

    for (const lang of languages) {
      if (lang === 'en') continue;

      const langDir = path.join(DIST_DIR, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      const commonPath = path.join(LOCALES_DIR, `${lang}/common.json`);
      const toolsPath = path.join(LOCALES_DIR, `${lang}/tools.json`);

      const common = fs.existsSync(commonPath)
        ? JSON.parse(fs.readFileSync(commonPath, 'utf-8'))
        : {};
      const tools = fs.existsSync(toolsPath)
        ? JSON.parse(fs.readFileSync(toolsPath, 'utf-8'))
        : {};

      const dom = new JSDOM(originalContent);
      const document = dom.window.document;

      document.documentElement.lang = lang;

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

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = buildUrl(lang, pagePath);

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
          href.startsWith('javascript:')
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
          newHref = `${lang}/${href}`;
        }

        link.setAttribute('href', newHref);
      });

      fs.writeFileSync(path.join(langDir, file), dom.serialize());
    }

    const dom = new JSDOM(originalContent);
    const document = dom.window.document;

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

    fs.writeFileSync(filePath, dom.serialize());
  }

  console.log('✅ i18n pages generated successfully!');
}

generateI18nPages().catch(console.error);
