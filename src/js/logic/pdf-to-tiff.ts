import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';
import UTIF from 'utif';
import * as pdfjsLib from 'pdfjs-dist';

export async function pdfToTiff() {
  showLoader('Converting PDF to TIFF...');
  try {
    const pdf = await pdfjsLib.getDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const zip = new JSZip();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
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

      zip.file(`page_${i}.tiff`, tiffBuffer);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'converted_tiff_images.zip');
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
