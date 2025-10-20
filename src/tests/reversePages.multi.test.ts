import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { reversePages } from '../js/logic/reverse-pages';
import { state } from '../js/state';
import * as helpers from '../js/utils/helpers';
import * as ui from '../js/ui';
import JSZip from 'jszip';

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
    load: vi.fn().mockResolvedValue({
      getPageCount: vi.fn(() => 2),
      copyPages: vi.fn((_, indices) =>
        Promise.resolve(indices.map((i) => ({ page: `page-${i}` })))
      ),
    }),
  },
}));

describe('reversePages - multi PDF support', () => {
  let mockNewDoc: any;

  beforeEach(() => {
    state.files = []; // ✅ now using files, not pdfDocs

    mockNewDoc = {
      copyPages: vi.fn((doc: any, indices: number[]) =>
        Promise.resolve(indices.map((i: number) => ({ page: `page-${i}` })))
      ),
      addPage: vi.fn(),
      save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
    };
    vi.mocked(PDFLibDocument.create).mockResolvedValue(mockNewDoc);

    vi.mocked(helpers.downloadFile).mockImplementation(() => {});
    vi.mocked(ui.showLoader).mockImplementation(() => {});
    vi.mocked(ui.hideLoader).mockImplementation(() => {});
    vi.mocked(ui.showAlert).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reverse pages for multiple PDFs and create a zip', async () => {
    const mockFile = (name: string) => ({
      name,
      type: 'application/pdf',
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    });

    state.files = [mockFile('a.pdf'), mockFile('b.pdf')]; // ✅ now matches function

    await reversePages();

    expect(helpers.downloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      'reversed_pdfs.zip'
    );
    expect(mockNewDoc.copyPages).toHaveBeenCalledTimes(2);
    expect(mockNewDoc.addPage).toHaveBeenCalled();
    expect(mockNewDoc.save).toHaveBeenCalledTimes(2);
  });

  it('should handle empty PDF list gracefully', async () => {
    state.files = [];
    await reversePages();
    expect(ui.showAlert).toHaveBeenCalledWith('Error', 'PDF not loaded.');
  });

  it('should handle PDF creation errors', async () => {
    vi.mocked(PDFLibDocument.create).mockRejectedValue(
      new Error('Create failed')
    );
    state.files = [
      {
        name: 'x.pdf',
        type: 'application/pdf',
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    ];

    await reversePages();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'Error',
      'Could not reverse the PDF pages.'
    );
    expect(ui.hideLoader).toHaveBeenCalled();
  });

  it('should handle PDF processing errors', async () => {
    mockNewDoc.copyPages.mockRejectedValue(new Error('Copy failed'));
    state.files = [
      {
        name: 'y.pdf',
        type: 'application/pdf',
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    ];

    await reversePages();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'Error',
      'Could not reverse the PDF pages.'
    );
    expect(ui.hideLoader).toHaveBeenCalled();
  });

  it('should handle save errors', async () => {
    mockNewDoc.save.mockRejectedValue(new Error('Save failed'));
    state.files = [
      {
        name: 'z.pdf',
        type: 'application/pdf',
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    ];

    await reversePages();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'Error',
      'Could not reverse the PDF pages.'
    );
    expect(ui.hideLoader).toHaveBeenCalled();
  });
});
