import { tesseractLanguages } from '../config/tesseract-languages.js';
import { showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer } from '../utils/helpers.js';
import { state } from '../state.js';
import Tesseract from 'tesseract.js';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb } from 'pdf-lib';
import { icons, createIcons } from 'lucide';

let searchablePdfBytes: any = null;

function sanitizeTextForWinAnsi(text: string): string {
  // Remove invisible Unicode control characters (like Left-to-Right Mark U+200E)
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\uFEFF]/g, '')
    .replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '');
}

function parseHOCR(hocrText: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(hocrText, 'text/html');
  const words = [];

  // Find all word elements in hOCR
  const wordElements = doc.querySelectorAll('.ocrx_word');

  wordElements.forEach((wordEl) => {
    const titleAttr = wordEl.getAttribute('title');
    const text = wordEl.textContent?.trim() || '';

    if (!titleAttr || !text) return;

    // Parse bbox coordinates from title attribute
    // Format: "bbox x0 y0 x1 y1; x_wconf confidence"
    const bboxMatch = titleAttr.match(/bbox (\d+) (\d+) (\d+) (\d+)/);
    const confMatch = titleAttr.match(/x_wconf (\d+)/);

    if (bboxMatch) {
      words.push({
        text: text,
        bbox: {
          x0: parseInt(bboxMatch[1]),
          y0: parseInt(bboxMatch[2]),
          x1: parseInt(bboxMatch[3]),
          y1: parseInt(bboxMatch[4]),
        },
        confidence: confMatch ? parseInt(confMatch[1]) : 0,
      });
    }
  });

  return words;
}

function binarizeCanvas(ctx: any) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // A simple luminance-based threshold for determining black or white
    const brightness =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const color = brightness > 128 ? 255 : 0; // If brighter than mid-gray, make it white, otherwise black
    data[i] = data[i + 1] = data[i + 2] = color;
  }
  ctx.putImageData(imageData, 0, 0);
}

function updateProgress(status: any, progress: any) {
  const progressBar = document.getElementById('progress-bar');
  const progressStatus = document.getElementById('progress-status');
  const progressLog = document.getElementById('progress-log');

  if (!progressBar || !progressStatus || !progressLog) return;

  progressStatus.textContent = status;
  // Tesseract's progress can sometimes exceed 1, so we cap it at 100%.
  progressBar.style.width = `${Math.min(100, progress * 100)}%`;

  const logMessage = `Status: ${status}`;
  progressLog.textContent += logMessage + '\n';
  progressLog.scrollTop = progressLog.scrollHeight;
}

