import { showLoader, hideLoader, showAlert } from './ui.js';
import { state } from './state.js';
import { toolLogic } from './logic/index.js';
import { icons, createIcons } from 'lucide';

const editorState = {
  pdf: null,
  canvas: null,
  context: null,
  container: null,
  currentPageNum: 1,
  pageRendering: false,
  pageNumPending: null,
  scale: 1.0,
  pageSnapshot: null,
  isDrawing: false,
  startX: 0,
  startY: 0,
  cropBoxes: {},
  lastInteractionRect: null, // Used to store the rectangle from the last move event
};

/**
 * Calculates the best scale to fit the page within the container.
 * @param {PDFPageProxy} page - The PDF.js page object.
 */
function calculateFitScale(page: any) {
  const containerWidth = editorState.container.clientWidth;
  const viewport = page.getViewport({ scale: 1.0 });
  return containerWidth / viewport.width;
}

/**
 * Renders a specific page of the PDF onto the canvas.
 * @param {number} num The page number to render.
 */
async function renderPage(num: any) {
  editorState.pageRendering = true;
  showLoader(`Loading page ${num}...`);

  try {
    const page = await editorState.pdf.getPage(num);

    // @ts-expect-error TS(2367) FIXME: This condition will always return 'false' since th... Remove this comment to see the full error message
    if (editorState.scale === 'fit') {
      editorState.scale = calculateFitScale(page);
    }

    const viewport = page.getViewport({ scale: editorState.scale });
    editorState.canvas.height = viewport.height;
    editorState.canvas.width = viewport.width;

    const renderContext = {
      canvasContext: editorState.context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    editorState.pageSnapshot = editorState.context.getImageData(
      0,
      0,
      editorState.canvas.width,
      editorState.canvas.height
    );
    redrawShapes();
  } catch (error) {
    console.error('Error rendering page:', error);
    showAlert('Render Error', 'Could not display the page.');
  } finally {
    editorState.pageRendering = false;
    hideLoader();

    document.getElementById('current-page-display').textContent = num;
    // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
    document.getElementById('prev-page').disabled = num <= 1;
    // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
    document.getElementById('next-page').disabled =
      num >= editorState.pdf.numPages;

    if (editorState.pageNumPending !== null) {
      const pendingPage = editorState.pageNumPending;
      editorState.pageNumPending = null;
      queueRenderPage(pendingPage);
    }
  }
}

function queueRenderPage(num: any) {
  if (editorState.pageRendering) {
    editorState.pageNumPending = num;
  } else {
    editorState.currentPageNum = num;
    renderPage(num);
  }
}

function redrawShapes() {
  if (editorState.pageSnapshot) {
    editorState.context.putImageData(editorState.pageSnapshot, 0, 0);
  }

  const currentCropBox = editorState.cropBoxes[editorState.currentPageNum - 1];
  if (currentCropBox) {
    editorState.context.strokeStyle = 'rgba(79, 70, 229, 0.9)';
    editorState.context.lineWidth = 2;
    editorState.context.setLineDash([8, 4]);
    editorState.context.strokeRect(
      currentCropBox.x,
      currentCropBox.y,
      currentCropBox.width,
      currentCropBox.height
    );
    editorState.context.setLineDash([]);
  }
}

function getEventCoordinates(e: any) {
  const rect = editorState.canvas.getBoundingClientRect();
  const touch = e.touches ? e.touches[0] : e;
  const scaleX = editorState.canvas.width / rect.width;
  const scaleY = editorState.canvas.height / rect.height;
  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  };
}

function handleInteractionStart(e: any) {
  e.preventDefault();
  const coords = getEventCoordinates(e);
  editorState.isDrawing = true;
  editorState.startX = coords.x;
  editorState.startY = coords.y;
}

function handleInteractionMove(e: any) {
  if (!editorState.isDrawing) return;
  e.preventDefault();

  redrawShapes();
  const coords = getEventCoordinates(e);

  const x = Math.min(editorState.startX, coords.x);
  const y = Math.min(editorState.startY, coords.y);
  const width = Math.abs(editorState.startX - coords.x);
  const height = Math.abs(editorState.startY - coords.y);

  editorState.context.strokeStyle = 'rgba(79, 70, 229, 0.9)';
  editorState.context.lineWidth = 2;
  editorState.context.setLineDash([8, 4]);
  editorState.context.strokeRect(x, y, width, height);
  editorState.context.setLineDash([]);

  // Store the last valid rectangle drawn during the move event
  editorState.lastInteractionRect = { x, y, width, height };
}

