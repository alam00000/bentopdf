import { showLoader, hideLoader, showAlert } from '../ui.js';
import { readFileAsArrayBuffer } from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';

const state = {
  pdfDoc1: null,
  pdfDoc2: null,
  currentPage: 1,
  viewMode: 'overlay',
  isSyncScroll: true,
};

/**
 * Renders a PDF page to fit the width of its container.
 * @param {PDFDocumentProxy} pdfDoc - The loaded PDF document from pdf.js.
 * @param {number} pageNum - The page number to render.
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
 * @param {HTMLElement} container - The container to fit the canvas into.
 */
async function renderPage(
  pdfDoc: any,
  pageNum: any,
  canvas: any,
  container: any
) {
  const page = await pdfDoc.getPage(pageNum);

  // Calculate scale to fit the container width.
  const containerWidth = container.clientWidth - 2; // Subtract border width
  const viewport = page.getViewport({ scale: 1.0 });
  const scale = containerWidth / viewport.width;
  const scaledViewport = page.getViewport({ scale: scale });

  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport: scaledViewport,
  }).promise;
}

async function renderBothPages() {
  if (!state.pdfDoc1 || !state.pdfDoc2) return;

  showLoader(`Loading page ${state.currentPage}...`);

  const canvas1 = document.getElementById('canvas-compare-1');
  const canvas2 = document.getElementById('canvas-compare-2');
  const panel1 = document.getElementById('panel-1');
  const panel2 = document.getElementById('panel-2');
  const wrapper = document.getElementById('compare-viewer-wrapper');

  // Determine the correct container based on the view mode
  const container1 = state.viewMode === 'overlay' ? wrapper : panel1;
  const container2 = state.viewMode === 'overlay' ? wrapper : panel2;

  await Promise.all([
    renderPage(
      state.pdfDoc1,
      Math.min(state.currentPage, state.pdfDoc1.numPages),
      canvas1,
      container1
    ),
    renderPage(
      state.pdfDoc2,
      Math.min(state.currentPage, state.pdfDoc2.numPages),
      canvas2,
      container2
    ),
  ]);

  updateNavControls();
  hideLoader();
}

function updateNavControls() {
  const maxPages = Math.max(
    state.pdfDoc1?.numPages || 0,
    state.pdfDoc2?.numPages || 0
  );
  // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
  document.getElementById('current-page-display-compare').textContent =
    state.currentPage;
  // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
  document.getElementById('total-pages-display-compare').textContent = maxPages;
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('prev-page-compare').disabled =
    state.currentPage <= 1;
  // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
  document.getElementById('next-page-compare').disabled =
    state.currentPage >= maxPages;
}

async function setupFileInput(inputId: any, docKey: any, displayId: any) {
  const fileInput = document.getElementById(inputId);
  const dropZone = document.getElementById(`drop-zone-${inputId.slice(-1)}`);

  const handleFile = async (file: any) => {
    if (!file || file.type !== 'application/pdf')
      return showAlert('Invalid File', 'Please select a valid PDF file.');

    const displayDiv = document.getElementById(displayId);
    displayDiv.textContent = '';

    // 2. Create the icon element
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'check-circle');
    icon.className = 'w-10 h-10 mb-3 text-green-500';

    // 3. Create the paragraph element for the file name
    const p = document.createElement('p');
    p.className = 'text-sm text-gray-300 truncate';

    // 4. Set the file name safely using textContent
    p.textContent = file.name;

    // 5. Append the safe elements to the container
    displayDiv.append(icon, p);
    createIcons({ icons });

    try {
      showLoader(`Loading ${file.name}...`);
      const pdfBytes = await readFileAsArrayBuffer(file);
      // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
      state[docKey] = await pdfjsLib.getDocument(pdfBytes).promise;

      if (state.pdfDoc1 && state.pdfDoc2) {
        document.getElementById('compare-viewer').classList.remove('hidden');
        state.currentPage = 1;
        await renderBothPages();
      }
    } catch (e) {
      showAlert(
        'Error',
        'Could not load PDF. It may be corrupt or password-protected.'
      );
      console.error(e);
    } finally {
      hideLoader();
    }
  };

  // @ts-expect-error TS(2339) FIXME: Property 'files' does not exist on type 'EventTarg... Remove this comment to see the full error message
  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  dropZone.addEventListener('dragover', (e) => e.preventDefault());
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  });
}

