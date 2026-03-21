import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createConfiguredTesseractWorker,
  getPDFDocument,
  getFontForLanguage,
  parseHocrDocument,
} = vi.hoisted(() => ({
  createConfiguredTesseractWorker: vi.fn(),
  getPDFDocument: vi.fn(),
  getFontForLanguage: vi.fn(),
  parseHocrDocument: vi.fn(),
}));

const mockWorker = {
  setParameters: vi.fn(),
  recognize: vi.fn(),
  terminate: vi.fn(),
};

const mockPdfPage = {
  getViewport: vi.fn(() => ({ width: 200, height: 100 })),
  render: vi.fn(() => ({ promise: Promise.resolve() })),
};

const mockPdfOutputPage = {
  drawImage: vi.fn(),
  drawText: vi.fn(),
};

const mockPdfDoc = {
  registerFontkit: vi.fn(),
  embedFont: vi.fn(async () => ({ widthOfTextAtSize: vi.fn(() => 12) })),
  addPage: vi.fn(() => mockPdfOutputPage),
  embedPng: vi.fn(async () => ({ id: 'png' })),
  save: vi.fn(async () => new Uint8Array([1, 2, 3])),
};

vi.mock('../js/utils/tesseract-runtime', () => ({
  createConfiguredTesseractWorker,
}));

vi.mock('../js/utils/helpers.js', () => ({
  getPDFDocument,
}));

vi.mock('../js/utils/font-loader.js', () => ({
  getFontForLanguage,
}));

vi.mock('../js/utils/hocr-transform.js', () => ({
  parseHocrDocument,
  calculateWordTransform: vi.fn(),
  calculateSpaceTransform: vi.fn(),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(async () => mockPdfDoc),
  },
  StandardFonts: {
    Helvetica: 'Helvetica',
  },
  rgb: vi.fn(() => ({ r: 0, g: 0, b: 0 })),
}));

vi.mock('@pdf-lib/fontkit', () => ({
  default: {},
}));

import { performOcr } from '../js/utils/ocr';

describe('performOcr', () => {
  const originalCreateElement = document.createElement.bind(document);
  const originalFileReader = globalThis.FileReader;

  beforeEach(() => {
    createConfiguredTesseractWorker.mockReset();
    getPDFDocument.mockReset();
    getFontForLanguage.mockReset();
    parseHocrDocument.mockReset();

    mockWorker.setParameters.mockReset();
    mockWorker.recognize.mockReset();
    mockWorker.terminate.mockReset();
    mockPdfPage.getViewport.mockClear();
    mockPdfPage.render.mockClear();
    mockPdfOutputPage.drawImage.mockClear();
    mockPdfOutputPage.drawText.mockClear();
    mockPdfDoc.registerFontkit.mockClear();
    mockPdfDoc.embedFont.mockClear();
    mockPdfDoc.addPage.mockClear();
    mockPdfDoc.embedPng.mockClear();
    mockPdfDoc.save.mockClear();

    createConfiguredTesseractWorker.mockResolvedValue(mockWorker);
    getPDFDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn(async () => mockPdfPage),
      }),
    });
    getFontForLanguage.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mockWorker.recognize.mockResolvedValue({
      data: {
        text: 'Recognized text',
        hocr: '',
      },
    });

    document.createElement = ((tagName: string) => {
      if (tagName !== 'canvas') {
        return originalCreateElement(tagName);
      }

      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          canvas: { width: 200, height: 100 },
          getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
          putImageData: vi.fn(),
        })),
        toBlob: vi.fn((callback: (blob: Blob) => void) => {
          callback(
            new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })
          );
        }),
      } as unknown as HTMLCanvasElement;
    }) as typeof document.createElement;

    globalThis.FileReader = class {
      result: ArrayBuffer = new Uint8Array([1, 2, 3]).buffer;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;

      readAsArrayBuffer() {
        this.onload?.();
      }
    } as unknown as typeof FileReader;
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    globalThis.FileReader = originalFileReader;
  });

  it('uses the configured Tesseract worker and terminates it after OCR completes', async () => {
    const result = await performOcr(new Uint8Array([1, 2, 3]), {
      language: 'eng',
      resolution: 2,
      binarize: false,
      whitelist: '',
    });

    expect(createConfiguredTesseractWorker).toHaveBeenCalledWith(
      'eng',
      1,
      expect.any(Function)
    );
    expect(mockWorker.setParameters).toHaveBeenCalledWith({
      tessjs_create_hocr: '1',
      tessedit_pageseg_mode: '3',
    });
    expect(mockWorker.recognize).toHaveBeenCalledTimes(1);
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
    expect(result.fullText).toContain('Recognized text');
    expect(result.pdfBytes).toBeInstanceOf(Uint8Array);
  });

  it('terminates the Tesseract worker when OCR fails', async () => {
    mockWorker.recognize.mockRejectedValueOnce(new Error('ocr failed'));

    await expect(
      performOcr(new Uint8Array([1, 2, 3]), {
        language: 'eng',
        resolution: 2,
        binarize: false,
        whitelist: '',
      })
    ).rejects.toThrow('ocr failed');

    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
  });
});
