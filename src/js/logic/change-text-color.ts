import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  hexToRgb,
  readFileAsArrayBuffer,
  getPDFDocument,
} from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();


let isRenderingPreview = false;
let renderTimeout: any;

async function updateTextColorPreview() {
  if (isRenderingPreview) return;
  isRenderingPreview = true;

  try {
    const textColorCanvas = document.getElementById('text-color-canvas') as HTMLCanvasElement;
    if (!textColorCanvas) return;

    const pdf = await getPDFDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const page = await pdf.getPage(1); // Preview first page
    const viewport = page.getViewport({ scale: 0.8 });
    const context = textColorCanvas.getContext('2d');

    textColorCanvas.width = viewport.width;
    textColorCanvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport, canvas: textColorCanvas }).promise;
    const imageData = context.getImageData(
      0,
      0,
      textColorCanvas.width,
      textColorCanvas.height
    );
    const data = imageData.data;
    const colorHex = (
      document.getElementById('text-color-input') as HTMLInputElement
    ).value;
    const { r, g, b } = hexToRgb(colorHex);
    const darknessThreshold = 120;

    for (let i = 0; i < data.length; i += 4) {
      if (
        data[i] < darknessThreshold &&
        data[i + 1] < darknessThreshold &&
        data[i + 2] < darknessThreshold
      ) {
        data[i] = r * 255;
        data[i + 1] = g * 255;
        data[i + 2] = b * 255;
      }
    }
    context.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error updating preview:', error);
  } finally {
    isRenderingPreview = false;
  }
}

export async function setupTextColorTool() {
  const originalCanvas = document.getElementById('original-canvas');
  const colorInput = document.getElementById('text-color-input');

  if (!originalCanvas || !colorInput) return;

  // Debounce the preview update for performance
  colorInput.addEventListener('input', () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(updateTextColorPreview, 250);
  });

  const pdf = await getPDFDocument(
    await readFileAsArrayBuffer(state.files[0])
  ).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.8 });

  (originalCanvas as HTMLCanvasElement).width = viewport.width;
  (originalCanvas as HTMLCanvasElement).height = viewport.height;

  await page.render({
    canvasContext: (originalCanvas as HTMLCanvasElement).getContext('2d'),
    viewport,
    canvas: originalCanvas as HTMLCanvasElement,
  }).promise;
  await updateTextColorPreview();
}

export async function changeTextColor() {
  if (!state.pdfDoc) {
    showAlert('Error', 'PDF not loaded.');
    return;
  }

  const colorHex = (document.getElementById('text-color-input') as HTMLInputElement).value;
  const { r, g, b } = hexToRgb(colorHex);
  const darknessThreshold = 120;

  showLoader('Changing text color...');
  try {
    const newPdfDoc = await PDFLibDocument.create();
    const pdf = await getPDFDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      showLoader(`Processing page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // High resolution for quality

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let j = 0; j < data.length; j += 4) {
        if (
          data[j] < darknessThreshold &&
          data[j + 1] < darknessThreshold &&
          data[j + 2] < darknessThreshold
        ) {
          data[j] = r * 255;
          data[j + 1] = g * 255;
          data[j + 2] = b * 255;
        }
      }
      context.putImageData(imageData, 0, 0);

      const pngImageBytes = await new Promise<Uint8Array>((resolve) =>
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
          reader.readAsArrayBuffer(blob!);
        }, 'image/png')
      );

      const pngImage = await newPdfDoc.embedPng(pngImageBytes);
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    const newPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'text-color-changed.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not change text color.');
  } finally {
    hideLoader();
  }
}
