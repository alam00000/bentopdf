import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';

export async function splitInHalf() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const splitType = document.getElementById('split-type').value;
  if (!state.pdfDoc) {
    showAlert(String(t('alerts.error')), String(t('alerts.noPdfLoaded')));
    return;
  }
  showLoader(String(t('alerts.splittingPdfPages')));
  try {
    const newPdfDoc = await PDFLibDocument.create();
    const pages = state.pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const originalPage = pages[i];
      const { width, height } = originalPage.getSize();
      const whiteColor = rgb(1, 1, 1); // For masking

      showLoader(String(t('alerts.processingPage', { current: i + 1, total: pages.length })));

      // Copy the page twice for all split types
      const [page1] = await newPdfDoc.copyPages(state.pdfDoc, [i]);
      const [page2] = await newPdfDoc.copyPages(state.pdfDoc, [i]);

      switch (splitType) {
        case 'vertical':
          page1.setCropBox(0, 0, width / 2, height);
          page2.setCropBox(width / 2, 0, width / 2, height);
          break;
        case 'horizontal':
          page1.setCropBox(0, height / 2, width, height / 2); // Top half
          page2.setCropBox(0, 0, width, height / 2); // Bottom half
          break;
      }
      newPdfDoc.addPage(page1);
      newPdfDoc.addPage(page2);
    }

    const newPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'split-half.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(String(t('alerts.error')), String(t('alerts.errorSplittingPdf')));
  } finally {
    hideLoader();
  }
}
