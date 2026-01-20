import { PDFDocument, PDFName, PDFNumber, PDFHexString, PDFRef } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PageViewport } from 'pdfjs-dist';
import Sortable from 'sortablejs';
import { createIcons, icons } from 'lucide';
import '../../css/bookmark.css';
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js';
import {
  truncateFilename,
  getPDFDocument,
  formatBytes,
  downloadFile,
  escapeHtml,
  hexToRgb,
} from '../utils/helpers.js';
import {
  BookmarkNode,
  BookmarkTree,
  BookmarkColor,
  BookmarkStyle,
  ModalField,
  ModalResult,
  ModalDefaultValues,
  DestinationCallback,
  FlattenedBookmark,
  OutlineItem,
  PDFOutlineItem,
  COLOR_CLASSES,
  TEXT_COLOR_CLASSES,
  HEX_COLOR_MAP,
  PDF_COLOR_MAP,
} from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const modalContainer = document.getElementById(
  'modal-container'
) as HTMLElement | null;

let isPickingDestination = false;
let currentPickingCallback: DestinationCallback | null = null;
let destinationMarker: HTMLDivElement | null = null;
let savedModalOverlay: HTMLDivElement | null = null;
let savedModal: HTMLDivElement | null = null;
let currentViewport: PageViewport | null = null;
let currentZoom = 1.0;
const fileInput = document.getElementById(
  'file-input'
) as HTMLInputElement | null;
const csvInput = document.getElementById(
  'csv-input'
) as HTMLInputElement | null;
const jsonInput = document.getElementById(
  'json-input'
) as HTMLInputElement | null;
const autoExtractCheckbox = document.getElementById(
  'auto-extract-checkbox'
) as HTMLInputElement | null;
const appEl = document.getElementById('app') as HTMLElement | null;
const uploaderEl = document.getElementById('uploader') as HTMLElement | null;
const loaderModal = document.getElementById(
  'loader-modal'
) as HTMLElement | null;
const fileDisplayArea = document.getElementById(
  'file-display-area'
) as HTMLElement | null;
const backToToolsBtn = document.getElementById(
  'back-to-tools'
) as HTMLButtonElement | null;
const closeBtn = document.getElementById(
  'back-btn'
) as HTMLButtonElement | null;
const canvas = document.getElementById(
  'pdf-canvas'
) as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d') ?? null;
const pageIndicator = document.getElementById(
  'page-indicator'
) as HTMLElement | null;
const prevPageBtn = document.getElementById(
  'prev-page'
) as HTMLButtonElement | null;
const nextPageBtn = document.getElementById(
  'next-page'
) as HTMLButtonElement | null;
const gotoPageInput = document.getElementById(
  'goto-page'
) as HTMLInputElement | null;
const gotoBtn = document.getElementById('goto-btn') as HTMLButtonElement | null;
const zoomInBtn = document.getElementById(
  'zoom-in-btn'
) as HTMLButtonElement | null;
const zoomOutBtn = document.getElementById(
  'zoom-out-btn'
) as HTMLButtonElement | null;
const zoomFitBtn = document.getElementById(
  'zoom-fit-btn'
) as HTMLButtonElement | null;
const zoomIndicator = document.getElementById(
  'zoom-indicator'
) as HTMLElement | null;
const addTopLevelBtn = document.getElementById(
  'add-top-level-btn'
) as HTMLButtonElement | null;
const titleInput = document.getElementById(
  'bookmark-title'
) as HTMLInputElement | null;
const treeList = document.getElementById(
  'bookmark-tree-list'
) as HTMLElement | null;
const noBookmarksEl = document.getElementById(
  'no-bookmarks'
) as HTMLElement | null;
const downloadBtn = document.getElementById(
  'download-btn'
) as HTMLButtonElement | null;
const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement | null;
const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement | null;
const resetBtn = document.getElementById(
  'reset-btn'
) as HTMLButtonElement | null;
const deleteAllBtn = document.getElementById(
  'delete-all-btn'
) as HTMLButtonElement | null;
const searchInput = document.getElementById(
  'search-bookmarks'
) as HTMLInputElement | null;

const importDropdownBtn = document.getElementById(
  'import-dropdown-btn'
) as HTMLButtonElement | null;
const exportDropdownBtn = document.getElementById(
  'export-dropdown-btn'
) as HTMLButtonElement | null;
const importDropdown = document.getElementById(
  'import-dropdown'
) as HTMLElement | null;
const exportDropdown = document.getElementById(
  'export-dropdown'
) as HTMLElement | null;
const importCsvBtn = document.getElementById(
  'import-csv-btn'
) as HTMLButtonElement | null;
const exportCsvBtn = document.getElementById(
  'export-csv-btn'
) as HTMLButtonElement | null;
const importJsonBtn = document.getElementById(
  'import-json-btn'
) as HTMLButtonElement | null;
const exportJsonBtn = document.getElementById(
  'export-json-btn'
) as HTMLButtonElement | null;
const csvImportHidden = document.getElementById(
  'csv-import-hidden'
) as HTMLInputElement | null;
const jsonImportHidden = document.getElementById(
  'json-import-hidden'
) as HTMLInputElement | null;
const extractExistingBtn = document.getElementById(
  'extract-existing-btn'
) as HTMLButtonElement | null;
const currentPageDisplay = document.getElementById(
  'current-page-display'
) as HTMLElement | null;
const filenameDisplay = document.getElementById(
  'filename-display'
) as HTMLElement | null;

const batchModeCheckbox = document.getElementById(
  'batch-mode-checkbox'
) as HTMLInputElement | null;
const batchOperations = document.getElementById(
  'batch-operations'
) as HTMLElement | null;
const selectedCountDisplay = document.getElementById(
  'selected-count'
) as HTMLElement | null;
const batchColorSelect = document.getElementById(
  'batch-color-select'
) as HTMLSelectElement | null;
const batchStyleSelect = document.getElementById(
  'batch-style-select'
) as HTMLSelectElement | null;
const batchDeleteBtn = document.getElementById(
  'batch-delete-btn'
) as HTMLButtonElement | null;
const selectAllBtn = document.getElementById(
  'select-all-btn'
) as HTMLButtonElement | null;
const deselectAllBtn = document.getElementById(
  'deselect-all-btn'
) as HTMLButtonElement | null;
const expandAllBtn = document.getElementById(
  'expand-all-btn'
) as HTMLButtonElement | null;
const collapseAllBtn = document.getElementById(
  'collapse-all-btn'
) as HTMLButtonElement | null;

const showViewerBtn = document.getElementById(
  'show-viewer-btn'
) as HTMLButtonElement | null;
const showBookmarksBtn = document.getElementById(
  'show-bookmarks-btn'
) as HTMLButtonElement | null;
const viewerSection = document.getElementById(
  'viewer-section'
) as HTMLElement | null;
const bookmarksSection = document.getElementById(
  'bookmarks-section'
) as HTMLElement | null;

