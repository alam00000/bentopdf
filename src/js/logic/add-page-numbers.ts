import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';

import { rgb, StandardFonts } from 'pdf-lib';

export async function addPageNumbers() {
  showLoader('Adding page numbers...');
  try {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const position = document.getElementById('position').value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const fontSize = parseInt(document.getElementById('font-size').value) || 12;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const format = document.getElementById('number-format').value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const colorHex = document.getElementById('text-color').value;
    const textColor = hexToRgb(colorHex);

    const pages = state.pdfDoc.getPages();
    const totalPages = pages.length;
    const helveticaFont = await state.pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i];

      const mediaBox = page.getMediaBox();
      const cropBox = page.getCropBox();
      const bounds = cropBox || mediaBox;
      const width = bounds.width;
      const height = bounds.height;
      const xOffset = bounds.x || 0;
      const yOffset = bounds.y || 0;

      let pageNumText =
        format === 'page_x_of_y' ? `${i + 1} / ${totalPages}` : `${i + 1}`;

      const textWidth = helveticaFont.widthOfTextAtSize(pageNumText, fontSize);
      const textHeight = fontSize;

      const minMargin = 8;
      const maxMargin = 40;
      const marginPercentage = 0.04;

      const horizontalMargin = Math.max(
        minMargin,
        Math.min(maxMargin, width * marginPercentage)
      );
      const verticalMargin = Math.max(
        minMargin,
        Math.min(maxMargin, height * marginPercentage)
      );

      // Ensure text doesn't go outside visible page boundaries
      const safeHorizontalMargin = Math.max(
        horizontalMargin,
        textWidth / 2 + 3
      );
      const safeVerticalMargin = Math.max(verticalMargin, textHeight + 3);

      let x, y;

      switch (position) {
        case 'bottom-center':
          x =
            Math.max(
              safeHorizontalMargin,
              Math.min(
                width - safeHorizontalMargin - textWidth,
                (width - textWidth) / 2
              )
            ) + xOffset;
          y = safeVerticalMargin + yOffset;
          break;
        case 'bottom-left':
          x = safeHorizontalMargin + xOffset;
          y = safeVerticalMargin + yOffset;
          break;
        case 'bottom-right':
          x =
            Math.max(
              safeHorizontalMargin,
              width - safeHorizontalMargin - textWidth
            ) + xOffset;
          y = safeVerticalMargin + yOffset;
          break;
        case 'top-center':
          x =
            Math.max(
              safeHorizontalMargin,
              Math.min(
                width - safeHorizontalMargin - textWidth,
                (width - textWidth) / 2
              )
            ) + xOffset;
          y = height - safeVerticalMargin - textHeight + yOffset;
          break;
        case 'top-left':
          x = safeHorizontalMargin + xOffset;
          y = height - safeVerticalMargin - textHeight + yOffset;
          break;
        case 'top-right':
          x =
            Math.max(
              safeHorizontalMargin,
              width - safeHorizontalMargin - textWidth
            ) + xOffset;
          y = height - safeVerticalMargin - textHeight + yOffset;
          break;
      }

      // Final safety check to ensure coordinates are within visible page bounds
      x = Math.max(xOffset + 3, Math.min(xOffset + width - textWidth - 3, x));
      y = Math.max(yOffset + 3, Math.min(yOffset + height - textHeight - 3, y));

      page.drawText(pageNumText, {
        x,
        y,
        font: helveticaFont,
        size: fontSize,
        color: rgb(textColor.r, textColor.g, textColor.b),
      });
    }

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'paginated.pdf'
    );
    showAlert('Success', 'Page numbers added successfully!');
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not add page numbers.');
  } finally {
    hideLoader();
  }
}
