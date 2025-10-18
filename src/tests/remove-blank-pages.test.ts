import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setupRemoveBlankPagesTool,
  removeBlankPages,
} from '@/js/logic/remove-blank-pages';
import * as ui from '@/js/ui';
import * as helpers from '@/js/utils/helpers';
import { state } from '@/js/state';
import { PDFDocument } from 'pdf-lib';

if (typeof ImageData === 'undefined') {
  global.ImageData = class {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace: string;
    constructor(
      data: Uint8ClampedArray,
      width: number,
      height: number,
      options?: { colorSpace: string }
    ) {
      this.data = data;
      this.width = width;
      this.height = height;
      this.colorSpace = options?.colorSpace || 'srgb';
    }
  } as any;
}

const mockContext: CanvasRenderingContext2D = {
  getImageData: vi.fn(),
  drawImage: vi.fn(),
  putImageData: vi.fn(),
} as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockContext);
HTMLCanvasElement.prototype.toDataURL = vi
  .fn()
  .mockReturnValue('data:image/png;base64,mock');

function createMockPage(isBlank: boolean) {
  return {
    getViewport: vi.fn(({ scale }) => ({
      width: 800 * scale,
      height: 600 * scale,
      scale,
    })),
    render: vi.fn(() => {
      // Return ImageData depending on blank/content
      mockContext.getImageData = vi.fn(() => {
        const size = 100 * 100 * 4;
        const data = new Uint8ClampedArray(size);

        if (isBlank) {
          data.fill(255); // fully white = blank
        } else {
          // Mostly black pixels to simulate content
          data.fill(0);
          // leave some white pixels so analysis updates text
          for (let i = 0; i < 400; i += 4) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          }
        }

        return new ImageData(data, 100, 100, { colorSpace: 'srgb' });
      });
      return { promise: Promise.resolve() };
    }),
  };
}

// -------------------- MOCK pdfjs-dist --------------------
const mockPdfJsDoc = {
  numPages: 3,
  getPage: vi.fn((pageNum: number) => {
    if (pageNum === 2) return Promise.resolve(createMockPage(true)); // Page 2 blank
    return Promise.resolve(createMockPage(false)); // Pages 1 & 3 content
  }),
};

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(() => ({ promise: Promise.resolve(mockPdfJsDoc) })),
}));

// -------------------- MOCK MODULES --------------------
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

// -------------------- TEST SUITE --------------------
describe('Remove Blank Pages Tool', () => {
  let mockNewDoc: any;

  beforeEach(() => {
    // Reset state pdfDoc
    state.pdfDoc = {
      getPageCount: () => 3,
      save: vi.fn(),
      copyPages: vi.fn(),
      addPage: vi.fn(),
    } as any;

    // Mock PDFDocument.create
    mockNewDoc = {
      copyPages: vi.fn((doc: any, indices: number[]) =>
        Promise.resolve(indices.map((i: number) => ({ page: `page-${i}` })))
      ),
      addPage: vi.fn(),
      save: vi.fn(() => Promise.resolve(new Uint8Array([4, 5, 6]))),
    };
    vi.mocked(PDFDocument.create).mockResolvedValue(mockNewDoc);

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

  // -------------------- TEST CASES --------------------

  it('should remove blank pages successfully', async () => {
    document.body.innerHTML = `
      <div id="analysis-text"></div>
      <input id="sensitivity-slider" type="range" min="0" max="100" value="95" />
      <span id="sensitivity-value"></span>
      <div id="analysis-preview" class="hidden"></div>
      <div id="removed-pages-thumbnails"></div>
    `;

    await setupRemoveBlankPagesTool();
    await removeBlankPages();

    expect(ui.showLoader).toHaveBeenCalledWith('Removing blank pages...');
    expect(PDFDocument.create).toHaveBeenCalled();
    expect(mockNewDoc.copyPages).toHaveBeenCalled();
    expect(mockNewDoc.addPage).toHaveBeenCalled();
    expect(mockNewDoc.save).toHaveBeenCalled();
    expect(helpers.downloadFile).toHaveBeenCalled();
    expect(ui.hideLoader).toHaveBeenCalled();
  });

  it('should handle all pages blank gracefully', async () => {
    mockPdfJsDoc.getPage = vi.fn(() => Promise.resolve(createMockPage(true))); // all pages blank

    document.body.innerHTML = `
      <div id="analysis-text"></div>
      <input id="sensitivity-slider" type="range" min="0" max="100" value="95" />
      <span id="sensitivity-value"></span>
      <div id="analysis-preview" class="hidden"></div>
      <div id="removed-pages-thumbnails"></div>
    `;

    await setupRemoveBlankPagesTool();
    await removeBlankPages();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'No Content Found',
      expect.stringContaining('All pages were identified as blank')
    );
    expect(helpers.downloadFile).not.toHaveBeenCalled();
  });

  it('should handle no blank pages gracefully', async () => {
    mockPdfJsDoc.getPage = vi.fn(() => Promise.resolve(createMockPage(false))); // all pages content

    document.body.innerHTML = `
      <div id="analysis-text"></div>
      <input id="sensitivity-slider" type="range" min="0" max="100" value="95" />
      <span id="sensitivity-value"></span>
      <div id="analysis-preview" class="hidden"></div>
      <div id="removed-pages-thumbnails"></div>
    `;

    await setupRemoveBlankPagesTool();
    await removeBlankPages();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'No Pages Removed',
      'No pages were identified as blank at the current sensitivity level.'
    );
    expect(helpers.downloadFile).not.toHaveBeenCalled();
  });
});
