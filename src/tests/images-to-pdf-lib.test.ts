import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('heic2any', () => ({
  default: vi.fn(async ({ blob }: { blob: Blob }) => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return new Blob([bytes], { type: 'image/png' });
  }),
}));

const mockEmbedJpg = vi.fn();
const mockEmbedPng = vi.fn();
const mockDrawImage = vi.fn();
const mockAddPage = vi.fn();
const mockSave = vi.fn();

vi.mock('pdf-lib', () => {
  return {
    PDFDocument: {
      create: vi.fn(async () => ({
        embedJpg: mockEmbedJpg,
        embedPng: mockEmbedPng,
        addPage: mockAddPage,
        save: mockSave,
      })),
    },
  };
});

import {
  normalizeImageToEmbeddable,
  convertImagesToPdfFile,
} from '../js/utils/images-to-pdf-lib';

function makeFile(name: string, type: string, bytes = [1, 2, 3]): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('normalizeImageToEmbeddable', () => {
  beforeEach(() => {
    mockEmbedJpg.mockReset();
    mockEmbedPng.mockReset();
    mockDrawImage.mockReset();
    mockAddPage.mockReset();
    mockSave.mockReset();
  });

  it('passes through JPG bytes unchanged when MIME is image/jpeg', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', [0xff, 0xd8, 0xff, 0xe0]);
    const result = await normalizeImageToEmbeddable(file);
    expect(result.format).toBe('jpg');
    expect(Array.from(result.bytes)).toEqual([0xff, 0xd8, 0xff, 0xe0]);
  });

  it('passes through JPG by extension when MIME is missing', async () => {
    const file = makeFile('photo.jpeg', '', [0xff, 0xd8]);
    const result = await normalizeImageToEmbeddable(file);
    expect(result.format).toBe('jpg');
  });

  it('passes through PNG bytes unchanged when MIME is image/png', async () => {
    const file = makeFile('scan.png', 'image/png', [0x89, 0x50, 0x4e, 0x47]);
    const result = await normalizeImageToEmbeddable(file);
    expect(result.format).toBe('png');
    expect(Array.from(result.bytes)).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('passes through PNG by uppercase extension when MIME is missing', async () => {
    const file = makeFile('SCAN.PNG', '', [0x89, 0x50]);
    const result = await normalizeImageToEmbeddable(file);
    expect(result.format).toBe('png');
  });

  describe('canvas-decode path (non-JPG/PNG formats)', () => {
    const originalCreateElement = document.createElement.bind(document);
    const originalImage = globalThis.Image;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const revokeSpy = vi.fn();

    beforeEach(() => {
      revokeSpy.mockReset();

      URL.createObjectURL = vi.fn(() => 'blob:test');
      URL.revokeObjectURL = revokeSpy;

      globalThis.Image = class {
        naturalWidth = 100;
        naturalHeight = 50;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_: string) {
          setTimeout(() => this.onload?.(), 0);
        }
      } as unknown as typeof Image;

      document.createElement = ((tagName: string) => {
        if (tagName !== 'canvas') {
          return originalCreateElement(tagName);
        }
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({ drawImage: vi.fn() })),
          toBlob: vi.fn((cb: (b: Blob) => void) => {
            cb(new Blob([new Uint8Array([0x89, 0x50])], { type: 'image/png' }));
          }),
        } as unknown as HTMLCanvasElement;
      }) as typeof document.createElement;
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
      globalThis.Image = originalImage;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it('decodes a BMP through canvas and returns PNG bytes', async () => {
      const file = makeFile('scan.bmp', 'image/bmp');
      const result = await normalizeImageToEmbeddable(file);
      expect(result.format).toBe('png');
      expect(Array.from(result.bytes)).toEqual([0x89, 0x50]);
    });

    it('decodes a TIFF through canvas', async () => {
      const file = makeFile('page.tiff', 'image/tiff');
      const result = await normalizeImageToEmbeddable(file);
      expect(result.format).toBe('png');
    });

    it('revokes the object URL after success', async () => {
      const file = makeFile('scan.bmp', 'image/bmp');
      await normalizeImageToEmbeddable(file);
      expect(revokeSpy).toHaveBeenCalledWith('blob:test');
    });

    it('revokes the object URL even on Image decode error', async () => {
      globalThis.Image = class {
        naturalWidth = 0;
        naturalHeight = 0;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_: string) {
          setTimeout(() => this.onerror?.(), 0);
        }
      } as unknown as typeof Image;

      const file = makeFile('broken.gif', 'image/gif');
      await expect(normalizeImageToEmbeddable(file)).rejects.toThrow(
        /تعذر فك ترميز الصورة/
      );
      expect(revokeSpy).toHaveBeenCalledWith('blob:test');
    });

    it('rejects when canvas getContext returns null', async () => {
      document.createElement = ((tagName: string) => {
        if (tagName !== 'canvas') {
          return originalCreateElement(tagName);
        }
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => null),
          toBlob: vi.fn(),
        } as unknown as HTMLCanvasElement;
      }) as typeof document.createElement;

      const file = makeFile('scan.bmp', 'image/bmp');
      await expect(normalizeImageToEmbeddable(file)).rejects.toThrow(
        /سياق Canvas غير متاح/
      );
      expect(revokeSpy).toHaveBeenCalled();
    });

    it('rejects when canvas.toBlob returns null', async () => {
      document.createElement = ((tagName: string) => {
        if (tagName !== 'canvas') {
          return originalCreateElement(tagName);
        }
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({ drawImage: vi.fn() })),
          toBlob: vi.fn((cb: (b: Blob | null) => void) => cb(null)),
        } as unknown as HTMLCanvasElement;
      }) as typeof document.createElement;

      const file = makeFile('scan.bmp', 'image/bmp');
      await expect(normalizeImageToEmbeddable(file)).rejects.toThrow(
        /فشل Canvas toBlob/
      );
      expect(revokeSpy).toHaveBeenCalled();
    });
  });
});

