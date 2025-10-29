import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

export function flattenFormsInDoc(pdfDoc) {
  const form = pdfDoc.getForm();
  form.flatten();
}

export async function flatten() {
  if (!state.pdfDoc) {
    showAlert(String(t('alerts.error')), String(t('alerts.pdfNotLoaded')));
    return;
  }
  showLoader(String(t('alerts.flatteningPdf')));
  try {
    flattenFormsInDoc(state.pdfDoc);

    const flattenedBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([flattenedBytes], { type: 'application/pdf' }),
      'flattened.pdf'
    );
  } catch (e) {
    console.error(e);
    if (e.message.includes('getForm')) {
      showAlert(
        String(t('alerts.error')),
        'This PDF does not contain any form fields to flatten.'
      );
    } else {
      showAlert(String(t('alerts.error')), String(t('alerts.couldNotFlatten')));
    }
  } finally {
    hideLoader();
  }
}
