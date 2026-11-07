import { describe, it, expect, vi, beforeEach } from 'vitest';

const blockStorage = () => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    },
  });
};

const failLocaleFetches = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new TypeError('NetworkError')))
  );
};

describe('i18n resilience on hardened browsers', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('getLanguageFromUrl does not throw when localStorage access is blocked', async () => {
    blockStorage();
    const { getLanguageFromUrl } = await import('../js/i18n/i18n');
    expect(() => getLanguageFromUrl()).not.toThrow();
    expect(getLanguageFromUrl()).toBe('ar');
  });

  it('initI18n succeeds with blocked storage and failing locale fetches', async () => {
    blockStorage();
    failLocaleFetches();
    const { initI18n, t } = await import('../js/i18n/i18n');
    await expect(initI18n()).resolves.toBeDefined();
    expect(t('simpleMode.title')).not.toBe('simpleMode.title');
  });

  it('t() serves bundled Arabic instead of raw keys when fetches fail', async () => {
    failLocaleFetches();
    const { initI18n, t } = await import('../js/i18n/i18n');
    await initI18n();
    expect(t('simpleMode.title')).toBe('أدوات PDF');
    expect(t('tools:pdfToTiff.name')).toBe('PDF إلى TIFF');
    expect(t('common.error')).not.toBe('common.error');
  });
});
