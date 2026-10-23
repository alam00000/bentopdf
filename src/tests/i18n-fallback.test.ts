import { describe, it, expect } from 'vitest';
import { t } from '../js/i18n/i18n';

describe('t() before initI18n()', () => {
  it('serves bundled English instead of undefined', () => {
    expect(t('tools:mergePdf.loader.merging')).toBe('Merging PDFs...');
    expect(t('alert.uploadPdfFirst')).toBe('Please upload a PDF first.');
    expect(t('tools:missing.key')).toBe('tools:missing.key');
  });
});

describe('applyTranslations()', () => {
  it('translates placeholders on textareas as well as inputs', async () => {
    const { applyTranslations } = await import('../js/i18n/i18n');
    document.body.innerHTML =
      '<input data-i18n-placeholder="tools:mergePdf.loader.merging">' +
      '<textarea data-i18n-placeholder="alert.uploadPdfFirst"></textarea>';
    applyTranslations();
    expect(document.querySelector('input')!.placeholder).toBe(
      'Merging PDFs...'
    );
    expect(document.querySelector('textarea')!.placeholder).toBe(
      'Please upload a PDF first.'
    );
  });
});
