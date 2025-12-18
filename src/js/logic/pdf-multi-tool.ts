import { createIcons, icons } from 'lucide';
import { degrees, PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import Sortable from 'sortablejs';
import { downloadFile, getPDFDocument } from '../utils/helpers';
import { renderPagesProgressively, cleanupLazyRendering, renderPageToCanvas, createPlaceholder } from '../utils/render-utils';
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js';
import { repairPdfFile } from './repair-pdf.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

import { t } from '../i18n/i18n';

interface PageData {
  id: string; // Unique ID for DOM reconciliation
  pdfIndex: number;
  pageIndex: number;
  rotation: number;
  visualRotation: number;
  canvas: HTMLCanvasElement | null;
  pdfDoc: PDFLibDocument;
  originalPageIndex: number;
  fileName: string; // Added for lazy loading identification
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

let allPages: PageData[] = [];
let selectedPages: Set<number> = new Set();
let currentPdfDocs: PDFLibDocument[] = [];
let splitMarkers: Set<number> = new Set();
let isRendering = false;
let renderCancelled = false;
let sortableInstance: Sortable | null = null;

const pageCanvasCache = new Map<string, HTMLCanvasElement>();

type Snapshot = { allPages: PageData[]; selectedPages: number[]; splitMarkers: number[] };
const undoStack: Snapshot[] = [];
const redoStack: Snapshot[] = [];

function snapshot() {
  const snap: Snapshot = {
    allPages: allPages.map(p => ({ ...p, canvas: p.canvas })),
    selectedPages: Array.from(selectedPages),
    splitMarkers: Array.from(splitMarkers),
  };
  undoStack.push(snap);
  redoStack.length = 0;
}

function restore(snap: Snapshot) {
  allPages = snap.allPages.map(p => ({
    ...p,
    canvas: p.canvas
  }));
  selectedPages = new Set(snap.selectedPages);
  splitMarkers = new Set(snap.splitMarkers);
  updatePageDisplay();
}

function showModal(title: string, message: string, type: 'info' | 'error' | 'success' = 'info') {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalIcon = document.getElementById('modal-icon');

  if (!modal || !modalTitle || !modalMessage || !modalIcon) return;

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  const iconMap = {
    info: 'info',
    error: 'alert-circle',
    success: 'check-circle'
  };
  const colorMap = {
    info: 'text-blue-400',
    error: 'text-red-400',
    success: 'text-green-400'
  };

  modalIcon.innerHTML = `<i data-lucide="${iconMap[type]}" class="w-12 h-12 ${colorMap[type]}"></i>`;
  modal.classList.remove('hidden');
  createIcons({ icons });
}

function hideModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
}

function showLoading(current: number, total: number) {
  // renderPagesProgressively handles loading UI via onProgress callback
  // but we can keep this for compatibility if needed
  const loader = document.getElementById('loading-overlay');
  const progress = document.getElementById('loading-progress');
  const text = document.getElementById('loading-text');

  if (!loader || !progress || !text) return;

  loader.classList.remove('hidden');
  const percentage = Math.round((current / total) * 100);
  progress.style.width = `${percentage}%`;
  text.textContent = t('multiTool.renderingPages');
}

async function withButtonLoading(buttonId: string, action: () => Promise<void>) {
  const button = document.getElementById(buttonId) as HTMLButtonElement;
  if (!button) return;

  const originalContent = button.innerHTML;
  const originalPointerEvents = button.style.pointerEvents;

  try {
    button.disabled = true;
    button.style.pointerEvents = 'none';
    button.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    await action();
  } finally {
    button.disabled = false;
    button.style.pointerEvents = originalPointerEvents;
    button.innerHTML = originalContent;
  }
}

function hideLoading() {
  const loader = document.getElementById('loading-overlay');
  if (loader) loader.classList.add('hidden');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('PDF Multi Tool: DOMContentLoaded');
    initializeTool();
  });
} else {
  console.log('PDF Multi Tool: DOMContentLoaded already fired, initializing immediately');
  initializeTool();
}

