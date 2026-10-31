import { createIcons, icons } from 'lucide';
import type { EmbedPdfContainer } from 'bentopdf-viewer';
import { downloadFile } from '../utils/helpers';
import { batchDecryptIfNeeded } from '../utils/password-prompt.js';
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js';
import { repairPdfFile } from './repair-pdf.js';
import { partitionIncomingFiles } from '../utils/multi-tool-file-input.js';
import { convertImagesToPdfFile } from '../utils/images-to-pdf-lib.js';
import { viewerTheme } from '../config/viewer-theme.js';
import { t, trText, onPageReady } from '../i18n/i18n';
import type { DocManagerPlugin } from '@/types';

const embedPdfWasmUrl = new URL(
  'bentopdf-pdfium/editcore.wasm',
  import.meta.url
).href;

type ViewerRegistry = Awaited<EmbedPdfContainer['registry']>;

let viewer: EmbedPdfContainer | null = null;
let registryPromise: Promise<ViewerRegistry> | null = null;
let docManager: DocManagerPlugin | null = null;
let currentDocId: string | null = null;
let isBusy = false;
let dragOverlay: HTMLElement | null = null;
let probeSeq = 0;

function showModal(
  title: string,
  message: string,
  type: 'info' | 'error' | 'success' = 'info'
) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalIcon = document.getElementById('modal-icon');

  if (!modal || !modalTitle || !modalMessage || !modalIcon) return;

  modalTitle.textContent = trText(title);
  modalMessage.textContent = trText(message);

  const iconMap = {
    info: 'info',
    error: 'alert-circle',
    success: 'check-circle',
  };
  const colorMap = {
    info: 'text-blue-400',
    error: 'text-red-400',
    success: 'text-green-400',
  };

  modalIcon.replaceChildren();
  const iconEl = document.createElement('i');
  iconEl.dataset.lucide = iconMap[type];
  iconEl.className = `w-12 h-12 ${colorMap[type]}`;
  modalIcon.appendChild(iconEl);
  modal.classList.remove('hidden');
  createIcons({ icons });
}

function hideModal() {
  document.getElementById('modal')?.classList.add('hidden');
}

function showLoading(text: string) {
  const loader = document.getElementById('loading-overlay');
  const progress = document.getElementById('loading-progress');
  const label = document.getElementById('loading-text');
  if (!loader || !progress || !label) return;
  loader.classList.remove('hidden');
  progress.style.width = '100%';
  label.textContent = text;
}

function hideLoading() {
  document.getElementById('loading-overlay')?.classList.add('hidden');
}

function setViewerVisible(visible: boolean) {
  document
    .getElementById('main-scroll-container')
    ?.classList.toggle('hidden', visible);
  document
    .getElementById('organize-viewer')
    ?.classList.toggle('hidden', !visible);
  for (const id of ['export-pdf-btn', 'reset-btn']) {
    const button = document.getElementById(id);
    if (button) button.style.display = visible ? '' : 'none';
  }
}

onPageReady(initializeTool);

function initializeTool() {
  createIcons({ icons });
  initializeGlobalShortcuts();

  const fileInput = document.getElementById(
    'pdf-file-input'
  ) as HTMLInputElement | null;
  const openPicker = () => {
    if (isBusy) return;
    fileInput?.click();
  };

  document.getElementById('close-tool-btn')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
  document.getElementById('upload-area')?.addEventListener('click', openPicker);
  document
    .getElementById('pdf-file-input-select-btn')
    ?.addEventListener('click', (e) => {
      e.stopPropagation();
      openPicker();
    });
  fileInput?.addEventListener('change', async () => {
    const files = Array.from(fileInput.files || []);
    fileInput.value = '';
    if (files.length > 0) await handleIncomingFiles(files);
  });
  document
    .getElementById('export-pdf-btn')
    ?.addEventListener('click', () => void exportPdf());
  document
    .getElementById('reset-btn')
    ?.addEventListener('click', () => resetAll());
  document
    .getElementById('modal-close-btn')
    ?.addEventListener('click', hideModal);
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) hideModal();
  });

  document.getElementById('upload-area')?.classList.remove('hidden');
  setViewerVisible(false);
  setupGlobalDragAndDrop();
}

function showDragOverlay() {
  if (dragOverlay) return;
  dragOverlay = document.createElement('div');
  dragOverlay.className =
    'fixed inset-0 bg-indigo-900/40 border-4 border-dashed border-indigo-400 z-40 pointer-events-none flex items-center justify-center';
  const inner = document.createElement('div');
  inner.className =
    'text-white text-lg sm:text-xl font-semibold bg-gray-900/80 px-6 py-4 rounded-lg text-center';
  inner.textContent = t('multiTool.dropToAdd');
  dragOverlay.appendChild(inner);
  document.body.appendChild(dragOverlay);
}

function hideDragOverlay() {
  dragOverlay?.remove();
  dragOverlay = null;
}

function setupGlobalDragAndDrop() {
  const target = document.getElementById('main-scroll-container');
  if (!target) return;

  target.addEventListener('dragover', (e) => {
    if (!e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    showDragOverlay();
  });
  document.addEventListener('dragleave', (e) => {
    if (
      e.clientX <= 0 ||
      e.clientY <= 0 ||
      e.clientX >= window.innerWidth ||
      e.clientY >= window.innerHeight
    ) {
      hideDragOverlay();
    }
  });
  document.addEventListener('drop', () => hideDragOverlay());
  target.addEventListener('drop', (e) => {
    e.preventDefault();
    hideDragOverlay();
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) void handleIncomingFiles(files);
  });
}

