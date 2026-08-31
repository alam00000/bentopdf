import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Covers the interception that replaces browser downloads with the OS share
 * sheet. This is the one change that every tool in the app depends on, so it
 * is tested at the level the tools actually use: `<a download>` + `.click()`.
 */
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => true,
    getPlatform: () => 'ios',
    isPluginAvailable: () => true,
  },
}));

const writeFile = vi.fn().mockResolvedValue({ uri: 'file:///cache/out.pdf' });
const mkdir = vi.fn().mockResolvedValue(undefined);
const getUri = vi.fn().mockResolvedValue({ uri: 'file:///cache/out.pdf' });
const share = vi.fn().mockResolvedValue(undefined);

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: { writeFile, mkdir, getUri },
  Directory: { Cache: 'CACHE', Documents: 'DOCUMENTS' },
}));

vi.mock('@capacitor/share', () => ({ Share: { share } }));

const originalClick = HTMLAnchorElement.prototype.click;

/**
 * Lets the interception's internal chain settle. It hops through FileReader,
 * which resolves on a macrotask, so microtask flushing alone is not enough.
 */
const flush = async (): Promise<void> => {
  for (let i = 0; i < 10; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

describe('native downloads', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    HTMLAnchorElement.prototype.click = originalClick;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => new Blob(['%PDF-1.7'], { type: 'application/pdf' }),
      })
    );
  });

  afterEach(() => {
    HTMLAnchorElement.prototype.click = originalClick;
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  const clickDownload = async (
    href: string,
    filename: string | null
  ): Promise<HTMLAnchorElement> => {
    const { initNativeDownloads } = await import('@/js/native/save');
    initNativeDownloads();

    const anchor = document.createElement('a');
    anchor.href = href;
    if (filename !== null) anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    await flush();
    return anchor;
  };

  it('routes a generated download to the share sheet', async () => {
    await clickDownload('blob:http://localhost/abc', 'merged.pdf');

    expect(writeFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'BentoPDF/merged.pdf',
        directory: 'CACHE',
      })
    );
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ files: ['file:///cache/out.pdf'] })
    );
  });

  it('falls back to a Documents save when sharing is dismissed', async () => {
    share.mockRejectedValueOnce(new Error('cancelled'));
    await clickDownload('blob:http://localhost/abc', 'report.pdf');

    expect(writeFile).toHaveBeenLastCalledWith(
      expect.objectContaining({
        path: 'BentoPDF/report.pdf',
        directory: 'DOCUMENTS',
      })
    );
  });

  it('strips path separators from the filename', async () => {
    await clickDownload('blob:http://localhost/abc', '../../etc/passwd.pdf');

    expect(writeFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'BentoPDF/..-..-etc-passwd.pdf' })
    );
  });

  it('leaves ordinary navigation links alone', async () => {
    const { initNativeDownloads } = await import('@/js/native/save');
    initNativeDownloads();

    const anchor = document.createElement('a');
    anchor.href = '/merge-pdf.html';
    document.body.appendChild(anchor);
    anchor.click();
    await flush();

    expect(writeFile).not.toHaveBeenCalled();
    expect(share).not.toHaveBeenCalled();
  });

  it('reports a failure instead of silently losing the file', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );
    await clickDownload('blob:http://localhost/gone', 'missing.pdf');

    expect(writeFile).not.toHaveBeenCalled();
    expect(document.querySelector('.native-toast')?.textContent).toBe(
      'Could not prepare the file'
    );
  });
});