function showInputModal(
  title: string,
  fields: ModalField[] = [],
  defaultValues: ModalDefaultValues = {}
): Promise<ModalResult | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.id = 'active-modal';

    const fieldsHTML = fields
      .map((field) => {
        if (field.type === 'text') {
          return `
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
      <input type="text" id="modal-${field.name}" value="${escapeHTML(String(defaultValues[field.name] || ''))}"
class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
placeholder="${field.placeholder || ''}" />
  </div>
    `;
        } else if (field.type === 'select') {
          return `
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
      <select id="modal-${field.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
        ${field.options
          .map(
            (opt) => `
                                        <option value="${opt.value}" ${defaultValues[field.name] === opt.value ? 'selected' : ''}>
                                            ${opt.label}
                                        </option>
                                    `
          )
          .join('')}
</select>
                                ${field.name === 'color' ? '<input type="color" id="modal-color-picker" class="hidden w-full h-10 mt-2 rounded cursor-pointer border border-gray-300" value="#000000" />' : ''}
</div>
  `;
        } else if (field.type === 'destination') {
          const hasDestination =
            defaultValues.destX !== null && defaultValues.destX !== undefined;
          return `
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
      <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1 text-xs">
            <input type="checkbox" id="modal-use-destination" class="w-4 h-4" ${hasDestination ? 'checked' : ''}>
              <span class="text-gray-700">Set custom destination</span>
                </label>
                </div>
                <div id="destination-controls" class="${hasDestination ? '' : 'hidden'} space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                    <label class="text-xs text-gray-600">Page</label>
                      <input type="number" id="modal-dest-page" min="1" max="${field.maxPages || 1}" value="${defaultValues.destPage || field.page || 1}"
class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900" step="1" />
  </div>
  <div>
  <label class="text-xs text-gray-600">Zoom(%)</label>
    <select id="modal-dest-zoom" class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900">
      <option value="">Inherit</option>
        <option value="0">Fit Page</option>
          <option value="50">50%</option>
            <option value="75">75%</option>
              <option value="100">100%</option>
                <option value="125">125%</option>
                  <option value="150">150%</option>
                    <option value="200">200%</option>
                      </select>
                      </div>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                        <label class="text-xs text-gray-600">X Position</label>
                          <input type="number" id="modal-dest-x" value="0" step="10"
class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900" />
  </div>
  <div>
  <label class="text-xs text-gray-600">Y Position</label>
    <input type="number" id="modal-dest-y" value="0" step="10"
class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900" />
  </div>
  </div>
  <button id="modal-pick-destination" class="w-full px-3 py-2 btn-gradient text-white rounded text-xs !flex items-center justify-center gap-1">
    <i data-lucide="crosshair" class="w-3 h-3"></i> Click on PDF to Pick Location
      </button>
      <p class="text-xs text-gray-500 italic">Click the button above, then click on the PDF where you want the bookmark to jump to</p>
        </div>
        </div>
        </div>
          `;
        } else if (field.type === 'preview') {
          return `
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
            <div id="modal-preview" class="style-preview bg-gray-50">
              <span id="preview-text" style="font-size: 16px;">Preview Text</span>
                </div>
                </div>
                  `;
        }
        return '';
      })
      .join('');

    modal.innerHTML = `
                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-800 mb-4">${title}</h3>
                    <div class="mb-6">
                      ${fieldsHTML}
</div>
  <div class="flex gap-2 justify-end">
    <button id="modal-cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
      <button id="modal-confirm" class="px-4 py-2 rounded btn-gradient text-white">Confirm</button>
        </div>
        </div>
          `;

    overlay.appendChild(modal);
    modalContainer?.appendChild(overlay);

    function updatePreview(): void {
      const previewText = modal.querySelector(
        '#preview-text'
      ) as HTMLSpanElement | null;
      if (previewText) {
        const titleInputEl = modal.querySelector(
          '#modal-title'
        ) as HTMLInputElement | null;
        const colorSelectEl = modal.querySelector(
          '#modal-color'
        ) as HTMLSelectElement | null;
        const styleSelectEl = modal.querySelector(
          '#modal-style'
        ) as HTMLSelectElement | null;
        const colorPickerEl = modal.querySelector(
          '#modal-color-picker'
        ) as HTMLInputElement | null;

        const titleVal = titleInputEl ? titleInputEl.value : 'Preview Text';
        const color = colorSelectEl ? colorSelectEl.value : '';
        const style = styleSelectEl ? styleSelectEl.value : '';

        previewText.textContent = titleVal || 'Preview Text';

        if (color === 'custom' && colorPickerEl) {
          previewText.style.color = colorPickerEl.value;
        } else {
          previewText.style.color = HEX_COLOR_MAP[color] || '#000';
        }

        previewText.style.fontWeight =
          style === 'bold' || style === 'bold-italic' ? 'bold' : 'normal';
        previewText.style.fontStyle =
          style === 'italic' || style === 'bold-italic' ? 'italic' : 'normal';
      }
    }

    const modalTitleInput = modal.querySelector(
      '#modal-title'
    ) as HTMLInputElement | null;
    const modalColorSelect = modal.querySelector(
      '#modal-color'
    ) as HTMLSelectElement | null;
    const modalStyleSelect = modal.querySelector(
      '#modal-style'
    ) as HTMLSelectElement | null;

    if (modalTitleInput)
      modalTitleInput.addEventListener('input', updatePreview);

    if (modalColorSelect) {
      modalColorSelect.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLSelectElement;
        const colorPickerEl = modal.querySelector(
          '#modal-color-picker'
        ) as HTMLInputElement | null;
        if (target.value === 'custom' && colorPickerEl) {
          colorPickerEl.classList.remove('hidden');
          setTimeout(() => colorPickerEl.click(), 100);
        } else if (colorPickerEl) {
          colorPickerEl.classList.add('hidden');
        }
        updatePreview();
      });
    }

    const modalColorPicker = modal.querySelector(
      '#modal-color-picker'
    ) as HTMLInputElement | null;
    if (modalColorPicker) {
      modalColorPicker.addEventListener('input', updatePreview);
    }

    if (modalStyleSelect)
      modalStyleSelect.addEventListener('change', updatePreview);

    // Destination toggle handler
    const useDestCheckbox = modal.querySelector('#modal-use-destination');
    const destControls = modal.querySelector('#destination-controls');
    const pickDestBtn = modal.querySelector(
      '#modal-pick-destination'
    ) as HTMLButtonElement | null;

    if (useDestCheckbox && destControls) {
      useDestCheckbox.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        destControls.classList.toggle('hidden', !target.checked);
      });

      if (defaultValues.destX !== null && defaultValues.destX !== undefined) {
        const destPageInputEl = modal.querySelector(
          '#modal-dest-page'
        ) as HTMLInputElement | null;
        const destXInputEl = modal.querySelector(
          '#modal-dest-x'
        ) as HTMLInputElement | null;
        const destYInputEl = modal.querySelector(
          '#modal-dest-y'
        ) as HTMLInputElement | null;
        const destZoomSelectEl = modal.querySelector(
          '#modal-dest-zoom'
        ) as HTMLSelectElement | null;

        if (destPageInputEl && defaultValues.destPage !== undefined) {
          destPageInputEl.value = String(defaultValues.destPage);
        }
        if (destXInputEl && defaultValues.destX !== null) {
          destXInputEl.value = String(Math.round(defaultValues.destX));
        }
        if (destYInputEl && defaultValues.destY !== null) {
          destYInputEl.value = String(Math.round(defaultValues.destY));
        }
        if (destZoomSelectEl && defaultValues.zoom !== null) {
          destZoomSelectEl.value = defaultValues.zoom || '';
        }
      }
    }

    if (pickDestBtn) {
      pickDestBtn.addEventListener('click', () => {
        savedModalOverlay = overlay;
        savedModal = modal;
        overlay.style.display = 'none';

        startDestinationPicking((page: number, pdfX: number, pdfY: number) => {
          const destPageInputEl = modal.querySelector(
            '#modal-dest-page'
          ) as HTMLInputElement | null;
          const destXInputEl = modal.querySelector(
            '#modal-dest-x'
          ) as HTMLInputElement | null;
          const destYInputEl = modal.querySelector(
            '#modal-dest-y'
          ) as HTMLInputElement | null;

          if (destPageInputEl) destPageInputEl.value = String(page);
          if (destXInputEl) destXInputEl.value = String(Math.round(pdfX));
          if (destYInputEl) destYInputEl.value = String(Math.round(pdfY));

          overlay.style.display = '';

          setTimeout(() => {
            updateDestinationPreview();
          }, 100);
        });
      });
    }

    const destPageInputEl = modal.querySelector(
      '#modal-dest-page'
    ) as HTMLInputElement | null;
    if (destPageInputEl) {
      destPageInputEl.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        const maxPages = parseInt(target.max) || 1;
        if (isNaN(value) || value < 1) {
          target.value = '1';
        } else if (value > maxPages) {
          target.value = String(maxPages);
        } else {
          target.value = String(Math.floor(value));
        }
        updateDestinationPreview();
      });

      destPageInputEl.addEventListener('blur', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        const maxPages = parseInt(target.max) || 1;
        if (isNaN(value) || value < 1) {
          target.value = '1';
        } else if (value > maxPages) {
          target.value = String(maxPages);
        } else {
          target.value = String(Math.floor(value));
        }
        updateDestinationPreview();
      });
    }

    function updateDestinationPreview(): void {
      if (!pdfJsDoc) return;

      const destPageEl = modal.querySelector(
        '#modal-dest-page'
      ) as HTMLInputElement | null;
      const destXEl = modal.querySelector(
        '#modal-dest-x'
      ) as HTMLInputElement | null;
      const destYEl = modal.querySelector(
        '#modal-dest-y'
      ) as HTMLInputElement | null;
      const destZoomEl = modal.querySelector(
        '#modal-dest-zoom'
      ) as HTMLSelectElement | null;

      const pageNum = destPageEl ? parseInt(destPageEl.value) : currentPage;
      const x = destXEl ? parseFloat(destXEl.value) : null;
      const y = destYEl ? parseFloat(destYEl.value) : null;
      const zoom = destZoomEl ? destZoomEl.value : null;

      if (pageNum >= 1 && pageNum <= pdfJsDoc.numPages) {
        // Render the page with zoom if specified
        renderPageWithDestination(pageNum, x, y, zoom);
      }
    }

    const destXInputListener = modal.querySelector(
      '#modal-dest-x'
    ) as HTMLInputElement | null;
    const destYInputListener = modal.querySelector(
      '#modal-dest-y'
    ) as HTMLInputElement | null;
    const destZoomSelectListener = modal.querySelector(
      '#modal-dest-zoom'
    ) as HTMLSelectElement | null;

    if (destXInputListener) {
      destXInputListener.addEventListener('input', updateDestinationPreview);
    }
    if (destYInputListener) {
      destYInputListener.addEventListener('input', updateDestinationPreview);
    }
    if (destZoomSelectListener) {
      destZoomSelectListener.addEventListener(
        'change',
        updateDestinationPreview
      );
    }

    updatePreview();

    modal.querySelector('#modal-cancel')?.addEventListener('click', () => {
      cancelDestinationPicking();
      modalContainer?.removeChild(overlay);
      resolve(null);
    });

    modal.querySelector('#modal-confirm')?.addEventListener('click', () => {
      const result: ModalResult = {};
      fields.forEach((field) => {
        if (field.type !== 'preview' && field.type !== 'destination') {
          const input = modal.querySelector(`#modal-${field.name}`) as
            | HTMLInputElement
            | HTMLSelectElement
            | null;
          if (input) {
            result[field.name] = input.value;
          }
        }
      });

      const colorSelectEl = modal.querySelector(
        '#modal-color'
      ) as HTMLSelectElement | null;
      const colorPickerEl = modal.querySelector(
        '#modal-color-picker'
      ) as HTMLInputElement | null;
      if (colorSelectEl && colorSelectEl.value === 'custom' && colorPickerEl) {
        result.color = colorPickerEl.value;
      }

      const useDestCheckboxEl = modal.querySelector(
        '#modal-use-destination'
      ) as HTMLInputElement | null;
      if (useDestCheckboxEl && useDestCheckboxEl.checked) {
        const destPageEl = modal.querySelector(
          '#modal-dest-page'
        ) as HTMLInputElement | null;
        const destXEl = modal.querySelector(
          '#modal-dest-x'
        ) as HTMLInputElement | null;
        const destYEl = modal.querySelector(
          '#modal-dest-y'
        ) as HTMLInputElement | null;
        const destZoomEl = modal.querySelector(
          '#modal-dest-zoom'
        ) as HTMLSelectElement | null;

        result.destPage = destPageEl ? parseInt(destPageEl.value) : null;
        result.destX = destXEl ? parseFloat(destXEl.value) : null;
        result.destY = destYEl ? parseFloat(destYEl.value) : null;
        result.zoom = destZoomEl && destZoomEl.value ? destZoomEl.value : null;
      } else {
        result.destPage = null;
        result.destX = null;
        result.destY = null;
        result.zoom = null;
      }

      cancelDestinationPicking();
      modalContainer?.removeChild(overlay);
      resolve(result);
    });

    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) {
        cancelDestinationPicking();
        modalContainer?.removeChild(overlay);
        resolve(null);
      }
    });

    setTimeout(() => {
      const firstInput = modal.querySelector(
        'input, select'
      ) as HTMLElement | null;
      if (firstInput) firstInput.focus();
    }, 0);

    createIcons({ icons });
  });
}

