import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, formatBytes, getPDFDocument } from '../utils/helpers.js';
import { createIcons, icons } from 'lucide';
import { PDFDocument as PDFLibDocument, degrees } from 'pdf-lib';
import { renderPagesProgressively, cleanupLazyRendering } from '../utils/render-utils.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface RotateState {
    file: File | null;
    pdfDoc: PDFLibDocument | null;
    pdfJsDoc: pdfjsLib.PDFDocumentProxy | null;
    rotations: number[];
}

const pageState: RotateState = {
    file: null,
    pdfDoc: null,
    pdfJsDoc: null,
    rotations: [],
};

function resetState() {
    cleanupLazyRendering();
    pageState.file = null;
    pageState.pdfDoc = null;
    pageState.pdfJsDoc = null;
    pageState.rotations = [];

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const toolOptions = document.getElementById('tool-options');
    if (toolOptions) toolOptions.classList.add('hidden');

    const pageThumbnails = document.getElementById('page-thumbnails');
    if (pageThumbnails) pageThumbnails.innerHTML = '';

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    const batchAngle = document.getElementById('batch-custom-angle') as HTMLInputElement;
    if (batchAngle) batchAngle.value = '0';
}

function updateAllRotationDisplays() {
    for (let i = 0; i < pageState.rotations.length; i++) {
        const input = document.getElementById(`page-angle-${i}`) as HTMLInputElement;
        if (input) input.value = pageState.rotations[i].toString();
        const container = document.querySelector(`[data-page-index="${i}"]`);
        if (container) {
            const wrapper = container.querySelector('.thumbnail-wrapper') as HTMLElement;
            if (wrapper) wrapper.style.transform = `rotate(${-pageState.rotations[i]}deg)`;
        }
    }
}

function createPageWrapper(canvas: HTMLCanvasElement, pageNumber: number): HTMLElement {
    const pageIndex = pageNumber - 1;

    const container = document.createElement('div');
    container.className = 'page-thumbnail relative bg-gray-700 rounded-lg overflow-hidden';
    container.dataset.pageIndex = pageIndex.toString();
    container.dataset.pageNumber = pageNumber.toString();

    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'thumbnail-wrapper flex items-center justify-center p-2 h-36';
    canvasWrapper.style.transition = 'transform 0.3s ease';
    // Apply initial rotation if it exists (negated for canvas display)
    const initialRotation = pageState.rotations[pageIndex] || 0;
    canvasWrapper.style.transform = `rotate(${-initialRotation}deg)`;

    canvas.className = 'max-w-full max-h-full object-contain';
    canvasWrapper.appendChild(canvas);

    const pageLabel = document.createElement('div');
    pageLabel.className = 'absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded';
    pageLabel.textContent = `${pageNumber}`;

    container.appendChild(canvasWrapper);
    container.appendChild(pageLabel);

    // Per-page rotation controls - Custom angle input
    const controls = document.createElement('div');
    controls.className = 'flex items-center justify-center gap-1 p-2 bg-gray-800';

    const decrementBtn = document.createElement('button');
    decrementBtn.className = 'w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 text-sm';
    decrementBtn.textContent = '-';
    decrementBtn.onclick = function (e) {
        e.stopPropagation();
        const input = document.getElementById(`page-angle-${pageIndex}`) as HTMLInputElement;
        const current = parseInt(input.value) || 0;
        input.value = (current - 1).toString();
    };

    const angleInput = document.createElement('input');
    angleInput.type = 'number';
    angleInput.id = `page-angle-${pageIndex}`;
    angleInput.value = pageState.rotations[pageIndex]?.toString() || '0';
    angleInput.className = 'w-12 h-8 text-center bg-gray-700 border border-gray-600 text-white rounded text-xs';

    const incrementBtn = document.createElement('button');
    incrementBtn.className = 'w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 text-sm';
    incrementBtn.textContent = '+';
    incrementBtn.onclick = function (e) {
        e.stopPropagation();
        const input = document.getElementById(`page-angle-${pageIndex}`) as HTMLInputElement;
        const current = parseInt(input.value) || 0;
        input.value = (current + 1).toString();
    };

    const applyBtn = document.createElement('button');
    applyBtn.className = 'w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600';
    applyBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4"></i>';
    applyBtn.onclick = function (e) {
        e.stopPropagation();
        const input = document.getElementById(`page-angle-${pageIndex}`) as HTMLInputElement;
        const angle = parseInt(input.value) || 0;
        pageState.rotations[pageIndex] = angle;
        const wrapper = container.querySelector('.thumbnail-wrapper') as HTMLElement;
        if (wrapper) wrapper.style.transform = `rotate(${-angle}deg)`;
    };

    controls.append(decrementBtn, angleInput, incrementBtn, applyBtn);
    container.appendChild(controls);

    // Re-create icons for the new element
    setTimeout(function () {
        createIcons({ icons });
    }, 0);

    return container;
}

