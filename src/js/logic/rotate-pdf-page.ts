import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import {
  renderPagesProgressively,
  cleanupLazyRendering,
} from '../utils/render-utils.js';
import { rotatePdfPages } from '../utils/pdf-operations.js';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPdfDocument } from '../utils/load-pdf-document.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface RotateState {
  file: File | null;
  pdfDoc: PDFLibDocument | null;
  pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;
  rotations: number[];
}

const pageState: RotateState = {
  file: null,
  pdfDoc: null,
  pdfJsDoc: null,
  rotations: [],
};

function resetState() {
  cleanupLazyRendering();
  pageState.file = null;
  pageState.pdfDoc = null;
  pageState.pdfJsDoc = null;
  pageState.rotations = [];

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const pageThumbnails = document.getElementById('page-thumbnails');
  if (pageThumbnails) pageThumbnails.innerHTML = '';

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

function updateAllRotationDisplays() {
  for (let i = 0; i < pageState.rotations.length; i++) {
    const container = document.querySelector(`[data-page-index="${i}"]`);
    if (container) {
      const wrapper = container.querySelector(
        '.thumbnail-wrapper'
      ) as HTMLElement;
      if (wrapper)
        wrapper.style.transform = `rotate(${pageState.rotations[i]}deg)`;
    }
  }
}

function createPageWrapper(
  canvas: HTMLCanvasElement,
  pageNumber: number
): HTMLElement {
  const pageIndex = pageNumber - 1;

  const container = document.createElement('div');
  container.className =
    'page-thumbnail relative bg-gray-700 rounded-lg overflow-hidden';
  container.dataset.pageIndex = pageIndex.toString();
  container.dataset.pageNumber = pageNumber.toString();

  const canvasWrapper = document.createElement('div');
  canvasWrapper.className =
    'thumbnail-wrapper flex items-center justify-center p-2 h-36';
  canvasWrapper.style.transition = 'transform 0.3s ease';
  // Apply initial rotation if it exists
  const initialRotation = pageState.rotations[pageIndex] || 0;
  canvasWrapper.style.transform = `rotate(${initialRotation}deg)`;

  canvas.className = 'max-w-full max-h-full object-contain';
  canvasWrapper.appendChild(canvas);

  const pageLabel = document.createElement('div');
  pageLabel.className =
    'absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded';
  pageLabel.textContent = `${pageNumber}`;

  container.appendChild(canvasWrapper);
  container.appendChild(pageLabel);

  // Per-page rotation controls - Left and Right buttons only
  const controls = document.createElement('div');
  controls.className = 'flex items-center justify-center gap-2 p-2 bg-gray-800';

  const rotateLeftBtn = document.createElement('button');
  rotateLeftBtn.className =
    'flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 text-xs cursor-pointer';
  rotateLeftBtn.innerHTML = '<i data-lucide="rotate-ccw" class="w-3 h-3"></i>';
  rotateLeftBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    pageState.rotations[pageIndex] = pageState.rotations[pageIndex] - 90;
    const wrapper = container.querySelector(
      '.thumbnail-wrapper'
    ) as HTMLElement;
    if (wrapper)
      wrapper.style.transform = `rotate(${pageState.rotations[pageIndex]}deg)`;
  });

  const rotateRightBtn = document.createElement('button');
  rotateRightBtn.className =
    'flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 text-xs cursor-pointer';
  rotateRightBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-3 h-3"></i>';
  rotateRightBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    pageState.rotations[pageIndex] = pageState.rotations[pageIndex] + 90;
    const wrapper = container.querySelector(
      '.thumbnail-wrapper'
    ) as HTMLElement;
    if (wrapper)
      wrapper.style.transform = `rotate(${pageState.rotations[pageIndex]}deg)`;
  });

  controls.append(rotateLeftBtn, rotateRightBtn);
  container.appendChild(controls);

  // Re-create icons scoped to this container only
  setTimeout(function () {
    createIcons({ icons, nameAttr: 'data-lucide', attrs: {} });
  }, 0);

  return container;
}

