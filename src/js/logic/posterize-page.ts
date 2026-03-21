import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, parsePageRanges, getPDFDocument, formatBytes } from '../utils/helpers.js';
import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createIcons, icons } from 'lucide';
import { PosterizeState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const pageState: PosterizeState = {
    file: null,
    pdfJsDoc: null,
    pdfBytes: null,
    pageSnapshots: {},
    currentPage: 1,
};

function resetState() {
    pageState.file = null;
    pageState.pdfJsDoc = null;
    pageState.pdfBytes = null;
    pageState.pageSnapshots = {};
    pageState.currentPage = 1;

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
    if (processBtn) processBtn.disabled = true;

    const totalPages = document.getElementById('total-pages');
    if (totalPages) totalPages.textContent = '0';
}

async function renderPosterizePreview(pageNum: number) {
    if (!pageState.pdfJsDoc) return;

    pageState.currentPage = pageNum;
    showLoader(`Rendering preview for page ${pageNum}...`);

    const canvas = document.getElementById('posterize-preview-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (!context) {
        hideLoader();
        return;
    }

    if (pageState.pageSnapshots[pageNum]) {
        canvas.width = pageState.pageSnapshots[pageNum].width;
        canvas.height = pageState.pageSnapshots[pageNum].height;
        context.putImageData(pageState.pageSnapshots[pageNum], 0, 0);
    } else {
        const page = await pageState.pdfJsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        pageState.pageSnapshots[pageNum] = context.getImageData(0, 0, canvas.width, canvas.height);
    }

    updatePreviewNav();
    drawGridOverlay();
    hideLoader();
}

function drawGridOverlay() {
    if (!pageState.pageSnapshots[pageState.currentPage] || !pageState.pdfJsDoc) return;

    const canvas = document.getElementById('posterize-preview-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    context.putImageData(pageState.pageSnapshots[pageState.currentPage], 0, 0);

    const pageRangeInput = (document.getElementById('page-range') as HTMLInputElement).value;
    const pagesToProcess = parsePageRanges(pageRangeInput, pageState.pdfJsDoc.numPages);

    if (pagesToProcess.includes(pageState.currentPage - 1)) {
        const rows = parseInt((document.getElementById('posterize-rows') as HTMLInputElement).value) || 1;
        const cols = parseInt((document.getElementById('posterize-cols') as HTMLInputElement).value) || 1;

        context.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        context.lineWidth = 2;
        context.setLineDash([10, 5]);

        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;

        for (let i = 1; i < cols; i++) {
            context.beginPath();
            context.moveTo(i * cellWidth, 0);
            context.lineTo(i * cellWidth, canvas.height);
            context.stroke();
        }

        for (let i = 1; i < rows; i++) {
            context.beginPath();
            context.moveTo(0, i * cellHeight);
            context.lineTo(canvas.width, i * cellHeight);
            context.stroke();
        }

        context.setLineDash([]);
    }
}

function updatePreviewNav() {
    if (!pageState.pdfJsDoc) return;

    const currentPageSpan = document.getElementById('current-preview-page');
    const prevBtn = document.getElementById('prev-preview-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-preview-page') as HTMLButtonElement;

    if (currentPageSpan) currentPageSpan.textContent = pageState.currentPage.toString();
    if (prevBtn) prevBtn.disabled = pageState.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = pageState.currentPage >= pageState.pdfJsDoc.numPages;
}

async function posterize() {
    if (!pageState.pdfJsDoc || !pageState.pdfBytes) {
        showAlert('No File', 'Please upload a PDF file first.');
        return;
    }

    showLoader('Posterizing PDF...');

    try {
        const rows = parseInt((document.getElementById('posterize-rows') as HTMLInputElement).value) || 1;
        const cols = parseInt((document.getElementById('posterize-cols') as HTMLInputElement).value) || 1;
        const pageSizeKey = (document.getElementById('output-page-size') as HTMLSelectElement).value as keyof typeof PageSizes;
        const orientation = (document.getElementById('output-orientation') as HTMLSelectElement).value;
        const scalingMode = (document.querySelector('input[name="scaling-mode"]:checked') as HTMLInputElement).value;
        const overlap = parseFloat((document.getElementById('overlap') as HTMLInputElement).value) || 0;
        const overlapUnits = (document.getElementById('overlap-units') as HTMLSelectElement).value;
        const pageRangeInput = (document.getElementById('page-range') as HTMLInputElement).value;

        let overlapInPoints = overlap;
        if (overlapUnits === 'in') overlapInPoints = overlap * 72;
        else if (overlapUnits === 'mm') overlapInPoints = overlap * (72 / 25.4);

        const newDoc = await PDFDocument.create();
        const totalPages = pageState.pdfJsDoc.numPages;
        const pageIndicesToProcess = parsePageRanges(pageRangeInput, totalPages);

        if (pageIndicesToProcess.length === 0) {
            throw new Error('Invalid page range specified.');
        }

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
            throw new Error('Could not create canvas context.');
        }

        for (const pageIndex of pageIndicesToProcess) {
            const page = await pageState.pdfJsDoc.getPage(Number(pageIndex) + 1);
            const viewport = page.getViewport({ scale: 2.0 });
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            await page.render({ canvasContext: tempCtx, viewport, canvas: tempCanvas }).promise;

            let [targetWidth, targetHeight] = PageSizes[pageSizeKey] || PageSizes.A4;
            let currentOrientation = orientation;

            if (currentOrientation === 'auto') {
                currentOrientation = viewport.width > viewport.height ? 'landscape' : 'portrait';
            }

            if (currentOrientation === 'landscape' && targetWidth < targetHeight) {
                [targetWidth, targetHeight] = [targetHeight, targetWidth];
            } else if (currentOrientation === 'portrait' && targetWidth > targetHeight) {
                [targetWidth, targetHeight] = [targetHeight, targetWidth];
            }

            const tileWidth = tempCanvas.width / cols;
            const tileHeight = tempCanvas.height / rows;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const sx = c * tileWidth - (c > 0 ? overlapInPoints : 0);
                    const sy = r * tileHeight - (r > 0 ? overlapInPoints : 0);
                    const sWidth = tileWidth + (c > 0 ? overlapInPoints : 0) + (c < cols - 1 ? overlapInPoints : 0);
                    const sHeight = tileHeight + (r > 0 ? overlapInPoints : 0) + (r < rows - 1 ? overlapInPoints : 0);

                    const tileCanvas = document.createElement('canvas');
                    tileCanvas.width = sWidth;
                    tileCanvas.height = sHeight;
                    const tileCtx = tileCanvas.getContext('2d');

                    if (tileCtx) {
                        tileCtx.drawImage(tempCanvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

                        const tileImage = await newDoc.embedPng(tileCanvas.toDataURL('image/png'));
                        const newPage = newDoc.addPage([targetWidth, targetHeight]);

                        const scaleX = newPage.getWidth() / sWidth;
                        const scaleY = newPage.getHeight() / sHeight;
                        const scale = scalingMode === 'fit' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);

                        const scaledWidth = sWidth * scale;
                        const scaledHeight = sHeight * scale;

                        newPage.drawImage(tileImage, {
                            x: (newPage.getWidth() - scaledWidth) / 2,
                            y: (newPage.getHeight() - scaledHeight) / 2,
                            width: scaledWidth,
                            height: scaledHeight,
                        });
                    }
                }
            }
        }

        const newPdfBytes = await newDoc.save();
        downloadFile(
            new Blob([new Uint8Array(newPdfBytes)], { type: 'application/pdf' }),
            'posterized.pdf'
        );

        showAlert('Success', 'Your PDF has been posterized.');
    } catch (e) {
        console.error(e);
        showAlert('Error', (e as Error).message || 'Could not posterize the PDF.');
    } finally {
        hideLoader();
    }
}