function initializeTool() {
  console.log('PDF Multi Tool: Initializing...');
  createIcons({ icons });

  initializeGlobalShortcuts();

  document.getElementById('close-tool-btn')?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });

  document.getElementById('upload-pdfs-btn')?.addEventListener('click', () => {
    console.log('Upload button clicked, isRendering:', isRendering);
    if (isRendering) {
      showModal(t('multiTool.pleaseWait'), t('multiTool.pagesRendering'), 'info');
      return;
    }
    document.getElementById('pdf-file-input')?.click();
  });

  document.getElementById('pdf-file-input')?.addEventListener('change', handlePdfUpload);
  document.getElementById('insert-pdf-input')?.addEventListener('change', handleInsertPdf);

  document.getElementById('bulk-rotate-left-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    bulkRotate(-90);
  });
  document.getElementById('bulk-rotate-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    bulkRotate(90);
  });
  document.getElementById('bulk-delete-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    bulkDelete();
  });
  document.getElementById('bulk-duplicate-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    bulkDuplicate();
  });
  document.getElementById('bulk-split-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    bulkSplit();
  });
  document.getElementById('bulk-download-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    if (isRendering) return;
    if (selectedPages.size === 0) {
      showModal(t('multiTool.noPagesSelected'), t('multiTool.selectOnePage'), 'info');
      return;
    }
    withButtonLoading('bulk-download-btn', async () => {
      await downloadPagesAsPdf(Array.from(selectedPages).sort((a, b) => a - b), 'selected-pages.pdf');
    });
  });

  document.getElementById('select-all-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    selectAll();
  });

  document.getElementById('deselect-all-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    deselectAll();
  });

  document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    if (isRendering) return;
    if (allPages.length === 0) {
      showModal(t('multiTool.noPages'), t('multiTool.noPagesToExport'), 'info');
      return;
    }
    withButtonLoading('export-pdf-btn', async () => {
      await downloadAll();
    });
  });
  document.getElementById('add-blank-page-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    snapshot();
    addBlankPage();
  });
  document.getElementById('undo-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    const last = undoStack.pop();
    if (last) {
      const current: Snapshot = {
        allPages: allPages.map(p => ({ ...p })),
        selectedPages: Array.from(selectedPages),
        splitMarkers: Array.from(splitMarkers),
      };
      redoStack.push(current);
      restore(last);
    }
  });
  document.getElementById('redo-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    const next = redoStack.pop();
    if (next) {
      const current: Snapshot = {
        allPages: allPages.map(p => ({ ...p })),
        selectedPages: Array.from(selectedPages),
        splitMarkers: Array.from(splitMarkers),
      };
      undoStack.push(current);
      restore(next);
    }
  });
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (isRendering) {
      renderCancelled = true;
      setTimeout(() => resetAll(), 100);
    } else {
      resetAll();
    }
  });

  document.getElementById('modal-close-btn')?.addEventListener('click', hideModal);
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
      hideModal();
    }
  });

  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('border-indigo-500');
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('border-indigo-500');
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-indigo-500');
      const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type === 'application/pdf');
      if (files.length > 0) {
        loadPdfs(files);
      }
    });
  }

  document.getElementById('upload-area')?.classList.remove('hidden');
}

function resetAll() {
  renderCancelled = true;
  isRendering = false;
  snapshot();
  allPages = [];
  selectedPages.clear();
  splitMarkers.clear();
  currentPdfDocs = [];
  pageCanvasCache.clear();
  cleanupLazyRendering();

  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

  // Force clear DOM to prevent ghost pages
  const pagesContainer = document.getElementById('pages-container');
  if (pagesContainer) pagesContainer.innerHTML = '';

  updatePageDisplay();
  document.getElementById('upload-area')?.classList.remove('hidden');
}

async function handlePdfUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (files.length > 0) {
    await loadPdfs(files);
  }
  input.value = '';
}

