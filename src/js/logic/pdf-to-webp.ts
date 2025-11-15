import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

export async function pdfToWebp() {
  showLoader('Converting to WebP...');
  try {
    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const zip = new JSZip();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      const qualityInput = document.getElementById('webp-quality') as HTMLInputElement;
      const quality = qualityInput ? parseFloat(qualityInput.value) : 0.9;
      
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/webp', quality)
      );
      zip.file(`page_${i}.webp`, blob as Blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'converted_webp.zip');
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to convert PDF to WebP.');
  } finally {
    hideLoader();
  }
}
