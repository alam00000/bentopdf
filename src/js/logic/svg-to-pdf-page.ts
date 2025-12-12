import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, formatBytes } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';

let files: File[] = [];

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

        // Clear value on click to allow re-selecting the same file
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

function handleFiles(newFiles: FileList) {
    const validFiles = Array.from(newFiles).filter(file =>
        file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    );

    if (validFiles.length < newFiles.length) {
        showAlert('Invalid Files', 'Some files were skipped. Only SVG graphics are allowed.');
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

function svgToPng(svgText: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        // Create a proper SVG data URL from the SVG text
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Use a reasonable default size if SVG has no explicit dimensions
            const width = img.naturalWidth || img.width || 800;
            const height = img.naturalHeight || img.height || 600;

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject(new Error('Could not get canvas context'));
            }

            // Fill with white background for transparency
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                async (pngBlob) => {
                    URL.revokeObjectURL(url);
                    if (!pngBlob) {
                        return reject(new Error('Canvas toBlob conversion failed.'));
                    }
                    const arrayBuffer = await pngBlob.arrayBuffer();
                    resolve(new Uint8Array(arrayBuffer));
                },
                'image/png'
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load SVG image'));
        };

        img.src = url;
    });
}

async function convertToPdf() {
    if (files.length === 0) {
        showAlert('No Files', 'Please select at least one SVG file.');
        return;
    }

    showLoader('Creating PDF from SVG files...');

    try {
        const pdfDoc = await PDFLibDocument.create();

        for (const file of files) {
            try {
                // Read SVG as text (not binary)
                const svgText = await file.text();

                // Convert SVG to PNG via canvas
                const pngBytes = await svgToPng(svgText);
                const pngImage = await pdfDoc.embedPng(pngBytes);

                const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
                page.drawImage(pngImage, {
                    x: 0,
                    y: 0,
                    width: pngImage.width,
                    height: pngImage.height,
                });
            } catch (error) {
                console.error(`Failed to process ${file.name}:`, error);
                throw new Error(`Could not process "${file.name}". The file may be corrupted.`);
            }
        }

        const pdfBytes = await pdfDoc.save();
        downloadFile(
            new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
            'from_svgs.pdf'
        );
        showAlert('Success', 'PDF created successfully!', 'success', () => {
            resetState();
        });
    } catch (e: any) {
        console.error(e);
        showAlert('Conversion Error', e.message);
    } finally {
        hideLoader();
    }
}
