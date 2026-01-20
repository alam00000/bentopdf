import { tesseractLanguages } from '../config/tesseract-languages.js';
import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, getPDFDocument } from '../utils/helpers.js';
import Tesseract from 'tesseract.js';
import {
  PDFDocument as PDFLibDocument,
  StandardFonts,
  rgb,
  PDFFont,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { icons, createIcons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import { getFontForLanguage } from '../utils/font-loader.js';
import { OcrState, OcrLine, OcrPage } from '@/types';
import {
  parseHocrDocument,
  calculateWordTransform,
  calculateSpaceTransform,
} from '../utils/hocr-transform.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const pageState: OcrState = {
  file: null,
  searchablePdfBytes: null,
};

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

function drawOcrTextLayer(
  page: ReturnType<typeof PDFLibDocument.prototype.addPage>,
  ocrPage: OcrPage,
  pageHeight: number,
  primaryFont: PDFFont,
  latinFont: PDFFont
): void {
  ocrPage.lines.forEach(function (line: OcrLine) {
    const words = line.words;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const text = word.text.replace(
        /[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\uFEFF]/g,
        ''
      );

      if (!text.trim()) continue;

      const hasNonLatin = /[^\u0000-\u007F]/.test(text);
      const font = hasNonLatin ? primaryFont : latinFont;

      if (!font) {
        console.warn('Font not available for text: "' + text + '"');
        continue;
      }

      const transform = calculateWordTransform(
        word,
        line,
        pageHeight,
        (txt: string, size: number) => {
          try {
            return font.widthOfTextAtSize(txt, size);
          } catch {
            return 0;
          }
        }
      );

      if (transform.fontSize <= 0) continue;

      try {
        page.drawText(text, {
          x: transform.x,
          y: transform.y,
          font,
          size: transform.fontSize,
          color: rgb(0, 0, 0),
          opacity: 0,
        });
      } catch (error) {
        console.warn(`Could not draw text "${text}":`, error);
      }

      if (line.injectWordBreaks && i < words.length - 1) {
        const nextWord = words[i + 1];
        const spaceTransform = calculateSpaceTransform(
          word,
          nextWord,
          line,
          pageHeight,
          (size: number) => {
            try {
              return font.widthOfTextAtSize(' ', size);
            } catch {
              return 0;
            }
          }
        );

        if (spaceTransform && spaceTransform.horizontalScale > 0.1) {
          try {
            page.drawText(' ', {
              x: spaceTransform.x,
              y: spaceTransform.y,
              font,
              size: spaceTransform.fontSize,
              color: rgb(0, 0, 0),
              opacity: 0,
            });
          } catch {
            console.warn(`Could not draw space between words`);
          }
        }
      }
    }
  });
}

function binarizeCanvas(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const brightness =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const color = brightness > 128 ? 255 : 0;
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
  progressBar.style.width = `${Math.min(100, progress * 100)}%`;

  const logMessage = `Status: ${status}`;
  progressLog.textContent += logMessage + '\n';
  progressLog.scrollTop = progressLog.scrollHeight;
}

function resetState() {
  pageState.file = null;
  pageState.searchablePdfBytes = null;

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const ocrProgress = document.getElementById('ocr-progress');
  if (ocrProgress) ocrProgress.classList.add('hidden');

  const ocrResults = document.getElementById('ocr-results');
  if (ocrResults) ocrResults.classList.add('hidden');

  const progressLog = document.getElementById('progress-log');
  if (progressLog) progressLog.textContent = '';

  const progressBar = document.getElementById('progress-bar');
  if (progressBar) progressBar.style.width = '0%';

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';

  // Reset selected languages
  const langCheckboxes = document.querySelectorAll(
    '.lang-checkbox'
  ) as NodeListOf<HTMLInputElement>;
  langCheckboxes.forEach(function (cb) {
    cb.checked = false;
  });

  const selectedLangsDisplay = document.getElementById(
    'selected-langs-display'
  );
  if (selectedLangsDisplay) selectedLangsDisplay.textContent = 'None';

  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;
  if (processBtn) processBtn.disabled = true;
}

