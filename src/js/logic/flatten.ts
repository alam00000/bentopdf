import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

export async function flatten() {
  if (!state.pdfDoc) {
    showAlert('Error', 'PDF not loaded.');
    return;
  }
  showLoader('Flattening PDF...');
  try {
    const form = state.pdfDoc.getForm();
    form.flatten();

    const flattenedBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([flattenedBytes], { type: 'application/pdf' }),
      'flattened.pdf'
    );
  } catch (e) {
    console.error(e);
    if (e.message.includes('getForm')) {
      showAlert(
        'No Form Found',
        'This PDF does not contain any form fields to flatten.'
      );
    } else {
      showAlert('Error', 'Could not flatten the PDF.');
    }
  } finally {
    hideLoader();
  }
}
