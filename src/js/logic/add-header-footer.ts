import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb, parsePageRanges } from '../utils/helpers.js';
import { state } from '../state.js';

import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from 'pdf-lib';

export function setupHeaderFooterUI() {
  const totalPagesSpan = document.getElementById('total-pages');
  if (totalPagesSpan && state.pdfDoc) {
    totalPagesSpan.textContent = state.pdfDoc.getPageCount();
  }
}

export async function addHeaderFooter() {
  showLoader('Adding header & footer...');
  try {
    const helveticaFont = await state.pdfDoc.embedFont(StandardFonts.Helvetica);
    const allPages = state.pdfDoc.getPages();
    const totalPages = allPages.length;
    const margin = 40;

    // --- 1. Get new formatting options from the UI ---
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const fontSize = parseInt(document.getElementById('font-size').value) || 10;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const colorHex = document.getElementById('font-color').value;
    const fontColor = hexToRgb(colorHex);
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const pageRangeInput = document.getElementById('page-range').value;

    // --- 2. Get text values ---
    const texts = {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      headerLeft: document.getElementById('header-left').value,
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      headerCenter: document.getElementById('header-center').value,
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      headerRight: document.getElementById('header-right').value,
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      footerLeft: document.getElementById('footer-left').value,
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      footerCenter: document.getElementById('footer-center').value,
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      footerRight: document.getElementById('footer-right').value,
    };

    // --- 3. Parse page range to determine which pages to modify ---
    const indicesToProcess = parsePageRanges(pageRangeInput, totalPages);
    if (indicesToProcess.length === 0) {
      throw new Error(
        "Invalid page range specified. Please check your input (e.g., '1-3, 5')."
      );
    }

    // --- 4. Define drawing options with new values ---
    const drawOptions = {
      font: helveticaFont,
      size: fontSize,
      color: rgb(fontColor.r, fontColor.g, fontColor.b),
    };

    // --- 5. Loop over only the selected pages ---
    for (const pageIndex of indicesToProcess) {
      // @ts-expect-error TS(2538) FIXME: Type 'unknown' cannot be used as an index type.
      const page = allPages[pageIndex];
      const { width, height } = page.getSize();
      // @ts-expect-error TS(2365) FIXME: Operator '+' cannot be applied to types 'unknown' ... Remove this comment to see the full error message
      const pageNumber = pageIndex + 1; // For dynamic text

      // Helper to replace placeholders like {page} and {total}
      const processText = (text: any) =>
        text.replace(/{page}/g, pageNumber).replace(/{total}/g, totalPages);

      // Get processed text for the current page
      const processedTexts = {
        headerLeft: processText(texts.headerLeft),
        headerCenter: processText(texts.headerCenter),
        headerRight: processText(texts.headerRight),
        footerLeft: processText(texts.footerLeft),
        footerCenter: processText(texts.footerCenter),
        footerRight: processText(texts.footerRight),
      };

      if (processedTexts.headerLeft)
        page.drawText(processedTexts.headerLeft, {
          ...drawOptions,
          x: margin,
          y: height - margin,
        });
      if (processedTexts.headerCenter)
        page.drawText(processedTexts.headerCenter, {
          ...drawOptions,
          x:
            width / 2 -
            helveticaFont.widthOfTextAtSize(
              processedTexts.headerCenter,
              fontSize
            ) /
              2,
          y: height - margin,
        });
      if (processedTexts.headerRight)
        page.drawText(processedTexts.headerRight, {
          ...drawOptions,
          x:
            width -
            margin -
            helveticaFont.widthOfTextAtSize(
              processedTexts.headerRight,
              fontSize
            ),
          y: height - margin,
        });
      if (processedTexts.footerLeft)
        page.drawText(processedTexts.footerLeft, {
          ...drawOptions,
          x: margin,
          y: margin,
        });
      if (processedTexts.footerCenter)
        page.drawText(processedTexts.footerCenter, {
          ...drawOptions,
          x:
            width / 2 -
            helveticaFont.widthOfTextAtSize(
              processedTexts.footerCenter,
              fontSize
            ) /
              2,
          y: margin,
        });
      if (processedTexts.footerRight)
        page.drawText(processedTexts.footerRight, {
          ...drawOptions,
          x:
            width -
            margin -
            helveticaFont.widthOfTextAtSize(
              processedTexts.footerRight,
              fontSize
            ),
          y: margin,
        });
    }

    const newPdfBytes = await state.pdfDoc.save();
    downloadFile(
      new Blob([newPdfBytes], { type: 'application/pdf' }),
      'header-footer-added.pdf'
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', e.message || 'Could not add header or footer.');
  } finally {
    hideLoader();
  }
}