async function processIncomingFiles(rawFiles: File[]): Promise<File[]> {
  const { pdfFiles, imageFiles, skipped } = partitionIncomingFiles(rawFiles);
  const result: File[] = [...pdfFiles];

  if (imageFiles.length > 0) {
    try {
      showLoading(t('multiTool.convertingImages'));
      result.push(await convertImagesToPdfFile(imageFiles));
    } catch (e) {
      console.error('Failed to convert images to PDF:', e);
      showModal(
        t('multiTool.error'),
        t('multiTool.failedToConvertImages'),
        'error'
      );
    } finally {
      hideLoading();
    }
  }

  if (skipped.length > 0) console.warn('Skipped unsupported files:', skipped);
  return result;
}

function ensureViewer(): Promise<ViewerRegistry> {
  if (registryPromise) return registryPromise;
  const target = document.getElementById('organize-viewer');
  if (!target) return Promise.reject(new Error('viewer container missing'));
  registryPromise = (async () => {
    const { default: EmbedPDF } = await import('bentopdf-viewer');
    viewer = EmbedPDF.init({
      type: 'container',
      target,
      worker: true,
      wasmUrl: embedPdfWasmUrl,
      theme: viewerTheme,
      tabBar: 'never',
      organize: { standalone: true },
      documentManager: { maxDocuments: 1 },
    });
    const registry = await viewer.registry;
    docManager = registry
      .getPlugin('document-manager')
      .provides() as unknown as DocManagerPlugin;
    docManager.onDocumentOpened((data) => {
      if (data?.id) currentDocId = data.id;
    });
    docManager.onDocumentClosed((data) => {
      const id = typeof data === 'string' ? data : data?.id;
      if (id && id === currentDocId) currentDocId = null;
    });
    return registry;
  })();
  return registryPromise;
}

async function canOpen(
  registry: ViewerRegistry,
  content: ArrayBuffer
): Promise<boolean> {
  const engine = registry.getEngine();
  try {
    const doc = await engine
      .openDocumentBuffer({ id: `multi-tool-probe-${++probeSeq}`, content })
      .toPromise();
    await engine
      .closeDocument(doc)
      .toPromise()
      .catch(() => {});
    return doc.pageCount > 0;
  } catch {
    return false;
  }
}

async function readablePdf(
  registry: ViewerRegistry,
  file: File
): Promise<ArrayBuffer | null> {
  const original = await file.arrayBuffer();
  if (await canOpen(registry, original)) return original;
  try {
    const repaired = await repairPdfFile(file);
    if (repaired) {
      const bytes = new Uint8Array(repaired).buffer;
      if (await canOpen(registry, bytes)) return bytes;
    }
  } catch (err) {
    console.warn(`Failed to repair ${file.name}:`, err);
  }
  return null;
}

async function handleIncomingFiles(rawFiles: File[]) {
  if (isBusy) {
    showModal(t('multiTool.pleaseWait'), t('multiTool.pagesRendering'), 'info');
    return;
  }
  isBusy = true;
  try {
    const processed = await processIncomingFiles(rawFiles);
    if (processed.length === 0) return;
    const decrypted = await batchDecryptIfNeeded(processed);
    if (decrypted.length === 0) return;

    showLoading(t('multiTool.renderingPages'));
    const registry = await ensureViewer();
    const buffers: ArrayBuffer[] = [];
    for (const file of decrypted) {
      const bytes = await readablePdf(registry, file);
      if (bytes) buffers.push(bytes);
      else
        showModal(
          t('multiTool.error'),
          `${t('multiTool.failedToLoad')} ${file.name}.`,
          'error'
        );
    }
    if (buffers.length === 0) return;

    const merged =
      buffers.length === 1
        ? buffers[0]
        : (
            await registry
              .getEngine()
              .merge(
                buffers.map((content, i) => ({
                  id: `multi-tool-${++probeSeq}-${i}`,
                  content,
                }))
              )
              .toPromise()
          ).content;

    setViewerVisible(true);
    docManager?.openDocumentBuffer({
      buffer: merged,
      name: decrypted[0].name,
      autoActivate: true,
    });
  } catch (err) {
    console.error('PDF Multi Tool failed to load files:', err);
    showModal(t('multiTool.error'), t('multiTool.failedToLoad'), 'error');
  } finally {
    hideLoading();
    isBusy = false;
  }
}

async function exportPdf() {
  if (!currentDocId || !registryPromise) {
    showModal(t('multiTool.noPages'), t('multiTool.noPagesToExport'), 'info');
    return;
  }
  try {
    const registry = await registryPromise;
    const exportPlugin = registry.getPlugin('export').provides();
    const buffer = await exportPlugin.saveAsCopy().toPromise();
    downloadFile(
      new Blob([new Uint8Array(buffer)], { type: 'application/pdf' }),
      'all-pages.pdf'
    );
  } catch (err) {
    console.error('Export failed:', err);
    showModal(t('multiTool.error'), t('multiTool.noPagesToExport'), 'error');
  }
}

function resetAll() {
  if (currentDocId) docManager?.closeDocument(currentDocId);
  currentDocId = null;
  setViewerVisible(false);
  document.getElementById('upload-area')?.classList.remove('hidden');
}
