import { showLoader, hideLoader, showAlert } from '../ui.js';
import {
  downloadFile,
  readFileAsArrayBuffer,
  getPDFDocument,
} from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function pdfToPng() {
  showLoader('Converting to PNG...');
  try {
    const pdf = await getPDFDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;

    const qualityInput = document.getElementById(
      'png-quality'
    ) as HTMLInputElement;
    const scale = qualityInput ? parseFloat(qualityInput.value) : 2.0;

    if (pdf.numPages === 1) {
      downloadFile(
        await pageToBlob(await pdf.getPage(1), scale),
        getCleanFilename(state.files[0].name) + '.png'
      );
    } else {
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        zip.file(`page_${i}.png`, await pageToBlob(page, scale));
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(
        zipBlob,
        getCleanFilename(state.files[0].name) + '_pngs.zip'
      );
    }
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to convert PDF to PNG.');
  } finally {
    hideLoader();
  }
}

async function pageToBlob(page: PDFPageProxy, scale: number): Promise<Blob> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  const context = canvas.getContext('2d');
  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas,
  }).promise;
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
  return blob as Blob;
}

function getCleanFilename(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '');
}