function startDestinationPicking(callback: DestinationCallback): void {
  isPickingDestination = true;
  currentPickingCallback = callback;

  const canvasWrapper = document.getElementById('pdf-canvas-wrapper');
  const pickingBanner = document.getElementById('picking-mode-banner');

  canvasWrapper?.classList.add('picking-mode');
  pickingBanner?.classList.remove('hidden');

  if (window.innerWidth < 1024) {
    (
      document.getElementById('show-viewer-btn') as HTMLButtonElement | null
    )?.click();
  }

  createIcons({ icons });
}

function cancelDestinationPicking(): void {
  isPickingDestination = false;
  currentPickingCallback = null;

  const canvasWrapper = document.getElementById('pdf-canvas-wrapper');
  const pickingBanner = document.getElementById('picking-mode-banner');

  canvasWrapper?.classList.remove('picking-mode');
  pickingBanner?.classList.add('hidden');

  if (destinationMarker) {
    destinationMarker.remove();
    destinationMarker = null;
  }

  const coordDisplay = document.getElementById('destination-coord-display');
  if (coordDisplay) {
    coordDisplay.remove();
  }

  if (savedModalOverlay) {
    savedModalOverlay.style.display = '';
    savedModalOverlay = null;
    savedModal = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeGlobalShortcuts();

  const canvasEl = document.getElementById(
    'pdf-canvas'
  ) as HTMLCanvasElement | null;
  const canvasWrapperEl = document.getElementById(
    'pdf-canvas-wrapper'
  ) as HTMLElement | null;
  const cancelPickingBtn = document.getElementById(
    'cancel-picking-btn'
  ) as HTMLButtonElement | null;

  let coordTooltip: HTMLDivElement | null = null;

  canvasWrapperEl?.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isPickingDestination || !canvasEl) return;

    const rect = canvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!coordTooltip) {
      coordTooltip = document.createElement('div');
      coordTooltip.className = 'coordinate-tooltip';
      canvasWrapperEl.appendChild(coordTooltip);
    }

    coordTooltip.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)} `;
    coordTooltip.style.left = e.clientX - rect.left + 15 + 'px';
    coordTooltip.style.top = e.clientY - rect.top + 15 + 'px';
  });

  canvasWrapperEl?.addEventListener('mouseleave', () => {
    if (coordTooltip) {
      coordTooltip.remove();
      coordTooltip = null;
    }
  });

  canvasEl?.addEventListener('click', async (e: MouseEvent) => {
    if (
      !isPickingDestination ||
      !currentPickingCallback ||
      !pdfJsDoc ||
      !canvasEl ||
      !canvasWrapperEl
    )
      return;

    const rect = canvasEl.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    let viewport = currentViewport;
    if (!viewport) {
      const page = await pdfJsDoc.getPage(currentPage);
      viewport = page.getViewport({ scale: currentZoom });
    }

    // Convert canvas pixel coordinates to PDF coordinates (PDF uses bottom-left origin)
    const scaleX = viewport.width / rect.width;
    const scaleY = viewport.height / rect.height;
    const pdfX = canvasX * scaleX;
    const pdfY = viewport.height - canvasY * scaleY;

    if (destinationMarker) {
      destinationMarker.remove();
    }
    const oldCoordDisplay = document.getElementById(
      'destination-coord-display'
    );
    if (oldCoordDisplay) {
      oldCoordDisplay.remove();
    }

    destinationMarker = document.createElement('div');
    destinationMarker.className = 'destination-marker';
    destinationMarker.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
    <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.2" />
      <path d="M12 2 L12 22 M2 12 L22 12" />
        <circle cx="12" cy="12" r="2" fill="#3b82f6" />
          </svg>
            `;
    const canvasRect = canvasEl.getBoundingClientRect();
    const wrapperRect = canvasWrapperEl.getBoundingClientRect();
    destinationMarker.style.position = 'absolute';
    destinationMarker.style.left =
      canvasX + canvasRect.left - wrapperRect.left + 'px';
    destinationMarker.style.top =
      canvasY + canvasRect.top - wrapperRect.top + 'px';
    canvasWrapperEl.appendChild(destinationMarker);

    const coordDisplay = document.createElement('div');
    coordDisplay.id = 'destination-coord-display';
    coordDisplay.className =
      'absolute bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono z-50 pointer-events-none';
    coordDisplay.style.left =
      canvasX + canvasRect.left - wrapperRect.left + 20 + 'px';
    coordDisplay.style.top =
      canvasY + canvasRect.top - wrapperRect.top - 30 + 'px';
    coordDisplay.textContent = `X: ${Math.round(pdfX)}, Y: ${Math.round(pdfY)} `;
    canvasWrapperEl.appendChild(coordDisplay);

    currentPickingCallback(currentPage, pdfX, pdfY);

    setTimeout(() => {
      cancelDestinationPicking();
    }, 500);
  });

  if (cancelPickingBtn) {
    cancelPickingBtn.addEventListener('click', () => {
      cancelDestinationPicking();
    });
  }
});

