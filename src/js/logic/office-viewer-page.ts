/**
 * Office Viewer & Editor.
 *
 * BentoPDF already carries a full LibreOffice engine for its Office->PDF
 * converters. This page surfaces the rest of what that engine can do: opening
 * a document, rendering its pages, reading its structure and text, making the
 * edits the engine actually supports, and exporting to any format it offers.
 *
 * A note on editing. This WASM build supports a subset of the editor API:
 * reading structure and paragraphs, appending paragraphs, undo/redo and save
 * all work, while anything routed through LibreOffice's search - find,
 * replace, replaceParagraph, deleteParagraph - raises a WebAssembly exception.
 * The UI therefore only offers what has been verified to work rather than
 * showing buttons that fail silently.
 */
import {
  getLibreOfficeConverter,
  type OfficeDocumentInfo,
  type OfficeParagraph,
  type OfficeSession,
  type OfficeSheet,
  type OfficeStructure,
} from '../utils/libreoffice-loader.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import type { OutputFormat } from '@matbee/libreoffice-converter/browser';

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
/** Base render width at 100%; pages are re-rendered when zoom changes. */
const BASE_RENDER_WIDTH = 900;

interface ViewerState {
  file: File | null;
  info: OfficeDocumentInfo | null;
  documentType: string | null;
  structure: OfficeStructure | null;
  page: number;
  zoomIndex: number;
  /** Snapshots taken before each edit, so undo is just "go back a version". */
  history: File[];
}

const state: ViewerState = {
  file: null,
  info: null,
  documentType: null,
  structure: null,
  page: 0,
  zoomIndex: 2,
  history: [],
};

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

// ------------------------------------------------------------------ chrome -

const showStatus = (message: string): void => {
  $('status-text').textContent = message;
  $('status-overlay').classList.remove('hidden');
};

const hideStatus = (): void => $('status-overlay').classList.add('hidden');

let errorTimer: number | undefined;
const showError = (message: string): void => {
  console.error('[office-viewer]', message);
  const banner = $('error-banner');
  banner.textContent = message;
  banner.classList.remove('hidden');
  window.clearTimeout(errorTimer);
  errorTimer = window.setTimeout(() => banner.classList.add('hidden'), 6000);
};

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const documentMeta = (file: File, info: OfficeDocumentInfo): string =>
  `${info.documentTypeName} · ${info.pageCount} page${info.pageCount === 1 ? '' : 's'} · ${formatBytes(file.size)}`;

// ----------------------------------------------------------------- engine -

const converter = getLibreOfficeConverter();

const ensureEngine = async (): Promise<void> => {
  if (converter.isReady()) return;
  await converter.initialize((progress) => {
    showStatus(progress.message || 'Loading the document engine…');
  });
};

// --------------------------------------------------------------- rendering -

const zoom = (): number => ZOOM_STEPS[state.zoomIndex];

/**
 * Renders the current page. The engine hands back raw RGBA, which goes onto
 * the canvas directly - no intermediate encode/decode.
 */
const renderCurrentPage = async (): Promise<void> => {
  if (!state.file) return;

  const canvas = $<HTMLCanvasElement>('page-canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  try {
    const page = await converter.renderPage(
      state.file,
      state.page,
      Math.round(BASE_RENDER_WIDTH * zoom())
    );

    canvas.width = page.width;
    canvas.height = page.height;
    context.putImageData(
      new ImageData(
        new Uint8ClampedArray(
          page.data.buffer.slice(
            page.data.byteOffset,
            page.data.byteOffset + page.data.byteLength
          ) as ArrayBuffer
        ),
        page.width,
        page.height
      ),
      0,
      0
    );
  } catch (error) {
    showError(`Could not render page ${state.page + 1}: ${describe(error)}`);
  }
};

const updatePageControls = (): void => {
  const total = state.info?.pageCount ?? 1;
  $('page-indicator').textContent = `Page ${state.page + 1} of ${total}`;
  $<HTMLButtonElement>('prev-page').disabled = state.page <= 0;
  $<HTMLButtonElement>('next-page').disabled = state.page >= total - 1;
  $('zoom-level').textContent = `${Math.round(zoom() * 100)}%`;
};

const goToPage = async (page: number): Promise<void> => {
  const total = state.info?.pageCount ?? 1;
  state.page = Math.min(Math.max(page, 0), total - 1);
  updatePageControls();
  showStatus(`Rendering page ${state.page + 1}…`);
  await renderCurrentPage();
  hideStatus();
};

// ----------------------------------------------------------------- outline -

const outlineRow = (label: string, detail: string): HTMLElement => {
  const row = document.createElement('div');
  row.className = 'px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700';
  const title = document.createElement('p');
  title.className = 'text-sm text-gray-200 line-clamp-3';
  title.textContent = label;
  const meta = document.createElement('p');
  meta.className = 'text-xs text-gray-500';
  meta.textContent = detail;
  row.append(title, meta);
  return row;
};

