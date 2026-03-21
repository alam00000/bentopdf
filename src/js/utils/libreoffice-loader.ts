/**
 * LibreOffice WASM Converter Wrapper
 * 
 * Uses @matbee/libreoffice-converter package for document conversion.
 * Handles progress tracking and provides simpler API.
 */

import { WorkerBrowserConverter } from '@matbee/libreoffice-converter/browser';

const LIBREOFFICE_LOCAL_PATH = import.meta.env.BASE_URL + 'libreoffice-wasm/';

export interface LoadProgress {
    phase: 'loading' | 'initializing' | 'converting' | 'complete' | 'ready';
    percent: number;
    message: string;
}

export type ProgressCallback = (progress: LoadProgress) => void;

// Singleton for converter instance
let converterInstance: LibreOfficeConverter | null = null;

export class LibreOfficeConverter {
    private converter: WorkerBrowserConverter | null = null;
    private initialized = false;
    private initializing = false;
    private basePath: string;

    constructor(basePath?: string) {
        this.basePath = basePath || LIBREOFFICE_LOCAL_PATH;
    }

    async initialize(onProgress?: ProgressCallback): Promise<void> {
        if (this.initialized) return;

        if (this.initializing) {
            while (this.initializing) {
                await new Promise(r => setTimeout(r, 100));
            }
            return;
        }


        this.initializing = true;
        let progressCallback = onProgress; // Store original callback

        try {
            progressCallback?.({ phase: 'loading', percent: 0, message: 'Loading conversion engine...' });

            this.converter = new WorkerBrowserConverter({
                sofficeJs: `${this.basePath}soffice.js`,
                sofficeWasm: `${this.basePath}soffice.wasm.gz`,
                sofficeData: `${this.basePath}soffice.data.gz`,
                sofficeWorkerJs: `${this.basePath}soffice.worker.js`,
                browserWorkerJs: `${this.basePath}browser.worker.global.js`,
                verbose: false,
                onProgress: (info: { phase: string; percent: number; message: string }) => {
                    if (progressCallback && !this.initialized) {
                        const simplifiedMessage = `Loading conversion engine (${Math.round(info.percent)}%)...`;
                        progressCallback({
                            phase: info.phase as LoadProgress['phase'],
                            percent: info.percent,
                            message: simplifiedMessage
                        });
                    }
                },
                onReady: () => {
                    console.log('[LibreOffice] Ready!');
                },
                onError: (error: Error) => {
                    console.error('[LibreOffice] Error:', error);
                },
            });

            await this.converter.initialize();
            this.initialized = true;

            // Call completion message
            progressCallback?.({ phase: 'ready', percent: 100, message: 'Conversion engine ready!' });

            // Null out the callback to prevent any late-firing progress updates
            progressCallback = undefined;
        } finally {
            this.initializing = false;
        }
    }

    isReady(): boolean {
        return this.initialized && this.converter !== null;
    }

    async convertToPdf(file: File): Promise<Blob> {
        if (!this.converter) {
            throw new Error('Converter not initialized');
        }

        console.log(`[LibreOffice] Converting ${file.name} to PDF...`);
        console.log(`[LibreOffice] File type: ${file.type}, Size: ${file.size} bytes`);

        try {
            console.log(`[LibreOffice] Reading file as ArrayBuffer...`);
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            console.log(`[LibreOffice] File loaded, ${uint8Array.length} bytes`);

            console.log(`[LibreOffice] Calling converter.convert() with buffer...`);
            const startTime = Date.now();

            // Detect input format - critical for CSV to apply import filters
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            console.log(`[LibreOffice] Detected format from extension: ${ext}`);

            const result = await this.converter.convert(uint8Array, {
                outputFormat: 'pdf',
                inputFormat: ext as any, // Explicitly specify format for CSV import filters
            }, file.name);

            const duration = Date.now() - startTime;
            console.log(`[LibreOffice] Conversion complete! Duration: ${duration}ms, Size: ${result.data.length} bytes`);

            // Create a copy to avoid SharedArrayBuffer type issues
            const data = new Uint8Array(result.data);
            return new Blob([data], { type: result.mimeType });
        } catch (error) {
            console.error(`[LibreOffice] Conversion FAILED for ${file.name}:`, error);
            console.error(`[LibreOffice] Error details:`, {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    async wordToPdf(file: File): Promise<Blob> {
        return this.convertToPdf(file);
    }

    async pptToPdf(file: File): Promise<Blob> {
        return this.convertToPdf(file);
    }

    async excelToPdf(file: File): Promise<Blob> {
        return this.convertToPdf(file);
    }

    async destroy(): Promise<void> {
        if (this.converter) {
            await this.converter.destroy();
        }
        this.converter = null;
        this.initialized = false;
    }
}

export function getLibreOfficeConverter(basePath?: string): LibreOfficeConverter {
    if (!converterInstance) {
        converterInstance = new LibreOfficeConverter(basePath);
    }
    return converterInstance;
}
