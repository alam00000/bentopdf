import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, hexToRgb } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

import {
  PDFDocument as PDFLibDocument,
  rgb,
  StandardFonts,
  PageSizes,
} from 'pdf-lib';

function sanitizeTextForPdf(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code === 0x20 || code === 0x09 || code === 0x0A) {
        return char;
      }

      if ((code >= 0x00 && code <= 0x1F) || (code >= 0x7F && code <= 0x9F)) {
        return ' ';
      }

      if (code < 0x20 || (code > 0x7E && code < 0xA0)) {
        return ' ';
      }

      const replacements: { [key: number]: string } = {
        0x2018: "'",
        0x2019: "'",
        0x201C: '"',
        0x201D: '"',
        0x2013: '-',
        0x2014: '--',
        0x2026: '...',
        0x00A0: ' ',
      };

      if (replacements[code]) {
        return replacements[code];
      }

      try {
        if (code <= 0xFF) {
          return char;
        }
        return '?';
      } catch {
        return '?';
      }
    })
    .join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

async function createPdfFromText(
  text: string,
  fontFamilyKey: string,
  fontSize: number,
  pageSizeKey: string,
  colorHex: string
): Promise<Uint8Array> {
  const sanitizedText = sanitizeTextForPdf(text);

  const pdfDoc = await PDFLibDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts[fontFamilyKey]);
  const pageSize = PageSizes[pageSizeKey];
  const margin = 72;
  const textColor = hexToRgb(colorHex);

  let page = pdfDoc.addPage(pageSize);
  let { width, height } = page.getSize();
  const textWidth = width - margin * 2;
  const lineHeight = fontSize * 1.3;
  let y = height - margin;

  const paragraphs = sanitizedText.split('\n');
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

  return await pdfDoc.save();
}

export async function setupTxtToPdfTool() {
  const uploadBtn = document.getElementById('txt-mode-upload-btn');
  const textBtn = document.getElementById('txt-mode-text-btn');
  const uploadPanel = document.getElementById('txt-upload-panel');
  const textPanel = document.getElementById('txt-text-panel');

  if (!uploadBtn || !textBtn || !uploadPanel || !textPanel) return;

  const switchToUpload = () => {
    uploadPanel.classList.remove('hidden');
    textPanel.classList.add('hidden');
    uploadBtn.classList.add('bg-indigo-600', 'text-white');
    uploadBtn.classList.remove('bg-gray-700', 'text-gray-300');
    textBtn.classList.remove('bg-indigo-600', 'text-white');
    textBtn.classList.add('bg-gray-700', 'text-gray-300');
  };

  const switchToText = () => {
    uploadPanel.classList.add('hidden');
    textPanel.classList.remove('hidden');
    textBtn.classList.add('bg-indigo-600', 'text-white');
    textBtn.classList.remove('bg-gray-700', 'text-gray-300');
    uploadBtn.classList.remove('bg-indigo-600', 'text-white');
    uploadBtn.classList.add('bg-gray-700', 'text-gray-300');
  };

  uploadBtn.addEventListener('click', switchToUpload);
  textBtn.addEventListener('click', switchToText);
}

export async function txtToPdf() {
  const uploadPanel = document.getElementById('txt-upload-panel');
  const isUploadMode = !uploadPanel?.classList.contains('hidden');

  showLoader('Creating PDF...');
  try {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const fontFamilyKey = document.getElementById('font-family').value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const fontSize = parseInt(document.getElementById('font-size').value) || 12;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const pageSizeKey = document.getElementById('page-size').value;
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const colorHex = document.getElementById('text-color').value;

    if (isUploadMode && state.files.length > 0) {
      if (state.files.length === 1) {
        const file = state.files[0];
        const text = await file.text();
        const pdfBytes = await createPdfFromText(
          text,
          fontFamilyKey,
          fontSize,
          pageSizeKey,
          colorHex
        );
        const baseName = file.name.replace(/\.txt$/i, '');
        downloadFile(
          new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
          `${baseName}.pdf`
        );
      } else {
        showLoader('Creating PDFs and ZIP archive...');
        const zip = new JSZip();

        for (const file of state.files) {
          const text = await file.text();
          const pdfBytes = await createPdfFromText(
            text,
            fontFamilyKey,
            fontSize,
            pageSizeKey,
            colorHex
          );
          const baseName = file.name.replace(/\.txt$/i, '');
          zip.file(`${baseName}.pdf`, pdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, 'text-to-pdf.zip');
      }
    } else {
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
      const text = document.getElementById('text-input').value;
      if (!text.trim()) {
        showAlert('Input Required', 'Please enter some text to convert.');
        hideLoader();
        return;
      }

      const pdfBytes = await createPdfFromText(
        text,
        fontFamilyKey,
        fontSize,
        pageSizeKey,
        colorHex
      );
      downloadFile(
        new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
        'text-document.pdf'
      );
    }
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Failed to create PDF from text.');
  } finally {
    hideLoader();
  }
}
