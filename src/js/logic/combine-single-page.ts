import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import { PDFDocument as PDFLibDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

document.addEventListener('change', (e) => {
  const target = e.target as HTMLElement;
  if (target.id === 'add-separator') {
    const separatorOptions = document.getElementById('separator-options');
    if (separatorOptions) {
      const checkbox = target as HTMLInputElement;
      if (checkbox.checked) {
        separatorOptions.classList.remove('hidden');
      } else {
        separatorOptions.classList.add('hidden');
      }
    }
  }
});

export async function combineToSinglePage() {
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const orientation = document.getElementById('combine-orientation').value;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const spacing = parseInt(document.getElementById('page-spacing').value) || 0;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const backgroundColorHex = document.getElementById('background-color').value;
  // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
  const addSeparator = document.getElementById('add-separator').checked;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const separatorThickness = parseFloat(document.getElementById('separator-thickness').value) || 0.5;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const separatorColorHex = document.getElementById('separator-color').value;

  const backgroundColor = hexToRgb(backgroundColorHex);
  const separatorColor = hexToRgb(separatorColorHex);

  showLoader('Combining pages...');
  try {
    const sourceDoc = state.pdfDoc;
    const newDoc = await PDFLibDocument.create();

    const pdfBytes = await sourceDoc.save();
    const pdfjsDoc = await getPDFDocument({ data: pdfBytes }).promise;

    const sourcePages = sourceDoc.getPages();
    let maxWidth = 0;
    let maxHeight = 0;
    let totalWidth = 0;
    let totalHeight = 0;

    sourcePages.forEach((page: any) => {
      const { width, height } = page.getSize();
      if (width > maxWidth) maxWidth = width;
      if (height > maxHeight) maxHeight = height;
      totalWidth += width;
      totalHeight += height;
    });

    let finalWidth, finalHeight;
    if (orientation === 'horizontal') {
      finalWidth = totalWidth + Math.max(0, sourcePages.length - 1) * spacing;
      finalHeight = maxHeight;
    } else {
      finalWidth = maxWidth;
      finalHeight = totalHeight + Math.max(0, sourcePages.length - 1) * spacing;
    }

    const newPage = newDoc.addPage([finalWidth, finalHeight]);

    if (backgroundColorHex.toUpperCase() !== '#FFFFFF') {
      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: finalWidth,
        height: finalHeight,
        color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
      });
    }

    let currentX = 0;
    let currentY = finalHeight;

    for (let i = 0; i < sourcePages.length; i++) {
      const sourcePage = sourcePages[i];
      const { width, height } = sourcePage.getSize();

      try {
        const page = await pdfjsDoc.getPage(i + 1);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d')!;

        await page.render({
          canvasContext: context,
          viewport,
          canvas
        }).promise;

        const pngDataUrl = canvas.toDataURL('image/png');
        const pngImage = await newDoc.embedPng(pngDataUrl);

        if (orientation === 'horizontal') {
          const y = (finalHeight - height) / 2;
          newPage.drawImage(pngImage, { x: currentX, y, width, height });
        } else {
          // Vertical layout: stack top to bottom
          currentY -= height;
          const x = (finalWidth - width) / 2; // Center horizontally
          newPage.drawImage(pngImage, { x, y: currentY, width, height });
        }
      } catch (renderError) {
        console.warn(`Failed to render page ${i + 1} with PDF.js, trying fallback method:`, renderError);

        // Fallback: try to copy and embed the page directly
        try {
          const [copiedPage] = await newDoc.copyPages(sourceDoc, [i]);

          if (orientation === 'horizontal') {
            const y = (finalHeight - height) / 2;
            const embeddedPage = await newDoc.embedPage(copiedPage);
            newPage.drawPage(embeddedPage, { x: currentX, y, width, height });
          } else {
            currentY -= height;
            const x = (finalWidth - width) / 2;
            const embeddedPage = await newDoc.embedPage(copiedPage);
            newPage.drawPage(embeddedPage, { x, y: currentY, width, height });
          }
        } catch (embedError) {
          console.error(`Failed to process page ${i + 1}:`, embedError);

          if (orientation === 'horizontal') {
            const y = (finalHeight - height) / 2;
            newPage.drawRectangle({
              x: currentX,
              y,
              width,
              height,
              borderColor: rgb(0.8, 0, 0),
              borderWidth: 2,
            });

            newPage.drawText(`Page ${i + 1} could not be rendered`, {
              x: currentX + 10,
              y: y + height / 2,
              size: 12,
              color: rgb(0.8, 0, 0),
            });
          } else {
            currentY -= height;
            const x = (finalWidth - width) / 2;
            newPage.drawRectangle({
              x,
              y: currentY,
              width,
              height,
              borderColor: rgb(0.8, 0, 0),
              borderWidth: 2,
            });

            newPage.drawText(`Page ${i + 1} could not be rendered`, {
              x: x + 10,
              y: currentY + height / 2,
              size: 12,
              color: rgb(0.8, 0, 0),
            });
          }
        }
      }

      // Draw separator line
      if (addSeparator && i < sourcePages.length - 1) {
        if (orientation === 'horizontal') {
          const lineX = currentX + width + spacing / 2;
          newPage.drawLine({
            start: { x: lineX, y: 0 },
            end: { x: lineX, y: finalHeight },
            thickness: separatorThickness,
            color: rgb(separatorColor.r, separatorColor.g, separatorColor.b),
          });
          currentX += width + spacing;
        } else {
          const lineY = currentY - spacing / 2;
          newPage.drawLine({
            start: { x: 0, y: lineY },
            end: { x: finalWidth, y: lineY },
            thickness: separatorThickness,
            color: rgb(separatorColor.r, separatorColor.g, separatorColor.b),
          });
          currentY -= spacing;
        }
      } else {
        if (orientation === 'horizontal') {
          currentX += width + spacing;
        } else {
          currentY -= spacing;
        }
      }
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