function handleInteractionEnd() {
  if (!editorState.isDrawing) return;
  editorState.isDrawing = false;

  const finalRect = editorState.lastInteractionRect;

  if (!finalRect || finalRect.width < 5 || finalRect.height < 5) {
    redrawShapes(); // Redraw to clear any invalid, tiny box
    editorState.lastInteractionRect = null;
    return;
  }

  editorState.cropBoxes[editorState.currentPageNum - 1] = {
    ...finalRect,
    scale: editorState.scale,
  };

  editorState.lastInteractionRect = null; // Reset for the next drawing action
  redrawShapes();
}

export async function setupCanvasEditor(toolId: any) {
  editorState.canvas = document.getElementById('canvas-editor');
  if (!editorState.canvas) return;
  editorState.container = document.getElementById('canvas-container');
  editorState.context = editorState.canvas.getContext('2d');

  const pageNav = document.getElementById('page-nav');
  const pdfData = await state.pdfDoc.save();
  // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
  editorState.pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  editorState.cropBoxes = {};
  editorState.currentPageNum = 1;
  // @ts-expect-error TS(2322) FIXME: Type 'string' is not assignable to type 'number'.
  editorState.scale = 'fit';

  pageNav.textContent = '';

  const prevButton = document.createElement('button');
  prevButton.id = 'prev-page';
  prevButton.className =
    'btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50';
  prevButton.innerHTML = '<i data-lucide="chevron-left"></i>';

  const pageInfo = document.createElement('span');
  pageInfo.className = 'text-white font-medium';

  const currentPageDisplay = document.createElement('span');
  currentPageDisplay.id = 'current-page-display';
  currentPageDisplay.textContent = '1';

  pageInfo.append(
    'Page ',
    currentPageDisplay,
    ` of ${editorState.pdf.numPages}`
  );

  const nextButton = document.createElement('button');
  nextButton.id = 'next-page';
  nextButton.className =
    'btn p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50';
  nextButton.innerHTML = '<i data-lucide="chevron-right"></i>';

  pageNav.append(prevButton, pageInfo, nextButton);

  createIcons({ icons });

  document.getElementById('prev-page').addEventListener('click', () => {
    if (editorState.currentPageNum > 1)
      queueRenderPage(editorState.currentPageNum - 1);
  });
  document.getElementById('next-page').addEventListener('click', () => {
    if (editorState.currentPageNum < editorState.pdf.numPages)
      queueRenderPage(editorState.currentPageNum + 1);
  });

  // To prevent stacking multiple listeners, we replace the canvas element with a clone
  const newCanvas = editorState.canvas.cloneNode(true);
  editorState.canvas.parentNode.replaceChild(newCanvas, editorState.canvas);
  editorState.canvas = newCanvas;
  editorState.context = newCanvas.getContext('2d');

  // Mouse Events
  editorState.canvas.addEventListener('mousedown', handleInteractionStart);
  editorState.canvas.addEventListener('mousemove', handleInteractionMove);
  editorState.canvas.addEventListener('mouseup', handleInteractionEnd);
  editorState.canvas.addEventListener('mouseleave', handleInteractionEnd);

  // Touch Events
  editorState.canvas.addEventListener('touchstart', handleInteractionStart, {
    passive: false,
  });
  editorState.canvas.addEventListener('touchmove', handleInteractionMove, {
    passive: false,
  });
  editorState.canvas.addEventListener('touchend', handleInteractionEnd);

  if (toolId === 'crop') {
    document.getElementById('zoom-in-btn').onclick = () => {
      editorState.scale += 0.25;
      renderPage(editorState.currentPageNum);
    };
    document.getElementById('zoom-out-btn').onclick = () => {
      if (editorState.scale > 0.25) {
        editorState.scale -= 0.25;
        renderPage(editorState.currentPageNum);
      }
    };
    document.getElementById('fit-page-btn').onclick = async () => {
      const page = await editorState.pdf.getPage(editorState.currentPageNum);
      editorState.scale = calculateFitScale(page);
      renderPage(editorState.currentPageNum);
    };
    document.getElementById('clear-crop-btn').onclick = () => {
      delete editorState.cropBoxes[editorState.currentPageNum - 1];
      redrawShapes();
    };
    document.getElementById('clear-all-crops-btn').onclick = () => {
      editorState.cropBoxes = {};
      redrawShapes();
    };

    document.getElementById('process-btn').onclick = async () => {
      if (Object.keys(editorState.cropBoxes).length === 0) {
        showAlert(
          'No Area Selected',
          'Please draw a rectangle on at least one page to select the crop area.'
        );
        return;
      }
      const success = await toolLogic['crop-pdf'].process(
        editorState.cropBoxes
      );
      if (success) {
        showAlert(
          'Success!',
          'Your PDF has been cropped and the download has started.'
        );
      }
    };
  }

  queueRenderPage(1);
}
