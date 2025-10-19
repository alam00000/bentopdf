import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { reversePages } from '../js/logic/reverse-pages';
import { state } from '../js/state';
import * as helpers from '../js/utils/helpers';
import * as ui from '../js/ui';
import JSZip from 'jszip';

// -------------------- Mock Modules --------------------
vi.mock('../js/ui', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: vi.fn(),
}));

vi.mock('../js/utils/helpers', () => ({
  downloadFile: vi.fn(),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(),
  },
}));

// -------------------- Test Suite --------------------
describe('reversePages - multi PDF support', () => {
  let mockNewDoc: any;

  beforeEach(() => {
    // Reset state
    state.pdfDocs = [];

    // Mock PDFDocument.create
    mockNewDoc = {
      copyPages: vi.fn((doc: any, indices: number[]) =>
        Promise.resolve(indices.map((i: number) => ({ page: `page-${i}` })))
      ),
      addPage: vi.fn(),
      save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    };
    vi.mocked(PDFLibDocument.create).mockResolvedValue(mockNewDoc);

    // Mock helpers
    vi.mocked(helpers.downloadFile).mockImplementation(() => {});
    vi.mocked(ui.showLoader).mockImplementation(() => {});
    vi.mocked(ui.hideLoader).mockImplementation(() => {});
    vi.mocked(ui.showAlert).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reverse pages for multiple PDFs and create a zip', async () => {
    // Mock 2 PDFs
    const pdf1 = { getPageCount: () => 2 };
    const pdf2 = { getPageCount: () => 3 };
    state.pdfDocs = [pdf1, pdf2];

    await reversePages();

    // downloadFile called
    expect(helpers.downloadFile).toHaveBeenCalledWith(expect.any(Blob), 'reversed_pdfs.zip');

    // copyPages called for each PDF
    expect(mockNewDoc.copyPages).toHaveBeenCalledTimes(2);

    // addPage called correct number of times
    expect(mockNewDoc.addPage).toHaveBeenCalled();

    // save called for each PDF
    expect(mockNewDoc.save).toHaveBeenCalledTimes(2);
  });

  it('should handle empty PDF list gracefully', async () => {
    state.pdfDocs = [];
    await reversePages();
    expect(ui.showAlert).toHaveBeenCalledWith('Error', 'PDF not loaded.');
  });

  it('should handle PDF creation errors', async () => {
    vi.mocked(PDFLibDocument.create).mockRejectedValue(new Error('Create failed'));
    state.pdfDocs = [{ getPageCount: () => 2 }];

    await reversePages();

    expect(ui.showAlert).toHaveBeenCalledWith('Error', 'Could not reverse the PDF pages.');
    expect(ui.hideLoader).toHaveBeenCalled();
  });

  it('should handle PDF processing errors', async () => {
    mockNewDoc.copyPages.mockRejectedValue(new Error('Copy failed'));
    state.pdfDocs = [{ getPageCount: () => 2 }];

    await reversePages();

    expect(ui.showAlert).toHaveBeenCalledWith('Error', 'Could not reverse the PDF pages.');
    expect(ui.hideLoader).toHaveBeenCalled();
  });

  it('should handle save errors', async () => {
    mockNewDoc.save.mockRejectedValue(new Error('Save failed'));
    state.pdfDocs = [{ getPageCount: () => 2 }];

    await reversePages();

    expect(ui.showAlert).toHaveBeenCalledWith('Error', 'Could not reverse the PDF pages.');
    expect(ui.hideLoader).toHaveBeenCalled();
  });
});
