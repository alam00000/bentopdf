import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { createIcons, icons } from 'lucide';
import { downloadFile } from '../utils/helpers';

interface DeskewResult {
  totalPages: number;
  correctedPages: number;
  angles: number[];
  corrected: boolean[];
}

let selectedFiles: File[] = [];
let pymupdf: PyMuPDF | null = null;

function initPyMuPDF(): PyMuPDF {
  if (!pymupdf) {
    pymupdf = new PyMuPDF({
      assetPath: import.meta.env.BASE_URL + 'pymupdf-wasm/',
    });
  }
  return pymupdf;
}

function showLoader(message: string): void {
  const loader = document.getElementById('loader-modal');
  const text = document.getElementById('loader-text');
  if (loader && text) {
    text.textContent = message;
    loader.classList.remove('hidden');
  }
}

function hideLoader(): void {
  const loader = document.getElementById('loader-modal');
  if (loader) {
    loader.classList.add('hidden');
  }
}

function showAlert(title: string, message: string): void {
  const modal = document.getElementById('alert-modal');
  const titleEl = document.getElementById('alert-title');
  const msgEl = document.getElementById('alert-message');
  if (modal && titleEl && msgEl) {
    titleEl.textContent = title;
    msgEl.textContent = message;
    modal.classList.remove('hidden');
  }
}

function updateFileDisplay(): void {
  const fileDisplayArea = document.getElementById('file-display-area');
  const fileControls = document.getElementById('file-controls');
  const deskewOptions = document.getElementById('deskew-options');
  const resultsArea = document.getElementById('results-area');

  if (!fileDisplayArea || !fileControls || !deskewOptions || !resultsArea)
    return;

  resultsArea.classList.add('hidden');

  if (selectedFiles.length === 0) {
    fileDisplayArea.innerHTML = '';
    fileControls.classList.add('hidden');
    deskewOptions.classList.add('hidden');
    return;
  }

  fileControls.classList.remove('hidden');
  deskewOptions.classList.remove('hidden');

  fileDisplayArea.innerHTML = selectedFiles
    .map(
      (file, index) => `
      <div class="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
        <div class="flex items-center gap-3">
          <i data-lucide="file-text" class="w-5 h-5 text-indigo-400"></i>
          <span class="text-gray-200 truncate max-w-xs">${file.name}</span>
          <span class="text-gray-500 text-sm">(${(file.size / 1024).toFixed(1)} KB)</span>
        </div>
        <button class="remove-file text-gray-400 hover:text-red-400" data-index="${index}">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    `
    )
    .join('');

  createIcons({ icons });

  fileDisplayArea.querySelectorAll('.remove-file').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(
        (e.currentTarget as HTMLElement).dataset.index || '0',
        10
      );
      selectedFiles.splice(index, 1);
      updateFileDisplay();
    });
  });
}

function displayResults(result: DeskewResult): void {
  const resultsArea = document.getElementById('results-area');
  const totalEl = document.getElementById('result-total');
  const correctedEl = document.getElementById('result-corrected');
  const anglesList = document.getElementById('angles-list');

  if (!resultsArea || !totalEl || !correctedEl || !anglesList) return;

  resultsArea.classList.remove('hidden');
  totalEl.textContent = result.totalPages.toString();
  correctedEl.textContent = result.correctedPages.toString();

  anglesList.innerHTML = result.angles
    .map((angle, idx) => {
      const wasCorrected = result.corrected[idx];
      const color = wasCorrected ? 'text-green-400' : 'text-gray-400';
      const icon = wasCorrected ? 'check' : 'minus';
      return `
        <div class="flex items-center gap-2 text-sm py-1">
          <i data-lucide="${icon}" class="w-4 h-4 ${color}"></i>
          <span class="text-gray-300">Page ${idx + 1}:</span>
          <span class="${color}">${angle.toFixed(2)}°</span>
          ${wasCorrected ? '<span class="text-green-400 text-xs">(corrected)</span>' : ''}
        </div>
      `;
    })
    .join('');

  createIcons({ icons });
}

async function processDeskew(): Promise<void> {
  if (selectedFiles.length === 0) {
    showAlert('No Files', 'Please select at least one PDF file.');
    return;
  }

  const thresholdSelect = document.getElementById(
    'deskew-threshold'
  ) as HTMLSelectElement;
  const dpiSelect = document.getElementById('deskew-dpi') as HTMLSelectElement;

  const threshold = parseFloat(thresholdSelect?.value || '0.5');
  const dpi = parseInt(dpiSelect?.value || '150', 10);

  showLoader('Initializing PyMuPDF...');

  try {
    const pdf = initPyMuPDF();
    await pdf.load();

    for (const file of selectedFiles) {
      showLoader(`Deskewing ${file.name}...`);

      const { pdf: resultPdf, result } = await pdf.deskewPdf(file, {
        threshold,
        dpi,
      });

      displayResults(result);

      const filename = file.name.replace('.pdf', '_deskewed.pdf');
      downloadFile(resultPdf, filename);
    }

    hideLoader();
    showAlert(
      'Success',
      `Deskewed ${selectedFiles.length} file(s). ${selectedFiles.length > 1 ? 'Downloads started for all files.' : ''}`
    );
  } catch (error) {
    hideLoader();
    console.error('Deskew error:', error);
    showAlert(
      'Error',
      `Failed to deskew PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function initPage(): void {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const addMoreBtn = document.getElementById('add-more-btn');
  const clearFilesBtn = document.getElementById('clear-files-btn');
  const processBtn = document.getElementById('process-btn');
  const alertOk = document.getElementById('alert-ok');
  const backBtn = document.getElementById('back-to-tools');

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        selectedFiles = [...selectedFiles, ...Array.from(fileInput.files)];
        updateFileDisplay();
        fileInput.value = '';
      }
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-gray-700');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('bg-gray-700');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-700');
      if (e.dataTransfer?.files) {
        const pdfFiles = Array.from(e.dataTransfer.files).filter(
          (f) => f.type === 'application/pdf'
        );
        selectedFiles = [...selectedFiles, ...pdfFiles];
        updateFileDisplay();
      }
    });
  }

  if (addMoreBtn) {
    addMoreBtn.addEventListener('click', () => fileInput?.click());
  }

  if (clearFilesBtn) {
    clearFilesBtn.addEventListener('click', () => {
      selectedFiles = [];
      updateFileDisplay();
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', processDeskew);
  }

  if (alertOk) {
    alertOk.addEventListener('click', () => {
      document.getElementById('alert-modal')?.classList.add('hidden');
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  createIcons({ icons });
}

document.addEventListener('DOMContentLoaded', initPage);
