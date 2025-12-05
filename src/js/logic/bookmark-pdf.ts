// @ts-nocheck
// TODO: @ALAM - remove ts-nocheck and fix types later, possibly convert this into an npm package

import { PDFDocument, PDFName, PDFString, PDFNumber, PDFArray, PDFHexString } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Sortable from 'sortablejs';
import { createIcons, icons } from 'lucide';
import '../../css/bookmark.css';
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js';
import { truncateFilename, getPDFDocument } from '../utils/helpers.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();


const modalContainer = document.getElementById('modal-container');

// Destination picking state
let isPickingDestination = false;
let currentPickingCallback = null;
let destinationMarker = null;
let savedModalOverlay = null;
let savedModal = null;
let currentViewport = null;
let currentZoom = 1.0;

function showInputModal(title, fields = [], defaultValues = {}) {
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
      <input type="text" id="modal-${field.name}" value="${escapeHTML(defaultValues[field.name] || '')}"
class="w-full px-3 py-2 border border-gray-300 rounded-lg"
placeholder="${field.placeholder || ''}" />
  </div>
    `;
        } else if (field.type === 'select') {
          return `
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
      <select id="modal-${field.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
        ${field.options
              .map(
                (opt) => `
                                        <option value="${opt.value}" ${defaultValues[field.name] === opt.value ? 'selected' : ''}>
                                            ${opt.label}
                                        </option>
                                    `
              )
              .join('')
            }
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
              <span>Set custom destination </span>
                </label>
                </div>
                <div id="destination-controls" class="${hasDestination ? '' : 'hidden'} space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                    <label class="text-xs text-gray-600">Page</label>
                      <input type="number" id="modal-dest-page" min="1" max="${field.maxPages || 1}" value="${defaultValues.destPage || field.page || 1}"
class="w-full px-2 py-1 border border-gray-300 rounded text-sm" step="1" />
  </div>
  <div>
  <label class="text-xs text-gray-600">Zoom(%)</label>
    <select id="modal-dest-zoom" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
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
class="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
  </div>
  <div>
  <label class="text-xs text-gray-600">Y Position</label>
    <input type="number" id="modal-dest-y" value="0" step="10"
class="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
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
    <button id="modal-cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
      <button id="modal-confirm" class="px-4 py-2 rounded btn-gradient text-white">Confirm</button>
        </div>
        </div>
          `;

    overlay.appendChild(modal);
    modalContainer.appendChild(overlay);

    function updatePreview() {
      const previewText = modal.querySelector('#preview-text');
      if (previewText) {
        const titleInput = modal.querySelector('#modal-title');
        const colorSelect = modal.querySelector('#modal-color');
        const styleSelect = modal.querySelector('#modal-style');
        const colorPicker = modal.querySelector('#modal-color-picker');

        const title = titleInput ? titleInput.value : 'Preview Text';
        const color = colorSelect ? colorSelect.value : '';
        const style = styleSelect ? styleSelect.value : '';

        previewText.textContent = title || 'Preview Text';

        const colorMap = {
          red: '#dc2626',
          blue: '#2563eb',
          green: '#16a34a',
          yellow: '#ca8a04',
          purple: '#9333ea',
        };

        // Handle custom color
        if (color === 'custom' && colorPicker) {
          previewText.style.color = colorPicker.value;
        } else {
          previewText.style.color = colorMap[color] || '#000';
        }

        previewText.style.fontWeight =
          style === 'bold' || style === 'bold-italic' ? 'bold' : 'normal';
        previewText.style.fontStyle =
          style === 'italic' || style === 'bold-italic' ? 'italic' : 'normal';
      }
    }

    const titleInput = modal.querySelector('#modal-title');
    const colorSelect = modal.querySelector('#modal-color');
    const styleSelect = modal.querySelector('#modal-style');

    if (titleInput) titleInput.addEventListener('input', updatePreview);

    if (colorSelect) {
      colorSelect.addEventListener('change', (e) => {
        const colorPicker = modal.querySelector('#modal-color-picker');
        if (e.target.value === 'custom' && colorPicker) {
          colorPicker.classList.remove('hidden');
          setTimeout(() => colorPicker.click(), 100);
        } else if (colorPicker) {
          colorPicker.classList.add('hidden');
        }
        updatePreview();
      });
    }

    const colorPicker = modal.querySelector('#modal-color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', updatePreview);
    }

    if (styleSelect) styleSelect.addEventListener('change', updatePreview);

    // Destination toggle handler
    const useDestCheckbox = modal.querySelector('#modal-use-destination');
    const destControls = modal.querySelector('#destination-controls');
    const pickDestBtn = modal.querySelector('#modal-pick-destination');

    if (useDestCheckbox && destControls) {
      useDestCheckbox.addEventListener('change', (e) => {
        destControls.classList.toggle('hidden', !e.target.checked);
      });

      // Populate existing destination values
      if (defaultValues.destX !== null && defaultValues.destX !== undefined) {
        const destPageInput = modal.querySelector('#modal-dest-page');
        const destXInput = modal.querySelector('#modal-dest-x');
        const destYInput = modal.querySelector('#modal-dest-y');
        const destZoomSelect = modal.querySelector('#modal-dest-zoom');

        if (destPageInput && defaultValues.destPage !== undefined) {
          destPageInput.value = defaultValues.destPage;
        }
        if (destXInput && defaultValues.destX !== null) {
          destXInput.value = Math.round(defaultValues.destX);
        }
        if (destYInput && defaultValues.destY !== null) {
          destYInput.value = Math.round(defaultValues.destY);
        }
        if (destZoomSelect && defaultValues.zoom !== null) {
          destZoomSelect.value = defaultValues.zoom || '';
        }
      }
    }

    // Visual destination picker
    if (pickDestBtn) {
      pickDestBtn.addEventListener('click', () => {
        // Store modal references
        savedModalOverlay = overlay;
        savedModal = modal;

        // Hide modal completely
        overlay.style.display = 'none';

        startDestinationPicking((page, pdfX, pdfY) => {
          const destPageInput = modal.querySelector('#modal-dest-page');
          const destXInput = modal.querySelector('#modal-dest-x');
          const destYInput = modal.querySelector('#modal-dest-y');

          if (destPageInput) destPageInput.value = page;
          if (destXInput) destXInput.value = Math.round(pdfX);
          if (destYInput) destYInput.value = Math.round(pdfY);

          // Restore modal
          overlay.style.display = '';

          // Update preview to show the destination after a short delay to ensure modal is visible
          setTimeout(() => {
            updateDestinationPreview();
          }, 100);
        });
      });
    }

    // Add validation for page input
    const destPageInput = modal.querySelector('#modal-dest-page');
    if (destPageInput) {
      destPageInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const maxPages = parseInt(e.target.max) || 1;
        if (isNaN(value) || value < 1) {
          e.target.value = 1;
        } else if (value > maxPages) {
          e.target.value = maxPages;
        } else {
          e.target.value = Math.floor(value);
        }
        updateDestinationPreview();
      });

      destPageInput.addEventListener('blur', (e) => {
        const value = parseInt(e.target.value);
        const maxPages = parseInt(e.target.max) || 1;
        if (isNaN(value) || value < 1) {
          e.target.value = 1;
        } else if (value > maxPages) {
          e.target.value = maxPages;
        } else {
          e.target.value = Math.floor(value);
        }
        updateDestinationPreview();
      });
    }

    // Function to update destination preview
    function updateDestinationPreview() {
      if (!pdfJsDoc) return;

      const destPageInput = modal.querySelector('#modal-dest-page');
      const destXInput = modal.querySelector('#modal-dest-x');
      const destYInput = modal.querySelector('#modal-dest-y');
      const destZoomSelect = modal.querySelector('#modal-dest-zoom');

      const pageNum = destPageInput
        ? parseInt(destPageInput.value)
        : currentPage;
      const x = destXInput ? parseFloat(destXInput.value) : null;
      const y = destYInput ? parseFloat(destYInput.value) : null;
      const zoom = destZoomSelect ? destZoomSelect.value : null;

      if (pageNum >= 1 && pageNum <= pdfJsDoc.numPages) {
        // Render the page with zoom if specified
        renderPageWithDestination(pageNum, x, y, zoom);
      }
    }

    // Add listeners for X, Y, and zoom changes
    const destXInput = modal.querySelector('#modal-dest-x');
    const destYInput = modal.querySelector('#modal-dest-y');
    const destZoomSelect = modal.querySelector('#modal-dest-zoom');

    if (destXInput) {
      destXInput.addEventListener('input', updateDestinationPreview);
    }
    if (destYInput) {
      destYInput.addEventListener('input', updateDestinationPreview);
    }
    if (destZoomSelect) {
      destZoomSelect.addEventListener('change', updateDestinationPreview);
    }

    updatePreview();

    modal.querySelector('#modal-cancel').addEventListener('click', () => {
      cancelDestinationPicking();
      modalContainer.removeChild(overlay);
      resolve(null);
    });

    modal.querySelector('#modal-confirm').addEventListener('click', () => {
      const result = {};
      fields.forEach((field) => {
        if (field.type !== 'preview' && field.type !== 'destination') {
          const input = modal.querySelector(`#modal-${field.name}`);
          result[field.name] = input.value;
        }
      });

      // Handle custom color
      const colorSelect = modal.querySelector('#modal-color');
      const colorPicker = modal.querySelector('#modal-color-picker');
      if (colorSelect && colorSelect.value === 'custom' && colorPicker) {
        result.color = colorPicker.value;
      }

      // Handle destination
      const useDestCheckbox = modal.querySelector('#modal-use-destination');
      if (useDestCheckbox && useDestCheckbox.checked) {
        const destPageInput = modal.querySelector('#modal-dest-page');
        const destXInput = modal.querySelector('#modal-dest-x');
        const destYInput = modal.querySelector('#modal-dest-y');
        const destZoomSelect = modal.querySelector('#modal-dest-zoom');

        result.destPage = destPageInput ? parseInt(destPageInput.value) : null;
        result.destX = destXInput ? parseFloat(destXInput.value) : null;
        result.destY = destYInput ? parseFloat(destYInput.value) : null;
        result.zoom =
          destZoomSelect && destZoomSelect.value ? destZoomSelect.value : null;
      } else {
        result.destPage = null;
        result.destX = null;
        result.destY = null;
        result.zoom = null;
      }

      cancelDestinationPicking();
      modalContainer.removeChild(overlay);
      resolve(result);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cancelDestinationPicking();
        modalContainer.removeChild(overlay);
        resolve(null);
      }
    });

    setTimeout(() => {
      const firstInput = modal.querySelector('input, select');
      if (firstInput) firstInput.focus();
    }, 0);

    createIcons({ icons });
  });
}
// Destination picking functions
function startDestinationPicking(callback) {
  isPickingDestination = true;
  currentPickingCallback = callback;

  const canvasWrapper = document.getElementById('pdf-canvas-wrapper');
  const pickingBanner = document.getElementById('picking-mode-banner');

  canvasWrapper.classList.add('picking-mode');
  pickingBanner.classList.remove('hidden');

  // Switch to viewer on mobile
  if (window.innerWidth < 1024) {
    document.getElementById('show-viewer-btn').click();
  }

  createIcons({ icons });
}

