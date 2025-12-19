import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { readFileAsArrayBuffer, formatBytes, downloadFile, getPDFDocument } from '../utils/helpers.js';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Sortable from 'sortablejs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface OrganizeState {
    file: File | null;
    pdfDoc: any;
    pdfJsDoc: any;
    totalPages: number;
    sortableInstance: any;
}

const organizeState: OrganizeState = {
    file: null,
    pdfDoc: null,
    pdfJsDoc: null,
    totalPages: 0,
    sortableInstance: null,
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

    if (processBtn) processBtn.addEventListener('click', saveChanges);

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
    organizeState.file = file;

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        organizeState.pdfDoc = await PDFDocument.load(arrayBuffer as ArrayBuffer, { ignoreEncryption: true, throwOnInvalidObject: false });
        organizeState.pdfJsDoc = await getPDFDocument({ data: (arrayBuffer as ArrayBuffer).slice(0) }).promise;
        organizeState.totalPages = organizeState.pdfDoc.getPageCount();

        updateFileDisplay();
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
    if (!fileDisplayArea || !organizeState.file) return;

    fileDisplayArea.innerHTML = '';
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = organizeState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(organizeState.file.size)} • ${organizeState.totalPages} pages`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => resetState();

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });
}

function renumberPages() {
    const grid = document.getElementById('page-grid');
    if (!grid) return;
    const labels = grid.querySelectorAll('.page-number');
    labels.forEach((label, index) => {
        label.textContent = (index + 1).toString();
    });
}

function attachEventListeners(element: HTMLElement) {
    const duplicateBtn = element.querySelector('.duplicate-btn');
    const deleteBtn = element.querySelector('.delete-btn');

    duplicateBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const clone = element.cloneNode(true) as HTMLElement;
        element.after(clone);
        attachEventListeners(clone);
        renumberPages();
        createIcons({ icons });
        initializeSortable();
    });

    deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const grid = document.getElementById('page-grid');
        if (grid && grid.children.length > 1) {
            element.remove();
            renumberPages();
            initializeSortable();
        } else {
            showAlert('Cannot Delete', 'You cannot delete the last page of the document.');
        }
    });
}

async function renderThumbnails() {
    const grid = document.getElementById('page-grid');
    const processBtn = document.getElementById('process-btn');
    if (!grid) return;

    grid.innerHTML = '';
    grid.classList.remove('hidden');
    processBtn?.classList.remove('hidden');

    for (let i = 1; i <= organizeState.totalPages; i++) {
        const page = await organizeState.pdfJsDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const wrapper = document.createElement('div');
        wrapper.className = 'page-thumbnail relative cursor-move flex flex-col items-center gap-2';
        wrapper.dataset.originalPageIndex = (i - 1).toString();

        const imgContainer = document.createElement('div');
        imgContainer.className = 'w-full h-36 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600';

        const img = document.createElement('img');
        img.src = canvas.toDataURL();
        img.className = 'max-w-full max-h-full object-contain';
        imgContainer.appendChild(img);

        const pageLabel = document.createElement('span');
        pageLabel.className = 'page-number absolute top-1 left-1 bg-gray-900 bg-opacity-75 text-white text-xs rounded-full px-2 py-1';
        pageLabel.textContent = i.toString();

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'flex items-center justify-center gap-4';

        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'duplicate-btn bg-green-600 hover:bg-green-700 text-white rounded-full w-8 h-8 flex items-center justify-center';
        duplicateBtn.title = 'Duplicate Page';
        duplicateBtn.innerHTML = '<i data-lucide="copy-plus" class="w-5 h-5"></i>';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center';
        deleteBtn.title = 'Delete Page';
        deleteBtn.innerHTML = '<i data-lucide="x-circle" class="w-5 h-5"></i>';

        controlsDiv.append(duplicateBtn, deleteBtn);
        wrapper.append(imgContainer, pageLabel, controlsDiv);
        grid.appendChild(wrapper);

        attachEventListeners(wrapper);
    }

    createIcons({ icons });
    initializeSortable();
}

function initializeSortable() {
    const grid = document.getElementById('page-grid');
    if (!grid) return;

    if (organizeState.sortableInstance) organizeState.sortableInstance.destroy();

    organizeState.sortableInstance = Sortable.create(grid, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        filter: '.duplicate-btn, .delete-btn',
        preventOnFilter: true,
        onStart: (evt) => {
            if (evt.item) evt.item.style.opacity = '0.5';
        },
        onEnd: (evt) => {
            if (evt.item) evt.item.style.opacity = '1';
        },
    });
}

async function saveChanges() {
    showLoader('Building new PDF...');

    try {
        const grid = document.getElementById('page-grid');
        if (!grid) return;

        const finalPageElements = grid.querySelectorAll('.page-thumbnail');
        const finalIndices = Array.from(finalPageElements)
            .map(el => parseInt((el as HTMLElement).dataset.originalPageIndex || '', 10))
            .filter(index => !isNaN(index) && index >= 0);

        if (finalIndices.length === 0) {
            showAlert('Error', 'No valid pages to save.');
            return;
        }

        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(organizeState.pdfDoc, finalIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const baseName = organizeState.file?.name.replace('.pdf', '') || 'document';
        downloadFile(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }), `${baseName}_organized.pdf`);

        hideLoader();
        showAlert('Success', 'PDF organized successfully!', 'success', () => resetState());
    } catch (error) {
        console.error('Error saving changes:', error);
        hideLoader();
        showAlert('Error', 'Failed to save changes.');
    }
}

function resetState() {
    if (organizeState.sortableInstance) {
        organizeState.sortableInstance.destroy();
        organizeState.sortableInstance = null;
    }

    organizeState.file = null;
    organizeState.pdfDoc = null;
    organizeState.pdfJsDoc = null;
    organizeState.totalPages = 0;

    const grid = document.getElementById('page-grid');
    if (grid) {
        grid.innerHTML = '';
        grid.classList.add('hidden');
    }
    document.getElementById('process-btn')?.classList.add('hidden');
    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';
}
