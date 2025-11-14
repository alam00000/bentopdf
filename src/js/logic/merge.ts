import { showLoader, hideLoader, showAlert } from '../ui.ts';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.ts';
import { state } from '../state.ts';
import { icons, createIcons } from 'lucide';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Sortable from 'sortablejs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const mergeState = {
  pdfDocs: {},
  activeMode: 'file',
  sortableInstances: {},
  isRendering: false,
  cachedThumbnails: null,
  lastFileHash: null,
};

function clearMergeSelectionUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.textContent = '';

  const fileControls = document.getElementById('file-controls');
  if (fileControls) fileControls.classList.add('hidden');

  const mergeOptions = document.getElementById('merge-options');
  if (mergeOptions) mergeOptions.classList.add('hidden');

  const processBtn = document.getElementById('process-btn') as HTMLButtonElement | null;
  if (processBtn) {
    processBtn.disabled = true;
  }
}

function removeMergeFile(fileName: string) {
  const updatedFiles = (state.files as File[]).filter((file) => file.name !== fileName);
  state.files = updatedFiles;

  delete mergeState.pdfDocs[fileName];
  mergeState.cachedThumbnails = null;
  mergeState.lastFileHash = null;

  if (updatedFiles.length === 0) {
    const clearBtn = document.getElementById('clear-files-btn');
    if (clearBtn) {
      clearBtn.dispatchEvent(new Event('click'));
    } else {
      clearMergeSelectionUI();
    }
    mergeState.activeMode = 'file';
    return;
  }

  void setupMergeTool();
}

function parsePageRanges(rangeString: any, totalPages: any) {
  const indices = new Set();
  if (!rangeString.trim()) return [];

  const ranges = rangeString.split(',');
  for (const range of ranges) {
    const trimmedRange = range.trim();
    if (trimmedRange.includes('-')) {
      const [start, end] = trimmedRange.split('-').map(Number);
      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      )
        continue;
      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const pageNum = Number(trimmedRange);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
      indices.add(pageNum - 1);
    }
  }
  // @ts-expect-error TS(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
  return Array.from(indices).sort((a, b) => a - b);
}

function initializeFileListSortable() {
  const fileList = document.getElementById('file-list');
  if (!fileList) return;

  // @ts-expect-error TS(2339) FIXME: Property 'fileList' does not exist on type '{}'.
  if (mergeState.sortableInstances.fileList) {
    // @ts-expect-error TS(2339) FIXME: Property 'fileList' does not exist on type '{}'.
    mergeState.sortableInstances.fileList.destroy();
  }

  // @ts-expect-error TS(2339) FIXME: Property 'fileList' does not exist on type '{}'.
  mergeState.sortableInstances.fileList = Sortable.create(fileList, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onStart: function (evt: any) {
      evt.item.style.opacity = '0.5';
    },
    onEnd: function (evt: any) {
      evt.item.style.opacity = '1';
    },
  });
}

function initializePageThumbnailsSortable() {
  const container = document.getElementById('page-merge-preview');
  if (!container) return;

  // @ts-expect-error TS(2339) FIXME: Property 'pageThumbnails' does not exist on type '... Remove this comment to see the full error message
  if (mergeState.sortableInstances.pageThumbnails) {
    // @ts-expect-error TS(2339) FIXME: Property 'pageThumbnails' does not exist on type '... Remove this comment to see the full error message
    mergeState.sortableInstances.pageThumbnails.destroy();
  }

  // @ts-expect-error TS(2339) FIXME: Property 'pageThumbnails' does not exist on type '... Remove this comment to see the full error message
  mergeState.sortableInstances.pageThumbnails = Sortable.create(container, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onStart: function (evt: any) {
      evt.item.style.opacity = '0.5';
    },
    onEnd: function (evt: any) {
      evt.item.style.opacity = '1';
    },
  });
}

function generateFileHash() {
  return (state.files as File[])
    .map((f) => `${f.name}-${f.size}-${f.lastModified}`)
    .join('|');
}

