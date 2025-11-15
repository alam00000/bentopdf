import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, parseInsertionPositions } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Sortable from 'sortablejs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const blankPageState = {
  activeMode: 'text',
  selectedPositions: new Set<number>(),
  isRendering: false,
  sortableInstance: null as any,
  cachedThumbnails: null as DocumentFragment | null,
  lastPdfHash: null as string | null,
};

function insertBlankPagesAtPositions(positions: number[], pageCount: number) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const totalPages = state.pdfDoc.getPageCount();
      const totalInsertions = positions.length * pageCount;
      showLoader(
        `Adding ${totalInsertions} blank page${totalInsertions > 1 ? 's' : ''} at ${positions.length} position${positions.length > 1 ? 's' : ''}...`
      );

      const newPdf = await PDFLibDocument.create();
      const { width, height } = state.pdfDoc.getPage(0).getSize();

      // Build the new PDF by processing original pages in order
      // and inserting blank pages at the specified positions
      let currentOriginalPageIndex = 0;

      for (const insertPos of positions) {
        // Copy all original pages up to (but not including) the insertion position
        while (currentOriginalPageIndex < insertPos) {
          const copied = await newPdf.copyPages(state.pdfDoc, [
            currentOriginalPageIndex,
          ]);
          copied.forEach((p: any) => newPdf.addPage(p));
          currentOriginalPageIndex++;
        }

        // Insert blank pages at this position
        for (let i = 0; i < pageCount; i++) {
          newPdf.addPage([width, height]);
        }

        // Note: We don't increment currentOriginalPageIndex here because
        // we want to copy the page at insertPos after the blank pages
      }

      // Copy all remaining original pages after the last insertion position
      while (currentOriginalPageIndex < totalPages) {
        const copied = await newPdf.copyPages(state.pdfDoc, [
          currentOriginalPageIndex,
        ]);
        copied.forEach((p: any) => newPdf.addPage(p));
        currentOriginalPageIndex++;
      }

      const newPdfBytes = await newPdf.save();
      downloadFile(
        new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
        `blank-page${totalInsertions > 1 ? 's' : ''}-added.pdf`
      );
      resolve();
    } catch (e) {
      console.error(e);
      reject(e);
    } finally {
      hideLoader();
    }
  });
}

export async function addBlankPage() {
  if (blankPageState.activeMode === 'text') {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageNumberInput = document.getElementById('page-number').value;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageCountInput = document.getElementById('page-count').value;

  if (pageNumberInput.trim() === '') {
      showAlert('Invalid Input', 'Please enter a page position or range.');
    return;
  }

  if (pageCountInput.trim() === '') {
    showAlert('Invalid Input', 'Please enter the number of pages to insert.');
    return;
  }

  const pageCount = parseInt(pageCountInput);
  const totalPages = state.pdfDoc.getPageCount();

    if (isNaN(pageCount) || pageCount < 1) {
      showAlert(
        'Invalid Input',
        'Please enter a valid number of pages (1 or more).'
      );
      return;
    }

    // Parse insertion positions from the range string
    const positions = parseInsertionPositions(pageNumberInput.trim(), totalPages);

    if (!positions || positions.length === 0) {
    showAlert(
      'Invalid Input',
        `Please enter valid positions between 0 and ${totalPages}. Use format like "0, 2-4, 6".`
    );
    return;
  }

    try {
      await insertBlankPagesAtPositions(positions, pageCount);
    } catch (e) {
      showAlert(
        'Error',
        `Could not add blank page${positions.length * pageCount > 1 ? 's' : ''}.`
      );
    }
  } else {
    // page mode - calculate positions from DOM order
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const pageCountInput = document.getElementById('page-count-visual').value;

    if (pageCountInput.trim() === '') {
      showAlert('Invalid Input', 'Please enter the number of pages to insert.');
      return;
    }

    const pageCount = parseInt(pageCountInput);

  if (isNaN(pageCount) || pageCount < 1) {
    showAlert(
      'Invalid Input',
      'Please enter a valid number of pages (1 or more).'
    );
    return;
  }

    const container = document.getElementById('page-preview-container');
    if (!container) {
      showAlert('Error', 'Page preview container not found.');
      return;
    }

    // Calculate insertion positions from DOM order
    const positions: number[] = [];
    const children = Array.from(container.children);
    const totalPages = state.pdfDoc.getPageCount();

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const isMarker = child.classList.contains('blank-page-marker');

      if (isMarker) {
        // Count how many actual pages come before this marker
        let pagesBefore = 0;
        for (let j = 0; j < i; j++) {
          const prevChild = children[j] as HTMLElement;
          if (!prevChild.classList.contains('blank-page-marker') && 
              !prevChild.classList.contains('page-start-area')) {
            pagesBefore++;
          }
        }
        positions.push(pagesBefore);
      }
    }

    if (positions.length === 0) {
      showAlert(
        'Invalid Input',
        'Please add at least one blank page marker by clicking on a page.'
      );
      return;
    }

    // Remove duplicates and sort
    const uniquePositions = Array.from(new Set(positions)).sort((a, b) => a - b);

    try {
      await insertBlankPagesAtPositions(uniquePositions, pageCount);
    } catch (e) {
      showAlert(
        'Error',
        `Could not add blank page${uniquePositions.length * pageCount > 1 ? 's' : ''}.`
      );
    }
  }
}

