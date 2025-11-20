import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { jpgToPdf } from '@/js/logic/jpg-to-pdf';
import * as ui from '@/js/ui';
import * as helpers from '@/js/utils/helpers';
import { state } from '@/js/state';
import { PDFDocument } from 'pdf-lib';

// -------------------- Mock Modules --------------------
vi.mock('@/js/ui', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: vi.fn(),
}));

vi.mock('@/js/utils/helpers', () => ({
  downloadFile: vi.fn(),
  readFileAsArrayBuffer: vi.fn(),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    create: vi.fn().mockResolvedValue({
      embedJpg: vi.fn(),
      addPage: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      save: vi.fn(() => Promise.resolve(new Uint8Array(100))),
    }),
  },
}));

describe('JPG to PDF Converter', () => {
  let mockPdfDoc: any;
  let originalURL: any;
  let originalCreateElement: any;
  let originalImage: any;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Store original globals
    originalURL = global.URL;
    originalCreateElement = document.createElement;
    originalImage = global.Image;

    // Reset state
    state.files = [];

    // Mock URL API
    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    } as any;

    // Mock canvas
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      toBlob: vi.fn((callback) => {
        const mockBlob = new Blob(['mock'], { type: 'image/jpeg' });
        (mockBlob as any).arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(100)));
        callback(mockBlob);
      }),
    };

    // Mock document.createElement
    document.createElement = vi.fn((tag: string): any => {
      if (tag === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(document, tag);
    });

    // Setup PDF mock
    mockPdfDoc = {
      embedJpg: vi.fn().mockResolvedValue({
        width: 800,
        height: 600,
      }),
      addPage: vi.fn(() => ({
        drawImage: vi.fn(),
      })),
      save: vi.fn(() => Promise.resolve(new Uint8Array(100))),
    };

    vi.mocked(PDFDocument.create).mockResolvedValue(mockPdfDoc);

    // Mock helpers
    vi.mocked(helpers.readFileAsArrayBuffer).mockResolvedValue(new ArrayBuffer(100));
    vi.mocked(helpers.downloadFile).mockImplementation(() => {});

    // Mock UI functions
    vi.mocked(ui.showLoader).mockImplementation(() => {});
    vi.mocked(ui.hideLoader).mockImplementation(() => {});
    vi.mocked(ui.showAlert).mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original globals
    global.URL = originalURL;
    document.createElement = originalCreateElement;
    global.Image = originalImage;
    vi.clearAllMocks();
    vi.useRealTimers(); // Restore real timers
  });

  // -------------------- Input Validation Tests --------------------
  describe('Input Validation', () => {
    it('should handle empty file list', async () => {
      state.files = [];
      await jpgToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'No Files',
        'Please select at least one JPG file.'
      );
      expect(PDFDocument.create).not.toHaveBeenCalled();
    });

    it('should process single file', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      await jpgToPdf();

      expect(helpers.readFileAsArrayBuffer).toHaveBeenCalledWith(mockFile);
      expect(mockPdfDoc.embedJpg).toHaveBeenCalledTimes(1);
      expect(mockPdfDoc.addPage).toHaveBeenCalledTimes(1);
    });

    it('should process multiple files', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      state.files = files;

      await jpgToPdf();

      expect(helpers.readFileAsArrayBuffer).toHaveBeenCalledTimes(2);
      expect(mockPdfDoc.embedJpg).toHaveBeenCalledTimes(2);
      expect(mockPdfDoc.addPage).toHaveBeenCalledTimes(2);
    });
  });

  // -------------------- Image Processing Tests --------------------
  describe('Image Processing', () => {
    it('should handle direct JPG embedding', async () => {
      const mockFile = new File(['valid jpg'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      // Mock successful direct embedding
      mockPdfDoc.embedJpg.mockResolvedValueOnce({
        width: 800,
        height: 600,
      });

      await jpgToPdf();

      expect(mockPdfDoc.embedJpg).toHaveBeenCalledTimes(1);
      expect(ui.showAlert).not.toHaveBeenCalledWith(
        expect.stringContaining('Direct JPG embedding failed')
      );
    });

    it('should attempt sanitization when direct embedding fails', async () => {
      const mockFile = new File(['corrupted jpg'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      // Mock failed direct embedding, but successful sanitization
      mockPdfDoc.embedJpg
        .mockRejectedValueOnce(new Error('Invalid JPG'))
        .mockResolvedValueOnce({
          width: 800,
          height: 600,
        });

      // Mock Image for sanitization
      global.Image = class MockImage {
        naturalWidth = 800;
        naturalHeight = 600;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        constructor() {
          queueMicrotask(() => this.onload?.());
        }
      } as any;

      await jpgToPdf();

      expect(mockPdfDoc.embedJpg).toHaveBeenCalledTimes(2);
      const alertCalls = vi.mocked(ui.showAlert).mock.calls;
      expect(alertCalls.some(call => 
        call[0].includes('Direct JPG embedding failed for test.jpg')
      )).toBe(true);
    });

    it('should handle failed sanitization', async () => {
      const mockFile = new File(['bad jpg'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      mockPdfDoc.embedJpg.mockRejectedValue(new Error('Invalid JPG'));

      // Mock Image loading failure
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        constructor() {
          queueMicrotask(() => this.onerror?.());
        }
      } as any;

      await jpgToPdf();

      expect(mockPdfDoc.embedJpg).toHaveBeenCalledTimes(1);
      expect(ui.showAlert).toHaveBeenCalledWith(
        'Conversion Error',
        expect.stringContaining('Could not process')
      );
    });

    it('should handle canvas blob conversion failure', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      // Mock direct embedding failure to trigger sanitization
      mockPdfDoc.embedJpg
        .mockRejectedValueOnce(new Error('Invalid JPG'))
        .mockResolvedValueOnce({
          width: 800,
          height: 600,
        });

      // Mock canvas that fails toBlob
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toBlob: vi.fn((callback) => callback(null))
      };

      document.createElement = vi.fn((tag: string): any => {
        if (tag === 'canvas') {
          return mockCanvas;
        }
        return originalCreateElement.call(document, tag);
      });

      // Mock successful image load
      global.Image = class MockImage {
        naturalWidth = 800;
        naturalHeight = 600;
        onload: (() => void) | null = null;
        src = '';
        constructor() {
          queueMicrotask(() => this.onload?.());
        }
      } as any;

      await jpgToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Conversion Error',
        expect.stringContaining('Could not process')
      );
    });
  });

  // -------------------- PDF Generation Tests --------------------
  describe('PDF Generation', () => {
    it('should create PDF with correct dimensions', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      const imageSize = { width: 1920, height: 1080 };
      mockPdfDoc.embedJpg.mockResolvedValueOnce(imageSize);

      await jpgToPdf();

      expect(mockPdfDoc.addPage).toHaveBeenCalledWith([imageSize.width, imageSize.height]);
      const page = mockPdfDoc.addPage.mock.results[0].value;
      expect(page.drawImage).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          x: 0,
          y: 0,
          width: imageSize.width,
          height: imageSize.height,
        })
      );
    });

    it('should download PDF with correct name', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      await jpgToPdf();

      expect(helpers.downloadFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'from_jpgs.pdf'
      );
    });

    it('should handle PDF generation errors', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      mockPdfDoc.save.mockRejectedValueOnce(new Error('PDF generation failed'));

      await jpgToPdf();

      expect(ui.showAlert).toHaveBeenCalledWith(
        'Conversion Error',
        expect.stringContaining('PDF generation failed')
      );
    });
  });

  // -------------------- Resource Management Tests --------------------
  describe('Resource Management', () => {
    it('should cleanup URL objects after processing', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      // Mock direct embedding failure to trigger sanitization path
      mockPdfDoc.embedJpg
        .mockRejectedValueOnce(new Error('Invalid JPG'))
        .mockResolvedValueOnce({
          width: 800,
          height: 600,
        });

      // Mock Image with immediate onload trigger
      global.Image = class MockImage {
        naturalWidth = 800;
        naturalHeight = 600;
        onload: (() => void) | null = null;
        constructor() {
          queueMicrotask(() => this.onload?.());
        }
      } as any;

      await jpgToPdf();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should cleanup URL objects on error', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      // Mock Image loading error
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        src = '';
        constructor() {
          queueMicrotask(() => this.onerror?.());
        }
      } as any;

      // Mock embedding failure to trigger sanitization
      mockPdfDoc.embedJpg.mockRejectedValueOnce(new Error('Invalid JPG'));

      await jpgToPdf();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should show and hide loader properly', async () => {
      const mockFile = new File(['jpg data'], 'test.jpg', { type: 'image/jpeg' });
      state.files = [mockFile];

      await jpgToPdf();

      expect(ui.showLoader).toHaveBeenCalledWith('Creating PDF from JPGs...');
      expect(ui.hideLoader).toHaveBeenCalled();
    });
  });
});