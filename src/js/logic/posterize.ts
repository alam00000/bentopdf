import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, parsePageRanges } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createIcons, icons } from 'lucide';

const posterizeState = {
  pdfJsDoc: null,
  pageSnapshots: {},
  currentPage: 1,
};

async function renderPosterizePreview(pageNum: number) {
  if (!posterizeState.pdfJsDoc) return;

  posterizeState.currentPage = pageNum;
  showLoader(`Rendering preview for page ${pageNum}...`);

  const canvas = document.getElementById(
    'posterize-preview-canvas'
  ) as HTMLCanvasElement;
  const context = canvas.getContext('2d');

  if (posterizeState.pageSnapshots[pageNum]) {
    canvas.width = posterizeState.pageSnapshots[pageNum].width;
    canvas.height = posterizeState.pageSnapshots[pageNum].height;
    context.putImageData(posterizeState.pageSnapshots[pageNum], 0, 0);
  } else {
    const page = await posterizeState.pdfJsDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    posterizeState.pageSnapshots[pageNum] = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  updatePreviewNav();
  drawGridOverlay();
  hideLoader();
}

function drawGridOverlay() {
  if (!posterizeState.pageSnapshots[posterizeState.currentPage]) return;

  const canvas = document.getElementById(
    'posterize-preview-canvas'
  ) as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  context.putImageData(
    posterizeState.pageSnapshots[posterizeState.currentPage],
    0,
    0
  );

  const pageRangeInput = (
    document.getElementById('page-range') as HTMLInputElement
  ).value;
  const pagesToProcess = parsePageRanges(
    pageRangeInput,
    posterizeState.pdfJsDoc.numPages
  );

  if (pagesToProcess.includes(posterizeState.currentPage - 1)) {
    const rows =
      parseInt(
        (document.getElementById('posterize-rows') as HTMLInputElement).value
      ) || 1;
    const cols =
      parseInt(
        (document.getElementById('posterize-cols') as HTMLInputElement).value
      ) || 1;

    context.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    context.lineWidth = 2;
    context.setLineDash([10, 5]);

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    for (let i = 1; i < cols; i++) {
      context.beginPath();
      context.moveTo(i * cellWidth, 0);
      context.lineTo(i * cellWidth, canvas.height);
      context.stroke();
    }

    for (let i = 1; i < rows; i++) {
      context.beginPath();
      context.moveTo(0, i * cellHeight);
      context.lineTo(canvas.width, i * cellHeight);
      context.stroke();
    }
    context.setLineDash([]);
  }
}

function updatePreviewNav() {
  const currentPageSpan = document.getElementById('current-preview-page');
  const prevBtn = document.getElementById(
    'prev-preview-page'
  ) as HTMLButtonElement;
  const nextBtn = document.getElementById(
    'next-preview-page'
  ) as HTMLButtonElement;

  currentPageSpan.textContent = posterizeState.currentPage.toString();
  prevBtn.disabled = posterizeState.currentPage <= 1;
  nextBtn.disabled =
    posterizeState.currentPage >= posterizeState.pdfJsDoc.numPages;
}

export async function setupPosterizeTool() {
  if (state.pdfDoc) {
    document.getElementById('total-pages').textContent = state.pdfDoc
      .getPageCount()
      .toString();
    const pdfBytes = await state.pdfDoc.save();
    posterizeState.pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes })
      .promise;
    posterizeState.pageSnapshots = {};
    posterizeState.currentPage = 1;

    document.getElementById('total-preview-pages').textContent =
      posterizeState.pdfJsDoc.numPages.toString();
    await renderPosterizePreview(1);

    document.getElementById('prev-preview-page').onclick = () =>
      renderPosterizePreview(posterizeState.currentPage - 1);
    document.getElementById('next-preview-page').onclick = () =>
      renderPosterizePreview(posterizeState.currentPage + 1);

    ['posterize-rows', 'posterize-cols', 'page-range'].forEach((id) => {
      document.getElementById(id).addEventListener('input', drawGridOverlay);
    });
    createIcons({ icons });
  }
}