function createBlankPageMarker() {
  const marker = document.createElement('div');
  marker.className =
    'blank-page-marker cursor-move flex flex-col items-center justify-center p-2 border-2 border-dashed border-indigo-500 bg-indigo-900 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors';

  const blankLabel = document.createElement('div');
  blankLabel.className = 'text-xs text-indigo-300 font-semibold mb-1';
  blankLabel.textContent = 'BLANK';

  const dragLabel = document.createElement('div');
  dragLabel.className = 'text-xs text-indigo-400';
  dragLabel.textContent = 'Drag to move';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-marker-btn mt-1 text-red-400 hover:text-red-300 text-xs';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    marker.remove();
    initializePageThumbnailsSortable();
  });

  marker.append(blankLabel, dragLabel, removeBtn);

  marker.addEventListener('click', (e) => {
    // Remove marker if clicking on it (but not on the button which has its own handler)
    if ((e.target as HTMLElement) !== removeBtn && !removeBtn.contains(e.target as HTMLElement)) {
      marker.remove();
      initializePageThumbnailsSortable();
    }
  });

  return marker;
}

function initializePageThumbnailsSortable() {
  const container = document.getElementById('page-preview-container');
  if (!container) return;

  if (blankPageState.sortableInstance) {
    blankPageState.sortableInstance.destroy();
  }

  blankPageState.sortableInstance = Sortable.create(container, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.remove-marker-btn',
    preventOnFilter: true,
    onStart: function (evt: any) {
      evt.item.style.opacity = '0.5';
    },
    onEnd: function (evt: any) {
      evt.item.style.opacity = '1';
    },
  });
}

function generatePdfHash() {
  if (!state.pdfDoc) return null;
  // Generate a hash based on PDF metadata that changes when the PDF changes
  try {
    const pageCount = state.pdfDoc.getPageCount();
    // Use page count and first page size as a simple hash
    // This will change if pages are added/removed or if the PDF is replaced
    const firstPage = state.pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize();
    return `${pageCount}-${width}-${height}`;
  } catch {
    return null;
  }
}

