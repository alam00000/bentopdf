import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import heic2any from 'heic2any';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function heicToPdf() {
  if (state.files.length === 0) {
    showAlert('No Files', 'Please select at least one HEIC file.');
    return;
  }
  showLoader('Converting HEIC to PDF...');
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of state.files) {
      const conversionResult = await heic2any({
        blob: file,
        toType: 'image/png',
      });
      const pngBlob = Array.isArray(conversionResult)
        ? conversionResult[0]
        : conversionResult;
      const pngBytes = await pngBlob.arrayBuffer();

      const pngImage = await pdfDoc.embedPng(pngBytes);
      const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    }
    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'from_heic.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Failed to convert HEIC to PDF. One of the files may be invalid or unsupported.'
    );
  } finally {
    hideLoader();
  }
}
