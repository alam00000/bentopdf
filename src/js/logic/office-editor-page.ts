/**
 * Word Editor - real editing of Writer documents.
 *
 * The engine is LibreOffice itself, driven through
 * `public/workers/office-editor.worker.js`. This module is the client half:
 * it paints the document from LOK tiles, turns pointer and keyboard input into
 * LOK events, and drives the toolbar with UNO commands.
 *
 * The one idea worth holding on to is the coordinate system. LibreOffice
 * thinks in twips (1440 per inch); the page thinks in CSS pixels. `scale`
 * converts between them and everything else follows from that.
 */
import {
  LokCallback,
  LokKey,
  LokKeyCode,
  LokMouse,
  OfficeEditorClient,
  type LokSize,
} from '../utils/office-editor-client.js';
import { downloadFile } from '../utils/helpers.js';

/** Documents render at this CSS width when the viewport allows it. */
const MAX_PAGE_WIDTH = 900;
/** Extra strip painted above and below the viewport, in CSS pixels. */
const OVERSCAN = 200;
/** Input is bursty; coalesce repaints rather than painting per keystroke. */
const REPAINT_DELAY = 60;

const client = new OfficeEditorClient();

interface EditorState {
  file: File | null;
  /** Document extent in twips. */
  size: LokSize;
  /** CSS pixels per twip. */
  scale: number;
  dirty: boolean;
  painting: boolean;
  repaintQueued: boolean;
}

const state: EditorState = {
  file: null,
  size: { width: 0, height: 0 },
  scale: 0,
  dirty: false,
  painting: false,
  repaintQueued: false,
};

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// ------------------------------------------------------------------ chrome -

const showStatus = (message: string): void => {
  $('status-text').textContent = message;
  $('status-overlay').classList.remove('hidden');
};
const hideStatus = (): void => $('status-overlay').classList.add('hidden');

let errorTimer: number | undefined;
const showError = (message: string): void => {
  console.error('[office-editor]', message);
  const banner = $('error-banner');
  banner.textContent = message;
  banner.classList.remove('hidden');
  window.clearTimeout(errorTimer);
  errorTimer = window.setTimeout(() => banner.classList.add('hidden'), 6000);
};

const setStatusLine = (message: string): void => {
  $('status-line').textContent = message;
};

// --------------------------------------------------------------- geometry -

/** CSS pixels -> twips, in document space. */
const toTwips = (pixels: number): number => Math.round(pixels / state.scale);
/** Twips -> CSS pixels. */
const toPixels = (twips: number): number => twips * state.scale;

/**
 * Recomputes the scale from the viewport and resizes the spacer so the
 * scrollbar reflects the whole document even though we only paint a slice.
 */
const layout = (): void => {
  const scroller = $('scroller');
  const spacer = $('doc-spacer');
  if (!state.size.width) return;

  const available = Math.min(scroller.clientWidth - 32, MAX_PAGE_WIDTH);
  state.scale = available / state.size.width;

  spacer.style.width = `${available}px`;
  spacer.style.height = `${Math.ceil(toPixels(state.size.height))}px`;
  $('zoom-line').textContent =
    `${Math.round(state.scale * TWIP_SCALE_REFERENCE)}%`;
};

/** 100% is defined as rendering a twip at 1/15 of a CSS pixel (96 DPI). */
const TWIP_SCALE_REFERENCE = (1440 / 96) * 100;

// ---------------------------------------------------------------- painting -

/** The slice of the document currently visible, in both units. */
const visibleSlice = (): {
  topPx: number;
  heightPx: number;
  topTwips: number;
  heightTwips: number;
} => {
  const scroller = $('scroller');
  const docHeightPx = toPixels(state.size.height);

  const topPx = Math.max(0, Math.floor(scroller.scrollTop - OVERSCAN));
  const heightPx = Math.min(
    Math.ceil(scroller.clientHeight + OVERSCAN * 2),
    Math.max(0, Math.ceil(docHeightPx - topPx))
  );

  return {
    topPx,
    heightPx,
    topTwips: toTwips(topPx),
    heightTwips: toTwips(heightPx),
  };
};

const paintVisible = async (): Promise<void> => {
  if (!client.isReady() || !state.size.width) return;
  if (state.painting) {
    state.repaintQueued = true;
    return;
  }
  state.painting = true;

  try {
    const slice = visibleSlice();
    if (slice.heightPx <= 0) return;

    const canvas = $<HTMLCanvasElement>('doc-canvas');
    const width = Math.round(toPixels(state.size.width));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    const tile = await client.paint(
      Math.round(width * ratio),
      Math.round(slice.heightPx * ratio),
      0,
      slice.topTwips,
      state.size.width,
      slice.heightTwips
    );

    canvas.width = tile.width;
    canvas.height = tile.height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${slice.heightPx}px`;
    canvas.style.top = `${slice.topPx}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.putImageData(
      new ImageData(
        new Uint8ClampedArray(
          tile.pixels.buffer.slice(
            tile.pixels.byteOffset,
            tile.pixels.byteOffset + tile.pixels.byteLength
          ) as ArrayBuffer
        ),
        tile.width,
        tile.height
      ),
      0,
      0
    );
  } catch (error) {
    showError(`Could not draw the document: ${describe(error)}`);
  } finally {
    state.painting = false;
    if (state.repaintQueued) {
      state.repaintQueued = false;
      void paintVisible();
    }
  }
};

