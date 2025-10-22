import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addBlankPage } from '@/js/logic/add-blank-page';
import * as ui from '@/js/ui';
import * as helpers from '@/js/utils/helpers';
import { state } from '@/js/state';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

// -------------------- Mock Modules --------------------
vi.mock('@/js/ui', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: vi.fn(),
}));

vi.mock('@/js/utils/helpers', () => ({
  downloadFile: vi.fn(),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(),
  },
}));

// -------------------- Test Suite --------------------
describe('Add Blank Page Tool', () => {
  let mockNewDoc: any;

  beforeEach(() => {
    // Reset state pdfDoc
    state.pdfDoc = {
      getPageCount: () => 5,
      getPage: vi.fn((index: number) => ({
        getSize: () => ({ width: 595.28, height: 841.89 }), // A4 size
      })),
    } as any;

    // Mock PDFDocument.create
    mockNewDoc = {
      copyPages: vi.fn((doc: any, indices: number[]) =>
        Promise.resolve(indices.map((i: number) => ({ page: `page-${i}` })))
      ),
      addPage: vi.fn(),
      save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    };
    vi.mocked(PDFLibDocument.create).mockResolvedValue(mockNewDoc);

    // Mock helpers and UI
    vi.mocked(helpers.downloadFile).mockImplementation(() => {});
    vi.mocked(ui.showLoader).mockImplementation(() => {});
    vi.mocked(ui.hideLoader).mockImplementation(() => {});
    vi.mocked(ui.showAlert).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  // -------------------- Input Validation Tests --------------------
  describe('Input Validation', () => {
    it('should show alert for empty page number', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a page number.'
      );
      expect(ui.showLoader).not.toHaveBeenCalled();
    });

    it('should show alert for empty page count', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter the number of pages to insert.'
      );
      expect(ui.showLoader).not.toHaveBeenCalled();
    });

    it('should show alert for invalid page number (negative)', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="-1" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a number between 0 and 5.'
      );
    });

    it('should show alert for invalid page number (too high)', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="10" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a number between 0 and 5.'
      );
    });

    it('should show alert for invalid page count (zero)', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="0" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid number of pages (1 or more).'
      );
    });

    it('should show alert for invalid page count (negative)', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="-5" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Invalid Input',
        'Please enter a valid number of pages (1 or more).'
      );
    });
  });

  // -------------------- Single Page Insertion Tests --------------------
  describe('Single Page Insertion', () => {
    it('should add one blank page at the beginning', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="0" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showLoader).toHaveBeenCalledWith('Adding 1 blank page...');
      expect(PDFLibDocument.create).toHaveBeenCalled();
      // Should add 1 blank page + 5 existing pages = 6 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(6);
      expect(mockNewDoc.addPage).toHaveBeenCalledWith([595.28, 841.89]);
      expect(mockNewDoc.save).toHaveBeenCalled();
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-page-added.pdf'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('should add one blank page in the middle', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showLoader).toHaveBeenCalledWith('Adding 1 blank page...');
      expect(mockNewDoc.copyPages).toHaveBeenCalledWith(state.pdfDoc, [0, 1]);
      // Should add 1 blank page + 5 existing pages = 6 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(6);
      expect(mockNewDoc.copyPages).toHaveBeenCalledWith(
        state.pdfDoc,
        [2, 3, 4]
      );
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-page-added.pdf'
      );
    });

    it('should add one blank page at the end', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="5" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(mockNewDoc.copyPages).toHaveBeenCalledWith(
        state.pdfDoc,
        [0, 1, 2, 3, 4]
      );
      // Should add 1 blank page + 5 existing pages = 6 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(6);
      // When adding at the end, there are no pages after, so copyPages is not called for indicesAfter
      expect(mockNewDoc.copyPages).toHaveBeenCalledTimes(1);
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-page-added.pdf'
      );
    });
  });

  // -------------------- Multiple Pages Insertion Tests --------------------
  describe('Multiple Pages Insertion', () => {
    it('should add multiple blank pages at the beginning', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="0" />
        <input id="page-count" value="3" />
      `;

      await addBlankPage();

      expect(ui.showLoader).toHaveBeenCalledWith('Adding 3 blank pages...');
      // Should add 3 blank pages + 5 existing pages = 8 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(8);
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-pages-added.pdf'
      );
    });

    it('should add multiple blank pages in the middle', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="5" />
      `;

      await addBlankPage();

      expect(ui.showLoader).toHaveBeenCalledWith('Adding 5 blank pages...');
      expect(mockNewDoc.copyPages).toHaveBeenCalledWith(state.pdfDoc, [0, 1]);
      // Should add 5 blank pages + 5 existing pages = 10 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(10);
      expect(mockNewDoc.copyPages).toHaveBeenCalledWith(
        state.pdfDoc,
        [2, 3, 4]
      );
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-pages-added.pdf'
      );
    });

    it('should add multiple blank pages at the end', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="5" />
        <input id="page-count" value="2" />
      `;

      await addBlankPage();

      expect(ui.showLoader).toHaveBeenCalledWith('Adding 2 blank pages...');
      expect(mockNewDoc.copyPages).toHaveBeenCalledWith(
        state.pdfDoc,
        [0, 1, 2, 3, 4]
      );
      // Should add 2 blank pages + 5 existing pages = 7 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(7);
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-pages-added.pdf'
      );
    });
  });

  // -------------------- Error Handling Tests --------------------
  describe('Error Handling', () => {
    it('should handle PDF creation errors', async () => {
      vi.mocked(PDFLibDocument.create).mockRejectedValue(
        new Error('PDF creation failed')
      );

      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Could not add blank page.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('should handle PDF processing errors', async () => {
      mockNewDoc.copyPages.mockRejectedValue(new Error('Copy failed'));

      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Could not add blank page.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      mockNewDoc.save.mockRejectedValue(new Error('Save failed'));

      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Could not add blank page.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });
  });

  // -------------------- Edge Cases Tests --------------------
  describe('Edge Cases', () => {
    it('should handle empty PDF (0 pages)', async () => {
      state.pdfDoc.getPageCount = () => 0;

      document.body.innerHTML = `
        <input id="page-number" value="0" />
        <input id="page-count" value="1" />
      `;

      await addBlankPage();

      // When PDF has 0 pages, copyPages is not called at all
      expect(mockNewDoc.copyPages).not.toHaveBeenCalled();
      // Should add 1 blank page + 0 existing pages = 1 total call
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(1);
    });

    it('should handle large number of pages', async () => {
      document.body.innerHTML = `
        <input id="page-number" value="2" />
        <input id="page-count" value="100" />
      `;

      await addBlankPage();

      expect(ui.showLoader).toHaveBeenCalledWith('Adding 100 blank pages...');
      // Should add 100 blank pages + 5 existing pages = 105 total calls
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(105);
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'blank-pages-added.pdf'
      );
    });
  });
});
