import { describe, it, expect } from 'vitest';
import { t } from '../js/i18n/i18n';

describe('t() before initI18n()', () => {
  it('serves bundled English instead of undefined', () => {
    expect(t('tools:mergePdf.loader.merging')).toBe('Merging PDFs...');
    expect(t('alert.uploadPdfFirst')).toBe('Please upload a PDF first.');
    expect(t('tools:missing.key')).toBe('tools:missing.key');
  });
});
