import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { setStoredItem } from '../utils/safe-storage.js';
import { fillPlaceholders } from './placeholders.js';
import enCommon from '../../../public/locales/en/common.json';
import enTools from '../../../public/locales/en/tools.json';

// Supported languages
export const supportedLanguages = [
  'en',
  'ar',
  'be',
  'ru',
  'fr',
  'de',
  'es',
  'zh',
  'zh-TW',
  'vi',
  'tr',
  'id',
  'it',
  'pt',
  'pl',
  'nl',
  'da',
  'sv',
  'ko',
  'ja',
  'uk',
  'sk',
  'ca',
  'fa',
] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  be: 'Беларуская',
  ru: 'Русский',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  zh: '中文',
  'zh-TW': '繁體中文（台灣）',
  vi: 'Tiếng Việt',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  pt: 'Português',
  pl: 'Polski',
  nl: 'Nederlands',
  da: 'Dansk',
  sv: 'Svenska',
  ko: '한국어',
  ja: '日本語',
  uk: 'Українська',
  sk: 'Slovenčina',
  ca: 'Català',
  fa: 'فارسی',
};

export const getLanguageFromUrl = (): SupportedLanguage => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let path = window.location.pathname;

  if (basePath && basePath !== '/' && path.startsWith(basePath)) {
    path = path.slice(basePath.length) || '/';
  }

  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  const langMatch = path.match(
    /^\/(en|ar|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|nl|be|da|ko|sv|ru|ja|uk|sk|ca|fa)(?:\/|$)/
  );
  if (
    langMatch &&
    supportedLanguages.includes(langMatch[1] as SupportedLanguage)
  ) {
    return langMatch[1] as SupportedLanguage;
  }

  return 'en';
};

export const LANGUAGE_CHOICE_KEY = 'bentopdf-language';

let initPromise: Promise<typeof i18next> | null = null;

const runInit = async (): Promise<typeof i18next> => {
  const currentLang = getLanguageFromUrl();

  await i18next.use(HttpBackend).init({
    lng: currentLang,
    fallbackLng: 'en',
    supportedLngs: supportedLanguages as unknown as string[],
    ns: currentLang === 'en' ? ['common', 'tools'] : ['common', 'tools', 'ui'],
    defaultNS: 'common',
    preload: [currentLang],
    partialBundledLanguages: true,
    resources: {
      en: {
        common: enCommon,
        tools: enTools,
        ui: {},
      },
    },
    backend: {
      loadPath: `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}locales/{{lng}}/{{ns}}.json`,
    },
    interpolation: {
      escapeValue: false,
    },
  });

  await i18next.loadNamespaces('tools');
  if (currentLang !== 'en') {
    try {
      await i18next.loadNamespaces('ui');
    } catch (error) {
      console.warn('[i18n] Could not load interface messages:', error);
    }
  }

  return i18next;
};

export const initI18n = (): Promise<typeof i18next> => {
  initPromise ??= runInit();
  return initPromise;
};

const domReady = (): Promise<void> =>
  document.readyState === 'loading'
    ? new Promise((resolve) =>
        document.addEventListener('DOMContentLoaded', () => resolve(), {
          once: true,
        })
      )
    : Promise.resolve();

const I18N_READY_TIMEOUT_MS = 5000;

export const onPageReady = (callback: () => void | Promise<void>): void => {
  const i18nReady = Promise.race([
    initI18n().then(
      (): void => undefined,
      (): void => undefined
    ),
    new Promise<void>((resolve) => setTimeout(resolve, I18N_READY_TIMEOUT_MS)),
  ]);
  const holdDrop = (event: DragEvent) => event.preventDefault();
  window.addEventListener('dragover', holdDrop);
  window.addEventListener('drop', holdDrop);
  void Promise.all([domReady(), i18nReady]).then(() => {
    window.removeEventListener('dragover', holdDrop);
    window.removeEventListener('drop', holdDrop);
    return callback();
  });
};

export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18next.t(key, options);
};

export const hasKey = (key: string): boolean => i18next.exists(key);

