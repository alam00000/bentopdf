import { describe, it, expect } from 'vitest';
import { fixPageSize, FixPageSizeOptions } from '../js/utils/pdf-operations';
import { PDFDocument, PageSizes, rgb } from 'pdf-lib';

const WHITE = { r: 1, g: 1, b: 1 };

function opts(overrides: Partial<FixPageSizeOptions> = {}): FixPageSizeOptions {
  return {
    targetSize: 'A4',
    orientation: 'auto',
    scalingMode: 'fit',
    backgroundColor: WHITE,
    ...overrides,
  };
}

async function createPdf(pages: [number, number][]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const [w, h] of pages) {
    const page = doc.addPage([w, h]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: w,
      height: h,
      color: rgb(1, 1, 1),
    });
  }
  return new Uint8Array(await doc.save());
}

async function getPageSizes(pdfBytes: Uint8Array): Promise<[number, number][]> {
  const doc = await PDFDocument.load(pdfBytes);
  return doc.getPages().map((p) => {
    const { width, height } = p.getSize();
    return [Math.round(width), Math.round(height)];
  });
}

const A4_W = Math.round(PageSizes.A4[0]);
const A4_H = Math.round(PageSizes.A4[1]);

describe('fixPageSize', () => {
  describe('orientation: auto', () => {
    it('keeps portrait target for portrait source', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'auto' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeLessThan(sizes[0][1]);
    });

    it('swaps to landscape target for landscape source', async () => {
      const pdf = await createPdf([[800, 400]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'auto' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeGreaterThan(sizes[0][1]);
    });

    it('handles mixed portrait and landscape pages', async () => {
      const pdf = await createPdf([
        [400, 600],
        [800, 400],
        [300, 500],
      ]);
      const result = await fixPageSize(pdf, opts({ orientation: 'auto' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeLessThan(sizes[0][1]);
      expect(sizes[1][0]).toBeGreaterThan(sizes[1][1]);
      expect(sizes[2][0]).toBeLessThan(sizes[2][1]);
    });

    it('keeps square pages as portrait target', async () => {
      const pdf = await createPdf([[500, 500]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'auto' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBe(A4_W);
      expect(sizes[0][1]).toBe(A4_H);
    });
  });

  describe('orientation: portrait', () => {
    it('forces portrait regardless of source orientation', async () => {
      const pdf = await createPdf([[800, 400]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'portrait' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeLessThan(sizes[0][1]);
    });

    it('keeps portrait for portrait source', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'portrait' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBe(A4_W);
      expect(sizes[0][1]).toBe(A4_H);
    });
  });

  describe('orientation: landscape', () => {
    it('forces landscape regardless of source orientation', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'landscape' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeGreaterThan(sizes[0][1]);
    });

    it('keeps landscape for landscape source', async () => {
      const pdf = await createPdf([[800, 400]]);
      const result = await fixPageSize(pdf, opts({ orientation: 'landscape' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBe(A4_H);
      expect(sizes[0][1]).toBe(A4_W);
    });
  });

  describe('target size: predefined', () => {
    it('uses A4 dimensions', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ targetSize: 'A4' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0]).toEqual([A4_W, A4_H]);
    });

    it('uses Letter dimensions', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ targetSize: 'Letter' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0]).toEqual([
        Math.round(PageSizes.Letter[0]),
        Math.round(PageSizes.Letter[1]),
      ]);
    });

    it('falls back to A4 for unknown size', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ targetSize: 'Unknown' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0]).toEqual([A4_W, A4_H]);
    });
  });

  describe('target size: custom', () => {
    it('uses custom mm dimensions', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(
        pdf,
        opts({
          targetSize: 'custom',
          customWidth: 100,
          customHeight: 200,
          customUnits: 'mm',
        })
      );
      const sizes = await getPageSizes(result);
      const expectedW = Math.round(100 * (72 / 25.4));
      const expectedH = Math.round(200 * (72 / 25.4));
      expect(sizes[0]).toEqual([expectedW, expectedH]);
    });

    it('uses custom inch dimensions', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(
        pdf,
        opts({
          targetSize: 'custom',
          customWidth: 5,
          customHeight: 8,
          customUnits: 'in',
        })
      );
      const sizes = await getPageSizes(result);
      expect(sizes[0]).toEqual([360, 576]);
    });

    it('defaults custom dimensions to 210x297mm when not provided', async () => {
      const pdf = await createPdf([[400, 600]]);
      const result = await fixPageSize(pdf, opts({ targetSize: 'custom' }));
      const sizes = await getPageSizes(result);
      expect(sizes[0]).toEqual([A4_W, A4_H]);
    });
  });

  describe('scaling mode', () => {
    it('preserves page count', async () => {
      const pdf = await createPdf([
        [400, 600],
        [500, 700],
        [300, 400],
      ]);
      const result = await fixPageSize(pdf, opts({ scalingMode: 'fit' }));
      const sizes = await getPageSizes(result);
      expect(sizes.length).toBe(3);
    });

    it('fit mode does not exceed target dimensions', async () => {
      const pdf = await createPdf([[1000, 500]]);
      const result = await fixPageSize(
        pdf,
        opts({ orientation: 'landscape', scalingMode: 'fit' })
      );
      const doc = await PDFDocument.load(result);
      const page = doc.getPages()[0];
      const { width, height } = page.getSize();
      expect(width).toBeLessThanOrEqual(A4_H + 1);
      expect(height).toBeLessThanOrEqual(A4_W + 1);
    });
  });

  describe('single page', () => {
    it('converts single page PDF', async () => {
      const pdf = await createPdf([[612, 792]]);
      const result = await fixPageSize(pdf, opts());
      const sizes = await getPageSizes(result);
      expect(sizes.length).toBe(1);
    });
  });

  describe('auto orientation with custom size', () => {
    it('swaps custom dimensions for landscape source', async () => {
      const pdf = await createPdf([[800, 400]]);
      const result = await fixPageSize(
        pdf,
        opts({
          targetSize: 'custom',
          customWidth: 100,
          customHeight: 200,
          customUnits: 'mm',
          orientation: 'auto',
        })
      );
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeGreaterThan(sizes[0][1]);
    });

    it('keeps custom dimensions for portrait source', async () => {
      const pdf = await createPdf([[400, 800]]);
      const result = await fixPageSize(
        pdf,
        opts({
          targetSize: 'custom',
          customWidth: 100,
          customHeight: 200,
          customUnits: 'mm',
          orientation: 'auto',
        })
      );
      const sizes = await getPageSizes(result);
      expect(sizes[0][0]).toBeLessThan(sizes[0][1]);
    });
  });
});
