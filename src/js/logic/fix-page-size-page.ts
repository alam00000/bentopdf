import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, hexToRgb } from '../utils/helpers.js';
import { fixPageSize as fixPageSizeCore } from '../utils/pdf-operations';
import { loadPdfWithPasswordPrompt } from '../utils/password-prompt.js';
import { icons, createIcons } from 'lucide';
import { FixPageSizeState } from '@/types';

const pageState: FixPageSizeState = {
  file: null,
};

function resetState() {
  pageState.file = null;

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
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

async function fixPageSize() {
  if (!pageState.file) {
    showAlert('No File', 'Please upload a PDF file first.');
    return;
  }

  const targetSize = (
    document.getElementById('target-size') as HTMLSelectElement
  ).value;
  const orientation = (
    document.getElementById('orientation') as HTMLSelectElement
  ).value;
  const scalingMode = (
    document.querySelector(
      'input[name="scaling-mode"]:checked'
    ) as HTMLInputElement
  ).value;
  const backgroundColor = hexToRgb(
    (document.getElementById('background-color') as HTMLInputElement).value
  );

  const loaderModal = document.getElementById('loader-modal');
  const loaderText = document.getElementById('loader-text');
  if (loaderModal) loaderModal.classList.remove('hidden');
  if (loaderText) loaderText.textContent = 'Standardizing pages...';

  try {
    const customWidth =
      parseFloat(
        (document.getElementById('custom-width') as HTMLInputElement)?.value
      ) || 210;
    const customHeight =
      parseFloat(
        (document.getElementById('custom-height') as HTMLInputElement)?.value
      ) || 297;
    const customUnits =
      (document.getElementById('custom-units') as HTMLSelectElement)?.value ||
      'mm';

    const arrayBuffer = await pageState.file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    const newPdfBytes = await fixPageSizeCore(pdfBytes, {
      targetSize,
      orientation,
      scalingMode,
      backgroundColor,
      customWidth,
      customHeight,
      customUnits,
    });

    downloadFile(
      new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
      'standardized.pdf'
    );
    showAlert(
      'Success',
      'Page sizes standardized successfully!',
      'success',
      () => {
        resetState();
      }
    );
  } catch (e) {
    console.error(e);
    showAlert('Error', 'An error occurred while standardizing pages.');
  } finally {
    if (loaderModal) loaderModal.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const dropZone = document.getElementById('drop-zone');
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');
  const targetSizeSelect = document.getElementById('target-size');
  const customSizeWrapper = document.getElementById('custom-size-wrapper');

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  // Setup custom size toggle
  if (targetSizeSelect && customSizeWrapper) {
    targetSizeSelect.addEventListener('change', function () {
      customSizeWrapper.classList.toggle(
        'hidden',
        (targetSizeSelect as HTMLSelectElement).value !== 'Custom'
      );
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

  if (processBtn) {
    processBtn.addEventListener('click', fixPageSize);
  }
});
