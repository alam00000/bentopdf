import { WasmProvider } from './wasm-provider.js';

let cachedGS: any = null;
let loadPromise: Promise<any> | null = null;

export interface GhostscriptInterface {
  convertToPDFA(pdfBuffer: ArrayBuffer, profile: string): Promise<ArrayBuffer>;
  fontToOutline(pdfBuffer: ArrayBuffer): Promise<ArrayBuffer>;
}

export async function loadGhostscript(): Promise<GhostscriptInterface> {
  if (cachedGS) {
    return cachedGS;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const baseUrl = WasmProvider.getUrl('ghostscript');
    if (!baseUrl) {
      throw new Error(
        'Ghostscript is not configured. Please configure it in Advanced Settings.'
      );
    }

    const normalizedUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    try {
      const wrapperUrl = `${normalizedUrl}gs.js`;

      await loadScript(wrapperUrl);

      const globalScope =
        typeof globalThis !== 'undefined' ? globalThis : window;

      if (typeof (globalScope as any).loadGS === 'function') {
        cachedGS = await (globalScope as any).loadGS({
          baseUrl: normalizedUrl,
        });
      } else if (typeof (globalScope as any).GhostscriptWASM === 'function') {
        cachedGS = new (globalScope as any).GhostscriptWASM(normalizedUrl);
        await cachedGS.init?.();
      } else {
        throw new Error(
          'Ghostscript wrapper did not expose expected interface. Expected loadGS() or GhostscriptWASM class.'
        );
      }

      return cachedGS;
    } catch (error: any) {
      loadPromise = null;
      throw new Error(
        `Failed to load Ghostscript from ${normalizedUrl}: ${error.message}`
      );
    }
  })();

  return loadPromise;
}

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

    document.head.appendChild(script);
  });
}

export function isGhostscriptAvailable(): boolean {
  return WasmProvider.isConfigured('ghostscript');
}

export function clearGhostscriptCache(): void {
  cachedGS = null;
  loadPromise = null;
}
