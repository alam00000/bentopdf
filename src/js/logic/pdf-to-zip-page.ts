import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';

interface PdfToZipState {
    files: File[];
}

const pageState: PdfToZipState = {
    files: [],
};

function resetState() {
    pageState.files = [];

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');

    if (!fileDisplayArea) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.files.length > 0) {
        pageState.files.forEach(function (file, index) {
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
                pageState.files = pageState.files.filter(function (_, i) { return i !== index; });
                updateUI();
            };

            fileDiv.append(infoContainer, removeBtn);
            fileDisplayArea.appendChild(fileDiv);
        });

        createIcons({ icons });

        if (toolOptions) toolOptions.classList.remove('hidden');
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

async function createZipArchive() {
    if (pageState.files.length === 0) {
        showAlert('No Files', 'Please select PDF files to create a ZIP archive.');
        return;
    }

    showLoader('Creating ZIP archive...');

    try {
        const zip = new JSZip();

        for (let i = 0; i < pageState.files.length; i++) {
            const file = pageState.files[i];
            showLoader(`Adding ${file.name} (${i + 1}/${pageState.files.length})...`);
            const arrayBuffer = await file.arrayBuffer();
            zip.file(file.name, arrayBuffer);
        }

        showLoader('Generating ZIP file...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        downloadFile(zipBlob, 'pdfs_archive.zip');

        showAlert('Success', 'ZIP archive created successfully!', 'success', function () {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Could not create ZIP archive.');
    } finally {
        hideLoader();
    }
}

function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const pdfFiles = Array.from(files).filter(function (f) {
            return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        });
        if (pdfFiles.length > 0) {
            pageState.files = [...pageState.files, ...pdfFiles];
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
            handleFileSelect(e.dataTransfer?.files || null);
        });

        fileInput.addEventListener('click', function () {
            fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', createZipArchive);
    }
});
