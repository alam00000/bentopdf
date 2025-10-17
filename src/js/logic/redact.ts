import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { state } from '../state.js';

// @ts-expect-error TS(2339) FIXME: Property 'PDFLib' does not exist on type 'Window &... Remove this comment to see the full error message
const { rgb } = window.PDFLib;

export async function redact(redactions: any, canvasScale: any) {
  showLoader('Applying redactions...');
  try {
    const pdfPages = state.pdfDoc.getPages();
    const conversionScale = 1 / canvasScale;

    redactions.forEach((r: any) => {
      const page = pdfPages[r.pageIndex];
      const { height: pageHeight } = page.getSize();

      // Convert canvas coordinates back to PDF coordinates
      const pdfX = r.canvasX * conversionScale;
      const pdfWidth = r.canvasWidth * conversionScale;
      const pdfHeight = r.canvasHeight * conversionScale;
      const pdfY = pageHeight - r.canvasY * conversionScale - pdfHeight;

      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
        color: rgb(0, 0, 0),
      });
    });

    const redactedBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([redactedBytes], { type: 'application/pdf' }),
      'redacted.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to apply redactions.');
  } finally {
    hideLoader();
  }
}
