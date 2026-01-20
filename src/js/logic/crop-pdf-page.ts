import { createIcons, icons } from 'lucide';
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile, readFileAsArrayBuffer, formatBytes, getPDFDocument } from '../utils/helpers.js';
import Cropper from 'cropperjs';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { CropperState } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const cropperState: CropperState = {
    pdfDoc: null,
    currentPageNum: 1,
    cropper: null,
    originalPdfBytes: null,
    pageCrops: {},
    file: null,
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

    if (fileInput) fileInput.addEventListener('change', handleFileUpload);

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('bg-gray-700'); });
        dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('bg-gray-700'); });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-700');
            const droppedFiles = e.dataTransfer?.files;
            if (droppedFiles && droppedFiles.length > 0) handleFile(droppedFiles[0]);
        });
        // Clear value on click to allow re-selecting the same file
        fileInput?.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
        });
    }

    document.getElementById('back-to-tools')?.addEventListener('click', () => {
        window.location.href = import.meta.env.BASE_URL;
    });

    document.getElementById('prev-page')?.addEventListener('click', () => changePage(-1));
    document.getElementById('next-page')?.addEventListener('click', () => changePage(1));
    document.getElementById('crop-button')?.addEventListener('click', performCrop);
}

function handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) handleFile(input.files[0]);
}

async function handleFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showAlert('Invalid File', 'Please select a PDF file.');
        return;
    }

    showLoader('Loading PDF...');
    cropperState.file = file;
    cropperState.pageCrops = {};

    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        cropperState.originalPdfBytes = arrayBuffer as ArrayBuffer;
        cropperState.pdfDoc = await getPDFDocument({ data: (arrayBuffer as ArrayBuffer).slice(0) }).promise;
        cropperState.currentPageNum = 1;

        updateFileDisplay();
        await displayPageAsImage(cropperState.currentPageNum);
        hideLoader();
    } catch (error) {
        console.error('Error loading PDF:', error);
        hideLoader();
        showAlert('Error', 'Failed to load PDF file.');
    }
}

function updateFileDisplay() {
    const fileDisplayArea = document.getElementById('file-display-area');
    if (!fileDisplayArea || !cropperState.file) return;

    fileDisplayArea.innerHTML = '';
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex items-center justify-between bg-gray-700 p-3 rounded-lg';

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex flex-col flex-1 min-w-0';

    const nameSpan = document.createElement('div');
    nameSpan.className = 'truncate font-medium text-gray-200 text-sm mb-1';
    nameSpan.textContent = cropperState.file.name;

    const metaSpan = document.createElement('div');
    metaSpan.className = 'text-xs text-gray-400';
    metaSpan.textContent = `${formatBytes(cropperState.file.size)} • ${cropperState.pdfDoc?.numPages || 0} pages`;

    infoContainer.append(nameSpan, metaSpan);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'ml-4 text-red-400 hover:text-red-300 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
    removeBtn.onclick = () => resetState();

    fileDiv.append(infoContainer, removeBtn);
    fileDisplayArea.appendChild(fileDiv);
    createIcons({ icons });
}

function saveCurrentCrop() {
    if (cropperState.cropper) {
        const currentCrop = cropperState.cropper.getData(true);
        const imageData = cropperState.cropper.getImageData();
        const cropPercentages = {
            x: currentCrop.x / imageData.naturalWidth,
            y: currentCrop.y / imageData.naturalHeight,
            width: currentCrop.width / imageData.naturalWidth,
            height: currentCrop.height / imageData.naturalHeight,
        };
        cropperState.pageCrops[cropperState.currentPageNum] = cropPercentages;
    }
}