export async function posterize() {
  showLoader('Posterizing PDF...');
  try {
    const rows =
      parseInt(
        (document.getElementById('posterize-rows') as HTMLInputElement).value
      ) || 1;
    const cols =
      parseInt(
        (document.getElementById('posterize-cols') as HTMLInputElement).value
      ) || 1;
    const pageSizeKey = (
      document.getElementById('output-page-size') as HTMLSelectElement
    ).value;
    let orientation = (
      document.getElementById('output-orientation') as HTMLSelectElement
    ).value;
    const scalingMode = (
      document.querySelector(
        'input[name="scaling-mode"]:checked'
      ) as HTMLInputElement
    ).value;
    const overlap =
      parseFloat(
        (document.getElementById('overlap') as HTMLInputElement).value
      ) || 0;
    const overlapUnits = (
      document.getElementById('overlap-units') as HTMLSelectElement
    ).value;
    const pageRangeInput = (
      document.getElementById('page-range') as HTMLInputElement
    ).value;

    let overlapInPoints = overlap;
    if (overlapUnits === 'in') overlapInPoints = overlap * 72;
    else if (overlapUnits === 'mm') overlapInPoints = overlap * (72 / 25.4);

    const newDoc = await PDFDocument.create();
    const totalPages = posterizeState.pdfJsDoc.numPages;
    const pageIndicesToProcess = parsePageRanges(pageRangeInput, totalPages);

    if (pageIndicesToProcess.length === 0) {
      throw new Error('Invalid page range specified.');
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    for (const pageIndex of pageIndicesToProcess) {
      const page = await posterizeState.pdfJsDoc.getPage(Number(pageIndex) + 1);
      const viewport = page.getViewport({ scale: 2.0 });
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      await page.render({ canvasContext: tempCtx, viewport }).promise;

      let [targetWidth, targetHeight] = PageSizes[pageSizeKey];
      let currentOrientation = orientation;

      if (currentOrientation === 'auto') {
        currentOrientation =
          viewport.width > viewport.height ? 'landscape' : 'portrait';
      }

      if (currentOrientation === 'landscape' && targetWidth < targetHeight) {
        [targetWidth, targetHeight] = [targetHeight, targetWidth];
      } else if (
        currentOrientation === 'portrait' &&
        targetWidth > targetHeight
      ) {
        [targetWidth, targetHeight] = [targetHeight, targetWidth];
      }

      const tileWidth = tempCanvas.width / cols;
      const tileHeight = tempCanvas.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * tileWidth - (c > 0 ? overlapInPoints : 0);
          const sy = r * tileHeight - (r > 0 ? overlapInPoints : 0);
          const sWidth =
            tileWidth +
            (c > 0 ? overlapInPoints : 0) +
            (c < cols - 1 ? overlapInPoints : 0);
          const sHeight =
            tileHeight +
            (r > 0 ? overlapInPoints : 0) +
            (r < rows - 1 ? overlapInPoints : 0);

          const tileCanvas = document.createElement('canvas');
          tileCanvas.width = sWidth;
          tileCanvas.height = sHeight;
          tileCanvas
            .getContext('2d')
            .drawImage(
              tempCanvas,
              sx,
              sy,
              sWidth,
              sHeight,
              0,
              0,
              sWidth,
              sHeight
            );

          const tileImage = await newDoc.embedPng(
            tileCanvas.toDataURL('image/png')
          );
          const newPage = newDoc.addPage([targetWidth, targetHeight]);

          const scaleX = newPage.getWidth() / sWidth;
          const scaleY = newPage.getHeight() / sHeight;
          const scale =
            scalingMode === 'fit'
              ? Math.min(scaleX, scaleY)
              : Math.max(scaleX, scaleY);

          const scaledWidth = sWidth * scale;
          const scaledHeight = sHeight * scale;

          newPage.drawImage(tileImage, {
            x: (newPage.getWidth() - scaledWidth) / 2,
            y: (newPage.getHeight() - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight,
          });
        }
      }
    }

    const newPdfBytes = await newDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'posterized.pdf'
    );
    showAlert('Success', 'Your PDF has been posterized.');
  } catch (e) {
    console.error(e);
    showAlert('Error', e.message || 'Could not posterize the PDF.');
  } finally {
    hideLoader();
  }
}
