import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, readFileAsArrayBuffer } from '../utils/helpers.js';
import { PDFDocument } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import JSZip from 'jszip';
import { FlattenPdfState } from '@/types';

const pageState: FlattenPdfState = {
    files: [],
};

function flattenFormsInDoc(pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    form.flatten();
}

function resetState() {
    pageState.files = [];

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileControls = document.getElementById('file-controls');
    if (fileControls) fileControls.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');
    const fileControls = document.getElementById('file-controls');

    if (!fileDisplayArea) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.files.length > 0) {
        pageState.files.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

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
            removeBtn.onclick = function () {
                pageState.files.splice(index, 1);
                updateUI();
            };

            fileDiv.append(infoContainer, removeBtn);
            fileDisplayArea.appendChild(fileDiv);
        });

        createIcons({ icons });

        if (toolOptions) toolOptions.classList.remove('hidden');
        if (fileControls) fileControls.classList.remove('hidden');
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
        if (fileControls) fileControls.classList.add('hidden');
    }
}

function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (pdfFiles.length > 0) {
            pageState.files.push(...pdfFiles);
            updateUI();
        }
    }
}

async function flattenPdf() {
    if (pageState.files.length === 0) {
        showAlert('No Files', 'Please select at least one PDF file.');
        return;
    }

    const loaderModal = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');

    try {
        if (pageState.files.length === 1) {
            if (loaderModal) loaderModal.classList.remove('hidden');
            if (loaderText) loaderText.textContent = 'Flattening PDF...';

            const file = pageState.files[0];
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, { ignoreEncryption: true });

            try {
                flattenFormsInDoc(pdfDoc);
            } catch (e: any) {
                if (e.message.includes('getForm')) {
                    // Ignore if no form found
                } else {
                    throw e;
                }
            }

            const newPdfBytes = await pdfDoc.save();
            downloadFile(
                new Blob([newPdfBytes as BlobPart], { type: 'application/pdf' }),
                `flattened_${file.name}`
            );
            if (loaderModal) loaderModal.classList.add('hidden');
        } else {
            if (loaderModal) loaderModal.classList.remove('hidden');
            if (loaderText) loaderText.textContent = 'Flattening multiple PDFs...';

            const zip = new JSZip();
            let processedCount = 0;

            for (let i = 0; i < pageState.files.length; i++) {
                const file = pageState.files[i];
                if (loaderText) loaderText.textContent = `Flattening ${i + 1}/${pageState.files.length}: ${file.name}...`;

                try {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, { ignoreEncryption: true });

                    try {
                        flattenFormsInDoc(pdfDoc);
                    } catch (e: any) {
                        if (e.message.includes('getForm')) {
                            // Ignore if no form found
                        } else {
                            throw e;
                        }
                    }

                    const flattenedBytes = await pdfDoc.save();
                    zip.file(`flattened_${file.name}`, flattenedBytes);
                    processedCount++;
                } catch (e) {
                    console.error(`Error processing ${file.name}:`, e);
                }
            }

            if (processedCount > 0) {
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipBlob, 'flattened_pdfs.zip');
                showAlert('Success', `Processed ${processedCount} PDFs.`, 'success', () => { resetState(); });
            } else {
                showAlert('Error', 'No PDFs could be processed.');
            }
            if (loaderModal) loaderModal.classList.add('hidden');
        }
    } catch (e: any) {
        console.error(e);
        if (loaderModal) loaderModal.classList.add('hidden');
        showAlert('Error', e.message || 'An unexpected error occurred.');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
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
            handleFileSelect(e.dataTransfer?.files);
        });

        fileInput.addEventListener('click', function () {
            fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', flattenPdf);
    }

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function () {
            fileInput.value = '';
            fileInput.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', function () {
            resetState();
        });
    }
});
