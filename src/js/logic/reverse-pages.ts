import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function reversePages() {
  if (!state.pdfDoc) {
    showAlert('Error', 'PDF not loaded.');
    return;
  }
  showLoader('Reversing page order...');
  try {
    const newPdf = await PDFLibDocument.create();
    const pageCount = state.pdfDoc.getPageCount();
    const reversedIndices = Array.from(
      { length: pageCount },
      (_, i) => pageCount - 1 - i
    );

    const copiedPages = await newPdf.copyPages(state.pdfDoc, reversedIndices);
    copiedPages.forEach((page: any) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'reversed.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not reverse the PDF pages.');
  } finally {
    hideLoader();
  }
}
