import { getLibreOfficeConverter } from './libreoffice-loader.js';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import loadGsWASM from '@bentopdf/gs-wasm';
import { setCachedGsModule } from './ghostscript-loader.js';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

export enum PreloadStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    READY = 'ready',
    ERROR = 'error'
}

interface PreloadState {
    libreoffice: PreloadStatus;
    pymupdf: PreloadStatus;
    ghostscript: PreloadStatus;
}

const preloadState: PreloadState = {
    libreoffice: PreloadStatus.IDLE,
    pymupdf: PreloadStatus.IDLE,
    ghostscript: PreloadStatus.IDLE
};

let pymupdfInstance: PyMuPDF | null = null;

export function getPreloadStatus(): Readonly<PreloadState> {
    return { ...preloadState };
}

export function getPymupdfInstance(): PyMuPDF | null {
    return pymupdfInstance;
}

async function preloadLibreOffice(): Promise<void> {
    if (preloadState.libreoffice !== PreloadStatus.IDLE) return;

    preloadState.libreoffice = PreloadStatus.LOADING;
    console.log('[Preloader] Starting LibreOffice WASM preload...');

    try {
        const converter = getLibreOfficeConverter();
        await converter.initialize();
        preloadState.libreoffice = PreloadStatus.READY;
        console.log('[Preloader] LibreOffice WASM ready');
    } catch (e) {
        preloadState.libreoffice = PreloadStatus.ERROR;
        console.warn('[Preloader] LibreOffice preload failed:', e);
    }
}

async function preloadPyMuPDF(): Promise<void> {
    if (preloadState.pymupdf !== PreloadStatus.IDLE) return;

    preloadState.pymupdf = PreloadStatus.LOADING;
    console.log('[Preloader] Starting PyMuPDF preload...');

    try {
        const pymupdfBaseUrl = getWasmBaseUrl('pymupdf');
        pymupdfInstance = new PyMuPDF(pymupdfBaseUrl);
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

    preloadState.ghostscript = PreloadStatus.LOADING;
    console.log('[Preloader] Starting Ghostscript WASM preload...');

    try {
        const gsBaseUrl = getWasmBaseUrl('ghostscript');
        const gsModule = await loadGsWASM({
            locateFile: (path: string) => {
                if (path.endsWith('.wasm')) {
                    return gsBaseUrl + 'gs.wasm';
                }
                return path;
            },
            print: () => { },
            printErr: () => { },
        });
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
        'word-to-pdf', 'excel-to-pdf', 'ppt-to-pdf', 'powerpoint-to-pdf',
        'docx-to-pdf', 'xlsx-to-pdf', 'pptx-to-pdf', 'csv-to-pdf',
        'rtf-to-pdf', 'odt-to-pdf', 'ods-to-pdf', 'odp-to-pdf'
    ];

    const currentPath = window.location.pathname;
    const isLibreOfficePage = libreOfficePages.some(page => currentPath.includes(page));

    if (isLibreOfficePage) {
        console.log('[Preloader] Skipping preloads on LibreOffice page to save memory');
        return;
    }

    scheduleIdleTask(async () => {
        console.log('[Preloader] Starting sequential WASM preloads...');

        await preloadPyMuPDF();
        await preloadGhostscript();

        console.log('[Preloader] Sequential preloads complete (LibreOffice skipped - loaded on demand)');
    });
}