const renderOutline = (): void => {
  const list = $('outline-list');
  const empty = $('outline-empty');
  list.textContent = '';

  const structure = state.structure;
  const paragraphs = (structure?.paragraphs ?? []) as OfficeParagraph[];
  const sheets = (structure?.sheets ?? []) as OfficeSheet[];
  const slides = structure?.slides ?? [];

  if (paragraphs.length) {
    paragraphs.forEach((paragraph, index) => {
      // Engine paragraphs can span several lines; collapse them so the row
      // shows what the paragraph actually contains, not just its first line.
      const preview =
        (paragraph.text ?? '').replace(/\s+/g, ' ').trim() ||
        '(empty paragraph)';
      list.appendChild(
        outlineRow(
          preview,
          `Paragraph ${index + 1}${paragraph.style ? ` · ${paragraph.style}` : ''}`
        )
      );
    });
  } else if (sheets.length) {
    sheets.forEach((sheet) => {
      list.appendChild(
        outlineRow(
          sheet.name || `Sheet ${sheet.index + 1}`,
          sheet.usedRange
            ? `Used range ${sheet.usedRange} · ${sheet.rowCount ?? 0} rows × ${sheet.colCount ?? 0} cols`
            : 'Empty sheet'
        )
      );
    });
  } else if (slides.length) {
    slides.forEach((slide, index) => {
      list.appendChild(
        outlineRow(slide.title || `Slide ${index + 1}`, `Slide ${index + 1}`)
      );
    });
  }

  empty.classList.toggle('hidden', list.childElementCount > 0);
};

// ------------------------------------------------------------------ editing -

/** Writer documents are the only ones this build can reliably edit. */
const supportsEditing = (): boolean => state.documentType === 'writer';

/**
 * Runs a unit of work against a freshly opened document and closes it again.
 *
 * Sessions are deliberately short-lived. The engine loads a document per
 * operation, so a session held open across a render or a conversion goes
 * stale and its edits are silently dropped on close. Opening and closing
 * around each piece of work is what makes edits actually stick.
 */
const withSession = async <T>(
  file: File,
  work: (sessionId: string) => Promise<T>
): Promise<{ value: T; bytes?: Uint8Array }> => {
  const session: OfficeSession = await converter.openDocument(file);
  state.documentType = session.documentType;
  try {
    const value = await work(session.sessionId);
    const bytes = await converter.closeDocument(session.sessionId);
    return { value, bytes };
  } catch (error) {
    await converter.closeDocument(session.sessionId).catch(() => {});
    throw error;
  }
};

/** Reads the outline. Discards the returned bytes - this changes nothing. */
const refreshStructure = async (): Promise<void> => {
  if (!state.file) return;
  try {
    const { value } = await withSession(state.file, async (sessionId) => {
      const structure = await converter.editorOperation<OfficeStructure>(
        sessionId,
        'getStructure'
      );
      if (!structure.ok || !structure.data) return null;

      // getStructure only carries previews, so pull the full paragraph text.
      const count = Math.max(structure.data.paragraphs?.length ?? 0, 1);
      const paragraphs = await converter.editorOperation<OfficeParagraph[]>(
        sessionId,
        'getParagraphs',
        [0, count]
      );
      return paragraphs.ok && Array.isArray(paragraphs.data)
        ? { ...structure.data, paragraphs: paragraphs.data }
        : structure.data;
    });
    state.structure = value;
  } catch (error) {
    console.warn('[office-viewer] structure unavailable', error);
    state.structure = null;
  }
  renderOutline();
};

/** Applies one editor operation and adopts the resulting document. */
const applyEdit = async (
  method: string,
  args: unknown[],
  description: string
): Promise<boolean> => {
  if (!state.file) return false;
  const previous = state.file;

  showStatus(`${description}…`);
  try {
    const { value, bytes } = await withSession(previous, (sessionId) =>
      converter.editorOperation(sessionId, method, args)
    );

    if (!value.ok) {
      hideStatus();
      showError(`${description} failed: ${value.error}`);
      return false;
    }
    if (!bytes?.length) {
      hideStatus();
      showError(`${description} produced no changes.`);
      return false;
    }

    state.history.push(previous);
    state.file = new File([new Uint8Array(bytes)], previous.name, {
      type: previous.type,
    });

    await afterDocumentChanged();
    hideStatus();
    return true;
  } catch (error) {
    hideStatus();
    showError(`${description} failed: ${describe(error)}`);
    return false;
  }
};

/** Re-reads everything that depends on the document bytes. */
const afterDocumentChanged = async (): Promise<void> => {
  if (!state.file) return;
  state.info = await converter.getDocumentInfo(state.file);
  $('doc-meta').textContent = documentMeta(state.file, state.info);
  populateExportFormats();
  $('text-content').textContent =
    (await converter.extractText(state.file)) || 'No text could be extracted.';
  await refreshStructure();
  updatePageControls();
  await renderCurrentPage();
  updateHistoryControls();
};

