import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

export async function removeMetadata() {
  showLoader('Removing all metadata...');
  try {
    const infoDict = state.pdfDoc.getInfoDict();

    const allKeys = infoDict.keys();
    allKeys.forEach((key: any) => {
      infoDict.delete(key);
    });

    state.pdfDoc.setTitle('');
    state.pdfDoc.setAuthor('');
    state.pdfDoc.setSubject('');
    state.pdfDoc.setKeywords([]);
    state.pdfDoc.setCreator('');
    state.pdfDoc.setProducer('');

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'metadata-removed.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'An error occurred while trying to remove metadata.');
  } finally {
    hideLoader();
  }
}