async function displayPageAsImage(num: number) {
    showLoader(`Rendering Page ${num}...`);

    try {
        const page = await cropperState.pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: 2.5 });

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;

        if (cropperState.cropper) cropperState.cropper.destroy();

        const cropperEditor = document.getElementById('cropper-editor');
        if (cropperEditor) cropperEditor.classList.remove('hidden');

        const container = document.getElementById('cropper-container');
        if (!container) return;

        container.innerHTML = '';
        const image = document.createElement('img');
        image.src = tempCanvas.toDataURL('image/png');
        container.appendChild(image);

        image.onload = () => {
            cropperState.cropper = new Cropper(image, {
                viewMode: 1,
                background: false,
                autoCropArea: 0.8,
                responsive: true,
                rotatable: false,
                zoomable: false,
            });

            const savedCrop = cropperState.pageCrops[num];
            if (savedCrop) {
                const imageData = cropperState.cropper.getImageData();
                cropperState.cropper.setData({
                    x: savedCrop.x * imageData.naturalWidth,
                    y: savedCrop.y * imageData.naturalHeight,
                    width: savedCrop.width * imageData.naturalWidth,
                    height: savedCrop.height * imageData.naturalHeight,
                });
            }

            updatePageInfo();
            enableControls();
            hideLoader();
        };
    } catch (error) {
        console.error('Error rendering page:', error);
        showAlert('Error', 'Failed to render page.');
        hideLoader();
    }
}

async function changePage(offset: number) {
    saveCurrentCrop();
    const newPageNum = cropperState.currentPageNum + offset;
    if (newPageNum > 0 && newPageNum <= cropperState.pdfDoc.numPages) {
        cropperState.currentPageNum = newPageNum;
        await displayPageAsImage(cropperState.currentPageNum);
    }
}

function updatePageInfo() {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) pageInfo.textContent = `Page ${cropperState.currentPageNum} of ${cropperState.pdfDoc.numPages}`;
}

function enableControls() {
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
    const cropBtn = document.getElementById('crop-button') as HTMLButtonElement;

    if (prevBtn) prevBtn.disabled = cropperState.currentPageNum <= 1;
    if (nextBtn) nextBtn.disabled = cropperState.currentPageNum >= cropperState.pdfDoc.numPages;
    if (cropBtn) cropBtn.disabled = false;
}

async function performCrop() {
    saveCurrentCrop();

    const isDestructive = (document.getElementById('destructive-crop-toggle') as HTMLInputElement)?.checked;
    const isApplyToAll = (document.getElementById('apply-to-all-toggle') as HTMLInputElement)?.checked;

    let finalCropData: Record<number, any> = {};

    if (isApplyToAll) {
        const currentCrop = cropperState.pageCrops[cropperState.currentPageNum];
        if (!currentCrop) {
            showAlert('No Crop Area', 'Please select an area to crop first.');
            return;
        }
        for (let i = 1; i <= cropperState.pdfDoc.numPages; i++) {
            finalCropData[i] = currentCrop;
        }
    } else {
        finalCropData = { ...cropperState.pageCrops };
    }

    if (Object.keys(finalCropData).length === 0) {
        showAlert('No Crop Area', 'Please select an area on at least one page to crop.');
        return;
    }

    showLoader('Applying crop...');

    try {
        let finalPdfBytes;
        if (isDestructive) {
            finalPdfBytes = await performFlatteningCrop(finalCropData);
        } else {
            finalPdfBytes = await performMetadataCrop(finalCropData);
        }

        const fileName = isDestructive ? 'flattened_crop.pdf' : 'standard_crop.pdf';
        downloadFile(new Blob([finalPdfBytes], { type: 'application/pdf' }), fileName);
        showAlert('Success', 'Crop complete! Your download has started.', 'success', () => resetState());
    } catch (e) {
        console.error(e);
        showAlert('Error', 'An error occurred during cropping.');
    } finally {
        hideLoader();
    }
}