const updateHistoryControls = (): void => {
  $<HTMLButtonElement>('undo-btn').disabled = state.history.length === 0;
};

const insertParagraph = async (): Promise<void> => {
  const input = $<HTMLTextAreaElement>('insert-text');
  const text = input.value.trim();
  if (!text) return;
  if (await applyEdit('insertParagraph', [text], 'Inserting the paragraph')) {
    input.value = '';
  }
};

/**
 * Undo restores the previous version of the document rather than calling the
 * engine's undo, which cannot reach across the short-lived sessions above.
 */
const undoEdit = async (): Promise<void> => {
  const previous = state.history.pop();
  if (!previous) return;
  state.file = previous;
  showStatus('Undoing…');
  await afterDocumentChanged();
  hideStatus();
};

// ------------------------------------------------------------------ export -

const populateExportFormats = (): void => {
  const select = $<HTMLSelectElement>('export-format');
  select.textContent = '';
  for (const format of state.info?.validOutputFormats ?? ['pdf']) {
    const option = document.createElement('option');
    option.value = format;
    option.textContent = format.toUpperCase();
    select.appendChild(option);
  }
};

const exportDocument = async (): Promise<void> => {
  if (!state.file) return;
  const format = $<HTMLSelectElement>('export-format').value as OutputFormat;

  showStatus(`Exporting as ${format.toUpperCase()}…`);
  try {
    const source = state.file;
    const blob = await converter.convertTo(source, format);
    const base = source.name.replace(/\.[^.]+$/, '');
    downloadFile(blob, `${base}.${format}`);
  } catch (error) {
    showError(`Export failed: ${describe(error)}`);
  }
  hideStatus();
};

// ------------------------------------------------------------------- open -

const openFile = async (file: File): Promise<void> => {
  state.file = file;
  state.page = 0;
  state.structure = null;
  state.documentType = null;
  state.history = [];

  try {
    showStatus('Loading the document engine…');
    await ensureEngine();

    showStatus('Reading the document…');
    state.info = await converter.getDocumentInfo(file);

    $('uploader').classList.add('hidden');
    $('workspace').classList.remove('hidden');
    $('doc-name').textContent = file.name;
    $('doc-meta').textContent = documentMeta(file, state.info);

    populateExportFormats();

    showStatus('Extracting text…');
    const text = await converter.extractText(file);
    $('text-content').textContent = text || 'No text could be extracted.';

    showStatus('Reading document structure…');
    await refreshStructure();

    // supportsEditing() is only meaningful once refreshStructure has opened a
    // session and recorded the document type.
    const editable = supportsEditing();
    $('writer-edit').classList.toggle('hidden', !editable);
    $('undo-btn').classList.toggle('hidden', !editable);
    updateHistoryControls();

    updatePageControls();
    showStatus('Rendering page 1…');
    await renderCurrentPage();
  } catch (error) {
    showError(`Could not open ${file.name}: ${describe(error)}`);
    closeDocument();
  }
  hideStatus();
};

const closeDocument = (): void => {
  state.file = null;
  state.info = null;
  state.documentType = null;
  state.structure = null;
  state.history = [];
  $('workspace').classList.add('hidden');
  $('uploader').classList.remove('hidden');
  $<HTMLInputElement>('file-input').value = '';
};

// ------------------------------------------------------------------- wiring -

const selectPanel = (name: string): void => {
  for (const tab of document.querySelectorAll<HTMLElement>('.sidebar-tab')) {
    const active = tab.dataset.panel === name;
    tab.classList.toggle('bg-indigo-600', active);
    tab.classList.toggle('text-white', active);
    tab.classList.toggle('text-gray-400', !active);
  }
  for (const panel of document.querySelectorAll<HTMLElement>(
    '.sidebar-panel'
  )) {
    panel.classList.toggle('hidden', panel.id !== `panel-${name}`);
  }
};

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

  $('prev-page').addEventListener('click', () => void goToPage(state.page - 1));
  $('next-page').addEventListener('click', () => void goToPage(state.page + 1));

  $('zoom-in').addEventListener('click', () => {
    if (state.zoomIndex >= ZOOM_STEPS.length - 1) return;
    state.zoomIndex += 1;
    void goToPage(state.page);
  });
  $('zoom-out').addEventListener('click', () => {
    if (state.zoomIndex <= 0) return;
    state.zoomIndex -= 1;
    void goToPage(state.page);
  });

  $('export-btn').addEventListener('click', () => void exportDocument());
  $('insert-btn').addEventListener('click', () => void insertParagraph());
  $('undo-btn').addEventListener('click', () => void undoEdit());
  $('close-document').addEventListener('click', closeDocument);

  for (const tab of document.querySelectorAll<HTMLElement>('.sidebar-tab')) {
    tab.addEventListener('click', () =>
      selectPanel(tab.dataset.panel ?? 'outline')
    );
  }

  const backToTools = document.getElementById('back-to-tools');
  backToTools?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
