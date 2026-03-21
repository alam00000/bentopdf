import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, hexToRgb, formatBytes } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import {
  addPageNumbers as addPageNumbersToPdf,
  type PageNumberPosition,
  type PageNumberFormat,
} from '../utils/pdf-operations.js';

interface PageState {
  file: File | null;
  pdfDoc: PDFLibDocument | null;
}

const pageState: PageState = {
  file: null,
  pdfDoc: null,
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

function initializePage() {
  createIcons({ icons });

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const backBtn = document.getElementById('back-to-tools');
  const processBtn = document.getElementById('process-btn');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
    fileInput.addEventListener('click', () => {
      fileInput.value = '';
    });
  }

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-indigo-500');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500');
      if (e.dataTransfer?.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', addPageNumbers);
  }
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) {
    handleFiles(input.files);
  }
}

async function handleFiles(files: FileList) {
  const file = files[0];
  if (!file || file.type !== 'application/pdf') {
    showAlert('Invalid File', 'Please upload a valid PDF file.');
    return;
  }

  showLoader('Loading PDF...');
  try {
    const arrayBuffer = await file.arrayBuffer();
    pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer);
    pageState.file = file;

    updateFileDisplay();
    document.getElementById('options-panel')?.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    showAlert('Error', 'Failed to load PDF file.');
  } finally {
    hideLoader();
  }
}

function updateFileDisplay() {
  const fileDisplayArea = document.getElementById('file-display-area');
  if (!fileDisplayArea || !pageState.file || !pageState.pdfDoc) return;

  fileDisplayArea.innerHTML = '';
  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

  const infoContainer = document.createElement('div');
  infoContainer.className = 'flex flex-col flex-1 min-w-0';

  const nameSpan = document.createElement('div');
  nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
  nameSpan.textContent = pageState.file.name;

  const metaSpan = document.createElement('div');
  metaSpan.className = 'text-xs text-gray-400';
  metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageState.pdfDoc.getPageCount()} pages`;

  infoContainer.append(nameSpan, metaSpan);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  removeBtn.onclick = resetState;

  fileDiv.append(infoContainer, removeBtn);
  fileDisplayArea.appendChild(fileDiv);
  createIcons({ icons });
}

function resetState() {
  pageState.file = null;
  pageState.pdfDoc = null;
  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';
  document.getElementById('options-panel')?.classList.add('hidden');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

async function addPageNumbers() {
  if (!pageState.pdfDoc) {
    showAlert('Error', 'Please upload a PDF file first.');
    return;
  }

  showLoader('Adding page numbers...');
  try {
    const position = (document.getElementById('position') as HTMLSelectElement)
      .value as PageNumberPosition;
    const fontSize =
      parseInt(
        (document.getElementById('font-size') as HTMLInputElement).value
      ) || 12;
    const format =
      (document.getElementById('number-format') as HTMLSelectElement).value ===
      'page_x_of_y'
        ? ('page_x_of_y' as PageNumberFormat)
        : ('simple' as PageNumberFormat);
    const colorHex = (document.getElementById('text-color') as HTMLInputElement)
      .value;
    const textColor = hexToRgb(colorHex);

    const pdfBytes = new Uint8Array(await pageState.pdfDoc.save());
    const resultBytes = await addPageNumbersToPdf(pdfBytes, {
      position,
      fontSize,
      format,
      color: textColor,
    });

    downloadFile(
      new Blob([resultBytes as unknown as BlobPart], {
        type: 'application/pdf',
      }),
      'paginated.pdf'
    );
    showAlert('Success', 'Page numbers added successfully!', 'success', () => {
      resetState();
    });
  } catch (e) {
    console.error(e);
    showAlert('Error', 'Could not add page numbers.');
  } finally {
    hideLoader();
  }
}