async function loadPdfs(files: File[]) {
  if (isRendering) {
    showModal(t('multiTool.pleaseWait'), t('multiTool.pagesRendering'), 'info');
    return;
  }

  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) uploadArea.classList.add('hidden');
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  isRendering = true;
  console.log('PDF Multi Tool: Starting render, isRendering set to true');
  renderCancelled = false;

  // Cleanup previous observers
  cleanupLazyRendering();

  showLoading(0, 100);

  try {
    for (const file of files) {
      if (renderCancelled) break;

      try {
        let arrayBuffer: ArrayBuffer;

        try {
          console.log(`Repairing ${file.name}...`);
          const loadingText = document.getElementById('loading-text');
          if (loadingText) loadingText.textContent = `Repairing ${file.name}...`;

          const repairedData = await repairPdfFile(file);
          if (repairedData) {
            arrayBuffer = repairedData.buffer as ArrayBuffer;
            console.log(`Successfully repaired ${file.name} before loading.`);
          } else {
            console.warn(`Repair returned null for ${file.name}, using original file.`);
            arrayBuffer = await file.arrayBuffer();
          }
        } catch (repairError) {
          console.warn(`Failed to repair ${file.name}, attempting to load original:`, repairError);
          arrayBuffer = await file.arrayBuffer();
        }

        const pdfDoc = await PDFLibDocument.load(arrayBuffer, { ignoreEncryption: true, throwOnInvalidObject: false });
        currentPdfDocs.push(pdfDoc);
        const pdfIndex = currentPdfDocs.length - 1;

        const pdfBytes = await pdfDoc.save();
        const pdfjsDoc = await getPDFDocument({ data: new Uint8Array(pdfBytes) }).promise;
        const numPages = pdfjsDoc.numPages;

        // Pre-fill allPages with placeholders to maintain order/state
        const startIndex = allPages.length;
        for (let i = 0; i < numPages; i++) {
          allPages.push({
            id: generateId(),
            pdfIndex,
            pageIndex: i,
            rotation: 0,
            visualRotation: 0,
            canvas: null, // Will be filled when rendered
            pdfDoc,
            originalPageIndex: i,
            fileName: file.name,
          });
        }

        await renderPagesProgressively(
          pdfjsDoc,
          pagesContainer,
          (canvas, pageNumber) => {
            const globalIndex = startIndex + pageNumber - 1;

            if (allPages[globalIndex]) {
              allPages[globalIndex].canvas = canvas;
            }

            return createPageElement(canvas, globalIndex);
          },
          {
            batchSize: 8,
            useLazyLoading: true,
            lazyLoadMargin: '400px',
            onProgress: (current, total) => {
              showLoading(current, total);
            },
            onBatchComplete: () => {
              createIcons({ icons });
            },
            shouldCancel: () => renderCancelled, // Pass cancellation check
          }
        );

      } catch (e) {
        console.error(`Failed to load PDF ${file.name}:`, e);
        showModal(t('multiTool.error'), `${t('multiTool.failedToLoad')} ${file.name}.`, 'error');
      }
    }

    if (!renderCancelled) {
      setupSortable();
      createIcons({ icons });
    }
  } finally {
    hideLoading();
    isRendering = false;
    console.log('PDF Multi Tool: Render finished/cancelled, isRendering set to false');
    if (renderCancelled) {
      renderCancelled = false;
    }
    if (allPages.length === 0) {
      resetAll();
    }
  }
}

function getCacheKey(pdfIndex: number, pageIndex: number): string {
  return `${pdfIndex}-${pageIndex}`;
}

// Wrapper for compatibility with updatePageDisplay
function createPageCard(pageData: PageData, index: number) {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  const card = createPageElement(pageData.canvas, index);
  pagesContainer.appendChild(card);
  createIcons({ icons });
}

