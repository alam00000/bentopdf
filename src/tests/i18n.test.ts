import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  initI18n,
  getLanguageFromUrl,
  t,
  trText,
  applyTranslations,
  rewriteLinks,
} from '@/js/i18n/i18n';

afterEach(() => {
  vi.unstubAllEnvs();
  document.body.innerHTML = '';
});
describe('Arabic-only interface', () => {
  it('always uses Arabic regardless of URL, deployment defaults or saved preference', () => {
    vi.stubEnv('VITE_DEFAULT_LANGUAGE', 'de');
    localStorage.setItem('pixelpdf-language', 'fr');
    expect(getLanguageFromUrl()).toBe('ar');
  });
  it('bundles Arabic copy without an English fallback', async () => {
    await initI18n();
    expect(t('simpleMode.title')).toBe('أدوات PDF');
    expect(trText('Add More Files')).toBe('إضافة ملفات أخرى');
    expect(trText('Page {{n}}', { n: 3 })).not.toContain('{{n}}');
  });
  it('forces RTL and translates labels, placeholders and tooltips', async () => {
    await initI18n();
    document.body.innerHTML =
      '<span data-i18n="nav.home"></span><input data-i18n-placeholder="tools.searchPlaceholder"><button data-i18n-title="nav.home"></button>';
    applyTranslations();
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.querySelector('span')?.textContent).toBe('الرئيسية');
    expect(document.querySelector('input')?.placeholder).toMatch(
      /[\u0600-\u06ff]/
    );
    expect(document.querySelector('button')?.title).toBe('الرئيسية');
  });
  it('keeps canonical routes and integrations intact', () => {
    document.body.innerHTML =
      '<a href="/merge-pdf">دمج</a><a href="https://example.com/api">رابط</a>';
    rewriteLinks();
    expect(document.querySelector('a')?.getAttribute('href')).toBe(
      '/merge-pdf'
    );
  });
});
