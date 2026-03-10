import { describe, it, expect } from 'vitest';
import {
  parsePageRange,
  parseDeletePages,
  mergePdfs,
  splitPdf,
  deletePdfPages,
  rotatePdfUniform,
  rotatePdfPages,
} from '../js/utils/pdf-operations';
import { PDFDocument } from 'pdf-lib';

async function createTestPdf(pageCount: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage([612, 792]);
  }
  return new Uint8Array(await doc.save());
}

describe('pdf-operations', () => {
  describe('parsePageRange', () => {
    it('should parse single page', () => {
      expect(parsePageRange('3', 10)).toEqual([2]);
    });

    it('should parse multiple pages', () => {
      expect(parsePageRange('1,3,5', 10)).toEqual([0, 2, 4]);
    });

    it('should parse range', () => {
      expect(parsePageRange('2-5', 10)).toEqual([1, 2, 3, 4]);
    });

    it('should parse mixed pages and ranges', () => {
      expect(parsePageRange('1,3-5,8', 10)).toEqual([0, 2, 3, 4, 7]);
    });

    it('should handle spaces', () => {
      expect(parsePageRange(' 1 , 3 - 5 ', 10)).toEqual([0, 2, 3, 4]);
    });

    it('should deduplicate and sort', () => {
      expect(parsePageRange('5,3,1,3-5', 10)).toEqual([0, 2, 3, 4]);
    });

    it('should clamp start to 1', () => {
      expect(parsePageRange('0-3', 10)).toEqual([0, 1, 2]);
    });

    it('should clamp end to totalPages', () => {
      expect(parsePageRange('8-15', 10)).toEqual([7, 8, 9]);
    });

    it('should ignore pages outside bounds', () => {
      expect(parsePageRange('0,11,5', 10)).toEqual([4]);
    });

    it('should handle single page document', () => {
      expect(parsePageRange('1', 1)).toEqual([0]);
    });

    it('should handle invalid non-numeric input', () => {
      expect(parsePageRange('abc', 10)).toEqual([]);
    });

    it('should handle empty parts', () => {
      expect(parsePageRange('1,,3', 10)).toEqual([0, 2]);
    });

    it('should handle range with invalid end (NaN defaults to totalPages)', () => {
      expect(parsePageRange('3-abc', 10)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('parseDeletePages', () => {
    it('should parse single page', () => {
      expect(parseDeletePages('3', 10)).toEqual(new Set([3]));
    });

    it('should parse multiple pages', () => {
      expect(parseDeletePages('1,3,5', 10)).toEqual(new Set([1, 3, 5]));
    });

    it('should parse range', () => {
      expect(parseDeletePages('2-5', 10)).toEqual(new Set([2, 3, 4, 5]));
    });

    it('should parse mixed pages and ranges', () => {
      expect(parseDeletePages('1,3-5,8', 10)).toEqual(new Set([1, 3, 4, 5, 8]));
    });

    it('should ignore out-of-bounds pages', () => {
      expect(parseDeletePages('0,11,5', 10)).toEqual(new Set([5]));
    });

    it('should handle spaces', () => {
      expect(parseDeletePages(' 1 , 3 ', 10)).toEqual(new Set([1, 3]));
    });

    it('should clamp range to valid bounds', () => {
      expect(parseDeletePages('0-3', 10)).toEqual(new Set([1, 2, 3]));
    });

    it('should clamp range end to totalPages', () => {
      expect(parseDeletePages('8-15', 10)).toEqual(new Set([8, 9, 10]));
    });

    it('should return 1-indexed page numbers', () => {
      const result = parseDeletePages('1', 10);
      expect(result.has(1)).toBe(true);
      expect(result.has(0)).toBe(false);
    });

    it('should handle empty parts gracefully', () => {
      expect(parseDeletePages('1,,5', 10)).toEqual(new Set([1, 5]));
    });
  });

  describe('mergePdfs', () => {
    it('should merge two single-page PDFs', async () => {
      const pdf1 = await createTestPdf(1);
      const pdf2 = await createTestPdf(1);
      const merged = await mergePdfs([pdf1, pdf2]);
      const doc = await PDFDocument.load(merged);
      expect(doc.getPageCount()).toBe(2);
    });

    it('should merge multiple PDFs', async () => {
      const pdfs = await Promise.all([
        createTestPdf(2),
        createTestPdf(3),
        createTestPdf(1),
      ]);
      const merged = await mergePdfs(pdfs);
      const doc = await PDFDocument.load(merged);
      expect(doc.getPageCount()).toBe(6);
    });

    it('should handle single PDF input', async () => {
      const pdf = await createTestPdf(3);
      const merged = await mergePdfs([pdf]);
      const doc = await PDFDocument.load(merged);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should handle empty array', async () => {
      const merged = await mergePdfs([]);
      const doc = await PDFDocument.load(merged);
      expect(doc.getPageCount()).toBe(0);
    });
  });

  describe('splitPdf', () => {
    it('should extract specific pages', async () => {
      const pdf = await createTestPdf(5);
      const split = await splitPdf(pdf, [0, 2, 4]);
      const doc = await PDFDocument.load(split);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should extract single page', async () => {
      const pdf = await createTestPdf(5);
      const split = await splitPdf(pdf, [2]);
      const doc = await PDFDocument.load(split);
      expect(doc.getPageCount()).toBe(1);
    });

    it('should handle extracting all pages', async () => {
      const pdf = await createTestPdf(3);
      const split = await splitPdf(pdf, [0, 1, 2]);
      const doc = await PDFDocument.load(split);
      expect(doc.getPageCount()).toBe(3);
    });
  });

  describe('deletePdfPages', () => {
    it('should delete specified pages', async () => {
      const pdf = await createTestPdf(5);
      const result = await deletePdfPages(pdf, new Set([1, 3]));
      const doc = await PDFDocument.load(result);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should delete single page', async () => {
      const pdf = await createTestPdf(3);
      const result = await deletePdfPages(pdf, new Set([2]));
      const doc = await PDFDocument.load(result);
      expect(doc.getPageCount()).toBe(2);
    });

    it('should throw when deleting all pages', async () => {
      const pdf = await createTestPdf(2);
      await expect(deletePdfPages(pdf, new Set([1, 2]))).rejects.toThrow(
        'Cannot delete all pages'
      );
    });

    it('should ignore out-of-range page numbers', async () => {
      const pdf = await createTestPdf(3);
      const result = await deletePdfPages(pdf, new Set([5, 10]));
      const doc = await PDFDocument.load(result);
      expect(doc.getPageCount()).toBe(3);
    });

    it('should handle deleting no pages (empty set)', async () => {
      const pdf = await createTestPdf(3);
      const result = await deletePdfPages(pdf, new Set());
      const doc = await PDFDocument.load(result);
      expect(doc.getPageCount()).toBe(3);
    });
  });

  describe('rotatePdfUniform', () => {
    it('should rotate all pages by 90 degrees', async () => {
      const pdf = await createTestPdf(3);
      const rotated = await rotatePdfUniform(pdf, 90);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPageCount()).toBe(3);
      expect(doc.getPage(0).getRotation().angle).toBe(90);
    });

    it('should rotate by 180 degrees', async () => {
      const pdf = await createTestPdf(2);
      const rotated = await rotatePdfUniform(pdf, 180);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPage(0).getRotation().angle).toBe(180);
    });

    it('should handle 0 degree rotation', async () => {
      const pdf = await createTestPdf(2);
      const rotated = await rotatePdfUniform(pdf, 0);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPage(0).getRotation().angle).toBe(0);
    });

    it('should rotate by 270 degrees', async () => {
      const pdf = await createTestPdf(1);
      const rotated = await rotatePdfUniform(pdf, 270);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPage(0).getRotation().angle).toBe(270);
    });
  });

  describe('rotatePdfPages', () => {
    it('should rotate individual pages by different angles', async () => {
      const pdf = await createTestPdf(3);
      const rotated = await rotatePdfPages(pdf, [90, 0, 180]);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPage(0).getRotation().angle).toBe(90);
      expect(doc.getPage(1).getRotation().angle).toBe(0);
      expect(doc.getPage(2).getRotation().angle).toBe(180);
    });

    it('should treat missing rotations as 0', async () => {
      const pdf = await createTestPdf(3);
      const rotated = await rotatePdfPages(pdf, [90]);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPage(0).getRotation().angle).toBe(90);
      expect(doc.getPage(1).getRotation().angle).toBe(0);
      expect(doc.getPage(2).getRotation().angle).toBe(0);
    });

    it('should handle all zeros', async () => {
      const pdf = await createTestPdf(2);
      const rotated = await rotatePdfPages(pdf, [0, 0]);
      const doc = await PDFDocument.load(rotated);
      expect(doc.getPage(0).getRotation().angle).toBe(0);
      expect(doc.getPage(1).getRotation().angle).toBe(0);
    });
  });
});
