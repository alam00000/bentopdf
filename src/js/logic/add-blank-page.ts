import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function addBlankPage() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageNumberInput = document.getElementById('page-number').value;
  if (pageNumberInput.trim() === '') {
    showAlert('Invalid Input', 'Please enter a page number.');
    return;
  }

  const position = parseInt(pageNumberInput);
  const totalPages = state.pdfDoc.getPageCount();
  if (isNaN(position) || position < 0 || position > totalPages) {
    showAlert(
      'Invalid Input',
      `Please enter a number between 0 and ${totalPages}.`
    );
    return;
  }

  showLoader('Adding page...');
  try {
    const newPdf = await PDFLibDocument.create();
    const { width, height } = state.pdfDoc.getPage(0).getSize();
    const allIndices = Array.from({ length: totalPages }, (_, i) => i);

    const indicesBefore = allIndices.slice(0, position);
    const indicesAfter = allIndices.slice(position);

    if (indicesBefore.length > 0) {
      const copied = await newPdf.copyPages(state.pdfDoc, indicesBefore);
      copied.forEach((p: any) => newPdf.addPage(p));
    }

    newPdf.addPage([width, height]);

    if (indicesAfter.length > 0) {
      const copied = await newPdf.copyPages(state.pdfDoc, indicesAfter);
      copied.forEach((p: any) => newPdf.addPage(p));
    }

    const newPdfBytes = await newPdf.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'page-added.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not add a blank page.');
  } finally {
    hideLoader();
  }
}
