import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as ui from '@/js/ui';
import * as helpers from '@/js/utils/helpers';
import { state } from '@/js/state';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { pngToPdf } from '@/js/logic/png-to-pdf';

// Mock UI module for loader and alerts
vi.mock('@/js/ui', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: vi.fn(),
}));

// Mock helper functions for file operations
vi.mock('@/js/utils/helpers', () => ({
  readFileAsArrayBuffer: vi.fn(),
  downloadFile: vi.fn(),
}));

// Mock pdf-lib for PDF document creation and manipulation
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(),
  },
}));

describe('pngToPdf', () => {
  let mockNewDoc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    state.files = [];

    mockNewDoc = {
      embedPng: vi.fn(),
      addPage: vi.fn(),
      save: vi.fn(),
    };
    // Default mock for PDFDocument.create
    (PDFLibDocument.create as any).mockResolvedValue(mockNewDoc);

    // Default helpers
    vi.mocked(helpers.readFileAsArrayBuffer).mockResolvedValue(new ArrayBuffer(8));
    vi.mocked(helpers.downloadFile).mockImplementation(() => {});
    vi.mocked(ui.showLoader).mockImplementation(() => {});
    vi.mocked(ui.hideLoader).mockImplementation(() => {});
    vi.mocked(ui.showAlert).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('input validation', () => {
    it('alerts when no files selected', async () => {
      state.files = [];
      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalledWith('No Files', 'Please select at least one PNG file.');
      expect(ui.showLoader).not.toHaveBeenCalled();
    });

    it('processes empty files array', async () => {
      state.files = [];
      await pngToPdf();
      expect(ui.showLoader).not.toHaveBeenCalled();
      expect(PDFLibDocument.create).not.toHaveBeenCalled();
    });

    it('handles non-PNG file types gracefully', async () => {
      state.files = [
        { name: 'test.jpg', type: 'image/jpeg' } as any,
        { name: 'test.txt', type: 'text/plain' } as any
      ];

      mockNewDoc.embedPng.mockRejectedValue(new Error('Invalid PNG'));

      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from PNG images. Ensure all files are valid PNGs.'
      );
    });
  });

  describe('single file conversion', () => {
    it('converts single PNG to PDF successfully', async () => {
      state.files = [
        {
          name: 'test.png',
          type: 'image/png',
          size: 1024,
        } as any,
      ];

      mockNewDoc.embedPng.mockResolvedValue({ width: 100, height: 200 });
      const mockPage = { drawImage: vi.fn() };
      mockNewDoc.addPage.mockReturnValue(mockPage);
      mockNewDoc.save.mockResolvedValue(new Uint8Array([1, 2, 3]));

      await pngToPdf();

      expect(ui.showLoader).toHaveBeenCalledWith('Creating PDF from PNGs...');
      expect(mockNewDoc.embedPng).toHaveBeenCalledTimes(1);
      expect(mockPage.drawImage).toHaveBeenCalledWith(
        expect.objectContaining({ width: 100, height: 200 }),
        expect.objectContaining({
          x: 0,
          y: 0,
          width: 100,
          height: 200,
        })
      );
      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'from_pngs.pdf'
      );
    });

    it('handles empty PNG file', async () => {
      state.files = [
        {
          name: 'empty.png',
          type: 'image/png',
          size: 0,
        } as any,
      ];

      mockNewDoc.embedPng.mockRejectedValue(new Error('Empty file'));

      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalled();
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('maintains PNG dimensions in PDF page', async () => {
      state.files = [
        {
          name: 'large.png',
          type: 'image/png',
        } as any,
      ];

      const dimensions = { width: 1920, height: 1080 };
      mockNewDoc.embedPng.mockResolvedValue(dimensions);
      const mockPage = { drawImage: vi.fn() };
      mockNewDoc.addPage.mockReturnValue(mockPage);

      await pngToPdf();

      expect(mockNewDoc.addPage).toHaveBeenCalledWith([1920, 1080]);
      expect(mockPage.drawImage).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
        })
      );
    });
  });

  describe('multiple files handling', () => {
    it('processes multiple PNGs in order', async () => {
      state.files = [
        { name: '1.png', type: 'image/png' } as any,
        { name: '2.png', type: 'image/png' } as any,
        { name: '3.png', type: 'image/png' } as any,
      ];

      const dimensions = [
        { width: 100, height: 200 },
        { width: 300, height: 400 },
        { width: 500, height: 600 },
      ];

      mockNewDoc.embedPng
        .mockResolvedValueOnce(dimensions[0])
        .mockResolvedValueOnce(dimensions[1])
        .mockResolvedValueOnce(dimensions[2]);

      const mockPages = dimensions.map(() => ({ drawImage: vi.fn() }));
      mockNewDoc.addPage
        .mockReturnValueOnce(mockPages[0])
        .mockReturnValueOnce(mockPages[1])
        .mockReturnValueOnce(mockPages[2]);

      await pngToPdf();

      expect(helpers.readFileAsArrayBuffer).toHaveBeenCalledTimes(3);
      expect(mockNewDoc.embedPng).toHaveBeenCalledTimes(3);
      expect(mockNewDoc.addPage).toHaveBeenCalledTimes(3);
      
      dimensions.forEach((dim, i) => {
        expect(mockNewDoc.addPage).toHaveBeenNthCalledWith(i + 1, [dim.width, dim.height]);
        expect(mockPages[i].drawImage).toHaveBeenCalledWith(
          dimensions[i],
          expect.objectContaining({
            x: 0,
            y: 0,
            width: dim.width,
            height: dim.height,
          })
        );
      });
    });

    it('stops processing when a file fails', async () => {
    // The actual implementation stops processing all files when any file fails
    state.files = [
        { name: 'good1.png', type: 'image/png', size: 1024 } as any,
        { name: 'bad.png', type: 'image/png', size: 1024 } as any,
        { name: 'good2.png', type: 'image/png', size: 1024 } as any,
    ];

    // Mock readFileAsArrayBuffer to always succeed
    vi.mocked(helpers.readFileAsArrayBuffer)
        .mockResolvedValue(new ArrayBuffer(100));

    // First file succeeds, second file fails
    mockNewDoc.embedPng
        .mockResolvedValueOnce({ width: 100, height: 100 })
        .mockRejectedValueOnce(new Error('Bad PNG'));

    const mockPage = { drawImage: vi.fn() };
    mockNewDoc.addPage.mockReturnValue(mockPage);

    await pngToPdf();

    // Should process first file successfully
    expect(helpers.readFileAsArrayBuffer).toHaveBeenCalledTimes(2);
    expect(mockNewDoc.embedPng).toHaveBeenCalledTimes(2);
    
    // Only one page should be added (for the first successful file)
    expect(mockNewDoc.addPage).toHaveBeenCalledTimes(1);
    expect(mockNewDoc.addPage).toHaveBeenCalledWith([100, 100]);

    // Should show error alert and not save/download
    expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from PNG images. Ensure all files are valid PNGs.'
    );
    expect(mockNewDoc.save).not.toHaveBeenCalled();
    expect(helpers.downloadFile).not.toHaveBeenCalled();
    expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('preserves page order in output PDF', async () => {
      state.files = [
        { name: 'page1.png', type: 'image/png' } as any,
        { name: 'page2.png', type: 'image/png' } as any,
      ];

      const dimensions = [
        { width: 100, height: 100 },
        { width: 200, height: 200 },
      ];

      mockNewDoc.embedPng
        .mockResolvedValueOnce(dimensions[0])
        .mockResolvedValueOnce(dimensions[1]);

      const mockPages = dimensions.map(() => ({ drawImage: vi.fn() }));
      mockNewDoc.addPage
        .mockReturnValueOnce(mockPages[0])
        .mockReturnValueOnce(mockPages[1]);

      await pngToPdf();

      const addPageCalls = mockNewDoc.addPage.mock.calls;
      expect(addPageCalls[0][0]).toEqual([100, 100]);
      expect(addPageCalls[1][0]).toEqual([200, 200]);
    });
  });

  describe('error handling', () => {
    it('handles file read errors gracefully', async () => {
      state.files = [
        { name: 'error.png', type: 'image/png' } as any,
      ];

      vi.mocked(helpers.readFileAsArrayBuffer).mockRejectedValue(
        new Error('File read error')
      );

      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from PNG images. Ensure all files are valid PNGs.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('handles PDF creation errors', async () => {
      state.files = [
        { name: 'test.png', type: 'image/png' } as any,
      ];

      (PDFLibDocument.create as any).mockRejectedValue(
        new Error('PDF creation failed')
      );

      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from PNG images. Ensure all files are valid PNGs.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('shows error when embedPng throws and still hides loader', async () => {
      state.files = [
        { name: 'bad.png', type: 'image/png' } as any,
      ];

      mockNewDoc.embedPng.mockRejectedValue(new Error('embed failed'));

      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from PNG images. Ensure all files are valid PNGs.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('handles PDF save errors', async () => {
      state.files = [
        { name: 'test.png', type: 'image/png' } as any,
      ];

      mockNewDoc.embedPng.mockResolvedValue({ width: 100, height: 100 });
      const mockPage = { drawImage: vi.fn() };
      mockNewDoc.addPage.mockReturnValue(mockPage);
      mockNewDoc.save.mockRejectedValue(new Error('Save failed'));

      await pngToPdf();
      expect(ui.showAlert).toHaveBeenCalled();
      expect(ui.hideLoader).toHaveBeenCalled();
    });
  });

  describe('cleanup and UI feedback', () => {
    it('always hides loader even after errors', async () => {
      state.files = [
        { name: 'error.png', type: 'image/png' } as any,
      ];

      const errors = [
        () => { throw new Error('Read error'); },
        () => { throw new Error('Embed error'); },
        () => { throw new Error('Save error'); }
      ];

      for (const throwError of errors) {
        vi.clearAllMocks();
        mockNewDoc.embedPng.mockImplementation(throwError);

        await pngToPdf();
        expect(ui.hideLoader).toHaveBeenCalled();
      }
    });

    it('shows appropriate UI feedback during conversion', async () => {
      state.files = [
        { name: 'test.png', type: 'image/png' } as any,
      ];

      mockNewDoc.embedPng.mockResolvedValue({ width: 100, height: 100 });
      const mockPage = { drawImage: vi.fn() };
      mockNewDoc.addPage.mockReturnValue(mockPage);
      mockNewDoc.save.mockResolvedValue(new Uint8Array([1, 2, 3]));

      await pngToPdf();

      const uiSequence = vi.mocked(ui.showLoader).mock.invocationCallOrder[0];
      const hideLoaderSequence = vi.mocked(ui.hideLoader).mock.invocationCallOrder[0];
      
      expect(uiSequence).toBeLessThan(hideLoaderSequence);
      expect(ui.showLoader).toHaveBeenCalledWith('Creating PDF from PNGs...');
    });
  });
});