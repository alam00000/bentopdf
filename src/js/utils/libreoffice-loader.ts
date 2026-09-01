/**
 * LibreOffice WASM Converter Wrapper
 *
 * Uses @matbee/libreoffice-converter package for document conversion.
 * Handles progress tracking and provides simpler API.
 */

import { WorkerBrowserConverter } from '@matbee/libreoffice-converter/browser';
import type {
  InputFormat,
  OutputFormat,
} from '@matbee/libreoffice-converter/browser';

const LIBREOFFICE_LOCAL_PATH = import.meta.env.BASE_URL + 'libreoffice-wasm/';

export interface LoadProgress {
  phase: 'loading' | 'initializing' | 'converting' | 'complete' | 'ready';
  percent: number;
  message: string;
}

export type ProgressCallback = (progress: LoadProgress) => void;

/** What the engine can tell us about a document before we render it. */
export interface OfficeDocumentInfo {
  documentTypeName: string;
  pageCount: number;
  validOutputFormats: OutputFormat[];
}

/** One rendered page, as raw RGBA ready for a canvas. */
export interface RenderedPage {
  page: number;
  width: number;
  height: number;
  data: Uint8Array;
}

/** A document held open in the engine so edits can accumulate. */
export interface OfficeSession {
  sessionId: string;
  documentType: 'writer' | 'calc' | 'impress' | 'draw' | string;
  pageCount: number;
}

export interface OfficeParagraph {
  index: number;
  text: string;
  style?: string;
  charCount?: number;
}

export interface OfficeSheet {
  index: number;
  name: string;
  usedRange?: string;
  rowCount?: number;
  colCount?: number;
}

/** Shape of `getStructure`, narrowed to the parts we actually display. */
export interface OfficeStructure {
  type?: string;
  paragraphs?: OfficeParagraph[];
  sheets?: OfficeSheet[];
  slides?: Array<{ index: number; title?: string }>;
  pageCount?: number;
  wordCount?: number;
}

// Singleton for converter instance
let converterInstance: LibreOfficeConverter | null = null;

const GZIP_MAGIC_FIRST = 0x1f;
const GZIP_MAGIC_SECOND = 0x8b;

/**
 * The native apps ship these payloads as brotli rather than gzip. LibreOffice
 * dominates the install size (74 MB of ~105 MB when gzipped) and it arrives
 * pre-compressed, so the APK/IPA cannot squeeze it further - brotli takes the
 * same two files to ~47 MB. See `scripts/prepare-native-wasm.mjs`.
 *
 * The web build stays on gzip: `DecompressionStream` handles it natively, and
 * a web server negotiates its own encoding anyway.
 */
const PAYLOAD_EXTENSION = __NATIVE_APP__ ? '.br' : '.gz';

/** Output buffer handed to the decoder per step. */
const BROTLI_CHUNK_BYTES = 8 * 1024 * 1024;

/**
 * Decodes brotli in a stream rather than one shot. The payloads expand to
 * 141 MB and 95 MB; asking the decoder for that in a single buffer would need
 * it live in the WASM heap and again in JS. Collecting chunks and letting the
 * Blob own them keeps the peak to roughly one copy.
 */