// Modified to return the element instead of appending it
function createPageElement(canvas: HTMLCanvasElement | null, index: number): HTMLElement {
  const pageData = allPages[index];
  if (!pageData) {
    console.error(`Page data not found for index ${index}`);
    return document.createElement('div');
  }

  const card = document.createElement('div');
  card.className = 'bg-gray-800 rounded-lg border-2 border-gray-700 p-2 relative group cursor-move';
  card.dataset.pageIndex = index.toString();
  card.dataset.pageId = pageData.id; // Set ID for reconciliation

  // Add attributes for lazy loading identification
  card.dataset.pageNumber = (pageData.pageIndex + 1).toString();
  if (pageData.fileName) {
    card.dataset.fileName = pageData.fileName;
  }
  if (!pageData.canvas) {
    card.dataset.lazyLoad = 'true';
  }

  if (selectedPages.has(index)) {
    card.classList.add('border-indigo-500', 'ring-2', 'ring-indigo-500');
  }

  const preview = document.createElement('div');
  preview.className = 'bg-white rounded mb-2 overflow-hidden w-full flex items-center justify-center relative h-36 sm:h-64';

  if (canvas) {
    const previewCanvas = canvas;
    previewCanvas.className = 'max-w-full max-h-full object-contain';

    previewCanvas.style.transform = `rotate(${pageData.visualRotation}deg)`;
    previewCanvas.style.transition = 'transform 0.2s ease';
    preview.appendChild(previewCanvas);
  } else {
    // Show loading placeholder if canvas is null
    const loading = document.createElement('div');
    loading.className = 'flex flex-col items-center justify-center text-gray-400';
    loading.innerHTML = `
      <i data-lucide="loader" class="w-8 h-8 animate-spin mb-2"></i>
      <span class="text-xs">${t('common.loading')}</span>
    `;
    preview.appendChild(loading);
    preview.classList.add('bg-gray-700'); // Darker background for loading
  }

  // Page info
  const info = document.createElement('div');
  info.className = 'text-xs text-gray-400 text-center mb-2';
  info.textContent = `${t('common.page')} ${index + 1}`;

  // Actions toolbar
  const actions = document.createElement('div');
  actions.className = 'flex items-center justify-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-0 right-0';

  const actionsInner = document.createElement('div');
  actionsInner.className = 'flex items-center gap-1 bg-gray-900/90 rounded px-2 py-1';
  actions.appendChild(actionsInner);

  // Select checkbox
  const selectBtn = document.createElement('button');
  selectBtn.className = 'absolute top-2 right-2 p-1 rounded bg-gray-900/70 hover:bg-gray-800 z-10';
  selectBtn.innerHTML = selectedPages.has(index)
    ? '<i data-lucide="check-square" class="w-4 h-4 text-indigo-400"></i>'
    : '<i data-lucide="square" class="w-4 h-4 text-gray-200"></i>';
  selectBtn.onclick = (e) => {
    e.stopPropagation();
    toggleSelectOptimized(index);
  };

  // Rotate button
  const rotateBtn = document.createElement('button');
  rotateBtn.className = 'p-1 rounded hover:bg-gray-700';
  rotateBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4 text-gray-300"></i>';
  rotateBtn.onclick = (e) => {
    e.stopPropagation();
    rotatePage(index, 90);
  };
  const rotateLeftBtn = document.createElement('button');
  rotateLeftBtn.className = 'p-1 rounded hover:bg-gray-700';
  rotateLeftBtn.innerHTML = '<i data-lucide="rotate-ccw" class="w-4 h-4 text-gray-300"></i>';
  rotateLeftBtn.onclick = (e) => {
    e.stopPropagation();
    rotatePage(index, -90);
  };

  // Duplicate button
  const duplicateBtn = document.createElement('button');
  duplicateBtn.className = 'p-1 rounded hover:bg-gray-700';
  duplicateBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4 text-gray-300"></i>';
  duplicateBtn.title = t('multiTool.actions.duplicatePage');
  duplicateBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    duplicatePage(index);
  };

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'p-1 rounded hover:bg-gray-700';
  deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>';
  deleteBtn.title = t('multiTool.actions.deletePage');
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    deletePage(index);
  };

  // Insert PDF button
  const insertBtn = document.createElement('button');
  insertBtn.className = 'p-1 rounded hover:bg-gray-700';
  insertBtn.innerHTML = '<i data-lucide="file-plus" class="w-4 h-4 text-gray-300"></i>';
  insertBtn.title = t('multiTool.actions.insertPdf');
  insertBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    insertPdfAfter(index);
  };

  // Split button
  const splitBtn = document.createElement('button');
  splitBtn.className = 'p-1 rounded hover:bg-gray-700';
  splitBtn.innerHTML = '<i data-lucide="scissors" class="w-4 h-4 text-gray-300"></i>';
  splitBtn.title = t('multiTool.actions.toggleSplit');
  splitBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    toggleSplitMarker(index);
    renderSplitMarkers();
  };

  actionsInner.append(rotateLeftBtn, rotateBtn, duplicateBtn, insertBtn, splitBtn, deleteBtn);
  card.append(preview, info, actions, selectBtn);

  // Check for split marker
  if (splitMarkers.has(index)) {
    const marker = document.createElement('div');
    marker.className = 'split-marker absolute -right-3 top-0 bottom-0 w-6 flex items-center justify-center z-20 pointer-events-none';
    marker.innerHTML = '<div class="h-full w-0.5 border-l-2 border-dashed border-blue-400"></div>';
    card.appendChild(marker);
  }

  return card;
}

function setupSortable() {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  // Destroy existing instance before creating new one
  if (sortableInstance) {
    sortableInstance.destroy();
  }

  sortableInstance = Sortable.create(pagesContainer, {
    animation: 150,
    forceFallback: true,
    touchStartThreshold: 3,
    fallbackTolerance: 3,
    delay: 200,
    delayOnTouchOnly: true,
    scroll: document.getElementById('main-scroll-container'),
    scrollSensitivity: 100, // Increase sensitivity for smoother scrolling
    bubbleScroll: false, // Prevent bubbling scroll to parent
    onEnd: (evt) => {
      const oldIndex = evt.oldIndex!;
      const newIndex = evt.newIndex!;
      if (oldIndex !== newIndex) {
        const [moved] = allPages.splice(oldIndex, 1);
        allPages.splice(newIndex, 0, moved);
        updatePageNumbers();
      }
    },
  });
}

