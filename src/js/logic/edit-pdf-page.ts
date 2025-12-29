// Logic for PDF Editor Page
import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { formatBytes } from '../utils/helpers.js';

const embedPdfWasmUrl = new URL(
    'embedpdf-snippet/dist/pdfium.wasm',
    import.meta.url
).href;

let currentPdfUrl: string | null = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

function initializePage() {
    createIcons({ icons });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-indigo-500');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-indigo-500');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-indigo-500');
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                handleFiles(files);
            }
        });

        fileInput?.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
        });
    }

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        window.location.href = import.meta.env.BASE_URL;
    });
}

async function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        await handleFiles(input.files);
    }
}

async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') {
        showAlert('Invalid File', 'Please upload a valid PDF file.');
        return;
    }

    showLoader('Loading PDF Editor...');

    try {
        const pdfWrapper = document.getElementById('embed-pdf-wrapper');
        const pdfContainer = document.getElementById('embed-pdf-container');
        const uploader = document.getElementById('tool-uploader');
        const dropZone = document.getElementById('drop-zone');
        const fileDisplayArea = document.getElementById('file-display-area');

        if (!pdfWrapper || !pdfContainer || !uploader || !dropZone || !fileDisplayArea) return;


        fileDisplayArea.innerHTML = '';
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col flex-1 min-w-0';

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
        removeBtn.onclick = () => {
            if (currentPdfUrl) {
                URL.revokeObjectURL(currentPdfUrl);
                currentPdfUrl = null;
            }
            pdfContainer.textContent = '';
            pdfWrapper.classList.add('hidden');
            fileDisplayArea.innerHTML = '';
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        };

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);
        createIcons({ icons });

        pdfContainer.textContent = '';
        if (currentPdfUrl) {
            URL.revokeObjectURL(currentPdfUrl);
        }
        pdfWrapper.classList.remove('hidden');

        const fileURL = URL.createObjectURL(file);
        currentPdfUrl = fileURL;

        const { default: EmbedPDF } = await import('embedpdf-snippet');
        EmbedPDF.init({
            type: 'container',
            target: pdfContainer,
            src: fileURL,
            worker: true,
            wasmUrl: embedPdfWasmUrl,
        });

        // Update back button to reset state
        const backBtn = document.getElementById('back-to-tools');
        if (backBtn) {
            // Clone to remove old listeners
            const newBackBtn = backBtn.cloneNode(true);
            backBtn.parentNode?.replaceChild(newBackBtn, backBtn);

            newBackBtn.addEventListener('click', () => {
                if (currentPdfUrl) {
                    URL.revokeObjectURL(currentPdfUrl);
                    currentPdfUrl = null;
                }
                window.location.href = import.meta.env.BASE_URL;
            });
        }

    } catch (error) {
        console.error('Error loading PDF Editor:', error);
        showAlert('Error', 'Failed to load the PDF Editor.');
    } finally {
        hideLoader();
    }
}
