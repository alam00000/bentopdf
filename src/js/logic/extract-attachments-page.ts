import { showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';

const worker = new Worker(import.meta.env.BASE_URL + 'workers/extract-attachments.worker.js');

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

function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const statusMessage = document.getElementById('status-message') as HTMLElement;
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.className = `mt-4 p-3 rounded-lg text-sm ${type === 'success'
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
            showAlert('No Attachments', 'The PDF file(s) do not contain any attachments to extract.');
            resetState();
            return;
        }

        const zip = new JSZip();
        let totalSize = 0;

        for (const attachment of attachments) {
            zip.file(attachment.name, new Uint8Array(attachment.data));
            totalSize += attachment.data.byteLength;
        }

        zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
            downloadFile(zipBlob, 'extracted-attachments.zip');

            showAlert('Success', `${attachments.length} attachment(s) extracted successfully!`);

            showStatus(
                `Extraction completed! ${attachments.length} attachment(s) in zip file (${formatBytes(totalSize)}). Download started.`,
                'success'
            );

            resetState();
        });
    } else if (e.data.status === 'error') {
        const errorMessage = e.data.message || 'Unknown error occurred in worker.';
        console.error('Worker Error:', errorMessage);

        if (errorMessage.includes('No attachments were found')) {
            showAlert('No Attachments', 'The PDF file(s) do not contain any attachments to extract.');
            resetState();
        } else {
            showStatus(`Error: ${errorMessage}`, 'error');
        }
    }
};

worker.onerror = function (error) {
    console.error('Worker error:', error);
    showStatus('Worker error occurred. Check console for details.', 'error');

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
        summaryDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const countSpan = document.createElement('div');
        countSpan.className = 'font-medium text-gray-200 text-sm mb-1';
        countSpan.textContent = `${pageState.files.length} PDF file(s) selected`;

        const sizeSpan = document.createElement('div');
        sizeSpan.className = 'text-xs text-gray-400';
        const totalSize = pageState.files.reduce(function (sum, f) { return sum + f.size; }, 0);
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
        showStatus('No Files', 'error');
        return;
    }

    const processBtn = document.getElementById('process-btn');
    if (processBtn) {
        processBtn.classList.add('opacity-50', 'cursor-not-allowed');
        processBtn.setAttribute('disabled', 'true');
    }

    showStatus('Reading files...', 'info');

    try {
        const fileBuffers: ArrayBuffer[] = [];
        const fileNames: string[] = [];

        for (const file of pageState.files) {
            const buffer = await file.arrayBuffer();
            fileBuffers.push(buffer);
            fileNames.push(file.name);
        }

        showStatus(`Extracting attachments from ${pageState.files.length} file(s)...`, 'info');

        const message = {
            command: 'extract-attachments',
            fileBuffers,
            fileNames,
        };

        const transferables = fileBuffers.map(function (buf) { return buf; });
        worker.postMessage(message, transferables);

    } catch (error) {
        console.error('Error reading files:', error);
        showStatus(
            `Error reading files: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
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
            return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        });
        if (pdfFiles.length > 0) {
            pageState.files = pdfFiles;
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
