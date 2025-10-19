import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import JSZip from 'jszip';

export async function reversePages() {
  const pdfDocs = Array.isArray(state.pdfDocs) ? state.pdfDocs : state.pdfDoc ? [state.pdfDoc] : [];
  if (!pdfDocs.length) {
    showAlert('Error', 'PDF not loaded.');
    return;
  }
  showLoader('Reversing page order...');
  try {
    const zip = new JSZip();
    for (let j = 0; j < pdfDocs.length; j++) {
      const pdfDoc = pdfDocs[j];
      const newPdf = await PDFLibDocument.create();
      const pageCount = pdfDoc.getPageCount();
      const reversedIndices = Array.from(
        { length: pageCount },
        (_, i) => pageCount - 1 - i
      );

      const copiedPages = await newPdf.copyPages(pdfDoc, reversedIndices);
      copiedPages.forEach((page: any) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const fileName = pdfDocs.length > 1 ? `reversed_${j + 1}.pdf` : 'reversed.pdf';
      zip.file(fileName, newPdfBytes);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'reversed_pdfs.zip');
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not reverse the PDF pages.');
  } finally {
    hideLoader();
  }
}
