import { AddAttachmentState } from '@/types';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

const worker = new Worker(import.meta.env.BASE_URL + 'workers/add-attachments.worker.js');

const pageState: AddAttachmentState = {
    file: null,
    pdfDoc: null,
    attachments: [],
};

function resetState() {
    pageState.file = null;
    pageState.pdfDoc = null;
    pageState.attachments = [];

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const attachmentFileList = document.getElementById('attachment-file-list');
    if (attachmentFileList) attachmentFileList.innerHTML = '';

    const attachmentInput = document.getElementById('attachment-files-input') as HTMLInputElement;
    if (attachmentInput) attachmentInput.value = '';

    const attachmentLevelOptions = document.getElementById('attachment-level-options');
    if (attachmentLevelOptions) attachmentLevelOptions.classList.add('hidden');

    const pageRangeWrapper = document.getElementById('page-range-wrapper');
    if (pageRangeWrapper) pageRangeWrapper.classList.add('hidden');

    const processBtn = document.getElementById('process-btn');
    if (processBtn) processBtn.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const documentRadio = document.querySelector('input[name="attachment-level"][value="document"]') as HTMLInputElement;
    if (documentRadio) documentRadio.checked = true;
}

worker.onmessage = function (e) {
    const data = e.data;

    if (data.status === 'success' && data.modifiedPDF !== undefined) {
        hideLoader();

        const originalName = pageState.file?.name.replace(/\.pdf$/i, '') || 'document';
        downloadFile(
            new Blob([new Uint8Array(data.modifiedPDF)], { type: 'application/pdf' }),
            `${originalName}_with_attachments.pdf`
        );

        showAlert('Success', `${pageState.attachments.length} file(s) attached successfully.`, 'success', function () {
            resetState();
        });
    } else if (data.status === 'error') {
        hideLoader();
        showAlert('Error', data.message || 'Unknown error occurred.');
    }
};

worker.onerror = function (error) {
    hideLoader();
    console.error('Worker error:', error);
    showAlert('Error', 'Worker error occurred. Check console for details.');
};

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');

    if (!fileDisplayArea) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
        nameSpan.textContent = pageState.file.name;

        const metaSpan = document.createElement('div');
        metaSpan.className = 'text-xs text-gray-400';
        metaSpan.textContent = `${formatBytes(pageState.file.size)} • Loading...`;

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

        try {
            showLoader('Loading PDF...');
            const arrayBuffer = await pageState.file.arrayBuffer();

            pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer, {
                ignoreEncryption: true,
                throwOnInvalidObject: false
            });

            const pageCount = pageState.pdfDoc.getPageCount();
            metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageCount} pages`;

            const totalPagesSpan = document.getElementById('attachment-total-pages');
            if (totalPagesSpan) totalPagesSpan.textContent = pageCount.toString();

            hideLoader();

            if (toolOptions) toolOptions.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading PDF:', error);
            hideLoader();
            showAlert('Error', 'Failed to load PDF file.');
            resetState();
        }
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

function updateAttachmentList() {
    const attachmentFileList = document.getElementById('attachment-file-list');
    const attachmentLevelOptions = document.getElementById('attachment-level-options');
    const processBtn = document.getElementById('process-btn');

    if (!attachmentFileList) return;

    attachmentFileList.innerHTML = '';

    pageState.attachments.forEach(function (file) {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 bg-gray-800 rounded-md text-white';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'truncate text-sm';
        nameSpan.textContent = file.name;

        const sizeSpan = document.createElement('span');
        sizeSpan.className = 'text-xs text-gray-400';
        sizeSpan.textContent = formatBytes(file.size);

        div.append(nameSpan, sizeSpan);
        attachmentFileList.appendChild(div);
    });

    if (pageState.attachments.length > 0) {
        if (attachmentLevelOptions) attachmentLevelOptions.classList.remove('hidden');
        if (processBtn) processBtn.classList.remove('hidden');
    } else {
        if (attachmentLevelOptions) attachmentLevelOptions.classList.add('hidden');
        if (processBtn) processBtn.classList.add('hidden');
    }
}

async function addAttachments() {
    if (!pageState.file || !pageState.pdfDoc) {
        showAlert('Error', 'Please upload a PDF first.');
        return;
    }

    if (pageState.attachments.length === 0) {
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
        const pdfBuffer = await pageState.file.arrayBuffer();

        const attachmentBuffers: ArrayBuffer[] = [];
        const attachmentNames: string[] = [];

        for (let i = 0; i < pageState.attachments.length; i++) {
            const file = pageState.attachments[i];
            showLoader(`Reading ${file.name} (${i + 1}/${pageState.attachments.length})...`);

            const fileBuffer = await file.arrayBuffer();
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
    }
}

function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            pageState.file = file;
            updateUI();
        }
    }
}

function handleAttachmentSelect(files: FileList | null) {
    if (files && files.length > 0) {
        pageState.attachments = Array.from(files);
        updateAttachmentList();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const attachmentInput = document.getElementById('attachment-files-input') as HTMLInputElement;
    const attachmentDropZone = document.getElementById('attachment-drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const pageRangeWrapper = document.getElementById('page-range-wrapper');

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
                const pdfFiles = Array.from(files).filter(function (f) {
                    return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
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

    if (attachmentInput && attachmentDropZone) {
        attachmentInput.addEventListener('change', function (e) {
            handleAttachmentSelect((e.target as HTMLInputElement).files);
        });

        attachmentDropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            attachmentDropZone.classList.add('bg-gray-700');
        });

        attachmentDropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            attachmentDropZone.classList.remove('bg-gray-700');
        });

        attachmentDropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            attachmentDropZone.classList.remove('bg-gray-700');
            const files = e.dataTransfer?.files;
            if (files) {
                handleAttachmentSelect(files);
            }
        });

        attachmentInput.addEventListener('click', function () {
            attachmentInput.value = '';
        });
    }

    const attachmentLevelRadios = document.querySelectorAll('input[name="attachment-level"]');
    attachmentLevelRadios.forEach(function (radio) {
        radio.addEventListener('change', function (e) {
            const value = (e.target as HTMLInputElement).value;
            if (value === 'page' && pageRangeWrapper) {
                pageRangeWrapper.classList.remove('hidden');
            } else if (pageRangeWrapper) {
                pageRangeWrapper.classList.add('hidden');
            }
        });
    });

    if (processBtn) {
        processBtn.addEventListener('click', addAttachments);
    }
});