function cancelDestinationPicking() {
  isPickingDestination = false;
  currentPickingCallback = null;

  const canvasWrapper = document.getElementById('pdf-canvas-wrapper');
  const pickingBanner = document.getElementById('picking-mode-banner');

  canvasWrapper.classList.remove('picking-mode');
  pickingBanner.classList.add('hidden');

  // Remove any existing marker
  if (destinationMarker) {
    destinationMarker.remove();
    destinationMarker = null;
  }

  // Remove coordinate display
  const coordDisplay = document.getElementById('destination-coord-display');
  if (coordDisplay) {
    coordDisplay.remove();
  }

  // Restore modal if it was hidden
  if (savedModalOverlay) {
    savedModalOverlay.style.display = '';
    savedModalOverlay = null;
    savedModal = null;
  }
}

// Setup canvas click handler for destination picking
document.addEventListener('DOMContentLoaded', () => {
  initializeGlobalShortcuts();

  const canvas = document.getElementById('pdf-canvas');
  const canvasWrapper = document.getElementById('pdf-canvas-wrapper');
  const cancelPickingBtn = document.getElementById('cancel-picking-btn');

  // Coordinate tooltip
  let coordTooltip = null;

  canvasWrapper.addEventListener('mousemove', (e) => {
    if (!isPickingDestination) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create or update tooltip
    if (!coordTooltip) {
      coordTooltip = document.createElement('div');
      coordTooltip.className = 'coordinate-tooltip';
      canvasWrapper.appendChild(coordTooltip);
    }

    coordTooltip.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)} `;
    coordTooltip.style.left = e.clientX - rect.left + 15 + 'px';
    coordTooltip.style.top = e.clientY - rect.top + 15 + 'px';
  });

  canvasWrapper.addEventListener('mouseleave', () => {
    if (coordTooltip) {
      coordTooltip.remove();
      coordTooltip = null;
    }
  });

  canvas.addEventListener('click', async (e) => {
    if (!isPickingDestination || !currentPickingCallback) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Get viewport for coordinate conversion
    let viewport = currentViewport;
    if (!viewport) {
      const page = await pdfJsDoc.getPage(currentPage);
      viewport = page.getViewport({ scale: currentZoom });
    }

    // Convert canvas pixel coordinates to PDF coordinates
    // The canvas CSS size matches viewport dimensions, so coordinates map directly
    // PDF uses bottom-left origin, canvas uses top-left
    const scaleX = viewport.width / rect.width;
    const scaleY = viewport.height / rect.height;
    const pdfX = canvasX * scaleX;
    const pdfY = viewport.height - canvasY * scaleY;

    // Remove old marker and coordinate display
    if (destinationMarker) {
      destinationMarker.remove();
    }
    const oldCoordDisplay = document.getElementById(
      'destination-coord-display'
    );
    if (oldCoordDisplay) {
      oldCoordDisplay.remove();
    }

    // Create visual marker
    destinationMarker = document.createElement('div');
    destinationMarker.className = 'destination-marker';
    destinationMarker.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
    <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.2" />
      <path d="M12 2 L12 22 M2 12 L22 12" />
        <circle cx="12" cy="12" r="2" fill="#3b82f6" />
          </svg>
            `;
    const canvasRect = canvas.getBoundingClientRect();
    const wrapperRect = canvasWrapper.getBoundingClientRect();
    destinationMarker.style.position = 'absolute';
    destinationMarker.style.left =
      canvasX + canvasRect.left - wrapperRect.left + 'px';
    destinationMarker.style.top =
      canvasY + canvasRect.top - wrapperRect.top + 'px';
    canvasWrapper.appendChild(destinationMarker);

    // Create persistent coordinate display
    const coordDisplay = document.createElement('div');
    coordDisplay.id = 'destination-coord-display';
    coordDisplay.className =
      'absolute bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono z-50 pointer-events-none';
    coordDisplay.style.left =
      canvasX + canvasRect.left - wrapperRect.left + 20 + 'px';
    coordDisplay.style.top =
      canvasY + canvasRect.top - wrapperRect.top - 30 + 'px';
    coordDisplay.textContent = `X: ${Math.round(pdfX)}, Y: ${Math.round(pdfY)} `;
    canvasWrapper.appendChild(coordDisplay);

    // Call callback with PDF coordinates
    currentPickingCallback(currentPage, pdfX, pdfY);

    // End picking mode
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

function showConfirmModal(message) {
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
          <button id="modal-cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button id="modal-confirm" class="px-4 py-2 rounded btn-gradient text-white">Confirm</button>
              </div>
              </div>
                `;

    overlay.appendChild(modal);
    modalContainer.appendChild(overlay);

    modal.querySelector('#modal-cancel').addEventListener('click', () => {
      modalContainer.removeChild(overlay);
      resolve(false);
    });

    modal.querySelector('#modal-confirm').addEventListener('click', () => {
      modalContainer.removeChild(overlay);
      resolve(true);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        modalContainer.removeChild(overlay);
        resolve(false);
      }
    });
  });
}

function showAlertModal(title, message) {
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
    modalContainer.appendChild(overlay);

    modal.querySelector('#modal-ok').addEventListener('click', () => {
      modalContainer.removeChild(overlay);
      resolve(true);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        modalContainer.removeChild(overlay);
        resolve(true);
      }
    });
  });
}

const fileInput = document.getElementById('file-input');
const csvInput = document.getElementById('csv-input');
const jsonInput = document.getElementById('json-input');
const autoExtractCheckbox = document.getElementById('auto-extract-checkbox');
const appEl = document.getElementById('app');
const uploaderEl = document.getElementById('uploader');
const fileDisplayArea = document.getElementById(
  'file-display-area'
) as HTMLElement;
const backToToolsBtn = document.getElementById(
  'back-to-tools'
) as HTMLButtonElement;
const closeBtn = document.getElementById(
  'back-btn'
) as HTMLButtonElement;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageIndicator = document.getElementById('page-indicator');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const gotoPageInput = document.getElementById('goto-page');
const gotoBtn = document.getElementById('goto-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomFitBtn = document.getElementById('zoom-fit-btn');
const zoomIndicator = document.getElementById('zoom-indicator');
const addTopLevelBtn = document.getElementById('add-top-level-btn');
const titleInput = document.getElementById('bookmark-title');
const treeList = document.getElementById('bookmark-tree-list');
const noBookmarksEl = document.getElementById('no-bookmarks');
const downloadBtn = document.getElementById('download-btn');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const resetBtn = document.getElementById('reset-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const searchInput = document.getElementById('search-bookmarks');
const importDropdownBtn = document.getElementById('import-dropdown-btn');
const exportDropdownBtn = document.getElementById('export-dropdown-btn');
const importDropdown = document.getElementById('import-dropdown');
const exportDropdown = document.getElementById('export-dropdown');
const importCsvBtn = document.getElementById('import-csv-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const importJsonBtn = document.getElementById('import-json-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const csvImportHidden = document.getElementById('csv-import-hidden');
const jsonImportHidden = document.getElementById('json-import-hidden');
const extractExistingBtn = document.getElementById('extract-existing-btn');
const currentPageDisplay = document.getElementById('current-page-display');
const filenameDisplay = document.getElementById('filename-display');
const batchModeCheckbox = document.getElementById('batch-mode-checkbox');
const batchOperations = document.getElementById('batch-operations');
const selectedCountDisplay = document.getElementById('selected-count');
const batchColorSelect = document.getElementById('batch-color-select');
const batchStyleSelect = document.getElementById('batch-style-select');
const batchDeleteBtn = document.getElementById('batch-delete-btn');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');
const expandAllBtn = document.getElementById('expand-all-btn');
const collapseAllBtn = document.getElementById('collapse-all-btn');

const showViewerBtn = document.getElementById('show-viewer-btn');
const showBookmarksBtn = document.getElementById('show-bookmarks-btn');
const viewerSection = document.getElementById('viewer-section');
const bookmarksSection = document.getElementById('bookmarks-section');

// Handle responsive view switching
function handleResize() {
  if (window.innerWidth >= 1024) {
    viewerSection.classList.remove('hidden');
    bookmarksSection.classList.remove('hidden');
    showViewerBtn.classList.remove('bg-indigo-600', 'text-white');
    showViewerBtn.classList.add('text-gray-300');
    showBookmarksBtn.classList.remove('bg-indigo-600', 'text-white');
    showBookmarksBtn.classList.add('text-gray-300');
  }
}

window.addEventListener('resize', handleResize);

showViewerBtn.addEventListener('click', () => {
  viewerSection.classList.remove('hidden');
  bookmarksSection.classList.add('hidden');
  showViewerBtn.classList.add('bg-indigo-600', 'text-white');
  showViewerBtn.classList.remove('text-gray-300');
  showBookmarksBtn.classList.remove('bg-indigo-600', 'text-white');
  showBookmarksBtn.classList.add('text-gray-300');
});

showBookmarksBtn.addEventListener('click', () => {
  viewerSection.classList.add('hidden');
  bookmarksSection.classList.remove('hidden');
  showBookmarksBtn.classList.add('bg-indigo-600', 'text-white');
  showBookmarksBtn.classList.remove('text-gray-300');
  showViewerBtn.classList.remove('bg-indigo-600', 'text-white');
  showViewerBtn.classList.add('text-gray-300');
});

// Dropdown toggles
importDropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  importDropdown.classList.toggle('hidden');
  exportDropdown.classList.add('hidden');
});

exportDropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  exportDropdown.classList.toggle('hidden');
  importDropdown.classList.add('hidden');
});

document.addEventListener('click', () => {
  importDropdown.classList.add('hidden');
  exportDropdown.classList.add('hidden');
});

let pdfLibDoc = null;
let pdfJsDoc = null;
let currentPage = 1;
let originalFileName = '';
let bookmarkTree = [];
let history = [];
let historyIndex = -1;
let searchQuery = '';
let csvBookmarks = null;
let jsonBookmarks = null;
let batchMode = false;
let selectedBookmarks = new Set();
let collapsedNodes = new Set();

const colorClasses = {
  red: 'bg-red-100 border-red-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  yellow: 'bg-yellow-100 border-yellow-300',
  purple: 'bg-purple-100 border-purple-300',
};

function saveState() {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.parse(JSON.stringify(bookmarkTree)));
  historyIndex++;
  updateUndoRedoButtons();
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    bookmarkTree = JSON.parse(JSON.stringify(history[historyIndex]));
    renderBookmarkTree();
    updateUndoRedoButtons();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    bookmarkTree = JSON.parse(JSON.stringify(history[historyIndex]));
    renderBookmarkTree();
    updateUndoRedoButtons();
  }
}

function updateUndoRedoButtons() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// Reset button - goes back to uploader
resetBtn.addEventListener('click', async () => {
  const confirmed = await showConfirmModal(
    'Reset and go back to file uploader? All unsaved changes will be lost.'
  );
  if (confirmed) {
    resetToUploader();
  }
});

// Delete all bookmarks button
deleteAllBtn.addEventListener('click', async () => {
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

function resetToUploader() {
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

  fileInput.value = '';
  csvInput.value = '';
  jsonInput.value = '';

  appEl.classList.add('hidden');
  uploaderEl.classList.remove('hidden');

  // Reset mobile view
  viewerSection.classList.remove('hidden');
  bookmarksSection.classList.add('hidden');
  showViewerBtn.classList.add('bg-indigo-600', 'text-white');
  showViewerBtn.classList.remove('text-gray-300');
  showBookmarksBtn.classList.remove('bg-indigo-600', 'text-white');
  showBookmarksBtn.classList.add('text-gray-300');
}

document.addEventListener('keydown', (e) => {
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

batchModeCheckbox.addEventListener('change', (e) => {
  batchMode = e.target.checked;
  if (!batchMode) {
    selectedBookmarks.clear();
    updateSelectedCount();
  }
  batchOperations.classList.toggle(
    'hidden',
    !batchMode || selectedBookmarks.size === 0
  );
  renderBookmarkTree();
});

function updateSelectedCount() {
  selectedCountDisplay.textContent = selectedBookmarks.size;
  if (batchMode) {
    batchOperations.classList.toggle('hidden', selectedBookmarks.size === 0);
  }
}

selectAllBtn.addEventListener('click', () => {
  const getAllIds = (nodes) => {
    let ids = [];
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

deselectAllBtn.addEventListener('click', () => {
  selectedBookmarks.clear();
  updateSelectedCount();
  renderBookmarkTree();
});

batchColorSelect.addEventListener('change', (e) => {
  if (e.target.value && selectedBookmarks.size > 0) {
    const color = e.target.value === 'null' ? null : e.target.value;
    applyToSelected((node) => (node.color = color));
    e.target.value = '';
  }
});

batchStyleSelect.addEventListener('change', (e) => {
  if (e.target.value && selectedBookmarks.size > 0) {
    const style = e.target.value === 'null' ? null : e.target.value;
    applyToSelected((node) => (node.style = style));
    e.target.value = '';
  }
});

batchDeleteBtn.addEventListener('click', async () => {
  if (selectedBookmarks.size === 0) return;

  const confirmed = await showConfirmModal(
    `Delete ${selectedBookmarks.size} bookmark(s) ? `
  );
  if (!confirmed) return;

  const remove = (nodes) => {
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

function applyToSelected(fn) {
  const update = (nodes) => {
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

expandAllBtn.addEventListener('click', () => {
  collapsedNodes.clear();
  renderBookmarkTree();
});

collapseAllBtn.addEventListener('click', () => {
  const collapseAll = (nodes) => {
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

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Render file display
function renderFileDisplay(file: File) {
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

fileInput.addEventListener('change', loadPDF);

async function loadPDF(e) {
  const file = e ? e.target.files[0] : fileInput.files[0];
  if (!file) return;

  originalFileName = file.name.replace('.pdf', '');
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

  gotoPageInput.max = pdfJsDoc.numPages;

  appEl.classList.remove('hidden');
  uploaderEl.classList.add('hidden');

  if (autoExtractCheckbox.checked) {
    const extracted = await extractExistingBookmarks(pdfLibDoc);
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
}

csvInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  csvBookmarks = parseCSV(text);

  await showAlertModal(
    'CSV Loaded',
    `Loaded ${csvBookmarks.length} bookmarks from CSV. Now upload your PDF.`
  );
});

jsonInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
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

async function renderPage(num, zoom = null, destX = null, destY = null) {
  if (!pdfJsDoc) return;

  const page = await pdfJsDoc.getPage(num);

  let zoomScale = currentZoom;
  if (zoom !== null && zoom !== '' && zoom !== '0') {
    zoomScale = parseFloat(zoom) / 100;
  }

  const dpr = window.devicePixelRatio || 1;

  let viewport = page.getViewport({ scale: zoomScale });
  currentViewport = viewport;

  canvas.height = viewport.height * dpr;
  canvas.width = viewport.width * dpr;

  // Set CSS size to maintain aspect ratio (this is what the browser displays)
  canvas.style.width = viewport.width + 'px';
  canvas.style.height = viewport.height + 'px';

  // Scale the canvas context to match device pixel ratio
  ctx.scale(dpr, dpr);

  await page.render({ canvasContext: ctx, viewport: viewport }).promise;

  // Draw destination marker if coordinates are provided
  if (destX !== null && destY !== null) {
    const canvasX = destX;
    const canvasY = viewport.height - destY; // Flip Y axis (PDF bottom-left, canvas top-left)

    // Draw marker on canvas with animation effect
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

    // Draw crosshair
    ctx.beginPath();
    ctx.moveTo(canvasX - 15, canvasY);
    ctx.lineTo(canvasX + 15, canvasY);
    ctx.moveTo(canvasX, canvasY - 15);
    ctx.lineTo(canvasX, canvasY + 15);
    ctx.stroke();

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw coordinate text background
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

  pageIndicator.textContent = `Page ${num} / ${pdfJsDoc.numPages}`;
  gotoPageInput.value = num;
  currentPage = num;
  currentPageDisplay.textContent = num;
}

async function renderPageWithDestination(pageNum, x, y, zoom) {
  await renderPage(pageNum, zoom, x, y);
}

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) renderPage(currentPage - 1);
});

nextPageBtn.addEventListener('click', () => {
  if (currentPage < pdfJsDoc.numPages) renderPage(currentPage + 1);
});

gotoBtn.addEventListener('click', () => {
  const page = parseInt(gotoPageInput.value);
  if (page >= 1 && page <= pdfJsDoc.numPages) {
    renderPage(page);
  }
});

gotoPageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') gotoBtn.click();
});

// Zoom controls
function updateZoomIndicator() {
  if (zoomIndicator) {
    zoomIndicator.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

zoomInBtn.addEventListener('click', () => {
  currentZoom = Math.min(currentZoom + 0.05, 2.0); // Max 200%, increment by 5%
  updateZoomIndicator();
  renderPage(currentPage);
});

zoomOutBtn.addEventListener('click', () => {
  currentZoom = Math.max(currentZoom - 0.05, 0.25); // Min 25%, decrement by 5%
  updateZoomIndicator();
  renderPage(currentPage);
});

zoomFitBtn.addEventListener('click', async () => {
  if (!pdfJsDoc) return;
  currentZoom = 1.0;
  updateZoomIndicator();
  renderPage(currentPage);
});

// Initialize zoom indicator
updateZoomIndicator();

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderBookmarkTree();
});

function removeNodeById(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (removeNodeById(nodes[i].children, id)) return true;
  }
  return false;
}

function flattenBookmarks(nodes, level = 0) {
  let result = [];
  for (const node of nodes) {
    result.push({ ...node, level });
    if (node.children.length > 0) {
      result = result.concat(flattenBookmarks(node.children, level + 1));
    }
  }
  return result;
}

function matchesSearch(node, query) {
  if (!query) return true;
  if (node.title.toLowerCase().includes(query)) return true;
  return node.children.some((child) => matchesSearch(child, query));
}

function makeSortable(element, parentNode = null, isTopLevel = false) {
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

        const treeCopy = JSON.parse(JSON.stringify(bookmarkTree));

        if (isTopLevel) {
          const movedItem = treeCopy.splice(evt.oldIndex, 1)[0];
          treeCopy.splice(evt.newIndex, 0, movedItem);
          bookmarkTree = treeCopy;
        } else if (parentNode) {
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

function findNodeInTree(nodes, id) {
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

function getStyleClasses(style) {
  if (style === 'bold') return 'font-bold';
  if (style === 'italic') return 'italic';
  if (style === 'bold-italic') return 'font-bold italic';
  return '';
}

function getTextColor(color) {
  if (!color) return '';

  // Custom hex colors will use inline styles instead
  if (color.startsWith('#')) {
    return '';
  }

  const colorMap = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  };
  return colorMap[color] || '';
}

function renderBookmarkTree() {
  treeList.innerHTML = '';
  const filtered = searchQuery
    ? bookmarkTree.filter((n) => matchesSearch(n, searchQuery))
    : bookmarkTree;

  if (filtered.length === 0) {
    noBookmarksEl.classList.remove('hidden');
  } else {
    noBookmarksEl.classList.add('hidden');
    for (const node of filtered) {
      treeList.appendChild(createNodeElement(node));
    }
    makeSortable(treeList, null, true);
  }

  createIcons({ icons });
  updateSelectedCount();
}

function createNodeElement(node, level = 0) {
  if (!node || !node.id) {
    console.error('Invalid node:', node);
    return document.createElement('li');
  }

  const li = document.createElement('li');
  li.dataset.bookmarkId = node.id;
  li.className = 'group';

  const hasChildren =
    node.children && Array.isArray(node.children) && node.children.length > 0;
  const isCollapsed = collapsedNodes.has(node.id);
  const isSelected = selectedBookmarks.has(node.id);
  const isMatch =
    !searchQuery || node.title.toLowerCase().includes(searchQuery);
  const highlight = isMatch && searchQuery ? 'bg-yellow-100' : '';
  const colorClass = node.color ? colorClasses[node.color] || '' : '';
  const styleClass = getStyleClasses(node.style);
  const textColorClass = getTextColor(node.color);

  const div = document.createElement('div');
  div.className = `flex items-center gap-2 p-2 rounded border border-gray-200 ${colorClass} ${highlight} ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`;

  if (batchMode) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSelected;
    checkbox.className = 'w-4 h-4 flex-shrink-0';
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectedBookmarks.has(node.id)) {
        selectedBookmarks.delete(node.id);
      } else {
        selectedBookmarks.add(node.id);
      }
      updateSelectedCount();
      checkbox.checked = selectedBookmarks.has(node.id);
      batchOperations.classList.toggle(
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
    toggleBtn.addEventListener('click', (e) => {
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
    node.color && node.color.startsWith('#')
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
    // Check if bookmark has a custom destination
    if (node.destX !== null || node.destY !== null || node.zoom !== null) {
      // Render page with destination highlighted and zoom applied
      await renderPageWithDestination(
        node.page,
        node.destX,
        node.destY,
        node.zoom
      );

      // Highlight the destination briefly (2 seconds)
      setTimeout(() => {
        // Re-render without highlight but keep the zoom if it was set
        if (node.zoom !== null && node.zoom !== '' && node.zoom !== '0') {
          // Keep the bookmark's zoom for a moment, then restore current zoom
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
      showViewerBtn.click();
    }
  });
  div.appendChild(titleDiv);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flex gap-1 flex-shrink-0';

  const addChildBtn = document.createElement('button');
  addChildBtn.className = 'p-1 hover:bg-gray-200 rounded';
  addChildBtn.title = 'Add child';
  addChildBtn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i>';
  addChildBtn.addEventListener('click', async (e) => {
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
        title: cleanTitle(result.title),
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
  editBtn.className = 'p-1 hover:bg-gray-200 rounded';
  editBtn.title = 'Edit';
  editBtn.innerHTML = '<i data-lucide="edit-2" class="w-4 h-4"></i>';
  editBtn.addEventListener('click', async (e) => {
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
      node.title = cleanTitle(result.title);
      node.color = result.color || null;
      node.style = result.style || null;

      // Update destination
      if (result.destPage !== null && result.destPage !== undefined) {
        node.page = result.destPage;
        node.destX = result.destX;
        node.destY = result.destY;
        node.zoom = result.zoom;
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
  deleteBtn.addEventListener('click', async (e) => {
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

    const nodeCopy = JSON.parse(JSON.stringify(node));

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

addTopLevelBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
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
  titleInput.value = '';
});

titleInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTopLevelBtn.click();
});

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

importCsvBtn.addEventListener('click', () => {
  csvImportHidden.click();
  importDropdown.classList.add('hidden');
});

csvImportHidden.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  const imported = parseCSV(text);

  if (imported.length > 0) {
    bookmarkTree = imported;
    saveState();
    renderBookmarkTree();
    await showAlertModal('Success', `Imported ${imported.length} bookmarks!`);
  }

  csvImportHidden.value = '';
});

exportCsvBtn.addEventListener('click', () => {
  exportDropdown.classList.add('hidden');

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
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${originalFileName}-bookmarks.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

function parseCSV(text) {
  const lines = text.trim().split('\n').slice(1);
  const bookmarks = [];
  const stack = [{ children: bookmarks, level: -1 }];

  for (const line of lines) {
    const match =
      line.match(/^"(.+)",(\d+),(\d+)$/) || line.match(/^([^,]+),(\d+),(\d+)$/);
    if (!match) continue;

    const [, title, page, level] = match;
    const bookmark = {
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
    stack.push({ ...bookmark, level: lvl });
  }

  return bookmarks;
}

importJsonBtn.addEventListener('click', () => {
  jsonImportHidden.click();
  importDropdown.classList.add('hidden');
});

jsonImportHidden.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();
  try {
    const imported = JSON.parse(text);
    // Recursively clean titles in imported JSON
    function cleanImportedTree(nodes) {
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

  jsonImportHidden.value = '';
});

exportJsonBtn.addEventListener('click', () => {
  exportDropdown.classList.add('hidden');

  if (bookmarkTree.length === 0) {
    showAlertModal('Error', 'No bookmarks to export!');
    return;
  }

  const json = JSON.stringify(bookmarkTree, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${originalFileName}-bookmarks.json`;
  a.click();
  URL.revokeObjectURL(url);
});

extractExistingBtn.addEventListener('click', async () => {
  if (!pdfLibDoc) return;

  const extracted = await extractExistingBookmarks(pdfLibDoc);
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

function cleanTitle(title) {
  // @TODO@ALAM: check for other encoding issues
  if (typeof title === 'string') {
    return title.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
  }
  return title;
}

async function extractExistingBookmarks(doc) {
  try {
    const outline = await pdfJsDoc.getOutline();
    console.log(outline);
    if (!outline) return [];

    async function processOutlineItem(item) {
      let pageIndex = 0;
      let destX = null;
      let destY = null;
      let zoom = null;

      try {
        let dest = item.dest;
        if (typeof dest === 'string') {
          dest = await pdfJsDoc.getDestination(dest);
        }

        if (Array.isArray(dest)) {
          const destRef = dest[0];
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

      let color = null;
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

      // Map style
      let style = null;
      if (item.bold && item.italic) style = 'bold-italic';
      else if (item.bold) style = 'bold';
      else if (item.italic) style = 'italic';

      const bookmark = {
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

    const result = [];
    for (const item of outline) {
      const bookmark = await processOutlineItem(item);
      result.push(bookmark);
    }

    return result;
  } catch (err) {
    console.error('Error extracting bookmarks:', err);
    return [];
  }
}

// Back to tools button
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

downloadBtn.addEventListener('click', async () => {
  const pages = pdfLibDoc.getPages();
  const outlinesDict = pdfLibDoc.context.obj({});
  const outlinesRef = pdfLibDoc.context.register(outlinesDict);

  function createOutlineItems(nodes, parentRef) {
    const items = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const itemDict = pdfLibDoc.context.obj({});
      const itemRef = pdfLibDoc.context.register(itemDict);

      itemDict.set(PDFName.of('Title'), PDFHexString.fromText(node.title));
      itemDict.set(PDFName.of('Parent'), parentRef);

      // Always map bookmark page to zero-based index consistently
      const pageIndex = Math.max(0, Math.min(node.page - 1, pages.length - 1));
      const pageRef = pages[pageIndex].ref;

      // Handle custom destination with zoom and position
      let destArray;
      if (node.destX !== null || node.destY !== null || node.zoom !== null) {
        const x = node.destX !== null ? PDFNumber.of(node.destX) : null;
        const y = node.destY !== null ? PDFNumber.of(node.destY) : null;

        let zoom = null;
        if (node.zoom !== null && node.zoom !== '' && node.zoom !== '0') {
          // Convert percentage to decimal (100% = 1.0)
          zoom = PDFNumber.of(parseFloat(node.zoom) / 100);
        }

        destArray = pdfLibDoc.context.obj([
          pageRef,
          PDFName.of('XYZ'),
          x,
          y,
          zoom,
        ]);
      } else {
        destArray = pdfLibDoc.context.obj([
          pageRef,
          PDFName.of('XYZ'),
          null,
          null,
          null,
        ]);
      }

      itemDict.set(PDFName.of('Dest'), destArray);

      // Add color to PDF
      if (node.color) {
        let rgb;

        if (node.color.startsWith('#')) {
          // Custom hex color - convert to RGB
          const hex = node.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          rgb = [r, g, b];
        } else {
          // Predefined colors
          const colorMap = {
            red: [1.0, 0.0, 0.0],
            blue: [0.0, 0.0, 1.0],
            green: [0.0, 1.0, 0.0],
            yellow: [1.0, 1.0, 0.0],
            purple: [0.5, 0.0, 0.5],
          };
          rgb = colorMap[node.color];
        }

        if (rgb) {
          const colorArray = pdfLibDoc.context.obj(rgb);
          itemDict.set(PDFName.of('C'), colorArray);
        }
      }

      // Add style flags to PDF
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
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${originalFileName}-bookmarked.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    await showAlertModal('Success', 'PDF saved successfully!');

    // Reset to uploader after successful save
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
