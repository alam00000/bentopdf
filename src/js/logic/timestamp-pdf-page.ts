import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import {
  readFileAsArrayBuffer,
  formatBytes,
  downloadFile,
  getPDFDocument,
} from '../utils/helpers.js';
import { TIMESTAMP_TSA_PRESETS } from '../config/timestamp-tsa.js';
import { timestampPdf } from './digital-sign-pdf.js';

interface TimestampState {
  pdfFile: File | null;
  pdfBytes: Uint8Array | null;
}

const state: TimestampState = {
  pdfFile: null,
  pdfBytes: null,
};

function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function resetState(): void {
  state.pdfFile = null;
  state.pdfBytes = null;

  const fileDisplayArea = getElement<HTMLDivElement>('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const fileInput = getElement<HTMLInputElement>('file-input');
  if (fileInput) fileInput.value = '';

  const tsaSection = getElement<HTMLDivElement>('tsa-section');
  if (tsaSection) tsaSection.classList.add('hidden');

  updateProcessButton();
}

function initializePage(): void {
  createIcons({ icons });

  const fileInput = getElement<HTMLInputElement>('file-input');
  const dropZone = getElement<HTMLDivElement>('drop-zone');
  const processBtn = getElement<HTMLButtonElement>('process-btn');
  const backBtn = getElement<HTMLButtonElement>('back-to-tools');
  const tsaPreset = getElement<HTMLSelectElement>('tsa-preset');

  populateTsaPresets(tsaPreset);

  if (fileInput) {
    fileInput.addEventListener('change', handlePdfUpload);
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
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
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handlePdfFile(droppedFiles[0]);
      }
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', processTimestamp);
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }
}

function populateTsaPresets(tsaPreset: HTMLSelectElement | null): void {
  if (!tsaPreset) return;

  tsaPreset.replaceChildren();

  for (const preset of TIMESTAMP_TSA_PRESETS) {
    const option = document.createElement('option');
    option.value = preset.url;
    option.textContent = preset.label;
    tsaPreset.append(option);
  }
}

function handlePdfUpload(e: Event): void {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handlePdfFile(input.files[0]);
  }
}

async function handlePdfFile(file: File): Promise<void> {
  if (
    file.type !== 'application/pdf' &&
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    showAlert('Invalid File', 'Please select a PDF file.');
    return;
  }

  state.pdfFile = file;
  state.pdfBytes = new Uint8Array(
    (await readFileAsArrayBuffer(file)) as ArrayBuffer
  );

  updatePdfDisplay();
  showTsaSection();
  updateProcessButton();
}

async function updatePdfDisplay(): Promise<void> {
  const fileDisplayArea = getElement<HTMLDivElement>('file-display-area');

  if (!fileDisplayArea || !state.pdfFile) return;

  fileDisplayArea.innerHTML = '';

  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'flex flex-col flex-1 min-w-0';

  const nameSpan = document.createElement('div');
  nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
  nameSpan.textContent = state.pdfFile.name;

  const metaSpan = document.createElement('div');
  metaSpan.className = 'text-xs text-gray-400';
  metaSpan.textContent = `${formatBytes(state.pdfFile.size)} • Loading pages...`;

  infoContainer.append(nameSpan, metaSpan);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  removeBtn.onclick = () => {
    state.pdfFile = null;
    state.pdfBytes = null;
    fileDisplayArea.innerHTML = '';
    hideTsaSection();
    updateProcessButton();
  };

  fileDiv.append(infoContainer, removeBtn);
  fileDisplayArea.appendChild(fileDiv);
  createIcons({ icons });

  try {
    if (state.pdfBytes) {
      const pdfDoc = await getPDFDocument({
        data: state.pdfBytes.slice(),
      }).promise;
      metaSpan.textContent = `${formatBytes(state.pdfFile.size)} • ${pdfDoc.numPages} pages`;
    }
  } catch (error) {
    console.error('Error loading PDF:', error);
    metaSpan.textContent = `${formatBytes(state.pdfFile.size)}`;
  }
}

function showTsaSection(): void {
  const tsaSection = getElement<HTMLDivElement>('tsa-section');
  if (tsaSection) {
    tsaSection.classList.remove('hidden');
  }
}

function hideTsaSection(): void {
  const tsaSection = getElement<HTMLDivElement>('tsa-section');
  if (tsaSection) {
    tsaSection.classList.add('hidden');
  }
}

function updateProcessButton(): void {
  const processBtn = getElement<HTMLButtonElement>('process-btn');
  if (!processBtn) return;

  if (state.pdfBytes) {
    processBtn.classList.remove('hidden');
    processBtn.disabled = false;
  } else {
    processBtn.classList.add('hidden');
    processBtn.disabled = true;
  }
}

function getTsaUrl(): string | null {
  const tsaPreset = getElement<HTMLSelectElement>('tsa-preset');
  if (!tsaPreset) return null;

  return tsaPreset.value;
}

async function processTimestamp(): Promise<void> {
  if (!state.pdfBytes || !state.pdfFile) {
    showAlert('No File', 'Please upload a PDF file first.');
    return;
  }

  const tsaUrl = getTsaUrl();
  if (!tsaUrl) return;

  showLoader('Applying timestamp...');

  try {
    const timestampedBytes = await timestampPdf(state.pdfBytes, tsaUrl);

    const outputFilename = state.pdfFile.name.replace(
      /\.pdf$/i,
      '_timestamped.pdf'
    );
    const blob = new Blob([new Uint8Array(timestampedBytes)], {
      type: 'application/pdf',
    });
    downloadFile(blob, outputFilename);

    showAlert(
      'Success',
      'PDF timestamped successfully! The timestamp can be verified in Adobe Acrobat and other PDF readers.',
      'success'
    );

    resetState();
  } catch (error) {
    console.error('Timestamp error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    showAlert(
      'Timestamp Failed',
      `Failed to timestamp PDF: ${message}\n\nPlease try a different TSA server or check your internet connection.`
    );
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', initializePage);
