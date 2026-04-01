import { showAlert } from '../ui.js';
import {
  downloadFile,
  formatBytes,
  initializeQpdf,
  readFileAsArrayBuffer,
} from '../utils/helpers.js';
import { icons, createIcons } from 'lucide';
import type { OverlayPdfState, QpdfInstanceExtended } from '@/types';

const pageState: OverlayPdfState = {
  baseFile: null,
  overlayFile: null,
};

function resetState() {
  pageState.baseFile = null;
  pageState.overlayFile = null;

  const baseDisplay = document.getElementById('base-file-display');
  if (baseDisplay) baseDisplay.innerHTML = '';

  const overlayDisplay = document.getElementById('overlay-file-display');
  if (overlayDisplay) overlayDisplay.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const baseInput = document.getElementById(
    'base-file-input'
  ) as HTMLInputElement;
  if (baseInput) baseInput.value = '';

  const overlayInput = document.getElementById(
    'overlay-file-input'
  ) as HTMLInputElement;
  if (overlayInput) overlayInput.value = '';
}

function renderFileEntry(
  container: HTMLElement,
  file: File,
  onRemove: () => void
) {
  container.innerHTML = '';

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
  removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
  removeBtn.onclick = onRemove;

  fileDiv.append(infoContainer, removeBtn);
  container.appendChild(fileDiv);
  createIcons({ icons });
}

function updateUI() {
  const toolOptions = document.getElementById('tool-options');
  const baseDisplay = document.getElementById('base-file-display');
  const overlayDisplay = document.getElementById('overlay-file-display');

  if (baseDisplay && pageState.baseFile) {
    renderFileEntry(baseDisplay, pageState.baseFile, () => {
      pageState.baseFile = null;
      baseDisplay.innerHTML = '';
      updateUI();
    });
  }

  if (overlayDisplay && pageState.overlayFile) {
    renderFileEntry(overlayDisplay, pageState.overlayFile, () => {
      pageState.overlayFile = null;
      overlayDisplay.innerHTML = '';
      updateUI();
    });
  }

  if (toolOptions) {
    if (pageState.baseFile && pageState.overlayFile) {
      toolOptions.classList.remove('hidden');
    } else {
      toolOptions.classList.add('hidden');
    }
  }
}

function isPdf(file: File): boolean {
  return (
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  );
}

async function processOverlay() {
  if (!pageState.baseFile || !pageState.overlayFile) {
    showAlert(
      'Missing Files',
      'Please upload both a base PDF and an overlay/underlay PDF.'
    );
    return;
  }

  const loaderModal = document.getElementById('loader-modal');
  const loaderText = document.getElementById('loader-text');
  if (loaderModal) loaderModal.classList.remove('hidden');
  if (loaderText) loaderText.textContent = 'Initializing PDF engine...';

  const inputPath = '/input_base.pdf';
  const overlayPath = '/input_overlay.pdf';
  const outputPath = '/output.pdf';
  let qpdf: QpdfInstanceExtended;

  try {
    qpdf = await initializeQpdf();

    if (loaderText) loaderText.textContent = 'Reading files...';

    const baseBuffer = await readFileAsArrayBuffer(pageState.baseFile);
    const overlayBuffer = await readFileAsArrayBuffer(pageState.overlayFile);

    qpdf.FS.writeFile(inputPath, new Uint8Array(baseBuffer as ArrayBuffer));
    qpdf.FS.writeFile(
      overlayPath,
      new Uint8Array(overlayBuffer as ArrayBuffer)
    );

    const modeSelect = document.getElementById(
      'mode-select'
    ) as HTMLSelectElement;
    const pageRangeInput = document.getElementById(
      'page-range'
    ) as HTMLInputElement;
    const repeatCheckbox = document.getElementById(
      'repeat-toggle'
    ) as HTMLInputElement;

    const mode = modeSelect?.value === 'underlay' ? '--underlay' : '--overlay';
    const pageRange = pageRangeInput?.value.trim();
    const shouldRepeat = repeatCheckbox?.checked;

    if (loaderText)
      loaderText.textContent = `Applying ${mode.replace('--', '')}...`;

    const args = [inputPath, mode, overlayPath];

    if (pageRange) {
      args.push(`--to=${pageRange}`);
    }

    if (shouldRepeat) {
      args.push('--from=', '--repeat=1-z');
    }

    args.push('--', outputPath);

    qpdf.callMain(args);

    const outputFile = qpdf.FS.readFile(outputPath, { encoding: 'binary' });
    if (!outputFile || outputFile.length === 0) {
      throw new Error('Processing produced an empty file.');
    }

    const modeLabel = mode.replace('--', '');
    const baseName = pageState.baseFile.name.replace(/\.pdf$/i, '');
    const fileName = `${baseName}_${modeLabel}.pdf`;

    downloadFile(
      new Blob([new Uint8Array(outputFile)], { type: 'application/pdf' }),
      fileName
    );

    showAlert(
      'Success',
      `PDF ${modeLabel} applied successfully.`,
      'success',
      () => {
        resetState();
      }
    );
  } catch (error: unknown) {
    console.error('Overlay/underlay error:', error);
    showAlert(
      'Processing Failed',
      `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}.`
    );
  } finally {
    try {
      if (qpdf?.FS) {
        if (qpdf.FS.analyzePath(inputPath).exists) qpdf.FS.unlink(inputPath);
        if (qpdf.FS.analyzePath(overlayPath).exists)
          qpdf.FS.unlink(overlayPath);
        if (qpdf.FS.analyzePath(outputPath).exists) qpdf.FS.unlink(outputPath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup WASM FS:', cleanupError);
    }
    if (loaderModal) loaderModal.classList.add('hidden');
  }
}

function setupDropZone(
  dropZone: HTMLElement,
  fileInput: HTMLInputElement,
  onFile: (file: File) => void
) {
  fileInput.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0 && isPdf(files[0])) {
      onFile(files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('bg-gray-700');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('bg-gray-700');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('bg-gray-700');
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && isPdf(files[0])) {
      onFile(files[0]);
    }
  });

  fileInput.addEventListener('click', () => {
    fileInput.value = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const baseDropZone = document.getElementById('base-drop-zone');
  const baseInput = document.getElementById(
    'base-file-input'
  ) as HTMLInputElement;
  const overlayDropZone = document.getElementById('overlay-drop-zone');
  const overlayInput = document.getElementById(
    'overlay-file-input'
  ) as HTMLInputElement;
  const processBtn = document.getElementById('process-btn');
  const backBtn = document.getElementById('back-to-tools');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = import.meta.env.BASE_URL;
    });
  }

  if (baseDropZone && baseInput) {
    setupDropZone(baseDropZone, baseInput, (file) => {
      pageState.baseFile = file;
      updateUI();
    });
  }

  if (overlayDropZone && overlayInput) {
    setupDropZone(overlayDropZone, overlayInput, (file) => {
      pageState.overlayFile = file;
      updateUI();
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', processOverlay);
  }
});