function toggleSelectOptimized(index: number) {
  if (selectedPages.has(index)) {
    selectedPages.delete(index);
  } else {
    selectedPages.add(index);
  }

  // Only update the specific card instead of re-rendering everything
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  const card = pagesContainer.children[index] as HTMLElement;
  if (!card) return;

  const selectBtn = card.querySelector('button[class*="absolute top-2 right-2"]');
  if (!selectBtn) return;

  if (selectedPages.has(index)) {
    card.classList.add('border-indigo-500', 'ring-2', 'ring-indigo-500');
    selectBtn.innerHTML = '<i data-lucide="check-square" class="w-4 h-4 text-indigo-400"></i>';
  } else {
    card.classList.remove('border-indigo-500', 'ring-2', 'ring-indigo-500');
    selectBtn.innerHTML = '<i data-lucide="square" class="w-4 h-4 text-gray-200"></i>';
  }

  createIcons({ icons });
}

function selectAll() {
  selectedPages.clear();
  allPages.forEach((_, index) => selectedPages.add(index));
  updatePageDisplay();
}

function deselectAll() {
  selectedPages.clear();
  updatePageDisplay();
}

function rotatePage(index: number, delta: number) {
  snapshot();

  const pageData = allPages[index];
  pageData.visualRotation = (pageData.visualRotation + delta + 360) % 360;
  pageData.rotation = (pageData.rotation + delta + 360) % 360;

  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  const card = pagesContainer.children[index] as HTMLElement;
  if (!card) return;

  const canvas = card.querySelector('canvas');
  const preview = card.querySelector('.bg-white');

  if (canvas && preview) {
    canvas.style.transform = `rotate(${pageData.visualRotation}deg)`;
    canvas.style.transition = 'transform 0.2s ease';
  }
}

function duplicatePage(index: number) {
  const originalPageData = allPages[index];
  const originalCanvas = originalPageData.canvas;

  const newCanvas = document.createElement('canvas');
  newCanvas.width = originalCanvas.width;
  newCanvas.height = originalCanvas.height;

  const newContext = newCanvas.getContext('2d');
  if (newContext) {
    newContext.drawImage(originalCanvas, 0, 0);
  }

  const newPageData: PageData = {
    ...originalPageData,
    id: generateId(), // New ID for the duplicate
    canvas: newCanvas,
  };

  const newIndex = index + 1;
  allPages.splice(newIndex, 0, newPageData);
  updatePageDisplay();
}

function deletePage(index: number) {
  allPages.splice(index, 1);
  selectedPages.delete(index);
  const newSelected = new Set<number>();
  selectedPages.forEach(i => {
    if (i > index) newSelected.add(i - 1);
    else if (i < index) newSelected.add(i);
  });
  selectedPages = newSelected;

  if (allPages.length === 0) {
    resetAll();
    return;
  }

  updatePageDisplay();
}

async function insertPdfAfter(index: number) {
  document.getElementById('insert-pdf-input')?.click();
  (window as any).__insertAfterIndex = index;
}

async function handleInsertPdf(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const insertAfterIndex = (window as any).__insertAfterIndex;
  if (insertAfterIndex === undefined) return;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLibDocument.load(arrayBuffer, { ignoreEncryption: true, throwOnInvalidObject: false });
    currentPdfDocs.push(pdfDoc);
    const pdfIndex = currentPdfDocs.length - 1;

    // Load PDF.js document for rendering
    const pdfBytes = await pdfDoc.save();
    const pdfjsDoc = await getPDFDocument({ data: new Uint8Array(pdfBytes) }).promise;
    const numPages = pdfjsDoc.numPages;

    const newPages: PageData[] = [];
    for (let i = 0; i < numPages; i++) {
      newPages.push({
        id: generateId(),
        pdfIndex,
        pageIndex: i,
        rotation: 0,
        visualRotation: 0,
        canvas: null, // Placeholder
        pdfDoc,
        originalPageIndex: i,
        fileName: file.name,
      });
    }

    // Insert new pages into allPages
    allPages.splice(insertAfterIndex + 1, 0, ...newPages);

    // Update display to show placeholders immediately
    updatePageDisplay();

    // Render pages progressively
    for (let i = 0; i < numPages; i++) {
      const globalIndex = insertAfterIndex + 1 + i;

      // Render page
      const canvas = await renderPageToCanvas(pdfjsDoc, i + 1);

      // Update data
      if (allPages[globalIndex]) {
        allPages[globalIndex].canvas = canvas;

        // Update UI if card exists
        const pagesContainer = document.getElementById('pages-container');
        const card = pagesContainer?.querySelector(`div[data-page-index="${globalIndex}"]`);
        if (card) {
          const preview = card.querySelector('.bg-gray-700') || card.querySelector('.bg-white');
          if (preview) {
            // Re-create the preview content
            preview.innerHTML = '';
            preview.className = 'bg-white rounded mb-2 overflow-hidden w-full flex items-center justify-center relative h-36 sm:h-64';

            const previewCanvas = canvas;
            previewCanvas.className = 'max-w-full max-h-full object-contain';
            previewCanvas.style.transform = `rotate(${allPages[globalIndex].visualRotation}deg)`;
            previewCanvas.style.transition = 'transform 0.2s ease';
            preview.appendChild(previewCanvas);
          }
        }
      }
    }

  } catch (e) {
    console.error('Failed to insert PDF:', e);
    showModal('Error', 'Failed to insert PDF. The file may be corrupted.', 'error');
  }

  input.value = '';
}