describe('convertImagesToPdfFile', () => {
  beforeEach(() => {
    mockEmbedJpg.mockReset();
    mockEmbedPng.mockReset();
    mockDrawImage.mockReset();
    mockAddPage.mockReset();
    mockSave.mockReset();

    mockEmbedJpg.mockResolvedValue({ width: 300, height: 200 });
    mockEmbedPng.mockResolvedValue({ width: 600, height: 400 });
    mockAddPage.mockReturnValue({ drawImage: mockDrawImage });
    mockSave.mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46]));
  });

  it('embeds a single JPG as one page and names file after image', async () => {
    const file = makeFile('vacation.jpg', 'image/jpeg', [0xff, 0xd8]);
    const result = await convertImagesToPdfFile([file]);

    expect(mockEmbedJpg).toHaveBeenCalledTimes(1);
    expect(mockEmbedPng).not.toHaveBeenCalled();
    expect(mockAddPage).toHaveBeenCalledWith([300, 200]);
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.objectContaining({ width: 300, height: 200 }),
      { x: 0, y: 0, width: 300, height: 200 }
    );
    expect(result.name).toBe('vacation.pdf');
    expect(result.type).toBe('application/pdf');
  });

  it('embeds a single PNG and names file after image', async () => {
    const file = makeFile('scan.png', 'image/png', [0x89, 0x50]);
    const result = await convertImagesToPdfFile([file]);

    expect(mockEmbedPng).toHaveBeenCalledTimes(1);
    expect(mockEmbedJpg).not.toHaveBeenCalled();
    expect(mockAddPage).toHaveBeenCalledWith([600, 400]);
    expect(result.name).toBe('scan.pdf');
  });

  it('embeds multiple images and uses generic filename', async () => {
    const files = [
      makeFile('a.jpg', 'image/jpeg'),
      makeFile('b.png', 'image/png'),
      makeFile('c.jpg', 'image/jpeg'),
    ];
    const result = await convertImagesToPdfFile(files);

    expect(mockEmbedJpg).toHaveBeenCalledTimes(2);
    expect(mockEmbedPng).toHaveBeenCalledTimes(1);
    expect(mockAddPage).toHaveBeenCalledTimes(3);
    expect(result.name).toMatch(/^images-\d+\.pdf$/);
  });

  it('produces a PDF File with correct MIME type', async () => {
    const file = makeFile('a.jpg', 'image/jpeg');
    const result = await convertImagesToPdfFile([file]);
    expect(result.type).toBe('application/pdf');
    expect(result).toBeInstanceOf(File);
  });

  it('strips the original extension when generating single-file name', async () => {
    const file = makeFile('photo.JPEG', 'image/jpeg');
    const result = await convertImagesToPdfFile([file]);
    expect(result.name).toBe('photo.pdf');
  });

  it('propagates errors from pdf-lib embed step', async () => {
    mockEmbedJpg.mockRejectedValueOnce(new Error('embed failed'));
    const file = makeFile('bad.jpg', 'image/jpeg');
    await expect(convertImagesToPdfFile([file])).rejects.toThrow(
      /embed failed/
    );
  });
});
