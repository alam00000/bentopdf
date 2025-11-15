// @TODO:@ALAM-  sometimes I think... and then I forget...
// 

import { createIcons, icons } from 'lucide';
import { degrees, PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import Sortable from 'sortablejs';
import { downloadFile } from '../utils/helpers';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PageData {
  pdfIndex: number;
  pageIndex: number;
  rotation: number;
  visualRotation: number;
  canvas: HTMLCanvasElement;
  pdfDoc: PDFLibDocument;
  originalPageIndex: number;
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
  const loader = document.getElementById('loading-overlay');
  const progress = document.getElementById('loading-progress');
  const text = document.getElementById('loading-text');

  if (!loader || !progress || !text) return;

  loader.classList.remove('hidden');
  const percentage = Math.round((current / total) * 100);
  progress.style.width = `${percentage}%`;
  text.textContent = `Rendering pages... ${current} of ${total}`;
}

function hideLoading() {
  const loader = document.getElementById('loading-overlay');
  if (loader) loader.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTool();
});

function initializeTool() {
  createIcons({ icons });

  document.getElementById('close-tool-btn')?.addEventListener('click', () => {
    window.location.href = '/';
  });

  document.getElementById('upload-pdfs-btn')?.addEventListener('click', () => {
    if (isRendering) {
      showModal('Please Wait', 'Pages are still being rendered. Please wait...', 'info');
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
    bulkDownload();
  });
  document.getElementById('select-all-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    selectAll();
  });
  document.getElementById('deselect-all-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    deselectAll();
  });
  document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
    if (isRendering) return;
    downloadAll();
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
  snapshot();
  allPages = [];
  selectedPages.clear();
  splitMarkers.clear();
  currentPdfDocs = [];
  pageCanvasCache.clear();
  renderCancelled = false;
  isRendering = false;

  // Destroy sortable instance
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

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
    showModal('Please Wait', 'Pages are still being rendered. Please wait...', 'info');
    return;
  }

  const uploadArea = document.getElementById('upload-area');
  if (uploadArea) uploadArea.classList.add('hidden');

  isRendering = true;
  renderCancelled = false;
  let totalPages = 0;
  let currentPage = 0;

  try {
    // First pass: count total pages
    const pdfDocs: PDFLibDocument[] = [];
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLibDocument.load(arrayBuffer);
        pdfDocs.push(pdfDoc);
        totalPages += pdfDoc.getPageCount();
      } catch (e) {
        console.error(`Failed to load PDF ${file.name}:`, e);
        showModal('Error', `Failed to load ${file.name}. The file may be corrupted.`, 'error');
      }
    }

    // Second pass: render pages
    for (const pdfDoc of pdfDocs) {
      if (renderCancelled) break;

      currentPdfDocs.push(pdfDoc);
      const numPages = pdfDoc.getPageCount();

      for (let i = 0; i < numPages; i++) {
        if (renderCancelled) break;

        currentPage++;
        showLoading(currentPage, totalPages);
        await renderPage(pdfDoc, i, currentPdfDocs.length - 1);
      }
    }

    if (!renderCancelled) {
      setupSortable();
      createIcons({ icons });
    }
  } finally {
    hideLoading();
    isRendering = false;
    if (renderCancelled) {
      renderCancelled = false;
    }
  }
}

function getCacheKey(pdfIndex: number, pageIndex: number): string {
  return `${pdfIndex}-${pageIndex}`;
}

async function renderPage(pdfDoc: PDFLibDocument, pageIndex: number, pdfIndex: number) {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  // Check cache first
  const cacheKey = getCacheKey(pdfIndex, pageIndex);
  let canvas: HTMLCanvasElement;

  if (pageCanvasCache.has(cacheKey)) {
    canvas = pageCanvasCache.get(cacheKey)!;
  } else {
    const pdfBytes = await pdfDoc.save();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
    const page = await pdf.getPage(pageIndex + 1);

    const viewport = page.getViewport({ scale: 0.5, rotation: 0 });

    canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) return;

    await page.render({
      canvasContext: context,
      viewport,
      background: 'white',
      canvas
    }).promise;

    // Cache the canvas
    pageCanvasCache.set(cacheKey, canvas);
  }

  const pageData: PageData = {
    pdfIndex,
    pageIndex,
    rotation: 0, // Actual rotation to apply when saving PDF
    visualRotation: 0, // Visual rotation for display only
    canvas,
    pdfDoc,
    originalPageIndex: pageIndex,
  };

  allPages.push(pageData);
  createPageCard(pageData, allPages.length - 1);
}

