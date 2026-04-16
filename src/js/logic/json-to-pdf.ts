import JSZip from 'jszip';
import {
  downloadFile,
  formatBytes,
  readFileAsArrayBuffer,
} from '../utils/helpers';
import { initializeGlobalShortcuts } from '../utils/shortcuts-init.js';
import { isCpdfAvailable } from '../utils/cpdf-helper.js';
import {
  showWasmRequiredDialog,
  WasmProvider,
} from '../utils/wasm-provider.js';
import { initI18n, t } from '../i18n/i18n';

const worker = new Worker(
  import.meta.env.BASE_URL + 'workers/json-to-pdf.worker.js'
);

let selectedFiles: File[] = [];

const jsonFilesInput = document.getElementById('jsonFiles') as HTMLInputElement;
const convertBtn = document.getElementById('convertBtn') as HTMLButtonElement;
const statusMessage = document.getElementById(
  'status-message'
) as HTMLDivElement;
const fileListDiv = document.getElementById('fileList') as HTMLDivElement;
const backToToolsBtn = document.getElementById(
  'back-to-tools'
) as HTMLButtonElement;

function showStatus(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
) {
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

function hideStatus() {
  statusMessage.classList.add('hidden');
}

function updateFileList() {
  fileListDiv.innerHTML = '';
  if (selectedFiles.length === 0) {
    fileListDiv.classList.add('hidden');
    return;
  }

  fileListDiv.classList.remove('hidden');
  selectedFiles.forEach((file) => {
    const fileDiv = document.createElement('div');
    fileDiv.className =
      'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm mb-2';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'truncate font-medium text-gray-200';
    nameSpan.textContent = file.name;

    const sizeSpan = document.createElement('span');
    sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400';
    sizeSpan.textContent = formatBytes(file.size);

    fileDiv.append(nameSpan, sizeSpan);
    fileListDiv.appendChild(fileDiv);
  });
}

jsonFilesInput.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFiles = Array.from(target.files);
    convertBtn.disabled = selectedFiles.length === 0;
    updateFileList();

    if (selectedFiles.length === 0) {
      showStatus(t('tools:jsonToPdf.status.selectAtLeastOne'), 'info');
    } else {
      showStatus(
        t('tools:jsonToPdf.status.selectedReady', {
          count: selectedFiles.length,
        }),
        'info'
      );
    }
  }
});

async function convertJSONsToPDF() {
  if (selectedFiles.length === 0) {
    showStatus(t('tools:jsonToPdf.status.selectAtLeastOne'), 'error');
    return;
  }

  // Check if CPDF is configured
  if (!isCpdfAvailable()) {
    showWasmRequiredDialog('cpdf');
    return;
  }

  try {
    convertBtn.disabled = true;
    showStatus(t('tools:jsonToPdf.status.readingFiles'), 'info');

    const fileBuffers = await Promise.all(
      selectedFiles.map((file) => readFileAsArrayBuffer(file))
    );

    showStatus(t('tools:jsonToPdf.status.converting'), 'info');

    worker.postMessage(
      {
        command: 'convert',
        fileBuffers: fileBuffers,
        fileNames: selectedFiles.map((f) => f.name),
        cpdfUrl: WasmProvider.getUrl('cpdf')! + 'coherentpdf.browser.min.js',
      },
      fileBuffers
    );
  } catch (error) {
    console.error('Error reading files:', error);
    showStatus(
      t('tools:jsonToPdf.status.readError', {
        message:
          error instanceof Error ? error.message : t('common.unknownError'),
      }),
      'error'
    );
    convertBtn.disabled = false;
  }
}

worker.onmessage = async (e: MessageEvent) => {
  convertBtn.disabled = false;

  if (e.data.status === 'success') {
    const pdfFiles = e.data.pdfFiles as Array<{
      name: string;
      data: ArrayBuffer;
    }>;

    try {
      showStatus(t('tools:jsonToPdf.status.creatingZip'), 'info');

      const zip = new JSZip();
      pdfFiles.forEach(({ name, data }) => {
        const pdfName = name.replace(/\.json$/i, '.pdf');
        const uint8Array = new Uint8Array(data);
        zip.file(pdfName, uint8Array);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jsons-to-pdf.zip';
      downloadFile(zipBlob, 'jsons-to-pdf.zip');

      showStatus(t('tools:jsonToPdf.status.success'), 'success');

      selectedFiles = [];
      jsonFilesInput.value = '';
      fileListDiv.innerHTML = '';
      fileListDiv.classList.add('hidden');
      convertBtn.disabled = true;

      setTimeout(() => {
        hideStatus();
      }, 3000);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      showStatus(
        t('tools:jsonToPdf.status.zipError', {
          message:
            error instanceof Error ? error.message : t('common.unknownError'),
        }),
        'error'
      );
    }
  } else if (e.data.status === 'error') {
    const errorMessage = e.data.message || t('common.unknownError');
    console.error('Worker Error:', errorMessage);
    showStatus(
      t('tools:jsonToPdf.status.workerError', { message: errorMessage }),
      'error'
    );
  }
};

if (backToToolsBtn) {
  backToToolsBtn.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

convertBtn.addEventListener('click', convertJSONsToPDF);

// Initialize after i18n is ready so the default status is translated.
void (async () => {
  await initI18n();
  showStatus(t('tools:jsonToPdf.status.getStarted'), 'info');
  initializeGlobalShortcuts();
})();