function toggleSplitMarker(index: number) {
  if (splitMarkers.has(index)) splitMarkers.delete(index);
  else splitMarkers.add(index);
}

function renderSplitMarkers() {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  pagesContainer.querySelectorAll('.split-marker').forEach(m => m.remove());

  Array.from(pagesContainer.children).forEach((cardEl, i) => {
    if (splitMarkers.has(i)) {
      const marker = document.createElement('div');
      marker.className = 'split-marker absolute -right-3 top-0 bottom-0 w-6 flex items-center justify-center z-20 pointer-events-none';
      marker.innerHTML = '<div class="h-full w-0.5 border-l-2 border-dashed border-blue-400"></div>';
      (cardEl as HTMLElement).appendChild(marker);
    }
  });
}

function addBlankPage() {
  const canvas = document.createElement('canvas');
  canvas.width = 595;
  canvas.height = 842;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 595, 842);
  }

  const blankPageData: PageData = {
    id: generateId(),
    pdfIndex: -1,
    pageIndex: -1,
    rotation: 0,
    visualRotation: 0,
    canvas,
    pdfDoc: null as any,
    originalPageIndex: -1,
    fileName: '', // Blank page has no file
  };

  allPages.push(blankPageData);
  updatePageDisplay();
}

function bulkRotate(delta: number) {
  if (selectedPages.size === 0) {
    showModal('No Selection', 'Please select pages to rotate.', 'info');
    return;
  }

  selectedPages.forEach(index => {
    const pageData = allPages[index];
    if (pageData) {
      // Update state
      pageData.visualRotation = (pageData.visualRotation + delta + 360) % 360;
      pageData.rotation = (pageData.rotation + delta + 360) % 360;

      // Update DOM immediately if it exists
      const pagesContainer = document.getElementById('pages-container');
      const card = pagesContainer?.querySelector(`div[data-page-index="${index}"]`);
      if (card) {
        const canvas = card.querySelector('canvas');
        if (canvas) {
          canvas.style.transform = `rotate(${pageData.visualRotation}deg)`;
        }
        // If no canvas (placeholder), the state update is enough. 
        // When it eventually renders, createPageElement will use the new rotation.
      }
    }
  });

  // TODO@ALAM - Do NOT call updatePageDisplay() as it destroys lazy loading observers
}

function bulkDelete() {
  if (selectedPages.size === 0) {
    showModal('No Selection', 'Please select pages to delete.', 'info');
    return;
  }
  const indices = Array.from(selectedPages).sort((a, b) => b - a);
  indices.forEach(index => allPages.splice(index, 1));
  selectedPages.clear();

  if (allPages.length === 0) {
    resetAll();
    return;
  }

  updatePageDisplay();
}

function bulkDuplicate() {
  if (selectedPages.size === 0) {
    showModal('No Selection', 'Please select pages to duplicate.', 'info');
    return;
  }
  const indices = Array.from(selectedPages).sort((a, b) => b - a);
  indices.forEach(index => {
    duplicatePage(index);
  });
  selectedPages.clear();
  updatePageDisplay();
}

function bulkSplit() {
  if (selectedPages.size === 0) {
    showModal('No Selection', 'Please select pages to mark for splitting.', 'info');
    return;
  }
  const indices = Array.from(selectedPages);
  indices.forEach(index => {
    if (!splitMarkers.has(index)) {
      splitMarkers.add(index);
    }
  });
  renderSplitMarkers();
  selectedPages.clear();
  updatePageDisplay();
}


