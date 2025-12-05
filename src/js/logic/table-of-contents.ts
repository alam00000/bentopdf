import { downloadFile, formatBytes } from "../utils/helpers";
import { initializeGlobalShortcuts } from "../utils/shortcuts-init.js";


const worker = new Worker(import.meta.env.BASE_URL + 'workers/table-of-contents.worker.js');

let pdfFile: File | null = null;

const dropZone = document.getElementById('drop-zone') as HTMLElement;
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const generateBtn = document.getElementById(
  'generate-btn'
) as HTMLButtonElement;
const tocTitleInput = document.getElementById('toc-title') as HTMLInputElement;
const fontSizeSelect = document.getElementById(
  'font-size'
) as HTMLSelectElement;
const fontFamilySelect = document.getElementById(
  'font-family'
) as HTMLSelectElement;
const addBookmarkCheckbox = document.getElementById(
  'add-bookmark'
) as HTMLInputElement;
const statusMessage = document.getElementById('status-message') as HTMLElement;
const fileDisplayArea = document.getElementById(
  'file-display-area'
) as HTMLElement;
const backToToolsBtn = document.getElementById(
  'back-to-tools'
) as HTMLButtonElement;

interface GenerateTOCMessage {
  command: 'generate-toc';
  pdfData: ArrayBuffer;
  title: string;
  fontSize: number;
  fontFamily: number;
  addBookmark: boolean;
}

interface TOCSuccessResponse {
  status: 'success';
  pdfBytes: ArrayBuffer;
}

interface TOCErrorResponse {
  status: 'error';
  message: string;
}

type TOCWorkerResponse = TOCSuccessResponse | TOCErrorResponse;

function showStatus(
  message: string,
  type: 'success' | 'error' | 'info' = 'info'
) {
  statusMessage.textContent = message;
  statusMessage.className = `mt-4 p-3 rounded-lg text-sm ${type === 'success'
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

function renderFileDisplay(file: File) {
  fileDisplayArea.innerHTML = '';
  fileDisplayArea.classList.remove('hidden');

  const fileDiv = document.createElement('div');
  fileDiv.className =
    'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'truncate font-medium text-gray-200';
  nameSpan.textContent = file.name;

  const sizeSpan = document.createElement('span');
  sizeSpan.className = 'flex-shrink-0 ml-4 text-gray-400';
  sizeSpan.textContent = formatBytes(file.size);

  fileDiv.append(nameSpan, sizeSpan);
  fileDisplayArea.appendChild(fileDiv);
}

function handleFileSelect(file: File) {
  if (file.type !== 'application/pdf') {
    showStatus('Please select a PDF file.', 'error');
    return;
  }

  pdfFile = file;
  generateBtn.disabled = false;
  renderFileDisplay(file);
}

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-blue-500');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-blue-500');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-blue-500');
  const file = e.dataTransfer?.files[0];
  if (file) {
    handleFileSelect(file);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    handleFileSelect(file);
  }
});

async function generateTableOfContents() {
  if (!pdfFile) {
    showStatus('Please select a PDF file first.', 'error');
    return;
  }

  try {
    generateBtn.disabled = true;
    showStatus('Reading file (Main Thread)...', 'info');

    const arrayBuffer = await pdfFile.arrayBuffer();

    showStatus('Generating table of contents...', 'info');

    const title = tocTitleInput.value || 'Table of Contents';
    const fontSize = parseInt(fontSizeSelect.value, 10);
    const fontFamily = parseInt(fontFamilySelect.value, 10);
    const addBookmark = addBookmarkCheckbox.checked;

    const message: GenerateTOCMessage = {
      command: 'generate-toc',
      pdfData: arrayBuffer,
      title,
      fontSize,
      fontFamily,
      addBookmark,
    };

    worker.postMessage(message, [arrayBuffer]);
  } catch (error) {
    console.error('Error reading file:', error);
    showStatus(
      `Error reading file: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      'error'
    );
    generateBtn.disabled = false;
  }
}

worker.onmessage = (e: MessageEvent<TOCWorkerResponse>) => {
  generateBtn.disabled = false;

  if (e.data.status === 'success') {
    const pdfBytesBuffer = e.data.pdfBytes;
    const pdfBytes = new Uint8Array(pdfBytesBuffer);

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    downloadFile(blob, pdfFile?.name.replace('.pdf', '_with_toc.pdf') || 'output_with_toc.pdf');

    showStatus(
      'Table of contents generated successfully! Download started.',
      'success'
    );

    hideStatus();
    pdfFile = null;
    fileInput.value = '';
    fileDisplayArea.innerHTML = '';
    fileDisplayArea.classList.add('hidden');
    generateBtn.disabled = true;
  } else if (e.data.status === 'error') {
    const errorMessage = e.data.message || 'Unknown error occurred in worker.';
    console.error('Worker Error:', errorMessage);
    showStatus(`Error: ${errorMessage}`, 'error');
  }
};

worker.onerror = (error) => {
  console.error('Worker error:', error);
  showStatus('Worker error occurred. Check console for details.', 'error');
  generateBtn.disabled = false;
};

if (backToToolsBtn) {
  backToToolsBtn.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

generateBtn.addEventListener('click', generateTableOfContents);

initializeGlobalShortcuts();
