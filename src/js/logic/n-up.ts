import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument, rgb, PageSizes } from 'pdf-lib';

export function setupNUpUI() {
  const addBorderCheckbox = document.getElementById('add-border');
  const borderColorWrapper = document.getElementById('border-color-wrapper');
  if (addBorderCheckbox && borderColorWrapper) {
    addBorderCheckbox.addEventListener('change', () => {
      // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
      borderColorWrapper.classList.toggle('hidden', !addBorderCheckbox.checked);
    });
  }
}

export async function nUpTool() {
  // 1. Gather all options from the UI
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const n = parseInt(document.getElementById('pages-per-sheet').value);
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const pageSizeKey = document.getElementById('output-page-size').value;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  let orientation = document.getElementById('output-orientation').value;
  // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
  const useMargins = document.getElementById('add-margins').checked;
  // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
  const addBorder = document.getElementById('add-border').checked;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const borderColor = hexToRgb(document.getElementById('border-color').value);

  showLoader('Creating N-Up PDF...');
  try {
    const sourceDoc = state.pdfDoc;
    const newDoc = await PDFLibDocument.create();
    const sourcePages = sourceDoc.getPages();

    const gridDims = { 2: [2, 1], 4: [2, 2], 9: [3, 3], 16: [4, 4] }[n];

    let [pageWidth, pageHeight] = PageSizes[pageSizeKey];

    if (orientation === 'auto') {
      const firstPage = sourcePages[0];
      const isSourceLandscape = firstPage.getWidth() > firstPage.getHeight();
      // If source is landscape and grid is wider than tall (like 2x1), output landscape.
      orientation =
        isSourceLandscape && gridDims[0] > gridDims[1]
          ? 'landscape'
          : 'portrait';
    }
    if (orientation === 'landscape' && pageWidth < pageHeight) {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }

    const margin = useMargins ? 36 : 0;
    const gutter = useMargins ? 10 : 0;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // Loop through the source pages in chunks of 'n'
    for (let i = 0; i < sourcePages.length; i += n) {
      showLoader(`Processing sheet ${Math.floor(i / n) + 1}...`);
      const chunk = sourcePages.slice(i, i + n);
      const outputPage = newDoc.addPage([pageWidth, pageHeight]);

      // Calculate dimensions of each cell in the grid
      const cellWidth =
        (usableWidth - gutter * (gridDims[0] - 1)) / gridDims[0];
      const cellHeight =
        (usableHeight - gutter * (gridDims[1] - 1)) / gridDims[1];

      for (let j = 0; j < chunk.length; j++) {
        const sourcePage = chunk[j];
        const embeddedPage = await newDoc.embedPage(sourcePage);

        // Calculate scaled dimensions to fit the cell, preserving aspect ratio
        const scale = Math.min(
          cellWidth / embeddedPage.width,
          cellHeight / embeddedPage.height
        );
        const scaledWidth = embeddedPage.width * scale;
        const scaledHeight = embeddedPage.height * scale;

        // Calculate position (x, y) for this cell
        const row = Math.floor(j / gridDims[0]);
        const col = j % gridDims[0];
        const cellX = margin + col * (cellWidth + gutter);
        const cellY =
          pageHeight - margin - (row + 1) * cellHeight - row * gutter;

        // Center the page within its cell
        const x = cellX + (cellWidth - scaledWidth) / 2;
        const y = cellY + (cellHeight - scaledHeight) / 2;

        outputPage.drawPage(embeddedPage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });

        if (addBorder) {
          outputPage.drawRectangle({
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
            borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
            borderWidth: 1,
          });
        }
      }
    }

    const newPdfBytes = await newDoc.save();
    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      `n-up_${n}.pdf`
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'An error occurred while creating the N-Up PDF.');
  } finally {
    hideLoader();
  }
}