function showConfirmModal(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-content';

    modal.innerHTML = `
  <div class="p-6">
    <h3 class="text-xl font-bold text-gray-800 mb-4">Confirm Action</h3>
      <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex gap-2 justify-end">
          <button id="modal-cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700">Cancel</button>
            <button id="modal-confirm" class="px-4 py-2 rounded btn-gradient text-white">Confirm</button>
              </div>
              </div>
                `;

    overlay.appendChild(modal);
    modalContainer?.appendChild(overlay);

    modal.querySelector('#modal-cancel')?.addEventListener('click', () => {
      modalContainer?.removeChild(overlay);
      resolve(false);
    });

    modal.querySelector('#modal-confirm')?.addEventListener('click', () => {
      modalContainer?.removeChild(overlay);
      resolve(true);
    });

    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) {
        modalContainer?.removeChild(overlay);
        resolve(false);
      }
    });
  });
}

function showAlertModal(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal-content';

    modal.innerHTML = `
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">${title}</h3>
                  <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex justify-end">
                      <button id="modal-ok" class="px-4 py-2 rounded btn-gradient text-white">OK</button>
                        </div>
                        </div>
                          `;

    overlay.appendChild(modal);
    modalContainer?.appendChild(overlay);

    modal.querySelector('#modal-ok')?.addEventListener('click', () => {
      modalContainer?.removeChild(overlay);
      resolve(true);
    });

    overlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === overlay) {
        modalContainer?.removeChild(overlay);
        resolve(true);
      }
    });
  });
}

function handleResize(): void {
  if (window.innerWidth >= 1024) {
    viewerSection?.classList.remove('hidden');
    bookmarksSection?.classList.remove('hidden');
    showViewerBtn?.classList.remove('bg-indigo-600', 'text-white');
    showViewerBtn?.classList.add('text-gray-300');
    showBookmarksBtn?.classList.remove('bg-indigo-600', 'text-white');
    showBookmarksBtn?.classList.add('text-gray-300');
  }
}

window.addEventListener('resize', handleResize);

showViewerBtn?.addEventListener('click', () => {
  viewerSection?.classList.remove('hidden');
  bookmarksSection?.classList.add('hidden');
  showViewerBtn?.classList.add('bg-indigo-600', 'text-white');
  showViewerBtn?.classList.remove('text-gray-300');
  showBookmarksBtn?.classList.remove('bg-indigo-600', 'text-white');
  showBookmarksBtn?.classList.add('text-gray-300');
});

showBookmarksBtn?.addEventListener('click', () => {
  viewerSection?.classList.add('hidden');
  bookmarksSection?.classList.remove('hidden');
  showBookmarksBtn?.classList.add('bg-indigo-600', 'text-white');
  showBookmarksBtn?.classList.remove('text-gray-300');
  showViewerBtn?.classList.remove('bg-indigo-600', 'text-white');
  showViewerBtn?.classList.add('text-gray-300');
});

importDropdownBtn?.addEventListener('click', (e: MouseEvent) => {
  e.stopPropagation();
  importDropdown?.classList.toggle('hidden');
  exportDropdown?.classList.add('hidden');
});

exportDropdownBtn?.addEventListener('click', (e: MouseEvent) => {
  e.stopPropagation();
  exportDropdown?.classList.toggle('hidden');
  importDropdown?.classList.add('hidden');
});

document.addEventListener('click', () => {
  importDropdown?.classList.add('hidden');
  exportDropdown?.classList.add('hidden');
});

let pdfLibDoc: PDFDocument | null = null;
let pdfJsDoc: PDFDocumentProxy | null = null;
let currentPage = 1;
let originalFileName = '';
let bookmarkTree: BookmarkTree = [];
let history: BookmarkTree[] = [];
let historyIndex = -1;
let searchQuery = '';
let csvBookmarks: BookmarkTree | null = null;
let jsonBookmarks: BookmarkTree | null = null;
let batchMode = false;
const selectedBookmarks = new Set<number>();
const collapsedNodes = new Set<number>();

function saveState(): void {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.parse(JSON.stringify(bookmarkTree)));
  historyIndex++;
  updateUndoRedoButtons();
}

function undo(): void {
  if (historyIndex > 0) {
    historyIndex--;
    bookmarkTree = JSON.parse(JSON.stringify(history[historyIndex]));
    renderBookmarkTree();
    updateUndoRedoButtons();
  }
}

function redo(): void {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    bookmarkTree = JSON.parse(JSON.stringify(history[historyIndex]));
    renderBookmarkTree();
    updateUndoRedoButtons();
  }
}

function updateUndoRedoButtons(): void {
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}

undoBtn?.addEventListener('click', undo);
redoBtn?.addEventListener('click', redo);

resetBtn?.addEventListener('click', async () => {
  const confirmed = await showConfirmModal(
    'Reset and go back to file uploader? All unsaved changes will be lost.'
  );
  if (confirmed) {
    resetToUploader();
  }
});

deleteAllBtn?.addEventListener('click', async () => {
  if (bookmarkTree.length === 0) {
    await showAlertModal('Info', 'No bookmarks to delete.');
    return;
  }

  const confirmed = await showConfirmModal(
    `Delete all ${bookmarkTree.length} bookmark(s) ? `
  );
  if (confirmed) {
    bookmarkTree = [];
    selectedBookmarks.clear();
    updateSelectedCount();
    saveState();
    renderBookmarkTree();
  }
});

function resetToUploader(): void {
  pdfLibDoc = null;
  pdfJsDoc = null;
  currentPage = 1;
  originalFileName = '';
  bookmarkTree = [];
  history = [];
  historyIndex = -1;
  searchQuery = '';
  csvBookmarks = null;
  jsonBookmarks = null;
  batchMode = false;
  selectedBookmarks.clear();
  collapsedNodes.clear();

  if (fileInput) fileInput.value = '';
  if (csvInput) csvInput.value = '';
  if (jsonInput) jsonInput.value = '';

  appEl?.classList.add('hidden');
  uploaderEl?.classList.remove('hidden');

  viewerSection?.classList.remove('hidden');
  bookmarksSection?.classList.add('hidden');
  showViewerBtn?.classList.add('bg-indigo-600', 'text-white');
  showViewerBtn?.classList.remove('text-gray-300');
  showBookmarksBtn?.classList.remove('bg-indigo-600', 'text-white');
  showBookmarksBtn?.classList.add('text-gray-300');
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault();
      redo();
    }
  }
});

batchModeCheckbox?.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLInputElement;
  batchMode = target.checked;
  if (!batchMode) {
    selectedBookmarks.clear();
    updateSelectedCount();
  }
  batchOperations?.classList.toggle(
    'hidden',
    !batchMode || selectedBookmarks.size === 0
  );
  renderBookmarkTree();
});

function updateSelectedCount(): void {
  if (selectedCountDisplay)
    selectedCountDisplay.textContent = String(selectedBookmarks.size);
  if (batchMode) {
    batchOperations?.classList.toggle('hidden', selectedBookmarks.size === 0);
  }
}

