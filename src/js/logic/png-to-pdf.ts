import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function pngToPdf() {
  if (state.files.length === 0) {
    showAlert(String(t('alerts.noFiles')), String(t('alerts.pleaseSelectPng')));
    return;
  }
  showLoader(String(t('alerts.convertingPngToPdf')));
  try {
    const pdfDoc = await PDFLibDocument.create();
    for (const file of state.files) {
      const pngBytes = await readFileAsArrayBuffer(file);
      const pngImage = await pdfDoc.embedPng(pngBytes as ArrayBuffer);
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
      'from_pngs.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(
      String(t('alerts.error')),
      String(t('alerts.couldNotConvertPngToPdf'))
    );
  } finally {
    hideLoader();
  }
}
