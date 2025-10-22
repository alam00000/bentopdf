import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFName } from 'pdf-lib';

export function removeMetadataFromDoc(pdfDoc) {
  const infoDict = pdfDoc.getInfoDict();
  const allKeys = infoDict.keys();
  allKeys.forEach((key: any) => {
    infoDict.delete(key);
  });

  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');

  try {
    const catalogDict = pdfDoc.catalog.dict;
    if (catalogDict.has(PDFName.of('Metadata'))) {
      catalogDict.delete(PDFName.of('Metadata'));
    }
  } catch (e) {
    console.warn('Could not remove XMP metadata:', e.message);
  }

  try {
    const context = pdfDoc.context;
    if (context.trailerInfo) {
      delete context.trailerInfo.ID;
    }
  } catch (e) {
    console.warn('Could not remove document IDs:', e.message);
  }

  try {
    const catalogDict = pdfDoc.catalog.dict;
    if (catalogDict.has(PDFName.of('PieceInfo'))) {
      catalogDict.delete(PDFName.of('PieceInfo'));
    }
  } catch (e) {
    console.warn('Could not remove PieceInfo:', e.message);
  }
}

export async function removeMetadata() {
  showLoader('Removing all metadata...');
  try {
    removeMetadataFromDoc(state.pdfDoc);

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