async function renderThumbnails() {
    const pageThumbnails = document.getElementById('page-thumbnails');
    if (!pageThumbnails || !pageState.pdfJsDoc) return;

    pageThumbnails.innerHTML = '';

    await renderPagesProgressively(
        pageState.pdfJsDoc,
        pageThumbnails,
        createPageWrapper,
        {
            batchSize: 8,
            useLazyLoading: true,
            lazyLoadMargin: '200px',
            eagerLoadBatches: 2,
            onBatchComplete: function () {
                createIcons({ icons });
            }
        }
    );

    createIcons({ icons });
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

            pageState.pdfDoc = await PDFLibDocument.load(arrayBuffer.slice(0), {
                ignoreEncryption: true,
                throwOnInvalidObject: false
            });

            pageState.pdfJsDoc = await getPDFDocument({ data: arrayBuffer.slice(0) }).promise;

            const pageCount = pageState.pdfDoc.getPageCount();
            pageState.rotations = new Array(pageCount).fill(0);

            metaSpan.textContent = `${formatBytes(pageState.file.size)} • ${pageCount} pages`;

            await renderThumbnails();
            hideLoader();

            if (toolOptions) toolOptions.classList.remove('hidden');
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

async function applyRotations() {
    if (!pageState.pdfDoc || !pageState.file) {
        showAlert('Error', 'Please upload a PDF first.');
        return;
    }

    showLoader('Applying rotations...');

    try {
        const pageCount = pageState.pdfDoc.getPageCount();
        const newPdfDoc = await PDFLibDocument.create();

        for (let i = 0; i < pageCount; i++) {
            const rotation = pageState.rotations[i] || 0;
            const originalPage = pageState.pdfDoc.getPage(i);
            const currentRotation = originalPage.getRotation().angle;
            const totalRotation = currentRotation + rotation;

            console.log(`Page ${i}: rotation=${rotation}, currentRotation=${currentRotation}, totalRotation=${totalRotation}, applying=${-totalRotation}`);

            if (totalRotation % 90 === 0) {
                const [copiedPage] = await newPdfDoc.copyPages(pageState.pdfDoc, [i]);
                copiedPage.setRotation(degrees(totalRotation));
                newPdfDoc.addPage(copiedPage);
            } else {
                const embeddedPage = await newPdfDoc.embedPage(originalPage);
                const { width, height } = embeddedPage.scale(1);

                const angleRad = (totalRotation * Math.PI) / 180;
                const absCos = Math.abs(Math.cos(angleRad));
                const absSin = Math.abs(Math.sin(angleRad));

                const newWidth = width * absCos + height * absSin;
                const newHeight = width * absSin + height * absCos;

                const newPage = newPdfDoc.addPage([newWidth, newHeight]);

                const x = newWidth / 2 - (width / 2 * Math.cos(angleRad) - height / 2 * Math.sin(angleRad));
                const y = newHeight / 2 - (width / 2 * Math.sin(angleRad) + height / 2 * Math.cos(angleRad));

                newPage.drawPage(embeddedPage, {
                    x,
                    y,
                    width,
                    height,
                    rotate: degrees(totalRotation),
                });
            }
        }

        const rotatedPdfBytes = await newPdfDoc.save();
        const originalName = pageState.file.name.replace(/\.pdf$/i, '');

        downloadFile(
            new Blob([new Uint8Array(rotatedPdfBytes)], { type: 'application/pdf' }),
            `${originalName}_rotated.pdf`
        );

        showAlert('Success', 'Rotations applied successfully!', 'success', function () {
            resetState();
        });
    } catch (e) {
        console.error(e);
        showAlert('Error', 'Could not apply rotations.');
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
    const processBtn = document.getElementById('process-btn');
    const backBtn = document.getElementById('back-to-tools');
    const batchDecrement = document.getElementById('batch-decrement');
    const batchIncrement = document.getElementById('batch-increment');
    const batchApply = document.getElementById('batch-apply');
    const batchAngleInput = document.getElementById('batch-custom-angle') as HTMLInputElement;

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = import.meta.env.BASE_URL;
        });
    }

    if (batchDecrement && batchAngleInput) {
        batchDecrement.addEventListener('click', function () {
            const current = parseInt(batchAngleInput.value) || 0;
            batchAngleInput.value = (current - 1).toString();
        });
    }

    if (batchIncrement && batchAngleInput) {
        batchIncrement.addEventListener('click', function () {
            const current = parseInt(batchAngleInput.value) || 0;
            batchAngleInput.value = (current + 1).toString();
        });
    }

    if (batchApply && batchAngleInput) {
        batchApply.addEventListener('click', function () {
            const angle = parseInt(batchAngleInput.value) || 0;
            for (let i = 0; i < pageState.rotations.length; i++) {
                pageState.rotations[i] = angle;
            }
            updateAllRotationDisplays();
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
        processBtn.addEventListener('click', applyRotations);
    }
});
