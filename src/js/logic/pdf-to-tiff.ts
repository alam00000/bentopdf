import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';
import UTIF from 'utif';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export async function pdfToTiff() {
  showLoader('Converting PDF to TIFF...');
  try {
    const pdf = await getPDFDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    
    if(pdf.numPages === 1) {
      const page = await pdf.getPage(1);
      const tiffBuffer = await pageToBlob(page);
      downloadFile(tiffBuffer, getCleanFilename() + '.tiff');
    } else {
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tiffBuffer = await pageToBlob(page);
        zip.file(`page_${i}.tiff`, tiffBuffer);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, getCleanFilename() + '_tiffs.zip');
    }
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert PDF to TIFF. The file might be corrupted.'
    );
  } finally {
    hideLoader();
  }
}


async function pageToBlob(page: PDFPageProxy): Promise<Blob> {
  const viewport = page.getViewport({ scale: 2.0 }); // Use 2x scale for high quality
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }).promise;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const rgba = imageData.data;
  const tiffBuffer = UTIF.encodeImage(
    new Uint8Array(rgba),
    canvas.width,
    canvas.height
  );
  return new Blob([tiffBuffer]);
}

function getCleanFilename(): string {
  let clean = state.files[0].name.replace(/\.pdf$/i, '').trim();
  if (clean.length > 80) {
    clean = clean.slice(0, 80);
  }
  return clean;
}
