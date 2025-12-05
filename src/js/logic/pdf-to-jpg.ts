import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFPageProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

export async function pdfToJpg() {
  showLoader('Converting to JPG...');
  await yieldToUI();
  try {
    const pdf = await getPDFDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    
    const qualityInput = document.getElementById('jpg-quality') as HTMLInputElement;
    const quality = qualityInput ? parseFloat(qualityInput.value) : 0.9;

    if(pdf.numPages === 1) {
      showLoader(`Processing the single page...`);
      await yieldToUI();
      const page = await pdf.getPage(1);
      const blob = await pageToBlob(page, quality);
      downloadFile(blob, getCleanFilename() + '.jpg');
    } else {
      const zip = new JSZip();
      for (let i = 1; i <= pdf.numPages; i++) {
        showLoader(`Processing page ${i} of ${pdf.numPages}...`);
        await yieldToUI();
        const page = await pdf.getPage(i);
        const blob = await pageToBlob(page, quality);
        zip.file(`page_${i}.jpg`, blob as Blob);
      }
      
      showLoader('Compressing files into a ZIP...');
      await yieldToUI();
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, getCleanFilename() + '_jpgs.zip');
    }
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert PDF to JPG. The file might be corrupted.'
    );
  } finally {
    hideLoader();
  }
}

async function pageToBlob(page: PDFPageProxy, quality: number): Promise<Blob> {
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport: viewport, canvas }).promise;

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  );
  return blob as Blob;
}

function getCleanFilename(): string {
  let clean = state.files[0].name.replace(/\.pdf$/i, '').trim();
  if (clean.length > 80) {
    clean = clean.slice(0, 80);
  }
  return clean;
}
