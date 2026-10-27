import { showAlert, showLoader } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';
import { isCpdfAvailable } from '../utils/cpdf-helper.js';
import {
  showWasmRequiredDialog,
  WasmProvider,
} from '../utils/wasm-provider.js';
import { batchDecryptIfNeeded } from '../utils/password-prompt.js';

import { trText, onPageReady } from '../i18n/i18n.js';

const worker = new Worker(
  import.meta.env.BASE_URL + 'workers/extract-attachments.worker.js'
);

interface ExtractState {
  files: File[];
}

const pageState: ExtractState = {
  files: [],
};

function resetState() {
  pageState.files = [];

  const fileDisplayArea = document.getElementById('file-display-area');
  if (fileDisplayArea) fileDisplayArea.innerHTML = '';

  const toolOptions = document.getElementById('tool-options');
  if (toolOptions) toolOptions.classList.add('hidden');

  const statusMessage = document.getElementById('status-message');
  if (statusMessage) statusMessage.classList.add('hidden');

  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';

  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    processBtn.removeAttribute('disabled');
  }
}

function showStatus(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
) {
  const statusMessage = document.getElementById(
    'status-message'
  ) as HTMLElement;
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = `mt-4 p-3 rounded-lg text-sm ${
    type === 'success'
      ? 'bg-green-900 text-green-200'
      : type === 'error'
        ? 'bg-red-900 text-red-200'
        : 'bg-blue-900 text-blue-200'
  }`;
  statusMessage.classList.remove('hidden');
}

worker.onmessage = function (e) {
  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    processBtn.removeAttribute('disabled');
  }

  if (e.data.status === 'success') {
    const attachments = e.data.attachments;

    if (attachments.length === 0) {
      showAlert(
        'No Attachments',
        'The PDF file(s) do not contain any attachments to extract.'
      );
      resetState();
      return;
    }

    const zip = new JSZip();
    let totalSize = 0;

    const usedNames = new Set<string>();
    for (const attachment of attachments) {
      const base =
        (attachment.name || 'attachment')
          .split(/[/\\]/)
          .pop()
          ?.replace(/^\.+/, '')
          .replace(/\p{Cc}/gu, '')
          .trim() || 'attachment';
      let safeName = base;
      let counter = 1;
      while (usedNames.has(safeName)) {
        const dot = base.lastIndexOf('.');
        safeName =
          dot > 0
            ? `${base.slice(0, dot)}_${counter}${base.slice(dot)}`
            : `${base}_${counter}`;
        counter++;
      }
      usedNames.add(safeName);
      zip.file(safeName, new Uint8Array(attachment.data));
      totalSize += attachment.data.byteLength;
    }

    zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
      downloadFile(zipBlob, 'extracted-attachments.zip');

      showAlert(
        'Success',
        trText('{{length}} attachment(s) extracted successfully!', {
          length: attachments.length,
        })
      );

      showStatus(
        trText(
          'Extraction completed! {{length}} attachment(s) in zip file ({{totalSize}}). Download started.',
          { length: attachments.length, totalSize: formatBytes(totalSize) }
        ),
        'success'
      );

      resetState();
    });
  } else if (e.data.status === 'error') {
    const errorMessage =
      e.data.message || trText('Unknown error occurred in worker.');
    console.error('Worker Error:', errorMessage);

    if (errorMessage.includes('No attachments were found')) {
      showAlert(
        'No Attachments',
        'The PDF file(s) do not contain any attachments to extract.'
      );
      resetState();
    } else {
      showStatus(`Error: ${errorMessage}`, 'error');
    }
  }
};

worker.onerror = function (error) {
  console.error('Worker error:', error);
  showStatus(
    trText('Worker error occurred. Check console for details.'),
    'error'
  );

  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    processBtn.removeAttribute('disabled');
  }
};

async function updateUI() {
  const fileDisplayArea = document.getElementById('file-display-area');
  const toolOptions = document.getElementById('tool-options');

  if (!fileDisplayArea) return;

  fileDisplayArea.innerHTML = '';

  if (pageState.files.length > 0) {
    const summaryDiv = document.createElement('div');
    summaryDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col overflow-hidden';

    const countSpan = document.createElement('div');
    countSpan.className = 'font-medium text-gray-200 text-sm mb-1';
    countSpan.textContent = trText('{{length}} PDF file(s) selected', {
      length: pageState.files.length,
    });

    const sizeSpan = document.createElement('div');
    sizeSpan.className = 'text-xs text-gray-400';
    const totalSize = pageState.files.reduce(function (sum, f) {
      return sum + f.size;
    }, 0);
    sizeSpan.textContent = formatBytes(totalSize);

    infoContainer.append(countSpan, sizeSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = function () {
      resetState();
    };

    summaryDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(summaryDiv);
    createIcons({ icons });

    if (toolOptions) toolOptions.classList.remove('hidden');
  } else {
    if (toolOptions) toolOptions.classList.add('hidden');
  }
}

async function extractAttachments() {
  if (pageState.files.length === 0) {
    showStatus(trText('No Files'), 'error');
    return;
  }

  // Check if CPDF is configured
  if (!isCpdfAvailable()) {
    showWasmRequiredDialog('cpdf');
    return;
  }

  const processBtn = document.getElementById('process-btn');
  if (processBtn) {
    processBtn.classList.add('opacity-50', 'cursor-not-allowed');
    processBtn.setAttribute('disabled', 'true');
  }

  showStatus(trText('Reading files...'), 'info');

  try {
    pageState.files = await batchDecryptIfNeeded(pageState.files);
    showLoader('Reading files...');

    const fileBuffers: ArrayBuffer[] = [];
    const fileNames: string[] = [];

    for (const file of pageState.files) {
      const buffer = await file.arrayBuffer();
      fileBuffers.push(buffer);
      fileNames.push(file.name);
    }

    if (fileBuffers.length === 0) {
      if (processBtn) {
        processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        processBtn.removeAttribute('disabled');
      }
      return;
    }

    showStatus(
      trText('Extracting attachments from {{length}} file(s)...', {
        length: pageState.files.length,
      }),
      'info'
    );

    const message = {
      command: 'extract-attachments',
      fileBuffers,
      fileNames,
      cpdfUrl: WasmProvider.getUrl('cpdf')! + 'coherentpdf.browser.min.js',
    };

    const transferables = fileBuffers.map(function (buf) {
      return buf;
    });
    worker.postMessage(message, transferables);
  } catch (error) {
    console.error('Error reading files:', error);
    showStatus(
      trText('Error reading files: {{error}}', {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      'error'
    );

    if (processBtn) {
      processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      processBtn.removeAttribute('disabled');
    }
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
      pageState.files = pdfFiles;
      updateUI();
    }
  }
}

onPageReady(function () {
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
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    });

    fileInput.addEventListener('click', function () {
      fileInput.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', extractAttachments);
  }
});