selectAllBtn?.addEventListener('click', () => {
  const getAllIds = (nodes: BookmarkNode[]): number[] => {
    let ids: number[] = [];
    nodes.forEach((node) => {
      ids.push(node.id);
      if (node.children.length > 0) {
        ids = ids.concat(getAllIds(node.children));
      }
    });
    return ids;
  };

  getAllIds(bookmarkTree).forEach((id) => selectedBookmarks.add(id));
  updateSelectedCount();
  renderBookmarkTree();
});

deselectAllBtn?.addEventListener('click', () => {
  selectedBookmarks.clear();
  updateSelectedCount();
  renderBookmarkTree();
});

batchColorSelect?.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (target.value && selectedBookmarks.size > 0) {
    const color = target.value === 'null' ? null : target.value;
    applyToSelected((node) => (node.color = color));
    target.value = '';
  }
});

batchStyleSelect?.addEventListener('change', (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (target.value && selectedBookmarks.size > 0) {
    const style =
      target.value === 'null' ? null : (target.value as BookmarkStyle);
    applyToSelected((node) => (node.style = style));
    target.value = '';
  }
});

batchDeleteBtn?.addEventListener('click', async () => {
  if (selectedBookmarks.size === 0) return;

  const confirmed = await showConfirmModal(
    `Delete ${selectedBookmarks.size} bookmark(s) ? `
  );
  if (!confirmed) return;

  const remove = (nodes: BookmarkNode[]): BookmarkNode[] => {
    return nodes.filter((node) => {
      if (selectedBookmarks.has(node.id)) return false;
      node.children = remove(node.children);
      return true;
    });
  };

  bookmarkTree = remove(bookmarkTree);
  selectedBookmarks.clear();
  updateSelectedCount();
  saveState();
  renderBookmarkTree();
});

function applyToSelected(fn: (node: BookmarkNode) => void): void {
  const update = (nodes: BookmarkNode[]): BookmarkNode[] => {
    return nodes.map((node) => {
      if (selectedBookmarks.has(node.id)) {
        fn(node);
      }
      node.children = update(node.children);
      return node;
    });
  };

  bookmarkTree = update(bookmarkTree);
  saveState();
  renderBookmarkTree();
}

expandAllBtn?.addEventListener('click', () => {
  collapsedNodes.clear();
  renderBookmarkTree();
});

collapseAllBtn?.addEventListener('click', () => {
  const collapseAll = (nodes: BookmarkNode[]): void => {
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        collapsedNodes.add(node.id);
        collapseAll(node.children);
      }
    });
  };
  collapseAll(bookmarkTree);
  renderBookmarkTree();
});

function renderFileDisplay(file: File): void {
  if (!fileDisplayArea) return;
  fileDisplayArea.innerHTML = '';
  fileDisplayArea.classList.remove('hidden');

  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'truncate font-medium text-gray-200';
  nameSpan.textContent = file.name;

  const sizeSpan = document.createElement('span');
  sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400';
  sizeSpan.textContent = formatBytes(file.size);

  fileDiv.append(nameSpan, sizeSpan);
  fileDisplayArea.appendChild(fileDiv);
}

fileInput?.addEventListener('change', loadPDF);

async function loadPDF(e?: Event): Promise<void> {
  const file = e
    ? (e.target as HTMLInputElement).files?.[0]
    : fileInput?.files?.[0];
  if (!file) return;

  // Show loader
  loaderModal?.classList.remove('hidden');

  originalFileName = file.name.replace('.pdf', '');
  if (filenameDisplay)
    filenameDisplay.textContent = truncateFilename(file.name);
  renderFileDisplay(file);
  const arrayBuffer = await file.arrayBuffer();

  currentPage = 1;
  bookmarkTree = [];
  history = [];
  historyIndex = -1;
  selectedBookmarks.clear();
  collapsedNodes.clear();

  pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const loadingTask = getPDFDocument({
    data: new Uint8Array(arrayBuffer),
  });
  pdfJsDoc = await loadingTask.promise;

  if (gotoPageInput) gotoPageInput.max = String(pdfJsDoc.numPages);

  appEl?.classList.remove('hidden');
  uploaderEl?.classList.add('hidden');

  if (autoExtractCheckbox?.checked) {
    const extracted = await extractExistingBookmarks();
    if (extracted.length > 0) {
      bookmarkTree = extracted;
    }
  }

  if (csvBookmarks) {
    bookmarkTree = csvBookmarks;
    csvBookmarks = null;
  } else if (jsonBookmarks) {
    bookmarkTree = jsonBookmarks;
    jsonBookmarks = null;
  }

  saveState();
  renderBookmarkTree();
  renderPage(currentPage);
  createIcons({ icons });

  // Hide loader
  loaderModal?.classList.add('hidden');
}

csvInput?.addEventListener('change', async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const text = await file.text();
  csvBookmarks = parseCSV(text);

  await showAlertModal(
    'CSV Loaded',
    `Loaded ${csvBookmarks.length} bookmarks from CSV. Now upload your PDF.`
  );
});

jsonInput?.addEventListener('change', async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const text = await file.text();
  try {
    jsonBookmarks = JSON.parse(text);
    await showAlertModal(
      'JSON Loaded',
      'Loaded bookmarks from JSON. Now upload your PDF.'
    );
  } catch (err) {
    await showAlertModal('Error', 'Invalid JSON format');
  }
});

async function renderPage(
  num: number,
  zoom: string | null = null,
  destX: number | null = null,
  destY: number | null = null
): Promise<void> {
  if (!pdfJsDoc || !canvas || !ctx) return;

  const page = await pdfJsDoc.getPage(num);

  let zoomScale = currentZoom;
  if (zoom !== null && zoom !== '' && zoom !== '0') {
    zoomScale = parseFloat(zoom) / 100;
  }

  const dpr = window.devicePixelRatio || 1;

  const viewport = page.getViewport({ scale: zoomScale });
  currentViewport = viewport;

  canvas.height = viewport.height * dpr;
  canvas.width = viewport.width * dpr;

  canvas.style.width = viewport.width + 'px';
  canvas.style.height = viewport.height + 'px';

  ctx.scale(dpr, dpr);

  await page.render({ canvasContext: ctx, viewport: viewport, canvas: canvas })
    .promise;

  if (destX !== null && destY !== null) {
    const canvasX = destX;
    const canvasY = viewport.height - destY;

    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#3b82f6';
    ctx.lineWidth = 3;

    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(canvasX - 15, canvasY);
    ctx.lineTo(canvasX + 15, canvasY);
    ctx.moveTo(canvasX, canvasY - 15);
    ctx.lineTo(canvasX, canvasY + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    const text = `X: ${Math.round(destX)}, Y: ${Math.round(destY)} `;
    ctx.font = 'bold 12px monospace';
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 18;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.95)';
    ctx.fillRect(canvasX + 18, canvasY - 25, textWidth + 10, textHeight);

    ctx.fillStyle = 'white';
    ctx.fillText(text, canvasX + 23, canvasY - 10);

    ctx.restore();
  }

  pageIndicator!.textContent = `Page ${num} / ${pdfJsDoc.numPages}`;
  if (gotoPageInput) gotoPageInput.value = String(num);
  currentPage = num;
  if (currentPageDisplay) currentPageDisplay.textContent = String(num);
}

async function renderPageWithDestination(
  pageNum: number,
  x: number | null,
  y: number | null,
  zoom: string | null
): Promise<void> {
  await renderPage(pageNum, zoom, x, y);
}

prevPageBtn?.addEventListener('click', () => {
  if (currentPage > 1) renderPage(currentPage - 1);
});

nextPageBtn?.addEventListener('click', () => {
  if (pdfJsDoc && currentPage < pdfJsDoc.numPages) renderPage(currentPage + 1);
});

gotoBtn?.addEventListener('click', () => {
  if (!pdfJsDoc || !gotoPageInput) return;
  const page = parseInt(gotoPageInput.value);
  if (page >= 1 && page <= pdfJsDoc.numPages) {
    renderPage(page);
  }
});

gotoPageInput?.addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.key === 'Enter') gotoBtn?.click();
});

