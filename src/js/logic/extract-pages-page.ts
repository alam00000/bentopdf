import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { readFileAsArrayBuffer, formatBytes, downloadFile, parsePageRanges } from '../utils/helpers.js';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

interface ExtractState {
    file: File | null;
    pdfDoc: any;
    totalPages: number;
}

const extractState: ExtractState = {
    file: null,
    pdfDoc: null,
    totalPages: 0,
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

function initializePage() {
    createIcons({ icons });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
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
                handleFile(droppedFiles[0]);
            }
        });

        // Clear value on click to allow re-selecting the same file
        fileInput?.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', extractPages);
    }

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        window.location.href = import.meta.env.BASE_URL;
    });
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        handleFile(input.files[0]);
    }
}

async function handleFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showAlert('Invalid File', 'Please select a PDF file.');
        return;
    }

    showLoader('Loading PDF...');
    extractState.file = file;

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        extractState.pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, {
            ignoreEncryption: true,
            throwOnInvalidObject: false,
        });
        extractState.totalPages = extractState.pdfDoc.getPageCount();

        updateFileDisplay();
        showOptions();
        hideLoader();
    } catch (error) {
        console.error('Error loading PDF:', error);
        hideLoader();
        showAlert('Error', 'Failed to load PDF file.');
    }
}

function updateFileDisplay() {
    const fileDisplayArea = document.getElementById('file-display-area');
    if (!fileDisplayArea || !extractState.file) return;

    fileDisplayArea.innerHTML = '';
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = extractState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(extractState.file.size)} • ${extractState.totalPages} pages`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => resetState();

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });
}

function showOptions() {
    const extractOptions = document.getElementById('extract-options');
    const totalPagesSpan = document.getElementById('total-pages');

    if (extractOptions) {
        extractOptions.classList.remove('hidden');
    }
    if (totalPagesSpan) {
        totalPagesSpan.textContent = extractState.totalPages.toString();
    }
}



async function extractPages() {
    const pagesInput = document.getElementById('pages-to-extract') as HTMLInputElement;
    if (!pagesInput || !pagesInput.value.trim()) {
        showAlert('No Pages', 'Please enter page numbers to extract.');
        return;
    }

    const pagesToExtract = parsePageRanges(pagesInput.value, extractState.totalPages).map(i => i + 1);
    if (pagesToExtract.length === 0) {
        showAlert('Invalid Pages', 'No valid page numbers found.');
        return;
    }

    showLoader('Extracting pages...');

    try {
        const zip = new JSZip();
        const baseName = extractState.file?.name.replace('.pdf', '') || 'document';

        for (const pageNum of pagesToExtract) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(extractState.pdfDoc, [pageNum - 1]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            zip.file(`${baseName}_page_${pageNum}.pdf`, pdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `${baseName}_extracted_pages.zip`);

        hideLoader();
        showAlert('Success', `Extracted ${pagesToExtract.length} page(s) successfully!`, 'success', () => {
            resetState();
        });
    } catch (error) {
        console.error('Error extracting pages:', error);
        hideLoader();
        showAlert('Error', 'Failed to extract pages.');
    }
}

function resetState() {
    extractState.file = null;
    extractState.pdfDoc = null;
    extractState.totalPages = 0;

    const extractOptions = document.getElementById('extract-options');
    if (extractOptions) {
        extractOptions.classList.add('hidden');
    }

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) {
        fileDisplayArea.innerHTML = '';
    }

    const pagesInput = document.getElementById('pages-to-extract') as HTMLInputElement;
    if (pagesInput) {
        pagesInput.value = '';
    }
}
