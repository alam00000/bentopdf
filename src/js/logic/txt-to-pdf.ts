import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';

import {
  PDFDocument as PDFLibDocument,
  rgb,
  StandardFonts,
  PageSizes,
} from 'pdf-lib';

export async function txtToPdf() {
  showLoader('Creating PDF...');
  try {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const text = document.getElementById('text-input').value;
    if (!text.trim()) {
      showAlert('Input Required', 'Please enter some text to convert.');
      hideLoader();
      return;
    }

    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const fontFamilyKey = document.getElementById('font-family').value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const fontSize = parseInt(document.getElementById('font-size').value) || 12;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const pageSizeKey = document.getElementById('page-size').value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const colorHex = document.getElementById('text-color').value;
    const textColor = hexToRgb(colorHex);

    const pdfDoc = await PDFLibDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts[fontFamilyKey]);
    const pageSize = PageSizes[pageSizeKey];
    const margin = 72; // 1 inch

    let page = pdfDoc.addPage(pageSize);
    let { width, height } = page.getSize();
    const textWidth = width - margin * 2;
    const lineHeight = fontSize * 1.3;
    let y = height - margin;

    const paragraphs = text.split('\n');
    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine =
          currentLine.length > 0 ? `${currentLine} ${word}` : word;
        if (font.widthOfTextAtSize(testLine, fontSize) <= textWidth) {
          currentLine = testLine;
        } else {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage(pageSize);
            y = page.getHeight() - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y,
            font,
            size: fontSize,
            color: rgb(textColor.r, textColor.g, textColor.b),
          });
          y -= lineHeight;
          currentLine = word;
        }
      }
      if (currentLine.length > 0) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage(pageSize);
          y = page.getHeight() - margin;
        }
        page.drawText(currentLine, {
          x: margin,
          y,
          font,
          size: fontSize,
          color: rgb(textColor.r, textColor.g, textColor.b),
        });
        y -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    downloadFile(
      new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      'text-document.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to create PDF from text.');
  } finally {
    hideLoader();
  }
}