function createPageCard(pageData: PageData, index: number) {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  const card = document.createElement('div');
  card.className = 'bg-gray-800 rounded-lg border-2 border-gray-700 p-2 relative group cursor-move';
  card.dataset.pageIndex = index.toString();
  if (selectedPages.has(index)) {
    card.classList.add('border-indigo-500', 'ring-2', 'ring-indigo-500');
  }

  // Page preview
  const preview = document.createElement('div');
  preview.className = 'bg-white rounded mb-2 overflow-hidden w-full flex items-center justify-center relative';
  preview.style.minHeight = '160px';
  preview.style.height = '250px';

  const previewCanvas = pageData.canvas;
  previewCanvas.className = 'max-w-full max-h-full object-contain';

  // Apply visual rotation using CSS transform
  previewCanvas.style.transform = `rotate(${pageData.visualRotation}deg)`;
  previewCanvas.style.transition = 'transform 0.2s ease';

  preview.appendChild(previewCanvas);

  // Page info
  const info = document.createElement('div');
  info.className = 'text-xs text-gray-400 text-center mb-2';
  info.textContent = `Page ${index + 1}`;

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
  duplicateBtn.title = 'Duplicate this page';
  duplicateBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    duplicatePage(index);
  };

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'p-1 rounded hover:bg-gray-700';
  deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>';
  deleteBtn.title = 'Delete this page';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    deletePage(index);
  };

  // Insert PDF button
  const insertBtn = document.createElement('button');
  insertBtn.className = 'p-1 rounded hover:bg-gray-700';
  insertBtn.innerHTML = '<i data-lucide="file-plus" class="w-4 h-4 text-gray-300"></i>';
  insertBtn.title = 'Insert PDF after this page';
  insertBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    insertPdfAfter(index);
  };

  // Split button
  const splitBtn = document.createElement('button');
  splitBtn.className = 'p-1 rounded hover:bg-gray-700';
  splitBtn.innerHTML = '<i data-lucide="scissors" class="w-4 h-4 text-gray-300"></i>';
  splitBtn.title = 'Toggle split after this page';
  splitBtn.onclick = (e) => {
    e.stopPropagation();
    snapshot();
    toggleSplitMarker(index);
    renderSplitMarkers();
  };

  actionsInner.append(rotateLeftBtn, rotateBtn, duplicateBtn, insertBtn, splitBtn, deleteBtn);
  card.append(preview, info, actions, selectBtn);
  pagesContainer.appendChild(card);

  createIcons({ icons });
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
    const pdfDoc = await PDFLibDocument.load(arrayBuffer);
    currentPdfDocs.push(pdfDoc);

    const numPages = pdfDoc.getPageCount();
    const newPages: PageData[] = [];
    for (let i = 0; i < numPages; i++) {
      // Use the existing renderPage function, which adds to allPages
      await renderPage(pdfDoc, i, currentPdfDocs.length - 1);
      // Move the newly added page data to the temporary array
      newPages.push(allPages.pop()!);
    }

    allPages.splice(insertAfterIndex + 1, 0, ...newPages);
    updatePageDisplay();
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
    pdfIndex: -1,
    pageIndex: -1,
    rotation: 0,
    visualRotation: 0,
    canvas,
    pdfDoc: null as any,
    originalPageIndex: -1,
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
    pageData.visualRotation = (pageData.visualRotation + delta + 360) % 360;
    pageData.rotation = (pageData.rotation + delta + 360) % 360;
  });

  updatePageDisplay();
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

async function bulkDownload() {
  if (selectedPages.size === 0) {
    showModal('No Selection', 'Please select pages to download.', 'info');
    return;
  }
  const indices = Array.from(selectedPages);
  await downloadPagesAsPdf(indices, 'selected-pages.pdf');
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
      zip.file(`document-${segIndex + 1}.pdf`, pdfBytes);
    }

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'split-documents.zip');

    showModal('Success', `Downloaded ${segments.length} PDF files in a ZIP archive.`, 'success');
  } catch (e) {
    console.error('Failed to create split PDFs:', e);
    showModal('Error', 'Failed to create split PDFs.', 'error');
  }
}

async function downloadPagesAsPdf(indices: number[], filename: string) {
  try {
    const newPdf = await PDFLibDocument.create();

    for (const index of indices) {
      const pageData = allPages[index];
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
  } catch (e) {
    console.error('Failed to create PDF:', e);
    showModal('Error', 'Failed to create PDF.', 'error');
  }
}

function updatePageDisplay() {
  const pagesContainer = document.getElementById('pages-container');
  if (!pagesContainer) return;

  pagesContainer.innerHTML = '';
  allPages.forEach((pageData, index) => {
    createPageCard(pageData, index);
  });
  setupSortable();
  renderSplitMarkers();
  createIcons({ icons });
}

function updatePageNumbers() {
  updatePageDisplay();
}