function updateZoomIndicator(): void {
  if (zoomIndicator) {
    zoomIndicator.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

zoomInBtn?.addEventListener('click', () => {
  currentZoom = Math.min(currentZoom + 0.05, 2.0);
  updateZoomIndicator();
  renderPage(currentPage);
});

zoomOutBtn?.addEventListener('click', () => {
  currentZoom = Math.max(currentZoom - 0.05, 0.25);
  updateZoomIndicator();
  renderPage(currentPage);
});

zoomFitBtn?.addEventListener('click', async () => {
  if (!pdfJsDoc) return;
  currentZoom = 1.0;
  updateZoomIndicator();
  renderPage(currentPage);
});

updateZoomIndicator();

searchInput?.addEventListener('input', (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchQuery = target.value.toLowerCase();
  renderBookmarkTree();
});

function removeNodeById(nodes: BookmarkNode[], id: number): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (removeNodeById(nodes[i].children, id)) return true;
  }
  return false;
}

function flattenBookmarks(
  nodes: BookmarkNode[],
  level = 0
): FlattenedBookmark[] {
  let result: FlattenedBookmark[] = [];
  for (const node of nodes) {
    result.push({ ...node, level });
    if (node.children.length > 0) {
      result = result.concat(flattenBookmarks(node.children, level + 1));
    }
  }
  return result;
}

function matchesSearch(node: BookmarkNode, query: string): boolean {
  if (!query) return true;
  if (node.title.toLowerCase().includes(query)) return true;
  return node.children.some((child) => matchesSearch(child, query));
}

function makeSortable(
  element: HTMLElement,
  parentNode: BookmarkNode | null = null,
  isTopLevel = false
): void {
  new Sortable(element, {
    group: isTopLevel
      ? 'top-level-only'
      : 'nested-level-' + (parentNode ? parentNode.id : 'none'),
    animation: 150,
    handle: '[data-drag-handle]',
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    forceFallback: true,
    fallbackTolerance: 3,
    onEnd: function (evt) {
      try {
        if (evt.oldIndex === evt.newIndex) {
          renderBookmarkTree();
          return;
        }

        const treeCopy: BookmarkTree = JSON.parse(JSON.stringify(bookmarkTree));

        if (
          isTopLevel &&
          evt.oldIndex !== undefined &&
          evt.newIndex !== undefined
        ) {
          const movedItem = treeCopy.splice(evt.oldIndex, 1)[0];
          treeCopy.splice(evt.newIndex, 0, movedItem);
          bookmarkTree = treeCopy;
        } else if (
          parentNode &&
          evt.oldIndex !== undefined &&
          evt.newIndex !== undefined
        ) {
          const parent = findNodeInTree(treeCopy, parentNode.id);
          if (parent && parent.children) {
            const movedChild = parent.children.splice(evt.oldIndex, 1)[0];
            parent.children.splice(evt.newIndex, 0, movedChild);
            bookmarkTree = treeCopy;
          } else {
            renderBookmarkTree();
            return;
          }
        }

        saveState();
        renderBookmarkTree();
      } catch (err) {
        console.error('Error in drag and drop:', err);
        if (historyIndex > 0) {
          bookmarkTree = JSON.parse(JSON.stringify(history[historyIndex]));
        }
        renderBookmarkTree();
      }
    },
  });
}

function findNodeInTree(
  nodes: BookmarkNode[],
  id: number
): BookmarkNode | null {
  if (!nodes || !Array.isArray(nodes)) return null;

  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getStyleClasses(style: BookmarkStyle): string {
  if (style === 'bold') return 'font-bold';
  if (style === 'italic') return 'italic';
  if (style === 'bold-italic') return 'font-bold italic';
  return '';
}

function getTextColor(color: BookmarkColor | string): string {
  if (!color) return 'text-gray-700';

  if (typeof color === 'string' && color.startsWith('#')) {
    return '';
  }

  return TEXT_COLOR_CLASSES[color] || 'text-gray-700';
}

function renderBookmarkTree(): void {
  if (!treeList) return;
  treeList.innerHTML = '';
  const filtered = searchQuery
    ? bookmarkTree.filter((n) => matchesSearch(n, searchQuery))
    : bookmarkTree;

  if (filtered.length === 0) {
    noBookmarksEl?.classList.remove('hidden');
  } else {
    noBookmarksEl?.classList.add('hidden');
    for (const node of filtered) {
      treeList.appendChild(createNodeElement(node));
    }
    makeSortable(treeList, null, true);
  }

  createIcons({ icons });
  updateSelectedCount();
}

function createNodeElement(node: BookmarkNode, level = 0): HTMLLIElement {
  if (!node || !node.id) {
    console.error('Invalid node:', node);
    return document.createElement('li');
  }

  const li = document.createElement('li');
  li.dataset.bookmarkId = String(node.id);
  li.className = 'group';

  const hasChildren =
    node.children && Array.isArray(node.children) && node.children.length > 0;
  const isCollapsed = collapsedNodes.has(node.id);
  const isSelected = selectedBookmarks.has(node.id);
  const isMatch =
    !searchQuery || node.title.toLowerCase().includes(searchQuery);
  const highlight = isMatch && searchQuery ? 'bg-yellow-100' : '';
  const colorClass =
    node.color && typeof node.color === 'string'
      ? COLOR_CLASSES[node.color] || ''
      : '';
  const styleClass = getStyleClasses(node.style);
  const textColorClass = getTextColor(node.color);

  const div = document.createElement('div');
  div.className = `flex items-center gap-2 p-2 rounded border border-gray-200 ${colorClass} ${highlight} ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`;

  if (batchMode) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSelected;
    checkbox.className = 'w-4 h-4 flex-shrink-0';
    checkbox.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      if (selectedBookmarks.has(node.id)) {
        selectedBookmarks.delete(node.id);
      } else {
        selectedBookmarks.add(node.id);
      }
      updateSelectedCount();
      checkbox.checked = selectedBookmarks.has(node.id);
      batchOperations?.classList.toggle(
        'hidden',
        !batchMode || selectedBookmarks.size === 0
      );
    });
    div.appendChild(checkbox);
  }

  const dragHandle = document.createElement('div');
  dragHandle.dataset.dragHandle = 'true';
  dragHandle.className = 'cursor-move flex-shrink-0';
  dragHandle.innerHTML =
    '<i data-lucide="grip-vertical" class="w-4 h-4 text-gray-400"></i>';
  div.appendChild(dragHandle);

  if (hasChildren) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'p-0 flex-shrink-0';
    toggleBtn.innerHTML = isCollapsed
      ? '<i data-lucide="chevron-right" class="w-4 h-4"></i>'
      : '<i data-lucide="chevron-down" class="w-4 h-4"></i>';
    toggleBtn.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      if (collapsedNodes.has(node.id)) {
        collapsedNodes.delete(node.id);
      } else {
        collapsedNodes.add(node.id);
      }
      renderBookmarkTree();
    });
    div.appendChild(toggleBtn);
  } else {
    const spacer = document.createElement('div');
    spacer.className = 'w-4 flex-shrink-0';
    div.appendChild(spacer);
  }

  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex-1 min-w-0 cursor-pointer';
  const customColorStyle =
    node.color && typeof node.color === 'string' && node.color.startsWith('#')
      ? `style="color: ${node.color}"`
      : '';
  const hasDestination =
    node.destX !== null || node.destY !== null || node.zoom !== null;
  const destinationIcon = hasDestination
    ? '<i data-lucide="crosshair" class="w-3 h-3 inline-block ml-1 text-blue-500"></i>'
    : '';

  titleDiv.innerHTML = `
                <span class="text-sm block ${styleClass} ${textColorClass}" ${customColorStyle}>${escapeHTML(node.title)}${destinationIcon}</span>
                <span class="text-xs text-gray-500">Page ${node.page}</span>
            `;

  titleDiv.addEventListener('click', async () => {
    if (node.destX !== null || node.destY !== null || node.zoom !== null) {
      await renderPageWithDestination(
        node.page,
        node.destX,
        node.destY,
        node.zoom
      );

      setTimeout(() => {
        if (node.zoom !== null && node.zoom !== '' && node.zoom !== '0') {
          setTimeout(() => {
            renderPage(node.page);
          }, 1000);
        } else {
          renderPage(node.page);
        }
      }, 2000);
    } else {
      renderPage(node.page);
    }
    if (window.innerWidth < 1024) {
      showViewerBtn?.click();
    }
  });
  div.appendChild(titleDiv);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flex gap-1 flex-shrink-0';

  const addChildBtn = document.createElement('button');
  addChildBtn.className = 'p-1 hover:bg-gray-200 rounded text-gray-700';
  addChildBtn.title = 'Add child';
  addChildBtn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i>';
  addChildBtn.addEventListener('click', async (e: MouseEvent) => {
    e.stopPropagation();
    const result = await showInputModal('Add Child Bookmark', [
      {
        type: 'text',
        name: 'title',
        label: 'Title',
        placeholder: 'Enter bookmark title',
      },
    ]);
    if (result && result.title) {
      node.children.push({
        id: Date.now() + Math.random(),
        title: cleanTitle(String(result.title)),
        page: currentPage,
        children: [],
        color: null,
        style: null,
        destX: null,
        destY: null,
        zoom: null,
      });
      collapsedNodes.delete(node.id);
      saveState();
      renderBookmarkTree();
    }
  });
  actionsDiv.appendChild(addChildBtn);

  const editBtn = document.createElement('button');
  editBtn.className = 'p-1 hover:bg-gray-200 rounded text-gray-700';
  editBtn.title = 'Edit';
  editBtn.innerHTML = '<i data-lucide="edit-2" class="w-4 h-4"></i>';
  editBtn.addEventListener('click', async (e: MouseEvent) => {
    e.stopPropagation();
    const result = await showInputModal(
      'Edit Bookmark',
      [
        {
          type: 'text',
          name: 'title',
          label: 'Title',
          placeholder: 'Enter bookmark title',
        },
        {
          type: 'select',
          name: 'color',
          label: 'Color',
          options: [
            { value: '', label: 'None' },
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
            { value: 'yellow', label: 'Yellow' },
            { value: 'purple', label: 'Purple' },
            { value: 'custom', label: 'Custom...' },
          ],
        },
        {
          type: 'select',
          name: 'style',
          label: 'Style',
          options: [
            { value: '', label: 'Normal' },
            { value: 'bold', label: 'Bold' },
            { value: 'italic', label: 'Italic' },
            { value: 'bold-italic', label: 'Bold & Italic' },
          ],
        },
        {
          type: 'destination',
          name: 'destination',
          label: 'Destination',
          page: node.page,
          maxPages: pdfJsDoc ? pdfJsDoc.numPages : 1,
        },
        { type: 'preview', label: 'Preview' },
      ],
      {
        title: node.title,
        color: node.color || '',
        style: node.style || '',
        destPage: node.page,
        destX: node.destX,
        destY: node.destY,
        zoom: node.zoom,
      }
    );

    if (result) {
      node.title = cleanTitle(String(result.title || ''));
      node.color = result.color || null;
      node.style = (result.style as BookmarkStyle) || null;

      if (result.destPage !== null && result.destPage !== undefined) {
        node.page = result.destPage;
        node.destX = result.destX ?? null;
        node.destY = result.destY ?? null;
        node.zoom = result.zoom ?? null;
      }

      saveState();
      renderBookmarkTree();
    }
  });
  actionsDiv.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'p-1 hover:bg-gray-200 rounded text-red-600';
  deleteBtn.title = 'Delete';
  deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  deleteBtn.addEventListener('click', async (e: MouseEvent) => {
    e.stopPropagation();
    const confirmed = await showConfirmModal(`Delete "${node.title}"?`);
    if (confirmed) {
      removeNodeById(bookmarkTree, node.id);
      saveState();
      renderBookmarkTree();
    }
  });
  actionsDiv.appendChild(deleteBtn);

  div.appendChild(actionsDiv);
  li.appendChild(div);

  if (hasChildren && !isCollapsed) {
    const childContainer = document.createElement('ul');
    childContainer.className = 'child-container space-y-2';

    const nodeCopy: BookmarkNode = JSON.parse(JSON.stringify(node));

    for (const child of node.children) {
      if (child && child.id) {
        childContainer.appendChild(createNodeElement(child, level + 1));
      }
    }
    li.appendChild(childContainer);

    makeSortable(childContainer, nodeCopy, false);
  }

  return li;
}

