import { WasmProvider } from './wasm-provider.js';
import type {
  GlobalScopeWithGhostscript,
  GhostscriptDynamicInstance,
} from '@/types';

let cachedGS: GhostscriptInterface | null = null;
let loadPromise: Promise<GhostscriptInterface> | null = null;

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

      const globalScope = (
        typeof globalThis !== 'undefined' ? globalThis : window
      ) as typeof globalThis & GlobalScopeWithGhostscript;

      if (typeof globalScope.loadGS === 'function') {
        const instance = await globalScope.loadGS({
          baseUrl: normalizedUrl,
        });
        cachedGS = instance as unknown as GhostscriptInterface;
      } else if (typeof globalScope.GhostscriptWASM === 'function') {
        const instance: GhostscriptDynamicInstance =
          new globalScope.GhostscriptWASM(normalizedUrl);
        await instance.init?.();
        cachedGS = instance as unknown as GhostscriptInterface;
      } else {
        throw new Error(
          'Ghostscript wrapper did not expose expected interface. Expected loadGS() or GhostscriptWASM class.'
        );
      }

      return cachedGS;
    } catch (error: unknown) {
      loadPromise = null;
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load Ghostscript from ${normalizedUrl}: ${msg}`,
        { cause: error }
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
