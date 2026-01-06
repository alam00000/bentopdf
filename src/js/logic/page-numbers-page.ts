import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { downloadFile, hexToRgb, formatBytes } from '../utils/helpers.js';
import { PDFDocument as PDFLibDocument, rgb, StandardFonts } from 'pdf-lib';

interface PageState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
}

const pageState: PageState = {
    file: null,
    pdfDoc: null,
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
    const backBtn = document.getElementById('back-to-tools');
    const processBtn = document.getElementById('process-btn');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
        fileInput.addEventListener('click', () => { fileInput.value = ''; });
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
            if (e.dataTransfer?.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (processBtn) {
        processBtn.addEventListener('click', addPageNumbers);
    }
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
        handleFiles(input.files);
    }
}

async function handleFiles(files: FileList) {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') {
        showAlert('Invalid File', 'Please upload a valid PDF file.');
        return;
    }

    showLoader('Loading PDF...');
    try {
        const arrayBuffer = await file.arrayBuffer();
        pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer);
        pageState.file = file;

        updateFileDisplay();
        document.getElementById('options-panel')?.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        showAlert('Error', 'Failed to load PDF file.');
    } finally {
        hideLoader();
    }
}

function updateFileDisplay() {
    const fileDisplayArea = document.getElementById('file-display-area');
    if (!fileDisplayArea || !pageState.file || !pageState.pdfDoc) return;

    fileDisplayArea.innerHTML = '';
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = pageState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageState.pdfDoc.getPageCount()} pages`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = resetState;

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });
}

function resetState() {
    pageState.file = null;
    pageState.pdfDoc = null;
    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';
    document.getElementById('options-panel')?.classList.add('hidden');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
}

async function addPageNumbers() {
    if (!pageState.pdfDoc) {
        showAlert('Error', 'Please upload a PDF file first.');
        return;
    }

    showLoader('Adding page numbers...');
    try {
        const position = (document.getElementById('position') as HTMLSelectElement).value;
        const fontSize = parseInt((document.getElementById('font-size') as HTMLInputElement).value) || 12;
        const format = (document.getElementById('number-format') as HTMLSelectElement).value;
        const colorHex = (document.getElementById('text-color') as HTMLInputElement).value;
        const textColor = hexToRgb(colorHex);

        const pages = pageState.pdfDoc.getPages();
        const totalPages = pages.length;
        const helveticaFont = await pageState.pdfDoc.embedFont(StandardFonts.Helvetica);

        for (let i = 0; i < totalPages; i++) {
            const page = pages[i];

            const mediaBox = page.getMediaBox();
            const cropBox = page.getCropBox();
            const bounds = cropBox || mediaBox;
            const width = bounds.width;
            const height = bounds.height;
            const xOffset = bounds.x || 0;
            const yOffset = bounds.y || 0;

            const pageNumText = format === 'page_x_of_y' ? `${i + 1} / ${totalPages}` : `${i + 1}`;

            const textWidth = helveticaFont.widthOfTextAtSize(pageNumText, fontSize);
            const textHeight = fontSize;

            const minMargin = 8;
            const maxMargin = 40;
            const marginPercentage = 0.04;

            const horizontalMargin = Math.max(minMargin, Math.min(maxMargin, width * marginPercentage));
            const verticalMargin = Math.max(minMargin, Math.min(maxMargin, height * marginPercentage));

            const safeHorizontalMargin = Math.max(horizontalMargin, textWidth / 2 + 3);
            const safeVerticalMargin = Math.max(verticalMargin, textHeight + 3);

            let x = 0, y = 0;

            switch (position) {
                case 'bottom-center':
                    x = Math.max(safeHorizontalMargin, Math.min(width - safeHorizontalMargin - textWidth, (width - textWidth) / 2)) + xOffset;
                    y = safeVerticalMargin + yOffset;
                    break;
                case 'bottom-left':
                    x = safeHorizontalMargin + xOffset;
                    y = safeVerticalMargin + yOffset;
                    break;
                case 'bottom-right':
                    x = Math.max(safeHorizontalMargin, width - safeHorizontalMargin - textWidth) + xOffset;
                    y = safeVerticalMargin + yOffset;
                    break;
                case 'top-center':
                    x = Math.max(safeHorizontalMargin, Math.min(width - safeHorizontalMargin - textWidth, (width - textWidth) / 2)) + xOffset;
                    y = height - safeVerticalMargin - textHeight + yOffset;
                    break;
                case 'top-left':
                    x = safeHorizontalMargin + xOffset;
                    y = height - safeVerticalMargin - textHeight + yOffset;
                    break;
                case 'top-right':
                    x = Math.max(safeHorizontalMargin, width - safeHorizontalMargin - textWidth) + xOffset;
                    y = height - safeVerticalMargin - textHeight + yOffset;
                    break;
            }

            x = Math.max(xOffset + 3, Math.min(xOffset + width - textWidth - 3, x));
            y = Math.max(yOffset + 3, Math.min(yOffset + height - textHeight - 3, y));

            page.drawText(pageNumText, {
                x,
                y,
                font: helveticaFont,
                size: fontSize,
                color: rgb(textColor.r, textColor.g, textColor.b),
            });
        }

        const newPdfBytes = await pageState.pdfDoc.save();
        downloadFile(new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }), 'paginated.pdf');
        showAlert('Success', 'Page numbers added successfully!', 'success', () => { resetState(); });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Could not add page numbers.');
    } finally {
        hideLoader();
    }
}