addTopLevelBtn?.addEventListener('click', async () => {
  const title = titleInput?.value.trim();
  if (!title) {
    await showAlertModal('Error', 'Please enter a title.');
    return;
  }

  bookmarkTree.push({
    id: Date.now(),
    title: title,
    page: currentPage,
    children: [],
    color: null,
    style: null,
    destX: null,
    destY: null,
    zoom: null,
  });

  saveState();
  renderBookmarkTree();
  if (titleInput) titleInput.value = '';
});

titleInput?.addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.key === 'Enter') addTopLevelBtn?.click();
});

function escapeHTML(str: string): string {
  return escapeHtml(str);
}

importCsvBtn?.addEventListener('click', () => {
  csvImportHidden?.click();
  importDropdown?.classList.add('hidden');
});

csvImportHidden?.addEventListener('change', async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const text = await file.text();
  const imported = parseCSV(text);

  if (imported.length > 0) {
    bookmarkTree = imported;
    saveState();
    renderBookmarkTree();
    await showAlertModal('Success', `Imported ${imported.length} bookmarks!`);
  }

  if (csvImportHidden) csvImportHidden.value = '';
});

exportCsvBtn?.addEventListener('click', () => {
  exportDropdown?.classList.add('hidden');

  if (bookmarkTree.length === 0) {
    showAlertModal('Error', 'No bookmarks to export!');
    return;
  }

  const flat = flattenBookmarks(bookmarkTree);
  const csv =
    'title,page,level\n' +
    flat
      .map((b) => `"${b.title.replace(/"/g, '""')}",${b.page},${b.level}`)
      .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  downloadFile(blob, `${originalFileName}-bookmarks.csv`);
});

function parseCSV(text: string): BookmarkTree {
  const lines = text.trim().split('\n').slice(1);
  const bookmarks: BookmarkTree = [];
  const stack: Array<{ children: BookmarkNode[]; level: number }> = [
    { children: bookmarks, level: -1 },
  ];

  for (const line of lines) {
    const match =
      line.match(/^"(.+)",(\d+),(\d+)$/) || line.match(/^([^,]+),(\d+),(\d+)$/);
    if (!match) continue;

    const [, title, page, level] = match;
    const bookmark: BookmarkNode = {
      id: Date.now() + Math.random(),
      title: cleanTitle(title.replace(/""/g, '"')),
      page: parseInt(page),
      children: [],
      color: null,
      style: null,
      destX: null,
      destY: null,
      zoom: null,
    };

    const lvl = parseInt(level);
    while (stack[stack.length - 1].level >= lvl) stack.pop();
    stack[stack.length - 1].children.push(bookmark);
    stack.push({ children: bookmark.children, level: lvl });
  }

  return bookmarks;
}

importJsonBtn?.addEventListener('click', () => {
  jsonImportHidden?.click();
  importDropdown?.classList.add('hidden');
});

jsonImportHidden?.addEventListener('change', async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const text = await file.text();
  try {
    const imported = JSON.parse(text) as BookmarkTree;
    function cleanImportedTree(nodes: BookmarkNode[]): void {
      if (!nodes) return;
      for (const node of nodes) {
        if (node.title) node.title = cleanTitle(node.title);
        if (node.children) cleanImportedTree(node.children);
      }
    }
    cleanImportedTree(imported);
    bookmarkTree = imported;
    saveState();
    renderBookmarkTree();
    await showAlertModal('Success', 'Bookmarks imported from JSON!');
  } catch (err) {
    await showAlertModal('Error', 'Invalid JSON format');
  }

  if (jsonImportHidden) jsonImportHidden.value = '';
});