let repaintTimer: number | undefined;
const scheduleRepaint = (): void => {
  window.clearTimeout(repaintTimer);
  repaintTimer = window.setTimeout(
    (): void => void paintVisible(),
    REPAINT_DELAY
  );
};

/**
 * Drains LOK's callback queue after input. Tile invalidation tells us the
 * page changed; the cursor callback carries the caret rectangle in twips.
 */
const drainCallbacks = async (): Promise<void> => {
  let needsRepaint = false;
  try {
    for (const event of await client.callbacks()) {
      if (
        event.type === LokCallback.InvalidateTiles ||
        event.type === LokCallback.TextSelection
      ) {
        needsRepaint = true;
      }
      if (event.type === LokCallback.InvalidateVisibleCursor) {
        placeCaret(event.payload);
      }
    }
  } catch {
    // A failed poll is not worth interrupting typing for.
  }
  if (needsRepaint) scheduleRepaint();
};

/** The cursor callback payload is `x, y, width, height` in twips. */
const placeCaret = (payload: string): void => {
  const parts = payload.split(',').map((value) => Number(value.trim()));
  if (parts.length < 4 || parts.some(Number.isNaN)) return;
  const [x, y, , height] = parts;

  const caret = $('caret');
  caret.style.left = `${toPixels(x)}px`;
  caret.style.top = `${toPixels(y)}px`;
  caret.style.height = `${Math.max(toPixels(height), 12)}px`;
  caret.classList.remove('hidden');
};

// ------------------------------------------------------------------- input -

/** Pointer position within the document, in twips. */
const pointerToTwips = (
  event: PointerEvent | MouseEvent
): { x: number; y: number } => {
  const spacer = $('doc-spacer').getBoundingClientRect();
  return {
    x: toTwips(event.clientX - spacer.left),
    y: toTwips(event.clientY - spacer.top),
  };
};

const handlePointerDown = async (event: PointerEvent): Promise<void> => {
  // Stop the browser doing its own focus handling on this click. Without
  // this it moves focus to <body> after pointerdown, which silently steals
  // every subsequent keystroke from the sink below.
  event.preventDefault();

  const { x, y } = pointerToTwips(event);
  $<HTMLTextAreaElement>('key-sink').focus({ preventScroll: true });
  try {
    await client.postMouse(LokMouse.ButtonDown, x, y, 1, 1, 0);
    await client.postMouse(LokMouse.ButtonUp, x, y, 1, 1, 0);
    await drainCallbacks();
  } catch (error) {
    showError(`Could not place the cursor: ${describe(error)}`);
  }
};

/** Maps a browser key to LOK's `awt::Key` code, or null for printable keys. */
const specialKeyCode = (key: string): number | null => {
  switch (key) {
    case 'Backspace':
      return LokKeyCode.Backspace;
    case 'Delete':
      return LokKeyCode.Delete;
    case 'Enter':
      return LokKeyCode.Return;
    case 'Tab':
      return LokKeyCode.Tab;
    case 'Escape':
      return LokKeyCode.Escape;
    case 'ArrowLeft':
      return LokKeyCode.Left;
    case 'ArrowRight':
      return LokKeyCode.Right;
    case 'ArrowUp':
      return LokKeyCode.Up;
    case 'ArrowDown':
      return LokKeyCode.Down;
    case 'Home':
      return LokKeyCode.Home;
    case 'End':
      return LokKeyCode.End;
    case 'PageUp':
      return LokKeyCode.PageUp;
    case 'PageDown':
      return LokKeyCode.PageDown;
    default:
      return null;
  }
};

const handleKeyDown = async (event: KeyboardEvent): Promise<void> => {
  if (!state.file) return;

  // Let the browser own its own shortcuts, except the ones we implement.
  if (event.ctrlKey || event.metaKey) {
    const command = {
      b: '.uno:Bold',
      i: '.uno:Italic',
      u: '.uno:Underline',
      z: '.uno:Undo',
      y: '.uno:Redo',
      s: null,
    }[event.key.toLowerCase()];
    if (command === null) {
      event.preventDefault();
      void saveDocument();
      return;
    }
    if (command) {
      event.preventDefault();
      await runUno(command);
    }
    return;
  }

  const special = specialKeyCode(event.key);
  const printable = event.key.length === 1;
  if (!special && !printable) return;

  event.preventDefault();
  state.dirty = true;

  try {
    if (special !== null) {
      await client.postKey(LokKey.Input, 0, special);
      await client.postKey(LokKey.Up, 0, special);
    } else {
      const charCode = event.key.codePointAt(0) ?? 0;
      await client.postKey(LokKey.Input, charCode, 0);
      await client.postKey(LokKey.Up, charCode, 0);
    }
    await drainCallbacks();
    scheduleRepaint();
  } catch (error) {
    showError(`Key press failed: ${describe(error)}`);
  }
};

