import { tesseractLanguages } from '../config/tesseract-languages.js';
import { showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import { icons, createIcons } from 'lucide';
import { OcrState } from '@/types';
import { performOcr } from '../utils/ocr.js';
import {
  getAvailableTesseractLanguageEntries,
  resolveConfiguredTesseractAvailableLanguages,
  UnsupportedOcrLanguageError,
} from '../utils/tesseract-language-availability.js';

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

function updateLanguageAvailabilityNotice() {
  const notice = document.getElementById('lang-availability-note');
  if (!notice) return;

  const configuredLanguages = resolveConfiguredTesseractAvailableLanguages();
  if (!configuredLanguages) {
    notice.classList.add('hidden');
    notice.textContent = '';
    return;
  }

  const availableEntries = getAvailableTesseractLanguageEntries();
  if (availableEntries.length === 0) {
    notice.classList.remove('hidden');
    notice.textContent =
      'This deployment does not expose any valid OCR languages. Rebuild it with VITE_TESSERACT_AVAILABLE_LANGUAGES set to valid Tesseract codes.';
    return;
  }

  const availableNames = availableEntries.map(([, name]) => name).join(', ');
  notice.classList.remove('hidden');
  notice.textContent = `This deployment bundles OCR for: ${availableNames}.`;
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
  const embedFullFonts = (
    document.getElementById('ocr-embed-full-fonts') as HTMLInputElement
  ).checked;
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
    const arrayBuffer = await pageState.file.arrayBuffer();

    const result = await performOcr(new Uint8Array(arrayBuffer), {
      language: langString,
      resolution: scale,
      binarize,
      whitelist,
      embedFullFonts,
      onProgress: updateProgress,
    });

    pageState.searchablePdfBytes = result.pdfBytes;

    const ocrResults = document.getElementById('ocr-results');
    if (ocrProgress) ocrProgress.classList.add('hidden');
    if (ocrResults) ocrResults.classList.remove('hidden');

    createIcons({ icons });

    const textOutput = document.getElementById(
      'ocr-text-output'
    ) as HTMLTextAreaElement;
    if (textOutput) textOutput.value = result.fullText.trim();
  } catch (e) {
    console.error(e);
    if (e instanceof UnsupportedOcrLanguageError) {
      showAlert('OCR Language Not Available', e.message);
    } else {
      showAlert(
        'OCR Error',
        'An error occurred during the OCR process. The worker may have failed to load. Please try again.'
      );
    }
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

async function handleFileSelect(files: FileList | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    ) {
      const result = await loadPdfWithPasswordPrompt(file);
      if (!result) return;
      result.pdf.destroy();
      pageState.file = result.file;
      updateUI();
    }
  }
}

function populateLanguageList() {
  const langList = document.getElementById('lang-list');
  if (!langList) return;

  langList.innerHTML = '';

  const availableEntries = getAvailableTesseractLanguageEntries();
  if (availableEntries.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'text-sm text-yellow-300 p-2';
    emptyState.textContent =
      'No OCR languages are available in this deployment.';
    langList.appendChild(emptyState);
    return;
  }

  availableEntries.forEach(function ([code, name]) {
    const label = document.createElement('label');
    label.className =
      'flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 cursor-pointer';
    label.dataset.search = `${name} ${code}`.toLowerCase();

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
  updateLanguageAvailabilityNotice();

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
        (label as HTMLElement).style.display = (
          label as HTMLElement
        ).dataset.search?.includes(searchTerm)
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