async function renderPageThumbnails() {
  // Ensure visual panel is visible first
  const visualPanel = document.getElementById('visual-mode-panel');
  if (visualPanel && visualPanel.classList.contains('hidden')) {
    visualPanel.classList.remove('hidden');
  }

  const container = document.getElementById('page-preview-container');
  if (!container) {
    console.error('page-preview-container not found. Make sure page mode panel is visible.');
    return;
  }

  if (!state.pdfDoc) {
    console.error('PDF document not loaded');
    return;
  }

  // Check if we can use cached thumbnails
  const currentPdfHash = generatePdfHash();
  const pdfChanged = currentPdfHash !== blankPageState.lastPdfHash;
  
  // Check if thumbnails are already rendered by looking for the START area
  const hasStartArea = container.querySelector('.page-start-area') !== null;
  const hasPageThumbnails = container.querySelector('.page-thumbnail') !== null;
  
  // If PDF hasn't changed and thumbnails are already rendered, skip re-rendering
  if (!pdfChanged && hasStartArea && hasPageThumbnails) {
    // Thumbnails are already rendered, just reinitialize sortable
    initializePageThumbnailsSortable();
    return;
  }
  
  if (blankPageState.isRendering) {
    console.log('Already rendering, skipping...');
    return;
  }

  blankPageState.isRendering = true;
  
  // If we reach here, we need to render (either PDF changed or thumbnails missing)
  // Clear the container to prepare for fresh render
  container.textContent = '';
  
  // If PDF changed, clear the cache
  if (pdfChanged) {
    blankPageState.cachedThumbnails = null;
    blankPageState.lastPdfHash = null;
  }

  const totalPages = state.pdfDoc.getPageCount();

  try {
    const pdfData = await state.pdfDoc.save();
    const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;

    // Add "Start" area for inserting at position 0
    const startArea = document.createElement('div');
    startArea.className =
      'page-start-area cursor-pointer flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-600 hover:border-indigo-500 rounded-lg bg-gray-800 transition-colors mb-2';
    startArea.innerHTML = `
      <div class="text-xs text-gray-400 font-semibold mb-1">START</div>
      <div class="text-xs text-gray-500">Click to add blank page</div>
    `;
    startArea.addEventListener('click', () => {
      const marker = createBlankPageMarker();
      // Insert after start area (before first page if exists)
      if (container.children.length > 1) {
        container.insertBefore(marker, container.children[1]);
      } else {
        container.appendChild(marker);
      }
      initializePageThumbnailsSortable();
    });
    container.appendChild(startArea);

    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
      showLoader(`Rendering page previews: ${i}/${totalPages}`);
      const page = await pdfjsDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.5 });
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
        'page-thumbnail relative cursor-pointer flex flex-col items-center gap-1 p-2 border-2 border-gray-600 hover:border-indigo-500 rounded-lg bg-gray-700 transition-colors';
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

      wrapper.append(imgContainer);

      // Click on page to insert blank page marker before it
      wrapper.addEventListener('click', () => {
        const marker = createBlankPageMarker();
        container.insertBefore(marker, wrapper);
        initializePageThumbnailsSortable();
      });

      container.appendChild(wrapper);
    }

    pdfjsDoc.destroy();
    
    // Store hash to track if PDF changes
    blankPageState.lastPdfHash = currentPdfHash;
    
    initializePageThumbnailsSortable();
  } catch (error) {
    console.error('Error rendering page thumbnails:', error);
    showAlert('Error', 'Failed to render page thumbnails');
  } finally {
    hideLoader();
    blankPageState.isRendering = false;
  }
}