/**
 * Mobile keyboards and IMEs often deliver text through `input` rather than
 * discrete key events, so mirror anything that lands in the sink.
 */
const handleSinkInput = async (event: Event): Promise<void> => {
  const sink = event.target as HTMLTextAreaElement;
  const text = sink.value;
  sink.value = '';
  if (!text) return;

  state.dirty = true;
  try {
    await client.typeText(text);
    await drainCallbacks();
    scheduleRepaint();
  } catch (error) {
    showError(`Could not insert text: ${describe(error)}`);
  }
};

const runUno = async (command: string): Promise<void> => {
  try {
    await client.uno(command);
    state.dirty = true;
    await drainCallbacks();
    scheduleRepaint();
  } catch (error) {
    showError(`${command} failed: ${describe(error)}`);
  }
};

// -------------------------------------------------------------------- file -

const openFile = async (file: File): Promise<void> => {
  state.file = file;
  state.dirty = false;

  try {
    showStatus('Loading the document engine…');
    await client.initialize(import.meta.env.BASE_URL, (step) =>
      showStatus(`${step}…`)
    );

    showStatus('Opening the document…');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'docx';
    const opened = await client.open(
      new Uint8Array(await file.arrayBuffer()),
      ext
    );

    state.size = opened.size;
    $('uploader').classList.add('hidden');
    $('workspace').classList.remove('hidden');
    $('doc-name').textContent = file.name;

    layout();
    showStatus('Drawing the document…');
    await paintVisible();
    await drainCallbacks();

    setStatusLine(
      opened.editMode === 1
        ? 'Editing - click in the page and type'
        : 'Click in the page to start editing'
    );
    $<HTMLTextAreaElement>('key-sink').focus({ preventScroll: true });
  } catch (error) {
    showError(`Could not open ${file.name}: ${describe(error)}`);
    closeDocument();
  }
  hideStatus();
};

const saveDocument = async (): Promise<void> => {
  if (!state.file) return;
  const format = $<HTMLSelectElement>('save-format').value;

  showStatus(`Saving as ${format.toUpperCase()}…`);
  try {
    const data = await client.save(format);
    const base = state.file.name.replace(/\.[^.]+$/, '');
    downloadFile(new Blob([new Uint8Array(data)]), `${base}.${format}`);
    state.dirty = false;
    setStatusLine(`Saved as ${format.toUpperCase()}`);
  } catch (error) {
    showError(`Save failed: ${describe(error)}`);
  }
  hideStatus();
};

const closeDocument = (): void => {
  void client.close().catch(() => {});
  state.file = null;
  state.size = { width: 0, height: 0 };
  state.dirty = false;
  $('workspace').classList.add('hidden');
  $('uploader').classList.remove('hidden');
  $('caret').classList.add('hidden');
  $<HTMLInputElement>('file-input').value = '';
};

// ----------------------------------------------------------------- wiring -

const init = (): void => {
  const input = $<HTMLInputElement>('file-input');
  const dropZone = $('drop-zone');

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) void openFile(file);
  });

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('border-indigo-500');
  });
  dropZone.addEventListener('dragleave', () =>
    dropZone.classList.remove('border-indigo-500')
  );
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('border-indigo-500');
    const file = event.dataTransfer?.files?.[0];
    if (file) void openFile(file);
  });

  $('doc-spacer').addEventListener(
    'pointerdown',
    (event) => void handlePointerDown(event as PointerEvent)
  );
  $('key-sink').addEventListener(
    'keydown',
    (event) => void handleKeyDown(event as KeyboardEvent)
  );
  $('key-sink').addEventListener(
    'input',
    (event) => void handleSinkInput(event)
  );

  $('scroller').addEventListener('scroll', scheduleRepaint, { passive: true });
  window.addEventListener('resize', () => {
    layout();
    scheduleRepaint();
  });

  for (const button of document.querySelectorAll<HTMLElement>('.uno-btn')) {
    button.addEventListener('click', () => {
      const command = button.dataset.uno;
      if (command) void runUno(command);
      $<HTMLTextAreaElement>('key-sink').focus({ preventScroll: true });
    });
  }

  $('save-btn').addEventListener('click', () => void saveDocument());
  $('close-document').addEventListener('click', closeDocument);

  document.getElementById('back-to-tools')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });

  window.addEventListener('beforeunload', (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