async function downloadAll() {
  if (allPages.length === 0) {
    showModal('No Pages', 'Please upload PDFs first.', 'info');
    return;
  }

  // Check if there are split markers
  if (splitMarkers.size > 0) {
    // Split into multiple PDFs and download as ZIP
    await downloadSplitPdfs();
  } else {
    // Download as single PDF
    const indices = Array.from({ length: allPages.length }, (_, i) => i);
    await downloadPagesAsPdf(indices, 'all-pages.pdf');
  }
}

async function downloadSplitPdfs() {
  try {
    const zip = new JSZip();
    const sortedMarkers = Array.from(splitMarkers).sort((a, b) => a - b);

    // Create segments based on split markers
    const segments: number[][] = [];
    let currentSegment: number[] = [];

    for (let i = 0; i < allPages.length; i++) {
      currentSegment.push(i);

      // If this page has a split marker after it, start a new segment
      if (splitMarkers.has(i)) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }

    // Add the last segment if it has pages
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    // Create PDFs for each segment
    for (let segIndex = 0; segIndex < segments.length; segIndex++) {
      const segment = segments[segIndex];
      const newPdf = await PDFLibDocument.create();

      for (const index of segment) {
        const pageData = allPages[index];
        if (!pageData) {
          console.warn(`Page data missing for index ${index}`);
          continue;
        }
        if (pageData.pdfDoc && pageData.originalPageIndex >= 0) {
          const [copiedPage] = await newPdf.copyPages(pageData.pdfDoc, [pageData.originalPageIndex]);
          const page = newPdf.addPage(copiedPage);

          if (pageData.rotation !== 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + pageData.rotation));
          }
        } else {
          newPdf.addPage([595, 842]);
        }
      }

      const pdfBytes = await newPdf.save();
      zip.file(`document - ${segIndex + 1}.pdf`, pdfBytes);
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'split-documents.zip');

    showModal('Success', `Downloaded ${segments.length} PDF files in a ZIP archive.`, 'success');
  } catch (e) {
    console.error('Failed to create split PDFs:', e);
    showModal('Error', 'Failed to create split PDFs.', 'error');
  } finally {
    hideLoading(); // Ensure loader is hidden if we used it (though showModal replaces it)
  }
}

async function downloadPagesAsPdf(indices: number[], filename: string) {
  try {
    const newPdf = await PDFLibDocument.create();

    for (const index of indices) {
      const pageData = allPages[index];
      if (!pageData) {
        console.warn(`Page data missing for index ${index}`);
        continue;
      }
      if (pageData.pdfDoc && pageData.originalPageIndex >= 0) {
        // Copy page from original PDF
        const [copiedPage] = await newPdf.copyPages(pageData.pdfDoc, [pageData.originalPageIndex]);
        const page = newPdf.addPage(copiedPage);

        if (pageData.rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + pageData.rotation));
        }
      } else {
        newPdf.addPage([595, 842]);
      }
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });

    downloadFile(blob, filename);
    showModal('Success', 'PDF downloaded successfully.', 'success');
  } catch (e) {
    console.error('Failed to create PDF:', e);
    showModal('Error', 'Failed to create PDF.', 'error');
  }
}

