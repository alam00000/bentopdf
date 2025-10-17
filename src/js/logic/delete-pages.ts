import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function deletePages() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageInput = document.getElementById('pages-to-delete').value;
  if (!pageInput) {
    showAlert('Invalid Input', 'Please enter page numbers to delete.');
    return;
  }
  showLoader('Deleting pages...');
  try {
    const totalPages = state.pdfDoc.getPageCount();
    const indicesToDelete = new Set();
    const ranges = pageInput.split(',');

    for (const range of ranges) {
      const trimmedRange = range.trim();
      if (trimmedRange.includes('-')) {
        const [start, end] = trimmedRange.split('-').map(Number);
        if (
          isNaN(start) ||
          isNaN(end) ||
          start < 1 ||
          end > totalPages ||
          start > end
        )
          continue;
        for (let i = start; i <= end; i++) indicesToDelete.add(i - 1);
      } else {
        const pageNum = Number(trimmedRange);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
        indicesToDelete.add(pageNum - 1);
      }
    }

    if (indicesToDelete.size === 0) {
      showAlert('Invalid Input', 'No valid pages selected for deletion.');
      hideLoader();
      return;
    }
    if (indicesToDelete.size >= totalPages) {
      showAlert('Invalid Input', 'You cannot delete all pages.');
      hideLoader();
      return;
    }

    const indicesToKeep = Array.from(
      { length: totalPages },
      (_, i) => i
    ).filter((index) => !indicesToDelete.has(index));
    const newPdf = await PDFLibDocument.create();
    const copiedPages = await newPdf.copyPages(state.pdfDoc, indicesToKeep);
    copiedPages.forEach((page: any) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'deleted-pages.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not delete pages.');
  } finally {
    hideLoader();
  }
}