exportJsonBtn?.addEventListener('click', () => {
  exportDropdown?.classList.add('hidden');

  if (bookmarkTree.length === 0) {
    showAlertModal('Error', 'No bookmarks to export!');
    return;
  }

  const json = JSON.stringify(bookmarkTree, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadFile(blob, `${originalFileName}-bookmarks.json`);
});

extractExistingBtn?.addEventListener('click', async () => {
  if (!pdfLibDoc) return;

  const extracted = await extractExistingBookmarks();
  if (extracted.length > 0) {
    const confirmed = await showConfirmModal(
      `Found ${extracted.length} existing bookmarks. Replace current bookmarks?`
    );
    if (confirmed) {
      bookmarkTree = extracted;
      saveState();
      renderBookmarkTree();
    }
  } else {
    await showAlertModal('Info', 'No existing bookmarks found in this PDF.');
  }
});

// function cleanTitle(title) {
//   // @TODO@ALAM: visit this for encoding issues later
//   if (typeof title === 'string') {
//     if (title.includes('€') && !title.includes(' ')) {
//       return title.replace(/€/g, ' ');
//     }
//     return title.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
//   }
//   return title;
// }

function cleanTitle(title: string): string {
  if (typeof title === 'string') {
    return title.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  }
  return title;
}

async function extractExistingBookmarks(): Promise<BookmarkTree> {
  try {
    if (!pdfJsDoc) return [];
    const outline = await pdfJsDoc.getOutline();
    if (!outline) return [];

    async function processOutlineItem(
      item: PDFOutlineItem
    ): Promise<BookmarkNode> {
      let pageIndex = 0;
      let destX: number | null = null;
      let destY: number | null = null;
      let zoom: string | null = null;

      try {
        let dest = item.dest;
        if (typeof dest === 'string' && pdfJsDoc) {
          dest = await pdfJsDoc.getDestination(dest);
        }

        if (Array.isArray(dest) && pdfJsDoc) {
          const destRef = dest[0] as { num: number; gen: number };
          pageIndex = await pdfJsDoc.getPageIndex(destRef);

          if (dest.length > 2) {
            const x = dest[2];
            const y = dest[3];
            const z = dest[4];

            if (typeof x === 'number') destX = x;
            if (typeof y === 'number') destY = y;
            if (typeof z === 'number') zoom = String(Math.round(z * 100));
          }
        }
      } catch (e) {
        console.warn('Error resolving destination:', e);
      }

      let color: BookmarkColor = null;
      if (item.color) {
        const [r, g, b] = item.color;
        const rN = r / 255;
        const gN = g / 255;
        const bN = b / 255;

        if (rN > 0.8 && gN < 0.3 && bN < 0.3) color = 'red';
        else if (rN < 0.3 && gN < 0.3 && bN > 0.8) color = 'blue';
        else if (rN < 0.3 && gN > 0.8 && bN < 0.3) color = 'green';
        else if (rN > 0.8 && gN > 0.8 && bN < 0.3) color = 'yellow';
        else if (rN > 0.5 && gN < 0.5 && bN > 0.5) color = 'purple';
      }

      let style: BookmarkStyle = null;
      if (item.bold && item.italic) style = 'bold-italic';
      else if (item.bold) style = 'bold';
      else if (item.italic) style = 'italic';

      const bookmark: BookmarkNode = {
        id: Date.now() + Math.random(),
        title: cleanTitle(item.title),
        page: pageIndex + 1,
        children: [],
        color,
        style,
        destX,
        destY,
        zoom,
      };

      if (item.items && item.items.length > 0) {
        for (const childItem of item.items) {
          const childBookmark = await processOutlineItem(childItem);
          bookmark.children.push(childBookmark);
        }
      }

      return bookmark;
    }

    const result: BookmarkTree = [];
    for (const item of outline) {
      const bookmark = await processOutlineItem(item as PDFOutlineItem);
      result.push(bookmark);
    }

    return result;
  } catch (err) {
    console.error('Error extracting bookmarks:', err);
    return [];
  }
}

if (backToToolsBtn) {
  backToToolsBtn.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

downloadBtn?.addEventListener('click', async () => {
  if (!pdfLibDoc) return;
  const pages = pdfLibDoc.getPages();
  const outlinesDict = pdfLibDoc.context.obj({});
  const outlinesRef = pdfLibDoc.context.register(outlinesDict);

  function createOutlineItems(
    nodes: BookmarkNode[],
    parentRef: PDFRef
  ): OutlineItem[] {
    const items: OutlineItem[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const itemDict = pdfLibDoc!.context.obj({}) as unknown as ReturnType<
        typeof pdfLibDoc.context.obj
      > & { set: (key: PDFName, value: unknown) => void };
      const itemRef = pdfLibDoc!.context.register(
        itemDict as unknown as Parameters<typeof pdfLibDoc.context.register>[0]
      );

      itemDict.set(PDFName.of('Title'), PDFHexString.fromText(node.title));
      itemDict.set(PDFName.of('Parent'), parentRef);

      const pageIndex = Math.max(0, Math.min(node.page - 1, pages.length - 1));
      const pageRef = pages[pageIndex].ref;

      let destArray: unknown;
      if (node.destX !== null || node.destY !== null || node.zoom !== null) {
        const x = node.destX !== null ? PDFNumber.of(node.destX) : null;
        const y = node.destY !== null ? PDFNumber.of(node.destY) : null;

        let zoom = null;
        if (node.zoom !== null && node.zoom !== '' && node.zoom !== '0') {
          zoom = PDFNumber.of(parseFloat(node.zoom) / 100);
        }

        destArray = pdfLibDoc!.context.obj([
          pageRef,
          PDFName.of('XYZ'),
          x,
          y,
          zoom,
        ] as (PDFRef | PDFName | PDFNumber | null)[]);
      } else {
        destArray = pdfLibDoc!.context.obj([
          pageRef,
          PDFName.of('XYZ'),
          null,
          null,
          null,
        ] as (PDFRef | PDFName | null)[]);
      }

      itemDict.set(PDFName.of('Dest'), destArray);

      if (node.color) {
        let rgb: number[] | undefined;
        const colorStr = node.color as string;

        if (colorStr.startsWith('#')) {
          const { r, g, b } = hexToRgb(colorStr);
          rgb = [r, g, b];
        } else if (PDF_COLOR_MAP[colorStr]) {
          rgb = PDF_COLOR_MAP[colorStr];
        }

        if (rgb) {
          const colorArray = pdfLibDoc!.context.obj(rgb);
          itemDict.set(PDFName.of('C'), colorArray);
        }
      }

      if (node.style) {
        let flags = 0;
        if (node.style === 'italic') flags = 1;
        else if (node.style === 'bold') flags = 2;
        else if (node.style === 'bold-italic') flags = 3;

        if (flags > 0) {
          itemDict.set(PDFName.of('F'), PDFNumber.of(flags));
        }
      }

      if (node.children.length > 0) {
        const childItems = createOutlineItems(node.children, itemRef);
        if (childItems.length > 0) {
          itemDict.set(PDFName.of('First'), childItems[0].ref);
          itemDict.set(
            PDFName.of('Last'),
            childItems[childItems.length - 1].ref
          );
          itemDict.set(
            PDFName.of('Count'),
            pdfLibDoc.context.obj(childItems.length)
          );
        }
      }

      if (i > 0) {
        itemDict.set(PDFName.of('Prev'), items[i - 1].ref);
        items[i - 1].dict.set(PDFName.of('Next'), itemRef);
      }

      items.push({ ref: itemRef, dict: itemDict });
    }

    return items;
  }

  try {
    const topLevelItems = createOutlineItems(bookmarkTree, outlinesRef);

    if (topLevelItems.length > 0) {
      outlinesDict.set(PDFName.of('Type'), PDFName.of('Outlines'));
      outlinesDict.set(PDFName.of('First'), topLevelItems[0].ref);
      outlinesDict.set(
        PDFName.of('Last'),
        topLevelItems[topLevelItems.length - 1].ref
      );
      outlinesDict.set(
        PDFName.of('Count'),
        pdfLibDoc.context.obj(topLevelItems.length)
      );
    }

    pdfLibDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);

    const pdfBytes = await pdfLibDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], {
      type: 'application/pdf',
    });
    downloadFile(blob, `${originalFileName}-bookmarked.pdf`);

    await showAlertModal('Success', 'PDF saved successfully!');

    setTimeout(() => {
      resetToUploader();
    }, 500);
  } catch (err) {
    console.error(err);
    await showAlertModal(
      'Error',
      'Error saving PDF. Check console for details.'
    );
  }
});