async function performMetadataCrop(cropData: Record<number, any>): Promise<Uint8Array> {
    const pdfToModify = await PDFLibDocument.load(cropperState.originalPdfBytes!, { ignoreEncryption: true, throwOnInvalidObject: false });

    for (const pageNum in cropData) {
        const pdfJsPage = await cropperState.pdfDoc.getPage(Number(pageNum));
        const viewport = pdfJsPage.getViewport({ scale: 1 });
        const crop = cropData[pageNum];

        const cropX = viewport.width * crop.x;
        const cropY = viewport.height * crop.y;
        const cropW = viewport.width * crop.width;
        const cropH = viewport.height * crop.height;

        const visualCorners = [
            { x: cropX, y: cropY },
            { x: cropX + cropW, y: cropY },
            { x: cropX + cropW, y: cropY + cropH },
            { x: cropX, y: cropY + cropH },
        ];

        const pdfCorners = visualCorners.map(p => viewport.convertToPdfPoint(p.x, p.y));
        const pdfXs = pdfCorners.map(p => p[0]);
        const pdfYs = pdfCorners.map(p => p[1]);

        const minX = Math.min(...pdfXs);
        const maxX = Math.max(...pdfXs);
        const minY = Math.min(...pdfYs);
        const maxY = Math.max(...pdfYs);

        const page = pdfToModify.getPages()[Number(pageNum) - 1];
        page.setCropBox(minX, minY, maxX - minX, maxY - minY);
    }

    return pdfToModify.save();
}

async function performFlatteningCrop(cropData: Record<number, any>): Promise<Uint8Array> {
    const newPdfDoc = await PDFLibDocument.create();
    const sourcePdfDocForCopying = await PDFLibDocument.load(cropperState.originalPdfBytes!, { ignoreEncryption: true, throwOnInvalidObject: false });
    const totalPages = cropperState.pdfDoc.numPages;

    for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        showLoader(`Processing page ${pageNum} of ${totalPages}...`);

        if (cropData[pageNum]) {
            const page = await cropperState.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.5 });

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            await page.render({ canvasContext: tempCtx, viewport: viewport }).promise;

            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            const crop = cropData[pageNum];
            const finalWidth = tempCanvas.width * crop.width;
            const finalHeight = tempCanvas.height * crop.height;
            finalCanvas.width = finalWidth;
            finalCanvas.height = finalHeight;

            finalCtx?.drawImage(
                tempCanvas,
                tempCanvas.width * crop.x,
                tempCanvas.height * crop.y,
                finalWidth,
                finalHeight,
                0, 0, finalWidth, finalHeight
            );

            const pngBytes = await new Promise<ArrayBuffer>((res) =>
                finalCanvas.toBlob((blob) => blob?.arrayBuffer().then(res), 'image/jpeg', 0.9)
            );
            const embeddedImage = await newPdfDoc.embedPng(pngBytes);
            const newPage = newPdfDoc.addPage([finalWidth, finalHeight]);
            newPage.drawImage(embeddedImage, { x: 0, y: 0, width: finalWidth, height: finalHeight });
        } else {
            const [copiedPage] = await newPdfDoc.copyPages(sourcePdfDocForCopying, [i]);
            newPdfDoc.addPage(copiedPage);
        }
    }

    return newPdfDoc.save();
}

function resetState() {
    if (cropperState.cropper) {
        cropperState.cropper.destroy();
        cropperState.cropper = null;
    }

    cropperState.pdfDoc = null;
    cropperState.originalPdfBytes = null;
    cropperState.pageCrops = {};
    cropperState.currentPageNum = 1;
    cropperState.file = null;

    const cropperEditor = document.getElementById('cropper-editor');
    if (cropperEditor) cropperEditor.classList.add('hidden');

    const container = document.getElementById('cropper-container');
    if (container) container.innerHTML = '';

    const fileDisplayArea = document.getElementById('file-display-area');
    if (fileDisplayArea) fileDisplayArea.innerHTML = '';

    const cropBtn = document.getElementById('crop-button') as HTMLButtonElement;
    if (cropBtn) cropBtn.disabled = true;
}
