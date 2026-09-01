/**
 * Client for `public/workers/office-editor.worker.js`.
 *
 * The worker drives LibreOfficeKit directly, so this is the seam where the UI
 * stops thinking in pixels and starts thinking in twips. Everything below is a
 * thin, typed promise wrapper - the interesting logic lives in the page.
 */

/** LibreOfficeKit measures in twips: 1440 per inch, 1 twip = 1/20 point. */
export const TWIPS_PER_INCH = 1440;

export const LokKey = { Input: 0, Up: 1 } as const;
export const LokMouse = { ButtonDown: 0, ButtonUp: 1, Move: 2 } as const;

/**
 * Special-key codes from `com::sun::star::awt::Key`. Printable characters are
 * sent as a charCode with keyCode 0; these go the other way around.
 */
export const LokKeyCode = {
  Down: 1024,
  Up: 1025,
  Left: 1026,
  Right: 1027,
  Home: 1028,
  End: 1029,
  PageUp: 1030,
  PageDown: 1031,
  Return: 1280,
  Escape: 1281,
  Tab: 1282,
  Backspace: 1283,
  Space: 1284,
  Insert: 1285,
  Delete: 1286,
} as const;

/** The subset of LOK callback types the editor reacts to. */
export const LokCallback = {
  InvalidateTiles: 0,
  InvalidateVisibleCursor: 1,
  TextSelection: 2,
  CursorVisible: 3,
  StateChanged: 25,
} as const;

export interface LokSize {
  width: number;
  height: number;
}

export interface LokCallbackEvent {
  type: number;
  payload: string;
}

export interface OpenedDocument {
  documentType: number;
  parts: number;
  editMode: number;
  size: LokSize;
}

export interface PaintedTile {
  pixels: Uint8Array;
  width: number;
  height: number;
}

interface Pending {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: Error) => void;
}

export type ProgressListener = (step: string) => void;

export class OfficeEditorClient {
  private worker: Worker | null = null;
  private nextId = 1;
  private readonly pending = new Map<number, Pending>();
  private onProgress: ProgressListener | undefined;

  /**
   * Boots the worker and the engine. The payloads are fetched here rather than
   * in the worker because a server may already have inflated them - the same
   * gzip sniff the LibreOffice loader does.
   */
  async initialize(
    basePath: string,
    onProgress?: ProgressListener
  ): Promise<void> {
    if (this.worker) return;
    this.onProgress = onProgress;

    const worker = new Worker(`${basePath}workers/office-editor.worker.js`);
    worker.onmessage = (event: MessageEvent) => this.receive(event.data);
    worker.onerror = (event) => this.failAll(new Error(event.message));
    this.worker = worker;

    onProgress?.('Downloading the document engine');
    const [sofficeWasm, sofficeData] = await Promise.all([
      inflateToBlobUrl(
        `${basePath}libreoffice-wasm/soffice.wasm`,
        'application/wasm'
      ),
      inflateToBlobUrl(
        `${basePath}libreoffice-wasm/soffice.data`,
        'application/octet-stream'
      ),
    ]);

    onProgress?.('Starting the document engine');
    await this.call('init', {
      paths: {
        sofficeJs: `${basePath}libreoffice-wasm/soffice.js`,
        sofficeWasm,
        sofficeData,
        sofficeWorkerJs: `${basePath}libreoffice-wasm/soffice.worker.js`,
      },
    });
  }

  isReady(): boolean {
    return this.worker !== null;
  }

  async open(bytes: Uint8Array, ext: string): Promise<OpenedDocument> {
    // The buffer is transferred, so the caller must not reuse it.
    const copy = new Uint8Array(bytes);
    return (await this.call('open', { bytes: copy, ext }, [
      copy.buffer,
    ])) as unknown as OpenedDocument;
  }

  postKey(eventType: number, charCode: number, keyCode: number): Promise<void> {
    return this.voidCall('key', { eventType, charCode, keyCode });
  }

  /** Sends a whole string as key events, the way typing arrives. */
  typeText(text: string): Promise<void> {
    return this.voidCall('type', { text });
  }

  postMouse(
    eventType: number,
    x: number,
    y: number,
    count = 1,
    buttons = 1,
    modifier = 0
  ): Promise<void> {
    return this.voidCall('mouse', {
      eventType,
      x,
      y,
      count,
      buttons,
      modifier,
    });
  }

  uno(command: string, args?: string): Promise<void> {
    return this.voidCall('uno', { command, args });
  }

  async documentText(): Promise<string> {
    return ((await this.call('text')) as { text: string }).text;
  }

  async selection(): Promise<{ text: string; selectionType: number }> {
    return (await this.call('selection')) as unknown as {
      text: string;
      selectionType: number;
    };
  }

  async documentSize(): Promise<LokSize> {
    return (await this.call('documentSize')) as unknown as LokSize;
  }

  async paint(
    canvasWidth: number,
    canvasHeight: number,
    tileX: number,
    tileY: number,
    tileWidth: number,
    tileHeight: number
  ): Promise<PaintedTile> {
    return (await this.call('paint', {
      canvasWidth,
      canvasHeight,
      tileX,
      tileY,
      tileWidth,
      tileHeight,
    })) as unknown as PaintedTile;
  }

  async callbacks(): Promise<LokCallbackEvent[]> {
    return ((await this.call('callbacks')) as { events: LokCallbackEvent[] })
      .events;
  }

  async save(format: string): Promise<Uint8Array> {
    return ((await this.call('save', { format })) as { data: Uint8Array }).data;
  }

  close(): Promise<void> {
    return this.voidCall('close');
  }

  destroy(): void {
    this.failAll(new Error('The editor was closed'));
    this.worker?.terminate();
    this.worker = null;
  }

  // --- plumbing ------------------------------------------------------------

  private receive(message: Record<string, unknown>): void {
    if (message.type === 'ready') return;
    if (message.type === 'step') {
      this.onProgress?.(String(message.step));
      return;
    }

    const pending = this.pending.get(Number(message.id));
    if (!pending) return;
    this.pending.delete(Number(message.id));

    if (message.ok) pending.resolve(message);
    else pending.reject(new Error(String(message.error ?? 'Worker error')));
  }

  private failAll(error: Error): void {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  private call(
    type: string,
    payload: Record<string, unknown> = {},
    transfer: Transferable[] = []
  ): Promise<Record<string, unknown>> {
    const worker = this.worker;
    if (!worker) return Promise.reject(new Error('Editor worker not started'));

    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ id, type, ...payload }, transfer);
    });
  }

  private async voidCall(
    type: string,
    payload: Record<string, unknown> = {}
  ): Promise<void> {
    await this.call(type, payload);
  }
}

/**
 * Fetches a payload that may or may not still be gzipped.
 *
 * The files on disk are `.gz`, but a server that sets `Content-Encoding: gzip`
 * makes the browser inflate them first - so sniff the magic bytes rather than
 * trusting the extension.
 */
const inflateToBlobUrl = async (
  path: string,
  mimeType: string
): Promise<string> => {
  const response = await fetch(`${path}.gz`);
  if (!response.ok) {
    throw new Error(`Could not load ${path}.gz (HTTP ${response.status})`);
  }

  let blob = await response.blob();
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (head[0] === 0x1f && head[1] === 0x8b) {
    blob = await new Response(
      blob.stream().pipeThrough(new DecompressionStream('gzip'))
    ).blob();
  }
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
};
