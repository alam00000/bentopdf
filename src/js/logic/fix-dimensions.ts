import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument, rgb, PageSizes } from 'pdf-lib';

export function setupFixDimensionsUI() {
  const targetSizeSelect = document.getElementById('target-size');
  const customSizeWrapper = document.getElementById('custom-size-wrapper');
  if (targetSizeSelect && customSizeWrapper) {
    targetSizeSelect.addEventListener('change', () => {
      customSizeWrapper.classList.toggle(
        'hidden',
        (targetSizeSelect as HTMLSelectElement).value !== 'Custom'
      );
    });
  }
}

export async function fixDimensions() {
  const targetSizeKey = (
    document.getElementById('target-size') as HTMLSelectElement
  ).value;
  const orientation = (
    document.getElementById('orientation') as HTMLSelectElement
  ).value;

  const scalingMode = (
    document.querySelector(
      'input[name="scaling-mode"]:checked'
    ) as HTMLInputElement
  ).value;
  const backgroundColor = hexToRgb(
    (document.getElementById('background-color') as HTMLInputElement).value
  );

  showLoader('Standardizing pages...');
  try {
    let targetWidth, targetHeight;

    if (targetSizeKey === 'Custom') {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      const width = parseFloat(document.getElementById('custom-width').value);
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      const height = parseFloat(document.getElementById('custom-height').value);
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      const units = document.getElementById('custom-units').value;
      if (units === 'in') {
        targetWidth = width * 72;
        targetHeight = height * 72;
      } else {
        // mm
        targetWidth = width * (72 / 25.4);
        targetHeight = height * (72 / 25.4);
      }
    } else {
      [targetWidth, targetHeight] = PageSizes[targetSizeKey];
    }

    if (orientation === 'landscape' && targetWidth < targetHeight) {
      [targetWidth, targetHeight] = [targetHeight, targetWidth];
    } else if (orientation === 'portrait' && targetWidth > targetHeight) {
      [targetWidth, targetHeight] = [targetHeight, targetWidth];
    }

    const sourceDoc = state.pdfDoc;
    const newDoc = await PDFLibDocument.create();

    for (const sourcePage of sourceDoc.getPages()) {
      const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize();
      const embeddedPage = await newDoc.embedPage(sourcePage);

      const newPage = newDoc.addPage([targetWidth, targetHeight]);
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: targetWidth,
        height: targetHeight,
        color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
      });

      const scaleX = targetWidth / sourceWidth;
      const scaleY = targetHeight / sourceHeight;
      const scale =
        scalingMode === 'fit'
          ? Math.min(scaleX, scaleY)
          : Math.max(scaleX, scaleY);

      const scaledWidth = sourceWidth * scale;
      const scaledHeight = sourceHeight * scale;

      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;

      newPage.drawPage(embeddedPage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    const newPdfBytes = await newDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'standardized.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'An error occurred while standardizing pages.');
  } finally {
    hideLoader();
  }
}
