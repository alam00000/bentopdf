import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import JSZip from 'jszip';

export async function reversePages() {
  const pdfDocs = state.files.filter((file: File) => file.type === 'application/pdf');
  if (!pdfDocs.length) {
    showAlert('Error', 'PDF not loaded.');
    return;
  }
  showLoader('Reversing page order...');
  try {
    const zip = new JSZip();
    for (let j = 0; j < pdfDocs.length; j++) {
      const file = pdfDocs[j];
      const arrayBuffer = await file.arrayBuffer(); 
      const pdfDoc = await PDFLibDocument.load(arrayBuffer);
      const newPdf = await PDFLibDocument.create();
      const pageCount = pdfDoc.getPageCount();
      const reversedIndices = Array.from(
        { length: pageCount },
        (_, i) => pageCount - 1 - i
      );

      const copiedPages = await newPdf.copyPages(pdfDoc, reversedIndices);
      copiedPages.forEach((page: any) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const originalName = file.name.replace(/\.pdf$/i, '');
      const fileName = `${originalName}_reversed.pdf`;
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
