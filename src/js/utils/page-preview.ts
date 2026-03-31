import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PreviewState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const state: PreviewState = {
  modal: null,
  pdfjsDoc: null,
  currentPage: 1,
  totalPages: 0,
  isOpen: false,
  container: null,
};

function getOrCreateModal(): HTMLElement {
  if (state.modal) return state.modal;

  const modal = document.createElement('div');
  modal.id = 'page-preview-modal';
  modal.className =
    'fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-200';
  modal.innerHTML = `
    <button id="preview-close" class="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors" title="Close (Esc)">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
    <button id="preview-prev" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2" title="Previous page">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
    </button>
    <button id="preview-next" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2" title="Next page">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
    <div id="preview-canvas-container" class="flex items-center justify-center max-w-[90vw] max-h-[85vh]">
      <div id="preview-loading" class="text-white/60 text-sm">Loading...</div>
    </div>
    <div id="preview-page-info" class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm"></div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hidePreview();
  });
  modal.querySelector('#preview-close')!.addEventListener('click', hidePreview);
  modal
    .querySelector('#preview-prev')!
    .addEventListener('click', () => navigatePage(-1));
  modal
    .querySelector('#preview-next')!
    .addEventListener('click', () => navigatePage(1));

  document.body.appendChild(modal);
  state.modal = modal;
  return modal;
}

async function renderPreviewPage(pageNumber: number): Promise<void> {
  if (!state.pdfjsDoc) return;

  const modal = getOrCreateModal();
  const container = modal.querySelector(
    '#preview-canvas-container'
  ) as HTMLElement;
  const pageInfo = modal.querySelector('#preview-page-info') as HTMLElement;
  const prevBtn = modal.querySelector('#preview-prev') as HTMLElement;
  const nextBtn = modal.querySelector('#preview-next') as HTMLElement;

  container.innerHTML = '<div class="text-white/60 text-sm">Loading...</div>';

  pageInfo.textContent = `Page ${pageNumber} of ${state.totalPages}`;
  prevBtn.style.visibility = pageNumber > 1 ? 'visible' : 'hidden';
  nextBtn.style.visibility =
    pageNumber < state.totalPages ? 'visible' : 'hidden';

  try {
    const page = await state.pdfjsDoc.getPage(pageNumber);
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className =
      'max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl';
    canvas.style.width = 'auto';
    canvas.style.height = 'auto';
    canvas.style.maxWidth = '90vw';
    canvas.style.maxHeight = '85vh';

    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    container.innerHTML = '';
    container.appendChild(canvas);
    state.currentPage = pageNumber;
  } catch (err) {
    console.error('Preview render error:', err);
    container.innerHTML =
      '<div class="text-red-400 text-sm">Failed to render page</div>';
  }
}

function navigatePage(delta: number): void {
  const newPage = state.currentPage + delta;
  if (newPage >= 1 && newPage <= state.totalPages) {
    renderPreviewPage(newPage);
  }
}

export function showPreview(
  pdfjsDoc: PDFDocumentProxy,
  pageNumber: number,
  totalPages: number
): void {
  state.pdfjsDoc = pdfjsDoc;
  state.totalPages = totalPages;
  state.isOpen = true;

  const modal = getOrCreateModal();
  modal.classList.remove('opacity-0', 'pointer-events-none');
  document.body.style.overflow = 'hidden';

  renderPreviewPage(pageNumber);
}

export function hidePreview(): void {
  if (!state.modal) return;
  state.isOpen = false;
  state.modal.classList.add('opacity-0', 'pointer-events-none');
  document.body.style.overflow = '';
}

function handleKeydown(e: KeyboardEvent): void {
  if (!state.isOpen) return;

  switch (e.key) {
    case 'Escape':
      hidePreview();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      navigatePage(-1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      navigatePage(1);
      break;
  }
}

document.addEventListener('keydown', handleKeydown);

export function initPagePreview(
  container: HTMLElement,
  pdfjsDoc: PDFDocumentProxy,
  _options: { pageAttr?: string } = {}
): void {
  const totalPages = pdfjsDoc.numPages;

  const thumbnails = container.querySelectorAll<HTMLElement>(
    '[data-page-number], [data-page-index], [data-pageIndex]'
  );

  thumbnails.forEach((thumb) => {
    if (thumb.dataset.previewInit) return;
    thumb.dataset.previewInit = 'true';

    let pageNum = 1;
    if (thumb.dataset.pageNumber) {
      pageNum = parseInt(thumb.dataset.pageNumber, 10);
    } else if (thumb.dataset.pageIndex !== undefined) {
      pageNum = parseInt(thumb.dataset.pageIndex, 10) + 1;
    }

    const icon = document.createElement('button');
    icon.className =
      'page-preview-btn absolute bottom-1 right-1 bg-gray-900/80 hover:bg-indigo-600 text-white/70 hover:text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10';
    icon.title = 'Preview';
    icon.innerHTML =
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>';
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      showPreview(pdfjsDoc, pageNum, totalPages);
    });

    if (!thumb.classList.contains('relative')) {
      thumb.classList.add('relative');
    }
    if (!thumb.classList.contains('group')) {
      thumb.classList.add('group');
    }

    thumb.appendChild(icon);
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !state.isOpen) {
      const hovered = container.querySelector<HTMLElement>(
        '[data-preview-init]:hover'
      );
      if (hovered) {
        e.preventDefault();
        let pageNum = 1;
        if (hovered.dataset.pageNumber) {
          pageNum = parseInt(hovered.dataset.pageNumber, 10);
        } else if (hovered.dataset.pageIndex !== undefined) {
          pageNum = parseInt(hovered.dataset.pageIndex, 10) + 1;
        }
        showPreview(pdfjsDoc, pageNum, totalPages);
      }
    }
  });
}
