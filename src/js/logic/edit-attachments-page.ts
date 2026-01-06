import { EditAttachmentState, AttachmentInfo } from '@/types';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';

const worker = new Worker(import.meta.env.BASE_URL + 'workers/edit-attachments.worker.js');

const pageState: EditAttachmentState = {
    file: null,
    allAttachments: [],
    attachmentsToRemove: new Set(),
};

function resetState() {
    pageState.file = null;
    pageState.allAttachments = [];
    pageState.attachmentsToRemove.clear();

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const attachmentsList = document.getElementById('attachments-list');
    if (attachmentsList) attachmentsList.innerHTML = '';

    const processBtn = document.getElementById('process-btn');
    if (processBtn) processBtn.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

worker.onmessage = function (e) {
    const data = e.data;

    if (data.status === 'success' && data.attachments !== undefined) {
        pageState.allAttachments = data.attachments.map(function (att: any) {
            return {
                ...att,
                data: new Uint8Array(att.data)
            };
        });

        displayAttachments(data.attachments);
        hideLoader();
    } else if (data.status === 'success' && data.modifiedPDF !== undefined) {
        hideLoader();

        const originalName = pageState.file?.name.replace(/\.pdf$/i, '') || 'document';
        downloadFile(
            new Blob([new Uint8Array(data.modifiedPDF)], { type: 'application/pdf' }),
            `${originalName}_edited.pdf`
        );

        showAlert('Success', 'Attachments updated successfully!', 'success', function () {
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

function displayAttachments(attachments: AttachmentInfo[]) {
    const attachmentsList = document.getElementById('attachments-list');
    const processBtn = document.getElementById('process-btn');

    if (!attachmentsList) return;

    attachmentsList.innerHTML = '';

    if (attachments.length === 0) {
        const noAttachments = document.createElement('p');
        noAttachments.className = 'text-gray-400 text-center py-4';
        noAttachments.textContent = 'No attachments found in this PDF.';
        attachmentsList.appendChild(noAttachments);
        return;
    }

    // Controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'attachments-controls mb-4 flex justify-end';

    const removeAllBtn = document.createElement('button');
    removeAllBtn.className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm';
    removeAllBtn.textContent = 'Remove All Attachments';
    removeAllBtn.onclick = function () {
        if (pageState.allAttachments.length === 0) return;

        const allSelected = pageState.allAttachments.every(function (attachment) {
            return pageState.attachmentsToRemove.has(attachment.index);
        });

        if (allSelected) {
            pageState.allAttachments.forEach(function (attachment) {
                pageState.attachmentsToRemove.delete(attachment.index);
                const element = document.querySelector(`[data-attachment-index="${attachment.index}"]`);
                if (element) {
                    element.classList.remove('opacity-50', 'line-through');
                    const btn = element.querySelector('button');
                    if (btn) {
                        btn.classList.remove('bg-gray-600');
                        btn.classList.add('bg-red-600');
                    }
                }
            });
            removeAllBtn.textContent = 'Remove All Attachments';
        } else {
            pageState.allAttachments.forEach(function (attachment) {
                pageState.attachmentsToRemove.add(attachment.index);
                const element = document.querySelector(`[data-attachment-index="${attachment.index}"]`);
                if (element) {
                    element.classList.add('opacity-50', 'line-through');
                    const btn = element.querySelector('button');
                    if (btn) {
                        btn.classList.add('bg-gray-600');
                        btn.classList.remove('bg-red-600');
                    }
                }
            });
            removeAllBtn.textContent = 'Deselect All';
        }
    };

    controlsContainer.appendChild(removeAllBtn);
    attachmentsList.appendChild(controlsContainer);

    // Attachment items
    for (const attachment of attachments) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700';
        attachmentDiv.dataset.attachmentIndex = attachment.index.toString();

        const infoDiv = document.createElement('div');
        infoDiv.className = 'flex-1';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-white font-medium block';
        nameSpan.textContent = attachment.name;

        const levelSpan = document.createElement('span');
        levelSpan.className = 'text-gray-400 text-sm block';
        if (attachment.page === 0) {
            levelSpan.textContent = 'Document-level attachment';
        } else {
            levelSpan.textContent = `Page ${attachment.page} attachment`;
        }

        infoDiv.append(nameSpan, levelSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'flex items-center gap-2';

        const removeBtn = document.createElement('button');
        removeBtn.className = `${pageState.attachmentsToRemove.has(attachment.index) ? 'bg-gray-600' : 'bg-red-600'} hover:bg-red-700 text-white px-3 py-1 rounded text-sm`;
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.title = 'Remove attachment';
        removeBtn.onclick = function () {
            if (pageState.attachmentsToRemove.has(attachment.index)) {
                pageState.attachmentsToRemove.delete(attachment.index);
                attachmentDiv.classList.remove('opacity-50', 'line-through');
                removeBtn.classList.remove('bg-gray-600');
                removeBtn.classList.add('bg-red-600');
            } else {
                pageState.attachmentsToRemove.add(attachment.index);
                attachmentDiv.classList.add('opacity-50', 'line-through');
                removeBtn.classList.add('bg-gray-600');
                removeBtn.classList.remove('bg-red-600');
            }

            const allSelected = pageState.allAttachments.every(function (att) {
                return pageState.attachmentsToRemove.has(att.index);
            });
            removeAllBtn.textContent = allSelected ? 'Deselect All' : 'Remove All Attachments';
        };

        actionsDiv.append(removeBtn);
        attachmentDiv.append(infoDiv, actionsDiv);
        attachmentsList.appendChild(attachmentDiv);
    }

    createIcons({ icons });

    if (processBtn) processBtn.classList.remove('hidden');
}

async function loadAttachments() {
    if (!pageState.file) return;

    showLoader('Loading attachments...');

    try {
        const fileBuffer = await pageState.file.arrayBuffer();

        const message = {
            command: 'get-attachments',
            fileBuffer: fileBuffer,
            fileName: pageState.file.name
        };

        worker.postMessage(message, [fileBuffer]);
    } catch (error) {
        console.error('Error loading attachments:', error);
        hideLoader();
        showAlert('Error', 'Failed to load attachments from PDF.');
    }
}

async function saveChanges() {
    if (!pageState.file) {
        showAlert('Error', 'No PDF file loaded.');
        return;
    }

    if (pageState.attachmentsToRemove.size === 0) {
        showAlert('No Changes', 'No attachments selected for removal.');
        return;
    }

    showLoader('Processing attachments...');

    try {
        const fileBuffer = await pageState.file.arrayBuffer();

        const message = {
            command: 'edit-attachments',
            fileBuffer: fileBuffer,
            fileName: pageState.file.name,
            attachmentsToRemove: Array.from(pageState.attachmentsToRemove)
        };

        worker.postMessage(message, [fileBuffer]);
    } catch (error) {
        console.error('Error editing attachments:', error);
        hideLoader();
        showAlert('Error', 'Failed to edit attachments.');
    }
}

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

        await loadAttachments();
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
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

    if (processBtn) {
        processBtn.addEventListener('click', saveChanges);
    }
});
