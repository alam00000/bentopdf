import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';

export async function changeBackgroundColor() {
  if (!state.pdfDoc) {
    showAlert(String(t('alerts.error')), String(t('alerts.pdfNotLoaded')));
    return;
  }

  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const colorHex = document.getElementById('background-color').value;
  const color = hexToRgb(colorHex);

  showLoader(String(t('alerts.changingBackgroundColor')));
  try {
    const newPdfDoc = await PDFLibDocument.create();

    for (let i = 0; i < state.pdfDoc.getPageCount(); i++) {
      const [originalPage] = await newPdfDoc.copyPages(state.pdfDoc, [i]);
      const { width, height } = originalPage.getSize();

      const newPage = newPdfDoc.addPage([width, height]);

      newPage.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(color.r, color.g, color.b),
      });

      const embeddedPage = await newPdfDoc.embedPage(originalPage);
      newPage.drawPage(embeddedPage, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }

    const newPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'background-changed.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(String(t('alerts.error')), String(t('alerts.couldNotChangeBackground')));
  } finally {
    hideLoader();
  }
}
