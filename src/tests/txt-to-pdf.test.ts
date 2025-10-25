import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { txtToPdf } from '@/js/logic/txt-to-pdf';
import * as ui from '@/js/ui';
import * as helpers from '@/js/utils/helpers';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';

// -------------------- Mock Modules --------------------
vi.mock('@/js/ui', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: vi.fn(),
}));

vi.mock('@/js/utils/helpers', () => ({
  downloadFile: vi.fn(),
  hexToRgb: vi.fn(),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn(),
  },
  rgb: vi.fn(),
  StandardFonts: {
    TimesRoman: 'Times-Roman',
    Helvetica: 'Helvetica',
  },
  PageSizes: {
    A4: [595, 842],
    Letter: [612, 792],
  },
}));

describe('Text to PDF Converter', () => {
  let mockPdfDoc: any;
  let mockPage: any;
  let mockFont: any;

  beforeEach(() => {
    // Reset document body
    document.body.innerHTML = `
      <textarea id="text-input"></textarea>
      <select id="font-family">
        <option value="TimesRoman">Times Roman</option>
        <option value="Helvetica">Helvetica</option>
      </select>
      <input id="font-size" type="number" value="12" />
      <select id="page-size">
        <option value="A4">A4</option>
        <option value="Letter">Letter</option>
      </select>
      <input id="text-color" type="color" value="#000000" />
    `;

    // Mock font methods
    mockFont = {
      widthOfTextAtSize: vi.fn((text, size) => text.length * size * 0.5),
    };

    // Mock page methods
    mockPage = {
      getSize: vi.fn(() => ({ width: 595, height: 842 })),
      getHeight: vi.fn(() => 842),
      drawText: vi.fn(),
    };

    // Mock PDF document
    mockPdfDoc = {
      embedFont: vi.fn().mockResolvedValue(mockFont),
      addPage: vi.fn(() => mockPage),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    };

    // Setup PDFDocument.create mock
    vi.mocked(PDFDocument.create).mockResolvedValue(mockPdfDoc);

    // Mock helpers
    vi.mocked(helpers.hexToRgb).mockReturnValue({ r: 0, g: 0, b: 0 });
    vi.mocked(helpers.downloadFile).mockImplementation(() => {});
    vi.mocked(rgb).mockReturnValue({ r: 0, g: 0, b: 0 });

    // Mock UI functions
    vi.mocked(ui.showLoader).mockImplementation(() => {});
    vi.mocked(ui.hideLoader).mockImplementation(() => {});
    vi.mocked(ui.showAlert).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------- Input Validation Tests --------------------
  describe('Input Validation', () => {
    it('should handle empty text input', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = '   ';

      await txtToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Input Required',
        'Please enter some text to convert.'
      );
      expect(PDFDocument.create).not.toHaveBeenCalled();
    });

    it('should process single line text', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Hello, World!';

      await txtToPdf();

      expect(mockPage.drawText).toHaveBeenCalledTimes(1);
      expect(mockPdfDoc.addPage).toHaveBeenCalledTimes(1);
    });

    it('should process multi-line text', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Line 1\nLine 2\nLine 3';

      await txtToPdf();

      expect(mockPage.drawText).toHaveBeenCalledTimes(3);
    });
  });

  // -------------------- Font and Style Tests --------------------
  describe('Font and Style Settings', () => {
    it('should apply selected font family', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      const fontFamily = document.getElementById('font-family') as HTMLSelectElement;
      textInput.value = 'Test Text';
      fontFamily.value = 'Helvetica';

      await txtToPdf();

      expect(mockPdfDoc.embedFont).toHaveBeenCalledWith('Helvetica');
    });

    it('should apply custom font size', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      const fontSize = document.getElementById('font-size') as HTMLInputElement;
      textInput.value = 'Test Text';
      fontSize.value = '16';

      await txtToPdf();

      expect(mockPage.drawText).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ size: 16 })
      );
    });

    it('should handle invalid font size gracefully', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      const fontSize = document.getElementById('font-size') as HTMLInputElement;
      textInput.value = 'Test Text';
      fontSize.value = 'invalid';

      await txtToPdf();

      // Should default to 12pt
      expect(mockPage.drawText).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ size: 12 })
      );
    });

    it('should apply custom text color', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      const textColor = document.getElementById('text-color') as HTMLInputElement;
      textInput.value = 'Colored Text';
      textColor.value = '#ff0000';

      vi.mocked(helpers.hexToRgb).mockReturnValue({ r: 1, g: 0, b: 0 });

      await txtToPdf();

      expect(helpers.hexToRgb).toHaveBeenCalledWith('#ff0000');
      expect(rgb).toHaveBeenCalledWith(1, 0, 0);
    });
  });

  // -------------------- Page Layout Tests --------------------
  describe('Page Layout', () => {
    it('should respect page size selection', async () => {
        const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
        const pageSize = document.getElementById('page-size') as HTMLSelectElement;
        textInput.value = 'Test Text';
        pageSize.value = 'Letter';

        await txtToPdf();

        expect(mockPdfDoc.addPage).toHaveBeenCalledWith([612, 792]);
    });

    it('should create new page when content overflows', async () => {
        const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
        const lines = Array(60).fill('This is a line of text').join('\n');
        textInput.value = lines;

        await txtToPdf();

        // With 60 lines and default spacing, should create at least 2 pages
        expect(mockPdfDoc.addPage).toHaveBeenCalledTimes(2);
    });

    it('should maintain proper margins', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      await txtToPdf();

      expect(mockPage.drawText).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          x: 72,
          y: expect.any(Number),
        })
      );
    });

    it('should handle word wrapping correctly', async () => {
        const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
        textInput.value = 'word '.repeat(50);

        mockFont.widthOfTextAtSize.mockImplementation((text, size) => {
            const wordCount = text.split(' ').filter(w => w).length;
            return wordCount * 100; 
        });

        await txtToPdf();

        expect(mockPage.drawText).toHaveBeenCalled();
        expect(mockPage.drawText.mock.calls.length).toBeGreaterThan(10);
    });

    it('should handle single-word line wrapping', async () => {
        const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
        
        textInput.value = 'Short text followed by a VeryLongWordThatShouldWrapToNewLine';


        mockFont.widthOfTextAtSize.mockImplementation((text) => {

            if (text.includes('VeryLongWord')) {
                return 500; // Exceeds available width (451)
            }
            return 200;
        });

        await txtToPdf();

        expect(mockPage.drawText).toHaveBeenCalledTimes(2);
        
        const calls = mockPage.drawText.mock.calls;
        expect(calls[0][0]).toBe('Short text followed by a');
        expect(calls[1][0]).toBe('VeryLongWordThatShouldWrapToNewLine');
    });

});

  // -------------------- Error Handling Tests --------------------
  describe('Error Handling', () => {
    it('should handle font embedding errors', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      mockPdfDoc.embedFont.mockRejectedValue(new Error('Font embedding failed'));

      await txtToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from text.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('should handle PDF save errors', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      mockPdfDoc.save.mockRejectedValue(new Error('Save failed'));

      await txtToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from text.'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('should handle color parsing errors', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      vi.mocked(helpers.hexToRgb).mockImplementation(() => {
        throw new Error('Invalid color');
      });

      await txtToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to create PDF from text.'
      );
    });
  });

  // -------------------- Resource Management Tests --------------------
  describe('Resource Management', () => {
    it('should show and hide loader properly', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      await txtToPdf();

      expect(ui.showLoader).toHaveBeenCalledWith('Creating PDF...');
      expect(ui.hideLoader).toHaveBeenCalled();

      const showLoaderOrder = vi.mocked(ui.showLoader).mock.invocationCallOrder[0];
      const hideLoaderOrder = vi.mocked(ui.hideLoader).mock.invocationCallOrder[0];
      expect(showLoaderOrder).toBeLessThan(hideLoaderOrder);
    });

    it('should handle cleanup after successful conversion', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      await txtToPdf();

      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'text-document.pdf'
      );
      expect(ui.hideLoader).toHaveBeenCalled();
    });

    it('should ensure loader is hidden even after errors', async () => {
      const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
      textInput.value = 'Test Text';

      const errors = [
        () => mockPdfDoc.embedFont.mockRejectedValue(new Error('Font error')),
        () => mockPdfDoc.save.mockRejectedValue(new Error('Save error')),
        () => mockPage.drawText.mockImplementation(() => { throw new Error('Draw error'); }),
      ];

      for (const injectError of errors) {
        vi.clearAllMocks();
        injectError();

        await txtToPdf();
        expect(ui.hideLoader).toHaveBeenCalled();
      }
    });
  });
});