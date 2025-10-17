import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';

export async function combineToSinglePage() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const spacing = parseInt(document.getElementById('page-spacing').value) || 0;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const backgroundColorHex = document.getElementById('background-color').value;
  // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
  const addSeparator = document.getElementById('add-separator').checked;
  const backgroundColor = hexToRgb(backgroundColorHex);

  showLoader('Combining pages...');
  try {
    const sourceDoc = state.pdfDoc;
    const newDoc = await PDFLibDocument.create();
    const sourcePages = sourceDoc.getPages();

    let maxWidth = 0;
    let totalHeight = 0;
    sourcePages.forEach((page: any) => {
      const { width, height } = page.getSize();
      if (width > maxWidth) maxWidth = width;
      totalHeight += height;
    });
    totalHeight += Math.max(0, sourcePages.length - 1) * spacing;

    const newPage = newDoc.addPage([maxWidth, totalHeight]);

    if (backgroundColorHex.toUpperCase() !== '#FFFFFF') {
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: maxWidth,
        height: totalHeight,
        color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
      });
    }

    let currentY = totalHeight;
    for (let i = 0; i < sourcePages.length; i++) {
      const sourcePage = sourcePages[i];
      const { width, height } = sourcePage.getSize();
      const embeddedPage = await newDoc.embedPage(sourcePage);

      currentY -= height;
      const x = (maxWidth - width) / 2;

      newPage.drawPage(embeddedPage, { x, y: currentY, width, height });

      if (addSeparator && i < sourcePages.length - 1) {
        const lineY = currentY - spacing / 2;
        newPage.drawLine({
          start: { x: 0, y: lineY },
          end: { x: maxWidth, y: lineY },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      }

      currentY -= spacing;
    }

    const newPdfBytes = await newDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'combined-page.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'An error occurred while combining pages.');
  } finally {
    hideLoader();
  }
}