async function renderPageMergeThumbnails() {
  const container = document.getElementById('page-merge-preview');
  if (!container) return;

  const currentFileHash = generateFileHash();
  const filesChanged = currentFileHash !== mergeState.lastFileHash;

  if (!filesChanged && mergeState.cachedThumbnails !== null) {
    // Simple check to see if it's already rendered to avoid flicker.
    if (container.firstChild) {
      initializePageThumbnailsSortable();
      return;
    }
  }

  if (mergeState.isRendering) {
    return;
  }

  mergeState.isRendering = true;
  container.textContent = '';

  let currentPageNumber = 0;
  let totalPages = state.files.reduce((sum, file) => {
    const pdfDoc = mergeState.pdfDocs[file.name];
    return sum + (pdfDoc ? pdfDoc.getPageCount() : 0);
  }, 0);

  try {
    const thumbnailsHTML = [];

    for (const file of state.files) {
      const pdfDoc = mergeState.pdfDocs[file.name];
      if (!pdfDoc) continue;

      const pdfData = await pdfDoc.save();
      const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

      for (let i = 1; i <= pdfjsDoc.numPages; i++) {
        currentPageNumber++;
        showLoader(
          `Rendering page previews: ${currentPageNumber}/${totalPages}`
        );
        const page = await pdfjsDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d')!;
        await page.render({
          canvasContext: context,
          canvas: canvas,
          viewport,
        }).promise;

        const wrapper = document.createElement('div');
        wrapper.className =
          'page-thumbnail relative cursor-move flex flex-col items-center gap-1 p-2 border-2 border-gray-600 hover:border-indigo-500 rounded-lg bg-gray-700 transition-colors';
        wrapper.dataset.fileName = file.name;
        wrapper.dataset.pageIndex = (i - 1).toString();

        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative';

        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.className = 'rounded-md shadow-md max-w-full h-auto';

        const pageNumDiv = document.createElement('div');
        pageNumDiv.className =
          'absolute top-1 left-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-lg';
        pageNumDiv.textContent = i.toString();

        imgContainer.append(img, pageNumDiv);

        const fileNamePara = document.createElement('p');
        fileNamePara.className =
          'text-xs text-gray-400 truncate w-full text-center';
        const fullTitle = `${file.name} (page ${i})`;
        fileNamePara.title = fullTitle;
        fileNamePara.textContent = `${file.name.substring(0, 10)}... (p${i})`;

        wrapper.append(imgContainer, fileNamePara);
        container.appendChild(wrapper);
      }

      pdfjsDoc.destroy();
    }

    mergeState.cachedThumbnails = true;
    mergeState.lastFileHash = currentFileHash;

    initializePageThumbnailsSortable();
  } catch (error) {
    console.error('Error rendering page thumbnails:', error);
    showAlert('Error', 'Failed to render page thumbnails');
  } finally {
    hideLoader();
    mergeState.isRendering = false;
  }
}

export async function merge() {
  showLoader('Merging PDFs...');
  try {
    const newPdfDoc = await PDFLibDocument.create();

    if (mergeState.activeMode === 'file') {
      const fileList = document.getElementById('file-list');
      const sortedFiles = Array.from(fileList.children)
        .map((li) => {
          // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
          return state.files.find((f) => f.name === li.dataset.fileName);
        })
        .filter(Boolean);

      for (const file of sortedFiles) {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const rangeInput = document.getElementById(`range-${safeFileName}`);
        if (!rangeInput) continue;

        // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
        const rangeInputValue = rangeInput.value;
        const sourcePdf = mergeState.pdfDocs[file.name];
        if (!sourcePdf) continue;

        const totalPages = sourcePdf.getPageCount();
        const pageIndices = parsePageRanges(rangeInputValue, totalPages);

        const indicesToCopy =
          pageIndices.length > 0 ? pageIndices : sourcePdf.getPageIndices();
        const copiedPages = await newPdfDoc.copyPages(sourcePdf, indicesToCopy);
        copiedPages.forEach((page: any) => newPdfDoc.addPage(page));
      }
    } else {
      const pageContainer = document.getElementById('page-merge-preview');
      const pageElements = Array.from(pageContainer.children);

      for (const el of pageElements) {
        // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
        const fileName = el.dataset.fileName;
        // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
        const pageIndex = parseInt(el.dataset.pageIndex, 10);

        const sourcePdf = mergeState.pdfDocs[fileName];
        if (sourcePdf && !isNaN(pageIndex)) {
          const [copiedPage] = await newPdfDoc.copyPages(sourcePdf, [
            pageIndex,
          ]);
          newPdfDoc.addPage(copiedPage);
        }
      }
    }

    const mergedPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' }),
      'merged.pdf'
    );
    showAlert('Success', 'PDFs merged successfully!');
  } catch (e) {
    console.error('Merge error:', e);
    showAlert(
      'Error',
      'Failed to merge PDFs. Please check that all files are valid and not password-protected.'
    );
  } finally {
    hideLoader();
  }
}

