import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, resetAndReloadTool } from '../utils/helpers.js';
import { state } from '../state.js';
import { getRotationState, resetRotationState } from '../handlers/fileHandler.js';

import { PDFDocument, degrees } from 'pdf-lib';

export async function rotate() {
  showLoader('Applying rotations...');
  try {
    const originalPdf = state.pdfDoc;
    const pageCount = originalPdf.getPageCount();
    const rotationStateArray = getRotationState();

    const newPdfDoc = await PDFDocument.create();

    for (let i = 0; i < pageCount; i++) {
      const rotation = rotationStateArray[i] || 0;
      const originalPage = originalPdf.getPage(i);
      const currentRotation = originalPage.getRotation().angle;
      const totalRotation = currentRotation + rotation;

      if (totalRotation % 90 === 0) {
        const [copiedPage] = await newPdfDoc.copyPages(originalPdf, [i]);
        copiedPage.setRotation(degrees(totalRotation));
        newPdfDoc.addPage(copiedPage);
      } else {
        const embeddedPage = await newPdfDoc.embedPage(originalPage);
        const { width, height } = embeddedPage.scale(1);

        const angleRad = (totalRotation * Math.PI) / 180;
        const absCos = Math.abs(Math.cos(angleRad));
        const absSin = Math.abs(Math.sin(angleRad));

        const newWidth = width * absCos + height * absSin;
        const newHeight = width * absSin + height * absCos;

        const newPage = newPdfDoc.addPage([newWidth, newHeight]);

        const x = newWidth / 2 - (width / 2 * Math.cos(angleRad) - height / 2 * Math.sin(angleRad));
        const y = newHeight / 2 - (width / 2 * Math.sin(angleRad) + height / 2 * Math.cos(angleRad));

        newPage.drawPage(embeddedPage, {
          x,
          y,
          width,
          height,
          rotate: degrees(totalRotation),
        });
      }
    }

    const rotatedPdfBytes = await newPdfDoc.save();
    downloadFile(
      new Blob([rotatedPdfBytes as any], { type: 'application/pdf' }),
      'rotated.pdf'
    );

    resetAndReloadTool(() => {
      resetRotationState();
    });
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not apply rotations.');
  } finally {
    hideLoader();
  }
}
