import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { readFileAsArrayBuffer, formatBytes, downloadFile, getPDFDocument, parsePageRanges } from '../utils/helpers.js';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { DeletePagesState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const deleteState: DeletePagesState = {
    file: null,
    pdfDoc: null,
    pdfJsDoc: null,
    totalPages: 0,
    pagesToDelete: new Set(),
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
    const pagesInput = document.getElementById('pages-to-delete') as HTMLInputElement;

    if (fileInput) fileInput.addEventListener('change', handleFileUpload);

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('bg-gray-700'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('bg-gray-700'); });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const droppedFiles = e.dataTransfer?.files;
            if (droppedFiles && droppedFiles.length > 0) handleFile(droppedFiles[0]);
        });
        // Clear value on click to allow re-selecting the same file
        fileInput?.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
        });
    }

    if (processBtn) processBtn.addEventListener('click', deletePages);
    if (pagesInput) pagesInput.addEventListener('input', updatePreview);

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        window.location.href = import.meta.env.BASE_URL;
    });
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) handleFile(input.files[0]);
}

async function handleFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showAlert('Invalid File', 'Please select a PDF file.');
        return;
    }

    showLoader('Loading PDF...');
    deleteState.file = file;

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        deleteState.pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, { ignoreEncryption: true, throwOnInvalidObject: false });
        deleteState.pdfJsDoc = await getPDFDocument({ data: (arrayBuffer as ArrayBuffer).slice(0) }).promise;
        deleteState.totalPages = deleteState.pdfDoc.getPageCount();
        deleteState.pagesToDelete = new Set();

        updateFileDisplay();
        showOptions();
        await renderThumbnails();
        hideLoader();
    } catch (error) {
        console.error('Error loading PDF:', error);
        hideLoader();
        showAlert('Error', 'Failed to load PDF file.');
    }
}

function updateFileDisplay() {
    const fileDisplayArea = document.getElementById('file-display-area');
    if (!fileDisplayArea || !deleteState.file) return;

    fileDisplayArea.innerHTML = '';
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = deleteState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(deleteState.file.size)} • ${deleteState.totalPages} pages`;

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
    const deleteOptions = document.getElementById('delete-options');
    const totalPagesSpan = document.getElementById('total-pages');

    if (deleteOptions) deleteOptions.classList.remove('hidden');
    if (totalPagesSpan) totalPagesSpan.textContent = deleteState.totalPages.toString();
}

async function renderThumbnails() {
    const container = document.getElementById('delete-pages-preview');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= deleteState.totalPages; i++) {
        const page = await deleteState.pdfJsDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const wrapper = document.createElement('div');
        wrapper.className = 'relative cursor-pointer group';
        wrapper.dataset.page = i.toString();

        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-full h-28 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600';

        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.className = 'max-w-full max-h-full object-contain';

        const pageLabel = document.createElement('span');
        pageLabel.className = 'absolute top-1 left-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded';
        pageLabel.textContent = `${i}`;

        const deleteOverlay = document.createElement('div');
        deleteOverlay.className = 'absolute inset-0 bg-red-500/50 hidden items-center justify-center rounded-lg';
        deleteOverlay.innerHTML = '<i data-lucide="x" class="w-8 h-8 text-white"></i>';

        imgContainer.appendChild(img);
        wrapper.append(imgContainer, pageLabel, deleteOverlay);
        container.appendChild(wrapper);

        wrapper.addEventListener('click', () => togglePageDelete(i, wrapper));
    }
    createIcons({ icons });
}

function togglePageDelete(pageNum: number, wrapper: HTMLElement) {
    const overlay = wrapper.querySelector('.bg-red-500\\/50');
    if (deleteState.pagesToDelete.has(pageNum)) {
        deleteState.pagesToDelete.delete(pageNum);
        overlay?.classList.add('hidden');
        overlay?.classList.remove('flex');
    } else {
        deleteState.pagesToDelete.add(pageNum);
        overlay?.classList.remove('hidden');
        overlay?.classList.add('flex');
    }
    updateInputFromSelection();
}

function updateInputFromSelection() {
    const pagesInput = document.getElementById('pages-to-delete') as HTMLInputElement;
    if (pagesInput) {
        const sorted = Array.from(deleteState.pagesToDelete).sort((a, b) => a - b);
        pagesInput.value = sorted.join(', ');
    }
}

function updatePreview() {
    const pagesInput = document.getElementById('pages-to-delete') as HTMLInputElement;
    if (!pagesInput) return;

    deleteState.pagesToDelete = new Set(parsePageRanges(pagesInput.value, deleteState.totalPages).map(i => i + 1));

    const container = document.getElementById('delete-pages-preview');
    if (!container) return;

    container.querySelectorAll('[data-page]').forEach((wrapper) => {
        const pageNum = parseInt((wrapper as HTMLElement).dataset.page || '0', 10);
        const overlay = wrapper.querySelector('.bg-red-500\\/50');
        if (deleteState.pagesToDelete.has(pageNum)) {
            overlay?.classList.remove('hidden');
            overlay?.classList.add('flex');
        } else {
            overlay?.classList.add('hidden');
            overlay?.classList.remove('flex');
        }
    });
}



async function deletePages() {
    if (deleteState.pagesToDelete.size === 0) {
        showAlert('No Pages', 'Please select pages to delete.');
        return;
    }

    if (deleteState.pagesToDelete.size >= deleteState.totalPages) {
        showAlert('Error', 'Cannot delete all pages.');
        return;
    }

    showLoader('Deleting pages...');

    try {
        const pagesToKeep = [];
        for (let i = 0; i < deleteState.totalPages; i++) {
            if (!deleteState.pagesToDelete.has(i + 1)) pagesToKeep.push(i);
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(deleteState.pdfDoc, pagesToKeep);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const baseName = deleteState.file?.name.replace('.pdf', '') || 'document';
        downloadFile(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }), `${baseName}_pages_removed.pdf`);

        hideLoader();
        showAlert('Success', `Deleted ${deleteState.pagesToDelete.size} page(s) successfully!`, 'success', () => resetState());
    } catch (error) {
        console.error('Error deleting pages:', error);
        hideLoader();
        showAlert('Error', 'Failed to delete pages.');
    }
}

function resetState() {
    deleteState.file = null;
    deleteState.pdfDoc = null;
    deleteState.pdfJsDoc = null;
    deleteState.totalPages = 0;
    deleteState.pagesToDelete = new Set();

    document.getElementById('delete-options')?.classList.add('hidden');
    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';
    const pagesInput = document.getElementById('pages-to-delete') as HTMLInputElement;
    if (pagesInput) pagesInput.value = '';
    const container = document.getElementById('delete-pages-preview');
    if (container) container.innerHTML = '';
}
