// Logic for PDF Editor Page
import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';

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

        dropZone.addEventListener('click', () => {
            fileInput?.click();
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
    input.value = '';
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

        if (!pdfWrapper || !pdfContainer || !uploader || !dropZone) return;

        // Hide uploader elements but keep the container
        dropZone.classList.add('hidden');

        // Clear previous content
        pdfContainer.textContent = '';
        if (currentPdfUrl) {
            URL.revokeObjectURL(currentPdfUrl);
        }

        // Show editor container
        pdfWrapper.classList.remove('hidden');

        const fileURL = URL.createObjectURL(file);
        currentPdfUrl = fileURL;

        // Dynamically load EmbedPDF script
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
        import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';
        EmbedPDF.init({
            type: 'container',
            target: document.getElementById('embed-pdf-container'),
            src: '${fileURL}',
        });
    `;
        document.head.appendChild(script);

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
