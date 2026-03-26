import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { deduplicateFileName } from '../utils/deduplicate-filename.js';
import { batchDecryptIfNeeded } from '../utils/password-prompt.js';
import { loadPdfDocument } from '../utils/load-pdf-document.js';

interface ReverseState {
  files: File[];
}

const reverseState: ReverseState = {
  files: [],
};

function resetState() {
  reverseState.files = [];

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
}

function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const toolOptions = document.getElementById('tool-options');

  if (!fileDisplayArea) return;

  fileDisplayArea.innerHTML = '';

  if (reverseState.files.length > 0) {
    reverseState.files.forEach(function (file, index) {
      const fileDiv = document.createElement('div');
      fileDiv.className =
        'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

      const infoContainer = document.createElement('div');
      infoContainer.className = 'flex flex-col overflow-hidden';

      const nameSpan = document.createElement('div');
      nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
      nameSpan.textContent = file.name;

      const metaSpan = document.createElement('div');
      metaSpan.className = 'text-xs text-gray-400';
      metaSpan.textContent = formatBytes(file.size);

      infoContainer.append(nameSpan, metaSpan);

      const removeBtn = document.createElement('button');
      removeBtn.className =
        'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
      removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      removeBtn.onclick = function () {
        reverseState.files = reverseState.files.filter(function (_, i) {
          return i !== index;
        });
        updateUI();
      };

      fileDiv.append(infoContainer, removeBtn);
      fileDisplayArea.appendChild(fileDiv);
    });

    createIcons({ icons });

    if (toolOptions) toolOptions.classList.remove('hidden');
  } else {
    if (toolOptions) toolOptions.classList.add('hidden');
  }
}

async function reverseSingleFile(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await loadPdfDocument(arrayBuffer);

  const newPdf = await PDFLibDocument.create();
  const pageCount = pdfDoc.getPageCount();
  const reversedIndices = Array.from({ length: pageCount }, function (_, i) {
    return pageCount - 1 - i;
  });

  const copiedPages = await newPdf.copyPages(pdfDoc, reversedIndices);
  copiedPages.forEach(function (page) {
    newPdf.addPage(page);
  });

  return newPdf.save();
}

async function reversePages() {
  if (reverseState.files.length === 0) {
    showAlert('No Files', 'Please select one or more PDF files.');
    return;
  }

  try {
    const decryptedFiles = await batchDecryptIfNeeded(reverseState.files);
    showLoader('Reversing page order...');
    reverseState.files = decryptedFiles;

    const validFiles = reverseState.files.filter(function (f) {
      return f !== null;
    });

    if (validFiles.length === 0) {
      hideLoader();
      return;
    }

    const zip = new JSZip();
    const usedNames = new Set<string>();

    for (let j = 0; j < validFiles.length; j++) {
      const file = validFiles[j];
      showLoader(`Reversing ${file.name} (${j + 1}/${validFiles.length})...`);

      const newPdfBytes = await reverseSingleFile(file);
      const originalName = file.name.replace(/\.pdf$/i, '');
      const fileName = `${originalName}_reversed.pdf`;
      const zipEntryName = deduplicateFileName(fileName, usedNames);
      zip.file(zipEntryName, newPdfBytes);
    }

    if (validFiles.length === 1) {
      const file = validFiles[0];
      const newPdfBytes = await reverseSingleFile(file);
      const originalName = file.name.replace(/\.pdf$/i, '');

      downloadFile(
        new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
        `${originalName}_reversed.pdf`
      );
    } else {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'reversed_pdfs.zip');
    }

    showAlert(
      'Success',
      'Pages have been reversed successfully!',
      'success',
      function () {
        resetState();
      }
    );
  } catch (e) {
    console.error(e);
    showAlert(
      'Error',
      'Could not reverse the PDF pages. Please check that your files are valid PDFs.'
    );
  } finally {
    hideLoader();
  }
}

function handleFileSelect(files: FileList | null) {
  if (files && files.length > 0) {
    const pdfFiles = Array.from(files).filter(function (f) {
      return (
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
    });
    if (pdfFiles.length > 0) {
      reverseState.files = [...reverseState.files, ...pdfFiles];
      updateUI();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');

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
      handleFileSelect(e.dataTransfer?.files || null);
    });

    fileInput.addEventListener('click', function () {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', reversePages);
  }
});
