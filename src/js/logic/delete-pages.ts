import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';
import { t } from '../i18n/index.js';

import { PDFDocument as PDFLibDocument } from 'pdf-lib';

export async function deletePages() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageInput = document.getElementById('pages-to-delete').value;
  if (!pageInput) {
    showAlert(String(t('alerts.invalidInput')), String(t('alerts.enterPagesToDelete')));
    return;
  }
  showLoader(String(t('alerts.deletingPages')));
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
      showAlert(String(t('alerts.invalidInput')), String(t('alerts.noValidPagesSelected')));
      hideLoader();
      return;
    }
    if (indicesToDelete.size >= totalPages) {
      showAlert(String(t('alerts.invalidInput')), String(t('alerts.cannotDeleteAllPages')));
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
    showAlert(String(t('alerts.error')), String(t('alerts.couldNotDeletePages')));
  } finally {
    hideLoader();
  }
}
