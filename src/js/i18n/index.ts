export {
  initI18n,
  onPageReady,
  t,
  trText,
  trHtml,
  changeLanguage,
  applyTranslations,
  rewriteLinks,
  getLanguageFromUrl,
  supportedLanguages,
  languageNames,
} from './i18n';
export type { SupportedLanguage } from './i18n';
export {
  createLanguageSwitcher,
  injectLanguageSwitcher,
} from './language-switcher';