async function brotliDecompressToBlob(source: Blob): Promise<Blob> {
  const brotli = await (await import('brotli-dec-wasm')).default;
  const stream = new brotli.DecompressStream();
  const chunks: Uint8Array[] = [];

  const reader = source.stream().getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      let input = value;
      // One input chunk can produce many output chunks.
      for (;;) {
        const result = stream.decompress(input, BROTLI_CHUNK_BYTES);
        if (result.buf.length) chunks.push(result.buf);

        if (result.code === brotli.BrotliStreamResultCode.NeedsMoreOutput) {
          input = input.subarray(result.input_offset);
          continue;
        }
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return new Blob(chunks as BlobPart[]);
}

async function fetchAsDecompressedUrl(
  url: string,
  mimeType: string
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  let blob = await response.blob();

  // The `__NATIVE_APP__` guard is what lets the web build drop the brotli
  // decoder entirely - without it the dynamic import is still emitted as a
  // chunk the website would never load.
  if (__NATIVE_APP__ && url.endsWith('.br')) {
    blob = await brotliDecompressToBlob(blob);
  } else {
    const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
    if (head[0] === GZIP_MAGIC_FIRST && head[1] === GZIP_MAGIC_SECOND) {
      const decompressed = blob
        .stream()
        .pipeThrough(new DecompressionStream('gzip'));
      blob = await new Response(decompressed).blob();
    }
  }

  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

/** LibreOffice keys its import filters off the extension, not the MIME type. */
const formatOf = (file: File): InputFormat =>
  (file.name.split('.').pop()?.toLowerCase() ?? '') as InputFormat;

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

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
        await new Promise((r) => setTimeout(r, 100));
      }
      return;
    }

    this.initializing = true;
    let progressCallback = onProgress; // Store original callback

    try {
      progressCallback?.({
        phase: 'loading',
        percent: 0,
        message: 'Loading conversion engine...',
      });

      const [sofficeWasmUrl, sofficeDataUrl] = await Promise.all([
        fetchAsDecompressedUrl(
          `${this.basePath}soffice.wasm${PAYLOAD_EXTENSION}`,
          'application/wasm'
        ),
        fetchAsDecompressedUrl(
          `${this.basePath}soffice.data${PAYLOAD_EXTENSION}`,
          'application/octet-stream'
        ),
      ]);

      this.converter = new WorkerBrowserConverter({
        sofficeJs: `${this.basePath}soffice.js`,
        sofficeWasm: sofficeWasmUrl,
        sofficeData: sofficeDataUrl,
        sofficeWorkerJs: `${this.basePath}soffice.worker.js`,
        browserWorkerJs: `${this.basePath}browser.worker.global.js`,
        verbose: false,
        onProgress: (info: {
          phase: string;
          percent: number;
          message: string;
        }) => {
          if (progressCallback && !this.initialized) {
            const simplifiedMessage = `Loading conversion engine (${Math.round(info.percent)}%)...`;
            progressCallback({
              phase: info.phase as LoadProgress['phase'],
              percent: info.percent,
              message: simplifiedMessage,
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
      progressCallback?.({
        phase: 'ready',
        percent: 100,
        message: 'Conversion engine ready!',
      });

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
    console.log(
      `[LibreOffice] File type: ${file.type}, Size: ${file.size} bytes`
    );

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

      const result = await this.converter.convert(
        uint8Array,
        {
          outputFormat: 'pdf',
          inputFormat: ext as InputFormat,
        },
        file.name
      );

      const duration = Date.now() - startTime;
      console.log(
        `[LibreOffice] Conversion complete! Duration: ${duration}ms, Size: ${result.data.length} bytes`
      );

      // Create a copy to avoid SharedArrayBuffer type issues
      const data = new Uint8Array(result.data);
      return new Blob([data], { type: result.mimeType });
    } catch (error) {
      console.error(`[LibreOffice] Conversion FAILED for ${file.name}:`, error);
      console.error(`[LibreOffice] Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Convert to any format LibreOffice reports as valid for this document.
   * `convertToPdf` is the common case; this is the general one.
   */
  async convertTo(file: File, outputFormat: OutputFormat): Promise<Blob> {
    const converter = this.requireConverter();
    const result = await converter.convert(
      new Uint8Array(await file.arrayBuffer()),
      { outputFormat, inputFormat: formatOf(file) },
      file.name
    );
    // Copy out of the worker's buffer to avoid SharedArrayBuffer typing issues.
    return new Blob([new Uint8Array(result.data)], { type: result.mimeType });
  }

  /** Document type, page count and the formats it can be exported to. */
  async getDocumentInfo(file: File): Promise<OfficeDocumentInfo> {
    const converter = this.requireConverter();
    const info = await converter.getDocumentInfo(
      new Uint8Array(await file.arrayBuffer()),
      { inputFormat: formatOf(file) }
    );
    return {
      documentTypeName: info.documentTypeName,
      pageCount: info.pageCount,
      validOutputFormats: info.validOutputFormats,
    };
  }

  /**
   * Render one page as RGBA pixels. Pages are rendered on demand rather than
   * all at once - a long document would otherwise pin hundreds of megabytes.
   */
  async renderPage(
    file: File,
    pageIndex: number,
    maxWidth = 1000
  ): Promise<RenderedPage> {
    const converter = this.requireConverter();
    return converter.renderSinglePage(
      new Uint8Array(await file.arrayBuffer()),
      { inputFormat: formatOf(file) },
      pageIndex,
      maxWidth
    );
  }

  /** The document's full plain text, for search and copy-out. */
  async extractText(file: File): Promise<string> {
    const converter = this.requireConverter();
    const info = await converter.getLokInfo(
      new Uint8Array(await file.arrayBuffer()),
      { inputFormat: formatOf(file) }
    );
    return info.allText ?? '';
  }

  /** Open a document for editing. Close it to get the modified bytes back. */
  async openDocument(file: File): Promise<OfficeSession> {
    const converter = this.requireConverter();
    const session = await converter.openDocument(
      new Uint8Array(await file.arrayBuffer()),
      { inputFormat: formatOf(file) }
    );
    return {
      sessionId: session.sessionId,
      documentType: session.documentType,
      pageCount: session.pageCount,
    };
  }

  /**
   * Run an editor operation against an open session.
   *
   * Not every operation the engine advertises actually works in this WASM
   * build - the ones routed through LibreOffice's search (find, replace,
   * replaceParagraph, deleteParagraph) raise a WebAssembly exception. Callers
   * get `{ ok: false }` rather than a throw, so the UI can stay honest about
   * what succeeded.
   */
  async editorOperation<T = unknown>(
    sessionId: string,
    method: string,
    args?: unknown[]
  ): Promise<{ ok: boolean; data?: T; error?: string }> {
    const converter = this.requireConverter();
    try {
      const result = await converter.editorOperation<T>(
        sessionId,
        method,
        args
      );
      return result?.success
        ? { ok: true, data: result.data }
        : { ok: false, error: result?.error ?? 'Operation failed' };
    } catch (error) {
      return { ok: false, error: describeError(error) };
    }
  }

  /** Close a session and get the edited document, if anything changed. */
  async closeDocument(sessionId: string): Promise<Uint8Array | undefined> {
    const converter = this.requireConverter();
    return converter.closeDocument(sessionId);
  }

  private requireConverter(): WorkerBrowserConverter {
    if (!this.converter) {
      throw new Error('Converter not initialized');
    }
    return this.converter;
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

export function getLibreOfficeConverter(
  basePath?: string
): LibreOfficeConverter {
  if (!converterInstance) {
    converterInstance = new LibreOfficeConverter(basePath);
  }
  return converterInstance;
}
