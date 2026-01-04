// Self-contained Form Filler logic for standalone page
import { createIcons, icons } from 'lucide';
import { getPDFDocument } from '../utils/helpers.js';

let viewerIframe: HTMLIFrameElement | null = null;
let viewerReady = false;
let currentFile: File | null = null;

// UI helpers
function showLoader(message: string = 'Processing...') {
    const loader = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');
    if (loader) loader.classList.remove('hidden');
    if (loaderText) loaderText.textContent = message;
}

function hideLoader() {
    const loader = document.getElementById('loader-modal');
    if (loader) loader.classList.add('hidden');
}

function showAlert(title: string, message: string, type: string = 'error', callback?: () => void) {
    const modal = document.getElementById('alert-modal');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const okBtn = document.getElementById('alert-ok');

    if (alertTitle) alertTitle.textContent = title;
    if (alertMessage) alertMessage.textContent = message;
    if (modal) modal.classList.remove('hidden');

    if (okBtn) {
        const newOkBtn = okBtn.cloneNode(true) as HTMLElement;
        okBtn.replaceWith(newOkBtn);
        newOkBtn.addEventListener('click', () => {
            modal?.classList.add('hidden');
            if (callback) callback();
        });
    }
}

function updateFileDisplay() {
    const displayArea = document.getElementById('file-display-area');
    if (!displayArea || !currentFile) return;

    const fileSize = currentFile.size < 1024 * 1024
        ? `${(currentFile.size / 1024).toFixed(1)} KB`
        : `${(currentFile.size / 1024 / 1024).toFixed(2)} MB`;

    displayArea.innerHTML = `
        <div class="bg-gray-700 p-3 rounded-lg border border-gray-600 hover:border-indigo-500 transition-colors">
            <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                    <p class="truncate font-medium text-white">${currentFile.name}</p>
                    <p class="text-gray-400 text-sm">${fileSize}</p>
                </div>
                <button id="remove-file" class="text-red-400 hover:text-red-300 p-2 flex-shrink-0 ml-2" title="Remove file">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
    `;

    createIcons({ icons });

    document.getElementById('remove-file')?.addEventListener('click', () => resetState());
}

function resetState() {
    viewerIframe = null;
    viewerReady = false;
    currentFile = null;
    const displayArea = document.getElementById('file-display-area');
    if (displayArea) displayArea.innerHTML = '';
    document.getElementById('form-filler-options')?.classList.add('hidden');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    // Clear viewer
    const viewerContainer = document.getElementById('pdf-viewer-container');
    if (viewerContainer) {
        viewerContainer.innerHTML = '';
        viewerContainer.style.height = '';
        viewerContainer.style.aspectRatio = '';
    }

    const toolUploader = document.getElementById('tool-uploader');
    const isFullWidth = localStorage.getItem('fullWidthMode') !== 'false';
    if (toolUploader && !isFullWidth) {
        toolUploader.classList.remove('max-w-6xl');
        toolUploader.classList.add('max-w-2xl');
    }
}

// File handling
async function handleFileUpload(file: File) {
    if (!file || file.type !== 'application/pdf') {
        showAlert('Error', 'Please upload a valid PDF file.');
        return;
    }

    currentFile = file;
    updateFileDisplay();
    await setupFormViewer();
}

async function adjustViewerHeight(file: File) {
    const viewerContainer = document.getElementById('pdf-viewer-container');
    if (!viewerContainer) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getPDFDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        // Add ~50px for toolbar height
        const aspectRatio = viewport.width / (viewport.height + 50);

        viewerContainer.style.height = 'auto';
        viewerContainer.style.aspectRatio = `${aspectRatio}`;
    } catch (e) {
        console.error('Error adjusting viewer height:', e);
        viewerContainer.style.height = '80vh';
    }
}

async function setupFormViewer() {
    if (!currentFile) return;

    showLoader('Loading PDF form...');
    const pdfViewerContainer = document.getElementById('pdf-viewer-container');

    if (!pdfViewerContainer) {
        console.error('PDF viewer container not found');
        hideLoader();
        return;
    }

    const toolUploader = document.getElementById('tool-uploader');
    // Default to true if not set
    const isFullWidth = localStorage.getItem('fullWidthMode') !== 'false';
    if (toolUploader && !isFullWidth) {
        toolUploader.classList.remove('max-w-2xl');
        toolUploader.classList.add('max-w-6xl');
    }

    try {
        // Apply dynamic height
        await adjustViewerHeight(currentFile);

        pdfViewerContainer.innerHTML = '';

        const arrayBuffer = await currentFile.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        viewerIframe = document.createElement('iframe');
        viewerIframe.src = `${import.meta.env.BASE_URL}pdfjs-viewer/viewer.html?file=${encodeURIComponent(blobUrl)}`;
        viewerIframe.style.width = '100%';
        viewerIframe.style.height = '100%';
        viewerIframe.style.border = 'none';

        viewerIframe.onload = () => {
            viewerReady = true;
            hideLoader();
        };

        pdfViewerContainer.appendChild(viewerIframe);

        const formFillerOptions = document.getElementById('form-filler-options');
        if (formFillerOptions) formFillerOptions.classList.remove('hidden');
    } catch (e) {
        console.error('Critical error setting up form filler:', e);
        showAlert('Error', 'Failed to load PDF form viewer.');
        hideLoader();
    }
}

async function processAndDownloadForm() {
    if (!viewerIframe || !viewerReady) {
        showAlert('Viewer not ready', 'Please wait for the form to finish loading.');
        return;
    }

    try {
        const viewerWindow = viewerIframe.contentWindow;
        if (!viewerWindow) {
            console.error('Cannot access iframe window');
            showAlert('Download', 'Please use the Download button in the PDF viewer toolbar above.');
            return;
        }

        const viewerDoc = viewerWindow.document;
        if (!viewerDoc) {
            console.error('Cannot access iframe document');
            showAlert('Download', 'Please use the Download button in the PDF viewer toolbar above.');
            return;
        }

        const downloadBtn = viewerDoc.getElementById('downloadButton') as HTMLButtonElement | null;

        if (downloadBtn) {
            console.log('Clicking download button...');
            downloadBtn.click();
        } else {
            console.error('Download button not found in viewer');
            const secondaryDownload = viewerDoc.getElementById('secondaryDownload') as HTMLButtonElement | null;
            if (secondaryDownload) {
                console.log('Clicking secondary download button...');
                secondaryDownload.click();
            } else {
                showAlert('Download', 'Please use the Download button in the PDF viewer toolbar above.');
            }
        }
    } catch (e) {
        console.error('Failed to trigger download:', e);
        showAlert('Download', 'Cannot access viewer controls. Please use the Download button in the PDF viewer toolbar above.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');

    fileInput?.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileUpload(file);
    });

    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500');
    });

    dropZone?.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-indigo-500');
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500');
        const file = e.dataTransfer?.files[0];
        if (file) handleFileUpload(file);
    });

    processBtn?.addEventListener('click', processAndDownloadForm);

    backBtn?.addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
});