async function runOCR() {
  const selectedLangs = Array.from(
    document.querySelectorAll('.lang-checkbox:checked')
  ).map(function (cb) {
    return (cb as HTMLInputElement).value;
  });

  const scale = parseFloat(
    (document.getElementById('ocr-resolution') as HTMLSelectElement).value
  );
  const binarize = (document.getElementById('ocr-binarize') as HTMLInputElement)
    .checked;
  const whitelist = (
    document.getElementById('ocr-whitelist') as HTMLInputElement
  ).value;

  if (selectedLangs.length === 0) {
    showAlert(
      'No Languages Selected',
      'Please select at least one language for OCR.'
    );
    return;
  }

  if (!pageState.file) {
    showAlert('No File', 'Please upload a PDF file first.');
    return;
  }

  const langString = selectedLangs.join('+');

  const toolOptions = document.getElementById('tool-options');
  const ocrProgress = document.getElementById('ocr-progress');

  if (toolOptions) toolOptions.classList.add('hidden');
  if (ocrProgress) ocrProgress.classList.remove('hidden');

  try {
    const worker = await Tesseract.createWorker(langString, 1, {
      logger: function (m: { status: string; progress: number }) {
        updateProgress(m.status, m.progress || 0);
      },
    });

    await worker.setParameters({
      tessjs_create_hocr: '1',
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });

    if (whitelist) {
      await worker.setParameters({
        tessedit_char_whitelist: whitelist,
      });
    }

    const arrayBuffer = await pageState.file.arrayBuffer();
    const pdf = await getPDFDocument({ data: arrayBuffer }).promise;
    const newPdfDoc = await PDFLibDocument.create();

    newPdfDoc.registerFontkit(fontkit);

    updateProgress('Loading fonts...', 0);

    const cjkLangs = ['jpn', 'chi_sim', 'chi_tra', 'kor'];
    const indicLangs = [
      'hin',
      'ben',
      'guj',
      'kan',
      'mal',
      'ori',
      'pan',
      'tam',
      'tel',
      'sin',
    ];
    const priorityLangs = [...cjkLangs, ...indicLangs, 'ara', 'rus', 'ukr'];

    const primaryLang =
      selectedLangs.find(function (l) {
        return priorityLangs.includes(l);
      }) ||
      selectedLangs[0] ||
      'eng';

    const hasCJK = selectedLangs.some(function (l) {
      return cjkLangs.includes(l);
    });
    const hasIndic = selectedLangs.some(function (l) {
      return indicLangs.includes(l);
    });
    const hasLatin =
      selectedLangs.some(function (l) {
        return !priorityLangs.includes(l);
      }) || selectedLangs.includes('eng');
    const isIndicPlusLatin = hasIndic && hasLatin && !hasCJK;

    let primaryFont;
    let latinFont;

    try {
      if (isIndicPlusLatin) {
        const [scriptFontBytes, latinFontBytes] = await Promise.all([
          getFontForLanguage(primaryLang),
          getFontForLanguage('eng'),
        ]);
        primaryFont = await newPdfDoc.embedFont(scriptFontBytes, {
          subset: false,
        });
        latinFont = await newPdfDoc.embedFont(latinFontBytes, {
          subset: false,
        });
      } else {
        const fontBytes = await getFontForLanguage(primaryLang);
        primaryFont = await newPdfDoc.embedFont(fontBytes, { subset: false });
        latinFont = primaryFont;
      }
    } catch (e) {
      console.error('Font loading failed, falling back to Helvetica', e);
      primaryFont = await newPdfDoc.embedFont(StandardFonts.Helvetica);
      latinFont = primaryFont;
      showAlert(
        'Font Warning',
        'Could not load the specific font for this language. Some characters may not appear correctly.'
      );
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
      const context = canvas.getContext('2d')!;

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

      const pngImageBytes = await new Promise<Uint8Array>(function (resolve) {
        canvas.toBlob(function (blob) {
          const reader = new FileReader();
          reader.onload = function () {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
          };
          reader.readAsArrayBuffer(blob!);
        }, 'image/png');
      });

      const pngImage = await newPdfDoc.embedPng(pngImageBytes);
      newPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      if (data.hocr) {
        const ocrPage = parseHocrDocument(data.hocr);
        drawOcrTextLayer(
          newPage,
          ocrPage,
          viewport.height,
          primaryFont,
          latinFont
        );
      }

      fullText += data.text + '\n\n';
    }

    await worker.terminate();

    pageState.searchablePdfBytes = await newPdfDoc.save();

    const ocrResults = document.getElementById('ocr-results');
    if (ocrProgress) ocrProgress.classList.add('hidden');
    if (ocrResults) ocrResults.classList.remove('hidden');

    createIcons({ icons });

    const textOutput = document.getElementById(
      'ocr-text-output'
    ) as HTMLTextAreaElement;
    if (textOutput) textOutput.value = fullText.trim();
  } catch (e) {
    console.error(e);
    showAlert(
      'OCR Error',
      'An error occurred during the OCR process. The worker may have failed to load. Please try again.'
    );
    if (toolOptions) toolOptions.classList.remove('hidden');
    if (ocrProgress) ocrProgress.classList.add('hidden');
  }
}

async function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const toolOptions = document.getElementById('tool-options');

  if (!fileDisplayArea) return;

  fileDisplayArea.innerHTML = '';

  if (pageState.file) {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col overflow-hidden';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = pageState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = formatBytes(pageState.file.size);

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = function () {
      resetState();
    };

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });

    if (toolOptions) toolOptions.classList.remove('hidden');
  } else {
    if (toolOptions) toolOptions.classList.add('hidden');
  }
}