async function runOCR() {
  const selectedLangs = Array.from(
    document.querySelectorAll('.lang-checkbox:checked')
  ).map((cb) => (cb as HTMLInputElement).value);
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const scale = parseFloat(document.getElementById('ocr-resolution').value);
  // @ts-expect-error TS(2339) FIXME: Property 'checked' does not exist on type 'HTMLEle... Remove this comment to see the full error message
  const binarize = document.getElementById('ocr-binarize').checked;
  // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
  const whitelist = document.getElementById('ocr-whitelist').value;

  if (selectedLangs.length === 0) {
    showAlert(
      'No Languages Selected',
      'Please select at least one language for OCR.'
    );
    return;
  }
  const langString = selectedLangs.join('+');

  document.getElementById('ocr-options').classList.add('hidden');
  document.getElementById('ocr-progress').classList.remove('hidden');

  try {
    const worker = await Tesseract.createWorker(langString, 1, {
      logger: (m: any) => updateProgress(m.status, m.progress || 0),
    });

    // Enable hOCR output
    await worker.setParameters({
      tessjs_create_hocr: '1',
    });

    if (whitelist.trim()) {
      await worker.setParameters({
        tessedit_char_whitelist: whitelist.trim(),
      });
    }

    // @ts-expect-error TS(2304) FIXME: Cannot find name 'pdfjsLib'.
    const pdf = await pdfjsLib.getDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const newPdfDoc = await PDFLibDocument.create();
    const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      updateProgress(
        `Processing page ${i} of ${pdf.numPages}`,
        (i - 1) / pdf.numPages
      );
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;

      if (binarize) {
        binarizeCanvas(context);
      }

      const result = await worker.recognize(canvas);
      const data = result.data;
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
      const pngImageBytes = await new Promise((resolve) =>
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          // @ts-expect-error TS(2769) FIXME: No overload matches this call.
          reader.onload = () => resolve(new Uint8Array(reader.result));
          reader.readAsArrayBuffer(blob);
        }, 'image/png')
      );
      const pngImage = await newPdfDoc.embedPng(pngImageBytes as ArrayBuffer);
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      // Parse hOCR to get word-level data
      if (data.hocr) {
        const words = parseHOCR(data.hocr);

        words.forEach((word: any) => {
          const { x0, y0, x1, y1 } = word.bbox;
          // Sanitize the text to remove characters WinAnsi cannot encode
          const text = sanitizeTextForWinAnsi(word.text);

          // Skip words that become empty after sanitization
          if (!text.trim()) return;

          const bboxWidth = x1 - x0;
          const bboxHeight = y1 - y0;

          let fontSize = bboxHeight * 0.9;
          let textWidth = font.widthOfTextAtSize(text, fontSize);
          while (textWidth > bboxWidth && fontSize > 1) {
            fontSize -= 0.5;
            textWidth = font.widthOfTextAtSize(text, fontSize);
          }

          try {
            newPage.drawText(text, {
              x: x0,
              y: viewport.height - y1 + (bboxHeight - fontSize) / 2,
              font,
              size: fontSize,
              color: rgb(0, 0, 0),
              opacity: 0,
            });
          } catch (error) {
            // If drawing fails despite sanitization, log and skip this word
            console.warn(`Could not draw text "${text}":`, error);
          }
        });
      }

      fullText += data.text + '\n\n';
    }

    await worker.terminate();

    searchablePdfBytes = await newPdfDoc.save();
    document.getElementById('ocr-progress').classList.add('hidden');
    document.getElementById('ocr-results').classList.remove('hidden');

    createIcons({ icons });
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    document.getElementById('ocr-text-output').value = fullText.trim();

    document
      .getElementById('download-searchable-pdf')
      .addEventListener('click', () => {
        downloadFile(
          new Blob([searchablePdfBytes], { type: 'application/pdf' }),
          'searchable.pdf'
        );
      });

    // CHANGE: The copy button logic is updated to be safer.
    document.getElementById('copy-text-btn').addEventListener('click', (e) => {
      const button = e.currentTarget as HTMLButtonElement;
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme...
      const textToCopy = document.getElementById('ocr-text-output').value;

      navigator.clipboard.writeText(textToCopy).then(() => {
        button.textContent = ''; // Clear the button safely
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'check');
        icon.className = 'w-4 h-4 text-green-400';
        button.appendChild(icon);
        createIcons({ icons });

        setTimeout(() => {
          const currentButton = document.getElementById('copy-text-btn');
          if (currentButton) {
            currentButton.textContent = ''; // Clear the button safely
            const resetIcon = document.createElement('i');
            resetIcon.setAttribute('data-lucide', 'clipboard-copy');
            resetIcon.className = 'w-4 h-4 text-gray-300';
            currentButton.appendChild(resetIcon);
            createIcons({ icons });
          }
        }, 2000);
      });
    });

    document
      .getElementById('download-txt-btn')
      .addEventListener('click', () => {
        // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
        const textToSave = document.getElementById('ocr-text-output').value;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        downloadFile(blob, 'ocr-text.txt');
      });
  } catch (e) {
    console.error(e);
    showAlert(
      'OCR Error',
      'An error occurred during the OCR process. The worker may have failed to load. Please try again.'
    );
    document.getElementById('ocr-options').classList.remove('hidden');
    document.getElementById('ocr-progress').classList.add('hidden');
  }
}

/**
 * Sets up the UI and event listeners for the OCR tool.
 */
export function setupOcrTool() {
  const langSearch = document.getElementById('lang-search');
  const langList = document.getElementById('lang-list');
  const selectedLangsDisplay = document.getElementById(
    'selected-langs-display'
  );
  const processBtn = document.getElementById('process-btn');

  langSearch.addEventListener('input', () => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const searchTerm = langSearch.value.toLowerCase();
    langList.querySelectorAll('label').forEach((label) => {
      label.style.display = label.textContent.toLowerCase().includes(searchTerm)
        ? ''
        : 'none';
    });
  });

  // Update the display of selected languages
  langList.addEventListener('change', () => {
    const selected = Array.from(
      langList.querySelectorAll('.lang-checkbox:checked')
    )
      // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'Element'.
      .map((cb) => tesseractLanguages[cb.value]);
    selectedLangsDisplay.textContent =
      selected.length > 0 ? selected.join(', ') : 'None';
    // @ts-expect-error TS(2339) FIXME: Property 'disabled' does not exist on type 'HTMLEl... Remove this comment to see the full error message
    processBtn.disabled = selected.length === 0;
  });

  // Attach the main OCR function to the process button
  processBtn.addEventListener('click', runOCR);
}
