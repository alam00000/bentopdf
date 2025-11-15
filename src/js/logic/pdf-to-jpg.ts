import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

export async function pdfToJpg() {
  showLoader('Converting to JPG...');
  try {
    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const zip = new JSZip();

    const qualityInput = document.getElementById('jpg-quality') as HTMLInputElement;
    const quality = qualityInput ? parseFloat(qualityInput.value) : 0.9;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
      );
      zip.file(`page_${i}.jpg`, blob as Blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'converted_images.zip');
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
