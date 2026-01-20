import { showAlert } from '../ui.js';
import { downloadFile, formatBytes, hexToRgb } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument, rgb, PageSizes } from 'pdf-lib';
import { icons, createIcons } from 'lucide';
import { FixPageSizeState } from '@/types';

const pageState: FixPageSizeState = {
    file: null,
};

function resetState() {
    pageState.file = null;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');

    if (!fileDisplayArea) return;

    fileDisplayArea.innerHTML = '';

    if (pageState.file) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm';

        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex flex-col overflow-hidden';

        const nameSpan = document.createElement('div');
        nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
        nameSpan.textContent = pageState.file.name;

        const metaSpan = document.createElement('div');
        metaSpan.className = 'text-xs text-gray-400';
        metaSpan.textContent = formatBytes(pageState.file.size);

        infoContainer.append(nameSpan, metaSpan);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
        removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
        removeBtn.onclick = function () {
            resetState();
        };

        fileDiv.append(infoContainer, removeBtn);
        fileDisplayArea.appendChild(fileDiv);
        createIcons({ icons });

        if (toolOptions) toolOptions.classList.remove('hidden');
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            pageState.file = file;
            updateUI();
        }
    }
}

async function fixPageSize() {
    if (!pageState.file) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    const targetSizeKey = (document.getElementById('target-size') as HTMLSelectElement).value;
    const orientation = (document.getElementById('orientation') as HTMLSelectElement).value;
    const scalingMode = (document.querySelector('input[name="scaling-mode"]:checked') as HTMLInputElement).value;
    const backgroundColor = hexToRgb((document.getElementById('background-color') as HTMLInputElement).value);

    const loaderModal = document.getElementById('loader-modal');
    const loaderText = document.getElementById('loader-text');
    if (loaderModal) loaderModal.classList.remove('hidden');
    if (loaderText) loaderText.textContent = 'Standardizing pages...';

    try {
        let targetWidth, targetHeight;

        if (targetSizeKey === 'Custom') {
            const width = parseFloat((document.getElementById('custom-width') as HTMLInputElement).value);
            const height = parseFloat((document.getElementById('custom-height') as HTMLInputElement).value);
            const units = (document.getElementById('custom-units') as HTMLSelectElement).value;

            if (units === 'in') {
                targetWidth = width * 72;
                targetHeight = height * 72;
            } else {
                // mm
                targetWidth = width * (72 / 25.4);
                targetHeight = height * (72 / 25.4);
            }
        } else {
            [targetWidth, targetHeight] = PageSizes[targetSizeKey as keyof typeof PageSizes];
        }

        if (orientation === 'landscape' && targetWidth < targetHeight) {
            [targetWidth, targetHeight] = [targetHeight, targetWidth];
        } else if (orientation === 'portrait' && targetWidth > targetHeight) {
            [targetWidth, targetHeight] = [targetHeight, targetWidth];
        }

        const arrayBuffer = await pageState.file.arrayBuffer();
        const sourceDoc = await PDFLibDocument.load(arrayBuffer);
        const newDoc = await PDFLibDocument.create();

        for (const sourcePage of sourceDoc.getPages()) {
            const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize();
            const embeddedPage = await newDoc.embedPage(sourcePage);

            const newPage = newDoc.addPage([targetWidth, targetHeight]);
            newPage.drawRectangle({
                x: 0,
                y: 0,
                width: targetWidth,
                height: targetHeight,
                color: rgb(backgroundColor.r, backgroundColor.g, backgroundColor.b),
            });

            const scaleX = targetWidth / sourceWidth;
            const scaleY = targetHeight / sourceHeight;
            const scale = scalingMode === 'fit' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);

            const scaledWidth = sourceWidth * scale;
            const scaledHeight = sourceHeight * scale;

            const x = (targetWidth - scaledWidth) / 2;
            const y = (targetHeight - scaledHeight) / 2;

            newPage.drawPage(embeddedPage, {
                x,
                y,
                width: scaledWidth,
                height: scaledHeight,
            });
        }

        const newPdfBytes = await newDoc.save();
        downloadFile(
            new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
            'standardized.pdf'
        );
        showAlert('Success', 'Page sizes standardized successfully!', 'success', () => { resetState(); });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'An error occurred while standardizing pages.');
    } finally {
        if (loaderModal) loaderModal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const targetSizeSelect = document.getElementById('target-size');
    const customSizeWrapper = document.getElementById('custom-size-wrapper');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    // Setup custom size toggle
    if (targetSizeSelect && customSizeWrapper) {
        targetSizeSelect.addEventListener('change', function () {
            customSizeWrapper.classList.toggle(
                'hidden',
                (targetSizeSelect as HTMLSelectElement).value !== 'Custom'
            );
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
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const pdfFiles = Array.from(files).filter(function (f) {
                    return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
                });
                if (pdfFiles.length > 0) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(pdfFiles[0]);
                    handleFileSelect(dataTransfer.files);
                }
            }
        });

        fileInput.addEventListener('click', function () {
            fileInput.value = '';
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', fixPageSize);
    }
});