async function updateUI() {
    const fileDisplayArea = document.getElementById('file-display-area');
    const toolOptions = document.getElementById('tool-options');
    const processBtn = document.getElementById('process-btn') as HTMLButtonElement;

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
        if (processBtn) processBtn.disabled = false;
    } else {
        if (toolOptions) toolOptions.classList.add('hidden');
    }
}

async function handleFileSelect(files: FileList | null) {
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            pageState.file = file;
            pageState.pdfBytes = new Uint8Array(await file.arrayBuffer());
            pageState.pdfJsDoc = await getPDFDocument({ data: pageState.pdfBytes }).promise;
            pageState.pageSnapshots = {};
            pageState.currentPage = 1;

            const totalPagesSpan = document.getElementById('total-pages');
            const totalPreviewPages = document.getElementById('total-preview-pages');

            if (totalPagesSpan && pageState.pdfJsDoc) {
                totalPagesSpan.textContent = pageState.pdfJsDoc.numPages.toString();
            }
            if (totalPreviewPages && pageState.pdfJsDoc) {
                totalPreviewPages.textContent = pageState.pdfJsDoc.numPages.toString();
            }

            await updateUI();
            await renderPosterizePreview(1);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const dropZone = document.getElementById('drop-zone');
    const processBtn = document.getElementById('process-btn') as HTMLButtonElement;
    const backBtn = document.getElementById('back-to-tools');
    const prevBtn = document.getElementById('prev-preview-page');
    const nextBtn = document.getElementById('next-preview-page');
    const rowsInput = document.getElementById('posterize-rows');
    const colsInput = document.getElementById('posterize-cols');
    const pageRangeInput = document.getElementById('page-range');

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

    // Preview navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            if (pageState.currentPage > 1) {
                renderPosterizePreview(pageState.currentPage - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            if (pageState.pdfJsDoc && pageState.currentPage < pageState.pdfJsDoc.numPages) {
                renderPosterizePreview(pageState.currentPage + 1);
            }
        });
    }

    // Grid input changes trigger overlay redraw
    if (rowsInput) {
        rowsInput.addEventListener('input', drawGridOverlay);
    }
    if (colsInput) {
        colsInput.addEventListener('input', drawGridOverlay);
    }
    if (pageRangeInput) {
        pageRangeInput.addEventListener('input', drawGridOverlay);
    }

    // Process button
    if (processBtn) {
        processBtn.addEventListener('click', posterize);
    }
});
