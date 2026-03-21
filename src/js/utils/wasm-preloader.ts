import { getLibreOfficeConverter } from './libreoffice-loader.js';
import { isWasmAvailable, getWasmBaseUrl } from '../config/wasm-cdn-config.js';

export enum PreloadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  UNAVAILABLE = 'unavailable',
}

interface PreloadState {
  libreoffice: PreloadStatus;
  pymupdf: PreloadStatus;
  ghostscript: PreloadStatus;
}

const preloadState: PreloadState = {
  libreoffice: PreloadStatus.IDLE,
  pymupdf: PreloadStatus.IDLE,
  ghostscript: PreloadStatus.IDLE,
};

export function getPreloadStatus(): Readonly<PreloadState> {
  return { ...preloadState };
}

async function preloadPyMuPDF(): Promise<void> {
  if (preloadState.pymupdf !== PreloadStatus.IDLE) return;

  if (!isWasmAvailable('pymupdf')) {
    preloadState.pymupdf = PreloadStatus.UNAVAILABLE;
    console.log('[Preloader] PyMuPDF not configured, skipping preload');
    return;
  }

  preloadState.pymupdf = PreloadStatus.LOADING;
  console.log('[Preloader] Starting PyMuPDF preload...');

  try {
    const pymupdfBaseUrl = getWasmBaseUrl('pymupdf')!;
    const gsBaseUrl = getWasmBaseUrl('ghostscript');
    const normalizedUrl = pymupdfBaseUrl.endsWith('/')
      ? pymupdfBaseUrl
      : `${pymupdfBaseUrl}/`;

    const wrapperUrl = `${normalizedUrl}dist/index.js`;
    const module = await import(/* @vite-ignore */ wrapperUrl);

    const pymupdfInstance = new module.PyMuPDF({
      assetPath: `${normalizedUrl}assets/`,
      ghostscriptUrl: gsBaseUrl || '',
    });
    await pymupdfInstance.load();
    preloadState.pymupdf = PreloadStatus.READY;
    console.log('[Preloader] PyMuPDF ready');
  } catch (e) {
    preloadState.pymupdf = PreloadStatus.ERROR;
    console.warn('[Preloader] PyMuPDF preload failed:', e);
  }
}

async function preloadGhostscript(): Promise<void> {
  if (preloadState.ghostscript !== PreloadStatus.IDLE) return;

  if (!isWasmAvailable('ghostscript')) {
    preloadState.ghostscript = PreloadStatus.UNAVAILABLE;
    console.log('[Preloader] Ghostscript not configured, skipping preload');
    return;
  }

  preloadState.ghostscript = PreloadStatus.LOADING;
  console.log('[Preloader] Starting Ghostscript WASM preload...');

  try {
    const { loadGsModule, setCachedGsModule } =
      await import('./ghostscript-loader.js');

    const gsModule = await loadGsModule();
    setCachedGsModule(gsModule as any);
    preloadState.ghostscript = PreloadStatus.READY;
    console.log('[Preloader] Ghostscript WASM ready');
  } catch (e) {
    preloadState.ghostscript = PreloadStatus.ERROR;
    console.warn('[Preloader] Ghostscript preload failed:', e);
  }
}

function scheduleIdleTask(task: () => Promise<void>): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => task(), { timeout: 5000 });
  } else {
    setTimeout(() => task(), 1000);
  }
}

export function startBackgroundPreload(): void {
  console.log('[Preloader] Scheduling background WASM preloads...');

  const libreOfficePages = [
    'word-to-pdf',
    'excel-to-pdf',
    'ppt-to-pdf',
    'powerpoint-to-pdf',
    'docx-to-pdf',
    'xlsx-to-pdf',
    'pptx-to-pdf',
    'csv-to-pdf',
    'rtf-to-pdf',
    'odt-to-pdf',
    'ods-to-pdf',
    'odp-to-pdf',
  ];

  const currentPath = window.location.pathname;
  const isLibreOfficePage = libreOfficePages.some((page) =>
    currentPath.includes(page)
  );

  if (isLibreOfficePage) {
    console.log(
      '[Preloader] Skipping preloads on LibreOffice page to save memory'
    );
    return;
  }

  scheduleIdleTask(async () => {
    console.log('[Preloader] Starting sequential WASM preloads...');

    await preloadPyMuPDF();
    await preloadGhostscript();

    console.log('[Preloader] Sequential preloads complete');
  });
}
