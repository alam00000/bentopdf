import { AlternateMergeState } from '@/types';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes, getPDFDocument } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import Sortable from 'sortablejs';

const pageState: AlternateMergeState = {
    files: [],
    pdfBytes: new Map(),
    pdfDocs: new Map(),
};

const alternateMergeWorker = new Worker(import.meta.env.BASE_URL + 'workers/alternate-merge.worker.js');

function resetState() {
    pageState.files = [];
    pageState.pdfBytes.clear();
    pageState.pdfDocs.clear();

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const fileList = document.getElementById('file-list');
    if (fileList) fileList.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');
    const fileList = document.getElementById('file-list');

    if (!fileDisplayArea || !fileList) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.files.length > 0) {
        // Show file count summary
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoSpan = document.createElement('span');
        infoSpan.className = 'text-gray-200';
        infoSpan.textContent = `${pageState.files.length} PDF files selected`;

        const clearBtn = document.createElement('button');
        clearBtn.className = 'text-red-400 hover:text-red-300';
        clearBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        clearBtn.onclick = function () {
            resetState();
        };

        summaryDiv.append(infoSpan, clearBtn);
        fileDisplayArea.appendChild(summaryDiv);
        createIcons({ icons });

        // Load PDFs and populate list
        showLoader('Loading PDF files...');
        fileList.innerHTML = '';

        try {
            for (const file of pageState.files) {
                const arrayBuffer = await file.arrayBuffer();
                pageState.pdfBytes.set(file.name, arrayBuffer);

                const bytesForPdfJs = arrayBuffer.slice(0);
                const pdfjsDoc = await getPDFDocument({ data: bytesForPdfJs }).promise;
                pageState.pdfDocs.set(file.name, pdfjsDoc);
                const pageCount = pdfjsDoc.numPages;

                const li = document.createElement('li');
                li.className = 'bg-gray-700 p-3 rounded-lg border border-gray-600 flex items-center justify-between';
                li.dataset.fileName = file.name;

                const infoDiv = document.createElement('div');
                infoDiv.className = 'flex items-center gap-2 truncate flex-1';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'truncate font-medium text-white';
                nameSpan.textContent = file.name;

                const metaSpan = document.createElement('span');
                metaSpan.className = 'text-sm text-gray-400 flex-shrink-0';
                metaSpan.textContent = `${formatBytes(file.size)} • ${pageCount} pages`;

                infoDiv.append(nameSpan, metaSpan);

                const dragHandle = document.createElement('div');
                dragHandle.className = 'drag-handle cursor-move text-gray-400 hover:text-white p-1 rounded ml-2';
                dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;

                li.append(infoDiv, dragHandle);
                fileList.appendChild(li);
            }

            Sortable.create(fileList, {
                handle: '.drag-handle',
                animation: 150,
            });

            hideLoader();

            if (toolOptions && pageState.files.length >= 2) {
                toolOptions.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error loading PDFs:', error);
            hideLoader();
            showAlert('Error', 'Failed to load one or more PDF files.');
            resetState();
        }
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

async function mixPages() {
    if (pageState.pdfBytes.size < 2) {
        showAlert('Not Enough Files', 'Please upload at least two PDF files to alternate and mix.');
        return;
    }

    showLoader('Alternating and mixing pages...');

    try {
        const fileList = document.getElementById('file-list');
        if (!fileList) throw new Error('File list not found');

        const sortedFileNames = Array.from(fileList.children).map(function (li) {
            return (li as HTMLElement).dataset.fileName;
        }).filter(Boolean) as string[];

        interface InterleaveFile {
            name: string;
            data: ArrayBuffer;
        }

        const filesToMerge: InterleaveFile[] = [];
        for (const name of sortedFileNames) {
            const bytes = pageState.pdfBytes.get(name);
            if (bytes) {
                filesToMerge.push({ name, data: bytes });
            }
        }

        if (filesToMerge.length < 2) {
            showAlert('Error', 'At least two valid PDFs are required.');
            hideLoader();
            return;
        }

        const message = {
            command: 'interleave',
            files: filesToMerge
        };

        alternateMergeWorker.postMessage(message, filesToMerge.map(function (f) { return f.data; }));

        alternateMergeWorker.onmessage = function (e: MessageEvent) {
            hideLoader();
            if (e.data.status === 'success') {
                const blob = new Blob([e.data.pdfBytes], { type: 'application/pdf' });
                downloadFile(blob, 'alternated-mixed.pdf');
                showAlert('Success', 'PDFs have been mixed successfully!', 'success', function () {
                    resetState();
                });
            } else {
                console.error('Worker interleave error:', e.data.message);
                showAlert('Error', e.data.message || 'Failed to interleave PDFs.');
            }
        };

        alternateMergeWorker.onerror = function (e) {
            hideLoader();
            console.error('Worker error:', e);
            showAlert('Error', 'An unexpected error occurred in the merge worker.');
        };

    } catch (e) {
        console.error('Alternate Merge error:', e);
        showAlert('Error', 'An error occurred while mixing the PDFs.');
        hideLoader();
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
        processBtn.addEventListener('click', mixPages);
    }
});