async function renderThumbnails() {
  const pageThumbnails = document.getElementById('page-thumbnails');
  if (!pageThumbnails || !pageState.pdfJsDoc) return;

  pageThumbnails.innerHTML = '';

  await renderPagesProgressively(
    pageState.pdfJsDoc,
    pageThumbnails,
    createPageWrapper,
    {
      batchSize: 8,
      useLazyLoading: true,
      lazyLoadMargin: '200px',
      eagerLoadBatches: 2,
      onBatchComplete: function () {
        createIcons({ icons });
      },
    }
  );

  createIcons({ icons });
}

async function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const toolOptions = document.getElementById('tool-options');

  if (!fileDisplayArea) return;

  fileDisplayArea.innerHTML = '';

  if (pageState.file) {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col overflow-hidden';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = pageState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(pageState.file.size)} • Loading...`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = function () {
      resetState();
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });

    try {
      const result = await loadPdfWithPasswordPrompt(pageState.file);
      if (!result) {
        resetState();
        return;
      }
      showLoader('Loading PDF...');

      pageState.pdfDoc = await loadPdfDocument(result.bytes);

      pageState.pdfJsDoc = result.pdf;

      const pageCount = pageState.pdfDoc.getPageCount();
      pageState.rotations = new Array(pageCount).fill(0);

      metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageCount} pages`;

      await renderThumbnails();
      hideLoader();

      if (toolOptions) toolOptions.classList.remove('hidden');
    } catch (error) {
      console.error('Error loading PDF:', error);
      hideLoader();
      showAlert('Error', 'Failed to load PDF file.');
      resetState();
    }
  } else {
    if (toolOptions) toolOptions.classList.add('hidden');
  }
}

async function applyRotations() {
  if (!pageState.pdfDoc || !pageState.file) {
    showAlert('Error', 'Please upload a PDF first.');
    return;
  }

  showLoader('Applying rotations...');

  try {
    const pdfBytes = await pageState.pdfDoc.save();
    const rotatedPdfBytes = await rotatePdfPages(
      new Uint8Array(pdfBytes),
      pageState.rotations
    );
    const originalName = pageState.file.name.replace(/\.pdf$/i, '');

    downloadFile(
      new Blob([rotatedPdfBytes as unknown as BlobPart], {
        type: 'application/pdf',
      }),
      `${originalName}_rotated.pdf`
    );

    showAlert(
      'Success',
      'Rotations applied successfully!',
      'success',
      function () {
        resetState();
      }
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not apply rotations.');
  } finally {
    hideLoader();
  }
}

function handleFileSelect(files: FileList | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    ) {
      pageState.file = file;
      updateUI();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');
  const rotateAllLeft = document.getElementById('rotate-all-left');
  const rotateAllRight = document.getElementById('rotate-all-right');

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (rotateAllLeft) {
    rotateAllLeft.addEventListener('click', function () {
      for (let i = 0; i < pageState.rotations.length; i++) {
        pageState.rotations[i] = pageState.rotations[i] - 90;
      }
      updateAllRotationDisplays();
    });
  }

  if (rotateAllRight) {
    rotateAllRight.addEventListener('click', function () {
      for (let i = 0; i < pageState.rotations.length; i++) {
        pageState.rotations[i] = pageState.rotations[i] + 90;
      }
      updateAllRotationDisplays();
    });
  }

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', function (e) {
      handleFileSelect((e.target as HTMLInputElement).files);
    });

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(function (f) {
          return (
            f.type === 'application/pdf' ||
            f.name.toLowerCase().endsWith('.pdf')
          );
        });
        if (pdfFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFiles[0]);
          handleFileSelect(dataTransfer.files);
        }
      }
    });

    fileInput.addEventListener('click', function () {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', applyRotations);
  }
});
