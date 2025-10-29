import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

import { degrees } from 'pdf-lib';

export async function rotate() {
  showLoader(String(t('alerts.applyingRotations')));
  try {
    const pages = state.pdfDoc.getPages();
    document.querySelectorAll('.page-rotator-item').forEach((item) => {
      // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
      const pageIndex = parseInt(item.dataset.pageIndex);
      // @ts-expect-error TS(2339) FIXME: Property 'dataset' does not exist on type 'Element... Remove this comment to see the full error message
      const rotation = parseInt(item.dataset.rotation || '0');
      if (rotation !== 0) {
        const currentRotation = pages[pageIndex].getRotation().angle;
        pages[pageIndex].setRotation(degrees(currentRotation + rotation));
      }
    });

    const rotatedPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([rotatedPdfBytes], { type: 'application/pdf' }),
      'rotated.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert(String(t('alerts.error')), String(t('alerts.couldNotApplyRotations')));
  } finally {
    hideLoader();
  }
}
