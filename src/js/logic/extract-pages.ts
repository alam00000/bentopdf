import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function extractPages() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageInput = document.getElementById('pages-to-extract').value;
  if (!pageInput.trim()) {
    showAlert('Invalid Input', 'Please enter page numbers to extract.');
    return;
  }
  showLoader('Extracting pages...');
  try {
    const totalPages = state.pdfDoc.getPageCount();
    const indicesToExtract = new Set();
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
        for (let i = start; i <= end; i++) indicesToExtract.add(i - 1);
      } else {
        const pageNum = Number(trimmedRange);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) continue;
        indicesToExtract.add(pageNum - 1);
      }
    }

    if (indicesToExtract.size === 0) {
      showAlert('Invalid Input', 'No valid pages selected for extraction.');
      hideLoader();
      return;
    }

    const zip = new JSZip();
    // @ts-expect-error TS(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    const sortedIndices = Array.from(indicesToExtract).sort((a, b) => a - b);

    for (const index of sortedIndices) {
      const newPdf = await PDFLibDocument.create();
      const [copiedPage] = await newPdf.copyPages(state.pdfDoc, [
        index as number,
      ]);
      newPdf.addPage(copiedPage);
      const newPdfBytes = await newPdf.save();
      // @ts-expect-error TS(2365) FIXME: Operator '+' cannot be applied to types 'unknown' ... Remove this comment to see the full error message
      zip.file(`page-${index + 1}.pdf`, newPdfBytes);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, 'extracted-pages.zip');
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not extract pages.');
  } finally {
    hideLoader();
  }
}
