import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import JSZip from 'jszip';
import * as helpers from '../js/utils/helpers';
import * as ui from '../js/ui';
import { state } from '../js/state';
import { compress } from '../js/logic/compress';
import { PDFDocument } from 'pdf-lib';

// --- Mock UI functions ---
vi.mock('../js/ui', () => ({
  showLoader: vi.fn(),
  hideLoader: vi.fn(),
  showAlert: vi.fn(),
}));

// --- Mock helpers ---
vi.mock('../js/utils/helpers', () => ({
  readFileAsArrayBuffer: vi.fn(),
  downloadFile: vi.fn(),
  formatBytes: (size: number) => `${size}B`,
}));

// --- Mock PDF-lib ---
vi.mock('pdf-lib', async () => {
  const actual = await vi.importActual<typeof import('pdf-lib')>('pdf-lib');
  return {
    ...actual,
    PDFDocument: {
      load: vi.fn().mockResolvedValue({
        getPages: vi.fn().mockReturnValue([{ node: { Resources: () => null } }]),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        setTitle: vi.fn(),
        setAuthor: vi.fn(),
        setSubject: vi.fn(),
        setKeywords: vi.fn(),
        setCreator: vi.fn(),
        setProducer: vi.fn(),
      }),
      create: vi.fn().mockResolvedValue({
        addPage: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
        embedJpg: vi.fn().mockResolvedValue({}),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      }),
    },
  };
});
vi.mock('pdfjs-dist', () => {
  return {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(() => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getViewport: vi.fn().mockReturnValue({ width: 100, height: 100 }),
          render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
        }),
      }),
    })),
  };
});
// --- Mock canvas & Image for Node environment ---
class MockCanvas {
  width = 0;
  height = 0;
  getContext = vi.fn().mockReturnValue({
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'medium',
    filter: '',
  });
  toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,abc');
}

vi.stubGlobal('HTMLCanvasElement', MockCanvas as any);

vi.stubGlobal('Image', class {
  onload: Function = () => {};
  onerror: Function = () => {};
  set src(_url: string) { setTimeout(() => this.onload(), 0); }
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn().mockReturnValue('blob://mock'),
  revokeObjectURL: vi.fn(),
});


beforeEach(() => {
  state.files = [];
  vi.clearAllMocks();

  // Fake DOM inputs
  document.body.innerHTML = `
    <input id="compression-level" value="balanced" />
    <input id="compression-algorithm" value="vector" />
  `;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('compress()', () => {
  it('should show alert if no PDFs are loaded', async () => {
    state.files = [];
    await compress();
    expect(ui.showAlert).toHaveBeenCalledWith('Error', 'No PDF files found to compress.');
  });

  it('should compress multiple PDFs successfully (vector)', async () => {
    const mockFile = (name: string, size = 1000) => ({
      name,
      type: 'application/pdf',
      size,
    });
    state.files = [mockFile('a.pdf'), mockFile('b.pdf')];

    vi.spyOn(helpers, 'readFileAsArrayBuffer').mockResolvedValue(new ArrayBuffer(8));
    vi.spyOn(helpers, 'downloadFile').mockImplementation(() => {});

    await compress();

    expect(ui.showLoader).toHaveBeenCalledWith(expect.stringContaining('Compressing 2 PDF'));
    expect(helpers.downloadFile).toHaveBeenCalledWith(expect.any(Blob), 'compressed_pdfs.zip');
    expect(ui.showAlert).toHaveBeenCalledWith(
      'All Files Compressed',
      expect.stringContaining('Total saved:')
    );
  });

  it('should handle errors gracefully', async () => {
    state.files = [{ name: 'a.pdf', type: 'application/pdf', size: 1000 }];
    vi.spyOn(helpers, 'readFileAsArrayBuffer').mockRejectedValue(new Error('read failed'));

    await compress();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'Error',
      expect.stringContaining('An error occurred during compression')
    );
    expect(ui.hideLoader).toHaveBeenCalled();
  });

  it('should fallback to Photon when vector compression does not reduce size', async () => {
    state.files = [{ name: 'a.pdf', type: 'application/pdf', size: 1000 }];
    vi.spyOn(helpers, 'readFileAsArrayBuffer').mockResolvedValue(new ArrayBuffer(8));

    // Force vector compression to not reduce size
    vi.spyOn(PDFDocument, 'load').mockResolvedValueOnce({
      getPages: () => [{ node: { Resources: () => null } }],
      save: async () => new Uint8Array(1000), // same size as input
      setTitle: vi.fn(),
      setAuthor: vi.fn(),
      setSubject: vi.fn(),
      setKeywords: vi.fn(),
      setCreator: vi.fn(),
      setProducer: vi.fn(),
    } as any);

    await compress();

    expect(ui.showAlert).toHaveBeenCalledWith(
      'Compression Finished',
      expect.stringContaining('Could not reduce file size'),
      'warning'
    );
    expect(ui.showAlert).toHaveBeenCalledWith(
      'All Files Compressed',
      expect.stringContaining('Total saved: 0.0%')
    );
  });
});
