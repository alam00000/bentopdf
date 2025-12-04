import { tesseractLanguages } from '../config/tesseract-languages.js';
import { showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers.js';
import { state } from '../state.js';
import Tesseract from 'tesseract.js';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { icons, createIcons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

import type { Word } from '../types/index.js';

let searchablePdfBytes: Uint8Array | null = null;

import { getFontForLanguage } from '../utils/font-loader.js';


// function sanitizeTextForWinAnsi(text: string): string {
//   // Remove invisible Unicode control characters (like Left-to-Right Mark U+200E)
//   return text
//     .replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\uFEFF]/g, '')
//     .replace(/[^\u0020-\u007E\u00A0-\u00FF]/g, '');
// }

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

function binarizeCanvas(ctx: CanvasRenderingContext2D) {
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

function updateProgress(status: string, progress: number) {
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
  const scale = parseFloat(
    (document.getElementById('ocr-resolution') as HTMLSelectElement).value
  );
  const binarize = (document.getElementById('ocr-binarize') as HTMLInputElement)
    .checked;
  const whitelist = (document.getElementById('ocr-whitelist') as HTMLInputElement)
    .value;

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
      logger: (m: { status: string; progress: number }) =>
        updateProgress(m.status, m.progress || 0),
    });

    await worker.setParameters({
      tessjs_create_hocr: '1',
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });

    await worker.setParameters({
      tessedit_char_whitelist: whitelist,
    });

    const pdf = await getPDFDocument(
      await readFileAsArrayBuffer(state.files[0])
    ).promise;
    const newPdfDoc = await PDFLibDocument.create();

    newPdfDoc.registerFontkit(fontkit);

    updateProgress('Loading fonts...', 0);

    // Prioritize non-Latin languages for font selection if multiple are selected
    const cjkLangs = ['jpn', 'chi_sim', 'chi_tra', 'kor'];
    const indicLangs = ['hin', 'ben', 'guj', 'kan', 'mal', 'ori', 'pan', 'tam', 'tel', 'sin'];
    const priorityLangs = [...cjkLangs, ...indicLangs, 'ara', 'rus', 'ukr'];

    const primaryLang = selectedLangs.find(l => priorityLangs.includes(l)) || selectedLangs[0] || 'eng';

    const hasCJK = selectedLangs.some(l => cjkLangs.includes(l));
    const hasIndic = selectedLangs.some(l => indicLangs.includes(l));
    const hasLatin = selectedLangs.some(l => !priorityLangs.includes(l)) || selectedLangs.includes('eng');
    const isIndicPlusLatin = hasIndic && hasLatin && !hasCJK;

    let primaryFont;
    let latinFont;

    try {
      let fontBytes;
      if (isIndicPlusLatin) {
        const [scriptFontBytes, latinFontBytes] = await Promise.all([
          getFontForLanguage(primaryLang),
          getFontForLanguage('eng')
        ]);
        primaryFont = await newPdfDoc.embedFont(scriptFontBytes, { subset: false });
        latinFont = await newPdfDoc.embedFont(latinFontBytes, { subset: false });
      } else {
        // For CJK or single-script, use one font
        fontBytes = await getFontForLanguage(primaryLang);
        primaryFont = await newPdfDoc.embedFont(fontBytes, { subset: false });
        latinFont = primaryFont;
      }
    } catch (e) {
      console.error('Font loading failed, falling back to Helvetica', e);
      primaryFont = await newPdfDoc.embedFont(StandardFonts.Helvetica);
      latinFont = primaryFont;
      showAlert('Font Warning', 'Could not load the specific font for this language. Some characters may not appear correctly.');
    }

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

      await page.render({ canvasContext: context, viewport, canvas }).promise;

      if (binarize) {
        binarizeCanvas(context);
      }

      const result = await worker.recognize(
        canvas,
        {},
        { text: true, hocr: true }
      );
      const data = result.data;
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
      const pngImageBytes = await new Promise((resolve) =>
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(new Uint8Array(reader.result as ArrayBuffer));
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

        words.forEach((word: Word) => {
          const { x0, y0, x1, y1 } = word.bbox;
          const text = word.text.replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\uFEFF]/g, '');

          if (!text.trim()) return;

          const hasNonLatin = /[^\u0000-\u007F]/.test(text);
          const font = hasNonLatin ? primaryFont : latinFont;

          if (!font) {
            console.warn(`Font not available for text: "${text}"`);
            return;
          }

          const bboxWidth = x1 - x0;
          const bboxHeight = y1 - y0;

          if (bboxWidth <= 0 || bboxHeight <= 0) {
            return;
          }

          let fontSize = bboxHeight * 0.9;
          try {
            let textWidth = font.widthOfTextAtSize(text, fontSize);
            while (textWidth > bboxWidth && fontSize > 1) {
              fontSize -= 0.5;
              textWidth = font.widthOfTextAtSize(text, fontSize);
            }
          } catch (error) {
            console.warn(`Could not calculate text width for "${text}":`, error);
            return;
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
    (
      document.getElementById('ocr-text-output') as HTMLTextAreaElement
    ).value = fullText.trim();

    document
      .getElementById('download-searchable-pdf')
      .addEventListener('click', () => {
        if (searchablePdfBytes) {
          downloadFile(
            new Blob([searchablePdfBytes as BlobPart], { type: 'application/pdf' }),
            'searchable.pdf'
          );
        }
      });

    // CHANGE: The copy button logic is updated to be safer.
    document.getElementById('copy-text-btn').addEventListener('click', (e) => {
      const button = e.currentTarget as HTMLButtonElement;
      const textToCopy = (
        document.getElementById('ocr-text-output') as HTMLTextAreaElement
      ).value;

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
        const textToSave = (
          document.getElementById('ocr-text-output') as HTMLTextAreaElement
        ).value;
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

  // Whitelist presets
  const whitelistPresets: Record<string, string> = {
    alphanumeric:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-\'"',
    'numbers-currency': '0123456789$€£¥.,- ',
    'letters-only': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
    'numbers-only': '0123456789',
    invoice: '0123456789$.,/-#: ',
    forms:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()-_/@#:',
  };

  // Handle whitelist preset selection
  const presetSelect = document.getElementById(
    'whitelist-preset'
  ) as HTMLSelectElement;
  const whitelistInput = document.getElementById(
    'ocr-whitelist'
  ) as HTMLInputElement;

  presetSelect?.addEventListener('change', (e) => {
    const preset = (e.target as HTMLSelectElement).value;
    if (preset && preset !== 'custom') {
      whitelistInput.value = whitelistPresets[preset];
      whitelistInput.disabled = true;
    } else {
      whitelistInput.disabled = false;
      if (preset === '') {
        whitelistInput.value = '';
      }
    }
  });

  // Handle details toggle icon rotation
  document.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => {
      const icon = details.querySelector('.details-icon') as HTMLElement;
      if (icon) {
        icon.style.transform = details.open ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });

  langSearch.addEventListener('input', () => {
    const searchTerm = (langSearch as HTMLInputElement).value.toLowerCase();
    langList.querySelectorAll('label').forEach((label) => {
      label.style.display = label.textContent.toLowerCase().includes(searchTerm)
        ? ''
        : 'none';
    });
  });

  langList.addEventListener('change', () => {
    const selected = Array.from(
      langList.querySelectorAll('.lang-checkbox:checked')
    ).map((cb) => tesseractLanguages[(cb as HTMLInputElement).value]);
    selectedLangsDisplay.textContent =
      selected.length > 0 ? selected.join(', ') : 'None';
    (processBtn as HTMLButtonElement).disabled = selected.length === 0;
  });

  processBtn.addEventListener('click', runOCR);
}
