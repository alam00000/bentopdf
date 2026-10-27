import { describe, it, expect, vi, beforeEach } from 'vitest';

const STORAGE_KEY = 'bentopdf:wasm-providers';
const CURRENT_PYMUPDF =
  'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/';

async function loadProvider(stored?: Record<string, string>) {
  localStorage.clear();
  if (stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  vi.resetModules();
  return (await import('../js/utils/wasm-provider')).WasmProvider;
}

function storedConfig(): Record<string, string> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('WasmProvider saved URLs', () => {
  it('replaces an outdated CDN version saved in the browser with the current one', async () => {
    const provider = await loadProvider({
      pymupdf: 'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.14/',
      ghostscript:
        'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.0/assets/',
      cpdf: 'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.4/dist/',
    });

    expect(provider.getUrl('pymupdf')).toBe(CURRENT_PYMUPDF);
    expect(provider.getUrl('ghostscript')).toBe(
      'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/'
    );
    expect(provider.getUrl('cpdf')).toBe(
      'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/'
    );
    expect(provider.isUserConfigured('pymupdf')).toBe(false);
    expect(storedConfig()).toEqual({});
  });

  it('keeps a self-hosted URL the user chose', async () => {
    const provider = await loadProvider({
      pymupdf: 'http://localhost/wasm/pymupdf/',
    });

    expect(provider.getUrl('pymupdf')).toBe('http://localhost/wasm/pymupdf/');
    expect(storedConfig().pymupdf).toBe('http://localhost/wasm/pymupdf/');
  });

  it('does not pin the default when it is saved, so later updates still apply', async () => {
    const provider = await loadProvider();

    provider.setUrl('pymupdf', CURRENT_PYMUPDF.slice(0, -1));
    expect(storedConfig().pymupdf).toBeUndefined();
    expect(provider.isUserConfigured('pymupdf')).toBe(false);
    expect(provider.getUrl('pymupdf')).toBe(CURRENT_PYMUPDF);

    provider.setUrl('pymupdf', 'http://localhost/wasm/pymupdf');
    expect(storedConfig().pymupdf).toBe('http://localhost/wasm/pymupdf/');
  });
});