function updatePageDisplay() {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  // 1. Create a map of existing elements by ID
  const existingElements = new Map<string, HTMLElement>();
  Array.from(pagesContainer.children).forEach((child) => {
    const el = child as HTMLElement;
    if (el.dataset.pageId) {
      existingElements.set(el.dataset.pageId, el);
    }
  });

  // 2. Iterate through allPages and reconcile DOM
  allPages.forEach((pageData, index) => {
    let card = existingElements.get(pageData.id);

    if (card) {
      // Element exists, update it
      existingElements.delete(pageData.id); // Remove from map so we know it's still in use

      // Check if position changed
      if (pagesContainer.children[index] !== card) {
        if (index < pagesContainer.children.length) {
          pagesContainer.insertBefore(card, pagesContainer.children[index]);
        } else {
          pagesContainer.appendChild(card);
        }
      }

      // Update index-dependent attributes
      card.dataset.pageIndex = index.toString();
      const info = card.querySelector('.text-xs.text-gray-400.text-center.mb-2');
      if (info) info.textContent = `Page ${index + 1} `;

      // Update selection state
      const selectBtn = card.querySelector('button[class*="absolute top-2 right-2"]');
      if (selectBtn) {
        if (selectedPages.has(index)) {
          card.classList.add('border-indigo-500', 'ring-2', 'ring-indigo-500');
          selectBtn.innerHTML = '<i data-lucide="check-square" class="w-4 h-4 text-indigo-400"></i>';
        } else {
          card.classList.remove('border-indigo-500', 'ring-2', 'ring-indigo-500');
          selectBtn.innerHTML = '<i data-lucide="square" class="w-4 h-4 text-gray-200"></i>';
        }
        // Update click handler to use new index
        (selectBtn as HTMLElement).onclick = (e) => {
          e.stopPropagation();
          toggleSelectOptimized(index);
        };
      }

      // Update visual rotation
      const canvas = card.querySelector('canvas');
      if (canvas) {
        canvas.style.transform = `rotate(${pageData.visualRotation}deg)`;
      }

      // Update action buttons
      const actionsInner = card.querySelector('.flex.items-center.gap-1.bg-gray-900\\/90');
      if (actionsInner) {
        const buttons = actionsInner.querySelectorAll('button');
        if (buttons[0]) (buttons[0] as HTMLElement).onclick = (e) => { e.stopPropagation(); rotatePage(index, -90); };
        if (buttons[1]) (buttons[1] as HTMLElement).onclick = (e) => { e.stopPropagation(); rotatePage(index, 90); };
        if (buttons[2]) (buttons[2] as HTMLElement).onclick = (e) => { e.stopPropagation(); snapshot(); duplicatePage(index); };
        if (buttons[3]) (buttons[3] as HTMLElement).onclick = (e) => { e.stopPropagation(); snapshot(); insertPdfAfter(index); };
        if (buttons[4]) (buttons[4] as HTMLElement).onclick = (e) => { e.stopPropagation(); snapshot(); toggleSplitMarker(index); renderSplitMarkers(); };
        if (buttons[5]) (buttons[5] as HTMLElement).onclick = (e) => { e.stopPropagation(); snapshot(); deletePage(index); };
      }

    } else {
      // Element doesn't exist, create it
      card = createPageElement(pageData.canvas, index);
      card.dataset.pageId = pageData.id; // IMPORTANT: Set the ID

      if (index < pagesContainer.children.length) {
        pagesContainer.insertBefore(card, pagesContainer.children[index]);
      } else {
        pagesContainer.appendChild(card);
      }
    }
  });

  // 3. Remove remaining elements (deleted pages)
  existingElements.forEach((el) => el.remove());

  setupSortable();
  renderSplitMarkers();
  createIcons({ icons });
}

function updatePageNumbers() {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  const cards = Array.from(pagesContainer.children) as HTMLElement[];
  cards.forEach((card, index) => {
    // Update data attribute
    card.dataset.pageIndex = index.toString();

    // Update visible page number text
    const info = card.querySelector('.text-xs.text-gray-400.text-center.mb-2');
    if (info) {
      info.textContent = `Page ${index + 1} `;
    }

    // Re-attach event listeners for buttons
    // We need to find the buttons and update their onclick handlers
    // This is necessary because the original handlers captured the old index

    const selectBtn = card.querySelector('button[class*="absolute top-2 right-2"]') as HTMLButtonElement;
    if (selectBtn) {
      selectBtn.onclick = (e) => {
        e.stopPropagation();
        toggleSelectOptimized(index);
      };
    }

    const actionsInner = card.querySelector('.flex.items-center.gap-1.bg-gray-900\\/90');
    if (actionsInner) {
      const buttons = actionsInner.querySelectorAll('button');
      // Order: Rotate Left, Rotate Right, Duplicate, Insert, Split, Delete
      if (buttons[0]) buttons[0].onclick = (e) => { e.stopPropagation(); rotatePage(index, -90); };
      if (buttons[1]) buttons[1].onclick = (e) => { e.stopPropagation(); rotatePage(index, 90); };
      if (buttons[2]) buttons[2].onclick = (e) => { e.stopPropagation(); snapshot(); duplicatePage(index); };
      if (buttons[3]) buttons[3].onclick = (e) => { e.stopPropagation(); snapshot(); insertPdfAfter(index); };
      if (buttons[4]) buttons[4].onclick = (e) => { e.stopPropagation(); snapshot(); toggleSplitMarker(index); renderSplitMarkers(); };
      if (buttons[5]) buttons[5].onclick = (e) => { e.stopPropagation(); snapshot(); deletePage(index); };
    }
  });
}