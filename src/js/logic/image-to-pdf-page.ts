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
        file.type.startsWith('image/')
    );

    if (validFiles.length < newFiles.length) {
        showAlert('Invalid Files', 'Some files were skipped. Only image files are allowed.');
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

function sanitizeImageAsJpeg(imageBytes: any) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([imageBytes]);
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(imageUrl);
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                async (jpegBlob) => {
                    if (!jpegBlob) {
                        return reject(new Error('Canvas toBlob conversion failed.'));
                    }
                    const arrayBuffer = await jpegBlob.arrayBuffer();
                    resolve(new Uint8Array(arrayBuffer));
                },
                'image/jpeg',
                0.9
            );
            URL.revokeObjectURL(imageUrl);
        };

        img.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(
                new Error(
                    'The provided file could not be loaded as an image. It may be corrupted.'
                )
            );
        };

        img.src = imageUrl;
    });
}

// Special handler for SVG files - must read as text
function svgToPng(svgText: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const width = img.naturalWidth || img.width || 800;
            const height = img.naturalHeight || img.height || 600;

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject(new Error('Could not get canvas context'));
            }

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
        showAlert('No Files', 'Please select at least one image file.');
        return;
    }

    showLoader('Creating PDF from images...');

    try {
        const pdfDoc = await PDFLibDocument.create();

        for (const file of files) {
            try {
                const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

                if (isSvg) {
                    // Handle SVG files - read as text
                    const svgText = await file.text();
                    const pngBytes = await svgToPng(svgText);
                    const pngImage = await pdfDoc.embedPng(pngBytes);

                    const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
                    page.drawImage(pngImage, {
                        x: 0,
                        y: 0,
                        width: pngImage.width,
                        height: pngImage.height,
                    });
                } else if (file.type === 'image/png') {
                    // Handle PNG files
                    const originalBytes = await readFileAsArrayBuffer(file);
                    const pngImage = await pdfDoc.embedPng(originalBytes as Uint8Array);

                    const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
                    page.drawImage(pngImage, {
                        x: 0,
                        y: 0,
                        width: pngImage.width,
                        height: pngImage.height,
                    });
                } else {
                    // Handle JPG/other raster images
                    const originalBytes = await readFileAsArrayBuffer(file);
                    let jpgImage;

                    try {
                        jpgImage = await pdfDoc.embedJpg(originalBytes as Uint8Array);
                    } catch (e) {
                        // Fallback: convert to JPEG via canvas
                        const sanitizedBytes = await sanitizeImageAsJpeg(originalBytes);
                        jpgImage = await pdfDoc.embedJpg(sanitizedBytes as Uint8Array);
                    }

                    const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
                    page.drawImage(jpgImage, {
                        x: 0,
                        y: 0,
                        width: jpgImage.width,
                        height: jpgImage.height,
                    });
                }
            } catch (error) {
                console.error(`Failed to process ${file.name}:`, error);
                throw new Error(`Could not process "${file.name}". The file may be corrupted.`);
            }
        }

        const pdfBytes = await pdfDoc.save();
        downloadFile(
            new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
            'from_images.pdf'
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