export async function setupBlankPageTool() {
  // Only show mode toggle and controls if PDF is uploaded
  if (!state.pdfDoc) {
    // Hide mode toggle and all controls if no PDF
    document.getElementById('mode-toggle-container')?.classList.add('hidden');
    const textControls = document.getElementById('text-mode-controls');
    const visualControls = document.getElementById('visual-mode-controls');
    if (textControls) textControls.style.display = 'none';
    if (visualControls) visualControls.style.display = 'none';
    return;
  }

  // Show mode toggle after file upload (controls will be shown based on active mode below)
  document.getElementById('mode-toggle-container')?.classList.remove('hidden');
  
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('process-btn').disabled = false;
  document.getElementById('process-btn').onclick = addBlankPage;
  document.getElementById('process-btn-visual').onclick = addBlankPage;

  const textModeBtn = document.getElementById('text-mode-btn');
  const visualModeBtn = document.getElementById('visual-mode-btn');
  const textPanel = document.getElementById('text-mode-panel');
  const visualPanel = document.getElementById('visual-mode-panel');

  if (state.pdfDoc) {
    const totalPages = state.pdfDoc.getPageCount();
    document.getElementById('total-pages').textContent = totalPages.toString();
    document.getElementById('total-pages-visual').textContent = totalPages.toString();
  }

  const wasInVisualMode = blankPageState.activeMode === 'visual';
  const newTextModeBtn = textModeBtn.cloneNode(true);
  const newVisualModeBtn = visualModeBtn.cloneNode(true);
  textModeBtn.replaceWith(newTextModeBtn);
  visualModeBtn.replaceWith(newVisualModeBtn);

  // Add button to add blank page markers
  const addMarkerBtn = document.getElementById('add-blank-marker-btn');
  if (addMarkerBtn) {
    const newAddMarkerBtn = addMarkerBtn.cloneNode(true);
    addMarkerBtn.replaceWith(newAddMarkerBtn);
    newAddMarkerBtn.addEventListener('click', () => {
      const container = document.getElementById('page-preview-container');
      if (!container) return;
      
      // Find the last element (could be a page or marker)
      const lastChild = container.lastElementChild;
      if (lastChild) {
        const marker = createBlankPageMarker();
        container.appendChild(marker);
        initializePageThumbnailsSortable();
      }
    });
  }

  newTextModeBtn.addEventListener('click', () => {
    if (blankPageState.activeMode === 'text') return;
    
    // Only allow switching if PDF is uploaded
    if (!state.pdfDoc) return;

    blankPageState.activeMode = 'text';
    textPanel.classList.remove('hidden');
    visualPanel.classList.add('hidden');
    
    // Ensure controls are visible when switching to file mode
    const textControls = document.getElementById('text-mode-controls');
    const visualControls = document.getElementById('visual-mode-controls');
    if (textControls) textControls.style.display = '';
    if (visualControls) visualControls.style.display = 'none';

    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newTextModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newTextModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newVisualModeBtn.classList.remove('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newVisualModeBtn.classList.add('bg-gray-700', 'text-gray-300');
  });

  newVisualModeBtn.addEventListener('click', async () => {
    if (blankPageState.activeMode === 'visual') return;
    
    // Only allow switching if PDF is uploaded
    if (!state.pdfDoc) return;

    blankPageState.activeMode = 'visual';
    textPanel.classList.add('hidden');
    visualPanel.classList.remove('hidden');
    
    // Ensure controls are visible when switching to page mode
    const textControls = document.getElementById('text-mode-controls');
    const visualControls = document.getElementById('visual-mode-controls');
    if (visualControls) visualControls.style.display = '';
    if (textControls) textControls.style.display = 'none';

    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newVisualModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newVisualModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newTextModeBtn.classList.remove('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newTextModeBtn.classList.add('bg-gray-700', 'text-gray-300');

    await renderPageThumbnails();
  });

  if (wasInVisualMode) {
    blankPageState.activeMode = 'visual';
    textPanel.classList.add('hidden');
    visualPanel.classList.remove('hidden');
    
    // Show page mode controls
    const textControls = document.getElementById('text-mode-controls');
    const visualControls = document.getElementById('visual-mode-controls');
    if (visualControls) visualControls.style.display = '';
    if (textControls) textControls.style.display = 'none';

    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newVisualModeBtn.classList.add('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newVisualModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newTextModeBtn.classList.remove('bg-indigo-600', 'text-white');
    // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
    newTextModeBtn.classList.add('bg-gray-700', 'text-gray-300');

    await renderPageThumbnails();
  } else {
    // Default to page mode and auto-render thumbnails when PDF is loaded
    if (state.pdfDoc) {
      blankPageState.activeMode = 'visual';
      textPanel.classList.add('hidden');
      visualPanel.classList.remove('hidden');
      
      // Show page mode controls
      const textControlsEl = document.getElementById('text-mode-controls');
      const visualControlsEl = document.getElementById('visual-mode-controls');
      if (visualControlsEl) visualControlsEl.style.display = '';
      if (textControlsEl) textControlsEl.style.display = 'none';

      // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
      newVisualModeBtn.classList.add('bg-indigo-600', 'text-white');
      // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
      newVisualModeBtn.classList.remove('bg-gray-700', 'text-gray-300');
      // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
      newTextModeBtn.classList.remove('bg-indigo-600', 'text-white');
      // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
      newTextModeBtn.classList.add('bg-gray-700', 'text-gray-300');

      // Ensure DOM is ready before rendering
      await new Promise(resolve => setTimeout(resolve, 50));
      await renderPageThumbnails();
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
      newTextModeBtn.classList.add('bg-indigo-600', 'text-white');
      // @ts-expect-error TS(2339) FIXME: Property 'classList' does not exist on type 'Node'... Remove this comment to see the full error message
      newVisualModeBtn.classList.add('bg-gray-700', 'text-gray-300');
    }
  }
}