/**
 * Toggles the UI between Overlay and Side-by-Side views.
 * @param {'overlay' | 'side-by-side'} mode
 */
function setViewMode(mode: any) {
  state.viewMode = mode;
  const wrapper = document.getElementById('compare-viewer-wrapper');
  const overlayControls = document.getElementById('overlay-controls');
  const sideControls = document.getElementById('side-by-side-controls');
  const btnOverlay = document.getElementById('view-mode-overlay');
  const btnSide = document.getElementById('view-mode-side');
  const canvas2 = document.getElementById('canvas-compare-2');
  const opacitySlider = document.getElementById('opacity-slider');

  if (mode === 'overlay') {
    wrapper.className = 'compare-viewer-wrapper overlay-mode';
    overlayControls.classList.remove('hidden');
    sideControls.classList.add('hidden');
    btnOverlay.classList.add('bg-indigo-600');
    btnSide.classList.remove('bg-indigo-600');
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    canvas2.style.opacity = opacitySlider.value;
  } else {
    wrapper.className = 'compare-viewer-wrapper side-by-side-mode';
    overlayControls.classList.add('hidden');
    sideControls.classList.remove('hidden');
    btnOverlay.classList.remove('bg-indigo-600');
    btnSide.classList.add('bg-indigo-600');
    // CHANGE: When switching to side-by-side, reset the canvas opacity to 1.
    canvas2.style.opacity = '1';
  }
  renderBothPages();
}

export function setupCompareTool() {
  setupFileInput('file-input-1', 'pdfDoc1', 'file-display-1');
  setupFileInput('file-input-2', 'pdfDoc2', 'file-display-2');

  document.getElementById('prev-page-compare').addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderBothPages();
    }
  });
  document.getElementById('next-page-compare').addEventListener('click', () => {
    const maxPages = Math.max(state.pdfDoc1.numPages, state.pdfDoc2.numPages);
    if (state.currentPage < maxPages) {
      state.currentPage++;
      renderBothPages();
    }
  });

  document
    .getElementById('view-mode-overlay')
    .addEventListener('click', () => setViewMode('overlay'));
  document
    .getElementById('view-mode-side')
    .addEventListener('click', () => setViewMode('side-by-side'));

  const canvas2 = document.getElementById('canvas-compare-2');
  document.getElementById('flicker-btn').addEventListener('click', () => {
    canvas2.style.transition = 'opacity 150ms ease-in-out';
    canvas2.style.opacity = canvas2.style.opacity === '0' ? '1' : '0';
  });
  document.getElementById('opacity-slider').addEventListener('input', (e) => {
    canvas2.style.transition = '';
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'EventTarg... Remove this comment to see the full error message
    canvas2.style.opacity = e.target.value;
  });

  const panel1 = document.getElementById('panel-1');
  const panel2 = document.getElementById('panel-2');
  const syncToggle = document.getElementById('sync-scroll-toggle');
  (syncToggle as HTMLInputElement).addEventListener('change', () => {
    state.isSyncScroll = (syncToggle as HTMLInputElement).checked;
  });

  let scrollingPanel: any = null;
  panel1.addEventListener('scroll', () => {
    if (state.isSyncScroll && scrollingPanel !== panel2) {
      scrollingPanel = panel1;
      panel2.scrollTop = panel1.scrollTop;
      setTimeout(() => (scrollingPanel = null), 100);
    }
  });
  panel2.addEventListener('scroll', () => {
    if (state.isSyncScroll && scrollingPanel !== panel1) {
      scrollingPanel = panel2;
      panel1.scrollTop = panel2.scrollTop;
      setTimeout(() => (scrollingPanel = null), 100);
    }
  });
}
