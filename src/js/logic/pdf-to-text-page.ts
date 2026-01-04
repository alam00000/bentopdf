import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

let files: File[] = [];
let pymupdf: PyMuPDF | null = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

function initializePage() {
    createIcons({ icons });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const addMoreBtn = document.getElementById('add-more-btn');
    const clearFilesBtn = document.getElementById('clear-files-btn');
    const processBtn = document.getElementById('process-btn') as HTMLButtonElement;

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-600');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-gray-600');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-600');
            const droppedFiles = e.dataTransfer?.files;
            if (droppedFiles && droppedFiles.length > 0) {
                handleFiles(droppedFiles);
            }
        });

        fileInput?.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
        });
    }

    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', () => {
            fileInput?.click();
        });
    }

    if (clearFilesBtn) {
        clearFilesBtn.addEventListener('click', () => {
            files = [];
            updateUI();
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', extractText);
    }

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        window.location.href = import.meta.env.BASE_URL;
    });
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleFiles(input.files);
    }
}

function handleFiles(newFiles: FileList) {
    const validFiles = Array.from(newFiles).filter(file =>
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length < newFiles.length) {
        showAlert('Invalid Files', 'Some files were skipped. Only PDF files are allowed.');
    }

    if (validFiles.length > 0) {
        files = [...files, ...validFiles];
        updateUI();
    }
}

const resetState = () => {
    files = [];
    updateUI();
};

function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const fileControls = document.getElementById('file-controls');
    const extractOptions = document.getElementById('extract-options');

    if (!fileDisplayArea || !fileControls || !extractOptions) return;

    fileDisplayArea.innerHTML = '';

    if (files.length > 0) {
        fileControls.classList.remove('hidden');
        extractOptions.classList.remove('hidden');

        files.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const infoContainer = document.createElement('div');
            infoContainer.className = 'flex items-center gap-2 overflow-hidden';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'truncate font-medium text-gray-200';
            nameSpan.textContent = file.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'flex-shrink-0 text-gray-400 text-xs';
            sizeSpan.textContent = `(${formatBytes(file.size)})`;

            infoContainer.append(nameSpan, sizeSpan);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
            removeBtn.onclick = () => {
                files = files.filter((_, i) => i !== index);
                updateUI();
            };

            fileDiv.append(infoContainer, removeBtn);
            fileDisplayArea.appendChild(fileDiv);
        });
        createIcons({ icons });
    } else {
        fileControls.classList.add('hidden');
        extractOptions.classList.add('hidden');
    }
}

async function ensurePyMuPDF(): Promise<PyMuPDF> {
    if (!pymupdf) {
        pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
        await pymupdf.load();
    }
    return pymupdf;
}

async function extractText() {
    if (files.length === 0) {
        showAlert('No Files', 'Please select at least one PDF file.');
        return;
    }

    showLoader('Loading engine...');

    try {
        const mupdf = await ensurePyMuPDF();

        if (files.length === 1) {
            const file = files[0];
            showLoader(`Extracting text from ${file.name}...`);

            const fullText = await mupdf.pdfToText(file);

            const baseName = file.name.replace(/\.pdf$/i, '');
            const textBlob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            downloadFile(textBlob, `${baseName}.txt`);

            hideLoader();
            showAlert('Success', 'Text extracted successfully!', 'success', () => {
                resetState();
            });
        } else {
            showLoader('Extracting text from multiple files...');

            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                showLoader(`Extracting text from file ${i + 1}/${files.length}: ${file.name}...`);

                const fullText = await mupdf.pdfToText(file);

                const baseName = file.name.replace(/\.pdf$/i, '');
                zip.file(`${baseName}.txt`, fullText);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadFile(zipBlob, 'pdf-to-text.zip');

            hideLoader();
            showAlert('Success', `Extracted text from ${files.length} PDF files!`, 'success', () => {
                resetState();
            });
        }
    } catch (e: any) {
        console.error('[PDFToText]', e);
        hideLoader();
        showAlert('Extraction Error', e.message || 'Failed to extract text from PDF.');
    }
}