function handleFileSelect(files: FileList | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    ) {
      pageState.file = file;
      updateUI();
    }
  }
}

function populateLanguageList() {
  const langList = document.getElementById('lang-list');
  if (!langList) return;

  langList.innerHTML = '';

  Object.entries(tesseractLanguages).forEach(function ([code, name]) {
    const label = document.createElement('label');
    label.className =
      'flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 cursor-pointer';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = code;
    checkbox.className =
      'lang-checkbox w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500';

    label.append(checkbox);
    label.append(document.createTextNode(' ' + name));
    langList.appendChild(label);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;
  const backBtn = document.getElementById('back-to-tools');
  const langSearch = document.getElementById('lang-search') as HTMLInputElement;
  const langList = document.getElementById('lang-list');
  const selectedLangsDisplay = document.getElementById(
    'selected-langs-display'
  );
  const presetSelect = document.getElementById(
    'whitelist-preset'
  ) as HTMLSelectElement;
  const whitelistInput = document.getElementById(
    'ocr-whitelist'
  ) as HTMLInputElement;
  const copyBtn = document.getElementById('copy-text-btn');
  const downloadTxtBtn = document.getElementById('download-txt-btn');
  const downloadPdfBtn = document.getElementById('download-searchable-pdf');

  populateLanguageList();

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (fileInput && dropZone) {
    fileInput.addEventListener('change', function (e) {
      handleFileSelect((e.target as HTMLInputElement).files);
    });

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(function (f) {
          return (
            f.type === 'application/pdf' ||
            f.name.toLowerCase().endsWith('.pdf')
          );
        });
        if (pdfFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFiles[0]);
          handleFileSelect(dataTransfer.files);
        }
      }
    });

    fileInput.addEventListener('click', function () {
      fileInput.value = '';
    });
  }

  // Language search
  if (langSearch && langList) {
    langSearch.addEventListener('input', function () {
      const searchTerm = langSearch.value.toLowerCase();
      langList.querySelectorAll('label').forEach(function (label) {
        (label as HTMLElement).style.display = label.textContent
          ?.toLowerCase()
          .includes(searchTerm)
          ? ''
          : 'none';
      });
    });

    langList.addEventListener('change', function () {
      const selected = Array.from(
        langList.querySelectorAll('.lang-checkbox:checked')
      ).map(function (cb) {
        return tesseractLanguages[
          (cb as HTMLInputElement).value as keyof typeof tesseractLanguages
        ];
      });

      if (selectedLangsDisplay) {
        selectedLangsDisplay.textContent =
          selected.length > 0 ? selected.join(', ') : 'None';
      }

      if (processBtn) {
        processBtn.disabled = selected.length === 0;
      }
    });
  }

  // Whitelist preset
  if (presetSelect && whitelistInput) {
    presetSelect.addEventListener('change', function () {
      const preset = presetSelect.value;
      if (preset && preset !== 'custom') {
        whitelistInput.value = whitelistPresets[preset] || '';
        whitelistInput.disabled = true;
      } else {
        whitelistInput.disabled = false;
        if (preset === '') {
          whitelistInput.value = '';
        }
      }
    });
  }

  // Details toggle
  document.querySelectorAll('details').forEach(function (details) {
    details.addEventListener('toggle', function () {
      const icon = details.querySelector('.details-icon') as HTMLElement;
      if (icon) {
        icon.style.transform = (details as HTMLDetailsElement).open
          ? 'rotate(180deg)'
          : 'rotate(0deg)';
      }
    });
  });

  // Process button
  if (processBtn) {
    processBtn.addEventListener('click', runOCR);
  }

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const textOutput = document.getElementById(
        'ocr-text-output'
      ) as HTMLTextAreaElement;
      if (textOutput) {
        navigator.clipboard.writeText(textOutput.value).then(function () {
          copyBtn.innerHTML =
            '<i data-lucide="check" class="w-4 h-4 text-green-400"></i>';
          createIcons({ icons });

          setTimeout(function () {
            copyBtn.innerHTML =
              '<i data-lucide="clipboard-copy" class="w-4 h-4 text-gray-300"></i>';
            createIcons({ icons });
          }, 2000);
        });
      }
    });
  }

  // Download txt
  if (downloadTxtBtn) {
    downloadTxtBtn.addEventListener('click', function () {
      const textOutput = document.getElementById(
        'ocr-text-output'
      ) as HTMLTextAreaElement;
      if (textOutput) {
        const blob = new Blob([textOutput.value], { type: 'text/plain' });
        downloadFile(blob, 'ocr-text.txt');
      }
    });
  }

  // Download PDF
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', function () {
      if (pageState.searchablePdfBytes) {
        downloadFile(
          new Blob([new Uint8Array(pageState.searchablePdfBytes)], {
            type: 'application/pdf',
          }),
          'searchable.pdf'
        );
      }
    });
  }
});