export async function setupMergeTool() {
  document.getElementById('merge-options').classList.remove('hidden');
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('process-btn').disabled = false;

  const wasInPageMode = mergeState.activeMode === 'page';

  showLoader('Loading PDF documents...');
  try {
    for (const file of state.files) {
      if (!mergeState.pdfDocs[file.name]) {
        const pdfBytes = await readFileAsArrayBuffer(file);
        mergeState.pdfDocs[file.name] = await PDFLibDocument.load(
          pdfBytes as ArrayBuffer,
          {
            ignoreEncryption: true,
          }
        );
      }
    }
  } catch (error) {
    console.error('Error loading PDFs:', error);
    showAlert('Error', 'Failed to load one or more PDF files');
    return;
  } finally {
    hideLoader();
  }

  const fileModeBtn = document.getElementById('file-mode-btn');
  const pageModeBtn = document.getElementById('page-mode-btn');
  const filePanel = document.getElementById('file-mode-panel');
  const pagePanel = document.getElementById('page-mode-panel');
  const fileList = document.getElementById('file-list');

  fileList.textContent = ''; // Clear list safely
  (state.files as File[]).forEach((f) => {
    const doc = mergeState.pdfDocs[f.name];
    const pageCount = doc ? doc.getPageCount() : 'N/A';
    const safeFileName = f.name.replace(/[^a-zA-Z0-9]/g, '_');

    const li = document.createElement('li');
    li.className =
      'bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors';
    li.dataset.fileName = f.name;

    const mainDiv = document.createElement('div');
    mainDiv.className = 'flex items-center justify-between';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'truncate font-medium text-white flex-1 mr-2';
    nameSpan.title = f.name;
    nameSpan.textContent = f.name;

    const actionGroup = document.createElement('div');
    actionGroup.className = 'flex items-center gap-2';

    const dragHandle = document.createElement('div');
    dragHandle.className =
      'drag-handle cursor-move text-gray-400 hover:text-white p-1 rounded transition-colors';
    dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`; // Safe: static content

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'text-red-400 hover:text-red-300 p-1 rounded transition-colors';
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    deleteBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeMergeFile(f.name);
    });

    actionGroup.append(dragHandle, deleteBtn);
    mainDiv.append(nameSpan, actionGroup);

    const rangeDiv = document.createElement('div');
    rangeDiv.className = 'mt-2';

    const label = document.createElement('label');
    label.htmlFor = `range-${safeFileName}`;
    label.className = 'text-xs text-gray-400';
    label.textContent = `Pages (e.g., 1-3, 5) - Total: ${pageCount}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `range-${safeFileName}`;
    input.className =
      'w-full bg-gray-800 border border-gray-600 text-white rounded-md p-2 text-sm mt-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors';
    input.placeholder = 'Leave blank for all pages';

    rangeDiv.append(label, input);
    li.append(mainDiv, rangeDiv);
    fileList.appendChild(li);
  });

  createIcons({ icons });

  initializeFileListSortable();

  const newFileModeBtn = fileModeBtn.cloneNode(true);
  const newPageModeBtn = pageModeBtn.cloneNode(true);
  fileModeBtn.replaceWith(newFileModeBtn);
  pageModeBtn.replaceWith(newPageModeBtn);

  newFileModeBtn.addEventListener('click', () => {
    if (mergeState.activeMode === 'file') return;

    mergeState.activeMode = 'file';
    filePanel.classList.remove('hidden');
    pagePanel.classList.add('hidden');

    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.remove('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.add('bg-gray-700', 'text-gray-300');
  });

  newPageModeBtn.addEventListener('click', async () => {
    if (mergeState.activeMode === 'page') return;

    mergeState.activeMode = 'page';
    filePanel.classList.add('hidden');
    pagePanel.classList.remove('hidden');

    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.remove('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.add('bg-gray-700', 'text-gray-300');

    await renderPageMergeThumbnails();
  });

  if (wasInPageMode) {
    mergeState.activeMode = 'page';
    filePanel.classList.add('hidden');
    pagePanel.classList.remove('hidden');

    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.remove('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.add('bg-gray-700', 'text-gray-300');

    await renderPageMergeThumbnails();
  } else {
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newFileModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newPageModeBtn.classList.add('bg-gray-700', 'text-gray-300');
  }
}
