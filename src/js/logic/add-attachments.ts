import { showLoader, hideLoader, showAlert } from '../ui';
import { readFileAsArrayBuffer, downloadFile } from '../utils/helpers';
import { state } from '../state';

const worker = new Worker(import.meta.env.BASE_URL + 'workers/add-attachments.worker.js');

let attachments: File[] = [];

worker.onmessage = (e) => {
  const data = e.data;

  if (data.status === 'success' && data.modifiedPDF !== undefined) {
    hideLoader();

    downloadFile(
      new Blob([new Uint8Array(data.modifiedPDF)], { type: 'application/pdf' }),
      `attached-${state.files[0].name}`
    );

    showAlert('Success', `${attachments.length} file(s) attached successfully.`);
    clearAttachments();
  } else if (data.status === 'error') {
    hideLoader();
    showAlert('Error', data.message || 'Unknown error occurred.');
    clearAttachments();
  }
};

worker.onerror = (error) => {
  hideLoader();
  console.error('Worker error:', error);
  showAlert('Error', 'Worker error occurred. Check console for details.');
  clearAttachments();
};

export async function addAttachments() {
  if (!state.files || state.files.length === 0) {
    showAlert('Error', 'Main PDF is not loaded.');
    return;
  }
  if (attachments.length === 0) {
    showAlert('No Files', 'Please select at least one file to attach.');
    return;
  }

  const attachmentLevel = (
    document.querySelector('input[name="attachment-level"]:checked') as HTMLInputElement
  )?.value || 'document';

  let pageRange: string = '';

  if (attachmentLevel === 'page') {
    const pageRangeInput = document.getElementById('attachment-page-range') as HTMLInputElement;
    pageRange = pageRangeInput?.value?.trim() || '';

    if (!pageRange) {
      showAlert('Error', 'Please specify a page range for page-level attachments.');
      return;
    }
  }

  showLoader('Embedding files into PDF...');
  try {
    const pdfFile = state.files[0];
    const pdfBuffer = (await readFileAsArrayBuffer(pdfFile)) as ArrayBuffer;

    const attachmentBuffers: ArrayBuffer[] = [];
    const attachmentNames: string[] = [];

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      showLoader(`Reading ${file.name} (${i + 1}/${attachments.length})...`);

      const fileBuffer = (await readFileAsArrayBuffer(file)) as ArrayBuffer;
      attachmentBuffers.push(fileBuffer);
      attachmentNames.push(file.name);
    }

    showLoader('Attaching files to PDF...');

    const message = {
      command: 'add-attachments',
      pdfBuffer: pdfBuffer,
      attachmentBuffers: attachmentBuffers,
      attachmentNames: attachmentNames,
      attachmentLevel: attachmentLevel,
      pageRange: pageRange
    };

    const transferables = [pdfBuffer, ...attachmentBuffers];
    worker.postMessage(message, transferables);

  } catch (error: any) {
    console.error('Error attaching files:', error);
    hideLoader();
    showAlert('Error', `Failed to attach files: ${error.message}`);
    clearAttachments();
  }
}

function clearAttachments() {
  attachments = [];
  const fileListDiv = document.getElementById('attachment-file-list');
  const attachmentInput = document.getElementById(
    'attachment-files-input'
  ) as HTMLInputElement;
  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;
  const attachmentLevelOptions = document.getElementById('attachment-level-options');
  const pageRangeWrapper = document.getElementById('page-range-wrapper');

  if (fileListDiv) fileListDiv.innerHTML = '';
  if (attachmentInput) attachmentInput.value = '';
  if (processBtn) {
    processBtn.disabled = true;
    processBtn.classList.add('hidden');
  }
  if (attachmentLevelOptions) {
    attachmentLevelOptions.classList.add('hidden');
  }
  if (pageRangeWrapper) {
    pageRangeWrapper.classList.add('hidden');
  }

  const documentRadio = document.querySelector('input[name="attachment-level"][value="document"]') as HTMLInputElement;
  if (documentRadio) {
    documentRadio.checked = true;
  }
}

export function setupAddAttachmentsTool() {
  const optionsDiv = document.getElementById('attachment-options');
  const attachmentInput = document.getElementById(
    'attachment-files-input'
  ) as HTMLInputElement;
  const fileListDiv = document.getElementById('attachment-file-list');
  const processBtn = document.getElementById(
    'process-btn'
  ) as HTMLButtonElement;
  const attachmentLevelOptions = document.getElementById('attachment-level-options');
  const pageRangeWrapper = document.getElementById('page-range-wrapper');
  const totalPagesSpan = document.getElementById('attachment-total-pages');

  if (!optionsDiv || !attachmentInput || !fileListDiv || !processBtn) {
    console.error('Attachment tool UI elements not found.');
    return;
  }

  if (!state.files || state.files.length === 0) {
    console.error('No PDF file loaded for adding attachments.');
    return;
  }

  optionsDiv.classList.remove('hidden');

  if (totalPagesSpan && state.pdfDoc) {
    totalPagesSpan.textContent = state.pdfDoc.getPageCount().toString();
  }

  if (attachmentInput.dataset.listenerAttached) return;
  attachmentInput.dataset.listenerAttached = 'true';

  attachmentInput.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      attachments = Array.from(files);

      fileListDiv.innerHTML = '';
      attachments.forEach((file) => {
        const div = document.createElement('div');
        div.className =
          'flex justify-between items-center p-2 bg-gray-800 rounded-md text-white';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'truncate text-sm';
        nameSpan.textContent = file.name;

        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'text-xs text-gray-400';
        sizeSpan.textContent = `${Math.round(file.size / 1024)} KB`;

        div.appendChild(nameSpan);
        div.appendChild(sizeSpan);
        fileListDiv.appendChild(div);
      });

      if (attachmentLevelOptions) {
        attachmentLevelOptions.classList.remove('hidden');
      }

      processBtn.disabled = false;
      processBtn.classList.remove('hidden');
    } else {
      clearAttachments();
    }
  });

  const attachmentLevelRadios = document.querySelectorAll('input[name="attachment-level"]');
  attachmentLevelRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (value === 'page' && pageRangeWrapper) {
        pageRangeWrapper.classList.remove('hidden');
      } else if (pageRangeWrapper) {
        pageRangeWrapper.classList.add('hidden');
      }
    });
  });

  processBtn.onclick = addAttachments;
}
