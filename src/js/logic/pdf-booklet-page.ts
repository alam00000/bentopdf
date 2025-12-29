import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument, degrees, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

interface BookletState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
    pdfBytes: Uint8Array | null;
    pdfjsDoc: pdfjsLib.PDFDocumentProxy | null;
}

const pageState: BookletState = {
    file: null,
    pdfDoc: null,
    pdfBytes: null,
    pdfjsDoc: null,
};

function resetState() {
    pageState.file = null;
    pageState.pdfDoc = null;
    pageState.pdfBytes = null;
    pageState.pdfjsDoc = null;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const previewArea = document.getElementById('booklet-preview');
    if (previewArea) previewArea.innerHTML = '<p class="text-gray-400 text-center py-8">Upload a PDF and click "Generate Preview" to see the booklet layout</p>';

    const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
    if (downloadBtn) downloadBtn.disabled = true;
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
        metaSpan.textContent = `${formatBytes(pageState.file.size)} • Loading...`;

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

        try {
            showLoader('Loading PDF...');
            const arrayBuffer = await pageState.file.arrayBuffer();
            pageState.pdfBytes = new Uint8Array(arrayBuffer);

            pageState.pdfDoc = await PDFLibDocument.load(pageState.pdfBytes, {
                ignoreEncryption: true,
                throwOnInvalidObject: false
            });

            pageState.pdfjsDoc = await pdfjsLib.getDocument({ data: pageState.pdfBytes.slice() }).promise;

            hideLoader();

            const pageCount = pageState.pdfDoc.getPageCount();
            metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageCount} pages`;

            if (toolOptions) toolOptions.classList.remove('hidden');

            const previewBtn = document.getElementById('preview-btn') as HTMLButtonElement;
            if (previewBtn) previewBtn.disabled = false;
        } catch (error) {
            console.error('Error loading PDF:', error);
            hideLoader();
            showAlert('Error', 'Failed to load PDF file.');
            resetState();
        }
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

function getGridDimensions(): { rows: number; cols: number } {
    const gridMode = (document.querySelector('input[name="grid-mode"]:checked') as HTMLInputElement)?.value || '1x2';
    switch (gridMode) {
        case '1x2': return { rows: 1, cols: 2 };
        case '2x2': return { rows: 2, cols: 2 };
        case '2x4': return { rows: 2, cols: 4 };
        case '4x4': return { rows: 4, cols: 4 };
        default: return { rows: 1, cols: 2 };
    }
}

function getOrientation(isBookletMode: boolean): 'portrait' | 'landscape' {
    const orientationValue = (document.querySelector('input[name="orientation"]:checked') as HTMLInputElement)?.value || 'auto';
    if (orientationValue === 'portrait') return 'portrait';
    if (orientationValue === 'landscape') return 'landscape';
    return isBookletMode ? 'landscape' : 'portrait';
}

function getSheetDimensions(isBookletMode: boolean): { width: number; height: number } {
    const paperSizeKey = (document.getElementById('paper-size') as HTMLSelectElement).value as keyof typeof PageSizes;
    const pageDims = PageSizes[paperSizeKey] || PageSizes.Letter;
    const orientation = getOrientation(isBookletMode);
    if (orientation === 'landscape') {
        return { width: pageDims[1], height: pageDims[0] };
    }
    return { width: pageDims[0], height: pageDims[1] };
}

async function generatePreview() {
    if (!pageState.pdfDoc || !pageState.pdfjsDoc) {
        showAlert('Error', 'Please load a PDF first.');
        return;
    }

    const previewArea = document.getElementById('booklet-preview')!;
    const totalPages = pageState.pdfDoc.getPageCount();
    const { rows, cols } = getGridDimensions();
    const pagesPerSheet = rows * cols;
    const isBookletMode = rows === 1 && cols === 2;

    let numSheets: number;
    if (isBookletMode) {
        const sheetsNeeded = Math.ceil(totalPages / 4);
        numSheets = sheetsNeeded * 2;
    } else {
        numSheets = Math.ceil(totalPages / pagesPerSheet);
    }

    const { width: sheetWidth, height: sheetHeight } = getSheetDimensions(isBookletMode);

    // Get container width to make canvas fill it
    const previewContainer = document.getElementById('booklet-preview')!;
    const containerWidth = previewContainer.clientWidth - 32; // account for padding
    const aspectRatio = sheetWidth / sheetHeight;
    const canvasWidth = containerWidth;
    const canvasHeight = containerWidth / aspectRatio;

    previewArea.innerHTML = '<p class="text-gray-400 text-center py-4">Generating preview...</p>';

    const totalRounded = isBookletMode ? Math.ceil(totalPages / 4) * 4 : totalPages;
    const rotationMode = (document.querySelector('input[name="rotation"]:checked') as HTMLInputElement)?.value || 'none';

    const pageThumbnails: Map<number, ImageBitmap> = new Map();
    const thumbnailScale = 0.3;

    for (let i = 1; i <= totalPages; i++) {
        try {
            const page = await pageState.pdfjsDoc.getPage(i);
            const viewport = page.getViewport({ scale: thumbnailScale });

            const offscreen = new OffscreenCanvas(viewport.width, viewport.height);
            const ctx = offscreen.getContext('2d')!;

            await page.render({
                canvasContext: ctx as any,
                viewport: viewport,
                canvas: offscreen as any,
            }).promise;

            const bitmap = await createImageBitmap(offscreen);
            pageThumbnails.set(i, bitmap);
        } catch (e) {
            console.error(`Failed to render page ${i}:`, e);
        }
    }

    previewArea.innerHTML = `<p class="text-indigo-400 text-sm mb-4 text-center">${totalPages} pages → ${numSheets} output sheets</p>`;

    for (let sheetIndex = 0; sheetIndex < numSheets; sheetIndex++) {
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.className = 'border border-gray-600 rounded-lg mb-4';

        const ctx = canvas.getContext('2d')!;

        const isFront = sheetIndex % 2 === 0;
        ctx.fillStyle = isFront ? '#1f2937' : '#1a2e1a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        const cellWidth = canvasWidth / cols;
        const cellHeight = canvasHeight / rows;
        const padding = 4;

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        for (let c = 1; c < cols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * cellWidth, 0);
            ctx.lineTo(c * cellWidth, canvasHeight);
            ctx.stroke();
        }
        for (let r = 1; r < rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * cellHeight);
            ctx.lineTo(canvasWidth, r * cellHeight);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const slotIndex = r * cols + c;
                let pageNumber: number;

                if (isBookletMode) {
                    const physicalSheet = Math.floor(sheetIndex / 2);
                    const isFrontSide = sheetIndex % 2 === 0;
                    if (isFrontSide) {
                        pageNumber = c === 0 ? totalRounded - 2 * physicalSheet : 2 * physicalSheet + 1;
                    } else {
                        pageNumber = c === 0 ? 2 * physicalSheet + 2 : totalRounded - 2 * physicalSheet - 1;
                    }
                } else {
                    pageNumber = sheetIndex * pagesPerSheet + slotIndex + 1;
                }

                const x = c * cellWidth + padding;
                const y = r * cellHeight + padding;
                const slotWidth = cellWidth - padding * 2;
                const slotHeight = cellHeight - padding * 2;

                const exists = pageNumber >= 1 && pageNumber <= totalPages;

                if (exists) {
                    const thumbnail = pageThumbnails.get(pageNumber);
                    if (thumbnail) {
                        let rotation = 0;
                        if (rotationMode === '90cw') rotation = 90;
                        else if (rotationMode === '90ccw') rotation = -90;
                        else if (rotationMode === 'alternate') rotation = (pageNumber % 2 === 1) ? 90 : -90;

                        const isRotated = rotation !== 0;
                        const srcWidth = isRotated ? thumbnail.height : thumbnail.width;
                        const srcHeight = isRotated ? thumbnail.width : thumbnail.height;
                        const scale = Math.min(slotWidth / srcWidth, slotHeight / srcHeight);
                        const drawWidth = srcWidth * scale;
                        const drawHeight = srcHeight * scale;
                        const drawX = x + (slotWidth - drawWidth) / 2;
                        const drawY = y + (slotHeight - drawHeight) / 2;

                        ctx.save();
                        if (rotation !== 0) {
                            const centerX = drawX + drawWidth / 2;
                            const centerY = drawY + drawHeight / 2;
                            ctx.translate(centerX, centerY);
                            ctx.rotate((rotation * Math.PI) / 180);
                            ctx.drawImage(thumbnail, -drawHeight / 2, -drawWidth / 2, drawHeight, drawWidth);
                        } else {
                            ctx.drawImage(thumbnail, drawX, drawY, drawWidth, drawHeight);
                        }
                        ctx.restore();

                        ctx.strokeStyle = '#6b7280';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.font = 'bold 10px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(`${pageNumber}`, x + slotWidth / 2, y + slotHeight - 4);
                    }
                } else {
                    ctx.fillStyle = '#374151';
                    ctx.fillRect(x, y, slotWidth, slotHeight);
                    ctx.strokeStyle = '#4b5563';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, slotWidth, slotHeight);

                    ctx.fillStyle = '#6b7280';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('(blank)', x + slotWidth / 2, y + slotHeight / 2);
                }
            }
        }

        ctx.fillStyle = '#9ca3af';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const sideLabel = isBookletMode ? (isFront ? 'Front' : 'Back') : '';
        ctx.fillText(`Sheet ${Math.floor(sheetIndex / (isBookletMode ? 2 : 1)) + 1} ${sideLabel}`, canvasWidth - 6, 4);

        previewArea.appendChild(canvas);
    }

    pageThumbnails.forEach(bitmap => bitmap.close());

    const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;
    downloadBtn.disabled = false;
}

function applyRotation(doc: PDFLibDocument, mode: string) {
    const pages = doc.getPages();
    pages.forEach((page, index) => {
        let rotation = 0;
        switch (mode) {
            case '90cw': rotation = 90; break;
            case '90ccw': rotation = -90; break;
            case 'alternate': rotation = (index % 2 === 0) ? 90 : -90; break;
            default: rotation = 0;
        }
        if (rotation !== 0) {
            page.setRotation(degrees(page.getRotation().angle + rotation));
        }
    });
}

async function createBooklet() {
    if (!pageState.pdfBytes) {
        showAlert('Error', 'Please load a PDF first.');
        return;
    }

    showLoader('Creating Booklet...');

    try {
        const sourceDoc = await PDFLibDocument.load(pageState.pdfBytes.slice());
        const rotationMode = (document.querySelector('input[name="rotation"]:checked') as HTMLInputElement)?.value || 'none';
        applyRotation(sourceDoc, rotationMode);

        const totalPages = sourceDoc.getPageCount();
        const { rows, cols } = getGridDimensions();
        const pagesPerSheet = rows * cols;
        const isBookletMode = rows === 1 && cols === 2;

        const { width: sheetWidth, height: sheetHeight } = getSheetDimensions(isBookletMode);

        const outputDoc = await PDFLibDocument.create();

        let numSheets: number;
        let totalRounded: number;
        if (isBookletMode) {
            totalRounded = Math.ceil(totalPages / 4) * 4;
            numSheets = Math.ceil(totalPages / 4) * 2;
        } else {
            totalRounded = totalPages;
            numSheets = Math.ceil(totalPages / pagesPerSheet);
        }

        const cellWidth = sheetWidth / cols;
        const cellHeight = sheetHeight / rows;
        const padding = 10;

        for (let sheetIndex = 0; sheetIndex < numSheets; sheetIndex++) {
            const outputPage = outputDoc.addPage([sheetWidth, sheetHeight]);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const slotIndex = r * cols + c;
                    let pageNumber: number;

                    if (isBookletMode) {
                        const physicalSheet = Math.floor(sheetIndex / 2);
                        const isFrontSide = sheetIndex % 2 === 0;
                        if (isFrontSide) {
                            pageNumber = c === 0 ? totalRounded - 2 * physicalSheet : 2 * physicalSheet + 1;
                        } else {
                            pageNumber = c === 0 ? 2 * physicalSheet + 2 : totalRounded - 2 * physicalSheet - 1;
                        }
                    } else {
                        pageNumber = sheetIndex * pagesPerSheet + slotIndex + 1;
                    }

                    if (pageNumber >= 1 && pageNumber <= totalPages) {
                        const [embeddedPage] = await outputDoc.embedPdf(sourceDoc, [pageNumber - 1]);
                        const { width: srcW, height: srcH } = embeddedPage;

                        const availableWidth = cellWidth - padding * 2;
                        const availableHeight = cellHeight - padding * 2;
                        const scale = Math.min(availableWidth / srcW, availableHeight / srcH);

                        const scaledWidth = srcW * scale;
                        const scaledHeight = srcH * scale;

                        const x = c * cellWidth + padding + (availableWidth - scaledWidth) / 2;
                        const y = sheetHeight - (r + 1) * cellHeight + padding + (availableHeight - scaledHeight) / 2;

                        outputPage.drawPage(embeddedPage, {
                            x,
                            y,
                            width: scaledWidth,
                            height: scaledHeight,
                        });
                    }
                }
            }
        }

        const pdfBytes = await outputDoc.save();
        const originalName = pageState.file?.name.replace(/\.pdf$/i, '') || 'document';

        downloadFile(
            new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
            `${originalName}_booklet.pdf`
        );

        showAlert('Success', `Booklet created with ${numSheets} sheets!`, 'success', function () {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'An error occurred while creating the booklet.');
    } finally {
        hideLoader();
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

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const previewBtn = document.getElementById('preview-btn');
    const downloadBtn = document.getElementById('download-btn');
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

    if (previewBtn) {
        previewBtn.addEventListener('click', generatePreview);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', createBooklet);
    }
});
