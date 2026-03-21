import { WasmProvider } from './wasm-provider';

let cpdfLoaded = false;
let cpdfLoadPromise: Promise<void> | null = null;

function getCpdfUrl(): string | undefined {
  const userUrl = WasmProvider.getUrl('cpdf');
  if (userUrl) {
    const baseUrl = userUrl.endsWith('/') ? userUrl : `${userUrl}/`;
    return `${baseUrl}coherentpdf.browser.min.js`;
  }
  return undefined;
}

export function isCpdfAvailable(): boolean {
  return WasmProvider.isConfigured('cpdf');
}

export async function isCpdfLoaded(): Promise<void> {
  if (cpdfLoaded) return;

  if (cpdfLoadPromise) {
    return cpdfLoadPromise;
  }

  const cpdfUrl = getCpdfUrl();
  if (!cpdfUrl) {
    throw new Error(
      'CoherentPDF is not configured. Please configure it in WASM Settings.'
    );
  }

  cpdfLoadPromise = new Promise((resolve, reject) => {
    if (typeof (window as any).coherentpdf !== 'undefined') {
      cpdfLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = cpdfUrl;
    script.onload = () => {
      cpdfLoaded = true;
      console.log('[CPDF] Loaded from:', script.src);
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load CoherentPDF library from: ' + cpdfUrl));
    };
    document.head.appendChild(script);
  });

  return cpdfLoadPromise;
}

export async function getCpdf(): Promise<any> {
  await isCpdfLoaded();
  return (window as any).coherentpdf;
}
