import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createWorker } = vi.hoisted(() => ({
  createWorker: vi.fn(),
}));

vi.mock('tesseract.js', () => ({
  default: {
    createWorker,
  },
}));

import {
  buildTesseractWorkerOptions,
  createConfiguredTesseractWorker,
  getIncompleteTesseractOverrideKeys,
  hasCompleteTesseractOverrides,
  hasConfiguredTesseractOverrides,
  resolveTesseractAssetConfig,
} from '../js/utils/tesseract-runtime';
import {
  assertTesseractLanguagesAvailable,
  getAvailableTesseractLanguageEntries,
  getUnavailableTesseractLanguages,
  UnsupportedOcrLanguageError,
} from '../js/utils/tesseract-language-availability';

describe('tesseract-runtime', () => {
  beforeEach(() => {
    createWorker.mockReset();
  });

  it('normalizes self-hosted OCR asset URLs', () => {
    const config = resolveTesseractAssetConfig({
      VITE_TESSERACT_WORKER_URL:
        'https://internal.example.com/ocr/worker.min.js/',
      VITE_TESSERACT_CORE_URL: 'https://internal.example.com/ocr/core/',
      VITE_TESSERACT_LANG_URL: 'https://internal.example.com/ocr/lang-data/',
    });

    expect(config).toEqual({
      workerPath: 'https://internal.example.com/ocr/worker.min.js',
      corePath: 'https://internal.example.com/ocr/core',
      langPath: 'https://internal.example.com/ocr/lang-data',
    });
    expect(hasConfiguredTesseractOverrides(config)).toBe(true);
    expect(hasCompleteTesseractOverrides(config)).toBe(true);
  });

  it('returns logger-only options when no self-hosted OCR assets are configured', () => {
    const logger = vi.fn();

    expect(buildTesseractWorkerOptions(logger, {})).toEqual({ logger });
    expect(
      hasConfiguredTesseractOverrides(resolveTesseractAssetConfig({}))
    ).toBe(false);
  });

  it('throws on partial OCR asset configuration', () => {
    const env = {
      VITE_TESSERACT_WORKER_URL:
        'https://internal.example.com/ocr/worker.min.js',
      VITE_TESSERACT_CORE_URL: 'https://internal.example.com/ocr/core',
    };

    expect(
      getIncompleteTesseractOverrideKeys(resolveTesseractAssetConfig(env))
    ).toEqual(['VITE_TESSERACT_LANG_URL']);
    expect(() => buildTesseractWorkerOptions(undefined, env)).toThrow(
      'Self-hosted OCR assets are partially configured'
    );
  });

  it('passes configured OCR asset URLs to Tesseract.createWorker', async () => {
    const logger = vi.fn();
    createWorker.mockResolvedValue({ id: 'worker' });

    await createConfiguredTesseractWorker('eng', 1, logger, {
      VITE_TESSERACT_WORKER_URL:
        'https://internal.example.com/ocr/worker.min.js',
      VITE_TESSERACT_CORE_URL: 'https://internal.example.com/ocr/core',
      VITE_TESSERACT_LANG_URL: 'https://internal.example.com/ocr/lang-data',
    });

    expect(createWorker).toHaveBeenCalledWith('eng', 1, {
      logger,
      workerPath: 'https://internal.example.com/ocr/worker.min.js',
      corePath: 'https://internal.example.com/ocr/core',
      langPath: 'https://internal.example.com/ocr/lang-data',
      gzip: true,
    });
  });

  it('filters OCR language entries when the build restricts bundled languages', () => {
    expect(
      getAvailableTesseractLanguageEntries({
        VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
      })
    ).toEqual([
      ['eng', 'English'],
      ['deu', 'German'],
    ]);
  });

  it('reports unavailable OCR languages for restricted air-gap builds', () => {
    expect(
      getUnavailableTesseractLanguages('eng+fra', {
        VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
      })
    ).toEqual(['fra']);

    expect(() =>
      assertTesseractLanguagesAvailable('eng+fra', {
        VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
      })
    ).toThrow(UnsupportedOcrLanguageError);
  });

  it('blocks worker creation when OCR requests an unbundled language', async () => {
    await expect(
      createConfiguredTesseractWorker('fra', 1, undefined, {
        VITE_TESSERACT_AVAILABLE_LANGUAGES: 'eng,deu',
      })
    ).rejects.toThrow('This BentoPDF build only bundles OCR data for');

    expect(createWorker).not.toHaveBeenCalled();
  });
});
