import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import { renderPagesProgressively, cleanupLazyRendering } from '../utils/render-utils.js';
import Sortable from 'sortablejs';
import { icons, createIcons } from 'lucide';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const duplicateOrganizeState = {
  sortableInstances: {},
};

function initializePageGridSortable() {
  const grid = document.getElementById('page-grid');
  if (!grid) return;

  // @ts-expect-error TS(2339) FIXME: Property 'pageGrid' does not exist on type '{}'.
  if (duplicateOrganizeState.sortableInstances.pageGrid) {
    // @ts-expect-error TS(2339) FIXME: Property 'pageGrid' does not exist on type '{}'.
    duplicateOrganizeState.sortableInstances.pageGrid.destroy();
  }

  // @ts-expect-error TS(2339) FIXME: Property 'pageGrid' does not exist on type '{}'.
  duplicateOrganizeState.sortableInstances.pageGrid = Sortable.create(grid, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.duplicate-btn, .delete-btn',
    preventOnFilter: true,
    onStart: function (evt: any) {
      evt.item.style.opacity = '0.5';
    },
    onEnd: function (evt: any) {
      evt.item.style.opacity = '1';
    },
  });
}

/**
 * Attaches event listeners for duplicate and delete to a page thumbnail element.
 * @param {HTMLElement} element The thumbnail element to attach listeners to.
 */
function attachEventListeners(element: any) {
  // Re-number all visible page labels
  const renumberPages = () => {
    const grid = document.getElementById('page-grid');
    const pages = grid.querySelectorAll('.page-number');
    pages.forEach((label, index) => {
      // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
      label.textContent = index + 1;
    });
  };

  // Duplicate button listener
  element
    .querySelector('.duplicate-btn')
    .addEventListener('click', (e: any) => {
      e.stopPropagation();
      const clone = element.cloneNode(true);
      element.after(clone);
      attachEventListeners(clone);
      renumberPages();
      initializePageGridSortable();
    });

  element.querySelector('.delete-btn').addEventListener('click', (e: any) => {
    e.stopPropagation();
    if (document.getElementById('page-grid').children.length > 1) {
      element.remove();
      renumberPages();
      initializePageGridSortable();
    } else {
      showAlert(
        'Cannot Delete',
        'You cannot delete the last page of the document.'
      );
    }
  });
}

export async function renderDuplicateOrganizeThumbnails() {
  const grid = document.getElementById('page-grid');
  if (!grid) return;

  // Cleanup any previous lazy loading observers
  cleanupLazyRendering();

  showLoader('Rendering page previews...');
  const pdfData = await state.pdfDoc.save();
  const pdfjsDoc = await getPDFDocument({ data: pdfData }).promise;

  grid.textContent = '';

  // Function to create wrapper element for each page
  const createWrapper = (canvas: HTMLCanvasElement, pageNumber: number) => {
    const wrapper = document.createElement('div');
    wrapper.className =
      'page-thumbnail relative cursor-move flex flex-col items-center gap-2';
    // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
    wrapper.dataset.originalPageIndex = pageNumber - 1;

    const imgContainer = document.createElement('div');
    imgContainer.className =
      'w-full h-36 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600';

    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.className = 'max-w-full max-h-full object-contain';
    imgContainer.appendChild(img);

    const pageNumberSpan = document.createElement('span');
    pageNumberSpan.className =
      'page-number absolute top-1 left-1 bg-gray-900 bg-opacity-75 text-white text-xs rounded-full px-2 py-1';
    pageNumberSpan.textContent = pageNumber.toString();

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flex items-center justify-center gap-4';

    const duplicateBtn = document.createElement('button');
    duplicateBtn.className =
      'duplicate-btn bg-green-600 hover:bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center';
    duplicateBtn.title = 'Duplicate Page';
    const duplicateIcon = document.createElement('i');
    duplicateIcon.setAttribute('data-lucide', 'copy-plus');
    duplicateIcon.className = 'w-5 h-5';
    duplicateBtn.appendChild(duplicateIcon);

    const deleteBtn = document.createElement('button');
    deleteBtn.className =
      'delete-btn bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center';
    deleteBtn.title = 'Delete Page';
    const deleteIcon = document.createElement('i');
    deleteIcon.setAttribute('data-lucide', 'x-circle');
    deleteIcon.className = 'w-5 h-5';
    deleteBtn.appendChild(deleteIcon);

    controlsDiv.append(duplicateBtn, deleteBtn);
    wrapper.append(imgContainer, pageNumberSpan, controlsDiv);

    attachEventListeners(wrapper);

    return wrapper;
  };

  try {
    // Render pages progressively with lazy loading
    await renderPagesProgressively(
      pdfjsDoc,
      grid,
      createWrapper,
      {
        batchSize: 8,
        useLazyLoading: true,
        lazyLoadMargin: '400px',
        onProgress: (current, total) => {
          showLoader(`Rendering page previews: ${current}/${total}`);
        },
        onBatchComplete: () => {
          createIcons({ icons });
        }
      }
    );

    initializePageGridSortable();
  } catch (error) {
    console.error('Error rendering thumbnails:', error);
    showAlert('Error', 'Failed to render page previews');
  } finally {
    hideLoader();
  }
}

export async function processAndSave() {
  showLoader('Building new PDF...');
  try {
    const grid = document.getElementById('page-grid');
    const finalPageElements = grid.querySelectorAll('.page-thumbnail');

    const finalIndices = Array.from(finalPageElements)
      .map((el) => parseInt((el as HTMLElement).dataset.originalPageIndex || '', 10))
      .filter(index => !isNaN(index) && index >= 0);

    console.log('Saving PDF with indices:', finalIndices);
    console.log('Original PDF Page Count:', state.pdfDoc?.getPageCount());

    if (finalIndices.length === 0) {
      showAlert('Error', 'No valid pages to save.');
      return;
    }

    const newPdfDoc = await PDFLibDocument.create();

    const totalPages = state.pdfDoc.getPageCount();
    const invalidIndices = finalIndices.filter(i => i >= totalPages);
    if (invalidIndices.length > 0) {
      console.error('Found invalid indices:', invalidIndices);
      showAlert('Error', 'Some pages could not be processed. Please try again.');
      return;
    }

    const copiedPages = await newPdfDoc.copyPages(state.pdfDoc, finalIndices);
    copiedPages.forEach((page: any) => newPdfDoc.addPage(page));

    const newPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'organized.pdf'
    );
  } catch (e) {
    console.error('Save error:', e);
    showAlert('Error', 'Failed to save the new PDF. Check console for details.');
  } finally {
    hideLoader();
  }
}
