import { downloadFile, formatBytes } from '../utils/helpers.js';
import { state } from '../state.js';
import JSZip from 'jszip';

const worker = new Worker('/workers/extract-attachments.worker.js');

interface ExtractAttachmentSuccessResponse {
  status: 'success';
  attachments: Array<{ name: string; data: ArrayBuffer }>;
}

interface ExtractAttachmentErrorResponse {
  status: 'error';
  message: string;
}

type ExtractAttachmentResponse = ExtractAttachmentSuccessResponse | ExtractAttachmentErrorResponse;

export async function extractAttachments() {
  if (state.files.length === 0) {
    showStatus('No Files', 'error');
    return;
  }

  document.getElementById('process-btn')?.classList.add('opacity-50', 'cursor-not-allowed');
  document.getElementById('process-btn')?.setAttribute('disabled', 'true');
  
  showStatus('Reading files (Main Thread)...', 'info');

  try {
    const fileBuffers: ArrayBuffer[] = [];
    const fileNames: string[] = [];

    for (const file of state.files) {
      const buffer = await file.arrayBuffer();
      fileBuffers.push(buffer);
      fileNames.push(file.name);
    }

    showStatus(`Extracting attachments from ${state.files.length} file(s)...`, 'info');

    const message: ExtractAttachmentsMessage = {
      command: 'extract-attachments',
      fileBuffers,
      fileNames,
    };

    const transferables = fileBuffers.map(buf => buf);
    worker.postMessage(message, transferables);

  } catch (error) {
    console.error('Error reading files:', error);
    showStatus(
      `Error reading files: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
      'error'
    );
    document.getElementById('process-btn')?.classList.remove('opacity-50', 'cursor-not-allowed');
    document.getElementById('process-btn')?.removeAttribute('disabled');
  }
}

worker.onmessage = (e: MessageEvent<ExtractAttachmentResponse>) => {
  document.getElementById('process-btn')?.classList.remove('opacity-50', 'cursor-not-allowed');
  document.getElementById('process-btn')?.removeAttribute('disabled');

  if (e.data.status === 'success') {
    const attachments = e.data.attachments;

    const zip = new JSZip();
    let totalSize = 0;
    
    for (const attachment of attachments) {
      zip.file(attachment.name, new Uint8Array(attachment.data));
      totalSize += attachment.data.byteLength;
    }

    zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
      downloadFile(zipBlob, 'extracted-attachments.zip');
      showStatus(
        `Extraction completed! ${attachments.length} attachment(s) in zip file (${formatBytes(totalSize)}). Download started.`,
        'success'
      );

      state.files = [];
      const fileDisplayArea = document.getElementById('file-display-area');
      if (fileDisplayArea) {
        fileDisplayArea.innerHTML = '';
        fileDisplayArea.classList.add('hidden');
      }
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      document.getElementById('process-btn')?.classList.add('opacity-50', 'cursor-not-allowed');
      document.getElementById('process-btn')?.setAttribute('disabled', 'true');
    });
  } else if (e.data.status === 'error') {
    const errorMessage = e.data.message || 'Unknown error occurred in worker.';
    console.error('Worker Error:', errorMessage);
    showStatus(`Error: ${errorMessage}`, 'error');
  }
};

worker.onerror = (error) => {
  console.error('Worker error:', error);
  showStatus('Worker error occurred. Check console for details.', 'error');
  document.getElementById('process-btn')?.classList.remove('opacity-50', 'cursor-not-allowed');
  document.getElementById('process-btn')?.removeAttribute('disabled');
};

function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const statusMessage = document.getElementById('status-message') as HTMLElement;
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

interface ExtractAttachmentsMessage {
  command: 'extract-attachments';
  fileBuffers: ArrayBuffer[];
  fileNames: string[];
}