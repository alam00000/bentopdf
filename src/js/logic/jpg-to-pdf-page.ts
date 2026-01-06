import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { PyMuPDF } from '@bentopdf/pymupdf-wasm';
import { getWasmBaseUrl } from '../config/wasm-cdn-config.js';

const SUPPORTED_FORMATS = '.jpg,.jpeg,.jp2,.jpx';
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/jp2'];

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
    const processBtn = document.getElementById('process-btn');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
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
        processBtn.addEventListener('click', convertToPdf);
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

function getFileExtension(filename: string): string {
    return '.' + (filename.split('.').pop()?.toLowerCase() || '');
}

function isValidImageFile(file: File): boolean {
    const ext = getFileExtension(file.name);
    const validExtensions = SUPPORTED_FORMATS.split(',');
    return validExtensions.includes(ext) || SUPPORTED_MIME_TYPES.includes(file.type);
}

function handleFiles(newFiles: FileList) {
    const validFiles = Array.from(newFiles).filter(isValidImageFile);

    if (validFiles.length < newFiles.length) {
        showAlert('Invalid Files', 'Some files were skipped. Only JPG, JPEG, JP2, and JPX files are allowed.');
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
    const optionsDiv = document.getElementById('jpg-to-pdf-options');

    if (!fileDisplayArea || !fileControls || !optionsDiv) return;

    fileDisplayArea.innerHTML = '';

    if (files.length > 0) {
        fileControls.classList.remove('hidden');
        optionsDiv.classList.remove('hidden');

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
        optionsDiv.classList.add('hidden');
    }
}

async function ensurePyMuPDF(): Promise<PyMuPDF> {
    if (!pymupdf) {
        pymupdf = new PyMuPDF(getWasmBaseUrl('pymupdf'));
        await pymupdf.load();
    }
    return pymupdf;
}

async function convertToPdf() {
    if (files.length === 0) {
        showAlert('No Files', 'Please select at least one JPG or JPEG2000 image.');
        return;
    }

    showLoader('Loading engine...');

    try {
        const mupdf = await ensurePyMuPDF();

        showLoader('Converting images to PDF...');

        const pdfBlob = await mupdf.imagesToPdf(files);

        downloadFile(pdfBlob, 'from_jpgs.pdf');

        showAlert('Success', 'PDF created successfully!', 'success', () => {
            resetState();
        });
    } catch (e: any) {
        console.error('[JpgToPdf]', e);
        showAlert('Conversion Error', e.message || 'Failed to convert images to PDF.');
    } finally {
        hideLoader();
    }
}
