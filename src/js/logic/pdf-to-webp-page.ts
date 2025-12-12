import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes, readFileAsArrayBuffer, getPDFDocument } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

let files: File[] = [];

const updateUI = () => {
    const fileDisplayArea = document.getElementById('file-display-area');
    const optionsPanel = document.getElementById('options-panel');
    const dropZone = document.getElementById('drop-zone');

    if (!fileDisplayArea || !optionsPanel || !dropZone) return;

    fileDisplayArea.innerHTML = '';

    if (files.length > 0) {
        optionsPanel.classList.remove('hidden');

        files.forEach((file) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

            const infoContainer = document.createElement('div');
            infoContainer.className = 'flex flex-col overflow-hidden';

            const nameSpan = document.createElement('div');
            nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
            nameSpan.textContent = file.name;

            const metaSpan = document.createElement('div');
            metaSpan.className = 'text-xs text-gray-400';
            metaSpan.textContent = `${formatBytes(file.size)} • Loading pages...`; // Initial state

            infoContainer.append(nameSpan, metaSpan);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
            removeBtn.onclick = () => {
                files = [];
                updateUI();
            };

            fileDiv.append(infoContainer, removeBtn);
            fileDisplayArea.appendChild(fileDiv);

            // Fetch page count asynchronously
            readFileAsArrayBuffer(file).then(buffer => {
                return getPDFDocument(buffer).promise;
            }).then(pdf => {
                metaSpan.textContent = `${formatBytes(file.size)} • ${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`;
            }).catch(e => {
                console.warn('Error loading PDF page count:', e);
                metaSpan.textContent = formatBytes(file.size);
            });
        });

        // Initialize icons immediately after synchronous render
        createIcons({ icons });
    } else {
        optionsPanel.classList.add('hidden');
    }
};

const resetState = () => {
    files = [];
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    const qualitySlider = document.getElementById('webp-quality') as HTMLInputElement;
    const qualityValue = document.getElementById('webp-quality-value');
    if (qualitySlider) qualitySlider.value = '0.85';
    if (qualityValue) qualityValue.textContent = '85%';
    updateUI();
};

async function convert() {
    if (files.length === 0) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }
    showLoader('Converting to WebP...');
    try {
        const pdf = await getPDFDocument(
            await readFileAsArrayBuffer(files[0])
        ).promise;
        const zip = new JSZip();

        const qualityInput = document.getElementById('webp-quality') as HTMLInputElement;
        const quality = qualityInput ? parseFloat(qualityInput.value) : 0.85;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport: viewport, canvas }).promise;

            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/webp', quality)
            );
            if (blob) {
                zip.file(`page_${i}.webp`, blob);
            }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, 'converted_images.zip');
        showAlert('Success', 'PDF converted to WebPs successfully!', 'success', () => {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert(
            'Error',
            'Failed to convert PDF to WebP. The file might be corrupted.'
        );
    } finally {
        hideLoader();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const qualitySlider = document.getElementById('webp-quality') as HTMLInputElement;
    const qualityValue = document.getElementById('webp-quality-value');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = `${Math.round(parseFloat(qualitySlider.value) * 100)}%`;
        });
    }

    const handleFileSelect = (newFiles: FileList | null) => {
        if (!newFiles || newFiles.length === 0) return;
        const validFiles = Array.from(newFiles).filter(
            (file) => file.type === 'application/pdf'
        );

        if (validFiles.length === 0) {
            showAlert('Invalid File', 'Please upload a PDF file.');
            return;
        }

        files = [validFiles[0]];
        updateUI();
    };

    if (fileInput && dropZone) {
        fileInput.addEventListener('change', (e) => {
            handleFileSelect((e.target as HTMLInputElement).files);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-700');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            handleFileSelect(e.dataTransfer?.files ?? null);
        });

        fileInput.addEventListener('click', () => {
            fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', convert);
    }
});