export const trText = (
  text: string,
  params?: Record<string, string | number>
): string => {
  const language = i18next.language;
  let template = text;
  if (i18next.isInitialized && language && language !== 'en') {
    const translated = i18next.getResource(language, 'ui', text, {
      keySeparator: false,
    });
    if (typeof translated === 'string' && translated) template = translated;
  }
  return fillPlaceholders(template, params);
};

const escapeForHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const trHtml = (
  text: string,
  params?: Record<string, string | number>
): string => escapeForHtml(trText(text, params));

export const changeLanguage = (lang: SupportedLanguage): void => {
  if (!supportedLanguages.includes(lang)) return;
  setStoredItem(LANGUAGE_CHOICE_KEY, lang);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  let relativePath = window.location.pathname;

  if (basePath && basePath !== '/' && relativePath.startsWith(basePath)) {
    relativePath = relativePath.slice(basePath.length) || '/';
  }

  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }

  let pagePathWithoutLang = relativePath;
  const langPrefixMatch = relativePath.match(
    /^\/(en|ar|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|nl|be|da|ko|sv|ru|ja|uk|sk|ca|fa)(\/.*)?$/
  );
  if (langPrefixMatch) {
    pagePathWithoutLang = langPrefixMatch[2] || '/';
  }

  if (!pagePathWithoutLang.startsWith('/')) {
    pagePathWithoutLang = '/' + pagePathWithoutLang;
  }

  let newRelativePath: string;
  if (lang === 'en') {
    newRelativePath = pagePathWithoutLang;
  } else {
    newRelativePath =
      pagePathWithoutLang === '/'
        ? `/${lang}`
        : `/${lang}${pagePathWithoutLang}`;
  }

  let newPath: string;
  if (basePath && basePath !== '/') {
    newPath = basePath + newRelativePath;
  } else {
    newPath = newRelativePath;
  }

  newPath = newPath.replace(/\/+/g, '/');

  const newUrl = newPath + window.location.search + window.location.hash;
  window.location.href = newUrl;
};

// Apply translations to all elements with data-i18n attribute
export const applyTranslations = (): void => {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.textContent = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      const translation = t(key);
      if (translation && translation !== key) {
        element.placeholder = translation;
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.getAttribute('data-i18n-title');
    if (key) {
      const translation = t(key);
      if (translation && translation !== key) {
        (element as HTMLElement).title = translation;
      }
    }
  });

  document.documentElement.lang = i18next.language;
  document.documentElement.dir = ['ar', 'fa'].includes(i18next.language)
    ? 'rtl'
    : 'ltr';
};

export const rewriteLinks = (): void => {
  const currentLang = getLanguageFromUrl();
  if (currentLang === 'en') return;

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const links = document.querySelectorAll('a[href]');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('data:') ||
      href.startsWith('vbscript:')
    ) {
      return;
    }

    if (href.includes('/assets/')) {
      return;
    }

    const pathOnly =
      basePath && basePath !== '/' && href.startsWith(`${basePath}/`)
        ? href.slice(basePath.length)
        : href;
    if (/^\/(blog|docs)(\/|$|[?#])/.test(pathOnly)) {
      return;
    }

    const langPrefixRegex = new RegExp(
      `^(${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})?/?(en|ar|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|nl|be|da|ko|sv|ru|ja|uk|sk|ca|fa)(/|$|[?#])`
    );
    if (langPrefixRegex.test(href)) {
      return;
    }

    let newHref: string;
    if (basePath && basePath !== '/' && href.startsWith(basePath)) {
      const pathAfterBase = href.slice(basePath.length);
      newHref = `${basePath}/${currentLang}${pathAfterBase}`;
    } else if (href.startsWith('/')) {
      if (basePath && basePath !== '/') {
        newHref = `${basePath}/${currentLang}${href}`;
      } else {
        newHref = `/${currentLang}${href}`;
      }
    } else if (href === '' || href === 'index.html') {
      if (basePath && basePath !== '/') {
        newHref = `${basePath}/${currentLang}/`;
      } else {
        newHref = `/${currentLang}/`;
      }
    } else {
      newHref = `/${currentLang}/${href}`;
    }

    newHref = newHref
      .replace(/([^:])\/+/g, '$1/')
      .replace(/^([^?#]*[^/?#])\/(?=$|[?#])/, '$1');

    link.setAttribute('href', newHref);
  });
};

export default i18next;
